import { state } from "./state.js";
import { asset, snapOffset } from "./geometry.js";
import { hslToHex, hexToHsl, mix } from "../../shared/color.js";

export function sortedStops() { return state.stops.slice().sort((a, b) => a.p - b.p); }

export function rampStops() {
  return sortedStops().map(s => ({ o: snapOffset(s.p), c: s.c }));
}

/* The stepped material is a brand rule, not a free-form ramp: five bands,
   always vertical, light at the top, in exactly 4·3·4·3·5 proportion as
   measured off the reference wordmark. Colours are editable; the
   proportions and direction are not. */
export const BAND_RATIO = Object.freeze([4, 3, 4, 3, 5]);
export const BAND_TOTAL = BAND_RATIO.reduce((a, b) => a + b, 0);
export const STEP_ANGLE = 90;

export function bandOffsets() {
  const o = []; let acc = 0;
  for (let i = 0; i < BAND_RATIO.length; i++) { o.push(acc / BAND_TOTAL); acc += BAND_RATIO[i]; }
  o.push(1); return o;
}

export function bandColors() {
  const c = state.stops.slice(0, BAND_RATIO.length).map(s => s.c);
  while (c.length < BAND_RATIO.length) c.push(c[c.length - 1] || "#ffffff");
  return c;
}

export function stepStops() {
  const O = bandOffsets(), C = bandColors(), out = [];
  for (let i = 0; i < BAND_RATIO.length; i++) {
    out.push({ o: O[i], c: C[i] }, { o: O[i + 1], c: C[i] });
  }
  return out;
}

export function bandRows() {
  const a = asset(), rows = a.h / a.unit;
  return BAND_RATIO.map(r => r / BAND_TOTAL * rows);
}

/* Light-to-dark ladder around a theme accent. The proportions come from the
   reference wordmark, whose middle band is the Hackerman theme accent. */
export function ladder(accent) {
  const { h, s, l } = hexToHsl(accent), hi = 95, lo = 8;
  return [
    hslToHex(h,     s,        l + (hi - l) * 0.78),
    hslToHex(h,     s,        l + (hi - l) * 0.30),
    hslToHex(h,     s,        l),
    hslToHex(h + 2, s * 0.35, l - (l - lo) * 0.40),
    hslToHex(h + 7, s * 0.33, l - (l - lo) * 0.76),
  ];
}

export function sampleRamp(S, t) {
  if (S.length === 0) return "#ffffff";
  if (S.length === 1 || t <= S[0].p) return S[0].c;
  if (t >= S[S.length - 1].p) return S[S.length - 1].c;
  for (let i = 0; i < S.length - 1; i++) {
    if (t >= S[i].p && t <= S[i + 1].p) {
      const k = (t - S[i].p) / Math.max(S[i + 1].p - S[i].p, 1e-6);
      return mix(S[i].c, S[i + 1].c, k);
    }
  }
  return S[0].c;
}

export function bandsFromAccent(accent) {
  const O = bandOffsets();
  state.accent = accent;
  state.stops = ladder(accent).map((c, i) => ({ c, p: O[i] }));
  state.sel = 0;
}

/* The fill's signature colour: the accent band, the solid colour, the
   ramp's midpoint, or the holo base hue. */
export function signatureColour() {
  if (state.mode === "stepped") return bandColors()[2];
  if (state.mode === "solid") return state.solid;
  if (state.mode === "holo") return hslToHex(state.holo.hue, state.holo.sat, state.holo.light);
  return sampleRamp(sortedStops(), .5);
}

/* entering stepped mode from another material: take the colour the current
   fill has at the middle band and build the bands from it */
export function toBands() {
  const O = bandOffsets(), S = sortedStops();
  const mid = (O[2] + O[3]) / 2;
  const accent = state.mode === "solid" ? state.solid : sampleRamp(S, mid);
  bandsFromAccent(accent);
}

/* entering solid from another material: carry over the colour the mark already
   reads as, so stepped hands over its accent and not its lightest band */
export function toSolid() { state.solid = signatureColour(); }

export function holoStops() {
  const H = state.holo, out = [];
  const steps = [0, .14, .28, .42, .56, .7, .85, 1];
  const arc = 300;
  steps.forEach(t => {
    const h = H.hue + t * arc;
    const l = H.light + Math.sin(t * Math.PI * 2.2) * 13;
    const s = H.sat - Math.abs(Math.sin(t * Math.PI * 1.6)) * 16;
    out.push({ o: t, c: hslToHex(h, s, l) });
  });
  return out;
}
