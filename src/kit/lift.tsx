// ─────────────────────────────────────────────────────────────────────────
// KIT · lift — the spine PERFORMS, then the close. Lilly EloraTZP long-form,
// 2026-10-03 (VERTICAL). One mover per cue; landed things go still.
//
// `CeilingLift` (red, §4): the §3 chart, revealed by the wipe on its PULLED
// seat (CEIL.pull), pushes back in on "GLP-1". On "plateaued" the combo's
// excess drains to a dashed outline: the class stops at the plate. On "near"
// a CEILING PLATE falls from above the frame and lands on tirzepatide's top.
// On "Amylin" the §2 amylin peptide flies in on an arc and is absorbed into the
// combo bar's base; on "moved" the bar refills and LIFTS the plate to 23.3
// while the plate's own value counts 15 -> 23.3. On "ceiling" the old level is
// left behind as a dashed line. "Phase 3 starts quickly": a marker zips along
// a 2b -> 3 track and stops short of the dashed Phase 3 node (not started).
// "The question for the rest of the field": a camera pull parks the chart in
// the corner and dashed rivals (unmeasured) rise to the old line; "match 23"
// runs the target across them at the plate's height; "print again" grows a
// dashed column above Lilly's plate (a readout that has not happened).
//
// `CeilingClose` (white card, §5): the spine shrinks into a story tile, the
// issue frame draws round it, the lockup lands, the button and URL, and the
// tagline. On "Signal" the tile's plate settles one notch: the last mover.
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { CLAMP, clamp01, COLORS, DISPLAY, inkA, INK_SUB_ON_RED, TRACK, useMs } from "./core";
import { TYPE } from "../style";
import { FlowLine } from "./flowline";
import { Wordmark } from "./ui";
import { at, lerp, Peptide, Phrase, useK, type Cued, type Win } from "./elora";
import { CEIL, yOf } from "./ceiling";

const EASE = Easing.out(Easing.cubic);
const EASE_IO = Easing.inOut(Easing.cubic);
const fmt = (v: number, d: number) => v.toLocaleString("en-US", { minimumFractionDigits: d, maximumFractionDigits: d });

// the three camera states of the chart group, as x' = s·x + t
const CAM = {
  parked: { s: CEIL.pull.s, tx: CEIL.pull.ox * (1 - CEIL.pull.s), ty: CEIL.pull.oy * (1 - CEIL.pull.s) },
  full: { s: 1, tx: 0, ty: 0 },
  corner: { s: 0.55, tx: 930 * 0.45, ty: CEIL.base * 0.45 }, // anchored on the chart's right end of the baseline
};
const camLerp = (a: typeof CAM.full, b: typeof CAM.full, q: number) => ({ s: lerp(a.s, b.s, q), tx: lerp(a.tx, b.tx, q), ty: lerp(a.ty, b.ty, q) });
const onCam = (c: typeof CAM.full, x: number, y: number) => ({ x: c.s * x + c.tx, y: c.s * y + c.ty });

const PLATE = { left: 120, right: 960, h: 64 };

