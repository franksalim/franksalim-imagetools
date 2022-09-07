export class PromptBuilder extends HTMLElement {
  constructor() {
    super();
    let shadow = this.attachShadow({mode: 'open'});
    shadow.innerHTML = `
      <link rel=stylesheet href=style.css>
      <style>
        :host {
          display: block;
          border: 1px solid #888;
          padding: 4px;
          margin: 4px;
        }
        </style>
      <div id=chips></div>
    `;
    this.shadow = shadow;
  }

  setEditor(ed) {
    this.ed = ed;
    this.updateChips(ed.value);
    ed.addEventListener("input", e => { this.updateChips(e.target.value) });
  }

  updateChips(text) {
    let chips = this.shadow.getElementById("chips");
    chips.innerHTML = "";

    for (const term of text.split(", ")) {
      let chip = document.createElement("button");
      chip.innerText = term;
      chip.addEventListener("click", e => {
        chip.remove();
        this.updateEditor(chips);
      });
      chips.appendChild(chip);
    }
  }

  updateEditor(chips) {
    let prompt = "";
    let terms = [];
    for (const chip of chips.childNodes) {
      terms.push(chip.innerText);
    }
    prompt = terms.join(", ");
    this.ed.value = prompt;
  }
}
window.customElements.define('fs-promptbuilder', PromptBuilder);
