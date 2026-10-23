// ─────────────────────────────────────────────────────────────────────────
// KIT · unnamed — A BIG PRICE FOR A COMPANY NOBODY COULD NAME. Added on the
// Shionogi × IntraBio long-form, 2026-10-07 (VERTICAL). Built under the
// one-mover rule (09-30) and the frame budget (10-05): each cue gets ONE
// motion, anything landed goes still, a finished idea retires.
//
// THE SPINE is the target's CARD (`UNNAMED` seats, `TargetCard`): born in the
// hook, revealed on the same seat by the next world's wipe, then shrunk into
// the header chip of the drug label it "owns".
//
// `PaidFor` (red, the hook): "$2 billion. That's what Shionogi paid for
// IntraBio… an Austin biotech most investors couldn't name on Friday." The
// figure slams huge; on "That's" it pulls up into a price plate; the buyer
// stamps above it; on "paid" the plate rides a line DOWN; the target's card
// stamps under it on its name. A pin drops on the city. On "most investors"
// the deal retires and the camera pushes in on the card alone; on "couldn't"
// the name's letters fall out one by one, leaving a blank to fill; a "?"
// stamps on "name"; a day leaf flips onto the corner on "Friday".
//
// `LabelOpens` (ink, over a FootageScrim): "IntraBio owns Aqneursa… an
// FDA-approved therapy for a rare neurological disease called Niemann-Pick
// type C… with a second approval added in September for
// ataxia-telangiectasia." The card (named again) shrinks to a header chip on
// "owns"; the drug's label stamps under it; an approval stamp slams on
// "FDA-approved", the disease class and the indication write in on their
// words; after the pause the label GROWS a second row, a second stamp slams,
// the month and the indication write in.
//
// Every onset is a spoken word with an optional ms pin, clamped monotonic.
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { CLAMP, clamp01, COLORS, DISPLAY, INK_SUB, INK_SUB_ON_RED, TRACK, useMs } from "./core";
import { TYPE } from "../style";
import { at, lerp, Phrase, useK, type Cued, type Win } from "./elora";

const EASE = Easing.out(Easing.cubic);
const EASE_IO = Easing.inOut(Easing.cubic);
const BACK = Easing.out(Easing.back(1.6));

type Rect = { x: number; y: number; w: number; h: number };
const mix = (a: Rect, b: Rect, t: number): Rect => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), w: lerp(a.w, b.w, t), h: lerp(a.h, b.h, t) });

/** The spine's seats (1080×1920). Import these in every block that shows the card. */
export const UNNAMED = {
  big: { x: 120, y: 560, w: 840, h: 560 }, // alone in the frame (end of the hook, start of §2)
  deal: { x: 190, y: 770, w: 700, h: 430 }, // under the price plate
  chip: { x: 330, y: 180, w: 420, h: 116 }, // the header chip of what it owns
  lineTop: 1310, // narration
};

const Pin: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size * 0.72} height={size} viewBox="0 0 36 50" style={{ display: "block", flex: "none" }}>
    <path d="M18 0C8 0 0 8 0 18c0 13 18 32 18 32s18-19 18-32C36 8 28 0 18 0z" fill={color} />
    <circle cx={18} cy={18} r={7} fill={COLORS.paper} />
  </svg>
);

/**
 * The target's card. Content is laid out in the BIG seat's space (840 wide) and
 * scaled with the rect, so the same card reads at every seat.
 *  blank 0→1: the name's letters fall out right-to-left, each leaving a dash.
 *  ask 0→1: a "?" stamps where the name was.  sub 0→1: the place line's height.
 */
