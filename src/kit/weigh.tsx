// ─────────────────────────────────────────────────────────────────────────
// KIT · weigh — CounterWeigh: the fairness beat.
//
// The shape: a finding has landed; now several things cut against reading it
// as settled. The design rule that makes this beat honest is that the finding
// is NEVER struck, dimmed, or replaced — it stays lit at full strength while
// counterweights HANG from a fulcrum beneath it. Weight is ADDED to the other
// side; nothing is retracted. (A strike-through here would editorialise a
// retraction the script does not make.)
//
// The finding restates figures from an earlier beat at TALLY_DOCK_GEO — the
// exact position and size they were docked at — so it reads as the same object
// returning rather than a new graphic that happens to share a number.
//
// Deliberately carries NO bar lengths or relative magnitudes: use this when a
// script names qualifiers without quantifying them, which is the usual case.
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { CLAMP, clamp01, caps, COLORS, cue, DISPLAY, INK_SUB, SANS, TRACK, useMs, usePop, useStamp } from "./core";
import { TALLY_DOCK_GEO } from "./tally";
import { FORMAT, TYPE } from "../style";

const V = FORMAT.key === "vertical";
type Win = { from: number; to: number };

const G = TALLY_DOCK_GEO;

export type WeighItem = {
  /** the caps category — what KIND of qualifier this is */
  label: string;
  /** the qualifier itself, stated as a ledger entry (not the VO's full sentence) */
  statement: string;
  /** the spoken word it lands on */
  cue: string;
  /** an optional figure that stamps large under the statement */
  figure?: { text: string; sub: string };
};

// Column geometry. The spine sits exactly at the fulcrum rule's left end, so the
// two hairlines form one structural join; the cards are indented past it by STUB.
const COL_W = V ? 940 : 1300;
const SPINE_X = (FORMAT.width - COL_W) / 2;
const STUB = V ? 30 : 26;

const Item: React.FC<{
  item: WeighItem;
  onset: number;
  top: number;
  fg: string;
  sub: string;
}> = ({ item, onset, top, fg, sub }) => {
  const lbl = usePop(onset + 120, { rise: 10 });
  const stm = usePop(onset + 220, { rise: 16 });
  const fig = useStamp(onset + 520, { from: 1.08 });

  return (
    <div style={{ position: "absolute", top, left: SPINE_X + STUB, width: COL_W - STUB }}>
      <div style={{ ...lbl }}>
        <div style={caps(sub, TYPE.labelSm)}>{item.label}</div>
      </div>
      <div style={{ ...stm, marginTop: 10 }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: V ? 52 : 44, letterSpacing: TRACK.headline, color: fg, lineHeight: 1.12 }}>
          {item.statement}
        </div>
      </div>
      {item.figure ? (
        <div style={{ marginTop: V ? 18 : 14 }}>
          <div style={{ ...fig, transformOrigin: "left center" }}>
            <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: V ? 128 : 104, letterSpacing: TRACK.display, color: fg, lineHeight: 1 }}>
              {item.figure.text}
            </span>
          </div>
          <div style={{ ...stm, marginTop: 8 }}>
            <span style={{ fontFamily: SANS, fontWeight: 400, fontSize: V ? 32 : 28, letterSpacing: TRACK.body, color: sub }}>{item.figure.sub}</span>
          </div>
        </div>
      ) : null}
    </div>
  );
};

/** A static restatement of an earlier count-up — same size, same slot, no re-count. */
const FindingFigure: React.FC<{
  text: string;
  label: string;
  index: number;
  count: number;
  onset: number;
  fg: string;
  sub: string;
  rule: string;
}> = ({ text, label, index, count, onset, fg, sub, rule }) => {
  const p = usePop(onset + index * 110, { rise: 16 });
  return (
    // the positioning transform lives on the OUTER box and the pop's transform on
    // an inner one — spreading usePop() onto a translateX(-50%) box silently
    // overwrites the centring and shifts the figure half a box right.
    <div
      style={{
        position: "absolute",
        top: G.dockTop,
        left: `${((index + 0.5) / count) * 100}%`,
        width: G.boxDock,
        transform: "translateX(-50%)",
        textAlign: "center",
      }}
    >
      <div style={p}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: G.figDock, letterSpacing: TRACK.display, color: fg, lineHeight: 0.92 }}>{text}</div>
        <div style={{ height: 3, width: G.ruleDock, background: rule, margin: "10px auto 7px" }} />
        <div style={caps(sub, G.labDock)}>{label}</div>
      </div>
    </div>
  );
};

