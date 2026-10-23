// ─────────────────────────────────────────────────────────────────────────
// KIT · evidence — A COMPETITOR'S INTERIM NUMBER, AND THE DEALS BEFORE THIS ONE.
// Added on the Roche x Rona HORIZONTAL long-form, 2026-10-15 (16:9; absolute
// 1920x1080). One-mover rule and the frame budget.
//
// `ArrowheadData` (black, over a footage scrim): who and what (a chip row: month,
//   interim, phase, "own candidate"), the chips retire in a pause; the figure counts
//   as voiced while a block of visceral fat loses a TRUE-PROPORTION slice (14.1% of
//   its height, dashed as it leaves); an 8-week rail from a single dose; then the
//   rail retires and an "interim, early-stage" stamp qualifies the figure.
// `DealRail` (white card): one rail, three stations in date order. Two prior deals
//   carry their cash as stated; the third (this one) carries the §2 split bar in
//   miniature and its mechanism in the scene's one red. No shared money axis: the
//   script compares mechanisms here, not cash. The rail retires for the attribution
//   and three disease-area chips.
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { CLAMP, clamp01, COLORS, INK_SUB, inkA, useMs } from "./core";
import { at, lerp, useK, type Cued, type Win } from "./elora";
import { big, label, stamp } from "./rona";

const EASE = Easing.out(Easing.cubic);
const EASE_IO = Easing.inOut(Easing.cubic);
const BACK = Easing.out(Easing.back(1.7));
const fmt = (v: number, d: number) => v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

// ══════════════════════════════════════════════════════════════════════════
// ArrowheadData — the evidence (black world, footage behind)
// ══════════════════════════════════════════════════════════════════════════
export const ARROW = {
  kicker: { left: 160, top: 110, size: 40 },
  head: { left: 160, top: 180, size: 96 },
  chips: { left: 160, top: 320, size: 32 },
  fig: { left: 160, top: 400, size: 230 },
  figLabel: { left: 166, top: 650, size: 40 },
  block: { x: 1180, top: 380, w: 420, h: 400 },
  rail: { x0: 1180, x1: 1600, y: 870 },
  stampSeat: { left: 166, top: 790 },
};

