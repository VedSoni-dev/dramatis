"use client";
// A group chat. You say something; every member answers once, in turn, and each hears what the others just said.
// "Keep going" lets them talk on without you; "Another take" re-shoots the last line. Saved in this browser.
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { AppHeader } from "@/components/AppHeader";
import { Cluster } from "@/components/Cluster";
import { CharLine, UserLine } from "@/components/Lines";
import { useAI, useStudio } from "@/kit/react/studio";
import { anticipate } from "@/kit/ui/motion";
import { deleteGroup, findGroup, groupChatFor, listNames, membersOf, uid, useStore, writeChat } from "@/lib/store";
import { textOf, type Character, type Chat, type Group, type Message } from "@/lib/types";

const STARTERS = ["Introduce yourselves.", "Settle this: is pineapple on pizza okay?", "Plan my weekend for me."];
const spec = (c: Character) => ({ name: c.name, tagline: c.tagline, greeting: c.greeting, persona: c.persona });
const NOBODY: Character = { id: "?", name: "Someone", tagline: "", greeting: "", persona: "" };
/** Models sometimes sign their line ("Brick: …", "[Brick] …"); the name is already on the line. */
const escapeRe = (t: string) => t.replace(/[.*+?^$()|[\]\\{}]/g, "\\$&");
const unsign = (t: string, name: string) =>
  t.replace(new RegExp("^\\s*(?:\\[" + escapeRe(name) + "\\]\\s*:?|" + escapeRe(name) + "\\s*:)\\s*", "i"), "").replace(/^\s*\[(Person|[^\]]{1,40})\]\s*/, "").trim();

export default function GroupPage() {
  const { id } = useParams<{ id: string }>();
  const s = useStore();
  if (!s) return <div className="min-h-dvh"><AppHeader /></div>;
  const g = findGroup(s, decodeURIComponent(id));
  const members = g ? membersOf(s, g) : [];
  if (!g || members.length < 2) {
    return (
      <div className="min-h-dvh">
        <AppHeader />
        <main className="mx-auto grid max-w-xl gap-4 px-4 py-24 text-center">
          <h1 className="text-3xl">{g ? "This group needs more characters" : "That group chat isn't in this browser"}</h1>
          <p className="text-muted">{g ? "Some of its characters were deleted. Start a new group with at least two." : "Group chats are saved on the device you made them on."}</p>
          <div className="flex justify-center gap-2"><Link href="/app/group/new" className="sk-btn">Start a group chat</Link></div>
        </main>
      </div>
    );
  }
  return <GroupView key={g.id} g={g} members={members} chat={groupChatFor(s, g)} />;
}

