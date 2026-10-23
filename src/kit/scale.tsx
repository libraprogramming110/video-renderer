// ─────────────────────────────────────────────────────────────────────────
// KIT · scale — HOW MANY, AND HOW OFTEN. Added on the Lilly Onswik long-form,
// 2026-09-26.
//
// CrowdField — "Over N adults tested across the Phase 3 program."
//   The figure EMITS its people: as N is voiced it counts up, and every unit it
//   counts leaves the number as a dot and arcs down to its seat in a field, in
//   bloom order (centre out). The count is a readout of the dots landed, so the
//   picture and the number never disagree. Exactly N dots — one per person, the
//   one honest dot field for a head count. "Over" = a short trail of extra dots
//   fading out under the last row (a floor, not a total: the UncappedFigure
//   idea, 2026-08-06). "Tested" = a scanner beam sweeps the field and lights
//   every dot it passes. Red world, white marks.
//
// YearCollapse — "One weekly shot replaces more than 300 daily injections a year."
//   One red shot stamps alone, then flies into the first seat of a year grid
//   (26 rows × 14 = 364 days, two weeks a row). The days FLOOD in black while the
//   count runs to 300 and on past it ("more than": the counter becomes "300+"
//   and the grid keeps filling to the full year). Then, week by week down the
//   grid, the six extra days ZIP SHUT into their week's single shot, which turns
//   red: 7 → 1, performed, 52 times. No "52" is printed — the VO never says it;
//   the red columns simply ARE it. White card.
//
// Deterministic throughout (hash of the index, never Math.random()).
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, interpolate, Easing } from "remotion";
import { CLAMP, clamp01, COLORS, cue, DISPLAY, SANS, TRACK, useMs, useAccent, useInkSub, inkA } from "./core";
import { TYPE } from "../style";

const EASE = Easing.out(Easing.cubic);
const EASE_IO = Easing.inOut(Easing.cubic);
type Win = { from: number; to: number };
type Cued = { word?: string; ms?: number };

const useVis = (from: number, to: number, padIn = 300, padOut = 360) => {
  const ms = useMs();
  return clamp01(interpolate(ms, [from, from + padIn, to - padOut, to], [0, 1, 1, 0], CLAMP));
};
const hash = (i: number) => {
  const s = Math.sin(i * 12.9898 + 78.233) * 43758.5453;
  return s - Math.floor(s);
};
const fmt = (n: number) => Math.round(n).toLocaleString("en-US");

// ── CrowdField ──────────────────────────────────────────────────────────────
const CF = { cols: 50, px: 18, py: 13, top: 580, numY: 250, numSize: 240, originY: 370 };

type Seat = { x: number; y: number; rank: number; jx: number; jy: number };
const seatCache = new Map<number, Seat[]>();
const seatsFor = (n: number): Seat[] => {
  const hit = seatCache.get(n);
  if (hit) return hit;
  const rows = Math.ceil(n / CF.cols);
  const x0 = 540 - ((CF.cols - 1) * CF.px) / 2;
  const cx = 540, cy = CF.top + ((rows - 1) * CF.py) / 2;
  const raw = Array.from({ length: n }, (_, i) => {
    const c = i % CF.cols, r = Math.floor(i / CF.cols);
    const x = x0 + c * CF.px, y = CF.top + r * CF.py;
    const d = Math.hypot((x - cx) / 1.4, y - cy) + hash(i) * 40; // bloom, softened
    return { x, y, d, jx: (hash(i + 7) - 0.5) * 260, jy: (hash(i + 13) - 0.5) * 60 };
  });
  const order = raw.map((s, i) => [s.d, i] as const).sort((a, b) => a[0] - b[0]);
  const rank = new Array<number>(n);
  order.forEach(([, i], k) => (rank[i] = k));
  const out = raw.map((s, i) => ({ x: s.x, y: s.y, rank: rank[i], jx: s.jx, jy: s.jy }));
  seatCache.set(n, out);
  return out;
};

