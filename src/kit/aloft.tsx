// ─────────────────────────────────────────────────────────────────────────
// KIT · aloft — ONE DRUG, TWO DOSES, ONE LINE. Added on the Bristol Myers Squibb
// two-readouts HORIZONTAL long-form, 2026-10-14 (16:9; absolute 1920x1080
// coordinates, not portrait-safe as written). One-mover rule and the frame
// budget: each cue gets ONE motion, a finished idea retires.
//
// `DrugTrial` (ink): the hook's card returns as a chip, the drug's name slams
// and docks beside it as the section header. Two tablets, the indication word by
// word; lungs draw and a scar creeps up them. Then the trial's plate, three arms
// that run to a week tick, and the measure with one bar that fills like a breath.
//
// `DoseColumns` (white card): THE SPINE'S CHART. A threshold line draws, one
// column rises THROUGH it, a second stops under it. Neither column has a top
// edge (it dissolves) and there is no scale: the script gives no magnitude. The
// labels retire and a verdict lands beside each column.
//
// `ReportedSheet` (white card): an attribution kicker and three rows a page.
//
// Every onset is a spoken word with an optional ms pin, clamped monotonic
// (`at()` / `useK()` / `Cued` / `Win` come from ./elora).
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { CLAMP, clamp01, COLORS, DISPLAY, inkA, INK_SUB, TRACK, useMs } from "./core";
import { TYPE } from "../style";
import { at, lerp, useK, type Cued, type Win } from "./elora";

const EASE = Easing.out(Easing.cubic);
const EASE_IO = Easing.inOut(Easing.cubic);
const BACK = Easing.out(Easing.back(1.7));

const label = (color: string, size: number = TYPE.label): React.CSSProperties => ({
  fontFamily: DISPLAY, fontWeight: 700, fontSize: size, letterSpacing: TRACK.kicker, color, whiteSpace: "nowrap",
});
const big = (color: string, size: number): React.CSSProperties => ({
  fontFamily: DISPLAY, fontWeight: 700, fontSize: size, letterSpacing: TRACK.display, color, lineHeight: 1, whiteSpace: "nowrap",
});

/** The hook's announcement card at chip size: a check and a slot that is still empty. */
export const ReadoutChip: React.FC<{ x: number; y: number; k: number }> = ({ x, y, k }) => {
  if (k <= 0) return null;
  return (
    <div style={{ position: "absolute", left: x, top: y, width: 160, height: 120, borderRadius: 16, background: COLORS.paper, opacity: clamp01(k * 4), transform: `scale(${lerp(0.6, 1, BACK(k))})` }}>
      <div style={{ position: "absolute", left: 16, top: 14, width: 34, height: 34, borderRadius: 17, background: COLORS.ink }}>
        <svg width={34} height={34} viewBox="0 0 64 64"><path d="M18 33 L28 43 L46 23" fill="none" stroke={COLORS.paper} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
      <svg style={{ position: "absolute", left: 16, top: 62 }} width={128} height={42}>
        <rect x={2} y={2} width={124} height={38} rx={9} fill="none" stroke={inkA(0.55)} strokeWidth={3} strokeDasharray="9 7" />
      </svg>
    </div>
  );
};

