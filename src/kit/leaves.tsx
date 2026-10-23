// ─────────────────────────────────────────────────────────────────────────
// KIT · leaves — WHAT A TOPLINE LEAVES OUT, AND WHERE IT TURNS UP. Added on the
// Bristol Myers Squibb two-readouts HORIZONTAL long-form, 2026-10-14 (16:9;
// absolute 1920x1080 coordinates, not portrait-safe as written). One-mover rule
// and the frame budget.
//
// `LeavesOut` (ink): THE SPINE PAYS OFF. Both columns return on the seats they
// held in §2 and §3 (`DOSES`), already standing; the line draws across both and
// each takes a check. Then the part above the line gets a DASHED bracket, and
// each column gets the hook's empty slot under a question the script asks. In a
// pause the second trial leaves; the first column takes its dose, the other
// dose rises on the second seat and stops short, a dashed tie joins the two
// tops and the question lands.
//
// `WatchDetail` (white card): a two-line title; the two empty slots, and a
// FORK of dashed branches to two hollow rings (a fork and not a timeline: the
// script orders neither event, and left-to-right order would be a claim). Then
// one more trial on a dashed rail to a hollow ring under the only date given.
//
// Dashed and hollow mean NOT MEASURED or NOT YET (the 08-22 vocabulary rule).
// Every onset is a spoken word with an optional ms pin, clamped monotonic
// (`at()` / `useK()` / `Cued` / `Win` come from ./elora).
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { CLAMP, clamp01, COLORS, DISPLAY, inkA, INK_SUB, TRACK, useMs } from "./core";
import { TYPE } from "../style";
import { at, lerp, useK, type Cued, type Win } from "./elora";
import { Column, DOSES } from "./aloft";

const EASE = Easing.out(Easing.cubic);
const EASE_IO = Easing.inOut(Easing.cubic);

const label = (color: string, size: number = TYPE.label): React.CSSProperties => ({
  fontFamily: DISPLAY, fontWeight: 700, fontSize: size, letterSpacing: TRACK.kicker, color, whiteSpace: "nowrap",
});
const big = (color: string, size: number): React.CSSProperties => ({
  fontFamily: DISPLAY, fontWeight: 700, fontSize: size, letterSpacing: TRACK.display, color, lineHeight: 1, whiteSpace: "nowrap",
});

/** The hook's empty slot: a dashed box with a dash in it. `q` draws the box, `dash` lands the dash. */
const EmptySlot: React.FC<{ x: number; y: number; w: number; h: number; q: number; dash?: number; color: string; children?: React.ReactNode }> = ({ x, y, w, h, q, dash = q, color, children }) => (
  q <= 0 ? null : (
    <div style={{ position: "absolute", left: x, top: y, width: w, height: h }}>
      <svg width={w} height={h} style={{ position: "absolute", clipPath: `inset(0 ${(1 - EASE_IO(q)) * 100}% 0 0)` }}>
        <rect x={2} y={2} width={w - 4} height={h - 4} rx={18} fill="none" stroke={color} strokeWidth={4} strokeDasharray="16 12" />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", gap: 24 }}>
        {children}
        <div style={{ width: 64, height: 10, borderRadius: 5, background: color, opacity: clamp01(dash * 3), transform: `scaleX(${EASE(clamp01(dash))})` }} />
      </div>
    </div>
  )
);

// ══════════════════════════════════════════════════════════════════════════
// LeavesOut (ink world) — the spine pays off
// ══════════════════════════════════════════════════════════════════════════
export const LEAVES = {
  lead: { left: 130, top: 330, size: 130 },
  slotA: { x: 800, y: 540, w: 320, h: 96 },
  slotB: { x: 1440, y: 540, w: 320, h: 96 },
  why: { x: 1450, y: 580, size: 160 },
};

