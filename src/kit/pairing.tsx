// ─────────────────────────────────────────────────────────────────────────
// KIT · pairing — added on the AstraZeneca x Summit long-form, 2026-09-30
// (VERTICAL). Built under Nel's 09-30 note: ONE thing moves at a time, and
// anything that has landed goes STILL (no loops, no shakes, no trails).
//
// `FirstPairing` (black): "The first pairing goes into <indication> trials,
// matching <drug A> with <owner>'s <target> ADC, <drug B>." A rail of dashed
// slots (pairings to come); the FIRST lights and grows into the frame (the
// indication); a divider splits it; each drug slides into its half as line
// art; on "ADC" the payload clicks onto the antibody (the ADC is enacted as
// antibody + drug); on the last name brackets snap round the pair.
//
// `TwoMarkets` (white card): one drug, two markets. The market that DECIDED is
// a solid pill; the market still pending is DASHED (never measured, 08-22
// vocabulary) around a calendar whose month lands and whose day page flips in
// on its spoken words. The connector between them turns from solid to dashed.
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, interpolate, Easing } from "remotion";
import { CLAMP, clamp01, COLORS, cue, DISPLAY, SANS, TRACK, useMs, INK_SUB } from "./core";
import { FlowLine } from "./flowline";
import { TYPE } from "../style";

const EASE = Easing.out(Easing.cubic);
const EASE_IO = Easing.inOut(Easing.cubic);

type Win = { from: number; to: number };
type Cued = { word?: string; ms?: number };

