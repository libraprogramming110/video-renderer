// ─────────────────────────────────────────────────────────────────────────
// KIT · tally — two blocks for the shape "here are the numbers … here is the
// thing they belong to", built for the Vykat XR safety long-form (2026-08-14).
//
//   TallyDock  — N figures count up as full-screen HEROES, then physically
//                TRAVEL into a compact header row (dock/travel one element,
//                never crossfade two) so the subject can resolve beneath them.
//   SoleOption — a track of ghost cells where exactly ONE ever fills. Enacts
//                "the only approved X" as an asymmetry instead of typesetting
//                the sentence. The empty cells carry NO labels on purpose:
//                they read as absence, not as named alternatives that exist.
//
// Both are brand-agnostic and cue-driven — no milliseconds baked in.
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { CLAMP, clamp01, caps, COLORS, CountUp, cue, DISPLAY, INK_SUB, inkA, SANS, TRACK, useMs, usePop, useStamp } from "./core";
import { FORMAT, TYPE } from "../style";

const V = FORMAT.key === "vertical";

type Win = { from: number; to: number };

// The geometry of the hero→docked journey, per canvas. Everything the figures
// interpolate lives here so the two states stay legible independently: the
// figure SCALES down hard, the label barely does (a label scaled by the same
// factor as a 300px number is unreadable at the dock).
const GEO = V
  ? { heroTop: 540, heroGap: 520, dockTop: 292, figHero: 300, figDock: 108, labHero: 30, labDock: 17, ruleHero: 300, ruleDock: 132, boxHero: 900, boxDock: 500 }
  : { heroTop: 250, heroGap: 380, dockTop: 150, figHero: 240, figDock: 84, labHero: 26, labDock: 15, ruleHero: 260, ruleDock: 110, boxHero: 900, boxDock: 520 };

/**
 * Exported so a LATER beat can restate the same figures in the exact docked
 * position and size — a callback only reads as the same object if it lands
 * where the object was left. Import this rather than re-typing the numbers.
 */
export const TALLY_DOCK_GEO = GEO;

export type TallyFigure = {
  value: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  label: string;
  /** the spoken word the count-up starts on */
  word: string;
  /** ms the count-up runs (default 900) */
  countMs?: number;
};

const Figure: React.FC<{
  fig: TallyFigure;
  index: number;
  count: number;
  from: number;
  dockMs: number;
  dockDurMs: number;
  fg: string;
  sub: string;
  rule: string;
}> = ({ fig, index, count, from, dockMs, dockDurMs, fg, sub, rule }) => {
  const ms = useMs();
  const d = clamp01(
    interpolate(ms, [dockMs, dockMs + dockDurMs], [0, 1], { ...CLAMP, easing: Easing.inOut(Easing.cubic) })
  );
  const onset = cue(fig.word, from + 400 + index * 2000, from);
  const countMs = fig.countMs ?? 900;

  const top = interpolate(d, [0, 1], [GEO.heroTop + index * GEO.heroGap, GEO.dockTop]);
  const leftPct = interpolate(d, [0, 1], [50, ((index + 0.5) / count) * 100]);
  const figSize = interpolate(d, [0, 1], [GEO.figHero, GEO.figDock]);
  const labSize = interpolate(d, [0, 1], [GEO.labHero, GEO.labDock]);
  const ruleW = interpolate(d, [0, 1], [GEO.ruleHero, GEO.ruleDock]);
  const boxW = interpolate(d, [0, 1], [GEO.boxHero, GEO.boxDock]);
  const gap = interpolate(d, [0, 1], [18, 10]);

  const lbl = usePop(onset + countMs * 0.5, { rise: 12 });
  // The rule DRAWS IN as its own figure lands. It used to render unconditionally,
  // so figure 2's hairline sat alone on an empty screen from frame 0 — an element
  // on screen before its cue (Nel caught it on the chunk-1 gate, 2026-08-14).
  const ruleIn = clamp01(interpolate(ms, [onset + countMs * 0.3, onset + countMs * 0.95], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) }));

  return (
    <div
      style={{
        position: "absolute",
        top,
        left: `${leftPct}%`,
        width: boxW,
        transform: "translateX(-50%)",
        textAlign: "center",
      }}
    >
      <CountUp
        fromMs={onset}
        toMs={onset + countMs}
        value={fig.value}
        decimals={fig.decimals ?? 0}
        prefix={fig.prefix}
        suffix={fig.suffix}
        style={{
          fontFamily: DISPLAY,
          fontWeight: 700,
          fontSize: figSize,
          letterSpacing: TRACK.display,
          color: fg,
          lineHeight: 0.92,
        }}
      />
      <div style={{ height: 3, width: ruleW * ruleIn, background: rule, opacity: ruleIn, margin: `${gap}px auto ${gap * 0.7}px` }} />
      <div style={{ ...lbl }}>
        <div style={caps(sub, labSize)}>{fig.label}</div>
      </div>
    </div>
  );
};

