// ─────────────────────────────────────────────────────────────────────────
// KIT · neo — AN mRNA CANCER THERAPY AND THE DRUG IT RIDES ON. Added on the
// Merck × Moderna intismeran reel, 2026-10-17 (VERTICAL 9:16). Built under the
// one-mover rule (09-30) and the frame budget (10-05): each cue gets ONE
// motion, anything landed goes still, a finished idea retires.
//
// THE SPINE is THE PAIR (`Pair`): a solid Keytruda bar with an intismeran plug
// seated on top of it. Born in §1, carried across tumour types in §3, set on
// the edge of Keytruda's exclusivity in §4. Grammar for the whole piece:
// solid = happened (the melanoma win, trials running); dashed / hollow = not yet.
//
// `CohortHook` (red): "1,137 resected melanoma patients." The figure counts
// from 1 while it is voiced and a field of exactly 1,137 dots fills with it
// (the count, enacted: one motion, two readouts). The label lands word by word.
//
// `PairTrial` (white card): "Merck and Moderna's intismeran autogene plus
// Keytruda just met both endpoints in the Phase 3 INTerpath-001 trial." The
// kicker names the companies; the red plug draws; on "plus" the Keytruda bar
// slides in under it and the plug seats; the kicker retires; two empty boxes
// on "both", ticked in turn on "endpoints"; the trial plate stamps.
//
// `Firsts` (red): two "First" rows. Row 1 lands centred, travels up on "and";
// row 2 lands under it; on "neoantigen" a row of patients draws, each with a
// DIFFERENT sequence strand (one therapy, made per patient); "Ever." stamps.
//
// Every onset is a spoken word with an optional ms pin, clamped monotonic.
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { CLAMP, clamp01, COLORS, DISPLAY, INK_SUB, INK_SUB_ON_RED, TRACK, caps, inkA, useMs } from "./core";
import { FlowLine } from "./flowline";
import { TYPE } from "../style";
import { at, lerp, useK, type Cued, type Win } from "./elora";

const EASE = Easing.out(Easing.cubic);
const EASE_IO = Easing.inOut(Easing.cubic);
const popStyle = (k: number, rise = 20): React.CSSProperties => ({ opacity: clamp01(k * 1.6), transform: `translateY(${(1 - EASE(k)) * rise}px)` });
const fadeOut = (ms: number, to: number) => clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));

// ══════════════════════════════════════════════════════════════════════════
// CohortHook — 1,137 patients, counted and drawn (red world)
// ══════════════════════════════════════════════════════════════════════════
export const COHORT = { figTop: 300, figSize: 250, cols: 41, gap: 21, r: 7, fieldTop: 640, labelTop: 1290 };

