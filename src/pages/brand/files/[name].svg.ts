/* Each master file as its own download, e.g. /brand/files/omarchy-icon-white.svg */
import type { APIRoute, GetStaticPaths } from "astro";
import { brandFiles } from "../../../lib/brand";

export const getStaticPaths: GetStaticPaths = () =>
  brandFiles().map((f) => ({
    params: { name: f.name.replace(/\.svg$/, "") },
    props: { body: f.body },
  }));

export const GET: APIRoute = ({ props }) =>
  new Response(props.body as string, { headers: { "Content-Type": "image/svg+xml" } });
