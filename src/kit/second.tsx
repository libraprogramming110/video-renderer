// ─────────────────────────────────────────────────────────────────────────
// KIT · second — THE SAME SHAPE, TWO DAYS EARLIER. Added on the AstraZeneca x
// insitro HORIZONTAL long-form, 2026-10-22 (16:9; absolute 1920x1080, black world).
//
// Motion law (Nel, 2026-10-22): one mover at a time, each one big. Nothing loops.
//
// `ThreeDays`: three day leaves flip in; a miniature of AstraZeneca's to-scale bar
//   drops onto Oct 15 ("of this shape"); a bracket spans "three days"; then a camera
//   WHIP-PAN (motion blur) centres Oct 13 and the rest flies out.
// `GenerateZealand`: Oct 13 flies up into a corner tag; "Generate" whips in from the
//   left, "Zealand" SLAMS into it from the right (recoil on impact); a multispecific
//   protein (a Y with three different binding pockets) ASSEMBLES from flying pieces; two lines
//   bar-reveal. Exits by SCROLLING UP as the money scrolls in (one move, both scenes).
// `GenerateMoney`: "$30M" slams out of a blur with a red sliver at the start of a
//   bar (the one red, as in §3); two dashed program slots pop up; on "milestones"
//   the dashed bar SHOOTS out to its true scale (30 of 1,200 = 2.5%); "$1.2B"
//   counts as a pen traces it.
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { CLAMP, clamp01, COLORS, INK_SUB, useMs } from "./core";
import { at, lerp, useK, type Cued, type Win } from "./elora";
import { big, label } from "./rona";
import { BarReveal, HollowFigure, Letters } from "./hunt";
import { DayLeaf } from "./unity";

const EASE = Easing.out(Easing.cubic);
const EASE_IO = Easing.inOut(Easing.cubic);
const BACK = Easing.out(Easing.back(1.8));
const SNAP = Easing.out(Easing.back(2.4));

const blurIn = (q: number, px: number) => (q < 1 ? `blur(${(1 - EASE(q)) * px}px)` : undefined);

// ══════════════════════════════════════════════════════════════════════════
// ThreeDays
// ══════════════════════════════════════════════════════════════════════════
export const DAYS = {
  xs: [640, 960, 1280] as const, top: 200, w: 200, h: 222,
  bracket: { y: 160, tick: 22, label: 92, size: 40 },
  mini: { cx: 1280, y: 470, w: 380, h: 34, label: 520, size: 30 },
};

