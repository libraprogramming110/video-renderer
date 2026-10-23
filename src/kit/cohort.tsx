// ─────────────────────────────────────────────────────────────────────────
// KIT · cohort — a trial readout where the two figures are DIFFERENT KINDS of
// fact, so they get different grammars in one frame.
// Added on the BioIntel Replimune long-form, 2026-08-08.
//
//   • an objective RESPONSE RATE is a PROPORTION → a cohort of 100 marks, of
//     which N light up on the spoken figure. You SEE 24 in 100; a count-up to
//     "24.2%" only asserts it.
//   • a median DURATION OF RESPONSE is a LENGTH → a track that extends, with a
//     median tick at its end.
//
// ⚠️ The duration track carries NO axis, NO maximum and NO ticks by design. The
// script names one number and no scale; an axis would invent precision the VO
// never claims (the PipelineSpend rule, 2026-08-06). Length conveys duration,
// the figure carries the value.
//
// Portrait-first, bg-aware, monochrome. Every onset is cue-driven with a …Ms
// escape hatch and clamped monotonic.
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import {
  CLAMP, clamp01, caps, COLORS, CountUp, cue, DISPLAY, INK_SUB, TRACK, useMs, usePop,
} from "./core";
import { FORMAT, TYPE } from "../style";

const V = FORMAT.key === "vertical";

type Win = { from: number; to: number };

const useVis = (from: number, to: number, padIn = 360, padOut = 360) => {
  const ms = useMs();
  return clamp01(interpolate(ms, [from, from + padIn, to - padOut, to], [0, 1, 1, 0], CLAMP));
};

/** One mark in the cohort — its own component so the hook isn't called in a .map. */
const Mark: React.FC<{ lit: boolean; p: number; fg: string; hair: string; size: number }> = ({
  lit, p, fg, hair, size,
}) => (
  <div
    style={{
      width: size, height: size, borderRadius: size,
      border: `2px solid ${lit ? fg : hair}`,
      background: lit ? fg : "transparent",
      opacity: lit ? 0.35 + 0.65 * p : 0.55 + 0.45 * p,
      transform: `scale(${lit ? 0.86 + 0.14 * p : 1})`,
    }}
  />
);

