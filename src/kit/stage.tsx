// ─────────────────────────────────────────────────────────────────────────
// KIT · stage — THE PRICE PINNED TO THE BOTTOM RUNG. Added on the Novartis ×
// BoomRay long-form, 2026-09-26.
//
// For a deal whose whole point is WHERE on the development ladder the money
// landed: "$900M for a PRECLINICAL asset". Typesetting "preclinical" next to a
// price says it; this block shows it. A development track (Preclinical ->
// Phase 1 -> 2 -> 3 -> Patients) stands on the left; the price is a flag
// pinned to the lowest rung, and everything the asset has NOT reached stays
// visibly empty above it.
//
// A SECTION-LENGTH SPINE (block-kit 2026-08-06): one object across ~20s and a
// section boundary. It assembles (buyer, price, asset), is interrogated (the
// distance to patients, three undisclosed facts), then performs (the human-
// trial gate the asset sits below).
//
// Vocabulary (2026-08-22): the track above the marker is DASHED = not reached.
// The three undisclosed facts are DASHED EMPTY SLOTS = never disclosed — the
// absence is the graphic, no "?" and no invented values. The gate is SOLID:
// it is a real boundary, not an unknown.
//
// One emphasis: the price and its pin (useAccent). Everything else is ink.
//
// ⚠️ Portrait only. The geometry is laid out against the 9:16 card
// (LAYOUT.card, content band ~150-1632, key text above 1632). Landscape would
// need its own layout.
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, Easing, interpolate, useCurrentFrame } from "remotion";
import { CLAMP, clamp01, COLORS, cue, DISPLAY, inkA, TRACK, useAccent, useMs, usePop, useStamp } from "./core";
import { TYPE } from "../style";

const EASE = Easing.out(Easing.cubic);
const prog = (ms: number, at: number, dur: number) => clamp01(interpolate(ms, [at, at + dur], [0, 1], { ...CLAMP, easing: EASE }));

// ── geometry, exported so a later callback can redraw the SAME track ──────────
export const STAGE = {
  trackX: 340,
  labelRight: 300, // rung labels right-align here (left of the track)
  colX: 430, // the right-hand content column
  colRight: 1000,
  bracketX: 388,
  rungs: [
    { label: "Patients", y: 330 },
    { label: "Phase 3", y: 573 },
    { label: "Phase 2", y: 816 },
    { label: "Phase 1", y: 1060 },
    { label: "Preclinical", y: 1330 },
  ],
};
const Y_TOP = STAGE.rungs[0].y;
const Y_PRE = STAGE.rungs[STAGE.rungs.length - 1].y;
const Y_GATE = STAGE.rungs[3].y;

/** A timed text element (own component so the hook is not called in a .map). */
const PopText: React.FC<{ at: number; style: React.CSSProperties; children: React.ReactNode; rise?: number }> = ({ at, style, children, rise = 16 }) => {
  const p = usePop(at, { rise });
  return <div style={{ position: "absolute", ...style, ...p }}>{children}</div>;
};

/** An undisclosed fact: label + a dashed empty slot that draws in just after it. */
const EmptySlot: React.FC<{ label: string; at: number; y: number }> = ({ label, at, y }) => {
  const ms = useMs();
  const lp = usePop(at, { rise: 14 });
  const box = prog(ms, at + 180, 420);
  const w = STAGE.colRight - 750; // "Indication" at 48px ≈ 290px from colX 430 → ends ~720
  return (
    <>
      <div style={{ position: "absolute", left: STAGE.colX, top: y, height: 72, display: "flex", alignItems: "center", ...lp }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 48, letterSpacing: TRACK.headline, color: COLORS.ink }}>{label}</div>
      </div>
      <svg style={{ position: "absolute", left: 750, top: y, overflow: "visible" }} width={w} height={72}>
        <rect x={2} y={2} width={Math.max(0, (w - 4) * box)} height={68} rx={10} fill="none"
          stroke={inkA(0.45)} strokeWidth={3} strokeDasharray="12 10" opacity={box > 0 ? 1 : 0} />
      </svg>
    </>
  );
};

