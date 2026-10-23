// ─────────────────────────────────────────────────────────────────────────
// KIT · ipo — blocks built for the BioIntel IPO-week long-form (2026-08-14).
//
//   • SameThenSplit — three identical things that stay identical through two
//     facts and then DIVERGE on the third. The row IS "the same week"; the
//     uniform growth IS "all three upsized"; the split IS "priced completely
//     differently". Nothing on screen has to claim any of it.
//
// The baseline it draws is deliberately the SAME instrument the §1 rails use as
// their offer line — the cold open teaches the grammar the spine then speaks.
//
// Landscape-first with portrait branches, bg-aware, monochrome (weight + dim
// only — no glyph marks, no chart colour), per the BioIntel brand rule.
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { CLAMP, clamp01, caps, COLORS, CountUp, cue, cueSeq, DISPLAY, INK_SUB, inkA, TRACK, useMs, usePop, useStamp } from "./core";
import { FORMAT, TYPE } from "../style";

const V = FORMAT.key === "vertical";

type Win = { from: number; to: number };

const useVis = (from: number, to: number, padIn = 360, padOut = 360) => {
  const ms = useMs();
  return clamp01(interpolate(ms, [from, from + padIn, to - padOut, to], [0, 1, 1, 0], CLAMP));
};

// ── SameThenSplit ─────────────────────────────────────────────────────────
export const SameThenSplit: React.FC<Win & {
  kicker?: string;
  /** how many identical marks (3 here — one per IPO) */
  count?: number;
  /**
   * Where each mark ends up after the split, as a fraction of the plot height.
   * Order is left→right and should mirror the order the piece names them in.
   * These are RELATIVE positions, not values — the block prints no figures.
   */
  spread?: number[];
  /** the caps line under the row, swapped at each phase */
  sameLabel: string;
  growLabel: string;
  splitLabel: string;
  /** cue words — all resolved with afterMs = from */
  appearCue: string;
  tieCue: string;
  growCue: string;
  splitCue: string;
  /** explicit-ms escape hatches (can LEAD the voice) */
  appearMs?: number;
  tieMs?: number;
  growMs?: number;
  splitMs?: number;
  bg?: "ink" | "paper";
}> = ({
  from, to, kicker, count = 3, spread = [0.74, 0.38, 0.05],
  sameLabel, growLabel, splitLabel,
  appearCue, tieCue, growCue, splitCue,
  appearMs, tieMs, growMs, splitMs, bg = "paper",
}) => {
  const ms = useMs();
  const vis = useVis(from, to);
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const sub = bg === "ink" ? INK_SUB : COLORS.grayText;
  const hair = bg === "ink" ? "rgba(255,255,255,0.20)" : COLORS.border;

  const k = usePop(from + 200, { rise: 14 });

  // Onsets are cue-driven but CLAMPED MONOTONIC by construction, so no derived
  // interpolate range can run backwards however a cue resolves.
  const appearOn = appearMs ?? cue(appearCue, from + 200, from);
  const tieOn = Math.max(tieMs ?? cue(tieCue, appearOn + 2200, from), appearOn + 600);
  const growOn = Math.max(growMs ?? cue(growCue, tieOn + 1400, from), tieOn + 500);
  const splitOn = Math.max(splitMs ?? cue(splitCue, growOn + 3000, from), growOn + 900);

  const R = V ? 20 : 24;
  const gap = V ? 200 : 380;
  const plotH = V ? 340 : 420;
  const rowW = gap * (count - 1);
  const baseY = plotH - R; // the offer line — §1's rails reuse this instrument

  // phases
  const appear = clamp01(interpolate(ms, [appearOn, appearOn + 420], [0, 1], CLAMP));
  const tie = clamp01(interpolate(ms, [tieOn, tieOn + 520], [0, 1], CLAMP));
  const grow = clamp01(interpolate(ms, [growOn, growOn + 700], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) }));
  const split = clamp01(interpolate(ms, [splitOn, splitOn + 900], [0, 1], { ...CLAMP, easing: Easing.inOut(Easing.cubic) }));

  // the tie holds them together, then BREAKS as they diverge
  const tieOp = tie * (1 - clamp01(interpolate(ms, [splitOn, splitOn + 420], [0, 1], CLAMP)));
  const dashV = `repeating-linear-gradient(180deg, ${sub} 0 9px, transparent 9px 18px)`;

  // label swap — three states cross-fading in place
  const toGrow = clamp01(interpolate(ms, [growOn, growOn + 420], [0, 1], CLAMP));
  const toSplit = clamp01(interpolate(ms, [splitOn + 200, splitOn + 640], [0, 1], CLAMP));
  const labelStyle = caps(sub, TYPE.labelSm);

  return (
    <AbsoluteFill
      style={{
        opacity: vis, justifyContent: "center", alignItems: "center",
        textAlign: "center", padding: V ? "0 70px" : "0 150px",
      }}
    >
      {kicker ? <div style={{ ...k, marginBottom: V ? 30 : 38 }}><div style={caps(sub)}>{kicker}</div></div> : null}

      <div style={{ position: "relative", width: rowW + R * 2, height: plotH }}>
        {Array.from({ length: count }).map((_, i) => {
          const x = gap * i;
          const rise = (spread[i] ?? 0) * (plotH - R * 2);
          const cy = baseY - split * rise;
          // identical through both facts: every mark grows by the SAME amount
          const scale = 1 + grow * 0.26;
          return (
            <React.Fragment key={i}>
              {/* the trace each mark leaves as it departs the offer line — runs UP
                  from the baseline to the mark's new centre (anchoring at the
                  baseline and giving it height grows it DOWNWARD; see block-kit) */}
              {split > 0.01 && rise > 4 ? (
                <div
                  style={{
                    position: "absolute", left: x + R - 1.5, top: cy,
                    width: 3, height: baseY - cy, backgroundImage: dashV, opacity: 0.55 * split,
                  }}
                />
              ) : null}
              <div
                style={{
                  position: "absolute", left: x, top: cy - R,
                  width: R * 2, height: R * 2, borderRadius: R * 2,
                  border: `3px solid ${fg}`,
                  background: "transparent",
                  opacity: appear,
                  transform: `scale(${scale})`,
                }}
              />
            </React.Fragment>
          );
        })}

        {/* the offer line they all start on */}
        <div
          style={{
            position: "absolute", left: -R, top: baseY - 1,
            width: (rowW + R * 2) * appear, height: 2, background: hair,
          }}
        />

        {/* the tie that says "these are the same" — drawn under the row, broken on the split */}
        <div
          style={{
            position: "absolute", left: R - 2, top: baseY + (V ? 22 : 28),
            width: rowW * tie, height: 3, background: sub, opacity: tieOp,
          }}
        />
        {[0, count - 1].map((i) => (
          <div
            key={`tick${i}`}
            style={{
              position: "absolute", left: gap * i + R - 2, top: baseY + (V ? 22 : 28),
              width: 3, height: (V ? 12 : 14) * tie, background: sub, opacity: tieOp,
            }}
          />
        ))}
      </div>

      <div style={{ position: "relative", height: 40, width: "100%", marginTop: V ? 40 : 52 }}>
        <div style={{ position: "absolute", inset: 0, opacity: (1 - toGrow) * appear }}><div style={labelStyle}>{sameLabel}</div></div>
        <div style={{ position: "absolute", inset: 0, opacity: toGrow * (1 - toSplit) }}><div style={labelStyle}>{growLabel}</div></div>
        <div style={{ position: "absolute", inset: 0, opacity: toSplit }}><div style={{ ...labelStyle, color: fg, fontWeight: 700 }}>{splitLabel}</div></div>
      </div>
    </AbsoluteFill>
  );
};

// ── PricingRail ───────────────────────────────────────────────────────────
// THE SPINE. An IPO prices somewhere within (or above) its filing range, and
// then the market moves it. Both of those are SPATIAL facts, so the block is a
// chart, not a card: x = where the offer landed against the range, y = what the
// first day did to it.
//
// Each rail ASSEMBLES while its company is named, then DOCKS — shrinking and
// travelling to its slot — so the next one builds beneath it. By the third dock
// all three are on screen as one comparison panel, which is the argument the
// piece is actually making. That accumulation is why §1 is a single 68s object
// and not three 20s scenes.
//
// ⚠️ HONESTY: only Braveheart's range is stated numerically (15–17). Latigo's
// and BlossomHill's are described only by POSITION ("the top of its range",
// "the midpoint"). So the bracket is a normalized SPAN with OPTIONAL end labels,
// and a figure is printed only where the script speaks one. Numeric endpoints on
// the other two would invent precision the VO never claims (the PipelineSpend
// rule, 2026-08-06).
//
// Landscape two-column (identity left, chart right) — that split is the actual
// argument for 16:9; a portrait build would have to stack and could only show
// one idea at a time.

