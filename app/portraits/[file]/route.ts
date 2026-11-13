// A cast member's portrait as an SVG file, for the landing page's plain <img> tags: /portraits/odile.svg (320px)
// and /portraits/odile-64.svg (64px, for small faces), so each image's own size fits where it is shown.
import { CAST } from "@/lib/cast";
import { portraitFor } from "@/lib/portraits";

export const dynamic = "force-static";
export const dynamicParams = false;
export function generateStaticParams() { return CAST.flatMap((c) => [{ file: `${c.id}.svg` }, { file: `${c.id}-64.svg` }]); }

export async function GET(_req: Request, { params }: { params: Promise<{ file: string }> }) {
  const m = (await params).file.match(/^(.+?)(?:-(64))?\.svg$/);
  const c = m && CAST.find((x) => x.id === m[1]);
  if (!m || !c) return new Response("Not found", { status: 404 });
  const px = m[2] ? 64 : 320;
  const svg = portraitFor(c).replace(' aria-hidden="true" focusable="false" style="display:block;width:100%;height:100%"', ` width="${px}" height="${px}"`);
  return new Response(svg, { headers: { "content-type": "image/svg+xml; charset=utf-8", "cache-control": "public, max-age=86400" } });
}