export const CohortHook: React.FC<Win & {
  figure: { value: number } & Cued; // the count starts on this word
  end: Cued; // ...and lands just before this one
  label: ({ text: string } & Cued)[]; // word by word
}> = ({ from, to, figure, end, label }) => {
  const ms = useMs();
  const k = useK();
  const W = COLORS.paper;
  const C = COHORT;

  const tFig = at(figure, from + 60, from);
  const tEnd = at(end, tFig + 1900, from, tFig + 600);
  let prev = tEnd - 300;
  const tWords = label.map((w) => (prev = at(w, prev + 600, from, prev + 120)));
  const vis = fadeOut(ms, to);
  if (ms < tFig - 60 || vis <= 0) return null;

  // the count starts at 1 (never a "0" frame) and lands ~150ms before the next word
  const q = EASE_IO(k(tFig, Math.max(500, tEnd - tFig - 150)));
  const v = Math.max(1, Math.round(1 + (figure.value - 1) * q));
  const fieldW = (C.cols - 1) * C.gap;
  const x0 = 540 - fieldW / 2;
  const rows = Math.ceil(figure.value / C.cols);
  const fieldIn = k(tFig - 40, 200);

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: C.figTop, textAlign: "center", fontFamily: DISPLAY, fontWeight: 700, color: W,
        fontSize: C.figSize, letterSpacing: TRACK.display, lineHeight: 1, opacity: k(tFig - 40, 140), fontVariantNumeric: "tabular-nums" }}>
        {v.toLocaleString("en-US")}
      </div>
      <svg width={1080} height={(rows - 1) * C.gap + C.r * 2 + 4} style={{ position: "absolute", left: 0, top: C.fieldTop - C.r - 2, opacity: fieldIn }}>
        {Array.from({ length: figure.value }).map((_, i) => {
          const cx = x0 + (i % C.cols) * C.gap;
          const cy = C.r + 2 + Math.floor(i / C.cols) * C.gap;
          return <circle key={i} cx={cx} cy={cy} r={C.r} fill={W} opacity={i < v ? 1 : 0.2} />;
        })}
      </svg>
      <div style={{ position: "absolute", left: 90, right: 90, top: C.labelTop, textAlign: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: 76,
        letterSpacing: TRACK.headline, lineHeight: 1.12, color: W }}>
        {label.map((w, i) => (
          <span key={i} style={{ opacity: clamp01(k(tWords[i], 220) * 1.4) }}>{w.text}{i < label.length - 1 ? " " : ""}</span>
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// Pair — the spine glyph: the intismeran plug seated on the Keytruda bar
// ══════════════════════════════════════════════════════════════════════════
export const PAIR = { barW: 820, barH: 124, plugW: 560, plugH: 176, lift: 34 };

/** `cx`/`barTop` place the bar; the plug sits on it. `plugK` draws the plug,
 *  `barK` slides the bar in from the left, `seat` lowers the plug flush.
 *  `tone`: "card" = ink bar on the white card; "dark" = white bar on ink/red. */
export const Pair: React.FC<{
  cx: number; barTop: number; tone: "card" | "dark";
  plugK?: number; barK?: number; seat?: number; scale?: number;
  plug?: { name: string; sub?: string }; bar?: string;
}> = ({ cx, barTop, tone, plugK = 1, barK = 1, seat = 1, scale = 1, plug = { name: "intismeran", sub: "autogene" }, bar = "Keytruda" }) => {
  const P = PAIR;
  const barBg = tone === "card" ? COLORS.ink : COLORS.paper;
  const barFg = tone === "card" ? COLORS.paper : COLORS.ink;
  const plugTop = barTop - P.plugH - P.lift * (1 - EASE(seat));
  const barX = lerp(-P.barW - 60, cx - P.barW / 2, EASE_IO(barK));
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: 1920, transform: `scale(${scale})`, transformOrigin: `${cx}px ${barTop}px` }}>
      {barK > 0 ? (
        <div style={{ position: "absolute", left: barX, top: barTop, width: P.barW, height: P.barH, borderRadius: 22, background: barBg, color: barFg,
          display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: 62, letterSpacing: TRACK.headline }}>
          {bar}
        </div>
      ) : null}
      {plugK > 0 ? (
        <div style={{ position: "absolute", left: cx - P.plugW / 2, top: plugTop, width: P.plugW, height: P.plugH, borderRadius: "26px 26px 6px 6px",
          background: COLORS.accent, color: COLORS.paper, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
          opacity: clamp01(plugK * 1.6), transform: `translateY(${(1 - EASE(plugK)) * 24}px)` }}>
          <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 66, letterSpacing: TRACK.headline, lineHeight: 1 }}>{plug.name}</div>
          {plug.sub ? <div style={{ ...caps(INK_SUB_ON_RED, TYPE.labelSm), marginTop: 12 }}>{plug.sub}</div> : null}
        </div>
      ) : null}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// PairTrial — the pair is born and meets both endpoints (white card)
// ══════════════════════════════════════════════════════════════════════════
export const TRIAL = { kickTop: 340, barTop: 770, rowsTop: 980, rowGap: 130, box: 76, rowLeft: 100, plateTop: 1310 };

const Tick: React.FC<{ k: number; size: number; color: string }> = ({ k, size, color }) => (
  <svg width={size} height={size} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
    <path d={`M${size * 0.2} ${size * 0.52} L${size * 0.42} ${size * 0.74} L${size * 0.82} ${size * 0.28}`} fill="none" stroke={color} strokeWidth={10}
      strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - EASE(k)} />
  </svg>
);