/** first-day move: a rise to `peakPct`, optionally settling to `endPct`. */
export type FirstDay = {
  peakPct: number;
  endPct?: number;
  riseCue: string;
  settleCue?: string;
  riseMs?: number;
  settleMs?: number;
  /** printed at the peak (e.g. "+68%") — omit where the VO gives no figure */
  peakLabel?: string;
  /** printed at the close (e.g. "FLAT") */
  endLabel?: string;
};

export type RailSpec = {
  name: string;
  descriptor: string;
  kicker?: string;
  /** the filing range as a normalized span of the track, 0..1 */
  range: { from: number; to: number; lowLabel?: string; highLabel?: string; cue: string; ms?: number };
  /** where the offer priced, as a normalized track position 0..1 */
  price: { pos: number; label: string; cue: string; ms?: number };
  /** a small caps spec landing on its own word (e.g. "21.25M SHARES") */
  spec?: { label: string; cue: string };
  raise: { value: number; decimals: number; prefix?: string; suffix?: string; cue: string; durationMs?: number };
  firstDay: FirstDay;
  nameSize?: number;
};

// rail-box coordinate space — authored in these units, and the whole box is
// transformed as ONE element when it docks (a true travel, not a crossfade).
const BOX_W = 1620;
const BOX_H = 400;
const COL_W = 600; // identity column
const CH_X = 640; // chart origin x
const CH_W = 940; // chart width
const TRACK_Y = 300; // the offer line, within the box
const K = 3.4; // px per percent of first-day move (68% → 231px; peak label at y=13)
const TRACE_W = 180;

// ⚠️ A docked row must be genuinely SHORT, not merely scaled. Uniform scaling
// kept the full 400-unit box, so an active rail and the rows already docked
// landed in the same band — the operator's screenshot showed BlossomHill's
// full-size identity column sitting on top of Latigo's docked chart. Docking
// therefore does three things at once: shrinks the box, FLATTENS the trace
// (DOCK_KMUL), and folds the name + raise onto one line beside the track. The
// row goes from ~353 units tall to ~110px on screen, which is what makes room.
const DOCK_KMUL = 0.55; // docked px-per-percent, as a fraction of K

// Docked geometry. 0.44 rather than 0.38: at 0.38 the price label fell to 15px,
// and the docked panel is the thing the §3 argument is delivered ON — it has to
// stay readable, not just legible. Rows are spaced by the CONTENT height (the
// trace climbs ~138px at this scale), not the box height.
// Exported because §3's StageVerdict redraws the same three rails and MUST land
// them in the identical seats — the callback only reads as "the same object
// returning" if the geometry is shared as constants, not re-derived by eye.
// (The OnlyOneCounts ↔ EndpointSwitch pattern, 2026-08-07.)
export const DOCK_SCALE = 0.44;
export const DOCK_LEFT = (1920 - BOX_W * DOCK_SCALE) / 2;
export const DOCK_TOP0 = 150;
export const DOCK_GAP = 175;
/**
 * Where a rail sits while ACTIVE, per row index. Not one constant: rail 0 has
 * nothing above it, rail 1 has one docked row to clear, rail 2 has two. A single
 * centred position is what put the active rail on top of the docked stack.
 */
export const ACTIVE_TOPS = [300, 350, 525]; // verified: 39px clear of the row above, bottom 891 < footer
export const RAIL_GEO = { BOX_W, BOX_H, CH_X, CH_W, TRACK_Y, K, TRACE_W, DOCK_KMUL };

