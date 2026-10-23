// ─────────────────────────────────────────────────────────────────────────
// KIT · equity — MONEY IN, NO RIGHTS OUT. Added on the AstraZeneca x Summit
// HORIZONTAL long-form, 2026-10-05 (16:9; absolute 1920x1080 coordinates, none
// is portrait-safe as written). One-mover rule: each cue gets ONE motion, and
// anything that has landed goes still.
//
// `NoRightsHook` (red, the hook): the figure slams as it is voiced and docks as
// the price paid. The buyer lands, a line REACHES for a "Rights" tag, a barrier
// slams down across its path on "not", the line pulls back dashed, and the drug
// draws behind the barrier with the tag tied to it.
//
// `EquitySwap` (ink, THE SPINE IS BORN): a dated node lands on a rail (RAIL is
// exported: later sections return to this node). Money rides one lane to an
// empty seat, new shares ride the other lane back, and the seat takes its name.
// The exchange RETIRES in a pause (only the rail stays); the drug's name slams, the antibody draws, its
// two targets tag the arms, and a territories bar draws with one segment that
// slides OUT of it.
//
// `TermSheet` (white card): a section title that docks into the header of a
// sheet which writes itself one row per spoken line (a counted share with a
// strip, a counted price, an absence, two checks). In a pause the sheet docks
// left; the hook's reach-and-barrier repeats on "does not buy" in front of the
// molecule; then the molecule travels into its owner's fence and each company
// keeps its own.
//
// ⚠️ THE FRAME BUDGET (Nel, 2026-10-05, flagged twice on the first cut): a settled
// frame holds ONE hero, at most TWO supports, and the spine. RETIRE, DON'T DOCK: a
// finished idea leaves the frame unless a later cue in the same scene acts on it.
// Docking it "for context" is how a frame fills up with furniture. A list is three
// rows a page (TERMS). A lead-in line retires when the thing it introduced has landed.
//
// Every onset is a spoken word with an optional ms pin, clamped monotonic
// (`at()` / `useK()` / `Cued` / `Win` come from ./elora).
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, Easing, interpolate, interpolateColors } from "remotion";
import { CLAMP, clamp01, COLORS, DISPLAY, inkA, INK_SUB, INK_SUB_ON_RED, TRACK, useMs } from "./core";
import { TYPE } from "../style";
import { FlowLine } from "./flowline";
import { at, lerp, useK, type Cued, type Win } from "./elora";
import { YGlyph } from "./pairing";

const EASE = Easing.out(Easing.cubic);
const EASE_IO = Easing.inOut(Easing.cubic);
const BACK = Easing.out(Easing.back(1.7));

const W = 1920;
const H = 1080;

const label = (color: string, size: number = TYPE.label): React.CSSProperties => ({
  fontFamily: DISPLAY, fontWeight: 700, fontSize: size, letterSpacing: TRACK.kicker, color, whiteSpace: "nowrap",
});
const big = (color: string, size: number): React.CSSProperties => ({
  fontFamily: DISPLAY, fontWeight: 700, fontSize: size, letterSpacing: TRACK.display, color, lineHeight: 1, whiteSpace: "nowrap",
});

// ══════════════════════════════════════════════════════════════════════════
// NoRightsHook — the hook (red world)
// ══════════════════════════════════════════════════════════════════════════
export const HOOK = {
  hero: { top: 310, size: 290 }, // the figure, centred on the frame
  dock: { top: 108, s: 0.36 }, // ...docked top-left as the price paid
  y: 500, // the centre line of the reach
  name: { left: 130, size: 104 },
  reach: { x0: 800, x1: 1100, back: 960 },
  wall: { x: 1128, w: 24, y0: 345, y1: 655 },
  tag: { cx: 1330, w: 210, h: 80 },
  drug: { cx: 1600, cy: 470 },
  lineTop: 770,
};

