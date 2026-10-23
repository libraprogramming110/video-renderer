// ─────────────────────────────────────────────────────────────────────────
// KIT · finale — "SIGNAL OVER NOISE", PERFORMED. Added on the Lilly Onswik
// long-form, 2026-09-26.
//
// The end card for a brand whose sign-off is literally "signal over noise".
// Everything a CTA needs (lockup on the spoken brand, the closing line flowing
// verbatim, a full-width button on "Subscribe", the URL in the pause) — over a
// field of drifting NOISE: faint white particles, wandering, twinkling, from the
// moment the card opens. On "Signal" most of them RUSH together into a single
// line that carries one pulse (the signal), a bright packet then travels along
// it on a loop; the rest stay behind, dimmer, underneath it. On "noise." the
// line wins: the stragglers sink. The sign-off stamps under the line.
//
// Deterministic: positions and wander are hashes of the index + smooth sines of
// time, never Math.random(). Red world only (white marks, white button).
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, interpolate, Easing } from "remotion";
import { CLAMP, clamp01, COLORS, cue, cueSeq, DISPLAY, SANS, TRACK, useMs, useInkSub } from "./core";
import { Wordmark } from "./ui";

const EASE = Easing.out(Easing.cubic);
const EASE_IO = Easing.inOut(Easing.cubic);
type Win = { from: number; to: number };
type Cued = { word?: string; ms?: number };

const useVis = (from: number, to: number, padIn = 300, padOut = 360) => {
  const ms = useMs();
  return clamp01(interpolate(ms, [from, from + padIn, to - padOut, to], [0, 1, 1, 0], CLAMP));
};
const hash = (i: number) => {
  const s = Math.sin(i * 91.3458 + 17.17) * 47453.5453;
  return s - Math.floor(s);
};

const F = { top: 690, bottom: 1110, lineY: 900, left: 90, right: 990, N: 720, keep: 0.72 };
// the signal: flat, then one pulse at the centre (a spike, not a sine: a signal, not a wave)
const WAVE: [number, number][] = [[F.left, 0], [468, 0], [500, 34], [532, -178], [560, 70], [590, 0], [F.right, 0]];
const waveY = (x: number) => {
  for (let i = 1; i < WAVE.length; i++) {
    const [x0, y0] = WAVE[i - 1], [x1, y1] = WAVE[i];
    if (x <= x1) return F.lineY + y0 + ((x - x0) / (x1 - x0)) * (y1 - y0);
  }
  return F.lineY;
};
const wavePath = WAVE.map(([x, y], i) => `${i ? "L" : "M"} ${x} ${F.lineY + y}`).join(" ");
const waveLen = WAVE.reduce((s, [x, y], i) => (i ? s + Math.hypot(x - WAVE[i - 1][0], y - WAVE[i - 1][1]) : 0), 0);

