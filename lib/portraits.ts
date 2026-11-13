// Every character's face, drawn in code: a flat, lit bust on a coloured ground with one detail of their world
// (Odile's dryer door, Brick's sunbeam and keyboard, Inès's lit window in the rain). The cast have their own looks;
// anyone else gets a look seeded from their name, so a new character always has a face of its own.
// Returns an SVG string built only from the fixed recipes below (never from what a person typed), so it is safe to inline.
// viewBox 0 0 160 160; the holder rounds and clips it.

type Hair = "updo" | "bob" | "bobHat" | "curly" | "short" | "undercut" | "swept" | "long" | "buzz" | "bun" | "wavy";
type Top = "lace" | "trench" | "flight" | "apron" | "blazer" | "turtle" | "cardigan" | "tee" | "collar" | "hoodie";
type Extra = "glasses" | "hoops" | "pearls" | "fedora" | "headset" | "pen" | "beard" | "freckles" | "scar";
type Motif = "dryer" | "sunbeam" | "rain" | "space" | "sun" | "notebook" | "chart" | "question" | "halo";

export interface Look {
  bg: string; motif: Motif; motif2?: string;
  skin: string; shade: string; blush?: string;
  hair: string; hairHi?: string; hairStyle: Hair;
  top: string; topShade: string; topStyle: Top;
  eyes?: "open" | "soft" | "lidded";
  brows?: "arch" | "flat" | "skeptic";
  mouth?: "smile" | "flat" | "smirk" | "grin";
  extras?: Extra[];
  ghost?: boolean;
  cat?: boolean;
}

const INK = "#1d1b17";

const CAST: Record<string, Look> = {
  odile: {
    bg: "#a6d1c3", motif: "dryer", ghost: true,
    skin: "#eef4f2", shade: "#cddcd8", blush: "#f0c9c6",
    hair: "#c3d1ce", hairHi: "#a8b9b5", hairStyle: "updo",
    top: "#dde8e4", topShade: "#f4f8f6", topStyle: "lace",
    eyes: "open", brows: "arch", mouth: "smile",
  },
  brick: {
    bg: "#9dbfdc", motif: "sunbeam", cat: true,
    skin: "#e58a3a", shade: "#c0642a", hair: "#e58a3a", hairStyle: "short",
    top: "#e58a3a", topShade: "#f6dcc4", topStyle: "tee",
  },
  "ines-calder": {
    bg: "#27313e", motif: "rain",
    skin: "#d6a07c", shade: "#b98261", blush: "#d77f68",
    hair: "#1f1b1a", hairStyle: "bobHat",
    top: "#b8915f", topShade: "#9c7646", topStyle: "trench",
    eyes: "lidded", brows: "flat", mouth: "smirk", extras: ["fedora"],
  },
  "juno-rask": {
    bg: "#183340", motif: "space",
    skin: "#8a5a3c", shade: "#6f462e", blush: "#a2553f",
    hair: "#6e2f1d", hairHi: "#8e4229", hairStyle: "undercut",
    top: "#66713f", topShade: "#525b31", topStyle: "flight",
    eyes: "open", brows: "flat", mouth: "smirk", extras: ["headset", "scar"],
  },
  marta: {
    bg: "#e38b5f", motif: "sun",
    skin: "#c68a62", shade: "#a86f4b", blush: "#d9674f",
    hair: "#2a1c16", hairHi: "#4a3226", hairStyle: "curly",
    top: "#2f5247", topShade: "#f1e7d3", topStyle: "apron",
    eyes: "open", brows: "arch", mouth: "grin", extras: ["hoops"],
  },
  rhea: {
    bg: "#e3a8a1", motif: "notebook",
    skin: "#f0c6a6", shade: "#d9a685", blush: "#e79a86",
    hair: "#1c1a1a", hairHi: "#36302e", hairStyle: "bob",
    top: "#26375a", topShade: "#1c2944", topStyle: "blazer",
    eyes: "open", brows: "arch", mouth: "flat", extras: ["glasses", "pen"],
  },
  "vera-holt": {
    bg: "#2f5a4e", motif: "chart",
    skin: "#e6b592", shade: "#c99674", blush: "#d98c74",
    hair: "#d7d9d6", hairHi: "#b5b9b4", hairStyle: "swept",
    top: "#20252a", topShade: "#2d3338", topStyle: "turtle",
    eyes: "lidded", brows: "skeptic", mouth: "smirk", extras: ["pearls"],
  },
  theo: {
    bg: "#d9a840", motif: "question",
    skin: "#a8714d", shade: "#8c5a3a", blush: "#b9603f",
    hair: "#3a2a20", hairHi: "#55402f", hairStyle: "short",
    top: "#a34f30", topShade: "#86401f", topStyle: "cardigan",
    eyes: "open", brows: "arch", mouth: "smile", extras: ["glasses", "beard"],
  },
};

