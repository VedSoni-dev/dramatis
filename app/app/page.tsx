"use client";
// Home at "/app": describe a new character in one line, pick up a chat, start a group chat, or pick from the cast.
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { Cluster } from "@/components/Cluster";
import { Portrait } from "@/components/Portrait";
import { shake } from "@/kit/ui/motion";
import { CAST } from "@/lib/cast";
import { listNames, recentChats, recentGroups, useStore } from "@/lib/store";
import { textOf, type Character } from "@/lib/types";

const IDEAS = [
  "a retired lighthouse keeper who writes terrible poetry",
  "a medieval knight who just discovered smartphones",
  "my future self, ten years from now",
];

export default function Home() {
  const s = useStore();
  const router = useRouter();
  const [idea, setIdea] = useState("");
  const form = useRef<HTMLFormElement>(null);

  function write(text: string) {
    const t = text.replace(/\s+/g, " ").trim();
    if (t.length < 3) { if (form.current) shake(form.current); return; }
    try { sessionStorage.setItem("dramatis.idea", t); } catch { /* private mode: the form opens empty */ }
    router.push("/app/new?draft=1");
  }

  const recent = s ? recentChats(s).slice(0, 3) : [];
  const mine = s?.characters ?? [];
  const groups = s ? recentGroups(s).filter((x) => x.members.length >= 2).slice(0, 3) : [];

  return (
    <div className="min-h-dvh">
      <AppHeader right={<span className="hidden sm:contents"><Link href="/app/new" className="sk-btn sk-btn-quiet">New character</Link></span>} />
      <main className="mx-auto w-full max-w-6xl px-4 pb-24 sm:px-8">
        <section className="sk-stagger pt-10 sm:pt-16">
          <h1 className="max-w-3xl text-[2.6rem] leading-[1] sm:text-6xl">Who do you want to talk to?</h1>
          <p className="mt-4 max-w-xl text-muted">Describe a character in one line and Dramatis writes them, or pick someone from the cast below.</p>
          <form ref={form} className="mt-7 flex max-w-2xl flex-col gap-2 sm:flex-row" onSubmit={(e) => { e.preventDefault(); write(idea); }}>
            <label className="sr-only" htmlFor="idea">Describe a character</label>
            <input id="idea" className="fd-input flex-1" value={idea} onChange={(e) => setIdea(e.target.value)} placeholder="A grumpy dragon who runs a bakery" autoComplete="off" maxLength={500} />
            <button type="submit" className="sk-btn">Write my character</button>
          </form>
          <div className="mt-3 flex flex-wrap gap-2">
            {IDEAS.map((t) => (
              <button key={t} type="button" onClick={() => write(t)} className="min-h-11 rounded-full border border-line px-4 text-left text-sm text-muted transition-colors duration-150 hover:border-fg/25 hover:text-fg">{t}</button>
            ))}
          </div>
        </section>

        {recent.length > 0 && (
          <Shelf title="Pick up where you left off">
            {recent.map(({ chat, character }) => {
              const last = [...chat.messages].reverse().find((m) => m.role === "assistant");
              return <CastCard key={character.id} c={character} line={last ? textOf(last).replace(/\*[^*]*\*/g, "").trim() : character.tagline} />;
            })}
          </Shelf>
        )}
        <Shelf title="Group chats">
          <Link href="/app/group/new" className="cast-card group flex flex-col justify-between gap-4 rounded-[var(--radius)] border border-dashed border-line bg-transparent p-5">
            <Cluster members={CAST.filter((c) => ["odile", "brick", "ines-calder"].includes(c.id))} size={40} />
            <span>
              <span className="block text-[1.05rem] leading-tight">Start a group chat</span>
              <span className="mt-1 block text-sm leading-relaxed text-muted">Two to four characters who hear each other.</span>
            </span>
          </Link>
          {groups.map(({ group, chat, members }) => {
            const last = [...chat.messages].reverse().find((m) => m.role === "assistant");
            return (
              <Link key={group.id} href={`/app/group/${encodeURIComponent(group.id)}`} className="cast-card group flex flex-col gap-4 rounded-[var(--radius)] border border-line bg-card p-5">
                <Cluster members={members} size={40} />
                <span className="min-w-0">
                  <span className="block truncate text-[1.05rem] leading-tight">{group.name}</span>
                  <span className="mt-1 line-clamp-2 block text-sm leading-relaxed text-muted">{last ? textOf(last).replace(/\*[^*]*\*/g, "").trim() : listNames(members.map((c) => c.name))}</span>
                </span>
              </Link>
            );
          })}
        </Shelf>
        {mine.length > 0 && <Shelf title="Your characters">{mine.map((c) => <CastCard key={c.id} c={c} />)}</Shelf>}
        <Shelf title="To play with">{CAST.filter((c) => c.group === "play").map((c) => <CastCard key={c.id} c={c} />)}</Shelf>
        <Shelf title="To practise with">{CAST.filter((c) => c.group === "practice").map((c) => <CastCard key={c.id} c={c} />)}</Shelf>
      </main>
    </div>
  );
}

function Shelf({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-14">
      <h2 className="font-mono text-[.8rem] font-medium tracking-normal text-muted">{title}</h2>
      <div className="sk-stagger mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{children}</div>
    </section>
  );
}

function CastCard({ c, line }: { c: Character; line?: string }) {
  return (
    <Link href={`/app/chat/${encodeURIComponent(c.id)}`} className="cast-card group flex flex-col gap-4 rounded-[var(--radius)] border border-line bg-card p-5">
      <div className="flex items-center gap-3">
        <Portrait c={c} size={52} />
        <h3 className="min-w-0 text-[1.05rem] leading-tight tracking-[-0.01em]">{c.name}</h3>
      </div>
      <p className="line-clamp-2 text-sm leading-relaxed text-muted">{line ?? c.tagline}</p>
      <span className="mt-auto inline-flex items-center gap-1.5 text-sm text-fg/80 transition-colors duration-150 group-hover:text-accent">
        {line ? "Continue the chat" : "Start a chat"}
        <svg width="14" height="14" viewBox="0 0 24 24" aria-hidden className="transition-transform duration-150 group-hover:translate-x-0.5"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </span>
    </Link>
  );
}
