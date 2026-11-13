// Dramatis's ground: a dark stage with one warm light from above (DESIGN.md). One plain-CSS layer on purpose: no WebGL
// to fail, nothing moving, the same in every browser and under reduced motion. The headline side stays dark.
export function Backdrop() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10"
      style={{
        background: [
          "linear-gradient(to bottom, transparent 70%, var(--bg))",
          "radial-gradient(38% 30% at 70% 92%, rgb(160 134 114 / .10), transparent 70%)",
          "radial-gradient(60% 75% at 74% -8%, rgb(196 160 128 / .26), rgb(160 134 114 / .08) 45%, transparent 72%)",
          "var(--bg)",
        ].join(", "),
      }}
    />
  );
}
