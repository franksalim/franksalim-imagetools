export class FsList extends HTMLElement {
  constructor() {
    super();
    let shadow = this.attachShadow({mode: 'open'});
    shadow.innerHTML = `
      <link rel=stylesheet href=style.css>
      <style>
        :host {
          flex: auto;
          background-color: #888;
          padding: 8px;
          margin: 4px;
          width: 360px;
          overflow-y: scroll;
        }
        :host::-webkit-scrollbar {
          width: 0 !important;
        }
        img {
          width: 120px;
          display: inline-block;
          margin: 4px;
        }
        </style>
    `;
    this.shadow = shadow;
  }
  addImage(uri) {
    let img = new Image();
    img.src = uri;
    this.shadow.prepend(img);
  }
}

window.customElements.define('fs-list', FsList);
