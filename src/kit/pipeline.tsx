// ─────────────────────────────────────────────────────────────────────────
// KIT · pipeline — PipelineSpend. THE SECOND SPINE of the BioIntel Pathos AI
// long-form (2026-08-06). One diagram, four beats, ~26 seconds.
//
//   1. the pipeline draws and the FRONT lights up   ("sold on speed at the front")
//   2. the front DIMS                               ("not where the capital burns")
//   3. cost bars SWELL at the late stages           ("the expensive failures happen late")
//   4. the asset's marker TRAVELS across the burn   ("has already survived that stretch")
//
// Why it earns 26 seconds: the claim is SPATIAL. "The money burns late, and
// Pathos bought past the burn" is a statement about where on a line something
// sits — and a line is the one thing four separate cards cannot show. The viewer
// holds a single mental object while the emphasis moves along it.
//
// Landscape by nature: a pipeline wants the full 1920 width. The portrait branch
// only narrows the margins. bg-aware, monochrome (weight + dim only).
//
// ⚠️ Bar heights are QUALITATIVE weights (0..1) and are NEVER labelled with
// figures. The VO says "years and hundreds of millions of dollars" and gives no
// per-stage number, so printing one would invent precision the script never
// claims. The shape carries the fact; the annotation quotes the VO.
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import {
  CLAMP, clamp01, caps, COLORS, cue, DISPLAY, INK_SUB, TRACK, useMs, usePop, useStamp,
} from "./core";
import { FORMAT, TYPE } from "../style";

const V = FORMAT.key === "vertical";

type Win = { from: number; to: number };

const useVis = (from: number, to: number, padIn = 360, padOut = 360) => {
  const ms = useMs();
  return clamp01(interpolate(ms, [from, from + padIn, to - padOut, to], [0, 1, 1, 0], CLAMP));
};