// ---------- the seeded looks ----------
const GROUNDS: [string, string][] = [
  ["#a6d1c3", "#c3e2d7"], ["#9dbfdc", "#bcd5e9"], ["#e3a8a1", "#efc6c0"], ["#d9a840", "#e9c672"],
  ["#e38b5f", "#eeac89"], ["#9fbf98", "#bfd6b9"], ["#cbb894", "#ddcfb4"], ["#86aeb3", "#a9c8cc"],
];
const SKINS: [string, string, string][] = [
  ["#f1cdb0", "#dcae8e", "#e9a08a"], ["#e6b592", "#c99674", "#d98c74"], ["#c68a62", "#a86f4b", "#d06c52"],
  ["#a8714d", "#8c5a3a", "#b9603f"], ["#7c4f36", "#643d29", "#934634"], ["#f3d6c2", "#e0b79c", "#eda393"],
];
const HAIRS: [string, string][] = [
  ["#1d1a19", "#3a3330"], ["#3a2a20", "#55402f"], ["#6b3a22", "#8a4d2f"], ["#b86a2c", "#d08440"], ["#d9b26a", "#e8c98c"], ["#c9cbc8", "#e2e3e1"],
];
const TOPS: [string, string][] = [
  ["#26375a", "#1c2944"], ["#2f5247", "#244037"], ["#a34f30", "#86401f"], ["#e3d9c6", "#c9bda5"], ["#3a3f45", "#2a2e33"], ["#c98a2e", "#a9721f"],
];
const SEED_HAIR: Hair[] = ["short", "bob", "long", "curly", "bun", "buzz", "wavy", "swept", "undercut"];
const SEED_TOP: Top[] = ["tee", "collar", "hoodie", "blazer", "turtle", "cardigan"];

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
/** A small seeded random stream, so one name always gives one face. */
function rng(seed: number) {
  let a = seed || 1;
  return () => { a ^= a << 13; a >>>= 0; a ^= a >>> 17; a ^= a << 5; a >>>= 0; return a / 4294967296; };
}

// An honorific in the name nudges the hair and the earrings, so "Sir William" and "Lady Ada" read as they should.
const HE = /^(sir|mr|lord|king|prince|uncle|father|brother|grandpa|old man)\b/i;
const SHE = /^(lady|ms|mrs|miss|madame|madam|dame|queen|princess|aunt|mother|sister|grandma|old woman)\b/i;

