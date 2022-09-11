import {SaveLoad} from "/modules/api/storage.js";

export class LoadProjectButton extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({mode: 'open'});
    shadow.innerHTML = `
      <style>
        button {
          height: 60px;
          width: 60px;
          border: 0px;
          outline: 0px;
          margin: 0px ;
          background: none;
        }
        button:active {
          position: relative;
          z-index: 9;
          background-color: #ccc;
        }
        button img {
          height: 40px;
          width: 40px;
          opacity: .5;
        }
      </style>
      <button><img src=/assets/folder_open_FILL0_wght400_GRAD0_opsz48.svg></button>
    `;
    const button = shadow.querySelector('button');
    button.addEventListener('click', SaveLoad.loadProject);

    shadow.addEventListener("dragover", e => {
      e.preventDefault();
    });
    shadow.addEventListener("drop", e => {
      e.preventDefault();
      if (!e.dataTransfer.items.length) {
        return;
      }
      if (e.dataTransfer.items[0].kind == "file") {
        const file = e.dataTransfer.items[0].getAsFile();
        SaveLoad.loadProjectFromFile(file);
      }
    });

  }
}

window.customElements.define('fs-open-project-button', LoadProjectButton);
