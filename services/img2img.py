from diffusersextras import DummySafetyChecker, torch_gc, device

from flask import send_file
import json

import gc
import torch
import numpy as np
from PIL import Image
from io import BytesIO

from transformers import AutoFeatureExtractor
from diffusers import StableDiffusionPipeline, StableDiffusionImg2ImgPipeline
from torch import autocast


img_pipeline = None

def generate_img2img(image, args):
    print(json.dumps(args))
    torch_gc()
    global img_pipeline

    optprompt = args["prompt"]
    optscale = float(args["scale"])
    optsteps = int(args["steps"])
    optstrength = float(args["strength"])

    init_image = Image.open(BytesIO(image.stream.read())).convert("RGB")

    # check if image is multiple of 64 in both dimensions, otherwise resize
    if init_image.size[0] % 64 != 0 or init_image.size[1] % 64 != 0:
        # resize to nearest multiple of 64
        init_image = init_image.resize(
            (init_image.size[0] // 64 * 64, init_image.size[1] // 64 * 64))

    # load model if not loaded
    if img_pipeline is None:
        print("loading img2img model...")

        # fp16 is half precision
        pipe = StableDiffusionImg2ImgPipeline.from_pretrained(
            "../stable-diffusion-v1-4",
            local_files_only=True,
            use_auth_token=False,
            revision="fp16",
            torch_dtype=torch.float16,
            safety_checker=DummySafetyChecker())

        pipe = pipe.to(device)

        pipe.enable_attention_slicing()
        img_pipeline = pipe

    generator = torch.Generator(device=device)

    with autocast("cuda"):
        image = img_pipeline(prompt=optprompt,
                             guidance_scale=optscale,
                             strength=optstrength,
                             num_inference_steps=optsteps,
                             init_image=init_image).images[0]

        bio = BytesIO()
        image.save(bio, format="png")
        bio.seek(0)

        torch_gc()

        return send_file(bio, as_attachment=False, mimetype="image/png")