export const SignalCard: React.FC<Win & {
  /** VERBATIM: flows word by word; `emphasize` stays bold, the rest steps down */
  headline: { line: string; emphasize: string };
  logo: Cued;
  button: { label: string; tail: string; word?: string; ms?: number; tailWord?: string; tailMs?: number };
  link: { label: string; ms: number };
  signoff: { lead: string; rest: string; word?: string; ms?: number; noiseWord?: string; noiseMs?: number };
}> = ({ from, to, headline, logo, button, link, signoff }) => {
  const ms = useMs();
  const sub = useInkSub();
  const vis = useVis(from, to, 300, 60);
  const k = (a: number, d: number) => clamp01(interpolate(ms, [a, a + d], [0, 1], CLAMP));

  const toks = headline.line.split(" ");
  const emp = new Set<number>();
  {
    const e = headline.emphasize.split(" ");
    for (let i = 0; i + e.length <= toks.length; i++) if (e.every((w, j) => toks[i + j] === w)) { e.forEach((_, j) => emp.add(i + j)); break; }
  }
  const onsets = cueSeq(toks, from, to);
  const tHead = onsets[0] ?? from + 400;
  const tLogo = Math.max(tHead, logo.ms ?? cue(logo.word, tHead + 1200, from));
  const tBtn = Math.max(tLogo + 300, button.ms ?? cue(button.word, tLogo + 1200, from));
  const tBtnTail = Math.max(tBtn + 200, button.tailMs ?? cue(button.tailWord, tBtn + 600, from));
  const tLink = Math.max(tBtnTail + 200, link.ms);
  const tSig = Math.max(tLink + 200, signoff.ms ?? cue(signoff.word, tLink + 700, from));
  const tNoise = Math.max(tSig + 400, signoff.noiseMs ?? cue(signoff.noiseWord, tSig + 1100, tSig));
  const restOn = cueSeq(signoff.rest.split(" "), tSig + 1, to);

  // ── the field ──
  const t = ms / 1000;
  const fieldIn = k(from + 150, 900);
  const CONV = 720;
  const lineP = EASE(k(tSig + 380, 520)); // the line solidifies as the particles arrive
  const sink = EASE(k(tNoise, 900));
  const dots: React.ReactNode[] = [];
  for (let i = 0; i < F.N; i++) {
    const h1 = hash(i), h2 = hash(i + 311), h3 = hash(i + 877);
    const bx = F.left + h1 * (F.right - F.left);
    const by = F.top + h2 * (F.bottom - F.top);
    const wx = bx + 16 * Math.sin(t * (0.9 + h3) + h1 * 6.283);
    const wy = by + 12 * Math.cos(t * (1.1 + h1) + h2 * 6.283);
    const joins = h3 < F.keep;
    const tw = 0.18 + 0.32 * (0.5 + 0.5 * Math.sin(t * (2 + h2 * 3) + h3 * 6.283));
    if (joins) {
      const d = EASE_IO(clamp01((ms - tSig - h2 * 260) / CONV));
      const tx = F.left + h1 * (F.right - F.left);
      const x = interpolate(d, [0, 1], [wx, tx]);
      const y = interpolate(d, [0, 1], [wy, waveY(tx)]);
      const op = interpolate(d, [0, 1], [tw, 0.95]) * (1 - lineP * 0.85);
      dots.push(<circle key={i} cx={x} cy={y} r={interpolate(d, [0, 1], [3.2, 4])} fill={COLORS.paper} opacity={op * fieldIn} />);
    } else {
      // the noise that stays: dimmer once the signal forms, and sinking on "noise."
      const dim = 1 - 0.55 * k(tSig, 600);
      dots.push(<circle key={i} cx={wx} cy={wy + sink * (120 + h1 * 160)} r={3} fill={COLORS.paper} opacity={tw * dim * (1 - sink) * fieldIn} />);
    }
  }
  // the packet: a bright segment travelling along the signal, looping
  const packetOn = k(tSig + 900, 300);
  const loop = ((ms - (tSig + 900)) / 1400) % 1;
  const seg = 120;
  const off = -loop * (waveLen + seg) + seg;

  // ── type ──
  const logoP = { o: k(tLogo, 200), s: interpolate(ms, [tLogo, tLogo + 320], [0.9, 1], { ...CLAMP, easing: EASE }) };
  const btn = { o: k(tBtn, 160), s: interpolate(ms, [tBtn, tBtn + 320], [1.12, 1], { ...CLAMP, easing: EASE }) };
  const btnTail = k(tBtnTail, 200);
  const linkP = k(tLink, 260);
  const sig = { o: k(tSig, 140), s: interpolate(ms, [tSig, tSig + 320], [1.25, 1], { ...CLAMP, easing: EASE }) };

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {/* the lockup, on the spoken brand */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 196, display: "flex", justifyContent: "center", opacity: logoP.o, transform: `scale(${logoP.s})` }}>
        <Wordmark size={100} mark="wordmark" tone="white" />
      </div>

      {/* the closing line, verbatim */}
      <div style={{ position: "absolute", left: 90, right: 90, top: 380, display: "flex", flexWrap: "wrap", justifyContent: "center" }}>
        {toks.map((w, i) => {
          const p = k(onsets[i] ?? tHead + i * 180, 130);
          const e = emp.has(i);
          return (
            <span key={i} style={{ fontFamily: DISPLAY, fontWeight: e ? 700 : 400, fontSize: 70, letterSpacing: TRACK.display, lineHeight: 1.2, color: e ? COLORS.paper : sub, marginRight: "0.24em", opacity: p, transform: `translateY(${(1 - p) * 12}px)` }}>{w}</span>
          );
        })}
      </div>

      {/* noise → signal */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {dots}
        {lineP > 0 ? <path d={wavePath} fill="none" stroke={COLORS.paper} strokeWidth={7} strokeLinejoin="round" strokeLinecap="round" opacity={lineP} /> : null}
        {packetOn > 0 ? (
          <path d={wavePath} fill="none" stroke={COLORS.paper} strokeWidth={16} strokeLinejoin="round" strokeLinecap="round"
            strokeDasharray={`${seg} ${waveLen + seg}`} strokeDashoffset={off} opacity={packetOn * 0.9}
            style={{ filter: "drop-shadow(0 0 10px rgba(255,255,255,0.9))" }} />
        ) : null}
      </svg>

      {/* the sign-off, under the line */}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1002, display: "flex", justifyContent: "center", alignItems: "baseline", gap: 22 }}>
        <span style={{ display: "inline-block", fontFamily: DISPLAY, fontWeight: 700, fontSize: 88, letterSpacing: TRACK.display, color: COLORS.paper, opacity: sig.o, transform: `scale(${sig.s})` }}>{signoff.lead}</span>
        {signoff.rest.split(" ").map((w, i) => {
          const p = k(restOn[i] ?? tSig + 800 + i * 350, 130);
          return <span key={i} style={{ fontFamily: DISPLAY, fontWeight: 400, fontSize: 88, letterSpacing: TRACK.display, color: sub, opacity: p, transform: `translateY(${(1 - p) * 10}px)` }}>{w}</span>;
        })}
      </div>

      {/* the button + the URL */}
      <div style={{ position: "absolute", left: 90, right: 90, top: 1190, height: 128, background: COLORS.paper, display: "flex", alignItems: "center", justifyContent: "center", opacity: btn.o, transform: `scale(${btn.s})` }}>
        <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 56, letterSpacing: TRACK.headline, color: COLORS.accent }}>{button.label}</span>
        <span style={{ fontFamily: DISPLAY, fontWeight: 400, fontSize: 56, letterSpacing: TRACK.headline, color: COLORS.accent, marginLeft: "0.28em", opacity: btnTail }}>{button.tail}</span>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1350, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: 44, letterSpacing: TRACK.nav, color: sub, opacity: linkP }}>{link.label}</div>
    </AbsoluteFill>
  );
};
