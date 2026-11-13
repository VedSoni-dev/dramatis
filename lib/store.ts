"use client";
// Everything a person makes lives in this browser (localStorage): their characters and their chats. No accounts.
import { useSyncExternalStore } from "react";
import { CAST } from "./cast";
import type { Character, Chat, Group, Message } from "./types";

const KEY = "dramatis.v1";
export interface State { characters: Character[]; chats: Record<string, Chat>; groups: Group[] }
const EMPTY: State = { characters: [], chats: {}, groups: [] };

let state: State = EMPTY;
let loaded = false;
const listeners = new Set<() => void>();
const emit = () => listeners.forEach((l) => l());

function read(): State {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return EMPTY;
    const s = JSON.parse(raw) as Partial<State>;
    return { characters: Array.isArray(s.characters) ? s.characters : [], chats: s.chats && typeof s.chats === "object" ? s.chats : {}, groups: Array.isArray(s.groups) ? s.groups : [] };
  } catch { return EMPTY; }
}
function ensure() {
  if (loaded || typeof window === "undefined") return;
  state = read();
  loaded = true;
  window.addEventListener("storage", (e) => { if (e.key === KEY) { state = read(); emit(); } });
}
/** Saves and tells every screen. Returns false when the browser is out of room (big pictures). */
function commit(next: State): boolean {
  state = next;
  let ok = true;
  try { localStorage.setItem(KEY, JSON.stringify(next)); } catch { ok = false; }
  emit();
  return ok;
}

const subscribe = (l: () => void) => { ensure(); listeners.add(l); return () => listeners.delete(l); };
/** null until the browser has loaded (server render and the first paint). */
export function useStore(): State | null {
  return useSyncExternalStore(subscribe, () => { ensure(); return state; }, () => null);
}

export const uid = () => (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`);

export function allCharacters(s: State): Character[] {
  const mine = [...s.characters].sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
  return [...mine, ...CAST];
}
export const findCharacter = (s: State, id: string) => s.characters.find((c) => c.id === id) ?? CAST.find((c) => c.id === id);

export function saveCharacter(c: Character): boolean {
  ensure();
  const rest = state.characters.filter((x) => x.id !== c.id);
  return commit({ ...state, characters: [{ ...c, builtIn: false, createdAt: c.createdAt ?? Date.now() }, ...rest] });
}
export function deleteCharacter(id: string): void {
  ensure();
  const chats = { ...state.chats };
  delete chats[id];
  // they leave every group chat they were in
  const groups = state.groups.map((g) => ({ ...g, memberIds: g.memberIds.filter((m) => m !== id) }));
  commit({ characters: state.characters.filter((c) => c.id !== id), chats, groups });
}

const greetingMessage = (c: Character): Message => ({ id: uid(), role: "assistant", takes: [c.greeting || `Hello. I'm ${c.name}.`], take: 0 });

/** The chat with this character, started on their greeting if there isn't one yet. */
export function chatFor(s: State, c: Character): Chat {
  return s.chats[c.id] ?? { characterId: c.id, messages: [greetingMessage(c)], updatedAt: 0 };
}
export function writeChat(chat: Chat): void {
  ensure();
  commit({ ...state, chats: { ...state.chats, [chat.characterId]: { ...chat, updatedAt: Date.now() } } });
}
export function resetChat(c: Character): void {
  ensure();
  const chats = { ...state.chats };
  delete chats[c.id];
  commit({ ...state, chats });
}

/** Chats the person has actually said something in, newest first. */
export function recentChats(s: State): { chat: Chat; character: Character }[] {
  return Object.values(s.chats)
    .filter((c) => c.messages.some((m) => m.role === "user"))
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .map((chat) => ({ chat, character: findCharacter(s, chat.characterId) }))
    .filter((x): x is { chat: Chat; character: Character } => !!x.character);
}

/* ---------------- group chats ---------------- */
export const groupKey = (id: string) => `group:${id}`;
export const findGroup = (s: State, id: string) => s.groups.find((g) => g.id === id);
/** The members who still exist (a deleted character drops out). */
export const membersOf = (s: State, g: Group) => g.memberIds.map((id) => findCharacter(s, id)).filter((c): c is Character => !!c);
export const groupChatFor = (s: State, g: Group): Chat => s.chats[groupKey(g.id)] ?? { characterId: groupKey(g.id), messages: [], updatedAt: 0 };
/** What to call someone in a list: the first name ("Inès"), unless the first word isn't a name ("His Leather Jacket",
 *  "Captain Juno Rask", "The Oracle"), then the whole thing. */
const NOT_A_NAME = /^(his|her|their|its|the|a|an|my|our|captain|capt\.?|dr\.?|sir|lady|lord|mr\.?|mrs\.?|ms\.?|professor|detective|madame)$/i;
export const shortName = (name: string) => { const w = name.trim().split(/\s+/); return w.length > 1 && !NOT_A_NAME.test(w[0]!) ? w[0]! : name.trim(); };
/** "Odile, Brick and Theo" */
export const listNames = (names: string[]) => (names.length < 2 ? names.join("") : `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`);

export function saveGroup(g: Group): boolean {
  ensure();
  return commit({ ...state, groups: [g, ...state.groups.filter((x) => x.id !== g.id)] });
}
export function deleteGroup(id: string): void {
  ensure();
  const chats = { ...state.chats };
  delete chats[groupKey(id)];
  commit({ ...state, groups: state.groups.filter((g) => g.id !== id), chats });
}
/** Group chats, most recently used first. */
export function recentGroups(s: State): { group: Group; chat: Chat; members: Character[] }[] {
  return s.groups
    .map((group) => ({ group, chat: groupChatFor(s, group), members: membersOf(s, group) }))
    .sort((a, b) => (b.chat.updatedAt || b.group.createdAt) - (a.chat.updatedAt || a.group.createdAt));
}
