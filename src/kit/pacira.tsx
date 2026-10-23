// ─────────────────────────────────────────────────────────────────────────
// KIT · pacira — TWO DRUGS AND THE TEAM THAT SELLS THEM. Added on the Viatris x
// Pacira HORIZONTAL long-form, 2026-10-14 (16:9; absolute 1920x1080 coordinates,
// not portrait-safe as written). One-mover rule and the frame budget: each cue
// gets ONE motion, a finished idea retires.
//
// `Rep` — THE SPINE's glyph: one sales rep (head + shoulders). A row of them is
//   "the team"; later sections bring the same row back carrying the drugs.
// `Pill` — the two-tone capsule at any size and surface.
// `PainHook` (red, the hook): the price counts as voiced and stamps "billion";
//   it docks up in a pause; two capsules drop in for "two pain drugs"; the team
//   marches in from the right; on "sells them" the team walks in UNDER the drugs
//   and carries them (the relationship enacted, one travel).
// `TenderDeal` (white card): a day leaf, buyer, an arrow that draws on "agreed",
//   the target card, a per-share price that counts as voiced and a cash stamp;
//   the terms retire in a pause and the hook's figure lands again as the equity
//   value (a callback: it slams, it does not re-count).
//
// Every onset is a spoken word with an optional ms pin, clamped monotonic
// (`at()` / `useK()` / `Cued` / `Win` come from ./elora).
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { CLAMP, clamp01, COLORS, DISPLAY, INK_SUB, inkA, INK_SUB_ON_RED, TRACK, useMs } from "./core";
import { TYPE } from "../style";
import { at, lerp, useK, type Cued, type Win } from "./elora";
import { DayLeaf } from "./unity";

const EASE = Easing.out(Easing.cubic);
const EASE_IO = Easing.inOut(Easing.cubic);
const BACK = Easing.out(Easing.back(1.7));

const label = (color: string, size: number = TYPE.label): React.CSSProperties => ({
  fontFamily: DISPLAY, fontWeight: 700, fontSize: size, letterSpacing: TRACK.kicker, color, whiteSpace: "nowrap",
});
const big = (color: string, size: number): React.CSSProperties => ({
  fontFamily: DISPLAY, fontWeight: 700, fontSize: size, letterSpacing: TRACK.display, color, lineHeight: 1, whiteSpace: "nowrap",
});
/** stamp: lands from `from` scale to 1 with a fade, on progress q */
const stamp = (q: number, from = 1.35) => ({ opacity: clamp01(q * 3), transform: `scale(${lerp(from, 1, EASE(q))})` });

// ══════════════════════════════════════════════════════════════════════════
// Glyphs
// ══════════════════════════════════════════════════════════════════════════
/** One sales rep, centred on (cx, bottom). `h` = glyph height; width is 0.6h. */
export const Rep: React.FC<{ cx: number; bottom: number; h: number; color: string; opacity?: number; dy?: number }> = ({ cx, bottom, h, color, opacity = 1, dy = 0 }) => {
  const w = h * 0.6;
  return (
    <svg style={{ position: "absolute", left: cx - w / 2, top: bottom - h + dy, opacity }} width={w} height={h} viewBox="0 0 60 100">
      <circle cx={30} cy={19} r={15} fill={color} />
      <path d="M4 100 V66 Q4 40 30 40 Q56 40 56 66 V100 Z" fill={color} />
    </svg>
  );
};

