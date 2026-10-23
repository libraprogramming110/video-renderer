// ─────────────────────────────────────────────────────────────────────────
// KIT · gets — WHAT THE BUYER GETS: two products, their revenue, the people.
// Added on the Viatris x Pacira HORIZONTAL long-form, 2026-10-14 (16:9; absolute
// 1920x1080 coordinates, not portrait-safe as written). One-mover rule and the
// frame budget: each cue gets ONE motion, a finished idea retires.
//
// `TwoMedicines` (ink, over a FootageScrim): a lead line that retires, two
//   product cards that land on "two", the scene's one red chip, then each card
//   is named and written line by line, ending in a footer chip.
// `RevenueSplit` (white card): ONE revenue track, segments at TRUE proportion
//   (the script gives both products AND the total, so the split is a fact, and
//   the unlabelled remainder is left as empty track); an EBITDA bar at the SAME
//   scale. Page turn: the EBITDA bar travels into a tile seat, the price is
//   bracketed as an empty dashed span, and EBITDA tiles fill it as the multiple
//   is voiced (tiles on screen = the multiple; 9.3 x 177 ≈ 1,646).
// `TeamCount` (ink, over a FootageScrim): "people" lands and dissolves into a
//   field of EXACTLY N reps (the spine's `Rep` glyph); the reps the script
//   singles out stay solid and the rest dim, row-true, as that figure counts.
//
// Every onset is a spoken word with an optional ms pin, clamped monotonic.
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { CLAMP, clamp01, COLORS, DISPLAY, INK_SUB, inkA, TRACK, useMs } from "./core";
import { TYPE } from "../style";
import { at, lerp, useK, type Cued, type Win } from "./elora";
import { Rep } from "./pacira";

const EASE = Easing.out(Easing.cubic);
const EASE_IO = Easing.inOut(Easing.cubic);
const BACK = Easing.out(Easing.back(1.7));

const label = (color: string, size: number = TYPE.label): React.CSSProperties => ({
  fontFamily: DISPLAY, fontWeight: 700, fontSize: size, letterSpacing: TRACK.kicker, color, whiteSpace: "nowrap",
});
const big = (color: string, size: number): React.CSSProperties => ({
  fontFamily: DISPLAY, fontWeight: 700, fontSize: size, letterSpacing: TRACK.display, color, lineHeight: 1, whiteSpace: "nowrap",
});
const stamp = (q: number, from = 1.35) => ({ opacity: clamp01(q * 3), transform: `scale(${lerp(from, 1, EASE(q))})` });
/** a figure that counts across its own voicing */
const counted = (ms: number, a: number, b: number, value: number, decimals = 0) =>
  (value * interpolate(ms, [a, Math.max(a + 1, b - 60)], [0, 1], { ...CLAMP, easing: EASE })).toLocaleString("en-US", {
    minimumFractionDigits: decimals, maximumFractionDigits: decimals,
  });

type Line = { text: string } & Cued;

// ══════════════════════════════════════════════════════════════════════════
// TwoMedicines — two product cards (ink, footage behind)
// ══════════════════════════════════════════════════════════════════════════
export const MEDS = {
  lead: { top: 440, size: 96 },
  chip: { top: 196, h: 72 },
  card: { w: 760, h: 470, top: 300, xs: [160, 1000] as const },
};

type MedCard = { name: string; lines: [Line, Line]; foot: { label: string } & Cued } & Cued;

