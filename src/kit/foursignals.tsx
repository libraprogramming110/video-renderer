// ─────────────────────────────────────────────────────────────────────────
// KIT · foursignals — THE SIGNAL COMES IN ORDER. Added on the Viatris x Pacira
// HORIZONTAL long-form, 2026-10-14 (16:9; absolute 1920x1080 coordinates, not
// portrait-safe as written). One-mover rule and the frame budget.
//
// `FourSignals` (ink): a lead line that retires; a DASHED rail that grows one
//   station at a time while a red cursor travels with it (the script orders all
//   four, so left-to-right order is a fact here, cf. the 10-05 fork rule). Every
//   station is a HOLLOW ring: none of these has happened. A dated station gets a
//   day leaf; an undated one a dashed EMPTY leaf (no date given). Callbacks: the
//   §4 hollow condition box returns under the stations that are conditions, and
//   the §3 dashed capsule returns under the FDA date.
//
// Every onset is a spoken word with an optional ms pin, clamped monotonic.
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { CLAMP, clamp01, COLORS, DISPLAY, INK_SUB, TRACK, useMs } from "./core";
import { TYPE } from "../style";
import { at, lerp, useK, type Cued, type Win } from "./elora";
import { DayLeaf } from "./unity";
import { Pill } from "./pacira";

const EASE = Easing.out(Easing.cubic);
const EASE_IO = Easing.inOut(Easing.cubic);

const label = (color: string, size: number = TYPE.label): React.CSSProperties => ({
  fontFamily: DISPLAY, fontWeight: 700, fontSize: size, letterSpacing: TRACK.kicker, color, whiteSpace: "nowrap",
});
const big = (color: string, size: number): React.CSSProperties => ({
  fontFamily: DISPLAY, fontWeight: 700, fontSize: size, letterSpacing: TRACK.display, color, lineHeight: 1, whiteSpace: "nowrap",
});
const stamp = (q: number, from = 1.35) => ({ opacity: clamp01(q * 3), transform: `scale(${lerp(from, 1, EASE(q))})` });
const rise = (q: number, d = 24) => ({ opacity: q, transform: `translateY(${(1 - EASE(q)) * d}px)` });

export const FOUR = {
  lead: { top: 140, size: 88 },
  rail: { y: 470, x0: 160, x1: 1760 },
  xs: [320, 760, 1200, 1640] as const,
  leaf: { w: 120, h: 132, top: 284 },
  num: 520,
  label: 576,
  sub: 706,
};

type Station = {
  at: Cued; // the ordinal word: the rail grows to it, the cursor travels
  date?: { month: string; day: string } & Cued; // no date = a dashed empty leaf
  lines: string[]; // the label, one or two lines
  labelCue: Cued;
  sub?: { text: string; box?: boolean; capsule?: boolean } & Cued;
};

