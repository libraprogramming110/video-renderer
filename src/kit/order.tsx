// ─────────────────────────────────────────────────────────────────────────
// KIT · order — WHAT TO WATCH + the horizontal end card. Added on the Compass/
// tovecimig long-form, 2026-09-26. HORIZONTAL.
//
// DominoOrder (white card) — "the signal is procedural, and it comes in order.
// First, whether X. Then, whether Y. Each step tells you how firmly the agency
// holds the <line> when <condition>."
//   Two DASHED dominoes (dashed = not happened yet) stand on a floor, numbered
//   in red (the P4 list numerals). Each ROCKS on its "whether" verb — undecided.
//   A solid wall stands at the end of the row: the survival line, with a DOOR
//   built into its foot. On "Each step" the chain runs as a what-if: domino 1
//   topples into domino 2, which topples onto the wall, and the wall BOWS under
//   the load and springs back (damped): how firmly it holds is shown as flex.
//   On "holds" the chain presses again and it bows and holds; on "crossover"
//   the door in the wall swings open (the §3/§4 gate, called back).
//
// SignalCardH — the brand end card (kit/finale.tsx's SignalCard) laid out for
// 16:9: lockup, the closing line verbatim, the button + URL in a left column;
// the NOISE field on the right, rushing into one pulse line on "Signal", the
// stragglers sinking on "noise.". Red world.
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, interpolate, Easing } from "remotion";
import { CLAMP, clamp01, COLORS, cue, cueSeq, DISPLAY, SANS, TRACK, useMs, useAccent, useInkSub, inkA } from "./core";
import { FlowLine } from "./flowline";
import { Wordmark } from "./ui";
import { TYPE } from "../style";

const EASE = Easing.out(Easing.cubic);
const EASE_IN = Easing.in(Easing.quad);
const EASE_IO = Easing.inOut(Easing.cubic);
const W = 1920;
const H = 1080;
type Cue = { word?: string; ms?: number };
const at = (c: Cue | undefined, fb: number, after: number) => c?.ms ?? cue(c?.word, fb, after);
const kf = (ms: number, a: number, d: number) => clamp01(interpolate(ms, [a, a + d], [0, 1], CLAMP));
const hash = (i: number) => {
  const s = Math.sin(i * 91.3458 + 17.17) * 47453.5453;
  return s - Math.floor(s);
};

