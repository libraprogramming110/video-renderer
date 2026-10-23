// ─────────────────────────────────────────────────────────────────────────
// KIT · inhouse — WHO KEEPS DISCOVERY, AND WHO ELSE IS BUYING. GSK x Chai
// HORIZONTAL long-form, 2026-10-15 (absolute 1920x1080 coordinates).
//
// `InHouse` (§5, black): GSK's frame holds "Discovery"; a dashed vendor seat
//   appears with a struck hand-off arrow ("not handing discovery to a vendor").
//   The seat empties, and CHAI arrives in it — then docks BESIDE GSK's frame on
//   "complements" (the outside model next to the house, not inside it). GSK's
//   own models and lab data close into a retraining loop; Chai's connector
//   draws into the models on "supports"; a "Replaces" chip is struck.
// `ChaiCustomers` (§5, white card): Chai at the centre; GSK and the five named
//   partners land on their names with a ray each; then the round counts
//   ($400M, July) and the valuation stamps ($3.8B, red).
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { CLAMP, clamp01, COLORS, CountUp, DISPLAY, INK_SUB, inkA, TRACK, useMs } from "./core";
import { at, lerp, useK, type Cued, type Win } from "./elora";

const EASE = Easing.out(Easing.cubic);
const EASE_IO = Easing.inOut(Easing.cubic);
const BACK = Easing.out(Easing.back(1.7));

const label = (color: string, size: number): React.CSSProperties => ({
  fontFamily: DISPLAY, fontWeight: 700, fontSize: size, letterSpacing: TRACK.kicker, color, whiteSpace: "nowrap", lineHeight: 1.1,
});
const big = (color: string, size: number): React.CSSProperties => ({
  fontFamily: DISPLAY, fontWeight: 700, fontSize: size, letterSpacing: TRACK.display, color, lineHeight: 1, whiteSpace: "nowrap",
});
const stamp = (q: number, from = 1.35) => ({ opacity: clamp01(q * 3), transform: `scale(${lerp(from, 1, EASE(q))})` });

/** a rounded box with centred text */
const Box: React.FC<{ x: number; y: number; w: number; h: number; text: string; size: number; fill?: string; color: string; dashed?: boolean; stroke?: string; style?: React.CSSProperties }> = ({ x, y, w, h, text, size, fill, color, dashed, stroke, style }) => (
  <div style={{ position: "absolute", left: x, top: y, width: w, height: h, ...style }}>
    <svg style={{ position: "absolute", left: 0, top: 0 }} width={w} height={h}>
      <rect x={2.5} y={2.5} width={w - 5} height={h - 5} rx={24} fill={fill ?? "none"} stroke={stroke ?? "none"} strokeWidth={5} strokeDasharray={dashed ? "16 11" : undefined} />
    </svg>
    <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", ...big(color, size) }}>{text}</div>
  </div>
);

// ══════════════════════════════════════════════════════════════════════════
// InHouse — discovery stays in the house; the outside model sits beside it (black)
// ══════════════════════════════════════════════════════════════════════════
export const HOUSE = {
  frame: { x: 140, y: 200, w: 960, h: 600 }, // x 140..1100, y 200..800
  name: { x: 190, y: 236, size: 90 },
  disc: { x: 190, y: 430, w: 380, h: 120, size: 50 },
  seat: { x: 1400, y: 380, w: 360, h: 180, size: 60 }, // the vendor seat, then Chai
  dockX: 1160,
  arrow: { x0: 590, x1: 1380, y: 490, strikeX: 985 },
  models: { x: 440, y: 380, w: 400, h: 110, size: 44 },
  lab: { x: 440, y: 620, w: 400, h: 110, size: 44 },
  loopLabel: { top: 830 },
  inHouse: { top: 136 },
  outside: { top: 580 },
  replaces: { top: 650 },
};

