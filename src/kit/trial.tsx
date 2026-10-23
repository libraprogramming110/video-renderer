// ─────────────────────────────────────────────────────────────────────────
// KIT · trial — A HEAD-TO-HEAD READOUT AS A DESCENT. Added on the Lilly Onswik
// long-form, 2026-09-26.
//
// For "In the <trial>, A cut <marker> by X. B, the comparator, cut it by Y.
// Non-inferior… primary endpoint hit."
//
// The enactment, a section-length spine (~17s):
//   1. the trial name STAMPS large, letter by letter, then TRAVELS up and docks
//      as the frame's kicker (it is the context for everything below it);
//   2. each arm is a column of liquid that POURS DOWN from a shared baseline.
//      Depth is strictly proportional to the figure AT EVERY FRAME: the column
//      is driven by the same value the readout is counting, so the readout that
//      rides its leading edge is a reading of the picture, not a second claim.
//      The leading edge is a meniscus whose ripple scales with the column's
//      SPEED (flat at rest, never jitter: it is state, not shake) and sheds a
//      few droplets while it falls;
//   3. before a figure is voiced, "cut" bulges the cap under the baseline, so
//      the pour visibly waits for its number;
//   4. "Non-inferior": a pair of level lines snaps across BOTH columns at their
//      two feet, so the distance between them is shown, never numbered (the
//      script speaks no difference, 2026-08-06 rule);
//   5. "primary endpoint … hit": four targeting brackets converge on the
//      winning readout and LOCK on "hit" with a flash + a ring.
//
// Vocabulary (2026-08-22): both figures are real published results, so both
// columns are SOLID — the comparator recessive (white at low alpha), never an
// outline. No axis values: only the two spoken figures appear.
// Portrait-first; built for the ink world. The one red is the lead arm.
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, interpolate, Easing } from "remotion";
import { CLAMP, clamp01, COLORS, cue, DISPLAY, SANS, TRACK, useMs, useAccent, INK_SUB } from "./core";
import { TYPE } from "../style";

const EASE = Easing.out(Easing.cubic);
const EASE_IO = Easing.inOut(Easing.cubic);

type Win = { from: number; to: number };

const useVis = (from: number, to: number, padIn = 300, padOut = 360) => {
  const ms = useMs();
  return clamp01(interpolate(ms, [from, from + padIn, to - padOut, to], [0, 1, 1, 0], CLAMP));
};

export const TRIAL = {
  baseY: 560,
  pxPer: 500, // px per percentage point: depth is the figure, nothing else
  colW: 280,
  leftCX: 310,
  rightCX: 770,
  nameY: 300,
  dockY: 168,
};

type Arm = {
  name: string;
  sub: string;
  nameWord?: string; nameMs?: number;
  subWord?: string; subMs?: number;
  /** "cut" — the cap bulges, waiting for its number */
  cutWord?: string; cutMs?: number;
  value: number;
  decimals: number;
  /** the figure is voiced from this word ... */
  figWord?: string; figMs?: number;
  /** ... for this long (the pour takes the time the words take) */
  figDurMs: number;
};

