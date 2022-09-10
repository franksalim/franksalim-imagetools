export class SaveProjectButton extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({mode: 'open'});
    shadow.innerHTML = `
      <button>Save</button>
    `;

    const button = shadow.querySelector("button");
    const list = document.querySelector("fs-list");
    button.addEventListener("click", async () => {
      const history = await Promise.all(
        list.history.map(async (item) => {
          const objectUrl = item.uri;
          const result = await fetch(objectUrl);
          const blob = await result.blob();
          const reader = new FileReader();
          reader.readAsDataURL(blob);
          await new Promise((resolve) => {
            reader.addEventListener('loadend', resolve);
          });
          const base64Url = reader.result;
          return {...item, uri: base64Url};
        })
      );
      const project = {version: 1, history};
      const blob = new Blob([JSON.stringify(project)], {
        type: "application/json",
      });
      const fileHandle = await window.showSaveFilePicker({
        suggestedName: `${new Date().toISOString()}.json`,
        types: [
          {
            description: "JSON files",
            accept: {
              "application/json": [".json"],
            },
          },
        ],
      });
      const writable = await fileHandle.createWritable();
      await writable.write(blob);
      await writable.close();
    });

  }
}

window.customElements.define('fs-save-project-button', SaveProjectButton);
