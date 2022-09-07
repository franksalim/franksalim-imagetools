export class Chip extends HTMLElement {
  constructor() {
    super();
    let shadow = this.attachShadow({mode: 'open'});
    shadow.innerHTML = `
      <style>
        :host {
          display: block;
          margin: 2px;
          padding: 2px;
          border: 1px solid black;
          border-radius: 4px;
        }
        input {
          background: none;
          border: none;
          outline: none;
          margin-left: 16px;
        }
      </style>
      <button id=removeButton>X</button><input type=text id=input>
    `;
    this.shadow = shadow;
    this.input = shadow.getElementById("input");

    shadow.getElementById("input");
    shadow.getElementById("removeButton").addEventListener("click", e => {
      const event = new Event("delete");
      this.dispatchEvent(event);
    });
  }

  setValue(value) {
    this.input.value = value;
  }

  getValue() {
    return this.input.value;
  }
}
window.customElements.define('fs-chip', Chip);
