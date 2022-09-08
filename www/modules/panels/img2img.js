import {PromptBuilder} from "/modules/widgets/promptbuilder.js";
export class ImageToImage extends HTMLElement {

  constructor() {
    super();
    let shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <link rel=stylesheet href=style.css>
      <style>
        :host {
          flex-basis: 300px;
          flex-grow: 0;
          flex-shrink: 0;
          padding: 16px;
          box-shadow: 0px 0px 16px rgba(0, 0, 0, .5);
        }
        img#input {
          width: 260px;
          height: 260px;
          outline: 1px solid #888;
          background-color: #ddd;
        }
      </style>
      <img id=input>
      <fs-promptbuilder id=promptbuilder></fs-promptbuilder>
      <textarea placeholder=prompt id=prompt>macro photograph, glass beads, blue light, color grading</textarea>
      <button id=generateButton>Generate</button>
    `;
  }

}
window.customElements.define('fs-img2img', ImageToImage);
