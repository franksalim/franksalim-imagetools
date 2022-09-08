export class ToolPicker extends HTMLElement {
  constructor() {
    super();
    let shadow = this.attachShadow({mode: 'open'});
    shadow.innerHTML = `
      <style>
        :host {
          flex-basis: 60px;
          flex-grow: 0;
          flex-shrink: 0;
        }
        button {
          height: 60px;
          width: 60px;
          border: 0px;
          margin: 0px ;
          background: none;
          position: relative;
          z-index: 10;
        }
        button[selected] {
          background-color: #ccc;
          box-shadow: -6px 8px 8px rgba(0, 0, 0, .25);
        }
        </style>

        <button title="image to image">img2img</button>
        <button title="text to image" selected>txt2img</button>
        <button title="inpainting">inpaint</button>
    `;
    this.shadow = shadow;
    let buttons = shadow.querySelectorAll("button");
    for (const button of buttons) {
      button.addEventListener("click", e => {
        [...buttons].map(b => { b.removeAttribute("selected") });
        button.setAttribute("selected", true);
      })
    }
  }
}

window.customElements.define('fs-toolpicker', ToolPicker);
