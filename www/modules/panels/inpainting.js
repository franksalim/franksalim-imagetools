import {ImagePicker} from "/modules/widgets/imagepicker.js";

export class Inpainting extends HTMLElement {
  constructor() {
    super();
    let shadow = this.attachShadow({mode: 'open'});
    shadow.innerHTML = `
      <style>
        :host {
          flex-basis: 300px;
          flex-grow: 0;
          flex-shrink: 0;
          padding: 16px;
          box-shadow: 0px 0px 16px rgba(0, 0, 0, .5);
        }
      </style>
      <fs-imagepicker id=imagepicker></fs-imagepicker>
      <fs-promptbuilder id=prompt></fs-promptbuilder>
    `;
    this.shadow = shadow;
  }
}

window.customElements.define('fs-inpainting', Inpainting);
