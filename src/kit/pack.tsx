// ─────────────────────────────────────────────────────────────────────────
// KIT · pack — two ENACTED beats, added on the BioIntel Pathos AI long-form
// (2026-08-06). Both replaced typeset blocks the operator rejected on sight.
//
//   • BreakFromPack  — a row of identical marks stands still and ONE leaves it.
//     Replaced a FringeFrontier (dim text + strike-through + stamp): over a
//     3-minute cut a strike reads as a caption effect, not an event. Here the
//     row of look-alikes IS "the same pitch", so no words have to claim it.
//
//   • UncappedFigure — a hero figure whose track REFUSES TO CLOSE. The solid bar
//     grows with the count-up (what is actually committed), then a dashed tail
//     marches on and fades out at the frame edge. "More than $2 billion" is a
//     floor, not a price — so the graphic never resolves. Replaced a
//     left-aligned CountUpHero that left half a 16:9 frame dead.
//
// Landscape-first with portrait branches, bg-aware, monochrome (weight + dim
// only — no glyph marks, no chart colour), per the BioIntel brand rule.
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import {
  CLAMP, clamp01, caps, COLORS, CountUp, cue, cueMs, cueSeq, DISPLAY, INK_SUB, TRACK, useMs, usePop, useStamp,
} from "./core";
import { FORMAT, TYPE } from "../style";

const V = FORMAT.key === "vertical";

type Win = { from: number; to: number };

const useVis = (from: number, to: number, padIn = 360, padOut = 360) => {
  const ms = useMs();
  return clamp01(interpolate(ms, [from, from + padIn, to - padOut, to], [0, 1, 1, 0], CLAMP));
};

// A per-word reveal must SNAP (~130ms), never soft-spring — a spring reads as the
// words LAGGING the voice once speech speeds up. (block-kit.md, 2026-07-11.)
const SNAP_MS = 130;
const SnapWord: React.FC<{ text: string; onsetMs: number; style: React.CSSProperties }> = ({ text, onsetMs, style }) => {
  const ms = useMs();
  const p = clamp01(interpolate(ms, [onsetMs, onsetMs + SNAP_MS], [0, 1], CLAMP));
  return (
    <span style={{ ...style, opacity: p, transform: `translateY(${interpolate(p, [0, 1], [16, 0], CLAMP)}px)`, display: "inline-block" }}>
      {text}
    </span>
  );
};

