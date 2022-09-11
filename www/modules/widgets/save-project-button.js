import {SaveLoad} from "/modules/api/storage.js";

export class SaveProjectButton extends HTMLElement {
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
          position: relative;
          z-index: 9;
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
      <button><img src=/assets/save_FILL0_wght400_GRAD0_opsz48.svg></button>
    `;
    const button = shadow.querySelector("button");
    button.addEventListener("click", SaveLoad.saveProject);
  }
}

window.customElements.define('fs-save-project-button', SaveProjectButton);
