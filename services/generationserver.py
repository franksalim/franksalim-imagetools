#!/usr/bin/env python3

"""
1. dependencies
pip install git+https://github.com/huggingface/diffusers.git@main
pip install transformers ftfy

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
import json

from txt2img import generate_txt2img
from img2img import generate_img2img

app = Flask(__name__,
            static_url_path='',
            static_folder='../www')


@app.route('/')
def index():
    return redirect("/index.html", code=302)


@app.route("/generate/", methods=['POST'])
def generate():
    args = request.get_json()
    return generate_txt2img(args)


@app.route("/img2img/", methods=['POST'])
def img2img():
    args = json.loads(request.form["params"])
    image = request.files["initImage"]
    return generate_img2img(image, args)


if __name__ == '__main__':
    app.run(debug=True)
