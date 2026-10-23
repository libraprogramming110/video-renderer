// ─────────────────────────────────────────────────────────────────────────
// KIT · markers — THE SIGNAL, IN ORDER. Added on the AstraZeneca x insitro
// HORIZONTAL long-form, 2026-10-22 (16:9; absolute 1920x1080, on the white card).
//
// Motion law (Nel, 2026-10-22): one mover at a time, each one big. Nothing loops.
//
// `SignalOrder` (white card, §7): a plain NUMBERED WATCH LIST, two cards read left to
//   right with an arrow between them. The title cascades in; card 1 ("First") slams up,
//   its dashed empty "?" slot drops in; card 2 ("Then") swings open in 3D as the arrow
//   shoots across; its dashed "expected" date box pops; on "target-finding claim" card 1
//   dims and card 2 comes forward; on "meet patients" a solid red pill slams onto card 2.
//   Nothing is claimed as reached: the slot stays empty, the date is dashed.
// History (2026-10-22): two earlier versions drew the signal on the rail (a branch off the
//   rail's start, then a second short rail). Nel: "confusing for the viewer to understand".
//   When the VO says "watch for these, in order", a numbered list of plain-language cards
//   beats a diagram the viewer has to decode.
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { CLAMP, clamp01, COLORS, inkA, useMs } from "./core";
import { at, lerp, useK, type Cued, type Win } from "./elora";
import { big, label, stamp } from "./rona";
import { BarReveal, Letters } from "./hunt";

const EASE = Easing.out(Easing.cubic);
const EASE_IO = Easing.inOut(Easing.cubic);
const BACK = Easing.out(Easing.back(1.6));
const BOUNCE = Easing.out(Easing.bounce);

export const SIG = {
  title: { top: 96, size: 64 },
  cards: { lefts: [150, 1030] as const, top: 230, w: 740, h: 600, pad: 56 },
  kicker: { dy: 52, size: 40 },
  head: { dy: 132, size: 56 },
  sub: { dy: 296, size: 34 },
  box: { dy: 370, w: 420, h: 110, size: 34 },
  pill: { dy: 504, size: 34 },
  arrow: { x0: 912, x1: 1008, y: 530 },
  badge: { r: 30, size: 38 },
};

/** a numbered badge that sits INLINE (in a flex row with its label) */
const Badge: React.FC<{ n: string }> = ({ n }) => {
  const r = SIG.badge.r;
  return (
    <div style={{ flex: "none", width: r * 2, height: r * 2, borderRadius: r, background: COLORS.ink, display: "flex", alignItems: "center", justifyContent: "center", ...big(COLORS.paper, SIG.badge.size) }}>{n}</div>
  );
};

type CardText = { kicker: string; head: [string, string]; sub: string };

