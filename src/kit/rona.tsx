// ─────────────────────────────────────────────────────────────────────────
// KIT · rona — AN UNNAMED CANDIDATE AND A MOSTLY-MILESTONE PRICE. Added on the
// Roche x Rona HORIZONTAL long-form, 2026-10-15 (16:9; absolute 1920x1080
// coordinates, not portrait-safe as written). One-mover rule and the frame
// budget: each cue gets ONE motion, a finished idea retires.
//
// `CandidateCard` — THE SPINE: a card whose undisclosed fields are DASHED EMPTY
//   SLOTS (dashed = not disclosed). Rows can be added; a row with a value is solid.
// `UnnamedHook` (red, the hook): "up to" + the headline figure counts as voiced,
//   "billion" stamps, the figure docks in the pause; the card drops and its Name
//   and Stage rows arrive EMPTY.
// `GrantDeal` (white card): a day leaf, licensor, an arrow that draws on "granted",
//   licensee, the licence terms word by word; the card TRAVELS from licensor to
//   licensee on "license" and gains its known rows.
// `SplitBar` (black, a section-length spine): the headline drawn to scale, a solid
//   near-term sliver and a DASHED milestone run; then the wording is interrogated
//   (an empty "upfront alone" slot, a "reported together" bracket, a cap line) and
//   the share that sits further out lands as the scene's one red.
//
// Every onset is a spoken word with an optional ms pin, clamped monotonic
// (`at()` / `useK()` / `Cued` / `Win` come from ./elora).
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { CLAMP, clamp01, COLORS, DISPLAY, INK_SUB, inkA, INK_SUB_ON_RED, TRACK, useMs } from "./core";
import { TYPE } from "../style";
import { at, lerp, useK, type Cued, type Win } from "./elora";
import { DayLeaf } from "./unity";

const EASE = Easing.out(Easing.cubic);
const EASE_IO = Easing.inOut(Easing.cubic);
const BACK = Easing.out(Easing.back(1.7));

export const label = (color: string, size: number = TYPE.label): React.CSSProperties => ({
  fontFamily: DISPLAY, fontWeight: 700, fontSize: size, letterSpacing: TRACK.kicker, color, whiteSpace: "nowrap", lineHeight: 1.1,
});
export const big = (color: string, size: number): React.CSSProperties => ({
  fontFamily: DISPLAY, fontWeight: 700, fontSize: size, letterSpacing: TRACK.display, color, lineHeight: 1, whiteSpace: "nowrap",
});
/** stamp: lands from `from` scale to 1 with a fade, on progress q */
export const stamp = (q: number, from = 1.35) => ({ opacity: clamp01(q * 3), transform: `scale(${lerp(from, 1, EASE(q))})` });
const money = (v: number, d: number) => v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

// ══════════════════════════════════════════════════════════════════════════
// CandidateCard — the spine
// ══════════════════════════════════════════════════════════════════════════
export type CardRow = { label: string; value?: string; q: number };
export const CARD = { header: 96, row: 88, pad: 22, labelX: 40, slotX: 220, slotH: 62 };
export const cardHeight = (rows: number) => CARD.header + rows * CARD.row + CARD.pad;

/**
 * `tone` light = a white plate (for the red or black world), dark = a black plate (for the white card).
 * A row with no `value` is a dashed EMPTY slot: the field exists and was not disclosed.
 */
