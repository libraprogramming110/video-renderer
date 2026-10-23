// ─────────────────────────────────────────────────────────────────────────
// KIT · stake — A DEAL THAT IS NOT A PURCHASE. Added on the AstraZeneca x
// Summit long-form, 2026-09-30 (VERTICAL).
//
// `NotSold` (red, the hook): "$X... and <buyer> still didn't buy the company."
// The figure rolls up on a reel and throws its cash; it swoops to dock on the
// buyer. An ownership line reaches for an empty seat and SNAPS on the negation
// (recoils, goes dashed: dashed = never happened, 2026-08-22 vocabulary). On
// "buy" an "Acquired" stamp drops onto the seat, hits nothing, is struck and
// cracks in half; the halves tumble away under gravity as the company rises,
// intact, on "the company".
//
// `StakeDisc` (white card, §2, a section-length SPINE): the company is a disc.
// The stake is CUT out of it while the percentage counts (wedge angle = the
// count, every frame), extrudes on "stake" with a seam flash and a recoil, and
// its figure travels out to the stakeholder's chip. Two funding streams draw and
// flow into one trial bar; a padlock drops across the cut and snaps; a frame
// draws round the whole deal and is labelled. Then the camera pulls the deal up
// into a small docked icon ("the shape of the deal", which §5 calls back) and
// the drug ASSEMBLES domain by domain as a bispecific antibody; each target flies
// in and docks into the binding site whose SHAPE it fits (square / round).
//
// Every onset is a spoken word with an optional ms pin, clamped monotonic.
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, interpolate, Easing } from "remotion";
import { CLAMP, clamp01, COLORS, cue, DISPLAY, SANS, TRACK, useMs, INK_SUB_ON_RED } from "./core";
import { FlowLine } from "./flowline";
import { TYPE } from "../style";

const EASE = Easing.out(Easing.cubic);
const EASE_IO = Easing.inOut(Easing.cubic);

type Win = { from: number; to: number };
type Cued = { word?: string; ms?: number };

const hash = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const rad = (deg: number) => ((deg - 90) * Math.PI) / 180; // 0° = 12 o'clock, clockwise
const polar = (cx: number, cy: number, deg: number, r: number) => [cx + r * Math.cos(rad(deg)), cy + r * Math.sin(rad(deg))] as const;
/** damped settle: 0 -> 1 with one or two overshoots */
const damp = (t: number, w = 9, z = 4.5) => (t <= 0 ? 0 : 1 - Math.exp(-z * t) * Math.cos(w * t));

const useK = () => {
  const ms = useMs();
  return (a: number, dur: number) => clamp01(interpolate(ms, [a, a + dur], [0, 1], CLAMP));
};

/** A phrase of narration that owns a window (fades in/out at its edges). */
const Phrase: React.FC<{ from: number; to: number; line: string; top: number; size: number; color: string; emphasize?: string; empColor?: string; restColor?: string; restWeight?: number; underline?: string }> = ({
  from, to, line, top, size, color, emphasize, empColor, restColor, restWeight, underline,
}) => {
  const ms = useMs();
  const o = clamp01(interpolate(ms, [from - 80, from, to - 220, to], [0, 1, 1, 0], CLAMP));
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 90, right: 90, top, opacity: o }}>
      <FlowLine from={from} to={to} line={line} size={size} color={color} emphasize={emphasize} empColor={empColor} restColor={restColor} restWeight={restWeight} underline={underline} lineHeight={1.1} />
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// NotSold — the hook (red world)
// ══════════════════════════════════════════════════════════════════════════
const HOOK = {
  fig: { x: 540, y: 470, size: 300 },
  dock: { x: 270, y: 730, scale: 0.36 },
  buyer: { x: 270, y: 1010, r: 175 },
  seat: { x: 810, y: 1010, r: 175 },
  lineTop: 1330,
};

