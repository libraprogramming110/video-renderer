// ─────────────────────────────────────────────────────────────────────────
// KIT · ceiling — THE SPINE of the Lilly EloraTZP long-form, 2026-10-03
// (VERTICAL): one bar chart born in §3 that holds its seat through the §4 red
// wipe, where a ceiling plate at 15% is lifted to the combo's 23.3%.
// Built under the 09-30 one-mover rule.
//
// `CeilingData` (black, §3): "367 adults, 48 weeks. Highest dose: 23.3 percent
// weight loss. Tirzepatide alone: 14.8. An 8.5 point gap on an already
// best-in-class drug. A1C dropped 2.9 points on the combo, from a baseline of
// 8.1." The trial counts in huge (367), a 48-week rail sweeps beneath it, and
// on "Highest dose" the whole trial flies up and becomes the header. The combo
// bar RISES while 23.3 counts; tirzepatide rises to 14.8 beside it; on "8.5" a
// leader runs across from tirzepatide's top and the part of the combo bar above
// it FILLS red while +8.5 counts inside it (the gap is the picture, not a
// caption). Then a CAMERA PULL parks the chart up top, and A1C gets its own
// instrument (a different metric never shares the axis, 08-21): a tube whose
// red marker DROPS on "dropped" while -2.9 counts; the baseline tick and its
// 8.1 land last, in the order spoken. No end value is printed: the script never
// says one.
//
// Geometry is exported as CEIL so §4 redraws the same chart on the same seats.
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { CLAMP, clamp01, COLORS, DISPLAY, INK_SUB, TRACK, useMs } from "./core";
import { TYPE } from "../style";
import { FlowLine } from "./flowline";
import { at, lerp, Phrase, useK, type Cued, type Win } from "./elora";

const EASE = Easing.out(Easing.cubic);
const EASE_IO = Easing.inOut(Easing.cubic);

export const CEIL = {
  header: { y: 205 },
  base: 1350, // the baseline
  ppt: 36, // px per percentage point (25 pts = 900px)
  left: 150,
  right: 930,
  bars: { tirz: { x: 360, w: 240 }, combo: { x: 740, w: 240 } },
  labelY: 1375,
  // the camera pull: the chart parks in the top of the frame at this scale
  pull: { s: 0.6, ox: 540, oy: 470 },
  gauge: { x: 830, w: 70, top: 1110, bottom: 1580, start: 1150, perUnit: 120 },
};
export const yOf = (v: number) => CEIL.base - v * CEIL.ppt;

/** A bar with its figure riding above its top. */
export const Bar: React.FC<{ x: number; w: number; v: number; color: string }> = ({ x, w, v, color }) => (
  <rect x={x - w / 2} y={yOf(v)} width={w} height={v * CEIL.ppt} fill={color} />
);

const fmt = (v: number, d: number) => v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