const Tablet: React.FC<{ x: number; y: number; k: number; w?: number; color?: string; hollow?: boolean }> = ({ x, y, k, w = 150, color = COLORS.paper, hollow }) => {
  if (k <= 0) return null;
  const h = w * 0.44;
  return (
    <div style={{ position: "absolute", left: x, top: y - (1 - BACK(k)) * 90, width: w, height: h, borderRadius: h / 2, boxSizing: "border-box", background: hollow ? "transparent" : color, border: hollow ? `4px solid ${color}` : undefined, opacity: clamp01(k * 4) }}>
      <div style={{ position: "absolute", left: w / 2 - 2, top: h * 0.2, width: 4, height: h * 0.6, background: hollow ? color : inkA(0.25) }} />
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// DrugTrial (ink world)
// ══════════════════════════════════════════════════════════════════════════
export const DRUG = {
  chip: { x: 130, y: 96 },
  hero: { left: 130, top: 250, size: 190 },
  dock: { left: 320, top: 127, s: 0.3 }, // the name as the section header, beside the chip
  pills: { x: 1470, y: 290, gap: 96 },
  ind: { left: 130, top: 500, size: 76 },
  lungs: { x: 1180, y: 250, w: 520, h: 546 },
  plate: { left: 130, top: 290, size: 100 },
  lanes: { y: [520, 630, 740], x0: 400, x1: 1700, tagW: 124 },
  fvc: { top: 520, size: 120 },
  bar: { y: 716, h: 28, x0: 130, x1: 1700 },
};

export const DrugTrial: React.FC<Win & {
  chip: Cued;
  name: { label: string } & Cued;
  pill1: Cued;
  pill2: { label: string } & Cued;
  indication: ({ text: string } & Cued)[]; // one span per spoken word
  dock: Cued; // a pause: the name becomes the header, the tablets leave
  lungs: Cued;
  scar: { until: Cued } & Cued; // the scar creeps from its word to `until`
  scarLabel: { label: string } & Cued;
  clear: Cued; // a pause: the disease leaves
  kicker: { label: string } & Cued;
  plate: { label: string } & Cued;
  arms: ({ label: string; hollow?: boolean } & Cued)[]; // three lanes
  run: { until: Cued } & Cued; // the lanes run to the tick
  tick: { label: string } & Cued;
  clear2: Cued; // a pause: the lanes leave
  measureKicker: { label: string } & Cued;
  measure: ({ text: string } & Cued)[];
  test: { label: string } & Cued;
  breath: Cued; // the bar fills
}> = ({ from, to, chip, name, pill1, pill2, indication, dock, lungs, scar, scarLabel, clear, kicker, plate, arms, run, tick, clear2, measureKicker, measure, test, breath }) => {
  const ms = useMs();
  const k = useK();
  const WH = COLORS.paper;
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));

  const tChip = at(chip, from, from);
  const tName = at(name, tChip + 500, from, tChip + 200);
  const tPill1 = at(pill1, tName + 1000, from, tName + 400);
  const tPill2 = at(pill2, tPill1 + 500, from, tPill1 + 250);
  let prev = tPill2;
  const tInd = indication.map((w) => (prev = at(w, prev + 500, from, prev + 150)));
  const tDock = at(dock, prev + 900, from, prev + 400);
  const tLungs = at(lungs, tDock + 300, from, tDock + 200);
  const tScar = at(scar, tLungs + 700, from, tLungs + 500);
  const tScarEnd = at(scar.until, tScar + 1000, from, tScar + 500);
  const tScarL = at(scarLabel, tScar + 300, from, tScar + 100);
  const tClear = at(clear, tScarEnd + 100, from, tScarEnd);
  const tKick = at(kicker, tClear + 500, from, tClear + 300);
  const tPlate = at(plate, tKick + 700, from, tKick + 200);
  prev = tPlate;
  const tArms = arms.map((a) => (prev = at(a, prev + 500, from, prev + 200)));
  const tRun = at(run, prev + 600, from, prev + 300);
  const tRunEnd = at(run.until, tRun + 900, from, tRun + 400);
  const tTick = at(tick, tRun + 500, from, tRun + 200);
  const tClear2 = at(clear2, tRunEnd + 500, from, tRunEnd + 200);
  const tMK = at(measureKicker, tClear2 + 450, from, tClear2 + 300);
  prev = tMK;
  const tMeasure = measure.map((w) => (prev = at(w, prev + 400, from, prev + 150)));
  const tTest = at(test, prev + 800, from, prev + 300);
  const tBreath = at(breath, tTest + 900, from, tTest + 400);

  // the name: hero, then the header
  const nameO = k(tName, 110);
  const nameS = interpolate(ms, [tName, tName + 320], [1.25, 1], { ...CLAMP, easing: EASE });
  const dq = EASE_IO(k(tDock, 620));
  const nx = lerp(DRUG.hero.left, DRUG.dock.left, dq);
  const ny = lerp(DRUG.hero.top, DRUG.dock.top, dq);
  const ns = lerp(1, DRUG.dock.s, dq);

  const pillsO = 1 - k(tDock, 260);
  const diseaseO = 1 - k(tClear, 300);
  const lungQ = EASE_IO(k(tLungs, 650));
  const scarQ = clamp01((ms - tScar) / Math.max(300, tScarEnd - tScar)); // linear: it creeps
  const lanesO = 1 - k(tClear2, 300);
  const runQ = clamp01((ms - tRun) / Math.max(300, tRunEnd - tRun));
  const breathQ = EASE_IO(k(tBreath, 450));

  const Lg = DRUG.lungs;
  const Ln = DRUG.lanes;
  if (ms < tChip - 60) return null;
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <ReadoutChip x={DRUG.chip.x} y={DRUG.chip.y} k={k(tChip, 380)} />
      <div style={{ position: "absolute", left: nx, top: ny, transformOrigin: "0 0", transform: `scale(${ns})`, ...big(WH, DRUG.hero.size) }}>
        <span style={{ display: "inline-block", opacity: nameO, transform: `scale(${nameS})`, transformOrigin: "left bottom" }}>{name.label}</span>
      </div>

      {/* ── the tablets ── */}
      {pillsO > 0 ? (
        <div style={{ opacity: pillsO }}>
          <Tablet x={DRUG.pills.x} y={DRUG.pills.y} k={k(tPill1, 380)} w={200} />
          <Tablet x={DRUG.pills.x} y={DRUG.pills.y + DRUG.pills.gap} k={k(tPill2, 380)} w={200} />
          <div style={{ position: "absolute", left: DRUG.pills.x, top: DRUG.pills.y + DRUG.pills.gap + 110, opacity: k(tPill2 + 160, 200), ...label(INK_SUB, 30) }}>{pill2.label}</div>
        </div>
      ) : null}

      {/* ── the disease ── */}
      {diseaseO > 0 ? (
        <div style={{ opacity: diseaseO }}>
          <div style={{ position: "absolute", left: DRUG.ind.left, top: DRUG.ind.top, ...big(WH, DRUG.ind.size) }}>
            {indication.map((w, i) => (
              <span key={i} style={{ opacity: k(tInd[i], 160) }}>{w.text}{i < indication.length - 1 ? " " : ""}</span>
            ))}
          </div>
          <div style={{ position: "absolute", left: DRUG.ind.left, top: DRUG.ind.top + 110, opacity: k(tScarL, 220), ...label(INK_SUB, 36) }}>{scarLabel.label}</div>
          {lungQ > 0 ? (
            <svg style={{ position: "absolute", left: Lg.x, top: Lg.y }} width={Lg.w} height={Lg.h} viewBox="0 0 400 420">
              <defs>
                <clipPath id="aloft-lobes">
                  <path d="M175 110 C120 90 60 170 50 280 C45 350 70 390 120 380 C160 372 180 340 180 290 Z" />
                  <path d="M225 110 C280 90 340 170 350 280 C355 350 330 390 280 380 C240 372 220 340 220 290 Z" />
                </clipPath>
                <pattern id="aloft-hatch" width={14} height={14} patternUnits="userSpaceOnUse" patternTransform="rotate(40)">
                  <rect width={7} height={14} fill={COLORS.accent} />
                </pattern>
              </defs>
              {/* the scar: creeps up from the base and stops short of the top */}
              <rect x={40} y={400 - 210 * scarQ} width={320} height={210 * scarQ} fill="url(#aloft-hatch)" clipPath="url(#aloft-lobes)" />
              {["M200 20 L200 130", "M200 130 Q170 150 150 190", "M200 130 Q230 150 250 190",
                "M175 110 C120 90 60 170 50 280 C45 350 70 390 120 380 C160 372 180 340 180 290 Z",
                "M225 110 C280 90 340 170 350 280 C355 350 330 390 280 380 C240 372 220 340 220 290 Z"].map((d, i) => (
                <path key={i} d={d} fill="none" stroke={WH} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - lungQ} />
              ))}
            </svg>
          ) : null}
        </div>
      ) : null}

      {/* ── the trial ── */}
      <div style={{ position: "absolute", left: DRUG.plate.left, top: DRUG.plate.top - 44, opacity: k(tKick, 200), ...label(INK_SUB, 30) }}>{kicker.label}</div>
      {ms >= tPlate - 20 ? (
        <div style={{ position: "absolute", left: DRUG.plate.left, top: DRUG.plate.top, padding: "20px 40px 26px", borderRadius: 22, background: WH, opacity: clamp01(k(tPlate, 120) * 2), transformOrigin: "0 50%", transform: `scale(${lerp(1.18, 1, EASE(k(tPlate, 300)))})`, ...big(COLORS.ink, DRUG.plate.size) }}>{plate.label}</div>
      ) : null}
      {lanesO > 0 ? (
        <div style={{ opacity: lanesO }}>
          {arms.map((a, i) => {
            const q = k(tArms[i], 380);
            const y = Ln.y[i];
            return (
              <React.Fragment key={i}>
                <Tablet x={130} y={y} k={q} w={Ln.tagW} hollow={a.hollow} />
                <div style={{ position: "absolute", left: 130 + Ln.tagW + 24, top: y + 10, opacity: k(tArms[i] + 120, 200), ...label(a.hollow ? INK_SUB : WH, 34) }}>{a.label}</div>
                <div style={{ position: "absolute", left: Ln.x0, top: y + 25, width: (Ln.x1 - Ln.x0) * runQ, height: 4, background: a.hollow ? INK_SUB : WH }} />
              </React.Fragment>
            );
          })}
          <div style={{ position: "absolute", left: Ln.x1 - 2, top: Ln.y[0] - 14, width: 4, height: (Ln.y[2] - Ln.y[0] + 82) * EASE(k(tTick, 320)), background: WH }} />
          <div style={{ position: "absolute", left: Ln.x1 - 300, width: 300, top: Ln.y[0] - 66, textAlign: "right", opacity: k(tTick, 200), ...label(WH, 36) }}>{tick.label}</div>
        </div>
      ) : null}

      {/* ── the measure ── */}
      <div style={{ position: "absolute", left: 130, top: DRUG.fvc.top - 50, opacity: k(tMK, 200), ...label(INK_SUB, 30) }}>{measureKicker.label}</div>
      <div style={{ position: "absolute", left: 130, top: DRUG.fvc.top, ...big(WH, DRUG.fvc.size) }}>
        {measure.map((w, i) => (
          <span key={i} style={{ display: "inline-block", opacity: k(tMeasure[i], 140), transform: `translateY(${(1 - EASE(k(tMeasure[i], 300))) * 26}px)`, marginRight: "0.24em" }}>{w.text}</span>
        ))}
      </div>
      {ms >= tTest - 20 ? (
        <>
          <div style={{ position: "absolute", left: DRUG.bar.x0, top: DRUG.bar.y, width: DRUG.bar.x1 - DRUG.bar.x0, height: DRUG.bar.h, borderRadius: DRUG.bar.h / 2, background: "rgba(255,255,255,0.16)", opacity: k(tTest, 240) }} />
          <div style={{ position: "absolute", left: DRUG.bar.x0, top: DRUG.bar.y, width: (DRUG.bar.x1 - DRUG.bar.x0) * breathQ, height: DRUG.bar.h, borderRadius: DRUG.bar.h / 2, background: WH }} />
          <div style={{ position: "absolute", left: DRUG.bar.x0, top: DRUG.bar.y + 56, opacity: k(tTest, 240), ...label(INK_SUB, 36) }}>{test.label}</div>
        </>
      ) : null}
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// DoseColumns (white card) — the spine's chart
// ══════════════════════════════════════════════════════════════════════════
export const DOSES = {
  base: 790, // the baseline both columns stand on
  line: 420, // the threshold: no scale, only over or under
  x0: 380, x1: 1540,
  a: { x: 520, w: 240, top: 290 }, // rises through the line
  b: { x: 1160, w: 240, top: 530 }, // stops under it
  fade: 70, // a column's top dissolves over this many px: no edge, no magnitude
};

