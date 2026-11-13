// The public landing page at "/", as one static HTML document (app/route.ts serves it). It is built on the taste
// skill's kit (public/assets: system.css, layout, motion, moments), which is plain CSS and scripts written for a static
// page, so the page is plain HTML rather than React: no hydration for the kit's scripts to trip over, and none of the
// app's Tailwind on this page. Every name, line and face comes from the app's own data (lib/cast.ts, lib/portraits.ts,
// studio.config.ts). DESIGN.md has the plan; the deal is in the comment at the top of <body>.
import config from "@/studio.config";
import { CAST } from "@/lib/cast";
import { portraitFor } from "@/lib/portraits";

const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const byId = (id: string) => CAST.find((c) => c.id === id)!;
/** A character's words as the app sets them: *actions* in italics. */
const said = (s: string) => esc(s).replace(/\*([^*]+)\*/g, '<em class="dr-stage">$1</em>');
/** The inline face for the drawn windows (UI pictures, aria-hidden). */
const face = (id: string, name?: string) => `<span class="dr-av">${portraitFor({ id, name: name ?? byId(id).name })}</span>`;

const ARROW = `<svg class="m-arrow" viewBox="0 0 12 12" aria-hidden="true"><path class="m-arrow__stem" d="M1 6h8"/><path class="m-arrow__head" d="M4.5 2.5 8 6l-3.5 3.5"/></svg>`;
const CHEV = `<svg class="chev" viewBox="0 0 12 12" aria-hidden="true"><path d="M3 4.5l3 3 3-3" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/></svg>`;
const RETAKE = `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12a8 8 0 0 1 14-5.3M20 4v5h-5M20 12a8 8 0 0 1-14 5.3M4 20v-5h5" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>`;

/** The cast's portraits, described for people who cannot see them. */
const ALT: Record<string, string> = {
  odile: "Odile, a pale ghost with her hair pinned up and a high lace collar, in front of a dryer door",
  brick: "Brick, an orange cat with half-closed eyes, sitting on a keyboard in a sunbeam",
  "ines-calder": "Inès Calder in a fedora and a trench coat, a lit window and rain behind her",
  "juno-rask": "Captain Juno Rask in a headset and a flight jacket, a ringed planet behind her",
  marta: "Marta, smiling, with curly hair and gold hoops, in an apron",
  rhea: "Rhea Bancroft with a black bob, glasses and a pencil behind her ear, in a navy blazer",
  "vera-holt": "Vera Holt, silver-haired, one eyebrow raised, in a black turtleneck, a chart line behind her",
  theo: "Theo with round glasses and a beard, in a rust cardigan, question marks behind him",
};
/** Nav card lines: the tagline, cut to one line of 52 characters where it runs longer. */
const SHORT: Record<string, string> = { brick: "A house cat with opinions about your life", "juno-rask": "Captain of a battered cargo ship" };

function tile(id: string): string {
  const c = byId(id);
  return `<a class="tile dr-tile span-3" href="/app/chat/${c.id}">
          <div class="tile__media"><img src="/portraits/${c.id}.svg" alt="${esc(ALT[c.id] ?? c.name)}" width="320" height="320" loading="lazy" data-source="client" data-subject="${esc(c.name)}, a Dramatis character"></div>
          <div class="tile__head"><span class="tile__name">${esc(c.name)}</span></div>
          <p>${esc(c.tagline).replace("24-hour", "24&#8209;hour")}</p>
        </a>`;
}

function menuCard(id: string): string {
  const c = byId(id);
  return `<a class="menu-card span-3" href="/app/chat/${c.id}">
              <div class="panel"><img class="frame__img" src="/portraits/${c.id}.svg" alt="" data-source="client" data-subject="${esc(c.name)}"></div>
              <span class="t-card">${esc(c.name)}</span>
              <span class="t-small muted">${esc(SHORT[c.id] ?? c.tagline)}</span>
            </a>`;
}

/** One row of the chat list in the app-frame. */
function row(id: string, line: string, when: string, on = false, name?: string): string {
  const n = name ?? byId(id).name;
  return `<div class="dr-row${on ? " is-on" : ""}">${face(id, n)}<div class="dr-row__text"><b>${esc(n)}</b><span>${esc(line)}</span></div><time>${when}</time></div>`;
}

