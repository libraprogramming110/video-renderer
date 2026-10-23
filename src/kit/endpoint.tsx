// ─────────────────────────────────────────────────────────────────────────
// KIT · endpoint — EndpointSwitch
//
// A SECTION-LENGTH SPINE for the single most common tell in clinical-trial
// news: a readout reported against an endpoint the sponsor did not register.
//
// The whole argument is SPATIAL — a result arrived, and it landed in the wrong
// box. Two cards side by side state that; one diagram where the live arrow bends
// away from the registered target and the expected path stays dashed and empty
// PERFORMS it. (The 2026-08-06 lesson: four labelled rows is a table, the same
// four facts arriving as one object is a mechanism.)
//
// Built to be held across TWO sections — it assembles while the VO explains what
// happened (§2), then is INTERROGATED as the VO delivers the verdict (§3): the
// board dims under the market's judgment, the RESULT is struck ("not the data"),
// and the bend ignites ("the switch"). That 14-second hold is the thing a
// long-form cut can do that a 4-second-a-beat reel cannot.
//
// ⚠️ REVEAL ORDER FOLLOWS THE VOICE, NOT THE LOGIC. The registered endpoint is
// the logical parent, but scripts name the *deviation* first ("a different
// endpoint … than the one they pre-registered"). So `switched` draws before
// `registered`. Listing them logically leaves an empty reserved box hovering for
// two seconds — the exact VerdictLedger bug from 2026-08-06.
//
// Portrait-first, bg-aware, monochrome — weight + dim only, no colour, no ✗/✓.
// Added BioIntel BioVie endpoint-switch long-form, 2026-08-07.
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { CLAMP, clamp01, caps, cue, SANS, useMs, useStamp, INK_SUB } from "./core";
import { COLORS, DISPLAY, TRACK, FORMAT, TYPE } from "../style";

const V = FORMAT.key === "vertical";

const useVis = (from: number, to: number, padIn = 360, padOut = 360) => {
  const ms = useMs();
  return clamp01(interpolate(ms, [from, from + padIn, to - padOut, to], [0, 1, 1, 0], CLAMP));
};

type Win = { from: number; to: number };
type Node = { label: string; word: string };

// ── geometry (vertical). Verified by arithmetic, not by eye. ───────────────
const G = V
  ? { kickerY: 300, resY: 372, resW: 660, resH: 150, svgY: 522, svgH: 590,
      slotY: 1112, slotW: 470, slotH: 226, gap: 40, brY: 1392, label: 36, resLabel: 48 }
  : { kickerY: 190, resY: 236, resW: 560, resH: 128, svgY: 364, svgH: 360,
      slotY: 724, slotW: 420, slotH: 190, gap: 36, brY: 934, label: 30, resLabel: 40 };

const CX = V ? 540 : 960; //                       frame centre
const leftCX = CX - (G.slotW + G.gap) / 2; //      centre of the registered slot
const rightCX = CX + (G.slotW + G.gap) / 2; //     centre of the switched slot

// The §5 callback. Deliberately shares leftCX/rightCX/slotW with EndpointSwitch
// so the two boxes land in the SAME seats they occupied during the spine — the
// rule is delivered on the picture the argument was built on, which costs
// nothing and ties the piece together ("build the closer out of the video's own
// vocabulary", block-kit.md 2026-08-06).
const G5 = V
  ? { kickerY: 620, slotY: 920, verdictY: 1186, verdict: 24 }
  : { kickerY: 300, slotY: 470, verdictY: 690, verdict: 21 };

