// ─────────────────────────────────────────────────────────────────────────
// KIT · hunt — PAID TO FIND A TARGET NOBODY HAS FOUND. Added on the AstraZeneca x
// insitro HORIZONTAL long-form, 2026-10-22 (16:9; absolute 1920x1080 coordinates,
// not portrait-safe as written).
//
// Motion law (Nel, 2026-10-22): "go crazy with the animation… the constraint is how
// busy it is in a specific scene." ONE mover at a time, landed things go still, and
// each single move is spectacular: a smash zoom out of a blur, slot-machine digits,
// a camera DIVE into a decimal point that becomes the bullseye, letters flipping in
// and falling away under gravity, a cell-division split. Nothing loops.
//
// Grammar: SOLID = paid / disclosed, hollow / dashed = conditional, not found, not
// yet. A drug TARGET is a bullseye, dashed until named. Dashes live on SHAPES only,
// never on letterforms (a dashed glyph outline read as broken type).
//
// Helpers: `Letters` (cascade: rise / flip / drop, and an optional gravity fall-away),
// `BarReveal`, `Bullseye` (spins in; `outer` = its outer ring already drawn; `dashQ`
// breaks solid rings into dashes), `SlotFigure` (outline digits on fixed slots that
// spin like reels and lock left to right; its "." is a drawn ring at a known point).
// Blocks: `HuntHook` (red), `Announce` (black over a scrim), `TwoDiseases` (black).
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { CLAMP, clamp01, COLORS, DISPLAY, INK_SUB, INK_SUB_ON_RED, TRACK, useMs } from "./core";
import { at, lerp, useK, type Cued, type Win } from "./elora";
import { big, label } from "./rona";
import { DayLeaf } from "./unity";

const EASE = Easing.out(Easing.cubic);
const EASE_IN = Easing.in(Easing.cubic);
const EASE_IO = Easing.inOut(Easing.cubic);
const BACK = Easing.out(Easing.back(1.6));
const SNAP = Easing.out(Easing.back(2.2));
const BOUNCE = Easing.out(Easing.bounce);

// ══════════════════════════════════════════════════════════════════════════
// Motion helpers
// ══════════════════════════════════════════════════════════════════════════
/** A letter cascade. `mode`: rise (up into place), flip (3D, hinged at the baseline),
 *  drop (falls in from above and bounces). `outMs`: the letters fall away under gravity. */
export const Letters: React.FC<{
  text: string; t: number; stagger?: number; dur?: number; rise?: number; mode?: "rise" | "flip" | "drop"; outMs?: number; style?: React.CSSProperties;
}> = ({ text, t, stagger = 32, dur = 420, rise = 70, mode = "rise", outMs, style }) => {
  const ms = useMs();
  return (
    <span style={{ display: "inline-block", whiteSpace: "pre", perspective: 800, ...style }}>
      {[...text].map((ch, i) => {
        const q = clamp01((ms - (t + i * stagger)) / (mode === "drop" ? dur * 1.5 : dur));
        let tf = "";
        if (mode === "flip") tf = `rotateX(${lerp(-100, 0, BACK(q))}deg)`;
        else if (mode === "drop") tf = `translateY(${lerp(-rise * 2.4, 0, BOUNCE(q))}px)`;
        else tf = `translateY(${(1 - BACK(q)) * rise}px)`;
        let o = clamp01(q * 3);
        if (outMs != null && ms > outMs) {
          const f = clamp01((ms - (outMs + i * 22)) / 620);
          tf += ` translateY(${f * f * 900}px) rotate(${f * (i % 2 ? 38 : -30)}deg)`;
          o *= 1 - clamp01((f - 0.6) / 0.4);
        }
        return (
          <span key={i} style={{ display: "inline-block", opacity: o, transform: tf, transformOrigin: "50% 85%" }}>
            {ch === " " ? " " : ch}
          </span>
        );
      })}
    </span>
  );
};

