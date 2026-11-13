// A character's words, set like a script: *actions* become stage directions (serif italic), **bold** stays bold.
// Works mid-stream: an action whose closing * hasn't arrived yet is already set as a direction.
import { Fragment, type ReactNode } from "react";

const TOKEN = /(\*\*[^*\n]+\*\*|\*[^*\n]+\*|\*[^*\n]+$)/g;

function inline(line: string, key: string): ReactNode[] {
  return line.split(TOKEN).filter(Boolean).map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**") && part.length > 4) return <strong key={`${key}-${i}`}>{part.slice(2, -2)}</strong>;
    if (part.startsWith("*") && part.length > 1) return <em key={`${key}-${i}`} className="stage">{part.replace(/^\*|\*$/g, "")}</em>;
    return <Fragment key={`${key}-${i}`}>{part}</Fragment>;
  });
}

export function Rich({ text }: { text: string }) {
  const paras = text.replace(/\r\n?/g, "\n").trim().split(/\n{2,}/);
  return (
    <>
      {paras.map((p, i) => (
        <p key={i}>
          {p.split("\n").map((line, j) => (
            <Fragment key={j}>{j > 0 && <br />}{inline(line, `${i}-${j}`)}</Fragment>
          ))}
        </p>
      ))}
    </>
  );
}