export const InHouse: React.FC<Win & {
  gsk: { name: string } & Cued;
  discovery: { label: string } & Cued;
  vendor: { label: string } & Cued; // the dashed seat + the struck hand-off
  clear: Cued; // a pause: discovery + vendor retire
  chai: { name: string } & Cued; // arrives in the vendor's seat
  complements: Cued; // ...docks beside GSK's frame
  models: { label: string } & Cued;
  lab: { label: string } & Cued;
  loop: { label: string } & Cued; // the retraining loop closes
  outside: { label: string } & Cued;
  supports: Cued; // Chai's connector draws into the models
  inHouse: { label: string } & Cued;
  replaces: { label: string } & Cued; // struck
}> = ({ from, to, gsk, discovery, vendor, clear, chai, complements, models, lab, loop, outside, supports, inHouse, replaces }) => {
  const ms = useMs();
  const k = useK();
  const WH = COLORS.paper;
  const INK = COLORS.ink;
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));

  const tGsk = at(gsk, from, from);
  const tDisc = at(discovery, tGsk + 1100, from, tGsk + 300);
  const tVendor = at(vendor, tDisc + 900, from, tDisc + 300);
  const tClear = at(clear, tVendor + 700, from, tVendor + 300);
  const tChai = at(chai, tClear + 900, from, tClear + 300);
  const tComp = at(complements, tChai + 1100, from, tChai + 400);
  const tModels = at(models, tComp + 1200, from, tComp + 500);
  const tLab = at(lab, tModels + 3000, from, tModels + 500);
  const tLoop = at(loop, tLab + 300, from, tModels + 600);
  const tOut = at(outside, tLab + 1000, from, Math.max(tLab, tLoop) + 400);
  const tSup = at(supports, tOut + 800, from, tOut + 300);
  const tIn = at(inHouse, tSup + 800, from, tSup + 300);
  const tRep = at(replaces, tIn + 1800, from, tIn + 400);

  const F = HOUSE.frame;
  const S = HOUSE.seat;
  const A = HOUSE.arrow;
  const M = HOUSE.models;
  const L = HOUSE.lab;
  const out = 1 - k(tClear, 320);
  const fq = EASE(k(tGsk, 480));
  const vq = EASE(k(tVendor, 380));
  const aq = EASE_IO(k(tVendor + 100, 500));
  const sq = k(tVendor + 520, 260); // the strike on the hand-off
  const cq = k(tChai, 380);
  const dock = EASE_IO(k(tComp, 640));
  const chaiX = lerp(S.x, HOUSE.dockX, dock);
  const loopQ = EASE_IO(k(tLoop, 900));
  const supQ = EASE_IO(k(tSup, 500));
  const repQ = k(tRep + 860, 320); // the chip lands on "It does not", the strike on "replace"

  // the retraining loop: two arcs on the right of the models / lab boxes
  const loopX = M.x + M.w; // right edge of the two boxes
  const yTop = M.y + M.h / 2;
  const yBot = L.y + L.h / 2;
  const arcR = (yBot - yTop) / 2;
  const arcLen = Math.PI * arcR;

  if (ms < tGsk - 60) return null;
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {/* ── GSK's house ── */}
      <svg style={{ position: "absolute", left: F.x, top: F.y + (1 - fq) * 40, opacity: clamp01(fq * 3) }} width={F.w} height={F.h}>
        <rect x={2.5} y={2.5} width={F.w - 5} height={F.h - 5} rx={32} fill="none" stroke={WH} strokeWidth={5} />
      </svg>
      <div style={{ position: "absolute", left: HOUSE.name.x, top: HOUSE.name.y + (1 - fq) * 40, opacity: clamp01(fq * 3), ...big(WH, HOUSE.name.size) }}>{gsk.name}</div>
      <div style={{ position: "absolute", left: F.x, width: F.w, top: HOUSE.inHouse.top, textAlign: "center", opacity: k(tIn, 220), ...label(INK_SUB, 40) }}>{inHouse.label}</div>

      {/* ── discovery, and the hand-off that does not happen ── */}
      {out > 0 ? (
        <div style={{ opacity: out }}>
          <Box x={HOUSE.disc.x} y={HOUSE.disc.y} w={HOUSE.disc.w} h={HOUSE.disc.h} text={discovery.label} size={HOUSE.disc.size} fill={WH} color={INK} style={{ ...stamp(k(tDisc, 300), 1.25) }} />
          {vq > 0 ? <Box x={S.x} y={S.y + (1 - vq) * 40} w={S.w} h={S.h} text={vendor.label} size={S.size} color={INK_SUB} stroke={INK_SUB} dashed style={{ opacity: clamp01(vq * 3) }} /> : null}
          {aq > 0 ? (
            <svg style={{ position: "absolute", left: 0, top: 0 }} width={1920} height={1080}>
              <line x1={A.x0} y1={A.y} x2={lerp(A.x0, A.x1, aq)} y2={A.y} stroke={WH} strokeOpacity={0.6} strokeWidth={7} strokeDasharray="20 14" />
              {sq > 0 ? (
                <g stroke={COLORS.accent} strokeWidth={10} strokeLinecap="round">
                  <line x1={A.strikeX - 40} y1={A.y - 40} x2={A.strikeX - 40 + 80 * EASE(clamp01(sq * 2))} y2={A.y - 40 + 80 * EASE(clamp01(sq * 2))} />
                  {sq > 0.5 ? <line x1={A.strikeX + 40} y1={A.y - 40} x2={A.strikeX + 40 - 80 * EASE(clamp01(sq * 2 - 1))} y2={A.y - 40 + 80 * EASE(clamp01(sq * 2 - 1))} /> : null}
                </g>
              ) : null}
            </svg>
          ) : null}
        </div>
      ) : null}

      {/* ── GSK's own models, retrained on its own lab data ── */}
      {k(tModels, 1) > 0 ? <Box x={M.x} y={M.y + (1 - EASE(k(tModels, 380))) * 30} w={M.w} h={M.h} text={models.label} size={M.size} fill={WH} color={INK} style={{ opacity: k(tModels, 200) }} /> : null}
      {k(tLab, 1) > 0 ? <Box x={L.x} y={L.y + (1 - EASE(k(tLab, 380))) * 30} w={L.w} h={L.h} text={lab.label} size={L.size} color={WH} stroke={WH} style={{ opacity: k(tLab, 200) }} /> : null}
      {loopQ > 0 ? (
        <svg style={{ position: "absolute", left: 0, top: 0 }} width={1920} height={1080}>
          {/* right arc: models -> lab (down); left arc: lab -> models (up) */}
          <path d={`M ${loopX} ${yTop} A ${arcR} ${arcR} 0 0 1 ${loopX} ${yBot}`} fill="none" stroke={WH} strokeWidth={7} strokeDasharray={`${arcLen * loopQ} ${arcLen}`} />
          <path d={`M ${M.x} ${yBot} A ${arcR} ${arcR} 0 0 1 ${M.x} ${yTop}`} fill="none" stroke={WH} strokeWidth={7} strokeDasharray={`${arcLen * clamp01(loopQ * 2 - 1)} ${arcLen}`} />
          {loopQ > 0.98 ? (
            <g fill={WH}>
              <path d={`M ${loopX - 22} ${yBot - 18} L ${loopX + 4} ${yBot} L ${loopX - 22} ${yBot + 18} Z`} />
              <path d={`M ${M.x + 22} ${yTop - 18} L ${M.x - 4} ${yTop} L ${M.x + 22} ${yTop + 18} Z`} />
            </g>
          ) : null}
        </svg>
      ) : null}
      <div style={{ position: "absolute", left: F.x, width: F.w, top: HOUSE.loopLabel.top, textAlign: "center", opacity: k(tLoop + 500, 220), ...label(INK_SUB, 40) }}>{loop.label}</div>

      {/* ── Chai: in the vendor's seat, then beside the house ── */}
      {cq > 0 ? <Box x={chaiX} y={S.y + (1 - EASE(cq)) * 40} w={S.w} h={S.h} text={chai.name} size={84} fill={COLORS.accent} color={WH} style={{ opacity: clamp01(cq * 3) }} /> : null}
      <div style={{ position: "absolute", left: HOUSE.dockX, width: S.w, top: HOUSE.outside.top, textAlign: "center", opacity: k(tOut, 220), ...label(INK_SUB, 38) }}>{outside.label}</div>
      {supQ > 0 ? (
        <svg style={{ position: "absolute", left: 0, top: 0 }} width={1920} height={1080}>
          <line x1={HOUSE.dockX} y1={M.y + M.h / 2} x2={lerp(HOUSE.dockX, loopX + arcR + 34, supQ)} y2={M.y + M.h / 2} stroke={WH} strokeWidth={7} strokeLinecap="round" />
          {supQ > 0.95 ? <path d={`M ${loopX + arcR + 58} ${M.y + M.h / 2 - 20} L ${loopX + arcR + 30} ${M.y + M.h / 2} L ${loopX + arcR + 58} ${M.y + M.h / 2 + 20}`} fill="none" stroke={WH} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" /> : null}
        </svg>
      ) : null}
      <div style={{ position: "absolute", left: HOUSE.dockX, width: S.w, top: HOUSE.replaces.top, textAlign: "center", opacity: k(tRep, 220) }}>
        <span style={{ position: "relative", display: "inline-block", padding: "10px 26px", borderRadius: 36, border: `4px solid ${INK_SUB}`, ...label(INK_SUB, 36) }}>
          {replaces.label}
          <span style={{ position: "absolute", left: 8, top: "50%", height: 6, width: `calc(${100 * EASE(repQ)}% - 16px)`, background: WH, borderRadius: 3 }} />
        </span>
      </div>
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// ChaiCustomers — the partners, then the money (white card)
// ══════════════════════════════════════════════════════════════════════════
export const CUST = {
  hub: { cx: 960, cy: 410, r: 130, size: 80 },
  seats: [[330, 410], [330, 210], [1590, 210], [1590, 410], [330, 610], [1590, 610]] as [number, number][],
  chip: { h: 84, size: 40 },
  money: { top: 740, size: 110, xs: [700, 1220] as const, labelDy: 124 },
};

export const ChaiCustomers: React.FC<Win & {
  hub: { name: string } & Cued;
  partners: ({ name: string } & Cued)[]; // seat order = CUST.seats
  round: { value: number; prefix: string; suffix: string; label: string; until: Cued; labelCue: Cued } & Cued;
  valuation: { value: number; decimals: number; prefix: string; suffix: string; label: string; until: Cued; labelCue: Cued } & Cued;
}> = ({ from, to, hub, partners, round, valuation }) => {
  const ms = useMs();
  const k = useK();
  const INK = COLORS.ink;
  const SUB = inkA(0.6);
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));

  const tHub = at(hub, from, from);
  let prev = tHub;
  const tP = partners.map((p) => (prev = at(p, prev + 700, from, prev + 150)));
  const tR = at(round, prev + 1000, from, prev + 300);
  const tRe = at(round.until, tR + 800, from, tR + 300);
  const tRl = at(round.labelCue, tRe + 600, from, tR + 200);
  const tV = at(valuation, tRl + 1600, from, tRl + 300);
  const tVe = at(valuation.until, tV + 800, from, tV + 300);
  const tVl = at(valuation.labelCue, tVe + 500, from, tV + 200);

  const H = CUST.hub;
  const C = CUST.chip;
  const M = CUST.money;
  const hq = k(tHub, 420);

  if (ms < tHub - 60) return null;
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {/* rays first so the hub and chips sit on top */}
      <svg style={{ position: "absolute", left: 0, top: 0 }} width={1920} height={1080}>
        {partners.map((p, i) => {
          const q = EASE(k(tP[i], 380));
          if (q <= 0) return null;
          const [sx, sy] = CUST.seats[i];
          const ang = Math.atan2(sy - H.cy, sx - H.cx);
          const x0 = H.cx + Math.cos(ang) * (H.r + 14);
          const y0 = H.cy + Math.sin(ang) * (H.r + 14);
          const half = (p.name.length * C.size * 0.56 + 70) / 2; // the chip's estimated half-width (0.56em/glyph + padding)
          const edgeX = sx + (sx < H.cx ? half - 6 : -half + 6); // tuck the ray under the chip's inner edge
          return <line key={i} x1={x0} y1={y0} x2={lerp(x0, edgeX, q)} y2={lerp(y0, sy, q)} stroke={INK} strokeOpacity={0.35} strokeWidth={5} />;
        })}
      </svg>
      {hq > 0 ? (
        <div style={{ position: "absolute", left: H.cx - H.r, top: H.cy - H.r, width: H.r * 2, height: H.r * 2, borderRadius: H.r, background: INK, display: "flex", alignItems: "center", justifyContent: "center", ...big(COLORS.paper, H.size), ...stamp(hq, 1.3) }}>{hub.name}</div>
      ) : null}
      {partners.map((p, i) => {
        const q = k(tP[i], 300);
        if (q <= 0) return null;
        const [sx, sy] = CUST.seats[i];
        return (
          <div key={i} style={{ position: "absolute", left: sx - 260, width: 520, top: sy - C.h / 2, display: "flex", justifyContent: "center", ...stamp(q, 1.3) }}>
            <div style={{ height: C.h, padding: "0 30px", borderRadius: C.h / 2, border: `5px solid ${INK}`, boxSizing: "border-box", display: "flex", alignItems: "center", background: COLORS.paper, ...label(INK, C.size) }}>{p.name}</div>
          </div>
        );
      })}

      {/* ── the money ── */}
      <CountUp fromMs={tR} toMs={tRe} value={round.value} decimals={0} prefix={round.prefix} suffix={round.suffix} style={{ position: "absolute", left: M.xs[0] - 400, width: 800, top: M.top, textAlign: "center", ...big(INK, M.size) }} />
      <div style={{ position: "absolute", left: M.xs[0] - 400, width: 800, top: M.top + M.labelDy, textAlign: "center", opacity: k(tRl, 220), ...label(SUB, 38) }}>{round.label}</div>
      <CountUp fromMs={tV} toMs={tVe} value={valuation.value} decimals={valuation.decimals} prefix={valuation.prefix} suffix={valuation.suffix} style={{ position: "absolute", left: M.xs[1] - 400, width: 800, top: M.top, textAlign: "center", ...big(COLORS.accent, M.size) }} />
      <div style={{ position: "absolute", left: M.xs[1] - 400, width: 800, top: M.top + M.labelDy, textAlign: "center", opacity: k(tVl, 220), ...label(SUB, 38) }}>{valuation.label}</div>
    </AbsoluteFill>
  );
};
