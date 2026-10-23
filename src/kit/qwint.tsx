// ─────────────────────────────────────────────────────────────────────────
// KIT · qwint — the evidence section of the Onswik horizontal long-form,
// 2026-09-27. 1920×1080. Two blocks:
//
//   QwintBoard — ink. THE SECTION SPINE (~47s). The trial name falls in letter by
//                letter; a Phase track fills to 3; four trial LANES draw, each a
//                run of WEEKS (the recurring object): the daily arm carries seven
//                grey marks a week, the weekly arm one red mark. "3,400 adults"
//                counts while a stream of people pours out of the figure and
//                splits into the four lanes. "In each one" sweeps the daily marks
//                in, "weekly Onswik" pops the red ones, "met its primary endpoint"
//                ticks four gates. "Non-inferior" = a margin band dropping behind
//                the daily reference, the weekly marker sliding in and settling
//                INSIDE it. Then the zoom: three lanes fall off the frame, the
//                named trial rises to a header, a journal card flies in, and A1C
//                FALLS as two weighted balls dropping to their depths (depth = the
//                counted figure). Hypoglycaemia: two orbs slide to their rates in
//                clouds of uncertainty (schematic), a gap bracket draws, and on
//                "separate" they PULL APART on an elastic that snaps them back on
//                "chance" — the bracket crumbles into noise.
//   FirmLine   — red. A nib draws a firm vertical line down the frame on "draws";
//                the pen pushes at it on "should not be used" and is REPELLED
//                (sparks, damped recoil); "type 1 diabetes" stands on the far side;
//                a glucose trace plunges on "severe hypoglycemia".
// Every onset takes a cue word + an ms override.
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, interpolate, Easing } from "remotion";
import { CLAMP, clamp01, COLORS, cue, DISPLAY, SANS, TRACK, useMs, useAccent, useInkSub, INK_SUB } from "./core";
import { FlowLine } from "./flowline";
import { InsulinPen } from "./weekly";
import { TYPE } from "../style";

const EASE = Easing.out(Easing.cubic);
const EASE_IN = Easing.in(Easing.cubic);
const EASE_IO = Easing.inOut(Easing.cubic);
const W = 1920;
const H = 1080;

type Win = { from: number; to: number };
type Cue = { word?: string; ms?: number };
const at = (c: Cue | undefined, fb: number, after: number) => c?.ms ?? cue(c?.word, fb, after);
const kf = (ms: number, a: number, d: number) => clamp01(interpolate(ms, [a, a + d], [0, 1], CLAMP));
const damp = (s: number, k = 4.5, w = 9) => (s < 0 ? 0 : Math.exp(-k * s) * Math.cos(w * s));
const hash = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
/** deterministic standard-normal-ish sample from two hashes */
const gauss = (i: number) => {
  const u = Math.max(1e-4, hash(i));
  const v = hash(i + 7777);
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
};
const useVis = (from: number, to: number, padIn = 300, padOut = 360) => {
  const ms = useMs();
  return clamp01(interpolate(ms, [from, from + padIn, to - padOut, to], [0, 1, 1, 0], CLAMP));
};
const lab = (color: string, size = TYPE.label): React.CSSProperties => ({ fontFamily: SANS, fontWeight: 700, fontSize: size, letterSpacing: TRACK.nav, color, whiteSpace: "nowrap" });

type Sentence = { line: string; emphasize?: string } & Cue;

export const QWINT = { lx0: 520, lx1: 1780, laneY: [270, 390, 510, 630], arm: 20, weeks: 18 };

