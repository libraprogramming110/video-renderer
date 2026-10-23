// ─────────────────────────────────────────────────────────────────────────
// KIT · banlanes — A BAN NAMED COUNTRY BY COUNTRY, ONE LANE SHUT AND ONE OPEN,
// AND A PLAYBOOK THAT RUNS INTO THE BAN. Added on the Merck / Halozyme
// subcutaneous Keytruda long-form, 2026-10-09 (VERTICAL). One mover per cue,
// landed things go still, finished ideas retire.
//
// `BanGrid` (white card): "The result: Merck is barred from selling
// subcutaneous Keytruda in Belgium, Denmark, …, and the Netherlands." The
// company stamps, a red bar slams under it, the product lands UNDER the bar.
// On "in" the company retires and eight blank tiles deal out; each one turns
// solid and takes its name on its own spoken word.
//
// `AppealLanes` (ink, over a FootageScrim): "Merck strongly disagrees and is
// appealing. The intravenous version keeps flowing." The company and an
// outlined stamp; then two lanes, one already shut by the red bar, and a
// stream that draws once through the other.
//
// `PlaybookRail` (red): "But the subcutaneous shift is Merck's main lifecycle
// play on its top drug — and this ruling tests how far that playbook can
// travel across Europe." IV → SC as two pills and an arrow, braced as the
// play, named for the drug. After the pause the SC pill itself drops onto a
// rail, a barrier slams down ahead of it, the pill runs to the barrier and
// stops; the rail beyond is dashed (not yet) and ends in a question.
//
// Every onset is a spoken word with an optional ms pin, clamped monotonic.
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { CLAMP, clamp01, COLORS, DISPLAY, INK_SUB, INK_SUB_ON_RED, TRACK, useMs } from "./core";
import { TYPE } from "../style";
import { at, lerp, Phrase, useK, type Cued, type Win } from "./elora";
import { COURT } from "./barred";

const EASE = Easing.out(Easing.cubic);
const EASE_IO = Easing.inOut(Easing.cubic);
const BACK = Easing.out(Easing.back(1.6));

type Rect = { x: number; y: number; w: number; h: number };
const mix = (a: Rect, b: Rect, t: number): Rect => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), w: lerp(a.w, b.w, t), h: lerp(a.h, b.h, t) });

// ══════════════════════════════════════════════════════════════════════════
// BanGrid — the ban, country by country (white card)
// ══════════════════════════════════════════════════════════════════════════
export const BAN = {
  chip: { x: 340, y: 200, w: 400, h: 104 },
  bar: { x: 120, y: 334, w: 840, h: 96 },
  sub: { top: 452, size: 60 },
  name: { top: 508, size: 140 },
  grid: { x: 128, y: 720, w: 400, h: 150, gap: 24, cols: 2 },
};
export const banTile = (i: number): Rect => {
  const g = BAN.grid;
  return { x: g.x + (i % g.cols) * (g.w + g.gap), y: g.y + Math.floor(i / g.cols) * (g.h + g.gap), w: g.w, h: g.h };
};

