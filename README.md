# Omarchy Design

The design system for Omarchy: its brand, the rules its desktop is built on, and the tools that apply them.

## Layout

- `src/pages/` — the docs, as Astro and MDX pages. The URL follows the file path.
- `src/layouts/Docs.astro` — the docs shell: header, sidebar, breadcrumbs, "on this page".
- `src/data/nav.ts` — the site map. Add a page here to put it in the sidebar; an item without an `href` shows as "soon".
- `src/data/roles.ts` — the color-role contract, in the keys of a theme's `colors.toml`. The color page renders from it.
- `src/data/themes/` — copies of the `colors.toml` of every theme Omarchy ships, which the color page audits for contrast. Refresh with `just themes`.
- `src/lib/brand.ts` — reads the master marks and the Logo Foundry's own rules (`public/js/logo/core/bands.js`, `marks.js`) for the brand pages.
- `public/` — the tools (`logo/`, `icon/`) and the `css/`, `js/` and `assets/` they share. Plain HTML and ES modules, shipped as they are.

## Working on it

```sh
just install   # dependencies and the pre-commit hook
just dev       # dev server at localhost:4321
just check     # format and lint, as CI does
just build     # static site in dist/
```

Pushes to `master` deploy to GitHub Pages through `.github/workflows/deploy.yml`, built under `/omarchy-design/`.
