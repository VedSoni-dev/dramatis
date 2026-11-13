"use client";
// Desktop: every chat, group chat and character one click away, beside the open chat (lg and up).
import Link from "next/link";
import { Cluster } from "@/components/Cluster";
import { Portrait } from "@/components/Portrait";
import { allCharacters, recentChats, recentGroups, type State } from "@/lib/store";
import { textOf, type Chat, type Character } from "@/lib/types";

const lineOf = (chat: Chat) => {
  const last = [...chat.messages].reverse().find((m) => m.role === "assistant");
  return last ? textOf(last).replace(/\*[^*]*\*/g, "").replace(/\s+/g, " ").trim() : "";
};

export function ChatList({ s, current }: { s: State; current: string }) {
  const recent = recentChats(s);
  const groups = recentGroups(s).filter((x) => x.members.length >= 2);
  const talked = new Set(recent.map((r) => r.character.id));
  const rest = allCharacters(s).filter((x) => !talked.has(x.id));
  const row = (key: string, href: string, face: React.ReactNode, name: string, line: string) => (
    <li key={key}>
      <Link href={href} className="chat-row" aria-current={key === current ? "page" : undefined}>
        <span className="grid size-10 place-items-center">{face}</span>
        <span className="min-w-0">
          <span className="block truncate text-[.92rem] font-medium">{name}</span>
          <span className="block truncate text-[.8rem] text-muted">{line}</span>
        </span>
      </Link>
    </li>
  );
  const person = (x: Character, line: string) => row(x.id, `/app/chat/${encodeURIComponent(x.id)}`, <Portrait c={x} size={40} />, x.name, line || x.tagline);
  return (
    <aside className="sticky top-16 hidden h-[calc(100dvh-4rem)] w-[18.5rem] flex-none overflow-y-auto border-r border-line px-3 pb-6 lg:block" aria-label="Your chats and the cast">
      <div className="flex items-center justify-between px-2 pb-2 pt-5">
        <h2 className="font-mono text-[.75rem] font-medium tracking-normal text-muted">Chats</h2>
        <Link href="/app/new" className="rounded-full px-2.5 py-1 text-[.8rem] text-muted transition-colors hover:bg-bg-2 hover:text-fg">New character</Link>
      </div>
      {recent.length > 0
        ? <ul className="grid gap-0.5">{recent.map(({ chat, character }) => person(character, lineOf(chat)))}</ul>
        : <p className="px-2 text-[.8rem] leading-relaxed text-muted">Chats you start show up here.</p>}
      <div className="flex items-center justify-between px-2 pb-2 pt-6">
        <h2 className="font-mono text-[.75rem] font-medium tracking-normal text-muted">Group chats</h2>
        <Link href="/app/group/new" className="rounded-full px-2.5 py-1 text-[.8rem] text-muted transition-colors hover:bg-bg-2 hover:text-fg">New group</Link>
      </div>
      {groups.length > 0
        ? <ul className="grid gap-0.5">{groups.map(({ group, chat, members }) =>
            row(`group:${group.id}`, `/app/group/${encodeURIComponent(group.id)}`, <Cluster members={members.slice(0, 2)} size={28} />, group.name, lineOf(chat) || `${members.length} characters`))}</ul>
        : <p className="px-2 text-[.8rem] leading-relaxed text-muted">Put two to four characters in one chat.</p>}
      <h2 className="px-2 pb-2 pt-6 font-mono text-[.75rem] font-medium tracking-normal text-muted">Cast</h2>
      <ul className="grid gap-0.5">{rest.map((x) => person(x, x.tagline))}</ul>
    </aside>
  );
}
