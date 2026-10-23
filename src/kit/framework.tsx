// ─────────────────────────────────────────────────────────────────────────
// KIT · framework — A COMMITMENT TO WRITE A RULE, NOT A RULE. Added on the FDA Rare
// Disease Framework Initiative HORIZONTAL long-form, 2026-10-23 (16:9; absolute
// 1920x1080 coordinates, not portrait-safe as written).
//
// Spine: THE BLANK PAGE. A white sheet whose title is the initiative's name and whose
// body is DASHED (not written yet). Born in §2, it gets its headings later; the body
// never fills, because nothing has been written.
//
// Grammar: SOLID = exists / approved, HOLLOW or DASHED = not yet. Dashes on shapes
// only, never on letterforms. One mover at a time; landed things go still.
//
// Blocks: `FiveHook` (red), `CommitmentPage` (black, over a scrim, then the page).
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { CLAMP, clamp01, COLORS, cueSeq, inkA, INK_SUB, INK_SUB_ON_RED, useMs } from "./core";
import { at, lerp, useK, type Cued, type Win } from "./elora";
import { big, label } from "./rona";
import { Letters } from "./hunt";
import { DayLeaf } from "./unity";

const EASE = Easing.out(Easing.cubic);
const EASE_IN = Easing.in(Easing.cubic);
const EASE_IO = Easing.inOut(Easing.cubic);
const BACK = Easing.out(Easing.back(1.6));
const BOUNCE = Easing.out(Easing.bounce);

// ══════════════════════════════════════════════════════════════════════════
// Helpers
// ══════════════════════════════════════════════════════════════════════════
/** Words that pop on their own spoken frames (cueSeq), laid out as one flowing line. */
const SpokenWords: React.FC<{ text: string; from: number; to: number; style: React.CSSProperties }> = ({ text, from, to, style }) => {
  const ms = useMs();
  const words = text.split(" ");
  const ts = cueSeq(words, from, to);
  return (
    <div style={{ display: "flex", flexWrap: "wrap", columnGap: "0.26em", ...style }}>
      {words.map((w, i) => {
        const t = ts[i] ?? from + i * 160;
        const q = clamp01((ms - t) / 260);
        return (
          <span key={i} style={{ display: "inline-block", opacity: clamp01(q * 3), transform: `translateY(${(1 - BACK(q)) * 24}px)` }}>
            {w}
          </span>
        );
      })}
    </div>
  );
};

/** One digit on a real reel: a masked column that spins and decelerates onto `digit`. */
const Reel: React.FC<{ digit: number; t0: number; lock: number; size: number; color: string }> = ({ digit, t0, lock, size, color }) => {
  const ms = useMs();
  const q = clamp01((ms - t0) / Math.max(1, lock - t0));
  const turns = 3; // full spins before it lands
  const pos = (turns * 10 + digit) * EASE(q); // digits travelled
  const h = size;
  const strip = Array.from({ length: turns * 10 + 10 }, (_, i) => i % 10);
  const blur = q < 1 ? (1 - q) * 10 : 0;
  return (
    <span style={{ display: "inline-block", height: h, overflow: "hidden", verticalAlign: "top" }}>
      <span style={{ display: "block", transform: `translateY(${-pos * h}px)`, filter: blur > 0.3 ? `blur(${blur}px)` : undefined }}>
        {strip.map((d, i) => (
          <span key={i} style={{ display: "block", height: h, lineHeight: `${h}px`, ...big(color, size) }}>{d}</span>
        ))}
      </span>
    </span>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// FiveHook — §1, the red world. 30 million, then a grid of 100 rare conditions,
// five lit: "about 5% have an approved treatment" as a proportion, not a count.
// ══════════════════════════════════════════════════════════════════════════
export const FIVE = {
  num: { top: 250, size: 250 },
  line: { top: 560, size: 74 },
  grid: { cx: 540, cy: 500, gap: 60, r: 13, n: 10 },
  col: { x: 980, kicker: 300, fig: 360, figSize: 300, aboutSize: 96, line: 720, lineSize: 62 },
  lit: [13, 36, 52, 79, 94], // five seats, scattered (illustrative, not a map of real conditions)
};

export const FiveHook: React.FC<Win & {
  num: { digits: string; word: string; lockWord: string; unit: string }; // "30" reels, "million" lands
  line: { text: string }; // "Americans live with a rare disease."
  implode: Cued; // the figure collapses into a point, which bursts into 100 dots
  kicker: { label: string } & Cued; // "By the FDA's own count"
  only: Cued; // 95 dots hollow out
  about: { label: string } & Cued;
  five: { text: string } & Cued; // "5%" slams
  tail: { text: string; to: number }; // "of rare conditions have an approved treatment." word by word
}> = ({ from, to, num, line, implode, kicker, only, about, five, tail }) => {
  const ms = useMs();
  const k = useK();
  const WH = COLORS.paper;
  const F = FIVE;
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));

  const tNum = cue2(num.word, from, from);
  const tLock = cue2(num.lockWord, tNum + 700, from);
  const tImp = at(implode, tLock + 2800, from);
  const tKick = at(kicker, tImp + 450, from);
  const tOnly = at(only, tKick + 1300, from);
  const tAbout = at(about, tOnly + 350, from);
  const tFive = at(five, tAbout + 600, from);

  // the implosion: the whole figure collapses into the grid's centre, then the dots burst out
  const IMP = 380;
  const iq = EASE_IN(k(tImp, IMP));
  const g = F.grid;
  const half = ((g.n - 1) * g.gap) / 2;
  const tBurst = tImp + IMP - 40;

  if (ms < tNum - 80) return null;
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {/* ── 30 million: reels spin and lock, then the line flows word by word ── */}
      {iq < 1 ? (
        <div style={{ position: "absolute", inset: 0, transformOrigin: `${g.cx}px ${g.cy}px`, transform: `scale(${lerp(1, 0.02, iq)})`, opacity: 1 - clamp01((iq - 0.7) / 0.3), filter: iq > 0 ? `blur(${iq * 14}px)` : undefined }}>
          <div style={{ position: "absolute", left: 0, width: 1920, top: F.num.top, display: "flex", justifyContent: "center", alignItems: "flex-start", gap: F.num.size * 0.26 }}>
            <span style={{ display: "inline-flex" }}>
              {[...num.digits].map((d, i) => (
                <Reel key={i} digit={Number(d)} t0={tNum + i * 60} lock={lerp(tNum + 380, tLock + 200, (i + 1) / num.digits.length)} size={F.num.size} color={WH} />
              ))}
            </span>
            <span style={{ height: F.num.size, lineHeight: `${F.num.size}px`, ...big(WH, F.num.size) }}>
              {ms >= tLock - 40 ? <Letters text={num.unit} t={tLock} stagger={34} rise={60} /> : null}
            </span>
          </div>
          <SpokenWords text={line.text} from={tLock} to={tImp} style={{ position: "absolute", left: 0, width: 1920, top: F.num.top + F.num.size + 70, justifyContent: "center", ...big(WH, F.line.size) }} />
        </div>
      ) : null}

      {/* ── 100 rare conditions: the dots burst from the implosion point into a grid; on "only" 95 hollow out ── */}
      {ms >= tBurst ? (
        <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} width={1920} height={1080}>
          {Array.from({ length: g.n * g.n }, (_, i) => {
            const c = i % g.n;
            const r = Math.floor(i / g.n);
            const x = g.cx - half + c * g.gap;
            const y = g.cy - half + r * g.gap;
            const dist = Math.hypot(x - g.cx, y - g.cy);
            const bq = clamp01((ms - (tBurst + dist * 0.9)) / 520);
            if (bq <= 0) return null;
            const p = BACK(bq);
            const lit = F.lit.includes(i);
            const hq = lit ? 0 : EASE(clamp01((ms - (tOnly + c * 28)) / 260)); // hollow-out wave, left to right
            const lq = lit ? BACK(clamp01((ms - tOnly - 120) / 340)) : 0;
            const R = g.r * (1 + 0.32 * lq);
            return (
              <circle key={i} cx={lerp(g.cx, x, p)} cy={lerp(g.cy, y, p)} r={Math.max(0, R * Math.min(1, bq * 2))}
                fill={WH} fillOpacity={1 - hq} stroke={WH} strokeWidth={3} strokeOpacity={lerp(1, 0.5, hq)} />
            );
          })}
        </svg>
      ) : null}

      {/* ── the right column: source, the figure, what it is a share of ── */}
      <div style={{ position: "absolute", left: F.col.x, top: F.col.kicker, ...label(INK_SUB_ON_RED, 40) }}>
        {ms >= tKick - 40 ? <Letters text={kicker.label} t={tKick} stagger={18} rise={30} /> : null}
      </div>
      <div style={{ position: "absolute", left: F.col.x, top: F.col.fig, display: "flex", alignItems: "baseline", gap: 28 }}>
        <span style={{ ...big(WH, F.col.aboutSize) }}>{ms >= tAbout - 40 ? <Letters text={about.label} t={tAbout} stagger={30} rise={40} /> : null}</span>
        {ms >= tFive - 40 ? (() => {
          const s = k(tFive, 420);
          return (
            <span style={{ display: "inline-block", transformOrigin: "30% 70%", opacity: clamp01(s * 5), transform: `scale(${lerp(2.4, 1, EASE(s))})`, filter: s < 1 ? `blur(${(1 - EASE(s)) * 18}px)` : undefined, ...big(WH, F.col.figSize) }}>
              {five.text}
            </span>
          );
        })() : null}
      </div>
      <SpokenWords text={tail.text} from={tFive} to={tail.to} style={{ position: "absolute", left: F.col.x, width: 820, top: F.col.line, lineHeight: 1.12, ...big(WH, F.col.lineSize), whiteSpace: "normal" }} />
    </AbsoluteFill>
  );
};

/** cue with a fallback, scoped to the block start (the kit's `at` takes a Cued; this takes a phrase). */
const cue2 = (word: string, fallback: number, from: number) => at({ word }, fallback, from);

// ══════════════════════════════════════════════════════════════════════════
// The page — THE SPINE. A flat white sheet with a dog-eared corner, a title, a rule,
// and a DASHED body (nothing written yet).
// ══════════════════════════════════════════════════════════════════════════
export const PAGE = {
  x: 560, y: 120, w: 800, h: 790, ear: 64,
  title: { x: 630, top: 182, size: 54, gap: 60 }, // two lines of the initiative's name
  rule: { y: 330 },
  lines: { x: 630, y0: 410, step: 74, n: 6, widths: [0.96, 0.88, 0.93, 0.8, 0.9, 0.58] },
};
const BODY_W = PAGE.w - 2 * (PAGE.title.x - PAGE.x);

