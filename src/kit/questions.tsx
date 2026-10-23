// ─────────────────────────────────────────────────────────────────────────
// KIT · questions — OpenQuestions. Added on the BioIntel Pathos AI long-form
// (2026-08-06).
//
// For a beat that lists what is STILL UNRESOLVED. Each item lands on its spoken
// words and is followed by a dashed rule that runs to the frame edge and never
// resolves into anything — the answer is visibly missing, and stays missing for
// as long as the beat holds. A bullet list would assert "here are three things";
// this asserts "here are three things nobody knows yet", which is the point.
//
// ⚠️ Deliberately NOT a fan (ScopeFan, §3 of the same piece) and NOT a boxed
// slot (AbsentFigure, also §3). It shares AbsentFigure's *motif* — a graphic
// that refuses to resolve — at a different scale and in a different shape, so it
// reinforces rather than repeats. Three inline tails, not one large empty box.
//
// Landscape-first (the dashed tails want horizontal runway), bg-aware,
// monochrome. Life comes from a slow opacity breathe and a marching dash —
// never translate-jitter, which reads as a bug.
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import {
  CLAMP, clamp01, caps, COLORS, cue, DISPLAY, INK_SUB, TRACK, useMs, usePop,
} from "./core";
import { FORMAT, TYPE } from "../style";

const V = FORMAT.key === "vertical";

type Win = { from: number; to: number };

const useVis = (from: number, to: number, padIn = 360, padOut = 360) => {
  const ms = useMs();
  return clamp01(interpolate(ms, [from, from + padIn, to - padOut, to], [0, 1, 1, 0], CLAMP));
};

const QuestionRow: React.FC<{
  index: number;
  label: string;
  onsetMs: number;
  fg: string;
  sub: string;
  size: number;
}> = ({ index, label, onsetMs, fg, sub, size }) => {
  const ms = useMs();
  const pop = usePop(onsetMs, { rise: 18 });
  // the tail draws out after the words land, then keeps breathing — the answer
  // that never arrives has to stay ALIVE or the held frame goes dead
  const drawn = clamp01(interpolate(ms, [onsetMs + 180, onsetMs + 900], [0, 1], CLAMP));
  const breathe = 0.3 + 0.16 * (0.5 + 0.5 * Math.sin((ms - onsetMs) / 700));
  const march = (ms / 34) % 28;
  return (
    <div style={{ ...pop, display: "flex", alignItems: "center", gap: V ? 18 : 26 }}>
      <span style={{ ...caps(sub, TYPE.labelSm), width: V ? 34 : 44, flexShrink: 0 }}>
        {String(index + 1).padStart(2, "0")}
      </span>
      <span
        style={{
          fontFamily: DISPLAY, fontWeight: 600, fontSize: size,
          letterSpacing: TRACK.headline, color: fg, lineHeight: 1.16, whiteSpace: "nowrap",
        }}
      >
        {label}
      </span>
      <span
        style={{
          flex: 1, height: 3, minWidth: 40,
          backgroundImage: `repeating-linear-gradient(90deg, ${sub} 0 14px, transparent 14px 28px)`,
          backgroundPositionX: `${march}px`,
          opacity: drawn * breathe,
          transformOrigin: "left center",
          transform: `scaleX(${drawn})`,
        }}
      />
    </div>
  );
};

export const OpenQuestions: React.FC<Win & {
  kicker?: string;
  headline: string;
  headlineCue: string;
  headlineMs?: number;
  items: { label: string; word: string; ms?: number }[];
  size?: number;
  headlineSize?: number;
  bg?: "ink" | "paper";
}> = ({ from, to, kicker, headline, headlineCue, headlineMs, items, size, headlineSize, bg = "ink" }) => {
  const vis = useVis(from, to);
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const sub = bg === "ink" ? INK_SUB : COLORS.grayText;

  const k = usePop(from + 200, { rise: 12 });
  const hOn = headlineMs ?? cue(headlineCue, from + 700, from);
  const h = usePop(hOn, { rise: 20 });

  // clamped monotonic by construction
  let prev = hOn;
  const onsets = items.map((it) => {
    const t = Math.max(it.ms ?? cue(it.word, prev + 1400, from), prev + 300);
    prev = t;
    return t;
  });

  const W = V ? 900 : 1600;

  return (
    <AbsoluteFill style={{ opacity: vis, justifyContent: "center", alignItems: "center", padding: V ? "0 70px" : "0 160px" }}>
      <div style={{ width: W }}>
        {kicker ? <div style={{ ...k, marginBottom: V ? 18 : 22 }}><div style={caps(sub)}>{kicker}</div></div> : null}
        <div style={{ ...h, marginBottom: V ? 40 : 52 }}>
          <div
            style={{
              fontFamily: DISPLAY, fontWeight: 700, fontSize: headlineSize ?? (V ? 58 : 76),
              letterSpacing: TRACK.headline, color: fg, lineHeight: 1.06,
            }}
          >
            {headline}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: V ? 26 : 34 }}>
          {items.map((it, i) => (
            <QuestionRow
              key={i}
              index={i}
              label={it.label}
              onsetMs={onsets[i]}
              fg={fg}
              sub={sub}
              size={size ?? (V ? 38 : 52)}
            />
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};