function seeded(name: string): Look {
  const r = rng(hash(name.trim().toLowerCase()));
  const pick = <T,>(xs: readonly T[]) => xs[Math.floor(r() * xs.length)]!;
  const he = HE.test(name.trim()), she = SHE.test(name.trim());
  const [bg, halo] = pick(GROUNDS);
  const [skin, shade, blush] = pick(SKINS);
  const [hair, hairHi] = pick(HAIRS);
  let [top, topShade] = pick(TOPS);
  if (top === bg) [top, topShade] = TOPS[0]!;
  const hairStyle = pick(he ? (["short", "buzz", "undercut", "swept"] as Hair[]) : she ? (["bob", "long", "curly", "bun", "wavy"] as Hair[]) : SEED_HAIR);
  const extras: Extra[] = [];
  if (r() < 0.3) extras.push("glasses");
  const e = r();
  if (!he) { if (e < (she ? 0.35 : 0.16)) extras.push("hoops"); else if (e < (she ? 0.55 : 0.26)) extras.push("pearls"); }
  if (r() < 0.15) extras.push("freckles");
  if (he && (hairStyle === "short" || hairStyle === "buzz" || hairStyle === "undercut") && r() < 0.6) extras.push("beard");
  const eyes = r() < 0.72 ? "open" : r() < 0.6 ? "soft" : "lidded";
  return {
    bg, motif: "halo", motif2: halo, skin, shade, blush, hair, hairHi, hairStyle, top, topShade, topStyle: pick(SEED_TOP),
    eyes, brows: r() < 0.6 ? "arch" : "flat", mouth: pick(["smile", "smile", "grin", "smirk", "flat"] as const), extras,
  };
}

/** The cast's names, for copies: "Make a copy to edit" keeps the name, so the copy keeps the face. */
const CAST_NAMES: Record<string, string> = {
  odile: "odile", brick: "brick", "inès calder": "ines-calder", "captain juno rask": "juno-rask",
  marta: "marta", "rhea bancroft": "rhea", "vera holt": "vera-holt", theo: "theo",
};

/** The look for a character: the cast's own (by id, or a copy with the same name), else one seeded from the name. */
export function lookFor(c: { id?: string; name: string }): Look {
  if (c.id && CAST[c.id]) return CAST[c.id]!;
  const same = CAST_NAMES[c.name.trim().toLowerCase()];
  if (same) return CAST[same]!;
  return seeded(c.name || "?");
}

// ---------- drawing ----------
const el = (tag: string, a: Record<string, string | number>, inner = "") =>
  `<${tag} ${Object.entries(a).map(([k, v]) => `${k}="${v}"`).join(" ")}${inner ? `>${inner}</${tag}>` : "/>"}`;
const path = (d: string, fill: string, extra: Record<string, string | number> = {}) => el("path", { d, fill, ...extra });
const line = (d: string, stroke: string, w = 2, extra: Record<string, string | number> = {}) =>
  el("path", { d, fill: "none", stroke, "stroke-width": w, "stroke-linecap": "round", "stroke-linejoin": "round", ...extra });
const circle = (cx: number, cy: number, r: number, fill: string, extra: Record<string, string | number> = {}) => el("circle", { cx, cy, r, fill, ...extra });
const ellipse = (cx: number, cy: number, rx: number, ry: number, fill: string, extra: Record<string, string | number> = {}) => el("ellipse", { cx, cy, rx, ry, fill, ...extra });

