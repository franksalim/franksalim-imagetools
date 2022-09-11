import {AppBar} from "/modules/panels/appbar.js";
import {TextToImage} from "/modules/panels/txt2img.js";
import {ImageToImage} from "/modules/panels/img2img.js";
import {Inpainting} from "/modules/panels/inpainting.js";
import {Drawing} from "/modules/panels/drawing.js";
import {FsList} from "/modules/panels/list.js";
import {Details} from "/modules/panels/detail.js";
import {ToolPicker} from "/modules/panels/toolpicker.js";

// navigate history using the j and k keys
document.addEventListener('keydown', e => {
  // but don't do anything if the user is typing in a text field
  const composedDirectTarget = e.composedPath()[0];
  if (composedDirectTarget.tagName == "INPUT" || composedDirectTarget.tagName == "TEXTAREA") {
    return;
  }
  switch(e.key) {
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