// ══════════════════════════════════════════════════════════════════════════
// QwintBoard — the §3 spine (ink)
// ══════════════════════════════════════════════════════════════════════════
export const QwintBoard: React.FC<Win & {
  name: string; // "QWINT"
  lines: [Sentence, Sentence, Sentence, Sentence];
  cues: {
    name: Cue; phase: Cue; phaseFill: Cue; lanes: Cue; more: Cue; count: Cue;
    each: Cue; weekly: Cue; met: Cue; gates: Cue; a1c: Cue; ni: Cue;
    zoom: Cue; journal: Cue; fell: Cue; figA: Cue; ptsA: Cue; nameA: Cue; figB: Cue; nameB: Cue;
    hypo: Cue; rateA: Cue; perPY: Cue; rateB: Cue; gap: Cue; separate: Cue; chance: Cue;
  };
  count: { value: number; pre: string; post: string };
  legend: { weekly: string; daily: string };
  zoomLane: number;
  zoomTag: string;
  journal: string[];
  a1c: { a: { name: string; value: number }; b: { name: string; value: number }; unit: string };
  hypo: { a: number; b: number; unit: string; gapLabel: string; note: string };
  ni: { label: string; ref: string; test: string; worse: string };
}> = ({ from, to, name, lines, cues: c, count, legend, zoomLane, zoomTag, journal, a1c, hypo, ni }) => {
  const ms = useMs();
  const vis = useVis(from, to, 300, 300);
  const acc = useAccent();
  const white = COLORS.paper;
  const { lx0, lx1, laneY, arm, weeks } = QWINT;

  // ── cue times (each floored on the previous, so a miss can never run backwards) ──
  const T: Record<string, number> = {};
  let prev = from;
  const order: [keyof typeof c, number][] = [
    ["name", 2000], ["phase", 600], ["phaseFill", 800], ["lanes", 1500], ["more", 1900], ["count", 700],
    ["each", 2300], ["weekly", 1000], ["met", 700], ["gates", 500], ["a1c", 1600], ["ni", 2000],
    ["zoom", 4400], ["journal", 2600], ["fell", 2500], ["figA", 400], ["ptsA", 1300], ["nameA", 2000], ["figB", 1700], ["nameB", 1300],
    ["hypo", 1300], ["rateA", 3300], ["perPY", 1400], ["rateB", 2000], ["gap", 1700], ["separate", 1700], ["chance", 800],
  ];
  for (const [k, fb] of order) {
    const t = Math.max(prev + 60, at(c[k], prev + fb, prev));
    T[k] = t;
    prev = t;
  }

  // ── phase windows ──
  const topOut = kf(ms, T.zoom - 200, 400); // header band + legend + margin retire at the zoom
  const cOut = kf(ms, T.hypo - 350, 450); // the A1C stage lifts away for the hypo stage

  // ── header: the name falls in letter by letter, then shrinks to a kicker ──
  const letters = name.split("");
  const shrink = EASE_IO(kf(ms, T.lanes - 300, 600));
  const nameSize = interpolate(shrink, [0, 1], [150, 64]);
  const nameY = interpolate(shrink, [0, 1], [330, 92]);

  // phase track
  const phaseOn = kf(ms, T.phase, 300);
  const phaseFill = EASE_IO(kf(ms, T.phase + 100, Math.max(400, T.phaseFill - T.phase + 200)));

  // lanes
  const segW = (lx1 - lx0) / weeks;
  const laneDraw = laneY.map((_, i) => EASE_IO(kf(ms, T.lanes + i * 140, 700)));
  const zoomU = EASE_IO(kf(ms, T.zoom, 800));
  const laneFall = laneY.map((_, i) => (i === zoomLane ? 0 : kf(ms, T.zoom + 60 + Math.abs(i - zoomLane) * 90, 700)));
  const laneYAt = (i: number) => (i === zoomLane ? interpolate(zoomU, [0, 1], [laneY[i], 160]) : laneY[i] + 1300 * laneFall[i] * laneFall[i]);
  const laneRot = (i: number) => (i === zoomLane ? 0 : (i < zoomLane ? -1 : 1) * 14 * laneFall[i]);

  // count + stream
  const countOn = kf(ms, T.more, 250);
  const countU = EASE(kf(ms, T.count, Math.max(600, T.each - T.count - 1300)));
  const countVal = Math.round(countU * count.value);
  const streamOn = kf(ms, T.count, 300) * (1 - kf(ms, T.each + 200, 600));

  // sweeps
  const dailySweep = (i: number) => EASE_IO(kf(ms, T.each + i * 170, 1300));
  const weeklySweep = (i: number) => EASE(kf(ms, T.weekly + i * 110, 700));
  const gate = (i: number) => kf(ms, T.gates + i * 170, 240);

  // margin diagram (bottom right)
  const mOn = kf(ms, T.a1c, 400) * (1 - topOut);
  const band = drop1(ms, T.ni, 180, 360);
  const mk = kf(ms, T.ni + 250, 900);
  const MX = { x0: 1210, x1: 1790, y: 868, ref: 1380, bandW: 190 };
  const mkX = MX.x1 - 10 + (MX.ref + MX.bandW * 0.45 - (MX.x1 - 10)) * EASE(mk) + (mk >= 1 ? 0 : 0) - 16 * damp((ms - T.ni - 1150) / 1000, 5, 14) * (ms > T.ni + 1150 ? 1 : 0);

  // ── phase C: A1C falls ──
  const cIn = kf(ms, T.fell - 500, 400) * (1 - cOut);
  const BL = { y: 372, x0: 660, x1: 1330, ax: 820, bx: 1170, scale: 250, r: 30 };
  const fallDepth = (tStart: number, v: number, dur: number) => {
    const u = clamp01((ms - tStart) / dur);
    const s = (ms - tStart - dur) / 1000;
    const settle = s > 0 ? -12 * damp(s, 6, 16) : 0;
    return v * BL.scale * EASE(u) + settle;
  };
  const depA = fallDepth(T.fell, a1c.a.value, Math.max(900, T.ptsA - T.fell + 200));
  const depB = fallDepth(T.figB, a1c.b.value, Math.max(900, T.nameB - T.figB));
  const valA = a1c.a.value * EASE(kf(ms, T.figA, Math.max(500, T.ptsA - T.figA)));
  const valB = a1c.b.value * EASE(kf(ms, T.figB, Math.max(500, T.nameB - T.figB)));
  const jU = EASE(kf(ms, T.journal, 650));
  const jS = (ms - T.journal - 650) / 1000;

  // ── phase D: hypo ──
  const dIn = kf(ms, T.hypo, 450);
  const AX = { x0: 480, x1: 1760, y: 540, per: 1700 };
  const rx = (v: number) => AX.x0 + v * AX.per;
  const slideA = EASE(kf(ms, T.rateA, Math.max(700, T.perPY - T.rateA)));
  const slideB = EASE(kf(ms, T.rateB, 900));
  const pull = EASE_IO(kf(ms, T.separate, Math.max(400, T.chance - T.separate)));
  const sSnap = (ms - T.chance) / 1000;
  const snap = ms < T.chance ? pull : damp(sSnap, 3.2, 11);
  const PULL = 150;
  const ax = rx(hypo.a * slideA) + PULL * snap;
  const bx = rx(hypo.b * slideB) - PULL * snap;
  const gapOn = kf(ms, T.gap, 400);
  const crumble = kf(ms, T.chance, 900);
  const tSec = ms / 1000;

  // narration seats
  const sent = (i: number) => lines[i];
  const tS = [at(lines[0], T.name - 1500, from), T.each - 20, T.zoom - 20, T.hypo - 20];
  const tE = [T.each, T.zoom, T.hypo, to];
  const lineOp = (i: number) => kf(ms, tS[i] - 150, 200) * (1 - kf(ms, tE[i] - 220, 220));
  const narrW = [1000, 1000, 1700, 1700];

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {/* ── header: name + phase track + legend ─────────────────── */}
      <div style={{ position: "absolute", left: 110, top: nameY - nameSize * 0.8, display: "flex", opacity: 1 - topOut }}>
        {letters.map((ch, i) => {
          const t0 = T.name + i * 70;
          const u = kf(ms, t0 - 220, 220);
          const sL = (ms - t0) / 1000;
          const dy = ms < t0 ? -400 * (1 - EASE_IN(u)) : -18 * Math.max(0, damp(sL, 8, 20));
          return (
            <span key={i} style={{ display: "inline-block", fontFamily: DISPLAY, fontWeight: 700, fontSize: nameSize, lineHeight: 1, letterSpacing: TRACK.display, color: white, opacity: u, transform: `translateY(${dy}px)` }}>{ch}</span>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 110 + nameSize * 3.6 + 40, top: nameY - 36, display: "flex", alignItems: "center", gap: 18, opacity: phaseOn * (1 - topOut) }}>
        <svg width={260} height={40} style={{ overflow: "visible" }}>
          <line x1={14} x2={246} y1={20} y2={20} stroke="rgba(255,255,255,0.25)" strokeWidth={4} />
          <line x1={14} x2={14 + 232 * phaseFill} y1={20} y2={20} stroke={white} strokeWidth={4} />
          {[0, 1, 2].map((k) => {
            const lit = phaseFill >= k / 2 - 0.001;
            const last = k === 2 && phaseFill >= 0.999;
            return <circle key={k} cx={14 + k * 116} cy={20} r={last ? 14 : 10} fill={lit ? white : COLORS.ink} stroke={white} strokeWidth={3} />;
          })}
        </svg>
        <span style={{ ...lab(white, 34), opacity: kf(ms, T.phaseFill, 200) }}>Phase 3</span>
      </div>
      <div style={{ position: "absolute", right: 140, top: 66, display: "flex", flexDirection: "column", gap: 10, opacity: kf(ms, T.each, 300) * (1 - topOut) }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, opacity: kf(ms, T.weekly, 250) }}>
          <span style={{ width: 14, height: 14, borderRadius: 7, background: acc }} />
          <span style={lab(white)}>{legend.weekly}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ display: "flex", gap: 4 }}>{[0, 1, 2, 3, 4, 5, 6].map((k) => <span key={k} style={{ width: 5, height: 5, borderRadius: 3, background: INK_SUB }} />)}</span>
          <span style={lab(INK_SUB)}>{legend.daily}</span>
        </div>
      </div>

      {/* ── the count ─────────────────────────────────────────────── */}
      <div style={{ position: "absolute", left: 110, top: 360, opacity: countOn * (1 - kf(ms, T.zoom - 200, 300)) }}>
        <div style={lab(INK_SUB)}>{count.pre}</div>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 104, lineHeight: 1.02, letterSpacing: TRACK.display, color: white, fontVariantNumeric: "tabular-nums", opacity: kf(ms, T.count - 60, 200) }}>
          {countVal.toLocaleString("en-US")}
        </div>
        <div style={{ ...lab(INK_SUB), opacity: kf(ms, T.count + 900, 250) }}>{count.post}</div>
      </div>

      <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {/* stream of people → the four lanes */}
        {streamOn > 0
          ? Array.from({ length: 170 }, (_, i) => {
              const k = i % 4;
              const u = ((ms - T.count) / 1100 + hash(i)) % 1;
              if (ms < T.count + hash(i) * 400) return null;
              const p0 = { x: 400, y: 440 + (hash(i + 3) - 0.5) * 60 };
              const p2 = { x: lx0 + 6, y: laneY[k] + (hash(i + 5) > 0.5 ? -arm : arm) };
              const p1 = { x: 470, y: (p0.y + p2.y) / 2 + (hash(i + 11) - 0.5) * 80 };
              const e = EASE_IO(u);
              const x = (1 - e) * (1 - e) * p0.x + 2 * (1 - e) * e * p1.x + e * e * p2.x;
              const y = (1 - e) * (1 - e) * p0.y + 2 * (1 - e) * e * p1.y + e * e * p2.y;
              return <circle key={i} cx={x} cy={y} r={2.6} fill={white} opacity={streamOn * Math.sin(Math.PI * u) * 0.9} />;
            })
          : null}

        {/* lanes */}
        {laneY.map((_, i) => {
          const y = laneYAt(i);
          const d = laneDraw[i];
          if (d <= 0) return null;
          const ds = dailySweep(i);
          const ws = weeklySweep(i);
          const g = gate(i);
          const fallOp = 1 - laneFall[i] * 0.6;
          return (
            <g key={i} transform={`rotate(${laneRot(i)} ${(lx0 + lx1) / 2} ${y})`} opacity={fallOp}>
              {/* rails */}
              <line x1={lx0} x2={lx0 + (lx1 - lx0) * d} y1={y - arm} y2={y - arm} stroke="rgba(255,255,255,0.22)" strokeWidth={2} />
              <line x1={lx0} x2={lx0 + (lx1 - lx0) * d} y1={y + arm} y2={y + arm} stroke="rgba(255,255,255,0.22)" strokeWidth={2} />
              {/* week ticks */}
              {Array.from({ length: weeks + 1 }, (_, w) => (
                w / weeks <= d ? <line key={w} x1={lx0 + w * segW} x2={lx0 + w * segW} y1={y - arm - 8} y2={y + arm + 8} stroke="rgba(255,255,255,0.14)" strokeWidth={1.5} /> : null
              ))}
              {/* daily arm: seven marks a week */}
              {Array.from({ length: weeks * 7 }, (_, j) => {
                const f = j / (weeks * 7);
                if (f > ds) return null;
                const x = lx0 + Math.floor(j / 7) * segW + 8 + (j % 7) * 8.4;
                const pop = clamp01((ds - f) * 30);
                return <circle key={j} cx={x} cy={y + arm} r={2.6 * pop} fill={INK_SUB} />;
              })}
              {/* weekly arm: one red mark a week */}
              {Array.from({ length: weeks }, (_, w) => {
                const f = w / weeks;
                if (f > ws) return null;
                const pop = clamp01((ws - f) * 14);
                const over = 1 + 0.5 * Math.max(0, 1 - (ws - f) * 8);
                return <circle key={w} cx={lx0 + w * segW + 10} cy={y - arm} r={6.5 * pop * over} fill={acc} />;
              })}
              {/* endpoint gate + tick */}
              <line x1={lx1 + 22} x2={lx1 + 22} y1={y - arm - 20} y2={y + arm + 20} stroke={white} strokeWidth={4} opacity={d >= 1 ? 0.35 + 0.65 * g : 0} />
              {g > 0 ? (
                <g transform={`translate(${lx1 + 62} ${y}) scale(${interpolate(g, [0, 1], [1.8, 1])})`} opacity={g * (1 - topOut * (i === zoomLane ? 0 : 1))}>
                  <circle r={22} fill={white} />
                  <polyline points="-10,0 -3,8 11,-8" fill="none" stroke={COLORS.ink} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
                </g>
              ) : null}
            </g>
          );
        })}

        {/* non-inferiority margin (bottom right) */}
        {mOn > 0 ? (
          <g opacity={mOn}>
            <defs>
              <pattern id="hatchNI" width="12" height="12" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                <line x1={0} x2={0} y1={0} y2={12} stroke="rgba(255,255,255,0.45)" strokeWidth={3} />
              </pattern>
            </defs>
            <line x1={MX.x0} x2={MX.x1} y1={MX.y} y2={MX.y} stroke="rgba(255,255,255,0.5)" strokeWidth={3} />
            <polyline points={`${MX.x1 - 12},${MX.y - 9} ${MX.x1},${MX.y} ${MX.x1 - 12},${MX.y + 9}`} fill="none" stroke="rgba(255,255,255,0.5)" strokeWidth={3} />
            {band.on ? (
              <rect x={MX.ref} y={MX.y - 44 + band.dy} width={MX.bandW} height={44 * band.squash} fill="url(#hatchNI)" stroke="rgba(255,255,255,0.6)" strokeWidth={2} />
            ) : null}
            <line x1={MX.ref} x2={MX.ref} y1={MX.y - 64} y2={MX.y + 10} stroke={white} strokeWidth={5} />
            {mk > 0 ? <circle cx={mkX} cy={MX.y - 22} r={15} fill={acc} opacity={mk} /> : null}
          </g>
        ) : null}

        {/* ── phase C: A1C falls ─────────────────────────────────── */}
        {cIn > 0 ? (
          <g opacity={cIn} transform={`translate(0 ${-140 * cOut})`}>
            <line x1={BL.x0} x2={BL.x1} y1={BL.y} y2={BL.y} stroke={white} strokeWidth={4} />
            {[{ x: BL.ax, dep: depA, col: acc, t: T.fell }, { x: BL.bx, dep: depB, col: white, t: T.figB }].map((b, k) => {
              const on = kf(ms, T.fell - 500 + k * 150, 300);
              const hover = ms < b.t ? -46 - 4 * Math.sin(tSec * 4 + k) : 0;
              const y = BL.y + b.dep + hover;
              const falling = ms > b.t && b.dep < (k ? a1c.b.value : a1c.a.value) * BL.scale - 2;
              return (
                <g key={k} opacity={on}>
                  <line x1={b.x} x2={b.x} y1={BL.y} y2={Math.max(BL.y, y)} stroke={b.col} strokeWidth={3} opacity={0.55} />
                  {falling
                    ? [1, 2, 3].map((q) => <circle key={q} cx={b.x} cy={y - q * 20} r={BL.r * (1 - q * 0.22)} fill={b.col} opacity={0.18 / q} />)
                    : null}
                  <circle cx={b.x} cy={y} r={BL.r} fill={b.col} />
                  <line x1={b.x + BL.r + 10} x2={BL.x1 + 60} y1={Math.max(BL.y, y)} y2={Math.max(BL.y, y)} stroke={b.col} strokeWidth={2} strokeDasharray="2 8" opacity={ms > b.t + 800 ? 0.6 : 0} />
                </g>
              );
            })}
          </g>
        ) : null}

        {/* ── phase D: hypoglycaemia ─────────────────────────────── */}
        {dIn > 0 ? (
          <g opacity={dIn}>
            <line x1={AX.x0} x2={AX.x1} y1={AX.y + 70} y2={AX.y + 70} stroke="rgba(255,255,255,0.4)" strokeWidth={3} />
            <line x1={AX.x0} x2={AX.x0} y1={AX.y + 58} y2={AX.y + 82} stroke="rgba(255,255,255,0.4)" strokeWidth={3} />
            {/* uncertainty clouds (schematic) */}
            {[{ x: ax, col: acc, on: slideA, seed: 0 }, { x: bx, col: white, on: slideB, seed: 500 }].map((o, k) => (
              <g key={k} opacity={kf(o.on * 1000, 0, 200)}>
                {Array.from({ length: 150 }, (_, j) => {
                  const gx = gauss(j + o.seed) * 95 * (1 + 0.25 * crumble);
                  const gy = gauss(j + o.seed + 3000) * 34;
                  const wob = 4 * Math.sin(tSec * (1.3 + hash(j + o.seed) * 1.7) + j);
                  return <circle key={j} cx={o.x + gx + wob} cy={AX.y + gy} r={2.2 + hash(j + o.seed + 9) * 1.6} fill={o.col} opacity={0.34} />;
                })}
                <circle cx={o.x} cy={AX.y} r={22} fill={o.col} />
                <line x1={o.x} x2={o.x} y1={AX.y + 26} y2={AX.y + 70} stroke={o.col} strokeWidth={3} />
              </g>
            ))}
            {/* the elastic between them */}
            {pull > 0 && ms < T.chance + 1400 ? (() => {
              const n = 14;
              const pts: string[] = [];
              const x0 = Math.min(ax, bx) + 24;
              const x1 = Math.max(ax, bx) - 24;
              const amp = 16 * (1 - Math.min(1, Math.abs(snap)) * 0.7) * (ms < T.chance ? 1 : Math.exp(-2 * sSnap));
              for (let q = 0; q <= n; q++) {
                const x = x0 + ((x1 - x0) * q) / n;
                const y = AX.y + (q % 2 === 0 ? 0 : q % 4 === 1 ? -amp : amp);
                pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
              }
              return <polyline points={pts.join(" ")} fill="none" stroke={white} strokeWidth={3} strokeLinejoin="round" opacity={0.85} />;
            })() : null}
            {/* the gap bracket, crumbling on "chance" */}
            {gapOn > 0 ? (() => {
              const l = Math.min(ax, bx);
              const r = Math.max(ax, bx);
              const y = AX.y - 96;
              if (crumble <= 0) {
                return (
                  <g opacity={gapOn}>
                    <polyline points={`${l},${y + 18} ${l},${y} ${l + (r - l) * EASE(gapOn)},${y}`} fill="none" stroke={white} strokeWidth={3} />
                    {gapOn >= 1 ? <line x1={r} x2={r} y1={y} y2={y + 18} stroke={white} strokeWidth={3} /> : null}
                  </g>
                );
              }
              return (
                <g>
                  {Array.from({ length: 40 }, (_, j) => {
                    const x = l + ((r - l) * j) / 39;
                    const fall = crumble * crumble * (120 + hash(j) * 160);
                    return <rect key={j} x={x + (hash(j + 1) - 0.5) * 40 * crumble} y={y + fall} width={5} height={3} fill={white} opacity={1 - crumble} />;
                  })}
                </g>
              );
            })() : null}
          </g>
        ) : null}
      </svg>

      {/* ── HTML overlays: labels for phases C + D ────────────────── */}
      {/* zoom tag */}
      <div style={{ position: "absolute", left: 110, top: 160 - 26, ...lab(white, 44), opacity: kf(ms, T.zoom + 300, 200) * (1 - cOut * 0), transform: `scale(${interpolate(ms, [T.zoom + 300, T.zoom + 600], [1.3, 1], { ...CLAMP, easing: EASE })})`, transformOrigin: "left center" }}>{zoomTag}</div>
      {/* journal card */}
      {jU > 0 && cOut < 1 ? (
        <div style={{
          position: "absolute", left: 1450, top: 250 - 140 * cOut, width: 340, padding: "26px 28px", background: white, borderRadius: 10,
          opacity: jU * (1 - cOut), transform: `translateX(${(1 - jU) * 700}px) rotate(${(1 - jU) * 24 + 2.5 * damp(jS, 4, 8)}deg)`,
          boxShadow: "0 30px 60px rgba(0,0,0,0.5)",
        }}>
          {journal.map((l, i) => <div key={i} style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 36, lineHeight: 1.08, letterSpacing: TRACK.headline, color: COLORS.ink }}>{l}</div>)}
          <div style={{ height: 3, background: COLORS.ink, margin: "16px 0 14px" }} />
          {[1, 0.86, 0.94, 0.7].map((w, i) => <div key={i} style={{ height: 8, width: `${w * 100}%`, background: "rgba(0,0,0,0.14)", marginBottom: 10, borderRadius: 2 }} />)}
        </div>
      ) : null}
      {/* A1C readouts */}
      {cIn > 0
        ? [{ x: BL.ax, v: valA, name: a1c.a.name, tName: T.nameA, tFig: T.figA, dep: depA, k: 0, col: acc },
           { x: BL.bx, v: valB, name: a1c.b.name, tName: T.nameB, tFig: T.figB, dep: depB, k: 1, col: white }].map((b) => (
            <React.Fragment key={b.k}>
              <div style={{ position: "absolute", left: b.x - 150, width: 300, top: BL.y - 116, textAlign: "center", opacity: kf(ms, b.tName, 250) * cIn, transform: `translateY(${-140 * cOut}px)`, ...lab(white, 38) }}>{b.name}</div>
              <div style={{ position: "absolute", left: b.x + 48, top: BL.y + b.dep - 50 - 140 * cOut, opacity: kf(ms, b.tFig, 150) * cIn }}>
                <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 84, lineHeight: 1, letterSpacing: TRACK.display, color: b.k === 0 ? white : white, fontVariantNumeric: "tabular-nums" }}>{b.v.toFixed(2)}</div>
                {b.k === 0 ? <div style={{ ...lab(INK_SUB), marginTop: 4, opacity: kf(ms, T.ptsA, 250) }}>{a1c.unit}</div> : null}
              </div>
            </React.Fragment>
          ))
        : null}
      {/* hypo readouts */}
      {dIn > 0 ? (
        <>
          {[{ x: ax, v: hypo.a * slideA, on: kf(ms, T.rateA, 150), name: a1c.a.name }, { x: bx, v: hypo.b * slideB, on: kf(ms, T.rateB, 150), name: a1c.b.name }].map((o, k) => (
            <React.Fragment key={k}>
              <div style={{ position: "absolute", left: o.x - 120, width: 240, top: AX.y - (k === 0 ? 304 : 220), textAlign: "center", opacity: o.on, fontFamily: DISPLAY, fontWeight: 700, fontSize: 64, lineHeight: 1, letterSpacing: TRACK.display, color: white, fontVariantNumeric: "tabular-nums" }}>{o.v.toFixed(2)}</div>
              <div style={{ position: "absolute", left: o.x - 150, width: 300, top: AX.y + 86, textAlign: "center", opacity: o.on, ...lab(INK_SUB) }}>{o.name}</div>
            </React.Fragment>
          ))}
          <div style={{ position: "absolute", left: AX.x0, top: AX.y + 132, opacity: kf(ms, T.perPY, 250), ...lab(white) }}>{hypo.unit}</div>
          <div style={{ position: "absolute", left: (ax + bx) / 2 - 100, width: 200, top: AX.y - 136, textAlign: "center", opacity: gapOn * (1 - crumble), ...lab(white) }}>{hypo.gapLabel}</div>
          <div style={{ position: "absolute", right: 140, top: AX.y + 132, opacity: dIn * 0.9, ...lab(INK_SUB, TYPE.labelSm) }}>{hypo.note}</div>
        </>
      ) : null}
      {/* margin labels */}
      {mOn > 0 ? (
        <>
          <div style={{ position: "absolute", left: MX.ref - 100, width: 200, top: MX.y + 16, textAlign: "center", opacity: mOn, ...lab(INK_SUB, TYPE.labelSm) }}>{ni.ref}</div>
          <div style={{ position: "absolute", left: MX.ref, width: MX.bandW, top: MX.y - 90, textAlign: "center", opacity: mOn * kf(ms, T.ni, 250), ...lab(white, TYPE.labelSm) }}>{ni.label}</div>
          <div style={{ position: "absolute", left: mkX - 100, width: 200, top: MX.y + 16, textAlign: "center", opacity: mOn * mk, ...lab(acc, TYPE.labelSm) }}>{ni.test}</div>
          <div style={{ position: "absolute", right: 1920 - MX.x1, top: MX.y - 44, opacity: mOn * 0.8, ...lab(INK_SUB, TYPE.labelSm) }}>{ni.worse}</div>
        </>
      ) : null}

      {/* ── narration ─────────────────────────────────────────────── */}
      {[0, 1, 2, 3].map((i) => (
        <div key={i} style={{ position: "absolute", left: 110, top: 800, width: narrW[i], opacity: lineOp(i) }}>
          <FlowLine from={tS[i] - 60} to={tE[i]} line={sent(i).line} size={44} color={white} restColor={INK_SUB} restWeight={400} emphasize={sent(i).emphasize} empColor={white} lineHeight={1.16} />
        </div>
      ))}
    </AbsoluteFill>
  );
};

