// ─────────────────────────────────────────────────────────────────────────
// KIT · flowline — a narration line as a BARE PRIMITIVE (no block chrome, no
// fade window of its own), so a bespoke block can place VO-verbatim type
// anywhere in its own layout. Added on the Compass/tovecimig long-form,
// 2026-09-26 (horizontal).
//
// Each word SNAPS in on its spoken frame (~130ms, 07-11 cadence rule), resolved
// through cueSeq's word-index cursor. `emphasize` = a contiguous phrase inside
// `line`: those words take `empColor`/700 while the rest sits at `restColor`/
// `restWeight` (the p1-cta device), and optionally carry an UNDERLINE that draws
// under each word as it is voiced (`underline`). Unresolved tokens fall back to
// an even stagger across the window, so a paraphrase shows up in the cue audit
// rather than as a blank.
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { interpolate, Easing } from "remotion";
import { CLAMP, clamp01, cueSeq, DISPLAY, TRACK, useMs } from "./core";

const nz = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

export const FlowLine: React.FC<{
  from: number;
  to: number;
  line: string;
  size: number;
  color: string;
  weight?: number;
  restColor?: string;
  restWeight?: number;
  emphasize?: string;
  empColor?: string;
  underline?: string;
  lineHeight?: number;
  align?: "left" | "center" | "right";
  style?: React.CSSProperties;
  /** overrides for individual token onsets (index -> ms) */
  pins?: Record<number, number>;
}> = ({ from, to, line, size, color, weight = 700, restColor, restWeight, emphasize, empColor, underline, lineHeight = 1.08, align = "left", style, pins }) => {
  const ms = useMs();
  const toks = line.split(/\s+/).filter(Boolean);
  const on = cueSeq(toks, from, to);
  const span = Math.max(600, to - from - 800);
  const at = on.map((m, i) => pins?.[i] ?? m ?? from + 150 + (span * i) / Math.max(1, toks.length - 1));

  let e0 = -1;
  let e1 = -1;
  if (emphasize) {
    const ph = emphasize.split(/\s+/).map(nz).filter(Boolean);
    const tn = toks.map(nz);
    for (let i = 0; i + ph.length <= tn.length; i++) {
      if (ph.every((p, k) => tn[i + k] === p)) { e0 = i; e1 = i + ph.length - 1; break; }
    }
  }
  return (
    <div style={{ fontFamily: DISPLAY, fontSize: size, lineHeight, letterSpacing: TRACK.headline, textAlign: align, ...style }}>
      {toks.map((t, i) => {
        const p = clamp01(interpolate(ms, [at[i], at[i] + 130], [0, 1], CLAMP));
        const emp = i >= e0 && i <= e1 && e0 >= 0;
        const ul = emp && underline ? Easing.out(Easing.cubic)(clamp01(interpolate(ms, [at[i], at[i] + 260], [0, 1], CLAMP))) : 0;
        return (
          <span key={i} style={{ display: "inline-block", position: "relative", marginRight: "0.26em", opacity: p, transform: `translateY(${(1 - p) * 14}px)`,
            color: emp ? empColor ?? color : restColor ?? color, fontWeight: emp ? 700 : restWeight ?? weight }}>
            {t}
            {ul > 0 ? (
              <span style={{ position: "absolute", left: 0, right: i < e1 ? "-0.26em" : 0, bottom: "-0.02em", height: "0.1em", background: underline, transformOrigin: "left", transform: `scaleX(${ul})` }} />
            ) : null}
          </span>
        );
      })}
    </div>
  );
};