export const NoRightsHook: React.FC<Win & {
  figure: { label: string } & Cued; // "$2" slams
  unit: { label: string } & Cued; // "billion"
  rule: Cued; // the bar under the figure
  dock: Cued; // the figure docks (a pause)
  buyer: { name: string } & Cued;
  reach: Cued; // the line reaches for the rights
  block: Cued; // the barrier slams down
  back: Cued; // the line pulls back, dashed
  rights: { label: string } & Cued;
  drug: Cued; // the drug draws behind the barrier (the sentence names it)
  line: { text: string; emphasize?: string } & Cued;
}> = ({ from, to, figure, unit, rule, dock, buyer, reach, block, back, rights, drug, line }) => {
  const ms = useMs();
  const k = useK();
  const WH = COLORS.paper;
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));

  const tFig = at(figure, from, from);
  const tUnit = at(unit, tFig + 600, from, tFig + 250);
  const tRule = at(rule, tUnit + 500, from, tUnit + 250);
  const tDock = at(dock, tRule + 1000, from, tRule + 500);
  const tBuyer = at(buyer, tDock + 650, from, tDock + 500);
  const tReach = at(reach, tBuyer + 650, from, tBuyer + 300);
  const tBlock = at(block, tReach + 300, from, tReach + 200);
  const tBack = at(back, tBlock + 400, from, tBlock + 250);
  const tRights = at(rights, tBack + 200, from, tBack + 150);
  const tDrug = at(drug, tRights + 500, from, tRights + 250);
  const tLine = at(line, tBuyer - 260, from);

  const figO = k(tFig, 110);
  const figS = interpolate(ms, [tFig, tFig + 320], [1.3, 1], { ...CLAMP, easing: EASE });
  const unitO = k(tUnit, 140);
  const unitX = (1 - EASE(k(tUnit, 340))) * 50;
  const ruleQ = EASE_IO(k(tRule, 480));

  const dq = EASE_IO(k(tDock, 600));
  const gy = lerp(0, HOOK.dock.top - HOOK.hero.top, dq);
  const gs = lerp(1, HOOK.dock.s, dq);

  const buyerO = k(tBuyer, 140);
  const buyerX = (1 - EASE(k(tBuyer, 380))) * -60;
  const reachQ = EASE(k(tReach, Math.max(180, tBlock - 30 - tReach)));
  const wallQ = EASE(k(tBlock, 170));
  const backQ = EASE_IO(k(tBack, 300));
  const xEnd = lerp(lerp(HOOK.reach.x0, HOOK.reach.x1, reachQ), HOOK.reach.back, backQ);
  const tagQ = k(tRights, 300);
  const drugQ = k(tDrug, 360);

  const Wl = HOOK.wall;
  if (ms < tFig - 60) return null;
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {/* ── the figure: hero, then docked top-left ── */}
      <div style={{ position: "absolute", left: 130, top: HOOK.hero.top, width: W - 260, transformOrigin: "0 0", transform: `translateY(${gy}px) scale(${gs})`, display: "flex", justifyContent: "center" }}>
        <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "stretch" }}>
          <div style={{ display: "flex", alignItems: "baseline", gap: "0.2em", ...big(WH, HOOK.hero.size) }}>
            <span style={{ display: "inline-block", opacity: figO, transform: `scale(${figS})`, transformOrigin: "left bottom" }}>{figure.label}</span>
            <span style={{ display: "inline-block", opacity: unitO, transform: `translateX(${unitX}px)` }}>{unit.label}</span>
          </div>
          <div style={{ marginTop: 14, height: 18, borderRadius: 9, background: WH, transformOrigin: "left", transform: `scaleX(${ruleQ})` }} />
        </div>
      </div>

      {/* ── the reach ── */}
      {ms >= Math.min(tLine, tBuyer) - 20 ? (
        <>
          <div style={{ position: "absolute", left: HOOK.name.left, top: HOOK.y - HOOK.name.size / 2, opacity: buyerO, transform: `translateX(${buyerX}px)`, ...big(WH, HOOK.name.size) }}>{buyer.name}</div>
          <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
            {reachQ > 0 ? (
              <line x1={HOOK.reach.x0} y1={HOOK.y} x2={xEnd} y2={HOOK.y} stroke={WH} strokeWidth={12} strokeLinecap="round" strokeDasharray={backQ > 0.5 ? "4 26" : undefined} />
            ) : null}
            {wallQ > 0 ? <rect x={Wl.x} y={Wl.y0} width={Wl.w} height={(Wl.y1 - Wl.y0) * wallQ} rx={8} fill={WH} /> : null}
            {drugQ > 0 ? (
              <>
                <line x1={HOOK.tag.cx + HOOK.tag.w / 2} y1={HOOK.y} x2={lerp(HOOK.tag.cx + HOOK.tag.w / 2, HOOK.drug.cx - 14, EASE(drugQ))} y2={HOOK.y} stroke={WH} strokeWidth={6} strokeLinecap="round" />
                <g transform={`translate(${HOOK.drug.cx} ${HOOK.drug.cy}) scale(${lerp(0.86, 1, BACK(drugQ))})`} opacity={clamp01(drugQ * 3)}>
                  <YGlyph color={WH} tips={["square", "round"]} />
                </g>
              </>
            ) : null}
          </svg>
          {tagQ > 0 ? (
            <div style={{ position: "absolute", left: HOOK.tag.cx - HOOK.tag.w / 2, top: HOOK.y - HOOK.tag.h / 2, width: HOOK.tag.w, height: HOOK.tag.h, borderRadius: HOOK.tag.h / 2, background: WH,
              display: "flex", alignItems: "center", justifyContent: "center", opacity: clamp01(tagQ * 3), transform: `scale(${lerp(0.8, 1, BACK(tagQ))})`, ...big(COLORS.accent, 44) }}>
              {rights.label}
            </div>
          ) : null}
          <div style={{ position: "absolute", left: 130, width: W - 260, top: HOOK.lineTop }}>
            <FlowLine from={tLine} to={to} line={line.text} size={56} color={WH} restColor={INK_SUB_ON_RED} restWeight={700} emphasize={line.emphasize} empColor={WH} lineHeight={1.12} align="center" />
          </div>
        </>
      ) : null}
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// EquitySwap — the exchange, and the spine's first node (ink world)
// ══════════════════════════════════════════════════════════════════════════
/** The commitment rail. Born here with one dated node; later sections return to it. */
export const RAIL = { y: 150, x0: 130, x1: 1790, node: { x: 144, r: 14 }, label: { left: 176, top: 84, size: 44 } };

