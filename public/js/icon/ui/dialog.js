/* The output dialog: svg source, ascii, sprite sheet. */
import { $ } from "../../shared/dom.js";
import { toast } from "../../shared/toast.js";

export function showDialog(title, text, note, action) {
  $("dlgTitle").textContent = title;
  const t = $("dlgText"),
    btn = $("dlgCopy");
  t.value = text;
  $("dlgNote").innerHTML = note || "";
  if (action) {
    t.removeAttribute("readonly");
    btn.textContent = action.label;
    btn.onclick = () => action.run(t.value);
  } else {
    t.setAttribute("readonly", "");
    btn.textContent = "copy";
    btn.onclick = copyDialog;
  }
  $("dlg").showModal();
  if (action) t.focus();
}
$("dlgClose").onclick = () => $("dlg").close();
export async function copyDialog() {
  const t = $("dlgText");
  try {
    await navigator.clipboard.writeText(t.value);
    toast("copied");
  } catch {
    t.removeAttribute("readonly");
    t.select();
    document.execCommand("copy");
    t.setAttribute("readonly", "");
    toast("copied");
  }
}
$("dlgCopy").onclick = copyDialog;
