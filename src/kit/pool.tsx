// ─────────────────────────────────────────────────────────────────────────
// KIT · pool — A FUND DRAWN AS A VESSEL OF LIQUID. Added on the OrbiMed
// $3B / Asia fund reel, 2026-10-16 (VERTICAL 9:16). Built under the one-mover
// rule (09-30) and the frame budget (10-05): each cue gets ONE motion,
// anything landed goes still, a finished idea retires.
//
// THE SPINE is THE ASIA POOL (`Vessel`): an open-topped tank whose liquid AREA
// is the fund's size at true scale ($1.9B vs $1B by width; $751M vs $1B by
// height at equal width). Grammar: a DASHED lip above the rim = "over / north
// of" the stated figure (undisclosed beyond it). Born in §1 (the $3B splits),
// measured in §2 (against 2022), seated in §3, given three dashed outflows in §4.
//
// `PoolHook` (red): "$3 billion just landed in life sciences this week." The
// figure counts while voiced; on "landed" a white slab (the $3B as liquid)
// drops into frame and lands; the line lands on "this week".
//
// `PoolSplit` (ink, over a FootageScrim): "OrbiMed closed two private funds.
// $1.9 billion for the U.S. and Europe. Over $1 billion aimed at Asia." One
// full vessel arrives; on "two" it splits at a seam into two vessels sized by
// width; figures and regions stamp on their words; a dashed lip draws on
// "over"; the Asia liquid turns red on "Asia" (the scene's one red).
//
// `PoolRecord` (white card): "That Asia pool is OrbiMed's biggest ever. The
// 2022 close was $751 million. The 2026 close is north of a billion." The red
// vessel draws in alone; a stamp ("largest ASIA fund", never "largest fund");
// the stamp retires and the vessel slides right; the 2022 vessel draws at
// equal width and its liquid rises to 75.1% while "$751 million" is voiced;
// "north of" draws the dashed lip.
//
// Every onset is a spoken word with an optional ms pin, clamped monotonic.
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { CLAMP, clamp01, COLORS, DISPLAY, INK_SUB, inkA, TRACK, caps, useMs } from "./core";
import { at, lerp, useK, type Cued, type Win } from "./elora";

const EASE = Easing.out(Easing.cubic);
const EASE_IO = Easing.inOut(Easing.cubic);

// ══════════════════════════════════════════════════════════════════════════
// Vessel — the spine glyph
// ══════════════════════════════════════════════════════════════════════════
/** An open-topped tank at (x, y) = top-left of its body. `fill` 0→1 = liquid
 *  level, `draw` 0→1 strokes the outline in, `lip` 0→1 grows a dashed
 *  extension ABOVE the rim ("over / north of"), `tint` cross-fades the liquid
 *  to a second colour. */
export const Vessel: React.FC<{
  x: number; y: number; w: number; h: number;
  stroke: string; liquid: string;
  fill?: number; draw?: number; lip?: number; lipH?: number; lipColor?: string;
  tint?: { color: string; k: number };
  opacity?: number; sw?: number;
}> = ({ x, y, w, h, stroke, liquid, fill = 1, draw = 1, lip = 0, lipH = 80, lipColor, tint, opacity = 1, sw = 7 }) => {
  const id = "vessel" + React.useId().replace(/[^a-zA-Z0-9]/g, "");
  const r = Math.min(34, w / 5);
  const open = `M0 0 V${h - r} Q0 ${h} ${r} ${h} H${w - r} Q${w} ${h} ${w} ${h - r} V0`;
  const lh = h * clamp01(fill);
  const lipK = clamp01(lip);
  const lc = lipColor ?? stroke;
  return (
    <svg width={w} height={h} style={{ position: "absolute", left: x, top: y, opacity, overflow: "visible" }}>
      <defs>
        <clipPath id={id}><path d={open + " Z"} /></clipPath>
      </defs>
      <g clipPath={`url(#${id})`}>
        <rect x={0} y={h - lh} width={w} height={lh} fill={liquid} />
        {tint && tint.k > 0 ? <rect x={0} y={h - lh} width={w} height={lh} fill={tint.color} opacity={clamp01(tint.k)} /> : null}
      </g>
      <path d={open} fill="none" stroke={stroke} strokeWidth={sw} strokeLinejoin="round" strokeLinecap="round"
        pathLength={1} strokeDasharray={1} strokeDashoffset={1 - clamp01(draw)} />
      {lipK > 0 ? (
        <g fill="none" stroke={lc} strokeWidth={sw - 1} strokeDasharray="16 12">
          <path d={`M0 0 V${-lipH * lipK}`} />
          <path d={`M${w} 0 V${-lipH * lipK}`} />
          {lipK > 0.85 ? <path d={`M0 ${-lipH} H${w}`} opacity={clamp01((lipK - 0.85) / 0.15)} /> : null}
        </g>
      ) : null}
    </svg>
  );
};

