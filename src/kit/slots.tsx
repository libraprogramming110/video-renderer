// ─────────────────────────────────────────────────────────────────────────
// KIT · slots — WHAT A PARTNER COULD PUBLISH. GSK x Chai HORIZONTAL long-form,
// 2026-10-15 (absolute 1920x1080 coordinates). The spine's last appearance.
//
// `ThreeSlots` (§6, black over the test-tube scrim): the narration flows; three
//   DASHED slots land on their words, each holding a hollow version of the
//   thing it would publish (the §3 dashed plate, an empty rate track, the §1
//   dashed molecule). "Company-reported" stamps under them and the line it
//   qualifies follows. In the pause everything retires, and the verdict lands
//   as two words: "Real." in white, then "Early." in red.
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { CLAMP, clamp01, COLORS, DISPLAY, INK_SUB, TRACK, useMs } from "./core";
import { at, lerp, Phrase, useK, type Cued, type Win } from "./elora";
import { Molecule } from "./chai";
import { Plate } from "./panel";

const EASE = Easing.out(Easing.cubic);

const label = (color: string, size: number): React.CSSProperties => ({
  fontFamily: DISPLAY, fontWeight: 700, fontSize: size, letterSpacing: TRACK.kicker, color, whiteSpace: "nowrap", lineHeight: 1.1,
});
const big = (color: string, size: number): React.CSSProperties => ({
  fontFamily: DISPLAY, fontWeight: 700, fontSize: size, letterSpacing: TRACK.display, color, lineHeight: 1, whiteSpace: "nowrap",
});
const stamp = (q: number, from = 1.35) => ({ opacity: clamp01(q * 3), transform: `scale(${lerp(from, 1, EASE(q))})` });

export const SLOTS = {
  lead: { top: 110, size: 60 },
  xs: [400, 960, 1520] as const,
  box: { top: 330, w: 440, h: 260 }, // y 330..590
  labelTop: 612,
  report: { top: 712, size: 56 },
  bind: { top: 804, size: 40 },
  verdict: { top: 400, size: 220, xs: [560, 1360] as const }, // "Real." ~241..879, "Early." ~977..1743
};

export const ThreeSlots: React.FC<Win & {
  lead: { line: string; until: number };
  slots: ({ label: string } & Cued)[]; // targets tested · hit rates · a molecule in the clinic
  report: { label: string } & Cued; // "Company-reported"
  bind: { label: string } & Cued;
  clear: Cued; // a pause: slots + stamp retire
  real: { text: string } & Cued;
  early: { text: string } & Cued;
}> = ({ from, to, lead, slots, report, bind, clear, real, early }) => {
  const ms = useMs();
  const k = useK();
  const WH = COLORS.paper;
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));

  let prev = from + 1500;
  const tS = slots.map((s) => (prev = at(s, prev + 900, from, prev + 300)));
  const tRep = at(report, prev + 2000, from, Math.max(prev + 500, lead.until));
  const tBind = at(bind, tRep + 2000, from, tRep + 500);
  const tClear = at(clear, tBind + 1000, from, tBind + 400);
  const tReal = at(real, tClear + 400, from, tClear + 200);
  const tEarly = at(early, tReal + 1200, from, tReal + 400);

  const B = SLOTS.box;
  const out = 1 - k(tClear, 320);

  // what each slot would hold, drawn hollow (centred in a 440x260 box)
  const glyph = (i: number, q: number) => {
    if (i === 0) return <Plate cx={B.w / 2} cy={B.h / 2} n={3} pitch={110} r={34} color={WH} edge="dashed" k={q} />;
    if (i === 1)
      return (
        <svg style={{ position: "absolute", left: 0, top: 0 }} width={B.w} height={B.h}>
          <rect x={70} y={B.h / 2 - 16} width={(B.w - 140) * EASE(q)} height={32} rx={16} fill="none" stroke={WH} strokeWidth={5} strokeDasharray="14 10" />
          <text x={B.w / 2} y={B.h / 2 - 40} textAnchor="middle" fontFamily={DISPLAY} fontWeight={700} fontSize={64} fill={WH} fillOpacity={0.45 * q}>— %</text>
        </svg>
      );
    return <Molecule cx={B.w / 2} cy={B.h / 2} size={170} color={WH} dashed k={q} />;
  };

  if (ms < from - 60) return null;
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <Phrase from={from} to={lead.until} line={lead.line} top={SLOTS.lead.top} size={SLOTS.lead.size} color={WH} />

      {out > 0 ? (
        <div style={{ opacity: out }}>
          {SLOTS.xs.map((x, i) => {
            const q = EASE(k(tS[i], 400));
            if (q <= 0 || !slots[i]) return null;
            return (
              <div key={i}>
                <div style={{ position: "absolute", left: x - B.w / 2, top: B.top + (1 - q) * 50, width: B.w, height: B.h, opacity: clamp01(q * 3) }}>
                  <svg style={{ position: "absolute", left: 0, top: 0 }} width={B.w} height={B.h}>
                    <rect x={2.5} y={2.5} width={B.w - 5} height={B.h - 5} rx={28} fill="none" stroke={WH} strokeWidth={5} strokeDasharray="18 13" />
                  </svg>
                  {glyph(i, k(tS[i] + 150, 600))}
                </div>
                <div style={{ position: "absolute", left: x - 300, width: 600, top: SLOTS.labelTop, textAlign: "center", opacity: k(tS[i] + 120, 220), ...label(WH, 40) }}>{slots[i].label}</div>
              </div>
            );
          })}
          <div style={{ position: "absolute", left: 0, width: 1920, top: SLOTS.report.top, display: "flex", justifyContent: "center" }}>
            <div style={{ padding: "14px 36px", borderRadius: 48, background: WH, ...label(COLORS.ink, SLOTS.report.size), ...stamp(k(tRep, 300), 1.4) }}>{report.label}</div>
          </div>
          <div style={{ position: "absolute", left: 0, width: 1920, top: SLOTS.bind.top + 30, textAlign: "center", opacity: k(tBind, 220), ...label(INK_SUB, SLOTS.bind.size) }}>{bind.label}</div>
        </div>
      ) : null}

      {/* ── the verdict: two words ── */}
      <div style={{ position: "absolute", left: SLOTS.verdict.xs[0] - 400, width: 800, top: SLOTS.verdict.top, textAlign: "center", ...big(WH, SLOTS.verdict.size), ...stamp(k(tReal, 300), 1.3) }}>{real.text}</div>
      <div style={{ position: "absolute", left: SLOTS.verdict.xs[1] - 400, width: 800, top: SLOTS.verdict.top, textAlign: "center", ...big(COLORS.accent, SLOTS.verdict.size), ...stamp(k(tEarly, 300), 1.3) }}>{early.text}</div>
    </AbsoluteFill>
  );
};
