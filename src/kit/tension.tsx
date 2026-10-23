// ─────────────────────────────────────────────────────────────────────────
// KIT · tension — ONE DESIGN CHOICE, TWO READINGS. Added on the Compass/
// tovecimig long-form, 2026-09-26. HORIZONTAL, ink world.
//
// For "Here is the tension. In <month>, <source>'s <role> praised <sponsor> for
// <praise> by allowing <choice>. The same design choice is what <sponsor> says
// <harm>."
//
// The enactment is literal physics:
//   1. "tension": a slack wire strung between two pegs pulls TAUT and twangs
//      (a damped standing wave — state, not jitter);
//   2. a white card UNFOLDS out of the wire (the wire is its hinge axis) and
//      carries the praise as a dated source card: month chip, source, role,
//      the praise flowing verbatim with ONE red underline under it. A small
//      gate sits bottom-right; on "allowing" its door swings open and dots
//      start walking through (the §3 gate, called back);
//   3. "The same design choice": the card SPINS on the wire (rotateX 180°,
//      a slight overshoot and settle). The back face keeps the SAME gate on
//      the SAME seat — the design choice did not change, only its reading —
//      with a small survival picture beside it. On "clouded" FOG blooms and
//      drifts over the curves while they blur out.
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, interpolate, Easing } from "remotion";
import { CLAMP, clamp01, COLORS, cue, DISPLAY, SANS, TRACK, useMs, useAccent, INK_SUB, inkA } from "./core";
import { FlowLine } from "./flowline";
import { TYPE } from "../style";

const EASE = Easing.out(Easing.cubic);
const W = 1920;
const H = 1080;
type Cue = { word?: string; ms?: number };
const at = (c: Cue | undefined, fb: number, after: number) => c?.ms ?? cue(c?.word, fb, after);
const kf = (ms: number, a: number, d: number) => clamp01(interpolate(ms, [a, a + d], [0, 1], CLAMP));
const hash = (i: number) => {
  const x = Math.sin(i * 91.7 + 47.3) * 43758.5453;
  return x - Math.floor(x);
};

const WIRE = { x0: 180, x1: 1740, y: 530 };
const CARD = { w: 1120, h: 600 };

/** The gate, drawn in card-local coords. Door swings open (0..1); dots walk through. */
const Gate: React.FC<{ open: number; walkMs: number; color: string; dot: string }> = ({ open, walkMs, color, dot }) => {
  const gx = 870;
  const gy = 380;
  const gh = 170;
  const doorW = 90 * Math.cos((open * Math.PI) / 2.2);
  const dots = walkMs > 0 ? [0, 1, 2, 3, 4].map((j) => {
    const u = ((walkMs / 1000) * 0.42 + j * 0.2) % 1;
    return { x: 760 + u * 300, y: gy + gh - 34 - Math.abs(Math.sin(u * Math.PI * 6)) * 8, o: Math.min(1, u * 6, (1 - u) * 6) };
  }) : [];
  return (
    <g>
      <line x1={gx} x2={gx} y1={gy} y2={gy + gh} stroke={color} strokeWidth={8} />
      <line x1={gx + 100} x2={gx + 100} y1={gy} y2={gy + gh} stroke={color} strokeWidth={8} />
      <line x1={740} x2={1070} y1={gy + gh} y2={gy + gh} stroke={color} strokeWidth={4} opacity={0.5} />
      <rect x={gx + 4} y={gy + 10} width={Math.max(4, doorW)} height={gh - 20} fill={color} opacity={0.9} />
      {dots.map((d, i) => <circle key={i} cx={d.x} cy={d.y} r={13} fill={dot} opacity={walkMs > 0 ? d.o : 0} />)}
    </g>
  );
};