export const CeilingData: React.FC<Win & {
  trial: { value: number; word?: string; ms?: number; endWord?: string };
  adults: { label: string } & Cued;
  weeks: { n: number; label: string; word?: string; ms?: number; labelWord?: string };
  header: { label: string } & Cued; // the trial docks as the header
  stage: Cued; // baseline + the combo's label
  combo: { name: string; sub: string; value: number; word?: string; ms?: number; endWord?: string };
  tirz: { name: string; sub: string; value: number; word?: string; ms?: number; labelWord?: string };
  gap: { value: number; word?: string; ms?: number; endWord?: string };
  best: { label: string } & Cued;
  pull: Cued; // the camera pull (pin it inside the pause before A1C)
  a1c: { label: string } & Cued;
  drop: { value: number; word?: string; ms?: number; figWord?: string; endWord?: string };
  baseline: { label: string; value: string; word?: string; ms?: number; valueWord?: string };
  lines: { text: string; emphasize?: string; word?: string; ms?: number }[]; // [chart line 1, chart line 2, A1C line]
}> = ({ from, to, trial, adults, weeks, header, stage, combo, tirz, gap, best, pull, a1c, drop, baseline, lines }) => {
  const ms = useMs();
  const k = useK();
  const W = COLORS.paper;
  const R = COLORS.accent;
  const G = CEIL.gauge;
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));

  // ── onsets, in spoken order
  const tTrial = at(trial, from + 50, from);
  const tTrialEnd = at({ word: trial.endWord }, tTrial + 1700, from, tTrial + 800);
  const tAdults = at(adults, tTrialEnd + 50, from, tTrial + 600);
  const tWeeks = at(weeks, tAdults + 700, from, tAdults + 300);
  const tWeeksLbl = at({ word: weeks.labelWord }, tWeeks + 650, from, tWeeks + 300);
  const tDock = at(header, tWeeksLbl + 1000, from, tWeeksLbl + 400);
  const tStage = at(stage, tDock + 400, from, tDock + 300);
  const tCombo = at(combo, tStage + 800, from, tStage + 300);
  const tComboEnd = at({ word: combo.endWord }, tCombo + 1100, from, tCombo + 700);
  const tTirzLbl = at({ word: tirz.labelWord }, tComboEnd + 1800, from, tComboEnd + 400);
  const tTirz = at(tirz, tTirzLbl + 1400, from, tTirzLbl + 300);
  const tGap = at(gap, tTirz + 2200, from, tTirz + 1100);
  const tGapEnd = at({ word: gap.endWord }, tGap + 700, from, tGap + 400);
  const tBest = at(best, tGapEnd + 1700, from, tGapEnd + 400);
  const tPull = at(pull, tBest + 1200, from, tBest + 600);
  const tA1C = at(a1c, tPull + 550, from, tPull + 400);
  const tDrop = at({ word: drop.word, ms: drop.ms }, tA1C + 850, from, tA1C + 400);
  const tFig = at({ word: drop.figWord }, tDrop + 400, from, tDrop + 150);
  const tFigEnd = at({ word: drop.endWord }, tFig + 1000, from, tFig + 600);
  const tBase = at(baseline, tFigEnd + 1700, from, tFigEnd + 400);
  const tVal = at({ word: baseline.valueWord }, tBase + 850, from, tBase + 300);

  // ── P1: the trial, then it docks into the header
  const trialQ = EASE(k(tTrial, tTrialEnd - tTrial));
  const dockQ = EASE_IO(k(tDock, 620));
  const p1O = k(tTrial - 40, 140) * (1 - clamp01((dockQ - 0.45) / 0.4));
  const p1T = `translate(0 ${lerp(0, CEIL.header.y - 780, dockQ)}) translate(540 780) scale(${lerp(1, 0.16, dockQ)}) translate(-540 -780)`;
  const sweep = k(tWeeks, Math.max(500, tWeeksLbl - tWeeks + 250));
  const headO = clamp01((dockQ - 0.6) / 0.4);

  // ── P2: the chart
  const stageQ = EASE(k(tStage, 460));
  const comboQ = EASE(k(tCombo, tComboEnd - tCombo));
  const tirzQ = EASE(k(tTirz, 1100));
  const comboV = comboQ * combo.value;
  const tirzV = tirzQ * tirz.value;
  const leadQ = EASE(k(tGap, 260));
  const gapQ = EASE(k(tGap + 120, Math.max(400, tGapEnd - tGap)));
  const gapV = gapQ * gap.value;
  const bestQ = k(tBest, 120);
  const bestS = interpolate(ms, [tBest, tBest + 300], [1.25, 1], { ...CLAMP, easing: EASE });
  const pullQ = EASE_IO(k(tPull, 620));
  const P = CEIL.pull;

  const cb = CEIL.bars.combo;
  const tb = CEIL.bars.tirz;
  const yTirz = yOf(tirz.value);
  const yCombo = yOf(combo.value);

  // ── P3: the A1C instrument
  const tubeQ = EASE(k(tA1C, 420));
  const dropQ = Easing.in(Easing.quad)(k(tDrop, 380)); // falls...
  const bounce = dropQ >= 1 ? -Math.sin(k(tDrop + 380, 240) * Math.PI) * 14 : 0; // ...and rebounds once
  const dropPx = drop.value * G.perUnit;
  const markY = G.start + dropPx * dropQ + bounce;
  const figQ = EASE(k(tFig, tFigEnd - tFig));
  const baseQ = EASE(k(tBase, 300));
  const valS = interpolate(ms, [tVal, tVal + 300], [1.25, 1], { ...CLAMP, easing: EASE });

  const label = (x: number, name: string, sub: string, o: number) => (
    <div style={{ position: "absolute", left: x - 200, width: 400, top: CEIL.labelY, textAlign: "center", opacity: o, transform: `translateY(${(1 - o) * 12}px)` }}>
      <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: TYPE.label, letterSpacing: TRACK.headline, color: W, lineHeight: 1.1 }}>{name}</div>
      <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: TYPE.labelSm, letterSpacing: TRACK.headline, color: INK_SUB, lineHeight: 1.2 }}>{sub}</div>
    </div>
  );

  if (ms < tTrial - 60) return null;
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {/* ═══ P1 · the trial ═══ */}
      {p1O > 0 ? (
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: p1O }}>
          <g transform={p1T}>
            <text x={540} y={760} textAnchor="middle" fontFamily={DISPLAY} fontWeight={700} fontSize={340} letterSpacing="-0.042em" fill={W} style={{ fontVariantNumeric: "tabular-nums" }}>
              {Math.round(trialQ * trial.value)}
            </text>
            {ms >= tAdults ? (
              <text x={540} y={880} textAnchor="middle" fontFamily={DISPLAY} fontWeight={700} fontSize={70} letterSpacing="-0.042em" fill={W} opacity={k(tAdults, 160)}>
                {adults.label}
              </text>
            ) : null}
            {ms >= tWeeks
              ? Array.from({ length: weeks.n }, (_, i) => {
                  const x = 120 + (i * 840) / (weeks.n - 1);
                  const lit = clamp01((sweep * weeks.n - i) * 1.5);
                  return lit > 0 ? <rect key={i} x={x - 4} y={1000 - 34 * lit} width={8} height={68 * lit} fill={i === weeks.n - 1 ? R : W} opacity={0.35 + 0.65 * lit} /> : null;
                })
              : null}
            {ms >= tWeeksLbl ? (
              <text x={540} y={1150} textAnchor="middle" fontFamily={DISPLAY} fontWeight={700} fontSize={70} letterSpacing="-0.042em" fill={W} opacity={k(tWeeksLbl, 160)}>
                {weeks.label}
              </text>
            ) : null}
          </g>
        </svg>
      ) : null}
      {headO > 0 ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: CEIL.header.y, transform: "translateY(-50%)", textAlign: "center", opacity: headO,
          fontFamily: DISPLAY, fontWeight: 700, fontSize: TYPE.label, letterSpacing: TRACK.headline, color: INK_SUB }}>
          {header.label}
        </div>
      ) : null}

      {/* ═══ P2 · the chart (one group, so the camera pull moves it whole) ═══ */}
      {stageQ > 0 ? (
        <div style={{ position: "absolute", inset: 0, transformOrigin: `${P.ox}px ${P.oy}px`, transform: `scale(${lerp(1, P.s, pullQ)})` }}>
          <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
            {/* baseline */}
            <rect x={CEIL.left} y={CEIL.base} width={(CEIL.right - CEIL.left) * stageQ} height={5} fill={W} />
            {comboV > 0 ? <Bar x={cb.x} w={cb.w} v={comboV} color={W} /> : null}
            {tirzV > 0 ? <Bar x={tb.x} w={tb.w} v={tirzV} color={W} /> : null}
            {/* the gap: a leader from tirzepatide's top, then the combo's excess fills red */}
            {leadQ > 0 ? (
              <line x1={tb.x + tb.w / 2} y1={yTirz} x2={lerp(tb.x + tb.w / 2, cb.x - cb.w / 2, leadQ)} y2={yTirz} stroke={W} strokeWidth={5} strokeDasharray="14 12" />
            ) : null}
            {gapQ > 0 ? <rect x={cb.x - cb.w / 2} y={lerp(yTirz, yCombo, gapQ)} width={cb.w} height={(yTirz - yCombo) * gapQ} fill={R} /> : null}
          </svg>
          {/* figures riding the bar tops */}
          {comboV > 0 ? (
            <div style={{ position: "absolute", left: cb.x - 200, width: 400, top: yOf(comboV) - 30, transform: "translateY(-100%)", textAlign: "center",
              fontFamily: DISPLAY, fontWeight: 700, fontSize: 104, letterSpacing: TRACK.display, color: W, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
              {fmt(comboV, 1)}%
            </div>
          ) : null}
          {tirzV > 0 ? (
            <div style={{ position: "absolute", left: tb.x - 200, width: 400, top: yOf(tirzV) - 30, transform: "translateY(-100%)", textAlign: "center",
              fontFamily: DISPLAY, fontWeight: 700, fontSize: 104, letterSpacing: TRACK.display, color: W, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
              {fmt(tirzV, 1)}%
            </div>
          ) : null}
          {gapQ > 0 ? (
            <div style={{ position: "absolute", left: cb.x - cb.w / 2, width: cb.w, top: (yTirz + yCombo) / 2, transform: "translateY(-50%)", textAlign: "center", opacity: clamp01(gapQ * 3),
              fontFamily: DISPLAY, fontWeight: 700, fontSize: 84, letterSpacing: TRACK.display, color: W, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
              +{fmt(gapV, 1)}
            </div>
          ) : null}
          {bestQ > 0 ? (
            <div style={{ position: "absolute", left: tb.x, top: yTirz - 190, transform: `translate(-50%,-50%) scale(${bestS})`, opacity: bestQ, whiteSpace: "nowrap",
              padding: "6px 22px", border: `4px solid ${W}`, borderRadius: 999, fontFamily: DISPLAY, fontWeight: 700, fontSize: TYPE.labelSm, letterSpacing: TRACK.headline, color: W }}>
              {best.label}
            </div>
          ) : null}
          {label(cb.x, combo.name, combo.sub, stageQ)}
          {label(tb.x, tirz.name, tirz.sub, k(tTirzLbl, 200))}
        </div>
      ) : null}

      {/* ═══ P3 · the A1C instrument ═══ */}
      {tubeQ > 0 ? (
        <>
          <div style={{ position: "absolute", left: 90, top: G.top, opacity: k(tA1C, 140), transform: `translateY(${(1 - tubeQ) * 16}px)`,
            fontFamily: DISPLAY, fontWeight: 700, fontSize: 100, letterSpacing: TRACK.display, color: W, lineHeight: 1 }}>
            {a1c.label}
          </div>
          <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
            <clipPath id="a1c-tube"><rect x={G.x - 10} y={G.top - 10} width={G.w + 20} height={(G.bottom - G.top + 20) * tubeQ} /></clipPath>
            <rect x={G.x} y={G.top} width={G.w} height={G.bottom - G.top} rx={G.w / 2} fill="none" stroke={W} strokeWidth={5} clipPath="url(#a1c-tube)" />
            {ms >= tDrop ? (
              <>
                <rect x={G.x + 14} y={G.start} width={G.w - 28} height={Math.max(0, markY - G.start)} fill={R} />
                <rect x={G.x - 24} y={markY - 7} width={G.w + 48} height={14} fill={R} />
              </>
            ) : null}
            {baseQ > 0 ? (
              <line x1={G.x - 8} y1={G.start} x2={lerp(G.x - 8, 610, baseQ)} y2={G.start} stroke={W} strokeWidth={4} strokeDasharray="12 10" />
            ) : null}
          </svg>
          {ms >= tFig ? (
            <div style={{ position: "absolute", left: 90, top: 1215, opacity: k(tFig, 140), fontFamily: DISPLAY, fontWeight: 700, fontSize: 170, letterSpacing: TRACK.display, color: R, lineHeight: 1, fontVariantNumeric: "tabular-nums", whiteSpace: "nowrap" }}>
              −{fmt(figQ * drop.value, 1)}
              <span style={{ fontSize: 56, marginLeft: 16 }}>pts</span>
            </div>
          ) : null}
          {baseQ > 0 ? (
            <div style={{ position: "absolute", right: 1080 - 595, top: G.start, transform: "translateY(-50%)", opacity: baseQ,
              fontFamily: DISPLAY, fontWeight: 700, fontSize: TYPE.label, letterSpacing: TRACK.headline, color: INK_SUB, whiteSpace: "nowrap" }}>
              {baseline.label}
            </div>
          ) : null}
          {ms >= tVal ? (
            <div style={{ position: "absolute", left: G.x + G.w + 18, top: G.start, transform: `translateY(-50%) scale(${valS})`, transformOrigin: "left center", opacity: k(tVal, 120),
              fontFamily: DISPLAY, fontWeight: 700, fontSize: 60, letterSpacing: TRACK.display, color: W, lineHeight: 1 }}>
              {baseline.value}
            </div>
          ) : null}
        </>
      ) : null}

      {/* ═══ narration ═══ */}
      <Phrase from={at(lines[0], tDock, from)} to={at(lines[1], tGap - 300, from) - 60} line={lines[0].text} top={1480} size={50} color={W} restColor={INK_SUB} restWeight={700} emphasize={lines[0].emphasize} empColor={W} />
      <Phrase from={at(lines[1], tGap - 300, from)} to={tA1C - 80} line={lines[1].text} top={1480} size={50} color={W} restColor={INK_SUB} restWeight={700} emphasize={lines[1].emphasize} empColor={R} />
      {ms >= tA1C - 80 ? (
        <div style={{ position: "absolute", left: 90, width: 690, top: 1440, opacity: clamp01(interpolate(ms, [tA1C - 80, tA1C, to - 220, to], [0, 1, 1, 0], CLAMP)) }}>
          <FlowLine from={at(lines[2], tA1C, from)} to={to} line={lines[2].text} size={46} color={W} restColor={INK_SUB} restWeight={700} emphasize={lines[2].emphasize} empColor={R} lineHeight={1.1} />
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
