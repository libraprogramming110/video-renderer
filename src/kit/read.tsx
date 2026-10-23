// ─────────────────────────────────────────────────────────────────────────
// KIT · read — `DealShape`, the §5 CALLBACK of `StakeDisc` (kit/stake.tsx).
// Added on the AstraZeneca x Summit long-form, 2026-09-30 (VERTICAL, black).
// Built under the one-mover rule: each beat is ONE motion, then it goes still.
//
//   "The shape of the deal"  the docked §2 icon grows back to the centre on the
//                            SAME geometry (STAKE), redrawn for black: white
//                            disc, red wedge, the lock, the frame, the bar.
//   "tells the story"        one bright pass travels round the frame (read).
//   "<buyer>"                the buyer's name lands on the wedge.
//   "isn't buying"           a dashed ring draws round the WHOLE disc (the
//                            purchase that would have owned it all)...
//   "an asset."              ...and breaks: its arcs fall away.
//   "paying"                 the shape docks top-left, small.
//   "its own ADC portfolio"  a dashed fence (the buyer's own) and its ADCs.
//   "worth more"             the ADCs RISE on growing columns, a cascade.
//   "with a bispecific"      the bispecific drops in OUTSIDE the fence.
//   "doesn't need to own"    links run from it across the fence into every ADC;
//                            the fence stays dashed and the drug stays outside.
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, interpolate, Easing } from "remotion";
import { CLAMP, clamp01, COLORS, cue, DISPLAY, SANS, TRACK, useMs, INK_SUB } from "./core";
import { FlowLine } from "./flowline";
import { STAKE } from "./stake";
import { YGlyph } from "./pairing";
import { TYPE } from "../style";

const EASE = Easing.out(Easing.cubic);
const EASE_IO = Easing.inOut(Easing.cubic);

type Win = { from: number; to: number };
type Cued = { word?: string; ms?: number };

const rad = (deg: number) => ((deg - 90) * Math.PI) / 180;
const polar = (cx: number, cy: number, deg: number, r: number) => [cx + r * Math.cos(rad(deg)), cy + r * Math.sin(rad(deg))] as const;
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const hash = (i: number) => {
  const x = Math.sin(i * 57.3 + 91.1) * 24634.6345;
  return x - Math.floor(x);
};

const SEATS = {
  dock: { x: 540, y: 380, s: 0.32 }, // where §2 left it
  centre: { x: 540, y: 700, s: 0.72 },
  corner: { x: 300, y: 420, s: 0.4 },
  fence: { x0: 90, y0: 840, x1: 990, y1: 1330 },
  adcX: [212, 432, 648, 868],
  adcY: 1180,
  adcRise: 170,
  adcScale: 0.6,
  bis: { x: 780, y: 470, s: 0.9 },
  lineTop: 1390,
};

