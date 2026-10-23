// ─────────────────────────────────────────────────────────────────────────
// KIT · rerun — A PARTNERSHIP RE-RUN. Added on the Sanofi x Regeneron
// long-form, 2026-10-02 (VERTICAL). Built under the 09-30 one-mover rule:
// each cue gets ONE motion, and anything that has landed goes still.
//
// `BillionHandOff` (red, the hook): "$1 billion... that's what <giver> just
// handed <taker> this week." "$1" stamps huge; on "billion" it shrinks and the
// zeros PUSH IN one group at a time until the full figure is written out; in
// the pause they fold back into a "B". The figure drops onto the giver's chip,
// and on "handed" it arcs across (leaving its path, dashed) into an empty
// dashed seat that becomes the taker on its spoken name.
//
// `FourAntibodies` (white card): "For four early-stage <area> antibodies...
// including one already in a Phase one trial for <indication>." Four DASHED
// antibodies (dashed = not yet proven) drop in on "four" and are bracketed;
// on "one" a single antibody turns solid and red while the rest recede; a
// Phase 1-2-3 track draws on "Phase"; on "trial" the antibody travels onto
// Phase 1; the indication tag stamps beside it.
//
// Every onset is a spoken word with an optional ms pin, clamped monotonic.
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, interpolate, Easing } from "remotion";
import { CLAMP, clamp01, COLORS, cue, DISPLAY, inkA, INK_SUB_ON_RED, TRACK, useMs } from "./core";
import { FlowLine } from "./flowline";
import { YGlyph } from "./pairing";

const EASE = Easing.out(Easing.cubic);
const EASE_IO = Easing.inOut(Easing.cubic);
const BACK = Easing.out(Easing.back(1.6));

type Win = { from: number; to: number };
type Cued = { word?: string; ms?: number };

const useK = () => {
  const ms = useMs();
  return (a: number, dur: number) => clamp01(interpolate(ms, [a, a + dur], [0, 1], CLAMP));
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** resolve a cued onset: pin > spoken word > fallback, never earlier than `min` */
const at = (c: Cued, fallback: number, from: number, min = -Infinity) => Math.max(min, c.ms ?? cue(c.word, fallback, from));

/** A phrase of narration that owns a window (fades in/out at its edges). */
const Phrase: React.FC<{ from: number; to: number; line: string; top: number; size: number; color: string; emphasize?: string; empColor?: string; restColor?: string; restWeight?: number; underline?: string }> = ({
  from, to, line, top, size, color, emphasize, empColor, restColor, restWeight, underline,
}) => {
  const ms = useMs();
  const o = clamp01(interpolate(ms, [from - 80, from, to - 220, to], [0, 1, 1, 0], CLAMP));
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 90, right: 90, top, opacity: o }}>
      <FlowLine from={from} to={to} line={line} size={size} color={color} emphasize={emphasize} empColor={empColor} restColor={restColor} restWeight={restWeight} underline={underline} lineHeight={1.1} />
    </div>
  );
};

