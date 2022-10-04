import {ColorPalette} from "/modules/widgets/colorpalette.js";

export class Details extends HTMLElement {
  constructor() {
    super();
    let shadow = this.attachShadow({mode: 'open'});
    shadow.innerHTML = `
      <style>
        :host {
          flex: auto;
          padding: 16px;
          display: none;
        }
        #scroller {
          overflow: scroll;
        }
        fs-colorpalette {
          padding: 16px 0px;
        }
        button, a {
          height: 60px;
          width: 60px;
          border: 0px;
          background: none;
        }
        button img, a img {
          height: 40px;
          width: 40px;
          opacity: .5;
        }
        #params {
          max-width: 448px;
        }
      </style>
      <div id=scroller>
        <div id=background></div>
      </div>
      <img id=image>
      <div id="controls" hidden>
        <button id=openButton title="Open prompt in txt2img">
          <img src=/assets/edit_document_FILL0_wght400_GRAD0_opsz48.svg>
        </button>
        <a id=downloadLink>
          <img src=assets/download_FILL0_wght400_GRAD0_opsz48.svg>
        </a>
      </div>
      <fs-colorpalette></fs-colorpalette>
      <p id=params></p>
    `;

    this.shadow = shadow;
    shadow.getElementById("openButton").addEventListener("click", e => {
      let s = shadow.getElementById("params").innerText;
      document.getElementById("txt2img").setparams(JSON.parse(s));
    });
  }

  setImage(uri, params) {
    this.style.display = "block";
    this.shadow.getElementById("params").innerText = JSON.stringify(params);
    this.shadow.getElementById("controls").removeAttribute("hidden");

    if (params.tiled) {
      // Need to make #scroller the size of the image and then make
      // #image 3x that size, with #scroller set to overflow: scroll.
      // That way we can see that the image tiles properly.
      const {width, height} = params;
      this.shadow.getElementById("image").style.display = "none";
      this.shadow.getElementById("scroller").style.display = "block";
      this.shadow.getElementById("scroller").style.width = `${width}px`;
      this.shadow.getElementById("scroller").style.height = `${height}px`;
      this.shadow.getElementById("background").style.width = `${width * 100}px`;
      this.shadow.getElementById("background").style.height = `${height * 100}px`;
      this.shadow.getElementById("background").style.background = `url(${uri})`;
    } else {
      this.shadow.getElementById("scroller").style.display = "none";
      let image = this.shadow.getElementById("image");
      image.style.display = "block";
      image.setAttribute("src", uri);
      image.width = params.width;
      image.height = params.height;
      image.onload = e => {
        this.shadow.querySelector("fs-colorpalette").fromImage(image);
      }
    }

    let downloadLink = this.shadow.getElementById("downloadLink");
    window.test1 = uri;
    downloadLink.href = uri;
    // get the path part of the object URL.
    // URL.pathname doesn't work like HTTP URLs
    let path = uri.toString().split("/").pop();
    downloadLink.download = path + ".png";
  }

}

window.customElements.define('fs-detail', Details);
