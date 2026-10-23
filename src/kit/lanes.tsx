// ─────────────────────────────────────────────────────────────────────────
// KIT · lanes — TWO DEALS ON ONE RAIL. Added on the AstraZeneca x insitro HORIZONTAL
// long-form, 2026-10-22 (16:9; absolute 1920x1080, on the white card). The §2 rail
// (same steps, same xs as RAIL) returns as the TOP lane; Generate's deal draws as a
// second lane under it.
//
// Motion law (Nel, 2026-10-22): one mover at a time, each one big. Nothing loops.
//
// `TwoLanes` (white card, §5 second half): lane A rises back in with its brackets
//   (insitro / AstraZeneca); a pen draws lane B; Generate's bracket (Design → Lead
//   candidate), Zealand's (Clinical onward) and a token arc-jumps into the clinic.
//   "Different steps": all else dims, an offset arrow draws between the two starts.
//   "Find what to hit": a radar sweep circles lane A's target and it LOCKS.
//   "Design what hits it": a dart ASSEMBLES at Design, launches and THWACKS into
//   lane B's target. "The shape is the same": three features light on BOTH lanes on
//   their words: red slivers (paid), the lines turn thick-dashed (conditional), a
//   column SHUTTERS down over the clinic steps (the drugmaker owns them).
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { CLAMP, clamp01, COLORS, inkA, useMs } from "./core";
import { at, lerp, useK, type Cued, type Win } from "./elora";
import { big, label, stamp } from "./rona";
import { BarReveal, Bullseye, Dart, Letters } from "./hunt";
import { RAIL } from "./rail";

const EASE = Easing.out(Easing.cubic);
const EASE_IO = Easing.inOut(Easing.cubic);
const BACK = Easing.out(Easing.back(1.8));

export const LANES = {
  ys: [330, 720] as const,
  x0: RAIL.x0, x1: RAIL.x1, xs: RAIL.xs,
  design: 480, // lane B's mid-leg "Design" tick
  labels: { top: 464, size: 30 },
  bracketA: { y: 252, tick: 22, label: 182, size: 46 }, // above lane A
  bracketB: { y: 798, tick: 22, label: 822, size: 46 }, // below lane B
  eyeR: 40,
  caption: { top: 896, size: 42 },
  offset: { y: 592, label: { left: 506, top: 572, size: 32 } },
  column: { x0: 1040, x1: 1790, top: 120, bottom: 930, label: 132, size: 34 },
};

