// ─────────────────────────────────────────────────────────────────────────
// KIT · fan — ScopeFan. Added on the BioIntel Pathos AI long-form, 2026-08-06.
//
// For a beat whose content is "ONE agreement covering N different areas". A chip
// row states that; this performs it — a single source node on the left throws a
// line out to each area as that area is NAMED, so the partnership visibly
// BRANCHES. The word in the VO is "broader", and breadth is a shape.
//
// Replaced a BulletChips row (kicker + headline + pills) that the operator
// rejected as flat: left-aligned text with a row of outlined pills is the most
// generic thing in the kit, and in 16:9 it left the right half of the frame
// empty. The fan uses the full landscape width by construction — that is the
// point of the layout.
//
// Landscape-first (a horizontal fan needs the width; portrait branches to a
// tighter spread), bg-aware, monochrome. Optional animated line-icon per area.
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import {
  CLAMP, clamp01, caps, COLORS, cue, DISPLAY, INK_SUB, TRACK, useMs, usePop,
} from "./core";
import { IconMotion } from "./blocks";
import { FORMAT } from "../style";

const V = FORMAT.key === "vertical";

type Win = { from: number; to: number };
type IconC = React.FC<{ size?: number; color?: string; sw?: number }>;

const useVis = (from: number, to: number, padIn = 360, padOut = 360) => {
  const ms = useMs();
  return clamp01(interpolate(ms, [from, from + padIn, to - padOut, to], [0, 1, 1, 0], CLAMP));
};

export const ScopeFan: React.FC<Win & {
  kicker?: string;
  /** the two parties the agreement is between — the single source of the fan */
  source: { top: string; bottom: string };
  sourceCue: string;
  sourceMs?: number;
  /** the areas it covers; each ray draws as its area is named */
  areas: { label: string; word: string; ms?: number; Icon?: IconC }[];
  bg?: "ink" | "paper";
}> = ({ from, to, kicker, source, sourceCue, sourceMs, areas, bg = "ink" }) => {
  const ms = useMs();
  const vis = useVis(from, to);
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const sub = bg === "ink" ? INK_SUB : COLORS.grayText;
  const hair = bg === "ink" ? "rgba(255,255,255,0.20)" : COLORS.border;

  const k = usePop(from + 200, { rise: 12 });
  const srcOn = sourceMs ?? cue(sourceCue, from + 700, from);
  const src = usePop(srcOn, { rise: 18 });

  // geometry — the fan spans the full content width, which is the whole reason
  // this layout exists rather than a left-aligned chip row.
  const W = V ? 900 : 1600;
  const SRC_COL = V ? 0 : 340; // right edge of the two-party label
  const NODE_X = V ? W / 2 : 380;
  // The destination column sits at 860, not 920: the area labels render `nowrap`,
  // and at the conservative ~0.6em/glyph display budget the longest one
  // ("Antibody-drug conjugates" + icon ≈ 613px) needs ~636px of runway. Verified
  // by arithmetic — a nowrap overflow is invisible until it clips the frame edge.
  const DEST_X = V ? W / 2 : 860;
  const ICON_X = V ? W / 2 : 898;
  const LABEL_X = V ? 0 : 964;
  const ROW_GAP = V ? 128 : 170;
  const H = ROW_GAP * (areas.length - 1) + 120;
  const CY = H / 2;
  const ys = areas.map((_, i) => CY + (i - (areas.length - 1) / 2) * ROW_GAP);

  // each ray draws on its own spoken word, clamped monotonic by construction
  let prev = srcOn;
  const onsets = areas.map((a) => {
    const t = Math.max(a.ms ?? cue(a.word, prev + 1400, from), prev + 300);
    prev = t;
    return t;
  });

  const draw = (onset: number, dur: number) =>
    clamp01(interpolate(ms, [onset, onset + dur], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) }));

  // the source pulses each time a ray leaves it, so it stays alive across the beat
  const lastOn = onsets.length ? onsets[onsets.length - 1] : srcOn;
  const pulse = onsets.reduce(
    (acc, o) => acc + clamp01(interpolate(ms, [o, o + 140, o + 520], [0, 1, 0], CLAMP)),
    0
  );
  const srcBreathe = 1 + 0.05 * Math.sin(Math.max(0, ms - srcOn) / 380) + pulse * 0.14;
  const spineH = clamp01(interpolate(ms, [srcOn, srcOn + 600], [0, 1], CLAMP));

  return (
    <AbsoluteFill style={{ opacity: vis, justifyContent: "center", alignItems: "center", padding: V ? "0 70px" : "0 160px" }}>
      <div style={{ width: W }}>
        {kicker ? <div style={{ ...k, marginBottom: V ? 24 : 30 }}><div style={caps(sub)}>{kicker}</div></div> : null}

        <div style={{ position: "relative", width: W, height: H }}>
          {/* the rays */}
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
            {areas.map((_, i) => (
              <line
                key={i}
                x1={NODE_X} y1={CY} x2={DEST_X} y2={ys[i]}
                stroke={fg} strokeWidth={3} strokeLinecap="round"
                pathLength={1}
                strokeDasharray={1}
                strokeDashoffset={1 - draw(onsets[i], 520)}
                opacity={0.55}
              />
            ))}
            {areas.map((_, i) => {
              const p = draw(onsets[i], 520);
              const land = clamp01((p - 0.75) / 0.25);
              return (
                <circle
                  key={`n${i}`}
                  cx={DEST_X} cy={ys[i]} r={9 + land * 2}
                  fill={fg} opacity={land}
                />
              );
            })}
            {/* the source node */}
            <circle
              cx={NODE_X} cy={CY} r={14}
              fill={fg}
              opacity={spineH}
              style={{ transformOrigin: `${NODE_X}px ${CY}px`, transform: `scale(${srcBreathe})` }}
            />
          </svg>

          {/* the two parties — the single thing all three rays come out of */}
          <div
            style={{
              ...src,
              position: "absolute", left: 0, top: CY - 62, width: SRC_COL,
              textAlign: V ? "center" : "right",
            }}
          >
            <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: V ? 34 : 42, letterSpacing: TRACK.headline, color: fg, lineHeight: 1.12 }}>
              {source.top}
            </div>
            <div style={{ fontFamily: DISPLAY, fontWeight: 500, fontSize: V ? 34 : 42, letterSpacing: TRACK.headline, color: sub, lineHeight: 1.12, marginTop: 4 }}>
              {source.bottom}
            </div>
            <div style={{ height: 2, width: `${spineH * 100}%`, background: hair, marginTop: 14, marginLeft: "auto" }} />
          </div>

          {/* the areas */}
          {areas.map((a, i) => {
            const p = draw(onsets[i], 520);
            const land = clamp01((p - 0.7) / 0.3);
            return (
              <div
                key={`l${i}`}
                style={{
                  position: "absolute", left: ICON_X, top: ys[i] - 26,
                  display: "flex", alignItems: "center", gap: 20,
                  opacity: land,
                  transform: `translateX(${interpolate(land, [0, 1], [-14, 0], CLAMP)}px)`,
                }}
              >
                {a.Icon ? <IconMotion Icon={a.Icon} onset={onsets[i] + 220} size={V ? 38 : 46} color={fg} breathe /> : null}
                <span
                  style={{
                    fontFamily: DISPLAY, fontWeight: 700, fontSize: V ? 30 : 38,
                    letterSpacing: TRACK.headline, color: fg, lineHeight: 1.1, whiteSpace: "nowrap",
                  }}
                >
                  {a.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};