export const DealShape: React.FC<Win & {
  stakeValue: number;
  grow: Cued;
  read: Cued;
  buyer: { name: string } & Cued;
  ring: Cued;
  breakAt: Cued;
  dock: Cued;
  fence: { label: string } & Cued;
  adcs: Cued;
  rise: Cued;
  bispecific: Cued;
  links: Cued;
  phrases: { line: string; from: number; to: number; emphasize?: string }[];
}> = ({ from, to, stakeValue, grow, read, buyer, ring, breakAt, dock, fence, adcs, rise, bispecific, links, phrases }) => {
  const ms = useMs();
  const k = (a: number, d: number) => clamp01(interpolate(ms, [a, a + d], [0, 1], CLAMP));
  const W = COLORS.paper;
  const ink = COLORS.ink;
  const red = COLORS.accent;
  const vis = clamp01(interpolate(ms, [to - 360, to], [1, 0], CLAMP));

  // onsets (monotonic)
  const tGrow = grow.ms ?? cue(grow.word, from + 400, from);
  const tRead = Math.max(tGrow + 700, read.ms ?? cue(read.word, tGrow + 900, from));
  const tBuyer = Math.max(tRead + 900, buyer.ms ?? cue(buyer.word, tRead + 1600, from));
  const tRing = Math.max(tBuyer + 400, ring.ms ?? cue(ring.word, tBuyer + 900, from));
  const tBreak = Math.max(tRing + 600, breakAt.ms ?? cue(breakAt.word, tRing + 800, from));
  const tDock = Math.max(tBreak + 700, dock.ms ?? cue(dock.word, tBreak + 1500, from));
  const tFence = Math.max(tDock + 700, fence.ms ?? cue(fence.word, tDock + 1200, from));
  const tAdcs = Math.max(tFence + 300, adcs.ms ?? cue(adcs.word, tFence + 600, from));
  const tRise = Math.max(tAdcs + 500, rise.ms ?? cue(rise.word, tAdcs + 1200, from));
  const tBis = Math.max(tRise + 700, bispecific.ms ?? cue(bispecific.word, tRise + 1300, from));
  const tLinks = Math.max(tBis + 500, links.ms ?? cue(links.word, tBis + 1100, from));

  // ── the shape's seat: dock -> centre -> corner (two moves, never overlapping)
  const g1 = EASE_IO(k(tGrow, 760));
  const g2 = EASE_IO(k(tDock, 720));
  const seat = {
    x: lerp(lerp(SEATS.dock.x, SEATS.centre.x, g1), SEATS.corner.x, g2),
    y: lerp(lerp(SEATS.dock.y, SEATS.centre.y, g1), SEATS.corner.y, g2),
    s: lerp(lerp(SEATS.dock.s, SEATS.centre.s, g1), SEATS.corner.s, g2),
  };
  const shapeIn = k(tGrow - 100, 300);
  const T = `translate(${seat.x - STAKE.cx * seat.s} ${seat.y - STAKE.cy * seat.s}) scale(${seat.s})`;

  const { cx, cy, R } = STAKE;
  const WEDGE = stakeValue * 3.6;
  const mid = WEDGE / 2;
  const [mdx, mdy] = [Math.cos(rad(mid)), Math.sin(rad(mid))];
  const ex = STAKE.extrude;
  const pie = (a0: number, a1: number, r: number, ox = 0, oy = 0) => {
    const [x0, y0] = polar(cx + ox, cy + oy, a0, r);
    const [x1, y1] = polar(cx + ox, cy + oy, a1, r);
    return `M ${cx + ox} ${cy + oy} L ${x0} ${y0} A ${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1} ${y1} Z`;
  };
  const F = STAKE.frame;
  const per = 2 * (F.x1 - F.x0 + F.y1 - F.y0);

  // the read: one bright segment travels once round the frame
  const readP = k(tRead, 1100);
  const readOn = readP > 0 && readP < 1;

  // buyer name on the wedge
  const buyerP = k(tBuyer, 300) * (1 - k(tDock, 300));

  // the whole-company ring: draws, then breaks into falling arcs
  const RR = R + 150;
  const ringDraw = EASE(k(tRing, 560));
  const brokeT = (ms - tBreak) / 1000;
  const broken = ms >= tBreak;
  const ARCS = 14;

  // fence + ADCs
  const fenceP = EASE(k(tFence, 600));
  const adcIn = EASE(k(tAdcs, 460));
  const riseOf = (i: number) => EASE_IO(k(tRise + i * 110, 560));

  // bispecific outside the fence, then the links
  const bisP = EASE(k(tBis, 520));
  const linkOf = (i: number) => EASE(k(tLinks + i * 110, 420));

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {/* ═══ the shape (callback) ═══ */}
        <g transform={T} opacity={shapeIn * (1 - 0.5 * g2)}>
          <rect x={F.x0} y={F.y0} width={F.x1 - F.x0} height={F.y1 - F.y0} rx={F.r} fill="none" stroke={W} strokeOpacity={0.55} strokeWidth={6} />
          {readOn ? (
            <rect x={F.x0} y={F.y0} width={F.x1 - F.x0} height={F.y1 - F.y0} rx={F.r} fill="none" stroke={W} strokeWidth={14} strokeLinecap="round"
              strokeDasharray={`240 ${per}`} strokeDashoffset={-readP * per} opacity={Math.sin(Math.PI * readP)} />
          ) : null}
          {/* the trial bar */}
          <rect x={STAKE.bar.x0} y={STAKE.bar.y0} width={STAKE.bar.x1 - STAKE.bar.x0} height={STAKE.bar.y1 - STAKE.bar.y0} rx={40} fill={W} />
          <text x={(STAKE.bar.x0 + STAKE.bar.x1) / 2} y={STAKE.bar.y0 + 55} textAnchor="middle" fontFamily={DISPLAY} fontWeight={700} fontSize={44} letterSpacing={TRACK.headline} fill={ink}>Joint trials</text>
          {/* disc minus the stake, and the stake */}
          <path d={pie(WEDGE, 360, R)} fill={W} />
          <path d={pie(0, WEDGE, R, mdx * ex, mdy * ex)} fill={red} />
          {/* the lock across the cut */}
          <g transform={`translate(${STAKE.lock.x} ${STAKE.lock.y})`}>
            <path d="M -26 -14 L -26 -40 A 26 26 0 0 1 26 -40 L 26 -14" fill="none" stroke={W} strokeWidth={12} strokeLinecap="round" />
            <rect x={-46} y={-14} width={92} height={78} rx={14} fill={ink} stroke={W} strokeWidth={8} />
            <circle cx={0} cy={22} r={9} fill={W} />
          </g>
          <text x={cx} y={cy + 36} textAnchor="middle" fontFamily={DISPLAY} fontWeight={700} fontSize={110} letterSpacing={TRACK.display} fill={ink}>Summit</text>
          {/* the buyer on its wedge */}
          <text x={STAKE.chip.nameX - 20} y={STAKE.chip.y - 6} fontFamily={DISPLAY} fontWeight={700} fontSize={60} letterSpacing={TRACK.headline} fill={W} opacity={buyerP}>{buyer.name}</text>

          {/* the purchase that would have owned it all: drawn, then broken */}
          {ms >= tRing && !broken && ringDraw > 0 ? (() => {
            const a = Math.min(359.9, ringDraw * 360);
            const [x0, y0] = polar(cx, cy, 0, RR);
            const [x1, y1] = polar(cx, cy, a, RR);
            return <path d={`M ${x0} ${y0} A ${RR} ${RR} 0 ${a > 180 ? 1 : 0} 1 ${x1} ${y1}`} fill="none" stroke={W} strokeWidth={10} strokeDasharray="18 18" />;
          })() : null}
          {broken && brokeT < 0.7
            ? Array.from({ length: ARCS }, (_, i) => {
                const a0 = (i / ARCS) * 360 + 3;
                const a1 = ((i + 1) / ARCS) * 360 - 3;
                const [x0, y0] = polar(cx, cy, a0, RR);
                const [x1, y1] = polar(cx, cy, a1, RR);
                const dy = 0.5 * 5200 * brokeT * brokeT;
                const dx = (hash(i) - 0.5) * 160 * brokeT;
                const rot = (hash(i + 5) - 0.5) * 90 * brokeT;
                const [mx, my] = polar(cx, cy, (a0 + a1) / 2, RR);
                return (
                  <path key={i} d={`M ${x0} ${y0} A ${RR} ${RR} 0 0 1 ${x1} ${y1}`} fill="none" stroke={W} strokeWidth={10}
                    transform={`translate(${dx} ${dy}) rotate(${rot} ${mx} ${my})`} opacity={1 - brokeT / 0.7} />
                );
              })
            : null}
        </g>

        {/* ═══ the buyer's own portfolio ═══ */}
        {fenceP > 0 ? (
          <rect x={SEATS.fence.x0} y={SEATS.fence.y0} width={SEATS.fence.x1 - SEATS.fence.x0} height={SEATS.fence.y1 - SEATS.fence.y0} rx={30} fill="none"
            stroke={W} strokeOpacity={0.5} strokeWidth={5} strokeDasharray="12 14" opacity={fenceP} />
        ) : null}

        {/* columns + ADCs, rising in a cascade */}
        {adcIn > 0
          ? SEATS.adcX.map((x, i) => {
              const r = riseOf(i);
              const y = SEATS.adcY - SEATS.adcRise * r + (1 - adcIn) * 40;
              const base = SEATS.fence.y1 - 30;
              const stemBottom = y + 150 * SEATS.adcScale + 6;
              return (
                <g key={i} opacity={adcIn}>
                  {r > 0 ? <rect x={x - 16} y={stemBottom} width={32} height={Math.max(0, base - stemBottom)} rx={6} fill={W} opacity={0.9} /> : null}
                  <g transform={`translate(${x} ${y}) scale(${SEATS.adcScale})`}>
                    <YGlyph color={W} tips={["chevron", "chevron"]} payload={1} payloadColor={W} />
                  </g>
                </g>
              );
            })
          : null}

        {/* links from the bispecific, across the fence, into every ADC */}
        {SEATS.adcX.map((x, i) => {
          const p = linkOf(i);
          if (p <= 0) return null;
          const x0 = SEATS.bis.x;
          const y0 = SEATS.bis.y + 150 * SEATS.bis.s + 10;
          const x1 = x;
          const y1 = SEATS.adcY - SEATS.adcRise - 150 * SEATS.adcScale - 8;
          return <line key={i} x1={x0} y1={y0} x2={lerp(x0, x1, p)} y2={lerp(y0, y1, p)} stroke={W} strokeWidth={5} strokeLinecap="round" />;
        })}

        {/* the bispecific: outside the fence */}
        {bisP > 0 ? (
          <g transform={`translate(${SEATS.bis.x} ${SEATS.bis.y - (1 - bisP) * 90}) scale(${SEATS.bis.s})`} opacity={bisP}>
            <YGlyph color={W} tips={["square", "round"]} />
          </g>
        ) : null}
      </svg>

      {/* fence label */}
      <div style={{ position: "absolute", left: SEATS.fence.x0 + 30, top: SEATS.fence.y0 - 62, opacity: k(tFence + 200, 300),
        fontFamily: SANS, fontWeight: 700, fontSize: TYPE.label, letterSpacing: TRACK.nav, color: INK_SUB }}>
        {fence.label}
      </div>

      {/* narration, phrase by phrase; the ONE red is the emphasis */}
      {phrases.map((p, i) => {
        const o = clamp01(interpolate(ms, [p.from - 80, p.from, p.to - 220, p.to], [0, 1, 1, 0], CLAMP));
        return o > 0 ? (
          <div key={i} style={{ position: "absolute", left: 90, right: 90, top: SEATS.lineTop, opacity: o }}>
            <FlowLine from={p.from} to={p.to} line={p.line} size={64} color={W} emphasize={p.emphasize} empColor={red} lineHeight={1.1} />
          </div>
        ) : null;
      })}
    </AbsoluteFill>
  );
};
