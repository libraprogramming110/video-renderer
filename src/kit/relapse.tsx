// ─────────────────────────────────────────────────────────────────────────
// KIT · relapse — RelapseLine, a SECTION-LENGTH SPINE for a claim that is
// SPATIAL: where on a disease's line of therapy a label actually lands.
// Built for the Zenbexus long-form (2026-08-15).
//
// Why a line and not three cards: "covers first relapse, NOT deep salvage",
// "that's the bigger market", and "the front-line combos now face a direct
// competitor" are all statements about WHERE ON A LINE something sits. Three
// separate cards can each assert one of them; only a line can show that they
// are the same fact seen three ways.
//
// Held ACROSS a section boundary with NO world wipe (the 08-07 EndpointSwitch
// rule): §A assembles and interrogates the axis, §B accumulates the actors
// around it. The axis never moves, so the second half lands on a picture the
// viewer already learned to read.
//
// ⚠️ REBUILT after the operator rejected v1 (2026-08-15). v1 drew the three
// lines of therapy as three BOXES and then hung more boxes off them — rivals,
// a tag pill, two market blocks — nine rectangles of near-identical weight, so
// nothing said which element was an axis, which was an actor and which was a
// measurement. Four rules came out of that and they are load-bearing here:
//
//   1. ONE SHAPE PER ROLE. The axis is a LINE (not boxes), the approved label
//      is a SOLID BAR ON that line, actors are BARE CAPS with leader ticks
//      (not pills), and the market is a HEIGHT (not another rectangle).
//   2. DON'T DOUBLE-ENCODE WIDTH. On an axis, horizontal extent already means
//      "position in the disease course". v1 also used width for market size,
//      so the same visual channel carried two unrelated claims. Market size is
//      now bar HEIGHT, which is free.
//   3. THE STILL MUST STILL MEAN SOMETHING (08-14). v1's predecessor bar just
//      shrank; once the motion finished it was an unexplained grey nub. It now
//      keeps a DASHED outline of its former extent, so the fall is readable on
//      a frozen frame.
//   4. LET THINGS RETIRE. v1 accumulated 14 live elements. The market row now
//      goes recessive when §B's actors arrive — present, no longer shouting.
//
// ⚠️ Honesty constraints, because the script gives no numbers here:
//   · the market bars carry NO axis, NO figures, NO gridlines — the VO says
//     "bigger", not how much bigger, so the heights are QUALITATIVE only
//     (the PipelineSpend rule, 08-06).
//   · only the two zones the SENTENCE compares get bars. Front-line gets none,
//     because the script never claims anything about its size — and a zero-
//     height bar there would claim it has no market.
//   · the predecessor bar carries no figure: "revenue falls" names a
//     direction, not an amount.
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { CLAMP, clamp01, caps, COLORS, cue, INK_SUB, inkA, useMs, usePop } from "./core";
import { FORMAT, TYPE } from "../style";

const V = FORMAT.key === "vertical";

type Win = { from: number; to: number };

// ── the one geometry table. Exported so a later beat can return to these seats. ──
// ⚠️ Sized to FILL the frame. v2 packed the whole diagram into y 400–1330 of a
// 1920 canvas, leaving ~28% of the frame dead below it and every element small —
// the operator's screenshot showed a compressed cluster floating above a void.
// A 9:16 diagram has to use its height: masthead clears ~110, footer starts
// ~1790, so the usable band is ~150–1750 and the content should sit centred in
// it. Type went up a step across the board at the same time; at 1080 wide, caps
// under ~20px read as furniture rather than labels.
export const RELAPSE_GEO = V
  ? {
      axisLeft: 90, axisRight: 960, arrowTip: 995, axisY: 1150,
      titleTop: 320, ownerTop: 500, rivalTop: 900,
      // ⚠️ The threat mark lives BELOW the axis. Above it, the band between the
      // rivals and the axis is already occupied by their leader ticks, and this
      // tag is 239px wide against a 290px zone — there is no horizontal slot it
      // can take up there without a tick running through the text. Moving it to
      // the boundary's underside also puts it out of reach of the succession
      // arrow, which terminates at the axis. Both earlier fixes (shrinking the
      // type, then nudging it 80px left) were treating the symptom.
      threatY: 1300, threatTagTop: 1318,
      barH: 64, labelTop: 1220, marketHeadTop: 1410, marketBase: 1620, marketMaxH: 150,
    }
  : {
      axisLeft: 360, axisRight: 1500, arrowTip: 1530, axisY: 620,
      titleTop: 230, ownerTop: 320, rivalTop: 480, threatTagTop: 520, threatY: 556,
      barH: 40, labelTop: 660, marketHeadTop: 715, marketBase: 820, marketMaxH: 66,
    };

