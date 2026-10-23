// ─────────────────────────────────────────────────────────────────────────
// KIT · why — WHY PAY FOR A TARGET. Added on the AstraZeneca x insitro HORIZONTAL
// long-form, 2026-10-22 (16:9; absolute 1920x1080 coordinates).
//
// Motion law (Nel, 2026-10-22): one mover at a time, each one big. Nothing loops.
//
// `WhyQuestion` (red): each word PUNCHES in out of a blur on its spoken frame; the
//   "?" drops in spinning (the hook's "?", called back).
// `BarrQuote` (black, over a scrim): the name flips in, the title bar-reveals, the
//   quote flows word by word on the VO; on "target" the word itself PUNCHES in red
//   (the one red). No icon on the word: a reticle on "target" was literal (Nel, 2026-10-22).
// `OneLabel` (white card): insitro's argument enacted. One "One diagnosis" tag slams
//   down; patient dots RAIN into one crowd under it; on "differs" the crowd SORTS
//   itself into four clusters, each taking a different shape; a dart arcs in and
//   hits ONE cluster (red) and "Hard to treat" stamps. Illustrative, not data: no
//   patient counts or subgroup sizes are drawn from any source.
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { CLAMP, clamp01, COLORS, cueSeq, INK_SUB, inkA, useMs } from "./core";
import { at, lerp, useK, type Cued, type Win } from "./elora";
import { big, label, stamp } from "./rona";
import { BarReveal, Dart, Letters } from "./hunt";

const EASE = Easing.out(Easing.cubic);
const EASE_IO = Easing.inOut(Easing.cubic);
const BACK = Easing.out(Easing.back(1.8));
const BOUNCE = Easing.out(Easing.bounce);

// ══════════════════════════════════════════════════════════════════════════
// WhyQuestion — red
// ══════════════════════════════════════════════════════════════════════════
export const WhyQuestion: React.FC<Win & { lines: { text: string; word?: string; ms?: number }[][]; mark: Cued; tops?: number[]; size?: number }> = ({
  from, to, lines, mark, tops = [300, 500], size = 170,
}) => {
  const ms = useMs();
  const k = useK();
  const WH = COLORS.paper;
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));
  let prev = from;
  const ts = lines.map((l) => l.map((w) => (prev = at(w, prev + 250, from, prev + 80))));
  const tMark = at(mark, prev + 250, from, prev + 120);
  const mq = k(tMark, 680);
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {lines.map((l, li) => (
        <div key={li} style={{ position: "absolute", left: 0, width: 1920, top: tops[li], display: "flex", justifyContent: "center", gap: size * 0.28, ...big(WH, size) }}>
          {l.map((w, wi) => {
            const q = k(ts[li][wi], 320);
            const last = li === lines.length - 1 && wi === l.length - 1;
            return (
              <span key={wi} style={{ display: "inline-flex", alignItems: "baseline" }}>
                <span style={{ display: "inline-block", opacity: clamp01(q * 4), transform: `scale(${lerp(3.2, 1, EASE(q))})`, filter: q < 1 ? `blur(${(1 - EASE(q)) * 20}px)` : undefined }}>{w.text}</span>
                {last ? (
                  <span style={{ display: "inline-block", perspective: 900, opacity: clamp01(mq * 6) }}>
                    <span style={{ display: "inline-block", transform: `translateY(${lerp(-520, 0, BOUNCE(mq))}px) rotateY(${lerp(540, 0, EASE(mq))}deg)` }}>?</span>
                  </span>
                ) : null}
              </span>
            );
          })}
        </div>
      ))}
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// BarrQuote — black, over a scrim
// ══════════════════════════════════════════════════════════════════════════
export const QUOTE = { name: { left: 160, top: 160, size: 92 }, title: { left: 166, top: 276, size: 40 }, lines: { left: 160, tops: [420, 512, 604] as const, size: 76 } };