/** A label stamped under a vessel, centred on cx (laid out by its string, never by an estimated x). */
const Under: React.FC<{ cx: number; top: number; children: React.ReactNode; style?: React.CSSProperties }> = ({ cx, top, children, style }) => (
  <div style={{ position: "absolute", left: cx - 300, width: 600, top, textAlign: "center", ...style }}>{children}</div>
);
const popStyle = (k: number, rise = 20): React.CSSProperties => ({ opacity: clamp01(k * 1.6), transform: `translateY(${(1 - EASE(k)) * rise}px)` });

// ══════════════════════════════════════════════════════════════════════════
// PoolHook — the hook (red world)
// ══════════════════════════════════════════════════════════════════════════
export const HOOK_POOL = { figTop: 420, slab: { x: 180, y: 960, w: 720, h: 170 }, lineTop: 1210 };

export const PoolHook: React.FC<Win & {
  figure: { value: number; prefix: string; suffix: string } & Cued; // counts while voiced
  landed: Cued; // the slab drops in and lands
  line: { text: string } & Cued;
}> = ({ from, to, figure, landed, line }) => {
  const ms = useMs();
  const k = useK();
  const W = COLORS.paper;
  const S = HOOK_POOL.slab;

  const tFig = at(figure, from + 60, from);
  const tLand = at(landed, tFig + 2000, from, tFig + 900);
  const tLine = at(line, tLand + 900, from, tLand + 500);
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));
  if (ms < tFig - 60 || vis <= 0) return null;

  // the count starts at 1, never a "$0B" frame; it lands just before "landed"
  const q = EASE(k(tFig, Math.max(500, tLand - tFig - 500)));
  const v = Math.max(1, Math.round(1 + (figure.value - 1) * q));
  const figS = interpolate(ms, [tFig, tFig + 300], [1.12, 1], { ...CLAMP, easing: EASE });

  // the slab falls under gravity and stops dead on its seat (no bounce: landed things go still)
  const drop = Easing.in(Easing.quad)(k(tLand, 420));
  const slabY = lerp(-S.h - 40, S.y, drop);
  const lineK = k(tLine, 320);

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: HOOK_POOL.figTop, textAlign: "center", fontFamily: DISPLAY, fontWeight: 700, color: W,
        fontSize: 400, letterSpacing: TRACK.display, lineHeight: 1, opacity: k(tFig - 40, 140), transform: `scale(${figS})`, fontVariantNumeric: "tabular-nums" }}>
        {figure.prefix}{v}{figure.suffix}
      </div>
      {ms >= tLand ? <div style={{ position: "absolute", left: S.x, top: slabY, width: S.w, height: S.h, borderRadius: 26, background: W }} /> : null}
      <div style={{ position: "absolute", left: 90, right: 90, top: HOOK_POOL.lineTop, textAlign: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: 64,
        letterSpacing: TRACK.headline, lineHeight: 1.12, color: W, ...popStyle(lineK) }}>
        {line.text}
      </div>
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// PoolSplit — one $3B pool becomes two funds (ink, over footage)
// ══════════════════════════════════════════════════════════════════════════
const UNIT = 250; // px of width per $1B
export const SPLIT_POOL = { top: 630, h: 520, x0: 540 - (2.9 * UNIT) / 2, part: 40, figTop: 1190, subTop: 1318, nameTop: 230, kickTop: 360 };

