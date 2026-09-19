import { state } from "../core/state.js";
import { taglineFits } from "../core/geometry.js";
import { render } from "../render/stage.js";
import { syncAnim } from "../render/animation.js";
import { $, div, span } from "../../shared/dom.js";
import { seg, row, slider, colorRow, checkbox, setTrack } from "../../shared/widgets.js";
import { stopBar } from "./stopBar.js";
import { bandEditor } from "./bandEditor.js";
import { paintPresets } from "./presetTracks.js";
import { SHAPES, SOCIAL, shapeById } from "../data/shapes.js";
import { setPngWidth, syncPngWidths } from "../features/export.js";

const hooks = { rebuild: () => buildFill(), render, paintPresets };

export function buildFill() {
  const body = $("fillBody");
  body.replaceChildren();
  const box = div("fillbox");

  if (state.mode === "solid") {
    box.appendChild(
      colorRow("color", state.solid, (v) => {
        state.solid = v;
        state.preset = null;
        render();
        paintPresets();
      }),
    );
  }
  if (state.mode === "stepped") box.appendChild(bandEditor(hooks));
  if (state.mode === "linear") box.appendChild(stopBar(hooks));
  if (state.mode === "linear") {
    box.appendChild(
      slider(
        "angle",
        state.angle,
        0,
        360,
        15,
        (v) => v + "°",
        (v) => {
          state.angle = v;
          state.preset = null;
          buildFill();
          render();
        },
      ),
    );
    const c = checkbox("snap band edges to the pixel grid", state.snap, (v) => {
      state.snap = v;
      buildFill();
      render();
    });
    if (state.angle % 90 !== 0) c.appendChild(span("cap", " (needs a 0/90/180/270° angle)"));
    box.appendChild(c);
  }
  if (state.mode === "holo") {
    const H = state.holo; /* read-only reference for initial values; writes go through state.holo */
    const hue = slider(
      "base hue",
      H.hue,
      0,
      360,
      1,
      (v) => Math.round(v) + "°",
      (v) => {
        state.holo.hue = v;
        state.preset = null;
        paintHoloTracks();
        render();
      },
      { swatch: true },
    );
    const sat = slider(
      "saturation",
      H.sat,
      10,
      100,
      1,
      (v) => Math.round(v) + "",
      (v) => {
        state.holo.sat = v;
        state.preset = null;
        paintHoloTracks();
        render();
      },
      { swatch: true },
    );
    const light = slider(
      "lightness",
      H.light,
      35,
      92,
      1,
      (v) => Math.round(v) + "",
      (v) => {
        state.holo.light = v;
        state.preset = null;
        paintHoloTracks();
        render();
      },
      { swatch: true },
    );
    box.append(hue, sat, light);
    box.appendChild(
      slider(
        "bands",
        H.cycles,
        0.4,
        5,
        0.1,
        (v) => v.toFixed(1),
        (v) => {
          state.holo.cycles = v;
          state.preset = null;
          render();
        },
      ),
    );
    box.appendChild(
      slider(
        "sheen",
        H.sheen,
        0,
        1,
        0.01,
        (v) => Math.round(v * 100) + "",
        (v) => {
          state.holo.sheen = v;
          state.preset = null;
          render();
        },
      ),
    );
    box.appendChild(
      slider(
        "angle",
        state.angle,
        0,
        360,
        5,
        (v) => v + "°",
        (v) => {
          state.angle = v;
          state.preset = null;
          render();
        },
      ),
    );

    function paintHoloTracks() {
      const { hue: h, sat: s, light: l } = state.holo;
      const spectrum = Array.from({ length: 13 }, (_, i) => `hsl(${i * 30} ${s}% ${l}%)`).join(",");
      setTrack(hue, `linear-gradient(90deg,${spectrum})`);
      setTrack(
        sat,
        `linear-gradient(90deg,hsl(${h} ${sat.range.min}% ${l}%),hsl(${h} 100% ${l}%))`,
      );
      setTrack(
        light,
        `linear-gradient(90deg,hsl(${h} ${s}% ${light.range.min}%),hsl(${h} ${s}% ${light.range.max}%))`,
      );
    }
    paintHoloTracks();
  }
  body.appendChild(box);
  syncAnim();
}

export function buildFx() {
  const b = $("fxBody");
  b.replaceChildren();
  b.appendChild(
    slider(
      "scanlines",
      state.fx.scan,
      0,
      0.6,
      0.01,
      (v) => (v ? Math.round(v * 100) + "" : "off"),
      (v) => {
        state.fx.scan = v;
        render();
      },
    ),
  );
}

export function buildTagline() {
  const b = $("taglineBody");
  b.replaceChildren();
  const fits = taglineFits();
  const c = checkbox("tagline", state.tagline.on && fits, (v) => {
    state.tagline.on = v;
    buildTagline();
    render();
  });
  c.querySelector("input").disabled = !fits;
  c.title = "Beautiful, fun & agentic Linux by DHH";
  if (!fits) c.appendChild(span("cap", " (wordmark and lockup only)"));
  b.appendChild(c);
  if (state.tagline.on && fits)
    b.appendChild(
      colorRow("color", state.tagline.c, (v) => {
        state.tagline.c = v;
        render();
      }),
    );
}

export function buildCanvas() {
  const b = $("canvasBody");
  b.replaceChildren();
  const bgSeg = div("seg");
  seg(
    bgSeg,
    [
      { id: "none", label: "transparent" },
      { id: "solid", label: "solid" },
      { id: "gradient", label: "gradient" },
    ],
    state.bg.mode,
    (id) => {
      state.bg.mode = id;
      buildCanvas();
      render();
    },
  );
  b.appendChild(bgSeg);
  if (state.bg.mode !== "none")
    b.appendChild(
      colorRow("color", state.bg.c1, (v) => {
        state.bg.c1 = v;
        render();
      }),
    );
  if (state.bg.mode === "gradient") {
    b.appendChild(
      colorRow("to", state.bg.c2, (v) => {
        state.bg.c2 = v;
        render();
      }),
    );
    b.appendChild(
      slider(
        "angle",
        state.bg.angle,
        0,
        360,
        15,
        (v) => v + "°",
        (v) => {
          state.bg.angle = v;
          render();
        },
      ),
    );
  }
  b.appendChild(
    slider(
      "padding",
      state.pad,
      0,
      24,
      0.5,
      (v) => v + "u",
      (v) => {
        state.pad = v;
        render();
      },
    ),
  );
  const pickShape = (items) => (id) => {
    const shape = items.find((s) => s.id === id);
    state.aspect = id;
    if (shape.pad !== undefined) state.pad = shape.pad;
    if (shape.png) setPngWidth(shape.png);
    else syncPngWidths();
    buildCanvas();
    render();
  };
  const shapeRow = (label, items) => {
    const s = div("seg");
    seg(s, items, state.aspect, pickShape(items));
    return row(label, s);
  };
  b.appendChild(shapeRow("shape", SHAPES));
  SOCIAL.forEach((g) => b.appendChild(shapeRow(g.group, g.items)));
  if (shapeById(state.aspect).avatar) {
    const c = checkbox("show profile photo", state.avatarGuide, (v) => {
      state.avatarGuide = v;
      render();
    });
    c.appendChild(span("cap", " (preview only, not exported)"));
    b.appendChild(c);
  }
}
