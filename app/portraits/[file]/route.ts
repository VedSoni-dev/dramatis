// A cast member's portrait as an SVG file (/portraits/odile.svg), for the landing page's plain <img> tags.
import { CAST } from "@/lib/cast";
import { portraitFor } from "@/lib/portraits";

export const dynamic = "force-static";
export const dynamicParams = false;
export function generateStaticParams() { return CAST.map((c) => ({ file: `${c.id}.svg` })); }

export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const id = (await params).file.replace(/\.svg$/, "");
  const c = CAST.find((x) => x.id === id);
  if (!c) return new Response("Not found", { status: 404 });
  const svg = portraitFor(c).replace(' aria-hidden="true" focusable="false" style="display:block;width:100%;height:100%"', ' width="320" height="320"');
  return new Response(svg, { headers: { "content-type": "image/svg+xml; charset=utf-8", "cache-control": "public, max-age=86400" } });
}
