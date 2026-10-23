// ─────────────────────────────────────────────────────────────────────────
// KIT · blueprint — THE RE-RUN SPINE. Added on the Sanofi x Regeneron
// long-form, 2026-10-02 (VERTICAL), under the 09-30 one-mover rule.
//
// One card carries the argument across three sections. Every block that draws
// it uses the SPINE seats, so a world wipe carries it across untouched:
//
// `Blueprint` (black, over a dim footage scrim, §2): "The structure is a
// <drug> re-run. <A> leads research. <B> runs global sales. Profits split
// 50-50." The original card stamps on its name; on "re-run" a red scan line
// crosses it and a DASHED COPY slides out from behind it (dashed = not yet
// real). The copy's halves fill on their spoken names; a profits strip draws;
// on "split" a red cut runs down the seam and the halves part; each counts
// to 50%.
//
// `PatentWall` (red, §3): the card waits in its seat; on "biggest" it GROWS
// into a tall bar; the figure counts inside it; on "alone" the hook's deal
// rises beside it as a bar at TRUE scale (1/6, no new number). Then the
// camera pulls back, a rail draws from the bar's foot, the bar starts to
// slide on "expires", a wall SLAMS down on the year and the bar runs into it
// and recoils, and the rail past the wall turns dashed.
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, interpolate, Easing } from "remotion";
import { CLAMP, clamp01, COLORS, cue, DISPLAY, inkA, INK_SUB_ON_RED, TRACK, useMs } from "./core";
import { FlowLine } from "./flowline";

const EASE = Easing.out(Easing.cubic);
const EASE_IO = Easing.inOut(Easing.cubic);
const BACK = Easing.out(Easing.back(1.6));

type Win = { from: number; to: number };
type Cued = { word?: string; ms?: number };

const useK = () => {
  const ms = useMs();
  return (a: number, dur: number) => clamp01(interpolate(ms, [a, a + dur], [0, 1], CLAMP));
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const at = (c: Cued, fallback: number, from: number, min = -Infinity) => Math.max(min, c.ms ?? cue(c.word, fallback, from));

const Phrase: React.FC<{ from: number; to: number; line: string; top: number; size: number; color: string; emphasize?: string; empColor?: string; restColor?: string }> = ({
  from, to, line, top, size, color, emphasize, empColor, restColor,
}) => {
  const ms = useMs();
  const o = clamp01(interpolate(ms, [from - 80, from, to - 220, to], [0, 1, 1, 0], CLAMP));
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 90, right: 90, top, opacity: o }}>
      <FlowLine from={from} to={to} line={line} size={size} color={color} emphasize={emphasize} empColor={empColor} restColor={restColor} restWeight={700} lineHeight={1.1} />
    </div>
  );
};

type Line = { text: string; emphasize?: string } & Cued;
const Lines: React.FC<{ lines: Line[]; from: number; to: number; color: string; rest: string }> = ({ lines, from, to, color, rest }) => {
  const t = lines.map((l, i) => at(l, from + i * 2000, from));
  return (
    <>
      {lines.map((l, i) => (
        <Phrase key={i} from={t[i]} to={i + 1 < lines.length ? t[i + 1] : to + 400} line={l.text} top={170} size={56} color={color} restColor={rest} emphasize={l.emphasize} empColor={color} />
      ))}
    </>
  );
};

export const SPINE = {
  orig: { x: 100, y: 400, w: 880, h: 300 },
  copy: { x: 100, y: 860, w: 880, h: 560 },
  nameSize: 110,
};

/** The original: a solid white card, the drug name and its partners. */
export const OrigCard: React.FC<{ name: string; sub: string; o?: number; s?: number; nameColor: string; subColor: string }> = ({ name, sub, o = 1, s = 1, nameColor, subColor }) => {
  const c = SPINE.orig;
  return (
    <div style={{ position: "absolute", left: c.x, top: c.y, width: c.w, height: c.h, borderRadius: 26, background: COLORS.paper, opacity: o,
      transform: `scale(${s})`, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 14 }}>
      <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: SPINE.nameSize, letterSpacing: TRACK.display, color: nameColor, lineHeight: 1 }}>{name}</div>
      <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 40, letterSpacing: TRACK.kicker, color: subColor }}>{sub}</div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// Blueprint — §2 (black)
