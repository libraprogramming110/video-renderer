// ─────────────────────────────────────────────────────────────────────────
// KIT · asset — SHOW-DON'T-TELL for "what the drug IS".
// Added on the BioIntel Pathos AI reel, 2026-08-05.
//
// A spec LIST (TermsLedger) typesets the sentence — four rows that fade in and
// sit there. This block ASSEMBLES the asset in spoken order instead:
//   1. a phase rail fills to the active phase      ("late-stage")
//   2. an antibody Y draws — TWO arms, one after the other, because "bispecific"
//      IS the two-arm fact, so the motion carries the meaning ("bispecific")
//   3. a dashed linker draws down and a payload lands + breathes ("conjugate")
//   4. the indication stamps under a drawn rule    ("breast cancer")
//
// Portrait-first, bg-aware, monochrome (weight + dim only — no chart bars, no
// glyph marks; emphasis from weight + size per the brand rule). Reach for it
// whenever a beat enumerates what a therapeutic is: the parts arriving in the
// order they are voiced read as a mechanism, not a table.
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import {
  CLAMP, clamp01, caps, COLORS, cue, DISPLAY, INK_SUB, SANS, TRACK, useMs, usePop, useStamp,
} from "./core";
import { FORMAT, TYPE } from "../style";

const V = FORMAT.key === "vertical";

type Win = { from: number; to: number };

const useVis = (from: number, to: number, padIn = 360, padOut = 360) => {
  const ms = useMs();
  return clamp01(interpolate(ms, [from, from + padIn, to - padOut, to], [0, 1, 1, 0], CLAMP));
};

const PhaseRail: React.FC<{
  phases: string[]; activeIndex: number; onsetMs: number; fg: string; dim: string; hair: string;
}> = ({ phases, activeIndex, onsetMs, fg, dim, hair }) => {
  const ms = useMs();
  const W = V ? 600 : 720;
  const p = clamp01(interpolate(ms, [onsetMs, onsetMs + 900], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) }));
  const step = W / Math.max(1, phases.length - 1);
  const fill = p * step * activeIndex;
  // the active node keeps breathing, so a held frame never goes dead
  const breathe = 1 + 0.09 * Math.sin(Math.max(0, ms - onsetMs) / 340);
  return (
    <div style={{ width: W, height: 78, position: "relative" }}>
      <div style={{ position: "absolute", top: 26, left: 0, width: W, height: 3, background: hair }} />
      <div style={{ position: "absolute", top: 26, left: 0, width: fill, height: 3, background: fg }} />
      {phases.map((label, i) => {
        const on = p > 0 && fill >= step * i - 2;
        const active = i === activeIndex && p > 0.98;
        return (
          <div key={i} style={{ position: "absolute", left: step * i, top: 0, transform: "translateX(-50%)", textAlign: "center" }}>
            <div
              style={{
                width: 20, height: 20, borderRadius: 20, marginTop: 17, marginLeft: "auto", marginRight: "auto",
                background: on ? fg : "transparent",
                border: `3px solid ${on ? fg : hair}`,
                transform: active ? `scale(${breathe})` : "scale(1)",
              }}
            />
            <div style={{ ...caps(on ? dim : hair, 19), marginTop: 12, whiteSpace: "nowrap" }}>{label}</div>
          </div>
        );
      })}
    </div>
  );
};

