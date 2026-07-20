// ─────────────────────────────────────────────────────────────────────────
// THE LONG-FORM FORMAT — the one place the structural look & feel lives.
// Direction A (editorial data-journalism), skinned in the BioIntel brand.
// Every scene component reads its look from here. The PER-VIDEO bits
// (brand name, colors, format) live in `brand.json` (Step 0 writes it).
//
// Type system (locked 2026-06-17, Nel): Inter for ALL in-video type, with
// tight negative tracking on the big display sizes (~-0.04em / "-40"). The
// SERIF identity now lives ONLY in the real logo asset
// (public/assets/wordmark.svg), never in live type.
// Human-readable source of truth: references/brand-library.md (keep in sync).
// ─────────────────────────────────────────────────────────────────────────

import { loadFont as loadSans } from "@remotion/google-fonts/Inter";
import brandRaw from "./brand.json";

// ── per-video config contract ──────────────────────────────────────────────
type FormatKey = "vertical" | "horizontal" | "square";
type BrandConfig = {
  name?: string;
  format?: FormatKey;
  colors?: Partial<typeof BIOINTEL_COLORS>;
};

// BioIntel brand tokens — monochrome editorial navy (verified from the real logo
// + thebiointel.com). Dark reconciled to #1c1f26: the value in the actual logo
// file and the social carousels. The website-scraped #1d2025 was a near-duplicate;
// the logo wins.
const BIOINTEL_COLORS = {
  ink: "#1c1f26", // brand navy — dark backgrounds, the logo tile, primary text on light
  inkSoft: "#1a212d", // a second dark for layering / footage scrims
  paper: "#ffffff", // the light background
  grayText: "#6b7280", // secondary text, bylines, kickers/labels
  border: "#e5e7eb", // hairlines, dividers
  panel: "#f3f4f6", // light panels / chart gridlines
  // Monochrome brand — no loud accent. Emphasis comes from type weight + size, not color.
  // A single restrained accent slot (defaults to ink); flip in brand.json if a chart needs it.
  accent: "#1c1f26",
};

const brand = brandRaw as BrandConfig;
export const COLORS = { ...BIOINTEL_COLORS, ...(brand.colors ?? {}) };

// ── canvas ─────────────────────────────────────────────────────────────────
const FORMATS = {
  vertical: { width: 1080, height: 1920 },
  horizontal: { width: 1920, height: 1080 }, // YouTube — the default for long-form
  square: { width: 1080, height: 1080 },
} as const;
const formatKey: FormatKey =
  brand.format && brand.format in FORMATS ? brand.format : "horizontal";

export const FORMAT = { ...FORMATS[formatKey], fps: 30, key: formatKey };
export const frames = (seconds: number) => Math.round(seconds * FORMAT.fps);
export const BRAND = brand.name ?? "BioIntel";

// ── type system — Inter only (the serif lives in the logo asset, not live type) ─
const sans = loadSans("normal", { weights: ["400", "500", "600", "700"], subsets: ["latin"] });
loadSans("italic", { weights: ["400"], subsets: ["latin"] }); // QuoteCard emphasis

export const SANS = sans.fontFamily; // Inter — everything
export const DISPLAY = sans.fontFamily; // headlines / stats / quotes — Inter, tight-tracked (see TRACK)
/** @deprecated Serif identity now lives only in the logo asset. Alias kept so older
 *  imports keep rendering Inter; migrate `SERIF` → `DISPLAY` when touching a scene. */
export const SERIF = sans.fontFamily;

// Sizes are for the 1920×1080 canvas (the default). Scale with FORMAT if needed.
export const TYPE = {
  display: 132, // hero / kinetic headline
  headline: 88, // section + scene headlines
  stat: 220, // the big number
  quote: 76, // pulled quote
  body: 40, // supporting line
  label: 26, // caps kicker / category label
  byline: 26, // source / attribution
  kickerTrack: "0.14em", // letter-spacing for UPPERCASE labels (positive — caps need to breathe)
};

// ── tracking (letter-spacing) — Nel's call: tight negative on the big sans type ──
// "-40" (Figma/After Effects units) ≈ -0.04em. Tightest on display; eased back as
// size drops; POSITIVE on caps kickers (a tight uppercase label reads as cramped).
export const TRACK = {
  display: "-0.04em", // the "-40" — hero / kinetic headline / stat number
  headline: "-0.03em", // section + scene headlines
  body: "-0.01em", // supporting line
  kicker: "0.14em", // UPPERCASE labels (mirror of TYPE.kickerTrack)
};

// ── motion (restrained, editorial — confident not flashy) ────────────────────
export const MOTION = {
  // spring for text/element reveals — smooth, no overshoot bounce
  spring: { damping: 200, mass: 0.6, stiffness: 100 },
  revealStaggerFrames: 5, // delay between words/lines revealing
  sceneFadeFrames: 8, // crossfade between scenes
  rule: { drawFrames: 18 }, // the editorial hairline drawing in
};

export const MUSIC = {
  volume: 0.14, // ducked under the VO (a touch lower than the reel — long-form VO is the focus)
  fadeInFrames: 30, // gentle ~1s ramp up at the top
  fadeOutFrames: 45, // ~1.5s ramp down at the tail
  src: "music/bed.mp3", // public/<src>; fetch-music.mjs writes it (Jamendo, CC-BY)
};
