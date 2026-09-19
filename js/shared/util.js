export function clamp(v, a, b) { return Math.min(b, Math.max(a, v)); }

/* a filename-safe name, e.g. "Omarchy Icon!" -> "omarchy-icon" */
export function slug(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "icon";
}
