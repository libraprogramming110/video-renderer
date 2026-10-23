// ─────────────────────────────────────────────────────────────────────────
// KIT · elora — A COMBO THAT MOVES A CEILING. Added on the Lilly EloraTZP
// long-form, 2026-10-03 (VERTICAL). Built under the 09-30 one-mover rule:
// each cue gets ONE motion, and anything that has landed goes still.
//
// `MassCut` (red, the hook): "23.3 percent. That's the weight loss..." A solid
// white block appears with the count; a red cut line rides DOWN from its top
// face as the figure counts, so the slice above the line is always exactly the
// counted share of the block. On "percent" the slice breaks off and FALLS out
// of frame under gravity. On "weight loss" a dashed outline draws where it was
// (the loss as an absence, no body imagery); the maker's name stamps on what
// remains.
//
// `PresentedSplit` (white card): "At the European diabetes meeting in Milan,
// Lilly presented Phase 2b data for EloraTZP. It pairs a new amylin receptor
// agonist with tirzepatide... the molecule inside Zepbound and Mounjaro." A
// framed clip of the meeting; a pin drops on the city; on "presented" a red
// slide wipes across the frame and is written on cue (maker, phase, name). On
// "It" the NAME lifts off the slide (the slide retires), and on "pairs" the
// name itself splits at its seam, ELORA | TZP, a "+" stamping into the gap: the
// name already says what the drug is. Each half then grows its molecule on its
// own word, and the tirzepatide half wires down into the two brands it is in.
//
// Every onset is a spoken word with an optional ms pin, clamped monotonic.
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, Easing, interpolate, interpolateColors, Sequence, staticFile, useVideoConfig } from "remotion";
import { BrollVideo, CLAMP, clamp01, COLORS, cue, DISPLAY, inkA, INK_SUB_ON_RED, msToFrame, TRACK, useMs } from "./core";
import { FlowLine } from "./flowline";

const EASE = Easing.out(Easing.cubic);
const EASE_IO = Easing.inOut(Easing.cubic);
const BACK = Easing.out(Easing.back(1.7));

export type Win = { from: number; to: number };
export type Cued = { word?: string; ms?: number };

export const useK = () => {
  const ms = useMs();
  return (a: number, dur: number) => clamp01(interpolate(ms, [a, a + dur], [0, 1], CLAMP));
};
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
/** resolve a cued onset: pin > spoken word > fallback, never earlier than `min` */
export const at = (c: Cued, fallback: number, from: number, min = -Infinity) => Math.max(min, c.ms ?? cue(c.word, fallback, from));

/** A phrase of narration that owns a window (fades in/out at its edges). */
export const Phrase: React.FC<{ from: number; to: number; line: string; top: number; size: number; color: string; emphasize?: string; empColor?: string; restColor?: string; restWeight?: number; underline?: string }> = ({
  from, to, line, top, size, color, emphasize, empColor, restColor, restWeight, underline,
}) => {
  const ms = useMs();
  const o = clamp01(interpolate(ms, [from - 80, from, to - 220, to], [0, 1, 1, 0], CLAMP));
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left: 90, right: 90, top, opacity: o }}>
      <FlowLine from={from} to={to} line={line} size={size} color={color} emphasize={emphasize} empColor={empColor} restColor={restColor} restWeight={restWeight} underline={underline} lineHeight={1.1} />
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// MassCut — the hook (red world)
// ══════════════════════════════════════════════════════════════════════════
export const MASS = {
  fig: { x: 540, y: 410, size: 250 },
  block: { x: 290, y: 600, w: 500, h: 500 },
  lineTop: 1270,
};