export const PoolSplit: React.FC<Win & {
  name: { label: string } & Cued; // the joined vessel arrives full
  split: { label: string } & Cued; // it splits at the seam
  us: { figure: string; region: string; word?: string; regionWord?: string; ms?: number; regionMs?: number };
  over: Cued; // the dashed lip on the Asia vessel
  asia: { figure: string; region: string; word?: string; regionWord?: string; ms?: number; regionMs?: number }; // regionWord also turns it red
}> = ({ from, to, name, split, us, over, asia }) => {
  const ms = useMs();
  const k = useK();
  const W = COLORS.paper;
  const P = SPLIT_POOL;

  const tName = at(name, from + 300, from);
  const tSplit = at(split, tName + 900, from, tName + 650);
  const tUs = at({ word: us.word, ms: us.ms }, tSplit + 1400, from, tSplit + 500);
  const tUsR = at({ word: us.regionWord, ms: us.regionMs }, tUs + 1200, from, tUs + 300);
  const tOver = at(over, tUsR + 1500, from, tUsR + 300);
  const tAsia = at({ word: asia.word, ms: asia.ms }, tOver + 250, from, tOver + 150);
  const tAsiaR = at({ word: asia.regionWord, ms: asia.regionMs }, tAsia + 1400, from, tAsia + 300);
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));
  if (ms < tName - 60 || vis <= 0) return null;

  const usW = 1.9 * UNIT;
  const asW = 1.0 * UNIT;
  const arrive = k(tName, 500);
  const fill = EASE(k(tName + 300, 600));
  const part = P.part * EASE_IO(k(tSplit, 450));
  const joined = ms < tSplit;
  const usX = P.x0 - part;
  const asX = P.x0 + usW + part;

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: P.nameTop, textAlign: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: 104,
        letterSpacing: TRACK.display, color: W, ...popStyle(arrive) }}>{name.label}</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: P.kickTop, textAlign: "center", ...popStyle(k(tSplit, 300), 14) }}>
        {/* a lead-in: retires once the first fund it introduced has landed (frame budget) */}
        <span style={{ ...caps(INK_SUB), opacity: 1 - k(tUs, 300) }}>{split.label}</span>
      </div>

      {joined ? (
        <Vessel x={P.x0} y={P.top} w={usW + asW} h={P.h} stroke={W} liquid={W} fill={fill} draw={EASE(arrive)} />
      ) : (
        <>
          <Vessel x={usX} y={P.top} w={usW} h={P.h} stroke={W} liquid={W} />
          <Vessel x={asX} y={P.top} w={asW} h={P.h} stroke={W} liquid={W} lip={EASE(k(tOver, 450))} lipH={90}
            tint={{ color: COLORS.accent, k: k(tAsiaR, 350) }} />
        </>
      )}

      <Under cx={usX + usW / 2} top={P.figTop} style={popStyle(k(tUs, 300))}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 110, letterSpacing: TRACK.display, color: W, lineHeight: 1 }}>{us.figure}</div>
      </Under>
      <Under cx={usX + usW / 2} top={P.subTop} style={popStyle(k(tUsR, 300), 14)}><span style={caps(INK_SUB)}>{us.region}</span></Under>
      <Under cx={asX + asW / 2} top={P.figTop} style={popStyle(k(tAsia, 300))}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 110, letterSpacing: TRACK.display, color: W, lineHeight: 1 }}>{asia.figure}</div>
      </Under>
      <Under cx={asX + asW / 2} top={P.subTop} style={popStyle(k(tAsiaR, 300), 14)}><span style={caps(W)}>{asia.region}</span></Under>
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// PoolRecord — the Asia pool against its 2022 predecessor (white card)
// ══════════════════════════════════════════════════════════════════════════
export const RECORD_POOL = { w: 280, h: 560, bottom: 1180, solo: 400, hero: 580, prior: 220, kickTop: 230, stampTop: 430, yearTop: 1218, figTop: 1272 };

