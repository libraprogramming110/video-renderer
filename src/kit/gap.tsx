// ─────────────────────────────────────────────────────────────────────────
// KIT · gap — A DRUG BEATING THE BLOCKBUSTER IT IS BUILT ON. Added on the
// AbbVie ABBV-466 reel, 2026-10-22 (VERTICAL 9:16). Built under the one-mover
// rule (09-30) and the frame budget (10-05): each cue gets ONE motion,
// anything landed goes still, a finished idea retires.
//
// THE SPINE is THE GAP (`GapChart`): two columns on one baseline, the new
// drug and the blockbuster, in one trial. The slice of the new drug's column
// ABOVE the blockbuster's level turns red on "gap" and grows on "widens".
// Grammar: solid = measured; dashed = not measured yet (an empty slot).
//
// `RateHook` (red): "30.2%." The figure counts from 1 while it is voiced and a
// 10×10 grid fills with it, cell by cell (the rate, enacted: 30.2 of every
// 100). The label and the drug plate land word by word.
//
// Every onset is a spoken word with an optional ms pin, clamped monotonic.
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { CLAMP, clamp01, COLORS, DISPLAY, INK_SUB_ON_RED, TRACK, caps, inkA, useMs } from "./core";
import { TYPE } from "../style";
import { at, lerp, useK, type Cued, type Win } from "./elora";
import { FlowLine } from "./flowline";
import { Pair } from "./neo";

const EASE = Easing.out(Easing.cubic);
const EASE_IO = Easing.inOut(Easing.cubic);
const popStyle = (k: number, rise = 20): React.CSSProperties => ({ opacity: clamp01(k * 1.6), transform: `translateY(${(1 - EASE(k)) * rise}px)` });
const fadeOut = (ms: number, to: number) => clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));
const fmt = (v: number, d: number) => v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

// ══════════════════════════════════════════════════════════════════════════
// RateHook — 30.2%, counted and filled (red world)
// ══════════════════════════════════════════════════════════════════════════
export const RATE = { figTop: 300, figSize: 260, gridTop: 640, cell: 58, gap: 11, labelTop: 1400, subTop: 1500 };