/** A bar sweeps across the line and retracts, uncovering it (sized by the string, not an estimate). */
export const BarReveal: React.FC<{ t: number; color: string; dur?: number; children: React.ReactNode }> = ({ t, color, dur = 560, children }) => {
  const ms = useMs();
  const q = clamp01((ms - t) / dur);
  if (q <= 0) return null;
  const grow = EASE_IO(clamp01(q / 0.5));
  const shrink = EASE_IO(clamp01((q - 0.5) / 0.5));
  return (
    <span style={{ position: "relative", display: "inline-block" }}>
      <span style={{ opacity: q >= 0.5 ? 1 : 0 }}>{children}</span>
      {q < 1 ? <span style={{ position: "absolute", top: "6%", bottom: "2%", left: `${shrink * 100}%`, width: `${(grow - shrink) * 100}%`, background: color }} /> : null}
    </span>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// Glyphs
// ══════════════════════════════════════════════════════════════════════════
/** Three rings + four ticks. Spins in as it draws, then sits still. `outer`: ring 0 is
 *  already drawn (handed over by the decimal-point dive). `dashQ`: 0 solid → 1 dashed. */
export const Bullseye: React.FC<{
  cx: number; cy: number; R: number; color: string; k: number; dashed?: boolean; dashQ?: number; outer?: boolean; sw?: number; opacity?: number; spin?: number;
}> = ({ cx, cy, R, color, k, dashed = true, dashQ, outer, sw = 7, opacity = 1, spin = -140 }) => {
  if (k <= 0 && !outer) return null;
  const rings = [1, 0.66, 0.33];
  const ringQ = (i: number) => (outer && i === 0 ? 1 : clamp01((k - i * 0.16) / 0.5));
  const tickQ = clamp01((k - 0.6) / 0.4);
  const dq = dashQ ?? (dashed ? 1 : 0);
  const on = lerp(1400, sw * 2.6, dq);
  const off = lerp(0, sw * 1.9, dq);
  const dash = dq > 0 ? `${on} ${off}` : undefined;
  const t0 = R * 1.1;
  const t1 = R * 1.3;
  const rot = lerp(spin, 0, EASE_IO(k));
  return (
    <svg style={{ position: "absolute", left: cx - R * 1.4, top: cy - R * 1.4, overflow: "visible", opacity }} width={R * 2.8} height={R * 2.8}>
      <g transform={`translate(${R * 1.4} ${R * 1.4}) rotate(${rot})`}>
        {rings.map((f, i) => {
          const q = ringQ(i);
          if (q <= 0) return null;
          const r = outer && i === 0 ? R : R * f * BACK(q);
          return <circle key={i} r={Math.max(0, r)} fill="none" stroke={color} strokeWidth={sw} strokeDasharray={dash} opacity={clamp01(q * 3)} />;
        })}
        {tickQ > 0
          ? [0, 90, 180, 270].map((deg) => (
              <line key={deg} transform={`rotate(${deg})`} x1={t0} y1={0} x2={lerp(t0, t1, EASE(tickQ))} y2={0} stroke={color} strokeWidth={sw} strokeLinecap="round" />
            ))
          : null}
      </g>
    </svg>
  );
};

// a liver silhouette in a 330 x 190 box (same outline as kit/target's PastLiver)
const LIVER_D = "M 6 70 C 30 6 150 -4 250 8 C 310 16 336 44 322 80 C 306 120 240 150 170 172 C 110 190 60 184 30 150 C 6 124 -6 100 6 70 Z";
// a heart in a 24 x 24 box (kit/icons IconHeart's path)
const HEART_D = "M12 20C12 20 4 14.5 4 9a4 4 0 0 1 8-1 4 4 0 0 1 8 1c0 5.5-8 11-8 11z";

/** An organ that DRAWS itself: the outline traces (first 65%), then it fills. */
const Organ: React.FC<{ kind: "liver" | "heart"; cx: number; cy: number; w: number; color: string; q: number }> = ({ kind, cx, cy, w, color, q }) => {
  if (q <= 0) return null;
  const draw = EASE_IO(clamp01(q / 0.65));
  const fill = EASE(clamp01((q - 0.6) / 0.4));
  const liver = kind === "liver";
  const h = liver ? (w * 190) / 330 : w;
  const vb = liver ? "-10 -10 350 210" : "2 2 20 20";
  const sw = liver ? 9 : 0.6;
  return (
    <svg style={{ position: "absolute", left: cx - w / 2, top: cy - h / 2, overflow: "visible" }} width={w} height={h} viewBox={vb}>
      <path d={liver ? LIVER_D : HEART_D} pathLength={1} fill={color} fillOpacity={fill} stroke={color} strokeWidth={sw} strokeLinejoin="round"
        strokeDasharray="1 1" strokeDashoffset={1 - draw} />
    </svg>
  );
};

/** A figure drawn as a hollow OUTLINE (solid stroke), centred on x = cx by the string. */
export const HollowFigure: React.FC<{ text: string; cx: number; top: number; size: number; color: string; opacity?: number; sw?: number; draw?: number }> = ({
  text, cx, top, size, color, opacity = 1, sw = 5, draw = 1,
}) => {
  const L = size * 5; // longer than any glyph's perimeter; the dash pattern restarts per glyph
  return (
    <svg style={{ position: "absolute", left: 0, top, overflow: "visible", opacity }} width={1920} height={size * 1.1}>
      <text x={cx} y={size * 0.86} textAnchor="middle" fontFamily={DISPLAY} fontWeight={700} fontSize={size} letterSpacing={TRACK.display}
        fill="none" stroke={color} strokeWidth={sw} strokeLinejoin="round" strokeDasharray={draw < 1 ? `${L} ${L}` : undefined} strokeDashoffset={draw < 1 ? L * (1 - draw) : undefined}
        style={{ fontVariantNumeric: "tabular-nums" }}>
        {text}
      </text>
    </svg>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// SlotFigure — outline digits on FIXED slots (so every glyph's position is known by
// construction); digits spin like reels and lock left to right; "." is a drawn ring.
// ══════════════════════════════════════════════════════════════════════════
const ADV = (ch: string) => (ch === "." ? 0.34 : ch === "~" ? 0.6 : ch === "B" || ch === "M" ? 0.7 : 0.64);
export const slotLayout = (text: string, size: number, cx: number) => {
  const ws = [...text].map((c) => ADV(c) * size);
  const total = ws.reduce((a, b) => a + b, 0);
  let x = cx - total / 2;
  return [...text].map((ch, i) => { const c = x + ws[i] / 2; x += ws[i]; return { ch, cx: c }; });
};
export const slotDot = (text: string, size: number, cx: number, top: number, sw: number) => {
  const s = slotLayout(text, size, cx).find((s) => s.ch === ".");
  const r = size * 0.075;
  return s ? { x: s.cx, y: top + size * 0.86 - r - sw / 2, r } : null;
};

export const SlotFigure: React.FC<{
  text: string; cx: number; top: number; size: number; color: string; sw?: number; t0: number; t1: number; hideDot?: boolean;
}> = ({ text, cx, top, size, color, sw = 5, t0, t1, hideDot }) => {
  const ms = useMs();
  if (ms < t0 - 40) return null;
  const slots = slotLayout(text, size, cx);
  const digits = slots.map((s, i) => (/[0-9]/.test(s.ch) ? i : -1)).filter((i) => i >= 0);
  const base = size * 0.86;
  const dot = slotDot(text, size, cx, top, sw);
  return (
    <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} width={1920} height={1080}>
      {slots.map((s, i) => {
        const appear = clamp01((ms - (t0 + i * 40)) / 220);
        if (appear <= 0) return null;
        if (s.ch === ".") {
          return hideDot || !dot ? null : <circle key={i} cx={dot.x} cy={dot.y} r={dot.r * BACK(appear)} fill="none" stroke={color} strokeWidth={sw} />;
        }
        let ch = s.ch;
        let dy = 0;
        const d = digits.indexOf(i);
        if (d >= 0) {
          const lock = lerp(t0 + 250, t1, (d + 1) / digits.length);
          if (ms < lock) {
            ch = String((Math.floor((ms - t0) / 55) + d * 3) % 10);
            dy = -size * 0.08 * (((ms - t0) / 55) % 1); // the reel's roll
          } else {
            dy = -size * 0.25 * (1 - BACK(clamp01((ms - lock) / 260))); // the digit locks with a kick
          }
        }
        return (
          <text key={i} x={s.cx} y={top + base + dy} textAnchor="middle" fontFamily={DISPLAY} fontWeight={700} fontSize={size}
            fill="none" stroke={color} strokeWidth={sw} strokeLinejoin="round" opacity={clamp01(appear * 3)}>
            {ch}
          </text>
        );
      })}
    </svg>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// HuntHook — the hook (red world)
// ══════════════════════════════════════════════════════════════════════════
export const HUNT = {
  paid: { top: 270, size: 320, label: 640, labelSize: 56 }, // the group before it docks
  dock: { s: 0.46, ty: -14 }, // origin top-centre: the figure lands at ~110..257, its label at ~280
  upTo: { top: 352, size: 50 },
  slot: { top: 400, size: 300, sw: 6 },
  more: { top: 760, size: 50 },
  eye: { cx: 960, cy: 450, R: 250 },
  q: { size: 230 },
  notFound: { top: 820, size: 66 },
};

export const HuntHook: React.FC<Win & {
  paid: { value: number; prefix: string; suffix: string; label: string; until: Cued } & Cued; // smash zoom + count while "$40 million" is voiced
  paidLabel: Cued; // "Upfront" bar-reveals
  dock: { label: string } & Cued; // "Up to": the paid group arcs up to the top
  more: { text: string; until: Cued } & Cued; // the slot figure: reels spin and lock while voiced
  milestones: { label: string } & Cued;
  out: Cued; // the camera DIVES into the decimal point
  eye: Cued; // the bullseye's inner rings spin in, its rings break into dashes
  found: Cued; // "?" drops in spinning
  notFound: { label: string } & Cued;
}> = ({ from, to, paid, paidLabel, dock, more, milestones, out, eye, found, notFound }) => {
  const ms = useMs();
  const k = useK();
  const WH = COLORS.paper;
  const H = HUNT;
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));

  const tPaid = at(paid, from, from);
  const tPaidEnd = at(paid.until, tPaid + 1200, from, tPaid + 400);
  const tPaidLabel = at(paidLabel, tPaidEnd, from, tPaid + 300);
  const tDock = at(dock, tPaidLabel + 1200, from, tPaidLabel + 300);
  const tMore = at(more, tDock + 400, from, tDock + 300);
  const tMoreEnd = at(more.until, tMore + 1200, from, tMore + 500);
  const tMil = at(milestones, tMoreEnd + 800, from, tMoreEnd + 200);
  const tOut = at(out, tMil + 1100, from, tMil + 400);
  const DIVE = 620;
  const tEye = Math.max(at(eye, tOut + 200, from, tOut + 150), tOut + DIVE);
  const tFound = at(found, tEye + 1300, from, tEye + 600);
  const tNF = at(notFound, tFound + 300, from, tFound + 200);

  // $40M: a smash zoom out of a blur, counting while voiced
  const smash = k(tPaid, 520);
  const pq = interpolate(ms, [tPaid, tPaidEnd], [0, 1], { ...CLAMP, easing: EASE });
  const paidText = `${paid.prefix}${Math.round(pq * paid.value)}${paid.suffix}`;
  // "Up to": the paid group arcs up into its top seat
  const dq = EASE_IO(k(tDock, 560));
  const arc = Math.sin(Math.PI * dq) * -40;

  // THE DIVE: the camera zooms into the slot figure's decimal point; its ring becomes the bullseye's outer ring
  const dot = slotDot(more.text, H.slot.size, 960, H.slot.top, H.slot.sw)!;
  const dv = EASE_IN(k(tOut, DIVE));
  const Sx = H.eye.R / dot.r;
  const s = Math.exp(Math.log(Sx) * dv);
  const fx = lerp(dot.x, H.eye.cx, dv);
  const fy = lerp(dot.y, H.eye.cy, dv);
  const tx = fx - dot.x * s;
  const ty = fy - dot.y * s;
  const diving = dv > 0 && dv < 1;
  const dotShown = ms >= tMore + 3 * 40;

  // after the dive: inner rings spin in, the ring breaks into dashes
  const eyeK = k(tEye, 1000);
  const fq = k(tFound, 700);

  if (ms < tPaid - 80) return null;
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {dv < 1 ? (
        <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, transformOrigin: "0 0", transform: `translate(${tx}px, ${ty}px) scale(${s})`, filter: diving ? `blur(${Math.sin(Math.PI * dv) * 6}px)` : undefined }}>
          {/* ── the money actually paid: smash zoom, count, then an arc up to the top ── */}
          <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, transformOrigin: "50% 0%", transform: `translateY(${lerp(0, H.dock.ty, dq) + arc}px) scale(${lerp(1, H.dock.s, dq)})` }}>
            {smash > 0 ? (
              <div style={{ position: "absolute", left: 0, width: 1920, top: H.paid.top, textAlign: "center", fontVariantNumeric: "tabular-nums", opacity: clamp01(smash * 4),
                transformOrigin: `960px ${H.paid.size / 2}px`, transform: `scale(${lerp(5.5, 1, EASE(smash))})`, filter: smash < 1 ? `blur(${(1 - EASE(smash)) * 26}px)` : undefined, ...big(WH, H.paid.size) }}>{paidText}</div>
            ) : null}
            <div style={{ position: "absolute", left: 0, width: 1920, top: H.paid.label, textAlign: "center", ...label(WH, H.paid.labelSize) }}>
              <BarReveal t={tPaidLabel} color={WH}>{paid.label}</BarReveal>
            </div>
          </div>

          {/* ── the money only promised: hollow slot reels ── */}
          <div style={{ position: "absolute", left: 0, width: 1920, top: H.upTo.top, textAlign: "center", ...label(INK_SUB_ON_RED, H.upTo.size) }}>
            {ms >= tDock + 200 ? <Letters text={dock.label} t={tDock + 200} rise={30} /> : null}
          </div>
          <SlotFigure text={more.text} cx={960} top={H.slot.top} size={H.slot.size} color={WH} sw={H.slot.sw} t0={tMore} t1={tMoreEnd} hideDot />
          <div style={{ position: "absolute", left: 0, width: 1920, top: H.more.top, textAlign: "center", ...label(INK_SUB_ON_RED, H.more.size) }}>
            <BarReveal t={tMil} color={INK_SUB_ON_RED}>{milestones.label}</BarReveal>
          </div>
        </div>
      ) : null}

      {/* ── the decimal point, drawn in SCREEN space so its stroke stays thin as the camera dives into it ── */}
      {dotShown && dv < 1 ? (
        <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} width={1920} height={1080}>
          <circle cx={dot.x * s + tx} cy={dot.y * s + ty} r={dot.r * s * (dv > 0 ? 1 : BACK(clamp01((ms - tMore - 120) / 220)))} fill="none" stroke={WH} strokeWidth={lerp(H.slot.sw, 7, dv)} />
        </svg>
      ) : null}

      {/* ── the target: the dive's ring IS the outer ring; inner rings spin in, everything breaks into dashes ── */}
      {dv >= 1 ? <Bullseye cx={H.eye.cx} cy={H.eye.cy} R={H.eye.R} color={WH} k={eyeK} outer dashQ={EASE_IO(clamp01(eyeK / 0.7))} /> : null}
      {fq > 0 ? (
        <div style={{ position: "absolute", left: 0, width: 1920, top: H.eye.cy - H.q.size * 0.55, textAlign: "center", opacity: clamp01(fq * 6), perspective: 900 }}>
          <div style={{ display: "inline-block", transform: `translateY(${lerp(-460, 0, BOUNCE(fq))}px) rotateY(${lerp(540, 0, EASE(fq))}deg)`, ...big(WH, H.q.size) }}>?</div>
        </div>
      ) : null}
      <div style={{ position: "absolute", left: 0, width: 1920, top: H.notFound.top, textAlign: "center", ...big(WH, H.notFound.size) }}>
        {ms >= tNF - 40 ? <Letters text={notFound.label} t={tNF} stagger={28} rise={50} mode="flip" /> : null}
      </div>
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// Announce — who signed, and who insitro is (black, over a scrim)
// ══════════════════════════════════════════════════════════════════════════
export const ANNOUNCE = {
  leaf: { x: 160, y: 96, w: 130, h: 144 },
  az: { left: 160, top: 300, size: 140 },
  cross: { left: 166, top: 482, size: 84 }, // the × in front of insitro on line two
  ins: { left: 290, top: 456, size: 140 },
  chip: { left: 160, top: 660, size: 44 },
  profile: { left: 160, top: 220, size: 200 }, // where insitro travels to
  rows: { left: 166, tops: [500, 590, 680] as const, size: 54 },
};

