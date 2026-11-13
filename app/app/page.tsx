"use client";
// Home at "/app": describe a new character in one line, pick up a chat, or pick someone from the cast.
// The cast is shown by their faces: a big portrait each, the name, one line.
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { Portrait } from "@/components/Portrait";
import { shake } from "@/kit/ui/motion";
import { CAST } from "@/lib/cast";
import { recentChats, useStore } from "@/lib/store";
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

  return (
    <div className="min-h-dvh">
      <AppHeader right={<span className="hidden sm:contents"><Link href="/app/new" className="sk-btn sk-btn-quiet">New character</Link></span>} />
      <main className="wrap pb-28">
        <section className="sk-stagger pt-12 sm:pt-20">
          <h1 className="max-w-3xl text-[2.6rem] leading-[1] sm:text-[4.25rem]">Who do you want to talk to?</h1>
          <p className="mt-5 max-w-xl text-[1.05rem] leading-relaxed text-muted sm:text-lg">Describe a character in one line and Dramatis writes them, or pick someone from the cast.</p>
          <form ref={form} className="idea-field mt-8 max-w-3xl" onSubmit={(e) => { e.preventDefault(); write(idea); }}>
            <label className="sr-only" htmlFor="idea">Describe a character</label>
            <input id="idea" value={idea} onChange={(e) => setIdea(e.target.value)} placeholder="A grumpy dragon who runs a bakery" autoComplete="off" maxLength={500} />
            <button type="submit" className="sk-btn">Write my character</button>
          </form>
          <div className="mt-4 flex flex-wrap gap-2">
            {IDEAS.map((t) => (
              <button key={t} type="button" onClick={() => write(t)} className="min-h-11 rounded-full border border-line px-4 text-left text-sm text-muted transition-colors duration-150 hover:border-[var(--line-strong)] hover:text-fg">{t}</button>
            ))}
          </div>
        </section>

        {recent.length > 0 && (
          <Shelf title="Pick up where you left off" cols="sm:grid-cols-2 lg:grid-cols-3">
            {recent.map(({ chat, character }) => {
              const last = [...chat.messages].reverse().find((m) => m.role === "assistant");
              return (
                <Link key={character.id} href={`/app/chat/${encodeURIComponent(character.id)}`} className="row-card">
                  <Portrait c={character} size={56} />
                  <span className="min-w-0">
                    <span className="block truncate font-medium">{character.name}</span>
                    <span className="mt-0.5 line-clamp-2 block text-sm leading-snug text-muted">{last ? textOf(last).replace(/\*[^*]*\*/g, "").trim() : character.tagline}</span>
                  </span>
                </Link>
              );
            })}
          </Shelf>
        )}
        {mine.length > 0 && <Shelf title="Your characters">{mine.map((c) => <CastCard key={c.id} c={c} />)}</Shelf>}
        <Shelf id="cast" title="To play with">{CAST.filter((c) => c.group === "play").map((c) => <CastCard key={c.id} c={c} />)}</Shelf>
        <Shelf title="To practise with">{CAST.filter((c) => c.group === "practice").map((c) => <CastCard key={c.id} c={c} />)}</Shelf>
      </main>
    </div>
  );
}

function Shelf({ id, title, children, cols = "grid-cols-2 lg:grid-cols-4" }: { id?: string; title: string; children: React.ReactNode; cols?: string }) {
  return (
    <section id={id} className="mt-16 scroll-mt-20 sm:mt-20">
      <h2 className="font-mono text-[.8rem] font-medium tracking-normal text-muted">{title}</h2>
      <div className={`sk-stagger mt-5 grid gap-x-4 gap-y-8 sm:gap-x-6 ${cols}`}>{children}</div>
    </section>
  );
}

function CastCard({ c }: { c: Character }) {
  return (
    <Link href={`/app/chat/${encodeURIComponent(c.id)}`} className="cast-card group">
      <div className="cast-card__media"><Portrait c={c} size="fill" /></div>
      <div className="mt-4 flex items-baseline justify-between gap-3">
        <h3 className="min-w-0 truncate text-[1.1rem] font-medium leading-tight tracking-[-0.01em] sm:text-[1.2rem]">{c.name}</h3>
        <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden className="cast-card__go flex-none text-muted"><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
      <p className="mt-1.5 line-clamp-2 text-[.92rem] leading-snug text-muted sm:text-[.98rem]">{c.tagline.replace(/(\d)-/g, "$1\u2011")}</p>
    </Link>
  );
}
