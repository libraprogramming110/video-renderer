// ─────────────────────────────────────────────────────────────────────────
// KIT · target — A RECEPTOR ON FAT CELLS, TWO DRUG CLASSES, TWO TARGETS. Added on
// the Roche x Rona HORIZONTAL long-form, 2026-10-15 (16:9; absolute 1920x1080).
// One-mover rule and the frame budget: each cue gets ONE motion, a finished idea
// retires.
//
// `Receptor` / `FatCellGlyph` — a "Y" receptor standing out of a membrane; a fat
//   cell (membrane, a stored-fat droplet, receptors seated round it).
// `FatCell` (white card): the receptor name lands, receptors appear FLOATING, the
//   cell draws and they SEAT on its membrane; store / break-down arrows cross the
//   ring; on "reduced activity" the receptors dim. One caption seat, each caption
//   replaces the last (retire, don't dock).
// `TwoTargets` (black): two columns, two classes, two arrows to two different
//   targets (the asymmetry enacted: appetite vs fat tissue, the ALK7 side the one
//   red). Then the columns retire for two tiles (visceral fat, an arrow down; lean
//   mass, held level) and two chips (alone / combined). No bar lengths: the script
//   gives no magnitudes here.
// `PastLiver` (white card): the candidate (a red dot) arcs OVER a liver to a fat
//   cell — "outside the liver" as a path, not a sentence.
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { CLAMP, clamp01, COLORS, DISPLAY, INK_SUB, inkA, TRACK, useMs } from "./core";
import { at, lerp, useK, type Cued, type Win } from "./elora";
import { big, label, stamp } from "./rona";

const EASE = Easing.out(Easing.cubic);
const EASE_IO = Easing.inOut(Easing.cubic);
const BACK = Easing.out(Easing.back(1.7));

// ══════════════════════════════════════════════════════════════════════════
// Glyphs
// ══════════════════════════════════════════════════════════════════════════
/** A receptor rooted at (x, y) pointing outward along `deg` (0 = right, clockwise). */
export const Receptor: React.FC<{ x: number; y: number; deg: number; len: number; color: string; q: number; hollow?: number }> = ({ x, y, deg, len, color, q, hollow = 0 }) => {
  if (q <= 0) return null;
  const sw = len * 0.16;
  return (
    <g transform={`translate(${x} ${y}) rotate(${deg + 90})`} opacity={clamp01(q * 3) * lerp(1, 0.3, hollow)}>
      <g transform={`scale(${lerp(0.4, 1, EASE(q))})`}>
        <path d={`M 0 0 V ${-len * 0.55} M 0 ${-len * 0.55} L ${-len * 0.32} ${-len} M 0 ${-len * 0.55} L ${len * 0.32} ${-len}`} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round" />
      </g>
    </g>
  );
};

export const CELL = { angles: [200, 236, 270, 304, 340, 20, 160] };

