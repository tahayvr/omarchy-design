/* The brand, read at build time from the same files and rules the Logo
   Foundry uses: the master SVGs in public/assets/marks, the lockup and grid
   numbers in marks.js, and the band rule in bands.js. Nothing here restates
   a rule — if one changes in the tool, the docs follow. */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { LOCKUP, UNITS } from "../../public/js/logo/data/marks.js";
import { BAND_RATIO, BAND_TOTAL, bandOffsets, ladder } from "../../public/js/logo/core/bands.js";
import { THEMES, REFERENCE_BANDS } from "../../public/js/logo/data/presets.js";

export type Mark = {
  id: string;
  label: string;
  w: number;
  h: number;
  unit: number;
  content: string;
};

function read(name: string) {
  const svg = readFileSync(join(process.cwd(), "public/assets/marks", `${name}.svg`), "utf8");
  const vb = /viewBox="([^"]+)"/
    .exec(svg)![1]
    .split(/[\s,]+/)
    .map(Number);
  const content = svg
    .slice(svg.indexOf(">", svg.indexOf("<svg")) + 1, svg.lastIndexOf("</svg>"))
    .trim();
  return { w: vb[2], h: vb[3], content };
}

const icon = read("icon");
const word = read("wordmark");
const { O_TOP, O_HEIGHT, GAP } = LOCKUP;
const iconScale = O_HEIGHT / icon.w;

export const MARKS: Record<"wordmark" | "icon" | "lockup", Mark> = {
  wordmark: { id: "wordmark", label: "Wordmark", ...word, unit: UNITS.wordmark },
  icon: { id: "icon", label: "Icon", ...icon, unit: UNITS.icon },
  lockup: {
    id: "lockup",
    label: "Lockup",
    w: O_HEIGHT + GAP + word.w,
    h: word.h,
    unit: UNITS.wordmark,
    content:
      `<g transform="translate(0,${O_TOP}) scale(${iconScale.toFixed(6)})">${icon.content}</g>` +
      `<g transform="translate(${O_HEIGHT + GAP},0)">${word.content}</g>`,
  },
};

export { LOCKUP, BAND_RATIO, BAND_TOTAL, REFERENCE_BANDS, bandOffsets, ladder };

/* Every Omarchy theme the Logo Foundry knows: its five bands and ground. */
export type Theme = { id: string; name: string; cols: string[]; text: string; bg: string };
export const THEME_BANDS: Theme[] = THEMES.map(
  (t: { id: string; name: string; cols: string[]; text: string; bg: { c1: string } }) => ({
    id: t.id,
    name: t.name,
    cols: t.cols,
    text: t.text,
    bg: t.bg.c1,
  }),
);

/* A standalone SVG file of a mark in one flat color. */
export function markFile(m: Mark, fill: string): string {
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${m.w} ${m.h}" width="${m.w}" height="${m.h}" fill="${fill}">` +
    m.content +
    `</svg>\n`
  );
}

/* Clear space (draft): a quarter of the mark's height, rounded up to whole
   pixels of its grid, on every side. */
export function clearSpace(m: Mark): number {
  return Math.ceil(m.h / 4 / m.unit) * m.unit;
}

/* A standalone SVG file of a mark in the stepped fill. */
export function markFileStepped(m: Mark, bands: string[]): string {
  const O = bandOffsets();
  const rects = bands
    .map((c, i) => {
      const y = +(O[i] * m.h).toFixed(3),
        h = +((O[i + 1] - O[i]) * m.h).toFixed(3);
      return `<rect x="0" y="${y}" width="${m.w}" height="${h}" fill="${c}"/>`;
    })
    .join("");
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${m.w} ${m.h}" width="${m.w}" height="${m.h}" fill="none">` +
    `<defs><mask id="m" maskUnits="userSpaceOnUse" x="0" y="0" width="${m.w}" height="${m.h}"><g fill="#fff">${m.content}</g></mask></defs>` +
    `<g mask="url(#m)">${rects}</g></svg>\n`
  );
}

/* Everything on the downloads page, by file name. */
export type BrandFile = { name: string; mark: Mark; kind: string; body: string };
export function brandFiles(): BrandFile[] {
  const out: BrandFile[] = [];
  for (const m of Object.values(MARKS)) {
    out.push({
      name: `omarchy-${m.id}-white.svg`,
      mark: m,
      kind: "white",
      body: markFile(m, "#ffffff"),
    });
    out.push({
      name: `omarchy-${m.id}-black.svg`,
      mark: m,
      kind: "black",
      body: markFile(m, "#000000"),
    });
    if (m.id !== "icon")
      out.push({
        name: `omarchy-${m.id}-stepped.svg`,
        mark: m,
        kind: "stepped",
        body: markFileStepped(m, REFERENCE_BANDS),
      });
  }
  return out;
}

/* The wordmark's grid in pixels, and the sizes the rules are written in. */
export const GRID = {
  cols: MARKS.wordmark.w / MARKS.wordmark.unit,
  rows: MARKS.wordmark.h / MARKS.wordmark.unit,
};
export const MIN = {
  /* two screen pixels per grid pixel */
  wordmark: GRID.cols * 2,
  /* one screen pixel per grid pixel: the floor */
  wordmarkFloor: GRID.cols,
  icon: 16,
  clear: clearSpace(MARKS.wordmark) / MARKS.wordmark.unit,
};
