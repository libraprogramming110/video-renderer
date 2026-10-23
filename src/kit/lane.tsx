// ─────────────────────────────────────────────────────────────────────────
// KIT · lane — EXCLUSIVITY FAILING. Added on the Roche / enicepatide
// long-form, 2026-09-23.
//
// For a line whose content is "X and Y no longer have this to themselves".
//
// Why not MoatBreach (2026-08-21): that block runs claim -> breach -> verdict,
// which assumes the VO states the claim and THEN dismantles it. This sentence
// does the opposite — "Novo and Lilly NO LONGER own this lane alone" negates
// before it names the claim — so a claim rendered on its own cue would appear
// after the denial it exists to set up. It also takes ONE incumbent; a lane
// held jointly by two is the whole point here.
//
// The enactment: the lane is ALWAYS as wide as it ends up. What changes is the
// CAP — a solid wall sealing the empty seat. The holders were never the size of
// the lane; their exclusivity was. On the breach cue the wall splits and clears,
// the empty seat outlines in, and the entrant travels in from off-frame and
// takes it. Nothing re-flows, so the two holders never move: the lane did not
// grow, it was opened.
//
// Vocabulary (2026-08-22): an occupied seat is a SOLID chip — a real, named
// occupant. The empty seat is an OUTLINE, meaning "unoccupied", never
// "unmeasured". No dashes anywhere; nothing here is unknown.
//
// Portrait-first, world-aware. In the red world the chips are white with red
// type (the carousels' pill device) and the one emphasis is white by default.
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, interpolate, Easing } from "remotion";
import {
  CLAMP, clamp01, COLORS, cue, DISPLAY, TRACK, useMs, usePop, useWorld,
} from "./core";
import { FORMAT } from "../style";

const V = FORMAT.key === "vertical";
const EASE = Easing.out(Easing.cubic);

type Win = { from: number; to: number };

const useVis = (from: number, to: number, padIn = 300, padOut = 360) => {
  const ms = useMs();
  return clamp01(interpolate(ms, [from, from + padIn, to - padOut, to], [0, 1, 1, 0], CLAMP));
};

type Occupant = { label: string; word?: string; ms?: number };

/** One seat. Own component so the pop hook is not called inside a .map. */
const Seat: React.FC<{
  label: string;
  onsetMs: number;
  x: number;
  w: number;
  h: number;
  fg: string;
  chipText: string;
  /** an entrant slides in from off-frame; a holder just stamps in place */
  travelFromX?: number;
  travelMs?: number;
  size: number;
}> = ({ label, onsetMs, x, w, h, fg, chipText, travelFromX, travelMs, size }) => {
  const ms = useMs();
  const pop = usePop(onsetMs, { rise: travelFromX == null ? 18 : 0, scale: travelFromX == null });
  // the entrant travels; its opacity is already up so the eye follows the MOVE
  const t = travelFromX == null ? 1 : EASE(clamp01(interpolate(ms, [onsetMs - (travelMs ?? 700), onsetMs], [0, 1], CLAMP)));
  const dx = travelFromX == null ? 0 : interpolate(t, [0, 1], [travelFromX - x, 0], CLAMP);
  const appear = travelFromX == null ? (pop.opacity as number) : clamp01(t * 6);
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: 0,
        width: w,
        height: h,
        borderRadius: 14,
        background: fg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: appear,
        transform: `translateX(${dx}px) ${travelFromX == null ? (pop.transform ?? "") : ""}`,
      }}
    >
      <div
        style={{
          fontFamily: DISPLAY,
          fontWeight: 700,
          fontSize: size,
          letterSpacing: TRACK.headline,
          color: chipText,
          lineHeight: 1,
        }}
      >
        {label}
      </div>
    </div>
  );
};