/** A fat cell: membrane, a large stored-fat droplet, receptors seated on the membrane. */
export const FatCellGlyph: React.FC<{
  cx: number; cy: number; R: number; q: number; receptorQ: number[]; recColor: string; line: string; droplet: string;
  dim?: number; dropletLabel?: string; labelColor?: string; float?: number;
}> = ({ cx, cy, R, q, receptorQ, recColor, line, droplet, dim = 0, dropletLabel, labelColor, float = 0 }) => {
  const r = R * 0.64;
  const len = R * 0.24;
  return (
    <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} width={1920} height={1080}>
      {q > 0 ? (
        <g opacity={clamp01(q * 3)}>
          <circle cx={cx} cy={cy} r={R * lerp(0.9, 1, EASE(q))} fill="none" stroke={line} strokeWidth={Math.max(4, R * 0.026)} />
          <circle cx={cx} cy={cy} r={r * EASE(q)} fill={droplet} />
          {dropletLabel ? (
            <text x={cx} y={cy + 12} textAnchor="middle" fontFamily={DISPLAY} fontWeight={700} fontSize={Math.round(R * 0.11)} letterSpacing="-0.035em" fill={labelColor} opacity={clamp01((q - 0.5) * 2)}>{dropletLabel}</text>
          ) : null}
        </g>
      ) : null}
      {CELL.angles.map((a, i) => {
        const rad = (a * Math.PI) / 180;
        // before the cell lands the receptors float further out (`float` 1), then seat on the membrane
        const rr = R + float * R * 0.22;
        return <Receptor key={i} x={cx + Math.cos(rad) * rr} y={cy + Math.sin(rad) * rr} deg={a} len={len} color={recColor} q={receptorQ[i] ?? 0} hollow={dim} />;
      })}
    </svg>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// FatCell — the target (white card)
// ══════════════════════════════════════════════════════════════════════════
export const FATCELL = {
  lead: { left: 120, top: 110, size: 88 },
  hero: { left: 120, top: 190, size: 220 },
  caption: { left: 124, top: 470, w: 700, size: 46 },
  cell: { cx: 1340, cy: 500, R: 300 },
  store: { right: 1000, top: 414 }, // label, right-aligned left of the cell, above the arrow
  breakdown: { left: 1650, top: 414 },
  cellLabel: { top: 868 },
};

export const FatCell: React.FC<Win & {
  lead: { text: string } & Cued;
  hero: { text: string } & Cued; // "ALK7" lands, the lead retires
  receptors: Cued; // the receptors appear, floating
  cell: { label: string; droplet: string } & Cued; // the cell draws, they seat on its membrane
  captions: ({ text: string } & Cued)[]; // ONE seat, each caption replaces the last
  store: { label: string } & Cued; // an arrow into the droplet
  breakdown: { label: string } & Cued; // an arrow out of it
  clearArrows: Cued;
  reduced: Cued; // the receptors dim: reduced activity
}> = ({ from, to, lead, hero, receptors, cell, captions, store, breakdown, clearArrows, reduced }) => {
  const ms = useMs();
  const k = useK();
  const INK = COLORS.ink;
  const RED = COLORS.accent;
  const SUB = inkA(0.6);
  const F = FATCELL;
  const C = F.cell;
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));

  const tLead = at(lead, from, from);
  const tHero = at(hero, tLead + 1200, from, tLead + 400);
  const tRec = at(receptors, tHero + 500, from, tHero + 250);
  const tCell = at(cell, tRec + 1500, from, tRec + 400);
  let prev = tRec - 1;
  const tCaps = captions.map((c) => (prev = at(c, prev + 2000, from, prev + 300)));
  const tStore = at(store, tCaps[1] + 2000, from, tCaps[1] + 300);
  const tBreak = at(breakdown, tStore + 500, from, tStore + 250);
  const tClear = at(clearArrows, tBreak + 1000, from, tBreak + 400);
  const tReduced = at(reduced, tClear + 1500, from, tClear + 300);

  const seat = EASE_IO(k(tCell, 600));
  const recQ = CELL.angles.map((_, i) => k(tRec + i * 60, 360));
  const arrowsOut = 1 - k(tClear, 300);
  const sq = k(tStore, 420) * arrowsOut;
  const bq = k(tBreak, 420) * arrowsOut;
  const r = C.R * 0.64;
  // store: from outside the membrane on the left, into the droplet edge
  const sx0 = C.cx - C.R - 90;
  const sx1 = C.cx - r - 8;
  // break down: from the droplet edge on the right, out past the membrane
  const bx0 = C.cx + r + 8;
  const bx1 = C.cx + C.R + 90;
  const y = C.cy;

  if (ms < tLead - 80) return null;
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <div style={{ position: "absolute", left: F.lead.left, top: F.lead.top, opacity: k(tLead, 220) * (1 - k(tHero, 260)), ...big(INK, F.lead.size) }}>{lead.text}</div>
      <div style={{ position: "absolute", left: F.hero.left, top: F.hero.top, transformOrigin: "0% 50%", ...big(INK, F.hero.size), ...stamp(k(tHero, 300), 1.3) }}>{hero.text}</div>

      {/* ── one caption seat ── */}
      {captions.map((c, i) => {
        const inq = k(tCaps[i], 260);
        const out = i + 1 < captions.length ? 1 - k(tCaps[i + 1] - 160, 200) : 1;
        if (inq <= 0 || out <= 0) return null;
        return (
          <div key={i} style={{ position: "absolute", left: F.caption.left, top: F.caption.top, width: F.caption.w, opacity: inq * out, transform: `translateY(${(1 - EASE(inq)) * 16}px)`,
            fontFamily: DISPLAY, fontWeight: 700, fontSize: F.caption.size, letterSpacing: TRACK.body, lineHeight: 1.18, color: INK }}>{c.text}</div>
        );
      })}

      <FatCellGlyph cx={C.cx} cy={C.cy} R={C.R} q={k(tCell, 520)} receptorQ={recQ} recColor={RED} line={INK} droplet={COLORS.panel}
        dim={k(tReduced, 600)} dropletLabel={cell.droplet} labelColor={SUB} float={1 - seat} />
      <div style={{ position: "absolute", left: C.cx - 300, width: 600, top: F.cellLabel.top, textAlign: "center", opacity: k(tCell + 200, 260), ...label(SUB, 36) }}>{cell.label}</div>

      {/* ── store (in) / break down (out) ── */}
      <svg style={{ position: "absolute", left: 0, top: 0 }} width={1920} height={1080}>
        {sq > 0 ? (
          <g opacity={clamp01(sq * 3)}>
            <line x1={sx0} y1={y} x2={lerp(sx0, sx1, EASE(sq)) - 4} y2={y} stroke={INK} strokeWidth={8} strokeLinecap="round" />
            <path d={`M ${lerp(sx0, sx1, EASE(sq)) - 28} ${y - 20} L ${lerp(sx0, sx1, EASE(sq))} ${y} L ${lerp(sx0, sx1, EASE(sq)) - 28} ${y + 20}`} fill="none" stroke={INK} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
          </g>
        ) : null}
        {bq > 0 ? (
          <g opacity={clamp01(bq * 3)}>
            <line x1={bx0} y1={y} x2={lerp(bx0, bx1, EASE(bq)) - 4} y2={y} stroke={INK} strokeWidth={8} strokeLinecap="round" />
            <path d={`M ${lerp(bx0, bx1, EASE(bq)) - 28} ${y - 20} L ${lerp(bx0, bx1, EASE(bq))} ${y} L ${lerp(bx0, bx1, EASE(bq)) - 28} ${y + 20}`} fill="none" stroke={INK} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" />
          </g>
        ) : null}
      </svg>
      <div style={{ position: "absolute", right: 1920 - F.store.right, top: F.store.top, opacity: sq, ...label(INK, 36) }}>{store.label}</div>
      <div style={{ position: "absolute", left: F.breakdown.left, top: F.breakdown.top, opacity: bq, ...label(INK, 36) }}>{breakdown.label}</div>
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// TwoTargets — the pitch (black world)
// ══════════════════════════════════════════════════════════════════════════
export const TWOT = {
  lead: { left: 160, top: 110, size: 88 },
  cols: [{ x: 160, w: 720 }, { x: 1040, w: 720 }],
  head: { top: 190, size: 72 },
  chip: { top: 290 },
  arrow: { y0: 370, y1: 540 },
  target: { top: 560, h: 150, size: 64 },
  direct: { top: 750 },
  turn: { top: 120 },
  tiles: { top: 240, w: 680, h: 330, xs: [200, 1040] },
  chips: { top: 650 },
};

