export class Chip extends HTMLElement {
  static dragged;
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
      </style>
      ⋮<button id=removeButton>X</button><input type=text id=input>
    `;
    this.shadow = shadow;
    this.input = shadow.getElementById("input");

    shadow.getElementById("input");
    shadow.getElementById("removeButton").addEventListener("click", e => {
      const event = new Event("delete");
      this.dispatchEvent(event);
    });

    this.addEventListener("dragstart", e => {
      e.dataTransfer.dropEffect = "move";
      Chip.dragged = this;
    });

    this.addEventListener("dragover", e => {
      e.preventDefault();
    });

    this.addEventListener("drop", e => {
      e.preventDefault();
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
