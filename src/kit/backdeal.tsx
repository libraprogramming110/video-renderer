// ─────────────────────────────────────────────────────────────────────────
// KIT · backdeal — THE SPINE RETURNS AS THE ANNOUNCEMENT ITSELF. Added on the
// AbbVie Juvmo long-form, 2026-10-04 (HORIZONTAL 16:9). One-mover rule: each
// cue gets ONE motion, and anything that has landed goes still.
//
// `AnnouncementPage` (red world): "Now go back to the deal." The §1 deal grows
// back out of its docked seat (the §1 dock, reversed), then docks top-left. A
// white page rises behind it and the deal becomes its headline, turning to ink. The summary lines draw
// at the top; the first one BECOMES the lead drug's name, with its indication.
// The other drug's name stamps low on the same page and a margin arrow travels
// down to it, then its stage stamps. A date rail builds on the right, one node
// per spoken date. Back on the page, two Phase 2 trials appear under the lead
// drug and are struck. Finally the charge is written and counted as voiced, and
// a connector ties it to the one asset it was recorded on.
//
// The charge is NOT drawn as a share of the purchase price: the script only
// says it was recorded "on that asset".
//
// Every onset is a spoken word with an optional ms pin, clamped monotonic.
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, Easing, interpolate, interpolateColors } from "remotion";
import { CLAMP, clamp01, COLORS, cue, DISPLAY, inkA, INK_SUB_ON_RED, TRACK, useMs } from "./core";
import { TYPE } from "../style";
import { FlowLine } from "./flowline";
import { at, lerp, useK, type Cued, type Win } from "./elora";
import { DEAL } from "./juvmo";

const EASE = Easing.out(Easing.cubic);
const EASE_IO = Easing.inOut(Easing.cubic);

const W = 1920;
const H = 1080;

const txt = (size: number, color: string, weight = 700): React.CSSProperties => ({
  fontFamily: DISPLAY, fontWeight: weight, fontSize: size, letterSpacing: size >= 60 ? TRACK.display : TRACK.headline, color, lineHeight: 1.08, whiteSpace: "nowrap",
});

export const PAGE = {
  x: 110, y: 70, w: 800, h: 860,
  mark: { hero: { cx: 960, cy: 480, s: 0.8 }, dock: { cx: 510, cy: 165, s: 0.3 } },
  rail: { x: 1040, ys: [130, 270, 410] as const },
  ruleY: 500,
  chargeTop: 536,
  figTop: 600,
};