export function landingHTML(): string {
  const { app } = config;
  const odile = byId("odile"), ines = byId("ines-calder");
  const title = "Dramatis: free, open-source AI character chat";
  const description = "Chat with eight ready-made AI characters or describe a new one in a line. A free Character.AI alternative that runs on your own Claude or OpenAI API key or a publik plan.";

  return `<!doctype html>
<html lang="en" data-type="software" data-radius="round" data-ground="sky" data-buttons="pill" data-motion>
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>${title}</title>
<meta name="description" content="${esc(description)}">
<meta property="og:type" content="website">
<meta property="og:title" content="${title}">
<meta property="og:description" content="Eight characters ready to talk, and a new one from one line. No account, no subscription, MIT licensed.">
<meta property="og:url" content="${app.url}/">
<meta property="og:image" content="${app.url}/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="628">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${title}">
<meta name="twitter:description" content="Eight characters ready to talk, and a new one from one line. No account, no subscription, MIT licensed.">
<meta name="twitter:image" content="${app.url}/og.png">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<meta name="theme-color" content="#0a0d14">
<link rel="canonical" href="${app.url}/">
<meta name="site-kind" content="software">
<meta name="page-type" content="software">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Schibsted+Grotesk:ital,wght@0,400..700;1,400..500&family=JetBrains+Mono:wght@400..500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/assets/system.css">
<link rel="stylesheet" href="/assets/ui/cards.css">
<link rel="stylesheet" href="/assets/motion/motion.css">
<link rel="stylesheet" href="/assets/backgrounds/backgrounds.css">
<link rel="stylesheet" href="/assets/layout/layout.css">
<link rel="stylesheet" href="/assets/icons/icon.css">
<style>
:root {
  --p-bg: #0a0d14; --p-surface: #131824; --p-ink: #e9edf3; --p-muted: #8891a1;
  --p-accent: #5ab9fc; --p-accent-ink: #0a0d14; --p-action: #5ab9fc; --p-action-ink: #0a0d14;
  --p-inv-bg: #e9edf3; --p-inv-surface: #d7dbe1; --p-inv-ink: #0a0d14; --p-inv-muted: #54575f;
  --p-inv-accent: #0a0d14; --p-inv-accent-ink: #e9edf3; --p-inv-action: #0a0d14; --p-inv-action-ink: #e9edf3;
  --font-display: "Schibsted Grotesk", system-ui, sans-serif;
  --font-text: "Schibsted Grotesk", system-ui, sans-serif;
  --font-mono: "JetBrains Mono", ui-monospace, "SFMono-Regular", Menlo, Consolas, monospace;
  --display-weight: 400;
  --display-tracking: -0.035em;
  --display-tracking-xl: -0.042em;
  --ly-scale: 0.98;
}
</style>
<link rel="stylesheet" href="/assets/ui/base.css">
<link rel="stylesheet" href="/landing.css">
<script>document.documentElement.classList.add('m-enter');setTimeout(()=>document.documentElement.classList.add('m-enter-done'),700)</script>
<script src="/assets/backgrounds/backgrounds.js"></script>
<script>document.documentElement.classList.add('mo-js');setTimeout(()=>document.documentElement.classList.add('mo-safe'),2500)</script>
<link rel="modulepreload" href="/assets/moments/moments.js">
<link rel="modulepreload" href="/assets/moments/lib.js">
<link rel="modulepreload" href="/assets/moments/liquid-type/moment.js">
</head>
<body>
<!-- type: software (site-kind software) · category: AI character chat app · main action: Start a chat
     deal: hero collage, nav nav-cards, close close-type, footer footer-statement, rhythm space, buttons pill,
           mark wordmark, palette blue-black-cornflower, type schibsted, radius round, lit ground sky
     effect: fluted-glass in the hero's frame, held still (the hero's own loop is the small card)
     moments: liquid-type on the #make statement (the line ripples under the pointer)
     screens at 1440x900: hero 1 · cast 2 · make 1 · chat 1 · power 1 · questions 1 · footer 1 -->
<header class="nav">
  <div class="wrap nav__bar">
    <a class="skip-link" href="#top">Skip to content</a>
    <a class="nav__logo" href="#top">Dramatis</a>
    <nav class="nav__links" aria-label="Main">
      <div class="nav__item">
        <a class="nav__link" href="#cast">Cast ${CHEV}</a>
        <div class="nav__menu">
          <div class="wrap grid">
            ${["odile", "brick", "ines-calder", "juno-rask"].map(menuCard).join("\n            ")}
          </div>
        </div>
      </div>
      <div class="nav__item"><a class="nav__link" href="#make">Creator</a></div>
      <div class="nav__item"><a class="nav__link" href="#chat">Chat</a></div>
      <div class="nav__item"><a class="nav__link" href="#power">Setup</a></div>
      <div class="nav__item"><a class="nav__link" href="#questions">Questions</a></div>
    </nav>
    <div class="nav__actions">
      <a class="nav__link" href="${app.repo}">GitHub</a>
      <a class="btn btn--primary" href="/app">Start a chat</a>
    </div>
    <button class="nav__toggle" type="button" aria-expanded="false" aria-label="Menu"><svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true"><path d="M2 5h14M2 13h14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg></button>
  </div>
</header>

<main id="top">
  <section class="hero hero--collage" data-enter aria-labelledby="hero-h">
    <div class="wrap"><div class="hero-text grid hero__grid">
      <div class="hero__text span-5">
        <h1 id="hero-h">Free, open-source AI character chat</h1>
        <p class="hero__lead">A Character.AI alternative with no account and no subscription. Talk to 8 ready-made characters, from a ghost in a laundromat to a skeptical investor.</p>
        <div class="btn-row"><a class="btn btn--primary" href="/app">Start a chat${ARROW}</a><a class="btn btn--secondary" href="${app.repo}">Get the code</a></div>
        <p class="hero__proof">Runs on your Claude or OpenAI API key, or your publik plan.</p>
      </div>
      <div class="hero__art span-6 start-7" data-fx="fluted-glass" data-fx-seed="7"
           data-fx-palette='{"bg":"#c6d3df","surface":"#d6e0e9","ink":"#25303a","accent":"#3f6a92"}'
           data-fx-params='{"speed":0,"ribWidth":30,"distortion":0.55,"highlight":0.12,"shadow":0.14,"calm":0.5,"calmX":0.55,"calmY":0.55}'
           role="img" aria-label="Dramatis open on a chat with Odile, the laundromat ghost, with a second take of her reply, and a new character written from one line">
        <div class="ly-piece ly-piece--main ui ui-chatwin dr-win" aria-hidden="true">
          <div class="dr-win__head">${face("odile")}<div class="dr-win__who"><b>${esc(odile.name)}</b><span>${esc(odile.tagline)}</span></div><span class="dr-pill"><i></i>Claude API key</span></div>
          <div class="dr-chat">
            <div class="dr-line">${face("odile")}<div><div class="dr-name">Odile</div><div class="dr-text">${said("*The dryer in the corner stops on its own.* Oh! Forgive me, I didn't hear you come in. Hardly anyone sees me before three in the morning.")}</div></div></div>
            <div class="dr-me">My flatmate keeps taking my socks.</div>
            <div class="dr-line">${face("odile")}<div><div class="dr-name">Odile</div><div class="dr-text">${said("*She drifts to the lost-and-found basket and lifts out one grey sock.* I dare say this is the fourth this week. Shall we set a trap by the spin cycle?")}</div>
              <div class="dr-takes"><span class="dr-takes__arrow">‹</span><span>Take 2 of 3</span><span class="dr-takes__arrow">›</span><span class="dr-retake">${RETAKE}Another take</span></div></div></div>
          </div>
        </div>
        <div class="ly-piece ly-piece--note dr-note" aria-hidden="true" data-ly-steps="700">
          <div class="dr-note__head"><b>New character</b><span class="dr-chip" data-step data-step-at="4">Ready</span></div>
          <div class="dr-note__idea">“a medieval knight who just discovered smartphones”</div>
          <div class="dr-note__who" data-step>${face("knight", "Sir William Knight")}<div><b>Sir William Knight</b><span>A medieval knight, baffled by his new phone</span></div></div>
          <div class="dr-note__line" data-step>${said("*squints at the glowing slab* Is this a window, or a very small dungeon?")}</div>
        </div>
      </div>
    </div></div>
  </section>

  <section class="section g2 g2m" id="cast" aria-labelledby="cast-h">
    <div class="wrap">
      <div class="group">
        <div class="section-head">
          <h2 id="cast-h">Eight characters ready to talk. <span class="muted">Four to play with, four to practise with.</span></h2>
        </div>
        <p class="t-label muted dr-shelf">To play with</p>
        <div class="grid">
        ${["odile", "brick", "ines-calder", "juno-rask"].map(tile).join("\n        ")}
        </div>
      </div>
      <div class="group">
        <p class="t-label muted dr-shelf">To practise with</p>
        <div class="grid">
        ${["marta", "rhea", "vera-holt", "theo"].map(tile).join("\n        ")}
        </div>
      </div>
    </div>
  </section>

  <section class="section" id="make" aria-labelledby="make-h">
    <div class="wrap">
      <div data-moment="liquid-type" data-moment-opts='{"strength": 0.9}'>
        <h2 id="make-h" class="mo-lt__type dr-statement">Talk to any character you can describe</h2>
      </div>
      <div class="grid fill dr-make">
        <div class="span-5 stack-6">
          <p class="t-lead">Type one line and Dramatis writes their name, who they are, how they talk and their first message. Change anything, add a picture, then share them with a link.</p>
          <form class="dr-idea" action="/app/new" method="get" data-idea>
            <label for="idea">Describe a character</label>
            <div class="dr-idea__row">
              <input id="idea" name="idea" type="text" autocomplete="off" maxlength="500" placeholder="a grumpy dragon who runs a bakery">
              <button class="btn btn--secondary" type="submit">Write my character</button>
            </div>
            <p class="dr-idea__hint" role="status" data-idea-hint>It opens the character writer in the app.</p>
          </form>
        </div>
        <div class="frame frame--lit frame--fill span-6 start-7 dr-frame">
          <div class="stage stage--fade-b">
            <div class="at-rise to-edge fit dr-writer-at">
              <div class="ui ui-writer dr-writer" role="img" aria-label="The character writer filling in Hazel Moorcroft, a retired lighthouse keeper who writes terrible poetry, from one line">
                <div class="dr-writer__idea"><span>“a retired lighthouse keeper who writes terrible poetry”</span><i><span class="dr-writer__dot"></span>Writing</i></div>
                <div class="dr-writer__who">${face("hazel", "Hazel Moorcroft")}<div><b>Hazel Moorcroft</b><span>Kept the Kettle Point light for forty years. Now she rhymes.</span></div></div>
                <div class="dr-writer__field"><span>Name</span><div>Hazel Moorcroft</div></div>
                <div class="dr-writer__field"><span>Who they are, in one line</span><div>Kept the Kettle Point light for forty years. Now she rhymes.</div></div>
                <div class="dr-writer__field is-filling"><span>Their first message</span><div>${said("*She unfolds a damp page and clears her throat.* An ode to fog, in eleven verses. Do sit")}<b class="dr-caret"></b></div></div>
                <div class="dr-writer__field"><span>How they think and talk</span><div class="dr-writer__empty"></div></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="section" id="chat" aria-labelledby="chat-h">
    <div class="wrap">
      <div class="grid">
        <h2 id="chat-h" class="span-5">Another take on any chat reply</h2>
        <div class="span-6 start-7 stack-4">
          <p class="t-lead">Pick someone and say hello. Replies stream in with their actions in italics, and Another take writes a reply again while you keep the ones you liked.</p>
          <a class="link" href="/app#cast">Open the cast</a>
        </div>
      </div>
      <div class="ui app fill dr-app" role="img" aria-label="The Dramatis app: a list of chats beside an open chat with Inès Calder, the noir detective, on her second take" data-ui-pause-host>
        <div class="app__pane app__pane--list">
          <div class="ui ui-chatlist dr-list">
            <div class="dr-list__head"><b>Chats</b><span>9</span></div>
            ${row("ines-calder", "A fridge job. Here's what we've got.", "now", true)}
            ${row("marta", "Pequeña corrección: un café, not una café.", "1h")}
            ${row("brick", "I suppose you may stay. The sofa is mine.", "3h")}
            ${row("juno-rask", "Pip says the engine will hold. Pip is lying.", "Mon")}
            ${row("theo", "What do you already know about tides?", "Mon")}
            ${row("vera-holt", "Who pays, and why would they switch?", "Sun")}
            ${row("rhea", "Tell me about a time you disagreed with a lead.", "Sat")}
            ${row("odile", "The change machine has taken another coin.", "Fri")}
            ${row("knight", "Sire, the slab has gone dark again.", "Thu", false, "Sir William Knight")}
          </div>
        </div>
        <div class="app__pane app__pane--open">
          <div class="ui ui-chatopen dr-open" data-ly-steps="700">
            <div class="dr-win__head">${face("ines-calder")}<div class="dr-win__who"><b>${esc(ines.name)}</b><span>${esc(ines.tagline)}</span></div><span class="dr-dots" aria-hidden="true"><i></i><i></i><i></i></span></div>
            <div class="dr-intro">${face("ines-calder")}<b>${esc(ines.name)}</b><span>${esc(ines.tagline)}</span></div>
            <div class="dr-chat">
              <div class="dr-line">${face("ines-calder")}<div><div class="dr-name">Inès Calder</div><div class="dr-text">${said("*Rain on the office window. She doesn't look up from the file.* Sit. Everybody who comes through that door has a problem they're embarrassed to be bothered by. Tell me yours.")}</div></div></div>
              <div class="dr-me" data-step>Someone keeps eating my leftovers from the office fridge.</div>
              <div class="dr-line" data-step>${face("ines-calder")}<div><div class="dr-name">Inès Calder</div><div class="dr-text">${said("*She finally looks up.* A fridge job. Here's what we've got: a labelled box, a floor full of people with lunch breaks, and a thief bold enough to come back. When did it last go missing?")}</div>
                <div class="dr-takes" data-step><span class="dr-takes__arrow">‹</span><span>Take 2 of 2</span><span class="dr-takes__arrow">›</span><span class="dr-retake">${RETAKE}Another take</span></div></div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="section" id="power" aria-labelledby="power-h">
    <div class="wrap">
      <div class="grid fill">
        <div class="span-5 stack-6">
          <h2 id="power-h">Runs on your own AI</h2>
          <p class="t-lead">No account and no subscription to Dramatis. On this site, paste a Claude or OpenAI API key, or sign in with publik and use your plan.</p>
          <div class="dr-facts">
            <p>Your key is kept in an encrypted cookie on this browser.</p>
            <p>A local model or your ChatGPT plan works when Dramatis runs on your computer.</p>
            <p>Switch at any time with the AI button at the top of the app.</p>
          </div>
          <a class="link" href="${app.repo}#run-it-yourself">See how to run it yourself</a>
        </div>
        <div class="frame frame--lit frame--fill span-6 start-7 dr-frame">
          <div class="stage">
            <div class="at-rise fit dr-pick-at">
              <div class="ui ui-picker dr-pick" role="img" aria-label="The AI picker on this site: Claude API key, OpenAI API key and publik, with a local model and the ChatGPT plan for when the app runs on your computer">
                <div class="dr-pick__head"><b>Power Dramatis with…</b><span aria-hidden="true">×</span></div>
                <div class="dr-pick__card"><div class="dr-pick__top"><span class="dr-pick__icon"><svg viewBox="0 0 24 24"><circle cx="8" cy="15" r="4"/><path d="M11 12l8-8M16 7l2 2M14 9l2 2"/></svg></span><div><b>Claude API key</b><span>Paste your Anthropic key. It stays in an encrypted cookie on this browser.</span></div></div>
                  <div class="dr-pick__field"><span>sk-ant-…</span><i>Save</i></div></div>
                <div class="dr-pick__card"><div class="dr-pick__top"><span class="dr-pick__icon"><svg viewBox="0 0 24 24"><circle cx="8" cy="15" r="4"/><path d="M11 12l8-8M16 7l2 2M14 9l2 2"/><path d="M8 13.5v3M6.5 15h3"/></svg></span><div><b>OpenAI API key</b><span>Paste your OpenAI key. It stays in an encrypted cookie on this browser.</span></div></div></div>
                <div class="dr-pick__card"><div class="dr-pick__top"><span class="dr-pick__icon"><svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3 3 15 0 18M12 3c-3 3-3 15 0 18"/></svg></span><div><b>publik</b><span>Sign in with publik and use your publik plan. No key needed.</span></div></div>
                  <span class="dr-pick__btn">Sign in with publik</span></div>
                <div class="dr-pick__local"><b>Local model and ChatGPT plan</b> need the app running on your computer.<code>git clone ${esc(app.repo)}.git</code></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>

  <section class="section" id="questions" aria-labelledby="questions-h">
    <div class="wrap">
      <div class="grid fill">
        <div class="span-5 stack-6">
          <h2 id="questions-h">Questions about Dramatis</h2>
          <div class="dr-faces"><img src="/portraits/odile.svg" alt="" width="56" height="56" loading="lazy" data-source="client" data-subject="the Dramatis cast"><img src="/portraits/brick.svg" alt="" width="56" height="56" loading="lazy" data-source="client" data-subject="the Dramatis cast"><img src="/portraits/ines-calder.svg" alt="" width="56" height="56" loading="lazy" data-source="client" data-subject="the Dramatis cast"><img src="/portraits/juno-rask.svg" alt="" width="56" height="56" loading="lazy" data-source="client" data-subject="the Dramatis cast"><img src="/portraits/marta.svg" alt="" width="56" height="56" loading="lazy" data-source="client" data-subject="the Dramatis cast"><img src="/portraits/rhea.svg" alt="" width="56" height="56" loading="lazy" data-source="client" data-subject="the Dramatis cast"><img src="/portraits/vera-holt.svg" alt="" width="56" height="56" loading="lazy" data-source="client" data-subject="the Dramatis cast"><img src="/portraits/theo.svg" alt="" width="56" height="56" loading="lazy" data-source="client" data-subject="the Dramatis cast"></div>
        </div>
        <div class="faq dr-faq span-6 start-7">
          <div class="faq__item"><h3>Is Dramatis free?</h3><p>Yes, and it is MIT licensed. You pay your AI provider for what you use, or nothing with a local model.</p></div>
          <div class="faq__item"><h3>Where are my characters and chats kept?</h3><p>In this browser, on this device. There is no account, so they do not follow you to another device.</p></div>
          <div class="faq__item"><h3>How does a character's share link work?</h3><p>The whole character travels inside the link, after the #, so no server ever stores it.</p></div>
          <div class="faq__item"><h3>Is Dramatis made by Character.AI?</h3><p>No. It is an independent open-source project, inspired by Character.AI and not affiliated with it.</p></div>
          <div class="faq__item"><h3>What if a chat turns serious?</h3><p>Characters stay in role for the story, and step out of it to answer plainly when someone is really at risk.</p></div>
        </div>
      </div>
    </div>
  </section>
</main>

<footer class="footer closing footer--statement" id="contact" aria-labelledby="close-h">
  <div class="wrap">
    <div class="closing__cta close--type">
      <div class="section-head">
        <h2 id="close-h">Start a chat with Odile, Brick or Theo</h2>
        <p>Free in your browser, with no account. Your chats stay on your device.</p>
      </div>
      <a class="btn btn--primary btn--xl btn--wide" href="/app">Start a chat${ARROW}</a>
    </div>
    <div class="closing__links">
      <div class="grid">
        <div class="span-4 stack-4">
          <a class="nav__logo" href="#top">Dramatis</a>
          <p class="footer__lede">Free, open-source AI character chat, made by Vedant Soni.</p>
        </div>
        <div class="span-2 start-7 footer__col"><h3>App</h3><ul><li><a href="/app">Cast</a></li><li><a href="/app/new">New character</a></li></ul></div>
        <div class="span-2 footer__col"><h3>Page</h3><ul><li><a href="#chat">Chat</a></li><li><a href="#questions">Questions</a></li></ul></div>
        <div class="span-2 footer__col"><h3>Code</h3><ul><li><a href="${app.repo}">GitHub</a></li><li><a href="${app.repo}/issues">Report a bug</a></li></ul></div>
      </div>
      <div class="footer__legal">
        <span class="dr-legal"><span>&copy; 2026 Vedant Soni</span><a href="${app.repo}/blob/main/LICENSE">MIT licence</a><a href="${app.repo}#how-it-works">Privacy</a></span>
        <span>Inspired by Character.AI. Not affiliated with it.</span>
      </div>
    </div>
  </div>
</footer>
<nav class="actionbar" aria-label="Quick actions">
  <a class="btn btn--primary" href="/app">Start a chat</a>
</nav>
<script type="module" src="/assets/system.js"></script>
<script type="module" src="/assets/motion/motion.js"></script>
<script type="module" src="/assets/layout/layout.js"></script>
<script type="module" src="/landing.js"></script>
</body>
</html>
`;
}
