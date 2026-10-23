// ─────────────────────────────────────────────────────────────────────────
// KIT · clock — A PLATFORM AS MUCH AS REVENUE, AND THE CLOCK ON THE REVENUE.
// Added on the Viatris x Pacira HORIZONTAL long-form, 2026-10-14 (16:9; absolute
// 1920x1080 coordinates, not portrait-safe as written). One-mover rule and the
// frame budget: each cue gets ONE motion, a finished idea retires.
//
// `PlatformBalance` (white card) — "as much as" enacted as a SEESAW: the spine's
//   team lands on one end and the beam tips; revenue lands on the other and the
//   beam comes back level. A red clock stamps onto the revenue and its hand
//   sweeps once, then holds still.
// `GenericClock` (ink, over a FootageScrim) — a TRUE-TIME year axis (one tick a
//   year). The settlement year, a dashed licensed-generics chip (unnamed =
//   dashed), the product's band to the entry year and dashed beyond it (after
//   that, nothing is measured); the chip travels to the entry year. Two more
//   dashed applicants under a litigation tag (the script gives "two").
// `SustainSynergy` (white card) — an IP shield, a sales line that reaches a red
//   "competition arrives" marker and continues DASHED (a plan, not a result);
//   page turn to a counted synergy figure with its period.
//
// Every onset is a spoken word with an optional ms pin, clamped monotonic.
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { CLAMP, clamp01, COLORS, DISPLAY, INK_SUB, inkA, TRACK, useMs } from "./core";
import { TYPE } from "../style";
import { at, lerp, useK, type Cued, type Win } from "./elora";
import { Rep, teamXs } from "./pacira";

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
const rise = (q: number, d = 24) => ({ opacity: q, transform: `translateY(${(1 - EASE(q)) * d}px)` });

type Line = { text: string } & Cued;
type Lbl = { label: string } & Cued;

/** A dashed chip (unnamed / not yet), sized to its label. */
const DashChip: React.FC<{ text: string; color: string; size?: number; style?: React.CSSProperties }> = ({ text, color, size = 30, style }) => (
  <div style={{ height: size * 2.1, padding: `0 ${size * 0.9}px`, boxSizing: "border-box", borderRadius: size * 1.05, border: `4px dashed ${color}`, display: "flex", alignItems: "center", ...label(color, size), ...style }}>
    {text}
  </div>
);

// ══════════════════════════════════════════════════════════════════════════
// PlatformBalance — the seesaw (white card)
// ══════════════════════════════════════════════════════════════════════════
export const BAL = {
  lead: { top: 150, size: 72 },
  pivot: { x: 960, y: 650 },
  beam: { x0: 300, x1: 1620, h: 16 },
  team: { cx: 600, n: 5, h: 140, gap: 18 },
  rev: { cx: 1360, w: 320, h: 180 },
  tilt: 7,
};

