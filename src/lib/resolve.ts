/* colors.toml in, every key out: a port of bin/omarchy-theme-color's
   parsing and fallbacks (github.com/omacom/omarchy, branch quattro). Pure,
   so the build and the in-page theme picker share it. */

export type Colors = Record<string, string>;

export function parseColors(text: string): Colors {
  const out: Colors = {};
  for (const line of text.split("\n")) {
    const m = /^\s*([A-Za-z0-9_-]+)\s*=\s*(.+?)\s*$/.exec(line);
    if (!m || m[1].startsWith("#")) continue;
    let v = m[2];
    const q = /^["']([^"']*)["']/.exec(v);
    v = q ? q[1] : v.replace(/\s+#.*$/, "");
    out[m[1]] = v.trim();
  }
  return out;
}

const HEX = /^#[0-9a-f]{6}$/i;

/* start → end by amount (0..1), as omarchy-theme-color's mix_color */
export function mix(start: string, end: string, amount: number): string {
  if (!HEX.test(start) || !HEX.test(end)) return start;
  const n = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
  const [a, b] = [n(start), n(end)];
  return (
    "#" +
    a
      .map((v, i) =>
        Math.round(v * (1 - amount) + b[i] * amount)
          .toString(16)
          .padStart(2, "0"),
      )
      .join("")
  );
}

const LEGACY_PALETTE: Record<string, string> = {
  background: "bg",
  dark_background: "dark_bg",
  darker_background: "darker_bg",
  lighter_background: "lighter_bg",
  foreground: "fg",
  dark_foreground: "dark_fg",
  light_foreground: "light_fg",
  bright_foreground: "bright_fg",
};
const LEGACY_ANSI: Record<string, string> = {
  red: "color1",
  green: "color2",
  yellow: "color3",
  blue: "color4",
  magenta: "color5",
  cyan: "color6",
  bright_red: "color9",
  bright_green: "color10",
  bright_yellow: "color11",
  bright_blue: "color12",
  bright_magenta: "color13",
  bright_cyan: "color14",
};
export const ANSI: Record<string, string> = {
  color0: "background",
  color1: "red",
  color2: "green",
  color3: "yellow",
  color4: "blue",
  color5: "magenta",
  color6: "cyan",
  color7: "foreground",
  color8: "muted",
  color9: "bright_red",
  color10: "bright_green",
  color11: "bright_yellow",
  color12: "bright_blue",
  color13: "bright_magenta",
  color14: "bright_cyan",
  color15: "bright_foreground",
};

export function resolveColors(raw: Colors): Colors {
  const c: Colors = { ...raw };
  const alias = (k: string, from: string) => {
    if (!c[k] && c[from]) c[k] = c[from];
  };
  for (const [k, legacy] of Object.entries(LEGACY_PALETTE)) alias(k, legacy);
  c.background ||= c.color0;
  c.foreground ||= c.color7;
  if (c.background) c.color0 = c.background;
  if (c.foreground) c.color7 = c.foreground;
  for (const [k, legacy] of Object.entries(LEGACY_ANSI)) alias(k, legacy);
  alias("magenta", "purple");
  alias("bright_magenta", "bright_purple");
  c.light_foreground ||= c.color7 || c.foreground;
  c.bright_foreground ||= c.color15 || c.foreground;
  c.cursor = c.bright_foreground;
  c.lighter_background ||= c.color0 || c.background;
  c.dark_foreground ||= c.color8 || c.foreground;
  c.muted ||= c.color8 || c.dark_foreground;
  c.selection ||= c.selection_background || c.color8 || c.color0 || c.background;
  c.selection_background ||= c.selection;
  c.selection_foreground ||= c.bright_foreground;
  c.orange ||= c.yellow;
  c.brown ||= mix(c.orange, "#000000", 0.5);
  c.dark_background ||= mix(c.background, "#000000", 0.25);
  c.darker_background ||= mix(c.background, "#000000", 0.5);
  for (const h of ["red", "yellow", "green", "cyan", "blue", "magenta"])
    c[`bright_${h}`] ||= mix(c[h], "#ffffff", 0.2);
  for (const [n, k] of Object.entries(ANSI)) c[n] ||= c[k];
  if (!c.mode) {
    const bg = c.background ?? "";
    const lum = HEX.test(bg)
      ? [1, 3, 5].reduce((s, i) => s + parseInt(bg.slice(i, i + 2), 16), 0)
      : 0;
    c.mode = lum > 382 ? "light" : "dark";
  }
  return c;
}

/* The first color of a Hyprland border spec ("rgba(26a269ee) rgba(…) 45deg",
   "#89b4fa", or a key name), as #rrggbb. */
export function borderColor(spec: string | undefined, c: Colors): string | undefined {
  if (!spec) return undefined;
  const first = spec.trim().split(/\s+/)[0];
  if (c[first]) return c[first];
  const rgba = /^rgba?\(([0-9a-f]{6})([0-9a-f]{2})?\)$/i.exec(first);
  if (rgba) return `#${rgba[1]}`;
  if (HEX.test(first)) return first;
  return undefined;
}

/* The keys a preview needs, as CSS custom properties. */
export function keyVars(c: Colors): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [k, v] of Object.entries(c)) if (HEX.test(v)) out[`--k-${k.replace(/_/g, "-")}`] = v;
  out["--k-border-active"] = borderColor(c.hyprland_active_border, c) ?? c.accent;
  out["--k-border-active-fg"] = borderColor(c.hyprland_active_border, c) ?? c.foreground;
  out["--k-border-inactive"] = borderColor(c.hyprland_inactive_border, c) ?? "#595959";
  return out;
}