export const BarrQuote: React.FC<Win & {
  name: { text: string } & Cued;
  title: { label: string } & Cued;
  quote: { lines: string[][]; start: Cued; lockIndex: [number, number] }; // the token the reticle locks onto
}> = ({ from, to, name, title, quote }) => {
  const ms = useMs();
  const k = useK();
  const WH = COLORS.paper;
  const RED = COLORS.accent;
  const Q = QUOTE;
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));

  const tName = at(name, from, from);
  const tTitle = at(title, tName + 700, from, tName + 300);
  const tStart = at(quote.start, tTitle + 2000, from, tTitle + 400);
  const flat = quote.lines.flat();
  const seq = cueSeq(flat, tStart - 20, to);
  const times: number[] = [];
  seq.forEach((t, i) => times.push(Math.max(t ?? (times[i - 1] ?? tStart) + 260, times[i - 1] ?? tStart)));
  const [li, wi] = quote.lockIndex;
  const lockFlat = quote.lines.slice(0, li).reduce((a, l) => a + l.length, 0) + wi;
  const tLock = times[lockFlat];

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <div style={{ position: "absolute", left: Q.name.left, top: Q.name.top, ...big(WH, Q.name.size) }}>
        {ms >= tName - 40 ? <Letters text={name.text} t={tName} stagger={30} mode="flip" /> : null}
      </div>
      <div style={{ position: "absolute", left: Q.title.left, top: Q.title.top, ...label(INK_SUB, Q.title.size) }}>
        <BarReveal t={tTitle} color={INK_SUB}>{title.label}</BarReveal>
      </div>
      {quote.lines.map((line, l) => {
        const base = quote.lines.slice(0, l).reduce((a, x) => a + x.length, 0);
        return (
          <div key={l} style={{ position: "absolute", left: Q.lines.left, top: Q.lines.tops[l], display: "flex", gap: Q.lines.size * 0.26, ...big(WH, Q.lines.size) }}>
            {line.map((w, i) => {
              const t = times[base + i];
              const q = clamp01((ms - t) / 130); // word reveals SNAP on the spoken frame
              const isLock = base + i === lockFlat;
              const punch = isLock ? k(tLock, 360) : 0; // the word itself punches in red (no icon on it, Nel 2026-10-22)
              return (
                <span key={i} style={{ position: "relative", display: "inline-block", opacity: q, color: isLock && punch > 0 ? RED : WH, transformOrigin: "30% 70%",
                  transform: `translateY(${(1 - q) * 8}px) scale(${isLock ? lerp(1.5, 1, BACK(punch)) : 1})` }}>
                  {w}
                </span>
              );
            })}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// OneLabel — one diagnosis, different biology (white card)
// ══════════════════════════════════════════════════════════════════════════
export const ONE = {
  kicker: { left: 110, top: 86, size: 40 },
  tag: { top: 168, size: 60 },
  crowd: { cx: 960, cy: 560, n: 6, gap: 52, r: 15 },
  clusters: { xs: [390, 770, 1150, 1530] as const, cy: 560, gap: 50 },
  caption: { top: 770, size: 44 },
  stampTop: 760,
};

const ShapeDot: React.FC<{ kind: number; x: number; y: number; r: number; color: string; s: number }> = ({ kind, x, y, r, color, s }) => {
  const R = r * s;
  if (kind === 1) return <rect x={x - R} y={y - R} width={R * 2} height={R * 2} rx={R * 0.2} fill={color} />;
  if (kind === 2) return <path d={`M ${x} ${y - R * 1.15} L ${x + R * 1.1} ${y + R * 0.85} L ${x - R * 1.1} ${y + R * 0.85} Z`} fill={color} />;
  if (kind === 3) return <path d={`M ${x} ${y - R * 1.25} L ${x + R * 1.1} ${y} L ${x} ${y + R * 1.25} L ${x - R * 1.1} ${y} Z`} fill={color} />;
  return <circle cx={x} cy={y} r={R} fill={color} />;
};

export const OneLabel: React.FC<Win & {
  kicker: { label: string } & Cued;
  tag: { label: string } & Cued; // slams down
  rain: Cued; // the patients rain in
  sort: Cued; // "differs": the crowd sorts into clusters
  caption: { label: string } & Cued;
  dart: Cued; // the dart arcs in and hits one cluster
  hard: { label: string } & Cued; // stamps (the caption retires)
  hit?: number; // which cluster the dart hits
}> = ({ from, to, kicker, tag, rain, sort, caption, dart, hard, hit = 1 }) => {
  const ms = useMs();
  const k = useK();
  const INK = COLORS.ink;
  const RED = COLORS.accent;
  const SUB = inkA(0.55);
  const O = ONE;
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));

  const tKick = at(kicker, from, from);
  const tTag = at(tag, tKick + 1200, from, tKick + 400);
  const tRain = at(rain, tTag + 900, from, tTag + 450);
  const tSort = at(sort, tRain + 1500, from, tRain + 1000);
  const tCap = at(caption, tSort + 750, from, tSort + 650);
  const tDart = at(dart, tCap + 900, from, tCap + 400);
  const tHard = at(hard, tDart + 700, from, tDart + 500);

  const tagQ = k(tTag, 700);
  const C = O.crowd;
  const N = C.n * C.n;
  const dartQ = EASE_IO(k(tDart, 620));
  const hitDone = dartQ >= 1;
  const cx = O.clusters.xs[hit];
  // the dart: an arc from top-left onto the hit cluster
  const p0 = { x: -120, y: 220 };
  const p2 = { x: cx - 48, y: O.clusters.cy - 40 };
  const p1 = { x: (p0.x + p2.x) / 2, y: 60 };
  const bz = (t: number) => ({ x: (1 - t) ** 2 * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x, y: (1 - t) ** 2 * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y });
  const tip = bz(dartQ);
  const prev = bz(Math.max(0, dartQ - 0.02));
  const ang = (Math.atan2(tip.y - prev.y, tip.x - prev.x) * 180) / Math.PI;

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <div style={{ position: "absolute", left: O.kicker.left, top: O.kicker.top, ...label(SUB, O.kicker.size) }}>
        <BarReveal t={tKick} color={SUB}>{kicker.label}</BarReveal>
      </div>
      {tagQ > 0 ? (
        <div style={{ position: "absolute", left: 0, width: 1920, top: O.tag.top, display: "flex", justifyContent: "center", transform: `translateY(${lerp(-480, 0, BOUNCE(tagQ))}px)` }}>
          <div style={{ padding: "16px 44px", borderRadius: 48, background: INK, ...big(COLORS.paper, O.tag.size) }}>{tag.label}</div>
        </div>
      ) : null}

      <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} width={1920} height={1080}>
        {Array.from({ length: N }, (_, i) => {
          const gx = C.cx + ((i % C.n) - (C.n - 1) / 2) * C.gap;
          const gy = C.cy + (Math.floor(i / C.n) - (C.n - 1) / 2) * C.gap;
          const rq = clamp01((ms - (tRain + ((i * 7) % N) * 24)) / 640);
          if (rq <= 0) return null;
          // the sort: each patient flies to its cluster in an arc, then takes the cluster's shape
          const c = i % 4;
          const slot = Math.floor(i / 4);
          const tx = O.clusters.xs[c] + ((slot % 3) - 1) * O.clusters.gap;
          const ty = O.clusters.cy + (Math.floor(slot / 3) - 1) * O.clusters.gap;
          const sq = clamp01((ms - (tSort + i * 11)) / 650);
          const se = EASE_IO(sq);
          const x = lerp(gx, tx, se);
          const y = lerp(gy + lerp(-640, 0, BOUNCE(rq)), ty, se) - Math.sin(Math.PI * sq) * 120;
          const arrived = sq >= 1;
          const pop = arrived ? BACK(clamp01((ms - (tSort + i * 11 + 650)) / 240)) : 1;
          const color = hitDone && c === hit ? RED : INK;
          return <ShapeDot key={i} kind={arrived ? c : 0} x={x} y={y} r={C.r} color={color} s={arrived ? lerp(0.5, 1, pop) : 1} />;
        })}
        {dartQ > 0 ? <Dart x={tip.x} y={tip.y} angle={ang} color={INK} scale={1.1} /> : null}
      </svg>

      <div style={{ position: "absolute", left: 0, width: 1920, top: O.caption.top, textAlign: "center", opacity: 1 - k(tHard - 120, 160), ...label(SUB, O.caption.size) }}>
        <BarReveal t={tCap} color={SUB}>{caption.label}</BarReveal>
      </div>
      {ms >= tHard - 40 ? (
        <div style={{ position: "absolute", left: 0, width: 1920, top: O.stampTop, textAlign: "center", ...big(INK, 72), ...stamp(k(tHard, 380), 3.4), filter: k(tHard, 380) < 1 ? `blur(${(1 - EASE(k(tHard, 380))) * 16}px)` : undefined }}>{hard.label}</div>
      ) : null}
    </AbsoluteFill>
  );
};