export const Column: React.FC<{ x: number; w: number; top: number; q: number; color: string }> = ({ x, w, top, q, color }) => {
  if (q <= 0) return null;
  const h = (DOSES.base - top) * q;
  return (
    <div style={{ position: "absolute", left: x, top: DOSES.base - h, width: w, height: h,
      background: `linear-gradient(to bottom, transparent 0px, ${color} ${Math.min(DOSES.fade, h)}px, ${color} 100%)` }} />
  );
};

export const DoseColumns: React.FC<Win & {
  doseA: { label: string } & Cued;
  title: { label: string } & Cued;
  line: Cued; // the threshold draws
  lineLabel: { label: string } & Cued;
  riseA: Cued; // column one goes through it
  check: Cued;
  foot: { label: string } & Cued; // "Over placebo, week 52"
  doseB: { label: string } & Cued;
  says: { label: string } & Cued; // attribution
  riseB: Cued; // column two stops under it
  saysWhat: { label: string } & Cued;
  not: { label: string } & Cued; // "Not significant"
  clear: Cued; // a pause: the labels retire
  subA: { label: string } & Cued;
  verdictA: { label: string } & Cued;
  subB: { label: string } & Cued;
  verdictB: { label: string } & Cued;
}> = ({ from, to, doseA, title, line, lineLabel, riseA, check, foot, doseB, says, riseB, saysWhat, not, clear, subA, verdictA, subB, verdictB }) => {
  const ms = useMs();
  const k = useK();
  const INK = COLORS.ink;
  const RED = COLORS.accent;
  const SUB = inkA(0.6);
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));

  const tDoseA = at(doseA, from, from);
  const tTitle = at(title, tDoseA + 900, from, tDoseA + 300);
  const tLine = at(line, tTitle + 900, from, tTitle + 300);
  const tLineL = at(lineLabel, tLine + 600, from, tLine + 300);
  const tRiseA = at(riseA, tLineL + 600, from, tLineL + 300);
  const tCheck = at(check, tRiseA + 800, from, tRiseA + 600);
  const tFoot = at(foot, tCheck + 800, from, tCheck + 300);
  const tDoseB = at(doseB, tFoot + 1000, from, tFoot + 300);
  const tSays = at(says, tDoseB + 1500, from, tDoseB + 400);
  const tRiseB = at(riseB, tSays + 700, from, tSays + 300);
  const tSaysW = at(saysWhat, tRiseB + 500, from, tRiseB + 300);
  const tNot = at(not, tSaysW + 1400, from, tSaysW + 400);
  const tClear = at(clear, tNot + 1300, from, tNot + 500);
  const tSubA = at(subA, tClear + 900, from, tClear + 300);
  const tVerA = at(verdictA, tSubA + 600, from, tSubA + 250);
  const tSubB = at(subB, tVerA + 600, from, tVerA + 300);
  const tVerB = at(verdictB, tSubB + 700, from, tSubB + 250);

  const D = DOSES;
  const lineQ = EASE_IO(k(tLine, 520));
  const labelsO = 1 - k(tClear, 280);
  const tag = (x: number, w: number, t: number, text: string) => (
    <div style={{ position: "absolute", left: x - 80, width: w + 160, top: D.base + 22, textAlign: "center", opacity: clamp01(k(t, 120) * 2), transform: `scale(${lerp(1.3, 1, EASE(k(t, 280)))})`, ...big(INK, 56) }}>{text}</div>
  );
  const sub = (x: number, w: number, t: number, text: string) => (
    <div style={{ position: "absolute", left: x - 80, width: w + 160, top: D.base + 92, textAlign: "center", opacity: k(t, 200), ...label(SUB, 30) }}>{text}</div>
  );
  const verdict = (x: number, y: number, t: number, text: string, color: string) => (
    <div style={{ position: "absolute", left: x, top: y, opacity: clamp01(k(t, 110) * 2), transform: `scale(${lerp(1.35, 1, EASE(k(t, 300)))})`, transformOrigin: "left center", ...big(color, 104) }}>{text}</div>
  );

  if (ms < tDoseA - 60) return null;
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <div style={{ position: "absolute", left: 130, top: 100, opacity: k(tTitle, 200), ...big(INK, 64) }}>{title.label}</div>
      <div style={{ position: "absolute", left: 130, top: 182, opacity: k(tFoot, 220), ...label(SUB, 30) }}>{foot.label}</div>

      {/* baseline */}
      <div style={{ position: "absolute", left: D.x0, top: D.base, width: D.x1 - D.x0, height: 4, background: inkA(0.2), opacity: k(tDoseA, 200) }} />

      <Column x={D.a.x} w={D.a.w} top={D.a.top} q={EASE_IO(k(tRiseA, 760))} color={INK} />
      <Column x={D.b.x} w={D.b.w} top={D.b.top} q={EASE(k(tRiseB, 900))} color={inkA(0.32)} />

      {/* the threshold: the one red in the scene */}
      <div style={{ position: "absolute", left: D.x0, top: D.line - 3, width: (D.x1 - D.x0) * lineQ, height: 6, background: RED }} />
      <div style={{ position: "absolute", left: D.x1 - 600, width: 600, textAlign: "right", top: D.line - 52, opacity: k(tLineL, 200) * labelsO, ...label(RED, 32) }}>{lineLabel.label}</div>

      {/* column one's check, above its dissolved top */}
      <div style={{ position: "absolute", left: D.a.x + D.a.w / 2 - 36, top: D.a.top - 96, width: 72, height: 72, borderRadius: 36, background: INK, opacity: clamp01(k(tCheck, 260) * 3) * labelsO, transform: `scale(${lerp(1.5, 1, EASE(k(tCheck, 260)))})` }}>
        <svg width={72} height={72} viewBox="0 0 64 64"><path d="M18 33 L28 43 L46 23" fill="none" stroke={COLORS.paper} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>

      {tag(D.a.x, D.a.w, tDoseA, doseA.label)}
      {tag(D.b.x, D.b.w, tDoseB, doseB.label)}

      {/* column two: who says so, what they say, and the stamp under the line */}
      <div style={{ opacity: labelsO }}>
        <div style={{ position: "absolute", left: D.b.x + D.b.w + 40, top: 600, opacity: k(tSays, 200), ...label(SUB, 30) }}>{says.label}</div>
        <div style={{ position: "absolute", left: D.b.x + D.b.w + 40, top: 644, opacity: k(tSaysW, 220), ...big(INK, 40) }}>{saysWhat.label}</div>
        <div style={{ position: "absolute", left: D.b.x - 30, top: D.line + 26, width: D.b.w + 60, height: 60, boxSizing: "border-box", borderRadius: 30, border: `4px solid ${INK}`, display: "flex", alignItems: "center", justifyContent: "center", opacity: clamp01(k(tNot, 120) * 2), transform: `scale(${lerp(1.3, 1, EASE(k(tNot, 280)))})`, ...label(INK, 30) }}>{not.label}</div>
      </div>

      {sub(D.a.x, D.a.w, tSubA, subA.label)}
      {verdict(D.a.x + D.a.w + 40, 500, tVerA, verdictA.label, INK)}
      {sub(D.b.x, D.b.w, tSubB, subB.label)}
      {verdict(D.b.x + D.b.w + 40, 600, tVerB, verdictB.label, inkA(0.45))}
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// ReportedSheet (white card) — three rows a page, under an attribution
// ══════════════════════════════════════════════════════════════════════════
export const ReportedSheet: React.FC<Win & {
  kicker: { label: string } & Cued;
  rows: ({ text: string; value?: { text: string } & Cued; value2?: { text: string } & Cued } & Cued)[];
}> = ({ from, to, kicker, rows }) => {
  const ms = useMs();
  const k = useK();
  const INK = COLORS.ink;
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));
  const tKick = at(kicker, from, from);
  let prev = tKick;
  const tRows = rows.map((r) => (prev = at(r, prev + 900, from, prev + 300)));
  if (ms < tKick - 60) return null;
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <div style={{ position: "absolute", left: 130, top: 120, opacity: k(tKick, 200), ...label(inkA(0.6), 36) }}>{kicker.label}</div>
      {rows.map((r, i) => {
        const t = tRows[i];
        const y = 240 + i * 200;
        const tv = r.value ? at(r.value, t + 900, from, t + 300) : 0;
        const tv2 = r.value2 ? at(r.value2, tv + 500, from, tv + 250) : 0;
        return (
          <React.Fragment key={i}>
            <div style={{ position: "absolute", left: 130, top: y + 4, width: 64, height: 64, borderRadius: 32, background: INK, opacity: clamp01(k(t, 240) * 3), transform: `scale(${lerp(1.5, 1, EASE(k(t, 240)))})` }}>
              <svg width={64} height={64} viewBox="0 0 64 64"><path d="M18 33 L28 43 L46 23" fill="none" stroke={COLORS.paper} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" /></svg>
            </div>
            <div style={{ position: "absolute", left: 224, top: y, opacity: k(t + 80, 200), transform: `translateX(${(1 - EASE(k(t + 80, 340))) * 36}px)`, ...big(INK, 72) }}>{r.text}</div>
            {r.value ? (
              <div style={{ position: "absolute", left: 224, top: y + 96, ...big(inkA(0.6), 52) }}>
                <span style={{ opacity: k(tv, 180) }}>{r.value.text}</span>
                {r.value2 ? <span style={{ opacity: k(tv2, 180) }}>{" " + r.value2.text}</span> : null}
              </div>
            ) : null}
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};
