/* Entry point: build the panels, wire the features, load the sample. */
import { $ } from "../shared/dom.js";
import { buildColour, buildGridPanel, buildShape, initCustomize, paintSizeSeg } from "./ui/panels.js";
import { draw, layout, undo } from "./render/board.js";
import { paintTray, refreshHint } from "./features/set.js";
import { state } from "./core/state.js";

/* these only wire up listeners, so they are imported for their side effects */
import "./features/source.js";
import "./features/tools.js";
import "./features/export.js";
import "./ui/dialog.js";

addEventListener("resize", () => {
  layout();
  draw();
});
addEventListener("keydown", (e) => {
  if ((e.metaKey || e.ctrlKey) && e.key === "z") {
    e.preventDefault();
    undo();
  }
});

buildGridPanel();
buildShape();
buildColour();
paintSizeSeg();
initCustomize();
state.grid = new Uint8Array(state.N * state.N);
layout();
draw();
paintTray();
refreshHint();
$("btnSample").click();
