// ─────────────────────────────────────────────────────────────────────────
// KIT · arena — THE DATA as one section-length object (~30s, white card).
// Added on the Compass/tovecimig long-form, 2026-09-26. HORIZONTAL.
//
// For "The data come from <TRIAL>, a Phase 2/3 study. <Drug> is a bispecific
// antibody against <T1> and <T2>, given with <chemo> and compared with <chemo>
// alone. It met its primary endpoint, <endpoint>. On progression-free survival,
// the median was A months against B. A hazard ratio of H."
//
// One object that keeps TRANSFORMING (the 09-26 "transform instead of cut"):
//   A. the trial name stamps letter by letter; "Phase 2/3" is two tiles, the 3
//      slides in and BUTTS against the 2 (one seamless study, assembled); both
//      dock as the kicker in the pause;
//   B. the antibody ASSEMBLES — the stem grows, the two arms extend. Bispecific
//      is ENACTED: the left binding site is square, the right one round, so each
//      target (a square, a disc) can only dock where it fits. Each target flies
//      in on a curve with a trail and SNAPS in on its word (click ring);
//   C. the antibody shrinks and TRAVELS into the treatment arm's seat; a
//      paclitaxel hex docks beside it; the control arm gets the hex ALONE;
//   D. "met its primary endpoint": a red tick draws in a box, the endpoint flows;
//   E. the arms FOLD into the legend and a survival chart draws: two curves
//      stepping down together as "progression-free survival" is voiced; the
//      median rule draws; at each spoken median a PLUMB LINE drops from the
//      crossing under gravity and bounces on the axis, its figure counting up
//      at the foot; on "hazard ratio" the gap between the curves FILLS behind
//      a sweeping edge and the ratio counts up.
//
// ⚠️ Honesty: the curves are SCHEMATIC (exponential through the reported
// medians), no axis values are printed, and the frame says so in a note. The
// only figures on screen are the spoken ones.
// Colour: red = the drug arm, the ONE emphasis, held for the whole object.
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, interpolate, Easing } from "remotion";
import { CLAMP, clamp01, COLORS, cue, DISPLAY, SANS, TRACK, useMs, useAccent, inkA, accentA } from "./core";
import { FlowLine } from "./flowline";
import { TYPE } from "../style";

const EASE = Easing.out(Easing.cubic);
const EASE_IN = Easing.in(Easing.quad);
const EASE_IO = Easing.inOut(Easing.cubic);
const W = 1920;
const H = 1080;
type Cue = { word?: string; ms?: number };
const at = (c: Cue | undefined, fb: number, after: number) => c?.ms ?? cue(c?.word, fb, after);
const kf = (ms: number, a: number, d: number) => clamp01(interpolate(ms, [a, a + d], [0, 1], CLAMP));
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const damp = (s: number, k = 5, w = 14) => (s < 0 ? 0 : Math.exp(-k * s) * Math.cos(w * s));

// chart geometry (exported so a later section can redraw on the same seats)
export const ARENA = { X0: 220, X1: 1220, MONTHS: 12, Y100: 240, Y0: 800 };
const xM = (m: number) => ARENA.X0 + ((ARENA.X1 - ARENA.X0) * m) / ARENA.MONTHS;
const yS = (s: number) => ARENA.Y0 - (ARENA.Y0 - ARENA.Y100) * s;
/** schematic survival through a reported median */
const surv = (m: number, med: number) => Math.exp((-Math.LN2 * m) / med);
const STEP = 0.25;
const stepPts = (med: number) => {
  const pts: [number, number][] = [[xM(0), yS(1)]];
  for (let m = STEP; m <= ARENA.MONTHS + 1e-6; m += STEP) {
    const prev = surv(m - STEP, med);
    pts.push([xM(m), yS(prev)]);
    pts.push([xM(m), yS(surv(m, med))]);
  }
  return pts;
};
export const kmPath = (med: number) => stepPts(med).map(([x, y], i) => `${i ? "L" : "M"} ${x.toFixed(1)} ${y.toFixed(1)}`).join(" ");
export const kmGap = (medHi: number, medLo: number) => {
  const a = stepPts(medHi);
  const b = stepPts(medLo).reverse();
  return [...a, ...b].map(([x, y], i) => `${i ? "L" : "M"} ${x.toFixed(1)} ${y.toFixed(1)}`).join(" ") + " Z";
};

