/* The themes Omarchy ships, read from the copies of their colors.toml in
   src/data/themes (refresh with `just themes`) and resolved the way
   Omarchy resolves them, so pages can check and preview them. */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { PAIRS, HUES, type Pair } from "../data/roles";
import { parseColors, resolveColors } from "./resolve";

export type Theme = { id: string; colors: Record<string, string> };

const DIR = join(process.cwd(), "src/data/themes");

export const THEMES: Theme[] = readdirSync(DIR)
  .filter((f) => f.endsWith(".toml"))
  .toSorted()
  .map((f) => ({
    id: f.replace(/\.toml$/, ""),
    colors: resolveColors(parseColors(readFileSync(join(DIR, f), "utf8"))),
  }));

function lum(hex: string): number {
  const [r, g, b] = [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
  const f = (v: number) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4);
  return 0.2126 * f(r) + 0.7152 * f(g) + 0.0722 * f(b);
}

export function contrast(a: string, b: string): number {
  const [x, y] = [lum(a), lum(b)];
  return (Math.max(x, y) + 0.05) / (Math.min(x, y) + 0.05);
}

/* One pair in one theme: the ratio, or for the hues the weakest of them. */
export function check(t: Theme, p: Pair): { ratio: number; pass: boolean; note?: string } {
  const bg = t.colors[p.bg];
  if (p.id === "hues") {
    const below = HUES.filter((h) => contrast(t.colors[h], bg) < p.min);
    const worst = Math.min(...HUES.map((h) => contrast(t.colors[h], bg)));
    return { ratio: worst, pass: below.length === 0, note: below.join(", ") };
  }
  const ratio = contrast(t.colors[p.fg], bg);
  return { ratio, pass: ratio >= p.min };
}

export { PAIRS };

/* How many themes miss at least one must, and how many miss a should. */
export const SUMMARY = {
  themes: THEMES.length,
  missMust: THEMES.filter((t) => PAIRS.some((p) => p.level === "must" && !check(t, p).pass)).length,
  missShould: THEMES.filter((t) => PAIRS.some((p) => p.level === "should" && !check(t, p).pass))
    .length,
};
