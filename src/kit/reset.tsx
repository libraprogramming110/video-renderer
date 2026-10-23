// ─────────────────────────────────────────────────────────────────────────
// KIT · reset — THE DIAL, READ BACK, THEN TURNED INTO A SCALE. Added on the
// Lilly Onswik long-form, 2026-09-26. The §5 callback to MonopolyDial.
//
// For "The read: X lost its monopoly at N months. <Negotiations> reset from
// here, and <Y's advantage> tilts the <conversation>." One object, ~12s, no
// world wipe inside it (the 08-07 cross-section rule applied WITHIN a section:
// the object transforms instead of cutting).
//
//   1. the §2 wreckage returns on the SAME seats (DIAL + burstOf): the two discs
//      sharing the centre, the seven month-pieces where the impact left them;
//   2. "lost": the pieces FALL out of frame under gravity (the monopoly is not
//      struck — its remains leave);
//   3. "monopoly … at seven months": the claim stamps and is struck, the count
//      reads 7;
//   4. "reset": the count ROLLS BACK to 0 like an odometer while a hand whips
//      once counter-clockwise round both discs — a clock rewound;
//   5. "from here": a new DASHED ring starts drawing from 12 o'clock around BOTH
//      (dashed = not yet measured, 2026-08-22: the new clock has no length);
//   6. "and": the clock retires; a beam draws between the two discs and a post
//      rises under it — the discs are now the pans of a balance;
//   7. "obesity mindshare": a weight materialises above Y's side, hovers, and
//      DROPS onto the beam; on "tilts" the beam goes down on that side and
//      settles like a real balance (a damped swing: state, not jitter);
//   8. "the co-prescribing conversation" flows word by word under the post,
//      and tilts with the beam.
//
// Portrait-first, built for the INK world (the §2 dial was on the card, so the
// holder disc is white here and the pieces are white at low alpha).
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, interpolate, Easing } from "remotion";
import { CLAMP, clamp01, COLORS, cue, cueSeq, DISPLAY, SANS, TRACK, useMs, useAccent, INK_SUB } from "./core";
import { TYPE } from "../style";
import { DIAL, arc, burstOf, pt } from "./dial";

const EASE = Easing.out(Easing.cubic);
const EASE_IO = Easing.inOut(Easing.cubic);
type Win = { from: number; to: number };
type Cued = { word?: string; ms?: number };

const useVis = (from: number, to: number, padIn = 300, padOut = 360) => {
  const ms = useMs();
  return clamp01(interpolate(ms, [from, from + padIn, to - padOut, to], [0, 1, 1, 0], CLAMP));
};

const BAL = { beamY: 660, half: 230, post: 1180, tilt: 12, newR: 372 };

/** a named disc with its own type colours (white disc + black type on ink) */
const Disc: React.FC<{ x: number; y: number; r: number; fill: string; ink: string; sub: string; name: string; owner: string; opacity?: number; scale?: number }> = ({
  x, y, r, fill, ink, sub, name, owner, opacity = 1, scale = 1,
}) => (
  <g transform={`translate(${x} ${y}) scale(${scale})`} opacity={opacity}>
    <circle r={r} fill={fill} />
    <text y={-r * 0.2} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={TYPE.labelSm} letterSpacing={TRACK.nav} fill={sub}>{owner}</text>
    <text y={r * 0.26} textAnchor="middle" fontFamily={DISPLAY} fontWeight={700} fontSize={r * 0.36} letterSpacing={TRACK.display} fill={ink}>{name}</text>
  </g>
);

/** an odometer digit column: v is continuous; the column rolls between integers */
const Odometer: React.FC<{ v: number; size: number }> = ({ v, size }) => {
  const lo = Math.floor(v);
  const f = v - lo;
  const h = size * 1.05;
  return (
    <span style={{ display: "inline-block", position: "relative", height: h, width: size * 0.62, overflow: "hidden", verticalAlign: "bottom" }}>
      <span style={{ position: "absolute", left: 0, right: 0, top: 0, transform: `translateY(${-f * h}px)` }}>
        <span style={{ display: "block", height: h, textAlign: "center" }}>{lo}</span>
        <span style={{ display: "block", height: h, textAlign: "center" }}>{lo + 1}</span>
      </span>
    </span>
  );
};

