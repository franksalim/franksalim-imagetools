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
        }
      </style>
    `;
    this.shadow = shadow;
  }
  
  add(color) {
    let button = document.createElement("button");
    button.style.background = color;
    button.addEventListener("click", e => {
      let colorEvent = new CustomEvent("color");
      colorEvent.color = color;
      this.dispatchEvent(colorEvent);
    });
    this.shadow.appendChild(button);
  }
}

window.customElements.define('fs-colorpalette', ColorPalette);
