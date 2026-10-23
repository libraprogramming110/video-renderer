// ─────────────────────────────────────────────────────────────────────────
// KIT · handoff — ControlHandoff: a beat-length spine for "X acted first, so
// control left Y's hands".
//
// One object holds the screen for the whole beat and passes through three
// movements without a single crossfade:
//   1. a CLAIMANT builds and lights (the party that actually moved)
//   2. the EXPECTED party appears and is struck in the same breath — it only
//      exists to be dismissed, so it arrives on "Not" and is crossed on its own
//      name rather than sitting on screen waiting to be wrong
//   3. the claimant TRAVELS down into a column, an item card appears in the
//      other column, and departs into the claimant's — control changing hands
//      as a physical move, not a fade
//
// Timing note worth keeping: the origin column is labelled at the moment the
// card is LEAVING it (its owner is named late in the sentence). Learning whose
// hands it was in exactly as it leaves them is better than pre-labelling an
// element before its cue.
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { CLAMP, clamp01, caps, COLORS, cue, DISPLAY, INK_SUB, inkA, SANS, TRACK, useMs, usePop } from "./core";
import { SignalPing } from "./blocks";
import { FORMAT, TYPE } from "../style";

const V = FORMAT.key === "vertical";
type Win = { from: number; to: number };

const W = FORMAT.width;
const COL_W = V ? 940 : 1300;
const X0 = (W - COL_W) / 2;

// hero (claimant filling the upper block) → docked (claimant as the right column)
const HERO = V
  ? { x: X0, y: 380, w: COL_W, h: 214, size: 62, pad: 30 }
  : { x: X0, y: 250, w: COL_W, h: 170, size: 54, pad: 26 };
const SLOT = V
  ? { y: 980, h: 320, w: 450, lx: X0, rx: W - X0 - 450, size: 34 }
  : { y: 620, h: 260, w: 600, lx: X0, rx: W - X0 - 600, size: 30 };
const REJ = V ? { y: 646, h: 148, size: 54 } : { y: 450, h: 120, size: 46 };

