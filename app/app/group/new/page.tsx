"use client";
// Start a group chat: pick two to four characters (Hick's law: four voices at most), name it if you like, go.
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
      <main className="mx-auto w-full max-w-6xl px-4 pb-40 pt-8 sm:px-8 sm:pt-12">
        <h1 className="text-4xl leading-[1.05] sm:text-5xl">New group chat</h1>
        <p className="mt-3 max-w-xl text-muted">Pick two to four characters. Everyone answers when you speak, and they hear each other.</p>

        <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4" role="group" aria-label="Characters">
          {all.map((c) => {
            const on = picked.includes(c.id);
            return (
              <button key={c.id} type="button" aria-pressed={on} onClick={() => toggle(c.id)}
                className={`cast-card relative flex min-h-11 items-center gap-3 rounded-[var(--radius)] border p-3 text-left sm:p-4 ${on ? "border-accent bg-[color-mix(in_oklab,var(--accent)_10%,var(--card))]" : "border-line bg-card"}`}>
                <Portrait c={c} size={44} />
                <span className="min-w-0">
                  <span className="block truncate font-medium leading-tight">{c.name}</span>
                  <span className="mt-0.5 line-clamp-2 block text-[.82rem] leading-snug text-muted">{c.tagline}</span>
                </span>
                <span className={`absolute right-2.5 top-2.5 grid size-5 place-items-center rounded-full border text-[.7rem] transition-colors duration-150 ${on ? "border-accent bg-accent text-accent-fg" : "border-line text-transparent"}`} aria-hidden>
                  {on ? picked.indexOf(c.id) + 1 : ""}
                </span>
              </button>
            );
          })}
        </div>
      </main>

      <div ref={bar} className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-bg/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-md">
        <div className="mx-auto flex w-full max-w-6xl flex-wrap items-center gap-3 px-4 py-3 sm:flex-nowrap sm:px-8">
          <div className="flex min-w-0 flex-1 items-center gap-3">
            {chosen.length ? <Cluster members={chosen} size={34} /> : null}
            <label className="sr-only" htmlFor="gname">Group name</label>
            <input id="gname" className="fd-input min-w-0 flex-1" value={name} onChange={(e) => setName(e.target.value)} placeholder={chosen.length ? fallbackName : "Group name (optional)"} maxLength={60} />
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