/** a single gravity drop (landing at tLand) with a damped squash */
function drop1(ms: number, tLand: number, h: number, dur: number) {
  const u = clamp01((ms - (tLand - dur)) / dur);
  const s = (ms - tLand) / 1000;
  return { dy: -h * (1 - u * u), squash: s >= 0 ? 1 - 0.18 * damp(s, 7, 18) : 1, on: ms >= tLand - dur };
}

// ══════════════════════════════════════════════════════════════════════════
// FirmLine — the label's boundary (red)
// ══════════════════════════════════════════════════════════════════════════
export const FirmLine: React.FC<Win & {
  head: Sentence & { drawWord?: string; drawMs?: number; lineWord?: string; lineMs?: number };
  body: Sentence;
  push: Cue; // "should not be used"
  chip: { label: string } & Cue;
  plunge: Cue; // "severe hypoglycemia"
}> = ({ from, to, head, body, push, chip, plunge }) => {
  const ms = useMs();
  const vis = useVis(from, to, 1, 380);
  const white = COLORS.paper;
  const sub = useInkSub();

  const tHead = at(head, from + 300, from);
  const tDraw = Math.max(tHead + 200, head.drawMs ?? cue(head.drawWord, tHead + 500, tHead));
  const tLine = Math.max(tDraw + 300, head.lineMs ?? cue(head.lineWord, tDraw + 850, tDraw));
  const tBody = Math.max(tLine + 300, at(body, tLine + 900, tLine));
  const tPush = Math.max(tBody + 150, at(push, tBody + 400, tBody));
  const tChip = Math.max(tPush + 300, at(chip, tPush + 1300, tPush));
  const tPlunge = Math.max(tChip + 600, at(plunge, tChip + 3000, tChip));

  const LX = 1010;
  const y0 = 250;
  const y1 = 930;
  const draw = EASE_IO(kf(ms, tDraw, Math.max(500, tLine - tDraw)));
  const nibY = y0 + (y1 - y0) * draw;
  const sLine = (ms - tLine) / 1000;
  const thick = 12 + 6 * clamp01(sLine * 4) - 4 * Math.max(0, damp(sLine, 5, 16));
  const glow = sLine > 0 ? Math.exp(-3 * sLine) : 0;

  // the pen: slides in, pushes, is repelled
  const penOn = kf(ms, tBody - 200, 400);
  const PEN = { rest: 640, contact: LX - 10 - 330 / 2, y: 560, h: 330 }; // cap tip meets the line
  const approach = EASE_IN(kf(ms, tPush, 520));
  const tHit = tPush + 520;
  const sHit = (ms - tHit) / 1000;
  let penX = interpolate(penOn, [0, 1], [PEN.rest - 300, PEN.rest]);
  if (ms >= tPush && ms < tHit) penX = PEN.rest + (PEN.contact - PEN.rest) * approach;
  else if (ms >= tHit) penX = PEN.rest + 60 + (PEN.contact - PEN.rest - 60) * damp(sHit, 3.5, 9);
  const lineShake = sHit >= 0 ? 7 * Math.exp(-7 * sHit) * Math.sin(40 * sHit) : 0;

  // chip + glucose trace (far side)
  const chipU = kf(ms, tChip, 160);
  const chipS = interpolate(ms, [tChip, tChip + 300], [1.2, 1], { ...CLAMP, easing: EASE });
  const traceU = kf(ms, tChip + 200, 1600);
  const plungeU = EASE_IN(kf(ms, tPlunge, 700));
  const tracePts: string[] = [];
  const TX0 = 1110;
  const TX1 = 1800;
  const TY = 700;
  for (let q = 0; q <= 60; q++) {
    const f = q / 60;
    if (f > traceU) break;
    const x = TX0 + (TX1 - TX0) * f;
    let y = TY + 16 * Math.sin(f * 12 + ms / 700);
    if (f > 0.62) y += plungeU * 200 * EASE_IN(clamp01((f - 0.62) / 0.38));
    tracePts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
  }

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <div style={{ position: "absolute", left: 110, top: 96, width: 1700 }}>
        <FlowLine from={tHead - 60} to={to} line={head.line} size={96} color={white} restColor={sub} restWeight={400} emphasize={head.emphasize} empColor={white} underline={white} />
      </div>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {/* the line */}
        {draw > 0 ? (
          <g transform={`translate(${lineShake} 0)`}>
            {glow > 0 ? <line x1={LX} x2={LX} y1={y0} y2={nibY} stroke={white} strokeWidth={thick + 30 * glow} opacity={0.25 * glow} strokeLinecap="round" /> : null}
            <line x1={LX} x2={LX} y1={y0} y2={nibY} stroke={white} strokeWidth={thick} strokeLinecap="round" />
            {draw < 1 ? <rect x={LX - 14} y={nibY - 44} width={28} height={52} rx={10} fill={white} transform={`rotate(-16 ${LX} ${nibY})`} /> : null}
          </g>
        ) : null}
        {/* sparks at the push */}
        {sHit >= 0 && sHit < 0.6
          ? Array.from({ length: 14 }, (_, j) => {
              const u = sHit / 0.6;
              const a = Math.PI + (hash(j) - 0.5) * 2.2;
              const d = 20 + EASE(u) * (60 + hash(j + 4) * 90);
              return <circle key={j} cx={LX - 12 + Math.cos(a) * d} cy={PEN.y + Math.sin(a) * d} r={4 * (1 - u)} fill={white} />;
            })
          : null}
        {/* the pen, cap (needle end) toward the line */}
        {penOn > 0 ? <InsulinPen cx={penX} cy={PEN.y} h={PEN.h} rotate={90} body={white} cap={white} detail={COLORS.accent} window={COLORS.accent} opacity={penOn} /> : null}
        {/* glucose trace */}
        {tracePts.length > 1 ? <polyline points={tracePts.join(" ")} fill="none" stroke={white} strokeWidth={5} strokeLinejoin="round" strokeLinecap="round" /> : null}
      </svg>
      {/* the chip on the far side */}
      <div style={{ position: "absolute", left: 1110, top: 470, padding: "18px 30px", border: `4px solid ${white}`, borderRadius: 14, opacity: chipU, transform: `scale(${chipS})`, transformOrigin: "left center" }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 64, lineHeight: 1, letterSpacing: TRACK.headline, color: white }}>{chip.label}</div>
      </div>
      <div style={{ position: "absolute", left: 110, top: 760, width: 820 }}>
        <FlowLine from={tBody - 60} to={to} line={body.line} size={44} color={white} restColor={sub} restWeight={400} emphasize={body.emphasize} empColor={white} underline={white} lineHeight={1.16} />
      </div>
    </AbsoluteFill>
  );
};
