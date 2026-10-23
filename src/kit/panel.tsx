// ─────────────────────────────────────────────────────────────────────────
// KIT · panel — THE TARGET PANEL, the spine of the GSK x Chai HORIZONTAL
// long-form (2026-10-15; absolute 1920x1080 coordinates). One mover per cue.
//
// `Plate` — a row of target wells on a plate. The release never says how many
//   targets were tested, so the row FADES OUT at both ends (`edge="fade"`): you
//   see a panel, never a count. §3 re-draws the same plate with `edge="dashed"`
//   and question marks where the count should be.
// `TargetPanel` (§2, white card): the narration flows; Chai's models emit
//   designs; GSK's target panel appears; "zero-shot" stamps and target-specific
//   training is struck; the designs drop into the wells in GSK's own wet lab; on
//   "binders" the wells fill one after another and the quote stamps in red.
// `AustinQuote` (§2, black over the wet-lab scrim): a name card, then the quote
//   sets word by word with "strong binding affinities" underlining itself.
//
// Onsets: a spoken word with an optional ms pin, clamped monotonic (./elora).
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { CLAMP, clamp01, COLORS, DISPLAY, INK_SUB, inkA, TRACK, useMs } from "./core";
import { at, lerp, Phrase, useK, type Cued, type Win } from "./elora";
import { FlowLine } from "./flowline";
import { Molecule } from "./chai";

const EASE = Easing.out(Easing.cubic);
const BACK = Easing.out(Easing.back(1.7));

const label = (color: string, size: number): React.CSSProperties => ({
  fontFamily: DISPLAY, fontWeight: 700, fontSize: size, letterSpacing: TRACK.kicker, color, whiteSpace: "nowrap", lineHeight: 1.1,
});
const big = (color: string, size: number): React.CSSProperties => ({
  fontFamily: DISPLAY, fontWeight: 700, fontSize: size, letterSpacing: TRACK.display, color, lineHeight: 1, whiteSpace: "nowrap",
});
const stamp = (q: number, from = 1.35) => ({ opacity: clamp01(q * 3), transform: `scale(${lerp(from, 1, EASE(q))})` });

// ══════════════════════════════════════════════════════════════════════════
// Plate — the target wells
// ══════════════════════════════════════════════════════════════════════════
/** per-well visibility for a 7-well row whose ends fade (no countable edge) */
export const FADE_EDGE = [0.18, 0.5, 1, 1, 1, 0.5, 0.18];

