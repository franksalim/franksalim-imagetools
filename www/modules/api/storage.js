export class SaveLoad {
  static async saveProject() {
    const list = document.querySelector("fs-list");
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
  }

  static async loadProject() {
    const list = document.querySelector('fs-list');
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
  }
}
