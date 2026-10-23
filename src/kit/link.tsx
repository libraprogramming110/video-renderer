// ─────────────────────────────────────────────────────────────────────────
// KIT · link — THE TEAM IS THE LINK, and THE MECHANICS. Added on the Viatris x
// Pacira HORIZONTAL long-form, 2026-10-14 (16:9; absolute 1920x1080
// coordinates, not portrait-safe as written). One-mover rule and the frame
// budget: each cue gets ONE motion, a finished idea retires.
//
// `TheLink` (white card) — the spine's section. The team walks in carrying its
//   two drugs (solid capsules) with an empty third seat; a link draws to a
//   DASHED capsule (dashed = not approved, the 08-22 vocabulary rule), which is
//   named and described; its details retire and the FDA goal date flips in under
//   a red kicker. In a pause the right side clears and the dashed capsule
//   travels into the empty seat. A red launch arrow draws to a specialists card
//   that lands, is written, and takes the two existing drugs as chips.
// `TenderRail` (ink) — a lead line; a rail with two stations (tender offer ->
//   merger), a struck "Shareholder vote" chip, two HOLLOW condition boxes (not
//   yet met); those retire and the rail runs on to a hollow "expected close"
//   ring with its date; then two funding plates. No split is drawn between the
//   funding sources: the script says "mostly", not how much.
//
// Every onset is a spoken word with an optional ms pin, clamped monotonic.
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { CLAMP, clamp01, COLORS, DISPLAY, INK_SUB, inkA, TRACK, useMs } from "./core";
import { TYPE } from "../style";
import { at, lerp, useK, type Cued, type Win } from "./elora";
import { DayLeaf } from "./unity";
import { Pill, Rep, teamXs } from "./pacira";

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

// ══════════════════════════════════════════════════════════════════════════
// TheLink — the team carries a third drug to the same specialists (white card)
// ══════════════════════════════════════════════════════════════════════════
export const LINK = {
  team: { cx: 560, bottom: 800, h: 180, gap: 22, enterDx: -620 },
  seats: { xs: [330, 560, 790] as const, cy: 570, w: 170, label: 486 },
  link: { x0: 900, x1: 1250 },
  drug: { cx: 1360, name: 420, fast: 376, tag: 640, desc: [712, 766] as const },
  fda: { kicker: 676, leaf: { x: 1290, y: 728, w: 140, h: 152 } },
  arrow: { x0: 1030, x1: 1250, y: 650 },
  card: { left: 1290, top: 330, w: 520, h: 470 },
};

