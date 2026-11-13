// A character's portrait: their own picture if they have one, else their drawn face (lib/portraits.ts): the cast's
// own looks, or one seeded from the name, so every character has a face of its own. The SVG is built only from fixed
// recipes (never from what a person typed), so inlining it is safe.
import { portraitFor } from "@/lib/portraits";
import type { Character } from "@/lib/types";

type Who = Pick<Character, "name" | "avatar"> & { id?: string };

export function Portrait({ c, size = 48, live = false, className = "" }: { c: Who; size?: number | "fill"; live?: boolean; className?: string }) {
  const box = size === "fill" ? undefined : { width: size, height: size };
  return (
    <span className={`portrait ${size === "fill" ? "portrait--fill" : ""} ${live ? "is-live" : ""} ${className}`} style={box} aria-hidden>
      {c.avatar
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={c.avatar} alt="" width={typeof size === "number" ? size : undefined} height={typeof size === "number" ? size : undefined} />
        : <span className="portrait-art" dangerouslySetInnerHTML={{ __html: portraitFor(c) }} />}
    </span>
  );
}
