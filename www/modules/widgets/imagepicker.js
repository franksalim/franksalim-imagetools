export class ImagePicker extends HTMLElement {
  constructor() {
    super();
    let shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <style>
        img#inputImage {
          width: 260px;
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
        const blob = e.dataTransfer.items[0].getAsFile();
        let uri = URL.createObjectURL(blob);
        inputImage.setAttribute("src", uri);
      } else  {
        let uri = e.dataTransfer.getData("text/plain");
        inputImage.setAttribute("src", uri);
      }
    });
    this.shadow = shadow;
  }

  getImageSrc() {
    return this.shadow.getElementById("inputImage").getAttribute("src");
  }
}
window.customElements.define('fs-imagepicker', ImagePicker);
