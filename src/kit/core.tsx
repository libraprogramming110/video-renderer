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
import { AbsoluteFill, Audio, Easing, getRemotionEnvironment, interpolate, OffthreadVideo, spring, staticFile, useCurrentFrame, useVideoConfig, Video } from "remotion";
import { COLORS, DISPLAY, MUSIC, SANS, TRACK, TYPE } from "../style";
import music from "../music.json";
import timeline from "../timeline.json";

export const CLAMP = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
/** Secondary type on a DARK surface. A translucent white (not a fixed grey), so it
 *  reads as a neutral grey on black and on footage. The old solid blue-grey #9aa3b0
 *  went muddy on red. ⚠️ Not for the RED world: 62% white on #F4212D measures ~2.3:1,
 *  under the 3:1 large-text floor. Blocks that can stand in red use `useInkSub()`. */
export const INK_SUB = "rgba(255,255,255,0.62)";
/** Secondary type on red: 80% white (~3:1 on #F4212D, the carousels' own white-over-red
 *  tone). Keeps a muted lead line from fading out while the white emphasis survives, the
 *  "looks half-broken" failure of the 2026-07-20 paper scrim, which red reproduces. */
export const INK_SUB_ON_RED = "rgba(255,255,255,0.8)";
export { COLORS, DISPLAY, SANS, TRACK };

