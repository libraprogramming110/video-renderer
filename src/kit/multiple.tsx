// ─────────────────────────────────────────────────────────────────────────
// KIT · multiple — A PRICE AS A MULTIPLE OF SALES, and A LANE EVERYONE IS
// ENTERING BY ACQUISITION. Added on the Shionogi × IntraBio long-form,
// 2026-10-07 (VERTICAL). One mover per cue, landed things go still, finished
// ideas retire (the frame budget).
//
// `ThirtyTimes` (white card): "2025 sales were $67.9 million. Shionogi paid
// roughly 30 times trailing revenue for one drug and a neurodegenerative
// pipeline behind it." The sales figure counts while ONE red bar grows with it
// (one curve drives both). The figure retires and the bar travels to the foot
// of a tower as tile 1. The price stamps at the top; on "30" the tiles climb to
// reach it while the multiple counts with them (count = tiles on screen, so
// they never disagree). One solid pill lands on "one drug"; dashed pills slide
// out from BEHIND it for the pipeline (dashed = not yet approved; no count is
// printed because the script gives none).
//
// `RareCorridor` (ink, a FootageScrim behind its first half): "The strategic
// read… Japan's majors are converging on rare disease as the durable revenue
// corridor. Takeda got there via Shire. Shionogi gets there via IntraBio."
// Unnamed dashed chips drop in and CONVERGE on a mouth; two rails draw down
// from it on "rare disease" and run on, with recurring marks, on "durable
// revenue". The unnamed chips retire. Each named buyer then stamps OUTSIDE a
// rail and slides in through it on "via"; the company it bought stamps on the
// rail where it crossed (a white card: the spine's own look).
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { CLAMP, clamp01, COLORS, DISPLAY, INK_SUB, inkA, TRACK, useMs } from "./core";
import { at, lerp, Phrase, useK, type Cued, type Win } from "./elora";

const EASE = Easing.out(Easing.cubic);
const EASE_IO = Easing.inOut(Easing.cubic);
const BACK = Easing.out(Easing.back(1.6));
const LINE_TOP = 1440; // narration, both blocks

type NarLine = { text: string; emphasize?: string; word?: string };

// ══════════════════════════════════════════════════════════════════════════
// ThirtyTimes — the multiple (white card)
// ══════════════════════════════════════════════════════════════════════════
export const TOWER = {
  x: 150, w: 300, base: 1150, tileH: 24, pitch: 28,
  plate: { y: 214, h: 84 },
  right: 745, // centre x of the multiple column
  pill: { x: 150, y: 1240, w: 380, h: 110 },
  hero: { bar: { x: 390, y: 800, w: 300, h: 40 }, figY: 620, labelY: 440 },
};