export const ResponseCohort: React.FC<Win & {
  kicker: string;
  kickerCue?: string;
  /** the cohort appears (outlined, nothing lit yet) */
  cohortCue?: string;
  cohortMs?: number;
  /** the proportion: `percent` of 100 marks light up on this cue */
  rate: {
    percent: number;
    decimals?: number;
    label: string;
    labelCue?: string;
    labelMs?: number;
    word?: string;
    ms?: number;
  };
  /** the length: a track extends and a median tick lands */
  duration: {
    value: number;
    decimals?: number;
    unit: string;
    label: string;
    labelCue?: string;
    labelMs?: number;
    word?: string;
    ms?: number;
    tick?: string;
  };
  bg?: "ink" | "paper";
}> = ({ from, to, kicker, kickerCue, cohortCue, cohortMs, rate, duration, bg = "paper" }) => {
  const ms = useMs();
  const vis = useVis(from, to);
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const dim = bg === "ink" ? INK_SUB : COLORS.grayText;
  const hair = bg === "ink" ? "rgba(255,255,255,0.22)" : COLORS.border;

  const kOn = cue(kickerCue, from + 250, from);
  const cohortOn = Math.max(cohortMs ?? cue(cohortCue, kOn + 900, from), kOn + 250);
  const rLabOn = Math.max(rate.labelMs ?? cue(rate.labelCue, cohortOn + 900, from), cohortOn + 300);
  const rOn = Math.max(rate.ms ?? cue(rate.word, rLabOn + 1400, from), rLabOn + 400);
  const dLabOn = Math.max(duration.labelMs ?? cue(duration.labelCue, rOn + 1600, from), rOn + 600);
  const dOn = Math.max(duration.ms ?? cue(duration.word, dLabOn + 1800, from), dLabOn + 400);

  const k = usePop(kOn, { rise: 12 });
  const rLab = usePop(rLabOn, { rise: 12 });
  const dLab = usePop(dLabOn, { rise: 12 });

  const ease = (onset: number, dur: number) =>
    clamp01(interpolate(ms, [onset, onset + dur], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) }));

  const born = ease(cohortOn, 700);
  const LIT = Math.round(rate.percent); // 24.2% → 24 of 100 marks; the figure carries the .2
  const litP = ease(rOn, 1000);
  const litCount = litP * LIT;

  // the duration track: grows, then a median tick lands at its end
  const grow = ease(dOn, 900);
  const tick = clamp01((grow - 0.72) / 0.28);
  const ruleW = ease(dLabOn - 200, 700);

  const SIZE = V ? 34 : 30;
  const GAP = V ? 18 : 16;
  const COLS = 10;
  const GRID_W = COLS * SIZE + (COLS - 1) * GAP; // 502 at portrait — inside the 920 padded width
  const TRACK_W = V ? 620 : 720;

  return (
    <AbsoluteFill
      style={{
        opacity: vis, justifyContent: "center", alignItems: "center", textAlign: "center",
        padding: V ? "0 80px" : "0 160px",
      }}
    >
      <div style={{ ...k, marginBottom: V ? 26 : 18 }}>
        <div style={caps(dim)}>{kicker}</div>
      </div>

      {/* the proportion — 100 marks, N of them lit */}
      <div
        style={{
          width: GRID_W, display: "grid", gridTemplateColumns: `repeat(${COLS}, ${SIZE}px)`,
          gap: GAP, opacity: born,
        }}
      >
        {Array.from({ length: 100 }).map((_, i) => (
          <Mark key={i} lit={i < litCount} p={clamp01(litCount - i)} fg={fg} hair={hair} size={SIZE} />
        ))}
      </div>

      <CountUp
        fromMs={rOn}
        toMs={rOn + 1000}
        value={rate.percent}
        decimals={rate.decimals ?? 1}
        suffix="%"
        style={{
          fontFamily: DISPLAY, fontWeight: 700, fontSize: V ? 150 : 140,
          letterSpacing: TRACK.display, color: fg, lineHeight: 1, marginTop: V ? 30 : 22,
        }}
      />
      <div style={{ ...rLab, marginTop: 10 }}>
        <div style={caps(dim)}>{rate.label}</div>
      </div>

      <div style={{ height: 3, width: ruleW * (V ? 620 : 720), background: hair, marginTop: V ? 40 : 30 }} />

      {/* the length — a track that extends, no axis and no maximum */}
      <div style={{ ...dLab, marginTop: V ? 34 : 26 }}>
        <div style={caps(dim)}>{duration.label}</div>
      </div>
      <div style={{ width: TRACK_W, position: "relative", height: 46, marginTop: 20 }}>
        <div style={{ position: "absolute", left: 0, top: 20, width: TRACK_W, height: 3, background: hair }} />
        <div style={{ position: "absolute", left: 0, top: 18, width: TRACK_W * grow, height: 7, background: fg, borderRadius: 4 }} />
        <div
          style={{
            position: "absolute", left: TRACK_W * grow, top: 4, width: 4, height: 36,
            background: fg, opacity: tick, transform: "translateX(-2px)",
          }}
        />
        {duration.tick ? (
          <div
            style={{
              position: "absolute", left: TRACK_W * grow, top: -26, opacity: tick,
              transform: "translateX(-100%)", ...caps(dim, TYPE.labelSm), whiteSpace: "nowrap", paddingRight: 12,
            }}
          >
            {duration.tick}
          </div>
        ) : null}
      </div>
      <CountUp
        fromMs={dOn}
        toMs={dOn + 900}
        value={duration.value}
        decimals={duration.decimals ?? 1}
        suffix={` ${duration.unit}`}
        style={{
          fontFamily: DISPLAY, fontWeight: 700, fontSize: V ? 76 : 72,
          letterSpacing: TRACK.display, color: fg, lineHeight: 1, marginTop: 18,
        }}
      />
    </AbsoluteFill>
  );
};
