// ─────────────────────────────────────────────────────────────────────────
// KIT · myeloma — the "a class that did not exist" set, built for the
// Zenbexus accelerated-approval long-form (2026-08-15).
//
//   ClassFirst  — a hook figure holds NAKED, docks, and the approval resolves
//                 beneath it; then a class rail sits COMPLETELY EMPTY and one
//                 marker seats at its right end. The emptiness is the word
//                 "first" — the rail carries no ticks and no denominator, so
//                 it never implies how many chances there were.
//   DepthSplit  — two arms of a trial as two 100-mark fields. A proportion is
//                 a PROPORTION, so it is marks, not a second hero count-up
//                 (the 07-21 twinning rule). The already-landed figure TRAVELS
//                 in from its docked seat rather than counting a second time;
//                 only the genuinely new figure counts.
//
// Both are portrait-first, bg-aware, monochrome and cue-driven.
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { CLAMP, clamp01, caps, COLORS, CountUp, cue, DISPLAY, INK_SUB, inkA, TRACK, useMs, usePop, useStamp } from "./core";
import { FORMAT, TYPE } from "../style";

const V = FORMAT.key === "vertical";

type Win = { from: number; to: number };

/**
 * The seat the hook figure docks into. Exported so a LATER section can bring the
 * same figure back at the identical position + size — a callback only reads as
 * the same object if it lands where the object was left (the `OnlyOneCounts`
 * rule, 08-07). `DepthSplit.held` reads these directly.
 */
export const CLASS_DOCK = V
  ? { top: 230, size: 128, ruleTop: 392, ruleW: 300 }
  : { top: 140, size: 92, ruleTop: 250, ruleW: 220 };

// ── ClassFirst ───────────────────────────────────────────────────────────────

