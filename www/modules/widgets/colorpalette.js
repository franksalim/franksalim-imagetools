export class ColorPalette extends HTMLElement {
  constructor() {
    super();
    let shadow = this.attachShadow({mode: 'open'});
    shadow.innerHTML = `
      <style>
        :host {
          display: block;
        }
        button {
          height: 48px;
          width: 48px;
          border: none;
          border-radius: 8px;
          padding: 2px;
        }
      </style>
    `;
    this.shadow = shadow;
  }

  add(color) {
    let button = document.createElement("button");
    button.style.background = color;
    button.addEventListener("click", e => {
      let colorEvent = new CustomEvent("colorchange");
      colorEvent.color = color;
      // global color change event
      document.dispatchEvent(colorEvent);
    });
    this.shadow.appendChild(button);
  }

  fromImage(image) {
    for (let button of this.shadow.querySelectorAll("button")) {
      button.remove();
    }

    const i = 3; // no need to preserve aspect ratio
    let canvas = document.createElement("canvas");
    canvas.width = i;
    canvas.height = i;
    let ctx = canvas.getContext("2d");
    ctx.drawImage(image, 0, 0, i, i);

    const colors = new Uint8Array(ctx.getImageData(0, 0, i, i).data.buffer);

    for (let j=0, r,g,b; j < colors.byteLength; j += 4) {
      let r = colors[j+0];
      let g = colors[j+1];
      let b = colors[j+2];
      this.add(`rgb(${r},${g},${b})`);
    }
  }
}

window.customElements.define('fs-colorpalette', ColorPalette);
