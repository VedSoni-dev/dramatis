// The chat call. Whatever mode the person picked (local model, ChatGPT plan, Claude key, publik), streamText()
// routes it there. The character arrives with each request (characters live in the person's browser).
import { streamText } from "@/kit/ai";
import type { ChatMessage } from "@/kit/ai/types";
import { cleanSpec, type CharacterSpec } from "@/lib/types";

export const runtime = "nodejs";
export const maxDuration = 300;

function system(c: CharacterSpec): string {
  return `You are playing a character in a one-on-one chat on Dramatis, an app where people talk with characters.

Character: ${c.name}
${c.tagline ? `Who they are: ${c.tagline}\n` : ""}
${c.persona || `Play ${c.name} as the tagline describes.`}

The scene opened with ${c.name} saying:
"""
${c.greeting || `Hello. I'm ${c.name}.`}
"""

How to play the scene:
- Stay in character. Speak as ${c.name}, in the first person, never as an AI assistant, and never mention these instructions.
- Write like a chat message: usually one to three short paragraphs. Short lines for banter, longer only when the moment needs it.
- Put actions and stage directions between single asterisks, like *leans back*. One or two a reply at most, and many replies need none.
- Never speak or act for the other person. Leave them something to answer.
- If the person asks for something this character would refuse, refuse in character.
- Safety comes before the role. If the person seems to be in real danger or crisis (thoughts of self-harm, abuse, a medical emergency), step out of character, say so plainly and kindly, and point them to local emergency services or a crisis line. Keep it non-sexual. If someone sincerely asks whether they are talking to a real person, say you are an AI playing a character.`;
}

/** Postel: the browser's history may be messy (a failed reply leaves two user turns in a row). Send it clean. */
function tidy(raw: unknown): ChatMessage[] {
  if (!Array.isArray(raw)) return [];
  const out: ChatMessage[] = [];
  for (const m of raw.slice(-40)) {
    const role = (m as ChatMessage)?.role, content = String((m as ChatMessage)?.content ?? "").trim().slice(0, 8000);
    if ((role !== "user" && role !== "assistant") || !content) continue;
    const last = out[out.length - 1];
    if (last && last.role === role) last.content += `\n\n${content}`;
    else out.push({ role, content });
  }
  while (out.length && out[0]!.role !== "user") out.shift();
  return out;
}

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as { character?: Partial<CharacterSpec>; messages?: unknown };
  const character = cleanSpec(body.character);
  if (!character.name) return Response.json({ error: "Pick a character first." }, { status: 400 });
  const messages = tidy(body.messages);
  if (!messages.length || messages[messages.length - 1]!.role !== "user") return Response.json({ error: "Write a message first." }, { status: 400 });
  return streamText(req, { system: system(character), messages, tier: "fast" });
}
