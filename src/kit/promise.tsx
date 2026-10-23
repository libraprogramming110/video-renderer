// ─────────────────────────────────────────────────────────────────────────
// KIT · promise — "Why it matters" for the Onswik horizontal long-form,
// 2026-09-27. 1920×1080. Three blocks, three worlds:
//
//   PitchSame     — ink. Two pens, SCANNED as identical. The WEEK returns: seven
//                   marks, one turns red, the other six DROP under gravity; the red
//                   one travels down to seed a tower that RAINS to 52 while a grey
//                   tower rains to 365 beside it (a year as height). Two claim cards
//                   slide together and LOCK into one; "two drugs" splits it into two
//                   ghosts that snap back on "same promise". On "competition moves"
//                   the red focus ring leaves the card and becomes an ORBIT; satellites
//                   light round it ("everything around it"); one grows into "Delivery"
//                   and comes forward — the element that crosses the wipe.
//   DeliveryDials — white card. "Delivery" docks as the kicker. Two pens slide in;
//                   their dose windows are ODOMETERS that roll to 400 and 800 as voiced;
//                   both knobs press on "single injection". Across a divider, a 1 mL cube
//                   fills with 700 poured dots — concentration shown as DENSITY, a
//                   different kind of number on purpose (no head-to-head bar).
//   CategoryBeam  — red. A beam labelled for the class teeters on ONE pillar; the
//                   second sponsor's pillar rises under it and it settles LEVEL (damped,
//                   thud); "not one company's differentiator" drops a tag onto the beam,
//                   strikes it, and tips it off.
// Every onset takes a cue word + an ms override.
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, interpolate, Easing } from "remotion";
import { CLAMP, clamp01, COLORS, cue, DISPLAY, SANS, TRACK, useMs, useAccent, useInkSub, INK_SUB, inkA } from "./core";
import { FlowLine } from "./flowline";
import { InsulinPen, DAYS } from "./weekly";
import { TYPE } from "../style";

const EASE = Easing.out(Easing.cubic);
const EASE_IN = Easing.in(Easing.cubic);
const EASE_IO = Easing.inOut(Easing.cubic);
const W = 1920;
const H = 1080;

type Win = { from: number; to: number };
type Cue = { word?: string; ms?: number };
type Sentence = { line: string; emphasize?: string } & Cue;
const at = (c: Cue | undefined, fb: number, after: number) => c?.ms ?? cue(c?.word, fb, after);
const kf = (ms: number, a: number, d: number) => clamp01(interpolate(ms, [a, a + d], [0, 1], CLAMP));
const damp = (s: number, k = 4.5, w = 9) => (s < 0 ? 0 : Math.exp(-k * s) * Math.cos(w * s));
const hash = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const lab = (color: string, size = TYPE.label): React.CSSProperties => ({ fontFamily: SANS, fontWeight: 700, fontSize: size, letterSpacing: TRACK.nav, color, whiteSpace: "nowrap" });

/** resolve an ordered list of cues, each floored on the previous */
function chain<K extends string>(from: number, cues: Record<K, Cue>, order: [K, number][]) {
  const T = {} as Record<K, number>;
  let prev = from;
  for (const [k, fb] of order) {
    const t = Math.max(prev + 60, at(cues[k], prev + fb, prev));
    T[k] = t;
    prev = t;
  }
  return T;
}

