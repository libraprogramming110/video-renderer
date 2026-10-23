// Shared primitives the kit reuses (the card look, The Catalyst Brief):
// Wordmark (the real logo asset, tone-able), Kicker, Rule, Reveal/useReveal, KenBurns.
import React from "react";
import { AbsoluteFill, Img, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, MOTION, SANS, TYPE } from "../style";

// A slow, continuous push (Ken-Burns) so a held scene never freezes. Wrap a footage
// layer or a whole graphic in it. Restrained: a few percent of scale over the hold.
export const KenBurns: React.FC<{
  children: React.ReactNode;
  from?: number;
  to?: number;
  durationFrames?: number;
}> = ({ children, from = 1.05, to = 1.13, durationFrames = 360 }) => {
  const frame = useCurrentFrame();
  const scale = interpolate(frame, [0, durationFrames], [from, to], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ transform: `scale(${scale})`, transformOrigin: "center center" }}>{children}</AbsoluteFill>
  );
};

// A smooth spring reveal (fade + small rise). delay in frames.
export const useReveal = (delay = 0) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - delay, fps, config: MOTION.spring });
  return { p, y: interpolate(p, [0, 1], [26, 0]), opacity: p };
};

export const Reveal: React.FC<{
  delay?: number;
  children: React.ReactNode;
  style?: React.CSSProperties;
}> = ({ delay = 0, children, style }) => {
  const { y, opacity } = useReveal(delay);
  return <div style={{ transform: `translateY(${y}px)`, opacity, ...style }}>{children}</div>;
};

// The small label (the carousel "Swipe next" voice): Inter 700, sentence case, nav
// tracking. Formerly the caps + wide-tracked BioIntel "FEATURED" kicker.
export const Kicker: React.FC<{ children: React.ReactNode; color?: string; delay?: number }> = ({
  children,
  color,
  delay = 0,
}) => (
  <Reveal delay={delay}>
    <div
      style={{
        fontFamily: SANS,
        fontWeight: 700,
        fontSize: TYPE.label,
        letterSpacing: TYPE.kickerTrack,
        color: color ?? COLORS.grayText,
      }}
    >
      {children}
    </div>
  </Reveal>
);

// The hairline rule that draws in. The carousels' rules are 1px and square-ended;
// defaults to the brand red (visible on black AND on the white card).
export const Rule: React.FC<{ color?: string; width?: number; delay?: number; thickness?: number }> = ({
  color,
  width = 120,
  delay = 6,
  thickness = 3,
}) => {
  const frame = useCurrentFrame();
  const w = interpolate(frame, [delay, delay + MOTION.rule.drawFrames], [0, width], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
  });
  return <div style={{ height: thickness, width: w, background: color ?? COLORS.accent }} />;
};

// The brand logo: the REAL asset (public/assets/*.svg), transparent, drawn at its
// OWN aspect ratio. `size` = HEIGHT in px; width follows the SVG (never forced
// square, no tile or rounded corners). Default brand = The Catalyst Brief (red):
// `wordmark` = the full lockup, mark + "THE CATALYST BRIEF", wide ~2.94:1;
// `monogram` = the mark only, ~0.83:1. A client's own SVGs drop in under the same
// two names at any aspect ratio.
// `tone` (card look, 2026-09-22) recolours the flat one-colour logo the way the
// carousels do (white lockup on a red panel / bar, red on black): "brand" = the
// file's own colour; "white" / "black" = a flat recolour via CSS filter, which
// keeps the anti-aliased edges (alpha) and is deterministic per frame (no async
// mask image that could miss a render frame).
export const Wordmark: React.FC<{ size?: number; mark?: "wordmark" | "monogram"; tone?: "brand" | "white" | "black" }> = ({
  size = 56,
  mark = "wordmark",
  tone = "brand",
}) => (
  <Img
    src={staticFile(`assets/${mark}.svg`)}
    style={{
      height: size,
      width: "auto",
      display: "block",
      filter: tone === "white" ? "brightness(0) invert(1)" : tone === "black" ? "brightness(0)" : undefined,
    }}
  />
);
