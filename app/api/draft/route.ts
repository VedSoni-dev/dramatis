// "Write it for me": one line in, a whole character out (name, tagline, greeting, persona), streamed as JSON so the
// form can fill in field by field while it arrives.
import { streamText } from "@/kit/ai";

export const runtime = "nodejs";
export const maxDuration = 120;

const SYSTEM = `You write characters for Dramatis, a character chat app. From the person's idea, write one original character people will enjoy talking to.

Answer with one JSON object and nothing else, with the keys in this order:
{"name": "...", "tagline": "...", "greeting": "...", "persona": "..."}

- name: what people call the character, at most four words. If the idea names a real living person, invent an original character of that type instead. Avoid the names models always reach for (no Elara, Kael, Lyra, Seraphina, Zephyr).
- tagline: who they are, one line under 80 characters, plain words.
- greeting: their first message, in character, one to three sentences. It may open with one short action in single asterisks, like *looks up from the map*. It ends with something the person can answer.
- persona: 90 to 160 words, written to the actor in the second person ("You are..."): who they are, what they want, how they talk (vocabulary, rhythm, a quirk or two), how they treat the person, and one thing they would never do.

Keep it playful or useful as the idea suggests, and keep it non-sexual.`;

export async function POST(req: Request) {
  const { idea } = (await req.json().catch(() => ({}))) as { idea?: string };
  const text = String(idea ?? "").replace(/\s+/g, " ").trim().slice(0, 500);
  if (text.length < 3) return Response.json({ error: "Describe the character in a few words first." }, { status: 400 });
  return streamText(req, { system: SYSTEM, messages: [{ role: "user", content: `The idea: ${text}` }], tier: "fast", json: true });
}
