export class Layers extends HTMLElement {
  constructor() {
    super();
    let shadow = this.attachShadow({mode: 'open'});
    shadow.innerHTML = `
      <style>
        :host {
          flex-basis: 300px;
          flex-grow: 0;
          flex-shrink: 0;
          padding-bottom: 16px;
          box-shadow: 0px 0px 16px rgba(0, 0, 0, .5);
        }
      </style>

    `
  }
}

window.customElements.define('fs-layers', Layers);
