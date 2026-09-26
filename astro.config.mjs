import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";

/* The docs are Astro pages under src/pages. The tools (logo/, icon/ and the
   css/, js/ and assets/ they share) live in public/ and ship byte for byte:
   plain HTML and ES modules, reached by relative paths, so they work under
   any base. BASE_PATH is set by the Pages workflow (/omarchy-design/). */
const base = process.env.BASE_PATH ?? "/";

export default defineConfig({
  base,
  trailingSlash: "always",
  integrations: [mdx()],
  /* code blocks stay neutral like the rest of the site */
  markdown: { syntaxHighlight: false },
  devToolbar: { enabled: false },
  redirects: {
    /* the old type sheet; redirect targets don't get the base added */
    "/type/": `${base}foundations/typography/`,
  },
  vite: {
    plugins: [toolIndexes()],
  },
});

/* In dev, public/ is served file by file, so /logo/ would 404; point a
   tool's directory url at its index.html the way the static host does. */
function toolIndexes() {
  const tools = ["logo", "icon"];
  return {
    name: "tool-indexes",
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        const root = server.config.base.replace(/\/$/, "");
        for (const t of tools) {
          if (req.url === `${root}/${t}/` || req.url === `${root}/${t}`) {
            req.url = `${root}/${t}/index.html`;
          }
        }
        next();
      });
    },
  };
}
