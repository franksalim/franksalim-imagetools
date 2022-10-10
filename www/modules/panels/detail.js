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
        fs-colorpalette {
          padding: 16px 0px;
        }
        button, a {
          height: 60px;
          width: 60px;
          border: 0px;
          background: none;
          text-decoration: none;
        }
        button img, a img {
          height: 40px;
          width: 40px;
          opacity: .5;
        }
        #args {
          max-width: 448px;
        }
      </style>
      <img id=image>
      <div id="controls" hidden>
        <button id=openButton title="Open prompt in txt2img">
          <img src=/assets/edit_document_FILL0_wght400_GRAD0_opsz48.svg>
        </button>
        <a id=downloadLink>
          <img src=assets/download_FILL0_wght400_GRAD0_opsz48.svg>
        </a>
        <button id=img2imgButton title="Open in img2img">
          <img src=/assets/imagesmode_FILL0_wght400_GRAD0_opsz48.svg>
        </button>
        <button id=inpaintingButton title="Open in inpainting">
          <img src=/assets/brush_FILL0_wght400_GRAD0_opsz48.svg>
        </button>
        <button id=wallpaperButton title="View tiled image as wallpaper">
          <img src=/assets/wallpaper_FILL0_wght400_GRAD0_opsz48.svg>
        </button>
        <button id=drawButton title="Draw on this image">
          <img src=/assets/draw_FILL0_wght400_GRAD0_opsz48.svg>
        </button>
      </div>
      <fs-colorpalette></fs-colorpalette>
      <p id=args></p>
    `;

    this.shadow = shadow;
    shadow.getElementById("openButton").addEventListener("click", e => {
      let s = shadow.getElementById("args").innerText;
      document.getElementById("txt2img").setArgs(JSON.parse(s));
    });
    shadow.getElementById("img2imgButton").addEventListener("click", e => {
      const tool = document.getElementById("img2img");
      const image = this.shadow.getElementById("image");
      tool.setInputSrc(image.getAttribute("src"));
      document.querySelector("fs-toolpicker").switchTool("img2img");
    });
    shadow.getElementById("inpaintingButton").addEventListener("click", e => {
      const tool = document.getElementById("inpainting");
      const image = this.shadow.getElementById("image");
      tool.setInputSrc(image.getAttribute("src"));
      document.querySelector("fs-toolpicker").switchTool("inpainting");
    });
    shadow.getElementById("drawButton").addEventListener("click", e => {
      const tool = document.getElementById("drawing");
      const image = this.shadow.getElementById("image");
      tool.setInputSrc(image.getAttribute("src"));
      document.querySelector("fs-toolpicker").switchTool("drawing");
    });
    shadow.getElementById("wallpaperButton").addEventListener("click", e => {
      const image = this.shadow.getElementById("image");
      const src = image.getAttribute("src");
      window.open("/wallpaper.html?" + src);
    });
  }

  setImage(uri, args) {
    this.style.display = "block";
    this.shadow.getElementById("args").innerText = JSON.stringify(args);
    this.shadow.getElementById("controls").removeAttribute("hidden");

    if (args.tiled) {
      this.shadow.getElementById("wallpaperButton").style.display = "";
    } else {
      this.shadow.getElementById("wallpaperButton").style.display = "none";
    }

    let image = this.shadow.getElementById("image");
    image.setAttribute("src", uri);
    image.onload = e => {
      this.shadow.querySelector("fs-colorpalette").fromImage(image);
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