export const CrowdField: React.FC<Win & {
  kicker: { label: string } & Cued;
  figure: { value: number; durMs: number } & Cued;
  unit: { label: string } & Cued;
  scan: Cued & { durMs: number };
  program: { label: string } & Cued;
  /** extra dots trailing out under the field ("over") */
  overflow?: number;
}> = ({ from, to, kicker, figure, unit, scan, program, overflow = 70 }) => {
  const ms = useMs();
  const sub = useInkSub();
  const vis = useVis(from, to);
  const k = (a: number, d: number) => clamp01(interpolate(ms, [a, a + d], [0, 1], CLAMP));
  const N = figure.value;
  const seats = seatsFor(N);

  const tKick = kicker.ms ?? cue(kicker.word, from + 200, from);
  const tFig = Math.max(tKick + 150, figure.ms ?? cue(figure.word, tKick + 300, from));
  const tUnit = Math.max(tFig + 300, unit.ms ?? cue(unit.word, tFig + figure.durMs, from));
  const tScan = Math.max(tUnit + 200, scan.ms ?? cue(scan.word, tUnit + 600, from));
  const tProg = Math.max(tScan + 300, program.ms ?? cue(program.word, tScan + 1000, from));

  const FLIGHT = 520;
  // launch time of rank r: spread across the voiced figure
  const launch = (r: number) => tFig + (r / N) * figure.durMs;
  const launchedP = clamp01((ms - tFig) / figure.durMs);
  const shown = Math.min(N, Math.max(0, Math.floor(interpolate(ms, [tFig + 80, tFig + figure.durMs + FLIGHT], [0, N], { ...CLAMP, easing: Easing.out(Easing.quad) }))));
  const figOn = k(tFig - 60, 200);
  const pulse = launchedP > 0 && launchedP < 1 ? 1 + 0.04 * Math.sin(ms / 40) : 1;

  const rows = Math.ceil(N / CF.cols);
  const fieldBottom = CF.top + (rows - 1) * CF.py;
  const beamY = interpolate(ms, [tScan, tScan + scan.durMs], [CF.top - 30, fieldBottom + 30], { ...CLAMP, easing: EASE_IO });
  const beamOn = ms >= tScan && ms <= tScan + scan.durMs + 250 ? 1 - k(tScan + scan.durMs, 250) : 0;

  const dots: React.ReactNode[] = [];
  for (let i = 0; i < N; i++) {
    const s = seats[i];
    const t0 = launch(s.rank);
    if (ms < t0) continue;
    const p = EASE(clamp01((ms - t0) / FLIGHT));
    // arc: out of the number, up a touch, then down to the seat
    const x = interpolate(p, [0, 1], [540 + s.jx * 0.2, s.x]) + Math.sin(p * Math.PI) * s.jx * 0.6;
    const y = interpolate(p, [0, 1], [CF.originY, s.y]) - Math.sin(p * Math.PI) * (80 + Math.abs(s.jy));
    const tested = ms >= tScan && s.y <= beamY;
    const glow = tested ? clamp01((beamY - s.y) / 60) : 0;
    const r = 3.6 + glow * 1.4 + (p < 1 ? 1 : 0);
    dots.push(<circle key={i} cx={x} cy={y} r={r} fill={COLORS.paper} opacity={0.42 + glow * 0.58} />);
  }
  // "over": a trail of extra dots under the last row, fading to nothing
  const overP = k(tFig + figure.durMs + FLIGHT, 700);
  for (let j = 0; j < overflow && overP > 0; j++) {
    const c = j % CF.cols;
    const x = 540 - ((CF.cols - 1) * CF.px) / 2 + c * CF.px;
    const y = fieldBottom + CF.py * (1 + Math.floor(j / CF.cols));
    const fade = 1 - j / overflow;
    if (hash(j + 99) > fade + 0.15) continue;
    dots.push(<circle key={`o${j}`} cx={x} cy={y} r={3.2} fill={COLORS.paper} opacity={overP * 0.38 * fade} />);
  }

  const kP = k(tKick, 260);
  const uP = k(tUnit, 260);
  const prP = { o: k(tProg, 150), s: interpolate(ms, [tProg, tProg + 300], [1.2, 1], { ...CLAMP, easing: EASE }) };

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: CF.numY - 70, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: TYPE.label, letterSpacing: TRACK.nav, color: sub, opacity: kP }}>{kicker.label}</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: CF.numY - 30, textAlign: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: CF.numSize, letterSpacing: TRACK.display, lineHeight: 1, color: COLORS.paper, opacity: figOn, transform: `scale(${pulse})`, fontVariantNumeric: "tabular-nums" }}>
        {fmt(shown)}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: CF.numY + 222, textAlign: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: 64, letterSpacing: TRACK.headline, color: COLORS.paper, opacity: uP, transform: `translateY(${(1 - uP) * 14}px)` }}>{unit.label}</div>

      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {dots}
        {beamOn > 0 ? (
          <>
            <defs>
              <linearGradient id="cfBeam" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#fff" stopOpacity="0" />
                <stop offset="1" stopColor="#fff" stopOpacity="0.35" />
              </linearGradient>
            </defs>
            <rect x={60} y={beamY - 90} width={960} height={90} fill="url(#cfBeam)" opacity={beamOn} />
            <line x1={60} x2={1020} y1={beamY} y2={beamY} stroke="#fff" strokeWidth={4} opacity={beamOn} />
          </>
        ) : null}
      </svg>

      <div style={{ position: "absolute", left: 0, right: 0, top: fieldBottom + 64, textAlign: "center" }}>
        <span style={{ display: "inline-block", fontFamily: DISPLAY, fontWeight: 700, fontSize: 76, letterSpacing: TRACK.display, color: COLORS.paper, opacity: prP.o, transform: `scale(${prP.s})` }}>{program.label}</span>
      </div>
    </AbsoluteFill>
  );
};

