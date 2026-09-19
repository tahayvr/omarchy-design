import { state } from "../core/state.js";
import { isHex } from "../../shared/color.js";
import { bandColors, bandsFromAccent } from "../core/gradients.js";
import { div, span, button, input } from "../../shared/dom.js";
import { toast } from "../../shared/toast.js";

async function copyHex(hex) {
  try { await navigator.clipboard.writeText(hex); toast("copied " + hex); }
  catch (e) { toast("couldn't reach the clipboard"); }
}

export function bandEditor(hooks) {
  const wrap = div();
  const bands = div("bands");
  const swatches = bandColors().map(c => {
    const b = button("band", undefined, () => copyHex(b.dataset.hex));
    b.dataset.hex = c;
    b.title = "copy " + c;
    b.setAttribute("aria-label", "copy " + c);
    b.style.background = c;
    bands.appendChild(b);
    return b;
  });
  wrap.appendChild(bands);

  const meta = div("stopmeta");
  const col = input("color"); col.value = state.accent;
  const hex = input("text", "hex wide"); hex.value = state.accent;
  const lbl = span("lbl", "accent");

  function apply(v, { live } = {}) {
    state.accent = v; state.preset = null;
    bandsFromAccent(v);
    if (live) {
      /* update swatches in place so the colour picker keeps focus */
      bandColors().forEach((c, i) => {
        swatches[i].dataset.hex = c; swatches[i].title = "copy " + c;
        swatches[i].setAttribute("aria-label", "copy " + c);
        swatches[i].style.background = c;
      });
      hex.value = v;
      hooks.render();
    } else {
      hooks.rebuild(); hooks.render(); hooks.paintPresets();
    }
  }
  col.oninput = () => apply(col.value, { live: true });
  col.onchange = () => hooks.paintPresets();
  hex.onchange = () => { if (isHex(hex.value)) apply(hex.value.toLowerCase()); else hex.value = state.accent; };

  const grow = div("grow"); grow.append(col, hex, lbl);
  meta.appendChild(grow);
  wrap.appendChild(meta);
  return wrap;
}
