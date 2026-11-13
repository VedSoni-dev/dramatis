// Shared by the server routes and the browser. No secrets, no Node APIs.

export interface Character {
  id: string;
  name: string;
  /** One line: who they are. */
  tagline: string;
  /** Their first message, in character. */
  greeting: string;
  /** Who they are and how they talk, written to the model ("You are…"). */
  persona: string;
  /** A data: URL the person uploaded (256 px), kept in this browser only. */
  avatar?: string;
  /** Built into the app (the cast); not editable, but can be copied. */
  builtIn?: boolean;
  group?: "play" | "practice";
  createdAt?: number;
}

/** What the browser sends the AI route: the character's words, never an avatar. */
export type CharacterSpec = Pick<Character, "name" | "tagline" | "greeting" | "persona">;

export interface Message {
  id: string;
  role: "user" | "assistant";
  /** Assistant messages keep every take; `take` is the one shown. User messages have one. */
  takes: string[];
  take: number;
}

export interface Chat {
  characterId: string;
  messages: Message[];
  updatedAt: number;
}

export const LIMITS = { name: 60, tagline: 140, greeting: 1200, persona: 4000 } as const;

export const textOf = (m: Message) => m.takes[m.take] ?? "";

/** Postel: accept messy input, keep it clean and inside the limits. */
export function cleanSpec(raw: Partial<CharacterSpec> | undefined): CharacterSpec {
  const t = (v: unknown, n: number) => (typeof v === "string" ? v.replace(/\r\n?/g, "\n").replace(/[ \t]+\n/g, "\n").trim().slice(0, n) : "");
  return {
    name: t(raw?.name, LIMITS.name).replace(/\s+/g, " "),
    tagline: t(raw?.tagline, LIMITS.tagline).replace(/\s+/g, " "),
    greeting: t(raw?.greeting, LIMITS.greeting),
    persona: t(raw?.persona, LIMITS.persona),
  };
}
