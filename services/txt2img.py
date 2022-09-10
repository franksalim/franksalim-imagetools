from diffusersextras import DummySafetyChecker, torch_gc, device

from flask import send_file
import json

import torch
import numpy as np
from PIL import Image
from io import BytesIO

from transformers import AutoFeatureExtractor
from diffusers import StableDiffusionPipeline, StableDiffusionImg2ImgPipeline
from torch import autocast


sd_pipeline = None

def generate_txt2img(args):
    print(json.dumps(args))
    torch_gc()
    global sd_pipeline

    optprompt = args["prompt"]
    optseed = int(args["seed"])
    optscale = float(args["scale"])
    optsteps = int(args["steps"])
    optheight = int(args["height"])
    optwidth = int(args["width"])

    # load model if not loaded
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

        pipe = pipe.to(device)

        pipe.enable_attention_slicing()
        sd_pipeline = pipe

    generator = torch.Generator(device=device)
    generator = generator.manual_seed(optseed)
    latents = torch.randn(
        (1, sd_pipeline.unet.in_channels, optheight // 8, optwidth // 8),
        generator=generator,
        device=device
    )

    with autocast("cuda"):
        image = sd_pipeline(prompt=optprompt,
                            width=optwidth,
                            height=optheight,
                            guidance_scale=optscale,
                            num_inference_steps=optsteps,
                            latents=latents).images[0]

        bio = BytesIO()
        image.save(bio, format="png")
        bio.seek(0)

        torch_gc()

        return send_file(bio, as_attachment=False, mimetype="image/png")