export const ClassFirst: React.FC<Win & {
  /** the hook figure, spoken bare before it has any referent */
  figure: string;
  /** ms the figure holds alone, centre-frame, before docking */
  dockCue: string;
  dockDurMs?: number;
  /** the sponsor, as a caps kicker */
  sponsor: string;
  sponsorCue: string;
  /** the regulator line + the badge it stamps */
  agency: string;
  agencyCue: string;
  badge: string;
  badgeCue: string;
  /** the drug — stamps hard */
  subject: string;
  subjectCue: string;
  /** the class rail: a track with NO prior entries */
  rail: {
    label: string;
    labelCue: string;
    /** the word the empty rail draws on */
    drawCue: string;
    /** the word the single marker seats on */
    markCue: string;
    markTag: string;
  };
  bg?: "ink" | "paper";
}> = ({
  from, to, figure, dockCue, dockDurMs = 560, sponsor, sponsorCue, agency, agencyCue,
  badge, badgeCue, subject, subjectCue, rail, bg = "ink",
}) => {
  const ms = useMs();
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const sub = bg === "ink" ? INK_SUB : COLORS.grayText;
  const ruleC = bg === "ink" ? "rgba(255,255,255,0.24)" : COLORS.border;
  const ghost = bg === "ink" ? "rgba(255,255,255,0.20)" : inkA(0.18);
  const vis = clamp01(interpolate(ms, [from, from + 260, to + 150, to + 450], [0, 1, 1, 0], CLAMP));

  const dockMs = cue(dockCue, from + 2200, from);
  const d = clamp01(interpolate(ms, [dockMs, dockMs + dockDurMs], [0, 1], { ...CLAMP, easing: Easing.inOut(Easing.cubic) }));

  // hero (centre-frame, monumental) → docked seat. ONE element travelling.
  const figTop = interpolate(d, [0, 1], [V ? 800 : 430, CLASS_DOCK.top]);
  const figSize = interpolate(d, [0, 1], [V ? 340 : 240, CLASS_DOCK.size]);

  const spOn = cue(sponsorCue, from + 2600, from);
  const agOn = cue(agencyCue, from + 3600, from);
  const bdOn = cue(badgeCue, from + 4400, from);
  const sbOn = cue(subjectCue, from + 5200, from);
  const rlOn = cue(rail.labelCue, from + 6800, from);
  const drawOn = cue(rail.drawCue, from + 6400, from);
  const markOn = cue(rail.markCue, from + 8000, from);

  const sp = usePop(spOn, { rise: 14 });
  const ag = usePop(agOn, { rise: 14 });
  const bd = useStamp(bdOn, { from: 1.12 });
  const sb = useStamp(sbOn, { from: 1.1 });
  const rl = usePop(rlOn, { rise: 12 });

  // The docked hairline only draws once the figure has actually arrived — it must
  // not sit under a figure that is still centre-frame.
  const ruleIn = clamp01(interpolate(ms, [dockMs + dockDurMs * 0.6, dockMs + dockDurMs + 260], [0, 1], CLAMP));

  const railW = V ? 900 : 1200;
  const railDraw = clamp01(interpolate(ms, [drawOn, drawOn + 620], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) }));
  // the marker DROPS onto the right end of the rail and settles
  const mk = clamp01(interpolate(ms, [markOn, markOn + 380], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) }));
  const mkTag = usePop(markOn + 240, { rise: 10 });

  const railTop = V ? 1200 : 760;
  const markSize = V ? 34 : 26;

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {/* the hook figure — holds alone, then travels to its seat */}
      <div style={{ position: "absolute", top: figTop, left: 0, width: "100%", textAlign: "center" }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: figSize, letterSpacing: TRACK.display, color: fg, lineHeight: 0.92 }}>
          {figure}
        </div>
      </div>
      <div
        style={{
          position: "absolute",
          top: CLASS_DOCK.ruleTop,
          left: "50%",
          width: CLASS_DOCK.ruleW * ruleIn,
          height: 3,
          background: ruleC,
          opacity: ruleIn,
          transform: "translateX(-50%)",
        }}
      />

      {/* The approval resolves beneath, top-to-bottom in SPOKEN order.
          ⚠️ This group's top is set by the DOCK TRAVEL, not by taste: the figure
          shrinks 340→128 while rising 800→230, and its bottom edge only clears
          560px at ~0.72 of the travel. With dockDurMs 560 that lands 70ms before
          the sponsor's own cue, so the big figure never slides over the kicker.
          Raise this group or lengthen the dock and they collide mid-travel —
          invisible while scrubbing, obvious in motion. */}
      <div style={{ position: "absolute", top: V ? 560 : 340, left: 0, width: "100%", textAlign: "center" }}>
        <div style={sp}>
          <div style={caps(sub)}>{sponsor}</div>
        </div>

        <div style={{ ...ag, marginTop: V ? 40 : 26 }}>
          <div style={caps(sub, TYPE.labelSm)}>{agency}</div>
        </div>

        <div style={{ ...bd, marginTop: V ? 18 : 12, display: "flex", justifyContent: "center" }}>
          <div
            style={{
              border: `3px solid ${fg}`,
              borderRadius: 6,
              padding: V ? "18px 34px" : "13px 26px",
              ...caps(fg),
            }}
          >
            {badge}
          </div>
        </div>

        <div style={{ ...sb, marginTop: V ? 78 : 48 }}>
          <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: V ? 156 : 112, letterSpacing: TRACK.display, color: fg, lineHeight: 0.98 }}>
            {subject}
          </div>
        </div>
      </div>

      {/* the class rail — EMPTY, no ticks, no denominator. One marker at the end. */}
      <div style={{ position: "absolute", top: railTop, left: "50%", width: railW, transform: "translateX(-50%)" }}>
        <div style={{ ...rl, textAlign: "center" }}>
          <div style={caps(sub, TYPE.labelSm)}>{rail.label}</div>
        </div>

        <div style={{ position: "relative", marginTop: V ? 54 : 36, height: markSize * 2 }}>
          <div
            style={{
              position: "absolute",
              top: markSize - 1,
              left: 0,
              width: railW * railDraw,
              height: 2,
              background: ghost,
            }}
          />
          <div
            style={{
              position: "absolute",
              top: markSize / 2,
              left: railW - markSize / 2,
              width: markSize,
              height: markSize,
              background: fg,
              borderRadius: 3,
              opacity: mk,
              transform: `translateY(${interpolate(mk, [0, 1], [-26, 0], CLAMP)}px)`,
            }}
          />
        </div>

        {/* right-aligned to the rail's end, where the marker sits — a centred tag
            under a marker at x=railW would overhang the frame's right padding. */}
        <div style={{ ...mkTag, marginTop: V ? 10 : 6, textAlign: "right" }}>
          <div style={caps(fg, TYPE.labelSm)}>{rail.markTag}</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── ConditionalLabel ─────────────────────────────────────────────────────────

