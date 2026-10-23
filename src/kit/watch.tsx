// ─────────────────────────────────────────────────────────────────────────
// KIT · watch — THE SIGNAL, IN ORDER. Added on the AstraZeneca x Summit
// HORIZONTAL long-form, 2026-10-05 (16:9; absolute 1920x1080 coordinates).
// One-mover rule + the frame budget from kit/equity.
//
// `SignalOrder` (white card, THE SPINE PAYS OFF): the dated node from §1 and §5
// lands at the left of a rail, solid red (it happened). Three stations follow
// in spoken order, each a HOLLOW ring on a DASHED stretch of rail (not yet),
// each with its own words under it. Over the last station the loose card from
// kit/partner returns small, still tilted and dashed, and four EMPTY bolt holes
// appear at its corners on "binding": the open question, drawn.
//
// Every onset is a spoken word with an optional ms pin, clamped monotonic.
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { CLAMP, clamp01, COLORS, DISPLAY, inkA, TRACK, useMs } from "./core";
import { FlowLine } from "./flowline";
import { at, lerp, useK, type Cued, type Win } from "./elora";
import { LOOSE } from "./partner";

const EASE = Easing.out(Easing.cubic);
const EASE_IO = Easing.inOut(Easing.cubic);
const BACK = Easing.out(Easing.back(1.7));

const W = 1920;
const H = 1080;

export const ORDER = {
  y: 470,
  node: { x: 170, r: 16 },
  xs: [520, 1010, 1500], // the three stations
  ring: 24,
  colW: 440,
  titleTop: 524,
  subTop: 640,
  card: { w: 220, h: 130, cy: 300, r: 18, inset: 24 }, // the loose card, small, over the last station
};

type Station = { text: string; emphasize?: string; word?: string; ms?: number; ringWord?: string; sub?: string; subWord?: string };

export const SignalOrder: React.FC<Win & {
  node: { label: string } & Cued; // the committed date
  stations: [Station, Station, Station];
  card: Cued; // the loose card returns over the last station
  holes: Cued; // four empty bolt holes
}> = ({ from, to, node, stations, card, holes }) => {
  const ms = useMs();
  const k = useK();
  const INK = COLORS.ink;
  const R = COLORS.accent;
  const SUB = COLORS.grayText;
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));
  const c = (word: string | undefined, fb: number, min: number) => Math.max(min, at({ word }, fb, from));

  const tNode = at(node, from, from);
  let prev = tNode + 400;
  const T = stations.map((s) => {
    const tRing = c(s.ringWord, prev + 200, prev);
    const tText = at(s, tRing + 500, from, tRing + 200);
    const tSub = c(s.subWord, tText + 500, tText + 200);
    prev = tSub + 600;
    return { tRing, tText, tSub };
  });
  const tCard = at(card, T[2].tText + 700, from, T[2].tText + 300);
  const tHoles = at(holes, tCard + 1200, from, tCard + 400);

  const O = ORDER;
  const nodeS = BACK(k(tNode, 320));
  const cardQ = k(tCard, 340);
  const Cd = O.card;
  const cx3 = O.xs[2];

  if (ms < tNode - 60 || vis <= 0) return null;
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {/* each stretch of rail draws to its station: dashed, because none of it has happened */}
        {O.xs.map((x, i) => {
          const x0 = i === 0 ? O.node.x : O.xs[i - 1] + O.ring;
          const q = EASE_IO(k(T[i].tRing - 60, 420));
          return q > 0 ? <line key={i} x1={x0} y1={O.y} x2={lerp(x0, x - O.ring, q)} y2={O.y} stroke={inkA(0.45)} strokeWidth={5} strokeLinecap="round" strokeDasharray="16 14" /> : null;
        })}
        {O.xs.map((x, i) => {
          const q = BACK(k(T[i].tRing + 240, 300));
          return q > 0 ? <circle key={i} cx={x} cy={O.y} r={O.ring * q} fill={COLORS.paper} stroke={INK} strokeWidth={8} /> : null;
        })}
        <circle cx={O.node.x} cy={O.y} r={O.node.r * nodeS} fill={R} />

        {/* the loose card, back: tilted, dashed, and its bolt holes empty */}
        {cardQ > 0 ? (
          <g transform={`translate(${cx3} ${Cd.cy + (1 - EASE(cardQ)) * 24}) rotate(${LOOSE.tilt})`} opacity={clamp01(cardQ * 3)}>
            <rect x={-Cd.w / 2} y={-Cd.h / 2} width={Cd.w} height={Cd.h} rx={Cd.r} fill="none" stroke={INK} strokeWidth={6} strokeDasharray="18 14" />
            {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sy], i) => {
              const q = BACK(k(tHoles + i * 70, 260));
              return q > 0 ? <circle key={i} cx={sx * (Cd.w / 2 - Cd.inset)} cy={sy * (Cd.h / 2 - Cd.inset)} r={9 * q} fill={COLORS.paper} stroke={INK} strokeWidth={4} /> : null;
            })}
          </g>
        ) : null}
      </svg>

      <div style={{ position: "absolute", left: O.node.x - 40, top: O.y - 78, opacity: k(tNode + 120, 200), fontFamily: DISPLAY, fontWeight: 700, fontSize: 40, letterSpacing: TRACK.display, color: INK, lineHeight: 1, whiteSpace: "nowrap" }}>{node.label}</div>

      {stations.map((s, i) => (
        <React.Fragment key={i}>
          {ms >= T[i].tText - 20 ? (
            <div style={{ position: "absolute", left: O.xs[i] - O.colW / 2, width: O.colW, top: O.titleTop }}>
              <FlowLine from={T[i].tText} to={T[i].tSub > T[i].tText + 250 ? T[i].tSub : T[i].tText + 3500} line={s.text} size={40} color={INK} restColor={INK} emphasize={s.emphasize} empColor={INK} lineHeight={1.14} align="center" />
            </div>
          ) : null}
          {s.sub ? (
            <div style={{ position: "absolute", left: O.xs[i] - O.colW / 2, width: O.colW, top: O.subTop, textAlign: "center", opacity: k(T[i].tSub, 220),
              fontFamily: DISPLAY, fontWeight: 700, fontSize: 28, letterSpacing: TRACK.kicker, color: SUB, lineHeight: 1.25 }}>
              {s.sub}
            </div>
          ) : null}
        </React.Fragment>
      ))}
    </AbsoluteFill>
  );
};
