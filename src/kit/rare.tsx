// ─────────────────────────────────────────────────────────────────────────
// KIT · rare — the ultra-rare / mechanism set (added BioIntel Jazz × Actio
// long-form, 2026-08-12). Four portrait-first, bg-aware, monochrome blocks for
// a script whose facts are a MECHANISM, a BURDEN, a CEILING and an ESCALATION.
//
//   • ChannelBlock     — a small molecule seats in an ion channel and the flow STOPS
//   • RareBurden       — the section-length spine: a live trace that erupts, then an
//                        approved-therapy track that never fills
//   • CeilingExtend    — a settled figure that GROWS a contingent second segment
//   • EscalationLadder — three rungs, each larger than the last, landing on cue
//
// All SVG <text> passes fontFamily={SANS} (the kit's standing serif bug, 08-08).
// Every position is a deterministic function of the frame — never Math.random().
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import {
  CLAMP,
  clamp01,
  caps,
  COLORS,
  CountUp,
  cue,
  DISPLAY,
  INK_SUB,
  inkA,
  TRACK,
  useMs,
  usePop,
  useStamp,
} from "./core";
import { FORMAT, TYPE } from "../style";

const V = FORMAT.key === "vertical";

type Win = { from: number; to: number };

// the shared beat-visibility window (fade in after `from`, out before `to`)
const useVis = (from: number, to: number, padIn = 360, padOut = 360) => {
  const ms = useMs();
  return clamp01(interpolate(ms, [from, from + padIn, to - padOut, to], [0, 1, 1, 0], CLAMP));
};

const palette = (bg: "ink" | "paper") => ({
  fg: bg === "ink" ? COLORS.paper : COLORS.ink,
  sub: bg === "ink" ? INK_SUB : COLORS.grayText,
  line: bg === "ink" ? "rgba(255,255,255,0.18)" : COLORS.border,
  faint: bg === "ink" ? "rgba(255,255,255,0.10)" : inkA(0.10),
});

