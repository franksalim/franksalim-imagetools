import {PromptBuilder} from "/modules/widgets/promptbuilder.js";
import '../widgets/slider.js';

export class TextToImage extends HTMLElement {
  static ids = ["steps", "scale", "width", "height", "seed", "prompt"];

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
        .inputAndValue {
          display: flex;
        }
        .inputAndValue > span {
          font-size: 12px;
          margin-left: 12px;
        }
      </style>

      <fs-promptbuilder id=prompt></fs-promptbuilder>

      <details open>
        <h2>Width</h2>
        <fs-slider step=64 min=256 max=1024 value=704 id=width></fs-slider>

        <h2>Height</h2>
        <fs-slider step=64 min=256 max=1024 value=448 id=height></fs-slider>

        <button id=squarePresetButton>Square</button>
        <button id=portraitPresetButton>Portrait</button>
        <button id=landcapePresetButton>Landscape</button>

        <summary>Options</summary>
        <h2>Seed</h2>
        <input type=number value=1337 id=seed>
        <button id=randomSeedButton>Random</button>

        <h2>Scale</h2>
        <fs-slider step=0.5 min=-30 max=30 value=7.5 id=scale></fs-slider>
        <button id=defaultScaleButton>Default 7.5</button>

        <h2>Steps</h2>
        <fs-slider step=1 min=1 max=100 value=30 id=steps></fs-slider>
        <button id=thirtyPresetButton>30</button>
        <button id=hundredPresetButton>100</button>
      </details>

      <button id=import>Import from clipboard</button>
      <br>

      <button id=generateButton>Generate</button>
      <button id=nextButton>Next</button>
    `;

    shadow.getElementById("generateButton")
      .addEventListener("click", e => { this.generate() });

    let seedInput = shadow.getElementById("seed");

    shadow.getElementById("randomSeedButton")
      .addEventListener("click", e => { seedInput.value = Math.floor(Math.random() * 1000000000) });

    shadow.getElementById("nextButton")
      .addEventListener("click", e => {
        seedInput.value = Number.parseInt(seedInput.value) + 1;

        console.log(this);
        this.generate();
      });

    let widthSlider = shadow.getElementById("width");
    let heightSlider = shadow.getElementById("height");
    let stepsSlider = shadow.getElementById("steps");
    let scaleSlider = shadow.getElementById("scale");

    let squarePresetButton = shadow.getElementById("squarePresetButton");
    squarePresetButton.addEventListener("click", e => {
      widthSlider.value = 512;
      heightSlider.value = 512;
      widthSlider.dispatchEvent(new Event("input"));
      heightSlider.dispatchEvent(new Event("input"));
    });

    let portraitPresetButton = shadow.getElementById("portraitPresetButton");
    portraitPresetButton.addEventListener("click", e => {
      widthSlider.value = 448;
      heightSlider.value = 704;
      widthSlider.dispatchEvent(new Event("input"));
      heightSlider.dispatchEvent(new Event("input"));
    });

    let landcapePresetButton = shadow.getElementById("landcapePresetButton");
    landcapePresetButton.addEventListener("click", e => {
      widthSlider.value = 704;
      heightSlider.value = 448;
      widthSlider.dispatchEvent(new Event("input"));
      heightSlider.dispatchEvent(new Event("input"));
    });

    let thirtyPresetButton = shadow.getElementById("thirtyPresetButton");
    thirtyPresetButton.addEventListener("click", e => {
      stepsSlider.value = 30;
      stepsSlider.dispatchEvent(new Event("input"));
    });

    let hundredPresetButton = shadow.getElementById("hundredPresetButton");
    hundredPresetButton.addEventListener("click", e => {
      stepsSlider.value = 100;
      stepsSlider.dispatchEvent(new Event("input"));
    });

    let defaultScaleButton = shadow.getElementById("defaultScaleButton");
    defaultScaleButton.addEventListener("click", e => {
      scaleSlider.value = 7.5;
      scaleSlider.dispatchEvent(new Event("input"));
    });

    const importButton = shadow.getElementById('import');
    importButton.addEventListener('click', async e => {
      const text = await navigator.clipboard.readText();
      try {
        const json = JSON.parse(text);
        this.setArgs(json);
      } catch {
      }
    });

    this.shadow = shadow;
  }

  setArgs(params) {
    for (let id of TextToImage.ids) {
      this.shadow.getElementById(id).value = params[id];
    }
    // update prompt builder
    this.shadow.getElementById("prompt").dispatchEvent(
      new Event("input"));
  }

  async generate() {
    // grab parameters
    let params = {};
    for (let id of TextToImage.ids) {
      params[id] = this.shadow.getElementById(id).value
    }

    const response = await fetch("/generate/", {
      method: "POST",
      cache: "no-cache",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params)
    });
    let uri = URL.createObjectURL(await response.blob());
    document.getElementById("detail").setImage(uri);
    document.getElementById("detail").setArgs(params);
    document.getElementById("historyList").addImage(uri, params);
  }
}

window.customElements.define('fs-txt2img', TextToImage);