// ── YearCollapse ────────────────────────────────────────────────────────────
const YC = { cols: 14, rows: 26, pitch: 40, cell: 31, top: 540, heroY: 960, heroSize: 280 };
const ycX = (c: number) => 540 - ((YC.cols - 1) * YC.pitch) / 2 + c * YC.pitch;
const ycY = (r: number) => YC.top + r * YC.pitch;

export const YearCollapse: React.FC<Win & {
  /** "One weekly shot" — VERBATIM, flows word by word under the hero */
  hero: { line: string } & Cued;
  replace: Cued;
  more: { label: string } & Cued;
  figure: { value: number; durMs: number } & Cued;
  unit: { label: string } & Cued;
  year: { label: string } & Cued;
}> = ({ from, to, hero, replace, more, figure, unit, year }) => {
  const ms = useMs();
  const acc = useAccent();
  const vis = useVis(from, to);
  const k = (a: number, d: number) => clamp01(interpolate(ms, [a, a + d], [0, 1], CLAMP));
  const DAYS = YC.cols * YC.rows;

  const tHero = hero.ms ?? cue(hero.word, from + 300, from);
  const tRep = Math.max(tHero + 500, replace.ms ?? cue(replace.word, tHero + 1000, from));
  const tMore = Math.max(tRep + 200, more.ms ?? cue(more.word, tRep + 400, from));
  const tFig = Math.max(tMore + 200, figure.ms ?? cue(figure.word, tMore + 600, from));
  const t300 = tFig + figure.durMs; // the count reaches the figure here
  const tUnit = Math.max(tFig + 300, unit.ms ?? cue(unit.word, t300, from));
  const tFull = Math.max(t300 + 300, tUnit + 200); // the grid reaches the full year
  const tYear = Math.max(tFull - 150, year.ms ?? cue(year.word, tFull + 300, from));
  const tZip = Math.max(tFull + 60, tYear - 280); // the zip begins just ahead of "a year"
  const ZIP_ROW = 16; // ms stagger per row: the zip cascades down the year
  const ZIP_DUR = 420;

  // ── hero: stamps, then flies into seat (0,0) ──
  const hIn = k(tHero, 300);
  const hStamp = interpolate(ms, [tHero, tHero + 320], [1.25, 1], { ...CLAMP, easing: EASE });
  const fly = EASE_IO(k(tRep, 560));
  const hx = interpolate(fly, [0, 1], [540, ycX(0)]);
  const hy = interpolate(fly, [0, 1], [YC.heroY, ycY(0)]);
  const hs = interpolate(fly, [0, 1], [YC.heroSize, YC.cell]);
  const hr = interpolate(fly, [0, 1], [34, 5]);
  // hero words, each on its spoken frame
  const words = hero.line.split(" ");
  const onsets: number[] = [];
  words.forEach((w, i) => onsets.push(Math.max(i ? onsets[i - 1] + 60 : tHero, cue(w, (i ? onsets[i - 1] : tHero) + 250, i ? onsets[i - 1] + 1 : from))));
  const lineOut = 1 - k(tRep, 300);

  // ── the flood: day i fills at fillT(i), in reading order ──
  const fillT = (i: number) =>
    i < figure.value
      ? tFig + (i / figure.value) * figure.durMs
      : t300 + ((i - figure.value) / (DAYS - figure.value)) * (tFull - t300);
  const count = Math.min(figure.value, Math.floor(interpolate(ms, [tFig, t300], [0, figure.value], CLAMP)));
  const plus = k(t300, 200);

  const cells: React.ReactNode[] = [];
  for (let r = 0; r < YC.rows; r++) {
    const zr = EASE_IO(k(tZip + r * ZIP_ROW, ZIP_DUR));
    for (let c = 0; c < YC.cols; c++) {
      const i = r * YC.cols + c;
      const weekly = c % 7 === 0;
      // outline ripple-in on "replaces": a diagonal wave
      const wave = k(tRep + 200 + (r + c) * 14, 260);
      if (wave <= 0) continue;
      const f = k(fillT(i), 90);
      const anchor = c - (c % 7); // this day's weekly seat
      const dx = weekly ? 0 : (ycX(anchor) - ycX(c)) * zr;
      const sc = weekly ? 1 + 0.18 * Math.sin(Math.PI * zr) : interpolate(zr, [0, 1], [1, 0.35]);
      const op = weekly ? 1 : 1 - zr;
      const fillCol = weekly && zr > 0.5 ? acc : COLORS.ink;
      if (r === 0 && c === 0 && fly < 1) continue; // the hero is still in flight to this seat
      cells.push(
        <rect
          key={i}
          x={ycX(c) + dx - (YC.cell * sc) / 2}
          y={ycY(r) - (YC.cell * sc) / 2}
          width={YC.cell * sc}
          height={YC.cell * sc}
          rx={5}
          fill={r === 0 && c === 0 ? acc : f > 0 ? fillCol : "none"}
          fillOpacity={r === 0 && c === 0 ? 1 : f}
          stroke={inkA(0.16)}
          strokeWidth={2}
          opacity={wave * op}
        />,
      );
    }
  }

  const moreP = k(tMore, 240);
  const figOn = k(tFig - 60, 200);
  const unitP = k(tUnit, 240);
  const yearP = k(tYear, 240);
  const dim = k(tZip + 200, 600); // the daily count steps back once the zip runs

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {/* the counter block */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 170, textAlign: "center" }}>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: TYPE.label, letterSpacing: TRACK.nav, color: COLORS.grayText, opacity: moreP }}>{more.label}</div>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 170, lineHeight: 1.05, letterSpacing: TRACK.display, color: dim > 0 ? `rgba(0,0,0,${1 - dim * 0.6})` : COLORS.ink, opacity: figOn, fontVariantNumeric: "tabular-nums" }}>
          {count}
          <span style={{ opacity: plus }}>+</span>
        </div>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 52, letterSpacing: TRACK.headline, color: COLORS.ink, marginTop: -4 }}>
          <span style={{ opacity: unitP * (1 - dim * 0.6) }}>{unit.label}</span>
          <span style={{ opacity: yearP, color: acc }}> {year.label}</span>
        </div>
      </div>

      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {cells}
        {/* the hero shot, in flight to seat (0,0) */}
        {fly < 1 ? (
          <rect x={hx - (hs * hStamp) / 2} y={hy - (hs * hStamp) / 2} width={hs * hStamp} height={hs * hStamp} rx={hr} fill={acc} opacity={hIn}
            transform={`rotate(${Math.sin(fly * Math.PI) * 14} ${hx} ${hy})`} />
        ) : null}
      </svg>

      {/* "One weekly shot", verbatim, under the hero */}
      <div style={{ position: "absolute", left: 0, right: 0, top: YC.heroY + YC.heroSize / 2 + 50, display: "flex", justifyContent: "center", gap: 22, opacity: lineOut }}>
        {words.map((w, i) => {
          const p = k(onsets[i], 130);
          return (
            <span key={i} style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 88, letterSpacing: TRACK.display, color: COLORS.ink, opacity: p, transform: `translateY(${(1 - p) * 12}px)` }}>{w}</span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
