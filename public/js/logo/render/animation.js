import { state } from "../core/state.js";
import { cycleAxis } from "../core/svg.js";
import { getLiveSVG } from "./stage.js";
import { $ } from "../../shared/dom.js";

let raf = null,
  t0 = 0;

function tick(t) {
  if (!t0) t0 = t;
  state.phase = ((t - t0) / 9000) % 1;
  const live = getLiveSVG();
  const grads = live ? live.querySelectorAll("linearGradient[data-cyc]") : [];
  grads.forEach((g) => {
    const cyc = parseFloat(g.dataset.cyc) || 1;
    const speed = parseFloat(g.dataset.speed || "1");
    const ax = cycleAxis(cyc, state.phase * speed, g.dataset.kind);
    g.setAttribute("x1", ax.x1.toFixed(2));
    g.setAttribute("y1", ax.y1.toFixed(2));
    g.setAttribute("x2", ax.x2.toFixed(2));
    g.setAttribute("y2", ax.y2.toFixed(2));
  });
  raf = requestAnimationFrame(tick);
}

export function hasMotion() {
  return state.mode === "holo";
}

export function syncAnim() {
  const wants = state.anim && hasMotion();
  if (wants && !raf) {
    t0 = 0;
    raf = requestAnimationFrame(tick);
  }
  if (!wants && raf) {
    cancelAnimationFrame(raf);
    raf = null;
  }
  const btn = $("btnPlay");
  if (btn) {
    btn.disabled = !hasMotion();
    btn.textContent = state.anim ? "❚❚ pause" : "▶ play";
    btn.setAttribute("aria-label", state.anim ? "pause motion" : "play motion");
  }
}