const useK = () => {
  const ms = useMs();
  return (a: number, dur: number) => clamp01(interpolate(ms, [a, a + dur], [0, 1], CLAMP));
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;

/** Antibody line art: a Y with tips. `tips` = the binding-site shapes at each arm. */
export const YGlyph: React.FC<{ color: string; tips: ["square" | "round" | "chevron", "square" | "round" | "chevron"]; payload?: number; payloadColor?: string; dashed?: boolean }> = ({ color, tips, payload = 0, payloadColor, dashed = false }) => {
  // dashed = not yet proven (08-22 vocabulary: hollow + dashed = never measured). Added Sanofi x Regeneron 2026-10-02.
  const dash = dashed ? "16 14" : undefined;
  const sw = 12;
  const arm = (side: -1 | 1) => [side * 100, -125] as const;
  const Tip: React.FC<{ kind: string; x: number; y: number; side: -1 | 1 }> = ({ kind, x, y, side }) => (
    <g transform={`translate(${x} ${y}) rotate(${side * 38})`}>
      {kind === "square" ? <path d="M -24 12 L -24 -16 L 24 -16 L 24 12" fill="none" stroke={color} strokeWidth={9} strokeLinejoin="round" /> : null}
      {kind === "round" ? <path d="M -26 10 A 26 24 0 0 1 26 10" fill="none" stroke={color} strokeWidth={9} /> : null}
      {kind === "chevron" ? <path d="M -24 10 L 0 -18 L 24 10" fill="none" stroke={color} strokeWidth={9} strokeLinejoin="round" /> : null}
    </g>
  );
  const [lx, ly] = arm(-1);
  const [rx, ry] = arm(1);
  return (
    <g>
      <path d={`M 0 150 L 0 10 M 0 10 L ${lx} ${ly} M 0 10 L ${rx} ${ry}`} fill="none" stroke={color} strokeWidth={sw} strokeLinecap="round" strokeDasharray={dash} />
      {/* light chains, a parallel stroke outside each arm */}
      <path d={`M -34 -8 L ${lx - 24} ${ly + 22} M 34 -8 L ${rx + 24} ${ry + 22}`} fill="none" stroke={color} strokeWidth={6} strokeLinecap="round" opacity={0.55} strokeDasharray={dash} />
      <Tip kind={tips[0]} x={lx - 12} y={ly - 16} side={-1} />
      <Tip kind={tips[1]} x={rx + 12} y={ry - 16} side={1} />
      {payload > 0 ? (
        <g opacity={clamp01(payload * 3)}>
          <line x1={8} y1={80} x2={8 + 58 * payload} y2={80} stroke={color} strokeWidth={6} strokeDasharray="6 8" />
          <rect x={-24} y={-24} width={48} height={48} fill={payloadColor} transform={`translate(${8 + 58 + 30 * (1 - payload) + 24} 80) rotate(45) scale(${lerp(1.5, 1, payload)})`} />
        </g>
      ) : null}
    </g>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// FirstPairing — §3 (black)
// ══════════════════════════════════════════════════════════════════════════
const PAIR = {
  titleTop: 200,
  small: { x: 90, y: 430, w: 280, h: 150 },
  big: { x: 90, y: 430, w: 900, h: 960 },
  railGap: 30,
  left: { x: 315, y: 880 },
  right: { x: 765, y: 880 },
  nameY: 1085,
  headerY: 610,
  labelTop: 1420,
  clickIn: 40,
};

export const FirstPairing: React.FC<Win & {
  title: { line: string; from: number };
  first: Cued; // the first slot lights
  zoom: Cued; // it grows into the frame
  label: { line: string; from: number; to: number };
  split: Cued;
  left: { name: string } & Cued;
  header: { label: string } & Cued;
  right: { name: string; word?: string; ms?: number; adcWord?: string; adcMs?: number; drug: string[]; drugWord?: string; drugMs?: number };
  click: Cued;
}> = ({ from, to, title, first, zoom, label, split, left, header, right, click }) => {
  const ms = useMs();
  const k = useK();
  const W = COLORS.paper;
  const red = COLORS.accent;
  const vis = clamp01(interpolate(ms, [to - 360, to], [1, 0], CLAMP));

  const tRail = title.from + 150;
  const tFirst = Math.max(tRail + 150, first.ms ?? cue(first.word, tRail + 300, from));
  const tZoom = Math.max(tFirst + 400, zoom.ms ?? cue(zoom.word, tFirst + 800, from));
  const tSplit = Math.max(tZoom + 800, split.ms ?? cue(split.word, tZoom + 2400, from));
  const tLeft = Math.max(tSplit + 300, left.ms ?? cue(left.word, tSplit + 500, from));
  const tHead = Math.max(tLeft + 400, header.ms ?? cue(header.word, tLeft + 900, from));
  const tRight = Math.max(tHead + 300, right.ms ?? cue(right.word, tHead + 900, from));
  const tAdc = Math.max(tRight + 400, right.adcMs ?? cue(right.adcWord, tRight + 1800, from));
  const tDrug = Math.max(tAdc + 300, right.drugMs ?? cue(right.drugWord, tAdc + 1300, from));
  const tClick = Math.max(tDrug + 300, click.ms ?? cue(click.word, tDrug + 900, from));

  // rail: three dashed slots rise together (one move), the first lights
  const railIn = EASE(k(tRail, 420));
  const lit = k(tFirst, 260);
  const z = EASE_IO(k(tZoom, 720));
  const S = PAIR.small;
  const B = PAIR.big;
  const r = { x: lerp(S.x, B.x, z), y: lerp(S.y, B.y, z), w: lerp(S.w, B.w, z), h: lerp(S.h, B.h, z) };

  const splitP = EASE(k(tSplit, 520));
  const inL = EASE(k(tLeft, 560));
  const headP = k(tHead, 300);
  const inR = EASE(k(tRight, 560));
  const pay = EASE(k(tAdc, 380));
  const clickP = EASE(k(tClick, 300));
  const dividerOut = clickP; // the divider retracts as the pair locks

  const lx = PAIR.left.x + PAIR.clickIn * clickP - (1 - inL) * 520;
  const rx = PAIR.right.x - PAIR.clickIn * clickP + (1 - inR) * 520;

  const nameStyle: React.CSSProperties = { position: "absolute", width: 450, textAlign: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: 56, letterSpacing: TRACK.headline, color: W, lineHeight: 1.05 };

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {/* title */}
      <div style={{ position: "absolute", left: 90, right: 90, top: PAIR.titleTop }}>
        <FlowLine from={title.from} to={to} line={title.line} size={96} color={W} lineHeight={1} />
      </div>

      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        {/* slots 2 + 3: pairings still to come (dashed); they leave as slot 1 grows */}
        {[1, 2].map((i) => {
          const x = S.x + i * (S.w + PAIR.railGap) + z * 700;
          return (
            <rect key={i} x={x} y={S.y + (1 - railIn) * 40} width={S.w} height={S.h} rx={26} fill="none" stroke={W} strokeOpacity={0.45}
              strokeWidth={5} strokeDasharray="10 14" opacity={railIn * (1 - z)} />
          );
        })}
        {/* slot 1: dashed, then lit (solid), then the frame */}
        <rect x={r.x} y={r.y + (1 - railIn) * 40} width={r.w} height={r.h} rx={26} fill="none" stroke={W} strokeOpacity={0.45 + 0.45 * lit}
          strokeWidth={5 + lit} strokeDasharray={lit >= 1 ? undefined : "10 14"} opacity={railIn} />
        {lit > 0 && z < 1 ? (
          <text x={r.x + r.w / 2} y={r.y + r.h / 2 + 22} textAnchor="middle" fontFamily={DISPLAY} fontWeight={700} fontSize={64} letterSpacing={TRACK.display} fill={W} opacity={lit * (1 - z * 3)}>01</text>
        ) : null}

        {/* the divider */}
        {splitP > 0 ? (
          <line x1={540} y1={B.y + 40 + (B.h - 80) * dividerOut} x2={540} y2={B.y + 40 + (B.h - 80) * splitP} stroke={W} strokeOpacity={0.4} strokeWidth={5} strokeDasharray="10 14" />
        ) : null}

        {/* the two drugs */}
        {inL > 0 ? (
          <g transform={`translate(${lx} ${PAIR.left.y})`} opacity={inL}>
            <YGlyph color={W} tips={["square", "round"]} />
          </g>
        ) : null}
        {inR > 0 ? (
          <g transform={`translate(${rx} ${PAIR.right.y})`} opacity={inR}>
            <YGlyph color={W} tips={["chevron", "chevron"]} payload={pay} payloadColor={red} />
          </g>
        ) : null}

        {/* the lock: brackets snap round the pair */}
        {clickP > 0
          ? ([-1, 1] as const).map((side) => {
              const x = 540 + side * lerp(430, 380, clickP);
              const y0 = 700;
              const y1 = 1060;
              return <path key={side} d={`M ${x - side * 40} ${y0} L ${x} ${y0} L ${x} ${y1} L ${x - side * 40} ${y1}`} fill="none" stroke={W} strokeWidth={12} strokeLinecap="round" strokeLinejoin="round" opacity={clickP} />;
            })
          : null}
      </svg>

      {/* header over the right half */}
      <div style={{ position: "absolute", left: 540, width: 450, top: PAIR.headerY, textAlign: "center", ...{ fontFamily: SANS, fontWeight: 700, fontSize: TYPE.label, letterSpacing: TRACK.nav, color: INK_SUB }, opacity: headP }}>
        {header.label}
      </div>

      {/* names under each drug */}
      <div style={{ ...nameStyle, left: 90 + PAIR.clickIn * clickP, top: PAIR.nameY, opacity: k(tLeft + 200, 300) }}>{left.name}</div>
      <div style={{ ...nameStyle, left: 540 - PAIR.clickIn * clickP, top: PAIR.nameY }}>
        <FlowLine from={tRight} to={to} line={right.name} size={56} color={W} align="center" />
        <div style={{ marginTop: 14 }}>
          <FlowLine from={tDrug} to={to} line={right.drug.join(" ")} size={44} color={INK_SUB} weight={700} align="center" />
        </div>
      </div>

      {/* the indication, under the frame */}
      <div style={{ position: "absolute", left: 90, right: 90, top: PAIR.labelTop }}>
        <FlowLine from={label.from} to={label.to} line={label.line} size={64} color={W} align="center" />
      </div>
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// TwoMarkets — §4 (white card)
// ══════════════════════════════════════════════════════════════════════════
const MK = {
  headTop: 200,
  ruleY: 340,
  rowA: { labelTop: 470, pill: { left: 590, top: 470, w: 380, h: 120 } },
  connector: { x: 180, y0: 640, y1: 830 },
  rowB: { labelTop: 860, subTop: 1000 },
  cal: { left: 640, top: 850, w: 320, h: 390, band: 96 },
  indTop: 1340,
};

export const TwoMarkets: React.FC<Win & {
  head: { label: string } & Cued;
  decided: { market: string; status: string; statusWord?: string; statusMs?: number; marketWord?: string; marketMs?: number };
  bridge: Cued; // the connector draws
  pending: {
    market: string; marketWord?: string; marketMs?: number;
    sub: { line: string; from: number };
    calWord?: string; calMs?: number;
    month: string; monthWord?: string; monthMs?: number;
    day: string; dayWord?: string; dayMs?: number;
  };
  indication: { line: string; from: number };
}> = ({ from, to, head, decided, bridge, pending, indication }) => {
  const ms = useMs();
  const k = useK();
  const ink = COLORS.ink;
  const W = COLORS.paper;
  const red = COLORS.accent;
  const vis = clamp01(interpolate(ms, [to - 360, to], [1, 0], CLAMP));

  const tHead = head.ms ?? cue(head.word, from + 300, from);
  const tStatus = Math.max(tHead + 400, decided.statusMs ?? cue(decided.statusWord, tHead + 1500, from));
  const tMarketA = Math.max(tStatus + 250, decided.marketMs ?? cue(decided.marketWord, tStatus + 450, from));
  const tBridge = Math.max(tMarketA + 500, bridge.ms ?? cue(bridge.word, tMarketA + 1200, from));
  const tMarketB = Math.max(tBridge + 300, pending.marketMs ?? cue(pending.marketWord, tBridge + 800, from));
  const tCal = Math.max(tMarketB + 300, pending.calMs ?? cue(pending.calWord, tMarketB + 1500, from));
  const tMonth = Math.max(tCal + 300, pending.monthMs ?? cue(pending.monthWord, tCal + 600, from));
  const tDay = Math.max(tMonth + 300, pending.dayMs ?? cue(pending.dayWord, tMonth + 700, from));

  const headP = k(tHead, 320);
  const rule = EASE(k(tHead + 200, 500));
  const stamp = k(tStatus, 300);
  const stampS = interpolate(ms, [tStatus, tStatus + 140, tStatus + 300], [1.22, 0.97, 1], { ...CLAMP, easing: EASE });
  const mA = k(tMarketA, 300);
  const br = EASE(k(tBridge, 700));
  const mB = k(tMarketB, 300);
  const cal = EASE(k(tCal, 420));
  const mon = k(tMonth, 260);
  const flip = EASE(k(tDay, 460));

  const C = MK.connector;
  const cy = lerp(C.y0, C.y1, br);
  const solidEnd = lerp(C.y0, (C.y0 + C.y1) / 2, br);

  const marketStyle: React.CSSProperties = { position: "absolute", left: 110, fontFamily: DISPLAY, fontWeight: 700, fontSize: 120, letterSpacing: TRACK.display, color: ink, lineHeight: 1 };

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {/* the drug */}
      <div style={{ position: "absolute", left: 0, right: 0, top: MK.headTop, textAlign: "center", opacity: headP, transform: `translateY(${(1 - headP) * 16}px)`,
        fontFamily: DISPLAY, fontWeight: 700, fontSize: 104, letterSpacing: TRACK.display, color: ink, lineHeight: 1 }}>
        {head.label}
      </div>
      <div style={{ position: "absolute", left: 540 - 440 * rule, width: 880 * rule, top: MK.ruleY, height: 4, background: ink }} />

      {/* row A: the market that decided */}
      <div style={{ ...marketStyle, top: MK.rowA.labelTop, opacity: mA, transform: `translateY(${(1 - mA) * 16}px)` }}>{decided.market}</div>
      <div style={{ position: "absolute", left: MK.rowA.pill.left, top: MK.rowA.pill.top, width: MK.rowA.pill.w, height: MK.rowA.pill.h, borderRadius: 60, background: ink,
        display: "flex", alignItems: "center", justifyContent: "center", opacity: stamp, transform: `scale(${stampS})`,
        fontFamily: DISPLAY, fontWeight: 700, fontSize: 60, letterSpacing: TRACK.headline, color: W }}>
        {decided.status}
      </div>

      {/* the connector: solid out of the decided market, dashed into the pending one */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {br > 0 ? (
          <g>
            <line x1={C.x} y1={C.y0} x2={C.x} y2={solidEnd} stroke={ink} strokeWidth={8} strokeLinecap="round" />
            <line x1={C.x} y1={solidEnd} x2={C.x} y2={cy} stroke={ink} strokeWidth={8} strokeDasharray="6 16" strokeLinecap="round" />
          </g>
        ) : null}
        {/* the calendar's dashed border: pending, never measured */}
        {cal > 0 ? (
          <rect x={MK.cal.left - 18} y={MK.cal.top - 18} width={MK.cal.w + 36} height={MK.cal.h + 36} rx={34} fill="none" stroke={ink} strokeOpacity={0.5} strokeWidth={5} strokeDasharray="12 14" opacity={cal} />
        ) : null}
      </svg>

      {/* row B: the pending market */}
      <div style={{ ...marketStyle, top: MK.rowB.labelTop, opacity: mB, transform: `translateY(${(1 - mB) * 16}px)` }}>{pending.market}</div>
      <div style={{ position: "absolute", left: 110, width: 480, top: MK.rowB.subTop }}>
        <FlowLine from={pending.sub.from} to={to} line={pending.sub.line} size={TYPE.label} color={COLORS.grayText} lineHeight={1.2} />
      </div>

      {/* the calendar: tile drops in, month lands, day page flips */}
      {cal > 0 ? (
        <div style={{ position: "absolute", left: MK.cal.left, top: MK.cal.top - (1 - cal) * 60, width: MK.cal.w, height: MK.cal.h, opacity: cal, borderRadius: 22, overflow: "hidden",
          background: W, border: `5px solid ${ink}`, boxSizing: "border-box" }}>
          <div style={{ height: MK.cal.band, background: red, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 60, letterSpacing: TRACK.headline, color: W, opacity: mon, transform: `translateY(${(1 - mon) * 12}px)`, display: "inline-block" }}>{pending.month}</span>
          </div>
          <div style={{ perspective: 900, height: MK.cal.h - MK.cal.band, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ transformOrigin: "50% 0%", transform: `rotateX(${(1 - flip) * -90}deg)`, opacity: flip > 0 ? 1 : 0,
              fontFamily: DISPLAY, fontWeight: 700, fontSize: 210, letterSpacing: TRACK.display, color: ink, lineHeight: 1 }}>
              {pending.day}
            </div>
          </div>
        </div>
      ) : null}

      {/* the indication */}
      <div style={{ position: "absolute", left: 90, right: 90, top: MK.indTop }}>
        <FlowLine from={indication.from} to={to} line={indication.line} size={64} color={ink} align="center" />
      </div>
    </AbsoluteFill>
  );
};