export const TargetCard: React.FC<{
  rect: Rect;
  name: string;
  opacity?: number;
  scale?: number;
  blank?: number;
  ask?: number;
  sub?: number;
  place?: { city: string; kind: string; pinK: number; cityK: number; kindK: number };
}> = ({ rect, name, opacity = 1, scale = 1, blank = 0, ask = 0, sub = 1, place }) => {
  const s = rect.w / UNNAMED.big.w;
  const letters = name.split("");
  const n = letters.length;
  return (
    <div style={{ position: "absolute", left: rect.x, top: rect.y, width: rect.w, height: rect.h, opacity, transform: `scale(${scale})`,
      background: COLORS.paper, borderRadius: 30 * Math.max(0.6, s) }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: UNNAMED.big.w, height: rect.h / s, transform: `scale(${s})`, transformOrigin: "0 0",
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ position: "relative", fontFamily: DISPLAY, fontWeight: 700, fontSize: 150, letterSpacing: TRACK.display, color: COLORS.ink, lineHeight: 1, whiteSpace: "nowrap" }}>
          {letters.map((ch, i) => {
            // right-to-left cascade: the last letter goes first
            const d = clamp01(blank * (n + 2) - (n - 1 - i));
            return (
              <span key={i} style={{ position: "relative", display: "inline-block" }}>
                <span style={{ display: "inline-block", opacity: 1 - d, transform: `translateY(${d * 46}px)` }}>{ch}</span>
                <span style={{ position: "absolute", left: "10%", right: "10%", bottom: 6, height: 9, background: COLORS.ink, opacity: d }} />
              </span>
            );
          })}
          {ask > 0 ? (
            <div style={{ position: "absolute", left: 0, right: 0, top: -14, textAlign: "center", opacity: clamp01(ask * 3), transform: `scale(${lerp(1.5, 1, EASE(ask))})` }}>?</div>
          ) : null}
        </div>
        {place ? (
          <div style={{ height: 96 * sub, opacity: sub, overflow: "hidden", display: "flex", alignItems: "flex-end", gap: 18 }}>
            <div style={{ opacity: clamp01(place.pinK * 2), transform: `translateY(${(1 - BACK(place.pinK)) * -70}px)`, paddingBottom: 6 }}>
              <Pin size={58} color={COLORS.accent} />
            </div>
            <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 58, letterSpacing: TRACK.body, color: COLORS.ink, lineHeight: 1.15, whiteSpace: "nowrap" }}>
              <span style={{ opacity: place.cityK }}>{place.city}</span>
              <span style={{ opacity: place.kindK, fontWeight: 400 }}> {place.kind}</span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// PaidFor — the hook (red world)
// ══════════════════════════════════════════════════════════════════════════
const PF = {
  hero: { x: 540, y: 860 }, // centre of the stacked figure
  buyer: { x: 320, y: 240, w: 440, h: 116 },
  plate: { w: 440, h: 124, y0: 470 }, // centre y before it is paid
  leaf: { x: 820, y: 478, w: 170, h: 172 },
};

export const PaidFor: React.FC<Win & {
  figure: { big: string; unit: string; plate: string } & Cued; // "$2" slams
  unit: Cued; // "billion" lands under it
  pull: Cued; // the figure becomes a price plate ("That's what")
  buyer: { name: string } & Cued;
  paid: Cued; // the plate rides down
  target: { name: string } & Cued; // the card stamps
  city: { label: string } & Cued; // the pin drops
  kind: { label: string } & Cued;
  push: Cued; // the deal retires, the camera pushes in ("most investors")
  blank: Cued; // the name falls out ("couldn't")
  ask: Cued; // "?" ("name")
  day: { label: string } & Cued; // the day leaf flips ("Friday")
  lines: { text: string; emphasize?: string; word?: string }[]; // exactly two
}> = ({ from, to, figure, unit, pull, buyer, paid, target, city, kind, push, blank, ask, day, lines }) => {
  const ms = useMs();
  const k = useK();
  const W = COLORS.paper;

  const tFig = at(figure, from, from);
  const tUnit = at(unit, tFig + 600, from, tFig + 200);
  const tPull = at(pull, tUnit + 1600, from, tUnit + 500);
  const tBuyer = at(buyer, tPull + 400, from, tPull + 300);
  const tPaid = at(paid, tBuyer + 600, from, tBuyer + 250);
  const tTarget = at(target, tPaid + 450, from, tPaid + 300);
  const tCity = at(city, tTarget + 1100, from, tTarget + 400);
  const tKind = at(kind, tCity + 600, from, tCity + 200);
  const tPush = at(push, tKind + 500, from, tKind + 300);
  const tBlank = at(blank, tPush + 900, from, tPush + 550);
  const tAsk = at(ask, tBlank + 280, from, tBlank + 200);
  const tDay = at(day, tAsk + 320, from, tAsk + 200);

  if (ms < tFig - 40 || ms > to) return null;

  // the hero figure, then its pull into the plate
  const figO = k(tFig, 120);
  const figS = interpolate(ms, [tFig, tFig + 300], [1.18, 1], { ...CLAMP, easing: EASE });
  const unitK = EASE(k(tUnit, 260));
  const pullK = EASE_IO(k(tPull, 380));
  const heroS = lerp(1, 0.2, pullK);
  const heroY = lerp(PF.hero.y, PF.plate.y0, pullK);
  const heroO = 1 - clamp01((pullK - 0.55) / 0.35);
  const plateO = clamp01((pullK - 0.6) / 0.4);

  // the deal
  const buyerO = k(tBuyer, 120);
  const buyerS = interpolate(ms, [tBuyer, tBuyer + 280], [1.16, 1], { ...CLAMP, easing: EASE });
  const stubK = EASE(k(tBuyer + 120, 200));
  const paidK = EASE_IO(k(tPaid, 420));
  const plateY = lerp(PF.plate.y0, UNNAMED.deal.y, paidK);
  const lineTop = PF.buyer.y + PF.buyer.h;
  const lineBot = lerp(lineTop, plateY - PF.plate.h / 2, stubK);

  // the card, then the push-in
  const cardO = k(tTarget, 120);
  const cardS = interpolate(ms, [tTarget, tTarget + 300], [1.07, 1], { ...CLAMP, easing: EASE });
  const pushK = EASE_IO(k(tPush, 560));
  const rect = mix(UNNAMED.deal, UNNAMED.big, pushK);
  const dealO = 1 - k(tPush, 300);
  const dealY = -pushK * 140;

  const blankK = k(tBlank, Math.max(220, tAsk - tBlank));
  const askK = k(tAsk, 260);
  const dayK = k(tDay, 380);

  return (
    <AbsoluteFill>
      {/* the figure: "$2" over "billion" */}
      {heroO > 0 ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: heroY, transform: `translateY(-50%) scale(${heroS})`, opacity: heroO * figO, textAlign: "center",
          fontFamily: DISPLAY, fontWeight: 700, color: W, lineHeight: 0.9, letterSpacing: TRACK.display }}>
          <div style={{ fontSize: 520, transform: `scale(${figS})` }}>{figure.big}</div>
          <div style={{ fontSize: 190, opacity: unitK, transform: `translateY(${(1 - unitK) * 40}px)` }}>{figure.unit}</div>
        </div>
      ) : null}

      {/* the target's card (under the plate) */}
      {cardO > 0 ? (
        <TargetCard rect={rect} name={target.name} opacity={cardO} scale={cardS} blank={blankK} ask={askK}
          place={{ city: city.label, kind: kind.label, pinK: k(tCity, 380), cityK: k(tCity + 60, 140), kindK: k(tKind, 140) }} />
      ) : null}

      {/* the deal: buyer, line, price plate. Retires on the push-in. */}
      {dealO > 0 ? (
        <AbsoluteFill style={{ opacity: dealO, transform: `translateY(${dealY}px)` }}>
          {stubK > 0 ? <div style={{ position: "absolute", left: 540 - 3, top: lineTop, width: 6, height: Math.max(0, lineBot - lineTop), background: W }} /> : null}
          <div style={{ position: "absolute", left: PF.buyer.x, top: PF.buyer.y, width: PF.buyer.w, height: PF.buyer.h, borderRadius: 24, background: W, opacity: buyerO, transform: `scale(${buyerS})`,
            display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: 68, letterSpacing: TRACK.headline, color: COLORS.ink }}>
            {buyer.name}
          </div>
          <div style={{ position: "absolute", left: 540 - PF.plate.w / 2, top: plateY - PF.plate.h / 2, width: PF.plate.w, height: PF.plate.h, borderRadius: PF.plate.h / 2, boxSizing: "border-box",
            background: COLORS.accent, border: `6px solid ${W}`, opacity: plateO, display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: DISPLAY, fontWeight: 700, fontSize: 70, letterSpacing: TRACK.headline, color: W, whiteSpace: "nowrap" }}>
            {figure.plate}
          </div>
        </AbsoluteFill>
      ) : null}

      {/* the day leaf, on the card's corner */}
      {dayK > 0 ? (
        <div style={{ position: "absolute", left: PF.leaf.x, top: PF.leaf.y, width: PF.leaf.w, height: PF.leaf.h, perspective: 900 }}>
          <div style={{ width: "100%", height: "100%", borderRadius: 20, overflow: "hidden", background: COLORS.ink, opacity: clamp01(dayK * 4),
            transformOrigin: "50% 0%", transform: `rotateX(${lerp(-88, 0, BACK(dayK))}deg)` }}>
            <div style={{ height: 44, background: COLORS.accent }} />
            <div style={{ height: PF.leaf.h - 44, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: 76, letterSpacing: TRACK.headline, color: W }}>
              {day.label}
            </div>
          </div>
        </div>
      ) : null}

      <Phrase from={at({ word: lines[0].word }, tPull, from)} to={tCity - 60} line={lines[0].text} top={UNNAMED.lineTop} size={62} color={W} emphasize={lines[0].emphasize} empColor={W} restColor={INK_SUB_ON_RED} />
      <Phrase from={tCity} to={to + 400} line={lines[1].text} top={UNNAMED.lineTop} size={62} color={W} emphasize={lines[1].emphasize} empColor={W} restColor={INK_SUB_ON_RED} />
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// LabelOpens — what the card owns (ink world, over a FootageScrim)
// ══════════════════════════════════════════════════════════════════════════
export const DRUG_LABEL = {
  x: 110, y: 470, w: 860,
  head: 230, // the drug-name band
  row: 270, // one approval row
  pad: 56,
  stampR: 92,
};