export const PairTrial: React.FC<Win & {
  kicker: { a: string; b: string; word?: string; ms?: number; bWord?: string; bMs?: number };
  plug: { name: string; sub: string; word?: string; ms?: number; subWord?: string; subMs?: number };
  bar: { label: string } & Cued; // slides in, the plug seats
  retire: Cued; // the kicker retires
  boxes: { labels: [string, string] } & Cued; // two empty boxes
  ticks: Cued; // ticked in turn
  plate: { phase: string; name: string; word?: string; ms?: number; nameWord?: string; nameMs?: number };
}> = ({ from, to, kicker, plug, bar, retire, boxes, ticks, plate }) => {
  const ms = useMs();
  const k = useK();
  const INK = COLORS.ink;
  const T = TRIAL;

  const tKick = at({ word: kicker.word, ms: kicker.ms }, from + 400, from);
  const tKickB = at({ word: kicker.bWord, ms: kicker.bMs }, tKick + 500, from, tKick + 200);
  const tPlug = at({ word: plug.word, ms: plug.ms }, tKickB + 500, from, tKickB + 250);
  const tSub = at({ word: plug.subWord, ms: plug.subMs }, tPlug + 600, from, tPlug + 300);
  const tBar = at(bar, tSub + 600, from, tSub + 250);
  const tSeat = tBar + 480; // after the bar has arrived: one mover at a time
  const tRetire = at(retire, tSeat + 700, from, tSeat + 250);
  const tBoxes = at(boxes, tRetire + 400, from, tRetire + 200);
  const tTick1 = at(ticks, tBoxes + 300, from, tBoxes + 250);
  const tTick2 = tTick1 + 380;
  const tPlate = at({ word: plate.word, ms: plate.ms }, tTick2 + 900, from, tTick2 + 300);
  const tName = at({ word: plate.nameWord, ms: plate.nameMs }, tPlate + 400, from, tPlate + 200);
  const vis = fadeOut(ms, to);
  if (ms < tKick - 60 || vis <= 0) return null;

  const kickOut = 1 - k(tRetire, 280);

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: T.kickTop, textAlign: "center", opacity: kickOut }}>
        <span style={{ ...caps(COLORS.grayText), ...popStyle(k(tKick, 260), 12), display: "inline-block" }}>{kicker.a}</span>
        <span style={{ ...caps(COLORS.grayText), ...popStyle(k(tKickB, 260), 12), display: "inline-block", marginLeft: 16 }}>{kicker.b}</span>
      </div>

      <Pair cx={540} barTop={T.barTop} tone="card" plugK={k(tPlug, 320)} barK={k(tBar, 460)} seat={k(tSeat, 220)}
        plug={{ name: plug.name, sub: ms >= tSub ? plug.sub : undefined }} bar={bar.label} />

      {boxes.labels.map((label, i) => {
        const tk = i === 0 ? tTick1 : tTick2;
        return (
          <div key={i} style={{ position: "absolute", left: T.rowLeft, right: 60, top: T.rowsTop + i * T.rowGap, height: T.box, display: "flex", alignItems: "center", gap: 30,
            ...popStyle(k(tBoxes + i * 120, 260), 14) }}>
            <div style={{ position: "relative", width: T.box, height: T.box, flex: "none", borderRadius: 14, border: `6px solid ${INK}`, boxSizing: "border-box",
              background: k(tk, 160) > 0 ? COLORS.accent : "transparent", borderColor: k(tk, 160) > 0 ? COLORS.accent : INK }}>
              <div style={{ position: "absolute", left: -6, top: -6 }}><Tick k={k(tk, 260)} size={T.box} color={COLORS.paper} /></div>
            </div>
            <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 46, letterSpacing: TRACK.headline, color: INK, whiteSpace: "nowrap" }}>{label}</div>
          </div>
        );
      })}

      <div style={{ position: "absolute", left: 0, right: 0, top: T.plateTop, display: "flex", justifyContent: "center", ...popStyle(k(tPlate, 260), 16) }}>
        <div style={{ display: "flex", alignItems: "center", gap: 22, padding: "24px 44px", borderRadius: 20, border: `6px solid ${INK}`, fontFamily: DISPLAY,
          fontWeight: 700, fontSize: 54, letterSpacing: TRACK.headline, color: INK, whiteSpace: "nowrap" }}>
          <span>{plate.phase}</span>
          <span style={{ color: inkA(0.3), opacity: clamp01(k(tName, 220) * 1.4) }}>·</span>
          <span style={{ opacity: clamp01(k(tName, 220) * 1.4) }}>{plate.name}</span>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// Firsts — two firsts, and one therapy made per patient (red world)
// ══════════════════════════════════════════════════════════════════════════
export const FIRSTS = { row1Solo: 700, row1Top: 230, row2Top: 610, firstSize: 150, subSize: 60, subTop: 172, subLine: 70,
  heads: 1040, strandTop: 1086, strandH: 270, xs: [165, 315, 465, 615, 765, 915], stampTop: 1430 };

// a strand: 12 ticks whose lengths come from a per-patient seed, so no two strands match
const tickLens = (seed: number) => Array.from({ length: 12 }).map((_, i) => 0.3 + 0.7 * Math.abs(Math.sin(seed * 12.9898 + i * 78.233) * 43758.5453 % 1));

