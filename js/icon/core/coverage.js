/* Source image to coverage, coverage to a 1-bit grid. */
import { despeckle, fillHoles, isEmpty, outline } from "../core/grid.js";
import { draw } from "../render/board.js";
import { state } from "../core/state.js";

export function readImage(img) {
  const maxDim = 512;
  const s = Math.min(maxDim / img.width, maxDim / img.height, 4);
  const W = Math.max(1, Math.round(img.width * s)),
    H = Math.max(1, Math.round(img.height * s));
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d", { willReadFrequently: true });
  ctx.drawImage(img, 0, 0, W, H);
  const d = ctx.getImageData(0, 0, W, H).data;
  let hasAlpha = false;
  for (let i = 3; i < d.length; i += 4) {
    if (d[i] < 250) {
      hasAlpha = true;
      break;
    }
  }
  return { W, H, d, hasAlpha };
}
export function inkAt(f, i, mode) {
  const a = f.d[i + 3] / 255;
  if (a === 0) return 0;
  if (mode === "alpha") return a;
  const l =
    (0.2126 * f.d[i] + 0.7152 * f.d[i + 1] + 0.0722 * f.d[i + 2]) / 255;
  return (mode === "light" ? l : 1 - l) * a;
}
export function effectiveMode(f) {
  return state.source === "auto"
    ? f.hasAlpha
      ? "alpha"
      : "dark"
    : state.source;
}
/* average ink per cell; kept separate from the threshold so the slider is live */
export function coverage() {
  const N = state.N,
    f = state.img;
  if (!f) return null;
  const mode = effectiveMode(f);
  const ink = new Float32Array(f.W * f.H);
  let bx0 = f.W,
    by0 = f.H,
    bx1 = -1,
    by1 = -1;
  for (let y = 0, p = 0; y < f.H; y++)
    for (let x = 0; x < f.W; x++, p++) {
      const v = inkAt(f, p * 4, mode);
      ink[p] = v;
      if (v > 0.06) {
        if (x < bx0) bx0 = x;
        if (x > bx1) bx1 = x;
        if (y < by0) by0 = y;
        if (y > by1) by1 = y;
      }
    }
  if (bx1 < 0) {
    return new Float32Array(N * N);
  }
  if (!state.fit) {
    bx0 = 0;
    by0 = 0;
    bx1 = f.W - 1;
    by1 = f.H - 1;
  }
  const bw = bx1 - bx0 + 1,
    bh = by1 - by0 + 1;
  const inner = Math.max(1, N - 2 * state.margin);
  const cell = Math.max(bw, bh) / inner; // source px per grid cell
  const ox = bx0 + bw / 2 - (cell * N) / 2,
    oy = by0 + bh / 2 - (cell * N) / 2; // centre the art on the grid
  const sum = new Float32Array(N * N),
    cnt = new Float32Array(N * N);
  for (let y = 0, p = 0; y < f.H; y++)
    for (let x = 0; x < f.W; x++, p++) {
      /* sample at the pixel centre: corner sampling puts art that sits exactly
 on a cell boundary into the wrong cell */
      const cx = Math.floor((x + 0.5 - ox) / cell),
        cy = Math.floor((y + 0.5 - oy) / cell);
      if (cx < 0 || cy < 0 || cx >= N || cy >= N) continue;
      const i = cy * N + cx;
      sum[i] += ink[p];
      cnt[i]++;
    }
  const cov = new Float32Array(N * N);
  for (let i = 0; i < N * N; i++) cov[i] = cnt[i] ? sum[i] / cnt[i] : 0;
  return cov;
}

/* full rebuild: coverage -> threshold -> cleanup -> style -> manual edits */
export function rebuild(recompute) {
  const N = state.N;
  if (recompute) state.cov = coverage();
  let g = new Uint8Array(N * N);
  if (state.cov) {
    for (let i = 0; i < N * N; i++)
      g[i] = state.cov[i] >= state.threshold ? 1 : 0;
    if (state.invert) for (let i = 0; i < N * N; i++) g[i] = g[i] ? 0 : 1;
    if (state.despeckle) g = despeckle(g, N);
    if (state.fillholes) g = fillHoles(g, N);
  }
  state.base = g;
  let out = Uint8Array.from(g);
  if (state.style === "outline" && !isEmpty(out))
    out = outline(out, N, state.thick);
  state.edits.forEach((v, i) => {
    if (i < out.length) out[i] = v;
  });
  state.grid = out;
  draw();
}