function motifBack(L: Look): string {
  switch (L.motif) {
    case "dryer":
      return circle(80, 70, 60, "#bfe0d5", { stroke: "#86b6a6", "stroke-width": 7 }) + circle(80, 70, 48, "#cfe9e0")
        + line("M44 52 A40 40 0 0 1 70 32", "#ffffff", 4, { opacity: 0.6 })
        + [[22, 26, 6], [138, 26, 4.5], [142, 100, 7], [16, 104, 4]].map(([x, y, r]) => circle(x!, y!, r!, "none", { stroke: "#ffffff", "stroke-width": 1.6, opacity: 0.8 })).join("");
    case "sunbeam":
      return path("M96 0 H160 V18 L48 160 H-16 Z", "#f4dc96", { opacity: 0.5 }) + path("M128 0 H160 L70 160 H56 Z", "#f8e7b4", { opacity: 0.45 });
    case "rain":
      return el("rect", { x: 104, y: 14, width: 42, height: 54, rx: 3, fill: "#e9b65c" })
        + line("M125 14 V68 M104 41 H146", L.bg, 3)
        + Array.from({ length: 14 }, (_, i) => line(`M${-10 + i * 13} ${(i * 37) % 40 - 4} l-9 22`, "#a9bccf", 1.2, { opacity: 0.35 })).join("")
        + Array.from({ length: 10 }, (_, i) => line(`M${4 + i * 15} ${70 + (i * 29) % 50} l-8 20`, "#a9bccf", 1.2, { opacity: 0.25 })).join("");
    case "space":
      return [[18, 20, 1.2], [40, 44, 0.9], [26, 82, 1.1], [142, 92, 1], [150, 60, 0.8], [12, 124, 0.9], [60, 14, 0.8], [104, 18, 1]]
          .map(([x, y, r]) => circle(x!, y!, r!, "#ffffff", { opacity: 0.85 })).join("")
        + circle(126, 38, 15, "#e88a4a") + path("M111 38 A15 15 0 0 0 141 38 Z", "#c96a33", { opacity: 0.55 })
        + ellipse(126, 39, 25, 6, "none", { stroke: "#f2c58f", "stroke-width": 2, transform: "rotate(-14 126 39)" });
    case "sun":
      return circle(80, 64, 62, "#eba57f") + circle(80, 64, 44, "#efb48f");
    case "notebook":
      return Array.from({ length: 9 }, (_, i) => line(`M0 ${18 + i * 16} H160`, "#f0c4be", 1.4)).join("") + line("M24 0 V160", "#c9645b", 1.6, { opacity: 0.7 });
    case "chart":
      return line("M8 130 L34 112 L54 120 L82 84 L104 96 L132 52 L154 38", "#8fc1a7", 3, { opacity: 0.85 })
        + [[34, 112], [54, 120], [82, 84], [104, 96], [132, 52]].map(([x, y]) => circle(x!, y!, 3, "#8fc1a7")).join("")
        + line("M8 146 H152", "#4c7a6c", 1.2);
    case "question": {
      const q = (x: number, y: number, k: number, rot: number) => el("g", { transform: `translate(${x} ${y}) rotate(${rot}) scale(${k})` },
        line("M-14 -16 q0 -16 16 -16 q16 0 16 15 q0 10 -12 15 q-5 2.5 -5 9 v5", "#e8c46c", 9) + circle(1, 24, 5.4, "#e8c46c"));
      return q(126, 52, 1.5, 12) + q(22, 30, 0.6, -12);
    }
    case "halo":
      return circle(80, 72, 52, L.motif2 ?? "#ffffff", { opacity: 0.85 });
  }
}

function hairBack(L: Look): string {
  const h = L.hair;
  switch (L.hairStyle) {
    case "bob": return path("M48 74 C46 46 61 34 81 34 C101 34 114 46 112 74 L113 98 C113 102 111 104 107 104 L53 104 C49 104 47 102 47 98 Z", h);
    case "bobHat": return path("M50 66 L110 66 L112 96 C112 100 110 101 106 101 L54 101 C50 101 48 100 48 96 Z", h);
    case "curly":
      return [[54, 52, 17], [80, 37, 20], [106, 52, 17], [47, 75, 15], [113, 75, 15], [50, 97, 13], [110, 97, 13], [64, 40, 15], [96, 40, 15], [58, 110, 10], [102, 110, 10]]
        .map(([x, y, r]) => circle(x!, y!, r!, h)).join("")
        + [[48, 64, 5], [110, 58, 4.5], [56, 100, 4], [104, 92, 4], [78, 24, 5]].map(([x, y, r]) => circle(x!, y!, r!, L.hairHi ?? h, { opacity: 0.8 })).join("");
    case "swept": return path("M50 76 C47 46 61 33 81 33 C102 33 114 47 110 77 C109 85 105 90 104 90 L104 66 C100 56 92 52 80 52 C68 52 60 57 56 66 L56 90 C55 90 51 85 50 76 Z", h);
    case "long": return path("M48 72 C46 44 61 33 80 33 C99 33 114 44 112 72 L116 132 L44 132 Z", h);
    case "wavy": return path("M47 70 C45 44 61 32 80 32 C99 32 115 44 113 70 C116 84 110 96 113 108 C105 113 98 106 100 98 L60 98 C62 106 55 113 47 108 C50 96 44 84 47 70 Z", h);
    case "bun": return circle(80, 31, 12, h);
    default: return "";
  }
}

