// ─────────────────────────────────────────────────────────────────────────
// KIT · bench — CHAI'S OWN NUMBERS, AND WHAT A BINDER IS NOT. GSK x Chai
// HORIZONTAL long-form, 2026-10-15 (absolute 1920x1080 coordinates).
//
// `ChaiBenchmark` (§4, black): the narration flows and retires; the published
//   panel is the §2 plate with a COUNT this time: 52 wells draw in, half of them
//   fill on "half"; beside it two rate bars, antibodies 16% and miniproteins 68%,
//   each counting as voiced. Same company, two formats, two very different
//   numbers: "vary by format" is enacted, not said.
// `BinderGates` (§4, white card): a rail from a solid "Binding" node to a
//   dashed "Clinical candidate"; Chai's own line flows above; the three gates
//   between land dashed (not yet) on manufacturable / stable / safe.
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { CLAMP, clamp01, COLORS, CountUp, DISPLAY, INK_SUB, inkA, TRACK, useMs } from "./core";
import { at, lerp, Phrase, useK, type Cued, type Win } from "./elora";

const EASE = Easing.out(Easing.cubic);
const EASE_IO = Easing.inOut(Easing.cubic);
const BACK = Easing.out(Easing.back(1.7));

const label = (color: string, size: number): React.CSSProperties => ({
  fontFamily: DISPLAY, fontWeight: 700, fontSize: size, letterSpacing: TRACK.kicker, color, whiteSpace: "nowrap", lineHeight: 1.1,
});
const big = (color: string, size: number): React.CSSProperties => ({
  fontFamily: DISPLAY, fontWeight: 700, fontSize: size, letterSpacing: TRACK.display, color, lineHeight: 1, whiteSpace: "nowrap",
});
const stamp = (q: number, from = 1.35) => ({ opacity: clamp01(q * 3), transform: `scale(${lerp(from, 1, EASE(q))})` });

// ══════════════════════════════════════════════════════════════════════════
// ChaiBenchmark — 52 targets, half with a binder; 16% vs 68% (black)
// ══════════════════════════════════════════════════════════════════════════
export const BENCH = {
  lead: { top: 110, size: 60 },
  kicker: { left: 150, top: 120, size: 40 },
  grid: { x0: 172, y0: 300, cols: 13, rows: 4, pitch: 62, r: 22 }, // x 150..916, y 278..508
  count: { left: 150, top: 560, size: 120 },
  countLabel: { left: 150, top: 690, size: 40 },
  half: { left: 150, top: 750, size: 40 },
  gauges: { left: 1120, w: 640, tops: [250, 560] as const, num: 150, barDy: 176, barH: 26, labelDy: 220 },
};

/** a deterministic half of 52: (i*7+3) mod 52 is a permutation, so exactly 26 are < 26 */
const HALF = Array.from({ length: 52 }, (_, i) => (i * 7 + 3) % 52 < 26);