const hexRgb = (hex: string): string => {
  const h = hex.replace("#", "");
  const f = h.length === 3 ? h.split("").map((c) => c + c).join("") : h.slice(0, 6);
  const n = parseInt(f, 16);
  return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`;
};
/** The ink colour at an alpha — the token for every dark tint/scrim/ghost on the
 *  white card. Replaces the hardcoded old-navy rgba(28,31,38,a) literals. */
export const inkA = (a: number) => `rgba(${hexRgb(COLORS.ink)},${a})`;
/** The accent (brand red) at an alpha. */
export const accentA = (a: number) => `rgba(${hexRgb(COLORS.accent)},${a})`;

export const msToFrame = (ms: number, fps: number) => Math.round((ms / 1000) * fps);

// The small label used everywhere (name kept for API compatibility). THE CARD LOOK:
// the carousel footer's "Swipe next" voice — Inter 700, SENTENCE CASE (strings keep
// their own casing, so HARMONi / mRNA survive), nav tracking. No uppercase, no
// positive tracking: the carousels set neither.
export const caps = (color: string, size = TYPE.label): React.CSSProperties => ({
  fontFamily: SANS,
  fontWeight: 700,
  fontSize: size,
  letterSpacing: TRACK.kicker,
  color,
});

// ── the WORLD a block is standing in (set by <World>, read by the accent helper) ──
export type WorldBg = "ink" | "paper" | "red";
export const WorldContext = React.createContext<WorldBg>("ink");
export const useWorld = () => React.useContext(WorldContext);
/**
 * The colour for a block's ONE emphasis (an accent bar, an underline, a key bar, a
 * list numeral, an emphasised phrase). Brand red on black and on the white card;
 * WHITE when the block stands in the red world (red-on-red would vanish). Blocks
 * call it instead of hardcoding a colour, so the rule lives in one place.
 */
export const useAccent = () => (useWorld() === "red" ? COLORS.paper : COLORS.accent);
/** Secondary type on a dark-type block: INK_SUB on black, INK_SUB_ON_RED in the red world. */
export const useInkSub = () => (useWorld() === "red" ? INK_SUB_ON_RED : INK_SUB);
/**
 * Footage that sits BEHIND or AROUND type reads only on the black (`ink`) world
 * (RETROSPECTIVE 2026-07-25 / 2026-08-06, re-read for the card look 2026-09-22):
 * on the white card the clip covers the card and the dark type dies; on red it
 * muddies the one red. Throws in the Studio so the mistake is seen at preview,
 * not in a shipped master. `when` = only enforce if the block actually has footage.
 * (CoverCard's opaque top plate is the one sanctioned photo in the red world.)
 */
export const useRequireInk = (block: string, when = true) => {
  const world = useWorld();
  if (when && world !== "ink") {
    throw new Error(
      `${block} needs the black (ink) world, but it stands in the ${world === "red" ? "red" : "white-card (paper)"} world. ` +
        `Footage behind type only reads on black. Move this beat into an ink <World>, or drop the footage. (RETROSPECTIVE 2026-09-22)`
    );
  }
};

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

/**
 * Resolve a SEQUENCE of tokens (a narration line) to their spoken ms, walking a
 * WORD-INDEX cursor rather than a millisecond cursor.
 *
 * ⚠️ Why this exists: two Whisper tokens can share one `startMs` — "August" and
 * "6th" both came back at 12040ms on the IPO-week build — and the old ms-cursor
 * (`cursor = m + 1`) then skips every word at that same timestamp, because the
 * next lookup requires `startMs >= m + 1`. The token silently falls back to the
 * block's own onset and reads as UNSYNCED, which is invisible in a cue audit that
 * only checks single cues. Spoken figures are exactly where Whisper stacks tokens,
 * so this hits date and money phrases — the emphasized ones — first.
 *
 * Returns undefined per token that never resolves; callers supply the fallback.
 * (added BioIntel IPO-week long-form, 2026-08-14)
 */
export function cueSeq(tokens: string[], fromMs: number, toMs: number): (number | undefined)[] {
  let i = 0;
  while (i < WORDS.length && WORDS[i].startMs < fromMs) i++;
  return tokens.map((tok) => {
    const b = norm(tok);
    if (!b) return undefined;
    for (let j = i; j < WORDS.length; j++) {
      if (WORDS[j].startMs > toMs) break;
      const a = norm(WORDS[j].raw);
      if (a && (a === b || a.startsWith(b) || b.startsWith(a))) {
        i = j + 1;
        return WORDS[j].startMs;
      }
    }
    return undefined;
  });
}

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

/**
 * The video tag to use for b-roll. `OffthreadVideo` extracts frames with ffmpeg —
 * frame-exact and the right choice for the RENDER — but in the Studio it fetches a
 * new frame per tick, so pressing play on a composition with footage stutters and
 * the whole preview appears to hang. `Video` is a real <video> element: smooth to
 * scrub and play, and the preview is the only way this skill reviews a build.
 * So: `Video` in the Studio/Player, `OffthreadVideo` when rendering. Same props.
 * (Added on the Replimune long-form, 2026-08-08 — the operator hit the stutter.)
 *
 * ⚠️ NEVER pass `pauseWhenBuffering` here. It gives the media tag a veto over the
 * whole timeline: a clip that is off-screen (outside its beat window) reports
 * "buffering" forever, so pressing play in the Studio just spins the play button
 * and the cursor never advances. Cost a round-trip on this build.
 */
export const BrollVideo: React.FC<{ src: string; style?: React.CSSProperties }> = ({ src, style }) => {
  const Tag = getRemotionEnvironment().isRendering ? OffthreadVideo : Video;
  return <Tag src={src} muted pauseWhenBuffering={false} style={style} />;
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
  /**
   * Fade the bed out EARLY and hold silence to the end, instead of riding to the
   * final frame. Two reasons this is needed: a track shorter than the video
   * otherwise loops and exposes a seam, and a closing thesis line often lands
   * harder dry. Omit for the default behaviour (fade at the composition end).
   * (added BioIntel IPO-week long-form, 2026-08-14)
   */
  outAtMs?: number;
}> = (props) => {
  const cfg = music as { enabled?: boolean; src?: string };
  const { durationInFrames, fps } = useVideoConfig();
  const on = props.enabled ?? cfg.enabled ?? false;
  if (!on) return null;
  const src = props.src ?? cfg.src ?? MUSIC.src;
  const volume = props.volume ?? MUSIC.volume;
  const fadeIn = props.fadeInFrames ?? MUSIC.fadeInFrames;
  const fadeOut = props.fadeOutFrames ?? MUSIC.fadeOutFrames;
  const outFrame = props.outAtMs != null ? msToFrame(props.outAtMs, fps) : durationInFrames;
  return (
    <Audio
      src={staticFile(src)}
      loop
      volume={(f) =>
        interpolate(
          f,
          [0, fadeIn, Math.max(fadeIn + 1, outFrame - fadeOut), outFrame],
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

/**
 * The faint living grid (Direction A). No longer drawn by <World> — the card look
 * uses <LineArt> — but kept exported for older compositions.
 * Edge-strip fix (2026-09-22): the drift used to TRANSLATE the whole layer, which
 * slid its right/bottom edge inward and left an ungridded strip along those edges.
 * It now drifts the background POSITION, so the pattern always covers the frame.
 */
export const Grid: React.FC<{ light: boolean }> = ({ light }) => {
  const frame = useCurrentFrame();
  const drift = (frame * 0.25) % 88;
  const line = light ? inkA(0.06) : "rgba(255,255,255,0.05)";
  return (
    <AbsoluteFill
      style={{
        backgroundImage: `linear-gradient(${line} 1px, transparent 1px), linear-gradient(90deg, ${line} 1px, transparent 1px)`,
        backgroundSize: "88px 88px",
        backgroundPosition: `${-drift}px ${-drift}px`,
      }}
    />
  );
};

// The logo mark's two polygons, exactly as the carousels draw their background art
// (p1-cta / p2-* `.art`, from Lead/Brand Assets/CatalystBrief_logo_outline_2px.svg).
const MARK_POLYS = [
  "690,270 579,299 594,318 312,599 309,708 648,372 664,384",
  "647,417 389,673 389,729 593,729 647,674 647,599 617,598 512,701 471,700 646,526",
];

/**
 * The carousels' background line art: the logo mark as a giant OUTLINE bleeding off
 * the frame, brand red at 20% on black. Replaces the grid as the texture of the
 * black world. It keeps a held frame alive by DRIFTING slowly along the mark's own
 * rising diagonal (up and to the right) — a constant glide, never a wobble.
 * `sinceMs` = when its world appeared, so each world starts its drift at rest.
 */
export const LineArt: React.FC<{ color?: string; opacity?: number; sinceMs?: number }> = ({
  color,
  opacity = 0.2,
  sinceMs = 0,
}) => {
  const frame = useCurrentFrame();
  const { fps, width, height } = useVideoConfig();
  const t = Math.max(0, frame / fps - sinceMs / 1000); // seconds this world has been up
  const d = t * 3.2; // px/s along the diagonal — slow enough to read as stillness with life
  const V = height > width;
  // fitted like the carousels: the arrow tip near the top-right, the base bleeding
  // off the bottom edge. Portrait frames scale up so the mark still fills the height.
  const s = V ? 3.6 : 2.83;
  const tx = (V ? 1000 : 1560) - 690 * s + d;
  const ty = (V ? 150 : 60) - 270 * s - d;
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`} style={{ display: "block" }}>
        <g transform={`translate(${tx} ${ty}) scale(${s})`} fill="none" stroke={color ?? COLORS.accent} strokeOpacity={opacity}
          strokeWidth={V ? 5 : 4} vectorEffect="non-scaling-stroke" strokeLinejoin="miter">
          {MARK_POLYS.map((p, i) => <polygon key={i} points={p} vectorEffect="non-scaling-stroke" />)}
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/** The carousels' nav triangle ("Swipe next ▶"), one SVG so it centres on its text. */
export const NavArrow: React.FC<{ size?: number; color?: string }> = ({ size = 26, color = "currentColor" }) => (
  <svg width={size * (33 / 38)} height={size} viewBox="0 0 33 38" style={{ display: "block", flex: "none" }}>
    <polygon points="0,0 33,19 0,38 6.9,19" fill={color} />
  </svg>
);
