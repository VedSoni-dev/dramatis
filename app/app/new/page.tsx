"use client";
// Make a character: write it yourself, or describe it in one line and watch Dramatis fill in the form as the answer
// streams. Also opens shared links (#c=…), edits (?edit=id) and copies of the cast (?copy=id).
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useEffect, useRef, useState } from "react";
import { AppHeader, Wordmark } from "@/components/AppHeader";
import { Portrait } from "@/components/Portrait";
import { useAI } from "@/kit/react/studio";
import { shake } from "@/kit/ui/motion";
import { readShared } from "@/lib/share";
import { findCharacter, saveCharacter, uid, useStore } from "@/lib/store";
import { LIMITS, type CharacterSpec } from "@/lib/types";

type Field = keyof CharacterSpec;
const FIELDS: Field[] = ["name", "tagline", "greeting", "persona"];
const EMPTY: CharacterSpec = { name: "", tagline: "", greeting: "", persona: "" };

/** The value of one string field from JSON that is still arriving. */
function partial(text: string, key: Field): string | undefined {
  const m = text.match(new RegExp(`"${key}"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)`));
  if (!m) return undefined;
  let v = m[1]!;
  const tail = v.match(/\\+$/)?.[0].length ?? 0;
  if (tail % 2) v = v.slice(0, -1); // an escape cut in half mid-stream
  try { return JSON.parse(`"${v}"`) as string; }
  catch { return v.replace(/\\n/g, "\n").replace(/\\"/g, '"').replace(/\\u[0-9a-fA-F]{0,3}$/, ""); }
}

export default function NewPage() {
  return <Suspense fallback={<div className="min-h-dvh" />}><NewCharacter /></Suspense>;
}

function NewCharacter() {
  const s = useStore();
  const router = useRouter();
  const params = useSearchParams();
  const editId = params.get("edit");
  const copyId = params.get("copy");
  const ai = useAI("/api/draft");

  const [spec, setSpec] = useState<CharacterSpec>(EMPTY);
  const [avatar, setAvatar] = useState<string | undefined>();
  const [idea, setIdea] = useState("");
  const [filling, setFilling] = useState<Field | null>(null);
  const [errors, setErrors] = useState<Partial<Record<Field | "avatar" | "save" | "draft", string>>>({});
  const [source, setSource] = useState<"new" | "edit" | "copy" | "shared">("new");
  const started = useRef(false);
  const formRef = useRef<HTMLFormElement>(null);

  // Prefill once the browser's store has loaded.
  useEffect(() => {
    if (!s || started.current) return;
    started.current = true;
    const base = editId ? findCharacter(s, editId) : copyId ? findCharacter(s, copyId) : undefined;
    if (base) {
      setSpec({ name: base.name, tagline: base.tagline, greeting: base.greeting, persona: base.persona });
      setAvatar(base.avatar);
      setSource(editId && !base.builtIn ? "edit" : "copy");
      return;
    }
    const shared = readShared(window.location.hash);
    if (shared) { setSpec(shared); setSource("shared"); return; }
    if (params.get("draft")) {
      let t = "";
      try { t = sessionStorage.getItem("dramatis.idea") ?? ""; sessionStorage.removeItem("dramatis.idea"); } catch { /* private mode */ }
      if (t) { setIdea(t); void draft(t); }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [s]);

  async function draft(text = idea) {
    const t = text.replace(/\s+/g, " ").trim();
    if (t.length < 3) { setErrors({ draft: "Describe them in a few words first, like “a pirate who is afraid of water”." }); return; }
    setErrors({});
    setSpec(EMPTY);
    let got: CharacterSpec = EMPTY;
    const full = await ai.run({ idea: t }, (_chunk, all) => {
      const next = { ...EMPTY };
      let last: Field | null = null;
      for (const f of FIELDS) { const v = partial(all, f); if (v !== undefined) { next[f] = v; last = f; } }
      got = next;
      setSpec(next);
      setFilling(last);
    });
    setFilling(null);
    if (!full) return; // the error (or the mode picker) is already showing
    const start = full.indexOf("{"), end = full.lastIndexOf("}");
    try {
      const o = JSON.parse(full.slice(start, end + 1)) as Partial<CharacterSpec>;
      setSpec({ name: String(o.name ?? ""), tagline: String(o.tagline ?? ""), greeting: String(o.greeting ?? ""), persona: String(o.persona ?? "") });
    } catch {
      if (!got.name) setErrors({ draft: "That didn't come back as a character. Try again, or fill in the form yourself." });
    }
  }

  async function pickImage(file: File | undefined) {
    if (!file) return;
    setErrors((e) => ({ ...e, avatar: undefined }));
    try {
      const bmp = await createImageBitmap(file);
      const size = 256, side = Math.min(bmp.width, bmp.height);
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = size;
      canvas.getContext("2d")!.drawImage(bmp, (bmp.width - side) / 2, (bmp.height - side) / 2, side, side, 0, 0, size, size);
      setAvatar(canvas.toDataURL("image/jpeg", 0.85));
    } catch {
      setErrors((e) => ({ ...e, avatar: "That picture didn't open. Try a JPG or PNG." }));
    }
  }

  function save() {
    const clean = { ...spec, name: spec.name.replace(/\s+/g, " ").trim(), tagline: spec.tagline.replace(/\s+/g, " ").trim(), greeting: spec.greeting.trim(), persona: spec.persona.trim() };
    if (!clean.name) { setErrors({ name: "Give them a name." }); if (formRef.current) shake(formRef.current); return; }
    const id = source === "edit" && editId ? editId : `${clean.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 24) || "character"}-${uid().slice(0, 6)}`;
    const old = source === "edit" && s && editId ? findCharacter(s, editId) : undefined;
    const ok = saveCharacter({ id, ...clean, greeting: clean.greeting || `Hello. I'm ${clean.name}.`, avatar, createdAt: old?.createdAt });
    if (!ok) { setErrors({ save: "This browser is out of room for saved characters. Remove a picture or an old character and try again." }); return; }
    try { sessionStorage.setItem("dramatis.toast", `${clean.name} is ready`); } catch { /* fine */ }
    router.push(`/app/chat/${encodeURIComponent(id)}`);
  }

  const set = (f: Field) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => { setSpec({ ...spec, [f]: e.target.value }); setErrors({ ...errors, [f]: undefined }); };
  const title = source === "edit" ? `Edit ${spec.name || "character"}` : source === "shared" ? "Someone shared a character" : source === "copy" ? "Make it your own" : "New character";

  return (
    <div className="min-h-dvh">
      <AppHeader left={<Wordmark />} />
      <main className="mx-auto w-full max-w-3xl px-4 pb-28 pt-8 sm:px-8 sm:pt-12">
        <h1 className="text-4xl leading-[1.05] sm:text-5xl">{title}</h1>
        {source === "shared" && <p className="mt-3 text-muted">Check them over, then save to add them to your cast in this browser.</p>}

        {(source === "new") && (
          <section className="mt-8 rounded-[var(--radius)] border border-line bg-card p-4 sm:p-5">
            <form className="flex flex-col gap-2 sm:flex-row" onSubmit={(e) => { e.preventDefault(); void draft(); }}>
              <label className="sr-only" htmlFor="idea">Describe them in one line</label>
              <input id="idea" className="fd-input flex-1" value={idea} onChange={(e) => setIdea(e.target.value)} placeholder="Describe them in one line" maxLength={500} autoComplete="off" />
              {ai.busy
                ? <button type="button" className="sk-btn sk-btn-quiet" onClick={ai.stop}>Stop</button>
                : <button type="submit" className="sk-btn">Write it for me</button>}
            </form>
            {ai.busy && !spec.name && <p className="mt-3 flex items-center gap-2 text-sm text-muted"><span className="typing" aria-hidden><i /><i /><i /></span>Writing your character…</p>}
            {errors.draft && <p className="sk-error mt-3" role="alert">{errors.draft}</p>}
            {ai.error && <p className="sk-error mt-3" role="alert">{ai.error.message}{ai.error.action && <> <a href={ai.error.action.url} target="_blank" rel="noopener noreferrer">{ai.error.action.label} ↗</a></>}</p>}
          </section>
        )}

        <form ref={formRef} className="mt-8 grid gap-6" onSubmit={(e) => { e.preventDefault(); save(); }}>
          <div className="flex items-center gap-4">
            <Portrait c={{ name: spec.name || "?", avatar }} size={76} live={ai.busy} />
            <div className="flex flex-wrap items-center gap-2">
              <label className="sk-btn sk-btn-quiet cursor-pointer focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent">
                {avatar ? "Change picture" : "Add a picture"}
                <input type="file" accept="image/*" className="sr-only" onChange={(e) => void pickImage(e.target.files?.[0])} />
              </label>
              {avatar && <button type="button" className="sk-btn sk-btn-quiet" onClick={() => setAvatar(undefined)}>Remove</button>}
            </div>
          </div>
          {errors.avatar && <p className="sk-error" role="alert">{errors.avatar}</p>}

          <label className="fd">
            <span>Name</span>
            <input className={`fd-input ${filling === "name" ? "is-filling" : ""}`} value={spec.name} onChange={set("name")} maxLength={LIMITS.name} placeholder="Captain Juno Rask" aria-invalid={!!errors.name} />
            {errors.name && <em className="sk-error not-italic" role="alert">{errors.name}</em>}
          </label>
          <label className="fd">
            <span>Who they are, in one line</span>
            <input className={`fd-input ${filling === "tagline" ? "is-filling" : ""}`} value={spec.tagline} onChange={set("tagline")} maxLength={LIMITS.tagline} placeholder="Captain of a battered cargo ship" />
          </label>
          <label className="fd">
            <span>Their first message</span>
            <textarea rows={3} className={`fd-input ${filling === "greeting" ? "is-filling" : ""}`} value={spec.greeting} onChange={set("greeting")} maxLength={LIMITS.greeting} placeholder="*The airlock hisses shut.* So you're the replacement." />
            <span className="fd-hint">Put actions between asterisks, like *waves*.</span>
          </label>
          <label className="fd">
            <span>How they think and talk</span>
            <textarea rows={8} className={`fd-input ${filling === "persona" ? "is-filling" : ""}`} value={spec.persona} onChange={set("persona")} maxLength={LIMITS.persona} placeholder="You are… what they want, how they talk, what they'd never do." />
          </label>

          {errors.save && <p className="sk-error" role="alert">{errors.save}</p>}
          <div className="scrim-b sticky bottom-0 -mx-4 flex flex-wrap items-center justify-end gap-2 px-4 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-6 sm:-mx-8 sm:px-8">
            <Link href="/app" className="sk-btn sk-btn-quiet">Cancel</Link>
            <button type="submit" className="sk-btn" disabled={ai.busy}>{source === "edit" ? "Save changes" : "Save and start chatting"}</button>
          </div>
        </form>
      </main>
    </div>
  );
}
