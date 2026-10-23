// ─────────────────────────────────────────────────────────────────────────
// KIT · nextone — FEW SEATS, ONE TAKEN, WHO TAKES THE NEXT. Added on the
// Shionogi × IntraBio long-form, 2026-10-07 (VERTICAL). The spine's last two
// appearances. One mover per cue, landed things go still, lead-ins retire.
//
// `NextOne` (red): "The scarcity thesis holds. The question is which Japanese
// pharma buys the next one…" The headline is written on cue; a few dashed
// seats draw under it on "scarcity"; on "holds" the spine's card slams into the
// first seat with its price on its edge (taken). The headline retires in the
// pause. Unnamed dashed buyers drop in on "which Japanese pharma"; a dashed
// line reaches down on "buys"; the seat beside the taken one turns solid and
// takes a "?" on "next one".
//
// `BriefEnd` (white card): "…in this week's Catalyst Brief. Subscribe free…
// signal over noise." The end card in the video's own vocabulary: an issue
// frame rises with the spine filed inside it, the lockup lands on the brand's
// name, a red button, a URL that types, the tagline on its words. Retire the
// chrome (`BroadcastFrame untilMs`) before it so there is one logo.
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { CLAMP, clamp01, COLORS, DISPLAY, INK_SUB_ON_RED, TRACK, useMs } from "./core";
import { at, lerp, Phrase, useK, type Cued, type Win } from "./elora";
import { FlowLine } from "./flowline";
import { Wordmark } from "./ui";
import { TargetCard } from "./unnamed";

const EASE = Easing.out(Easing.cubic);
const BACK = Easing.out(Easing.back(1.6));

/** A price plate on a card's top edge (the hook's plate, small). */
const EdgePlate: React.FC<{ cx: number; cy: number; w: number; h: number; label: string; size: number; border?: string }> = ({ cx, cy, w, h, label, size, border }) => (
  <div style={{ position: "absolute", left: cx - w / 2, top: cy - h / 2, width: w, height: h, boxSizing: "border-box", borderRadius: h / 2, background: COLORS.accent, border: border ? `5px solid ${border}` : "none",
    display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: size, letterSpacing: TRACK.headline, color: COLORS.paper, whiteSpace: "nowrap" }}>
    {label}
  </div>
);

// ══════════════════════════════════════════════════════════════════════════
// NextOne — the question (red world)
// ══════════════════════════════════════════════════════════════════════════
export const NEXT = {
  seat: { w: 400, h: 250 },
  xs: [120, 560],
  ys: [640, 930],
  buyers: { y: 300, w: 230, h: 90, xs: [135, 425, 715] },
  lineTop: 1290,
};