export const ArrowheadData: React.FC<Win & {
  kicker: ({ text: string } & Cued)[]; // two parts, one line
  company: { name: string } & Cued;
  chips: ({ text: string; dashed?: boolean } & Cued)[];
  clear: Cued; // a pause: kicker + chips retire
  figure: { value: number; decimals: number; suffix: string; until: Cued } & Cued; // counts as voiced
  figLabel: ({ text: string } & Cued)[]; // two parts
  slice: Cued; // the slice leaves the block
  weeks: { label: string; n: number } & Cued; // the rail draws
  dose: { label: string } & Cued; // a dose mark at the rail's start
  qualify: { label: string } & Cued; // the rail retires, the stamp lands
}> = ({ from, to, kicker, company, chips, clear, figure, figLabel, slice, weeks, dose, qualify }) => {
  const ms = useMs();
  const k = useK();
  const WH = COLORS.paper;
  const RED = COLORS.accent;
  const A = ARROW;
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));

  let prev = from - 300;
  const tKick = kicker.map((p) => (prev = at(p, prev + 1500, from, prev + 200)));
  const tChip0 = at(chips[0], prev + 900, from, prev + 300);
  const tCo = at(company, tChip0 + 900, from, tChip0 + 300);
  prev = tChip0;
  const tChips = chips.map((c, i) => (i === 0 ? tChip0 : (prev = at(c, Math.max(prev, tCo) + 900, from, Math.max(prev, tCo) + 250))));
  const tClear = at(clear, prev + 1500, from, prev + 400);
  const tFig = at(figure, tClear + 300, from, tClear + 100);
  const tFigEnd = at(figure.until, tFig + 700, from, tFig + 300);
  prev = tFig;
  const tLab = figLabel.map((p) => (prev = at(p, prev + 700, from, prev + 300)));
  const tSlice = at(slice, tLab[0] + 1200, from, tLab[0] + 300);
  const tWeeks = at(weeks, tLab[tLab.length - 1] + 1500, from, tLab[tLab.length - 1] + 400);
  const tDose = at(dose, tWeeks + 900, from, tWeeks + 400);
  const tQual = at(qualify, tDose + 1300, from, tDose + 400);

  const topOut = 1 - k(tClear, 320);
  const fq = interpolate(ms, [tFig, tFigEnd + 200], [0, 1], { ...CLAMP, easing: EASE });
  const B = A.block;
  const sliceH = B.h * (figure.value / 100);
  const bq = k(tFig, 420); // the block lands with the count
  const sq = EASE_IO(k(tSlice, 700));
  const railOut = 1 - k(tQual - 400, 300);
  const rq = EASE_IO(k(tWeeks, 700)) * railOut;
  const R = A.rail;

  if (ms < tKick[0] - 80) return null;
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {/* ── who and what ── */}
      <div style={{ position: "absolute", left: A.kicker.left, top: A.kicker.top, display: "flex", gap: 14, opacity: topOut }}>
        {kicker.map((p, i) => <div key={i} style={{ opacity: k(tKick[i], 240), ...label(INK_SUB, A.kicker.size) }}>{p.text}</div>)}
      </div>
      <div style={{ position: "absolute", left: A.head.left, top: A.head.top, opacity: k(tCo, 200), transform: `translateX(${(1 - EASE(k(tCo, 380))) * -40}px)`, ...big(WH, A.head.size) }}>{company.name}</div>
      <div style={{ position: "absolute", left: A.chips.left, top: A.chips.top, display: "flex", gap: 18, opacity: topOut }}>
        {chips.map((c, i) => {
          const q = k(tChips[i], 260);
          return (
            <div key={i} style={{ padding: "10px 24px", borderRadius: 30, border: c.dashed ? "3px dashed rgba(255,255,255,0.75)" : "3px solid transparent", background: c.dashed ? "transparent" : "rgba(255,255,255,0.14)",
              opacity: clamp01(q * 3), transform: `translateY(${(1 - EASE(q)) * 16}px)`, ...label(WH, A.chips.size) }}>{c.text}</div>
          );
        })}
      </div>

      {/* ── the figure ── */}
      {ms >= tFig - 80 ? (
        <div style={{ position: "absolute", left: A.fig.left, top: A.fig.top, fontVariantNumeric: "tabular-nums", opacity: k(tFig - 60, 200), ...big(WH, A.fig.size) }}>
          {fmt(figure.value * fq, figure.decimals)}{figure.suffix}
        </div>
      ) : null}
      <div style={{ position: "absolute", left: A.figLabel.left, top: A.figLabel.top, width: 900 }}>
        {figLabel.map((p, i) => (
          <div key={i} style={{ opacity: k(tLab[i], 240), transform: `translateY(${(1 - EASE(k(tLab[i], 300))) * 12}px)`, ...label(i === 0 ? WH : INK_SUB, A.figLabel.size), marginBottom: 10 }}>{p.text}</div>
        ))}
      </div>

      {/* ── the block of visceral fat; a 14.1% slice leaves it ── */}
      <svg style={{ position: "absolute", left: 0, top: 0 }} width={1920} height={1080}>
        {bq > 0 ? (
          <g opacity={clamp01(bq * 3)}>
            <rect x={B.x} y={B.top + sliceH} width={B.w} height={B.h - sliceH} rx={10} fill="rgba(255,255,255,0.16)" stroke={WH} strokeWidth={4} />
            {/* the slice: attached, then lifts away and FADES OUT — nothing is left behind
                (a dashed red ghost of it read as a stray red line, Nel 2026-10-15) */}
            {sq < 1 ? (
              <rect x={B.x} y={B.top - sq * 90} width={B.w} height={sliceH - 8} rx={8}
                fill="rgba(255,255,255,0.16)" stroke={WH} strokeWidth={4} opacity={1 - sq} />
            ) : null}
          </g>
        ) : null}

        {/* ── the rail: 8 weeks from a single dose ── */}
        {rq > 0 ? (
          <g opacity={railOut}>
            <line x1={R.x0} y1={R.y} x2={lerp(R.x0, R.x1, rq)} y2={R.y} stroke={WH} strokeWidth={5} strokeLinecap="round" />
            {Array.from({ length: weeks.n + 1 }, (_, i) => {
              const x = R.x0 + ((R.x1 - R.x0) * i) / weeks.n;
              return x <= lerp(R.x0, R.x1, rq) + 1 ? <line key={i} x1={x} y1={R.y - 12} x2={x} y2={R.y + 12} stroke={WH} strokeWidth={4} /> : null;
            })}
            <circle cx={R.x0} cy={R.y} r={20 * EASE(k(tDose, 320))} fill={WH} />
          </g>
        ) : null}
      </svg>
      <div style={{ position: "absolute", right: 1920 - R.x1, top: R.y + 26, opacity: k(tWeeks + 300, 240) * railOut, ...label(WH, 32) }}>{weeks.label}</div>
      <div style={{ position: "absolute", left: R.x0 - 20, top: R.y + 26, opacity: k(tDose, 240) * railOut, ...label(INK_SUB, 32) }}>{dose.label}</div>

      {/* ── the qualifier ── */}
      {ms >= tQual - 60 ? (
        <div style={{ position: "absolute", left: A.stampSeat.left, top: A.stampSeat.top }}>
          <div style={{ padding: "14px 28px", borderRadius: 16, border: "4px dashed rgba(255,255,255,0.85)", ...label(WH, 40), ...stamp(k(tQual, 300), 1.3), transformOrigin: "0% 50%" }}>{qualify.label}</div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// DealRail — Roche's obesity deals (white card)
// ══════════════════════════════════════════════════════════════════════════
export const RAIL = {
  kicker: { left: 120, top: 110, size: 60 },
  y: 540,
  x0: 150, x1: 1770,
  xs: [400, 960, 1520],
  date: { top: 446, size: 40 },
  card: { top: 590, w: 500 },
  quote: { title: 270, name: 320, line: 500, chips: 600 },
};

type Station = {
  date: { text: string } & Cued;
  tag: { text: string } & Cued;
  name: { text: string } & Cued;
  sub?: { text: string; accent?: boolean } & Cued;
  figure?: { value: number; decimals: number; prefix: string; suffix: string; label: string; until: Cued } & Cued;
  bar?: { label: string; near: number; total: number } & Cued; // the §2 split bar, in miniature
};

export const DealRail: React.FC<Win & {
  kicker: ({ text: string } & Cued)[];
  rail: Cued; // the rail draws
  stations: Station[];
  clear: Cued; // the rail retires
  title: { text: string } & Cued;
  name: { text: string } & Cued;
  line: { text: string } & Cued;
  chips: ({ text: string } & Cued)[];
}> = ({ from, to, kicker, rail, stations, clear, title, name, line, chips }) => {
  const ms = useMs();
  const k = useK();
  const INK = COLORS.ink;
  const RED = COLORS.accent;
  const SUB = inkA(0.55);
  const R = RAIL;
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));

  let prev = from - 300;
  const tKick = kicker.map((p) => (prev = at(p, prev + 1500, from, prev + 200)));
  const tRail = at(rail, prev + 1000, from, prev + 300);
  prev = tRail;
  const tS = stations.map((s) => {
    const tDate = (prev = at(s.date, prev + 1500, from, prev + 300));
    const tTag = (prev = at(s.tag, prev + 800, from, prev + 200));
    const tName = (prev = at(s.name, prev + 600, from, prev + 200));
    // the mini bar (a callback) lands before the sub line when a station carries both
    const tBar = s.bar ? (prev = at(s.bar, prev + 600, from, prev + 200)) : Infinity;
    const tSub = s.sub ? (prev = at(s.sub, prev + 900, from, prev + 200)) : Infinity;
    const tFig = s.figure ? (prev = at(s.figure, prev + 900, from, prev + 200)) : Infinity;
    const tFigEnd = s.figure ? at(s.figure.until, tFig + 900, from, tFig + 300) : Infinity;
    return { tDate, tTag, tName, tSub, tFig, tFigEnd, tBar };
  });
  const tClear = at(clear, prev + 2000, from, prev + 400);
  const tTitle = at(title, tClear + 300, from, tClear + 100);
  const tName = at(name, tTitle + 1500, from, tTitle + 300);
  const tLine = at(line, tName + 1000, from, tName + 300);
  prev = tLine;
  const tChips = chips.map((c) => (prev = at(c, prev + 900, from, prev + 250)));

  const out = 1 - k(tClear, 320);
  const rq = EASE_IO(k(tRail, 900));

  if (ms < tKick[0] - 80) return null;
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {out > 0 ? (
        <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, opacity: out }}>
          <div style={{ position: "absolute", left: R.kicker.left, top: R.kicker.top, display: "flex", gap: 18 }}>
            {kicker.map((p, i) => <div key={i} style={{ opacity: k(tKick[i], 240), transform: `translateY(${(1 - EASE(k(tKick[i], 300))) * 14}px)`, ...big(i === 0 ? INK : SUB, R.kicker.size) }}>{p.text}</div>)}
          </div>

          <svg style={{ position: "absolute", left: 0, top: 0 }} width={1920} height={1080}>
            {rq > 0 ? <line x1={R.x0} y1={R.y} x2={lerp(R.x0, R.x1, rq)} y2={R.y} stroke={INK} strokeWidth={5} strokeLinecap="round" /> : null}
            {stations.map((s, i) => {
              const q = k(tS[i].tDate, 320);
              return q > 0 ? <circle key={i} cx={R.xs[i]} cy={R.y} r={16 * BACK(q)} fill={INK} /> : null;
            })}
          </svg>

          {stations.map((s, i) => {
            const t = tS[i];
            const cx = R.xs[i];
            const left = cx - R.card.w / 2;
            const fq = s.figure ? interpolate(ms, [t.tFig, t.tFigEnd + 200], [0, 1], { ...CLAMP, easing: EASE }) : 0;
            const barQ = s.bar ? EASE(k(t.tBar, 600)) : 0;
            const bw = 300;
            const nearW = s.bar ? (s.bar.near / s.bar.total) * bw : 0;
            return (
              <React.Fragment key={i}>
                <div style={{ position: "absolute", left, width: R.card.w, top: R.date.top, textAlign: "center", opacity: k(t.tDate, 240), ...big(INK, R.date.size) }}>{s.date.text}</div>
                <div style={{ position: "absolute", left, width: R.card.w, top: R.card.top }}>
                  <div style={{ opacity: k(t.tTag, 220), ...label(SUB, 28) }}>{s.tag.text}</div>
                  <div style={{ marginTop: 10, opacity: k(t.tName, 200), transform: `translateX(${(1 - EASE(k(t.tName, 340))) * -24}px)`, ...big(INK, 56) }}>{s.name.text}</div>
                  <div style={{ marginTop: 14, height: 34, opacity: s.sub ? k(t.tSub, 240) : 0, ...label(s.sub?.accent ? RED : SUB, 28) }}>{s.sub?.text ?? ""}</div>
                  {s.figure && ms >= t.tFig - 80 ? (
                    <div style={{ marginTop: 12, display: "flex", alignItems: "baseline", gap: 14, opacity: k(t.tFig - 60, 200) }}>
                      <div style={{ fontVariantNumeric: "tabular-nums", ...big(INK, 72) }}>{s.figure.prefix}{fmt(s.figure.value * fq, s.figure.decimals)}{s.figure.suffix}</div>
                      <div style={{ opacity: k(t.tFigEnd, 220), ...label(SUB, 28) }}>{s.figure.label}</div>
                    </div>
                  ) : null}
                  {s.bar && barQ > 0 ? (
                    <div style={{ marginTop: 26 }}>
                      <svg width={bw + 10} height={44} style={{ display: "block" }}>
                        <rect x={2} y={4} width={nearW} height={36} rx={4} fill={INK} opacity={clamp01(barQ * 3)} />
                        <rect x={nearW + 6} y={6} width={(bw - nearW - 6) * barQ} height={32} rx={4} fill="none" stroke={INK} strokeWidth={3} strokeDasharray="10 7" />
                      </svg>
                      <div style={{ marginTop: 10, opacity: k(t.tBar + 300, 240), ...label(SUB, 28) }}>{s.bar.label}</div>
                    </div>
                  ) : null}
                </div>
              </React.Fragment>
            );
          })}
        </div>
      ) : null}

      {/* ── the attribution ── */}
      <div style={{ position: "absolute", left: 160, top: R.quote.title, opacity: k(tTitle, 240), ...label(SUB, 36) }}>{title.text}</div>
      <div style={{ position: "absolute", left: 160, top: R.quote.name, opacity: k(tName, 200), transform: `translateX(${(1 - EASE(k(tName, 380))) * -40}px)`, ...big(INK, 120) }}>{name.text}</div>
      <div style={{ position: "absolute", left: 164, top: R.quote.line, opacity: k(tLine, 240), ...label(INK, 48) }}>{line.text}</div>
      <div style={{ position: "absolute", left: 160, top: R.quote.chips, display: "flex", gap: 22 }}>
        {chips.map((c, i) => {
          const q = k(tChips[i], 280);
          return (
            <div key={i} style={{ padding: "16px 32px", borderRadius: 40, background: INK, opacity: clamp01(q * 3), transform: `translateY(${(1 - EASE(q)) * 18}px)`, ...label(COLORS.paper, 40) }}>{c.text}</div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