export const PipelineSpend: React.FC<Win & {
  kicker?: string;
  stages: string[];
  /** how many leading stages "the front of the pipeline" covers */
  frontCount?: number;
  /** qualitative cost weight per stage, 0..1 — shape only, never labelled */
  bars: number[];
  front: { label: string; cue: string; ms?: number };
  dim: { cue: string; ms?: number };
  burn: { label: string; cue: string; ms?: number };
  asset: { label: string; stamp: string; cue: string; ms?: number };
  bg?: "ink" | "paper";
}> = ({ from, to, kicker, stages, frontCount = 2, bars, front, dim, burn, asset, bg = "ink" }) => {
  const ms = useMs();
  const vis = useVis(from, to);
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const sub = bg === "ink" ? INK_SUB : COLORS.grayText;
  const hair = bg === "ink" ? "rgba(255,255,255,0.20)" : COLORS.border;

  const k = usePop(from + 200, { rise: 12 });

  // clamped monotonic by construction — the four phases can never run backwards,
  // however a cue resolves (the AstraZeneca × CSPC crash).
  const frontOn = front.ms ?? cue(front.cue, from + 800, from);
  const dimOn = Math.max(dim.ms ?? cue(dim.cue, frontOn + 6000, from), frontOn + 800);
  const burnOn = Math.max(burn.ms ?? cue(burn.cue, dimOn + 3500, from), dimOn + 600);
  const assetOn = Math.max(asset.ms ?? cue(asset.cue, burnOn + 7000, from), burnOn + 900);

  const draw = (onset: number, dur: number) =>
    clamp01(interpolate(ms, [onset, onset + dur], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) }));

  // ── geometry ──
  const W = V ? 900 : 1600;
  const MX = V ? 90 : 120;
  const AXIS_Y = 300;
  const BAR_MAX = V ? 210 : 260;
  const n = stages.length;
  const span = W - MX * 2;
  const step = span / Math.max(1, n - 1);
  const xs = stages.map((_, i) => MX + step * i);
  const barW = V ? 68 : 110;
  const BELOW = V ? 170 : 190;
  const H = AXIS_Y + BELOW;

  // 1 · the track draws in, then the front region lights
  const track = draw(from + 300, 900);
  const headX = MX + span * track;
  const frontLit = draw(frontOn, 620);
  // 2 · …and goes out again
  const frontOut = draw(dimOn, 560);
  const frontAlpha = frontLit * (1 - 0.86 * frontOut);
  // 3 · the late bars swell, staggered so the mass visibly moves right
  const burnP = (i: number) => draw(burnOn + i * 170, 760);
  // 4 · the asset crosses the burn zone and lands past it
  const travel = draw(assetOn, 1500);
  const assetX = MX + travel * span;
  const landed = clamp01(interpolate(ms, [assetOn + 1500, assetOn + 1800, assetOn + 2300], [0, 1, 0], CLAMP));
  const st = useStamp(assetOn + 1450);

  const frontX0 = xs[0];
  const frontX1 = xs[Math.min(frontCount - 1, n - 1)];
  const bk = usePop(burnOn + 500, { rise: 12 });

  return (
    <AbsoluteFill style={{ opacity: vis, justifyContent: "center", alignItems: "center", padding: V ? "0 60px" : "0 160px" }}>
      <div style={{ width: W }}>
        {kicker ? <div style={{ ...k, marginBottom: V ? 14 : 18 }}><div style={caps(sub)}>{kicker}</div></div> : null}

        <div style={{ position: "relative", width: W, height: H }}>
          <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
            {/* the cost bars — they grow UP from the axis, heaviest late */}
            {stages.map((_, i) => {
              const h = BAR_MAX * (bars[i] ?? 0) * burnP(i);
              // a bar the asset has already crossed steps back: it survived that stretch
              const crossed = travel > 0 && assetX > xs[i] + 6 ? 1 : 0;
              return (
                <rect
                  key={`b${i}`}
                  x={xs[i] - barW / 2}
                  y={AXIS_Y - h}
                  width={barW}
                  height={h}
                  fill={fg}
                  opacity={(0.16 + 0.3 * (bars[i] ?? 0)) * (1 - crossed * 0.45)}
                  rx={3}
                />
              );
            })}

            {/* the pipeline itself */}
            <line x1={MX} y1={AXIS_Y} x2={headX} y2={AXIS_Y} stroke={hair} strokeWidth={3} strokeLinecap="round" />
            {/* the FRONT — lit while it is being sold, then dimmed */}
            <line
              x1={frontX0}
              y1={AXIS_Y}
              x2={frontX0 + (frontX1 - frontX0) * frontLit}
              y2={AXIS_Y}
              stroke={fg}
              strokeWidth={7}
              strokeLinecap="round"
              opacity={frontAlpha}
            />

            {stages.map((_, i) => {
              const on = headX >= xs[i] - 2;
              return (
                <circle
                  key={`n${i}`}
                  cx={xs[i]}
                  cy={AXIS_Y}
                  r={7}
                  fill={on ? fg : "transparent"}
                  stroke={on ? fg : hair}
                  strokeWidth={3}
                  opacity={on ? 0.85 : 0.4}
                />
              );
            })}

            {/* the front bracket, below the axis */}
            <g opacity={frontAlpha}>
              <line x1={frontX0} y1={AXIS_Y + 92} x2={frontX1} y2={AXIS_Y + 92} stroke={fg} strokeWidth={2} />
              <line x1={frontX0} y1={AXIS_Y + 92} x2={frontX0} y2={AXIS_Y + 78} stroke={fg} strokeWidth={2} />
              <line x1={frontX1} y1={AXIS_Y + 92} x2={frontX1} y2={AXIS_Y + 78} stroke={fg} strokeWidth={2} />
            </g>

            {/* the asset's marker, travelling the axis */}
            <circle cx={assetX} cy={AXIS_Y} r={14 + landed * 4} fill={fg} opacity={travel > 0 ? 1 : 0} />
          </svg>

          {/* stage labels — HTML so the caps tracking matches the rest of the kit */}
          {stages.map((s, i) => (
            <div
              key={`s${i}`}
              style={{
                position: "absolute",
                left: xs[i],
                top: AXIS_Y + 26,
                transform: "translateX(-50%)",
                whiteSpace: "nowrap",
                ...caps(i < frontCount ? sub : fg, V ? 17 : 20),
                opacity: 0.4 + 0.6 * clamp01((headX - xs[i] + 20) / 40),
              }}
            >
              {s}
            </div>
          ))}

          {/* the front's own label, inside its bracket */}
          <div
            style={{
              position: "absolute",
              left: (frontX0 + frontX1) / 2,
              top: AXIS_Y + 104,
              transform: "translateX(-50%)",
              whiteSpace: "nowrap",
              ...caps(fg, TYPE.labelSm),
              opacity: frontAlpha,
            }}
          >
            {front.label}
          </div>

          {/* what the late stages actually consume — sits over the tall bars */}
          <div
            style={{
              ...bk,
              position: "absolute",
              right: 0,
              top: 0,
              whiteSpace: "nowrap",
              ...caps(fg, TYPE.labelSm),
            }}
          >
            {burn.label}
          </div>
        </div>

        {/* the payoff */}
        <div style={{ ...st, marginTop: V ? 20 : 24, textAlign: "center" }}>
          <div style={{ ...caps(sub, TYPE.labelSm), marginBottom: 10 }}>{asset.label}</div>
          <div
            style={{
              fontFamily: DISPLAY,
              fontWeight: 700,
              fontSize: V ? 84 : 104,
              letterSpacing: TRACK.display,
              color: fg,
              lineHeight: 1,
            }}
          >
            {asset.stamp}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