export const ChaiBenchmark: React.FC<Win & {
  lead: { line: string; until: number };
  kicker: { label: string } & Cued; // "Chai-2 · published 2025"
  targets: { value: number; label: string } & Cued; // the grid draws, the count lands
  half: { label: string } & Cued; // half the wells fill
  gauges: ({ value: number; label: string; labelCue: Cued; until: Cued } & Cued)[]; // two rates
}> = ({ from, to, lead, kicker, targets, half, gauges }) => {
  const ms = useMs();
  const k = useK();
  const WH = COLORS.paper;
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));

  const tKick = at(kicker, lead.until + 200, from, lead.until);
  const tT = at(targets, tKick + 1500, from, tKick + 300);
  const tHalf = at(half, tT + 3000, from, tT + 600);
  let prev = tHalf;
  const tG = gauges.map((g) => {
    const l = at(g.labelCue, prev + 600, from, prev + 200);
    const n = at(g, l + 1500, from, l + 200);
    const e = at(g.until, n + 900, from, n + 300);
    prev = n;
    return { l, n, e };
  });

  const G = BENCH.grid;
  const GA = BENCH.gauges;
  const gridQ = k(tT, 900);

  if (ms < from - 60) return null;
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <Phrase from={from} to={lead.until} line={lead.line} top={BENCH.lead.top} size={BENCH.lead.size} color={WH} />
      <div style={{ position: "absolute", left: BENCH.kicker.left, top: BENCH.kicker.top, opacity: k(tKick, 220), ...label(INK_SUB, BENCH.kicker.size) }}>{kicker.label}</div>

      {/* ── the published panel: 52 wells, a count you can see ── */}
      {gridQ > 0 ? (
        <svg style={{ position: "absolute", left: 0, top: 0 }} width={1920} height={1080}>
          {Array.from({ length: G.cols * G.rows }, (_, i) => {
            const c = i % G.cols;
            const r = Math.floor(i / G.cols);
            const q = clamp01((gridQ - (c / G.cols) * 0.6) / 0.4);
            if (q <= 0) return null;
            const x = G.x0 + c * G.pitch;
            const y = G.y0 + r * G.pitch;
            const f = HALF[i] ? k(tHalf + c * 45, 260) : 0;
            return (
              <g key={i}>
                <circle cx={x} cy={y} r={G.r * BACK(q)} fill="none" stroke={WH} strokeOpacity={0.6} strokeWidth={3.5} />
                {f > 0 ? <circle cx={x} cy={y} r={(G.r - 6) * EASE(f)} fill={WH} /> : null}
              </g>
            );
          })}
        </svg>
      ) : null}
      <CountUp fromMs={tT} toMs={tT + 500} value={targets.value} decimals={0} style={{ position: "absolute", left: BENCH.count.left, top: BENCH.count.top, ...big(WH, BENCH.count.size) }} />
      <div style={{ position: "absolute", left: BENCH.countLabel.left, top: BENCH.countLabel.top, opacity: k(tT + 300, 220), ...label(INK_SUB, BENCH.countLabel.size) }}>{targets.label}</div>
      <div style={{ position: "absolute", left: BENCH.half.left, top: BENCH.half.top, opacity: k(tHalf + 200, 220), ...label(WH, BENCH.half.size) }}>{half.label}</div>

      {/* ── two formats, two rates ── */}
      {gauges.map((g, i) => {
        const t = tG[i];
        const top = GA.tops[i];
        if (ms < t.l - 60) return null;
        const fillQ = interpolate(ms, [t.n, t.e], [0, 1], { ...CLAMP, easing: EASE });
        const red = i === gauges.length - 1; // the one emphasis: the higher rate
        return (
          <div key={i}>
            <div style={{ position: "absolute", left: GA.left, top: top + GA.labelDy, opacity: k(t.l, 220), ...label(INK_SUB, 40) }}>{g.label}</div>
            <CountUp fromMs={t.n} toMs={t.e} value={g.value} decimals={0} suffix="%" style={{ position: "absolute", left: GA.left - 6, top, ...big(red ? COLORS.accent : WH, GA.num) }} />
            <div style={{ position: "absolute", left: GA.left, top: top + GA.barDy, width: GA.w, height: GA.barH, borderRadius: GA.barH / 2, background: "rgba(255,255,255,0.16)", opacity: k(t.l, 220) }} />
            <div style={{ position: "absolute", left: GA.left, top: top + GA.barDy, width: Math.max(GA.barH, GA.w * (g.value / 100) * fillQ), height: GA.barH, borderRadius: GA.barH / 2, background: red ? COLORS.accent : WH, opacity: fillQ > 0 ? 1 : 0 }} />
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// BinderGates — a binder is where the road starts (white card)
// ══════════════════════════════════════════════════════════════════════════
export const GATES = {
  line: { top: 120, size: 64 },
  by: { left: 90, top: 210, size: 34 },
  rail: { y: 560, xs: [240, 590, 940, 1290, 1640] as const },
  node: 46,
  labelTop: 640,
  start: { top: 440 },
};

export const BinderGates: React.FC<Win & {
  binder: { label: string } & Cued; // the solid node + its label
  start: { label: string } & Cued; // "Starting point" over it
  line: { text: string; from: number; until: number }; // Chai's own words
  by: { label: string } & Cued;
  candidate: { label: string } & Cued; // the rail draws to a dashed end node
  gates: ({ label: string } & Cued)[]; // three dashed gates land between
}> = ({ from, to, binder, start, line, by, candidate, gates }) => {
  const ms = useMs();
  const k = useK();
  const INK = COLORS.ink;
  const SUB = inkA(0.6);
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));

  const tBinder = at(binder, from, from);
  const tStart = at(start, tBinder + 800, from, tBinder + 300);
  const tBy = at(by, tStart + 1000, from, tStart + 300);
  const tCand = at(candidate, line.until + 300, from, tBy + 400);
  let prev = tCand;
  const tGates = gates.map((g) => (prev = at(g, prev + 1100, from, prev + 300)));

  const R = GATES.rail;
  const xs = R.xs;
  const railQ = EASE_IO(k(tCand, 700));
  const railX = lerp(xs[0], xs[4], railQ);
  const N = GATES.node;

  const node = (x: number, q: number, solid: boolean, key: string, sq = false) =>
    q <= 0 ? null : sq ? (
      <rect key={key} x={x - N * BACK(q)} y={R.y - N * BACK(q)} width={2 * N * BACK(q)} height={2 * N * BACK(q)} rx={14} fill="none" stroke={INK} strokeWidth={6} strokeDasharray="14 10" />
    ) : solid ? (
      <circle key={key} cx={x} cy={R.y} r={N * BACK(q)} fill={COLORS.accent} />
    ) : (
      <circle key={key} cx={x} cy={R.y} r={N * BACK(q)} fill={COLORS.paper} stroke={INK} strokeWidth={6} strokeDasharray="14 10" />
    );
  const nodeLabel = (x: number, text: string, o: number, key: string) => (
    <div key={key} style={{ position: "absolute", left: x - 260, width: 520, top: GATES.labelTop, textAlign: "center", opacity: o, ...label(INK, 38) }}>{text}</div>
  );

  if (ms < tBinder - 60) return null;
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <Phrase from={line.from} to={to} line={line.text} top={GATES.line.top} size={GATES.line.size} color={INK} />
      <div style={{ position: "absolute", left: GATES.by.left, top: GATES.by.top + 40, opacity: k(tBy, 220), ...label(SUB, GATES.by.size) }}>{by.label}</div>

      <svg style={{ position: "absolute", left: 0, top: 0 }} width={1920} height={1080}>
        {railQ > 0 ? <line x1={xs[0]} y1={R.y} x2={railX} y2={R.y} stroke={INK} strokeWidth={6} strokeDasharray="22 14" /> : null}
        {node(xs[0], k(tBinder, 380), true, "b")}
        {gates.map((_, i) => node(xs[i + 1], k(tGates[i], 360), false, `g${i}`))}
        {node(xs[4], clamp01((railX - xs[4] + 40) / 40), false, "c", true)}
      </svg>
      {nodeLabel(xs[0], binder.label, k(tBinder + 150, 220), "bl")}
      <div style={{ position: "absolute", left: xs[0] - 260, width: 520, top: GATES.start.top, textAlign: "center", ...label(SUB, 38), ...stamp(k(tStart, 280), 1.4) }}>{start.label}</div>
      {gates.map((g, i) => nodeLabel(xs[i + 1], g.label, k(tGates[i] + 120, 220), `gl${i}`))}
      {nodeLabel(xs[4], candidate.label, k(tCand + 500, 220), "cl")}
    </AbsoluteFill>
  );
};