export const Plate: React.FC<{
  cx: number; cy: number; n?: number; pitch?: number; r?: number;
  color: string; // outline + fill
  k?: number; // the plate draws in (0..1)
  fill?: number[]; // per-well fill progress (0..1): solid = a binder found
  drop?: number[]; // per-well drop progress (0..1): a design falls into the well
  edge?: "fade" | "dashed";
  opacity?: number;
}> = ({ cx, cy, n = 7, pitch = 140, r = 50, color, k = 1, fill, drop, edge = "fade", opacity = 1 }) => {
  if (k <= 0) return null;
  const w = (n - 1) * pitch + r * 2 + 60;
  const h = r * 2 + 60;
  const x0 = cx - w / 2;
  const y0 = cy - h / 2;
  const dashedEnds = edge === "dashed";
  const vis = (i: number) => (dashedEnds ? (i === 0 || i === n - 1 ? 0.55 : 1) : FADE_EDGE[i] ?? 1);
  const gid = `plate-fade-${Math.round(cx)}-${Math.round(cy)}`;
  return (
    <svg style={{ position: "absolute", left: x0 - 10, top: y0 - 60, opacity }} width={w + 20} height={h + 120}>
      <defs>
        <linearGradient id={gid} x1="0" x2="1" y1="0" y2="0">
          <stop offset="0" stopColor={color} stopOpacity={dashedEnds ? 0.55 : 0} />
          <stop offset="0.22" stopColor={color} stopOpacity={1} />
          <stop offset="0.78" stopColor={color} stopOpacity={1} />
          <stop offset="1" stopColor={color} stopOpacity={dashedEnds ? 0.55 : 0} />
        </linearGradient>
      </defs>
      <g transform="translate(10 60)">
        <rect x={2.5} y={2.5} width={(w - 5) * EASE(clamp01(k * 1.4))} height={h - 5} rx={h / 2} fill="none" stroke={dashedEnds ? color : `url(#${gid})`} strokeWidth={5} strokeDasharray={dashedEnds ? "18 12" : undefined} />
        {Array.from({ length: n }, (_, i) => {
          const q = clamp01((k - (i / n) * 0.6) / 0.4);
          if (q <= 0) return null;
          const wx = 30 + r + i * pitch;
          const wy = h / 2;
          const f = fill?.[i] ?? 0;
          const d = drop?.[i] ?? 0;
          const ends = dashedEnds && (i === 0 || i === n - 1);
          return (
            <g key={i} opacity={vis(i)}>
              <circle cx={wx} cy={wy} r={r * BACK(q)} fill="none" stroke={color} strokeWidth={5} strokeDasharray={ends ? "12 9" : undefined} />
              {f > 0 ? <circle cx={wx} cy={wy} r={(r - 12) * EASE(f)} fill={color} /> : null}
              {d > 0 && d < 1 ? <circle cx={wx} cy={lerp(-46, wy, EASE(d))} r={11} fill={color} opacity={clamp01(d * 4)} /> : null}
            </g>
          );
        })}
      </g>
    </svg>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// TargetPanel — what the release says was shown (white card)
// ══════════════════════════════════════════════════════════════════════════
export const TPANEL = {
  lead: { top: 96, size: 60 },
  model: { left: 120, top: 400, w: 380, h: 180, size: 52 }, // "Chai models" ~315 wide
  designs: { x: 640, ys: [360, 490, 620] as const, size: 96 },
  plate: { cx: 1280, cy: 490 }, // 7 wells, pitch 140: spans ~810..1750
  targets: { top: 352 },
  zero: { left: 120, top: 640 }, // the chip under the model
  noTrain: { left: 120, top: 740, size: 34 }, // under the chip (640..714)
  lab: { top: 600 },
  quote: { top: 760, size: 74 },
};

export const TargetPanel: React.FC<Win & {
  lead: { line: string; until: number };
  model: { label: string } & Cued;
  designs: Cued; // three designs emitted
  targets: { label: string } & Cued; // the plate draws
  zero: { label: string } & Cued; // chip stamps
  noTrain: { label: string } & Cued; // the struck line
  clear: Cued; // a pause: lead + zero-shot retire
  tested: Cued; // designs drop into the wells
  lab: { label: string } & Cued;
  binders: Cued; // the wells fill, one after another
  quote: { text: string } & Cued; // the red stamp
}> = ({ from, to, lead, model, designs, targets, zero, noTrain, clear, tested, lab, binders, quote }) => {
  const ms = useMs();
  const k = useK();
  const INK = COLORS.ink;
  const SUB = inkA(0.6);
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));

  const tModel = at(model, from + 1500, from, from + 200);
  const tDesigns = at(designs, tModel + 700, from, tModel + 300);
  const tTargets = at(targets, tDesigns + 1200, from, tDesigns + 400);
  const tZero = at(zero, tTargets + 700, from, tTargets + 300);
  const tNo = at(noTrain, tZero + 1300, from, tZero + 400);
  const tClear = at(clear, tNo + 2000, from, tNo + 600);
  const tTested = at(tested, tClear + 500, from, tClear + 100);
  const tLab = at(lab, tTested + 1900, from, tTested + 500);
  const tBind = at(binders, tLab + 2500, from, tLab + 600);
  const tQuote = at(quote, tBind + 700, from, tBind + 300);

  const M = TPANEL.model;
  const D = TPANEL.designs;
  const P = TPANEL.plate;
  const out = 1 - k(tClear, 320);
  // the designs leave the staging column as they drop (they BECOME the drops)
  const staged = 1 - k(tTested, 260);
  const drop = Array.from({ length: 7 }, (_, i) => k(tTested + 120 + i * 90, 520));
  const fill = Array.from({ length: 7 }, (_, i) => k(tBind + i * 110, 300));
  const ns = k(tNo, 360); // the strike draws across the struck line

  if (ms < from - 60) return null;
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <Phrase from={from} to={lead.until} line={lead.line} top={TPANEL.lead.top} size={TPANEL.lead.size} color={INK} />

      {/* ── Chai's models and the designs they generate ── */}
      <div style={{ position: "absolute", left: M.left, top: M.top + (1 - EASE(k(tModel, 420))) * 40, width: M.w, height: M.h, borderRadius: 28, background: INK, opacity: k(tModel, 200), display: "flex", alignItems: "center", justifyContent: "center", ...big(COLORS.paper, M.size) }}>
        {model.label}
      </div>
      {D.ys.map((y, i) => {
        const q = k(tDesigns + i * 140, 420);
        if (q <= 0 || staged <= 0) return null;
        return <Molecule key={i} cx={lerp(M.left + M.w - 40, D.x, EASE(q))} cy={lerp(M.top + M.h / 2, y, EASE(q))} size={D.size} color={INK} k={q} opacity={staged} />;
      })}

      {/* ── GSK's target panel ── */}
      <div style={{ position: "absolute", left: P.cx - 400, width: 800, top: TPANEL.targets.top, textAlign: "center", opacity: k(tTargets + 200, 220), ...label(SUB, 36) }}>{targets.label}</div>
      <Plate cx={P.cx} cy={P.cy} color={INK} k={k(tTargets, 800)} drop={drop} fill={fill} />
      <div style={{ position: "absolute", left: P.cx - 400, width: 800, top: TPANEL.lab.top, textAlign: "center", opacity: k(tLab, 220), ...label(SUB, 36) }}>{lab.label}</div>

      {/* ── zero-shot: no training on these targets ── */}
      <div style={{ position: "absolute", left: TPANEL.zero.left, top: TPANEL.zero.top, opacity: out, transformOrigin: "0% 50%" }}>
        <div style={{ padding: "12px 28px", borderRadius: 40, border: `5px solid ${INK}`, ...label(INK, 40), ...stamp(k(tZero, 280), 1.5), transformOrigin: "0% 50%" }}>{zero.label}</div>
      </div>
      <div style={{ position: "absolute", left: TPANEL.noTrain.left, top: TPANEL.noTrain.top, opacity: k(tNo, 200) * out }}>
        <div style={{ position: "relative", ...label(SUB, TPANEL.noTrain.size) }}>
          {noTrain.label}
          <div style={{ position: "absolute", left: -6, top: "54%", height: 5, width: `calc(${100 * EASE(ns)}% + 12px)`, background: INK, borderRadius: 3 }} />
        </div>
      </div>

      {/* ── "found binders to all tested targets" ── */}
      <div style={{ position: "absolute", left: 0, width: 1920, top: TPANEL.quote.top, textAlign: "center", ...big(COLORS.accent, TPANEL.quote.size), ...stamp(k(tQuote, 300), 1.3) }}>{quote.text}</div>
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// AustinQuote — the executive's words (black, over the wet-lab scrim)
// ══════════════════════════════════════════════════════════════════════════
export const AUSTIN = {
  name: { left: 150, top: 150, size: 84 },
  title: { left: 154, top: 254, size: 36 },
  rule: { left: 150, top: 330, w: 120 },
  quote: { left: 150, top: 400, w: 1560, size: 76 },
};

export const AustinQuote: React.FC<Win & {
  name: { text: string } & Cued;
  title: { label: string } & Cued;
  quoted: Cued; // the rule draws: the quote is coming
  quote: { line: string; underline?: string; from: number };
}> = ({ from, to, name, title, quoted, quote }) => {
  const ms = useMs();
  const k = useK();
  const WH = COLORS.paper;
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));

  const tName = at(name, from, from);
  const tTitle = at(title, tName + 1500, from, tName + 400);
  const tQuoted = at(quoted, tTitle + 3000, from, tTitle + 500);

  if (ms < tName - 60) return null;
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <div style={{ position: "absolute", left: AUSTIN.name.left, top: AUSTIN.name.top, opacity: k(tName, 180), transform: `translateX(${(1 - EASE(k(tName, 380))) * -40}px)`, ...big(WH, AUSTIN.name.size) }}>{name.text}</div>
      <div style={{ position: "absolute", left: AUSTIN.title.left, top: AUSTIN.title.top, opacity: k(tTitle, 220), ...label(INK_SUB, AUSTIN.title.size) }}>{title.label}</div>
      <div style={{ position: "absolute", left: AUSTIN.rule.left, top: AUSTIN.rule.top, height: 8, width: AUSTIN.rule.w * EASE(k(tQuoted, 420)), background: COLORS.accent, borderRadius: 4 }} />
      <div style={{ position: "absolute", left: AUSTIN.quote.left, top: AUSTIN.quote.top, width: AUSTIN.quote.w }}>
        <FlowLine from={quote.from} to={to} line={quote.line} size={AUSTIN.quote.size} color={WH} underline={quote.underline} lineHeight={1.14} />
      </div>
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// PanelBlanks — what the release does not say (white card), three pages:
//   1. the §2 plate returns lit; its fading ends turn DASHED and a "?" stamps at
//      each end (how many targets?); a dashed column of designs rises over the
//      middle well with its own "?" (how many designs per target?)
//   2. three empty slots land on their words: affinity, model, molecule type
//   3. one slot: financial terms, and "Not disclosed" stamps in red
// ══════════════════════════════════════════════════════════════════════════
export const BLANKS = {
  plate: { cx: 960, cy: 470 }, // x 460..1460, y 390..550
  q: { xs: [340, 1580] as const, size: 130 }, // clear of the plate rim (460..1460)
  targets: { top: 600 },
  column: { cx: 960, ys: [320, 250, 180] as const, size: 60, qTop: 50 }, // "?" 50..134, top molecule 150..210
  designs: { left: 1020, top: 214 },
  slots: { xs: [480, 960, 1440] as const, top: 360, w: 400, h: 230, labelTop: 296, glyph: 120 },
  terms: { top: 340, w: 760, h: 240, labelTop: 268, stampTop: 650, stampSize: 96 },
};