type ColProps = { i: number; head: string; tHead: number; tArrow: number; tTarget: number; target: string; accent: boolean; chip?: string; tChip?: number };

const Col: React.FC<ColProps> = ({ i, head, tHead, tArrow, tTarget, target, accent, chip, tChip }) => {
  const k = useK();
  const WH = COLORS.paper;
  const T = TWOT;
  const c = T.cols[i];
  const cx = c.x + c.w / 2;
  const aq = EASE_IO(k(tArrow, 520));
  const tq = k(tTarget, 360);
  const col = accent ? COLORS.accent : WH;
  const yHead = lerp(T.arrow.y0, T.arrow.y1, aq);
  return (
    <>
      <div style={{ position: "absolute", left: c.x, width: c.w, top: T.head.top, textAlign: "center", opacity: k(tHead, 220), transform: `translateY(${(1 - EASE(k(tHead, 320))) * 20}px)`, ...big(col, T.head.size) }}>{head}</div>
      {chip && tChip != null ? (
        <div style={{ position: "absolute", left: c.x, width: c.w, top: T.chip.top, display: "flex", justifyContent: "center", opacity: k(tChip, 220) }}>
          <div style={{ padding: "10px 24px", borderRadius: 30, border: "3px solid rgba(255,255,255,0.5)", ...label(WH, 30) }}>{chip}</div>
        </div>
      ) : null}
      {aq > 0 ? (
        <svg style={{ position: "absolute", left: 0, top: 0 }} width={1920} height={1080}>
          <line x1={cx} y1={T.arrow.y0} x2={cx} y2={yHead - 6} stroke={col} strokeWidth={8} strokeLinecap="round" />
          <path d={`M ${cx - 22} ${yHead - 28} L ${cx} ${yHead} L ${cx + 22} ${yHead - 28}`} fill="none" stroke={col} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" opacity={clamp01(aq * 5)} />
        </svg>
      ) : null}
      {tq > 0 ? (
        <div style={{ position: "absolute", left: c.x + 60, width: c.w - 120, top: T.target.top - (1 - BACK(tq)) * 30, height: T.target.h, borderRadius: 24, background: accent ? COLORS.accent : "rgba(255,255,255,0.12)", opacity: clamp01(tq * 4),
          display: "flex", alignItems: "center", justifyContent: "center", ...big(WH, T.target.size) }}>{target}</div>
      ) : null}
    </>
  );
};

