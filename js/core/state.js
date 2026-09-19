export const defaultFx = () => ({ scan: 0 });
export const defaultBg = () => ({ mode: "none", c1: "#0d100e", c2: "#1b2a20", angle: 90 });

export const state = {
  asset: "wordmark",
  preset: null,
  mode: "stepped",
  stops: [                    /* colour stops; in stepped mode the first five are the bands */
    { c: "#d0fdd9", p: 0 }, { c: "#a8fcba", p: .2632 }, { c: "#82fb9c", p: .3684 },
    { c: "#539e65", p: .5789 }, { c: "#2b5037", p: .7368 },
  ],
  accent: "#82fb9c",          /* stepped mode: the one colour the five bands are built from */
  sel: 0,
  angle: 90,
  snap: true,
  holo:  { hue: 150, cycles: 1.5, sheen: .45, sat: 78, light: 72 },
  fx: defaultFx(),
  bg: defaultBg(),
  pad: 0,
  tagline: { on: false, c: "#ddf7ff" },   /* the omarchy.org hero line under the wordmark */
  aspect: "auto",             /* shape id, see data/shapes.js */
  anim: !window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  phase: 0,
  avatarGuide: true,          /* placeholder profile photo on banner shapes, drawn on the stage only */
  pngWidth: 1024,
};
