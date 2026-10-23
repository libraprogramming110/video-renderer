// ─────────────────────────────────────────────────────────────────────────
// KIT · cluster — "here is where the number came from, and how it distributes".
//
//   SourceStamp  — the citation card: an acronym badge, its expansion, and a
//                  dated "as of" stamp that lands on the spoken date.
//   ClusterField — a field of marks that scatters, then GATHERS into named
//                  groups, one group per spoken word. Enacts the verb
//                  "cluster" instead of typesetting a list of categories.
//
// ⚠️ Honesty constraint baked into ClusterField: every group gets the SAME
// number of marks. The block is for scripts that name categories WITHOUT
// giving their counts — equal groups state "these three buckets" and imply no
// proportion. Never pass uneven groups to fake a distribution you don't have.
//
// ⚠️ Determinism: the scatter uses a hashed pseudo-random, never Math.random().
// The cloud render shards frames across ~16 runners — a per-frame random would
// put the marks in different places on every shard.
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { CLAMP, clamp01, caps, COLORS, cue, DISPLAY, INK_SUB, SANS, TRACK, useMs, usePop } from "./core";
import { IconMotion } from "./blocks";
import { FORMAT } from "../style";

const V = FORMAT.key === "vertical";
type Win = { from: number; to: number };
type IconC = React.FC<{ size?: number; color?: string }>;

// deterministic 0..1 from an integer — stable across renders and render shards
const hash = (n: number) => {
  const x = Math.sin(n * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

/** The citation card — acronym badge, expansion, and a dated stamp on its cue. */
export const SourceStamp: React.FC<Win & {
  badge: string;
  name: string;
  asOf: string;
  cues: { badge: string; name?: string; asOf: string };
  bg?: "ink" | "paper";
  top?: number;
}> = ({ from, to, badge, name, asOf, cues, bg = "paper", top }) => {
  const ms = useMs();
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const sub = bg === "ink" ? INK_SUB : COLORS.grayText;
  const rule = bg === "ink" ? "rgba(255,255,255,0.24)" : COLORS.border;
  const vis = clamp01(interpolate(ms, [from, from + 280, to + 150, to + 450], [0, 1, 1, 0], CLAMP));

  const bOn = cue(cues.badge, from + 300, from);
  const nOn = cue(cues.name, from + 1200, from);
  const aOn = cue(cues.asOf, from + 4000, from);
  const b = usePop(bOn, { rise: 18, scale: true });
  const n = usePop(nOn, { rise: 12 });
  const a = usePop(aOn, { rise: 12 });
  const ruleIn = clamp01(interpolate(ms, [aOn - 180, aOn + 420], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) }));

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <div style={{ position: "absolute", top: top ?? (V ? 250 : 150), left: "50%", transform: "translateX(-50%)", width: V ? 940 : 1300, textAlign: "center" }}>
        <div style={{ ...b, display: "inline-block", border: `3px solid ${fg}`, borderRadius: 6, padding: V ? "14px 34px" : "12px 28px" }}>
          <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: V ? 74 : 60, letterSpacing: "0.02em", color: fg, lineHeight: 1 }}>{badge}</span>
        </div>
        <div style={{ ...n, marginTop: 20 }}>
          <div style={caps(sub)}>{name}</div>
        </div>
        <div style={{ height: 2, width: (V ? 420 : 520) * ruleIn, background: rule, margin: "26px auto 0" }} />
        <div style={{ ...a, marginTop: 18 }}>
          <div style={caps(fg)}>{asOf}</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

/**
 * A field of marks that scatters on `appearCue`, then gathers group-by-group —
 * each group flying into its column on the frame its category is spoken.
 */
export const ClusterField: React.FC<Win & {
  /** the word the scattered field appears on */
  appearCue: string;
  /** one entry per named category — each gathers on its own word */
  groups: { label: string; cue: string; Icon?: IconC }[];
  /** marks per group (equal by design — see the honesty note at the top) */
  perGroup?: number;
  /** grid columns within a gathered group */
  cols?: number;
  bg?: "ink" | "paper";
  fieldTop?: number;
  gridTop?: number;
}> = ({ from, to, appearCue, groups, perGroup = 36, cols = 6, bg = "paper", fieldTop, gridTop }) => {
  const ms = useMs();
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const sub = bg === "ink" ? INK_SUB : COLORS.grayText;
  const vis = clamp01(interpolate(ms, [from, from + 280, to + 150, to + 450], [0, 1, 1, 0], CLAMP));

  const appearMs = cue(appearCue, from + 500, from);
  const groupMs = groups.map((g, i) => cue(g.cue, from + 2000 + i * 1200, from));

  const size = V ? 16 : 13;
  const gap = V ? 12 : 10;
  const gw = cols * size + (cols - 1) * gap;
  const rows = Math.ceil(perGroup / cols);
  const gTop = gridTop ?? (V ? 950 : 470);
  const fTop = fieldTop ?? (V ? 700 : 330);
  const fBottom = gTop + rows * (size + gap) + (V ? 200 : 140);
  const W = FORMAT.width;
  const xPad = V ? 110 : 260;

  const marks: React.ReactNode[] = [];
  groups.forEach((_, g) => {
    const cx = (W * (g + 0.5)) / groups.length;
    for (let m = 0; m < perGroup; m++) {
      const id = g * perGroup + m;
      const sx = xPad + hash(id * 2 + 1) * (W - xPad * 2 - size);
      const sy = fTop + hash(id * 2 + 2) * (fBottom - fTop - size);
      const tx = cx - gw / 2 + (m % cols) * (size + gap);
      const ty = gTop + Math.floor(m / cols) * (size + gap);
      const appear = clamp01(interpolate(ms, [appearMs + id * 5, appearMs + id * 5 + 240], [0, 1], CLAMP));
      const p = clamp01(
        interpolate(ms, [groupMs[g] + m * 11, groupMs[g] + m * 11 + 620], [0, 1], { ...CLAMP, easing: Easing.inOut(Easing.cubic) })
      );
      marks.push(
        <div
          key={id}
          style={{
            position: "absolute",
            left: sx + (tx - sx) * p,
            top: sy + (ty - sy) * p,
            width: size,
            height: size,
            borderRadius: 2,
            background: fg,
            opacity: appear * interpolate(p, [0, 1], [0.3, 0.92], CLAMP),
          }}
        />
      );
    }
  });

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {marks}
      {groups.map((g, i) => (
        <GroupLabel
          key={i}
          label={g.label}
          Icon={g.Icon}
          onset={groupMs[i]}
          cx={(W * (i + 0.5)) / groups.length}
          top={gTop + rows * (size + gap) + (V ? 40 : 28)}
          fg={fg}
          sub={sub}
        />
      ))}
    </AbsoluteFill>
  );
};

const GroupLabel: React.FC<{
  label: string;
  Icon?: IconC;
  onset: number;
  cx: number;
  top: number;
  fg: string;
  sub: string;
}> = ({ label, Icon, onset, cx, top, fg, sub }) => {
  const p = usePop(onset + 380, { rise: 12 });
  return (
    <div style={{ position: "absolute", top, left: cx, transform: "translateX(-50%)", textAlign: "center", width: 300 }}>
      {Icon ? (
        <div style={{ display: "flex", justifyContent: "center", marginBottom: 12 }}>
          <IconMotion Icon={Icon} onset={onset + 260} size={V ? 46 : 38} color={sub} breathe />
        </div>
      ) : null}
      <div style={p}>
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: V ? 34 : 28, letterSpacing: TRACK.body, color: fg }}>{label}</div>
      </div>
    </div>
  );
};