/** narration: one seat, lines swap as their sentence starts */
const Narration: React.FC<{ lines: Sentence[]; starts: number[]; ends: number[]; size: number; color: string; rest: string; top?: number; width?: number; underline?: string }> = ({
  lines, starts, ends, size, color, rest, top = 90, width = 1700, underline,
}) => {
  const ms = useMs();
  return (
    <>
      {lines.map((l, i) => (
        <div key={i} style={{ position: "absolute", left: 110, top, width, opacity: kf(ms, starts[i] - 150, 200) * (1 - kf(ms, ends[i] - 220, 220)) }}>
          <FlowLine from={starts[i] - 60} to={ends[i]} line={l.line} size={size} color={color} restColor={rest} restWeight={400} emphasize={l.emphasize} empColor={color} underline={underline} lineHeight={1.12} />
        </div>
      ))}
    </>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// PitchSame — ink
// ══════════════════════════════════════════════════════════════════════════
export const PITCH = { cx: 960, cy: 540, chipScale: 1 };

export const PitchSame: React.FC<Win & {
  lines: [Sentence, Sentence, Sentence, Sentence, Sentence];
  names: [string, string];
  claim: string;
  towers: { weekly: string; daily: string; a: number; b: number };
  chip: string;
  cues: Record<"why" | "identical" | "one" | "week" | "seven" | "n52" | "n365" | "claim" | "same" | "two" | "promise" | "moves" | "around" | "delivery", Cue>;
}> = ({ from, to, lines, names, claim, towers, chip, cues }) => {
  const ms = useMs();
  const acc = useAccent();
  const white = COLORS.paper;
  const vis = clamp01(interpolate(ms, [from, from + 1, to - 300, to], [0, 1, 1, 0], CLAMP));
  const T = chain(from, cues, [
    ["why", 600], ["identical", 2400], ["one", 1200], ["week", 700], ["seven", 400], ["n52", 1500], ["n365", 2100],
    ["claim", 1300], ["same", 2000], ["two", 2900], ["promise", 900], ["moves", 1100], ["around", 900], ["delivery", 1600],
  ]);
  const tSec = ms / 1000;

  // ── (a) pens, scanned ──
  const pensIn = EASE(kf(ms, T.why - 200, 600));
  const pensOut = EASE_IN(kf(ms, T.one - 150, 450));
  const scan = kf(ms, T.identical, 700);
  const eqU = kf(ms, T.identical + 500, 300);
  const PX = [800, 1120];

  // ── (b) the week, then the towers ──
  const cell = 120;
  const gap = 16;
  const sx0 = 960 - (7 * cell + 6 * gap) / 2;
  const SY = 380;
  const stripIn = (i: number) => EASE(kf(ms, T.one + 100 + i * 50, 350));
  const stripOut = EASE_IN(kf(ms, T.n52 - 100, 500));
  const redMark = kf(ms, T.week, 250);
  const fallT = (i: number) => T.seven + (i - 1) * 90; // six marks fall, Monday stays
  const TW = { base: 930, wx: 620, dx: 1000, w: 200, pitch: 1.75 };
  const towersOut = EASE_IN(kf(ms, T.claim - 100, 500));
  const nW = Math.round(towers.a * EASE_IO(kf(ms, T.n52, 950)));
  const nD = Math.round(towers.b * EASE_IO(kf(ms, T.n365, 1000)));
  const seedU = EASE_IO(kf(ms, T.n52 - 250, 400)); // Monday's red mark travels to the weekly tower base

  // ── (c) claim cards lock; (d) orbit ──
  const cardsIn = EASE(kf(ms, T.claim + 100, 600));
  const lockU = EASE_IO(kf(ms, T.same - 100, 550));
  const twoSplit = kf(ms, T.two, 250) * (1 - EASE_IO(kf(ms, T.promise, 350)));
  const sLock = (ms - T.same - 450) / 1000;
  const lockThud = sLock > 0 ? 6 * damp(sLock, 7, 26) : 0;
  const ringOn = kf(ms, T.same + 450, 250);
  const ringOut = EASE_IO(kf(ms, T.moves, 900));
  const satOn = kf(ms, T.moves + 200, 500);
  const delivU = EASE_IO(kf(ms, T.delivery, 750));
  const cardDim = 1 - 0.7 * delivU;
  const CARD = { w: 820, h: 220 };
  const cardX = (side: number) => {
    const apart = side * 420 * (1 - lockU);
    return 960 + apart + side * 26 * twoSplit;
  };
  const ORB = [
    { rx: 560, ry: 190, n: 12, v: 0.22 },
    { rx: 690, ry: 250, n: 14, v: -0.16 },
    { rx: 800, ry: 300, n: 16, v: 0.12 },
  ];
  const sats: { x: number; y: number; front: boolean; o: number; k: number }[] = [];
  ORB.forEach((o, oi) => {
    for (let j = 0; j < o.n; j++) {
      const a = (j / o.n) * Math.PI * 2 + tSec * o.v + oi;
      const x = 960 + Math.cos(a) * o.rx;
      const y = 540 + Math.sin(a) * o.ry;
      sats.push({ x, y, front: Math.sin(a) > 0, o: oi, k: sats.length });
    }
  });
  const DELIV = 5; // the satellite that becomes "Delivery"
  const wave = (k: number) => kf(ms, T.around + (k % 14) * 45, 200);
  const dSat = sats[DELIV];
  const chipX = dSat.x + (PITCH.cx - dSat.x) * delivU;
  const chipY = dSat.y + (PITCH.cy - dSat.y) * delivU;

  const satLayer = (front: boolean) =>
    satOn > 0
      ? sats.filter((s) => s.front === front).map((s) => {
          if (s.k === DELIV && delivU > 0) return null;
          const lit = wave(s.k);
          const r = 7 + 5 * hash(s.k) + 3 * lit;
          const o = satOn * (0.35 + 0.55 * lit) * (1 - 0.6 * delivU);
          return <circle key={s.k} cx={s.x} cy={s.y} r={r} fill={white} opacity={o} />;
        })
      : null;

  const starts = [at(lines[0], T.why - 100, from), T.one - 20, T.claim - 20, at(lines[3], T.two - 200, T.claim), T.delivery - 20];
  const ends = [T.one, T.claim, starts[3], T.delivery, to];

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {/* (a) pens */}
        {pensIn > 0 && pensOut < 1 ? (
          <g opacity={pensIn * (1 - pensOut)} transform={`translate(0 ${-500 * pensOut})`}>
            {PX.map((x, i) => (
              <InsulinPen key={i} cx={x} cy={560 + (1 - pensIn) * 200} h={460} body={white} cap={white} detail={COLORS.ink} window={COLORS.ink} />
            ))}
            {scan > 0 && scan < 1 ? (
              <g>
                <rect x={640} y={330 + scan * 460 - 3} width={640} height={6} fill={acc} />
                <rect x={640} y={330 + scan * 460 - 40} width={640} height={40} fill={acc} opacity={0.18} />
              </g>
            ) : null}
            <g opacity={eqU} transform={`translate(960 560) scale(${interpolate(eqU, [0, 1], [1.6, 1])})`}>
              <rect x={-34} y={-22} width={68} height={12} fill={white} />
              <rect x={-34} y={10} width={68} height={12} fill={white} />
            </g>
          </g>
        ) : null}

        {/* (b) the week strip */}
        {ms > T.one && stripOut < 1 ? (
          <g opacity={1 - stripOut}>
            {DAYS.map((d, i) => {
              const a = stripIn(i);
              const x = sx0 + i * (cell + gap);
              return (
                <g key={i} opacity={a} transform={`translate(0 ${(1 - a) * 30})`}>
                  <rect x={x} y={SY} width={cell} height={cell + 40} rx={14} fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth={3} />
                  <text x={x + cell / 2} y={SY + cell + 22} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={30} fill={INK_SUB}>{d}</text>
                </g>
              );
            })}
            {DAYS.map((_, i) => {
              const a = stripIn(i);
              const x = sx0 + i * (cell + gap) + cell / 2;
              if (i === 0) {
                const g = 1 + 0.35 * redMark;
                return <rect key={i} x={x - 9 * g} y={SY + 22} width={18 * g} height={70 * g} rx={6} fill={redMark > 0.5 ? acc : white} opacity={a * (1 - seedU)} />;
              }
              const t0 = fallT(i);
              const s = Math.max(0, (ms - t0) / 1000);
              const dy = 2600 * s * s;
              const rot = s * (i % 2 ? 160 : -140);
              return <rect key={i} x={x - 9} y={SY + 22 + dy} width={18} height={70} rx={6} fill={white} opacity={a * (dy > 700 ? 0 : 1)} transform={`rotate(${rot} ${x} ${SY + 57 + dy})`} />;
            })}
          </g>
        ) : null}
        {/* the red mark travelling to seed the weekly tower */}
        {seedU > 0 && seedU < 1 ? (
          <rect x={sx0 + cell / 2 - 12 + (TW.wx + TW.w / 2 - sx0 - cell / 2) * seedU} y={SY + 22 + (TW.base - 20 - SY - 22) * seedU} width={24} height={40} rx={6} fill={acc} />
        ) : null}

        {/* towers */}
        {ms > T.n52 - 100 && towersOut < 1 ? (
          <g opacity={1 - towersOut} transform={`translate(0 ${towersOut * 500})`}>
            <line x1={TW.wx - 60} x2={TW.dx + TW.w + 60} y1={TW.base} y2={TW.base} stroke={white} strokeWidth={4} />
            {[{ x: TW.wx, n: nW, col: acc, t: T.n52 }, { x: TW.dx, n: nD, col: "rgba(255,255,255,0.78)", t: T.n365 }].map((tw, k) => {
              const h = tw.n * TW.pitch;
              const rain = ms > tw.t && ms < tw.t + 1100;
              return (
                <g key={k}>
                  <rect x={tw.x} y={TW.base - h} width={TW.w} height={h} fill={tw.col} />
                  {/* stripes read as stacked doses */}
                  {Array.from({ length: Math.floor(h / 14) }, (_, j) => (
                    <line key={j} x1={tw.x} x2={tw.x + TW.w} y1={TW.base - j * 14 - 7} y2={TW.base - j * 14 - 7} stroke={COLORS.ink} strokeWidth={2} opacity={0.25} />
                  ))}
                  {rain
                    ? Array.from({ length: 14 }, (_, j) => {
                        const ph = ((ms - tw.t) / 260 + hash(j + k * 50)) % 1;
                        const y = -40 + ph * (TW.base - h + 40);
                        return <rect key={j} x={tw.x + 10 + hash(j + 3 + k) * (TW.w - 40)} y={y} width={22} height={6} rx={2} fill={tw.col} opacity={0.9} />;
                      })
                    : null}
                </g>
              );
            })}
          </g>
        ) : null}

        {/* (d) orbit: back layer */}
        {satLayer(false)}
        {ringOn > 0 && delivU < 1 ? (
          ringOut < 1 ? (
            <rect x={960 - (CARD.w / 2 + 18) - ringOut * (690 - CARD.w / 2 - 18)} y={540 - (CARD.h / 2 + 18) - ringOut * (250 - CARD.h / 2 - 18)}
              width={(CARD.w + 36) + ringOut * (1380 - CARD.w - 36)} height={(CARD.h + 36) + ringOut * (500 - CARD.h - 36)}
              rx={20 + ringOut * 250} fill="none" stroke={acc} strokeWidth={5} opacity={ringOn} />
          ) : (
            <ellipse cx={960} cy={540} rx={690} ry={250} fill="none" stroke={acc} strokeWidth={4} opacity={0.9 * (1 - delivU)} />
          )
        ) : null}
      </svg>

      {/* tower counts */}
      {ms > T.n52 && towersOut < 1 ? (
        <>
          <div style={{ position: "absolute", left: TW.wx + TW.w + 24, top: TW.base - nW * TW.pitch - 90, opacity: 1 - towersOut }}>
            <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 96, lineHeight: 1, letterSpacing: TRACK.display, color: acc, fontVariantNumeric: "tabular-nums" }}>{nW}</div>
            <div style={lab(white)}>{towers.weekly}</div>
          </div>
          {ms > T.n365 ? (
            <div style={{ position: "absolute", left: TW.dx + TW.w + 24, top: TW.base - nD * TW.pitch, opacity: 1 - towersOut }}>
              <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 96, lineHeight: 1, letterSpacing: TRACK.display, color: white, fontVariantNumeric: "tabular-nums" }}>{nD}</div>
              <div style={lab(INK_SUB)}>{towers.daily}</div>
            </div>
          ) : null}
        </>
      ) : null}

      {/* (c) the claim cards */}
      {cardsIn > 0
        ? [-1, 1].map((side, i) => (
            <div key={i} style={{
              position: "absolute", left: cardX(side) - CARD.w / 2, top: 540 - CARD.h / 2 + lockThud, width: CARD.w, height: CARD.h, boxSizing: "border-box",
              border: `4px solid ${white}`, borderRadius: 18, background: i === 1 ? COLORS.inkSoft : "rgba(20,20,20,0.6)", padding: "28px 36px",
              opacity: cardsIn * (i === 0 ? 1 - lockU * 0.4 : 1) * cardDim, transform: `translateX(${side * (1 - cardsIn) * 700}px)`,
            }}>
              <div style={{ ...lab(INK_SUB), opacity: 1 - lockU }}>{names[i]}</div>
              <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 60, lineHeight: 1.05, letterSpacing: TRACK.headline, color: white, marginTop: 10 }}>{claim}</div>
            </div>
          ))
        : null}
      {/* both names under the locked card */}
      <div style={{ position: "absolute", left: 960 - 400, width: 800, top: 540 + CARD.h / 2 + 24, textAlign: "center", opacity: kf(ms, T.same + 500, 300) * cardDim * (1 - satOn * 0.0), ...lab(INK_SUB) }}>
        {names[0]} · {names[1]}
      </div>

      {/* orbit: front layer */}
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>{satLayer(true)}</svg>

      {/* "Delivery" grows out of the orbit */}
      {delivU > 0 ? (
        <div style={{
          position: "absolute", left: chipX, top: chipY, transform: `translate(-50%, -50%) scale(${0.2 + 0.8 * delivU})`,
          padding: "22px 44px", borderRadius: 999, background: white, opacity: clamp01(delivU * 3),
          fontFamily: DISPLAY, fontWeight: 700, fontSize: 88, lineHeight: 1, letterSpacing: TRACK.display, color: COLORS.ink,
        }}>{chip}</div>
      ) : null}

      <Narration lines={lines} starts={starts} ends={ends} size={60} color={white} rest={INK_SUB} />
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// DeliveryDials — white card
// ══════════════════════════════════════════════════════════════════════════
const Odometer: React.FC<{ value: number; digits: number; size: number; color: string }> = ({ value, digits, size, color }) => {
  const hgt = size * 1.1;
  const v = Math.max(0, value);
  return (
    <div style={{ display: "flex", fontFamily: DISPLAY, fontWeight: 700, fontSize: size, lineHeight: `${hgt}px`, letterSpacing: TRACK.display, color, fontVariantNumeric: "tabular-nums" }}>
      {Array.from({ length: digits }, (_, i) => {
        const k = digits - 1 - i; // place value power
        const p = Math.pow(10, k);
        const d = Math.floor(v / p) % 10;
        let off: number;
        if (k === 0) off = v - Math.floor(v);
        else {
          const lower = (v % p) / p;
          off = lower > 0.9 ? (lower - 0.9) * 10 : 0;
        }
        return (
          <div key={i} style={{ height: hgt, overflow: "hidden", width: "0.62em", textAlign: "center" }}>
            <div style={{ transform: `translateY(${-off * hgt}px)` }}>
              <div>{d}</div>
              <div>{(d + 1) % 10}</div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export const DeliveryDials: React.FC<Win & {
  kicker: string;
  lines: [Sentence, Sentence];
  onswik: { name: string; doses: [number, number]; unit: string };
  awiqli: { name: string; value: number; unit: string; vol: string };
  chipFrom?: { x: number; y: number };
  cues: Record<"name" | "two" | "d400" | "d800" | "units" | "single" | "aw" | "c700" | "perml", Cue>;
}> = ({ from, to, kicker, lines, onswik, awiqli, chipFrom, cues }) => {
  const ms = useMs();
  const acc = useAccent();
  const ink = COLORS.ink;
  const gray = COLORS.grayText;
  const vis = clamp01(interpolate(ms, [from, from + 1, to - 360, to], [0, 1, 1, 0], CLAMP));
  const T = chain(from, cues, [["name", 500], ["two", 900], ["d400", 2600], ["d800", 800], ["units", 700], ["single", 600], ["aw", 1600], ["c700", 900], ["perml", 1100]]);

  // kicker docks from the chip seat
  const cf = chipFrom ?? { x: PITCH.cx, y: PITCH.cy };
  const dock = EASE_IO(kf(ms, from + 150, 800));
  const kx = cf.x + (110 - cf.x) * dock;
  const ky = cf.y + (78 - cf.y) * dock;
  const ks = interpolate(dock, [0, 1], [88, 44]);

  // pens
  const PENS = [{ y: 540, cx: 520 }, { y: 780, cx: 520 }];
  const penIn = (i: number) => EASE(kf(ms, T.two + i * 180, 600));
  const vA = onswik.doses[0] * EASE_IO(kf(ms, T.d400, Math.max(450, T.d800 - T.d400 - 80)));
  const vB = onswik.doses[1] * EASE_IO(kf(ms, T.d800, Math.max(500, T.units - T.d800 + 100)));
  const press = (i: number) => {
    const t0 = T.single + 120 + i * 90;
    const u = kf(ms, t0, 180);
    const s = (ms - t0 - 180) / 1000;
    return u * (1 - (s > 0 ? 0.15 * Math.max(0, damp(s, 8, 20)) : 0));
  };
  const click = (i: number) => kf(ms, T.single + 300 + i * 90, 500);

  // the 1 mL cube + 700 dots
  const CUBE = { x: 1190, y: 460, s: 300, dx: 90, dy: -60 };
  const nIn = Math.round(awiqli.value * EASE_IO(kf(ms, T.c700, Math.max(600, T.perml - T.c700 + 300))));
  const cubeOn = kf(ms, T.aw, 400);
  const pourDur = Math.max(700, T.perml - T.c700 + 300);

  const starts = [at(lines[0], T.name - 100, from), T.aw - 20];
  const ends = [T.aw, to];

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {/* kicker */}
      <div style={{ position: "absolute", left: kx, top: ky, transform: dock < 1 ? `translate(${-50 * (1 - dock)}%, ${-50 * (1 - dock)}%)` : undefined, fontFamily: DISPLAY, fontWeight: 700, fontSize: ks, lineHeight: 1, letterSpacing: TRACK.display, color: ink, whiteSpace: "nowrap" }}>{kicker}</div>
      <Narration lines={lines} starts={starts} ends={ends} size={46} color={ink} rest={inkA(0.5)} top={150} />

      {/* divider */}
      <div style={{ position: "absolute", left: 1040, top: 330, width: 3, height: 580, background: inkA(0.12), opacity: kf(ms, T.two, 400) }} />

      {/* Onswik side */}
      <div style={{ position: "absolute", left: 130, top: 300, ...lab(ink, 44), opacity: kf(ms, T.name, 250) }}>{onswik.name}</div>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {PENS.map((p, i) => {
          const u = penIn(i);
          if (u <= 0) return null;
          const c = click(i);
          const knobX = p.cx - 300 + press(i) * 22;
          return (
            <g key={i} opacity={u} transform={`translate(${(1 - u) * -500} 0)`}>
              <InsulinPen cx={p.cx} cy={p.y} h={620} rotate={90} body={ink} cap={ink} detail={COLORS.paper} window={COLORS.paper} press={press(i)} />
              {c > 0 && c < 1 ? <circle cx={knobX - 20} cy={p.y} r={20 + c * 70} fill="none" stroke={acc} strokeWidth={5 * (1 - c)} opacity={1 - c} /> : null}
            </g>
          );
        })}
      </svg>
      {PENS.map((p, i) => {
        const u = penIn(i);
        const v = i === 0 ? vA : vB;
        const on = kf(ms, i === 0 ? T.d400 - 80 : T.d800 - 80, 150);
        return (
          <div key={i} style={{ position: "absolute", left: 280, top: p.y - 150, display: "flex", alignItems: "flex-end", gap: 16, opacity: u * on }}>
            <div style={{ background: COLORS.paper, border: `4px solid ${ink}`, borderRadius: 12, padding: "2px 14px" }}>
              <Odometer value={v} digits={3} size={78} color={acc} />
            </div>
            <div style={{ ...lab(gray), paddingBottom: 10, opacity: kf(ms, T.units, 250) }}>{onswik.unit}</div>
          </div>
        );
      })}

      {/* Awiqli side */}
      <div style={{ position: "absolute", left: 1110, top: 300, ...lab(ink, 44), opacity: cubeOn }}>{awiqli.name}</div>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible", opacity: cubeOn }}>
        {(() => {
          const { x, y, s, dx, dy } = CUBE;
          return (
            <g>
              <polygon points={`${x},${y} ${x + dx},${y + dy} ${x + s + dx},${y + dy} ${x + s},${y}`} fill={inkA(0.05)} stroke={ink} strokeWidth={3} />
              <polygon points={`${x + s},${y} ${x + s + dx},${y + dy} ${x + s + dx},${y + s + dy} ${x + s},${y + s}`} fill={inkA(0.09)} stroke={ink} strokeWidth={3} />
              {/* dots */}
              {Array.from({ length: nIn }, (_, j) => {
                const tx = x + 10 + hash(j + 11) * (s - 20);
                const ty = y + 10 + hash(j + 97) * (s - 20);
                const t0 = T.c700 + (j / awiqli.value) * (pourDur - 500);
                const u = clamp01((ms - t0) / 420);
                const py = y - 180 + (ty - (y - 180)) * (u * u);
                const pxx = x + s / 2 + (tx - x - s / 2) * EASE(u);
                return <circle key={j} cx={pxx} cy={py} r={3.2} fill={ink} opacity={0.85} />;
              })}
              <rect x={x} y={y} width={s} height={s} fill="none" stroke={ink} strokeWidth={4} />
              <text x={x + s / 2} y={y + s + 52} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={34} letterSpacing="-0.035em" fill={ink} opacity={kf(ms, T.perml, 250)}>{awiqli.vol}</text>
            </g>
          );
        })()}
      </svg>
      <div style={{ position: "absolute", left: 1600, top: 470, opacity: kf(ms, T.c700 - 60, 150) }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 104, lineHeight: 1, letterSpacing: TRACK.display, color: ink, fontVariantNumeric: "tabular-nums" }}>{nIn}</div>
        <div style={{ ...lab(gray), marginTop: 8, whiteSpace: "normal", width: 240, opacity: kf(ms, T.perml - 200, 250) }}>{awiqli.unit}</div>
      </div>
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// CategoryBeam — red
// ══════════════════════════════════════════════════════════════════════════
export const CategoryBeam: React.FC<Win & {
  line: Sentence;
  beam: string;
  tag: string;
  pillars: [string, string];
  diff: string;
  cues: Record<"beam" | "category" | "two" | "sponsors" | "not" | "diff", Cue>;
}> = ({ from, to, line, beam, tag, pillars, diff, cues }) => {
  const ms = useMs();
  const white = COLORS.paper;
  const sub = useInkSub();
  const vis = clamp01(interpolate(ms, [from, from + 1, to - 360, to], [0, 1, 1, 0], CLAMP));
  const T = chain(from, cues, [["beam", 600], ["category", 1600], ["two", 900], ["sponsors", 500], ["not", 1500], ["diff", 1300]]);
  const tSec = ms / 1000;

  const FLOOR = 900;
  const PH = 300; // pillar height
  const PW = 90;
  const A = { x: 560 };
  const B = { x: 1360 };
  const pillarA = EASE(kf(ms, from + 250, 600));
  const pillarB = EASE(kf(ms, T.two, Math.max(400, T.sponsors - T.two + 350)));
  // the beam: drops on A, teeters (pivot at A's top), levels when B arrives
  const beamDrop = kf(ms, T.beam - 380, 380);
  const topY = FLOOR - PH;
  const L = 1000; // beam length, left end over A
  const bx0 = A.x - 110;
  const tip = 13 + 2.5 * Math.sin(tSec * 3.1); // degrees, down to the right
  const sLevel = (ms - (T.sponsors + 350)) / 1000;
  let ang = tip * (1 - pillarB);
  if (sLevel > 0) ang = -2.5 * damp(sLevel, 4, 12);
  const beamY = topY - 34 - (1 - beamDrop * beamDrop) * 500;
  const thud = sLevel > 0 ? 6 * damp(sLevel, 8, 28) : 0;
  const bHeight = FLOOR - (topY + Math.sin((ang * Math.PI) / 180) * (B.x - A.x));
  const pillarBH = Math.min(PH, Math.max(0, bHeight)) * pillarB;

  // the differentiator tag
  const tagDrop = kf(ms, T.not, 360);
  const strike = EASE(kf(ms, T.diff, 300));
  const off = kf(ms, T.diff + 450, 900);

  return (
    <AbsoluteFill style={{ opacity: vis, transform: `translateY(${thud}px)` }}>
      <div style={{ position: "absolute", left: 110, top: 90, width: 1700 }}>
        <FlowLine from={at(line, from + 500, from) - 60} to={to} line={line.line} size={60} color={white} restColor={sub} restWeight={400} emphasize={line.emphasize} empColor={white} underline={white} lineHeight={1.12} />
      </div>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <line x1={300} x2={1620} y1={FLOOR} y2={FLOOR} stroke={white} strokeWidth={4} opacity={0.7} />
        <rect x={A.x - PW / 2} y={FLOOR - PH * pillarA} width={PW} height={PH * pillarA} fill={white} />
        {pillarB > 0 ? <rect x={B.x - PW / 2} y={FLOOR - pillarBH} width={PW} height={pillarBH} fill={white} /> : null}
        {beamDrop > 0 ? (
          <g transform={`rotate(${ang} ${A.x} ${topY})`}>
            <rect x={bx0} y={beamY} width={L} height={34} rx={6} fill={white} />
          </g>
        ) : null}
      </svg>
      {/* beam label rides the beam */}
      <div style={{ position: "absolute", left: bx0, top: beamY - 70, width: L, textAlign: "center", transformOrigin: `${A.x - bx0}px ${topY - beamY + 70}px`, transform: `rotate(${ang}deg)`, opacity: beamDrop }}>
        <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 52, letterSpacing: TRACK.headline, color: white }}>{beam}</span>
        <span style={{ ...lab(COLORS.accent, 30), background: white, padding: "6px 14px", borderRadius: 8, marginLeft: 18, opacity: kf(ms, T.category, 250), display: "inline-block", verticalAlign: "middle" }}>{tag}</span>
      </div>
      {/* pillar names */}
      <div style={{ position: "absolute", left: A.x - 200, width: 400, top: FLOOR + 20, textAlign: "center", opacity: pillarA, ...lab(white, 34) }}>{pillars[0]}</div>
      <div style={{ position: "absolute", left: B.x - 200, width: 400, top: FLOOR + 20, textAlign: "center", opacity: pillarB, ...lab(white, 34) }}>{pillars[1]}</div>
      {/* the differentiator tag: drops onto the beam, struck, tips off */}
      {tagDrop > 0 ? (
        <div style={{
          position: "absolute", left: 1000, top: topY - 240 - (1 - tagDrop * tagDrop) * 300 + off * off * 700, padding: "12px 20px", // over the beam, clear of its label
          border: `3px solid ${white}`, borderRadius: 10, opacity: tagDrop * (1 - off), transform: `rotate(${off * 70}deg) translateX(${off * 160}px)`, transformOrigin: "left bottom",
        }}>
          <span style={{ position: "relative", ...lab(white, 34) }}>
            {diff}
            <span style={{ position: "absolute", left: -6, right: -6, top: "52%", height: 4, background: white, transform: `scaleX(${strike})`, transformOrigin: "left" }} />
          </span>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
