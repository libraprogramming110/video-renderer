// ─────────────────────────────────────────────────────────────────────────
// KIT · tower — A BILLION-DOLLAR HEADLINE STANDING ON A FLASK. Added on the
// Roche × Rona reel, 2026-10-15 (VERTICAL 9:16). Built under the one-mover
// rule (09-30) and the frame budget (10-05): each cue gets ONE motion,
// anything landed goes still, a finished idea retires.
//
// THE SPINE is the DEAL TOWER (`TOWER` seats, `Tower`): a solid red base (the
// $100M actually paid) under a DASHED column at true scale (the milestones:
// dashed = not yet paid), standing on a lab flask (the candidate). Born in §1,
// planted on "metabolism" in §3, filed into the end card.
//
// `UpfrontHook` (red): "$100 million. Upfront." The figure counts as voiced,
// the unit lands under it, an "Upfront" stamp slams.
//
// `NotTracked` (ink, over a FootageScrim): "That's what Roche just paid Rona
// Therapeutics… a Chinese biotech most investors haven't tracked… for an
// obesity drug that has never been in a human." Price plate, buyer, the plate
// rides down to the target's card; the deal retires and the card takes the
// frame; a tag; four dashed reticle corners close in and STOP SHORT (never
// lock). The card shrinks to a header chip; a development rail draws up from
// "Lab"; a flask drops onto it; a red dashed arrow reaches for "First in
// human" and stops short.
//
// `DealTower` (white card): "The total deal: $1.16 billion. Milestones.
// Tiered royalties on global net sales. For an RNA candidate still in the
// lab." The base stamps; the dashed column rises while the figure counts;
// labels; three dashed royalty steps (no rates: the script gives none); they
// retire; the flask draws in under the tower, which was floating until now.
//
// Every onset is a spoken word with an optional ms pin, clamped monotonic.
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { CLAMP, clamp01, COLORS, DISPLAY, INK_SUB, inkA, TRACK, useMs } from "./core";
import { TYPE } from "../style";
import { at, lerp, Phrase, useK, type Cued, type Win } from "./elora";

const EASE = Easing.out(Easing.cubic);
const EASE_IO = Easing.inOut(Easing.cubic);
const BACK = Easing.out(Easing.back(1.6));

type Rect = { x: number; y: number; w: number; h: number };
const mix = (a: Rect, b: Rect, t: number): Rect => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), w: lerp(a.w, b.w, t), h: lerp(a.h, b.h, t) });

// ══════════════════════════════════════════════════════════════════════════
// Shared glyphs
// ══════════════════════════════════════════════════════════════════════════

/** An Erlenmeyer flask, the candidate. `draw` 0→1 strokes the outline in; the
 *  red liquid fills once the outline is ~done. Drawn in a 100×120 box. */
export const Flask: React.FC<{ x: number; y: number; w: number; stroke: string; liquid?: string; draw?: number; opacity?: number }> = ({ x, y, w, stroke, liquid = COLORS.accent, draw = 1, opacity = 1 }) => {
  const h = w * 1.2;
  const fill = clamp01((draw - 0.7) / 0.3);
  return (
    <svg width={w} height={h} viewBox="-4 -4 108 128" style={{ position: "absolute", left: x, top: y, opacity, overflow: "visible" }}>
      <defs>
        <clipPath id="flask-body">
          <path d="M38 0 H62 V42 L96 108 Q99 118 88 118 H12 Q1 118 4 108 L38 42 Z" />
        </clipPath>
      </defs>
      <rect x={-4} y={lerp(124, 74, fill)} width={108} height={60} fill={liquid} clipPath="url(#flask-body)" />
      <path d="M38 0 H62 V42 L96 108 Q99 118 88 118 H12 Q1 118 4 108 L38 42 Z" fill="none" stroke={stroke} strokeWidth={6}
        strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - clamp01(draw / 0.7)} />
      <path d="M30 0 H70" fill="none" stroke={stroke} strokeWidth={6} strokeLinecap="round" opacity={clamp01((draw - 0.6) / 0.2)} />
    </svg>
  );
};