const G = RELAPSE_GEO;
const ZONES = 3;
const zoneW = (G.axisRight - G.axisLeft) / ZONES;
const zoneLeft = (i: number) => G.axisLeft + i * zoneW;
const zoneMid = (i: number) => zoneLeft(i) + zoneW / 2;

export type RailSeg = { label: string };

// ── a zone label under the axis (struck = recessive, never deleted) ──────────
const ZoneLabel: React.FC<{
  ms: number; seg: RailSeg; index: number; drawMs: number; strikeMs?: number; fg: string; sub: string;
}> = ({ ms, seg, index, drawMs, strikeMs, fg, sub }) => {
  const d = clamp01(interpolate(ms, [drawMs + index * 130, drawMs + index * 130 + 380], [0, 1], CLAMP));
  const struck = strikeMs != null ? clamp01(interpolate(ms, [strikeMs, strikeMs + 380], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) })) : 0;
  // the strike runs through the LABEL, not through the axis: the disease course
  // is real, it is the APPROVAL that does not extend here.
  return (
    <div style={{ position: "absolute", left: zoneLeft(index), top: G.labelTop, width: zoneW, textAlign: "center", opacity: d * interpolate(struck, [0, 1], [1, 0.38], CLAMP) }}>
      <div style={{ position: "relative", display: "inline-block" }}>
        <div style={caps(sub, TYPE.labelSm)}>{seg.label}</div>
        {/* ⚠️ Width as a PERCENTAGE of the inline-block, not a glyph-count estimate.
            `length × size × 0.74` is a fine budget for checking whether a label
            FITS, but it is the wrong tool for drawing to a label's actual edge —
            it overshot "DEEP SALVAGE" and the rule ran past the final letter.
            The wrapper already shrink-wraps the text, so 100% is exact for any
            string in any weight. */}
        {strikeMs != null ? (
          <div style={{ position: "absolute", left: 0, top: "50%", width: `${struck * 100}%`, height: 2, background: fg, opacity: 0.8 }} />
        ) : null}
      </div>
    </div>
  );
};

// ── a rival: BARE CAPS + a leader tick down to the axis. No pill. ────────────
const Rival: React.FC<{
  ms: number; label: string; onset: number; seatMs: number; x: number; fg: string; ghost: string;
}> = ({ ms, label, onset, seatMs, x, fg, ghost }) => {
  const p = usePop(onset, { rise: 16 });
  const seat = clamp01(interpolate(ms, [seatMs, seatMs + 380], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) }));
  const tickTop = G.rivalTop + (V ? 34 : 24);
  return (
    <>
      <div style={{ position: "absolute", left: x - 90, top: G.rivalTop, width: 180, textAlign: "center", ...p }}>
        <div style={caps(fg)}>{label}</div>
      </div>
      <div style={{ position: "absolute", left: x - 1, top: tickTop, width: 2, height: (G.axisY - tickTop) * seat, background: ghost }} />
    </>
  );
};

