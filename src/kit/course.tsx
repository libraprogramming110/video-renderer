// ─────────────────────────────────────────────────────────────────────────
// KIT · course — A TREATMENT THAT ENDS vs ONE THAT NEVER DOES. Added on the
// GSK Hibsago reel, 2026-10-23 (VERTICAL 9:16).
//
// ★ DIRECTION (Nel, 2026-10-23, restating 10-22): "more interactive, out of
// mind motion graphics, but coherent, and the scenes NOT busy so they get the
// point." Each cue gets ONE spectacular move (smash zoom out of blur, a burst
// that ASSEMBLES into a ring then rests, an implosion, tiles raining in with a
// gravity drop, a camera that chases a column off the frame); landed things go
// STILL; nothing loops; no drifting grounds, no camera sway. A short camera
// punch (zoom only, no shake) is allowed on the three big impacts per scene.
//
// THE SPINE is THE COURSE: six month-tiles that drop onto a baseline and get
// CAPPED (a course that ends), set beside a column that rises out of the top
// of the frame and never closes (lifelong suppression). The short one carries
// 19%, the endless one <1%. Shared geometry in COURSE so callbacks seat on the
// same pixels.
//
// Every onset is a spoken word with an optional ms pin, clamped monotonic.
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { CLAMP, clamp01, COLORS, DISPLAY, INK_SUB_ON_RED, TRACK, caps, inkA, useAccent, useMs } from "./core";
import { LAYOUT } from "../style";
import { at, useK, type Cued, type Win } from "./elora";

const EASE = Easing.out(Easing.cubic);
const EASE_IO = Easing.inOut(Easing.cubic);
const EXPO = Easing.out(Easing.exp);
const BACK = Easing.out(Easing.back(1.7));
const fadeOut = (ms: number, to: number) => clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));
const squash = (q: number, amt: number) => (q <= 0 || q >= 1 ? 1 : 1 - amt * Math.sin(Math.PI * q));
const rand = (i: number) => { const x = Math.sin(i * 12.9898 + 78.233) * 43758.5453; return x - Math.floor(x); };
const white = (a: number) => `rgba(255,255,255,${a})`;

// ── shared motion helpers ────────────────────────────────────────────────
/** The camera: still, except a short zoom punch on each impact (no shake, no drift). */
export const Camera: React.FC<{ punches: number[]; children: React.ReactNode }> = ({ punches, children }) => {
  const ms = useMs();
  const p = punches.reduce((s, t) => s + (ms >= t ? Math.exp(-(ms - t) / 140) : 0), 0);
  return <AbsoluteFill style={{ transform: `scale(${1 + 0.045 * p})` }}>{children}</AbsoluteFill>;
};

/** Text that scrambles through random glyphs, then locks letter by letter, left to right. Ends still. */
const GLYPHS = "ABCDEFGHJKLMNPRSTUVWXYZ0123456789%<";
export const Scramble: React.FC<{ text: string; t: number; per?: number }> = ({ text, t, per = 45 }) => {
  const ms = useMs();
  if (ms < t) return <span style={{ opacity: 0 }}>{text}</span>;
  const tick = Math.floor(ms / 50);
  return (
    <span>
      {text.split("").map((c, i) => {
        const lock = t + 120 + i * per;
        if (c === " " || ms >= lock) return <span key={i}>{c}</span>;
        return <span key={i} style={{ opacity: 0.7 }}>{GLYPHS[Math.floor(rand(i * 31 + tick) * GLYPHS.length)]}</span>;
      })}
    </span>
  );
};

/** A small puff on a landing: a few particles thrown sideways, gone in half a second. */
const Dust: React.FC<{ t: number; x: number; y: number; w: number; color: string; n?: number; seed?: number }> = ({ t, x, y, w, color, n = 6, seed = 0 }) => {
  const ms = useMs();
  const q = (ms - t) / 460;
  if (q < 0 || q > 1) return null;
  return (
    <>
      {Array.from({ length: n }).map((_, i) => {
        const side = i % 2 ? 1 : -1;
        const vx = side * (50 + 160 * rand(seed + i));
        const vy = -(20 + 90 * rand(seed + i + 50));
        const e = EASE(q);
        const sz = 6 + 8 * rand(seed + i + 9);
        return <div key={i} style={{ position: "absolute", left: x + side * w * 0.5 + vx * e, top: y + vy * e + 100 * q * q, width: sz, height: sz,
          borderRadius: sz, background: color, opacity: (1 - q) * 0.8 }} />;
      })}
    </>
  );
};

/** A shockwave ring expanding from a point, once. */
const Shock: React.FC<{ t: number; x: number; y: number; r: number; color: string; dur?: number; width?: number }> = ({ t, x, y, r, color, dur = 620, width = 8 }) => {
  const ms = useMs();
  const q = (ms - t) / dur;
  if (q < 0 || q > 1) return null;
  const rr = r * EXPO(q);
  return <div style={{ position: "absolute", left: x - rr, top: y - rr, width: rr * 2, height: rr * 2, borderRadius: "50%",
    border: `${width * (1 - q) + 1}px solid ${color}`, opacity: 1 - q }} />;
};

// 6 tiles x 64px + 5 gaps x 10 = 430px tall; the lid adds 26. Baseline clears the reel's safe bottom.
export const COURSE = { base: 1480, tileW: 260, tileH: 64, gap: 10, lidH: 26, months: 6, xs: [320, 760], figSize: 132 };
export const stackH = COURSE.months * COURSE.tileH + (COURSE.months - 1) * COURSE.gap;
const tileTop = (i: number) => COURSE.base - (i + 1) * COURSE.tileH - i * COURSE.gap;

