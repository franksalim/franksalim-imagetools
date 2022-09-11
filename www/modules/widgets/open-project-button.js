export class LoadProjectButton extends HTMLElement {
  constructor() {
    super();
    const shadow = this.attachShadow({mode: 'open'});
    shadow.innerHTML = `
      <style>
        button {
          height: 60px;
          width: 60px;
          border: 0px;
          outline: 0px;
          margin: 0px ;
          background: none;
          position: relative;
          z-index: 9;
        }
        button img {
          height: 40px;
          width: 40px;
          opacity: .5;
        }
      </style>
      <button><img src=/assets/folder_open_FILL0_wght400_GRAD0_opsz48.svg></button>
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