/** A two-tone capsule centred on (cx, cy). `fill` = the solid half, `back` = the open half. */
export const Pill: React.FC<{ cx: number; cy: number; w: number; color: string; back: string; rot?: number; opacity?: number; dashed?: boolean }> = ({ cx, cy, w, color, back, rot = 0, opacity = 1, dashed }) => {
  const h = w * 0.45;
  const sw = Math.max(4, w * 0.035);
  return (
    <svg style={{ position: "absolute", left: cx - w / 2 - sw, top: cy - h / 2 - sw, opacity, transform: `rotate(${rot}deg)` }} width={w + sw * 2} height={h + sw * 2}>
      <g transform={`translate(${w / 2 + sw} ${h / 2 + sw})`}>
        <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 2} fill={dashed ? "none" : back} stroke={color} strokeWidth={sw} strokeDasharray={dashed ? `${w * 0.09} ${w * 0.06}` : undefined} />
        {dashed ? null : <path d={`M 0 ${-h / 2} H ${-w / 2 + h / 2} A ${h / 2} ${h / 2} 0 0 0 ${-w / 2 + h / 2} ${h / 2} H 0 Z`} fill={color} />}
      </g>
    </svg>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// PainHook — the hook (red world)
// ══════════════════════════════════════════════════════════════════════════
export const HOOK = {
  fig: { top: 230, size: 320, unitSize: 120, gap: 22 }, // the price as a hero
  dock: { dy: -150, s: 0.45 }, // ...docked: top ~80, ~212 tall
  pills: { y: 470, xs: [850, 1070] as const, w: 190, rot: [-8, 8] as const, carryDy: 150 },
  drugsLabel: { top: 548 },
  team: { n: 7, h: 200, gap: 24, bottom: 900, parkCx: 1380, cx: 960 },
  teamLabel: { top: 912 },
};
export const teamXs = (cx: number, n = HOOK.team.n, h = HOOK.team.h, gap = HOOK.team.gap) => {
  const w = h * 0.6;
  const row = n * w + (n - 1) * gap;
  return Array.from({ length: n }, (_, i) => cx - row / 2 + w / 2 + i * (w + gap));
};

export const PainHook: React.FC<Win & {
  figure: { value: number; decimals: number; prefix: string } & Cued; // counts as voiced
  unit: { label: string } & Cued; // "billion" stamps, the count ends
  dock: Cued; // a pause: the price docks up
  drugA: Cued; // capsule one drops
  drugB: Cued; // capsule two drops
  drugs: { label: string } & Cued; // "Two pain drugs"
  team: Cued; // the team marches in from the right
  teamLabel: { label: string } & Cued;
  sells: Cued; // the team walks under the drugs and carries them
}> = ({ from, to, figure, unit, dock, drugA, drugB, drugs, team, teamLabel, sells }) => {
  const ms = useMs();
  const k = useK();
  const WH = COLORS.paper;
  const RED = COLORS.accent;
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));

  const tFig = at(figure, from, from);
  const tUnit = at(unit, tFig + 2000, from, tFig + 600);
  const tDock = at(dock, tUnit + 700, from, tUnit + 400);
  const tA = at(drugA, tDock + 900, from, tDock + 300);
  const tB = at(drugB, tA + 260, from, tA + 180);
  const tDrugs = at(drugs, tB + 330, from, tB + 200);
  const tTeam = at(team, tDrugs + 800, from, tDrugs + 300);
  const tTeamL = at(teamLabel, tTeam + 330, from, tTeam + 200);
  const tSells = at(sells, tTeamL + 500, from, tTeamL + 300);

  const F = HOOK.fig;
  const D = HOOK.dock;
  const P = HOOK.pills;
  const T = HOOK.team;

  // the price: counts across its own voicing, then "billion" stamps
  const cq = interpolate(ms, [tFig, tUnit - 80], [0, 1], { ...CLAMP, easing: EASE });
  const shown = (figure.value * cq).toLocaleString("en-US", { minimumFractionDigits: figure.decimals, maximumFractionDigits: figure.decimals });
  const figO = k(tFig - 60, 200);
  const unitQ = k(tUnit, 260);
  const dq = EASE_IO(k(tDock, 520));

  // the team: each rep slides in from off-frame right, staggered; then the row walks left under the drugs
  const walk = EASE_IO(k(tSells, 460));
  const rowCx = lerp(T.parkCx, T.cx, walk);
  const xs = teamXs(rowCx);
  const carry = EASE(k(tSells + 300, 260)); // the drugs settle onto the team as it arrives
  const drugsLabelO = k(tDrugs, 220) * (1 - k(tSells, 240));

  if (ms < tFig - 80) return null;
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {/* ── the price, then docked ── */}
      <div style={{ position: "absolute", left: 0, width: 1920, top: F.top, transformOrigin: "50% 0%", transform: `translateY(${D.dy * dq}px) scale(${lerp(1, D.s, dq)})`, display: "flex", flexDirection: "column", alignItems: "center", gap: F.gap }}>
        <div style={{ ...big(WH, F.size), fontVariantNumeric: "tabular-nums", opacity: figO }}>{figure.prefix}{shown}</div>
        <div style={{ ...big(WH, F.unitSize), ...stamp(unitQ, 1.4) }}>{unit.label}</div>
      </div>

      {/* ── two pain drugs ── */}
      {[tA, tB].map((t, i) => {
        const q = k(t, 380);
        if (q <= 0) return null;
        return <Pill key={i} cx={P.xs[i]} cy={P.y - (1 - BACK(q)) * 90 + P.carryDy * carry} w={P.w} color={WH} back={RED} rot={P.rot[i]} opacity={clamp01(q * 4)} />;
      })}
      <div style={{ position: "absolute", left: 0, width: 1920, top: HOOK.drugsLabel.top, textAlign: "center", opacity: drugsLabelO, ...label(INK_SUB_ON_RED, 40) }}>{drugs.label}</div>

      {/* ── the sales team ── */}
      {xs.map((x, i) => {
        // the rightmost rep arrives first: they walk in from the right edge
        const q = EASE(k(tTeam + (T.n - 1 - i) * 55, 420));
        if (q <= 0) return null;
        return <Rep key={i} cx={x + (1 - q) * 700} bottom={T.bottom} h={T.h} color={WH} opacity={clamp01(q * 3)} />;
      })}
      <div style={{ position: "absolute", left: rowCx - 400, width: 800, top: HOOK.teamLabel.top, textAlign: "center", opacity: k(tTeamL, 220), ...label(INK_SUB_ON_RED, 30) }}>{teamLabel.label}</div>
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// TenderDeal — the terms (white card)
// ══════════════════════════════════════════════════════════════════════════
export const TENDER = {
  leaf: { x: 120, y: 88, w: 150, h: 164 },
  rowY: 402, // the deal row's centre line
  buyer: { left: 120, size: 124 },
  arrow: { x0: 680, x1: 1060, label: 330 },
  target: { left: 1110, top: 290, w: 650, h: 224, name: 104, sub: 44 },
  terms: { top: 590, size: 140 },
  equity: { label: 612, top: 672, size: 180 },
};

