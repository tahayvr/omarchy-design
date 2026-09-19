/* Saving: svg, png, ascii, sprite sheet. */
import { $ } from "../../shared/dom.js";
import { seg } from "../../shared/widgets.js";
import { asciiBlock, asciiBraille, pathData, rects, svgSource } from "../core/trace.js";
import { showDialog } from "../ui/dialog.js";
import { slug } from "../../shared/util.js";
import { state } from "../core/state.js";
import { toast } from "../../shared/toast.js";

const PNG_SIZES = [128, 256, 512, 1024];

export function setPngSize(n) {
  state.pngSize = n;
  seg(
    $("pngSeg"),
    PNG_SIZES.map((v) => ({ id: v, label: String(v) })),
    n,
    setPngSize,
  );
}
setPngSize(state.pngSize);

function download(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    URL.revokeObjectURL(url);
    a.remove();
  }, 400);
}
$("btnSvg").onclick = () => {
  const name = slug($("iconName").value);
  const src = svgSource(
    state.grid,
    state.N,
    state.fg,
    state.bgOn ? state.bg : null,
  );
  download(
    new Blob([src], { type: "image/svg+xml" }),
    `${name}-${state.N}.svg`,
  );
  toast("saved " + name + "-" + state.N + ".svg");
};
$("btnPng").onclick = () => {
  const name = slug($("iconName").value);
  const N = state.N,
    size = state.pngSize,
    scale = size / N;
  const c = document.createElement("canvas");
  c.width = size;
  c.height = size;
  const x = c.getContext("2d");
  if (state.bgOn) {
    x.fillStyle = state.bg;
    x.fillRect(0, 0, size, size);
  }
  x.fillStyle = state.fg;
  /* snap every edge to a whole pixel so cells stay crisp at any size */
  const at = (i) => Math.round(i * scale);
  for (const [gx, gy, w, h] of rects(state.grid, N))
    x.fillRect(at(gx), at(gy), at(gx + w) - at(gx), at(gy + h) - at(gy));
  c.toBlob((b) => {
    if (!b) {
      toast("png export failed");
      return;
    }
    download(b, `${name}-${size}.png`);
    toast("saved " + name + "-" + size + ".png");
  }, "image/png");
};
$("btnAscii").onclick = () => {
  const block = asciiBlock(state.grid, state.N),
    braille = asciiBraille(state.grid, state.N);
  showDialog(
    "ascii",
    block + "\n\n" + "— braille —\n\n" + braille,
    "block art above, braille below. save either to ~/.config/omarchy/branding/screensaver.txt or about.txt",
  );
};
/* one file, one <symbol> per icon — the usual way to ship a set */
$("btnSheet").onclick = () => {
  if (state.set.length === 0) {
    toast("the set is empty");
    return;
  }
  const syms = state.set
    .map(
      (it) =>
        `  <symbol id="oma-${it.name}" viewBox="0 0 ${it.N} ${it.N}">\n` +
        `    <path d="${pathData(it.grid, it.N)}"/>\n  </symbol>`,
    )
    .join("\n");
  const sheet = `<svg xmlns="http://www.w3.org/2000/svg" style="display:none" shape-rendering="crispEdges">\n${syms}\n</svg>`;
  showDialog(
    "sprite sheet · " + state.set.length + " icons",
    sheet,
    'paste into the page, then <svg><use href="#oma-name"/></svg> — colour comes from fill',
  );
};