export const PanelBlanks: React.FC<Win & {
  plate: Cued; // the §2 plate returns, lit
  targets: { label: string } & Cued; // ends go dashed, the two "?" stamp
  designs: { label: string } & Cued; // the dashed column rises over the middle well
  page2: Cued; // a pause: the plate retires
  slots: ({ label: string; glyph: string } & Cued)[]; // three empty slots
  page3: Cued; // a pause: the slots retire
  terms: { label: string } & Cued;
  stampText: { label: string } & Cued;
}> = ({ from, to, plate, targets, designs, page2, slots, page3, terms, stampText }) => {
  const ms = useMs();
  const k = useK();
  const INK = COLORS.ink;
  const SUB = inkA(0.6);
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));

  const tPlate = at(plate, from, from);
  const tTargets = at(targets, tPlate + 1000, from, tPlate + 300);
  const tDesigns = at(designs, tTargets + 1800, from, tTargets + 500);
  const tP2 = at(page2, tDesigns + 1600, from, tDesigns + 500);
  let prev = tP2;
  const tSlots = slots.map((s) => (prev = at(s, prev + 1500, from, prev + 300)));
  const tP3 = at(page3, prev + 1600, from, prev + 500);
  const tTerms = at(terms, tP3 + 400, from, tP3 + 100);
  const tStamp = at(stampText, tTerms + 700, from, tTerms + 300);

  const B = BLANKS;
  const p1 = 1 - k(tP2, 320);
  const p2 = 1 - k(tP3, 320);
  const dashQ = k(tTargets, 300); // crossfade fade-edge plate -> dashed-edge plate
  const lit = Array.from({ length: 7 }, () => 1);
  const S = B.slots;
  const T = B.terms;

  if (ms < tPlate - 60) return null;
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {/* ── page 1: the panel, uncounted ── */}
      {p1 > 0 ? (
        <div style={{ opacity: p1 }}>
          <Plate cx={B.plate.cx} cy={B.plate.cy} color={INK} k={k(tPlate, 500)} fill={lit} opacity={1 - dashQ} />
          {dashQ > 0 ? <Plate cx={B.plate.cx} cy={B.plate.cy} color={INK} fill={lit} edge="dashed" opacity={dashQ} /> : null}
          {B.q.xs.map((x, i) => (
            <div key={i} style={{ position: "absolute", left: x - 100, width: 200, top: B.plate.cy - B.q.size / 2 - 6, textAlign: "center", ...big(INK, B.q.size), ...stamp(k(tTargets + i * 120, 280), 1.5) }}>?</div>
          ))}
          <div style={{ position: "absolute", left: 0, width: 1920, top: B.targets.top, textAlign: "center", opacity: k(tTargets + 200, 220), ...label(SUB, 40) }}>{targets.label}</div>
          {B.column.ys.map((y, i) => {
            const q = k(tDesigns + i * 120, 320);
            if (q <= 0) return null;
            return <Molecule key={i} cx={B.column.cx} cy={y + (1 - EASE(q)) * 40} size={B.column.size} color={INK} dashed k={q} />;
          })}
          <div style={{ position: "absolute", left: B.column.cx - 100, width: 200, top: B.column.qTop, textAlign: "center", ...big(INK, 84), ...stamp(k(tDesigns + 420, 280), 1.5) }}>?</div>
          <div style={{ position: "absolute", left: B.designs.left, top: B.designs.top, opacity: k(tDesigns + 200, 220), ...label(SUB, 40) }}>{designs.label}</div>
        </div>
      ) : null}

      {/* ── page 2: three empty slots ── */}
      {ms >= tP2 && p2 > 0 ? (
        <div style={{ opacity: p2 }}>
          {S.xs.map((x, i) => {
            const q = EASE(k(tSlots[i], 380));
            if (q <= 0 || !slots[i]) return null;
            return (
              <div key={i} style={{ position: "absolute", left: x - S.w / 2, top: S.labelTop + (1 - q) * 40, width: S.w, opacity: clamp01(q * 3) }}>
                <div style={{ textAlign: "center", ...label(SUB, 40) }}>{slots[i].label}</div>
                <svg style={{ display: "block", marginTop: S.top - S.labelTop - 44 }} width={S.w} height={S.h}>
                  <rect x={2.5} y={2.5} width={S.w - 5} height={S.h - 5} rx={26} fill="none" stroke={INK} strokeWidth={5} strokeDasharray="18 13" />
                </svg>
                <div style={{ position: "absolute", left: 0, width: S.w, top: S.top - S.labelTop + (S.h - S.glyph) / 2 - 6, textAlign: "center", ...big(inkA(0.35), S.glyph) }}>{slots[i].glyph}</div>
              </div>
            );
          })}
        </div>
      ) : null}

      {/* ── page 3: financial terms ── */}
      {ms >= tP3 ? (
        <div>
          <div style={{ position: "absolute", left: 0, width: 1920, top: T.labelTop, textAlign: "center", opacity: k(tTerms, 220), ...label(SUB, 44) }}>{terms.label}</div>
          <svg style={{ position: "absolute", left: 960 - T.w / 2, top: T.top + (1 - EASE(k(tTerms, 380))) * 40, opacity: k(tTerms, 200) }} width={T.w} height={T.h}>
            <rect x={2.5} y={2.5} width={T.w - 5} height={T.h - 5} rx={30} fill="none" stroke={INK} strokeWidth={6} strokeDasharray="20 14" />
            <text x={T.w / 2} y={T.h / 2 + 44} textAnchor="middle" fontFamily={DISPLAY} fontWeight={700} fontSize={128} fill={inkA(0.35)} letterSpacing={TRACK.display}>$ —</text>
          </svg>
          <div style={{ position: "absolute", left: 0, width: 1920, top: T.stampTop, textAlign: "center", ...big(COLORS.accent, T.stampSize), ...stamp(k(tStamp, 300), 1.35) }}>{stampText.label}</div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