export const ThreeDays: React.FC<Win & {
  month: string; days: [string, string, string];
  leaves: Cued; // flip in
  shape: { label: string; paid: number; total: number } & Cued; // the miniature drops onto the last day
  span: { label: string } & Cued; // the bracket over the three days
  whip: Cued; // the camera whips to the first day
}> = ({ from, to, month, days, leaves, shape, span, whip }) => {
  const ms = useMs();
  const k = useK();
  const WH = COLORS.paper;
  const RED = COLORS.accent;
  const D = DAYS;
  const vis = clamp01(interpolate(ms, [to - 250, to], [1, 0], CLAMP));

  const tLeaves = at(leaves, from, from);
  const tShape = at(shape, tLeaves + 700, from, tLeaves + 500);
  const tSpan = at(span, tShape + 800, from, tShape + 400);
  const tWhip = at(whip, tSpan + 900, from, tSpan + 400);

  const wq = EASE_IO(k(tWhip, 520));
  const blur = Math.sin(Math.PI * wq) * 18;
  const restOut = 1 - k(tWhip, 300);
  const shapeQ = k(tShape, 620);
  const bq = EASE_IO(k(tSpan, 520));
  const M = D.mini;
  const sliver = (M.w * shape.paid) / shape.total;

  if (ms < tLeaves - 60) return null;
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, transform: `translateX(${wq * (960 - D.xs[0])}px)`, filter: blur > 0.3 ? `blur(${blur}px)` : undefined }}>
        {D.xs.map((x, i) => (
          <div key={i} style={{ opacity: i === 0 ? 1 : restOut }}>
            <DayLeaf rect={{ x: x - D.w / 2, y: D.top, w: D.w, h: D.h }} k={k(tLeaves + i * 150, 560)} month={month} day={days[i]} />
          </div>
        ))}
        <div style={{ opacity: restOut }}>
          {/* "of this shape": AstraZeneca's to-scale bar in miniature drops onto Oct 15 */}
          {shapeQ > 0 ? (
            <div style={{ position: "absolute", left: M.cx - M.w / 2, top: M.y + lerp(-260, 0, Easing.out(Easing.bounce)(shapeQ)), width: M.w, opacity: clamp01(shapeQ * 4) }}>
              <div style={{ position: "relative", height: M.h, borderRadius: M.h / 2, border: `4px dashed ${WH}`, boxSizing: "border-box" }}>
                <div style={{ position: "absolute", left: -4, top: -4, bottom: -4, width: Math.max(8, sliver), borderRadius: M.h / 2, background: RED }} />
              </div>
              <div style={{ marginTop: 16, textAlign: "center", ...label(INK_SUB, M.size) }}>{shape.label}</div>
            </div>
          ) : null}
          {/* "in three days": a bracket over the leaves */}
          {bq > 0 ? (
            <>
              <svg style={{ position: "absolute", left: 0, top: 0 }} width={1920} height={1080}>
                <path d={`M ${D.xs[0] - D.w / 2} ${D.bracket.y + D.bracket.tick} V ${D.bracket.y} H ${lerp(D.xs[0] - D.w / 2, D.xs[2] + D.w / 2, bq)}`} fill="none" stroke={WH} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
                {bq >= 1 ? <path d={`M ${D.xs[2] + D.w / 2} ${D.bracket.y} V ${D.bracket.y + D.bracket.tick}`} stroke={WH} strokeWidth={5} strokeLinecap="round" /> : null}
              </svg>
              <div style={{ position: "absolute", left: 0, width: 1920, top: D.bracket.label, textAlign: "center", ...big(WH, D.bracket.size) }}>
                <Letters text={span.label} t={tSpan + 200} stagger={40} rise={30} mode="drop" />
              </div>
            </>
          ) : null}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// The multispecific protein — a clean antibody-style "Y" with a third arm: solid
// rounded arms and three DIFFERENT binding pockets (round, square, V), the visual
// for "binds more than one target". Each piece flies in and lands, then rests.
// (Rebuilt 2026-10-22: the dashed-outline version read as tangled — Nel: "ugly".)
// ══════════════════════════════════════════════════════════════════════════
const HINGE = { x: 150, y: 168 };
const ARM_LEN = 104;
const ARMS = [-50, 50, 0] as const; // left, right, top (deg from straight up)
const armEnd = (deg: number, len = ARM_LEN) => ({ x: HINGE.x + len * Math.sin((deg * Math.PI) / 180), y: HINGE.y - len * Math.cos((deg * Math.PI) / 180) });
const POCKETS = [
  "M -24 -34 V -12 A 24 24 0 0 0 24 -12 V -34", // round pocket
  "M -24 -34 V 0 H 24 V -34", // square pocket
  "M -26 -36 L 0 -2 L 26 -36", // V pocket
];
type ProteinPiece = { node: (c: string) => React.ReactNode; from: [number, number, number] };
const PROTEIN: ProteinPiece[] = [
  { node: (c) => <rect x={HINGE.x - 12} y={HINGE.y} width={24} height={118} rx={12} fill={c} />, from: [0, 520, 0] }, // the stem
  ...ARMS.map((deg, i): ProteinPiece => ({
    node: (c) => <rect x={HINGE.x - 12} y={HINGE.y - (i === 2 ? 86 : ARM_LEN)} width={24} height={i === 2 ? 86 : ARM_LEN} rx={12} fill={c} transform={`rotate(${deg} ${HINGE.x} ${HINGE.y})`} />,
    from: [[-560, 240, -160], [560, 280, 150], [-80, -520, 90]][i] as [number, number, number],
  })),
  ...ARMS.map((deg, i): ProteinPiece => {
    const e = armEnd(deg, i === 2 ? 86 : ARM_LEN);
    return {
      node: (c) => <path d={POCKETS[i]} fill="none" stroke={c} strokeWidth={11} strokeLinecap="round" strokeLinejoin="round" transform={`translate(${e.x} ${e.y}) rotate(${deg})`} />,
      from: [[-720, -160, 240], [720, -120, -220], [60, -660, -280]][i] as [number, number, number],
    };
  }),
];

