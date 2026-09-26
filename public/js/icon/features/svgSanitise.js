/* Rebuild an untrusted SVG from scratch, keeping only geometry we understand. */

export const SVGNS = "http://www.w3.org/2000/svg";

/* Rebuilding from scratch beats patching the original. Editor exports carry
   undeclared prefixes (inkscape:, sodipodi:, ns0:) and stray namespace
   declarations that make a standalone svg fail to decode with no useful error. */
export const SAFE_EL = new Set([
  "svg",
  "g",
  "defs",
  "symbol",
  "use",
  "path",
  "rect",
  "circle",
  "ellipse",
  "line",
  "polyline",
  "polygon",
  "clipPath",
  "mask",
  "linearGradient",
  "radialGradient",
  "stop",
  "pattern",
  "style",
  "text",
  "tspan",
  "title",
  "desc",
  "image",
  "switch",
]);
export const GEOMETRY = [
  "path",
  "rect",
  "circle",
  "ellipse",
  "line",
  "polyline",
  "polygon",
  "use",
  "text",
  "image",
];

export function escAttr(v) {
  return String(v)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
export function escText(v) {
  return String(v).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
export function emitNode(node, out) {
  const name = node.localName;
  if (!SAFE_EL.has(name)) return; // metadata, scripts, editor junk
  if (name === "style") {
    out.push("<style>" + escText(node.textContent) + "</style>");
    return;
  }
  if (name === "image") {
    const href = node.getAttribute("href") || node.getAttribute("xlink:href") || "";
    if (!/^data:/i.test(href)) return; // external images never load here
  }
  let s = "<" + name;
  for (const a of Array.from(node.attributes)) {
    let n = a.name;
    if (n === "xmlns" || n.toLowerCase().startsWith("xmlns:")) continue;
    if (n.toLowerCase() === "xlink:href") n = "href"; // svg2 spelling, no prefix needed
    else if (n.includes(":") && !/^xml:/i.test(n)) continue;
    s += " " + n + '="' + escAttr(a.value) + '"';
  }
  const kids = Array.from(node.children);
  if (name === "text" || name === "tspan") {
    out.push(s + ">" + escText(node.textContent) + "</" + name + ">");
    return;
  }
  if (!kids.length) {
    out.push(s + "/>");
    return;
  }
  out.push(s + ">");
  kids.forEach((k) => emitNode(k, out));
  out.push("</" + name + ">");
}

export function prepareSVG(text) {
  text = text.replace(/^\uFEFF/, "").trim();
  let root = null,
    note = "";

  try {
    const d = new DOMParser().parseFromString(text, "image/svg+xml");
    if (!d.querySelector("parsererror")) {
      root =
        d.documentElement && d.documentElement.localName === "svg"
          ? d.documentElement
          : d.querySelector("svg");
    }
  } catch {}

  /* Strict XML rejects unclosed tags and html entities, so fall back to the
     lenient html parser. A saved web page holds many svgs; take the biggest. */
  if (!root) {
    try {
      const d = new DOMParser().parseFromString(text, "text/html");
      const all = [...d.querySelectorAll("svg")];
      if (all.length) {
        all.sort((a, b) => b.innerHTML.length - a.innerHTML.length);
        root = all[0];
        if (all.length > 1) note = "found " + all.length + " svgs, took the largest";
      }
    } catch {}
  }
  if (!root)
    return {
      ok: false,
      why: "no <svg> element in there — paste the icon's markup, or download the raw .svg",
    };

  /* dimensions: viewBox may be in any case once html has touched it */
  let vbRaw = null;
  for (const a of Array.from(root.attributes))
    if (a.name.toLowerCase() === "viewbox") vbRaw = a.value;
  const nums = vbRaw
    ? vbRaw
        .trim()
        .split(/[\s,]+/)
        .map(Number)
    : [];
  const hasVB = nums.length === 4 && nums.every((n) => isFinite(n)) && nums[2] > 0 && nums[3] > 0;
  let w = parseFloat(root.getAttribute("width")),
    h = parseFloat(root.getAttribute("height"));
  if (hasVB) {
    if (!isFinite(w) || w <= 0) w = nums[2];
    if (!isFinite(h) || h <= 0) h = nums[3];
  }
  if (!isFinite(w) || w <= 0) w = 24;
  if (!isFinite(h) || h <= 0) h = 24;
  const vb = hasVB ? nums.join(" ") : "0 0 " + w + " " + h;
  const s = 512 / Math.max(w, h);

  const out = [];
  let head =
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="' +
    vb +
    '"' +
    ' width="' +
    Math.max(1, Math.round(w * s)) +
    '" height="' +
    Math.max(1, Math.round(h * s)) +
    '"';
  [
    "fill",
    "stroke",
    "stroke-width",
    "stroke-linecap",
    "stroke-linejoin",
    "fill-rule",
    "clip-rule",
    "opacity",
    "color",
    "class",
    "style",
  ].forEach((k) => {
    const v = root.getAttribute(k);
    if (v != null) head += " " + k + '="' + escAttr(v) + '"';
  });
  out.push(head + ">");
  Array.from(root.children).forEach((k) => emitNode(k, out));
  out.push("</svg>");
  let svg = out.join("").replace(/currentColor/gi, "#000000");

  /* Validate before handing it to the browser, so a failure can name itself */
  try {
    const check = new DOMParser().parseFromString(svg, "image/svg+xml");
    const pe = check.querySelector("parsererror");
    if (pe) {
      const first = (pe.textContent || "").trim().replace(/\s+/g, " ").slice(0, 140);
      return {
        ok: false,
        why: "the rebuilt svg won't parse: " + first,
        svg,
      };
    }
  } catch {}

  /* "<line" is a prefix of "<linearGradient", so match the tag boundary */
  if (!GEOMETRY.some((g) => new RegExp("<" + g + "[\\s/>]").test(svg))) {
    return {
      ok: false,
      why: "that svg has no drawable shapes in it — it may reference a sprite defined elsewhere on the page",
      svg,
    };
  }
  if (/href="https?:/i.test(svg))
    note = note || "it links to something external, which will not load";
  return { ok: true, svg, note };
}