const Row: React.FC<{ top: number; first: string; lines: { text: string; k: number }[]; k: number }> = ({ top, first, lines, k }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", color: COLORS.paper }}>
    <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: FIRSTS.firstSize, letterSpacing: TRACK.display, lineHeight: 1, opacity: clamp01(k * 2),
      transform: `scale(${lerp(1.18, 1, EASE(k))})` }}>{first}</div>
    {lines.map((l, i) => (
      <div key={i} style={{ position: "absolute", left: 80, right: 80, top: FIRSTS.subTop + i * FIRSTS.subLine, fontFamily: DISPLAY, fontWeight: 700,
        fontSize: FIRSTS.subSize, letterSpacing: TRACK.headline, lineHeight: 1, color: i === 0 ? COLORS.paper : INK_SUB_ON_RED, ...popStyle(l.k, 14) }}>{l.text}</div>
    ))}
  </div>
);

export const Firsts: React.FC<Win & {
  first: string;
  one: { lines: [string, string]; word?: string; ms?: number; aWord?: string; aMs?: number; bWord?: string; bMs?: number };
  move: Cued; // row 1 travels up
  two: { lines: [string, string]; word?: string; ms?: number; subWord?: string; subMs?: number };
  strands: Cued; // the patients draw, one strand each
  stamp: { label: string } & Cued;
}> = ({ from, to, first, one, move, two, strands, stamp }) => {
  const ms = useMs();
  const k = useK();
  const F = FIRSTS;
  const W = COLORS.paper;

  const t1 = at({ word: one.word, ms: one.ms }, from + 200, from);
  const t1a = at({ word: one.aWord, ms: one.aMs }, t1 + 700, from, t1 + 300);
  const t1b = at({ word: one.bWord, ms: one.bMs }, t1a + 1200, from, t1a + 300);
  const tMove = at(move, t1b + 1400, from, t1b + 400);
  const t2 = at({ word: two.word, ms: two.ms }, tMove + 800, from, tMove + 520);
  const t2s = at({ word: two.subWord, ms: two.subMs }, t2 + 600, from, t2 + 300);
  const tStr = at(strands, t2s + 1000, from, t2s + 300);
  const STEP = 90;
  const tStamp = at(stamp, tStr + 6 * STEP + 300, from, tStr + 6 * STEP);
  const vis = fadeOut(ms, to);
  if (ms < t1 - 60 || vis <= 0) return null;

  const row1Top = lerp(F.row1Solo, F.row1Top, EASE_IO(k(tMove, 500)));
  const stampK = k(tStamp, 240);

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <Row top={row1Top} first={first} k={k(t1, 260)} lines={[{ text: one.lines[0], k: k(t1a, 260) }, { text: one.lines[1], k: k(t1b, 260) }]} />
      {ms >= t2 - 40 ? (
        <Row top={F.row2Top} first={first} k={k(t2, 260)} lines={[{ text: two.lines[0], k: k(t2s, 260) }, { text: two.lines[1], k: k(t2s + 120, 260) }]} />
      ) : null}

      {ms >= tStr ? (
        <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
          {F.xs.map((x, i) => {
            const p = k(tStr + i * STEP, 260);
            if (p <= 0) return null;
            const lens = tickLens(i + 3);
            return (
              <g key={i} opacity={clamp01(p * 1.6)}>
                <circle cx={x} cy={F.heads} r={24} fill={W} />
                <line x1={x} y1={F.strandTop} x2={x} y2={F.strandTop + F.strandH * EASE(p)} stroke={W} strokeWidth={4} />
                {lens.map((l, j) => {
                  const y = F.strandTop + 12 + j * ((F.strandH - 24) / (lens.length - 1));
                  if (y > F.strandTop + F.strandH * EASE(p)) return null;
                  const half = 46 * l;
                  return <line key={j} x1={x - half} y1={y} x2={x + half} y2={y} stroke={W} strokeWidth={8} strokeLinecap="round" />;
                })}
              </g>
            );
          })}
        </svg>
      ) : null}

      {stampK > 0 ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: F.stampTop, display: "flex", justifyContent: "center", opacity: clamp01(stampK * 3) }}>
          <div style={{ padding: "18px 52px", borderRadius: 20, background: W, color: COLORS.accent, fontFamily: DISPLAY, fontWeight: 700, fontSize: 84,
            letterSpacing: TRACK.display, lineHeight: 1, transform: `rotate(-3deg) scale(${lerp(1.4, 1, EASE(stampK))})` }}>{stamp.label}</div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// BeyondLine — the signal is bigger than melanoma (ink, over a FootageScrim)
