// ─────────────────────────────────────────────────────────────────────────
// KIT · spine — ONE object that lives across a whole SECTION and develops,
// instead of a new graphic every beat. Added on the BioIntel Pathos AI
// long-form (2026-08-06).
//
// This is the thing a 3-minute cut can do that a 60s reel structurally cannot.
// A reel has ~4s per beat, so every beat must be self-contained. Give a diagram
// 20 seconds and it can ASSEMBLE, then be INTERROGATED, then PERFORM — with a
// spec sheet beside it that accumulates and re-focuses as the narration moves.
//
//   AntibodySpine — a bispecific antibody-drug conjugate across three beats:
//     1. it assembles          ("a late-stage, bispecific ADC for breast cancer")
//     2. its two arms BIND     ("binds two separate targets at once")
//     3. its payload DELIVERS  ("carries a toxic payload directly to the tumor")
//   The spec rows land in beat 1 and stay; beats 2 and 3 brighten the row being
//   explained, dim the rest, and let the molecule act it out. Nothing crossfades
//   at screen centre — the object never leaves.
//
// LANDSCAPE-FIRST (the reason it is not just AssetAssembly): 16:9 affords a
// two-column split — diagram left, accumulating spec sheet right — where the
// portrait block has to stack everything and can only ever show one idea at a
// time. bg-aware, monochrome (weight + dim only).
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import {
  CLAMP, clamp01, caps, COLORS, cue, DISPLAY, INK_SUB, SANS, TRACK, useMs, usePop,
} from "./core";
import { FORMAT, TYPE } from "../style";

const V = FORMAT.key === "vertical";

type Win = { from: number; to: number };

const useVis = (from: number, to: number, padIn = 360, padOut = 360) => {
  const ms = useMs();
  return clamp01(interpolate(ms, [from, from + padIn, to - padOut, to], [0, 1, 1, 0], CLAMP));
};

// ── one row of the accumulating spec sheet ────────────────────────────────
const SpecRow: React.FC<{
  label: string;
  value: string;
  note?: string;
  onsetMs: number;
  /** when this row's note appears + the row takes focus (a later beat explains it) */
  noteMs?: number;
  dim: number;
  fg: string;
  sub: string;
  hair: string;
}> = ({ label, value, note, onsetMs, noteMs, dim, fg, sub, hair }) => {
  const ms = useMs();
  const pop = usePop(onsetMs, { rise: 18 });
  const noteOn = noteMs == null ? 0 : clamp01(interpolate(ms, [noteMs, noteMs + 320], [0, 1], CLAMP));
  const rule = clamp01(interpolate(ms, [onsetMs + 120, onsetMs + 820], [0, 1], CLAMP));
  return (
    <div style={{ ...pop, opacity: (pop.opacity as number) * dim, paddingBottom: V ? 14 : 18 }}>
      <div style={{ height: 2, width: `${rule * 100}%`, background: hair, marginBottom: V ? 12 : 14 }} />
      <div style={caps(sub, TYPE.labelSm)}>{label}</div>
      <div
        style={{
          fontFamily: DISPLAY, fontWeight: 700, fontSize: V ? 40 : 46,
          letterSpacing: TRACK.headline, color: fg, lineHeight: 1.08, marginTop: 6,
        }}
      >
        {value}
      </div>
      {note ? (
        <div
          style={{
            fontFamily: SANS, fontWeight: 500, fontSize: V ? 24 : 28, letterSpacing: TRACK.body,
            color: sub, lineHeight: 1.25, marginTop: 8,
            opacity: noteOn, transform: `translateY(${interpolate(noteOn, [0, 1], [8, 0], CLAMP)}px)`,
          }}
        >
          {note}
        </div>
      ) : null}
    </div>
  );
};

