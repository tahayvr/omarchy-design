import { loadMarks } from "./data/marks.js";
import { MODES } from "./data/modes.js";
import { state } from "./core/state.js";
import { render } from "./render/stage.js";
import { $ } from "../shared/dom.js";
import { seg } from "../shared/widgets.js";
import { buildFill, buildFx, buildCanvas, buildTagline } from "./ui/panels.js";
import { initPresetTracks, paintPresets } from "./ui/presetTracks.js";
import { applyPreset, pickMode, pickAsset, ASSET_LIST } from "./app/actions.js";
import { STYLES } from "./data/presets.js";

const DEFAULT_STYLE = "omarchystep";
import { initToolbar } from "./features/toolbar.js";
import { initExport } from "./features/export.js";

async function boot() {
  try {
    await loadMarks();
  } catch (err) {
    console.error(err);
    const msg = document.createElement("div");
    msg.className = "error";
    msg.textContent =
      "couldn't load the marks from assets/marks/ — serve this folder over http (see README)";
    $("stage").replaceChildren(msg);
    return;
  }

  initPresetTracks(applyPreset);
  seg($("assetSeg"), ASSET_LIST, state.asset, pickAsset);
  seg($("modeSeg"), MODES, state.mode, pickMode);
  buildFill();
  buildFx();
  buildCanvas();
  buildTagline();
  render();
  paintPresets();
  const style = STYLES.find((p) => p.id === DEFAULT_STYLE);
  if (style) applyPreset(style);

  initToolbar();
  initExport();
}

boot();