/** The sheet itself (no title: the title is the travelled name, drawn by its block). */
export const Sheet: React.FC<{ q: number; dashLines?: boolean }> = ({ q, dashLines = true }) => {
  if (q <= 0) return null;
  const P = PAGE;
  const ink = COLORS.ink;
  return (
    <div style={{ position: "absolute", left: P.x, top: P.y, width: P.w, height: P.h, perspective: 1600 }}>
      <svg width={P.w} height={P.h} style={{ position: "absolute", left: 0, top: 0, overflow: "visible", opacity: clamp01(q * 4), transformOrigin: "50% 100%",
        transform: `translateY(${lerp(560, 0, EASE(q))}px) rotateX(${lerp(62, 0, BACK(q))}deg)` }}>
        <path d={`M0 0 H${P.w - P.ear} L${P.w} ${P.ear} V${P.h} H0 Z`} fill={COLORS.paper} />
        <path d={`M${P.w - P.ear} 0 V${P.ear} H${P.w}`} fill="none" stroke={ink} strokeOpacity={0.25} strokeWidth={3} />
        <line x1={P.title.x - P.x} x2={P.w - (P.title.x - P.x)} y1={P.rule.y - P.y} y2={P.rule.y - P.y} stroke={ink} strokeWidth={4} />
        {dashLines
          ? P.lines.widths.map((w, i) => (
              <line key={i} x1={P.lines.x - P.x} x2={P.lines.x - P.x + BODY_W * w} y1={P.lines.y0 - P.y + i * P.lines.step} y2={P.lines.y0 - P.y + i * P.lines.step}
                stroke={ink} strokeOpacity={0.35} strokeWidth={5} strokeDasharray="18 14" strokeLinecap="round" />
            ))
          : null}
      </svg>
    </div>
  );
};

/** A fountain-pen nib, tip at (x, y), pointing down-left. Ink-black, for the white page. */
export const Nib: React.FC<{ x: number; y: number; q: number; s?: number }> = ({ x, y, q, s = 1 }) => {
  if (q <= 0) return null;
  const dy = lerp(-220, 0, BOUNCE(q));
  return (
    <svg style={{ position: "absolute", left: x, top: y - 110 * s + dy, overflow: "visible", opacity: clamp01(q * 5) }} width={110 * s} height={110 * s} viewBox="0 0 110 110">
      <g transform="rotate(45 0 110)">
        <path d="M0 110 L-22 50 Q-24 26 -14 14 L14 14 Q24 26 22 50 Z" fill={COLORS.ink} />
        <line x1={0} y1={106} x2={0} y2={58} stroke={COLORS.paper} strokeWidth={3} />
        <circle cx={0} cy={56} r={5} fill={COLORS.paper} />
        <rect x={-16} y={-6} width={32} height={22} rx={4} fill={COLORS.ink} />
      </g>
    </svg>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// CommitmentPage — §2, black over a scrim. A date leaf, the initiative's name flips in,
// "a new rule" is struck, then the sheet rises under the name (which inverts as the
// white passes beneath it), the name travels into the title seat, and a nib lands on
// line 1. The page then HOLDS: §3 writes on it.
// ══════════════════════════════════════════════════════════════════════════
export const COMMIT = {
  leaf: { x: 150, y: 330, w: 220, h: 244 },
  kicker: { x: 440, top: 286, size: 40 },
  name: { x: 440, top: 352, size: 112, gap: 126 },
  tag: { x: 440, top: 650, size: 56 },
};

export const CommitmentPage: React.FC<Win & {
  date: { month: string; day: string } & Cued;
  kicker: { label: string } & Cued; // "The FDA launched"
  name: { lines: string[][]; until: number }; // each word flips in on its spoken frame
  tag: { label: string } & Cued; // "A new rule"
  strike: Cued; // red strike on "rule."
  page: Cued; // the sheet rises
  travel: Cued; // the name travels into the title seat
  pen: Cued; // the nib drops onto line 1
  // §3 (chunk 2) — all optional, so chunk 1 is unchanged without them
  tab?: { label: string } & Cued; // a red "White paper" tab clips onto the top edge
  heading?: { lines: { text: string; word: string; until: string }[] }; // the nib writes each line while it is voiced
  sub?: { text: string; to: number } & Cued; // lines 3-4: the sub-line, word by word
}> = ({ from, to, date, kicker, name, tag, strike, page, travel, pen, tab, heading, sub }) => {
  const ms = useMs();
  const k = useK();
  const WH = COLORS.paper;
  const C = COMMIT;
  const P = PAGE;
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));

  const tDate = at(date, from + 300, from);
  const tKick = at(kicker, tDate + 1600, from);
  const flat = name.lines.flat();
  const nameTs = cueSeq(flat, tKick, name.until).map((t, i) => t ?? tKick + 900 + i * 400);
  const tTag = at(tag, nameTs[nameTs.length - 1] + 1500, from);
  const tStrike = at(strike, tTag + 380, from);
  const tFall = tStrike + 360; // in the pause after "rule."
  const tPage = at(page, tFall + 300, from);
  const tTravel = Math.max(at(travel, tPage + 450, from), tPage + 420);
  const tPen = at(pen, tTravel + 900, from);

  const fall = k(tFall, 640);
  const fallY = fall * fall * 900;
  const leafK = k(tDate, 560);
  const pq = k(tPage, 720);
  const tv = EASE_IO(k(tTravel, 620));
  const S = P.title.size / C.name.size;

  // the name's group: (C.name.x, C.name.top) → (P.title.x, P.title.top), scale S, line gap scaled to the title's gap
  const gx = lerp(C.name.x, P.title.x, tv);
  const gy = lerp(C.name.top, P.title.top, tv);
  const gs = lerp(1, S, tv);
  const gap = lerp(C.name.gap, P.title.gap / S, tv);

  if (ms < tDate - 80) return null;
  let wi = 0;
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {/* ── the leaf, the kicker and the struck tag: they fall away together, in the pause ── */}
      <div style={{ position: "absolute", inset: 0, transform: `translateY(${fallY}px) rotate(${fall * -6}deg)`, opacity: 1 - clamp01((fall - 0.55) / 0.45) }}>
        <DayLeaf rect={C.leaf} k={leafK} month={date.month} day={date.day} />
        <div style={{ position: "absolute", left: C.kicker.x, top: C.kicker.top, ...label(INK_SUB, C.kicker.size), opacity: 1 - k(tTag - 200, 300) }}>
          {ms >= tKick - 40 ? <Letters text={kicker.label} t={tKick} stagger={20} rise={30} /> : null}
        </div>
        {ms >= tTag - 40 ? (() => {
          const tq = k(tTag, 380);
          const sq = EASE(k(tStrike, 260));
          return (
            <div style={{ position: "absolute", left: C.tag.x, top: C.tag.top, opacity: clamp01(tq * 4), transform: `translateY(${(1 - BACK(tq)) * 40}px)` }}>
              <div style={{ position: "relative", display: "inline-block", border: `5px solid ${WH}`, borderRadius: 999, padding: "12px 40px", ...big(WH, C.tag.size) }}>
                {tag.label}
                <span style={{ position: "absolute", left: -18, right: -18, top: "50%", height: 10, marginTop: -5, background: COLORS.accent, transformOrigin: "0 50%", transform: `scaleX(${sq})` }} />
              </div>
            </div>
          );
        })() : null}
      </div>

      {/* ── the sheet rises beneath the name ── */}
      <Sheet q={pq} />

      {/* ── the name: white, blended by DIFFERENCE, so it inverts to black as the white sheet passes beneath it ── */}
      <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, mixBlendMode: "difference" }}>
        <div style={{ position: "absolute", left: gx, top: gy, transformOrigin: "0 0", transform: `scale(${gs})` }}>
          {name.lines.map((ln, li) => (
            <div key={li} style={{ position: "absolute", left: 0, top: li * gap, display: "flex", gap: "0.26em", ...big(WH, C.name.size) }}>
              {ln.map((w) => {
                const t = nameTs[wi++];
                return ms >= t - 40 ? <Letters key={w} text={w} t={t} stagger={26} rise={50} mode="flip" /> : <span key={w} />;
              })}
            </div>
          ))}
        </div>
      </div>

      {/* ── §3: the "White paper" tab clips onto the top edge ── */}
      {tab && ms >= at(tab, tPen + 2500, from) - 40 ? (() => {
        const q = k(at(tab, tPen + 2500, from), 560);
        return (
          <div style={{ position: "absolute", left: P.title.x - 14, top: P.y - 58, transform: `translateY(${lerp(-200, 0, BOUNCE(q))}px)`, opacity: clamp01(q * 5),
            background: COLORS.accent, padding: "10px 26px 14px", borderRadius: "10px 10px 0 0", ...label(WH, 32) }}>
            {tab.label}
          </div>
        );
      })() : null}

      {/* ── §3: the nib writes the heading over lines 1-2 (each line while it is voiced), then lifts ── */}
      <PageWriting heading={heading} sub={sub} from={from} tPen={tPen} />

      {/* ── the nib lands on the start of line 1 (it hands over to PageWriting once the heading starts) ── */}
      {!heading || ms < at({ word: heading.lines[0].word }, Infinity, from) ? <Nib x={P.lines.x} y={P.lines.y0} q={k(tPen, 620)} /> : null}
    </AbsoluteFill>
  );
};

/** The heading written by the nib (a clip that uncovers the text, the nib riding its edge, the dashed line erased under
 *  it), then the sub-line word by word over lines 3-4 (their dashes fade out first). Laid out by the string: the nib's x
 *  is a percentage of its own line's box, never an estimate. */