export const PinnedPrice: React.FC<{
  from: number;
  to: number;
  buyer: { label: string; word: string };
  price: { label: string; word: string };
  asset: { label: string; word: string };
  origin: { sub: string; subWord: string; name: string; nameWord: string };
  /** the track draws up from the pin on this word */
  trackCue: string;
  /** the section-2 interrogation */
  distance: { lightCue: string; label: string; labelCue: string; sub: string; subCue: string };
  slots: { label: string; phrase: string }[];
  gate: { drawCue: string; label: string; labelCue: string };
}> = ({ from, to, buyer, price, asset, origin, trackCue, distance, slots, gate }) => {
  const ms = useMs();
  const frame = useCurrentFrame();
  const acc = useAccent();
  const vis = clamp01(interpolate(ms, [from, from + 250, to - 300, to], [0, 1, 1, 0], CLAMP));

  // cues — every one scoped after `from` so an earlier repeat can't grab it
  const tBuyer = cue(buyer.word, from + 400, from);
  const tPrice = cue(price.word, tBuyer + 800, from);
  const tTrack = cue(trackCue, tPrice + 800, from);
  const tAsset = cue(asset.word, tTrack + 700, from);
  const tSub = cue(origin.subWord, tAsset + 1200, from);
  const tName = cue(origin.nameWord, tSub + 1500, from);
  const tLight = cue(distance.lightCue, tName + 1500, tName);
  const tYears = cue(distance.labelCue, tLight + 900, tName);
  const tPatient = cue(distance.subCue, tYears + 1100, tName);
  const tSlots = slots.map((s, i) => cue(s.phrase, tPatient + 1800 + i * 1400, tPatient));
  const tGate = cue(gate.drawCue, tSlots[tSlots.length - 1] + 3000, tSlots[0]);
  const tGateLbl = cue(gate.labelCue, tGate + 1100, tGate);

  // the track draws UP from the pin
  const draw = prog(ms, tTrack, 1000);
  const yHead = Y_PRE - (Y_PRE - Y_TOP) * draw;
  const pin = useStamp(tTrack, { from: 1.6 });
  const ring = ms >= tTrack ? ((frame % 48) / 48) : 0;
  const priceStamp = useStamp(tPrice);

  // §2: the preclinical rung lights, the distance brackets up to patients
  const light = prog(ms, tLight, 300);
  const br = prog(ms, tYears, 800);
  const patientsOn = prog(ms, tPatient, 300);
  const gateW = prog(ms, tGate, 700);

  const inkLine = inkA(0.85);
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {/* the track: dashed = not reached */}
        {draw > 0 ? (
          <line x1={STAGE.trackX} y1={Y_PRE} x2={STAGE.trackX} y2={yHead} stroke={inkA(0.4)} strokeWidth={6} strokeDasharray="16 12" />
        ) : null}
        {/* rung ticks, each as the line passes it */}
        {STAGE.rungs.map((r) => {
          const on = yHead <= r.y + 1 && draw > 0 ? 1 : 0;
          const isPatients = r.y === Y_TOP;
          return (
            <line key={r.label} x1={STAGE.trackX - 18} x2={STAGE.trackX + 18} y1={r.y} y2={r.y}
              stroke={isPatients && patientsOn > 0 ? COLORS.ink : inkA(0.5)} strokeWidth={isPatients ? 6 : 4} opacity={on} />
          );
        })}
        {/* the distance: a solid bracket from the pin to patients */}
        {br > 0 ? (
          <g stroke={COLORS.ink} strokeWidth={5} fill="none">
            <line x1={STAGE.bracketX} y1={Y_PRE - 40} x2={STAGE.bracketX} y2={Y_PRE - 40 - (Y_PRE - 40 - Y_TOP) * br} />
            <line x1={STAGE.bracketX - 14} x2={STAGE.bracketX + 14} y1={Y_PRE - 40} y2={Y_PRE - 40} />
            {br >= 1 ? <line x1={STAGE.bracketX - 14} x2={STAGE.bracketX + 14} y1={Y_TOP} y2={Y_TOP} /> : null}
          </g>
        ) : null}
        {/* the human-trial gate: SOLID, a real boundary the pin sits below */}
        {gateW > 0 ? (
          <line x1={STAGE.trackX - 24} y1={Y_GATE} x2={STAGE.trackX - 24 + (STAGE.colRight - STAGE.trackX + 24) * gateW} y2={Y_GATE}
            stroke={inkLine} strokeWidth={8} strokeLinecap="square" />
        ) : null}
        {/* the pin */}
        {ms >= tTrack ? (
          <g>
            <circle cx={STAGE.trackX} cy={Y_PRE} r={24 + ring * 40} fill="none" stroke={acc} strokeWidth={3} opacity={(1 - ring) * 0.5} />
            <g style={{ transformOrigin: `${STAGE.trackX}px ${Y_PRE}px`, ...pin }}>
              <circle cx={STAGE.trackX} cy={Y_PRE} r={24} fill={acc} />
            </g>
          </g>
        ) : null}
      </svg>

      {/* rung labels — left of the track */}
      {STAGE.rungs.map((r, i) => {
        const passAt = tTrack + 1000 * ((Y_PRE - r.y) / (Y_PRE - Y_TOP));
        const isPre = i === STAGE.rungs.length - 1;
        const isPat = i === 0;
        const strong = (isPre && light > 0) || (isPat && patientsOn > 0);
        return (
          <PopText key={r.label} at={passAt} rise={8}
            style={{ left: 0, width: STAGE.labelRight, top: r.y - 22, textAlign: "right" }}>
            <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: TYPE.labelSm, letterSpacing: TRACK.nav,
              color: strong ? COLORS.ink : COLORS.grayText }}>{r.label}</div>
          </PopText>
        );
      })}

      {/* §2 · the distance */}
      <PopText at={tYears} style={{ left: STAGE.colX, top: Y_TOP - 70 }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 96, letterSpacing: TRACK.display, color: COLORS.ink, lineHeight: 1 }}>{distance.label}</div>
      </PopText>
      <PopText at={tPatient} style={{ left: STAGE.colX, top: Y_TOP + 42 }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: TYPE.label, letterSpacing: TRACK.nav, color: COLORS.grayText }}>{distance.sub}</div>
      </PopText>

      {/* §2 · what was never disclosed */}
      {slots.map((s, i) => <EmptySlot key={s.label} label={s.label} at={tSlots[i]} y={560 + i * 100} />)}

      {/* §2 · the gate label */}
      <PopText at={tGateLbl} style={{ left: STAGE.colX, top: Y_GATE + 22 }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: TYPE.label, letterSpacing: TRACK.nav, color: COLORS.ink }}>{gate.label}</div>
      </PopText>

      {/* §1 · the flag at the pin: buyer, price, asset, origin */}
      <PopText at={tBuyer} style={{ left: STAGE.colX, top: Y_PRE - 140 }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 60, letterSpacing: TRACK.headline, color: COLORS.ink, lineHeight: 1 }}>{buyer.label}</div>
      </PopText>
      <div style={{ position: "absolute", left: STAGE.colX, top: Y_PRE - 66, transformOrigin: "left center", ...priceStamp }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 116, letterSpacing: TRACK.display, color: acc, lineHeight: 1 }}>{price.label}</div>
      </div>
      <PopText at={tAsset} style={{ left: STAGE.colX, top: Y_PRE + 74 }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 52, letterSpacing: TRACK.headline, color: COLORS.ink, lineHeight: 1 }}>{asset.label}</div>
      </PopText>
      <PopText at={tSub} style={{ left: STAGE.colX, top: Y_PRE + 144 }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: TYPE.labelSm, letterSpacing: TRACK.nav, color: COLORS.grayText }}>{origin.sub}</div>
      </PopText>
      <PopText at={tName} style={{ left: STAGE.colX, top: Y_PRE + 188 }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 52, letterSpacing: TRACK.headline, color: COLORS.ink, lineHeight: 1 }}>{origin.name}</div>
      </PopText>
    </AbsoluteFill>
  );
};