export const FourSignals: React.FC<Win & {
  lead: ({ text: string } & Cued)[];
  clear: Cued; // the lead retires
  stations: Station[];
}> = ({ from, to, lead, clear, stations }) => {
  const ms = useMs();
  const k = useK();
  const WH = COLORS.paper;
  const RED = COLORS.accent;
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));

  let prev = from;
  const tLead = lead.map((l) => (prev = at(l, prev + 250, from, prev)));
  const tClear = at(clear, prev + 500, from, prev + 200);
  let p = tClear;
  const ts = stations.map((s) => {
    const a = (p = at(s.at, p + 400, from, p + 150));
    const d = s.date ? (p = at(s.date, p + 250, from, p + 100)) : a + 200;
    const l = (p = at(s.labelCue, p + 400, from, p + 150));
    const sb = s.sub ? (p = at(s.sub, p + 1200, from, p + 300)) : Infinity;
    return { a, d, l, sb };
  });

  const R = FOUR.rail;
  const X = FOUR.xs;
  const leadO = 1 - k(tClear, 300);

  // the rail's head + the cursor: run to each station on its ordinal word
  let head = R.x0;
  ts.forEach((t, i) => {
    const q = EASE_IO(k(t.a, 520));
    if (q > 0) head = lerp(i ? X[i - 1] : R.x0, X[i], q);
  });
  const lastReached = ts.reduce((n, t, i) => (ms >= t.a ? i : n), -1);
  const railEnd = lastReached === stations.length - 1 ? lerp(X[3], R.x1, EASE_IO(k(ts[3].a + 520, 400))) : head;

  if (ms < tLead[0] - 60) return null;
  const L = FOUR.leaf;
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {/* ── the lead ── */}
      {leadO > 0 ? (
        <div style={{ position: "absolute", left: 0, width: 1920, top: FOUR.lead.top, display: "flex", justifyContent: "center", gap: 24, opacity: leadO }}>
          {lead.map((l, i) => <div key={i} style={{ ...big(WH, FOUR.lead.size), ...rise(k(tLead[i], 240)) }}>{l.text}</div>)}
        </div>
      ) : null}

      {/* ── the rail (dashed: none of this has happened) ── */}
      {lastReached >= 0 ? (
        <svg style={{ position: "absolute", left: 0, top: R.y - 5 }} width={1920} height={10}>
          <line x1={R.x0} y1={5} x2={railEnd} y2={5} stroke={WH} strokeWidth={6} strokeDasharray="20 14" strokeLinecap="round" />
        </svg>
      ) : null}

      {stations.map((s, i) => {
        const t = ts[i];
        if (ms < t.a - 40) return null;
        const x = X[i];
        const ringQ = k(t.a + 420, 280);
        return (
          <React.Fragment key={i}>
            {/* date leaf, or a dashed empty one */}
            {s.date ? (
              <DayLeaf rect={{ x: x - L.w / 2, y: L.top, w: L.w, h: L.h }} k={k(t.d, 520)} month={s.date.month} day={s.date.day} />
            ) : (
              <div style={{ position: "absolute", left: x - L.w / 2, top: L.top, width: L.w, height: L.h, borderRadius: 16, boxSizing: "border-box", border: `4px dashed ${INK_SUB}`, display: "flex", alignItems: "center", justifyContent: "center", ...stamp(k(t.d, 300), 1.2) }}>
                <div style={{ width: 40, height: 8, borderRadius: 4, background: INK_SUB }} />
              </div>
            )}
            {/* hollow ring */}
            <div style={{ position: "absolute", left: x - 26, top: R.y - 26, width: 52, height: 52, borderRadius: 26, boxSizing: "border-box", background: COLORS.ink, border: `6px solid ${WH}`, ...stamp(ringQ, 1.6) }} />
            <div style={{ position: "absolute", left: x - 200, width: 400, top: FOUR.num, textAlign: "center", ...label(INK_SUB, 36), opacity: ringQ }}>{String(i + 1).padStart(2, "0")}</div>
            <div style={{ position: "absolute", left: x - 220, width: 440, top: FOUR.label, display: "flex", flexDirection: "column", alignItems: "center", gap: 8, ...rise(k(t.l, 260), 18) }}>
              {s.lines.map((ln, j) => <div key={j} style={big(WH, 44)}>{ln}</div>)}
            </div>
            {s.sub ? (
              <div style={{ position: "absolute", left: x - 220, width: 440, top: FOUR.sub, display: "flex", flexDirection: "column", alignItems: "center", gap: 14, ...rise(k(t.sb, 260), 14) }}>
                {s.sub.capsule ? (
                  <div style={{ position: "relative", width: 150, height: 76 }}>
                    <Pill cx={75} cy={38} w={140} color={WH} back={COLORS.ink} dashed />
                  </div>
                ) : null}
                <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                  {s.sub.box ? <div style={{ width: 36, height: 36, borderRadius: 7, boxSizing: "border-box", border: `4px solid ${INK_SUB}` }} /> : null}
                  <div style={label(INK_SUB, 34)}>{s.sub.text}</div>
                </div>
              </div>
            ) : null}
          </React.Fragment>
        );
      })}

      {/* ── the cursor: what to watch next ── */}
      {lastReached >= 0 ? <div style={{ position: "absolute", left: head - 18, top: R.y - 18, width: 36, height: 36, borderRadius: 18, background: RED }} /> : null}
    </AbsoluteFill>
  );
};
