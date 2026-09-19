import { $ } from "./dom.js";

let timer = null;

export function toast(msg) {
  const t = $("toast");
  t.textContent = msg; t.classList.add("on");
  clearTimeout(timer); timer = setTimeout(() => t.classList.remove("on"), 1900);
}
