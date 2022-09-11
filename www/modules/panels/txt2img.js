import { PromptBuilder } from "/modules/widgets/promptbuilder.js";
import '../widgets/slider.js';

export class TextToImage extends HTMLElement {
  static ids = ["steps", "scale", "width", "height", "seed", "prompt"];

  constructor() {
    super();
    let shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = html`
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
        <summary>Options</summary>

        <!-- Dimensions -->
        <h2>Width</h2>
        <fs-slider step=64 min=256 max=1024 value=704 id=width></fs-slider>
        <h2>Height</h2>
        <fs-slider step=64 min=256 max=1024 value=448 id=height></fs-slider>
        <button id=squarePresetButton>Square</button>
        <button id=portraitPresetButton>Portrait</button>
        <button id=landcapePresetButton>Landscape</button>

        <h2>Seed</h2>
        <input type=number value=1337 id=seed>
        <button id=randomSeedButton>Random</button>
        <h2>Scale</h2>
        <fs-slider step=0.5 min=-30 max=30 value=7.5 id=scale></fs-slider>
        <h2>Steps</h2>
        <fs-slider step=1 min=1 max=100 value=30 id=steps></fs-slider>
      </details>

      <details>
        <summary>Batch Generation</summary>
        <h2>Batch size</h2>
        <fs-slider id=batchSize min=1 max=500 value=1></fs-slider>

        <button id=nextButton title="Increment the seed and generate the next image.">Next</button>
        <button id=runForever>Run forever</button>
      </details>

      <button id=queuePromptButton>Queue Prompt</button>
      <button id=import>Import from clipboard</button>
    `;

    shadow.getElementById("queuePromptButton")
      .addEventListener("click", async e => { 
        document.getElementById("historyList").queuePrompt(this.getParams());
        this.generateImagesUntilQueueIsEmptyOrForeverIsStopped();
      });

    const batchSizeInput = shadow.getElementById("batchSize");
    let batchSize = 1;
    batchSizeInput.addEventListener('input', () => {
      const num = batchSizeInput.value;
      batchSize = num;
      if (batchSize === 1) {
        shadow.getElementById('nextButton').textContent = `Next`;
      } else {
        shadow.getElementById('nextButton').textContent = `Next ${num}`;
      }
    });

    let seedInput = shadow.getElementById("seed");

    shadow.getElementById("randomSeedButton")
      .addEventListener("click", e => { seedInput.value = Math.floor(Math.random() * 1000000000) });

    shadow.getElementById("nextButton")
      .addEventListener("click", async e => {
        for (let i = 0; i < batchSize; i++) {
          seedInput.value = seedInput.valueAsNumber + 1;
          document.getElementById("historyList").queuePrompt(this.getParams());
        }
        this.generateImagesUntilQueueIsEmptyOrForeverIsStopped();
      });

    this.runForever = false;
    shadow.getElementById("runForever")
      .addEventListener("click", async e => {
        this.runForever = !this.runForever;
        if (this.runForever) {
          e.target.textContent = "Stop";
          this.generateImagesUntilQueueIsEmptyOrForeverIsStopped();
        } else {
          e.target.textContent = "Run forever";
        }
      });

    const widthSlider = shadow.getElementById("width");
    const heightSlider = shadow.getElementById("height");
    const stepsSlider = shadow.getElementById("steps");
    const scaleSlider = shadow.getElementById("scale");

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

    const importButton = shadow.getElementById('import');
    importButton.addEventListener('click', async e => {
      const text = await navigator.clipboard.readText();
      try {
        const json = JSON.parse(text);
        this.setArgs(json);
      } catch {
        console.log("Could not parse clipboard contents");
      }
    });

    this.generationLoopIsRunning = false;
    this.shadow = shadow;
  }

  async generateImagesUntilQueueIsEmptyOrForeverIsStopped() {
    if (this.generationLoopIsRunning == true) {
      return;
    }
    this.generationLoopIsRunning = true;
    while (true) {
      let image = document.getElementById("historyList").getEarliestUnprocessedImageForProcessing();

      if (image) {
        await this.generate(image.params, image);
      } else if (this.runForever) {
        document.getElementById("historyList").queuePrompt(this.getParams());
        let seedInput = this.shadow.getElementById("seed");
        seedInput.value = seedInput.valueAsNumber + 1;
      } else {
        this.generationLoopIsRunning = false;
        break;
      }  
    }
  }

  setArgs(params) {
    for (let id of TextToImage.ids) {
      this.shadow.getElementById(id).setAttribute("value", params[id]);
      // hack: input type number will take string props but not attrs?
      this.shadow.getElementById(id).value = params[id];
    }
  }

  getParams() {
    let params = {};
    for (let id of TextToImage.ids) {
      params[id] = this.shadow.getElementById(id).value;
    }
    return params;
  }

  async generate(params, image) {
    const response = await fetch("/generate/", {
      method: "POST",
      cache: "no-cache",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params)
    });
    let uri = URL.createObjectURL(await response.blob());
    document.getElementById("detail").setImage(uri);
    document.getElementById("detail").setArgs(params);
    document.getElementById("historyList").setImageSource(image, uri);
  }
}

window.customElements.define('fs-txt2img', TextToImage);

/**
 * Just concats the string, but this is a hint to editor plugins to 
 * give language support as though the contents are HTML.
 * @param {TemplateStringsArray} s 
 */
 function html(s) {
  return s.join('');
}