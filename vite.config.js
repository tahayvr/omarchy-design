import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";

const page = (path) => fileURLToPath(new URL(path, import.meta.url));

export default defineConfig({
  /* every page is its own document, so a missing url is a 404, not a fallback */
  appType: "mpa",
  server: { port: 5173, open: "/" },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        home: page("index.html"),
        logo: page("logo/index.html"),
        icon: page("icon/index.html"),
        type: page("type/index.html"),
      },
    },
  },
});
