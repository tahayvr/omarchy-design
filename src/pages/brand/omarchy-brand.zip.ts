/* Every master file in one zip, with a note on the rules. */
import type { APIRoute } from "astro";
import { MIN, brandFiles } from "../../lib/brand";
import { zip } from "../../lib/zip";

const README = `Omarchy brand files

wordmark, icon and lockup, each in white, black and (wordmark and lockup)
the stepped fill in the reference Hackerman bands.

- Keep a quarter of the mark's height clear on every side.
- Wordmark no narrower than ${MIN.wordmark}px on screens; icon no smaller than ${MIN.icon}px.
- Don't stretch, rotate, outline, recolor or rebuild the marks.

The full rules are under Brand → Logo on the Omarchy Design site. For
other colors, fills and sizes, use its Logo Foundry.
`;

export const GET: APIRoute = () =>
  new Response(
    zip([
      ...brandFiles().map((f) => ({ name: f.name, body: f.body })),
      { name: "README.txt", body: README },
    ]),
    {
      headers: { "Content-Type": "application/zip" },
    },
  );
