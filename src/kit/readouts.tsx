// ─────────────────────────────────────────────────────────────────────────
// KIT · readouts — TWO TOPLINES, NO NUMBERS. Added on the Bristol Myers Squibb
// two-readouts HORIZONTAL long-form, 2026-10-14 (16:9; absolute 1920x1080
// coordinates, not portrait-safe as written). One-mover rule and the frame
// budget: each cue gets ONE motion, a finished idea retires.
//
// `TwoReadouts` (red, the hook): a day leaf flips, the company is named, two
// announcement cards land and a bracket measures the minutes between them. Each
// card takes a check for the endpoint it met, then an efficacy slot that stays a
// DASHED EMPTY box (dashed = never given, the 08-22 vocabulary rule). In a pause
// the header retires; the cards part on "separate" and each takes a blank dashed
// tag for a disease the script has not named yet.
//
// Every onset is a spoken word with an optional ms pin, clamped monotonic
// (`at()` / `useK()` / `Cued` / `Win` come from ./elora).
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { CLAMP, clamp01, COLORS, DISPLAY, inkA, TRACK, useMs } from "./core";
import { TYPE } from "../style";
import { at, lerp, useK, type Cued, type Win } from "./elora";
import { DayLeaf } from "./unity";

const EASE = Easing.out(Easing.cubic);
const EASE_IO = Easing.inOut(Easing.cubic);
const BACK = Easing.out(Easing.back(1.7));

const label = (color: string, size: number = TYPE.label): React.CSSProperties => ({
  fontFamily: DISPLAY, fontWeight: 700, fontSize: size, letterSpacing: TRACK.kicker, color, whiteSpace: "nowrap",
});
const big = (color: string, size: number): React.CSSProperties => ({
  fontFamily: DISPLAY, fontWeight: 700, fontSize: size, letterSpacing: TRACK.display, color, lineHeight: 1, whiteSpace: "nowrap",
});

// ══════════════════════════════════════════════════════════════════════════
// TwoReadouts — the hook (red world)
// ══════════════════════════════════════════════════════════════════════════
export const READOUTS = {
  leaf: { x: 130, y: 96, w: 170, h: 186 },
  name: { left: 340, top: 138, size: 104 },
  card: { w: 620, h: 440, y: 420, xa: 290, xb: 1010, split: 130 }, // the cards part by `split` each way
  bracket: { y: 372, tick: 22 },
  tag: { w: 360, h: 64, gap: 26 }, // the blank disease tag under each card
};

/** One announcement card. Everything on it is driven by 0..1 progress values. */
const ReadoutCard: React.FC<{
  x: number; land: number; head: string; headO: number;
  check: number; metLabel: string; metO: number;
  box: number; slotLabel: string; slotO: number; dash: number;
}> = ({ x, land, head, headO, check, metLabel, metO, box, slotLabel, slotO, dash }) => {
  if (land <= 0) return null;
  const C = READOUTS.card;
  const INK = COLORS.ink;
  const per = 2 * (C.w - 72 + 96); // the dashed slot's perimeter, for the draw-on
  return (
    <div style={{ position: "absolute", left: x, top: C.y + (1 - BACK(land)) * 70, width: C.w, height: C.h, borderRadius: 28, background: COLORS.paper, opacity: clamp01(land * 4) }}>
      <div style={{ position: "absolute", left: 36, top: 32, opacity: headO, ...label(inkA(0.6), 30) }}>{head}</div>
      <div style={{ position: "absolute", left: 36, right: 36, top: 92, height: 3, background: inkA(0.12) }} />

      {/* row 1: the endpoint it met */}
      <div style={{ position: "absolute", left: 36, top: 128, width: 64, height: 64, borderRadius: 32, background: INK, opacity: clamp01(check * 3), transform: `scale(${lerp(1.5, 1, EASE(check))})` }}>
        <svg width={64} height={64} viewBox="0 0 64 64"><path d="M18 33 L28 43 L46 23" fill="none" stroke={COLORS.paper} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
      <div style={{ position: "absolute", left: 120, top: 136, opacity: metO, ...big(INK, 40) }}>{metLabel}</div>

      {/* row 2: the efficacy number, which never arrives */}
      <div style={{ position: "absolute", left: 36, top: 232, opacity: slotO, ...label(inkA(0.6)) }}>{slotLabel}</div>
      <svg style={{ position: "absolute", left: 36, top: 284 }} width={C.w - 72} height={96}>
        <rect x={2} y={2} width={C.w - 76} height={92} rx={18} fill="none" stroke={inkA(0.55)} strokeWidth={4} strokeDasharray="16 12" pathLength={per}
          style={{ clipPath: `inset(0 ${(1 - EASE_IO(box)) * 100}% 0 0)` }} />
      </svg>
      <div style={{ position: "absolute", left: 36, top: 284, width: C.w - 72, height: 96, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 84, height: 10, borderRadius: 5, background: INK, opacity: clamp01(dash * 3), transform: `scaleX(${EASE(dash)})` }} />
      </div>
    </div>
  );
};

