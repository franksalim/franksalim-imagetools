export class StableDiffusion {
  static async generateImageFromText(params) {
    const response = await fetch("/generate/", {
      method: "POST",
      cache: "no-cache",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params)
    });
    let uri = URL.createObjectURL(await response.blob());
    document.getElementById("historyList").addImage(uri, params);
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
}
