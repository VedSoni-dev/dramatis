// The public landing page at "/": what Dramatis is, the real product, the cast, how to power it, how to run it.
// Kind (taste skill): software. Main action: Start a chat. Every picture here is a real screen of the app.
// One container (.wrap) for nav, sections and footer; one section per screen; the nav floats over the hero.
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import config from "@/studio.config";
import { MODE_COPY } from "@/kit/ai/types";
import { Backdrop } from "@/components/Backdrop";
import { Portrait } from "@/components/Portrait";
import { CAST } from "@/lib/cast";

export const metadata: Metadata = {
  title: { absolute: "Dramatis: make AI characters and chat with them" },
  description: "Describe a character in one line and chat with them, or pick one of eight ready to talk. Free and open source; runs on your Claude key, ChatGPT plan or a local model.",
  other: { "page-type": "software", "site-kind": "software" },
};

const run = `git clone ${config.app.repo}.git && cd ${config.app.slug} && npm install && npm run dev`;
const screen = "flex min-h-[100svh] items-center py-24";

function Frame({ src, alt, w, h, priority = false, className = "" }: { src: string; alt: string; w: number; h: number; priority?: boolean; className?: string }) {
  return (
    <div className={`overflow-hidden rounded-[var(--radius)] border border-line bg-card shadow-[var(--shadow-3)] ${className}`}>
      <div className="flex h-8 items-center gap-1.5 border-b border-line px-3" aria-hidden>
        <i className="size-2.5 rounded-full bg-fg/15" /><i className="size-2.5 rounded-full bg-fg/15" /><i className="size-2.5 rounded-full bg-fg/15" />
      </div>
      <Image src={src} alt={alt} width={w} height={h} priority={priority} sizes="(min-width: 1024px) 720px, 100vw" className="block h-auto w-full" />
    </div>
  );
}

