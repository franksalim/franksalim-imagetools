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

    this.input.addEventListener("keydown", e => {
      switch(e.which) {
        case 13: // pressing enter adds another chip
          let newChip = document.createElement("fs-chip");
          this.after(newChip);
          newChip.addEventListener("input", e => {
            this.parentNode.parentNode.host.updateEditor();
          });
          newChip.focus();
          break;
        case 8: // backspace deletes empty chips
          if (this.input.value == "") {
            let other = this.previousElementSibling;
            setTimeout(() => {other?.focus()}, 0);
            this.remove();
          }
          break;
        case 46: // delete
          if (this.input.value == "") {
            let other = this.nextElementSibling;
            setTimeout(() => {other?.focus()}, 0);
            this.remove();
          }
          break;
        case 38: // up
          this.previousElementSibling?.focus();
          break;
        case 40: // down
          this.nextElementSibling?.focus();
          break;
      }
      this.parentNode?.parentNode?.host.updateEditor();
    });

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
      this.fireInputEvent();
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
      this.fireInputEvent();
    });
  }

  setValue(value) {
    this.draggable = true;
    this.input.value = value;
  }

  getValue() {
    return this.input.value;
  }

  focus() {
    this.input.focus();
  }

  fireInputEvent() {
    const event = new Event("input");
    this.dispatchEvent(event);
  }
}
window.customElements.define('fs-chip', Chip);
