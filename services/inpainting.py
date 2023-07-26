from diffusersextras import device

from flask import send_file
import json

import torch
import numpy as np
from PIL import Image
from PIL.PngImagePlugin import PngInfo
from io import BytesIO

from diffusers import StableDiffusionXLInpaintPipeline

MODEL = "../models/stable-diffusion-xl-base-1.0"

img_pipeline = None


def generate_inpaint(image, mask, args, verbose=False):
    global img_pipeline
    if verbose:
        print(json.dumps(args))

    optprompt = args["prompt"]
    optseed = int(args["seed"])
    optscale = float(args["scale"])
    optsteps = int(args["steps"])

    init_image = Image.open(BytesIO(image.stream.read())).convert("RGB")
    mask_image = Image.open(BytesIO(mask.stream.read())).convert("RGB")

    # load model if not loaded
    if img_pipeline is None:
        print("loading inpainting model...")

        # fp16 is half precision
        pipe = StableDiffusionXLInpaintPipeline.from_pretrained(
            MODEL,
            local_files_only=True,
            use_auth_token=False,
            torch_dtype=torch.float16,
            variant="fp16",
            use_safetensors=True)

        pipe = pipe.to(device)

        pipe.enable_xformers_memory_efficient_attention()
        torch.compile(pipe.unet, mode="reduce-overhead", fullgraph=True)
        img_pipeline = pipe

    generator = torch.Generator(device=device).manual_seed(optseed)

    image = img_pipeline(prompt=optprompt,
                         guidance_scale=optscale,
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

    return send_file(bio, as_attachment=False, mimetype="image/png")