const Bracket: React.FC<{ x0: number; x1: number; y: number; tick: number; dir: 1 | -1; q: number; color: string; heavy?: number }> = ({ x0, x1, y, tick, dir, q, color, heavy = 0 }) => {
  if (q <= 0) return null;
  const xe = lerp(x0, x1, EASE_IO(q));
  return (
    <svg style={{ position: "absolute", left: 0, top: 0 }} width={1920} height={1080}>
      <path d={`M ${x0} ${y + tick * dir} V ${y} H ${xe}${q >= 1 ? ` V ${y + tick * dir}` : ""}`} fill="none" stroke={color} strokeWidth={lerp(6, 11, heavy)} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
};

export const TwoLanes: React.FC<Win & {
  laneA: { names: [string, string] } & Cued; // rises back in with its two brackets
  laneB: Cued; // the pen draws lane B
  gen: { name: string; designLabel: string } & Cued; // Generate's bracket: Design → Lead candidate
  zea: { name: string } & Cued; // Zealand's bracket: Clinical onward
  clinic: Cued; // the token arc-jumps into the clinic
  steps: { label: string } & Cued; // "different steps": dim + the offset arrow
  find: { label: string } & Cued; // radar sweep, lane A's target locks
  design: { label: string } & Cued; // the dart assembles
  hits: Cued; // ...launches and thwacks into lane B's target
  same: Cued; // the ornaments retire
  paid: Cued; // red slivers on both lanes
  cond: Cued; // both lanes turn thick-dashed
  owns: { label: string } & Cued; // the column shutters down
}> = ({ from, to, laneA, laneB, gen, zea, clinic, steps, find, design, hits, same, paid, cond, owns }) => {
  const ms = useMs();
  const k = useK();
  const INK = COLORS.ink;
  const RED = COLORS.accent;
  const SUB = inkA(0.55);
  const L = LANES;
  const [yA, yB] = L.ys;
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));

  const tA = at(laneA, from, from);
  const tB = at(laneB, tA + 600, from, tA + 450);
  const tGen = at(gen, tB + 1200, from, tB + 700);
  const tZea = at(zea, tGen + 1000, from, tGen + 400);
  const tClin = at(clinic, tZea + 600, from, tZea + 300);
  const tSteps = at(steps, tClin + 1200, from, tClin + 600);
  const tFind = at(find, tSteps + 2000, from, tSteps + 800);
  const tDesign = at(design, tFind + 2400, from, tFind + 900);
  const tHits = at(hits, tDesign + 600, from, tDesign + 500);
  const tSame = at(same, tHits + 900, from, tHits + 600);
  const tPaid = at(paid, tSame + 900, from, tSame + 400);
  const tCond = at(cond, tPaid + 1500, from, tPaid + 500);
  const tOwns = at(owns, tCond + 1500, from, tCond + 500);

  const rise = EASE_IO(k(tA, 560));
  const drawB = EASE_IO(k(tB, 900));
  const dim = interpolate(ms, [tSteps, tSteps + 300, tSame, tSame + 300], [0, 1, 1, 0], CLAMP); // 1 = spotlight on the starts
  const fade = (on: boolean) => (on ? 1 : lerp(1, 0.22, dim));
  const orn = 1 - k(tSame, 300); // the find/design ornaments retire on "the shape is the same"
  const condQ = EASE_IO(k(tCond, 700));
  const paidQ = k(tPaid, 380);
  const colQ = EASE_IO(k(tOwns, 560));

  // the clinic token on lane B: an arc jump Candidate → Clinical
  const cq = k(tClin, 620);
  const tokX = lerp(L.xs[2], L.xs[3], EASE_IO(cq));
  const tokY = yB - 70 - Math.sin(Math.PI * cq) * 120;

  // radar sweep around lane A's target, once
  const sweep = k(tFind, 900);
  const lockA = k(tFind + 700, 520);
  // the dart: assembles at Design on lane B, launches in an arc onto lane B's target
  const dartIn = k(tDesign, 520);
  const fly = EASE_IO(k(tHits, 560));
  const p0 = { x: L.design, y: yB - 60 };
  const p2 = { x: L.xs[0] + L.eyeR + 6, y: yB - 6 };
  const p1 = { x: (p0.x + p2.x) / 2, y: yB - 260 };
  const bz = (t: number) => ({ x: (1 - t) ** 2 * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x, y: (1 - t) ** 2 * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y });
  const tip = bz(fly);
  const prev = bz(Math.max(0, fly - 0.02));
  const ang = fly > 0.02 ? (Math.atan2(tip.y - prev.y, tip.x - prev.x) * 180) / Math.PI : (Math.atan2(p1.y - p0.y, p1.x - p0.x) * 180) / Math.PI; // aimed along its launch path while it assembles
  const thwack = Math.sin(Math.PI * clamp01((ms - (tHits + 560)) / 300));

  const lane = (y: number, draw: number, on: boolean) => {
    const xe = lerp(L.x0, L.x1, draw);
    return (
      <g opacity={fade(on)}>
        <line x1={L.x0} y1={y} x2={xe} y2={y} stroke={INK} strokeWidth={lerp(6, 16, condQ)} strokeDasharray={condQ > 0 ? `${lerp(2000, 26, condQ)} ${lerp(0, 16, condQ)}` : undefined} strokeLinecap="butt" />
        {L.xs.map((x, i) => (i === 0 || xe < x ? null : <circle key={i} cx={x} cy={y} r={RAIL.node} fill={COLORS.paper} stroke={INK} strokeWidth={6} />))}
        {draw >= 0.98 ? <path d={`M ${L.x1 - 4} ${y - 18} L ${L.x1 + 18} ${y} L ${L.x1 - 4} ${y + 18}`} fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" /> : null}
      </g>
    );
  };

  if (ms < tA - 60) return null;
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {/* ── the drugmaker's column, behind everything ── */}
      {colQ > 0 ? (
        <>
          <div style={{ position: "absolute", left: L.column.x0, width: L.column.x1 - L.column.x0, top: L.column.top, height: (L.column.bottom - L.column.top) * colQ, borderRadius: 24, background: inkA(0.07) }} />
          <div style={{ position: "absolute", left: L.column.x0, width: L.column.x1 - L.column.x0, top: L.column.label - 70, textAlign: "center", ...big(INK, L.column.size) }}>
            {ms >= tOwns + 200 ? <Letters text={owns.label} t={tOwns + 200} stagger={18} rise={30} mode="drop" /> : null}
          </div>
        </>
      ) : null}

      {/* ── lane A rises back in; lane B draws ── */}
      <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, transform: `translateY(${lerp(560, 0, rise)}px)`, opacity: clamp01(rise * 3) }}>
        <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} width={1920} height={1080}>{lane(yA, 1, true)}</svg>
        <div style={{ opacity: fade(true) }}>
          <Bullseye cx={L.xs[0]} cy={yA} R={L.eyeR} color={INK} k={1} sw={5} />
        </div>
        <div style={{ opacity: fade(true) }}>
          <Bracket x0={L.xs[0]} x1={L.xs[1]} y={L.bracketA.y} tick={L.bracketA.tick} dir={1} q={1} color={INK} />
          <div style={{ position: "absolute", left: L.xs[0], width: L.xs[1] - L.xs[0], top: L.bracketA.label, textAlign: "center", ...big(INK, L.bracketA.size) }}>{laneA.names[0]}</div>
        </div>
        <div style={{ opacity: fade(false) }}>
          <Bracket x0={L.xs[2]} x1={L.xs[4]} y={L.bracketA.y} tick={L.bracketA.tick} dir={1} q={1} color={INK} heavy={colQ} />
          <div style={{ position: "absolute", left: L.xs[2], width: L.xs[4] - L.xs[2], top: L.bracketA.label, textAlign: "center", ...big(INK, L.bracketA.size) }}>{laneA.names[1]}</div>
        </div>
      </div>
      {drawB > 0 ? (
        <>
          <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} width={1920} height={1080}>{lane(yB, drawB, false)}</svg>
          {drawB > 0.1 ? (
            <div style={{ opacity: fade(false) }}>
              <Bullseye cx={L.xs[0]} cy={yB} R={L.eyeR} color={INK} k={k(tB + 100, 500)} sw={5} />
            </div>
          ) : null}
          {/* the step labels, shared, between the lanes */}
          {L.xs.map((x, i) => (
            <div key={i} style={{ position: "absolute", left: x - 160, width: 320, top: L.labels.top, textAlign: "center", opacity: clamp01((lerp(L.x0, L.x1, drawB) - x) / 80) * fade(i === 0), ...label(SUB, L.labels.size), lineHeight: 1.15 }}>
              {RAIL.labels[i].map((t, j) => <div key={j}>{t}</div>)}
            </div>
          ))}
        </>
      ) : null}

      {/* ── lane B: Design tick, Generate's bracket, Zealand's bracket ── */}
      {k(tGen, 1) > 0 ? (
        <div style={{ opacity: fade(true) }}>
          <svg style={{ position: "absolute", left: 0, top: 0 }} width={1920} height={1080}>
            <line x1={L.design} y1={yB - 26} x2={L.design} y2={yB + 26} stroke={INK} strokeWidth={6} strokeLinecap="round" opacity={k(tGen, 200)} />
          </svg>
          <div style={{ position: "absolute", left: L.design - 160, width: 320, top: yB - 82, textAlign: "center", ...label(INK, 32) }}>
            <BarReveal t={tGen} color={INK}>{gen.designLabel}</BarReveal>
          </div>
          <Bracket x0={L.design} x1={L.xs[1]} y={L.bracketB.y} tick={L.bracketB.tick} dir={-1} q={k(tGen + 150, 520)} color={INK} />
          <div style={{ position: "absolute", left: L.design - 120, width: L.xs[1] - L.design + 240, top: L.bracketB.label, textAlign: "center", ...big(INK, L.bracketB.size) }}>
            {ms >= tGen + 300 ? <Letters text={gen.name} t={tGen + 300} stagger={30} rise={40} mode="flip" /> : null}
          </div>
        </div>
      ) : null}
      {k(tZea, 1) > 0 ? (
        <div style={{ opacity: fade(false) }}>
          <Bracket x0={L.xs[2]} x1={L.xs[4]} y={L.bracketB.y} tick={L.bracketB.tick} dir={-1} q={k(tZea, 520)} color={INK} heavy={colQ} />
          <div style={{ position: "absolute", left: L.xs[2], width: L.xs[4] - L.xs[2], top: L.bracketB.label, textAlign: "center", ...big(INK, L.bracketB.size) }}>
            {ms >= tZea + 150 ? <Letters text={zea.name} t={tZea + 150} stagger={30} rise={40} mode="flip" /> : null}
          </div>
        </div>
      ) : null}
      {cq > 0 && orn > 0 ? (
        <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible", opacity: orn * fade(false) }} width={1920} height={1080}>
          <circle cx={tokX} cy={tokY} r={18} fill={COLORS.paper} stroke={INK} strokeWidth={5} strokeDasharray="8 6" />
        </svg>
      ) : null}

      {/* ── different steps: an offset arrow between the two starts ── */}
      {dim > 0 && orn > 0 ? (
        <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible", opacity: orn }} width={1920} height={1080}>
          {(() => {
            const y = L.offset.y; // the clear band between the step labels and lane B's Design label
            const q = EASE_IO(k(tSteps + 200, 520));
            const xa = L.xs[0];
            const xb = L.design;
            return (
              <>
                <line x1={xa} y1={y - 16} x2={xa} y2={y + 16} stroke={RED} strokeWidth={6} strokeLinecap="round" opacity={clamp01(q * 4)} />
                {q > 0.2 ? (
                  <>
                    <line x1={xa + 10} y1={y} x2={lerp(xa + 10, xb - 10, (q - 0.2) / 0.8)} y2={y} stroke={RED} strokeWidth={7} strokeLinecap="round" />
                    {q >= 1 ? <path d={`M ${xb - 30} ${y - 16} L ${xb - 8} ${y} L ${xb - 30} ${y + 16}`} fill="none" stroke={RED} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" /> : null}
                  </>
                ) : null}
              </>
            );
          })()}
        </svg>
      ) : null}

      {/* ── find what to hit: a single radar sweep, then lane A's target locks ── */}
      {sweep > 0 && orn > 0 ? (
        <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible", opacity: orn }} width={1920} height={1080}>
          {sweep < 1 ? (
            <path d={(() => {
              const a = -Math.PI / 2 + sweep * Math.PI * 2;
              const r = 120;
              const a0 = a - 0.7;
              return `M ${L.xs[0]} ${yA} L ${L.xs[0] + Math.cos(a0) * r} ${yA + Math.sin(a0) * r} A ${r} ${r} 0 0 1 ${L.xs[0] + Math.cos(a) * r} ${yA + Math.sin(a) * r} Z`;
            })()} fill={inkA(0.14)} />
          ) : null}
          {lockA > 0 ? <circle cx={L.xs[0]} cy={yA} r={lerp(150, L.eyeR * 1.45, BACK(lockA))} fill="none" stroke={INK} strokeWidth={6} opacity={clamp01(lockA * 3)} /> : null}
        </svg>
      ) : null}

      {/* ── design what hits it: the dart assembles, launches, thwacks ── */}
      {dartIn > 0 && orn > 0 ? (
        <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible", opacity: orn }} width={1920} height={1080}>
          <Dart x={tip.x} y={tip.y} angle={ang} color={INK} build={dartIn} />
          {thwack > 0 ? <circle cx={L.xs[0]} cy={yB} r={L.eyeR * (1.2 + thwack * 0.8)} fill="none" stroke={INK} strokeWidth={4} opacity={thwack} /> : null}
        </svg>
      ) : null}

      {/* ── the caption seat: find, then design (each replaces the last) ── */}
      <div style={{ position: "absolute", left: 0, width: 1920, top: L.caption.top, textAlign: "center", opacity: orn * (1 - k(tDesign - 150, 150)), ...big(INK, L.caption.size) }}>
        {ms >= tFind ? <Letters text={find.label} t={tFind} stagger={20} rise={30} /> : null}
      </div>
      <div style={{ position: "absolute", left: 0, width: 1920, top: L.caption.top, textAlign: "center", opacity: orn, ...big(INK, L.caption.size) }}>
        {ms >= tDesign ? <Letters text={design.label} t={tDesign} stagger={20} rise={30} /> : null}
      </div>
      <div style={{ position: "absolute", left: L.offset.label.left, top: L.offset.label.top, opacity: dim * orn * k(tSteps + 500, 240), ...label(RED, L.offset.label.size) }}>
        {steps.label}
      </div>

      {/* ── the shape is the same: a red sliver at the start of BOTH lanes ── */}
      {paidQ > 0 ? (
        <>
          {[yA, yB].map((y, i) => (
            <div key={i} style={{ position: "absolute", left: L.x0 - 6, top: y - 15, width: 46, height: 30, borderRadius: 15, background: RED, transformOrigin: "0% 50%", ...stamp(paidQ, 3) }} />
          ))}
        </>
      ) : null}
    </AbsoluteFill>
  );
};
