// ─────────────────────────────────────────────────────────────────────────
// KIT · action — A BOUGHT DRUG, A PAYLOAD, ONE ENDPOINT AND NOT THE OTHER. Added
// on the Bristol Myers Squibb two-readouts HORIZONTAL long-form, 2026-10-14
// (16:9; absolute 1920x1080 coordinates, not portrait-safe as written).
// One-mover rule and the frame budget.
//
// `RadioDeal` (ink): the hook's second card returns as a chip, the name slams
// and docks as the header. The maker's plate lands, the buyer reaches it along
// an arrow, a date and a price that counts as voiced. The deal RETIRES; a
// carrier draws, the atom drops into it, it emits ONCE (the scene's red) and
// the whole thing travels to a tumor that appears as it arrives.
//
// `ActionTrial` (white card): the trial's plate; who was enrolled, built right
// to left as the sentence is spoken. Then §2's chart on §2's seats (`DOSES`):
// the line, one column through it, the endpoint named beside it with a solid
// check. The other endpoint gets a DASHED ring and a dashed rail that runs on
// (dashed = not measured yet, the 08-22 vocabulary rule).
//
// Every onset is a spoken word with an optional ms pin, clamped monotonic
// (`at()` / `useK()` / `Cued` / `Win` come from ./elora).
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { CLAMP, clamp01, COLORS, DISPLAY, inkA, INK_SUB, TRACK, useMs } from "./core";
import { TYPE } from "../style";
import { at, lerp, useK, type Cued, type Win } from "./elora";
import { Column, DOSES, DRUG, ReadoutChip } from "./aloft";

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
// RadioDeal (ink world)
// ══════════════════════════════════════════════════════════════════════════
export const RADIO = {
  hero: { left: 130, top: 250, size: 230 },
  dock: { left: 320, top: 127, s: 0.25 },
  sub: { top: 500, size: 64 },
  deal: { buyer: { left: 130, top: 600, size: 96 }, arrow: { x0: 540, x1: 1180, y: 648 }, plate: { left: 1220, top: 590, size: 80 } },
  payload: { x0: 520, x1: 1180, y: 520 },
  tumor: { x: 1440, y: 520 },
};

// a fixed cluster: [dx, dy, r]
const CELLS: [number, number, number][] = [[0, 0, 74], [-78, -52, 46], [70, -66, 52], [86, 40, 44], [-60, 68, 54], [20, 96, 36], [-110, 14, 30]];
const RAYS = [-150, -90, -30, 30, 90, 150];