/** A dashed outline box (dashed = not yet / never measured, the 08-22 vocabulary). */
export const DashBox: React.FC<{ r: Rect; color: string; fill?: string; dash?: string; sw?: number; radius?: number; opacity?: number }> = ({ r, color, fill = "none", dash = "18 12", sw = 5, radius = 0, opacity = 1 }) => (
  <svg width={r.w + sw} height={r.h + sw} style={{ position: "absolute", left: r.x - sw / 2, top: r.y - sw / 2, opacity, overflow: "visible" }}>
    <rect x={sw / 2} y={sw / 2} width={Math.max(0, r.w)} height={Math.max(0, r.h)} rx={radius} fill={fill} stroke={color} strokeWidth={sw} strokeDasharray={dash} />
  </svg>
);

// ══════════════════════════════════════════════════════════════════════════
// UpfrontHook — the hook (red world)
// ══════════════════════════════════════════════════════════════════════════
export const UpfrontHook: React.FC<Win & {
  figure: { value: number; prefix: string } & Cued; // counts while voiced
  unit: { label: string } & Cued;
  stamp: { label: string } & Cued;
}> = ({ from, to, figure, unit, stamp }) => {
  const ms = useMs();
  const k = useK();
  const W = COLORS.paper;

  const tFig = at(figure, from, from);
  const tUnit = at(unit, tFig + 1200, from, tFig + 300);
  const tStamp = at(stamp, tUnit + 1000, from, tUnit + 300);
  if (ms < tFig - 40 || ms > to) return null;

  const countK = EASE(k(tFig, Math.max(400, tUnit - tFig - 80)));
  const v = Math.round(figure.value * countK);
  const figS = interpolate(ms, [tFig, tFig + 300], [1.14, 1], { ...CLAMP, easing: EASE });
  const unitK = EASE(k(tUnit, 280));
  const stK = k(tStamp, 260);

  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 470, textAlign: "center", fontFamily: DISPLAY, fontWeight: 700, color: W, letterSpacing: TRACK.display, lineHeight: 0.9 }}>
        <div style={{ fontSize: 380, opacity: k(tFig, 120), transform: `scale(${figS})`, fontVariantNumeric: "tabular-nums" }}>{figure.prefix}{v}</div>
        <div style={{ fontSize: 170, opacity: unitK, transform: `translateY(${(1 - unitK) * 40}px)` }}>{unit.label}</div>
      </div>
      {stK > 0 ? (
        <div style={{ position: "absolute", left: 540 - 300, top: 1130, width: 600, height: 170, borderRadius: 24, background: W,
          opacity: clamp01(stK * 3), transform: `rotate(-5deg) scale(${lerp(1.6, 1, EASE(stK))})`,
          display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: 110, letterSpacing: TRACK.headline, color: COLORS.accent }}>
          {stamp.label}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// NotTracked — who paid whom, a company nobody watched, a drug never dosed (ink)
// ══════════════════════════════════════════════════════════════════════════
export const NT = {
  buyer: { x: 320, y: 220, w: 440, h: 116 },
  plate: { w: 400, h: 116, y0: 470, y1: 800 }, // centre y before / after it is paid
  deal: { x: 140, y: 860, w: 800, h: 330 }, // the target's card under the price
  hero: { x: 110, y: 470, w: 860, h: 430 }, // the card alone
  chip: { x: 330, y: 180, w: 420, h: 116 }, // the header chip over the rail
  rail: { x: 250, lab: 1250, top: 400, flask: 90 }, // 283px a stage: room for the arrow to visibly stop short
  lineTop: 1330,
};

const CompanyCard: React.FC<{ rect: Rect; name: string; sub: string; tag?: string; tagK?: number; opacity?: number; scale?: number }> = ({ rect, name, sub, tag, tagK = 0, opacity = 1, scale = 1 }) => {
  const s = rect.w / NT.hero.w; // laid out in the hero seat's space, scaled with the rect
  const subO = clamp01((rect.h / s - 250) / 100); // the sub line folds away at chip size (237), full at the deal seat (355)
  return (
    <div style={{ position: "absolute", left: rect.x, top: rect.y, width: rect.w, height: rect.h, opacity, transform: `scale(${scale})`, background: COLORS.paper, borderRadius: 30 * Math.max(0.6, s) }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: NT.hero.w, height: rect.h / s, transform: `scale(${s})`, transformOrigin: "0 0",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontWeight: 700, color: COLORS.ink }}>
        <div style={{ fontSize: 150, letterSpacing: TRACK.display, lineHeight: 1 }}>{name}</div>
        <div style={{ fontSize: 58, fontWeight: 400, letterSpacing: TRACK.body, lineHeight: 1.2, opacity: subO, height: 70 * subO, overflow: "hidden" }}>{sub}</div>
        {tag && tagK > 0 ? (
          <div style={{ marginTop: 26, padding: "10px 30px", borderRadius: 40, background: COLORS.accent, color: COLORS.paper, fontSize: 50, letterSpacing: TRACK.body,
            opacity: clamp01(tagK * 3) * subO, transform: `scale(${lerp(1.3, 1, EASE(tagK))})` }}>{tag}</div>
        ) : null}
      </div>
    </div>
  );
};

/** Four corner brackets closing on a rect, stopping `gap` short of it. */
const Reticle: React.FC<{ rect: Rect; k: number; gap: number; color: string; opacity?: number }> = ({ rect, k, gap, color, opacity = 1 }) => {
  const off = lerp(170, gap, k);
  const L = 90;
  const corners = [
    { x: rect.x - off, y: rect.y - off, sx: 1, sy: 1 },
    { x: rect.x + rect.w + off, y: rect.y - off, sx: -1, sy: 1 },
    { x: rect.x - off, y: rect.y + rect.h + off, sx: 1, sy: -1 },
    { x: rect.x + rect.w + off, y: rect.y + rect.h + off, sx: -1, sy: -1 },
  ];
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, opacity: opacity * clamp01(k * 4), overflow: "visible" }}>
      {corners.map((c, i) => (
        <path key={i} d={`M${c.x} ${c.y + c.sy * L} L${c.x} ${c.y} L${c.x + c.sx * L} ${c.y}`} fill="none" stroke={color} strokeWidth={8} strokeDasharray="16 12" strokeLinecap="butt" />
      ))}
    </svg>
  );
};