const Protein: React.FC<{ cx: number; cy: number; scale: number; color: string; t: number }> = ({ cx, cy, scale, color, t }) => {
  const ms = useMs();
  if (ms < t - 40) return null;
  return (
    <svg style={{ position: "absolute", left: cx - 150 * scale, top: cy - 150 * scale, overflow: "visible" }} width={300 * scale} height={300 * scale} viewBox="0 0 300 300">
      {PROTEIN.map((p, i) => {
        const q = clamp01((ms - (t + i * 85)) / 560);
        if (q <= 0) return null;
        const e = BACK(q);
        const [dx, dy, r] = p.from;
        return (
          <g key={i} transform={`translate(${lerp(dx, 0, e)} ${lerp(dy, 0, e)}) rotate(${lerp(r, 0, e)} 150 150)`} opacity={clamp01(q * 4)}>
            {p.node(color)}
          </g>
        );
      })}
    </svg>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// GenerateZealand
// ══════════════════════════════════════════════════════════════════════════
export const GZ = {
  leaf: { from: { x: 860, y: 200, w: 200, h: 222 }, to: { x: 110, y: 70, w: 110, h: 122 } },
  names: { top: 250, size: 128, sub: 40, subTop: 392, gapX: 34 },
  protein: { cx: 960, cy: 640, scale: 0.86 },
  lines: { tops: [800, 862] as const, size: 40 },
};

export const GenerateZealand: React.FC<Win & {
  month: string; day: string;
  tag: Cued; // Oct 13 flies up into a corner tag
  a: { name: string; sub: string } & Cued; // whips in from the left
  b: { name: string; sub: string } & Cued; // slams in from the right
  protein: Cued; // assembles
  lines: ({ label: string } & Cued)[];
  scroll: Cued; // exits by scrolling up (the money scrolls in under it)
}> = ({ from, to, month, day, tag, a, b, protein, lines, scroll }) => {
  const ms = useMs();
  const k = useK();
  const WH = COLORS.paper;
  const G = GZ;
  const N = G.names;

  const tTag = at(tag, from, from);
  const tA = at(a, tTag + 400, from, tTag + 200);
  const tB = at(b, tA + 2000, from, tA + 600);
  const tP = at(protein, tB + 1200, from, tB + 500);
  const tL: number[] = [];
  lines.forEach((l, i) => tL.push(at(l, (tL[i - 1] ?? tP) + 1400, from, (tL[i - 1] ?? tP) + 600)));
  const tScroll = at(scroll, (tL[tL.length - 1] ?? tP) + 1500, from, (tL[tL.length - 1] ?? tP) + 400);

  const sc = EASE_IO(k(tScroll, 560));
  const gone = ms > Math.min(to, tScroll + 700);
  const lq = EASE_IO(k(tTag, 520));
  const tagOut = 1 - k(tB + 300, 300);
  const L = G.leaf;
  const aq = k(tA, 420);
  const bq = k(tB, 300);
  const impact = Math.sin(Math.PI * clamp01((ms - (tB + 300)) / 260)); // the recoil, after Zealand lands
  const recoil = ms > tB + 300 ? impact * -26 : 0;

  if (ms < tTag - 60 || gone) return null;
  return (
    <AbsoluteFill style={{ transform: `translateY(${-1080 * sc}px)` }}>
      {/* Oct 13: from the whip's centre seat up into a corner tag */}
      <div style={{ opacity: tagOut }}>
        <DayLeaf rect={{ x: lerp(L.from.x, L.to.x, lq), y: lerp(L.from.y, L.to.y, lq), w: lerp(L.from.w, L.to.w, lq), h: lerp(L.from.h, L.to.h, lq) }} k={1} month={month} day={day} />
      </div>
      {/* Generate whips in from the left, right-aligned to the centre seam */}
      {aq > 0 ? (
        <div style={{ position: "absolute", right: 960 + N.gapX, top: N.top, textAlign: "right", transform: `translateX(${lerp(-1300, 0, EASE(aq)) + recoil}px)`, filter: blurIn(aq, 24) }}>
          <div style={{ ...big(WH, N.size) }}>{a.name}</div>
          <div style={{ marginTop: 14, ...label(INK_SUB, N.sub) }}>{a.sub}</div>
        </div>
      ) : null}
      {/* Zealand SLAMS in from the right */}
      {bq > 0 ? (
        <div style={{ position: "absolute", left: 960 + N.gapX, top: N.top, transform: `translateX(${lerp(1300, 0, Easing.in(Easing.quad)(bq)) - recoil * 0.5}px)`, filter: blurIn(bq, 24) }}>
          <div style={{ ...big(WH, N.size) }}>{b.name}</div>
          <div style={{ marginTop: 14, ...label(INK_SUB, N.sub) }}>{b.sub}</div>
        </div>
      ) : null}
      {ms > tB + 300 ? (
        <svg style={{ position: "absolute", left: 0, top: 0 }} width={1920} height={1080}>
          <line x1={960} y1={N.top + 10} x2={960} y2={lerp(N.top + 10, N.subTop + 50, EASE(k(tB + 300, 300)))} stroke={WH} strokeWidth={5} strokeLinecap="round" />
        </svg>
      ) : null}
      <Protein cx={G.protein.cx} cy={G.protein.cy} scale={G.protein.scale} color={WH} t={tP} />
      {lines.map((l, i) => (
        <div key={i} style={{ position: "absolute", left: 0, width: 1920, top: G.lines.tops[i], textAlign: "center", ...label(i === 0 ? WH : INK_SUB, G.lines.size) }}>
          <BarReveal t={tL[i]} color={WH}>{l.label}</BarReveal>
        </div>
      ))}
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// GenerateMoney
// ══════════════════════════════════════════════════════════════════════════
export const GM = {
  paid: { left: 170, top: 250, size: 150, label: 412, labelSize: 40 },
  slots: { lefts: [620, 800] as const, top: 262, w: 150, h: 120, size: 28 },
  bar: { x0: 170, x1: 1760, top: 560, h: 68 },
  more: { right: 1760, top: 250, size: 150, label: 206, labelSize: 36 },
};

export const GenerateMoney: React.FC<Win & {
  enter: Cued; // scrolls in from below
  paid: { value: number; prefix: string; suffix: string; label: string; total: number } & Cued; // slams + the red sliver
  slots: { labels: [string, string] } & Cued; // two dashed program slots pop up
  run: Cued; // the dashed bar shoots out to scale
  more: { value: number; decimals: number; prefix: string; suffix: string; label: string; until: Cued } & Cued; // counts as the pen traces
}> = ({ from, to, enter, paid, slots, run, more }) => {
  const ms = useMs();
  const k = useK();
  const WH = COLORS.paper;
  const RED = COLORS.accent;
  const M = GM;
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));

  const tEnter = at(enter, from, from);
  const tPaid = at(paid, tEnter + 900, from, tEnter + 500);
  const tSlots = at(slots, tPaid + 1500, from, tPaid + 500);
  const tRun = at(run, tSlots + 1400, from, tSlots + 500);
  const tMore = at(more, tRun + 1600, from, tRun + 400);
  const tMoreEnd = at(more.until, tMore + 700, from, tMore + 400);

  const sc = EASE_IO(k(tEnter, 560));
  const pq = k(tPaid, 420);
  const B = M.bar;
  const sliverW = ((B.x1 - B.x0) * paid.value) / paid.total;
  const runQ = SNAP(k(tRun, 640));
  const runW = lerp(sliverW, B.x1 - B.x0, runQ);
  const mq = interpolate(ms, [tMore, tMoreEnd], [0, 1], { ...CLAMP, easing: EASE });
  const trace = interpolate(ms, [tMore, tMoreEnd + 400], [0, 1], { ...CLAMP, easing: EASE_IO });

  if (ms < tEnter - 60) return null;
  return (
    <AbsoluteFill style={{ opacity: vis, transform: `translateY(${1080 * (1 - sc)}px)` }}>
      {/* $30M upfront: slams out of a blur; its red sliver sits at the start of the bar */}
      {pq > 0 ? (
        <>
          <div style={{ position: "absolute", left: M.paid.left, top: M.paid.top, transformOrigin: "0% 50%", transform: `scale(${lerp(3.4, 1, EASE(pq))})`, opacity: clamp01(pq * 4), filter: blurIn(pq, 22), fontVariantNumeric: "tabular-nums", ...big(WH, M.paid.size) }}>
            {`${paid.prefix}${paid.value}${paid.suffix}`}
          </div>
          <div style={{ position: "absolute", left: M.paid.left + 4, top: M.paid.label, ...label(INK_SUB, M.paid.labelSize) }}>
            <BarReveal t={tPaid + 250} color={INK_SUB}>{paid.label}</BarReveal>
          </div>
          <div style={{ position: "absolute", left: B.x0, top: B.top, width: sliverW * EASE(pq), height: B.h, borderRadius: B.h / 2, background: RED }} />
        </>
      ) : null}
      {/* two initial programs: dashed slots pop up */}
      {M.slots.lefts.map((x, i) => {
        const q = BACK(k(tSlots + i * 140, 480));
        if (q <= 0) return null;
        return (
          <div key={i} style={{ position: "absolute", left: x, top: M.slots.top, width: M.slots.w, height: M.slots.h, borderRadius: 20, border: `5px dashed ${WH}`, boxSizing: "border-box",
            transform: `scale(${q})`, display: "flex", alignItems: "center", justifyContent: "center", ...label(WH, M.slots.size) }}>{slots.labels[i]}</div>
        );
      })}
      {/* the conditional run: the dashed bar SHOOTS out to its true scale */}
      {runQ > 0 ? (
        <div style={{ position: "absolute", left: B.x0, top: B.top, width: runW, height: B.h, borderRadius: B.h / 2, border: `6px dashed ${WH}`, boxSizing: "border-box" }} />
      ) : null}
      {runQ > 0 ? <div style={{ position: "absolute", left: B.x0, top: B.top, width: sliverW, height: B.h, borderRadius: B.h / 2, background: RED }} /> : null}
      <div style={{ position: "absolute", right: 1920 - M.more.right, top: M.more.label, textAlign: "right", ...label(INK_SUB, M.more.labelSize) }}>
        <BarReveal t={tRun + 300} color={INK_SUB}>{more.label}</BarReveal>
      </div>
      {ms >= tMore - 60 ? (
        <HollowFigure text={`${more.prefix}${(mq * more.value).toFixed(more.decimals)}${more.suffix}`} cx={M.more.right - 230} top={M.more.top} size={M.more.size} color={WH} sw={5} draw={trace} />
      ) : null}
    </AbsoluteFill>
  );
};
