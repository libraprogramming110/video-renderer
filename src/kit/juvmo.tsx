// ─────────────────────────────────────────────────────────────────────────
// KIT · juvmo — ONE DEAL, TWO DRUGS. Added on the AbbVie Juvmo long-form,
// 2026-10-04 (HORIZONTAL 16:9). Built under the 09-30 one-mover rule: each cue
// gets ONE motion, and anything that has landed goes still.
//
// `DealTracks` (ink, the hook + THE SPINE): "In December 2023, AbbVie agreed to
// buy Cerevel Therapeutics for about $8.7 billion." The buyer lands, an arrow
// draws to the target card, the price counts up as it is voiced. In the pause
// the whole deal DOCKS left (one camera move) and becomes the owner of two
// development tracks. "The drug at the top of that announcement missed in
// Phase 2": a capsule rides the top track to the Phase 2 tick and is struck.
// "A different drug from the same deal has now won FDA approval": the lower
// track draws, a bracket ties both tracks to the one price, and on "won" the
// lower capsule runs the whole track in red and the approval stamps at the end.
// Neither drug is named: the script does not name them until later sections.
// DEAL geometry is exported for the callbacks.
//
// `ApprovalLabel` (white card): the announcement is written word by word, the
// brand name slams, the generic and the indication follow. The name docks left;
// a day ring sweeps once and the tablet drops into it; a levodopa capsule joins
// on "with" and steps back out on "without". Then the company's own description:
// five dopamine receptors, and the drug only seats in D1 and D5; a calendar page
// rises on "available" and the month stamps on it.
//
// Every onset is a spoken word with an optional ms pin, clamped monotonic.
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, Easing, interpolate, interpolateColors } from "remotion";
import { CLAMP, clamp01, COLORS, cue, DISPLAY, inkA, INK_SUB, TRACK, useMs } from "./core";
import { TYPE } from "../style";
import { FlowLine } from "./flowline";
import { at, lerp, useK, type Cued, type Win } from "./elora";

const EASE = Easing.out(Easing.cubic);
const EASE_IO = Easing.inOut(Easing.cubic);
const BACK = Easing.out(Easing.back(1.7));

const W = 1920;
const H = 1080;

/** A narration line that owns a window, centred in a column (default: the frame). */
const Line: React.FC<{ from: number; to: number; text: string; top: number; size: number; color: string; restColor?: string; restWeight?: number; emphasize?: string; empColor?: string; underline?: string; left?: number; width?: number }> = ({
  from, to, text, top, size, color, restColor, restWeight, emphasize, empColor, underline, left = 130, width = W - 260,
}) => {
  const ms = useMs();
  const o = clamp01(interpolate(ms, [from - 80, from, to - 220, to], [0, 1, 1, 0], CLAMP));
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left, width, top, opacity: o }}>
      <FlowLine from={from} to={to} line={text} size={size} color={color} restColor={restColor} restWeight={restWeight} emphasize={emphasize} empColor={empColor} underline={underline} lineHeight={1.12} align="center" />
    </div>
  );
};

/** A two-tone capsule centred on (0,0). */
export const Capsule: React.FC<{ w?: number; h?: number; color: string; back?: string }> = ({ w = 84, h = 40, color, back }) => (
  <g>
    <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={h / 2} fill={back ?? COLORS.ink} stroke={color} strokeWidth={5} />
    <path d={`M 0 ${-h / 2} H ${-w / 2 + h / 2} A ${h / 2} ${h / 2} 0 0 0 ${-w / 2 + h / 2} ${h / 2} H 0 Z`} fill={color} />
  </g>
);