function GroupView({ g, members, chat }: { g: Group; members: Character[]; chat: Chat }) {
  const ai = useAI("/api/group");
  const studio = useStudio();
  const router = useRouter();
  const [input, setInput] = useState("");
  const [speaking, setSpeaking] = useState<string | null>(null);
  const [retaking, setRetaking] = useState(false);
  const [dir, setDir] = useState<"in" | "back" | "none">("none");
  const [menu, setMenu] = useState(false);
  const stopped = useRef(false);
  const box = useRef<HTMLTextAreaElement>(null);
  const lastTake = useRef<HTMLDivElement>(null);
  const end = useRef<HTMLDivElement>(null);
  const pinned = useRef(true);

  const msgs = chat.messages;
  const last = msgs[msgs.length - 1];
  const who = (m: Message) => members.find((c) => c.id === m.speakerId) ?? NOBODY;
  const names = listNames(members.map((c) => c.name.split(" ")[0]!));
  const lines = (h: Message[]) => h.map((m) => ({ from: m.role === "user" ? "person" : who(m).name, content: textOf(m) }));
  const busy = ai.busy || !!speaking;

  useEffect(() => {
    const onScroll = () => { pinned.current = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 140; };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useLayoutEffect(() => { if (pinned.current) end.current?.scrollIntoView({ block: "end" }); }, [msgs.length, ai.text, speaking]);
  useEffect(() => {
    const el = box.current; if (!el) return;
    el.style.height = "auto"; el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  }, [input]);

  const needMode = () => {
    if (studio.loading || studio.status?.active) return false;
    studio.openPicker({ message: `Choose how ${names} should answer. Your message will still be here.` });
    return true;
  };

  /** One member's next line, streamed; "" when it failed or was stopped. */
  async function speak(history: Message[], c: Character): Promise<string> {
    setSpeaking(c.id);
    const reply = await ai.run({ members: members.map(spec), speaker: members.findIndex((m) => m.id === c.id), lines: lines(history) });
    return stopped.current ? reply.trim() : unsign(reply, c.name);
  }

  /** Everyone answers once, in turn. Whoever starts rotates, so it isn't always the same voice first. */
  async function round(start: Message[]): Promise<Message[]> {
    stopped.current = false;
    pinned.current = true;
    let history = start;
    const k = start.filter((m) => m.role === "user").length + start.length;
    const order = members.map((_, i) => members[(i + k) % members.length]!);
    for (const c of order) {
      if (stopped.current) break;
      const reply = await speak(history, c);
      if (!reply) break;
      history = [...history, { id: uid(), role: "assistant", takes: [reply], take: 0, speakerId: c.id }];
      writeChat({ ...chat, messages: history });
    }
    setSpeaking(null);
    setDir("none");
    return history;
  }

  async function send(text?: string) {
    const t = (text ?? input).trim();
    if (!t || busy || needMode()) return;
    const next = [...msgs, { id: uid(), role: "user" as const, takes: [t], take: 0 }];
    writeChat({ ...chat, messages: next });
    setInput("");
    const after = await round(next);
    if (after.length === next.length) { writeChat({ ...chat, messages: msgs }); setInput(t); }   // nobody could answer: take it back
    box.current?.focus({ preventScroll: true });
  }

  async function keepGoing() {
    if (!msgs.length || busy || needMode()) return;
    await round(msgs);
  }

  async function retake() {
    if (!last || last.role !== "assistant" || busy || needMode()) return;
    const el = lastTake.current;
    if (el) await anticipate(el, -48, 0, { duration: 220 })?.finished.catch(() => {});
    stopped.current = false;
    setRetaking(true);
    const reply = await speak(msgs.slice(0, -1), who(last));
    setRetaking(false); setSpeaking(null); setDir("none");
    if (el) el.getAnimations().forEach((a) => a.cancel());
    if (reply) { const takes = [...last.takes, reply]; writeChat({ ...chat, messages: [...msgs.slice(0, -1), { ...last, takes, take: takes.length - 1 }] }); }
  }

  function flip(d: number) {
    if (!last || busy) return;
    const take = Math.max(0, Math.min(last.takes.length - 1, last.take + d));
    if (take === last.take) return;
    setDir(d > 0 ? "in" : "back");
    writeChat({ ...chat, messages: [...msgs.slice(0, -1), { ...last, take }] });
  }

  function stop() { stopped.current = true; ai.stop(); }
  function startOver() { setMenu(false); if (window.confirm(`Start over with ${names}? This chat will be cleared.`)) { stop(); writeChat({ ...chat, messages: [] }); } }
  function remove() { setMenu(false); if (window.confirm(`Delete the group chat “${g.name}”? The characters stay.`)) { stop(); deleteGroup(g.id); router.push("/app"); } }

  const talking = speaking ? members.find((c) => c.id === speaking) ?? null : null;
  const canRetake = !!last && last.role === "assistant" && !busy;

  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader
        left={
          <>
            <Link href="/app" aria-label="Back to the cast" className="sk-icon-btn -ml-2 flex-none text-fg">
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </Link>
            <Cluster members={members} size={30} live={speaking} />
            <div className="ml-1 min-w-0 leading-tight">
              <p className="truncate font-medium">{g.name}</p>
              <p className="hidden truncate text-xs text-muted sm:block">{talking ? `${talking.name} is talking…` : `${members.length} characters · they hear each other`}</p>
            </div>
          </>
        }
        right={
          <div className="relative">
            <button type="button" className="sk-icon-btn text-fg" aria-label="Group chat options" aria-haspopup="menu" aria-expanded={menu} onClick={() => setMenu(!menu)}>
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden><circle cx="5" cy="12" r="1.8" fill="currentColor" /><circle cx="12" cy="12" r="1.8" fill="currentColor" /><circle cx="19" cy="12" r="1.8" fill="currentColor" /></svg>
            </button>
            {menu && (
              <div className="menu" role="menu" onKeyDown={(e) => { if (e.key === "Escape") setMenu(false); }}>
                <Link role="menuitem" href="/app/group/new" autoFocus>New group chat</Link>
                <button role="menuitem" type="button" onClick={startOver}>Start over</button>
                <button role="menuitem" type="button" className="is-danger" onClick={remove}>Delete group chat</button>
              </div>
            )}
          </div>
        }
      />
      {menu && <button type="button" aria-hidden tabIndex={-1} className="fixed inset-0 z-10 cursor-default" onClick={() => setMenu(false)} />}

      <main className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-4 sm:px-6">
        <div className="flex-1 space-y-7 pb-6 pt-8" aria-live="polite" aria-busy={busy}>
          {msgs.length === 0 && !busy && (
            <div className="sk-stagger grid justify-items-center gap-4 pt-10 text-center">
              <Cluster members={members} size={64} />
              <h1 className="text-3xl leading-tight sm:text-4xl">{g.name}</h1>
              <p className="max-w-md text-muted">Say something and {names} each answer. They hear each other, so expect opinions.</p>
              <div className="mt-2 flex flex-wrap justify-center gap-2">
                {STARTERS.map((t) => (
                  <button key={t} type="button" onClick={() => void send(t)} className="min-h-11 rounded-full border border-line px-4 text-sm text-muted transition-colors duration-150 hover:border-fg/25 hover:text-fg">{t}</button>
                ))}
              </div>
            </div>
          )}
          {msgs.map((m, i) => {
            const isLast = i === msgs.length - 1;
            if (m.role === "user") return <UserLine key={m.id} text={textOf(m)} />;
            if (isLast && retaking) return <CharLine key={m.id} c={who(m)} text={ai.text} live innerRef={lastTake} className="take-in" />;
            return (
              <CharLine key={`${m.id}-${m.take}`} c={who(m)} text={textOf(m)} innerRef={isLast ? lastTake : undefined}
                className={isLast && m.takes.length > 1 ? (dir === "in" ? "take-in" : dir === "back" ? "take-in-back" : "") : ""}>
                {isLast && canRetake && (
                  <div className="mt-3 flex flex-wrap items-center gap-1 text-sm text-muted">
                    {m.takes.length > 1 && (
                      <>
                        <button type="button" className="sk-icon-btn text-base" aria-label="Previous take" disabled={m.take === 0} onClick={() => flip(-1)}>‹</button>
                        <span key={m.take} className="take-count min-w-[5.5rem] text-center font-mono text-xs">Take {m.take + 1} of {m.takes.length}</span>
                        <button type="button" className="sk-icon-btn text-base" aria-label="Next take" disabled={m.take === m.takes.length - 1} onClick={() => flip(1)}>›</button>
                      </>
                    )}
                    <button type="button" className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-fg/80 transition-colors duration-150 hover:bg-bg-2 hover:text-fg" onClick={retake}>
                      <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden><path d="M4 12a8 8 0 0 1 14-5.3M20 4v5h-5M20 12a8 8 0 0 1-14 5.3M4 20v-5h5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      Another take
                    </button>
                    <button type="button" className="inline-flex min-h-11 items-center gap-1.5 rounded-full px-3 text-fg/80 transition-colors duration-150 hover:bg-bg-2 hover:text-fg" onClick={keepGoing}>
                      <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden><path d="M5 12h14M13 6l6 6-6 6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                      Keep going
                    </button>
                  </div>
                )}
              </CharLine>
            );
          })}
          {talking && !retaking && <CharLine key={`live-${talking.id}-${msgs.length}`} c={talking} text={ai.text} live className="sk-rise" />}
          {ai.error && !busy && (
            <p className="sk-error" role="alert">{ai.error.message}{ai.error.action && <> <a href={ai.error.action.url} target="_blank" rel="noopener noreferrer">{ai.error.action.label} ↗</a></>}</p>
          )}
          <div ref={end} />
        </div>

        <form className="scrim-b sticky bottom-0 pb-[calc(.75rem+env(safe-area-inset-bottom))] pt-4" onSubmit={(e) => { e.preventDefault(); void send(); }}>
          <div className="flex items-end gap-2 rounded-[22px] border border-line bg-card p-1.5 pl-4 transition-[border-color] duration-150 focus-within:border-accent/70 focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent">
            <label htmlFor="msg" className="sr-only">Message the group</label>
            <textarea id="msg" ref={box} rows={1} value={input} onChange={(e) => setInput(e.target.value)} placeholder={`Message ${names}`}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing && !window.matchMedia("(pointer: coarse)").matches) { e.preventDefault(); void send(); } }}
              className="composer-input max-h-[180px] min-h-11 flex-1 resize-none bg-transparent py-2.5 leading-6 outline-none placeholder:text-muted" />
            {busy
              ? <button type="button" onClick={stop} aria-label="Stop" className="grid size-11 flex-none place-items-center rounded-full bg-bg-2 text-fg transition-transform duration-100 active:scale-95"><span className="size-3.5 rounded-[3px] bg-fg" /></button>
              : <button type="submit" aria-label="Send" disabled={!input.trim()} className="grid size-11 flex-none place-items-center rounded-full bg-accent text-accent-fg transition-[transform,opacity] duration-100 active:scale-95 disabled:opacity-40">
                  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden><path d="M12 19V5M6 11l6-6 6 6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                </button>}
          </div>
          <p className="mt-2 text-center text-[.75rem] text-muted">{names} are AI characters. Treat what they say as fiction.</p>
        </form>
      </main>
    </div>
  );
}
