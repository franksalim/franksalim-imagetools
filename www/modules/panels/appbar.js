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
        }
        </style>
    `;
    this.shadow = shadow;
  }
}

window.customElements.define('fs-appbar', AppBar);