export const AssetAssembly: React.FC<Win & {
  kicker: string;
  stage: { label: string; word: string; phases?: string[]; activeIndex?: number };
  /** the two-arm fact — the arms draw one after the other on this cue */
  format: { label: string; note?: string; word: string };
  /** the linker + payload that make it a conjugate */
  payload: { label: string; word: string };
  target: { label: string; note?: string; word: string };
  bg?: "ink" | "paper";
}> = ({ from, to, kicker, stage, format, payload, target, bg = "ink" }) => {
  const ms = useMs();
  const vis = useVis(from, to);
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const dim = bg === "ink" ? INK_SUB : COLORS.grayText;
  const hair = bg === "ink" ? "rgba(255,255,255,0.20)" : COLORS.border;

  const k = usePop(from + 200, { rise: 12 });

  // Cue-driven, but CLAMPED MONOTONIC by construction so no derived interpolate()
  // range can ever run backwards if a cue resolves oddly (AstraZeneca × CSPC crash).
  const stageOn = cue(stage.word, from + 700, from);
  const fmtOn = Math.max(cue(format.word, stageOn + 1200, from), stageOn + 400);
  const payOn = Math.max(cue(payload.word, fmtOn + 1600, from), fmtOn + 500);
  const tgtOn = Math.max(cue(target.word, payOn + 2200, from), payOn + 600);

  const draw = (onset: number, dur: number) =>
    clamp01(interpolate(ms, [onset, onset + dur], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) }));

  const stem = draw(fmtOn - 180, 380);
  const armA = draw(fmtOn, 420);
  const armB = draw(fmtOn + 260, 420); // the second arm — the "bi" in bispecific
  const link = draw(payOn, 420);
  const pay = usePop(payOn + 260, { rise: 0, scale: true });
  const payBreathe = 1 + 0.07 * Math.sin(Math.max(0, ms - payOn) / 300);

  const stageLab = usePop(stageOn + 700, { rise: 12 });
  const fmtLab = usePop(fmtOn + 380, { rise: 12 });
  const payLab = usePop(payOn + 380, { rise: 12 });
  const tgt = useStamp(tgtOn);
  const ruleW = clamp01(interpolate(ms, [tgtOn - 260, tgtOn + 420], [0, 1], CLAMP)) * (V ? 420 : 520);

  const S = { stroke: fg, strokeWidth: 7, strokeLinecap: "round" as const, fill: "none", pathLength: 1 };
  const dash = (p: number) => ({ strokeDasharray: 1, strokeDashoffset: 1 - p });

  return (
    <AbsoluteFill style={{ opacity: vis, justifyContent: "center", alignItems: "center", textAlign: "center", padding: V ? "0 80px" : "0 160px" }}>
      <div style={{ ...k, marginBottom: V ? 30 : 20 }}>
        <div style={caps(dim)}>{kicker}</div>
      </div>

      {/* 1 · development stage */}
      <PhaseRail
        phases={stage.phases ?? ["Phase 1", "Phase 2", "Phase 3"]}
        activeIndex={stage.activeIndex ?? 2}
        onsetMs={stageOn}
        fg={fg}
        dim={dim}
        hair={hair}
      />
      <div style={{ ...stageLab, marginTop: 8 }}>
        <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: V ? 46 : 52, letterSpacing: TRACK.headline, color: fg }}>
          {stage.label}
        </span>
      </div>

      {/* 2 + 3 · the molecule assembles: two arms, then linker + payload */}
      <svg width={V ? 400 : 350} height={V ? 436 : 382} viewBox="0 0 440 480" style={{ marginTop: V ? 22 : 12, overflow: "visible" }}>
        <line x1="220" y1="300" x2="220" y2="150" {...S} {...dash(stem)} />
        <line x1="220" y1="150" x2="112" y2="42" {...S} {...dash(armA)} />
        <line x1="220" y1="150" x2="328" y2="42" {...S} {...dash(armB)} />
        <circle cx="112" cy="42" r="17" fill={fg} opacity={clamp01((armA - 0.7) / 0.3)} />
        <circle cx="328" cy="42" r="17" fill={fg} opacity={clamp01((armB - 0.7) / 0.3)} />
        <line
          x1="220" y1="300" x2="220" y2="386"
          stroke={fg} strokeWidth="5" strokeLinecap="round"
          strokeDasharray="14 12" strokeDashoffset={(1 - link) * 120} opacity={link}
        />
        <g style={{ ...pay, transformOrigin: "220px 424px", transform: `${pay.transform} scale(${payBreathe})` }}>
          <circle cx="220" cy="424" r="26" fill={fg} />
        </g>
      </svg>

      <div style={{ ...fmtLab, marginTop: V ? 4 : 0 }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: V ? 62 : 64, letterSpacing: TRACK.headline, color: fg, lineHeight: 1 }}>
          {format.label}
        </div>
        {format.note ? <div style={{ ...caps(dim, TYPE.labelSm), marginTop: 8 }}>{format.note}</div> : null}
      </div>

      <div style={{ ...payLab, marginTop: 16 }}>
        <div style={{ fontFamily: SANS, fontWeight: 600, fontSize: V ? 36 : 40, letterSpacing: TRACK.body, color: dim }}>
          {payload.label}
        </div>
      </div>

      {/* 4 · the indication stamps */}
      <div style={{ height: 4, width: ruleW, background: hair, marginTop: 26, borderRadius: 2 }} />
      <div style={{ ...tgt, marginTop: 20 }}>
        {target.note ? <div style={{ ...caps(dim, TYPE.labelSm), marginBottom: 10 }}>{target.note}</div> : null}
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: V ? 76 : 84, letterSpacing: TRACK.display, color: fg, lineHeight: 1 }}>
          {target.label}
        </div>
      </div>
    </AbsoluteFill>
  );
};