export const LaneShare: React.FC<Win & {
  /** already in the lane; each stamps on its own spoken name */
  holders: Occupant[];
  /** the one that gets in */
  entrant: Occupant;
  /** when the cap sealing the empty seat fails */
  breachCue?: string;
  breachMs?: number;
  /** a settle pulse once the lane is shared (usually the sentence's last word) */
  settleCue?: string;
  settleMs?: number;
  seatWidth?: number;
  seatHeight?: number;
  gap?: number;
  labelSize?: number;
}> = ({
  from, to, holders, entrant, breachCue, breachMs, settleCue, settleMs,
  seatWidth, seatHeight, gap, labelSize,
}) => {
  const ms = useMs();
  const vis = useVis(from, to);
  const world = useWorld();
  // fg = the thing drawn ON the ground; chipText = the ground showing through it
  const fg = world === "paper" ? COLORS.ink : COLORS.paper;
  const chipText = world === "red" ? COLORS.accent : world === "paper" ? COLORS.paper : COLORS.ink;

  const w = seatWidth ?? (V ? 250 : 300);
  const h = seatHeight ?? (V ? 130 : 150);
  const g = gap ?? (V ? 35 : 44);
  const size = labelSize ?? (V ? 48 : 54);
  const seats = holders.length + 1;
  const laneW = seats * w + (seats - 1) * g;

  const holderOns = holders.map((o, i) => o.ms ?? cue(o.word, from + 400 + i * 700, from));
  const breachOn = breachMs ?? cue(breachCue, (holderOns[holderOns.length - 1] ?? from) + 700, from);
  const entrantOn = entrant.ms ?? cue(entrant.word, breachOn + 1200, breachOn);
  const settleOn = settleMs ?? cue(settleCue, entrantOn + 400, entrantOn);

  // the rails that define the lane — drawn before anything occupies it
  const railP = EASE(clamp01(interpolate(ms, [from + 200, from + 900], [0, 1], CLAMP)));
  // the cap: a solid wall across the empty seat's gap. It SPLITS (halves driven
  // apart) rather than fading, so the barrier reads as broken, not switched off.
  const capP = clamp01(interpolate(ms, [breachOn, breachOn + 420], [0, 1], CLAMP));
  const capSplit = EASE(capP) * (h * 0.62);
  // the empty seat outlines in behind the failing cap
  const slotP = clamp01(interpolate(ms, [breachOn + 220, breachOn + 760], [0, 1], CLAMP));
  // settle: the rails brighten once the lane is shared
  const settleP = clamp01(interpolate(ms, [settleOn, settleOn + 420], [0, 1], CLAMP));

  const capX = holders.length * w + (holders.length - 1) * g; // start of the gap before the empty seat
  const rail = (top: number) => (
    <div
      style={{
        position: "absolute",
        left: 0,
        top,
        width: laneW * railP,
        height: 3,
        background: fg,
        opacity: 0.45 + 0.55 * settleP,
      }}
    />
  );

  return (
    <AbsoluteFill style={{ opacity: vis, justifyContent: "center", alignItems: "center" }}>
      <div style={{ position: "relative", width: laneW, height: h }}>
        {rail(-26)}
        {rail(h + 23)}

        {/* the empty seat — outline only, drawn as the cap fails */}
        <div
          style={{
            position: "absolute",
            left: capX + g,
            top: 0,
            width: w,
            height: h,
            borderRadius: 14,
            border: `3px solid ${fg}`,
            opacity: slotP * 0.55,
          }}
        />

        {holders.map((o, i) => (
          <Seat
            key={i}
            label={o.label}
            onsetMs={holderOns[i]}
            x={i * (w + g)}
            w={w}
            h={h}
            fg={fg}
            chipText={chipText}
            size={size}
          />
        ))}

        <Seat
          label={entrant.label}
          onsetMs={entrantOn}
          x={capX + g}
          w={w}
          h={h}
          fg={fg}
          chipText={chipText}
          travelFromX={laneW + 260}
          travelMs={700}
          size={size}
        />

        {/* the cap, drawn LAST so it covers the seat it is sealing until it fails */}
        <div style={{ position: "absolute", left: capX, top: 0, width: g, height: h, opacity: 1 - capP * 0.98 }}>
          <div style={{ position: "absolute", left: 0, top: 0, width: g, height: h / 2, background: fg, transform: `translateY(${-capSplit}px)` }} />
          <div style={{ position: "absolute", left: 0, top: h / 2, width: g, height: h / 2, background: fg, transform: `translateY(${capSplit}px)` }} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