// ══════════════════════════════════════════════════════════════════════════
// "But today's signal is bigger than melanoma. Merck and Moderna detailed how
// they plan to extend beyond it." The line flows in word by word (the phrase
// set bold white, the rest regular: the plug keeps the scene's one red); on
// "melanoma" a GROUND line draws with its label (melanoma is where the pair
// stands, not another bar: Nel's note, 2026-10-17, a white tile under the
// white Keytruda bar read as a third block); the line retires in the pause;
// on "Merck" the pair drops onto the ground and goes still; "Their plan" lands
// on "plan"; on "extend" a DASHED trunk drops from the ground and branches to
// three DASHED "?" tiles: the next tumours, unnamed until the next scene.
export const BEYOND = { lineTop: 300, kickTop: 500, barTop: 740, pairScale: 0.66, ground: { x0: 250, x1: 830, y: 836 }, groundLabelTop: 862,
  trunkTop: 930, branchY: 1060, tiles: { xs: [230, 540, 850], top: 1140, w: 230, h: 110 } };

export const BeyondLine: React.FC<Win & {
  line: { text: string; emphasize: string };
  ground: { label: string } & Cued;
  retire: Cued; // the line leaves (in the pause)
  pair: Cued; // drops onto the ground
  plan: { label: string } & Cued;
  extend: Cued; // the dashed trunk, branches and "?" tiles
}> = ({ from, to, line, ground, retire, pair, plan, extend }) => {
  const ms = useMs();
  const k = useK();
  const W = COLORS.paper;
  const B = BEYOND;
  const T = B.tiles;

  const tGround = at(ground, from + 2200, from);
  const tRetire = at(retire, tGround + 450, from, tGround + 300);
  const tPair = at(pair, tRetire + 500, from, tRetire + 300);
  const tPlan = at(plan, tPair + 1800, from, tPair + 500);
  const tExt = at(extend, tPlan + 500, from, tPlan + 300);
  const vis = fadeOut(ms, to);
  if (vis <= 0) return null;

  const lineOut = 1 - k(tRetire, 300);
  const drop = Easing.in(Easing.quad)(k(tPair, 380));
  const pairDy = lerp(-260, 0, drop);
  const groundK = EASE(k(tGround, 380));
  // the dashed trunk + branches draw DOWN as one sweep (a revealed band), then the tiles land in turn
  const extK = EASE(k(tExt, 380));
  const revealH = (T.top - B.trunkTop + 4) * extK;
  const tTile = (i: number) => tExt + 300 + i * 90;

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {lineOut > 0 ? (
        <div style={{ position: "absolute", left: 90, right: 90, top: B.lineTop, opacity: lineOut }}>
          <FlowLine from={from} to={tRetire + 300} line={line.text} size={84} color={W} restColor={INK_SUB} restWeight={400} emphasize={line.emphasize} empColor={W}
            align="center" lineHeight={1.12} />
        </div>
      ) : null}

      <div style={{ position: "absolute", left: 0, right: 0, top: B.kickTop, textAlign: "center", ...popStyle(k(tPlan, 260), 12) }}>
        <span style={caps(INK_SUB)}>{plan.label}</span>
      </div>

      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        <line x1={540 - (540 - B.ground.x0) * groundK} y1={B.ground.y} x2={540 + (B.ground.x1 - 540) * groundK} y2={B.ground.y} stroke={W} strokeWidth={6} strokeLinecap="round" />
        <defs>
          <clipPath id="beyond-reveal"><rect x={0} y={B.trunkTop - 4} width={1080} height={revealH} /></clipPath>
        </defs>
        {extK > 0 ? (
          <g clipPath="url(#beyond-reveal)" fill="none" stroke={W} strokeWidth={6} strokeDasharray="18 12">
            <path d={`M540 ${B.trunkTop} V${B.branchY}`} />
            {T.xs.map((x, i) => <path key={i} d={`M540 ${B.branchY} H${x} V${T.top - 8}`} />)}
          </g>
        ) : null}
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: B.groundLabelTop, textAlign: "center", opacity: clamp01(groundK * 1.6) }}>
        <span style={caps(W)}>{ground.label}</span>
      </div>

      {T.xs.map((x, i) => {
        const p = k(tTile(i), 260);
        if (p <= 0) return null;
        return (
          <div key={i} style={{ position: "absolute", left: x - T.w / 2, top: T.top, width: T.w, height: T.h, ...popStyle(p, 14) }}>
            <svg width={T.w} height={T.h} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
              <rect x={3} y={3} width={T.w - 6} height={T.h - 6} rx={18} fill="none" stroke={W} strokeWidth={5} strokeDasharray="16 11" />
            </svg>
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontWeight: 700,
              fontSize: 56, color: INK_SUB }}>?</div>
          </div>
        );
      })}

      {ms >= tPair ? (
        <div style={{ position: "absolute", left: 0, top: pairDy, width: 1080, height: 1920, opacity: clamp01(k(tPair, 120) * 2) }}>
          <Pair cx={540} barTop={B.barTop} tone="dark" scale={B.pairScale} plug={{ name: "intismeran" }} />
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// NineTrials — nine trials with Keytruda, then the smaller tests (white card)
// ══════════════════════════════════════════════════════════════════════════
// "Nine Phase 2 and Phase 3 trials now run with Keytruda across lung,
// bladder, and kidney cancer. Smaller tests in pancreatic and gastric disease."
// Page 1: nine SOLID tiles deal out on "Nine" (the true count; never split by
// phase or assigned to a tumour); the label lands; the pair drops in as the
// header on "with Keytruda"; a row of tumour chips: melanoma (already won,
// filled) on "across", then lung, bladder, kidney on their words; one brace
// ties the WHOLE grid to the row. Page turn in the pause: the grid and chips
// leave; the header stays. Page 2: "Smaller tests" and two DASHED tiles.
export const NINE = { barTop: 560, pairScale: 0.6, labelTop: 660, tile: { w: 200, h: 120, gap: 30 }, gridTop: 740, braceTop: 1200, chipTop: 1250, chipH: 92,
  p2LabelTop: 860, p2Top: 960, p2: { w: 340, h: 130, gap: 40 } };

const Chip: React.FC<{ label: string; filled?: boolean; dashed?: boolean; k: number; w?: number; h?: number; size?: number }> = ({ label, filled, dashed, k, w, h = NINE.chipH, size = 42 }) => {
  const INK = COLORS.ink;
  return (
    <div style={{ position: "relative", height: h, width: w, padding: w ? 0 : "0 30px", display: "flex", alignItems: "center", justifyContent: "center", gap: 10,
      borderRadius: 18, background: filled ? INK : "transparent", border: dashed ? "none" : `5px solid ${INK}`, boxSizing: "border-box",
      color: filled ? COLORS.paper : INK, fontFamily: DISPLAY, fontWeight: 700, fontSize: size, letterSpacing: TRACK.headline, whiteSpace: "nowrap", ...popStyle(k, 16) }}>
      {dashed ? (
        <svg width="100%" height="100%" style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
          <rect x={3} y={3} width={(w ?? 0) - 6} height={h - 6} rx={18} fill="none" stroke={inkA(0.6)} strokeWidth={5} strokeDasharray="16 11" />
        </svg>
      ) : null}
      <span style={{ position: "relative", color: dashed ? inkA(0.7) : undefined }}>{label}</span>
      {filled ? <span style={{ position: "relative" }}>✓</span> : null}
    </div>
  );
};

export const NineTrials: React.FC<Win & {
  nine: { count: number } & Cued; // the tiles deal out
  label: { text: string } & Cued;
  pair: Cued; // the header drops in
  won: { label: string } & Cued; // the melanoma chip, filled
  tumours: ({ label: string } & Cued)[];
  brace: Cued;
  turn: Cued; // page 1 leaves
  smaller: { text: string } & Cued;
  tests: ({ label: string } & Cued)[]; // dashed
}> = ({ from, to, nine, label, pair, won, tumours, brace, turn, smaller, tests }) => {
  const ms = useMs();
  const k = useK();
  const INK = COLORS.ink;
  const N = NINE;
  const STEP = 70;

  const tNine = at(nine, from + 400, from);
  const tLabel = at(label, tNine + nine.count * STEP + 300, from, tNine + nine.count * STEP);
  const tPair = at(pair, tLabel + 2000, from, tLabel + 400);
  const tWon = at(won, tPair + 700, from, tPair + 450);
  let prev = tWon;
  const tTum = tumours.map((t) => (prev = at(t, prev + 600, from, prev + 250)));
  const tBrace = at(brace, prev + 500, from, prev + 250);
  const tTurn = at(turn, tBrace + 700, from, tBrace + 400);
  const tSmall = at(smaller, tTurn + 400, from, tTurn + 380);
  prev = tSmall;
  const tTests = tests.map((t) => (prev = at(t, prev + 900, from, prev + 300)));
  const vis = fadeOut(ms, to);
  if (ms < tNine - 60 || vis <= 0) return null;

  const page1 = 1 - k(tTurn, 360);
  const p1Dy = -60 * EASE(k(tTurn, 360));
  const gridW = 3 * N.tile.w + 2 * N.tile.gap;
  const gx = 540 - gridW / 2;
  const gridBottom = N.gridTop + 3 * N.tile.h + 2 * N.tile.gap;
  const braceK = EASE(k(tBrace, 380));
  const pairDrop = Easing.in(Easing.quad)(k(tPair, 360));

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {ms >= tPair ? (
        <div style={{ position: "absolute", left: 0, top: lerp(-220, 0, pairDrop), width: 1080, height: 1920, opacity: clamp01(k(tPair, 120) * 2) }}>
          <Pair cx={540} barTop={N.barTop} tone="card" scale={N.pairScale} plug={{ name: "intismeran" }} />
        </div>
      ) : null}

      {page1 > 0 ? (
        <div style={{ position: "absolute", inset: 0, opacity: page1, transform: `translateY(${p1Dy}px)` }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: N.labelTop, textAlign: "center", ...popStyle(k(tLabel, 260), 12) }}>
            <span style={caps(COLORS.grayText)}>{label.text}</span>
          </div>
          {Array.from({ length: nine.count }).map((_, i) => {
            const x = gx + (i % 3) * (N.tile.w + N.tile.gap);
            const y = N.gridTop + Math.floor(i / 3) * (N.tile.h + N.tile.gap);
            const p = k(tNine + i * STEP, 220);
            return (
              <div key={i} style={{ position: "absolute", left: x, top: y, width: N.tile.w, height: N.tile.h, borderRadius: 18, border: `6px solid ${INK}`,
                boxSizing: "border-box", opacity: clamp01(p * 2), transform: `scale(${lerp(0.7, 1, EASE(p))})` }} />
            );
          })}
          <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
            {braceK > 0 ? (
              <path d={`M${gx} ${gridBottom + 14} V${N.braceTop} H${gx + gridW} V${gridBottom + 14} M540 ${N.braceTop} V${N.chipTop - 10}`} fill="none" stroke={INK}
                strokeWidth={5} strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - braceK} />
            ) : null}
          </svg>
          <div style={{ position: "absolute", left: 0, right: 0, top: N.chipTop, display: "flex", justifyContent: "center", gap: 18 }}>
            <Chip label={won.label} filled k={k(tWon, 260)} />
            {tumours.map((t, i) => <Chip key={i} label={t.label} k={k(tTum[i], 260)} />)}
          </div>
        </div>
      ) : null}

      {ms >= tSmall - 40 ? (
        <>
          <div style={{ position: "absolute", left: 0, right: 0, top: N.p2LabelTop, textAlign: "center", ...popStyle(k(tSmall, 260), 12) }}>
            <span style={caps(COLORS.grayText)}>{smaller.text}</span>
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, top: N.p2Top, display: "flex", justifyContent: "center", gap: N.p2.gap }}>
            {tests.map((t, i) => <Chip key={i} label={t.label} dashed w={N.p2.w} h={N.p2.h} size={50} k={k(tTests[i], 280)} />)}
          </div>
        </>
      ) : null}
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// ExclusivityCliff — the bar runs out; a dashed bridge to a second tumour (ink)
// ══════════════════════════════════════════════════════════════════════════
// "Keytruda loses US exclusivity later this decade. If intismeran clears a
// second tumor, Merck's next decade is already pre-wired." Two pages on one
// spine (Nel flagged the first build "crowded", 2026-10-17: nine hatching
// wires, two label rows and the line art all at once).
// Page 1 — the cliff: the Keytruda bar slides in and stops at an edge; on
// "loses" a short dashed drop falls from the edge; ONE stacked label at the
// edge, "US exclusivity" on its word and "later this decade" under it on
// "later" (NO year: the source says "later this decade").
// Page 2 — the bridge: the label retires and the plug seats on the bar on
// "If"; on "clears" a DASHED bridge reaches across; a HOLLOW ring on "second"
// with its label BELOW it (a condition, never filled); on "pre-wired" one
// caption names the nine trials. The ring stays hollow.
export const CLIFF = { bar: { x: 60, y: 820, w: 520, h: 124 }, plug: { cx: 230, w: 300, h: 120 }, labelTop: 610, dropTo: 1060,
  ring: { cx: 920, r: 70 }, ringLabelGap: 26, captionTop: 1150 };