export const PoolRecord: React.FC<Win & {
  kicker: { label: string };
  arrive: Cued; // the red vessel draws in alone
  stamp: { label: string } & Cued;
  prior: { year: string; figure: string; value: number; word?: string; ms?: number; drawWord?: string; drawMs?: number; figWord?: string; figMs?: number; endWord?: string; endMs?: number };
  current: { year: string; figure: string; word?: string; ms?: number; northWord?: string; northMs?: number; total: number };
}> = ({ from, to, kicker, arrive, stamp, prior, current }) => {
  const ms = useMs();
  const k = useK();
  const INK = COLORS.ink;
  const R = RECORD_POOL;

  const tArrive = at(arrive, from + 300, from);
  const tStamp = at(stamp, tArrive + 1700, from, tArrive + 900);
  const tPrior = at({ word: prior.word, ms: prior.ms }, tStamp + 1400, from, tStamp + 700); // stamp retires, hero slides
  const tDraw = at({ word: prior.drawWord, ms: prior.drawMs }, tPrior + 900, from, tPrior + 480);
  const tFig = at({ word: prior.figWord, ms: prior.figMs }, tDraw + 550, from, tDraw + 300);
  const tEnd = at({ word: prior.endWord, ms: prior.endMs }, tFig + 1100, from, tFig + 600);
  const tCur = at({ word: current.word, ms: current.ms }, tEnd + 1100, from, tEnd + 300);
  const tNorth = at({ word: current.northWord, ms: current.northMs }, tCur + 1600, from, tCur + 400);
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));
  if (ms < tArrive - 60 || vis <= 0) return null;

  const heroX = lerp(R.solo, R.hero, EASE_IO(k(tPrior, 480)));
  const heroTop = R.bottom - R.h;
  const priorH = R.h * prior.value / current.total;
  const stampIn = k(tStamp, 260);
  const stampOut = 1 - k(tPrior, 240);
  const rise = EASE(k(tFig, Math.max(600, tEnd - tFig + 300))); // the 2022 liquid rises while "$751 million" is voiced

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: R.kickTop, textAlign: "center", ...popStyle(k(tArrive, 300), 14) }}>
        <span style={caps(COLORS.grayText)}>{kicker.label}</span>
      </div>

      {stampIn > 0 && stampOut > 0 ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: R.stampTop, display: "flex", justifyContent: "center", opacity: clamp01(stampIn * 3) * stampOut }}>
          <div style={{ padding: "22px 44px", borderRadius: 20, background: INK, color: COLORS.paper, fontFamily: DISPLAY, fontWeight: 700, fontSize: 52,
            letterSpacing: TRACK.headline, transform: `rotate(-3deg) scale(${lerp(1.4, 1, EASE(stampIn))})` }}>{stamp.label}</div>
        </div>
      ) : null}

      {ms >= tDraw ? (
        <Vessel x={R.prior} y={R.bottom - priorH} w={R.w} h={priorH} stroke={inkA(0.45)} liquid={inkA(0.18)} fill={rise} draw={EASE(k(tDraw, 450))} />
      ) : null}
      <Vessel x={heroX} y={heroTop} w={R.w} h={R.h} stroke={INK} liquid={COLORS.accent} draw={EASE(k(tArrive, 500))} fill={EASE(k(tArrive + 350, 550))}
        lip={EASE(k(tNorth, 450))} lipH={100} />

      <Under cx={R.prior + R.w / 2} top={R.yearTop} style={popStyle(k(tDraw, 300), 14)}><span style={caps(COLORS.grayText)}>{prior.year}</span></Under>
      <Under cx={R.prior + R.w / 2} top={R.figTop} style={popStyle(k(tFig, 300))}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 96, letterSpacing: TRACK.display, color: inkA(0.55), lineHeight: 1 }}>{prior.figure}</div>
      </Under>
      <Under cx={R.hero + R.w / 2} top={R.yearTop} style={popStyle(k(tCur, 300), 14)}><span style={caps(INK)}>{current.year}</span></Under>
      <Under cx={R.hero + R.w / 2} top={R.figTop} style={popStyle(k(tNorth, 300))}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 96, letterSpacing: TRACK.display, color: INK, lineHeight: 1 }}>{current.figure}</div>
      </Under>
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// CheckWriter — the licensing wave and the empty seat behind it (ink, over footage)
// ══════════════════════════════════════════════════════════════════════════
// "Large pharma has spent 2026 sourcing more deals from Chinese and Asian
// biotechs. The licensing wave needed a check-writer behind it. OrbiMed just
// raised one." Pharma pops; on "sourcing" a line reaches DOWN from it; the
// biotechs' node lands where it arrives; three deal chips ride the line up one
// after another and retire into pharma; a dashed seat draws BEHIND (under) the
// biotechs; on "OrbiMed" the red vessel slides into the seat; on "raised" the
// seat turns solid and its label becomes the name.
export const CW = { pharmaTop: 280, bioTop: 880, pillH: 104, seat: { x: 390, y: 1110, w: 300, h: 330 }, vessel: { w: 220, h: 250 }, labelTop: 1470 };

const Pill: React.FC<{ top: number; label: string; style?: React.CSSProperties }> = ({ top, label, style }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top, display: "flex", justifyContent: "center", ...style }}>
    <div style={{ height: CW.pillH, padding: "0 44px", borderRadius: CW.pillH / 2, background: COLORS.paper, color: COLORS.ink, display: "flex", alignItems: "center",
      fontFamily: DISPLAY, fontWeight: 700, fontSize: 56, letterSpacing: TRACK.headline, whiteSpace: "nowrap" }}>{label}</div>
  </div>
);

