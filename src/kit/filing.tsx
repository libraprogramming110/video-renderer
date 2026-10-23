// ─────────────────────────────────────────────────────────────────────────
// KIT · filing — a filing that meets a trial that does not exist yet. Added on
// the Compass/tovecimig long-form, 2026-09-26. HORIZONTAL (1920×1080) first.
//
// The recurring object is the DASHED TRIAL: a hollow block with a dashed edge.
// Per the 08-22 vocabulary, hollow + dashed = NEVER HAPPENED / NEVER MEASURED.
// That is exactly what the FDA's recommended survival trial is, so the same
// block is what the filing collides with (§1 hook), what the memo orders first
// (the disclosure), what Compass pushes back on (its position) and, later,
// what the FDA "recommended" rather than required (callback).
//
//   FilingStandoff  — red world. A dossier (the filing) lunges at the FDA and
//                     STRIKES a dashed trial block that dropped into its path;
//                     it recoils (damped), then pages fly in on arcs and stack
//                     ("keep preparing") and it presses forward again ("anyway").
//   DisclosureMemo  — white card. The date tile flips and rolls to 22; the
//                     disclosure flows verbatim with "survival benefit" as the
//                     one red; an ORDER diagram (dashed trial FIRST, BLA THEN);
//                     the drug stamps; the indication lands as three tags.
//   EngageLoop      — ink. Compass vs FDA on one floor, the dashed trial between;
//                     "not warranted" throws a push wave that slides the block
//                     back; "keep engaging" opens a loop of red packets that
//                     ping-pong between the two; the submission keeps stacking.
// Every onset takes a cue word + an ms override.
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, interpolate, Easing } from "remotion";
import { CLAMP, clamp01, COLORS, cue, DISPLAY, SANS, TRACK, useMs, useAccent, useInkSub, INK_SUB, inkA, accentA } from "./core";
import { FlowLine } from "./flowline";
import { TYPE } from "../style";

const EASE = Easing.out(Easing.cubic);
const EASE_IN = Easing.in(Easing.cubic);
const EASE_IO = Easing.inOut(Easing.cubic);
const W = 1920;
const H = 1080;

type Win = { from: number; to: number };
type Cue = { word?: string; ms?: number };

const useVis = (from: number, to: number, padIn = 300, padOut = 360) => {
  const ms = useMs();
  return clamp01(interpolate(ms, [from, from + padIn, to - padOut, to], [0, 1, 1, 0], CLAMP));
};
const at = (c: Cue | undefined, fb: number, after: number) => c?.ms ?? cue(c?.word, fb, after);
const kf = (ms: number, a: number, d: number) => clamp01(interpolate(ms, [a, a + d], [0, 1], CLAMP));
/** damped oscillation, 1 at s=0 decaying to 0 (s in seconds) */
const damp = (s: number, k = 4.5, w = 9) => (s < 0 ? 0 : Math.exp(-k * s) * Math.cos(w * s));

/** Gravity drop: y offset (negative = above rest) from `h` to 0 over `dur`, then a
 *  small damped settle. Returns {dy, squash}. */
const drop = (ms: number, t0: number, h: number, dur = 420) => {
  const u = clamp01((ms - t0) / dur);
  const dy = -h * (1 - u * u); // t² fall
  const s = (ms - t0 - dur) / 1000;
  const squash = s >= 0 ? 1 - 0.16 * damp(s, 7, 17) : 1;
  return { dy, squash, landed: s >= 0, s };
};

export const FILING = { floorY: 650, blockCX: 1450, blockW: 160, blockH: 300 };

