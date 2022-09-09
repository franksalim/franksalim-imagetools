export class Details extends HTMLElement {
  constructor() {
    super();
    let shadow = this.attachShadow({mode: 'open'});
    shadow.innerHTML = `
      <link rel=stylesheet href=style.css>
      <style>
        :host {
          flex: auto;
          padding: 16px;
        }
      </style>
      <img id=image>
      <p id=args></p>
      <button id=openButton>Open in Prompt Builder</button>
      <a id=downloadLink>Download</a>
    `;

    this.shadow = shadow;
    shadow.getElementById("openButton").addEventListener("click", e => {
      let s = shadow.getElementById("args").innerText;
      document.getElementById("txt2img").setArgs(JSON.parse(s));
    });
  }

  setImage(uri) {
    this.shadow.getElementById("image").setAttribute("src", uri);
    let downloadLink = this.shadow.getElementById("downloadLink");
    window.test1 = uri;
    downloadLink.href = uri;
    // get the path part of the object URL.
    // URL.pathname doesn't work like HTTP URLs
    let path = uri.toString().split("/").pop();
    downloadLink.download = path + ".png";
  }
  
  setArgs(args) {
    this.shadow.getElementById("args").innerText = JSON.stringify(args);
  }
}

window.customElements.define('fs-detail', Details);