export const Announce: React.FC<Win & {
  date: { month: string; day: string } & Cued;
  az: { name: string } & Cued; // letters flip in
  cross: Cued; // the × spins as it draws
  ins: { name: string } & Cued; // letters drop in
  chip: { label: string } & Cued; // wipes open from the left
  move: Cued; // AstraZeneca's letters fall away; insitro travels up into its profile
  rows: { text: string; emphasize?: string; empWord?: string; word?: string; ms?: number }[]; // each bar-reveals
}> = ({ from, to, date, az, cross, ins, chip, move, rows }) => {
  const ms = useMs();
  const k = useK();
  const WH = COLORS.paper;
  const RED = COLORS.accent;
  const A = ANNOUNCE;
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));

  const tDate = at(date, from, from);
  const tAz = at(az, tDate + 1200, from, tDate + 300);
  const tCross = at(cross, tAz + 700, from, tAz + 250);
  const tIns = at(ins, tCross + 200, from, tCross + 150);
  const tChip = at(chip, tIns + 900, from, tIns + 300);
  const tMove = at(move, tChip + 1300, from, tChip + 400);
  const tTravel = tMove + 280; // the fall-away clears the seat first
  const tRows: number[] = [];
  rows.forEach((r, i) => tRows.push(at(r, (tRows[i - 1] ?? tTravel) + 900, from, (tRows[i - 1] ?? tTravel) + 400)));
  const tEmp = rows.map((r, i) => (r.empWord ? at({ word: r.empWord }, tRows[i] + 600, from, tRows[i]) : Infinity));

  const mv = EASE_IO(k(tTravel, 640));
  const rest = 1 - k(tMove, 260); // leaf, ×, chip fade as AstraZeneca falls
  const crossQ = EASE(k(tCross, 420));
  const chipQ = EASE_IO(k(tChip, 480));
  const insLeft = lerp(A.ins.left, A.profile.left, mv);
  const insTop = lerp(A.ins.top, A.profile.top, mv) - Math.sin(Math.PI * mv) * 60;
  const insSize = lerp(A.ins.size, A.profile.size, mv);

  if (ms < tDate - 60) return null;
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <div style={{ opacity: rest }}>
        <DayLeaf rect={A.leaf} k={k(tDate, 520)} month={date.month} day={date.day} />
        {crossQ > 0 ? (
          <svg style={{ position: "absolute", left: A.cross.left, top: A.cross.top, transform: `rotate(${lerp(-180, 0, EASE(crossQ))}deg)` }} width={A.cross.size} height={A.cross.size} viewBox="0 0 10 10">
            <line x1={1.2} y1={1.2} x2={lerp(1.2, 8.8, clamp01(crossQ * 2))} y2={lerp(1.2, 8.8, clamp01(crossQ * 2))} stroke={WH} strokeWidth={1.3} strokeLinecap="round" />
            {crossQ > 0.5 ? <line x1={8.8} y1={1.2} x2={lerp(8.8, 1.2, clamp01(crossQ * 2 - 1))} y2={lerp(1.2, 8.8, clamp01(crossQ * 2 - 1))} stroke={WH} strokeWidth={1.3} strokeLinecap="round" /> : null}
          </svg>
        ) : null}
        {chipQ > 0 ? (
          <div style={{ position: "absolute", left: A.chip.left, top: A.chip.top, clipPath: `inset(0 ${(1 - chipQ) * 100}% 0 0 round 40px)`, padding: "14px 30px", borderRadius: 40, background: WH, ...label(COLORS.ink, A.chip.size) }}>{chip.label}</div>
        ) : null}
      </div>
      {/* AstraZeneca: flips in, then falls away under gravity (it is not on screen after this) */}
      <div style={{ position: "absolute", left: A.az.left, top: A.az.top, ...big(WH, A.az.size) }}>
        {ms >= tAz - 40 && ms < tMove + 1600 ? <Letters text={az.name} t={tAz} stagger={34} mode="flip" outMs={tMove} /> : null}
      </div>

      {/* ── insitro: drops in on line two, then arcs up into its profile ── */}
      <div style={{ position: "absolute", left: insLeft, top: insTop, ...big(WH, insSize) }}>
        {ms >= tIns - 40 ? <Letters text={ins.name} t={tIns} stagger={45} rise={60} mode="drop" /> : null}
      </div>

      {rows.map((r, i) => {
        if (ms < tRows[i]) return null;
        const color = i === 0 ? WH : INK_SUB;
        let body: React.ReactNode = r.text;
        if (r.emphasize && r.text.includes(r.emphasize)) {
          const [a, b] = r.text.split(r.emphasize);
          const eq = k(tEmp[i], 260);
          body = (
            <>
              {a}
              <span style={{ color: eq > 0 ? RED : color, opacity: lerp(0.35, 1, eq) }}>{r.emphasize}</span>
              {b}
            </>
          );
        }
        return (
          <div key={i} style={{ position: "absolute", left: A.rows.left, top: A.rows.tops[i], ...label(color, A.rows.size) }}>
            <BarReveal t={tRows[i]} color={WH}>{body}</BarReveal>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// TwoDiseases — the bullseye returns and DIVIDES like a cell (black)
// ══════════════════════════════════════════════════════════════════════════
export const TWO = {
  cy: 400, R: 205, xs: [560, 1360] as const,
  organ: { liver: 150, heart: 140 },
  name: { top: 700, size: 84 },
  sub: { top: 808, size: 40 },
};

type Disease = { name: string; sub: string; organ: "liver" | "heart"; word?: string; ms?: number; subCue: Cued };

export const TwoDiseases: React.FC<Win & {
  eye: Cued; // one dashed bullseye falls in spinning
  split: Cued; // "two": it stretches, pinches and divides
  a: Disease;
  b: Disease;
}> = ({ from, to, eye, split, a, b }) => {
  const ms = useMs();
  const k = useK();
  const WH = COLORS.paper;
  const T = TWO;
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));

  const tEye = at(eye, from, from);
  const tSplit = at(split, tEye + 1000, from, tEye + 600);
  const tA = at(a, tSplit + 900, from, tSplit + 500);
  const tAs = at(a.subCue, tA + 700, from, tA + 300);
  const tB = at(b, tAs + 1400, from, tAs + 400);
  const tBs = at(b.subCue, tB + 1400, from, tB + 300);

  const eq = k(tEye, 900);
  const fall = BOUNCE(k(tEye, 760));
  // division: stretch + squash (one body), then two bodies snap apart and recover
  const sp = k(tSplit, 680);
  const stretch = Math.sin(Math.PI * clamp01(sp / 0.45)) * (sp < 0.45 ? 1 : 0);
  const apart = SNAP(clamp01((sp - 0.35) / 0.65));
  const ds = [a, b];
  const tName = [tA, tB];
  const tSub = [tAs, tBs];

  if (ms < tEye - 60) return null;
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {T.xs.map((x, i) => {
        const cx = lerp(960, x, apart);
        const d = ds[i];
        const one = sp < 0.35; // before the pinch: ONE body (draw only the first copy)
        if (one && i === 1) return null;
        const sx = one ? 1 + stretch * 0.55 : lerp(1.2, 1, clamp01((sp - 0.35) / 0.4));
        const sy = one ? 1 - stretch * 0.22 : lerp(0.88, 1, clamp01((sp - 0.35) / 0.4));
        return (
          <React.Fragment key={i}>
            <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, transformOrigin: `${cx}px ${T.cy}px`, transform: `translateY(${lerp(-700, 0, fall)}px) scale(${sx}, ${sy})` }}>
              <Bullseye cx={cx} cy={T.cy} R={T.R} color={WH} k={eq} spin={-260} />
            </div>
            <Organ kind={d.organ} cx={cx} cy={T.cy} w={T.organ[d.organ]} color={WH} q={k(tName[i], 900)} />
            <div style={{ position: "absolute", left: x - 480, width: 960, top: T.name.top, textAlign: "center", ...big(WH, T.name.size) }}>
              {ms >= tName[i] - 40 ? <Letters text={d.name} t={tName[i]} stagger={d.name.length > 8 ? 22 : 45} rise={60} mode="flip" /> : null}
            </div>
            <div style={{ position: "absolute", left: x - 480, width: 960, top: T.sub.top, textAlign: "center", ...label(INK_SUB, T.sub.size) }}>
              <BarReveal t={tSub[i]} color={INK_SUB}>{d.sub}</BarReveal>
            </div>
          </React.Fragment>
        );
      })}
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// Dart — a simple filled POINTER (one cursor-like arrowhead, no shaft, no vanes).
// TIP at (0,0), pointing +x; place with x/y/angle. `build` 0..1 pops it in.
// Nel, 2026-10-22: "just make the arrow simple. like a cursor" (after a line-and-chevron
// dart read as ugly and a shaft-and-fletching dart as too much).
// ══════════════════════════════════════════════════════════════════════════
export const Dart: React.FC<{ x: number; y: number; angle: number; color: string; scale?: number; build?: number }> = ({ x, y, angle, color, scale = 1, build = 1 }) => {
  const q = Easing.out(Easing.back(1.8))(clamp01(build));
  if (q <= 0) return null;
  return (
    <g transform={`translate(${x} ${y}) rotate(${angle}) scale(${scale * q})`} opacity={clamp01(build * 4)}>
      <path d="M 0 0 L -58 -30 L -42 0 L -58 30 Z" fill={color} stroke={color} strokeWidth={4} strokeLinejoin="round" />
    </g>
  );
};
