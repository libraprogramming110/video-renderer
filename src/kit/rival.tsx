// ─────────────────────────────────────────────────────────────────────────
// KIT · rival — A CHALLENGER BUILDING, AN INCUMBENT ALREADY AHEAD. Added on the
// Novartis × BoomRay long-form, 2026-09-26.
//
// For "Y acquired Z for $X… building a rival platform in the same modality X
// has led since <launch>". Two lanes, built in SPOKEN order — which here is
// challenger first, incumbent last:
//   1. the challenger's lane starts as a stub on its name;
//   2. the acquired company arrives as a chip and DOCKS into that lane,
//      extending it (an acquisition performed, not captioned);
//   3. the price counts while it is voiced;
//   4. "building… a rival platform" GROWS the lane;
//   5. "same modality" outlines the SECOND lane beneath it — the same kind of
//      track, still empty (an outline = unoccupied, not unknown; no dashes);
//   6. the incumbent's name lands and its lane fills FULL, longer than the
//      challenger's — "has led" enacted as position, never stated as a number;
//   7. "since <launch>" pins a tick at the lane's origin.
//
// Lane lengths are SCHEMATIC ORDER, not measured size: no scale, no axis, no
// figure on either bar. The only numbers are the ones the VO speaks.
//
// One emphasis: the challenger's lane (useAccent). The incumbent is white.
// Ink world only in practice (it sits over a FootageScrim); portrait-first.
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { CLAMP, clamp01, COLORS, CountUp, cue, DISPLAY, TRACK, useAccent, useInkSub, useMs, usePop, useStamp } from "./core";
import { TYPE } from "../style";

const EASE = Easing.out(Easing.cubic);
const prog = (ms: number, at: number, dur: number) => clamp01(interpolate(ms, [at, at + dur], [0, 1], { ...CLAMP, easing: EASE }));

const Pop: React.FC<{ at: number; style: React.CSSProperties; children: React.ReactNode; rise?: number }> = ({ at, style, children, rise = 16 }) => {
  const p = usePop(at, { rise });
  return <div style={{ position: "absolute", ...style, ...p }}>{children}</div>;
};

