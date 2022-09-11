export class Drawing extends HTMLElement {
  constructor() {
    super();
    let shadow = this.attachShadow({mode: 'open'});
    shadow.innerHTML = `
      <link rel=stylesheet href=/css/panel.css>
      <style>
        #colorpicker {
          width: 260px;
          height: 260px;
          outline: 1px solid #888;
          background-color: #ddd;
        }
      </style>
      <div id=colorpicker></div>
    `;
    this.shadow = shadow;
  }
}

window.customElements.define('fs-drawing', Drawing);
