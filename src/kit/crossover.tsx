// ─────────────────────────────────────────────────────────────────────────
// KIT · crossover — THE SURVIVAL QUESTION as one object (~34s, ink) + its red
// punch. Added on the Compass/tovecimig long-form, 2026-09-26. HORIZONTAL.
//
// CrossoverField — for "Overall survival is where the case gets harder. X% of
// the control arm crossed over to <drug>. In the intention-to-treat analysis,
// median survival was A on <drug> against B in the control arm. Not
// statistically significant. <Sponsor> attributes that to the crossover. It
// points to a subset: control patients who crossed over lived C, against D for
// those who did not."
//
// The two arms are 100-dot fields (proportion grammar: 100 marks, never a head
// count). What it ENACTS, in order:
//   1. the control field lights X of its dots while X% counts (scattered, by a
//      deterministic hash: crossover was not a block of patients);
//   2. on "crossed over" those dots LEAP through a gate into a pool in the
//      middle and turn red as they pass it (they got the drug);
//   3. on "intention-to-treat" they are YANKED BACK to their own seats with an
//      overshoot — still red. The control arm now carries the drug. That is
//      the whole problem, shown, not said;
//   4. both fields fold into a legend and the OS curves draw TANGLED; the two
//      plumb lines land ~40px apart (the closeness is the finding); the stamp
//      "Not statistically significant" lands with one damped bump;
//   5. the control field returns and SORTS itself into the two groups the
//      sponsor points to; each group's median grows as a bar while voiced.
// Red = the drug, everywhere (treatment dots, crossed dots, its curve, its bar).
// Curves are schematic through the reported medians (the frame says so).
//
// NotRandomized — the red punch. The line flows; "randomized" arrives as its
// own letters falling out of SCATTER into order (the word performs itself).
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, interpolate, Easing } from "remotion";
import { CLAMP, clamp01, COLORS, cue, cueSeq, DISPLAY, SANS, TRACK, useMs, useAccent, useInkSub, INK_SUB } from "./core";
import { FlowLine } from "./flowline";
import { ARENA, kmPath } from "./arena";
import { TYPE } from "../style";

const EASE = Easing.out(Easing.cubic);
const EASE_IO = Easing.inOut(Easing.cubic);
const BACK = Easing.out(Easing.back(1.6));
const W = 1920;
const H = 1080;
type Cue = { word?: string; ms?: number };
const at = (c: Cue | undefined, fb: number, after: number) => c?.ms ?? cue(c?.word, fb, after);
const kf = (ms: number, a: number, d: number) => clamp01(interpolate(ms, [a, a + d], [0, 1], CLAMP));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const hash = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const xM = (m: number) => ARENA.X0 + ((ARENA.X1 - ARENA.X0) * m) / ARENA.MONTHS;
const y50 = ARENA.Y0 - (ARENA.Y0 - ARENA.Y100) * 0.5;

// geometry
const GRID = 40;
const TREAT = { x: 300, y: 330 };
const CTRL = { x: 1260, y: 330 };
const POOL = { x: 800, y: 390 };
const GATE_X = 1180;
const MINI = { s: 16, tx: 1420, ty: 330, cx: 1420, cy: 560 };
const D_CTRL = { x: 240, y: 300 };
const GRP_A = { x: 220, y: 290 };
const GRP_B = { x: 220, y: 610 };
const BAR = { x0: 640, pxPerMonth: 78, hA: 64, hB: 64, yA: 350, yB: 670 };

const seat = (o: { x: number; y: number }, i: number, cols = 10, g = GRID) => ({ x: o.x + (i % cols) * g, y: o.y + Math.floor(i / cols) * g });

type Fig = Cue & { value: number; decimals: number; durMs: number };