const PageWriting: React.FC<{ heading?: { lines: { text: string; word: string; until: string }[] }; sub?: { text: string; to: number } & Cued; from: number; tPen: number }> = ({
  heading, sub, from,
}) => {
  const ms = useMs();
  const k = useK();
  const P = PAGE;
  const ink = COLORS.ink;
  if (!heading) return null;
  const SIZE = 60;
  const spans = heading.lines.map((l) => {
    const t0 = at({ word: l.word }, Infinity, from);
    const t1 = Math.max(at({ word: l.until }, t0 + 700, from), t0 + 300);
    return { t0, t1 };
  });
  const lift = k(spans[spans.length - 1].t1 + 80, 380);
  const tSub = sub ? at(sub, spans[spans.length - 1].t1 + 200, from) : Infinity;
  const subFade = k(tSub - 220, 220);
  return (
    <>
      {/* lines 3-4 lose their dashes just before the sub-line lands on them */}
      {sub && subFade > 0 ? (
        <div style={{ position: "absolute", left: P.lines.x - 10, top: P.lines.y0 + 2 * P.lines.step - 12, width: BODY_W + 20, height: P.lines.step + 24, background: COLORS.paper, opacity: subFade }} />
      ) : null}
      {heading.lines.map((l, i) => {
        const { t0, t1 } = spans[i];
        if (ms < t0 - 40) return null;
        const p = EASE_IO(clamp01((ms - t0) / (t1 - t0)));
        const base = P.lines.y0 + i * P.lines.step; // the text sits ON the line
        const isLast = i === heading.lines.length - 1;
        const writing = ms < (isLast ? t1 + 80 : spans[i + 1].t0); // one nib at a time: line 1's hands over to line 2's
        return (
          <div key={i} style={{ position: "absolute", left: P.lines.x, top: base - SIZE * 0.86, display: "inline-block" }}>
            <span style={{ position: "absolute", left: -6, top: SIZE * 0.86 - 8, height: 16, width: `calc(${p * 100}% + 12px)`, background: COLORS.paper }} />
            <span style={{ position: "relative", display: "inline-block", clipPath: `inset(-20% ${(1 - p) * 100}% -20% 0)`, ...big(ink, SIZE), lineHeight: 1 }}>{l.text}</span>
            {writing || (isLast && lift < 1) ? (
              <div style={{ position: "absolute", left: `${p * 100}%`, top: SIZE * 0.86, transform: isLast && !writing ? `translate(${lift * 120}px, ${-lift * 160}px)` : undefined, opacity: isLast && !writing ? 1 - lift : 1 }}>
                <Nib x={0} y={0} q={1} />
              </div>
            ) : null}
          </div>
        );
      })}
      {sub ? (
        <SpokenWords text={sub.text} from={tSub} to={sub.to} style={{ position: "absolute", left: P.lines.x, width: BODY_W, top: P.lines.y0 + 2 * P.lines.step - 36, rowGap: P.lines.step - 42,
          ...big(inkA(0.62), 36), lineHeight: 1.15, whiteSpace: "normal" }} />
      ) : null}
    </>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// FitFrame — §3 cont., the white card. One standard-size frame (the evidence
// expectations) over a few patient dots; it shrink-wraps them in three steps, one per
// factor named. "Match evidence expectations to what can realistically be generated."
// ══════════════════════════════════════════════════════════════════════════
export const FIT = {
  frame: { cx: 680, cy: 540, w: 820, h: 600, sw: 8 },
  snug: { w: 290, h: 230, r: 40 },
  dots: { r: 19, gap: 46 },
  col: { x: 1230, kicker: 290, tag0: 370, step: 112, size: 44 },
  stamp: { top: 700, size: 64 },
};
// a small cluster: 3 + 4 seats around the centre
const CLUSTER = [[-1, -0.5], [0, -0.5], [1, -0.5], [-1.5, 0.5], [-0.5, 0.5], [0.5, 0.5], [1.5, 0.5]];

export const FitFrame: React.FC<Win & {
  kicker: { label: string } & Cued; // "The idea"
  frame: Cued; // the big frame drops and squashes
  frameLabel: { label: string } & Cued; // "Evidence expectations"
  dots: Cued & { until: Cued }; // patients fall in one at a time while "generated in very small patient populations" is voiced
  popLabel: { label: string } & Cued; // "Very small patient populations"
  account: { label: string } & Cued; // the kicker turns over: "Taking account of"
  tags: ({ label: string } & Cued)[]; // each one reshapes the frame a step
  stamp: { label: string } & Cued; // "Fit for purpose"
}> = ({ from, to, kicker, frame, frameLabel, dots, popLabel, account, tags, stamp }) => {
  const ms = useMs();
  const k = useK();
  const ink = COLORS.ink;
  const sub = inkA(0.55);
  const F = FIT;
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));

  const tKick = at(kicker, from + 400, from);
  const tFrame = at(frame, tKick + 1000, from);
  const tFL = at(frameLabel, tFrame + 500, from);
  const tDots = at(dots, tFL + 1500, from);
  const tDotsEnd = Math.max(at(dots.until, tDots + 1500, from), tDots + 700);
  const tPop = at(popLabel, tDotsEnd, from);
  const tAcc = at(account, tPop + 1200, from);
  const tTags = tags.map((t, i) => at(t, tAcc + 1000 + i * 1200, from));
  const tStamp = Math.max(at(stamp, tTags[tTags.length - 1] + 600, from), tTags[tTags.length - 1] + 450);

  // the frame drops from above, squashes on impact, settles
  const dq = k(tFrame, 520);
  const fy = lerp(-900, 0, EASE_IN(clamp01(dq / 0.6)));
  const sq = dq < 0.6 ? 0 : Math.sin(Math.PI * clamp01((dq - 0.6) / 0.4));
  // three reshape steps, each 150ms after its tag lands
  const st = tTags.map((t) => Easing.out(Easing.back(1.3))(k(t + 150, 620)));
  const w = lerp(F.frame.w, F.snug.w, st[0] ?? 0);
  const h = lerp(F.frame.h, F.snug.h, st[1] ?? 0);
  const rad = lerp(0, F.snug.r, st[2] ?? 0);
  const x0 = F.frame.cx - w / 2;
  const y0 = F.frame.cy - h / 2 + fy;

  if (ms < tKick - 80) return null;
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {/* ── the frame ── */}
      {dq > 0 ? (
        <div style={{ position: "absolute", left: x0, top: y0, width: w, height: h, border: `${F.frame.sw}px solid ${ink}`, borderRadius: rad, boxSizing: "border-box",
          transformOrigin: "50% 100%", transform: `scale(${1 + sq * 0.06}, ${1 - sq * 0.1})` }} />
      ) : null}
      <div style={{ position: "absolute", left: x0, top: y0 - 62, ...label(ink, 40) }}>
        <BarRevealInk t={tFL}>{frameLabel.label}</BarRevealInk>
      </div>

      {/* ── the patients: fall in one by one onto their seats ── */}
      <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} width={1920} height={1080}>
        {CLUSTER.map(([cx, cy], i) => {
          const t = lerp(tDots, tDotsEnd, i / (CLUSTER.length - 1));
          const q = k(t, 520);
          if (q <= 0) return null;
          const x = F.frame.cx + cx * F.dots.gap;
          const y = F.frame.cy + cy * F.dots.gap;
          return <circle key={i} cx={x} cy={lerp(-80, y, BOUNCE(q))} r={F.dots.r} fill={ink} />;
        })}
      </svg>
      <div style={{ position: "absolute", left: 0, width: F.frame.cx * 2, top: F.frame.cy + 90, textAlign: "center", ...label(sub, 36), opacity: 1 - k(tAcc - 250, 300) }}>
        {ms >= tPop - 40 ? <Letters text={popLabel.label} t={tPop} stagger={14} rise={24} /> : null}
      </div>

      {/* ── the right column: the kicker, then the three factors ── */}
      <div style={{ position: "absolute", left: F.col.x, top: F.col.kicker, ...label(sub, 40) }}>
        <span style={{ position: "absolute", left: 0, top: 0, opacity: 1 - k(tAcc - 250, 250) }}>{ms >= tKick - 40 ? <Letters text={kicker.label} t={tKick} stagger={20} rise={30} /> : null}</span>
        <span style={{ position: "absolute", left: 0, top: 0 }}>{ms >= tAcc - 40 ? <Letters text={account.label} t={tAcc} stagger={18} rise={30} /> : null}</span>
      </div>
      {tags.map((t, i) => {
        const q = k(tTags[i], 420);
        if (q <= 0) return null;
        return (
          <div key={i} style={{ position: "absolute", left: F.col.x, top: F.col.tag0 + i * F.col.step, perspective: 900 }}>
            <div style={{ display: "inline-block", border: `4px solid ${ink}`, borderRadius: 999, padding: "10px 32px", transformOrigin: "0 50%", opacity: clamp01(q * 4),
              transform: `rotateY(${lerp(-90, 0, BACK(q))}deg)`, ...big(ink, F.col.size) }}>
              {t.label}
            </div>
          </div>
        );
      })}

      {/* ── the one red: "Fit for purpose" under the snug frame ── */}
      {ms >= tStamp - 40 ? (() => {
        const q = k(tStamp, 360);
        return (
          <div style={{ position: "absolute", left: 0, width: F.frame.cx * 2, top: F.stamp.top, textAlign: "center", opacity: clamp01(q * 5) }}>
            <span style={{ display: "inline-block", transform: `scale(${lerp(1.5, 1, EASE(q))})`, ...big(COLORS.accent, F.stamp.size) }}>{stamp.label}</span>
          </div>
        );
      })() : null}
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// CommitmentList — §4, black. The page swings back in (hinged at its top edge), a
// second sheet peeks out behind it, a red tab names the list. Each commitment writes in
// word by word as a numbered row with ONE dashed line under it (named, not yet written).
// Three rows a page; the page turns in the pause after row 3 and falls away.
// ══════════════════════════════════════════════════════════════════════════
export const LIST = {
  row0: 380, step: 166, numX: 630, textX: 712, textW: 588, size: 38, numSize: 40, // 3 lines at 38 + the dash = ~150 < step
  peek: 24, footer: { top: 856, size: 26 },
};

type Row = { text: string; word: string; until: string };

/** A page's static furniture: the sheet, its ink title (the initiative's name) and a footer. */
const ListSheet: React.FC<{ title: string[]; footer: string; dx?: number; dy?: number; style?: React.CSSProperties; children?: React.ReactNode }> = ({ title, footer, dx = 0, dy = 0, style, children }) => {
  const P = PAGE;
  const ink = COLORS.ink;
  return (
    <div style={{ position: "absolute", left: dx, top: dy, width: 1920, height: 1080, ...style }}>
      <Sheet q={1} dashLines={false} />
      {title.map((t, i) => (
        <div key={i} style={{ position: "absolute", left: P.title.x, top: P.title.top + i * P.title.gap, ...big(ink, P.title.size) }}>{t}</div>
      ))}
      <div style={{ position: "absolute", left: P.x + P.w - 70 - 200, width: 200, textAlign: "right", top: LIST.footer.top, ...label(inkA(0.45), LIST.footer.size) }}>{footer}</div>
      {children}
    </div>
  );
};

const ListRow: React.FC<{ row: Row; i: number; n: string; from: number; to: number }> = ({ row, i, n, from, to }) => {
  const ms = useMs();
  const k = useK();
  const L = LIST;
  const t0 = at({ word: row.word }, from + 300, from);
  const t1 = at({ word: row.until }, t0 + 2000, t0);
  const q = k(t0, 420);
  if (q <= 0) return null;
  const top = L.row0 + i * L.step;
  const dq = EASE(k(t0 + 200, 500));
  return (
    <>
      <div style={{ position: "absolute", left: L.numX, top: top + 2, perspective: 600, ...big(COLORS.accent, L.numSize) }}>
        <span style={{ display: "inline-block", opacity: clamp01(q * 4), transformOrigin: "50% 100%", transform: `rotateX(${lerp(-100, 0, BACK(q))}deg)` }}>{n}</span>
      </div>
      {/* text then its dashed line, in FLOW: the line sits under however many lines the text takes */}
      <div style={{ position: "absolute", left: L.textX, top, width: L.textW }}>
        <SpokenWords text={row.text} from={t0} to={Math.min(t1 + 400, to)} style={{ ...big(COLORS.ink, L.size), lineHeight: 1.12, whiteSpace: "normal" }} />
        <svg style={{ display: "block", marginTop: 16, overflow: "visible" }} width={L.textW} height={10}>
          <line x1={0} x2={L.textW * dq} y1={4} y2={4} stroke={COLORS.ink} strokeOpacity={0.35} strokeWidth={5} strokeDasharray="18 14" strokeLinecap="round" />
        </svg>
      </div>
    </>
  );
};