/** A company chip: a white pill with the name in red (the carousels' white-on-red inversion). */
const Chip: React.FC<{ x: number; y: number; name: string; at: number; fill: string; ink: string }> = ({ x, y, name, at: t0, fill, ink }) => {
  const ms = useMs();
  const o = clamp01(interpolate(ms, [t0, t0 + 120], [0, 1], CLAMP));
  const s = interpolate(ms, [t0, t0 + 320], [1.22, 1], { ...CLAMP, easing: EASE });
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) scale(${s})`, opacity: o, width: HO.chip.w, height: HO.chip.h, borderRadius: HO.chip.h / 2, background: fill,
      display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: 60, letterSpacing: TRACK.headline, color: ink }}>
      {name}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// BillionHandOff — the hook (red world)
// ══════════════════════════════════════════════════════════════════════════
const HO = {
  fig: { x: 540, y: 600 },
  size: { big: 380, wide: 110, folded: 300, docked: 150 },
  chip: { w: 400, h: 140 },
  giver: { x: 270, y: 1080 },
  taker: { x: 810, y: 1080 },
  dockY: 900, // the figure sits on a chip at this y
  arcCtl: { x: 540, y: 560 },
  weekY: 610, // above the arc's apex (y 720), never on the dashed path
  lineTop: 1300,
  group: 2.12, // em width allotted to one ",000" group (Inter 700, display tracking)
  bee: 0.72, // em width allotted to the "B"
};

export const BillionHandOff: React.FC<Win & {
  figure: Cued; // "$1" stamps
  billion: Cued; // the zeros push in
  giver: { name: string } & Cued; // chip lands
  dock: Cued; // the figure drops onto the giver
  hand: Cued; // the figure leaves for the taker's seat
  taker: { name: string } & Cued; // the taker fills the seat as the figure lands
  week: { label: string } & Cued;
  line: { text: string; emphasize: string };
}> = ({ from, to, figure, billion, giver, dock, hand, taker, week, line }) => {
  const ms = useMs();
  const k = useK();
  const W = COLORS.paper;
  const R = COLORS.accent;
  const vis = clamp01(interpolate(ms, [to - 360, to], [1, 0], CLAMP));

  const tFig = at(figure, from + 60, from);
  const tBil = at(billion, tFig + 450, from, tFig + 250);
  const tGroups = [0, 1, 2].map((i) => tBil + 300 + i * 190);
  const tFold = tGroups[2] + 220 + 260;
  const tGiver = at(giver, tFold + 1000, from, tFold + 500);
  const tDock = at(dock, tGiver + 500, from, tGiver + 250);
  const tHand = at(hand, tDock + 300, from, tDock + 260);
  const tTaker = at(taker, tHand + 350, from, tHand + 250);
  const tWeek = at(week, tTaker + 500, from, tTaker + 200);

  // ── the figure's TYPE: size + which glyphs are open
  const stampS = interpolate(ms, [tFig, tFig + 300], [1.2, 1], { ...CLAMP, easing: EASE });
  const shrink = EASE(k(tBil, 280));
  const fold = EASE_IO(k(tFold, 460));
  let size = lerp(HO.size.big, HO.size.wide, shrink);
  size = lerp(size, HO.size.folded, fold);
  const groupOpen = tGroups.map((t) => EASE(k(t, 220)) * (1 - fold));
  const groupDrop = tGroups.map((t) => (1 - BACK(k(t, 260))) * -110);
  const bee = fold;

  // ── the figure's POSITION: centre -> drop onto the giver -> arc to the taker
  const dockQ = EASE_IO(k(tDock, 240)); // done before "handed" (270ms later on this VO)
  const flight = Math.max(300, tTaker - tHand);
  const arcQ = EASE_IO(k(tHand, flight));
  const S = { x: HO.giver.x, y: HO.dockY };
  const T = { x: HO.taker.x, y: HO.dockY };
  const arcPt = (t: number) => {
    const u = 1 - t;
    return { x: u * u * S.x + 2 * u * t * HO.arcCtl.x + t * t * T.x, y: u * u * S.y + 2 * u * t * HO.arcCtl.y + t * t * T.y };
  };
  let pos = { x: lerp(HO.fig.x, S.x, dockQ), y: lerp(HO.fig.y, S.y, dockQ) };
  if (ms >= tHand) pos = arcPt(arcQ);
  size = lerp(size, HO.size.docked, dockQ);
  // a short press as it lands on each chip (one beat, then still)
  const press = (t0: number) => {
    const q = k(t0, 260);
    return q > 0 && q < 1 ? Math.sin(q * Math.PI) * 0.08 : 0;
  };
  const figScale = stampS * (1 - press(tTaker));

  // the path it travelled, kept (dashed) once it lands
  const trail: string[] = [];
  if (ms >= tHand) {
    for (let i = 0; i <= 40; i++) {
      const t = (i / 40) * arcQ;
      const p = arcPt(t);
      trail.push(`${i ? "L" : "M"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`);
    }
  }
  const seatO = k(tHand, 180) * (1 - k(tTaker, 120));
  const weekP = k(tWeek, 200);
  const weekS = interpolate(ms, [tWeek, tWeek + 260], [1.2, 1], { ...CLAMP, easing: EASE });

  const figStyle: React.CSSProperties = {
    position: "absolute", left: pos.x, top: pos.y, transform: `translate(-50%,-50%) scale(${figScale})`,
    display: "flex", alignItems: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: size, letterSpacing: TRACK.display,
    color: W, lineHeight: 1, whiteSpace: "nowrap", opacity: k(tFig, 120),
  };

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {trail.length ? <path d={trail.join(" ")} fill="none" stroke={W} strokeWidth={7} strokeDasharray="2 20" strokeLinecap="round" opacity={0.75} /> : null}
        {seatO > 0 ? (
          <rect x={HO.taker.x - HO.chip.w / 2} y={HO.taker.y - HO.chip.h / 2} width={HO.chip.w} height={HO.chip.h} rx={HO.chip.h / 2}
            fill="none" stroke={W} strokeWidth={6} strokeDasharray="18 16" opacity={seatO * 0.85} />
        ) : null}
      </svg>

      <Chip x={HO.giver.x} y={HO.giver.y} name={giver.name} at={tGiver} fill={W} ink={R} />
      <Chip x={HO.taker.x} y={HO.taker.y} name={taker.name} at={tTaker} fill={W} ink={R} />

      {ms >= tFig - 20 ? (
        <div style={figStyle}>
          <span>$1</span>
          {[0, 1, 2].map((i) => (
            <span key={i} style={{ display: "inline-block", overflow: "hidden", width: `${groupOpen[i] * HO.group}em`, height: "1.05em" }}>
              <span style={{ display: "inline-block", transform: `translateY(${groupDrop[i]}px)`, opacity: clamp01(groupOpen[i] * 2.5) }}>,000</span>
            </span>
          ))}
          <span style={{ display: "inline-block", overflow: "hidden", width: `${bee * HO.bee}em`, opacity: clamp01(bee * 1.6) }}>B</span>
        </div>
      ) : null}

      {weekP > 0 ? (
        <div style={{ position: "absolute", left: 540, top: HO.weekY, transform: `translate(-50%,-50%) scale(${weekS})`, opacity: weekP,
          fontFamily: DISPLAY, fontWeight: 700, fontSize: 48, letterSpacing: TRACK.headline, color: W, whiteSpace: "nowrap" }}>
          {week.label}
        </div>
      ) : null}

      <Phrase from={tFig} to={to + 400} line={line.text} top={HO.lineTop} size={66} color={W} restColor={INK_SUB_ON_RED} restWeight={700} emphasize={line.emphasize} empColor={W} underline={W} />
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// FourAntibodies — the asset (white card)
// ══════════════════════════════════════════════════════════════════════════
const FA = {
  lineTop: 230,
  rowY: 800,
  xs: [195, 425, 655, 885],
  scale: 0.75,
  bracketY: 1010,
  trackY: 1330,
  nodes: [200, 540, 880],
  chosen: 2,
  onTrack: { y: 1150, scale: 0.6 },
  tag: { x: 330, y: 1150 },
};

export const FourAntibodies: React.FC<Win & {
  lead: { text: string; emphasize?: string } & Cued;
  four: Cued; // the antibodies drop in
  stage: { label: string } & Cued; // bracket + first label
  area: { label: string } & Cued; // second label
  turn: { text: string; emphasize?: string } & Cued; // the second line starts
  one: Cued; // one antibody is singled out
  phase: { labels: string[] } & Cued; // the track draws
  trial: Cued; // the antibody travels onto Phase 1
  indication: { label: string } & Cued;
}> = ({ from, to, lead, four, stage, area, turn, one, phase, trial, indication }) => {
  const ms = useMs();
  const k = useK();
  const ink = COLORS.ink;
  const red = COLORS.accent;
  const vis = clamp01(interpolate(ms, [to - 360, to], [1, 0], CLAMP));

  const tLead = at(lead, from + 50, from);
  const tFour = at(four, tLead + 250, from, tLead);
  const tStage = at(stage, tFour + 600, from, tFour + 520);
  const tArea = at(area, tStage + 800, from, tStage + 300);
  const tTurn = at(turn, tArea + 1500, from, tArea + 600);
  const tOne = at(one, tTurn + 400, from, tTurn);
  const tPhase = at(phase, tOne + 800, from, tOne + 350);
  const tTrial = at(trial, tPhase + 700, from, tPhase + 650);
  const tInd = at(indication, tTrial + 600, from, tTrial + 450);

  const recede = EASE(k(tOne, 320));
  const solid = k(tOne, 160);
  const lift = EASE(k(tOne, 320));
  const travel = EASE_IO(k(tTrial, 460));
  const draw = EASE(k(tPhase, 600));
  const node1 = k(tTrial + 440, 160);
  const ring = k(tTrial + 440, 520);

  const bracket = EASE(k(tStage, 380)) * (1 - recede);
  const areaO = k(tArea, 200);
  const tagO = k(tInd, 140);
  const tagS = interpolate(ms, [tInd, tInd + 300], [1.25, 1], { ...CLAMP, easing: EASE });

  const label = (o: number): React.CSSProperties => ({ fontFamily: DISPLAY, fontWeight: 700, fontSize: 40, letterSpacing: TRACK.kicker, color: ink, opacity: o });

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {/* the four antibodies — dashed until one is proven in a trial */}
        {FA.xs.map((x, i) => {
          const t0 = tFour + i * 130;
          const d = BACK(k(t0, 300));
          const o = k(t0, 120);
          if (o <= 0) return null;
          const chosen = i === FA.chosen;
          const y0 = FA.rowY - 140 * (1 - d);
          if (chosen) {
            const sc = lerp(FA.scale, 0.9, lift);
            const x1 = lerp(x, FA.nodes[0], travel);
            const y1 = lerp(lerp(y0, FA.rowY - 20, lift), FA.onTrack.y, travel);
            const s1 = lerp(sc, FA.onTrack.scale, travel);
            return (
              <g key={i} transform={`translate(${x1} ${y1}) scale(${s1})`} opacity={o}>
                <g opacity={1 - solid}><YGlyph color={ink} tips={["round", "round"]} dashed /></g>
                <g opacity={solid}><YGlyph color={red} tips={["round", "round"]} /></g>
              </g>
            );
          }
          return (
            <g key={i} transform={`translate(${x} ${y0}) scale(${FA.scale})`} opacity={o * lerp(1, 0.2, recede)}>
              <YGlyph color={ink} tips={["round", "round"]} dashed />
            </g>
          );
        })}

        {/* the bracket under all four */}
        {bracket > 0 ? (
          <path d={`M 110 ${FA.bracketY - 26} L 110 ${FA.bracketY} L ${lerp(110, 970, bracket)} ${FA.bracketY}${bracket >= 1 ? ` L 970 ${FA.bracketY - 26}` : ""}`}
            fill="none" stroke={ink} strokeWidth={5} strokeLinejoin="round" />
        ) : null}

        {/* the Phase 1-2-3 track */}
        {draw > 0 ? (
          <g>
            <line x1={FA.nodes[0]} y1={FA.trackY} x2={lerp(FA.nodes[0], FA.nodes[2], draw)} y2={FA.trackY} stroke={inkA(0.35)} strokeWidth={6} strokeDasharray="14 12" />
            {FA.nodes.map((nx, i) => {
              const o = k(tPhase + i * 180, 160);
              return (
                <g key={i} opacity={o}>
                  <circle cx={nx} cy={FA.trackY} r={24} fill={COLORS.paper} stroke={i === 0 ? ink : inkA(0.35)} strokeWidth={6} strokeDasharray={i === 0 ? undefined : "8 7"} />
                  {i === 0 ? <circle cx={nx} cy={FA.trackY} r={24 * node1} fill={red} /> : null}
                </g>
              );
            })}
            {ring > 0 && ring < 1 ? <circle cx={FA.nodes[0]} cy={FA.trackY} r={28 + ring * 70} fill="none" stroke={red} strokeWidth={6 * (1 - ring)} opacity={1 - ring} /> : null}
          </g>
        ) : null}
      </svg>

      {/* bracket labels */}
      {bracket > 0 ? (
        <div style={{ position: "absolute", left: 110, right: 110, top: FA.bracketY + 22, textAlign: "center", opacity: bracket }}>
          <span style={label(k(tStage, 200))}>{stage.label}</span>
          <span style={label(areaO)}>{" · "}{area.label}</span>
        </div>
      ) : null}

      {/* phase labels */}
      {phase.labels.map((l, i) => (
        <div key={i} style={{ position: "absolute", left: FA.nodes[i], top: FA.trackY + 44, transform: "translateX(-50%)", whiteSpace: "nowrap",
          ...label(k(tPhase + i * 180, 160) * (i === 0 ? 1 : 0.45)) }}>
          {l}
        </div>
      ))}

      {/* the indication tag, beside the antibody on Phase 1 */}
      {tagO > 0 ? (
        <div style={{ position: "absolute", left: FA.tag.x, top: FA.tag.y, transform: `translateY(-50%) scale(${tagS})`, transformOrigin: "left center", opacity: tagO,
          padding: "16px 34px", borderRadius: 999, background: ink, color: COLORS.paper, fontFamily: DISPLAY, fontWeight: 700, fontSize: 56, letterSpacing: TRACK.headline }}>
          {indication.label}
        </div>
      ) : null}

      <Phrase from={tLead} to={tTurn} line={lead.text} top={FA.lineTop} size={62} color={ink} restColor={inkA(0.4)} restWeight={700} emphasize={lead.emphasize} empColor={ink} />
      <Phrase from={tTurn} to={to + 400} line={turn.text} top={FA.lineTop} size={62} color={ink} restColor={inkA(0.4)} restWeight={700} emphasize={turn.emphasize} empColor={ink} />
    </AbsoluteFill>
  );
};