// ══════════════════════════════════════════════════════════════════════════
export const DominoOrder: React.FC<{
  from: number;
  to: number;
  lines: { line: string; emphasize?: string; word?: string; ms?: number }[];
  appear: Cue;
  steps: { num: string; label: string; sub?: string; word?: string; ms?: number; rockWord?: string; rockMs?: number; subWord?: string; subMs?: number }[];
  wall: { label: string; sub: string; door: string; word?: string; ms?: number; holdWord?: string; holdMs?: number; doorWord?: string; doorMs?: number };
  chain: Cue;
}> = ({ from, to, lines, appear, steps, wall, chain }) => {
  const ms = useMs();
  const acc = useAccent();
  const ink = COLORS.ink;
  const gray = COLORS.grayText;
  const vis = clamp01(interpolate(ms, [from, from + 300, to - 360, to], [0, 1, 1, 0], CLAMP));

  const tl = lines.map((l, i) => at(l, from + 400 + i * 4000, from));
  const tApp = at(appear, from + 2400, from);
  const tS = steps.map((s, i) => Math.max(tApp + 500 + i * 1500, at(s, tApp + 1200 + i * 5000, tApp)));
  const tRock = steps.map((s, i) => Math.max(tS[i] + 300, s.rockMs ?? cue(s.rockWord, tS[i] + 2000, tS[i])));
  const tSub = steps.map((s, i) => Math.max(tRock[i] + 200, s.subMs ?? cue(s.subWord, tRock[i] + 500, tS[i])));
  const tWall = at(wall, tApp + 300, from);
  const tChain = Math.max(tSub[steps.length - 1] + 800, at(chain, tSub[steps.length - 1] + 1500, tS[steps.length - 1]));
  const tHold = Math.max(tChain + 1500, wall.holdMs ?? cue(wall.holdWord, tChain + 2200, tChain));
  const tDoor = Math.max(tHold + 800, wall.doorMs ?? cue(wall.doorWord, tHold + 2000, tHold));

  const FLOOR = 780;
  const DW = 150;
  const DH = 360;
  const CX = [560, 900];
  const WALL = { x: 1165, w: 40, top: 300 };
  const LEAN = (Math.asin((CX[1] - CX[0] - DW) / DH) * 180) / Math.PI; // ~32°: the angle a toppled domino rests at

  // the chain: domino 1 falls (gravity-ish, accelerating) onto 2, 2 onto the wall
  const f1 = EASE_IN(kf(ms, tChain, 380));
  const f2 = EASE_IN(kf(ms, tChain + 330, 380));
  const press = EASE(kf(ms, tHold, 260)) * (1 - 0.3 * kf(ms, tHold + 900, 600)); // "holds": pushed harder, eases
  const a2 = LEAN * f2 + 4 * press;
  const a1 = LEAN * f1 + 0.5 * a2 * f2;
  const rock = (i: number) => {
    const s = (ms - tRock[i]) / 1000;
    return s > 0 ? 7 * Math.exp(-3.5 * s) * Math.sin(9 * s) : 0;
  };
  const ang = [a1 + (f1 > 0 ? 0 : rock(0)), a2 + (f2 > 0 ? 0 : rock(1))];

  // the wall bows under the load (damped), and again, deeper, on "holds"
  const sHit = (ms - tChain - 710) / 1000;
  const sHold = (ms - tHold - 120) / 1000;
  const bow = (sHit > 0 ? 34 * Math.exp(-4.2 * sHit) * Math.cos(11 * sHit) + 10 * (1 - Math.exp(-4 * sHit)) : 0) + (sHold > 0 ? 44 * Math.exp(-3.4 * sHold) * Math.cos(9.5 * sHold) + 8 * (1 - Math.exp(-4 * sHold)) : 0);
  const wallP = EASE(kf(ms, tWall, 600));
  const wallTop = FLOOR - (FLOOR - WALL.top) * wallP;
  const contactY = FLOOR - DH * Math.cos((LEAN * Math.PI) / 180); // where domino 2's top meets the wall
  const door = EASE(kf(ms, tDoor, 700));

  const lineO = (i: number) => kf(ms, tl[i] - 100, 200) * (i < lines.length - 1 ? 1 - kf(ms, tl[i + 1] - 300, 250) : 1);

  const wallPath = () => {
    const x0 = WALL.x;
    const x1 = WALL.x + WALL.w;
    const cy = contactY;
    // left and right edges bow right at the contact height (quadratic through it)
    const L = `M ${x0} ${FLOOR} Q ${x0 + bow * 2} ${cy} ${x0} ${wallTop}`;
    const R = `L ${x1} ${wallTop} Q ${x1 + bow * 2} ${cy} ${x1} ${FLOOR} Z`;
    return `${L} ${R}`;
  };

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {/* narration band */}
      <div style={{ position: "absolute", left: 110, right: 110, top: 92 }}>
        {lines.map((l, i) => (
          <div key={i} style={{ position: "absolute", left: 0, right: 0, opacity: lineO(i) }}>
            <FlowLine from={tl[i] - 100} to={i < lines.length - 1 ? tl[i + 1] : to} line={l.line} size={54} color={ink} restColor={inkA(0.55)} restWeight={400} emphasize={l.emphasize} empColor={ink} lineHeight={1.12} />
          </div>
        ))}
      </div>

      <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <line x1={300} x2={1640} y1={FLOOR} y2={FLOOR} stroke={ink} strokeWidth={4} opacity={0.5 * kf(ms, from + 200, 500)} />

        {/* the wall — the survival line — with a door in its foot */}
        {wallP > 0 ? (
          <g>
            <defs>
              <clipPath id="door-cut"><rect x={0} y={0} width={W} height={FLOOR - 170} /><rect x={WALL.x + WALL.w + 60} y={0} width={W} height={H} /><rect x={0} y={0} width={WALL.x - 60} height={H} /></clipPath>
            </defs>
            <path d={wallPath()} fill={ink} clipPath={door > 0 ? "url(#door-cut)" : undefined} />
            {door > 0 ? (
              <g>
                {/* the door panel swinging out on its hinge (the wall's right edge) */}
                <rect x={WALL.x + WALL.w - (WALL.w + 2) * Math.cos((door * Math.PI) / 2.3)} y={FLOOR - 166} width={(WALL.w + 2) * Math.cos((door * Math.PI) / 2.3) + 70 * Math.sin((door * Math.PI) / 2.3)} height={166} fill={ink} opacity={0.9} />
                <rect x={WALL.x} y={FLOOR - 170} width={WALL.w} height={4} fill={ink} />
              </g>
            ) : null}
          </g>
        ) : null}

        {/* the dominoes: dashed, rotating about their bottom-right corner */}
        {steps.map((s, i) => {
          const on = kf(ms, tApp + i * 250, 260);
          if (on <= 0) return null;
          const px = CX[i] + DW / 2;
          return (
            <g key={i} opacity={on} transform={`rotate(${ang[i]} ${px} ${FLOOR})`}>
              <rect x={CX[i] - DW / 2} y={FLOOR - DH} width={DW} height={DH} fill="none" stroke={ink} strokeWidth={5} strokeDasharray="16 11" />
              <line x1={CX[i] - DW / 2 + 16} x2={CX[i] + DW / 2 - 16} y1={FLOOR - DH / 2} y2={FLOOR - DH / 2} stroke={ink} strokeWidth={4} strokeDasharray="8 8" opacity={0.6} />
            </g>
          );
        })}
      </svg>

      {/* numerals + labels */}
      {steps.map((s, i) => {
        const p = kf(ms, tS[i], 160);
        const sc = interpolate(ms, [tS[i], tS[i] + 300], [1.3, 1], { ...CLAMP, easing: EASE });
        return (
          <React.Fragment key={i}>
            <div style={{ position: "absolute", left: CX[i] - 150, width: 300, top: 330, textAlign: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: 64, letterSpacing: TRACK.display, color: acc, opacity: p * (1 - kf(ms, tChain, 300)), transform: `scale(${sc})` }}>{s.num}</div>
            <div style={{ position: "absolute", left: CX[i] - 170, width: 340, top: FLOOR + 18, textAlign: "center" }}>
              <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 36, lineHeight: 1.08, letterSpacing: TRACK.headline, color: ink, opacity: kf(ms, tRock[i], 220) }}>{s.label}</div>
              {s.sub ? <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: TYPE.label, letterSpacing: TRACK.nav, color: gray, marginTop: 8, opacity: kf(ms, tSub[i], 220) }}>{s.sub}</div> : null}
            </div>
          </React.Fragment>
        );
      })}
      <div style={{ position: "absolute", left: WALL.x + 80, top: 330, width: 520, opacity: wallP }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 56, letterSpacing: TRACK.headline, color: ink, lineHeight: 1 }}>{wall.label}</div>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: TYPE.label, letterSpacing: TRACK.nav, color: gray, marginTop: 12 }}>{wall.sub}</div>
      </div>
      <div style={{ position: "absolute", left: WALL.x + 140, top: FLOOR - 120, fontFamily: DISPLAY, fontWeight: 700, fontSize: 40, letterSpacing: TRACK.headline, color: ink, opacity: kf(ms, tDoor, 300) }}>{wall.door}</div>
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
const F = { top: 250, bottom: 830, lineY: 560, left: 1010, right: 1820, N: 760, keep: 0.72 };
const WAVE: [number, number][] = [[F.left, 0], [1340, 0], [1372, 38], [1408, -190], [1440, 76], [1474, 0], [F.right, 0]];
const waveY = (x: number) => {
  for (let i = 1; i < WAVE.length; i++) {
    const [x0, y0] = WAVE[i - 1], [x1, y1] = WAVE[i];
    if (x <= x1) return F.lineY + y0 + ((x - x0) / (x1 - x0)) * (y1 - y0);
  }
  return F.lineY;
};
const wavePath = WAVE.map(([x, y], i) => `${i ? "L" : "M"} ${x} ${F.lineY + y}`).join(" ");
const waveLen = WAVE.reduce((s, [x, y], i) => (i ? s + Math.hypot(x - WAVE[i - 1][0], y - WAVE[i - 1][1]) : 0), 0);

