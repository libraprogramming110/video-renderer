// ─────────────────────────────────────────────────────────────────────────
// KIT · longway — "Lilly is not first" as ONE camera move along a time rail.
// Onswik horizontal long-form, 2026-09-27. White card, 1920×1080.
//
//   LongWay — a podium first: the entrant LUNGES for the 1st plinth, strikes the
//             face-down card already on it, recoils and settles on 2nd; the card
//             FLIPS to reveal the incumbent. Then the plinths sink and both cards
//             fly to their dates on a months rail (2024 → 2026) that draws under
//             them; "first" hangs a red flag; "launched nationwide" ripples out of
//             the launch tick. Then the CAMERA dollies back to 2024 and follows a
//             red dot along "the long way": it hits an FDA wall and is thrown BACK
//             on a loop, waits, CRAWLS the whole year to the resubmission, then
//             arcs onto the approval pin. The trace stays drawn — the long way is a
//             SHAPE. On "Both drugs" the camera pulls out and one tag stamps on
//             both cards at once.
// The camera scales TIME only (x); vertical elements keep their size. Every
// onset takes a cue word + an ms override.
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, interpolate, Easing } from "remotion";
import { CLAMP, clamp01, COLORS, cue, DISPLAY, SANS, TRACK, useMs, useAccent, inkA } from "./core";
import { FlowLine } from "./flowline";
import { LAYOUT, TYPE } from "../style";

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

type CardSpec = { maker: string; name: string; inn: string; date: string; month: number };

export const LONGWAY = { railY: 724, px: 150, months: 36 };

