/* Saving: svg, png, ascii, sprite sheet. */
import { $ } from "../../shared/dom.js";
import { asciiBlock, asciiBraille, pathData, rects, svgSource } from "../core/trace.js";
import { showDialog } from "../ui/dialog.js";
import { slug } from "../../shared/util.js";
import { state } from "../core/state.js";
import { toast } from "../../shared/toast.js";

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
    scale = 1024 / N;
  const c = document.createElement("canvas");
  c.width = 1024;
  c.height = 1024;
  const x = c.getContext("2d");
  if (state.bgOn) {
    x.fillStyle = state.bg;
    x.fillRect(0, 0, 1024, 1024);
  }
  x.fillStyle = state.fg;
  for (const [gx, gy, w, h] of rects(state.grid, N))
    x.fillRect(gx * scale, gy * scale, w * scale, h * scale);
  c.toBlob((b) => {
    if (!b) {
      toast("png export failed");
      return;
    }
    download(b, `${name}-1024.png`);
    toast("saved " + name + "-1024.png");
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
