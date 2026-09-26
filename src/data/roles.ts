/* The color-role contract, in Omarchy's own terms: the keys of a theme's
   colors.toml. Omarchy is themed by its users, so the system never declares
   a color. It names the keys a theme fills, says what each one paints, and
   sets the contrast a theme's pairs must reach.

   Keys, fallbacks and the terminal mapping follow bin/omarchy-theme-color
   and default/themed/*.tpl in github.com/omacom/omarchy (branch quattro).
   The thresholds are a draft. */

export type Role = {
  key: string;
  paints: string;
  /* what Omarchy uses when a theme leaves the key out; none = required */
  fallback?: string;
};

export type RoleGroup = {
  title: string;
  about: string;
  roles: Role[];
};

export const ROLE_GROUPS: RoleGroup[] = [
  {
    title: "Ground",
    about: "The surfaces everything sits on, from raised to recessed.",
    roles: [
      { key: "background", paints: "Windows, the terminal, the bar" },
      {
        key: "lighter_background",
        paints: "Raised surfaces: cards, popups, graph fills",
        fallback: "background",
      },
      {
        key: "dark_background",
        paints: "Recessed areas: sidebars, inactive panes",
        fallback: "background, 25% toward black",
      },
      {
        key: "darker_background",
        paints: "The deepest recesses: gutters, floating windows",
        fallback: "background, 50% toward black",
      },
    ],
  },
  {
    title: "Text",
    about: "From loudest to quietest. Only the first three are for words people must read.",
    roles: [
      {
        key: "bright_foreground",
        paints: "Emphasis, bold text, and the cursor",
        fallback: "foreground",
      },
      { key: "foreground", paints: "Body text, bar text, controls" },
      {
        key: "light_foreground",
        paints: "Text a step quieter than foreground",
        fallback: "foreground",
      },
      {
        key: "dark_foreground",
        paints: "Dim text: comments, line numbers, inactive tabs",
        fallback: "foreground",
      },
      {
        key: "muted",
        paints: "The quietest: borders, hints, terminal bright black",
        fallback: "dark_foreground",
      },
    ],
  },
  {
    title: "Emphasis",
    about:
      "Where the eye should go. The accent is the theme's signature — and the middle band of the stepped logo.",
    roles: [
      { key: "accent", paints: "Active window border, focus, links, the stepped logo" },
      { key: "selection", paints: "Selected text and highlighted rows", fallback: "background" },
      { key: "selection_foreground", paints: "Text on a selection", fallback: "bright_foreground" },
    ],
  },
  {
    title: "Hues",
    about:
      "The terminal's colors, named rather than numbered. Each also carries a meaning in the interface.",
    roles: [
      {
        key: "red",
        paints: "Errors, destructive actions, and anything in the bar asking for attention",
      },
      { key: "yellow", paints: "Warnings and pending changes" },
      { key: "green", paints: "Success: done, connected, charging" },
      { key: "blue", paints: "Information and neutral notices" },
      { key: "cyan", paints: "Terminal and editor syntax" },
      { key: "magenta", paints: "Terminal and editor syntax" },
      { key: "orange", paints: "Editor syntax", fallback: "yellow" },
      { key: "brown", paints: "Editor syntax", fallback: "orange, 50% toward black" },
      {
        key: "bright_red … bright_magenta",
        paints: "The bright terminal colors, one for each of the six above",
        fallback: "the hue, 20% toward white",
      },
    ],
  },
  {
    title: "Settings",
    about: "Not colors a person reads, but they shape how the rest is used.",
    roles: [
      { key: "mode", paints: '"dark" or "light"', fallback: "worked out from background" },
      {
        key: "hyprland_active_border",
        paints: "The active window border; may be a gradient",
        fallback: "accent",
      },
      {
        key: "hyprland_inactive_border",
        paints: "Every other window border",
        fallback: "a neutral grey",
      },
    ],
  },
];

/* The sixteen terminal colors, and the key each one takes. */
export const TERMINAL: { n: number; name: string; key: string }[] = [
  { n: 0, name: "black", key: "background" },
  { n: 1, name: "red", key: "red" },
  { n: 2, name: "green", key: "green" },
  { n: 3, name: "yellow", key: "yellow" },
  { n: 4, name: "blue", key: "blue" },
  { n: 5, name: "magenta", key: "magenta" },
  { n: 6, name: "cyan", key: "cyan" },
  { n: 7, name: "white", key: "foreground" },
  { n: 8, name: "bright black", key: "muted" },
  { n: 9, name: "bright red", key: "bright_red" },
  { n: 10, name: "bright green", key: "bright_green" },
  { n: 11, name: "bright yellow", key: "bright_yellow" },
  { n: 12, name: "bright blue", key: "bright_blue" },
  { n: 13, name: "bright magenta", key: "bright_magenta" },
  { n: 14, name: "bright cyan", key: "bright_cyan" },
  { n: 15, name: "bright white", key: "bright_foreground" },
];

export type Pair = {
  id: string;
  fg: string;
  bg: string;
  min: number;
  level: "must" | "should";
  why: string;
};

/* Contrast pairs, as WCAG 2 ratios. 4.5 is the bar for reading text,
   3 for parts of the interface you need to find. */
export const PAIRS: Pair[] = [
  { id: "text", fg: "foreground", bg: "background", min: 4.5, level: "must", why: "Body text" },
  {
    id: "raised",
    fg: "foreground",
    bg: "lighter_background",
    min: 4.5,
    level: "must",
    why: "Text on cards and popups",
  },
  {
    id: "selection",
    fg: "selection_foreground",
    bg: "selection",
    min: 4.5,
    level: "must",
    why: "Selected text stays readable",
  },
  {
    id: "accent",
    fg: "accent",
    bg: "background",
    min: 3,
    level: "must",
    why: "Focus and the active window are visible",
  },
  {
    id: "cursor",
    fg: "bright_foreground",
    bg: "background",
    min: 3,
    level: "must",
    why: "You can find the cursor",
  },
  {
    id: "hues",
    fg: "red, yellow, green, blue, cyan, magenta",
    bg: "background",
    min: 3,
    level: "should",
    why: "Colored output and status read",
  },
];

export const HUES = ["red", "yellow", "green", "blue", "cyan", "magenta"];

/* A colors.toml a new theme can start from: the required keys, then the
   ones Omarchy can work out, commented. */
export function tomlTemplate(): string {
  const lines = ['mode = "dark"', ""];
  for (const g of ROLE_GROUPS) {
    if (g.title === "Settings") continue;
    lines.push(`# ${g.title.toLowerCase()}`);
    for (const r of g.roles) {
      if (r.key.includes("…")) {
        for (const h of HUES) lines.push(`# bright_${h} = "#"  # ${r.fallback}`);
        continue;
      }
      lines.push(r.fallback ? `# ${r.key} = "#"  # else ${r.fallback}` : `${r.key} = "#"`);
    }
    lines.push("");
  }
  return lines.join("\n").trimEnd();
}
