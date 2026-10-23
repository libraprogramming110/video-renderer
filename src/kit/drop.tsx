// ─────────────────────────────────────────────────────────────────────────
// KIT · drop — SessionDrop
//
// SHOW-DON'T-TELL for "this is how far it fell in one session."
//
// Why this exists: `HeroStat` / `CountUpHero` can COUNT 50 but they cannot show
// a DISTANCE, and the VO line here ("that's how far … dropped") is a statement
// about distance, not about a quantity. So the figure counts, then TRAVELS up to
// make room, and a price trace draws flat and CLIFFS to exactly half its own
// opening height on the spoken word "dropped". The 50% is legible as geometry —
// the close sits on the same y as the mid-line of the open — before it is read.
//
// The trace shape is QUALITATIVE (an intraday walk), with one exception: the
// cliff's end height is EXACTLY half the opening height, because that half IS
// the claim. No axis, no ticks, no invented prices — the script names one number
// and only that number appears. (Same discipline as PipelineSpend's unlabelled
// bars, block-kit.md 2026-08-06.)
//
// Portrait-first, bg-aware, monochrome — weight + dim only, no colour.
// Added BioIntel BioVie endpoint-switch long-form, 2026-08-07.
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { CLAMP, clamp01, caps, CountUp, cue, useMs, useStamp, INK_SUB } from "./core";
import { COLORS, DISPLAY, SANS, TRACK, FORMAT, TYPE } from "../style";

const V = FORMAT.key === "vertical";

const useVis = (from: number, to: number, padIn = 360, padOut = 360) => {
  const ms = useMs();
  return clamp01(interpolate(ms, [from, from + padIn, to - padOut, to], [0, 1, 1, 0], CLAMP));
};

type Win = { from: number; to: number };

// A deterministic pre-drop walk — small wobbles around the open, NEVER Math.random()
// (which re-rolls every frame and boils; block-kit.md 2026-08-06).
const WALK = [0, -6, 4, -2, 7, -4, 2, -8, 3, 0];

