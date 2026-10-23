// ─────────────────────────────────────────────────────────────────────────
// KIT · combo — SHOW-DON'T-TELL for "drug A approved in combination with drug B,
// for patients who already FAILED something else".
// Added on the BioIntel Replimune long-form, 2026-08-08.
//
// A spec ledger would typeset four rows (DATE / AGENT / PARTNER / POPULATION).
// This block argues instead, in spoken order:
//   1. the approval date stamps                       ("announced August 6th")
//   2. agent A draws                                  ("covers Tudriqev")
//   3. a lock-bar draws BETWEEN them and agent B draws — the connector IS the
//      word "combination", so the motion carries the fact ("in combination with")
//   4. the partner attribution resolves under B       ("Bristol Myers Squibb's")
//   5. an arrow drops into the population, which stamps   ("advanced melanoma")
//   6. the PRIOR line fills, STALLS and goes dead-dashed, struck as it is named
//      ("progressed after PD-1 therapy") — the failed line is WHY the combo
//      exists, so the diagram states the rationale without a caption saying so.
//
// Portrait-first, bg-aware, monochrome (weight + dim only — no glyph marks, no
// colour). Every onset is cue-driven with an explicit …Ms escape hatch, and
// clamped monotonic so no interpolate() range can run backwards.
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import {
  CLAMP, clamp01, caps, COLORS, cue, DISPLAY, INK_SUB, SANS, TRACK, useMs, usePop, useStamp,
} from "./core";
import { FORMAT, TYPE } from "../style";

const V = FORMAT.key === "vertical";

type Win = { from: number; to: number };

const useVis = (from: number, to: number, padIn = 360, padOut = 360) => {
  const ms = useMs();
  return clamp01(interpolate(ms, [from, from + padIn, to - padOut, to], [0, 1, 1, 0], CLAMP));
};

/** Agent A — an oncolytic mark: a ring that draws, with radial spikes that follow. */
const RingAgent: React.FC<{ p: number; fg: string; cx: number; cy: number; r: number }> = ({ p, fg, cx, cy, r }) => {
  const spikes = 8;
  const grow = clamp01((p - 0.45) / 0.55);
  return (
    <g>
      <circle
        cx={cx} cy={cy} r={r}
        stroke={fg} strokeWidth={7} fill="none" pathLength={1}
        strokeDasharray={1} strokeDashoffset={1 - clamp01(p / 0.7)}
        transform={`rotate(-90 ${cx} ${cy})`}
      />
      {Array.from({ length: spikes }).map((_, i) => {
        const a = (i / spikes) * Math.PI * 2;
        const x1 = cx + Math.cos(a) * r, y1 = cy + Math.sin(a) * r;
        const len = 16 * grow;
        return (
          <line
            key={i}
            x1={x1} y1={y1}
            x2={cx + Math.cos(a) * (r + len)} y2={cy + Math.sin(a) * (r + len)}
            stroke={fg} strokeWidth={6} strokeLinecap="round" opacity={grow}
          />
        );
      })}
    </g>
  );
};

/** Agent B — an antibody Y (a checkpoint inhibitor): stem, then two arms. */
const YAgent: React.FC<{ p: number; fg: string; cx: number; cy: number }> = ({ p, fg, cx, cy }) => {
  const S = { stroke: fg, strokeWidth: 7, strokeLinecap: "round" as const, fill: "none", pathLength: 1 };
  const d = (x: number) => ({ strokeDasharray: 1, strokeDashoffset: 1 - clamp01(x) });
  const stem = clamp01(p / 0.4);
  const armA = clamp01((p - 0.3) / 0.4);
  const armB = clamp01((p - 0.5) / 0.4);
  return (
    <g>
      <line x1={cx} y1={cy + 52} x2={cx} y2={cy - 6} {...S} {...d(stem)} />
      <line x1={cx} y1={cy - 6} x2={cx - 48} y2={cy - 54} {...S} {...d(armA)} />
      <line x1={cx} y1={cy - 6} x2={cx + 48} y2={cy - 54} {...S} {...d(armB)} />
      <circle cx={cx - 48} cy={cy - 54} r={11} fill={fg} opacity={clamp01((armA - 0.7) / 0.3)} />
      <circle cx={cx + 48} cy={cy - 54} r={11} fill={fg} opacity={clamp01((armB - 0.7) / 0.3)} />
    </g>
  );
};

