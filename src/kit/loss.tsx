// ─────────────────────────────────────────────────────────────────────────
// KIT · loss — LossDepth: a magnitude expressed as DEPTH BELOW A BASELINE.
// (added BioIntel oral GLP-1 Q2 long-form, 2026-08-21)
//
// Built because a bar-lane layout reused for a SECOND metric read as the same
// scene twice, however much the numbers moved. The answer was not a new readout
// on the old shape — it was a new AXIS. Sales is a horizontal extent; weight
// loss is a vertical drop. Two facts stop looking alike the moment they stop
// sharing a direction, and "loss" is then ENACTED by the column going down
// rather than asserted by a label.
//
// ⚠️ NO time axis and NO interior detail. When a script names one endpoint per
// arm and no trajectory, drawing a curve between the start and the endpoint
// invents every point on it. A stated duration with no shape belongs in a caps
// note. Depth is strictly proportional to the stated figure, so the picture is a
// readout of the numbers and claims nothing beyond them.
//
// The gap is a vertical bracket between the two feet, pointed at by dashed
// leaders — the same measuring device as a horizontal gap span, rotated 90°. A
// rhyme, not a repeat: one grammar for "gap" across a piece whose sections look
// nothing like each other.
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { CLAMP, clamp01, caps, COLORS, cue, DISPLAY, INK_SUB, inkA, TRACK, useMs, usePop, useStamp } from "./core";
import { LEFT, TRACK_W } from "./oral";
import { FORMAT, TYPE } from "../style";

const V = FORMAT.key === "vertical";

const useVis = (from: number, to: number, padIn = 400, padOut = 400) => {
  const ms = useMs();
  return clamp01(interpolate(ms, [from, from + padIn, to - padOut, to], [0, 1, 1, 0], CLAMP));
};

export type LossArm = {
  name: string;
  nameCue?: string;
  nameMs?: number;
  sub?: string;
  /** the stated figure (drives depth) and the text printed at the column foot */
  value: number;
  text: string;
  dropCue?: string;
  dropMs?: number;
};

