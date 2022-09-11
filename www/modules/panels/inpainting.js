import {ImagePicker} from "/modules/widgets/imagepicker.js";
import {Slider} from "/modules/widgets/slider.js";
import {StableDiffusion} from "/modules/api/stablediffusion.js";

export class Inpainting extends HTMLElement {
  static ids = ["steps", "scale", "prompt", "strength"];

  constructor() {
    super();
    let shadow = this.attachShadow({mode: 'open'});
    shadow.innerHTML = html`
      <link rel=stylesheet href=/css/panel.css>
      <style>
        canvas {
          opacity: .5;
          z-index:100;
          position: absolute;
        }
      </style>
      <div>
        <fs-imagepicker id=imagepicker></fs-imagepicker>
        <canvas width=0 height=0></canvas>
      </div>
      <fs-promptbuilder id=prompt></fs-promptbuilder>

      <h2>Brush Size</h2>
      <fs-slider step=1 min=1 max=100 value=10 id=brushSize></fs-slider>

      <h2>Scale</h2>
      <fs-slider step=0.5 min=-30 max=30 value=7.5 id=scale></fs-slider>

      <h2>Steps</h2>
      <fs-slider step=1 min=1 max=100 value=30 id=steps></fs-slider>

      <h2>Strength</h2>
      <fs-slider step=0.01 min=0.0 max=1.0 value=0.95 id=strength></fs-slider>

      <div class=buttonbar>
        <button id=generateButton>Generate</button>
      </div>
    `;

    shadow.getElementById("generateButton")
      .addEventListener("click", e => { this.generate() });

    let imagePicker = shadow.getElementById("imagepicker");
    imagePicker.addEventListener("input", e => {
      let image = new Image();
      image.src = imagePicker.getImageSrc();
      image.onload = e => {
        this.setupCanvas(image.width, image.height);
      }
    });

    this.shadow = shadow;
  }

  setupCanvas(w, h) {
    const imagePicker = this.shadow.getElementById("imagepicker");
    const canvas = this.shadow.querySelector("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = w;
    canvas.height = h;
    canvas.style.top = imagePicker.getBoundingClientRect().top + "px";
    canvas.style.left = imagePicker.getBoundingClientRect().left + "px";

    let fromEvent = function(e) {
      const x = e.x - e.target.getBoundingClientRect().left;
      const y = e.y - e.target.getBoundingClientRect().top;
      return {x: x, y: y};
    }

    let drawPath = function(start, end) {
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.closePath();
      ctx.stroke();
    }

    let drawing = false;
    let start = {x: 0, y: 0};

    canvas.addEventListener("mouseout", e => { drawing = false; });
    canvas.addEventListener("mouseup", e => {
      drawing = false;
      if (drawing) {
        let end = fromEvent(e);
        drawPath(start, end);
        start = end;
      }
    });
    canvas.addEventListener("mousemove", e => {
      if (drawing) {
        let end = fromEvent(e);
        drawPath(start, end);
        start = end;
      }
    });
    canvas.addEventListener("mousedown", e => {
      drawing = true;
      start = fromEvent(e);
    });

    let brushSizeSlider = this.shadow.getElementById("brushSize");
    brushSizeSlider.addEventListener("input", e => {
      ctx.lineWidth = brushSizeSlider.value;
    });
    ctx.lineWidth = brushSizeSlider.value;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "white";
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, w, h);
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
    this.shadow.querySelector("canvas").toBlob(async maskBlob => {
      await StableDiffusion.inpaint(blob, maskBlob, params);
    });
  }

  setArgs(params) {
    for (let id of Inpainting.ids) {
      this.shadow.getElementById(id).setAttribute("value", params[id]);
      // hack: input type number will take string props but not attrs?
      this.shadow.getElementById(id).value = params[id];
    }
  }
  /** @param {File} file */
  setInputImage(file) {
    this.shadow.getElementById("imagepicker").setImageFile(file);
  }
}

window.customElements.define('fs-inpainting', Inpainting);

function html(s) {
  return s.join("");
}
