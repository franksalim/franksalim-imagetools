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

        <button id=img2imgButton>img2img</button>
        <button selected id=txt2imgButton>txt2img</button>
        <button id=inpaintingButton>inpaint</button>
        <button id=inpaintingButton>draw</button>
    `;
    this.shadow = shadow;
    let buttons = shadow.querySelectorAll("button");
    for (const button of buttons) {
      button.addEventListener("click", e => {
        [...buttons].map(b => { b.removeAttribute("selected") });
        button.setAttribute("selected", true);
      })
    }

    // default visibilities
    document.getElementById("txt2img").style.display = "block";
    document.getElementById("img2img").style.display = "none";

    shadow.getElementById("img2imgButton").addEventListener("click", e => {
      document.getElementById("txt2img").style.display = "none";
      document.getElementById("img2img").style.display = "block";
    });

    shadow.getElementById("img2imgButton").addEventListener("dragover", e => {
      shadow.getElementById("img2imgButton").dispatchEvent(new Event("click"));
    });

    shadow.getElementById("txt2imgButton").addEventListener("click", e => {
      document.getElementById("txt2img").style.display = "block";
      document.getElementById("img2img").style.display = "none";
    });
  }
}

window.customElements.define('fs-toolpicker', ToolPicker);
