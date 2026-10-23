// ─────────────────────────────────────────────────────────────────────────
// KIT · alk7 — A RECEPTOR SWITCHED OFF, AND THE GAP IN THE WALL. Added on the
// Roche × Rona reel, 2026-10-15 (VERTICAL 9:16), §2. One mover per cue; a
// finished idea retires.
//
// `AlkSwitch` (ink, over a FootageScrim): "The target is ALK-7. It sits on fat
// cells. Silencing it is designed to burn visceral and ectopic fat… while
// sparing lean mass." The name slams; a red receptor drops out from under it
// ("sits") and a fat cell draws beneath it ("fat cells"); an RNA strand
// travels in and the receptor goes DASHED (switched off). The cell retires;
// two fat deposits each shrink on their word, leaving a dashed outline of
// what was there; a solid lean-mass bar draws and is NOT touched: a check.
// No percentages: the script gives none.
//
// `OpenFlank` (white card): "That's the open flank in the Ozempic story.
// Muscle loss on GLP-1s is real. Payers see it. Doctors see it." A wall builds
// block by block and its last slot stays an open dashed outline; it is named;
// the slot fills red as "muscle loss"; the line is written; it retires and two
// eyes each draw a dashed line of sight into the gap.
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { CLAMP, clamp01, COLORS, DISPLAY, INK_SUB, inkA, TRACK, useMs } from "./core";
import { TYPE } from "../style";
import { at, lerp, Phrase, useK, type Cued, type Win } from "./elora";
import { DashBox } from "./tower";

const EASE = Easing.out(Easing.cubic);
const EASE_IO = Easing.inOut(Easing.cubic);
const BACK = Easing.out(Easing.back(1.6));

// ══════════════════════════════════════════════════════════════════════════
// AlkSwitch (ink)
// ══════════════════════════════════════════════════════════════════════════
export const ALK = {
  title: { y: 250 },
  cell: { cx: 540, cy: 980, r: 320 },
  recSeat: { x: 540, y: 660 }, // the receptor's base, on the membrane
  blobs: { y: 900, r: 190, xs: [300, 780], shrink: 0.45 },
  bar: { x: 150, y: 1280, w: 780, h: 150 },
};

/** A receptor glyph: a stem and two arms, base at (x, y). `dashed` = switched off. */
const Receptor: React.FC<{ x: number; y: number; color: string; dashed?: boolean; s?: number; opacity?: number }> = ({ x, y, color, dashed, s = 1, opacity = 1 }) => (
  <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, opacity, overflow: "visible" }}>
    <g transform={`translate(${x} ${y}) scale(${s})`}>
      <path d="M0 0 V-62 M0 -62 L-34 -108 M0 -62 L34 -108" fill="none" stroke={color} strokeWidth={14} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={dashed ? "10 12" : undefined} />
    </g>
  </svg>
);

