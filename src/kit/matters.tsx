// ─────────────────────────────────────────────────────────────────────────
// KIT · matters — THE ARGUMENT, ENACTED. Added on the AbbVie Juvmo long-form,
// 2026-10-04 (HORIZONTAL 16:9, white card). One-mover rule: each cue gets ONE
// motion, and anything that has landed goes still.
//
// `SectionTitle`: the section's own words written at hero size, then docked
// top-left as a kicker that holds for the section.
//
// `RestsOnOne`: "An acquisition price pays for a whole pipeline, but the case
// for it often rests on one drug." A price slab; five pillars rise to carry it;
// on "rests on" four drop to stubs, so only one is touching, and it turns red.
// "Here, that drug missed": the pillar sinks and the slab sags. "The
// lower-profile one reached the market": a stub (literally the lower one) turns
// red, then rises to the slab and levels it.
//
// `OneSolidThing`: one solid approval against three DASHED slots. Dashed means
// not known (the kit's vocabulary rule): what the drug will earn, a price, a
// sales forecast.
//
// `FinishLine`: THE SPINE'S PAYOFF. The two §1 tracks return with their names.
// Each capsule travels to the stage it was at when the deal was struck; the
// distance still to run is measured on both; a finish line draws; the closer
// capsule runs it and the §1 approval stamp lands again.
//
// Every onset is a spoken word with an optional ms pin, clamped monotonic.
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, Easing, interpolate, interpolateColors } from "remotion";
import { CLAMP, clamp01, COLORS, cue, DISPLAY, inkA, TRACK, useMs } from "./core";
import { TYPE } from "../style";
import { FlowLine } from "./flowline";
import { at, lerp, useK, type Cued, type Win } from "./elora";
import { Capsule, DEAL } from "./juvmo";

const EASE = Easing.out(Easing.cubic);
const EASE_IN = Easing.in(Easing.cubic);
const EASE_IO = Easing.inOut(Easing.cubic);

const W = 1920;
const H = 1080;

const txt = (size: number, color: string, weight = 700): React.CSSProperties => ({
  fontFamily: DISPLAY, fontWeight: weight, fontSize: size, letterSpacing: size >= 60 ? TRACK.display : TRACK.headline, color, lineHeight: 1.08, whiteSpace: "nowrap",
});

/** A narration line that owns a window, centred in a column. */
const Line: React.FC<{ from: number; to: number; text: string; top: number; size: number; color: string; restColor?: string; emphasize?: string; empColor?: string; left?: number; width?: number }> = ({
  from, to, text, top, size, color, restColor, emphasize, empColor, left = 210, width = W - 420,
}) => {
  const ms = useMs();
  const o = clamp01(interpolate(ms, [from - 80, from, to - 220, to], [0, 1, 1, 0], CLAMP));
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left, width, top, opacity: o }}>
      <FlowLine from={from} to={to} line={text} size={size} color={color} restColor={restColor} restWeight={700} emphasize={emphasize} empColor={empColor} lineHeight={1.14} align="center" />
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// SectionTitle — written at hero size, then a kicker
// ══════════════════════════════════════════════════════════════════════════
export const SectionTitle: React.FC<Win & { text: string; dock: Cued; hero?: { left: number; top: number; size: number }; seat?: { top: number; scale: number }; color?: string; restColor?: string; emphasize?: string; empColor?: string } & Cued> = ({
  from, to, text, dock, word, ms: pin, hero = { left: 110, top: 380, size: 168 }, seat = { top: 92, scale: 0.25 }, color = COLORS.ink, restColor, emphasize, empColor,
}) => {
  const ms = useMs();
  const k = useK();
  const t0 = at({ word, ms: pin }, from, from);
  const tDock = at(dock, t0 + 1200, from, t0 + 600);
  const dq = EASE_IO(k(tDock, 560));
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));
  if (ms < t0 - 60) return null;
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <div style={{ position: "absolute", left: hero.left, top: lerp(hero.top, seat.top, dq), transform: `scale(${lerp(1, seat.scale, dq)})`, transformOrigin: "left top", whiteSpace: "nowrap" }}>
        <FlowLine from={t0} to={tDock} line={text} size={hero.size} color={color} restColor={restColor} restWeight={700} emphasize={emphasize} empColor={empColor} lineHeight={1} />
      </div>
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// RestsOnOne — a price on five pillars, then on one
// ══════════════════════════════════════════════════════════════════════════
export const RESTS = {
  slab: { cx: 960, top: 236, w: 1100, h: 104 },
  ground: 690,
  xs: [520, 740, 960, 1180, 1400],
  pw: 120,
  stub: 110,
  lineTop: 806,
};