// ══════════════════════════════════════════════════════════════════════════
// DealTracks — the hook and the spine (ink world)
// ══════════════════════════════════════════════════════════════════════════
export const DEAL = {
  // the deal as a hero: a 1400x560 box centred on the usable frame
  box: { cx: 960, cy: 450, w: 1400, h: 560 },
  // ...and docked: the owner of the two tracks
  dock: { cx: 400, cy: 395, s: 0.4 },
  track: { x0: 800, x1: 1760, ys: [270, 520] as const },
  // where each development stage sits along a track (0..1)
  ticks: [
    { label: "Phase 1", f: 0.2 },
    { label: "Phase 2", f: 0.48 },
    { label: "Phase 3", f: 0.76 },
    { label: "Approval", f: 1 },
  ],
  lineTop: 770,
};
const tickX = (i: number) => lerp(DEAL.track.x0, DEAL.track.x1, DEAL.ticks[i].f);

export const DealTracks: React.FC<Win & {
  date: { label: string } & Cued;
  buyer: { name: string } & Cued;
  arrow: Cued; // "agreed to buy"
  target: { name: string; sub?: string } & Cued;
  figure: { value: number; decimals: number; prefix: string } & Cued; // the count starts
  unit: { label: string } & Cued; // the count lands ("billion")
  dock: Cued; // the deal docks left (a pause)
  lead: { label: string; word?: string; ms?: number; labelWord?: string; runWord?: string }; // the top track
  missed: { tag: string; word?: string; ms?: number; tagWord?: string };
  other: { label: string; word?: string; ms?: number; pillWord?: string }; // the lower track
  same: Cued; // the bracket ties both tracks to the one deal
  won: Cued; // the lower capsule runs the track
  stamp: { label: string } & Cued; // lands at the end of the track
  lines: { text: string; emphasize?: string; word?: string; ms?: number }[]; // two narration lines
}> = ({ from, to, date, buyer, arrow, target, figure, unit, dock, lead, missed, other, same, won, stamp, lines }) => {
  const ms = useMs();
  const k = useK();
  const WH = COLORS.paper;
  const R = COLORS.accent;
  const T = DEAL.track;
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));

  const tDate = at(date, from, from);
  const tBuyer = at(buyer, tDate + 1800, from, tDate + 300);
  const tArrow = at(arrow, tBuyer + 300, from, tBuyer + 200);
  const tTarget = at(target, tArrow + 800, from, tArrow + 300);
  const tFig = at(figure, tTarget + 1800, from, tTarget + 500);
  const tUnit = at(unit, tFig + 1200, from, tFig + 500);
  const tDock = at(dock, tUnit + 1000, from, tUnit + 500);
  const tLead = at(lead, tDock + 700, from, tDock + 500);
  const tLeadLabel = Math.max(tLead + 250, cue(lead.labelWord, tLead + 500, from));
  const tRun = Math.max(tLeadLabel + 200, cue(lead.runWord, tLeadLabel + 400, from));
  const tMiss = at(missed, tRun + 1500, from, tRun + 800);
  const tMissTag = Math.max(tMiss + 300, cue(missed.tagWord, tMiss + 600, from));
  const tOther = at(other, tMissTag + 900, from, tMissTag + 500);
  const tPill = Math.max(tOther + 450, cue(other.pillWord, tOther + 900, from));
  const tSame = at(same, tPill + 350, from, tPill + 250);
  const tWon = at(won, tSame + 2000, from, tSame + 700);
  const tStamp = at(stamp, tWon + 470, from, tWon + 380);

  // ── phase A: the deal as a hero
  const buyerO = k(tBuyer, 140);
  const buyerX = (1 - EASE(k(tBuyer, 380))) * -60;
  const arrowQ = EASE_IO(k(tArrow, 520));
  const targetO = k(tTarget, 120);
  const targetS = interpolate(ms, [tTarget, tTarget + 300], [1.18, 1], { ...CLAMP, easing: EASE });
  const countQ = EASE(k(tFig, tUnit - tFig));
  const figO = k(tFig - 40, 140);
  const figPop = interpolate(ms, [tUnit - 80, tUnit + 220], [1.05, 1], { ...CLAMP, easing: EASE });
  const unitO = k(tUnit, 140);
  const shown = (countQ * figure.value).toLocaleString("en-US", { minimumFractionDigits: figure.decimals, maximumFractionDigits: figure.decimals });

  // ── the dock: one camera move, then the deal is still
  const dq = EASE_IO(k(tDock, 620));
  const gx = lerp(0, DEAL.dock.cx - DEAL.box.cx, dq);
  const gy = lerp(0, DEAL.dock.cy - DEAL.box.cy, dq);
  const gs = lerp(1, DEAL.dock.s, dq);

  // ── phase B: the two tracks
  const draw1 = EASE_IO(k(tLead, 450));
  const label1 = k(tLeadLabel, 180);
  const run1 = EASE_IO(k(tRun, Math.max(600, tMiss - 60 - tRun)));
  const x1 = lerp(T.x0, tickX(1), run1);
  const pill1 = k(tLead + 150, 160);
  const missQ = k(tMiss, 250);
  const missS = interpolate(ms, [tMiss, tMiss + 250], [1.7, 1], { ...CLAMP, easing: EASE });
  const dim = interpolateColors(missQ, [0, 1], [WH, "rgba(255,255,255,0.38)"]);
  const missTag = k(tMissTag, 160);

  const draw2 = EASE_IO(k(tOther, 450));
  const label2 = k(tOther + 250, 180);
  const pill2 = k(tPill, 160);
  const bracket = EASE_IO(k(tSame, 520));
  const run2 = EASE_IO(k(tWon, Math.max(320, tStamp - 40 - tWon)));
  const x2 = lerp(T.x0, T.x1, run2);
  const stampO = k(tStamp, 110);
  const stampS = interpolate(ms, [tStamp, tStamp + 280], [1.55, 1], { ...CLAMP, easing: EASE });

  const B = DEAL.box;
  const dockRight = DEAL.dock.cx + (B.w * DEAL.dock.s) / 2 + 10; // 690: the docked deal's right edge
  const midY = (T.ys[0] + T.ys[1]) / 2;

  const tickLabel = (i: number, y: number, q: number, lit?: boolean) => {
    const o = clamp01((q - DEAL.ticks[i].f) * 8 + 1);
    return (
      <div key={`${y}-${i}`} style={{ position: "absolute", left: tickX(i) - 100, width: 200, top: y + 34, textAlign: i === 3 ? "right" : "center", paddingRight: i === 3 ? 100 : 0, boxSizing: "border-box", opacity: o,
        fontFamily: DISPLAY, fontWeight: 700, fontSize: TYPE.labelSm, letterSpacing: TRACK.kicker, color: lit ? WH : INK_SUB, whiteSpace: "nowrap" }}>
        {DEAL.ticks[i].label}
      </div>
    );
  };

  if (ms < tDate - 60) return null;
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {/* ── the deal: hero, then docked ── */}
      <div style={{ position: "absolute", left: B.cx - B.w / 2, top: B.cy - B.h / 2, width: B.w, height: B.h, transform: `translate(${gx}px, ${gy}px) scale(${gs})`,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 34 }}>
        <div style={{ opacity: k(tDate, 200) * (1 - dq), fontFamily: DISPLAY, fontWeight: 700, fontSize: 38, letterSpacing: TRACK.kicker, color: INK_SUB }}>{date.label}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 44 }}>
          <div style={{ opacity: buyerO, transform: `translateX(${buyerX}px)`, fontFamily: DISPLAY, fontWeight: 700, fontSize: 120, letterSpacing: TRACK.display, color: WH, lineHeight: 1 }}>{buyer.name}</div>
          <svg width={150} height={50} style={{ overflow: "visible", flex: "none" }}>
            <path d="M 4 25 H 132" stroke={WH} strokeWidth={8} strokeLinecap="round" fill="none" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - arrowQ} />
            <path d="M 112 5 L 138 25 L 112 45" stroke={WH} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={clamp01(arrowQ * 4 - 3)} />
          </svg>
          <div style={{ opacity: targetO, transform: `scale(${targetS})`, background: WH, borderRadius: 24, padding: "22px 44px 24px", textAlign: "left" }}>
            <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 104, letterSpacing: TRACK.display, color: COLORS.ink, lineHeight: 1 }}>{target.name}</div>
            {target.sub ? <div style={{ marginTop: 6, fontFamily: DISPLAY, fontWeight: 700, fontSize: 32, letterSpacing: TRACK.kicker, color: inkA(0.55) }}>{target.sub}</div> : null}
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 30, transform: `scale(${ms >= tUnit - 80 ? figPop : 1})` }}>
          <div style={{ opacity: figO, fontFamily: DISPLAY, fontWeight: 700, fontSize: 250, letterSpacing: TRACK.display, color: WH, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
            {figure.prefix}{shown}
          </div>
          <div style={{ opacity: unitO, fontFamily: DISPLAY, fontWeight: 700, fontSize: 112, letterSpacing: TRACK.display, color: WH, lineHeight: 1 }}>{unit.label}</div>
        </div>
      </div>

      {/* ── the two tracks ── */}
      {ms >= tLead - 20 ? (
        <>
          <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
            {/* the bracket: both tracks hang off the one deal */}
            {bracket > 0 ? (
              <g fill="none" stroke={WH} strokeOpacity={0.55} strokeWidth={4} strokeLinejoin="round">
                <path d={`M ${dockRight} ${midY} H ${dockRight + 45} V ${T.ys[0]} H ${T.x0 - 22}`} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - bracket} />
                <path d={`M ${dockRight + 45} ${midY} V ${T.ys[1]} H ${T.x0 - 22}`} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - bracket} />
              </g>
            ) : null}

            {/* top track: reaches Phase 2 and is struck */}
            <line x1={T.x0} y1={T.ys[0]} x2={lerp(T.x0, T.x1, draw1)} y2={T.ys[0]} stroke="rgba(255,255,255,0.26)" strokeWidth={6} strokeLinecap="round" />
            {DEAL.ticks.map((t, i) => (draw1 >= t.f ? <circle key={i} cx={tickX(i)} cy={T.ys[0]} r={9} fill={COLORS.ink} stroke="rgba(255,255,255,0.5)" strokeWidth={4} /> : null))}
            {pill1 > 0 ? (
              <>
                <line x1={T.x0} y1={T.ys[0]} x2={x1} y2={T.ys[0]} stroke={dim} strokeWidth={10} strokeLinecap="round" />
                {missQ <= 0 ? <g transform={`translate(${x1} ${T.ys[0]})`} opacity={pill1}><Capsule color={WH} /></g> : null}
              </>
            ) : null}
            {missQ > 0 ? (
              <g transform={`translate(${tickX(1)} ${T.ys[0]}) scale(${missS})`} opacity={clamp01(missQ * 3)} stroke={WH} strokeWidth={10} strokeLinecap="round">
                <line x1={-24} y1={-24} x2={24} y2={24} />
                <line x1={24} y1={-24} x2={-24} y2={24} />
              </g>
            ) : null}

            {/* lower track: runs to approval */}
            {draw2 > 0 ? (
              <>
                <line x1={T.x0} y1={T.ys[1]} x2={lerp(T.x0, T.x1, draw2)} y2={T.ys[1]} stroke="rgba(255,255,255,0.26)" strokeWidth={6} strokeLinecap="round" />
                {DEAL.ticks.map((t, i) => (draw2 >= t.f ? <circle key={i} cx={tickX(i)} cy={T.ys[1]} r={9} fill={COLORS.ink} stroke="rgba(255,255,255,0.5)" strokeWidth={4} /> : null))}
              </>
            ) : null}
            {pill2 > 0 ? (
              <>
                {run2 > 0 ? <line x1={T.x0} y1={T.ys[1]} x2={x2} y2={T.ys[1]} stroke={R} strokeWidth={10} strokeLinecap="round" /> : null}
                <g transform={`translate(${x2} ${T.ys[1]})`} opacity={pill2}><Capsule color={WH} /></g>
              </>
            ) : null}
          </svg>

          {/* track kickers */}
          <div style={{ position: "absolute", left: T.x0, top: T.ys[0] - 80, opacity: label1, fontFamily: DISPLAY, fontWeight: 700, fontSize: TYPE.label, letterSpacing: TRACK.kicker, color: missQ > 0 ? dim : WH, whiteSpace: "nowrap" }}>{lead.label}</div>
          <div style={{ position: "absolute", left: T.x0, top: T.ys[1] - 80, opacity: label2, fontFamily: DISPLAY, fontWeight: 700, fontSize: TYPE.label, letterSpacing: TRACK.kicker, color: WH, whiteSpace: "nowrap" }}>{other.label}</div>
          {DEAL.ticks.map((_, i) => tickLabel(i, T.ys[0], draw1))}
          {draw2 > 0 ? DEAL.ticks.map((_, i) => tickLabel(i, T.ys[1], draw2, i === 3 && stampO > 0)) : null}

          {/* the miss, named */}
          {missTag > 0 ? (
            <div style={{ position: "absolute", left: tickX(1) + 46, top: T.ys[0] - 84, opacity: missTag, transform: `translateY(${(1 - missTag) * 10}px)`, fontFamily: DISPLAY, fontWeight: 700, fontSize: 34, letterSpacing: TRACK.headline, color: WH, whiteSpace: "nowrap" }}>
              {missed.tag}
            </div>
          ) : null}

          {/* the approval, stamped at the end of the lower track */}
          {stampO > 0 ? (
            <div style={{ position: "absolute", right: W - T.x1 - 42, top: T.ys[1] - 118, opacity: stampO, transform: `scale(${stampS}) rotate(-3deg)`, transformOrigin: "right center", background: R, borderRadius: 14, padding: "10px 28px 12px",
              fontFamily: DISPLAY, fontWeight: 700, fontSize: 44, letterSpacing: TRACK.headline, color: WH, lineHeight: 1, whiteSpace: "nowrap" }}>
              {stamp.label}
            </div>
          ) : null}

          {lines.map((l, i) => {
            const t0 = at(l, [tLead, tOther][i] ?? from, from);
            const t1 = i === 0 ? tOther - 60 : to + 400;
            return <Line key={i} from={t0} to={t1} text={l.text} top={DEAL.lineTop} size={48} color={WH} restColor={INK_SUB} restWeight={700} emphasize={l.emphasize} empColor={WH} />;
          })}
        </>
      ) : null}
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// ApprovalLabel — the announcement, the tablet, the receptors (white card)
// ══════════════════════════════════════════════════════════════════════════
export const LABEL = {
  box: { cx: 960, cy: 490, w: 1200, h: 660 }, // the announcement as a hero
  dock: { cx: 500, cy: 320, s: 0.52 }, // ...docked top-left
  right: { left: 880, width: 920 }, // the working column once the name has docked
  dose: { cx: 1340, cy: 400, r: 190 },
  cups: { xs: [980, 1160, 1340, 1520, 1700], y: 430 },
  page: { cx: 500, top: 640, w: 320, h: 250 },
};