function hairFront(L: Look): string {
  const h = L.hair, hi = L.hairHi ?? L.hair;
  switch (L.hairStyle) {
    case "updo":
      return path("M53 72 C49 44 63 31 80 31 C97 31 111 44 107 72 C104 58 98 50 90 49 C86 52 74 52 70 49 C62 50 56 58 53 72 Z", h)
        + ellipse(80, 39, 27, 13, h) + circle(80, 24, 10.5, h)
        + line("M64 38 q16 -8 32 0", hi, 1.6) + line("M74 22 q6 -4 12 0", hi, 1.4);
    case "bob": return path("M53 70 C51 47 64 36 82 36 C100 36 109 47 107 66 C99 54 89 49 77 50 C67 51 58 58 53 70 Z", h) + line("M70 42 q12 -5 26 1", hi, 1.6);
    case "curly": return [[63, 50, 9.5], [74, 44.5, 10], [86, 44.5, 10], [97, 50, 9]].map(([x, y, r]) => circle(x!, y!, r!, h)).join("") + circle(80, 40, 3.5, hi, { opacity: 0.8 });
    case "short": return path("M54 66 C51 44 64 34 81 34 C99 34 111 45 106 66 C104 57 99 51 93 50 L89 45 L83 50 L76 45 L70 51 C62 52 57 58 54 66 Z", h);
    case "undercut": return path("M56 61 C54 41 69 32 85 33 C102 34 111 46 106 63 C101 52 90 47 76 50 C67 52 60 56 56 61 Z", h) + line("M66 40 q14 -6 30 2", hi, 1.8);
    case "swept": return path("M54 64 C53 45 65 36 81 36 C98 36 109 46 106 63 C101 55 92 50 80 50 C68 50 59 55 54 64 Z", h) + line("M61 47 q15 -9 34 -2", hi, 1.8) + line("M66 41 q12 -5 26 0", hi, 1.4);
    case "long": return path("M54 68 C53 46 64 36 80 36 C96 36 107 46 106 68 C102 54 92 46 80 46 C68 46 58 54 54 68 Z", h) + line("M80 37 V46", hi, 1.4);
    case "wavy": return path("M54 66 C52 45 65 35 82 35 C99 35 109 46 106 64 C100 53 92 48 82 49 C74 50 70 54 64 54 C59 56 56 60 54 66 Z", h);
    case "buzz": return path("M55 60 C55 44 66 38 80 38 C94 38 105 44 105 60 C100 51 92 48 80 48 C68 48 60 51 55 60 Z", h, { opacity: 0.92 });
    case "bun": return path("M54 66 C53 46 64 37 80 37 C96 37 107 46 106 66 C102 53 92 47 80 47 C68 47 58 53 54 66 Z", h);
    default: return "";
  }
}

function topBack(L: Look): string {
  const t = L.top, s = L.topShade;
  const body = L.ghost
    ? path("M26 150 C26 132 46 121 80 121 C114 121 134 132 134 150 q-9 9 -18 0 q-9 9 -18 0 q-9 9 -18 0 q-9 9 -18 0 q-9 9 -18 0 q-9 9 -18 0 Z", t)
    : path("M20 162 C22 135 43 121 80 121 C117 121 138 135 140 162 Z", t);
  switch (L.topStyle) {
    case "lace": return circle(40, 136, 19, t) + circle(120, 136, 19, t) + body;
    case "hoodie": return body + path("M56 124 C56 104 104 104 104 124 C98 116 62 116 56 124 Z", s);
    default: return body;
  }
}