export const NotTracked: React.FC<Win & {
  pull: { plate: string } & Cued; // the price plate appears ("That's what")
  buyer: { name: string } & Cued;
  paid: Cued; // the plate rides down
  target: { name: string; sub: string } & Cued; // the card stamps
  isolate: Cued; // the deal retires, the card takes the frame
  kind: { label: string } & Cued; // the tag
  track: Cued; // the reticle closes and stops short
  shrink: Cued; // the card becomes the header chip (in the pause)
  rail: { stages: string[] } & Cued; // the rail draws up from the first stage
  drug: Cued; // the flask drops onto the first stage
  never: Cued; // the arrow reaches for stage 2 and stops short
  lines: { text: string; emphasize?: string; word?: string }[]; // exactly three
}> = ({ from, to, pull, buyer, paid, target, isolate, kind, track, shrink, rail, drug, never, lines }) => {
  const ms = useMs();
  const k = useK();
  const W = COLORS.paper;
  const R = NT.rail;

  const tPull = at(pull, from + 400, from);
  const tBuyer = at(buyer, tPull + 400, from, tPull + 250);
  const tPaid = at(paid, tBuyer + 600, from, tBuyer + 250);
  const tTarget = at(target, tPaid + 300, from, tPaid + 250);
  const tIso = at(isolate, tTarget + 1500, from, tTarget + 600);
  const tKind = at(kind, tIso + 250, from, tIso + 150);
  const tTrack = at(track, tKind + 1500, from, tKind + 400);
  const tShrink = at(shrink, tTrack + 1100, from, tTrack + 600);
  const tRail = at(rail, tShrink + 300, from, tShrink + 250);
  const tDrug = at(drug, tRail + 700, from, tRail + 400);
  const tNever = at(never, tDrug + 800, from, tDrug + 300);
  const t2 = at({ word: lines[1].word }, tIso, from);
  const t3 = at({ word: lines[2].word }, tRail, from);

  if (ms < tPull - 40 || ms > to) return null;

  // the deal
  const plateK = k(tPull, 200);
  const buyerK = k(tBuyer, 120);
  const buyerS = interpolate(ms, [tBuyer, tBuyer + 280], [1.16, 1], { ...CLAMP, easing: EASE });
  const paidK = EASE_IO(k(tPaid, 360));
  const plateY = lerp(NT.plate.y0, NT.plate.y1, paidK);
  const lineTop = NT.buyer.y + NT.buyer.h;
  const lineBot = lerp(lineTop, plateY - NT.plate.h / 2, Math.min(1, paidK * 1.4));
  const isoK = EASE_IO(k(tIso, 380));
  const dealO = 1 - k(tIso, 260);

  // the card: deal seat → hero seat → header chip
  const cardO = k(tTarget, 120);
  const cardS = interpolate(ms, [tTarget, tTarget + 300], [1.07, 1], { ...CLAMP, easing: EASE });
  const shrinkK = EASE_IO(k(tShrink, 380));
  const rect = shrinkK > 0 ? mix(NT.hero, NT.chip, shrinkK) : mix(NT.deal, NT.hero, isoK);

  // the reticle: closes on the hero card and stops 46px short; leaves with the shrink
  const trackK = EASE(k(tTrack, Math.max(500, tShrink - tTrack - 200)));
  const retO = 1 - k(tShrink, 200);

  // the rail
  const railK = EASE_IO(k(tRail, 600));
  const railTopY = lerp(R.lab, R.top, railK);
  const nodes = rail.stages.map((s, i) => ({ s, y: lerp(R.lab, R.top, i / (rail.stages.length - 1)) }));
  const drugK = k(tDrug, 380);
  const neverK = EASE(k(tNever, 520));
  const arrowTop = R.lab - R.flask * 1.2 - 12; // just above the flask's mouth
  const arrowEnd = lerp(arrowTop, nodes[1].y + 26 + 30, neverK);

  return (
    <AbsoluteFill>
      {/* the deal: plate, buyer, line. Retires on "a Chinese". */}
      {dealO > 0 ? (
        <AbsoluteFill style={{ opacity: dealO, transform: `translateY(${-isoK * 120}px)` }}>
          {paidK > 0 ? <div style={{ position: "absolute", left: 540 - 3, top: lineTop, width: 6, height: Math.max(0, lineBot - lineTop), background: W }} /> : null}
          {buyerK > 0 ? (
            <div style={{ position: "absolute", left: NT.buyer.x, top: NT.buyer.y, width: NT.buyer.w, height: NT.buyer.h, borderRadius: 24, background: W, opacity: buyerK, transform: `scale(${buyerS})`,
              display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: 68, letterSpacing: TRACK.headline, color: COLORS.ink }}>
              {buyer.name}
            </div>
          ) : null}
          <div style={{ position: "absolute", left: 540 - NT.plate.w / 2, top: plateY - NT.plate.h / 2, width: NT.plate.w, height: NT.plate.h, borderRadius: NT.plate.h / 2,
            background: COLORS.accent, opacity: plateK, transform: `scale(${lerp(0.8, 1, EASE(plateK))})`, display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: DISPLAY, fontWeight: 700, fontSize: 70, letterSpacing: TRACK.headline, color: W, whiteSpace: "nowrap" }}>
            {pull.plate}
          </div>
        </AbsoluteFill>
      ) : null}

      {/* the reticle */}
      {trackK > 0 && retO > 0 ? <Reticle rect={NT.hero} k={trackK} gap={46} color={COLORS.accent} opacity={retO} /> : null}

      {/* the target's card */}
      {cardO > 0 ? <CompanyCard rect={rect} name={target.name} sub={target.sub} tag={kind.label} tagK={k(tKind, 280)} opacity={cardO} scale={cardS} /> : null}

      {/* the development rail: solid at Lab, dashed above (never travelled) */}
      {railK > 0 ? (
        <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
          <line x1={R.x} y1={R.lab} x2={R.x} y2={railTopY} stroke={INK_SUB} strokeWidth={6} strokeDasharray="14 12" />
          {nodes.map((n, i) => {
            const o = clamp01((n.y - railTopY + 40) / 40); // appears as the draw passes it
            return i === 0 ? (
              <circle key={i} cx={R.x} cy={n.y} r={22} fill={W} opacity={o} />
            ) : (
              <circle key={i} cx={R.x} cy={n.y} r={22} fill={COLORS.ink} stroke={W} strokeWidth={5} strokeDasharray="8 7" opacity={o} />
            );
          })}
          {neverK > 0 ? (
            <g>
              <line x1={R.x} y1={arrowTop} x2={R.x} y2={arrowEnd} stroke={COLORS.accent} strokeWidth={10} strokeDasharray="20 12" />
              <path d={`M${R.x - 22} ${arrowEnd + 20} L${R.x} ${arrowEnd - 4} L${R.x + 22} ${arrowEnd + 20}`} fill="none" stroke={COLORS.accent} strokeWidth={10} strokeLinejoin="round" />
            </g>
          ) : null}
        </svg>
      ) : null}
      {railK > 0
        ? nodes.map((n, i) => {
            const o = clamp01((n.y - railTopY + 40) / 40);
            const red = i === 1 && neverK > 0;
            return (
              <div key={i} style={{ position: "absolute", left: R.x + 84, top: n.y - 36, height: 72, display: "flex", alignItems: "center", opacity: o,
                fontFamily: DISPLAY, fontWeight: 700, fontSize: 60, letterSpacing: TRACK.headline, whiteSpace: "nowrap",
                color: red ? COLORS.accent : i === 0 ? W : INK_SUB }}>
                {n.s}
              </div>
            );
          })
        : null}
      {drugK > 0 ? (
        <div style={{ position: "absolute", left: 0, top: 0, opacity: clamp01(drugK * 3), transform: `translateY(${(1 - BACK(drugK)) * -160}px)` }}>
          <Flask x={R.x - R.flask / 2} y={R.lab - R.flask * 1.2} w={R.flask} stroke={W} />
        </div>
      ) : null}

      <Phrase from={tPull} to={t2 - 60} line={lines[0].text} top={NT.lineTop} size={60} color={W} emphasize={lines[0].emphasize} empColor={COLORS.accent} restColor={W} />
      <Phrase from={t2} to={t3 - 60} line={lines[1].text} top={NT.lineTop} size={60} color={W} emphasize={lines[1].emphasize} empColor={COLORS.accent} restColor={W} />
      <Phrase from={t3} to={to + 400} line={lines[2].text} top={NT.lineTop} size={60} color={W} emphasize={lines[2].emphasize} empColor={COLORS.accent} restColor={W} />
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// DealTower — THE SPINE is born (white card)
// ══════════════════════════════════════════════════════════════════════════
/** The tower's seats (1080×1920). Import these in every block that shows it. */
export const TOWER = {
  x: 150, w: 300, ground: 1400, H: 1000, // full height = the total deal
  flask: { w: 200 }, // drawn under the base, centred on the tower
  fig: { x: 500, y: 380 },
  side: 500, // the label column
};
/** Height of the base at TRUE scale: paid / total. */
export const baseH = (paid: number, total: number) => (TOWER.H * paid) / total;

/** The tower in its own coordinates, drawn at (dx, dy) and scale s around its ground centre. */
export const Tower: React.FC<{ paid: number; total: number; rise?: number; baseK?: number; flaskK?: number; flaskStroke: string; dashColor: string;
  /** on red: a white base, white liquid and a white-tinted column (red on red vanishes) */
  baseColor?: string; liquid?: string; colFill?: string;
  dx?: number; dy?: number; s?: number; opacity?: number }> = ({
  paid, total, rise = 1, baseK = 1, flaskK = 0, flaskStroke, dashColor, baseColor = COLORS.accent, liquid, colFill = inkA(0.04), dx = 0, dy = 0, s = 1, opacity = 1,
}) => {
  const T = TOWER;
  const bh = baseH(paid, total);
  const colH = (T.H - bh) * rise;
  const cx = T.x + T.w / 2;
  const fw = T.flask.w;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, opacity, transformOrigin: `${cx}px ${T.ground}px`, transform: `translate(${dx}px, ${dy}px) scale(${s})` }}>
      {colH > 1 ? <DashBox r={{ x: T.x, y: T.ground - bh - colH, w: T.w, h: colH }} color={dashColor} fill={colFill} /> : null}
      <div style={{ position: "absolute", left: T.x, top: T.ground - bh, width: T.w, height: bh, background: baseColor, opacity: clamp01(baseK * 3),
        transformOrigin: "50% 100%", transform: `scaleY(${lerp(1.4, 1, EASE(baseK))})` }} />
      {flaskK > 0 ? <Flask x={cx - fw / 2} y={T.ground + 4} w={fw} stroke={flaskStroke} liquid={liquid} draw={flaskK} /> : null}
    </div>
  );
};

