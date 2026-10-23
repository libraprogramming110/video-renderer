// ─────────────────────────────────────────────────────────────────────────
// KIT · partner — WHAT THE MONEY IS FOR. Added on the AstraZeneca x Summit
// HORIZONTAL long-form, 2026-10-05 (16:9; absolute 1920x1080 coordinates).
// One-mover rule, and the FRAME BUDGET from kit/equity: one hero, at most two
// supports; a finished idea RETIRES, it does not dock.
//
// `PayingFor` (ink): a question written word by word, an answer that slams
// under it, one red bar.
//
// `BackboneQuote` (ink, may sit on a FootageScrim): an executive's claim under
// an attribution, then the claim ENACTED: a backbone rises vertebra by
// vertebra and its partners slide in and couple to it.
//
// `TwoAgreements` (ink): ONE card, two states. Bolted at four corners, it takes
// a drug from each side, one shared cost bar (no split is drawn) and its
// indication. Then it empties, the bolts fall out and it sits loose (the
// second, non-binding agreement); it turns dashed on "no assurance" and its
// sides open on "non-exclusive". `LOOSE` is exported for the later callback.
//
// Every onset is a spoken word with an optional ms pin, clamped monotonic.
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { CLAMP, clamp01, COLORS, DISPLAY, INK_SUB, TRACK, useMs } from "./core";
import { FlowLine } from "./flowline";
import { at, lerp, useK, type Cued, type Win } from "./elora";

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

/** A caption that owns a window in the one caption slot (centred under the hero). */
const Caption: React.FC<{ from: number; to: number; text: string; emphasize?: string; top: number; size?: number }> = ({ from, to, text, emphasize, top, size = 44 }) => {
  const ms = useMs();
  const o = clamp01(interpolate(ms, [from - 80, from, to - 220, to], [0, 1, 1, 0], CLAMP));
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 210, width: W - 420, top, opacity: o }}>
      <FlowLine from={from} to={to} line={text} size={size} color={COLORS.paper} restColor={INK_SUB} restWeight={700} emphasize={emphasize} empColor={COLORS.paper} lineHeight={1.14} align="center" />
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// PayingFor — a question and its answer (ink world)
// ══════════════════════════════════════════════════════════════════════════
export const PayingFor: React.FC<Win & {
  question: { text: string } & Cued;
  answer: { text: string } & Cued;
  rule: Cued; // the red bar under the answer
}> = ({ from, to, question, answer, rule }) => {
  const ms = useMs();
  const k = useK();
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));
  const tQ = at(question, from, from);
  const tA = at(answer, tQ + 3200, from, tQ + 1200);
  const tRule = at(rule, tA + 1000, from, tA + 400);
  const aO = k(tA, 110);
  const aS = interpolate(ms, [tA, tA + 300], [1.14, 1], { ...CLAMP, easing: EASE });
  if (ms < tQ - 60 || vis <= 0) return null;
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <div style={{ position: "absolute", left: 130, width: W - 260, top: 320, opacity: lerp(1, 0.55, k(tA, 300)) }}>
        <FlowLine from={tQ} to={tA} line={question.text} size={84} color={COLORS.paper} lineHeight={1.06} align="center" />
      </div>
      <div style={{ position: "absolute", left: 130, width: W - 260, top: 468, display: "flex", justifyContent: "center" }}>
        <div style={{ display: "inline-flex", flexDirection: "column", alignItems: "stretch", opacity: aO, transform: `scale(${aS})` }}>
          <div style={big(COLORS.paper, 132)}>{answer.text}</div>
          <div style={{ marginTop: 22, height: 14, borderRadius: 7, background: COLORS.accent, transformOrigin: "left", transform: `scaleX(${EASE_IO(k(tRule, 460))})` }} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// BackboneQuote — a claim under its attribution, then enacted (ink world)
// ══════════════════════════════════════════════════════════════════════════
export const BONE = {
  x: 760, w: 120, h: 84, pitch: 98, y0: 330, n: 5, // vertebrae: y 330-806 (clear of the attribution, which ends at y 220)
  mate: { x: 950, w: 300, h: 60 }, // the partners that couple to it
  note: { left: 1290, top: 526 },
};

