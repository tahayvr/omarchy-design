/* Turning a grid into output: rectangles, svg path data, ascii. */
import { get, idx } from "../core/grid.js";

/* greedy rectangle decomposition -> compact svg path */
export function rects(g, N) {
  const used = new Uint8Array(N * N),
    out = [];
  for (let y = 0; y < N; y++) {
    let x = 0;
    while (x < N) {
      if (!g[idx(x, y, N)] || used[idx(x, y, N)]) {
        x++;
        continue;
      }
      let w = 0;
      while (x + w < N && g[idx(x + w, y, N)] && !used[idx(x + w, y, N)]) w++;
      let h = 1;
      grow: while (y + h < N) {
        for (let k = 0; k < w; k++)
          if (!g[idx(x + k, y + h, N)] || used[idx(x + k, y + h, N)]) break grow;
        h++;
      }
      for (let j = 0; j < h; j++) for (let k = 0; k < w; k++) used[idx(x + k, y + j, N)] = 1;
      out.push([x, y, w, h]);
      x += w;
    }
  }
  return out;
}
export function pathData(g, N) {
  return rects(g, N)
    .map(([x, y, w, h]) => `M${x} ${y}h${w}v${h}h-${w}z`)
    .join("");
}
export function svgSource(g, N, fg, bg) {
  const bgRect = bg ? `<rect width="${N}" height="${N}" fill="${bg}"/>` : "";
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${N} ${N}" width="${N}" height="${N}" ` +
    `shape-rendering="crispEdges">${bgRect}<path d="${pathData(g, N)}" fill="${fg}"/></svg>`
  );
}

/* ascii for ~/.config/omarchy/branding/*.txt */
export function asciiBlock(g, N) {
  const L = [];
  for (let y = 0; y < N; y++) {
    let s = "";
    for (let x = 0; x < N; x++) s += g[idx(x, y, N)] ? "██" : "  ";
    L.push(s.replace(/\s+$/, ""));
  }
  return L.join("\n");
}
export function asciiBraille(g, N) {
  const DOT = [
    [0x01, 0x02, 0x04, 0x40],
    [0x08, 0x10, 0x20, 0x80],
  ];
  const L = [];
  for (let y = 0; y < N; y += 4) {
    let s = "";
    for (let x = 0; x < N; x += 2) {
      let b = 0;
      for (let dx = 0; dx < 2; dx++)
        for (let dy = 0; dy < 4; dy++) if (get(g, x + dx, y + dy, N)) b |= DOT[dx][dy];
      s += String.fromCharCode(0x2800 + b);
    }
    L.push(s.replace(/\u2800+$/, ""));
  }
  return L.join("\n");
}