export const LeavesOut: React.FC<Win & {
  lead: ({ text: string } & Cued)[]; // the opening line, one row per entry
  clear: Cued; // a pause: the line retires
  charts: { a: string; b: string } & Cued; // both columns return, standing
  line: { label: string } & Cued;
  crossed: Cued; // a check on each
  clear2: Cued; // a pause: the checks retire
  gapA: Cued; // the dashed bracket above the line, column one
  gapB: Cued; // ...column two
  clear3: Cued; // a pause: the brackets retire
  askA: { lines: [string, string] } & Cued;
  slotA: Cued;
  askB: { lines: [string, string] } & Cued;
  slotB: Cued;
  clear4: Cued; // a pause: the second trial and both slots leave
  lower: { label: string } & Cued; // column one takes its dose
  higher: { label: string; until: Cued } & Cued; // the other dose rises on the second seat and stops short
  tie: Cued; // a dashed tie between the two tops
  why: { label: string } & Cued;
}> = ({ from, to, lead, clear, charts, line, crossed, clear2, gapA, gapB, clear3, askA, slotA, askB, slotB, clear4, lower, higher, tie, why }) => {
  const ms = useMs();
  const k = useK();
  const WH = COLORS.paper;
  const DIM = "rgba(255,255,255,0.34)";
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));

  let prev = from - 300;
  const tLead = lead.map((l) => (prev = at(l, prev + 600, from, prev + 150)));
  const tClear = at(clear, prev + 900, from, prev + 400);
  const tCharts = at(charts, tClear + 500, from, tClear + 250);
  const tLine = at(line, tCharts + 700, from, tCharts + 300);
  const tCross = at(crossed, tLine + 800, from, tLine + 450);
  const tClear2 = at(clear2, tCross + 600, from, tCross + 400);
  const tGapA = at(gapA, tClear2 + 600, from, tClear2 + 200);
  const tGapB = at(gapB, tGapA + 350, from, tGapA + 200);
  const tClear3 = at(clear3, tGapB + 700, from, tGapB + 400);
  const tAskA = at(askA, tClear3 + 1200, from, tClear3 + 300);
  const tSlotA = at(slotA, tAskA + 800, from, tAskA + 300);
  const tAskB = at(askB, tSlotA + 1000, from, tSlotA + 400);
  const tSlotB = at(slotB, tAskB + 1100, from, tAskB + 300);
  const tClear4 = at(clear4, tSlotB + 400, from, tSlotB + 300);
  const tLower = at(lower, tClear4 + 700, from, tClear4 + 320);
  const tHigher = at(higher, tLower + 2000, from, tLower + 500);
  const tHigherEnd = at(higher.until, tHigher + 700, from, tHigher + 400);
  const tTie = at(tie, tHigherEnd + 500, from, tHigherEnd + 200);
  const tWhy = at(why, tTie + 1500, from, tTie + 500);

  const D = DOSES;
  const leadO = 1 - k(tClear, 280);
  const chartsO = k(tCharts, 280);
  const lineQ = EASE_IO(k(tLine, 480));
  const checkO = 1 - k(tClear2, 240);
  const gapO = 1 - k(tClear3, 240);
  const p2 = 1 - k(tClear4, 300); // the second trial and both slots
  const lowQ = k(tLower, 260);
  const hiQ = EASE(clamp01((ms - tHigher) / Math.max(300, tHigherEnd - tHigher)));
  const tieQ = EASE_IO(k(tTie, 480));
  const tag = (x: number, w: number, text: string, o: number) => (
    <div style={{ position: "absolute", left: x - 100, width: w + 200, top: D.base + 22, textAlign: "center", opacity: o, ...big(WH, 50) }}>{text}</div>
  );
  const check = (x: number, w: number, top: number) => (
    <div style={{ position: "absolute", left: x + w / 2 - 36, top: top - 96, width: 72, height: 72, borderRadius: 36, background: WH, opacity: clamp01(k(tCross, 260) * 3) * checkO, transform: `scale(${lerp(1.5, 1, EASE(k(tCross, 260)))})` }}>
      <svg width={72} height={72} viewBox="0 0 64 64"><path d="M18 33 L28 43 L46 23" fill="none" stroke={COLORS.ink} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" /></svg>
    </div>
  );
  // the part above the line: a dashed bracket beside the column, from the line up
  const gap = (x: number, t: number) => {
    const q = EASE_IO(k(t, 380));
    const h = D.line - D.a.top;
    return q <= 0 ? null : (
      <svg style={{ position: "absolute", left: x, top: D.a.top, opacity: gapO }} width={44} height={h}>
        <path d={`M4 ${h - 3} L36 ${h - 3} L36 ${h - 3 - (h - 6) * q}`} fill="none" stroke={WH} strokeWidth={5} strokeDasharray="12 10" strokeLinecap="round" />
      </svg>
    );
  };
  const ask = (S: { x: number; y: number }, lines: [string, string], t: number) => (
    <div style={{ position: "absolute", left: S.x, top: S.y - 108, opacity: k(t, 220) * p2, lineHeight: 1.15, ...label(INK_SUB, 34) }}>{lines[0]}<br />{lines[1]}</div>
  );

  if (ms < tLead[0] - 60) return null;
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {/* ── the opening line ── */}
      {leadO > 0 ? (
        <div style={{ position: "absolute", left: LEAVES.lead.left, top: LEAVES.lead.top, opacity: leadO }}>
          {lead.map((l, i) => (
            <div key={i} style={{ opacity: k(tLead[i], 130), transform: `translateY(${(1 - EASE(k(tLead[i], 340))) * 30}px)`, marginBottom: 18, ...big(WH, LEAVES.lead.size) }}>{l.text}</div>
          ))}
        </div>
      ) : null}

      {/* ── both columns, on the seats they held ── */}
      {chartsO > 0 ? (
        <>
          <div style={{ position: "absolute", left: D.x0, top: D.base, width: D.x1 - D.x0, height: 4, background: "rgba(255,255,255,0.22)", opacity: chartsO }} />
          <div style={{ opacity: chartsO }}>
            <Column x={D.a.x} w={D.a.w} top={D.a.top} q={1} color={WH} />
          </div>
          <div style={{ opacity: chartsO * p2 }}>
            <Column x={D.b.x} w={D.b.w} top={D.a.top} q={1} color={WH} />
          </div>
          {tag(D.a.x, D.a.w, charts.a, chartsO * (1 - lowQ))}
          {tag(D.a.x, D.a.w, lower.label, lowQ)}
          {tag(D.b.x, D.b.w, charts.b, chartsO * p2)}
        </>
      ) : null}

      {/* the other dose: rises on the second seat and stops under the line */}
      <Column x={D.b.x} w={D.b.w} top={D.b.top} q={hiQ} color={DIM} />
      {tag(D.b.x, D.b.w, higher.label, k(tHigher, 220))}

      {/* the threshold */}
      <div style={{ position: "absolute", left: D.x0, top: D.line - 3, width: (D.x1 - D.x0) * lineQ, height: 6, background: COLORS.accent }} />
      <div style={{ position: "absolute", left: D.x0 - 250, width: 230, textAlign: "right", top: D.line - 20, opacity: k(tLine + 250, 200), ...label(COLORS.accent, 32) }}>{line.label}</div>

      {check(D.a.x, D.a.w, D.a.top)}
      {check(D.b.x, D.b.w, D.a.top)}
      {gap(D.a.x + D.a.w + 14, tGapA)}
      {gap(D.b.x + D.b.w + 14, tGapB)}

      {/* ── what is not known: the hook's empty slot, twice ── */}
      {p2 > 0 ? (
        <div style={{ opacity: p2 }}>
          {ask(LEAVES.slotA, askA.lines, tAskA)}
          <EmptySlot {...LEAVES.slotA} q={k(tSlotA, 420)} dash={k(tSlotA + 300, 260)} color={WH} />
          {ask(LEAVES.slotB, askB.lines, tAskB)}
          <EmptySlot {...LEAVES.slotB} q={k(tSlotB, 420)} dash={k(tSlotB + 300, 260)} color={WH} />
        </div>
      ) : null}

      {/* ── lower over, higher under: a dashed tie, and the question ── */}
      {tieQ > 0 ? (
        <svg style={{ position: "absolute", left: D.a.x + D.a.w / 2, top: D.a.top - 70, clipPath: `inset(0 ${(1 - tieQ) * 100}% 0 0)` }} width={D.b.x - D.a.x} height={D.b.top - D.a.top + 60}>
          <path d={`M3 60 L3 4 L${D.b.x - D.a.x - 3} 4 L${D.b.x - D.a.x - 3} ${D.b.top - D.a.top + 50}`} fill="none" stroke={WH} strokeWidth={5} strokeDasharray="14 11" strokeLinecap="round" />
        </svg>
      ) : null}
      <div style={{ position: "absolute", left: LEAVES.why.x, top: LEAVES.why.y, opacity: clamp01(k(tWhy, 110) * 2), transform: `scale(${lerp(1.35, 1, EASE(k(tWhy, 320)))})`, transformOrigin: "left bottom", ...big(WH, LEAVES.why.size) }}>{why.label}</div>
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// WatchDetail (white card)
// ══════════════════════════════════════════════════════════════════════════
export const WATCH = {
  title: { left: 130, top: 330, size: 130 },
  slots: { x: 130, y: [330, 470], w: 400, h: 100 },
  fork: { x0: 530, xj: 760, x1: 1100, yj: 450, y: [330, 570] },
  rail: { x0: 130, x1: 1500, y: 660 },
};

