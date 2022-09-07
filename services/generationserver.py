# flask --app generationserver.py --debug run

import os
SD_REPO_PATH = os.path.expanduser("~/repos/stable-diffusion/")

from flask import Flask, send_file, request, redirect
from io import BytesIO

import gc
import argparse, os, sys, glob
import cv2
import torch
import numpy as np
from omegaconf import OmegaConf
from PIL import Image
from tqdm import tqdm, trange
from itertools import islice
from einops import rearrange
from torchvision.utils import make_grid
import time
from pytorch_lightning import seed_everything
from torch import autocast
from contextlib import contextmanager, nullcontext

import sys
sys.path.append(SD_REPO_PATH)
from ldm.util import instantiate_from_config
from ldm.models.diffusion.ddim import DDIMSampler
from ldm.models.diffusion.plms import PLMSSampler

from transformers import AutoFeatureExtractor


def torch_gc():
    gc.collect()
    # try to get my vram back :/
    torch.cuda.empty_cache()
    torch.cuda.ipc_collect()
    gc.collect()

def chunk(it, size):
    it = iter(it)
    return iter(lambda: tuple(islice(it, size)), ())


def numpy_to_pil(images):
    """
    Convert a numpy image or a batch of images to a PIL image.
    """
    if images.ndim == 3:
        images = images[None, ...]
    images = (images * 255).round().astype("uint8")
    pil_images = [Image.fromarray(image) for image in images]

    return pil_images


def load_model_from_config(config, ckpt, verbose=False):
    print(f"Loading model from {ckpt}")
    pl_sd = torch.load(ckpt, map_location="cpu")
    if "global_step" in pl_sd:
        print(f"Global Step: {pl_sd['global_step']}")
    sd = pl_sd["state_dict"]
    model = instantiate_from_config(config.model)
    m, u = model.load_state_dict(sd, strict=False)
    if len(m) > 0 and verbose:
        print("missing keys:")
        print(m)
    if len(u) > 0 and verbose:
        print("unexpected keys:")
        print(u)

    model.cuda()
    model.eval()
    return model.half()

def generate_bytes(args):
    print(args)
    torch_gc()

    optprompt = args["prompt"]
    optseed = int(args["seed"])
    optscale = float(args["scale"])
    optsteps = int(args["steps"])
    optconfig = SD_REPO_PATH + "/configs/stable-diffusion/v1-inference.yaml"
    optckpt = SD_REPO_PATH + "/sd-v1-4.ckpt"
    optheight = int(args["height"])
    optwidth = int(args["width"])

    seed_everything(optseed)

    config = OmegaConf.load(f"{optconfig}")
    model = load_model_from_config(config, f"{optckpt}")

    device = torch.device("cuda")
    model = model.to(device)

    sampler = DDIMSampler(model)

    batch_size = 1
    n_rows = 1
    prompt = optprompt
    assert prompt is not None
    data = [batch_size * [prompt]] # a list of the same string for inputs

    start_code = None

    precision_scope = autocast
    with torch.no_grad():
        with precision_scope("cuda"):
            with model.ema_scope():
                tic = time.time()
                all_samples = list()
                for prompts in tqdm(data, desc="data"):
                  uc = None
                  if optscale != 1.0:
                      uc = model.get_learned_conditioning(batch_size * [""])
                  if isinstance(prompts, tuple):
                      prompts = list(prompts)
                  c = model.get_learned_conditioning(prompts)
                  shape = [4, optheight // 8, optwidth // 8]
                  samples_ddim, _ = sampler.sample(S=optsteps,
                                                   conditioning=c,
                                                   batch_size=1,
                                                   shape=shape,
                                                   verbose=False,
                                                   unconditional_guidance_scale=optscale,
                                                   unconditional_conditioning=uc,
                                                   eta=0.0,
                                                   x_T=start_code)

                  x_samples_ddim = model.decode_first_stage(samples_ddim)
                  x_samples_ddim = torch.clamp((x_samples_ddim + 1.0) / 2.0, min=0.0, max=1.0)
                  x_samples_ddim = x_samples_ddim.cpu().permute(0, 2, 3, 1).numpy()

                  x_checked_image = x_samples_ddim

                  x_checked_image_torch = torch.from_numpy(x_checked_image).permute(0, 3, 1, 2)

                  for x_sample in x_checked_image_torch:
                      x_sample = 255. * rearrange(x_sample.cpu().numpy(), 'c h w -> h w c')
                      img = Image.fromarray(x_sample.astype(np.uint8))
                      bio = BytesIO()
                      img.save(bio, format="png")
                      bio.seek(0)

                      del model
                      del device
                      torch_gc()

                      return send_file(
                          bio,
                          as_attachment=False,
                          mimetype='image/png'
                      )

app = Flask(__name__,
  static_url_path='', 
  static_folder='../www')

@app.route('/')
def index():
    return redirect("/index.html", code=302)

@app.route("/generate/", methods = ['POST'])
def generate():
    args = request.get_json()
    return generate_bytes(args)