type ApprovalRow = {
  stamp: Cued; // the approval stamp slams
  sub: { label: string } & Cued; // the small line above the indication
  name: { lines: string[]; durMs?: number } & Cued; // the indication writes in
};

const ApprovalStamp: React.FC<{ cx: number; cy: number; t: number; top: string; bottom: string }> = ({ cx, cy, t, top, bottom }) => {
  const ms = useMs();
  if (ms < t) return null;
  const o = clamp01((ms - t) / 100);
  const s = interpolate(ms, [t, t + 260], [1.7, 1], { ...CLAMP, easing: EASE });
  const R = DRUG_LABEL.stampR;
  return (
    <div style={{ position: "absolute", left: cx - R, top: cy - R, width: R * 2, height: R * 2, opacity: o, transform: `rotate(-10deg) scale(${s})` }}>
      <svg width={R * 2} height={R * 2} style={{ position: "absolute", inset: 0 }}>
        <circle cx={R} cy={R} r={R - 6} fill="none" stroke={COLORS.accent} strokeWidth={9} />
        <circle cx={R} cy={R} r={R - 22} fill="none" stroke={COLORS.accent} strokeWidth={3} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontWeight: 700, color: COLORS.accent, lineHeight: 1 }}>
        <div style={{ fontSize: 56, letterSpacing: TRACK.headline }}>{top}</div>
        <div style={{ fontSize: 25, letterSpacing: TRACK.nav, marginTop: 6 }}>{bottom}</div>
      </div>
    </div>
  );
};

