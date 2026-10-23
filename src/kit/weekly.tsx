// ─────────────────────────────────────────────────────────────────────────
// KIT · weekly — the once-weekly insulin set. Added on the Lilly Onswik
// HORIZONTAL long-form, 2026-09-27. 1920×1080 first.
//
// The recurring object is the WEEK: seven day tiles. Daily insulin lives in all
// seven; weekly insulin lives in one. The hook teaches it as a 3D carousel,
// the approval puts one red dose into one cell, and later sections return to it.
//
//   InsulinPen    — SVG pen (cap, band, dose window, knob), vertical, drawn around (cx, cy).
//   WeekStrip     — seven day cells in a row; `filled` lights cells red on cue.
//   WeekOrbit     — ink. §1 hook: a 3D carousel of the seven days spins around a
//                   DASHED empty pen slot (hollow = does not exist yet); on "Now" it
//                   whips, on "two" two pens SLAM into the slot, the dashed outline
//                   bursts, the ring kicks outward (damped) and the frame thuds.
//   ApprovalGlobe — white card. §2: the date tile rolls to the day, the §1 pen flies
//                   in from its hook seat and turns into a product shot, an approval
//                   STAMP slams (ink splash + card thud), the drug name stamps, one red
//                   dose drops into one week cell on "once-weekly". Then the right half
//                   lifts away and a DOT GLOBE rises: the U.S. pin plants on "fourth",
//                   the globe SPINS to each earlier approval as it is named, arcs trace
//                   the order, and "reach U.S. patients" throws DASHED rings (not yet).
// Every onset takes a cue word + an ms override.
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, interpolate, Easing } from "remotion";
import { CLAMP, clamp01, COLORS, cue, DISPLAY, SANS, TRACK, useMs, useAccent, INK_SUB, inkA } from "./core";
import { FlowLine } from "./flowline";

const EASE = Easing.out(Easing.cubic);
const EASE_IN = Easing.in(Easing.cubic);
const EASE_IO = Easing.inOut(Easing.cubic);
const W = 1920;
const H = 1080;

type Win = { from: number; to: number };
type Cue = { word?: string; ms?: number };

const useVis = (from: number, to: number, padIn = 300, padOut = 360) => {
  const ms = useMs();
  return clamp01(interpolate(ms, [from, from + padIn, to - padOut, to], [0, 1, 1, 0], CLAMP));
};
const at = (c: Cue | undefined, fb: number, after: number) => c?.ms ?? cue(c?.word, fb, after);
const kf = (ms: number, a: number, d: number) => clamp01(interpolate(ms, [a, a + d], [0, 1], CLAMP));
/** damped oscillation, 1 at s=0 decaying to 0 (s in seconds) */
const damp = (s: number, k = 4.5, w = 9) => (s < 0 ? 0 : Math.exp(-k * s) * Math.cos(w * s));
/** deterministic 0..1 hash */
const hash = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
/** Gravity drop onto a floor: dy (negative = above rest) + squash after landing. */
const drop = (ms: number, tLand: number, h: number, dur = 380) => {
  const u = clamp01((ms - (tLand - dur)) / dur);
  const dy = -h * (1 - u * u);
  const s = (ms - tLand) / 1000;
  const squash = s >= 0 ? 1 - 0.14 * damp(s, 7, 18) : 1;
  return { dy, squash, landed: s >= 0, s, on: ms >= tLand - dur };
};