export const LossDepth: React.FC<{
  from: number;
  to: number;
  kicker?: string;
  label: string;
  labelCue?: string;
  labelMs?: number;
  note?: string;
  noteCue?: string;
  noteMs?: number;
  baseline: string;
  leader: LossArm;
  challenger: LossArm;
  gap?: { label: string; cue?: string; ms?: number };
  bg?: "ink" | "paper";
}> = ({
  from, to, kicker, label, labelCue, labelMs, note, noteCue, noteMs,
  baseline, leader, challenger, gap, bg = "paper",
}) => {
  const ms = useMs();
  const vis = useVis(from, to);
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const sub = bg === "ink" ? INK_SUB : COLORS.grayText;

  // onsets, clamped monotonic by construction so no interpolate range inverts
  const labelOn = labelMs ?? cue(labelCue, from + 200, from);
  const noteOn = Math.max(noteMs ?? cue(noteCue, labelOn + 600, from), labelOn + 200);
  const baseOn = noteOn;
  const lNameOn = Math.max(leader.nameMs ?? cue(leader.nameCue, baseOn + 700, from), baseOn + 200);
  const lDropOn = Math.max(leader.dropMs ?? cue(leader.dropCue, lNameOn + 900, from), lNameOn + 300);
  const cNameOn = Math.max(challenger.nameMs ?? cue(challenger.nameCue, lDropOn + 1800, from), lDropOn + 600);
  const cDropOn = Math.max(challenger.dropMs ?? cue(challenger.dropCue, cNameOn + 900, from), cNameOn + 300);
  // the bracket exists as soon as the challenger begins to fall — it IS the fall
  const gapOn = gap?.ms ?? cue(gap?.cue, cDropOn, from);

  // ── geometry: depth ∝ the stated figure, and nothing else
  const TRK = TRACK_W;
  const COL_W = V ? 150 : 120;
  const MAX_D = V ? 720 : 400;
  const maxV = Math.max(leader.value, challenger.value);
  const depthOf = (v: number) => MAX_D * (v / maxV);
  const cxL = V ? 250 : 420;
  const cxC = V ? 650 : 980;
  const BX = V ? 450 : 700; // the bracket sits between the two columns

  const drawP = (on: number) => clamp01(interpolate(ms, [on, on + 520], [0, 1], CLAMP));
  const dropP = (on: number) =>
    clamp01(interpolate(ms, [on, on + 720], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) }));

  const kickP = usePop(labelOn, { rise: 10 });
  const noteP = usePop(noteOn, { rise: 8 });
  const lHead = usePop(lNameOn, { rise: 16 });
  const cHead = usePop(cNameOn, { rise: 16 });
  const lFig = useStamp(lDropOn + 500, { from: 1.12 });
  const cFig = useStamp(cDropOn + 500, { from: 1.12 });

  const dLfull = depthOf(leader.value);
  const dCfull = depthOf(challenger.value);
  const dL = dLfull * dropP(lDropOn);
  const dC = dCfull * dropP(cDropOn);
  const gapP = drawP(gapOn);
  const dash = (col: string) => `repeating-linear-gradient(90deg, ${col} 0 10px, transparent 10px 18px)`;

  const arm = (a: LossArm, head: React.CSSProperties, fig: React.CSSProperties, x: number, d: number, solid: boolean) => (
    <>
      {/* identity sits ABOVE the baseline; only the drop belongs below it */}
      <div style={{ ...head, position: "absolute", left: x - TRK / 2, top: -(V ? 118 : 92), width: TRK, textAlign: "center" }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: V ? 44 : 40, letterSpacing: TRACK.headline, color: fg, lineHeight: 1 }}>
          {a.name}
        </div>
        {a.sub ? <div style={{ ...caps(sub, TYPE.labelSm), marginTop: 10 }}>{a.sub}</div> : null}
      </div>
      <div
        style={{
          position: "absolute",
          left: x - COL_W / 2,
          top: 0,
          width: COL_W,
          height: d,
          background: solid ? fg : bg === "ink" ? "rgba(255,255,255,0.42)" : inkA(0.34),
        }}
      />
      <div style={{ ...fig, position: "absolute", left: x - TRK / 2, top: d + (V ? 24 : 18), width: TRK, textAlign: "center" }}>
        <div
          style={{
            fontFamily: DISPLAY, fontWeight: 700, fontSize: V ? 66 : 54,
            letterSpacing: TRACK.display, color: fg, lineHeight: 1, fontVariantNumeric: "tabular-nums",
          }}
        >
          {a.text}
        </div>
      </div>
    </>
  );

  return (
    <AbsoluteFill style={{ opacity: vis, justifyContent: "center", alignItems: "flex-start", padding: `0 ${LEFT}px` }}>
      <div style={{ width: TRK }}>
        {kicker ? <div style={caps(sub)}>{kicker}</div> : null}
        <div style={{ ...kickP, marginTop: 18 }}>
          <div style={{ ...caps(fg), fontWeight: 700 }}>{label}</div>
        </div>
        {note ? (
          <div style={{ ...noteP, marginTop: 8 }}>
            <div style={caps(sub, TYPE.labelSm)}>{note}</div>
          </div>
        ) : null}

        <div style={{ height: V ? 210 : 150 }} />

        <div style={{ position: "relative", width: TRK, height: MAX_D + (V ? 120 : 90) }}>
          <div style={{ position: "absolute", left: 0, top: 0, width: TRK * drawP(baseOn), height: 3, background: fg }} />
          <div style={{ position: "absolute", left: 0, top: -(V ? 36 : 30), opacity: drawP(baseOn), ...caps(sub, TYPE.labelSm) }}>
            {baseline}
          </div>

          {arm(leader, lHead, lFig, cxL, dL, true)}
          {arm(challenger, cHead, cFig, cxC, dC, false)}

          {/* The bracket tracks the challenger's foot LIVE. It opens at full
              depth the instant that column starts to fall and CLOSES as the
              column descends, so the gap narrowing is performed in real time
              rather than stamped on afterwards. That also costs no extra
              screen-time: it finishes exactly when the column lands, which
              matters when the VO leaves only ~1.7s after the last figure. */}
          {gap ? (
            <div style={{ position: "absolute", inset: 0, opacity: gapP }}>
              <div style={{ position: "absolute", left: cxL + COL_W / 2, top: dLfull, width: BX - (cxL + COL_W / 2), height: 2, backgroundImage: dash(sub) }} />
              <div style={{ position: "absolute", left: BX, top: dC, width: cxC - COL_W / 2 - BX, height: 2, backgroundImage: dash(sub) }} />
              <div style={{ position: "absolute", left: BX, top: dC, width: 2, height: Math.max(0, dLfull - dC), background: fg }} />
              <div style={{ position: "absolute", left: BX - (V ? 14 : 11), top: dC, width: V ? 28 : 22, height: 2, background: fg }} />
              <div style={{ position: "absolute", left: BX - (V ? 14 : 11), top: dLfull, width: V ? 28 : 22, height: 2, background: fg }} />
              <div style={{ position: "absolute", left: BX + (V ? 30 : 24), top: (dC + dLfull) / 2 - (V ? 16 : 13), ...caps(fg) }}>
                {gap.label}
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </AbsoluteFill>
  );
};