export const RestsOnOne: React.FC<Win & {
  slab: { label: string } & Cued;
  pipeline: { label: string } & Cued; // five pillars rise
  rests: Cued; // four drop to stubs
  one: { label: string; index: number } & Cued; // the one still touching turns red
  named: { label: string } & Cued; // ...and is named
  missed: Cued; // it sinks; the slab sags
  low: { label: string; index: number } & Cued; // a stub turns red
  reached: Cued; // ...rises to the slab and levels it
  market: { label: string } & Cued;
  lines: { text: string; emphasize?: string; word?: string; ms?: number }[];
  clear: Cued;
}> = ({ from, to, slab, pipeline, rests, one, named, missed, low, reached, market, lines, clear }) => {
  const ms = useMs();
  const k = useK();
  const INK = COLORS.ink;
  const R = COLORS.accent;
  const WH = COLORS.paper;
  const S = RESTS.slab;
  const G = RESTS.ground;

  const tSlab = at(slab, from + 100, from);
  const tPipe = at(pipeline, tSlab + 1500, from, tSlab + 500);
  const tRests = at(rests, tPipe + 2500, from, tPipe + 900);
  const tOne = at(one, tRests + 600, from, tRests + 400);
  const tNamed = at(named, tOne + 1400, from, tOne + 500);
  const tMiss = at(missed, tNamed + 500, from, tNamed + 350);
  const tLow = at(low, tMiss + 900, from, tMiss + 600);
  const tReach = at(reached, tLow + 1100, from, tLow + 500);
  const tMarket = at(market, tReach + 450, from, tReach + 400);
  const tClear = at(clear, tMarket + 800, from, tMarket + 400);
  const vis = (1 - k(tClear, 300)) * clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));

  const full = G - (S.top + S.h);
  const shrink = EASE_IO(k(tRests, 420));
  const sink = EASE_IN(k(tMiss, 380));
  const lift = EASE_IO(k(tReach, 480));
  const sag = EASE(k(tMiss + 140, 420)) * (1 - lift);
  const oneQ = k(tOne, 250);
  const lowQ = k(tLow, 250);
  const slabQ = EASE(k(tSlab, 420));

  if (ms < tSlab - 60 || vis <= 0) return null;
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {/* the pillars */}
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <clipPath id="rests-ground"><rect x={0} y={0} width={W} height={G} /></clipPath>
        <g clipPath="url(#rests-ground)">
          {RESTS.xs.map((x, i) => {
            const up = EASE(k(tPipe + i * 70, 420));
            if (up <= 0) return null;
            let h = full * up;
            let fill: string = INK;
            if (i === one.index) {
              h = full * up * (1 - sink);
              fill = sink > 0 ? interpolateColors(sink, [0, 0.4], [R, inkA(0.3)]) : interpolateColors(oneQ, [0, 1], [INK, R]);
            } else if (i === low.index) {
              h = lerp(lerp(full, RESTS.stub, shrink), full, lift) * up;
              fill = interpolateColors(lowQ, [0, 1], [interpolateColors(shrink, [0, 1], [INK, inkA(0.3)]), R]);
            } else {
              h = lerp(full, RESTS.stub, shrink) * up;
              fill = interpolateColors(shrink, [0, 1], [INK, inkA(0.3)]);
            }
            return <rect key={i} x={x - RESTS.pw / 2} y={G - h} width={RESTS.pw} height={h + 20} rx={10} fill={fill} />;
          })}
        </g>
        <line x1={360} y1={G} x2={1560} y2={G} stroke={INK} strokeWidth={6} strokeLinecap="round" opacity={k(tPipe - 100, 200)} />
      </svg>

      {/* the price slab */}
      <div style={{ position: "absolute", left: S.cx - S.w / 2, top: S.top + (1 - slabQ) * -70, width: S.w, height: S.h, opacity: clamp01(slabQ * 2), background: INK, borderRadius: 14, transformOrigin: "100% 100%", transform: `rotate(${-5 * sag}deg)`,
        display: "flex", alignItems: "center", justifyContent: "center", ...txt(48, WH) }}>
        {slab.label}
      </div>

      {/* labels under the ground line */}
      <div style={{ position: "absolute", left: RESTS.xs[2] - 200, width: 400, top: G + 20, textAlign: "center", opacity: k(tPipe + 300, 200) * (1 - shrink), ...txt(TYPE.label, COLORS.grayText) }}>{pipeline.label}</div>
      <div style={{ position: "absolute", left: RESTS.xs[one.index] - 200, width: 400, top: G + 16, textAlign: "center", opacity: oneQ * (1 - k(tNamed, 160)), ...txt(36, R) }}>{one.label}</div>
      <div style={{ position: "absolute", left: RESTS.xs[one.index] - 200, width: 400, top: G + 16, textAlign: "center", opacity: k(tNamed, 180), ...txt(36, sink > 0.3 ? inkA(0.45) : INK) }}>{named.label}</div>
      <div style={{ position: "absolute", left: RESTS.xs[low.index] - 200, width: 400, top: G + 16, textAlign: "center", opacity: lowQ, ...txt(36, INK) }}>{low.label}</div>
      <div style={{ position: "absolute", left: RESTS.xs[low.index] - 200, width: 400, top: G + 62, textAlign: "center", opacity: k(tMarket, 180), ...txt(TYPE.label, R) }}>{market.label}</div>

      {lines.map((l, i) => {
        const t0 = at(l, [tSlab, tNamed][i] ?? from, from);
        const t1 = i === 0 ? at(lines[1], tNamed, from) - 120 : tClear + 300;
        return <Line key={i} from={t0} to={t1} text={l.text} top={RESTS.lineTop} size={42} color={INK} restColor={COLORS.grayText} emphasize={l.emphasize} empColor={INK} />;
      })}
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// OneSolidThing — one approval against three unknowns
// ══════════════════════════════════════════════════════════════════════════
export const SOLID = { titleTop: 196, disc: { cx: 400, cy: 500, r: 112 }, box: { xs: [860, 1230, 1600], top: 372, w: 330, h: 256 }, labelTop: 654, lineTop: 800 };

