from diffusersextras import DummySafetyChecker, torch_gc, device

from flask import send_file
import json

import torch
import numpy as np
from PIL import Image
from PIL.PngImagePlugin import PngInfo
from io import BytesIO

from diffusers import StableDiffusionInpaintPipeline

MODEL = "stable-diffusion-inpainting"

img_pipeline = None


def generate_inpaint(image, mask, args, verbose=False):
    torch_gc()
    global img_pipeline
    if verbose:
        print(json.dumps(args))

    optprompt = args["prompt"]
    optseed = int(args["seed"])
    optscale = float(args["scale"])
    optsteps = int(args["steps"])
    optstrength = float(args["strength"])

    init_image = Image.open(BytesIO(image.stream.read())).convert("RGB")
    mask_image = Image.open(BytesIO(mask.stream.read())).convert("RGB")

    # load model if not loaded
    if img_pipeline is None:
        print("loading inpainting model...")

        # fp16 is half precision
        pipe = StableDiffusionInpaintPipeline.from_pretrained(
            "../" + MODEL,
            local_files_only=True,
            use_auth_token=False,
            revision="fp16",
            torch_dtype=torch.float16,
            safety_checker=DummySafetyChecker())

        pipe = pipe.to(device)

        pipe.enable_attention_slicing()
        img_pipeline = pipe

    generator = torch.Generator(device=device).manual_seed(optseed)

    image = img_pipeline(prompt=optprompt,
                         guidance_scale=optscale,
                         strength=optstrength,
                         generator=generator,
                         num_inference_steps=optsteps,
                         image=init_image,
                         mask_image=mask_image).images[0]

    metadata = PngInfo()
    metadata.add_text("StableDiffusionParams", json.dumps(args))
    metadata.add_text("StableDiffusionModel", MODEL)

    bio = BytesIO()
    image.save(bio, format="png", pnginfo=metadata)
    bio.seek(0)

    torch_gc()

    return send_file(bio, as_attachment=False, mimetype="image/png")