export const CrossoverField: React.FC<{
  from: number;
  to: number;
  title: { line: string; emphasize?: string };
  labels: { treat: string; control: string; pool: string; itt: string; gate: string };
  crossed: Fig & { line: string; crossWord?: string; crossMs?: number };
  itt: Cue;
  chart: Cue & { title: string; xLabel: string; note: string; medianLabel: string; unitLabel: string; legendTreat: string; legendCtrl: string };
  os: [Fig, Fig];
  verdict: Cue & { label: string };
  attrib: { line: string; word?: string; ms?: number; pulseWord?: string; pulseMs?: number };
  subset: { line: string; word?: string; ms?: number; sortWord?: string; sortMs?: number };
  groups: [Fig & { label: string; labelWord?: string; labelMs?: number }, Fig & { label: string; labelWord?: string; labelMs?: number }];
  unit: string;
}> = ({ from, to, title, labels, crossed, itt, chart, os, verdict, attrib, subset, groups, unit }) => {
  const ms = useMs();
  const acc = useAccent();
  const white = COLORS.paper;
  const dim = "rgba(255,255,255,0.32)";
  const vis = clamp01(interpolate(ms, [from, from + 300, to - 360, to], [0, 1, 1, 0], CLAMP));

  // ── onsets ──
  const tTitle = cue(title.line.split(" ")[0], from + 1700, from);
  const tCount = Math.max(tTitle + 1000, at(crossed, tTitle + 3400, tTitle));
  const tCross = Math.max(tCount + crossed.durMs, crossed.crossMs ?? cue(crossed.crossWord, tCount + 2100, tCount));
  const tBack = Math.max(tCross + 1400, at(itt, tCross + 2300, tCross));
  const tFold = Math.max(tBack + 1400, (chart.ms ?? cue(chart.word, tBack + 2300, tBack)) - 400);
  const tDraw = tFold + 400;
  const tO1 = Math.max(tDraw + 700, at(os[0], tDraw + 1400, tDraw));
  const tO2 = Math.max(tO1 + os[0].durMs, at(os[1], tO1 + 2800, tO1));
  const tVer = Math.max(tO2 + 800, at(verdict, tO2 + 2700, tO2));
  const tAtt = Math.max(tVer + 1200, at(attrib, tVer + 3200, tVer));
  const tUnfold = tAtt - 700;
  const tPulse = Math.max(tAtt, attrib.pulseMs ?? cue(attrib.pulseWord, tAtt + 1200, tAtt));
  const tSubL = Math.max(tPulse + 400, at(subset, tPulse + 1200, tPulse));
  const tSort = Math.max(tSubL + 200, subset.sortMs ?? cue(subset.sortWord, tSubL + 900, tSubL));
  const tLabA = Math.max(tSort + 400, groups[0].labelMs ?? cue(groups[0].labelWord, tSort + 1100, tSort));
  const tGA = Math.max(tLabA + 300, at(groups[0], tLabA + 1700, tLabA));
  const tLabB = Math.max(tGA + groups[0].durMs, groups[1].labelMs ?? cue(groups[1].labelWord, tGA + 2700, tGA));
  const tGB = Math.max(tGA + groups[0].durMs, at(groups[1], tGA + 1800, tGA));

  // ── which control dots crossed: the first N of a hash-shuffle (scattered) ──
  const N = Math.round(crossed.value);
  const order = React.useMemo(() => Array.from({ length: 100 }, (_, i) => i).sort((a, b) => hash(a) - hash(b)), []);
  const rank = React.useMemo(() => {
    const r = new Array(100).fill(-1);
    order.slice(0, N).forEach((d, k) => (r[d] = k));
    return r;
  }, [order, N]);
  // group seats for the sort: crossed dots in rank order, the rest in index order
  const restIdx = React.useMemo(() => Array.from({ length: 100 }, (_, i) => i).filter((i) => rank[i] < 0), [rank]);

  // ── phase envelopes ──
  const fieldsIn = EASE(kf(ms, tTitle, 900));
  const cntU = EASE(kf(ms, tCount, crossed.durMs));
  const lit = Math.floor(cntU * N + 1e-6);
  const fold = EASE_IO(kf(ms, tFold, 700));
  const unfold = EASE_IO(kf(ms, tUnfold, 700));
  const gateP = EASE(kf(ms, tCross - 200, 400)) * (1 - fold);
  const chartOn = fold * (1 - kf(ms, tUnfold - 500, 500));
  const draw = EASE_IO(kf(ms, tDraw, 1500));
  const verP = kf(ms, tVer, 150);
  const verS = interpolate(ms, [tVer, tVer + 300], [1.2, 1], { ...CLAMP, easing: EASE });
  const bump = ms > tVer + 120 ? 7 * Math.exp(-7 * ((ms - tVer - 120) / 1000)) * Math.sin(18 * ((ms - tVer - 120) / 1000)) : 0;
  const pulse = ms > tPulse ? 0.5 + 0.5 * Math.cos(((ms - tPulse) / 1000) * 7) : 1;
  const pulseAmp = kf(ms, tPulse, 200) * (1 - kf(ms, tSort, 300));

  const controlDot = (i: number) => {
    const r = rank[i];
    const home = seat(CTRL, i);
    let p = { ...home };
    let red = false;
    // cross + back
    if (r >= 0) {
      const u = kf(ms, tCross + r * 18, 650);
      const pool = seat(POOL, r, 9);
      if (u > 0) {
        const e = EASE_IO(u);
        p = { x: lerp(home.x, pool.x, e), y: lerp(home.y, pool.y, e) - Math.sin(Math.PI * e) * 150 };
        red = p.x < GATE_X;
      }
      const b = kf(ms, tBack + r * 8, 560);
      if (b > 0) {
        const e = BACK(b);
        p = { x: lerp(pool.x, home.x, e), y: lerp(pool.y, home.y, e) + Math.sin(Math.PI * b) * 90 };
        red = true;
      }
    }
    // fold → mini legend → unfold to the D seat → sort into a group
    const mini = seat({ x: MINI.cx, y: MINI.cy }, i, 10, MINI.s);
    p = { x: lerp(p.x, mini.x, fold), y: lerp(p.y, mini.y, fold) };
    const dSeat = seat(D_CTRL, i);
    if (unfold > 0) p = { x: lerp(mini.x, dSeat.x, unfold), y: lerp(mini.y, dSeat.y, unfold) };
    const gIdx = r >= 0 ? r : restIdx.indexOf(i);
    const gSeat = seat(r >= 0 ? GRP_A : GRP_B, gIdx, 9);
    const s = EASE_IO(kf(ms, tSort + (gIdx % 9) * 25 + Math.floor(gIdx / 9) * 30, 620));
    if (s > 0) p = { x: lerp(dSeat.x, gSeat.x, s), y: lerp(dSeat.y, gSeat.y, s) - Math.sin(Math.PI * s) * 40 };
    const rad = lerp(13, 6, fold * (1 - unfold));
    const litNow = r >= 0 && r < lit;
    return { p, red, litNow, rad, r };
  };

  const treatDot = (i: number) => {
    const home = seat(TREAT, i);
    const mini = seat({ x: MINI.tx, y: MINI.ty }, i, 10, MINI.s);
    return { p: { x: lerp(home.x, mini.x, fold), y: lerp(home.y, mini.y, fold) }, rad: lerp(13, 6, fold), o: 1 - unfold };
  };

  // dots appear in bloom order (centre-out) on the title
  const bloom = (i: number) => {
    const c = i % 10;
    const rr = Math.floor(i / 10);
    const d = Math.hypot(c - 4.5, rr - 4.5) / 6.4;
    return kf(ms, tTitle + d * 700, 260);
  };

  // chart plumbs
  const plumb = (t: number) => {
    const u = kf(ms, t, 320);
    const s = (ms - t - 320) / 1000;
    return { on: ms >= t, len: (ARENA.Y0 - y50) * u * u, bob: s > 0 ? 12 * Math.exp(-6 * s) * Math.abs(Math.sin(14 * s)) : 0, ring: kf(ms, t, 600) };
  };
  const P1 = plumb(tO1);
  const P2 = plumb(tO2);
  const count = (f: Fig, t: number) => (EASE(kf(ms, t, f.durMs)) * f.value).toFixed(f.decimals);

  // narration band (cross-fades between the lines of the section)
  const nA = 1 - kf(ms, tCount - 350, 300);
  const nB = kf(ms, tCount - 150, 200) * (1 - kf(ms, tBack - 300, 300));
  const nC = kf(ms, tAtt - 100, 200) * (1 - kf(ms, tSubL - 300, 250));
  const nD = kf(ms, tSubL - 100, 200) * (1 - kf(ms, tSort + 900, 400));

  // bars
  const barA = EASE(kf(ms, tGA, groups[0].durMs)) * groups[0].value * BAR.pxPerMonth;
  const barB = EASE(kf(ms, tGB, groups[1].durMs)) * groups[1].value * BAR.pxPerMonth;

  const lab = (o: number): React.CSSProperties => ({ fontFamily: SANS, fontWeight: 700, fontSize: TYPE.label, letterSpacing: TRACK.nav, color: INK_SUB, opacity: o });

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {/* narration band */}
      <div style={{ position: "absolute", left: 96, right: 96, top: 90 }}>
        <div style={{ position: "absolute", left: 0, right: 0, opacity: nA }}>
          <FlowLine from={from} to={tCount} line={title.line} size={64} color={white} restColor={INK_SUB} restWeight={400} emphasize={title.emphasize} empColor={white} />
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, opacity: nB }}>
          <FlowLine from={tCount - 100} to={tBack} line={crossed.line} size={64} color={white} restColor={INK_SUB} restWeight={400} emphasize="crossed over" empColor={white} />
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, opacity: nC }}>
          <FlowLine from={tAtt - 100} to={tSubL} line={attrib.line} size={64} color={white} restColor={INK_SUB} restWeight={400} emphasize="the crossover." empColor={white} />
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, opacity: nD }}>
          <FlowLine from={tSubL - 100} to={tSort + 1200} line={subset.line} size={64} color={white} restColor={INK_SUB} restWeight={400} emphasize="a subset:" empColor={white} />
        </div>
      </div>

      {/* 54% counter over the control field */}
      <div style={{ position: "absolute", left: CTRL.x - 20, width: 400, top: 196, textAlign: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: 104, lineHeight: 1, letterSpacing: TRACK.display, color: white, fontVariantNumeric: "tabular-nums", opacity: kf(ms, tCount - 60, 160) * (1 - kf(ms, tBack - 300, 300)) }}>
        {Math.round(cntU * crossed.value)}%
      </div>

      <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {/* the gate */}
        {gateP > 0 ? (
          <g opacity={gateP}>
            <line x1={GATE_X} x2={GATE_X} y1={690 - 340 * gateP} y2={690} stroke={white} strokeWidth={4} />
            <polygon points={`${GATE_X - 22},${512} ${GATE_X - 46},${498} ${GATE_X - 46},${526}`} fill={white} />
          </g>
        ) : null}

        {/* chart */}
        {chartOn > 0 ? (
          <g opacity={chartOn} transform={`translate(0 ${bump})`}>
            <line x1={ARENA.X0} x2={ARENA.X0} y1={ARENA.Y0} y2={ARENA.Y100 - 20} stroke={white} strokeWidth={4} />
            <line x1={ARENA.X0} x2={ARENA.X1 + 20} y1={ARENA.Y0} y2={ARENA.Y0} stroke={white} strokeWidth={4} />
            <defs>
              <clipPath id="xo-draw"><rect x={ARENA.X0 - 10} y={0} width={(ARENA.X1 - ARENA.X0 + 20) * draw} height={H} /></clipPath>
            </defs>
            <g clipPath="url(#xo-draw)" fill="none">
              <path d={kmPath(os[1].value)} stroke="rgba(255,255,255,0.5)" strokeWidth={7} />
              <path d={kmPath(os[0].value)} stroke={acc} strokeWidth={8} />
            </g>
            <line x1={ARENA.X0} x2={ARENA.X0 + (ARENA.X1 - ARENA.X0) * EASE(kf(ms, tO1 - 500, 500))} y1={y50} y2={y50} stroke="rgba(255,255,255,0.45)" strokeWidth={2} />
            {[{ P: P1, m: os[0].value, c: acc }, { P: P2, m: os[1].value, c: white }].map(({ P, m, c }, i) =>
              P.on ? (
                <g key={i}>
                  <line x1={xM(m)} x2={xM(m)} y1={y50} y2={y50 + P.len} stroke={c} strokeWidth={4} />
                  <rect x={xM(m) - 8} y={y50 + P.len - 8 - P.bob} width={16} height={16} fill={c} />
                  <circle cx={xM(m)} cy={y50} r={10} fill={c} />
                  {P.ring < 1 ? <circle cx={xM(m)} cy={y50} r={12 + P.ring * 60} fill="none" stroke={c} strokeWidth={5 * (1 - P.ring)} opacity={1 - P.ring} /> : null}
                </g>
              ) : null
            )}
          </g>
        ) : null}

        {/* treatment dots */}
        {Array.from({ length: 100 }, (_, i) => {
          const d = treatDot(i);
          const b = bloom(i);
          if (b <= 0 || d.o <= 0) return null;
          return <circle key={`t${i}`} cx={d.p.x} cy={d.p.y} r={d.rad * b} fill={acc} opacity={d.o} />;
        })}
        {/* control dots */}
        {Array.from({ length: 100 }, (_, i) => {
          const d = controlDot(i);
          const b = bloom(i);
          if (b <= 0) return null;
          const sortedCrossed = d.r >= 0 && ms > tCross;
          const glow = d.red && pulseAmp > 0 ? 1 + 0.35 * pulse * pulseAmp : 1;
          if (d.red || sortedCrossed && ms > tBack) {
            return (
              <g key={`c${i}`}>
                <circle cx={d.p.x} cy={d.p.y} r={d.rad * b * glow} fill={acc} />
                <circle cx={d.p.x} cy={d.p.y} r={d.rad * 0.36 * b} fill={white} />
              </g>
            );
          }
          return <circle key={`c${i}`} cx={d.p.x} cy={d.p.y} r={d.rad * b} fill={d.litNow ? white : dim} />;
        })}

        {/* bars (the subset) */}
        {barA > 0 ? <rect x={BAR.x0} y={BAR.yA} width={barA} height={BAR.hA} fill={acc} /> : null}
        {barB > 0 ? <rect x={BAR.x0} y={BAR.yB} width={barB} height={BAR.hB} fill="rgba(255,255,255,0.4)" /> : null}
      </svg>

      {/* field labels (phase 1-3) */}
      <div style={{ position: "absolute", left: TREAT.x - 13, top: 720, ...lab(fieldsIn * (1 - fold)) }}>{labels.treat}</div>
      <div style={{ position: "absolute", left: CTRL.x - 13, top: 720, ...lab(fieldsIn * (1 - fold)) }}>{labels.control}</div>
      <div style={{ position: "absolute", left: POOL.x - 13, top: 630, ...lab(kf(ms, tCross + 300, 300) * (1 - kf(ms, tBack, 300))) }}>{labels.pool}</div>
      <div style={{ position: "absolute", left: GATE_X - 200, width: 400, top: 305, textAlign: "center", ...lab(gateP) }}>{labels.gate}</div>
      <div style={{ position: "absolute", left: CTRL.x - 13, top: 770, fontFamily: SANS, fontWeight: 700, fontSize: 34, letterSpacing: TRACK.nav, color: white, opacity: kf(ms, tBack + 500, 300) * (1 - fold) }}>{labels.itt}</div>

      {/* chart labels */}
      <div style={{ position: "absolute", left: ARENA.X0, top: 160, fontFamily: DISPLAY, fontWeight: 700, fontSize: 44, letterSpacing: TRACK.headline, color: white, opacity: chartOn }}>{chart.title}</div>
      <div style={{ position: "absolute", left: ARENA.X1 - 300, width: 320, top: ARENA.Y0 + 14, textAlign: "right", ...lab(chartOn) }}>{chart.xLabel}</div>
      <div style={{ position: "absolute", left: MINI.tx - 6, top: MINI.ty + 162, ...lab(chartOn), color: white }}>{chart.legendTreat}</div>
      <div style={{ position: "absolute", left: MINI.cx - 6, top: MINI.cy + 162, ...lab(chartOn), color: white }}>{chart.legendCtrl}</div>
      <div style={{ position: "absolute", left: MINI.tx, top: 880, width: 480, fontFamily: SANS, fontWeight: 400, fontSize: TYPE.labelSm, letterSpacing: TRACK.nav, color: INK_SUB, opacity: chartOn * draw }}>{chart.note}</div>
      <div style={{ position: "absolute", left: ARENA.X0, top: ARENA.Y0 + 104, ...lab(chartOn * kf(ms, tO1 + 400, 300)) }}>{chart.unitLabel}</div>
      {/* the two OS medians: ~40px apart, so they read outward from their plumbs */}
      <div style={{ position: "absolute", right: W - xM(os[0].value) + 14, top: ARENA.Y0 + 22, fontFamily: DISPLAY, fontWeight: 700, fontSize: 64, letterSpacing: TRACK.display, color: acc, fontVariantNumeric: "tabular-nums", opacity: chartOn * kf(ms, tO1 - 60, 160) }}>{count(os[0], tO1)}</div>
      <div style={{ position: "absolute", left: xM(os[1].value) + 14, top: ARENA.Y0 + 22, fontFamily: DISPLAY, fontWeight: 700, fontSize: 64, letterSpacing: TRACK.display, color: white, fontVariantNumeric: "tabular-nums", opacity: chartOn * kf(ms, tO2 - 60, 160) }}>{count(os[1], tO2)}</div>
      <div style={{ position: "absolute", left: ARENA.X1 + 16, top: y50 - 18, ...lab(chartOn * kf(ms, tO1 - 500, 400)) }}>{chart.medianLabel}</div>
      <div style={{ position: "absolute", left: 640, top: 250, opacity: verP * chartOn, transform: `scale(${verS})`, transformOrigin: "left center", fontFamily: DISPLAY, fontWeight: 700, fontSize: 64, letterSpacing: TRACK.headline, color: white }}>{verdict.label}</div>

      {/* the subset: group labels + figures */}
      <div style={{ position: "absolute", left: BAR.x0, top: BAR.yA - 50, ...lab(kf(ms, tLabA, 250)), color: white }}>{groups[0].label}</div>
      <div style={{ position: "absolute", left: BAR.x0, top: BAR.yB - 50, ...lab(kf(ms, tLabB, 250)), color: white }}>{groups[1].label}</div>
      <div style={{ position: "absolute", left: BAR.x0 + barA + 22, top: BAR.yA - 8, fontFamily: DISPLAY, fontWeight: 700, fontSize: 72, letterSpacing: TRACK.display, color: white, fontVariantNumeric: "tabular-nums", opacity: kf(ms, tGA - 60, 160) }}>{count(groups[0], tGA)}</div>
      <div style={{ position: "absolute", left: BAR.x0 + barB + 22, top: BAR.yB - 8, fontFamily: DISPLAY, fontWeight: 700, fontSize: 72, letterSpacing: TRACK.display, color: white, fontVariantNumeric: "tabular-nums", opacity: kf(ms, tGB - 60, 160) }}>{count(groups[1], tGB)}</div>
      <div style={{ position: "absolute", left: BAR.x0, top: 800, ...lab(kf(ms, tGA + 400, 300)) }}>{unit}</div>
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// NotRandomized — the red punch
// ══════════════════════════════════════════════════════════════════════════
export const NotRandomized: React.FC<{
  from: number;
  to: number;
  lead: string;
  line: string;
  scramble: string;
}> = ({ from, to, lead, line, scramble }) => {
  const ms = useMs();
  const inkSub = useInkSub();
  const white = COLORS.paper;
  const vis = clamp01(interpolate(ms, [from, from + 200, to - 300, to], [0, 1, 1, 0], CLAMP));
  const toks = line.split(/\s+/);
  const sIdx = toks.findIndex((t) => t.toLowerCase().replace(/[^a-z]/g, "") === scramble.toLowerCase());
  const t0 = cue(toks.slice(0, 2).join(" "), from + 1500, from);
  const seq = cueSeq(toks, t0 - 50, to);
  const at1 = seq.map((m, i) => m ?? t0 + i * 250);
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <div style={{ position: "absolute", left: 140, top: 250, width: 1640 }}>
        <FlowLine from={from} to={to} line={lead} size={84} color={inkSub} weight={400} />
        <div style={{ marginTop: 34, fontFamily: DISPLAY, fontSize: 132, fontWeight: 700, lineHeight: 1.04, letterSpacing: TRACK.display, color: white }}>
          {toks.map((t, i) => {
            const on = at1[i];
            if (i !== sIdx) {
              const p = kf(ms, on, 130);
              return <span key={i} style={{ display: "inline-block", marginRight: "0.24em", opacity: p, transform: `translateY(${(1 - p) * 16}px)` }}>{t}</span>;
            }
            return (
              <span key={i} style={{ display: "inline-block", marginRight: "0.24em", whiteSpace: "nowrap" }}>
                {t.split("").map((c, k) => {
                  const d = kf(ms, on + k * 22, 520);
                  const e = EASE(d);
                  const ox = (hash(k + 7) - 0.5) * 900;
                  const oy = (hash(k + 31) - 0.5) * 520;
                  const rot = (hash(k + 53) - 0.5) * 140;
                  return <span key={k} style={{ display: "inline-block", opacity: clamp01(d * 4), transform: `translate(${ox * (1 - e)}px, ${oy * (1 - e)}px) rotate(${rot * (1 - e)}deg)` }}>{c}</span>;
                })}
              </span>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