export const WatchDetail: React.FC<Win & {
  title: ({ text: string; accent?: boolean } & Cued)[]; // one row per entry
  clear: Cued; // a pause: the title retires
  kicker: { label: string } & Cued;
  slots: { names: [string, string] } & Cued; // the two empty slots land
  branches: ({ label: string; until: Cued } & Cued)[]; // two: the branch draws from its word to `until`, then its station lands
  clear2: Cued; // a pause: the fork retires
  secondKicker: { label: string } & Cued;
  drug: { label: string } & Cued;
  disease: { label: string } & Cued;
  rail: { until: Cued } & Cued;
  ring: { label: string } & Cued;
  when: { label: string } & Cued;
}> = ({ from, to, title, clear, kicker, slots, branches, clear2, secondKicker, drug, disease, rail, ring, when }) => {
  const ms = useMs();
  const k = useK();
  const INK = COLORS.ink;
  const SUB = inkA(0.6);
  const DASH = inkA(0.55);
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));
  const run = (a: number, b: number) => clamp01((ms - a) / Math.max(250, b - a));

  let prev = from - 300;
  const tTitle = title.map((l) => (prev = at(l, prev + 700, from, prev + 150)));
  const tClear = at(clear, prev + 600, from, prev + 300);
  const tKick = at(kicker, tClear + 300, from, tClear + 200);
  const tSlots = at(slots, tKick + 1500, from, tKick + 300);
  prev = tSlots;
  const tBr = branches.map((b) => {
    const a = at(b, prev + 900, from, prev + 300);
    const e = at(b.until, a + 700, from, a + 300);
    prev = e;
    return [a, e] as const;
  });
  const tClear2 = at(clear2, prev + 700, from, prev + 400);
  const tSK = at(secondKicker, tClear2 + 450, from, tClear2 + 300);
  const tDrug = at(drug, tSK + 350, from, tSK + 150);
  const tDis = at(disease, tDrug + 1300, from, tDrug + 400);
  const tRail = at(rail, tDis + 2300, from, tDis + 500);
  const tRailEnd = at(rail.until, tRail + 800, from, tRail + 400);
  const tRing = at(ring, tRailEnd, from, tRailEnd - 40);
  const tWhen = at(when, tRing + 1300, from, tRing + 300);

  const titleO = 1 - k(tClear, 260);
  const forkO = 1 - k(tClear2, 300);
  const S = WATCH.slots;
  const F = WATCH.fork;
  const R = WATCH.rail;
  const ringEl = (x: number, y: number, t: number) => (
    <svg style={{ position: "absolute", left: x - 34, top: y - 34, opacity: clamp01(k(t, 120) * 2), transform: `scale(${lerp(1.5, 1, EASE(k(t, 280)))})` }} width={68} height={68}>
      <circle cx={34} cy={34} r={28} fill={COLORS.paper} stroke={INK} strokeWidth={7} />
    </svg>
  );

  if (ms < tTitle[0] - 60) return null;
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {/* ── the title ── */}
      {titleO > 0 ? (
        <div style={{ position: "absolute", left: WATCH.title.left, top: WATCH.title.top, opacity: titleO }}>
          {title.map((l, i) => (
            <div key={i} style={{ opacity: k(tTitle[i], 130), transform: `translateY(${(1 - EASE(k(tTitle[i], 340))) * 30}px)`, marginBottom: 18, ...big(l.accent ? COLORS.accent : INK, WATCH.title.size) }}>{l.text}</div>
          ))}
        </div>
      ) : null}

      {/* ── the two slots and the fork ── */}
      {ms >= tKick - 20 && forkO > 0 ? (
        <div style={{ opacity: forkO }}>
          <div style={{ position: "absolute", left: 130, top: 120, opacity: k(tKick, 200), ...label(SUB, 36) }}>{kicker.label}</div>
          {slots.names.map((n, i) => (
            <EmptySlot key={i} x={S.x} y={S.y[i]} w={S.w} h={S.h} q={k(tSlots + i * 160, 420)} dash={k(tSlots + i * 160 + 300, 260)} color={DASH}>
              <span style={{ opacity: k(tSlots + i * 160, 220), ...label(INK, 34) }}>{n}</span>
            </EmptySlot>
          ))}
          {branches.map((b, i) => {
            const q = EASE_IO(run(tBr[i][0], tBr[i][1]));
            const w = F.x1 - F.x0;
            const y0 = Math.min(F.yj, F.y[i]);
            const h = Math.abs(F.y[i] - F.yj) + 12;
            const ya = F.yj - y0 + 6, yb = F.y[i] - y0 + 6;
            return (
              <React.Fragment key={i}>
                <div style={{ position: "absolute", left: F.x0, top: y0 - 6, width: w * q, height: h, overflow: "hidden" }}>
                  <svg width={w} height={h}>
                    <path d={`M0 ${ya} L${F.xj - F.x0} ${ya} L${F.xj - F.x0} ${yb} L${w - 30} ${yb}`} fill="none" stroke={DASH} strokeWidth={6} strokeDasharray="18 14" strokeLinejoin="round" />
                  </svg>
                </div>
                {ringEl(F.x1, F.y[i], tBr[i][1])}
                <div style={{ position: "absolute", left: F.x1 + 56, top: F.y[i] - 34, opacity: k(tBr[i][1] + 60, 200), transform: `translateX(${(1 - EASE(k(tBr[i][1] + 60, 340))) * 30}px)`, ...big(INK, 64) }}>{b.label}</div>
              </React.Fragment>
            );
          })}
        </div>
      ) : null}

      {/* ── one more trial, one date ── */}
      {ms >= tSK - 20 ? (
        <>
          <div style={{ position: "absolute", left: 130, top: 120, opacity: k(tSK, 200), ...label(SUB, 36) }}>{secondKicker.label}</div>
          <div style={{ position: "absolute", left: 130, top: 190, opacity: k(tDrug, 110), transform: `scale(${lerp(1.25, 1, EASE(k(tDrug, 320)))})`, transformOrigin: "left bottom", ...big(INK, 150) }}>{drug.label}</div>
          <div style={{ position: "absolute", left: 130, top: 372, opacity: k(tDis, 220), ...big(SUB, 56) }}>{disease.label}</div>
          <div style={{ position: "absolute", left: R.x0, top: R.y - 3, width: (R.x1 - 34 - R.x0) * run(tRail, tRailEnd), height: 6, overflow: "hidden" }}>
            <svg width={R.x1 - R.x0} height={6}><line x1={0} y1={3} x2={R.x1 - R.x0} y2={3} stroke={DASH} strokeWidth={6} strokeDasharray="18 14" /></svg>
          </div>
          {ringEl(R.x1, R.y, tRing)}
          <div style={{ position: "absolute", left: R.x1 - 700, width: 760, textAlign: "right", top: R.y + 56, opacity: k(tRing + 80, 220), ...label(SUB, 36) }}>{ring.label}</div>
          <div style={{ position: "absolute", left: R.x1 - 900, width: 960, textAlign: "right", top: R.y - 190, opacity: clamp01(k(tWhen, 110) * 2), transform: `scale(${lerp(1.25, 1, EASE(k(tWhen, 320)))})`, transformOrigin: "right bottom", ...big(COLORS.accent, 130) }}>{when.label}</div>
        </>
      ) : null}
    </AbsoluteFill>
  );
};
