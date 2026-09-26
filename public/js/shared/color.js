import { clamp } from "./util.js";

export function hslToHex(h, s, l) {
  h = ((h % 360) + 360) % 360;
  s = clamp(s, 0, 100) / 100;
  l = clamp(l, 0, 100) / 100;
  const k = (n) => (n + h / 30) % 12,
    a = s * Math.min(l, 1 - l);
  const f = (n) => l - a * Math.max(-1, Math.min(k(n) - 3, Math.min(9 - k(n), 1)));
  const t = (x) =>
    Math.round(255 * x)
      .toString(16)
      .padStart(2, "0");
  return "#" + t(f(0)) + t(f(8)) + t(f(4));
}

export function hexToRgb(hex) {
  let h = hex.replace("#", "").trim();
  if (h.length === 3)
    h = h
      .split("")
      .map((c) => c + c)
      .join("");
  const n = parseInt(h, 16);
  return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
}

export function hexToHsl(hex) {
  const { r, g, b } = hexToRgb(hex),
    R = r / 255,
    G = g / 255,
    B = b / 255;
  const mx = Math.max(R, G, B),
    mn = Math.min(R, G, B),
    l = (mx + mn) / 2;
  let hh = 0,
    s = 0;
  if (mx !== mn) {
    const d = mx - mn;
    s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    hh = mx === R ? (G - B) / d + (G < B ? 6 : 0) : mx === G ? (B - R) / d + 2 : (R - G) / d + 4;
    hh *= 60;
  }
  return { h: hh, s: s * 100, l: l * 100 };
}

export function mix(a, b, t) {
  const A = hexToRgb(a),
    B = hexToRgb(b);
  const t2 = (x) => Math.round(x).toString(16).padStart(2, "0");
  return "#" + t2(A.r + (B.r - A.r) * t) + t2(A.g + (B.g - A.g) * t) + t2(A.b + (B.b - A.b) * t);
}

export function isHex(s) {
  return /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.test(s.trim());
}
