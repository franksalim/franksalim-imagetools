import {DrawingCanvas} from "/modules/widgets/drawingcanvas.js";
import {ColorPalette} from "/modules/widgets/colorpalette.js";

export class Drawing extends HTMLElement {
  constructor() {
    super();
    let shadow = this.attachShadow({mode: 'open'});
    shadow.innerHTML = `
      <link rel=stylesheet href=/css/panel.css>
      <style>
        #colorpicker {
          width: 260px;
          height: 260px;
          outline: 1px solid #888;
          background-color: #ddd;
        }
      </style>
      <fs-drawingcanvas></fs-drawingcanvas>
      <fs-colorpalette></fs-colorpalette>
      <input type=color id=colorPicker>

      <h2>Brush Size</h2>
      <fs-slider step=1 min=1 max=100 value=50 id=brushSize></fs-slider>

      <div class=buttonbar>
        <button id=saveButton>Save to List</button>
      </div>
    `;

    let canvas = shadow.querySelector("fs-drawingcanvas");
    canvas.setupCanvas(408, 704);
    canvas.brushColor = "black";
    canvas.brushSize = 50;
    canvas.fill("slategray");

    shadow.getElementById("saveButton")
      .addEventListener("click", async e => {
        let blob = await this.shadow.querySelector("fs-drawingcanvas").getBlob();
        let uri = URL.createObjectURL(blob);
        document.getElementById("historyList").addImage(uri, {});
      });

    let brushSizeSlider = shadow.getElementById("brushSize");
    brushSizeSlider.addEventListener("input", e => {
      canvas.brushSize = brushSizeSlider.value;
    });
    let colorPicker = shadow.getElementById("colorPicker");
    let colorPalette = shadow.querySelector("fs-colorpalette");
    colorPicker.addEventListener("change", e => {
      canvas.brushColor = colorPicker.value;
      colorPalette.add(colorPicker.value);
    });
    document.addEventListener("colorchange", e => {
      canvas.brushColor = e.color;
      // <canvas> reformats the css color to #RRGGBB format suitable for <input>
      colorPicker.value = canvas.brushColor;
    });

    this.canvas = canvas;
    this.shadow = shadow;
  }

  setInputSrc(src) {
    let image = new Image();
    image.setAttribute("src", src);
    image.onload = e => {
      this.canvas.replaceWithImage(image);
    }
  }

  setInputImage(file) {
    let image = new Image();
    image.setAttribute("src", URL.createObjectURL(file));
    image.onload = e => {
      this.canvas.replaceWithImage(image);
    }
  }
}

window.customElements.define('fs-drawing', Drawing);
