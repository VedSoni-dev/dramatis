// A character's portrait: their own picture, or a serif monogram on a tonal gradient lit from above like a
// spotlight. Tones are desaturated so the bronze accent stays the only colour that means something.
import type { Character } from "@/lib/types";

const TONES = [
  ["#3a2f27", "#171310"], ["#2b2f33", "#121416"], ["#33302a", "#151411"], ["#2e2a30", "#131214"],
  ["#2a312d", "#111412"], ["#382c2a", "#171211"], ["#30302f", "#141414"], ["#28303a", "#101318"],
];

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

export function initials(name: string): string {
  const words = name.replace(/^(captain|detective|dr\.?|professor|madame|sir|lady|lord|dame|mr\.?|mrs\.?|ms\.?)\s+/i, "").split(/\s+/).filter(Boolean);
  const pick = words.length > 1 ? words[0]![0]! + words[words.length - 1]![0]! : (words[0] ?? "?").slice(0, 1);
  return pick.toUpperCase();
}

export function Portrait({ c, size = 48, live = false, className = "" }: { c: Pick<Character, "name" | "avatar">; size?: number; live?: boolean; className?: string }) {
  const h = hash(c.name || "?");
  const [a, b] = TONES[h % TONES.length]!;
  const angle = 150 + (h % 60);
  return (
    <span
      className={`portrait ${live ? "is-live" : ""} ${className}`}
      style={{ width: size, height: size, ["--pa" as string]: a, ["--pb" as string]: b, ["--pang" as string]: `${angle}deg`, fontSize: size * 0.36 }}
      aria-hidden
    >
      {c.avatar
        // eslint-disable-next-line @next/next/no-img-element
        ? <img src={c.avatar} alt="" width={size} height={size} />
        : <span className="portrait-mono">{initials(c.name || "?")}</span>}
    </span>
  );
}