export const PlatformBalance: React.FC<Win & {
  lead: Line;
  beam: Cued; // the empty seesaw draws, level
  team: Cued; // the team lands and the beam tips
  teamLabel: Lbl;
  asMuch: Lbl;
  revenue: Lbl; // revenue lands and the beam comes back level
  clock: Cued; // the red clock stamps, its hand sweeps once
}> = ({ from, to, lead, beam, team, teamLabel, asMuch, revenue, clock }) => {
  const ms = useMs();
  const k = useK();
  const INK = COLORS.ink;
  const WH = COLORS.paper;
  const RED = COLORS.accent;
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));

  const tLead = at(lead, from, from);
  const tBeam = at(beam, tLead + 700, from, tLead + 300);
  const tTeam = at(team, tBeam + 500, from, tBeam + 300);
  const tTL = at(teamLabel, tTeam + 600, from, tTeam + 300);
  const tAs = at(asMuch, tTL + 500, from, tTL + 200);
  const tRev = at(revenue, tAs + 1000, from, tAs + 300);
  const tClock = at(clock, tRev + 1800, from, tRev + 400);

  const P = BAL.pivot;
  const Bm = BAL.beam;
  const Tm = BAL.team;
  const R = BAL.rev;
  const bq = EASE_IO(k(tBeam, 520));
  const teamQ = k(tTeam, 420);
  const revQ = k(tRev, 420);
  // tips under the team, levels when the revenue lands ("as much as")
  const angle = -BAL.tilt * EASE_IO(k(tTeam + 250, 500)) * (1 - EASE_IO(k(tRev + 250, 600)));
  const top = P.y - Bm.h / 2;
  const xs = teamXs(Tm.cx, Tm.n, Tm.h, Tm.gap);
  const cq = k(tClock, 300);
  const hand = 360 * EASE_IO(k(tClock + 200, 700));

  if (ms < tLead - 60) return null;
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <div style={{ position: "absolute", left: 0, width: 1920, top: BAL.lead.top, textAlign: "center", ...big(INK, BAL.lead.size), ...rise(k(tLead, 260)) }}>{lead.text}</div>
      <div style={{ position: "absolute", left: 0, width: 1920, top: 400, textAlign: "center", ...label(inkA(0.6), 40), ...rise(k(tAs, 240), 14) }}>{asMuch.label}</div>

      {/* the fulcrum */}
      <svg style={{ position: "absolute", left: 0, top: 0, opacity: clamp01(bq * 3) }} width={1920} height={1080}>
        <path d={`M ${P.x} ${P.y + 8} L ${P.x - 110} 860 L ${P.x + 110} 860 Z`} fill={INK} />
      </svg>

      {/* the beam and everything standing on it */}
      <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, transformOrigin: `${P.x}px ${P.y}px`, transform: `rotate(${angle}deg)` }}>
        <div style={{ position: "absolute", left: lerp(P.x, Bm.x0, bq), top, width: (Bm.x1 - Bm.x0) * bq, height: Bm.h, borderRadius: 8, background: INK }} />
        {teamQ > 0 ? xs.map((x, i) => <Rep key={i} cx={x} bottom={top} h={Tm.h} color={INK} opacity={clamp01(teamQ * 3)} dy={(1 - BACK(teamQ)) * -90} />) : null}
        <div style={{ position: "absolute", left: Tm.cx - 300, width: 600, top: top + 40, textAlign: "center", ...big(INK, 44), ...rise(k(tTL, 240), 14) }}>{teamLabel.label}</div>
        {revQ > 0 ? (
          <div style={{ position: "absolute", left: R.cx - R.w / 2, top: top - R.h - (1 - BACK(revQ)) * 90, width: R.w, height: R.h, borderRadius: 22, background: INK, opacity: clamp01(revQ * 3), display: "flex", alignItems: "center", justifyContent: "center", ...big(WH, 56) }}>
            {revenue.label}
            {cq > 0 ? (
              <svg style={{ position: "absolute", right: -46, top: -56, ...stamp(cq, 1.6) }} width={124} height={124} viewBox="0 0 124 124">
                <circle cx={62} cy={62} r={56} fill={RED} />
                <circle cx={62} cy={62} r={44} fill="none" stroke={WH} strokeWidth={6} />
                <line x1={62} y1={62} x2={62} y2={30} stroke={WH} strokeWidth={7} strokeLinecap="round" transform={`rotate(${hand} 62 62)`} />
                <circle cx={62} cy={62} r={6} fill={WH} />
              </svg>
            ) : null}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// GenericClock — the settlement, the entry year, the litigation (ink, footage)
// ══════════════════════════════════════════════════════════════════════════
export const GEN = {
  axis: { y: 600, x0: 200, x1: 1720, year0: 2025, x2025: 300, perYear: 220, years: 6 },
  band: { y: 440, h: 76 },
  yearLabel: 630,
  chip: { top: 720, left: 240 },
  lit: { top: 760, label: 700, left: 240 },
};
const yearX = (y: number) => GEN.axis.x2025 + (y - GEN.axis.year0) * GEN.axis.perYear;

export const GenericClock: React.FC<Win & {
  axis: Cued; // the year axis draws
  settle: { year: number } & Cued; // the settlement year's node
  settleLabel: Lbl;
  licensed: Lbl; // the dashed generics chip
  limited: Lbl; // its qualifier
  band: Cued; // the product's band draws to the entry year
  bandLabel: Lbl;
  entry: { year: number; label: string } & Cued; // the red entry node
  travel: Cued; // the chip travels to the entry year, the band runs on dashed
  report: Lbl;
  litigation: Lbl;
  applicants: [Line, Line]; // two dashed applicants
}> = ({ from, to, axis, settle, settleLabel, licensed, limited, band, bandLabel, entry, travel, report, litigation, applicants }) => {
  const ms = useMs();
  const k = useK();
  const WH = COLORS.paper;
  const RED = COLORS.accent;
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));

  const tAxis = at(axis, from, from);
  const tSet = at(settle, tAxis + 600, from, tAxis + 300);
  const tSetL = at(settleLabel, tSet + 700, from, tSet + 200);
  const tLic = at(licensed, tSetL + 1100, from, tSetL + 300);
  const tLim = at(limited, tLic + 2000, from, tLic + 400);
  const tBand = at(band, tLim + 2000, from, tLim + 400);
  const tBL = at(bandLabel, tBand + 800, from, tBand + 400);
  const tEntry = at(entry, tBL + 1600, from, tBL + 400);
  const tTravel = at(travel, tEntry + 400, from, tEntry + 250);
  const tRep = at(report, tTravel + 1600, from, tTravel + 600);
  const tLit = at(litigation, tRep + 2000, from, tRep + 400);
  const tA1 = at(applicants[0], tLit + 900, from, tLit + 300);
  const tA2 = at(applicants[1], tA1 + 200, from, tA1 + 150);

  const A = GEN.axis;
  const Bd = GEN.band;
  const xS = yearX(settle.year);
  const xE = yearX(entry.year);
  const aq = EASE_IO(k(tAxis, 700));
  const bandQ = EASE_IO(k(tBand, 800));
  const after = EASE_IO(k(tTravel, 600));
  const tv = EASE_IO(k(tTravel, 700));
  const chipLeft = lerp(GEN.chip.left, xE - 150, tv);

  if (ms < tAxis - 60) return null;
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {/* ── the axis, one tick a year ── */}
      <div style={{ position: "absolute", left: A.x0, top: A.y - 3, width: (A.x1 - A.x0) * aq, height: 6, borderRadius: 3, background: WH }} />
      {Array.from({ length: A.years + 1 }, (_, i) => {
        const x = yearX(A.year0 + i);
        const q = clamp01((aq * (A.x1 - A.x0) - (x - A.x0)) / 40);
        return <div key={i} style={{ position: "absolute", left: x - 2, top: A.y - 14, width: 4, height: 28, background: WH, opacity: q }} />;
      })}

      {/* ── the settlement ── */}
      <div style={{ position: "absolute", left: xS - 22, top: A.y - 22, width: 44, height: 44, borderRadius: 22, background: WH, ...stamp(k(tSet, 280), 1.6) }} />
      <div style={{ position: "absolute", left: xS - 60, top: GEN.yearLabel, display: "flex", gap: 14, alignItems: "baseline" }}>
        <div style={{ ...big(WH, 44), opacity: k(tSet, 200) }}>{settle.year}</div>
        <div style={{ ...label(INK_SUB, 34), opacity: k(tSetL, 220) }}>{settleLabel.label}</div>
      </div>

      {/* ── the product's band: solid to the entry year, dashed after ── */}
      <div style={{ position: "absolute", left: xS, top: Bd.y, width: (xE - xS) * bandQ, height: Bd.h, borderRadius: "14px 0 0 14px", background: WH }} />
      <div style={{ position: "absolute", left: xS + 26, top: Bd.y, height: Bd.h, display: "flex", alignItems: "center", ...label(COLORS.ink, 36), opacity: k(tBL, 220) }}>{bandLabel.label}</div>
      {after > 0 ? (
        <svg style={{ position: "absolute", left: xE, top: Bd.y }} width={A.x1 - xE + 4} height={Bd.h}>
          <rect x={0} y={2} width={A.x1 - xE} height={Bd.h - 4} fill="none" stroke={WH} strokeWidth={4} strokeDasharray="16 12" style={{ clipPath: `inset(0 ${(1 - after) * 100}% 0 0)` }} />
        </svg>
      ) : null}

      {/* ── the entry year ── */}
      <div style={{ position: "absolute", left: xE - 26, top: A.y - 26, width: 52, height: 52, borderRadius: 26, background: RED, ...stamp(k(tEntry, 280), 1.7) }} />
      <div style={{ position: "absolute", left: xE - 300, width: 600, top: GEN.yearLabel, textAlign: "center", ...big(RED, 44), ...rise(k(tEntry, 240), 14) }}>{entry.label}</div>

      {/* ── the licensed generics: dashed, then travel to the entry year ── */}
      {ms >= tLic - 40 ? (
        <div style={{ position: "absolute", left: chipLeft, top: GEN.chip.top, width: 300, display: "flex", flexDirection: "column", alignItems: tv > 0.5 ? "center" : "flex-start", gap: 10 }}>
          <DashChip text={licensed.label} color={WH} style={stamp(k(tLic, 260), 1.25)} />
          <div style={{ ...label(INK_SUB, 30), opacity: k(tLim, 220) }}>{limited.label}</div>
        </div>
      ) : null}

      {/* ── two more applicants, in litigation ── */}
      <div style={{ position: "absolute", left: GEN.lit.left, top: GEN.lit.label, ...label(INK_SUB, 30), opacity: k(tRep, 220) }}>{report.label}</div>
      <div style={{ position: "absolute", left: GEN.lit.left, top: GEN.lit.top, display: "flex", alignItems: "center", gap: 20 }}>
        <div style={{ height: 64, padding: "0 26px", borderRadius: 32, background: WH, display: "flex", alignItems: "center", ...label(COLORS.ink, 30), ...stamp(k(tLit, 260), 1.25), transformOrigin: "0% 50%" }}>{litigation.label}</div>
        {applicants.map((a, i) => <DashChip key={i} text={a.text} color={WH} style={stamp(k(i ? tA2 : tA1, 260), 1.25)} />)}
      </div>
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// SustainSynergy — the plan after competition, then the synergies (white card)
// ══════════════════════════════════════════════════════════════════════════
export const SUS = {
  kicker: { left: 160, top: 120 },
  shield: { left: 160, top: 196, size: 120 },
  line: { y: 650, x0: 160, mark: 1100, x1: 1760 },
  fig: { top: 330, size: 220 },
};

export const SustainSynergy: React.FC<Win & {
  kicker: Lbl;
  shield: Lbl; // the IP shield stamps with its label
  line: Cued; // the sales line draws to the marker
  lineLabel: Lbl;
  marker: Lbl; // red: competition arrives
  plan: Lbl; // the dashed, level continuation
  turn: Cued;
  more: Lbl;
  figure: { value: number; prefix: string; unit: string; until: Cued } & Cued;
  per: Lbl;
  through: Lbl;
}> = ({ from, to, kicker, shield, line, lineLabel, marker, plan, turn, more, figure, per, through }) => {
  const ms = useMs();
  const k = useK();
  const INK = COLORS.ink;
  const RED = COLORS.accent;
  const SUB = inkA(0.6);
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));

  const tKick = at(kicker, from, from);
  const tShield = at(shield, tKick + 1200, from, tKick + 300);
  const tLine = at(line, tShield + 2000, from, tShield + 400);
  const tLL = at(lineLabel, tLine + 400, from, tLine + 150);
  const tMark = at(marker, tLL + 800, from, tLL + 300);
  const tPlan = at(plan, tMark + 800, from, tMark + 300);
  const tTurn = at(turn, tPlan + 500, from, tPlan + 300);
  const tMore = at(more, tTurn + 1000, from, tTurn + 300);
  const tFig = at(figure, tMore + 500, from, tMore + 200);
  const tFigEnd = at(figure.until, tFig + 500, from, tFig + 300);
  const tPer = at(per, tFigEnd + 400, from, tFigEnd + 100);
  const tThr = at(through, tPer + 2000, from, tPer + 400);

  const L = SUS.line;
  const S = SUS.shield;
  const page1 = 1 - k(tTurn, 320);
  const lq = EASE_IO(k(tLine, 700));
  const mq = EASE_IO(k(tMark, 360));
  const pq = EASE_IO(k(tPlan, 700));
  const fq = interpolate(ms, [tFig, Math.max(tFig + 1, tFigEnd - 60)], [0, 1], { ...CLAMP, easing: EASE });

  if (ms < tKick - 60) return null;
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {page1 > 0 ? (
        <div style={{ opacity: page1 }}>
          <div style={{ position: "absolute", left: SUS.kicker.left, top: SUS.kicker.top, ...label(SUB, 40), opacity: k(tKick, 220) }}>{kicker.label}</div>
          <div style={{ position: "absolute", left: S.left, top: S.top, display: "flex", alignItems: "center", gap: 34, ...stamp(k(tShield, 300), 1.3), transformOrigin: "0% 50%" }}>
            <svg width={S.size} height={S.size} viewBox="0 0 120 120">
              <path d="M60 8 L104 24 V58 C104 86 84 104 60 112 C36 104 16 86 16 58 V24 Z" fill={INK} />
              <path d="M40 60 L54 74 L82 44" fill="none" stroke={COLORS.paper} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <div style={big(INK, 64)}>{shield.label}</div>
          </div>

          {/* sales, to the marker; then the plan, dashed and level */}
          <div style={{ position: "absolute", left: L.x0, top: L.y - 5, width: (L.mark - L.x0) * lq, height: 10, borderRadius: 5, background: INK }} />
          <div style={{ position: "absolute", left: L.x0, top: L.y - 70, ...label(SUB, 36), opacity: k(tLL, 220) }}>{lineLabel.label}</div>
          {mq > 0 ? <div style={{ position: "absolute", left: L.mark - 4, top: L.y - 170 * mq, width: 8, height: 340 * mq, borderRadius: 4, background: RED }} /> : null}
          <div style={{ position: "absolute", left: L.mark - 300, width: 600, top: L.y - 236, textAlign: "center", ...big(RED, 44), ...rise(k(tMark + 150, 240), 14) }}>{marker.label}</div>
          {pq > 0 ? (
            <svg style={{ position: "absolute", left: L.mark + 6, top: L.y - 5 }} width={L.x1 - L.mark} height={10}>
              <line x1={0} y1={5} x2={(L.x1 - L.mark - 6) * pq} y2={5} stroke={INK} strokeWidth={10} strokeDasharray="22 16" />
            </svg>
          ) : null}
          <div style={{ position: "absolute", left: L.mark + 40, top: L.y + 30, ...label(SUB, 36), opacity: k(tPlan + 300, 240) }}>{plan.label}</div>
        </div>
      ) : null}

      {/* ═════ page 2 — the synergies ═════ */}
      {ms >= tTurn + 200 ? (
        <>
          <div style={{ position: "absolute", left: 0, width: 1920, top: SUS.fig.top - 70, textAlign: "center", ...label(SUB, 48), opacity: k(tMore, 220) }}>{more.label}</div>
          {ms >= tFig - 60 ? (
            <div style={{ position: "absolute", left: 0, width: 1920, top: SUS.fig.top, textAlign: "center", ...big(RED, SUS.fig.size), fontVariantNumeric: "tabular-nums", opacity: k(tFig - 60, 200) }}>
              {figure.prefix}{Math.round(figure.value * fq)} {figure.unit}
            </div>
          ) : null}
          <div style={{ position: "absolute", left: 0, width: 1920, top: SUS.fig.top + SUS.fig.size + 50, textAlign: "center", ...big(INK, 64), ...rise(k(tPer, 240), 16) }}>{per.label}</div>
          <div style={{ position: "absolute", left: 0, width: 1920, top: SUS.fig.top + SUS.fig.size + 150, textAlign: "center", ...label(SUB, 44), ...rise(k(tThr, 240), 14) }}>{through.label}</div>
        </>
      ) : null}
    </AbsoluteFill>
  );
};