// ── BreakFromPack ─────────────────────────────────────────────────────────
export const BreakFromPack: React.FC<Win & {
  kicker?: string;
  /** how many identical marks sit in the row (the cohort all saying the same thing) */
  count?: number;
  /** which one breaks away (defaults to centre) */
  pickIndex?: number;
  /** the payoff that stamps under the row */
  label: string;
  /** caps label for the ones that stay put */
  packLabel?: string;
  pickCue: string;  // when the one is singled out and brightens
  breakCue: string; // when it leaves the line (the pivot)
  breakMs?: number; // explicit override — can LEAD the voice
  size?: number;
  bg?: "ink" | "paper";
}> = ({ from, to, kicker, count = 7, pickIndex, label, packLabel, pickCue, breakCue, breakMs, size, bg = "ink" }) => {
  const ms = useMs();
  const vis = useVis(from, to);
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const sub = bg === "ink" ? INK_SUB : COLORS.grayText;
  const hair = bg === "ink" ? "rgba(255,255,255,0.20)" : COLORS.border;

  const k = usePop(from + 220, { rise: 14 });
  const pickOn = cue(pickCue, from + 900, from);
  // clamped monotonic by construction, so no derived interpolate range can ever
  // run backwards however a cue resolves (the AstraZeneca × CSPC crash).
  const breakOn = Math.max(breakMs ?? cue(breakCue, pickOn + 1600, from), pickOn + 400);

  const R = V ? 15 : 18;
  const gap = V ? 108 : 132;
  const idx = pickIndex ?? Math.floor(count / 2);
  const rowW = gap * (count - 1);
  const rise = V ? 130 : 156;
  const boxH = rise + 120;

  // they arrive TOGETHER — being interchangeable is the whole point
  const rowIn = clamp01(interpolate(ms, [from + 420, from + 1100], [0, 1], CLAMP));
  const single = clamp01(interpolate(ms, [pickOn, pickOn + 380], [0, 1], CLAMP));
  const leave = clamp01(interpolate(ms, [breakOn, breakOn + 620], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) }));
  const packDim = interpolate(ms, [pickOn, pickOn + 520, breakOn, breakOn + 620], [0.5, 0.34, 0.34, 0.16], CLAMP);
  const breathe = 1 + 0.07 * Math.sin(Math.max(0, ms - breakOn) / 320);

  const stamp = useStamp(breakOn + 180);
  const barW = clamp01(interpolate(ms, [breakOn + 300, breakOn + 1150], [0, 1], CLAMP)) * (V ? 300 : 420);
  const pk = usePop(pickOn + 500, { rise: 10 });

  const dashV = `repeating-linear-gradient(180deg, ${sub} 0 9px, transparent 9px 18px)`;
  const big: React.CSSProperties = {
    fontFamily: DISPLAY, fontWeight: 700, fontSize: size ?? (V ? 118 : 138),
    letterSpacing: TRACK.display, lineHeight: 1, color: fg,
  };

  return (
    <AbsoluteFill style={{ opacity: vis, justifyContent: "center", alignItems: "center", textAlign: "center", padding: V ? "0 80px" : "0 160px" }}>
      {kicker ? <div style={{ ...k, marginBottom: V ? 34 : 40 }}><div style={caps(sub)}>{kicker}</div></div> : null}

      <div style={{ position: "relative", width: rowW + R * 2, height: boxH }}>
        {Array.from({ length: count }).map((_, i) => {
          const isPick = i === idx;
          const x = gap * i;
          const y = boxH - R * 2 - (isPick ? leave * rise : 0);
          const scale = isPick ? 1 + single * 0.16 + leave * 0.34 : 1;
          const op = rowIn * (isPick ? Math.max(0.5, 0.5 + single * 0.5) : packDim);
          return (
            <React.Fragment key={i}>
              {/* The trace it leaves behind, drawn as it travels. It must run UP
                  from the baseline to the node's new centre — anchoring it at the
                  baseline and giving it height made it grow DOWNWARD, straight
                  through the labels below (operator caught it at gate 1b). The
                  node's centre is `boxH - R - leave*rise`, so the trace starts
                  there and ends at the baseline. */}
              {isPick && leave > 0.01 ? (
                <div
                  style={{
                    position: "absolute", left: x + R - 1.5,
                    top: boxH - R - leave * rise,
                    width: 3, height: leave * rise, backgroundImage: dashV, opacity: 0.7,
                  }}
                />
              ) : null}
              <div
                style={{
                  position: "absolute", left: x, top: y,
                  width: R * 2, height: R * 2, borderRadius: R * 2,
                  background: isPick && single > 0 ? fg : "transparent",
                  border: `3px solid ${isPick && single > 0 ? fg : hair}`,
                  opacity: op,
                  transform: `scale(${isPick && leave > 0.6 ? scale * breathe : scale})`,
                }}
              />
            </React.Fragment>
          );
        })}
        {/* the baseline the rest never leave */}
        <div style={{ position: "absolute", left: -R, top: boxH - R, width: rowW + R * 2, height: 2, background: hair, opacity: rowIn * 0.8 }} />
      </div>

      {packLabel ? <div style={{ ...pk, marginTop: 18 }}><div style={caps(sub, TYPE.labelSm)}>{packLabel}</div></div> : null}
      <div style={{ ...stamp, marginTop: V ? 34 : 42 }}><div style={big}>{label}</div></div>
      <div style={{ height: 8, width: barW, background: fg, marginTop: 22, borderRadius: 4 }} />
    </AbsoluteFill>
  );
};