/**
 * An approval that RESTS ON something that has not happened yet.
 *
 * The graphic is a solid, granted badge sitting on legs that come down into a
 * DASHED, EMPTY slot which never fills. Accelerated approval is conditional by
 * construction, and the honest picture of a condition is a load-bearing gap.
 *
 * ⚠️ Reveal order follows the VOICE, not the structure: scripts name the thing
 * to watch before they name what depends on it, so the empty slot draws FIRST
 * and the badge lands above it afterwards (the EndpointSwitch rule, 08-07).
 *
 * ⚠️ Legible frozen (08-14): the meaning is a static relationship — solid mass,
 * empty support — not a motion. It still reads once every animation has ended.
 * The slot carries only the NAME of what is missing; no "pending" verdict, no
 * date, no outcome, because the script states none of those.
 */
export const ConditionalLabel: React.FC<Win & {
  kicker: string;
  kickerCue: string;
  /** the granted thing — solid, bordered, unambiguous */
  badge: string;
  badgeCue: string;
  /** the unmet condition — dashed, empty, never filled */
  slot: string;
  slotCue: string;
  /** the word the legs draw on */
  dependsCue: string;
  bg?: "ink" | "paper";
}> = ({ from, to, kicker, kickerCue, badge, badgeCue, slot, slotCue, dependsCue, bg = "paper" }) => {
  const ms = useMs();
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const sub = bg === "ink" ? INK_SUB : COLORS.grayText;
  const ghost = bg === "ink" ? "rgba(255,255,255,0.30)" : inkA(0.26);
  const vis = clamp01(interpolate(ms, [from, from + 260, to + 150, to + 450], [0, 1, 1, 0], CLAMP));

  const kOn = cue(kickerCue, from + 200, from);
  const sOn = cue(slotCue, from + 1200, from);
  const bOn = cue(badgeCue, from + 2700, from);
  const dOn = cue(dependsCue, from + 4000, from);

  const k = usePop(kOn, { rise: 12 });
  const bd = useStamp(bOn, { from: 1.1 });
  const sl = clamp01(interpolate(ms, [sOn, sOn + 520], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) }));
  const legs = clamp01(interpolate(ms, [dOn, dOn + 520], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) }));

  const W = V ? 760 : 620;
  const L = (FORMAT.width - W) / 2;
  const badgeTop = V ? 600 : 360;
  const badgeH = V ? 190 : 130;
  const slotTop = V ? 1090 : 660;
  const slotH = V ? 330 : 210;

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <div style={{ position: "absolute", top: V ? 460 : 280, left: 0, width: "100%", textAlign: "center", ...k }}>
        <div style={caps(sub)}>{kicker}</div>
      </div>

      {/* the granted approval — solid, and it lands SECOND */}
      <div
        style={{
          position: "absolute", left: L, top: badgeTop, width: W, height: badgeH,
          border: `3px solid ${fg}`, borderRadius: 6,
          display: "flex", alignItems: "center", justifyContent: "center", ...bd,
        }}
      >
        <div style={caps(fg)}>{badge}</div>
      </div>

      {/* the legs — the dependency, drawn downward into nothing */}
      {[-1, 1].map((s, i) => (
        <div
          key={i}
          style={{
            position: "absolute", left: FORMAT.width / 2 + s * (V ? 150 : 120) - 1,
            top: badgeTop + badgeH,
            width: 2, height: (slotTop - (badgeTop + badgeH)) * legs, background: ghost,
          }}
        />
      ))}

      {/* the unmet condition — dashed, and it never fills */}
      <div
        style={{
          position: "absolute", left: L, top: slotTop, width: W, height: slotH,
          border: `2px dashed ${ghost}`, borderRadius: 6,
          display: "flex", alignItems: "center", justifyContent: "center",
          opacity: sl, transform: `scaleY(${interpolate(sl, [0, 1], [0.82, 1], CLAMP)})`,
        }}
      >
        <div style={caps(sub)}>{slot}</div>
      </div>
    </AbsoluteFill>
  );
};