export const PricingRail: React.FC<{
  /** the beat span this rail is ACTIVE (assembling, full size) */
  from: number;
  to: number;
  spec: RailSpec;
  /** when it shrinks to its docked slot — a beat boundary from timeline.json */
  dockMs: number;
  rowIndex: number;
  /** keep rendering (docked) until this ms, then unmount */
  holdUntil: number;
  bg?: "ink" | "paper";
}> = ({ from, to, spec, dockMs, rowIndex, holdUntil, bg = "ink" }) => {
  const ms = useMs();
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const sub = bg === "ink" ? INK_SUB : COLORS.grayText;
  const hair = bg === "ink" ? "rgba(255,255,255,0.22)" : COLORS.border;

  // ── onsets — cue-driven, clamped monotonic by construction ──
  const specOn = spec.spec ? cue(spec.spec.cue, from + 1400, from) : from;
  const priceOn = Math.max(spec.price.ms ?? cue(spec.price.cue, from + 3000, from), from + 300);
  const rangeOn = Math.max(spec.range.ms ?? cue(spec.range.cue, priceOn + 1200, from), priceOn + 400);
  const raiseOn = Math.max(cue(spec.raise.cue, rangeOn + 1500, from), rangeOn + 300);
  const raiseTo = raiseOn + (spec.raise.durationMs ?? 1200);
  const riseOn = Math.max(spec.firstDay.riseMs ?? cue(spec.firstDay.riseCue, raiseTo + 900, from), raiseTo + 100);
  const settleOn =
    spec.firstDay.settleCue || spec.firstDay.settleMs != null
      ? Math.max(spec.firstDay.settleMs ?? cue(spec.firstDay.settleCue!, riseOn + 1800, from), riseOn + 900)
      : undefined;

  // ⚠️ every hook must run before the visibility guard — an early return above a
  // usePop/useStamp call breaks the rules of hooks and blanks the frame.
  const peakLab = usePop(riseOn + 700, { rise: 10 });
  const endLab = useStamp((settleOn ?? riseOn) + 900);
  const sp = usePop(specOn, { rise: 10 });

  const appear = clamp01(interpolate(ms, [from, from + 420], [0, 1], CLAMP));
  const leave = clamp01(interpolate(ms, [holdUntil - 400, holdUntil], [1, 0], CLAMP));

  // ── dock travel: ONE transform on the whole box ──
  const dockP = clamp01(interpolate(ms, [dockMs, dockMs + 760], [0, 1], { ...CLAMP, easing: Easing.inOut(Easing.cubic) }));
  const scale = interpolate(dockP, [0, 1], [1, DOCK_SCALE], CLAMP);
  const left = interpolate(dockP, [0, 1], [(1920 - BOX_W) / 2, DOCK_LEFT], CLAMP);
  const top = interpolate(dockP, [0, 1], [ACTIVE_TOPS[rowIndex] ?? 300, DOCK_TOP0 + rowIndex * DOCK_GAP], CLAMP);
  // secondary detail fades as it docks — a docked row is a summary, not a chart
  const detail = 1 - dockP;
  // the trace FLATTENS as it docks, so the row collapses to a short strip while
  // the three outcomes stay proportional to each other
  const kEff = K * interpolate(dockP, [0, 1], [1, DOCK_KMUL], CLAMP);
  // name + raise fold from a stacked column onto one line beside the track
  const nameTop = interpolate(dockP, [0, 1], [40, 250], CLAMP);
  // Docked left column budget is 0→640 (the chart starts at CH_X). Name gets
  // 0–330, raise 350–640. At 44px "Biotherapeutics" alone needed 396px in a
  // 340px column and overflowed; 36px fits it in 324. Raise at 64px keeps
  // "$382.5M" (269px) clear of the chart.
  const nameSize = interpolate(dockP, [0, 1], [spec.nameSize ?? 56, 36], CLAMP);
  const raiseLeft = interpolate(dockP, [0, 1], [0, 350], CLAMP);
  const raiseTop = interpolate(dockP, [0, 1], [300, 240], CLAMP);
  const raiseSize = interpolate(dockP, [0, 1], [96, 64], CLAMP);

  // ── chart geometry ──
  const bx = (t: number) => CH_X + t * CH_W;
  const markX = bx(spec.price.pos);
  const rangeA = bx(spec.range.from);
  const rangeB = bx(spec.range.to);

  const trackW = clamp01(interpolate(ms, [from + 300, from + 1100], [0, 1], CLAMP)) * CH_W;
  const rangeW = clamp01(interpolate(ms, [rangeOn, rangeOn + 620], [0, 1], CLAMP)) * (rangeB - rangeA);
  const markIn = clamp01(interpolate(ms, [priceOn, priceOn + 300], [0, 1], CLAMP));
  // mirrors CountUp's own reveal window so the figure and its label arrive together
  const raiseIn = clamp01(interpolate(ms, [raiseOn - 60, raiseOn + 140], [0, 1], CLAMP));

  // the first-day trace: P0 on the offer line → P1 at the peak → P2 at the close
  const riseP = clamp01(interpolate(ms, [riseOn, riseOn + 1100], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) }));
  const settleP = settleOn ? clamp01(interpolate(ms, [settleOn, settleOn + 1000], [0, 1], { ...CLAMP, easing: Easing.inOut(Easing.cubic) })) : 0;
  const endPct = spec.firstDay.endPct ?? spec.firstDay.peakPct;
  const P0 = { x: markX, y: TRACK_Y };
  const P1 = { x: markX + TRACE_W * 0.58, y: TRACK_Y - spec.firstDay.peakPct * kEff };
  const P2 = { x: markX + TRACE_W, y: TRACK_Y - endPct * kEff };
  const lerp = (a: { x: number; y: number }, b: { x: number; y: number }, t: number) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
  const head = riseP < 1 ? lerp(P0, P1, riseP) : lerp(P1, P2, settleP);
  const pts = riseP < 1 ? [P0, head] : [P0, P1, head];
  const traceOn = riseP > 0.01;

  const nameStyle: React.CSSProperties = {
    fontFamily: DISPLAY, fontWeight: 700, fontSize: spec.nameSize ?? 56,
    letterSpacing: TRACK.display, lineHeight: 1.05, color: fg, maxWidth: COL_W,
  };

  // unmount outside its life so a 3.5-minute composition isn't carrying dead layers
  if (ms < from - 500 || ms > holdUntil + 500) return null;

  return (
    <AbsoluteFill style={{ opacity: appear * leave, pointerEvents: "none" }}>
      <div
        style={{
          position: "absolute", left, top, width: BOX_W, height: BOX_H,
          transform: `scale(${scale})`, transformOrigin: "top left",
        }}
      >
        {/* ── identity column — absolutely positioned so it can FOLD when docked ── */}
        {spec.kicker ? (
          <div style={{ position: "absolute", left: 0, top: 0, width: COL_W, ...caps(sub), opacity: detail }}>{spec.kicker}</div>
        ) : null}
        <div style={{ ...nameStyle, position: "absolute", left: 0, top: nameTop, width: interpolate(dockP, [0, 1], [COL_W, 330], CLAMP), fontSize: nameSize }}>
          {spec.name}
        </div>
        {/* ⚠️ The column is absolutely positioned so it can fold when docked,
            which means the rows below the name do NOT reflow around it. Every
            top below therefore reserves TWO lines of name (2 × 56 × 1.05 ≈ 118).
            At the old 118 the second line of "BlossomHill Therapeutics" ran
            straight through the descriptor. Single-line names just sit airier. */}
        <div style={{ position: "absolute", left: 0, top: 172, width: COL_W, fontFamily: DISPLAY, fontWeight: 500, fontSize: 32, letterSpacing: TRACK.body, color: sub, opacity: detail }}>
          {spec.descriptor}
        </div>
        <div style={{ position: "absolute", left: 0, top: 240, width: 180, height: 3, background: hair, opacity: detail }} />
        {spec.spec ? (
          <div style={{ position: "absolute", left: 0, top: 262, ...sp, opacity: (sp.opacity ?? 1) * detail }}>
            <div style={caps(sub)}>{spec.spec.label}</div>
          </div>
        ) : null}
        <div style={{ position: "absolute", left: raiseLeft, top: raiseTop, display: "flex", alignItems: "baseline", gap: 18 }}>
          <CountUp
            fromMs={raiseOn}
            toMs={raiseTo}
            value={spec.raise.value}
            decimals={spec.raise.decimals}
            prefix={spec.raise.prefix}
            suffix={spec.raise.suffix}
            style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: raiseSize, letterSpacing: TRACK.display, color: fg, lineHeight: 1 }}
          />
          {/* ⚠️ CountUp self-gates (hidden until its figure is voiced) but a
              label beside it does NOT — "RAISED" sat on screen labelling
              nothing for ~13s. Any caption attached to a gated figure needs
              the SAME gate; reveal it with the count, not with the block. */}
          <div style={{ ...caps(sub, TYPE.labelSm), opacity: detail * raiseIn }}>raised</div>
        </div>

        {/* ── the chart ── */}
        <svg width={BOX_W} height={BOX_H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
          {/* the offer line every rail shares — the instrument §0 introduced */}
          <line x1={CH_X} y1={TRACK_Y} x2={CH_X + trackW} y2={TRACK_Y} stroke={hair} strokeWidth={2} />
          {/* the filing range, as a SPAN (no invented endpoints) */}
          <line x1={rangeA} y1={TRACK_Y} x2={rangeA + rangeW} y2={TRACK_Y} stroke={fg} strokeWidth={7} strokeLinecap="round" opacity={0.5} />
          {[rangeA, rangeB].map((x, i) => (
            <line
              key={i} x1={x} y1={TRACK_Y - 16} x2={x} y2={TRACK_Y + 16} stroke={fg} strokeWidth={3}
              opacity={0.5 * clamp01(interpolate(ms, [rangeOn + i * 240, rangeOn + i * 240 + 300], [0, 1], CLAMP))}
            />
          ))}
          {/* the first-day trace */}
          {traceOn ? (
            <polyline points={pts.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke={fg} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" />
          ) : null}
          {/* where it priced */}
          <circle cx={markX} cy={TRACK_Y} r={13 * markIn} fill={fg} />
          {/* where it closed */}
          {traceOn ? <circle cx={head.x} cy={head.y} r={11} fill={fg} /> : null}
        </svg>

        {/* ── chart labels — HTML, never SVG <text> (SVG text renders SERIF) ── */}
        {spec.range.lowLabel ? (
          <div style={{ position: "absolute", left: rangeA - 40, top: TRACK_Y + 26, width: 80, textAlign: "center", ...caps(sub), opacity: detail * clamp01(interpolate(ms, [rangeOn, rangeOn + 400], [0, 1], CLAMP)) }}>
            {spec.range.lowLabel}
          </div>
        ) : null}
        {spec.range.highLabel ? (
          <div style={{ position: "absolute", left: rangeB - 40, top: TRACK_Y + 26, width: 80, textAlign: "center", ...caps(sub), opacity: detail * clamp01(interpolate(ms, [rangeOn + 240, rangeOn + 640], [0, 1], CLAMP)) }}>
            {spec.range.highLabel}
          </div>
        ) : null}
        {/* ⚠️ ABOVE the track, not below. Centred under the bracket it landed on
            exactly the same spot as the price label — BlossomHill prices at the
            MIDPOINT, so "$16" and a bracket-centred "FILING RANGE" share an x.
            (Operator screenshot, 2026-08-14.) */}
        {!spec.range.lowLabel ? (
          <div style={{ position: "absolute", left: rangeA, top: TRACK_Y - 42, width: rangeB - rangeA, textAlign: "center", ...caps(sub, TYPE.labelSm), opacity: detail * clamp01(interpolate(ms, [rangeOn + 200, rangeOn + 620], [0, 1], CLAMP)) }}>
            filing range
          </div>
        ) : null}
        <div
          style={{
            position: "absolute", left: markX - 70, top: TRACK_Y + 26, width: 140, textAlign: "center",
            fontFamily: DISPLAY, fontWeight: 700, fontSize: 40, letterSpacing: TRACK.headline, color: fg,
            opacity: markIn,
          }}
        >
          {spec.price.label}
        </div>
        {spec.firstDay.peakLabel ? (
          <div style={{ position: "absolute", left: P1.x - 90, top: P1.y - 66, width: 180, textAlign: "center", ...peakLab }}>
            <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 46, letterSpacing: TRACK.headline, color: fg }}>{spec.firstDay.peakLabel}</div>
          </div>
        ) : null}
        {/* ⚠️ To the RIGHT of the end point, vertically centred on it — not above.
            Above, it stacked under the peak label with ~16px of clearance and a
            heavy horizontal overlap, because a retracing trace ends only just
            below its own peak. Clamped so a long label can't leave the box. */}
        {spec.firstDay.endLabel ? (
          <div style={{ position: "absolute", left: Math.min(P2.x + 22, BOX_W - 200), top: P2.y - 18, width: 190, ...endLab }}>
            <div style={caps(fg)}>{spec.firstDay.endLabel}</div>
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

// ── StackTotal ────────────────────────────────────────────────────────────
// The sum, read off the completed stack — NOT a fresh hero stat. By the time
// this counts, all three rails are docked above it, so the figure is a readout
// of a picture already on screen rather than a fourth claim. That is also why it
// deliberately does not use HeroStat: two count-up heroes on adjacent beats twin
// (the 07-21 rule), and this beat sits 4.6s after a rail's raise count.
export const StackTotal: React.FC<{
  from: number;
  to: number;
  figure: { value: number; decimals: number; prefix?: string; suffix?: string; cue: string; durationMs?: number };
  label: string;
  labelCue: string;
  bg?: "ink" | "paper";
}> = ({ from, to, figure, label, labelCue, bg = "ink" }) => {
  const ms = useMs();
  const vis = useVis(from, to, 300, 300);
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const sub = bg === "ink" ? INK_SUB : COLORS.grayText;
  const hair = bg === "ink" ? "rgba(255,255,255,0.22)" : COLORS.border;

  const figOn = cue(figure.cue, from + 200, from);
  const figTo = figOn + (figure.durationMs ?? 1300);
  const labOn = Math.max(cue(labelCue, figTo + 400, from), figTo - 200);
  const lab = usePop(labOn, { rise: 10 });
  // the rule draws under the docked stack as the figure arrives — it BINDS the
  // three rows into one thing being summed
  const ruleW = clamp01(interpolate(ms, [figOn - 300, figOn + 500], [0, 1], CLAMP)) * 760;

  return (
    <AbsoluteFill style={{ opacity: vis, pointerEvents: "none" }}>
      <div style={{ position: "absolute", left: (1920 - 760) / 2, top: 730, width: 760 }}>
        <div style={{ height: 3, width: ruleW, background: hair }} />
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "center", gap: 22, marginTop: 24 }}>
          <CountUp
            fromMs={figOn}
            toMs={figTo}
            value={figure.value}
            decimals={figure.decimals}
            prefix={figure.prefix}
            suffix={figure.suffix}
            style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 104, letterSpacing: TRACK.display, color: fg, lineHeight: 1 }}
          />
          <div style={{ ...lab }}><div style={caps(sub)}>{label}</div></div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// A per-word reveal must SNAP (~130ms), never soft-spring — a spring reads as the