export const TwoMedicines: React.FC<Win & {
  lead: Line[]; // the narration line, word group by word group
  clear: Cued; // a pause: the lead retires
  two: Cued; // both cards land
  marketed: { label: string } & Cued; // the cards' header label
  chip: { label: string } & Cued; // the scene's one red: "Non-opioid"
  cards: [MedCard, MedCard];
}> = ({ from, to, lead, clear, two, marketed, chip, cards }) => {
  const ms = useMs();
  const k = useK();
  const INK = COLORS.ink;
  const WH = COLORS.paper;
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));

  let prev = from;
  const tLead = lead.map((l) => (prev = at(l, prev + 300, from, prev)));
  const tClear = at(clear, prev + 700, from, prev + 300);
  const tTwo = at(two, tClear + 400, from, tClear + 200);
  const tMk = at(marketed, tTwo + 400, from, tTwo + 200);
  const tChip = at(chip, tMk + 600, from, tMk + 200);
  let p2 = tChip;
  const tc = cards.map((c) => {
    const n = (p2 = at(c, p2 + 900, from, p2 + 300));
    const l1 = (p2 = at(c.lines[0], p2 + 500, from, p2 + 150));
    const l2 = (p2 = at(c.lines[1], p2 + 600, from, p2 + 150));
    const f = (p2 = at(c.foot, p2 + 700, from, p2 + 200));
    return { n, l1, l2, f };
  });

  const M = MEDS;
  const leadO = 1 - k(tClear, 300);

  if (ms < tLead[0] - 60) return null;
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {/* ── the lead line (retires in the pause) ── */}
      {leadO > 0 ? (
        <div style={{ position: "absolute", left: 0, width: 1920, top: M.lead.top, display: "flex", justifyContent: "center", gap: 26, opacity: leadO }}>
          {lead.map((l, i) => {
            const q = k(tLead[i], 260);
            return <div key={i} style={{ ...big(WH, M.lead.size), opacity: q, transform: `translateY(${(1 - EASE(q)) * 24}px)` }}>{l.text}</div>;
          })}
        </div>
      ) : null}

      {/* ── the one red: non-opioid ── */}
      <div style={{ position: "absolute", left: 0, width: 1920, top: M.chip.top, display: "flex", justifyContent: "center" }}>
        <div style={{ height: M.chip.h, padding: "0 40px", borderRadius: M.chip.h / 2, background: COLORS.accent, display: "flex", alignItems: "center", ...label(WH, 40), ...stamp(k(tChip, 280), 1.5) }}>{chip.label}</div>
      </div>

      {/* ── the two cards ── */}
      {cards.map((c, i) => {
        const land = k(tTwo + i * 140, 440);
        if (land <= 0) return null;
        const t = tc[i];
        const nq = k(t.n, 300);
        return (
          <div key={i} style={{ position: "absolute", left: M.card.xs[i], top: M.card.top + (1 - BACK(land)) * 90, width: M.card.w, height: M.card.h, borderRadius: 28, background: WH, opacity: clamp01(land * 4) }}>
            <div style={{ position: "absolute", left: 44, top: 38, opacity: k(tMk, 220), ...label(inkA(0.5), 30) }}>{marketed.label}</div>
            <div style={{ position: "absolute", left: 44, top: 86, ...big(INK, 110), ...stamp(nq, 1.3), transformOrigin: "0% 50%" }}>{c.name}</div>
            {c.lines.map((l, j) => {
              const q = k(j === 0 ? t.l1 : t.l2, 260);
              return <div key={j} style={{ position: "absolute", left: 46, top: 234 + j * 66, opacity: q, transform: `translateX(${(1 - EASE(q)) * -24}px)`, ...big(INK, 52) }}>{l.text}</div>;
            })}
            <div style={{ position: "absolute", left: 44, top: 384, height: 56, padding: "0 26px", borderRadius: 28, background: INK, display: "flex", alignItems: "center", ...label(WH, 30), ...stamp(k(t.f, 260), 1.25), transformOrigin: "0% 50%" }}>{c.foot.label}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// RevenueSplit — one track at true proportion, then the multiple (white card)
// ══════════════════════════════════════════════════════════════════════════
export const REV = {
  kicker: { top: 96 },
  track: { x0: 160, x1: 1760, top: 300, h: 130 },
  total: { top: 172 },
  segLabel: { top: 452 },
  ebitda: { top: 680, h: 110 },
  tile: { x0: 160, top: 440, w: 150, h: 120, gap: 0 },
  bracket: { y: 404, label: 316 },
  multiple: { top: 640, size: 180 },
};

type Fig = { value: number; until: Cued } & Cued;

export const RevenueSplit: React.FC<Win & {
  kicker: { label: string } & Cued;
  track: Cued; // the empty track draws
  segA: { name: string } & Fig; // the first product's slice grows as its figure counts
  segB: { name: string } & Fig;
  total: { label: string } & Cued; // the bracket over the whole track
  totalValue: Fig;
  ebitda: { label: string } & Cued; // the EBITDA bar grows at the same scale
  ebitdaValue: Fig;
  turn: Cued; // a pause: revenue retires, the EBITDA bar travels to the tile seat
  price: { label: string } & Cued; // the dashed price span + bracket
  multiple: { value: number } & Fig; // tiles fill the span as it counts
  multipleLabel: { label: string } & Cued;
}> = ({ from, to, kicker, track, segA, segB, total, totalValue, ebitda, ebitdaValue, turn, price, multiple, multipleLabel }) => {
  const ms = useMs();
  const k = useK();
  const INK = COLORS.ink;
  const RED = COLORS.accent;
  const SUB = inkA(0.6);
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));

  const tKick = at(kicker, from, from);
  const tTrack = at(track, tKick + 1500, from, tKick + 300);
  const tA = at(segA, tTrack + 600, from, tTrack + 200);
  const tAEnd = at(segA.until, tA + 800, from, tA + 300);
  const tB = at(segB, tAEnd + 900, from, tAEnd + 300);
  const tBEnd = at(segB.until, tB + 800, from, tB + 300);
  const tTot = at(total, tBEnd + 1000, from, tBEnd + 300);
  const tTV = at(totalValue, tTot + 1500, from, tTot + 300);
  const tTVEnd = at(totalValue.until, tTV + 700, from, tTV + 300);
  const tEb = at(ebitda, tTVEnd + 600, from, tTVEnd + 200);
  const tEV = at(ebitdaValue, tEb + 1000, from, tEb + 300);
  const tEVEnd = at(ebitdaValue.until, tEV + 900, from, tEV + 300);
  const tTurn = at(turn, tEVEnd + 600, from, tEVEnd + 200);
  const tPrice = at(price, tTurn + 1200, from, tTurn + 500);
  const tMul = at(multiple, tPrice + 1000, from, tPrice + 400);
  const tMulEnd = at(multiple.until, tMul + 700, from, tMul + 300);
  const tML = at(multipleLabel, tMulEnd + 300, from, tMulEnd);

  const T = REV.track;
  const W = T.x1 - T.x0;
  const whole = totalValue.value;
  const wA = (W * segA.value) / whole;
  const wB = (W * segB.value) / whole;
  const wE = (W * ebitdaValue.value) / whole;

  const page1 = 1 - k(tTurn, 320);
  const trackQ = EASE_IO(k(tTrack, 500));
  const aQ = interpolate(ms, [tA, tAEnd], [0, 1], { ...CLAMP, easing: EASE });
  const bQ = interpolate(ms, [tB, tBEnd], [0, 1], { ...CLAMP, easing: EASE });
  const eQ = interpolate(ms, [tEV, tEVEnd], [0, 1], { ...CLAMP, easing: EASE });
  const ebOn = k(tEb, 200);
  const brQ = EASE_IO(k(tTot, 480));

  // page 2: the EBITDA bar travels to the first tile seat
  const Ti = REV.tile;
  const mv = EASE_IO(k(tTurn + 200, 620));
  const eb = {
    x: T.x0,
    y: lerp(REV.ebitda.top, Ti.top, mv),
    w: lerp(wE * Math.max(eQ, ebOn > 0 ? 0.001 : 0), Ti.w, mv),
    h: lerp(REV.ebitda.h, Ti.h, mv),
  };
  const spanW = Ti.w * multiple.value;
  const spanQ = EASE_IO(k(tPrice, 560));
  const mQ = interpolate(ms, [tMul, Math.max(tMul + 1, tMulEnd - 60)], [0, 1], { ...CLAMP, easing: EASE }); // same curve as the counted figure
  const filled = 1 + (multiple.value - 1) * mQ; // tiles on screen, including the first
  const nTiles = Math.ceil(multiple.value);

  if (ms < tKick - 60) return null;
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {/* ═════ page 1 — the revenue ═════ */}
      {page1 > 0 ? (
        <div style={{ opacity: page1 }}>
          <div style={{ position: "absolute", left: T.x0, top: REV.kicker.top, opacity: k(tKick, 220), ...label(SUB, 40) }}>{kicker.label}</div>

          {/* the total: a bracket over the whole track */}
          <div style={{ position: "absolute", left: T.x0, top: REV.total.top, display: "flex", alignItems: "baseline", gap: 24, opacity: k(tTot, 220) }}>
            <div style={label(SUB, 40)}>{total.label}</div>
            {ms >= tTV - 60 ? <div style={{ ...big(INK, 72), fontVariantNumeric: "tabular-nums", opacity: k(tTV - 60, 200) }}>about ${counted(ms, tTV, tTVEnd, whole)}M</div> : null}
          </div>
          <div style={{ position: "absolute", left: T.x0, top: T.top - 34, width: W * brQ, height: 4, background: INK }} />
          <div style={{ position: "absolute", left: T.x0, top: T.top - 34, width: 4, height: 20, background: INK, opacity: clamp01(brQ * 6) }} />
          <div style={{ position: "absolute", left: T.x1 - 4, top: T.top - 34, width: 4, height: 20, background: INK, opacity: clamp01((brQ - 0.9) * 10) }} />

          {/* the track and its two true-proportion slices */}
          <div style={{ position: "absolute", left: T.x0, top: T.top, width: W * trackQ, height: T.h, borderRadius: 14, background: COLORS.panel }} />
          <div style={{ position: "absolute", left: T.x0, top: T.top, width: wA * aQ, height: T.h, borderRadius: "14px 0 0 14px", background: INK }} />
          <div style={{ position: "absolute", left: T.x0 + wA, top: T.top, width: wB * bQ, height: T.h, background: inkA(0.42) }} />

          {[{ s: segA, t: tA, tEnd: tAEnd, x: T.x0 }, { s: segB, t: tB, tEnd: tBEnd, x: T.x0 + wA }].map(({ s, t, tEnd, x }, i) =>
            ms >= t - 60 ? (
              <div key={i} style={{ position: "absolute", left: x + (i ? 18 : 0), top: REV.segLabel.top, opacity: k(t - 60, 220) }}>
                <div style={label(SUB, 40)}>{s.name}</div>
                <div style={{ ...big(INK, 72), marginTop: 10, fontVariantNumeric: "tabular-nums" }}>${counted(ms, t, tEnd, s.value)}M</div>
              </div>
            ) : null
          )}

          {/* EBITDA's label + figure (its bar is drawn below, it survives the turn) */}
          <div style={{ position: "absolute", left: T.x0 + wE + 40, top: REV.ebitda.top - 6, opacity: ebOn }}>
            <div style={label(SUB, 40)}>{ebitda.label}</div>
            {ms >= tEV - 60 ? <div style={{ ...big(RED, 72), marginTop: 10, fontVariantNumeric: "tabular-nums" }}>about ${counted(ms, tEV, tEVEnd, ebitdaValue.value)}M</div> : null}
          </div>
        </div>
      ) : null}

      {/* ═════ the EBITDA bar → tile 1 ═════ */}
      {ebOn > 0 ? <div style={{ position: "absolute", left: eb.x, top: eb.y, width: eb.w, height: eb.h, borderRadius: 14 * (1 - mv) + 8 * mv, background: RED }} /> : null}

      {/* ═════ page 2 — the multiple ═════ */}
      {ms >= tTurn + 200 ? (
        <>
          <div style={{ position: "absolute", left: Ti.x0, top: Ti.top + Ti.h + 16, opacity: k(tTurn + 600, 240), ...label(SUB, 30) }}>EBITDA ${ebitdaValue.value}M</div>

          {/* the price, as an empty dashed span with a bracket */}
          {spanQ > 0 ? (
            <>
              <svg style={{ position: "absolute", left: Ti.x0, top: Ti.top }} width={spanW + 4} height={Ti.h + 4}>
                <rect x={2} y={2} width={spanW} height={Ti.h} rx={8} fill="none" stroke={inkA(0.45)} strokeWidth={4} strokeDasharray="16 12" style={{ clipPath: `inset(0 ${(1 - spanQ) * 100}% 0 0)` }} />
              </svg>
              <div style={{ position: "absolute", left: Ti.x0, top: REV.bracket.y, width: spanW * spanQ, height: 4, background: INK }} />
              <div style={{ position: "absolute", left: Ti.x0, top: REV.bracket.y, width: 4, height: 20, background: INK }} />
              <div style={{ position: "absolute", left: Ti.x0 + spanW - 4, top: REV.bracket.y, width: 4, height: 20, background: INK, opacity: clamp01((spanQ - 0.9) * 10) }} />
              <div style={{ position: "absolute", left: Ti.x0, width: spanW, top: REV.bracket.label, textAlign: "center", opacity: k(tPrice + 200, 240), ...big(INK, 60) }}>{price.label}</div>
            </>
          ) : null}

          {/* tiles 2..N fill the span, left to right, as the multiple is voiced */}
          {Array.from({ length: nTiles - 1 }, (_, j) => {
            const i = j + 1; // tile index (tile 0 is the travelled bar)
            const part = clamp01(filled - i); // 0..1 of this tile shown
            if (part <= 0) return null;
            const w = Ti.w * Math.min(part, multiple.value - i);
            return <div key={i} style={{ position: "absolute", left: Ti.x0 + Ti.w * i + 3, top: Ti.top, width: Math.max(0, w - 6), height: Ti.h, borderRadius: 8, background: RED }} />;
          })}

          {ms >= tMul - 60 ? (
            <div style={{ position: "absolute", left: 0, width: 1920, top: REV.multiple.top, display: "flex", alignItems: "baseline", justifyContent: "center", gap: 30 }}>
              <div style={{ ...label(SUB, 48), opacity: k(tMul - 60, 220) }}>roughly</div>
              <div style={{ ...big(INK, REV.multiple.size), fontVariantNumeric: "tabular-nums", opacity: k(tMul - 60, 200) }}>{counted(ms, tMul, tMulEnd, multiple.value, 1)}×</div>
              <div style={{ ...label(SUB, 48), opacity: k(tML, 220) }}>{multipleLabel.label}</div>
            </div>
          ) : null}
        </>
      ) : null}
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// TeamCount — exactly N reps, the named share stays solid (ink, footage behind)
// ══════════════════════════════════════════════════════════════════════════
export const CROWD = {
  lead: { top: 360, size: 64 },
  hero: { top: 450, size: 200 },
  field: { left: 220, top: 150, cols: 20, px: 38, py: 44, h: 36 },
  col: { left: 1100 },
};

export const TeamCount: React.FC<Win & {
  lead: { text: string } & Cued; // "The second thing it gets"
  hero: { text: string } & Cued; // "People." slams, then dissolves into the field
  crowd: { durMs: number } & Cued; // the field fills, rank by rank
  teamLabel: { label: string } & Cued;
  about: { label: string } & Cued;
  total: Fig; // counts as voiced
  roughly: { label: string } & Cued;
  part: Fig; // the named share: the rest dims as it counts
  partLabel: { label: string } & Cued;
}> = ({ from, to, lead, hero, crowd, teamLabel, about, total, roughly, part, partLabel }) => {
  const ms = useMs();
  const k = useK();
  const WH = COLORS.paper;
  const RED = COLORS.accent;
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));

  const tLead = at(lead, from, from);
  const tHero = at(hero, tLead + 1500, from, tLead + 300);
  const tCrowd = at(crowd, tHero + 700, from, tHero + 300);
  const tTL = at(teamLabel, tCrowd + 500, from, tCrowd + 200);
  const tAbout = at(about, tTL + 400, from, tTL + 150);
  const tTot = at(total, tAbout + 300, from, tAbout + 100);
  const tTotEnd = at(total.until, tTot + 900, from, tTot + 300);
  const tRough = at(roughly, tTotEnd + 400, from, tTotEnd + 100);
  const tPart = at(part, tRough + 500, from, tRough + 200);
  const tPartEnd = at(part.until, tPart + 600, from, tPart + 300);
  const tPL = at(partLabel, tPartEnd, from, tPart + 300);

  const F = CROWD.field;
  const N = total.value;
  const P = part.value;
  const leadOut = k(tCrowd, 360);
  const heroQ = k(tHero, 300);

  // reps appear in reading order across the voiced phrase; the ones past P dim as P counts
  const dimQ = interpolate(ms, [tPart, tPartEnd], [0, 1], { ...CLAMP, easing: EASE });

  if (ms < tLead - 60) return null;
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {/* ── the lead and the word (both retire into the field) ── */}
      {leadOut < 1 ? (
        <>
          <div style={{ position: "absolute", left: 0, width: 1920, top: CROWD.lead.top, textAlign: "center", opacity: k(tLead, 240) * (1 - leadOut), ...big(INK_SUB, CROWD.lead.size) }}>{lead.text}</div>
          <div style={{ position: "absolute", left: 0, width: 1920, top: CROWD.hero.top, textAlign: "center", opacity: clamp01(heroQ * 3) * (1 - leadOut), transform: `scale(${lerp(1.3, 1, EASE(heroQ)) * lerp(1, 0.4, EASE(leadOut))})`, ...big(WH, CROWD.hero.size) }}>{hero.text}</div>
        </>
      ) : null}

      {/* ── the field: exactly N reps ── */}
      {ms >= tCrowd - 40
        ? Array.from({ length: N }, (_, i) => {
            const c = i % F.cols;
            const r = Math.floor(i / F.cols);
            const q = EASE(k(tCrowd + (i / N) * crowd.durMs, 260));
            if (q <= 0) return null;
            const dim = i >= P ? lerp(1, 0.28, dimQ) : 1;
            return <Rep key={i} cx={F.left + c * F.px + F.h * 0.3} bottom={F.top + r * F.py + F.h} h={F.h} color={WH} opacity={q * dim} dy={(1 - q) * -16} />;
          })
        : null}

      {/* ── the figures ── */}
      <div style={{ position: "absolute", left: CROWD.col.left, top: 200, opacity: k(tTL, 220), ...label(INK_SUB, 40) }}>{teamLabel.label}</div>
      <div style={{ position: "absolute", left: CROWD.col.left, top: 268, display: "flex", alignItems: "baseline", gap: 22 }}>
        <div style={{ ...label(INK_SUB, 44), opacity: k(tAbout, 200) }}>{about.label}</div>
        {ms >= tTot - 60 ? <div style={{ ...big(WH, 170), fontVariantNumeric: "tabular-nums", opacity: k(tTot - 60, 200) }}>{counted(ms, tTot, tTotEnd, N)}</div> : null}
      </div>

      <div style={{ position: "absolute", left: CROWD.col.left, top: 540, display: "flex", alignItems: "baseline", gap: 22 }}>
        <div style={{ ...label(INK_SUB, 44), opacity: k(tRough, 200) }}>{roughly.label}</div>
        {ms >= tPart - 60 ? <div style={{ ...big(RED, 170), fontVariantNumeric: "tabular-nums", opacity: k(tPart - 60, 200) }}>{counted(ms, tPart, tPartEnd, P)}</div> : null}
      </div>
      <div style={{ position: "absolute", left: CROWD.col.left, top: 742, opacity: k(tPL, 220), ...label(WH, 44) }}>{partLabel.label}</div>
    </AbsoluteFill>
  );
};