function topFront(L: Look): string {
  const t = L.top, s = L.topShade;
  switch (L.topStyle) {
    case "lace":
      return path("M68 86 H92 V116 C92 121 68 121 68 116 Z", s) + [69, 73, 77, 81, 85, 89].map((x) => circle(x + 2, 87, 2.4, s)).join("")
        + line("M70 96 H90 M70 104 H90", L.hairHi ?? "#c8d6d2", 1, { opacity: 0.7 })
        + ellipse(80, 129, 4.6, 5.6, "#e8d6a6", { stroke: "#b89b5c", "stroke-width": 1.4 });
    case "trench":
      return path("M68 121 L80 144 L92 121 Z", "#2b2a2c") + path("M71 104 L50 124 L61 140 L78 120 Z", s) + path("M89 104 L110 124 L99 140 L82 120 Z", s);
    case "flight":
      return line("M80 128 V162", s, 2.4) + path("M67 112 C56 115 47 123 45 133 L64 136 L77 121 Z", "#e8dcc4") + path("M93 112 C104 115 113 123 115 133 L96 136 L83 121 Z", "#e8dcc4")
        + circle(118, 142, 6, "#e88a4a") + circle(118, 142, 2.6, "#f6d7b4");
    case "apron":
      return path("M70 121 C72 133 88 133 90 121 Z", L.shade) + path("M58 124 L66 124 L70 162 L60 162 Z", s) + path("M102 124 L94 124 L90 162 L100 162 Z", s);
    case "blazer":
      return path("M69 121 L80 146 L91 121 Z", "#f4f1ea") + path("M69 121 L80 146 L73 151 L59 126 Z", s) + path("M91 121 L80 146 L87 151 L101 126 Z", s);
    case "turtle":
      return path("M66 92 C66 89 94 89 94 92 V117 C94 123 66 123 66 117 Z", s) + line("M68 101 q12 2.4 24 0", "#15181b", 1.2, { opacity: 0.55 });
    case "cardigan":
      return path("M70 121 L80 141 L90 121 Z", "#cfe0ec") + path("M70 118 L80 129 L73 135 L64 122 Z", "#f4f1ea") + path("M90 118 L80 129 L87 135 L96 122 Z", "#f4f1ea")
        + line("M70 121 L80 141 L90 121", s, 2.2) + circle(80, 149, 1.9, s) + circle(80, 157, 1.9, s);
    case "tee": return path("M70 121 C72 128 88 128 90 121 Z", L.shade);
    case "collar": return path("M70 121 L80 132 L90 121 Z", L.shade) + path("M70 118 L80 130 L72 136 L63 123 Z", "#f4f1ea") + path("M90 118 L80 130 L88 136 L97 123 Z", "#f4f1ea");
    case "hoodie": return path("M70 121 C72 128 88 128 90 121 Z", L.shade) + line("M73 128 V142 M87 128 V142", "#f4f1ea", 1.6);
    default: return "";
  }
}

