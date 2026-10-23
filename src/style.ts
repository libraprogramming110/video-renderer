// ─────────────────────────────────────────────────────────────────────────
// THE LONG-FORM FORMAT — the one place the structural look & feel lives.
// THE CARD LOOK (2026-09-22): the long-form translation of The Catalyst Brief's
// live social carousels (BioIntel/slide-renderer, P1/P2/P4): black grounds with
// the logo mark as red line art, FULL red panels and bars, white Inter bold,
// one red. Replaces "Direction A" (editorial navy/paper). Every scene component
// reads its look from here. The PER-VIDEO bits (brand name, colors, format)
// live in `brand.json` (Step 0 writes it).
//
// Type system: Inter only, the carousels' own weights (700 headline/body, 400
// secondary; only those two are loaded, so a block asking for 500 renders 400
// and 600 renders 700) and their own tracking vars (TRACK below). The brand's
// identity mark lives in the real logo asset (public/assets/*.svg).
// Human-readable source of truth: references/brand-library.md (keep in sync).
// ─────────────────────────────────────────────────────────────────────────

import { loadFont as loadSans } from "@remotion/google-fonts/Inter";
import brandRaw from "./brand.json";

// ── per-video config contract ──────────────────────────────────────────────
type FormatKey = "vertical" | "horizontal" | "square";
type BrandConfig = {
  name?: string;
  format?: FormatKey;
  colors?: Partial<typeof DEFAULT_COLORS>;
};

// Default brand tokens — The Catalyst Brief (thecatalystbrief.com), sampled from the
// LIVE carousel templates (slide-renderer/templates/p1-*, p2-*, p4-page.html). A
// client's brand.json `colors` overrides any of these.
const DEFAULT_COLORS = {
  // The carousels' ground is pure black (`--tcb-bg: #000000` in every live P1/P2
  // template), NOT tokens.css's legacy #0D1117 — which the 2026-09-22 rebrand
  // commit had copied. Black is also the ink for type on the white card.
  ink: "#000000",
  inkSoft: "#141414", // a raised dark panel / footage scrim on black (neutral, not blue)
  paper: "#ffffff", // white type on black/red; the white card surface
  grayText: "#6b6b6b", // secondary text on the white card (neutral grey)
  border: "#e6e6e6", // hairlines on the white card
  panel: "#f2f2f2", // tracks / light panels on the white card
  // THE brand colour. In this look red is a SURFACE (full panels, the chrome bar,
  // the red world, the CTA button, section cards) plus ONE emphasis per scene in
  // type or a single bar. Every red in the kit reads `accent`, so a client's
  // brand.json can recolour the whole system with one key.
  accent: "#F4212D",
  // Name alias for the same red (kept from the rebrand commit). Prefer `accent`.
  red: "#F4212D",
};

const brand = brandRaw as BrandConfig;
export const COLORS = { ...DEFAULT_COLORS, ...(brand.colors ?? {}) };

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
export const BRAND = brand.name ?? "The Catalyst Brief"; // always the full name, with "The"

// ── type system — Inter only (brand identity lives in the logo asset, not live type) ─
// ONLY 400 + 700 are loaded — the carousels' two weights. That is deliberate and
// system-wide: CSS font matching sends every `fontWeight: 600` in the kit to 700
// and every 500 to 400, so the whole block library lands on the carousel weights
// without editing a single block. Do not add 500/600 back.
const sans = loadSans("normal", { weights: ["400", "700"], subsets: ["latin"] });
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
  // THE small-label tier — the carousel's "Swipe next" voice (Inter 700,
  // sentence case, nav tracking). ONE size for the whole tier.
  //
  // ⚠️ 2026-09-23: the kit had drifted to FOURTEEN different sizes for this one
  // tier (16/17/18/19/20/21/22/24/25/26/28/30/34), because every block hardcodes
  // its own `caps(sub, N)` and nothing read this token. Three of them landed in
  // the same video — a 22px spec label, a 26px figure qualifier and a 30px
  // kicker — and read as an accident, because it was one. New blocks take
  // TYPE.label; a block that needs a different size should say why in a comment.
  // Portrait runs larger: a 22px label is unreadable sound-off on a phone.
  label: formatKey === "vertical" ? 40 : 26,
  // The SECOND step of the scale — genuinely secondary micro-tags INSIDE a dense
  // block (chips, axis ticks, per-row units) that must not compete with that
  // block's own kicker. Collapsing everything to a single value would flatten
  // hierarchy that some blocks legitimately need, so the tier has two steps and
  // only two. Anything else needs a comment saying why.
  labelSm: formatKey === "vertical" ? 32 : 22,
  byline: 26, // source / attribution
  kickerTrack: "-0.035em", // mirror of TRACK.kicker (labels are sentence case now, not caps)
};

// ── tracking (letter-spacing) — copied EXACTLY from the live carousel templates ──
// p1-cover.html `--hl-track`, p1-content.html `--body-track`, both `--nav-track`.
// Every block already reads these tokens, so the kit inherits the carousel type.
export const TRACK = {
  display: "-0.042em", // --hl-track — hero / kinetic headline / stat number
  headline: "-0.042em", // --hl-track — section + scene headlines
  body: "-0.0375em", // --body-track — body / supporting line
  nav: "-0.035em", // --nav-track — the footer label ("Swipe next"), chrome labels
  // Small labels (`caps()` / <Kicker>) are the carousel's nav voice now: Inter 700,
  // SENTENCE CASE, nav tracking. The old +0.14em UPPERCASE kicker was a BioIntel-era
  // device; the carousels set no uppercase type at all, and CSS uppercasing wrecked
  // mixed-case biotech names (HARMONi → HARMONI, mRNA → MRNA).
  kicker: "-0.035em",
};

// ── motion — UNCHANGED by the card look (a visual re-skin, not a motion rewrite) ──
export const MOTION = {
  // spring for text/element reveals — smooth, no overshoot bounce
  spring: { damping: 200, mass: 0.6, stiffness: 100 },
  revealStaggerFrames: 5, // delay between words/lines revealing
  sceneFadeFrames: 8, // crossfade between scenes
  rule: { drawFrames: 18 }, // the editorial hairline drawing in
};

// ── the card look's fixed geometry — shared by World, BroadcastFrame and the
//    carousel-derived blocks so they agree on where the chrome and the card sit ──
const isV = formatKey === "vertical";
export const LAYOUT = {
  // The persistent chrome BAND (p2-content's full-bleed red footer bar). Horizontal:
  // along the BOTTOM, like the carousels. Vertical: along the TOP, because the bottom
  // ~15% of a reel sits under platform UI (caption, handle, buttons).
  chrome: isV ? { edge: "top" as const, h: 112, pad: 52 } : { edge: "bottom" as const, h: 96, pad: 84 },
  // The WHITE CARD a `paper` world renders (p2-cover's rounded card, in white):
  // inset from the frame edges, clear of the chrome band, on the black ground.
  card: isV
    ? { left: 36, right: 36, top: 112 + 28, bottom: 36, radius: 30 }
    : { left: 40, right: 40, top: 40, bottom: 96 + 24, radius: 30 },
  // Vertical: keep key text out of the bottom 15% (Reels/Shorts UI).
  safeBottom: isV ? 288 : 0,
};

export const MUSIC = {
  volume: 0.14, // ducked under the VO (a touch lower than the reel — long-form VO is the focus)
  fadeInFrames: 30, // gentle ~1s ramp up at the top
  fadeOutFrames: 45, // ~1.5s ramp down at the tail
  src: "music/bed.mp3", // public/<src>; fetch-music.mjs writes it (Jamendo, CC-BY)
};