export const CandidateCard: React.FC<{
  x: number; y: number; w: number; tone: "light" | "dark"; title: string; rows: CardRow[]; q: number; titleSize?: number;
}> = ({ x, y, w, tone, title, rows, q, titleSize = 50 }) => {
  if (q <= 0) return null;
  const plate = tone === "light" ? COLORS.paper : COLORS.ink;
  const fg = tone === "light" ? COLORS.ink : COLORS.paper;
  const sub = tone === "light" ? inkA(0.55) : INK_SUB;
  const dash = tone === "light" ? inkA(0.45) : "rgba(255,255,255,0.5)";
  // the plate grows as rows arrive (one mover: the row itself; the plate edge follows it)
  const grow = rows.reduce((acc, r) => acc + EASE(clamp01(r.q * 1.6)) * CARD.row, 0);
  const slotW = w - CARD.slotX - 40;
  return (
    <div style={{ position: "absolute", left: x, top: y - (1 - BACK(q)) * 60, width: w, height: CARD.header + CARD.pad + grow, borderRadius: 26, background: plate, opacity: clamp01(q * 4), overflow: "hidden" }}>
      <div style={{ position: "absolute", left: CARD.labelX, top: 30, ...big(fg, titleSize) }}>{title}</div>
      {rows.map((r, i) => {
        if (r.q <= 0) return null;
        const top = CARD.header + i * CARD.row;
        const o = clamp01(r.q * 2.5);
        const dx = (1 - EASE(r.q)) * 24;
        return (
          <div key={i} style={{ position: "absolute", left: 0, top, width: w, height: CARD.row, opacity: o, transform: `translateX(${dx}px)` }}>
            <div style={{ position: "absolute", left: CARD.labelX, top: (CARD.row - CARD.slotH) / 2 + 14, ...label(sub, 32) }}>{r.label}</div>
            {r.value ? (
              <div style={{ position: "absolute", left: CARD.slotX, top: (CARD.row - CARD.slotH) / 2, height: CARD.slotH, display: "flex", alignItems: "center", ...big(fg, 48) }}>{r.value}</div>
            ) : (
              <svg style={{ position: "absolute", left: CARD.slotX, top: (CARD.row - CARD.slotH) / 2 }} width={slotW} height={CARD.slotH}>
                <rect x={2} y={2} width={slotW - 4} height={CARD.slotH - 4} rx={12} fill="none" stroke={dash} strokeWidth={3} strokeDasharray="14 10" />
              </svg>
            )}
          </div>
        );
      })}
      {/* a hairline under the title */}
      <div style={{ position: "absolute", left: CARD.labelX, right: CARD.labelX, top: CARD.header - 6, height: 2, background: tone === "light" ? inkA(0.12) : "rgba(255,255,255,0.16)" }} />
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// UnnamedHook — the hook (red world)
// ══════════════════════════════════════════════════════════════════════════
export const UHOOK = {
  upTo: { top: 120, size: 60 },
  fig: { top: 200, size: 300 },
  unit: { top: 520, size: 120 },
  dock: { dy: -84, s: 0.4 }, // the group (top 120) docks to ~36..~300
  card: { w: 820, top: 360 },
};

export const UnnamedHook: React.FC<Win & {
  upTo: { label: string } & Cued;
  figure: { value: number; decimals: number; prefix: string } & Cued; // counts as voiced
  unit: { label: string } & Cued; // "billion" stamps, the count ends
  dock: Cued; // a pause: the figure docks up
  card: { title: string } & Cued; // the card drops
  name: { label: string } & Cued; // an empty row
  stage: { label: string } & Cued; // an empty row
}> = ({ from, to, upTo, figure, unit, dock, card, name, stage }) => {
  const ms = useMs();
  const k = useK();
  const WH = COLORS.paper;
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));

  const tUp = at(upTo, from, from);
  const tFig = at(figure, tUp + 400, from, tUp + 150);
  const tUnit = at(unit, tFig + 1300, from, tFig + 500);
  const tDock = at(dock, tUnit + 1100, from, tUnit + 500);
  const tCard = at(card, tDock + 600, from, tDock + 300);
  const tName = at(name, tCard + 1000, from, tCard + 400);
  const tStage = at(stage, tName + 1200, from, tName + 400);

  const U = UHOOK;
  const cq = interpolate(ms, [tFig, tUnit - 60], [0, 1], { ...CLAMP, easing: EASE });
  const dq = EASE_IO(k(tDock, 560));
  const cardX = (1920 - U.card.w) / 2;

  if (ms < tUp - 80) return null;
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <div style={{ position: "absolute", left: 0, width: 1920, top: U.upTo.top, height: 560, transformOrigin: "50% 0%", transform: `translateY(${U.dock.dy * dq}px) scale(${lerp(1, U.dock.s, dq)})` }}>
        <div style={{ position: "absolute", left: 0, width: 1920, top: 0, textAlign: "center", opacity: k(tUp, 200), ...label(INK_SUB_ON_RED, U.upTo.size) }}>{upTo.label}</div>
        <div style={{ position: "absolute", left: 0, width: 1920, top: U.fig.top - U.upTo.top, textAlign: "center", fontVariantNumeric: "tabular-nums", opacity: k(tFig - 60, 200), ...big(WH, U.fig.size) }}>
          {figure.prefix}{money(figure.value * cq, figure.decimals)}
        </div>
        <div style={{ position: "absolute", left: 0, width: 1920, top: U.unit.top - U.upTo.top, display: "flex", justifyContent: "center" }}>
          <div style={{ ...big(WH, U.unit.size), ...stamp(k(tUnit, 260), 1.4) }}>{unit.label}</div>
        </div>
      </div>

      <CandidateCard
        x={cardX} y={U.card.top} w={U.card.w} tone="light" title={card.title} q={k(tCard, 420)} titleSize={60}
        rows={[{ label: name.label, q: k(tName, 360) }, { label: stage.label, q: k(tStage, 360) }]}
      />
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// GrantDeal — the licence (white card)
// ══════════════════════════════════════════════════════════════════════════
export const GRANT = {
  leaf: { x: 120, y: 80, w: 150, h: 164 },
  rowY: 330, // the deal row's centre line
  licensor: { left: 120, size: 110, sub: 40 },
  arrow: { x0: 640, x1: 1180, labelTop: 262, labelSize: 34 },
  licensee: { left: 1240, size: 110 },
  card: { w: 640, top: 466, x0: 120, x1: 1160 },
};

export const GrantDeal: React.FC<Win & {
  date: { month: string; day: string } & Cued;
  licensor: { name: string; sub: string } & Cued;
  card: { title: string } & Cued; // the spine card, under the licensor
  arrow: Cued; // draws on "granted"
  licensee: { name: string } & Cued;
  terms: ({ text: string } & Cued)[]; // the licence, word by word above the arrow
  travel: Cued; // the card travels to the licensee
  rows: ({ label: string; value: string } & Cued)[]; // known rows fill in
  emptyRows: string[]; // the hook's empty rows, carried over
}> = ({ from, to, date, licensor, card, arrow, licensee, terms, travel, rows, emptyRows }) => {
  const ms = useMs();
  const k = useK();
  const INK = COLORS.ink;
  const RED = COLORS.accent;
  const SUB = inkA(0.55);
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));

  const tDate = at(date, from, from);
  const tLic = at(licensor, tDate + 1300, from, tDate + 400);
  const tCard = at(card, tLic + 900, from, tLic + 400);
  const tArrow = at(arrow, tCard + 400, from, tCard + 200);
  const tLee = at(licensee, tArrow + 400, from, tArrow + 250);
  let prev = tLee;
  const tTerms = terms.map((t) => (prev = at(t, prev + 500, from, prev + 200)));
  const tTravel = at(travel, prev + 500, from, prev + 200);
  prev = tTravel + 600;
  const tRows = rows.map((r) => (prev = at(r, prev + 900, from, prev + 300)));

  const G = GRANT;
  const y = G.rowY;
  const aq = EASE_IO(k(tArrow, 560));
  const headX = lerp(G.arrow.x0, G.arrow.x1, aq);
  const tq = EASE_IO(k(tTravel, 800));
  const leafOut = 1 - k(tTravel, 320);

  if (ms < tDate - 60) return null;
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <div style={{ opacity: leafOut }}>
        <DayLeaf rect={G.leaf} k={k(tDate, 520)} month={date.month} day={date.day} />
      </div>

      {/* ── licensor ── */}
      <div style={{ position: "absolute", left: G.licensor.left, top: y - G.licensor.size / 2 - 20, opacity: k(tLic, 160), transform: `translateX(${(1 - EASE(k(tLic, 380))) * -50}px)` }}>
        <div style={big(INK, G.licensor.size)}>{licensor.name}</div>
        <div style={{ marginTop: 12, ...big(SUB, G.licensor.sub) }}>{licensor.sub}</div>
      </div>

      {/* ── the arrow (the one red) ── */}
      {aq > 0 ? (
        <svg style={{ position: "absolute", left: 0, top: 0 }} width={1920} height={1080}>
          <line x1={G.arrow.x0} y1={y} x2={headX - 6} y2={y} stroke={RED} strokeWidth={9} strokeLinecap="round" />
          <path d={`M ${headX - 32} ${y - 24} L ${headX} ${y} L ${headX - 32} ${y + 24}`} fill="none" stroke={RED} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" opacity={clamp01(aq * 5)} />
        </svg>
      ) : null}
      <div style={{ position: "absolute", left: G.arrow.x0, width: G.arrow.x1 - G.arrow.x0, top: G.arrow.labelTop, display: "flex", justifyContent: "center", gap: 12 }}>
        {terms.map((t, i) => {
          const q = k(tTerms[i], 220);
          return <div key={i} style={{ opacity: q, transform: `translateY(${(1 - EASE(q)) * 12}px)`, ...label(INK, G.arrow.labelSize) }}>{t.text}</div>;
        })}
      </div>

      {/* ── licensee ── */}
      <div style={{ position: "absolute", left: G.licensee.left, top: y - G.licensee.size / 2 - 20, opacity: k(tLee, 160), transform: `translateX(${(1 - EASE(k(tLee, 380))) * 50}px)`, ...big(INK, G.licensee.size) }}>{licensee.name}</div>

      {/* ── the card: under the licensor, then carried across ── */}
      <CandidateCard
        x={lerp(G.card.x0, G.card.x1, tq)} y={G.card.top} w={G.card.w} tone="dark" title={card.title} q={k(tCard, 420)}
        rows={[
          ...emptyRows.map((l) => ({ label: l, q: 1 })),
          ...rows.map((r, i) => ({ label: r.label, value: r.value, q: k(tRows[i], 360) })),
        ]}
      />
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// SplitBar — the money (black world, the whole section)
// ══════════════════════════════════════════════════════════════════════════
export const SPLITBAR = {
  x0: 160, x1: 1760, y: 520, h: 110,
  lead: { top: 110, size: 88 },
  head: { top: 470, size: 30 }, // the headline ghost's label, right-aligned
  segLabel: { top: 330, size: 34 },
  fig: { top: 384, size: 96 },
  chips: { top: 690, size: 30 },
  below: { top: 690 }, // the interrogation seat under the solid sliver
  far: { top: 680, size: 150, sub: 34 }, // ">90%" under the dashed run
};