/** The six tiles + lid. `drop[i]` = ms tile i starts falling (undefined = seated); `cap` likewise.
 *  `lightAt`: tiles stand dim and light up 1→6 once from this ms (the course, counted). */
export const CourseBlock: React.FC<{ cx: number; color: string; drop?: number[]; cap?: number; extraSquash?: number; lightAt?: number }> = ({ cx, color, drop, cap, extraSquash = 1, lightAt }) => {
  const ms = useMs();
  const k = useK();
  const C = COURSE;
  const left = cx - C.tileW / 2;
  const capP = cap == null ? 1 : k(cap, 170);
  const capSq = cap == null ? 1 : squash(k(cap + 170, 240), 0.09);
  if (cap != null && drop && ms < drop[0]) return null;
  return (
    <div style={{ position: "absolute", left: 0, top: 0, width: 1080, height: C.base, transformOrigin: `${cx}px ${C.base}px`, transform: `scaleY(${capSq * extraSquash})` }}>
      {Array.from({ length: C.months }).map((_, i) => {
        const t = drop?.[i];
        const p = t == null ? 1 : k(t, 220);
        if (t != null && ms < t) return null;
        const fall = -700 * (1 - p * p);
        const spin = t == null ? 0 : (1 - p) * (rand(i) > 0.5 ? 24 : -24);
        const sq = t == null ? 1 : squash(k(t + 220, 170), 0.3);
        return (
          <div key={i} style={{ position: "absolute", left, top: tileTop(i) + fall, width: C.tileW, height: C.tileH, borderRadius: 12, background: color,
            transformOrigin: "50% 100%", transform: `rotate(${spin}deg) scale(${2 - sq}, ${sq})`,
            opacity: lightAt == null ? 1 : 0.28 + 0.72 * k(lightAt + i * 90, 120) }} />
        );
      })}
      {capP > 0 ? (
        <div style={{ position: "absolute", left: left - 22, top: C.base - stackH - C.gap - C.lidH - 560 * (1 - capP * capP), width: C.tileW + 44, height: C.lidH,
          borderRadius: 10, background: color, opacity: clamp01(capP * 3) }} />
      ) : null}
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// CourseHook — 19% inside a ring of 100 patients, then the course is born (red world)
// ══════════════════════════════════════════════════════════════════════════
export const HOOK = { cx: 540, cy: 680, ring: 390, figSize: 300, labelTop: 1150, subTop: 1256, nameKickTop: 700, nameTop: 752, nameSize: 150, stampTop: 1528 };

export const CourseHook: React.FC<Win & {
  figure: { value: number; suffix: string } & Cued;
  end: Cued; // count lands before this word
  label: { text: string } & Cued; // "Functional cure": the 19 lit dots flare once
  sub: { text: string } & Cued; // "Chronic hepatitis B" scrambles in
  retire: Cued; // implosion
  tiles: Cued; cap: Cued;
  kicker: { text: string } & Cued; name: { text: string } & Cued;
  stamp: { text: string } & Cued; date: { text: string } & Cued;
}> = ({ from, to, figure, end, label, sub, retire, tiles, cap, kicker, name, stamp, date }) => {
  const ms = useMs();
  const k = useK();
  const W = COLORS.paper;
  const H = HOOK;

  const tFig = at(figure, from + 60, from);
  const tEnd = at(end, tFig + 1400, from, tFig + 600);
  const tLabel = at(label, tEnd + 1200, from, tEnd);
  const tSub = at(sub, tLabel + 500, from, tLabel + 200);
  const tRetire = at(retire, tSub + 1500, from, tSub + 300);
  const tTiles = at(tiles, tRetire + 200, from, tRetire + 150);
  const drop = Array.from({ length: COURSE.months }).map((_, i) => tTiles + i * 105);
  const tCap = at(cap, drop[5] + 260, from, drop[5] + 240);
  const tKick = at(kicker, tCap + 500, from, tCap + 250);
  const tName = at(name, tKick + 1000, from, tKick + 300);
  const tStamp = at(stamp, tName + 700, from, tName + 300);
  const tDate = at(date, tStamp + 1500, from, tStamp + 300);
  const vis = fadeOut(ms, to);
  if (ms < tFig - 60 || vis <= 0) return null;

  const z = EXPO(k(tFig, 480));
  const q = EASE_IO(k(tFig, Math.max(500, tEnd - tFig - 300)));
  const v = Math.round(1 + (figure.value - 1) * q);
  const imp = Easing.in(Easing.cubic)(k(tRetire, 420)); // everything spirals into the centre
  const flare = EASE(k(tLabel, 320));

  const letters = name.text.split("");
  const stampP = k(tStamp, 260);
  const stampS = 1 + 1.4 * (1 - EXPO(stampP));
  const dateP = EASE(k(tDate, 300));

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <Camera punches={[tFig, tCap, tStamp]}>
        {imp < 1 ? (
          <div style={{ position: "absolute", inset: 0, transformOrigin: `${H.cx}px ${H.cy}px`, transform: `scale(${1 - imp}) rotate(${imp * 160}deg)` }}>
            <Shock t={tFig} x={H.cx} y={H.cy} r={760} color={W} width={14} />
            {/* 100 patients burst out from behind the figure and settle in a ring; 19 are lit */}
            {Array.from({ length: 100 }).map((_, i) => {
              const p = BACK(k(tFig + 80 + i * 7, 520));
              if (p <= 0) return null;
              const a = ((i / 100) * 360 - 90) * (Math.PI / 180);
              const lit = i < figure.value;
              const r = H.ring * p + (lit ? 18 * flare : 0);
              const sz = lit ? 26 + 10 * flare : 18;
              return <div key={i} style={{ position: "absolute", left: H.cx + Math.cos(a) * r - sz / 2, top: H.cy + Math.sin(a) * r - sz / 2, width: sz, height: sz,
                borderRadius: sz, background: lit ? W : white(0.28 - 0.12 * flare) }} />;
            })}
            <div style={{ position: "absolute", left: 0, right: 0, top: H.cy - H.figSize / 2 - 10, textAlign: "center", fontFamily: DISPLAY, fontWeight: 700, color: W,
              fontSize: H.figSize, letterSpacing: TRACK.display, lineHeight: 1, fontVariantNumeric: "tabular-nums",
              transform: `scale(${3.6 - 2.6 * z})`, filter: `blur(${(1 - z) * 40}px)`, opacity: clamp01(z * 2) }}>
              {v}{figure.suffix}
            </div>
            {/* the label: letters fly in from depth */}
            <div style={{ position: "absolute", left: 40, right: 40, top: H.labelTop, textAlign: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: 92,
              letterSpacing: TRACK.headline, lineHeight: 1, color: W, perspective: 800, whiteSpace: "nowrap" }}>
              {label.text.split("").map((c, i) => {
                const p = EASE(k(tLabel + i * 28, 300));
                return <span key={i} style={{ display: "inline-block", opacity: clamp01(p * 1.5), transform: `translateZ(${(1 - p) * 600}px) rotateX(${(1 - p) * -80}deg)`,
                  filter: `blur(${(1 - p) * 12}px)` }}>{c === " " ? " " : c}</span>;
              })}
            </div>
            <div style={{ position: "absolute", left: 0, right: 0, top: H.subTop, textAlign: "center", ...caps(INK_SUB_ON_RED, 50) }}>
              <Scramble text={sub.text} t={tSub} per={38} />
            </div>
          </div>
        ) : null}

        {/* the course: tiles rain in, the lid slams */}
        <CourseBlock cx={540} color={W} drop={drop} cap={tCap} />
        {drop.map((t, i) => <Dust key={i} t={t + 220} x={540} y={tileTop(i) + COURSE.tileH} w={COURSE.tileW} color={W} seed={i * 20} />)}
        <Shock t={tCap + 170} x={540} y={COURSE.base - stackH} r={620} color={W} width={10} />

        {/* the name: kicker slides in, letters drop and bounce */}
        <div style={{ position: "absolute", left: 0, right: 0, top: H.nameKickTop, textAlign: "center", ...caps(INK_SUB_ON_RED, 50),
          opacity: clamp01(k(tKick, 220) * 2), transform: `translateX(${(1 - EXPO(k(tKick, 420))) * -500}px)` }}>{kicker.text}</div>
        {ms >= tName ? (
          <div style={{ position: "absolute", left: 0, right: 0, top: H.nameTop, display: "flex", justifyContent: "center", fontFamily: DISPLAY, fontWeight: 700,
            fontSize: H.nameSize, letterSpacing: TRACK.display, lineHeight: 1, color: W, whiteSpace: "nowrap" }}>
            {letters.map((c, i) => {
              const p = BACK(k(tName + i * 60, 360));
              return <span key={i} style={{ display: "inline-block", opacity: clamp01(p * 3), transform: `translateY(${(1 - p) * -260}px) rotate(${(1 - p) * (i % 2 ? 30 : -30)}deg)` }}>{c}</span>;
            })}
          </div>
        ) : null}

        {/* the approval stamp slams under the block; the date joins it in the same flex row */}
        {ms >= tStamp ? (
          <div style={{ position: "absolute", left: 0, right: 0, top: H.stampTop, display: "flex", justifyContent: "center" }}>
            <div style={{ display: "flex", alignItems: "center", height: 88, padding: "0 36px", borderRadius: 44, background: W, color: COLORS.accent,
              fontFamily: DISPLAY, fontWeight: 700, fontSize: 50, letterSpacing: TRACK.headline, whiteSpace: "nowrap", overflow: "hidden",
              opacity: clamp01(stampP * 3), transform: `scale(${stampS}) rotate(${-9 * (1 - EXPO(stampP)) - 2}deg)` }}>
              <span>{stamp.text}</span>
              <span style={{ display: "inline-block", maxWidth: `${dateP * 6}em`, overflow: "hidden", opacity: dateP }}>
                <span style={{ color: inkA(0.35), padding: "0 0.35em" }}>·</span><Scramble text={date.text} t={tDate} per={60} />
              </span>
            </div>
          </div>
        ) : null}
      </Camera>
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// CourseVsLife — THE SPINE: a course that ends beside one that never does (white card)
// ══════════════════════════════════════════════════════════════════════════
// pillTop is in CONTENT px: with the camera up (+cam) it sits at screen y 800, beside the column.
// highTop: the 19% stands ON the lid (lid top = base - stackH - gap - lidH = 1014), in solid type on the card;
// inside the tiles it crossed the gaps between them and broke up (Nel, 2026-10-23).
export const LIFE = { colH: 2700, cam: 1100, pillTop: -300, figTop: 1130, highTop: 1014 - 132 - 16, labelTop: 1512 };

/** ∞, drawing itself once, then still. */
const Infinity8: React.FC<{ color: string; t: number }> = ({ color, t }) => {
  const k = useK();
  const len = 520;
  const p = EASE_IO(k(t, 700));
  if (p <= 0) return null;
  return (
    <svg width={150} height={76} viewBox="0 0 150 76" style={{ marginLeft: 18 }}>
      <path d="M75 38 C 55 6, 10 6, 10 38 C 10 70, 55 70, 75 38 C 95 6, 140 6, 140 38 C 140 70, 95 70, 75 38 Z" fill="none" stroke={color}
        strokeWidth={9} strokeLinecap="round" strokeDasharray={len} strokeDashoffset={len * (1 - p)} />
    </svg>
  );
};

export const CourseVsLife: React.FC<Win & {
  slide: Cued; leftLabel: string; rightLabel: string;
  grow: Cued; pill: { text: string } & Cued; back: Cued;
  low: { text: string } & Cued; lowSub: { text: string } & Cued; high: { text: string } & Cued;
}> = ({ from, to, slide, leftLabel, rightLabel, grow, pill, back, low, lowSub, high }) => {
  const ms = useMs();
  const k = useK();
  const INK = COLORS.ink;
  const RED = useAccent();
  const C = COURSE;
  const L = LIFE;

  const tSlide = at(slide, from + 300, from);
  const tGrow = at(grow, tSlide + 1500, from, tSlide + 500);
  const tPill = at(pill, tGrow + 700, from, tGrow + 400);
  const tBack = at(back, tPill + 600, from, tPill + 300);
  const tLow = at(low, tBack + 500, from, tBack + 200);
  const tHigh = at(high, tLow + 1000, from, tLow + 400);
  const tLowSub = at(lowSub, tHigh + 500, from, tHigh + 200);
  const vis = fadeOut(ms, to);
  if (ms < from - 60 || vis <= 0) return null;

  const slP = k(tSlide, 520);
  const sl = BACK(slP);
  const cxAt = (s: number) => 540 + (C.xs[0] - 540) * s;
  const cx = cxAt(sl);
  const g = Easing.in(Easing.quad)(k(tGrow, 820)); // accelerates: it does not slow down to stop
  const colH = L.colH * g;
  const up = EASE_IO(k(tGrow + 120, 700));
  const down = BACK(k(tBack - 420, 480)); // the drop back overshoots and settles
  const cam = L.cam * up * (1 - down);
  const speed = Math.abs(up - EASE_IO(k(tGrow + 100, 700))) + Math.abs(down - BACK(k(tBack - 440, 480)));

  const lowP = k(tLow, 420);
  const highP = k(tHigh, 300);
  const highY = -620 * (1 - highP * highP);
  const highSq = squash(k(tHigh + 300, 220), 0.1);
  const card = LAYOUT.card;

  return (
    <AbsoluteFill style={{ opacity: vis, clipPath: `inset(${card.top}px ${card.right}px ${card.bottom}px ${card.left}px round ${card.radius}px)` }}>
      <Camera punches={[tSlide + 300, tBack + 60, tHigh + 300]}>
        <div style={{ position: "absolute", inset: 0, transform: `translateY(${cam}px)` }}>
          {/* speed lines only while the camera travels */}
          {speed > 0.002
            ? Array.from({ length: 10 }).map((_, i) => (
                <div key={i} style={{ position: "absolute", left: 90 + rand(i) * 900, top: -1300 + rand(i + 40) * 2900 - cam * 0.6, width: 4, height: 200 + 260 * rand(i + 7),
                  borderRadius: 2, background: inkA(clamp01(speed * 25) * 0.3) }} />
              ))
            : null}

          <div style={{ position: "absolute", left: 540 - 190 - (540 - 190 - 90) * sl, width: 380 + (900 - 380) * sl, top: C.base, height: 6, borderRadius: 3, background: INK }} />

          {/* the whip left leaves a motion trail, only while it moves */}
          {slP > 0 && slP < 1
            ? [0.25, 0.5, 0.75].map((d, i) => (
                <div key={i} style={{ position: "absolute", inset: 0, opacity: 0.18 * (1 - d) }}>
                  <CourseBlock cx={cxAt(BACK(clamp01(slP - d * 0.25)))} color={RED} />
                </div>
              ))
            : null}
          <CourseBlock cx={cx} color={RED} extraSquash={highSq} />
          <Dust t={tHigh + 300} x={cx} y={L.highTop + C.figSize} w={C.tileW} color={RED} n={8} seed={500} />

          {/* the lifelong column: grows from the baseline and never shows a top */}
          {colH > 0 ? (
            <div style={{ position: "absolute", left: C.xs[1] - C.tileW / 2, top: C.base - colH, width: C.tileW, height: colH,
              background: `linear-gradient(to top, ${INK} 0%, ${INK} 72%, ${inkA(0)} 100%)` }} />
          ) : null}

          {/* "For life" + an ∞ that draws itself once; seen while the camera is up */}
          <div style={{ position: "absolute", left: 40, width: 600, top: L.pillTop, display: "flex", justifyContent: "center",
            opacity: clamp01(k(tPill, 200) * 2), transform: `scale(${1 + 0.6 * (1 - EXPO(k(tPill, 360)))}) rotate(${-6 * (1 - EXPO(k(tPill, 360)))}deg)` }}>
            <div style={{ display: "flex", alignItems: "center", padding: "14px 30px", borderRadius: 44, border: `6px solid ${INK}`, fontFamily: DISPLAY, fontWeight: 700,
              fontSize: 66, letterSpacing: TRACK.headline, color: INK, whiteSpace: "nowrap", background: COLORS.paper }}>
              {pill.text}
              <Infinity8 color={INK} t={tPill + 200} />
            </div>
          </div>

          {/* the two readouts, inside their columns */}
          {ms >= tLow ? (
            <div style={{ position: "absolute", left: C.xs[1] - C.tileW / 2, width: C.tileW, top: L.figTop, textAlign: "center", fontFamily: DISPLAY, fontWeight: 700,
              fontSize: C.figSize, letterSpacing: TRACK.display, lineHeight: 1, color: COLORS.paper, transform: `scale(${1 + 0.5 * (1 - EXPO(lowP))})` }}>
              <Scramble text={low.text} t={tLow} per={90} />
            </div>
          ) : null}
          <div style={{ position: "absolute", left: C.xs[1] - C.tileW / 2, width: C.tileW, top: L.figTop + C.figSize + 18, textAlign: "center", ...caps(COLORS.paper, 32) }}>
            <Scramble text={lowSub.text} t={tLowSub} per={30} />
          </div>
          {ms >= tHigh ? (
            <div style={{ position: "absolute", left: cx - C.tileW / 2, width: C.tileW, top: L.highTop + highY, textAlign: "center", fontFamily: DISPLAY, fontWeight: 700,
              fontSize: C.figSize, letterSpacing: TRACK.display, lineHeight: 1, color: RED, transform: `rotate(${(1 - highP) * 40}deg)` }}>{high.text}</div>
          ) : null}

          {/* names under the baseline */}
          <div style={{ position: "absolute", left: C.xs[0] - 280, width: 560, top: L.labelTop, textAlign: "center", whiteSpace: "nowrap", ...caps(INK) }}>
            <Scramble text={leftLabel} t={tSlide + 200} />
          </div>
          <div style={{ position: "absolute", left: C.xs[1] - 280, width: 560, top: L.labelTop, textAlign: "center", whiteSpace: "nowrap", ...caps(INK) }}>
            <Scramble text={rightLabel} t={tGrow} per={30} />
          </div>
        </div>
      </Camera>
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// TwoFirsts — the strand assembles, then the course drops back in (black world, over footage)
// ══════════════════════════════════════════════════════════════════════════
// Source limit: "first" is stamped ONLY on the ASO claim ("first-in-class ASO"); the second claim
// ("first drug ever to target a functional cure in six months") gets no "first" on screen.
export const FIRSTS = { kickTop: 250, headTop: 300, headSize: 150, subTop: 470, strandY: 780, beads: 18, beadR: 17, x0: 150, x1: 930, amp: 80,
  strandLabelTop: 960, aimTop: 770, aimSize: 84, tagTop: 1512 };

export const TwoFirsts: React.FC<Win & {
  kicker: { text: string } & Cued; // "Hibsago"
  head: { text: string } & Cued; // "First" smashes in
  strand: Cued; // beads fly in and snap into the strand ("antisense")
  strandLabel: { text: string; endWord?: string } & Cued; // types on across "antisense oligonucleotide"
  sub: { text: string } & Cued; // "approved in chronic hepatitis B"
  retire: Cued; // the strand falls away ("and the first drug")
  drop: Cued; // the course block falls in ("drug ever")
  aim: { lines: string[] } & Cued; // "Targets a / functional cure"
  light: Cued; // the six tiles light ("six-month course")
  tag: { text: string } & Cued; // "6-month course" under the baseline
}> = ({ from, to, kicker, head, strand, strandLabel, sub, retire, drop, aim, light, tag }) => {
  const ms = useMs();
  const k = useK();
  const W = COLORS.paper;
  const F = FIRSTS;
  const SUB = white(0.62);

  const tKick = at(kicker, from + 300, from);
  const tHead = at(head, tKick + 1000, from, tKick + 200);
  const tStrand = at(strand, tHead + 400, from, tHead + 200);
  const tLab = at(strandLabel, tStrand + 300, from, tStrand);
  const tLabEnd = at({ word: strandLabel.endWord }, tLab + 1600, from, tLab + 600);
  const tSub = at(sub, tLabEnd + 400, from, tLabEnd);
  const tRetire = at(retire, tSub + 1500, from, tSub + 300);
  const tDrop = at(drop, tRetire + 900, from, tRetire + 500);
  const tAim = at(aim, tDrop + 1400, from, tDrop + 400);
  const tLight = at(light, tAim + 1000, from, tAim + 300);
  const tTag = at(tag, tLight + 700, from, tLight + 300);
  const vis = fadeOut(ms, to);
  if (ms < tKick - 60 || vis <= 0) return null;

  // the first half falls away on "and the first drug": gravity, everything at once, one move
  const fall = Easing.in(Easing.quad)(k(tRetire, 520));
  const headP = EXPO(k(tHead, 420));

  // the strand: beads scattered across the frame fly in on a stagger and snap into a wave; the bonds draw after
  const pts = Array.from({ length: F.beads }).map((_, i) => ({
    x: F.x0 + ((F.x1 - F.x0) * i) / (F.beads - 1),
    y: F.strandY + F.amp * Math.sin(i * 0.62),
  }));
  const bondP = EASE_IO(k(tStrand + F.beads * 40 + 300, 500));
  const path = pts.map((p, i) => `${i ? "L" : "M"}${p.x} ${p.y}`).join(" ");
  const pathLen = pts.reduce((s, p, i) => (i ? s + Math.hypot(p.x - pts[i - 1].x, p.y - pts[i - 1].y) : 0), 0);

  // the label types across the spoken words
  const chars = Math.floor(clamp01(k(tLab, Math.max(400, tLabEnd - tLab + 500))) * strandLabel.text.length);

  // the course block falls in whole and squashes on landing
  const dP = k(tDrop, 420);
  const dropY = -1700 * (1 - dP * dP);
  const dSq = squash(k(tDrop + 420, 240), 0.14);

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <Camera punches={[tHead, tDrop + 420]}>
        {fall < 1 ? (
          <div style={{ position: "absolute", inset: 0, transform: `translateY(${1500 * fall}px) rotate(${fall * 8}deg)`, transformOrigin: "540px 900px" }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: F.kickTop - 60, textAlign: "center", ...caps(SUB, 46), opacity: k(tKick, 260) * (1 - headP) }}>{kicker.text}</div>
            {ms >= tHead ? (
              <div style={{ position: "absolute", left: 0, right: 0, top: F.headTop, textAlign: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: F.headSize,
                letterSpacing: TRACK.display, lineHeight: 1, color: W, transform: `scale(${3 - 2 * headP})`, filter: `blur(${(1 - headP) * 30}px)`, opacity: clamp01(headP * 2) }}>
                {head.text}
              </div>
            ) : null}
            <div style={{ position: "absolute", left: 60, right: 60, top: F.subTop, textAlign: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: 56,
              letterSpacing: TRACK.headline, lineHeight: 1.1, color: W, opacity: clamp01(k(tSub, 240) * 2), transform: `translateY(${(1 - EXPO(k(tSub, 360))) * 30}px)` }}>
              <Scramble text={sub.text} t={tSub} per={22} />
            </div>

            <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
              <path d={path} fill="none" stroke={white(0.55)} strokeWidth={6} strokeLinecap="round" strokeDasharray={pathLen} strokeDashoffset={pathLen * (1 - bondP)} />
              {pts.map((p, i) => {
                const q = BACK(k(tStrand + i * 40, 520));
                if (q <= 0) return null;
                const sx = 540 + (rand(i + 3) - 0.5) * 1600;
                const sy = 900 + (rand(i + 70) - 0.5) * 2000;
                return <circle key={i} cx={sx + (p.x - sx) * q} cy={sy + (p.y - sy) * q} r={F.beadR} fill={W} />;
              })}
            </svg>
            <div style={{ position: "absolute", left: 0, right: 0, top: F.strandLabelTop, textAlign: "center", ...caps(W, 50), whiteSpace: "nowrap" }}>
              {strandLabel.text.slice(0, chars)}
              <span style={{ opacity: 0 }}>{strandLabel.text.slice(chars)}</span>
            </div>
          </div>
        ) : null}

        {ms >= tDrop ? (
          <div style={{ position: "absolute", inset: 0, transform: `translateY(${dropY}px)` }}>
            <CourseBlock cx={540} color={W} extraSquash={dSq} lightAt={tLight} />
          </div>
        ) : null}
        <Dust t={tDrop + 420} x={540} y={COURSE.base} w={COURSE.tileW} color={W} n={10} seed={700} />

        <div style={{ position: "absolute", left: 40, right: 40, top: F.aimTop, textAlign: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: F.aimSize,
          letterSpacing: TRACK.headline, lineHeight: 1.02, color: W, perspective: 800 }}>
          {aim.lines.map((line, li) => {
            const p = EASE(k(tAim + li * 160, 340));
            return <div key={li} style={{ opacity: clamp01(p * 1.5), transform: `translateZ(${(1 - p) * 500}px) rotateX(${(1 - p) * -70}deg)`, filter: `blur(${(1 - p) * 10}px)` }}>{line}</div>;
          })}
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: F.tagTop, textAlign: "center", ...caps(SUB, 44) }}>
          <Scramble text={tag.text} t={tTag} per={30} />
        </div>
      </Camera>
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// NarrowLabel — a wide bar cut down three times, one cut per criterion (white card)
// ══════════════════════════════════════════════════════════════════════════
// The widths are schematic: the source gives no share of patients, so no figure is drawn on the bar.
export const NARROW = { headTop: 300, headSize: 104, barTop: 560, barH: 300, widths: [860, 640, 430, 230], rowTop: 1000, rowGap: 104, rowSize: 54 };

type Row = { text: string; cut: Cued; detail?: { text: string } & Cued } & Cued;

export const NarrowLabel: React.FC<Win & {
  head: { pre: string; hot: string } & Cued; // "A narrow label": the bar sweeps out with it
  squeeze: Cued; // the red "narrow" squeezes once ("narrow")
  rows: Row[]; // each lands on its words; the bar is cut on its `cut` word
}> = ({ from, to, head, squeeze, rows }) => {
  const ms = useMs();
  const k = useK();
  const INK = COLORS.ink;
  const RED = useAccent();
  const N = NARROW;

  const tHead = at(head, from + 200, from);
  const tSq = at(squeeze, tHead + 700, from, tHead + 300);
  let prev = tSq;
  const tRow = rows.map((r) => (prev = at(r, prev + 1200, from, prev + 300)));
  const tCut = rows.map((r, i) => at(r.cut, tRow[i] + 600, from, tRow[i] + 150));
  const tDet = rows.map((r, i) => (r.detail ? at(r.detail, tCut[i] + 500, from, tCut[i]) : 0));
  const vis = fadeOut(ms, to);
  if (ms < tHead - 60 || vis <= 0) return null;

  const barIn = BACK(k(tHead, 520));
  const sqP = k(tSq, 380);
  const sqX = sqP > 0 && sqP < 1 ? 1 - 0.35 * Math.sin(Math.PI * sqP) : 1;
  // the bar snaps to the next width on each cut, with a small horizontal recoil
  const cutsDone = tCut.filter((t) => ms >= t).length;
  const w = N.widths[cutsDone];
  const recoil = cutsDone ? squash(k(tCut[cutsDone - 1] + 80, 220), -0.08) : 1;

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <Camera punches={tCut}>
        {/* the heading: "narrow" in red squeezes on its word */}
        <div style={{ position: "absolute", left: 0, right: 0, top: N.headTop, display: "flex", justifyContent: "center", gap: "0.25em", fontFamily: DISPLAY, fontWeight: 700,
          fontSize: N.headSize, letterSpacing: TRACK.display, lineHeight: 1, color: INK, whiteSpace: "nowrap", opacity: clamp01(k(tHead, 260) * 2),
          transform: `translateY(${(1 - EXPO(k(tHead, 400))) * 40}px)` }}>
          <span>{head.pre}</span>
          <span style={{ color: RED, display: "inline-block", transform: `scaleX(${sqX})` }}>{head.hot}</span>
        </div>

        {/* the bar */}
        <div style={{ position: "absolute", left: 540 - (w * barIn * recoil) / 2, width: w * barIn * recoil, top: N.barTop, height: N.barH, borderRadius: 20, background: INK }} />
        {/* the cut-off sides fall away, spinning, after each cut */}
        {tCut.map((t, i) => {
          const q = k(t, 900);
          if (q <= 0 || q >= 1) return null;
          const b = N.widths[i + 1];
          const pw = (N.widths[i] - b) / 2;
          return [-1, 1].map((side) => (
            <div key={`${i}${side}`} style={{ position: "absolute", left: 540 + side * (b / 2 + pw / 2) - pw / 2 + side * 160 * q, top: N.barTop + 1300 * q * q, width: pw,
              height: N.barH, borderRadius: 14, background: inkA(0.85 - 0.6 * q), transform: `rotate(${side * 70 * q}deg)` }} />
          ));
        })}
        {/* the blade: a red line slices down each new edge just before the cut lands */}
        {tCut.map((t, i) => {
          const q = k(t - 160, 220);
          if (q <= 0 || q >= 1) return null;
          const b = N.widths[i + 1];
          return [-1, 1].map((side) => (
            <div key={`c${i}${side}`} style={{ position: "absolute", left: 540 + (side * b) / 2 - 4, top: N.barTop - 60, width: 8, height: (N.barH + 120) * EASE(q),
              background: RED, opacity: 1 - q * q }} />
          ));
        })}

        {/* the criteria: one row per cut, numbered in the same flex row; dim until its cut lands */}
        {rows.map((r, i) => {
          const p = k(tRow[i], 220);
          if (p <= 0) return null;
          return (
            <div key={i} style={{ position: "absolute", left: 80, right: 60, top: N.rowTop + i * N.rowGap, opacity: clamp01(p * 2), transform: `translateX(${(1 - EXPO(p)) * 80}px)` }}>
              <div style={{ display: "flex", alignItems: "baseline", gap: 24, fontFamily: DISPLAY, fontWeight: 700, fontSize: N.rowSize, letterSpacing: TRACK.headline,
                lineHeight: 1, color: ms >= tCut[i] ? INK : inkA(0.45), whiteSpace: "nowrap" }}>
                <span style={{ fontVariantNumeric: "tabular-nums", color: COLORS.grayText }}>{i + 1}</span>
                <span>{r.text}</span>
              </div>
              {r.detail ? (
                <div style={{ marginTop: 12, paddingLeft: 56, ...caps(COLORS.grayText, 36) }}>
                  <Scramble text={r.detail.text} t={tDet[i]} per={25} />
                </div>
              ) : null}
            </div>
          );
        })}
      </Camera>
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// DifferentFrame — 240M worldwide, then the course gets FRAMED (red world)
// ══════════════════════════════════════════════════════════════════════════
// Source limit: 240M is "more than 240 million people worldwide". It retires BEFORE the course returns,
// so it never reads as the number who can get the drug (the label is narrow).
export const FRAME = { figTop: 470, figSize: 280, subTop: 800, pillTop: 920, pad: 44, sixTop: 1556 };

export const DifferentFrame: React.FC<Win & {
  figure: { value: number } & Cued; // "240" counts while voiced
  unit: { text: string } & Cued; // "M" lands on "million"
  sub: { text: string } & Cued; // "people with chronic hep B"
  pill: { text: string } & Cued; // "Worldwide" slams
  retire: Cued; // the figure whips out ("For an")
  block: Cued; // the course drops in ("indication")
  life: { text: string } & Cued; // the lifelong column shoots up ("lifelong")
  dim: Cued; // the lifelong column fades ("that is")
  frame: Cued; // brackets snap around the course ("different frame")
  six: { text: string } & Cued; // "6 months" under the framed course
}> = ({ from, to, figure, unit, sub, pill, retire, block, life, dim, frame, six }) => {
  const ms = useMs();
  const k = useK();
  const W = COLORS.paper;
  const C = COURSE;
  const F = FRAME;

  const tFig = at(figure, from + 300, from);
  const tUnit = at(unit, tFig + 900, from, tFig + 300);
  const tSub = at(sub, tUnit + 600, from, tUnit + 200);
  const tPill = at(pill, tSub + 1500, from, tSub + 300);
  const tRetire = at(retire, tPill + 1100, from, tPill + 400);
  const tBlock = at(block, tRetire + 500, from, tRetire + 300);
  const tLife = at(life, tBlock + 900, from, tBlock + 400);
  const tDim = at(dim, tLife + 700, from, tLife + 400);
  const tFrame = at(frame, tDim + 800, from, tDim + 300);
  const tSix = at(six, tFrame + 300, from, tFrame + 200);
  const vis = fadeOut(ms, to);
  if (ms < tFig - 60 || vis <= 0) return null;

  // the hook figure: smash zoom, counting 1 → 240 across "two hundred and forty"; leaves upward, blurred
  const z = EXPO(k(tFig, 460));
  const v = Math.round(1 + (figure.value - 1) * EASE_IO(k(tFig, Math.max(400, tUnit - tFig - 120))));
  const out = Easing.in(Easing.cubic)(k(tRetire, 380));
  const unitP = BACK(k(tUnit, 320));
  const pillP = k(tPill, 260);

  // the course drops in; the lifelong column shoots up beside it, then fades
  const bP = k(tBlock, 420);
  const bY = -1700 * (1 - bP * bP);
  const bSq = squash(k(tBlock + 420, 240), 0.14);
  const g = Easing.in(Easing.quad)(k(tLife, 700));
  const colH = 1600 * g;
  const lifeO = 1 - 0.85 * EASE(k(tDim, 400));
  const baseO = clamp01(k(tBlock + 300, 300) * 2);

  // the frame: four corner brackets fly in from far outside and snap around the course
  const fP = EXPO(k(tFrame, 420));
  const box = { l: C.xs[0] - C.tileW / 2 - 22 - F.pad, r: C.xs[0] + C.tileW / 2 + 22 + F.pad, t: C.base - stackH - C.gap - C.lidH - F.pad, b: C.base + F.pad };
  const cxB = (box.l + box.r) / 2;
  const cyB = (box.t + box.b) / 2;
  const sc = 1 + 2.2 * (1 - fP);
  const arm = 70;
  const corners: [number, number, number, number][] = [[box.l, box.t, 1, 1], [box.r, box.t, -1, 1], [box.l, box.b, 1, -1], [box.r, box.b, -1, -1]];

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <Camera punches={[tFig, tBlock + 420, tFrame + 420]}>
        {out < 1 ? (
          <div style={{ position: "absolute", inset: 0, transform: `translateY(${-1500 * out}px)`, filter: `blur(${out * 24}px)` }}>
            <div style={{ position: "absolute", left: 0, right: 0, top: F.figTop, display: "flex", justifyContent: "center", alignItems: "baseline", fontFamily: DISPLAY,
              fontWeight: 700, fontSize: F.figSize, letterSpacing: TRACK.display, lineHeight: 1, color: W, fontVariantNumeric: "tabular-nums",
              transform: `scale(${3.4 - 2.4 * z})`, filter: `blur(${(1 - z) * 36}px)`, opacity: clamp01(z * 2) }}>
              <span>{v}</span>
              <span style={{ display: "inline-block", opacity: clamp01(unitP * 2), transform: `translateY(${(1 - unitP) * -160}px) scale(${0.4 + 0.6 * unitP})` }}>{unit.text}</span>
            </div>
            <div style={{ position: "absolute", left: 40, right: 40, top: F.subTop, textAlign: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: 56,
              letterSpacing: TRACK.headline, lineHeight: 1, color: W, whiteSpace: "nowrap" }}>
              <Scramble text={sub.text} t={tSub} per={20} />
            </div>
            {ms >= tPill ? (
              <div style={{ position: "absolute", left: 0, right: 0, top: F.pillTop, display: "flex", justifyContent: "center" }}>
                <div style={{ height: 92, padding: "0 40px", display: "flex", alignItems: "center", borderRadius: 46, background: W, color: COLORS.accent, fontFamily: DISPLAY,
                  fontWeight: 700, fontSize: 56, letterSpacing: TRACK.headline, whiteSpace: "nowrap", opacity: clamp01(pillP * 3),
                  transform: `scale(${1 + 1.3 * (1 - EXPO(pillP))}) rotate(${-8 * (1 - EXPO(pillP)) - 2}deg)` }}>{pill.text}</div>
              </div>
            ) : null}
          </div>
        ) : null}

        {/* the baseline, the course and the lifelong column (the §2 picture, recalled) */}
        <div style={{ position: "absolute", left: 90, right: 90, top: C.base, height: 6, borderRadius: 3, background: W, opacity: baseO }} />
        {ms >= tBlock ? (
          <div style={{ position: "absolute", inset: 0, transform: `translateY(${bY}px)` }}>
            <CourseBlock cx={C.xs[0]} color={W} extraSquash={bSq} />
          </div>
        ) : null}
        <Dust t={tBlock + 420} x={C.xs[0]} y={C.base} w={C.tileW} color={W} n={8} seed={900} />
        {colH > 0 ? (
          <>
            <div style={{ position: "absolute", left: C.xs[1] - C.tileW / 2, top: C.base - colH, width: C.tileW, height: colH, opacity: lifeO,
              background: `linear-gradient(to top, ${W} 0%, ${W} 70%, ${white(0)} 100%)` }} />
            <div style={{ position: "absolute", left: C.xs[1] - 280, width: 560, top: 1512, textAlign: "center", whiteSpace: "nowrap", ...caps(W), opacity: lifeO }}>
              <Scramble text={life.text} t={tLife} per={30} />
            </div>
          </>
        ) : null}

        {/* the frame snaps shut around the course */}
        {fP > 0
          ? corners.map(([x, y, sx, sy], i) => {
              const px = cxB + (x - cxB) * sc;
              const py = cyB + (y - cyB) * sc;
              return (
                <div key={i} style={{ position: "absolute", left: sx > 0 ? px : px - arm, top: sy > 0 ? py : py - arm, width: arm, height: arm, opacity: clamp01(fP * 2),
                  borderLeft: sx > 0 ? `10px solid ${W}` : "none", borderRight: sx < 0 ? `10px solid ${W}` : "none",
                  borderTop: sy > 0 ? `10px solid ${W}` : "none", borderBottom: sy < 0 ? `10px solid ${W}` : "none" }} />
              );
            })
          : null}
        <Shock t={tFrame + 420} x={cxB} y={cyB} r={520} color={W} width={8} />
        <div style={{ position: "absolute", left: C.xs[0] - 280, width: 560, top: F.sixTop, textAlign: "center", whiteSpace: "nowrap", ...caps(W) }}>
          <Scramble text={six.text} t={tSix} per={30} />
        </div>
      </Camera>
    </AbsoluteFill>
  );
};