export const AlkSwitch: React.FC<Win & {
  kicker: { label: string } & Cued; // "The target"
  name: { label: string } & Cued; // "ALK-7" slams
  sits: Cued; // the receptor drops out from under the name
  cell: { label: string } & Cued; // the fat cell draws under it
  silence: Cued; // the RNA strand travels in
  off: Cued; // it arrives: the receptor goes dashed
  burnKicker: { label: string } & Cued; // the cell retires, the kicker lands
  burn: Cued; // the deposits appear
  deposits: ({ label: string } & Cued)[]; // each shrinks on its word
  spare: Cued; // the lean bar draws
  lean: { label: string } & Cued; // the check
}> = ({ from, to, kicker, name, sits, cell, silence, off, burnKicker, burn, deposits, spare, lean }) => {
  const ms = useMs();
  const k = useK();
  const W = COLORS.paper;
  const A = ALK;

  const tKick = at(kicker, from + 400, from);
  const tName = at(name, tKick + 1000, from, tKick + 300);
  const tSits = at(sits, tName + 1000, from, tName + 400);
  const tCell = at(cell, tSits + 500, from, tSits + 300);
  const tSil = at(silence, tCell + 800, from, tCell + 400);
  const tOff = at(off, tSil + 600, from, tSil + 300);
  const tBK = at(burnKicker, tOff + 300, from, tOff + 200);
  const tBurn = at(burn, tBK + 700, from, tBK + 300);
  const tDep = deposits.map((d, i) => at(d, tBurn + 400 + i * 800, from, tBurn + 200));
  const tSpare = at(spare, tDep[tDep.length - 1] + 900, from, tDep[tDep.length - 1] + 400);
  const tLean = at(lean, tSpare + 600, from, tSpare + 300);
  if (ms < from || ms > to) return null;

  const kickK = k(tKick, 260);
  const nameK = k(tName, 300);
  const sitsK = EASE(k(tSits, 420));
  const cellK = EASE_IO(k(tCell, 700));
  const silK = EASE_IO(k(tSil, Math.max(300, tOff - tSil)));
  const offK = k(tOff, 200);
  const retK = k(tBK, 360); // the cell + receptor retire
  const bkK = k(tBK + 120, 260);
  const burnK = k(tBurn, 300);
  const spareK = EASE_IO(k(tSpare, 480));
  const leanK = k(tLean, 260);
  const cellO = 1 - retK;
  const C = A.cell;
  const recY = lerp(A.title.y + 260, A.recSeat.y, sitsK); // drops out from under the name

  // the strand: a short wavy pair, travelling from off-frame left to the receptor's arms
  const sx = lerp(-240, A.recSeat.x - 80, silK);
  const sy = lerp(A.recSeat.y - 260, A.recSeat.y - 96, silK);
  const strandO = clamp01(silK * 6) * (1 - offK);
  const wave = (dy: number) => `M0 ${dy} q20 -18 40 0 t40 0 t40 0 t40 0`;

  return (
    <AbsoluteFill>
      {/* the name */}
      <div style={{ position: "absolute", left: 0, right: 0, top: A.title.y - 70, textAlign: "center", opacity: kickK, fontFamily: DISPLAY, fontWeight: 700, fontSize: TYPE.label, letterSpacing: TRACK.kicker, color: INK_SUB }}>
        {kicker.label}
      </div>
      {nameK > 0 ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: A.title.y, textAlign: "center", opacity: clamp01(nameK * 3),
          transform: `scale(${lerp(1.2, 1, EASE(nameK))})`, fontFamily: DISPLAY, fontWeight: 700, fontSize: 200, letterSpacing: TRACK.display, color: W, lineHeight: 1 }}>
          {name.label}
        </div>
      ) : null}

      {/* the cell */}
      {cellK > 0 && cellO > 0 ? (
        <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, opacity: cellO, overflow: "visible" }}>
          <circle cx={C.cx} cy={C.cy} r={C.r - 80} fill={`rgba(255,255,255,${0.12 * clamp01((cellK - 0.6) / 0.4)})`} />
          <circle cx={C.cx} cy={C.cy} r={C.r} fill="none" stroke={W} strokeWidth={8} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - cellK}
            transform={`rotate(-90 ${C.cx} ${C.cy})`} />
        </svg>
      ) : null}
      {cellK > 0 && cellO > 0 ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: C.cy - 40, textAlign: "center", opacity: clamp01((cellK - 0.7) / 0.3) * cellO,
          fontFamily: DISPLAY, fontWeight: 700, fontSize: 64, letterSpacing: TRACK.headline, color: INK_SUB }}>
          {cell.label}
        </div>
      ) : null}

      {/* the receptor, then the strand that switches it off */}
      {sitsK > 0 && cellO > 0 ? (
        <Receptor x={A.recSeat.x} y={recY} color={offK > 0 ? INK_SUB : COLORS.accent} dashed={offK > 0} opacity={clamp01(sitsK * 4) * cellO} />
      ) : null}
      {strandO > 0 ? (
        <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, opacity: strandO, overflow: "visible" }}>
          <g transform={`translate(${sx - 160} ${sy}) rotate(28 160 0)`}>
            <path d={wave(-9)} fill="none" stroke={COLORS.accent} strokeWidth={7} strokeLinecap="round" />
            <path d={wave(9)} fill="none" stroke={COLORS.accent} strokeWidth={7} strokeLinecap="round" />
          </g>
        </svg>
      ) : null}

      {/* the burn: a kicker, two deposits that shrink on their words, each leaving its old outline */}
      {bkK > 0 ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: A.blobs.y - A.blobs.r - 110, textAlign: "center", opacity: bkK, fontFamily: DISPLAY, fontWeight: 700, fontSize: TYPE.label, letterSpacing: TRACK.kicker, color: INK_SUB }}>
          {burnKicker.label}
        </div>
      ) : null}
      {burnK > 0
        ? deposits.map((d, i) => {
            const cx = A.blobs.xs[i];
            const q = EASE_IO(k(tDep[i], 520));
            const r = A.blobs.r * lerp(1, A.blobs.shrink, q);
            return (
              <React.Fragment key={i}>
                {q > 0 ? <DashBox r={{ x: cx - A.blobs.r, y: A.blobs.y - A.blobs.r, w: A.blobs.r * 2, h: A.blobs.r * 2 }} color={INK_SUB} radius={A.blobs.r} opacity={clamp01(q * 3)} dash="14 12" /> : null}
                <div style={{ position: "absolute", left: cx - r, top: A.blobs.y - r, width: r * 2, height: r * 2, borderRadius: r, background: W,
                  opacity: clamp01(burnK * 3) * 0.92, transform: `scale(${lerp(0.7, 1, BACK(burnK))})` }} />
                <div style={{ position: "absolute", left: cx - 200, width: 400, top: A.blobs.y + A.blobs.r + 26, textAlign: "center", opacity: clamp01(q * 3),
                  fontFamily: DISPLAY, fontWeight: 700, fontSize: 60, letterSpacing: TRACK.headline, color: W }}>
                  {d.label}
                </div>
              </React.Fragment>
            );
          })
        : null}

      {/* lean mass: drawn whole, never touched */}
      {spareK > 0 ? (
        <div style={{ position: "absolute", left: A.bar.x, top: A.bar.y, width: A.bar.w, height: A.bar.h, borderRadius: 20, background: W,
          transformOrigin: "0 50%", transform: `scaleX(${spareK})`, display: "flex", alignItems: "center", paddingLeft: 44, boxSizing: "border-box",
          fontFamily: DISPLAY, fontWeight: 700, fontSize: 70, letterSpacing: TRACK.headline, color: COLORS.ink, whiteSpace: "nowrap" }}>
          <span style={{ opacity: clamp01((spareK - 0.6) / 0.4) }}>{lean.label}</span>
        </div>
      ) : null}
      {leanK > 0 ? (
        // inside the bar: r 46 in a 150px bar, 40px in from its right end (Nel, 2026-10-15)
        <svg width={140} height={140} viewBox="-70 -70 140 140" style={{ position: "absolute", left: A.bar.x + A.bar.w - 40 - 46 - 70, top: A.bar.y + A.bar.h / 2 - 70, overflow: "visible",
          opacity: clamp01(leanK * 3), transform: `scale(${lerp(1.6, 1, EASE(leanK))})` }}>
          <circle r={46} fill={COLORS.accent} />
          <path d="M-21 2 L-6 16 L22 -14" fill="none" stroke={W} strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      ) : null}
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// OpenFlank (white card)
// ══════════════════════════════════════════════════════════════════════════
export const FLANK = {
  kicker: { y: 340 },
  wall: { x0: 160, w: 140, gap: 15, n: 5, y: 420, h: 140 },
  label: { y: 584 },
  lineTop: 760,
  eyes: { y: 1250, xs: [290, 790] },
};

