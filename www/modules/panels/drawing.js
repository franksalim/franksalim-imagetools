import {DrawingCanvas} from "/modules/widgets/drawingcanvas.js";

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
      <div id=colorpicker></div>
    `;

    let canvas = shadow.querySelector("fs-drawingcanvas");
    canvas.setupCanvas(408, 704);
    this.shadow = shadow;
  }
}

window.customElements.define('fs-drawing', Drawing);
