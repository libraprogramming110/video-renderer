// ─────────────────────────────────────────────────────────────────────────
// KIT · oral — the "two rivals, one quarter, several metrics" family.
// (added BioIntel oral GLP-1 Q2 long-form, 2026-08-21)
//
//   • GapLanes        — THE SPINE. Two lanes sharing an origin, held across
//                       three sections while the METRIC underneath them
//                       changes. The bars re-scale on cue and a gap readout
//                       re-measures, so "the sales gap is wider than the
//                       efficacy gap" is READ OFF THE PICTURE rather than
//                       asserted. Reach for it when a script compares the same
//                       two entities on more than one axis.
//   • ExtendVsScratch — show-don't-tell for "one extended a known brand, the
//                       other is building awareness from nothing". One name
//                       ATTACHES a new segment to an existing solid mass; the
//                       other sits in a dashed outline and never fully
//                       resolves. Carries NO figures and NO proportion.
//   • VolumeNotMargin — a bar that already won gets RE-READ. A price trace
//                       cliffs above it, a discount region veils it, and a
//                       VOLUME span (full, solid) is answered by a MARGIN span
//                       that is short and ends DASHED. The unresolved end is
//                       the word "yet".
//
// All portrait-first, bg-aware, monochrome — emphasis from weight/size/dim,
// never a loud colour and never a glyph mark.
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { CLAMP, clamp01, caps, COLORS, cue, cueSeq, DISPLAY, INK_SUB, inkA, SANS, TRACK, useMs, usePop, useStamp } from "./core";
import { FORMAT, TYPE } from "../style";

const V = FORMAT.key === "vertical";

// The one place the piece's horizontal geometry lives, so every block in this
// module returns to the SAME seats (the "build the closer out of the video's own
// vocabulary" rule, extended to exact constants).
export const LEFT = V ? 90 : 260;
export const TRACK_W = V ? 900 : 1400;

// A beat's own visibility window (fade in after `from`, out before `to`).
const useVis = (from: number, to: number, padIn = 360, padOut = 360) => {
  const ms = useMs();
  return clamp01(interpolate(ms, [from, from + padIn, to - padOut, to], [0, 1, 1, 0], CLAMP));
};

/** Make a rising list of onsets strictly increasing, whatever the cues resolved to. */
const monotonic = (xs: number[], minGap = 120) => {
  const out: number[] = [];
  xs.forEach((x, i) => out.push(i === 0 ? x : Math.max(x, out[i - 1] + minGap)));
  return out;
};

