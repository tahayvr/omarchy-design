/* Everything the foundry knows. One object, mutated in place. */

export const state = {
  N: 24,
  margin: 0,   /* an inset rescales the art off the grid */
  fit: false,  /* map the source's own frame to the grid, 1:1 when it is drawn on one */
  /* fixed: half a cell of ink lights it, and the ink mode is detected per source */
  threshold: 0.5,
  source: "auto",
  invert: false,
  style: "solid", // solid | outline
  thick: 1,
  despeckle: true,
  fillholes: true,
  fg: "#a8cd76",   /* omarchy green */
  bg: "#0d100e",
  bgOn: false,
  showGrid: true,
  grid: null, // Uint8Array(N*N) after style + edits
  base: null, // Uint8Array(N*N) straight from the source
  cov: null, // Float32Array(N*N) coverage, kept so threshold is live
  img: null,
  srcName: "",
  edits: new Map(), // index -> 0|1, survives parameter changes
  set: [],
  undo: [],
};
