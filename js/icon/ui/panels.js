/* The control sections: grid, ink, shape, colour. */
import { $ } from "../../shared/dom.js";
import { checkbox, colorRow, seg, slider } from "../../shared/widgets.js";
import { draw, layout, pushUndo } from "../render/board.js";
import { rebuild } from "../core/coverage.js";
import { paintTray, refreshHint } from "../features/set.js";
import { state } from "../core/state.js";

export function buildGridPanel() {
  const b = $("gridBody");
  b.replaceChildren();
  b.appendChild(
    slider(
      "safe margin",
      state.margin,
      0,
      4,
      1,
      String,
      (v) => {
        state.margin = v;
        rebuild(true);
      },
    ),
  );
  b.appendChild(
    checkbox("scale artwork to fill the grid", state.fit, (v) => {
      state.fit = v;
      rebuild(true);
    }),
  );
}
export function buildShape() {
  const b = $("shapeBody");
  b.replaceChildren();
  b.appendChild(
    checkbox("invert", state.invert, (v) => {
      state.invert = v;
      rebuild(false);
    }),
  );
  const s = document.createElement("div");
  s.className = "seg";
  seg(
    s,
    [
      { id: "solid", label: "solid" },
      { id: "outline", label: "outline" },
    ],
    state.style,
    (id) => {
      state.style = id;
      buildShape();
      rebuild(false);
    },
  );
  b.appendChild(s);
  if (state.style === "outline")
    b.appendChild(
      slider(
        "weight",
        state.thick,
        1,
        3,
        1,
        (v) => v + " px",
        (v) => {
          state.thick = v;
          rebuild(false);
        },
      ),
    );
  b.appendChild(
    checkbox("drop lone pixels", state.despeckle, (v) => {
      state.despeckle = v;
      rebuild(false);
    }),
  );
  b.appendChild(
    checkbox("close single gaps", state.fillholes, (v) => {
      state.fillholes = v;
      rebuild(false);
    }),
  );
  const clr = document.createElement("button");
  clr.className = "mini";
  clr.textContent = "clear hand edits";
  clr.disabled = state.edits.size === 0;
  clr.onclick = () => {
    pushUndo();
    state.edits.clear();
    rebuild(false);
    buildShape();
    refreshHint();
  };
  b.appendChild(clr);
  const n = document.createElement("div");
  n.className = "note";
  n.textContent = "hand edits stick when you change these";
  b.appendChild(n);
}
/* The defaults are meant to be right, so the granular controls stay folded
   away until a particular icon needs dialling in. */
export function initCustomize() {
  const btn = $("btnCustomize"),
    panel = $("advanced");
  const show = (on) => {
    panel.hidden = !on;
    btn.setAttribute("aria-expanded", String(on));
    btn.textContent = on ? "hide options" : "customize";
  };
  show(false);
  btn.onclick = () => show(panel.hidden);
}

export function buildColour() {
  const b = $("colourBody");
  b.replaceChildren();
  b.appendChild(
    colorRow("icon", state.fg, (v) => {
      state.fg = v;
      draw();
      paintTray();
    }),
  );
  b.appendChild(
    checkbox("background", state.bgOn, (v) => {
      state.bgOn = v;
      buildColour();
      draw();
      paintTray();
    }),
  );
  if (state.bgOn)
    b.appendChild(
      colorRow("behind", state.bg, (v) => {
        state.bg = v;
        draw();
        paintTray();
      }),
    );
}

export const SIZES = [16, 24, 32, 48];
export function paintSizeSeg() {
  seg(
    $("sizeSeg"),
    SIZES.map((n) => ({ id: n, label: n + "px" })),
    state.N,
    pickSize,
  );
}
export function pickSize(n) {
  if (n === state.N) return;
  const old = state.N,
    had = state.grid;
  state.N = n;
  state.undo.length = 0;
  /* an edit at 24 covers four cells at 48, so carry it rather than drop it */
  const carried = resampleEdits(state.edits, old, n);
  state.edits.clear();
  carried.forEach((v, i) => state.edits.set(i, v));
  /* with no source the pixels are the artwork, so the whole grid comes along */
  if (!state.img) {
    const g = resample(had || new Uint8Array(old * old), old, n);
    for (let i = 0; i < g.length; i++) if (g[i]) state.edits.set(i, 1);
  }
  paintSizeSeg();
  layout();
  rebuild(!!state.img);
  buildShape();
  refreshHint();
}

/* the same nearest-neighbour mapping resample() uses, over a sparse overlay */
function resampleEdits(edits, from, to) {
  const out = new Map();
  if (!edits.size) return out;
  for (let y = 0; y < to; y++) {
    const sy = Math.floor((y * from) / to);
    for (let x = 0; x < to; x++) {
      const sx = Math.floor((x * from) / to);
      const v = edits.get(sy * from + sx);
      if (v !== undefined) out.set(y * to + x, v);
    }
  }
  return out;
}

/* nearest-neighbour so hand-drawn work survives a size change */
export function resample(g, from, to) {
  const out = new Uint8Array(to * to);
  for (let y = 0; y < to; y++)
    for (let x = 0; x < to; x++) {
      const sx = Math.floor((x * from) / to),
        sy = Math.floor((y * from) / to);
      out[y * to + x] = g[sy * from + sx];
    }
  return out;
}
