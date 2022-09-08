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
        img#inputImage {
          width: 260px;
          min-height: 100px;
          outline: 1px solid #888;
          background-color: #ddd;
        }
      </style>
      <img id=inputImage>
      <input type=file id=filepicker>
      <fs-promptbuilder id=promptbuilder></fs-promptbuilder>
      <textarea placeholder=prompt id=prompt>macro photograph, glass beads, blue light, color grading</textarea>
      <button id=generateButton>Generate</button>
    `;

    const inputImage = shadow.getElementById("inputImage");

    shadow.getElementById("filepicker").addEventListener("change", e => {
      const blob = e.target.files[0];
      let uri = URL.createObjectURL(blob);
      inputImage.setAttribute("src", uri);
    });
    inputImage.addEventListener("dragover", e => {
      e.preventDefault();
    });
    inputImage.addEventListener("drop", e => {
      e.preventDefault();

      if (!e.dataTransfer.items.length) {
        return;
      }

      if (e.dataTransfer.items[0].kind == "file") {
        const blob = e.dataTransfer.items[0].getAsFile();
        let uri = URL.createObjectURL(blob);
        inputImage.setAttribute("src", uri);
      } else  {
        let uri = e.dataTransfer.getData("text/plain");
        inputImage.setAttribute("src", uri);
      }
    });
  }


}
window.customElements.define('fs-img2img', ImageToImage);
