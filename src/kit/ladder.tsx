// ─────────────────────────────────────────────────────────────────────────
// KIT · ladder — ONE cohort, RE-MEASURED. Added on the Roche / enicepatide
// long-form, 2026-09-23.
//
// Why this is not ResponseCohort (2026-08-08): that block pairs ONE proportion
// with a duration — two different KINDS of fact in one frame. Here both facts
// are the same kind (a proportion of the same 100 patients) read at two
// different thresholds, and the interesting thing is the RELATIONSHIP between
// the readings. A relationship only exists if one object carries both, so this
// holds a single grid across two beats instead of cutting between two cards.
//
// ⚠️ THE EPISTEMIC CONSTRAINT — this is the whole reason the block exists.
// 90% hit HbA1c <= 6.5; 62% reached full normoglycemia. Clinically the second
// is the stricter bar, so the obvious graphic is to DIM 90 marks down to 62.
// That graphic asserts the 62% is a SUBSET of the 90%. The script never says
// so, and this brand does not assert what its source did not claim. So:
//   • the grid DRAINS to outline between readings and re-lights from zero —
//     a visible second measurement, not a narrowing.
//   • the figure RE-COUNTS from 0. Carrying 90 under a normoglycemia label
//     would be a false statement (block-kit.md, 2026-08-21).
//   • successive readings fill from OPPOSITE ENDS of the grid, so the lit
//     marks are visibly not "the same individuals" while staying contiguous
//     and countable. Direction alone carries it; no caption has to.
//
// Vocabulary rule (2026-08-22): both figures are REAL published proportions,
// so a lit mark is a SOLID fill. The outline means "not in this reading" —
// never "unmeasured". Nothing here is hollow-because-unknown.
//
// Portrait-first, bg-aware, monochrome: lit marks are the foreground, and the
// scene's ONE accent is the rule under the figure. 90 red dots would be nine
// competing emphases.
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, interpolate } from "remotion";
import {
  CLAMP, clamp01, caps, COLORS, CountUp, cue, DISPLAY, INK_SUB, TRACK, useAccent, useMs, usePop,
} from "./core";
import { FORMAT, TYPE } from "../style";

const V = FORMAT.key === "vertical";

type Win = { from: number; to: number };

const useVis = (from: number, to: number, padIn = 360, padOut = 360) => {
  const ms = useMs();
  return clamp01(interpolate(ms, [from, from + padIn, to - padOut, to], [0, 1, 1, 0], CLAMP));
};

export type Reading = {
  /** 0-100. The count of marks lit = Math.round(percent) of `total`. */
  percent: number;
  /** the threshold this reading measures, resolved on its own spoken word */
  label: string;
  /** the figure's spoken word (e.g. "90%") */
  word: string;
  wordMs?: number;
  labelCue?: string;
  labelMs?: number;
};

/** One mark. Its own component so the ramp hooks are not called inside a .map. */
const Mark: React.FC<{
  litAt: number | null;
  reLitAt: number | null;
  drainAt: number | null;
  size: number;
  fg: string;
  hair: string;
}> = ({ litAt, reLitAt, drainAt, size, fg, hair }) => {
  const ms = useMs();
  const ramp = (at: number | null, dur: number) =>
    at == null ? 0 : clamp01(interpolate(ms, [at, at + dur], [0, 1], CLAMP));
  // first reading, knocked back out by the drain; then the second reading.
  // max() not sum() — a mark lit in both readings must not double up.
  const drained = ramp(drainAt, 240);
  const lit = Math.max(ramp(litAt, 200) * (1 - drained), ramp(reLitAt, 200));
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: size,
        border: `2px solid ${lit > 0.02 ? fg : hair}`,
        background: lit > 0.02 ? fg : "transparent",
        opacity: 0.4 + 0.6 * Math.max(lit, 0.28),
        transform: `scale(${0.88 + 0.12 * lit})`,
      }}
    />
  );
};

