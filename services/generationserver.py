#!/usr/bin/env python3

"""
1. dependencies
pip install diffusers transformers ftfy

2. download model
if you have a huggingface account:
git clone https://huggingface.co/CompVis/stable-diffusion-v1-4
otherwise:
wget https://archive.org/download/stable-diffusion-v1-4.tar/stable-diffusion-v1-4.tar.gz
tar -zxf ./stable-diffusion-v1-4.tar.gz

3. run server
cd services
./generationserver.py
"""

from flask import Flask, send_file, request, redirect
from flask_sock import Sock
import json
import threading
import sys

from txt2img import generate_txt2img
from img2img import generate_img2img
from inpainting import generate_inpaint

verbose = False

app = Flask(__name__,
            static_url_path='',
            static_folder='../www')
sock = Sock(app)

# Working with images will eat all the VRAM, so you've got to
# hold this lock in order to do that ok.
work_lock = threading.Lock()


@app.route('/')
def index():
    return redirect("/index.html", code=302)


@sock.route("/generate/")
def generate(ws):
    with work_lock:
        args = json.loads(ws.receive())
        generate_txt2img(ws, args, verbose=verbose)


@app.route("/img2img/", methods=['POST'])
def img2img():
    with work_lock:
        args = json.loads(request.form["params"])
        image = request.files["initImage"]
        return generate_img2img(image, args, verbose=verbose)

@app.route("/inpaint/", methods=['POST'])
def inpaint():
    with work_lock:
        args = json.loads(request.form["params"])
        image = request.files["initImage"]
        mask = request.files["maskImage"]
        return generate_inpaint(image, mask, args, verbose=verbose)

if __name__ == '__main__':
    if "--verbose" in sys.argv or "-v" in sys.argv:
        verbose = True
    app.run(host='0.0.0.0', debug=True)