/** The dashed trial block — hollow = not happened. SVG, drawn around (cx, bottom). */
export const DashedTrial: React.FC<{ cx: number; bottom: number; w: number; h: number; color: string; label: string[]; size?: number; opacity?: number; squash?: number; tilt?: number; fill?: string; labelDy?: number }> = ({
  cx, bottom, w, h, color, label, size = 34, opacity = 1, squash = 1, tilt = 0, fill = "none", labelDy = 0,
}) => (
  <g opacity={opacity} transform={`translate(${cx} ${bottom}) rotate(${tilt}) scale(${1 + (1 - squash) * 0.6} ${squash})`}>
    <rect x={-w / 2} y={-h} width={w} height={h} fill={fill} stroke={color} strokeWidth={4} strokeDasharray="16 11" />
    {label.map((l, i) => (
      <text key={i} x={0} y={-h / 2 + labelDy + (i - (label.length - 1) / 2) * size * 1.08 + size * 0.35} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={size} letterSpacing="-0.035em" fill={color}>
        {l}
      </text>
    ))}
  </g>
);

/** The filing: a document with a BLA tag and ruled lines, plus `sheets` stacked behind. */
export const Dossier: React.FC<{ cx: number; bottom: number; w: number; h: number; paper: string; mark: string; rule: string; sheets: number; tag: string }> = ({ cx, bottom, w, h, paper, mark, rule, sheets, tag }) => {
  const x = cx - w / 2;
  const y = bottom - h;
  return (
    <g>
      {Array.from({ length: sheets }, (_, i) => sheets - i).map((k) => (
        <rect key={k} x={x - k * 6} y={y - k * 6} width={w} height={h} fill={paper} stroke={rule} strokeWidth={2} />
      ))}
      <rect x={x} y={y} width={w} height={h} fill={paper} stroke={rule} strokeWidth={2} />
      <text x={x + 18} y={y + 56} fontFamily={SANS} fontWeight={700} fontSize={44} letterSpacing="-0.035em" fill={mark}>{tag}</text>
      {[0, 1, 2, 3, 4].map((i) => (
        <rect key={i} x={x + 18} y={y + 88 + i * 26} width={(w - 36) * [1, 0.82, 0.94, 0.7, 0.5][i]} height={9} fill={rule} />
      ))}
    </g>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// FilingStandoff — the hook (red world)
// ══════════════════════════════════════════════════════════════════════════
export const FilingStandoff: React.FC<Win & {
  first: { line: string; emphasize?: string };
  second: { line: string; emphasize?: string; word?: string; ms?: number };
  fda: Cue & { label: string };
  trial: Cue & { label: string[] };
  filer: Cue & { name: string };
  sub: Cue & { label: string };
  files: Cue;
  prepare: Cue;
  anyway: Cue;
}> = ({ from, to, first, second, fda, trial, filer, sub, files, prepare, anyway }) => {
  const ms = useMs();
  const vis = useVis(from, to);
  const inkSub = useInkSub();
  const white = COLORS.paper;

  const tFda = at(fda, from + 200, from);
  const tTrial = Math.max(tFda + 200, at(trial, tFda + 900, from));
  const tFiler = Math.max(tTrial + 300, at(filer, tTrial + 800, from));
  const tSub = Math.max(tFiler + 200, at(sub, tFiler + 1500, tFiler));
  const tFiles = Math.max(tFiler + 500, at(files, tFiler + 1000, tFiler));
  const t2 = at(second, tFiles + 2400, tFiles);
  const tPrep = Math.max(t2 + 200, at(prepare, t2 + 1000, t2));
  const tAny = Math.max(tPrep + 600, at(anyway, tPrep + 1000, tPrep));

  const { floorY, blockCX, blockW, blockH } = FILING;
  const dW = 180;
  const dH = 236;
  const rest = 1110;
  const contact = blockCX - blockW / 2 - dW / 2; // 1280
  const recoilRest = 1150;
  const LUNGE = 300;
  const tImpact = tFiles + LUNGE;

  // floor
  const floorP = EASE(kf(ms, from + 100, 700));

  // FDA pillar drops in
  const pil = drop(ms, tFda, 760, 380);
  const pilOn = kf(ms, tFda, 80);

  // the trial block drops into the path
  const blk = drop(ms, tTrial, 820, 440);
  const blkOn = kf(ms, tTrial, 80);
  const sImp = (ms - tImpact) / 1000;
  const blkShake = sImp >= 0 ? 14 * Math.exp(-6 * sImp) * Math.sin(16 * sImp) : 0;
  const press = 10 * EASE(kf(ms, tAny + 420, 300));

  // dossier x: enter → lunge → recoil → press
  let dx: number;
  if (ms < tFiles) dx = interpolate(ms, [tFiler, tFiler + 520], [960, rest], { ...CLAMP, easing: EASE });
  else if (ms < tImpact) dx = rest + (contact - rest) * EASE_IN(kf(ms, tFiles, LUNGE));
  else dx = recoilRest + (contact - recoilRest) * damp(sImp, 4.5, 9);
  dx = dx + (contact + press - dx) * EASE_IO(kf(ms, tAny, 460));
  const dOn = kf(ms, tFiler, 200);

  // pages fly in and stack
  const N = 7;
  const pages = Array.from({ length: N }, (_, i) => {
    const t0 = tPrep + i * 150;
    const u = kf(ms, t0, 460);
    return { i, t0, u, landed: ms >= t0 + 460 };
  });
  const sheets = pages.filter((p) => p.landed).length;

  // shockwave at the impact point
  const ring = kf(ms, tImpact, 620);
  const ringX = blockCX - blockW / 2;
  const ringY = floorY - dH / 2;

  // dust at the block landing
  const dust = blk.landed ? clamp01(blk.s / 0.55) : 0;

  const line1Dim = interpolate(ms, [t2 - 250, t2 + 150], [1, 0.42], CLAMP);

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {/* headline column */}
      <div style={{ position: "absolute", left: 96, top: 150, width: 820, display: "flex", flexDirection: "column", gap: 44 }}>
        <div style={{ opacity: line1Dim }}>
          <FlowLine from={from} to={t2} line={first.line} size={76} color={white} restColor={inkSub} restWeight={400} emphasize={first.emphasize} empColor={white} />
        </div>
        <FlowLine from={t2 - 100} to={to} line={second.line} size={76} color={white} restColor={inkSub} restWeight={400} emphasize={second.emphasize} empColor={white} />
      </div>

      <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {/* floor */}
        <line x1={1000} x2={1000 + 840 * floorP} y1={floorY} y2={floorY} stroke={white} strokeWidth={3} opacity={0.55} />

        {/* FDA pillar */}
        <g opacity={pilOn} transform={`translate(0 ${pil.dy})`}>
          <rect x={1712} y={floorY - 400 + (1 - pil.squash) * 400} width={44} height={400 * pil.squash} fill={white} />
        </g>

        {/* the dashed trial */}
        {blkOn > 0 ? <DashedTrial cx={blockCX + blkShake + press} bottom={floorY + blk.dy} w={blockW} h={blockH} color={white} label={trial.label} squash={blk.squash} opacity={blkOn} /> : null}
        {/* dust */}
        {dust > 0 && dust < 1
          ? Array.from({ length: 10 }, (_, j) => {
              const side = j % 2 ? 1 : -1;
              const a = (j / 10) * 0.9 + 0.1;
              const r = 30 + dust * (60 + (j % 3) * 30);
              return <circle key={j} cx={blockCX + side * (blockW / 2 + r * Math.cos(a))} cy={floorY - r * Math.sin(a) * 0.5} r={5 * (1 - dust)} fill={white} opacity={0.8 * (1 - dust)} />;
            })
          : null}

        {/* shockwave */}
        {ring > 0 && ring < 1 ? (
          <>
            <circle cx={ringX} cy={ringY} r={20 + ring * 200} fill="none" stroke={white} strokeWidth={8 * (1 - ring)} opacity={1 - ring} />
            <circle cx={ringX} cy={ringY} r={10 + ring * 110} fill="none" stroke={white} strokeWidth={4 * (1 - ring)} opacity={0.7 * (1 - ring)} />
          </>
        ) : null}

        {/* flying pages */}
        {pages.map(({ i, u, landed }) => {
          if (u <= 0 || landed) return null;
          const e = EASE_IO(u);
          const p0 = { x: 1000 - i * 8, y: 1000 };
          const p1 = { x: 1040 + i * 12, y: 280 - i * 10 };
          const p2 = { x: dx - dW / 2, y: floorY - dH };
          const x = (1 - e) * (1 - e) * p0.x + 2 * (1 - e) * e * p1.x + e * e * p2.x;
          const y = (1 - e) * (1 - e) * p0.y + 2 * (1 - e) * e * p1.y + e * e * p2.y;
          const rot = interpolate(e, [0, 1], [-38 + i * 7, 0]);
          return <rect key={i} x={x} y={y} width={dW * 0.9} height={dH * 0.9} fill={white} stroke={accentA(0.5)} strokeWidth={2} opacity={kf(u * 1000, 0, 60)} transform={`rotate(${rot} ${x + dW / 2} ${y + dH / 2})`} />;
        })}

        {/* the dossier */}
        {dOn > 0 ? (
          <g opacity={dOn}>
            <Dossier cx={dx} bottom={floorY} w={dW} h={dH} paper={white} mark={COLORS.accent} rule={accentA(0.3)} sheets={sheets} tag="BLA" />
          </g>
        ) : null}
      </svg>

      {/* labels */}
      <div style={{ position: "absolute", left: 1734 - 150, width: 300, top: 150 + pil.dy, textAlign: "center", opacity: pilOn, fontFamily: DISPLAY, fontWeight: 700, fontSize: 72, letterSpacing: TRACK.display, color: white }}>{fda.label}</div>
      <div style={{ position: "absolute", left: dx - 200, width: 400, top: floorY + 22, textAlign: "center", opacity: dOn }}>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 34, letterSpacing: TRACK.nav, color: white }}>{filer.name}</div>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: TYPE.label, letterSpacing: TRACK.nav, color: inkSub, marginTop: 6, opacity: kf(ms, tSub, 260) }}>{sub.label}</div>
      </div>
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// DisclosureMemo — the disclosure (white card)
// ══════════════════════════════════════════════════════════════════════════
export const DisclosureMemo: React.FC<Win & {
  date: { month: string; day: number; word?: string; ms?: number; dayWord?: string; dayMs?: number };
  source: { line: string; word?: string; ms?: number };
  body: { line: string; emphasize: string; word?: string; ms?: number };
  order: { first: string[]; then: string[]; thenSub: string; firstWord?: string; firstMs?: number; arrowWord?: string; arrowMs?: number; thenWord?: string; thenMs?: number };
  drug: { label: string; name: string; word?: string; ms?: number };
  indication: { label: string; tags: { label: string; word?: string; ms?: number }[] };
}> = ({ from, to, date, source, body, order, drug, indication }) => {
  const ms = useMs();
  const vis = useVis(from, to);
  const acc = useAccent();
  const ink = COLORS.ink;
  const gray = COLORS.grayText;

  const tDate = date.ms ?? cue(date.word, from + 300, from);
  const tDay = Math.max(tDate + 200, date.dayMs ?? cue(date.dayWord, tDate + 500, from));
  const tSrc = Math.max(tDay + 200, source.ms ?? cue(source.word, tDay + 1000, from));
  const tBody = Math.max(tSrc + 200, body.ms ?? cue(body.word, tSrc + 500, tSrc));
  const tFirst = Math.max(tBody + 400, order.firstMs ?? cue(order.firstWord, tBody + 4000, tBody));
  const tArrow = Math.max(tFirst + 150, order.arrowMs ?? cue(order.arrowWord, tFirst + 300, tFirst));
  const tThen = Math.max(tArrow + 200, order.thenMs ?? cue(order.thenWord, tArrow + 600, tArrow));
  const tDrug = Math.max(tThen + 300, drug.ms ?? cue(drug.word, tThen + 2000, tThen));
  const tTags = indication.tags.map((t, i) => Math.max(tDrug + 300 + i * 150, t.ms ?? cue(t.word, tDrug + 1200 + i * 700, tDrug)));

  // date tile: flips down, then the day rolls up to its value
  const flip = EASE(kf(ms, tDate, 420));
  const roll = EASE_IO(kf(ms, tDay, 520));
  const day = Math.max(1, Math.round(roll * date.day));
  const dayP = kf(ms, tDay, 120);

  // order diagram
  const firstD = drop(ms, tFirst, 260, 340);
  const firstOn = kf(ms, tFirst, 80);
  const arrowP = EASE(kf(ms, tArrow, 420));
  const thenP = kf(ms, tThen, 140);
  const thenS = interpolate(ms, [tThen, tThen + 300], [1.14, 1], { ...CLAMP, easing: EASE });
  const drugP = kf(ms, tDrug, 140);
  const drugS = interpolate(ms, [tDrug, tDrug + 300], [1.18, 1], { ...CLAMP, easing: EASE });
  const indP = kf(ms, tTags[0] - 100, 240);

  const RX = 1290; // diagram left
  const RW = 480;

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {/* date tile */}
      <div style={{ position: "absolute", left: 150, top: 120, width: 170, height: 170, perspective: 800 }}>
        <div style={{ width: "100%", height: "100%", background: ink, transformOrigin: "top", transform: `rotateX(${(1 - flip) * -90}deg)`, opacity: kf(ms, tDate, 60), display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
          <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 34, letterSpacing: TRACK.nav, color: "rgba(255,255,255,0.7)" }}>{date.month}</div>
          <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 96, lineHeight: 1, letterSpacing: TRACK.display, color: COLORS.paper, fontVariantNumeric: "tabular-nums", opacity: dayP }}>{day}</div>
        </div>
      </div>

      {/* source */}
      <div style={{ position: "absolute", left: 360, top: 150, width: 860 }}>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: TYPE.label, letterSpacing: TRACK.nav, color: gray, opacity: kf(ms, tSrc, 240) }}>Company disclosure</div>
        <FlowLine from={tSrc - 50} to={tBody + 400} line={source.line} size={64} color={ink} style={{ marginTop: 10 }} />
      </div>

      {/* body */}
      <div style={{ position: "absolute", left: 150, top: 350, width: 960 }}>
        <FlowLine from={tBody - 50} to={tFirst} line={body.line} size={62} color={ink} restColor={inkA(0.55)} restWeight={400} emphasize={body.emphasize} empColor={acc} underline={acc} lineHeight={1.12} />
      </div>

      {/* drug */}
      <div style={{ position: "absolute", left: 150, top: 600, display: "flex", alignItems: "baseline", gap: 26 }}>
        <span style={{ fontFamily: SANS, fontWeight: 700, fontSize: TYPE.label, letterSpacing: TRACK.nav, color: gray, opacity: drugP }}>{drug.label}</span>
        <span style={{ display: "inline-block", fontFamily: DISPLAY, fontWeight: 700, fontSize: 84, letterSpacing: TRACK.display, color: ink, opacity: drugP, transform: `scale(${drugS})`, transformOrigin: "left" }}>{drug.name}</span>
      </div>

      {/* indication tags */}
      <div style={{ position: "absolute", left: 150, top: 745 }}>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: TYPE.label, letterSpacing: TRACK.nav, color: gray, opacity: indP }}>{indication.label}</div>
        <div style={{ display: "flex", gap: 16, marginTop: 14 }}>
          {indication.tags.map((t, i) => {
            const p = kf(ms, tTags[i], 160);
            const last = i === indication.tags.length - 1;
            return (
              <div key={i} style={{ padding: "12px 22px", border: `3px solid ${ink}`, background: last ? ink : "transparent", color: last ? COLORS.paper : ink, fontFamily: SANS, fontWeight: 700, fontSize: 40, letterSpacing: TRACK.nav, opacity: p, transform: `translateY(${(1 - p) * 18}px)` }}>
                {t.label}
              </div>
            );
          })}
        </div>
      </div>

      {/* the order: the dashed trial FIRST, the BLA THEN */}
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {firstOn > 0 ? <DashedTrial cx={RX + RW / 2} bottom={330 + firstD.dy} w={RW} h={170} color={ink} label={order.first} size={40} squash={firstD.squash} opacity={firstOn} /> : null}
        {arrowP > 0 ? (
          <g stroke={ink} strokeWidth={5} fill="none">
            <line x1={RX + RW / 2} x2={RX + RW / 2} y1={350} y2={350 + 90 * arrowP} />
            {arrowP > 0.9 ? <polyline points={`${RX + RW / 2 - 18},${424} ${RX + RW / 2},${442} ${RX + RW / 2 + 18},${424}`} /> : null}
          </g>
        ) : null}
      </svg>
      <div style={{ position: "absolute", left: RX - 130, top: 222, width: 110, textAlign: "right", fontFamily: SANS, fontWeight: 700, fontSize: TYPE.label, letterSpacing: TRACK.nav, color: gray, opacity: firstOn }}>First</div>
      <div style={{ position: "absolute", left: RX - 130, top: 528, width: 110, textAlign: "right", fontFamily: SANS, fontWeight: 700, fontSize: TYPE.label, letterSpacing: TRACK.nav, color: gray, opacity: thenP }}>Then</div>
      <div style={{ position: "absolute", left: RX, top: 460, width: RW, height: 190, background: ink, opacity: thenP, transform: `scale(${thenS})`, display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 30px", boxSizing: "border-box" }}>
        {order.then.map((l, i) => (
          <div key={i} style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 44, lineHeight: 1.1, letterSpacing: TRACK.headline, color: COLORS.paper }}>{l}</div>
        ))}
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: TYPE.label, letterSpacing: TRACK.nav, color: "rgba(255,255,255,0.62)", marginTop: 10 }}>{order.thenSub}</div>
      </div>
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// EngageLoop — the position (ink)
// ══════════════════════════════════════════════════════════════════════════
export const EngageLoop: React.FC<Win & {
  first: { line: string; emphasize?: string };
  second: { line: string; emphasize?: string; word?: string; ms?: number };
  sponsor: Cue & { name: string; sub: string };
  agency: Cue & { name: string; sub: string };
  trial: Cue & { label: string[] };
  push: Cue;
  engage: Cue;
  prepare: Cue & { label: string };
}> = ({ from, to, first, second, sponsor, agency, trial, push, engage, prepare }) => {
  const ms = useMs();
  const vis = useVis(from, to);
  const acc = useAccent();
  const white = COLORS.paper;

  const tSp = at(sponsor, from + 300, from);
  const tTrial = Math.max(tSp + 300, at(trial, tSp + 1000, from));
  const tPush = Math.max(tTrial + 450, at(push, tTrial + 700, tTrial));
  const t2 = at(second, tPush + 1500, tPush);
  const tEng = Math.max(t2 + 200, at(engage, t2 + 700, t2));
  const tAg = Math.max(tEng, at(agency, tEng + 900, tEng));
  const tPrep = Math.max(tAg + 300, at(prepare, tAg + 1200, tAg));

  const floorY = 720;
  const spX = 440; // sponsor tile centre
  const agX = 1590;
  const tileW = 320;
  const tileH = 130;

  const floorP = EASE(kf(ms, from + 100, 700));
  const spIn = EASE(kf(ms, tSp, 480));
  const spXNow = spX - 260 * (1 - spIn);
  const agLit = kf(ms, tAg, 260);
  const agOn = 0.32 + 0.68 * agLit;

  // trial drops, then gets pushed back toward the FDA
  const blk = drop(ms, tTrial, 700, 400);
  const blkOn = kf(ms, tTrial, 80);
  const waveT = 380; // push wave travel time
  const pushS = (ms - tPush - waveT) / 1000;
  const slide = pushS < 0 ? 0 : 150 * (1 - Math.exp(-5 * pushS)); // friction decel
  const tilt = pushS < 0 ? 0 : 5 * Math.exp(-5 * pushS) * Math.sin(10 * pushS);
  const blockCX = 960 + slide;
  const wave = kf(ms, tPush, waveT + 200);

  // the engagement loop: a quadratic arc over the block, packets both ways
  const P0 = { x: spX, y: floorY - tileH };
  const P2 = { x: agX, y: floorY - tileH };
  const C = { x: 960, y: 170 };
  const q = (e: number) => ({ x: (1 - e) ** 2 * P0.x + 2 * (1 - e) * e * C.x + e * e * P2.x, y: (1 - e) ** 2 * P0.y + 2 * (1 - e) * e * C.y + e * e * P2.y });
  const arcP = EASE_IO(kf(ms, tEng, 700));
  const arcPts = Array.from({ length: 41 }, (_, i) => q((i / 40) * arcP));
  const PERIOD = 1300;
  const sinceEng = ms - tEng - 500;
  const packets: { x: number; y: number; o: number }[] = [];
  let flashSp = 0;
  let flashAg = 0;
  if (sinceEng > 0) {
    const n = Math.floor(sinceEng / PERIOD);
    for (let k = Math.max(0, n - 1); k <= n; k++) {
      const u = (sinceEng - k * PERIOD) / PERIOD;
      if (u < 0 || u > 1) continue;
      const e = EASE_IO(u);
      const pos = q(k % 2 === 0 ? e : 1 - e);
      packets.push({ ...pos, o: 1 });
      // trailing ghosts
      for (let g = 1; g <= 4; g++) {
        const eg = EASE_IO(clamp01(u - g * 0.035));
        packets.push({ ...q(k % 2 === 0 ? eg : 1 - eg), o: 0.5 - g * 0.1 });
      }
    }
    const arrivalAge = (sinceEng % PERIOD) / 1000;
    const lastK = n - 1;
    if (lastK >= 0 && arrivalAge < 0.4) {
      if (lastK % 2 === 0) flashAg = 1 - arrivalAge / 0.4;
      else flashSp = 1 - arrivalAge / 0.4;
    }
  }

  // the submission keeps stacking beside the sponsor
  const N = 5;
  const sheetsIn = Array.from({ length: N }, (_, i) => kf(ms, tPrep + i * 170, 380));
  const sheets = sheetsIn.filter((u) => u >= 1).length;
  const dosOn = kf(ms, tPrep - 200, 240);
  const dosX = 175;

  const line1Out = interpolate(ms, [t2 - 300, t2], [1, 0], CLAMP);

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {/* narration, top band */}
      <div style={{ position: "absolute", left: 96, right: 96, top: 88 }}>
        <div style={{ position: "absolute", left: 0, right: 0, opacity: line1Out }}>
          <FlowLine from={from} to={t2} line={first.line} size={64} color={white} restColor={INK_SUB} restWeight={400} emphasize={first.emphasize} empColor={white} />
        </div>
        <div style={{ position: "absolute", left: 0, right: 0 }}>
          <FlowLine from={t2 - 100} to={to} line={second.line} size={64} color={white} restColor={INK_SUB} restWeight={400} emphasize={second.emphasize} empColor={white} />
        </div>
      </div>

      <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <line x1={80} x2={80 + 1760 * floorP} y1={floorY} y2={floorY} stroke={white} strokeWidth={3} opacity={0.4} />

        {/* the loop */}
        {arcP > 0 ? <polyline points={arcPts.map((p) => `${p.x},${p.y}`).join(" ")} fill="none" stroke={white} strokeWidth={3} opacity={0.35} /> : null}
        {packets.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={i % 5 === 0 ? 13 : 9} fill={acc} opacity={p.o} />
        ))}

        {/* push wave from the sponsor */}
        {wave > 0 && wave < 1 ? (
          <g opacity={1 - wave}>
            {[0, 1, 2].map((j) => {
              const x = spX + tileW / 2 + (blockCX - 85 - spX - tileW / 2) * clamp01(wave * 1.2 - j * 0.12);
              return <path key={j} d={`M ${x} ${floorY - 230} Q ${x + 34} ${floorY - 125} ${x} ${floorY - 20}`} fill="none" stroke={white} strokeWidth={5 - j} opacity={1 - j * 0.3} />;
            })}
          </g>
        ) : null}

        {/* the dashed trial */}
        {blkOn > 0 ? <DashedTrial cx={blockCX} bottom={floorY + blk.dy} w={170} h={280} color={white} label={trial.label} squash={blk.squash} tilt={tilt} opacity={blkOn} /> : null}

        {/* the submission, beside the sponsor */}
        {dosOn > 0 ? (
          <g opacity={dosOn}>
            {sheetsIn.map((u, i) =>
              u > 0 && u < 1 ? (
                <rect key={i} x={interpolate(EASE(u), [0, 1], [dosX - 300, dosX - 60])} y={interpolate(EASE(u), [0, 1], [floorY - 520, floorY - 168])} width={120} height={160} fill={white} opacity={0.9} transform={`rotate(${(1 - u) * -30} ${dosX} ${floorY - 90})`} />
              ) : null
            )}
            <Dossier cx={dosX} bottom={floorY} w={120} h={160} paper={white} mark={COLORS.ink} rule="rgba(0,0,0,0.25)" sheets={sheets} tag="BLA" />
          </g>
        ) : null}
      </svg>

      {/* sponsor tile */}
      <div style={{ position: "absolute", left: spXNow - tileW / 2, top: floorY - tileH, width: tileW, height: tileH, background: white, opacity: spIn, display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: flashSp > 0 ? `0 0 0 ${6 * flashSp}px ${acc}` : "none" }}>
        <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 56, letterSpacing: TRACK.headline, color: COLORS.ink }}>{sponsor.name}</span>
      </div>
      <div style={{ position: "absolute", left: spXNow - 200, width: 400, top: floorY + 20, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: TYPE.label, letterSpacing: TRACK.nav, color: INK_SUB, opacity: spIn }}>{sponsor.sub}</div>

      {/* agency tile */}
      <div style={{ position: "absolute", left: agX - tileW / 2, top: floorY - tileH, width: tileW, height: tileH, border: `4px solid ${white}`, boxSizing: "border-box", opacity: agOn * kf(ms, from + 200, 400), display: "flex", alignItems: "center", justifyContent: "center",
        boxShadow: flashAg > 0 ? `0 0 0 ${6 * flashAg}px ${acc}` : "none" }}>
        <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 56, letterSpacing: TRACK.headline, color: white }}>{agency.name}</span>
      </div>
      <div style={{ position: "absolute", left: agX - 200, width: 400, top: floorY + 20, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: TYPE.label, letterSpacing: TRACK.nav, color: INK_SUB, opacity: agOn * kf(ms, from + 200, 400) }}>{agency.sub}</div>

      <div style={{ position: "absolute", left: dosX - 200, width: 400, top: floorY + 20, textAlign: "center", fontFamily: SANS, fontWeight: 700, fontSize: TYPE.label, letterSpacing: TRACK.nav, color: INK_SUB, opacity: kf(ms, tPrep, 300) }}>{prepare.label}</div>
    </AbsoluteFill>
  );
};
