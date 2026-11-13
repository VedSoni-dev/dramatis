"use client";
// The app's header: name (or the character) on the left, the AI mode pill on the right (Jakob's law).
import Link from "next/link";
import type { ReactNode } from "react";
import { ModeButton } from "@/kit/react/ModePanel";

export function Wordmark() {
  return (
    <Link href="/app" className="flex min-h-11 items-center gap-2 rounded-full pr-2 font-display text-[1.05rem] font-medium tracking-[-0.02em]">
      <svg width="22" height="22" viewBox="0 0 24 24" aria-hidden className="text-accent"><path fill="currentColor" d="M12 2.5c1.2 3.9 3.2 6 7 7-3.8 1-5.8 3.1-7 7-1.2-3.9-3.2-6-7-7 3.8-1 5.8-3.1 7-7Z" opacity=".95" /><circle cx="18.5" cy="18.5" r="2" fill="currentColor" opacity=".6" /></svg>
      Dramatis
    </Link>
  );
}

export function AppHeader({ left, right }: { left?: ReactNode; right?: ReactNode }) {
  return (
    <header className="sticky top-0 z-20 border-b border-line bg-bg/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-8">
        <div className="flex min-w-0 items-center gap-2">{left ?? <Wordmark />}</div>
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