/** A 2-D antibody drawn around its hinge (0,0): stem down, arms up-out. `arm*`
 *  are 0..1 draw progress. Left site square, right site round (bispecific). */
export const Antibody: React.FC<{ color: string; stem: number; armL: number; armR: number; sites: number; glowL?: number; glowR?: number }> = ({ color, stem, armL, armR, sites, glowL = 0, glowR = 0 }) => {
  const SL = 190; // stem length
  const AL = 200; // arm length
  const a = (Math.PI / 180) * 38; // arm angle from vertical
  const tipL = { x: -Math.sin(a) * AL * armL, y: -Math.cos(a) * AL * armL };
  const tipR = { x: Math.sin(a) * AL * armR, y: -Math.cos(a) * AL * armR };
  const off = 20; // light-chain offset
  return (
    <g>
      {/* stem = two heavy chains */}
      <line x1={-11} y1={0} x2={-11} y2={SL * stem} stroke={color} strokeWidth={18} />
      <line x1={11} y1={0} x2={11} y2={SL * stem} stroke={color} strokeWidth={18} />
      {/* arms: heavy chain + an offset light chain */}
      {armL > 0 ? (
        <>
          <line x1={0} y1={0} x2={tipL.x} y2={tipL.y} stroke={color} strokeWidth={30} />
          <line x1={-off * Math.cos(a)} y1={off * Math.sin(a) - 30} x2={tipL.x - off * Math.cos(a)} y2={tipL.y + off * Math.sin(a) - 10} stroke={color} strokeWidth={12} opacity={0.85} />
        </>
      ) : null}
      {armR > 0 ? (
        <>
          <line x1={0} y1={0} x2={tipR.x} y2={tipR.y} stroke={color} strokeWidth={30} />
          <line x1={off * Math.cos(a)} y1={off * Math.sin(a) - 30} x2={tipR.x + off * Math.cos(a)} y2={tipR.y + off * Math.sin(a) - 10} stroke={color} strokeWidth={12} opacity={0.85} />
        </>
      ) : null}
      {/* binding sites: a square cup (left) and a round cup (right) */}
      {sites > 0 ? (
        <>
          <g transform={`translate(${tipL.x} ${tipL.y}) rotate(${-38})`} opacity={sites}>
            <path d="M -40 -46 L -40 0 L 40 0 L 40 -46" fill="none" stroke={color} strokeWidth={12 + glowL * 8} />
          </g>
          <g transform={`translate(${tipR.x} ${tipR.y}) rotate(${38})`} opacity={sites}>
            <path d="M -42 -40 A 42 42 0 0 0 42 -40" fill="none" stroke={color} strokeWidth={12 + glowR * 8} />
          </g>
        </>
      ) : null}
    </g>
  );
};
export const AB_TIPS = (() => {
  const a = (Math.PI / 180) * 38;
  const AL = 200;
  return { L: { x: -Math.sin(a) * AL, y: -Math.cos(a) * AL }, R: { x: Math.sin(a) * AL, y: -Math.cos(a) * AL }, a };
})();

const Hex: React.FC<{ cx: number; cy: number; r: number; color: string; opacity?: number }> = ({ cx, cy, r, color, opacity = 1 }) => (
  <polygon opacity={opacity} fill="none" stroke={color} strokeWidth={9}
    points={Array.from({ length: 6 }, (_, i) => `${cx + r * Math.cos((Math.PI / 3) * i + Math.PI / 6)},${cy + r * Math.sin((Math.PI / 3) * i + Math.PI / 6)}`).join(" ")} />
);

type Fig = Cue & { value: number; decimals: number; durMs: number };

