// ─────────────────────────────────────────────────────────────────────────
// KIT · dial — A MONOPOLY AS A CLOCK. Added on the Lilly Onswik long-form,
// 2026-09-26.
//
// For "X held the category alone for N months. Now it doesn't."
//
// The enactment: exclusivity is TIME spent enclosed. The holder is a solid disc;
// the category is a ring of N month-segments around it. The ring draws as an
// empty track ("held"), then a hand sweeps it full, one segment per month, while
// the count runs — so the seal is BUILT out of the months, not labelled. On the
// negation the entrant arrives from off-frame on a curved path with a trail,
// STRIKES the ring, and the segments burst outward from the impact (the ones
// nearest the hit fly furthest) while a shockwave leaves the point of contact.
// The two discs then share the centre. "Alone" is struck in the same instant.
//
// Why not LaneShare (2026-09-23): that one NEGATES first and has two holders.
// This VO states the claim, measures it, THEN breaks it, and the measurement
// (seven months) is the thing §5 calls back — a lane has no clock in it.
//
// `DialReset` (below) is the §5 callback on the SAME seats (exported `DIAL`):
// the broken ring returns settled, the count REWINDS to zero as the spent months
// drain counter-clockwise, and a new DASHED ring starts drawing around BOTH discs
// ("from here": a clock that has started and has no length yet — dashed means
// not yet measured, 2026-08-22 vocabulary).
//
// Every onset is a spoken word with an optional ms pin. Monotonic by
// construction. Portrait-first; built for the white card (paper world).
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, interpolate, Easing } from "remotion";
import { CLAMP, clamp01, COLORS, cue, DISPLAY, SANS, TRACK, inkA, useMs, useAccent } from "./core";
import { TYPE } from "../style";

const EASE = Easing.out(Easing.cubic);
const EASE_IO = Easing.inOut(Easing.cubic);

type Win = { from: number; to: number };
type Cued = { word?: string; ms?: number };

const useVis = (from: number, to: number, padIn = 300, padOut = 360) => {
  const ms = useMs();
  return clamp01(interpolate(ms, [from, from + padIn, to - padOut, to], [0, 1, 1, 0], CLAMP));
};

/** The shared geometry — the §5 callback redraws on these exact seats. */
export const DIAL = {
  cx: 540,
  cy: 930,
  R: 300, // ring centre-line radius
  stroke: 34,
  gapDeg: 5,
  soloR: 168, // the holder alone
  pairR: 146, // each disc once the category is shared
  pairDX: 188, // each disc's offset from centre once shared
  kickerY: 300,
  lineY: 1400,
};

/** where the entrant strikes the ring (degrees, 0 = 12 o'clock) — the callback reads it */
export const DIAL_IMPACT = 132;
/** the burst end-state of month i, so the callback redraws the SAME wreckage */
export const burstOf = (i: number, n: number) => {
  const s = seg(i, n);
  const dAng = Math.abs(((s.mid - DIAL_IMPACT + 540) % 360) - 180);
  const near = 1 - dAng / 180;
  const out = 50 + 130 * near * near;
  return { ...s, near, ox: Math.cos(rad(s.mid)) * out, oy: Math.sin(rad(s.mid)) * out, spin: near * 38 * (i % 2 ? 1 : -1) };
};

export const rad = (deg: number) => ((deg - 90) * Math.PI) / 180; // 0° = 12 o'clock, clockwise
export const pt = (deg: number, r: number) => [DIAL.cx + r * Math.cos(rad(deg)), DIAL.cy + r * Math.sin(rad(deg))] as const;

/** an SVG arc path along the ring centre-line, from a0 to a1 degrees (clockwise) */
export const arc = (a0: number, a1: number, r = DIAL.R) => {
  const [x0, y0] = pt(a0, r);
  const [x1, y1] = pt(a1, r);
  const large = a1 - a0 > 180 ? 1 : 0;
  return `M ${x0} ${y0} A ${r} ${r} 0 ${large} 1 ${x1} ${y1}`;
};