export const SWAP = {
  box: { left: 130, top: 300, w: 1660, h: 400 }, // the exchange as a hero (centre 960,500)
  lane: { x0: 640, x1: 1120, top: 130, bottom: 270 }, // relative to the box
  card: { left: 1160, top: 100, w: 500, h: 200 },
  token: { w: 250, h: 84, a: 765, b: 995 }, // token centres along a lane
  holdsTop: 300,
  name: { left: 130, top: 350, size: 190 },
  subTop: 572,
  glyph: { cx: 1540, cy: 470, s: 1.05 },
  tagTop: 232,
  bar: { x: 130, y: 760, h: 72, main: 1270, seg: 340, gap: 50 },
};

export const EquitySwap: React.FC<Win & {
  date: { label: string; word?: string; ms?: number; labelWord?: string };
  buyer: { name: string } & Cued;
  arrow: Cued; // the money lane draws to an empty seat
  figure: { label: string } & Cued; // the money starts across
  arrive: Cued; // ...and lands
  issue: Cued; // the return lane draws
  equity: { label: string } & Cued; // the new shares start back
  equityEnd: Cued;
  target: { name: string; sub?: string; word?: string; ms?: number; subWord?: string };
  dock: Cued; // the exchange RETIRES (a pause)
  holds: { text: string } & Cued;
  drug: { label: string } & Cued; // the name slams
  what: { label: string } & Cued; // what it is, as a short label under the name
  glyph: Cued;
  targets: [{ label: string } & Cued, { label: string } & Cued];
  bar: Cued; // the territories bar draws
  territories: { label: string } & Cued;
  outside: Cued; // one segment slides out of the bar
  excluded: { label: string } & Cued;
}> = ({ from, to, date, buyer, arrow, figure, arrive, issue, equity, equityEnd, target, dock, holds, drug, what, glyph, targets, bar, territories, outside, excluded }) => {
  const ms = useMs();
  const k = useK();
  const WH = COLORS.paper;
  const R = COLORS.accent;
  const INK = COLORS.ink;
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));

  const tDate = at(date, from, from);
  const tDateLabel = Math.max(tDate + 100, at({ word: date.labelWord }, tDate + 150, from));
  const tBuyer = at(buyer, tDateLabel + 1200, from, tDateLabel + 300);
  const tArrow = at(arrow, tBuyer + 700, from, tBuyer + 300);
  const tFig = at(figure, tArrow + 1000, from, tArrow + 400);
  const tArrive = at(arrive, tFig + 1200, from, tFig + 500);
  const tIssue = at(issue, tArrive + 150, from, tArrive + 100);
  const tEquity = at(equity, tIssue + 380, from, tIssue + 300);
  const tEquityEnd = at(equityEnd, tEquity + 900, from, tEquity + 500);
  const tTarget = at(target, tEquityEnd + 240, from, tEquityEnd + 150);
  const tSub = Math.max(tTarget + 300, at({ word: target.subWord }, tTarget + 640, from));
  const tDock = at(dock, tSub + 650, from, tSub + 400);
  const tHolds = at(holds, tDock + 550, from, tDock + 450);
  const tDrug = at(drug, tHolds + 2600, from, tHolds + 800);
  const tGlyph = at(glyph, tDrug + 750, from, tDrug + 400);
  const tWhat = at(what, tGlyph + 830, from, tGlyph + 300);
  const tA = at(targets[0], tWhat + 1200, from, tWhat + 400);
  const tB = at(targets[1], tA + 740, from, tA + 400);
  const tBar = at(bar, tB + 670, from, tB + 400);
  const tTerr = at(territories, tBar + 620, from, tBar + 350);
  const tOut = at(outside, tTerr + 1000, from, tTerr + 450);
  const tChina = at(excluded, tOut + 400, from, tOut + 300);

  // ── the rail and its first node
  const railQ = EASE_IO(k(tDate, 700));
  const nodeS = BACK(k(tDate, 320));
  const dateO = k(tDateLabel, 180);

  // ── the exchange
  const L = SWAP.lane;
  const T = SWAP.token;
  const C = SWAP.card;
  const buyerO = k(tBuyer, 140);
  const buyerX = (1 - EASE(k(tBuyer, 380))) * -60;
  const arrowQ = EASE_IO(k(tArrow, 520));
  const seatO = clamp01(arrowQ * 3 - 2);
  const rideA = EASE_IO(k(tFig, Math.max(500, tArrive - tFig)));
  const pillO = k(tFig, 140);
  const backQ = EASE_IO(k(tIssue, 360));
  const rideB = EASE_IO(k(tEquity, Math.max(500, tEquityEnd - tEquity)));
  const slipO = k(tEquity, 140);
  const fillQ = k(tTarget, 150);
  const nameS = interpolate(ms, [tTarget, tTarget + 300], [1.16, 1], { ...CLAMP, easing: EASE });
  const subO = k(tSub, 180);

  const B = SWAP.box;
  const swapO = 1 - k(tDock, 360); // retired, not docked

  // ── the drug
  const drugO = k(tDrug, 110);
  const drugS = interpolate(ms, [tDrug, tDrug + 300], [1.14, 1], { ...CLAMP, easing: EASE });
  const glyphQ = k(tGlyph, 420);
  const G = SWAP.glyph;
  const tips = [
    { x: G.cx - 160, q: k(tA, 280), label: targets[0].label },
    { x: G.cx + 160, q: k(tB, 280), label: targets[1].label },
  ];

  // ── the territories (the lead-in lines retire as the bar draws)
  const Br = SWAP.bar;
  const barQ = EASE_IO(k(tBar, 560));
  const drawn = (Br.main + Br.seg) * barQ;
  const outQ = EASE_IO(k(tOut, 420));
  const leadO = 1 - k(tBar - 150, 300);

  if (ms < tDate - 60) return null;
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {/* ── the rail: one dated node (the spine) ── */}
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <line x1={RAIL.x0} y1={RAIL.y} x2={lerp(RAIL.x0, RAIL.x1, railQ)} y2={RAIL.y} stroke="rgba(255,255,255,0.26)" strokeWidth={4} strokeLinecap="round" />
        <circle cx={RAIL.node.x} cy={RAIL.y} r={RAIL.node.r * nodeS} fill={R} />
      </svg>
      <div style={{ position: "absolute", left: RAIL.label.left, top: RAIL.label.top, opacity: dateO, transform: `translateY(${(1 - dateO) * 10}px)`, ...big(WH, RAIL.label.size) }}>{date.label}</div>

      {/* ── the exchange: hero, then docked ── */}
      {ms >= tBuyer - 20 && swapO > 0 ? (
        <div style={{ position: "absolute", left: B.left, top: B.top, width: B.w, height: B.h, opacity: swapO }}>
          <div style={{ position: "absolute", left: 0, top: 152, opacity: buyerO, transform: `translateX(${buyerX}px)`, ...big(WH, 96) }}>{buyer.name}</div>
          <svg width={B.w} height={B.h} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
            {/* money lane, left to right */}
            <path d={`M ${L.x0} ${L.top} H ${L.x1 - 8}`} stroke={WH} strokeWidth={8} strokeLinecap="round" fill="none" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - arrowQ} />
            <path d={`M ${L.x1 - 28} ${L.top - 20} L ${L.x1 - 2} ${L.top} L ${L.x1 - 28} ${L.top + 20}`} stroke={WH} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={clamp01(arrowQ * 4 - 3)} />
            {/* equity lane, right to left */}
            {backQ > 0 ? (
              <>
                <path d={`M ${L.x1} ${L.bottom} H ${L.x0 + 8}`} stroke={WH} strokeWidth={8} strokeLinecap="round" fill="none" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - backQ} />
                <path d={`M ${L.x0 + 28} ${L.bottom - 20} L ${L.x0 + 2} ${L.bottom} L ${L.x0 + 28} ${L.bottom + 20}`} stroke={WH} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={clamp01(backQ * 4 - 3)} />
              </>
            ) : null}
          </svg>
          {/* the seat that becomes the company */}
          <div style={{ position: "absolute", left: C.left, top: C.top, width: C.w, height: C.h, boxSizing: "border-box", borderRadius: 24, opacity: seatO,
            border: `5px solid ${interpolateColors(fillQ, [0, 1], ["rgba(255,255,255,0.55)", WH])}`, background: interpolateColors(fillQ, [0, 1], ["rgba(255,255,255,0)", WH]),
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
            <div style={{ opacity: fillQ, transform: `scale(${nameS})`, ...big(INK, 92) }}>{target.name}</div>
            {target.sub ? <div style={{ marginTop: 8, opacity: subO, ...label(inkA(0.55), 30) }}>{target.sub}</div> : null}
          </div>
          {/* the money */}
          {pillO > 0 ? (
            <div style={{ position: "absolute", left: lerp(T.a, T.b, rideA) - T.w / 2, top: L.top - 62 - T.h / 2, width: T.w, height: T.h, borderRadius: T.h / 2, background: WH, opacity: pillO,
              display: "flex", alignItems: "center", justifyContent: "center", ...big(INK, 46) }}>
              {figure.label}
            </div>
          ) : null}
          {/* the new shares */}
          {slipO > 0 ? (
            <div style={{ position: "absolute", left: lerp(T.b, T.a, rideB) - T.w / 2, top: L.bottom + 62 - T.h / 2, width: T.w, height: T.h, borderRadius: 16, boxSizing: "border-box", border: `5px solid ${WH}`, opacity: slipO,
              display: "flex", alignItems: "center", justifyContent: "center", ...big(WH, 40) }}>
              {equity.label}
            </div>
          ) : null}
        </div>
      ) : null}

      {/* ── what the company holds ── */}
      {ms >= tHolds - 20 ? (
        <>
          <div style={{ position: "absolute", left: 130, width: 1000, top: SWAP.holdsTop, opacity: leadO }}>
            <FlowLine from={tHolds} to={tDrug} line={holds.text} size={44} color={INK_SUB} lineHeight={1.1} />
          </div>
          <div style={{ position: "absolute", left: SWAP.name.left, top: SWAP.name.top, opacity: drugO, transform: `scale(${drugS})`, transformOrigin: "left center", ...big(WH, SWAP.name.size) }}>{drug.label}</div>
          <div style={{ position: "absolute", left: 134, top: SWAP.subTop, opacity: k(tWhat, 180) * leadO, ...label(INK_SUB, 44) }}>{what.label}</div>
          <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
            {glyphQ > 0 ? (
              <g transform={`translate(${G.cx} ${G.cy}) scale(${G.s * lerp(0.86, 1, BACK(glyphQ))})`} opacity={clamp01(glyphQ * 3)}>
                <YGlyph color={WH} tips={["square", "round"]} />
              </g>
            ) : null}
          </svg>
          {tips.map((t, i) =>
            t.q > 0 ? (
              <div key={i} style={{ position: "absolute", left: t.x - 75, top: SWAP.tagTop, width: 150, height: 60, borderRadius: 30, background: WH, opacity: clamp01(t.q * 3), transform: `translateY(${(1 - EASE(t.q)) * -18}px)`,
                display: "flex", alignItems: "center", justifyContent: "center", ...big(INK, 34) }}>
                {t.label}
              </div>
            ) : null
          )}

          {/* the territories: one bar, one segment that leaves it */}
          {barQ > 0 ? (
            <>
              <div style={{ position: "absolute", left: Br.x, top: Br.y, width: Math.min(Br.main, drawn), height: Br.h, borderRadius: 14, background: WH, overflow: "hidden", display: "flex", alignItems: "center" }}>
                <div style={{ marginLeft: 28, opacity: k(tTerr, 180), ...big(INK, 36) }}>{territories.label}</div>
              </div>
              {drawn > Br.main ? (
                <div style={{ position: "absolute", left: Br.x + Br.main + Br.gap * outQ, top: Br.y, width: drawn - Br.main, height: Br.h, borderRadius: 14, boxSizing: "border-box",
                  background: interpolateColors(outQ, [0, 1], [WH, "rgba(255,255,255,0)"]), border: `4px solid ${interpolateColors(outQ, [0, 1], [WH, "rgba(255,255,255,0.45)"])}`,
                  display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <div style={{ opacity: k(tChina, 180), ...big(INK_SUB, 36) }}>{excluded.label}</div>
                </div>
              ) : null}
            </>
          ) : null}
        </>
      ) : null}
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// TermSheet — what the money buys, and what it does not (white card)
// ══════════════════════════════════════════════════════════════════════════
export const TERMS = {
  x: 130, w: 1660,
  title: { top: 400, size: 96, dockTop: 92, s: 0.42 },
  rule: 164,
  // ⚠️ THREE ROWS A PAGE, never more. Six rows on one card (the first cut) read as clutter:
  // every row had its own size and its own mix of grey and black. One scale for every row
  // (label / value / sub), one mark column, and the sheet TURNS THE PAGE in a pause.
  rows: [200, 420, 640], // each row's top on its page; 200 tall
  row: { h: 200, label: 20, value: 58, size: 76, sub: 150, subSize: 32, mark: 96 },
  mark: { cx: 1750 }, // the right-hand mark of a row (check / none)
  strip: { x: 1330, w: 460, h: 24 },
  dock: { s: 0.6, dy: 100 }, // the sheet docked left: x 130-1126, y 184-638
  right: { left: 1200, width: 590 },
  reach: { y: 560, x0: 1140, x1: 1238 },
  wall: { x: 1250, w: 20, y0: 440, y1: 680 },
  tile: { left: 1400, top: 420, size: 280 },
  fences: [{ x: 130, w: 770 }, { x: 1020, w: 770 }], // y 250-700
  fenceY: { y0: 250, y1: 700 },
  seat: { left: 1265, top: 335 }, // the tile's seat inside the second fence
};

type RowCue = { label: string } & Cued;

export const TermSheet: React.FC<Win & {
  title: { text: string; emphasize?: string } & Cued;
  dock: Cued; // the title docks into the sheet's header (a pause)
  instrument: RowCue & { text: string }; // page 1, row 1
  share: RowCue & { lead: string; value: number; tail: string; leadWord?: string; figWord?: string; endWord?: string; tailWord?: string }; // row 2
  price: RowCue & { value: number; decimals: number; prefix: string; unit: string; figWord?: string; endWord?: string; unitWord?: string; note: string; noteEmphasize?: string; noteWord?: string }; // row 3
  turn: Cued; // the page turns (a pause)
  voting: RowCue & { text: string; textWord?: string; markWord?: string }; // page 2, row 1
  preempt: RowCue & { value: string; valueWord?: string; checkWord?: string }; // row 5
  proposal: RowCue & { text: string; textWord?: string; checkWord?: string }; // page 2, row 3
  park: Cued; // the sheet docks left (a pause)
  notBuy: { text: string; emphasize?: string } & Cued;
  reach: Cued;
  block: Cued;
  back: Cued;
  molecule: Cued; // the tile stamps
  clear: Cued; // the sheet retires, the tile travels (a pause)
  each: { names: [string, string]; text: string; emphasize?: string } & Cued;
  keeps: Cued; // the fences draw
  own: Cued; // the buyer's own medicines
}> = ({ from, to, title, dock, instrument, share, price, turn, voting, preempt, proposal, park, notBuy, reach, block, back, molecule, clear, each, keeps, own }) => {
  const ms = useMs();
  const k = useK();
  const INK = COLORS.ink;
  const R = COLORS.accent;
  const WH = COLORS.paper;
  const SUB = COLORS.grayText;
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));
  const c = (word: string | undefined, fb: number, min: number) => Math.max(min, at({ word }, fb, from));

  const tTitle = at(title, from, from);
  const tDock = at(dock, tTitle + 2000, from, tTitle + 900);
  const t1 = at(instrument, tDock + 500, from, tDock + 350);
  const t2 = at(share, t1 + 1800, from, t1 + 600);
  const t2Lead = c(share.leadWord, t2 + 1300, t2 + 200);
  const t2Fig = c(share.figWord, t2Lead + 500, t2Lead + 150);
  const t2End = c(share.endWord, t2Fig + 680, t2Fig + 300);
  const t2Tail = c(share.tailWord, t2End + 200, t2End);
  const t3 = at(price, t2Tail + 1700, from, t2Tail + 500);
  const t3Fig = c(price.figWord, t3 + 2500, t3 + 300);
  const t3End = c(price.endWord, t3Fig + 1100, t3Fig + 400);
  const t3Unit = c(price.unitWord, t3End + 70, t3End);
  const t3Note = c(price.noteWord, t3Unit + 900, t3Unit + 300);
  const tTurn = at(turn, t3Note + 3000, from, t3Note + 800);
  const t4 = at(voting, tTurn + 450, from, tTurn + 350);
  const t4Text = c(voting.textWord, t4 + 1500, t4 + 300);
  const t4None = c(voting.markWord, t4Text + 650, t4Text + 300);
  const t5 = at(preempt, t4None + 1000, from, t4None + 500);
  const t5Val = c(preempt.valueWord, t5 + 1400, t5 + 300);
  const t5Check = c(preempt.checkWord, t5Val + 550, t5Val + 250);
  const t6 = at(proposal, t5Check + 700, from, t5Check + 300);
  const t6Text = c(proposal.textWord, t6 + 700, t6 + 200);
  const t6Check = c(proposal.checkWord, t6Text + 1900, t6Text + 600);
  const tPark = at(park, t6Check + 1300, from, t6Check + 700);
  const tNot = at(notBuy, tPark + 1000, from, tPark + 600);
  const tReach = at(reach, tNot + 880, from, tNot + 300);
  const tBlock = at(block, tReach + 200, from, tReach + 150);
  const tBack = at(back, tBlock + 250, from, tBlock + 200);
  const tMol = at(molecule, tBack + 700, from, tBack + 300);
  const tClear = at(clear, tMol + 900, from, tMol + 600);
  const tEach = at(each, tClear + 490, from, tClear + 400);
  const tKeeps = at(keeps, tEach + 800, from, tEach + 300);
  const tOwn = at(own, tKeeps + 2400, from, tKeeps + 500);

  // ── title: hero, then the sheet's header
  const dq = EASE_IO(k(tDock, 560));
  const S = TERMS;
  const titleY = lerp(S.title.top, S.title.dockTop, dq);
  const titleS = lerp(1, S.title.s, dq);
  const ruleQ = EASE_IO(k(tDock + 200, 520));

  // ── the sheet docks left
  const pq = EASE_IO(k(tPark, 620));
  const sheetS = lerp(1, S.dock.s, pq);
  const sheetY = S.dock.dy * pq;
  const gone = k(tClear, 300);
  const sheetO = 1 - gone;
  const turnQ = EASE_IO(k(tTurn, 460));

  // ── counts
  const shareQ = EASE(k(t2Fig, t2End - t2Fig));
  const priceQ = EASE(k(t3Fig, t3End - t3Fig));
  const priceShown = (priceQ * price.value).toLocaleString("en-US", { minimumFractionDigits: price.decimals, maximumFractionDigits: price.decimals });

  // ── the reach that stops short of the molecule
  const reachQ = EASE(k(tReach, Math.max(160, tBlock - 20 - tReach)));
  const wallQ = EASE(k(tBlock, 170));
  const backQ = EASE_IO(k(tBack, 280));
  const xEnd = lerp(lerp(S.reach.x0, S.reach.x1, reachQ), S.reach.x0 + 40, backQ);
  const molQ = k(tMol, 320);
  const travel = EASE_IO(k(tClear, 480));
  const tileX = lerp(S.tile.left, S.seat.left, travel);
  const tileY = lerp(S.tile.top, S.seat.top, travel);

  // ── each keeps its own
  const headO = k(tEach, 180);
  const fenceQ = EASE_IO(k(tKeeps, 560));
  const ownQ = k(tOwn, 340);
  const F = S.fenceY;

  const Rw = S.row;
  const row = (i: number, t: number, kicker: string, children: React.ReactNode) => {
    const o = k(t, 180);
    if (o <= 0) return null;
    return (
      <div key={i} style={{ position: "absolute", left: S.x, top: S.rows[i], width: S.w, height: Rw.h }}>
        <div style={{ position: "absolute", left: 0, top: 0, width: S.w * EASE_IO(k(t, 420)), height: 2, background: inkA(0.16) }} />
        <div style={{ position: "absolute", left: 0, top: Rw.label, opacity: o, ...label(SUB, 28) }}>{kicker}</div>
        {children}
      </div>
    );
  };
  const value: React.CSSProperties = { position: "absolute", left: 0, top: Rw.value };
  const sub: React.CSSProperties = { position: "absolute", left: 0, top: Rw.sub, width: 1400 };
  const mark: React.CSSProperties = { position: "absolute", left: S.mark.cx - S.x - 40, top: Rw.mark - 40, overflow: "visible" };
  const check = (t: number) => {
    const q = EASE_IO(k(t, 300));
    return q > 0 ? (
      <svg width={80} height={80} style={mark}>
        <path d="M 12 42 L 32 62 L 68 18" fill="none" stroke={INK} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - q} />
      </svg>
    ) : null;
  };
  const noneQ = k(t4None, 260);

  if (ms < tTitle - 60) return null;
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {/* ══ the sheet (title + two pages of rows), which later docks left ══ */}
      {sheetO > 0 ? (
        <div style={{ position: "absolute", inset: 0, opacity: sheetO, transformOrigin: `${S.x}px 84px`, transform: `translateY(${sheetY}px) scale(${sheetS})` }}>
          <div style={{ position: "absolute", left: S.x, top: titleY, width: 1760, transformOrigin: "0 0", transform: `scale(${titleS})` }}>
            <FlowLine from={tTitle} to={tDock} line={title.text} size={S.title.size} color={INK} restColor={SUB} restWeight={700} emphasize={title.emphasize} empColor={INK} lineHeight={1.05} />
          </div>
          <div style={{ position: "absolute", left: S.x, top: S.rule, width: S.w * ruleQ, height: 6, borderRadius: 3, background: INK }} />

          {/* ── page 1: what it is, how much, at what price ── */}
          {turnQ < 1 ? (
            <div style={{ position: "absolute", inset: 0, opacity: 1 - turnQ, transform: `translateY(${-90 * turnQ}px)` }}>
              {row(0, t1, instrument.label, (
                <div style={{ ...value, width: 1500 }}>
                  <FlowLine from={t1} to={t2} line={instrument.text} size={Rw.size} color={INK} lineHeight={1} />
                </div>
              ))}

              {/* a count and a strip filling at the same scale */}
              {row(1, t2, share.label, (
                <>
                  <div style={{ ...value, display: "flex", alignItems: "baseline", gap: 20 }}>
                    <span style={{ opacity: k(t2Lead, 140), ...big(INK, Rw.size) }}>{share.lead}</span>
                    <span style={{ opacity: k(t2Fig - 40, 140), fontVariantNumeric: "tabular-nums", ...big(INK, Rw.size) }}>{Math.round(shareQ * share.value)}%</span>
                  </div>
                  <div style={{ ...sub, opacity: k(t2Tail, 180), ...label(SUB, Rw.subSize) }}>{share.tail}</div>
                  {k(t2Fig - 40, 140) > 0 ? (
                    <div style={{ position: "absolute", left: S.strip.x - S.x, top: Rw.mark - S.strip.h / 2, width: S.strip.w, height: S.strip.h, borderRadius: S.strip.h / 2, background: COLORS.panel, overflow: "hidden", opacity: k(t2Fig - 40, 140) }}>
                      <div style={{ width: S.strip.w * (share.value / 100) * shareQ, height: "100%", background: R }} />
                    </div>
                  ) : null}
                </>
              ))}

              {/* the price, and how the company describes it */}
              {row(2, t3, price.label, (
                <>
                  <div style={{ ...value, display: "flex", alignItems: "baseline", gap: 20 }}>
                    <span style={{ opacity: k(t3Fig - 40, 140), fontVariantNumeric: "tabular-nums", ...big(INK, Rw.size) }}>{price.prefix}{priceShown}</span>
                    <span style={{ opacity: k(t3Unit, 160), ...big(INK, Rw.size) }}>{price.unit}</span>
                  </div>
                  <div style={sub}>
                    <FlowLine from={t3Note} to={tTurn} line={price.note} size={Rw.subSize} color={SUB} lineHeight={1.1} />
                  </div>
                </>
              ))}
            </div>
          ) : null}

          {/* ── page 2: the rights ── */}
          {turnQ > 0 ? (
            <div style={{ position: "absolute", inset: 0, opacity: turnQ }}>
              {/* an absence */}
              {row(0, t4, voting.label, (
                <>
                  <div style={{ ...value, width: 1500 }}>
                    <FlowLine from={t4Text} to={t5} line={voting.text} size={Rw.size} color={INK} lineHeight={1} />
                  </div>
                  {noneQ > 0 ? (
                    <svg width={80} height={80} style={{ ...mark, opacity: clamp01(noneQ * 3) }}>
                      <circle cx={40} cy={40} r={32} fill="none" stroke={INK} strokeWidth={9} />
                      <line x1={17} y1={63} x2={lerp(17, 63, EASE(noneQ))} y2={lerp(63, 17, EASE(noneQ))} stroke={INK} strokeWidth={9} strokeLinecap="round" />
                    </svg>
                  ) : null}
                </>
              ))}

              {/* a right it does get */}
              {row(1, t5, preempt.label, (
                <>
                  <div style={{ ...value, opacity: k(t5Val, 150), transform: `translateY(${(1 - EASE(k(t5Val, 300))) * 14}px)`, ...big(INK, Rw.size) }}>{preempt.value}</div>
                  {check(t5Check)}
                </>
              ))}

              {/* and a conditional one */}
              {row(2, t6, proposal.label, (
                <>
                  <div style={{ ...value, width: 1500 }}>
                    <FlowLine from={t6Text} to={tPark} line={proposal.text} size={Rw.size} color={INK} lineHeight={1} />
                  </div>
                  {check(t6Check)}
                </>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}

      {/* ══ what it does not buy ══ */}
      {ms >= tNot - 20 ? (
        <>
          {gone < 1 ? (
            <div style={{ position: "absolute", inset: 0, opacity: 1 - gone }}>
              <div style={{ position: "absolute", left: S.right.left, width: S.right.width, top: 200 }}>
                <FlowLine from={tNot} to={tClear} line={notBuy.text} size={50} color={INK} restColor={SUB} restWeight={700} emphasize={notBuy.emphasize} empColor={INK} lineHeight={1.12} />
              </div>
              <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
                {reachQ > 0 ? <line x1={S.reach.x0} y1={S.reach.y} x2={xEnd} y2={S.reach.y} stroke={INK} strokeWidth={10} strokeLinecap="round" strokeDasharray={backQ > 0.5 ? "4 22" : undefined} /> : null}
                {wallQ > 0 ? <rect x={S.wall.x} y={S.wall.y0} width={S.wall.w} height={(S.wall.y1 - S.wall.y0) * wallQ} rx={7} fill={INK} /> : null}
              </svg>
            </div>
          ) : null}

          {/* the molecule: stamped behind the barrier, then carried to its owner */}
          {molQ > 0 ? (
            <div style={{ position: "absolute", left: tileX, top: tileY, width: S.tile.size, height: S.tile.size, borderRadius: 34, background: INK, opacity: clamp01(molQ * 3), transform: `scale(${lerp(1.18, 1, EASE(molQ))})` }}>
              <svg width={S.tile.size} height={S.tile.size} style={{ overflow: "visible" }}>
                <g transform={`translate(${S.tile.size / 2} ${S.tile.size / 2 + 4}) scale(0.72)`}>
                  <YGlyph color={WH} tips={["square", "round"]} />
                </g>
              </svg>
            </div>
          ) : null}
        </>
      ) : null}

      {/* ══ each company keeps its own ══ */}
      {ms >= tEach - 20 ? (
        <>
          {S.fences.map((f, i) => (
            <div key={i} style={{ position: "absolute", left: f.x, top: 140, opacity: headO, transform: `translateY(${(1 - EASE(k(tEach, 320))) * 16}px)`, ...big(INK, 76) }}>{each.names[i]}</div>
          ))}
          <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
            {fenceQ > 0
              ? S.fences.map((f, i) => (
                  <rect key={i} x={f.x} y={F.y0} width={f.w} height={F.y1 - F.y0} rx={30} fill="none" stroke={INK} strokeWidth={7} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - fenceQ} />
                ))
              : null}
            {ownQ > 0
              ? [300, 515, 730].map((x, i) => (
                  <g key={i} transform={`translate(${x} ${475 + (1 - EASE(ownQ)) * 26}) scale(0.62)`} opacity={clamp01(ownQ * 3)}>
                    <YGlyph color={INK} tips={["chevron", "chevron"]} payload={1} payloadColor={INK} />
                  </g>
                ))
              : null}
          </svg>
          <div style={{ position: "absolute", left: 130, width: W - 260, top: 760 }}>
            <FlowLine from={tEach} to={to} line={each.text} size={48} color={INK} restColor={SUB} restWeight={700} emphasize={each.emphasize} empColor={INK} lineHeight={1.12} align="center" />
          </div>
        </>
      ) : null}
    </AbsoluteFill>
  );
};