export const DealTower: React.FC<Win & {
  paid: number; // 0.10 ($B)
  total: { value: number } & Cued; // 1.16, counts as voiced
  totalEnd: Cued; // the word after the figure ("billion.") — the count ends on it
  base: { label: string; emphasize: string } & Cued; // "$100M upfront" ("total deal")
  kicker: { label: string };
  milestones: { label: string } & Cued;
  royalties: { label: string } & Cued; // three dashed steps
  sales: { label: string } & Cued;
  retire: Cued; // the steps + labels leave (in the pause)
  flask: Cued; // the flask draws in under the tower
  lab: { label: string } & Cued;
}> = ({ from, to, paid, total, totalEnd, base, kicker, milestones, royalties, sales, retire, flask, lab }) => {
  const ms = useMs();
  const k = useK();
  const INK = COLORS.ink;
  const T = TOWER;

  const tBase = at(base, from + 400, from);
  const tTot = at(total, tBase + 600, from, tBase + 300);
  const tTotEnd = at(totalEnd, tTot + 1200, from, tTot + 400);
  const tMile = at(milestones, tTotEnd + 1000, from, tTotEnd + 300);
  const tRoy = at(royalties, tMile + 1000, from, tMile + 300);
  const tSales = at(sales, tRoy + 1000, from, tRoy + 300);
  const tRet = at(retire, tSales + 1000, from, tSales + 400);
  const tFlask = at(flask, tRet + 500, from, tRet + 300);
  const tLab = at(lab, tFlask + 900, from, tFlask + 300);
  if (ms < from || ms > to) return null;

  const baseK = k(tBase, 300);
  const riseK = EASE_IO(k(tTot, Math.max(500, tTotEnd - tTot + 300)));
  const v = lerp(paid, total.value, riseK);
  const retK = k(tRet, 320);
  const keep = 1 - retK;
  const mileK = k(tMile, 260);
  const royK = k(tRoy, 700);
  const salesK = k(tSales, 260);
  const flaskK = EASE(k(tFlask, 900));
  const labK = k(tLab, 260);
  const bh = baseH(paid, total.value);
  const colTop = T.ground - bh - (T.H - bh) * riseK;
  const steps = [
    { x: 520, w: 130, h: 70 },
    { x: 650, w: 130, h: 140 },
    { x: 780, w: 130, h: 210 },
  ];
  const stepBot = 1170;

  return (
    <AbsoluteFill>
      <Tower paid={paid} total={total.value} rise={riseK} baseK={baseK} flaskK={flaskK} flaskStroke={INK} dashColor={INK} />

      {/* the base label */}
      <div style={{ position: "absolute", left: T.side, top: T.ground - bh / 2 - 34, opacity: clamp01(baseK * 3), fontFamily: DISPLAY, fontSize: 60, letterSpacing: TRACK.headline, whiteSpace: "nowrap", color: INK }}>
        <span style={{ fontWeight: 700, color: COLORS.accent }}>{base.emphasize}</span>
        <span style={{ fontWeight: 400 }}>{base.label.slice(base.emphasize.length)}</span>
      </div>

      {/* the figure, riding a tick at the column's top */}
      {riseK > 0 ? (
        <>
          <div style={{ position: "absolute", left: T.x + T.w + 14, top: colTop - 3, width: 30, height: 6, background: INK, opacity: k(tTot, 120) }} />
          <div style={{ position: "absolute", left: T.fig.x, top: T.fig.y - 70, opacity: k(tTot, 140) * keep, fontFamily: DISPLAY, fontWeight: 700, fontSize: TYPE.label, letterSpacing: TRACK.kicker, color: INK }}>
            {kicker.label}
          </div>
          <div style={{ position: "absolute", left: T.fig.x, top: T.fig.y, opacity: k(tTot, 140), fontFamily: DISPLAY, fontWeight: 700, fontSize: 150, letterSpacing: TRACK.display, color: INK, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
            ${v.toFixed(2)}B
          </div>
        </>
      ) : null}

      {/* milestones: a dashed leader into the column */}
      {mileK > 0 && keep > 0 ? (
        <div style={{ position: "absolute", left: T.side, top: 640, opacity: clamp01(mileK * 3) * keep, transform: `translateX(${(1 - EASE(mileK)) * 30}px)`,
          fontFamily: DISPLAY, fontWeight: 700, fontSize: 72, letterSpacing: TRACK.headline, color: INK, display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 40, height: 0, borderTop: `5px dashed ${INK}`, marginLeft: -50 }} />
          {milestones.label}
        </div>
      ) : null}

      {/* tiered royalties: three dashed steps, built one by one; no rates */}
      {royK > 0 && keep > 0 ? (
        <div style={{ position: "absolute", left: 0, top: 0, opacity: keep }}>
          <div style={{ position: "absolute", left: steps[0].x, top: stepBot - steps[2].h - 90, fontFamily: DISPLAY, fontWeight: 700, fontSize: TYPE.label, letterSpacing: TRACK.kicker, color: INK, whiteSpace: "nowrap", opacity: clamp01(royK * 4) }}>
            {royalties.label}
          </div>
          {steps.map((st, i) => {
            const q = clamp01(royK * 3 - i);
            return q > 0 ? <DashBox key={i} r={{ x: st.x, y: stepBot - st.h * EASE(q), w: st.w - 10, h: st.h * EASE(q) }} color={INK} fill={inkA(0.04)} /> : null;
          })}
          <div style={{ position: "absolute", left: steps[0].x, top: stepBot + 22, opacity: clamp01(salesK * 3), fontFamily: DISPLAY, fontWeight: 400, fontSize: TYPE.label, letterSpacing: TRACK.body, color: inkA(0.7), whiteSpace: "nowrap" }}>
            {sales.label}
          </div>
        </div>
      ) : null}

      {/* still in the lab */}
      {labK > 0 ? (
        <div style={{ position: "absolute", left: T.side, top: T.ground + 110, opacity: clamp01(labK * 3), transform: `scale(${lerp(1.25, 1, EASE(labK))})`, transformOrigin: "0 50%",
          fontFamily: DISPLAY, fontWeight: 700, fontSize: 72, letterSpacing: TRACK.headline, color: COLORS.accent, whiteSpace: "nowrap" }}>
          {lab.label}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