// words LAGGING the voice once speech speeds up. (block-kit.md, 2026-07-11.)
const SNAP_MS = 130;
const SnapWord: React.FC<{ text: string; onsetMs: number; style: React.CSSProperties }> = ({ text, onsetMs, style }) => {
  const ms = useMs();
  const p = clamp01(interpolate(ms, [onsetMs, onsetMs + SNAP_MS], [0, 1], CLAMP));
  return (
    <span style={{ ...style, opacity: p, transform: `translateY(${interpolate(p, [0, 1], [16, 0], CLAMP)}px)`, display: "inline-block" }}>
      {text}
    </span>
  );
};

// deterministic pseudo-random — stable every frame of every render.
// NEVER Math.random(), which re-rolls per frame and boils.
const rnd = (i: number, salt = 1) => {
  const x = Math.sin(i * 127.1 + salt * 311.7) * 43758.5453;
  return x - Math.floor(x);
};

// ── ScarceCount ───────────────────────────────────────────────────────────
// "Fewer than any year in at least half a decade. Eight listings, total."
// The EMPTINESS is the graphic: a long span of time with only a handful of
// marks scattered on it. Each mark lands one at a time, so the count is
// PERFORMED rather than counted up — which also avoids twinning with the
// $878M count-up in the beat before (the 07-21 rule).
//
// ⚠️ Deliberately NO denominator. Slotting 8 marks into a 40-slot track would
// claim "a normal year is 40", a number the script never gives. The rule is a
// span of TIME, not capacity.
export const ScarceCount: React.FC<Win & {
  kicker?: string;
  count?: number;
  countCue: string;
  qualifier: string;
  qualifierCue: string;
  spanLabel: string;
  stamp: string;
  stampCue: string;
  bg?: "ink" | "paper";
}> = ({ from, to, kicker, count = 8, countCue, qualifier, qualifierCue, spanLabel, stamp, stampCue, bg = "paper" }) => {
  const ms = useMs();
  const vis = useVis(from, to);
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const sub = bg === "ink" ? INK_SUB : COLORS.grayText;
  const hair = bg === "ink" ? "rgba(255,255,255,0.22)" : COLORS.border;

  const k = usePop(from + 200, { rise: 14 });
  const qualOn = cue(qualifierCue, from + 1600, from);
  const countOn = Math.max(cue(countCue, qualOn + 2000, from), qualOn + 400);
  const stampOn = Math.max(cue(stampCue, countOn + 1400, from), countOn + 700);

  const qual = usePop(qualOn, { rise: 12 });
  const st = useStamp(stampOn);

  const W = 1420;
  const ruleW = clamp01(interpolate(ms, [from + 200, from + 1200], [0, 1], CLAMP)) * W;

  return (
    <AbsoluteFill style={{ opacity: vis, justifyContent: "center", alignItems: "center", textAlign: "center" }}>
      {kicker ? <div style={{ ...k, marginBottom: 30 }}><div style={caps(sub)}>{kicker}</div></div> : null}
      <div style={{ ...qual, marginBottom: 54 }}><div style={caps(sub)}>{qualifier}</div></div>

      <div style={{ position: "relative", width: W, height: 60 }}>
        {/* the span of time — not a capacity, so it carries no slots */}
        <div style={{ position: "absolute", left: 0, top: 29, width: ruleW, height: 2, background: hair }} />
        {[0, 1].map((i) => (
          <div key={i} style={{ position: "absolute", left: i * W - 1, top: 18, width: 3, height: 24, background: hair, opacity: ruleW / W }} />
        ))}
        {Array.from({ length: count }).map((_, i) => {
          // spread thinly across the span, with a stable jitter so it reads as
          // scattered events rather than a measured series
          const t = (i + 0.5) / count + (rnd(i) - 0.5) * 0.055;
          const on = countOn + i * 105;
          const p = clamp01(interpolate(ms, [on, on + 220], [0, 1], CLAMP));
          const r = 9;
          return (
            <div
              key={i}
              style={{
                position: "absolute", left: t * W - r, top: 30 - r,
                width: r * 2, height: r * 2, borderRadius: r * 2, background: fg,
                opacity: p, transform: `scale(${interpolate(p, [0, 1], [0.4, 1], CLAMP)})`,
              }}
            />
          );
        })}
      </div>

      <div style={{ ...caps(sub), marginTop: 20, opacity: ruleW / W }}>{spanLabel}</div>
      <div style={{ ...st, marginTop: 52 }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 96, letterSpacing: TRACK.display, color: fg, lineHeight: 1 }}>{stamp}</div>
      </div>
    </AbsoluteFill>
  );
};

