# Dramatis: design

Written before any UI code (the taste skill's brief), then kept true to what shipped.

- **Kind (taste skill):** software. Category: AI character chat app. Main action: Start a chat.
- **Theme:** glass (`kit/ui/themes/glass.css`) as the base, re-toned to the taste skill's deal: palette
  `lunar-grey-bronze`, type `schibsted`, radius soft. The glass violet is gone (the taste skill bans violet).
- **One-line feel:** a dark stage, one warm light; the character is the only thing lit.
- **Type:** display and body Schibsted Grotesk (display 400–500, tracking −3.5 %), labels JetBrains Mono,
  stage directions (`*leans on the railing*`) in Instrument Serif italic, like a script. Sizes: 15 px chat text,
  13 px labels, hero h1 clamp(2.6rem, 6vw, 5.2rem).
- **Colour:** ground #111111, surface #1c1c1c, ink #f2f2f2, muted #a3a3a3, ONE accent bronze #a08672 (ink on it
  #111111). The accent marks the primary action (Send, Start a chat) and the live state (the speaking character's
  ring, the typing dots) only. Portraits are tonal: desaturated warm and cool greys, never a second accent.
- **Portraits:** a monogram (Schibsted Grotesk 500; the serif's hairline O read as "()" at small sizes) on a tonal
  gradient seeded from the name, lit from above like a spotlight; or the person's own picture (256 px, kept in the browser).
- **The hero moment (landing):** a real screen of the app in a framed window, under one warm CSS spotlight (no WebGL:
  the glass mesh shader drew a white canvas in headless Chrome and has no still fallback). Muted text raised to #a3a3a3
  for contrast; focus is a 2 px bronze outline everywhere.
- **Motion:** docs/principles.md (springs ≤300 ms, arcs, staggered settle, instant frequent actions).
  Signature motion: **the take**. "Another take" winds the old reply back 6 px, sends it off to the left, and the
  new take rises in on a spring; the "Take 2 of 3" counter settles a beat after. While a character speaks, their
  portrait's bronze ring breathes.
- **Every state designed:**
  - empty: no chats yet → the cast is the home screen; a new chat opens on the character's greeting;
  - loading: before the first word, "<Name> is typing" with three bronze dots (well inside 400 ms); the
    write-it-for-me form fills field by field as the answer streams;
  - error: `sk-error` (colour + shake) with the fix in words and one link; no AI mode → the picker opens with the
    reason, and the typed message stays in the box;
  - success: a character saved or a link copied gets the kit's check flourish, once.
- **Reel shots:**
  1. one line ("a medieval knight who just discovered smartphones") → the character writes itself into the form;
  2. it greets you, streaming, with its actions in serif italic;
  3. "Another take" twice (Take 1 → 2 → 3 of 3), then Share → "Link copied".