export const ControlHandoff: React.FC<Win & {
  signal: { label: string; cue: string };
  claimant: { lines: string[]; buildCues: string[]; litCue: string; litTag: string };
  rejected: { label: string; appearCue: string; strikeCue: string; note: string };
  handoff: {
    travelCue: string;
    toLabel: string;
    itemLabel: string;
    itemCue: string;
    departCue: string;
    fromLabel: string;
    fromLabelCue: string;
    landCue: string;
  };
  bg?: "ink" | "paper";
}> = ({ from, to, signal, claimant, rejected, handoff, bg = "paper" }) => {
  const ms = useMs();
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const sub = bg === "ink" ? INK_SUB : COLORS.grayText;
  const rule = bg === "ink" ? "rgba(255,255,255,0.24)" : COLORS.border;
  const ghost = bg === "ink" ? "rgba(255,255,255,0.28)" : inkA(0.24);
  const vis = clamp01(interpolate(ms, [from, from + 260, to + 150, to + 450], [0, 1, 1, 0], CLAMP));

  const sigOn = cue(signal.cue, from + 900, from);
  const litOn = cue(claimant.litCue, from + 5000, from);
  const rejOn = cue(rejected.appearCue, from + 6500, from);
  const strikeOn = cue(rejected.strikeCue, from + 7000, from);
  const travelOn = cue(handoff.travelCue, from + 8000, from);
  const itemOn = cue(handoff.itemCue, from + 10000, from);
  const departOn = cue(handoff.departCue, from + 11000, from);
  const fromLabOn = cue(handoff.fromLabelCue, from + 11500, from);
  const landOn = cue(handoff.landCue, from + 12000, from);

  const sig = usePop(sigOn, { rise: 14 });

  // ── movement 3: the claimant travels from hero block into the right column ──
  const t = clamp01(interpolate(ms, [travelOn, travelOn + 820], [0, 1], { ...CLAMP, easing: Easing.inOut(Easing.cubic) }));
  const cx = interpolate(t, [0, 1], [HERO.x, SLOT.rx]);
  const cy = interpolate(t, [0, 1], [HERO.y, SLOT.y]);
  const cw = interpolate(t, [0, 1], [HERO.w, SLOT.w]);
  const ch = interpolate(t, [0, 1], [HERO.h, SLOT.h]);
  const csize = interpolate(t, [0, 1], [HERO.size, SLOT.size]);
  const lit = clamp01(interpolate(ms, [litOn, litOn + 420], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) }));

  // the rejected party: appears, is struck ~one word later, then recedes as the
  // claimant leaves the upper block — it has done its only job
  const rejIn = clamp01(interpolate(ms, [rejOn, rejOn + 240], [0, 1], CLAMP));
  const struck = clamp01(interpolate(ms, [strikeOn, strikeOn + 300], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) }));
  const rejOut = clamp01(interpolate(ms, [travelOn, travelOn + 420], [1, 0], CLAMP));

  // ── the item that changes hands ──
  const slotIn = clamp01(interpolate(ms, [itemOn - 120, itemOn + 340], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) }));
  const move = clamp01(interpolate(ms, [departOn, landOn + 120], [0, 1], { ...CLAMP, easing: Easing.inOut(Easing.cubic) }));
  const itemW = V ? 380 : 480;
  const itemH = V ? 132 : 112;
  const itemY = SLOT.y + (V ? 120 : 100);
  const ix = interpolate(move, [0, 1], [SLOT.lx + (SLOT.w - itemW) / 2, SLOT.rx + (SLOT.w - itemW) / 2]);
  // a shallow arc so the move reads as a hand-off, not a slide
  const lift = Math.sin(move * Math.PI) * (V ? 46 : 34);
  const fromLab = usePop(fromLabOn, { rise: 10 });
  const landed = clamp01(interpolate(ms, [landOn, landOn + 380], [0, 1], CLAMP));

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {/* the signal marker */}
      <div style={{ position: "absolute", top: V ? 236 : 150, left: 0, right: 0, display: "flex", justifyContent: "center", alignItems: "center", gap: 20, ...sig }}>
        <SignalPing onset={sigOn} size={V ? 74 : 60} color={fg} />
        <div style={caps(fg)}>{signal.label}</div>
      </div>

      {/* the expected party — arrives only to be crossed out */}
      <div
        style={{
          position: "absolute",
          left: X0,
          top: REJ.y,
          width: COL_W,
          height: REJ.h,
          border: `2px dashed ${ghost}`,
          borderRadius: 6,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 22,
          opacity: rejIn * rejOut * interpolate(struck, [0, 1], [1, 0.4], CLAMP),
        }}
      >
        <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: REJ.size, letterSpacing: TRACK.display, color: fg }}>{rejected.label}</span>
        <span style={caps(sub, TYPE.labelSm)}>{rejected.note}</span>
        <div style={{ position: "absolute", left: 34, right: 34, top: "50%", height: 3, background: fg, transform: `scaleX(${struck})`, transformOrigin: "left center" }} />
      </div>

      {/* the origin column — labelled as the card is leaving it */}
      <div
        style={{
          position: "absolute",
          left: SLOT.lx,
          top: SLOT.y,
          width: SLOT.w,
          height: SLOT.h * slotIn,
          border: `2px dashed ${ghost}`,
          borderRadius: 6,
          opacity: slotIn,
        }}
      />
      <div style={{ position: "absolute", left: SLOT.lx, top: SLOT.y + (V ? 30 : 24), width: SLOT.w, textAlign: "center", ...fromLab }}>
        <div style={caps(sub, TYPE.labelSm)}>{handoff.fromLabel}</div>
      </div>

      {/* the claimant — hero, then the destination column */}
      <div
        style={{
          position: "absolute",
          left: cx,
          top: cy,
          width: cw,
          height: ch,
          border: `2px solid ${interpolate(lit, [0, 1], [0, 1], CLAMP) > 0.5 ? fg : ghost}`,
          background: bg === "ink" ? `rgba(255,255,255,${0.06 * lit})` : inkA(0.05 * lit),
          borderRadius: 6,
          padding: HERO.pad,
          boxSizing: "border-box",
        }}
      >
        {claimant.lines.map((ln, i) => (
          <ClaimantLine key={i} line={ln} onset={cue(claimant.buildCues[i], from + 1500 + i * 900, from)} size={csize} color={fg} />
        ))}
        <div style={{ opacity: lit * (1 - t), marginTop: 12 }}>
          <span style={caps(sub, TYPE.labelSm)}>{claimant.litTag}</span>
        </div>
        <div style={{ position: "absolute", left: 0, top: 0, width: 5, height: `${100 * lit}%`, background: fg, borderRadius: "6px 0 0 6px" }} />
        {/* the destination label only exists once this IS a column */}
        <div style={{ position: "absolute", left: 0, right: 0, bottom: V ? 26 : 20, textAlign: "center", opacity: t }}>
          <div style={caps(sub, TYPE.labelSm)}>{handoff.toLabel}</div>
        </div>
      </div>

      {/* the thing that changes hands */}
      <div
        style={{
          position: "absolute",
          left: ix,
          top: itemY - lift,
          width: itemW,
          height: itemH,
          border: `3px solid ${fg}`,
          background: bg === "ink" ? COLORS.ink : COLORS.paper,
          borderRadius: 6,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          textAlign: "center",
          padding: "0 18px",
          boxSizing: "border-box",
          opacity: slotIn,
          transform: `scale(${interpolate(landed, [0, 1], [1, 1.04], CLAMP)})`,
          boxShadow: `0 ${10 + lift * 0.5}px ${18 + lift}px rgba(0,0,0,${0.14 + 0.1 * (lift / 46)})`,
        }}
      >
        <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: V ? 34 : 30, letterSpacing: TRACK.headline, color: fg, lineHeight: 1.1 }}>
          {handoff.itemLabel}
        </span>
      </div>
    </AbsoluteFill>
  );
};

const ClaimantLine: React.FC<{ line: string; onset: number; size: number; color: string }> = ({ line, onset, size, color }) => {
  const p = usePop(onset, { rise: 18 });
  return (
    <div style={p}>
      <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: size, letterSpacing: TRACK.headline, color, lineHeight: 1.08 }}>{line}</div>
    </div>
  );
};
