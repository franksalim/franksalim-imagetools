from diffusersextras import device

from flask import send_file
import json

import torch
import numpy as np
from PIL import Image
from PIL.PngImagePlugin import PngInfo
from io import BytesIO

from diffusers import StableDiffusionXLPipeline, DiffusionPipeline


MODEL = "../models/stable-diffusion-xl-base-1.0"
MODEL_REFINER = "../models/stable-diffusion-xl-refiner-1.0"

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
refiner = None


def generate_txt2img(args, verbose=False):
    if verbose:
        print(json.dumps(args))
    global sd_pipeline
    global refiner
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
    optnegprompt = args["negprompt"]
    optseed = int(args["seed"])
    optscale = float(args["scale"])
    optsteps = int(args["steps"])
    optheight = int(args["height"])
    optwidth = int(args["width"])

    # load model if not loaded
    if sd_pipeline is None:
        print("loading txt2img model...")

        pipe = StableDiffusionXLPipeline.from_pretrained(
            MODEL,
            local_files_only=True,
            use_auth_token=False,
            torch_dtype=torch.float16,
            variant="fp16",
            use_safetensors=True)

        pipe = pipe.to(device)

        pipe.enable_xformers_memory_efficient_attention()
        torch.compile(pipe.unet, mode="reduce-overhead", fullgraph=True)
        sd_pipeline = pipe

        pipe = DiffusionPipeline.from_pretrained(
            MODEL_REFINER,
            text_encoder_2=sd_pipeline.text_encoder_2,
            vae=sd_pipeline.vae,
            local_files_only=True,
            use_auth_token=False,
            torch_dtype=torch.float16,
            variant="fp16",
            use_safetensors=True)

        pipe = pipe.to(device)

        pipe.enable_xformers_memory_efficient_attention()
        torch.compile(pipe.unet, mode="reduce-overhead", fullgraph=True)
        refiner = pipe

    generator = torch.Generator(device=device).manual_seed(optseed)

    latents = sd_pipeline(prompt=optprompt,
                        negative_prompt=optnegprompt,
                        width=optwidth,
                        height=optheight,
                        guidance_scale=optscale,
                        num_inference_steps=optsteps,
                        denoising_end = 0.8,
                        generator=generator,
                        output_type="latent").images[0]

    image = refiner(prompt=optprompt,
                        negative_prompt=optnegprompt,
                        guidance_scale=optscale,
                        num_inference_steps=optsteps,
                        denoising_start = 0.8,
                        image=latents,
                        generator=generator).images[0]

    metadata = PngInfo()
    metadata.add_text("StableDiffusionParams", json.dumps(args))
    metadata.add_text("StableDiffusionModel", MODEL)

    bio = BytesIO()
    image.save(bio, format="png", pnginfo=metadata)
    bio.seek(0)

    return send_file(bio, as_attachment=False, mimetype="image/png")
