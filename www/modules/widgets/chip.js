export class Chip extends HTMLElement {
  static dragged;
  visibility = true;
  constructor() {
    super();
    let shadow = this.attachShadow({mode: 'open'});
    shadow.innerHTML = `
      <style>
        :host {
          display: block;
          margin: 2px;
          padding: 2px;
          border: 1px solid #888;
          border-radius: 4px;
          cursor: pointer;
        }
        input {
          background: none;
          border: none;
          outline: none;
          margin-left: 16px;
        }
        img {
          opacity: 0.5;
          width: 16px;
        }
      </style>
      ⋮<button id=removeButton>X</button><input type=text id=input><img src="/assets/visibility_FILL0_wght400_GRAD0_opsz48.svg" id=visibility>
    `;
    this.shadow = shadow;
    this.input = shadow.getElementById("input");

    shadow.getElementById("input");
    shadow.getElementById("removeButton").addEventListener("click", e => {
      const event = new Event("delete");
      this.dispatchEvent(event);
    });

    shadow.getElementById("visibility").addEventListener("click", e => {
      this.visibility = !this.visibility;
      if (this.visibility) {
        e.target.src = "/assets/visibility_FILL0_wght400_GRAD0_opsz48.svg";
      } else {
        e.target.src = "/assets/visibility_off_FILL0_wght400_GRAD0_opsz48.svg";
      }
      const event = new Event("input");
      this.dispatchEvent(event);
    });

    this.addEventListener("dragstart", e => {
      e.dataTransfer.dropEffect = "move";
      Chip.dragged = this;
    });

    this.addEventListener("dragover", e => {
      e.preventDefault();
      this.style.backgroundColor = "white";
    });

    this.addEventListener("dragleave", e => {
      e.preventDefault();
      this.style.backgroundColor = "";
    });

    this.addEventListener("dragend", e => {
      e.preventDefault();
      this.style.backgroundColor = "";
    });

    this.addEventListener("drop", e => {
      e.preventDefault();
      this.style.backgroundColor = "";
      if (e.target == Chip.dragged) {
        return;
      }

      // if dropped on the top half of the row, insert before
      let isAbove = e.y < e.target.getBoundingClientRect().top +
        e.target.offsetHeight/2;

      Chip.dragged.remove();
      if (isAbove) {
        e.target.parentNode.insertBefore(Chip.dragged, e.target);
      } else {
        e.target.after(Chip.dragged);
      }
      const event = new Event("input");
      this.dispatchEvent(event);
    });
  }

  setValue(value) {
    this.draggable = true;
    this.input.value = value;
  }

  getValue() {
    return this.input.value;
  }
}
window.customElements.define('fs-chip', Chip);