// ── DepthSplit ───────────────────────────────────────────────────────────────

const COLS = 20;
const ROWS = 5;

/** One 100-mark field. Pure — the parent reads `useMs()` once and passes it down. */
const MarkField: React.FC<{
  ms: number;
  lit: number;
  appearMs: number;
  lightMs: number;
  lightDurMs: number;
  width: number;
  fg: string;
  ghost: string;
}> = ({ ms, lit, appearMs, lightMs, lightDurMs, width, fg, ghost }) => {
  const gap = V ? 8 : 6;
  const cw = (width - gap * (COLS - 1)) / COLS;
  const step = lit > 0 ? lightDurMs / lit : 0;
  const appear = clamp01(interpolate(ms, [appearMs, appearMs + 360], [0, 1], CLAMP));

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap, width, opacity: appear }}>
      {Array.from({ length: COLS * ROWS }).map((_, i) => {
        const on = i < lit;
        const t = on ? clamp01(interpolate(ms, [lightMs + i * step, lightMs + i * step + 200], [0, 1], CLAMP)) : 0;
        return (
          <div
            key={i}
            style={{
              width: cw,
              height: cw,
              borderRadius: 2,
              border: `2px solid ${ghost}`,
              background: on ? fg : "transparent",
              opacity: on ? interpolate(t, [0, 1], [0.18, 1], CLAMP) : 1,
              transform: `scale(${on ? interpolate(t, [0, 1], [0.7, 1], CLAMP) : 1})`,
            }}
          />
        );
      })}
    </div>
  );
};

export type DepthArm = {
  /** whole-number percent — marks are integers, you cannot light a fifth of one */
  percent: number;
  name: string;
  nameCue: string;
  detail: string;
  /** the word the field lights on */
  lightCue: string;
  /** the word the field's outlines appear on (defaults to lightCue) */
  appearCue?: string;
  /** count the figure up? false = it TRAVELS in already-landed (no twinning) */
  count: boolean;
};

/**
 * Two trial arms as two 100-mark fields. The gap between the lit blocks is the
 * argument; no delta figure is printed because the script never states one.
 */