export const AnnouncementPage: React.FC<Win & {
  back: Cued; // the deal grows back
  deal: { buyer: string; target: string; figure: string; unit: string };
  dock: Cued; // the deal docks top-left
  page: Cued; // the page rises behind it: the deal is its headline
  dates: { date: string; sub: string; word?: string; ms?: number; nodeWord?: string; dateWord?: string; subWord?: string }[]; // three rail nodes
  summary: { label: string; word?: string; ms?: number; labelWord?: string }; // the summary lines draw
  lead: { name: string } & Cued; // the first line becomes the name
  leadFor: { label: string } & Cued;
  other: { name: string } & Cued; // stamps low on the page
  down: Cued; // the margin arrow travels down
  stage: { label: string } & Cued;
  trials: { label: string } & Cued; // two trials appear under the lead drug
  missed: Cued; // ...and are struck
  rule: Cued;
  charge: { text: string; word?: string; ms?: number };
  figure: { value: number; decimals: number; prefix: string; word?: string; ms?: number };
  unit: { label: string } & Cued; // the count lands
  asset: Cued; // the connector ties the charge to the lead drug
}> = ({ from, to, back, deal, page, dock, dates, summary, lead, leadFor, other, down, stage, trials, missed, rule, charge, figure, unit, asset }) => {
  const ms = useMs();
  const k = useK();
  const INK = COLORS.ink;
  const WH = COLORS.paper;
  const SUB = INK_SUB_ON_RED;
  const GREY = COLORS.grayText;
  const P = PAGE;
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));

  const tBack = at(back, from, from);
  const tDock = at(dock, tBack + 1800, from, tBack + 750);
  const tPage = at(page, tDock + 500, from, tDock + 300);
  const tNode1 = at(dates[0], tPage + 700, from, tPage + 500);
  const tSum = at(summary, tNode1 + 800, from, tNode1 + 400);
  const tSumLabel = Math.max(tSum + 300, cue(summary.labelWord, tSum + 900, from));
  const tLead = at(lead, tSumLabel + 1900, from, tSumLabel + 500);
  const tFor = at(leadFor, tLead + 1200, from, tLead + 400);
  const tOther = at(other, tFor + 1400, from, tFor + 500);
  const tDown = at(down, tOther + 1000, from, tOther + 400);
  const tStage = at(stage, tDown + 2300, from, tDown + 700);
  const tSeg2 = at(dates[1], tStage + 1400, from, tStage + 500);
  const tNode2 = Math.max(tSeg2 + 300, cue(dates[1].nodeWord, tSeg2 + 500, from));
  const tDate2 = Math.max(tNode2 + 250, cue(dates[1].dateWord, tNode2 + 600, from));
  const tSeg3 = at(dates[2], tDate2 + 1700, from, tDate2 + 500);
  const tDate3 = Math.max(tSeg3 + 150, cue(dates[2].dateWord, tSeg3 + 250, from));
  const tTrials = at(trials, tDate3 + 1900, from, tDate3 + 500);
  const tMissed = at(missed, tTrials + 2400, from, tTrials + 600);
  const tSub3 = Math.max(tMissed + 350, cue(dates[2].subWord, tMissed + 650, from));
  const tRule = at(rule, tSub3 + 1800, from, tSub3 + 500);
  const tCharge = at(charge, tRule + 650, from, tRule + 350);
  const tFig = at(figure, tCharge + 2500, from, tCharge + 900);
  const tUnit = at(unit, tFig + 1100, from, tFig + 500);
  const tAsset = at(asset, tUnit + 1000, from, tUnit + 500);

  // ── the deal mark: the §1 dock seat -> hero -> the page's headline
  const inQ = EASE_IO(k(tBack, 680));
  const dq = EASE_IO(k(tDock, 600));
  const M = P.mark;
  const cx = lerp(lerp(DEAL.dock.cx, M.hero.cx, inQ), M.dock.cx, dq);
  const cy = lerp(lerp(DEAL.dock.cy, M.hero.cy, inQ), M.dock.cy, dq);
  const sc = lerp(lerp(DEAL.dock.s, M.hero.s, inQ), M.dock.s, dq);
  // ── the page: it rises BEHIND the docked deal, which turns to ink as the page arrives under it
  const pageQ = EASE(k(tPage, 560));
  const fg = interpolateColors(pageQ, [0.8, 1], [WH, INK]);
  const cardBg = fg;
  const cardFg = interpolateColors(pageQ, [0.8, 1], [INK, WH]);
  const sumQ = EASE_IO(k(tSum, 520));
  const leadO = k(tLead, 110);
  const leadS = interpolate(ms, [tLead, tLead + 280], [1.18, 1], { ...CLAMP, easing: EASE });
  const otherO = k(tOther, 110);
  const otherS = interpolate(ms, [tOther, tOther + 280], [1.18, 1], { ...CLAMP, easing: EASE });
  const downQ = EASE_IO(k(tDown, 640));
  const stageO = k(tStage, 110);
  const stageS = interpolate(ms, [tStage, tStage + 260], [1.3, 1], { ...CLAMP, easing: EASE });
  const trialsQ = k(tTrials, 200);
  const assetLine = EASE_IO(k(tAsset, 360));
  const assetBox = k(tAsset + 300, 200);
  const leadColor = interpolateColors(assetBox, [0, 1], [INK, WH]);

  // ── the rail
  const R = P.rail;
  const seg2 = EASE_IO(k(tSeg2, 380));
  const seg3 = EASE_IO(k(tSeg3, 380));
  const node = (t: number) => ({ o: k(t, 110), s: interpolate(ms, [t, t + 260], [1.7, 1], { ...CLAMP, easing: EASE }) });
  const nodes = [node(tNode1), node(tNode2), node(tDate3)];
  const dateO = [k(tNode1 + 120, 180), k(tDate2, 180), k(tDate3, 180)];
  const subO = [k(tNode1 + 120, 180), k(tNode2, 180), k(tSub3, 180)];

  // ── the charge
  const ruleQ = EASE_IO(k(tRule, 480));
  const countQ = EASE(k(tFig, tUnit - tFig));
  const shown = (countQ * figure.value).toLocaleString("en-US", { minimumFractionDigits: figure.decimals, maximumFractionDigits: figure.decimals });
  const figPop = interpolate(ms, [tUnit - 80, tUnit + 220], [1.05, 1], { ...CLAMP, easing: EASE });

  const bar = (top: number, w: number, o = 1, h = 14) => <div style={{ position: "absolute", left: 80, top, width: w, height: h, borderRadius: h, background: inkA(0.13), opacity: o }} />;
  const leadTop = 244;

  if (ms < tBack - 60) return null;
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {/* ── the announcement page ── */}
      {pageQ > 0 ? (
        <div style={{ position: "absolute", left: P.x, top: P.y + (1 - pageQ) * 940, width: P.w, height: P.h, background: WH, borderRadius: 26, overflow: "hidden" }}>
          <div style={{ position: "absolute", left: 60, right: 60, top: 192, height: 4, background: inkA(0.14) }} />
          <div style={{ position: "absolute", left: 80, top: 208, opacity: k(tSumLabel, 180), ...txt(TYPE.label, GREY) }}>{summary.label}</div>

          {/* the summary lines: the first becomes the lead drug, the others give way to its trials */}
          <div style={{ position: "absolute", left: 80, top: leadTop + 26, width: 640 * sumQ, height: 22, borderRadius: 22, background: inkA(0.13), opacity: 1 - leadO }} />
          <div style={{ position: "absolute", left: 80, top: 352, width: 560 * clamp01(sumQ * 1.3 - 0.15), height: 18, borderRadius: 18, background: inkA(0.13), opacity: 1 - trialsQ }} />
          <div style={{ position: "absolute", left: 80, top: 392, width: 420 * clamp01(sumQ * 1.3 - 0.3), height: 18, borderRadius: 18, background: inkA(0.13), opacity: 1 - trialsQ }} />

          {/* "on that asset": the lead drug's row is marked */}
          {assetBox > 0 ? <div style={{ position: "absolute", left: 60, top: leadTop - 8, width: P.w - 100, height: 92, borderRadius: 16, background: INK, opacity: assetBox }} /> : null}
          <div style={{ position: "absolute", left: 80, top: leadTop, display: "flex", alignItems: "center", gap: 22, opacity: leadO, transform: `scale(${leadS})`, transformOrigin: "left center" }}>
            <span style={{ ...txt(70, leadColor), lineHeight: 1.08 }}>{lead.name}</span>
            <span style={{ ...txt(TYPE.label, leadColor), lineHeight: 1, opacity: k(tFor, 160), border: `3px solid ${leadColor}`, borderRadius: 999, padding: "9px 18px" }}>{leadFor.label}</span>
          </div>

          {/* its two Phase 2 trials, struck */}
          {trialsQ > 0
            ? [0, 1].map((i) => {
                const o = k(tTrials + i * 130, 200);
                const x = EASE(k(tMissed + i * 130, 240));
                return (
                  <div key={i} style={{ position: "absolute", left: 80 + i * 250, top: 346, width: 226, height: 56, boxSizing: "border-box", border: `3px solid ${INK}`, borderRadius: 14, opacity: o, display: "flex", alignItems: "center", justifyContent: "center", ...txt(TYPE.label, x > 0.5 ? inkA(0.45) : INK) }}>
                    {trials.label}
                    {x > 0 ? (
                      <svg width={226} height={56} style={{ position: "absolute", left: -3, top: -3, overflow: "visible" }}>
                        <line x1={-10} y1={28} x2={-10 + 246 * x} y2={28} stroke={INK} strokeWidth={7} strokeLinecap="round" />
                      </svg>
                    ) : null}
                  </div>
                );
              })
            : null}

          {/* the body of the announcement */}
          {[0, 1, 2, 3, 4, 5].map((i) => <React.Fragment key={i}>{bar(480 + i * 34, [640, 610, 650, 580, 630, 360][i])}</React.Fragment>)}

          {/* further down: the other drug */}
          <svg width={P.w} height={P.h} style={{ position: "absolute", inset: 0 }}>
            {downQ > 0 ? (
              <g stroke={INK} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" fill="none">
                <line x1={44} y1={292} x2={44} y2={lerp(292, 748, downQ)} />
                <path d={`M 30 ${lerp(292, 748, downQ) - 16} L 44 ${lerp(292, 748, downQ)} L 58 ${lerp(292, 748, downQ) - 16}`} />
              </g>
            ) : null}
          </svg>
          <div style={{ position: "absolute", left: 80, top: 712, display: "flex", alignItems: "center", gap: 22 }}>
            <span style={{ ...txt(64, INK), opacity: otherO, transform: `scale(${otherS})`, transformOrigin: "left center" }}>{other.name}</span>
            <span style={{ ...txt(TYPE.label, WH), lineHeight: 1, opacity: stageO, transform: `scale(${stageS})`, background: INK, borderRadius: 999, padding: "11px 20px" }}>{stage.label}</span>
          </div>
        </div>
      ) : null}

      {/* ── the deal: back from its §1 seat, then the page's headline ── */}
      <div style={{ position: "absolute", left: cx - 700, top: cy - 280, width: 1400, height: 560, transform: `scale(${sc})`, opacity: clamp01(inQ * 3),
        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 34 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 44 }}>
          <div style={{ ...txt(120, fg), lineHeight: 1 }}>{deal.buyer}</div>
          <svg width={150} height={50} style={{ overflow: "visible", flex: "none" }}>
            <path d="M 4 25 H 132" stroke={fg} strokeWidth={8} strokeLinecap="round" fill="none" />
            <path d="M 112 5 L 138 25 L 112 45" stroke={fg} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" fill="none" />
          </svg>
          <div style={{ background: cardBg, borderRadius: 24, padding: "22px 44px 24px" }}>
            <div style={{ ...txt(104, cardFg), lineHeight: 1 }}>{deal.target}</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 30 }}>
          <div style={{ ...txt(250, fg), lineHeight: 1 }}>{deal.figure}</div>
          <div style={{ ...txt(112, fg), lineHeight: 1 }}>{deal.unit}</div>
        </div>
      </div>

      {/* ── the date rail ── */}
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {seg2 > 0 ? <line x1={R.x} y1={R.ys[0]} x2={R.x} y2={lerp(R.ys[0], R.ys[1], seg2)} stroke={WH} strokeWidth={6} /> : null}
        {seg3 > 0 ? <line x1={R.x} y1={R.ys[1]} x2={R.x} y2={lerp(R.ys[1], R.ys[2], seg3)} stroke={WH} strokeWidth={6} /> : null}
        {nodes.map((n, i) => (n.o > 0 ? <circle key={i} cx={R.x} cy={R.ys[i]} r={17 * n.s} fill={WH} opacity={n.o} /> : null))}
        {/* the rule over the charge */}
        {ruleQ > 0 ? <line x1={1000} y1={P.ruleY} x2={lerp(1000, 1800, ruleQ)} y2={P.ruleY} stroke={WH} strokeOpacity={0.75} strokeWidth={4} /> : null}
        {/* the charge, tied to its asset */}
        {assetLine > 0 ? (
          <g stroke={INK} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" fill="none">
            <path d={`M 988 ${P.figTop + 110} H 952 V ${P.y + 282} H 926`} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - assetLine} />
            {assetLine > 0.9 ? <path d={`M 942 ${P.y + 266} L 924 ${P.y + 282} L 942 ${P.y + 298}`} /> : null}
          </g>
        ) : null}
      </svg>
      {dates.map((d, i) => (
        <React.Fragment key={i}>
          <div style={{ position: "absolute", left: R.x + 46, top: R.ys[i] - 32, opacity: dateO[i], ...txt(46, WH) }}>{d.date}</div>
          <div style={{ position: "absolute", left: R.x + 46, top: R.ys[i] + 24, opacity: subO[i], ...txt(TYPE.label, SUB) }}>{d.sub}</div>
        </React.Fragment>
      ))}

      {/* ── the charge ── */}
      {ms >= tCharge - 100 ? (
        <>
          <div style={{ position: "absolute", left: 1000, width: 820, top: P.chargeTop }}>
            <FlowLine from={tCharge} to={tFig} line={charge.text} size={44} color={WH} />
          </div>
          <div style={{ position: "absolute", left: 1000, top: P.figTop, display: "flex", alignItems: "baseline", gap: 24, transform: `scale(${ms >= tUnit - 80 ? figPop : 1})`, transformOrigin: "left center" }}>
            <div style={{ ...txt(200, WH), lineHeight: 1, fontVariantNumeric: "tabular-nums", opacity: k(tFig - 40, 140) }}>{figure.prefix}{shown}</div>
            <div style={{ ...txt(88, WH), lineHeight: 1, opacity: k(tUnit, 140) }}>{unit.label}</div>
          </div>
        </>
      ) : null}
    </AbsoluteFill>
  );
};
