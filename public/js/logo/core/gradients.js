import { state } from "./state.js";
import { asset, snapOffset } from "./geometry.js";
import { hslToHex, mix } from "../../shared/color.js";
import { BAND_RATIO, BAND_TOTAL, bandOffsets, ladder } from "./bands.js";

/* the band rule lives in bands.js so the docs can render from it too */
export { BAND_RATIO, BAND_TOTAL, bandOffsets, ladder } from "./bands.js";

export function sortedStops() {
  return state.stops.toSorted((a, b) => a.p - b.p);
}

export function rampStops() {
  return sortedStops().map((s) => ({ o: snapOffset(s.p), c: s.c }));
}

export function bandColors() {
  const c = state.stops.slice(0, BAND_RATIO.length).map((s) => s.c);
  while (c.length < BAND_RATIO.length) c.push(c[c.length - 1] || "#ffffff");
  return c;
}

export function bandRows() {
  const a = asset(),
    rows = a.h / a.unit;
  return BAND_RATIO.map((r) => (r / BAND_TOTAL) * rows);
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

/* The fill's signature color: the accent band, the solid color, the
   ramp's midpoint, or the holo base hue. */
export function signaturecolor() {
  if (state.mode === "stepped") return bandColors()[2];
  if (state.mode === "solid") return state.solid;
  if (state.mode === "holo") return hslToHex(state.holo.hue, state.holo.sat, state.holo.light);
  return sampleRamp(sortedStops(), 0.5);
}

/* entering stepped mode from another material: take the color the current
   fill has at the middle band and build the bands from it */
export function toBands() {
  const O = bandOffsets(),
    S = sortedStops();
  const mid = (O[2] + O[3]) / 2;
  const accent = state.mode === "solid" ? state.solid : sampleRamp(S, mid);
  bandsFromAccent(accent);
}

/* entering solid from another material: carry over the color the mark already
   reads as, so stepped hands over its accent and not its lightest band */
export function toSolid() {
  state.solid = signaturecolor();
}

export function holoStops() {
  const H = state.holo,
    out = [];
  const steps = [0, 0.14, 0.28, 0.42, 0.56, 0.7, 0.85, 1];
  const arc = 300;
  steps.forEach((t) => {
    const h = H.hue + t * arc;
    const l = H.light + Math.sin(t * Math.PI * 2.2) * 13;
    const s = H.sat - Math.abs(Math.sin(t * Math.PI * 1.6)) * 16;
    out.push({ o: t, c: hslToHex(h, s, l) });
  });
  return out;
}
