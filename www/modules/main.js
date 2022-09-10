import {AppBar} from "/modules/panels/appbar.js";
import {TextToImage} from "/modules/panels/txt2img.js";
import {ImageToImage} from "/modules/panels/img2img.js";
import {FsList} from "/modules/panels/list.js";
import {Details} from "/modules/panels/detail.js";
import {ToolPicker} from "/modules/panels/toolpicker.js";

// navigate history using the j and k keys
document.addEventListener('keydown', e => {
  if (e.key === 'j') {
    document.getElementById("historyList").selectNext();
  } else if (e.key === 'k') {
    document.getElementById("historyList").selectPrevious();
  }
});
