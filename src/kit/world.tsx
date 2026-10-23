// ─────────────────────────────────────────────────────────────────────────
// KIT · world — the "section worlds, not slides" machinery, in THE CARD LOOK.
//
// A video's background is a CHRONOLOGICAL STACK of <World> layers, each revealed
// by a designed wipe on a spoken cue. The agent composes them in order (the
// first/base world has no wipe); later worlds cover earlier ones as they reveal.
// <BroadcastFrame> is the persistent chrome that ties the whole piece together.
//
// The three worlds are the three surfaces of the live carousels:
//   ink   → the black ground (p1-content / p2-content) + the logo mark as red line art
//   red   → the full red panel (p1-cover's panel, p4-page's ground); white type
//   paper → a rounded WHITE CARD on the black ground (p2-cover's card, in white)
// A SECTION change is a RED PANEL WIPE: a red band sweeps across ahead of the new
// world (the carousels' red panel as a curtain). A world change INSIDE a section
// (a flip for footage, a beat that needs the card) is a plain edge wipe, so the red
// band stays a chapter marker rather than a tic (Nel, 2026-09-22). Opt a single
// change into the band with `wipe="panel"`. Parameterized — no video baked in.
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, Easing, interpolate, interpolateColors } from "remotion";
import { CLAMP, clamp01, COLORS, LineArt, NavArrow, SANS, TRACK, useMs, WorldBg, WorldContext } from "./core";
import { Wordmark } from "./ui";
import { FORMAT, LAYOUT } from "../style";

const V = FORMAT.key === "vertical";

/** `section` = this world opens a new section (so it gets the red panel wipe). Keep
 *  it on the WORLDS list too, so one array can be spread into `<World {...w}>`. */
export type WorldDef = { fromMs: number; bg: WorldBg; dir?: "ltr" | "ttb" | "btt"; section?: boolean; wipe?: "panel" | "plain" };
export type SectionDef = { index: number; title: string; startMs: number };

// q = how much of the frame is revealed (0..1), from the wipe's leading side.
const wipeClip = (q: number, dir: "ltr" | "ttb" | "btt") =>
  dir === "ltr"
    ? `inset(0 ${(1 - q) * 100}% 0 0)`
    : dir === "ttb"
    ? `inset(0 0 ${(1 - q) * 100}% 0)`
    : `inset(${(1 - q) * 100}% 0 0 0)`;

const EASE = Easing.inOut(Easing.cubic);

/** The painted surface of a world (no children). */
const Ground: React.FC<{ bg: WorldBg; sinceMs: number; lineArt?: boolean }> = ({ bg, sinceMs, lineArt = true }) => {
  if (bg === "red") return <AbsoluteFill style={{ backgroundColor: COLORS.accent }} />;
  if (bg === "paper") {
    const c = LAYOUT.card;
    return (
      <AbsoluteFill style={{ backgroundColor: COLORS.ink }}>
        <div style={{ position: "absolute", left: c.left, right: c.right, top: c.top, bottom: c.bottom, background: COLORS.paper, borderRadius: c.radius }} />
      </AbsoluteFill>
    );
  }
  return (
    <AbsoluteFill style={{ backgroundColor: COLORS.ink }}>
      {lineArt ? <LineArt sinceMs={sinceMs} /> : null}
    </AbsoluteFill>
  );
};

/**
 * One background world. `fromMs` = when it wipes in (0 = base layer, always shown).
 * Renders its surface; you nest the beats that live in this world as children.
 * Children can read which world they stand in via `useWorld()` / `useAccent()`.
 *
 * Two wipes, same start cue and same `durationMs` (world timing rules unchanged):
 *  "panel" — a LEADING edge covers the old world in brand red, a TRAILING edge
 *            reveals the new world behind it, so a red panel sweeps across. The
 *            outgoing world is fully covered at ~80% of the wipe (~430ms of 540).
 *            Into a red world the band and the world are one colour: a plain red wipe.
 *  "plain" — one clean edge reveals the new world (Direction A's wipe), no band.
 * Default (2026-09-22): "panel" when `section` is set (the world opens a section),
 * "plain" otherwise. `wipe="panel"` is the opt-in for a band on a non-section
 * change; `wipe="plain"` drops it from a section change.
 */