export const ExclusivityCliff: React.FC<Win & {
  bar: { label: string } & Cued;
  loses: Cued; // the drop
  label: { a: string; b: string; word?: string; ms?: number; bWord?: string; bMs?: number }; // one stacked label at the edge
  plug: { label: string } & Cued; // the label retires, the plug seats
  bridge: Cued;
  ring: { label: string } & Cued;
  caption: { text: string } & Cued;
}> = ({ from, to, bar, loses, label, plug, bridge, ring, caption }) => {
  const ms = useMs();
  const k = useK();
  const W = COLORS.paper;
  const C = CLIFF;
  const edge = C.bar.x + C.bar.w;
  const midY = C.bar.y + C.bar.h / 2;

  const tBar = at(bar, from + 400, from);
  const tLoses = at(loses, tBar + 650, from, tBar + 520);
  const tA = at({ word: label.word, ms: label.ms }, tLoses + 400, from, tLoses + 300);
  const tB = at({ word: label.bWord, ms: label.bMs }, tA + 1400, from, tA + 300);
  const tPlug = at(plug, tB + 1100, from, tB + 400);
  const tBridge = at(bridge, tPlug + 700, from, tPlug + 400);
  const tRing = at(ring, tBridge + 400, from, tBridge + 300);
  const tCap = at(caption, tRing + 2600, from, tRing + 400);
  const vis = fadeOut(ms, to);
  if (ms < tBar - 60 || vis <= 0) return null;

  const barX = lerp(-C.bar.w - 40, C.bar.x, EASE_IO(k(tBar, 480)));
  const dropK = EASE(k(tLoses, 420));
  const labelOut = 1 - k(tPlug - 300, 260); // retires before the plug lands: one mover
  const plugDrop = Easing.in(Easing.quad)(k(tPlug, 340));
  const ringX0 = C.ring.cx - C.ring.r;
  const bridgeK = EASE(k(tBridge, 420));
  const ringK = EASE(k(tRing, 380));

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        {dropK > 0 ? <line x1={edge} y1={C.bar.y + C.bar.h} x2={edge} y2={C.bar.y + C.bar.h + (C.dropTo - C.bar.y - C.bar.h) * dropK} stroke={INK_SUB} strokeWidth={6} strokeDasharray="18 12" /> : null}
        {bridgeK > 0 ? <line x1={edge + 14} y1={midY} x2={edge + 14 + (ringX0 - edge - 28) * bridgeK} y2={midY} stroke={W} strokeWidth={7} strokeDasharray="22 14" /> : null}
        {ringK > 0 ? (
          <circle cx={C.ring.cx} cy={midY} r={C.ring.r} fill="none" stroke={W} strokeWidth={7} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - ringK}
            transform={`rotate(-90 ${C.ring.cx} ${midY})`} />
        ) : null}
      </svg>

      <div style={{ position: "absolute", left: barX, top: C.bar.y, width: C.bar.w, height: C.bar.h, borderRadius: "22px 6px 6px 22px", background: W, color: COLORS.ink,
        display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: 62, letterSpacing: TRACK.headline }}>
        {bar.label}
      </div>

      {labelOut > 0 ? (
        <div style={{ position: "absolute", left: edge - 300, width: 600, top: C.labelTop, textAlign: "center", opacity: labelOut, lineHeight: 1.3 }}>
          <div style={{ ...caps(W), ...popStyle(k(tA, 260), 12) }}>{label.a}</div>
          <div style={{ ...caps(INK_SUB), ...popStyle(k(tB, 260), 12) }}>{label.b}</div>
        </div>
      ) : null}

      {ms >= tPlug ? (
        <div style={{ position: "absolute", left: C.plug.cx - C.plug.w / 2, top: lerp(C.bar.y - C.plug.h - 240, C.bar.y - C.plug.h, plugDrop), width: C.plug.w, height: C.plug.h,
          borderRadius: "24px 24px 6px 6px", background: COLORS.accent, color: W, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY,
          fontWeight: 700, fontSize: 52, letterSpacing: TRACK.headline, opacity: clamp01(k(tPlug, 120) * 2) }}>
          {plug.label}
        </div>
      ) : null}

      <div style={{ position: "absolute", left: C.ring.cx - 170, width: 340, top: midY + C.ring.r + C.ringLabelGap, textAlign: "center", ...popStyle(k(tRing + 200, 260), 12) }}>
        <span style={caps(W)}>{ring.label}</span>
      </div>
      <div style={{ position: "absolute", left: 90, right: 90, top: C.captionTop, textAlign: "center", ...popStyle(k(tCap, 280), 14) }}>
        <span style={caps(INK_SUB)}>{caption.text}</span>
      </div>
    </AbsoluteFill>
  );
};