export const SignalOrder: React.FC<Win & {
  title: { text: string } & Cued; // cascades in
  first: CardText & Cued; // card 1 slams up
  either: Cued; // card 1's sub ("from either deal") + its empty slot
  then: CardText & Cued; // the arrow shoots, card 2 swings open
  liver: Cued; // card 2's sub
  date: { label: string } & Cued; // card 2's dashed date box
  focus: Cued; // card 1 dims, card 2 comes forward
  meet: { label: string } & Cued; // the red pill
}> = ({ from, to, title, first, either, then, liver, date, focus, meet }) => {
  const ms = useMs();
  const k = useK();
  const INK = COLORS.ink;
  const RED = COLORS.accent;
  const SUB = inkA(0.55);
  const S = SIG;
  const C = S.cards;
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));

  const tTitle = at(title, from, from);
  const tFirst = at(first, tTitle + 1500, from, tTitle + 600);
  const tEither = at(either, tFirst + 2500, from, tFirst + 700);
  const tThen = at(then, tEither + 1200, from, tEither + 500);
  const tLiver = at(liver, tThen + 2600, from, tThen + 900);
  const tDate = at(date, tLiver + 2500, from, tLiver + 600);
  const tFocus = at(focus, tDate + 1500, from, tDate + 600);
  const tMeet = at(meet, tFocus + 1100, from, tFocus + 700);

  const c1 = k(tFirst, 620);
  const arrowQ = EASE_IO(k(tThen, 380));
  const c2 = k(tThen + 200, 700);
  const fq = EASE_IO(k(tFocus, 500));
  const slotQ = k(tEither, 640);
  const dateQ = k(tDate, 420);
  const meetQ = k(tMeet, 380);

  const card = (i: 0 | 1, body: React.ReactNode) => {
    const left = C.lefts[i];
    const enter = i === 0
      ? { transform: `translateY(${lerp(700, 0, BACK(c1))}px) rotate(${lerp(-8, 0, EASE(c1))}deg)`, opacity: clamp01(c1 * 4) }
      : { transform: `perspective(1600px) rotateY(${lerp(-92, 0, BACK(c2))}deg)`, transformOrigin: "0% 50%", opacity: clamp01(c2 * 4) };
    const focusT = i === 0 ? { opacity: lerp(1, 0.3, fq) } : { transform: `scale(${lerp(1, 1.04, fq)})` };
    return (
      <div style={{ position: "absolute", left, top: C.top, width: C.w, height: C.h, ...focusT }}>
        <div style={{ position: "absolute", inset: 0, borderRadius: 30, border: `6px solid ${INK}`, boxSizing: "border-box", background: COLORS.paper, ...enter }}>{body}</div>
      </div>
    );
  };

  const text = (c: CardText, sub: number, n: string) => (
    <>
      <div style={{ position: "absolute", left: C.pad, top: S.kicker.dy, display: "flex", alignItems: "center", gap: 16, ...big(INK, S.kicker.size) }}>
        <Badge n={n} />
        {c.kicker}
      </div>
      <div style={{ position: "absolute", left: C.pad, right: C.pad, top: S.head.dy, ...big(INK, S.head.size), lineHeight: 1.15 }}>
        <div>{c.head[0]}</div>
        <div>{c.head[1]}</div>
      </div>
      <div style={{ position: "absolute", left: C.pad, top: S.sub.dy, ...label(SUB, S.sub.size) }}>
        <BarReveal t={sub} color={SUB}>{c.sub}</BarReveal>
      </div>
    </>
  );

  if (ms < tTitle - 60) return null;
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <div style={{ position: "absolute", left: 0, width: 1920, top: S.title.top, textAlign: "center", ...big(INK, S.title.size) }}>
        <Letters text={title.text} t={tTitle} stagger={26} rise={50} mode="flip" />
      </div>

      {/* ── card 1: first ── */}
      {c1 > 0
        ? card(0, (
            <>
              {text(first, tEither, "1")}
              {slotQ > 0 ? (
                <div style={{ position: "absolute", left: C.pad, top: S.box.dy + lerp(-500, 0, BOUNCE(slotQ)), width: S.box.w, height: S.box.h, borderRadius: 20, border: `5px dashed ${INK}`, boxSizing: "border-box",
                  display: "flex", alignItems: "center", gap: 18, paddingLeft: 28, opacity: clamp01(slotQ * 4), ...label(SUB, S.box.size) }}>
                  Name: <span style={{ ...big(inkA(0.35), 64) }}>?</span>
                </div>
              ) : null}
            </>
          ))
        : null}

      {/* ── the order: an arrow shoots from card 1 to card 2 ── */}
      {arrowQ > 0 ? (
        <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible", opacity: lerp(1, 0.3, fq) }} width={1920} height={1080}>
          <line x1={S.arrow.x0} y1={S.arrow.y} x2={lerp(S.arrow.x0, S.arrow.x1, arrowQ)} y2={S.arrow.y} stroke={INK} strokeWidth={8} strokeLinecap="round" />
          {arrowQ >= 1 ? <path d={`M ${S.arrow.x1 - 22} ${S.arrow.y - 20} L ${S.arrow.x1} ${S.arrow.y} L ${S.arrow.x1 - 22} ${S.arrow.y + 20}`} fill="none" stroke={INK} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" /> : null}
        </svg>
      ) : null}

      {/* ── card 2: then ── */}
      {c2 > 0
        ? card(1, (
            <>
              {text(then, tLiver, "2")}
              {dateQ > 0 ? (
                <div style={{ position: "absolute", left: C.pad, top: S.box.dy, width: S.box.w, height: S.box.h, borderRadius: 20, border: `5px dashed ${INK}`, boxSizing: "border-box",
                  display: "flex", alignItems: "center", justifyContent: "center", transformOrigin: "0% 50%", transform: `scale(${BACK(dateQ)})`, ...big(INK, S.box.size) }}>{date.label}</div>
              ) : null}
              {meetQ > 0 ? (
                <div style={{ position: "absolute", left: C.pad, top: S.pill.dy, padding: "12px 28px", borderRadius: 40, background: RED, transformOrigin: "0% 50%", ...label(COLORS.paper, S.pill.size), ...stamp(meetQ, 3), filter: meetQ < 1 ? `blur(${(1 - EASE(meetQ)) * 14}px)` : undefined }}>{meet.label}</div>
              ) : null}
            </>
          ))
        : null}
    </AbsoluteFill>
  );
};