export const BanGrid: React.FC<Win & {
  kicker: { label: string } & Cued;
  company: { name: string } & Cued;
  bar: { label: string } & Cued; // the red bar slams
  sub: { label: string } & Cued; // the product's first word
  product: { name: string } & Cued;
  deal: Cued; // the company retires, the blank tiles deal out ("in")
  places: ({ name: string } & Cued)[]; // each tile takes its name
}> = ({ from, to, kicker, company, bar, sub, product, deal, places }) => {
  const ms = useMs();
  const k = useK();
  const INK = COLORS.ink;
  const W = COLORS.paper;

  const tKick = at(kicker, from + 400, from);
  const tCo = at(company, tKick + 900, from, tKick + 300);
  const tBar = at(bar, tCo + 350, from, tCo + 250);
  const tSub = at(sub, tBar + 900, from, tBar + 300);
  const tProd = at(product, tSub + 800, from, tSub + 250);
  const tDeal = at(deal, tProd + 600, from, tProd + 300);
  const tPlace: number[] = [];
  places.forEach((p, i) => tPlace.push(at(p, (i ? tPlace[i - 1] : tDeal) + 600, from, (i ? tPlace[i - 1] : tDeal) + 120)));

  if (ms > to) return null;

  const kickO = k(tKick, 140) * (1 - k(tCo - 120, 110));
  const coO = k(tCo, 120) * (1 - k(tDeal, 200));
  const coS = interpolate(ms, [tCo, tCo + 280], [1.14, 1], { ...CLAMP, easing: EASE });
  const barO = k(tBar, 100);
  const barS = interpolate(ms, [tBar, tBar + 260], [1.3, 1], { ...CLAMP, easing: EASE });
  const subK = EASE(k(tSub, 220));
  const prodO = k(tProd, 120);
  const prodS = interpolate(ms, [tProd, tProd + 300], [1.1, 1], { ...CLAMP, easing: EASE });

  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: BAN.chip.y + 26, textAlign: "center", opacity: kickO, fontFamily: DISPLAY, fontWeight: 700, fontSize: TYPE.label, letterSpacing: TRACK.nav, color: COLORS.grayText }}>
        {kicker.label}
      </div>
      {coO > 0 ? (
        <div style={{ position: "absolute", left: BAN.chip.x, top: BAN.chip.y, width: BAN.chip.w, height: BAN.chip.h, borderRadius: 22, background: INK, opacity: coO, transform: `scale(${coS})`,
          display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: 68, letterSpacing: TRACK.headline, color: W }}>
          {company.name}
        </div>
      ) : null}
      {barO > 0 ? (
        <div style={{ position: "absolute", left: BAN.bar.x, top: BAN.bar.y, width: BAN.bar.w, height: BAN.bar.h, borderRadius: 18, background: COLORS.accent, opacity: barO, transform: `scale(${barS})`,
          display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: 62, letterSpacing: TRACK.headline, color: W }}>
          {bar.label}
        </div>
      ) : null}
      <div style={{ position: "absolute", left: 0, right: 0, top: BAN.sub.top, textAlign: "center", opacity: subK, transform: `translateY(${(1 - subK) * 14}px)`, fontFamily: DISPLAY, fontWeight: 400, fontSize: BAN.sub.size, lineHeight: 1, letterSpacing: TRACK.headline, color: INK }}>
        {sub.label}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: BAN.name.top, textAlign: "center", opacity: prodO, transform: `scale(${prodS})`, fontFamily: DISPLAY, fontWeight: 700, fontSize: BAN.name.size, lineHeight: 1.05, letterSpacing: TRACK.display, color: INK }}>
        {product.name}
      </div>

      {/* eight tiles: blank on the deal, solid and named on each spoken country */}
      {places.map((p, i) => {
        const r = banTile(i);
        const d = k(tDeal + i * 25, 180);
        if (d <= 0) return null;
        const q = k(tPlace[i], 160);
        return (
          <div key={i} style={{ position: "absolute", left: r.x, top: r.y, width: r.w, height: r.h, boxSizing: "border-box", borderRadius: 24, background: COLORS.panel, border: `3px solid ${COLORS.border}`, overflow: "hidden", opacity: clamp01(d * 3), transform: `scale(${lerp(0.85, 1, EASE(d))})` }}>
            <div style={{ position: "absolute", inset: -3, background: INK, opacity: q, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: 54, letterSpacing: TRACK.headline, color: W, whiteSpace: "nowrap" }}>
              <span style={{ transform: `scale(${lerp(0.9, 1, BACK(q))})` }}>{p.name}</span>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// AppealLanes — one lane shut, one open (ink world, over a FootageScrim)
// ══════════════════════════════════════════════════════════════════════════
export const LANES = {
  chip: { x: 150, y: 230, w: 380, h: 116 },
  stamp: { x: 560, y: 236, w: 380, h: 104 },
  top: 500, bottom: 1200, labelTop: 430,
  cx: [320, 760] as [number, number],
  half: 150, stream: 44, gateY: 700,
};

export const AppealLanes: React.FC<Win & {
  company: { name: string } & Cued;
  stamp: { label: string } & Cued; // the outlined stamp ("appealing")
  lanes: { shut: string; open: string } & Cued; // both lanes appear, one already shut
  flow: Cued; // the stream draws through the open lane
  lines: { text: string; emphasize?: string }[]; // exactly two
}> = ({ from, to, company, stamp, lanes, flow, lines }) => {
  const ms = useMs();
  const k = useK();
  const W = COLORS.paper;
  const L = LANES;

  const tCo = at(company, from + 400, from);
  const tStamp = at(stamp, tCo + 1500, from, tCo + 400);
  const tLanes = at(lanes, tStamp + 1100, from, tStamp + 400);
  const tFlow = at(flow, tLanes + 800, from, tLanes + 350);

  if (ms > to) return null;

  const coO = k(tCo, 120);
  const coS = interpolate(ms, [tCo, tCo + 280], [1.14, 1], { ...CLAMP, easing: EASE });
  const stO = k(tStamp, 100);
  const stS = interpolate(ms, [tStamp, tStamp + 260], [1.6, 1], { ...CLAMP, easing: EASE });
  const lanesO = k(tLanes, 220);
  const flowK = EASE_IO(k(tFlow, 600));
  const tip = lerp(L.top, L.bottom - 40, flowK);

  const rails = (cx: number) => [cx - L.half, cx + L.half - 4].map((x) => <div key={x} style={{ position: "absolute", left: x, top: L.top, width: 4, height: L.bottom - L.top, background: "rgba(255,255,255,0.35)" }} />);
  const label = (cx: number, text: string) => (
    <div style={{ position: "absolute", left: cx - 200, width: 400, top: L.labelTop, textAlign: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: TYPE.labelSm, letterSpacing: TRACK.nav, color: W }}>{text}</div>
  );

  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: L.chip.x, top: L.chip.y, width: L.chip.w, height: L.chip.h, borderRadius: 24, background: W, opacity: coO, transform: `scale(${coS})`,
        display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: 72, letterSpacing: TRACK.headline, color: COLORS.ink }}>
        {company.name}
      </div>
      {stO > 0 ? (
        <div style={{ position: "absolute", left: L.stamp.x, top: L.stamp.y, width: L.stamp.w, height: L.stamp.h, boxSizing: "border-box", borderRadius: 18, border: `6px solid ${W}`, opacity: stO, transform: `rotate(-5deg) scale(${stS})`,
          display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: 58, letterSpacing: TRACK.headline, color: W }}>
          {stamp.label}
        </div>
      ) : null}

      {lanesO > 0 ? (
        <AbsoluteFill style={{ opacity: lanesO }}>
          {rails(L.cx[0])}
          {rails(L.cx[1])}
          {label(L.cx[0], lanes.shut)}
          {label(L.cx[1], lanes.open)}
          {/* the shut lane: a stub that stops at the bar */}
          <div style={{ position: "absolute", left: L.cx[0] - L.stream / 2, top: L.top, width: L.stream, height: L.gateY - L.top, background: W }} />
          <div style={{ position: "absolute", left: L.cx[0] - L.half - 20, top: L.gateY, width: L.half * 2 + 40, height: 30, borderRadius: 6, background: COLORS.accent }} />
        </AbsoluteFill>
      ) : null}

      {/* the open lane: one draw, then still */}
      {flowK > 0 ? (
        <>
          <div style={{ position: "absolute", left: L.cx[1] - L.stream / 2, top: L.top, width: L.stream, height: tip - L.top, background: W }} />
          <svg width={100} height={44} viewBox="0 0 100 44" style={{ position: "absolute", left: L.cx[1] - 50, top: tip - 2 }}>
            <path d="M0 0 L100 0 L50 44 Z" fill={W} />
          </svg>
        </>
      ) : null}

      <Phrase from={tCo} to={tLanes - 150} line={lines[0].text} top={COURT.lineTop} size={60} color={W} emphasize={lines[0].emphasize} empColor={W} restColor={INK_SUB} />
      <Phrase from={tLanes} to={to + 400} line={lines[1].text} top={COURT.lineTop} size={60} color={W} emphasize={lines[1].emphasize} empColor={W} restColor={INK_SUB} />
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// PlaybookRail — the play, and how far it travels (red world)
// ══════════════════════════════════════════════════════════════════════════
export const PLAY = {
  drug: { x: 290, y: 220, w: 500, h: 120 },
  from: { x: 130, y: 560, w: 300, h: 170 },
  to: { x: 650, y: 560, w: 300, h: 170 },
  arrow: { x0: 452, x1: 628, y: 645 },
  brace: { x0: 130, x1: 950, tick: 762, bar: 790, labelTop: 812 },
  railY: 1075,
  rail: [110, 970] as [number, number],
  start: { x: 110, y: 957, w: 200, h: 113 },
  stop: { x: 420, y: 957, w: 200, h: 113 },
  wall: { x: 620, y: 840, w: 34, h: 260 },
  wallTag: { x: 482, y: 738, w: 310, h: 86 },
  ask: { x: 812, top: 870, size: 170 },
};

/** A formulation pill. Content is laid out 300×170 and scaled with the rect. */
export const Pill: React.FC<{ rect: Rect; short: string; long: string; solid: boolean; opacity?: number; scale?: number }> = ({ rect, short, long, solid, opacity = 1, scale = 1 }) => {
  const s = rect.w / 300;
  const W = COLORS.paper;
  return (
    <div style={{ position: "absolute", left: rect.x, top: rect.y, width: rect.w, height: rect.h, boxSizing: "border-box", borderRadius: 34 * s, background: solid ? W : "transparent", border: `${6 * s}px solid ${W}`, opacity, transform: `scale(${scale})` }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 300, height: 170, transform: `scale(${s})`, transformOrigin: "0 0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        fontFamily: DISPLAY, fontWeight: 700, color: solid ? COLORS.ink : W, lineHeight: 1, whiteSpace: "nowrap" }}>
        <div style={{ fontSize: 84, letterSpacing: TRACK.display }}>{short}</div>
        <div style={{ fontSize: 30, letterSpacing: TRACK.nav, marginTop: 6 }}>{long}</div>
      </div>
    </div>
  );
};

export const PlaybookRail: React.FC<Win & {
  before: { short: string; long: string } & Cued; // the IV pill
  shift: Cued; // the arrow draws
  after: { short: string; long: string } & Cued; // the SC pill stamps
  play: Cued; // the brace draws under both
  playLabel: { label: string } & Cued;
  drug: { name: string } & Cued; // the drug's plate
  drop: Cued; // the play retires, the SC pill drops to the rail ("and this")
  wall: { label: string } & Cued; // the barrier slams ("ruling")
  rail: Cued; // the rail draws to the barrier ("tests")
  run: Cued; // the pill starts along the rail ("how far")
  hit: Cued; // ...and is at the barrier by this word
  beyond: Cued; // the dashed rail past the barrier
  ask: { label: string } & Cued; // the end label and the "?"
  lines: { text: string; emphasize?: string }[]; // exactly two
}> = ({ from, to, before, shift, after, play, playLabel, drug, drop, wall, rail, run, hit, beyond, ask, lines }) => {
  const ms = useMs();
  const k = useK();
  const W = COLORS.paper;
  const INK = COLORS.ink;
  const P = PLAY;

  const tBefore = at(before, from + 350, from);
  const tShift = at(shift, tBefore + 150, from, tBefore + 120);
  const tAfter = at(after, tShift + 850, from, tShift + 300);
  const tPlay = at(play, tAfter + 500, from, tAfter + 300);
  const tPlayLabel = at(playLabel, tPlay + 800, from, tPlay + 260);
  const tDrug = at(drug, tPlayLabel + 1300, from, tPlayLabel + 300);
  const tDrop = at(drop, tDrug + 800, from, tDrug + 400);
  const tWall = at(wall, tDrop + 440, from, tDrop + 420);
  const tRail = at(rail, tWall + 450, from, tWall + 300);
  const tRun = at(run, tRail + 400, from, tRail + 260);
  const tHit = at(hit, tRun + 800, from, tRun + 400);
  const tBeyond = at(beyond, tHit + 600, from, tHit + 200);
  const tAsk = at(ask, tBeyond + 850, from, tBeyond + 300);

  if (ms > to) return null;

  const beforeO = k(tBefore, 140);
  const arrowK = EASE_IO(k(tShift, Math.max(300, tAfter - tShift - 60)));
  const afterO = k(tAfter, 120);
  const afterS = interpolate(ms, [tAfter, tAfter + 280], [1.16, 1], { ...CLAMP, easing: EASE });
  const braceK = EASE(k(tPlay, 260));
  const playLabelO = k(tPlayLabel, 160);
  const drugO = k(tDrug, 120);
  const drugS = interpolate(ms, [tDrug, tDrug + 280], [1.12, 1], { ...CLAMP, easing: EASE });
  const pairO = 1 - k(tDrop, 220); // the play retires; the SC pill is the one thing that stays

  // the SC pill: pair seat → rail start → the barrier
  const dropK = EASE_IO(k(tDrop, 400));
  const runK = EASE_IO(k(tRun, Math.max(400, tHit - tRun)));
  const pill = runK > 0 ? mix(P.start, P.stop, runK) : mix(P.to, P.start, dropK);

  const wallO = k(tWall, 100);
  const wallY = lerp(-90, 0, EASE(k(tWall, 240)));
  const wallTagO = k(tWall + 220, 160);
  const railK = EASE(k(tRail, 260));
  const beyondK = EASE(k(tBeyond, 420));
  const askO = k(tAsk + 120, 100);
  const askS = interpolate(ms, [tAsk + 120, tAsk + 380], [1.5, 1], { ...CLAMP, easing: EASE });
  const A = P.arrow;
  const bx = (P.brace.x0 + P.brace.x1) / 2;
  const bhalf = (P.brace.x1 - P.brace.x0) / 2;

  return (
    <AbsoluteFill>
      {/* the drug's plate (stays as the header) */}
      {drugO > 0 ? (
        <div style={{ position: "absolute", left: P.drug.x, top: P.drug.y, width: P.drug.w, height: P.drug.h, borderRadius: 26, background: W, opacity: drugO, transform: `scale(${drugS})`,
          display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: 80, letterSpacing: TRACK.headline, color: INK }}>
          {drug.name}
        </div>
      ) : null}

      {/* the play: before, arrow, brace. Retires on the drop. */}
      {pairO > 0 ? (
        <AbsoluteFill style={{ opacity: pairO }}>
          <Pill rect={P.from} short={before.short} long={before.long} solid={false} opacity={beforeO} />
          {arrowK > 0 ? (
            <>
              <div style={{ position: "absolute", left: A.x0, top: A.y - 4, width: Math.max(0, (A.x1 - A.x0 - 26) * arrowK), height: 8, background: W }} />
              <svg width={30} height={44} viewBox="0 0 30 44" style={{ position: "absolute", left: A.x0 + (A.x1 - A.x0 - 26) * arrowK - 2, top: A.y - 22 }}>
                <path d="M0 0 L30 22 L0 44 Z" fill={W} />
              </svg>
            </>
          ) : null}
          {braceK > 0 ? (
            <>
              <div style={{ position: "absolute", left: bx - bhalf * braceK, top: P.brace.bar - 3, width: bhalf * 2 * braceK, height: 6, background: W }} />
              {braceK >= 1 ? [P.brace.x0, P.brace.x1 - 6].map((x) => <div key={x} style={{ position: "absolute", left: x, top: P.brace.tick, width: 6, height: P.brace.bar - P.brace.tick, background: W }} />) : null}
            </>
          ) : null}
          <div style={{ position: "absolute", left: 0, right: 0, top: P.brace.labelTop, textAlign: "center", opacity: playLabelO, fontFamily: DISPLAY, fontWeight: 700, fontSize: TYPE.label, letterSpacing: TRACK.nav, color: W }}>
            {playLabel.label}
          </div>
        </AbsoluteFill>
      ) : null}

      {/* the rail: solid to the barrier, dashed (not yet) beyond it */}
      {railK > 0 ? <div style={{ position: "absolute", left: P.rail[0], top: P.railY - 4, width: (P.wall.x - P.rail[0]) * railK, height: 8, borderRadius: 4, background: W }} /> : null}
      {beyondK > 0 ? (
        <div style={{ position: "absolute", left: P.wall.x + P.wall.w, top: P.railY - 4, width: (P.rail[1] - P.wall.x - P.wall.w) * beyondK, height: 8, background: `repeating-linear-gradient(90deg, ${W} 0 26px, transparent 26px 46px)` }} />
      ) : null}
      {wallO > 0 ? (
        <>
          <div style={{ position: "absolute", left: P.wall.x, top: P.wall.y + wallY, width: P.wall.w, height: P.wall.h, borderRadius: 8, background: INK, opacity: wallO }} />
          <div style={{ position: "absolute", left: P.wallTag.x, top: P.wallTag.y, width: P.wallTag.w, height: P.wallTag.h, borderRadius: 20, background: INK, opacity: wallTagO,
            display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: 46, letterSpacing: TRACK.headline, color: W, whiteSpace: "nowrap" }}>
            {wall.label}
          </div>
        </>
      ) : null}
      {askO > 0 ? (
        <div style={{ position: "absolute", left: P.ask.x - 100, width: 200, top: P.ask.top, textAlign: "center", opacity: askO, transform: `scale(${askS})`, fontFamily: DISPLAY, fontWeight: 700, fontSize: P.ask.size, lineHeight: 1, color: W }}>?</div>
      ) : null}
      <div style={{ position: "absolute", right: 1080 - P.rail[1], top: P.railY + 28, opacity: k(tAsk, 160), fontFamily: DISPLAY, fontWeight: 700, fontSize: TYPE.label, letterSpacing: TRACK.nav, color: W }}>{ask.label}</div>

      {/* the SC pill: stamps in the pair, then is the one thing that travels */}
      {afterO > 0 ? <Pill rect={pill} short={after.short} long={after.long} solid opacity={afterO} scale={afterS} /> : null}

      <Phrase from={tBefore} to={tDrop - 160} line={lines[0].text} top={COURT.lineTop} size={60} color={W} emphasize={lines[0].emphasize} empColor={W} restColor={INK_SUB_ON_RED} />
      <Phrase from={tDrop} to={to + 400} line={lines[1].text} top={COURT.lineTop} size={60} color={W} emphasize={lines[1].emphasize} empColor={W} restColor={INK_SUB_ON_RED} />
    </AbsoluteFill>
  );
};