export default function Landing() {
  const { app } = config;
  return (
    <>
      <header className="nav fixed inset-x-0 top-0 z-30 border-b border-line bg-bg/80 backdrop-blur-md">
        <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-3 focus:z-50 focus:rounded-full focus:bg-fg focus:px-4 focus:py-2 focus:text-bg">Skip to content</a>
        <nav className="wrap flex h-16 items-center justify-between" aria-label="Main">
          <Link href="/" className="flex min-h-11 items-center gap-2 font-display text-[1.05rem] font-medium tracking-[-0.02em]">
            <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden className="text-accent"><path fill="currentColor" d="M12 2.5c1.2 3.9 3.2 6 7 7-3.8 1-5.8 3.1-7 7-1.2-3.9-3.2-6-7-7 3.8-1 5.8-3.1 7-7Z" /><circle cx="18.5" cy="18.5" r="2" fill="currentColor" opacity=".6" /></svg>
            {app.name}
          </Link>
          <div className="flex items-center gap-2">
            <span className="hidden sm:contents"><a href="#cast" className="sk-btn sk-btn-quiet">See the cast</a></span>
            <Link href="/app" className="sk-btn">Start a chat</Link>
          </div>
        </nav>
      </header>

      <main id="main">
        <section className={`hero relative isolate ${screen} pt-24 sm:pt-28`} data-enter>
          <Backdrop />
          <div className="wrap grid items-start gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14">
            <div className="sk-stagger">
              <p className="text-[.95rem] text-muted">Free and open source. Character.AI&apos;s plus plan costs $9.99 a month.</p>
              <h1 className="mt-3 text-[2.35rem] leading-[1] sm:mt-4 sm:text-6xl lg:text-[4.1rem]">Make AI characters and chat with them</h1>
              <p className="mt-4 max-w-md text-base leading-relaxed text-muted sm:mt-6 sm:text-lg">Describe someone in one line and Dramatis writes their voice and their first message. It runs on your own Claude key, ChatGPT plan or a local model.</p>
              <div className="mt-6 flex flex-wrap gap-3 sm:mt-8">
                <Link href="/app" className="sk-btn">Start a chat</Link>
                <a href={app.repo} className="sk-btn sk-btn-quiet" target="_blank" rel="noopener noreferrer">Get the code</a>
              </div>
            </div>
            <div className="sk-rise" style={{ animationDelay: "160ms" }}>
              <Frame src="/hero.png" alt="A chat in Dramatis" w={1400} h={660} priority />
            </div>
          </div>
        </section>

        <section id="cast" className={`${screen} scroll-mt-16`}>
          <div className="wrap">
            <h2 className="max-w-2xl text-4xl leading-[1.05] sm:text-5xl">Eight characters ready to talk</h2>
            <p className="mt-4 max-w-xl text-muted">Four to play with and four to practise with: Spanish over coffee, a mock interview, a pitch to a tough investor.</p>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:mt-10 lg:grid-cols-4">
              {CAST.map((c) => (
                <Link key={c.id} href={`/app/chat/${c.id}`} className="cast-card flex flex-col items-start gap-3 rounded-[var(--radius)] border border-line bg-card p-4 sm:flex-row">
                  <Portrait c={c} size={44} />
                  <span className="min-w-0">
                    <span className="block font-medium leading-tight">{c.name}</span>
                    <span className="mt-1 line-clamp-3 block text-[.9rem] leading-snug text-muted sm:text-[.95rem]">{c.tagline}</span>
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>

        <section className={screen}>
          <div className="wrap grid items-start gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14">
            <div>
              <h2 className="text-4xl leading-[1.05] sm:text-5xl">A new character from one line</h2>
              <p className="mt-4 max-w-md text-muted">Type an idea and watch the form fill in: a name, who they are, how they talk, their first message. Change anything, add a picture, save.</p>
              <ol className="mt-8 grid gap-3 text-[.95rem]">
                {["Describe them in one line", "Edit what Dramatis wrote", "Share them with a link"].map((t, i) => (
                  <li key={t} className="flex items-center gap-3"><span className="grid size-7 flex-none place-items-center rounded-full border border-line font-mono text-xs text-muted">{i + 1}</span>{t}</li>
                ))}
              </ol>
            </div>
            <Frame src="/create.png" alt="Dramatis writing a character from one line" w={1408} h={1200} />
          </div>
        </section>

        <section className={screen}>
          <div className="wrap grid items-start gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-14">
            <div>
              <h2 className="text-4xl leading-[1.05] sm:text-5xl">Four ways to power the characters</h2>
              <p className="mt-4 max-w-md text-muted">No account with us and no subscription. Pick what answers and switch whenever you like.</p>
              <ul className="mt-8 grid gap-4">
                {config.modes.map((m) => (
                  <li key={m}>
                    <h3 className="text-[1.05rem]">{MODE_COPY[m].label}</h3>
                    <p className="mt-0.5 text-[.95rem] leading-relaxed text-muted">{MODE_COPY[m].blurb}{(m === "local" || m === "chatgpt") && " Needs the app on your computer."}</p>
                  </li>
                ))}
              </ul>
            </div>
            <Frame src="/modes.png" alt="Choosing what powers Dramatis" w={1320} h={1496} className="mx-auto w-full max-w-[30rem] lg:mr-0" />
          </div>
        </section>
      </main>

      <footer className="closing flex min-h-[100svh] flex-col">
        <div className="wrap flex flex-1 flex-col justify-center py-24">
          <h2 className="max-w-4xl text-5xl leading-[1] sm:text-7xl">Open source under the MIT licence</h2>
          <p className="mt-6 max-w-xl text-lg text-muted">Characters and chats stay in your browser. Run your own copy with one command, then open localhost:3000.</p>
          <pre className="mt-8 whitespace-pre-wrap break-all rounded-[var(--radius-sm)] border border-line bg-bg-2 p-4 font-mono text-sm text-fg/90">{run}</pre>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/app" className="sk-btn">Start a chat</Link>
            <a href={app.repo} className="sk-btn sk-btn-quiet" target="_blank" rel="noopener noreferrer">Get the code</a>
          </div>
        </div>
        <div className="wrap flex flex-wrap items-center justify-between gap-3 border-t border-line py-8 text-sm text-muted">
          <span>Built by Vedant Soni · <a className="underline underline-offset-4 hover:text-fg" href="https://instagram.com/vedanttalksai" target="_blank" rel="noopener noreferrer">@vedanttalksai</a></span>
          <span>Inspired by Character.AI. Not affiliated with it.</span>
        </div>
      </footer>
    </>
  );
}
