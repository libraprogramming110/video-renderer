// ─────────────────────────────────────────────────────────────────────────
// KIT · core — the shared primitives every block uses. The point of this file
// is the CUE HELPER: a block never hardcodes a millisecond, it asks "when is
// this WORD spoken?" and animates then. Swap the VO/script and the timing moves
// automatically. (This is what makes the kit reusable across any video.)
//
//   onset = cueMs("GSK")   // ms that word is voiced, from timeline.words[]
//   const pop = usePop(onset)
//
// Reusable, brand-agnostic: all look comes from ../style (per-client brand.json).
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, Audio, Easing, interpolate, spring, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { COLORS, DISPLAY, MUSIC, SANS, TRACK } from "../style";
import music from "../music.json";
import timeline from "../timeline.json";

export const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const INK_SUB = "#9aa3b0"; // muted label on an ink/footage background
export { COLORS, DISPLAY, SANS, TRACK };

export const msToFrame = (ms: number, fps: number) => Math.round((ms / 1000) * fps);

// caps / letter-spaced label — the editorial kicker used everywhere.
export const caps = (color: string, size = 22): React.CSSProperties => ({
  fontFamily: SANS,
  fontWeight: 600,
  fontSize: size,
  letterSpacing: TRACK.kicker,
  textTransform: "uppercase",
  color,
});

// ── THE CUE HELPER ────────────────────────────────────────────────────────
type WordT = { raw: string; beat: number; startMs: number; endMs: number };
const WORDS = (timeline.words ?? []) as WordT[];
const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

/**
 * The ms a spoken word/phrase begins, from timeline.words[]. `afterMs` disambiguates
 * repeats (e.g. the 2nd "platform"). Returns undefined if not found — callers supply a
 * fallback. Punctuation-only tokens are rejected so "&"/"—" can't match anything.
 */
export function cueMs(phrase: string, afterMs = 0): number | undefined {
  const target = phrase.split(/\s+/).filter(Boolean).map(norm).filter(Boolean);
  if (!target.length) return undefined;
  for (let i = 0; i < WORDS.length; i++) {
    if (WORDS[i].startMs < afterMs) continue;
    let ok = true;
    for (let k = 0; k < target.length; k++) {
      const a = norm(WORDS[i + k]?.raw ?? "");
      const b = target[k];
      if (!a || !(a === b || a.startsWith(b) || b.startsWith(a))) { ok = false; break; }
    }
    if (ok) return WORDS[i].startMs;
  }
  return undefined;
}

/** cueMs with a fallback baked in — the common form blocks use. */
export const cue = (phrase: string | undefined, fallbackMs: number, afterMs = 0): number =>
  (phrase ? cueMs(phrase, afterMs) : undefined) ?? fallbackMs;

// ── reveal / motion primitives ─────────────────────────────────────────────
/** A spring "pop" (fade + rise + optional scale) keyed to an absolute ms onset. */
export function usePop(onsetMs: number, opts?: { rise?: number; scale?: boolean }) {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const p = spring({ frame: frame - msToFrame(onsetMs, fps), fps, config: { damping: 18, mass: 0.5, stiffness: 120 } });
  const rise = opts?.rise ?? 24;
  return {
    opacity: clamp01(p * 1.15),
    transform: `translateY(${interpolate(p, [0, 1], [rise, 0], CLAMP)}px)${
      opts?.scale ? ` scale(${interpolate(p, [0, 1], [0.92, 1], CLAMP)})` : ""
    }`,
  };
}

/** Current VO position in ms (frame → ms), for time-window opacity gates. */
export const useMs = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  return (frame / fps) * 1000;
};