export const World: React.FC<{
  fromMs: number;
  bg: WorldBg;
  dir?: "ltr" | "ttb" | "btt";
  durationMs?: number;
  /** this world opens a new section → the red panel wipe (by default) */
  section?: boolean;
  /** override the wipe: "panel" (red band) or "plain" (clean edge). Default: section ? "panel" : "plain". */
  wipe?: "panel" | "plain";
  /** false = a black world WITHOUT the mark's red line art. RULE: every ink world that carries a FootageScrim sets lineArt={false} (Nel flagged the line art over footage twice on GSK x Chai, 2026-10-15). */
  lineArt?: boolean;
  children?: React.ReactNode;
}> = ({ fromMs, bg, dir = "ltr", durationMs = 540, section = false, wipe, lineArt, children }) => {
  const ms = useMs();
  const base = fromMs <= 0;
  const panel = (wipe ?? (section ? "panel" : "plain")) === "panel";
  const raw = base ? 1 : clamp01(interpolate(ms, [fromMs, fromMs + durationMs], [0, 1], CLAMP));
  // panel: the trailing edge runs the same curve 20% of the wipe behind the leading
  // one, so mid-wipe the red band is ~half the frame: a panel crossing, not a flash
  // to red. plain: one edge, the full wipe (lead = trail, no band).
  const lead = base ? 1 : panel ? EASE(clamp01(raw / 0.8)) : EASE(raw);
  const trail = base ? 1 : panel ? EASE(clamp01((raw - 0.2) / 0.8)) : lead;
  return (
    <WorldContext.Provider value={bg}>
      <AbsoluteFill style={{ clipPath: lead >= 1 ? undefined : wipeClip(lead, dir) }}>
        {panel && trail < 1 ? <AbsoluteFill style={{ backgroundColor: COLORS.accent }} /> : null}
        <AbsoluteFill style={{ clipPath: trail >= 1 ? undefined : wipeClip(trail, dir) }}>
          <Ground bg={bg} sinceMs={Math.max(0, fromMs)} lineArt={lineArt} />
          {children}
        </AbsoluteFill>
      </AbsoluteFill>
    </WorldContext.Provider>
  );
};

/**
 * Two red worlds back to back: any wipe between them is red on red (it vanishes, the
 * 2026-07-24 twin-world failure) and two punches in a row dull the red. Never right,
 * so it fails loudly in the Studio. Fix: merge them into ONE red World, or put ink or
 * the white card between them. (RETROSPECTIVE 2026-09-22 · brand-library §5)
 */
const assertNoTwinRed = (worlds: WorldDef[]) => {
  const w = [...worlds].sort((a, b) => a.fromMs - b.fromMs);
  for (let i = 1; i < w.length; i++) {
    if (w[i].bg === "red" && w[i - 1].bg === "red") {
      throw new Error(
        `Two red worlds back to back (fromMs ${w[i - 1].fromMs} then ${w[i].fromMs}): the wipe between them is invisible. ` +
          `Merge them into one red <World>, or put ink / the white card between them. (RETROSPECTIVE 2026-09-22)`
      );
    }
  }
};

/** 0..1 — how "red world" the screen is at ms (crossfades as a wipe completes). */
const rednessAt = (worlds: WorldDef[], ms: number): number => {
  let v = worlds[0]?.bg === "red" ? 1 : 0;
  for (const w of worlds.slice(1)) {
    const t = clamp01(interpolate(ms, [w.fromMs + 250, w.fromMs + 520], [0, 1], CLAMP));
    v = v + ((w.bg === "red" ? 1 : 0) - v) * t;
  }
  return v;
};

