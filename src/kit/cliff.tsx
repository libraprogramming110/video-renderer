// ─────────────────────────────────────────────────────────────────────────
// KIT · cliff — WHY A COMPANY NEEDS THE READOUT. Added on the Bristol Myers
// Squibb two-readouts HORIZONTAL long-form, 2026-10-14 (16:9; absolute
// 1920x1080 coordinates, not portrait-safe as written). One-mover rule and the
// frame budget: three pages, one hero each, every page retires in a pause.
//
// `WordsTitle` (any world): a short title, one word per spoken word.
//
// `RevenueCliff` (white card):
//   page 1  two products named and bracketed; ONE bar that is the company's
//           revenue, filled to the share they make up (true proportion from
//           the two spoken figures); the figures count as voiced.
//   page 2  a year slams against a line; a label; both products run to the
//           line and stop.
//   page 3  a drug's name; the price paid for it and what it brought in, as
//           two counted figures. NOT one bar at one scale: a deal price and a
//           quarter's revenue on a shared axis is a claim the script does not make.
//
// Every onset is a spoken word with an optional ms pin, clamped monotonic
// (`at()` / `useK()` / `Cued` / `Win` come from ./elora).
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { CLAMP, clamp01, COLORS, DISPLAY, inkA, TRACK, useMs } from "./core";
import { TYPE } from "../style";
import { at, lerp, useK, type Cued, type Win } from "./elora";

const EASE = Easing.out(Easing.cubic);
const EASE_IO = Easing.inOut(Easing.cubic);

const label = (color: string, size: number = TYPE.label): React.CSSProperties => ({
  fontFamily: DISPLAY, fontWeight: 700, fontSize: size, letterSpacing: TRACK.kicker, color, whiteSpace: "nowrap",
});
const big = (color: string, size: number): React.CSSProperties => ({
  fontFamily: DISPLAY, fontWeight: 700, fontSize: size, letterSpacing: TRACK.display, color, lineHeight: 1, whiteSpace: "nowrap",
});