export const seg = (i: number, n: number) => {
  const step = 360 / n;
  return { a0: i * step + DIAL.gapDeg / 2, a1: (i + 1) * step - DIAL.gapDeg / 2, mid: (i + 0.5) * step };
};

/** A named disc: name bold, owner small above it. */
const Disc: React.FC<{ x: number; y: number; r: number; fill: string; name: string; owner: string; opacity: number; scale?: number }> = ({
  x, y, r, fill, name, owner, opacity, scale = 1,
}) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}>
    <circle r={r} fill={fill} />
    <text y={-r * 0.2} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={TYPE.labelSm} letterSpacing={TRACK.nav} fill="rgba(255,255,255,0.78)">
      {owner}
    </text>
    <text y={r * 0.26} textAnchor="middle" fontFamily={DISPLAY} fontWeight={700} fontSize={r * 0.36} letterSpacing={TRACK.display} fill={COLORS.paper}>
      {name}
    </text>
  </g>
);

// ── MonopolyDial — §2 ───────────────────────────────────────────────────────
export const MonopolyDial: React.FC<Win & {
  kicker: { label: string; title: string } & Cued;
  holder: { name: string; owner: string } & Cued;
  /** the empty month-track draws on this word */
  track: Cued;
  months: { count: number; unit: string; alone: string; aloneWord?: string; aloneMs?: number; startWord?: string; startMs?: number; endWord?: string; endMs?: number };
  entrant: { name: string; owner: string; enterWord?: string; enterMs?: number; hitWord?: string; hitMs?: number };
}> = ({ from, to, kicker, holder, track, months, entrant }) => {
  const ms = useMs();
  const acc = useAccent();
  const vis = useVis(from, to);
  const n = months.count;

  // onsets, clamped monotonic by construction
  const tHolder = holder.ms ?? cue(holder.word, from + 300, from);
  const tTrack = Math.max(tHolder + 300, track.ms ?? cue(track.word, tHolder + 600, from));
  const tKick = Math.max(tTrack + 150, kicker.ms ?? cue(kicker.word, tTrack + 500, from));
  const tAlone = Math.max(tKick + 200, months.aloneMs ?? cue(months.aloneWord, tKick + 500, from));
  const tSweep = Math.max(tAlone + 300, months.startMs ?? cue(months.startWord, tAlone + 600, from));
  const tUnit = Math.max(tSweep + 200, months.endMs ?? cue(months.endWord, tSweep + 500, from));
  const tSweepEnd = tUnit + 380; // the last month closes just after "months" lands
  const tEnter = Math.max(tSweepEnd + 200, entrant.enterMs ?? cue(entrant.enterWord, tSweepEnd + 600, from));
  const tHit = Math.max(tEnter + 300, entrant.hitMs ?? cue(entrant.hitWord, tEnter + 500, from));

  const k = (a: number, dur: number) => clamp01(interpolate(ms, [a, a + dur], [0, 1], CLAMP));

  // holder: stamps in with an overshoot
  const hIn = k(tHolder, 420);
  const hScale = interpolate(ms, [tHolder, tHolder + 160, tHolder + 420], [0.6, 1.08, 1], { ...CLAMP, easing: EASE });
  // after the hit both discs part to their shared seats
  const part = EASE_IO(k(tHit + 60, 620));
  const hX = DIAL.cx - DIAL.pairDX * part;
  const hR = interpolate(part, [0, 1], [DIAL.soloR, DIAL.pairR]);

  // the empty track: a single stroke sweeping around from 12 o'clock
  const trackP = EASE(k(tTrack, 700));
  const C = 2 * Math.PI * DIAL.R;

  // the sweep: continuous progress 0..n across [tSweep, tSweepEnd]
  const sweep = interpolate(ms, [tSweep, tSweepEnd], [0, n], { ...CLAMP, easing: Easing.inOut(Easing.quad) });
  const count = Math.min(n, Math.floor(sweep + 0.001) + (sweep > 0 ? 1 : 0));
  const sealed = k(tSweepEnd, 500); // the seal pulse once the ring closes
  const handOn = ms >= tSweep && ms < tSweepEnd + 250;
  const handA = (sweep / n) * 360;

  // the entrant's path: off-frame lower right -> impact on the ring (lower right, 135°)
  const IMPACT = DIAL_IMPACT;
  const [ix, iy] = pt(IMPACT, DIAL.R);
  const P0 = [1260, 1760];
  const P1 = [1180, 1180];
  const bez = (t: number) => {
    const u = 1 - t;
    return [u * u * P0[0] + 2 * u * t * P1[0] + t * t * ix, u * u * P0[1] + 2 * u * t * P1[1] + t * t * iy];
  };
  const travel = (t: number) => clamp01(interpolate(t, [tEnter, tHit], [0, 1], { ...CLAMP, easing: Easing.in(Easing.quad) }));
  const tr = travel(ms);
  // after impact it glides from the ring to its seat
  const [bx, by] = bez(tr);
  const eX = interpolate(part, [0, 1], [bx, DIAL.cx + DIAL.pairDX]);
  const eY = interpolate(part, [0, 1], [by, DIAL.cy]);
  const eR = interpolate(part, [0, 1], [DIAL.pairR * 0.62, DIAL.pairR]);
  const eOn = ms >= tEnter;

  // the burst: segments fly out from the impact, nearest furthest
  const burst = EASE(k(tHit, 700));
  const shock = k(tHit, 760);

  const line = { fontFamily: DISPLAY, fontWeight: 700, fontSize: 104, letterSpacing: TRACK.display, color: COLORS.ink } as const;
  const aloneP = k(tAlone, 260);
  const unitP = k(tUnit, 240);
  const strikeP = EASE(k(tHit + 40, 320));
  const kickP = k(tKick, 320);

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {/* kicker: what the ring IS */}
      <div style={{ position: "absolute", left: 90, right: 90, top: DIAL.kickerY - 110, textAlign: "center", opacity: kickP, transform: `translateY(${(1 - kickP) * 14}px)` }}>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: TYPE.label, letterSpacing: TRACK.nav, color: COLORS.grayText }}>{kicker.label}</div>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 64, letterSpacing: TRACK.headline, color: COLORS.ink, marginTop: 8 }}>{kicker.title}</div>
      </div>

      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {/* the empty month-track (outline = not yet elapsed) */}
        <circle
          cx={DIAL.cx} cy={DIAL.cy} r={DIAL.R} fill="none" stroke={COLORS.panel} strokeWidth={DIAL.stroke}
          strokeDasharray={`${C * trackP} ${C}`} transform={`rotate(-90 ${DIAL.cx} ${DIAL.cy})`}
          opacity={1 - burst * 0.85}
        />
        {/* month ticks at each segment boundary */}
        {Array.from({ length: n }, (_, i) => {
          const a = (i * 360) / n;
          const [x0, y0] = pt(a, DIAL.R + DIAL.stroke / 2 + 10);
          const [x1, y1] = pt(a, DIAL.R + DIAL.stroke / 2 + 30);
          const on = clamp01((trackP * 360 - a) / 20);
          return <line key={`t${i}`} x1={x0} y1={y0} x2={x1} y2={y1} stroke={inkA(0.35)} strokeWidth={3} opacity={on * (1 - burst)} />;
        })}

        {/* the months, filled by the sweep, then burst on impact */}
        {Array.from({ length: n }, (_, i) => {
          const s = seg(i, n);
          const fill = clamp01(sweep - i);
          if (fill <= 0) return null;
          const a1 = s.a0 + (s.a1 - s.a0) * fill;
          // proximity to the impact angle: 1 at the hit, 0 opposite
          const dAng = Math.abs(((s.mid - IMPACT + 540) % 360) - 180);
          const near = 1 - dAng / 180;
          const out = burst * (50 + 130 * near * near); // max r ~497: stays on the card (08-01 arithmetic)
          const [ox, oy] = [Math.cos(rad(s.mid)) * out, Math.sin(rad(s.mid)) * out];
          const spin = burst * (near * 38) * (i % 2 ? 1 : -1);
          const [mx, my] = pt(s.mid, DIAL.R);
          const w = DIAL.stroke + sealed * (1 - burst) * 6 * Math.sin(Math.PI * clamp01(sealed * 1.4));
          return (
            <g key={`s${i}`} transform={`translate(${ox} ${oy}) rotate(${spin} ${mx} ${my})`} opacity={1 - burst * 0.8}>
              <path d={arc(s.a0, a1)} fill="none" stroke={COLORS.ink} strokeWidth={w} strokeLinecap="butt" />
            </g>
          );
        })}

        {/* the seal: one echo ring leaves the closed dial */}
        {sealed > 0 && burst === 0 ? (
          <circle cx={DIAL.cx} cy={DIAL.cy} r={DIAL.R + 30 + sealed * 90} fill="none" stroke={inkA(0.22 * (1 - sealed))} strokeWidth={4} />
        ) : null}

        {/* the sweeping hand */}
        {handOn ? (
          (() => {
            const [x0, y0] = pt(handA, DIAL.soloR + 14);
            const [x1, y1] = pt(handA, DIAL.R + DIAL.stroke / 2 + 36);
            const fade = 1 - k(tSweepEnd, 250);
            return <line x1={x0} y1={y0} x2={x1} y2={y1} stroke={COLORS.ink} strokeWidth={6} strokeLinecap="round" opacity={fade} />;
          })()
        ) : null}

        {/* the holder */}
        <Disc x={hX} y={DIAL.cy} r={hR} fill={COLORS.ink} name={holder.name} owner={holder.owner} opacity={hIn} scale={hScale} />

        {/* the entrant's trail + body */}
        {eOn && part < 1
          ? [6, 5, 4, 3, 2, 1].map((j) => {
              const t = travel(ms - j * 34);
              if (t <= 0 || tr >= 1) return null;
              const [gx, gy] = bez(t);
              return <circle key={`g${j}`} cx={gx} cy={gy} r={DIAL.pairR * 0.62 * (1 - j * 0.07)} fill={acc} opacity={0.34 * (1 - j / 7)} />;
            })
          : null}
        {eOn ? <Disc x={eX} y={eY} r={eR} fill={acc} name={entrant.name} owner={entrant.owner} opacity={clamp01(tr * 5)} /> : null}

        {/* the shockwave from the point of contact */}
        {shock > 0 && shock < 1 ? (
          <circle cx={ix} cy={iy} r={30 + shock * 300} fill="none" stroke={acc} strokeWidth={10 * (1 - shock)} opacity={1 - shock} />
        ) : null}
      </svg>

      {/* "Alone · 7 months" — the claim, measured, then struck */}
      <div style={{ position: "absolute", left: 0, right: 0, top: DIAL.lineY - 70, display: "flex", justifyContent: "center", alignItems: "baseline", gap: 26 }}>
        <span style={{ position: "relative", display: "inline-block", ...line, opacity: aloneP * (1 - strikeP * 0.55), transform: `scale(${interpolate(aloneP, [0, 1], [1.14, 1])})` }}>
          {months.alone}
          <span style={{ position: "absolute", left: -8, top: "54%", height: 10, width: `calc(${strikeP * 100}% + 16px)`, background: acc, opacity: strikeP > 0 ? 1 : 0 }} />
        </span>
        <span style={{ ...line, fontVariantNumeric: "tabular-nums", opacity: sweep > 0 ? 1 - strikeP * 0.55 : 0 }}>{count}</span>
        <span style={{ ...line, fontWeight: 400, color: COLORS.grayText, opacity: unitP * (1 - strikeP * 0.4) }}>{months.unit}</span>
      </div>
    </AbsoluteFill>
  );
};