// ═══════════════════════════════════════════════════════════════════════════
// ChannelBlock — SHOW-DON'T-TELL for "a small molecule that inhibits an ion
// channel". A membrane with an open pore is on screen from the first frame
// (unlabelled — it makes no claim yet) and ions stream up through it. The
// molecule appears ABOVE on its spoken words, deliberately tiny; on the
// `inhibit` cue it TRAVELS down and seats in the pore, the stream dies, and the
// remaining ions stall beneath the membrane. The channel is only NAMED last,
// because that is the order the VO says it in.
//
// The motion carries the verb: nothing on screen has to say "inhibits".
// ═══════════════════════════════════════════════════════════════════════════
export const ChannelBlock: React.FC<Win & {
  kicker?: string;
  /** the asset name — stamps first */
  name: string;
  nameCue: string;
  /** the molecule mark's caption, revealed as it is described */
  molecule: { label: string; word: string };
  /** the cue on which the molecule travels into the pore */
  inhibitCue: string;
  /** the channel's name + a qualifier, landing last (as spoken) */
  channel: { label: string; note?: string; word: string };
  bg?: "ink" | "paper";
}> = ({ from, to, kicker, name, nameCue, molecule, inhibitCue, channel, bg = "ink" }) => {
  const ms = useMs();
  const vis = useVis(from, to);
  const { fg, sub, line, faint } = palette(bg);

  const k = usePop(from + 250, { rise: 12 });
  const nameOn = cue(nameCue, from + 2200, from);
  const nameStamp = useStamp(nameOn, { from: 1.1 });
  const molOn = cue(molecule.word, nameOn + 1400, from);
  const inhibitOn = cue(inhibitCue, molOn + 1600, from);
  const chanOn = cue(channel.word, inhibitOn + 1200, from);

  // ── the membrane + pore geometry (viewBox 900 × 560) ─────────────────────
  const CX = 450;              // pore centre
  const PORE_HALF = 52;        // pore half-width
  const MEM_TOP = 250;         // upper leaflet y
  const MEM_BOT = 330;         // lower leaflet y
  const RAIL = 15;             // leaflet thickness

  // membrane rails draw outward from the pore on entry
  const memP = clamp01(interpolate(ms, [from + 150, from + 1100], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) }));
  const railW = memP * (CX - PORE_HALF - 60);

  // the pore walls stand up with the membrane
  const wallP = clamp01(interpolate(ms, [from + 500, from + 1300], [0, 1], CLAMP));

  // ── ions: a deterministic upward stream through the open pore ────────────
  // Each ion's phase is (t + i/N) mod 1 — a fixed offset per index, so the
  // stream is identical on every render and never boils.
  const ION_N = 7;
  const RISE_FROM = 520;       // below the membrane
  const RISE_TO = 40;          // above it
  // the stream dies as the plug seats: emission stops, survivors fade
  const flowing = clamp01(interpolate(ms, [inhibitOn - 100, inhibitOn + 620], [1, 0], CLAMP));
  const t = (ms - from) / 2400;

  // ── the molecule: waits above, then travels into the pore ────────────────
  const travel = clamp01(interpolate(ms, [inhibitOn, inhibitOn + 700], [0, 1], { ...CLAMP, easing: Easing.inOut(Easing.cubic) }));
  const molAppear = clamp01(interpolate(ms, [molOn, molOn + 300], [0, 1], CLAMP));
  const MOL_Y0 = 70;
  const MOL_Y1 = (MEM_TOP + MEM_BOT) / 2;
  const molY = interpolate(travel, [0, 1], [MOL_Y0, MOL_Y1], CLAMP);
  // once seated it keeps a slow breathe so the held frame stays alive
  const seated = clamp01(interpolate(ms, [inhibitOn + 700, inhibitOn + 900], [0, 1], CLAMP));
  const molR = 34 * (1 + 0.045 * Math.sin((ms - inhibitOn) / 480) * seated);

  // stalled ions collect under the plug once the flow is dead
  const stall = clamp01(interpolate(ms, [inhibitOn + 400, inhibitOn + 1400], [0, 1], CLAMP));

  const chan = usePop(chanOn, { rise: 18 });
  const molCap = usePop(molOn, { rise: 12 });

  return (
    <AbsoluteFill style={{ opacity: vis, justifyContent: "center", alignItems: "center", padding: V ? "0 90px" : "0 220px" }}>
      {kicker ? (
        <div style={{ ...k, marginBottom: 26 }}>
          <div style={caps(sub)}>{kicker}</div>
        </div>
      ) : null}

      {/* the asset name — stamps on its spoken word */}
      <div style={nameStamp}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: V ? 128 : 140, letterSpacing: TRACK.display, color: fg, lineHeight: 1 }}>
          {name}
        </div>
      </div>

      {/* the molecule's caption, above the diagram where the molecule waits */}
      <div style={{ ...molCap, marginTop: 26, opacity: molCap.opacity * (1 - travel * 0.65) }}>
        <div style={caps(sub)}>{molecule.label}</div>
      </div>

      <svg width={V ? 900 : 760} viewBox="0 0 900 560" style={{ marginTop: 8, overflow: "visible" }}>
        {/* ── ions in flight (drawn behind the membrane) ── */}
        {Array.from({ length: ION_N }).map((_, i) => {
          const phase = (t + i / ION_N) % 1;
          const y = interpolate(phase, [0, 1], [RISE_FROM, RISE_TO], CLAMP);
          // an ion that has not yet reached the membrane keeps rising; the flow
          // as a whole fades out once the pore is plugged
          const fade = interpolate(phase, [0, 0.08, 0.88, 1], [0, 1, 1, 0], CLAMP) * flowing;
          const drift = Math.sin((phase + i) * 3.1) * 9;
          return <circle key={`ion${i}`} cx={CX + drift} cy={y} r={9} fill={fg} opacity={fade * 0.8} />;
        })}

        {/* ── stalled ions: they pile BELOW the membrane once the flow dies ── */}
        {Array.from({ length: 5 }).map((_, i) => {
          const cx = CX - 68 + i * 34;
          const cy = MEM_BOT + 96 + (i % 2) * 34;
          return <circle key={`st${i}`} cx={cx} cy={cy} r={9} fill={fg} opacity={stall * 0.55} />;
        })}

        {/* ── the membrane: two leaflets drawing outward from the pore ── */}
        {[MEM_TOP, MEM_BOT].map((y, li) => (
          <g key={`mem${li}`}>
            <rect x={CX - PORE_HALF - 30 - railW} y={y} width={railW} height={RAIL} rx={RAIL / 2} fill={line} />
            <rect x={CX + PORE_HALF + 30} y={y} width={railW} height={RAIL} rx={RAIL / 2} fill={line} />
          </g>
        ))}

        {/* ── the pore walls ── */}
        {[-1, 1].map((s) => (
          <rect
            key={`wall${s}`}
            x={CX + s * PORE_HALF - (s < 0 ? 30 : 0)}
            y={MEM_TOP - 34 * wallP}
            width={30}
            height={(MEM_BOT - MEM_TOP + RAIL + 68) * wallP}
            rx={15}
            fill={fg}
            opacity={0.9}
          />
        ))}

        {/* ── the molecule: waits above, then seats in the pore ── */}
        <g opacity={molAppear}>
          <circle cx={CX} cy={molY} r={molR} fill={fg} />
          <circle cx={CX} cy={molY} r={molR + 16} fill="none" stroke={fg} strokeWidth={3} opacity={0.35 * (1 - travel)} />
        </g>

        {/* ── the channel's own hairline + label, landing LAST (as spoken) ── */}
        <line
          x1={CX + PORE_HALF + 46}
          y1={(MEM_TOP + MEM_BOT) / 2 + RAIL / 2}
          x2={CX + PORE_HALF + 46 + 210 * clamp01(interpolate(ms, [chanOn, chanOn + 480], [0, 1], CLAMP))}
          y2={(MEM_TOP + MEM_BOT) / 2 + RAIL / 2}
          stroke={sub}
          strokeWidth={2}
        />
        <rect x={CX - PORE_HALF} y={MEM_TOP} width={PORE_HALF * 2} height={MEM_BOT - MEM_TOP + RAIL} fill={faint} />
      </svg>

      {/* the channel name resolves under the diagram, on its spoken word */}
      <div style={{ ...chan, marginTop: 18, textAlign: "center" }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: V ? 68 : 72, letterSpacing: TRACK.headline, color: fg, lineHeight: 1.05 }}>
          {channel.label}
        </div>
        {channel.note ? <div style={{ ...caps(sub), marginTop: 12 }}>{channel.note}</div> : null}
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// RareBurden — the SECTION-LENGTH SPINE. One object (a live physiological
// trace) is on screen for the whole section and develops through four phases:
//   1. the condition stamps
//   2. the affected population counts up (an explicit ms window — the figure is
//      a single measured Whisper token, so cue it to the measurement)
//   3. the trace ERUPTS into relentless spikes and keeps firing ("hundreds a day")
//   4. an APPROVED THERAPY track draws and never fills; the absence is stamped
//
// The trace scrolls continuously (a fixed spike pattern translated by time), so
// a 14-second hold never freezes and nothing is randomised per frame.
// ═══════════════════════════════════════════════════════════════════════════
export const RareBurden: React.FC<Win & {
  kicker?: string;
  condition: string;
  conditionCue: string;
  count: { value: number; label: string; fromMs: number; toMs: number };
  burden: { label: string; cue: string };
  absence: { track: string; stamp: string; cue: string; stampCue: string };
  bg?: "ink" | "paper";
}> = ({ from, to, kicker, condition, conditionCue, count, burden, absence, bg = "ink" }) => {
  const ms = useMs();
  const vis = useVis(from, to);
  const { fg, sub, line } = palette(bg);

  const k = usePop(from + 200, { rise: 12 });
  const condOn = cue(conditionCue, from + 1600, from);
  const condStamp = useStamp(condOn, { from: 1.08 });
  const eruptOn = cue(burden.cue, count.toMs + 2000, from);
  const absOn = cue(absence.cue, eruptOn + 2200, from);
  const stampOn = cue(absence.stampCue, absOn + 700, from);

  // ── the trace ────────────────────────────────────────────────────────────
  // A fixed spike pattern 300px wide, tiled 5× and translated leftward by time.
  // Amplitude ramps from a flat reference line to full spikes on the erupt cue.
  const W = 900;
  const H = 230;
  const MID = H / 2;
  const amp = clamp01(interpolate(ms, [eruptOn, eruptOn + 700], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) }));
  const scroll = ((ms - from) / 1000) * 165; // px/s — steady, unhurried, relentless
  const TILE = 300;
  // one tile of the waveform: a quiet run, then a sharp biphasic spike
  const tile = (x0: number) => {
    const pts: string[] = [];
    for (let i = 0; i <= 30; i++) {
      const x = x0 + (i / 30) * TILE;
      const u = i / 30;
      // a deterministic spike train: two spikes per tile, sharp up / sharp down
      const s1 = Math.exp(-Math.pow((u - 0.28) * 26, 2));
      const s2 = Math.exp(-Math.pow((u - 0.62) * 34, 2));
      const base = Math.sin(u * 11.3) * 3; // faint baseline life, always present
      const y = MID - (base + amp * (s1 * 78 - s2 * 54));
      pts.push(`${x.toFixed(1)},${y.toFixed(1)}`);
    }
    return pts.join(" ");
  };
  const offset = -(scroll % TILE);
  const tiles = [0, 1, 2, 3, 4].map((n) => tile(offset + n * TILE));

  // the whole trace steps back once the argument moves to the absence
  const traceDim = interpolate(ms, [absOn, absOn + 600], [1, 0.34], CLAMP);

  // ── the absent-therapy track: drawn, empty, struck ───────────────────────
  const trackW = clamp01(interpolate(ms, [absOn, absOn + 700], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) })) * 640;
  const strikeW = clamp01(interpolate(ms, [stampOn, stampOn + 420], [0, 1], CLAMP)) * 640;
  const stamp = useStamp(stampOn, { from: 1.2 });
  const burdenCap = usePop(eruptOn + 180, { rise: 12 });
  const absCap = usePop(absOn, { rise: 12 });

  return (
    <AbsoluteFill style={{ opacity: vis, justifyContent: "center", alignItems: "center", padding: V ? "0 90px" : "0 200px", textAlign: "center" }}>
      {kicker ? (
        <div style={{ ...k, marginBottom: 22 }}>
          <div style={caps(sub)}>{kicker}</div>
        </div>
      ) : null}

      <div style={condStamp}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: V ? 86 : 96, letterSpacing: TRACK.display, color: fg, lineHeight: 1.04, maxWidth: 880 }}>
          {condition}
        </div>
      </div>

      {/* the population figure — cued to its MEASURED window, not a script token */}
      <div style={{ marginTop: 26, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <CountUp
          fromMs={count.fromMs}
          toMs={count.toMs}
          value={count.value}
          decimals={0}
          style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: V ? 168 : 150, letterSpacing: TRACK.display, color: fg, lineHeight: 0.94 }}
        />
        <div style={{ ...caps(sub), marginTop: 10, opacity: clamp01(interpolate(ms, [count.fromMs + 200, count.fromMs + 700], [0, 1], CLAMP)) }}>
          {count.label}
        </div>
      </div>

      {/* ── the spine: a live trace that erupts and never stops ── */}
      <div style={{ marginTop: 30, opacity: traceDim }}>
        <svg width={V ? 900 : 820} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", overflow: "hidden" }}>
          <line x1={0} y1={MID} x2={W} y2={MID} stroke={line} strokeWidth={1.5} strokeDasharray="6 10" />
          <clipPath id="traceClip">
            <rect x={0} y={0} width={W} height={H} />
          </clipPath>
          <g clipPath="url(#traceClip)">
            {tiles.map((pts, i) => (
              <polyline key={i} points={pts} fill="none" stroke={fg} strokeWidth={3} strokeLinejoin="round" strokeLinecap="round" opacity={0.92} />
            ))}
          </g>
        </svg>
        <div style={{ ...burdenCap, marginTop: 4 }}>
          <div style={caps(sub)}>{burden.label}</div>
        </div>
      </div>

      {/* ── the absence: a track that is drawn and never fills ── */}
      <div style={{ marginTop: 34, display: "flex", flexDirection: "column", alignItems: "center" }}>
        <div style={absCap}>
          <div style={caps(sub)}>{absence.track}</div>
        </div>
        <div style={{ position: "relative", marginTop: 14, height: 54, width: 640 }}>
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              height: 54,
              width: trackW,
              border: `2px dashed ${line}`,
              borderRadius: 6,
              boxSizing: "border-box",
            }}
          />
          <div style={{ position: "absolute", left: 0, top: 26, height: 3, width: strikeW, background: sub, borderRadius: 2 }} />
        </div>
        <div style={{ ...stamp, marginTop: 20 }}>
          <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: V ? 96 : 104, letterSpacing: TRACK.display, color: fg, lineHeight: 1 }}>
            {absence.stamp}
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// CeilingExtend — a figure that ALREADY LANDED earlier in the video returns as
// a settled solid segment, and a CONTINGENT second segment grows out of its
// right edge on cue. The two segments are drawn to true proportion
// (base/total and add/total), so the geometry IS the arithmetic — the ceiling
// figure counting up above is a readout of the picture, not a separate claim.
//
// The contingent segment is DASHED on purpose: milestones are not money paid.
// ═══════════════════════════════════════════════════════════════════════════
export const CeilingExtend: React.FC<Win & {
  kicker?: string;
  base: { label: string; caption: string };
  add: { label: string; caption: string; cue: string; captionCue: string };
  ceiling: { label: string; value: number; decimals: number; prefix?: string; suffix?: string; fromMs: number; toMs: number; cue: string };
  /** base and add as raw magnitudes in the same unit — used ONLY for proportion */
  weights: { base: number; add: number };
  bg?: "ink" | "paper";
}> = ({ from, to, kicker, base, add, ceiling, weights, bg = "paper" }) => {
  const ms = useMs();
  const vis = useVis(from, to);
  const { fg, sub, line } = palette(bg);

  const TRACK_W = V ? 860 : 1000;
  const total = weights.base + weights.add;
  const baseW = TRACK_W * (weights.base / total);
  const addW = TRACK_W * (weights.add / total);

  const k = usePop(from + 200, { rise: 12 });
  // the base segment is a CALLBACK — it is simply there on entry, already settled
  const baseIn = clamp01(interpolate(ms, [from + 250, from + 900], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) }));
  const addOn = cue(add.cue, from + 1200, from);
  const addP = clamp01(interpolate(ms, [addOn, addOn + 900], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) }));
  const addCapOn = cue(add.captionCue, addOn + 1400, from);
  const ceilOn = cue(ceiling.cue, addOn + 3000, from);
  const tickP = clamp01(interpolate(ms, [ceilOn, ceilOn + 520], [0, 1], CLAMP));

  const baseCap = usePop(from + 500, { rise: 10 });
  const addCap = usePop(addCapOn, { rise: 10 });
  const ceilCap = usePop(ceilOn, { rise: 10 });

  return (
    <AbsoluteFill style={{ opacity: vis, justifyContent: "center", alignItems: "center", padding: V ? "0 110px" : "0 200px" }}>
      {kicker ? (
        <div style={{ ...k, marginBottom: 30 }}>
          <div style={caps(sub)}>{kicker}</div>
        </div>
      ) : null}

      {/* the ceiling figure — a readout of the track below it */}
      <CountUp
        fromMs={ceiling.fromMs}
        toMs={ceiling.toMs}
        value={ceiling.value}
        decimals={ceiling.decimals}
        prefix={ceiling.prefix}
        suffix={ceiling.suffix}
        style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: V ? 210 : 200, letterSpacing: TRACK.display, color: fg, lineHeight: 0.94 }}
      />
      <div style={{ ...ceilCap, marginTop: 8, marginBottom: 46 }}>
        <div style={caps(sub)}>{ceiling.label}</div>
      </div>

      {/* ── the track: a settled solid segment + a contingent dashed one ── */}
      <div style={{ position: "relative", width: TRACK_W, height: 74 }}>
        {/* solid — the money already paid */}
        <div style={{ position: "absolute", left: 0, top: 0, height: 74, width: baseW * baseIn, background: fg, borderRadius: 6 }} />
        {/* contingent — grows out of the solid segment's right edge */}
        <div
          style={{
            position: "absolute",
            left: baseW,
            top: 0,
            height: 74,
            width: addW * addP,
            border: `3px dashed ${fg}`,
            borderLeft: "none",
            borderRadius: "0 6px 6px 0",
            boxSizing: "border-box",
            opacity: 0.75,
          }}
        />
        {/* the ceiling tick at the far end */}
        <div
          style={{
            position: "absolute",
            left: TRACK_W,
            top: -22 * tickP,
            height: (74 + 44) * tickP,
            width: 5,
            background: fg,
            borderRadius: 3,
          }}
        />
      </div>

      {/* segment captions, sized to their own segments so the split is legible */}
      <div style={{ width: TRACK_W, display: "flex", marginTop: 20 }}>
        <div style={{ width: baseW, textAlign: "left" }}>
          <div style={baseCap}>
            <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: V ? 54 : 56, letterSpacing: TRACK.headline, color: fg, lineHeight: 1 }}>{base.label}</div>
            <div style={{ ...caps(sub, TYPE.labelSm), marginTop: 8 }}>{base.caption}</div>
          </div>
        </div>
        <div style={{ width: addW, textAlign: "left", paddingLeft: 18, boxSizing: "border-box" }}>
          <div style={addCap}>
            <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: V ? 54 : 56, letterSpacing: TRACK.headline, color: sub, lineHeight: 1 }}>{add.label}</div>
            <div style={{ ...caps(sub, TYPE.labelSm), marginTop: 8 }}>{add.caption}</div>
          </div>
        </div>
      </div>

      <div style={{ width: TRACK_W, height: 2, background: line, marginTop: 34 }} />
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// EscalationLadder — N rungs landing on their spoken words, each rendered
// LARGER and heavier than the one above it, with a spine that extends down as
// each arrives. For a line whose whole meaning is the escalation itself
// ("one gene… one asset… nine figures upfront") — a chip row states the three
// items, this one performs the climb from a single gene to a nine-figure cheque.
// ═══════════════════════════════════════════════════════════════════════════
export const EscalationLadder: React.FC<Win & {
  kicker?: string;
  rungs: { label: string; word: string; ms?: number }[];
  bg?: "ink" | "paper";
  /** display size of the LAST (largest) rung; earlier rungs step down from it */
  topSize?: number;
}> = ({ from, to, kicker, rungs, bg = "ink", topSize }) => {
  const ms = useMs();
  const vis = useVis(from, to);
  const { fg, sub, line } = palette(bg);
  const k = usePop(from + 200, { rise: 12 });

  const biggest = topSize ?? (V ? 132 : 140);
  const onsets = rungs.map((r, i) => r.ms ?? cue(r.word, from + 900 + i * 2000, from));

  return (
    <AbsoluteFill style={{ opacity: vis, justifyContent: "center", alignItems: "center", padding: V ? "0 100px" : "0 240px" }}>
      {kicker ? (
        <div style={{ ...k, marginBottom: 40 }}>
          <div style={caps(sub)}>{kicker}</div>
        </div>
      ) : null}
      <div style={{ display: "flex", alignItems: "stretch", gap: 34 }}>
        {/* the spine — extends downward as each rung lands */}
        <div style={{ position: "relative", width: 5, background: line, borderRadius: 3 }}>
          <div
            style={{
              position: "absolute",
              left: 0,
              top: 0,
              width: 5,
              height: `${clamp01(interpolate(ms, [onsets[0], onsets[onsets.length - 1] + 500], [0, 1], CLAMP)) * 100}%`,
              background: fg,
              borderRadius: 3,
            }}
          />
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: V ? 30 : 26 }}>
          {rungs.map((r, i) => (
            <Rung
              key={i}
              label={r.label}
              onset={onsets[i]}
              size={biggest * (0.56 + (0.44 * i) / Math.max(1, rungs.length - 1))}
              fg={fg}
              sub={sub}
              last={i === rungs.length - 1}
            />
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

const Rung: React.FC<{ label: string; onset: number; size: number; fg: string; sub: string; last: boolean }> = ({
  label,
  onset,
  size,
  fg,
  sub,
  last,
}) => {
  const ms = useMs();
  const stamp = useStamp(onset, { from: last ? 1.18 : 1.08 });
  const ruleW = clamp01(interpolate(ms, [onset + 200, onset + 800], [0, 1], CLAMP)) * (last ? 300 : 150);
  return (
    <div style={{ ...stamp, transformOrigin: "left center" }}>
      <div
        style={{
          fontFamily: DISPLAY,
          fontWeight: 700,
          fontSize: size,
          letterSpacing: TRACK.display,
          color: last ? fg : sub,
          lineHeight: 1.02,
          whiteSpace: "nowrap",
        }}
      >
        {label}
      </div>
      {last ? <div style={{ height: 7, width: ruleW, background: fg, borderRadius: 4, marginTop: 14 }} /> : null}
    </div>
  );
};
