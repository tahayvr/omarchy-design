/* Loading a source: file, paste, drag and drop, sample. */
import { $ } from "../../shared/dom.js";
import { SAMPLE, SAMPLE_VB } from "../data/sample.js";
import { buildInk } from "../ui/panels.js";
import { effectiveMode, readImage, rebuild } from "../core/coverage.js";
import { isEmpty } from "../core/grid.js";
import { prepareSVG } from "../features/svgSanitise.js";
import { refreshHint } from "../features/set.js";
import { showDialog } from "../ui/dialog.js";
import { slug } from "../../shared/util.js";
import { state } from "../core/state.js";
import { toast } from "../../shared/toast.js";

/* Say what went wrong. "couldn't read that file" helps nobody. */
export function fail(msg) {
  $("srcName").textContent = msg;
  toast(msg.length > 46 ? "see the source panel" : msg);
}

export async function loadFile(file) {
  const base = (file.name || "icon").replace(/\.[^.]+$/, "") || "icon";
  const type = file.type || "";
  const namedSvg = /\.svg$/i.test(file.name || "");
  try {
    /* Anything that isn't clearly a raster gets read as text and searched for
 an <svg>. Catches .txt, .html, no-extension downloads and wrong MIME types. */
    if (namedSvg || /svg/i.test(type) || !/^image\//.test(type)) {
      const text = await file.text();
      if (/<svg[\s>]/i.test(text)) return loadSVGText(text, base);
      if (!/^image\//.test(type)) {
        return fail(
          "no <svg> tag inside " +
            file.name +
            " — if you saved that from a GitHub page you saved the page, not the icon. Use the download-raw button.",
        );
      }
    }
    await useImageURL(URL.createObjectURL(file), base);
  } catch (err) {
    fail(
      "couldn't read " +
        file.name +
        ": " +
        ((err && err.message) || "unknown error"),
    );
  }
}

let lastMarkup = "";
export function loadSVGText(text, name) {
  const prep = prepareSVG(text);
  lastMarkup = prep.svg || text;
  if (!prep.ok) return failWithMarkup(prep.why);
  if (prep.note) toast(prep.note);
  return useImageURL(
    URL.createObjectURL(new Blob([prep.svg], { type: "image/svg+xml" })),
    name,
  ).catch((err) =>
    failWithMarkup(
      "the browser refused to draw it (" +
        ((err && err.message) || "no reason given") +
        ")",
    ),
  );
}
/* When something fails, let the markup be inspected rather than guessed at */
export function failWithMarkup(why) {
  fail(why);
  const panel = $("srcName");
  const b = document.createElement("button");
  b.className = "mini";
  b.textContent = "show what it built";
  b.style.marginTop = "6px";
  b.onclick = () =>
    showDialog(
      "generated svg",
      lastMarkup,
      "this is what was handed to the browser. paste it back into a file to test, or send it over.",
    );
  panel.appendChild(document.createElement("br"));
  panel.appendChild(b);
}

