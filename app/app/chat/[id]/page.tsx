"use client";
// One chat with one character. Replies stream; the last reply can be re-shot ("Another take") and the takes
// flipped through. Everything is saved in this browser.
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { AppHeader, Toast } from "@/components/AppHeader";
import { Portrait } from "@/components/Portrait";
import { Rich } from "@/components/Rich";
import { useAI, useStudio } from "@/kit/react/studio";
import { anticipate } from "@/kit/ui/motion";
import { shareLink } from "@/lib/share";
import { allCharacters, chatFor, deleteCharacter, findCharacter, recentChats, resetChat, uid, useStore, writeChat, type State } from "@/lib/store";
import { textOf, type Character, type Chat, type Message } from "@/lib/types";

export default function ChatPage() {
  const { id } = useParams<{ id: string }>();
  const s = useStore();
  const c = s ? findCharacter(s, decodeURIComponent(id)) : undefined;
  if (!s) return <div className="min-h-dvh"><AppHeader wide /></div>;
  if (!c) {
    return (
      <div className="min-h-dvh">
        <AppHeader wide />
        <main className="mx-auto grid max-w-xl gap-4 px-4 py-24 text-center">
          <h1 className="text-3xl">That character isn&apos;t in this browser</h1>
          <p className="text-muted">Characters you make are saved on the device you made them on. Ask for their share link, or start a new one.</p>
          <div className="flex justify-center gap-2"><Link href="/app" className="sk-btn">See the cast</Link></div>
        </main>
      </div>
    );
  }
  return <ChatView key={c.id} c={c} chat={chatFor(s, c)} s={s} />;
}

const wire = (msgs: Message[]) => msgs.map((m) => ({ role: m.role, content: textOf(m) }));
const spec = (c: Character) => ({ name: c.name, tagline: c.tagline, greeting: c.greeting, persona: c.persona });

