// ─────────────────────────────────────────────────────────────────────────
// KIT · rail — THE SPINE of the AstraZeneca x insitro HORIZONTAL long-form,
// 2026-10-22 (16:9; absolute 1920x1080 coordinates, sized to the white card).
// A drug's path drawn once as a rail of five steps; both deals ride it. `RAIL` is
// exported so every later scene draws the rail in the SAME seat.
//
// Motion (Nel, 2026-10-22: "go crazy… the constraint is how busy it is"): one mover
// at a time, each one big. The camera rides the pen head as it draws the rail, then
// pulls back; boxes UNFOLD in 3D and fold flat into brackets; the Virtual Human
// ASSEMBLES from scattered dots; an arrow swoops; the token arc-jumps and squashes
// on landing; the rights stamp slams out of a blur. Nothing loops.
//
// Grammar: dashed / hollow = not yet (the bullseye at Target, the program token,
// which is a role, not progress); solid = what the deal assigns (the brackets).
//
// `RailBase` — the rail + its steps, drawn by a pen (`draw` 0..1), labels lit by `lit`.
// `DotFigure` — a person made of dots ("Virtual Human"), built top-down (`k`).
// `StructureRail` (white card, §2): the rail draws; insitro's box + Virtual Human;
//   the beam to Target; AstraZeneca's box and its nominate arrow; insitro's box
//   collapses into its bracket and the token travels to Development candidate;
//   AstraZeneca's box collapses into its bracket and the token hops Clinical →
//   Regulatory → Commercial; "Exclusive worldwide rights" stamps red.
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { CLAMP, clamp01, COLORS, inkA, useMs } from "./core";
import { at, lerp, useK, type Cued, type Win } from "./elora";
import { big, label, stamp } from "./rona";
import { Bullseye, Letters } from "./hunt";

const EASE = Easing.out(Easing.cubic);
const EASE_IN = Easing.in(Easing.cubic);
const EASE_IO = Easing.inOut(Easing.cubic);
const BACK = Easing.out(Easing.back(1.7));

// ══════════════════════════════════════════════════════════════════════════
// Geometry — one seat for every scene that draws the rail
// ══════════════════════════════════════════════════════════════════════════
export const RAIL = {
  y: 560, x0: 170, x1: 1760,
  xs: [260, 700, 1100, 1420, 1690] as const,
  labels: [["Target"], ["Development", "candidate"], ["Clinical", "development"], ["Regulatory"], ["Commercial"]] as const,
  labelTop: 612, labelSize: 34, node: 20, eyeR: 46,
  bracket: { y: 410, tick: 24, labelTop: 330, labelSize: 52 }, // clear of the token (centre y-100) and the Target bullseye
};

export const RailBase: React.FC<{ draw: number; lit?: number[]; color?: string; sub?: string; eyeK?: number; hideEye?: boolean }> = ({
  draw, lit = [], color = COLORS.ink, sub = inkA(0.5), eyeK = 0, hideEye,
}) => {
  if (draw <= 0) return null;
  const R = RAIL;
  const head = lerp(R.x0, R.x1, draw);
  return (
    <>
      <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} width={1920} height={1080}>
        <line x1={R.x0} y1={R.y} x2={head} y2={R.y} stroke={color} strokeWidth={6} strokeLinecap="round" />
        {R.xs.map((x, i) => {
          const q = clamp01((head - x) / 70);
          if (q <= 0 || i === 0) return null; // step 0 is the target: a bullseye, below
          return <circle key={i} cx={x} cy={R.y} r={R.node * BACK(q)} fill={COLORS.paper} stroke={color} strokeWidth={6} />;
        })}
        {/* the rail's arrowhead once it is fully drawn */}
        {draw >= 0.98 ? <path d={`M ${R.x1 - 4} ${R.y - 18} L ${R.x1 + 18} ${R.y} L ${R.x1 - 4} ${R.y + 18}`} fill="none" stroke={color} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" /> : null}
      </svg>
      {/* step 0: a dashed bullseye (the target nobody has found); a plain node until the beam finds it */}
      {!hideEye ? (
        eyeK > 0 ? (
          <Bullseye cx={R.xs[0]} cy={R.y} R={R.eyeR} color={color} k={eyeK} sw={5} />
        ) : clamp01((head - R.xs[0]) / 70) > 0 ? (
          <svg style={{ position: "absolute", left: 0, top: 0 }} width={1920} height={1080}>
            <circle cx={R.xs[0]} cy={R.y} r={R.node * BACK(clamp01((head - R.xs[0]) / 70))} fill={COLORS.paper} stroke={color} strokeWidth={6} strokeDasharray="10 8" />
          </svg>
        ) : null
      ) : null}
      {R.xs.map((x, i) => {
        const q = clamp01((head - x) / 70);
        if (q <= 0) return null;
        const on = lit.includes(i);
        return (
          <div key={i} style={{ position: "absolute", left: x - 160, width: 320, top: R.labelTop + (i === 0 ? 16 : 0) + (1 - EASE(q)) * 14, opacity: q, textAlign: "center", ...label(on ? color : sub, R.labelSize), lineHeight: 1.15, whiteSpace: "normal" }}>
            {R.labels[i].map((l, j) => <div key={j}>{l}</div>)}
          </div>
        );
      })}
    </>
  );
};

