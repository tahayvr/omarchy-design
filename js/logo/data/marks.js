const MARK_URLS = {
  icon:     new URL("../../../assets/marks/icon.svg", import.meta.url),
  wordmark: new URL("../../../assets/marks/wordmark.svg", import.meta.url),
  tagline:  new URL("../../../assets/marks/tagline.svg", import.meta.url),
};

/* Filled by loadMarks(). Shape: { label, w, h, unit, content } per asset,
   where `unit` is the pixel-grid size the mark was drawn on. */
export const ASSETS = {};

/* "Beautiful, fun & agentic Linux by DHH", outlined from JetBrains Mono
   Medium with omarchy.org's hero h1 setting (tracking of minus 0.025em). The viewBox
   is the CSS line box: 1000 units to the em, line height 1.2. Filled by
   loadMarks() as { w, h, content }. */
export const TAGLINE = {};

async function fetchMark(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url}: HTTP ${res.status}`);
  const doc = new DOMParser().parseFromString(await res.text(), "image/svg+xml");
  if (doc.querySelector("parsererror")) throw new Error(`${url}: not valid svg`);
  const root = doc.documentElement;
  const vb = (root.getAttribute("viewBox") || "").trim().split(/[\s,]+/).map(Number);
  if (vb.length !== 4 || !vb.every(Number.isFinite)) throw new Error(`${url}: missing viewBox`);
  /* innerHTML on an XML document stamps xmlns on every top-level child; drop it. */
  const content = root.innerHTML
    .replace(/\s+xmlns="http:\/\/www\.w3\.org\/2000\/svg"/g, "")
    .trim();
  return { w: vb[2], h: vb[3], content };
}

export async function loadMarks() {
  const [icon, word, line] = await Promise.all([
    fetchMark(MARK_URLS.icon), fetchMark(MARK_URLS.wordmark), fetchMark(MARK_URLS.tagline),
  ]);
  Object.assign(TAGLINE, line);

  /* Lockup rule: the icon matches the body height of the wordmark's "o"
     (y 15..255, 240 units) so both share the same vertical centre, and sits
     one quarter of its height (60 units, 4 pixel rows) to the left. */
  const O_TOP = 15, O_HEIGHT = 240, GAP = 60;
  const lockupIcon = (O_HEIGHT / icon.w).toFixed(6);

  Object.assign(ASSETS, {
    icon:     { label: "icon",     w: icon.w, h: icon.h, unit: 90, content: icon.content },
    wordmark: { label: "wordmark", w: word.w, h: word.h, unit: 15, content: word.content },
    lockup:   { label: "lockup",   w: O_HEIGHT + GAP + word.w, h: word.h, unit: 15,
                content: `<g transform="translate(0,${O_TOP}) scale(${lockupIcon})">${icon.content}</g>` +
                         `<g transform="translate(${O_HEIGHT + GAP},0)">${word.content}</g>` },
  });
  return ASSETS;
}