export const BackboneQuote: React.FC<Win & {
  name: { label: string } & Cued;
  role: { label: string } & Cued;
  quote: { text: string; emphasize?: string } & Cued; // the claim, in the speaker's terms
  clear: Cued; // the claim retires (a pause)
  spine: { label: string } & Cued; // the backbone rises
  spineNote: { label: string } & Cued;
  mates: Cued; // the partners slide in and couple
  matesNote: { lines: [string, string] } & Cued;
}> = ({ from, to, name, role, quote, clear, spine, spineNote, mates, matesNote }) => {
  const ms = useMs();
  const k = useK();
  const WH = COLORS.paper;
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));
  const tName = at(name, from, from);
  const tRole = at(role, tName + 1300, from, tName + 400);
  const tQuote = at(quote, tRole + 4500, from, tRole + 800);
  const tClear = at(clear, tQuote + 2300, from, tQuote + 1200);
  const tSpine = at(spine, tClear + 500, from, tClear + 300);
  const tSpineNote = at(spineNote, tSpine + 1700, from, tSpine + 700);
  const tMates = at(mates, tSpineNote + 1800, from, tSpineNote + 500);
  const tMatesNote = at(matesNote, tMates + 800, from, tMates + 500);

  const nameO = k(tName, 160);
  const quoteO = 1 - k(tClear, 300);
  const B = BONE;
  if (ms < tName - 60 || vis <= 0) return null;
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {/* the attribution: who is making the claim */}
      <div style={{ position: "absolute", left: 130, top: 120, opacity: nameO, transform: `translateY(${(1 - EASE(k(tName, 320))) * 14}px)`, ...big(WH, 56) }}>{name.label}</div>
      <div style={{ position: "absolute", left: 132, top: 192, opacity: k(tRole, 200), ...label(INK_SUB, 28) }}>{role.label}</div>

      {/* the claim */}
      {quoteO > 0 && ms >= tQuote - 20 ? (
        <div style={{ position: "absolute", left: 130, width: 1560, top: 400, opacity: quoteO }}>
          <FlowLine from={tQuote} to={tClear} line={quote.text} size={96} color={WH} restColor={INK_SUB} restWeight={700} emphasize={quote.emphasize} empColor={WH} lineHeight={1.1} />
        </div>
      ) : null}

      {/* the claim enacted: a backbone, and what couples to it */}
      {ms >= tSpine - 20 ? (
        <>
          <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
            {Array.from({ length: B.n }, (_, i) => {
              const fromBottom = B.n - 1 - i;
              const q = EASE(k(tSpine + fromBottom * 110, 300));
              const y = B.y0 + i * B.pitch;
              const m = EASE(k(tMates + fromBottom * 90, 380));
              return (
                <g key={i}>
                  {q > 0 ? <rect x={B.x} y={y + (1 - q) * 40} width={B.w} height={B.h} rx={22} fill={WH} opacity={clamp01(q * 2)} /> : null}
                  {m > 0 ? (
                    <g opacity={clamp01(m * 2)}>
                      <line x1={B.x + B.w} y1={y + B.h / 2} x2={B.mate.x + (1 - m) * 260} y2={y + B.h / 2} stroke={WH} strokeWidth={8} strokeLinecap="round" />
                      <rect x={B.mate.x + (1 - m) * 260} y={y + (B.h - B.mate.h) / 2} width={B.mate.w} height={B.mate.h} rx={B.mate.h / 2} fill={COLORS.accent} />
                    </g>
                  ) : null}
                </g>
              );
            })}
          </svg>
          <div style={{ position: "absolute", left: B.x, top: B.y0 - 58, opacity: k(tSpine, 200), ...label(WH, 34) }}>{spine.label}</div>
          <div style={{ position: "absolute", left: B.x, top: B.y0 + (B.n - 1) * B.pitch + B.h + 20, opacity: k(tSpineNote, 200), ...label(INK_SUB, 32) }}>{spineNote.label}</div>
          <div style={{ position: "absolute", left: B.note.left, top: B.note.top, opacity: k(tMatesNote, 200), ...label(WH, 34), lineHeight: 1.2 }}>
            {matesNote.lines[0]}<br />{matesNote.lines[1]}
          </div>
        </>
      ) : null}
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// TwoAgreements — one card, bolted and then loose (ink world)
// ══════════════════════════════════════════════════════════════════════════
export const LOOSE = {
  card: { x: 310, y: 230, w: 1300, h: 450, r: 36 },
  tilt: -2, // degrees, once the bolts are out
  bolt: { inset: 46, r: 15 },
  side: 76, // how far each open side stands off its corner
  captionTop: 730,
};

