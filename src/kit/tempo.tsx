// ─────────────────────────────────────────────────────────────────────────
// KIT · tempo — THE EVIDENCE AS THREE TRIALS. Added on the AbbVie Juvmo
// long-form, 2026-10-04 (HORIZONTAL 16:9). One-mover rule: each cue gets ONE
// motion, and anything that has landed goes still.
//
// `TempoBoard` (ink): the program name slams, then docks into a header that
// holds for the whole section. Two trial cards rise; each ENROLLS a small crowd,
// is labelled, and gets a struck levodopa capsule (the §2 capsule, refused). On
// "In both" a bracket joins them, the tablet drops into each and a check stamps;
// the endpoint writes under the bracket. The third card rises with the tablet
// AND the capsule (now accepted), and a square on/off wave draws under them.
// No efficacy numbers are drawn for the first two trials: the script gives none.
//
// `OnTimeGain` (ink): a switch flips ON on the word, then two bars grow from one
// baseline at the SAME scale while their figures count as they are voiced. Only
// the gains are drawn (the script gives no baseline hours, and no difference).
//
// `SafetySheet` (ink): a white label sheet folds down, a caution mark stamps,
// four rows write on their words, and the footer names what the list is.
//
// Every onset is a spoken word with an optional ms pin, clamped monotonic.
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { CLAMP, clamp01, COLORS, cue, DISPLAY, inkA, INK_SUB, TRACK, useMs } from "./core";
import { TYPE } from "../style";
import { FlowLine } from "./flowline";
import { at, lerp, useK, type Cued, type Win } from "./elora";
import { Capsule } from "./juvmo";

const EASE = Easing.out(Easing.cubic);
const EASE_IO = Easing.inOut(Easing.cubic);
const BACK = Easing.out(Easing.back(1.7));

const W = 1920;
const H = 1080;

/** The Juvmo tablet (the §2 glyph): a red disc with a score line, centred on (0,0). */
const Tablet: React.FC<{ r: number }> = ({ r }) => (
  <g>
    <circle r={r} fill={COLORS.accent} />
    <line x1={-r * 0.62} y1={0} x2={r * 0.62} y2={0} stroke={COLORS.paper} strokeWidth={Math.max(4, r * 0.09)} strokeLinecap="round" />
  </g>
);

const txt = (size: number, color: string, weight = 700): React.CSSProperties => ({
  fontFamily: DISPLAY, fontWeight: weight, fontSize: size, letterSpacing: size >= 60 ? TRACK.display : TRACK.headline, color, lineHeight: 1.08, whiteSpace: "nowrap",
});

// ══════════════════════════════════════════════════════════════════════════
// TempoBoard — the program header + the three trial cards
// ══════════════════════════════════════════════════════════════════════════
export const TEMPO = {
  hero: { nameLeft: 498, nameCy: 560, nameSize: 264, chipLeft: 846, chipCy: 368, chipSize: 44 },
  head: { nameLeft: 110, nameCy: 112, nameSize: 72, chipLeft: 392, chipCy: 114, chipSize: 28 },
  card: { xs: [400, 960, 1520], top: 222, w: 500, h: 500 },
  bracketY: 748,
  endpointTop: 774,
};