export const CeilingLift: React.FC<Win & {
  push: Cued; // the chart pushes back in ("GLP-1")
  drain: Cued; // the combo's excess drains to dashed ("plateaued")
  plate: { label: string; value: number; word?: string; ms?: number; valueWord?: string }; // falls ("near"), value on "15"
  amylin: Cued; // the peptide flies in
  lift: { word?: string; ms?: number; ghostWord?: string; ghostLabel: string }; // "moved"; the old level left on "ceiling"
  phase: { from: string; to: string; word?: string; ms?: number; toWord?: string; zipWord?: string };
  field: { label: string; word?: string; ms?: number; riseWord?: string; n: number }; // camera pull on "The question", rivals on "rest of"
  match: { label: string; word?: string; ms?: number };
  again: { label: string; word?: string; ms?: number };
  combo: { value: number };
  tirz: { value: number };
  names: { combo: [string, string]; tirz: [string, string] };
  lines: { text: string; emphasize?: string; word?: string; ms?: number }[];
}> = ({ from, to, push, drain, plate, amylin, lift, phase, field, match, again, combo, tirz, names, lines }) => {
  const ms = useMs();
  const k = useK();
  const W = COLORS.paper;
  const R = COLORS.accent;
  const SUB = INK_SUB_ON_RED;
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));

  const tPush = at(push, from + 100, from);
  const tDrain = at(drain, tPush + 1200, from, tPush + 500);
  const tPlate = at(plate, tDrain + 900, from, tDrain + 500);
  const tPlateV = at({ word: plate.valueWord }, tPlate + 450, from, tPlate + 380);
  const tAmy = at(amylin, tPlateV + 2000, from, tPlateV + 500);
  const tLift = at(lift, tAmy + 1100, from, tAmy + 700);
  const tGhost = at({ word: lift.ghostWord }, tLift + 650, from, tLift + 400);
  const tPhase = at(phase, tGhost + 1100, from, tGhost + 400);
  const tPhase3 = at({ word: phase.toWord }, tPhase + 550, from, tPhase + 250);
  const tZip = at({ word: phase.zipWord }, tPhase3 + 600, from, tPhase3 + 250);
  const tField = at(field, tZip + 1400, from, tZip + 500);
  const tRise = at({ word: field.riseWord }, tField + 800, from, tField + 400);
  const tMatch = at(match, tRise + 1300, from, tRise + 500);
  const tAgain = at(again, tMatch + 1800, from, tMatch + 600);

  // ── camera: parked (as §3 left it) -> full -> corner
  const pushQ = EASE_IO(k(tPush, 640));
  const cornerQ = EASE_IO(k(tField, 700));
  const cam = camLerp(camLerp(CAM.parked, CAM.full, pushQ), CAM.corner, cornerQ);

  // ── the combo's fill level: full -> drains to the plate -> lifted back
  const drainQ = EASE_IO(k(tDrain, 700));
  const liftQ = EASE_IO(k(tLift, Math.max(700, tGhost - tLift + 300)));
  const ceil0 = plate.value;
  const comboFill = lerp(lerp(combo.value, ceil0, drainQ), combo.value, liftQ);
  // ── the plate: falls from above the frame, rests on 15, rides the fill up
  const fallQ = Easing.in(Easing.quad)(k(tPlate, 420));
  const thud = fallQ >= 1 ? Math.sin(k(tPlate + 420, 220) * Math.PI) * 10 : 0; // one rebound, then still
  const plateLevel = lerp(ceil0, combo.value, liftQ);
  const plateBottom = lerp(-140, yOf(plateLevel), fallQ) - thud;
  const plateVal = lerp(ceil0, combo.value, liftQ);
  const plateValO = k(tPlateV, 140);

  // ── the amylin peptide: an arc from off-frame into the combo's base
  const amyQ = EASE_IO(k(tAmy, 700));
  const cb = CEIL.bars.combo;
  const tb = CEIL.bars.tirz;
  const amyStart = { x: -180, y: 1150 };
  const amyEnd = { x: cb.x, y: CEIL.base - 40 };
  const amyCtl = { x: 300, y: 820 };
  const u = 1 - amyQ;
  const amyX = u * u * amyStart.x + 2 * u * amyQ * amyCtl.x + amyQ * amyQ * amyEnd.x;
  const amyY = u * u * amyStart.y + 2 * u * amyQ * amyCtl.y + amyQ * amyQ * amyEnd.y;
  const amyS = lerp(1, 0.25, EASE(clamp01((amyQ - 0.6) / 0.4)));
  const amyO = ms >= tAmy && amyQ < 1 ? 1 : 0;

  const ghostQ = EASE(k(tGhost, 420));
  const phaseO = k(tPhase, 160) * (1 - cornerQ);
  const p3Q = EASE(k(tPhase3, 360));
  const zipQ = Easing.out(Easing.poly(5))(k(tZip, 420));

  // ── the field (screen space, on the corner camera)
  const C = CAM.corner;
  const base = onCam(C, 0, CEIL.base).y;
  const oldY = onCam(C, 0, yOf(ceil0)).y;
  const plateY = onCam(C, 0, yOf(combo.value)).y;
  const rivalXs = Array.from({ length: field.n }, (_, i) => 200 + i * 110);
  const riseQs = rivalXs.map((_, i) => EASE(k(tRise + i * 110, 520)));
  const matchQ = EASE(k(tMatch, 420));
  const againQ = EASE(k(tAgain, 650));
  const comboScreen = onCam(C, cb.x, 0).x;
  const plateTopScreen = onCam(C, 0, yOf(combo.value) - PLATE.h).y;

  // the figure rides INSIDE the bar's top; its value is the measured one, never the drained level
  const inBar = (x: number, v: number, shown: number, o = 1) => (
    <div style={{ position: "absolute", left: x - 120, width: 240, top: yOf(v) + 18, textAlign: "center", opacity: o,
      fontFamily: DISPLAY, fontWeight: 700, fontSize: 72, letterSpacing: TRACK.display, color: R, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
      {fmt(shown, 1)}%
    </div>
  );
  const label = (x: number, [name, sub]: [string, string]) => (
    <div style={{ position: "absolute", left: x - 200, width: 400, top: CEIL.labelY, textAlign: "center" }}>
      <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: TYPE.label, letterSpacing: TRACK.headline, color: W, lineHeight: 1.1 }}>{name}</div>
      <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: TYPE.labelSm, letterSpacing: TRACK.headline, color: SUB, lineHeight: 1.2 }}>{sub}</div>
    </div>
  );

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {/* ═══ the chart, on its camera ═══ */}
      <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transformOrigin: "0 0", transform: `translate(${cam.tx}px, ${cam.ty}px) scale(${cam.s})` }}>
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <rect x={CEIL.left} y={CEIL.base} width={CEIL.right - CEIL.left} height={5} fill={W} />
          <rect x={tb.x - tb.w / 2} y={yOf(tirz.value)} width={tb.w} height={tirz.value * CEIL.ppt} fill={W} />
          {/* the combo's full height, kept as a dashed outline while it is drained */}
          {drainQ > 0 && liftQ < 1 ? (
            <rect x={cb.x - cb.w / 2} y={yOf(combo.value)} width={cb.w} height={(combo.value - ceil0) * CEIL.ppt} fill="none" stroke={W} strokeWidth={5} strokeDasharray="16 12" opacity={drainQ} />
          ) : null}
          <rect x={cb.x - cb.w / 2} y={yOf(comboFill)} width={cb.w} height={comboFill * CEIL.ppt} fill={W} />
          {/* the old ceiling, left behind */}
          {ghostQ > 0 ? (
            <line x1={PLATE.left} y1={yOf(ceil0)} x2={lerp(PLATE.left, PLATE.right, ghostQ)} y2={yOf(ceil0)} stroke={W} strokeWidth={5} strokeDasharray="14 12" opacity={0.85} />
          ) : null}
          {/* the plate */}
          {ms >= tPlate ? <rect x={PLATE.left} y={plateBottom - PLATE.h} width={PLATE.right - PLATE.left} height={PLATE.h} fill={W} /> : null}
        </svg>
        {inBar(tb.x, tirz.value, tirz.value)}
        {inBar(cb.x, comboFill, combo.value, 1 - drainQ * (1 - liftQ) * 0.7)}
        {ms >= tPlate ? (
          <div style={{ position: "absolute", left: PLATE.left + 28, width: PLATE.right - PLATE.left - 56, top: plateBottom - PLATE.h, height: PLATE.h, display: "flex", alignItems: "center", justifyContent: "space-between",
            fontFamily: DISPLAY, fontWeight: 700, fontSize: TYPE.label, letterSpacing: TRACK.headline, color: R }}>
            <span>{plate.label}</span>
            <span style={{ opacity: plateValO, fontVariantNumeric: "tabular-nums" }}>{liftQ > 0 ? fmt(plateVal, 1) : "~15"}%</span>
          </div>
        ) : null}
        {ghostQ > 0 ? (
          <div style={{ position: "absolute", left: PLATE.left + 10, top: yOf(ceil0) - 52, opacity: ghostQ, fontFamily: DISPLAY, fontWeight: 700, fontSize: TYPE.labelSm, letterSpacing: TRACK.headline, color: W, whiteSpace: "nowrap" }}>
            {lift.ghostLabel}
          </div>
        ) : null}
        {label(cb.x, names.combo)}
        {label(tb.x, names.tirz)}
      </div>

      {/* the amylin peptide's flight (screen space at full camera) */}
      {amyO > 0 ? (
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
          <g transform={`translate(${amyX} ${amyY}) scale(${amyS}) translate(${-amyX} ${-amyY})`}>
            <Peptide x={amyX} y={amyY} q={1} color={W} variant="amylin" />
          </g>
        </svg>
      ) : null}

      {/* the phase track */}
      {phaseO > 0 ? (
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: phaseO }}>
          <line x1={220} y1={290} x2={lerp(220, 860, p3Q)} y2={290} stroke={W} strokeWidth={5} strokeDasharray="14 12" />
          <circle cx={220} cy={290} r={20} fill={W} />
          {p3Q > 0 ? <circle cx={860} cy={290} r={20} fill="none" stroke={W} strokeWidth={5} strokeDasharray="8 7" opacity={p3Q} /> : null}
          {zipQ > 0 ? <rect x={lerp(220, 800, zipQ) - 7} y={262} width={14} height={56} fill={W} /> : null}
          <text x={220} y={360} textAnchor="middle" fontFamily={DISPLAY} fontWeight={700} fontSize={TYPE.labelSm} fill={W}>{phase.from}</text>
          {p3Q > 0 ? <text x={860} y={360} textAnchor="middle" fontFamily={DISPLAY} fontWeight={700} fontSize={TYPE.labelSm} fill={W} opacity={p3Q}>{phase.to}</text> : null}
        </svg>
      ) : null}

      {/* the field, on the corner camera */}
      {ms >= tRise ? (
        <>
          <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
            {rivalXs.map((x, i) =>
              riseQs[i] > 0 ? (
                <rect key={i} x={x - 40} y={lerp(base, oldY, riseQs[i])} width={80} height={(base - oldY) * riseQs[i]} fill="none" stroke={W} strokeWidth={4} strokeDasharray="12 10" />
              ) : null
            )}
            {matchQ > 0 ? <line x1={140} y1={plateY} x2={lerp(140, 480, matchQ)} y2={plateY} stroke={W} strokeWidth={5} strokeDasharray="14 12" /> : null}
            {againQ > 0 ? (
              <rect x={comboScreen - 66} y={lerp(plateTopScreen, plateTopScreen - 260, againQ)} width={132} height={260 * againQ} fill="none" stroke={W} strokeWidth={4} strokeDasharray="12 10" />
            ) : null}
          </svg>
          <div style={{ position: "absolute", left: rivalXs[0] - 60, width: rivalXs[field.n - 1] - rivalXs[0] + 120, top: base + 16, textAlign: "center", opacity: k(tRise, 200),
            fontFamily: DISPLAY, fontWeight: 700, fontSize: TYPE.labelSm, letterSpacing: TRACK.headline, color: W }}>
            {field.label}
          </div>
          {matchQ > 0 ? (
            <div style={{ position: "absolute", left: 140, top: plateY - 14, transform: `translateY(-100%) scale(${interpolate(ms, [tMatch, tMatch + 300], [1.25, 1], { ...CLAMP, easing: EASE })})`, transformOrigin: "left bottom", opacity: k(tMatch, 120),
              fontFamily: DISPLAY, fontWeight: 700, fontSize: 64, letterSpacing: TRACK.display, color: W, lineHeight: 1 }}>
              {match.label}
            </div>
          ) : null}
          {againQ > 0 ? (
            <div style={{ position: "absolute", left: comboScreen, top: plateTopScreen - 290, transform: "translate(-50%,-100%)", opacity: clamp01(againQ * 2), whiteSpace: "nowrap",
              fontFamily: DISPLAY, fontWeight: 700, fontSize: TYPE.labelSm, letterSpacing: TRACK.headline, color: W }}>
              {again.label}
            </div>
          ) : null}
        </>
      ) : null}

      {/* narration */}
      {lines.map((l, i) => {
        const t0 = at(l, [tPush, tAmy, tPhase, tField][i] ?? from, from);
        const t1 = i < lines.length - 1 ? at(lines[i + 1], [tAmy, tPhase, tField][i] ?? to, from) - 60 : to + 400;
        return <Phrase key={i} from={t0} to={t1} line={l.text} top={1480} size={i === 3 ? 48 : 54} color={W} restColor={SUB} restWeight={700} emphasize={l.emphasize} empColor={W} underline={l.emphasize ? W : undefined} />;
      })}
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// CeilingClose — the end card, in the video's own vocabulary (white card)
// ══════════════════════════════════════════════════════════════════════════
const MINI = { x: 240, y: 470, w: 600, h: 470, base: 890, ppt: 15, bars: { tirz: 420, combo: 660 }, bw: 120 };

