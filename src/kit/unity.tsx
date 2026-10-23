// ─────────────────────────────────────────────────────────────────────────
// KIT · unity — A TRIAL STOPPED SHORT OF ITS LINE. Added on the argenx
// Phase 3 UNITY long-form, 2026-10-10 (VERTICAL). Built under the one-mover
// rule (09-30) and the frame budget (10-05): each cue gets ONE motion,
// anything landed goes still, a finished idea retires.
//
// `StopHook` (red, the hook): "October 8th. argenx stopped Phase 3 UNITY…
// for futility." A day leaf flips in alone, docks beside the company's name,
// the trial's plate lands, a run starts along a rail toward a hollow finish,
// and on "futility" an ink bar slams down in front of it.
//
// `CallMiss` (ink, over a FootageScrim): "An independent data monitoring
// committee called it. Efgartigimod SC in Sjögren's disease… could not meet
// its primary endpoint on ClinESSDAI at Week 48." The committee's plate is
// written per line and stamped; it retires, the drug is named, and a column
// rises and stops SHORT of a dashed line that is only drawn afterwards. The
// script gives no figure, so the chart has no scale and no number.
//
// `HeldDidnt` (white card): "Safety held. Efficacy didn't." Two plates; the
// second drops out of level and turns red on "didn't".
//
// Every onset is a spoken word with an optional ms pin, clamped monotonic.
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, Easing, interpolate, interpolateColors } from "remotion";
import { CLAMP, clamp01, COLORS, DISPLAY, INK_SUB, TRACK, useMs } from "./core";
import { TYPE } from "../style";
import { at, lerp, useK, type Cued, type Win } from "./elora";

const EASE = Easing.out(Easing.cubic);
const EASE_IO = Easing.inOut(Easing.cubic);
const BACK = Easing.out(Easing.back(1.6));
const FALL = Easing.in(Easing.quad);

type Rect = { x: number; y: number; w: number; h: number };
const mix = (a: Rect, b: Rect, t: number): Rect => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), w: lerp(a.w, b.w, t), h: lerp(a.h, b.h, t) });

