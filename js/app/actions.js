import { state, defaultFx, defaultBg } from "../core/state.js";
import { bandOffsets, toBands, toSolid } from "../core/gradients.js";
import { MODES } from "../data/modes.js";
import { render } from "../render/stage.js";
import { $ } from "../ui/dom.js";
import { seg } from "../ui/widgets.js";
import { buildFill, buildFx, buildCanvas, buildTagline } from "../ui/panels.js";
import { paintPresets } from "../ui/presetTracks.js";

export function applyPreset(p) {
  state.preset = p.id;
  state.mode = p.mode;
  if (p.cols) {
    state.stops = p.cols.map((c, i) => ({ c, p: bandOffsets()[i] }));
    state.accent = p.cols[2];                 /* middle band is the accent */
  }
  else if (p.stops) {
    state.stops = p.stops.map(s => ({ c: s.c, p: s.p }));
    if (p.mode === "solid") state.solid = p.stops[0].c;
  }
  if (p.angle !== undefined) state.angle = p.angle;
  if (p.snap !== undefined) state.snap = p.snap;
  if (p.holo)  state.holo = Object.assign({}, state.holo, p.holo);
  state.fx = p.fx ? Object.assign({}, p.fx) : defaultFx();
  state.bg = p.bg ? Object.assign({}, p.bg) : defaultBg();
  state.tagline.c = p.text || "#ffffff";   /* themes carry omarchy.org's text colour */
  state.sel = 0;
  seg($("modeSeg"), MODES, state.mode, pickMode);
  buildFill(); buildFx(); buildCanvas(); buildTagline(); render(); paintPresets();
}

export function pickMode(id) {
  if (id === "stepped" && state.mode !== "stepped") toBands();
  if (id === "solid" && state.mode !== "solid") toSolid();
  state.mode = id; state.preset = null;
  seg($("modeSeg"), MODES, id, pickMode);
  buildFill(); render(); paintPresets();
}

export const ASSET_LIST = [
  { id: "wordmark", label: "wordmark" }, { id: "icon", label: "icon" },
  { id: "lockup", label: "lockup" },
];

export function pickAsset(id) {
  state.asset = id;
  seg($("assetSeg"), ASSET_LIST, id, pickAsset);
  buildFill(); buildTagline(); render(); paintPresets();
}