export const OnlyOneCounts: React.FC<Win & {
  kicker: string;
  /** the endpoint that decides — lights */
  counts: { label: string; tag: string; verdict: string };
  /** the endpoint that does not — recedes */
  discounted: { label: string; verdict: string };
  cues: { light: string; verdict: string; dim: string; discountVerdict: string };
  bg?: "ink" | "paper";
}> = ({ from, to, kicker, counts, discounted, cues, bg = "paper" }) => {
  const ms = useMs();
  const vis = useVis(from, to);
  const light = bg === "paper";
  const fg = light ? COLORS.ink : COLORS.paper;
  const dim = light ? COLORS.grayText : INK_SUB;
  const hair = light ? COLORS.border : "rgba(255,255,255,0.22)";

  const lightMs = cue(cues.light, from, from);
  const verdictMs = cue(cues.verdict, lightMs + 2400, from);
  const dimMs = cue(cues.dim, verdictMs + 900, from);
  const discMs = cue(cues.discountVerdict, dimMs + 1200, from);

  const inOp = clamp01(interpolate(ms, [from + 200, from + 700], [0, 1], CLAMP));
  const lit = clamp01(interpolate(ms, [lightMs, lightMs + 420], [0, 1], CLAMP));
  const recede = clamp01(interpolate(ms, [dimMs, dimMs + 520], [0, 1], CLAMP));
  const vSt = useStamp(verdictMs);
  const dSt = useStamp(discMs);

  const box = (cx: number, label: string, strength: number, solid: boolean, tag?: string) => (
    <div
      style={{
        position: "absolute", top: G5.slotY, left: cx - G.slotW / 2,
        width: G.slotW, height: G.slotH,
        border: `${solid ? 3 : 2}px ${solid ? "solid" : "dashed"} ${solid ? fg : hair}`,
        borderRadius: 6, opacity: strength,
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
        padding: "0 24px", boxSizing: "border-box", gap: 14,
      }}
    >
      {tag ? (
        <div style={{ ...caps(dim, TYPE.labelSm), border: `1.5px solid ${hair}`, borderRadius: 4, padding: "5px 12px" }}>{tag}</div>
      ) : null}
      <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: G.label, letterSpacing: TRACK.headline, color: solid ? fg : dim, lineHeight: 1.18, textAlign: "center" }}>
        {label}
      </div>
    </div>
  );

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <div style={{ position: "absolute", top: G5.kickerY, width: "100%", textAlign: "center", opacity: inOp }}>
        <div style={caps(dim, TYPE.labelSm)}>{kicker}</div>
      </div>

      {/* the one that decides — was the dashed, empty box during the spine */}
      {box(leftCX, counts.label, Math.max(inOp * 0.45, lit), lit > 0.5, counts.tag)}
      {/* the one the readout actually used — was solid during the spine, recedes now */}
      {box(rightCX, discounted.label, inOp * interpolate(recede, [0, 1], [1, 0.34], CLAMP), recede < 0.5)}

      <div style={{ position: "absolute", top: G5.verdictY, left: leftCX - G.slotW / 2, width: G.slotW, textAlign: "center" }}>
        <div style={{ ...vSt }}>
          <div style={{ width: 48, height: 2, background: fg, margin: "0 auto 14px" }} />
          <div style={caps(fg, G5.verdict)}>{counts.verdict}</div>
        </div>
      </div>
      <div style={{ position: "absolute", top: G5.verdictY, left: rightCX - G.slotW / 2, width: G.slotW, textAlign: "center" }}>
        <div style={{ ...dSt }}>
          <div style={{ width: 48, height: 2, background: hair, margin: "0 auto 14px" }} />
          <div style={caps(dim, G5.verdict)}>{discounted.verdict}</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