export const SessionDrop: React.FC<Win & {
  /** small caps label above the figure, e.g. "SINGLE SESSION" */
  kicker: string;
  /** the drop magnitude — also the geometry: the close lands at (1 - value/100) of the open */
  value: number;
  /** cue word for the figure count-up (the spoken figure, e.g. "50%") */
  word: string;
  /** the subject that stamps under the trace, e.g. "BioVie" */
  subject: string;
  /** cue word for the subject stamp */
  subjectCue: string;
  /** cue word on which the trace cliffs, e.g. "dropped" */
  dropCue: string;
  /** caps tag under the trace, e.g. "ONE TRADING SESSION" */
  tag?: string;
  tagCue?: string;
  /** ms the figure finishes travelling up to its docked position */
  dockMs: number;
  /** Position overrides. The landscape defaults put the trace at 430 and the
   *  subject at 860; with a  attached that stack ends at 990, which is
   *  ~60px inside the footer band. Every cue-driven onset already has an ms
   *  escape hatch — these are the same idea for the two hardcoded tops.
   *  (added ivonescimab long-form, 2026-08-22) */
  traceTop?: number;
  subjectTop?: number;
  bg?: "ink" | "paper";
}> = ({
  from, to, kicker, value, word, subject, subjectCue, dropCue, tag, tagCue, dockMs,
  traceTop, subjectTop, bg = "ink",
}) => {
  const ms = useMs();
  const vis = useVis(from, to);
  const light = bg === "paper";
  const fg = light ? COLORS.ink : COLORS.paper;
  const dim = light ? COLORS.grayText : INK_SUB;
  const hair = light ? COLORS.border : "rgba(255,255,255,0.22)";

  // ── cues (afterMs = from, so a cue can never match an earlier section) ──────
  const figureMs = cue(word, from, from);
  const cliffMs = cue(dropCue, from + 3600, from);
  const subjMs = cue(subjectCue, from + 3000, from);
  const tagMs = tagCue ? cue(tagCue, cliffMs + 900, from) : cliffMs + 900;

  // ── the travel: figure owns the frame, then docks up to make room ──────────
  // Not a cut and not a crossfade — one element moves (block-kit.md, "travel, don't cut").
  const dock = clamp01(interpolate(ms, [dockMs, dockMs + 620], [0, 1], { ...CLAMP, easing: Easing.inOut(Easing.cubic) }));
  const figureSize = interpolate(dock, [0, 1], [V ? 300 : 240, V ? 190 : 170], CLAMP);
  const figureTop = interpolate(dock, [0, 1], [V ? 760 : 400, V ? 360 : 190], CLAMP);

  // ── trace geometry ─────────────────────────────────────────────────────────
  const W = V ? 880 : 1180;
  const H = V ? 460 : 400;
  const padX = 40;
  // A real zero baseline, drawn — without it "half" is a claim, not something the
  // eye can check. Heights are measured from baseY, so closeY is EXACTLY
  // (1 - value/100) of the open's height. At value=50 the close lands on the
  // midpoint of the open, visibly.
  const baseY = H - 34;
  const openY = H * 0.2;
  const closeY = baseY - (baseY - openY) * (1 - value / 100);
  const flatEndX = padX + (W - padX * 2) * 0.52; // where the cliff begins
  const endX = W - padX;

  // flat walk → cliff. `d` is drawn progressively by draw/fall.
  const draw = clamp01(interpolate(ms, [dockMs + 160, cliffMs - 120], [0, 1], { ...CLAMP, easing: Easing.out(Easing.quad) }));
  const fall = clamp01(interpolate(ms, [cliffMs, cliffMs + 520], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) }));

  const flatPts = WALK.map((w, i) => {
    const t = i / (WALK.length - 1);
    return [padX + (flatEndX - padX) * t, openY + w];
  });
  const shownFlat = flatPts.filter((_, i) => i / (WALK.length - 1) <= draw);
  const lastFlat = shownFlat[shownFlat.length - 1] ?? flatPts[0];
  const cliffX = interpolate(fall, [0, 1], [flatEndX, endX], CLAMP);
  const cliffY = interpolate(fall, [0, 1], [openY, closeY], CLAMP);

  const d =
    `M ${flatPts[0][0]} ${flatPts[0][1]} ` +
    shownFlat.slice(1).map((p) => `L ${p[0]} ${p[1]}`).join(" ") +
    (draw >= 1 ? ` L ${flatEndX} ${openY} L ${cliffX} ${cliffY}` : ` L ${lastFlat[0]} ${lastFlat[1]}`);

  const subjSt = useStamp(subjMs);
  const tagOp = clamp01(interpolate(ms, [tagMs, tagMs + 300], [0, 1], CLAMP));
  // The half-line: the geometric proof. Draws with the cliff, holds after.
  const halfOp = clamp01(interpolate(ms, [cliffMs + 180, cliffMs + 620], [0, 1], CLAMP));

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {/* the figure — counts on its spoken frame, then travels up */}
      <div style={{ position: "absolute", top: figureTop - 54, width: "100%", textAlign: "center" }}>
        <div style={{ ...caps(dim, TYPE.labelSm), opacity: clamp01(interpolate(ms, [figureMs - 120, figureMs + 220], [0, 1], CLAMP)) }}>
          {kicker}
        </div>
      </div>
      <div style={{ position: "absolute", top: figureTop, width: "100%", display: "flex", justifyContent: "center", alignItems: "flex-start", gap: 14 }}>
        {/* the down chevron resolves with the cliff, not with the count — the
            direction is the trace's job, the figure only carries magnitude */}
        <svg width={V ? 54 : 46} height={V ? 54 : 46} viewBox="0 0 24 24" fill="none"
             style={{ marginTop: figureSize * 0.42, opacity: fall }}>
          <path d="M12 4 L12 19 M5 12.5 L12 20 L19 12.5" stroke={fg} strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <CountUp
          fromMs={figureMs}
          toMs={figureMs + 1150}
          value={value}
          decimals={0}
          suffix="%"
          style={{
            fontFamily: DISPLAY,
            fontWeight: 700,
            fontSize: figureSize,
            letterSpacing: TRACK.display,
            color: fg,
            lineHeight: 1,
          }}
        />
      </div>

      {/* the trace — opens flat, cliffs to exactly half on "dropped" */}
      <div style={{ position: "absolute", top: traceTop ?? (V ? 780 : 430), width: "100%", display: "flex", justifyContent: "center", opacity: dock }}>
        <svg width={W} height={H}>
          {/* the zero baseline — the reference that makes "half" checkable */}
          <line x1={padX} y1={baseY} x2={endX} y2={baseY} stroke={hair} strokeWidth={1.5} />
          {/* the open level, held as a hairline so the fall has a reference */}
          <line x1={padX} y1={openY} x2={endX} y2={openY} stroke={hair} strokeWidth={1.5} strokeDasharray="4 7" />
          {/* the geometric proof: the close sits on the half-line */}
          <line x1={padX} y1={closeY} x2={endX} y2={closeY} stroke={hair} strokeWidth={1.5} strokeDasharray="4 7" opacity={halfOp} />
          <path d={d} stroke={fg} strokeWidth={3.4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
          {/* the live tip */}
          <circle cx={draw >= 1 ? cliffX : lastFlat[0]} cy={draw >= 1 ? cliffY : lastFlat[1]} r={7} fill={fg} />
          <text x={padX} y={openY - 16} style={{ ...caps(dim, TYPE.labelSm), fontFamily: SANS }} fill={dim}>OPEN</text>
          <text x={padX} y={closeY + 32} style={{ ...caps(dim, TYPE.labelSm), fontFamily: SANS }} fill={dim} opacity={halfOp}>CLOSE</text>
        </svg>
      </div>

      {/* the subject stamps on its own spoken name */}
      <div style={{ position: "absolute", top: subjectTop ?? (V ? 1330 : 860), width: "100%", textAlign: "center" }}>
        <div style={{ ...subjSt, fontFamily: DISPLAY, fontWeight: 700, fontSize: V ? 78 : 64, letterSpacing: TRACK.headline, color: fg }}>
          {subject}
        </div>
        {tag ? (
          <div style={{ marginTop: 22, opacity: tagOp }}>
            <div style={{ width: 64, height: 2, background: hair, margin: "0 auto 18px" }} />
            <div style={caps(dim, TYPE.labelSm)}>{tag}</div>
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