export const OneSolidThing: React.FC<Win & {
  title: { text: string; emphasize?: string } & Cued;
  solid: { label: string } & Cued;
  unknowns: ({ label: string } & Cued)[]; // three dashed slots
  lines: { text: string; emphasize?: string; word?: string; ms?: number }[];
  clear: Cued;
}> = ({ from, to, title, solid, unknowns, lines, clear }) => {
  const ms = useMs();
  const k = useK();
  const INK = COLORS.ink;
  const R = COLORS.accent;
  const WH = COLORS.paper;
  const O = SOLID;

  const tTitle = at(title, from, from);
  const tSolid = at(solid, tTitle + 2800, from, tTitle + 900);
  const tUn = unknowns.reduce<number[]>((acc, u, i) => [...acc, at(u, (acc[i - 1] ?? tSolid) + 2000, from, (acc[i - 1] ?? tSolid) + 500)], []);
  const tClear = at(clear, tUn[tUn.length - 1] + 1500, from, tUn[tUn.length - 1] + 700);
  const vis = (1 - k(tClear, 300)) * clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));

  const solidO = k(tSolid, 110);
  const solidS = interpolate(ms, [tSolid, tSolid + 300], [1.4, 1], { ...CLAMP, easing: EASE });
  const B = O.box;

  if (ms < tTitle - 60 || vis <= 0) return null;
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <Line from={tTitle} to={tClear + 300} text={title.text} top={O.titleTop} size={66} color={INK} emphasize={title.emphasize} empColor={INK} restColor={INK} />

      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {solidO > 0 ? (
          <g transform={`translate(${O.disc.cx} ${O.disc.cy}) scale(${solidS})`} opacity={solidO}>
            <circle r={O.disc.r} fill={R} />
            <path d="M -50 4 L -14 40 L 54 -34" fill="none" stroke={WH} strokeWidth={22} strokeLinecap="round" strokeLinejoin="round" />
          </g>
        ) : null}
        {/* dashed = not known */}
        {unknowns.map((_, i) => {
          const q = EASE_IO(k(tUn[i], 560));
          if (q <= 0) return null;
          return (
            <g key={i}>
              <clipPath id={`solid-un-${i}`}><rect x={B.xs[i] - B.w / 2 - 8} y={B.top - 8} width={(B.w + 16) * q} height={B.h + 16} /></clipPath>
              <rect x={B.xs[i] - B.w / 2} y={B.top} width={B.w} height={B.h} rx={22} fill="none" stroke={INK} strokeWidth={6} strokeDasharray="20 16" clipPath={`url(#solid-un-${i})`} />
            </g>
          );
        })}
      </svg>
      <div style={{ position: "absolute", left: O.disc.cx - 260, width: 520, top: O.labelTop, textAlign: "center", opacity: k(tSolid + 160, 180), ...txt(46, INK) }}>{solid.label}</div>
      {unknowns.map((u, i) => (
        <React.Fragment key={i}>
          <div style={{ position: "absolute", left: B.xs[i] - B.w / 2, width: B.w, top: B.top + 52, textAlign: "center", opacity: k(tUn[i] + 300, 200), ...txt(150, inkA(0.28)), lineHeight: 1 }}>?</div>
          <div style={{ position: "absolute", left: B.xs[i] - 200, width: 400, top: O.labelTop, textAlign: "center", opacity: k(tUn[i] + 200, 180), ...txt(40, INK) }}>{u.label}</div>
        </React.Fragment>
      ))}

      {lines.map((l, i) => {
        const t0 = at(l, [tSolid, tUn[1]][i] ?? from, from);
        const t1 = i === 0 ? at(lines[1], tUn[1], from) - 120 : tClear + 300;
        return <Line key={i} from={t0} to={t1} text={l.text} top={O.lineTop} size={42} color={INK} restColor={COLORS.grayText} emphasize={l.emphasize} empColor={INK} />;
      })}
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// FinishLine — the two tracks return; the closer one finishes
// ══════════════════════════════════════════════════════════════════════════
export const FINISH = { titleTop: 196, x0: 430, x1: 1650, ys: [470, 690] as const };