export const TwoTargets: React.FC<Win & {
  lead: { text: string } & Cued;
  left: { head: string; chip: string; target: string; headCue: Cued; chipCue: Cued; arrowCue: Cued; targetCue: Cued };
  right: { head: string; target: string; tag: string; headCue: Cued; arrowCue: Cued; targetCue: Cued; tagCue: Cued };
  turn: { label: string } & Cued; // the columns retire; the "Rona says" kicker
  tileA: { label: string; tag: string } & Cued; // visceral fat, an arrow down (the one red)
  tileB: { label: string; tag: string } & Cued; // lean mass, held level
  alone: { text: string } & Cued;
  combined: { text: string } & Cued;
}> = ({ from, to, lead, left, right, turn, tileA, tileB, alone, combined }) => {
  const ms = useMs();
  const k = useK();
  const WH = COLORS.paper;
  const RED = COLORS.accent;
  const T = TWOT;
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));

  const tLead = at(lead, from, from);
  const tLH = at(left.headCue, tLead + 1500, from, tLead + 400);
  const tLC = at(left.chipCue, tLH + 1200, from, tLH + 300);
  const tLA = at(left.arrowCue, tLC + 1500, from, tLC + 300);
  const tLT = at(left.targetCue, tLA + 1100, from, tLA + 300);
  const tRH = at(right.headCue, tLT + 1300, from, tLT + 300);
  const tRA = at(right.arrowCue, tRH + 1500, from, tRH + 300);
  const tRT = at(right.targetCue, tRA + 500, from, tRA + 250);
  const tRG = at(right.tagCue, tRT + 600, from, tRT + 250);
  const tTurn = at(turn, tRG + 1100, from, tRG + 400);
  const tA = at(tileA, tTurn + 2100, from, tTurn + 500);
  const tB = at(tileB, tA + 1600, from, tA + 400);
  const tAl = at(alone, tB + 2500, from, tB + 500);
  const tCo = at(combined, tAl + 1000, from, tAl + 300);

  const colsOut = 1 - k(tTurn - 100, 320);
  const leadO = k(tLead, 220) * (1 - k(tLH - 100, 260));
  const tiles = [{ t: tA, d: tileA, down: true }, { t: tB, d: tileB, down: false }];

  if (ms < tLead - 80) return null;
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <div style={{ position: "absolute", left: T.lead.left, top: T.lead.top, opacity: leadO, ...big(WH, T.lead.size) }}>{lead.text}</div>

      {colsOut > 0 ? (
        <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, opacity: colsOut }}>
          <Col i={0} head={left.head} tHead={tLH} chip={left.chip} tChip={tLC} tArrow={tLA} tTarget={tLT} target={left.target} accent={false} />
          <Col i={1} head={right.head} tHead={tRH} tArrow={tRA} tTarget={tRT} target={right.target} accent />
          <div style={{ position: "absolute", left: T.cols[1].x, width: T.cols[1].w, top: T.direct.top, display: "flex", justifyContent: "center" }}>
            <div style={{ ...label(WH, 40), ...stamp(k(tRG, 280), 1.4) }}>{right.tag}</div>
          </div>
        </div>
      ) : null}

      {/* ── what Rona says it could do ── */}
      <div style={{ position: "absolute", left: T.tiles.xs[0], top: T.turn.top, opacity: k(tTurn, 240), ...label(INK_SUB, 44) }}>{turn.label}</div>
      {tiles.map((x, i) => {
        const q = k(x.t, 380);
        if (q <= 0) return null;
        const left0 = T.tiles.xs[i];
        const mq = EASE_IO(k(x.t + 380, 520)); // the mark draws after the tile lands
        const mx = T.tiles.w - 110; // the mark's centre, inside the tile
        const my = T.tiles.h / 2;
        return (
          <div key={i} style={{ position: "absolute", left: left0, top: T.tiles.top + (1 - BACK(q)) * 40, width: T.tiles.w, height: T.tiles.h, borderRadius: 28, background: "rgba(255,255,255,0.08)", border: "3px solid rgba(255,255,255,0.22)", opacity: clamp01(q * 4) }}>
            <div style={{ position: "absolute", left: 50, top: 90, ...big(WH, 64) }}>{x.d.label}</div>
            <div style={{ position: "absolute", left: 52, top: 190, opacity: k(x.t + 380, 260), ...label(INK_SUB, 36) }}>{x.d.tag}</div>
            <svg style={{ position: "absolute", left: 0, top: 0 }} width={T.tiles.w} height={T.tiles.h}>
              {x.down ? (
                <g opacity={clamp01(mq * 4)}>
                  <line x1={mx} y1={my - 70} x2={mx} y2={my - 70 + 140 * mq} stroke={RED} strokeWidth={12} strokeLinecap="round" />
                  <path d={`M ${mx - 32} ${my - 70 + 140 * mq - 34} L ${mx} ${my - 70 + 140 * mq} L ${mx + 32} ${my - 70 + 140 * mq - 34}`} fill="none" stroke={RED} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" />
                </g>
              ) : (
                <line x1={mx - 56 * mq} y1={my} x2={mx + 56 * mq} y2={my} stroke={WH} strokeWidth={12} strokeLinecap="round" opacity={clamp01(mq * 4)} />
              )}
            </svg>
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 0, width: 1920, top: T.chips.top, display: "flex", justifyContent: "center", alignItems: "center", gap: 26 }}>
        {[{ t: tAl, text: alone.text, solid: true }, { t: tCo, text: combined.text, solid: false }].map((c, i) => {
          const q = k(c.t, 280);
          return (
            <div key={i} style={{ padding: "16px 30px", borderRadius: 40, background: c.solid ? WH : "transparent", border: c.solid ? "3px solid transparent" : "3px solid rgba(255,255,255,0.7)",
              opacity: clamp01(q * 3), transform: `translateY(${(1 - EASE(q)) * 18}px)`, ...label(c.solid ? COLORS.ink : WH, 36) }}>{c.text}</div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// PastLiver — extrahepatic delivery (white card)
// ══════════════════════════════════════════════════════════════════════════
export const PASTLIVER = {
  head: { left: 120, top: 110, size: 88 },
  y: 640,
  src: { x: 250 },
  liver: { cx: 900, w: 420, h: 250 },
  cell: { cx: 1590, R: 150 },
  apex: 260, // the path's height above the row
};
// a liver silhouette in a 330 x 190 box
const LIVER_D = "M 6 70 C 30 6 150 -4 250 8 C 310 16 336 44 322 80 C 306 120 240 150 170 172 C 110 190 60 184 30 150 C 6 124 -6 100 6 70 Z";

export const PastLiver: React.FC<Win & {
  source: { label: string } & Cued; // the candidate appears at the left
  head: { text: string } & Cued;
  liver: { label: string } & Cued;
  target: { label: string } & Cued; // the fat cell appears
  path: Cued; // the path arcs over the liver; the candidate travels it
  outside: { label: string } & Cued; // stamps
}> = ({ from, to, source, head, liver, target, path, outside }) => {
  const ms = useMs();
  const k = useK();
  const INK = COLORS.ink;
  const RED = COLORS.accent;
  const SUB = inkA(0.6);
  const P = PASTLIVER;
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));

  const tSrc = at(source, from, from);
  const tHead = at(head, tSrc + 900, from, tSrc + 300);
  const tLiver = at(liver, tHead + 2000, from, tHead + 400);
  const tTarget = at(target, tLiver + 1000, from, tLiver + 300);
  const tPath = at(path, tTarget + 400, from, tTarget + 200);
  const tOut = at(outside, tPath + 500, from, tPath + 300);

  const x0 = P.src.x;
  const x1 = P.cell.cx - P.cell.R - 30;
  const y = P.y;
  const ctrl = { x: (x0 + x1) / 2, y: y - P.apex * 2 }; // a quadratic bezier peaking ~apex above the row
  const bz = (t: number) => ({
    x: (1 - t) ** 2 * x0 + 2 * (1 - t) * t * ctrl.x + t * t * x1,
    y: (1 - t) ** 2 * y + 2 * (1 - t) * t * ctrl.y + t * t * y,
  });
  const pq = EASE_IO(k(tPath, 900));
  const pts = Array.from({ length: 41 }, (_, i) => bz((i / 40) * pq));
  const d = pts.map((p, i) => `${i ? "L" : "M"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const dot = bz(pq);
  const L = P.liver;
  const lq = k(tLiver, 420);
  const sq = EASE(k(tSrc, 360));

  if (ms < tSrc - 80) return null;
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <div style={{ position: "absolute", left: P.head.left, top: P.head.top, opacity: k(tHead, 220), transform: `translateY(${(1 - EASE(k(tHead, 300))) * 16}px)`, ...big(INK, P.head.size) }}>{head.text}</div>

      <svg style={{ position: "absolute", left: 0, top: 0 }} width={1920} height={1080}>
        {lq > 0 ? (
          <g transform={`translate(${L.cx - L.w / 2} ${y - L.h / 2}) scale(${L.w / 330} ${L.h / 190})`} opacity={clamp01(lq * 3)}>
            <path d={LIVER_D} fill={inkA(0.12)} stroke={inkA(0.35)} strokeWidth={4} vectorEffect="non-scaling-stroke" />
          </g>
        ) : null}
        {pq > 0 ? <path d={d} fill="none" stroke={INK} strokeWidth={6} strokeDasharray="16 12" strokeLinecap="round" /> : null}
        {/* the candidate: a solid red dot that rides the path (the one red) */}
        {sq > 0 ? <circle cx={dot.x} cy={dot.y} r={30 * sq} fill={RED} /> : null}
      </svg>
      <div style={{ position: "absolute", left: x0 - 200, width: 400, top: y + 56, textAlign: "center", opacity: k(tSrc + 150, 240) * (1 - k(tPath, 300)), ...label(SUB, 34) }}>{source.label}</div>
      <div style={{ position: "absolute", left: L.cx - 200, width: 400, top: y + L.h / 2 + 24, textAlign: "center", opacity: lq, ...label(SUB, 36) }}>{liver.label}</div>

      <FatCellGlyph cx={P.cell.cx} cy={y} R={P.cell.R} q={k(tTarget, 420)} receptorQ={CELL.angles.map(() => k(tTarget + 150, 300))} recColor={INK} line={INK} droplet={COLORS.panel} />
      <div style={{ position: "absolute", left: P.cell.cx - 250, width: 500, top: y + P.cell.R + 60, textAlign: "center", opacity: k(tTarget + 150, 260), ...label(SUB, 36) }}>{target.label}</div>

      {ms >= tOut - 60 ? (
        <div style={{ position: "absolute", left: 0, width: 1920, top: y - P.apex - 110, display: "flex", justifyContent: "center" }}>
          <div style={{ padding: "12px 28px", borderRadius: 34, background: INK, ...label(COLORS.paper, 38), ...stamp(k(tOut, 280), 1.4) }}>{outside.label}</div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
