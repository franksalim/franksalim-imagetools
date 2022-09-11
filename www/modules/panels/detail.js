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
      </style>
      <div id=scroller>
        <div id=background></div>
      </div>
      <img id=image>
      <p id=args></p>
      <div id="controls" hidden>
        <button id=openButton>Open in Prompt Builder</button>
        <a id=downloadLink>Download</a>
      </div>
    `;

    this.shadow = shadow;
    shadow.getElementById("openButton").addEventListener("click", e => {
      let s = shadow.getElementById("args").innerText;
      document.getElementById("txt2img").setArgs(JSON.parse(s));
    });
  }

  setImage(uri, args) {
    this.style.display = "block";
    this.shadow.getElementById("args").innerText = JSON.stringify(args);
    this.shadow.getElementById("controls").removeAttribute("hidden");

    if (args.tiled) {
      // Need to make #scroller the size of the image and then make
      // #image 3x that size, with #scroller set to overflow: scroll.
      // That way we can see that the image tiles properly.
      const {width, height} = args;
      this.shadow.getElementById("image").style.display = "none";
      this.shadow.getElementById("scroller").style.display = "block";
      this.shadow.getElementById("scroller").style.width = `${width}px`;
      this.shadow.getElementById("scroller").style.height = `${height}px`;
      this.shadow.getElementById("background").style.width = `${width * 100}px`;
      this.shadow.getElementById("background").style.height = `${height * 100}px`;
      this.shadow.getElementById("background").style.background = `url(${uri})`;
    } else {
      this.shadow.getElementById("scroller").style.display = "none";
      this.shadow.getElementById("image").style.display = "block";
      this.shadow.getElementById("image").setAttribute("src", uri);
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