// ── RecordMark ────────────────────────────────────────────────────────────
// "The largest biotech IPO on record, at $670 million."
// A single bar grows, and when it stops a dashed high-water line runs off both
// edges of the frame from its top. The bar DEFINES the record rather than being
// measured against pre-drawn competitors — there are no other bars, because the
// script names no other deal to compare it to.
export const RecordMark: React.FC<Win & {
  kicker?: string;
  name: string;
  nameCue: string;
  barCue: string;
  recordCue: string;
  recordLabel: string;
  figure: { value: number; decimals: number; prefix?: string; suffix?: string; cue: string; durationMs?: number };
  bg?: "ink" | "paper";
}> = ({ from, to, kicker, name, nameCue, barCue, recordCue, recordLabel, figure, bg = "paper" }) => {
  const ms = useMs();
  const vis = useVis(from, to);
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const sub = bg === "ink" ? INK_SUB : COLORS.grayText;

  const k = usePop(from + 200, { rise: 12 });
  const nameOn = cue(nameCue, from + 800, from);
  const barOn = Math.max(cue(barCue, nameOn + 1200, from), nameOn + 300);
  const recOn = Math.max(cue(recordCue, barOn + 1500, from), barOn + 700);
  const figOn = Math.max(cue(figure.cue, recOn + 800, from), recOn + 200);
  const figTo = figOn + (figure.durationMs ?? 1100);

  const nm = useStamp(nameOn);
  const rec = useStamp(recOn);

  // 300 not 320: at 320 the dashed record line's caps label lands 13px INSIDE
  // the company name above it. Caught by end-state arithmetic — both elements
  // fade in on different cues, so scrubbing never shows them overlapping.
  const BAR_H = 300;
  const BAR_W = 130;
  const baseY = 760; // baseline, absolute
  const grow = clamp01(interpolate(ms, [barOn, barOn + 1300], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) }));
  const topY = baseY - BAR_H * grow;
  const lineW = clamp01(interpolate(ms, [recOn, recOn + 900], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) }));
  const dash = `repeating-linear-gradient(90deg, ${fg} 0 16px, transparent 16px 30px)`;

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {kicker ? <div style={{ position: "absolute", left: 0, right: 0, top: 210, textAlign: "center", ...k }}><div style={caps(sub)}>{kicker}</div></div> : null}
      <div style={{ position: "absolute", left: 0, right: 0, top: 258, textAlign: "center", ...nm }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 76, letterSpacing: TRACK.display, color: fg }}>{name}</div>
      </div>

      {/* the high-water line the bar itself establishes */}
      <div style={{ position: "absolute", left: 960 - (860 * lineW) / 2, top: baseY - BAR_H - 1, width: 860 * lineW, height: 3, backgroundImage: dash, opacity: 0.85 }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: baseY - BAR_H - 62, textAlign: "center", ...rec }}>
        <div style={caps(fg)}>{recordLabel}</div>
      </div>

      {/* the bar */}
      <div style={{ position: "absolute", left: 960 - BAR_W / 2, top: topY, width: BAR_W, height: BAR_H * grow, background: fg }} />
      <div style={{ position: "absolute", left: 360, top: baseY, width: 1200, height: 2, background: sub, opacity: 0.4 }} />

      {/* the figure, beside the bar's top */}
      <div style={{ position: "absolute", left: 960 + BAR_W / 2 + 40, top: baseY - BAR_H - 10 }}>
        <CountUp
          fromMs={figOn}
          toMs={figTo}
          value={figure.value}
          decimals={figure.decimals}
          prefix={figure.prefix}
          suffix={figure.suffix}
          style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 118, letterSpacing: TRACK.display, color: fg, lineHeight: 1 }}
        />
      </div>
    </AbsoluteFill>
  );
};

// ── SplitDirection ────────────────────────────────────────────────────────
// "Biotech listings returned about 55% … while the broader IPO market is down."
// Two traces leaving ONE origin in opposite directions — deliberately the same
// grammar as §0's SameThenSplit, so the piece's opening move returns as its
// market-wide claim.
//
// ⚠️ The down trace carries NO figure and no axis. The script says the broader
// market "is down" and never says by how much, so the graphic states direction
// only. The 55% STAMPS at the trace's endpoint rather than counting up: it is a
// slope, not a magnitude, and a count-up here would twin with the $670M six
// seconds earlier (the ResponseCohort rule — different kinds of fact, different
// grammars).
export const SplitDirection: React.FC<Win & {
  kicker?: string;
  axisCue: string;
  up: { label: string; figure: string; cue: string };
  down: { label: string; note: string; cue: string };
  bg?: "ink" | "paper";
}> = ({ from, to, kicker, axisCue, up, down, bg = "paper" }) => {
  const ms = useMs();
  const vis = useVis(from, to);
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const sub = bg === "ink" ? INK_SUB : COLORS.grayText;
  const hair = bg === "ink" ? "rgba(255,255,255,0.22)" : COLORS.border;

  const k = usePop(from + 200, { rise: 12 });
  const axisOn = cue(axisCue, from + 400, from);
  const upOn = Math.max(cue(up.cue, axisOn + 1800, from), axisOn + 500);
  const downOn = Math.max(cue(down.cue, upOn + 2400, from), upOn + 900);

  const upFig = useStamp(upOn + 900);
  const dnLab = usePop(downOn + 700, { rise: 12 });

  const W = 1180;
  const CX = 960 - W / 2;
  const CY = 560;
  const UP_H = 178;
  const DN_H = 122;

  const axis = clamp01(interpolate(ms, [axisOn, axisOn + 700], [0, 1], CLAMP));
  const upP = clamp01(interpolate(ms, [upOn, upOn + 1250], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) }));
  const dnP = clamp01(interpolate(ms, [downOn, downOn + 1250], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) }));

  const upEnd = { x: CX + W * upP, y: CY - UP_H * upP };
  const dnEnd = { x: CX + W * dnP, y: CY + DN_H * dnP };

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {kicker ? <div style={{ position: "absolute", left: 0, right: 0, top: 250, textAlign: "center", ...k }}><div style={caps(sub)}>{kicker}</div></div> : null}
      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
        <line x1={CX} y1={CY} x2={CX + W * axis} y2={CY} stroke={hair} strokeWidth={2} />
        {upP > 0.01 ? <polyline points={`${CX},${CY} ${upEnd.x},${upEnd.y}`} fill="none" stroke={fg} strokeWidth={6} strokeLinecap="round" /> : null}
        {dnP > 0.01 ? <polyline points={`${CX},${CY} ${dnEnd.x},${dnEnd.y}`} fill="none" stroke={sub} strokeWidth={5} strokeLinecap="round" opacity={0.75} /> : null}
        <circle cx={CX} cy={CY} r={9 * axis} fill={fg} />
        {upP > 0.01 ? <circle cx={upEnd.x} cy={upEnd.y} r={11} fill={fg} /> : null}
        {dnP > 0.01 ? <circle cx={dnEnd.x} cy={dnEnd.y} r={9} fill={sub} opacity={0.8} /> : null}
      </svg>

      {/* the one figure the script actually gives */}
      {/* 175 above the endpoint, not 122: at 122 the figure block's lower edge
          overlapped the trace's endpoint dot (arithmetic, not eyeballed) */}
      <div style={{ position: "absolute", left: CX + W - 300, top: CY - UP_H - 175, width: 300, textAlign: "right", ...upFig }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 104, letterSpacing: TRACK.display, color: fg, lineHeight: 1 }}>{up.figure}</div>
        <div style={{ ...caps(sub), marginTop: 10 }}>{up.label}</div>
      </div>

      {/* direction only — no number, because none was spoken */}
      <div style={{ position: "absolute", left: CX + W - 340, top: CY + DN_H + 26, width: 340, textAlign: "right", ...dnLab }}>
        <div style={caps(sub)}>{down.label}</div>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 46, letterSpacing: TRACK.headline, color: sub, marginTop: 8 }}>{down.note}</div>
      </div>
    </AbsoluteFill>
  );
};

