/* Everything the foundry knows. One object, mutated in place. */

export const state = {
  N: 24,
  margin: 1,
  fit: true,
  threshold: 0.5,
  source: "auto", // auto | alpha | dark | light
  invert: false,
  style: "solid", // solid | outline
  thick: 1,
  despeckle: true,
  fillholes: true,
  fg: "#82fb9c",
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
