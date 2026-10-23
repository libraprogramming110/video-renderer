// ─────────────────────────────────────────────────────────────────────────
// KIT · lesson — WHAT IT MEANS, as two physical scenes. Added on the Compass/
// tovecimig long-form, 2026-09-26. HORIZONTAL.
//
// ShortStack (white card) — "the lesson is concrete. A <win> and a <result>
// did not, by themselves, settle the question of filing. The agency asked for
// survival." A concrete SLAB slams down on "concrete" (dust, a thud); the two
// wins FALL onto it under gravity and stack (squash on landing); on "did not"
// the stack HOPS toward the dashed filing line and falls back short; the
// dashed line itself is the filing (dashed = has not happened); on "survival"
// a DASHED slot drops into exactly the gap that is missing and its edge turns
// red — the survival data that does not exist yet (the §1 dashed trial again).
//
// SoftWord (ink) — "The FDA recommended a trial. <Sponsor> has not described
// it as a requirement, and it still holds <designations>." The dashed trial
// returns; "Recommended" HANGS over it on two strings from a nail and swings
// (a damped pendulum: soft, not fixed). On "requirement" a padlock falls onto
// the block's hasp, fails to catch, BOUNCES OFF and tumbles out of frame while
// the word is struck. The designations STAMP as badges beside it.
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, interpolate, Easing } from "remotion";
import { CLAMP, clamp01, COLORS, cue, DISPLAY, SANS, TRACK, useMs, useAccent, INK_SUB, inkA } from "./core";
import { FlowLine } from "./flowline";
import { DashedTrial } from "./filing";
import { TYPE } from "../style";

const EASE = Easing.out(Easing.cubic);
const W = 1920;
const H = 1080;
type Cue = { word?: string; ms?: number };
const at = (c: Cue | undefined, fb: number, after: number) => c?.ms ?? cue(c?.word, fb, after);
const kf = (ms: number, a: number, d: number) => clamp01(interpolate(ms, [a, a + d], [0, 1], CLAMP));
const damp = (s: number, k: number, w: number) => (s < 0 ? 0 : Math.exp(-k * s) * Math.cos(w * s));

/** gravity drop from `h` above to rest over `dur`, then a damped squash */
const fall = (ms: number, t0: number, h: number, dur: number) => {
  const u = clamp01((ms - t0) / dur);
  const s = (ms - t0 - dur) / 1000;
  return { dy: -h * (1 - u * u), squash: s >= 0 ? 1 - 0.12 * damp(s, 8, 18) : 1, landed: s >= 0, s, on: ms >= t0 };
};

