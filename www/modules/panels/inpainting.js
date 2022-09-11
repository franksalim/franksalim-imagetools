import {ImagePicker} from "/modules/widgets/imagepicker.js";

export class Inpainting extends HTMLElement {
  constructor() {
    super();
    let shadow = this.attachShadow({mode: 'open'});
    shadow.innerHTML = `
      <link rel=stylesheet href=/css/panel.css>
      <fs-imagepicker id=imagepicker></fs-imagepicker>
      <fs-promptbuilder id=prompt></fs-promptbuilder>
    `;
    this.shadow = shadow;
  }
}

window.customElements.define('fs-inpainting', Inpainting);
