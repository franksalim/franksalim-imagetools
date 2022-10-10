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
          justify-content: right;
        }
        * {
          margin: 5px;
        }
        #status {
          color: white;
          padding: 0px 16px;
        }
        h1 {
          font-size: 14px;
          color: white;
          flex-grow: 1;
        }
      </style>
      <h1>fs-imagetools</h1>
      <div id=status></div>
    `;
    this.shadow = shadow;
  }

  setStatus(status) {
    this.shadow.getElementById("status").textContent = status;
  }
}

window.customElements.define('fs-appbar', AppBar);