/**
 * The persistent chrome — the carousel FOOTER translated to motion: the lockup on
 * the left, the section as "02. Title ▶" on the right (the "Swipe next ▶" slot),
 * any running tally between. Horizontal: a band along the BOTTOM. Vertical: along
 * the TOP (the bottom of a reel is platform UI). Geometry: `LAYOUT.chrome`.
 *
 *  variant "bar"  (default) — p2-content's full-bleed RED footer bar, white type +
 *                             white lockup. In a red world the bar dissolves into
 *                             the ground and a white hairline takes over (p1-cover).
 *  variant "rule"           — p1-content's footer: no fill, a 1px red rule, red
 *                             lockup + red label on black (white in a red world).
 *
 * Fully parameterized: pass the brand name, the running tally chips, the section
 * list, and the world list. API is backward-compatible with the Direction A frame.
 */
export const BroadcastFrame: React.FC<{
  brand: string;
  kicker?: string;
  date?: string;
  /**
   * The running chip. `items` is a STATIC set of chips (the original behaviour).
   * `steps` is a RUNNING counter: the latest step whose `fromMs` has passed is the
   * one shown, so the chip can advance across a section ("1/3" → "2/3" → "3/3")
   * instead of sitting still. If both are given, `steps` wins.
   * (added BioIntel IPO-week long-form, 2026-08-14)
   */
  tally?: { items?: string[]; steps?: { label: string; fromMs: number }[]; fromMs: number; untilMs?: number };
  sections: SectionDef[];
  worlds: WorldDef[];
  /**
   * "bar"  — the red footer/header bar with lockup + tally + "02. Title ▶" (default)
   * "rule" — the hairline footer (red lockup, red rule, no fill)
   * "mark" — JUST the lockup, CENTRED on the band, no fill, no rule, no tally and
   *          no section label. Red on black, flipping to white in a red world (a
   *          red logo on the red panel is invisible). Nel, 2026-09-23.
   */
  variant?: "bar" | "rule" | "mark";
  /** fade the chrome in at / out at — e.g. retire it under a CTA that carries its own lockup */
  fromMs?: number;
  untilMs?: number;
}> = ({ brand, kicker = "", date = "", tally, sections, worlds, variant = "bar", fromMs, untilMs }) => {
  assertNoTwinRed(worlds);
  const ms = useMs();
  const red = rednessAt(worlds, ms);
  const bar = variant === "bar";
  const { edge, h, pad } = LAYOUT.chrome;
  const vis =
    (fromMs != null ? clamp01(interpolate(ms, [fromMs, fromMs + 400], [0, 1], CLAMP)) : 1) *
    (untilMs != null ? clamp01(interpolate(ms, [untilMs, untilMs + 400], [1, 0], CLAMP)) : 1);

  // A running counter that outlives the thing it counts reads as stale furniture
  // — `untilMs` retires it once the piece moves past that subject.
  const tallyOp = tally
    ? clamp01(interpolate(ms, [tally.fromMs, tally.fromMs + 500], [0, 1], CLAMP)) *
      (tally.untilMs != null ? clamp01(interpolate(ms, [tally.untilMs, tally.untilMs + 500], [1, 0], CLAMP)) : 1)
    : 0;
  const sec = [...sections].reverse().find((s) => ms >= s.startMs) ?? sections[0];
  const step = tally?.steps ? [...tally.steps].reverse().find((s) => ms >= s.fromMs) : undefined;
  const chips = tally?.steps ? (step ? [step.label] : []) : tally?.items ?? [];

  // type colours: white on the bar / the red world; brand red for the rule variant on black
  const fg = bar ? COLORS.paper : interpolateColors(red, [0, 1], [COLORS.accent, COLORS.paper]);
  const soft = bar ? "rgba(255,255,255,0.78)" : interpolateColors(red, [0, 1], [COLORS.accent, "rgba(255,255,255,0.78)"]);
  const hairline = bar ? "rgba(255,255,255,0.76)" : interpolateColors(red, [0, 1], [COLORS.accent, "rgba(255,255,255,0.76)"]);
  const hairOp = bar ? red : 1;
  const size = V ? 24 : 27;
  const label: React.CSSProperties = { fontFamily: SANS, fontWeight: 700, fontSize: size, letterSpacing: TRACK.nav, lineHeight: 1, whiteSpace: "nowrap" };
  const lockH = V ? 46 : 50;
  const nn = String((sec?.index ?? 0) + 1).padStart(2, "0");

  // ── "mark": the lockup alone, centred on the band ───────────────────────
  // No fill, no hairline, no tally, no section label. The two tones are stacked
  // and cross-faded on `red` rather than switched, so a world wipe carries the
  // logo across with it instead of popping mid-wipe.
  if (variant === "mark") {
    return (
      <AbsoluteFill style={{ pointerEvents: "none", opacity: vis }}>
        <div
          style={{
            position: "absolute", left: 0, right: 0, height: h,
            ...(edge === "top" ? { top: 0 } : { bottom: 0 }),
            display: "flex", alignItems: "center", justifyContent: "center",
          }}
        >
          <div style={{ position: "relative" }}>
            <div style={{ opacity: 1 - red }}><Wordmark size={lockH} mark="wordmark" /></div>
            <div style={{ position: "absolute", left: 0, top: 0, opacity: red }}>
              <Wordmark size={lockH} mark="wordmark" tone="white" />
            </div>
          </div>
        </div>
      </AbsoluteFill>
    );
  }

  return (
    <AbsoluteFill style={{ pointerEvents: "none", opacity: vis }}>
      <div
        style={{
          position: "absolute", left: 0, right: 0, height: h,
          ...(edge === "top" ? { top: 0 } : { bottom: 0 }),
          background: bar ? COLORS.accent : "transparent",
          display: "flex", alignItems: "center", gap: V ? 18 : 26, padding: `0 ${pad}px`,
        }}
      >
        {/* the lockup — white on the bar; red on black (rule), crossfading to white in a red world */}
        {bar ? (
          <Wordmark size={lockH} mark="wordmark" tone="white" />
        ) : (
          <div style={{ position: "relative" }}>
            <div style={{ opacity: 1 - red }}><Wordmark size={lockH} mark="wordmark" /></div>
            <div style={{ position: "absolute", left: 0, top: 0, opacity: red }}><Wordmark size={lockH} mark="wordmark" tone="white" /></div>
          </div>
        )}
        {!V && (kicker || date) ? (
          <>
            <div style={{ width: 1, height: 32, background: soft, opacity: 0.6, marginLeft: 6 }} />
            <span style={{ ...label, fontWeight: 400, color: soft }}>{[kicker, date].filter(Boolean).join(" · ")}</span>
          </>
        ) : null}
        <div style={{ flex: 1 }} />
        {tally && chips.length ? (
          <div style={{ display: "flex", alignItems: "center", gap: 14, opacity: tallyOp, marginRight: V ? 4 : 18 }}>
            {chips.map((it, i) => (
              <React.Fragment key={i}>
                {i > 0 ? <span style={{ width: 5, height: 5, borderRadius: 5, background: soft }} /> : null}
                <span style={{ ...label, fontWeight: 400, fontSize: size - 3, color: soft }}>{it}</span>
              </React.Fragment>
            ))}
          </div>
        ) : null}
        {sec ? (
          <div style={{ display: "flex", alignItems: "center", gap: V ? 10 : 12, color: fg, maxWidth: V ? 560 : 900 }}>
            <span style={{ ...label, color: soft }}>{nn}.</span>
            <span style={{ ...label, color: fg, overflow: "hidden", textOverflow: "ellipsis" }}>{sec.title}</span>
            <NavArrow size={V ? 24 : 27} color={fg} />
          </div>
        ) : null}
      </div>
      {/* the hairline: bar variant → only in a red world (p1-cover); rule variant → always (p1-content) */}
      <div
        style={{
          position: "absolute", left: pad, right: pad, height: 1, background: hairline, opacity: hairOp,
          ...(edge === "top" ? { top: h } : { bottom: h }),
        }}
      />
      {/* keep `brand` in the contract (a11y/debug); the lockup SVG carries the visible name */}
      <span style={{ display: "none" }}>{brand}</span>
    </AbsoluteFill>
  );
};
