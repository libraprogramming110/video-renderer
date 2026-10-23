// ─────────────────────────────────────────────────────────────────────────
// KIT · gate — "The signal to watch" for the Onswik horizontal long-form,
// 2026-09-27. 1920×1080. Two blocks:
//
//   StartGate  — ink. A crowd SIMULATION (deterministic): patients stream in on
//                nine lanes toward a gate labelled for the start of treatment and
//                pass into a pool. "Delays" drops a PORTCULLIS and each lane
//                QUEUES against it (a clock sweeps); "burden of daily injections"
//                drops a seven-mark WEIGHT onto the gate. "Weekly dosing" sheds six
//                marks (one red stays), the gate lifts and the queue FLOODS the pool
//                in order, which swells as it fills ("the category grows"). Then the
//                other future: the gate shuts, the pool greys ("existing daily
//                users"), converts in a wave into two halves, and on "share fight"
//                the border between them TUGS back and forth while the pool stays
//                the size it was.
//   LaunchDate — white card. "First marker": a date tile whose month and day REELS
//                spin like a slot machine on "date" and LOCK on "sets" into dashed
//                empty slots (dashed = not set yet); a red cursor blinks in the day.
// Every onset takes a cue word + an ms override.
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, interpolate, Easing } from "remotion";
import { CLAMP, clamp01, COLORS, cue, DISPLAY, SANS, TRACK, useMs, useAccent, INK_SUB, inkA } from "./core";
import { FlowLine } from "./flowline";
import { TYPE } from "../style";

const EASE = Easing.out(Easing.cubic);
const EASE_IN = Easing.in(Easing.cubic);
const EASE_IO = Easing.inOut(Easing.cubic);
const W = 1920;
const H = 1080;

type Win = { from: number; to: number };
type Cue = { word?: string; ms?: number };
type Sentence = { line: string; emphasize?: string } & Cue;
const at = (c: Cue | undefined, fb: number, after: number) => c?.ms ?? cue(c?.word, fb, after);
const kf = (ms: number, a: number, d: number) => clamp01(interpolate(ms, [a, a + d], [0, 1], CLAMP));
const damp = (s: number, k = 4.5, w = 9) => (s < 0 ? 0 : Math.exp(-k * s) * Math.cos(w * s));
const hash = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};
const lab = (color: string, size = TYPE.label): React.CSSProperties => ({ fontFamily: SANS, fontWeight: 700, fontSize: size, letterSpacing: TRACK.nav, color, whiteSpace: "nowrap" });
function chain<K extends string>(from: number, cues: Record<K, Cue>, order: [K, number][]) {
  const T = {} as Record<K, number>;
  let prev = from;
  for (const [k, fb] of order) {
    const t = Math.max(prev + 60, at(cues[k], prev + fb, prev));
    T[k] = t;
    prev = t;
  }
  return T;
}
const mixHex = (t: number, a: string, b: string) => {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ch = (p: number, s: number) => (p >> s) & 255;
  const m = (s: number) => Math.round(ch(pa, s) + (ch(pb, s) - ch(pa, s)) * clamp01(t));
  return `rgb(${m(16)},${m(8)},${m(0)})`;
};

