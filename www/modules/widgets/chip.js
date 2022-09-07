export class Chip extends HTMLElement {
  constructor() {
    super();
    let shadow = this.attachShadow({mode: 'open'});
    shadow.innerHTML = `
      <input type=text id=input><button id=removeButton>❌</button>
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