// ─────────────────────────────────────────────────────────────────────────
// TooLate — the §4 CALLBACK of PinnedPrice. Redraws the SAME track from the
// same STAGE constants (block-kit 2026-08-22: a spine does not have to stay on
// screen; it can leave and come back), already settled: rungs labelled, the
// buyer's pin planted at the bottom rung with its flag.
//
// Then the alternative is PERFORMED: a hollow "waiting" marker climbs the
// track from the pin toward the Phase 1 readout while "waiting for a Phase 1
// readout" is voiced — the time a patient buyer would spend. When it arrives
// the verdict lands: its label is struck, the marker dims, and "Too late"
// stamps. The pin never moved; it was there first.
//
// One emphasis moves here: the pin and flag are INK this time (the price was
// the emphasis in §1), so the one red is the verdict.
// ─────────────────────────────────────────────────────────────────────────
export const TooLate: React.FC<{
  from: number;
  to: number;
  flag: string;
  kicker: { label: string; word: string };
  wait: { lead: string; leadWord: string; tail: string; tailWord: string; arriveWord: string };
  hedge: { label: string; word: string };
  verdict: { label: string; word: string };
}> = ({ from, to, flag, kicker, wait, hedge, verdict }) => {
  const ms = useMs();
  const frame = useCurrentFrame();
  const acc = useAccent();
  const vis = clamp01(interpolate(ms, [from, from + 250, to - 300, to], [0, 1, 1, 0], CLAMP));

  const tK = cue(kicker.word, from + 300, from);
  const tW = cue(wait.leadWord, tK + 400, tK);
  const tT = cue(wait.tailWord, tW + 1000, tW);
  const tArrive = cue(wait.arriveWord, tT + 700, tT);
  const tH = cue(hedge.word, tArrive + 600, tArrive);
  const tV = cue(verdict.word, tH + 1200, tH);

  const Y_P1 = STAGE.rungs[3].y;
  // the waiting marker climbs from the pin to Phase 1 across the spoken phrase,
  // arriving as "readout" lands
  const climb = clamp01(interpolate(ms, [tW, tArrive + 250], [0, 1], { ...CLAMP, easing: Easing.inOut(Easing.cubic) }));
  const yWait = Y_PRE - (Y_PRE - Y_P1) * climb;
  const waitOn = prog(ms, tW, 250);
  const dead = prog(ms, tV, 400);
  const strike = prog(ms, tV + 80, 450);
  const verdictStamp = useStamp(tV);
  const ring = (frame % 48) / 48;

  const leadP = usePop(tW, { rise: 12 });
  const tailP = usePop(tT, { rise: 12 });

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <line x1={STAGE.trackX} y1={Y_PRE} x2={STAGE.trackX} y2={Y_TOP} stroke={inkA(0.4)} strokeWidth={6} strokeDasharray="16 12" />
        {STAGE.rungs.map((r) => (
          <line key={r.label} x1={STAGE.trackX - 18} x2={STAGE.trackX + 18} y1={r.y} y2={r.y}
            stroke={r.y === Y_P1 && ms >= tT ? COLORS.ink : inkA(0.5)} strokeWidth={r.y === Y_P1 && ms >= tT ? 6 : 4} />
        ))}
        {/* the planted pin — ink this time, and still pulsing: it holds */}
        <circle cx={STAGE.trackX} cy={Y_PRE} r={24 + ring * 40} fill="none" stroke={COLORS.ink} strokeWidth={3} opacity={(1 - ring) * 0.35} />
        <circle cx={STAGE.trackX} cy={Y_PRE} r={24} fill={COLORS.ink} />
        {/* the waiting marker: hollow, climbing */}
        {waitOn > 0 ? (
          <circle cx={STAGE.trackX} cy={yWait} r={22} fill={COLORS.paper} stroke={COLORS.ink} strokeWidth={5}
            strokeDasharray="8 6" opacity={waitOn * (1 - 0.65 * dead)} />
        ) : null}
      </svg>

      {STAGE.rungs.map((r, i) => (
        <div key={r.label} style={{ position: "absolute", left: 0, width: STAGE.labelRight, top: r.y - 22, textAlign: "right",
          fontFamily: DISPLAY, fontWeight: 700, fontSize: TYPE.labelSm, letterSpacing: TRACK.nav,
          color: (i === 3 && ms >= tT) || i === STAGE.rungs.length - 1 ? COLORS.ink : COLORS.grayText }}>{r.label}</div>
      ))}

      {/* kicker */}
      <PopText at={tK} style={{ left: STAGE.colX, top: 190 }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: TYPE.label, letterSpacing: TRACK.nav, color: COLORS.grayText }}>{kicker.label}</div>
      </PopText>

      {/* the hedge + the verdict, in the empty stretch above Phase 1 */}
      <PopText at={tH} style={{ left: STAGE.colX, top: 600 }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: TYPE.label, letterSpacing: TRACK.nav, color: COLORS.grayText }}>{hedge.label}</div>
      </PopText>
      <div style={{ position: "absolute", left: STAGE.colX, top: 660, transformOrigin: "left center", ...verdictStamp }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 112, letterSpacing: TRACK.display, color: acc, lineHeight: 1 }}>{verdict.label}</div>
      </div>

      {/* the wait, labelled at the rung it is waiting for; struck on the verdict */}
      <div style={{ position: "absolute", left: STAGE.colX, top: Y_P1 - 64, opacity: 1 - 0.55 * dead }}>
        <div style={{ ...leadP, fontFamily: DISPLAY, fontWeight: 700, fontSize: 52, letterSpacing: TRACK.headline, color: COLORS.ink, lineHeight: 1.12 }}>{wait.lead}</div>
        <div style={{ ...tailP, fontFamily: DISPLAY, fontWeight: 700, fontSize: 52, letterSpacing: TRACK.headline, color: COLORS.ink, lineHeight: 1.12 }}>{wait.tail}</div>
        {/* one strike per row, through each line's x-height (52px × 1.12 rows) */}
        <div style={{ position: "absolute", left: -8, top: 31, height: 6, width: 425 * strike, background: COLORS.ink }} />
        <div style={{ position: "absolute", left: -8, top: 89, height: 6, width: 490 * strike, background: COLORS.ink }} />
      </div>

      {/* the flag at the pin — settled from the start */}
      <div style={{ position: "absolute", left: STAGE.colX, top: Y_PRE - 30, fontFamily: DISPLAY, fontWeight: 700, fontSize: 56,
        letterSpacing: TRACK.headline, color: COLORS.ink, lineHeight: 1 }}>{flag}</div>
    </AbsoluteFill>
  );
};
