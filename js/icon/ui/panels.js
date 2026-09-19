/* The control sections: grid, ink, shape, colour. */
import { $ } from "../../shared/dom.js";
import { checkbox, colorRow, seg, slider } from "../../shared/widgets.js";
import { draw, layout, pushUndo } from "../render/board.js";
import { effectiveMode, rebuild } from "../core/coverage.js";
import { paintTray, refreshHint } from "../features/set.js";
import { state } from "../core/state.js";

export function buildGridPanel() {
  const b = $("gridBody");
  b.replaceChildren();
  b.style.cssText =
    "display:flex;flex-direction:column;gap:10px;margin-top:10px";
  b.appendChild(
    slider(
      "safe margin",
      state.margin,
      0,
      4,
      1,
      (v) => v + (v === 1 ? " cell" : " cells"),
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
export function buildInk() {
  const b = $("inkBody");
  b.replaceChildren();
  const s = document.createElement("div");
  s.className = "seg";
  seg(
    s,
    [
      { id: "auto", label: "auto" },
      { id: "alpha", label: "alpha" },
      { id: "dark", label: "dark" },
      { id: "light", label: "light" },
    ],
    state.source,
    (id) => {
      state.source = id;
      buildInk();
      rebuild(true);
    },
  );
  b.appendChild(s);
  b.appendChild(
    slider(
      "threshold",
      state.threshold,
      0.02,
      0.98,
      0.01,
      (v) => Math.round(v * 100) + "",
      (v) => {
        state.threshold = v;
        rebuild(false);
      },
    ),
  );
  b.appendChild(
    checkbox("invert", state.invert, (v) => {
      state.invert = v;
      rebuild(false);
    }),
  );
  const n = document.createElement("div");
  n.className = "note";
  n.textContent = state.img
    ? "reading " +
      effectiveMode(state.img) +
      " — threshold is how much of a cell must be inked"
    : "load something to use these";
  b.appendChild(n);
}
export function buildShape() {
  const b = $("shapeBody");
  b.replaceChildren();
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
  $("btnUndo").disabled = true;
  state.edits.clear(); // an edit at 24 means nothing at 48
  if (state.img) {
    rebuildAfterResize();
  } else {
    const g = resample(had || new Uint8Array(old * old), old, n);
    for (let i = 0; i < g.length; i++) if (g[i]) state.edits.set(i, 1);
    rebuildAfterResize();
  }
  function rebuildAfterResize() {
    paintSizeSeg();
    layout();
    rebuild(!!state.img);
    buildShape();
    refreshHint();
  }
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
