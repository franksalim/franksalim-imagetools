export class LoadProjectButton extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({mode: 'open'});
    shadow.innerHTML = `
      <button>Open</button>
    `;

    const button = shadow.querySelector('button');
    const list = document.querySelector('fs-list');
    button.addEventListener('click', async () => {
      const [fileHandle] = await window.showOpenFilePicker({
        types: [
          {
            description: 'JSON files',
            accept: {
              'application/json': ['.json'],
            },
          },
        ],
      });
      const file = await fileHandle.getFile();
      const text = await file.text();
      const project = JSON.parse(text);
      list.clearHistory();
      const converted = await Promise.all(
        project.history.map(async (item) => {
          const base64Url = item.uri;
          const result = await fetch(base64Url);
          const blob = await result.blob();
          const objectUrl = URL.createObjectURL(blob);
          return {...item, uri: objectUrl};
        })
      );
      for (const item of converted) {
        list.addImage(item.uri, item);
      }
    });
  }
}

window.customElements.define('fs-open-project-button', LoadProjectButton);