export const MassCut: React.FC<Win & {
  figure: { value: number; decimals: number; suffix: string } & Cued; // count starts
  settle: Cued; // the count lands and the slice breaks off ("percent")
  ghost: Cued; // the dashed outline of what was lost ("weight loss")
  maker: { name: string } & Cued; // stamps on what remains
  line: { text: string; emphasize: string; word?: string };
}> = ({ from, to, figure, settle, ghost, maker, line }) => {
  const ms = useMs();
  const k = useK();
  const W = COLORS.paper;
  const R = COLORS.accent;
  const B = MASS.block;
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));

  const tFig = at(figure, from + 60, from);
  const tSettle = at(settle, tFig + 1400, from, tFig + 600);
  const tGhost = at(ghost, tSettle + 1600, from, tSettle + 900);
  const tMaker = at(maker, tGhost + 500, from, tGhost + 300);
  const tLine = at({ word: line.word }, tSettle + 1200, from, tSettle + 300);

  // the count: one curve drives the figure AND the cut line, so they never disagree
  const q = EASE(k(tFig, tSettle - tFig));
  const value = q * figure.value;
  const sliceH = (B.h * value) / 100;

  // the block arrives with the count (a short rise), then is still
  const blockIn = EASE(k(tFig - 40, 320));
  // the slice: breaks off on "percent" and falls out of frame under gravity
  const fallT = Math.max(0, (ms - tSettle - 60) / 1000); // seconds since release
  const fallY = 0.5 * 5200 * fallT * fallT; // px, g tuned so it clears the frame in ~0.75s
  const fallX = fallT * 260;
  const fallR = fallT * fallT * 38; // degrees, accelerating tip
  const fallen = fallY > 1600;
  // the crack: the instant of release the slice lifts 6px off the face (one tick, then it falls)
  const crack = ms > tSettle ? Math.min(6, (ms - tSettle) * 0.1) : 0;

  const ghostQ = EASE(k(tGhost, 520));
  const makerS = interpolate(ms, [tMaker, tMaker + 300], [1.25, 1], { ...CLAMP, easing: EASE });
  const makerO = k(tMaker, 120);

  const figShown = value.toLocaleString("en-US", { minimumFractionDigits: figure.decimals, maximumFractionDigits: figure.decimals });
  const figPop = interpolate(ms, [tSettle - 80, tSettle + 220], [1.06, 1], { ...CLAMP, easing: EASE });
  const figO = k(tFig - 40, 140);

  if (ms < tFig - 60) return null;

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {/* the figure */}
      <div style={{ position: "absolute", left: 0, right: 0, top: MASS.fig.y, transform: `translateY(-50%) scale(${ms >= tSettle ? figPop : 1})`, textAlign: "center", opacity: figO,
        fontFamily: DISPLAY, fontWeight: 700, fontSize: MASS.fig.size, letterSpacing: TRACK.display, color: W, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
        {figShown}{figure.suffix}
      </div>

      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, overflow: "visible" }}>
        <g opacity={blockIn} transform={`translate(0 ${(1 - blockIn) * 40})`}>
          {/* what remains */}
          <rect x={B.x} y={B.y + sliceH} width={B.w} height={B.h - sliceH} fill={W} />
          {/* the slice: attached while counting, then falls */}
          {!fallen ? (
            <g transform={`translate(${fallX} ${fallY - crack}) rotate(${fallR} ${B.x + B.w} ${B.y + sliceH})`}>
              <rect x={B.x} y={B.y} width={B.w} height={sliceH} fill={W} />
            </g>
          ) : null}
          {/* the cut line rides the count, then goes with the face it marks */}
          {ms < tSettle + 60 ? <rect x={B.x - 24} y={B.y + sliceH - 3} width={B.w + 48} height={6} fill={R} /> : null}
          {/* the absence, drawn on "weight loss" */}
          {ghostQ > 0 ? (
            <>
              <clipPath id="masscut-ghost">
                <rect x={B.x - 10} y={B.y - 10} width={(B.w + 20) * ghostQ} height={sliceH + 20} />
              </clipPath>
              <rect x={B.x} y={B.y} width={B.w} height={sliceH} fill="none" stroke={W} strokeWidth={6} strokeDasharray="22 16"
                opacity={0.9} clipPath="url(#masscut-ghost)" />
            </>
          ) : null}
        </g>
      </svg>

      {/* the maker, stamped on what remains */}
      {makerO > 0 ? (
        <div style={{ position: "absolute", left: B.x, width: B.w, top: B.y + sliceH + (B.h - sliceH) / 2, transform: `translateY(-50%) scale(${makerS})`, opacity: makerO, textAlign: "center",
          fontFamily: DISPLAY, fontWeight: 700, fontSize: 84, letterSpacing: TRACK.headline, color: R, lineHeight: 1 }}>
          {maker.name}
        </div>
      ) : null}

      <Phrase from={tLine} to={to + 400} line={line.text} top={MASS.lineTop} size={60} color={W} restColor={INK_SUB_ON_RED} restWeight={700} emphasize={line.emphasize} empColor={W} underline={W} />
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// PresentedSplit — the meeting, the slide, the name that splits (white card)
// ══════════════════════════════════════════════════════════════════════════
export const SPLIT = {
  frame: { x: 90, y: 250, w: 900, h: 540 },
  pin: { x: 880, tipY: 282 }, // the pin's tip sits just inside the frame's top-right
  tab: { right: 920, y: 214 }, // the city tab, left of the pin, riding the frame's top edge
  name: { slideY: 560, slideSize: 150, seatY: 340, seatSize: 130 },
  cols: { left: 290, right: 790 },
  glyphY: 610,
  labelY: 760,
  chips: { y: 1010, xs: [560, 860], w: 280, h: 100 },
  lineTop: [850, 850, 1170] as const,
};

