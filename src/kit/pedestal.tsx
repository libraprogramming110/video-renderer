// ─────────────────────────────────────────────────────────────────────────
// KIT · pedestal — TrustPedestal: "something large rests on something small".
//
// The argument is CONCENTRATION RISK, so the layout states it structurally: a
// heavy slab carried by a handful of discrete points. The fragility is legible
// from the proportions alone before a word of the label is read.
//
// The rebuild is the honest part. The script says trust needs rebuilding but
// never says how much was lost, so nothing here breaks, vanishes, or counts:
// the nodes drop to OUTLINE (in question, not destroyed) and exactly one
// begins refilling at a crawl. The refill is deliberately still unfinished
// when the beat ends — an incomplete fill is how you say "takes years" without
// inventing a number. Do not "fix" it by letting it complete.
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { CLAMP, clamp01, caps, COLORS, cue, DISPLAY, INK_SUB, inkA, TRACK, useMs, usePop } from "./core";
import { FORMAT } from "../style";

const V = FORMAT.key === "vertical";
type Win = { from: number; to: number };

const W = FORMAT.width;
const G = V
  ? { slabW: 700, slabY: 306, slabH: 258, cy: 900, rx: 380, ry: 90, node: 15, label: 26, mass: 30, track: 600, trackY: 1210 }
  : { slabW: 620, slabY: 190, slabH: 190, cy: 620, rx: 330, ry: 74, node: 13, label: 22, mass: 26, track: 520, trackY: 830 };
const CX = W / 2;

const Node: React.FC<{
  cx: number;
  cy: number;
  r: number;
  onset: number;
  dimMs: number;
  refill?: { fromMs: number; spanMs: number };
  fg: string;
  ghost: string;
}> = ({ cx, cy, r, onset, dimMs, refill, fg, ghost }) => {
  const ms = useMs();
  const appear = clamp01(interpolate(ms, [onset, onset + 300], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) }));
  // lit → outline. Never to zero: the trust is in question, not erased.
  const dim = clamp01(interpolate(ms, [dimMs, dimMs + 420], [1, 0], CLAMP));
  const fill = refill ? clamp01(interpolate(ms, [refill.fromMs, refill.fromMs + refill.spanMs], [0, 1], CLAMP)) : 0;
  const solid = Math.max(dim, fill);
  return (
    <div
      style={{
        position: "absolute",
        left: cx - r,
        top: cy - r,
        width: r * 2,
        height: r * 2,
        borderRadius: "50%",
        border: `2px solid ${ghost}`,
        overflow: "hidden",
        opacity: appear,
        transform: `scale(${interpolate(appear, [0, 1], [0.4, 1], CLAMP)})`,
        boxSizing: "border-box",
      }}
    >
      {/* fills from the bottom so a slow refill reads as accumulating, not fading in */}
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: `${solid * 100}%`, background: fg }} />
    </div>
  );
};