export const ComboAssembly: React.FC<Win & {
  kicker?: string;
  /** the approval date badge — stamps on its spoken word */
  date?: { label: string; word?: string; ms?: number };
  /** the two agents; B carries the partner attribution */
  agentA: { label: string; word?: string; ms?: number };
  agentB: { label: string; note?: string; word?: string; ms?: number; noteWord?: string; noteMs?: number };
  /** the connector — drawn as "combination" is voiced */
  lock?: { label?: string; word?: string; ms?: number };
  /** who it is for — stamps */
  population: { label: string; note?: string; word?: string; ms?: number };
  /** the therapy they already failed — fills, stalls dead, and is struck */
  prior: { label: string; verdict: string; word?: string; ms?: number };
  bg?: "ink" | "paper";
}> = ({ from, to, kicker, date, agentA, agentB, lock, population, prior, bg = "ink" }) => {
  const ms = useMs();
  const vis = useVis(from, to);
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const dim = bg === "ink" ? INK_SUB : COLORS.grayText;
  const hair = bg === "ink" ? "rgba(255,255,255,0.20)" : COLORS.border;

  const k = usePop(from + 200, { rise: 12 });

  // Cue-driven, clamped monotonic — a cue that resolves oddly can never invert a range.
  const dateOn = date?.ms ?? cue(date?.word, from + 900, from);
  const aOn = Math.max(agentA.ms ?? cue(agentA.word, dateOn + 1400, from), dateOn + 300);
  const lockOn = Math.max(lock?.ms ?? cue(lock?.word, aOn + 900, from), aOn + 400);
  const bOn = Math.max(agentB.ms ?? cue(agentB.word, lockOn + 1600, from), lockOn + 500);
  const noteOn = Math.max(agentB.noteMs ?? cue(agentB.noteWord, bOn - 600, from), lockOn + 400);
  const popOn = Math.max(population.ms ?? cue(population.word, bOn + 1800, from), bOn + 600);
  const priorOn = Math.max(prior.ms ?? cue(prior.word, popOn + 2000, from), popOn + 600);

  const draw = (onset: number, dur: number) =>
    clamp01(interpolate(ms, [onset, onset + dur], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) }));

  const dateS = useStamp(dateOn);
  const pA = draw(aOn, 620);
  const pLock = draw(lockOn, 520);
  const pB = draw(bOn, 700);
  const labA = usePop(aOn + 420, { rise: 12 });
  const labB = usePop(bOn + 460, { rise: 12 });
  const noteP = usePop(noteOn, { rise: 10 });

  // the pair, once locked, keeps a slow breathe so a held frame never dies
  const bind = clamp01((pLock - 0.6) / 0.4);
  const breathe = 1 + 0.02 * bind * Math.sin(Math.max(0, ms - lockOn) / 420);

  const arrow = draw(popOn - 380, 520);
  const popS = useStamp(popOn);
  const popNote = usePop(popOn + 380, { rise: 10 });

  // PRIOR track: fills to the stall point, then dead-dashed, then struck.
  const fill = draw(priorOn, 700);
  const dead = clamp01((fill - 0.55) / 0.45);
  const strike = draw(priorOn + 900, 460);
  const verdictP = usePop(priorOn + 1150, { rise: 10 });

  const TRACK_W = V ? 620 : 720;
  const STALL = 0.58; // where the prior line stops advancing

  return (
    <AbsoluteFill
      style={{
        opacity: vis, justifyContent: "center", alignItems: "center", textAlign: "center",
        padding: V ? "0 80px" : "0 160px",
      }}
    >
      {kicker ? (
        <div style={{ ...k, marginBottom: 18 }}>
          <div style={caps(dim)}>{kicker}</div>
        </div>
      ) : null}

      {date ? (
        <div style={{ ...dateS, marginBottom: V ? 26 : 18 }}>
          <div
            style={{
              ...caps(fg), border: `3px solid ${hair}`, borderRadius: 6,
              padding: "10px 22px", display: "inline-block",
            }}
          >
            {date.label}
          </div>
        </div>
      ) : null}

      {/* the two agents + the lock between them */}
      <svg width={V ? 760 : 820} height={V ? 250 : 260} viewBox="0 0 760 250" style={{ overflow: "visible" }}>
        <g style={{ transform: `scale(${breathe})`, transformOrigin: "380px 125px" }}>
          <RingAgent p={pA} fg={fg} cx={190} cy={125} r={62} />
          {/* the connector: it IS the word "combination" */}
          <line
            x1={268} y1={125} x2={268 + pLock * 224} y2={125}
            stroke={fg} strokeWidth={6} strokeLinecap="round" opacity={clamp01(pLock * 1.4)}
          />
          <circle cx={380} cy={125} r={9 * bind} fill={fg} opacity={bind} />
          <YAgent p={pB} fg={fg} cx={570} cy={132} />
        </g>
      </svg>

      <div style={{ display: "flex", width: V ? 760 : 820, justifyContent: "space-between", marginTop: 6 }}>
        {/* 380 = half the 760 box, so each label centers on its own agent (190 / 570) */}
        <div style={{ width: 380, ...labA }}>
          <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: V ? 52 : 56, letterSpacing: TRACK.headline, color: fg, lineHeight: 1 }}>
            {agentA.label}
          </div>
        </div>
        <div style={{ width: 380, ...labB }}>
          <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: V ? 52 : 56, letterSpacing: TRACK.headline, color: fg, lineHeight: 1 }}>
            {agentB.label}
          </div>
          {agentB.note ? (
            <div style={{ ...caps(dim, TYPE.labelSm), marginTop: 10, ...noteP }}>{agentB.note}</div>
          ) : null}
        </div>
      </div>

      {/* the pair drops into the population it treats */}
      <svg width={40} height={V ? 92 : 76} viewBox="0 0 40 92" style={{ marginTop: 18, overflow: "visible" }}>
        <line
          x1={20} y1={0} x2={20} y2={70}
          stroke={hair} strokeWidth={5} strokeLinecap="round"
          pathLength={1} strokeDasharray={1} strokeDashoffset={1 - arrow}
        />
        <path d="M8 60 L20 74 L32 60" stroke={hair} strokeWidth={5} fill="none" strokeLinecap="round" opacity={clamp01((arrow - 0.7) / 0.3)} />
      </svg>

      <div style={{ ...popS, marginTop: 12 }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: V ? 72 : 80, letterSpacing: TRACK.display, color: fg, lineHeight: 1.04 }}>
          {population.label}
        </div>
      </div>
      {population.note ? <div style={{ ...caps(dim, TYPE.labelSm), marginTop: 12, ...popNote }}>{population.note}</div> : null}

      {/* the line they already failed — fills, stalls dead, gets struck */}
      <div style={{ marginTop: V ? 44 : 32, width: TRACK_W, position: "relative" }}>
        <div style={{ ...caps(dim, TYPE.labelSm), textAlign: "left", marginBottom: 14 }}>{prior.label}</div>
        <div style={{ position: "relative", height: 12 }}>
          <div style={{ position: "absolute", inset: 0, background: hair, borderRadius: 6 }} />
          <div
            style={{
              position: "absolute", left: 0, top: 0, height: 12, borderRadius: 6,
              width: TRACK_W * STALL * Math.min(1, fill / 0.55), background: fg,
              opacity: 1 - 0.45 * dead,
            }}
          />
          {/* past the stall the track goes dead-dashed — it never reaches the end */}
          <div
            style={{
              position: "absolute", left: TRACK_W * STALL, top: 4, height: 4, width: TRACK_W * (1 - STALL),
              opacity: dead * 0.9,
              backgroundImage: `repeating-linear-gradient(90deg, ${dim} 0 14px, transparent 14px 28px)`,
            }}
          />
          <div
            style={{
              position: "absolute", left: 0, top: 5, height: 3, width: TRACK_W * STALL * strike,
              background: dim,
            }}
          />
        </div>
        <div style={{ ...verdictP, textAlign: "left", marginTop: 18 }}>
          <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: V ? 40 : 42, letterSpacing: TRACK.body, color: dim }}>
            {prior.verdict}
          </span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
