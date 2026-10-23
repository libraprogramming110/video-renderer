// ─────────────────────────────────────────────────────────────────────────
// KIT · timing — BETWEEN TWO KINDS OF DEAL, AND BEFORE TWO ANSWERS. Added on
// the AstraZeneca x Summit HORIZONTAL long-form, 2026-10-05 (16:9; absolute
// 1920x1080 coordinates). One-mover rule + the frame budget from kit/equity.
//
// `BetweenAxis` (red): an axis between two kinds of deal, with this deal set
// down between its ends (no scale is drawn: the script gives none). It retires
// in a pause and a two-sided ledger lands: what each side gets.
//
// `TimingRail` (ink, THE SPINE RETURNS): the September 28 node reappears in its
// §1 seat (kit/equity RAIL). A status board: where the drug is approved (solid)
// and where it is not (hollow). The board retires and the rail travels to the
// middle of the frame; it FORKS into two dashed branches, each ending in a
// hollow ring: a dated decision and an undated readout (the fork makes no
// claim about which comes first). Five filled dots sit under the readout it is
// "not among". Then the stretch of rail BEFORE the fork turns red and the node
// is stamped: committed before either answer.
//
// Every onset is a spoken word with an optional ms pin, clamped monotonic.
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { CLAMP, clamp01, COLORS, DISPLAY, INK_SUB, TRACK, useMs } from "./core";
import { FlowLine } from "./flowline";
import { at, lerp, useK, type Cued, type Win } from "./elora";
import { RAIL } from "./equity";

const EASE = Easing.out(Easing.cubic);
const EASE_IO = Easing.inOut(Easing.cubic);
const BACK = Easing.out(Easing.back(1.7));

const W = 1920;
const H = 1080;

const label = (color: string, size: number): React.CSSProperties => ({
  fontFamily: DISPLAY, fontWeight: 700, fontSize: size, letterSpacing: TRACK.kicker, color, whiteSpace: "nowrap",
});
const big = (color: string, size: number): React.CSSProperties => ({
  fontFamily: DISPLAY, fontWeight: 700, fontSize: size, letterSpacing: TRACK.display, color, lineHeight: 1, whiteSpace: "nowrap",
});

// ══════════════════════════════════════════════════════════════════════════
// BetweenAxis — between two kinds of deal, then what each side gets (red world)
// ══════════════════════════════════════════════════════════════════════════
export const AXIS = { y: 470, x0: 330, x1: 1590, pill: { w: 320, h: 92 }, cols: [130, 1020], colW: 770 };

type Side = { header: string; word?: string; ms?: number; items: [{ label: string } & Cued, { label: string } & Cued] };