export const RadioDeal: React.FC<Win & {
  chip: Cued;
  name: { label: string } & Cued;
  sub: { label: string } & Cued;
  maker: { name: string; kicker: string } & Cued;
  dock: Cued; // a pause: the name becomes the header
  buyer: { name: string } & Cued;
  arrow: Cued;
  date: { label: string } & Cued;
  about: { label: string } & Cued;
  price: { value: number; decimals: number; prefix: string; unit: string; until: Cued } & Cued;
  clear: Cued; // a pause: the deal retires
  carrier: Cued;
  atom: { symbol: string; label: string } & Cued;
  emit: Cued; // the rays go out once
  emitLabel: { label: string } & Cued;
  travel: { until: Cued } & Cued;
  tumor: { label: string } & Cued;
  sites: ({ label: string } & Cued)[];
}> = ({ from, to, chip, name, sub, maker, dock, buyer, arrow, date, about, price, clear, carrier, atom, emit, emitLabel, travel, tumor, sites }) => {
  const ms = useMs();
  const k = useK();
  const WH = COLORS.paper;
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));

  const tChip = at(chip, from, from);
  const tName = at(name, tChip + 900, from, tChip + 200);
  const tSub = at(sub, tName + 1700, from, tName + 400);
  const tMaker = at(maker, tSub + 1300, from, tSub + 400);
  const tDock = at(dock, tMaker + 700, from, tMaker + 400);
  const tBuyer = at(buyer, tDock + 450, from, tDock + 300);
  const tArrow = at(arrow, tBuyer + 650, from, tBuyer + 300);
  const tDate = at(date, tArrow + 450, from, tArrow + 300);
  const tAbout = at(about, tDate + 1300, from, tDate + 300);
  const tPrice = at(price, tAbout + 250, from, tAbout + 150);
  const tPriceEnd = at(price.until, tPrice + 800, from, tPrice + 300);
  const tClear = at(clear, tPriceEnd + 500, from, tPriceEnd + 300);
  const tCarrier = at(carrier, tClear + 400, from, tClear + 250);
  const tAtom = at(atom, tCarrier + 1300, from, tCarrier + 500);
  const tEmit = at(emit, tAtom + 1700, from, tAtom + 500);
  const tEmitL = at(emitLabel, tEmit + 550, from, tEmit + 300);
  const tTravel = at(travel, tEmitL + 1100, from, tEmitL + 300);
  const tTravelEnd = at(travel.until, tTravel + 800, from, tTravel + 400);
  const tTumor = at(tumor, tTravelEnd, from, tTravelEnd - 40);
  let prev = tTumor;
  const tSites = sites.map((s) => (prev = at(s, prev + 500, from, prev + 200)));

  const nameO = k(tName, 110);
  const nameS = interpolate(ms, [tName, tName + 320], [1.25, 1], { ...CLAMP, easing: EASE });
  const dq = EASE_IO(k(tDock, 620));
  const dealO = 1 - k(tClear, 250);
  const D = RADIO.deal;
  const aq = EASE_IO(k(tArrow, 420));
  const pq = clamp01((ms - tPrice) / Math.max(200, tPriceEnd - tPrice));

  const P = RADIO.payload;
  const tq = EASE_IO(clamp01((ms - tTravel) / Math.max(300, tTravelEnd - tTravel)));
  const px = lerp(P.x0, P.x1, tq);
  const cq = EASE_IO(k(tCarrier, 600));
  const aQ = k(tAtom, 360);
  const eq = EASE(k(tEmit, 320));
  const tumQ = k(tTumor, 420);

  if (ms < tChip - 60) return null;
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <ReadoutChip x={DRUG.chip.x} y={DRUG.chip.y} k={k(tChip, 380)} />
      <div style={{ position: "absolute", left: lerp(RADIO.hero.left, RADIO.dock.left, dq), top: lerp(RADIO.hero.top, RADIO.dock.top, dq), transformOrigin: "0 0", transform: `scale(${lerp(1, RADIO.dock.s, dq)})`, ...big(WH, RADIO.hero.size) }}>
        <span style={{ display: "inline-block", opacity: nameO, transform: `scale(${nameS})`, transformOrigin: "left bottom" }}>{name.label}</span>
      </div>
      <div style={{ position: "absolute", left: 130, top: RADIO.sub.top, opacity: k(tSub, 220) * (1 - k(tDock, 240)), ...big(INK_SUB, RADIO.sub.size) }}>{sub.label}</div>

      {/* ── the deal ── */}
      {dealO > 0 ? (
        <div style={{ opacity: dealO }}>
          <div style={{ position: "absolute", left: D.plate.left, top: D.plate.top - 46, opacity: k(tMaker, 200), ...label(INK_SUB, 30) }}>{maker.kicker}</div>
          {ms >= tMaker - 20 ? (
            <div style={{ position: "absolute", left: D.plate.left, top: D.plate.top, padding: "18px 36px 24px", borderRadius: 20, background: WH, opacity: clamp01(k(tMaker, 120) * 2), transformOrigin: "0 50%", transform: `scale(${lerp(1.18, 1, EASE(k(tMaker, 300)))})`, ...big(COLORS.ink, D.plate.size) }}>{maker.name}</div>
          ) : null}
          <div style={{ position: "absolute", left: D.buyer.left, top: D.buyer.top, opacity: k(tBuyer, 140), transform: `translateX(${(1 - EASE(k(tBuyer, 380))) * -50}px)`, ...big(WH, D.buyer.size) }}>{buyer.name}</div>
          <div style={{ position: "absolute", left: D.arrow.x0, top: D.arrow.y - 3, width: (D.arrow.x1 - D.arrow.x0 - 10) * aq, height: 6, background: WH }} />
          <svg style={{ position: "absolute", left: D.arrow.x0 + (D.arrow.x1 - D.arrow.x0) * aq - 30, top: D.arrow.y - 22, opacity: clamp01(aq * 5) }} width={32} height={44}>
            <path d="M4 4 L28 22 L4 40" fill="none" stroke={WH} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <div style={{ position: "absolute", left: D.arrow.x0, width: D.arrow.x1 - D.arrow.x0, top: D.arrow.y - 78, textAlign: "center", opacity: k(tDate, 200), ...label(WH, 34) }}>{date.label}</div>
          <div style={{ position: "absolute", left: D.arrow.x0, width: D.arrow.x1 - D.arrow.x0, top: D.arrow.y + 42, display: "flex", justifyContent: "center", alignItems: "baseline", gap: 18 }}>
            <span style={{ opacity: k(tAbout, 180), ...label(INK_SUB, 34) }}>{about.label}</span>
            <span style={{ opacity: k(tPrice, 100), ...big(WH, 76), fontVariantNumeric: "tabular-nums" }}>{price.prefix}{(price.value * pq).toFixed(price.decimals)} {price.unit}</span>
          </div>
        </div>
      ) : null}

      {/* ── the payload: carrier, atom, one emission, then it travels ── */}
      {ms >= tCarrier - 20 ? (
        <>
          <svg style={{ position: "absolute", left: px - 260, top: P.y - 200 }} width={520} height={400} viewBox="-260 -200 520 400">
            {/* the carrier: a tail and a cradle open toward the target */}
            <path d="M-240 0 L-104 0" fill="none" stroke={WH} strokeWidth={8} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - cq} />
            <path d="M52 -90 A104 104 0 1 0 52 90" fill="none" stroke={WH} strokeWidth={8} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - cq} />
            {RAYS.map((a) => {
              const c = Math.cos((a * Math.PI) / 180), s = Math.sin((a * Math.PI) / 180);
              return eq > 0 ? <line key={a} x1={c * 124} y1={s * 124} x2={c * (124 + 58 * eq)} y2={s * (124 + 58 * eq)} stroke={COLORS.accent} strokeWidth={9} strokeLinecap="round" /> : null;
            })}
          </svg>
          {aQ > 0 ? (
            <div style={{ position: "absolute", left: px - 64, top: P.y - 64 - (1 - BACK(aQ)) * 120, width: 128, height: 128, borderRadius: 64, background: WH, opacity: clamp01(aQ * 4), display: "flex", alignItems: "center", justifyContent: "center", ...big(COLORS.ink, 56) }}>{atom.symbol}</div>
          ) : null}
          <div style={{ position: "absolute", left: px - 300, width: 600, top: P.y + 200, textAlign: "center", opacity: k(tAtom + 200, 200), ...big(WH, 48) }}>{atom.label}</div>
          <div style={{ position: "absolute", left: px - 300, width: 600, top: P.y - 262, textAlign: "center", opacity: k(tEmitL, 200), ...label(COLORS.accent, 36) }}>{emitLabel.label}</div>
        </>
      ) : null}

      {/* ── the target ── */}
      {tumQ > 0 ? (
        <svg style={{ position: "absolute", left: RADIO.tumor.x - 180, top: RADIO.tumor.y - 180, opacity: clamp01(tumQ * 3), transform: `scale(${lerp(0.7, 1, BACK(tumQ))})` }} width={360} height={360} viewBox="-180 -180 360 360">
          {CELLS.map(([x, y, r], i) => <circle key={i} cx={x} cy={y} r={r} fill="rgba(255,255,255,0.14)" stroke={WH} strokeWidth={5} />)}
        </svg>
      ) : null}
      <div style={{ position: "absolute", left: RADIO.tumor.x - 320, width: 640, top: RADIO.tumor.y - 330, textAlign: "center", opacity: k(tTumor + 120, 220), ...big(WH, 48) }}>{tumor.label}</div>
      <div style={{ position: "absolute", left: RADIO.tumor.x - 320, width: 640, top: RADIO.tumor.y + 250, display: "flex", justifyContent: "center", gap: 24 }}>
        {sites.map((s, i) => (
          <div key={i} style={{ padding: "12px 34px 14px", borderRadius: 40, border: `4px solid ${WH}`, opacity: clamp01(k(tSites[i], 120) * 2), transform: `scale(${lerp(1.3, 1, EASE(k(tSites[i], 280)))})`, ...label(WH, 36) }}>{s.label}</div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// ActionTrial (white card)
// ══════════════════════════════════════════════════════════════════════════
export const ACTION = {
  plate: { left: 130, top: 140, size: 72 },
  row: { y: 470, therapy: { x: 130, w: 400 }, prog: { x: 616 }, people: { x: 1130, gap: 78, n: 8 } },
  text: { x: 890, y: 480, size: 60 }, // the endpoint, beside the column
  os: { y: 610 },
  rail: { x0: 800, x1: 1720, y: 716 },
};

const Person: React.FC<{ x: number; y: number; k: number; color: string }> = ({ x, y, k, color }) => (
  k <= 0 ? null : (
    <div style={{ position: "absolute", left: x, top: y, opacity: clamp01(k * 3), transform: `translateY(${(1 - EASE(k)) * 30}px)` }}>
      <div style={{ width: 30, height: 30, borderRadius: 15, background: color, margin: "0 auto" }} />
      <div style={{ width: 56, height: 62, borderRadius: "26px 26px 10px 10px", background: color, marginTop: 6 }} />
    </div>
  )
);

const Check: React.FC<{ x: number; y: number; k: number; size?: number }> = ({ x, y, k, size = 64 }) => (
  <div style={{ position: "absolute", left: x, top: y, width: size, height: size, borderRadius: size / 2, background: COLORS.ink, opacity: clamp01(k * 3), transform: `scale(${lerp(1.5, 1, EASE(k))})` }}>
    <svg width={size} height={size} viewBox="0 0 64 64"><path d="M18 33 L28 43 L46 23" fill="none" stroke={COLORS.paper} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" /></svg>
  </div>
);

export const ActionTrial: React.FC<Win & {
  kicker: { label: string } & Cued;
  plate: { label: string } & Cued;
  people: { label: string } & Cued;
  progressed: { label: string } & Cued;
  therapy: { label: string } & Cued;
  clear: Cued; // a pause: the enrolment retires
  interim: { label: string } & Cued;
  tag: { label: string } & Cued; // the column's name
  clearInterim: Cued; // a pause: the lead-in retires
  line: { label: string } & Cued; // the threshold draws
  rise: Cued; // the column goes through it
  endpoint: { label: string } & Cued;
  versus: { label: string } & Cued;
  swap: Cued; // a pause: the comparator line gives its seat to the review
  judged: { kicker: string } & Cued;
  review: { label: string } & Cued;
  clear2: Cued; // a pause: the review retires
  thatIs: Cued; // the solid check on the endpoint that was measured
  not: { label: string } & Cued; // the other endpoint: a dashed ring
  followed: { label: string; until: Cued } & Cued; // its rail runs on
  followedLabel: Cued;
}> = ({ from, to, kicker, plate, people, progressed, therapy, clear, interim, tag, clearInterim, line, rise, endpoint, versus, swap, judged, review, clear2, thatIs, not, followed, followedLabel }) => {
  const ms = useMs();
  const k = useK();
  const INK = COLORS.ink;
  const RED = COLORS.accent;
  const SUB = inkA(0.6);
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));

  const tKick = at(kicker, from, from);
  const tPlate = at(plate, tKick + 700, from, tKick + 200);
  const tPeople = at(people, tPlate + 900, from, tPlate + 400);
  const tProg = at(progressed, tPeople + 1500, from, tPeople + 600);
  const tTher = at(therapy, tProg + 800, from, tProg + 300);
  const tClear = at(clear, tTher + 1200, from, tTher + 500);
  const tInterim = at(interim, tClear + 800, from, tClear + 300);
  const tTag = at(tag, tInterim + 1100, from, tInterim + 400);
  const tClearI = at(clearInterim, tTag + 200, from, tTag + 100);
  const tLine = at(line, tClearI + 250, from, tClearI + 100);
  const tRise = at(rise, tLine + 450, from, tLine + 350);
  const tEnd = at(endpoint, tRise + 1200, from, tRise + 600);
  const tVs = at(versus, tEnd + 900, from, tEnd + 300);
  const tSwap = at(swap, tVs + 2000, from, tVs + 600);
  const tJudged = at(judged, tSwap + 250, from, tSwap + 200);
  const tReview = at(review, tJudged + 400, from, tJudged + 200);
  const tClear2 = at(clear2, tReview + 1800, from, tReview + 600);
  const tThat = at(thatIs, tClear2 + 900, from, tClear2 + 300);
  const tNot = at(not, tThat + 1800, from, tThat + 400);
  const tFol = at(followed, tNot + 1800, from, tNot + 500);
  const tFolEnd = at(followed.until, tFol + 800, from, tFol + 300);
  const tFolL = at(followedLabel, tFol + 400, from, tFol + 100);

  const R = ACTION.row;
  const D = DOSES;
  const T = ACTION.text;
  const rowO = 1 - k(tClear, 300);
  const interimO = k(tInterim, 220) * (1 - k(tClearI, 240));
  const vsO = k(tVs, 220) * (1 - k(tSwap, 220));
  const revO = 1 - k(tClear2, 260);
  const lineQ = EASE_IO(k(tLine, 420));
  const folQ = clamp01((ms - tFol) / Math.max(300, tFolEnd - tFol));
  const chevron = (x: number, t: number) => (
    <svg style={{ position: "absolute", left: x, top: R.y + 14, opacity: k(t, 220) }} width={40} height={44}>
      <path d="M8 4 L32 22 L8 40" fill="none" stroke={inkA(0.4)} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  if (ms < tKick - 60) return null;
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <div style={{ position: "absolute", left: ACTION.plate.left, top: ACTION.plate.top - 44, opacity: k(tKick, 200), ...label(SUB, 30) }}>{kicker.label}</div>
      {ms >= tPlate - 20 ? (
        <div style={{ position: "absolute", left: ACTION.plate.left, top: ACTION.plate.top, padding: "16px 32px 22px", borderRadius: 18, background: INK, opacity: clamp01(k(tPlate, 120) * 2), transformOrigin: "0 50%", transform: `scale(${lerp(1.18, 1, EASE(k(tPlate, 300)))})`, ...big(COLORS.paper, ACTION.plate.size) }}>{plate.label}</div>
      ) : null}

      {/* ── who was enrolled: built right to left, read left to right ── */}
      {rowO > 0 ? (
        <div style={{ opacity: rowO }}>
          {Array.from({ length: R.people.n }, (_, i) => <Person key={i} x={R.people.x + i * R.people.gap} y={R.y - 14} k={k(tPeople + i * 45, 300)} color={INK} />)}
          <div style={{ position: "absolute", left: R.people.x, top: R.y + 110, opacity: k(tPeople + 200, 220), ...label(SUB, 30) }}>{people.label}</div>
          {chevron(R.people.x - 76, tProg)}
          <div style={{ position: "absolute", left: R.prog.x, top: R.y + 8, opacity: k(tProg, 160), transform: `translateX(${(1 - EASE(k(tProg, 340))) * 40}px)`, ...big(INK, 44) }}>{progressed.label}</div>
          {chevron(R.prog.x - 68, tTher)}
          <div style={{ position: "absolute", left: R.therapy.x, top: R.y - 2, width: R.therapy.w, height: 76, boxSizing: "border-box", borderRadius: 38, border: `4px solid ${INK}`, display: "flex", alignItems: "center", justifyContent: "center", opacity: clamp01(k(tTher, 120) * 2), transform: `scale(${lerp(1.25, 1, EASE(k(tTher, 280)))})`, ...label(INK, 28) }}>{therapy.label}</div>
        </div>
      ) : null}

      {/* ── §2's chart, on §2's seats ── */}
      <div style={{ position: "absolute", left: 130, top: 300, opacity: interimO, ...big(INK, 56) }}>{interim.label}</div>
      <div style={{ position: "absolute", left: D.x0, top: D.base, width: D.x1 - D.x0, height: 4, background: inkA(0.2), opacity: k(tTag, 200) }} />
      <div style={{ position: "absolute", left: D.a.x - 80, width: D.a.w + 160, top: D.base + 22, textAlign: "center", opacity: clamp01(k(tTag, 120) * 2), transform: `scale(${lerp(1.3, 1, EASE(k(tTag, 280)))})`, ...big(INK, 56) }}>{tag.label}</div>
      <Column x={D.a.x} w={D.a.w} top={D.a.top} q={EASE_IO(k(tRise, 760))} color={INK} />
      <div style={{ position: "absolute", left: D.x0, top: D.line - 3, width: (D.x1 - D.x0) * lineQ, height: 6, background: RED }} />
      <div style={{ position: "absolute", left: D.x1 - 600, width: 600, textAlign: "right", top: D.line - 52, opacity: k(tLine + 250, 200), ...label(RED, 32) }}>{line.label}</div>

      {/* the endpoint that was measured */}
      <Check x={T.x - 90} y={T.y - 2} k={k(tThat, 260)} />
      <div style={{ position: "absolute", left: T.x, top: T.y, opacity: k(tEnd, 160), transform: `translateX(${(1 - EASE(k(tEnd, 340))) * 36}px)`, ...big(INK, T.size) }}>{endpoint.label}</div>
      <div style={{ position: "absolute", left: T.x, top: T.y + 90, opacity: vsO, ...label(SUB, 36) }}>{versus.label}</div>
      <div style={{ opacity: revO }}>
        <div style={{ position: "absolute", left: T.x, top: T.y + 90, opacity: k(tJudged, 200), ...label(SUB, 30) }}>{judged.kicker}</div>
        <div style={{ position: "absolute", left: T.x, top: T.y + 136, padding: "12px 30px 14px", borderRadius: 40, border: `4px solid ${INK}`, opacity: clamp01(k(tReview, 120) * 2), transformOrigin: "0 50%", transform: `scale(${lerp(1.25, 1, EASE(k(tReview, 280)))})`, ...label(INK, 34) }}>{review.label}</div>
      </div>

      {/* the endpoint that was not: dashed, and still running */}
      {ms >= tNot - 20 ? (
        <>
          <svg style={{ position: "absolute", left: T.x - 90, top: ACTION.os.y - 2, opacity: clamp01(k(tNot, 120) * 2), transform: `scale(${lerp(1.4, 1, EASE(k(tNot, 280)))})` }} width={64} height={64}>
            <circle cx={32} cy={32} r={28} fill="none" stroke={inkA(0.55)} strokeWidth={5} strokeDasharray="11 9" />
          </svg>
          <div style={{ position: "absolute", left: T.x, top: ACTION.os.y, opacity: k(tNot, 180), ...big(inkA(0.5), T.size) }}>{not.label}</div>
          <svg style={{ position: "absolute", left: ACTION.rail.x0, top: ACTION.rail.y - 4 }} width={(ACTION.rail.x1 - ACTION.rail.x0) * folQ} height={8}>
            <line x1={0} y1={4} x2={ACTION.rail.x1 - ACTION.rail.x0} y2={4} stroke={inkA(0.55)} strokeWidth={5} strokeDasharray="18 14" />
          </svg>
          <div style={{ position: "absolute", left: ACTION.rail.x0, top: ACTION.rail.y + 22, opacity: k(tFolL, 220), ...label(SUB, 34) }}>{followed.label}</div>
        </>
      ) : null}
    </AbsoluteFill>
  );
};