// ── the spine ────────────────────────────────────────────────────────────────
export const RelapseLine: React.FC<Win & {
  title: string;
  titleCue: string;
  segments: [RailSeg, RailSeg, RailSeg];
  drawCue: string;
  asset: { label: string; segIndex: number; seatCue: string };
  strike: { segIndex: number; cue: string };
  market: {
    cue: string;
    head: string;
    /** zone index → qualitative height fraction. Only zones the SENTENCE compares. */
    bars: { seg: number; frac: number }[];
  };
  owner?: {
    label: string;
    cue: string;
    tag: string;
    tagCue: string;
    aboveSeg: number;
    successionCue: string;
    predecessor: { label: string; sub: string; cue: string; decayCue: string };
  };
  rivals?: { items: { label: string; cue: string }[]; seatCue: string; aboveSeg: number };
  threat?: { cue: string; tag: string; atBoundary: number };
  bg?: "ink" | "paper";
}> = ({ from, to, title, titleCue, segments, drawCue, asset, strike, market, owner, rivals, threat, bg = "ink" }) => {
  const ms = useMs();
  const bgInk = bg === "ink";
  const fg = bgInk ? COLORS.paper : COLORS.ink;
  const sub = bgInk ? INK_SUB : COLORS.grayText;
  const ghost = bgInk ? "rgba(255,255,255,0.30)" : inkA(0.24);
  const vis = clamp01(interpolate(ms, [from, from + 260, to + 150, to + 450], [0, 1, 1, 0], CLAMP));

  const drawMs = cue(drawCue, from + 200, from);
  const titleMs = cue(titleCue, from + 2400, from);
  const seatMs = cue(asset.seatCue, from + 1400, from);
  const strikeMs = cue(strike.cue, from + 4200, from);
  const marketMs = cue(market.cue, from + 6000, from);
  const ttl = usePop(titleMs, { rise: 12 });

  // the axis draws left→right, then its direction arrow appears
  const axisDraw = clamp01(interpolate(ms, [drawMs, drawMs + 700], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) }));
  const seat = clamp01(interpolate(ms, [seatMs, seatMs + 400], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) }));

  // ── §B ──
  const ownMs = owner ? cue(owner.cue, from + 8400, from) : 0;
  const ownTagMs = owner ? cue(owner.tagCue, ownMs + 900, from) : 0;
  const succMs = owner ? cue(owner.successionCue, ownMs + 2600, from) : 0;
  const predMs = owner ? cue(owner.predecessor.cue, succMs + 1400, from) : 0;
  const decayMs = owner ? cue(owner.predecessor.decayCue, predMs + 900, from) : 0;
  const own = usePop(ownMs, { rise: 14 });
  const ownTag = usePop(ownTagMs, { rise: 12 });
  const pred = usePop(predMs, { rise: 12 });
  const succ = clamp01(interpolate(ms, [succMs, succMs + 560], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) }));
  const decay = clamp01(interpolate(ms, [decayMs, decayMs + 900], [0, 1], { ...CLAMP, easing: Easing.inOut(Easing.cubic) }));

  const rivalSeatMs = rivals ? cue(rivals.seatCue, from + 15000, from) : 0;
  const threatMs = threat ? cue(threat.cue, from + 17000, from) : 0;
  const thr = clamp01(interpolate(ms, [threatMs, threatMs + 560], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) }));
  const thrTag = usePop(threatMs + 320, { rise: 10 });

  // RETIRE: once §B's actors arrive the market row goes recessive rather than
  // competing with them. Present, established, no longer shouting.
  const retire = owner ? interpolate(clamp01(interpolate(ms, [ownMs, ownMs + 700], [0, 1], CLAMP)), [0, 1], [1, 0.55], CLAMP) : 1;

  const succTop = G.ownerTop + (V ? 310 : 165);
  const barTop = G.axisY - G.barH / 2;

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <div style={{ position: "absolute", top: G.titleTop, left: 0, width: "100%", textAlign: "center", ...ttl }}>
        <div style={caps(sub)}>{title}</div>
      </div>

      {/* ── THE AXIS · one continuous line with a direction, not three boxes ── */}
      <div style={{ position: "absolute", left: G.axisLeft, top: G.axisY - 1, width: (G.axisRight - G.axisLeft) * axisDraw, height: 2, background: ghost }} />
      <div
        style={{
          position: "absolute", left: G.axisRight, top: G.axisY - 9, width: 0, height: 0,
          borderTop: "9px solid transparent", borderBottom: "9px solid transparent",
          borderLeft: `${G.arrowTip - G.axisRight}px solid ${ghost}`,
          opacity: clamp01(interpolate(axisDraw, [0.85, 1], [0, 1], CLAMP)),
        }}
      />
      {/* zone boundary ticks */}
      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          style={{
            position: "absolute", left: G.axisLeft + i * zoneW - 1, top: G.axisY - 12, width: 2, height: 24,
            background: ghost,
            opacity: clamp01(interpolate(ms, [drawMs + i * 120, drawMs + i * 120 + 300], [0, 1], CLAMP)),
          }}
        />
      ))}

      {/* the approved label: a SOLID BAR sitting ON the axis, spanning exactly
          the one zone the approval covers. Its absence elsewhere is the claim. */}
      <div
        style={{
          position: "absolute", left: zoneLeft(asset.segIndex), top: barTop,
          width: zoneW, height: G.barH, background: fg, borderRadius: 3,
          opacity: seat, transform: `scaleY(${interpolate(seat, [0, 1], [0.4, 1], CLAMP)})`,
          display: "flex", alignItems: "center", justifyContent: "center",
        }}
      >
        <div style={caps(bgInk ? COLORS.ink : COLORS.paper, V ? 30 : 21)}>{asset.label}</div>
      </div>

      {segments.map((seg, i) => (
        <ZoneLabel key={i} ms={ms} seg={seg} index={i} drawMs={drawMs} strikeMs={i === strike.segIndex ? strikeMs : undefined} fg={fg} sub={sub} />
      ))}

      {/* ── the market · HEIGHT, not width — width is already the axis ── */}
      <div style={{ position: "absolute", left: zoneLeft(market.bars[0].seg), top: G.marketHeadTop, width: zoneW * 2, opacity: clamp01(interpolate(ms, [marketMs + 320, marketMs + 760], [0, 1], CLAMP)) * retire }}>
        <div style={caps(sub, TYPE.labelSm)}>{market.head}</div>
      </div>
      <div style={{ position: "absolute", left: zoneLeft(market.bars[0].seg), top: G.marketBase, width: zoneW * 2, height: 2, background: ghost, opacity: clamp01(interpolate(ms, [marketMs, marketMs + 400], [0, 1], CLAMP)) * retire }} />
      {market.bars.map((b, i) => {
        const g = clamp01(interpolate(ms, [marketMs + i * 180, marketMs + i * 180 + 620], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) }));
        const h = G.marketMaxH * b.frac * g;
        return (
          <div
            key={i}
            style={{
              position: "absolute", left: zoneMid(b.seg) - (V ? 100 : 58), top: G.marketBase - h,
              width: V ? 200 : 116, height: h, background: fg, opacity: (i === 0 ? 1 : 0.42) * retire, borderRadius: 2,
            }}
          />
        );
      })}

      {/* ── §B · the owner column, above its own asset ── */}
      {owner ? (
        <>
          <div style={{ position: "absolute", left: zoneLeft(owner.aboveSeg), top: G.ownerTop, width: zoneW, textAlign: "center", ...own }}>
            <div style={caps(fg)}>{owner.label}</div>
          </div>
          {/* bare caps, not a pill — a pill would make it look like another actor */}
          <div style={{ position: "absolute", left: zoneLeft(owner.aboveSeg), top: G.ownerTop + (V ? 60 : 36), width: zoneW, textAlign: "center", ...ownTag }}>
            <div style={caps(sub, TYPE.labelSm)}>{owner.tag}</div>
          </div>

          {/* the predecessor: a DASHED outline of what it was, with the solid fill
              retreating inside it. Legible frozen — the gap IS the fall. */}
          <div style={{ position: "absolute", left: zoneLeft(owner.aboveSeg), top: G.ownerTop + (V ? 150 : 84), width: zoneW, textAlign: "center", ...pred }}>
            <div style={caps(sub, TYPE.labelSm)}>{owner.predecessor.label}</div>
          </div>
          <div style={{ position: "absolute", left: zoneMid(owner.aboveSeg) - (V ? 130 : 72), top: G.ownerTop + (V ? 190 : 108), width: V ? 260 : 144, height: V ? 50 : 24, border: `2px dashed ${ghost}`, borderRadius: 3, ...pred }} />
          <div
            style={{
              position: "absolute", left: zoneMid(owner.aboveSeg) - (V ? 130 : 72) + 2, top: G.ownerTop + (V ? 190 : 108) + 2,
              width: ((V ? 260 : 144) - 4) * interpolate(decay, [0, 1], [1, 0.34], CLAMP), height: (V ? 50 : 24) - 4,
              background: fg, opacity: (pred.opacity as number) * 0.85, borderRadius: 2,
            }}
          />
          <div style={{ position: "absolute", left: zoneLeft(owner.aboveSeg), top: G.ownerTop + (V ? 256 : 138), width: zoneW, textAlign: "center", ...pred }}>
            <div style={caps(sub, TYPE.labelSm)}>{owner.predecessor.sub}</div>
          </div>

          {/* the succession arrow, drawing down into the approved bar */}
          <div style={{ position: "absolute", left: zoneMid(owner.aboveSeg) - 1, top: succTop, width: 2, height: (barTop - succTop) * succ, background: ghost }} />
          <div
            style={{
              position: "absolute", left: zoneMid(owner.aboveSeg) - 7, top: barTop - 10, width: 0, height: 0,
              borderLeft: "7px solid transparent", borderRight: "7px solid transparent", borderTop: `10px solid ${ghost}`,
              opacity: clamp01(interpolate(succ, [0.82, 1], [0, 1], CLAMP)),
            }}
          />
        </>
      ) : null}

      {/* ── §B · rivals · bare caps + leader ticks onto the zone the script names ── */}
      {rivals
        ? rivals.items.map((r, i) => (
            <Rival
              key={i}
              ms={ms}
              label={r.label}
              onset={cue(r.cue, from + 14000 + i * 700, from)}
              seatMs={rivalSeatMs}
              // ⚠️ Spread across the MIDDLE HALF of the zone (0.25 / 0.75), not
              // evenly by (i+1)/(n+1). The even split put these 97px apart, and
              // "SANOFI" alone is 107px wide — the two labels closed to a 20px gap
              // and read as one phrase, "J&J SANOFI". This gives 68px of air while
              // keeping both inside their zone.
              x={zoneLeft(rivals.aboveSeg) + zoneW * (rivals.items.length === 1 ? 0.5 : 0.25 + (0.5 * i) / (rivals.items.length - 1))}
              fg={fg}
              ghost={ghost}
            />
          ))
        : null}

      {/* ── §B · the confrontation, drawn AT the boundary it happens at ──
             v1 parked this 300px below the axis touching nothing. The rivals sit
             one zone to the left of the approved bar; the pressure is the border
             between those two zones, so that is where the mark goes. */}
      {threat ? (
        <>
          <div style={{ position: "absolute", left: G.axisLeft + threat.atBoundary * zoneW - 90 * thr, top: G.threatY - 1, width: 180 * thr, height: 2, background: fg, opacity: 0.75 }} />
          {[0, 1].map((i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                left: G.axisLeft + threat.atBoundary * zoneW + (i === 0 ? -90 : 80),
                top: G.threatY - 6, width: 0, height: 0,
                borderTop: "6px solid transparent", borderBottom: "6px solid transparent",
                [i === 0 ? "borderRight" : "borderLeft"]: `10px solid ${fg}`,
                opacity: clamp01(interpolate(thr, [0.85, 1], [0, 1], CLAMP)) * 0.75,
              } as React.CSSProperties}
            />
          ))}
          {/* centred on the boundary again — below the axis there is nothing to
              dodge, so the tag can sit square under the mark it belongs to */}
          <div style={{ position: "absolute", left: G.axisLeft + threat.atBoundary * zoneW - 200, top: G.threatTagTop, width: 400, textAlign: "center", ...thrTag }}>
            <div style={caps(fg, TYPE.labelSm)}>{threat.tag}</div>
          </div>
        </>
      ) : null}
    </AbsoluteFill>
  );
};
