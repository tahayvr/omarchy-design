import { state } from "../core/state.js";
import { frame, tagline } from "../core/geometry.js";
import { buildSVG, SVGNS } from "../core/svg.js";
import { $ } from "../ui/dom.js";
import { seg } from "../ui/widgets.js";
import { toast } from "../ui/toast.js";
import { PNG_WIDTHS, shapeById } from "../data/shapes.js";

export function exportName(ext) {
  const a = state.asset;
  const style = state.preset || state.mode;
  const line = tagline() ? "-tagline" : "";
  const shape = state.aspect === "auto" ? "" : "-" + state.aspect;
  const size = ext === "png" ? "-" + state.pngWidth : "";
  return `omarchy-${a}${line}-${style}${shape}${size}.${ext}`;
}

/* The stock widths, plus the picked shape's native width (1500 for an X
   header, 1584 for a LinkedIn banner) so it exports at the exact size. */
function pngWidths() {
  const native = shapeById(state.aspect).png;
  return native && !PNG_WIDTHS.includes(native)
    ? [...PNG_WIDTHS, native].sort((a, b) => a - b)
    : PNG_WIDTHS;
}

/* Offer the widths again after a shape change; a native width that no longer
   applies falls back to the default. */
export function syncPngWidths() {
  setPngWidth(pngWidths().includes(state.pngWidth) ? state.pngWidth : 1024);
}

export function setPngWidth(w) {
  const widths = pngWidths();
  if (!widths.includes(w)) return;
  state.pngWidth = w;
  seg($("pngSeg"), widths.map(v => ({ id: v, label: String(v) })), w, setPngWidth);
}

export function serialize() {
  const svg = buildSVG();
  const f = frame();
  svg.setAttribute("width", Math.round(f.w));
  svg.setAttribute("height", Math.round(f.h));
  svg.setAttribute("xmlns", SVGNS);
  return '<?xml version="1.0" encoding="UTF-8"?>\n' + new XMLSerializer().serializeToString(svg);
}

function download(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name; document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 400);
}

function saveSvg() {
  download(new Blob([serialize()], { type: "image/svg+xml" }), exportName("svg"));
  toast("saved " + exportName("svg"));
}

async function copySvg() {
  const code = serialize();
  try { await navigator.clipboard.writeText(code); toast("svg copied to clipboard"); }
  catch (e) {
    const ta = document.createElement("textarea"); ta.value = code; document.body.appendChild(ta);
    ta.select();
    try { document.execCommand("copy"); toast("svg copied to clipboard"); }
    catch (_) { toast("couldn't reach the clipboard — save the file instead"); }
    ta.remove();
  }
}

function savePng() {
  const f = frame();
  const W = state.pngWidth;
  const H = Math.round(W * f.h / f.w);
  const src = "data:image/svg+xml;charset=utf-8," + encodeURIComponent(serialize());
  const img = new Image();
  img.onload = () => {
    const cv = document.createElement("canvas"); cv.width = W; cv.height = H;
    const ctx = cv.getContext("2d");
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(img, 0, 0, W, H);
    cv.toBlob(b => {
      if (!b) { toast("png export failed — save the svg instead"); return; }
      download(b, exportName("png"));
      toast("saved " + exportName("png"));
    }, "image/png");
  };
  img.onerror = () => toast("png export failed — save the svg instead");
  img.src = src;
}

export function initExport() {
  setPngWidth(state.pngWidth);
  $("btnSvg").onclick = saveSvg;
  $("btnCopy").onclick = copySvg;
  $("btnPng").onclick = savePng;
}
