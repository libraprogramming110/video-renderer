// ─────────────────────────────────────────────────────────────────────────
// KIT · arc — a multi-attempt REGULATORY ARC as one object, held across a
// section boundary. Added on the BioIntel Replimune long-form, 2026-08-08.
//
// The story "eleven years, two rejections, cleared on the third" is a sequence
// of attempts against a barrier. A three-row ledger states that; this performs it:
//
//   §A  the founding baseline draws, a span bracket measures the years
//       attempts 1 and 2 RISE toward the gate, fail to reach it, and FALL BACK
//         (their heads left dim + struck — the barrier is never labelled "no")
//       attempt 3 rises and CROSSES the gate; the verdict stamps above the line
//   §B  (same picture, NO world wipe) dashed links draw from each dead head into
//       the NEXT attempt's foot — the failures become links in a chain, which is
//       what "a delay, not a death" means; then the track continues past the
//       cleared head, dashed, off the top of the frame and never resolves.
//
// ⚠️ Hold the world across the boundary when you use the §B cues. Cutting the
// ground out mid-argument breaks the single-picture read that justifies the
// block (the EndpointSwitch finding, 2026-08-07). The BroadcastFrame eyebrow
// still turns over, so the section change stays legible.
//
// Portrait-first, bg-aware, monochrome. Cue-driven with …Ms overrides, clamped
// monotonic. No axis numbers beyond the span the script actually names.
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import {
  CLAMP, clamp01, caps, COLORS, CountUp, cue, DISPLAY, INK_SUB, SANS, TRACK, useMs, usePop, useStamp,
} from "./core";
import { FORMAT } from "../style";

const V = FORMAT.key === "vertical";

type Win = { from: number; to: number };

const useVis = (from: number, to: number, padIn = 360, padOut = 360) => {
  const ms = useMs();
  return clamp01(interpolate(ms, [from, from + padIn, to - padOut, to], [0, 1, 1, 0], CLAMP));
};

// viewBox geometry — one place, so the labels and the drawing can never drift.
const VB = { w: 880, h: 700 };
const BASE_Y = 610; // the founding timeline
const GATE_Y = 196; // the regulator
const PEAK_Y = 252; // how far a failed attempt gets (short of the gate)
const DEAD_Y = 452; // where it falls back to
const CLEAR_Y = 112; // through the gate
const SEATS = [250, 470, 690];

