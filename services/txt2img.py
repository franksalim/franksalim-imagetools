from diffusersextras import DummySafetyChecker, torch_gc, device
from decoder import ApproximateDecoder

from flask import send_file
import json

import torch
import numpy as np
from PIL import Image
from io import BytesIO

from transformers import AutoFeatureExtractor
from diffusers import StableDiffusionPipeline, StableDiffusionImg2ImgPipeline
from torch import autocast


def force_tiled():
    global unforce_tiled
    cls = torch.nn.Conv2d
    init = cls.__init__

    def __init__(self, *args, **kwargs):
        patch = {"padding_mode": "circular"}
        return init(self, *args, **kwargs, **patch)
    cls.__init__ = __init__

    def unp():
        global unforce_tiled
        cls.__init__ = init
        def unforce_tiled(): return None
    unforce_tiled = unp


currently_tiled = False
def unforce_tiled(): return None


sd_pipeline = None


def generate_txt2img(ws, args, verbose=False):
    if verbose:
        print(json.dumps(args))
    global sd_pipeline
    global currently_tiled
    should_tile = args.get("tiled", False) == True

    # we patch torch internals to force tiled convolutions so we need
    # to reload the model if we change this setting
    if should_tile == True and currently_tiled == False:
        currently_tiled = True
        force_tiled()
        sd_pipeline = None
    if should_tile == False and currently_tiled == True:
        currently_tiled = False
        unforce_tiled()
        sd_pipeline = None

    optprompt = args["prompt"]
    optseed = int(args["seed"])
    optscale = float(args["scale"])
    optsteps = int(args["steps"])
    optheight = int(args["height"])
    optwidth = int(args["width"])

    # load model if not loaded
    torch_gc()
    if sd_pipeline is None:
        print("loading txt2img model...")

        # fp16 is half precision
        pipe = StableDiffusionPipeline.from_pretrained(
            "../stable-diffusion-v1-4",
            local_files_only=True,
            use_auth_token=False,
            revision="fp16",
            torch_dtype=torch.float16,
            safety_checker=DummySafetyChecker())

        pipe.set_progress_bar_config(disable=True)
        pipe = pipe.to(device)
        pipe.enable_attention_slicing()
        sd_pipeline = pipe

    generator = torch.Generator(device=device)
    generator = generator.manual_seed(optseed)

    decoder = ApproximateDecoder.for_pipeline(sd_pipeline)

    def callback(step, timestep, latents):
      bio = BytesIO()
      img = decoder(latents[0])
      img.save(bio, format="png")
      bio.seek(0)
      ws.send(bio.read())

    with autocast("cuda"):
        img = sd_pipeline(prompt=optprompt,
                            width=optwidth,
                            height=optheight,
                            guidance_scale=optscale,
                            num_inference_steps=optsteps,
                            generator=generator,
                            callback_steps=3,
                            callback=callback).images[0]

        bio = BytesIO()
        img.save(bio, format="png")

        bio.seek(0)
        ws.send(bio.read())
        ws.close()

        torch_gc()