export const BetweenAxis: React.FC<Win & {
  self: { label: string } & Cued; // this deal, set down on the axis
  axis: Cued; // the axis draws under it
  left: { label: string } & Cued;
  right: { label: string } & Cued;
  clear: Cued; // the axis retires (a pause)
  sides: [Side, Side];
}> = ({ from, to, self, axis, left, right, clear, sides }) => {
  const ms = useMs();
  const k = useK();
  const WH = COLORS.paper;
  const R = COLORS.accent;
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));

  const tSelf = at(self, from, from);
  const tAxis = at(axis, tSelf + 840, from, tSelf + 300);
  const tLeft = at(left, tAxis + 540, from, tAxis + 300);
  const tRight = at(right, tLeft + 1300, from, tLeft + 400);
  const tClear = at(clear, tRight + 800, from, tRight + 500);
  let prev = tClear + 300;
  const tSides = sides.map((s) => {
    const tH = at(s, prev + 150, from, prev);
    const t1 = at(s.items[0], tH + 1200, from, tH + 300);
    const t2 = at(s.items[1], t1 + 1300, from, t1 + 400);
    prev = t2 + 400;
    return { tH, items: [t1, t2] };
  });

  const A = AXIS;
  const cx = (A.x0 + A.x1) / 2;
  const selfQ = k(tSelf, 340);
  const axisQ = EASE_IO(k(tAxis, 520));
  const axisO = 1 - k(tClear, 300);

  if (ms < tSelf - 60 || vis <= 0) return null;
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {axisO > 0 ? (
        <div style={{ position: "absolute", inset: 0, opacity: axisO }}>
          <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
            {/* grown from the deal outwards, to both ends */}
            <line x1={cx - (cx - A.x0) * axisQ} y1={A.y} x2={cx + (A.x1 - cx) * axisQ} y2={A.y} stroke={WH} strokeWidth={8} strokeLinecap="round" opacity={axisQ > 0 ? 1 : 0} />
            <circle cx={A.x0} cy={A.y} r={20 * BACK(k(tLeft, 300))} fill={WH} />
            <circle cx={A.x1} cy={A.y} r={20 * BACK(k(tRight, 300))} fill={WH} />
          </svg>
          <div style={{ position: "absolute", left: A.x0 - 20, top: A.y + 52, opacity: k(tLeft, 180), ...big(WH, 56) }}>{left.label}</div>
          <div style={{ position: "absolute", right: W - A.x1 - 20, top: A.y + 52, opacity: k(tRight, 180), ...big(WH, 56) }}>{right.label}</div>
          <div style={{ position: "absolute", left: cx - A.pill.w / 2, top: A.y - A.pill.h / 2 - (1 - BACK(selfQ)) * 70, width: A.pill.w, height: A.pill.h, borderRadius: A.pill.h / 2, background: WH,
            display: "flex", alignItems: "center", justifyContent: "center", opacity: clamp01(selfQ * 3), ...big(R, 44) }}>
            {self.label}
          </div>
        </div>
      ) : null}

      {/* what each side gets */}
      {sides.map((s, i) => {
        const T = tSides[i];
        if (ms < T.tH - 20) return null;
        return (
          <React.Fragment key={i}>
            <div style={{ position: "absolute", left: A.cols[i], top: 260, opacity: k(T.tH, 180), transform: `translateY(${(1 - EASE(k(T.tH, 320))) * 16}px)`, ...big(WH, 68) }}>{s.header}</div>
            {s.items.map((it, j) => {
              const q = EASE(k(T.items[j], 340));
              return q > 0 ? (
                <div key={j} style={{ position: "absolute", left: A.cols[i], top: 390 + j * 116, height: 92, padding: "0 38px", borderRadius: 46, background: WH, display: "flex", alignItems: "center",
                  opacity: clamp01(q * 2.5), transform: `translateX(${(1 - q) * -50}px)`, ...big(R, 38) }}>
                  {it.label}
                </div>
              ) : null;
            })}
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// TimingRail — the spine returns and forks (ink world)
// ══════════════════════════════════════════════════════════════════════════
export const FORK = {
  y: 470, // the rail once it has travelled to the middle
  x: 900, // where it forks
  ring: { x: 1180, r: 26, up: -140, down: 140 },
  text: 1240, // labels start here
  dots: { dy: 220, gap: 40, r: 12 },
  chips: [{ x: 130 }, { x: 710 }, { x: 1290 }],
  chip: { w: 500, h: 120, top: 330 },
  captionTop: 800,
};

type Cap = { text: string; emphasize?: string } & Cued;

const Caption: React.FC<{ from: number; to: number; text: string; emphasize?: string; top: number }> = ({ from, to, text, emphasize, top }) => {
  const ms = useMs();
  const o = clamp01(interpolate(ms, [from - 80, from, to - 220, to], [0, 1, 1, 0], CLAMP));
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 210, width: W - 420, top, opacity: o }}>
      <FlowLine from={from} to={to} line={text} size={44} color={COLORS.paper} restColor={INK_SUB} restWeight={700} emphasize={emphasize} empColor={COLORS.paper} lineHeight={1.14} align="center" />
    </div>
  );
};

export const TimingRail: React.FC<Win & {
  title: { text: string; emphasize?: string } & Cued;
  node: { label: string } & Cued; // the §1 node returns in its seat
  clearTitle: Cued;
  drug: { label: string } & Cued;
  approved: { label: string; note: [string, string]; word?: string; ms?: number; noteWord?: string };
  notApproved: { label: string } & Cued;
  pending: [{ label: string } & Cued, { label: string } & Cued]; // hollow chips
  move: Cued; // the board retires, the rail travels to the middle (a pause)
  review: Cued; // the first branch + ring
  goal: { label: string } & Cued;
  date: { label: string } & Cued;
  trial: { label: string; word?: string; ms?: number; ringWord?: string };
  trialSub: { label: string } & Cued;
  five: { count: number } & Cued; // the readouts it is not among
  fiveLabel: { label: string } & Cued;
  commit: { label: string } & Cued; // the node is stamped
  before: Cued; // the rail before the fork turns red
  captions: [Cap, Cap, Cap, Cap];
}> = ({ from, to, title, node, clearTitle, drug, approved, notApproved, pending, move, review, goal, date, trial, trialSub, five, fiveLabel, commit, before, captions }) => {
  const ms = useMs();
  const k = useK();
  const WH = COLORS.paper;
  const R = COLORS.accent;
  const INK = COLORS.ink;
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));
  const c = (word: string | undefined, fb: number, min: number) => Math.max(min, at({ word }, fb, from));

  const tTitle = at(title, from, from);
  const tNode = at(node, tTitle + 270, from, tTitle + 150);
  const tClearTitle = at(clearTitle, tNode + 1100, from, tNode + 700);
  const tDrug = at(drug, tClearTitle + 500, from, tClearTitle + 300);
  const tOk = at(approved, tDrug + 1100, from, tDrug + 400);
  const tOkNote = c(approved.noteWord, tOk + 850, tOk + 300);
  const tNot = at(notApproved, tOkNote + 2400, from, tOkNote + 600);
  const tP1 = at(pending[0], tNot + 1300, from, tNot + 400);
  const tP2 = at(pending[1], tP1 + 530, from, tP1 + 300);
  const tMove = at(move, tP2 + 620, from, tP2 + 450);
  const tC1 = at(captions[0], tMove + 500, from, tMove + 400);
  const tReview = at(review, tC1 + 3700, from, tC1 + 800);
  const tGoal = at(goal, tReview + 1440, from, tReview + 500);
  const tDate = at(date, tGoal + 870, from, tGoal + 300);
  const tRing2 = c(trial.ringWord, tDate + 1600, tDate + 600);
  const tTrial = at(trial, tRing2 + 380, from, tRing2 + 250);
  const tC2 = at(captions[1], tTrial + 1170, from, tTrial + 400);
  const tTrialSub = at(trialSub, tC2 + 120, from, tC2 + 80);
  const tC3 = at(captions[2], tTrialSub + 4000, from, tTrialSub + 800);
  const tFive = at(five, tC3 + 1040, from, tC3 + 300);
  const tFiveLabel = at(fiveLabel, tFive + 1120, from, tFive + 400);
  const tC4 = at(captions[3], tFiveLabel + 1770, from, tFiveLabel + 700);
  const tCommit = at(commit, tC4 + 920, from, tC4 + 300);
  const tBefore = at(before, tCommit + 730, from, tCommit + 350);

  // ── the rail: back in its §1 seat, then travelling to the middle
  const F = FORK;
  const railIn = EASE_IO(k(tNode, 600));
  const mq = EASE_IO(k(tMove, 640));
  const y = lerp(RAIL.y, F.y, mq);
  const railEnd = lerp(RAIL.x1, F.x, mq); // the line shortens to the fork as it travels
  const nodeS = BACK(k(tNode, 320));

  // ── the status board
  const boardO = 1 - k(tMove, 300);
  const Ch = F.chip;

  // ── the fork
  const b1 = EASE_IO(k(tReview, 520));
  const b2 = EASE_IO(k(tRing2, 520));
  const upY = F.y + F.ring.up;
  const downY = F.y + F.ring.down;
  const redQ = EASE_IO(k(tBefore, 460));
  const commitQ = k(tCommit, 300);
  const branch = (q: number, ty: number) =>
    q > 0 ? (
      <>
        <line x1={F.x} y1={F.y} x2={lerp(F.x, F.ring.x - F.ring.r, q)} y2={lerp(F.y, ty, q)} stroke="rgba(255,255,255,0.6)" strokeWidth={5} strokeLinecap="round" strokeDasharray="16 14" />
        <circle cx={F.ring.x} cy={ty} r={F.ring.r * BACK(clamp01(q * 2 - 1))} fill={INK} stroke={WH} strokeWidth={7} />
      </>
    ) : null;

  if (ms < tTitle - 60 || vis <= 0) return null;
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {/* the section's own words, then gone */}
      {ms < tClearTitle + 320 ? (
        <div style={{ position: "absolute", left: 130, width: W - 260, top: 420, opacity: 1 - k(tClearTitle, 300) }}>
          <FlowLine from={tTitle} to={tClearTitle} line={title.text} size={120} color={WH} restColor={INK_SUB} restWeight={700} emphasize={title.emphasize} empColor={WH} lineHeight={1.05} align="center" />
        </div>
      ) : null}

      {/* ── the rail and its node (the spine) ── */}
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <line x1={RAIL.x0} y1={y} x2={lerp(RAIL.x0, railEnd, railIn)} y2={y} stroke="rgba(255,255,255,0.26)" strokeWidth={4} strokeLinecap="round" />
        {redQ > 0 ? <line x1={RAIL.node.x} y1={y} x2={lerp(RAIL.node.x, F.x, redQ)} y2={y} stroke={R} strokeWidth={10} strokeLinecap="round" /> : null}
        {branch(b1, upY)}
        {branch(b2, downY)}
        <circle cx={RAIL.node.x} cy={y} r={RAIL.node.r * nodeS * lerp(1, 1.5, EASE(commitQ))} fill={R} />
        {/* the readouts it is not among */}
        {Array.from({ length: five.count }, (_, i) => {
          const q = BACK(k(tFive + i * 70, 260));
          return q > 0 ? <circle key={i} cx={F.text + F.dots.r + i * F.dots.gap} cy={F.y + F.dots.dy} r={F.dots.r * q} fill={WH} /> : null;
        })}
      </svg>
      <div style={{ position: "absolute", left: RAIL.label.left, top: y - (RAIL.y - RAIL.label.top), opacity: k(tNode + 150, 200), ...big(WH, RAIL.label.size) }}>{node.label}</div>

      {/* ── the status board: approved (solid) and not (hollow) ── */}
      {boardO > 0 && ms >= tDrug - 20 ? (
        <div style={{ position: "absolute", inset: 0, opacity: boardO }}>
          <div style={{ position: "absolute", left: 130, top: 232, opacity: k(tDrug, 180), ...big(WH, 64) }}>{drug.label}</div>
          {k(tOk, 300) > 0 ? (
            <div style={{ position: "absolute", left: F.chips[0].x, top: Ch.top, width: Ch.w, height: Ch.h, borderRadius: 26, background: WH, display: "flex", alignItems: "center", justifyContent: "center",
              opacity: clamp01(k(tOk, 300) * 3), transform: `scale(${lerp(0.88, 1, BACK(k(tOk, 300)))})`, ...big(INK, 56) }}>
              {approved.label}
            </div>
          ) : null}
          <div style={{ position: "absolute", left: F.chips[0].x + 4, top: Ch.top + Ch.h + 22, opacity: k(tOkNote, 200), ...label(INK_SUB, 28), lineHeight: 1.25 }}>
            {approved.note[0]}<br />{approved.note[1]}
          </div>
          <div style={{ position: "absolute", left: F.chips[1].x + 4, top: Ch.top + Ch.h + 22, opacity: k(tNot, 200), ...label(WH, 28) }}>{notApproved.label}</div>
          {pending.map((p, i) => {
            const q = k(i === 0 ? tP1 : tP2, 300);
            return q > 0 ? (
              <div key={i} style={{ position: "absolute", left: F.chips[i + 1].x, top: Ch.top, width: Ch.w, height: Ch.h, boxSizing: "border-box", borderRadius: 26, border: "5px solid rgba(255,255,255,0.7)",
                display: "flex", alignItems: "center", justifyContent: "center", opacity: clamp01(q * 3), transform: `scale(${lerp(0.88, 1, BACK(q))})`, ...big(WH, 56) }}>
                {p.label}
              </div>
            ) : null;
          })}
        </div>
      ) : null}

      {/* ── the two answers ── */}
      {ms >= tGoal - 20 ? (
        <>
          <div style={{ position: "absolute", left: F.text, top: upY - 62, opacity: k(tGoal, 200), ...label(INK_SUB, 28) }}>{goal.label}</div>
          <div style={{ position: "absolute", left: F.text, top: upY - 26, opacity: k(tDate, 130), transform: `scale(${interpolate(ms, [tDate, tDate + 280], [1.14, 1], { ...CLAMP, easing: EASE })})`, transformOrigin: "left center", ...big(WH, 64) }}>{date.label}</div>
          <div style={{ position: "absolute", left: F.text, top: downY - 62, opacity: k(tTrialSub, 200), ...label(INK_SUB, 28) }}>{trialSub.label}</div>
          <div style={{ position: "absolute", left: F.text, top: downY - 26, opacity: k(tTrial, 160), ...big(WH, 64) }}>{trial.label}</div>
          <div style={{ position: "absolute", left: F.text + five.count * F.dots.gap + 14, top: F.y + F.dots.dy - 17, opacity: k(tFiveLabel, 200), ...label(INK_SUB, 28) }}>{fiveLabel.label}</div>
        </>
      ) : null}

      {/* ── committed, before the fork ── */}
      {commitQ > 0 ? (
        <div style={{ position: "absolute", left: RAIL.x0, top: F.y + 44, height: 72, padding: "0 30px", borderRadius: 16, background: R, display: "flex", alignItems: "center",
          opacity: clamp01(commitQ * 3), transform: `scale(${lerp(1.3, 1, EASE(commitQ))}) rotate(-2deg)`, transformOrigin: "left center", ...big(WH, 42) }}>
          {commit.label}
        </div>
      ) : null}

      <Caption from={tC1} to={tRing2 - 60} text={captions[0].text} emphasize={captions[0].emphasize} top={F.captionTop} />
      <Caption from={tC2} to={tC3 - 60} text={captions[1].text} emphasize={captions[1].emphasize} top={F.captionTop} />
      <Caption from={tC3} to={tC4 - 60} text={captions[2].text} emphasize={captions[2].emphasize} top={F.captionTop} />
      <Caption from={tC4} to={to + 400} text={captions[3].text} emphasize={captions[3].emphasize} top={F.captionTop} />
    </AbsoluteFill>
  );
};
