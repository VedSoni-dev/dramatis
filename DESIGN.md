# Dramatis: design

The redesign of 2026-11-13, made with the taste skill (tasteskill 2.5.1) end to end. The bar was Vedant's Agent GC:
plain words, the real product alive in the hero with the main action beside it, one family and a mono, one accent on a
calm ground, even spacing, one quiet effect.

## What changed and why

- **The characters have faces.** A character app sells on faces and personality; two-letter monograms on dark tiles
  sold neither. `lib/portraits.ts` draws every face in code (SVG): a flat, lit bust on a coloured ground with one detail
  of the character's world (Odile's dryer door, Brick's sunbeam and the keyboard he sits on, Inès's lit window in the
  rain, Juno's ringed planet, Marta's Valencia sun, Rhea's ruled notebook, Vera's chart, Theo's question marks). A
  character someone makes gets a face seeded from its name (ground, skin, hair, clothes, glasses, earrings; an honorific
  like "Sir" or "Lady" steers the hair), so it is never a blank tile; a copy of a cast member keeps their face; a
  picture the person adds replaces it. All fictional and drawn: no photographs of people.
- **Colour lives in the faces, not the interface.** The UI is night and ink with one sky-blue accent; the eight
  portrait grounds (mint, sky, slate, deep teal, terracotta, rose, forest, ochre) are the only other colour on screen.
- **The landing shows the product and the cast.** The hero is Dramatis's own chat window, alive; the second screen is
  the cast, face first; the creator has its own section with the real one-line form; the chat app is shown whole.

## The deal (taste skill, never by taste)

- **Kind:** software (site-kind software). Category: AI character chat app. Main action: **Start a chat**.
- **Hero:** `collage`: the words on five columns; Odile's chat window on the lit frame, cut by its right and bottom
  edges; one small card over its lower left that writes a new character from one line (its loop: layout.js steps).
- **Palette:** `blue-black-cornflower`: ground #0a0d14, surface #131824, ink #e9edf3, muted #8891a1, accent #5ab9fc
  (ink on it #0a0d14). A night ground with one sky-blue light: the hour people talk to characters, and a colour that
  stays out of the portraits' way.
- **Type:** `schibsted`: Schibsted Grotesk for everything (display 400, tracking -3.5%, its italic for the characters'
  stage directions) and JetBrains Mono for labels and names in the chat. The old Instrument Serif is gone.
- **Radius** round (a consumer app). **Buttons** pill. **Mark** wordmark ("Dramatis" in the display face).
- **Nav** `nav-cards` (Cast opens four of the cast's faces), **close** `close-type`, **footer** `footer-statement` (the
  lit sky ground), **rhythm** `space`, **lit ground** sky.
- **Effect:** `fluted-glass`, held still, behind the hero's window (the one quiet effect).
- **Moment:** `liquid-type` on the creator's statement ("Talk to anyone you can describe" ripples under the pointer).

## The landing, screen by screen (1440x900)

| Screen | Section | What it shows |
|---|---|---|
| 1 | hero | h1 "Free, open-source AI character chat"; Start a chat, Get the code; Odile's chat with Take 2 of 3 |
| 2-3 | `#cast` | eight portrait tiles in two shelves, to play with and to practise with; each opens that chat; the heading says up to four can share a group chat |
| 4 | `#make` | the statement (liquid-type), the real one-line form, the character writer filling in from one line |
| 5 | `#chat` | the app whole: the chat list beside an open chat with Inès Calder on her second take |
| 6 | `#power` | how it runs: the picker exactly as the hosted site shows it (Claude key, OpenAI key, publik) |
| 7 | `#questions` | six questions with their answers open |
| 8 | footer | Start a chat with Odile, Brick or Theo; the links on the lit sky ground |

The hosted site offers a Claude API key, an OpenAI API key and publik. A local model and the ChatGPT plan only work when
Dramatis runs on your own computer; the landing says exactly that.

**How it is built.** `/` is `app/route.ts`, which serves `lib/landing.ts`: static HTML on the taste kit in
`public/assets` (system.css, layout, motion, moments, the one effect), page CSS in `public/landing.css`, the form's
script in `public/landing.js`. Not React, so the kit's plain scripts never fight hydration and the app's Tailwind never
reaches the page; its words and faces still come from `lib/cast.ts`, `lib/portraits.ts` and `studio.config.ts`. The
portraits are also served as files (`/portraits/<id>.svg`, `app/portraits/[file]/route.ts`).

## The app

- **Home (`/app`):** "Who do you want to talk to?", the one-line writer as a pill field, idea chips, recent chats as
  compact rows, then the cast shelves as big face cards (the face 1:1, the name, one line; a linked card lifts 2px and
  its face grows 3% inside its frame).
- **Chat (`/app/chat/[id]`):** on a desktop the chat list sits beside the chat (your chats, then the rest of the cast),
  so switching characters is one click. The chat opens on the character's face, name and line. Their lines carry a
  36px face and their name in mono; stage directions are italic and a step quieter; your lines are a soft bubble.
  "Another take" is the one tinted control under the last reply; streaming, takes, share link and start over work as before.
- **Group chats (`/app/group/new`, `/app/group/[id]`):** pick two to four characters by their faces (a picked face takes
  a sky ring and its number; the bar at the foot shows the faces together and starts the chat). The group chat opens on
  the members' faces standing together (`components/Cluster.tsx`), sits beside the same chat list (which lists group
  chats too), and keeps "Another take" as the one tinted control, with "Keep going" as a quiet pill beside it.
- **New character (`/app/new`):** the face on the left updates as the name is written (seeded until a picture is
  added), the form on the right; "Write it for me" fills it field by field.
- **The AI picker** (`ModeButton`/`ModePanel` from `kit/react`) is re-toned from `app/globals.css` by overriding the
  kit's `sk-*` classes and tokens: night dialog, card surfaces one step up, pill fields. `kit/` is untouched.

## Motion

- Landing: the hero enters once (motion.js), its small card writes a character in three steps (layout.js), the
  app-frame's open chat plays its second take, liquid-type on the statement, the kit's hover layer everywhere.
  Nothing moves on scroll. Reduced motion: everything rests on its finished picture.
- App: springs at 300ms or less (docs/principles.md). The take: "Another take" winds the old reply back, the new one
  rises; flipping takes slides left or right. While a character speaks, their face's sky ring breathes.

## Every state

- Empty: no chats yet, the cast is the home screen; a chat opens on the character's face and greeting.
- Loading: "<Name> is typing" with three sky dots; the writer fills the form field by field as it streams.
- Error: `sk-error` with the fix in words and one link; no AI chosen opens the picker and keeps the typed message.
- Success: a saved character or a copied link gets the kit's check flourish, once.