export const DataArena: React.FC<{
  from: number;
  to: number;
  lead: { line: string };
  trial: Cue & { name: string };
  phase: Cue & { label: string; a: string; b: string; bWord?: string; bMs?: number; studyWord?: string; studyMs?: number };
  dockMs?: number;
  drug: Cue & { name: string; sub: string; bispecificWord?: string; bispecificMs?: number; subWord?: string; subMs?: number };
  targets: [Cue & { label: string }, Cue & { label: string }];
  arms: {
    ms?: number; word?: string;
    treat: { label: string; name: string; combo: string; comboWord?: string; comboMs?: number };
    control: { label: string; name: string; tail: string; word?: string; ms?: number; tailWord?: string; tailMs?: number };
  };
  endpoint: { line: string; emphasize: string; tickWord?: string; tickMs?: number; legend: string; word?: string; ms?: number };
  chart: { word?: string; ms?: number; label: string; xLabel: string; note: string; medianWord?: string; medianMs?: number; medianLabel: string; unitLabel: string };
  medians: [Fig, Fig];
  hr: Fig & { label: string; fillWord?: string; fillMs?: number };
}> = ({ from, to, lead, trial, phase, dockMs, drug, targets, arms, endpoint, chart, medians, hr }) => {
  const ms = useMs();
  const acc = useAccent();
  const ink = COLORS.ink;
  const gray = COLORS.grayText;
  const vis = clamp01(interpolate(ms, [from, from + 300, to - 360, to], [0, 1, 1, 0], CLAMP));

  // ── onsets (monotonic) ──
  const tTrial = at(trial, from + 2000, from);
  const tPhase = Math.max(tTrial + 400, at(phase, tTrial + 1400, tTrial));
  const tPhaseB = Math.max(tPhase + 250, phase.bMs ?? cue(phase.bWord, tPhase + 450, tPhase));
  const tStudy = Math.max(tPhaseB + 300, phase.studyMs ?? cue(phase.studyWord, tPhaseB + 700, tPhase));
  const tDock = Math.max(tStudy + 300, dockMs ?? tStudy + 500);
  const tDrug = Math.max(tDock + 300, at(drug, tDock + 700, tDock));
  const tBi = Math.max(tDrug + 500, drug.bispecificMs ?? cue(drug.bispecificWord, tDrug + 1200, tDrug));
  const tSub = Math.max(tBi + 200, drug.subMs ?? cue(drug.subWord, tBi + 800, tDrug));
  const tT1 = Math.max(tSub + 300, at(targets[0], tSub + 1800, tDrug));
  const tT2 = Math.max(tT1 + 400, at(targets[1], tT1 + 1000, tT1));
  const tArms = Math.max(tT2 + 600, at(arms, tT2 + 1900, tT2));
  const tCombo = Math.max(tArms + 200, arms.treat.comboMs ?? cue(arms.treat.comboWord, tArms + 650, tArms));
  const tCtrl = Math.max(tCombo + 400, arms.control.ms ?? cue(arms.control.word, tCombo + 1800, tCombo));
  const tAlone = Math.max(tCtrl + 300, arms.control.tailMs ?? cue(arms.control.tailWord, tCtrl + 800, tCtrl));
  const tEp = Math.max(tAlone + 500, at(endpoint, tAlone + 1200, tAlone));
  const tTick = Math.max(tEp, endpoint.tickMs ?? cue(endpoint.tickWord, tEp + 300, tEp));
  const tChart = Math.max(tTick + 1500, at(chart, tTick + 4000, tTick));
  const tFold = tChart - 800; // arms fold into the legend in the pause before
  const tMed = Math.max(tChart + 800, chart.medianMs ?? cue(chart.medianWord, tChart + 1900, tChart));
  const tM1 = Math.max(tMed + 300, at(medians[0], tMed + 1000, tMed));
  const tM2 = Math.max(tM1 + medians[0].durMs, at(medians[1], tM1 + 1700, tM1));
  const tFill = Math.max(tM2 + 600, hr.fillMs ?? cue(hr.fillWord, tM2 + 1500, tM2));
  const tHR = Math.max(tFill + 300, at(hr, tFill + 1000, tFill));

  // ── A. trial name + phase tiles, then the dock ──
  const dock = EASE_IO(kf(ms, tDock, 650));
  const tSize = lerp(150, 52, dock);
  const tX = lerp(220, 100, dock);
  const tY = lerp(420, 64, dock);
  const letters = trial.name.split("");
  const leadOut = 1 - kf(ms, tDock, 300);
  const pA = kf(ms, tPhase, 160);
  const bIn = kf(ms, tPhaseB, 240);
  const bX = lerp(260, 0, EASE_IN(bIn)); // the 3 slides in and butts
  const bRecoil = ms > tPhaseB + 240 ? 10 * Math.exp(-7 * ((ms - tPhaseB - 240) / 1000)) * Math.sin(20 * ((ms - tPhaseB - 240) / 1000)) : 0;
  const chipScale = lerp(1, 0.5, dock);
  const chipX = lerp(220, 100 + trial.name.length * 52 * 0.62 + 40, dock);
  const chipY = lerp(620, 62, dock);
  const studyP = kf(ms, tStudy, 200) * (1 - dock);

  // ── B. the antibody ──
  const stem = EASE(kf(ms, tDrug, 520));
  const armL = EASE(kf(ms, tBi, 420));
  const armR = EASE(kf(ms, tBi + 260, 420));
  const sites = kf(ms, tBi + 500, 260);
  const nameP = kf(ms, tDrug, 200);
  const subP = kf(ms, tSub, 240);
  // travel into the treatment seat
  const trav = EASE_IO(kf(ms, tArms - 450, 700));
  const abX = lerp(960, 300, trav);
  const abY = lerp(560, 452, trav);
  const abS = lerp(1, 0.3, trav);
  const bOut = 1 - trav; // the big labels leave as it travels

  // targets: fly in on a curve (with trail), snap into the site
  const target = (t: number, side: -1 | 1) => {
    const u = kf(ms, t - 380, 380); // arrives ON its word
    const tip = side < 0 ? AB_TIPS.L : AB_TIPS.R;
    const seat = { x: tip.x + side * -Math.sin(AB_TIPS.a) * -30, y: tip.y - Math.cos(AB_TIPS.a) * 30 };
    const start = { x: side * 900, y: -420 };
    const ctrl = { x: side * 650, y: 180 };
    const pos = (e: number) => ({
      x: (1 - e) ** 2 * start.x + 2 * (1 - e) * e * ctrl.x + e * e * seat.x,
      y: (1 - e) ** 2 * start.y + 2 * (1 - e) * e * ctrl.y + e * e * seat.y,
    });
    const e = EASE_IN(u);
    const snap = kf(ms, t, 500);
    return { p: pos(e), trail: [0.08, 0.16, 0.24].map((d) => pos(EASE_IN(clamp01(u - d)))), on: u > 0, landed: ms >= t, snap };
  };
  const T1 = target(tT1, -1);
  const T2 = target(tT2, 1);
  const glowL = T1.landed ? 1 - T1.snap : 0;
  const glowR = T2.landed ? 1 - T2.snap : 0;

  // ── C. the arms ──
  const fold = EASE_IO(kf(ms, tFold, 700));
  const rowsOn = kf(ms, tArms - 200, 300);
  const comboP = kf(ms, tCombo, 200);
  const hexA = EASE_IN(kf(ms, tCombo - 300, 300));
  const ctrlP = kf(ms, tCtrl, 200);
  const hexB = EASE_IN(kf(ms, tCtrl - 300, 300));
  const aloneP = kf(ms, tAlone, 200);

  // ── D. the endpoint ──
  const boxP = kf(ms, tEp, 200);
  const tick = EASE(kf(ms, tTick, 320));
  const epOut = 1 - fold;

  // ── E. the chart ──
  const axes = EASE(kf(ms, tChart - 600, 600));
  const draw = EASE_IO(kf(ms, tChart, 1600));
  const medLine = EASE(kf(ms, tMed, 500));
  const y50 = yS(0.5);
  const plumb = (t: number) => {
    const u = kf(ms, t, 320);
    const len = (ARENA.Y0 - y50) * u * u;
    const s = (ms - t - 320) / 1000;
    const bob = s > 0 ? 12 * Math.exp(-6 * s) * Math.abs(Math.sin(14 * s)) : 0;
    return { on: ms >= t, len, bob, ring: kf(ms, t, 600) };
  };
  const P1 = plumb(tM1);
  const P2 = plumb(tM2);
  const fill = EASE_IO(kf(ms, tFill, 900));
  const hrP = kf(ms, tHR - 60, 200);

  // legend positions (rows fold into them)
  const legX = 1330;
  const rowA = { x: lerp(560, legX + 80, fold), y: lerp(410, 222, fold), size: lerp(60, 32, fold) };
  const rowB = { x: lerp(560, legX + 80, fold), y: lerp(620, 276, fold), size: lerp(60, 32, fold) };
  const rowLab = 1 - fold;

  const figStyle = (color: string): React.CSSProperties => ({ fontFamily: DISPLAY, fontWeight: 700, fontSize: 64, letterSpacing: TRACK.display, color, fontVariantNumeric: "tabular-nums" });
  const count = (f: Fig, t: number) => (EASE(kf(ms, t, f.durMs)) * f.value).toFixed(f.decimals);

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {/* A — lead line, trial name, phase tiles */}
      <div style={{ position: "absolute", left: 220, top: 300, width: 1400, opacity: leadOut }}>
        <FlowLine from={from} to={tTrial} line={lead.line} size={48} color={gray} weight={400} />
      </div>
      <div style={{ position: "absolute", left: tX, top: tY, whiteSpace: "nowrap" }}>
        {letters.map((c, i) => {
          const p = kf(ms, tTrial + i * 40, 200);
          return <span key={i} style={{ display: "inline-block", fontFamily: DISPLAY, fontWeight: 700, fontSize: tSize, letterSpacing: TRACK.display, color: ink, opacity: p, transform: `translateY(${(1 - p) * 40}px) scale(${lerp(1.5, 1, p)})` }}>{c}</span>;
        })}
      </div>
      <div style={{ position: "absolute", left: chipX, top: chipY, transformOrigin: "left top", transform: `scale(${chipScale})`, display: "flex", alignItems: "center", gap: 22 }}>
        <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 64, letterSpacing: TRACK.headline, color: ink, opacity: pA }}>{phase.label}</span>
        <div style={{ display: "flex", gap: 8 }}>
          <div style={{ width: 96, height: 96, background: ink, color: COLORS.paper, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: 64, opacity: pA, transform: `translateX(${-bRecoil * 0.4}px)` }}>{phase.a}</div>
          <div style={{ width: 96, height: 96, background: ink, color: COLORS.paper, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: 64, opacity: bIn, transform: `translateX(${bX + bRecoil}px)` }}>{phase.b}</div>
        </div>
        <span style={{ fontFamily: DISPLAY, fontWeight: 400, fontSize: 64, letterSpacing: TRACK.headline, color: gray, opacity: studyP }}>study</span>
      </div>

      <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {/* E — chart (under everything else) */}
        {axes > 0 ? (
          <g>
            <line x1={ARENA.X0} x2={ARENA.X0} y1={ARENA.Y0} y2={ARENA.Y0 - (ARENA.Y0 - ARENA.Y100 + 20) * axes} stroke={ink} strokeWidth={4} />
            <line x1={ARENA.X0} x2={ARENA.X0 + (ARENA.X1 - ARENA.X0 + 20) * axes} y1={ARENA.Y0} y2={ARENA.Y0} stroke={ink} strokeWidth={4} />
          </g>
        ) : null}
        <defs>
          <clipPath id="arena-draw"><rect x={ARENA.X0 - 10} y={0} width={(ARENA.X1 - ARENA.X0 + 20) * draw} height={H} /></clipPath>
          <clipPath id="arena-fill"><rect x={ARENA.X0} y={0} width={(ARENA.X1 - ARENA.X0) * fill} height={H} /></clipPath>
        </defs>
        {fill > 0 ? (
          <g clipPath="url(#arena-fill)">
            <path d={kmGap(medians[0].value, medians[1].value)} fill={accentA(0.18)} />
          </g>
        ) : null}
        {fill > 0 && fill < 1 ? <line x1={ARENA.X0 + (ARENA.X1 - ARENA.X0) * fill} x2={ARENA.X0 + (ARENA.X1 - ARENA.X0) * fill} y1={ARENA.Y100 - 10} y2={ARENA.Y0} stroke={acc} strokeWidth={4} opacity={0.9} /> : null}
        {draw > 0 ? (
          <g clipPath="url(#arena-draw)" fill="none" strokeLinejoin="miter">
            <path d={kmPath(medians[1].value)} stroke={inkA(0.4)} strokeWidth={7} />
            <path d={kmPath(medians[0].value)} stroke={acc} strokeWidth={8} />
          </g>
        ) : null}
        {medLine > 0 ? <line x1={ARENA.X0} x2={ARENA.X0 + (ARENA.X1 - ARENA.X0) * medLine} y1={y50} y2={y50} stroke={inkA(0.55)} strokeWidth={2} /> : null}
        {[{ P: P1, m: medians[0].value, c: acc }, { P: P2, m: medians[1].value, c: ink }].map(({ P, m, c }, i) =>
          P.on ? (
            <g key={i}>
              <line x1={xM(m)} x2={xM(m)} y1={y50} y2={y50 + P.len} stroke={c} strokeWidth={4} />
              <rect x={xM(m) - 9} y={y50 + P.len - 9 - P.bob} width={18} height={18} fill={c} />
              <circle cx={xM(m)} cy={y50} r={11} fill={c} />
              {P.ring < 1 ? <circle cx={xM(m)} cy={y50} r={12 + P.ring * 60} fill="none" stroke={c} strokeWidth={5 * (1 - P.ring)} opacity={1 - P.ring} /> : null}
            </g>
          ) : null
        )}

        {/* C — the arms: seats, hexes, the moving antibody */}
        {rowsOn > 0 && fold < 1 ? (
          <g opacity={rowsOn * (1 - fold)}>
            <text x={430} y={466} fontFamily={SANS} fontWeight={700} fontSize={64} fill={ink} textAnchor="middle" opacity={comboP}>+</text>
            <Hex cx={lerp(700, 500, hexA)} cy={lerp(200, 440, hexA)} r={36} color={ink} opacity={hexA > 0 ? 1 : 0} />
            <Hex cx={lerp(700, 500, hexB)} cy={lerp(860, 650, hexB)} r={36} color={ink} opacity={hexB > 0 ? 1 : 0} />
          </g>
        ) : null}

        {/* B — antibody + targets */}
        {stem > 0 && fold < 1 ? (
          <g transform={`translate(${abX} ${abY}) scale(${abS})`} opacity={1 - fold}>
            {[{ T: T1, side: -1 }, { T: T2, side: 1 }].map(({ T, side }, i) =>
              T.on ? (
                <g key={i}>
                  {!T.landed ? T.trail.map((q, j) => (side < 0 ? <rect key={j} x={q.x - 30} y={q.y - 30} width={60} height={60} fill={ink} opacity={0.12 * (3 - j)} /> : <circle key={j} cx={q.x} cy={q.y} r={31} fill={ink} opacity={0.12 * (3 - j)} />)) : null}
                  {side < 0 ? <rect x={T.p.x - 30} y={T.p.y - 30} width={60} height={60} fill={ink} transform={`rotate(${-38} ${T.p.x} ${T.p.y})`} /> : <circle cx={T.p.x} cy={T.p.y} r={31} fill={ink} />}
                  {T.landed && T.snap < 1 ? <circle cx={T.p.x} cy={T.p.y} r={40 + T.snap * 90} fill="none" stroke={acc} strokeWidth={8 * (1 - T.snap)} opacity={1 - T.snap} /> : null}
                </g>
              ) : null
            )}
            <Antibody color={acc} stem={stem} armL={armL} armR={armR} sites={sites} glowL={glowL} glowR={glowR} />
          </g>
        ) : null}
      </svg>

      {/* B — labels */}
      <div style={{ position: "absolute", left: 960 - 400, width: 800, top: 792, textAlign: "center", opacity: nameP * bOut }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 72, letterSpacing: TRACK.display, color: ink, lineHeight: 1 }}>{drug.name}</div>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: TYPE.label, letterSpacing: TRACK.nav, color: gray, marginTop: 12, opacity: subP }}>{drug.sub}</div>
      </div>
      {[{ T: T1, t: targets[0], x: 960 + AB_TIPS.L.x - 40 }, { T: T2, t: targets[1], x: 960 + AB_TIPS.R.x + 40 }].map(({ T, t, x }, i) => (
        <div key={i} style={{ position: "absolute", left: x - 200, width: 400, top: 560 + AB_TIPS.L.y - 170, textAlign: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: 52, letterSpacing: TRACK.headline, color: ink, opacity: (T.landed ? 1 : 0) * bOut }}>{t.label}</div>
      ))}

      {/* C — arm rows (fold into the legend) */}
      {rowsOn > 0 ? (
        <>
          <div style={{ position: "absolute", left: 220, top: 330, fontFamily: SANS, fontWeight: 700, fontSize: TYPE.label, letterSpacing: TRACK.nav, color: gray, opacity: rowsOn * rowLab }}>{arms.treat.label}</div>
          <div style={{ position: "absolute", left: 220, top: 540, fontFamily: SANS, fontWeight: 700, fontSize: TYPE.label, letterSpacing: TRACK.nav, color: gray, opacity: ctrlP * rowLab }}>{arms.control.label}</div>
          <div style={{ position: "absolute", left: rowA.x, top: rowA.y, whiteSpace: "nowrap", fontFamily: DISPLAY, fontWeight: 700, fontSize: rowA.size, letterSpacing: TRACK.headline, color: ink, opacity: rowsOn }}>
            {arms.treat.name}<span style={{ opacity: comboP, fontWeight: 400 }}> {arms.treat.combo}</span>
          </div>
          <div style={{ position: "absolute", left: rowB.x, top: rowB.y, whiteSpace: "nowrap", fontFamily: DISPLAY, fontWeight: 700, fontSize: rowB.size, letterSpacing: TRACK.headline, color: ink, opacity: ctrlP }}>
            {arms.control.name}<span style={{ opacity: aloneP, fontWeight: 400 }}> {arms.control.tail}</span>
          </div>
        </>
      ) : null}
      {/* legend swatches */}
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }} opacity={fold}>
        <line x1={legX} x2={legX + 60} y1={246} y2={246} stroke={acc} strokeWidth={8} />
        <line x1={legX} x2={legX + 60} y1={300} y2={300} stroke={inkA(0.4)} strokeWidth={7} />
      </svg>

      {/* D — endpoint (tick box + verbatim line); docks to the legend's third row */}
      <div style={{ position: "absolute", left: lerp(220, legX, fold), top: lerp(800, 338, fold), display: "flex", alignItems: "center", gap: lerp(28, 14, fold), opacity: boxP }}>
        <svg width={lerp(72, 40, fold)} height={lerp(72, 40, fold)} viewBox="0 0 72 72" style={{ flex: "none" }}>
          <rect x={4} y={4} width={64} height={64} fill="none" stroke={ink} strokeWidth={6} />
          <polyline points="16,38 30,52 58,20" fill="none" stroke={acc} strokeWidth={10} strokeDasharray={80} strokeDashoffset={80 * (1 - tick)} />
        </svg>
        <div style={{ position: "relative" }}>
          <div style={{ opacity: epOut }}>
            <FlowLine from={tEp - 50} to={tChart} line={endpoint.line} size={52} color={ink} restColor={inkA(0.55)} restWeight={400} emphasize={endpoint.emphasize} empColor={ink} />
          </div>
          <div style={{ position: "absolute", left: 0, top: 0, whiteSpace: "nowrap", opacity: fold, fontFamily: SANS, fontWeight: 700, fontSize: 30, letterSpacing: TRACK.nav, color: ink }}>{endpoint.legend}</div>
        </div>
      </div>

      {/* E — chart labels, median readouts, hazard ratio */}
      <div style={{ position: "absolute", left: ARENA.X0, top: 170, fontFamily: DISPLAY, fontWeight: 700, fontSize: 44, letterSpacing: TRACK.headline, color: ink, opacity: axes }}>{chart.label}</div>
      <div style={{ position: "absolute", left: ARENA.X1 - 300, width: 320, top: ARENA.Y0 + 14, textAlign: "right", fontFamily: SANS, fontWeight: 700, fontSize: TYPE.label, letterSpacing: TRACK.nav, color: gray, opacity: axes }}>{chart.xLabel}</div>
      <div style={{ position: "absolute", left: ARENA.X1 + 16, top: y50 - 18, fontFamily: SANS, fontWeight: 700, fontSize: TYPE.label, letterSpacing: TRACK.nav, color: gray, opacity: medLine }}>{chart.medianLabel}</div>
      <div style={{ position: "absolute", left: legX, top: 880, width: 480, fontFamily: SANS, fontWeight: 400, fontSize: TYPE.labelSm, letterSpacing: TRACK.nav, color: gray, opacity: draw }}>{chart.note}</div>
      {[{ f: medians[0], t: tM1, c: acc }, { f: medians[1], t: tM2, c: ink }].map(({ f, t, c }, i) => (
        <div key={i} style={{ position: "absolute", left: xM(f.value) - 100, width: 200, top: ARENA.Y0 + 22, textAlign: "center", ...figStyle(c), opacity: kf(ms, t - 60, 160) }}>{count(f, t)}</div>
      ))}
      <div style={{ position: "absolute", left: ARENA.X0, top: ARENA.Y0 + 104, fontFamily: SANS, fontWeight: 700, fontSize: TYPE.label, letterSpacing: TRACK.nav, color: gray, opacity: kf(ms, tM1 + 400, 300) }}>{chart.unitLabel}</div>
      <div style={{ position: "absolute", left: legX, top: 560 }}>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: TYPE.label, letterSpacing: TRACK.nav, color: gray, opacity: kf(ms, tFill, 250) }}>{hr.label}</div>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 168, lineHeight: 1, letterSpacing: TRACK.display, color: ink, fontVariantNumeric: "tabular-nums", marginTop: 8, opacity: hrP }}>{count(hr, tHR)}</div>
      </div>
    </AbsoluteFill>
  );
};