/**
 * N figures that land as heroes and then dock into a header row on `dockCue`.
 * The SAME elements travel — nothing crossfades — so the eye keeps hold of the
 * numbers while the screen reorganises around them.
 */
export const TallyDock: React.FC<Win & {
  figures: TallyFigure[];
  /** the spoken word the whole tally travels on */
  dockCue: string;
  dockDurMs?: number;
  bg?: "ink" | "paper";
  /** hairline drawn under the docked row once it settles */
  underline?: boolean;
}> = ({ from, to, figures, dockCue, dockDurMs = 780, bg = "ink", underline = true }) => {
  const ms = useMs();
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const sub = bg === "ink" ? INK_SUB : COLORS.grayText;
  const rule = bg === "ink" ? "rgba(255,255,255,0.24)" : COLORS.border;
  // Held to `to + 150` on purpose: the world wipe that follows does the covering,
  // so the tally never dims while its own payoff word is still being spoken.
  const vis = clamp01(interpolate(ms, [from, from + 300, to + 150, to + 450], [0, 1, 1, 0], CLAMP));
  const dockMs = cue(dockCue, from + 5000, from);
  const under = clamp01(interpolate(ms, [dockMs + dockDurMs * 0.7, dockMs + dockDurMs + 320], [0, 1], CLAMP));

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {figures.map((f, i) => (
        <Figure key={i} fig={f} index={i} count={figures.length} from={from} dockMs={dockMs} dockDurMs={dockDurMs} fg={fg} sub={sub} rule={rule} />
      ))}
      {underline ? (
        <div
          style={{
            position: "absolute",
            top: GEO.dockTop + (V ? 210 : 160),
            left: "50%",
            width: (V ? 940 : 1400) * under,
            height: 2,
            background: rule,
            transform: "translateX(-50%)",
          }}
        />
      ) : null}
    </AbsoluteFill>
  );
};

// ── SoleOption ───────────────────────────────────────────────────────────────

const Cell: React.FC<{
  index: number;
  filled: boolean;
  appearMs: number;
  fillMs: number;
  w: number;
  h: number;
  fg: string;
  ghost: string;
}> = ({ index, filled, appearMs, fillMs, w, h, fg, ghost }) => {
  const ms = useMs();
  const a = clamp01(interpolate(ms, [appearMs + index * 55, appearMs + index * 55 + 300], [0, 1], CLAMP));
  const f = filled ? clamp01(interpolate(ms, [fillMs, fillMs + 340], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) })) : 0;
  return (
    <div
      style={{
        width: w,
        height: h,
        borderRadius: 4,
        border: `2px ${filled ? "solid" : "dashed"} ${filled ? `rgba(0,0,0,0)` : ghost}`,
        background: filled ? fg : "transparent",
        opacity: a,
        transform: `translateY(${interpolate(a, [0, 1], [10, 0], CLAMP)}px) scaleY(${filled ? interpolate(f, [0, 1], [0.62, 1], CLAMP) : 1})`,
        transformOrigin: "bottom center",
        // the filled cell is only really "there" once its fill lands
        boxShadow: filled ? `inset 0 0 0 2px ${ghost}` : "none",
        filter: filled && f < 0.05 ? "opacity(0.25)" : "none",
      }}
    />
  );
};

