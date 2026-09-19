export const $ = id => document.getElementById(id);

export function div(className, text) {
  const d = document.createElement("div");
  if (className) d.className = className;
  if (text !== undefined) d.textContent = text;
  return d;
}

export function span(className, text) {
  const s = document.createElement("span");
  if (className) s.className = className;
  if (text !== undefined) s.textContent = text;
  return s;
}

export function button(className, text, onClick) {
  const b = document.createElement("button");
  if (className) b.className = className;
  if (text !== undefined) b.textContent = text;
  if (onClick) b.onclick = onClick;
  return b;
}

export function input(type, className) {
  const i = document.createElement("input");
  i.type = type;
  if (className) i.className = className;
  return i;
}
