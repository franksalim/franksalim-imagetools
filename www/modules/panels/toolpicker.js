import { SaveProjectButton } from '/modules/widgets/save-project-button.js';
import { LoadProjectButton } from '/modules/widgets/open-project-button.js';

export class ToolPicker extends HTMLElement {
  constructor() {
    super();
    let shadow = this.attachShadow({ mode: 'open' });
    /*
      icons from https://fonts.google.com/icons
        https://github.com/google/material-design-icons
    */
    shadow.innerHTML = `
      <style>
        :host {
          flex-basis: 60px;
          flex-grow: 0;
          flex-shrink: 0;

          display: flex;
          flex-direction: column;
        }
        .spacer {
          flex-grow: 1;
        }
        button {
          height: 60px;
          width: 60px;
          border: 0px;
          margin: 0px ;
          background: none;
          position: relative;
          z-index: 9;

          flex-grow: 0;
          flex-shrink: 0;
        }
        button img {
          height: 40px;
          width: 40px;
          opacity: .5;
        }
        button[selected] {
          background-color: #ccc;
          box-shadow: -6px 8px 8px rgba(0, 0, 0, .25);
        }
        </style>

        <button id=img2imgButton title="Image to image">
          <img src=/assets/imagesmode_FILL0_wght400_GRAD0_opsz48.svg>
        </button>
        <button selected id=txt2imgButton title="Text to image">
          <img src=/assets/edit_document_FILL0_wght400_GRAD0_opsz48.svg>
        </button>
        <button id=inpaintingButton title="Inpainting">
          <img src=/assets/brush_FILL0_wght400_GRAD0_opsz48.svg>
        </button>
        <button id=drawingButton title="Draw">
          <img src=/assets/draw_FILL0_wght400_GRAD0_opsz48.svg>
        </button>

        <div class=spacer></div>
        <button id=aboutButton title="About">
          <img src=/assets/help_FILL0_wght400_GRAD0_opsz48.svg>
        </button>
        <fs-save-project-button></fs-save-project-button>
        <fs-open-project-button></fs-open-project-button>
    `;
    this.shadow = shadow;
    let buttons = shadow.querySelectorAll("button");
    for (const button of buttons) {
      button.addEventListener("click", e => {
        [...buttons].map(b => { b.removeAttribute("selected") });
        button.setAttribute("selected", true);
      })
      // Select each tool when dragging over
      button.addEventListener("dragover", e => {
        button.dispatchEvent(new Event("click"));
      });
    }

    const img2imgTool = document.getElementById("img2img");
    const txt2imgTool = document.getElementById("txt2img");
    const inpaintingTool = document.getElementById("inpainting");
    const drawingTool = document.getElementById("drawing");
    const aboutTool = document.getElementById("about");
    this.tools = [txt2imgTool, img2imgTool, inpaintingTool, drawingTool];
    this.select(txt2imgTool);

    shadow.getElementById("img2imgButton").addEventListener("click", e => {
      this.select(img2imgTool);
    });
    shadow.getElementById("txt2imgButton").addEventListener("click", e => {
      this.select(txt2imgTool);
    });
    shadow.getElementById("inpaintingButton").addEventListener("click", e => {
      this.select(inpaintingTool);
    });
    shadow.getElementById("drawingButton").addEventListener("click", e => {
      this.select(drawingTool);
    });
    shadow.getElementById("aboutButton").addEventListener("click", e => {
      this.select(aboutTool);
    });
  }

  select(selected) {
    const tools = document.getElementById('tools');
    tools.querySelector('.active')?.classList.remove('active');
    selected.classList.add('active');
  }
}

window.customElements.define('fs-toolpicker', ToolPicker);
