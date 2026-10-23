// ─────────────────────────────────────────────────────────────────────────
// KIT · inorder — WHAT TO WATCH, IN THE ORDER THE SCRIPT GIVES IT. Added on the
// Roche x Rona HORIZONTAL long-form, 2026-10-15 (16:9; absolute 1920x1080).
//
// `InOrder` (black): a numbered rail, three stations, each landing on its spoken
//   "first / then / and". Station one brings THE SPINE back: the candidate card from
//   the hook with its Name and Stage still DASHED EMPTY (disclosure is the thing to
//   watch). Station two: a year in a dashed box (expected, not yet). Station three:
//   two chips and a question mark, the scene's one red. Over the frame budget by
//   design (three equal events the script orders), as FourSignals on Viatris.
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { CLAMP, clamp01, COLORS, INK_SUB, useMs } from "./core";
import { at, lerp, useK, type Cued, type Win } from "./elora";
import { big, CandidateCard, label, stamp } from "./rona";

const EASE = Easing.out(Easing.cubic);
const EASE_IO = Easing.inOut(Easing.cubic);
const BACK = Easing.out(Easing.back(1.7));

export const INORDER = {
  lead: { left: 160, top: 110, size: 88 },
  rail: { y: 250, x0: 160, x1: 1760 },
  xs: [400, 960, 1520],
  title: { top: 310, size: 52, w: 500 },
  body: { top: 440 },
};

export const InOrder: React.FC<Win & {
  lead: { text: string } & Cued;
  one: { node: Cued; title: { text: string } & Cued; card: { title: string } & Cued; name: { label: string } & Cued; stage: { label: string } & Cued };
  two: { node: Cued; title: { text: string } & Cued; expected: { label: string } & Cued; year: { text: string } & Cued };
  three: { node: Cued; title: { text: string } & Cued; a: { text: string } & Cued; b: { text: string } & Cued; q: Cued };
}> = ({ from, to, lead, one, two, three }) => {
  const ms = useMs();
  const k = useK();
  const WH = COLORS.paper;
  const RED = COLORS.accent;
  const I = INORDER;
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));

  const tLead = at(lead, from, from);
  const t1 = at(one.node, tLead + 1500, from, tLead + 400);
  const t1T = at(one.title, t1 + 600, from, t1 + 200);
  const t1C = at(one.card, t1T + 900, from, t1T + 300);
  const t1N = at(one.name, t1C + 500, from, t1C + 250);
  const t1S = at(one.stage, t1N + 900, from, t1N + 300);
  const t2 = at(two.node, t1S + 1500, from, t1S + 400);
  const t2T = at(two.title, t2 + 400, from, t2 + 200);
  const t2E = at(two.expected, t2T + 2500, from, t2T + 400);
  const t2Y = at(two.year, t2E + 2000, from, t2E + 400);
  const t3 = at(three.node, t2Y + 1000, from, t2Y + 400);
  const t3T = at(three.title, t3 + 900, from, t3 + 300);
  const t3A = at(three.a, t3T + 700, from, t3T + 300);
  const t3B = at(three.b, t3A + 1200, from, t3A + 300);
  const t3Q = at(three.q, t3B + 800, from, t3B + 300);

  const nodes = [t1, t2, t3];
  const titles = [{ t: t1T, text: one.title.text }, { t: t2T, text: two.title.text }, { t: t3T, text: three.title.text }];
  const R = I.rail;
  // the rail draws in three legs, each up to the station being named
  const reach = Math.max(
    lerp(R.x0, I.xs[0], EASE_IO(k(t1 - 300, 400))),
    lerp(I.xs[0], I.xs[1], EASE_IO(k(t2 - 300, 400))) * (ms >= t2 - 300 ? 1 : 0),
    lerp(I.xs[1], R.x1, EASE_IO(k(t3 - 300, 500))) * (ms >= t3 - 300 ? 1 : 0),
  );

  if (ms < tLead - 80) return null;
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <div style={{ position: "absolute", left: I.lead.left, top: I.lead.top, opacity: k(tLead, 220) * (1 - k(t1 - 300, 280)), ...big(WH, I.lead.size) }}>{lead.text}</div>

      <svg style={{ position: "absolute", left: 0, top: 0 }} width={1920} height={1080}>
        {ms >= t1 - 300 ? <line x1={R.x0} y1={R.y} x2={reach} y2={R.y} stroke="rgba(255,255,255,0.45)" strokeWidth={4} strokeLinecap="round" /> : null}
        {nodes.map((t, i) => {
          const q = k(t, 320);
          return q > 0 ? <circle key={i} cx={I.xs[i]} cy={R.y} r={34 * BACK(q)} fill={WH} /> : null;
        })}
      </svg>
      {nodes.map((t, i) => (
        <div key={i} style={{ position: "absolute", left: I.xs[i] - 34, width: 68, top: R.y - 34, height: 68, display: "flex", alignItems: "center", justifyContent: "center", opacity: k(t + 120, 200), ...big(COLORS.ink, 40) }}>{i + 1}</div>
      ))}
      {titles.map((x, i) => (
        <div key={i} style={{ position: "absolute", left: I.xs[i] - I.title.w / 2, width: I.title.w, top: I.title.top, textAlign: "center", opacity: k(x.t, 220), transform: `translateY(${(1 - EASE(k(x.t, 300))) * 16}px)`,
          ...big(WH, I.title.size), whiteSpace: "normal", lineHeight: 1.08 }}>{x.text}</div>
      ))}

      {/* ── 1 · disclosure: the hook's card, its slots still empty ── */}
      <CandidateCard x={I.xs[0] - 230} y={I.body.top} w={460} tone="light" title={one.card.title} titleSize={40} q={k(t1C, 420)}
        rows={[{ label: one.name.label, q: k(t1N, 360) }, { label: one.stage.label, q: k(t1S, 360) }]} />

      {/* ── 2 · the next readout: a year, expected ── */}
      <div style={{ position: "absolute", left: I.xs[1] - 250, width: 500, top: I.body.top + 10, textAlign: "center", opacity: k(t2E, 240), ...label(INK_SUB, 32) }}>{two.expected.label}</div>
      {ms >= t2Y - 60 ? (
        <div style={{ position: "absolute", left: I.xs[1] - 250, width: 500, top: I.body.top + 70, display: "flex", justifyContent: "center" }}>
          <div style={{ padding: "18px 40px", borderRadius: 20, border: "4px dashed rgba(255,255,255,0.7)", ...big(WH, 110), ...stamp(k(t2Y, 300), 1.3) }}>{two.year.text}</div>
        </div>
      ) : null}

      {/* ── 3 · a pairing, asked ── */}
      <div style={{ position: "absolute", left: I.xs[2] - 250, width: 500, top: I.body.top, display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
        {[{ t: t3A, text: three.a.text }, { t: t3B, text: three.b.text }].map((c, i) => {
          const q = k(c.t, 280);
          return (
            <React.Fragment key={i}>
              {i === 1 ? <div style={{ opacity: k(c.t - 150, 200), ...big(INK_SUB, 56) }}>+</div> : null}
              <div style={{ padding: "14px 28px", borderRadius: 40, background: "rgba(255,255,255,0.14)", opacity: clamp01(q * 3), transform: `translateY(${(1 - EASE(q)) * 16}px)`, ...label(WH, 34) }}>{c.text}</div>
            </React.Fragment>
          );
        })}
        {ms >= t3Q - 60 ? <div style={{ marginTop: 6, ...big(RED, 110), ...stamp(k(t3Q, 300), 1.5) }}>?</div> : null}
      </div>
    </AbsoluteFill>
  );
};