/** A bracket over the rail from x0 to x1 (ticks down), name above it. */
export const RailBracket: React.FC<{ x0: number; x1: number; q: number; name?: string; color?: string; nameOpacity?: number }> = ({ x0, x1, q, name, color = COLORS.ink, nameOpacity = 1 }) => {
  if (q <= 0) return null;
  const B = RAIL.bracket;
  return (
    <>
      <svg style={{ position: "absolute", left: 0, top: 0 }} width={1920} height={1080}>
        <path d={`M ${x0} ${B.y + B.tick} V ${B.y} H ${x1} V ${B.y + B.tick}`} fill="none" stroke={color} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" opacity={q} />
      </svg>
      {name ? <div style={{ position: "absolute", left: x0, width: x1 - x0, top: B.labelTop, textAlign: "center", opacity: q * nameOpacity, ...big(color, B.labelSize) }}>{name}</div> : null}
    </>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// DotFigure — a person made of dots (the "Virtual Human"), built top-down
// ══════════════════════════════════════════════════════════════════════════
const inFigure = (x: number, y: number) => {
  const head = (x - 60) ** 2 + (y - 26) ** 2 <= 22 ** 2;
  const torso = x >= 32 && x <= 88 && y >= 56 && y <= 138;
  const legs = y > 138 && y <= 206 && ((x >= 36 && x <= 56) || (x >= 64 && x <= 84));
  const arms = y >= 62 && y <= 128 && ((x >= 12 && x <= 26) || (x >= 94 && x <= 108));
  return head || torso || legs || arms;
};
const FIG_DOTS: [number, number][] = [];
for (let y = 6; y <= 206; y += 11) for (let x = 6; x <= 114; x += 11) if (inFigure(x, y)) FIG_DOTS.push([x, y]);

export const DotFigure: React.FC<{ left: number; top: number; scale: number; color: string; k: number }> = ({ left, top, scale, color, k }) => {
  if (k <= 0) return null;
  return (
    <svg style={{ position: "absolute", left, top, overflow: "visible" }} width={120 * scale} height={212 * scale} viewBox="0 0 120 212">
      {FIG_DOTS.map(([x, y], i) => {
        // each dot flies in from a scattered seed position and lands in the figure (then rests)
        const q = clamp01((k - (i / FIG_DOTS.length) * 0.45) / 0.55);
        if (q <= 0) return null;
        const a = (i * 137.508 * Math.PI) / 180;
        const d = 260 + ((i * 53) % 220);
        const e = EASE_IO(q);
        return <circle key={i} cx={lerp(60 + Math.cos(a) * d, x, e)} cy={lerp(106 + Math.sin(a) * d, y, e)} r={3.6 * lerp(0.4, 1, e)} fill={color} opacity={clamp01(q * 4)} />;
      })}
    </svg>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// StructureRail — §2 (white card)
// ══════════════════════════════════════════════════════════════════════════
export const STRUCT = {
  ins: { left: 150, top: 120, w: 660, h: 250, name: 84 },
  vh: { left: 640, top: 140, scale: 0.98, label: { left: 190, top: 270, size: 40 } },
  az: { left: 1050, top: 120, w: 720, h: 250, name: 84 },
  stampSeat: { cx: 1395, top: 740, size: 42 },
};

export const StructureRail: React.FC<Win & {
  rail: Cued; // the pen draws the rail
  ins: { name: string } & Cued; // insitro's box lands
  vh: { label: string } & Cued; // the Virtual Human builds out of dots
  find: Cued; // a beam drops to the Target step
  biology: Cued; // the dashed bullseye draws on Target
  az: { name: string } & Cued; // AstraZeneca's box lands
  nominate: { label: string } & Cued; // the arrow swoops onto Target
  carries: Cued; // insitro's box collapses into its bracket; the token appears
  devCand: Cued; // the token arrives at Development candidate
  runs: Cued; // AstraZeneca's box collapses into its bracket; the arrow retires
  steps: Cued[]; // the token hops to Clinical, Regulatory, Commercial
  rights: { label: string } & Cued; // red stamp
  railTo?: number; // the rail itself stays (no fade) until here, so the next scene takes it over in its seat
}> = ({ railTo, from, to, rail, ins, vh, find, biology, az, nominate, carries, devCand, runs, steps, rights }) => {
  const ms = useMs();
  const k = useK();
  const INK = COLORS.ink;
  const SUB = inkA(0.55);
  const RED = COLORS.accent;
  const R = RAIL;
  const S = STRUCT;
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));

  const tRail = at(rail, from, from);
  const tIns = at(ins, tRail + 1000, from, tRail + 600);
  const tVh = at(vh, tIns + 2500, from, tIns + 400);
  const tFind = at(find, tVh + 1300, from, tVh + 500);
  const tBio = at(biology, tFind + 500, from, tFind + 250);
  const tAz = at(az, tBio + 2000, from, tBio + 500);
  const tNom = at(nominate, tAz + 600, from, tAz + 350);
  const tCarry = at(carries, tNom + 2000, from, tNom + 600);
  const tDev = at(devCand, tCarry + 1800, from, tCarry + 700);
  const tRuns = at(runs, tDev + 1000, from, tDev + 500);
  const tSteps: number[] = [];
  steps.forEach((c, i) => tSteps.push(at(c, (tSteps[i - 1] ?? tRuns) + 1200, from, (tSteps[i - 1] ?? tRuns) + 400)));
  const tRights = at(rights, tSteps[tSteps.length - 1] + 1000, from, tSteps[tSteps.length - 1] + 400);

  const draw = EASE_IO(k(tRail, 950));
  // THE CAMERA: zoomed 2.4x on the pen head as it draws, then pulls back to the whole card (done as insitro lands)
  const camZ = lerp(2.4, 1, EASE_IO(k(tRail + 400, 720)));
  const headX = lerp(R.x0, R.x1, draw);
  // the boxes land, then collapse into brackets
  const insIn = EASE(k(tIns, 420));
  const insFold = lerp(-96, 0, BACK(k(tIns, 700))) + 70 * EASE_IO(k(tCarry, 600));
  const insC = EASE_IO(k(tCarry, 600));
  const azIn = EASE(k(tAz, 420));
  const azFold = lerp(-96, 0, BACK(k(tAz, 700))) + 70 * EASE_IO(k(tRuns, 600));
  const azC = EASE_IO(k(tRuns, 600));
  const beam = EASE_IO(k(tFind, 420));
  const beamOut = k(tCarry, 250);
  const nomQ = EASE_IO(k(tNom, 700));
  const nomOut = 1 - k(tCarry, 300); // retires before the token appears under it

  // the token: appears on Target as insitro's box collapses, then hops step to step
  const stops = [tDev, ...tSteps];
  let tokX: number = R.xs[0];
  let tokY = 0;
  let squash = 0;
  let lastStep = 0;
  stops.forEach((t, i) => {
    const t0 = t - (i === 0 ? 950 : 0); // the first hop runs "discovery to a development candidate"
    const dur = i === 0 ? 1600 : 560;
    const raw = k(t0, dur);
    const hop = EASE_IO(raw);
    if (raw > 0) {
      tokX = lerp(R.xs[i], R.xs[i + 1], hop);
      tokY = -Math.sin(Math.PI * raw) * (i === 0 ? 150 : 110); // an arc jump
      if (raw >= 1) lastStep = i + 1;
      const land = clamp01((ms - (t0 + dur)) / 260);
      if (land > 0 && land < 1) squash = Math.sin(Math.PI * land);
    }
  });
  const tokQ = k(tCarry + 250, 300);
  const lit = [0, ...Array.from({ length: lastStep }, (_, i) => i + 1)];

  // a box that collapses into a bracket: rect → the bracket line's span
  const boxRect = (b: { left: number; top: number; w: number; h: number }, x0: number, x1: number, c: number) => ({
    left: lerp(b.left, x0, c), top: lerp(b.top, R.bracket.y, c), width: lerp(b.w, x1 - x0, c), height: lerp(b.h, 0, c),
  });
  const insBox = boxRect(S.ins, R.xs[0], R.xs[1], insC);
  const azBox = boxRect(S.az, R.xs[2], R.xs[4], azC);

  // the nominate arrow: a swoop from AstraZeneca's box down onto Target
  const p0 = { x: S.az.left + 60, y: S.az.top + S.az.h };
  const p2 = { x: R.xs[0] + 55, y: R.y - 55 }; // the tip touches the bullseye ring
  const p1 = { x: (p0.x + p2.x) / 2, y: R.y - 200 }; // arcs ABOVE the rail, under the boxes
  const bz = (t: number) => ({ x: (1 - t) ** 2 * p0.x + 2 * (1 - t) * t * p1.x + t * t * p2.x, y: (1 - t) ** 2 * p0.y + 2 * (1 - t) * t * p1.y + t * t * p2.y });
  const arc = Array.from({ length: 41 }, (_, i) => bz((i / 40) * nomQ));
  const arcD = arc.map((p, i) => `${i ? "L" : "M"} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(" ");
  const tip = bz(nomQ);
  const prev = bz(Math.max(0, nomQ - 0.03));
  const ang = (Math.atan2(tip.y - prev.y, tip.x - prev.x) * 180) / Math.PI;

  if (ms < tRail - 60) return null;
  return (
    <AbsoluteFill style={camZ > 1.0001 ? { transformOrigin: `${headX}px ${R.y}px`, transform: `scale(${camZ})` } : undefined}>
      {ms < (railTo ?? to) ? <RailBase draw={draw} lit={lit} eyeK={k(tBio, 900)} /> : null}
      <AbsoluteFill style={{ opacity: vis }}>

      {/* ── insitro's box (with the Virtual Human), then its bracket ── */}
      {insIn > 0 ? (
        <>
          {insC < 1 ? (
            <div style={{ position: "absolute", ...insBox, opacity: clamp01(insIn * 3), transformOrigin: "50% 0%", transform: `perspective(1400px) rotateX(${insFold}deg)`, borderRadius: lerp(26, 0, insC), background: insC > 0 ? "transparent" : COLORS.panel, border: `6px solid ${INK}`, boxSizing: "border-box" }} />
          ) : null}
          <RailBracket x0={R.xs[0]} x1={R.xs[1]} q={insC} />
          <div style={{ position: "absolute", left: lerp(S.ins.left + 40, R.xs[0], insC), width: lerp(400, R.xs[1] - R.xs[0], insC), top: lerp(S.ins.top + 40 + (1 - insIn) * 60, R.bracket.labelTop, insC), textAlign: insC > 0.5 ? "center" : "left", opacity: clamp01(insIn * 3), ...big(INK, lerp(S.ins.name, R.bracket.labelSize, insC)) }}>{ins.name}</div>
          <div style={{ opacity: 1 - EASE(k(tCarry, 260)) }}>
            <DotFigure left={S.vh.left} top={S.vh.top} scale={S.vh.scale} color={INK} k={k(tVh, 900)} />
            <div style={{ position: "absolute", left: S.vh.label.left, top: S.vh.label.top, ...label(SUB, S.vh.label.size) }}>
              {ms >= tVh ? <Letters text={vh.label} t={tVh} stagger={24} rise={26} /> : null}
            </div>
          </div>
        </>
      ) : null}

      {/* ── the beam: from the platform down onto the Target step ── */}
      {beam > 0 && beamOut < 1 ? (
        <svg style={{ position: "absolute", left: 0, top: 0, opacity: 1 - beamOut }} width={1920} height={1080}>
          <line x1={R.xs[0]} y1={S.ins.top + S.ins.h} x2={R.xs[0]} y2={lerp(S.ins.top + S.ins.h, R.y - R.eyeR * 1.4, beam)} stroke={INK} strokeWidth={5} strokeDasharray="12 10" strokeLinecap="round" />
        </svg>
      ) : null}

      {/* ── AstraZeneca's box, then its bracket ── */}
      {azIn > 0 ? (
        <>
          {azC < 1 ? (
            <div style={{ position: "absolute", ...azBox, opacity: clamp01(azIn * 3), transformOrigin: "50% 0%", transform: `perspective(1400px) rotateX(${azFold}deg)`, borderRadius: lerp(26, 0, azC), background: azC > 0 ? "transparent" : COLORS.panel, border: `6px solid ${INK}`, boxSizing: "border-box" }} />
          ) : null}
          <RailBracket x0={R.xs[2]} x1={R.xs[4]} q={azC} />
          <div style={{ position: "absolute", left: lerp(S.az.left + 40, R.xs[2], azC), width: lerp(640, R.xs[4] - R.xs[2], azC), top: lerp(S.az.top + 40 + (1 - azIn) * 60, R.bracket.labelTop, azC), textAlign: azC > 0.5 ? "center" : "left", opacity: clamp01(azIn * 3), ...big(INK, lerp(S.az.name, R.bracket.labelSize, azC)) }}>
            {ms >= tAz - 40 ? <Letters text={az.name} t={tAz} stagger={24} rise={50} /> : null}
          </div>
        </>
      ) : null}

      {/* ── the nominate arrow ── */}
      {nomQ > 0 && nomOut > 0 ? (
        <>
          <svg style={{ position: "absolute", left: 0, top: 0, opacity: nomOut }} width={1920} height={1080}>
            <path d={arcD} fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" />
            <g transform={`translate(${tip.x} ${tip.y}) rotate(${ang})`}>
              <path d="M -22 -16 L 0 0 L -22 16" fill="none" stroke={INK} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
            </g>
          </svg>
          <div style={{ position: "absolute", left: bz(0.5).x - 200, width: 400, top: bz(0.5).y + 18, textAlign: "center", opacity: k(tNom + 300, 240) * nomOut, ...label(SUB, 38) }}>{nominate.label}</div>
        </>
      ) : null}

      {/* ── the program token: hollow (a role, not progress), hops as each step is voiced ── */}
      {tokQ > 0 ? (
        <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} width={1920} height={1080}>
          <ellipse cx={tokX} cy={R.y - 100 + tokY + squash * 5} rx={18 * BACK(tokQ) * (1 + squash * 0.35)} ry={18 * BACK(tokQ) * (1 - squash * 0.3)} fill={COLORS.paper} stroke={INK} strokeWidth={5} strokeDasharray="8 6" />
          <line x1={tokX} y1={R.y - 80} x2={tokX} y2={R.y - 62} stroke={INK} strokeWidth={5} strokeLinecap="round" opacity={tokQ * (tokY < -4 ? 0 : 1)} />
        </svg>
      ) : null}

      {/* ── exclusive worldwide rights: the one red ── */}
      {ms >= tRights - 40 ? (
        <div style={{ position: "absolute", left: S.stampSeat.cx - 400, width: 800, top: S.stampSeat.top, display: "flex", justifyContent: "center" }}>
          <div style={{ padding: "14px 34px", borderRadius: 40, background: RED, ...label(COLORS.paper, S.stampSeat.size), ...stamp(k(tRights, 380), 3.4), filter: k(tRights, 380) < 1 ? `blur(${(1 - EASE(k(tRights, 380))) * 14}px)` : undefined }}>{rights.label}</div>
        </div>
      ) : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};
