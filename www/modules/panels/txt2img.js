import {PromptBuilder} from "/modules/widgets/promptbuilder.js";
import {Slider} from "/modules/widgets/slider.js";
import {StableDiffusion} from "/modules/api/stablediffusion.js";

export class TextToImage extends HTMLElement {
  static ids = ["steps", "scale", "width", "height", "seed", "prompt"];

  constructor() {
    super();
    let shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <link rel=stylesheet href=/css/panel.css>
      <fs-promptbuilder id=prompt></fs-promptbuilder>

      <h2>Width</h2>
      <fs-slider step=64 min=256 max=1024 value=512 id=width></fs-slider>
      <h2>Height</h2>
      <fs-slider step=64 min=256 max=1024 value=512 id=height></fs-slider>

      <div class=buttonbar>
        <button id=squarePresetButton>Square</button>
        <button id=portraitPresetButton>Portrait</button>
        <button id=landcapePresetButton>Landscape</button>
       <label>
          Tiled
          <input type=checkbox id=tiled>
        </label>
      </div>

      <h2>Seed</h2>
      <input type=number value=1337 id=seed>
      <button id=randomSeedButton>Random</button>
      <h2>Scale</h2>
      <fs-slider step=0.5 min=-30 max=30 value=7.5 id=scale></fs-slider>
      <h2>Steps</h2>
      <fs-slider step=1 min=1 max=100 value=30 id=steps></fs-slider>


      <details>
        <summary>Batch Generation</summary>
        <h2>Batch size</h2>
        <fs-slider id=batchSize min=1 max=500 value=10></fs-slider>

        <div class=buttonbar>
          <button id=nextButton
                  title="Increment the seed and generate the next image.">
            Next 10
          </button>
          <button id=runForever>Run forever</button>
        </buttonbar>
      </details>

      <div class=buttonbar>
        <button id=generateButton>Generate</button>
        <button id=import>Import from clipboard</button>
      </div>
    `;

    shadow.getElementById("generateButton")
      .addEventListener("click", e => { this.generate() });

    const batchSizeInput = shadow.getElementById("batchSize");
    let batchSize = 10;
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
    seedInput.addEventListener("wheel", e => {
      e.preventDefault();
      if (e.deltaY > 0) {
        seedInput.valueAsNumber -= 1;
      } else if (e.deltaY < 0) {
        seedInput.valueAsNumber += 1;
      }
    });
    shadow.getElementById("randomSeedButton").addEventListener("click",
      e => { seedInput.value = Math.floor(Math.random() * 1000000000) });

    shadow.getElementById("nextButton")
      .addEventListener("click", async e => {
        for (let i = 0; i < batchSize; i++) {
          seedInput.value = seedInput.valueAsNumber + 1;
          try {
            await this.generate(`Generating ${i + 1} of ${batchSize}`);
          } catch(e) {
            console.error(e);
          }
        }
        TextToImage.setStatus('');
      });

    let runForever = false;
    shadow.getElementById("runForever")
      .addEventListener("click", async e => {
        runForever = !runForever;
        if (runForever) {
          e.target.textContent = "Stop";
          while (runForever) {
            seedInput.valueAsNumber = seedInput.valueAsNumber + 1;
            try {
              await this.generate();
            } catch(e) {
              console.error(e);
            }
          }
          TextToImage.setStatus('');
        } else {
          e.target.textContent = "Run forever";
          TextToImage.setStatus("Finishing last image before stopping");
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

    this.shadow = shadow;
  }

  setArgs(params) {
    for (let id of TextToImage.ids) {
      this.shadow.getElementById(id).setAttribute("value", params[id]);
      // hack: input type number will take string props but not attrs?
      this.shadow.getElementById(id).value = params[id];
    }
    this.shadow.getElementById('tiled').checked = params.tiled;
  }

  async generate(message = `Generating`) {
    // grab parameters
    let params = {};
    for (let id of TextToImage.ids) {
      params[id] = this.shadow.getElementById(id).value
    }
    params.tiled = this.shadow.getElementById('tiled').checked;

    TextToImage.setStatus(message);
    await StableDiffusion.generateImageFromText(params);
    TextToImage.setStatus("");
  }

  static setStatus(s) {
    document.getElementById("appbar").setStatus(s);
  }
}

window.customElements.define('fs-txt2img', TextToImage);
