/* The color-role contract. Omarchy is themed by its users, so the system
   never declares a color: it names the roles a theme fills, says what each
   one paints, and sets the contrast a theme's pairs must reach. Every page,
   tool and component speaks in these roles, never in hex.

   DRAFT — the roles, names and thresholds are a starting point to correct. */

export type Role = {
  name: string;
  paints: string;
  /* where the value comes from when a theme leaves it out */
  fallback?: string;
};

export type RoleGroup = {
  title: string;
  about: string;
  roles: Role[];
};

export const ROLE_GROUPS: RoleGroup[] = [
  {
    title: "Base",
    about: "The ground and what sits on it. Every theme fills these.",
    roles: [
      { name: "background", paints: "Desktop, window and terminal backgrounds" },
      { name: "foreground", paints: "Text and icons on the background" },
      {
        name: "muted",
        paints: "Secondary text: hints, timestamps, inactive labels",
        fallback: "color8",
      },
      {
        name: "surface",
        paints: "Raised areas: the bar, menus, notifications",
        fallback: "background",
      },
      { name: "border", paints: "Inactive window borders and dividers", fallback: "color8" },
    ],
  },
  {
    title: "Emphasis",
    about: "Where the eye should go. The accent is the theme's signature.",
    roles: [
      { name: "accent", paints: "Active window border, focus rings, the chosen item" },
      {
        name: "selection-background",
        paints: "Selected text and the highlighted row in menus",
        fallback: "accent",
      },
      { name: "selection-foreground", paints: "Text on a selection", fallback: "background" },
      { name: "cursor", paints: "The terminal cursor", fallback: "foreground" },
    ],
  },
  {
    title: "Status",
    about: "Meaning, not decoration. Taken from the terminal colors unless a theme says otherwise.",
    roles: [
      {
        name: "error",
        paints: "Failures, destructive actions, urgent notifications",
        fallback: "color1",
      },
      { name: "warning", paints: "Low battery, pending changes, caution", fallback: "color3" },
      { name: "success", paints: "Done, connected, charging", fallback: "color2" },
      { name: "info", paints: "Neutral notices and links", fallback: "color4" },
    ],
  },
];

/* The sixteen terminal colors, in their standard order. */
export const TERMINAL = [
  "black",
  "red",
  "green",
  "yellow",
  "blue",
  "magenta",
  "cyan",
  "white",
  "bright black",
  "bright red",
  "bright green",
  "bright yellow",
  "bright blue",
  "bright magenta",
  "bright cyan",
  "bright white",
];

export type Pair = {
  fg: string;
  bg: string;
  min: number;
  level: "must" | "should";
  why: string;
};

/* Contrast pairs, as WCAG 2 ratios. 4.5 is the bar for reading text,
   3 for text that is large or secondary and for parts of the interface. */
export const PAIRS: Pair[] = [
  { fg: "foreground", bg: "background", min: 4.5, level: "must", why: "Body text" },
  { fg: "foreground", bg: "surface", min: 4.5, level: "must", why: "Text in the bar and menus" },
  {
    fg: "selection-foreground",
    bg: "selection-background",
    min: 4.5,
    level: "must",
    why: "Selected text stays readable",
  },
  {
    fg: "accent",
    bg: "background",
    min: 3,
    level: "must",
    why: "Focus and the active window are visible",
  },
  { fg: "cursor", bg: "background", min: 3, level: "must", why: "You can find the cursor" },
  { fg: "muted", bg: "background", min: 3, level: "must", why: "Hints are quiet, not invisible" },
  { fg: "error", bg: "background", min: 3, level: "must", why: "Failures are never missed" },
  {
    fg: "color1–6, 9–14",
    bg: "background",
    min: 3,
    level: "should",
    why: "Colored terminal output reads",
  },
];

/* The contract as CSS a theme fills in. */
export function cssTemplate(): string {
  const lines = [":root {"];
  for (const g of ROLE_GROUPS) {
    lines.push(`  /* ${g.title.toLowerCase()} */`);
    for (const r of g.roles) {
      const note = r.fallback ? ` /* or var(--omarchy-${r.fallback}) */` : "";
      lines.push(`  --omarchy-${r.name}: ;${note}`);
    }
  }
  lines.push("  /* terminal */");
  TERMINAL.forEach((name, i) => lines.push(`  --omarchy-color${i}: ; /* ${name} */`));
  lines.push("}");
  return lines.join("\n");
}