function ChatView({ c, chat, s }: { c: Character; chat: Chat; s: State }) {
  const ai = useAI();
  const studio = useStudio();
  const router = useRouter();
  const [input, setInput] = useState("");
  const [busyKind, setBusyKind] = useState<null | "reply" | "take">(null);
  const [dir, setDir] = useState<"in" | "back" | "none">("none");
  const [toast, setToast] = useState<string | null>(null);
  const [menu, setMenu] = useState(false);
  const box = useRef<HTMLTextAreaElement>(null);
  const lastTake = useRef<HTMLDivElement>(null);
  const end = useRef<HTMLDivElement>(null);
  const pinned = useRef(true);

  const msgs = chat.messages;
  const last = msgs[msgs.length - 1];
  const canRetake = !!last && last.role === "assistant" && msgs.some((m) => m.role === "user");

  // A save from the creator ("Odile is ready"): one flourish, then gone.
  useEffect(() => {
    try { const t = sessionStorage.getItem("dramatis.toast"); if (t) { sessionStorage.removeItem("dramatis.toast"); flash(t); } } catch { /* fine */ }
  }, []);
  const flash = (t: string) => { setToast(t); setTimeout(() => setToast(null), 2200); };

  // Follow the conversation while the reader is at the bottom; leave them alone if they scrolled up.
  useEffect(() => {
    const onScroll = () => { pinned.current = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 140; };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);
  useLayoutEffect(() => { if (pinned.current) end.current?.scrollIntoView({ block: "end" }); }, [msgs.length, ai.text, busyKind]);
  useEffect(() => { box.current?.focus({ preventScroll: true }); }, []);

  const grow = useCallback(() => {
    const el = box.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 180)}px`;
  }, []);
  useEffect(grow, [input, grow]);

  async function send() {
    const text = input.trim();
    if (!text || ai.busy) return;
    if (!studio.loading && !studio.status?.active) { studio.openPicker({ message: `Choose how ${c.name} should answer. Your message will still be here.` }); return; }
    const user: Message = { id: uid(), role: "user", takes: [text], take: 0 };
    const next = [...msgs, user];
    writeChat({ ...chat, messages: next });
    setInput("");
    pinned.current = true;
    setBusyKind("reply");
    const reply = await ai.run({ character: spec(c), messages: wire(next) });
    setBusyKind(null);
    if (reply.trim()) {
      writeChat({ ...chat, messages: [...next, { id: uid(), role: "assistant", takes: [reply.trim()], take: 0 }] });
    } else {
      // Nothing came back (no key yet, out of credits…): take the message back so it can be sent again.
      writeChat({ ...chat, messages: msgs });
      setInput(text);
    }
    box.current?.focus({ preventScroll: true });
  }

  async function retake() {
    if (!canRetake || ai.busy || !last) return;
    if (!studio.loading && !studio.status?.active) { studio.openPicker({ message: `Choose how ${c.name} should answer first.` }); return; }
    const el = lastTake.current;
    if (el) await anticipate(el, -48, 0, { duration: 220 })?.finished.catch(() => {});
    setDir("in");
    setBusyKind("take");
    const reply = await ai.run({ character: spec(c), messages: wire(msgs.slice(0, -1)) });
    setBusyKind(null);
    if (el) el.getAnimations().forEach((a) => a.cancel());
    if (reply.trim()) {
      const takes = [...last.takes, reply.trim()];
      setDir("none"); // it just streamed in place; don't animate it a second time
      writeChat({ ...chat, messages: [...msgs.slice(0, -1), { ...last, takes, take: takes.length - 1 }] });
    }
  }

  function flip(delta: number) {
    if (!last || ai.busy) return;
    const take = Math.max(0, Math.min(last.takes.length - 1, last.take + delta));
    if (take === last.take) return;
    setDir(delta > 0 ? "in" : "back");
    writeChat({ ...chat, messages: [...msgs.slice(0, -1), { ...last, take }] });
  }

  async function share() {
    setMenu(false);
    const link = shareLink(window.location.origin, c);
    try { await navigator.clipboard.writeText(link); flash("Link copied"); }
    catch { window.prompt("Copy this link to share the character", link); }
  }
  function startOver() {
    setMenu(false);
    if (window.confirm(`Start over with ${c.name}? This chat will be cleared.`)) { ai.stop(); resetChat(c); }
  }
  function remove() {
    setMenu(false);
    if (window.confirm(`Delete ${c.name} and your chat with them from this browser?`)) { deleteCharacter(c.id); router.push("/app"); }
  }

  const streamingNew = ai.busy && busyKind === "reply";
  const streamingTake = ai.busy && busyKind === "take";

  return (
    <div className="flex min-h-dvh flex-col">
      <AppHeader
        wide
        left={
          <>
            <Link href="/app" aria-label="Back to the cast" className="sk-icon-btn -ml-2 flex-none text-fg lg:hidden">
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
            </Link>
            <Link href="/app" className="hidden pr-3 font-display text-[1.25rem] tracking-[-0.03em] lg:block">Dramatis</Link>
            <span className="hidden h-6 w-px bg-line lg:block" aria-hidden />
            <Portrait c={c} size={36} live={ai.busy} className="lg:ml-2" />
            <div className="min-w-0 leading-tight">
              <p className="truncate font-medium">{c.name}</p>
              <p className="hidden truncate text-xs text-muted sm:block">{c.tagline}</p>
            </div>
          </>
        }
        right={
          <div className="relative">
            <button type="button" className="sk-icon-btn text-fg" aria-label="Chat options" aria-haspopup="menu" aria-expanded={menu} onClick={() => setMenu(!menu)}>
              <svg width="20" height="20" viewBox="0 0 24 24" aria-hidden><circle cx="5" cy="12" r="1.8" fill="currentColor" /><circle cx="12" cy="12" r="1.8" fill="currentColor" /><circle cx="19" cy="12" r="1.8" fill="currentColor" /></svg>
            </button>
            {menu && (
              <div className="menu" role="menu" onKeyDown={(e) => { if (e.key === "Escape") setMenu(false); }}>
                <button role="menuitem" type="button" onClick={share} autoFocus>Copy share link</button>
                {c.builtIn
                  ? <Link role="menuitem" href={`/app/new?copy=${encodeURIComponent(c.id)}`}>Make a copy to edit</Link>
                  : <Link role="menuitem" href={`/app/new?edit=${encodeURIComponent(c.id)}`}>Edit character</Link>}
                <button role="menuitem" type="button" onClick={startOver}>Start over</button>
                {!c.builtIn && <button role="menuitem" type="button" className="is-danger" onClick={remove}>Delete character</button>}
              </div>
            )}
          </div>
        }
      />
      {menu && <button type="button" aria-hidden tabIndex={-1} className="fixed inset-0 z-10 cursor-default" onClick={() => setMenu(false)} />}

      <div className="flex flex-1">
        <ChatList s={s} current={c.id} />
        <main className="mx-auto flex w-full max-w-[46rem] flex-1 flex-col px-4 sm:px-6">
          <div className="flex flex-col items-center pt-10 text-center sm:pt-14">
            <Portrait c={c} size={112} className="intro-face" />
            <h1 className="mt-4 text-[1.75rem] leading-tight">{c.name}</h1>
            <p className="mt-1.5 max-w-md text-[.95rem] text-muted">{c.tagline}</p>
          </div>
          <div className="flex-1 space-y-7 pb-6 pt-10" aria-live="polite" aria-busy={ai.busy}>
            {msgs.map((m, i) => {
              const isLast = i === msgs.length - 1;
              if (m.role === "user") return <UserLine key={m.id} text={textOf(m)} />;
              if (isLast && streamingTake) return <CharLine key={m.id} c={c} text={ai.text} live innerRef={lastTake} className="take-in" />;
              return (
                <CharLine key={`${m.id}-${m.take}`} c={c} text={textOf(m)} innerRef={isLast ? lastTake : undefined}
                  className={isLast && m.takes.length > 1 ? (dir === "in" ? "take-in" : dir === "back" ? "take-in-back" : "") : ""}>
                  {isLast && canRetake && !ai.busy && (
                    <div className="mt-3 flex items-center gap-1 text-sm text-muted">
                      {m.takes.length > 1 && (
                        <>
                          <button type="button" className="sk-icon-btn text-base" aria-label="Previous take" disabled={m.take === 0} onClick={() => flip(-1)}>‹</button>
                          <span key={m.take} className="take-count min-w-[5.5rem] text-center font-mono text-xs">Take {m.take + 1} of {m.takes.length}</span>
                          <button type="button" className="sk-icon-btn text-base" aria-label="Next take" disabled={m.take === m.takes.length - 1} onClick={() => flip(1)}>›</button>
                        </>
                      )}
                      <button type="button" className="ml-1 inline-flex min-h-11 items-center gap-1.5 rounded-full bg-[color-mix(in_oklab,var(--accent)_12%,transparent)] px-4 text-[#9fd5fd] transition-colors duration-150 hover:bg-[color-mix(in_oklab,var(--accent)_20%,transparent)]" onClick={retake}>
                        <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden><path d="M4 12a8 8 0 0 1 14-5.3M20 4v5h-5M20 12a8 8 0 0 1-14 5.3M4 20v-5h5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                        Another take
                      </button>
                    </div>
                  )}
                </CharLine>
              );
            })}
            {streamingNew && <CharLine c={c} text={ai.text} live className="sk-rise" />}
            {ai.error && !ai.busy && (
              <p className="sk-error" role="alert">{ai.error.message}{ai.error.action && <> <a href={ai.error.action.url} target="_blank" rel="noopener noreferrer">{ai.error.action.label} ↗</a></>}</p>
            )}
            <div ref={end} />
          </div>

          <form className="scrim-b sticky bottom-0 pb-[calc(.75rem+env(safe-area-inset-bottom))] pt-4" onSubmit={(e) => { e.preventDefault(); void send(); }}>
            <div className="flex items-end gap-2 rounded-[28px] border border-[var(--line-strong)] bg-card p-1.5 pl-5 transition-[border-color,box-shadow] duration-150 focus-within:border-accent focus-within:shadow-[0_0_0_3px_color-mix(in_oklab,var(--accent)_24%,transparent)]">
              <label htmlFor="msg" className="sr-only">Message {c.name}</label>
              <textarea id="msg" ref={box} rows={1} value={input} onChange={(e) => setInput(e.target.value)} placeholder={`Message ${c.name}`}
                onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing && !window.matchMedia("(pointer: coarse)").matches) { e.preventDefault(); void send(); } }}
                className="composer-input max-h-[180px] min-h-11 flex-1 resize-none bg-transparent py-2.5 leading-6 outline-none placeholder:text-muted" />
              {ai.busy
                ? <button type="button" onClick={ai.stop} aria-label="Stop" className="grid size-11 flex-none place-items-center rounded-full bg-bg-2 text-fg transition-transform duration-100 active:scale-95"><span className="size-3.5 rounded-[3px] bg-fg" /></button>
                : <button type="submit" aria-label="Send" disabled={!input.trim()} className="grid size-11 flex-none place-items-center rounded-full bg-accent text-accent-fg transition-[transform,opacity] duration-100 active:scale-95 disabled:opacity-40">
                    <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden><path d="M12 19V5M6 11l6-6 6 6" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  </button>}
            </div>
            <p className="mt-2 text-center text-[.75rem] text-muted">{c.name} is an AI character. Treat what they say as fiction.</p>
          </form>
        </main>
      </div>
      {toast && <Toast text={toast} />}
    </div>
  );
}

/** Desktop: every chat and every character one click away, beside the open chat. */
function ChatList({ s, current }: { s: State; current: string }) {
  const recent = recentChats(s);
  const talked = new Set(recent.map((r) => r.character.id));
  const rest = allCharacters(s).filter((x) => !talked.has(x.id));
  const item = (x: Character, line: string) => (
    <li key={x.id}>
      <Link href={`/app/chat/${encodeURIComponent(x.id)}`} className="chat-row" aria-current={x.id === current ? "page" : undefined}>
        <Portrait c={x} size={40} />
        <span className="min-w-0">
          <span className="block truncate text-[.92rem] font-medium">{x.name}</span>
          <span className="block truncate text-[.8rem] text-muted">{line}</span>
        </span>
      </Link>
    </li>
  );
  return (
    <aside className="sticky top-16 hidden h-[calc(100dvh-4rem)] w-[18.5rem] flex-none overflow-y-auto border-r border-line px-3 pb-6 lg:block" aria-label="Your chats and the cast">
      <div className="flex items-center justify-between px-2 pb-2 pt-5">
        <h2 className="font-mono text-[.75rem] font-medium tracking-normal text-muted">Chats</h2>
        <Link href="/app/new" className="rounded-full px-2.5 py-1 text-[.8rem] text-muted transition-colors hover:bg-bg-2 hover:text-fg">New character</Link>
      </div>
      {recent.length > 0
        ? <ul className="grid gap-0.5">{recent.map(({ chat, character }) => {
            const last = [...chat.messages].reverse().find((m) => m.role === "assistant");
            return item(character, last ? textOf(last).replace(/\*[^*]*\*/g, "").trim() || character.tagline : character.tagline);
          })}</ul>
        : <p className="px-2 text-[.8rem] leading-relaxed text-muted">Chats you start show up here.</p>}
      <h2 className="px-2 pb-2 pt-6 font-mono text-[.75rem] font-medium tracking-normal text-muted">Cast</h2>
      <ul className="grid gap-0.5">{rest.map((x) => item(x, x.tagline))}</ul>
    </aside>
  );
}

function CharLine({ c, text, live = false, className = "", innerRef, children }: { c: Character; text: string; live?: boolean; className?: string; innerRef?: React.Ref<HTMLDivElement>; children?: React.ReactNode }) {
  return (
    <div className={`flex gap-3.5 ${className}`}>
      <Portrait c={c} size={36} live={live} className="mt-0.5" />
      <div className="min-w-0 flex-1">
        <p className="mb-1 font-mono text-[.72rem] text-muted">{c.name}</p>
        <div ref={innerRef} className="line-text text-[1rem] leading-[1.7] text-fg/95">
          {text ? <Rich text={text} /> : <span className="typing" role="status" aria-label={`${c.name} is typing`}><i /><i /><i /></span>}
        </div>
        {children}
      </div>
    </div>
  );
}

function UserLine({ text }: { text: string }) {
  return (
    <div className="sk-rise flex justify-end">
      <div className="line-text max-w-[85%] whitespace-pre-wrap rounded-[20px] rounded-br-md bg-bg-2 px-4 py-2.5 text-[1rem] leading-[1.6]">{text}</div>
    </div>
  );
}