export const LabelOpens: React.FC<Win & {
  owner: { name: string; city: string; kind: string } & Cued; // the card shrinks to the header chip ("owns")
  drug: { name: string } & Cued; // the label stamps
  stamp: { top: string; bottom: string };
  first: ApprovalRow;
  grow: Cued; // the label grows a second row ("with a second")
  second: ApprovalRow;
  lines: { text: string; emphasize?: string; word?: string }[]; // exactly three
}> = ({ from, to, owner, drug, stamp, first, grow, second, lines }) => {
  const ms = useMs();
  const k = useK();
  const W = COLORS.paper;
  const L = DRUG_LABEL;

  const tOwn = at(owner, from + 700, from);
  const tDrug = at(drug, tOwn + 400, from, tOwn + 300);
  const t1s = at(first.stamp, tDrug + 1000, from, tDrug + 500);
  const t1u = at(first.sub, t1s + 1200, from, t1s + 400);
  const t1n = at(first.name, t1u + 1800, from, t1u + 400);
  const tGrow = at(grow, t1n + 1800, from, t1n + 800);
  const t2s = at(second.stamp, tGrow + 450, from, tGrow + 350);
  const t2u = at(second.sub, t2s + 800, from, t2s + 350);
  const t2n = at(second.name, t2u + 900, from, t2u + 350);

  if (ms > to) return null;

  // the card → the header chip
  const ownK = EASE_IO(k(tOwn, 340));
  const rect = mix(UNNAMED.big, UNNAMED.chip, ownK);

  // the label
  const inO = k(tDrug, 140);
  const inS = lerp(0.93, 1, BACK(k(tDrug, 360)));
  const growK = EASE_IO(k(tGrow, 440));
  const h = L.head + L.row * (1 + growK);
  const stemK = EASE(k(tDrug - 60, 220));
  const chipBot = UNNAMED.chip.y + UNNAMED.chip.h;

  const row = (r: ApprovalRow, top: number, ts: number, tu: number, tn: number) => {
    const dur = r.name.durMs ?? 700;
    const per = dur / r.name.lines.length;
    const textLeft = L.pad + L.stampR * 2 + 40;
    return (
      <>
        <ApprovalStamp cx={L.pad + L.stampR} cy={top + L.row / 2} t={ts} top={stamp.top} bottom={stamp.bottom} />
        <div style={{ position: "absolute", left: textLeft, right: 36, top: top + 44, fontFamily: DISPLAY, fontWeight: 700, fontSize: TYPE.labelSm, letterSpacing: TRACK.nav, color: INK_SUB,
          opacity: k(tu, 140), transform: `translateY(${(1 - EASE(k(tu, 220))) * 14}px)`, whiteSpace: "nowrap" }}>
          {r.sub.label}
        </div>
        <div style={{ position: "absolute", left: textLeft, right: 36, top: top + 98, fontFamily: DISPLAY, fontWeight: 700, fontSize: 60, letterSpacing: TRACK.headline, color: W, lineHeight: 1.08, whiteSpace: "nowrap" }}>
          {r.name.lines.map((ln, i) => {
            const q = EASE(k(tn + per * i, per));
            return <div key={i} style={{ clipPath: `inset(-10% ${(1 - q) * 100}% -10% 0)` }}>{ln}</div>;
          })}
        </div>
      </>
    );
  };

  return (
    <AbsoluteFill>
      {/* the stem from the chip into the label */}
      {stemK > 0 ? <div style={{ position: "absolute", left: 540 - 3, top: chipBot, width: 6, height: (L.y - chipBot) * stemK, background: W }} /> : null}

      {/* the label */}
      {inO > 0 ? (
        <div style={{ position: "absolute", left: L.x, top: L.y, width: L.w, height: h, boxSizing: "border-box", borderRadius: 30, overflow: "hidden", background: "rgba(0,0,0,0.78)", border: `4px solid ${W}`,
          opacity: inO, transform: `scale(${inS})`, transformOrigin: "50% 0%" }}>
          <div style={{ position: "absolute", left: L.pad, top: 0, height: L.head, display: "flex", alignItems: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: 138, letterSpacing: TRACK.display, color: W, whiteSpace: "nowrap" }}>
            {drug.name}
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: L.head - 2, height: 4, background: W }} />
          {row(first, L.head, t1s, t1u, t1n)}
          {growK > 0 ? (
            <>
              <div style={{ position: "absolute", left: L.pad, right: L.pad, top: L.head + L.row - 1, height: 2, background: "rgba(255,255,255,0.35)", opacity: growK }} />
              {row(second, L.head + L.row, t2s, t2u, t2n)}
            </>
          ) : null}
        </div>
      ) : null}

      {/* the spine: revealed on its big seat by the wipe, named again */}
      <TargetCard rect={rect} name={owner.name} sub={1 - ownK}
        place={{ city: owner.city, kind: owner.kind, pinK: 1, cityK: 1, kindK: 1 }} />

      <Phrase from={at({ word: lines[0].word }, from, from)} to={t1s - 60} line={lines[0].text} top={UNNAMED.lineTop} size={60} color={W} emphasize={lines[0].emphasize} empColor={W} restColor={INK_SUB} />
      <Phrase from={t1s - 60} to={tGrow - 120} line={lines[1].text} top={UNNAMED.lineTop} size={60} color={W} emphasize={lines[1].emphasize} empColor={W} restColor={INK_SUB} />
      <Phrase from={tGrow} to={to + 400} line={lines[2].text} top={UNNAMED.lineTop} size={60} color={W} emphasize={lines[2].emphasize} empColor={W} restColor={INK_SUB} />
    </AbsoluteFill>
  );
};