export const TempoBoard: React.FC<Win & {
  kicker: { label: string } & Cued;
  phase: { label: string } & Cued;
  name: { label: string } & Cued; // the program name slams
  dock: Cued; // ...and docks into the section header (a pause)
  trials: { labels: string[] } & Cued; // the first two cards rise
  enrolled: Cued; // each crowd fills
  early: { label: string } & Cued;
  noLevo: { label: string } & Cued; // the struck capsule
  both: Cued; // the bracket joins the two cards
  drug: Cued; // the tablet drops into each
  improved: { label: string } & Cued; // the check stamps
  endpoint: { label: string } & Cued;
  versus: { label: string } & Cued;
  week: { label: string } & Cued;
  third: { label: string } & Cued; // the third card rises
  tab3: Cued;
  cap3: { label: string } & Cued; // the capsule joins the tablet
  wave: Cued; // the on/off wave draws
  motor: { label: string } & Cued;
  clear: Cued; // the cards retire; the header stays (a pause)
}> = ({ from, to, kicker, phase, name, dock, trials, enrolled, early, noLevo, both, drug, improved, endpoint, versus, week, third, tab3, cap3, wave, motor, clear }) => {
  const ms = useMs();
  const k = useK();
  const WH = COLORS.paper;
  const R = COLORS.accent;
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));

  const tKick = at(kicker, from, from);
  const tPhase = at(phase, tKick + 1200, from, tKick + 300);
  const tName = at(name, tPhase + 700, from, tPhase + 300);
  const tDock = at(dock, tName + 900, from, tName + 600);
  const tTrials = at(trials, tDock + 600, from, tDock + 450);
  const tEnr = at(enrolled, tTrials + 500, from, tTrials + 350);
  const tEarly = at(early, tEnr + 1200, from, tEnr + 500);
  const tNo = at(noLevo, tEarly + 1500, from, tEarly + 500);
  const tBoth = at(both, tNo + 1800, from, tNo + 700);
  const tDrug = at(drug, tBoth + 900, from, tBoth + 450);
  const tImp = at(improved, tDrug + 450, from, tDrug + 380);
  const tEnd = at(endpoint, tImp + 1900, from, tImp + 600);
  const tVs = at(versus, tEnd + 1300, from, tEnd + 500);
  const tWeek = at(week, tVs + 1300, from, tVs + 400);
  const tThird = at(third, tWeek + 1900, from, tWeek + 700);
  const tTab3 = at(tab3, tThird + 1000, from, tThird + 500);
  const tCap3 = at(cap3, tTab3 + 500, from, tTab3 + 380);
  const tWave = at(wave, tCap3 + 700, from, tCap3 + 500);
  const tMotor = at(motor, tWave + 900, from, tWave + 500);
  const tClear = at(clear, tMotor + 1100, from, tMotor + 700);

  // ── the header: one element each, hero seat -> header seat
  const dq = EASE_IO(k(tDock, 560));
  const A = TEMPO.hero;
  const Z = TEMPO.head;
  const nameO = k(tName, 110);
  const nameS = interpolate(ms, [tName, tName + 300], [1.2, 1], { ...CLAMP, easing: EASE });
  const nameSize = lerp(A.nameSize, Z.nameSize, dq);
  const chipSize = lerp(A.chipSize, Z.chipSize, dq);
  const chipO = k(tPhase, 140);
  const chipS = interpolate(ms, [tPhase, tPhase + 260], [1.25, 1], { ...CLAMP, easing: EASE });

  // ── the cards
  const C = TEMPO.card;
  const out = EASE(k(tClear, 300));
  const boardO = 1 - out;
  const rise = (t: number, i = 0) => BACK(k(t + i * 110, 420));
  const bracketQ = EASE_IO(k(tBoth, 480));
  const midX = (C.xs[0] + C.xs[1]) / 2;

  const cardShell = (i: number, q: number, children: React.ReactNode) => (
    <div key={i} style={{ position: "absolute", left: C.xs[i] - C.w / 2, top: C.top + (1 - q) * 60, width: C.w, height: C.h, opacity: clamp01(q * 1.6), boxSizing: "border-box",
      border: "4px solid rgba(255,255,255,0.5)", borderRadius: 26, background: COLORS.inkSoft }}>
      {children}
    </div>
  );

  // the crowd: 5 x 3 marks that fill in a wave
  const crowd = (t: number) => (
    <svg width={C.w} height={150} style={{ position: "absolute", left: 0, top: 104 }}>
      {Array.from({ length: 15 }, (_, n) => {
        const col = n % 5;
        const row = Math.floor(n / 5);
        const q = EASE(k(t + col * 70 + row * 40, 260));
        return q > 0 ? <circle key={n} cx={C.w / 2 + (col - 2) * 62} cy={26 + row * 48} r={16 * q} fill={WH} /> : null;
      })}
    </svg>
  );

  if (ms < tKick - 60) return null;
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {/* ── the header ── */}
      <div style={{ position: "absolute", left: 0, width: W, top: 250, textAlign: "center", opacity: k(tKick, 200) * (1 - dq), ...txt(40, INK_SUB) }}>{kicker.label}</div>
      <div style={{ position: "absolute", left: lerp(A.chipLeft, Z.chipLeft, dq), top: lerp(A.chipCy, Z.chipCy, dq), transform: `translateY(-50%) scale(${chipS})`, transformOrigin: "center", opacity: chipO,
        border: `${lerp(5, 3, dq)}px solid ${WH}`, borderRadius: 999, padding: `${chipSize * 0.2}px ${chipSize * 0.6}px`, ...txt(chipSize, WH), lineHeight: 1 }}>
        {phase.label}
      </div>
      <div style={{ position: "absolute", left: lerp(A.nameLeft, Z.nameLeft, dq), top: lerp(A.nameCy, Z.nameCy, dq), transform: `translateY(-50%) scale(${nameS})`, transformOrigin: "center", opacity: nameO, ...txt(nameSize, WH), lineHeight: 1 }}>
        {name.label}
      </div>

      {/* ── the three trials ── */}
      {ms >= tTrials - 20 && boardO > 0 ? (
        <div style={{ position: "absolute", inset: 0, opacity: boardO, transform: `translateY(${out * -30}px)` }}>
          {[0, 1].map((i) =>
            cardShell(i, rise(tTrials, i), (
              <>
                <div style={{ position: "absolute", left: 34, top: 28, ...txt(TYPE.label, INK_SUB) }}>{trials.labels[i]}</div>
                {/* the tablet drops into the card's corner */}
                <svg width={C.w} height={C.h} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
                  {k(tDrug + i * 110, 10) > 0 ? (
                    <g transform={`translate(${C.w - 64} ${58 - (1 - BACK(k(tDrug + i * 110, 380))) * 150})`} opacity={clamp01(k(tDrug + i * 110, 380) * 4)}><Tablet r={32} /></g>
                  ) : null}
                </svg>
                {crowd(tEnr + i * 110)}
                <div style={{ position: "absolute", left: 0, width: C.w, top: 270, textAlign: "center", opacity: k(tEarly + i * 110, 180), ...txt(42, WH) }}>{early.label}</div>
                {/* the capsule, refused */}
                <div style={{ position: "absolute", left: 0, width: C.w, top: 340, display: "flex", alignItems: "center", justifyContent: "center", gap: 18, opacity: k(tNo + i * 110, 180) }}>
                  <svg width={96} height={50} style={{ overflow: "visible", flex: "none" }}>
                    <g transform="translate(48 25)"><Capsule w={84} h={38} color={INK_SUB} back={COLORS.inkSoft} /></g>
                    <line x1={6} y1={46} x2={6 + 84 * EASE(k(tNo + i * 110 + 120, 260))} y2={46 - 42 * EASE(k(tNo + i * 110 + 120, 260))} stroke={WH} strokeWidth={7} strokeLinecap="round" />
                  </svg>
                  <span style={txt(TYPE.label, INK_SUB)}>{noLevo.label}</span>
                </div>
                {/* the result */}
                {k(tImp + i * 130, 10) > 0 ? (
                  <div style={{ position: "absolute", left: 0, width: C.w, top: 414, display: "flex", alignItems: "center", justifyContent: "center", gap: 16, opacity: k(tImp + i * 130, 110),
                    transform: `scale(${interpolate(ms, [tImp + i * 130, tImp + i * 130 + 280], [1.3, 1], { ...CLAMP, easing: EASE })})` }}>
                    <svg width={52} height={52} style={{ flex: "none" }}>
                      <circle cx={26} cy={26} r={26} fill={R} />
                      <path d="M 14 27 L 23 36 L 39 18" fill="none" stroke={WH} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    <span style={txt(34, WH)}>{improved.label}</span>
                  </div>
                ) : null}
              </>
            ))
          )}

          {/* "In both": one bracket under the two cards, then the endpoint under it */}
          <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
            {bracketQ > 0 ? (
              <path d={`M ${C.xs[0] - C.w / 2 + 20} ${TEMPO.bracketY - 14} V ${TEMPO.bracketY} H ${C.xs[1] + C.w / 2 - 20} V ${TEMPO.bracketY - 14}`} fill="none" stroke={WH} strokeOpacity={0.6} strokeWidth={4} strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - bracketQ} />
            ) : null}
          </svg>
          <div style={{ position: "absolute", left: midX - 560, width: 1120, top: TEMPO.endpointTop, display: "flex", alignItems: "center", justifyContent: "center", gap: 26 }}>
            <span style={{ ...txt(40, WH), opacity: k(tEnd, 180) }}>{endpoint.label}</span>
            <span style={{ ...txt(40, INK_SUB), opacity: k(tVs, 180) }}>{versus.label}</span>
            <span style={{ ...txt(TYPE.label, WH), lineHeight: 1, opacity: k(tWeek, 120), transform: `scale(${interpolate(ms, [tWeek, tWeek + 260], [1.3, 1], { ...CLAMP, easing: EASE })})`, border: `3px solid ${WH}`, borderRadius: 999, padding: "9px 20px" }}>{week.label}</span>
          </div>

          {/* the third trial: the tablet AND the capsule */}
          {ms >= tThird - 20
            ? cardShell(2, rise(tThird), (
                <>
                  <div style={{ position: "absolute", left: 34, top: 28, ...txt(TYPE.label, INK_SUB) }}>{third.label}</div>
                  <svg width={C.w} height={C.h} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
                    {k(tTab3, 10) > 0 ? (
                      <g transform={`translate(${C.w / 2 - 110} ${172 - (1 - BACK(k(tTab3, 380))) * 150})`} opacity={clamp01(k(tTab3, 380) * 4)}><Tablet r={58} /></g>
                    ) : null}
                    {k(tCap3, 10) > 0 ? (
                      <>
                        <g opacity={k(tCap3 + 200, 160)} stroke={WH} strokeWidth={8} strokeLinecap="round">
                          <line x1={C.w / 2 - 18} y1={172} x2={C.w / 2 + 18} y2={172} />
                          <line x1={C.w / 2} y1={154} x2={C.w / 2} y2={190} />
                        </g>
                        <g transform={`translate(${C.w / 2 + 122 + (1 - EASE(k(tCap3, 360))) * 160} 172)`} opacity={clamp01(k(tCap3, 360) * 3)}><Capsule w={150} h={64} color={WH} back={COLORS.inkSoft} /></g>
                      </>
                    ) : null}
                    {/* the on/off wave */}
                    <path d="M 60 372 H 110 V 322 H 180 V 372 H 235 V 322 H 290 V 372 H 360 V 322 H 410 V 372 H 440" fill="none" stroke={WH} strokeWidth={7} strokeLinejoin="round" strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - EASE_IO(k(tWave, Math.max(500, tMotor - tWave - 60)))} />
                  </svg>
                  <div style={{ position: "absolute", left: 0, width: C.w, top: 244, textAlign: "center", opacity: k(tCap3 + 260, 180), ...txt(TYPE.label, INK_SUB) }}>{cap3.label}</div>
                  <div style={{ position: "absolute", left: 0, width: C.w, top: 406, textAlign: "center", opacity: k(tMotor, 180), ...txt(42, WH) }}>{motor.label}</div>
                </>
              ))
            : null}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// OnTimeGain — a switch, then two gains at one scale
