import { Chip } from "/modules/widgets/chip.js";

export class PromptBuilder extends HTMLElement {
  static get observedAttributes() { return ["value"]; }

  constructor() {
    super();
    let shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <style>
        :host {
          display: block;
          padding: 4px;
          margin: 4px;
        }
        textarea {
          width: 98%;
        }
        </style>
      <div id=chips></div>
      <textarea id=ed placeholder="prompt"></textarea>
    `;
    this.shadow = shadow;
    this.ed = shadow.getElementById("ed");
    this.updateChips(this.ed.value);
    this.ed.addEventListener("input", e => { this.updateChips(e.target.value) });
    if (this.getAttribute("placeholder")) {
      this.ed.setAttribute("placeholder", this.getAttribute("placeholder"));
    }
  }

  updateChips(text) {
    let chips = this.shadow.getElementById("chips");
    chips.innerHTML = "";

    for (const term of text.split(", ").filter(Boolean)) {
      let chip = document.createElement("fs-chip");
      chip.setValue(term);

      chip.addEventListener("input", e => {
        this.updateEditor();
      });
      chip.addEventListener("delete", e => {
        chip.remove();
        this.updateEditor();
      });
      chips.appendChild(chip);
    }
    this.value = this.ed.value;
  }

  updateEditor() {
    let chips = this.shadow.getElementById("chips");
    let prompt = "";
    let terms = [];
    for (const chip of chips.childNodes) {
      // skip hidden terms
      if (chip.visibility) {
        terms.push(chip.getValue());
      }
    }
    prompt = terms.join(", ");
    this.ed.value = prompt;
    this.value = prompt;
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name == "value") {
      this.ed.value = newValue;
      this.updateChips(newValue);
    }
  }
}
window.customElements.define('fs-promptbuilder', PromptBuilder);
