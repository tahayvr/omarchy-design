/* Grid operations. All pure, all on Uint8Array. */

export function idx(x, y, N) {
  return y * N + x;
}
export function get(g, x, y, N) {
  return x < 0 || y < 0 || x >= N || y >= N ? 0 : g[y * N + x];
}

export function erode(g, N) {
  const out = new Uint8Array(N * N);
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      out[idx(x, y, N)] =
        g[idx(x, y, N)] &&
        get(g, x - 1, y, N) &&
        get(g, x + 1, y, N) &&
        get(g, x, y - 1, N) &&
        get(g, x, y + 1, N)
          ? 1
          : 0;
    }
  return out;
}
export function subtract(a, b) {
  const out = new Uint8Array(a.length);
  for (let i = 0; i < a.length; i++) out[i] = a[i] && !b[i] ? 1 : 0;
  return out;
}
export function neighbours8(g, x, y, N) {
  let n = 0;
  for (let dy = -1; dy <= 1; dy++)
    for (let dx = -1; dx <= 1; dx++) {
      if (dx === 0 && dy === 0) continue;
      n += get(g, x + dx, y + dy, N);
    }
  return n;
}
/* lone cells read as noise at 16px, so drop them */
export function despeckle(g, N) {
  const out = Uint8Array.from(g);
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      if (g[idx(x, y, N)] && neighbours8(g, x, y, N) < 2) out[idx(x, y, N)] = 0;
    }
  return out;
}
/* single-cell gaps read as damage, so close them */
export function fillHoles(g, N) {
  const out = Uint8Array.from(g);
  for (let y = 0; y < N; y++)
    for (let x = 0; x < N; x++) {
      if (!g[idx(x, y, N)] && neighbours8(g, x, y, N) >= 7) out[idx(x, y, N)] = 1;
    }
  return out;
}
export function outline(g, N, thick) {
  let inner = erode(g, N);
  for (let i = 1; i < thick; i++) inner = erode(inner, N);
  return subtract(g, inner);
}
export function isEmpty(g) {
  for (let i = 0; i < g.length; i++) if (g[i]) return false;
  return true;
}