export const SignalCardH: React.FC<{
  from: number;
  to: number;
  headline: { line: string; emphasize: string };
  logo: Cue;
  button: { label: string; tail: string; word?: string; ms?: number; tailWord?: string; tailMs?: number };
  link: { label: string; word?: string; ms?: number };
  signoff: { lead: string; rest: string; word?: string; ms?: number; noiseWord?: string; noiseMs?: number };
}> = ({ from, to, headline, logo, button, link, signoff }) => {
  const ms = useMs();
  const sub = useInkSub();
  const vis = clamp01(interpolate(ms, [from, from + 300, to - 60, to], [0, 1, 1, 0], CLAMP));
  const k = (a: number, d: number) => clamp01(interpolate(ms, [a, a + d], [0, 1], CLAMP));

  const tHead = cue(headline.line.split(" ").slice(0, 2).join(" "), from + 400, from);
  const tLogo = Math.max(tHead, logo.ms ?? cue(logo.word, tHead + 1200, from));
  const tBtn = Math.max(tLogo + 300, button.ms ?? cue(button.word, tLogo + 1200, from));
  const tBtnTail = Math.max(tBtn + 200, button.tailMs ?? cue(button.tailWord, tBtn + 600, from));
  const tLink = Math.max(tBtnTail + 200, link.ms ?? cue(link.word, tBtnTail + 600, tBtnTail));
  const tSig = Math.max(tLink + 200, signoff.ms ?? cue(signoff.word, tLink + 700, tLink));
  const tNoise = Math.max(tSig + 400, signoff.noiseMs ?? cue(signoff.noiseWord, tSig + 1100, tSig));
  const restOn = cueSeq(signoff.rest.split(" "), tSig + 1, to);

  const t = ms / 1000;
  const fieldIn = k(from + 150, 900);
  const CONV = 720;
  const lineP = EASE(k(tSig + 380, 520));
  const sink = EASE(k(tNoise, 900));
  const dots: React.ReactNode[] = [];
  for (let i = 0; i < F.N; i++) {
    const h1 = hash(i), h2 = hash(i + 311), h3 = hash(i + 877);
    const bx = F.left + h1 * (F.right - F.left);
    const by = F.top + h2 * (F.bottom - F.top);
    const wx = bx + 16 * Math.sin(t * (0.9 + h3) + h1 * 6.283);
    const wy = by + 12 * Math.cos(t * (1.1 + h1) + h2 * 6.283);
    const tw = 0.18 + 0.32 * (0.5 + 0.5 * Math.sin(t * (2 + h2 * 3) + h3 * 6.283));
    if (h3 < F.keep) {
      const d = EASE_IO(clamp01((ms - tSig - h2 * 260) / CONV));
      const x = interpolate(d, [0, 1], [wx, bx]);
      const y = interpolate(d, [0, 1], [wy, waveY(bx)]);
      const op = interpolate(d, [0, 1], [tw, 0.95]) * (1 - lineP * 0.85);
      dots.push(<circle key={i} cx={x} cy={y} r={interpolate(d, [0, 1], [3.2, 4])} fill={COLORS.paper} opacity={op * fieldIn} />);
    } else {
      const dim = 1 - 0.55 * k(tSig, 600);
      dots.push(<circle key={i} cx={wx} cy={wy + sink * (120 + h1 * 160)} r={3} fill={COLORS.paper} opacity={tw * dim * (1 - sink) * fieldIn} />);
    }
  }
  const packetOn = k(tSig + 900, 300);
  const loop = (((ms - (tSig + 900)) / 1400) % 1 + 1) % 1;
  const seg = 120;
  const off = -loop * (waveLen + seg) + seg;

  const logoP = { o: k(tLogo, 200), s: interpolate(ms, [tLogo, tLogo + 320], [0.9, 1], { ...CLAMP, easing: EASE }) };
  const btn = { o: k(tBtn, 160), s: interpolate(ms, [tBtn, tBtn + 320], [1.12, 1], { ...CLAMP, easing: EASE }) };
  const sig = { o: k(tSig, 140), s: interpolate(ms, [tSig, tSig + 320], [1.25, 1], { ...CLAMP, easing: EASE }) };

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <div style={{ position: "absolute", left: 110, top: 150, opacity: logoP.o, transform: `scale(${logoP.s})`, transformOrigin: "left center" }}>
        <Wordmark size={96} mark="wordmark" tone="white" />
      </div>
      <div style={{ position: "absolute", left: 110, top: 310, width: 800 }}>
        <FlowLine from={from} to={to} line={headline.line} size={60} color={COLORS.paper} restColor={sub} restWeight={400} emphasize={headline.emphasize} empColor={COLORS.paper} lineHeight={1.16} />
      </div>
      <div style={{ position: "absolute", left: 110, width: 800, top: 640, height: 116, background: COLORS.paper, display: "flex", alignItems: "center", justifyContent: "center", opacity: btn.o, transform: `scale(${btn.s})` }}>
        <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 54, letterSpacing: TRACK.headline, color: COLORS.accent }}>{button.label}</span>
        <span style={{ fontFamily: DISPLAY, fontWeight: 400, fontSize: 54, letterSpacing: TRACK.headline, color: COLORS.accent, marginLeft: "0.28em", opacity: k(tBtnTail, 200) }}>{button.tail}</span>
      </div>
      <div style={{ position: "absolute", left: 110, width: 800, top: 780, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: 42, letterSpacing: TRACK.nav, color: sub, opacity: k(tLink, 260) }}>{link.label}</div>

      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {dots}
        {lineP > 0 ? <path d={wavePath} fill="none" stroke={COLORS.paper} strokeWidth={7} strokeLinejoin="round" strokeLinecap="round" opacity={lineP} /> : null}
        {packetOn > 0 ? (
          <path d={wavePath} fill="none" stroke={COLORS.paper} strokeWidth={16} strokeLinejoin="round" strokeLinecap="round" strokeDasharray={`${seg} ${waveLen + seg}`} strokeDashoffset={off} opacity={packetOn * 0.9} />
        ) : null}
      </svg>
      <div style={{ position: "absolute", left: F.left, right: W - F.right, top: 700, display: "flex", justifyContent: "center", alignItems: "baseline", gap: 22 }}>
        <span style={{ display: "inline-block", fontFamily: DISPLAY, fontWeight: 700, fontSize: 96, letterSpacing: TRACK.display, color: COLORS.paper, opacity: sig.o, transform: `scale(${sig.s})` }}>{signoff.lead}</span>
        {signoff.rest.split(" ").map((w, i) => {
          const p = k(restOn[i] ?? tSig + 800 + i * 350, 130);
          return <span key={i} style={{ fontFamily: DISPLAY, fontWeight: 400, fontSize: 96, letterSpacing: TRACK.display, color: sub, opacity: p, transform: `translateY(${(1 - p) * 10}px)` }}>{w}</span>;
        })}
      </div>
    </AbsoluteFill>
  );
};
