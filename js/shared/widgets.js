import { isHex } from "./color.js";
import { div, span, button, input } from "./dom.js";

export function seg(container, items, current, onPick) {
  container.replaceChildren();
  items.forEach((it) => {
    const b = button(null, it.label, () => onPick(it.id));
    b.setAttribute("aria-pressed", String(it.id === current));
    container.appendChild(b);
  });
}

export function row(label, node, valNode) {
  const d = div("field");
  const l = document.createElement("label");
  l.textContent = label;
  d.append(l, node);
  if (valNode) d.append(valNode);
  return d;
}

export function slider(label, value, min, max, step, fmt, onInput, opts = {}) {
  const r = input("range", opts.swatch ? "swatch" : null);
  r.min = min;
  r.max = max;
  r.step = step;
  r.value = value;
  const v = span("val", fmt(value));
  r.oninput = () => {
    v.textContent = fmt(parseFloat(r.value));
    onInput(parseFloat(r.value));
  };
  const d = row(label, r, v);
  d.range = r;
  return d;
}

export function setTrack(sliderRow, css) {
  sliderRow.range.style.setProperty("--track", css);
}

export function colorRow(label, value, onChange) {
  const wrap = div("cwrap");
  const c = input("color");
  c.value = value;
  const t = input("text");
  t.value = value;
  c.oninput = () => {
    t.value = c.value;
    onChange(c.value);
  };
  t.onchange = () => {
    if (isHex(t.value)) {
      c.value = t.value;
      onChange(t.value);
    } else t.value = c.value;
  };
  wrap.append(c, t);
  return row(label, wrap);
}

export function checkbox(label, value, onChange) {
  const l = document.createElement("label");
  l.className = "check";
  const i = input("checkbox");
  i.checked = value;
  i.onchange = () => onChange(i.checked);
  l.append(i, span(null, label));
  return l;
}

export function caption(text, extraClass) {
  return div("cap" + (extraClass ? " " + extraClass : ""), text);
}