// ══════════════════════════════════════════════════════════════════════════
// WordsTitle
// ══════════════════════════════════════════════════════════════════════════
export const WordsTitle: React.FC<Win & { words: ({ text: string } & Cued)[]; color: string; left?: number; top?: number; size?: number }> = ({ from, to, words, color, left = 130, top = 380, size = 240 }) => {
  const ms = useMs();
  const k = useK();
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));
  let prev = from - 200;
  const ts = words.map((w) => (prev = at(w, prev + 300, from, prev + 120)));
  if (ms < ts[0] - 60) return null;
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <div style={{ position: "absolute", left, top, ...big(color, size) }}>
        {words.map((w, i) => (
          <span key={i} style={{ display: "inline-block", marginRight: "0.22em", opacity: k(ts[i], 110), transform: `scale(${lerp(1.25, 1, EASE(k(ts[i], 300)))})`, transformOrigin: "left bottom" }}>{w.text}</span>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// RevenueCliff (white card)
// ══════════════════════════════════════════════════════════════════════════
export const CLIFF = {
  bar: { x0: 130, x1: 1790, y: 500, h: 120 },
  names: { top: 290, size: 96, gap: 70 },
  year: { x: 1180, top: 180, size: 220, line: 1140 },
  lanes: { y: [540, 650], h: 70 },
  fig: { top: 520, size: 200, unit: 64, xa: 130, xb: 1010 },
};

type Counted = { value: number; prefix: string; unit: string; until: Cued } & Cued;

export const RevenueCliff: React.FC<Win & {
  kicker: { label: string } & Cued;
  products: ({ name: string } & Cued)[]; // two
  together: Cued; // the bracket under both
  track: Cued; // the revenue bar draws
  share: { part: number; whole: number; until: Cued } & Cued; // the fill grows to part/whole
  whole: { label: string } & Cued; // "Bristol's revenue"
  about: { label: string } & Cued;
  part: Counted; // "$7 billion"
  of: { label: string } & Cued; // "of $13 billion"
  turn: Cued; // a pause: page 1 retires
  source: { label: string } & Cued;
  year: { label: string } & Cued;
  yearLabel: { label: string } & Cued;
  both: { until: Cued } & Cued; // both lanes run to the line
  where: { label: string } & Cued;
  turn2: Cued; // a pause: page 2 retires
  drug: { name: string } & Cued;
  what: { label: string } & Cued;
  paid: Counted;
  paidLabel: { label: string } & Cued;
  earned: Counted;
  earnedLabel: { label: string } & Cued;
}> = ({ from, to, kicker, products, together, track, share, whole, about, part, of, turn, source, year, yearLabel, both, where, turn2, drug, what, paid, paidLabel, earned, earnedLabel }) => {
  const ms = useMs();
  const k = useK();
  const INK = COLORS.ink;
  const RED = COLORS.accent;
  const SUB = inkA(0.6);
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));
  const run = (a: number, b: number) => clamp01((ms - a) / Math.max(200, b - a));

  // page 1
  const tKick = at(kicker, from, from);
  let prev = tKick;
  const tProd = products.map((p) => (prev = at(p, prev + 700, from, prev + 250)));
  const tTog = at(together, prev + 400, from, prev + 250);
  const tTrack = at(track, tTog + 400, from, tTog + 300);
  const tShare = at(share, tTrack + 500, from, tTrack + 400);
  const tShareEnd = at(share.until, tShare + 900, from, tShare + 400);
  const tWhole = at(whole, tShareEnd + 200, from, tShareEnd);
  const tAbout = at(about, tWhole + 1200, from, tWhole + 300);
  const tPart = at(part, tAbout + 350, from, tAbout + 150);
  const tPartEnd = at(part.until, tPart + 400, from, tPart + 250);
  const tOf = at(of, tPartEnd + 800, from, tPartEnd + 200);
  const tTurn = at(turn, tOf + 700, from, tOf + 400);
  // page 2
  const tSrc = at(source, tTurn + 700, from, tTurn + 300);
  const tYear = at(year, tSrc + 1300, from, tSrc + 400);
  const tYearL = at(yearLabel, tYear + 1500, from, tYear + 400);
  const tBoth = at(both, tYearL + 2200, from, tYearL + 500);
  const tBothEnd = at(both.until, tBoth + 600, from, tBoth + 350);
  const tWhere = at(where, tBothEnd + 100, from, tBothEnd);
  const tTurn2 = at(turn2, tWhere + 800, from, tWhere + 400);
  // page 3
  const tDrug = at(drug, tTurn2 + 500, from, tTurn2 + 300);
  const tWhat = at(what, tDrug + 900, from, tDrug + 400);
  const tPaid = at(paid, tWhat + 1200, from, tWhat + 400);
  const tPaidEnd = at(paid.until, tPaid + 500, from, tPaid + 250);
  const tPaidL = at(paidLabel, tPaidEnd + 600, from, tPaidEnd + 100);
  const tEarn = at(earned, tPaidL + 1400, from, tPaidL + 400);
  const tEarnEnd = at(earned.until, tEarn + 600, from, tEarn + 250);
  const tEarnL = at(earnedLabel, tEarnEnd + 500, from, tEarnEnd + 100);

  const p1 = 1 - k(tTurn, 300);
  const p2 = 1 - k(tTurn2, 300);
  const B = CLIFF.bar;
  const W = B.x1 - B.x0;
  const frac = share.part / share.whole;
  const trackQ = EASE_IO(k(tTrack, 420));
  const fillQ = EASE_IO(run(tShare, tShareEnd));
  const N = CLIFF.names;
  const nameW = (s: string) => s.length * N.size * 0.56; // bold Inter, a budget for the bracket only
  const x2 = N.gap + nameW(products[0].name);
  const brW = x2 + nameW(products[1]?.name ?? "");
  const Y = CLIFF.year;
  const laneQ = EASE_IO(run(tBoth, tBothEnd));
  const F = CLIFF.fig;

  const figure = (x: number, c: Counted, t0: number, t1: number, color: string, lab: string, tl: number) => (
    <>
      <div style={{ position: "absolute", left: x, top: F.top, display: "flex", alignItems: "baseline", gap: 20, opacity: k(t0, 100) }}>
        <span style={{ ...big(color, F.size), fontVariantNumeric: "tabular-nums" }}>{c.prefix}{Math.round(c.value * run(t0, t1))}</span>
        <span style={{ ...big(color, F.unit) }}>{c.unit}</span>
      </div>
      <div style={{ position: "absolute", left: x, top: F.top + F.size + 30, opacity: k(tl, 220), ...label(SUB, 40) }}>{lab}</div>
    </>
  );

  if (ms < tKick - 60) return null;
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {/* ══ page 1: over half of revenue ══ */}
      {p1 > 0 ? (
        <div style={{ opacity: p1 }}>
          <div style={{ position: "absolute", left: 130, top: 120, opacity: k(tKick, 200), ...label(SUB, 36) }}>{kicker.label}</div>
          {products.map((p, i) => (
            <div key={i} style={{ position: "absolute", left: 130 + (i === 0 ? 0 : x2), top: N.top, opacity: k(tProd[i], 130), transform: `translateY(${(1 - EASE(k(tProd[i], 340))) * 34}px)`, ...big(INK, N.size) }}>{p.name}</div>
          ))}
          <div style={{ position: "absolute", left: 130, top: N.top + N.size + 26, width: brW * EASE_IO(k(tTog, 420)), height: 8, borderRadius: 4, background: INK }} />

          <div style={{ position: "absolute", left: B.x0, top: B.y, width: W * trackQ, height: B.h, borderRadius: 18, background: COLORS.panel }} />
          <div style={{ position: "absolute", left: B.x0, top: B.y, width: W * frac * fillQ, height: B.h, borderRadius: 18, background: RED }} />
          {/* the halfway mark: dashed, a reference and not a result */}
          <svg style={{ position: "absolute", left: B.x0 + W / 2 - 3, top: B.y - 22, opacity: clamp01((trackQ - 0.5) * 4) }} width={6} height={B.h + 44}>
            <line x1={3} y1={0} x2={3} y2={B.h + 44} stroke={inkA(0.55)} strokeWidth={5} strokeDasharray="12 10" />
          </svg>
          <div style={{ position: "absolute", left: B.x0 + W / 2 - 100, width: 200, textAlign: "center", top: B.y + B.h + 30, opacity: clamp01((trackQ - 0.5) * 4), ...label(SUB, 28) }}>Half</div>
          <div style={{ position: "absolute", left: B.x1 - 500, width: 500, textAlign: "right", top: B.y - 58, opacity: k(tWhole, 220), ...label(SUB, 34) }}>{whole.label}</div>

          <div style={{ position: "absolute", left: B.x0, top: B.y + B.h + 44, display: "flex", alignItems: "baseline", gap: 20 }}>
            <span style={{ opacity: k(tAbout, 180), ...label(SUB, 40) }}>{about.label}</span>
            <span style={{ opacity: k(tPart, 100), ...big(INK, 130), fontVariantNumeric: "tabular-nums" }}>{part.prefix}{Math.round(part.value * run(tPart, tPartEnd))}</span>
            <span style={{ opacity: k(tPart, 100), ...big(INK, 64) }}>{part.unit}</span>
          </div>
          <div style={{ position: "absolute", left: B.x1 - 700, width: 700, textAlign: "right", top: B.y + B.h + 96, opacity: k(tOf, 200), ...big(SUB, 72) }}>{of.label}</div>
        </div>
      ) : null}

      {/* ══ page 2: the year both run out ══ */}
      {ms >= tSrc - 20 && p2 > 0 ? (
        <div style={{ opacity: p2 }}>
          <div style={{ position: "absolute", left: 130, top: 120, opacity: k(tSrc, 200), ...label(SUB, 36) }}>{source.label}</div>
          <div style={{ position: "absolute", left: Y.x, top: Y.top, opacity: k(tYear, 110), transform: `scale(${lerp(1.25, 1, EASE(k(tYear, 320)))})`, transformOrigin: "left bottom", ...big(INK, Y.size) }}>{year.label}</div>
          <div style={{ position: "absolute", left: Y.line - 4, top: 160, width: 8, height: 640 * EASE_IO(k(tYear + 80, 420)), borderRadius: 4, background: RED }} />
          <div style={{ position: "absolute", left: Y.x, top: Y.top + Y.size + 28, opacity: k(tYearL, 220), ...label(SUB, 32) }}>{yearLabel.label}</div>
          {products.map((p, i) => (
            <div key={i} style={{ position: "absolute", left: 130, top: CLIFF.lanes.y[i], width: (Y.line - 4 - 130) * laneQ, height: CLIFF.lanes.h, borderRadius: "16px 0 0 16px", background: INK, overflow: "hidden" }}>
              <div style={{ position: "absolute", left: 30, top: 13, ...big(COLORS.paper, 44) }}>{p.name}</div>
            </div>
          ))}
          <div style={{ position: "absolute", left: Y.x, top: CLIFF.lanes.y[0] + 36, padding: "12px 34px 14px", borderRadius: 40, border: `4px solid ${INK}`, opacity: clamp01(k(tWhere, 120) * 2), transformOrigin: "0 50%", transform: `scale(${lerp(1.25, 1, EASE(k(tWhere, 280)))})`, ...label(INK, 36) }}>{where.label}</div>
        </div>
      ) : null}

      {/* ══ page 3: what was paid, what it brought in ══ */}
      {ms >= tDrug - 20 ? (
        <>
          <div style={{ position: "absolute", left: 130, top: 130, opacity: k(tDrug, 110), transform: `scale(${lerp(1.25, 1, EASE(k(tDrug, 320)))})`, transformOrigin: "left bottom", ...big(INK, 170) }}>{drug.name}</div>
          <div style={{ position: "absolute", left: 130, top: 330, opacity: k(tWhat, 220), ...big(SUB, 52) }}>{what.label}</div>
          {figure(F.xa, paid, tPaid, tPaidEnd, INK, paidLabel.label, tPaidL)}
          {figure(F.xb, earned, tEarn, tEarnEnd, RED, earnedLabel.label, tEarnL)}
        </>
      ) : null}
    </AbsoluteFill>
  );
};
