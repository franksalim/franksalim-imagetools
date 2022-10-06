from diffusersextras import DummySafetyChecker, torch_gc, device

from flask import send_file
import json

import gc
import torch
import numpy as np
from PIL import Image
from io import BytesIO

from transformers import AutoFeatureExtractor
from diffusers import StableDiffusionInpaintPipeline
from torch import autocast

from img2img import img_pipeline

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

    # check if image is multiple of 64 in both dimensions, otherwise resize
    if init_image.size[0] % 64 != 0 or init_image.size[1] % 64 != 0:
        # resize to nearest multiple of 64
        init_image = init_image.resize(
            (init_image.size[0] // 64 * 64, init_image.size[1] // 64 * 64))
            
    # check if mask is multiple of 64 in both dimensions, otherwise resize
    if mask_image.size[0] % 64 != 0 or mask_image.size[1] % 64 != 0:
        # resize to nearest multiple of 64
        mask_image = mask_image.resize(
            (mask_image.size[0] // 64 * 64, mask_image.size[1] // 64 * 64))

    # load model if not loaded
    if img_pipeline is None:
        print("loading inpainting model...")

        # fp16 is half precision
        pipe = StableDiffusionInpaintPipeline.from_pretrained(
            "../stable-diffusion-v1-4",
            local_files_only=True,
            use_auth_token=False,
            revision="fp16",
            torch_dtype=torch.float16,
            safety_checker=DummySafetyChecker())

        pipe = pipe.to(device)

        pipe.enable_attention_slicing()
        img_pipeline = pipe

    generator = torch.Generator(device=device).manual_seed(optseed)

    with autocast(device):
      image = img_pipeline(prompt=optprompt,
                           guidance_scale=optscale,
                           strength=optstrength,
                           generator=generator,
                           num_inference_steps=optsteps,
                           init_image=init_image,
                           mask_image=mask_image).images[0]

      bio = BytesIO()
      image.save(bio, format="png")
      bio.seek(0)

      torch_gc()

      return send_file(bio, as_attachment=False, mimetype="image/png")