export const TenderDeal: React.FC<Win & {
  date: { month: string; day: string } & Cued;
  buyer: { name: string } & Cued;
  arrow: Cued; // draws on "agreed"
  arrowLabel: { label: string } & Cued;
  target: { name: string } & Cued; // the target card drops
  targetSub: { label: string } & Cued;
  price: { value: number; decimals: number; prefix: string; until: Cued } & Cued; // counts as voiced
  perShare: { label: string } & Cued;
  cash: { label: string } & Cued; // the stamp
  clear: Cued; // a pause: leaf, label and terms retire
  equity: { label: string } & Cued;
  value: { text: string } & Cued; // the hook's figure slams back
  unit: { label: string } & Cued;
}> = ({ from, to, date, buyer, arrow, arrowLabel, target, targetSub, price, perShare, cash, clear, equity, value, unit }) => {
  const ms = useMs();
  const k = useK();
  const INK = COLORS.ink;
  const RED = COLORS.accent;
  const SUB = inkA(0.6);
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));

  const tDate = at(date, from, from);
  const tBuyer = at(buyer, tDate + 1200, from, tDate + 400);
  const tArrow = at(arrow, tBuyer + 500, from, tBuyer + 300);
  const tArrowL = at(arrowLabel, tArrow + 600, from, tArrow + 300);
  const tTarget = at(target, tArrowL + 500, from, tArrow + 500);
  const tSub = at(targetSub, tTarget + 500, from, tTarget + 250);
  const tPrice = at(price, tSub + 900, from, tSub + 300);
  const tPriceEnd = at(price.until, tPrice + 1200, from, tPrice + 500);
  const tPer = at(perShare, tPriceEnd, from, tPrice + 500);
  const tCash = at(cash, tPer + 600, from, tPer + 250);
  const tClear = at(clear, tCash + 600, from, tCash + 300);
  const tEq = at(equity, tClear + 1200, from, tClear + 400);
  const tVal = at(value, tEq + 1300, from, tEq + 400);
  const tUnit = at(unit, tVal + 1200, from, tVal + 300);

  const L = TENDER.leaf;
  const B = TENDER.buyer;
  const A = TENDER.arrow;
  const G = TENDER.target;
  const Tm = TENDER.terms;
  const E = TENDER.equity;
  const y = TENDER.rowY;

  const out = 1 - k(tClear, 320); // what retires in the pause
  const aq = EASE_IO(k(tArrow, 640));
  const headX = lerp(A.x0, A.x1, aq);
  const gq = k(tTarget, 420);
  const pq = interpolate(ms, [tPrice, tPriceEnd - 60], [0, 1], { ...CLAMP, easing: EASE });
  const shown = (price.value * pq).toLocaleString("en-US", { minimumFractionDigits: price.decimals, maximumFractionDigits: price.decimals });

  if (ms < tDate - 60) return null;
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {/* ── the date ── */}
      <div style={{ opacity: out }}>
        <DayLeaf rect={L} k={k(tDate, 520)} month={date.month} day={date.day} />
      </div>

      {/* ── the deal row ── */}
      <div style={{ position: "absolute", left: B.left, top: y - B.size / 2, opacity: k(tBuyer, 160), transform: `translateX(${(1 - EASE(k(tBuyer, 380))) * -60}px)`, ...big(INK, B.size) }}>{buyer.name}</div>

      {aq > 0 ? (
        <svg style={{ position: "absolute", left: 0, top: 0 }} width={1920} height={1080}>
          <line x1={A.x0} y1={y} x2={headX - 6} y2={y} stroke={INK} strokeWidth={8} strokeLinecap="round" />
          <path d={`M ${headX - 30} ${y - 22} L ${headX} ${y} L ${headX - 30} ${y + 22}`} fill="none" stroke={INK} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" opacity={clamp01(aq * 5)} />
        </svg>
      ) : null}
      <div style={{ position: "absolute", left: A.x0, width: A.x1 - A.x0, top: A.label, textAlign: "center", opacity: k(tArrowL, 200) * out, ...label(SUB, 30) }}>{arrowLabel.label}</div>

      {gq > 0 ? (
        <div style={{ position: "absolute", left: G.left, top: G.top - (1 - BACK(gq)) * 60, width: G.w, height: G.h, borderRadius: 28, background: INK, opacity: clamp01(gq * 4) }}>
          <div style={{ position: "absolute", left: 48, top: 38, ...big(COLORS.paper, G.name) }}>{target.name}</div>
          <div style={{ position: "absolute", left: 50, top: 154, opacity: k(tSub, 200), ...big(INK_SUB, G.sub) }}>{targetSub.label}</div>
        </div>
      ) : null}

      {/* ── the terms: per share, in cash (retire in the pause) ── */}
      {ms >= tPrice - 80 && out > 0 ? (
        <div style={{ position: "absolute", left: 0, width: 1920, top: Tm.top, display: "flex", alignItems: "center", justifyContent: "center", gap: 36, opacity: out }}>
          <div style={{ ...big(INK, Tm.size), fontVariantNumeric: "tabular-nums", opacity: k(tPrice - 60, 200) }}>{price.prefix}{shown}</div>
          <div style={{ ...big(SUB, 48), opacity: k(tPer, 200) }}>{perShare.label}</div>
          <div style={{ padding: "14px 30px", borderRadius: 40, background: INK, ...label(COLORS.paper, 40), ...stamp(k(tCash, 260), 1.6) }}>{cash.label}</div>
        </div>
      ) : null}

      {/* ── the equity value: the hook's figure, landed again ── */}
      <div style={{ position: "absolute", left: 0, width: 1920, top: E.label, textAlign: "center", opacity: k(tEq, 220), ...label(SUB, 40) }}>{equity.label}</div>
      {ms >= tVal - 40 ? (
        <div style={{ position: "absolute", left: 0, width: 1920, top: E.top, display: "flex", justifyContent: "center", gap: 40 }}>
          <div style={{ ...big(RED, E.size), ...stamp(k(tVal, 300), 1.5) }}>{value.text}</div>
          <div style={{ ...big(RED, E.size), opacity: k(tUnit, 220), transform: `translateX(${(1 - EASE(k(tUnit, 320))) * 30}px)` }}>{unit.label}</div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