export const CeilingClose: React.FC<Win & {
  tile: Cued; // the spine as a story tile ("This")
  issue: { label: string } & Cued; // the issue frame ("this week's")
  brand: Cued; // the lockup
  subscribe: { label: string } & Cued;
  link: { label: string } & Cued;
  tagline: { text: string; word?: string; ms?: number };
  settle: Cued; // the tile's plate settles one notch ("Signal")
  line: { text: string; emphasize?: string; word?: string; ms?: number };
  values: { combo: number; tirz: number; ceiling: number };
}> = ({ from, to, tile, issue, brand, subscribe, link, tagline, settle, line, values }) => {
  const ms = useMs();
  const k = useK();
  const INK = COLORS.ink;
  const R = COLORS.accent;
  const W = COLORS.paper;

  const tTile = at(tile, from + 100, from);
  const tIssue = at(issue, tTile + 450, from, tTile + 300);
  const tBrand = at(brand, tIssue + 450, from, tIssue + 300);
  const tSub = at(subscribe, tBrand + 1700, from, tBrand + 500);
  const tLink = at(link, tSub + 450, from, tSub + 300);
  const tTag = at(tagline, tLink + 900, from, tLink + 400);
  const tSettle = at(settle, tTag + 100, from, tTag);

  const tileQ = EASE(k(tTile, 420));
  const issueQ = EASE(k(tIssue, 460));
  const brandO = k(tBrand, 140);
  const brandS = interpolate(ms, [tBrand, tBrand + 320], [1.2, 1], { ...CLAMP, easing: EASE });
  const subO = k(tSub, 120);
  const subS = interpolate(ms, [tSub, tSub + 300], [1.15, 1], { ...CLAMP, easing: EASE });
  const linkQ = k(tLink, 500);
  const settleQ = EASE_IO(k(tSettle, 600));

  const y = (v: number) => MINI.base - v * MINI.ppt;
  const plateB = y(values.combo) + Math.sin(settleQ * Math.PI) * -18; // a single breath up and back on "Signal"

  if (ms < tTile - 60) return null;
  return (
    <AbsoluteFill>
      {/* the issue: stacked sheets behind the tile, drawn on "this week's" */}
      {issueQ > 0 ? (
        <>
          {[2, 1].map((n) => (
            <div key={n} style={{ position: "absolute", left: 190 + n * 14, top: 400 - n * 14, width: 700, height: 600, borderRadius: 18, border: `4px solid ${inkA(0.25)}`, background: W, opacity: issueQ }} />
          ))}
          <div style={{ position: "absolute", left: 190, top: 400, width: 700, height: 600, borderRadius: 18, border: `5px solid ${INK}`, background: W, opacity: issueQ, clipPath: `inset(0 0 ${(1 - issueQ) * 100}% 0)` }}>
            <div style={{ position: "absolute", left: 30, top: 18, fontFamily: DISPLAY, fontWeight: 700, fontSize: TYPE.labelSm, letterSpacing: TRACK.headline, color: inkA(0.55) }}>{issue.label}</div>
          </div>
        </>
      ) : null}

      {/* the spine as a story tile */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: tileQ, transform: `translateY(${(1 - tileQ) * 30}px)` }}>
        <rect x={MINI.x + 60} y={MINI.base} width={MINI.w - 120} height={4} fill={INK} />
        <rect x={MINI.bars.tirz - MINI.bw / 2} y={y(values.tirz)} width={MINI.bw} height={values.tirz * MINI.ppt} fill={INK} />
        <rect x={MINI.bars.combo - MINI.bw / 2} y={y(values.combo)} width={MINI.bw} height={values.combo * MINI.ppt} fill={INK} />
        <rect x={MINI.bars.combo - MINI.bw / 2} y={y(values.combo)} width={MINI.bw} height={(values.combo - values.ceiling) * MINI.ppt} fill={R} />
        <line x1={MINI.x + 40} y1={y(values.ceiling)} x2={MINI.x + MINI.w - 40} y2={y(values.ceiling)} stroke={INK} strokeWidth={4} strokeDasharray="12 10" opacity={0.6} />
        <rect x={MINI.x + 40} y={plateB - 26} width={MINI.w - 80} height={26} fill={INK} />
      </svg>

      {brandO > 0 ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 210, display: "flex", justifyContent: "center", opacity: brandO, transform: `scale(${brandS})` }}>
          <Wordmark size={120} mark="wordmark" />
        </div>
      ) : null}

      <div style={{ position: "absolute", left: 90, right: 90, top: 1050, opacity: clamp01(interpolate(ms, [tTile - 80, tTile], [0, 1], CLAMP)) }}>
        <FlowLine from={at(line, tTile, from)} to={to} line={line.text} size={60} color={INK} restColor={inkA(0.55)} restWeight={700} emphasize={line.emphasize} empColor={INK} lineHeight={1.1} align="center" />
      </div>

      {subO > 0 ? (
        <div style={{ position: "absolute", left: 140, right: 140, top: 1230, height: 112, background: R, display: "flex", alignItems: "center", justifyContent: "center", opacity: subO, transform: `scale(${subS})`,
          fontFamily: DISPLAY, fontWeight: 700, fontSize: 56, letterSpacing: TRACK.headline, color: W }}>
          {subscribe.label}
        </div>
      ) : null}
      {linkQ > 0 ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: 1370, textAlign: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: 44, letterSpacing: TRACK.headline, color: INK }}>
          {link.label.slice(0, Math.round(link.label.length * linkQ))}
        </div>
      ) : null}
      {ms >= tTag - 80 ? (
        <div style={{ position: "absolute", left: 90, right: 90, top: 1460 }}>
          <FlowLine from={tTag} to={to} line={tagline.text} size={64} color={INK} lineHeight={1.1} align="center" />
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
