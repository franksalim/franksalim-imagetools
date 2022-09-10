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
          height: calc(100vh - 80px);
          padding-bottom: 16px;
        }
        :host::-webkit-scrollbar {
          width: 0 !important;
        }
        img {
          width: 120px;
          display: inline-block;
          margin: 4px;
        }
        img.selected {
          box-shadow: 4px 4px 8px rgba(0, 0, 0, .75);
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
      this.select(img);
    });
    img.addEventListener("dragstart", e => {
      e.dataTransfer.setData("text/plain", uri);
      e.dataTransfer.dropEffect = "copy";
    });
    const selected = this.shadow.querySelector('img.selected');
    // If there is no selected image, or if the top image is selected,
    // then select our new image. Otherwise leave the user's selection alone.
    const shouldSelectNewImage =
        !selected || selected == this.shadow.querySelector('img');
    this.shadow.prepend(img);
    if (shouldSelectNewImage) {
      this.select(img);
    }
  }
  select(img) {
    this.shadow.querySelector('img.selected')?.classList.remove('selected');
    img.classList.add('selected');
    document.getElementById("detail").setImage(img.src);
    document.getElementById("detail").setArgs(img.params);
  }
  selectNext() {
    let selected = this.shadow.querySelector('img.selected');
    if (selected) {
      let next = selected.nextElementSibling;
      if (!next || next.tagName != "IMG") {
        return;
      }
      this.select(next);
      next.scrollIntoView();
    } else {
      let first = this.shadow.querySelector('img');
      if (!first) {
        return;
      }
      this.select(first);
    }
  }
  selectPrevious() {
    let selected = this.shadow.querySelector('img.selected');
    if (selected) {
      let prev = selected.previousElementSibling;
      if (!prev) {
        return;
      }
      this.select(prev);
      prev.scrollIntoView();
    }
  }
}

window.customElements.define('fs-list', FsList);
