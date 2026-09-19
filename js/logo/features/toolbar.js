import { state } from "../core/state.js";
import { STYLES, THEMES } from "../data/presets.js";
import { render } from "../render/stage.js";
import { syncAnim } from "../render/animation.js";
import { $ } from "../../shared/dom.js";
import { buildFill } from "../ui/panels.js";
import { applyPreset } from "../app/actions.js";

function shuffle() {
  const pool = STYLES.concat(THEMES);
  const p = pool[Math.floor(Math.random() * pool.length)];
  applyPreset(p);
  if (state.mode === "holo") state.holo.hue = Math.floor(Math.random() * 360);
  if (state.mode === "linear") state.angle = [0, 90, 180, 270][Math.floor(Math.random() * 4)];
  buildFill();
  render();
}

export function initToolbar() {
  $("btnPlay").onclick = () => {
    state.anim = !state.anim;
    syncAnim();
  };
  syncAnim();

  $("btnShuffle").onclick = shuffle;
}