/** One arm: name, pour, meniscus, droplets, readout. Own component (hooks). */
const Column: React.FC<{ arm: Arm; cx: number; color: string; readColor: string; from: number; lead: boolean; t: { name: number; sub: number; cut: number; fig: number } }> = ({
  arm, cx, color, readColor, from, t,
}) => {
  const ms = useMs();
  const { baseY, pxPer, colW } = TRIAL;
  const val = (m: number) => arm.value * EASE_IO(clamp01(interpolate(m, [t.fig, t.fig + arm.figDurMs], [0, 1], CLAMP)));
  const v = val(ms);
  const speed = Math.abs(val(ms) - val(ms - 33)) / arm.value; // 0..~0.04 per frame
  const ripple = Math.min(1, speed * 45);
  const bulge = interpolate(ms, [t.cut, t.cut + 500], [0, 18], { ...CLAMP, easing: EASE }) * (1 - clamp01((v / arm.value) * 4));
  const depth = v * pxPer + bulge;
  const capOn = clamp01(interpolate(ms, [t.cut, t.cut + 200], [0, 1], CLAMP));
  const x0 = cx - colW / 2;
  const foot = baseY + depth;

  // the meniscus: a travelling sine along the leading edge, amplitude = speed
  const N = 24;
  const phase = (ms / 1000) * 9;
  const amp = 14 * ripple;
  const edge = Array.from({ length: N + 1 }, (_, i) => {
    const x = x0 + (colW * i) / N;
    const y = foot + Math.sin(phase + i * 0.7) * amp * Math.sin((Math.PI * i) / N);
    return `${i === 0 ? "L" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ");
  const path = `M ${x0} ${baseY} ${edge} L ${x0 + colW} ${baseY} Z`;

  const nameP = clamp01(interpolate(ms, [t.name, t.name + 260], [0, 1], CLAMP));
  const subP = clamp01(interpolate(ms, [t.sub, t.sub + 260], [0, 1], CLAMP));
  const figOn = clamp01(interpolate(ms, [t.fig - 60, t.fig + 140], [0, 1], CLAMP));

  return (
    <>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {capOn > 0 ? <path d={path} fill={color} opacity={capOn} /> : null}
        {/* droplets shed from the leading edge while it moves */}
        {ripple > 0.05
          ? [0, 1, 2, 3, 4].map((j) => {
              const life = ((ms / 1000) * 2.2 + j * 0.2) % 1; // 0..1 loop, deterministic
              const dx = x0 + colW * (0.15 + ((j * 37) % 70) / 100);
              const dy = foot + 12 + life * 90;
              return <circle key={j} cx={dx} cy={dy} r={7 * (1 - life)} fill={color} opacity={ripple * (1 - life)} />;
            })
          : null}
      </svg>
      {/* name + sub above the baseline */}
      <div style={{ position: "absolute", left: cx - 260, width: 520, top: TRIAL.nameY, textAlign: "center" }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 64, letterSpacing: TRACK.headline, color: COLORS.paper, opacity: nameP, transform: `translateY(${(1 - nameP) * 16}px)` }}>{arm.name}</div>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: TYPE.labelSm, letterSpacing: TRACK.nav, color: INK_SUB, marginTop: 8, opacity: subP }}>{arm.sub}</div>
      </div>
      {/* the readout rides the leading edge from INSIDE the column (outside, the
          level lines at the two feet would run through the shallower one) */}
      <div style={{ position: "absolute", left: cx - 200, width: 400, top: Math.max(baseY + 8, foot - 112), textAlign: "center", opacity: figOn, fontFamily: DISPLAY, fontWeight: 700, fontSize: 84, letterSpacing: TRACK.display, color: readColor, fontVariantNumeric: "tabular-nums" }}>
        −{v.toFixed(arm.decimals)}%
      </div>
    </>
  );
};

export const TrialDescent: React.FC<Win & {
  trial: { name: string; tail: string; word?: string; ms?: number; dockWord?: string; dockMs?: number };
  marker: { label: string; word?: string; ms?: number };
  lead: Arm;
  comparator: Arm;
  verdict: { label: string; word?: string; ms?: number };
  endpoint: { label: string; stamp: string; word?: string; ms?: number; hitWord?: string; hitMs?: number };
}> = ({ from, to, trial, marker, lead, comparator, verdict, endpoint }) => {
  const ms = useMs();
  const acc = useAccent();
  const vis = useVis(from, to);
  const k = (a: number, d: number) => clamp01(interpolate(ms, [a, a + d], [0, 1], CLAMP));

  // onsets — monotonic by construction
  const tTrial = trial.ms ?? cue(trial.word, from + 200, from);
  const tDock = Math.max(tTrial + 450, trial.dockMs ?? cue(trial.dockWord, tTrial + 700, from));
  const L = {
    name: Math.max(tDock + 200, lead.nameMs ?? cue(lead.nameWord, tDock + 600, from)),
    sub: 0, cut: 0, fig: 0,
  };
  L.sub = Math.max(L.name, lead.subMs ?? cue(lead.subWord, L.name + 250, from));
  L.cut = Math.max(L.name + 250, lead.cutMs ?? cue(lead.cutWord, L.name + 800, from));
  const tMarker = Math.max(L.cut, marker.ms ?? cue(marker.word, L.cut + 150, from));
  L.fig = Math.max(tMarker + 300, lead.figMs ?? cue(lead.figWord, tMarker + 1200, from));
  const R = { name: Math.max(L.fig + lead.figDurMs, comparator.nameMs ?? cue(comparator.nameWord, L.fig + lead.figDurMs + 600, L.fig)), sub: 0, cut: 0, fig: 0 };
  R.sub = Math.max(R.name + 200, comparator.subMs ?? cue(comparator.subWord, R.name + 900, R.name));
  R.cut = Math.max(R.sub + 200, comparator.cutMs ?? cue(comparator.cutWord, R.sub + 900, R.name));
  R.fig = Math.max(R.cut + 300, comparator.figMs ?? cue(comparator.figWord, R.cut + 700, R.name));
  const tVerdict = Math.max(R.fig + comparator.figDurMs, verdict.ms ?? cue(verdict.word, R.fig + comparator.figDurMs + 600, R.fig));
  const tEnd = Math.max(tVerdict + 400, endpoint.ms ?? cue(endpoint.word, tVerdict + 1500, tVerdict));
  const tHit = Math.max(tEnd + 400, endpoint.hitMs ?? cue(endpoint.hitWord, tEnd + 1000, tEnd));

  // ── the trial name: stamps letter by letter, then docks as the kicker ──
  const dock = EASE_IO(k(tDock, 620));
  const titleSize = interpolate(dock, [0, 1], [176, 58]);
  const titleY = interpolate(dock, [0, 1], [760, TRIAL.dockY]);
  const letters = trial.name.split("");
  const tailP = k(tDock + 300, 260); // late: at 176px the name + tail would overflow 1080 (~1316px)

  // ── baseline ──
  const baseP = EASE(k(L.name - 150, 600));
  const markP = k(tMarker, 260);

  // ── verdict: level lines at both feet, across both columns ──
  const footL = TRIAL.baseY + lead.value * TRIAL.pxPer;
  const footR = TRIAL.baseY + comparator.value * TRIAL.pxPer;
  const lvl = EASE(k(tVerdict, 420));
  const xA = TRIAL.leftCX - TRIAL.colW / 2 - 30;
  const xB = TRIAL.rightCX + TRIAL.colW / 2 + 30;
  const verdictStamp = { opacity: k(tVerdict, 150), scale: interpolate(ms, [tVerdict, tVerdict + 300], [1.18, 1], { ...CLAMP, easing: EASE }) };

  // ── endpoint: brackets converge on the lead readout, lock on "hit" ──
  const box = { x: TRIAL.leftCX - 160, y: footL - 122, w: 320, h: 112 }; // the readout, inside the column
  const conv = EASE_IO(k(tEnd, Math.max(400, tHit - tEnd)));
  const spread = interpolate(conv, [0, 1], [140, 0]);
  const lock = k(tHit, 380);
  const bOn = k(tEnd, 200);
  const flash = lock > 0 ? 1 - lock : 0;
  const ring = k(tHit, 700);
  const epP = k(tEnd, 260);
  const hitP = { opacity: k(tHit, 140), scale: interpolate(ms, [tHit, tHit + 320], [1.3, 1], { ...CLAMP, easing: EASE }) };
  const arm = 44;
  const corner = (sx: number, sy: number) => {
    const x = sx < 0 ? box.x - spread : box.x + box.w + spread;
    const y = sy < 0 ? box.y - spread * 0.6 : box.y + box.h + spread * 0.6;
    return `M ${x} ${y + sy * -arm} L ${x} ${y} L ${x + sx * -arm} ${y}`;
  };

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {/* trial name */}
      <div style={{ position: "absolute", left: 0, right: 0, top: titleY - titleSize * 0.6, textAlign: "center", whiteSpace: "nowrap" }}>
        {letters.map((c, i) => {
          const p = k(tTrial + i * 45, 220);
          return (
            <span key={i} style={{ display: "inline-block", fontFamily: DISPLAY, fontWeight: 700, fontSize: titleSize, letterSpacing: TRACK.display, color: COLORS.paper, opacity: p, transform: `translateY(${(1 - p) * 40}px) scale(${interpolate(p, [0, 1], [1.4, 1])})` }}>
              {c}
            </span>
          );
        })}
        <span style={{ display: "inline-block", marginLeft: "0.28em", fontFamily: DISPLAY, fontWeight: 400, fontSize: titleSize, letterSpacing: TRACK.display, color: INK_SUB, opacity: tailP }}>{trial.tail}</span>
      </div>

      {/* baseline + its label */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <line x1={540 - 440 * baseP} x2={540 + 440 * baseP} y1={TRIAL.baseY} y2={TRIAL.baseY} stroke={COLORS.paper} strokeWidth={4} opacity={baseP} />
      </svg>
      <div style={{ position: "absolute", left: 100, top: TRIAL.baseY - 58, fontFamily: SANS, fontWeight: 700, fontSize: TYPE.labelSm, letterSpacing: TRACK.nav, color: INK_SUB, opacity: markP }}>{marker.label}</div>

      <Column arm={lead} cx={TRIAL.leftCX} color={acc} readColor={COLORS.paper} from={from} lead t={L} />
      <Column arm={comparator} cx={TRIAL.rightCX} color="rgba(255,255,255,0.28)" readColor={COLORS.paper} from={from} lead={false} t={R} />

      {/* the level lines: the distance is shown, never numbered */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {[footL, footR].map((y, i) => (
          <line key={i} x1={xA} x2={xA + (xB - xA) * lvl} y1={y} y2={y} stroke={COLORS.paper} strokeWidth={3} strokeDasharray="2 0" opacity={lvl * 0.9} />
        ))}
        {lvl > 0 ? <line x1={xB} x2={xB} y1={footR} y2={footR + (footL - footR) * lvl} stroke={COLORS.paper} strokeWidth={3} /> : null}

        {/* targeting brackets */}
        {bOn > 0
          ? [[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy], i) => (
              <path key={i} d={corner(sx, sy)} fill="none" stroke={lock > 0 ? acc : COLORS.paper} strokeWidth={6} opacity={bOn} strokeLinecap="square" />
            ))
          : null}
        {flash > 0 ? <rect x={box.x} y={box.y} width={box.w} height={box.h} fill={acc} opacity={flash * 0.35} /> : null}
        {ring > 0 && ring < 1 ? <circle cx={box.x + box.w / 2} cy={box.y + box.h / 2} r={80 + ring * 320} fill="none" stroke={acc} strokeWidth={8 * (1 - ring)} opacity={1 - ring} /> : null}
      </svg>

      {/* verdict + endpoint lines */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1382, textAlign: "center" }}>
        <div style={{ display: "inline-block", fontFamily: DISPLAY, fontWeight: 700, fontSize: 88, letterSpacing: TRACK.display, color: COLORS.paper, opacity: verdictStamp.opacity, transform: `scale(${verdictStamp.scale})` }}>{verdict.label}</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1500, display: "flex", justifyContent: "center", alignItems: "baseline", gap: 20 }}>
        <span style={{ fontFamily: DISPLAY, fontWeight: 400, fontSize: 60, letterSpacing: TRACK.headline, color: INK_SUB, opacity: epP }}>{endpoint.label}</span>
        <span style={{ display: "inline-block", fontFamily: DISPLAY, fontWeight: 700, fontSize: 60, letterSpacing: TRACK.headline, color: acc, opacity: hitP.opacity, transform: `scale(${hitP.scale})` }}>{endpoint.stamp}</span>
      </div>
    </AbsoluteFill>
  );
};