// ── UncappedFigure ────────────────────────────────────────────────────────
export const UncappedFigure: React.FC<Win & {
  kicker?: string;
  /** caps qualifier that lands on its OWN spoken words, above the figure ("MORE THAN") */
  prefixLabel?: string;
  prefixCue?: string;
  figure: { value: number; decimals: number; prefix?: string; suffix?: string; word: string; durationMs?: number };
  tag?: string;
  /** the payoff line under the track, flowed word-by-word on its spoken frames */
  line: string;
  lineCue: string;
  /** a contiguous phrase inside `line` held at full weight while the rest sits dim */
  emphasize?: string;
  figureSize?: number;
  bg?: "ink" | "paper";
}> = ({ from, to, kicker, prefixLabel, prefixCue, figure, tag, line, lineCue, emphasize, figureSize, bg = "ink" }) => {
  const ms = useMs();
  const vis = useVis(from, to);
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const sub = bg === "ink" ? INK_SUB : COLORS.grayText;

  const k = usePop(from + 220, { rise: 14 });
  const preOn = cue(prefixCue, from + 800, from);
  const figOn = Math.max(cue(figure.word, preOn + 700, from), preOn + 200);
  const figTo = figOn + (figure.durationMs ?? 1100);
  const lineOn = Math.max(cue(lineCue, figTo + 900, from), figTo + 200);

  const pre = usePop(preOn, { rise: 12 });
  const tg = usePop(figTo + 260, { rise: 10 });

  const trackW = V ? 900 : 1120;
  // the SOLID part grows with the count — what is actually committed…
  const solid = clamp01(interpolate(ms, [figOn, figTo], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) })) * (trackW * 0.52);
  // …then the track REFUSES TO END: a dashed tail marches on and fades out at the edge.
  const tailOp = clamp01(interpolate(ms, [figTo - 200, figTo + 520], [0, 1], CLAMP));
  const march = (ms / 24) % 34;
  const fade = "linear-gradient(90deg, #000 0%, #000 40%, transparent 100%)";

  const lineToks = line.split(/\s+/).filter(Boolean);
  const nrm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const emp = (emphasize ?? "").split(/\s+/).filter(Boolean).map(nrm);
  const lineNorm = lineToks.map(nrm);
  const empIdx = new Set<number>();
  if (emp.length) {
    for (let i = 0; i + emp.length <= lineNorm.length; i++) {
      if (emp.every((t, kk) => lineNorm[i + kk] === t)) {
        for (let kk = 0; kk < emp.length; kk++) empIdx.add(i + kk);
        break;
      }
    }
  }
  // word-index cursor (cueSeq) — an ms cursor skips tokens that share a startMs
  const lineOns = cueSeq(lineToks, lineOn, to).map((m) => m ?? lineOn);

  return (
    <AbsoluteFill style={{ opacity: vis, justifyContent: "center", alignItems: "center", textAlign: "center", padding: V ? "0 70px" : "0 150px" }}>
      {kicker ? <div style={{ ...k, marginBottom: V ? 20 : 24 }}><div style={caps(sub)}>{kicker}</div></div> : null}
      {prefixLabel ? <div style={{ ...pre, marginBottom: V ? 8 : 10 }}><div style={caps(sub)}>{prefixLabel}</div></div> : null}

      <CountUp
        fromMs={figOn}
        toMs={figTo}
        value={figure.value}
        decimals={figure.decimals}
        prefix={figure.prefix}
        suffix={figure.suffix}
        style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: figureSize ?? (V ? 250 : 300), letterSpacing: TRACK.display, color: fg, lineHeight: 1 }}
      />

      {/* the track that never closes */}
      <div style={{ position: "relative", width: trackW, height: 8, marginTop: V ? 26 : 30 }}>
        <div style={{ position: "absolute", left: 0, top: 0, height: 8, width: solid, background: fg, borderRadius: 4 }} />
        <div
          style={{
            position: "absolute", left: solid, top: 1, height: 6, width: trackW - solid,
            backgroundImage: `repeating-linear-gradient(90deg, ${fg} 0 18px, transparent 18px 34px)`,
            backgroundPositionX: `${march}px`,
            opacity: tailOp * 0.85,
            maskImage: fade,
            WebkitMaskImage: fade,
          }}
        />
      </div>

      {tag ? <div style={{ ...tg, marginTop: 18 }}><div style={caps(sub, TYPE.labelSm)}>{tag}</div></div> : null}

      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", maxWidth: trackW + 120, marginTop: V ? 40 : 48 }}>
        {lineToks.map((t, i) => (
          <SnapWord
            key={i}
            text={t}
            onsetMs={lineOns[i]}
            style={{
              fontFamily: DISPLAY,
              fontWeight: empIdx.has(i) ? 700 : 500,
              fontSize: V ? 46 : 54,
              letterSpacing: TRACK.headline,
              color: empIdx.has(i) ? fg : sub,
              lineHeight: 1.2,
              marginRight: "0.26em",
            }}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ── CrowdToScarce ─────────────────────────────────────────────────────────
// SHOW-DON'T-TELL for "the category is crowded, and this thing is rare in it".
// A dense cloud of overlapping rings builds (the competitive corner), then most
// of it EVAPORATES on the pivot, leaving a couple of outlines and one solid mark.
// Scarcity by SUBTRACTION — the field empties out.
//
// ⚠️ Deliberately NOT the same shape as BreakFromPack, which sits ~40s earlier in
// the same piece: that one is an ordered row on a baseline and ONE LEAVES it
// (differentiation). This is an unordered cloud that THINS (rarity). Same palette,
// different motion, different meaning — anti-repetition, principle 5.
//
// ⚠️ Also the reason this is not ContrastWeigh: that block animates the single
// heavy thing FIRST and the faint field second. The VO here names the crowded
// corner first and the scarce asset second, so ContrastWeigh would have fought
// the voice. (block-kit.md: check a block's built-in ORDER against the spoken one.)
//
// Positions are a deterministic hash of the index — NEVER Math.random(), which
// would re-roll every frame and boil.
export const CrowdToScarce: React.FC<Win & {
  kicker?: string;
  /** how many rings make up the crowd */
  count?: number;
  /** how many survive the thinning (the first one goes solid) */
  survivors?: number;
  /** caps label under the crowd, before and after the thinning */
  crowdLabel: string;
  scarceLabel: string;
  /** the payoff that stamps last */
  stamp: string;
  crowdCue: string;
  thinCue: string;
  stampCue: string;
  stampMs?: number;
  size?: number;
  bg?: "ink" | "paper";
}> = ({
  from, to, kicker, count = 46, survivors = 3, crowdLabel, scarceLabel, stamp,
  crowdCue, thinCue, stampCue, stampMs, size, bg = "ink",
}) => {
  const ms = useMs();
  const vis = useVis(from, to);
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const sub = bg === "ink" ? INK_SUB : COLORS.grayText;

  const k = usePop(from + 200, { rise: 12 });
  const crowdOn = cue(crowdCue, from + 500, from);
  const thinOn = Math.max(cue(thinCue, crowdOn + 3000, from), crowdOn + 800);
  const stampOn = Math.max(stampMs ?? cue(stampCue, thinOn + 2200, from), thinOn + 600);

  const st = useStamp(stampOn);
  const barW = clamp01(interpolate(ms, [stampOn + 260, stampOn + 1100], [0, 1], CLAMP)) * (V ? 300 : 420);

  const W = V ? 900 : 1080;
  const H = V ? 420 : 380;

  // deterministic pseudo-random — stable for every frame of every render
  const rnd = (i: number, salt: number) => {
    const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
    return x - Math.floor(x);
  };
  // the survivors are spread across the cloud, not clustered
  const keep = new Set(Array.from({ length: survivors }).map((_, s) => Math.floor(((s + 0.5) / survivors) * count)));

  const labelSwap = clamp01(interpolate(ms, [thinOn + 300, thinOn + 800], [0, 1], CLAMP));

  return (
    <AbsoluteFill style={{ opacity: vis, justifyContent: "center", alignItems: "center", textAlign: "center", padding: V ? "0 70px" : "0 150px" }}>
      {kicker ? <div style={{ ...k, marginBottom: V ? 24 : 28 }}><div style={caps(sub)}>{kicker}</div></div> : null}

      <div style={{ position: "relative", width: W, height: H }}>
        {Array.from({ length: count }).map((_, i) => {
          const r = 13 + rnd(i, 1) * 16;
          // an elliptical cloud, denser toward the middle
          const a = rnd(i, 2) * Math.PI * 2;
          const rad = Math.sqrt(rnd(i, 3));
          const cx = W / 2 + Math.cos(a) * rad * (W / 2 - r - 10);
          const cy = H / 2 + Math.sin(a) * rad * (H / 2 - r - 10);
          const inOn = clamp01(interpolate(ms, [crowdOn + rnd(i, 4) * 900, crowdOn + rnd(i, 4) * 900 + 320], [0, 1], CLAMP));
          const survives = keep.has(i);
          const isHero = i === Math.floor(0.5 / survivors * count);
          // the crowd evaporates; the survivors stay
          const out = survives ? 0 : clamp01(interpolate(ms, [thinOn + rnd(i, 5) * 700, thinOn + rnd(i, 5) * 700 + 420], [0, 1], CLAMP));
          const grow = survives ? clamp01(interpolate(ms, [thinOn + 400, thinOn + 1000], [0, 1], CLAMP)) : 0;
          const solid = isHero ? grow : 0;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                left: cx - r, top: cy - r,
                width: r * 2, height: r * 2, borderRadius: r * 2,
                border: `3px solid ${fg}`,
                background: solid > 0 ? fg : "transparent",
                opacity: inOn * (1 - out) * (survives ? 0.45 + grow * 0.55 : 0.34),
                transform: `scale(${1 + grow * (isHero ? 0.5 : 0.2)})`,
              }}
            />
          );
        })}
      </div>

      <div style={{ position: "relative", height: 34, marginTop: 8, width: "100%" }}>
        <div style={{ position: "absolute", inset: 0, opacity: 1 - labelSwap }}><div style={caps(sub, TYPE.labelSm)}>{crowdLabel}</div></div>
        <div style={{ position: "absolute", inset: 0, opacity: labelSwap }}><div style={caps(sub, TYPE.labelSm)}>{scarceLabel}</div></div>
      </div>

      <div style={{ ...st, marginTop: V ? 26 : 32 }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: size ?? (V ? 104 : 124), letterSpacing: TRACK.display, color: fg, lineHeight: 1 }}>
          {stamp}
        </div>
      </div>
      <div style={{ height: 8, width: barW, background: fg, marginTop: 20, borderRadius: 4 }} />
    </AbsoluteFill>
  );
};