// ── WindowOpen ────────────────────────────────────────────────────────────
// "The window is open. That part is not in dispute."
// The one beat in §2 that is a RELATIONSHIP rather than a datum, so it gets
// enacted: an aperture whose two shutters SEPARATE on the spoken "open", light
// widening between them. The words snap in on their own frames above it.
//
// ⚠️ Not WordFlow: the beat after this one is also narration, and two centred
// word-flows back to back twin (principle 5). Not FlowStamp either — that block
// flows a lead THEN stamps a payoff, but this sentence says its payoff first.
export const WindowOpen: React.FC<Win & {
  line: string;
  openCue: string;
  openMs?: number;
  tail: string;
  tailCue: string;
  bg?: "ink" | "paper";
}> = ({ from, to, line, openCue, openMs, tail, tailCue, bg = "paper" }) => {
  const ms = useMs();
  const vis = useVis(from, to, 300, 300);
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const sub = bg === "ink" ? INK_SUB : COLORS.grayText;

  const toks = line.split(/\s+/).filter(Boolean);
  const onsets = cueSeq(toks, from, to).map((m, i) => m ?? from + 200 + i * 160);
  const openOn = Math.max(openMs ?? cue(openCue, from + 1400, from), from + 200);
  const tailOn = Math.max(cue(tailCue, openOn + 1600, from), openOn + 600);
  const tl = usePop(tailOn, { rise: 12 });

  const open = clamp01(interpolate(ms, [openOn, openOn + 820], [0, 1], { ...CLAMP, easing: Easing.inOut(Easing.cubic) }));
  const W = 1180;
  const GAP = 132; // how far the shutters travel apart
  const appear = clamp01(interpolate(ms, [from + 200, from + 800], [0, 1], CLAMP));

  return (
    <AbsoluteFill style={{ opacity: vis, justifyContent: "center", alignItems: "center", textAlign: "center" }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", maxWidth: 1400, marginBottom: 66 }}>
        {toks.map((t, i) => (
          <SnapWord
            key={i}
            text={t}
            onsetMs={onsets[i]}
            style={{
              fontFamily: DISPLAY, fontWeight: 700, fontSize: 96, letterSpacing: TRACK.display,
              color: fg, lineHeight: 1.1, marginRight: "0.26em",
            }}
          />
        ))}
      </div>

      {/* the aperture */}
      <div style={{ position: "relative", width: W, height: GAP + 40 }}>
        <div style={{ position: "absolute", left: 0, top: (GAP + 40) / 2 - 5 - (GAP / 2) * open, width: W, height: 7, background: fg, opacity: appear }} />
        <div style={{ position: "absolute", left: 0, top: (GAP + 40) / 2 - 2 + (GAP / 2) * open, width: W, height: 7, background: fg, opacity: appear }} />
        {/* what the opening lets through */}
        <div
          style={{
            position: "absolute", left: 0, top: (GAP + 40) / 2 - (GAP / 2) * open + 2,
            width: W, height: Math.max(0, GAP * open - 4),
            background: bg === "ink" ? "rgba(255,255,255,0.10)" : inkA(0.07),
          }}
        />
      </div>

      <div style={{ ...tl, marginTop: 56 }}><div style={caps(sub)}>{tail}</div></div>
    </AbsoluteFill>
  );
};

// ── StageVerdict ──────────────────────────────────────────────────────────
// §3's payoff, and the reason §1 was built as an accumulating panel at all.
// The three rails RETURN to the exact seats they docked into (shared DOCK_*
// constants, not re-derived), and the argument is delivered ON the picture the
// piece has already taught the viewer to read.
//
// The left slot carries the whole story by SWAPPING in place:
//   "UPSIZED" — identical on all three rows (the sameness: demand was there)
//   → the clinical stage — different per row (what actually differed)
// A chip row would state that; one slot changing content performs it.
//
// Held across b10→b11 with NO world wipe: those two beats are setup and verdict
// on one idea, and cutting the ground out mid-argument would break the
// single-picture read (the EndpointSwitch finding, 2026-08-07).
export type VerdictRow = {
  name: string;
  pricePos: number;
  rangeFrom: number;
  rangeTo: number;
  peakPct: number;
  endPct?: number;
  priceLabel: string;
  peakLabel?: string;
  /** the clinical stage that replaces "UPSIZED" in the left slot */
  stage: string;
  stageCue: string;
  stageMs?: number;
  /** when THIS company is named in §3 — its row lifts out of the dim baseline */
  nameCue: string;
};

export const StageVerdict: React.FC<Win & {
  rows: VerdictRow[];
  demandLabel: string;
  demandCue: string;
  differCue: string;
  /** rows 0..groupCount-1 get bracketed together */
  groupCount?: number;
  groupLabel: string;
  groupCue: string;
  oddLabel: string;
  oddCue: string;
  bg?: "ink" | "paper";
}> = ({
  from, to, rows, demandLabel, demandCue, differCue,
  groupCount = 2, groupLabel, groupCue, oddLabel, oddCue, bg = "ink",
}) => {
  const ms = useMs();
  const vis = useVis(from, to, 420, 300);
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const sub = bg === "ink" ? INK_SUB : COLORS.grayText;
  const hair = bg === "ink" ? "rgba(255,255,255,0.22)" : COLORS.border;
  // the rails return in their DOCKED form, so the trace uses the flattened
  // px-per-percent — same object, same seats, same proportions
  const { CH_X: cx0, CH_W: cw, TRACK_Y: ty, TRACE_W: tw } = RAIL_GEO;
  const k = RAIL_GEO.K * RAIL_GEO.DOCK_KMUL;
  const YOFF = 60; // §3 has no active rail competing, so the stack centres lower

  const demandOn = cue(demandCue, from + 1200, from);
  const differOn = Math.max(cue(differCue, demandOn + 3000, from), demandOn + 800);
  const groupOn = Math.max(cue(groupCue, differOn + 4000, from), differOn + 900);
  const oddOn = Math.max(cue(oddCue, groupOn + 4000, from), groupOn + 900);

  const enter = clamp01(interpolate(ms, [from, from + 620], [0, 1], CLAMP));
  const demand = clamp01(interpolate(ms, [demandOn, demandOn + 420], [0, 1], CLAMP));
  const differ = clamp01(interpolate(ms, [differOn, differOn + 520], [0, 1], CLAMP));
  const group = clamp01(interpolate(ms, [groupOn, groupOn + 700], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) }));
  const odd = clamp01(interpolate(ms, [oddOn, oddOn + 700], [0, 1], { ...CLAMP, easing: Easing.inOut(Easing.cubic) }));

  const grpLab = useStamp(groupOn + 260);
  const oddLab = useStamp(oddOn + 260);

  // absolute y of each row's offer line — the seat it docked into in §1
  const trackAbs = (i: number) => DOCK_TOP0 + YOFF + i * DOCK_GAP + ty * DOCK_SCALE;
  // how far each row travels when the verdict lands: the two that behaved the
  // same CONVERGE, the one that didn't steps away. The grouping is performed,
  // not just bracketed — which is what stops 27s of held rails reading as a
  // still frame (operator: "this part is boring", 2026-08-14).
  const rowDY = (i: number, groupP: number, oddP: number) =>
    i === 0 ? groupP * 26 : i === 1 ? -groupP * 26 : oddP * 30;

  return (
    <AbsoluteFill style={{ opacity: vis, pointerEvents: "none" }}>
      {rows.map((r, i) => {
        const isOdd = i >= groupCount;
        const markX = cx0 + r.pricePos * cw;
        const rA = cx0 + r.rangeFrom * cw;
        const rB = cx0 + r.rangeTo * cw;
        const endPct = r.endPct ?? r.peakPct;
        const P1 = { x: markX + tw * 0.58, y: ty - r.peakPct * k };
        const P2 = { x: markX + tw, y: ty - endPct * k };
        // the trace is drawn at its FINAL state — this is a recall, not a rebuild
        const pts = `${markX},${ty} ${P1.x},${P1.y} ${P2.x},${P2.y}`;
        // dim until "what differed", then the price + trace carry the contrast
        const chartOp = 0.42 + differ * 0.58;
        // each row lifts out of the baseline as ITS company is named — this is
        // what fills the 6.4s between "what differed" and the group verdict
        const nameOn = cue(r.nameCue, from + 8000, from);
        const named = clamp01(interpolate(ms, [nameOn, nameOn + 420], [0, 1], CLAMP));
        const rowDim = (0.5 + 0.5 * named) * (isOdd ? 1 - odd * 0.42 : 1);
        // ⚠️ translateX/Y are INSIDE scale(DOCK_SCALE), so on-screen travel is
        // shift × 0.44. 54 box-units moved it 24px — an amount that reads as a
        // rendering wobble rather than as the row stepping away. 120 → ~53px.
        const shift = isOdd ? odd * 120 : 0;
        const dy = rowDY(i, group, odd) / DOCK_SCALE; // authored in screen px
        const stageOn = Math.max(r.stageMs ?? cue(r.stageCue, differOn + 2000, from), differOn + 200);
        const stageP = clamp01(interpolate(ms, [stageOn, stageOn + 380], [0, 1], CLAMP));

        return (
          <React.Fragment key={i}>
            {/* the rail, at its docked seat */}
            <div
              style={{
                position: "absolute", left: DOCK_LEFT, top: DOCK_TOP0 + YOFF + i * DOCK_GAP,
                width: RAIL_GEO.BOX_W, height: RAIL_GEO.BOX_H,
                transform: `scale(${DOCK_SCALE}) translate(${shift}px, ${dy}px)`, transformOrigin: "top left",
                opacity: enter * rowDim,
              }}
            >
              <div style={{ position: "absolute", left: 0, top: 60, width: 600, fontFamily: DISPLAY, fontWeight: 700, fontSize: 56, letterSpacing: TRACK.display, lineHeight: 1.05, color: fg }}>
                {r.name}
              </div>
              <svg width={RAIL_GEO.BOX_W} height={RAIL_GEO.BOX_H} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
                <line x1={cx0} y1={ty} x2={cx0 + cw} y2={ty} stroke={hair} strokeWidth={2} />
                <line x1={rA} y1={ty} x2={rB} y2={ty} stroke={fg} strokeWidth={7} strokeLinecap="round" opacity={0.4 * chartOp} />
                {[rA, rB].map((x, j) => (
                  <line key={j} x1={x} y1={ty - 16} x2={x} y2={ty + 16} stroke={fg} strokeWidth={3} opacity={0.4 * chartOp} />
                ))}
                <polyline points={pts} fill="none" stroke={fg} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" opacity={chartOp} />
                <circle cx={markX} cy={ty} r={13} fill={fg} opacity={chartOp} />
                <circle cx={P2.x} cy={P2.y} r={11} fill={fg} opacity={chartOp} />
              </svg>
              <div style={{ position: "absolute", left: markX - 70, top: ty + 26, width: 140, textAlign: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: 40, letterSpacing: TRACK.headline, color: fg, opacity: chartOp }}>
                {r.priceLabel}
              </div>
              {r.peakLabel ? (
                <div style={{ position: "absolute", left: P1.x - 90, top: P1.y - 66, width: 180, textAlign: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: 46, letterSpacing: TRACK.headline, color: fg, opacity: chartOp }}>
                  {r.peakLabel}
                </div>
              ) : null}
            </div>

            {/* the LEFT SLOT — the whole argument, swapping in place. Both states
                SLIDE in from the left rather than cross-fading, so the swap
                reads as one slot changing content instead of two labels. */}
            <div style={{ position: "absolute", left: 140, top: trackAbs(i) - 22 + rowDY(i, group, odd), width: 440, textAlign: "right", opacity: enter * rowDim }}>
              <div style={{ position: "absolute", right: 0, top: 0, opacity: demand * (1 - differ), transform: `translateX(${(1 - demand) * -22}px)` }}>
                <div style={caps(sub)}>{demandLabel}</div>
              </div>
              <div style={{ position: "absolute", right: 0, top: 0, opacity: stageP * differ, transform: `translateX(${(1 - stageP) * -22}px)` }}>
                <div style={caps(fg)}>{r.stage}</div>
              </div>
            </div>
          </React.Fragment>
        );
      })}

      {/* the two that behaved the same, bracketed — the bracket closes onto the
          rows as they converge, so it binds a moving pair rather than labelling
          a static one */}
      <div
        style={{
          position: "absolute", left: 1340,
          top: trackAbs(0) - 26 + rowDY(0, group, odd),
          width: 6,
          height: Math.max(0, (trackAbs(groupCount - 1) + rowDY(1, group, odd) - trackAbs(0) - rowDY(0, group, odd) + 52) * group),
          background: fg, opacity: 0.8,
        }}
      />
      <div style={{ position: "absolute", left: 1378, top: (trackAbs(0) + trackAbs(groupCount - 1)) / 2 - 40, width: 470, ...grpLab }}>
        <div style={{ ...caps(fg), lineHeight: 1.5 }}>{groupLabel}</div>
      </div>

      {/* and the one that didn't */}
      <div style={{ position: "absolute", left: 1378, top: trackAbs(rows.length - 1) - 34 + rowDY(2, group, odd), width: 470, ...oddLab }}>
        <div style={{ ...caps(sub), lineHeight: 1.5 }}>{oddLabel}</div>
      </div>
    </AbsoluteFill>
  );
};

