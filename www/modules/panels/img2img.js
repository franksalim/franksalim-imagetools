import {PromptBuilder} from "/modules/widgets/promptbuilder.js";
export class ImageToImage extends HTMLElement {
  static ids = ["steps", "scale", "prompt"];

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
      <fs-promptbuilder id=prompt></fs-promptbuilder>

      <h2>Scale</h2>
      <span class=inputAndValue>
        <input type=range value=7.5 id=scale>
        <span id=scaleValue>7.5</span>
      </span>
      <button id=defaultScaleButton>Default 7.5</button>

      <h2>Steps</h2>
      <span class=inputAndValue>
        <input type=range step=1 value=30 id=steps min=1 max=100>
        <span id=stepsValue>30</span>
      </span>
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
    shadow.getElementById("generateButton")
      .addEventListener("click", e => { this.generate() });

    this.shadow = shadow;
  }
  async generate() {
    // grab parameters
    let params = {};
    for (let id of ImageToImage.ids) {
      params[id] = this.shadow.getElementById(id).value
    }

    let inputUri = this.shadow.getElementById("inputImage").getAttribute("src");
    if (!inputUri) {
      return;
    }
    let blob = await fetch(inputUri).then(r => r.blob());

    let formData = new FormData();
    formData.append("params", JSON.stringify(params));
    formData.append("initImage", blob);

    const response = await fetch("/img2img/", {
      method: "POST",
      cache: "no-cache",
      body: formData
    });
    let uri = URL.createObjectURL(await response.blob());
    document.getElementById("detail").setImage(uri);
    document.getElementById("detail").setArgs(params);
    document.getElementById("historyList").addImage(uri, params);
  }
}
window.customElements.define('fs-img2img', ImageToImage);