const Eye: React.FC<{ cx: number; cy: number; k: number; color: string }> = ({ cx, cy, k, color }) => (
  <svg width={200} height={120} viewBox="-100 -60 200 120" style={{ position: "absolute", left: cx - 100, top: cy - 60, overflow: "visible" }}>
    <path d="M-90 0 Q0 -66 90 0 Q0 66 -90 0 Z" fill="none" stroke={color} strokeWidth={9} strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - k} />
    <circle r={26} fill={color} opacity={clamp01((k - 0.6) / 0.4)} />
  </svg>
);

export const OpenFlank: React.FC<Win & {
  build: Cued; // the wall builds
  open: Cued; // the last slot is named open (red dashed)
  story: { label: string } & Cued; // the kicker
  loss: { label: string } & Cued; // the slot fills red
  line: { text: string; emphasize?: string };
  watchers: ({ label: string } & Cued & { see: Cued })[]; // each eye, then its line of sight
}> = ({ from, to, build, open, story, loss, line, watchers }) => {
  const ms = useMs();
  const k = useK();
  const INK = COLORS.ink;
  const F = FLANK;
  const Wl = F.wall;

  const tBuild = at(build, from + 300, from);
  const tOpen = at(open, tBuild + 600, from, tBuild + 300);
  const tStory = at(story, tOpen + 800, from, tOpen + 300);
  const tLoss = at(loss, tStory + 1200, from, tStory + 400);
  const tW = watchers.map((w) => at(w, tLoss + 2500, from, tLoss + 400));
  const tSee = watchers.map((w, i) => at(w.see, tW[i] + 400, from, tW[i] + 200));
  if (ms < from || ms > to) return null;

  const slotX = (i: number) => Wl.x0 + i * (Wl.w + Wl.gap);
  const last = Wl.n - 1;
  const gapCx = slotX(last) + Wl.w / 2;
  const openK = k(tOpen, 260);
  const lossK = EASE(k(tLoss, 360));

  return (
    <AbsoluteFill>
      {/* the kicker names the wall */}
      <div style={{ position: "absolute", left: 0, right: 0, top: F.kicker.y, textAlign: "center", opacity: k(tStory, 260), fontFamily: DISPLAY, fontWeight: 700, fontSize: TYPE.label, letterSpacing: TRACK.kicker, color: inkA(0.7) }}>
        {story.label}
      </div>

      {/* the wall: solid blocks drop in left to right; the last slot stays open */}
      {Array.from({ length: last }).map((_, i) => {
        const q = k(tBuild + i * 110, 260);
        return q > 0 ? (
          <div key={i} style={{ position: "absolute", left: slotX(i), top: Wl.y, width: Wl.w, height: Wl.h, borderRadius: 10, background: INK,
            opacity: clamp01(q * 3), transform: `translateY(${(1 - BACK(q)) * -90}px)` }} />
        ) : null;
      })}
      {openK > 0 ? (
        <>
          <DashBox r={{ x: slotX(last), y: Wl.y, w: Wl.w, h: Wl.h }} color={COLORS.accent} radius={10} sw={7} dash="16 12" opacity={clamp01(openK * 3)} />
          {lossK > 0 ? <div style={{ position: "absolute", left: slotX(last), top: Wl.y, width: Wl.w, height: Wl.h, borderRadius: 10, background: COLORS.accent,
            transformOrigin: "50% 100%", transform: `scaleY(${lossK})` }} /> : null}
          <div style={{ position: "absolute", left: gapCx - 200, width: 400, top: F.label.y, textAlign: "center", opacity: clamp01(lossK * 3),
            fontFamily: DISPLAY, fontWeight: 700, fontSize: TYPE.label, letterSpacing: TRACK.kicker, color: COLORS.accent, whiteSpace: "nowrap" }}>
            {loss.label}
          </div>
        </>
      ) : null}

      {/* the line, written as spoken; retires when the watchers arrive */}
      <Phrase from={tLoss} to={tW[0] - 40} line={line.text} top={F.lineTop} size={72} color={INK} emphasize={line.emphasize} empColor={COLORS.accent} restColor={INK} />

      {/* the watchers: an eye, then a dashed line of sight into the gap */}
      {watchers.map((w, i) => {
        const eK = EASE(k(tW[i], 420));
        const sK = EASE_IO(k(tSee[i], 480));
        const ex = F.eyes.xs[i];
        const y0 = F.eyes.y - 70;
        const y1 = Wl.y + Wl.h + 70; // stops under the label
        return eK > 0 ? (
          <React.Fragment key={i}>
            {sK > 0 ? (
              <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
                <line x1={ex} y1={y0} x2={lerp(ex, gapCx, sK)} y2={lerp(y0, y1, sK)} stroke={COLORS.accent} strokeWidth={7} strokeDasharray="16 12" strokeLinecap="round" />
              </svg>
            ) : null}
            <Eye cx={ex} cy={F.eyes.y} k={eK} color={INK} />
            <div style={{ position: "absolute", left: ex - 200, width: 400, top: F.eyes.y + 76, textAlign: "center", opacity: clamp01(eK * 2),
              fontFamily: DISPLAY, fontWeight: 700, fontSize: 64, letterSpacing: TRACK.headline, color: INK }}>
              {w.label}
            </div>
          </React.Fragment>
        ) : null;
      })}
    </AbsoluteFill>
  );
};