// ── NotYetARule ───────────────────────────────────────────────────────────
// "One week and three companies is an observation, not a rule. But it is the
// observation worth carrying into the next pricing."
//
// ⚠️ REBUILT 2026-08-14 — the operator could not read v1. That version drew a
// dashed fit through three marks and then dissolved it, which failed twice: by
// the time the beat settled the line was GONE, so the marks read as three random
// dots, and a struck "A RULE" floated with nothing anchoring it. Worse, marks at
// descending heights read as a downward TREND — the exact opposite of the claim.
// The lesson is the 07-25 one restated: a graphic whose meaning lives in motion
// that has already finished is unreadable on the held frame. What survives the
// hold has to carry the idea by itself.
//
// v2 makes the SAMPLE SIZE the graphic, and it is legible frozen: a small solid
// cluster of what we actually observed, against a long dim run of pricings that
// haven't happened, marching off the frame edge. Tiny-and-solid beside
// vast-and-empty IS "an observation, not a rule" — no line has to fail, and
// nothing has to be struck.
//
// ⚠️ The empty run is deliberately UNCOUNTABLE — the ticks fade out under a mask
// before the frame edge, so the graphic never implies "a rule needs exactly N".
// (Same refusal-to-close grammar as UncappedFigure at 1:38, which is a
// deliberate internal rhyme rather than a new device.)
export const NotYetARule: React.FC<Win & {
  kicker?: string;
  /** mark heights 0..1 — the three first-day outcomes, kept as the piece's own evidence */
  points?: number[];
  marksCue: string;
  haveLabel: string;
  stamp: string;
  stampCue: string;
  needLabel: string;
  needCue: string;
  forwardCue: string;
  forwardLabel: string;
  bg?: "ink" | "paper";
}> = ({
  from, to, kicker, points = [0.78, 0.42, 0.06],
  marksCue, haveLabel, stamp, stampCue, needLabel, needCue, forwardCue, forwardLabel, bg = "paper",
}) => {
  const ms = useMs();
  const vis = useVis(from, to);
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const sub = bg === "ink" ? INK_SUB : COLORS.grayText;
  const hair = bg === "ink" ? "rgba(255,255,255,0.22)" : COLORS.border;

  const k = usePop(from + 200, { rise: 12 });
  const marksOn = cue(marksCue, from + 600, from);
  const stampOn = Math.max(cue(stampCue, marksOn + 1200, from), marksOn + 400);
  const needOn = Math.max(cue(needCue, stampOn + 1400, from), stampOn + 500);
  const fwdOn = Math.max(cue(forwardCue, needOn + 3500, from), needOn + 1000);

  const st = useStamp(stampOn);
  const nd = usePop(needOn + 400, { rise: 12 });
  const fw = usePop(fwdOn + 260, { rise: 12 });

  const AXIS = 560;
  const PLOT = 190;
  const XS = [330, 440, 550]; // the tight cluster — three pricings, one week
  const ys = points.map((h) => AXIS - h * PLOT);

  const TICK0 = 740;
  const TICK_GAP = 74;
  const TICKS = 16;

  const marks = clamp01(interpolate(ms, [marksOn, marksOn + 500], [0, 1], CLAMP));
  const need = clamp01(interpolate(ms, [needOn, needOn + 900], [0, 1], CLAMP));
  const fwdP = clamp01(interpolate(ms, [fwdOn, fwdOn + 800], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) }));
  const fade = "linear-gradient(90deg, #000 0%, #000 42%, transparent 100%)";

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {kicker ? <div style={{ position: "absolute", left: 0, right: 0, top: 208, textAlign: "center", ...k }}><div style={caps(sub)}>{kicker}</div></div> : null}

      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
        <line x1={280} y1={AXIS + 46} x2={280 + 380 * marks} y2={AXIS + 46} stroke={hair} strokeWidth={2} />
        {/* what we actually have — solid, and small */}
        {XS.map((x, i) => {
          const p = clamp01(interpolate(ms, [marksOn + i * 150, marksOn + i * 150 + 300], [0, 1], CLAMP));
          return <circle key={i} cx={x} cy={ys[i]} r={15 * p} fill={fg} />;
        })}
        {/* the bracket that binds them into one observation */}
        <path
          d={`M ${XS[0] - 46} ${AXIS + 76} L ${XS[0] - 46} ${AXIS + 96} L ${XS[2] + 46} ${AXIS + 96} L ${XS[2] + 46} ${AXIS + 76}`}
          fill="none" stroke={sub} strokeWidth={3} opacity={marks * 0.9}
        />
        {/* the one it should be carried into */}
        {fwdP > 0.01 ? (
          <>
            <line
              x1={XS[2] + 60} y1={AXIS} x2={XS[2] + 60 + (TICK0 - XS[2] - 76) * fwdP} y2={AXIS}
              stroke={fg} strokeWidth={3} strokeDasharray="12 12" opacity={0.9}
            />
            <circle cx={TICK0} cy={AXIS} r={13 * fwdP} fill="none" stroke={fg} strokeWidth={4} />
          </>
        ) : null}
      </svg>

      {/* the pricings that have not happened — uncountable by construction */}
      <div
        style={{
          position: "absolute", left: TICK0, top: AXIS - 78, height: 156,
          width: TICK_GAP * TICKS, opacity: need,
          maskImage: fade, WebkitMaskImage: fade,
        }}
      >
        {Array.from({ length: TICKS }).map((_, i) => (
          <div
            key={i}
            style={{
              position: "absolute", left: i * TICK_GAP, top: 0, width: 3, height: 156,
              backgroundImage: `repeating-linear-gradient(180deg, ${sub} 0 10px, transparent 10px 20px)`,
              opacity: clamp01(interpolate(ms, [needOn + i * 45, needOn + i * 45 + 260], [0, 1], CLAMP)) * 0.8,
            }}
          />
        ))}
      </div>

      <div style={{ position: "absolute", left: 280, top: AXIS + 116, width: 400, ...caps(sub), opacity: marks }}>{haveLabel}</div>
      <div style={{ position: "absolute", left: TICK0, top: AXIS + 116, width: 620, ...nd }}><div style={caps(sub)}>{needLabel}</div></div>
      <div style={{ position: "absolute", left: TICK0 - 190, top: AXIS - 132, width: 380, textAlign: "center", ...fw }}>
        <div style={caps(fg)}>{forwardLabel}</div>
      </div>

      <div style={{ position: "absolute", left: 0, right: 0, top: 792, textAlign: "center", ...st }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 104, letterSpacing: TRACK.display, color: fg, lineHeight: 1 }}>{stamp}</div>
      </div>
    </AbsoluteFill>
  );
};

