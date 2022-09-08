export class FsList extends HTMLElement {
  constructor() {
    super();
    let shadow = this.attachShadow({mode: 'open'});
    shadow.innerHTML = `
      <link rel=stylesheet href=style.css>
      <style>
        :host {
          flex-basis: 140px;
          flex-grow: 0;
          flex-shrink: 0;
          padding: 8px;
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
  addImage(uri, params) {
    let img = new Image();
    img.src = uri;
    img.params = params;
    img.addEventListener("click", e => {
      document.getElementById("detail").setImage(uri);
      document.getElementById("detail").setArgs(params);
    });
    this.shadow.prepend(img);
  }
}

window.customElements.define('fs-list', FsList);