export const CounterWeigh: React.FC<Win & {
  /** the earlier figures, restated verbatim — no count-up, they already landed */
  finding: { text: string; label: string }[];
  findingLabel: string;
  /** caps header over the qualifier column */
  againstLabel: string;
  /** the word the fulcrum rule draws on (usually the first qualifier's cue) */
  fulcrumCue: string;
  items: WeighItem[];
  /** top of each item card, in order */
  itemTops?: number[];
  bg?: "ink" | "paper";
}> = ({ from, to, finding, findingLabel, againstLabel, fulcrumCue, items, itemTops, bg = "ink" }) => {
  const ms = useMs();
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const sub = bg === "ink" ? INK_SUB : COLORS.grayText;
  const rule = bg === "ink" ? "rgba(255,255,255,0.24)" : COLORS.border;
  const vis = clamp01(interpolate(ms, [from, from + 280, to + 150, to + 450], [0, 1, 1, 0], CLAMP));

  const hdr = usePop(from + 120, { rise: 12 });
  const fulcrumMs = cue(fulcrumCue, from + 600, from);
  const fIn = clamp01(interpolate(ms, [fulcrumMs - 200, fulcrumMs + 480], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) }));
  const against = usePop(fulcrumMs + 180, { rise: 10 });

  const fulcrumY = V ? 520 : 300;
  const tops = itemTops ?? (V ? [650, 880, 1110] : [370, 520, 670]);
  const onsets = items.map((it, i) => cue(it.cue, from + 1000 + i * 1500, from));
  // the spine attaches at each card's caps-label row
  const attachY = tops.map((t) => t + (V ? 12 : 10));

  // How far the spine has grown. Evaluated IN ORDER: a card whose cue hasn't
  // arrived contributes p=0, so the spine simply holds at the previous card's
  // row instead of jumping ahead.
  let spineY = fulcrumY;
  for (let i = 0; i < items.length; i++) {
    const p = clamp01(interpolate(ms, [onsets[i] - 140, onsets[i] + 300], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) }));
    spineY = spineY + (attachY[i] - spineY) * p;
  }

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {/* the finding — restated where it was left, and never dimmed */}
      <div style={{ position: "absolute", top: G.dockTop - (V ? 52 : 40), left: 0, right: 0, textAlign: "center", ...hdr }}>
        <div style={caps(sub, TYPE.labelSm)}>{findingLabel}</div>
      </div>
      {finding.map((f, i) => (
        <FindingFigure key={i} text={f.text} label={f.label} index={i} count={finding.length} onset={from + 200} fg={fg} sub={sub} rule={rule} />
      ))}

      {/* the fulcrum the counterweights hang from */}
      <div
        style={{
          position: "absolute",
          top: fulcrumY,
          left: SPINE_X,
          width: COL_W * fIn,
          height: 2,
          background: rule,
        }}
      />
      <div style={{ position: "absolute", top: fulcrumY + 22, left: 0, right: 0, textAlign: "center", ...against }}>
        <div style={caps(sub, TYPE.labelSm)}>{againstLabel}</div>
      </div>

      {/* ONE spine growing down from the fulcrum's left end, reaching each card's
          row as that card lands. Per-card stubs that connect to nothing read as
          stray tick marks — the hanging only registers if the line is continuous
          back to the fulcrum. (Nel caught the orphan version, 2026-08-14.) */}
      <div style={{ position: "absolute", top: fulcrumY, left: SPINE_X, width: 2, height: Math.max(0, spineY - fulcrumY), background: rule }} />
      {items.map((it, i) => (
        <React.Fragment key={i}>
          <div
            style={{
              position: "absolute",
              top: attachY[i],
              left: SPINE_X,
              width: STUB * clamp01(interpolate(ms, [onsets[i], onsets[i] + 320], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) })),
              height: 2,
              background: rule,
            }}
          />
          <Item item={it} onset={onsets[i]} top={tops[i]} fg={fg} sub={sub} />
        </React.Fragment>
      ))}
    </AbsoluteFill>
  );
};
