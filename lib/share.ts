// A character travels in the link itself (after the #, so it never reaches a server). No database, no accounts.
import { cleanSpec, type CharacterSpec } from "./types";

const toB64url = (s: string) => {
  const bytes = new TextEncoder().encode(s);
  let bin = "";
  bytes.forEach((b) => { bin += String.fromCharCode(b); });
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
};
const fromB64url = (s: string) => {
  const bin = atob(s.replace(/-/g, "+").replace(/_/g, "/"));
  return new TextDecoder().decode(Uint8Array.from(bin, (c) => c.charCodeAt(0)));
};

export function shareLink(origin: string, c: CharacterSpec): string {
  const s = cleanSpec(c);
  return `${origin}/app/new#c=${toB64url(JSON.stringify({ n: s.name, t: s.tagline, g: s.greeting, p: s.persona }))}`;
}

export function readShared(hash: string): CharacterSpec | null {
  const m = hash.match(/[#&]c=([A-Za-z0-9_-]+)/);
  if (!m) return null;
  try {
    const o = JSON.parse(fromB64url(m[1]!)) as { n?: string; t?: string; g?: string; p?: string };
    const spec = cleanSpec({ name: o.n, tagline: o.t, greeting: o.g, persona: o.p });
    return spec.name ? spec : null;
  } catch { return null; }
}