/** A day leaf: flips down from its top edge. */
export const DayLeaf: React.FC<{ rect: Rect; k: number; month: string; day: string }> = ({ rect, k, month, day }) => {
  if (k <= 0) return null;
  const s = rect.w / 180;
  return (
    <div style={{ position: "absolute", left: rect.x, top: rect.y, width: rect.w, height: rect.h, perspective: 900 }}>
      <div style={{ width: "100%", height: "100%", borderRadius: 22 * s, overflow: "hidden", background: COLORS.paper, opacity: clamp01(k * 4), transformOrigin: "50% 0%", transform: `rotateX(${lerp(-88, 0, BACK(k))}deg)`,
        fontFamily: DISPLAY, fontWeight: 700, textAlign: "center", lineHeight: 1 }}>
        <div style={{ height: 58 * s, background: COLORS.ink, border: `${4 * s}px solid ${COLORS.paper}`, borderRadius: `${22 * s}px ${22 * s}px 0 0`, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.paper, fontSize: 36 * s, letterSpacing: TRACK.nav }}>
          {month}
        </div>
        <div style={{ height: rect.h - 58 * s, display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.ink, fontSize: 116 * s, letterSpacing: TRACK.display }}>{day}</div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// StopHook — the hook (red world)
// ══════════════════════════════════════════════════════════════════════════
export const STOP = {
  leafBig: { x: 360, y: 560, w: 360, h: 400 }, // alone in the frame
  leafHead: { x: 110, y: 215, w: 150, h: 166 }, // docked beside the name
  name: { x: 300, top: 196, size: 124 },
  verb: { top: 322, size: 64 },
  plate: { x: 140, y: 560, w: 800, h: 320 },
  rail: { y: 1150, x0: 150, x1: 930, stopX: 640 },
  stamp: { y: 1360, w: 600, h: 124 },
};

export const StopHook: React.FC<Win & {
  date: { month: string; day: string } & Cued; // the leaf flips in
  name: { text: string } & Cued; // the leaf docks, the name lands beside it
  verb: { text: string } & Cued;
  plate: { label: string } & Cued; // the trial's plate, with its phase
  trial: { name: string } & Cued; // the trial is named and the run starts
  stop: { label: string } & Cued; // the bar slams, the stamp lands
}> = ({ from, to, date, name, verb, plate, trial, stop }) => {
  const ms = useMs();
  const k = useK();
  const W = COLORS.paper;
  const INK = COLORS.ink;
  const S = STOP;

  const tDate = at(date, from + 140, from);
  const tName = at(name, tDate + 1400, from, tDate + 500);
  const tVerb = at(verb, tName + 500, from, tName + 250);
  const tPlate = at(plate, tVerb + 450, from, tVerb + 250);
  const tTrial = at(trial, tPlate + 500, from, tPlate + 250);
  const tStop = at(stop, tTrial + 1200, from, tTrial + 700);

  if (ms < tDate - 40 || ms > to) return null;

  const leaf = mix(S.leafBig, S.leafHead, EASE_IO(k(tName, 380)));
  const nameO = k(tName + 200, 140);
  const verbO = k(tVerb, 140);
  const plateO = k(tPlate, 120);
  const plateS = interpolate(ms, [tPlate, tPlate + 280], [1.1, 1], { ...CLAMP, easing: EASE });
  const trialK = EASE(k(tTrial, 260));

  // the rail: drawn with the trial's name, then one run that the bar halts
  const R = S.rail;
  const railK = EASE(k(tTrial, 300));
  const runK = clamp01(interpolate(ms, [tTrial + 300, tStop], [0, 1], CLAMP)); // linear: it is stopped, it does not slow
  const barK = EASE(k(tStop, 120));
  const stampO = k(tStop + 160, 100);
  const stampS = interpolate(ms, [tStop + 160, tStop + 420], [1.7, 1], { ...CLAMP, easing: EASE });

  return (
    <AbsoluteFill>
      <DayLeaf rect={leaf} k={k(tDate, 380)} month={date.month} day={date.day} />
      <div style={{ position: "absolute", left: S.name.x, top: S.name.top, opacity: nameO, transform: `translateX(${(1 - nameO) * 24}px)`, fontFamily: DISPLAY, fontWeight: 700, fontSize: S.name.size, lineHeight: 1, letterSpacing: TRACK.display, color: W, whiteSpace: "nowrap" }}>
        {name.text}
      </div>
      <div style={{ position: "absolute", left: S.name.x + 4, top: S.verb.top, opacity: verbO, transform: `translateY(${(1 - verbO) * 14}px)`, fontFamily: DISPLAY, fontWeight: 400, fontSize: S.verb.size, lineHeight: 1, letterSpacing: TRACK.headline, color: W, whiteSpace: "nowrap" }}>
        {verb.text}
      </div>

      {/* the trial's plate */}
      {plateO > 0 ? (
        <div style={{ position: "absolute", left: S.plate.x, top: S.plate.y, width: S.plate.w, height: S.plate.h, borderRadius: 30, background: W, opacity: plateO, transform: `scale(${plateS})`,
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, color: INK, lineHeight: 1.02, whiteSpace: "nowrap" }}>
          <div style={{ fontWeight: 400, fontSize: 72, letterSpacing: TRACK.headline }}>{plate.label}</div>
          <div style={{ fontWeight: 700, fontSize: 176, letterSpacing: TRACK.display, clipPath: `inset(-10% ${(1 - trialK) * 100}% -10% 0)` }}>{trial.name}</div>
        </div>
      ) : null}

      {/* the rail: a faint course to a hollow finish, one solid run, the bar */}
      {railK > 0 ? (
        <>
          <div style={{ position: "absolute", left: R.x0, top: R.y - 3, width: (R.x1 - 44 - R.x0) * railK, height: 6, borderRadius: 3, background: "rgba(255,255,255,0.45)" }} />
          <div style={{ position: "absolute", left: R.x1 - 44, top: R.y - 22, width: 44, height: 44, boxSizing: "border-box", borderRadius: 22, border: `6px solid rgba(255,255,255,0.7)`, opacity: clamp01((railK - 0.8) * 5) }} />
          <div style={{ position: "absolute", left: R.x0 - 16, top: R.y - 16, width: 32, height: 32, borderRadius: 16, background: W, opacity: clamp01(railK * 4) }} />
          <div style={{ position: "absolute", left: R.x0, top: R.y - 8, width: (R.stopX - R.x0) * runK, height: 16, borderRadius: 8, background: W }} />
        </>
      ) : null}
      {barK > 0 ? <div style={{ position: "absolute", left: R.stopX, top: R.y - 90, width: 24, height: 180 * barK, borderRadius: 6, background: INK }} /> : null}
      {stampO > 0 ? (
        <div style={{ position: "absolute", left: 540 - S.stamp.w / 2, top: S.stamp.y - S.stamp.h / 2, width: S.stamp.w, height: S.stamp.h, borderRadius: 20, background: INK, opacity: stampO, transform: `rotate(-6deg) scale(${stampS})`,
          display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: 80, letterSpacing: TRACK.headline, color: W, whiteSpace: "nowrap" }}>
          {stop.label}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// CallMiss — who called it, then what was missed (ink world, over a FootageScrim)
// ══════════════════════════════════════════════════════════════════════════
export const MISS = {
  board: { x: 140, y: 610, w: 800, h: 430 },
  stampY: 1040,
  head: { x: 140, y: 210, w: 800, h: 150 },
  inY: 396,
  lineY: 770, // the endpoint
  col: { x: 440, w: 200, top: 990 }, // stops short of lineY
  baseY: 1380,
  x: [140, 940] as [number, number],
};

/** The endpoint chart, shared with the callback in §4 (`reach` = the column's top). */
export const EndpointChart: React.FC<{
  baseK: number; // the baseline draws
  riseK: number; // the column rises
  lineK: number; // the dashed endpoint draws
  top: number; // where the column stops
  lineColor: string;
  color: string;
  labels: { left?: { text: string; o: number }; right?: { text: string; o: number }; foot?: { text: string; o: number } };
  sub: string;
}> = ({ baseK, riseK, lineK, top, lineColor, color, labels, sub }) => {
  const M = MISS;
  const [x0, x1] = M.x;
  const label: React.CSSProperties = { position: "absolute", fontFamily: DISPLAY, fontWeight: 700, fontSize: TYPE.label, letterSpacing: TRACK.nav, lineHeight: 1, whiteSpace: "nowrap" };
  return (
    <>
      {baseK > 0 ? <div style={{ position: "absolute", left: x0, top: M.baseY - 3, width: (x1 - x0) * baseK, height: 6, borderRadius: 3, background: color }} /> : null}
      {riseK > 0 ? <div style={{ position: "absolute", left: M.col.x, top: lerp(M.baseY, top, riseK), width: M.col.w, height: (M.baseY - top) * riseK, borderRadius: "14px 14px 0 0", background: color }} /> : null}
      {lineK > 0 ? (
        <svg width={x1 - x0} height={12} style={{ position: "absolute", left: x0, top: M.lineY - 6, clipPath: `inset(0 ${(1 - lineK) * 100}% 0 0)` }}>
          <line x1={0} y1={6} x2={x1 - x0} y2={6} stroke={lineColor} strokeWidth={10} strokeDasharray="34 20" />
        </svg>
      ) : null}
      {labels.left ? <div style={{ ...label, left: x0, top: M.lineY - 66, color, opacity: labels.left.o }}>{labels.left.text}</div> : null}
      {labels.right ? <div style={{ ...label, right: 1080 - x1, top: M.lineY - 66, color: sub, opacity: labels.right.o }}>{labels.right.text}</div> : null}
      {labels.foot ? <div style={{ ...label, left: M.col.x - 100, width: M.col.w + 200, textAlign: "center", top: M.baseY + 28, color, opacity: labels.foot.o }}>{labels.foot.text}</div> : null}
    </>
  );
};

export const CallMiss: React.FC<Win & {
  board: Cued; // the committee's plate lands
  rows: ({ text: string; strong?: boolean } & Cued)[]; // its lines, one per cue
  called: { label: string } & Cued; // the stamp
  drug: { name: string } & Cued; // the committee retires; the drug's plate
  form: { text: string } & Cued; // " SC"
  disease: { text: string } & Cued;
  base: Cued; // the baseline draws
  rise: Cued; // the column rises and stops short
  endpoint: { label: string } & Cued; // the dashed line, drawn above it
  scale: { label: string } & Cued;
  week: { label: string } & Cued;
}> = ({ from, to, board, rows, called, drug, form, disease, base, rise, endpoint, scale, week }) => {
  const ms = useMs();
  const k = useK();
  const W = COLORS.paper;
  const INK = COLORS.ink;
  const R = COLORS.accent;
  const M = MISS;

  const tBoard = at(board, from + 500, from);
  const tRows = rows.map((r, i) => at(r, tBoard + 200 + i * 600, from, tBoard + 100));
  const tCalled = at(called, tRows[rows.length - 1] + 600, from, tRows[rows.length - 1] + 250);
  const tDrug = at(drug, tCalled + 900, from, tCalled + 500);
  const tForm = at(form, tDrug + 800, from, tDrug + 300);
  const tDisease = at(disease, tForm + 400, from, tForm + 200);
  const tBase = at(base, tDisease + 1500, from, tDisease + 400);
  const tRise = at(rise, tBase + 150, from, tBase + 100);
  const tEndpoint = at(endpoint, tRise + 800, from, tRise + 500);
  const tScale = at(scale, tEndpoint + 1000, from, tEndpoint + 400);
  const tWeek = at(week, tScale + 1200, from, tScale + 400);

  if (ms < tBoard - 40 || ms > to) return null;

  // the committee: retires in the pause before the drug is named
  const aO = 1 - k(tDrug - 280, 220);
  const boardO = k(tBoard, 120);
  const boardS = interpolate(ms, [tBoard, tBoard + 280], [1.08, 1], { ...CLAMP, easing: EASE });
  const stampO = k(tCalled, 100);
  const stampS = interpolate(ms, [tCalled, tCalled + 260], [1.7, 1], { ...CLAMP, easing: EASE });

  const headO = k(tDrug, 120);
  const headS = interpolate(ms, [tDrug, tDrug + 280], [1.08, 1], { ...CLAMP, easing: EASE });
  const disO = k(tDisease, 150);

  return (
    <AbsoluteFill>
      {aO > 0 ? (
        <AbsoluteFill style={{ opacity: aO }}>
          <div style={{ position: "absolute", left: M.board.x, top: M.board.y, width: M.board.w, height: M.board.h, borderRadius: 30, background: W, opacity: boardO, transform: `scale(${boardS})`,
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingBottom: 30, boxSizing: "border-box", fontFamily: DISPLAY, color: INK, lineHeight: 1.08, whiteSpace: "nowrap" }}>
            {rows.map((r, i) => {
              const q = k(tRows[i], 140);
              return <div key={i} style={{ fontWeight: r.strong ? 700 : 400, fontSize: r.strong ? 128 : 70, letterSpacing: r.strong ? TRACK.display : TRACK.headline, opacity: q, transform: `translateY(${(1 - q) * 14}px)` }}>{r.text}</div>;
            })}
          </div>
          {stampO > 0 ? (
            <div style={{ position: "absolute", left: 540 - 220, top: M.stampY - 56, width: 440, height: 112, borderRadius: 20, background: R, opacity: stampO, transform: `rotate(-6deg) scale(${stampS})`,
              display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: 72, letterSpacing: TRACK.headline, color: W, whiteSpace: "nowrap" }}>
              {called.label}
            </div>
          ) : null}
        </AbsoluteFill>
      ) : null}

      {/* the drug, and the disease it was tried in */}
      {headO > 0 ? (
        <div style={{ position: "absolute", left: M.head.x, top: M.head.y, width: M.head.w, height: M.head.h, borderRadius: 30, background: W, opacity: headO, transform: `scale(${headS})`,
          display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: 84, letterSpacing: TRACK.headline, color: INK, whiteSpace: "nowrap" }}>
          {drug.name}
          <span style={{ opacity: k(tForm, 140), fontWeight: 400 }}>&nbsp;{form.text}</span>
        </div>
      ) : null}
      <div style={{ position: "absolute", left: 0, right: 0, top: M.inY, textAlign: "center", opacity: disO, transform: `translateY(${(1 - disO) * 14}px)`, fontFamily: DISPLAY, fontWeight: 700, fontSize: 62, lineHeight: 1, letterSpacing: TRACK.headline, color: W, whiteSpace: "nowrap" }}>
        {disease.text}
      </div>

      <EndpointChart
        baseK={EASE(k(tBase, 110))}
        riseK={EASE(k(tRise, Math.max(400, tEndpoint - tRise - 120)))}
        lineK={EASE(k(tEndpoint, 380))}
        top={M.col.top}
        lineColor={R}
        color={W}
        sub={INK_SUB}
        labels={{
          left: { text: endpoint.label, o: k(tEndpoint + 120, 150) },
          right: { text: scale.label, o: k(tScale, 150) },
          foot: { text: week.label, o: k(tWeek, 150) },
        }}
      />
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// HeldDidnt — two plates, one drops (white card)
// ══════════════════════════════════════════════════════════════════════════
export const HELD = {
  a: { x: 140, y: 620, w: 800, h: 260 },
  b: { x: 140, y: 960, w: 800, h: 260 },
};

export const HeldDidnt: React.FC<Win & {
  first: { name: string } & Cued;
  held: { text: string } & Cued;
  second: { name: string } & Cued;
  didnt: { text: string } & Cued; // the second plate drops out of level and turns red
}> = ({ from, to, first, held, second, didnt }) => {
  const ms = useMs();
  const k = useK();
  const W = COLORS.paper;

  const tFirst = at(first, from + 450, from);
  const tHeld = at(held, tFirst + 500, from, tFirst + 250);
  const tSecond = at(second, tHeld + 800, from, tHeld + 300);
  const tDidnt = at(didnt, tSecond + 700, from, tSecond + 300);

  if (ms < tFirst - 40 || ms > to) return null;

  const dropK = FALL(k(tDidnt, 240));
  const plate = (r: Rect, t: number, bg: string, extra: string): React.CSSProperties => ({
    position: "absolute", left: r.x, top: r.y, width: r.w, height: r.h, boxSizing: "border-box", padding: "0 48px", borderRadius: 30, background: bg, opacity: k(t, 120),
    transform: `${extra} scale(${interpolate(ms, [t, t + 280], [1.08, 1], { ...CLAMP, easing: EASE })})`,
    display: "flex", alignItems: "center", justifyContent: "space-between", fontFamily: DISPLAY, color: W, lineHeight: 1, whiteSpace: "nowrap",
  });
  const nameS: React.CSSProperties = { fontWeight: 700, fontSize: 104, letterSpacing: TRACK.display };
  const wordS: React.CSSProperties = { fontWeight: 400, fontSize: 76, letterSpacing: TRACK.headline };

  return (
    <AbsoluteFill>
      <div style={plate(HELD.a, tFirst, COLORS.ink, "")}>
        <div style={nameS}>{first.name}</div>
        <div style={{ ...wordS, opacity: k(tHeld, 140) }}>{held.text}</div>
      </div>
      <div style={{ ...plate(HELD.b, tSecond, interpolateColors(dropK, [0, 1], [COLORS.ink, COLORS.accent]), `translateY(${dropK * 64}px) rotate(${dropK * 4}deg)`), transformOrigin: "0% 50%" }}>
        <div style={nameS}>{second.name}</div>
        <div style={{ ...wordS, opacity: k(tDidnt, 140) }}>{didnt.text}</div>
      </div>
    </AbsoluteFill>
  );
};
