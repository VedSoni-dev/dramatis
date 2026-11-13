// The script-style lines every chat shares: a character's line (portrait, name, words with stage directions, typing
// dots before the first word) and the person's line (a quiet bubble on the right).
import type React from "react";
import { Portrait } from "@/components/Portrait";
import { Rich } from "@/components/Rich";
import type { Character } from "@/lib/types";

export function CharLine({ c, text, live = false, className = "", innerRef, children }: { c: Character; text: string; live?: boolean; className?: string; innerRef?: React.Ref<HTMLDivElement>; children?: React.ReactNode }) {
  return (
    <div className={`flex gap-3 ${className}`}>
      <Portrait c={c} size={34} live={live} className="mt-0.5" />
      <div className="min-w-0 flex-1">
        <p className="mb-1 font-mono text-[.72rem] text-muted">{c.name}</p>
        <div ref={innerRef} className="line-text text-[.98rem] leading-[1.65] text-fg/95">
          {text ? <Rich text={text} /> : <span className="typing" role="status" aria-label={`${c.name} is typing`}><i /><i /><i /></span>}
        </div>
        {children}
      </div>
    </div>
  );
}

export function UserLine({ text }: { text: string }) {
  return (
    <div className="sk-rise flex justify-end">
      <div className="line-text max-w-[85%] whitespace-pre-wrap rounded-[18px] rounded-br-md bg-bg-2 px-4 py-2.5 text-[.98rem] leading-[1.6]">{text}</div>
    </div>
  );
}
