import { state } from "./state.js";
import { ASSETS, TAGLINE } from "../data/marks.js";
import { clamp } from "./color.js";
import { shapeById } from "../data/shapes.js";

export function asset() {
  return ASSETS[state.asset];
}

/* Tagline sizing. */
const ROW = ((896 / 81) * 50) / 51,
  TAG_EM = 30 / ROW,
  TAG_GAP = 3;

export function taglineFits() {
  return state.asset !== "icon";
}

/* Where the tagline goes, centred under the mark; null when it is off. */
export function tagline() {
  if (!state.tagline.on || !taglineFits() || !TAGLINE.w) return null;
  const a = asset(),
    s = (TAG_EM * a.unit) / 1000;
  const w = TAGLINE.w * s,
    h = TAGLINE.h * s;
  return { x: (a.w - w) / 2, y: a.h + TAG_GAP * a.unit, w, h, s };
}

/* Everything that gets drawn: the mark, plus the tagline when it is on. */
function content() {
  const a = asset(),
    t = tagline();
  if (!t) return { w: a.w, h: a.h, x: 0 };
  const x = Math.min(0, t.x);
  return { w: Math.max(a.w, t.x + t.w) - x, h: t.y + t.h, x };
}

export function frame() {
  const a = asset(),
    c = content(),
    u = a.unit,
    pad = state.pad * u;
  let padX = pad,
    padY = pad;
  const r = shapeById(state.aspect).ratio;
  if (r) {
    const W = Math.max(c.w + 2 * pad, (c.h + 2 * pad) * r),
      H = W / r;
    padX = (W - c.w) / 2;
    padY = (H - c.h) / 2;
  }
  return {
    x: c.x - padX,
    y: -padY,
    w: c.w + 2 * padX,
    h: c.h + 2 * padY,
    a,
    u,
  };
}

/* Gradient axis across the mark itself (not the padded canvas). */
export function axis(angleDeg) {
  const a = asset(),
    rad = (angleDeg * Math.PI) / 180;
  const z = (v) => (Math.abs(v) < 1e-9 ? 0 : v);
  const dx = z(Math.cos(rad)),
    dy = z(Math.sin(rad));
  const cx = a.w / 2,
    cy = a.h / 2;
  const half = Math.abs((dx * a.w) / 2) + Math.abs((dy * a.h) / 2);
  return {
    x1: cx - dx * half,
    y1: cy - dy * half,
    x2: cx + dx * half,
    y2: cy + dy * half,
    len: 2 * half,
    dx,
    dy,
  };
}

export function snappable() {
  return state.snap && state.angle % 90 === 0;
}

export function snapOffset(p) {
  if (!snappable()) return p;
  const a = asset(),
    ax = axis(state.angle);
  const rows = ax.len / a.unit;
  if (!isFinite(rows) || rows < 2) return p;
  return clamp(Math.round(p * rows) / rows, 0, 1);
}