export const SubmissionArc: React.FC<Win & {
  kicker?: string;
  /** the barrier the attempts are made against */
  gateLabel: string;
  /** the baseline + its span measure ("11 years after founding") */
  origin: { label: string; word?: string; ms?: number };
  span: { value: number; unit: string; word?: string; ms?: number };
  /** the attempts. The first N-1 fail; the last one clears. */
  attempts: { label: string }[];
  /** both failures land off ONE cue, staggered — the VO says "two prior rejections" */
  failCue?: string;
  failMs?: number;
  /** the successful attempt rises and crosses */
  clearCue?: string;
  clearMs?: number;
  /** the verdict stamps above the gate */
  verdict: string;
  verdictCue?: string;
  verdictMs?: number;
  /** §B — dashed links from each dead head into the next attempt's foot */
  linkCue?: string;
  linkMs?: number;
  linkLabel?: string;
  /** §B — the track continues past the verdict and never resolves */
  openCue?: string;
  openMs?: number;
  bg?: "ink" | "paper";
}> = ({
  from, to, kicker, gateLabel, origin, span, attempts, failCue, failMs, clearCue, clearMs,
  verdict, verdictCue, verdictMs, linkCue, linkMs, linkLabel, openCue, openMs, bg = "paper",
}) => {
  const ms = useMs();
  const vis = useVis(from, to);
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const dim = bg === "ink" ? INK_SUB : COLORS.grayText;
  const hair = bg === "ink" ? "rgba(255,255,255,0.22)" : COLORS.border;

  const originOn = origin.ms ?? cue(origin.word, from + 700, from);
  const spanOn = Math.max(span.ms ?? cue(span.word, originOn + 1500, from), originOn + 400);
  const failOn = Math.max(failMs ?? cue(failCue, spanOn + 2200, from), spanOn + 600);
  const clearOn = Math.max(clearMs ?? cue(clearCue, failOn + 2000, from), failOn + 900);
  const verdOn = Math.max(verdictMs ?? cue(verdictCue, clearOn + 1400, from), clearOn + 700);
  const linkOn = Math.max(linkMs ?? cue(linkCue, verdOn + 2200, from), verdOn + 500);
  const openOn = Math.max(openMs ?? cue(openCue, linkOn + 2800, from), linkOn + 900);

  const ease = (onset: number, dur: number) =>
    clamp01(interpolate(ms, [onset, onset + dur], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) }));

  const k = usePop(from + 200, { rise: 12 });
  const base = ease(originOn, 720);
  const gate = ease(originOn + 400, 620);
  const spanP = ease(spanOn, 700);

  // Each failure: RISE then FALL BACK. One cue, staggered 420ms apart.
  const rise = (i: number) => ease(failOn + i * 420, 620);
  const fall = (i: number) => ease(failOn + i * 420 + 700, 560);
  const headY = (i: number) => PEAK_Y + (DEAD_Y - PEAK_Y) * fall(i);
  const strike = (i: number) => ease(failOn + i * 420 + 1150, 420);

  const clearP = ease(clearOn, 900);
  const cross = clamp01((clearP - 0.55) / 0.45); // the moment it passes the gate
  const verd = useStamp(verdOn);

  const link = ease(linkOn, 1100);
  const open = ease(openOn, 1200);

  const last = SEATS[attempts.length - 1] ?? SEATS[2];
  const failCount = Math.max(0, attempts.length - 1);

  const stroke = { fill: "none", strokeLinecap: "round" as const };

  return (
    <AbsoluteFill
      style={{
        opacity: vis, justifyContent: "center", alignItems: "center", textAlign: "center",
        padding: V ? "0 80px" : "0 160px",
      }}
    >
      {kicker ? (
        <div style={{ ...k, marginBottom: V ? 20 : 14 }}>
          <div style={caps(dim)}>{kicker}</div>
        </div>
      ) : null}

      <svg width={V ? 880 : 820} height={V ? 700 : 652} viewBox={`0 0 ${VB.w} ${VB.h}`} style={{ overflow: "visible" }}>
        {/* the regulator — a line the attempts are made against */}
        <line
          x1={40} y1={GATE_Y} x2={40 + gate * (VB.w - 80)} y2={GATE_Y}
          stroke={fg} strokeWidth={4} opacity={0.9} {...stroke}
        />
        <text fontFamily={SANS} x={40} y={GATE_Y - 22} fill={dim} fontSize={22} fontWeight={600} letterSpacing={3} opacity={gate}>
          {gateLabel.toUpperCase()}
        </text>

        {/* the founding baseline */}
        <line
          x1={60} y1={BASE_Y} x2={60 + base * (VB.w - 120)} y2={BASE_Y}
          stroke={hair} strokeWidth={4} {...stroke}
        />
        <circle cx={60} cy={BASE_Y} r={10} fill={fg} opacity={clamp01(base * 2)} />
        <text fontFamily={SANS} x={60} y={BASE_Y + 44} fill={dim} fontSize={21} fontWeight={600} letterSpacing={3} opacity={clamp01(base * 2)}>
          {origin.label.toUpperCase()}
        </text>

        {/* the span the script actually names */}
        <line
          x1={60} y1={BASE_Y + 74} x2={60 + spanP * (last - 60)} y2={BASE_Y + 74}
          stroke={dim} strokeWidth={3} {...stroke}
        />
        <line x1={60} y1={BASE_Y + 64} x2={60} y2={BASE_Y + 84} stroke={dim} strokeWidth={3} opacity={spanP} />
        <line
          x1={last} y1={BASE_Y + 64} x2={last} y2={BASE_Y + 84}
          stroke={dim} strokeWidth={3} opacity={clamp01((spanP - 0.85) / 0.15)}
        />

        {/* the failed attempts: rise, stall short of the gate, fall back, struck */}
        {Array.from({ length: failCount }).map((_, i) => {
          const x = SEATS[i];
          const top = BASE_Y - (BASE_Y - PEAK_Y) * rise(i);
          const hy = headY(i);
          const settled = fall(i);
          return (
            <g key={i} opacity={rise(i) > 0 ? 1 : 0}>
              {/* the travelled path, dimming as it retreats */}
              <line x1={x} y1={BASE_Y} x2={x} y2={top} stroke={fg} strokeWidth={6} opacity={0.9 - 0.55 * settled} {...stroke} />
              {/* the retreat, dashed */}
              <line
                x1={x} y1={top} x2={x} y2={hy}
                stroke={dim} strokeWidth={4} strokeDasharray="12 10" opacity={settled * 0.85} {...stroke}
              />
              <circle cx={x} cy={hy} r={13} fill="none" stroke={dim} strokeWidth={4} opacity={0.4 + 0.6 * settled} />
              {/* struck — the mark that says it did not stand */}
              <line
                x1={x - 26} y1={hy} x2={x - 26 + 52 * strike(i)} y2={hy}
                stroke={dim} strokeWidth={4} opacity={strike(i)} {...stroke}
              />
              <text fontFamily={SANS} x={x} y={BASE_Y + 44} fill={dim} fontSize={21} fontWeight={600} letterSpacing={3} textAnchor="middle" opacity={rise(i)}>
                {attempts[i].label.toUpperCase()}
              </text>
            </g>
          );
        })}

        {/* the attempt that clears — it goes THROUGH the line */}
        <g opacity={clearP > 0 ? 1 : 0}>
          <line
            x1={last} y1={BASE_Y} x2={last} y2={BASE_Y - (BASE_Y - CLEAR_Y) * clearP}
            stroke={fg} strokeWidth={8} {...stroke}
          />
          <circle cx={last} cy={CLEAR_Y} r={16} fill={fg} opacity={cross} />
          <text fontFamily={SANS}
            x={last} y={BASE_Y + 44} fill={fg} fontSize={21} fontWeight={700} letterSpacing={3}
            textAnchor="middle" opacity={clearP}
          >
            {(attempts[attempts.length - 1]?.label ?? "").toUpperCase()}
          </text>
        </g>

        {/* §B · each failure LINKS into the next attempt — a delay, not an end */}
        {Array.from({ length: failCount }).map((_, i) => {
          const x0 = SEATS[i], x1 = SEATS[i + 1];
          const p = clamp01((link - i * 0.18) / 0.7);
          const y0 = DEAD_Y;
          return (
            <path
              key={`l${i}`}
              d={`M ${x0} ${y0} C ${x0 + 70} ${y0 + 120}, ${x1 - 70} ${BASE_Y}, ${x1} ${BASE_Y}`}
              stroke={dim} strokeWidth={4} strokeDasharray="10 12" pathLength={1}
              strokeDashoffset={1 - p} opacity={p * 0.9} {...stroke}
            />
          );
        })}
        {linkLabel ? (
          <text fontFamily={SANS}
            x={(SEATS[0] + SEATS[1]) / 2} y={DEAD_Y + 132} fill={dim} fontSize={20} fontWeight={600}
            letterSpacing={3} textAnchor="middle" opacity={clamp01((link - 0.55) / 0.45)}
          >
            {linkLabel.toUpperCase()}
          </text>
        ) : null}

        {/* §B · the track runs on past the verdict and never resolves */}
        <line
          x1={last} y1={CLEAR_Y} x2={last} y2={CLEAR_Y - 96 * open}
          stroke={fg} strokeWidth={5} strokeDasharray="10 12" opacity={open * (1 - 0.35 * open)} {...stroke}
        />
      </svg>

      {/* the span figure sits under the diagram, counting as it is voiced */}
      <div style={{ display: "flex", alignItems: "baseline", gap: 14, marginTop: V ? 4 : 0 }}>
        <CountUp
          fromMs={spanOn}
          toMs={spanOn + 800}
          value={span.value}
          decimals={0}
          style={{
            fontFamily: DISPLAY, fontWeight: 700, fontSize: V ? 92 : 84,
            letterSpacing: TRACK.display, color: fg, lineHeight: 1,
          }}
        />
        <div style={{ ...caps(dim), opacity: clamp01((spanP - 0.2) / 0.4) }}>{span.unit}</div>
      </div>

      {/* the verdict stamps last */}
      <div style={{ ...verd, marginTop: V ? 20 : 14 }}>
        <div
          style={{
            fontFamily: DISPLAY, fontWeight: 700, fontSize: V ? 68 : 72,
            letterSpacing: TRACK.display, color: fg, lineHeight: 1,
          }}
        >
          {verdict}
        </div>
      </div>
    </AbsoluteFill>
  );
};
