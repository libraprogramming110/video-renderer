// Shared editorial primitives the kit reuses (Direction A / BioIntel):
// Wordmark (the real logo asset), Kicker, Rule, Reveal/useReveal, KenBurns.
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

// Caps, letter-spaced category label (the BioIntel "FEATURED" / "AI IN DRUG DISCOVERY" style).
export const Kicker: React.FC<{ children: React.ReactNode; color?: string; delay?: number }> = ({
  children,
  color,
  delay = 0,
}) => (
  <Reveal delay={delay}>
    <div
      style={{
        fontFamily: SANS,
        fontWeight: 600,
        fontSize: TYPE.label,
        letterSpacing: TYPE.kickerTrack,
        textTransform: "uppercase",
        color: color ?? COLORS.grayText,
      }}
    >
      {children}
    </div>
  </Reveal>
);

// The editorial hairline that draws in.
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
  return <div style={{ height: thickness, width: w, background: color ?? COLORS.ink, borderRadius: 2 }} />;
};

// The BioIntel logo tile — the REAL brand asset (public/assets/*.svg), a square
// navy lockup. `wordmark` = full "BioIntel" tile (title card + outro); `monogram`
// = the "B" mark (corner bug). Square; width follows height.
export const Wordmark: React.FC<{ size?: number; mark?: "wordmark" | "monogram" }> = ({
  size = 56,
  mark = "wordmark",
}) => (
  <Img
    src={staticFile(`assets/${mark}.svg`)}
    style={{ height: size, width: size, display: "block", borderRadius: 6 }}
  />
);