export const TheLink: React.FC<Win & {
  team: Cued; // the team walks in carrying its two drugs
  drugs: [string, string]; // the two capsules' names
  link: Cued; // the link draws to an empty seat on the right
  drug: Cued; // the dashed capsule appears
  review: { label: string } & Cued; // "Under review"
  fast: { label: string } & Cued; // "Fast-acting" ...
  name: { text: string } & Cued; // ... "meloxicam"
  desc: [Line, Line];
  clear: Cued; // a pause: tag + description retire
  goal: { label: string } & Cued; // red kicker
  date: { month: string; day: string } & Cued; // the leaf flips
  clear2: Cued; // a pause: the right side clears
  join: Cued; // the dashed capsule travels into the empty seat
  launch: Cued; // the red arrow draws
  card: Cued; // the specialists card lands
  lines: [Line, Line];
  cardLabel: { label: string } & Cued;
  chips: [Line, Line]; // the drugs the same specialists already get
}> = ({ from, to, team, drugs, link, drug, review, fast, name, desc, clear, goal, date, clear2, join, launch, card, lines, cardLabel, chips }) => {
  const ms = useMs();
  const k = useK();
  const INK = COLORS.ink;
  const WH = COLORS.paper;
  const RED = COLORS.accent;
  const SUB = inkA(0.6);
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));

  const tTeam = at(team, from, from);
  const tLink = at(link, tTeam + 1200, from, tTeam + 400);
  const tDrug = at(drug, tLink + 450, from, tLink + 250);
  const tRev = at(review, tDrug + 1500, from, tDrug + 300);
  const tFast = at(fast, tRev + 1000, from, tRev + 300);
  const tName = at(name, tFast + 900, from, tFast + 300);
  const tD1 = at(desc[0], tName + 900, from, tName + 300);
  const tD2 = at(desc[1], tD1 + 900, from, tD1 + 300);
  const tClear = at(clear, tD2 + 1600, from, tD2 + 600);
  const tGoal = at(goal, tClear + 1300, from, tClear + 300);
  const tDate = at(date, tGoal + 700, from, tGoal + 300);
  const tClear2 = at(clear2, tDate + 900, from, tDate + 400);
  const tJoin = at(join, tClear2 + 1300, from, tClear2 + 400);
  const tLaunch = at(launch, tJoin + 500, from, tJoin + 300);
  const tCard = at(card, tLaunch + 800, from, tLaunch + 300);
  const tL1 = at(lines[0], tCard + 300, from, tCard + 150);
  const tL2 = at(lines[1], tL1 + 900, from, tL1 + 300);
  const tCL = at(cardLabel, tL2 + 700, from, tL2 + 300);
  const tC1 = at(chips[0], tCL + 900, from, tCL + 300);
  const tC2 = at(chips[1], tC1 + 600, from, tC1 + 250);

  const T = LINK.team;
  const S = LINK.seats;
  const D = LINK.drug;

  // the team walks in from the left, carrying the two solid drugs
  const enter = EASE_IO(k(tTeam, 700));
  const dx = (1 - enter) * T.enterDx;
  const xs = teamXs(T.cx + dx, 7, T.h, T.gap);

  const linkQ = EASE_IO(k(tLink, 420));
  const rightOut = 1 - k(tClear2, 320); // the right side clears in the 2nd pause
  const detailOut = 1 - k(tClear, 300); // tag + description retire in the 1st pause
  const jq = EASE_IO(k(tJoin, 620));
  const drugX = lerp(D.cx, S.xs[2], jq);
  const drugQ = k(tDrug, 380);

  const aq = EASE_IO(k(tLaunch, 520));
  const A = LINK.arrow;
  const headX = lerp(A.x0, A.x1, aq);
  const C = LINK.card;
  const cq = k(tCard, 420);

  if (ms < tTeam - 60) return null;
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {/* ── the team and the two drugs it carries ── */}
      {xs.map((x, i) => <Rep key={i} cx={x} bottom={T.bottom} h={T.h} color={INK} opacity={clamp01(enter * 3)} />)}
      {drugs.map((d, i) => (
        <React.Fragment key={i}>
          <Pill cx={S.xs[i] + dx} cy={S.cy} w={S.w} color={INK} back={WH} rot={i ? 8 : -8} opacity={clamp01(enter * 3)} />
          <div style={{ position: "absolute", left: S.xs[i] + dx - 150, width: 300, top: S.label, textAlign: "center", opacity: clamp01(enter * 3), ...label(SUB, 30) }}>{d}</div>
        </React.Fragment>
      ))}

      {/* ── the link to a drug under review ── */}
      {linkQ > 0 && rightOut > 0 ? (
        <div style={{ position: "absolute", left: LINK.link.x0, top: S.cy - 3, width: (LINK.link.x1 - LINK.link.x0) * linkQ, height: 6, borderRadius: 3, background: INK, opacity: rightOut }} />
      ) : null}
      {drugQ > 0 ? (
        <>
          <Pill cx={drugX} cy={S.cy - (1 - BACK(drugQ)) * 50} w={S.w} color={INK} back={WH} dashed rot={jq * -6} opacity={clamp01(drugQ * 4)} />
          <div style={{ position: "absolute", left: drugX - 150, width: 300, top: S.label, textAlign: "center", opacity: k(tClear2 + 400, 260), ...label(SUB, 30) }}>{name.text[0].toUpperCase() + name.text.slice(1)}</div>
        </>
      ) : null}

      {rightOut > 0 ? (
        <div style={{ opacity: rightOut }}>
          <div style={{ position: "absolute", left: D.cx - 400, width: 800, top: D.fast, textAlign: "center", ...label(SUB, 36), ...rise(k(tFast, 220), 16) }}>{fast.label}</div>
          <div style={{ position: "absolute", left: D.cx - 400, width: 800, top: D.name, display: "flex", justifyContent: "center" }}>
            <div style={{ ...big(INK, 96), ...stamp(k(tName, 300), 1.3) }}>{name.text}</div>
          </div>
          <div style={{ opacity: detailOut }}>
            <div style={{ position: "absolute", left: D.cx - 300, width: 600, top: D.tag, display: "flex", justifyContent: "center" }}>
              <svg width={290} height={60} style={{ position: "absolute", ...stamp(k(tRev, 260), 1.2) }}>
                <rect x={2} y={2} width={286} height={56} rx={28} fill="none" stroke={INK} strokeWidth={4} strokeDasharray="14 10" />
              </svg>
              <div style={{ height: 60, display: "flex", alignItems: "center", ...label(INK, 30), opacity: k(tRev, 260) }}>{review.label}</div>
            </div>
            {desc.map((d, i) => (
              <div key={i} style={{ position: "absolute", left: D.cx - 400, width: 800, top: D.desc[i], textAlign: "center", ...big(INK, 40), ...rise(k(i ? tD2 : tD1, 240), 18) }}>{d.text}</div>
            ))}
          </div>
          <div style={{ position: "absolute", left: D.cx - 300, width: 600, top: LINK.fda.kicker, textAlign: "center", ...label(RED, 36), ...rise(k(tGoal, 240), 16) }}>{goal.label}</div>
          <DayLeaf rect={LINK.fda.leaf} k={k(tDate, 520)} month={date.month} day={date.day} />
        </div>
      ) : null}

      {/* ── the launch: same specialists ── */}
      {aq > 0 ? (
        <svg style={{ position: "absolute", left: 0, top: 0 }} width={1920} height={1080}>
          <line x1={A.x0} y1={A.y} x2={headX - 6} y2={A.y} stroke={RED} strokeWidth={10} strokeLinecap="round" />
          <path d={`M ${headX - 32} ${A.y - 24} L ${headX} ${A.y} L ${headX - 32} ${A.y + 24}`} fill="none" stroke={RED} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" opacity={clamp01(aq * 5)} />
        </svg>
      ) : null}
      {cq > 0 ? (
        <div style={{ position: "absolute", left: C.left, top: C.top - (1 - BACK(cq)) * 70, width: C.w, height: C.h, borderRadius: 28, background: INK, opacity: clamp01(cq * 4) }}>
          {lines.map((l, i) => (
            <div key={i} style={{ position: "absolute", left: 44, top: 56 + i * 66, ...big(WH, 52), ...rise(k(i ? tL2 : tL1, 240), 18) }}>{l.text}</div>
          ))}
          <div style={{ position: "absolute", left: 44, top: 222, ...label(INK_SUB, 36), opacity: k(tCL, 240) }}>{cardLabel.label}</div>
          <div style={{ position: "absolute", left: 44, right: 44, top: 286, height: 3, background: "rgba(255,255,255,0.18)", opacity: k(tCL, 240) }} />
          {chips.map((c, i) => (
            <div key={i} style={{ position: "absolute", left: 44, top: 318 + i * 70, height: 56, padding: "0 24px", borderRadius: 28, background: WH, display: "flex", alignItems: "center", gap: 12, transformOrigin: "0% 50%", ...stamp(k(i ? tC2 : tC1, 260), 1.25) }}>
              <svg width={24} height={24} viewBox="0 0 24 24"><path d="M4 12.5 L9.5 18 L20 6.5" fill="none" stroke={INK} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" /></svg>
              <div style={label(INK, 30)}>{c.text}</div>
            </div>
          ))}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// TenderRail — the mechanics (ink)
// ══════════════════════════════════════════════════════════════════════════
export const RAIL = {
  lead: { top: 420, size: 120 },
  y: 300,
  xs: [300, 960, 1620] as const,
  label: 344,
  under: 452, // the struck chip, the conditions
  fund: { top: 520, w: 800, h: 112, gap: 26 },
};

export const TenderRail: React.FC<Win & {
  lead: Line[]; // last group gets the red
  clear: Cued; // the lead retires
  tender: { label: string } & Cued; // station 1
  followed: Cued; // the rail runs on
  merger: { label: string } & Cued; // station 2
  vote: { label: string } & Cued; // the chip lands...
  strike: Cued; // ...and is struck
  requires: { label: string } & Cued;
  conds: [Line, Line]; // hollow boxes: not yet met
  clear2: Cued; // the chip and the conditions retire
  close: { label: string } & Cued; // the rail runs on to a hollow ring
  when: Line; // its date
  paying: { label: string } & Cued;
  fund: [Line, Line];
}> = ({ from, to, lead, clear, tender, followed, merger, vote, strike, requires, conds, clear2, close, when, paying, fund }) => {
  const ms = useMs();
  const k = useK();
  const WH = COLORS.paper;
  const RED = COLORS.accent;
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));

  let prev = from;
  const tLead = lead.map((l) => (prev = at(l, prev + 300, from, prev)));
  const tClear = at(clear, prev + 600, from, prev + 300);
  const tTender = at(tender, tClear + 600, from, tClear + 250);
  const tFol = at(followed, tTender + 800, from, tTender + 300);
  const tMerger = at(merger, tFol + 600, from, tFol + 300);
  const tVote = at(vote, tMerger + 900, from, tMerger + 300);
  const tStrike = at(strike, tVote + 600, from, tVote + 300);
  const tReq = at(requires, tStrike + 700, from, tStrike + 300);
  const tC1 = at(conds[0], tReq + 600, from, tReq + 250);
  const tC2 = at(conds[1], tC1 + 2000, from, tC1 + 400);
  const tClear2 = at(clear2, tC2 + 1000, from, tC2 + 400);
  const tClose = at(close, tClear2 + 500, from, tClear2 + 200);
  const tWhen = at(when, tClose + 1400, from, tClose + 300);
  const tPay = at(paying, tWhen + 1000, from, tWhen + 300);
  const tF1 = at(fund[0], tPay + 700, from, tPay + 250);
  const tF2 = at(fund[1], tF1 + 1500, from, tF1 + 400);

  const X = RAIL.xs;
  const leadO = 1 - k(tClear, 300);
  const out2 = 1 - k(tClear2, 320);
  // the rail is drawn in three runs: to station 1, to 2, to 3
  const r1 = EASE_IO(k(tTender - 200, 420));
  const r2 = EASE_IO(k(tFol, 600));
  const r3 = EASE_IO(k(tClose, 640));
  const railX = r3 > 0 ? lerp(X[1], X[2], r3) : r2 > 0 ? lerp(X[0], X[1], r2) : lerp(120, X[0], r1);

  const node = (x: number, q: number, hollow: boolean) =>
    q > 0 ? (
      <div style={{ position: "absolute", left: x - 26, top: RAIL.y - 26, width: 52, height: 52, borderRadius: 26, boxSizing: "border-box", background: hollow ? COLORS.ink : WH, border: `6px solid ${hollow ? RED : WH}`, ...stamp(q, 1.6) }} />
    ) : null;
  const station = (x: number, text: string, q: number, color = WH) => (
    <div style={{ position: "absolute", left: x - 300, width: 600, top: RAIL.label, textAlign: "center", ...big(color, 52), ...rise(q, 18) }}>{text}</div>
  );

  const sq = EASE_IO(k(tStrike, 360));
  const F = RAIL.fund;

  if (ms < tLead[0] - 60) return null;
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {/* ── the lead ── */}
      {leadO > 0 ? (
        <div style={{ position: "absolute", left: 0, width: 1920, top: RAIL.lead.top, display: "flex", justifyContent: "center", gap: 30, opacity: leadO }}>
          {lead.map((l, i) => <div key={i} style={{ ...big(i === lead.length - 1 ? RED : WH, RAIL.lead.size), ...rise(k(tLead[i], 260)) }}>{l.text}</div>)}
        </div>
      ) : null}

      {/* ── the rail and its stations ── */}
      {r1 > 0 ? <div style={{ position: "absolute", left: 120, top: RAIL.y - 4, width: railX - 120, height: 8, borderRadius: 4, background: WH }} /> : null}
      {node(X[0], k(tTender, 300), false)}
      {station(X[0], tender.label, k(tTender, 260))}
      {node(X[1], k(tMerger, 300), false)}
      {station(X[1], merger.label, k(tMerger, 260))}
      {node(X[2], k(tClose + 560, 300), true)}
      {station(X[2], close.label, k(tClose + 500, 260))}
      <div style={{ position: "absolute", left: X[2] - 300, width: 600, top: RAIL.label + 74, textAlign: "center", ...big(RED, 48), ...rise(k(tWhen, 240), 16) }}>{when.text}</div>

      {/* ── no shareholder vote, and the conditions (retire in the pause) ── */}
      {out2 > 0 ? (
        <div style={{ opacity: out2 }}>
          <div style={{ position: "absolute", left: X[1] - 300, width: 600, top: RAIL.under, display: "flex", justifyContent: "center" }}>
            <div style={{ position: "relative", height: 64, padding: "0 30px", borderRadius: 32, border: `4px solid ${INK_SUB}`, display: "flex", alignItems: "center", ...label(INK_SUB, 34), ...stamp(k(tVote, 260), 1.2) }}>
              {vote.label}
              <div style={{ position: "absolute", left: 14, right: 14, top: 30, height: 5, borderRadius: 3, background: WH, transformOrigin: "0% 50%", transform: `scaleX(${sq})` }} />
            </div>
          </div>
          <div style={{ position: "absolute", left: X[0] - 140, top: RAIL.under, ...label(INK_SUB, 34), opacity: k(tReq, 220) }}>{requires.label}</div>
          {conds.map((c, i) => {
            const q = k(i ? tC2 : tC1, 260);
            return (
              <div key={i} style={{ position: "absolute", left: X[0] - 140, top: RAIL.under + 80 + i * 74, display: "flex", alignItems: "center", gap: 20, ...rise(q, 16) }}>
                <div style={{ width: 44, height: 44, borderRadius: 8, boxSizing: "border-box", border: `4px solid ${WH}` }} />
                <div style={big(WH, 44)}>{c.text}</div>
              </div>
            );
          })}
        </div>
      ) : null}

      {/* ── how it is paid for ── */}
      <div style={{ position: "absolute", left: 0, width: 1920, top: F.top - 60, textAlign: "center", ...label(INK_SUB, 34), opacity: k(tPay, 220) }}>{paying.label}</div>
      <div style={{ position: "absolute", left: 0, width: 1920, top: F.top, display: "flex", flexDirection: "column", alignItems: "center", gap: F.gap }}>
        {fund.map((f, i) => {
          const q = k(i ? tF2 : tF1, 300);
          return (
            <div key={i} style={{ width: F.w, height: F.h, borderRadius: 24, boxSizing: "border-box", background: i ? "transparent" : WH, border: `4px solid ${WH}`, display: "flex", alignItems: "center", justifyContent: "center", ...big(i ? WH : COLORS.ink, 44), ...rise(q, 24) }}>{f.text}</div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};