export const NotSold: React.FC<Win & {
  figure: { prefix: string; value: number; suffix: string } & Cued;
  buyer: { name: string } & Cued;
  reach: Cued; // the ownership line starts reaching
  snap: Cued; // the negation: the line snaps
  stamp: { label: string } & Cued;
  company: { label: string[] } & Cued;
  line: { text: string; emphasize: string };
}> = ({ from, to, figure, buyer, reach, snap, stamp, company, line }) => {
  const ms = useMs();
  const k = useK();
  const W = COLORS.paper;
  const vis = clamp01(interpolate(ms, [to - 360, to], [1, 0], CLAMP));

  const tFig = figure.ms ?? cue(figure.word, from + 80, from);
  const tBuyer = Math.max(tFig + 600, buyer.ms ?? cue(buyer.word, tFig + 1500, from));
  const tReach = Math.max(tBuyer + 250, reach.ms ?? cue(reach.word, tBuyer + 500, from));
  const tSnap = Math.max(tReach + 250, snap.ms ?? cue(snap.word, tReach + 450, from));
  const tStamp = Math.max(tSnap + 200, stamp.ms ?? cue(stamp.word, tSnap + 550, from));
  const tCo = Math.max(tStamp + 150, company.ms ?? cue(company.word, tStamp + 300, from));

  // ── the figure: a digit reel that rolls 0 -> value, then flies to dock on the buyer
  const roll = EASE(k(tFig, 950));
  const fIn = k(tFig - 40, 200);
  const fly = EASE_IO(k(tBuyer, 620));
  const bez = (t: number) => {
    const P0 = [HOOK.fig.x, HOOK.fig.y];
    const P1 = [620, 900];
    const P2 = [HOOK.dock.x, HOOK.dock.y];
    const u = 1 - t;
    return [u * u * P0[0] + 2 * u * t * P1[0] + t * t * P2[0], u * u * P0[1] + 2 * u * t * P1[1] + t * t * P2[1]];
  };
  const figAt = (t: number) => {
    const [x, y] = bez(t);
    return { x, y, s: interpolate(t, [0, 1], [1, HOOK.dock.scale]) };
  };
  const reelH = HOOK.fig.size;
  const speed = Math.abs(interpolate(ms, [tFig, tFig + 950], [1, 0], CLAMP)) * (ms >= tFig ? 1 : 0);
  const Figure: React.FC<{ t: number; o: number }> = ({ t, o }) => {
    const p = figAt(t);
    return (
      <div style={{ position: "absolute", left: p.x, top: p.y, transform: `translate(-50%,-50%) scale(${p.s})`, opacity: o, display: "flex", alignItems: "center",
        fontFamily: DISPLAY, fontWeight: 700, fontSize: HOOK.fig.size, letterSpacing: TRACK.display, color: W, lineHeight: 1, whiteSpace: "nowrap" }}>
        <span>{figure.prefix}</span>
        <span style={{ display: "inline-block", height: reelH, overflow: "hidden", fontVariantNumeric: "tabular-nums" }}>
          <span style={{ display: "flex", flexDirection: "column", transform: `translateY(${-roll * figure.value * reelH}px) scaleY(${1 + speed * 0.18})` }}>
            {Array.from({ length: figure.value + 1 }, (_, i) => <span key={i} style={{ height: reelH, lineHeight: `${reelH}px` }}>{i}</span>)}
          </span>
        </span>
        <span>{figure.suffix}</span>
      </div>
    );
  };

  // ── the buyer disc
  const bIn = k(tBuyer, 420);
  const bScale = interpolate(ms, [tBuyer, tBuyer + 170, tBuyer + 420], [0.5, 1.07, 1], { ...CLAMP, easing: EASE });
  // the docked figure lands with a small press on the buyer
  const press = fly >= 1 ? 1 - damp((ms - tBuyer - 620) / 1000, 22, 7) : 0;

  // ── the ownership line: reaches, then snaps back and goes dashed
  const x0 = HOOK.buyer.x + HOOK.buyer.r + 14;
  const reachX = interpolate(EASE(k(tReach, 460)), [0, 1], [x0, 700]);
  const snapT = (ms - tSnap) / 1000;
  const snapped = ms >= tSnap;
  const restX = 560;
  const tipX = snapped ? restX + (700 - restX) * (1 - damp(snapT, 16, 6)) : reachX;
  const dashQ = k(tSnap + 60, 220);
  const spark = k(tSnap, 280);

  // ── the stamp: drops, hits nothing, is struck, cracks, tumbles
  const drop = Easing.in(Easing.quad)(k(tStamp, 280));
  const tHit = tStamp + 280;
  const strike = EASE(k(tHit, 180));
  const split = (ms - (tHit + 190)) / 1000; // seconds since the crack
  const stampY = interpolate(drop, [0, 1], [-260, HOOK.seat.y]);
  const halves = split > 0;
  const halfT = Math.max(0, split);
  const g = 3200;
  const half = (side: -1 | 1) => ({
    dx: side * 30 * halfT,
    dy: 0.5 * g * halfT * halfT,
    rot: side * 14 * halfT,
  });
  const impact = k(tHit, 360);

  // ── the company rises, intact
  const cIn = k(tCo, 460);
  const cScale = interpolate(ms, [tCo, tCo + 200, tCo + 460], [0.4, 1.08, 1], { ...CLAMP, easing: EASE });
  const ring = k(tCo + 300, 900);

  const stampBox: React.CSSProperties = {
    position: "absolute", left: 0, top: 0, transform: "translate(-50%,-50%)", padding: "14px 34px", border: `9px solid ${W}`, borderRadius: 18,
    fontFamily: DISPLAY, fontWeight: 700, fontSize: 84, letterSpacing: TRACK.display, color: W, whiteSpace: "nowrap", lineHeight: 1,
  };

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {/* the ownership line: solid while reaching, dashed once snapped */}
        {ms >= tReach ? (
          <g>
            <line x1={x0} y1={HOOK.buyer.y} x2={tipX} y2={HOOK.buyer.y} stroke={W} strokeWidth={12} strokeLinecap="round" opacity={1 - dashQ} />
            <line x1={x0} y1={HOOK.buyer.y} x2={tipX} y2={HOOK.buyer.y} stroke={W} strokeWidth={12} strokeDasharray="4 22" strokeLinecap="round" opacity={dashQ} />
            {/* the arrowhead that never lands */}
            <path d={`M ${tipX - 6} ${HOOK.buyer.y - 22} L ${tipX + 20} ${HOOK.buyer.y} L ${tipX - 6} ${HOOK.buyer.y + 22}`} fill="none" stroke={W} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" opacity={1 - dashQ * 0.5} />
          </g>
        ) : null}
        {spark > 0 && spark < 1
          ? Array.from({ length: 7 }, (_, i) => {
              const a = (i / 7) * Math.PI * 2 + 0.3;
              const r0 = 20 + spark * 40;
              const r1 = r0 + 34 * (1 - spark);
              return <line key={i} x1={700 + Math.cos(a) * r0} y1={HOOK.buyer.y + Math.sin(a) * r0} x2={700 + Math.cos(a) * r1} y2={HOOK.buyer.y + Math.sin(a) * r1} stroke={W} strokeWidth={6} strokeLinecap="round" opacity={1 - spark} />;
            })
          : null}

        {/* the buyer */}
        <g transform={`translate(${HOOK.buyer.x} ${HOOK.buyer.y + press * 8}) scale(${bScale})`} opacity={bIn}>
          <circle r={HOOK.buyer.r} fill={W} />
          <text y={16} textAnchor="middle" fontFamily={DISPLAY} fontWeight={700} fontSize={46} letterSpacing={TRACK.headline} fill={COLORS.accent}>{buyer.name}</text>
        </g>

        {/* the company: rises intact on the far side of the gap */}
        {ring > 0 && ring < 1 ? <circle cx={HOOK.seat.x} cy={HOOK.seat.y} r={HOOK.seat.r + 20 + ring * 110} fill="none" stroke={W} strokeWidth={8 * (1 - ring)} opacity={1 - ring} /> : null}
        <g transform={`translate(${HOOK.seat.x} ${HOOK.seat.y}) scale(${cScale})`} opacity={cIn}>
          <circle r={HOOK.seat.r} fill={W} />
          {company.label.map((l, i) => (
            <text key={i} y={(i - (company.label.length - 1) / 2) * 54 + 16} textAnchor="middle" fontFamily={DISPLAY} fontWeight={700} fontSize={50} letterSpacing={TRACK.headline} fill={COLORS.accent}>{l}</text>
          ))}
        </g>
        {impact > 0 && impact < 1 ? <circle cx={HOOK.seat.x} cy={HOOK.seat.y} r={60 + impact * 240} fill="none" stroke={W} strokeWidth={12 * (1 - impact)} opacity={1 - impact} /> : null}
      </svg>

      {/* the docked / flying figure */}
      {ms >= tFig - 40 ? <Figure t={fly} o={fIn} /> : null}

      {/* the stamp: whole until the crack, then two tumbling halves */}
      {ms >= tStamp && !halves ? (
        <div style={{ position: "absolute", left: HOOK.seat.x, top: stampY }}>
          <div style={{ ...stampBox }}>
            {stamp.label}
            <span style={{ position: "absolute", left: -20, top: "46%", height: 14, width: `calc(${strike * 100}% + 40px)`, background: W }} />
          </div>
        </div>
      ) : null}
      {halves && halfT < 0.32
        ? ([-1, 1] as const).map((side) => {
            const h = half(side);
            return (
              <div key={side} style={{ position: "absolute", left: HOOK.seat.x + h.dx, top: HOOK.seat.y + h.dy, transform: `rotate(${h.rot}deg)`, opacity: 1 - clamp01(halfT / 0.3) }}>
                <div style={{ ...stampBox, clipPath: side < 0 ? "inset(-30px 50% -30px -30px)" : "inset(-30px -30px -30px 50%)" }}>
                  {stamp.label}
                  <span style={{ position: "absolute", left: -20, top: "46%", height: 14, width: "calc(100% + 40px)", background: W }} />
                </div>
              </div>
            );
          })
        : null}

      {/* the line, verbatim */}
      <Phrase from={tFig} to={to + 400} line={line.text} top={HOOK.lineTop} size={76} color={W} restColor={INK_SUB_ON_RED} restWeight={700} emphasize={line.emphasize} empColor={W} underline={W} />
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// StakeDisc — the §2 spine (white card)
// ══════════════════════════════════════════════════════════════════════════
export const STAKE = {
  cx: 540,
  cy: 800,
  R: 270,
  extrude: 80,
  frame: { x0: 70, y0: 290, x1: 1010, y1: 1310, r: 36 },
  bar: { x0: 260, x1: 820, y0: 1200, y1: 1280 },
  chip: { pctX: 640, nameX: 656, y: 384 },
  lock: { x: 677, y: 654 },
  dock: { x: 540, y: 380, scale: 0.32 },
  lineTop: 1350,
};

/** the antibody's geometry (after the camera pull) */
const AB = {
  hinge: [540, 1050] as const,
  theta: 38,
  name: 650,
  tagY: 1185,
};
const armDir = (side: -1 | 1) => {
  const t = (side * AB.theta * Math.PI) / 180;
  return [Math.sin(t), -Math.cos(t)] as const;
};
const armPt = (side: -1 | 1, along: number, across = 0) => {
  const [dx, dy] = armDir(side);
  // perpendicular (outward = away from the centre line)
  const [px, py] = [-dy * side, dx * side];
  return [AB.hinge[0] + dx * along + px * across, AB.hinge[1] + dy * along + py * across] as const;
};

type Domain = { x: number; y: number; rot: number; heavy: boolean };
const DOMAINS: Domain[] = (() => {
  const d: Domain[] = [];
  // Fc stem: two chains, two domains each
  for (const dx of [-34, 34]) for (const y of [1125, 1232]) d.push({ x: AB.hinge[0] + dx, y, rot: 0, heavy: true });
  // the two Fab arms: heavy chain (inner) + light chain (outer), two domains each
  for (const side of [-1, 1] as const) {
    for (const along of [72, 176]) {
      const [hx, hy] = armPt(side, along, -30);
      const [lx, ly] = armPt(side, along, 36);
      d.push({ x: hx, y: hy, rot: side * AB.theta, heavy: true });
      d.push({ x: lx, y: ly, rot: side * AB.theta, heavy: false });
    }
  }
  return d;
})();

export const StakeDisc: React.FC<Win & {
  disc: { name: string; sub: string } & Cued; // disc rises on this word (the name lands on nameWord)
  stake: { value: number; label: string; word?: string; ms?: number; labelWord?: string; labelMs?: number; cutWord?: string; cutMs?: number };
  holder: { name: string; nameWord?: string; nameMs?: number; subWord?: string; subMs?: number };
  streams: { label: string; drawWord?: string; drawMs?: number; flowWord?: string; flowMs?: number; barWord?: string; barMs?: number };
  lock: Cued;
  frame: { label: string; drawWord?: string; drawMs?: number; labelWord?: string; labelMs?: number };
  drug: {
    name: string; pullWord?: string; pullMs?: number; nameWord?: string; nameMs?: number;
    ownerWord?: string; ownerMs?: number;
    targets: [{ label: string; word?: string; ms?: number }, { label: string; word?: string; ms?: number }];
    tag: string; tagWord?: string; tagMs?: number;
  };
  phrases: { line: string; from: number; to: number }[];
}> = ({ from, to, disc, stake, holder, streams, lock, frame, drug, phrases }) => {
  const ms = useMs();
  const k = useK();
  const ink = COLORS.ink;
  const red = COLORS.accent;
  const W = COLORS.paper;
  const vis = clamp01(interpolate(ms, [from, from + 200, to - 360, to], [0, 1, 1, 0], CLAMP));

  // ── onsets (monotonic)
  const tDisc = disc.ms ?? cue(disc.word, from + 200, from);
  const tCut = Math.max(tDisc + 400, stake.ms ?? cue(stake.word, tDisc + 1300, from));
  const tLabel = Math.max(tCut + 200, stake.labelMs ?? cue(stake.labelWord, tCut + 550, from));
  const tExtrude = Math.max(tLabel + 200, stake.cutMs ?? cue(stake.cutWord, tLabel + 500, from));
  const tName = Math.max(tExtrude + 300, holder.nameMs ?? cue(holder.nameWord, tExtrude + 600, from));
  const tSub = Math.max(tName + 200, holder.subMs ?? cue(holder.subWord, tName + 500, from));
  const tDraw = Math.max(tSub + 400, streams.drawMs ?? cue(streams.drawWord, tSub + 1200, from));
  const tFlow = Math.max(tDraw + 200, streams.flowMs ?? cue(streams.flowWord, tDraw + 300, from));
  const tBar = Math.max(tFlow + 250, streams.barMs ?? cue(streams.barWord, tFlow + 600, from));
  const tLock = Math.max(tBar + 400, lock.ms ?? cue(lock.word, tBar + 900, from));
  const tFrame = Math.max(tLock + 350, frame.drawMs ?? cue(frame.drawWord, tLock + 600, from));
  const tTag = Math.max(tFrame + 300, frame.labelMs ?? cue(frame.labelWord, tFrame + 1300, from));
  const tPull = Math.max(tTag + 300, drug.pullMs ?? cue(drug.pullWord, tTag + 700, from));
  const tDrug = Math.max(tPull + 200, drug.nameMs ?? cue(drug.nameWord, tPull + 300, from));
  const tOwner = Math.max(tDrug + 600, drug.ownerMs ?? cue(drug.ownerWord, tDrug + 1800, from));
  const tT1 = Math.max(tOwner + 200, drug.targets[0].ms ?? cue(drug.targets[0].word, tOwner + 500, from));
  const tT2 = Math.max(tT1 + 400, drug.targets[1].ms ?? cue(drug.targets[1].word, tT1 + 900, from));
  const tTag2 = Math.max(tT2 + 300, drug.tagMs ?? cue(drug.tagWord, tT2 + 700, from));

  const { cx, cy, R } = STAKE;
  const WEDGE = stake.value * 3.6;
  const mid = WEDGE / 2;

  // ── disc rise
  const dIn = k(tDisc, 440);
  const dScale = interpolate(ms, [tDisc, tDisc + 180, tDisc + 440], [0.55, 1.06, 1], { ...CLAMP, easing: EASE });

  // ── the cut: wedge angle IS the count
  const cutP = EASE(k(tCut, 560));
  const shownPct = Math.round(cutP * stake.value);
  const angSmooth = cutP * WEDGE;

  // ── extrusion + recoil
  const ex = EASE(k(tExtrude, 420)) * STAKE.extrude;
  const [mdx, mdy] = [Math.cos(rad(mid)), Math.sin(rad(mid))];
  const recoilT = (ms - tExtrude) / 1000;
  const recoil = ms >= tExtrude ? Math.exp(-6 * recoilT) * Math.sin(18 * recoilT) * 16 : 0;
  const seam = k(tExtrude, 420);


  // ── camera: pull the deal up into a docked icon
  const pull = EASE_IO(k(tPull, 760));
  const camS = interpolate(pull, [0, 1], [1, STAKE.dock.scale]);
  const camX = interpolate(pull, [0, 1], [0, STAKE.dock.x - cx * STAKE.dock.scale]) + (1 - pull) * 0;
  const camY = interpolate(pull, [0, 1], [0, STAKE.dock.y - cy * STAKE.dock.scale]);
  const camO = 1 - pull * 0.5;
  const camT = pull > 0 ? `translate(${camX} ${camY}) scale(${camS})` : "";

  const pie = (a0: number, a1: number, r: number, ox = 0, oy = 0) => {
    const [x0, y0] = polar(cx + ox, cy + oy, a0, r);
    const [x1, y1] = polar(cx + ox, cy + oy, a1, r);
    return `M ${cx + ox} ${cy + oy} L ${x0} ${y0} A ${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1} ${y1} Z`;
  };

  // centre text: the count (until the name lands), then the name
  const toName = EASE_IO(k(tName, 560)); // the % travels to the chip
  const nameIn = k(tName + 120, 300);
  const subIn = k(tSub, 300);
  const labelIn = k(tLabel, 260) * (1 - k(tName, 220));
  const pctX = interpolate(toName, [0, 1], [cx, STAKE.chip.pctX - 44]);
  const pctY = interpolate(toName, [0, 1], [cy + 62, STAKE.chip.y]);
  const pctSize = interpolate(toName, [0, 1], [190, 48]);
  const pctFill = toName > 0.5 ? red : W;
  const chipIn = k(tName + 380, 300);

  // ── streams
  const L = { p0: [266, 830], c1: [170, 1010], c2: [330, 1160], p1: [500, 1200] };
  const Rr = { p0: [814, 830], c1: [910, 1010], c2: [750, 1160], p1: [580, 1200] };
  const cub = (s: typeof L, t: number) => {
    const u = 1 - t;
    const f = (i: 0 | 1) => u * u * u * s.p0[i] + 3 * u * u * t * s.c1[i] + 3 * u * t * t * s.c2[i] + t * t * t * s.p1[i];
    return [f(0), f(1)] as const;
  };
  const dPath = (s: typeof L) => `M ${s.p0[0]} ${s.p0[1]} C ${s.c1[0]} ${s.c1[1]}, ${s.c2[0]} ${s.c2[1]}, ${s.p1[0]} ${s.p1[1]}`;
  const drawP = EASE(k(tDraw, 520));
  const STREAM_LEN = 520;
  const flowing = ms >= tFlow;
  const barIn = k(tBar, 380);
  const barScale = interpolate(ms, [tBar, tBar + 160, tBar + 380], [0.7, 1.06, 1], { ...CLAMP, easing: EASE });
  const barGlow = 0;

  // ── lock: drops (gravity), shackle snaps shut
  const lockDrop = Easing.in(Easing.quad)(k(tLock, 300));
  const lockY = interpolate(lockDrop, [0, 1], [-200, STAKE.lock.y]);
  const shut = EASE(k(tLock + 380, 120));
  const lockSquash = ms >= tLock + 300 ? 1 - Math.exp(-10 * ((ms - tLock - 300) / 1000)) * Math.cos(30 * ((ms - tLock - 300) / 1000)) * 0.12 : 1;
  const lockSpark = k(tLock + 380, 260);

  // ── frame
  const F = STAKE.frame;
  const per = 2 * (F.x1 - F.x0 + F.y1 - F.y0);
  const frameP = EASE_IO(k(tFrame, 900));
  const brackets = k(tFrame + 800, 300);
  const tagIn = k(tTag, 320);
  const tagScale = interpolate(ms, [tTag, tTag + 150, tTag + 320], [1.18, 0.97, 1], { ...CLAMP, easing: EASE });

  // ── the drug (after the pull)
  const drugIn = ms >= tDrug;
  const nameP = k(tDrug + 380, 320);
  const ownerP = EASE(k(tOwner, 520));
  const discPulse = k(tOwner, 700);
  const target = (i: 0 | 1, t0: number) => {
    const side: -1 | 1 = i === 0 ? -1 : 1;
    const [tx, ty] = armPt(side, 262);
    const p = Easing.in(Easing.cubic)(k(t0, 420));
    const start = [side * 700 + 540, 980];
    const ctrl = [side * 420 + 540, 700];
    const u = 1 - p;
    const x = u * u * start[0] + 2 * u * p * ctrl[0] + p * p * tx;
    const y = u * u * start[1] + 2 * u * p * ctrl[1] + p * p * ty;
    const docked = ms >= t0 + 420;
    const hit = k(t0 + 420, 380);
    return { x, y, tx, ty, p, docked, hit, side };
  };
  const T1 = target(0, tT1);
  const T2 = target(1, tT2);
  const tagP = k(tTag2, 320);
  const tagS = interpolate(ms, [tTag2, tTag2 + 150, tTag2 + 320], [1.25, 0.96, 1], { ...CLAMP, easing: EASE });

  const TargetShape: React.FC<{ i: 0 | 1; x: number; y: number; rot: number; o: number }> = ({ i, x, y, rot, o }) => (
    <g transform={`translate(${x} ${y}) rotate(${rot})`} opacity={o}>
      {/* stalk away from the antibody */}
      <line x1={0} y1={-30} x2={0} y2={-110} stroke={ink} strokeWidth={8} strokeLinecap="round" />
      {i === 0 ? (
        <rect x={-30} y={-30} width={60} height={60} rx={8} fill={W} stroke={ink} strokeWidth={8} />
      ) : (
        <g>
          <circle cx={-18} cy={0} r={26} fill={W} stroke={ink} strokeWidth={8} />
          <circle cx={18} cy={0} r={26} fill={W} stroke={ink} strokeWidth={8} />
        </g>
      )}
    </g>
  );

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {/* ═══ THE DEAL (camera group) ═══ */}
        <g transform={camT} opacity={camO}>
          {/* frame */}
          {ms >= tFrame ? (
            <rect x={F.x0} y={F.y0} width={F.x1 - F.x0} height={F.y1 - F.y0} rx={F.r} fill="none" stroke={ink} strokeWidth={6}
              strokeDasharray={`${per * frameP} ${per}`} />
          ) : null}
          {brackets > 0
            ? ([[F.x0, F.y0, 1, 1], [F.x1, F.y0, -1, 1], [F.x0, F.y1, 1, -1], [F.x1, F.y1, -1, -1]] as const).map(([x, y, sx, sy], i) => {
                const o = 14 * (1 - brackets);
                return <path key={i} d={`M ${x - sx * o} ${y + sy * 90 - sy * o} L ${x - sx * o} ${y - sy * o} L ${x + sx * 90 - sx * o} ${y - sy * o}`} fill="none" stroke={ink} strokeWidth={16} strokeLinecap="round" opacity={brackets} />;
              })
            : null}

          {/* streams */}
          {ms >= tDraw
            ? [L, Rr].map((s, si) => (
                <g key={si}>
                  <path d={dPath(s)} fill="none" stroke={si ? red : ink} strokeWidth={10} strokeLinecap="round" strokeDasharray={`${STREAM_LEN * drawP} ${STREAM_LEN}`} />
                  {flowing
                    ? Array.from({ length: 7 }, (_, j) => {
                        const t = (ms - tFlow) / 900 - j * 0.09;
                        if (t <= 0 || t >= 1) return null;
                        const [px, py] = cub(s, t);
                        return <circle key={j} cx={px} cy={py} r={11} fill={si ? red : ink} stroke={W} strokeWidth={4} opacity={clamp01(t * 6) * clamp01((1 - t) * 6)} />;
                      })
                    : null}
                </g>
              ))
            : null}

          {/* trial bar */}
          {ms >= tBar ? (
            <g transform={`translate(${(STAKE.bar.x0 + STAKE.bar.x1) / 2} ${(STAKE.bar.y0 + STAKE.bar.y1) / 2}) scale(${barScale})`} opacity={barIn}>
              <rect x={-(STAKE.bar.x1 - STAKE.bar.x0) / 2 - barGlow * 8} y={-40 - barGlow * 8} width={STAKE.bar.x1 - STAKE.bar.x0 + barGlow * 16} height={80 + barGlow * 16} rx={48} fill="none" stroke={ink} strokeOpacity={0.14 * barGlow} strokeWidth={6} />
              <rect x={-(STAKE.bar.x1 - STAKE.bar.x0) / 2} y={-40} width={STAKE.bar.x1 - STAKE.bar.x0} height={80} rx={40} fill={ink} />
              <text y={15} textAnchor="middle" fontFamily={DISPLAY} fontWeight={700} fontSize={44} letterSpacing={TRACK.headline} fill={W}>{streams.label}</text>
            </g>
          ) : null}

          {/* the disc (minus the wedge) + the wedge, extruded */}
          <g transform={`translate(${cx} ${cy}) scale(${dScale}) translate(${-cx} ${-cy})`} opacity={dIn}>
            <g transform={`translate(${-mdx * recoil} ${-mdy * recoil})`}>
              {angSmooth <= 0 ? <circle cx={cx} cy={cy} r={R} fill={ink} /> : <path d={pie(angSmooth, 360, R)} fill={ink} />}
            </g>
            {angSmooth > 0 ? <path d={pie(0, angSmooth, R, mdx * ex, mdy * ex)} fill={red} /> : null}
            {/* seam flash along both cut edges */}
            {seam > 0 && seam < 1
              ? [0, WEDGE].map((a, i) => {
                  const [x1, y1] = polar(cx, cy, a, R);
                  return <line key={i} x1={cx} y1={cy} x2={x1} y2={y1} stroke={W} strokeWidth={8 * (1 - seam)} opacity={1 - seam} />;
                })
              : null}
          </g>

          {/* centre: the count + its label, then the holder's name */}
          {cutP > 0 ? (
            <text x={pctX} y={pctY} textAnchor="middle" fontFamily={DISPLAY} fontWeight={700} fontSize={pctSize} letterSpacing={TRACK.display} fill={pctFill}
              style={{ fontVariantNumeric: "tabular-nums" }} opacity={clamp01(cutP * 4)}>
              {shownPct}%
            </text>
          ) : null}
          <text x={cx} y={cy + 128} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={TYPE.label} letterSpacing={TRACK.nav} fill="rgba(255,255,255,0.78)" opacity={labelIn}>{stake.label}</text>
          <g opacity={nameIn} transform={`translate(${cx} ${cy + 24}) scale(${interpolate(nameIn, [0, 1], [1.15, 1])})`}>
            <text textAnchor="middle" fontFamily={DISPLAY} fontWeight={700} fontSize={110} letterSpacing={TRACK.display} fill={W}>{disc.name}</text>
          </g>
          <text x={cx} y={cy + 92} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={TYPE.label} letterSpacing={TRACK.nav} fill="rgba(255,255,255,0.78)" opacity={subIn}>{disc.sub}</text>

          {/* the stakeholder chip */}
          <g opacity={chipIn}>
            <text x={STAKE.chip.nameX} y={STAKE.chip.y} fontFamily={DISPLAY} fontWeight={700} fontSize={44} letterSpacing={TRACK.headline} fill={ink}>{holder.name}</text>
            {(() => {
              const [wx, wy] = polar(cx + mdx * STAKE.extrude, cy + mdy * STAKE.extrude, mid, R + 6);
              return <line x1={wx} y1={wy} x2={wx + (700 - wx) * chipIn} y2={wy + (STAKE.chip.y + 18 - wy) * chipIn} stroke={ink} strokeWidth={4} />;
            })()}
          </g>

          {/* the lock across the cut */}
          {ms >= tLock ? (
            <g transform={`translate(${STAKE.lock.x} ${lockY}) scale(${1 / lockSquash} ${lockSquash})`}>
              <path d="M -26 -14 L -26 -40 A 26 26 0 0 1 26 -40 L 26 -14" fill="none" stroke={ink} strokeWidth={12} strokeLinecap="round"
                transform={`translate(0 ${-(1 - shut) * 30})`} />
              <rect x={-46} y={-14} width={92} height={78} rx={14} fill={W} stroke={ink} strokeWidth={8} />
              <circle cx={0} cy={22} r={9} fill={ink} />
              {lockSpark > 0 && lockSpark < 1
                ? [-150, -110, -70, -30].map((a, i) => {
                    const r0 = 70 + lockSpark * 30;
                    const rr = (a * Math.PI) / 180;
                    return <line key={i} x1={Math.cos(rr) * r0} y1={-40 + Math.sin(rr) * r0} x2={Math.cos(rr) * (r0 + 30 * (1 - lockSpark))} y2={-40 + Math.sin(rr) * (r0 + 30 * (1 - lockSpark))} stroke={red} strokeWidth={7} strokeLinecap="round" opacity={1 - lockSpark} />;
                  })
                : null}
            </g>
          ) : null}
        </g>

        {/* the frame label rides the camera too, but it is HTML-free: keep it in SVG */}
        {ms >= tTag ? (
          <g transform={camT} opacity={camO}>
            <g transform={`translate(${F.x0 + 30} ${F.y0}) scale(${tagScale})`} opacity={tagIn}>
              <rect x={0} y={-30} width={frame.label.length * 22.5 + 48} height={60} rx={30} fill={ink} />
              <text x={24} y={13} fontFamily={SANS} fontWeight={700} fontSize={TYPE.label} letterSpacing={TRACK.nav} fill={W}>{frame.label}</text>
            </g>
          </g>
        ) : null}

        {/* ═══ THE DRUG ═══ */}
        {/* ownership leader: from the docked company down to the drug's name */}
        {ownerP > 0 ? (
          <g>
            <line x1={540} y1={STAKE.dock.y + R * STAKE.dock.scale + 8} x2={540} y2={STAKE.dock.y + R * STAKE.dock.scale + 8 + (AB.name - 70 - (STAKE.dock.y + R * STAKE.dock.scale + 8)) * ownerP} stroke={ink} strokeWidth={5} strokeDasharray="2 12" strokeLinecap="round" />
            {discPulse < 1 ? <circle cx={STAKE.dock.x} cy={STAKE.dock.y} r={R * STAKE.dock.scale + 10 + discPulse * 60} fill="none" stroke={ink} strokeWidth={6 * (1 - discPulse)} opacity={1 - discPulse} /> : null}
          </g>
        ) : null}

        {drugIn
          ? DOMAINS.map((d, i) => {
              const p = k(tDrug + i * 34, 420);
              if (p <= 0) return null;
              const e = EASE(p);
              const sx = d.x + (hash(i + 3) - 0.5) * 60;
              const sy = d.y + 70;
              const x = interpolate(e, [0, 1], [sx, d.x]);
              const y = interpolate(e, [0, 1], [sy, d.y]);
              const rot = d.rot;
              // the bispecific pulse runs hinge -> tips along both arms
              const alongFrac = d.y > AB.hinge[1] ? 0 : Math.hypot(d.x - AB.hinge[0], d.y - AB.hinge[1]) / 262;
              const glow = 0 * alongFrac;
              return (
                <g key={i} transform={`translate(${x} ${y}) rotate(${rot})`} opacity={clamp01(p * 3)}>
                  <rect x={-31} y={-50} width={62} height={100} rx={31} fill={d.heavy ? ink : W} stroke={ink} strokeWidth={d.heavy ? 0 : 7} />
                  {glow > 0 ? <rect x={-31 - glow * 10} y={-50 - glow * 10} width={62 + glow * 20} height={100 + glow * 20} rx={40} fill="none" stroke={red} strokeWidth={6} opacity={glow} /> : null}
                </g>
              );
            })
          : null}
        {/* hinge */}
        {drugIn ? <rect x={500} y={1052} width={80} height={10} rx={5} fill={ink} opacity={k(tDrug + 200, 300)} /> : null}

        {/* binding sites at the tips: a square site and a round site */}
        {drugIn
          ? ([-1, 1] as const).map((side) => {
              const [x, y] = armPt(side, 250);
              const o = k(tDrug + 460, 300);
              return (
                <g key={side} transform={`translate(${x} ${y}) rotate(${side * AB.theta})`} opacity={o}>
                  {side < 0 ? <path d="M -24 12 L -24 -14 L 24 -14 L 24 12" fill="none" stroke={ink} strokeWidth={7} strokeLinejoin="round" /> : <path d="M -26 10 A 26 22 0 0 1 26 10" fill="none" stroke={ink} strokeWidth={7} />}
                </g>
              );
            })
          : null}

        {/* the targets fly in and dock into the site whose shape they fit */}
        {[T1, T2].map((T, i) => {
          if (ms < (i === 0 ? tT1 : tT2)) return null;
          const trail = [4, 3, 2, 1].map((j) => {
            const p = Easing.in(Easing.cubic)(k((i === 0 ? tT1 : tT2) - j * 40, 420));
            return p;
          });
          return (
            <g key={i}>
              {!T.docked
                ? trail.map((p, j) => {
                    const t = target(i as 0 | 1, (i === 0 ? tT1 : tT2) + (4 - j) * 40 - 160);
                    return p > 0 ? <circle key={j} cx={t.x} cy={t.y} r={18} fill={ink} opacity={0.08 * (j + 1)} /> : null;
                  })
                : null}
              <TargetShape i={i as 0 | 1} x={T.x + armDir(T.side)[0] * 44 * (T.docked ? 1 : T.p)} y={T.y + armDir(T.side)[1] * 44 * (T.docked ? 1 : T.p)} rot={T.side * AB.theta} o={1} />
              {T.hit > 0 && T.hit < 1 ? <circle cx={T.tx} cy={T.ty} r={40 + T.hit * 120} fill="none" stroke={ink} strokeWidth={8 * (1 - T.hit)} opacity={1 - T.hit} /> : null}
            </g>
          );
        })}
      </svg>

      {/* the drug's name + target labels (HTML for crisp type) */}
      {drugIn ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: AB.name - 70, textAlign: "center", opacity: nameP, transform: `scale(${interpolate(nameP, [0, 1], [1.12, 1])})`,
          fontFamily: DISPLAY, fontWeight: 700, fontSize: 84, letterSpacing: TRACK.display, color: ink, lineHeight: 1 }}>
          {drug.name}
        </div>
      ) : null}
      {[T1, T2].map((T, i) =>
        T.docked ? (
          <div key={i} style={{ position: "absolute", left: T.tx - 150 + T.side * 230, width: 300, top: T.ty - 40, textAlign: "center", opacity: T.hit * 3 > 1 ? 1 : T.hit * 3,
            ...{ fontFamily: SANS, fontWeight: 700, fontSize: 48, letterSpacing: TRACK.nav, color: ink } }}>
            {drug.targets[i].label}
          </div>
        ) : null
      )}
      {tagP > 0 ? (
        <div style={{ position: "absolute", left: 640, top: AB.tagY - 34, opacity: tagP, transform: `scale(${tagS})`, transformOrigin: "left center",
          background: red, color: W, borderRadius: 40, padding: "10px 28px", fontFamily: DISPLAY, fontWeight: 700, fontSize: 46, letterSpacing: TRACK.headline }}>
          {drug.tag}
        </div>
      ) : null}

      {/* narration, phrase by phrase */}
      {phrases.map((p, i) => (
        <Phrase key={i} from={p.from} to={p.to} line={p.line} top={STAKE.lineTop} size={64} color={ink} />
      ))}
    </AbsoluteFill>
  );
};
