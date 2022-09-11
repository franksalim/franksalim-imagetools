import {ImagePicker} from "/modules/widgets/imagepicker.js";
import {Slider} from "/modules/widgets/slider.js";
import {StableDiffusion} from "/modules/api/stablediffusion.js";

export class Inpainting extends HTMLElement {
  static ids = ["steps", "scale", "prompt", "strength"];

  constructor() {
    super();
    let shadow = this.attachShadow({mode: 'open'});
    shadow.innerHTML = `
      <link rel=stylesheet href=/css/panel.css>
      <style>
        canvas {
          background-color: rgba(256, 256, 256, 0.5);
        }
      </style>
      <div>
        <fs-imagepicker id=imagepicker></fs-imagepicker>
        <canvas width=512 height=512>
      </div>
      <fs-promptbuilder id=prompt></fs-promptbuilder>

      <h2>Brush Size</h2>
      <fs-slider step=1 min=1 max=100 value=10 id=brushSize></fs-slider>

      <h2>Scale</h2>
      <fs-slider step=0.5 min=-30 max=30 value=7.5 id=scale></fs-slider>

      <h2>Steps</h2>
      <fs-slider step=1 min=1 max=100 value=30 id=steps></fs-slider>

      <h2>Strength</h2>
      <fs-slider step=0.01 min=0.0 max=1.0 value=0.75 id=strength></fs-slider>

      <div class=buttonbar>
        <button id=generateButton>Generate</button>
      </div>
    `;

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

    const canvas = shadow.querySelector("canvas");
    const ctx = canvas.getContext("2d");
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

    let brushSizeSlider = shadow.getElementById("brushSize");
    brushSizeSlider.addEventListener("input", e => {
      ctx.lineWidth = brushSizeSlider.value;
    });
    ctx.lineWidth = brushSizeSlider.value;
    ctx.lineCap = "round";
    ctx.strokeStyle = "white";
    ctx.fillStyle = "black";
    ctx.fillRect(0, 0, 512, 512);

    shadow.getElementById("generateButton")
      .addEventListener("click", e => { this.generate() });

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
    this.shadow.querySelector("canvas").toBlob(async maskBlob => {
      await StableDiffusion.inpaint(blob, maskBlob, params);
    });
  }
}

window.customElements.define('fs-inpainting', Inpainting);