export const TwoReadouts: React.FC<Win & {
  date: { month: string; day: string } & Cued; // the leaf flips
  company: { name: string } & Cued;
  first: Cued; // card one lands
  head: { label: string } & Cued; // "Phase 3" is written on the cards
  second: Cued; // card two lands
  apart: { label: string } & Cued; // the bracket between them
  apartLabel: Cued;
  clear: Cued; // a pause: the bracket retires
  metA: Cued; // the check on card one
  metB: Cued; // ...and on card two
  met: { label: string } & Cued; // "Primary endpoint met"
  slotA: Cued; // the dashed slot draws on card one
  slotB: Cued; // ...and on card two
  slot: { label: string } & Cued; // "Efficacy number"
  blank: Cued; // a dash in each slot: nothing given
  retire: Cued; // a pause: the leaf and the name leave
  split: Cued; // the cards part
  rule: Cued; // the divider between them
  tags: Cued; // a blank disease tag under each
}> = ({ from, to, date, company, first, head, second, apart, apartLabel, clear, metA, metB, met, slotA, slotB, slot, blank, retire, split, rule, tags }) => {
  const ms = useMs();
  const k = useK();
  const WH = COLORS.paper;
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));

  const tDate = at(date, from, from);
  const tName = at(company, tDate + 900, from, tDate + 300);
  const tFirst = at(first, tName + 1200, from, tName + 400);
  const tHead = at(head, tFirst + 200, from, tFirst + 100);
  const tSecond = at(second, tHead + 500, from, tHead + 200);
  const tApart = at(apart, tSecond + 900, from, tSecond + 400);
  const tApartL = at(apartLabel, tApart + 200, from, tApart + 150);
  const tClear = at(clear, tApartL + 700, from, tApartL + 400);
  const tMetA = at(metA, tClear + 1200, from, tClear + 300);
  const tMetB = at(metB, tMetA + 220, from, tMetA + 180);
  const tMet = at(met, tMetB + 240, from, tMetB + 180);
  const tSlotA = at(slotA, tMet + 1800, from, tMet + 500);
  const tSlotB = at(slotB, tSlotA + 500, from, tSlotA + 300);
  const tSlot = at(slot, tSlotB + 250, from, tSlotB + 200);
  const tBlank = at(blank, tSlot + 800, from, tSlot + 300);
  const tRetire = at(retire, tBlank + 700, from, tBlank + 400);
  const tSplit = at(split, tRetire + 700, from, tRetire + 350);
  const tRule = at(rule, tSplit + 600, from, tSplit + 450);
  const tTags = at(tags, tRule + 1300, from, tRule + 400);

  const L = READOUTS.leaf;
  const N = READOUTS.name;
  const C = READOUTS.card;
  const Bk = READOUTS.bracket;
  const T = READOUTS.tag;

  const headerO = 1 - k(tRetire, 320);
  const nameO = k(tName, 140) * headerO;
  const nameX = (1 - EASE(k(tName, 380))) * -50;

  const sq = EASE_IO(k(tSplit, 560));
  const xa = C.xa - C.split * sq;
  const xb = C.xb + C.split * sq;

  // the bracket: from one card's centre to the other's, drawn left to right
  const bq = EASE_IO(k(tApart, 420));
  const bO = 1 - k(tClear, 260);
  const bx0 = C.xa + C.w / 2;
  const bx1 = C.xb + C.w / 2;

  const ruleQ = EASE_IO(k(tRule, 480));
  const tagQ = EASE(k(tTags, 420));

  if (ms < tDate - 60) return null;
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {/* ── the header: date and company (retires in a pause) ── */}
      <div style={{ opacity: headerO }}>
        <DayLeaf rect={L} k={k(tDate, 520)} month={date.month} day={date.day} />
      </div>
      <div style={{ position: "absolute", left: N.left, top: N.top, opacity: nameO, transform: `translateX(${nameX}px)`, ...big(WH, N.size) }}>{company.name}</div>

      {/* ── the minutes between them ── */}
      {ms >= tApart - 20 && bO > 0 ? (
        <div style={{ opacity: bO }}>
          <div style={{ position: "absolute", left: bx0, top: Bk.y, width: (bx1 - bx0) * bq, height: 4, background: WH }} />
          <div style={{ position: "absolute", left: bx0 - 2, top: Bk.y, width: 4, height: Bk.tick, background: WH, opacity: clamp01(bq * 6) }} />
          <div style={{ position: "absolute", left: bx1 - 2, top: Bk.y, width: 4, height: Bk.tick, background: WH, opacity: clamp01((bq - 0.9) * 10) }} />
          <div style={{ position: "absolute", left: bx0, width: bx1 - bx0, top: Bk.y - 46, textAlign: "center", opacity: k(tApartL, 200), ...label(WH, 30) }}>{apart.label}</div>
        </div>
      ) : null}

      {/* ── the two announcements ── */}
      <ReadoutCard x={xa} land={k(tFirst, 420)} head={head.label} headO={k(tHead, 180)}
        check={k(tMetA, 260)} metLabel={met.label} metO={k(tMet, 200)}
        box={k(tSlotA, 420)} slotLabel={slot.label} slotO={k(tSlot, 200)} dash={k(tBlank, 260)} />
      <ReadoutCard x={xb} land={k(tSecond, 420)} head={head.label} headO={k(tSecond, 300)}
        check={k(tMetB, 260)} metLabel={met.label} metO={k(tMet, 200)}
        box={k(tSlotB, 420)} slotLabel={slot.label} slotO={k(tSlot, 200)} dash={k(tBlank, 260)} />

      {/* ── separate programs, separate diseases ── */}
      <div style={{ position: "absolute", left: 958, top: C.y - 20, width: 4, height: (C.h + 20 + T.gap + T.h + 10) * ruleQ, background: WH }} />
      {tagQ > 0 ? [xa, xb].map((x, i) => (
        <svg key={i} style={{ position: "absolute", left: x + (C.w - T.w) / 2, top: C.y + C.h + T.gap + (1 - tagQ) * 24, opacity: clamp01(tagQ * 3) }} width={T.w} height={T.h}>
          <rect x={2} y={2} width={T.w - 4} height={T.h - 4} rx={(T.h - 4) / 2} fill="none" stroke={WH} strokeWidth={4} strokeDasharray="16 12" />
        </svg>
      )) : null}
    </AbsoluteFill>
  );
};
