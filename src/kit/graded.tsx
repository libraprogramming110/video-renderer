// ─────────────────────────────────────────────────────────────────────────
// KIT · graded — UngradedPitch
//
// SHOW-DON'T-TELL for "the primary failed, so the story got rebuilt on numbers
// that nobody official will ever mark."
//
// The idea is a COLUMN THAT STAYS EMPTY. A ledger of new figures looks like
// progress until you notice the grade column beside it never fills — so the
// block draws that column, headers it, and then simply refuses to resolve it.
// The absence is the graphic (the same move as `AbsentFigure`, widened from one
// missing figure to a whole missing verdict column).
//
// ⚠️ The replacement bars carry NO FIGURES. The script says "numbers" and names
// none; printing invented magnitudes would claim precision the reporting does
// not have. They are qualitative weights, exactly like `PipelineSpend`'s bars.
//
// Portrait-first, bg-aware, monochrome — weight + dim only, no ✗/✓.
// Added BioIntel BioVie endpoint-switch long-form, 2026-08-07.
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { CLAMP, clamp01, caps, cue, useMs, useStamp, INK_SUB } from "./core";
import { COLORS, DISPLAY, TRACK, FORMAT, TYPE } from "../style";

const V = FORMAT.key === "vertical";

const useVis = (from: number, to: number, padIn = 360, padOut = 360) => {
  const ms = useMs();
  return clamp01(interpolate(ms, [from, from + padIn, to - padOut, to], [0, 1, 1, 0], CLAMP));
};

type Win = { from: number; to: number };

const G = V
  ? { kickerY: 292, priLabelY: 348, trackY: 432, trackX: 90, trackW: 900, trackH: 26,
      ruleY: 612, headY: 690, rowY: 772, rowGap: 112, barX: 90, barW: 620,
      slotX: 762, slotW: 228, slotH: 64, stampY: 1218, head: 19, label: 21 }
  : { kickerY: 190, priLabelY: 240, trackY: 306, trackX: 360, trackW: 1200, trackH: 22,
      ruleY: 432, headY: 492, rowY: 556, rowGap: 92, barX: 360, barW: 820,
      slotX: 1230, slotW: 300, slotH: 56, stampY: 860, head: 17, label: 19 };

