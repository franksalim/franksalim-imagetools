export class StableDiffusion {
  static async generateImageFromText(params) {
    let img = undefined;
    const ws = new WebSocket("ws://" + location.host + "/generate/");
    ws.binarytype = "blob";
    ws.onopen = e => {
      ws.send(JSON.stringify(params));
    }
    ws.onmessage = e => {
      let uri = URL.createObjectURL(e.data);
      if (!img) {
        img = document.getElementById("historyList").addImage(uri, params);
      } else {
        img.setAttribute("src", uri);
        document.getElementById("detail").setImage(uri, params);
      }
    }
    ws.onclose = e => {
      console.log(e);
    }
  }

  static async generateImageFromImage(imageBlob, params) {
    let formData = new FormData();
    formData.append("params", JSON.stringify(params));
    formData.append("initImage", imageBlob);

    const response = await fetch("/img2img/", {
      method: "POST",
      cache: "no-cache",
      body: formData
    });
    let uri = URL.createObjectURL(await response.blob());
    document.getElementById("historyList").addImage(uri, params);
  }

  static async inpaint(imageBlob, maskBlob, params) {
    let formData = new FormData();
    formData.append("params", JSON.stringify(params));
    formData.append("initImage", imageBlob);
    formData.append("maskImage", maskBlob);

    const response = await fetch("/inpaint/", {
      method: "POST",
      cache: "no-cache",
      body: formData
    });
    let uri = URL.createObjectURL(await response.blob());
    document.getElementById("historyList").addImage(uri, params);
  }
}
