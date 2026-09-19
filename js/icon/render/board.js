/* The board: layout, drawing, painting, undo, true-size previews. */
import { $ } from "../../shared/dom.js";
import { rects } from "../core/trace.js";
import { refreshHint } from "../features/set.js";
import { state } from "../core/state.js";

export const board = $("board"),
  bctx = board.getContext("2d");
export let cellPx = 18;

export function layout() {
  const wrap = $("stagewrap");
  const cs = getComputedStyle(wrap);
  const availW = wrap.clientWidth - parseFloat(cs.paddingLeft) * 2;
  const availH = wrap.clientHeight - parseFloat(cs.paddingTop) * 2;
  cellPx = Math.max(4, Math.floor(Math.min(availW, availH) / state.N));
  const px = cellPx * state.N;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  board.width = px * dpr;
  board.height = px * dpr;
  board.style.width = px + "px";
  board.style.height = px + "px";
  bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
export function draw() {
  const N = state.N,
    g = state.grid;
  bctx.clearRect(0, 0, board.width, board.height);
  if (state.bgOn) {
    bctx.fillStyle = state.bg;
    bctx.fillRect(0, 0, N * cellPx, N * cellPx);
  }
  bctx.fillStyle = state.fg;
  if (g)
    for (const [x, y, w, h] of rects(g, N))
      bctx.fillRect(x * cellPx, y * cellPx, w * cellPx, h * cellPx);
  if (state.showGrid && cellPx >= 7) {
    bctx.strokeStyle = "rgba(130,251,156,.13)";
    bctx.lineWidth = 1;
    bctx.beginPath();
    for (let i = 0; i <= N; i++) {
      const p = Math.round(i * cellPx) + 0.5;
      bctx.moveTo(p, 0);
      bctx.lineTo(p, N * cellPx);
      bctx.moveTo(0, p);
      bctx.lineTo(N * cellPx, p);
    }
    bctx.stroke();
    /* the safe margin is real information, so show it */
    if (state.margin > 0) {
      bctx.strokeStyle = "rgba(168,205,118,.34)";
      bctx.strokeRect(
        state.margin * cellPx + 0.5,
        state.margin * cellPx + 0.5,
        (N - 2 * state.margin) * cellPx - 1,
        (N - 2 * state.margin) * cellPx - 1,
      );
    }
  }
  drawTrueSize();
}

/* painting */
export let paintVal = null;
export function cellFromEvent(e) {
  const r = board.getBoundingClientRect();
  const x = Math.floor((e.clientX - r.left) / cellPx),
    y = Math.floor((e.clientY - r.top) / cellPx);
  if (x < 0 || y < 0 || x >= state.N || y >= state.N) return -1;
  return y * state.N + x;
}
board.addEventListener("pointerdown", (e) => {
  const i = cellFromEvent(e);
  if (i < 0) return;
  e.preventDefault();
  board.setPointerCapture(e.pointerId);
  pushUndo();
  paintVal = state.grid[i] ? 0 : 1;
  paint(i);
});
board.addEventListener("pointermove", (e) => {
  if (paintVal !== null) {
    const i = cellFromEvent(e);
    if (i >= 0) paint(i);
  }
});
addEventListener("pointerup", () => {
  paintVal = null;
});
export function paint(i) {
  if (state.grid[i] === paintVal) return;
  state.grid[i] = paintVal;
  state.edits.set(i, paintVal);
  draw();
  refreshHint();
}

/* undo keeps both the pixels and the edit overlay */
export function pushUndo() {
  state.undo.push({
    g: Uint8Array.from(state.grid),
    e: new Map(state.edits),
  });
  if (state.undo.length > 60) state.undo.shift();
}
export function undo() {
  const s = state.undo.pop();
  if (!s) return;
  state.grid = s.g;
  state.edits = s.e;
  draw();
  refreshHint();
}

/* true-size previews — the only honest test of an icon */
export const TRUE_SIZES = [12, 16, 24, 48];
export function drawTrueSize() {
  const host = $("truesize");
  if (host.children.length !== TRUE_SIZES.length) {
    host.replaceChildren();
    TRUE_SIZES.forEach((s) => {
      const d = document.createElement("div");
      d.className = "tsu";
      const c = document.createElement("canvas");
      c.dataset.size = s;
      const l = document.createElement("span");
      l.textContent = s;
      d.append(c, l);
      host.appendChild(d);
    });
  }
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  [...host.querySelectorAll("canvas")].forEach((c) => {
    const s = +c.dataset.size,
      N = state.N;
    c.style.width = s + "px";
    c.style.height = s + "px";
    c.width = s * dpr;
    c.height = s * dpr;
    const x = c.getContext("2d");
    x.setTransform(dpr, 0, 0, dpr, 0, 0);
    x.clearRect(0, 0, s, s);
    if (state.bgOn) {
      x.fillStyle = state.bg;
      x.fillRect(0, 0, s, s);
    }
    x.fillStyle = state.fg;
    const k = s / N;
    if (state.grid)
      for (const [gx, gy, w, h] of rects(state.grid, N)) x.fillRect(gx * k, gy * k, w * k, h * k);
  });
}
