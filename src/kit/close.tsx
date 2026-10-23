// ─────────────────────────────────────────────────────────────────────────
// KIT · close — the two closing-argument blocks of the BioIntel Pathos AI
// long-form (2026-08-06). Both are ENACTED: the section they live in is the
// thesis, and a thesis stated in type reads flatter than one performed.
//
//   • ValueTips — a BALANCE. Two options hang from a beam; as the verdict lands,
//     weight accumulates on one side and the beam TIPS. The line is literally
//     "where these companies now think the value actually sits", and a balance
//     is the one diagram that answers "where does the weight sit".
//
//   ⚠️ ModelSwap (below) was the FIRST attempt at that beat and the operator
//     rejected it as confusing. Two parallel A→B routes sharing the same source
//     name printed "AI-NATIVE" twice, which read as two different companies, and
//     the losing route's mid-line BREAK read as a rendering fault rather than a
//     meaning. Kept in the kit because the route shape is sound for a beat with
//     two GENUINELY different actors — but do not reach for it when both routes
//     start from the same one, and never convey "this stopped working" with a
//     gap in a line.
//
//   • BackOne  — candidates all equal, then an arriving marker LANDS on one.
//     Selection performed by an agent, not by a field evaporating (that shape
//     belongs to CrowdToScarce in §2). The candidate glyphs deliberately echo
//     the antibody from §2 and the marker is the one that crossed the pipeline
//     in §4 — the closer is built from the video's own vocabulary.
//
// Landscape-first, bg-aware, monochrome (weight + dim only).
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