export const RateHook: React.FC<Win & {
  figure: { value: number; decimals: number; suffix: string } & Cued; // the count starts on this word
  end: Cued; // ...and lands just before this one
  label: { text: string } & Cued; // "Endoscopic remission"
  sub: ({ text: string } & Cued)[]; // the plate under it, piece by piece
}> = ({ from, to, figure, end, label, sub }) => {
  const ms = useMs();
  const k = useK();
  const W = COLORS.paper;
  const R = RATE;

  const tFig = at(figure, from + 60, from);
  const tEnd = at(end, tFig + 1600, from, tFig + 600);
  const tLabel = at(label, tEnd + 600, from, tEnd);
  let prev = tLabel;
  const tSub = sub.map((s) => (prev = at(s, prev + 700, from, prev + 150)));
  const vis = fadeOut(ms, to);
  if (ms < tFig - 60 || vis <= 0) return null;

  // the count starts at 1 (never a "0.0%" frame) and lands ~200ms before the next word
  const q = EASE_IO(k(tFig, Math.max(500, tEnd - tFig - 200)));
  const v = 1 + (figure.value - 1) * q;
  const side = 10 * R.cell + 9 * R.gap;
  const x0 = 540 - side / 2;

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: R.figTop, textAlign: "center", fontFamily: DISPLAY, fontWeight: 700, color: W,
        fontSize: R.figSize, letterSpacing: TRACK.display, lineHeight: 1, opacity: k(tFig - 40, 140), fontVariantNumeric: "tabular-nums" }}>
        {fmt(v, figure.decimals)}{figure.suffix}
      </div>
      <svg width={1080} height={side} style={{ position: "absolute", left: 0, top: R.gridTop, opacity: k(tFig - 40, 200) }}>
        {Array.from({ length: 100 }).map((_, i) => {
          const x = x0 + (i % 10) * (R.cell + R.gap);
          const y = Math.floor(i / 10) * (R.cell + R.gap);
          const f = clamp01(v - i); // 0..1 of this cell filled (cell 31 ends 20% full)
          return (
            <g key={i}>
              <rect x={x} y={y} width={R.cell} height={R.cell} rx={10} fill={W} opacity={0.2} />
              {f > 0 ? <rect x={x} y={y + R.cell * (1 - f)} width={R.cell} height={R.cell * f} rx={f > 0.9 ? 10 : 3} fill={W} /> : null}
            </g>
          );
        })}
      </svg>
      <div style={{ position: "absolute", left: 60, right: 60, top: R.labelTop, textAlign: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: 72,
        letterSpacing: TRACK.headline, lineHeight: 1, color: W, ...popStyle(k(tLabel, 260), 14) }}>
        {label.text}
      </div>
      <div style={{ position: "absolute", left: 40, right: 40, top: R.subTop, display: "flex", justifyContent: "center", gap: 18, whiteSpace: "nowrap" }}>
        {sub.map((s, i) => (
          <span key={i} style={{ ...caps(i === 0 ? INK_SUB_ON_RED : W, 48), display: "inline-flex", gap: 18, ...popStyle(k(tSub[i], 240), 10) }}>
            {i > 0 ? <span style={{ color: INK_SUB_ON_RED }}>·</span> : null}
            {s.text}
          </span>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// GapChart — THE SPINE: two columns, one trial, a red gap (white card)
// ══════════════════════════════════════════════════════════════════════════
// 1% = 20px; 40.5% stands 810px tall. Baseline clears the reel's safe bottom.
export const GAP = { base: 1500, pxPer: 20, colW: 300, xs: [320, 760], figSize: 104, nameTop: 1530, seatA: 250, seatB: 372 };

type Col = { name: string; v1: number; v2: number; decimals: number };

export const GapChart: React.FC<Win & {
  a: Col & { word?: string; ms?: number }; // the new drug: stands on entry (a callback), rises at week 24
  b: Col & { word?: string; ms?: number; nameAdd: string; addWord?: string; addMs?: number }; // the blockbuster
  kicker: { text: string; word?: string; ms?: number; outWord?: string; outMs?: number };
  plate: { name: string; phase: string; word?: string; ms?: number; outWord?: string; outMs?: number };
  week: { from: string; to: string; word?: string; ms?: number }; // the tag flips
  fillB: Cued; fillBEnd: Cued; // b fills to v1 while its figure is voiced
  gap: Cued; // the slice above b's level turns red
  riseA: Cued; riseAEnd: Cued; // week 24: a rises
  riseB: Cued; riseBEnd: Cued; // week 24: b rises
}> = ({ from, to, a, b, kicker, plate, week, fillB, fillBEnd, gap, riseA, riseAEnd, riseB, riseBEnd }) => {
  const ms = useMs();
  const k = useK();
  const INK = COLORS.ink;
  const G = GAP;

  const tA = at(a, from + 250, from);
  const tKick = at({ word: kicker.word, ms: kicker.ms }, tA + 500, from, tA + 300);
  const tB = at(b, tKick + 500, from, tKick + 200);
  const tKickOut = at({ word: kicker.outWord, ms: kicker.outMs }, tB + 700, from, tB + 300);
  const tPlate = at({ word: plate.word, ms: plate.ms }, tKickOut + 300, from, tKickOut + 200);
  const tFillB = at(fillB, tPlate + 1500, from, tPlate + 300);
  const tFillBEnd = at(fillBEnd, tFillB + 1100, from, tFillB + 500);
  const tPlateOut = at({ word: plate.outWord, ms: plate.outMs }, tFillBEnd + 600, from, tFillBEnd);
  const tWeek = at({ word: week.word, ms: week.ms }, tPlateOut + 700, from, tPlateOut + 300);
  const tGap = at(gap, tWeek + 900, from, tWeek + 400);
  const tRiseA = at(riseA, tGap + 1100, from, tGap + 500);
  const tRiseAEnd = at(riseAEnd, tRiseA + 1300, from, tRiseA + 600);
  const tRiseB = at(riseB, tRiseAEnd + 1000, from, tRiseAEnd + 300);
  const tRiseBEnd = at(riseBEnd, tRiseB + 1000, from, tRiseB + 500);
  const tAdd = at({ word: b.addWord, ms: b.addMs }, tRiseBEnd + 1000, from, tRiseBEnd + 200);
  const vis = fadeOut(ms, to);
  if (ms < tA - 60 || vis <= 0) return null;

  // values: a stands on entry at v1, rises to v2; b fills 0 → v1, then rises to v2
  const aIn = EASE_IO(k(tA, 520));
  const aUp = EASE_IO(k(tRiseA, Math.max(500, tRiseAEnd - tRiseA - 150)));
  const valA = a.v1 + (a.v2 - a.v1) * aUp;
  const bFill = EASE_IO(k(tFillB, Math.max(500, tFillBEnd - tFillB - 150)));
  const bUp = EASE_IO(k(tRiseB, Math.max(400, tRiseBEnd - tRiseB - 150)));
  const valB = bFill < 1 ? Math.max(1, b.v1 * bFill) : b.v1 + (b.v2 - b.v1) * bUp;
  const hA = valA * G.pxPer * aIn;
  const hB = ms < tFillB ? 0 : valB * G.pxPer;
  const gapK = EASE(k(tGap, 420)); // the red rises up the slice from b's level

  const Figure: React.FC<{ x: number; top: number; text: string; o: number }> = ({ x, top, text, o }) => (
    <div style={{ position: "absolute", left: x - 260, width: 520, top: top - G.figSize - 22, textAlign: "center", fontFamily: DISPLAY, fontWeight: 700,
      fontSize: G.figSize, letterSpacing: TRACK.display, lineHeight: 1, color: INK, opacity: o, fontVariantNumeric: "tabular-nums" }}>{text}</div>
  );
  const colLeft = (i: number) => G.xs[i] - G.colW / 2;

  // the slot b fills into: dashed, at a's week-12 level (the reference), retires on "gap"
  const slotH = a.v1 * G.pxPer;
  const slotO = clamp01(k(tB, 260) * 1.6) * (1 - k(tGap, 300));

  // the week tag: an odometer flip, old number up and out, new one up and in
  const flip = EASE_IO(k(tWeek, 380));

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {/* seat A: the kicker, then the trial plate */}
      <div style={{ position: "absolute", left: 0, right: 0, top: G.seatA, textAlign: "center", ...caps(COLORS.grayText),
        ...popStyle(k(tKick, 260), 12), opacity: clamp01(k(tKick, 260) * 1.6) * (1 - k(tKickOut, 260)) }}>
        {kicker.text}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: G.seatA - 22, display: "flex", justifyContent: "center",
        opacity: clamp01(k(tPlate, 260) * 1.6) * (1 - k(tPlateOut, 280)), transform: `translateY(${(1 - EASE(k(tPlate, 260))) * 16}px)` }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, padding: "18px 38px", borderRadius: 18, border: `6px solid ${INK}`, fontFamily: DISPLAY,
          fontWeight: 700, fontSize: 52, letterSpacing: TRACK.headline, color: INK, whiteSpace: "nowrap" }}>
          <span>{plate.name}</span>
          <span style={{ color: inkA(0.3) }}>·</span>
          <span style={{ color: COLORS.grayText }}>{plate.phase}</span>
        </div>
      </div>

      {/* seat B: the week tag */}
      <div style={{ position: "absolute", left: 0, right: 0, top: G.seatB + 40, display: "flex", justifyContent: "center", opacity: clamp01(aIn * 1.4) }}>
        <div style={{ position: "relative", height: 76, padding: "0 34px", borderRadius: 38, background: INK, color: COLORS.paper, display: "flex",
          alignItems: "center", overflow: "hidden", fontFamily: DISPLAY, fontWeight: 700, fontSize: 46, letterSpacing: TRACK.headline, whiteSpace: "nowrap" }}>
          <span>Week&nbsp;</span>
          <span style={{ position: "relative", display: "inline-block", width: "1.25em", height: 76 }}>
            <span style={{ position: "absolute", left: 0, top: 0, lineHeight: "76px", transform: `translateY(${-76 * flip}px)` }}>{week.from}</span>
            <span style={{ position: "absolute", left: 0, top: 0, lineHeight: "76px", transform: `translateY(${76 * (1 - flip)}px)` }}>{week.to}</span>
          </span>
        </div>
      </div>

      {/* the baseline */}
      <div style={{ position: "absolute", left: 90, right: 90, top: G.base, height: 6, borderRadius: 3, background: INK, opacity: clamp01(aIn * 2) }} />

      {/* b's empty slot, dashed, at a's level */}
      {slotO > 0 ? (
        <div style={{ position: "absolute", left: colLeft(1), top: G.base - slotH, width: G.colW, height: slotH, boxSizing: "border-box",
          border: `5px dashed ${inkA(0.45)}`, borderBottom: "none", borderRadius: "16px 16px 0 0", opacity: slotO }} />
      ) : null}

      {/* column a: ink up to b's level, red above it once the gap is named */}
      <div style={{ position: "absolute", left: colLeft(0), top: G.base - hA, width: G.colW, height: hA, borderRadius: "16px 16px 0 0", background: INK, overflow: "hidden" }}>
        {gapK > 0 && hB > 0 ? (
          <div style={{ position: "absolute", left: 0, right: 0, bottom: hB, height: Math.max(0, hA - hB) * gapK, background: COLORS.accent }} />
        ) : null}
      </div>
      {/* column b */}
      {hB > 0 ? <div style={{ position: "absolute", left: colLeft(1), top: G.base - hB, width: G.colW, height: hB, borderRadius: "16px 16px 0 0", background: INK }} /> : null}

      <Figure x={G.xs[0]} top={G.base - hA} text={`${fmt(valA, a.decimals)}%`} o={clamp01(aIn * 1.6)} />
      {ms >= tFillB ? <Figure x={G.xs[1]} top={G.base - hB} text={`${fmt(valB, b.decimals)}%`} o={clamp01(k(tFillB - 40, 140))} /> : null}

      {/* names under the baseline */}
      {[a.name, b.name].map((n, i) => (
        <div key={i} style={{ position: "absolute", left: G.xs[i] - 240, width: 480, top: G.nameTop, textAlign: "center", fontFamily: DISPLAY, fontWeight: 700,
          fontSize: 52, letterSpacing: TRACK.headline, color: INK, whiteSpace: "nowrap", ...popStyle(i === 0 ? aIn : k(tB, 260), 10) }}>
          {n}
          {i === 1 ? (
            <span style={{ display: "inline-block", marginLeft: lerp(0, 14, k(tAdd, 200)), maxWidth: lerp(0, 220, EASE(k(tAdd, 300))), overflow: "hidden",
              verticalAlign: "bottom", color: COLORS.grayText, opacity: clamp01(k(tAdd, 300) * 1.4) }}>{b.nameAdd}</span>
          ) : null}
        </div>
      ))}
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// SelfBeat — not a competitor: the blockbuster, with a new drug seated on it (ink + scrim)
// ══════════════════════════════════════════════════════════════════════════
// The Pair glyph (kit/neo) carries the claim: ABBV-466 IS Skyrizi's molecule plus a
// second drug, so the thing that beat Skyrizi is built on Skyrizi.
export const SELF = { chipTop: 560, barTop: 1060, nameTop: 770, stampTop: 1300 };

export const SelfBeat: React.FC<Win & {
  chip: { text: string } & Cued; // a dashed rival that is not there
  strike: Cued; // struck out
  chipOut: Cued; // and gone
  bar: { label: string } & Cued; // the blockbuster slides in
  plug: { name: string } & Cued; // the new drug drops and seats on it
  name: { text: string } & Cued; // what the pair is called
  stamp: { text: string } & Cued;
}> = ({ from, to, chip, strike, chipOut, bar, plug, name, stamp }) => {
  const ms = useMs();
  const k = useK();
  const W = COLORS.paper;
  const S = SELF;

  const tChip = at(chip, from + 600, from);
  const tStrike = at(strike, tChip + 1000, from, tChip + 300);
  const tChipOut = at(chipOut, tStrike + 700, from, tStrike + 400);
  const tBar = at(bar, tChipOut + 300, from, tChipOut + 150);
  const tPlug = at(plug, tBar + 900, from, tBar + 500);
  const tSeat = tPlug + 320; // after the plug has arrived: one mover at a time
  const tName = at(name, tSeat + 300, from, tSeat + 200);
  const tStamp = at(stamp, tName + 600, from, tName + 300);
  const vis = fadeOut(ms, to);
  if (ms < tChip - 60 || vis <= 0) return null;

  const chipK = k(tChip, 260);
  const strikeK = EASE(k(tStrike, 280));
  const chipO = clamp01(chipK * 1.6) * (1 - k(tChipOut, 260));
  const stampK = k(tStamp, 300);

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {chipO > 0 ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: S.chipTop, display: "flex", justifyContent: "center", opacity: chipO,
          transform: `translateY(${(1 - EASE(chipK)) * 16 + k(tChipOut, 260) * 30}px)` }}>
          <div style={{ position: "relative", padding: "26px 52px", borderRadius: 24, border: `5px dashed ${W}`, fontFamily: DISPLAY, fontWeight: 700,
            fontSize: 84, letterSpacing: TRACK.headline, color: W, whiteSpace: "nowrap" }}>
            {chip.text}
            <div style={{ position: "absolute", left: -24, right: -24, top: "50%", height: 12, marginTop: -6, borderRadius: 6, background: W,
              transformOrigin: "left", transform: `rotate(-6deg) scaleX(${strikeK})` }} />
          </div>
        </div>
      ) : null}

      <div style={{ position: "absolute", left: 0, right: 0, top: S.nameTop, textAlign: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: 72,
        letterSpacing: TRACK.headline, lineHeight: 1, color: W, ...popStyle(k(tName, 260), 14) }}>
        {name.text}
      </div>

      {ms >= tBar - 60 ? (
        <Pair cx={540} barTop={S.barTop} tone="dark" barK={k(tBar, 520)} plugK={k(tPlug, 300)} seat={k(tSeat, 220)}
          plug={{ name: plug.name }} bar={bar.label} />
      ) : null}

      <div style={{ position: "absolute", left: 0, right: 0, top: S.stampTop, textAlign: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: 112,
        letterSpacing: TRACK.display, lineHeight: 1, color: W, opacity: clamp01(stampK * 2), transform: `scale(${lerp(1.16, 1, EASE(stampK))})` }}>
        {stamp.text}
      </div>
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// Thesis — the read, as type that lands on its words (red world)
// ══════════════════════════════════════════════════════════════════════════
// Line 1 lands, then travels up and quiets when line 2 starts; line 1 retires when
// line 3 starts. Settled frame: line 2 (the hero) + line 3.
export const THESIS = { one: 560, oneUp: 330, two: 700, three: 1220, size: 92, size3: 64 };

