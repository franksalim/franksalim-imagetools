export class About extends HTMLElement {
  constructor() {
    super();
    let shadow = this.attachShadow({mode: 'open'});
    shadow.innerHTML = `
      <link rel=stylesheet href=/css/panel.css>
      <style>
        h2, a {
          display: block;
          margin: 8px 0px;
        }
      </style>

      <h2>franksalim-imagetools</h2>
      <a href="https://github.com/franksalim/franksalim-imagetools">This project on GitHub</a>
      
      <h2>Open Source Dependencies</h2>
      <a href="https://github.com/huggingface/diffusers/">Diffusers</a>
      <a href="https://github.com/CompVis/stable-diffusion">Stable Diffusion</a>
      <a href="https://github.com/pallets/flask">Flask</a>
      <a href="https://github.com/google/material-design-icons">Material Design Icons</a>
    `;
  }
}

window.customElements.define('fs-about', About);
