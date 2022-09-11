export class Slider extends HTMLElement {
  #slider;
  #display;

  constructor() {
    super();
    const shadow = this.attachShadow({mode: "open"});
    shadow.innerHTML = `
      <style>
        :host {
          display: flex;
        }
        #slider {
          flex: 1;
        }
        #display {
          font-size: 12px;
          width: 8ch;
          background: none;
          border: none;
        }
        #display:hover, #display:focus {
          background: white;
        }
      </style>

      <input type=range id=slider>
      <input type=number id=display>
    `;

    this.#slider = shadow.getElementById("slider");
    this.#slider.addEventListener("input", () => {
      this.value = this.#slider.value;
    });

    this.#display = shadow.getElementById("display");
    this.#display.addEventListener("change", () => {
      this.value = this.#display.value;
    });
    this.#display.addEventListener("focus", () => {
      this.#display.select();
    });
    this.addEventListener("wheel", e => {
      if (e.deltaY > 0) {
        this.value -= this.step;
      } else if (e.deltaY < 0) {
        this.value += this.step;
      }
      this.dispatchEvent(new Event("input"));
    });

    // Defaults
    this.value = 0;
    this.min = 0;
    this.max = 100;
    this.step = 1;

    this.#updateDisplay();
  }

  static get observedAttributes() {
    return ["value", "step", "min", "max"];
  }

  attributeChangedCallback(name, oldValue, newValue) {
    this[name] = newValue;
  }

  #updateDisplay() {
    this.#display.value = this.value;
  }

  get value() { return Number(this.#slider.value);}
  set value(value) {
    this.#slider.value = value;
    this.#display.value = value;
    this.#updateDisplay();
  }

  get step() { return Number(this.#slider.step); }
  set step(value) {
    this.#slider.step = value;
    this.#display.step = value;
    this.#updateDisplay();
  }

  get min() { return Number(this.#slider.min); }
  set min(value) {
    this.#slider.min = value;
    this.#display.min = value;
    this.#updateDisplay();
  }

  get max() { return Number(this.#slider.max); }
  set max(value) {
    this.#slider.max = value;
    this.#display.max = value;
    this.#updateDisplay();
  }
}

window.customElements.define("fs-slider", Slider);