type Cap = { text: string; emphasize?: string } & Cued;

export const TwoAgreements: React.FC<Win & {
  first: { label: string } & Cued; // the kicker
  card: Cued; // the card draws and is bolted
  drugA: { name: string; sub: string; word?: string; ms?: number; subWord?: string };
  drugB: { name: string; sub: string } & Cued;
  cost: { label: string } & Cued; // one shared bar
  indication: { label: string } & Cued;
  captions: [Cap, Cap, Cap]; // the three clauses of the first agreement
  empty: Cued; // the card empties (a pause)
  second: { label: string } & Cued; // the kicker changes
  loose: Cued; // the bolts fall out
  tag: { label: string } & Cued; // "Non-binding"
  memo: { label: string } & Cued;
  with: { name: string } & Cued;
  others: { label: string; count: number } & Cued; // unnamed: hollow
  says: Cap; // attributed
  dashed: Cued; // "no assurance"
  open: Cap; // "mutually non-exclusive": the sides open
  openAt: Cued;
}> = ({ from, to, first, card, drugA, drugB, cost, indication, captions, empty, second, loose, tag, memo, with: withDrug, others, says, dashed, open, openAt }) => {
  const ms = useMs();
  const k = useK();
  const WH = COLORS.paper;
  const INK = COLORS.ink;
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));
  const c = (word: string | undefined, fb: number, min: number) => Math.max(min, at({ word }, fb, from));

  const tFirst = at(first, from, from);
  const tCard = at(card, tFirst + 240, from, tFirst + 150);
  const tA = at(drugA, tCard + 880, from, tCard + 500);
  const tASub = c(drugA.subWord, tA + 1800, tA + 400);
  const tC1 = at(captions[0], tASub + 3900, from, tASub + 800);
  const tB = at(drugB, tC1 + 870, from, tC1 + 300);
  const tC2 = at(captions[1], tB + 1500, from, tB + 500);
  const tCost = at(cost, tC2 + 200, from, tC2 + 100);
  const tC3 = at(captions[2], tCost + 1600, from, tCost + 500);
  const tInd = at(indication, tC3 + 1600, from, tC3 + 500);
  const tEmpty = at(empty, tInd + 2300, from, tInd + 1200);
  const tSecond = at(second, tEmpty + 700, from, tEmpty + 400);
  const tLoose = at(loose, tSecond + 1200, from, tSecond + 400);
  const tTag = at(tag, tLoose + 900, from, tLoose + 600);
  const tMemo = at(memo, tTag + 500, from, tTag + 300);
  const tWith = at(withDrug, tMemo + 2500, from, tMemo + 600);
  const tOthers = at(others, tWith + 950, from, tWith + 400);
  const tSays = at(says, tOthers + 2700, from, tOthers + 800);
  const tDashed = at(dashed, tSays + 1280, from, tSays + 300);
  const tOpen = at(open, tDashed + 2600, from, tDashed + 800);
  const tOpenAt = at(openAt, tOpen + 1200, from, tOpen + 300);

  const C = LOOSE.card;
  const cx = C.x + C.w / 2;
  const cy = C.y + C.h / 2;
  const drawQ = EASE_IO(k(tCard, 620));
  const looseQ = k(tLoose, 520);
  const tilt = LOOSE.tilt * EASE(k(tLoose + 120, 420));
  const isDashed = ms >= tDashed;
  const openQ = EASE_IO(k(tOpenAt, 480));
  const firstO = 1 - k(tEmpty, 300); // the first agreement's contents
  const inset = LOOSE.side;

  // the outline as four pieces, so the two sides can open
  const top = `M ${C.x} ${C.y + inset} V ${C.y + C.r} A ${C.r} ${C.r} 0 0 1 ${C.x + C.r} ${C.y} H ${C.x + C.w - C.r} A ${C.r} ${C.r} 0 0 1 ${C.x + C.w} ${C.y + C.r} V ${C.y + inset}`;
  const bottom = `M ${C.x} ${C.y + C.h - inset} V ${C.y + C.h - C.r} A ${C.r} ${C.r} 0 0 0 ${C.x + C.r} ${C.y + C.h} H ${C.x + C.w - C.r} A ${C.r} ${C.r} 0 0 0 ${C.x + C.w} ${C.y + C.h - C.r} V ${C.y + C.h - inset}`;
  const sideLen = C.h - inset * 2;
  const stroke = { fill: "none", stroke: WH, strokeWidth: 7, strokeLinecap: "round" as const };
  const draw = drawQ < 1 ? { pathLength: 1, strokeDasharray: "1 1", strokeDashoffset: 1 - drawQ } : { strokeDasharray: isDashed ? "26 20" : undefined };
  const bolts = [
    [C.x + LOOSE.bolt.inset, C.y + LOOSE.bolt.inset],
    [C.x + C.w - LOOSE.bolt.inset, C.y + LOOSE.bolt.inset],
    [C.x + LOOSE.bolt.inset, C.y + C.h - LOOSE.bolt.inset],
    [C.x + C.w - LOOSE.bolt.inset, C.y + C.h - LOOSE.bolt.inset],
  ];

  const aQ = EASE(k(tA, 380));
  const bQ = EASE(k(tB, 380));
  const costQ = EASE_IO(k(tCost, 520));
  const indQ = k(tInd, 300);
  const half = (left: boolean): React.CSSProperties => ({ position: "absolute", left: left ? C.x : cx, width: C.w / 2, textAlign: "center" });

  if (ms < tFirst - 60 || vis <= 0) return null;
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {/* the kicker: one slot, two agreements */}
      <div style={{ position: "absolute", left: C.x, top: 140, opacity: k(tFirst, 200) * firstO, ...label(WH, 40) }}>{first.label}</div>
      <div style={{ position: "absolute", left: C.x, top: 140, opacity: k(tSecond, 200), ...label(WH, 40) }}>{second.label}</div>

      {/* the card */}
      <div style={{ position: "absolute", inset: 0, transformOrigin: `${cx}px ${cy}px`, transform: `rotate(${tilt}deg)` }}>
        <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <path d={top} {...stroke} {...draw} />
          <path d={bottom} {...stroke} {...draw} />
          {[C.x, C.x + C.w].map((x, i) => {
            const len = sideLen * (1 - openQ);
            return len > 2 ? <line key={i} x1={x} y1={cy - len / 2} x2={x} y2={cy + len / 2} {...stroke} strokeDasharray={isDashed ? "26 20" : undefined} opacity={clamp01(drawQ * 3 - 2)} /> : null;
          })}
          {/* open sides: the way out, on both sides */}
          {openQ > 0
            ? [-1, 1].map((d) => {
                const x0 = d < 0 ? C.x - 8 : C.x + C.w + 8;
                const x1 = x0 + d * 96 * openQ;
                return (
                  <g key={d} stroke={WH} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" fill="none" opacity={clamp01(openQ * 2)}>
                    <line x1={x0} y1={cy} x2={x1} y2={cy} />
                    <path d={`M ${x1 - d * 24} ${cy - 22} L ${x1} ${cy} L ${x1 - d * 24} ${cy + 22}`} />
                  </g>
                );
              })
            : null}
          {/* four bolts: in, and then out */}
          {bolts.map(([bx, by], i) => {
            const inQ = BACK(k(tCard + 420 + i * 60, 260));
            const out = EASE(clamp01(looseQ * 1.6 - i * 0.18));
            if (inQ <= 0 || out >= 1) return null;
            return (
              <g key={i} transform={`translate(${bx} ${by + out * 150})`} opacity={1 - out}>
                <circle r={LOOSE.bolt.r * inQ} fill={WH} />
                <line x1={-7} y1={0} x2={7} y2={0} stroke={INK} strokeWidth={4} strokeLinecap="round" transform={`rotate(${-45 + out * 200})`} />
              </g>
            );
          })}
          {/* the shared cost: one bar, grown from the middle, no split drawn */}
          {costQ > 0 && firstO > 0 ? <rect x={cx - 520 * costQ} y={540} width={1040 * costQ} height={56} rx={28} fill={WH} opacity={firstO} /> : null}
          {/* the other medicines: not named, so hollow */}
          {Array.from({ length: others.count }, (_, i) => {
            const q = EASE(k(tOthers + i * 70, 300));
            const x = cx + C.w / 4 + (i - (others.count - 1) / 2) * 176;
            return q > 0 ? <rect key={i} x={x - 76} y={388 + (1 - q) * 18} width={152} height={56} rx={28} fill="none" stroke="rgba(255,255,255,0.62)" strokeWidth={5} opacity={q} /> : null;
          })}
        </svg>

        {/* ── the first agreement ── */}
        {firstO > 0 ? (
          <div style={{ position: "absolute", inset: 0, opacity: firstO }}>
            <div style={{ ...half(true), top: 350, opacity: clamp01(aQ * 2), transform: `translateX(${(1 - aQ) * -70}px)`, ...big(WH, 56) }}>{drugA.name}</div>
            <div style={{ ...half(true), top: 426, opacity: k(tASub, 200), ...label(INK_SUB, 26) }}>{drugA.sub}</div>
            <div style={{ position: "absolute", left: cx - 30, width: 60, top: 350, textAlign: "center", opacity: clamp01(bQ * 2), ...big(INK_SUB, 56) }}>+</div>
            <div style={{ ...half(false), top: 350, opacity: clamp01(bQ * 2), transform: `translateX(${(1 - bQ) * 70}px)`, ...big(WH, 56) }}>{drugB.name}</div>
            <div style={{ ...half(false), top: 426, opacity: clamp01(bQ * 2), ...label(INK_SUB, 26) }}>{drugB.sub}</div>
            <div style={{ position: "absolute", left: cx - 300, width: 600, top: 540, height: 56, display: "flex", alignItems: "center", justifyContent: "center", opacity: clamp01(costQ * 3 - 2), ...big(INK, 30) }}>{cost.label}</div>
            {indQ > 0 ? (
              <div style={{ position: "absolute", left: cx - 270, width: 540, top: C.y - 32, height: 64, borderRadius: 32, background: WH, display: "flex", alignItems: "center", justifyContent: "center",
                opacity: clamp01(indQ * 3), transform: `scale(${lerp(0.84, 1, BACK(indQ))})`, ...big(INK, 34) }}>
                {indication.label}
              </div>
            ) : null}
          </div>
        ) : null}

        {/* ── the second agreement ── */}
        {ms >= tTag - 20 ? (
          <>
            <div style={{ position: "absolute", left: C.x + 70, top: C.y + 54, opacity: k(tMemo, 200), ...big(WH, 48) }}>{memo.label}</div>
            <div style={{ position: "absolute", right: W - (C.x + C.w) + 70, top: C.y + 46, height: 62, padding: "0 30px", borderRadius: 31, background: WH, display: "flex", alignItems: "center",
              opacity: clamp01(k(tTag, 260) * 3), transform: `scale(${lerp(0.84, 1, BACK(k(tTag, 260)))})`, ...big(INK, 32) }}>
              {tag.label}
            </div>
            <div style={{ ...half(true), top: 388, opacity: k(tWith, 180), transform: `translateY(${(1 - EASE(k(tWith, 320))) * 14}px)`, ...big(WH, 56) }}>{withDrug.name}</div>
            <div style={{ position: "absolute", left: cx - 30, width: 60, top: 388, textAlign: "center", opacity: k(tOthers, 180), ...big(INK_SUB, 56) }}>+</div>
            <div style={{ ...half(false), top: 470, opacity: k(tOthers + 200, 200), ...label(INK_SUB, 26) }}>{others.label}</div>
          </>
        ) : null}
      </div>

      {/* the caption slot: one clause at a time */}
      <Caption from={tC1} to={tC2 - 60} text={captions[0].text} emphasize={captions[0].emphasize} top={LOOSE.captionTop} />
      <Caption from={tC2} to={tC3 - 60} text={captions[1].text} emphasize={captions[1].emphasize} top={LOOSE.captionTop} />
      <Caption from={tC3} to={tEmpty + 200} text={captions[2].text} emphasize={captions[2].emphasize} top={LOOSE.captionTop} />
      <Caption from={tSays} to={tOpen - 60} text={says.text} emphasize={says.emphasize} top={LOOSE.captionTop} />
      <Caption from={tOpen} to={to + 400} text={open.text} emphasize={open.emphasize} top={LOOSE.captionTop} />
    </AbsoluteFill>
  );
};