function face(L: Look): string {
  let s = "";
  if (L.blush) s += circle(64.5, 81, 4.4, L.blush, { opacity: L.ghost ? 0.5 : 0.35 }) + circle(95.5, 81, 4.4, L.blush, { opacity: L.ghost ? 0.5 : 0.35 });
  if (L.extras?.includes("freckles")) s += [[63, 79], [66, 82], [61, 83], [97, 79], [94, 82], [99, 83]].map(([x, y]) => circle(x!, y!, 0.9, L.shade)).join("");
  // eyes
  const eye = (x: number) => {
    if (L.eyes === "soft") return line(`M${x - 3.2} 73 q3.2 -3.4 6.4 0`, INK, 2);
    if (L.eyes === "lidded") return path(`M${x - 2.6} 72 a2.6 2.6 0 0 0 5.2 0 Z`, INK) + line(`M${x - 3.6} 71.6 H${x + 3.6}`, INK, 1.8);
    return ellipse(x, 72, 2.4, 3.1, INK) + circle(x + 0.8, 70.9, 0.8, "#ffffff", { opacity: 0.85 });
  };
  s += eye(70.5) + eye(89.5);
  const bc = L.ghost ? "#9fb2ad" : INK;
  if (L.brows === "skeptic") s += line("M66 65.5 q4.5 -1 9 0", bc, 2.2) + line("M85 61.6 q4.5 -3.6 9 -0.6", bc, 2.2);
  else if (L.brows === "flat") s += line("M66.2 64.8 h8.6", bc, 2.2) + line("M85.2 64.8 h8.6", bc, 2.2);
  else s += line("M66.2 65 q4.2 -3 8.6 -0.6", bc, 2) + line("M85.2 64.4 q4.4 -2.4 8.6 0.6", bc, 2);
  s += line("M80.6 75 q-3.4 6.6 0.8 8.6", L.shade, 2);
  if (L.extras?.includes("scar")) s += line("M92 58.5 l2.4 9", L.shade, 1.4);
  if (L.extras?.includes("beard")) s += path("M57 77 C58 98 68 107 80 107 C92 107 102 98 103 77 C99 90 92 94 80 94 C68 94 61 90 57 77 Z", L.hair) + path("M71 84.5 q9 -4.5 18 0 q-9 3.2 -18 0 Z", L.hair);
  switch (L.mouth) {
    case "flat": s += line("M74.5 88.5 q5.5 1 11 0", INK, 2); break;
    case "smirk": s += line("M74 88.6 q6.5 2.6 13 -1.8", INK, 2); break;
    case "grin": s += path("M72 85.5 q8 9.5 16 0 Z", INK) + path("M73.6 86.2 q6.4 2.6 12.8 0 v1.3 q-6.4 2.4 -12.8 0 Z", "#ffffff"); break;
    default: s += line("M73 87 q7 5.6 14 0", INK, 2);
  }
  return s;
}

function extrasFront(L: Look): string {
  let s = "";
  const x = L.extras ?? [];
  if (x.includes("glasses")) s += el("g", { fill: "none", stroke: INK, "stroke-width": 1.7 },
    circle(70.5, 72, 6.6, "#ffffff", { "fill-opacity": 0.14 }) + circle(89.5, 72, 6.6, "#ffffff", { "fill-opacity": 0.14 }) + `<path d="M77.1 71.6 q2.9 -2 5.8 0"/><path d="M63.9 71 l-8.4 -1.6"/><path d="M96.1 71 l8.4 -1.6"/>`);
  if (x.includes("hoops")) s += circle(55, 87, 4.4, "none", { stroke: "#e2b04a", "stroke-width": 2 }) + circle(105, 87, 4.4, "none", { stroke: "#e2b04a", "stroke-width": 2 });
  if (x.includes("pearls")) s += circle(55.6, 82, 2.4, "#f6f1e7") + circle(104.4, 82, 2.4, "#f6f1e7");
  if (x.includes("pen")) s += line("M104 50 L113 78", "#e0b43a", 3.4) + line("M113 78 l1 3", INK, 2);
  if (x.includes("fedora")) s += el("g", { transform: "rotate(-7 80 44)" },
    path("M57 45 C57 28 66 19 80 19 C94 19 103 28 103 45 Z", "#2c2e33") + path("M57.4 38 H102.6 V45 H57.4 Z", "#7a2b26")
    + ellipse(80, 46, 39, 7.5, "#2c2e33") + line("M73 21 q7 7 14 0", "#1d1e22", 1.8));
  if (x.includes("headset")) s += line("M51 68 C49 32 111 32 109 68", "#2b2f33", 4.6)
    + el("rect", { x: 45, y: 62, width: 11, height: 17, rx: 4.5, fill: "#2b2f33" }) + el("rect", { x: 104, y: 62, width: 11, height: 17, rx: 4.5, fill: "#2b2f33" })
    + line("M50.5 77 C51 89 59 94 70 93", "#2b2f33", 2.6) + circle(71, 93, 2.8, "#e88a4a");
  return s;
}

