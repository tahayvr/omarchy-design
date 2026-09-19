import { state } from "./state.js";
import { frame, axis, tagline } from "./geometry.js";
import { TAGLINE } from "../data/marks.js";
import { clamp } from "./color.js";
import { rampStops, stepStops, holoStops, STEP_ANGLE } from "./gradients.js";

export const SVGNS = "http://www.w3.org/2000/svg";

let uid = 0;

export function el(name, attrs, kids) {
  const n = document.createElementNS(SVGNS, name);
  for (const k in attrs) { if (attrs[k] !== undefined && attrs[k] !== null) n.setAttribute(k, attrs[k]); }
  if (kids) n.innerHTML = kids;
  return n;
}

export function linearGrad(id, stops, ax, extra) {
  const g = el("linearGradient", Object.assign({
    id, gradientUnits: "userSpaceOnUse",
    x1: ax.x1.toFixed(2), y1: ax.y1.toFixed(2), x2: ax.x2.toFixed(2), y2: ax.y2.toFixed(2),
  }, extra || {}));
  stops.forEach(s => {
    const st = el("stop", { offset: clamp(s.o, 0, 1).toFixed(4), "stop-color": s.c });
    if (s.a !== undefined) st.setAttribute("stop-opacity", s.a);
    g.appendChild(st);
  });
  return g;
}

/* shorten an axis to one cycle and slide it by phase — gives seamless motion */
export function cycleAxis(cycles, phase, mode) {
  const ax = axis(state.angle);
  const L = ax.len / Math.max(cycles, .05);
  const ux = (ax.x2 - ax.x1) / ax.len, uy = (ax.y2 - ax.y1) / ax.len;
  const off = phase * L * (mode === "reflect" ? 2 : 1);
  return { x1: ax.x1 + ux * off, y1: ax.y1 + uy * off, x2: ax.x1 + ux * (off + L), y2: ax.y1 + uy * (off + L), len: L };
}

export function buildSVG() {
  const st = state;
  const f = frame(), a = f.a;
  const P = "f" + (++uid) + "_";
  const svg = el("svg", {
    xmlns: SVGNS, viewBox: `${f.x} ${f.y} ${f.w} ${f.h}`,
    width: f.w, height: f.h, fill: "none",
  });
  const defs = el("defs");
  svg.appendChild(defs);

  const mask = el("mask", { id: P + "m", maskUnits: "userSpaceOnUse", x: f.x, y: f.y, width: f.w, height: f.h });
  mask.appendChild(el("g", { fill: "#fff" }, a.content));
  defs.appendChild(mask);

  if (st.bg.mode === "solid") {
    svg.appendChild(el("rect", { x: f.x, y: f.y, width: f.w, height: f.h, fill: st.bg.c1 }));
  } else if (st.bg.mode === "gradient") {
    const rad = st.bg.angle * Math.PI / 180;
    const cx = f.x + f.w / 2, cy = f.y + f.h / 2;
    const half = Math.abs(Math.cos(rad) * f.w / 2) + Math.abs(Math.sin(rad) * f.h / 2);
    const bax = { x1: cx - Math.cos(rad) * half, y1: cy - Math.sin(rad) * half, x2: cx + Math.cos(rad) * half, y2: cy + Math.sin(rad) * half };
    defs.appendChild(linearGrad(P + "bg", [{ o: 0, c: st.bg.c1 }, { o: 1, c: st.bg.c2 }], bax));
    svg.appendChild(el("rect", { x: f.x, y: f.y, width: f.w, height: f.h, fill: `url(#${P}bg)` }));
  }

  const paint = el("g", { mask: `url(#${P}m)` });
  const cover = { x: f.x, y: f.y, width: f.w, height: f.h };

  if (st.mode === "solid") {
    paint.appendChild(el("rect", Object.assign({ fill: st.solid }, cover)));
  }
  else if (st.mode === "linear" || st.mode === "stepped") {
    const stepped = st.mode === "stepped";
    const stops = stepped ? stepStops() : rampStops();
    defs.appendChild(linearGrad(P + "g", stops, axis(stepped ? STEP_ANGLE : st.angle)));
    paint.appendChild(el("rect", Object.assign({ fill: `url(#${P}g)` }, cover)));
  }
  else if (st.mode === "holo") {
    const base = cycleAxis(st.holo.cycles, st.phase, "reflect");
    const g = linearGrad(P + "g", holoStops(), base, { spreadMethod: "reflect" });
    g.dataset.cyc = st.holo.cycles; g.dataset.kind = "reflect";
    defs.appendChild(g);
    paint.appendChild(el("rect", Object.assign({ fill: `url(#${P}g)` }, cover)));
    if (st.holo.sheen > 0) {
      const sax = cycleAxis(st.holo.cycles * 0.42, -st.phase * 1.7, "reflect");
      const sh = linearGrad(P + "s", [
        { o: 0, c: "#ffffff", a: 0 }, { o: .42, c: "#ffffff", a: 0 },
        { o: .5, c: "#ffffff", a: +(st.holo.sheen * .85).toFixed(3) },
        { o: .58, c: "#ffffff", a: 0 }, { o: 1, c: "#ffffff", a: 0 },
      ], sax, { spreadMethod: "reflect" });
      sh.dataset.cyc = st.holo.cycles * 0.42; sh.dataset.kind = "reflect"; sh.dataset.speed = "-1.7";
      defs.appendChild(sh);
      paint.appendChild(el("rect", Object.assign({ fill: `url(#${P}s)` }, cover)));
    }
  }

  if (st.fx.scan > 0) {
    const pitch = a.unit;
    const pat = el("pattern", { id: P + "sc", width: pitch, height: pitch, patternUnits: "userSpaceOnUse" });
    pat.innerHTML = `<rect x="0" y="0" width="${pitch}" height="${pitch / 2}" fill="#000000" fill-opacity="${st.fx.scan.toFixed(2)}"/>`;
    defs.appendChild(pat);
    paint.appendChild(el("rect", Object.assign({ fill: `url(#${P}sc)` }, cover)));
  }

  svg.appendChild(paint);

  const t = tagline();
  if (t) {
    svg.appendChild(el("g", {
      fill: st.tagline.c,
      transform: `translate(${+t.x.toFixed(3)},${+t.y.toFixed(3)}) scale(${+t.s.toFixed(6)})`,
    }, TAGLINE.content));
  }
  return svg;
}