// ══════════════════════════════════════════════════════════════════════════
// StartGate — ink
// ══════════════════════════════════════════════════════════════════════════
export const StartGate: React.FC<Win & {
  lines: [Sentence, Sentence, Sentence, Sentence];
  gateLabel: string;
  problems: [string, string];
  outcomes: [string, string];
  halves: [string, string]; // left, right
  cues: Record<"uptake" | "start" | "two" | "delays" | "burden" | "weekly" | "open" | "sooner" | "grows" | "stop" | "converts" | "daily" | "share" | "two2", Cue>;
}> = ({ from, to, lines, gateLabel, problems, outcomes, halves, cues }) => {
  const ms = useMs();
  const acc = useAccent();
  const white = COLORS.paper;
  const vis = clamp01(interpolate(ms, [from, from + 1, to - 300, to], [0, 1, 1, 0], CLAMP));
  const T = chain(from, cues, [
    ["uptake", 1200], ["start", 800], ["two", 3000], ["delays", 1800], ["burden", 2100], ["weekly", 2200], ["open", 800],
    ["sooner", 2200], ["grows", 900], ["stop", 1700], ["converts", 600], ["daily", 1300], ["share", 2000], ["two2", 1100],
  ]);
  const tSec = ms / 1000;

  // ── geometry ──
  const GX = 760;
  const G0 = 440;
  const G1 = 860;
  const LANES = 9;
  const laneY = (l: number) => 470 + l * 44;
  const X0 = 40;
  const SPEED = 560; // px/s
  const travel = ((GX - 20 - X0) / SPEED) * 1000;
  const P = { cx: 1390, cy: 650, R: 228 };

  // ── the crowd, precomputed from the cue times (deterministic) ──
  const crowd = React.useMemo(() => {
    const e: number[] = [];
    const t0 = T.uptake - 1300;
    for (let t = t0; t < T.delays; t += 1000 / 6) e.push(t + hash(e.length) * 60);
    for (let t = T.delays; t < T.open + 1200; t += 1000 / 20) e.push(t + hash(e.length) * 30);
    const adm: number[] = [];
    let last = -Infinity;
    e.forEach((ei, i) => {
      const g = ei + travel;
      let a: number;
      if (g < T.delays) a = g;
      else a = Math.max(g, T.open, last + 1000 / 38);
      if (a > T.stop - 200) a = Infinity;
      adm.push(a);
      if (Number.isFinite(a)) last = a;
    });
    const nPool = adm.filter((a) => Number.isFinite(a)).length;
    return { e, adm, nPool };
  }, [T.uptake, T.delays, T.open, T.stop, travel]);

  const admitted = crowd.adm.filter((a) => a <= ms).length;
  const ringR = 26 + P.R * Math.sqrt(admitted / Math.max(1, crowd.nPool));
  const growPulse = ms > T.grows ? 14 * Math.max(0, damp((ms - T.grows) / 1000, 3, 8)) : 0;

  // ── the gate ──
  const closeA = EASE_IN(kf(ms, T.delays, 260));
  const openA = EASE(kf(ms, T.open, 500));
  const closeB = EASE_IN(kf(ms, T.stop, 300));
  const closed = ms < T.open ? closeA : ms < T.stop ? 1 - openA : closeB;
  const portBottom = G0 + closed * (G1 - G0);
  const sClose = (ms - T.delays - 260) / 1000;
  const gateThud = sClose > 0 && ms < T.open ? 5 * damp(sClose, 7, 26) : 0;

  // weight: seven marks drop onto the housing, six shed on "weekly"
  const HOUSE = { x: GX - 34, y: 336, w: 68, h: 104 };
  const wDrop = kf(ms, T.burden - 300, 300);
  const markW = 92;
  const markH = 12;
  const markGap = 4;

  // phase-2 (share fight)
  const greyU = kf(ms, T.stop + 200, 400);
  const bx = P.cx + (ms > T.share ? 70 * Math.sin(((ms - T.share) / 1000) * 5.2) * (0.6 + 0.4 * Math.sin(((ms - T.share) / 1000) * 1.7)) : 0);
  const border = kf(ms, T.converts, 400);

  // narration
  const starts = [at(lines[0], from + 300, from), at(lines[1], T.two - 1500, T.start), at(lines[2], T.weekly - 200, T.burden), T.stop - 20];
  const ends = [starts[1], starts[2], starts[3], to];

  const dots: React.ReactNode[] = [];
  const nE = crowd.e.length;
  const laneRank = new Array(LANES).fill(0);
  for (let i = 0; i < nE; i++) {
    const ei = crowd.e[i];
    if (ms < ei) break;
    const a = crowd.adm[i];
    const l = Math.floor(hash(i + 101) * LANES);
    const ly = laneY(l);
    if (ms < a) {
      // walking or queued
      const rank = laneRank[l]++;
      const slot = GX - 30 - rank * 30;
      const xFree = X0 + ((ms - ei) / 1000) * SPEED;
      const x = Math.min(xFree, slot);
      const waiting = xFree >= slot;
      const jig = waiting ? 1.5 * Math.sin(tSec * 6 + i) : 0;
      const stale = !Number.isFinite(a) && ms > T.stop ? 1 - 0.65 * kf(ms, T.stop + 300, 600) : 1;
      dots.push(<circle key={i} cx={x} cy={ly + jig} r={7} fill={white} opacity={0.9 * stale * kf(ms, ei, 200)} />);
    } else {
      // through the gate → pool slot (sunflower spiral, order = admission order)
      const k = i;
      const rr = P.R * Math.sqrt((k + 0.5) / crowd.nPool);
      const th = k * 2.399963;
      const sx = P.cx + rr * Math.cos(th);
      const sy = P.cy + rr * Math.sin(th);
      const u = EASE_IO(clamp01((ms - a) / 650));
      const x = GX + 24 + (sx - GX - 24) * u;
      const y = ly + (sy - ly) * u - Math.sin(Math.PI * u) * 60;
      const wob = u >= 1 ? 1.8 * Math.sin(tSec * 2 + k) : 0;
      // colour: white → grey (existing users) → converted by side of the border
      let col = white;
      if (greyU > 0) {
        const conv = kf(ms, T.converts + ((sx - (P.cx - P.R)) / (2 * P.R)) * 1100, 300);
        const side = sx > bx ? COLORS.accent : "#ffffff";
        col = conv > 0 ? mixHex(conv, "#6b6b6b", side) : mixHex(greyU, "#ffffff", "#6b6b6b");
      }
      dots.push(<circle key={i} cx={x + wob} cy={y} r={6.5} fill={col} />);
    }
  }

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {/* lanes */}
        {Array.from({ length: LANES }, (_, l) => (
          <line key={l} x1={X0} x2={GX - 20} y1={laneY(l)} y2={laneY(l)} stroke="rgba(255,255,255,0.07)" strokeWidth={2} opacity={kf(ms, from + 200 + l * 40, 400)} />
        ))}
        {/* pool ring */}
        {admitted > 0 ? (
          <circle cx={P.cx} cy={P.cy} r={ringR + growPulse} fill="rgba(255,255,255,0.04)" stroke={white} strokeWidth={3} opacity={0.6} strokeDasharray={ms > T.stop ? undefined : undefined} />
        ) : null}
        {/* the share-fight border */}
        {border > 0 ? (
          <line x1={bx} x2={bx} y1={P.cy - ringR - 20} y2={P.cy + ringR + 20} stroke={white} strokeWidth={4} opacity={border} />
        ) : null}
        {dots}
        {/* gate: posts, housing, portcullis */}
        <g transform={`translate(0 ${gateThud})`} opacity={kf(ms, from + 300, 500)}>
          <rect x={GX - 6} y={G1} width={12} height={20} fill={white} />
          <rect x={HOUSE.x} y={HOUSE.y} width={HOUSE.w} height={HOUSE.h} rx={8} fill={COLORS.inkSoft} stroke={white} strokeWidth={3} />
          {closed > 0.01 ? (
            <g>
              <rect x={GX - 18} y={G0} width={36} height={portBottom - G0} fill="rgba(0,0,0,0.6)" />
              {[-12, 0, 12].map((dx) => <line key={dx} x1={GX + dx} x2={GX + dx} y1={G0} y2={portBottom} stroke={white} strokeWidth={4} />)}
              {Array.from({ length: Math.floor((portBottom - G0) / 40) }, (_, j) => (
                <line key={j} x1={GX - 18} x2={GX + 18} y1={portBottom - 12 - j * 40} y2={portBottom - 12 - j * 40} stroke={white} strokeWidth={3} />
              ))}
              {[-12, 0, 12].map((dx) => <polygon key={dx} points={`${GX + dx - 5},${portBottom} ${GX + dx + 5},${portBottom} ${GX + dx},${portBottom + 12}`} fill={white} />)}
            </g>
          ) : null}
          <line x1={GX} x2={GX} y1={G0} y2={G1} stroke={white} strokeWidth={2} opacity={0.25} strokeDasharray="6 8" />
        </g>
        {/* the burden: seven marks */}
        {wDrop > 0
          ? Array.from({ length: 7 }, (_, j) => {
              const keep = j === 0; // bottom mark stays
              const yRest = HOUSE.y - (j + 1) * (markH + markGap);
              const drop = -(1 - wDrop * wDrop) * 400;
              const s = keep ? 0 : Math.max(0, (ms - (T.weekly + (j - 1) * 70)) / 1000);
              const fallY = 2400 * s * s;
              const fallX = (j % 2 ? 1 : -1) * 260 * s;
              const rot = (j % 2 ? 1 : -1) * 220 * s;
              const red = keep ? kf(ms, T.weekly, 250) : 0;
              const lift = keep ? -(1 - closed) * 0 : 0;
              const cx = GX + fallX;
              const cy = yRest + drop + fallY + lift + markH / 2;
              if (fallY > 900) return null;
              return <rect key={j} x={cx - markW / 2} y={cy - markH / 2} width={markW} height={markH} rx={4} fill={red > 0.5 ? acc : white} transform={`rotate(${rot} ${cx} ${cy})`} />;
            })
          : null}
        {/* the delay clock over the queue */}
        {ms > T.delays && ms < T.open + 400 ? (() => {
          const o = kf(ms, T.delays + 150, 250) * (1 - kf(ms, T.open, 350));
          const a = ((ms - T.delays) / 1000) * 5;
          return (
            <g opacity={o} transform="translate(470 392)">
              <circle r={30} fill="none" stroke={white} strokeWidth={4} />
              <line x1={0} y1={0} x2={Math.sin(a) * 22} y2={-Math.cos(a) * 22} stroke={white} strokeWidth={4} strokeLinecap="round" />
              <line x1={0} y1={0} x2={Math.sin(a / 12) * 14} y2={-Math.cos(a / 12) * 14} stroke={white} strokeWidth={5} strokeLinecap="round" />
            </g>
          );
        })() : null}
      </svg>

      {/* labels */}
      <div style={{ position: "absolute", left: GX - 220, width: 440, top: 896, textAlign: "center", opacity: kf(ms, T.start, 250), ...lab(white) }}>{gateLabel}</div>
      {problems.map((p, i) => {
        const t = i === 0 ? T.delays : T.burden;
        return (
          <div key={i} style={{ position: "absolute", left: 110, top: 256 + i * 52, display: "flex", alignItems: "center", gap: 14, opacity: kf(ms, T.two + i * 150, 250) * (1 - kf(ms, T.stop - 300, 300)) }}>
            <span style={{ width: 36, height: 36, borderRadius: 18, border: `3px solid ${white}`, display: "flex", alignItems: "center", justifyContent: "center", ...lab(white, 22) }}>{i + 1}</span>
            <span style={{ ...lab(white, 30), opacity: kf(ms, t, 250) }}>{p}</span>
          </div>
        );
      })}
      <div style={{ position: "absolute", left: P.cx - 300, width: 600, top: 336, textAlign: "center", opacity: kf(ms, T.grows, 250) * (1 - kf(ms, T.stop, 250)), ...lab(white, 40) }}>{outcomes[0]}</div>
      <div style={{ position: "absolute", left: P.cx - 300, width: 600, top: 336, textAlign: "center", opacity: kf(ms, T.share, 250), ...lab(acc, 40) }}>{outcomes[1]}</div>
      <div style={{ position: "absolute", left: P.cx - P.R - 260, width: 240, top: P.cy - 16, textAlign: "right", opacity: kf(ms, T.two2, 300), ...lab(white) }}>{halves[0]}</div>
      <div style={{ position: "absolute", left: P.cx + P.R + 30, width: 240, top: P.cy - 16, opacity: kf(ms, T.two2, 300), ...lab(acc) }}>{halves[1]}</div>

      {/* narration */}
      {lines.map((l, i) => (
        <div key={i} style={{ position: "absolute", left: 110, top: 90, width: 1700, opacity: kf(ms, starts[i] - 150, 200) * (1 - kf(ms, ends[i] - 220, 220)) }}>
          <FlowLine from={starts[i] - 60} to={ends[i]} line={l.line} size={48} color={white} restColor={INK_SUB} restWeight={400} emphasize={l.emphasize} empColor={white} lineHeight={1.12} />
        </div>
      ))}
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// LaunchDate — white card
// ══════════════════════════════════════════════════════════════════════════
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const LaunchDate: React.FC<Win & {
  head: Sentence;
  line: Sentence;
  label: string;
  cues: Record<"date" | "sets" | "launch", Cue>;
}> = ({ from, to, head, line, label, cues }) => {
  const ms = useMs();
  const acc = useAccent();
  const ink = COLORS.ink;
  const vis = clamp01(interpolate(ms, [from, from + 1, to - 360, to], [0, 1, 1, 0], CLAMP));
  const tHead = at(head, from + 500, from);
  const tLine = Math.max(tHead + 300, at(line, tHead + 1100, tHead));
  const T = chain(tLine, cues, [["date", 100], ["sets", 700], ["launch", 800]]);

  const tile = EASE(kf(ms, T.date - 150, 420));
  const tileS = interpolate(tile, [0, 1], [0.7, 1]);
  const lock = T.sets + 420;
  const spinning = ms >= T.date && ms < lock;
  const locked = ms >= lock;
  const sLock = (ms - lock) / 1000;
  const thud = locked ? 8 * damp(sLock, 7, 24) : 0;
  const speed = spinning ? 1 - 0.8 * kf(ms, lock - 500, 500) : 0;
  const phase = (ms - T.date) / 1000;
  const mIdx = Math.floor(phase * 16 * (0.3 + speed)) % 12;
  const dIdx = (Math.floor(phase * 23 * (0.3 + speed)) % 31) + 1;
  const blurY = spinning ? Math.sin(phase * 40) * 6 * speed : 0;
  const cursor = locked && Math.floor((ms - lock) / 420) % 2 === 0;

  const TL = { x: 1060, y: 400, w: 560, h: 380 };
  const slot = (x: number, w: number, text: string) => (
    <div style={{ position: "absolute", left: x, top: 105, width: w, height: 170, borderRadius: 14, boxSizing: "border-box",
      border: locked ? `4px dashed rgba(255,255,255,0.8)` : `4px solid rgba(255,255,255,0.2)`, overflow: "hidden",
      display: "flex", alignItems: "center", justifyContent: "center" }}>
      {!locked ? (
        <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 110, letterSpacing: TRACK.display, color: COLORS.paper, transform: `translateY(${blurY}px)`, filter: speed > 0.3 ? `blur(${speed * 2.5}px)` : undefined }}>{text}</span>
      ) : null}
    </div>
  );

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <div style={{ position: "absolute", left: 130, top: 120, width: 880 }}>
        <FlowLine from={tHead - 60} to={to} line={head.line} size={120} color={ink} lineHeight={1} />
      </div>
      <div style={{ position: "absolute", left: 132, top: 290, width: 860 }}>
        <FlowLine from={tLine - 60} to={to} line={line.line} size={64} color={ink} restColor={inkA(0.5)} restWeight={400} emphasize={line.emphasize} empColor={ink} lineHeight={1.12} />
      </div>
      {/* the tile */}
      <div style={{ position: "absolute", left: TL.x, top: TL.y + thud, width: TL.w, height: TL.h, background: ink, borderRadius: 24, opacity: tile, transform: `scale(${tileS})`, boxShadow: `0 30px 60px ${inkA(0.2)}` }}>
        {slot(40, 250, MONTHS[mIdx])}
        {slot(310, 210, String(dIdx))}
        {cursor ? <div style={{ position: "absolute", left: 310 + 105 - 4, top: 140, width: 8, height: 100, background: acc }} /> : null}
      </div>
      <div style={{ position: "absolute", left: TL.x, width: TL.w, top: TL.y + TL.h + 30, textAlign: "center", opacity: kf(ms, T.launch, 250), ...lab(ink, 40) }}>{label}</div>
    </AbsoluteFill>
  );
};