export const Thesis: React.FC<Win & {
  one: { line: string; to: number };
  two: { line: string; emphasize: string; from: number; to: number };
  three: { line: string; from: number };
}> = ({ from, to, one, two, three }) => {
  const ms = useMs();
  const k = useK();
  const T = THESIS;
  const W = COLORS.paper;
  const vis = fadeOut(ms, to);
  if (ms < from - 60 || vis <= 0) return null;

  const up = EASE_IO(k(two.from - 80, 420));
  const oneOut = 1 - k(three.from - 80, 300);

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <div style={{ position: "absolute", left: 80, right: 80, top: lerp(T.one, T.oneUp, up), opacity: oneOut * lerp(1, 0.8, up),
        transform: `scale(${lerp(1, 0.72, up)})`, transformOrigin: "50% 0" }}>
        <FlowLine from={from} to={one.to} line={one.line} size={T.size} color={W} align="center" />
      </div>
      <div style={{ position: "absolute", left: 80, right: 80, top: T.two }}>
        <FlowLine from={two.from} to={two.to} line={two.line} size={T.size} color={W} restColor={INK_SUB_ON_RED} emphasize={two.emphasize}
          empColor={W} underline={W} align="center" />
      </div>
      <div style={{ position: "absolute", left: 80, right: 80, top: T.three }}>
        <FlowLine from={three.from} to={to} line={three.line} size={T.size3} color={W} align="center" />
      </div>
    </AbsoluteFill>
  );
};