function cat(L: Look): string {
  const o = L.skin, d = L.shade, cream = L.topShade;
  return path("M18 162 C20 128 45 112 80 112 C115 112 140 128 142 162 Z", o) + ellipse(80, 152, 22, 26, cream)
    + path("M47 66 L49 26 L74 50 Z", o) + path("M113 66 L111 26 L86 50 Z", o)
    + path("M52 58 L53 35 L67 50 Z", "#f2b8a0") + path("M108 58 L107 35 L93 50 Z", "#f2b8a0")
    + ellipse(80, 78, 37, 31, o)
    + line("M80 52 v9 M72 54 l2 8 M88 54 l-2 8", d, 3)
    + ellipse(80, 91, 14, 9.5, cream)
    // the unimpressed eyes: yellow-green, slit pupils, lids half down
    + ellipse(65, 75, 7.6, 5.6, "#d8d46a") + ellipse(95, 75, 7.6, 5.6, "#d8d46a")
    + ellipse(65, 76, 1.7, 4.2, INK) + ellipse(95, 76, 1.7, 4.2, INK)
    + path("M56 75 H74 V67 H56 Z", o) + path("M86 75 H104 V67 H86 Z", o)
    + line("M57.4 74.6 H72.6", d, 2) + line("M87.4 74.6 H102.6", d, 2)
    + path("M76.4 85 H83.6 L80 89.2 Z", "#d9776a") + line("M80 89 v2.6 M80 91.6 q-4 4 -7.4 0.8 M80 91.6 q4 4 7.4 0.8", INK, 1.6)
    + line("M66 91 l-22 -4 M66 94 l-21 2 M94 91 l22 -4 M94 94 l21 2", "#fbf3ea", 1.2, { opacity: 0.9 })
    // the keyboard he is sitting on
    + el("rect", { x: 6, y: 140, width: 148, height: 30, rx: 6, fill: "#3a3f46" })
    + Array.from({ length: 2 }, (_, r) => Array.from({ length: 11 }, (_, i) => el("rect", { x: 12 + i * 13, y: 145 + r * 9, width: 10, height: 6.5, rx: 1.6, fill: "#575e67" })).join("")).join("")
    + ellipse(63, 146, 10, 6.5, o) + ellipse(97, 146, 10, 6.5, o) + line("M60 148 v-3 M66 148 v-3 M94 148 v-3 M100 148 v-3", d, 1.2);
}

/** The whole portrait as an SVG string (viewBox 0 0 160 160). `blank` draws the empty silhouette of a character with no name yet. */
export function portraitSVG(L: Look | "blank"): string {
  const open = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" aria-hidden="true" focusable="false" style="display:block;width:100%;height:100%">`;
  if (L === "blank") {
    return `${open}${el("rect", { width: 160, height: 160, fill: "#1b2130" })}${circle(80, 70, 27, "#2a3244")}${path("M22 162 C24 135 44 121 80 121 C116 121 136 135 138 162 Z", "#2a3244")}</svg>`;
  }
  const bg = el("rect", { width: 160, height: 160, fill: L.bg }) + motifBack(L);
  if (L.cat) return `${open}${bg}${cat(L)}</svg>`;
  const hidesEars = ["bob", "bobHat", "curly", "long", "wavy", "swept"].includes(L.hairStyle);
  const figure = hairBack(L) + topBack(L)
    + path("M70 86 H90 V123 H70 Z", L.shade)
    + topFront(L)
    + (hidesEars ? "" : ellipse(55.5, 73, 4.2, 6.6, L.skin) + ellipse(104.5, 73, 4.2, 6.6, L.skin))
    + ellipse(80, 70, 25, 30, L.skin)
    + face(L) + hairFront(L) + extrasFront(L);
  return `${open}${bg}${L.ghost ? el("g", { opacity: 0.94 }, figure) : figure}</svg>`;
}

const cache = new Map<string, string>();
export function portraitFor(c: { id?: string; name: string }): string {
  const key = `${c.id ?? ""}|${c.name}`;
  let svg = cache.get(key);
  if (!svg) {
    svg = portraitSVG(c.name.trim() ? lookFor(c) : "blank");
    if (cache.size > 400) cache.clear();
    cache.set(key, svg);
  }
  return svg;
}

/** The ground colour of a character's portrait, for a ring or a tint beside it. */
export const groundFor = (c: { id?: string; name: string }) => lookFor(c).bg;