export const CommitmentList: React.FC<Win & {
  title: string[]; // the initiative's name, as it sits on the page
  enter: Cued; // the page swings in
  tab: { label: string } & Cued; // "Six commitments" — and the second sheet peeks out
  rows: Row[]; // six
  turn: Cued; // the page turns (in the pause after row 3)
}> = ({ from, to, title, enter, tab, rows, turn }) => {
  const ms = useMs();
  const k = useK();
  const P = PAGE;
  const L = LIST;
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));

  const tEnter = at(enter, from + 300, from);
  const tTab = at(tab, tEnter + 700, from);
  const tTurn = at(turn, tTab + 12000, from);

  const sq = k(tEnter, 760);
  const swing = lerp(-96, 0, Easing.out(Easing.back(1.2))(sq));
  const peek = EASE(k(tTab, 420)) * L.peek;
  // the turn: page 1 rotates about its LEFT edge and falls away; page 2 slides from its peek seat into the page seat
  const tq = k(tTurn, 640);
  const rot = lerp(0, -108, EASE_IN(tq));
  const fallY = tq * tq * 260;
  const settle = EASE_IO(k(tTurn + 320, 420));
  const p2 = lerp(peek, 0, settle);

  const tabQ = k(tTab, 520);
  const half = Math.ceil(rows.length / 2);
  if (ms < tEnter - 80) return null;
  return (
    <AbsoluteFill style={{ opacity: vis, perspective: 2000 }}>
      <div style={{ position: "absolute", inset: 0, transformOrigin: `960px ${P.y}px`, transform: `rotateX(${swing}deg)`, opacity: clamp01(sq * 4) }}>
        {/* the red tab rides the stack, so it stays through the turn */}
        {tabQ > 0 ? (
          <div style={{ position: "absolute", left: P.title.x - 14, top: P.y - 58, transform: `translateY(${lerp(-200, 0, BOUNCE(tabQ))}px)`, opacity: clamp01(tabQ * 5),
            background: COLORS.accent, padding: "10px 26px 14px", borderRadius: "10px 10px 0 0", ...label(COLORS.paper, 32) }}>
            {tab.label}
          </div>
        ) : null}
        {/* page 2: under page 1, peeking out; slides into the seat as page 1 turns */}
        {peek > 0 ? (
          <ListSheet title={title} footer="2 / 2" dx={p2} dy={p2}>
            {rows.slice(half).map((r, i) => <ListRow key={i} row={r} i={i} n={`0${half + i + 1}`} from={tTurn} to={to} />)}
          </ListSheet>
        ) : null}
        {/* page 1 */}
        {tq < 1 ? (
          <ListSheet title={title} footer="1 / 2" style={{ transformOrigin: `${P.x}px ${P.y + P.h / 2}px`, transform: `translateY(${fallY}px) rotateY(${rot}deg)`, opacity: 1 - clamp01((tq - 0.6) / 0.4) }}>
            {rows.slice(0, half).map((r, i) => <ListRow key={i} row={r} i={i} n={`0${i + 1}`} from={tTab} to={tTurn} />)}
          </ListSheet>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// ContextTwist — §5, red. A title whose "twist" twists; then hollow bricks fall and
// stack into a wall ("a lot of programs"), and on "counted 18" they fill solid one by
// one while 18 counts. No year is drawn on any brick: the source gives none per program.
// ══════════ HalfApprovals — §5 cont. An outline disc draws (novel approvals), a divider
// draws, the left half pours full and splits away: about half were for rare diseases.
// ══════════════════════════════════════════════════════════════════════════
export const TWIST = {
  title: { top: 330, size: 150, gap: 170 },
  wall: { x: 330, bottom: 830, cols: 3, rows: 6, bw: 152, bh: 58, gap: 10 },
  wallLabel: { top: 852, size: 40 },
  col: { x: 1000, kicker: 300, kickerSize: 36, fig: 420, figSize: 280, pill: 742, pillSize: 46 },
};

export const ContextTwist: React.FC<Win & {
  lines: { text: string; word: string }[]; // "The context," / "and the twist."
  twist: { word: string; letters: string }; // the letters of "twist" spin on the word
  out: { ms: number }; // the title whips up and away (a pause)
  bricks: Cued & { until: Cued }; // hollow bricks fall while "a lot of rare disease programs" is voiced
  wallLabel: { label: string } & Cued;
  kicker: { lines: { text: string; word: string }[] }; // the source, each line on its own words
  count: Cued & { until: Cued; value: number }; // bricks fill as 18 counts
  pill: { label: string } & Cued;
}> = ({ from, to, lines, twist, out, bricks, wallLabel, kicker, count, pill }) => {
  const ms = useMs();
  const k = useK();
  const WH = COLORS.paper;
  const T = TWIST;
  const W = T.wall;
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));

  const tl = lines.map((l) => at({ word: l.word }, from + 500, from));
  const tTwist = at({ word: twist.word }, tl[tl.length - 1] + 600, from);
  const oq = EASE_IN(k(out.ms, 420));
  const tB0 = at(bricks, out.ms + 500, from);
  const tB1 = Math.max(at(bricks.until, tB0 + 2000, from), tB0 + 1200);
  const tWL = at(wallLabel, tB1, from);
  const tKs = kicker.lines.map((l, i) => at({ word: l.word }, tWL + 1000 + i * 600, from));
  const tC0 = at(count, tKs[tKs.length - 1] + 2000, from);
  const tC1 = Math.max(at(count.until, tC0 + 700, from), tC0 + 500);
  const tPill = at(pill, tC1 + 600, from);
  const N = W.cols * W.rows;
  const cq = interpolate(ms, [tC0, tC1], [0, 1], { ...CLAMP, easing: EASE });

  if (ms < tl[0] - 80) return null;
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {/* ── the title: "twist" twists, then everything whips up and away ── */}
      {oq < 1 ? (
        <div style={{ position: "absolute", inset: 0, transform: `translateY(${-oq * 700}px)`, filter: oq > 0 ? `blur(${oq * 20}px)` : undefined, opacity: 1 - oq }}>
          {lines.map((l, i) => {
            const isLast = i === lines.length - 1;
            const words = l.text.split(" ");
            return (
              <div key={i} style={{ position: "absolute", left: 0, width: 1920, top: T.title.top + i * T.title.gap, display: "flex", justifyContent: "center", gap: "0.26em", ...big(WH, T.title.size) }}>
                {words.map((w, wi) => {
                  const isTwist = isLast && w.toLowerCase().startsWith(twist.letters);
                  if (ms < tl[i] - 40) return <span key={wi} />;
                  if (!isTwist) return <Letters key={wi} text={w} t={tl[i] + wi * 90} stagger={26} rise={60} />;
                  // the twist: each letter turns a full revolution about its vertical axis, staggered
                  return (
                    <span key={wi} style={{ display: "inline-block", perspective: 700 }}>
                      {[...w].map((ch, ci) => {
                        const q = clamp01((ms - (tTwist + ci * 70)) / 700);
                        const appear = clamp01((ms - (tl[i] + wi * 90 + ci * 26)) / 300);
                        return (
                          <span key={ci} style={{ display: "inline-block", opacity: clamp01(appear * 3), transform: `rotateY(${EASE_IO(q) * 360}deg) translateY(${(1 - BACK(appear)) * 60}px)` }}>{ch}</span>
                        );
                      })}
                    </span>
                  );
                })}
              </div>
            );
          })}
        </div>
      ) : null}

      {/* ── the wall: hollow bricks drop row by row; on the count they fill, one by one ── */}
      {ms >= tB0 - 40 ? (
        <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} width={1920} height={1080}>
          {Array.from({ length: N }, (_, i) => {
            const r = Math.floor(i / W.cols); // 0 = bottom row
            const c = i % W.cols;
            const x = W.x + c * (W.bw + W.gap) + (r % 2 ? W.bw * 0.18 : 0); // a running bond
            const y = W.bottom - (r + 1) * (W.bh + W.gap);
            const t = lerp(tB0, tB1 - 380, i / (N - 1));
            const q = clamp01((ms - t) / 420);
            if (q <= 0) return null;
            const land = clamp01((q - 0.75) / 0.25);
            const squash = Math.sin(Math.PI * land) * 0.16;
            const filled = cq * N >= i + 1;
            const fq = filled ? clamp01((ms - lerp(tC0, tC1, (i + 1) / N)) / 160) : 0;
            return (
              <rect key={i} x={x - (W.bw * squash) / 2} y={lerp(-200, y, EASE_IN(clamp01(q / 0.75))) + W.bh * squash} width={W.bw * (1 + squash)} height={W.bh * (1 - squash)} rx={8}
                fill={WH} fillOpacity={fq} stroke={WH} strokeWidth={4} />
            );
          })}
        </svg>
      ) : null}
      <div style={{ position: "absolute", left: W.x, top: T.wallLabel.top, ...label(INK_SUB_ON_RED, T.wallLabel.size) }}>
        {ms >= tWL - 40 ? <Letters text={wallLabel.label} t={tWL} stagger={16} rise={24} /> : null}
      </div>

      {/* ── the right column: the source, 18, most since 2019 ── */}
      <div style={{ position: "absolute", left: T.col.x, top: T.col.kicker, ...label(INK_SUB_ON_RED, T.col.kickerSize), lineHeight: 1.25 }}>
        {kicker.lines.map((ln, i) => (
          <div key={i}>{ms >= tKs[i] - 40 ? <Letters text={ln.text} t={tKs[i]} stagger={14} rise={24} /> : null}</div>
        ))}
      </div>
      {ms >= tC0 - 40 ? (
        <div style={{ position: "absolute", left: T.col.x, top: T.col.fig, fontVariantNumeric: "tabular-nums", ...big(WH, T.col.figSize), opacity: clamp01(k(tC0, 140) * 1) }}>
          {Math.round(cq * count.value)}
        </div>
      ) : null}
      {ms >= tPill - 40 ? (() => {
        const q = k(tPill, 420);
        return (
          <div style={{ position: "absolute", left: T.col.x, top: T.col.pill, perspective: 900 }}>
            <div style={{ display: "inline-block", border: `5px solid ${WH}`, borderRadius: 999, padding: "10px 34px", transformOrigin: "0 50%", opacity: clamp01(q * 4),
              transform: `rotateY(${lerp(-90, 0, BACK(q))}deg)`, ...big(WH, T.col.pillSize) }}>
              {pill.label}
            </div>
          </div>
        );
      })() : null}
    </AbsoluteFill>
  );
};

export const HALF = {
  kicker: { x: 200, top: 300, size: 44 },
  head: { x: 200, top: 360, size: 170 },
  disc: { cx: 1300, cy: 500, R: 270, sw: 8, split: 44 },
  discLabel: { top: 806, size: 36 },
};