/** Inter 700 advance widths at display tracking, per em (biased a hair wide so a seam never overlaps) */
const EM_ELORA = 2.32;
const EM_TZP = 1.78;

/** A map pin: a red teardrop with a white eye, tip at (0,0). */
const Pin: React.FC<{ s?: number }> = ({ s = 1 }) => (
  <g transform={`scale(${s})`}>
    <path d="M0 0 C -14 -26 -40 -44 -40 -74 A 40 40 0 1 1 40 -74 C 40 -44 14 -26 0 0 Z" fill={COLORS.accent} />
    <circle cx={0} cy={-74} r={15} fill={COLORS.paper} />
  </g>
);

/** A peptide drawn as a chain of residues: a polyline + beads that light along it. `variant` gives each drug its own shape. */
export const Peptide: React.FC<{ x: number; y: number; q: number; color: string; variant: "amylin" | "tirz" }> = ({ x, y, q, color, variant }) => {
  // amylin analog: a zig-zag chain closed by a small ring (its disulfide loop)
  // tirzepatide: a straighter chain with a fatty side-tail
  const pts =
    variant === "amylin"
      ? [[-150, 40], [-100, -10], [-50, 40], [0, -10], [50, 40], [100, -10], [150, 40]]
      : [[-150, 0], [-100, 0], [-50, -30], [0, 0], [50, -30], [100, 0], [150, 0]];
  const d = pts.map((p, i) => `${i ? "L" : "M"} ${p[0]} ${p[1]}`).join(" ");
  const n = pts.length;
  return (
    <g transform={`translate(${x} ${y})`}>
      <path d={d} fill="none" stroke={color} strokeWidth={8} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - q} />
      {variant === "amylin" ? (
        <circle cx={-125} cy={-46} r={30} fill="none" stroke={color} strokeWidth={8} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - clamp01(q * 1.6 - 0.2)} />
      ) : (
        <path d="M 0 0 L 0 62 L 26 86 L 0 110 L 26 134" fill="none" stroke={color} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - clamp01(q * 1.6 - 0.6)} />
      )}
      {pts.map((p, i) => {
        const b = clamp01((q - i / n) * n);
        return b > 0 ? <circle key={i} cx={p[0]} cy={p[1]} r={17 * EASE(b)} fill={color} /> : null;
      })}
    </g>
  );
};