export const RivalLanes: React.FC<{
  from: number;
  to: number;
  kicker: { label: string; word: string };
  challenger: { label: string; word: string };
  acquired: { label: string; word: string };
  price: { value: number; decimals: number; prefix?: string; suffix?: string; word: string; endWord: string; tag: string; tagWord: string };
  build: { word: string; label: string; labelWord: string };
  modality: { label: string; word: string };
  incumbent: { label: string; word: string };
  origin: { label: string; word: string };
  /** lane lengths as fractions of the full lane (schematic order only) */
  lengths?: { stub: number; docked: number; built: number };
  top?: number;
}> = ({ from, to, kicker, challenger, acquired, price, build, modality, incumbent, origin, lengths = { stub: 0.12, docked: 0.34, built: 0.7 }, top = 330 }) => {
  const ms = useMs();
  const acc = useAccent();
  const sub = useInkSub();
  const fg = COLORS.paper;
  const vis = clamp01(interpolate(ms, [from, from + 300, to - 360, to], [0, 1, 1, 0], CLAMP));

  // cues, each scoped after the previous so repeats can't grab them
  const tK = cue(kicker.word, from + 300, from);
  const tC = cue(challenger.word, tK + 1000, from);
  const tA = cue(acquired.word, tC + 900, tC);
  const tP = cue(price.word, tA + 600, tA);
  const tPEnd = cue(price.endWord, tP + 1000, tP);
  const tTag = cue(price.tagWord, tPEnd + 600, tP);
  const tB = cue(build.word, tTag + 800, tTag);
  const tBL = cue(build.labelWord, tB + 1400, tB);
  const tM = cue(modality.word, tBL + 1000, tB);
  const tI = cue(incumbent.word, tM + 700, tM);
  const tO = cue(origin.word, tI + 1200, tI);

  // geometry
  const X0 = 90;
  const W = 900;
  const H = 96;
  const yName = top;
  const yPrice = top + 140;
  const yLaneA = top + 380;
  const yModal = top + 590;
  const yInc = top + 650;
  const yLaneB = top + 750;

  // the challenger lane: stub -> docked -> built
  const dock = prog(ms, tA, 550);
  const grow = prog(ms, tB, Math.max(900, tBL - tB + 700));
  const lenA =
    ms < tC ? 0 : lengths.stub * prog(ms, tC, 400) + (lengths.docked - lengths.stub) * dock + (lengths.built - lengths.docked) * grow;
  // the acquired chip travels in from the right edge and lands as the docked segment
  const chipX = interpolate(dock, [0, 1], [X0 + W - 150, X0 + W * lengths.stub], CLAMP);
  const chipW = W * (lengths.docked - lengths.stub);
  const chipOn = clamp01(interpolate(ms, [tA - 60, tA + 140], [0, 1], CLAMP));

  // the incumbent lane: outline on "same modality", fills on its name
  const outline = prog(ms, tM, 500);
  const fillB = prog(ms, tI, 800);
  const tick = prog(ms, tO, 300);
  const nameStamp = useStamp(tC);
  const incStamp = useStamp(tI);

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <Pop at={tK} style={{ left: X0, top: yName - 70 }}>
        <div style={{ ...labelStyle(sub) }}>{kicker.label}</div>
      </Pop>
      <div style={{ position: "absolute", left: X0, top: yName, transformOrigin: "left center", ...nameStamp }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 104, letterSpacing: TRACK.headline, color: fg, lineHeight: 1 }}>{challenger.label}</div>
      </div>

      <div style={{ position: "absolute", left: X0, top: yPrice, display: "flex", alignItems: "baseline", gap: 26 }}>
        <CountUp fromMs={tP} toMs={tPEnd + 300} value={price.value} decimals={price.decimals} prefix={price.prefix} suffix={price.suffix}
          style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 150, letterSpacing: TRACK.display, color: fg, lineHeight: 1 }} />
        <Pop at={tTag} rise={10} style={{ position: "relative" }}>
          <div style={{ ...labelStyle(sub) }}>{price.tag}</div>
        </Pop>
      </div>

      {/* lane A — the challenger */}
      <div style={{ position: "absolute", left: X0, top: yLaneA, width: W * lenA, height: H, background: acc }} />
      {chipOn > 0 && dock < 1 ? (
        <div style={{ position: "absolute", left: chipX, top: yLaneA, width: chipW, height: H, opacity: chipOn,
          border: `4px solid ${acc}`, boxSizing: "border-box" }} />
      ) : null}
      {chipOn > 0 ? (
        <div style={{ position: "absolute", left: chipX, top: yLaneA, width: chipW, height: H, display: "flex", alignItems: "center",
          justifyContent: "center", opacity: chipOn }}>
          <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 52, letterSpacing: TRACK.headline, color: fg }}>{acquired.label}</div>
        </div>
      ) : null}
      <Pop at={tBL} style={{ left: X0, top: yLaneA + H + 22 }}>
        <div style={{ ...labelStyle(fg) }}>{build.label}</div>
      </Pop>

      {/* lane B — the incumbent: outlined (unoccupied), then filled full */}
      <Pop at={tM} style={{ left: X0, top: yModal }}>
        <div style={{ ...labelStyle(sub, TYPE.labelSm) }}>{modality.label}</div>
      </Pop>
      <div style={{ position: "absolute", left: X0, top: yInc, transformOrigin: "left center", ...incStamp }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 72, letterSpacing: TRACK.headline, color: fg, lineHeight: 1 }}>{incumbent.label}</div>
      </div>
      <div style={{ position: "absolute", left: X0, top: yLaneB, width: W * outline, height: H, boxSizing: "border-box",
        border: outline > 0 ? `3px solid rgba(255,255,255,0.4)` : "none" }} />
      <div style={{ position: "absolute", left: X0, top: yLaneB, width: W * fillB, height: H, background: fg }} />
      {/* the origin tick + "since <launch>" */}
      <div style={{ position: "absolute", left: X0 - 3, top: yLaneB - 22, width: 6, height: (H + 44) * tick, background: fg }} />
      <Pop at={tO} style={{ left: X0, top: yLaneB + H + 30 }}>
        <div style={{ ...labelStyle(fg) }}>{origin.label}</div>
      </Pop>
    </AbsoluteFill>
  );
};

const labelStyle = (color: string, size = TYPE.label): React.CSSProperties => ({
  fontFamily: DISPLAY, fontWeight: 700, fontSize: size, letterSpacing: TRACK.nav, color, lineHeight: 1.1,
});