export const ApprovalLabel: React.FC<Win & {
  announce: { text: string; emphasize: string } & Cued; // written word by word
  name: { label: string } & Cued; // the brand name slams
  generic: { label: string } & Cued;
  indication: { lead: string; label: string; word?: string; ms?: number; labelWord?: string };
  dock: Cued; // the name docks left (a pause)
  daily: Cued; // the day ring sweeps once
  tablet: Cued; // the tablet drops into it
  dose: { text: string; emphasize?: string };
  withIt: Cued; // the levodopa capsule joins
  without: Cued; // ...and steps back out
  combo: { text: string; emphasize?: string; label: string };
  clear: Cued; // the dose scene retires (a pause)
  claim: { kicker: string; text: string; word?: string; ms?: number; textWord?: string }; // attributed to the company
  receptors: { labels: string[]; hits: number[] } & Cued; // the row draws
  seats: Cued[]; // one onset per hit
  mechanism: { text: string; emphasize?: string };
  expects: { kicker: string } & Cued;
  page: Cued; // the calendar page rises
  where: { label: string } & Cued;
  month: { label: string } & Cued;
}> = ({ from, to, announce, name, generic, indication, dock, daily, tablet, dose, withIt, without, combo, clear, claim, receptors, seats, mechanism, expects, page, where, month }) => {
  const ms = useMs();
  const k = useK();
  const INK = COLORS.ink;
  const R = COLORS.accent;
  const WH = COLORS.paper;
  const SUB = COLORS.grayText;
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));

  const tAnn = at(announce, from, from);
  const tName = at(name, tAnn + 4000, from, tAnn + 800);
  const tGen = at(generic, tName + 500, from, tName + 300);
  const tInd = at(indication, tGen + 1000, from, tGen + 400);
  const tIndLabel = Math.max(tInd + 300, cue(indication.labelWord, tInd + 800, from));
  const tDock = at(dock, tIndLabel + 1200, from, tIndLabel + 700);
  const tDaily = at(daily, tDock + 700, from, tDock + 500);
  const tTablet = at(tablet, tDaily + 800, from, tDaily + 500);
  const tWith = at(withIt, tTablet + 900, from, tTablet + 450);
  const tWithout = at(without, tWith + 600, from, tWith + 400);
  const tClear = at(clear, tWithout + 1300, from, tWithout + 900);
  const tClaim = at(claim, tClear + 450, from, tClear + 300);
  const tClaimText = Math.max(tClaim + 300, cue(claim.textWord, tClaim + 1400, from));
  const tCups = at(receptors, tClaimText + 1000, from, tClaimText + 500);
  const tSeats = seats.reduce<number[]>((acc, s, i) => [...acc, at(s, (acc[i - 1] ?? tCups) + 700, from, (acc[i - 1] ?? tCups) + 400)], []);
  const tExpects = at(expects, tSeats[tSeats.length - 1] + 3000, from, tSeats[tSeats.length - 1] + 1200);
  const tPage = at(page, tExpects + 900, from, tExpects + 400);
  const tWhere = at(where, tPage + 1000, from, tPage + 450);
  const tMonth = at(month, tWhere + 500, from, tWhere + 300);

  // ── the announcement: hero, then docked
  const nameO = k(tName, 110);
  const nameS = interpolate(ms, [tName, tName + 300], [1.2, 1], { ...CLAMP, easing: EASE });
  const genO = k(tGen, 180);
  const indO = k(tInd, 160);
  const indLabelO = k(tIndLabel, 160);
  const dq = EASE_IO(k(tDock, 620));
  const B = LABEL.box;
  const gx = lerp(0, LABEL.dock.cx - B.cx, dq);
  const gy = lerp(0, LABEL.dock.cy - B.cy, dq);
  const gs = lerp(1, LABEL.dock.s, dq);

  // ── the dose
  const D = LABEL.dose;
  const doseO = 1 - k(tClear, 300);
  const sweep = EASE_IO(k(tDaily, Math.max(400, tTablet - 80 - tDaily)));
  const dropQ = k(tTablet, 380);
  const tabS = BACK(dropQ);
  const tabY = (1 - EASE(dropQ)) * -260;
  const withQ = EASE(k(tWith, 360));
  const outQ = EASE_IO(k(tWithout, 380));
  const capX = D.cx + D.r + 150 + (1 - withQ) * 220 + outQ * 46;
  const capO = withQ * lerp(1, 0.3, outQ);
  const CIRC = 2 * Math.PI * D.r;

  // ── the description
  const C = LABEL.cups;
  const cupsQ = k(tCups, 520);
  const seatQ = tSeats.map((t) => k(t, 340));

  // ── availability
  const P = LABEL.page;
  const pageQ = EASE(k(tPage, 420));
  const monthO = k(tMonth, 110);
  const monthS = interpolate(ms, [tMonth, tMonth + 280], [1.35, 1], { ...CLAMP, easing: EASE });

  if (ms < tAnn - 60) return null;
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {/* ── the announcement ── */}
      <div style={{ position: "absolute", left: B.cx - B.w / 2, top: B.cy - B.h / 2, width: B.w, height: B.h, transform: `translate(${gx}px, ${gy}px) scale(${gs})`,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 1100, opacity: 1 - dq }}>
          <FlowLine from={tAnn} to={tName} line={announce.text} size={50} color={INK} restColor={SUB} restWeight={700} emphasize={announce.emphasize} empColor={R} lineHeight={1.16} align="center" />
        </div>
        <div style={{ marginTop: 26, opacity: nameO, transform: `scale(${nameS})`, fontFamily: DISPLAY, fontWeight: 700, fontSize: 300, letterSpacing: TRACK.display, color: INK, lineHeight: 0.98 }}>{name.label}</div>
        <div style={{ marginTop: 4, opacity: genO, transform: `translateY(${(1 - genO) * 14}px)`, fontFamily: DISPLAY, fontWeight: 400, fontSize: 92, letterSpacing: TRACK.headline, color: SUB, lineHeight: 1.05 }}>{generic.label}</div>
        <div style={{ marginTop: 30, display: "flex", gap: 14, fontFamily: DISPLAY, fontWeight: 700, fontSize: 50, letterSpacing: TRACK.headline, lineHeight: 1.1, whiteSpace: "nowrap" }}>
          <span style={{ opacity: indO, color: SUB }}>{indication.lead}</span>
          <span style={{ opacity: indLabelO, color: INK }}>{indication.label}</span>
        </div>
      </div>

      {/* ── the dose: a day, a tablet, with or without ── */}
      {ms >= tDaily - 20 && doseO > 0 ? (
        <div style={{ position: "absolute", inset: 0, opacity: doseO }}>
          <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
            <circle cx={D.cx} cy={D.cy} r={D.r} fill="none" stroke={inkA(0.12)} strokeWidth={10} />
            <circle cx={D.cx} cy={D.cy} r={D.r} fill="none" stroke={INK} strokeWidth={10} strokeLinecap="round" strokeDasharray={`${CIRC * sweep} ${CIRC}`} transform={`rotate(-90 ${D.cx} ${D.cy})`} />
            {dropQ > 0 ? (
              <g transform={`translate(${D.cx} ${D.cy + tabY}) scale(${tabS})`}>
                <circle r={118} fill={R} />
                <circle r={96} fill="none" stroke={WH} strokeOpacity={0.35} strokeWidth={5} />
                <line x1={-74} y1={0} x2={74} y2={0} stroke={WH} strokeWidth={9} strokeLinecap="round" />
              </g>
            ) : null}
            {withQ > 0 ? (
              <g transform={`translate(${capX} ${D.cy})`} opacity={capO}><Capsule w={190} h={78} color={INK} back={WH} /></g>
            ) : null}
          </svg>
          {withQ > 0 ? (
            <div style={{ position: "absolute", left: capX - 120, width: 240, top: D.cy + 58, textAlign: "center", opacity: capO, fontFamily: DISPLAY, fontWeight: 700, fontSize: TYPE.label, letterSpacing: TRACK.kicker, color: INK }}>{combo.label}</div>
          ) : null}
          <Line from={tDaily} to={tClear + 300} text={dose.text} top={D.cy + D.r + 44} size={58} color={INK} emphasize={dose.emphasize} empColor={INK} restColor={INK} left={D.cx - 380} width={760} />
          <Line from={tWith - 400} to={tClear + 300} text={combo.text} top={D.cy + D.r + 124} size={44} color={INK} restColor={SUB} restWeight={700} emphasize={combo.emphasize} empColor={INK} left={D.cx - 440} width={880} />
        </div>
      ) : null}

      {/* ── the company's description: five receptors, two seats ── */}
      {ms >= tClaim - 20 ? (
        <>
          <div style={{ position: "absolute", left: LABEL.right.left, width: LABEL.right.width, top: 118, textAlign: "center", opacity: k(tClaim, 180), fontFamily: DISPLAY, fontWeight: 700, fontSize: 32, letterSpacing: TRACK.kicker, color: SUB }}>{claim.kicker}</div>
          <Line from={tClaimText} to={to + 400} text={claim.text} top={166} size={92} color={INK} left={LABEL.right.left} width={LABEL.right.width} />
          <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
            {C.xs.map((x, i) => {
              const q = EASE(clamp01(cupsQ * 2.2 - i * 0.3));
              if (q <= 0) return null;
              const h = receptors.hits.indexOf(i);
              const s = h >= 0 ? seatQ[h] : 0;
              const stroke = h >= 0 ? interpolateColors(s, [0, 1], [inkA(0.3), INK]) : inkA(0.3);
              return (
                <g key={i} transform={`translate(${x} ${C.y + (1 - q) * 30})`} opacity={q}>
                  <path d="M -58 -50 V 6 A 58 58 0 0 0 58 6 V -50" fill="none" stroke={stroke} strokeWidth={9} strokeLinecap="round" />
                  {s > 0 ? <circle cx={0} cy={6 - (1 - BACK(s)) * 120} r={41} fill={R} opacity={clamp01(s * 4)} /> : null}
                </g>
              );
            })}
          </svg>
          {C.xs.map((x, i) => {
            const q = clamp01(cupsQ * 2.2 - i * 0.3);
            const h = receptors.hits.indexOf(i);
            const s = h >= 0 ? seatQ[h] : 0;
            return (
              <div key={i} style={{ position: "absolute", left: x - 60, width: 120, top: C.y + 84, textAlign: "center", opacity: q, fontFamily: DISPLAY, fontWeight: 700, fontSize: 38, letterSpacing: TRACK.headline, color: s > 0.5 ? INK : inkA(0.38) }}>
                {receptors.labels[i]}
              </div>
            );
          })}
          <Line from={tCups} to={to + 400} text={mechanism.text} top={C.y + 168} size={50} color={INK} restColor={SUB} restWeight={700} emphasize={mechanism.emphasize} empColor={R} left={LABEL.right.left} width={LABEL.right.width} />
        </>
      ) : null}

      {/* ── availability: a calendar page under the docked name ── */}
      {ms >= tExpects - 20 ? (
        <>
          <div style={{ position: "absolute", left: P.cx - 260, width: 520, top: P.top - 62, textAlign: "center", opacity: k(tExpects, 180), fontFamily: DISPLAY, fontWeight: 700, fontSize: 32, letterSpacing: TRACK.kicker, color: SUB }}>{expects.kicker}</div>
          {pageQ > 0 ? (
            <div style={{ position: "absolute", left: P.cx - P.w / 2, top: P.top + (1 - pageQ) * 50, width: P.w, height: P.h, opacity: clamp01(pageQ * 2), border: `6px solid ${INK}`, borderRadius: 22, overflow: "hidden", background: WH, boxSizing: "border-box" }}>
              <div style={{ height: 58, background: INK, display: "flex", alignItems: "center", justifyContent: "center", gap: 120 }}>
                <span style={{ width: 20, height: 20, borderRadius: 20, background: WH }} />
                <span style={{ width: 20, height: 20, borderRadius: 20, background: WH }} />
              </div>
              <div style={{ marginTop: 26, textAlign: "center", opacity: k(tWhere, 160), fontFamily: DISPLAY, fontWeight: 700, fontSize: TYPE.label, letterSpacing: TRACK.kicker, color: SUB }}>{where.label}</div>
              <div style={{ marginTop: 12, textAlign: "center", opacity: monthO, transform: `scale(${monthS})`, fontFamily: DISPLAY, fontWeight: 700, fontSize: 76, letterSpacing: TRACK.display, color: INK, lineHeight: 1 }}>{month.label}</div>
            </div>
          ) : null}
        </>
      ) : null}
    </AbsoluteFill>
  );
};