export const CheckWriter: React.FC<Win & {
  pharma: { label: string } & Cued;
  sourcing: Cued; // the line reaches down
  biotechs: { label: string } & Cued;
  wave: { label: string; count: number } & Cued; // chips ride up one after another
  seat: { label: string } & Cued; // the dashed seat
  arrive: Cued; // the vessel slides in
  raised: { label: string } & Cued; // the seat turns solid, the label becomes the name
}> = ({ from, to, pharma, sourcing, biotechs, wave, seat, arrive, raised }) => {
  const ms = useMs();
  const k = useK();
  const W = COLORS.paper;
  const S = CW.seat;

  const tPharma = at(pharma, from + 400, from);
  const tSrc = at(sourcing, tPharma + 1500, from, tPharma + 400);
  const tBio = at(biotechs, tSrc + 1300, from, tSrc + 500);
  const tWave = at(wave, tBio + 1800, from, tBio + 400);
  const STEP = 450;
  const tSeat = at(seat, tWave + wave.count * STEP + 300, from, tWave + wave.count * STEP);
  const tArrive = at(arrive, tSeat + 1300, from, tSeat + 500);
  const tRaised = at(raised, tArrive + 800, from, tArrive + 520);
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));
  if (ms < tPharma - 60 || vis <= 0) return null;

  const lineTop = CW.pharmaTop + CW.pillH;
  const lineLen = (CW.bioTop - lineTop) * EASE(k(tSrc, Math.max(500, tBio - tSrc)));
  const solid = k(tRaised, 300);
  const vx = lerp(1080 + 40, S.x + (S.w - CW.vessel.w) / 2, EASE_IO(k(tArrive, 520)));
  const vy = S.y + S.h - CW.vessel.h - 30;

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        <line x1={540} y1={lineTop} x2={540} y2={lineTop + lineLen} stroke={W} strokeWidth={6} />
      </svg>

      {/* the wave: one chip at a time rides the line up and retires into pharma */}
      {Array.from({ length: wave.count }).map((_, i) => {
        const p = k(tWave + i * STEP, STEP);
        if (p <= 0 || p >= 1) return null;
        const y = lerp(CW.bioTop - 30, lineTop - 10, EASE_IO(p));
        return (
          <div key={i} style={{ position: "absolute", left: 540 - 110, top: y - 36, width: 220, height: 72, borderRadius: 14, background: COLORS.accent, color: W,
            display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: 40, letterSpacing: TRACK.body,
            opacity: clamp01(p * 6) * clamp01((1 - p) * 6) }}>{wave.label}</div>
        );
      })}

      <Pill top={CW.pharmaTop} label={pharma.label} style={popStyle(k(tPharma, 300))} />
      <Pill top={CW.bioTop} label={biotechs.label} style={popStyle(k(tBio, 300))} />

      {ms >= tSeat ? (
        <svg width={S.w + 8} height={S.h + 8} style={{ position: "absolute", left: S.x - 4, top: S.y - 4, overflow: "visible", opacity: k(tSeat, 250) }}>
          <rect x={4} y={4} width={S.w} height={S.h} rx={28} fill="none" stroke={W} strokeWidth={6} strokeDasharray="18 12" opacity={1 - solid} />
          <rect x={4} y={4} width={S.w} height={S.h} rx={28} fill="none" stroke={W} strokeWidth={6} opacity={solid} />
        </svg>
      ) : null}
      {ms >= tArrive ? <Vessel x={vx} y={vy} w={CW.vessel.w} h={CW.vessel.h} stroke={W} liquid={COLORS.accent} /> : null}

      <div style={{ position: "absolute", left: 0, right: 0, top: CW.labelTop, textAlign: "center" }}>
        <span style={{ ...caps(INK_SUB), opacity: k(tSeat, 300) * (1 - solid), position: "absolute", left: 0, right: 0 }}>{seat.label}</span>
        <span style={{ ...caps(W), opacity: solid, position: "absolute", left: 0, right: 0 }}>{raised.label}</span>
      </div>
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// PoolTell — three dashed outflows, none chosen (white card)
// ══════════════════════════════════════════════════════════════════════════
// "Watch where that $1 billion deploys first. Oncology, obesity, or antibody
// drug conjugates. That's your tell on which Asian platforms just got
// re-rated." The red vessel draws in at the top; its label; on "deploys" three
// DASHED pipes draw down; a dashed chip with a "?" lands at each end on its
// word (a question, never a forecast: nothing fills); "That's your tell" and
// the question land under them.
export const TELL = { vessel: { x: 430, y: 290, w: 220, h: 250 }, label: 575, chipTop: 930, chipW: 300, chipH: 120, xs: [200, 540, 880], tellTop: 1170, qTop: 1232 };

