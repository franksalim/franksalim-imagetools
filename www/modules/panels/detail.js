export class Details extends HTMLElement {
  constructor() {
    super();
    let shadow = this.attachShadow({mode: 'open'});
    shadow.innerHTML = `
      <link rel=stylesheet href=style.css>
      <style>
        :host {
          flex: auto;
          background-color: #ccc;
          padding: 8px;
          margin: 4px;
        }
      </style>
      <img id=image>
      <p id=args>
        {'steps': '30', 'scale': '7.5', 'width': '448', 'height': '704', 'seed': '1337', 'prompt': 'neon light, cinematic color grading'}
      </p>
    `;

    console.log(this.getAttribute("fs-id"));
    // TODO: buttons for actions (img2img, reopen prompt, etc.)
    // open in promptbuilder
    // img2img
    // star, annotate
    // upscale

    this.shadow = shadow;
  }
  
  setImage(uri) {
    this.shadow.getElementById("image").setAttribute("src", uri);
  }
  
  setArgs(args) {
    this.shadow.getElementById("args").innerText = JSON.stringify(args);
  }
}

window.customElements.define('fs-detail', Details);