// ── GradientRail ──────────────────────────────────────────────────────────
// The closing argument, as ONE object across a 23s beat.
//
//   Phase A — a spectrum from earlier science / platforms to late-stage assets.
//     The premium marks start spread evenly and TRAVEL right, piling up at the
//     late-stage end. "The premium is going to late-stage assets" is a statement
//     about WHERE ON A LINE something sits, which is the one thing separate
//     cards cannot show (the PipelineSpend rule).
//   Phase B — the headline number arrives as a bar spanning the WHOLE spectrum,
//     then NARROWS onto the slice where the premium actually pooled. The gap
//     between the wide bar and the narrow one IS "narrower than the headline
//     number suggests".
//
// ⚠️ The spectrum carries NO axis values and the bar NO figure. The script names
// neither, and a labelled axis would invent precision it never claims.
export const GradientRail: React.FC<Win & {
  kicker?: string;
  leftLabel: string;
  rightLabel: string;
  premiumCue: string;
  poolCue: string;
  totalLabel: string;
  /** when the wide bar ENTERS — the voice establishes it before naming it */
  totalEnterCue: string;
  /** when it is actually called "the headline number" */
  totalCue: string;
  narrowCue: string;
  stamp: string;
  stampCue: string;
  bg?: "ink" | "paper";
}> = ({
  from, to, kicker, leftLabel, rightLabel, premiumCue, poolCue,
  totalLabel, totalEnterCue, totalCue, narrowCue, stamp, stampCue, bg = "ink",
}) => {
  const ms = useMs();
  const vis = useVis(from, to, 420, 300);
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const sub = bg === "ink" ? INK_SUB : COLORS.grayText;
  const hair = bg === "ink" ? "rgba(255,255,255,0.22)" : COLORS.border;

  const k = usePop(from + 200, { rise: 12 });
  const premOn = cue(premiumCue, from + 3000, from);
  const poolOn = Math.max(cue(poolCue, premOn + 1200, from), premOn + 400);
  // The VO says "narrower" BEFORE it says "the headline number", so the bar has
  // to be established, then narrow, then be named — three separate spoken
  // moments, none of them an offset from another.
  const enterOn = Math.max(cue(totalEnterCue, poolOn + 4000, from), poolOn + 800);
  const narrowOn = Math.max(cue(narrowCue, enterOn + 900, from), enterOn + 400);
  const totalOn = Math.max(cue(totalCue, narrowOn + 1200, from), narrowOn + 300);
  const stampOn = Math.max(cue(stampCue, totalOn + 5000, from), totalOn + 1200);

  const st = useStamp(stampOn);
  const totLab = usePop(totalOn, { rise: 10 });

  const X0 = 300;
  const X1 = 1620;
  const W = X1 - X0;
  const BAND = 620; // the spectrum rule
  const N = 34;

  const bandP = clamp01(interpolate(ms, [from + 400, from + 1400], [0, 1], CLAMP));
  const premP = clamp01(interpolate(ms, [premOn, premOn + 900], [0, 1], CLAMP));
  const pool = clamp01(interpolate(ms, [poolOn, poolOn + 1500], [0, 1], { ...CLAMP, easing: Easing.inOut(Easing.cubic) }));
  const narrow = clamp01(interpolate(ms, [narrowOn, narrowOn + 1400], [0, 1], { ...CLAMP, easing: Easing.inOut(Easing.cubic) }));

  // the total bar: spans everything, then closes onto the pooled slice
  const POOL_A = X0 + W * 0.66;
  const barL = X0 + (POOL_A - X0) * narrow;
  const barR = X1;

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {kicker ? <div style={{ position: "absolute", left: 0, right: 0, top: 210, textAlign: "center", ...k }}><div style={caps(sub)}>{kicker}</div></div> : null}

      <svg width={1920} height={1080} style={{ position: "absolute", left: 0, top: 0 }}>
        <line x1={X0} y1={BAND} x2={X0 + W * bandP} y2={BAND} stroke={hair} strokeWidth={2} />
        {[X0, X1].map((x, i) => (
          <line key={i} x1={x} y1={BAND - 14} x2={x} y2={BAND + 14} stroke={hair} strokeWidth={3} opacity={bandP} />
        ))}
        {/* the premium, travelling right and piling up */}
        {Array.from({ length: N }).map((_, i) => {
          const u = (i + 0.5) / N;
          const startT = u; // evenly spread
          const endT = 0.66 + Math.pow(u, 1.6) * 0.33; // concentrated at the late-stage end
          const t = startT + (endT - startT) * pool;
          const h = 26 + rnd(i, 3) * 132;
          const on = clamp01(interpolate(ms, [premOn + rnd(i, 5) * 700, premOn + rnd(i, 5) * 700 + 300], [0, 1], CLAMP));
          return <circle key={i} cx={X0 + W * t} cy={BAND - h} r={7} fill={fg} opacity={on * premP * (0.45 + 0.55 * pool)} />;
        })}
        {/* the headline number, narrowing onto what actually earned it */}
        <rect
          x={barL} y={BAND + 54} width={Math.max(0, barR - barL)} height={16}
          fill={fg}
          opacity={clamp01(interpolate(ms, [enterOn, enterOn + 520], [0, 1], CLAMP)) * 0.9}
        />
      </svg>

      {/* spectrum ends — no values, because the script gives none */}
      <div style={{ position: "absolute", left: X0, top: BAND + 108, width: 520, opacity: bandP }}>
        <div style={{ ...caps(sub), lineHeight: 1.5 }}>{leftLabel}</div>
      </div>
      <div style={{ position: "absolute", left: X1 - 520, top: BAND + 108, width: 520, textAlign: "right", opacity: bandP }}>
        <div style={{ ...caps(fg), lineHeight: 1.5 }}>{rightLabel}</div>
      </div>

      <div style={{ position: "absolute", left: X0, top: BAND + 30, width: W, textAlign: "center", ...totLab }}>
        <div style={caps(sub, TYPE.labelSm)}>{totalLabel}</div>
      </div>

      <div style={{ position: "absolute", left: 0, right: 0, top: 826, textAlign: "center", ...st }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 82, letterSpacing: TRACK.display, color: fg, lineHeight: 1.1 }}>{stamp}</div>
      </div>
    </AbsoluteFill>
  );
};
