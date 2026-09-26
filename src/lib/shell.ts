/* Omarchy's desktop shell, read from a copy of its template
   (src/data/shell.toml.tpl, from default/themed in the Omarchy repo). Every
   surface — bar, menus, notifications, lock screen — is a [section] whose
   tokens point at colors.toml keys. The desktop pages list those tokens and
   paint their previews from them, so both follow Omarchy, not a copy of it. */
import { readFileSync } from "node:fs";
import { join } from "node:path";

export type Val =
  | { kind: "key"; key: string }
  | { kind: "mix"; a: string; b: string; amount: number }
  | { kind: "gradient"; key: string; fallback: string }
  | { kind: "ref"; section: string; token: string }
  | { kind: "number"; n: number }
  | { kind: "other"; text: string };

export type Entry = { name: string; val: Val };
export type Section = { id: string; about: string; entries: Entry[] };

function parseVal(raw: string): Val {
  const q = /^"(.*)"$/.exec(raw);
  const s = q ? q[1] : raw;
  let m = /^\{\{\s*([a-z_]+)\s*\}\}$/.exec(s);
  if (m) return { kind: "key", key: m[1] };
  m = /^\{\{\s*mix\s+([a-z_]+)\s+([a-z_]+)\s+([\d.]+)%?\s*\}\}$/.exec(s);
  if (m) return { kind: "mix", a: m[1], b: m[2], amount: Number(m[3]) / 100 };
  m = /^\{\{\s*shell_gradient\s+([a-z_]+)\s+([a-z_]+)\s*\}\}$/.exec(s);
  if (m) return { kind: "gradient", key: m[1], fallback: m[2] };
  m = /^([a-z-]+)\.([a-z-]+)$/.exec(s);
  if (q && m) return { kind: "ref", section: m[1], token: m[2] };
  if (!q && !Number.isNaN(Number(s))) return { kind: "number", n: Number(s) };
  return { kind: "other", text: s };
}

function parse(text: string): Section[] {
  const out: Section[] = [];
  let cur: Section | undefined;
  let notes: string[] = [];
  for (const line of text.split("\n")) {
    const head = /^\[([a-z-]+)\]/.exec(line);
    if (head) {
      cur = { id: head[1], about: "", entries: [] };
      out.push(cur);
      notes = [];
      continue;
    }
    if (!cur) continue;
    const note = /^#\s?(.*)$/.exec(line);
    if (note) {
      /* a commented-out setting isn't prose */
      if (!/^[a-z-]+\s+=/.test(note[1])) notes.push(note[1]);
      continue;
    }
    const kv = /^([a-z-]+)\s*=\s*(.+?)\s*$/.exec(line);
    if (kv) {
      if (!cur.about && notes.length) cur.about = notes.join(" ");
      cur.entries.push({ name: kv[1], val: parseVal(kv[2]) });
      notes = [];
    }
  }
  return out;
}

export const SECTIONS: Section[] = parse(
  readFileSync(join(process.cwd(), "src/data/shell.toml.tpl"), "utf8"),
);

export function section(id: string): Section {
  const s = SECTIONS.find((x) => x.id === id);
  if (!s) throw new Error(`shell.toml.tpl has no [${id}]`);
  return s;
}

const isColor = (v: Val) =>
  v.kind === "key" || v.kind === "mix" || v.kind === "gradient" || v.kind === "ref";

export type Token = { name: string; val: Val; alpha?: number };

/* A section's color tokens, each with its alpha companion. Controls pair a
   state's color with its fill alpha, e.g. hover-cursor-fill. */
export function colorTokens(s: Section): Token[] {
  const get = (n: string) => s.entries.find((e) => e.name === n)?.val;
  const num = (n: string) => {
    const v = get(n);
    return v?.kind === "number" ? v.n : undefined;
  };
  const out: Token[] = [];
  for (const e of s.entries) {
    if (isColor(e.val)) out.push({ name: e.name, val: e.val, alpha: num(`${e.name}-alpha`) });
    const fill = /^(.+)-fill-alpha$/.exec(e.name);
    const color = fill && get(`${fill[1]}-color`);
    if (fill && color && e.val.kind === "number")
      out.push({ name: `${fill[1]}-fill`, val: color, alpha: e.val.n });
  }
  return out;
}

export function numberTokens(s: Section): { name: string; n: number }[] {
  return s.entries.flatMap((e) =>
    e.val.kind === "number" && !e.name.endsWith("alpha") ? [{ name: e.name, n: e.val.n }] : [],
  );
}

const kv = (k: string) => `var(--k-${k.replace(/_/g, "-")})`;

function expr(v: Val): string {
  switch (v.kind) {
    case "key":
      return kv(v.key);
    case "mix":
      return `color-mix(in srgb, ${kv(v.a)}, ${kv(v.b)} ${Math.round(v.amount * 100)}%)`;
    case "gradient":
      /* a gradient border is previewed as its first color */
      return v.fallback === "accent" ? "var(--k-border-active)" : "var(--k-border-active-fg)";
    case "ref":
      return `var(--s-${v.section}-${v.token})`;
    default:
      return "transparent";
  }
}

/* Every color token of every section as a CSS custom property, written in
   terms of --k-* (the theme's keys), which the theme picker sets. */
export function shellCss(): string {
  const lines: string[] = [];
  for (const s of SECTIONS)
    for (const t of colorTokens(s)) {
      const e = expr(t.val);
      const value =
        t.alpha !== undefined && t.alpha < 1
          ? `color-mix(in srgb, ${e} ${+(t.alpha * 100).toFixed(1)}%, transparent)`
          : e;
      lines.push(`--s-${s.id}-${t.name}: ${value};`);
    }
  return lines.join("\n");
}

/* How a token reads in a table. */
export function describe(t: Token): string {
  const v = t.val;
  const a = t.alpha !== undefined && t.alpha < 1 ? ` at ${Math.round(t.alpha * 100)}%` : "";
  switch (v.kind) {
    case "key":
      return v.key + a;
    case "mix":
      return `${v.a} mixed ${Math.round(v.amount * 100)}% toward ${v.b}${a}`;
    case "gradient":
      return `${v.key}, else ${v.fallback}${a}`;
    case "ref":
      return `the ${v.section} ${v.token.replace(/-/g, " ")}${a}`;
    default:
      return "";
  }
}

/* A section exactly as the template writes it, for the page's code block. */
export function sectionSource(id: string): string {
  const text = readFileSync(join(process.cwd(), "src/data/shell.toml.tpl"), "utf8");
  const start = text.indexOf(`[${id}]`);
  if (start < 0) return "";
  const next = text.indexOf("\n[", start + 1);
  return text.slice(start, next < 0 ? undefined : next).trimEnd();
}
