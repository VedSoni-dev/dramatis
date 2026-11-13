// A group's portraits, overlapped like people standing together. `live` lights the one who is talking.
import { Portrait } from "@/components/Portrait";
import type { Character } from "@/lib/types";

export function Cluster({ members, size = 36, live }: { members: Character[]; size?: number; live?: string | null }) {
  return (
    <span className="flex flex-none items-center" aria-hidden>
      {members.slice(0, 4).map((c, i) => (
        <span key={c.id} className="rounded-[30%] ring-2 ring-bg" style={{ marginLeft: i ? -size * 0.32 : 0, zIndex: 10 - i }}>
          <Portrait c={c} size={size} live={live === c.id} />
        </span>
      ))}
    </span>
  );
}
