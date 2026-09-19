import { state, defaultFx, defaultBg } from "../core/state.js";
import { bandOffsets } from "../core/gradients.js";
import { buildSVG } from "../core/svg.js";
import { STYLES, THEMES } from "../data/presets.js";
import { $, div, span, button } from "../../shared/dom.js";

const TABS = [
  { id: "styles", tab: "tabStyles", track: "styleTrack", list: STYLES },
  { id: "themes", tab: "tabThemes", track: "themeTrack", list: THEMES },
];
let activeTab = "styles";
let onPick = () => {};

export function initPresetTracks(handler) {
  onPick = handler;
  TABS.forEach(t => { $(t.tab).onclick = () => showTab(t.id); });
}

export function showTab(id) {
  activeTab = id;
  TABS.forEach(t => {
    const on = t.id === id;
    $(t.tab).setAttribute("aria-selected", String(on));
    $(t.track).hidden = !on;
  });
}

/* Render a preset small, using a temporary state and restoring afterwards.
   The snapshot is shallow on purpose: every field below is *replaced* (never
   mutated) while the thumbnail renders, so restoring the original references
   keeps the objects the live controls hold on to. */
function thumbFor(p) {
  const snapshot = { ...state };
  state.mode = p.mode;
  if (p.cols)       state.stops = p.cols.map((c, i) => ({ c, p: bandOffsets()[i] }));
  else if (p.stops) {
    state.stops = p.stops.map(s => ({ c: s.c, p: s.p }));
    if (p.mode === "solid") state.solid = p.stops[0].c;
  }
  state.angle = p.angle !== undefined ? p.angle : 90;
  state.snap = p.snap !== undefined ? p.snap : true;
  if (p.holo)  state.holo = Object.assign({}, state.holo, p.holo);
  state.fx = p.fx ? Object.assign({}, p.fx) : defaultFx();
  state.bg = p.bg ? Object.assign({}, p.bg) : defaultBg();
  state.pad = .7; state.aspect = "auto"; state.phase = .18;
  state.tagline = { ...state.tagline, on: false };
  state.asset = state.asset === "icon" ? "icon" : "wordmark";
  const svg = buildSVG();
  svg.removeAttribute("width"); svg.removeAttribute("height");
  Object.assign(state, snapshot);
  return svg;
}

export function paintPresets() {
  /* keep the active tile visible: follow the preset to its tab */
  const home = TABS.find(t => t.list.some(p => p.id === state.preset));
  if (home && home.id !== activeTab) showTab(home.id);

  TABS.forEach(({ track: id, list }) => {
    const track = $(id);
    track.replaceChildren();
    list.forEach(p => {
      const b = button("pchip", undefined, () => onPick(p));
      b.setAttribute("aria-pressed", String(state.preset === p.id));
      const th = div("thumb");
      th.appendChild(thumbFor(p));
      b.append(th, span("nm", p.name));
      track.appendChild(b);
    });
  });
}