// one cued fragment of the indication line (own component — hooks can't run in a .map)
const IndicationPart: React.FC<{
  part: { part: string; cue: string; dim?: boolean };
  from: number;
  fg: string;
  sub: string;
}> = ({ part, from, fg, sub }) => {
  const p = usePop(cue(part.cue, from + 5000, from), { rise: 14 });
  return (
    <span
      style={{
        ...p,
        display: "inline-block",
        fontFamily: DISPLAY,
        fontWeight: part.dim ? 400 : 600,
        fontSize: V ? 56 : 48,
        letterSpacing: TRACK.headline,
        color: part.dim ? sub : fg,
      }}
    >
      {part.part}
    </span>
  );
};

/**
 * "The only approved X" — a track of `cells` ghost outlines where exactly one
 * fills solid. The asymmetry does the talking; the empty cells are deliberately
 * unlabelled so they read as ABSENCE, not as specific alternatives.
 */
export const SoleOption: React.FC<Win & {
  /** small caps line above the subject (e.g. the sponsor) */
  kicker: string;
  kickerCue: string;
  /** the subject itself — stamps hard on its word */
  subject: string;
  subjectCue: string;
  /** caps label sitting above the track */
  trackLabel: string;
  /** the word the ghost track appears on */
  appearCue: string;
  /** the word the single cell fills on */
  fillCue: string;
  /** caps tag under the filled cell */
  fillTag?: string;
  cells?: number;
  /**
   * The qualifying line under the track, revealed INLINE in cued parts so the
   * phrase completes as it is spoken. Inline, not stacked: a fragment on its
   * own line ("for") reads as typesetting the sentence rather than letting the
   * graphic carry it.
   */
  indication?: { part: string; cue: string; dim?: boolean }[];
  bg?: "ink" | "paper";
  /** push the whole group down (to clear a docked tally) */
  top?: number;
}> = ({
  from, to, kicker, kickerCue, subject, subjectCue, trackLabel, appearCue, fillCue,
  fillTag = "Approved", cells = 8, indication, bg = "ink", top,
}) => {
  const ms = useMs();
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const sub = bg === "ink" ? INK_SUB : COLORS.grayText;
  const ghost = bg === "ink" ? "rgba(255,255,255,0.26)" : inkA(0.22);
  const vis = clamp01(interpolate(ms, [from, from + 300, to + 150, to + 450], [0, 1, 1, 0], CLAMP));

  const kOn = cue(kickerCue, from + 500, from);
  const sOn = cue(subjectCue, from + 1200, from);
  const appearMs = cue(appearCue, from + 2500, from);
  const fillMs = cue(fillCue, from + 3000, from);

  const k = usePop(kOn, { rise: 14 });
  const stamp = useStamp(sOn, { from: 1.1 });
  const tl = usePop(appearMs - 150, { rise: 10 });
  const tag = usePop(fillMs + 220, { rise: 10 });

  const trackW = V ? 940 : 1320;
  const gap = 12;
  const cw = (trackW - gap * (cells - 1)) / cells;
  const ch = V ? 104 : 88;

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <div
        style={{
          position: "absolute",
          top: top ?? (V ? 600 : 380),
          left: "50%",
          transform: "translateX(-50%)",
          width: trackW,
          textAlign: "center",
        }}
      >
        <div style={k}>
          <div style={caps(sub)}>{kicker}</div>
        </div>

        <div style={{ ...stamp, marginTop: V ? 16 : 12 }}>
          <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: V ? 148 : 116, letterSpacing: TRACK.display, color: fg, lineHeight: 0.98 }}>
            {subject}
          </div>
        </div>

        <div style={{ ...tl, marginTop: V ? 74 : 52 }}>
          <div style={caps(sub, TYPE.labelSm)}>{trackLabel}</div>
        </div>

        <div style={{ display: "flex", gap, marginTop: 20, justifyContent: "center" }}>
          {Array.from({ length: cells }).map((_, i) => (
            <Cell key={i} index={i} filled={i === 0} appearMs={appearMs} fillMs={fillMs} w={cw} h={ch} fg={fg} ghost={ghost} />
          ))}
        </div>

        <div style={{ display: "flex", marginTop: 14 }}>
          <div style={{ width: cw, textAlign: "center", ...tag }}>
            <div style={caps(fg, TYPE.labelSm)}>{fillTag}</div>
          </div>
        </div>

        {indication?.length ? (
          <div style={{ marginTop: V ? 66 : 46, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "0 14px" }}>
            {indication.map((p, i) => (
              <IndicationPart key={i} part={p} from={from} fg={fg} sub={sub} />
            ))}
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};
