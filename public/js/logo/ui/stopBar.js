import { state } from "../core/state.js";
import { mix, isHex } from "../../shared/color.js";
import { clamp } from "../../shared/util.js";
import { snapOffset, snappable, axis, asset } from "../core/geometry.js";
import { sortedStops } from "../core/gradients.js";
import { div, span, button, input } from "../../shared/dom.js";

function cssGradient() {
  const S = sortedStops();
  return `linear-gradient(90deg,${S.map((s) => `${s.c} ${(snapOffset(s.p) * 100).toFixed(2)}%`).join(",")})`;
}

function colorAt(p) {
  const S = sortedStops();
  let c = S[0].c;
  for (let i = 0; i < S.length - 1; i++) {
    if (p >= S[i].p && p <= S[i + 1].p) {
      const t = (p - S[i].p) / Math.max(S[i + 1].p - S[i].p, 1e-6);
      c = mix(S[i].c, S[i + 1].c, t);
      break;
    }
    if (p > S[S.length - 1].p) c = S[S.length - 1].c;
  }
  return c;
}

export function stopBar(hooks) {
  const wrap = div();

  const bar = div("gbar");
  const fill = div("gfill");
  bar.appendChild(fill);
  fill.style.background = cssGradient();

  /* ----- selected-stop editor (built first so drag handlers can sync it) ----- */
  const meta = div("stopmeta");
  const col = input("color");
  const hex = input("text", "hex");
  const pos = input("number", "pos");
  pos.min = 0;
  pos.max = 100;
  pos.step = "any";
  const pct = span("unit", "%");
  const del = button("mini", "remove");

  function selected() {
    return state.stops[state.sel] || state.stops[0];
  }
  function syncEditor() {
    const s = selected();
    col.value = s.c;
    hex.value = s.c;
    pos.value = pos.defaultValue = (s.p * 100).toFixed(2);
    del.disabled = state.stops.length <= 2;
  }
  syncEditor();

  const handles = [];
  state.stops.forEach((s, i) => {
    const h = div("stop" + (i === state.sel ? " sel" : ""));
    h.style.left = s.p * 100 + "%";
    h.style.background = s.c;
    h.title = `stop ${i + 1}`;
    h.onpointerdown = (e) => {
      e.preventDefault();
      e.stopPropagation();
      /* select without rebuilding the panel, so the pointer capture survives the drag */
      state.sel = i;
      handles.forEach((x, j) => x.classList.toggle("sel", j === i));
      syncEditor();
      h.setPointerCapture(e.pointerId);
      const move = (ev) => {
        const r = bar.getBoundingClientRect();
        const p = clamp((ev.clientX - r.left) / r.width, 0, 1);
        state.stops[i].p = snapOffset(p);
        h.style.left = state.stops[i].p * 100 + "%";
        pos.value = pos.defaultValue = (state.stops[i].p * 100).toFixed(2);
        fill.style.background = cssGradient();
        hooks.render();
      };
      const up = () => {
        h.removeEventListener("pointermove", move);
        h.removeEventListener("pointerup", up);
        hooks.rebuild();
      };
      h.addEventListener("pointermove", move);
      h.addEventListener("pointerup", up);
    };
    handles.push(h);
    bar.appendChild(h);
  });

  bar.onpointerdown = (e) => {
    const r = bar.getBoundingClientRect();
    const p = snapOffset(clamp((e.clientX - r.left) / r.width, 0, 1));
    state.stops.push({ c: colorAt(p), p });
    state.sel = state.stops.length - 1;
    state.preset = null;
    hooks.rebuild();
    hooks.render();
    hooks.paintPresets();
  };
  wrap.appendChild(bar);

  col.oninput = () => {
    const s = selected();
    s.c = col.value;
    hex.value = col.value;
    state.preset = null;
    fill.style.background = cssGradient();
    handles[state.stops.indexOf(s)].style.background = col.value;
    hooks.render();
  };
  col.onchange = () => hooks.paintPresets();
  hex.onchange = () => {
    const s = selected();
    if (isHex(hex.value)) {
      s.c = hex.value;
      col.value = hex.value;
      state.preset = null;
      hooks.rebuild();
      hooks.render();
      hooks.paintPresets();
    } else hex.value = s.c;
  };
  pos.onchange = () => {
    const s = selected(),
      cur = s.p;
    const typed = parseFloat(pos.value),
      shown = parseFloat(pos.defaultValue);
    const rows = axis(state.angle).len / asset().unit;
    const row = snappable() && rows >= 2 ? 1 / rows : 0;
    /* arrow keys and the spinner change the field by exactly 1; with snapping on that means one row */
    const nudge = row && Math.abs(Math.abs(typed - shown) - 1) < 1e-6;
    s.p = nudge
      ? snapOffset(clamp(cur + Math.sign(typed - shown) * row, 0, 1))
      : snapOffset(clamp(typed / 100, 0, 1));
    state.preset = null;
    hooks.rebuild();
    hooks.render();
  };
  del.onclick = () => {
    state.stops.splice(state.sel, 1);
    state.sel = 0;
    state.preset = null;
    hooks.rebuild();
    hooks.render();
    hooks.paintPresets();
  };

  const grow = div("grow");
  grow.append(col, hex, pos, pct);
  meta.append(grow, del);
  wrap.appendChild(meta);

  const tools = div("stopmeta");
  tools.append(
    button("mini", "space evenly", () => {
      const S = sortedStops();
      S.forEach((st, i) => (st.p = snapOffset(i / Math.max(S.length - 1, 1))));
      state.stops = S;
      state.preset = null;
      hooks.rebuild();
      hooks.render();
    }),
    button("mini", "reverse", () => {
      const cols = sortedStops()
        .map((x) => x.c)
        .toReversed();
      sortedStops().forEach((st, i) => (st.c = cols[i]));
      state.preset = null;
      hooks.rebuild();
      hooks.render();
    }),
  );
  wrap.appendChild(tools);
  return wrap;
}
