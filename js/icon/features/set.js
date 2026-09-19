/* The icon set tray. */
import { $ } from "../../shared/dom.js";
import { buildShape, paintSizeSeg } from "../ui/panels.js";
import { isEmpty } from "../core/grid.js";
import { layout } from "../render/board.js";
import { rebuild } from "../core/coverage.js";
import { rects } from "../core/trace.js";
import { slug } from "../../shared/util.js";
import { state } from "../core/state.js";
import { toast } from "../../shared/toast.js";

export function paintTray() {
  const t = $("track");
  t.replaceChildren();
  if (state.set.length === 0) {
    const e = document.createElement("div");
    e.className = "empty";
    e.textContent = "empty";
    t.appendChild(e);
    return;
  }
  state.set.forEach((it, n) => {
    const s = document.createElement("div");
    s.className = "slot";
    const c = document.createElement("canvas");
    const px = 48,
      dpr = Math.min(window.devicePixelRatio || 1, 2);
    c.style.width = px + "px";
    c.style.height = px + "px";
    c.width = px * dpr;
    c.height = px * dpr;
    const x = c.getContext("2d");
    x.setTransform(dpr, 0, 0, dpr, 0, 0);
    if (state.bgOn) {
      x.fillStyle = state.bg;
      x.fillRect(0, 0, px, px);
    }
    x.fillStyle = state.fg;
    const k = px / it.N;
    for (const [gx, gy, w, h] of rects(it.grid, it.N))
      x.fillRect(gx * k, gy * k, w * k, h * k);
    const nm = document.createElement("button");
    nm.className = "nm";
    nm.textContent = it.name;
    nm.title = "load " + it.name;
    nm.onclick = () => loadFromSet(n);
    const del = document.createElement("button");
    del.className = "x";
    del.textContent = "×";
    del.title = "remove";
    del.onclick = (ev) => {
      ev.stopPropagation();
      state.set.splice(n, 1);
      paintTray();
      refreshHint();
    };
    s.append(c, nm, del);
    t.appendChild(s);
  });
}
export function loadFromSet(n) {
  const it = state.set[n];
  state.N = it.N;
  state.img = null;
  state.cov = null;
  state.grid = Uint8Array.from(it.grid);
  state.edits.clear();
  for (let i = 0; i < it.grid.length; i++)
    if (it.grid[i]) state.edits.set(i, 1);
  $("iconName").value = it.name;
  $("srcName").textContent = "loaded " + it.name + " from the set";
  paintSizeSeg();
  layout();
  rebuild(false);
  buildShape();
  refreshHint();
  toast("loaded " + it.name);
}
$("btnAdd").onclick = () => {
  if (isEmpty(state.grid)) {
    toast("nothing to add yet");
    return;
  }
  const name = slug($("iconName").value);
  const at = state.set.findIndex((i) => i.name === name);
  const entry = { name, N: state.N, grid: Uint8Array.from(state.grid) };
  if (at >= 0) {
    state.set[at] = entry;
    toast("replaced " + name);
  } else {
    state.set.push(entry);
    toast("added " + name);
  }
  paintTray();
  refreshHint();
};
export function refreshHint() {
  const on = state.grid ? state.grid.reduce((a, b) => a + b, 0) : 0;
  $("trayHint").textContent = state.set.length
    ? state.set.length +
      " icon" +
      (state.set.length === 1 ? "" : "s") +
      " · " +
      on +
      " cells lit on this one"
    : "draw or import, then add to the set";
  const b = $("shapeBody").querySelector(".mini");
  if (b) b.disabled = state.edits.size === 0;
}