export const NextOne: React.FC<Win & {
  headline: { text: string; emphasize?: string } & Cued; // written on cue, retires in the pause
  seats: Cued; // the dashed seats draw ("scarcity")
  taken: { name: string; price: string } & Cued; // the spine's card slams into seat 1 ("holds")
  ask: Cued; // the headline retires, the question line starts
  buyers: { n: number } & Cued; // unnamed buyers drop in
  reach: Cued; // a dashed line reaches down ("buys")
  next: Cued; // the seat beside the taken one turns solid, "?" ("next one")
  line: { text: string; emphasize?: string };
}> = ({ from, to, headline, seats, taken, ask, buyers, reach, next, line }) => {
  const ms = useMs();
  const k = useK();
  const W = COLORS.paper;
  const N = NEXT;

  const tHead = at(headline, from + 360, from);
  const tSeats = at(seats, tHead + 250, from, tHead + 150);
  const tTaken = at(taken, tSeats + 900, from, tSeats + 500);
  const tAsk = at(ask, tTaken + 820, from, tTaken + 500);
  const tBuyers = at(buyers, tAsk + 950, from, tAsk + 300);
  const tReach = at(reach, tBuyers + 1400, from, tBuyers + 500);
  const tNext = at(next, tReach + 300, from, tReach + 250);

  if (ms < tHead - 40 || ms > to) return null;

  const headO = 1 - k(tAsk - 380, 280);
  const takenO = k(tTaken, 110);
  const takenS = interpolate(ms, [tTaken, tTaken + 300], [1.14, 1], { ...CLAMP, easing: EASE });
  const reachK = EASE(k(tReach, 280));
  const nextK = k(tNext, 300);
  const nextS = interpolate(ms, [tNext, tNext + 300], [1.5, 1], { ...CLAMP, easing: EASE });

  const slots = N.ys.flatMap((y) => N.xs.map((x) => ({ x, y })));
  const taker = { x: N.buyers.xs[1] + N.buyers.w / 2, y: N.buyers.y + N.buyers.h }; // the middle buyer's foot
  const target = { x: slots[1].x + N.seat.w / 2, y: slots[1].y };

  return (
    <AbsoluteFill>
      {/* the headline */}
      {headO > 0 ? (
        <div style={{ position: "absolute", left: 90, right: 90, top: 210, opacity: headO }}>
          <FlowLine from={tHead} to={tAsk} line={headline.text} size={108} color={W} emphasize={headline.emphasize} empColor={W} underline={W} lineHeight={1.06} />
        </div>
      ) : null}

      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {/* the seats: dashed = open. Seat 0 is covered by the taken card; seat 1 turns solid on `next`. */}
        {slots.map((s, i) => {
          const p = EASE(k(tSeats + i * 110, 300));
          if (p <= 0) return null;
          const solid = i === 1 ? clamp01(nextK * 3) : 0;
          return (
            <rect key={i} x={s.x + 3} y={s.y + 3} width={N.seat.w - 6} height={N.seat.h - 6} rx={18} fill="none" stroke={W} strokeWidth={lerp(5, 8, solid)}
              strokeDasharray={solid >= 1 ? undefined : "18 14"} strokeOpacity={lerp(0.75, 1, solid)} opacity={p} />
          );
        })}
        {/* the reach: from the middle buyer down to the next seat */}
        {reachK > 0 ? (
          <line x1={taker.x} y1={taker.y} x2={lerp(taker.x, target.x, reachK)} y2={lerp(taker.y, target.y, reachK)} stroke={W} strokeWidth={5} strokeDasharray="16 12" />
        ) : null}
        {/* the unnamed buyers */}
        {N.buyers.xs.slice(0, buyers.n).map((x, i) => {
          const p = BACK(k(tBuyers + i * 130, 320));
          if (p <= 0) return null;
          return (
            <g key={i} opacity={clamp01(p * 2)} transform={`translate(0 ${(1 - p) * -60})`}>
              <rect x={x} y={N.buyers.y} width={N.buyers.w} height={N.buyers.h} rx={N.buyers.h / 2} fill="none" stroke={W} strokeWidth={5} strokeDasharray="16 12" />
              <text x={x + N.buyers.w / 2} y={N.buyers.y + N.buyers.h / 2 + 19} textAnchor="middle" fontFamily={DISPLAY} fontWeight={700} fontSize={54} fill={W}>?</text>
            </g>
          );
        })}
      </svg>

      {/* the taken seat: the spine's card, its price on its edge */}
      {takenO > 0 ? (
        <AbsoluteFill style={{ opacity: takenO, transform: `scale(${takenS})`, transformOrigin: `${slots[0].x + N.seat.w / 2}px ${slots[0].y + N.seat.h / 2}px` }}>
          <TargetCard rect={{ x: slots[0].x, y: slots[0].y, w: N.seat.w, h: N.seat.h }} name={taken.name} />
          <EdgePlate cx={slots[0].x + N.seat.w / 2} cy={slots[0].y} w={250} h={72} label={taken.price} size={40} border={W} />
        </AbsoluteFill>
      ) : null}

      {/* the next one */}
      {nextK > 0 ? (
        <div style={{ position: "absolute", left: slots[1].x, top: slots[1].y, width: N.seat.w, height: N.seat.h, display: "flex", alignItems: "center", justifyContent: "center",
          opacity: clamp01(nextK * 3), transform: `scale(${nextS})`, fontFamily: DISPLAY, fontWeight: 700, fontSize: 170, color: W, lineHeight: 1 }}>
          ?
        </div>
      ) : null}

      <Phrase from={tAsk} to={to + 400} line={line.text} top={N.lineTop} size={60} color={W} emphasize={line.emphasize} empColor={W} restColor={INK_SUB_ON_RED} />
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// BriefEnd — the end card (white card world)
// ══════════════════════════════════════════════════════════════════════════
export const END = {
  lockupY: 250,
  issue: { x: 160, y: 380, w: 760, h: 520 },
  tile: { x: 240, y: 530, w: 600, h: 300 },
  button: { x: 160, y: 980, w: 760, h: 132 },
  linkY: 1160,
  taglineY: 1290,
};

export const BriefEnd: React.FC<Win & {
  issue: { label: string } & Cued; // the issue frame rises ("in this"), its label on "this week's"
  labelAt: Cued;
  tile: { name: string; price: string };
  brand: Cued; // the lockup lands
  subscribe: { label: string } & Cued;
  link: { label: string } & Cued; // types
  tagline: { text: string } & Cued;
}> = ({ from, to, issue, labelAt, tile, brand, subscribe, link, tagline }) => {
  const ms = useMs();
  const k = useK();
  const INK = COLORS.ink;
  const E = END;

  const tIssue = at(issue, from + 320, from);
  const tLabel = at(labelAt, tIssue + 150, from, tIssue + 100);
  const tBrand = at(brand, tLabel + 500, from, tLabel + 250);
  const tSub = at(subscribe, tBrand + 1300, from, tBrand + 500);
  const tLink = at(link, tSub + 500, from, tSub + 300);
  const tTag = at(tagline, tLink + 700, from, tLink + 450);

  if (ms < tIssue - 40 || ms > to) return null;

  const issueK = EASE(k(tIssue, 360));
  const brandO = k(tBrand, 120);
  const brandS = interpolate(ms, [tBrand, tBrand + 300], [1.14, 1], { ...CLAMP, easing: EASE });
  const subO = k(tSub, 110);
  const subS = interpolate(ms, [tSub, tSub + 280], [1.08, 1], { ...CLAMP, easing: EASE });
  const typed = Math.round(link.label.length * k(tLink, Math.max(300, Math.min(600, tTag - tLink - 100))));

  return (
    <AbsoluteFill>
      {/* the lockup */}
      <div style={{ position: "absolute", left: 0, right: 0, top: E.lockupY - 40, display: "flex", justifyContent: "center", opacity: brandO, transform: `scale(${brandS})` }}>
        <Wordmark size={80} tone="brand" />
      </div>

      {/* the issue, with the spine filed inside it */}
      <AbsoluteFill style={{ opacity: clamp01(issueK * 2), transform: `translateY(${(1 - issueK) * 70}px)` }}>
        <div style={{ position: "absolute", left: E.issue.x, top: E.issue.y, width: E.issue.w, height: E.issue.h, borderRadius: 30, background: INK }} />
        <div style={{ position: "absolute", left: E.issue.x + 44, top: E.issue.y + 36, opacity: k(tLabel, 130), fontFamily: DISPLAY, fontWeight: 700, fontSize: 40, letterSpacing: TRACK.nav, color: "rgba(255,255,255,0.62)", lineHeight: 1 }}>
          {issue.label}
        </div>
        <TargetCard rect={E.tile} name={tile.name} />
        <EdgePlate cx={E.tile.x + E.tile.w / 2} cy={E.tile.y} w={300} h={84} label={tile.price} size={48} border={INK} />
      </AbsoluteFill>

      {/* the button */}
      <div style={{ position: "absolute", left: E.button.x, top: E.button.y, width: E.button.w, height: E.button.h, background: COLORS.accent, opacity: subO, transform: `scale(${subS})`,
        display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: 62, letterSpacing: TRACK.headline, color: COLORS.paper, whiteSpace: "nowrap" }}>
        {subscribe.label}
      </div>

      {/* the URL types */}
      <div style={{ position: "absolute", left: 0, right: 0, top: E.linkY, textAlign: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: 48, letterSpacing: TRACK.body, color: INK, lineHeight: 1, whiteSpace: "nowrap" }}>
        {link.label.slice(0, typed)}
      </div>

      {/* the tagline, on its words */}
      <div style={{ position: "absolute", left: 90, right: 90, top: E.taglineY }}>
        <FlowLine from={tTag} to={to} line={tagline.text} size={84} color={INK} align="center" />
      </div>
    </AbsoluteFill>
  );
};
