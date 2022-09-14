export class DrawingCanvas extends HTMLElement {
  static get observedAttributes() {
    return ["brushSize"];
  }

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

    canvas.addEventListener("pointerout", e => { drawing = false; });
    canvas.addEventListener("pointerup", e => {
      drawing = false;
      if (drawing) {
        let end = fromEvent(e);
        drawPath(start, end);
        start = end;
      }
    });
    canvas.addEventListener("pointermove", e => {
      if (drawing) {
        let end = fromEvent(e);
        drawPath(start, end);
        start = end;
      }
    });
    canvas.addEventListener("pointerdown", e => {
      drawing = true;
      start = fromEvent(e);
    });

    ctx.lineWidth = 10;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.strokeStyle = "white";
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    this.canvas = canvas;
    this.ctx = ctx;
  }

  replaceWithImage(image) {
    // save context
    let savedContext = {};
    const props = ["lineWidth", "lineCap", "lineJoin", "strokeStyle"];
    for (let prop of props) {
      savedContext[prop] = this.ctx[prop];
    }

    this.canvas.width = image.width;
    this.canvas.height = image.height;
    this.ctx.drawImage(image, 0, 0);

    // restore context
    for (let prop in savedContext) {
      this.ctx[prop] = savedContext[prop];
    }
  }

  async getBlob() {
    return await new Promise((resolve) => {
      this.canvas.toBlob(maskBlob => {
        resolve(maskBlob);
      });
    });
  }

  set brushSize(value) {
    this.ctx.lineWidth = value;
  }
  set brushColor(value) {
    this.ctx.strokeStyle = value;
  }

  fill(color) {
    this.ctx.fillStyle = color;
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
  }
}

window.customElements.define('fs-drawingcanvas', DrawingCanvas);