// ══════════════════════════════════════════════════════════════════════════
// InsulinPen — vertical, cap at the top. Drawn around (cx, cy), total height h.
// ══════════════════════════════════════════════════════════════════════════
export const InsulinPen: React.FC<{
  cx: number; cy: number; h: number;
  body: string; cap: string; detail: string; band?: string; window?: string;
  dashed?: boolean; draw?: number; opacity?: number; squash?: number; rotate?: number;
  /** 0..1 — the dose knob pushed into the body (an injection) */
  press?: number;
}> = ({ cx, cy, h, body, cap, detail, band, window, dashed = false, draw = 1, opacity = 1, squash = 1, rotate = 0, press = 0 }) => {
  const w = h * 0.17;
  const y0 = -h / 2;
  const capH = h * 0.3;
  const knobY = y0 + h * 0.87 - press * h * 0.075;
  const stroke = dashed ? { fill: "none", stroke: detail, strokeWidth: 4, strokeDasharray: "14 10", pathLength: 100 } : {};
  if (dashed) {
    // one outline path, drawn in with `draw`
    const r = w * 0.32;
    const x = -w * 0.54;
    const d = `M ${x + r} ${y0} H ${-x - r} Q ${-x} ${y0} ${-x} ${y0 + r} V ${y0 + h - r} Q ${-x} ${y0 + h} ${-x - r} ${y0 + h} H ${x + r} Q ${x} ${y0 + h} ${x} ${y0 + h - r} V ${y0 + r} Q ${x} ${y0} ${x + r} ${y0} Z`;
    return (
      <g opacity={opacity} transform={`translate(${cx} ${cy}) rotate(${rotate}) scale(${1 + (1 - squash) * 0.5} ${squash})`}>
        <path d={d} fill="none" stroke={detail} strokeWidth={4} strokeDasharray="7 5" pathLength={100} strokeDashoffset={0}
          style={{ clipPath: `inset(0 0 ${(1 - draw) * 100}% 0)` }} />
        <line x1={x} x2={-x} y1={y0 + capH} y2={y0 + capH} stroke={detail} strokeWidth={3} strokeDasharray="10 8" opacity={draw} />
      </g>
    );
  }
  return (
    <g opacity={opacity} transform={`translate(${cx} ${cy}) rotate(${rotate}) scale(${1 + (1 - squash) * 0.5} ${squash})`}>
      {/* knob */}
      <rect x={-w * 0.4} y={knobY} width={w * 0.8} height={h * 0.13} rx={w * 0.16} fill={cap} {...stroke} />
      {[0.25, 0.45, 0.65, 0.85].map((k) => (
        <line key={k} x1={-w * 0.4} x2={w * 0.4} y1={knobY + h * 0.13 * k} y2={knobY + h * 0.13 * k} stroke={detail} strokeWidth={2} opacity={0.35} />
      ))}
      {/* body */}
      <rect x={-w / 2} y={y0 + capH - 6} width={w} height={h * 0.87 - capH + 8} rx={w * 0.22} fill={body} />
      {/* label band */}
      {band ? <rect x={-w / 2} y={y0 + capH + h * 0.05} width={w} height={h * 0.16} fill={band} /> : null}
      {/* dose window */}
      <rect x={-w * 0.3} y={y0 + h * 0.64} width={w * 0.6} height={h * 0.1} rx={4} fill={window ?? detail} />
      <line x1={-w * 0.18} x2={w * 0.18} y1={y0 + h * 0.69} y2={y0 + h * 0.69} stroke={body} strokeWidth={2.5} opacity={0.8} />
      {/* cap */}
      <rect x={-w * 0.56} y={y0} width={w * 1.12} height={capH} rx={w * 0.34} fill={cap} />
      <rect x={w * 0.56 - 2} y={y0 + capH * 0.18} width={w * 0.14} height={capH * 0.62} rx={3} fill={cap} />
      <line x1={-w * 0.56} x2={w * 0.56} y1={y0 + capH} y2={y0 + capH} stroke={detail} strokeWidth={2} opacity={0.4} />
    </g>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// WeekStrip — seven day cells (SVG). `lit[i]` 0..1 fills cell i with red.
// ══════════════════════════════════════════════════════════════════════════
export const DAYS = ["M", "T", "W", "T", "F", "S", "S"];
export const WeekStrip: React.FC<{
  x: number; y: number; cell: number; gap: number; ink: string; lit: number[]; appear: number[]; fill: string; litInk?: string;
}> = ({ x, y, cell, gap, ink, lit, appear, fill, litInk = COLORS.paper }) => (
  <g>
    {DAYS.map((d, i) => {
      const a = appear[i] ?? 1;
      const l = lit[i] ?? 0;
      const cx = x + i * (cell + gap);
      return (
        <g key={i} opacity={a} transform={`translate(${cx + cell / 2} ${y + cell / 2 + (1 - a) * 20}) scale(${0.8 + 0.2 * a})`}>
          <rect x={-cell / 2} y={-cell / 2} width={cell} height={cell} rx={12} fill="none" stroke={ink} strokeWidth={3} opacity={0.5 + 0.5 * (1 - l)} />
          <rect x={-cell / 2} y={-cell / 2} width={cell} height={cell} rx={12} fill={fill} opacity={l} transform={`scale(${0.4 + 0.6 * l})`} />
          <text x={0} y={cell * 0.14} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={cell * 0.38} letterSpacing="-0.035em"
            fill={l > 0.5 ? litInk : ink} opacity={l > 0.5 ? 1 : 0.7}>{d}</text>
        </g>
      );
    })}
  </g>
);

// ══════════════════════════════════════════════════════════════════════════
// WeekOrbit — §1 hook (ink)
// ══════════════════════════════════════════════════════════════════════════
export const ORBIT = { cx: 1420, cy: 470, R: 320, penH: 330, penDx: 74 };

export const WeekOrbit: React.FC<Win & {
  first: { line: string; emphasize?: string };
  second: { line: string; emphasize?: string } & Cue;
  slot: Cue; // the dashed empty slot draws ("once-weekly")
  whip: Cue; // the carousel whips ("Now")
  two: Cue; // the pens land ("two")
}> = ({ from, to, first, second, slot, whip, two }) => {
  const ms = useMs();
  const vis = useVis(from, to, 200, 200);
  const acc = useAccent();
  const white = COLORS.paper;

  const tSlot = at(slot, from + 2500, from);
  const tWhip = Math.max(tSlot + 600, at(whip, tSlot + 2800, tSlot));
  const tTwo = Math.max(tWhip + 300, at(two, tWhip + 900, tWhip));
  const t2 = Math.max(tSlot + 400, at(second, tWhip, tSlot));
  const { cx, cy, R, penH, penDx } = ORBIT;

  // ── the carousel ──────────────────────────────────────────────────────
  const tSec = Math.max(0, ms - from) / 1000;
  const whipDur = Math.max(500, tTwo - tWhip + 80);
  const whipP = EASE_IO(kf(ms, tWhip, whipDur));
  const spin = -24 * tSec - 360 * whipP; // deg
  const sImp = (ms - tTwo) / 1000;
  const kick = sImp >= 0 ? 58 * damp(sImp, 3.6, 10) : 0;
  const breath = 1 + 0.012 * Math.sin(tSec * 2.1);
  const r = R * breath + kick;
  const tilt = -11 + 3 * Math.sin(tSec * 0.7);

  // frame thud + slow push-in
  const thud = sImp >= 0 ? 10 * damp(sImp, 6, 26) : 0;
  const push = 1 + 0.035 * clamp01((ms - from) / 7000);

  // ── the dashed slot ──────────────────────────────────────────────────
  const slotDraw = EASE(kf(ms, tSlot, 700));
  const empty = ms > tSlot + 700 && ms < tTwo ? 0.55 + 0.45 * (0.5 + 0.5 * Math.cos((ms - tSlot - 700) / 260)) : 1;
  const burst = kf(ms, tTwo, 520);
  const slotOp = (ms < tTwo ? 1 : 1 - burst) * empty;

  // ── the pens ─────────────────────────────────────────────────────────
  const penA = drop(ms, tTwo, 760, 360);
  const penB = drop(ms, tTwo + 130, 760, 360);

  const line1Dim = interpolate(ms, [t2 - 200, t2 + 200], [1, 0.34], CLAMP);

  return (
    <AbsoluteFill style={{ opacity: vis, transform: `translateY(${thud}px) scale(${push})`, transformOrigin: `${cx}px ${cy}px` }}>
      {/* headline column */}
      <div style={{ position: "absolute", left: 110, top: 200, width: 800, display: "flex", flexDirection: "column", gap: 56 }}>
        <div style={{ opacity: line1Dim }}>
          <FlowLine from={from} to={t2} line={first.line} size={78} color={white} restColor={INK_SUB} restWeight={400} emphasize={first.emphasize} empColor={white} lineHeight={1.1} />
        </div>
        <FlowLine from={t2 - 80} to={to} line={second.line} size={132} color={white} emphasize={second.emphasize} empColor={acc} lineHeight={1} />
      </div>

      {/* the 3D carousel of the seven days, pens + slot at its centre (depth-sorted) */}
      <div style={{ position: "absolute", left: cx, top: cy, width: 0, height: 0, perspective: 1500 }}>
        <div style={{ position: "absolute", transformStyle: "preserve-3d", transform: `rotateX(${tilt}deg)` }}>
          {DAYS.map((d, i) => {
            const a0 = (i * 360) / 7 + spin;
            const face = Math.cos((a0 * Math.PI) / 180); // 1 = facing camera
            const pop = EASE(kf(ms, from + 60 + i * 95, 420));
            const blur = whipP > 0 && whipP < 1 ? Math.sin(whipP * Math.PI) : 0;
            return (
              <div key={i} style={{
                position: "absolute", left: -66, top: -88, width: 132, height: 176,
                transform: `rotateY(${a0}deg) translateZ(${r}px) scale(${0.3 + 0.7 * pop})`,
                opacity: pop * (0.28 + 0.72 * clamp01((face + 0.35) / 1.35)),
                background: COLORS.inkSoft, border: `2px solid rgba(255,255,255,${0.2 + 0.4 * clamp01(face)})`, borderRadius: 16,
                display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 10,
                filter: blur > 0.05 ? `blur(${blur * 3}px)` : undefined,
                backfaceVisibility: "visible",
              }}>
                <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 76, lineHeight: 1, letterSpacing: TRACK.display, color: white }}>{d}</div>
                <div style={{ width: 40, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.35)" }} />
              </div>
            );
          })}
          {/* the centre: an SVG plane at z = 0, so front tiles pass in front of it */}
          <div style={{ position: "absolute", left: -300, top: -300, width: 600, height: 600, transform: "translateZ(0px)" }}>
            <svg width={600} height={600} viewBox="-300 -300 600 600" style={{ overflow: "visible" }}>
              {/* floor shadow + shockwave */}
              <ellipse cx={0} cy={penH / 2 + 8} rx={120} ry={16} fill="rgba(255,255,255,0.08)" opacity={penA.landed ? 1 : 0} />
              {burst > 0 && burst < 1 ? (
                <>
                  <ellipse cx={0} cy={penH / 2 + 8} rx={60 + burst * 420} ry={10 + burst * 60} fill="none" stroke={white} strokeWidth={6 * (1 - burst)} opacity={1 - burst} />
                  <ellipse cx={0} cy={penH / 2 + 8} rx={30 + burst * 240} ry={6 + burst * 34} fill="none" stroke={acc} strokeWidth={4 * (1 - burst)} opacity={1 - burst} />
                </>
              ) : null}
              {/* the dashed empty slot, then its fragments */}
              {slotDraw > 0 && slotOp > 0.01 ? (
                <g transform={`scale(${1 + burst * 0.5})`}>
                  <InsulinPen cx={0} cy={0} h={penH + 20} body="none" cap="none" detail={white} dashed draw={slotDraw} opacity={slotOp} />
                </g>
              ) : null}
              {burst > 0 && burst < 1
                ? Array.from({ length: 22 }, (_, j) => {
                    const ang = (j / 22) * Math.PI * 2 + hash(j) * 0.3;
                    const dist = 60 + burst * (220 + hash(j + 9) * 180);
                    const x = Math.cos(ang) * dist * 0.9;
                    const y = Math.sin(ang) * dist * 0.75 + burst * burst * 90;
                    return <line key={j} x1={x} y1={y} x2={x + Math.cos(ang + 1.2) * 16} y2={y + Math.sin(ang + 1.2) * 16} stroke={white} strokeWidth={4} opacity={1 - burst} />;
                  })
                : null}
              {/* the two pens */}
              {penA.on ? <InsulinPen cx={-penDx} cy={penA.dy} h={penH} body={white} cap={white} detail={COLORS.ink} window={COLORS.ink} squash={penA.squash} /> : null}
              {penB.on ? <InsulinPen cx={penDx} cy={penB.dy} h={penH} body={white} cap={white} detail={COLORS.ink} window={COLORS.ink} squash={penB.squash} /> : null}
            </svg>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// The dot globe
// ══════════════════════════════════════════════════════════════════════════
// Coarse continent outlines [lon, lat] — schematic, only for a dot-matrix fill.
const LAND: number[][][] = [
  // North America
  [[-165, 68], [-140, 70], [-95, 72], [-80, 65], [-62, 58], [-55, 50], [-66, 44], [-75, 35], [-81, 25], [-97, 26], [-97, 18], [-88, 15], [-83, 9], [-78, 8], [-92, 14], [-105, 20], [-110, 24], [-117, 33], [-124, 40], [-124, 48], [-135, 57], [-150, 60], [-165, 60]],
  // Greenland
  [[-55, 60], [-45, 60], [-20, 70], [-20, 80], [-60, 82], [-70, 76]],
  // South America
  [[-78, 8], [-60, 10], [-50, 0], [-35, -6], [-40, -22], [-48, -28], [-58, -38], [-65, -55], [-72, -50], [-74, -40], [-71, -18], [-81, -5], [-80, 2]],
  // Europe
  [[-10, 36], [-9, 43], [-2, 44], [-5, 48], [2, 51], [8, 54], [10, 58], [5, 62], [15, 69], [28, 71], [40, 67], [40, 55], [30, 45], [26, 40], [20, 40], [15, 38], [12, 44], [3, 42]],
  // Great Britain
  [[-5, 50], [1, 51], [0, 53], [-3, 56], [-5, 58], [-6, 55], [-3, 54]],
  // Africa
  [[-17, 15], [-17, 21], [-10, 30], [-6, 36], [10, 37], [20, 32], [32, 31], [35, 28], [43, 12], [51, 12], [40, -2], [40, -15], [33, -26], [20, -35], [17, -29], [12, -15], [13, -5], [9, 4], [-8, 5], [-15, 10]],
  // Asia
  [[28, 71], [60, 70], [80, 73], [110, 76], [140, 72], [180, 68], [180, 62], [160, 58], [140, 50], [135, 43], [122, 40], [121, 30], [110, 20], [106, 10], [100, 13], [98, 8], [92, 20], [80, 15], [77, 8], [72, 20], [60, 25], [50, 30], [57, 23], [52, 16], [45, 13], [35, 28], [35, 36], [30, 45], [40, 55], [40, 67]],
  // Japan
  [[130, 31], [132, 34], [140, 36], [142, 40], [141, 45], [145, 44], [140, 41], [136, 35], [131, 33]],
  // Australia
  [[114, -22], [122, -18], [130, -12], [137, -12], [142, -11], [146, -19], [153, -25], [150, -37], [141, -38], [131, -31], [115, -34]],
];
const inPoly = (lon: number, lat: number, poly: number[][]) => {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, yi] = poly[i];
    const [xj, yj] = poly[j];
    if (yi > lat !== yj > lat && lon < ((xj - xi) * (lat - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
};
const LAND_DOTS: [number, number][] = (() => {
  const out: [number, number][] = [];
  const step = 2.6;
  for (let lat = -56; lat <= 80; lat += step) {
    const dl = step / Math.max(0.25, Math.cos((lat * Math.PI) / 180));
    for (let lon = -180; lon < 180; lon += dl) {
      if (LAND.some((p) => inPoly(lon, lat, p))) out.push([lon, lat]);
    }
  }
  return out;
})();

const D2R = Math.PI / 180;
/** Orthographic projection. Returns unit-sphere screen x/y (y up) and z (>0 visible). */
const proj = (lon: number, lat: number, lon0: number, lat0: number, alt = 1) => {
  const l = (lon - lon0) * D2R;
  const p = lat * D2R;
  const p0 = lat0 * D2R;
  const x = Math.cos(p) * Math.sin(l);
  const y = Math.cos(p0) * Math.sin(p) - Math.sin(p0) * Math.cos(p) * Math.cos(l);
  const z = Math.sin(p0) * Math.sin(p) + Math.cos(p0) * Math.cos(p) * Math.cos(l);
  return { x: x * alt, y: y * alt, z };
};
/** great-circle interpolation between two [lon,lat] */
const slerp = (a: [number, number], b: [number, number], t: number): [number, number] => {
  const toV = ([lo, la]: [number, number]) => [Math.cos(la * D2R) * Math.cos(lo * D2R), Math.cos(la * D2R) * Math.sin(lo * D2R), Math.sin(la * D2R)];
  const va = toV(a);
  const vb = toV(b);
  const dot = Math.max(-1, Math.min(1, va[0] * vb[0] + va[1] * vb[1] + va[2] * vb[2]));
  const om = Math.acos(dot);
  if (om < 1e-6) return a;
  const s0 = Math.sin((1 - t) * om) / Math.sin(om);
  const s1 = Math.sin(t * om) / Math.sin(om);
  const v = [va[0] * s0 + vb[0] * s1, va[1] * s0 + vb[1] * s1, va[2] * s0 + vb[2] * s1];
  return [Math.atan2(v[1], v[0]) / D2R, Math.asin(v[2]) / D2R];
};

type Place = { label: string; lon: number; lat: number } & Cue;

// ══════════════════════════════════════════════════════════════════════════
// ApprovalGlobe — §2 (white card)
// ══════════════════════════════════════════════════════════════════════════
export const ApprovalGlobe: React.FC<Win & {
  date: { month: string; day: number } & Cue & { dayWord?: string; dayMs?: number };
  lead: { line: string; emphasize?: string } & Cue;
  stamp: { top: string; ring: string } & Cue;
  drug: { name: string; sub: string } & Cue & { subWord?: string; subMs?: number };
  spec: { line: string; emphasize: string } & Cue & { doseWord?: string; doseMs?: number };
  world: { line: string; emphasize?: string } & Cue;
  home: Place & { badge: string };
  others: Place[];
  reach: { line: string; emphasize?: string } & Cue & { ringWord?: string; ringMs?: number };
  /** the hook's pen seat, so the pen visibly arrives from where §1 left it */
  penFrom?: { cx: number; cy: number; h: number };
}> = ({ from, to, date, lead, stamp, drug, spec, world, home, others, reach, penFrom }) => {
  const ms = useMs();
  const vis = useVis(from, to, 1, 380);
  const acc = useAccent();
  const ink = COLORS.ink;
  const gray = COLORS.grayText;

  // ── cue times ────────────────────────────────────────────────────────
  const tDate = at(date, from + 400, from);
  const tDay = Math.max(tDate + 250, date.dayMs ?? cue(date.dayWord, tDate + 500, from));
  const tLead = Math.max(tDay + 200, at(lead, tDay + 600, from));
  const tStamp = Math.max(tLead + 400, at(stamp, tLead + 1600, tLead));
  const tDrug = Math.max(tStamp + 300, at(drug, tStamp + 1000, tStamp));
  const tSub = Math.max(tDrug + 300, drug.subMs ?? cue(drug.subWord, tDrug + 1000, tDrug));
  const tSpec = Math.max(tSub + 400, at(spec, tSub + 2000, tSub));
  const tDose = Math.max(tSpec + 100, spec.doseMs ?? cue(spec.doseWord, tSpec + 300, tSpec));
  const tWorld = Math.max(tDose + 1500, at(world, tDose + 4000, tDose));
  const tHome = Math.max(tWorld + 300, at(home, tWorld + 400, tWorld));
  const tOthers = others.map((o, i) => Math.max(tHome + 900 + i * 500, at(o, tHome + 2000 + i * 1000, tHome)));
  const tReach = Math.max(tOthers[tOthers.length - 1] + 700, at(reach, tOthers[tOthers.length - 1] + 1200, tOthers[tOthers.length - 1]));
  const tRing = Math.max(tReach + 300, reach.ringMs ?? cue(reach.ringWord, tReach + 900, tReach));

  // ── the stamp thud shakes the card content ──────────────────────────
  const sSt = (ms - tStamp) / 1000;
  const shake = sSt >= 0 ? 9 * damp(sSt, 7, 30) : 0;

  // ── phase A: right-half product shot ────────────────────────────────
  const lift = EASE_IN(kf(ms, tWorld - 150, 560)); // the whole right half lifts away
  const liftY = -1000 * lift;
  const PEN_REST = { cx: 1430, cy: 450, h: 660 };
  const pf = penFrom ?? { cx: ORBIT.cx - ORBIT.penDx, cy: ORBIT.cy, h: ORBIT.penH };
  const fly = EASE_IO(kf(ms, from + 80, 900));
  const settle = (ms - from - 980) / 1000;
  const bob = settle > 0 ? 6 * Math.sin(settle * 1.6) : 0;
  const penCx = interpolate(fly, [0, 1], [pf.cx, PEN_REST.cx]);
  const penCy = interpolate(fly, [0, 1], [pf.cy, PEN_REST.cy]) + bob + liftY;
  const penH = interpolate(fly, [0, 1], [pf.h, PEN_REST.h]);
  const penRot = interpolate(fly, [0, 1], [0, 90]) + (settle > 0 ? 1.2 * Math.sin(settle * 1.1) : 0);
  const doseP = kf(ms, tDose, 200);

  // stamp: falls from the camera (scale 2.6 → 1) and slams
  const stampIn = kf(ms, tStamp - 240, 240);
  const stampScale = ms < tStamp ? interpolate(stampIn, [0, 1], [2.6, 1], { easing: EASE_IN }) : 1 - 0.05 * damp(sSt, 9, 30);
  const stampInk = interpolate(ms, [tDose - 100, tDose + 300], [0, 1], CLAMP); // hands the red to the dose
  const stampColor = stampInk > 0.5 ? ink : acc;
  const ST = { cx: 1600, cy: 250, r: 132 };

  // week strip under the pen
  const cell = 86;
  const gap = 14;
  const stripX = PEN_REST.cx - (7 * cell + 6 * gap) / 2;
  const stripY = 690;
  const appear = DAYS.map((_, i) => EASE(kf(ms, tSpec - 150 + i * 60, 320)));
  const dropU = kf(ms, tDose, 520);
  const lit = DAYS.map((_, i) => (i === 0 ? EASE(kf(ms, tDose + 460, 260)) : 0));

  // ── phase B: the globe ──────────────────────────────────────────────
  const G = { cx: 1400, cy: 500, R: 350 };
  const rise = EASE(kf(ms, tWorld - 60, 900));
  const gcy = G.cy + (1 - rise) * 820;
  // camera path: home → each other → home. Longitudes are unwrapped by hand-picked
  // targets (shortest arcs), easing IN each target before its pin drops.
  const lonKeys: [number, number][] = [[tWorld, home.lon - 8], [tHome + 400, home.lon]];
  others.forEach((o, i) => {
    let target = o.lon;
    const prev = lonKeys[lonKeys.length - 1][1];
    while (target - prev > 180) target -= 360;
    while (target - prev < -180) target += 360;
    lonKeys.push([tOthers[i] - 650, prev]);
    lonKeys.push([tOthers[i] - 60, target]);
  });
  {
    const prev = lonKeys[lonKeys.length - 1][1];
    let target = home.lon;
    while (target - prev > 180) target -= 360;
    while (target - prev < -180) target += 360;
    lonKeys.push([tReach - 500, prev]);
    lonKeys.push([tReach + 500, target]);
  }
  let lon0 = lonKeys[0][1];
  for (let i = 1; i < lonKeys.length; i++) {
    const [ta, la] = lonKeys[i - 1];
    const [tb, lb] = lonKeys[i];
    if (ms >= ta && ms <= tb) lon0 = la + (lb - la) * EASE_IO(clamp01((ms - ta) / Math.max(1, tb - ta)));
    else if (ms > tb) lon0 = lb;
  }
  // idle drift so the globe is never frozen
  lon0 += 0.6 * Math.sin((ms - tWorld) / 1400);
  const lat0 = 24;

  const P = (lon: number, lat: number, alt = 1) => {
    const p = proj(lon, lat, lon0, lat0, alt);
    return { x: G.cx + G.R * p.x, y: gcy - G.R * p.y, z: p.z };
  };

  const places = [{ ...home, t: tHome, red: true }, ...others.map((o, i) => ({ ...o, t: tOthers[i], red: false, badge: "" }))];

  // arcs in spoken order: other[0] → other[1] → … → home
  const chain: { a: Place; b: Place; t: number }[] = [];
  for (let i = 1; i < others.length; i++) chain.push({ a: others[i - 1], b: others[i], t: tOthers[i] - 250 });
  chain.push({ a: others[others.length - 1], b: home, t: tReach - 300 });

  // lines
  const lineOut = (t: number) => interpolate(ms, [t - 250, t + 100], [1, 0], CLAMP);
  const lineIn = (t: number) => kf(ms, t - 150, 250);

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <AbsoluteFill style={{ transform: `translate(${shake * 0.6}px, ${shake}px)` }}>
        {/* ── left column ──────────────────────────────────────────── */}
        {/* date tile */}
        <div style={{ position: "absolute", left: 130, top: 104, width: 152, height: 152, perspective: 800 }}>
          <div style={{ width: "100%", height: "100%", background: ink, borderRadius: 14, transformOrigin: "top", transform: `rotateX(${(1 - EASE(kf(ms, tDate, 420))) * -90}deg)`, opacity: kf(ms, tDate, 60), display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 32, letterSpacing: TRACK.nav, color: "rgba(255,255,255,0.7)" }}>{date.month}</div>
            <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 92, lineHeight: 1, letterSpacing: TRACK.display, color: COLORS.paper, fontVariantNumeric: "tabular-nums", opacity: kf(ms, tDay, 100) }}>
              {Math.max(1, Math.round(EASE_IO(kf(ms, tDay, 520)) * date.day))}
            </div>
          </div>
        </div>
        <div style={{ position: "absolute", left: 318, top: 116, width: 640 }}>
          <FlowLine from={tLead - 60} to={tDrug} line={lead.line} size={52} color={ink} restColor={gray} restWeight={400} emphasize={lead.emphasize} empColor={ink} lineHeight={1.12} />
        </div>

        {/* drug name + INN */}
        <div style={{ position: "absolute", left: 122, top: 300, ...(() => {
          const o = kf(ms, tDrug, 120);
          const sc = interpolate(ms, [tDrug, tDrug + 320], [1.22, 1], { ...CLAMP, easing: EASE });
          return { opacity: o, transform: `scale(${sc})`, transformOrigin: "left center" };
        })() }}>
          <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 196, lineHeight: 1, letterSpacing: TRACK.display, color: ink }}>{drug.name}</div>
        </div>
        <div style={{ position: "absolute", left: 132, top: 516, width: 800 }}>
          <FlowLine from={tSub - 40} to={tSpec} line={drug.sub} size={50} color={gray} weight={400} />
        </div>

        {/* spec line → world line → reach line, one seat */}
        <div style={{ position: "absolute", left: 132, top: 626, width: 820 }}>
          <div style={{ opacity: lineOut(tWorld) }}>
            <FlowLine from={tSpec - 60} to={tWorld} line={spec.line} size={52} color={ink} restColor={inkA(0.55)} restWeight={400} emphasize={spec.emphasize} empColor={acc} underline={acc} lineHeight={1.14} />
          </div>
        </div>
        <div style={{ position: "absolute", left: 132, top: 626, width: 820, opacity: lineIn(tWorld) * lineOut(tReach) }}>
          <FlowLine from={tWorld - 60} to={tReach} line={world.line} size={52} color={ink} restColor={inkA(0.55)} restWeight={400} emphasize={world.emphasize} empColor={ink} lineHeight={1.14} />
        </div>
        <div style={{ position: "absolute", left: 132, top: 626, width: 820, opacity: lineIn(tReach) }}>
          <FlowLine from={tReach - 60} to={to} line={reach.line} size={52} color={ink} restColor={inkA(0.55)} restWeight={400} emphasize={reach.emphasize} empColor={ink} lineHeight={1.14} />
        </div>

        {/* ── right half: phase A (lifts away on the world cue) ──────── */}
        <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          {lift < 1 ? (
            <g>
              {/* pen shadow */}
              <ellipse cx={PEN_REST.cx} cy={PEN_REST.cy + 120 + liftY} rx={300 * fly} ry={18} fill={inkA(0.08)} />
              <InsulinPen cx={penCx} cy={penCy} h={penH} rotate={penRot} body={ink} cap={ink} detail={COLORS.paper} band={inkA(0.0)}
                window={interpolateColorsSafe(doseP, COLORS.paper, COLORS.accent)} />
              {/* the dose: a red drop from the dose window into Monday */}
              {dropU > 0 && dropU < 1 ? (() => {
                const wx = penCx - penH * 0.19; // dose window: rotate(90) maps body-y +0.19h to x −0.19h
                const wy = penCy;
                const tx = stripX + cell / 2;
                const ty = stripY + cell / 2 + liftY;
                const e = EASE_IN(dropU);
                const x = wx + (tx - wx) * EASE_IO(dropU);
                const y = wy + (ty - wy) * e - Math.sin(dropU * Math.PI) * 60;
                return <circle cx={x} cy={y} r={16 - dropU * 4} fill={COLORS.accent} />;
              })() : null}
              <g transform={`translate(0 ${liftY})`}>
                <WeekStrip x={stripX} y={stripY} cell={cell} gap={gap} ink={ink} lit={lit} appear={appear} fill={COLORS.accent} />
              </g>
              {/* stamp */}
              {stampIn > 0 ? (
                <g transform={`translate(${ST.cx} ${ST.cy + liftY}) rotate(-13) scale(${stampScale})`} opacity={stampIn}>
                  <defs>
                    <path id="stampRing" d={`M ${-ST.r + 26} 0 A ${ST.r - 26} ${ST.r - 26} 0 1 1 ${ST.r - 26} 0 A ${ST.r - 26} ${ST.r - 26} 0 1 1 ${-ST.r + 26} 0`} />
                  </defs>
                  <circle r={ST.r} fill={COLORS.paper} fillOpacity={0.9} stroke={stampColor} strokeWidth={9} />
                  <circle r={ST.r - 52} fill="none" stroke={stampColor} strokeWidth={3} />
                  <text fontFamily={SANS} fontWeight={700} fontSize={25} letterSpacing="0.02em" fill={stampColor}>
                    <textPath href="#stampRing" startOffset="0">{stamp.ring}</textPath>
                  </text>
                  <text x={0} y={26} textAnchor="middle" fontFamily={DISPLAY} fontWeight={700} fontSize={82} letterSpacing="-0.04em" fill={stampColor}>{stamp.top}</text>
                </g>
              ) : null}
              {/* ink splash at the slam */}
              {sSt >= 0 && sSt < 0.7
                ? Array.from({ length: 16 }, (_, j) => {
                    const u = clamp01(sSt / 0.7);
                    const ang = (j / 16) * Math.PI * 2 + hash(j + 3);
                    const d = ST.r + 10 + EASE(u) * (40 + hash(j) * 90);
                    return <circle key={j} cx={ST.cx + Math.cos(ang) * d} cy={ST.cy + liftY + Math.sin(ang) * d} r={(3 + hash(j + 7) * 5) * (1 - u)} fill={stampColor} opacity={1 - u} />;
                  })
                : null}
            </g>
          ) : null}

          {/* ── phase B: the globe ─────────────────────────────────── */}
          {rise > 0 ? (
            <g>
              <circle cx={G.cx} cy={gcy} r={G.R} fill={COLORS.paper} stroke={inkA(0.18)} strokeWidth={2} />
              {/* graticule */}
              {[-60, -30, 0, 30, 60].map((la) => {
                const pts: string[] = [];
                for (let lo = -180; lo <= 180; lo += 4) {
                  const q = P(lo, la);
                  pts.push(q.z > 0 ? `${q.x.toFixed(1)},${q.y.toFixed(1)}` : "|");
                }
                return pts.join(" ").split("|").filter((s) => s.trim().split(" ").length > 1).map((s, k) => (
                  <polyline key={`la${la}-${k}`} points={s.trim()} fill="none" stroke={inkA(0.1)} strokeWidth={1.5} />
                ));
              })}
              {Array.from({ length: 12 }, (_, k) => k * 30 - 180).map((lo) => {
                const pts: string[] = [];
                for (let la = -84; la <= 84; la += 4) {
                  const q = P(lo, la);
                  pts.push(q.z > 0 ? `${q.x.toFixed(1)},${q.y.toFixed(1)}` : "|");
                }
                return pts.join(" ").split("|").filter((s) => s.trim().split(" ").length > 1).map((s, k) => (
                  <polyline key={`lo${lo}-${k}`} points={s.trim()} fill="none" stroke={inkA(0.1)} strokeWidth={1.5} />
                ));
              })}
              {/* land dots, limb-darkened */}
              {LAND_DOTS.map(([lo, la], i) => {
                const q = P(lo, la);
                if (q.z <= 0.02) return null;
                const reveal = kf(ms, tWorld - 60 + (1 - q.z) * 500 + hash(i) * 250, 260);
                return <circle key={i} cx={q.x} cy={q.y} r={2.2 + 1.3 * q.z} fill={ink} opacity={(0.18 + 0.62 * q.z) * reveal} />;
              })}
              {/* arcs, in spoken order */}
              {chain.map(({ a, b, t }, k) => {
                const u = EASE_IO(kf(ms, t, 700));
                if (u <= 0) return null;
                const pts: string[] = [];
                const N = 40;
                for (let s = 0; s <= N * u; s++) {
                  const f = s / N;
                  const [lo, la] = slerp([a.lon, a.lat], [b.lon, b.lat], f);
                  const q = P(lo, la, 1 + 0.16 * Math.sin(Math.PI * f));
                  pts.push(q.z > -0.15 ? `${q.x.toFixed(1)},${q.y.toFixed(1)}` : "|");
                }
                return pts.join(" ").split("|").filter((s) => s.trim().split(" ").length > 1).map((s, j) => (
                  <polyline key={`arc${k}-${j}`} points={s.trim()} fill="none" stroke={inkA(0.55)} strokeWidth={3} strokeLinecap="round" />
                ));
              })}
              {/* not yet reached: dashed rings from the home pin + dashed patient marks */}
              {ms > tRing ? (() => {
                const hq = P(home.lon, home.lat);
                const out: React.ReactNode[] = [];
                for (let k = 0; k < 3; k++) {
                  const ph = (((ms - tRing) / 1500 + k / 3) % 1);
                  out.push(<circle key={`rr${k}`} cx={hq.x} cy={hq.y} r={18 + ph * 150} fill="none" stroke={acc} strokeWidth={3} strokeDasharray="8 8" opacity={(1 - ph) * 0.9 * clamp01(hq.z * 2)} />);
                }
                for (let k = 0; k < 18; k++) {
                  const lo = -121 + hash(k + 40) * 46;
                  const la = 30 + hash(k + 90) * 17;
                  const q = P(lo, la);
                  const on = kf(ms, tRing + 80 + k * 70, 240);
                  if (q.z <= 0) continue;
                  out.push(<circle key={`pt${k}`} cx={q.x} cy={q.y} r={9} fill={COLORS.paper} stroke={ink} strokeWidth={2.5} strokeDasharray="4 4" opacity={on * 0.85} />);
                }
                return out;
              })() : null}
              {/* pins */}
              {places.map((pl, k) => {
                const d = kf(ms, pl.t - 260, 260);
                if (d <= 0) return null;
                const alt = 1.14 + (1 - EASE_IN(d)) * 0.5;
                const base = P(pl.lon, pl.lat);
                const head = P(pl.lon, pl.lat, alt);
                const vis2 = clamp01(base.z * 4);
                const ripple = kf(ms, pl.t, 700);
                const col = pl.red ? COLORS.accent : ink;
                return (
                  <g key={`pin${k}`} opacity={vis2}>
                    {ripple > 0 && ripple < 1 ? <ellipse cx={base.x} cy={base.y} rx={8 + ripple * 60} ry={(8 + ripple * 60) * Math.max(0.3, base.z)} fill="none" stroke={col} strokeWidth={3 * (1 - ripple)} opacity={1 - ripple} /> : null}
                    <line x1={base.x} y1={base.y} x2={head.x} y2={head.y} stroke={col} strokeWidth={4} />
                    <circle cx={head.x} cy={head.y} r={pl.red ? 17 : 13} fill={col} />
                    <circle cx={base.x} cy={base.y} r={5} fill={col} />
                  </g>
                );
              })}
            </g>
          ) : null}
        </svg>

        {/* pin labels (HTML, so they use the label type tier) */}
        {rise > 0
          ? places.map((pl, k) => {
              const d = kf(ms, pl.t - 60, 260);
              if (d <= 0) return null;
              const base = P(pl.lon, pl.lat);
              const head = P(pl.lon, pl.lat, 1.14);
              const left = head.x > G.cx + G.R * 0.35;
              return (
                <div key={`lab${k}`} style={{
                  position: "absolute", top: head.y - 30, left: left ? head.x - 24 - 400 : head.x + 26, width: 400,
                  textAlign: left ? "right" : "left", opacity: d * clamp01(base.z * 4),
                  display: "flex", alignItems: "center", gap: 10, justifyContent: left ? "flex-end" : "flex-start",
                }}>
                  <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 40, letterSpacing: TRACK.nav, color: ink, background: "rgba(255,255,255,0.86)", padding: "2px 8px", borderRadius: 6 }}>{pl.label}</span>
                  {pl.red && pl.badge ? (
                    <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: 34, letterSpacing: TRACK.nav, color: COLORS.paper, background: COLORS.accent, padding: "4px 12px", borderRadius: 8 }}>{pl.badge}</span>
                  ) : null}
                </div>
              );
            })
          : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

/** tiny colour lerp for two hex colours (no interpolateColors import needed in SVG attrs) */
function interpolateColorsSafe(t: number, a: string, b: string) {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ch = (p: number, s: number) => (p >> s) & 255;
  const mix = (s: number) => Math.round(ch(pa, s) + (ch(pb, s) - ch(pa, s)) * clamp01(t));
  return `rgb(${mix(16)},${mix(8)},${mix(0)})`;
}