export const PresentedSplit: React.FC<Win & {
  clip: string; // public/ path of the meeting footage
  meeting: Cued; // the framed clip arrives
  city: { label: string } & Cued; // the pin drops
  slide: Cued; // the red slide wipes across the frame
  maker: { label: string } & Cued;
  phase: { label: string } & Cued;
  name: { left: string; right: string } & Cued; // stamps on the slide
  lift: Cued; // the name lifts off the slide ("It")
  split: Cued; // the name splits at its seam ("pairs")
  amylin: { label: string; word?: string; ms?: number; labelWord?: string; labelMs?: number };
  tirz: { label: string } & Cued;
  inside: Cued; // the wires draw down from tirzepatide
  brands: ({ label: string } & Cued)[];
  lines: { text: string; emphasize?: string; word?: string; ms?: number }[]; // three narration phrases
}> = ({ from, to, clip, meeting, city, slide, maker, phase, name, lift, split, amylin, tirz, inside, brands, lines }) => {
  const ms = useMs();
  const k = useK();
  const { fps } = useVideoConfig();
  const INK = COLORS.ink;
  const R = COLORS.accent;
  const W = COLORS.paper;
  const F = SPLIT.frame;
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));

  const tMeet = at(meeting, from + 100, from);
  const tCity = at(city, tMeet + 1600, from, tMeet + 400);
  const tSlide = at(slide, tCity + 700, from, tCity + 300);
  const tMaker = at(maker, tSlide + 100, from, tSlide);
  const tPhase = at(phase, tSlide + 900, from, tSlide + 300);
  const tName = at(name, tPhase + 1300, from, tPhase + 400);
  const tLift = at(lift, tName + 1000, from, tName + 500);
  const tSplit = at(split, tLift + 300, from, tLift + 200);
  const tAmy = at(amylin, tSplit + 800, from, tSplit + 450);
  const tAmyLabel = Math.max(tAmy + 250, amylin.labelMs ?? cue(amylin.labelWord, tAmy + 600, from));
  const tTirz = at(tirz, tAmyLabel + 1300, from, tAmyLabel + 300);
  const tInside = at(inside, tTirz + 2000, from, tTirz + 600);
  const tBrands = brands.map((b, i) => at(b, tInside + 450 + i * 1100, from, tInside + 250));

  // ── the frame: rises in, then retires as the name lifts off the slide
  const frameIn = EASE(k(tMeet, 420));
  const frameOut = EASE(k(tLift, 300));
  const frameO = frameIn * (1 - frameOut);
  const slideQ = EASE_IO(k(tSlide, 440));
  const pinQ = BACK(k(tCity, 420));
  const pinDrop = (1 - pinQ) * -260;
  const tabO = k(tCity + 160, 160);

  // ── the name: one element from the slide to its split seat
  const nameO = k(tName, 120);
  const nameStamp = interpolate(ms, [tName, tName + 300], [1.22, 1], { ...CLAMP, easing: EASE });
  const liftQ = EASE_IO(k(tLift, 520));
  const splitQ = EASE_IO(k(tSplit, 560));
  const S = lerp(SPLIT.name.slideSize, SPLIT.name.seatSize, liftQ);
  const y = lerp(SPLIT.name.slideY, SPLIT.name.seatY, liftQ);
  const wE = EM_ELORA * S;
  const wT = EM_TZP * S;
  const joinedL = 540 - (wE + wT) / 2 + wE / 2;
  const joinedR = 540 + (wE + wT) / 2 - wT / 2;
  const xL = lerp(joinedL, SPLIT.cols.left, splitQ);
  const xR = lerp(joinedR, SPLIT.cols.right, splitQ);
  // white on the red slide, ink once lifted onto the card
  const nameColor = interpolateColors(liftQ, [0.15, 0.55], [W, INK]);
  const plusS = interpolate(ms, [tSplit + 260, tSplit + 560], [1.6, 1], { ...CLAMP, easing: EASE });
  const plusO = k(tSplit + 260, 140);

  // ── the halves grow their molecules
  const amyQ = EASE(k(tAmy, 560));
  const tirzQ = EASE(k(tTirz, 560));
  const amyLabelO = k(tAmyLabel, 160);
  const tirzLabelO = k(tTirz + 200, 160);
  const wireQ = EASE_IO(k(tInside, 420));
  const C = SPLIT.chips;
  const wireFrom = { x: SPLIT.cols.right, y: SPLIT.labelY + 70 };

  const nameStyle = (x: number): React.CSSProperties => ({
    position: "absolute", left: x, top: y, transform: `translate(-50%,-50%) scale(${nameStamp})`, opacity: nameO,
    fontFamily: DISPLAY, fontWeight: 700, fontSize: S, letterSpacing: TRACK.display, color: nameColor, lineHeight: 1, whiteSpace: "nowrap",
  });

  if (ms < tMeet - 60) return null;
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {/* the frame: the meeting, then the slide */}
      {frameO > 0 ? (
        <div style={{ position: "absolute", left: F.x, top: F.y, width: F.w, height: F.h, overflow: "hidden", background: INK, opacity: frameO, transform: `translateY(${(1 - frameIn) * 50}px)` }}>
          {ms < tSlide + 600 ? (
            <Sequence from={msToFrame(tMeet, fps)} layout="none">
              <BrollVideo src={staticFile(clip)} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 38%" }} />
            </Sequence>
          ) : null}
          {/* the slide: a red panel wiping across the clip */}
          <div style={{ position: "absolute", inset: 0, background: R, clipPath: `inset(0 ${(1 - slideQ) * 100}% 0 0)` }}>
            <div style={{ position: "absolute", left: 50, top: 44, opacity: k(tMaker + 120, 160), fontFamily: DISPLAY, fontWeight: 700, fontSize: 44, letterSpacing: TRACK.headline, color: W }}>
              {maker.label}
            </div>
            {/* bottom-left: the city pin's tip owns the top-right corner */}
            <div style={{ position: "absolute", left: 50, bottom: 40, opacity: k(tPhase, 120), transform: `scale(${interpolate(ms, [tPhase, tPhase + 280], [1.25, 1], { ...CLAMP, easing: EASE })})`, transformOrigin: "left center",
              padding: "8px 24px", border: `4px solid ${W}`, borderRadius: 999, fontFamily: DISPLAY, fontWeight: 700, fontSize: 40, letterSpacing: TRACK.headline, color: W }}>
              {phase.label}
            </div>
          </div>
        </div>
      ) : null}

      {/* the city: tab + pin, riding the frame's top edge */}
      {ms >= tCity - 20 && frameO > 0 ? (
        <>
          <div style={{ position: "absolute", right: 1080 - SPLIT.tab.right + 70, top: SPLIT.tab.y, opacity: tabO * frameO, padding: "6px 22px", background: INK, borderRadius: 10,
            fontFamily: DISPLAY, fontWeight: 700, fontSize: 40, letterSpacing: TRACK.headline, color: W }}>
            {city.label}
          </div>
          <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: frameO }}>
            <g transform={`translate(${SPLIT.pin.x} ${SPLIT.pin.tipY + pinDrop})`}><Pin s={0.9} /></g>
          </svg>
        </>
      ) : null}

      {/* the name — two halves that start as one word */}
      {nameO > 0 ? (
        <>
          <div style={nameStyle(xL)}>{name.left}</div>
          <div style={nameStyle(xR)}>{name.right}</div>
        </>
      ) : null}
      {plusO > 0 ? (
        <div style={{ position: "absolute", left: 540, top: SPLIT.name.seatY, transform: `translate(-50%,-52%) scale(${plusS})`, opacity: plusO, fontFamily: DISPLAY, fontWeight: 700, fontSize: 120, color: R, lineHeight: 1 }}>+</div>
      ) : null}

      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {amyQ > 0 ? <Peptide x={SPLIT.cols.left} y={SPLIT.glyphY} q={amyQ} color={R} variant="amylin" /> : null}
        {tirzQ > 0 ? <Peptide x={SPLIT.cols.right} y={SPLIT.glyphY} q={tirzQ} color={INK} variant="tirz" /> : null}
        {wireQ > 0
          ? C.xs.map((x, i) => {
              const d = `M ${wireFrom.x} ${wireFrom.y} C ${wireFrom.x} ${wireFrom.y + 90}, ${x} ${C.y - C.h / 2 - 90}, ${x} ${C.y - C.h / 2}`;
              return <path key={i} d={d} fill="none" stroke={INK} strokeWidth={5} pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - wireQ} />;
            })
          : null}
      </svg>

      {amyLabelO > 0 ? (
        <div style={{ position: "absolute", left: SPLIT.cols.left - 210, width: 420, top: SPLIT.labelY, opacity: amyLabelO, transform: `translateY(${(1 - amyLabelO) * 14}px)`, textAlign: "center",
          fontFamily: DISPLAY, fontWeight: 700, fontSize: 44, letterSpacing: TRACK.headline, color: R, lineHeight: 1.08 }}>
          {amylin.label}
        </div>
      ) : null}
      {tirzLabelO > 0 ? (
        <div style={{ position: "absolute", left: SPLIT.cols.right - 210, width: 420, top: SPLIT.labelY, opacity: tirzLabelO, transform: `translateY(${(1 - tirzLabelO) * 14}px)`, textAlign: "center",
          fontFamily: DISPLAY, fontWeight: 700, fontSize: 44, letterSpacing: TRACK.headline, color: INK, lineHeight: 1.08 }}>
          {tirz.label}
        </div>
      ) : null}

      {brands.map((b, i) => {
        const o = k(tBrands[i], 120);
        if (o <= 0) return null;
        const s = interpolate(ms, [tBrands[i], tBrands[i] + 300], [1.2, 1], { ...CLAMP, easing: EASE });
        return (
          <div key={i} style={{ position: "absolute", left: C.xs[i] - C.w / 2, top: C.y - C.h / 2, width: C.w, height: C.h, opacity: o, transform: `scale(${s})`, border: `5px solid ${INK}`, borderRadius: 16, background: W,
            display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: 46, letterSpacing: TRACK.headline, color: INK }}>
            {b.label}
          </div>
        );
      })}

      {/* narration: three phrases, each owning its window */}
      {lines.map((l, i) => {
        const t0 = at(l, [tMeet, tSlide, tLift][i] ?? from, from);
        const t1 = i === 0 ? tSlide - 60 : i === 1 ? tLift + 200 : to + 400;
        return (
          <Phrase key={i} from={t0} to={t1} line={l.text} top={SPLIT.lineTop[i]} size={i === 2 ? 54 : 62} color={INK} restColor={inkA(0.55)} restWeight={700} emphasize={l.emphasize} empColor={i === 2 ? R : INK} />
        );
      })}
    </AbsoluteFill>
  );
};