export const ThirtyTimes: React.FC<Win & {
  year: { label: string } & Cued; // "2025"
  what: { label: string } & Cued; // "sales"
  figure: { value: number; decimals: number; prefix: string; suffix: string; endWord?: string } & Cued; // counts as voiced
  move: Cued; // the figure retires, its bar becomes tile 1
  price: { label: string } & Cued; // the price stamps at the top
  about: { label: string } & Cued; // "roughly"
  times: { n: number; endWord?: string } & Cued; // the tiles climb, the multiple counts
  basis: { label: string } & Cued; // "trailing revenue"
  drug: { name: string } & Cued; // one solid pill
  pipeline: { n: number } & Cued; // dashed pills behind it
  lines: NarLine[]; // exactly two
}> = ({ from, to, year, what, figure, move, price, about, times, basis, drug, pipeline, lines }) => {
  const ms = useMs();
  const k = useK();
  const INK = COLORS.ink;
  const R = COLORS.accent;
  const T = TOWER;

  const tYear = at(year, from + 400, from);
  const tWhat = at(what, tYear + 600, from, tYear + 150);
  const tFig = at(figure, tWhat + 700, from, tWhat + 200);
  const tFigEnd = Math.max(tFig + 500, at({ word: figure.endWord }, tFig + 1300, from));
  const tMove = at(move, tFigEnd + 1400, from, tFigEnd + 500);
  const tPrice = at(price, tMove + 550, from, tMove + 450);
  const tAbout = at(about, tPrice + 220, from, tPrice + 150);
  const tTimes = at(times, tAbout + 380, from, tAbout + 200);
  const tTimesEnd = Math.max(tTimes + 450, at({ word: times.endWord }, tTimes + 600, from) + 150);
  const tBasis = at(basis, tTimesEnd + 100, from, tTimesEnd);
  const tDrug = at(drug, tBasis + 1200, from, tBasis + 500);
  const tPipe = at(pipeline, tDrug + 1000, from, tDrug + 500);

  if (ms < tYear - 40 || ms > to) return null;

  // the count: one curve drives the figure AND its bar
  const q = EASE(k(tFig, tFigEnd - tFig));
  const shown = (q * figure.value).toLocaleString("en-US", { minimumFractionDigits: figure.decimals, maximumFractionDigits: figure.decimals });
  const figO = k(tFig - 40, 140);

  // the figure retires; the bar travels to the tower's foot
  const moveK = EASE_IO(k(tMove, 440));
  const heroO = 1 - clamp01(moveK * 2.2);
  const b0 = T.hero.bar;
  const bar = {
    x: lerp(b0.x, T.x, moveK),
    y: lerp(b0.y, T.base - T.tileH, moveK),
    w: lerp(b0.w * q, T.w, moveK),
    h: lerp(b0.h, T.tileH, moveK),
  };
  const tagO = k(tMove + 320, 160);

  // the price, then the climb
  const priceO = k(tPrice, 120);
  const priceS = interpolate(ms, [tPrice, tPrice + 280], [1.16, 1], { ...CLAMP, easing: EASE });
  const climb = k(tTimes, tTimesEnd - tTimes); // linear: tiles land at an even beat
  const upper = times.n - 1; // tiles above the base one
  const count = 1 + Math.round(upper * climb);
  const basisK = EASE(k(tBasis, 220));

  // the drug and what is behind it
  const drugO = k(tDrug, 120);
  const drugS = interpolate(ms, [tDrug, tDrug + 280], [1.14, 1], { ...CLAMP, easing: EASE });

  return (
    <AbsoluteFill>
      {/* ── the sales figure (retires on `move`) ── */}
      {heroO > 0 ? (
        <AbsoluteFill style={{ opacity: heroO }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: T.hero.labelY, textAlign: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: 64, letterSpacing: TRACK.headline, color: COLORS.grayText, lineHeight: 1 }}>
            <span style={{ opacity: k(tYear, 130) }}>{year.label}</span>
            <span style={{ opacity: k(tWhat, 130) }}> {what.label}</span>
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: T.hero.figY, transform: "translateY(-50%)", textAlign: "center", opacity: figO,
            fontFamily: DISPLAY, fontWeight: 700, fontSize: 220, letterSpacing: TRACK.display, color: INK, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
            {figure.prefix}{shown}{figure.suffix}
          </div>
        </AbsoluteFill>
      ) : null}

      {/* ── the unit: one red bar, then tile 1 of the tower ── */}
      {figO > 0 ? <div style={{ position: "absolute", left: bar.x, top: bar.y, width: bar.w, height: bar.h, background: R }} /> : null}
      <div style={{ position: "absolute", left: T.x + T.w + 22, top: T.base - T.tileH - 12, opacity: tagO, fontFamily: DISPLAY, fontWeight: 700, fontSize: 44, letterSpacing: TRACK.body, color: INK, lineHeight: 1, whiteSpace: "nowrap" }}>
        {figure.prefix}{figure.value.toFixed(figure.decimals)}{figure.suffix}
      </div>

      {/* ── the tower ── */}
      {Array.from({ length: upper }, (_, j) => {
        const i = j + 1;
        const p = clamp01(climb * upper - j);
        if (p <= 0) return null;
        return <div key={i} style={{ position: "absolute", left: T.x, top: T.base - T.tileH - i * T.pitch + (1 - EASE(p)) * 10, width: T.w, height: T.tileH, background: INK, opacity: p }} />;
      })}
      {priceO > 0 ? (
        <div style={{ position: "absolute", left: T.x, top: T.plate.y, width: T.w, height: T.plate.h, borderRadius: T.plate.h / 2, background: R, opacity: priceO, transform: `scale(${priceS})`,
          display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: 52, letterSpacing: TRACK.headline, color: COLORS.paper, whiteSpace: "nowrap" }}>
          {price.label}
        </div>
      ) : null}

      {/* ── the multiple ── */}
      <div style={{ position: "absolute", left: T.right - 240, width: 480, top: 400, textAlign: "center", opacity: k(tAbout, 130), fontFamily: DISPLAY, fontWeight: 700, fontSize: 48, letterSpacing: TRACK.body, color: COLORS.grayText, lineHeight: 1 }}>
        {about.label}
      </div>
      {ms >= tTimes ? (
        <div style={{ position: "absolute", left: T.right - 260, width: 520, top: 590, transform: "translateY(-50%)", textAlign: "center", opacity: k(tTimes, 100),
          fontFamily: DISPLAY, fontWeight: 700, fontSize: 250, letterSpacing: TRACK.display, color: INK, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
          {count}×
        </div>
      ) : null}
      <div style={{ position: "absolute", left: T.right - 240, width: 480, top: 730, textAlign: "center", opacity: basisK, transform: `translateY(${(1 - basisK) * 14}px)`, fontFamily: DISPLAY, fontWeight: 700, fontSize: 48, letterSpacing: TRACK.body, color: INK, lineHeight: 1 }}>
        {basis.label}
      </div>

      {/* ── the pipeline, BEHIND the drug: dashed, farthest first in z ── */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: pipeline.n }, (_, j) => pipeline.n - 1 - j).map((j) => {
          const p = EASE(k(tPipe + j * 420, 420));
          if (p <= 0) return null;
          return (
            <rect key={j} x={T.pill.x + (j + 1) * 150 * p} y={T.pill.y + 3} width={T.pill.w} height={T.pill.h - 6} rx={(T.pill.h - 6) / 2}
              fill={COLORS.paper} stroke={inkA(0.85 - j * 0.22)} strokeWidth={5} strokeDasharray="16 12" opacity={clamp01(p * 3)} />
          );
        })}
      </svg>
      {drugO > 0 ? (
        <div style={{ position: "absolute", left: T.pill.x, top: T.pill.y, width: T.pill.w, height: T.pill.h, borderRadius: T.pill.h / 2, background: INK, opacity: drugO, transform: `scale(${drugS})`,
          display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: 56, letterSpacing: TRACK.headline, color: COLORS.paper, whiteSpace: "nowrap" }}>
          {drug.name}
        </div>
      ) : null}

      <Phrase from={tMove} to={tDrug - 360} line={lines[0].text} top={LINE_TOP} size={56} color={INK} emphasize={lines[0].emphasize} empColor={INK} restColor={COLORS.grayText} />
      <Phrase from={at({ word: lines[1].word }, tDrug - 300, from, tDrug - 320)} to={to + 400} line={lines[1].text} top={LINE_TOP} size={56} color={INK} emphasize={lines[1].emphasize} empColor={INK} restColor={COLORS.grayText} />
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// RareCorridor — the read (ink world)
// ══════════════════════════════════════════════════════════════════════════
export const CORR = {
  l: 310, r: 770, top: 560, mid: 930, bot: 1250,
  marks: [760, 950, 1140], // recurring marks, clear of both entrant seats
  chip: { w: 230, h: 90, inX: 425 },
  majors: { w: 150, h: 70, y0: 300, y1: 450, x0: [45, 255, 465, 675, 885], x1: [325, 395, 465, 535, 605] },
};

type Entrant = {
  name: string; // the buyer
  side: "left" | "right";
  y: number; // top of its chip
  via: Cued; // it slides in through the rail
  gate: { name: string; w: number; accent?: boolean } & Cued; // the company it bought, on the rail
} & Cued;

export const RareCorridor: React.FC<Win & {
  title: { text: string } & Cued; // the lead line, alone over the footage
  majors: Cued; // unnamed chips drop in
  converge: Cued;
  lane: { label: string } & Cued; // rails draw, the lane is named
  durable: Cued; // rails run on, recurring marks
  end: { label: string } & Cued; // the lane's far end is named
  entrants: [Entrant, Entrant];
  lines: NarLine[]; // exactly three
}> = ({ from, to, title, majors, converge, lane, durable, end, entrants, lines }) => {
  const ms = useMs();
  const k = useK();
  const W = COLORS.paper;
  const C = CORR;

  const tTitle = at(title, from + 340, from);
  const tMajors = at(majors, tTitle + 1400, from, tTitle + 700);
  const tConv = at(converge, tMajors + 1100, from, tMajors + 600);
  const tLane = at(lane, tConv + 900, from, tConv + 600);
  const tDur = at(durable, tLane + 1200, from, tLane + 600);
  const tEnd = at(end, tDur + 500, from, tDur + 400);
  const tE = entrants.map((e) => {
    const a = at(e, tEnd + 1400, from, tEnd + 500);
    const via = at(e.via, a + 1000, from, a + 400);
    const gate = at(e.gate, via + 250, from, via + 200);
    return { a, via, gate };
  });
  // the second entrant never moves before the first has landed
  tE[1].a = Math.max(tE[1].a, tE[0].gate + 300);
  tE[1].via = Math.max(tE[1].via, tE[1].a + 400);
  tE[1].gate = Math.max(tE[1].gate, tE[1].via + 200);

  if (ms > to) return null;

  const convK = EASE_IO(k(tConv, 620));
  const majorsOut = 1 - k(tE[0].a - 400, 300); // the unnamed retire before the named arrive
  const railA = EASE(k(tLane, 420));
  const railB = EASE_IO(k(tDur, 460));
  const railEnd = lerp(lerp(C.top, C.mid, railA), C.bot, railB);
  const laneO = k(tLane + 120, 120);
  const laneS = interpolate(ms, [tLane + 120, tLane + 400], [1.14, 1], { ...CLAMP, easing: EASE });
  const endK = EASE(k(tEnd, 240));
  const M = C.majors;

  return (
    <AbsoluteFill>
      {/* the lead line, alone */}
      <Phrase from={tTitle} to={tMajors - 120} line={title.text} top={640} size={130} color={W} />

      {/* the rails */}
      {railA > 0 ? (
        <>
          <div style={{ position: "absolute", left: C.l - 3, top: C.top, width: 6, height: railEnd - C.top, background: W }} />
          <div style={{ position: "absolute", left: C.r - 3, top: C.top, width: 6, height: railEnd - C.top, background: W }} />
        </>
      ) : null}
      <div style={{ position: "absolute", left: C.l, width: C.r - C.l, top: 614, textAlign: "center", opacity: laneO, transform: `scale(${laneS})`, fontFamily: DISPLAY, fontWeight: 700, fontSize: 62, letterSpacing: TRACK.headline, color: W, lineHeight: 1, whiteSpace: "nowrap" }}>
        {lane.label}
      </div>
      {C.marks.map((y, i) => {
        const p = EASE(k(tDur + 120 + i * 130, 240));
        if (p <= 0) return null;
        const half = ((C.r - C.l) / 2 - 46) * p;
        return (
          <React.Fragment key={y}>
            <div style={{ position: "absolute", left: C.l + 18, top: y - 1, width: half, height: 3, background: "rgba(255,255,255,0.4)" }} />
            <div style={{ position: "absolute", left: C.r - 18 - half, top: y - 1, width: half, height: 3, background: "rgba(255,255,255,0.4)" }} />
            <div style={{ position: "absolute", left: C.l, width: C.r - C.l, top: y - 22, textAlign: "center", opacity: p, fontFamily: DISPLAY, fontWeight: 700, fontSize: 42, color: INK_SUB, lineHeight: 1 }}>$</div>
          </React.Fragment>
        );
      })}
      <div style={{ position: "absolute", left: 0, right: 0, top: C.bot + 30, textAlign: "center", opacity: endK, transform: `translateY(${(1 - endK) * 16}px)`, fontFamily: DISPLAY, fontWeight: 700, fontSize: 54, letterSpacing: TRACK.headline, color: W, lineHeight: 1 }}>
        {end.label}
      </div>

      {/* the unnamed majors: dashed, they drop in, converge on the mouth, then retire */}
      {majorsOut > 0 ? (
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: majorsOut }}>
          {M.x0.map((x0, i) => {
            const p = BACK(k(tMajors + i * 90, 300));
            if (p <= 0) return null;
            const x = lerp(x0, M.x1[i], convK);
            const y = lerp(M.y0, M.y1, convK) - (1 - p) * 60;
            return <rect key={i} x={x} y={y} width={M.w} height={M.h} rx={16} fill="rgba(0,0,0,0.55)" stroke={W} strokeOpacity={0.85} strokeWidth={4} strokeDasharray="14 10" opacity={clamp01(p * 2)} />;
          })}
        </svg>
      ) : null}

      {/* the named entrants */}
      {entrants.map((e, i) => {
        const t = tE[i];
        if (ms < t.a) return null;
        const x0 = e.side === "left" ? 40 : 1080 - 40 - C.chip.w;
        const inK = EASE_IO(k(t.via, 400));
        const x = lerp(x0, C.chip.inX, inK);
        const s = interpolate(ms, [t.a, t.a + 280], [1.16, 1], { ...CLAMP, easing: EASE });
        const railX = e.side === "left" ? C.l : C.r;
        const gy = e.y + C.chip.h / 2;
        const gO = k(t.gate, 110);
        const gS = interpolate(ms, [t.gate, t.gate + 280], [1.2, 1], { ...CLAMP, easing: EASE });
        // each gate card sits just outside the corridor, straddling its rail, clear of the chip's seat
        const gx = e.side === "left" ? railX + 85 - e.gate.w : railX - 105;
        return (
          <React.Fragment key={e.name}>
            <div style={{ position: "absolute", left: x, top: e.y, width: C.chip.w, height: C.chip.h, boxSizing: "border-box", borderRadius: C.chip.h / 2, border: `5px solid ${W}`, background: "rgba(0,0,0,0.6)",
              opacity: k(t.a, 110), transform: `scale(${s})`, display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: DISPLAY, fontWeight: 700, fontSize: 44, letterSpacing: TRACK.headline, color: W, whiteSpace: "nowrap" }}>
              {e.name}
            </div>
            {gO > 0 ? (
              <div style={{ position: "absolute", left: gx, top: gy - 42, width: e.gate.w, height: 84, boxSizing: "border-box", borderRadius: 16, background: W, border: e.gate.accent ? `6px solid ${COLORS.accent}` : "none",
                opacity: gO, transform: `scale(${gS})`, display: "flex", alignItems: "center", justifyContent: "center",
                fontFamily: DISPLAY, fontWeight: 700, fontSize: 42, letterSpacing: TRACK.headline, color: COLORS.ink, whiteSpace: "nowrap" }}>
                {e.gate.name}
              </div>
            ) : null}
          </React.Fragment>
        );
      })}

      <Phrase from={tMajors} to={tE[0].a - 100} line={lines[0].text} top={LINE_TOP - 40} size={56} color={W} emphasize={lines[0].emphasize} empColor={W} restColor={INK_SUB} />
      <Phrase from={tE[0].a} to={tE[1].a - 100} line={lines[1].text} top={LINE_TOP - 40} size={56} color={W} emphasize={lines[1].emphasize} empColor={W} restColor={INK_SUB} />
      <Phrase from={tE[1].a} to={to + 400} line={lines[2].text} top={LINE_TOP - 40} size={56} color={W} emphasize={lines[2].emphasize} empColor={W} restColor={INK_SUB} />
    </AbsoluteFill>
  );
};