// ══════════════════════════════════════════════════════════════════════════
type Side = { name: string; role: string; roleWord?: string; roleMs?: number } & Cued;

export const Blueprint: React.FC<Win & {
  drug: { name: string; sub: string } & Cued;
  rerun: { tag: string } & Cued;
  left: Side;
  right: Side;
  profits: { label: string } & Cued;
  split: Cued;
  share: { value: number } & Cued;
  lines: Line[];
}> = ({ from, to, drug, rerun, left, right, profits, split, share, lines }) => {
  const ms = useMs();
  const k = useK();
  const W = COLORS.paper;
  const red = COLORS.accent;
  const c = SPINE.copy;

  const tDrug = at(drug, from + 1200, from);
  const tRerun = at(rerun, tDrug + 450, from, tDrug + 350);
  const tL = at(left, tRerun + 1200, from, tRerun + 700);
  const tLR = Math.max(tL + 300, left.roleMs ?? cue(left.roleWord, tL + 600, from));
  const tR = at(right, tLR + 1000, from, tLR + 300);
  const tRR = Math.max(tR + 300, right.roleMs ?? cue(right.roleWord, tR + 900, from));
  const tProf = at(profits, tRR + 1400, from, tRR + 400);
  const tSplit = at(split, tProf + 550, from, tProf + 400);
  const tShare = at(share, tSplit + 200, from, tSplit + 150);

  // the original stamps; a scan line "prints" it on "re-run"
  const oIn = k(tDrug, 120);
  const oS = interpolate(ms, [tDrug, tDrug + 320], [1.18, 1], { ...CLAMP, easing: EASE });
  const scan = k(tRerun, 340);

  // the copy slides out from behind the original
  const slide = EASE_IO(k(tRerun + 120, 520));
  const copyY = lerp(SPINE.orig.y, c.y, slide);
  const copyH = lerp(SPINE.orig.h, c.h, slide);
  const copyO = k(tRerun + 120, 120);

  const fillL = k(tL, 140);
  const sL = interpolate(ms, [tL, tL + 300], [1.2, 1], { ...CLAMP, easing: EASE });
  const roleL = k(tLR, 200);
  const fillR = k(tR, 140);
  const sR = interpolate(ms, [tR, tR + 300], [1.2, 1], { ...CLAMP, easing: EASE });
  const roleR = k(tRR, 200);

  const strip = EASE(k(tProf, 320));
  const cut = EASE(k(tSplit, 220));
  const part = EASE_IO(k(tSplit + 200, 360)) * 30;
  const countT = EASE(k(tShare, 650));
  const profLabel = 1 - k(tShare, 160);

  const half = (side: -1 | 1, s: Side, fill: number, sc: number, roleO: number) => {
    const hx = side < 0 ? c.x : c.x + c.w / 2;
    return (
      <div style={{ position: "absolute", left: hx + side * part, top: copyY, width: c.w / 2, height: copyH, opacity: copyO }}>
        {fill > 0 ? (
          <div style={{ position: "absolute", left: 0, right: 0, top: 130, textAlign: "center", opacity: fill, transform: `scale(${sc})` }}>
            <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 66, letterSpacing: TRACK.headline, color: W, lineHeight: 1 }}>{s.name}</div>
            <div style={{ marginTop: 22, fontFamily: DISPLAY, fontWeight: 700, fontSize: 40, letterSpacing: TRACK.kicker, color: "rgba(255,255,255,0.72)", opacity: roleO }}>{s.role}</div>
          </div>
        ) : null}
        {strip > 0 ? (
          <div style={{ position: "absolute", top: 390, height: 92, left: side < 0 ? 28 : 0, right: side < 0 ? 0 : 28, overflow: "hidden" }}>
            {/* the strip draws OUT from the seam to both edges */}
            <div style={{ position: "absolute", top: 0, bottom: 0, background: W, width: `${strip * 100}%`, ...(side < 0 ? { right: 0 } : { left: 0 }) }} />
            {countT > 0 ? (
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: 72,
                letterSpacing: TRACK.display, color: COLORS.ink, fontVariantNumeric: "tabular-nums", opacity: k(tShare, 120) }}>
                {Math.round(countT * share.value)}%
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    );
  };

  const halfPath = (side: -1 | 1) => {
    const x0 = (side < 0 ? c.x : c.x + c.w / 2) + side * part;
    const x1 = x0 + c.w / 2;
    const y0 = copyY;
    const y1 = copyY + copyH;
    const r = 26;
    return side < 0
      ? `M ${x1} ${y0} L ${x0 + r} ${y0} Q ${x0} ${y0} ${x0} ${y0 + r} L ${x0} ${y1 - r} Q ${x0} ${y1} ${x0 + r} ${y1} L ${x1} ${y1}`
      : `M ${x0} ${y0} L ${x1 - r} ${y0} Q ${x1} ${y0} ${x1} ${y0 + r} L ${x1} ${y1 - r} Q ${x1} ${y1} ${x1 - r} ${y1} L ${x0} ${y1}`;
  };

  return (
    <AbsoluteFill>
      {copyO > 0 ? (
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          {([-1, 1] as const).map((side) => (
            <path key={side} d={halfPath(side)} opacity={copyO} fill="none" stroke={W} strokeWidth={5} strokeDasharray="20 16" />
          ))}
          {/* the faint seam, then the red cut that runs down it */}
          <line x1={540} y1={copyY + 24} x2={540} y2={copyY + copyH - 24} stroke="rgba(255,255,255,0.35)" strokeWidth={4} strokeDasharray="10 12" opacity={copyO * (1 - cut)} />
          {cut > 0 ? <line x1={540} y1={copyY - 40} x2={540} y2={lerp(copyY - 40, copyY + copyH + 40, cut)} stroke={red} strokeWidth={10} strokeLinecap="round" /> : null}
        </svg>
      ) : null}
      {half(-1, left, fillL, sL, roleL)}
      {half(1, right, fillR, sR, roleR)}
      {strip > 0 && profLabel > 0 ? (
        <div style={{ position: "absolute", left: c.x, width: c.w, top: c.y + 390, height: 92, display: "flex", alignItems: "center", justifyContent: "center", opacity: profLabel * k(tProf + 150, 150),
          fontFamily: DISPLAY, fontWeight: 700, fontSize: 52, letterSpacing: TRACK.headline, color: COLORS.ink }}>
          {profits.label}
        </div>
      ) : null}
      {copyO > 0 ? (
        <div style={{ position: "absolute", left: c.x + 30, top: copyY + 26, opacity: copyO * (1 - k(tL, 200)), fontFamily: DISPLAY, fontWeight: 700, fontSize: 36, letterSpacing: TRACK.kicker, color: "rgba(255,255,255,0.72)" }}>
          {rerun.tag}
        </div>
      ) : null}

      {ms >= tDrug - 20 ? <OrigCard name={drug.name} sub={drug.sub} o={oIn} s={oS} nameColor={COLORS.ink} subColor={inkA(0.5)} /> : null}
      {scan > 0 && scan < 1 ? (
        <div style={{ position: "absolute", left: SPINE.orig.x - 20, width: SPINE.orig.w + 40, top: SPINE.orig.y + scan * SPINE.orig.h - 4, height: 8, background: red, opacity: 1 - scan * 0.4 }} />
      ) : null}

      <Lines lines={lines} from={from} to={to} color={W} rest="rgba(255,255,255,0.55)" />
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// PatentWall — §3 (red)
// ══════════════════════════════════════════════════════════════════════════
const PW = {
  base: 1450,
  bar: { x: 380, w: 320, top: 520 },
  deal: { x: 180, w: 120 },
  pull: { s: 0.55, tx0: -262 }, // group left edge (180) lands at x 80
  wallX: 860,
  hitTx: 222, // the group's right edge (700) reaches x 850, just short of the wall
  railX: [80, 1000] as [number, number],
  wallTop: 960,
  yearY: 830,
};

export const PatentWall: React.FC<Win & {
  drug: { name: string; sub: string };
  grow: Cued;
  figure: { prefix: string; value: number; suffix: string; label: string } & Cued;
  period: { label: string } & Cued;
  deal: { label: string; ratio: number } & Cued;
  pull: Cued;
  rail: { label: string } & Cued;
  drift: Cued;
  wall: { label: string } & Cued;
  lines: Line[];
}> = ({ from, to, drug, grow, figure, period, deal, pull, rail, drift, wall, lines }) => {
  const ms = useMs();
  const k = useK();
  const W = COLORS.paper;
  const R = COLORS.accent;
  const vis = clamp01(interpolate(ms, [to - 360, to], [1, 0], CLAMP));

  const tGrow = at(grow, from + 1200, from);
  const tFig = at(figure, tGrow + 1500, from, tGrow + 600);
  const tPer = at(period, tFig + 1000, from, tFig + 700);
  const tDeal = at(deal, tPer + 500, from, tPer + 300);
  const tPull = at(pull, tDeal + 1200, from, tDeal + 700);
  const tRail = at(rail, tPull + 450, from, tPull + 420);
  const tDrift = at(drift, tRail + 550, from, tRail + 450);
  const tWall = at(wall, tDrift + 850, from, tDrift + 500);
  const tHit = tWall + 200;

  // card -> bar
  const g = EASE_IO(k(tGrow, 560));
  const o = SPINE.orig;
  const rect = { x: lerp(o.x, PW.bar.x, g), y: lerp(o.y, PW.bar.top, g), w: lerp(o.w, PW.bar.w, g), h: lerp(o.h, PW.base - PW.bar.top, g) };
  const nameSize = lerp(SPINE.nameSize, 60, g);
  const subO = 1 - k(tGrow, 200);

  const countT = EASE(k(tFig, 800));
  const figO = k(tFig - 40, 140);
  const perO = k(tPer, 200);

  const dealH = (PW.base - PW.bar.top) * deal.ratio;
  const dealQ = BACK(k(tDeal, 420));

  // camera pull, then the slide into the wall, then a damped recoil
  const pullQ = EASE_IO(k(tPull, 500));
  const s = lerp(1, PW.pull.s, pullQ);
  let tx = lerp(0, PW.pull.tx0, pullQ);
  if (ms >= tDrift) tx = lerp(PW.pull.tx0, PW.hitTx, Easing.in(Easing.quad)(clamp01((ms - tDrift) / (tHit - tDrift))));
  if (ms >= tHit) {
    const t = (ms - tHit) / 1000;
    tx = PW.hitTx - 34 * Math.exp(-7 * t) * Math.abs(Math.sin(16 * t));
  }
  const railQ = EASE(k(tRail, 500));
  const railLabel = k(tRail + 150, 200);

  const drop = Easing.in(Easing.quad)(k(tWall, 180));
  const tb = (ms - tWall - 180) / 1000;
  const bounce = tb > 0 ? -14 * Math.exp(-9 * tb) * Math.abs(Math.sin(20 * tb)) : 0;
  const wallY = lerp(-900, 0, drop) + bounce;
  const yearS = interpolate(ms, [tWall, tWall + 300], [1.25, 1], { ...CLAMP, easing: EASE });
  const yearO = k(tWall, 120);
  const after = k(tHit, 260);
  const shock = k(tHit, 420);

  const subRed = "rgba(244,33,45,0.7)";

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {railQ > 0 ? (
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          <line x1={PW.railX[0]} y1={PW.base} x2={Math.min(PW.wallX, lerp(PW.railX[0], PW.railX[1], railQ))} y2={PW.base} stroke={W} strokeWidth={6} />
          {lerp(PW.railX[0], PW.railX[1], railQ) > PW.wallX + 40 ? (
            <line x1={PW.wallX + 40} y1={PW.base} x2={lerp(PW.railX[0], PW.railX[1], railQ)} y2={PW.base} stroke={W} strokeWidth={6} strokeDasharray="10 14" opacity={0.35 + after * 0.65} />
          ) : null}
        </svg>
      ) : null}
      {railLabel > 0 ? (
        <div style={{ position: "absolute", left: PW.railX[0], top: PW.base + 34, opacity: railLabel, fontFamily: DISPLAY, fontWeight: 700, fontSize: 40, letterSpacing: TRACK.kicker, color: W }}>
          {rail.label}
        </div>
      ) : null}

      <div style={{ position: "absolute", inset: 0, transformOrigin: `540px ${PW.base}px`, transform: `translateX(${tx}px) scale(${s})` }}>
        {dealQ > 0 ? (
          <>
            <div style={{ position: "absolute", left: PW.deal.x, width: PW.deal.w, top: PW.base - dealH * dealQ, height: dealH * dealQ, background: W, borderRadius: "14px 14px 0 0" }} />
            <div style={{ position: "absolute", left: PW.deal.x - 60, width: PW.deal.w + 120, top: PW.base - dealH - 84, textAlign: "center", opacity: k(tDeal + 200, 200),
              fontFamily: DISPLAY, fontWeight: 700, fontSize: 60, letterSpacing: TRACK.headline, color: W }}>
              {deal.label}
            </div>
          </>
        ) : null}

        <div style={{ position: "absolute", left: rect.x, top: rect.y, width: rect.w, height: rect.h, background: W,
          borderRadius: g > 0.98 ? "14px 14px 0 0" : lerp(26, 14, g) }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: lerp(o.h / 2 - 70, 46, g), textAlign: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: nameSize, letterSpacing: TRACK.display, color: R, lineHeight: 1 }}>
            {drug.name}
          </div>
          {subO > 0 ? (
            <div style={{ position: "absolute", left: 0, right: 0, top: o.h / 2 + 54, textAlign: "center", opacity: subO, fontFamily: DISPLAY, fontWeight: 700, fontSize: 40, letterSpacing: TRACK.kicker, color: subRed }}>
              {drug.sub}
            </div>
          ) : null}
          {figO > 0 ? (
            <div style={{ position: "absolute", left: 0, right: 0, top: 150, textAlign: "center", opacity: figO }}>
              <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 40, letterSpacing: TRACK.kicker, color: subRed }}>{figure.label}</div>
              <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 150, letterSpacing: TRACK.display, color: R, lineHeight: 1.05, fontVariantNumeric: "tabular-nums" }}>
                {figure.prefix}{Math.round(countT * figure.value)}{figure.suffix}
              </div>
              <div style={{ marginTop: 6, fontFamily: DISPLAY, fontWeight: 700, fontSize: 40, letterSpacing: TRACK.kicker, color: subRed, opacity: perO }}>{period.label}</div>
            </div>
          ) : null}
        </div>
      </div>

      {yearO > 0 ? (
        <>
          <div style={{ position: "absolute", left: PW.wallX, width: 40, top: PW.wallTop + wallY, height: PW.base - PW.wallTop, background: W }} />
          <div style={{ position: "absolute", left: PW.wallX + 20, top: PW.yearY, transform: `translate(-50%,-50%) scale(${yearS})`, opacity: yearO,
            fontFamily: DISPLAY, fontWeight: 700, fontSize: 130, letterSpacing: TRACK.display, color: W, lineHeight: 1 }}>
            {wall.label}
          </div>
          {shock > 0 && shock < 1 ? (
            <div style={{ position: "absolute", left: PW.wallX - 4, top: 1205 - 150 * shock, height: 300 * shock, width: 8, background: W, opacity: 1 - shock, transform: `scaleX(${1 + shock * 5})` }} />
          ) : null}
        </>
      ) : null}

      <Lines lines={lines} from={from} to={to} color={W} rest={INK_SUB_ON_RED} />
    </AbsoluteFill>
  );
};
