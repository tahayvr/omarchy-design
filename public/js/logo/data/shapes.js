/* Canvas shapes. `ratio` is width / height; null means "fit the mark".
   Picking a shape applies its default padding (grid units): fixed shapes
   get room around the mark, fit stays tight. Social presets also carry the
   platform's native export width. Profile banners carry `avatar`, where the
   profile photo covers them on desktop, in pixels of the exported banner:
   centre, outer radius, and the width of the ring around it. */
export const FIT_PAD = 0,
  SHAPE_PAD = 10;

export const PNG_WIDTHS = [512, 1024, 1080, 1600, 2048, 4096];

export const SHAPES = [
  { id: "auto", label: "fit", ratio: null, pad: FIT_PAD },
  { id: "square", label: "1:1", ratio: 1, pad: SHAPE_PAD },
  { id: "wide", label: "2:1", ratio: 2, pad: SHAPE_PAD },
];

export const SOCIAL = [
  {
    group: "instagram",
    items: [
      {
        id: "ig-portrait",
        label: "portrait 4:5",
        ratio: 4 / 5,
        png: 1080,
        pad: SHAPE_PAD,
      },
      {
        id: "ig-story",
        label: "story 9:16",
        ratio: 9 / 16,
        png: 1080,
        pad: SHAPE_PAD,
      },
    ],
  },
  {
    group: "X",
    items: [
      {
        id: "x-post",
        label: "post 16:9",
        ratio: 16 / 9,
        png: 1600,
        pad: SHAPE_PAD,
      },
      {
        id: "x-header",
        label: "header 3:1",
        ratio: 1500 / 500,
        png: 1500,
        pad: SHAPE_PAD,
        /* Measured on x.com at 1440px wide: the header box is 598x200 and the
           image is cropped to cover the box, so 1500x500 scales by 0.4 and loses 1px
           a side. The photo is 136px across with a 4px ring, 16px in from the
           box, centred on its bottom edge. Divided by 0.4 into banner pixels. */
        avatar: { cx: (1 + 16 + 68) / 0.4, cy: 200 / 0.4, r: 68 / 0.4, ring: 4 / 0.4 },
      },
    ],
  },
  {
    group: "linkedin",
    items: [
      {
        id: "li-banner",
        label: "banner 4:1",
        ratio: 1584 / 396,
        png: 1584,
        pad: SHAPE_PAD,
        /* Measured on a linkedin.com profile at desktop width: the banner box
           is 792x198, exactly half of 1584x396. The photo is 160px across
           with a 4px ring, 24px in from the box, its top 101px down.
           Doubled into banner pixels. */
        avatar: { cx: (24 + 80) * 2, cy: (101 + 80) * 2, r: 80 * 2, ring: 4 * 2 },
      },
    ],
  },
];

const ALL = [...SHAPES, ...SOCIAL.flatMap((g) => g.items)];
export function shapeById(id) {
  return ALL.find((s) => s.id === id) || SHAPES[0];
}