// ═══════════════════════════════════════════════════════════════════════════
// SwapSlot — a slot whose CONTENT changes over the beat. Each item fades in on
// its own onset and out as the next arrives, so a figure can resolve, convert
// ("3.22B kr" → "$496M") and later be replaced by a different metric entirely,
// all in one seat with no layout jump. An empty `text` clears the slot, which is
// how a metric change leaves it blank until its own first figure is voiced.
// ═══════════════════════════════════════════════════════════════════════════
const SwapSlot: React.FC<{
  items: { text: string; on: number }[];
  style: React.CSSProperties;
  align?: "left" | "right" | "center";
}> = ({ items, style, align = "right" }) => {
  const ms = useMs();
  return (
    <div style={{ position: "relative", height: (style.fontSize as number) * 1.15, minWidth: 10 }}>
      {items.map((it, i) => {
        const on = it.on;
        const off = items[i + 1]?.on;
        const inP = clamp01(interpolate(ms, [on, on + 240], [0, 1], CLAMP));
        const outP = off == null ? 1 : clamp01(interpolate(ms, [off, off + 240], [1, 0], CLAMP));
        const op = inP * outP;
        if (!it.text) return null;
        return (
          <div
            key={i}
            style={{
              ...style,
              position: "absolute",
              right: align === "right" ? 0 : undefined,
              left: align === "left" ? 0 : undefined,
              top: 0,
              whiteSpace: "nowrap",
              opacity: op,
              transform: `translateY(${interpolate(inP, [0, 1], [14, 0], CLAMP)}px)`,
            }}
          >
            {it.text}
          </div>
        );
      })}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// GapLanes — THE SPINE.
//
// Two lanes grow from one origin. The LEADER always spans the full track; the
// CHALLENGER spans `share` of it. Every entry in `metrics` re-scales the
// challenger on its own spoken cue and swaps both figure slots and the gap
// readout, so one object carries a whole argument across several sections
// without a world wipe under it.
//
// ⚠️ The bars carry NO axis and NO scale. Extent means "against the leader" and
// nothing else — the figures printed beside them are the only quantities
// claimed, and each one must come from the script.
// ═══════════════════════════════════════════════════════════════════════════
export type LaneDef = {
  name: string;
  nameCue?: string;
  nameMs?: number;
  sub?: string;
  subCue?: string;
  subMs?: number;
};

export type MetricDef = {
  /** caps label under the kicker — what the bars currently mean */
  label: string;
  labelCue?: string;
  labelMs?: number;
  /** a smaller qualifier under the label ("Q2 2026", "AT 72 WEEKS") */
  note?: string;
  noteCue?: string;
  noteMs?: number;
  /** challenger extent as a fraction of the leader, for THIS metric */
  share: number;
  /** when the LEADER's bar fills for this metric (it is the reference, so it
   *  fills once and stays; later metrics may re-assert it but never retract it) */
  leaderGrowCue?: string;
  leaderGrowMs?: number;
  /** when the CHALLENGER's bar travels to this metric's proportion. ⚠️ A metric
   *  change RETIRES the challenger's old extent to zero first — a bar left at the
   *  sales proportion under an efficacy label is a false statement for as long as
   *  it sits there. */
  growCue?: string;
  growMs?: number;
  /** the gap readout for this metric. `gapValue` is OPTIONAL and should carry a
   *  figure ONLY where the script speaks one — the span itself is the measurement,
   *  so a metric with no stated ratio simply shows a shorter span. */
  gapLabel: string;
  gapValue?: string;
  gapCue?: string;
  gapMs?: number;
  /** figures resolving in the leader / challenger slots, in spoken order */
  leaderFigures?: { text: string; cue?: string; ms?: number }[];
  challengerFigures?: { text: string; cue?: string; ms?: number }[];
};

export const GapLanes: React.FC<{
  from: number;
  to: number;
  kicker?: string;
  leader: LaneDef;
  challenger: LaneDef;
  metrics: MetricDef[];
  bg?: "ink" | "paper";
  /** ms the bars take to travel to a new metric's proportions */
  growMs?: number;
}> = ({ from, to, kicker, leader, challenger, metrics, bg = "ink", growMs = 760 }) => {
  const ms = useMs();
  const vis = useVis(from, to, 420, 420);
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const sub = bg === "ink" ? INK_SUB : COLORS.grayText;
  const rail = bg === "ink" ? "rgba(255,255,255,0.16)" : inkA(0.14);

  // ── resolve every onset, then clamp monotonic so no interpolate range inverts
  const labelOn = monotonic(metrics.map((m, i) => m.labelMs ?? cue(m.labelCue, from + i * 3000, from)), 400);
  // ⚠️ EVERY metric-level cue is scoped to ITS OWN metric, never to the block's
  // `from`. cueMs prefix-matches bidirectionally, so a later figure grabs an
  // earlier, shorter one: "16.6%" and "11.2" both normalise to strings the bare
  // "1" of "5 to 1" (4.56s) is a prefix of, and a block-scoped cue resolved both
  // of them to 4.56s — ~24s early, onto a graphic that meant something else.
  // Scoping to the metric's own label is what makes them land.
  const scope = (i: number) => (i === 0 ? from : Math.max(from, labelOn[i] - 800));
  const leadGrowOn = monotonic(
    metrics.map((m, i) => Math.max(m.leaderGrowMs ?? cue(m.leaderGrowCue, labelOn[i] + 400, scope(i)), labelOn[i])),
    400
  );
  const growOn = monotonic(
    metrics.map((m, i) => Math.max(m.growMs ?? cue(m.growCue, labelOn[i] + 400, scope(i)), labelOn[i] + 500)),
    400
  );
  const gapOn = monotonic(metrics.map((m, i) => m.gapMs ?? cue(m.gapCue, growOn[i] + 900, scope(i))), 400);
  const noteOn = monotonic(metrics.map((m, i) => m.noteMs ?? cue(m.noteCue, labelOn[i] + 300, scope(i))), 300);

  // ── lane identity
  const leaderName = usePop(leader.nameMs ?? cue(leader.nameCue, from + 200, from), { rise: 18, scale: true });
  const leaderSub = usePop(leader.subMs ?? cue(leader.subCue, from + 900, from), { rise: 10 });
  const chalName = usePop(challenger.nameMs ?? cue(challenger.nameCue, from + 1400, from), { rise: 18, scale: true });
  const chalSub = usePop(challenger.subMs ?? cue(challenger.subCue, from + 2000, from), { rise: 10 });

  // ── bar extents, as keyframe tracks. Built by construction so every
  //    interpolate range is strictly increasing whatever the cues resolved to.
  const track = (pairs: [number, number][]) => {
    const keys = monotonic(pairs.map((p) => p[0]), 60);
    return clamp01(interpolate(ms, keys, pairs.map((p) => p[1]), { ...CLAMP, easing: Easing.inOut(Easing.cubic) }));
  };
  // The leader is the REFERENCE: it fills on its first grow cue and stays full.
  const leaderFrac = track([
    [leadGrowOn[0], 0],
    [leadGrowOn[0] + growMs, 1],
  ]);
  // The challenger RETIRES to zero at each metric change, then refills on the cue
  // for the new metric — nothing is ever shown under a label it doesn't belong to.
  const chalPairs: [number, number][] = [[growOn[0], 0], [growOn[0] + growMs, metrics[0].share]];
  metrics.forEach((m, i) => {
    if (i === 0) return;
    chalPairs.push([labelOn[i], metrics[i - 1].share]);
    chalPairs.push([labelOn[i] + 380, 0]);
    chalPairs.push([growOn[i], 0]);
    chalPairs.push([growOn[i] + growMs, m.share]);
  });
  const chalFrac = track(chalPairs);

  // ── figure slots. A metric boundary inserts an empty item so a stale figure
  //    never labels the new metric's bar.
  const flatten = (pick: (m: MetricDef) => MetricDef["leaderFigures"]) => {
    const items: { text: string; on: number }[] = [];
    metrics.forEach((m, i) => {
      if (i > 0) items.push({ text: "", on: labelOn[i] });
      (pick(m) ?? []).forEach((f, k) => {
        items.push({ text: f.text, on: f.ms ?? cue(f.cue, growOn[i] + 500 + k * 900, scope(i)) });
      });
    });
    // keep the slot's own timeline rising
    const ons = monotonic(items.map((x) => x.on), 200);
    return items.map((x, i) => ({ ...x, on: ons[i] }));
  };
  const leaderItems = flatten((m) => m.leaderFigures);
  const chalItems = flatten((m) => m.challengerFigures);

  // ── the swapping metric label + gap readout
  const metricItems = metrics.map((m, i) => ({ text: m.label, on: labelOn[i] }));
  const noteItems: { text: string; on: number }[] = [];
  metrics.forEach((m, i) => {
    if (i > 0) noteItems.push({ text: "", on: labelOn[i] });
    if (m.note) noteItems.push({ text: m.note, on: Math.max(noteOn[i], labelOn[i]) });
  });
  const activeMetric = metrics.reduce((acc, _m, i) => (ms >= labelOn[i] ? i : acc), 0);
  const gapReached = metrics.reduce((acc, _m, i) => (ms >= gapOn[i] ? i : acc), -1);
  const activeGap = gapReached >= activeMetric ? gapReached : -1;

  const nameStyle: React.CSSProperties = {
    fontFamily: DISPLAY,
    fontWeight: 700,
    fontSize: V ? 56 : 44,
    letterSpacing: TRACK.headline,
    color: fg,
    lineHeight: 1,
  };
  const figStyle: React.CSSProperties = {
    fontFamily: DISPLAY,
    fontWeight: 700,
    fontSize: V ? 76 : 60,
    letterSpacing: TRACK.display,
    color: fg,
    lineHeight: 1,
    fontVariantNumeric: "tabular-nums",
  };
  const BAR_H = V ? 72 : 48;

  const Lane: React.FC<{
    lane: LaneDef;
    namePop: React.CSSProperties;
    subPop: React.CSSProperties;
    frac: number;
    items: { text: string; on: number }[];
    solid: boolean;
  }> = ({ lane, namePop, subPop, frac, items, solid }) => (
    <div style={{ width: TRACK_W }}>
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 40 }}>
        <div style={{ ...namePop }}>
          <div style={nameStyle}>{lane.name}</div>
          {lane.sub ? <div style={{ ...subPop, ...caps(sub), marginTop: 14 }}>{lane.sub}</div> : null}
        </div>
        <div style={{ flex: 1 }} />
        <SwapSlot items={items} style={{ ...figStyle, opacity: solid ? 1 : 0.86 }} align="right" />
      </div>
      {/* the empty track, then the fill */}
      <div style={{ position: "relative", width: TRACK_W, height: BAR_H, marginTop: 20 }}>
        <div style={{ position: "absolute", inset: 0, border: `2px solid ${rail}`, borderRadius: 3 }} />
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            bottom: 0,
            width: TRACK_W * frac,
            background: solid ? fg : bg === "ink" ? "rgba(255,255,255,0.42)" : inkA(0.34),
            borderRadius: 3,
          }}
        />
      </div>
    </div>
  );

  return (
    <AbsoluteFill style={{ opacity: vis, justifyContent: "center", alignItems: "center", padding: `0 ${LEFT}px` }}>
      <div style={{ width: TRACK_W, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
        {kicker ? <div style={caps(sub)}>{kicker}</div> : null}
        <div style={{ marginTop: 18 }}>
          <SwapSlot
            items={metricItems}
            style={{ ...caps(fg), fontWeight: 700 }}
            align="left"
          />
        </div>
        <div style={{ marginTop: 8 }}>
          <SwapSlot items={noteItems} style={{ ...caps(sub, TYPE.labelSm) }} align="left" />
        </div>

        <div style={{ height: V ? 118 : 62 }} />
        <Lane lane={leader} namePop={leaderName} subPop={leaderSub} frac={leaderFrac} items={leaderItems} solid />
        <div style={{ height: V ? 118 : 60 }} />
        <Lane lane={challenger} namePop={chalName} subPop={chalSub} frac={chalFrac} items={chalItems} solid={false} />

        <div style={{ height: V ? 120 : 62 }} />
        <div style={{ width: TRACK_W, height: 2, background: rail }} />

        {/* ── THE GAP, as a physical span between the two bar ends ──────────
            Not a number in a slot. Each metric's gap occupies the real distance
            [share·TRACK → TRACK] directly under the bars it measures, so it is a
            READOUT of the picture rather than a second claim about it.

            The motion is the argument: the first metric's span OPENS from zero,
            and every later one arrives at the PREVIOUS span's left edge and
            travels right — the gap visibly CLOSING. The superseded span stays as
            a dashed ghost at its old width, so §3 is measured against §2 on
            screen instead of asking the viewer to remember it.

            This is also what stops §3 being §2 with different numbers: the bars
            re-scale (same motion as before), but the spans do something they have
            not done yet. (operator flagged the duplicate read, 2026-08-21) */}
        <div style={{ width: TRACK_W, marginTop: 30, display: "flex", flexDirection: "column", gap: V ? 26 : 18 }}>
          {metrics.map((m, i) => {
            if (activeGap < 0 || i > activeGap) return null;
            const isCurrent = i === activeGap;
            const myLeft = TRACK_W * m.share;
            const prevLeft = i === 0 ? TRACK_W : TRACK_W * metrics[i - 1].share;
            // travels from where the previous gap sat, to where this one sits
            const t = clamp01(
              interpolate(ms, [gapOn[i], gapOn[i] + 820], [0, 1], { ...CLAMP, easing: Easing.inOut(Easing.cubic) })
            );
            const left = interpolate(t, [0, 1], [prevLeft, myLeft], CLAMP);
            const col = isCurrent ? fg : sub;
            const tick = { width: 2, height: V ? 26 : 20, background: col } as React.CSSProperties;
            return (
              <div key={i} style={{ width: TRACK_W, opacity: isCurrent ? 1 : 0.45 }}>
                <div style={{ position: "relative", height: V ? 26 : 20 }}>
                  <div style={{ position: "absolute", left, right: 0, top: 0, display: "flex", alignItems: "center" }}>
                    <div style={tick} />
                    <div
                      style={{
                        flex: 1,
                        height: 2,
                        background: isCurrent ? col : "transparent",
                        backgroundImage: isCurrent
                          ? undefined
                          : `repeating-linear-gradient(90deg, ${col} 0 12px, transparent 12px 22px)`,
                      }}
                    />
                    <div style={tick} />
                  </div>
                </div>
                <div style={{ position: "relative", height: V ? 40 : 32, marginTop: 12 }}>
                  <div style={{ position: "absolute", left, top: 0, display: "flex", alignItems: "baseline", gap: 18 }}>
                    <span style={caps(col)}>{m.gapLabel}</span>
                    {m.gapValue ? (
                      <span
                        style={{
                          fontFamily: DISPLAY,
                          fontWeight: 700,
                          fontSize: V ? 40 : 34,
                          letterSpacing: TRACK.display,
                          color: col,
                          lineHeight: 1,
                          fontVariantNumeric: "tabular-nums",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {m.gapValue}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// ExtendVsScratch — one brand ATTACHES a new segment to a mass it already has;
// the other sits in a dashed outline whose name never fully resolves.
//
// ⚠️ Deliberately carries no figures and no proportion. The challenger's name
// fades out under a gradient mask that advances a little and stalls — there are
// no countable units, because "awareness" has no number in the script.
// ═══════════════════════════════════════════════════════════════════════════
export const ExtendVsScratch: React.FC<{
  from: number;
  to: number;
  lead: string;
  leadSize?: number;
  /** the incumbent: `base` already exists, `add` docks onto it on its cue */
  extend: { base: string; add: string; addCue?: string; addMs?: number; tag: string; tagCue?: string; tagMs?: number };
  /** the newcomer: an outline that never fills */
  scratch: { name: string; showCue?: string; showMs?: number; buildCue?: string; buildMs?: number; tag: string; tagCue?: string; tagMs?: number };
  bg?: "ink" | "paper";
}> = ({ from, to, lead, leadSize, extend, scratch, bg = "paper" }) => {
  const ms = useMs();
  const vis = useVis(from, to, 380, 380);
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const sub = bg === "ink" ? INK_SUB : COLORS.grayText;

  // the lead line flows word-by-word on its own spoken frames
  const toks = lead.split(/\s+/).filter(Boolean);
  const onsets = cueSeq(toks, from, to);
  const span = Math.max(700, 2600);
  const leadOn = onsets.map((m, i) => m ?? from + 200 + (span * i) / Math.max(1, toks.length - 1));

  const addOn = extend.addMs ?? cue(extend.addCue, from + 2400, from);
  const eTagOn = Math.max(extend.tagMs ?? cue(extend.tagCue, addOn + 1800, from), addOn + 700);
  const showOn = Math.max(scratch.showMs ?? cue(scratch.showCue, eTagOn + 900, from), eTagOn + 500);
  const buildOn = Math.max(scratch.buildMs ?? cue(scratch.buildCue, showOn + 700, from), showOn + 350);
  const sTagOn = Math.max(scratch.tagMs ?? cue(scratch.tagCue, buildOn + 2200, from), buildOn + 900);

  // ⚠️ Sized to USE the 9:16 height. A block centred in the frame can still be
  // under-built: v1 filled 42% of the content band, which reads as small type
  // marooned in a dead third top and bottom. Centre-balance is necessary but not
  // sufficient — check FILL too. (operator caught it, 2026-08-21)
  const PLATE_H = V ? 180 : 100;
  const NAME = V ? 78 : 48;
  const padX = V ? 44 : 30;
  // shrink-to-fit widths are budgeted, never drawn to — caps() costs ~0.74em/glyph
  const capsW = (s: string, size: number) => s.length * size * 0.74;
  const baseW = capsW(extend.base, NAME) + padX * 2;
  const addW = capsW(extend.add, NAME) + padX * 2;
  const scratchW = baseW + addW + (V ? 8 : 6); // the same total the incumbent ends at — same job, one has it

  // the added segment travels in from the left and seats flush against the base
  const dock = clamp01(interpolate(ms, [addOn, addOn + 520], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) }));
  const addX = interpolate(dock, [0, 1], [-160, 0], CLAMP);
  const SEAM = V ? 8 : 6; // hairline of background between the two blocks

  const eTag = usePop(eTagOn, { rise: 12 });
  const sTag = usePop(sTagOn, { rise: 12 });
  const showP = clamp01(interpolate(ms, [showOn, showOn + 420], [0, 1], CLAMP));
  // The newcomer's name builds letter by letter and STALLS at half. It starts at
  // zero (pure outline — nothing is established yet) and never completes, because
  // the script says the awareness is still being built. Half is a rhetorical
  // midpoint, not a measurement: nothing here claims how far along they are.
  const build = interpolate(ms, [buildOn, buildOn + 1500], [0, 0.5], { ...CLAMP, easing: Easing.out(Easing.cubic) });

  const nameStyle: React.CSSProperties = {
    fontFamily: DISPLAY,
    fontWeight: 700,
    fontSize: NAME,
    letterSpacing: TRACK.kicker,
    textTransform: "uppercase",
    lineHeight: 1,
    whiteSpace: "nowrap",
  };

  return (
    <AbsoluteFill style={{ opacity: vis, justifyContent: "center", alignItems: "flex-start", padding: `0 ${LEFT}px` }}>
      <div style={{ width: TRACK_W }}>
        <div style={{ display: "flex", flexWrap: "wrap", maxWidth: TRACK_W }}>
          {toks.map((t, i) => {
            const p = clamp01(interpolate(ms, [leadOn[i], leadOn[i] + 130], [0, 1], CLAMP));
            return (
              <span
                key={i}
                style={{
                  fontFamily: DISPLAY,
                  fontWeight: 600,
                  fontSize: leadSize ?? (V ? 80 : 54),
                  letterSpacing: TRACK.headline,
                  color: sub,
                  lineHeight: 1.14,
                  marginRight: "0.26em",
                  opacity: p,
                  transform: `translateY(${interpolate(p, [0, 1], [12, 0], CLAMP)}px)`,
                }}
              >
                {t}
              </span>
            );
          })}
        </div>

        <div style={{ height: V ? 270 : 96 }} />

        {/* ── the incumbent: a solid mass that gains a segment. The two blocks stay
            SEPARATE — butted together with a hairline of background between them,
            not fused and not divided by an inner rule. v2 drew a light line inside
            one continuous plate and it read as a segmented UI control: wrong
            register for an editorial brand, and it made the halves look like equal
            peers instead of "a new piece added to an existing one". Two touching
            blocks say assembled; one ruled block says widget. ── */}
        <div style={{ display: "flex", alignItems: "stretch", height: PLATE_H, position: "relative" }}>
          <div
            style={{
              width: addW,
              background: fg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              opacity: dock,
              transform: `translateX(${addX}px)`,
            }}
          >
            <div style={{ ...nameStyle, color: bg === "ink" ? COLORS.ink : COLORS.paper }}>{extend.add}</div>
          </div>
          <div
            style={{
              width: baseW,
              background: fg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginLeft: interpolate(dock, [0, 1], [-addW, SEAM], CLAMP),
            }}
          >
            <div style={{ ...nameStyle, color: bg === "ink" ? COLORS.ink : COLORS.paper }}>{extend.base}</div>
          </div>
        </div>
        <div style={{ ...eTag, marginTop: 22 }}>
          <div style={caps(sub)}>{extend.tag}</div>
        </div>

        <div style={{ height: V ? 250 : 84 }} />

        {/* ── the newcomer: a dashed outline whose name never fully resolves ── */}
        <div
          style={{
            width: scratchW,
            height: PLATE_H,
            border: `3px dashed ${bg === "ink" ? "rgba(255,255,255,0.34)" : inkA(0.30)}`,
            borderRadius: 3,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            opacity: showP,
          }}
        >
          {/* ⚠️ The unbuilt part is an OUTLINE, not a fade — v1 masked the name to
              near-transparent and it read as broken text rather than as a
              half-built brand. And the boundary walks WHOLE LETTERS, not pixels:
              a pixel clip bisected the "N" and that half-solid glyph read as a
              rendering fault, which is exactly the failure the outline was
              supposed to fix. Letters are the only boundary that always lands
              clean, at any size, in any font. (operator caught both, 2026-08-21) */}
          <div style={{ ...nameStyle, display: "flex", color: fg }}>
            {scratch.name.split("").map((ch, i) => {
              const solid = i < Math.round(build * scratch.name.length);
              return (
                <span
                  key={i}
                  style={
                    solid
                      ? { color: fg }
                      : { color: "transparent", WebkitTextStroke: `2px ${fg}`, opacity: 0.5 }
                  }
                >
                  {ch}
                </span>
              );
            })}
          </div>
        </div>
        <div style={{ ...sTag, marginTop: 22 }}>
          <div style={caps(sub)}>{scratch.tag}</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// VolumeNotMargin — the bar that won, re-read.
//
// A price trace draws flat and CLIFFS on its cue; the revenue bar returns to the
// same seat it held in the spine; a discount veil settles over most of it; then a
// VOLUME span (full, solid) is answered by a MARGIN span that is short and ends
// DASHED, marching off unresolved. The dashed end is the word "yet".
//
// ⚠️ The discount veil and the margin span carry NO figures and their right edges
// are DASHED on purpose. The script names no margin and no discount size; a
// measured split would invent precision it never claims. Only the price move is
// a number, because only the price move is stated.
// ═══════════════════════════════════════════════════════════════════════════
export const VolumeNotMargin: React.FC<{
  from: number;
  to: number;
  kicker?: string;
  price: { label: string; move: string; drawCue?: string; drawMs?: number; cliffCue?: string; cliffMs?: number };
  bar: { label: string; showCue?: string; showMs?: number };
  veil: { label: string; cue?: string; ms?: number };
  volume: { label: string; cue?: string; ms?: number };
  margin: { label: string; cue?: string; ms?: number; tail: string; tailCue?: string; tailMs?: number };
  bg?: "ink" | "paper";
}> = ({ from, to, kicker, price, bar, veil, volume, margin, bg = "ink" }) => {
  const ms = useMs();
  const vis = useVis(from, to, 380, 380);
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const sub = bg === "ink" ? INK_SUB : COLORS.grayText;
  const rail = bg === "ink" ? "rgba(255,255,255,0.16)" : inkA(0.14);

  const drawOn = price.drawMs ?? cue(price.drawCue, from + 150, from);
  const cliffOn = Math.max(price.cliffMs ?? cue(price.cliffCue, drawOn + 1200, from), drawOn + 500);
  const barOn = Math.max(bar.showMs ?? cue(bar.showCue, cliffOn + 1600, from), cliffOn + 900);
  const veilOn = Math.max(veil.ms ?? cue(veil.cue, barOn + 900, from), barOn + 500);
  const volOn = Math.max(volume.ms ?? cue(volume.cue, veilOn + 1800, from), veilOn + 700);
  const marOn = Math.max(margin.ms ?? cue(margin.cue, volOn + 900, from), volOn + 500);
  const tailOn = Math.max(margin.tailMs ?? cue(margin.tailCue, marOn + 900, from), marOn + 500);

  // ── the price trace. A fixed wobble array — never Math.random(), which
  //    re-rolls every frame and boils.
  const W = TRACK_W;
  const H = V ? 340 : 220;
  const wob = [0, -6, 4, -3, 7, -5, 2, -8, 3, 0];
  const flatY = H * 0.26;
  const lowY = H * 0.82;
  const cliffX = W * 0.62;
  let d = `M 0 ${flatY}`;
  for (let i = 1; i < wob.length; i++) {
    d += ` L ${(cliffX * i) / (wob.length - 1)} ${flatY + wob[i]}`;
  }
  d += ` L ${cliffX + W * 0.07} ${lowY} L ${W} ${lowY - 4}`;
  // flat portion draws first, then the cliff falls on its own cue
  const draw = clamp01(
    interpolate(ms, [drawOn, cliffOn, cliffOn + 620], [0, 0.6, 1], { ...CLAMP, easing: Easing.out(Easing.quad) })
  );
  const moveStamp = useStamp(cliffOn + 420, { from: 1.14 });
  // the trace steps back once the argument moves to the bar — a finished payoff
  // that keeps shouting is what makes a frame unreadable (the "let things retire" rule)
  const traceDim = interpolate(ms, [volOn, volOn + 600], [1, 0.5], CLAMP);

  const barP = clamp01(interpolate(ms, [barOn, barOn + 520], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) }));
  const veilP = clamp01(interpolate(ms, [veilOn, veilOn + 700], [0, 1], CLAMP));
  const veilW = W * 0.78; // its right edge is dashed; the boundary is not a measurement
  const volP = clamp01(interpolate(ms, [volOn, volOn + 420], [0, 1], CLAMP));
  const marP = clamp01(interpolate(ms, [marOn, marOn + 420], [0, 1], CLAMP));
  const marW = W * 0.19;
  const tailP = clamp01(interpolate(ms, [tailOn, tailOn + 600], [0, 1], CLAMP));

  const BAR_H = V ? 88 : 56;
  const spanRow = (label: string, w: number, p: number, dashed: boolean) => (
    <div style={{ opacity: p, width: W }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <div style={{ width: 2, height: 24, background: dashed ? sub : fg }} />
        <div
          style={{
            width: Math.max(0, w - 4),
            height: 2,
            background: dashed ? "transparent" : fg,
            backgroundImage: dashed ? `repeating-linear-gradient(90deg, ${sub} 0 12px, transparent 12px 22px)` : undefined,
          }}
        />
        {dashed ? null : <div style={{ width: 2, height: 24, background: fg }} />}
      </div>
      <div style={{ ...caps(dashed ? sub : fg, V ? 30 : 22), marginTop: 14 }}>{label}</div>
    </div>
  );

  return (
    <AbsoluteFill style={{ opacity: vis, justifyContent: "center", alignItems: "flex-start", padding: `0 ${LEFT}px` }}>
      <div style={{ width: W }}>
        {kicker ? <div style={{ ...caps(sub), marginBottom: 26 }}>{kicker}</div> : null}

        {/* ── the price trace ── */}
        <div style={{ position: "relative", width: W, height: H, opacity: traceDim }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: flatY, height: 2, background: rail }} />
          <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
            <path
              d={d}
              pathLength={100}
              fill="none"
              stroke={fg}
              strokeWidth={4}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeDasharray={100}
              strokeDashoffset={100 - draw * 100}
            />
          </svg>
          <div style={{ position: "absolute", left: 0, top: -4, ...caps(sub, TYPE.labelSm) }}>{price.label}</div>
          <div style={{ ...moveStamp, position: "absolute", left: cliffX + W * 0.1, top: lowY - (V ? 124 : 82), transformOrigin: "left center" }}>
            <div
              style={{
                fontFamily: DISPLAY,
                fontWeight: 700,
                fontSize: V ? 100 : 74,
                letterSpacing: TRACK.display,
                color: fg,
                lineHeight: 1,
                fontVariantNumeric: "tabular-nums",
              }}
            >
              {price.move}
            </div>
          </div>
        </div>

        <div style={{ height: V ? 150 : 60 }} />

        {/* ── the revenue bar, returning to its seat, then veiled ── */}
        <div style={{ ...caps(sub, TYPE.labelSm), opacity: barP, marginBottom: 14 }}>{bar.label}</div>
        <div style={{ position: "relative", width: W, height: BAR_H }}>
          <div style={{ position: "absolute", inset: 0, border: `2px solid ${rail}`, borderRadius: 3 }} />
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: W * barP, background: fg, borderRadius: 3 }} />
          {/* the discount veil — a hatch with a DASHED right edge, not a measured split */}
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              bottom: 0,
              width: veilW,
              opacity: veilP * 0.92,
              backgroundImage: `repeating-linear-gradient(135deg, ${
                bg === "ink" ? inkA(0.85) : "rgba(255,255,255,0.85)"
              } 0 9px, transparent 9px 20px)`,
              borderRight: `3px dashed ${bg === "ink" ? inkA(0.75) : "rgba(255,255,255,0.8)"}`,
              borderRadius: 3,
            }}
          />
          <div
            style={{
              position: "absolute",
              left: 26,
              top: BAR_H / 2 - (V ? 15 : 13),
              opacity: veilP,
              ...caps(bg === "ink" ? COLORS.ink : COLORS.paper, V ? 22 : 20),
            }}
          >
            {veil.label}
          </div>
        </div>

        <div style={{ height: V ? 110 : 44 }} />
        {spanRow(volume.label, W, volP, false)}
        <div style={{ height: V ? 70 : 28 }} />
        {spanRow(margin.label, marW, marP, true)}
        <div style={{ ...caps(sub), opacity: tailP, marginTop: 14, letterSpacing: TRACK.kicker }}>
          {margin.tail}
        </div>
      </div>
    </AbsoluteFill>
  );
};