export const AntibodySpine: React.FC<Win & {
  kicker?: string;
  /** the development-stage rail */
  stage: { label: string; word: string; phases?: string[]; activeIndex?: number };
  /** the two-arm fact — the arms draw one after the other on this cue */
  format: { label: string; note: string; word: string };
  /** the linker + payload that make it a conjugate */
  payload: { label: string; note: string; word: string };
  target: { label: string; word: string };
  /** beat 2 — the arms lock onto two visibly DIFFERENT targets */
  bind: { word: string; ms?: number };
  /** beat 3 — the payload detaches and travels into the tumour mark */
  deliver: { word: string; ms?: number };
  bg?: "ink" | "paper";
}> = ({ from, to, kicker, stage, format, payload, target, bind, deliver, bg = "ink" }) => {
  const ms = useMs();
  const vis = useVis(from, to);
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const sub = bg === "ink" ? INK_SUB : COLORS.grayText;
  const hair = bg === "ink" ? "rgba(255,255,255,0.20)" : COLORS.border;

  const k = usePop(from + 200, { rise: 12 });

  // Cue-driven but CLAMPED MONOTONIC by construction, so no derived interpolate
  // range can run backwards however a cue resolves.
  const stageOn = cue(stage.word, from + 700, from);
  const fmtOn = Math.max(cue(format.word, stageOn + 1100, from), stageOn + 400);
  const payOn = Math.max(cue(payload.word, fmtOn + 900, from), fmtOn + 500);
  const tgtOn = Math.max(cue(target.word, payOn + 2000, from), payOn + 600);
  const bindOn = Math.max(bind.ms ?? cue(bind.word, tgtOn + 2800, from), tgtOn + 600);
  const delivOn = Math.max(deliver.ms ?? cue(deliver.word, bindOn + 6000, from), bindOn + 600);

  const draw = (onset: number, dur: number) =>
    clamp01(interpolate(ms, [onset, onset + dur], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) }));

  // ── the molecule assembles ──
  const stem = draw(fmtOn - 180, 380);
  const armA = draw(fmtOn, 420);
  const armB = draw(fmtOn + 260, 420); // the second arm — the "bi" in bispecific
  const link = draw(payOn, 420);
  const payIn = draw(payOn + 260, 380);

  // ── beat 2: two DIFFERENT receptors arrive and the arms seat into them ──
  const recA = draw(bindOn, 460);
  const recB = draw(bindOn + 220, 460);
  const lock = clamp01(interpolate(ms, [bindOn + 620, bindOn + 900, bindOn + 1250], [0, 1, 0], CLAMP));

  // ── beat 3: the payload detaches and travels into the tumour ──
  const tumorIn = draw(delivOn, 520);
  const travel = draw(delivOn + 620, 900);
  const landed = clamp01(interpolate(ms, [delivOn + 1450, delivOn + 1700, delivOn + 2100], [0, 1, 0], CLAMP));

  // focus: the row being explained holds full strength, the others step back
  const focusFmt = clamp01(interpolate(ms, [bindOn - 200, bindOn + 300], [0, 1], CLAMP));
  const focusPay = clamp01(interpolate(ms, [delivOn - 200, delivOn + 300], [0, 1], CLAMP));
  const rest = 1 - 0.58 * Math.max(focusFmt, focusPay);
  const dimFmt = focusFmt > 0 && focusPay === 0 ? 1 : focusPay > 0 ? rest : 1;
  const dimPay = focusPay > 0 ? 1 : focusFmt > 0 ? rest : 1;
  const dimOther = focusFmt > 0 || focusPay > 0 ? rest : 1;

  // the payload breathes once delivered so a held frame never goes dead
  const breathe = 1 + 0.06 * Math.sin(Math.max(0, ms - payOn) / 320);

  const phases = stage.phases ?? ["Phase 1", "Phase 2", "Phase 3"];
  const activeIndex = stage.activeIndex ?? 2;
  const railW = V ? 460 : 470;
  const railP = draw(stageOn, 900);
  const step = railW / Math.max(1, phases.length - 1);
  const fill = railP * step * activeIndex;
  const nodeBreathe = 1 + 0.09 * Math.sin(Math.max(0, ms - stageOn) / 340);

  const S = { stroke: fg, strokeWidth: 7, strokeLinecap: "round" as const, fill: "none", pathLength: 1 };
  const dash = (p: number) => ({ strokeDasharray: 1, strokeDashoffset: 1 - p });
  // the payload's y as it travels from the linker tip into the tumour
  const payY = 424 + travel * 82;

  return (
    <AbsoluteFill style={{ opacity: vis, justifyContent: "center", alignItems: "center", padding: V ? "0 70px" : "0 160px" }}>
      <div style={{ display: "flex", flexDirection: V ? "column" : "row", alignItems: "center", gap: V ? 30 : 70 }}>
        {/* ── left: the object itself ── */}
        <div style={{ width: V ? 420 : 700, display: "flex", flexDirection: "column", alignItems: "center" }}>
          {/* development-stage rail */}
          <div style={{ width: railW, height: 74, position: "relative", opacity: dimOther }}>
            <div style={{ position: "absolute", top: 24, left: 0, width: railW, height: 3, background: hair }} />
            <div style={{ position: "absolute", top: 24, left: 0, width: fill, height: 3, background: fg }} />
            {phases.map((label, i) => {
              const on = railP > 0 && fill >= step * i - 2;
              const active = i === activeIndex && railP > 0.98;
              return (
                <div key={i} style={{ position: "absolute", left: step * i, top: 0, transform: "translateX(-50%)", textAlign: "center" }}>
                  <div
                    style={{
                      width: 18, height: 18, borderRadius: 18, marginTop: 16, marginLeft: "auto", marginRight: "auto",
                      background: on ? fg : "transparent",
                      border: `3px solid ${on ? fg : hair}`,
                      transform: active ? `scale(${nodeBreathe})` : "scale(1)",
                    }}
                  />
                  <div style={{ ...caps(on ? sub : hair, 17), marginTop: 10, whiteSpace: "nowrap" }}>{label}</div>
                </div>
              );
            })}
          </div>

          <svg width={V ? 360 : 400} height={V ? 470 : 500} viewBox="0 0 440 580" style={{ marginTop: 10, overflow: "visible" }}>
            {/* the two receptors — deliberately DIFFERENT shapes, because they are
                two SEPARATE targets. One solid, one open. */}
            <rect
              x={112 - 38} y={-14 + recA * 22} width={76} height={14} rx={7}
              fill={fg} opacity={recA * 0.9}
            />
            <rect
              x={328 - 38} y={-14 + recB * 22} width={76} height={14} rx={7}
              fill="none" stroke={fg} strokeWidth={4} opacity={recB * 0.9}
            />

            {/* the antibody: stem, then TWO arms (that is what bispecific means) */}
            <line x1="220" y1="300" x2="220" y2="150" {...S} {...dash(stem)} />
            <line x1="220" y1="150" x2="112" y2="42" {...S} {...dash(armA)} />
            <line x1="220" y1="150" x2="328" y2="42" {...S} {...dash(armB)} />
            <circle cx="112" cy="42" r={17 + lock * 4} fill={fg} opacity={clamp01((armA - 0.7) / 0.3)} />
            <circle cx="328" cy="42" r={17 + lock * 4} fill={fg} opacity={clamp01((armB - 0.7) / 0.3)} />

            {/* the linker that makes it a conjugate */}
            <line
              x1="220" y1="300" x2="220" y2="386"
              stroke={fg} strokeWidth="5" strokeLinecap="round"
              strokeDasharray="14 12" strokeDashoffset={(1 - link) * 120} opacity={link}
            />

            {/* the tumour mark it delivers into */}
            <circle
              cx="220" cy="506" r={38 + landed * 5}
              fill="none" stroke={fg} strokeWidth={4}
              strokeDasharray="10 9" opacity={tumorIn * 0.75}
            />

            {/* the payload — lands on the linker, later travels into the tumour */}
            <circle
              cx="220" cy={payY} r={26}
              fill={fg}
              opacity={payIn}
              style={{ transformOrigin: `220px ${payY}px`, transform: `scale(${(travel > 0 ? 1 : breathe) * (1 + landed * 0.12)})` }}
            />
          </svg>
        </div>

        {/* ── right: the spec sheet that accumulates, then re-focuses ── */}
        <div style={{ width: V ? 420 : 760, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          {kicker ? <div style={{ ...k, marginBottom: V ? 18 : 22 }}><div style={caps(sub)}>{kicker}</div></div> : null}
          <SpecRow label="Development" value={stage.label} onsetMs={stageOn} dim={dimOther} fg={fg} sub={sub} hair={hair} />
          <SpecRow label="Format" value={format.label} note={format.note} onsetMs={fmtOn} noteMs={bindOn} dim={dimFmt} fg={fg} sub={sub} hair={hair} />
          <SpecRow label="Modality" value={payload.label} note={payload.note} onsetMs={payOn} noteMs={delivOn} dim={dimPay} fg={fg} sub={sub} hair={hair} />
          <SpecRow label="Indication" value={target.label} onsetMs={tgtOn} dim={dimOther} fg={fg} sub={sub} hair={hair} />
        </div>
      </div>
    </AbsoluteFill>
  );
};
