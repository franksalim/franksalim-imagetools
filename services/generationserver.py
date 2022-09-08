#!/usr/bin/env python3
from flask import Flask, send_file, request, redirect
from io import BytesIO
import gc
import torch
import numpy as np
from PIL import Image
from tqdm import tqdm, trange
from itertools import islice
from transformers import AutoFeatureExtractor
from diffusers import StableDiffusionPipeline
from torch import autocast
# 1. dependencies
# pip install git+https://github.com/huggingface/diffusers.git@main
# pip install transformers ftfy

# 2. download model
# if you have a huggingface account:
# git clone https://huggingface.co/CompVis/stable-diffusion-v1-4
# otherwise:
# wget https://archive.org/download/stable-diffusion-v1-4.tar/stable-diffusion-v1-4.tar.gz
# tar -zxf ./stable-diffusion-v1-4.tar.gz

# 3. run server
# cd services
# ./generationserver.py

device = "cuda"
sd_pipeline = None


def torch_gc():
    gc.collect()
    # try to get my vram back :/
    torch.cuda.empty_cache()
    torch.cuda.ipc_collect()
    gc.collect()


def generate_bytes(args):
    print(args)
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
        print("loading model...")

        class DummySafetyChecker():
            def __init__(self, *args, **kwargs):
                # required monkeypatching to prevent an error splitting the module name to check type
                self.__module__ = "foo.bar.foo.bar"

            def __call__(self, images, **kwargs):
                return (images, False)

        # fp16 is half precision
        pipe = StableDiffusionPipeline.from_pretrained(
            "../stable-diffusion-v1-4", local_files_only=True, use_auth_token=False,  revision="fp16",
            torch_dtype=torch.float16, safety_checker=DummySafetyChecker())

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
        image = sd_pipeline(prompt=optprompt, width=optwidth, height=optheight,
                            guidance_scale=optscale, num_inference_steps=optsteps, latents=latents).images[0]

        bio = BytesIO()
        image.save(bio, format="png")
        bio.seek(0)

        torch_gc()

        return send_file(bio, as_attachment=False, mimetype="image/png")


app = Flask(__name__,
            static_url_path='',
            static_folder='../www')


@ app.route('/')
def index():
    return redirect("/index.html", code=302)


@ app.route("/generate/", methods=['POST'])
def generate():
    args = request.get_json()
    return generate_bytes(args)


if __name__ == '__main__':
    app.run(debug=True)
