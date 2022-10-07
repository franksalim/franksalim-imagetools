import { AppBar } from "/modules/panels/appbar.js";
import { About } from "/modules/panels/about.js";
import { TextToImage } from "/modules/panels/txt2img.js";
import { ImageToImage } from "/modules/panels/img2img.js";
import { Inpainting } from "/modules/panels/inpainting.js";
import { Drawing } from "/modules/panels/drawing.js";
import { HistoryList } from "/modules/panels/list.js";
import { Details } from "/modules/panels/detail.js";
import { ToolPicker } from "/modules/panels/toolpicker.js";

// navigate history using the j and k keys
document.addEventListener('keydown', e => {
  // but don't do anything if the user is typing in a text field
  const composedDirectTarget = e.composedPath()[0];
  if (composedDirectTarget.tagName == "INPUT" || composedDirectTarget.tagName == "TEXTAREA") {
    return;
  }
  switch (e.key) {
    case "j":
      document.getElementById("historyList").selectNext();
      break;
    case "k":
      document.getElementById("historyList").selectPrevious();
      break;
    case "Delete":
      document.getElementById("historyList").deleteSelected();
      break;
  }
});

// handle the user pasting an image
document.addEventListener('paste', async e => {
  // ignore the event if the user is typing in a text field
  const composedDirectTarget = e.composedPath()[0];
  if (composedDirectTarget.tagName == "INPUT" || composedDirectTarget.tagName == "TEXTAREA") {
    return;
  }
  const activeTool = document.querySelector('#tools > .active');
  if (e.clipboardData.files.length > 0) {
    const file = e.clipboardData.files[0];
    if (!file.type.startsWith("image/")) {
      document.getElementById("appbar").setStatus("Only images can be pasted");
      return;
    }
    if (activeTool?.setInputImage == null) {
      document.getElementById("appbar").setStatus(`<${activeTool?.localName}> does not support pasting images`);
      return;
    }
    activeTool.setInputImage(file);
    return;
  }
  // maybe they're pasting params as JSON
  const text = e.clipboardData.getData("text/plain");
  const params = JSON.parse(text); // ok if this throws
  if (activeTool?.setArgs == null) {
      document.getElementById("appbar").setStatus(`<${activeTool?.localName}> does not support pasting parameters`);
      return;
    }
    activeTool.setArgs(params);
});

if (new URLSearchParams(document.location.search).get("mode") != "development") {
  // confirm with user before unloading to prevent sad lost images
  window.onbeforeunload = function () {
    return "Really exit? Any unsaved images will be lost"
  }
}