export const EndpointSwitch: React.FC<Win & {
  kicker: string;
  /** the readout that arrived, e.g. "Positive outcome" */
  result: Node;
  /** the endpoint actually reported against — drawn FIRST (spoken first) */
  switched: Node;
  /** the endpoint on file with the regulator — drawn SECOND */
  registered: Node & { tag: string };
  /** caps label on the never-taken path */
  expectedLabel?: string;
  /** §3 interrogation cues — all optional, so §2 can render the block alone */
  punishCue?: string;
  strikeCue?: string;
  igniteCue?: string;
  /** caps stamp that lands on the bend when it ignites */
  switchLabel?: string;
  bg?: "ink" | "paper";
}> = ({
  from, to, kicker, result, switched, registered,
  expectedLabel = "Expected", punishCue, strikeCue, igniteCue, switchLabel, bg = "paper",
}) => {
  const ms = useMs();
  const vis = useVis(from, to);
  const light = bg === "paper";
  const fg = light ? COLORS.ink : COLORS.paper;
  const dim = light ? COLORS.grayText : INK_SUB;
  const hair = light ? COLORS.border : "rgba(255,255,255,0.22)";

  // ── cues (afterMs = from, so nothing can match an earlier section) ────────
  const resMs = cue(result.word, from + 1600, from);
  const swMs = cue(switched.word, from + 3500, from);
  const regMs = cue(registered.word, from + 5500, from);
  const tagMs = cue(registered.tag, regMs + 400, from);
  const punishMs = punishCue ? cue(punishCue, to, from) : Infinity;
  const strikeMs = strikeCue ? cue(strikeCue, to, from) : Infinity;
  const igniteMs = igniteCue ? cue(igniteCue, to, from) : Infinity;

  // ── assembly ─────────────────────────────────────────────────────────────
  const resIn = clamp01(interpolate(ms, [resMs, resMs + 260], [0, 1], CLAMP));
  // The trunk drops straight out of the result as soon as the result exists, so
  // the ~1.9s the VO spends on "reported a positive outcome, but on…" is the
  // result COMMITTING to a direction, not a static box waiting for its next cue.
  const trunkDraw = clamp01(interpolate(ms, [resMs + 300, resMs + 820], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) }));
  // the live path then bends away toward the switched slot on its own word
  const liveDraw = clamp01(interpolate(ms, [swMs, swMs + 780], [0, 1], { ...CLAMP, easing: Easing.inOut(Easing.cubic) }));
  const swIn = clamp01(interpolate(ms, [swMs + 320, swMs + 620], [0, 1], CLAMP));
  const regIn = clamp01(interpolate(ms, [regMs, regMs + 300], [0, 1], CLAMP));
  // the expected path is drawn only once the registered box exists to receive it
  const expDraw = clamp01(interpolate(ms, [regMs + 240, regMs + 900], [0, 1], CLAMP));
  const tagIn = clamp01(interpolate(ms, [tagMs, tagMs + 260], [0, 1], CLAMP));

  // ── §3 interrogation ─────────────────────────────────────────────────────
  // the market's judgment falls over the whole board — everything steps back…
  const punish = clamp01(interpolate(ms, [punishMs, punishMs + 520], [0, 1], CLAMP));
  // …the DATA is struck (it was never the problem)…
  const strike = clamp01(interpolate(ms, [strikeMs, strikeMs + 420], [0, 1], CLAMP));
  // …and the bend — the switch — is the one thing that comes back bright.
  const ignite = clamp01(interpolate(ms, [igniteMs, igniteMs + 380], [0, 1], CLAMP));

  const board = interpolate(punish, [0, 1], [1, 0.42], CLAMP); // recessive under judgment
  const liveOp = Math.max(board, ignite); //                      the bend returns
  const liveW = interpolate(ignite, [0, 1], [3.4, 6], CLAMP);
  const swStamp = useStamp(igniteMs);

  // ── the paths (SVG-local coords; pathLength=1 so draw is a dash offset) ───
  const sx = CX, sy = 0;
  const trunk = G.svgH * 0.24;
  const endY = G.svgH - 16;
  const trunkPath = `M ${sx} ${sy} L ${sx} ${trunk}`;
  const livePath = `M ${sx} ${trunk} C ${sx} ${trunk + 190}, ${rightCX} ${endY - 210}, ${rightCX} ${endY}`;
  const expPath = `M ${sx} ${trunk} C ${sx} ${trunk + 190}, ${leftCX} ${endY - 210}, ${leftCX} ${endY}`;

  const slot = (
    cx: number, node: Node, op: number, live: boolean, tag?: string, tagOp = 0
  ) => (
    <div
      style={{
        position: "absolute",
        top: G.slotY,
        left: cx - G.slotW / 2,
        width: G.slotW,
        height: G.slotH,
        border: `${live ? 3 : 2}px ${live ? "solid" : "dashed"} ${live ? fg : hair}`,
        borderRadius: 6,
        opacity: op,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "0 24px",
        boxSizing: "border-box",
        gap: 14,
      }}
    >
      {tag ? (
        <div style={{ ...caps(dim, TYPE.labelSm), opacity: tagOp, border: `1.5px solid ${hair}`, borderRadius: 4, padding: "5px 12px" }}>
          {tag}
        </div>
      ) : null}
      <div
        style={{
          fontFamily: DISPLAY,
          fontWeight: 700,
          fontSize: G.label,
          letterSpacing: TRACK.headline,
          color: live ? fg : dim,
          lineHeight: 1.18,
          textAlign: "center",
        }}
      >
        {node.label}
      </div>
    </div>
  );

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <div style={{ position: "absolute", top: G.kickerY, width: "100%", textAlign: "center", opacity: resIn }}>
        <div style={caps(dim, TYPE.labelSm)}>{kicker}</div>
      </div>

      {/* the RESULT — what actually arrived */}
      <div
        style={{
          position: "absolute",
          top: G.resY,
          left: CX - G.resW / 2,
          width: G.resW,
          height: G.resH,
          border: `3px solid ${fg}`,
          borderRadius: 6,
          opacity: resIn * board,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: G.resLabel, letterSpacing: TRACK.headline, color: fg }}>
          {result.label}
        </div>
        {/* struck on "the data" — the result was never the problem */}
        <div
          style={{
            position: "absolute",
            left: 22,
            right: 22,
            top: "50%",
            height: 3,
            background: fg,
            transform: `scaleX(${strike})`,
            transformOrigin: "left center",
          }}
        />
      </div>

      {/* the two paths */}
      <div style={{ position: "absolute", top: G.svgY, left: 0, width: "100%" }}>
        <svg width={V ? 1080 : 1920} height={G.svgH}>
          {/* the path that was never taken — dashed, dim, and it stays that way */}
          <path
            d={expPath}
            pathLength={1}
            strokeDasharray="0.012 0.016"
            stroke={hair}
            strokeWidth={2.5}
            fill="none"
            opacity={expDraw * board}
          />
          {/* the trunk — the result commits to a direction */}
          <path
            d={trunkPath}
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - trunkDraw}
            stroke={fg}
            strokeWidth={liveW}
            fill="none"
            strokeLinecap="round"
            opacity={liveOp}
          />
          {/* the live path — bends away, then ignites */}
          <path
            d={livePath}
            pathLength={1}
            strokeDasharray={1}
            strokeDashoffset={1 - liveDraw}
            stroke={fg}
            strokeWidth={liveW}
            fill="none"
            strokeLinecap="round"
            opacity={liveOp}
          />
          <polygon
            points={`${rightCX - 11},${endY - 20} ${rightCX + 11},${endY - 20} ${rightCX},${endY + 2}`}
            fill={fg}
            opacity={liveDraw >= 0.98 ? liveOp : 0}
          />
          <text fontFamily={SANS}
            x={leftCX}
            y={endY - 26}
            textAnchor="middle"
            style={caps(dim, TYPE.labelSm)}
            fill={dim}
            opacity={expDraw * board}
          >
            {expectedLabel.toUpperCase()}
          </text>
        </svg>
      </div>

      {/* slots — switched draws FIRST (it is named first), registered second */}
      {slot(rightCX, switched, swIn * Math.max(board, ignite), true)}
      {slot(leftCX, registered, regIn * board, false, registered.tag, tagIn)}

      {/* the verdict stamp lands on the bend */}
      {switchLabel ? (
        <div style={{ position: "absolute", top: G.brY, width: "100%", textAlign: "center" }}>
          <div style={{ ...swStamp, display: "inline-block" }}>
            <div style={{ width: 64, height: 2, background: fg, margin: "0 auto 18px" }} />
            <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: V ? 62 : 52, letterSpacing: TRACK.headline, color: fg }}>
              {switchLabel}
            </div>
          </div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