// ── ModelSwap ─────────────────────────────────────────────────────────────
export const ModelSwap: React.FC<Win & {
  kicker?: string;
  /** the two routes, in the order the VO names them */
  routes: {
    source: string;
    verb: string;
    dest: string;
    word: string;
    ms?: number;
    /** true = the route that survives the verdict */
    win?: boolean;
  }[];
  /** when the verdict lands: the losing route breaks, the winner thickens */
  verdict: { label: string; cue: string; ms?: number };
  bg?: "ink" | "paper";
}> = ({ from, to, kicker, routes, verdict, bg = "ink" }) => {
  const ms = useMs();
  const vis = useVis(from, to);
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const sub = bg === "ink" ? INK_SUB : COLORS.grayText;
  const hair = bg === "ink" ? "rgba(255,255,255,0.20)" : COLORS.border;

  const k = usePop(from + 200, { rise: 12 });

  // clamped monotonic by construction
  let prev = from;
  const onsets = routes.map((r) => {
    const t = Math.max(r.ms ?? cue(r.word, prev + 1800, from), prev + 300);
    prev = t;
    return t;
  });
  const vOn = Math.max(verdict.ms ?? cue(verdict.cue, prev + 2200, from), prev + 600);
  const vg = usePop(vOn + 300, { rise: 12 });

  const draw = (onset: number, dur: number) =>
    clamp01(interpolate(ms, [onset, onset + dur], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) }));

  // geometry
  const W = V ? 900 : 1600;
  const SRC_W = V ? 0 : 250;
  const NODE_X = V ? 60 : 290;
  const LINE_X2 = V ? W - 60 : 860;
  const DEST_NODE = V ? W - 40 : 890;
  const DEST_X = V ? 0 : 930;
  const ROW_H = V ? 200 : 200;
  const H = ROW_H * routes.length;

  const resolve = draw(vOn, 700);

  return (
    <AbsoluteFill style={{ opacity: vis, justifyContent: "center", alignItems: "center", padding: V ? "0 60px" : "0 160px" }}>
      <div style={{ width: W }}>
        {kicker ? <div style={{ ...k, marginBottom: V ? 20 : 26 }}><div style={caps(sub)}>{kicker}</div></div> : null}

        <div style={{ position: "relative", width: W, height: H }}>
          {routes.map((r, i) => {
            const on = draw(onsets[i], 620);
            const cy = ROW_H * i + ROW_H / 2;
            // the loser's line BREAKS: a gap opens in the middle and it dims
            const lose = r.win ? 0 : resolve;
            const win = r.win ? resolve : 0;
            const alpha = on * (1 - lose * 0.68);
            const lineW = (LINE_X2 - NODE_X) * on;
            const gap = lose * 90;
            const thick = 3 + win * 4;
            return (
              <React.Fragment key={i}>
                <svg
                  width={W} height={ROW_H}
                  viewBox={`0 0 ${W} ${ROW_H}`}
                  style={{ position: "absolute", left: 0, top: ROW_H * i, overflow: "visible" }}
                >
                  {/* the route — one continuous line until the verdict splits it */}
                  <line
                    x1={NODE_X} y1={ROW_H / 2}
                    x2={NODE_X + Math.max(0, lineW / 2 - gap / 2)} y2={ROW_H / 2}
                    stroke={fg} strokeWidth={thick} strokeLinecap="round" opacity={alpha}
                  />
                  <line
                    x1={NODE_X + lineW / 2 + gap / 2} y1={ROW_H / 2}
                    x2={NODE_X + lineW} y2={ROW_H / 2}
                    stroke={fg} strokeWidth={thick} strokeLinecap="round" opacity={alpha}
                  />
                  {/* arrowhead */}
                  <path
                    d={`M ${NODE_X + lineW - 16} ${ROW_H / 2 - 11} L ${NODE_X + lineW} ${ROW_H / 2} L ${NODE_X + lineW - 16} ${ROW_H / 2 + 11}`}
                    stroke={fg} strokeWidth={thick} strokeLinecap="round" strokeLinejoin="round" fill="none"
                    opacity={alpha * clamp01((on - 0.8) / 0.2)}
                  />
                  <circle cx={NODE_X} cy={ROW_H / 2} r={10} fill={fg} opacity={alpha} />
                  <circle
                    cx={DEST_NODE} cy={ROW_H / 2} r={10 + win * 3}
                    fill={fg} opacity={alpha * clamp01((on - 0.85) / 0.15)}
                  />
                  {/* the winner gets a drawn rule under its destination */}
                  <line
                    x1={DEST_NODE - 14} y1={ROW_H / 2 + 40}
                    x2={DEST_NODE - 14 + win * (W - DEST_NODE - 20)} y2={ROW_H / 2 + 40}
                    stroke={fg} strokeWidth={3} opacity={win * 0.8}
                  />
                </svg>

                {/* source */}
                <div
                  style={{
                    position: "absolute", left: 0, top: cy - 26, width: SRC_W,
                    textAlign: V ? "center" : "right", opacity: alpha,
                    fontFamily: DISPLAY, fontWeight: 700, fontSize: V ? 30 : 38,
                    letterSpacing: TRACK.headline, color: fg, lineHeight: 1.1, whiteSpace: "nowrap",
                  }}
                >
                  {r.source}
                </div>
                {/* the verb rides the connector */}
                <div
                  style={{
                    position: "absolute", left: (NODE_X + LINE_X2) / 2, top: cy - 54,
                    transform: "translateX(-50%)", whiteSpace: "nowrap",
                    ...caps(r.win && resolve > 0 ? fg : sub, V ? 17 : 20),
                    opacity: alpha * clamp01((on - 0.5) / 0.5),
                  }}
                >
                  {r.verb}
                </div>
                {/* destination */}
                <div
                  style={{
                    position: "absolute", left: DEST_X, top: cy - 26,
                    opacity: alpha * clamp01((on - 0.7) / 0.3), whiteSpace: "nowrap",
                    fontFamily: DISPLAY, fontWeight: r.win && resolve > 0 ? 700 : 500,
                    fontSize: V ? 30 : 38, letterSpacing: TRACK.headline,
                    color: r.win && resolve > 0 ? fg : sub, lineHeight: 1.1,
                  }}
                >
                  {r.dest}
                </div>
              </React.Fragment>
            );
          })}
          {/* a hairline between the two routes, so they read as alternatives */}
          <div style={{ position: "absolute", left: 0, top: ROW_H, width: W, height: 2, background: hair, opacity: 0.5 }} />
        </div>

        <div style={{ ...vg, marginTop: V ? 26 : 32, textAlign: "center" }}>
          <div style={caps(fg, TYPE.labelSm)}>{verdict.label}</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── ValueTips ─────────────────────────────────────────────────────────────
// A balance beam on a pivot. Each option is named and hangs a weight; the beam
// stays LEVEL while both are live, then weight accumulates on one side and it
// TIPS. One object, one motion, no repeated labels, nothing that can be mistaken
// for a glitch.
export const ValueTips: React.FC<Win & {
  kicker?: string;
  /** left and right options, each named on its own spoken words */
  left: { label: string; word: string; ms?: number };
  right: { label: string; word: string; ms?: number };
  /** which side the beam tips toward */
  winner?: "left" | "right";
  /** when the weight lands and the beam tips */
  verdict: { label: string; cue: string; ms?: number };
  /** max tip in degrees */
  angle?: number;
  bg?: "ink" | "paper";
}> = ({ from, to, kicker, left, right, winner = "right", verdict, angle, bg = "ink" }) => {
  const ms = useMs();
  const vis = useVis(from, to);
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const sub = bg === "ink" ? INK_SUB : COLORS.grayText;
  const hair = bg === "ink" ? "rgba(255,255,255,0.20)" : COLORS.border;

  const k = usePop(from + 200, { rise: 12 });

  // clamped monotonic by construction
  const rOn = right.ms ?? cue(right.word, from + 800, from);
  const lOn = Math.max(left.ms ?? cue(left.word, rOn + 2200, from), rOn + 400);
  const vOn = Math.max(verdict.ms ?? cue(verdict.cue, lOn + 2400, from), lOn + 600);
  const vg = usePop(vOn + 700, { rise: 12 });

  const draw = (onset: number, dur: number) =>
    clamp01(interpolate(ms, [onset, onset + dur], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) }));

  const W = V ? 900 : 1600;
  const CX = W / 2;
  const PIVOT_Y = V ? 180 : 200;
  const BASE_Y = V ? 300 : 330;
  const ARM = V ? 300 : 480;
  const HANG = V ? 56 : 70;
  const PLATE = V ? 62 : 80;
  const H = V ? 420 : 480;

  const beamIn = draw(from + 400, 700);
  const rIn = draw(rOn, 520);
  const lIn = draw(lOn, 520);
  const settle = draw(vOn, 900);

  // the beam tips only once the extra weight has landed
  const dir = winner === "right" ? 1 : -1;
  const theta = ((angle ?? 9) * Math.PI) / 180 * settle * dir;
  const cos = Math.cos(theta);
  const sin = Math.sin(theta);
  const lx = CX - ARM * cos;
  const ly = PIVOT_Y - ARM * sin;
  const rx = CX + ARM * cos;
  const ry = PIVOT_Y + ARM * sin;

  // weights: one per option as it is named, then the winner gains two more
  const extra = [draw(vOn + 120, 400), draw(vOn + 340, 400)];
  const winX = winner === "right" ? rx : lx;
  const winY = winner === "right" ? ry : ly;

  const Weight: React.FC<{ x: number; y: number; i: number; on: number }> = ({ x, y, i, on }) => (
    <rect
      x={x - 15} y={y + HANG - 16 - i * 17} width={30} height={13}
      rx={2} fill={fg} opacity={on * 0.9}
      style={{ transformOrigin: `${x}px ${y + HANG}px`, transform: `scale(${0.7 + on * 0.3})` }}
    />
  );

  return (
    <AbsoluteFill style={{ opacity: vis, justifyContent: "center", alignItems: "center", padding: V ? "0 60px" : "0 160px" }}>
      <div style={{ width: W }}>
        {kicker ? <div style={{ ...k, marginBottom: V ? 16 : 20 }}><div style={caps(sub)}>{kicker}</div></div> : null}

        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
          {/* the stand */}
          <path
            d={`M ${CX} ${PIVOT_Y} L ${CX - 40} ${BASE_Y} L ${CX + 40} ${BASE_Y} Z`}
            fill="none" stroke={hair} strokeWidth={3} opacity={beamIn}
          />
          <line x1={CX - 70} y1={BASE_Y} x2={CX + 70} y2={BASE_Y} stroke={hair} strokeWidth={3} opacity={beamIn} />

          {/* the beam */}
          <line
            x1={CX - ARM * cos * beamIn} y1={PIVOT_Y - ARM * sin * beamIn}
            x2={CX + ARM * cos * beamIn} y2={PIVOT_Y + ARM * sin * beamIn}
            stroke={fg} strokeWidth={5} strokeLinecap="round" opacity={beamIn}
          />
          <circle cx={CX} cy={PIVOT_Y} r={9} fill={fg} opacity={beamIn} />

          {/* left pan */}
          <g opacity={lIn}>
            <line x1={lx} y1={ly} x2={lx} y2={ly + HANG} stroke={fg} strokeWidth={2.5} opacity={0.7} />
            <line x1={lx - PLATE} y1={ly + HANG} x2={lx + PLATE} y2={ly + HANG} stroke={fg} strokeWidth={4} strokeLinecap="round" />
            <Weight x={lx} y={ly} i={0} on={lIn} />
          </g>

          {/* right pan */}
          <g opacity={rIn}>
            <line x1={rx} y1={ry} x2={rx} y2={ry + HANG} stroke={fg} strokeWidth={2.5} opacity={0.7} />
            <line x1={rx - PLATE} y1={ry + HANG} x2={rx + PLATE} y2={ry + HANG} stroke={fg} strokeWidth={4} strokeLinecap="round" />
            <Weight x={rx} y={ry} i={0} on={rIn} />
          </g>

          {/* the weight that decides it */}
          <Weight x={winX} y={winY} i={1} on={extra[0]} />
          <Weight x={winX} y={winY} i={2} on={extra[1]} />
        </svg>

        {/* labels sit FIXED below, so they stay readable while the beam moves */}
        <div style={{ position: "relative", width: W, height: 40, marginTop: V ? 10 : 14 }}>
          <div
            style={{
              position: "absolute", left: CX - ARM, top: 0, transform: "translateX(-50%)",
              whiteSpace: "nowrap", ...caps(winner === "left" ? fg : sub, V ? 20 : 24),
              opacity: lIn * (winner === "left" ? 1 : 1 - settle * 0.5),
            }}
          >
            {left.label}
          </div>
          <div
            style={{
              position: "absolute", left: CX + ARM, top: 0, transform: "translateX(-50%)",
              whiteSpace: "nowrap", ...caps(winner === "right" ? fg : sub, V ? 20 : 24),
              opacity: rIn * (winner === "right" ? 1 : 1 - settle * 0.5),
              fontWeight: winner === "right" && settle > 0.5 ? 700 : 600,
            }}
          >
            {right.label}
          </div>
        </div>

        <div style={{ ...vg, marginTop: V ? 22 : 28, textAlign: "center" }}>
          <div style={caps(fg, TYPE.labelSm)}>{verdict.label}</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── BackOne ───────────────────────────────────────────────────────────────
export const BackOne: React.FC<Win & {
  kicker?: string;
  /** how many equal candidates sit on the row */
  count?: number;
  /** which one the capital lands on */
  pickIndex?: number;
  /** the negated act — appears, then is struck */
  negate: { label: string; cue: string; strikeCue: string; ms?: number; strikeMs?: number };
  /** the marker arrives and lands on the chosen candidate */
  chooseCue: string;
  chooseMs?: number;
  stamp: string;
  stampCue: string;
  stampMs?: number;
  size?: number;
  bg?: "ink" | "paper";
}> = ({
  from, to, kicker, count = 3, pickIndex, negate, chooseCue, chooseMs,
  stamp, stampCue, stampMs, size, bg = "ink",
}) => {
  const ms = useMs();
  const vis = useVis(from, to);
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const sub = bg === "ink" ? INK_SUB : COLORS.grayText;
  const hair = bg === "ink" ? "rgba(255,255,255,0.20)" : COLORS.border;

  const k = usePop(from + 200, { rise: 12 });

  // clamped monotonic by construction
  const negOn = negate.ms ?? cue(negate.cue, from + 500, from);
  const strikeOn = Math.max(negate.strikeMs ?? cue(negate.strikeCue, negOn + 900, from), negOn + 400);
  const chooseOn = Math.max(chooseMs ?? cue(chooseCue, strikeOn + 1300, from), strikeOn + 400);
  const stampOn = Math.max(stampMs ?? cue(stampCue, chooseOn + 1000, from), chooseOn + 500);

  const draw = (onset: number, dur: number) =>
    clamp01(interpolate(ms, [onset, onset + dur], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) }));

  const W = V ? 900 : 1600;
  const H = V ? 320 : 340;
  const BASE_Y = H - 40;
  const idx = pickIndex ?? Math.floor(count / 2);
  const step = W / (count + 1);
  const xs = Array.from({ length: count }).map((_, i) => step * (i + 1));

  const candIn = draw(from + 400, 700);
  const struck = draw(strikeOn, 380);
  // the marker travels in along the baseline and stops under the chosen one
  const travel = draw(chooseOn, 900);
  const markX = 60 + travel * (xs[idx] - 60);
  const lift = draw(chooseOn + 800, 520); // a short line draws up to the pick
  const chosen = draw(chooseOn + 900, 560);
  const st = useStamp(stampOn);
  const breathe = 1 + 0.05 * Math.sin(Math.max(0, ms - chooseOn) / 340);

  // one candidate glyph: the antibody Y from §2, reduced to its silhouette
  const Glyph: React.FC<{ x: number; on: number; bright: number }> = ({ x, on, bright }) => {
    const s = 1 + bright * 0.24;
    const col = fg;
    const op = on * (0.3 + bright * 0.7);
    return (
      <g opacity={op} style={{ transformOrigin: `${x}px ${BASE_Y - 70}px`, transform: `scale(${bright > 0.4 ? s * breathe : s})` }}>
        <line x1={x} y1={BASE_Y - 30} x2={x} y2={BASE_Y - 78} stroke={col} strokeWidth={6} strokeLinecap="round" />
        <line x1={x} y1={BASE_Y - 78} x2={x - 34} y2={BASE_Y - 112} stroke={col} strokeWidth={6} strokeLinecap="round" />
        <line x1={x} y1={BASE_Y - 78} x2={x + 34} y2={BASE_Y - 112} stroke={col} strokeWidth={6} strokeLinecap="round" />
        <circle cx={x - 34} cy={BASE_Y - 112} r={8} fill={col} />
        <circle cx={x + 34} cy={BASE_Y - 112} r={8} fill={col} />
      </g>
    );
  };

  return (
    <AbsoluteFill style={{ opacity: vis, justifyContent: "center", alignItems: "center", padding: V ? "0 60px" : "0 160px" }}>
      <div style={{ width: W }}>
        {kicker ? <div style={{ ...k, marginBottom: V ? 16 : 20 }}><div style={caps(sub)}>{kicker}</div></div> : null}

        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ overflow: "visible" }}>
          {xs.map((x, i) => (
            <Glyph key={i} x={x} on={candIn} bright={i === idx ? chosen : chosen * 0.1} />
          ))}
          {/* the baseline the marker travels along */}
          <line x1={40} y1={BASE_Y} x2={W - 40} y2={BASE_Y} stroke={hair} strokeWidth={2} opacity={candIn * 0.8} />
          {/* the short line up to the chosen candidate */}
          <line
            x1={xs[idx]} y1={BASE_Y} x2={xs[idx]} y2={BASE_Y - lift * 26}
            stroke={fg} strokeWidth={4} opacity={lift}
          />
          {/* the capital marker — the same solid dot that crossed the pipeline in §4 */}
          <circle cx={markX} cy={BASE_Y} r={13} fill={fg} opacity={travel > 0 ? 1 : 0} />
        </svg>

        {/* the negated act, struck as it is dismissed */}
        <div style={{ position: "relative", display: "inline-block", marginTop: V ? 14 : 18, opacity: draw(negOn, 400) * (1 - struck * 0.5) }}>
          <div style={caps(sub, TYPE.labelSm)}>{negate.label}</div>
          <div
            style={{
              position: "absolute", left: 0, top: "52%", height: 3,
              width: `${struck * 100}%`, background: sub, borderRadius: 2,
            }}
          />
        </div>

        <div style={{ ...st, marginTop: V ? 22 : 26 }}>
          <div
            style={{
              fontFamily: DISPLAY, fontWeight: 700, fontSize: size ?? (V ? 84 : 96),
              letterSpacing: TRACK.display, color: fg, lineHeight: 1,
            }}
          >
            {stamp}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};
