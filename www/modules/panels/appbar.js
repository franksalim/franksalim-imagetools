import '../widgets/save-project-button.js';
import '../widgets/open-project-button.js';

export class AppBar extends HTMLElement {
  constructor() {
    super();
    let shadow = this.attachShadow({mode: 'open'});
    shadow.innerHTML = `
      <style>
        :host {
          flex-basis: 40px;
          flex-grow: 0;
          flex-shrink: 0;
          background-color: #444;
          position: relative;
          z-index: 10;
          box-shadow: 0px 0px 8px rgba(0, 0, 0, .5);
          display: flex;
          align-items: center;
        }
        * {
          margin: 5px;
        }
      </style>

      <fs-save-project-button></fs-save-project-button>
      <fs-open-project-button></fs-open-project-button>
    `;
    this.shadow = shadow;
  }
}

window.customElements.define('fs-appbar', AppBar);