/** A number that counts up over the exact window its figure is voiced. */
export const CountUp: React.FC<{
  fromMs: number;
  toMs: number;
  value: number;
  decimals: number;
  prefix?: string;
  suffix?: string;
  style?: React.CSSProperties;
}> = ({ fromMs, toMs, value, decimals, prefix = "", suffix = "", style }) => {
  const ms = useMs();
  const t = interpolate(ms, [fromMs, toMs], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) });
  const shown = (t * value).toLocaleString("en-US", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  // Hidden until its cue — never show a static "$0.00" before the figure is voiced.
  // Reveals (fade + rise) exactly as the count-up begins.
  const appear = clamp01(interpolate(ms, [fromMs - 60, fromMs + 140], [0, 1], CLAMP));
  const rise = interpolate(appear, [0, 1], [18, 0], CLAMP);
  const pop = interpolate(ms, [toMs - 120, toMs + 120], [0.98, 1], CLAMP);
  return (
    <div style={{ ...style, fontVariantNumeric: "tabular-nums", opacity: appear, transform: `translateY(${rise}px) scale(${pop})` }}>
      {prefix}
      {shown}
      {suffix}
    </div>
  );
};

// ── audio ───────────────────────────────────────────────────────────────────
/**
 * The background-music BED: one track at a FLAT ducked volume under the VO, with a
 * gentle fade-in at the top and a fade-out at the tail. It does NOT react to the VO
 * waveform — the VO plays at full and the bed sits permanently low (MUSIC.volume), so
 * narration always reads on top. `loop` fills the runtime if the track is shorter.
 *
 * Gated by src/music.json (`enabled`) — drop NO track and it renders nothing, so a
 * render without music never breaks. `scripts/fetch-music.mjs --pick <id>` flips the
 * gate + writes public/music/bed.mp3. Final loudness is reconciled for the whole mix
 * in scripts/finalize.mjs, not here.
 */
export const MusicBed: React.FC<{
  enabled?: boolean;
  src?: string;
  volume?: number;
  fadeInFrames?: number;
  fadeOutFrames?: number;
}> = (props) => {
  const cfg = music as { enabled?: boolean; src?: string };
  const { durationInFrames } = useVideoConfig();
  const on = props.enabled ?? cfg.enabled ?? false;
  if (!on) return null;
  const src = props.src ?? cfg.src ?? MUSIC.src;
  const volume = props.volume ?? MUSIC.volume;
  const fadeIn = props.fadeInFrames ?? MUSIC.fadeInFrames;
  const fadeOut = props.fadeOutFrames ?? MUSIC.fadeOutFrames;
  return (
    <Audio
      src={staticFile(src)}
      loop
      volume={(f) =>
        interpolate(
          f,
          [0, fadeIn, durationInFrames - fadeOut, durationInFrames],
          [0, volume, volume, 0],
          CLAMP
        )
      }
    />
  );
};

/**
 * A "slam" STAMP — opacity-in + a scale overshoot (default 1.16→1) keyed to an
 * onset ms. More emphatic than usePop for a single hero word that should land HARD
 * on its cue (e.g. TOXIC, PREMIUM). Spread onto the element's style.
 * (generalized from the Ipsen×Kartos longform, 2026-07-02)
 */
export function useStamp(onsetMs: number, opts?: { from?: number }): React.CSSProperties {
  const ms = useMs();
  const from = opts?.from ?? 1.16;
  const opacity = clamp01(interpolate(ms, [onsetMs, onsetMs + 150], [0, 1], CLAMP));
  const scale = interpolate(ms, [onsetMs, onsetMs + 300], [from, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) });
  return { opacity, transform: `scale(${scale})` };
}

/** The faint living grid that ties beats together. */
export const Grid: React.FC<{ light: boolean }> = ({ light }) => {
  const frame = useCurrentFrame();
  const drift = (frame * 0.25) % 88;
  const line = light ? "rgba(28,31,38,0.06)" : "rgba(255,255,255,0.05)";
  return (
    <AbsoluteFill
      style={{
        backgroundImage: `linear-gradient(${line} 1px, transparent 1px), linear-gradient(90deg, ${line} 1px, transparent 1px)`,
        backgroundSize: "88px 88px",
        transform: `translate(${-drift}px, ${-drift}px)`,
      }}
    />
  );
};