export const TwoFacedChoice: React.FC<{
  from: number;
  to: number;
  lead: { line: string; word?: string; ms?: number; tautWord?: string; tautMs?: number };
  front: {
    month: string; monthWord?: string; monthMs?: number;
    source: string; sourceWord?: string; sourceMs?: number;
    role: string; roleWord?: string; roleMs?: number;
    praise: string; emphasize: string; praiseWord?: string; praiseMs?: number;
    allowWord?: string; allowMs?: number;
  };
  back: {
    lead: string; leadWord?: string; leadMs?: number;
    flipWord?: string; flipMs?: number;
    says: string; saysWord?: string; saysMs?: number;
    line: string; emphasize: string; lineWord?: string; lineMs?: number;
    fogWord?: string; fogMs?: number;
    chartLabel: string;
  };
}> = ({ from, to, lead, front, back }) => {
  const ms = useMs();
  const acc = useAccent();
  const white = COLORS.paper;
  const ink = COLORS.ink;
  const gray = COLORS.grayText;
  const vis = clamp01(interpolate(ms, [from, from + 300, to - 360, to], [0, 1, 1, 0], CLAMP));

  const tLead = at(lead, from + 900, from);
  const tTaut = Math.max(tLead + 300, lead.tautMs ?? cue(lead.tautWord, tLead + 650, tLead));
  const tMonth = Math.max(tTaut + 600, front.monthMs ?? cue(front.monthWord, tTaut + 1600, tTaut));
  const tCard = tMonth - 250;
  const tSrc = Math.max(tMonth + 300, front.sourceMs ?? cue(front.sourceWord, tMonth + 900, tMonth));
  const tRole = Math.max(tSrc + 400, front.roleMs ?? cue(front.roleWord, tSrc + 2000, tSrc));
  const tPraise = Math.max(tRole + 400, front.praiseMs ?? cue(front.praiseWord, tRole + 1300, tRole));
  const tAllow = Math.max(tPraise + 800, front.allowMs ?? cue(front.allowWord, tPraise + 2700, tPraise));
  const tBackLead = Math.max(tAllow + 1000, back.leadMs ?? cue(back.leadWord, tAllow + 2500, tAllow));
  const tFlip = Math.max(tBackLead, back.flipMs ?? cue(back.flipWord, tBackLead + 200, tBackLead));
  const tSays = Math.max(tFlip + 600, back.saysMs ?? cue(back.saysWord, tFlip + 1150, tFlip));
  const tLine = Math.max(tSays + 200, back.lineMs ?? cue(back.lineWord, tSays + 550, tSays));
  const tFog = Math.max(tLine, back.fogMs ?? cue(back.fogWord, tLine, tLine));

  // ── the wire: slack → taut, then a damped twang ──
  const wireOn = EASE(kf(ms, from + 150, 500));
  const pull = EASE(kf(ms, tTaut, 280));
  const sag = 170 * (1 - pull);
  const sT = (ms - tTaut - 280) / 1000;
  const twang = sT > 0 ? 34 * Math.exp(-3.2 * sT) * Math.sin(26 * sT) : 0;
  const wirePts = Array.from({ length: 61 }, (_, i) => {
    const u = i / 60;
    const x = WIRE.x0 + (WIRE.x1 - WIRE.x0) * u;
    const env = Math.sin(Math.PI * u);
    return `${x.toFixed(1)},${(WIRE.y + sag * env + twang * env * Math.sin(Math.PI * u * 2 + 0.3) * 0.5 + twang * env * 0.5).toFixed(1)}`;
  }).join(" ");

  // ── the card: unfolds from the wire, spins on it ──
  const unfold = Easing.out(Easing.back(1.2))(kf(ms, tCard, 520));
  const spinU = kf(ms, tFlip, 1000);
  const spin = 180 * Easing.out(Easing.back(1.25))(spinU);
  const showBack = spin > 90;
  const open = EASE(kf(ms, tAllow, 700));
  const walk = ms > tAllow + 300 ? ms - tAllow - 300 : 0;
  const fog = kf(ms, tFog, 900);

  const lab = (o: number): React.CSSProperties => ({ fontFamily: SANS, fontWeight: 700, fontSize: TYPE.label, letterSpacing: TRACK.nav, color: gray, opacity: o });
  const cardLeft = (W - CARD.w) / 2;
  const cardTop = WIRE.y - CARD.h / 2;

  const leadOut = 1 - kf(ms, tCard - 200, 300);
  const backLeadIn = kf(ms, tBackLead - 100, 200);

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {/* narration band */}
      <div style={{ position: "absolute", left: 96, right: 96, top: 90 }}>
        <div style={{ position: "absolute", left: 0, right: 0, opacity: leadOut }}>
          <FlowLine from={from} to={tMonth} line={lead.line} size={72} color={white} restColor={INK_SUB} restWeight={400} emphasize="tension." empColor={white} />
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, opacity: backLeadIn }}>
          <FlowLine from={tBackLead - 100} to={to} line={back.lead} size={56} color={white} restColor={INK_SUB} restWeight={400} emphasize="same design choice" empColor={white} />
        </div>
      </div>

      {/* the wire + pegs */}
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <polyline points={wirePts} fill="none" stroke={white} strokeWidth={5} opacity={wireOn} strokeDasharray={`${2000 * wireOn} 4000`} />
        {[WIRE.x0, WIRE.x1].map((x, i) => <rect key={i} x={x - 14} y={WIRE.y - 14} width={28} height={28} fill={white} opacity={wireOn} />)}
      </svg>

      {/* the card */}
      {unfold > 0 ? (
        <div style={{ position: "absolute", left: cardLeft, top: cardTop, width: CARD.w, height: CARD.h, perspective: 2200 }}>
          <div style={{ position: "absolute", inset: 0, transformStyle: "preserve-3d", transform: `rotateX(${spin}deg) scaleY(${unfold})` }}>
            {/* FRONT — the praise */}
            <div style={{ position: "absolute", inset: 0, background: white, backfaceVisibility: "hidden", visibility: showBack ? "hidden" : "visible" }}>
              <div style={{ position: "absolute", left: 60, top: 54, padding: "8px 20px", background: ink, color: white, fontFamily: SANS, fontWeight: 700, fontSize: 34, letterSpacing: TRACK.nav, opacity: kf(ms, tMonth, 180) }}>{front.month}</div>
              <div style={{ position: "absolute", left: 60, top: 130, width: 700, fontFamily: DISPLAY, fontWeight: 700, fontSize: 50, lineHeight: 1.05, letterSpacing: TRACK.headline, color: ink, opacity: kf(ms, tSrc, 220), transform: `translateY(${(1 - kf(ms, tSrc, 220)) * 16}px)` }}>{front.source}</div>
              <div style={{ position: "absolute", left: 60, top: 250, ...lab(kf(ms, tRole, 240)) }}>{front.role}</div>
              <div style={{ position: "absolute", left: 60, top: 318, width: 720 }}>
                <FlowLine from={tPraise - 50} to={to} line={front.praise} size={50} color={ink} restColor={inkA(0.55)} restWeight={400} emphasize={front.emphasize} empColor={ink} underline={acc} lineHeight={1.16} />
              </div>
              <svg width={CARD.w} height={CARD.h} style={{ position: "absolute", inset: 0 }} opacity={kf(ms, tRole, 400)}>
                <Gate open={open} walkMs={walk} color={ink} dot={acc} />
              </svg>
            </div>
            {/* BACK — the same choice, the other reading */}
            <div style={{ position: "absolute", inset: 0, background: white, backfaceVisibility: "hidden", transform: "rotateX(180deg)", visibility: showBack ? "visible" : "hidden" }}>
              <div style={{ position: "absolute", left: 60, top: 70, ...lab(kf(ms, tSays, 240)) }}>{back.says}</div>
              <div style={{ position: "absolute", left: 60, top: 118, width: 660 }}>
                <FlowLine from={tLine - 50} to={to} line={back.line} size={88} color={ink} emphasize={back.emphasize} empColor={acc} lineHeight={1.02} />
              </div>
              <svg width={CARD.w} height={CARD.h} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
                <defs>
                  <filter id="fog-blur" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation={18} /></filter>
                  <filter id="curve-blur"><feGaussianBlur stdDeviation={fog * 7} /></filter>
                </defs>
                {/* a small survival picture beside the gate */}
                <g filter="url(#curve-blur)" fill="none">
                  <line x1={760} x2={760} y1={90} y2={330} stroke={ink} strokeWidth={4} />
                  <line x1={760} x2={1060} y1={330} y2={330} stroke={ink} strokeWidth={4} />
                  <path d="M 760 100 H 810 V 150 H 860 V 205 H 920 V 245 H 990 V 275 H 1060" stroke={inkA(0.45)} strokeWidth={6} />
                  <path d="M 760 100 H 800 V 160 H 850 V 200 H 930 V 250 H 980 V 268 H 1060" stroke={acc} strokeWidth={6} />
                </g>
                <text x={760} y={78} fontFamily={SANS} fontWeight={700} fontSize={TYPE.labelSm} letterSpacing="-0.035em" fill={gray}>{back.chartLabel}</text>
                {/* fog */}
                {fog > 0
                  ? Array.from({ length: 16 }, (_, i) => {
                      const t = (ms - tFog) / 1000;
                      const x = 740 + hash(i) * 340 + Math.sin(t * 0.8 + i) * 26 + t * 18 * (hash(i + 3) - 0.5);
                      const y = 110 + hash(i + 11) * 220 + Math.cos(t * 0.6 + i * 1.7) * 14;
                      const r = 46 + hash(i + 5) * 44;
                      const o = clamp01(fog * 1.4 - (i / 16) * 0.4) * 0.5;
                      return <circle key={i} cx={x} cy={y} r={r * (0.6 + 0.4 * fog)} fill={inkA(0.55)} opacity={o} filter="url(#fog-blur)" />;
                    })
                  : null}
                <Gate open={1} walkMs={walk} color={ink} dot={acc} />
              </svg>
            </div>
          </div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