// ══════════════════════════════════════════════════════════════════════════
export const ONTIME = {
  titleTop: 222,
  subTop: 346,
  defTop: 400,
  base: 600, // the shared baseline (x)
  pxPerHour: 380,
  rows: [520, 640] as const, // bar tops
  barH: 80,
  rulerY: 762,
};

export const OnTimeGain: React.FC<Win & {
  title: { text: string } & Cued; // written word by word
  on: Cued; // the switch flips
  sub: { text: string } & Cued;
  def: { text: string } & Cued;
  drug: { label: string; value: number; word?: string; ms?: number; figWord?: string; endWord?: string };
  placebo: { label: string; value: number; word?: string; ms?: number; figWord?: string; endWord?: string };
  unit: string;
  ticks: string[]; // one label per whole hour, from 0
  clear: Cued;
}> = ({ from, to, title, on, sub, def, drug, placebo, unit, ticks, clear }) => {
  const ms = useMs();
  const k = useK();
  const WH = COLORS.paper;
  const R = COLORS.accent;
  const O = ONTIME;

  const tTitle = at(title, from, from);
  const tOn = at(on, tTitle + 400, from, tTitle + 250);
  const tSub = at(sub, tOn + 500, from, tOn + 300);
  const tDef = at(def, tSub + 2500, from, tSub + 800);
  const tRow1 = at(drug, tDef + 2200, from, tDef + 900);
  const tFig1 = Math.max(tRow1 + 300, cue(drug.figWord, tRow1 + 650, from));
  const tEnd1 = Math.max(tFig1 + 500, cue(drug.endWord, tFig1 + 1000, from));
  const tRow2 = at(placebo, tEnd1 + 800, from, tEnd1 + 300);
  const tFig2 = Math.max(tRow2 + 300, cue(placebo.figWord, tRow2 + 600, from));
  const tEnd2 = Math.max(tFig2 + 500, cue(placebo.endWord, tFig2 + 1000, from));
  const tClear = at(clear, tEnd2 + 1100, from, tEnd2 + 500);
  const vis = (1 - k(tClear, 300)) * clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));

  const flip = EASE_IO(k(tOn, 280));
  const q1 = EASE(k(tFig1, tEnd1 - tFig1));
  const q2 = EASE(k(tFig2, tEnd2 - tFig2));
  const axis = EASE_IO(k(tRow1, 460));
  const fmt = (v: number) => `+${v.toFixed(1)}`;

  const row = (i: number, r: { label: string; value: number }, tRow: number, tFig: number, q: number, color: string, labelColor: string) => {
    const w = r.value * O.pxPerHour * q;
    return (
      <React.Fragment key={i}>
        <div style={{ position: "absolute", right: W - O.base + 34, top: O.rows[i] + O.barH / 2, transform: "translateY(-50%)", opacity: k(tRow, 180), ...txt(46, labelColor) }}>{r.label}</div>
        {q > 0 ? <div style={{ position: "absolute", left: O.base, top: O.rows[i], width: w, height: O.barH, background: color, borderRadius: "0 12px 12px 0" }} /> : null}
        <div style={{ position: "absolute", left: O.base + w + 30, top: O.rows[i] + O.barH / 2, transform: "translateY(-50%)", display: "flex", alignItems: "baseline", gap: 16, opacity: k(tFig - 40, 140) }}>
          <span style={{ ...txt(92, WH), lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>{fmt(r.value * q)}</span>
          <span style={txt(40, INK_SUB)}>{unit}</span>
        </div>
      </React.Fragment>
    );
  };

  if (ms < tTitle - 60 || vis <= 0) return null;
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {/* the switch + the title */}
      <div style={{ position: "absolute", left: 0, width: W, top: O.titleTop, display: "flex", alignItems: "center", justifyContent: "center", gap: 40 }}>
        <svg width={190} height={100} style={{ flex: "none", opacity: k(tTitle, 180) }}>
          <rect x={5} y={5} width={180} height={90} rx={45} fill={flip > 0.5 ? WH : "none"} stroke={WH} strokeWidth={8} />
          <circle cx={lerp(50, 140, flip)} cy={50} r={30} fill={flip > 0.5 ? COLORS.ink : WH} />
        </svg>
        <FlowLine from={tTitle} to={tClear} line={title.text} size={104} color={WH} lineHeight={1} />
      </div>
      <div style={{ position: "absolute", left: 130, width: W - 260, top: O.subTop }}>
        <FlowLine from={tSub} to={tDef} line={sub.text} size={40} color={WH} align="center" />
      </div>
      <div style={{ position: "absolute", left: 130, width: W - 260, top: O.defTop }}>
        <FlowLine from={tDef} to={tRow1} line={def.text} size={40} color={INK_SUB} align="center" />
      </div>

      {/* the shared baseline + the hour ruler */}
      {axis > 0 ? (
        <>
          <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
            <line x1={O.base} y1={O.rows[0] - 22} x2={O.base} y2={lerp(O.rows[0] - 22, O.rulerY, axis)} stroke={WH} strokeOpacity={0.6} strokeWidth={4} />
            <line x1={O.base} y1={O.rulerY} x2={lerp(O.base, O.base + (ticks.length - 1) * O.pxPerHour, axis)} y2={O.rulerY} stroke={WH} strokeOpacity={0.35} strokeWidth={4} />
            {ticks.map((_, i) => (axis >= i / Math.max(1, ticks.length - 1) ? <line key={i} x1={O.base + i * O.pxPerHour} y1={O.rulerY - 12} x2={O.base + i * O.pxPerHour} y2={O.rulerY + 12} stroke={WH} strokeOpacity={0.6} strokeWidth={4} /> : null))}
          </svg>
          {ticks.map((t, i) => (
            <div key={i} style={{ position: "absolute", left: O.base + i * O.pxPerHour - 100, width: 200, top: O.rulerY + 22, textAlign: "center", opacity: clamp01((axis - i / Math.max(1, ticks.length - 1)) * 6 + 0.2) * axis, ...txt(TYPE.label, INK_SUB) }}>{t}</div>
          ))}
        </>
      ) : null}

      {row(0, drug, tRow1, tFig1, q1, R, WH)}
      {ms >= tRow2 - 20 ? row(1, placebo, tRow2, tFig2, q2, "rgba(255,255,255,0.45)", INK_SUB) : null}
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// SafetySheet — the label sheet folds down and is written
// ══════════════════════════════════════════════════════════════════════════
export const SHEET = { cx: 960, top: 214, w: 1040, h: 640, rowTop: 150, rowGap: 96 };

export const SafetySheet: React.FC<Win & {
  sheet: { title: string } & Cued;
  caution: { label: string } & Cued;
  rows: ({ label: string } & Cued)[];
  footer: { label: string } & Cued;
}> = ({ from, to, sheet, caution, rows, footer }) => {
  const ms = useMs();
  const k = useK();
  const INK = COLORS.ink;
  const WH = COLORS.paper;
  const R = COLORS.accent;
  const S = SHEET;
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));

  const tSheet = at(sheet, from, from);
  const tCaution = at(caution, tSheet + 1500, from, tSheet + 600);
  const tRows = rows.reduce<number[]>((acc, r, i) => [...acc, at(r, (acc[i - 1] ?? tCaution) + 1200, from, (acc[i - 1] ?? tCaution) + 350)], []);
  const tFoot = at(footer, tRows[tRows.length - 1] + 1000, from, tRows[tRows.length - 1] + 400);

  const fold = EASE(k(tSheet, 520));
  const cautionS = interpolate(ms, [tCaution, tCaution + 280], [1.6, 1], { ...CLAMP, easing: EASE });
  const footQ = EASE_IO(k(tFoot, 420));

  if (ms < tSheet - 60) return null;
  return (
    <AbsoluteFill style={{ opacity: vis, perspective: 1800 }}>
      <div style={{ position: "absolute", left: S.cx - S.w / 2, top: S.top, width: S.w, height: S.h, background: WH, borderRadius: 26, overflow: "hidden", opacity: clamp01(fold * 2.5),
        transformOrigin: "50% 0%", transform: `rotateX(${(1 - fold) * -78}deg)` }}>
        <div style={{ position: "absolute", left: 56, top: 44, opacity: k(tSheet + 260, 200), ...txt(56, INK) }}>{sheet.title}</div>
        <div style={{ position: "absolute", left: 56, right: 56, top: 124, height: 4, background: inkA(0.14) }} />

        {/* the caution mark */}
        {k(tCaution, 10) > 0 ? (
          <div style={{ position: "absolute", right: 52, top: 30, display: "flex", alignItems: "center", gap: 16, opacity: k(tCaution, 110), transform: `scale(${cautionS})`, transformOrigin: "right center" }}>
            <span style={txt(TYPE.label, R)}>{caution.label}</span>
            <svg width={76} height={70} style={{ flex: "none" }}>
              <path d="M 38 5 L 72 64 H 4 Z" fill={R} stroke={R} strokeWidth={6} strokeLinejoin="round" />
              <line x1={38} y1={26} x2={38} y2={44} stroke={WH} strokeWidth={7} strokeLinecap="round" />
              <circle cx={38} cy={55} r={4} fill={WH} />
            </svg>
          </div>
        ) : null}

        {rows.map((r, i) => {
          const q = EASE(k(tRows[i], 300));
          if (q <= 0) return null;
          return (
            <div key={i} style={{ position: "absolute", left: 56, top: S.rowTop + i * S.rowGap, display: "flex", alignItems: "center", gap: 26, opacity: clamp01(q * 2), transform: `translateX(${(1 - q) * -44}px)` }}>
              <span style={{ width: 20, height: 20, background: INK, flex: "none" }} />
              <span style={txt(58, INK)}>{r.label}</span>
            </div>
          );
        })}

        {/* the footer names the list */}
        <div style={{ position: "absolute", left: 0, bottom: 0, width: `${footQ * 100}%`, height: 86, background: INK }} />
        <div style={{ position: "absolute", left: 56, bottom: 0, height: 86, display: "flex", alignItems: "center", opacity: k(tFoot + 200, 200), ...txt(34, WH) }}>{footer.label}</div>
      </div>
    </AbsoluteFill>
  );
};
