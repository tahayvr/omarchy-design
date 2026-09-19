import { state } from "../core/state.js";
import { frame } from "../core/geometry.js";
import { buildSVG, el } from "../core/svg.js";
import { shapeById } from "../data/shapes.js";
import { mix } from "../../shared/color.js";
import { signatureColour } from "../core/gradients.js";
import { $ } from "../../shared/dom.js";

let liveSVG = null;

export function getLiveSVG() { return liveSVG; }

export function render() {
  const svg = buildSVG();
  svg.removeAttribute("width"); svg.removeAttribute("height");
  const guide = avatarGuide();
  if (guide) svg.appendChild(guide);
  const stage = $("stage");
  stage.replaceChildren(svg);
  stage.classList.toggle("transparent", state.bg.mode === "none");
  liveSVG = svg;
  fit();
}

/* What the photo sits on: the canvas colour, or the stage behind a
   transparent canvas. */
function baseColour() {
  const bg = state.bg;
  if (bg.mode === "solid") return bg.c1;
  if (bg.mode === "gradient") return mix(bg.c1, bg.c2, .5);
  return "#171717";
}

/* A placeholder profile photo where the platform draws the real one, so a
   banner can be judged as it will sit on a profile. Live stage only: exports
   and thumbnails build their own svg and never see it. */
function avatarGuide() {
  const shape = shapeById(state.aspect), av = shape.avatar;
  if (!av || !state.avatarGuide) return null;
  const f = frame(), k = f.w / shape.png;           /* banner pixels → canvas units */
  const r = av.r * k, ring = av.ring * k;
  const cx = f.x + av.cx * k, cy = f.y + av.cy * k;
  /* themed: the ring in the accent, the photo a tint of the canvas toward it */
  const accent = signatureColour(), base = baseColour();
  const face = mix(base, accent, .14), figure = mix(base, accent, .4);
  const g = el("g", { "pointer-events": "none" });
  g.appendChild(el("circle", { cx, cy, r: r - ring / 2, fill: face, stroke: accent, "stroke-width": ring }));
  /* head and shoulders, kept inside the ring */
  g.appendChild(el("circle", { cx, cy: cy - r * .2, r: r * .3, fill: figure }));
  const clip = el("clipPath", { id: "avatar-clip" });
  clip.appendChild(el("circle", { cx, cy, r: r * .97 }));
  g.appendChild(clip);
  g.appendChild(el("path", {
    d: `M${cx - r * .56} ${cy + r * .58} a${r * .56} ${r * .5} 0 0 1 ${r * 1.12} 0 v${r * .5} h${-r * 1.12} z`,
    fill: figure, "clip-path": "url(#avatar-clip)",
  }));
  return g;
}

export function fit() {
  if (!liveSVG) return;
  const wrap = document.querySelector(".stagewrap");
  const cs = getComputedStyle(wrap);
  const availW = wrap.clientWidth - parseFloat(cs.paddingLeft) - parseFloat(cs.paddingRight);
  const availH = wrap.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
  const f = frame(), ar = f.w / f.h;
  let w = availW, h = w / ar;
  if (h > availH) { h = availH; w = h * ar; }
  liveSVG.style.width = Math.max(24, w) + "px";
  liveSVG.style.height = Math.max(24, h) + "px";
}
addEventListener("resize", fit);
