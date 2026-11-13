"use client";
// The app's header: the name (or the character you're talking to) on the left, the AI pill on the right (Jakob's law).
import Link from "next/link";
import type { ReactNode } from "react";
import { ModeButton } from "@/kit/react/ModePanel";

export function Wordmark() {
  return (
    <Link href="/app" className="flex min-h-11 items-center rounded-full pr-2 font-display text-[1.25rem] tracking-[-0.03em]">
      Dramatis
    </Link>
  );
}

export function AppHeader({ left, right, wide = false }: { left?: ReactNode; right?: ReactNode; wide?: boolean }) {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-bg">
      <div className={`flex h-16 items-center justify-between gap-3 ${wide ? "px-4 sm:px-6" : "wrap"}`}>
        <div className="flex min-w-0 items-center gap-2.5">{left ?? <Wordmark />}</div>
        <div className="flex flex-none items-center gap-2">{right}<ModeButton /></div>
      </div>
    </header>
  );
}

export function Toast({ text }: { text: string }) {
  return (
    <div className="toast" role="status">
      <span className="sk-flourish"><svg viewBox="0 0 24 24" aria-hidden><path d="M5 12.5l4.5 4.5L19 7.5" /></svg></span>
      {text}
    </div>
  );
}
