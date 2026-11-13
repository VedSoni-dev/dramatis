"use client";
// Start a group chat: pick two to four characters by their faces (Hick's law: four voices at most), name it if you
// like, go.
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { AppHeader, Wordmark } from "@/components/AppHeader";
import { Cluster } from "@/components/Cluster";
import { Portrait } from "@/components/Portrait";
import { shake } from "@/kit/ui/motion";
import { allCharacters, listNames, saveGroup, uid, useStore } from "@/lib/store";
import { GROUP_MAX, GROUP_MIN } from "@/lib/types";

export default function NewGroup() {
  const s = useStore();
  const router = useRouter();
  const [picked, setPicked] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const bar = useRef<HTMLDivElement>(null);

  const all = s ? allCharacters(s) : [];
  const chosen = picked.map((id) => all.find((c) => c.id === id)).filter((c) => !!c);
  const fallbackName = listNames(chosen.map((c) => c.name.split(" ")[0]!));

  function toggle(id: string) {
    setError(null);
    if (picked.includes(id)) { setPicked(picked.filter((p) => p !== id)); return; }
    if (picked.length >= GROUP_MAX) { setError(`Four at most, so everyone gets a word in. Take someone out first.`); if (bar.current) shake(bar.current); return; }
    setPicked([...picked, id]);
  }

  function start() {
    if (picked.length < GROUP_MIN) { setError("Pick at least two characters."); if (bar.current) shake(bar.current); return; }
    const id = uid().slice(0, 12);
    const ok = saveGroup({ id, name: name.replace(/\s+/g, " ").trim().slice(0, 60) || fallbackName, memberIds: picked, createdAt: Date.now() });
    if (!ok) { setError("This browser is out of room. Remove a picture or an old character and try again."); return; }
    router.push(`/app/group/${id}`);
  }

  return (
    <div className="min-h-dvh">
      <AppHeader left={<Wordmark />} />
      <main className="wrap pb-44 pt-10 sm:pt-14">
        <h1 className="text-4xl leading-[1.05] sm:text-[3.25rem]">New group chat</h1>
        <p className="mt-3 max-w-xl text-[1.05rem] leading-relaxed text-muted">Pick two to four characters. Everyone answers when you speak, and they hear each other.</p>

        <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 sm:gap-x-6 lg:grid-cols-4" role="group" aria-label="Characters">
          {all.map((c) => {
            const on = picked.includes(c.id);
            return (
              <button key={c.id} type="button" aria-pressed={on} onClick={() => toggle(c.id)} className="cast-card pick-card text-left">
                <span className="cast-card__media relative block">
                  <Portrait c={c} size="fill" />
                  <span className="pick-card__mark" aria-hidden>{on ? picked.indexOf(c.id) + 1 : ""}</span>
                </span>
                <span className="mt-4 block truncate text-[1.1rem] font-medium leading-tight tracking-[-0.01em] sm:text-[1.2rem]">{c.name}</span>
                <span className="mt-1.5 line-clamp-2 block text-[.92rem] leading-snug text-muted sm:text-[.98rem]">{c.tagline}</span>
              </button>
            );
          })}
        </div>
      </main>

      <div ref={bar} className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-bg pb-[env(safe-area-inset-bottom)]">
        <div className="wrap flex flex-wrap items-center gap-3 py-3 sm:flex-nowrap">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            {chosen.length ? <Cluster members={chosen} size={40} /> : null}
            <label className="sr-only" htmlFor="gname">Group name</label>
            <input id="gname" className="fd-input min-w-0 flex-1 rounded-full" value={name} onChange={(e) => setName(e.target.value)} placeholder={chosen.length ? fallbackName : "Group name (optional)"} maxLength={60} />
          </div>
          <div className="flex w-full items-center justify-end gap-2 sm:w-auto">
            <Link href="/app" className="sk-btn sk-btn-quiet">Cancel</Link>
            <button type="button" className="sk-btn" onClick={start} disabled={picked.length < GROUP_MIN}>
              Start group chat{picked.length ? ` (${picked.length})` : ""}
            </button>
          </div>
          {error && <p className="sk-error w-full" role="alert">{error}</p>}
        </div>
      </div>
    </div>
  );
}