export const HalfApprovals: React.FC<Win & {
  kicker: { label: string } & Cued; // "In recent years"
  head: { label: string } & Cued; // "About half"
  disc: Cued; // the outline draws
  discLabel: { lines: { text: string; word: string }[] };
  divider: Cued;
  pour: Cued; // the left half fills from the bottom
  split: { label: string } & Cued; // it splits away, labelled
}> = ({ from, to, kicker, head, disc, discLabel, divider, pour, split }) => {
  const ms = useMs();
  const k = useK();
  const WH = COLORS.paper;
  const H = HALF;
  const D = H.disc;
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));

  const tKick = at(kicker, from + 300, from);
  const tHead = at(head, tKick + 800, from);
  const tDisc = at(disc, tHead + 800, from);
  const tDLs = discLabel.lines.map((l, i) => at({ word: l.word }, tDisc + 1200 + i * 600, from));
  const tDiv = at(divider, tDLs[tDLs.length - 1] + 800, from);
  const tPour = at(pour, tDiv + 500, from);
  const tSplit = Math.max(at(split, tPour + 800, from), tPour + 560);

  const dq = EASE_IO(k(tDisc, 700));
  const vq = EASE_IO(k(tDiv, 380));
  const pq = EASE_IO(k(tPour, 560));
  const sq = k(tSplit, 520);
  const sx = -D.split * Easing.out(Easing.back(2))(sq);
  const stretch = Math.sin(Math.PI * clamp01(sq / 0.6)) * 0.08;
  const halfD = `M ${D.cx} ${D.cy - D.R} A ${D.R} ${D.R} 0 0 0 ${D.cx} ${D.cy + D.R} Z`;
  const C = 2 * Math.PI * D.R;
  if (ms < tKick - 80) return null;
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <div style={{ position: "absolute", left: H.kicker.x, top: H.kicker.top, ...label(INK_SUB_ON_RED, H.kicker.size) }}>
        {ms >= tKick - 40 ? <Letters text={kicker.label} t={tKick} stagger={18} rise={30} /> : null}
      </div>
      <div style={{ position: "absolute", left: H.head.x, top: H.head.top, width: 820, ...big(WH, H.head.size), whiteSpace: "normal", lineHeight: 1 }}>
        {ms >= tHead - 40 ? head.label.split(" ").map((w, i) => <div key={i}><Letters text={w} t={tHead + i * 200} stagger={30} rise={70} mode="drop" /></div>) : null}
      </div>
      <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} width={1920} height={1080}>
        <defs>
          <clipPath id="half-pour">
            <rect x={D.cx - D.R - 10} width={D.R + 10} y={lerp(D.cy + D.R, D.cy - D.R, pq)} height={2 * D.R * pq + 2} />
          </clipPath>
        </defs>
        {/* the outline, drawn from the top, clockwise */}
        {dq > 0 ? (
          <circle cx={D.cx} cy={D.cy} r={D.R} fill="none" stroke={WH} strokeWidth={D.sw} strokeDasharray={`${C * dq} ${C}`} transform={`rotate(-90 ${D.cx} ${D.cy})`} />
        ) : null}
        {vq > 0 ? <line x1={D.cx} x2={D.cx} y1={D.cy - D.R} y2={lerp(D.cy - D.R, D.cy + D.R, vq)} stroke={WH} strokeWidth={D.sw} /> : null}
        {/* the left half: pours full, then splits away with a squash-stretch */}
        {pq > 0 ? (
          <g transform={`translate(${sx} 0) translate(${D.cx} ${D.cy}) scale(${1 - stretch}, ${1 + stretch}) translate(${-D.cx} ${-D.cy})`}>
            <path d={halfD} fill={WH} clipPath="url(#half-pour)" />
          </g>
        ) : null}
      </svg>
      {/* the half's label, red on the white half */}
      {ms >= tSplit - 40 ? (
        <div style={{ position: "absolute", left: D.cx - D.R + sx, width: D.R, top: D.cy - 50, textAlign: "center", ...big(COLORS.accent, 44), whiteSpace: "normal", lineHeight: 1.05 }}>
          {split.label.split(" ").map((w, i) => <div key={i}><Letters text={w} t={tSplit + 120 + i * 120} stagger={24} rise={30} /></div>)}
        </div>
      ) : null}
      <div style={{ position: "absolute", left: D.cx - 420, width: 840, top: H.discLabel.top, textAlign: "center", ...label(INK_SUB_ON_RED, H.discLabel.size), lineHeight: 1.25 }}>
        {discLabel.lines.map((ln, i) => (
          <div key={i}>{ms >= tDLs[i] - 40 ? <Letters text={ln.text} t={tDLs[i]} stagger={12} rise={24} /> : null}</div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// MissingSlot — §6, the white card. "So what is ___?": a DASHED slot (sized by the
// answer's own string) appears on "missing", and the red answer drops into it.
// ══════════════════════════════════════════════════════════════════════════
export const SLOT = { top: 400, size: 116, kicker: { top: 300, size: 40 } };

export const MissingSlot: React.FC<Win & {
  lead: { text: string; word: string }; // "So what is"
  slot: Cued; // the dashed slot draws on "missing?"
  kicker: { label: string } & Cued; // "The paper’s answer"
  answer: { text: string } & Cued; // "Consistency"
}> = ({ from, to, lead, slot, kicker, answer }) => {
  const ms = useMs();
  const k = useK();
  const ink = COLORS.ink;
  const S = SLOT;
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));
  const tLead = at({ word: lead.word }, from + 300, from);
  const tSlot = at(slot, tLead + 800, from);
  const tKick = at(kicker, tSlot + 900, from);
  const tAns = at(answer, tKick + 1200, from);
  const sq = k(tSlot, 420);
  const aq = k(tAns, 520);
  const solid = EASE(k(tAns + 300, 300));
  const words = lead.text.split(" ");
  if (ms < tLead - 80) return null;
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <div style={{ position: "absolute", left: 0, width: 1920, top: S.kicker.top, textAlign: "center", ...label(inkA(0.55), S.kicker.size) }}>
        {ms >= tKick - 40 ? <Letters text={kicker.label} t={tKick} stagger={18} rise={30} /> : null}
      </div>
      <div style={{ position: "absolute", left: 0, width: 1920, top: S.top, display: "flex", justifyContent: "center", alignItems: "center", gap: "0.3em", ...big(ink, S.size) }}>
        {words.map((w, i) => {
          const t = cueSeq([w], tLead, tSlot)[0] ?? tLead + i * 200;
          return ms >= t - 40 ? <Letters key={i} text={w} t={t} stagger={24} rise={60} /> : <span key={i} style={{ opacity: 0 }}>{w}</span>;
        })}
        {/* the slot: sized by the answer's string (an invisible copy), dashed until the answer lands */}
        <span style={{ position: "relative", display: "inline-block", padding: "6px 22px" }}>
          <span style={{ visibility: "hidden" }}>{answer.text}</span>
          {sq > 0 ? (
            <span style={{ position: "absolute", inset: 0, borderRadius: 18, border: `6px ${solid > 0.5 ? "solid" : "dashed"} ${solid > 0.5 ? COLORS.accent : inkA(0.5)}`, opacity: clamp01(sq * 3) * (1 - solid * 0.0),
              transform: `scale(${lerp(0.6, 1, BACK(sq))})` }} />
          ) : null}
          {aq > 0 ? (
            <span style={{ position: "absolute", left: 22, top: 6, color: COLORS.accent, opacity: clamp01(aq * 5), transform: `translateY(${lerp(-420, 0, BOUNCE(aq))}px)` }}>{answer.text}</span>
          ) : null}
        </span>
        <span>{ms >= tSlot - 40 ? <Letters text="?" t={tSlot + 150} rise={60} mode="drop" /> : null}</span>
      </div>
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// Divisions — §6 cont., the white card. A row of unlabelled review-division desks
// (illustrative: no count is claimed). The tailored approach — §3's snug frame, as a
// token — hops onto a few of them ("many occasions"); a DASHED outline wraps all of them
// ("all review divisions, as a matter of course": the goal, not yet the case); then, as
// OUR reading, the unstamped desks go dashed.
// ══════════════════════════════════════════════════════════════════════════
export const DIV = {
  kicker: { x: 200, top: 210, size: 40 },
  row: { x0: 520, y: 470, w: 124, h: 108, gap: 24, n: 8, r: 16 },
  stamped: [0, 2, 3, 6], // illustrative seats
  token: { x: 250, y: 470, s: 108 },
  tokenLabel: { top: 600, size: 34 },
  outline: { pad: 30 },
  line: { top: 690, size: 46 },
};

/** §3's fitted frame as a token: a rounded square around three dots. */
const FitToken: React.FC<{ x: number; y: number; s: number; color: string; opacity?: number }> = ({ x, y, s, color, opacity = 1 }) => (
  <svg style={{ position: "absolute", left: x, top: y, overflow: "visible", opacity }} width={s} height={s} viewBox="0 0 100 100">
    <rect x={6} y={6} width={88} height={88} rx={18} fill="none" stroke={color} strokeWidth={8} />
    {[[32, 42], [50, 42], [68, 42], [41, 60], [59, 60]].map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r={7} fill={color} />)}
  </svg>
);

export const Divisions: React.FC<Win & {
  kicker: { label: string } & Cued; // "The white paper says"
  token: { label: string } & Cued; // "The tailored approach"
  desks: Cued; // the row rises in
  hops: Cued & { until: Cued }; // the token hops onto the stamped desks
  outline: Cued; // the dashed wrap draws
  goal: { parts: { text: string; word: string }[] }; // "All review divisions," / "as a matter of course"
  reading: { label: string; line: string; lineWord: string } & Cued; // "Our reading" / the line
  dash: Cued; // the unstamped desks go dashed
}> = ({ from, to, kicker, token, desks, hops, outline, goal, reading, dash }) => {
  const ms = useMs();
  const k = useK();
  const ink = COLORS.ink;
  const sub = inkA(0.55);
  const D = DIV;
  const R = D.row;
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));

  const tKick = at(kicker, from + 300, from);
  const tTok = at(token, tKick + 600, from);
  const tDesk = at(desks, tTok + 1200, from);
  const tH0 = at(hops, tDesk + 900, from);
  const tH1 = Math.max(at(hops.until, tH0 + 1200, from), tH0 + 900);
  const tOut = at(outline, tH1 + 500, from);
  const tGoal = goal.parts.map((p, i) => at({ word: p.word }, tOut + 200 + i * 1500, from));
  const tRead = at(reading, tGoal[tGoal.length - 1] + 1500, from);
  const tLine = at({ word: reading.lineWord }, tRead + 1000, from);
  const tDash = at(dash, tLine + 300, from);

  const deskX = (i: number) => R.x0 + i * (R.w + R.gap);
  const rowW = R.n * R.w + (R.n - 1) * R.gap;
  // the token's path: its seat → each stamped desk in turn (an arc per hop), then it retires
  const nh = D.stamped.length;
  const hopT = (j: number) => lerp(tH0, tH1, j / Math.max(1, nh - 1));
  const HOP = 300;
  let tx = D.token.x, ty = D.token.y;
  for (let j = 0; j < nh; j++) {
    const q = EASE_IO(clamp01((ms - (hopT(j) - HOP)) / HOP));
    if (q <= 0) break;
    const fx = j === 0 ? D.token.x : deskX(D.stamped[j - 1]) + (R.w - D.token.s) / 2;
    const toX = deskX(D.stamped[j]) + (R.w - D.token.s) / 2;
    tx = lerp(fx, toX, q);
    ty = D.token.y - Math.sin(Math.PI * q) * 150 + (R.h - D.token.s) / 2 * q;
  }
  const tokQ = k(tTok, 420);
  const tokOut = k(tOut - 200, 260);
  const oq = EASE_IO(k(tOut, 900));
  const dq = EASE(k(tDash, 500));
  const per = 2 * (rowW + 2 * D.outline.pad) + 2 * (R.h + 2 * D.outline.pad);

  if (ms < tKick - 80) return null;
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {/* kicker: the paper's words, then (turned over) our reading */}
      <div style={{ position: "absolute", left: D.kicker.x, top: D.kicker.top, ...label(sub, D.kicker.size) }}>
        <span style={{ position: "absolute", left: 0, top: 0, whiteSpace: "nowrap", opacity: 1 - k(tRead - 250, 250) }}>{ms >= tKick - 40 ? <Letters text={kicker.label} t={tKick} stagger={18} rise={30} /> : null}</span>
        <span style={{ position: "absolute", left: 0, top: 0, whiteSpace: "nowrap", color: COLORS.accent }}>{ms >= tRead - 40 ? <Letters text={reading.label} t={tRead} stagger={22} rise={30} /> : null}</span>
      </div>

      {/* the desks */}
      {Array.from({ length: R.n }, (_, i) => {
        const q = k(tDesk + i * 60, 420);
        if (q <= 0) return null;
        const j = D.stamped.indexOf(i);
        const fq = j >= 0 ? clamp01((ms - hopT(j)) / 140) : 0;
        const dashed = j < 0 && dq > 0;
        return (
          <div key={i} style={{ position: "absolute", left: deskX(i), top: R.y, width: R.w, height: R.h, borderRadius: R.r, boxSizing: "border-box",
            border: `6px ${dashed ? "dashed" : "solid"} ${dashed ? inkA(lerp(1, 0.45, dq)) : ink}`, background: fq > 0 ? inkA(fq) : "transparent",
            opacity: clamp01(q * 4), transform: `translateY(${(1 - BACK(q)) * 80}px)` }}>
            {fq > 0 ? <FitToken x={(R.w - 12 - 64) / 2} y={(R.h - 12 - 64) / 2} s={64} color={COLORS.paper} opacity={fq} /> : null}
          </div>
        );
      })}

      {/* the token + its label (retire as the outline starts) */}
      {tokQ > 0 && tokOut < 1 ? (
        <>
          <div style={{ position: "absolute", left: 0, top: 0, transform: `scale(${lerp(0.4, 1, BACK(tokQ))})`, transformOrigin: `${tx + D.token.s / 2}px ${ty + D.token.s / 2}px`, opacity: clamp01(tokQ * 4) * (1 - tokOut) }}>
            <FitToken x={tx} y={ty} s={D.token.s} color={ink} />
          </div>
          <div style={{ position: "absolute", left: D.token.x - 60, width: D.token.s + 120, top: D.tokenLabel.top, textAlign: "center", ...label(sub, D.tokenLabel.size), whiteSpace: "normal", opacity: 1 - clamp01(k(tH0 - 300, 250) + tokOut) }}>
            <Letters text={token.label} t={tTok} stagger={14} rise={20} />
          </div>
        </>
      ) : null}

      {/* the goal: a dashed outline wrapping every desk */}
      {oq > 0 ? (
        <svg style={{ position: "absolute", left: R.x0 - D.outline.pad, top: R.y - D.outline.pad, overflow: "visible" }} width={rowW + 2 * D.outline.pad} height={R.h + 2 * D.outline.pad}>
          <rect x={0} y={0} width={rowW + 2 * D.outline.pad} height={R.h + 2 * D.outline.pad} rx={30} fill="none" stroke={ink} strokeWidth={5}
            strokeDasharray={oq < 1 ? `${per * oq} ${per}` : "22 16"} strokeLinecap="round" />
        </svg>
      ) : null}

      {/* the line under the row: the goal, then our reading in the same seat */}
      <div style={{ position: "absolute", left: R.x0 - D.outline.pad, width: rowW + 2 * D.outline.pad, top: D.line.top, ...big(ink, D.line.size), display: "flex", gap: "0.28em", flexWrap: "wrap", opacity: 1 - k(tRead - 250, 250) }}>
        {goal.parts.map((p, i) => (ms >= tGoal[i] - 40 ? <Letters key={i} text={p.text} t={tGoal[i]} stagger={14} rise={30} /> : null))}
      </div>
      <SpokenWords text={reading.line} from={tLine} to={to} style={{ position: "absolute", left: R.x0 - D.outline.pad, width: rowW + 2 * D.outline.pad, top: D.line.top, ...big(ink, D.line.size), whiteSpace: "normal" }} />
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// NotYetPage — §7, black. The page WHIPS in from the right (its third entrance, each one
// different). Three rows, each an EMPTY dashed slot (the absence is the graphic), then a
// red "None yet" stamp. The page docks left while four DASHED "may lead to" tickets are
// dealt; they fall away, the page comes back, and a SOLID base slides in under it: the
// legal standard, unchanged.
// ══════════════════════════════════════════════════════════════════════════
export const NOTYET = {
  rows: { y0: 400, step: 150, labelSize: 42, slotX: 1010, slotW: 280, slotH: 100 }, // "New regulation" at 42 ends ~x 960
  stamp: { cx: 1150, cy: 630, size: 54, rot: -9 }, // over the slot column (1010-1290), centred on the middle row
  dock: { tx: -420, s: 0.62 }, // origin = the page's left-middle: its left edge lands at x 140
  home: { tx: 64, ty: -103, s: 0.84 }, // same origin: centred on x 960, top at y 80, bottom at ~744
  kicker: { x: 760, top: 250, size: 40 },
  tickets: { x: [760, 1320], y: [330, 530], w: 520, h: 160, size: 40 },
  base: { x: 480, w: 960, y: 780, h: 92, size: 36 },
};