export const DepthSplit: React.FC<Win & {
  kicker: string;
  kickerCue: string;
  arms: [DepthArm, DepthArm];
  /**
   * The already-landed figure returning from its docked seat (CLASS_DOCK) and
   * travelling into arm 0's row. Omit and arm 0 simply counts up.
   */
  held?: { text: string; travelCue: string; travelDurMs?: number };
  bg?: "ink" | "paper";
}> = ({ from, to, kicker, kickerCue, arms, held, bg = "paper" }) => {
  const ms = useMs();
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const sub = bg === "ink" ? INK_SUB : COLORS.grayText;
  const ghost = bg === "ink" ? "rgba(255,255,255,0.20)" : inkA(0.16);
  const vis = clamp01(interpolate(ms, [from, from + 260, to + 150, to + 450], [0, 1, 1, 0], CLAMP));

  const width = V ? 900 : 1200;
  const kOn = cue(kickerCue, from + 900, from);
  const k = usePop(kOn, { rise: 12 });

  const ROW_TOP = V ? [470, 1010] : [300, 660];
  const FIG_SIZE = V ? 104 : 78;

  // the held figure's journey: docked seat → arm 0's figure slot
  const travelOn = held ? cue(held.travelCue, from + 2600, from) : 0;
  const travelDur = held?.travelDurMs ?? 700;
  const tv = held ? clamp01(interpolate(ms, [travelOn, travelOn + travelDur], [0, 1], { ...CLAMP, easing: Easing.inOut(Easing.cubic) })) : 0;
  // Absolute px + a translate PERCENTAGE, never a `calc()` switched by a ternary on
  // the interpolated value — that only applies its offset on the final frame and
  // the figure visibly jumps at the end of its travel.
  const PAD = V ? 90 : 360;
  // land so the figure's BOTTOM matches the row's flex-end baseline (lineHeight 0.92)
  const heldTop = interpolate(tv, [0, 1], [CLASS_DOCK.top, ROW_TOP[0] + FIG_SIZE * 0.08]);
  const heldSize = interpolate(tv, [0, 1], [CLASS_DOCK.size, FIG_SIZE]);
  const heldLeft = interpolate(tv, [0, 1], [FORMAT.width / 2, PAD]);
  const heldShiftX = interpolate(tv, [0, 1], [-50, 0]); // % of own width

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {/* ⚠️ ABOVE the dock seat, not below it. The held figure occupies 230–348
          and then travels DOWN-LEFT into arm 0; a kicker anywhere between the
          seat and that landing sits directly in the travel path and gets swept
          by a 110px-tall glyph mid-move. Sitting above the seat, the path can
          never reach it — the figure only ever descends. */}
      <div style={{ position: "absolute", top: V ? 160 : 110, left: 0, width: "100%", textAlign: "center", ...k }}>
        <div style={caps(sub)}>{kicker}</div>
      </div>

      {arms.map((arm, ai) => {
        const lightOn = cue(arm.lightCue, from + 2600 + ai * 4600, from);
        const appearOn = cue(arm.appearCue ?? arm.lightCue, lightOn, from);
        const nameOn = cue(arm.nameCue, lightOn + 1200, from);
        return (
          <ArmRow
            key={ai}
            ms={ms}
            arm={arm}
            top={ROW_TOP[ai]}
            width={width}
            figSize={FIG_SIZE}
            lightOn={lightOn}
            appearOn={appearOn}
            nameOn={nameOn}
            fg={fg}
            sub={sub}
            ghost={ghost}
            hideFigure={ai === 0 && !!held}
          />
        );
      })}

      {held ? (
        <div
          style={{
            position: "absolute",
            top: heldTop,
            left: heldLeft,
            transform: `translateX(${heldShiftX}%)`,
          }}
        >
          <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: heldSize, letterSpacing: TRACK.display, color: fg, lineHeight: 0.92 }}>
            {held.text}
          </div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

/** One arm: figure + name/detail on a row, its 100-mark field beneath. */
const ArmRow: React.FC<{
  ms: number;
  arm: DepthArm;
  top: number;
  width: number;
  figSize: number;
  lightOn: number;
  appearOn: number;
  nameOn: number;
  fg: string;
  sub: string;
  ghost: string;
  hideFigure: boolean;
}> = ({ ms, arm, top, width, figSize, lightOn, appearOn, nameOn, fg, sub, ghost, hideFigure }) => {
  const nm = usePop(nameOn, { rise: 12 });
  const lightDur = 1100;

  return (
    <div style={{ position: "absolute", top, left: "50%", width, transform: "translateX(-50%)" }}>
      <div style={{ display: "flex", alignItems: "flex-end", gap: V ? 30 : 22, height: figSize }}>
        {hideFigure ? (
          // the slot the travelling held figure lands in — reserved, never drawn twice
          <div style={{ width: figSize * 2.1 }} />
        ) : (
          <CountUp
            fromMs={lightOn}
            toMs={lightOn + lightDur}
            value={arm.percent}
            decimals={0}
            suffix="%"
            style={{
              width: figSize * 2.1,
              fontFamily: DISPLAY,
              fontWeight: 700,
              fontSize: figSize,
              letterSpacing: TRACK.display,
              color: fg,
              lineHeight: 0.92,
            }}
          />
        )}
        <div style={{ ...nm, paddingBottom: V ? 10 : 7 }}>
          <div style={caps(fg)}>{arm.name}</div>
          <div style={{ ...caps(sub, TYPE.labelSm), marginTop: 8 }}>{arm.detail}</div>
        </div>
      </div>

      <div style={{ marginTop: V ? 40 : 26 }}>
        <MarkField
          ms={ms}
          lit={Math.round(arm.percent)}
          appearMs={appearOn}
          lightMs={lightOn}
          lightDurMs={lightDur}
          width={width}
          fg={fg}
          ghost={ghost}
        />
      </div>
    </div>
  );
};