export const LongWay: React.FC<Win & {
  lines: [Sentence, Sentence, Sentence, Sentence];
  incumbent: CardSpec; // Awiqli, pinned at its approval month
  entrant: CardSpec; // Onswik
  years: { label: string; month: number }[];
  flag: string;
  launch: { label: string; month: number };
  gate: { label: string; year: string; month: number };
  resub: { label: string; month: number };
  tag: string;
  seats: [string, string];
  cues: {
    lunge: Cue; notFirst: Cue; reveal: Cue; name: Cue; inn: Cue; won: Cue; date: Cue; first: Cue;
    launched: Cue; nationwide: Cue; august: Cue; longWay: Cue; fda: Cue; back: Cue; year: Cue;
    resub: Cue; sept: Cue; y2025: Cue; both: Cue; type2: Cue;
  };
}> = ({ from, to, lines, incumbent, entrant, years, flag, launch, gate, resub, tag, seats, cues: c }) => {
  const ms = useMs();
  const acc = useAccent();
  const ink = COLORS.ink;
  const gray = COLORS.grayText;
  const vis = clamp01(interpolate(ms, [from, from + 1, to - 380, to], [0, 1, 1, 0], CLAMP));
  const { railY, px, months } = LONGWAY;

  // ── cue times, each floored on the previous ──
  const T: Record<string, number> = {};
  let prev = from;
  const order: [keyof typeof c, number][] = [
    ["lunge", 900], ["notFirst", 800], ["reveal", 1000], ["name", 1200], ["inn", 800], ["won", 1400], ["date", 1400], ["first", 1700],
    ["launched", 2600], ["nationwide", 600], ["august", 900], ["longWay", 900], ["fda", 2200], ["back", 400], ["year", 900],
    ["resub", 1200], ["sept", 1100], ["y2025", 800], ["both", 1700], ["type2", 1900],
  ];
  for (const [k, fb] of order) {
    const t = Math.max(prev + 60, at(c[k], prev + fb, prev));
    T[k] = t;
    prev = t;
  }

  // ── the long-way dot: world (month, dy above rail) as a function of time ──
  const A0 = T.longWay + 250;
  const HIT = T.back + 120;
  const B1 = HIT + 900;
  const C0 = T.resub;
  const C1 = Math.max(C0 + 900, T.sept + 100);
  const D0 = Math.max(C1 + 100, T.y2025 - 100);
  const D1 = D0 + 950;
  const LIFT = 46;
  const dotAt = (t: number): { m: number; dy: number } | null => {
    if (t < A0) return null;
    if (t < HIT) return { m: 0.6 + (gate.month - 0.35 - 0.6) * EASE_IN(clamp01((t - A0) / (HIT - A0))), dy: -LIFT };
    if (t < B1) {
      const u = clamp01((t - HIT) / (B1 - HIT));
      return { m: gate.month - 0.35 - 3.6 * EASE(u), dy: -LIFT - 190 * Math.sin(Math.PI * u) };
    }
    const mWait = gate.month - 3.95;
    if (t < C0) return { m: mWait, dy: -LIFT - 5 * Math.sin((t - B1) / 180) };
    if (t < C1) return { m: mWait + (resub.month - mWait) * EASE_IO(clamp01((t - C0) / (C1 - C0))), dy: -LIFT };
    if (t < D0) return { m: resub.month, dy: -LIFT };
    const u = clamp01((t - D0) / (D1 - D0));
    return { m: resub.month + (incumbent.month - resub.month) * EASE_IO(u), dy: -LIFT * (1 - u) - 240 * Math.sin(Math.PI * u) };
  };

  // ── camera: centre month + time-axis scale ──
  const camKeys: [number, number, number][] = [
    [from, 29.8, 1],
    [T.longWay - 60, 29.8, 1],
    [A0 + 900, 3.8, 0.78],
  ];
  let camM = 29.8;
  let camS = 1;
  const lerpKeys = (keys: [number, number, number][]) => {
    let m = keys[0][1];
    let s = keys[0][2];
    for (let i = 1; i < keys.length; i++) {
      const [ta, ma, sa] = keys[i - 1];
      const [tb, mb, sb] = keys[i];
      if (ms > ta) {
        const u = EASE_IO(clamp01((ms - ta) / Math.max(1, tb - ta)));
        m = ma + (mb - ma) * u;
        s = sa + (sb - sa) * u;
      }
    }
    return { m, s };
  };
  ({ m: camM, s: camS } = lerpKeys(camKeys));
  // follow the dot through the crawl + relaunch
  if (ms > C0 - 200) {
    const d = dotAt(Math.min(ms, D1)) ?? { m: 3.8, dy: 0 };
    const follow = kf(ms, C0 - 200, 500);
    camM = camM + (Math.max(3.8, d.m + 1.5) - camM) * follow;
  }
  // pull out on "Both drugs"
  const out = EASE_IO(kf(ms, T.both - 100, 1100));
  if (out > 0) {
    camM = camM + (27.4 - camM) * out;
    camS = camS + (0.6 - camS) * out;
  }
  const sx = (m: number) => W / 2 + (m - camM) * px * camS;

  // ── podium phase ──
  const railOn = EASE_IO(kf(ms, T.won - 100, 900));
  const podiumOut = EASE_IN(kf(ms, T.won - 100, 500));
  const SEAT1 = { x: 760, top: 600 };
  const SEAT2 = { x: 1220, top: 660 };
  const CW = 310;
  const CH = 158;
  const fly = EASE_IO(kf(ms, T.won, 800));
  const pinCardY = railY - 70 - CH; // card top when pinned

  // incumbent card: face-down on seat 1 → flips on reveal → flies to its pin
  const incSeat = { x: SEAT1.x, y: SEAT1.top - CH };
  const incPin = { x: sx(incumbent.month) - CW / 2, y: pinCardY }; // card centred on its pin
  const incPos = { x: incSeat.x + (incPin.x - incSeat.x) * fly, y: incSeat.y + (incPin.y - incSeat.y) * fly - Math.sin(Math.PI * fly) * 120 };
  const sLunge = (ms - (T.lunge + 520)) / 1000;
  const incShake = sLunge >= 0 && ms < T.won ? 8 * damp(sLunge, 6, 30) : 0;
  const flip = EASE_IO(kf(ms, T.reveal, 520));
  const faceUp = flip >= 0.5;

  // entrant card: flies in, lunges at seat 1, strikes, recoils onto seat 2 → flies to its pin
  const entPin = { x: sx(entrant.month) - CW / 2, y: pinCardY };
  const contactX = SEAT1.x + CW + 6;
  let ex: number;
  let ey: number;
  const tHit = T.lunge + 520;
  if (ms < tHit) {
    const u = EASE_IN(kf(ms, T.lunge - 100, 620));
    ex = 2150 + (contactX - 2150) * u;
    ey = incSeat.y - 60 + 60 * u;
  } else {
    const u = EASE(kf(ms, tHit, 700));
    const bx = contactX + (SEAT2.x - contactX) * u + 34 * damp((ms - tHit) / 1000, 4, 10) * (1 - u);
    const hop = Math.sin(Math.PI * u) * 110;
    const by = incSeat.y + (SEAT2.top - CH - incSeat.y) * u - hop;
    const landS = (ms - tHit - 700) / 1000;
    ex = bx;
    ey = by + (landS > 0 ? -6 * damp(landS, 7, 20) : 0);
  }
  const entX = ex + (entPin.x - ex) * fly;
  const entY = ey + (entPin.y - ey) * fly - Math.sin(Math.PI * fly) * 90;
  const entOn = kf(ms, T.lunge - 100, 150);
  const incOn = kf(ms, from + 150, 300);

  // ── rail furniture ──
  const flagU = kf(ms, T.first, 260);
  const flagRed = 1 - kf(ms, T.longWay, 400); // the red passes to the long-way dot
  const launchU = kf(ms, T.launched, 300);
  const ripple = ms > T.nationwide && ms < T.longWay + 600;
  const gateD = (() => {
    const tl = T.fda + 300;
    const u = clamp01((ms - T.fda) / 300);
    const s = (ms - tl) / 1000;
    return { dy: -300 * (1 - u * u), squash: s >= 0 ? 1 - 0.14 * damp(s, 7, 18) : 1, on: ms >= T.fda };
  })();
  const gateShake = ms > HIT ? 7 * Math.exp(-7 * (ms - HIT) / 1000) * Math.sin(((ms - HIT) / 1000) * 44) : 0;
  const tagU = kf(ms, T.type2, 160);
  const tagS = interpolate(ms, [T.type2, T.type2 + 300], [1.35, 1], { ...CLAMP, easing: EASE });

  // trace of the long way
  const trace: string[] = [];
  const now = dotAt(ms);
  if (now) {
    for (let t = A0; t <= Math.min(ms, D1); t += 30) {
      const d = dotAt(t);
      if (d) trace.push(`${sx(d.m).toFixed(1)},${(railY + d.dy).toFixed(1)}`);
    }
  }
  const landU = ms > D1 ? kf(ms, D1, 700) : 0;
  const pathColor = ms < T.both ? acc : interpolateHex(kf(ms, T.both, 500), COLORS.accent, COLORS.ink);

  // narration seats
  const tS = [at(lines[0], from + 900, from), T.reveal - 30, T.longWay - 30, T.both - 30];
  const tE = [T.reveal, T.longWay, T.both, to];
  const lineOp = (i: number) => kf(ms, tS[i] - 150, 200) * (1 - kf(ms, tE[i] - 220, 220));

  const card = LAYOUT.card;
  const Card: React.FC<{ spec: CardSpec; x: number; y: number; dark: boolean; on: number; nameOn?: number; innOn?: number; rotY?: number; back?: boolean; shakeX?: number }> = ({ spec, x, y, dark, on, nameOn = 1, innOn = 1, rotY = 0, back = false, shakeX = 0 }) => (
    <div style={{ position: "absolute", left: x + shakeX, top: y, width: CW, height: CH, perspective: 900, opacity: on }}>
      <div style={{
        width: "100%", height: "100%", borderRadius: 16, boxSizing: "border-box",
        background: back ? ink : dark ? ink : COLORS.paper, border: `4px solid ${ink}`,
        transform: `rotateY(${rotY}deg)`, padding: "18px 24px", display: "flex", flexDirection: "column", justifyContent: "center",
        boxShadow: `0 18px 40px ${inkA(0.16)}`,
      }}>
        {back ? (
          <svg width="100%" height="100%" style={{ position: "absolute", inset: 0 }}>
            {Array.from({ length: 12 }, (_, i) => <line key={i} x1={-40 + i * 34} y1={0} x2={60 + i * 34} y2={CH} stroke="rgba(255,255,255,0.14)" strokeWidth={10} />)}
          </svg>
        ) : (
          <div style={{ transform: rotY > 90 ? "scaleX(-1)" : undefined }}>
            <div style={lab(dark ? "rgba(255,255,255,0.7)" : gray)}>{spec.maker}</div>
            <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 64, lineHeight: 1.02, letterSpacing: TRACK.display, color: dark ? COLORS.paper : ink, opacity: nameOn }}>{spec.name}</div>
            <div style={{ ...lab(dark ? "rgba(255,255,255,0.7)" : gray, TYPE.labelSm), opacity: innOn }}>{spec.inn}</div>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {/* everything on the rail is clipped to the white card */}
      <AbsoluteFill style={{ clipPath: `inset(${card.top}px ${card.right}px ${card.bottom}px ${card.left}px round ${card.radius}px)` }}>
        {/* podium */}
        {podiumOut < 1 ? (
          <div style={{ position: "absolute", inset: 0, transform: `translateY(${podiumOut * 420}px)`, opacity: 1 - podiumOut }}>
            {[{ ...SEAT1, label: seats[0], w: CW + 60 }, { ...SEAT2, label: seats[1], w: CW + 60 }].map((s, i) => {
              const up = EASE(kf(ms, from + 150 + i * 120, 500));
              return (
                <div key={i} style={{ position: "absolute", left: s.x - 30, top: s.top + (1 - up) * 300, width: s.w, height: 960 - s.top, background: i === 0 ? ink : inkA(0.1), borderRadius: "14px 14px 0 0", display: "flex", justifyContent: "center", paddingTop: 22, boxSizing: "border-box" }}>
                  <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 72, letterSpacing: TRACK.display, color: i === 0 ? COLORS.paper : ink, lineHeight: 1 }}>{s.label}</span>
                </div>
              );
            })}
          </div>
        ) : null}

        <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          {/* rail */}
          {railOn > 0 ? (
            <g opacity={railOn}>
              <line x1={sx(0)} x2={sx(0) + (sx(months) - sx(0)) * railOn} y1={railY} y2={railY} stroke={ink} strokeWidth={4} />
              {Array.from({ length: months + 1 }, (_, m) => (
                <line key={m} x1={sx(m)} x2={sx(m)} y1={railY - (m % 12 === 0 ? 22 : 9)} y2={railY + (m % 12 === 0 ? 22 : 9)} stroke={ink} strokeWidth={m % 12 === 0 ? 4 : 2} opacity={m % 12 === 0 ? 1 : 0.35} />
              ))}
            </g>
          ) : null}
          {/* launch ripple (nationwide) */}
          {ripple
            ? [0, 1, 2].map((k) => {
                const ph = (((ms - T.nationwide) / 1600 + k / 3) % 1);
                const r = 30 + ph * 330;
                const lx = sx(launch.month);
                const fade = 1 - kf(ms, T.longWay, 500);
                return <path key={k} d={`M ${lx - r} ${railY} A ${r} ${r} 0 0 1 ${lx + r} ${railY}`} fill="none" stroke={ink} strokeWidth={3} strokeDasharray="2 10" strokeLinecap="round" opacity={(1 - ph) * 0.55 * fade} />;
              })
            : null}
          {launchU > 0 ? <circle cx={sx(launch.month)} cy={railY} r={11} fill={ink} opacity={launchU} /> : null}
          {/* stems to the pinned cards */}
          {fly > 0.95 ? (
            <>
              <line x1={sx(incumbent.month)} x2={sx(incumbent.month)} y1={pinCardY + CH} y2={railY} stroke={ink} strokeWidth={3} />
              <circle cx={sx(incumbent.month)} cy={railY} r={12} fill={ink} />
              <line x1={sx(entrant.month)} x2={sx(entrant.month)} y1={pinCardY + CH} y2={railY} stroke={ink} strokeWidth={3} />
              <circle cx={sx(entrant.month)} cy={railY} r={12} fill={COLORS.paper} stroke={ink} strokeWidth={4} />
            </>
          ) : null}
          {/* the FDA gate (2024) */}
          {gateD.on ? (
            <g transform={`translate(${sx(gate.month) + gateShake} ${railY + gateD.dy}) scale(1 ${gateD.squash})`}>
              <rect x={-9} y={-210} width={18} height={210} fill={ink} />
              <rect x={-40} y={-222} width={80} height={16} fill={ink} />
            </g>
          ) : null}
          {/* resubmission tick */}
          {ms > T.sept ? <line x1={sx(resub.month)} x2={sx(resub.month)} y1={railY - 30} y2={railY + 30} stroke={ink} strokeWidth={5} opacity={kf(ms, T.sept, 200)} /> : null}
          {/* the long way: trace + dot */}
          {trace.length > 1 ? <polyline points={trace.join(" ")} fill="none" stroke={pathColor} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" /> : null}
          {now && ms < D1 ? (
            <>
              {[1, 2, 3].map((q) => {
                const d = dotAt(ms - q * 45);
                return d ? <circle key={q} cx={sx(d.m)} cy={railY + d.dy} r={14 - q * 3} fill={acc} opacity={0.25 / q} /> : null;
              })}
              <circle cx={sx(now.m)} cy={railY + now.dy} r={15} fill={acc} />
            </>
          ) : null}
          {landU > 0 && landU < 1 ? (
            <circle cx={sx(incumbent.month)} cy={railY} r={16 + landU * 90} fill="none" stroke={acc} strokeWidth={6 * (1 - landU)} opacity={1 - landU} />
          ) : null}
          {/* impact burst at the gate */}
          {ms > HIT && ms < HIT + 600
            ? Array.from({ length: 12 }, (_, j) => {
                const u = (ms - HIT) / 600;
                const a = Math.PI + (hash(j) - 0.5) * 2.4;
                const d = 20 + EASE(u) * (50 + hash(j + 3) * 70);
                return <circle key={j} cx={sx(gate.month) - 12 + Math.cos(a) * d} cy={railY - LIFT + Math.sin(a) * d} r={5 * (1 - u)} fill={acc} />;
              })
            : null}
        </svg>

        {/* rail labels */}
        {railOn > 0
          ? years.map((y, i) => (
              <div key={i} style={{ position: "absolute", left: sx(y.month) - 60, width: 120, top: railY + 34, textAlign: "center", opacity: railOn, ...lab(ink, 34) }}>{y.label}</div>
            ))
          : null}
        <div style={{ position: "absolute", left: sx(launch.month) - 150, width: 300, top: railY + 82, textAlign: "center", opacity: kf(ms, T.august, 250), ...lab(ink) }}>{launch.label}</div>
        {fly > 0.9 ? (
          <>
            <div style={{ position: "absolute", left: sx(incumbent.month) - 150, width: 300, top: railY + 82, textAlign: "center", opacity: kf(ms, T.date, 250), ...lab(ink) }}>{incumbent.date}</div>
            <div style={{ position: "absolute", left: sx(entrant.month) - 150, width: 300, top: railY + 82, textAlign: "center", opacity: kf(ms, T.won + 800, 300), ...lab(gray) }}>{entrant.date}</div>
          </>
        ) : null}
        <div style={{ position: "absolute", left: sx(gate.month) - 150, width: 300, top: railY - 290 + gateD.dy, textAlign: "center", opacity: gateD.on ? 1 : 0, ...lab(ink, 44) }}>{gate.label}</div>
        <div style={{ position: "absolute", left: sx(gate.month) - 150, width: 300, top: railY + 82, textAlign: "center", opacity: kf(ms, T.year, 250), ...lab(acc) }}>{gate.year}</div>
        <div style={{ position: "absolute", left: sx(resub.month) - 150, width: 300, top: railY + 82, textAlign: "center", opacity: kf(ms, T.sept, 250), ...lab(ink) }}>{resub.label}</div>

        {/* cards */}
        <Card spec={incumbent} x={incPos.x} y={incPos.y} dark on={incOn} rotY={flip * 180} back={!faceUp} nameOn={kf(ms, T.name, 200)} innOn={kf(ms, T.inn, 200)} shakeX={incShake} />
        <Card spec={entrant} x={entX} y={entY} dark={false} on={entOn} />
        {/* the "first" flag on the incumbent */}
        <div style={{
          position: "absolute", left: incPos.x, top: incPos.y - 58, padding: "8px 14px", borderRadius: 8,
          background: interpolateHex(flagRed, COLORS.ink, COLORS.accent), opacity: flagU * (fly > 0.9 ? 1 : 0),
          transform: `translateY(${(1 - flagU) * 16}px)`, ...lab(COLORS.paper, TYPE.labelSm),
        }}>{flag}</div>
        {/* the shared tag */}
        {[incPos, { x: entX, y: entY }].map((p, i) => (
          <div key={i} style={{ position: "absolute", left: p.x + CW - 178, top: p.y + CH - 22, padding: "8px 16px", borderRadius: 10, background: acc, opacity: tagU, transform: `scale(${tagS}) rotate(-4deg)`, transformOrigin: "center", ...lab(COLORS.paper, 30) }}>{tag}</div>
        ))}
      </AbsoluteFill>

      {/* narration */}
      <div style={{ position: "absolute", left: 110, top: 96, width: 1700, opacity: lineOp(0) }}>
        <FlowLine from={tS[0] - 60} to={tE[0]} line={lines[0].line} size={110} color={ink} restColor={inkA(0.5)} restWeight={400} emphasize={lines[0].emphasize} empColor={ink} lineHeight={1} />
      </div>
      {[1, 2, 3].map((i) => (
        <div key={i} style={{ position: "absolute", left: 110, top: 96, width: 1700, opacity: lineOp(i) }}>
          <FlowLine from={tS[i] - 60} to={tE[i]} line={lines[i].line} size={50} color={ink} restColor={inkA(0.5)} restWeight={400} emphasize={lines[i].emphasize} empColor={ink} lineHeight={1.14} />
        </div>
      ))}
    </AbsoluteFill>
  );
};

function interpolateHex(t: number, a: string, b: string) {
  const pa = parseInt(a.slice(1), 16);
  const pb = parseInt(b.slice(1), 16);
  const ch = (p: number, s: number) => (p >> s) & 255;
  const mix = (s: number) => Math.round(ch(pa, s) + (ch(pb, s) - ch(pa, s)) * clamp01(t));
  return `rgb(${mix(16)},${mix(8)},${mix(0)})`;
}