export const DialReset: React.FC<Win & {
  holder: { name: string; owner: string } & Cued;
  entrant: { name: string; owner: string } & Cued;
  months: number;
  read: { label: string } & Cued;
  lost: Cued;
  claim: { label: string } & Cued;
  count: { unit: string; word?: string; ms?: number; unitWord?: string; unitMs?: number };
  subject: { label: string } & Cued;
  reset: { label: string } & Cued;
  fromHere: { label: string } & Cued;
  balance: Cued; // "and" — the dial becomes a scale
  weight: { lines: string[]; word?: string; ms?: number; dropWord?: string; dropMs?: number };
  tilt: Cued;
  /** VERBATIM, flows under the post and tilts with the beam */
  tail: { line: string };
}> = ({ from, to, holder, entrant, months, read, lost, claim, count, subject, reset, fromHere, balance, weight, tilt, tail }) => {
  const ms = useMs();
  const acc = useAccent();
  const vis = useVis(from, to);
  const k = (a: number, d: number) => clamp01(interpolate(ms, [a, a + d], [0, 1], CLAMP));

  // ── onsets, monotonic by construction ──
  const tRead = read.ms ?? cue(read.word, from + 300, from);
  const tHolder = Math.max(tRead + 200, holder.ms ?? cue(holder.word, tRead + 900, from));
  const tLost = Math.max(tHolder + 100, lost.ms ?? cue(lost.word, tHolder + 300, from));
  const tClaim = Math.max(tLost + 150, claim.ms ?? cue(claim.word, tLost + 400, from));
  const tCount = Math.max(tClaim + 300, count.ms ?? cue(count.word, tClaim + 900, from));
  const tUnit = Math.max(tCount + 150, count.unitMs ?? cue(count.unitWord, tCount + 400, from));
  const tSubj = Math.max(tUnit + 300, subject.ms ?? cue(subject.word, tUnit + 900, from));
  const tReset = Math.max(tSubj + 300, reset.ms ?? cue(reset.word, tSubj + 1100, from));
  const tHere = Math.max(tReset + 200, fromHere.ms ?? cue(fromHere.word, tReset + 400, from));
  const tBal = Math.max(tHere + 300, balance.ms ?? cue(balance.word, tHere + 700, tHere));
  const tEnt = Math.max(tBal + 100, entrant.ms ?? cue(entrant.word, tBal + 200, tBal));
  const tWeight = Math.max(tEnt + 150, weight.ms ?? cue(weight.word, tEnt + 300, tBal));
  const tDropCue = Math.max(tWeight + 300, weight.dropMs ?? cue(weight.dropWord, tWeight + 600, tBal));
  const tTilt = Math.max(tDropCue + 400, tilt.ms ?? cue(tilt.word, tDropCue + 800, tBal));
  const DROP = 420;
  const tLand = tTilt - 60; // the weight lands just before "tilts": the beam answers the word
  const tDrop = Math.max(tDropCue + 150, tLand - DROP);

  // ── phase 1: the wreckage returns ──
  const inP = EASE(k(from + 60, 500));
  const pieces = Array.from({ length: months }, (_, i) => {
    const b = burstOf(i, months);
    // "lost": gravity, a small outward kick, a spin; out of frame in ~1.1s
    const t = Math.max(0, (ms - tLost - i * 45) / 1000);
    const fall = t > 0 ? 0.5 * 2600 * t * t : 0;
    const kick = t > 0 ? b.ox * 0.6 * Math.min(1, t * 2) : 0;
    const spin = b.spin + (t > 0 ? t * 220 * (i % 2 ? 1 : -1) : 0);
    const [mx, my] = pt(b.mid, DIAL.R);
    return (
      <g key={i} transform={`translate(${b.ox + kick} ${b.oy + fall}) rotate(${spin} ${mx} ${my})`} opacity={inP * 0.3 * (1 - clamp01(t / 1.1))}>
        <path d={arc(b.a0, b.a1)} fill="none" stroke={COLORS.paper} strokeWidth={DIAL.stroke} />
      </g>
    );
  });

  // ── phase 2-5: claim, count, reset, new clock ──
  const readP = k(tRead, 260);
  const holderPulse = 1 + 0.06 * Math.sin(Math.PI * k(tHolder, 360));
  const claimP = k(tClaim, 240);
  const strikeP = EASE(k(tClaim + 260, 300));
  const countOn = k(tCount - 60, 200);
  const unitP = k(tUnit, 220);
  const subjP = k(tSubj, 260);
  const resetStamp = { o: k(tReset, 140), s: interpolate(ms, [tReset, tReset + 300], [1.3, 1], { ...CLAMP, easing: EASE }) };
  const REW = 560;
  const rew = EASE_IO(k(tReset, REW));
  const v = months * (1 - rew);
  const handOn = ms >= tReset && ms <= tReset + REW + 200;
  const handA = -360 * rew; // counter-clockwise
  const hereP = k(tHere, 240);
  const clockSweep = Math.max(0, (ms - tHere) / 1000) * 150; // degrees: a clock that has STARTED
  const RETIRE = 420;
  const ret = 1 - k(tBal, RETIRE); // the reading layer retires when the scale forms

  // ── phase 6-8: the balance ──
  const beamP = EASE(k(tBal + 80, 520));
  const postP = EASE(k(tBal + 250, 520));
  // the damped swing after "tilts" — a real balance settling, not a shake
  const ts = Math.max(0, (ms - tTilt) / 1000);
  const ang = ms < tTilt ? 0 : BAL.tilt * (1 - Math.exp(-4.2 * ts) * Math.cos(7.5 * ts));
  // the landing nudges the beam before the swing (a 1° dip that becomes the tilt)
  const nudge = ms >= tLand && ms < tTilt ? 1.2 * Math.sin(Math.PI * clamp01((ms - tLand) / 120)) : 0;
  const A = ((ang + nudge) * Math.PI) / 180;
  const endL = [DIAL.cx - DIAL.pairDX * Math.cos(A), BAL.beamY - DIAL.pairDX * Math.sin(A)];
  const endR = [DIAL.cx + DIAL.pairDX * Math.cos(A), BAL.beamY + DIAL.pairDX * Math.sin(A)];
  const string = DIAL.cy - DIAL.pairR - BAL.beamY; // the discs hang where they already sit
  const hang = beamP; // before the beam exists the discs are simply at their seats
  const dL = [endL[0] * hang + (DIAL.cx - DIAL.pairDX) * (1 - hang), (endL[1] + string + DIAL.pairR) * hang + DIAL.cy * (1 - hang)];
  const dR = [endR[0] * hang + (DIAL.cx + DIAL.pairDX) * (1 - hang), (endR[1] + string + DIAL.pairR) * hang + DIAL.cy * (1 - hang)];
  const entrantPulse = 1 + 0.07 * Math.sin(Math.PI * k(tEnt, 360));

  // weight: materialises above the right half, hovers, drops onto the beam
  const WX = 125; // beam-local x of the weight's centre
  const WW = 230, WH = 120;
  const wAppear = EASE(k(tWeight, 360));
  const bob = ms < tDrop ? Math.sin((ms - tWeight) / 180) * 6 : 0;
  const dropP = clamp01((ms - tDrop) / DROP);
  const fallY = Easing.in(Easing.quad)(dropP);
  const hoverY = 330;
  const onBeamY = BAL.beamY + WX * Math.sin(A) - WH / 2 - 4;
  const wY = ms < tLand ? interpolate(fallY, [0, 1], [hoverY + bob, onBeamY]) : onBeamY;
  const wX = DIAL.cx + WX * Math.cos(A);
  const squash = ms >= tLand ? 1 - 0.12 * Math.sin(Math.PI * clamp01((ms - tLand) / 220)) : 1;
  const impact = k(tLand, 600);

  // tail: verbatim, word by word on its spoken frames
  const toks = tail.line.split(" ");
  const tailOn = cueSeq(toks, tTilt, to);
  const tailAng = (ang + nudge) * 0.5;

  const sweepDash = Array.from({ length: 48 }, (_, j) => {
    const a0 = j * 7.5, a1 = a0 + 4.2;
    if (clockSweep < a0) return null;
    return <path key={j} d={arcR(a0, Math.min(a1, clockSweep), BAL.newR)} fill="none" stroke={COLORS.paper} strokeWidth={6} opacity={ret * 0.85} />;
  });

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {/* header: "The read" → "Payer negotiations reset" */}
      <div style={{ position: "absolute", left: 80, right: 80, top: 176, textAlign: "center", opacity: ret }}>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: TYPE.label, letterSpacing: TRACK.nav, color: INK_SUB, opacity: readP }}>{read.label}</div>
        <div style={{ marginTop: 10, whiteSpace: "nowrap" }}>
          <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 60, letterSpacing: TRACK.headline, color: COLORS.paper, opacity: subjP }}>{subject.label} </span>
          <span style={{ display: "inline-block", fontFamily: DISPLAY, fontWeight: 700, fontSize: 60, letterSpacing: TRACK.headline, color: acc, opacity: resetStamp.o, transform: `scale(${resetStamp.s})` }}>{reset.label}</span>
        </div>
      </div>

      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {pieces}

        {/* the rewind hand: once round, counter-clockwise, with a fading wake */}
        {handOn ? (
          <>
            {[0.06, 0.12, 0.18, 0.24].map((lag, j) => {
              const a = -360 * EASE_IO(k(tReset - lag * 1000 * 0.4, REW));
              const [x1, y1] = pt(a, BAL.newR + 24);
              return <line key={j} x1={DIAL.cx} y1={DIAL.cy} x2={x1} y2={y1} stroke={COLORS.paper} strokeWidth={5} opacity={0.18 * (1 - j / 4)} />;
            })}
            {(() => {
              const [x1, y1] = pt(handA, BAL.newR + 24);
              return <line x1={DIAL.cx} y1={DIAL.cy} x2={x1} y2={y1} stroke={COLORS.paper} strokeWidth={6} strokeLinecap="round" opacity={1 - k(tReset + REW, 200)} />;
            })()}
          </>
        ) : null}

        {/* the new clock: dashed, started, no length */}
        {sweepDash}
        {hereP > 0 ? (() => {
          const [x0, y0] = pt(0, BAL.newR - 22);
          const [x1, y1] = pt(0, BAL.newR + 22);
          return <line x1={x0} y1={y0} x2={x1} y2={y1} stroke={acc} strokeWidth={8} opacity={hereP * ret} />;
        })() : null}
        {hereP > 0 ? (
          <text x={DIAL.cx + 24} y={DIAL.cy - BAL.newR - 34} fontFamily={SANS} fontWeight={700} fontSize={TYPE.labelSm} letterSpacing={TRACK.nav} fill={COLORS.paper} opacity={hereP * ret}>{fromHere.label}</text>
        ) : null}

        {/* the balance: post, beam, strings */}
        {postP > 0 ? (
          <g opacity={postP}>
            <line x1={DIAL.cx} x2={DIAL.cx} y1={BAL.beamY} y2={BAL.beamY + (BAL.post - BAL.beamY) * postP} stroke={COLORS.paper} strokeWidth={10} />
            <path d={`M ${DIAL.cx - 90} ${BAL.post + 50} L ${DIAL.cx + 90} ${BAL.post + 50} L ${DIAL.cx} ${BAL.post - 10} Z`} fill={COLORS.paper} opacity={clamp01(postP * 2 - 1)} />
          </g>
        ) : null}
        {beamP > 0 ? (
          <g>
            <line
              x1={DIAL.cx - BAL.half * Math.cos(A) * beamP} y1={BAL.beamY - BAL.half * Math.sin(A) * beamP}
              x2={DIAL.cx + BAL.half * Math.cos(A) * beamP} y2={BAL.beamY + BAL.half * Math.sin(A) * beamP}
              stroke={COLORS.paper} strokeWidth={12} strokeLinecap="round"
            />
            <circle cx={DIAL.cx} cy={BAL.beamY} r={16} fill={COLORS.paper} />
            <line x1={endL[0]} y1={endL[1]} x2={dL[0]} y2={dL[1] - DIAL.pairR} stroke={COLORS.paper} strokeWidth={4} opacity={clamp01(beamP * 2 - 1)} />
            <line x1={endR[0]} y1={endR[1]} x2={dR[0]} y2={dR[1] - DIAL.pairR} stroke={COLORS.paper} strokeWidth={4} opacity={clamp01(beamP * 2 - 1)} />
          </g>
        ) : null}

        {/* the two discs — seated, then hanging */}
        <Disc x={dL[0]} y={dL[1]} r={DIAL.pairR} fill={COLORS.paper} ink={COLORS.ink} sub="rgba(0,0,0,0.6)" name={holder.name} owner={holder.owner} opacity={inP} scale={holderPulse} />
        <Disc x={dR[0]} y={dR[1]} r={DIAL.pairR} fill={acc} ink={COLORS.paper} sub="rgba(255,255,255,0.78)" name={entrant.name} owner={entrant.owner} opacity={inP} scale={entrantPulse} />

        {/* the weight */}
        {wAppear > 0 ? (
          <g transform={`translate(${wX} ${wY}) rotate(${ms >= tLand ? ang + nudge : 0}) scale(${wAppear * (2 - squash)} ${wAppear * squash})`}>
            <rect x={-WW / 2} y={-WH / 2} width={WW} height={WH} rx={14} fill={acc} />
            {weight.lines.map((l, i) => (
              <text key={i} x={0} y={-WH / 2 + 50 + i * 42} textAnchor="middle" fontFamily={DISPLAY} fontWeight={700} fontSize={38} letterSpacing={TRACK.headline} fill={COLORS.paper}>{l}</text>
            ))}
          </g>
        ) : null}
        {impact > 0 && impact < 1 ? (
          <ellipse cx={wX} cy={onBeamY + WH / 2} rx={60 + impact * 260} ry={(60 + impact * 260) * 0.28} fill="none" stroke={acc} strokeWidth={8 * (1 - impact)} opacity={1 - impact} />
        ) : null}
      </svg>

      {/* bottom row: the claim, struck, and the count that rewinds */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1390, display: "flex", justifyContent: "center", alignItems: "baseline", gap: 24, opacity: ret }}>
        <span style={{ position: "relative", display: "inline-block", fontFamily: DISPLAY, fontWeight: 700, fontSize: 92, letterSpacing: TRACK.display, color: COLORS.paper, opacity: claimP * (1 - strikeP * 0.5) }}>
          {claim.label}
          <span style={{ position: "absolute", left: -8, top: "54%", height: 9, width: `calc(${strikeP * 100}% + 16px)`, background: acc }} />
        </span>
        <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 92, letterSpacing: TRACK.display, color: COLORS.paper, opacity: countOn, lineHeight: 1.05 }}>
          <Odometer v={v} size={92} />
        </span>
        <span style={{ fontFamily: DISPLAY, fontWeight: 400, fontSize: 92, letterSpacing: TRACK.display, color: INK_SUB, opacity: unitP }}>{count.unit}</span>
      </div>

      {/* the conversation — flows, and tilts with the beam */}
      <div style={{ position: "absolute", left: 90, right: 90, top: BAL.post + 110, display: "flex", flexWrap: "wrap", justifyContent: "center", transform: `rotate(${tailAng}deg)`, transformOrigin: "50% 0%" }}>
        {toks.map((t, i) => {
          const on = tailOn[i] ?? tTilt + 200 + i * 200;
          const p = k(on, 130);
          return (
            <span key={i} style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 76, letterSpacing: TRACK.display, lineHeight: 1.15, color: COLORS.paper, marginRight: "0.24em", opacity: p, transform: `translateY(${(1 - p) * 12}px)` }}>{t}</span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/** an arc on any radius (the new clock is larger than the month ring) */
const arcR = (a0: number, a1: number, r: number) => arc(a0, a1, r);
