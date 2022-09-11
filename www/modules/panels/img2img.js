import {PromptBuilder} from "../widgets/promptbuilder.js";
import {ImagePicker} from "/modules/widgets/imagepicker.js";
import {Slider} from "/modules/widgets/slider.js";
import {StableDiffusion} from "/modules/api/stablediffusion.js";

export class ImageToImage extends HTMLElement {
  static ids = ["steps", "scale", "prompt", "strength"];

  constructor() {
    super();
    let shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <link rel=stylesheet href=/css/panel.css>
      <fs-imagepicker id=imagepicker></fs-imagepicker>
      <fs-promptbuilder id=prompt></fs-promptbuilder>

      <h2>Scale</h2>
      <fs-slider step=0.5 min=-30 max=30 value=7.5 id=scale></fs-slider>

      <h2>Steps</h2>
      <fs-slider step=1 min=1 max=100 value=30 id=steps></fs-slider>

      <h2>Strength</h2>
      <fs-slider step=0.01 min=0.0 max=1.0 value=0.75 id=strength></fs-slider>

      <div class=buttonbar>
        <button id=generateButton>Generate</button>
      </div>
    `;

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

    let inputUri = this.shadow.getElementById("imagepicker").getImageSrc();
    if (!inputUri) {
      return;
    }
    let blob = await fetch(inputUri).then(r => r.blob());
    StableDiffusion.generateImageFromImage(blob, params);
  }
}
window.customElements.define('fs-img2img', ImageToImage);
