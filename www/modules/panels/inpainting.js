import {ImagePicker} from "/modules/widgets/imagepicker.js";
import {Slider} from "/modules/widgets/slider.js";
import {DrawingCanvas} from "/modules/widgets/drawingcanvas.js";
import {StableDiffusion} from "/modules/api/stablediffusion.js";

export class Inpainting extends HTMLElement {
  static ids = ["steps", "scale", "prompt", "seed"];

  constructor() {
    super();
    let shadow = this.attachShadow({mode: 'open'});
    shadow.innerHTML = `
      <link rel=stylesheet href=/css/panel.css>
      <style>
        fs-drawingcanvas {
          opacity: .75;
          z-index:100;
          position: absolute;
        }
      </style>
      <div>
        <fs-imagepicker id=imagepicker></fs-imagepicker>
        <fs-drawingcanvas width=0 height=0></fs-drawingcanvas>
      </div>
      <fs-promptbuilder id=prompt></fs-promptbuilder>

      <h2>Brush Size</h2>
      <fs-slider step=1 min=1 max=100 value=50 id=brushSize></fs-slider>

      <h2>Seed</h2>
      <input type=number value=1337 id=seed>
      <h2>Scale</h2>
      <fs-slider step=0.5 min=-30 max=30 value=7.5 id=scale></fs-slider>
      <h2>Steps</h2>
      <fs-slider step=1 min=1 max=100 value=30 id=steps></fs-slider>

      <div class=buttonbar>
        <button id=generateButton>Generate</button>
      </div>
    `;

    shadow.getElementById("generateButton")
      .addEventListener("click", async e => {
        Inpainting.setStatus("Inpainting");
        try {
          await this.generate();
          Inpainting.setStatus("");
        } catch (e) {
          console.error(e);
          Inpainting.setStatus(String(e));
        }
      });

    let canvas = shadow.querySelector("fs-drawingcanvas");
    let imagePicker = shadow.getElementById("imagepicker");
    imagePicker.addEventListener("input", e => {
      let image = new Image();
      image.src = imagePicker.getImageSrc();
      image.onload = e => {
        canvas.setupCanvas(image.width, image.height);
        canvas.style.top = imagePicker.getBoundingClientRect().top + "px";
        canvas.style.left = imagePicker.getBoundingClientRect().left + "px";
        canvas.brushSize = 50;
      }
    });

    let brushSizeSlider = shadow.getElementById("brushSize");
    brushSizeSlider.addEventListener("input", e => {
      canvas.brushSize = brushSizeSlider.value;
    });

    this.shadow = shadow;
  }

  async generate() {
    // grab parameters
    let params = {};
    for (let id of Inpainting.ids) {
      params[id] = this.shadow.getElementById(id).value
    }

    let inputUri = this.shadow.getElementById("imagepicker").getImageSrc();
    if (!inputUri) {
      return;
    }
    let blob = await fetch(inputUri).then(r => r.blob());
    let maskBlob = await this.shadow.querySelector("fs-drawingcanvas").getBlob();
    let uri = await StableDiffusion.inpaint(blob, maskBlob, params);
    document.getElementById("historyList").addImage(uri, params);
  }

  setArgs(params) {
    for (let id of Inpainting.ids) {
      this.shadow.getElementById(id).setAttribute("value", params[id]);
      // hack: input type number will take string props but not attrs?
      this.shadow.getElementById(id).value = params[id];
    }
  }

  setInputSrc(src) {
    this.shadow.getElementById("imagepicker").setInputSrc(src);
  }

  setInputImage(file) {
    this.shadow.getElementById("imagepicker").setImageFile(file);
  }

  static setStatus(s) {
    document.getElementById("appbar").setStatus(s);
  }
}

window.customElements.define('fs-inpainting', Inpainting);