export const FinishLine: React.FC<Win & {
  title: { text: string; emphasize?: string } & Cued; // the tracks draw with it
  lead: { name: string; tick: number; word?: string; ms?: number; runWord?: string; atWord?: string };
  bought: { label: string } & Cued;
  other: { name: string; tick: number; word?: string; ms?: number; runWord?: string; atWord?: string };
  closer: Cued; // the distance still to run is measured on both
  finish: Cued; // the finish line draws
  sprint: Cued; // the closer capsule runs it
  stamp: { label: string } & Cued;
}> = ({ from, to, title, lead, bought, other, closer, finish, sprint, stamp }) => {
  const ms = useMs();
  const k = useK();
  const INK = COLORS.ink;
  const R = COLORS.accent;
  const WH = COLORS.paper;
  const SUB = COLORS.grayText;
  const F = FINISH;
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));
  const tx = (f: number) => lerp(F.x0, F.x1, f);

  const tTitle = at(title, from, from);
  const tLead = at(lead, tTitle + 2700, from, tTitle + 900);
  const tRun1 = Math.max(tLead + 300, cue(lead.runWord, tLead + 700, from));
  const tAt1 = Math.max(tRun1 + 400, cue(lead.atWord, tRun1 + 700, from));
  const tBought = at(bought, tAt1 + 1200, from, tAt1 + 400);
  const tOther = at(other, tBought + 800, from, tBought + 400);
  const tRun2 = Math.max(tOther + 300, cue(other.runWord, tOther + 900, from));
  const tAt2 = Math.max(tRun2 + 400, cue(other.atWord, tRun2 + 800, from));
  const tCloser = at(closer, tAt2 + 1900, from, tAt2 + 600);
  const tFinish = at(finish, tCloser + 800, from, tCloser + 450);
  const tSprint = at(sprint, tFinish + 900, from, tFinish + 500);
  const tStamp = at(stamp, tSprint + 400, from, tSprint + 330);

  const draw = EASE_IO(k(tTitle, 520));
  const f1 = DEAL.ticks[lead.tick].f;
  const f2 = DEAL.ticks[other.tick].f;
  const run1 = EASE_IO(k(tRun1, tAt1 - tRun1));
  const run2 = EASE_IO(k(tRun2, tAt2 - tRun2));
  const sp = EASE_IO(k(tSprint, Math.max(280, tStamp - 40 - tSprint)));
  const x1 = tx(f1 * run1);
  const x2 = tx(lerp(f2 * run2, 1, sp));
  const gap = EASE_IO(k(tCloser, 460));
  const finQ = EASE_IO(k(tFinish, 380));
  const stampO = k(tStamp, 110);
  const stampS = interpolate(ms, [tStamp, tStamp + 280], [1.55, 1], { ...CLAMP, easing: EASE });

  // the distance still to run: a measure above the track, from the capsule to the end
  const measure = (y: number, x: number, color: string, q: number, key: string) => {
    const xe = lerp(x + 56, F.x1 - 14, q);
    return q > 0 && F.x1 - 14 - (x + 56) > 20 ? (
      <g key={key} stroke={color} strokeWidth={6} strokeLinecap="round" fill="none">
        <line x1={x + 56} y1={y - 56} x2={xe} y2={y - 56} />
        <line x1={x + 56} y1={y - 70} x2={x + 56} y2={y - 42} />
        {q > 0.97 ? <line x1={F.x1 - 14} y1={y - 70} x2={F.x1 - 14} y2={y - 42} /> : null}
      </g>
    ) : null;
  };

  if (ms < tTitle - 60) return null;
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <Line from={tTitle} to={to + 400} text={title.text} top={F.titleTop} size={66} color={INK} emphasize={title.emphasize} empColor={R} restColor={INK} />

      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {F.ys.map((y, r) => (
          <g key={r}>
            <line x1={F.x0} y1={y} x2={lerp(F.x0, F.x1, draw)} y2={y} stroke={inkA(0.22)} strokeWidth={6} strokeLinecap="round" />
            {DEAL.ticks.map((t, i) => (draw >= t.f ? <circle key={i} cx={tx(t.f)} cy={y} r={9} fill={WH} stroke={inkA(0.5)} strokeWidth={4} /> : null))}
          </g>
        ))}
        {/* the finish line, across both tracks */}
        {finQ > 0 ? <line x1={F.x1} y1={F.ys[0] - 96} x2={F.x1} y2={lerp(F.ys[0] - 96, F.ys[1] + 34, finQ)} stroke={INK} strokeWidth={10} strokeLinecap="round" /> : null}

        {measure(F.ys[0], x1, inkA(0.45), gap, "m1")}
        {sp <= 0 ? measure(F.ys[1], x2, R, EASE_IO(k(tCloser + 160, 460)), "m2") : null}

        {/* the lead drug: stops at its stage */}
        {k(tLead, 10) > 0 ? (
          <>
            <line x1={F.x0} y1={F.ys[0]} x2={x1} y2={F.ys[0]} stroke={inkA(0.55)} strokeWidth={10} strokeLinecap="round" />
            <g transform={`translate(${x1} ${F.ys[0]})`} opacity={k(tLead, 160)}><Capsule color={INK} back={WH} /></g>
          </>
        ) : null}
        {/* the other drug: stops closer, then finishes */}
        {k(tOther, 10) > 0 ? (
          <>
            <line x1={F.x0} y1={F.ys[1]} x2={x2} y2={F.ys[1]} stroke={sp > 0 ? R : inkA(0.55)} strokeWidth={10} strokeLinecap="round" />
            <g transform={`translate(${x2} ${F.ys[1]})`} opacity={k(tOther, 160)}><Capsule color={INK} back={WH} /></g>
          </>
        ) : null}
      </svg>

      {/* names + stage labels */}
      <div style={{ position: "absolute", right: W - F.x0 + 40, top: F.ys[0] - 28, opacity: k(tLead, 180), ...txt(46, INK) }}>{lead.name}</div>
      <div style={{ position: "absolute", right: W - F.x0 + 40, top: F.ys[1] - 28, opacity: k(tOther, 180), ...txt(46, INK) }}>{other.name}</div>
      {F.ys.map((y, r) =>
        DEAL.ticks.map((t, i) => {
          const lit = (r === 0 && i === lead.tick && run1 >= 1) || (r === 1 && i === other.tick && run2 >= 1 && sp <= 0) || (r === 1 && i === 3 && stampO > 0);
          return (
            <div key={`${r}-${i}`} style={{ position: "absolute", left: tx(t.f) - 100, width: 200, top: y + 34, textAlign: i === 3 ? "right" : "center", paddingRight: i === 3 ? 100 : 0, boxSizing: "border-box",
              opacity: clamp01((draw - t.f) * 8 + 1), ...txt(TYPE.labelSm, lit ? INK : SUB) }}>
              {t.label}
            </div>
          );
        })
      )}
      <div style={{ position: "absolute", left: F.x0, top: F.ys[0] - 150, opacity: k(tBought, 180), ...txt(TYPE.label, SUB) }}>{bought.label}</div>

      {stampO > 0 ? (
        <div style={{ position: "absolute", right: W - F.x1 - 42, top: F.ys[1] - 124, opacity: stampO, transform: `scale(${stampS}) rotate(-3deg)`, transformOrigin: "right center", background: R, borderRadius: 14, padding: "10px 28px 12px", ...txt(44, WH), lineHeight: 1 }}>
          {stamp.label}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
