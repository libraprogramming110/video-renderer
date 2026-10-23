// ─────────────────────────────────────────────────────────────────────────
// KIT · money — THE RAIL GETS PRICED. Added on the AstraZeneca x insitro
// HORIZONTAL long-form, 2026-10-22 (16:9; absolute 1920x1080, on the white card).
// Takes the §2 rail over in its exact seat (RAIL): no wipe at the section change.
//
// Motion law (Nel, 2026-10-22): one mover at a time, each one big. The $40M block
// DROPS and squashes on impact; the promised money pulls out of it like a MEASURING
// TAPE, its figure riding the tape head and counting; three dashed gates pop up
// through the rail; a royalties pill drops. On "The guaranteed", everything but the
// rail FALLS off the card under gravity, the rail inflates into the headline drawn
// TO SCALE, the block CRUSHES into its true-width sliver (red, the one red, with a
// flash) and "Under 3%" slams out of a blur. Nothing loops.
//
// Never drawn: per-milestone amounts (not disclosed), a royalty rate. "Under 3%" is
// our arithmetic, 40 / (40 + 1,460) = 2.7%, and the headline is labelled as a sum.
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { CLAMP, clamp01, COLORS, inkA, useMs } from "./core";
import { at, lerp, useK, type Cued, type Win } from "./elora";
import { big, label, stamp } from "./rona";
import { BarReveal, HollowFigure, Letters } from "./hunt";
import { RAIL, RailBase } from "./rail";

const EASE = Easing.out(Easing.cubic);
const EASE_IO = Easing.inOut(Easing.cubic);
const BACK = Easing.out(Easing.back(1.9));
const BOUNCE = Easing.out(Easing.bounce);

export const MONEY = {
  block: { left: 166, top: 316, w: 190, h: 140, size: 62, sub: 28 },
  tape: { y: 296, x1: 1760, tick: 36, upTo: { top: 92, size: 40 }, fig: { top: 128, size: 120, half: 270, rest: 1090 } },
  gates: { xs: [480, 1260, 1555] as const, w: 130, h: 150, labelSize: 32 },
  royalty: { cx: 1560, top: 740, size: 34 },
  scale: { y: 520, h: 84, total: 1500, paid: 40, note: { top: 640, size: 36 }, hero: { top: 250, size: 150 } },
};

/** gravity: a group falls off the card, rotating, from `t` */
const fall = (ms: number, t: number) => {
  const f = clamp01((ms - t) / 720);
  return { f, style: f > 0 ? { transform: `translateY(${f * f * 1150}px) rotate(${f * 20}deg)`, opacity: 1 - clamp01((f - 0.7) / 0.3) } : {} };
};

