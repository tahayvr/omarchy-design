/* Board toolbar: grid, invert, clear. */
import { $ } from "../../shared/dom.js";
import { draw, pushUndo } from "../render/board.js";
import { refreshHint } from "../features/set.js";
import { state } from "../core/state.js";

$("btnGrid").onclick = () => {
  state.showGrid = !state.showGrid;
  $("btnGrid").setAttribute("aria-pressed", String(state.showGrid));
  draw();
};
$("btnInvert").onclick = () => {
  pushUndo();
  for (let i = 0; i < state.grid.length; i++) {
    state.grid[i] = state.grid[i] ? 0 : 1;
    state.edits.set(i, state.grid[i]);
  }
  draw();
  refreshHint();
};
$("btnClear").onclick = () => {
  pushUndo();
  state.grid = new Uint8Array(state.N * state.N);
  state.edits.clear();
  for (let i = 0; i < state.grid.length; i++) state.edits.set(i, 0);
  draw();
  refreshHint();
};