export const CohortLadder: React.FC<Win & {
  kicker: string;
  kickerCue?: string;
  kickerMs?: number;
  /** the outlined grid appears on this cue, before any reading lands */
  cohortCue?: string;
  cohortMs?: number;
  /** two (or more) readings of the SAME cohort, in spoken order */
  readings: Reading[];
  /** marks per row; total is always cols * cols (100 at cols=10) */
  cols?: number;
  /** how long a figure counts, and the wave that fills the grid with it */
  countMs?: number;
  figureSize?: number;
  bg?: "ink" | "paper";
}> = ({
  from, to, kicker, kickerCue, kickerMs, cohortCue, cohortMs, readings,
  cols = 10, countMs = 1100, figureSize, bg = "ink",
}) => {
  const ms = useMs();
  const vis = useVis(from, to);
  const acc = useAccent();
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const sub = bg === "ink" ? INK_SUB : COLORS.grayText;
  const hair = bg === "ink" ? "rgba(255,255,255,0.20)" : "rgba(0,0,0,0.16)";

  const total = cols * cols;
  const cell = V ? 56 : 40;
  const gap = V ? 24 : 18;
  const big = figureSize ?? (V ? 190 : 150);

  const kickOn = kickerMs ?? cue(kickerCue, from + 300, from);
  const gridOn = cohortMs ?? cue(cohortCue, kickOn + 500, from);
  const k = usePop(kickOn, { rise: 14 });
  // the outlined grid wipes in row by row before anything is measured
  const gridP = clamp01(interpolate(ms, [gridOn, gridOn + 700], [0, 1], CLAMP));

  // figure onsets, forced monotonic so a mis-cue can never invert the readings
  const figOn: number[] = [];
  for (let i = 0; i < readings.length; i++) {
    const fallback = (figOn[i - 1] ?? gridOn) + 2600;
    const want = readings[i].wordMs ?? cue(readings[i].word, fallback, i === 0 ? from : figOn[i - 1] + 1);
    figOn.push(Math.max(want, (figOn[i - 1] ?? 0) + 900));
  }
  // the drain that separates reading i-1 from reading i
  const drainOf = (i: number) => (i === 0 ? null : figOn[i] - 460);

  return (
    <AbsoluteFill
      style={{
        opacity: vis,
        justifyContent: "center",
        alignItems: "center",
        textAlign: "center",
        padding: V ? "0 80px" : "0 160px",
      }}
    >
      <div style={{ ...k, marginBottom: V ? 26 : 20 }}>
        <div style={caps(sub)}>{kicker}</div>
      </div>

      {/* the figure slot — readings crossfade through the same seat, so the eye
          stays on one object instead of tracking a new card */}
      {/* Slot height is DERIVED, not a magic number: figure + rule margin (16)
          + rule (6) + label margin (16) + the label tier. A hardcoded 74 fit a
          30px label and silently clipped when TYPE.label went to 40. */}
      <div style={{ position: "relative", width: "100%", height: big + 38 + TYPE.label }}>
        {readings.map((r, i) => (
          <ReadingFigure
            key={i}
            reading={r}
            figOn={figOn[i]}
            outAt={i + 1 < readings.length ? drainOf(i + 1)! : null}
            countMs={countMs}
            from={from}
            big={big}
            fg={fg}
            sub={sub}
            acc={acc}
          />
        ))}
      </div>

      <div
        style={{
          marginTop: V ? 44 : 32,
          display: "grid",
          gridTemplateColumns: `repeat(${cols}, ${cell}px)`,
          gap,
          justifyContent: "center",
          opacity: gridP,
        }}
      >
        {Array.from({ length: total }, (_, idx) => {
          // Reading 0 fills FORWARD from the top-left; reading 1 fills BACKWARD
          // from the bottom-right. Same proportion, visibly not the same marks.
          const seatFor = (i: number) => (i % 2 === 0 ? idx : total - 1 - idx);
          const onFor = (i: number) => {
            const n = Math.round((readings[i].percent / 100) * total);
            const seat = seatFor(i);
            return seat < n ? figOn[i] + (seat / total) * countMs : null;
          };
          return (
            <Mark
              key={idx}
              litAt={onFor(0)}
              reLitAt={readings.length > 1 ? onFor(1) : null}
              drainAt={drainOf(1)}
              size={cell}
              fg={fg}
              hair={hair}
            />
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/** One reading's figure + threshold label. Separate component: its own hooks. */
const ReadingFigure: React.FC<{
  reading: Reading;
  figOn: number;
  outAt: number | null;
  countMs: number;
  from: number;
  big: number;
  fg: string;
  sub: string;
  acc: string;
}> = ({ reading, figOn, outAt, countMs, from, big, fg, sub, acc }) => {
  const ms = useMs();
  const inOp = clamp01(interpolate(ms, [figOn - 140, figOn + 120], [0, 1], CLAMP));
  const outOp = outAt == null ? 1 : clamp01(interpolate(ms, [outAt, outAt + 220], [1, 0], CLAMP));
  const labelOn = reading.labelMs ?? cue(reading.labelCue, figOn + countMs + 300, figOn);
  const lab = usePop(labelOn, { rise: 14 });
  // the scene's ONE red: a rule that draws under each figure as it settles
  const ruleW = clamp01(interpolate(ms, [figOn + countMs - 200, figOn + countMs + 500], [0, 1], CLAMP)) * (big * 1.1);
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        opacity: inOp * outOp,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "flex-start",
      }}
    >
      <CountUp
        fromMs={figOn}
        toMs={figOn + countMs}
        value={reading.percent}
        decimals={0}
        suffix="%"
        style={{
          fontFamily: DISPLAY,
          fontWeight: 700,
          fontSize: big,
          letterSpacing: TRACK.display,
          color: fg,
          lineHeight: 1,
        }}
      />
      <div style={{ height: 6, width: ruleW, background: acc, borderRadius: 3, marginTop: 16 }} />
      {/* the label is gated with the figure it belongs to — a threshold caption
          sitting over an empty seat labels nothing (block-kit.md, 2026-08-14) */}
      <div style={{ ...lab, marginTop: 16 }}>
        <div style={caps(sub)}>{reading.label}</div>
      </div>
    </div>
  );
};