export const MoneyRail: React.FC<Win & {
  paid: { value: number; prefix: string; suffix: string; label: string; until: Cued } & Cued; // the block drops + counts
  upTo: { label: string } & Cued; // the label lands as the tape starts
  more: { value: number; decimals: number; prefix: string; suffix: string; until: Cued } & Cued; // the tape pulls out; its figure rides + counts
  gates: ({ label: string } & Cued)[]; // three dashed gates pop up
  royalty: { label: string } & Cued; // the pill drops
  clear: Cued; // everything but the rail falls; the rail inflates to scale
  sliver: { label: string } & Cued; // the block crushes into its true-width sliver
  share: { label: string } & Cued; // "Under 3%" slams
  headline: { label: string } & Cued; // the far end is named
}> = ({ from, to, paid, upTo, more, gates, royalty, clear, sliver, share, headline }) => {
  const ms = useMs();
  const k = useK();
  const INK = COLORS.ink;
  const SUB = inkA(0.55);
  const RED = COLORS.accent;
  const R = RAIL;
  const M = MONEY;
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));

  const tPaid = at(paid, from, from);
  const tPaidEnd = at(paid.until, tPaid + 1000, from, tPaid + 400);
  const tUp = at(upTo, tPaidEnd + 900, from, tPaidEnd + 300);
  const tMore = at(more, tUp + 700, from, tUp + 200);
  const tMoreEnd = at(more.until, tMore + 1200, from, tMore + 400);
  const tGates: number[] = [];
  gates.forEach((g, i) => tGates.push(at(g, (tGates[i - 1] ?? tMoreEnd) + 500, from, (tGates[i - 1] ?? tMoreEnd) + 250)));
  const tRoy = at(royalty, tGates[tGates.length - 1] + 1200, from, tGates[tGates.length - 1] + 400);
  const tClear = at(clear, tRoy + 2000, from, tRoy + 500);
  const tSliver = at(sliver, tClear + 600, from, tClear + 450);
  const tShare = at(share, tSliver + 500, from, tSliver + 300);
  const tHead = at(headline, tShare + 800, from, tShare + 300);

  // the sweep: each group falls a beat after the last (one mover: the sweep)
  const fTape = fall(ms, tClear);
  const fGate = [fall(ms, tClear + 70), fall(ms, tClear + 140), fall(ms, tClear + 210)];
  const fRoy = fall(ms, tClear + 280);
  const railOut = 1 - k(tClear + 200, 300); // the steps and their labels fade as the rail inflates
  const thick = EASE_IO(k(tClear + 250, 520));
  const fly = k(tSliver, 640);

  // the block: drops, squashes on its first impact, later crushes into the sliver
  const drop = k(tPaid, 760);
  const impact = Math.sin(Math.PI * clamp01((drop - 0.34) / 0.22));
  const B = M.block;
  const sliverW = ((R.x1 - R.x0) * M.scale.paid) / M.scale.total;
  const barTop = lerp(R.y - 3, M.scale.y - M.scale.h / 2, thick);
  const barH = lerp(6, M.scale.h, thick);
  const fe = EASE_IO(fly);
  const crush = BACK(fly); // overshoots thin, then settles to the true width
  const blockRect = {
    left: lerp(B.left, R.x0, fe), top: lerp(B.top + (1 - BOUNCE(drop)) * -420, barTop, fe),
    width: Math.max(4, lerp(B.w, sliverW, crush)), height: lerp(B.h, barH, fe),
  };
  const flash = Math.sin(Math.PI * clamp01((fly - 0.45) / 0.25));
  const pq = interpolate(ms, [tPaid, tPaidEnd], [0, 1], { ...CLAMP, easing: EASE });

  // the tape: pulls out of the block, its figure riding the head and counting
  const T = M.tape;
  const tapeQ = interpolate(ms, [tMore, tMoreEnd], [0, 1], { ...CLAMP, easing: EASE_IO });
  const tapeX0 = B.left + B.w;
  const headX = lerp(tapeX0, T.x1, tapeQ);
  const figCx = Math.max(tapeX0 + T.fig.half, Math.min(headX - T.fig.half, T.fig.rest));
  const ticks = Math.floor((headX - tapeX0) / T.tick);
  const royQ = k(tRoy, 700);
  const shareQ = k(tShare, 420);

  if (ms < from - 60) return null;
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {/* ── the rail, held in its seat; it inflates into the to-scale bar ── */}
      {railOut > 0 ? (
        <div style={{ opacity: railOut }}>
          <RailBase draw={1} lit={[0, 1, 2, 3, 4]} eyeK={1} />
        </div>
      ) : null}
      {thick > 0 ? (
        <div style={{ position: "absolute", left: R.x0, top: barTop, width: R.x1 - R.x0, height: barH, borderRadius: barH / 2, border: `6px dashed ${INK}`, boxSizing: "border-box", background: COLORS.paper }} />
      ) : null}

      {/* ── the promised money: a measuring tape pulled out of the block ── */}
      {fTape.f < 1 ? (
        <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, transformOrigin: `${T.fig.rest}px ${T.y}px`, ...fTape.style }}>
          {tapeQ > 0 ? (
            <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} width={1920} height={1080}>
              <line x1={tapeX0} y1={T.y} x2={headX} y2={T.y} stroke={INK} strokeWidth={6} strokeDasharray="16 12" strokeLinecap="round" />
              {Array.from({ length: ticks }, (_, i) => (
                <line key={i} x1={tapeX0 + (i + 1) * T.tick} y1={T.y + 6} x2={tapeX0 + (i + 1) * T.tick} y2={T.y + (i % 5 === 4 ? 26 : 16)} stroke={INK} strokeWidth={3} opacity={0.55} />
              ))}
              <rect x={headX - 7} y={T.y - 22} width={14} height={44} rx={4} fill={INK} />
            </svg>
          ) : null}
          <div style={{ position: "absolute", left: figCx - 300, width: 600, top: T.upTo.top, textAlign: "center", ...label(SUB, T.upTo.size) }}>
            {ms >= tUp - 40 ? <Letters text={upTo.label} t={tUp} stagger={24} rise={24} /> : null}
          </div>
          {ms >= tMore - 60 ? (
            <HollowFigure text={`${more.prefix}${(tapeQ * more.value).toFixed(more.decimals)}${more.suffix}`} cx={figCx} top={T.fig.top} size={T.fig.size} color={INK} sw={4} />
          ) : null}
        </div>
      ) : null}

      {/* ── three dashed gates pop up through the rail ── */}
      {M.gates.xs.map((x, i) => {
        const q = BACK(k(tGates[i], 560));
        if (q <= 0 || !gates[i] || fGate[i].f >= 1) return null;
        const G = M.gates;
        const h = G.h * q;
        return (
          <div key={i} style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, transformOrigin: `${x}px ${R.y}px`, ...fGate[i].style }}>
            <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} width={1920} height={1080}>
              <path d={`M ${x - G.w / 2} ${R.y - 8} V ${R.y - 8 - h + G.w / 2} A ${G.w / 2} ${G.w / 2} 0 0 1 ${x + G.w / 2} ${R.y - 8 - h + G.w / 2} V ${R.y - 8}`}
                fill="none" stroke={INK} strokeWidth={6} strokeDasharray="14 10" strokeLinecap="round" opacity={clamp01(q * 3)} />
            </svg>
            <div style={{ position: "absolute", left: x - 160, width: 320, top: R.y - 8 - G.h - 46, textAlign: "center", ...label(INK, G.labelSize) }}>
              {ms >= tGates[i] + 150 ? <Letters text={gates[i].label} t={tGates[i] + 150} stagger={22} rise={40} mode="drop" /> : null}
            </div>
          </div>
        );
      })}

      {/* ── royalties: a dashed pill drops from the Commercial step ── */}
      {royQ > 0 && fRoy.f < 1 ? (
        <div style={{ position: "absolute", left: M.royalty.cx - 400, width: 800, top: lerp(R.y, M.royalty.top, BOUNCE(royQ)), display: "flex", justifyContent: "center", opacity: clamp01(royQ * 4), transformOrigin: "50% 0%", ...fRoy.style }}>
          <div style={{ padding: "12px 30px", borderRadius: 40, border: `5px dashed ${INK}`, background: COLORS.paper, ...label(INK, M.royalty.size) }}>{royalty.label}</div>
        </div>
      ) : null}

      {/* ── the money paid: a solid block; drops + squashes, later crushes into its sliver and turns red ── */}
      {drop > 0 ? (
        <div style={{ position: "absolute", ...blockRect, borderRadius: lerp(22, barH / 2, fe), background: fly > 0.5 ? RED : INK, opacity: clamp01(drop * 5),
          transformOrigin: "50% 100%", transform: fly > 0 ? undefined : `scale(${1 + impact * 0.22}, ${1 - impact * 0.26})`,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
          <div style={{ opacity: 1 - clamp01(fly * 3), ...big(COLORS.paper, B.size), fontVariantNumeric: "tabular-nums" }}>{`${paid.prefix}${Math.round(pq * paid.value)}${paid.suffix}`}</div>
          <div style={{ opacity: 1 - clamp01(fly * 3), marginTop: 8, ...label(COLORS.paper, B.sub), color: "rgba(255,255,255,0.75)" }}>{paid.label}</div>
          {flash > 0 ? <div style={{ position: "absolute", inset: 0, background: COLORS.paper, opacity: flash * 0.85 }} /> : null}
        </div>
      ) : null}

      {/* ── the to-scale view: the share slams out of a blur, both ends named ── */}
      {shareQ > 0 ? (
        <div style={{ position: "absolute", left: 0, width: 1920, top: M.scale.hero.top, textAlign: "center", ...big(INK, M.scale.hero.size), ...stamp(shareQ, 4), filter: shareQ < 1 ? `blur(${(1 - EASE(shareQ)) * 22}px)` : undefined }}>{share.label}</div>
      ) : null}
      <div style={{ position: "absolute", left: R.x0, top: M.scale.note.top, ...label(RED, M.scale.note.size) }}>
        <BarReveal t={tSliver + 500} color={RED}>{sliver.label}</BarReveal>
      </div>
      <div style={{ position: "absolute", left: R.x0, width: R.x1 - R.x0, top: M.scale.note.top, textAlign: "right", ...label(SUB, M.scale.note.size) }}>
        <BarReveal t={tHead} color={SUB}>{headline.label}</BarReveal>
      </div>
    </AbsoluteFill>
  );
};