export const NotYetPage: React.FC<Win & {
  title: string[];
  enter: Cued; // the page whips in
  tab: { label: string } & Cued;
  rows: ({ label: string } & Cued)[]; // each row lands with its empty slot
  stamp: { label: string; ms: number }; // in the pause after the last "no"
  dock: Cued; // the page slides aside
  kicker: { label: string } & Cued; // "May lead to"
  tickets: ({ label: string } & Cued)[];
  home: Cued; // the tickets fall away, the page comes back
  base: { label: string } & Cued;
  unchanged: { label: string } & Cued;
}> = ({ from, to, title, enter, tab, rows, stamp, dock, kicker, tickets, home, base, unchanged }) => {
  const ms = useMs();
  const k = useK();
  const ink = COLORS.ink;
  const WH = COLORS.paper;
  const P = PAGE;
  const N = NOTYET;
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));

  const tEnter = at(enter, from + 300, from);
  const tTab = at(tab, tEnter + 1500, from);
  const tRows = rows.map((r, i) => at(r, tTab + 1500 + i * 1200, from));
  const tDock = at(dock, stamp.ms + 600, from);
  const tKick = at(kicker, tDock + 400, from);
  const tTix = tickets.map((t, i) => at(t, tKick + 800 + i * 1500, from));
  const tHome = at(home, tTix[tTix.length - 1] + 1500, from);
  const tBase = Math.max(at(base, tHome + 400, from), tHome + 350);
  const tUn = at(unchanged, tBase + 2500, from);

  // the whip: from far right, blurred, overshoots and settles
  const wq = k(tEnter, 560);
  const wx = lerp(1500, 0, Easing.out(Easing.back(1.1))(wq));
  const blur = wq < 1 ? (1 - wq) * 30 : 0;
  // dock then home
  const dq = EASE_IO(k(tDock, 560));
  const hq = EASE_IO(k(tHome, 600));
  // one transform about the page's left-middle: normal -> docked (dq) -> home (hq)
  const ox = P.x, oy = P.y + P.h / 2;
  const ptx = lerp(lerp(0, N.dock.tx, dq), N.home.tx, hq);
  const pty = lerp(0, N.home.ty, hq);
  const ps = lerp(lerp(1, N.dock.s, dq), N.home.s, hq);
  const tabQ = k(tTab, 520);
  const sq = k(stamp.ms, 380);
  const tFall = tHome - 120;

  if (ms < tEnter - 80) return null;
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {/* ── the page (with its rows and stamp): whip in, dock left, come home above the base ── */}
      <div style={{ position: "absolute", inset: 0, transformOrigin: `${ox}px ${oy}px`, transform: `translate(${ptx}px, ${pty}px) scale(${ps})` }}>
            <div style={{ position: "absolute", inset: 0, transform: `translateX(${wx}px)`, filter: blur > 0.5 ? `blur(${blur}px)` : undefined }}>
              {tabQ > 0 ? (
                <div style={{ position: "absolute", left: P.title.x - 14, top: P.y - 58, transform: `translateY(${lerp(-200, 0, BOUNCE(tabQ))}px)`, opacity: clamp01(tabQ * 5),
                  background: COLORS.accent, padding: "10px 26px 14px", borderRadius: "10px 10px 0 0", ...label(WH, 32) }}>
                  {tab.label}
                </div>
              ) : null}
              <Sheet q={1} dashLines={false} />
              {title.map((t, i) => (
                <div key={i} style={{ position: "absolute", left: P.title.x, top: P.title.top + i * P.title.gap, ...big(ink, P.title.size) }}>{t}</div>
              ))}
              {rows.map((r, i) => {
                const q = k(tRows[i], 420);
                if (q <= 0) return null;
                const y = N.rows.y0 + i * N.rows.step;
                const bq = EASE(k(tRows[i] + 150, 420));
                return (
                  <React.Fragment key={i}>
                    <div style={{ position: "absolute", left: P.title.x, top: y + (N.rows.slotH - N.rows.labelSize) / 2 - 4, opacity: clamp01(q * 4), transform: `translateX(${(1 - BACK(q)) * -40}px)`, ...big(ink, N.rows.labelSize) }}>{r.label}</div>
                    <svg style={{ position: "absolute", left: N.rows.slotX, top: y, overflow: "visible", opacity: clamp01(bq * 3) }} width={N.rows.slotW} height={N.rows.slotH}>
                      <rect x={3} y={3} width={N.rows.slotW - 6} height={N.rows.slotH - 6} rx={16} fill="none" stroke={ink} strokeOpacity={0.45} strokeWidth={5} strokeDasharray="18 14"
                        transform={`translate(${N.rows.slotW / 2} ${N.rows.slotH / 2}) scale(${lerp(0.5, 1, bq)}) translate(${-N.rows.slotW / 2} ${-N.rows.slotH / 2})`} />
                    </svg>
                  </React.Fragment>
                );
              })}
              {sq > 0 ? (
                <div style={{ position: "absolute", left: N.stamp.cx - 300, width: 600, top: N.stamp.cy - N.stamp.size, textAlign: "center", opacity: clamp01(sq * 5) }}>
                  <span style={{ display: "inline-block", background: COLORS.accent, borderRadius: 14, padding: "14px 40px", transform: `rotate(${N.stamp.rot}deg) scale(${lerp(2.2, 1, EASE(sq))})`, ...big(WH, N.stamp.size) }}>{stamp.label}</span>
                </div>
              ) : null}
            </div>
      </div>

      {/* ── "may lead to": four dashed tickets dealt 2 x 2; they fall away when the page comes home ── */}
      {ms < tFall + 900 ? (
        <>
          <div style={{ position: "absolute", left: N.kicker.x, top: N.kicker.top, ...label(INK_SUB, N.kicker.size), opacity: 1 - k(tFall, 300) }}>
            {ms >= tKick - 40 ? <Letters text={kicker.label} t={tKick} stagger={18} rise={30} /> : null}
          </div>
          {tickets.map((t, i) => {
            const q = k(tTix[i], 460);
            if (q <= 0) return null;
            const fq = k(tFall + i * 60, 620);
            const x = N.tickets.x[i % 2];
            const y = N.tickets.y[Math.floor(i / 2)];
            return (
              <div key={i} style={{ position: "absolute", left: x, top: y, width: N.tickets.w, height: N.tickets.h, perspective: 1000 }}>
                <div style={{ width: "100%", height: "100%", boxSizing: "border-box", border: `5px dashed ${WH}`, borderRadius: 20, display: "flex", alignItems: "center", padding: "0 34px",
                  opacity: clamp01(q * 4) * (1 - clamp01((fq - 0.5) / 0.5)), transformOrigin: "50% 100%",
                  transform: `translateY(${fq * fq * 700}px) rotate(${fq * (i % 2 ? 14 : -12)}deg) rotateX(${lerp(80, 0, BACK(q))}deg)`, ...big(WH, N.tickets.size), whiteSpace: "normal", lineHeight: 1.1 }}>
                  {t.label}
                </div>
              </div>
            );
          })}
        </>
      ) : null}

      {/* ── the base: SOLID, slides in under the page ── */}
      {ms >= tBase - 40 ? (() => {
        const q = k(tBase, 620);
        const uq = k(tUn, 380);
        return (
          <div style={{ position: "absolute", left: N.base.x, top: N.base.y, width: N.base.w, height: N.base.h, transform: `translateX(${lerp(-1500, 0, Easing.out(Easing.back(1.1))(q))}px)`,
            background: WH, borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 36px", boxSizing: "border-box" }}>
            <span style={{ ...big(ink, N.base.size) }}>{base.label}</span>
            {uq > 0 ? (
              <span style={{ background: COLORS.accent, borderRadius: 999, padding: "8px 24px", opacity: clamp01(uq * 5), transform: `scale(${lerp(1.8, 1, EASE(uq))})`, ...big(WH, 30) }}>{unchanged.label}</span>
            ) : null}
          </div>
        );
      })() : null}
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// UnknownEnough — §8, red. The risk is NOT KNOWING: the question's words arrive out of
// focus and stay soft; only the "?" lands sharp.
// ══════════════════════════════════════════════════════════════════════════
export const UNKNOWN = { x: 200, kicker: { top: 250, size: 64 }, lead: { top: 360, size: 54, w: 1520 }, q: { top: 560, size: 124, gap: 136 } };

export const UnknownEnough: React.FC<Win & {
  kicker: { label: string } & Cued;
  lead: { text: string; to: number } & Cued;
  question: { lines: string[] } & Cued; // flows word by word, blurred
  mark: Cued; // the sharp "?"
}> = ({ from, to, kicker, lead, question, mark }) => {
  const ms = useMs();
  const k = useK();
  const WH = COLORS.paper;
  const U = UNKNOWN;
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));
  const tKick = at(kicker, from + 300, from);
  const tLead = at(lead, tKick + 1500, from);
  const tQ = at(question, tLead + 1800, from);
  const tMark = at(mark, tQ + 1300, from);
  const qWords = question.lines.flatMap((l, li) => l.split(" ").map((w) => ({ w, li })));
  const ts = cueSeq(qWords.map((x) => x.w), tQ, tMark + 200).map((t, i) => t ?? tQ + i * 220);
  if (ms < tKick - 80) return null;
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <div style={{ position: "absolute", left: U.x, top: U.kicker.top, ...big(WH, U.kicker.size) }}>
        {ms >= tKick - 40 ? <Letters text={kicker.label} t={tKick} stagger={26} rise={50} /> : null}
      </div>
      <SpokenWords text={lead.text} from={tLead} to={lead.to} style={{ position: "absolute", left: U.x, width: U.lead.w, top: U.lead.top, ...big(INK_SUB_ON_RED, U.lead.size), lineHeight: 1.15, whiteSpace: "normal" }} />
      {question.lines.map((_, li) => (
        <div key={li} style={{ position: "absolute", left: U.x, top: U.q.top + li * U.q.gap, display: "flex", gap: "0.26em", alignItems: "baseline", ...big(WH, U.q.size) }}>
          {qWords.map((x, i) => {
            if (x.li !== li) return null;
            const q = clamp01((ms - ts[i]) / 420);
            const blur = lerp(30, 7, EASE(q)); // never comes fully into focus
            return (
              <span key={i} style={{ display: "inline-block", opacity: clamp01(q * 3) * 0.92, filter: `blur(${blur}px)`, transform: `scale(${lerp(1.25, 1, EASE(q))})` }}>{x.w}</span>
            );
          })}
          {li === question.lines.length - 1 && ms >= tMark - 40 ? (() => {
            const q = k(tMark, 640);
            return <span style={{ display: "inline-block", opacity: clamp01(q * 6), transform: `translateY(${lerp(-520, 0, BOUNCE(q))}px) rotate(${lerp(-200, 0, EASE(q))}deg)` }}>?</span>;
          })() : null}
        </div>
      ))}
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// HubQuote — §8 cont., black over a scrim. Title, then name; the line flows word by
// word and ONLY the release's verbatim words sit inside the quote marks. One red
// underline draws under "consistency and predictability" as it is voiced.
// ══════════════════════════════════════════════════════════════════════════
export const HUB = { x: 200, title: { top: 270, size: 40 }, name: { top: 330, size: 96 }, line: { top: 510, size: 62, w: 1520 }, source: { top: 830, size: 28 } };

export const HubQuote: React.FC<Win & {
  title: { label: string } & Cued;
  name: { label: string } & Cued;
  line: { text: string; underline: [number, number] } & Cued; // underline = word indices [first, last]
  source: { label: string } & Cued;
}> = ({ from, to, title, name, line, source }) => {
  const ms = useMs();
  const WH = COLORS.paper;
  const H = HUB;
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));
  const tTitle = at(title, from + 400, from);
  const tName = at(name, tTitle + 2500, from);
  const tLine = at(line, tName + 1400, from);
  const words = line.text.split(" ");
  const ts = cueSeq(words, tLine, to).map((t, i) => t ?? tLine + i * 220);
  const [u0, u1] = line.underline;
  const uStart = ts[u0];
  const uEnd = (ts[u1 + 1] ?? ts[u1] + 500);
  const tSrc = at(source, uEnd + 800, from);
  if (ms < tTitle - 80) return null;
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <div style={{ position: "absolute", left: H.x, top: H.title.top, ...label(INK_SUB, H.title.size) }}>
        {ms >= tTitle - 40 ? <Letters text={title.label} t={tTitle} stagger={14} rise={24} /> : null}
      </div>
      <div style={{ position: "absolute", left: H.x, top: H.name.top, ...big(WH, H.name.size) }}>
        {ms >= tName - 40 ? <Letters text={name.label} t={tName} stagger={28} rise={50} mode="flip" /> : null}
      </div>
      <div style={{ position: "absolute", left: H.x, width: H.line.w, top: H.line.top, display: "flex", flexWrap: "wrap", columnGap: "0.26em", rowGap: 10, ...big(WH, H.line.size), lineHeight: 1.12, whiteSpace: "normal" }}>
        {words.map((w, i) => {
          const q = clamp01((ms - ts[i]) / 260);
          const under = i >= u0 && i <= u1;
          // the underline grows across each underlined word as the phrase is voiced
          const uq = under ? clamp01((ms - lerp(uStart, uEnd, (i - u0) / (u1 - u0 + 1))) / ((uEnd - uStart) / (u1 - u0 + 1))) : 0;
          return (
            <span key={i} style={{ position: "relative", display: "inline-block", opacity: clamp01(q * 3), transform: `translateY(${(1 - BACK(q)) * 24}px)` }}>
              {w}
              {under && uq > 0 ? <span style={{ position: "absolute", left: 0, right: i < u1 ? "-0.26em" : 0, bottom: -8, height: 8, background: COLORS.accent, transformOrigin: "0 50%", transform: `scaleX(${uq})` }} /> : null}
            </span>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: H.x, top: H.source.top, ...label(INK_SUB, H.source.size) }}>
        {ms >= tSrc - 40 ? <Letters text={source.label} t={tSrc} stagger={10} rise={20} /> : null}
      </div>
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// WorthBalance — §8 cont., black. A beam on a fulcrum. "A predictable answer" (solid)
// drops on the left and slams it down; "any single new pathway" (hollow) lands on the
// right and the beam rebalances, still tipped LEFT, gently: "could be worth more".
// Damped spring, then still.
// ══════════════════════════════════════════════════════════════════════════
export const BAL = {
  kicker: { x: 200, top: 230, size: 44 },
  pivot: { x: 960, y: 700 }, beamL: 1180, beamH: 14, arm: 370,
  fulcrum: { w: 130, h: 120 },
  block: { w: 500, h: 128, size: 42 }, // "Any single new pathway" at 42 is ~470 wide
  tilt1: -12, tilt2: -5, // degrees: left down
};

const spring = (from: number, target: number, s: number) => target + (from - target) * Math.exp(-4.2 * s) * Math.cos(10 * s);

export const WorthBalance: React.FC<Win & {
  kicker: { label: string } & Cued;
  left: { label: string } & Cued;
  right: { label: string } & Cued;
}> = ({ from, to, kicker, left, right }) => {
  const ms = useMs();
  const k = useK();
  const WH = COLORS.paper;
  const ink = COLORS.ink;
  const B = BAL;
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));
  const tKick = at(kicker, from + 300, from);
  const tL = at(left, tKick + 900, from);
  const tR = at(right, tL + 2400, from);
  const FALL = 340;
  const land1 = tL + FALL;
  const land2 = tR + FALL;
  const th1 = (m: number) => (m < land1 ? 0 : spring(0, B.tilt1, (m - land1) / 1000));
  const theta = ms < land2 ? th1(ms) : spring(th1(land2), B.tilt2, (ms - land2) / 1000);
  const appear = k(tKick - 200, 500); // beam + fulcrum rise in with the kicker
  const drop = (t: number) => { const q = clamp01((ms - t) / FALL); return { q, y: lerp(-700, 0, EASE_IN(q)) }; };
  const dl = drop(tL);
  const dr = drop(tR);
  const blockTop = -B.beamH / 2 - B.block.h;
  if (ms < tKick - 300) return null;
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <div style={{ position: "absolute", left: B.kicker.x, top: B.kicker.top, ...label(INK_SUB, B.kicker.size) }}>
        {ms >= tKick - 40 ? <Letters text={kicker.label} t={tKick} stagger={18} rise={30} /> : null}
      </div>
      <div style={{ position: "absolute", inset: 0, opacity: clamp01(appear * 3), transform: `translateY(${(1 - EASE(appear)) * 120}px)` }}>
        {/* the fulcrum */}
        <svg style={{ position: "absolute", left: B.pivot.x - B.fulcrum.w / 2, top: B.pivot.y, overflow: "visible" }} width={B.fulcrum.w} height={B.fulcrum.h}>
          <polygon points={`${B.fulcrum.w / 2},0 ${B.fulcrum.w},${B.fulcrum.h} 0,${B.fulcrum.h}`} fill={WH} />
        </svg>
        {/* the beam + what sits on it, rotating about the pivot */}
        <div style={{ position: "absolute", left: B.pivot.x, top: B.pivot.y, width: 0, height: 0, transform: `rotate(${theta}deg)` }}>
          <div style={{ position: "absolute", left: -B.beamL / 2, top: -B.beamH / 2, width: B.beamL, height: B.beamH, borderRadius: B.beamH, background: WH }} />
          {dl.q > 0 ? (
            <div style={{ position: "absolute", left: -B.arm - B.block.w / 2, top: blockTop + dl.y, width: B.block.w, height: B.block.h, borderRadius: 16, background: WH,
              display: "flex", alignItems: "center", justifyContent: "center", ...big(ink, B.block.size) }}>{left.label}</div>
          ) : null}
          {dr.q > 0 ? (
            <div style={{ position: "absolute", left: B.arm - B.block.w / 2, top: blockTop + dr.y, width: B.block.w, height: B.block.h, borderRadius: 16, border: `6px solid ${WH}`, boxSizing: "border-box",
              display: "flex", alignItems: "center", justifyContent: "center", ...big(WH, B.block.size) }}>{right.label}</div>
          ) : null}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// WatchOrder — §9, the white card. "Watch for these, in order" = a numbered list of
// plain-language cards (Nel, 2026-10-22), not a diagram. Two dated (solid date), the
// third with NO date (dashed). Then card 3 comes forward: §8's question appears inside
// it, still out of focus, and red focus brackets snap round it — the test is whether it
// gets specific. No prediction that it will.
// ══════════════════════════════════════════════════════════════════════════
export const WATCH = {
  title: { x: 160, top: 150, size: 64 },
  cards: { xs: [160, 700, 1240], top: 270, w: 520, h: 560, pad: 40, kicker: 36, head: 52, date: 40 },
  focus: { x: 520, top: 230, w: 880, h: 640 }, // card 3's seat when it comes forward (inner ~748 wide)
};

type WatchCard = { n: string; kicker: string; head: string; date?: string; word: string; dateWord?: string };

export const WatchOrder: React.FC<Win & {
  title: { text: string } & Cued;
  cards: WatchCard[]; // three; the one without a date gets the dashed "no date" box
  noDate: { label: string } & Cued;
  forward: Cued; // cards 1-2 dim, card 3 travels to the centre
  question: { text: string } & Cued; // blurred, inside card 3
  brackets: Cued; // "specifically": the focus brackets snap
}> = ({ from, to, title, cards, noDate, forward, question, brackets }) => {
  const ms = useMs();
  const k = useK();
  const ink = COLORS.ink;
  const sub = inkA(0.55);
  const W = WATCH;
  const C = W.cards;
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));
  const tTitle = at(title, from + 300, from);
  const tCards = cards.map((c, i) => at({ word: c.word }, tTitle + 1500 + i * 2500, from));
  const tDates = cards.map((c, i) => (c.dateWord ? at({ word: c.dateWord }, tCards[i] + 1200, from) : Infinity));
  const tNoDate = at(noDate, tCards[2] + 2500, from);
  const tFwd = at(forward, tNoDate + 1000, from);
  const tQ = Math.max(at(question, tFwd + 500, from), tFwd + 450);
  const tBr = at(brackets, tQ + 800, from);
  const fq = EASE_IO(k(tFwd, 640));
  const qq = k(tQ, 520);
  const bq = k(tBr, 360);
  if (ms < tTitle - 80) return null;
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <div style={{ position: "absolute", left: W.title.x, top: W.title.top, ...big(ink, W.title.size), opacity: 1 - fq }}>
        {ms >= tTitle - 40 ? <Letters text={title.text} t={tTitle} stagger={24} rise={50} /> : null}
      </div>
      {cards.map((c, i) => {
        const q = k(tCards[i], 520);
        if (q <= 0) return null;
        const last = i === cards.length - 1;
        // card 3's seat interpolates to the focus seat; the others dim and sink
        const x = last ? lerp(C.xs[i], W.focus.x, fq) : C.xs[i];
        const y = last ? lerp(C.top, W.focus.top, fq) : C.top + fq * 30;
        const w = last ? lerp(C.w, W.focus.w, fq) : C.w;
        const h = last ? lerp(C.h, W.focus.h, fq) : C.h;
        const o = last ? 1 : 1 - fq * 0.85;
        const dq = Number.isFinite(tDates[i]) ? k(tDates[i], 380) : 0; // the undated card has no date cue (interpolate rejects Infinity)
        const nq = last ? k(tNoDate, 380) : 0;
        const words = c.head.split(" ");
        const hs = cueSeq(words, tCards[i], tCards[i] + 6000).map((t, j) => t ?? tCards[i] + j * 200);
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y, width: w, height: h, boxSizing: "border-box", padding: C.pad, borderRadius: 26,
            border: `6px ${last ? "dashed" : "solid"} ${ink}`, opacity: clamp01(q * 4) * o, transform: `translateY(${(1 - BACK(q)) * 140}px)`, zIndex: last ? 2 : 1, background: COLORS.paper }}>
            {/* badge inline with its kicker (the same flex row, never a coordinate) */}
            <div style={{ display: "flex", alignItems: "baseline", gap: 16 }}>
              <span style={{ ...big(COLORS.accent, C.kicker + 6) }}>{c.n}</span>
              <span style={{ ...label(sub, C.kicker) }}>{c.kicker}</span>
            </div>
            <div style={{ marginTop: 26, display: "flex", flexWrap: "wrap", columnGap: "0.26em", ...big(ink, C.head), lineHeight: 1.1, whiteSpace: "normal" }}>
              {words.map((wd, j) => {
                const wq = clamp01((ms - hs[j]) / 260);
                return <span key={j} style={{ display: "inline-block", opacity: clamp01(wq * 3), transform: `translateY(${(1 - BACK(wq)) * 20}px)` }}>{wd}</span>;
              })}
            </div>
            <div style={{ marginTop: 30 }}>
              {c.date && dq > 0 ? (
                <span style={{ display: "inline-block", background: ink, color: COLORS.paper, borderRadius: 12, padding: "10px 26px", opacity: clamp01(dq * 4), transform: `scale(${lerp(1.6, 1, EASE(dq))})`, transformOrigin: "0 50%", ...big(COLORS.paper, C.date) }}>{c.date}</span>
              ) : null}
              {last && nq > 0 ? (
                <span style={{ display: "inline-block", border: `5px dashed ${inkA(0.5)}`, borderRadius: 12, padding: "8px 24px", opacity: clamp01(nq * 4), transform: `scale(${lerp(0.6, 1, BACK(nq))})`, transformOrigin: "0 50%", ...big(sub, C.date) }}>{noDate.label}</span>
              ) : null}
            </div>
            {/* §8's question, still out of focus, and the brackets that would put it in focus */}
            {last && qq > 0 ? (
              <div style={{ marginTop: 44, position: "relative", display: "inline-block", padding: "18px 26px" }}>
                {/* blurred until the VO speaks it: each word comes into focus on its own spoken frame */}
                <span style={{ display: "inline-flex", flexWrap: "wrap", columnGap: "0.26em", opacity: clamp01(qq * 3), ...big(ink, 46), whiteSpace: "normal", lineHeight: 1.1 }}>
                  {question.text.split(" ").map((wd, j, all) => {
                    const t = cueSeq(all, tBr, to)[j] ?? tBr + 600 + j * 250;
                    const sharp = EASE(clamp01((ms - t) / 300));
                    return <span key={j} style={{ display: "inline-block", filter: sharp < 1 ? `blur(${lerp(6, 0, sharp)}px)` : undefined }}>{wd}</span>;
                  })}
                </span>
                {bq > 0
                  ? [[0, 0], [1, 0], [0, 1], [1, 1]].map(([cx, cy], j) => (
                      <span key={j} style={{ position: "absolute", width: 40, height: 40, left: cx ? undefined : 0, right: cx ? 0 : undefined, top: cy ? undefined : 0, bottom: cy ? 0 : undefined,
                        borderColor: COLORS.accent, borderStyle: "solid", borderWidth: `${cy ? 0 : 7}px ${cx ? 7 : 0}px ${cy ? 7 : 0}px ${cx ? 0 : 7}px`,
                        opacity: clamp01(bq * 4), transform: `translate(${(cx ? 1 : -1) * (1 - EASE(bq)) * 60}px, ${(cy ? 1 : -1) * (1 - EASE(bq)) * 60}px)` }} />
                    ))
                  : null}
              </div>
            ) : null}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/** The kit's bar reveal, in ink (for the white card). */
const BarRevealInk: React.FC<{ t: number; children: React.ReactNode }> = ({ t, children }) => {
  const ms = useMs();
  const q = clamp01((ms - t) / 560);
  if (q <= 0) return null;
  const grow = EASE_IO(clamp01(q / 0.5));
  const shrink = EASE_IO(clamp01((q - 0.5) / 0.5));
  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      <span style={{ opacity: q >= 0.5 ? 1 : 0 }}>{children}</span>
      {q < 1 ? <span style={{ position: "absolute", top: "6%", bottom: "2%", left: `${shrink * 100}%`, width: `${(grow - shrink) * 100}%`, background: COLORS.ink }} /> : null}
    </span>
  );
};