export const PoolTell: React.FC<Win & {
  watch: Cued; // the vessel draws in
  amount: { label: string } & Cued;
  deploy: Cued; // the pipes draw
  options: ({ label: string } & Cued)[]; // exactly three
  tell: { label: string } & Cued;
  question: { text: string } & Cued;
}> = ({ from, to, watch, amount, deploy, options, tell, question }) => {
  const ms = useMs();
  const k = useK();
  const INK = COLORS.ink;
  const V = TELL.vessel;

  const tWatch = at(watch, from + 300, from);
  const tAmt = at(amount, tWatch + 1100, from, tWatch + 500);
  const tDeploy = at(deploy, tAmt + 600, from, tAmt + 300);
  let prev = tDeploy + 300;
  const tOpts = options.map((o, i) => (prev = at(o, prev + 700, from, i === 0 ? tDeploy + 500 : prev + 300)));
  const tTell = at(tell, prev + 2000, from, prev + 400);
  const tQ = at(question, tTell + 800, from, tTell + 300);
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));
  if (ms < tWatch - 60 || vis <= 0) return null;

  const pipeK = EASE(k(tDeploy, 600));
  const sy = V.y + V.h;
  // the pipes draw DOWN by revealing a band that grows from the vessel to the chips
  const revealH = (TELL.chipTop - sy + 10) * pipeK;

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <svg width={1080} height={1920} style={{ position: "absolute", left: 0, top: 0 }}>
        <defs>
          <clipPath id="tell-pipes"><rect x={0} y={sy - 4} width={1080} height={revealH + 4} /></clipPath>
        </defs>
        <g clipPath="url(#tell-pipes)">
          {TELL.xs.map((x, i) => (
            <path key={i} d={`M540 ${sy} C540 ${sy + 200} ${x} ${TELL.chipTop - 200} ${x} ${TELL.chipTop}`} fill="none" stroke={inkA(0.55)} strokeWidth={6} strokeDasharray="18 13" />
          ))}
        </g>
      </svg>
      <Vessel x={V.x} y={V.y} w={V.w} h={V.h} stroke={INK} liquid={COLORS.accent} draw={EASE(k(tWatch, 500))} fill={EASE(k(tWatch + 350, 500))} />
      <div style={{ position: "absolute", left: 0, right: 0, top: TELL.label, textAlign: "center", ...popStyle(k(tAmt, 300), 14) }}>
        <span style={caps(INK)}>{amount.label}</span>
      </div>

      {options.map((o, i) => (
        <div key={i} style={{ position: "absolute", left: TELL.xs[i] - TELL.chipW / 2, top: TELL.chipTop, width: TELL.chipW, height: TELL.chipH, ...popStyle(k(tOpts[i], 280), 24) }}>
          <svg width={TELL.chipW} height={TELL.chipH} style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }}>
            <rect x={3} y={3} width={TELL.chipW - 6} height={TELL.chipH - 6} rx={22} fill={COLORS.paper} stroke={INK} strokeWidth={5} strokeDasharray="16 11" />
          </svg>
          <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 12, fontFamily: DISPLAY, fontWeight: 700,
            fontSize: 46, letterSpacing: TRACK.headline, color: INK, whiteSpace: "nowrap" }}>
            {o.label}<span style={{ color: COLORS.grayText }}>?</span>
          </div>
        </div>
      ))}

      <div style={{ position: "absolute", left: 0, right: 0, top: TELL.tellTop, textAlign: "center", ...popStyle(k(tTell, 300), 14) }}>
        <span style={caps(COLORS.grayText)}>{tell.label}</span>
      </div>
      <div style={{ position: "absolute", left: 110, right: 110, top: TELL.qTop, textAlign: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: 72,
        letterSpacing: TRACK.headline, lineHeight: 1.1, color: INK, ...popStyle(k(tQ, 320)) }}>
        {question.text}
      </div>
    </AbsoluteFill>
  );
};
