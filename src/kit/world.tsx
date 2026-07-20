// ─────────────────────────────────────────────────────────────────────────
// KIT · world — the "section worlds, not slides" machinery.
//
// A video's background is a CHRONOLOGICAL STACK of <World> layers (ink or paper),
// each revealed by a designed wipe on a spoken cue. The agent composes them in
// order (the first/base world has no wipe); later worlds cover earlier ones as
// they reveal. <BroadcastFrame> is the persistent masthead + footer + section
// eyebrow that ties the whole piece together. Parameterized — no video baked in.
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { CLAMP, clamp01, caps, COLORS, INK_SUB, Grid, msToFrame, useMs } from "./core";
import { Wordmark } from "./ui";
import { FORMAT } from "../style";

const V = FORMAT.key === "vertical"; // portrait: tighter masthead so it fits 1080 wide

export type WorldDef = { fromMs: number; bg: "ink" | "paper"; dir?: "ltr" | "ttb" | "btt" };
export type SectionDef = { index: number; title: string; startMs: number };

const wipeClip = (p: number, dir: "ltr" | "ttb" | "btt") =>
  dir === "ltr"
    ? `inset(0 ${(1 - p) * 100}% 0 0)`
    : dir === "ttb"
    ? `inset(0 0 ${(1 - p) * 100}% 0)`
    : `inset(${(1 - p) * 100}% 0 0 0)`;

/**
 * One background world. `fromMs` = when it wipes in (0 = base layer, always shown).
 * Renders its bg + grid; you nest the beats that live in this world as children.
 */
export const World: React.FC<{
  fromMs: number;
  bg: "ink" | "paper";
  dir?: "ltr" | "ttb" | "btt";
  durationMs?: number;
  children?: React.ReactNode;
}> = ({ fromMs, bg, dir = "ltr", durationMs = 540, children }) => {
  const ms = useMs();
  const p = fromMs <= 0 ? 1 : clamp01(interpolate(ms, [fromMs, fromMs + durationMs], [0, 1], { ...CLAMP, easing: Easing.inOut(Easing.cubic) }));
  const color = bg === "ink" ? COLORS.ink : COLORS.paper;
  return (
    <AbsoluteFill style={{ clipPath: fromMs <= 0 ? undefined : wipeClip(p, dir) }}>
      <AbsoluteFill style={{ backgroundColor: color }} />
      <Grid light={bg === "paper"} />
      {children}
    </AbsoluteFill>
  );
};

// Given the world list, is the screen paper (light) at ms? (last world whose wipe midpoint passed)
const isLightAt = (worlds: WorldDef[], ms: number): boolean => {
  let bg: "ink" | "paper" = worlds[0]?.bg ?? "ink";
  for (const w of worlds) if (ms >= w.fromMs + 150) bg = w.bg;
  return bg === "paper";
};

/**
 * The persistent broadcast frame: masthead (logo · rule · running tally · date) +
 * footer hairline + section eyebrow. Colors adapt to the current world. Fully
 * parameterized: pass the brand name, the running tally chips, the section list,
 * and the world list (to know ink vs paper).
 */
export const BroadcastFrame: React.FC<{
  brand: string;
  kicker?: string;
  date?: string;
  tally?: { items: string[]; fromMs: number };
  sections: SectionDef[];
  worlds: WorldDef[];
}> = ({ brand, kicker = "Deal Intelligence", date = "", tally, sections, worlds }) => {
  const ms = useMs();
  const light = isLightAt(worlds, ms);
  const fg = light ? COLORS.ink : COLORS.paper;
  const dim = light ? COLORS.grayText : INK_SUB;
  const rule = light ? COLORS.border : "rgba(255,255,255,0.18)";
  const tallyOp = tally ? clamp01(interpolate(ms, [tally.fromMs, tally.fromMs + 500], [0, 1], CLAMP)) : 0;
  const sec = [...sections].reverse().find((s) => ms >= s.startMs) ?? sections[0];

  return (
    <AbsoluteFill style={{ padding: V ? "42px 52px" : "54px 84px", justifyContent: "space-between", pointerEvents: "none" }}>
      <div style={{ display: "flex", alignItems: "center", gap: V ? 16 : 26 }}>
        <Wordmark size={V ? 34 : 40} mark="monogram" />
        <div style={caps(fg, V ? 18 : 20)}>{brand} · {kicker}</div>
        <div style={{ flex: 1, height: 2, background: rule }} />
        {tally ? (
          <div style={{ display: "flex", alignItems: "center", gap: 18, opacity: tallyOp }}>
            {tally.items.map((it, i) => (
              <React.Fragment key={i}>
                {i > 0 ? <span style={{ width: 6, height: 6, borderRadius: 6, background: dim }} /> : null}
                <span style={caps(dim, V ? 15 : 18)}>{it}</span>
              </React.Fragment>
            ))}
          </div>
        ) : null}
        {date ? <><div style={{ width: 16 }} /><div style={caps(dim, 20)}>{date}</div></> : null}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={{ height: 2, background: rule }} />
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <span style={caps(dim, 18)}>{String((sec?.index ?? 0) + 1).padStart(2, "0")}</span>
          <span style={{ width: 22, height: 2, background: dim }} />
          <span style={caps(fg, 18)}>{sec?.title ?? ""}</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};
