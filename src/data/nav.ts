/* The site map. Sections are the top-level doors; items are the sidebar.
   An item without an href is planned: it shows in the sidebar as "soon" so
   the roadmap is visible, but it isn't a link. `tool` items leave the docs
   for one of the plain-HTML tools in public/. */

export type NavItem = {
  title: string;
  href?: string;
  tool?: boolean;
};

export type NavSection = {
  title: string;
  href: string;
  blurb: string;
  items: NavItem[];
};

export const NAV: NavSection[] = [
  {
    title: "Foundations",
    href: "/foundations/",
    blurb: "Color roles, type and the rules every theme meets.",
    items: [
      { title: "Overview", href: "/foundations/" },
      { title: "Color roles", href: "/foundations/color/" },
      { title: "Typography", href: "/foundations/typography/" },
      { title: "Grid and pixel unit" },
      { title: "Iconography" },
      { title: "Motion" },
      { title: "Accessibility" },
    ],
  },
  {
    title: "Brand",
    href: "/brand/",
    blurb: "How Omarchy looks and speaks.",
    items: [
      { title: "Overview", href: "/brand/" },
      { title: "Logo", href: "/brand/logo/" },
      { title: "Graphic elements", href: "/brand/graphic-elements/" },
      { title: "Voice and tone", href: "/brand/voice/" },
      { title: "Downloads", href: "/brand/downloads/" },
      { title: "Logo Foundry", href: "/logo/", tool: true },
    ],
  },
  {
    title: "Desktop UI",
    href: "/desktop/",
    blurb: "How the desktop is built, in any theme.",
    items: [
      { title: "Overview", href: "/desktop/" },
      { title: "Theme anatomy" },
      { title: "Components" },
      { title: "Patterns" },
    ],
  },
  {
    title: "Tools",
    href: "/tools/",
    blurb: "Generators that follow the rules for you.",
    items: [
      { title: "Overview", href: "/tools/" },
      { title: "Logo Foundry", href: "/logo/", tool: true },
    ],
  },
  {
    title: "About",
    href: "/about/",
    blurb: "What this is and how it's made.",
    items: [
      { title: "Overview", href: "/about/" },
      { title: "Principles", href: "/about/principles/" },
    ],
  },
];

/* Site paths are written from the root; this puts the deploy base in front. */
export function url(path: string): string {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return base + path;
}

/* The section a page belongs to, by its path. */
export function sectionOf(pathname: string): NavSection | undefined {
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  const path = pathname.startsWith(base) ? pathname.slice(base.length) : pathname;
  return NAV.find((s) => path.startsWith(s.href));
}
