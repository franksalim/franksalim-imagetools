export class ImagePicker extends HTMLElement {
  constructor() {
    super();
    let shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <style>
        img#inputImage {
          display: block;
          min-width: 260px;
          min-height: 100px;
          outline: 1px solid #888;
          background-color: #ddd;
        }
      </style>
      <img id=inputImage>
      <input type=file id=filepicker>
    `
    const inputImage = shadow.getElementById("inputImage");
    shadow.getElementById("filepicker").addEventListener("change", e => {
      const blob = e.target.files[0];
      let uri = URL.createObjectURL(blob);
      inputImage.setAttribute("src", uri);
      this.dispatchEvent(new Event("input"));
    });
    inputImage.addEventListener("dragover", e => {
      e.preventDefault();
    });
    inputImage.addEventListener("drop", e => {
      e.preventDefault();

      if (!e.dataTransfer.items.length) {
        return;
      }

      if (e.dataTransfer.items[0].kind == "file") {
        this.setImageFile(e.dataTransfer.items[0].getAsFile());
      } else  {
        let uri = e.dataTransfer.getData("text/plain");
        inputImage.setAttribute("src", uri);
        this.dispatchEvent(new Event("input"));
      }
    });
    this.shadow = shadow;
  }

  getImageSrc() {
    return this.shadow.getElementById("inputImage").getAttribute("src");
  }

  /** @param {File} file */
  setImageFile(file) {
    let uri = URL.createObjectURL(file);
    this.shadow.getElementById("inputImage").setAttribute("src", uri);
    this.dispatchEvent(new Event("input"));
  }
}
window.customElements.define('fs-imagepicker', ImagePicker);