export async function loadRemote(url) {
  const name = (
    url
      .split(/[\/?#]/)
      .filter(Boolean)
      .pop() || "icon"
  ).replace(/\.[^.]+$/, "");
  $("srcName").textContent = "fetching " + name + "…";
  if (/\.svg(\?|#|$)/i.test(url)) {
    try {
      const r = await fetch(url, { mode: "cors" });
      if (!r.ok) throw new Error("HTTP " + r.status);
      return loadSVGText(await r.text(), name);
    } catch (e) {
      return fail(
        "that site wouldn't hand the file over (" +
          e.message +
          ") — download it and load from disk",
      );
    }
  }
  try {
    await useImageURL(url, name);
  } catch (e) {
    fail(
      "couldn't use that url — download the file and load it from disk",
    );
  }
}

export function useImageURL(url, name) {
  return new Promise((res, rej) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      try {
        state.img = readImage(img);
      } catch (err) {
        rej(
          new Error(
            "that image is cross-origin, so its pixels can't be read",
          ),
        );
        return;
      }
      state.srcName = name || "image";
      state.edits.clear();
      state.undo.length = 0;
      $("btnUndo").disabled = true;
      $("btnDrop").disabled = false;
      const nm = $("iconName");
      if (!nm.value || nm.value === "icon")
        nm.value = slug(state.srcName);
      buildInk();
      rebuild(true);
      refreshHint();
      if (isEmpty(state.grid)) {
        fail(
          state.srcName +
            " loaded but nothing crossed the threshold — try another ink source or a lower threshold",
        );
      } else {
        $("srcName").textContent =
          state.srcName +
          " · " +
          img.width +
          "×" +
          img.height +
          (state.img.hasAlpha ? " · has transparency" : " · opaque") +
          " · reading " +
          effectiveMode(state.img);
      }
      if (url.startsWith("blob:")) URL.revokeObjectURL(url);
      res();
    };
    img.onerror = () =>
      rej(new Error("the browser refused to decode it"));
    img.src = url;
  });
}

$("btnLoad").onclick = () => $("file").click();
$("file").onchange = (e) => {
  const f = e.target.files[0];
  if (f) loadFile(f);
  e.target.value = "";
};
$("btnPaste").onclick = () => {
  showDialog(
    "paste svg markup",
    "",
    "copy the icon's svg source and paste it here — works straight from a GitHub file view",
    {
      label: "load it",
      run(v) {
        if (!/<svg[\s>]/i.test(v)) {
          toast("that has no <svg> in it");
          return;
        }
        $("dlg").close();
        loadSVGText(v, "pasted");
      },
    },
  );
};
$("btnSample").onclick = () => {
  loadSVGText(
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${SAMPLE_VB} ${SAMPLE_VB}"><g fill="#000">${SAMPLE}</g></svg>`,
    "omarchy",
  );
};
$("btnDrop").onclick = () => {
  state.img = null;
  state.cov = null;
  state.srcName = "";
  $("srcName").textContent =
    "source dropped — the pixels stay, edit them by hand";
  $("btnDrop").disabled = true;
  const keep = Uint8Array.from(
    state.grid || new Uint8Array(state.N * state.N),
  );
  state.edits.clear();
  for (let i = 0; i < keep.length; i++)
    if (keep[i]) state.edits.set(i, 1);
  buildInk();
  rebuild(false);
  refreshHint();
};

/* drag, drop, paste */
const wrap = $("stagewrap");
["dragenter", "dragover"].forEach((ev) =>
  document.addEventListener(ev, (e) => {
    e.preventDefault();
    wrap.classList.add("dragging");
  }),
);
["dragleave", "drop"].forEach((ev) =>
  document.addEventListener(ev, (e) => {
    e.preventDefault();
    wrap.classList.remove("dragging");
  }),
);
document.addEventListener("drop", (e) => {
  const dt = e.dataTransfer;
  if (!dt) return;
  const f = dt.files && dt.files[0];
  if (f) return loadFile(f);
  /* dragged straight out of a browser tab: no file, just markup or a url */
  const html = dt.getData("text/html") || "";
  const txt = (
    dt.getData("text/plain") ||
    dt.getData("text/uri-list") ||
    ""
  ).trim();
  if (/<svg[\s>]/i.test(html)) return loadSVGText(html, "dropped");
  if (/<svg[\s>]/i.test(txt)) return loadSVGText(txt, "dropped");
  const m = html.match(/<img[^>]+src=["']([^"']+)["']/i);
  const url =
    (m && m[1]) || (/^https?:\/\//i.test(txt) ? txt.split(/\s+/)[0] : "");
  if (url) return loadRemote(url);
  fail("nothing usable in that drop — save the file first, then load it");
});
document.addEventListener("paste", (e) => {
  const cd = e.clipboardData;
  if (!cd) return;
  const it = [...cd.items].find((i) => i.type.startsWith("image/"));
  if (it) {
    const f = it.getAsFile();
    if (f) {
      loadFile(f);
      toast("pasted image");
      return;
    }
  }
  const t = cd.getData("text/plain") || "";
  if (/<svg[\s>]/i.test(t)) {
    loadSVGText(t, "pasted");
    toast("pasted svg");
  }
});