export const UngradedPitch: React.FC<Win & {
  kicker: string;
  /** the endpoint that was actually registered and actually failed */
  primaryLabel: string;
  /** caps verdict that stamps on the primary when it fails */
  failLabel: string;
  /** how far the primary got before it failed, 0..1 — qualitative */
  failAt?: number;
  /** column headers for the rebuilt ledger */
  leftHead: string;
  rightHead: string;
  /** qualitative weights of the replacement numbers — NO figures are printed */
  weights?: number[];
  /** caps stamp naming the absence */
  stamp: string;
  cues: { draw: string; fail: string; rebuild: string; numbers: string; grade: string };
  bg?: "ink" | "paper";
}> = ({
  from, to, kicker, primaryLabel, failLabel, failAt = 0.58,
  leftHead, rightHead, weights = [0.74, 0.52, 0.63], stamp, cues, bg = "ink",
}) => {
  const ms = useMs();
  const vis = useVis(from, to);
  const light = bg === "paper";
  const fg = light ? COLORS.ink : COLORS.paper;
  const dim = light ? COLORS.grayText : INK_SUB;
  const hair = light ? COLORS.border : "rgba(255,255,255,0.22)";

  // ── cues (afterMs = from) ────────────────────────────────────────────────
  const drawMs = cue(cues.draw, from, from);
  const failMs = cue(cues.fail, drawMs + 1200, from);
  const rebuildMs = cue(cues.rebuild, failMs + 1600, from);
  const numMs = cue(cues.numbers, rebuildMs + 600, from);
  const gradeMs = cue(cues.grade, numMs + 1600, from);

  // ── the primary: advances, then stops dead ───────────────────────────────
  const advance = clamp01(interpolate(ms, [drawMs, failMs], [0, 1], { ...CLAMP, easing: Easing.out(Easing.quad) }));
  const fail = clamp01(interpolate(ms, [failMs, failMs + 420], [0, 1], CLAMP));
  const failSt = useStamp(failMs);
  const priIn = clamp01(interpolate(ms, [drawMs - 200, drawMs + 200], [0, 1], CLAMP));
  // once it fails the whole primary row goes recessive — it is no longer the story
  const priLevel = interpolate(fail, [0, 1], [1, 0.4], CLAMP);

  // ── the rebuilt ledger ───────────────────────────────────────────────────
  const rebuildIn = clamp01(interpolate(ms, [rebuildMs, rebuildMs + 360], [0, 1], CLAMP));
  const gradeIn = clamp01(interpolate(ms, [gradeMs, gradeMs + 360], [0, 1], CLAMP));
  const stampSt = useStamp(gradeMs + 120);

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <div style={{ position: "absolute", top: G.kickerY, width: "100%", textAlign: "center", opacity: priIn }}>
        <div style={caps(dim, TYPE.labelSm)}>{kicker}</div>
      </div>

      {/* ── the primary endpoint — the one that counted, and missed ───────── */}
      <div style={{ position: "absolute", top: G.priLabelY, left: G.trackX, width: G.trackW, opacity: priIn * priLevel, display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: V ? 44 : 40, letterSpacing: TRACK.headline, color: fg }}>
          {primaryLabel}
        </div>
        <div style={{ ...failSt, ...caps(fg, G.label), border: `2px solid ${fg}`, borderRadius: 4, padding: "6px 14px" }}>
          {failLabel}
        </div>
      </div>

      <div style={{ position: "absolute", top: G.trackY, left: G.trackX, width: G.trackW, height: G.trackH, opacity: priIn }}>
        {/* the track it was supposed to complete */}
        <div style={{ position: "absolute", inset: 0, border: `2px dashed ${hair}`, borderRadius: 4 }} />
        {/* how far it actually got — then it stops, and dims */}
        <div
          style={{
            position: "absolute", top: 0, left: 0, bottom: 0,
            width: `${advance * failAt * 100}%`,
            background: fg,
            opacity: priLevel,
            borderRadius: 3,
          }}
        />
        {/* struck where it died */}
        <div
          style={{
            position: "absolute", top: "50%", left: 0,
            width: `${failAt * 100}%`, height: 3, background: light ? COLORS.paper : COLORS.ink,
            opacity: fail * 0.9,
          }}
        />
      </div>

      <div style={{ position: "absolute", top: G.ruleY, left: G.trackX, width: G.trackW, height: 2, background: hair, opacity: rebuildIn }} />

      {/* ── the rebuilt pitch — new numbers, and a verdict column that never fills ── */}
      <div style={{ position: "absolute", top: G.headY, left: G.trackX, width: G.trackW, display: "flex", justifyContent: "space-between", opacity: rebuildIn }}>
        <div style={caps(dim, G.head)}>{leftHead}</div>
        <div style={caps(dim, G.head)}>{rightHead}</div>
      </div>

      {weights.map((w, i) => {
        const on = numMs + i * 260;
        const grow = clamp01(interpolate(ms, [on, on + 520], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) }));
        const y = G.rowY + i * G.rowGap;
        return (
          <React.Fragment key={i}>
            {/* a magnitude, deliberately unlabelled and unnumbered */}
            <div style={{ position: "absolute", top: y, left: G.barX, width: G.barW, height: G.slotH, display: "flex", alignItems: "center" }}>
              <div style={{ width: `${grow * w * 100}%`, height: 22, background: fg, opacity: 0.9, borderRadius: 3 }} />
            </div>
            {/* the grade slot — drawn, headed, and never resolved */}
            <div
              style={{
                position: "absolute", top: y, left: G.slotX, width: G.slotW, height: G.slotH,
                border: `2px dashed ${hair}`, borderRadius: 5, opacity: grow,
                display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              {/* the empty mark: a hairline where a grade would have been written */}
              <div style={{ width: 46, height: 2, background: hair, opacity: 0.5 + 0.5 * gradeIn }} />
            </div>
          </React.Fragment>
        );
      })}

      <div style={{ position: "absolute", top: G.stampY, width: "100%", textAlign: "center" }}>
        <div style={{ ...stampSt, display: "inline-block" }}>
          <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: V ? 58 : 48, letterSpacing: TRACK.headline, color: fg }}>
            {stamp}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
