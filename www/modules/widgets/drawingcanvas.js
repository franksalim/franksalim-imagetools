export class DrawingCanvas extends HTMLElement {
  static get observedAttributes() {
    return ["brushSize"];
  }
  #canvas;
  #ctx;

  constructor() {
    super();
    let shadow = this.attachShadow({mode: 'open'});
    shadow.innerHTML = `
      <style>
        canvas {
          outline: 1px solid #444;
        }
      </style>
      <canvas width=0 height=0></canvas>
    `;
    this.shadow = shadow;
  }

  setupCanvas(w, h) {
    const canvas = this.shadow.querySelector("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = w;
    canvas.height = h;

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

    ctx.lineWidth = 10;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "white";
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    this.#canvas = canvas;
    this.#ctx = ctx;
  }

  async getBlob() {
    return await new Promise((resolve) => {
      this.#canvas.toBlob(maskBlob => {
        resolve(maskBlob);
      });
    });
  }

  set brushSize(value) {
    this.#ctx.lineWidth = value;
  }
}

window.customElements.define('fs-drawingcanvas', DrawingCanvas);