export const SplitBar: React.FC<Win & {
  total: number; // the headline, $M
  near: number; // the near-term part, $M
  lead: { text: string } & Cued;
  ghost: { label: string } & Cued; // the headline outline
  nearLabel: { label: string } & Cued;
  nearFig: { prefix: string; suffix: string; until: Cued } & Cued; // counts as voiced, the sliver fills
  farLabel: { label: string } & Cued;
  farFig: { value: number; decimals: number; prefix: string; suffix: string; until: Cued } & Cued; // the dashed run draws
  chips: ({ text: string } & Cued)[];
  royalties: { text: string } & Cued; // the chips row retires, this takes its seat
  lead2: { text: string } & Cued; // "Look at the wording." — the chips retire
  alone: { label: string } & Cued; // an empty "upfront alone" slot
  together: { label: string } & Cued; // the slot retires on `aloneOut`, the bracket lands
  aloneOut: Cued;
  cap: { label: string } & Cued; // a "capped" pill beside the near-term figure
  clear: Cued; // the left-side interrogation retires
  share: { text: string } & Cued; // ">90%", the one red
  shareLabel: { label: string } & Cued;
}> = (p) => {
  const { from, to } = p;
  const ms = useMs();
  const k = useK();
  const WH = COLORS.paper;
  const RED = COLORS.accent;
  const S = SPLITBAR;
  const W = S.x1 - S.x0;
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));

  const tLead = at(p.lead, from, from);
  const tGhost = at(p.ghost, tLead + 900, from, tLead + 300);
  const tNearL = at(p.nearLabel, tGhost + 1200, from, tGhost + 400);
  const tNear = at(p.nearFig, tNearL + 2500, from, tNearL + 400);
  const tNearEnd = at(p.nearFig.until, tNear + 700, from, tNear + 300);
  const tFarL = at(p.farLabel, tNearEnd + 1500, from, tNearEnd + 300);
  const tFar = at(p.farFig, tFarL + 900, from, tFarL + 300);
  const tFarEnd = at(p.farFig.until, tFar + 1300, from, tFar + 400);
  let prev = tFarEnd;
  const tChips = p.chips.map((c) => (prev = at(c, prev + 900, from, prev + 250)));
  const tRoy = at(p.royalties, prev + 1500, from, prev + 400);
  const tLead2 = at(p.lead2, tRoy + 2500, from, tRoy + 800);
  const tAlone = at(p.alone, tLead2 + 2000, from, tLead2 + 600);
  const tAloneOut = at(p.aloneOut, tAlone + 2000, from, tAlone + 600);
  const tTog = at(p.together, tAloneOut + 2500, from, tAloneOut + 400);
  const tCap = at(p.cap, tTog + 900, from, tTog + 300);
  const tClear = at(p.clear, tCap + 2000, from, tCap + 600);
  const tShare = at(p.share, tClear + 600, from, tClear + 200);
  const tShareL = at(p.shareLabel, tShare + 2500, from, tShare + 500);

  const nearW = (p.near / p.total) * W;
  const farX = S.x0 + nearW;
  const farW = W - nearW;

  const lead1O = k(tLead, 220) * (1 - k(tNearL, 300));
  const lead2O = k(tLead2, 220) * (1 - k(tClear, 300));
  const ghostO = k(tGhost, 300);
  const headO = k(tGhost + 200, 240) * (1 - k(tFar, 300));
  const nq = interpolate(ms, [tNear, tNearEnd + 250], [0, 1], { ...CLAMP, easing: EASE });
  const fq = interpolate(ms, [tFar, tFarEnd + 300], [0, 1], { ...CLAMP, easing: EASE });
  const chipsOut = 1 - k(tRoy - 150, 260);
  const royOut = 1 - k(tLead2, 300);
  const left = 1 - k(tClear, 300);

  if (ms < tLead - 80) return null;
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {/* ── lead lines, one seat ── */}
      <div style={{ position: "absolute", left: S.x0, top: S.lead.top, opacity: lead1O, ...big(WH, S.lead.size) }}>{p.lead.text}</div>
      <div style={{ position: "absolute", left: S.x0, top: S.lead.top, opacity: lead2O, transform: `translateY(${(1 - EASE(k(tLead2, 300))) * 16}px)`, ...big(WH, S.lead.size) }}>{p.lead2.text}</div>

      {/* ── the bar ── */}
      <svg style={{ position: "absolute", left: 0, top: 0 }} width={1920} height={1080}>
        {/* the headline ghost: the whole value as an outline */}
        <rect x={S.x0} y={S.y} width={W} height={S.h} rx={10} fill="none" stroke="rgba(255,255,255,0.22)" strokeWidth={3} opacity={ghostO * (1 - fq)} />
        {/* the near-term sliver: solid, fills across its own voicing */}
        <rect x={S.x0} y={S.y} width={nearW * nq} height={S.h} rx={8} fill={WH} />
        {/* the milestone run: dashed, draws left to right */}
        {fq > 0 ? (
          <g>
            <clipPath id="farclip"><rect x={farX} y={S.y - 10} width={(farW + 10) * fq} height={S.h + 20} /></clipPath>
            <rect x={farX + 8} y={S.y + 3} width={farW - 11} height={S.h - 6} rx={8} fill="rgba(255,255,255,0.05)" stroke={WH} strokeWidth={5} strokeDasharray="22 14" clipPath="url(#farclip)" />
          </g>
        ) : null}
        {/* reported together: one bracket under the sliver */}
        <path d={`M ${S.x0} ${S.y + S.h + 22} V ${S.y + S.h + 42} H ${farX} V ${S.y + S.h + 22}`} fill="none" stroke={WH} strokeWidth={4} opacity={k(tTog, 240) * left} />
        {/* the share further out: the one red, a bracket under the dashed run */}
        <path d={`M ${farX + 8} ${S.y + S.h + 22} V ${S.y + S.h + 42} H ${farX + 8 + (farW - 8) * EASE(k(tShare, 520))} V ${S.y + S.h + 22}`} fill="none" stroke={RED} strokeWidth={6} opacity={k(tShare, 120)} />
      </svg>

      <div style={{ position: "absolute", right: 1920 - S.x1, top: S.head.top, opacity: headO, ...label(INK_SUB, S.head.size) }}>{p.ghost.label}</div>

      {/* ── near-term: label + figure above the sliver ── */}
      <div style={{ position: "absolute", left: S.x0, top: S.segLabel.top, opacity: k(tNearL, 220), ...label(INK_SUB, S.segLabel.size) }}>{p.nearLabel.label}</div>
      {ms >= tNear - 80 ? (
        // the "capped" pill rides in the SAME flex row as the figure, so it always clears the
        // figure's real width (a fixed left of 448 overlapped "$100M" by ~30px, Nel 2026-10-15)
        <div style={{ position: "absolute", left: S.x0, top: S.fig.top, display: "flex", alignItems: "center", gap: 28 }}>
          <div style={{ fontVariantNumeric: "tabular-nums", opacity: k(tNear - 60, 200), ...big(WH, S.fig.size) }}>
            {p.nearFig.prefix}{money(p.near * nq, 0)}{p.nearFig.suffix}
          </div>
          {ms >= tCap - 60 && left > 0 ? (
            <div style={{ opacity: left }}>
              <div style={{ padding: "10px 22px", borderRadius: 30, background: WH, ...label(COLORS.ink, 30), ...stamp(k(tCap, 280), 1.4) }}>{p.cap.label}</div>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* ── the milestone run: label + figure centred over it ── */}
      <div style={{ position: "absolute", left: farX, width: farW, top: S.segLabel.top, textAlign: "center", opacity: k(tFarL, 220), ...label(INK_SUB, S.segLabel.size) }}>{p.farLabel.label}</div>
      {ms >= tFar - 80 ? (
        <div style={{ position: "absolute", left: farX, width: farW, top: S.fig.top, textAlign: "center", fontVariantNumeric: "tabular-nums", opacity: k(tFar - 60, 200), ...big(WH, S.fig.size) }}>
          {p.farFig.prefix}{money(p.farFig.value * fq, p.farFig.decimals)}{p.farFig.suffix}
        </div>
      ) : null}

      {/* ── the milestone chips (under the dashed run), then the royalties chip in the same seat ── */}
      <div style={{ position: "absolute", left: farX, width: farW, top: S.chips.top, display: "flex", justifyContent: "center", gap: 20, opacity: chipsOut }}>
        {p.chips.map((c, i) => {
          const q = k(tChips[i], 260);
          return (
            <div key={i} style={{ padding: "14px 26px", borderRadius: 40, border: "3px dashed rgba(255,255,255,0.55)", opacity: clamp01(q * 3), transform: `translateY(${(1 - EASE(q)) * 18}px)`, ...label(WH, S.chips.size) }}>{c.text}</div>
          );
        })}
      </div>
      {ms >= tRoy - 80 && royOut > 0 ? (
        <div style={{ position: "absolute", left: farX, width: farW, top: S.chips.top, display: "flex", justifyContent: "center", opacity: royOut }}>
          <div style={{ padding: "14px 30px", borderRadius: 40, background: "rgba(255,255,255,0.12)", ...label(WH, S.chips.size), ...stamp(k(tRoy, 280), 1.25) }}>{p.royalties.text}</div>
        </div>
      ) : null}

      {/* ── the interrogation, under the sliver ── */}
      {ms >= tAlone - 60 && ms < tAloneOut + 400 ? (
        <div style={{ position: "absolute", left: S.x0, top: S.below.top, opacity: k(tAlone, 240) * (1 - k(tAloneOut, 300)) }}>
          <div style={{ padding: "18px 28px", borderRadius: 16, border: "3px dashed rgba(255,255,255,0.6)", ...label(WH, 32), transform: `translateY(${(1 - EASE(k(tAlone, 320))) * 18}px)` }}>{p.alone.label}</div>
        </div>
      ) : null}
      <div style={{ position: "absolute", left: S.x0, top: S.below.top, opacity: k(tTog, 240) * left, ...label(WH, 32) }}>{p.together.label}</div>


      {/* ── the share further out ── */}
      {ms >= tShare - 60 ? (
        <div style={{ position: "absolute", left: farX, width: farW, top: S.far.top, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
          <div style={{ ...big(RED, S.far.size), ...stamp(k(tShare, 300), 1.4) }}>{p.share.text}</div>
          <div style={{ opacity: k(tShareL, 240), ...label(WH, S.far.sub) }}>{p.shareLabel.label}</div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