export const TrustPedestal: React.FC<Win & {
  mass: { label: string; cue: string };
  context: { label: string; cue: string };
  rests: { label: string; supportCue: string; labelCue: string };
  circle: { label: string; nodes?: number; appearCue: string; completeCue: string };
  /** the slow, deliberately-unfinished refill */
  rebuild: { label: string; cue: string; spanMs?: number };
  bg?: "ink" | "paper";
}> = ({ from, to, mass, context, rests, circle, rebuild, bg = "ink" }) => {
  const ms = useMs();
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const sub = bg === "ink" ? INK_SUB : COLORS.grayText;
  const rule = bg === "ink" ? "rgba(255,255,255,0.24)" : COLORS.border;
  const ghost = bg === "ink" ? "rgba(255,255,255,0.34)" : inkA(0.3);
  const vis = clamp01(interpolate(ms, [from, from + 260, to + 150, to + 450], [0, 1, 1, 0], CLAMP));

  const massOn = cue(mass.cue, from + 200, from);
  const ctxOn = cue(context.cue, from + 1100, from);
  const supOn = cue(rests.supportCue, from + 2400, from);
  const restOn = cue(rests.labelCue, from + 3000, from);
  const nodesOn = cue(circle.appearCue, from + 3800, from);
  const doneOn = cue(circle.completeCue, from + 4800, from);
  const rebOn = cue(rebuild.cue, from + 6300, from);

  const n = circle.nodes ?? 9;
  const slabIn = clamp01(interpolate(ms, [massOn, massOn + 480], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) }));
  const massLbl = usePop(massOn, { rise: 14 });
  const ctx = usePop(ctxOn, { rise: 12 });
  const restLbl = usePop(restOn, { rise: 12 });
  const circLbl = usePop(doneOn + 200, { rise: 12 });
  const rebLbl = usePop(rebOn, { rise: 12 });
  const sup = clamp01(interpolate(ms, [supOn, supOn + 520], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) }));
  const ringIn = clamp01(interpolate(ms, [nodesOn - 150, nodesOn + 420], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) }));
  const span = rebuild.spanMs ?? 26000; // far longer than the beat — it must not finish

  const slabX = CX - G.slabW / 2;
  const slabBottom = G.slabY + G.slabH;
  // three supports down to where the ellipse actually is at that x
  const supXs = [CX - G.rx * 0.63, CX, CX + G.rx * 0.63];
  const ringYAt = (x: number) => G.cy - G.ry * Math.sqrt(Math.max(0, 1 - ((x - CX) / G.rx) ** 2));

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {/* the mass */}
      <div style={{ position: "absolute", top: G.slabY - (V ? 52 : 42), left: 0, right: 0, textAlign: "center", ...massLbl }}>
        <div style={caps(sub, G.label)}>{mass.label}</div>
      </div>
      <div
        style={{
          position: "absolute",
          left: slabX,
          top: G.slabY,
          width: G.slabW,
          height: G.slabH * slabIn,
          background: fg,
          borderRadius: 4,
          transformOrigin: "top center",
        }}
      />
      <div style={{ position: "absolute", top: slabBottom + (V ? 20 : 16), left: 0, right: 0, textAlign: "center", ...ctx }}>
        <div style={caps(sub, G.label)}>{context.label}</div>
      </div>

      {/* what it rests on */}
      {supXs.map((x, i) => {
        const y0 = slabBottom + (V ? 68 : 54);
        const y1 = ringYAt(x);
        return <div key={i} style={{ position: "absolute", left: x - 1, top: y0, width: 2, height: Math.max(0, y1 - y0) * sup, background: rule }} />;
      })}
      <div style={{ position: "absolute", top: slabBottom + (V ? 74 : 58), left: 0, right: 0, textAlign: "center", ...restLbl }}>
        <div style={{ display: "inline-block", background: bg === "ink" ? COLORS.ink : COLORS.paper, padding: "6px 20px" }}>
          <span style={{ ...caps(fg) }}>{rests.label}</span>
        </div>
      </div>

      {/* the small circle itself */}
      <div
        style={{
          position: "absolute",
          left: CX - G.rx,
          top: G.cy - G.ry,
          width: G.rx * 2,
          height: G.ry * 2,
          border: `2px solid ${rule}`,
          borderRadius: "50%",
          opacity: ringIn,
        }}
      />
      {Array.from({ length: n }).map((_, i) => {
        const th = -Math.PI / 2 + (i * 2 * Math.PI) / n;
        return (
          <Node
            key={i}
            cx={CX + G.rx * Math.cos(th)}
            cy={G.cy + G.ry * Math.sin(th)}
            r={G.node}
            onset={nodesOn + i * 90}
            dimMs={rebOn}
            refill={i === 0 ? { fromMs: rebOn + 400, spanMs: span } : undefined}
            fg={fg}
            ghost={ghost}
          />
        );
      })}
      <div style={{ position: "absolute", top: G.cy + G.ry + (V ? 46 : 36), left: 0, right: 0, textAlign: "center", ...circLbl }}>
        <div style={caps(sub, G.label)}>{circle.label}</div>
      </div>

      {/* the rebuild — a track that has barely started when the piece moves on */}
      <div style={{ position: "absolute", top: G.trackY - (V ? 42 : 34), left: 0, right: 0, textAlign: "center", ...rebLbl }}>
        <div style={caps(sub, G.label)}>{rebuild.label}</div>
      </div>
      <div style={{ position: "absolute", top: G.trackY, left: CX - G.track / 2, width: G.track, height: 3, background: rule, opacity: rebLbl.opacity }} />
      <div
        style={{
          position: "absolute",
          top: G.trackY,
          left: CX - G.track / 2,
          width: G.track * clamp01(interpolate(ms, [rebOn + 400, rebOn + 400 + span], [0, 1], CLAMP)),
          height: 3,
          background: fg,
        }}
      />
    </AbsoluteFill>
  );
};