// ══════════════════════════════════════════════════════════════════════════
export const ShortStack: React.FC<{
  from: number;
  to: number;
  lines: { line: string; emphasize?: string; word?: string; ms?: number }[];
  slab: Cue & { label: string };
  blocks: [Cue & { label: string[] }, Cue & { label: string[] }];
  hop: Cue;
  filing: Cue & { label: string };
  slot: Cue & { label: string; redWord?: string; redMs?: number };
}> = ({ from, to, lines, slab, blocks, hop, filing, slot }) => {
  const ms = useMs();
  const acc = useAccent();
  const ink = COLORS.ink;
  const gray = COLORS.grayText;
  const vis = clamp01(interpolate(ms, [from, from + 300, to - 360, to], [0, 1, 1, 0], CLAMP));

  const tl = lines.map((l, i) => at(l, from + 400 + i * 4000, from));
  const tSlab = at(slab, tl[0] + 3000, from);
  const tB1 = Math.max(tSlab + 600, at(blocks[0], tSlab + 1300, tSlab));
  const tB2 = Math.max(tB1 + 500, at(blocks[1], tB1 + 1500, tB1));
  const tHop = Math.max(tB2 + 700, at(hop, tB2 + 2800, tB2));
  const tFile = Math.max(tHop + 400, at(filing, tHop + 2000, tHop));
  const tSlot = Math.max(tFile + 600, at(slot, tFile + 1500, tFile));
  const tRed = Math.max(tSlot + 300, slot.redMs ?? cue(slot.redWord, tSlot + 1100, tSlot));

  const CX = 700;
  const BW = 600;
  const BH = 180;
  const SLAB = { y: 850, h: 64, x0: 280, x1: 1120 };
  const FILE_Y = 260;

  const sl = fall(ms, tSlab, 700, 360);
  const dust = sl.landed ? clamp01(sl.s / 0.7) : 0;
  const thud = sl.landed ? 8 * Math.exp(-7 * sl.s) * Math.sin(30 * sl.s) : 0; // whole-frame thud
  const b1 = fall(ms, tB1, 760, 420);
  const b2 = fall(ms, tB2, 760, 420);
  // the hop: a ballistic jump toward the line, falls back, small bounce
  const hs = (ms - tHop) / 1000;
  const hopY = hs < 0 ? 0 : hs < 0.56 ? -(620 * hs - 0.5 * 3950 * hs * hs) : -18 * Math.exp(-6 * (hs - 0.56)) * Math.abs(Math.sin(16 * (hs - 0.56)));
  const fileP = EASE(kf(ms, tFile, 600));
  const sd = fall(ms, tSlot, 420, 360);
  const red = kf(ms, tRed, 250);
  const breathe = ms > tRed ? 0.5 + 0.5 * Math.sin(((ms - tRed) / 1000) * 5) : 0;

  const stackTop = SLAB.y - 2 * BH; // 500
  const gapH = stackTop - FILE_Y; // 240

  return (
    <AbsoluteFill style={{ opacity: vis, transform: `translateY(${thud}px)` }}>
      {/* narration column (right) */}
      <div style={{ position: "absolute", left: 1230, top: 250, width: 580 }}>
        {lines.map((l, i) => {
          const o = kf(ms, tl[i] - 100, 200) * (i < lines.length - 1 ? 1 - kf(ms, tl[i + 1] - 300, 250) : 1);
          return (
            <div key={i} style={{ position: "absolute", left: 0, right: 0, opacity: o }}>
              <FlowLine from={tl[i] - 100} to={i < lines.length - 1 ? tl[i + 1] : to} line={l.line} size={54} color={ink} restColor={inkA(0.55)} restWeight={400} emphasize={l.emphasize} empColor={ink} lineHeight={1.14} />
            </div>
          );
        })}
      </div>

      <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {/* the filing line — dashed: it has not happened */}
        {fileP > 0 ? <line x1={SLAB.x0} x2={SLAB.x0 + (SLAB.x1 - SLAB.x0) * fileP} y1={FILE_Y} y2={FILE_Y} stroke={ink} strokeWidth={5} strokeDasharray="18 12" /> : null}

        {/* the survival slot: exactly the missing gap */}
        {sd.on ? (
          <g transform={`translate(0 ${sd.dy + hopY})`}>
            <DashedTrial cx={CX} bottom={stackTop} w={BW} h={gapH} color={red > 0 ? acc : ink} label={[slot.label]} size={48} squash={sd.squash} opacity={kf(ms, tSlot, 80)} />
            {red > 0 ? <rect x={CX - BW / 2 - 10 - breathe * 6} y={FILE_Y - 10 - breathe * 6} width={BW + 20 + breathe * 12} height={gapH + 20 + breathe * 12} fill="none" stroke={acc} strokeWidth={3} opacity={red * (0.5 - 0.3 * breathe)} /> : null}
          </g>
        ) : null}

        {/* the two wins */}
        {[{ b: b2, i: 1 }, { b: b1, i: 0 }].map(({ b, i }) =>
          b.on ? (
            <g key={i} transform={`translate(${CX} ${SLAB.y - i * BH + b.dy + hopY}) scale(${1 + (1 - b.squash) * 0.5} ${b.squash})`}>
              <rect x={-BW / 2} y={-BH} width={BW} height={BH} fill={ink} />
              {blocks[i].label.map((l, k) => (
                <text key={k} x={0} y={-BH / 2 + (k - (blocks[i].label.length - 1) / 2) * 50 + 16} textAnchor="middle" fontFamily={SANS} fontWeight={700} fontSize={44} letterSpacing="-0.035em" fill={COLORS.paper}>{l}</text>
              ))}
            </g>
          ) : null
        )}

        {/* the slab */}
        {sl.on ? (
          <g transform={`translate(0 ${sl.dy})`}>
            <rect x={SLAB.x0} y={SLAB.y} width={SLAB.x1 - SLAB.x0} height={SLAB.h} fill={inkA(0.18)} />
            {Array.from({ length: 22 }, (_, i) => (
              <circle key={i} cx={SLAB.x0 + 20 + ((i * 97) % (SLAB.x1 - SLAB.x0 - 40))} cy={SLAB.y + 14 + ((i * 37) % (SLAB.h - 24))} r={2 + (i % 3)} fill={inkA(0.3)} />
            ))}
          </g>
        ) : null}
        {dust > 0 && dust < 1
          ? Array.from({ length: 16 }, (_, j) => {
              const side = j % 2 ? 1 : -1;
              const x = side > 0 ? SLAB.x1 : SLAB.x0;
              const r = 20 + dust * (80 + (j % 4) * 40);
              const a = 0.15 + (j / 16) * 1.1;
              return <circle key={j} cx={x + side * r * Math.cos(a)} cy={SLAB.y + SLAB.h - r * Math.sin(a) * 0.6} r={9 * (1 - dust) + 3} fill={inkA(0.35)} opacity={1 - dust} />;
            })
          : null}
      </svg>

      <div style={{ position: "absolute", left: SLAB.x1 - 400, width: 400, top: FILE_Y - 52, textAlign: "right", fontFamily: SANS, fontWeight: 700, fontSize: 34, letterSpacing: TRACK.nav, color: ink, opacity: fileP }}>{filing.label}</div>
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
export const SoftWord: React.FC<{
  from: number;
  to: number;
  lines: { line: string; emphasize?: string; word?: string; ms?: number }[];
  trial: Cue & { label: string[] };
  sign: Cue & { label: string };
  lock: Cue & { word2?: string; label: string };
  badges: (Cue & { label: string[] })[];
  badgeSub: string;
  holder: Cue & { label: string };
}> = ({ from, to, lines, trial, sign, lock, badges, badgeSub, holder }) => {
  const ms = useMs();
  const acc = useAccent();
  const white = COLORS.paper;
  const vis = clamp01(interpolate(ms, [from, from + 300, to - 360, to], [0, 1, 1, 0], CLAMP));

  const tl = lines.map((l, i) => at(l, from + 400 + i * 3000, from));
  const tTrial = at(trial, from + 3000, from);
  const tSign = Math.max(tTrial + 300, at(sign, tTrial + 900, tTrial));
  const tLock = Math.max(tSign + 800, at(lock, tSign + 3900, tSign));
  const tBadges = badges.map((b, i) => Math.max(tLock + 900 + i * 400, at(b, tLock + 2000 + i * 800, tLock)));
  const tHold = Math.max(tBadges[tBadges.length - 1] + 400, at(holder, tBadges[tBadges.length - 1] + 1800, tLock));

  const B = { cx: 560, bottom: 830, w: 240, h: 360 };
  const NAIL = { x: B.cx, y: 200 };

  // the trial drops in
  const tr = fall(ms, tTrial, 700, 400);
  // impact of the lock on the block
  const LOCK_FALL = 420;
  const tHit = tLock + LOCK_FALL;
  const sHit = (ms - tHit) / 1000;
  const blockShake = sHit > 0 ? 7 * Math.exp(-7 * sHit) * Math.sin(22 * sHit) : 0;

  // the hanging sign: drops onto its strings, swings (damped pendulum); the
  // lock's impact knocks it again
  const sgOn = kf(ms, tSign, 120);
  const sgS = (ms - tSign) / 1000;
  const swing = (sgS > 0 ? 11 * Math.exp(-1.6 * sgS) * Math.cos(5.2 * sgS) : 0) + (sHit > 0 ? 7 * Math.exp(-1.8 * sHit) * Math.sin(5.2 * sHit) : 0);
  const sgDrop = sgS < 0 ? -200 : -200 * Math.max(0, 1 - EASE(clamp01(sgS / 0.35)));

  // the lock: falls onto the hasp, fails to catch, bounces off, tumbles away
  const lockOn = ms >= tLock;
  let lx = B.cx;
  let ly = -120;
  let lrot = 0;
  if (lockOn) {
    const u = clamp01((ms - tLock) / LOCK_FALL);
    ly = -120 + (B.bottom - 100 - -120) * u * u;
    if (sHit > 0) {
      lx = B.cx + 330 * sHit;
      ly = B.bottom - 100 - 560 * sHit + 0.5 * 2800 * sHit * sHit;
      lrot = 240 * sHit;
    }
  }
  const strike = EASE(kf(ms, tHit + 150, 350));
  const lockLbl = kf(ms, tLock, 200);

  const lineO = (i: number) => kf(ms, tl[i] - 100, 200) * (i < lines.length - 1 ? 1 - kf(ms, tl[i + 1] - 300, 250) : 1);

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {/* narration band */}
      <div style={{ position: "absolute", left: 96, right: 96, top: 90 }}>
        {lines.map((l, i) => (
          <div key={i} style={{ position: "absolute", left: 0, right: 0, opacity: lineO(i) }}>
            <FlowLine from={tl[i] - 100} to={i < lines.length - 1 ? tl[i + 1] : to} line={l.line} size={i === 0 ? 84 : 56} color={white} restColor={INK_SUB} restWeight={400} emphasize={l.emphasize} empColor={white} />
          </div>
        ))}
      </div>

      <svg width={W} height={H} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <line x1={200} x2={1760} y1={B.bottom} y2={B.bottom} stroke={white} strokeWidth={3} opacity={0.4 * kf(ms, from + 100, 500)} />
        {/* the dashed trial, again */}
        {tr.on ? <DashedTrial cx={B.cx + blockShake} bottom={B.bottom + tr.dy} w={B.w} h={B.h} color={white} label={trial.label} size={40} squash={tr.squash} labelDy={-80} /> : null}
        {/* the hasp on its face */}
        {tr.on ? <rect x={B.cx - 30 + blockShake} y={B.bottom - 110 + tr.dy} width={60} height={34} fill="none" stroke={white} strokeWidth={5} opacity={kf(ms, tTrial + 400, 200)} /> : null}

        {/* the hanging sign */}
        {sgOn > 0 ? (
          <g opacity={sgOn} transform={`rotate(${swing} ${NAIL.x} ${NAIL.y}) translate(0 ${sgDrop})`}>
            <line x1={NAIL.x} y1={NAIL.y} x2={NAIL.x - 230} y2={NAIL.y + 90} stroke={white} strokeWidth={3} />
            <line x1={NAIL.x} y1={NAIL.y} x2={NAIL.x + 230} y2={NAIL.y + 90} stroke={white} strokeWidth={3} />
            <rect x={NAIL.x - 260} y={NAIL.y + 90} width={520} height={116} fill={white} />
            <text x={NAIL.x} y={NAIL.y + 170} textAnchor="middle" fontFamily={DISPLAY} fontWeight={700} fontSize={70} letterSpacing="-0.042em" fill={acc}>{sign.label}</text>
          </g>
        ) : null}
        {sgOn > 0 ? <circle cx={NAIL.x} cy={NAIL.y} r={9} fill={white} /> : null}

        {/* the lock */}
        {lockOn && ly < H + 200 ? (
          <g transform={`translate(${lx} ${ly}) rotate(${lrot})`}>
            <path d="M -30 -10 L -30 -52 A 30 30 0 0 1 30 -52 L 30 -34" fill="none" stroke={white} strokeWidth={12} />
            <rect x={-46} y={-10} width={92} height={80} fill={white} />
            <circle cx={0} cy={26} r={9} fill={COLORS.ink} />
          </g>
        ) : null}
      </svg>

      {/* "requirement", struck as the lock falls away */}
      <div style={{ position: "absolute", left: B.cx + 190, top: B.bottom - 250, opacity: lockLbl }}>
        <div style={{ position: "relative", display: "inline-block", fontFamily: DISPLAY, fontWeight: 700, fontSize: 64, letterSpacing: TRACK.headline, color: INK_SUB }}>
          {lock.label}
          <div style={{ position: "absolute", left: -6, right: -6, top: "54%", height: 7, background: white, transformOrigin: "left", transform: `scaleX(${strike})` }} />
        </div>
      </div>

      {/* designations */}
      <div style={{ position: "absolute", left: 1130, top: 500, display: "flex", gap: 24 }}>
        {badges.map((b, i) => {
          const p = kf(ms, tBadges[i], 140);
          const s = interpolate(ms, [tBadges[i], tBadges[i] + 320], [1.35, 1], { ...CLAMP, easing: EASE });
          const ring = kf(ms, tBadges[i], 600);
          return (
            <div key={i} style={{ position: "relative", width: 290, height: 190, border: `5px solid ${white}`, boxSizing: "border-box", display: "flex", flexDirection: "column", justifyContent: "center", padding: "0 26px", opacity: p, transform: `scale(${s}) rotate(${(i ? 2 : -2) * (1 - ring)}deg)` }}>
              {b.label.map((l, k) => <div key={k} style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 50, lineHeight: 1.04, letterSpacing: TRACK.headline, color: white }}>{l}</div>)}
              {ring < 1 ? <div style={{ position: "absolute", inset: -5 - ring * 40, border: `4px solid ${white}`, opacity: 1 - ring }} /> : null}
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 1130, top: 710, fontFamily: SANS, fontWeight: 700, fontSize: TYPE.label, letterSpacing: TRACK.nav, color: INK_SUB, opacity: kf(ms, tBadges[tBadges.length - 1] + 500, 300) }}>{badgeSub}</div>
      <div style={{ position: "absolute", left: 1130, top: 756, fontFamily: DISPLAY, fontWeight: 700, fontSize: 72, letterSpacing: TRACK.display, color: white, opacity: kf(ms, tHold, 200), transform: `translateY(${(1 - kf(ms, tHold, 200)) * 16}px)` }}>{holder.label}</div>
    </AbsoluteFill>
  );
};
