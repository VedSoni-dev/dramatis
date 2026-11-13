// A group chat turn: one member's next line. The browser calls this once per member, in turn, so each one hears
// what the others just said. Same kit call as the one-to-one chat (whatever mode the person picked).
import { streamText } from "@/kit/ai";
import type { ChatMessage } from "@/kit/ai/types";
import { GROUP_MAX, cleanSpec, type CharacterSpec } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 300;

type Line = { from?: string; content?: string };   // from: "person" or a member's name

function system(me: CharacterSpec, others: CharacterSpec[]): string {
  const cast = others.map((o) => `- ${o.name}${o.tagline ? `: ${o.tagline}` : ""}`).join("\n");
  return `You are ${me.name}, one character in a group chat on Dramatis, an app where people talk with characters.

In this chat: a person, you, and
${cast}

Who you are: ${me.tagline || me.name}
${me.persona || `Play ${me.name} as the line above describes.`}

How to play it:
- Write only ${me.name}'s next message: one short chat message, usually one to three sentences. Never write lines for the person or the other characters, and don't start with your own name.
- React to what was just said, by the person or by the others: agree, argue, tease, build on it. Stay in character, and sound like yourself, not like the others.
- Lines in the chat come marked [Person] for the human and [Name] for each other character.
- An action goes between single asterisks, like *rolls eyes*. One at most, and many messages need none.
- Safety comes before the role. If the person seems to be in real danger or crisis (thoughts of self-harm, abuse, a medical emergency), step out of character, say so plainly and kindly, and point them to local emergency services or a crisis line. Keep it non-sexual. If someone sincerely asks whether they are talking to a real person, say you are an AI playing a character.`;
}

/** The chat as this speaker hears it: their own lines are theirs (assistant), everyone else's are marked and heard (user). */
function hear(lines: Line[], me: string): ChatMessage[] {
  const out: ChatMessage[] = [];
  for (const l of lines.slice(-60)) {
    const text = String(l.content ?? "").trim().slice(0, 4000);
    if (!text) continue;
    const mine = l.from === me;
    const msg: ChatMessage = mine ? { role: "assistant", content: text } : { role: "user", content: `[${l.from === "person" || !l.from ? "Person" : l.from}] ${text}` };
    const last = out[out.length - 1];
    if (last && last.role === msg.role) last.content += `\n\n${msg.content}`;
    else out.push(msg);
  }
  while (out.length && out[0]!.role !== "user") out.shift();
  // a turn always answers something: if they spoke last ("keep going"), nudge them on
  if (!out.length || out[out.length - 1]!.role !== "user") out.push({ role: "user", content: `[Person] (listening) Go on, ${me}.` });
  return out;
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { members?: Partial<CharacterSpec>[]; speaker?: number; lines?: Line[] };
  const members = (Array.isArray(body.members) ? body.members : []).slice(0, GROUP_MAX).map(cleanSpec).filter((m) => m.name);
  const i = Number(body.speaker);
  if (members.length < 2 || !Number.isInteger(i) || !members[i]) return Response.json({ error: "A group chat needs at least two characters." }, { status: 400 });
  const me = members[i]!;
  const lines = Array.isArray(body.lines) ? body.lines : [];
  if (!lines.some((l) => String(l?.content ?? "").trim())) return Response.json({ error: "Say something to the group first." }, { status: 400 });
  return streamText(req, { system: system(me, members.filter((_, k) => k !== i)), messages: hear(lines, me.name), tier: "fast" });
}
