export class StableDiffusion {
  static async generateImageFromText(params) {
    const response = await fetch("/generate/", {
      method: "POST",
      cache: "no-cache",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params)
    });
    return URL.createObjectURL(await response.blob());
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
    return URL.createObjectURL(await response.blob());
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
    return URL.createObjectURL(await response.blob());
  }
}
