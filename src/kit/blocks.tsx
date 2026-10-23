// ─────────────────────────────────────────────────────────────────────────
// KIT · blocks — the reusable motion vocabulary, generalized from the proven
// VideoV2 build. EVERY block takes its CONTENT as props and its TIMING as spoken
// CUE WORDS (resolved to frames via core.cue) — no video baked in. Each block
// self-gates its visibility with a [from, to] ms window (its beat's span).
//
// This is a STARTING SET, not a fence. A session is free to invent new blocks /
// motion as long as it stays on-brand — and good inventions get added back here.
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, interpolateColors, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { BrollVideo, CLAMP, clamp01, caps, COLORS, CountUp, cue, cueMs, cueSeq, DISPLAY, INK_SUB, inkA, msToFrame, SANS, TRACK, useAccent, useInkSub, useMs, usePop, useRequireInk, useStamp, useWorld } from "./core";
import { Wordmark } from "./ui";
import { IconSyringe, IconPill } from "./icons";
import { FORMAT, LAYOUT, TYPE } from "../style";

// Portrait (1080×1920) vs landscape (1920×1080): the display type + some layouts
// adapt so a block reads right in either canvas. `V` = vertical.
const V = FORMAT.key === "vertical";

const SCRIM = `linear-gradient(180deg, ${inkA(0.55)} 0%, ${inkA(0.9)} 80%)`;

// a small caps chip on a footage/ink background (its own component so the hook
// isn't called inside a .map — rules of hooks)
const FootChip: React.FC<{ label: string; appearMs: number }> = ({ label, appearMs }) => {
  const p = usePop(appearMs, { rise: 10, scale: true });
  return <span style={{ ...p, padding: "10px 22px", border: `2px solid rgba(255,255,255,0.32)`, borderRadius: 4, ...caps(COLORS.paper) }}>{label}</span>;
};

// a beat's visibility window (fade in after `from`, out before `to`)
const useVis = (from: number, to: number, padIn = 360, padOut = 360) => {
  const ms = useMs();
  return clamp01(interpolate(ms, [from, from + padIn, to - padOut, to], [0, 1, 1, 0], CLAMP));
};

type Win = { from: number; to: number };

// ── CountUpHero — a hook stat. Optional b-roll plate behind the number. (ink) ──
export const CountUpHero: React.FC<Win & {
  kicker?: string;
  line: string;
  figure: { value: number; decimals: number; prefix?: string; suffix?: string; word?: string; durationMs?: number };
  cues?: { kicker?: string; line?: string };
  footage?: { src: string };
  /** figure type size. The 300 default assumes a bare number; a figure carrying a
   *  unit suffix ("$124 / share") overflows the line and wraps at that size, so
   *  drop this to ~190 whenever the figure is more than a few glyphs. */
  figureSize?: number;
}> = ({ from, to, kicker, line, figure, cues, footage, figureSize }) => {
  useRequireInk("CountUpHero with `footage`", !!footage); // the b-roll plate reads only on black
  const acc = useAccent(); // card look: the ONE emphasis (red; white in the red world)
  const inkSub = useInkSub();
  const ms = useMs();
  const vis = useVis(from, to);
  const kPop = usePop(cue(cues?.kicker, from + 350));
  const fStart = cue(figure.word, from + 4550);
  const lPop = usePop(cue(cues?.line, from + 1490), { rise: 18 });
  // accent bar draws in under the number once it has landed
  const barW = clamp01(interpolate(ms, [fStart + 750, fStart + 1550], [0, 1], CLAMP)) * (V ? 300 : 520);
  const plate = footage ? clamp01(interpolate(ms, [from + 50, from + 750, to - 720, to], [0, 0.42, 0.42, 0], CLAMP)) : 0;
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {footage ? (
        <AbsoluteFill style={{ opacity: plate }}>
          <BrollVideo src={staticFile(footage.src)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <AbsoluteFill style={{ background: `linear-gradient(180deg, ${inkA(0.62)} 0%, ${inkA(0.86)} 70%)` }} />
        </AbsoluteFill>
      ) : null}
      {/* number is the anchor (no reserved gap above it); line drops in below on cue */}
      <AbsoluteFill style={{ justifyContent: "center", padding: V ? "0 72px" : "0 120px" }}>
        {kicker ? <div style={kPop}><div style={caps(inkSub)}>{kicker}</div></div> : null}
        <CountUp
          fromMs={fStart}
          toMs={fStart + (figure.durationMs ?? 1100)}
          value={figure.value}
          decimals={figure.decimals}
          prefix={figure.prefix}
          suffix={figure.suffix}
          style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: figureSize ?? (V ? 216 : 300), letterSpacing: TRACK.display, color: COLORS.paper, lineHeight: 0.92, marginTop: V ? 16 : 10, transformOrigin: "left center", whiteSpace: "nowrap" }}
        />
        <div style={{ height: 6, width: barW, background: acc, marginTop: 24, borderRadius: 0 }} />
        <div style={{ ...lPop, marginTop: 26 }}>
          <div style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: V ? 52 : 52, letterSpacing: TRACK.headline, color: COLORS.paper, lineHeight: 1.12, maxWidth: V ? 900 : 1300 }}>{line}</div>
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── DealTicket — acquirer ↓ target, price counts up, optional badge + b-roll inset. (paper) ──
export const DealTicket: React.FC<Win & {
  kicker: string;
  acquirer: string;
  target: string;
  amount: { value: number; decimals: number; prefix?: string; suffix?: string; durationMs?: number };
  detail?: string;
  badge?: string;
  cues: { acquirer: string; target: string; price: string; badge?: string; detail?: string };
  footage?: { src: string; label: string };
}> = ({ from, to, kicker, acquirer, target, amount, detail, badge, cues, footage }) => {
  const vis = useVis(from, to);
  const acq = usePop(cue(cues.acquirer, from + 1000), { rise: 22 });
  const arrow = usePop(cue(cues.acquirer, from + 1000) + 600, { rise: 10 });
  const tgt = usePop(cue(cues.target, from + 2500), { rise: 22 });
  const bdg = usePop(cue(cues.badge, to - 2000), { rise: 16, scale: true });
  const det = usePop(cue(cues.detail, to - 1200), { rise: 16 });
  const inset = usePop(cue(cues.target, from + 2500) + 400, { rise: 24, scale: true });
  const pStart = cue(cues.price, from + 3500);
  const party: React.CSSProperties = { fontFamily: DISPLAY, fontWeight: 700, fontSize: 84, letterSpacing: TRACK.headline, color: COLORS.ink, lineHeight: 1 };
  return (
    <AbsoluteFill style={{ opacity: vis, padding: "140px 110px", flexDirection: "row", alignItems: "center", gap: 64 }}>
      <div style={{ flex: 1, maxWidth: 860, display: "flex", flexDirection: "column", gap: 16 }}>
        <div style={caps(COLORS.grayText, TYPE.labelSm)}>{kicker}</div>
        <div style={{ ...party, ...acq, marginTop: 6 }}>{acquirer}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, color: COLORS.grayText, ...arrow }}>
          <span style={{ fontSize: 34, lineHeight: 1 }}>↓</span>
          <span style={{ fontFamily: SANS, fontWeight: 500, fontSize: 34, letterSpacing: TRACK.body }}>acquires</span>
        </div>
        <div style={{ ...party, ...tgt }}>{target}</div>
        {footage ? (
          <div style={{ ...inset, marginTop: 26 }}>
            <div style={{ position: "relative", width: 560, height: 300, borderRadius: 6, overflow: "hidden", border: `2px solid ${COLORS.border}` }}>
              <BrollVideo src={staticFile(footage.src)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", left: 16, bottom: 14, ...caps(COLORS.paper, TYPE.labelSm) }}>{footage.label}</div>
            </div>
          </div>
        ) : null}
      </div>
      <div style={{ flexShrink: 0, textAlign: "right", display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 22 }}>
        <CountUp
          fromMs={pStart}
          toMs={pStart + (amount.durationMs ?? 1075)}
          value={amount.value}
          decimals={amount.decimals}
          prefix={amount.prefix}
          suffix={amount.suffix}
          style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 196, letterSpacing: TRACK.display, color: COLORS.ink, lineHeight: 0.9, transformOrigin: "right center" }}
        />
        {badge ? <div style={bdg}><div style={{ padding: "12px 24px", border: `2px solid ${COLORS.ink}`, borderRadius: 4, ...caps(COLORS.ink) }}>{badge}</div></div> : null}
        {detail ? <div style={det}><div style={caps(COLORS.grayText)}>{detail}</div></div> : null}
      </div>
    </AbsoluteFill>
  );
};

// ── KineticLine — an emphasized pull-statement with a drawn accent bar. (ink or paper) ──
export const KineticLine: React.FC<Win & {
  kicker?: string;
  line: string;
  cueWord?: string;
  bg?: "ink" | "paper";
  size?: number;
}> = ({ from, to, kicker, line, cueWord, bg = "ink", size = 120 }) => {
  const acc = useAccent(); // card look: the ONE emphasis (red; white in the red world)
  const inkSub = useInkSub(); // 80% white in the red world (62% measures ~2.3:1 there)
  const ms = useMs();
  const vis = useVis(from, to);
  const onset = cue(cueWord, from + 1200, from);
  const big = usePop(onset, { rise: 26, scale: true });
  const lead = usePop(from + 200, { rise: 14 });
  const barW = interpolate(ms, [onset + 210, onset + 1110], [0, 560], CLAMP);
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const sub = bg === "ink" ? inkSub : COLORS.grayText;
  return (
    <AbsoluteFill style={{ opacity: vis, justifyContent: "center", alignItems: "center", textAlign: "center", padding: "0 120px" }}>
      {kicker ? <div style={{ ...lead, marginBottom: 16 }}><div style={caps(sub)}>{kicker}</div></div> : null}
      <div style={big}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: size, letterSpacing: TRACK.display, color: fg, lineHeight: 1.02 }}>{line}</div>
      </div>
      <div style={{ height: 6, width: barW, background: acc, marginTop: 26, borderRadius: 0 }} />
    </AbsoluteFill>
  );
};

// ── ContrastWeigh — show-don't-tell: one SOLID thing outweighs a faint grid of maybes. (paper) ──
const MaybeCell: React.FC<{ fromMs: number; index: number }> = ({ fromMs, index }) => {
  const ms = useMs();
  const start = fromMs + index * 70;
  const op = clamp01(interpolate(ms, [start, start + 220], [0, 0.85], CLAMP));
  const y = interpolate(op, [0, 0.85], [12, 0], CLAMP);
  return (
    <div style={{ width: 104, height: 64, border: `2px solid ${COLORS.border}`, borderRadius: 6, opacity: op, transform: `translateY(${y}px)`, display: "flex", alignItems: "center", justifyContent: "center" }}>
      <span style={{ fontFamily: SANS, fontWeight: 600, fontSize: 30, color: COLORS.grayText }}>?</span>
    </div>
  );
};

export const ContrastWeigh: React.FC<Win & {
  heavy: { title: string; sub?: string };
  compare?: string;
  light: { label: string; cells?: number };
  cues: { heavy: string; compare?: string; cells?: string };
}> = ({ from, to, heavy, compare = "worth more than", light, cues }) => {
  const ms = useMs();
  const vis = useVis(from, to);
  const heavyOn = cue(cues.heavy, from + 400, from);
  const hero = usePop(heavyOn, { rise: 24, scale: true });
  const sub = usePop(heavyOn + 2400, { rise: 14 });
  const cmp = usePop(cue(cues.compare, to - 3500, from), { rise: 12 });
  const label = usePop(cue(cues.cells, to - 2200, from), { rise: 14 });
  const cellStart = cue(cues.cells, to - 2200, from);
  const barW = interpolate(ms, [heavyOn + 450, heavyOn + 1150], [0, 540], CLAMP);
  const n = light.cells ?? 12;
  return (
    <AbsoluteFill style={{ opacity: vis, justifyContent: "center", alignItems: "center", textAlign: "center", padding: "0 120px" }}>
      <div style={hero}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 96, letterSpacing: TRACK.display, color: COLORS.ink, lineHeight: 1.0 }}>{heavy.title}</div>
      </div>
      {heavy.sub ? <div style={{ ...sub, marginTop: 12 }}><div style={caps(COLORS.grayText)}>{heavy.sub}</div></div> : null}
      <div style={{ height: 8, width: barW, background: COLORS.ink, marginTop: 22, borderRadius: 4 }} />
      <div style={{ ...cmp, marginTop: 36, display: "flex", alignItems: "center", gap: 22 }}>
        <div style={{ width: 90, height: 2, background: COLORS.border }} />
        <span style={caps(COLORS.grayText)}>{compare}</span>
        <div style={{ width: 90, height: 2, background: COLORS.border }} />
      </div>
      <div style={{ ...label, marginTop: 32 }}><div style={caps(COLORS.grayText, TYPE.labelSm)}>{light.label}</div></div>
      <div style={{ display: "flex", gap: 16, marginTop: 20, justifyContent: "center", flexWrap: "wrap", maxWidth: 760 }}>
        {Array.from({ length: n }).map((_, i) => <MaybeCell key={i} index={i} fromMs={cellStart} />)}
      </div>
    </AbsoluteFill>
  );
};

// ── NegationChips — reject options build + get struck as named, then the answer stamps. (ink) ──
const StrikeChip: React.FC<{ label: string; appearMs: number; strikeMs: number }> = ({ label, appearMs, strikeMs }) => {
  const ms = useMs();
  const pop = usePop(appearMs, { rise: 16 });
  const struck = clamp01(interpolate(ms, [strikeMs, strikeMs + 260], [0, 1], CLAMP));
  const dim = interpolate(struck, [0, 1], [1, 0.38], CLAMP);
  return (
    <div style={{ position: "relative", padding: "20px 34px", border: `2px solid rgba(255,255,255,0.22)`, borderRadius: 4, opacity: pop.opacity * dim, transform: pop.transform }}>
      <span style={{ fontFamily: SANS, fontWeight: 600, fontSize: 38, letterSpacing: TRACK.body, color: COLORS.paper }}>{label}</span>
      <div style={{ position: "absolute", left: 22, right: 22, top: "52%", height: 3, background: INK_SUB, transform: `scaleX(${struck})`, transformOrigin: "left center" }} />
    </div>
  );
};

export const NegationChips: React.FC<Win & {
  intro: string;
  chips: { label: string; word: string }[];
  resolveKicker: string;
  answer: string;
  answerIcon?: IconC;
  /** `intro` and `kicker` are OPTIONAL cue words. Both lines are editorial framing
   *  rather than quoted VO, so by default they ride the block's entry / a fixed
   *  offset — but when the script actually voices them ("It was…"), cue them so
   *  they land on the words instead of near them. */
  cues: { resolve: string; intro?: string; kicker?: string };
}> = ({ from, to, intro, chips, resolveKicker, answer, answerIcon: AnswerIcon, cues }) => {
  const ms = useMs();
  const vis = useVis(from, to);
  // the answer STAMPS on the spoken cue word (not offset after it); the "It's a…"
  // kicker lands ~0.9s before, as it's voiced.
  const resolveOn = cue(cues.resolve, to - 4000);
  const introOn = cues.intro ? cue(cues.intro, from, from) : from;
  const introP = usePop(introOn, { rise: 12 });
  const ec = usePop(cues.kicker ? cue(cues.kicker, resolveOn - 900, from) : resolveOn - 900, { rise: 0 });
  const ans = usePop(resolveOn, { rise: 28, scale: true });
  const ruleW = interpolate(ms, [resolveOn + 180, resolveOn + 680], [0, V ? 560 : 720], CLAMP);
  return (
    <AbsoluteFill style={{ opacity: vis, justifyContent: "center", padding: V ? "0 72px" : "0 120px" }}>
      <div style={introP}><div style={caps(INK_SUB)}>{intro}</div></div>
      <div style={{ display: "flex", gap: 26, marginTop: 28, flexWrap: "wrap" }}>
        {chips.map((c, i) => {
          const a = cue(c.word, from + 2870 + i * 1130);
          return <StrikeChip key={i} label={c.label} appearMs={a} strikeMs={a + 460} />;
        })}
      </div>
      <div style={{ ...ec, marginTop: 64 }}><div style={caps(INK_SUB)}>{resolveKicker}</div></div>
      <div style={{ ...ans, marginTop: 12, display: "flex", alignItems: "center", gap: 24 }}>
        {AnswerIcon ? <AnswerIcon size={92} color={COLORS.paper} /> : null}
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: V ? 116 : 104, letterSpacing: TRACK.display, color: COLORS.paper, lineHeight: 1.0 }}>{answer}</div>
      </div>
      <div style={{ height: 4, width: ruleW, background: COLORS.paper, marginTop: 26, borderRadius: 2 }} />
    </AbsoluteFill>
  );
};

// ── BulletChips — a headline + a row of named chips that land on cue. Each chip
//    can carry an optional editorial line-icon. (ink or paper) ─────────────────
const Chip: React.FC<{ label: string; appearMs: number; bg: "ink" | "paper"; Icon?: IconC; solid?: boolean; size?: number }> = ({ label, appearMs, bg, Icon, solid, size }) => {
  const pop = usePop(appearMs, { rise: 18, scale: true });
  const border = bg === "ink" ? "rgba(255,255,255,0.3)" : COLORS.border;
  // outline: text takes the world's foreground. solid: a filled chip (opposite of
  // the world) so it reads as a highlighted pill.
  const outlineFg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const fg = solid ? (bg === "ink" ? COLORS.ink : COLORS.paper) : outlineFg;
  const fill = solid ? (bg === "ink" ? COLORS.paper : COLORS.ink) : "transparent";
  return (
    <div style={{ ...pop, display: "flex", alignItems: "center", gap: 20, padding: size ? `${Math.round(size * 0.4)}px ${Math.round(size * 0.72)}px` : "22px 40px", background: fill, border: solid ? "2px solid transparent" : `2px solid ${border}`, borderRadius: 6 }}>
      {Icon ? <Icon size={size ? Math.round(size * 0.85) : 46} color={fg} /> : null}
      <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: size ?? 54, letterSpacing: TRACK.headline, color: fg }}>{label}</span>
    </div>
  );
};

export const BulletChips: React.FC<Win & {
  kicker: string;
  headline: string;
  chips: { label: string; word: string; Icon?: IconC }[];
  tag?: string;
  bg?: "ink" | "paper";
  solid?: boolean;
  headlineMs?: number; // explicit onset ms for the headline (overrides the cue word; can LEAD the voice)
  /** chip type size — drop it below the 54 default when a row has many/long chips.
   *  Un-appeared chips still occupy layout space, so a wrapped row reserves an empty
   *  row and reads as a gap; sizing to fit ONE row is the fix. */
  chipSize?: number;
  /** headline display size — raise it to match a piece's hero scale (kit
   *  defaults differ per block, so one section can read smaller than its neighbour) */
  headlineSize?: number;
  cues?: { headline?: string; tag?: string };
}> = ({ from, to, kicker, headline, chips, tag, bg = "ink", solid, headlineMs, chipSize, headlineSize, cues }) => {
  const vis = useVis(from, to);
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const sub = bg === "ink" ? INK_SUB : COLORS.grayText;
  const eb = usePop(from + 200, { rise: 14 });
  const hd = usePop(headlineMs ?? cue(cues?.headline, from + 4100, from), { rise: 22 });
  const tg = usePop(cue(cues?.tag, to - 5000, from), { rise: 14 });
  return (
    <AbsoluteFill style={{ opacity: vis, justifyContent: "center", padding: "0 120px" }}>
      <div style={eb}><div style={caps(sub)}>{kicker}</div></div>
      <div style={{ ...hd, marginTop: 12 }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: headlineSize ?? 78, letterSpacing: TRACK.headline, color: fg, lineHeight: 1.05 }}>{headline}</div>
      </div>
      <div style={{ display: "flex", gap: 26, marginTop: 50, flexWrap: "wrap" }}>
        {chips.map((c, i) => <Chip key={i} label={c.label} Icon={c.Icon} appearMs={cue(c.word, from + 10000 + i * 410, from)} bg={bg} solid={solid} size={chipSize} />)}
      </div>
      {tag ? <div style={{ ...tg, marginTop: 46 }}><div style={caps(sub)}>{tag}</div></div> : null}
    </AbsoluteFill>
  );
};

// ── FootageScrim — a DIM b-roll plate behind a graphic (the "scrim-behind-a-
//    graphic" b-roll mode). Fades in/out over its window; render the graphic on
//    top of it. Keeps footage as punctuation, never the star. (ink) ─────────────
export const FootageScrim: React.FC<Win & {
  src: string;
  max?: number;
  scrim?: [number, number];
  /** "ink" veils the footage DOWN toward the ink colour (the default and the only
   *  live option). ⚠️ "paper" (a white veil, added 2026-07-24) is DEAD: rejected in a
   *  render 2026-08-06, and since the card look the scrim may only stand in the ink
   *  world anyway (it throws elsewhere), so a white veil has nothing to protect.
   *  Kept only so older compositions still typecheck. */
  tone?: "ink" | "paper";
}> = ({ from, to, src, max, scrim, tone = "ink" }) => {
  useRequireInk("FootageScrim"); // over the white card it washes out; over red it muddies the one red
  const ms = useMs();
  const { fps } = useVideoConfig(); // must run before the early return — hooks rule
  const paper = tone === "paper";
  const peak = max ?? (paper ? 0.5 : 0.4);
  const veil = scrim ?? (paper ? [0.72, 0.84] : [0.4, 0.64]);
  const tint = (a: number) => (paper ? `rgba(255,255,255,${a})` : inkA(a)); // was a hardcoded navy "24,27,34"
  const op = clamp01(interpolate(ms, [from, from + 700, to - 500, to], [0, peak, peak, 0], CLAMP));
  // UNMOUNT outside the beat. An opacity-0 <video> is still a live media element:
  // it decodes, competes for the browser's media slots, and reports buffering for
  // the whole timeline — which stalls Studio playback on a composition that has any
  // footage at all. Only exist while on screen. (Replimune long-form, 2026-08-08)
  if (ms < from - 400 || ms > to + 400) return null;
  return (
    <AbsoluteFill style={{ opacity: op }}>
      {/* ⚠️ The clip MUST play from its own frame 0, which is what this Sequence does.
          Without it, media time tracks COMPOSITION time: a scrim whose window starts
          at 26.5s asks the clip for its 26.5s mark, so any clip shorter than the
          window's start silently FREEZES on its last frame for the whole beat. Found
          on the ivonescimab long-form (2026-08-20) — a 10.01s finance clip held one
          still for 5s. Every previous build escaped it only because its clips happened
          to be longer than their windows' start times, so this had been latent, not
          absent. Starting b-roll at its beginning is also what you want anyway. */}
      <Sequence from={msToFrame(from, fps)} layout="none">
        <BrollVideo src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </Sequence>
      <AbsoluteFill style={{ background: `linear-gradient(180deg, ${tint(veil[0])} 0%, ${tint(veil[1])} 82%)` }} />
    </AbsoluteFill>
  );
};

// ── FootageBeat — full-screen b-roll with kinetic lines + optional chips. (ink) ──
export const FootageBeat: React.FC<Win & {
  src: string;
  kicker: string;
  headline: string;
  chips?: { label: string; word: string }[];
  tail?: string;
  cues?: { headline?: string; tail?: string };
}> = ({ from, to, src, kicker, headline, chips, tail, cues }) => {
  useRequireInk("FootageBeat"); // its fades composite the clip over the world underneath
  const ms = useMs();
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const vis = useVis(from, to);
  const plate = clamp01(interpolate(ms, [from + 200, from + 900, to - 400, to], [0, 1, 1, 0], CLAMP));
  const kb = interpolate(frame - msToFrame(from, fps), [0, 430], [1.05, 1.14], { extrapolateRight: "clamp" });
  const eb = usePop(from + 350, { rise: 14 });
  const hd = usePop(cue(cues?.headline, from + 2500), { rise: 22, scale: true });
  const tl = usePop(cue(cues?.tail, to - 2000), { rise: 14 });
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <AbsoluteFill style={{ opacity: plate }}>
        <AbsoluteFill style={{ transform: `scale(${kb})`, transformOrigin: "center center" }}>
          <BrollVideo src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </AbsoluteFill>
        <AbsoluteFill style={{ background: SCRIM }} />
      </AbsoluteFill>
      {/* bottom-anchored: in 9:16 it must clear the platform-UI zone (LAYOUT.safeBottom, card look) */}
      <AbsoluteFill style={{ justifyContent: "flex-end", padding: `0 120px ${V ? LAYOUT.safeBottom + 40 : 150}px` }}>
        <div style={eb}><div style={caps(INK_SUB)}>{kicker}</div></div>
        <div style={{ ...hd, marginTop: 10 }}>
          <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 104, letterSpacing: TRACK.display, color: COLORS.paper, lineHeight: 1.02 }}>{headline}</div>
        </div>
        {chips && chips.length ? (
          <div style={{ marginTop: 24, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            {chips.map((c, i) => <FootChip key={i} label={c.label} appearMs={cue(c.word, from + 8000 + i * 600)} />)}
          </div>
        ) : null}
        {tail ? <div style={{ ...tl, marginTop: 22 }}><div style={caps(INK_SUB)}>{tail}</div></div> : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── CTACard — branded end screen, in THE CARD LOOK (p1-cta / p2-cta): the white
//    lockup, a headline set REGULAR with one phrase BOLD in the accent, an optional
//    red-checkbox list, a full-width square RED button, the link. Left-aligned like
//    the carousel card. It ASSEMBLES quickly (all parts in ~2s) then holds — a short
//    CTA shouldn't dribble in over its whole span or it reads as empty space.
//    bg-aware: "ink" = the carousel's black card (recommended, in an ink World);
//    "paper" = the same card in dark type (sit it in a paper World). Since
//    2026-09-22 `bg` DEFAULTS to the world it stands in (paper world → "paper",
//    else "ink"): the old fixed "paper" default put black type on the black world.
//    In the red world it is always white type + a white lockup (a red logo on red
//    vanishes). ────────────────────────────────────────────────────────────────
const CtaCheck: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  // the carousel's checked box (p1-cta `.checklist li::before`), as one inline SVG
  <svg width={size * (38 / 34)} height={size} viewBox="0 0 38 34" style={{ display: "block", flex: "none" }}>
    <path d="M24 4.6H7.7a3.5 3.5 0 0 0-3.5 3.5v19.6a3.5 3.5 0 0 0 3.5 3.5h19.6a3.5 3.5 0 0 0 3.5-3.5V10" fill="none" stroke={color} strokeWidth={2.6} />
    <polygon fill={color} points="7,14.2 9.5,12.8 12.3,12.4 14.8,13.4 16.3,16.2 20,12 23,8.3 25.8,6 28.6,4 31,3 35.8,2.8 33,5.8 29.8,8.3 26.8,11.6 24.8,14.4 23.2,17.6 21.8,21 20.6,24.2 19.2,26 16.2,27 14.2,27 13,25.6 12,23 11,20.6 9.4,18.4 7.8,16.6" />
  </svg>
);
const CtaPoint: React.FC<{ text: string; appearMs: number; fg: string; mark: string }> = ({ text, appearMs, fg, mark }) => {
  const p = usePop(appearMs, { rise: 12 });
  const size = 36;
  return (
    <div style={{ ...p, display: "flex", alignItems: "center", gap: 18, height: size * 2.05 }}>
      <CtaCheck size={size * 0.92} color={mark} />
      <span style={{ fontFamily: SANS, fontWeight: 400, fontSize: size, letterSpacing: "-0.045em", color: fg, whiteSpace: "nowrap" }}>{text}</span>
    </div>
  );
};

export const CTACard: React.FC<Win & {
  headline: string;
  sub: string;
  button: string;
  link?: string;
  /** an optional SIGN-OFF line under the link, landing on its own spoken words.
   *  A brand tagline voiced as the last thing said deserves its own beat rather
   *  than being folded into `sub`. (Replimune long-form, 2026-08-08) */
  tail?: string;
  bg?: "ink" | "paper";
  /** card look: a phrase INSIDE `headline` set bold in the accent while the rest of
   *  the headline drops to regular — p1-cta's "Join the **#1 Newsletter**". Omit it
   *  and the whole headline is bold white (or ink). */
  emphasize?: string;
  /** card look: an optional red-checkbox list under the sub (p1-cta's checklist).
   *  Keep it to ≤4 short rows; each lands just after the one before. */
  points?: string[];
  /** `logo` added 2026-08-14 (Vykat XR long-form): the wordmark used to pop at a
   *  fixed from+200, so on a VO that names the brand mid-sentence the logo landed
   *  seconds before its own word — the one element on the end card that was not
   *  VO-conducted. Omit it and the old behaviour stands. */
  cues?: { logo?: string; headline?: string; sub?: string; button?: string; link?: string; tail?: string };
  /** Explicit-ms overrides, one per cue-driven onset. A CTA's last elements often
   *  have no spoken word of their own (a URL is rarely voiced), so a cue-only card
   *  falls back to a fixed offset and can reveal the link BEFORE the sub-line that
   *  is still being spoken. The standing rule since 2026-07-18: expose an explicit
   *  ms escape hatch on EVERY cue-driven onset. (oral GLP-1 long-form, 2026-08-21) */
  ms?: { logo?: number; headline?: number; sub?: number; button?: number; link?: number; tail?: number };
}> = ({ from, to, headline, sub, button, link = "Link in the description ↓", tail, bg, emphasize, points, cues, ms: at }) => {
  const acc = useAccent();
  const world = useWorld();
  const inkSub = useInkSub();
  const vis = clamp01(interpolate(useMs(), [from, from + 450], [0, 1], CLAMP));
  // white type on black and on red; dark type only on the white card (see header)
  const ink = world === "red" || (bg ?? (world === "paper" ? "paper" : "ink")) === "ink";
  const fg = ink ? COLORS.paper : COLORS.ink;
  const subCol = ink ? inkSub : COLORS.grayText;
  // the button is the brand red; in the red world it inverts to a white button with red type
  const btnBg = acc;
  const btnFg = acc === COLORS.paper ? COLORS.accent : COLORS.paper;
  const extra = (points?.length ?? 0) * 220; // a checklist pushes the later fallbacks back
  const logo = usePop(at?.logo ?? cue(cues?.logo, from + 200, from), { rise: 18, scale: true });
  const head = usePop(at?.headline ?? cue(cues?.headline, from + 700, from), { rise: 22 });
  const subOn = at?.sub ?? cue(cues?.sub, from + 1100, from);
  const subP = usePop(subOn, { rise: 16 });
  const btn = usePop(at?.button ?? cue(cues?.button, from + 1500 + extra, from), { rise: 16, scale: true });
  const linkP = usePop(at?.link ?? cue(cues?.link, from + 2100 + extra, from), { rise: 12 });
  const tailP = usePop(at?.tail ?? cue(cues?.tail, from + 2600 + extra, from), { rise: 12 });

  // split the headline around the emphasised phrase (first case-insensitive match)
  const ei = emphasize ? headline.toLowerCase().indexOf(emphasize.toLowerCase()) : -1;
  const eLen = emphasize?.length ?? 0;
  const hl: React.CSSProperties = { fontFamily: DISPLAY, fontWeight: ei >= 0 ? 400 : 700, fontSize: V ? 84 : 92, letterSpacing: "-0.04em", color: fg, lineHeight: 1.2 };
  const colW = V ? 912 : 1320;
  return (
    <AbsoluteFill style={{ opacity: vis, justifyContent: "center", alignItems: V ? "center" : "flex-start", padding: V ? `150px 84px ${LAYOUT.safeBottom}px` : "84px 150px 124px" }}>
      <div style={{ width: colW, display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
        <div style={{ ...logo, transformOrigin: "left center" }}>
          {/* size = HEIGHT of the wide lockup (~2.94:1). White on the black card, as on p1-cta. */}
          <Wordmark size={V ? 104 : 96} mark="wordmark" tone={ink ? "white" : "brand"} />
        </div>
        <div style={{ ...head, marginTop: V ? 70 : 60 }}>
          <div style={{ ...hl, maxWidth: colW }}>
            {ei >= 0 ? (
              <>
                {headline.slice(0, ei)}
                <span style={{ fontWeight: 700, color: acc === COLORS.paper ? fg : acc }}>{headline.slice(ei, ei + eLen)}</span>
                {headline.slice(ei + eLen)}
              </>
            ) : headline}
          </div>
        </div>
        <div style={{ ...subP, marginTop: 22, maxWidth: colW }}>
          <div style={{ fontFamily: SANS, fontWeight: 400, fontSize: V ? 40 : 42, letterSpacing: TRACK.body, color: subCol, lineHeight: 1.3 }}>{sub}</div>
        </div>
        {points && points.length ? (
          <div style={{ marginTop: 18 }}>
            {points.map((p, i) => <CtaPoint key={i} text={p} appearMs={subOn + 220 * (i + 1)} fg={fg} mark={acc} />)}
          </div>
        ) : null}
        <div style={{ ...btn, marginTop: V ? 56 : 48, width: "100%", transformOrigin: "left center" }}>
          <div style={{ height: V ? 104 : 92, background: btnBg, color: btnFg, display: "flex", alignItems: "center", justifyContent: "center",
            fontFamily: SANS, fontWeight: 400, fontSize: 38, letterSpacing: "-0.037em", paddingBottom: 3 }}>{button}</div>
        </div>
        <div style={{ ...linkP, marginTop: 22 }}>
          <div style={{ fontFamily: SANS, fontWeight: 400, fontSize: 30, letterSpacing: TRACK.nav, color: subCol }}>{link}</div>
        </div>
        {tail ? (
          <div style={{ ...tailP, marginTop: 30, display: "flex", flexDirection: "column", alignItems: "flex-start", gap: 16 }}>
            <div style={{ width: 90, height: 1, background: acc }} />
            <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: V ? 40 : 42, letterSpacing: TRACK.headline, color: fg }}>
              {tail}
            </div>
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// NEW (generalized from the BioIntel Concept B "What You Get" ad, 2026-07-01).
// Three patterns that proved their worth on a product-demo ad:
//   • PhoneFrame      — a device mockup to show "the thing itself"
//   • ScreenRecording — embed a REAL screen capture, poster-frozen until a cue
//   • Dock            — a shared-element scene hand-off (travel, don't cut)
// ═══════════════════════════════════════════════════════════════════════════

// ── PhoneFrame — a device mockup (bezel + notch + clipped screen). Drop content
//    (or a <ScreenRecording>) on its screen. PRESENTATIONAL: the parent positions /
//    scales / travels it. The "spine" pattern = keep ONE phone alive across several
//    beats (glide in → ease aside → re-centre + scroll) as a continuity anchor —
//    reads far more put-together than a fresh element per beat.
export const PhoneFrame: React.FC<{
  width?: number;
  bezel?: number;
  radius?: number;
  screenRatio?: number; // screen height / width (default ~19.5:9)
  children?: React.ReactNode;
}> = ({ width = 600, bezel = 18, radius = 54, screenRatio = 1.71, children }) => {
  const screenW = width - bezel * 2;
  const screenH = Math.round(screenW * screenRatio);
  return (
    <div style={{ width, height: screenH + bezel * 2, background: COLORS.ink, borderRadius: radius, padding: bezel, boxShadow: "0 40px 90px rgba(15,18,26,0.34), 0 6px 20px rgba(15,18,26,0.22)" }}>
      <div style={{ position: "relative", width: screenW, height: screenH, background: COLORS.paper, borderRadius: Math.max(0, radius - 14), overflow: "hidden" }}>
        {children}
        {/* notch */}
        <div style={{ position: "absolute", top: 14, left: "50%", transform: "translateX(-50%)", width: Math.round(screenW * 0.27), height: 26, background: COLORS.ink, borderRadius: 13, zIndex: 2 }} />
      </div>
    </div>
  );
};

// ── ScreenRecording — a frozen poster until `fromMs`, then the REAL clip plays.
//    Lets you embed a real screen-capture inside a graphic and control exactly WHEN
//    it starts (no blank screen, no jarring cut-in). Fills its parent (e.g. a phone
//    screen). NOTE: text inside a small on-screen device must be ~2× normal size to
//    read sound-off — a real capture can fail that; design / verify legibility.
export const ScreenRecording: React.FC<{
  posterSrc: string; // public/<posterSrc> — a still of the clip's first frame
  videoSrc: string;  // public/<videoSrc>  — H.264 / yuv420p / faststart (browser-safe)
  fromMs: number;    // composition ms the clip begins (poster shows before)
}> = ({ posterSrc, videoSrc, fromMs }) => {
  const { fps } = useVideoConfig();
  const fill: React.CSSProperties = { position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover" };
  return (
    <>
      <Img src={staticFile(posterSrc)} style={fill} />
      <Sequence from={msToFrame(fromMs, fps)} layout="none">
        <BrollVideo src={staticFile(videoSrc)} style={fill} />
      </Sequence>
    </>
  );
};

// ── Dock — a SHARED-ELEMENT scene hand-off. Render children centred (`fromTop`),
//    then TRAVEL them to a docked anchor (`toTop`) on a cue. Migrating one element
//    between two scenes reads more intentional than a fade/cut — pair it with the
//    next scene's content fading in below the docked element.
export const Dock: React.FC<{
  atMs: number;        // when the travel happens (a spoken-cue ms)
  fromTop: number;     // centred / start anchor (px from top)
  toTop: number;       // docked / end anchor (px from top)
  windowMs?: number;   // half-duration of the move
  x?: number;          // horizontal inset (left = right = x)
  gap?: number;
  children?: React.ReactNode;
}> = ({ atMs, fromTop, toTop, windowMs = 280, x = 0, gap = 22, children }) => {
  const ms = useMs();
  const t = clamp01(interpolate(ms, [atMs - windowMs, atMs + windowMs], [0, 1], CLAMP));
  const top = interpolate(t, [0, 1], [fromTop, toTop], CLAMP);
  return (
    <div style={{ position: "absolute", left: x, right: x, top, textAlign: "center", display: "flex", flexDirection: "column", alignItems: "center", gap }}>
      {children}
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// NEW (generalized from the Ipsen×Kartos p53 longform, 2026-07-02). Two blocks
// that proved out on a mechanism/data story:
//   • TimelineBar  — an era timeline (start——end) with a labelled spanning bar
//   • ReleaseGate  — ENACTED disinhibition: a lid flung off frees a held target
// Craft notes that drove them: motion should ENACT a relationship, not typeset it;
// dock/travel ONE element rather than crossfading two centred ones; a stamp lands
// harder anchored to its STATEMENT than to a late emphasis word.
// ═══════════════════════════════════════════════════════════════════════════

// ── TimelineBar — start——end timeline with a labelled bar spanning the era,
//    drawn on cue. Ink or paper. (the "stuck on JAK since 2011" beat) ───────────
export const TimelineBar: React.FC<Win & {
  kicker?: string;
  startLabel: string;
  endLabel: string;
  spanLabel: string;
  note?: string;
  width?: number;
  bg?: "ink" | "paper";
  cues?: { draw?: string; span?: string; end?: string };
  /** explicit-ms overrides (the kit's universal escape hatch — can LEAD the voice) */
  drawMs?: number;
  spanMs?: number;
  endMs?: number;
}> = ({ from, to, kicker, startLabel, endLabel, spanLabel, note, width = 780, bg = "ink", cues, drawMs, spanMs, endMs }) => {
  const ms = useMs();
  const vis = useVis(from, to);
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const dim = bg === "ink" ? INK_SUB : COLORS.grayText;
  const line = bg === "ink" ? "rgba(255,255,255,0.25)" : COLORS.border;
  const fillBg = bg === "ink" ? "rgba(255,255,255,0.12)" : COLORS.panel;
  const border = bg === "ink" ? "rgba(255,255,255,0.3)" : COLORS.border;
  // afterMs=from on every cue: without it a repeated word (e.g. "NVIDIA") resolves
  // to its FIRST utterance in the whole VO and the bar is already drawn on entry.
  const drawOn = drawMs ?? cue(cues?.draw, from + 600, from);
  const draw = clamp01(interpolate(ms, [drawOn, drawOn + 1500], [0, 1], CLAMP));
  const spanOn = spanMs ?? cue(cues?.span, from + 900, from);
  const span = clamp01(interpolate(ms, [spanOn, spanOn + 1300], [0, 1], CLAMP));
  const startPop = usePop(endMs ?? cue(cues?.end, to - 1600, from), { rise: 8 });
  const k = usePop(from + 150, { rise: 14 });
  return (
    <AbsoluteFill style={{ opacity: vis, justifyContent: "center", alignItems: "center" }}>
      <div style={{ width }}>
        {kicker ? <div style={{ ...k, textAlign: "center", marginBottom: 46 }}><div style={caps(dim)}>{kicker}</div></div> : null}
        <div style={{ position: "relative", height: 150 }}>
          <div style={{ position: "absolute", top: 44, left: 0, width: width * span, height: 46, background: fillBg, border: `2px solid ${border}`, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            <span style={{ ...caps(fg), opacity: span, whiteSpace: "nowrap" }}>{spanLabel}</span>
          </div>
          <div style={{ position: "absolute", top: 120, left: 0, height: 3, width: width * draw, background: line }} />
          <div style={{ position: "absolute", top: 115, left: -5, width: 12, height: 12, borderRadius: 12, background: fg, opacity: draw }} />
          <div style={{ position: "absolute", top: 115, left: width - 7, width: 12, height: 12, borderRadius: 12, background: fg, opacity: draw }} />
          <div style={{ position: "absolute", top: 138, left: 0, ...startPop }}><span style={caps(dim)}>{startLabel}</span></div>
          <div style={{ position: "absolute", top: 138, right: 0, opacity: draw }}><span style={caps(dim)}>{endLabel}</span></div>
        </div>
        {note ? (
          <div style={{ textAlign: "center", marginTop: 72, opacity: span, display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
            <div style={{ width: 40, height: 3, background: fg, borderRadius: 2 }} />
            <div style={{ ...caps(fg), fontWeight: 700 }}>{note}</div>
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

// ── ReleaseGate — ENACTED disinhibition (ink). `target` is held down by a
//    `blocker` lid; `agent` strikes it; on the `release` cue the lid is flung off
//    and the target springs UP + brightens. The motion IS the explanation — pair
//    the release cue with an ink→paper world flip for the payoff. ───────────────
export const ReleaseGate: React.FC<Win & {
  agent: string;
  blocker: string;
  target: string;
  heldState?: string;
  cues: { agent: string; block: string; target: string; release: string };
}> = ({ from, to, agent, blocker, target, heldState = "Offline", cues }) => {
  const ms = useMs();
  const vis = useVis(from, to, 360, 140);
  const agentOn = cue(cues.agent, from + 300);
  const agentAppear = clamp01(interpolate(ms, [agentOn, agentOn + 320], [0, 1], CLAMP));
  const agentY = interpolate(agentAppear, [0, 1], [-26, 0], CLAMP);
  const blockOn = cue(cues.block, from + 2500);
  const strike = clamp01(interpolate(ms, [blockOn, blockOn + 460], [0, 1], CLAMP));
  const blkAppear = clamp01(interpolate(ms, [blockOn, blockOn + 320], [0, 1], CLAMP));
  const tgtOn = cue(cues.target, from + 5000);
  const tgtAppear = clamp01(interpolate(ms, [tgtOn, tgtOn + 320], [0, 1], CLAMP));
  const relOn = cue(cues.release, to - 1000);
  const rel = clamp01(interpolate(ms, [relOn - 700, relOn + 50], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) }));
  const tgtColor = interpolateColors(rel, [0, 1], [INK_SUB, COLORS.paper]);
  const nm = (size: number, color: string): React.CSSProperties => ({ fontFamily: DISPLAY, fontWeight: 700, fontSize: size, letterSpacing: TRACK.headline, color, lineHeight: 1 });
  const chip = (border: string, pad: string): React.CSSProperties => ({ padding: pad, border: `2px solid ${border}`, borderRadius: 10, display: "inline-block" });
  return (
    <AbsoluteFill style={{ opacity: vis, justifyContent: "center", alignItems: "center" }}>
      <div style={{ position: "relative", width: 760, height: 640 }}>
        <div style={{ position: "absolute", top: 20, left: "50%", transform: `translateX(-50%) translateY(${agentY}px)`, opacity: agentAppear }}>
          <div style={chip(COLORS.paper, "14px 40px")}><span style={nm(48, COLORS.paper)}>{agent}</span></div>
        </div>
        <div style={{ position: "absolute", top: 120, left: "50%", transform: "translateX(-50%)", width: 3, height: 96 * strike, background: COLORS.paper, opacity: 1 - rel }} />
        <div style={{ position: "absolute", top: 238, left: "50%", transform: `translateX(calc(-50% + ${rel * 780}px)) rotate(${rel * 22}deg)`, opacity: (1 - rel) * blkAppear }}>
          <div style={{ padding: "16px 74px", background: "rgba(255,255,255,0.09)", border: `2px solid ${INK_SUB}`, borderRadius: 10 }}>
            <span style={nm(50, COLORS.paper)}>{blocker}</span>
          </div>
        </div>
        <div style={{ position: "absolute", top: 430, left: "50%", transform: `translateX(-50%) translateY(${-215 * rel}px) scale(${1 + 0.22 * rel})`, textAlign: "center", opacity: tgtAppear }}>
          <div style={nm(112, tgtColor)}>{target}</div>
          <div style={{ marginTop: 12, opacity: tgtAppear * (1 - rel) }}>
            <span style={chip(INK_SUB, "6px 18px")}><span style={caps(INK_SUB, TYPE.labelSm)}>{heldState}</span></span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// NEW (generalized from the AstraZeneca×CSPC China longform, 2026-07-03). Two
// blocks for a DEAL-PATTERN story (partnerships/licensing, not M&A):
//   • DealFlow   — payer → partner with a CONFIGURABLE verb (DealTicket says
//                  "acquires"; a licensing/AI-platform deal must not). Price
//                  counts up; up-front badge + modality/indication chips.
//   • DealStack  — N deal-rows land on cue, then a summed TOTAL counts up. The
//                  "one partner, many deals → $Xb" show-don't-tell centrepiece.
// ═══════════════════════════════════════════════════════════════════════════

// a modality / indication chip (icon + label) that pops on its own cue (paper)
type IconC = React.FC<{ size?: number; color?: string }>;
const DealChip: React.FC<{ label: string; appearMs: number; Icon?: IconC }> = ({ label, appearMs, Icon }) => {
  const pop = usePop(appearMs, { rise: 14, scale: true });
  return (
    <div style={{ ...pop, display: "flex", alignItems: "center", gap: 12, padding: "12px 22px", border: `2px solid ${COLORS.border}`, borderRadius: 8 }}>
      {Icon ? <Icon size={26} color={COLORS.grayText} /> : null}
      <span style={caps(COLORS.grayText, TYPE.labelSm)}>{label}</span>
    </div>
  );
};

// ── DealFlow — a deal narrated as a SEQUENCE of full-frame scenes, so 15–20s of
//    terms never crowd one layout. A persistent header (payer × partner) ties them
//    together; each scene fades in on its spoken cue: asset → access → money. (paper)
export const DealFlow: React.FC<Win & {
  kicker?: string;
  header: string; // "AstraZeneca × CSPC" — persistent context
  asset: { title: string; sub?: string; word: string; icons?: IconC[] };
  access: { intro?: string; title: string; word: string; Icon?: IconC };
  money: { amount: { value: number; decimals: number; prefix?: string; suffix?: string; durationMs?: number }; priceWord: string; priceLabel?: string; upfront?: string; upfrontWord?: string };
}> = ({ from, to, header, asset, access, money }) => {
  const ms = useMs();
  const vis = useVis(from, to);
  const CF = 320; // crossfade half-window
  // scene onsets from spoken cues. afterMs=from stops a short cue word (e.g. "AI-…")
  // matching an earlier stray letter; Math.max keeps p1<p2<p3 so the crossfade
  // interpolate ranges are always strictly increasing (never crashes).
  const p1 = from;
  const p2 = Math.max(cue(access.word, from + 5200, from), p1 + 1000);
  const p3 = Math.max(cue(money.upfrontWord ?? money.priceWord, from + 8000, from), p2 + 1000);
  const o1 = clamp01(interpolate(ms, [p1, p1 + 300, p2 - CF, p2 + CF], [0, 1, 1, 0], CLAMP));
  const o2 = clamp01(interpolate(ms, [p2 - CF, p2 + CF, p3 - CF, p3 + CF], [0, 1, 1, 0], CLAMP));
  const o3 = clamp01(interpolate(ms, [p3 - CF, p3 + CF, to - 260, to], [0, 1, 1, 0], CLAMP));
  const aOn = cue(asset.word, p1 + 700, from);
  const aTitle = usePop(aOn, { rise: 20, scale: true });
  const aSub = usePop(aOn + 1500, { rise: 14 });
  const xIntro = usePop(p2 - 150, { rise: 12 });
  const xTitle = usePop(p2 + 200, { rise: 20, scale: true });
  const upf = usePop(cue(money.upfrontWord, p3, from), { rise: 16, scale: true });
  const priceOn = Math.max(cue(money.priceWord, p3 + 2000, from), p3 + 800);
  const mLabel = usePop(priceOn - 500, { rise: 12 });
  const AccessIcon = access.Icon;
  const bigTitle: React.CSSProperties = { fontFamily: DISPLAY, fontWeight: 700, fontSize: V ? 92 : 120, letterSpacing: TRACK.headline, color: COLORS.ink, lineHeight: 1.03 };
  const scene: React.CSSProperties = { justifyContent: "center", alignItems: "center", textAlign: "center", padding: V ? "0 72px" : "0 160px" };
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {/* persistent header — the two parties */}
      <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: V ? 168 : 150 }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: V ? 46 : 54, letterSpacing: TRACK.headline, color: COLORS.ink }}>{header}</div>
        <div style={{ width: 68, height: 3, background: COLORS.border, marginTop: 20, borderRadius: 2 }} />
      </AbsoluteFill>

      {/* scene 1 — the asset */}
      <AbsoluteFill style={{ ...scene, opacity: o1 }}>
        {asset.icons && asset.icons.length ? (
          <div style={{ display: "flex", gap: 28, marginBottom: 34 }}>
            {asset.icons.map((Ic, i) => <Ic key={i} size={V ? 70 : 78} color={COLORS.grayText} />)}
          </div>
        ) : null}
        <div style={aTitle}><div style={bigTitle}>{asset.title}</div></div>
        {asset.sub ? <div style={{ ...aSub, marginTop: 20 }}><div style={{ fontFamily: SANS, fontWeight: 500, fontSize: V ? 42 : 46, letterSpacing: TRACK.body, color: COLORS.grayText }}>{asset.sub}</div></div> : null}
      </AbsoluteFill>

      {/* scene 2 — the AI engine access */}
      <AbsoluteFill style={{ ...scene, opacity: o2 }}>
        {AccessIcon ? <div style={{ marginBottom: 34 }}><AccessIcon size={V ? 84 : 92} color={COLORS.grayText} /></div> : null}
        <div style={xIntro}><div style={caps(COLORS.grayText)}>{access.intro ?? "plus access to"}</div></div>
        <div style={{ ...xTitle, marginTop: 16 }}><div style={bigTitle}>{access.title}</div></div>
      </AbsoluteFill>

      {/* scene 3 — the money */}
      <AbsoluteFill style={{ ...scene, opacity: o3 }}>
        {money.upfront ? <div style={{ ...upf, marginBottom: 30 }}><div style={{ padding: "12px 28px", border: `2px solid ${COLORS.ink}`, borderRadius: 4, ...caps(COLORS.ink) }}>{money.upfront}</div></div> : null}
        <div style={mLabel}><div style={caps(COLORS.grayText)}>{money.priceLabel ?? "up to"}</div></div>
        <CountUp
          fromMs={priceOn}
          toMs={priceOn + (money.amount.durationMs ?? 1100)}
          value={money.amount.value}
          decimals={money.amount.decimals}
          prefix={money.amount.prefix}
          suffix={money.amount.suffix}
          style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: V ? 212 : 280, letterSpacing: TRACK.display, color: COLORS.ink, lineHeight: 0.92, marginTop: 10 }}
        />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── DealStack — a running ledger: each {label, amount} row lands on its cue,
//    then a summed TOTAL counts up on the total cue. The "one partner, many
//    deals → $Xb" centrepiece. (paper) ────────────────────────────────────
const StackRow: React.FC<{ label: string; amount: string; appearMs: number; y: number; Icon?: IconC }> = ({ label, amount, appearMs, y, Icon }) => {
  const pop = usePop(appearMs, { rise: 20 });
  return (
    <div style={{ position: "absolute", top: y, left: 0, right: 0, display: "flex", alignItems: "center", justifyContent: "space-between", ...pop }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        {Icon ? <Icon size={40} color={COLORS.grayText} /> : null}
        <span style={{ fontFamily: SANS, fontWeight: 600, fontSize: 46, letterSpacing: TRACK.body, color: COLORS.grayText }}>{label}</span>
      </div>
      <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 72, letterSpacing: TRACK.headline, color: COLORS.ink, lineHeight: 1 }}>{amount}</span>
    </div>
  );
};

export const DealStack: React.FC<Win & {
  kicker: string;
  rows: { label: string; amount: string; word: string; Icon?: IconC }[];
  total: { label: string; value: number; decimals: number; prefix?: string; suffix?: string; word: string; durationMs?: number };
  cues?: { total?: string };
  width?: number;
}> = ({ from, to, kicker, rows, total, width = 980 }) => {
  const ms = useMs();
  const vis = useVis(from, to);
  const k = usePop(from + 200, { rise: 14 });
  const rowGap = 108;
  const rowsTop = 96;
  const totalOn = cue(total.word, to - 4000);
  const ruleW = interpolate(ms, [totalOn - 200, totalOn + 500], [0, width], CLAMP);
  const totalTop = rowsTop + rows.length * rowGap + 40;
  const tLabel = usePop(totalOn, { rise: 14 });
  return (
    <AbsoluteFill style={{ opacity: vis, justifyContent: "center", alignItems: "center" }}>
      <div style={{ width, position: "relative", height: totalTop + 150 }}>
        <div style={{ ...k, position: "absolute", top: 0, left: 0 }}><div style={caps(COLORS.grayText)}>{kicker}</div></div>
        {rows.map((r, i) => (
          <StackRow key={i} label={r.label} amount={r.amount} Icon={r.Icon} y={rowsTop + i * rowGap} appearMs={cue(r.word, from + 1200 + i * 1200)} />
        ))}
        <div style={{ position: "absolute", top: totalTop - 26, left: 0, height: 3, width: ruleW, background: COLORS.ink, borderRadius: 2 }} />
        <div style={{ position: "absolute", top: totalTop, left: 0, right: 0, display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <div style={tLabel}><span style={caps(COLORS.ink)}>{total.label}</span></div>
          <CountUp
            fromMs={totalOn}
            toMs={totalOn + (total.durationMs ?? 1200)}
            value={total.value}
            decimals={total.decimals}
            prefix={total.prefix}
            suffix={total.suffix}
            style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 132, letterSpacing: TRACK.display, color: COLORS.ink, lineHeight: 0.9, transformOrigin: "right center" }}
          />
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// NEW (BioIntel "Vertex" reel, 2026-07-08). Vertical-first blocks for a fast
// reel where the NARRATION lines are their own kinetic scenes (not static
// eyebrows), and data reads even in a short window:
//   • WordFlow     — a line that reveals WORD-BY-WORD, each word on its spoken
//                    frame (auto-synced from timeline.words). "Animate the flow."
//   • DealHeadline — a vertical M&A headline (acquirer → price → target on cue);
//                    the portrait replacement for DealTicket's landscape split.
//   • DealLedgerV  — a vertical ledger whose RUNNING TOTAL counts live as rows
//                    land, so the tally is present throughout, not a 1s flash.
// ═══════════════════════════════════════════════════════════════════════════

// one word of a WordFlow — its own component so usePop isn't called in a .map
// ⚠️ A per-word reveal must SNAP (~130ms), never soft-spring. `usePop`'s spring
// (damping 18 / stiffness 120) takes ~500ms to settle, which reads as the words
// LAGGING BEHIND the voice as soon as speech speeds up — the first few look
// perfect and the rest arrive late. Fire on the exact startMs and be done in
// 130ms. (block-kit.md, ARPA-H 2026-07-11; re-confirmed by the operator on the
// Pathos long-form quote beat, 2026-08-06.)
const SNAP_MS = 130;
const useSnap = (onsetMs: number, rise = 14): React.CSSProperties => {
  const ms = useMs();
  const p = clamp01(interpolate(ms, [onsetMs, onsetMs + SNAP_MS], [0, 1], CLAMP));
  return { opacity: p, transform: `translateY(${interpolate(p, [0, 1], [rise, 0], CLAMP)}px)` };
};

const FlowWord: React.FC<{ text: string; onsetMs: number; style: React.CSSProperties }> = ({ text, onsetMs, style }) => {
  const snap = useSnap(onsetMs, 16);
  return <span style={{ ...style, ...snap, display: "inline-block" }}>{text}</span>;
};

// ── WordFlow — a narration line, revealed word-by-word on the exact frame each
//    word is spoken. Auto-syncs every token to timeline.words within [from,to]
//    (a cursor advances so repeats resolve in order; unfound tokens fall back to
//    an even stagger). The vehicle for the connective narration beats. (ink/paper)
export const WordFlow: React.FC<Win & {
  line: string;
  bg?: "ink" | "paper";
  size?: number;
  kicker?: string;
  align?: "center" | "left";
  weight?: number;
  maxWidth?: number;
  /** A contiguous phrase INSIDE `line` that carries the emphasis. Those words keep
   *  full weight + colour while the rest of the sentence sits lighter and dimmer,
   *  so a mid-sentence phrase can gain weight AS IT IS VOICED without breaking the
   *  line into two blocks. Matched on normalised tokens, so punctuation in `line`
   *  doesn't matter. (added BioIntel GSK×Jideytro reel, 2026-07-24) */
  emphasize?: string;
}> = ({ from, to, line, bg = "ink", size = 76, kicker, align = "center", weight = 700, maxWidth = 940, emphasize }) => {
  const acc = useAccent();
  const inkSub = useInkSub(); // 80% white in the red world (62% measures ~2.3:1 there)
  const vis = useVis(from, to);
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const sub = bg === "ink" ? inkSub : COLORS.grayText;
  const toks = line.split(/\s+/).filter(Boolean);
  // auto-sync: resolve each token to its spoken ms, walking a WORD-INDEX cursor.
  // (An ms cursor skipped any token sharing a startMs with its neighbour — see
  // cueSeq in core.tsx. "August 6th" was the case that exposed it.)
  const onsets = cueSeq(toks, from, to);
  const span = Math.max(700, to - from - 900);
  const filled = onsets.map((m, i) => m ?? from + 200 + (span * i) / Math.max(1, toks.length - 1));

  // locate the emphasised run: the first contiguous token match for the phrase
  const nz = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  let empFrom = -1;
  let empTo = -1;
  if (emphasize) {
    const want = emphasize.split(/\s+/).filter(Boolean).map(nz).filter(Boolean);
    for (let i = 0; i + want.length <= toks.length; i++) {
      if (want.every((w, k) => nz(toks[i + k]) === w)) { empFrom = i; empTo = i + want.length - 1; break; }
    }
  }
  const isEmp = (i: number) => empFrom >= 0 && i >= empFrom && i <= empTo;
  const emphasising = empFrom >= 0;

  const wordStyle: React.CSSProperties = {
    fontFamily: DISPLAY, fontWeight: weight, fontSize: size, letterSpacing: TRACK.headline,
    color: fg, lineHeight: 1.1, marginRight: "0.26em",
  };
  // when a phrase is emphasised the REST of the line steps down to REGULAR and the
  // phrase goes BOLD in the accent — the carousel CTA headline ("Join the **#1
  // Newsletter**"). In the red world the accent is white, so there the rest also
  // steps down in brightness to keep the contrast. (card look, 2026-09-22)
  const empStyle: React.CSSProperties = { ...wordStyle, fontWeight: 700, color: acc };
  const restStyle: React.CSSProperties = { ...wordStyle, fontWeight: 400, color: acc === COLORS.paper ? sub : fg };
  return (
    <AbsoluteFill style={{ opacity: vis, justifyContent: "center", alignItems: align === "center" ? "center" : "flex-start", padding: "0 96px" }}>
      {kicker ? <div style={{ ...caps(sub), marginBottom: 26 }}>{kicker}</div> : null}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: align === "center" ? "center" : "flex-start", textAlign: align, maxWidth }}>
        {toks.map((t, i) => (
          <FlowWord key={i} text={t} onsetMs={filled[i]} style={!emphasising ? wordStyle : isEmp(i) ? empStyle : restStyle} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ── DealHeadline — a vertical M&A headline. Acquirer stamps (on its word), the
//    price counts up, then "acquires <target>" resolves — spoken order, top to
//    bottom. The portrait-first replacement for DealTicket's row-split. (ink)
export const DealHeadline: React.FC<Win & {
  kicker?: string;
  acquirer: string;
  target: string;
  amount: { value: number; decimals: number; prefix?: string; suffix?: string; durationMs?: number };
  cues: { acquirer: string; price: string; target: string };
}> = ({ from, to, kicker, acquirer, target, amount, cues }) => {
  const vis = useVis(from, to);
  const acqOn = cue(cues.acquirer, from + 100, from);
  const acq = usePop(acqOn, { rise: 20, scale: true });
  const pOn = cue(cues.price, from + 1200, from);
  const tgtOn = cue(cues.target, from + 3000, from);
  const verb = usePop(tgtOn - 250, { rise: 12 });
  const tgt = usePop(tgtOn, { rise: 20, scale: true });
  return (
    <AbsoluteFill style={{ opacity: vis, justifyContent: "center", alignItems: "center", textAlign: "center", padding: "0 88px" }}>
      {kicker ? <div style={{ ...caps(INK_SUB), marginBottom: 22 }}>{kicker}</div> : null}
      <div style={acq}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 112, letterSpacing: TRACK.display, color: COLORS.paper, lineHeight: 1 }}>{acquirer}</div>
      </div>
      <CountUp
        fromMs={pOn}
        toMs={pOn + (amount.durationMs ?? 1075)}
        value={amount.value}
        decimals={amount.decimals}
        prefix={amount.prefix}
        suffix={amount.suffix}
        style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 268, letterSpacing: TRACK.display, color: COLORS.paper, lineHeight: 0.95, margin: "14px 0" }}
      />
      <div style={verb}><div style={caps(INK_SUB)}>acquires</div></div>
      <div style={{ ...tgt, marginTop: 8 }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 96, letterSpacing: TRACK.display, color: COLORS.paper, lineHeight: 1 }}>{target}</div>
      </div>
    </AbsoluteFill>
  );
};

// one row of a DealLedgerV — slides in on its cue, hairline under it
const LedgerRow: React.FC<{ label: string; amount: string; appearMs: number; bg: "ink" | "paper" }> = ({ label, amount, appearMs, bg }) => {
  const pop = usePop(appearMs, { rise: 22 });
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const sub = bg === "ink" ? INK_SUB : COLORS.grayText;
  const line = bg === "ink" ? "rgba(255,255,255,0.14)" : COLORS.border;
  return (
    <div style={{ ...pop, display: "flex", alignItems: "baseline", justifyContent: "space-between", padding: "24px 0", borderBottom: `2px solid ${line}` }}>
      <span style={{ fontFamily: SANS, fontWeight: 600, fontSize: 50, letterSpacing: TRACK.body, color: sub }}>{label}</span>
      <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 74, letterSpacing: TRACK.headline, color: fg, lineHeight: 1 }}>{amount}</span>
    </div>
  );
};

// ── DealLedgerV — a vertical running ledger. Each row lands on its spoken cue
//    while a persistent RUNNING TOTAL counts up live (e.g. 11→22→32), so the
//    tally is on screen the whole section — not a one-second flash. (ink/paper)
export const DealLedgerV: React.FC<Win & {
  kicker: string;
  rows: { label: string; amount: string; word: string; add: number }[];
  total: { label: string; decimals: number; prefix?: string; suffix?: string };
  bg?: "ink" | "paper";
}> = ({ from, to, kicker, rows, total, bg = "paper" }) => {
  const ms = useMs();
  const vis = useVis(from, to);
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const sub = bg === "ink" ? INK_SUB : COLORS.grayText;
  const line = bg === "ink" ? "rgba(255,255,255,0.22)" : COLORS.border;
  const k = usePop(from + 150, { rise: 14 });
  const onsets = rows.map((r, i) => cue(r.word, from + 1200 + i * 1400));
  // live running total: each row's `add` tweens in over 700ms from its onset
  let value = 0;
  for (let i = 0; i < rows.length; i++) {
    value += rows[i].add * clamp01(interpolate(ms, [onsets[i], onsets[i] + 700], [0, 1], CLAMP));
  }
  const lastOn = onsets[onsets.length - 1] ?? from;
  const totalIn = clamp01(interpolate(ms, [onsets[0] ?? from, (onsets[0] ?? from) + 400], [0, 1], CLAMP));
  const ruleW = interpolate(ms, [lastOn - 200, lastOn + 500], [0, 1], CLAMP);
  const shown = value.toLocaleString("en-US", { minimumFractionDigits: total.decimals, maximumFractionDigits: total.decimals });
  return (
    <AbsoluteFill style={{ opacity: vis, justifyContent: "center", padding: "0 92px" }}>
      <div style={{ ...k, marginBottom: 16 }}><div style={caps(sub)}>{kicker}</div></div>
      {rows.map((r, i) => <LedgerRow key={i} label={r.label} amount={r.amount} appearMs={onsets[i]} bg={bg} />)}
      <div style={{ height: 3, width: `${ruleW * 100}%`, background: fg, marginTop: 28, borderRadius: 2, alignSelf: "stretch" }} />
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginTop: 22, opacity: totalIn }}>
        <span style={caps(sub)}>{total.label}</span>
        <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 150, letterSpacing: TRACK.display, color: fg, lineHeight: 0.9, fontVariantNumeric: "tabular-nums" }}>
          {total.prefix}{shown}{total.suffix}
        </span>
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// NEW (Vertex × Crinetics longform, 2026-07-09). Blocks for a single-deal terms
// story where the figures DON'T sum (so DealLedgerV's running total is wrong):
//   • TermsLedger — deal terms as a labeled ledger; each row lands on its figure's
//                   spoken word, and the `hero` row counts up.
// ═══════════════════════════════════════════════════════════════════════════

// one row of a TermsLedger — the whole row (label + amount + hairline) reveals on
// its spoken cue; a `count` row counts up, a plain row stamps its amount string.
const TermsRow: React.FC<{
  label: string;
  amount?: string;
  count?: { value: number; decimals: number; prefix?: string; suffix?: string; durationMs?: number };
  appearMs: number;
  hero?: boolean;
}> = ({ label, amount, count, appearMs, hero }) => {
  const reveal = usePop(appearMs, { rise: 20 });
  const amtSize = hero ? (V ? 150 : 168) : (V ? 76 : 88);
  const labelSize = hero ? 42 : 34;
  return (
    <div style={{ ...reveal, display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 40, padding: hero ? "30px 0" : "22px 0", borderBottom: "2px solid rgba(255,255,255,0.14)" }}>
      <span style={{ fontFamily: SANS, fontWeight: 600, fontSize: labelSize, letterSpacing: TRACK.body, color: hero ? COLORS.paper : INK_SUB }}>{label}</span>
      {count ? (
        <CountUp
          fromMs={appearMs}
          toMs={appearMs + (count.durationMs ?? 900)}
          value={count.value}
          decimals={count.decimals}
          prefix={count.prefix}
          suffix={count.suffix}
          style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: amtSize, letterSpacing: TRACK.display, color: COLORS.paper, lineHeight: 0.9, transformOrigin: "right center" }}
        />
      ) : (
        <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: amtSize, letterSpacing: TRACK.display, color: COLORS.paper, lineHeight: 0.9, whiteSpace: "nowrap" }}>{amount}</span>
      )}
    </div>
  );
};

// ── TermsLedger — the deal TERMS as a labeled ledger. Each row lands on its
//    figure's spoken word; the `hero` row counts up. Non-additive (each figure
//    stands alone) — the single-deal cousin of DealLedgerV. (ink) ─────────────
export const TermsLedger: React.FC<Win & {
  kicker: string;
  rows: { label: string; amount?: string; word: string; hero?: boolean; count?: { value: number; decimals: number; prefix?: string; suffix?: string; durationMs?: number } }[];
  width?: number;
}> = ({ from, to, kicker, rows, width = 1180 }) => {
  const vis = useVis(from, to);
  const k = usePop(from + 200, { rise: 14 });
  const onsets = rows.map((r, i) => cue(r.word, from + 1500 + i * 2500, from));
  return (
    <AbsoluteFill style={{ opacity: vis, justifyContent: "center", alignItems: "center", padding: "0 120px" }}>
      <div style={{ width: Math.min(width, 1400) }}>
        <div style={{ ...k, marginBottom: 22 }}><div style={caps(INK_SUB)}>{kicker}</div></div>
        {rows.map((r, i) => (
          <TermsRow key={i} label={r.label} amount={r.amount} count={r.count} hero={r.hero} appearMs={onsets[i]} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ── AssetDossier — a drug "spec sheet": a big molecule plate on the LEFT, the
//    asset name + a labelled spec list on the RIGHT whose rows slide in one-by-one
//    on their spoken cue. A two-column dossier — deliberately NOT the centred
//    kicker/headline/chip-row of BulletChips, so adjacent asset beats don't twin.
//    (ink or paper) ─────────────────────────────────────────────────────────────
const DossierRow: React.FC<{ label: string; value: string; appearMs: number; fg: string; sub: string; line: string }> = ({ label, value, appearMs, fg, sub, line }) => {
  // ABSENT until its value is spoken, then the whole row POPS in on that exact
  // frame (fade + rise + a small scale slam). No ambient motion — a clean,
  // VO-synced reveal: the row simply appears the moment the word is voiced.
  const pop = usePop(appearMs, { rise: 30, scale: true });
  return (
    <div style={{ opacity: pop.opacity, transform: pop.transform, display: "flex", alignItems: "center", gap: 26, padding: "20px 0", borderBottom: `2px solid ${line}` }}>
      <div style={{ width: 4, height: 46, background: fg, borderRadius: 2, flexShrink: 0 }} />
      <span style={{ ...caps(sub, TYPE.labelSm), width: 166, flexShrink: 0 }}>{label}</span>
      <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: V ? 40 : 48, letterSpacing: TRACK.headline, color: fg }}>{value}</span>
    </div>
  );
};

export const AssetDossier: React.FC<Win & {
  kicker: string;
  name: string;
  Icon: IconC;
  specs: { label: string; value: string; word: string }[];
  bg?: "ink" | "paper";
  cues?: { name?: string };
}> = ({ from, to, kicker, name, Icon, specs, bg = "ink", cues }) => {
  const ms = useMs();
  const vis = useVis(from, to);
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const sub = bg === "ink" ? INK_SUB : COLORS.grayText;
  const line = bg === "ink" ? "rgba(255,255,255,0.14)" : COLORS.border;
  const k = usePop(from + 200, { rise: 14 });
  const nameOn = cue(cues?.name, from + 3500, from);
  const nm = usePop(nameOn, { rise: 22, scale: true });
  const plate = usePop(from + 500, { rise: 22, scale: true });
  // afterMs=nameOn: specs are voiced AFTER the name, and this skips short words
  // like "a"/"on" earlier in the beat that a bidirectional startsWith would grab.
  const onsets = specs.map((s, i) => cue(s.word, nameOn + 1600 + i * 1800, nameOn));
  // continuous life on the plate: a slow rotation, a gentle breathe, and an accent
  // dot orbiting the molecule — so the scene never freezes on the held frame.
  const rot = interpolate(ms, [from, to], [0, 18], CLAMP);
  const breathe = 1 + 0.03 * Math.sin((ms - from) / 800);
  const orbA = (ms - from) / 1100;
  const ox = Math.cos(orbA) * 150;
  const oy = Math.sin(orbA) * 150;
  // an accent bar draws in under the name, just after it lands
  const nameBar = clamp01(interpolate(ms, [nameOn + 350, nameOn + 1150], [0, 1], CLAMP));
  return (
    <AbsoluteFill style={{ opacity: vis, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 100, padding: "0 150px" }}>
      {/* left — the drug plate (molecule breathing + rotating, an accent dot orbiting) */}
      <div style={{ ...plate, position: "relative", width: 420, height: 420, border: `2px solid ${line}`, borderRadius: 18, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, overflow: "hidden" }}>
        <div style={{ transform: `rotate(${rot}deg) scale(${breathe})` }}>
          <Icon size={216} color={fg} />
        </div>
        <div style={{ position: "absolute", left: `calc(50% + ${ox}px)`, top: `calc(50% + ${oy}px)`, transform: "translate(-50%, -50%)", width: 14, height: 14, borderRadius: 14, background: fg, opacity: 0.5 }} />
      </div>
      {/* right — name + accent bar + spec list */}
      <div style={{ flex: 1, maxWidth: 840 }}>
        <div style={k}><div style={caps(sub)}>{kicker}</div></div>
        <div style={{ ...nm, marginTop: 10 }}>
          <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: V ? 92 : 112, letterSpacing: TRACK.display, color: fg, lineHeight: 1 }}>{name}</div>
        </div>
        <div style={{ height: 6, width: nameBar * 300, background: fg, marginTop: 20, borderRadius: 3 }} />
        <div style={{ marginTop: 34 }}>
          {specs.map((s, i) => (
            <DossierRow key={i} label={s.label} value={s.value} appearMs={onsets[i]} fg={fg} sub={sub} line={line} />
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── PhaseTracker — a clinical-development track (Phase 1 → 2 → 3) with the current
//    phase highlighted, a fill line drawing to it on cue, then indication/result
//    facts. A pipeline-stage viz — a different shape from chips/dossier so adjacent
//    asset beats don't twin. (ink or paper) ────────────────────────────────────
/** `edge` aligns the FIRST label's left edge and the LAST label's right edge to
 *  their dot instead of centring on it. A centred end-label overhangs its anchor
 *  by half its width, which walks straight off a 1080-wide frame (caught on the
 *  BioVie vertical long-form, 2026-08-07: "PHASE 3" was clipped). translateX(±50%)
 *  is relative to the span's OWN width, so this needs no measurement. */
const PhaseDot: React.FC<{ label: string; xPct: number; appearMs: number; active: boolean; fg: string; sub: string; edge?: "start" | "end" }> = ({ label, xPct, appearMs, active, fg, sub, edge }) => {
  const ms = useMs();
  const pop = usePop(appearMs, { rise: 0, scale: true });
  const wob = 0.5 + 0.5 * Math.sin(ms / 300);
  const pulse = active ? 1 + 0.55 * wob : 1;
  const ringOp = active ? 0.15 + 0.4 * wob : 0;
  const size = active ? 30 : 20;
  return (
    <div style={{ position: "absolute", left: `${xPct}%`, top: 0, width: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
      <div style={{ position: "relative", width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", ...pop }}>
        {active ? <div style={{ position: "absolute", width: 36, height: 36, borderRadius: "50%", border: `2px solid ${fg}`, opacity: ringOp, transform: `scale(${pulse})` }} /> : null}
        <div style={{ width: size, height: size, borderRadius: "50%", background: fg }} />
      </div>
      <span
        style={{
          ...caps(active ? fg : sub, 22),
          fontWeight: active ? 700 : 600,
          whiteSpace: "nowrap",
          transform: edge === "start" ? "translateX(50%)" : edge === "end" ? "translateX(-50%)" : undefined,
        }}
      >
        {label}
      </span>
    </div>
  );
};

const PhaseFact: React.FC<{ label: string; value: string; appearMs: number; fg: string; sub: string; line: string }> = ({ label, value, appearMs, fg, sub, line }) => {
  const ms = useMs();
  const p = clamp01(interpolate(ms, [appearMs, appearMs + 500], [0, 1], CLAMP));
  const x = interpolate(p, [0, 1], [64, 0], CLAMP);
  return (
    <div style={{ opacity: p, transform: `translateX(${x}px)`, display: "flex", alignItems: "baseline", gap: 30, padding: "18px 0", borderBottom: `2px solid ${line}` }}>
      <span style={{ ...caps(sub, TYPE.labelSm), width: 176, flexShrink: 0 }}>{label}</span>
      <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: V ? 38 : 44, letterSpacing: TRACK.headline, color: fg }}>{value}</span>
    </div>
  );
};

export const PhaseTracker: React.FC<Win & {
  kicker: string;
  name: string;
  phases: string[];
  activeIndex: number;
  facts: { label: string; value: string; word: string }[];
  bg?: "ink" | "paper";
  cues?: { name?: string; draw?: string };
}> = ({ from, to, kicker, name, phases, activeIndex, facts, bg = "paper", cues }) => {
  const ms = useMs();
  const vis = useVis(from, to);
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const sub = bg === "ink" ? INK_SUB : COLORS.grayText;
  const track = bg === "ink" ? "rgba(255,255,255,0.16)" : COLORS.border;
  const k = usePop(from + 200, { rise: 14 });
  const nameOn = cue(cues?.name, from + 1500, from);
  const nm = usePop(nameOn, { rise: 22, scale: true });
  const n = phases.length;
  const activePct = n > 1 ? (activeIndex / (n - 1)) * 100 : 0;
  const drawOn = cue(cues?.draw, nameOn + 1200, from);
  const draw = clamp01(interpolate(ms, [drawOn, drawOn + 1400], [0, 1], CLAMP));
  const factOnsets = facts.map((f, i) => cue(f.word, drawOn + 1800 + i * 1600, nameOn));
  // ⚠️ portrait: 150px side padding leaves only 780px for a 900px rail, so the
  // track ran off-frame. 90px gives exactly 900 at 1080 wide.
  return (
    <AbsoluteFill style={{ opacity: vis, justifyContent: "center", padding: V ? "0 90px" : "0 150px" }}>
      <div style={k}><div style={caps(sub)}>{kicker}</div></div>
      <div style={{ ...nm, marginTop: 10 }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: V ? 92 : 112, letterSpacing: TRACK.display, color: fg, lineHeight: 1 }}>{name}</div>
      </div>
      {/* the phase track — base line + drawing fill + dots */}
      <div style={{ position: "relative", width: 900, height: 96, marginTop: 62 }}>
        <div style={{ position: "absolute", top: 19, left: 0, right: 0, height: 3, background: track, borderRadius: 2 }} />
        <div style={{ position: "absolute", top: 19, left: 0, width: `${draw * activePct}%`, height: 3, background: fg, borderRadius: 2 }} />
        {phases.map((p, i) => {
          const xPct = n > 1 ? (i / (n - 1)) * 100 : 50;
          const reachFrac = activePct === 0 ? 1 : xPct / activePct;
          const dotOn = i <= activeIndex ? drawOn + reachFrac * 1400 : to + 1;
          return <PhaseDot key={i} label={p} xPct={xPct} appearMs={dotOn} active={i === activeIndex} fg={fg} sub={sub} edge={i === 0 ? "start" : i === n - 1 ? "end" : undefined} />;
        })}
      </div>
      {/* facts */}
      <div style={{ marginTop: 42, maxWidth: 900 }}>
        {facts.map((f, i) => <PhaseFact key={i} label={f.label} value={f.value} appearMs={factOnsets[i]} fg={fg} sub={sub} line={track} />)}
      </div>
    </AbsoluteFill>
  );
};

// ── StepBars — two (or more) magnitudes compared as GROWING bars: each bar sweeps
//    out to its length on its spoken cue while the amount counts up, so "double the
//    size" is enacted, not stated. A bar's length is value/maxValue. (ink or paper)
const StepBarRow: React.FC<{ label: string; sub?: string; value: number; decimals: number; prefix?: string; suffix?: string; onset: number; frac: number; full: number; fg: string; dim: string; track: string; tag?: string; barColor?: string }> = ({ label, sub, value, decimals, prefix, suffix, onset, frac, full, fg, dim, track, tag, barColor }) => {
  const ms = useMs();
  const grow = clamp01(interpolate(ms, [onset, onset + 950], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) }));
  const lab = usePop(onset - 150, { rise: 16 });
  const tg = usePop(onset + 900, { rise: 12, scale: true });
  return (
    <div style={{ marginBottom: 46 }}>
      <div style={{ ...lab, display: "flex", alignItems: "baseline", gap: 18, marginBottom: 16 }}>
        <span style={{ fontFamily: SANS, fontWeight: 600, fontSize: 42, letterSpacing: TRACK.body, color: fg }}>{label}</span>
        {sub ? <span style={caps(dim)}>{sub}</span> : null}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
        <div style={{ position: "relative", height: 54, width: full, background: track, borderRadius: 8 }}>
          <div style={{ position: "absolute", left: 0, top: 0, height: 54, width: grow * frac * full, background: barColor ?? fg, borderRadius: 8 }} />
        </div>
        <CountUp fromMs={onset} toMs={onset + 950} value={value} decimals={decimals} prefix={prefix} suffix={suffix}
          style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 72, letterSpacing: TRACK.display, color: fg, lineHeight: 1, minWidth: 190 }} />
        {tag ? <div style={tg}><div style={{ padding: "8px 20px", border: `2px solid ${fg}`, borderRadius: 4, ...caps(fg, TYPE.labelSm) }}>{tag}</div></div> : null}
      </div>
    </div>
  );
};

// ── WatchList — a numbered "what to watch" closer: each item (NN + line) reveals
//    on its spoken cue. Forward-looking, distinct from chips. (ink or paper) ─────
const WatchItem: React.FC<{ n: number; line: string; sub?: string; appearMs: number; subMs?: number; fg: string; dim: string; sep: string; Icon?: IconC; num?: string }> = ({ n, line, sub, appearMs, subMs, fg, dim, sep, Icon, num }) => {
  const pop = usePop(appearMs, { rise: 30 });
  // the sub-line is a SECOND reveal on its own cue, so an item that has to hold
  // for many seconds while the VO elaborates keeps developing instead of freezing
  const subPop = usePop(subMs ?? appearMs + 500, { rise: 12 });
  return (
    <div style={{ opacity: pop.opacity, transform: pop.transform, display: "flex", alignItems: sub ? "flex-start" : "center", gap: 30, padding: "26px 0", borderBottom: `2px solid ${sep}` }}>
      <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 52, letterSpacing: TRACK.display, color: num ?? dim, minWidth: 84 }}>{String(n).padStart(2, "0")}.</span>
      {Icon ? <IconMotion Icon={Icon} onset={appearMs + 160} size={54} color={fg} breathe /> : null}
      <div>
        <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: V ? 50 : 62, letterSpacing: TRACK.headline, color: fg, lineHeight: 1.08 }}>{line}</span>
        {sub ? (
          <div style={{ ...subPop, marginTop: 14 }}>
            <span style={{ fontFamily: SANS, fontWeight: 500, fontSize: V ? 28 : 34, letterSpacing: TRACK.body, color: dim, lineHeight: 1.26 }}>{sub}</span>
          </div>
        ) : null}
      </div>
    </div>
  );
};

// items may carry an optional animated line-icon (kit/icons) that pops beside the number.
export const WatchList: React.FC<Win & {
  kicker: string;
  items: { line: string; word: string; Icon?: IconC; ms?: number; sub?: string; subWord?: string; subMs?: number }[];
  bg?: "ink" | "paper";
}> = ({ from, to, kicker, items, bg = "ink" }) => {
  const acc = useAccent(); // numerals in the accent: p4-page's "01." story numbering
  const vis = useVis(from, to);
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const dim = bg === "ink" ? INK_SUB : COLORS.grayText;
  const sep = bg === "ink" ? "rgba(255,255,255,0.14)" : COLORS.border;
  const k = usePop(from + 200, { rise: 14 });
  // per-item `ms` overrides the cue word (can LEAD the voice)
  const onsets = items.map((it, i) => it.ms ?? cue(it.word, from + 2000 + i * 4000, from));
  const subOns = items.map((it, i) => it.subMs ?? (it.subWord ? cue(it.subWord, onsets[i] + 900, onsets[i]) : undefined));
  return (
    <AbsoluteFill style={{ opacity: vis, justifyContent: "center", padding: "0 150px" }}>
      <div style={{ ...k, marginBottom: 30 }}><div style={caps(dim)}>{kicker}</div></div>
      {items.map((it, i) => <WatchItem key={i} n={i + 1} line={it.line} sub={it.sub} Icon={it.Icon} appearMs={onsets[i]} subMs={subOns[i]} fg={fg} dim={dim} sep={sep} num={acc} />)}
    </AbsoluteFill>
  );
};

export const StepBars: React.FC<Win & {
  kicker: string;
  rows: { label: string; sub?: string; value: number; decimals: number; prefix?: string; suffix?: string; word: string; tag?: string }[];
  maxValue: number;
  bg?: "ink" | "paper";
  /** which row's bar carries the accent (card look: the ONE red bar). Defaults to
   *  the LAST row — the "becomes" row a StepBars usually builds toward. -1 = none. */
  accentIndex?: number;
}> = ({ from, to, kicker, rows, maxValue, bg = "ink", accentIndex }) => {
  const acc = useAccent();
  const hot = accentIndex ?? rows.length - 1;
  const vis = useVis(from, to);
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const dim = bg === "ink" ? INK_SUB : COLORS.grayText;
  const track = bg === "ink" ? "rgba(255,255,255,0.12)" : COLORS.panel;
  const k = usePop(from + 200, { rise: 14 });
  // portrait fix (2026-09-22, pre-existing): 150 + 760 + the count-up overflowed 1080 wide
  const full = V ? 520 : 760;
  const onsets = rows.map((r, i) => cue(r.word, from + 2500 + i * 3500, from));
  return (
    <AbsoluteFill style={{ opacity: vis, justifyContent: "center", padding: V ? "0 84px" : "0 150px" }}>
      <div style={{ ...k, marginBottom: 46 }}><div style={caps(dim)}>{kicker}</div></div>
      {rows.map((r, i) => (
        <StepBarRow key={i} label={r.label} sub={r.sub} value={r.value} decimals={r.decimals} prefix={r.prefix} suffix={r.suffix} tag={r.tag} onset={onsets[i]} frac={r.value / maxValue} full={full} fg={fg} dim={dim} track={track} barColor={i === hot ? acc : undefined} />
      ))}
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// NEW (FDA H1 Scorecard longform, 2026-07-10). A vertical-first set for a
// data-editorial reel: centered-monumental stats, a two-track show-don't-tell,
// an animated broadcast mark, and animated line-icons. Portrait-first but
// bg-aware + format-aware so they read on ink or paper, vertical or landscape.
//   • IconMotion  — a line-icon that pops on cue + keeps a gentle continuous life
//   • SignalPing  — an ANIMATED broadcast mark (rings ping outward on a loop)
//   • HeroStat    — a CENTERED monumental count-up hook (portrait cousin of CountUpHero)
//   • TwoNameStat — two entities stamp in, then a combined figure counts up
//   • HoldLine    — two-track contrast: a broken/dim track vs a solid/bright one
//   • FlowStamp   — a lead line flows word-by-word, then a payoff phrase STAMPS
//                   at a chosen ms/cue (an explicit ms can LEAD the voice)
// Craft notes that shaped them (Nel): vertical heroes are CENTERED, not
// left-aligned/top-heavy; convey instability with STATE (dim/broken/fade),
// never literal jitter/wobble — that reads as a bug.
// ═══════════════════════════════════════════════════════════════════════════

// ── IconMotion — an editorial line-icon (kit/icons) that POPS in on its cue
//    (fade + scale) then keeps a gentle continuous life (a slow breathe, optional
//    slow spin) so it never freezes. Wrap any IconC. ───────────────────────────
export const IconMotion: React.FC<{
  Icon: IconC;
  onset: number;
  size?: number;
  color?: string;
  breathe?: boolean;
  spin?: boolean;
}> = ({ Icon, onset, size = 48, color, breathe = true, spin = false }) => {
  const ms = useMs();
  const appear = clamp01(interpolate(ms, [onset, onset + 320], [0, 1], CLAMP));
  const inS = interpolate(appear, [0, 1], [0.55, 1], CLAMP);
  const br = breathe ? 1 + 0.05 * Math.sin((ms - onset) / 430) : 1;
  const rot = spin ? ((ms - onset) / 1000) * 6 : 0;
  return (
    <div style={{ opacity: appear, display: "inline-flex", transform: `scale(${inS * br}) rotate(${rot}deg)` }}>
      <Icon size={size} color={color} />
    </div>
  );
};

// ── SignalPing — an ANIMATED broadcast mark: concentric rings ping outward and
//    fade on a loop around a solid core. A living alternative to the static
//    IconSignal glyph (e.g. a "signal" beat). ─────────────────────────────────
export const SignalPing: React.FC<{ onset: number; size?: number; color?: string }> = ({ onset, size = 150, color = COLORS.paper }) => {
  const ms = useMs();
  const t = Math.max(0, (ms - onset) / 1000);
  const appear = clamp01(interpolate(ms, [onset, onset + 300], [0, 1], CLAMP));
  const rings = [0, 0.55, 1.1].map((delay) => {
    const local = t - delay;
    if (local < 0) return { scale: 0.4, op: 0 };
    const p = (local % 1.6) / 1.6;
    return { scale: 0.4 + p * 1.15, op: (1 - p) * 0.7 };
  });
  return (
    <div style={{ position: "relative", width: size, height: size, display: "flex", alignItems: "center", justifyContent: "center", opacity: appear }}>
      {rings.map((r, i) => (
        <div key={i} style={{ position: "absolute", width: size, height: size, borderRadius: "50%", border: `2px solid ${color}`, opacity: r.op, transform: `scale(${r.scale})` }} />
      ))}
      <div style={{ width: 18, height: 18, borderRadius: "50%", background: color }} />
    </div>
  );
};

// ── HeroStat — a CENTERED, monumental count-up hook that owns the whole frame:
//    kicker → huge figure (on its spoken word) → drawn accent bar → line. The
//    portrait-first cousin of CountUpHero (which is left-aligned). bg-aware. ────
export const HeroStat: React.FC<Win & {
  kicker: string;
  value: number;
  word: string;
  line: string;
  lineCue?: string;
  /** explicit onset for the line, overriding lineCue. Needed when the natural cue
   *  word is spoken so late that the line lands inside the block's own fade-out
   *  (a payoff cannot land on the scene's last frame — 07-08). Use a pause in the
   *  VO instead. (Jazz × Actio long-form, 2026-08-12) */
  lineMs?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  size?: number;
  bg?: "ink" | "paper";
}> = ({ from, to, kicker, value, word, line, lineCue, lineMs, prefix, suffix, decimals = 0, size, bg = "ink" }) => {
  const acc = useAccent(); // card look: the ONE emphasis (red; white in the red world)
  const inkSub = useInkSub(); // 80% white in the red world (62% measures ~2.3:1 there)
  const ms = useMs();
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const sub = bg === "ink" ? inkSub : COLORS.grayText;
  const big = size ?? (V ? 440 : 300);
  const vis = clamp01(interpolate(ms, [from, from + 360, to - 320, to], [0, 1, 1, 0], CLAMP));
  const kick = usePop(from + 300, { rise: 14 });
  const numOn = cue(word, from + 3800, from);
  const barW = clamp01(interpolate(ms, [numOn + 850, numOn + 1650], [0, 1], CLAMP)) * (V ? 360 : 460);
  const lineOn = lineMs ?? cue(lineCue, numOn + 1250, from);
  const ln = usePop(lineOn, { rise: 18 });
  return (
    <AbsoluteFill style={{ opacity: vis, justifyContent: "center", alignItems: "center", textAlign: "center", padding: V ? "0 80px" : "0 160px" }}>
      <div style={kick}><div style={caps(sub)}>{kicker}</div></div>
      <CountUp fromMs={numOn} toMs={numOn + 1100} value={value} decimals={decimals} prefix={prefix} suffix={suffix}
        style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: big, letterSpacing: TRACK.display, color: fg, lineHeight: 0.9, marginTop: 30 }} />
      <div style={{ height: 8, width: barW, background: acc, marginTop: 22, borderRadius: 0 }} />
      <div style={{ ...ln, marginTop: 36 }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: V ? 56 : 52, letterSpacing: TRACK.headline, color: fg, lineHeight: 1.14, maxWidth: V ? 840 : 1200 }}>{line}</div>
      </div>
    </AbsoluteFill>
  );
};

// ── TwoNameStat — two entities (sponsors, partners…) stamp in on their spoken
//    names, then a combined figure counts up beneath a rule. Optional animated
//    Icon above the kicker. bg-aware. (the "AZ + J&J → 11 of 79" beat) ──────────
export const TwoNameStat: React.FC<Win & {
  kicker: string;
  name1: string;
  word1: string;
  name2: string;
  word2: string;
  value: number;
  valueWord: string;
  label: string;
  connector?: string;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  Icon?: IconC;
  bg?: "ink" | "paper";
}> = ({ from, to, kicker, name1, word1, name2, word2, value, valueWord, label, connector = "and", prefix, suffix, decimals = 0, Icon, bg = "paper" }) => {
  const inkSub = useInkSub(); // 80% white in the red world (62% measures ~2.3:1 there)
  const ms = useMs();
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const sub = bg === "ink" ? inkSub : COLORS.grayText;
  const rule = bg === "ink" ? "rgba(255,255,255,0.22)" : COLORS.border;
  const vis = clamp01(interpolate(ms, [from, from + 360, to - 320, to], [0, 1, 1, 0], CLAMP));
  const k = usePop(from + 200, { rise: 14 });
  const n1On = cue(word1, from + 1000, from);
  const n1 = usePop(n1On, { rise: 20, scale: true });
  const n2On = cue(word2, from + 3000, from);
  const conn = usePop(n2On - 300, { rise: 10 });
  const n2 = usePop(n2On, { rise: 20, scale: true });
  const numOn = cue(valueWord, from + 5000, from);
  const barW = clamp01(interpolate(ms, [numOn - 250, numOn + 550], [0, 1], CLAMP)) * 320;
  const lbl = usePop(numOn + 250, { rise: 12 });
  const nameStyle: React.CSSProperties = { fontFamily: DISPLAY, fontWeight: 700, fontSize: V ? 74 : 84, letterSpacing: TRACK.headline, color: fg, lineHeight: 1.04 };
  return (
    <AbsoluteFill style={{ opacity: vis, justifyContent: "center", alignItems: "center", textAlign: "center", padding: V ? "0 90px" : "0 160px" }}>
      {Icon ? <div style={{ marginBottom: 22 }}><IconMotion Icon={Icon} onset={from + 300} size={58} color={sub} breathe /></div> : null}
      <div style={k}><div style={caps(sub)}>{kicker}</div></div>
      <div style={{ ...n1, marginTop: 30 }}><div style={nameStyle}>{name1}</div></div>
      <div style={{ ...conn, margin: "16px 0" }}><div style={caps(sub)}>{connector}</div></div>
      <div style={n2}><div style={nameStyle}>{name2}</div></div>
      <div style={{ height: 3, width: barW, background: rule, margin: "44px 0 4px" }} />
      <CountUp fromMs={numOn} toMs={numOn + 1000} value={value} decimals={decimals} prefix={prefix} suffix={suffix}
        style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: V ? 300 : 260, letterSpacing: TRACK.display, color: fg, lineHeight: 0.9, marginTop: 8 }} />
      <div style={{ ...lbl, marginTop: 10 }}><div style={caps(sub)}>{label}</div></div>
    </AbsoluteFill>
  );
};

// ── HoldLine — SHOW-DON'T-TELL as a TWO-TRACK contrast: a "loser" metric renders
//    as a broken/dashed DIM track, the "winner" as a solid BRIGHT bar that fills
//    and holds; then a payoff STAMPS. Convey instability with STATE (broken, dim,
//    fading), never literal jitter (Nel, 2026-07-10). (ink) ────────────────────
export const HoldLine: React.FC<Win & {
  kicker: string;
  topLabel: string;
  topState: string;
  topWord: string;
  botLabel: string;
  botState: string;
  botWord: string;
  payoff: string;
  payoffWord: string;
  payoffMs?: number; // explicit onset ms for the payoff stamp (overrides payoffWord; can LEAD the voice)
}> = ({ from, to, kicker, topLabel, topState, topWord, botLabel, botState, botWord, payoff, payoffWord, payoffMs }) => {
  const ms = useMs();
  const vis = clamp01(interpolate(ms, [from, from + 360, to - 320, to], [0, 1, 1, 0], CLAMP));
  const k = usePop(from + 200, { rise: 14 });
  const full = V ? 780 : 1080;
  const topOn = cue(topWord, from + 1400, from);
  const botOn = cue(botWord, from + 3000, from);
  const crackOn = payoffMs ?? cue(payoffWord, from + 4400, from);
  const topAppear = clamp01(interpolate(ms, [topOn, topOn + 320], [0, 1], CLAMP));
  const topDim = interpolate(ms, [botOn, botOn + 700], [0.55, 0.32], CLAMP);
  const botAppear = clamp01(interpolate(ms, [botOn, botOn + 320], [0, 1], CLAMP));
  const draw = clamp01(interpolate(ms, [botOn, botOn + 950], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) }));
  const stamp = useStamp(crackOn);
  const rowLabel = (color: string): React.CSSProperties => ({ fontFamily: SANS, fontWeight: 600, fontSize: 34, letterSpacing: TRACK.body, color });
  return (
    <AbsoluteFill style={{ opacity: vis, justifyContent: "center", alignItems: "center", textAlign: "center" }}>
      <div style={{ width: full }}>
        <div style={{ ...k, marginBottom: 66 }}><div style={caps(INK_SUB)}>{kicker}</div></div>
        {/* top track — the "loser": broken/dashed, dim */}
        <div style={{ opacity: topAppear }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 18 }}>
            <span style={rowLabel(INK_SUB)}>{topLabel}</span>
            <span style={{ ...caps(INK_SUB), opacity: topAppear }}>{topState}</span>
          </div>
          <div style={{ height: 16, borderRadius: 3, opacity: topDim, backgroundImage: `repeating-linear-gradient(90deg, ${INK_SUB} 0 30px, transparent 30px 56px)`, backgroundSize: `${full}px 16px` }} />
        </div>
        {/* bottom track — the "winner": solid, bright, fills on cue */}
        <div style={{ marginTop: 60, opacity: botAppear }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 18 }}>
            <span style={rowLabel(COLORS.paper)}>{botLabel}</span>
            <span style={{ ...caps(COLORS.paper), opacity: draw }}>{botState}</span>
          </div>
          <div style={{ position: "relative", height: 16, borderRadius: 3, background: "rgba(255,255,255,0.12)" }}>
            <div style={{ position: "absolute", left: 0, top: 0, height: 16, width: draw * full, background: COLORS.paper, borderRadius: 3 }} />
          </div>
        </div>
        <div style={{ marginTop: 74, ...stamp }}>
          <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: V ? 100 : 120, letterSpacing: TRACK.display, color: COLORS.paper, lineHeight: 1 }}>{payoff}</div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── FlowStamp — a lead line flows in word-by-word on its spoken frames, then an
//    emphasized payoff phrase STAMPS — locked to a spoken cue word, or to an
//    explicit ms (which can LEAD the voice for anticipation). bg-aware. ─────────
export const FlowStamp: React.FC<Win & {
  lead: string;
  emphasis: string;
  emphasisCue?: string;
  emphasisMs?: number;
  bg?: "ink" | "paper";
  /** payoff size override — a long emphasis phrase overflows the default display size */
  size?: number;
  /** lead size override */
  leadSize?: number;
}> = ({ from, to, lead, emphasis, emphasisCue, emphasisMs, bg = "ink", size, leadSize }) => {
  const acc = useAccent(); // card look: the ONE emphasis (red; white in the red world)
  const inkSub = useInkSub(); // the muted lead must not fade out on red (07-20 failure)
  const ms = useMs();
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const sub = bg === "ink" ? inkSub : COLORS.grayText;
  const vis = clamp01(interpolate(ms, [from, from + 300, to - 260, to], [0, 1, 1, 0], CLAMP));
  const toks = lead.split(/\s+/).filter(Boolean);
  const onsets = cueSeq(toks, from, to).map((m) => m ?? from + 200);
  const leadStyle: React.CSSProperties = { fontFamily: DISPLAY, fontWeight: 600, fontSize: leadSize ?? (V ? 58 : 56), letterSpacing: TRACK.headline, color: sub, lineHeight: 1.14, marginRight: "0.26em" };
  const empOn = emphasisMs ?? cue(emphasisCue, from + 2500, from);
  const emp = usePop(empOn, { rise: 22, scale: true });
  const barW = clamp01(interpolate(ms, [empOn + 160, empOn + 980], [0, 1], CLAMP)) * 320;
  return (
    <AbsoluteFill style={{ opacity: vis, justifyContent: "center", alignItems: "center", textAlign: "center", padding: V ? "0 96px" : "0 160px" }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", maxWidth: V ? 880 : 1300 }}>
        {toks.map((tk, i) => <FlowWord key={i} text={tk} onsetMs={onsets[i]} style={leadStyle} />)}
      </div>
      <div style={{ ...emp, marginTop: 46 }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: size ?? (V ? 120 : 132), letterSpacing: TRACK.display, color: fg, lineHeight: 1 }}>{emphasis}</div>
      </div>
      <div style={{ height: 6, width: barW, background: acc, marginTop: 24, borderRadius: 0 }} />
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// NEW (First Oral PCSK9 longform, 2026-07-18). A show-don't-tell block for the
// "an injectable class becomes a pill" story:
//   • PillSwap — a dim syringe (the old injectable class) hands off along a drawn
//     arrow to a BRIGHT pill (the new oral dose) that pops on its spoken cue; an
//     FDA-APPROVED badge stamps, and the headline resolves with a highlighted
//     phrase. Enacts the category shift instead of typesetting it. (paper)
// ═══════════════════════════════════════════════════════════════════════════
export const PillSwap: React.FC<Win & {
  kicker?: string;
  badge?: string;
  oldLabel: string;
  newLabel: string;
  headline: string;
  highlight?: string; // a substring of `headline` to weight-emphasize
  cues?: { approve?: string; pill?: string; injectable?: string; first?: string };
}> = ({ from, to, kicker, badge, oldLabel, newLabel, headline, highlight, cues }) => {
  const ms = useMs();
  const vis = useVis(from, to);
  const k = usePop(from + 200, { rise: 14 });
  const badgeOn = cue(cues?.approve, from + 900, from);
  const badgeS = useStamp(badgeOn);
  const pillOn = cue(cues?.pill, from + 3000, from);
  const pill = usePop(pillOn, { rise: 18, scale: true });
  const injOn = cue(cues?.injectable, Math.max(pillOn + 1400, from + 6000), pillOn);
  const synAppear = clamp01(interpolate(ms, [injOn, injOn + 340], [0, 1], CLAMP));
  const arrowW = clamp01(interpolate(ms, [injOn + 200, injOn + 1000], [0, 1], CLAMP)) * (V ? 150 : 190);
  const headOn = cue(cues?.first, from + 3800, from);
  const head = usePop(headOn, { rise: 22 });
  // The pill is centered alone, then TRAVELS right as the syringe joins so the
  // syringe→pill pair ends up centered. LEFT_RESERVE = the fixed width the
  // syringe+arrow occupy; SHIFT (half of that + the gap) is how far the pill
  // slides right so the whole pair re-centers.
  const LEFT_RESERVE = V ? 400 : 470;
  const GAP = V ? 24 : 34;
  const SHIFT = (LEFT_RESERVE + GAP) / 2;
  const rowShift = -(1 - synAppear) * SHIFT;
  const plate = (bright: boolean): React.CSSProperties => ({
    width: V ? 210 : 230, height: V ? 210 : 230, borderRadius: 20,
    border: `2px solid ${bright ? COLORS.ink : COLORS.border}`,
    background: bright ? COLORS.ink : "transparent",
    display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 16,
  });
  // split the headline so `highlight` renders heavier (the "first oral" emphasis)
  const idx = highlight ? headline.indexOf(highlight) : -1;
  const parts = idx >= 0
    ? [headline.slice(0, idx), headline.slice(idx, idx + (highlight as string).length), headline.slice(idx + (highlight as string).length)]
    : [headline];
  return (
    <AbsoluteFill style={{ opacity: vis, justifyContent: "center", alignItems: "center", textAlign: "center", padding: V ? "0 80px" : "0 160px" }}>
      {kicker ? <div style={{ ...k, marginBottom: 22 }}><div style={caps(COLORS.grayText)}>{kicker}</div></div> : null}
      {badge ? (
        <div style={{ ...badgeS, marginBottom: 54 }}>
          <div style={{ padding: "14px 30px", border: `2px solid ${COLORS.ink}`, borderRadius: 6, ...caps(COLORS.ink), fontWeight: 700 }}>{badge}</div>
        </div>
      ) : null}
      {/* the transform row: the pill starts centered alone, then travels right as
          the dim syringe (old injectable class) + drawn arrow fade in on the left,
          so the syringe→pill pair ends up centered. */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: GAP, transform: `translateX(${rowShift}px)` }}>
        <div style={{ width: LEFT_RESERVE, display: "flex", alignItems: "center", justifyContent: "flex-end", gap: V ? 14 : 22, opacity: synAppear }}>
          <div style={{ transform: `scale(${0.92 + 0.08 * synAppear})` }}>
            <div style={plate(false)}>
              <IconSyringe size={V ? 108 : 118} color={COLORS.grayText} sw={1.6} />
            </div>
            <div style={{ ...caps(COLORS.grayText, TYPE.labelSm), marginTop: 18 }}>{oldLabel}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", marginBottom: 40 }}>
            <svg width={arrowW + 14} height={22} style={{ display: "block", overflow: "visible" }}>
              <line x1={0} y1={11} x2={arrowW} y2={11} stroke={COLORS.grayText} strokeWidth={3} strokeLinecap="round" />
              <path d={`M ${arrowW - 10} 4 L ${arrowW + 2} 11 L ${arrowW - 10} 18`} fill="none" stroke={COLORS.grayText} strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
        <div style={{ ...pill }}>
          <div style={plate(true)}>
            <IconPill size={V ? 118 : 128} color={COLORS.paper} sw={1.7} />
          </div>
          <div style={{ ...caps(COLORS.ink, TYPE.labelSm), marginTop: 18, fontWeight: 700 }}>{newLabel}</div>
        </div>
      </div>
      {/* headline with the emphasized phrase heavier */}
      <div style={{ ...head, marginTop: 64 }}>
        <div style={{ fontFamily: DISPLAY, fontSize: V ? 76 : 88, letterSpacing: TRACK.headline, color: COLORS.ink, lineHeight: 1.05, maxWidth: V ? 900 : 1300 }}>
          {parts.length === 3 ? (
            <>
              <span style={{ fontWeight: 500 }}>{parts[0]}</span>
              <span style={{ fontWeight: 800 }}>{parts[1]}</span>
              <span style={{ fontWeight: 500 }}>{parts[2]}</span>
            </>
          ) : (
            <span style={{ fontWeight: 600 }}>{headline}</span>
          )}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── DealBrief — a VERTICAL-first M&A brief (added Eli Lilly × AtaiBeckley, 2026-07-21).
//    acquirer (dim) → a DRAWN down-arrow → target STAMPS on its cue → accent rule →
//    modality spec ROWS land on their spoken words. A different shape from
//    BulletChips' pill-stack, and unlike DealHeadline it does NOT re-count a price
//    (use it when the number already landed in the hook). bg-aware. ──────────────
const DealSpecRow: React.FC<{ label: string; value: string; appearMs: number; fg: string; sub: string; line: string; Icon?: IconC }> = ({ label, value, appearMs, fg, sub, line, Icon }) => {
  const pop = usePop(appearMs, { rise: 20 });
  return (
    <div style={{ ...pop, display: "flex", alignItems: "center", gap: 22, padding: "20px 4px", borderTop: `2px solid ${line}` }}>
      {Icon ? <div style={{ flexShrink: 0 }}><IconMotion Icon={Icon} onset={appearMs + 120} size={44} color={sub} breathe /></div> : null}
      <div style={{ textAlign: "left" }}>
        <div style={caps(sub)}>{label}</div>
        <div style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: V ? 56 : 48, letterSpacing: TRACK.headline, color: fg, lineHeight: 1.12, marginTop: 4 }}>{value}</div>
      </div>
    </div>
  );
};

export const DealBrief: React.FC<Win & {
  kicker?: string;
  acquirer?: string; // optional: acquirer name + a drawn down-arrow above the target
  target: string;
  specs: { label: string; value: string; word: string; Icon?: IconC }[];
  bg?: "ink" | "paper";
  /** target display size. The V?104 default fits ~13 glyphs in 1080; a two-word
   *  company name ("Actio Biosciences", 17) overflows silently. Budget 0.6em per
   *  glyph against 860px of padded width. (Jazz × Actio long-form, 2026-08-12) */
  targetSize?: number;
  cues: { target: string };
}> = ({ from, to, kicker, acquirer, target, specs, bg = "paper", targetSize, cues }) => {
  const ms = useMs();
  const vis = useVis(from, to);
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const sub = bg === "ink" ? INK_SUB : COLORS.grayText;
  const line = bg === "ink" ? "rgba(255,255,255,0.16)" : COLORS.border;
  const acq = usePop(from + 300, { rise: 14 });
  const tgtOn = cue(cues.target, from + 1500, from);
  const arrowDraw = clamp01(interpolate(ms, [tgtOn - 500, tgtOn + 80], [0, 1], CLAMP));
  const tgt = usePop(tgtOn, { rise: 24, scale: true });
  const ruleW = clamp01(interpolate(ms, [tgtOn + 350, tgtOn + 1150], [0, 1], CLAMP)) * (V ? 340 : 460);
  const onsets = specs.map((s, i) => cue(s.word, tgtOn + 1400 + i * 1600, tgtOn));
  return (
    <AbsoluteFill style={{ opacity: vis, justifyContent: "center", alignItems: "center", textAlign: "center", padding: V ? "0 110px" : "0 200px" }}>
      {kicker ? <div style={{ ...acq, marginBottom: 10 }}><div style={caps(sub)}>{kicker}</div></div> : null}
      {acquirer ? (
        <>
          <div style={acq}>
            <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: V ? 58 : 72, letterSpacing: TRACK.headline, color: sub, lineHeight: 1 }}>{acquirer}</div>
          </div>
          {/* down arrow — draws down as the target is about to land */}
          <svg width="44" height="72" viewBox="0 0 44 72" style={{ margin: "12px 0 4px", overflow: "visible" }}>
            <line x1="22" y1="2" x2="22" y2={2 + arrowDraw * 50} stroke={fg} strokeWidth="3" strokeLinecap="round" />
            <path d="M9 40 L22 54 L35 40" fill="none" stroke={fg} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" opacity={clamp01((arrowDraw - 0.68) / 0.32)} />
          </svg>
        </>
      ) : null}
      <div style={tgt}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: targetSize ?? (V ? 104 : 124), letterSpacing: TRACK.display, color: fg, lineHeight: 1 }}>{target}</div>
      </div>
      <div style={{ height: 6, width: ruleW, background: fg, marginTop: 22, borderRadius: 3 }} />
      <div style={{ marginTop: 22, width: V ? 720 : 900 }}>
        {specs.map((s, i) => (
          <DealSpecRow key={i} label={s.label} value={s.value} appearMs={onsets[i]} fg={fg} sub={sub} line={line} Icon={s.Icon} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ── FringeFrontier — SHOW-DON'T-TELL for a reversal (added Eli Lilly × AtaiBeckley,
//    2026-07-21). The `before` word renders DIM and gets STRUCK THROUGH on its cue;
//    then the `after` word STAMPS bright on the pivot cue, an accent bar draws, and
//    an optional tag lands. Enacts "fringe → frontier" instead of typesetting it.
//    Best over a dim FootageScrim on an ink world. bg-aware. ─────────────────────
export const FringeFrontier: React.FC<Win & {
  kicker?: string;
  before: string;
  after: string;
  tag?: string;
  beforeCue: string; // when the strike hits the `before` word
  afterCue: string;  // when the `after` word stamps (the pivot)
  afterMs?: number;  // explicit override for the stamp (can LEAD the voice)
  size?: number;     // override the big display size (default V?150:176) for longer phrases
  bg?: "ink" | "paper";
}> = ({ from, to, kicker, before, after, tag, beforeCue, afterCue, afterMs, size, bg = "ink" }) => {
  const acc = useAccent(); // card look: the ONE emphasis (red; white in the red world)
  const ms = useMs();
  const vis = useVis(from, to);
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const sub = bg === "ink" ? INK_SUB : COLORS.grayText;
  const k = usePop(from + 300, { rise: 14 });
  const bef = usePop(from + 550, { rise: 18 });
  const strikeOn = cue(beforeCue, from + 2600, from);
  const strikeP = clamp01(interpolate(ms, [strikeOn, strikeOn + 420], [0, 1], CLAMP));
  const befDim = interpolate(ms, [strikeOn, strikeOn + 520], [0.6, 0.32], CLAMP);
  const afterOn = afterMs ?? cue(afterCue, from + 5200, from);
  const stamp = useStamp(afterOn);
  const barW = clamp01(interpolate(ms, [afterOn + 200, afterOn + 1050], [0, 1], CLAMP)) * (V ? 300 : 420);
  const tg = usePop(afterOn + 380, { rise: 14 });
  const big: React.CSSProperties = { fontFamily: DISPLAY, fontWeight: 700, fontSize: size ?? (V ? 150 : 176), letterSpacing: TRACK.display, lineHeight: 1 };
  return (
    <AbsoluteFill style={{ opacity: vis, justifyContent: "center", alignItems: "center", textAlign: "center", padding: V ? "0 96px" : "0 160px" }}>
      {kicker ? <div style={{ ...k, marginBottom: 30 }}><div style={caps(sub)}>{kicker}</div></div> : null}
      {/* BEFORE — dim, struck through on its cue */}
      <div style={bef}>
        <div style={{ display: "inline-block", position: "relative", opacity: befDim }}>
          <div style={{ ...big, color: sub }}>{before}</div>
          <div style={{ position: "absolute", top: "52%", left: 0, height: 8, width: `${strikeP * 100}%`, background: sub, borderRadius: 4 }} />
        </div>
      </div>
      {/* AFTER — bright, stamps on the pivot */}
      <div style={{ ...stamp, marginTop: V ? 26 : 30 }}>
        <div style={{ ...big, color: fg }}>{after}</div>
      </div>
      <div style={{ height: 8, width: barW, background: acc, marginTop: 22, borderRadius: 0 }} />
      {tag ? <div style={{ ...tg, marginTop: 28 }}><div style={caps(sub)}>{tag}</div></div> : null}
    </AbsoluteFill>
  );
};

// ── SignalPayoff — a narration beat built as FLOW → PING → FLOW (added Eli Lilly ×
//    AtaiBeckley, 2026-07-21). A dim `lead` flows word-by-word (traces the setup),
//    an animated SignalPing fires on its cue (the "signal" mark), then the bright
//    `payoff` flows word-by-word. Both lines must be VERBATIM to the VO so the
//    per-word sync holds. bg-aware. ────────────────────────────────────────────
export const SignalPayoff: React.FC<Win & {
  lead: string;
  payoff: string;
  pingCue: string;
  bg?: "ink" | "paper";
}> = ({ from, to, lead, payoff, pingCue, bg = "paper" }) => {
  const vis = useVis(from, to);
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const sub = bg === "ink" ? INK_SUB : COLORS.grayText;
  const pingOn = cue(pingCue, from + 3000, from);
  const leadToks = lead.split(/\s+/).filter(Boolean);
  let lc = from;
  const leadOn = leadToks.map((tk) => { const m = cueMs(tk, lc); if (m !== undefined && m <= to) { lc = m + 1; return m; } return from + 200; });
  const payToks = payoff.split(/\s+/).filter(Boolean);
  let pc = pingOn;
  const payOn = payToks.map((tk) => { const m = cueMs(tk, pc); if (m !== undefined && m <= to) { pc = m + 1; return m; } return pingOn + 500; });
  const leadStyle: React.CSSProperties = { fontFamily: DISPLAY, fontWeight: 500, fontSize: V ? 46 : 48, letterSpacing: TRACK.body, color: sub, lineHeight: 1.2, marginRight: "0.24em" };
  const payStyle: React.CSSProperties = { fontFamily: DISPLAY, fontWeight: 700, fontSize: V ? 78 : 88, letterSpacing: TRACK.headline, color: fg, lineHeight: 1.1, marginRight: "0.22em" };
  return (
    <AbsoluteFill style={{ opacity: vis, justifyContent: "center", alignItems: "center", textAlign: "center", padding: V ? "0 96px" : "0 160px" }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", maxWidth: V ? 800 : 1100, marginBottom: 40 }}>
        {leadToks.map((tk, i) => <FlowWord key={i} text={tk} onsetMs={leadOn[i]} style={leadStyle} />)}
      </div>
      <div style={{ marginBottom: 40 }}><SignalPing onset={pingOn} size={130} color={fg} /></div>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", maxWidth: V ? 860 : 1200 }}>
        {payToks.map((tk, i) => <FlowWord key={i} text={tk} onsetMs={payOn[i]} style={payStyle} />)}
      </div>
    </AbsoluteFill>
  );
};

// ── VersusSplit — a SIDE-BY-SIDE thesis contrast (added Tempus×Personalis, 2026-07-22).
//    Two columns divided by a drawn vertical rule: the LOSER dims + gets STRUCK on its
//    cue on the left, the WINNER STAMPS bright on the right. Enacts "X loses, Y wins"
//    SPATIALLY — the one non-centered layout, so a thesis beat reads distinct from the
//    centered stat/flow beats around it. bg-aware, vertical-first. ──────────────────
export const VersusSplit: React.FC<Win & {
  kicker: string;
  left: { label: string; verdict: string };
  right: { label: string; verdict: string };
  leftCue: string;   // loser appears (then strikes ~0.7s later)
  rightCue: string;  // winner stamps (the pivot)
  rightMs?: number;  // explicit override for the winner stamp (can LEAD the voice)
  tag?: string;
  bg?: "ink" | "paper";
}> = ({ from, to, kicker, left, right, leftCue, rightCue, rightMs, tag, bg = "ink" }) => {
  const ms = useMs();
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const sub = bg === "ink" ? INK_SUB : COLORS.grayText;
  const rule = bg === "ink" ? "rgba(255,255,255,0.2)" : COLORS.border;
  const vis = clamp01(interpolate(ms, [from, from + 360, to - 320, to], [0, 1, 1, 0], CLAMP));
  const k = usePop(from + 200, { rise: 14 });
  const leftOn = cue(leftCue, from + 900, from);
  const leftPop = usePop(leftOn, { rise: 16 });
  const strikeOn = leftOn + 700;
  const strikeP = clamp01(interpolate(ms, [strikeOn, strikeOn + 360], [0, 1], CLAMP));
  const leftDim = interpolate(ms, [strikeOn, strikeOn + 500], [0.62, 0.34], CLAMP);
  const rightOn = rightMs ?? cue(rightCue, from + 3400, from);
  const stamp = useStamp(rightOn);
  const dividerH = clamp01(interpolate(ms, [leftOn + 200, leftOn + 1000], [0, 1], CLAMP)) * (V ? 250 : 210);
  const tg = usePop(rightOn + 420, { rise: 12 });
  const bigL: React.CSSProperties = { fontFamily: DISPLAY, fontWeight: 700, fontSize: V ? 58 : 76, letterSpacing: TRACK.headline, color: sub, lineHeight: 1.04 };
  const bigR: React.CSSProperties = { fontFamily: DISPLAY, fontWeight: 700, fontSize: V ? 70 : 92, letterSpacing: TRACK.display, color: fg, lineHeight: 1.04 };
  return (
    <AbsoluteFill style={{ opacity: vis, justifyContent: "center", alignItems: "center", textAlign: "center", padding: V ? "0 56px" : "0 160px" }}>
      <div style={{ ...k, marginBottom: V ? 74 : 60 }}><div style={caps(sub)}>{kicker}</div></div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "100%", maxWidth: V ? 960 : 1300 }}>
        {/* loser — dims + strikes on cue */}
        <div style={{ flex: 1, ...leftPop, opacity: leftPop.opacity * leftDim }}>
          <div style={{ ...caps(sub), marginBottom: 18 }}>{"✗ "}{left.verdict}</div>
          <div style={{ display: "inline-block", position: "relative" }}>
            <div style={bigL}>{left.label}</div>
            <div style={{ position: "absolute", top: "50%", left: 0, height: 6, width: `${strikeP * 100}%`, background: sub, borderRadius: 3 }} />
          </div>
        </div>
        {/* divider — draws down on cue */}
        <div style={{ width: 3, height: dividerH, background: rule, margin: "0 30px", alignSelf: "center" }} />
        {/* winner — stamps bright */}
        <div style={{ flex: 1, ...stamp }}>
          <div style={{ ...caps(fg), marginBottom: 18 }}>{"✓ "}{right.verdict}</div>
          <div style={bigR}>{right.label}</div>
        </div>
      </div>
      {tag ? <div style={{ ...tg, marginTop: V ? 64 : 54 }}><div style={caps(sub)}>{tag}</div></div> : null}
    </AbsoluteFill>
  );
};

// ── VerdictLedger — a thesis as an editorial SCORECARD (added Tempus×Personalis,
//    2026-07-22, replacing the glyph-heavy VersusSplit). Each row lands on its cue:
//    the LOSER recessive (dim, lighter, hairline under it), the WINNER dominant
//    (bold, bright, a drawn accent rule + its verdict STAMPS on cue). Contrast from
//    WEIGHT + SIZE + DIM only — no ✗/✓ marks, no bars (stays editorial, on-brand).
//    Vertical-first, bg-aware. ─────────────────────────────────────────────────────
const VerdictRow: React.FC<{
  label: string; verdict: string; win?: boolean; appearMs: number; verdictMs: number;
  bg: "ink" | "paper"; full: number; layout?: "row" | "stack";
}> = ({ label, verdict, win, appearMs, verdictMs, bg, full, layout = "row" }) => {
  const ms = useMs();
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const sub = bg === "ink" ? INK_SUB : COLORS.grayText;
  const hair = bg === "ink" ? "rgba(255,255,255,0.16)" : COLORS.border;
  const pop = usePop(appearMs, { rise: 20 });
  const vStamp = useStamp(verdictMs);
  const drawW = clamp01(interpolate(ms, [appearMs + 150, appearMs + 950], [0, 1], CLAMP)) * full;
  const labelCol = win ? fg : sub;

  // STACK — portrait-first: the verdict sits UNDER its label, both left-aligned,
  // so a long verdict never competes with the label for one line's width. (The
  // "row" default squeezes both onto a baseline, which crushes in 9:16.)
  if (layout === "stack") {
    return (
      <div style={{ ...pop, textAlign: "left", width: full }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: win ? (V ? 108 : 96) : (V ? 72 : 68), letterSpacing: TRACK.display, color: labelCol, lineHeight: 0.98 }}>{label}</div>
        <div style={{ ...(win ? vStamp : {}), transformOrigin: "left center", marginTop: win ? 16 : 12 }}>
          <span style={caps(win ? fg : sub, win ? 28 : 24)}>{verdict}</span>
        </div>
        <div style={{ height: win ? 5 : 2, width: win ? drawW : full, background: win ? fg : hair, borderRadius: win ? 3 : 0, marginTop: 20 }} />
      </div>
    );
  }

  return (
    <div style={{ ...pop }}>
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", padding: "20px 0" }}>
        <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: win ? (V ? 78 : 92) : (V ? 58 : 70), letterSpacing: TRACK.headline, color: labelCol, lineHeight: 1 }}>{label}</span>
        <span style={{ ...(win ? vStamp : {}), ...caps(win ? fg : sub, win ? 34 : 26) }}>{verdict}</span>
      </div>
      <div style={{ height: win ? 5 : 2, width: win ? drawW : full, background: win ? fg : hair, borderRadius: win ? 3 : 0 }} />
    </div>
  );
};

export const VerdictLedger: React.FC<Win & {
  kicker: string;
  rows: { label: string; verdict: string; win?: boolean; labelCue: string; labelMs?: number; verdictMs?: number }[];
  tag?: string;
  bg?: "ink" | "paper";
  /** "row" (default) puts label and verdict on one baseline; "stack" drops the
   *  verdict under its label, left-aligned — the portrait-safe reading. */
  layout?: "row" | "stack";
}> = ({ from, to, kicker, rows, tag, bg = "ink", layout = "row" }) => {
  const ms = useMs();
  const sub = bg === "ink" ? INK_SUB : COLORS.grayText;
  const vis = clamp01(interpolate(ms, [from, from + 360, to - 320, to], [0, 1, 1, 0], CLAMP));
  const k = usePop(from + 200, { rise: 14 });
  const full = V ? 830 : 1080;
  const appear = rows.map((r, i) => r.labelMs ?? cue(r.labelCue, from + 1000 + i * 1700, from));
  const verdictAt = rows.map((r, i) => r.verdictMs ?? appear[i] + 200);
  const tg = usePop(Math.max(...verdictAt) + 520, { rise: 12 });
  return (
    <AbsoluteFill style={{ opacity: vis, justifyContent: "center", alignItems: layout === "stack" ? "flex-start" : "center", textAlign: layout === "stack" ? "left" : "center", padding: V ? "0 60px" : "0 160px" }}>
      <div style={{ ...k, marginBottom: V ? 74 : 60 }}><div style={caps(sub)}>{kicker}</div></div>
      <div style={{ width: full, display: "flex", flexDirection: "column", gap: layout === "stack" ? (V ? 70 : 54) : (V ? 44 : 36) }}>
        {rows.map((r, i) => (
          <VerdictRow key={i} label={r.label} verdict={r.verdict} win={r.win}
            appearMs={appear[i]} verdictMs={verdictAt[i]} bg={bg} full={full} layout={layout} />
        ))}
      </div>
      {tag ? <div style={{ ...tg, marginTop: V ? 62 : 52 }}><div style={caps(sub)}>{tag}</div></div> : null}
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// NEW (BMS × NVIDIA longform, 2026-07-23). A news story whose subject is what
// ISN'T said — an undisclosed figure and a carefully-qualified claim:
//   • AbsentFigure — SHOW-DON'T-TELL for "no number was disclosed". Renders the
//     SAME bar-and-figure grammar as StepBars, but the slot is a dashed EMPTY
//     track that never fills and a figure that never resolves. The absence IS
//     the graphic. (Rhymes deliberately with a preceding StepBars/CountUp beat.)
//   • PullQuote — a quotation that SETS word-by-word on its spoken frames, with
//     ONE phrase drawing its own underline as it is voiced. The kit had no quote
//     block; a release-language beat needs the qualifier to mark itself.
// Both bg-aware + format-aware.
// ═══════════════════════════════════════════════════════════════════════════

// ── AbsentFigure — the number that was never given. A dashed, unfilled slot
//    breathes (opacity only — never jitter) while a stamp names the absence.
export const AbsentFigure: React.FC<Win & {
  kicker: string;
  /** the statement, e.g. "No investment figure was disclosed" */
  label: string;
  /** currency/unit glyph that sits before the empty slot */
  unit?: string;
  /** the caps stamp that names the absence, e.g. "NOT DISCLOSED" */
  stamp: string;
  stampCue?: string;
  stampMs?: number;
  bg?: "ink" | "paper";
}> = ({ from, to, kicker, label, unit = "$", stamp, stampCue, stampMs, bg = "ink" }) => {
  const ms = useMs();
  const vis = useVis(from, to);
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const dim = bg === "ink" ? INK_SUB : COLORS.grayText;
  const k = usePop(from + 200, { rise: 14 });
  const lab = usePop(from + 520, { rise: 16 });
  const slot = usePop(from + 780, { rise: 20 });
  const on = stampMs ?? cue(stampCue, from + 2400, from);
  const st = useStamp(on);
  // Continuous life WITHOUT jitter: the empty slot breathes in opacity only.
  const breathe = 0.34 + 0.14 * (0.5 + 0.5 * Math.sin((ms - from) / 760));
  // a hairline rules straight through the empty slot as the stamp lands
  const strike = clamp01(interpolate(ms, [on + 100, on + 760], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) }));
  const slotW = V ? 520 : 720;
  const slotH = V ? 128 : 150;
  return (
    <AbsoluteFill style={{ opacity: vis, justifyContent: "center", alignItems: "center", textAlign: "center", padding: V ? "0 70px" : "0 160px" }}>
      <div style={k}><div style={caps(dim)}>{kicker}</div></div>
      <div style={{ ...lab, marginTop: 18 }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: V ? 62 : 74, letterSpacing: TRACK.headline, color: fg, lineHeight: 1.06 }}>{label}</div>
      </div>

      {/* the empty slot — a real figure's geometry, permanently unfilled */}
      <div style={{ ...slot, marginTop: V ? 44 : 52, display: "flex", alignItems: "center", gap: 26 }}>
        <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: V ? 104 : 128, letterSpacing: TRACK.display, color: dim, opacity: 0.55, lineHeight: 1 }}>{unit}</span>
        <div style={{ position: "relative", width: slotW, height: slotH }}>
          <div style={{ position: "absolute", inset: 0, border: `3px dashed ${dim}`, borderRadius: 10, opacity: breathe }} />
          {/* the strike — draws through the empty slot on the stamp cue */}
          <div style={{ position: "absolute", left: 0, top: "50%", height: 4, width: `${strike * 100}%`, background: fg, transform: "translateY(-50%)", borderRadius: 2 }} />
        </div>
      </div>

      <div style={{ ...st, marginTop: V ? 44 : 52 }}>
        <div style={{ ...caps(fg), fontWeight: 700 }}>{stamp}</div>
      </div>
    </AbsoluteFill>
  );
};

// ── PullQuote — a quotation that SETS word-by-word on its spoken frames. One
//    phrase (`underline`) draws its own underline as it is voiced, so the
//    qualifier carrying the story marks itself. An optional dim `lead` flows
//    first, so the pre-quote seconds are never a dead eyebrow hold.
const QuoteWord: React.FC<{
  text: string; onsetMs: number; marked: boolean; style: React.CSSProperties; rule: string;
  /** the NEXT token is underlined too — extend this word's rule across the word
   *  gap so a multi-word phrase reads as ONE continuous underline instead of a
   *  row of per-word dashes. (operator note, Pathos long-form 2026-08-06) */
  joinRight?: boolean;
}> = ({ text, onsetMs, marked, style, rule, joinRight }) => {
  const ms = useMs();
  const snap = useSnap(onsetMs, 16);
  // the underline draws left to right as the word lands, then bridges the gap
  const draw = marked ? clamp01(interpolate(ms, [onsetMs + 40, onsetMs + 300], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) })) : 0;
  const bridge = joinRight ? 0.27 * draw : 0; // 0.27em ≈ the 0.26em inter-word margin
  return (
    <span style={{ ...style, ...snap, display: "inline-block", position: "relative" }}>
      {text}
      {marked ? (
        <span
          style={{
            position: "absolute", left: 0, bottom: "-0.14em", height: 6,
            width: `calc(${draw * 100}% + ${bridge}em)`,
            background: rule, borderRadius: 3,
          }}
        />
      ) : null}
    </span>
  );
};

// ── QualifierStack — N competing claims that are ALL TRUE because each carries a
//    different escape hatch. Every row lands on its cue as company + date + spec
//    + the CLAIM, with the qualifier phrase inside that claim held BRIGHT while
//    the rest of the sentence stays dim — so the eye scans a column of qualifiers
//    and sees the trick without being told. Rows persist and hold together; an
//    optional rule draws under every qualifier at once, then a verdict stamps.
//    `dimFromMs` lets a LATER section re-enter the same stack, dimmed, as a
//    callback ("the record has stopped measuring anything").
//    Emphasis is weight + brightness only — no glyphs, no bars. (ink or paper)
const QualifierRow: React.FC<{
  company: string; date: string; spec: string; claim: string; qualifier: string;
  onset: number; underlineMs?: number; dimAll: number;
  fg: string; dim: string; sep: string; leftW: number;
}> = ({ company, date, spec, claim, qualifier, onset, underlineMs, dimAll, fg, dim, sep, leftW }) => {
  const ms = useMs();
  const pop = usePop(onset, { rise: 22 });
  // the qualifier brightens a beat AFTER the row lands, so the eye is led to it
  const lift = clamp01(interpolate(ms, [onset + 420, onset + 1000], [0, 1], CLAMP));
  const draw = underlineMs == null ? 0 : clamp01(interpolate(ms, [underlineMs, underlineMs + 700], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) }));
  const i = claim.toLowerCase().indexOf(qualifier.toLowerCase());
  const pre = i >= 0 ? claim.slice(0, i) : claim;
  const mid = i >= 0 ? claim.slice(i, i + qualifier.length) : "";
  const post = i >= 0 ? claim.slice(i + qualifier.length) : "";
  const dimStyle: React.CSSProperties = { fontFamily: DISPLAY, fontWeight: 500, fontSize: V ? 30 : 38, letterSpacing: TRACK.headline, color: dim, lineHeight: 1.26 };
  return (
    <div style={{ ...pop, opacity: (pop.opacity as number) * dimAll, display: "flex", gap: V ? 24 : 40, borderTop: `2px solid ${sep}`, paddingTop: V ? 20 : 24 }}>
      <div style={{ width: leftW, flexShrink: 0 }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: V ? 34 : 40, letterSpacing: TRACK.headline, color: fg, lineHeight: 1.1 }}>{company}</div>
        <div style={{ ...caps(dim, TYPE.labelSm), marginTop: 8 }}>{date}</div>
      </div>
      <div style={{ flex: 1 }}>
        <div style={dimStyle}>
          {pre}
          <span style={{ position: "relative", display: "inline-block", fontWeight: 700, color: fg, opacity: 0.45 + 0.55 * lift }}>
            {mid}
            <span style={{ position: "absolute", left: 0, bottom: "-0.16em", height: 5, width: `${draw * 100}%`, background: fg, borderRadius: 3 }} />
          </span>
          {post}
        </div>
        <div style={{ ...caps(dim, TYPE.labelSm), marginTop: 10 }}>{spec}</div>
      </div>
    </div>
  );
};

export const QualifierStack: React.FC<Win & {
  kicker: string;
  rows: { company: string; date: string; spec: string; claim: string; qualifier: string; word: string; ms?: number }[];
  /** draws a rule under EVERY qualifier at once — the "these are the trick" beat */
  underlineCue?: string;
  underlineMs?: number;
  /** the verdict that stamps once all rows are up */
  tag?: string;
  tagCue?: string;
  tagMs?: number;
  /** dim the whole stack from this ms — for a later section re-entering it as a callback */
  dimFromMs?: number;
  bg?: "ink" | "paper";
}> = ({ from, to, kicker, rows, underlineCue, underlineMs, tag, tagCue, tagMs, dimFromMs, bg = "ink" }) => {
  const ms = useMs();
  const vis = useVis(from, to);
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const dim = bg === "ink" ? INK_SUB : COLORS.grayText;
  const sep = bg === "ink" ? "rgba(255,255,255,0.14)" : COLORS.border;
  const k = usePop(from + 200, { rise: 14 });
  const onsets = rows.map((r, i) => r.ms ?? cue(r.word, from + 1200 + i * 4000, from));
  const ulOn = underlineMs ?? (underlineCue ? cue(underlineCue, -1, from) : -1);
  const tagOn = tagMs ?? (tag ? cue(tagCue, Math.max(...onsets) + 2600, from) : -1);
  const st = useStamp(tagOn < 0 ? Number.MAX_SAFE_INTEGER : tagOn);
  // the callback state: the whole stack recedes so the NEXT idea reads on top
  const dimAll = dimFromMs == null ? 1 : interpolate(ms, [dimFromMs, dimFromMs + 700], [1, 0.3], CLAMP);
  return (
    <AbsoluteFill style={{ opacity: vis, justifyContent: "center", padding: V ? "0 60px" : "0 130px" }}>
      <div style={{ ...k, marginBottom: V ? 26 : 32, opacity: (k.opacity as number) * dimAll }}>
        <div style={caps(dim)}>{kicker}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: V ? 26 : 32 }}>
        {rows.map((r, i) => (
          <QualifierRow key={i} {...r} onset={onsets[i]} underlineMs={ulOn < 0 ? undefined : ulOn}
            dimAll={dimAll} fg={fg} dim={dim} sep={sep} leftW={V ? 220 : 320} />
        ))}
      </div>
      {tag && tagOn >= 0 ? (
        <div style={{ ...st, marginTop: V ? 40 : 46, opacity: (st.opacity as number) * dimAll }}>
          <div style={{ ...caps(fg), fontWeight: 700 }}>{tag}</div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

export const PullQuote: React.FC<Win & {
  /** the quoted words — VERBATIM to the VO so every token resolves to its frame */
  quote: string;
  /** a dim setup line that flows before the quote (also verbatim) */
  lead?: string;
  /** the phrase(s) inside `quote` that underline themselves as they are spoken.
   *  ⚠️ Matched as a CONTIGUOUS RUN OF TOKENS, not a bag of words — an earlier
   *  copy of a word in the phrase (the first "your" in "your data" vs the second
   *  in "your chemists") must not get marked. Pass an array for several phrases. */
  underline?: string | string[];
  /** source line, shown as a caps kicker above the quote */
  attribution?: string;
  bg?: "ink" | "paper";
  size?: number;
  leadSize?: number;
  maxWidth?: number;
}> = ({ from, to, quote, lead, underline, attribution, bg = "ink", size, leadSize, maxWidth }) => {
  const acc = useAccent(); // the self-underline draws in the accent (card look)
  const vis = useVis(from, to);
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const dim = bg === "ink" ? INK_SUB : COLORS.grayText;
  const k = usePop(from + 200, { rise: 14 });
  const qSize = size ?? (V ? 56 : 64);
  const lSize = leadSize ?? (V ? 38 : 44);
  const width = maxWidth ?? (V ? 900 : 1420);

  // ONE shared cursor: the lead is spoken BEFORE the quote, so resolving them in
  // sequence keeps repeated words ("the", "in") landing in the right order.
  // Resolved as a single token run (word-index cursor — see cueSeq in core.tsx),
  // then split back into lead and quote.
  const leadToks = (lead ?? "").split(/\s+/).filter(Boolean);
  const qToks = quote.split(/\s+/).filter(Boolean);
  const allOns = cueSeq([...leadToks, ...qToks], from, to);
  const leadOns = allOns.slice(0, leadToks.length).map((m) => m ?? from + 200);
  const qOns = allOns.slice(leadToks.length);
  const qSpan = Math.max(700, to - (leadOns[leadOns.length - 1] ?? from) - 900);
  const qFilled = qOns.map((m, i) => m ?? from + 400 + (qSpan * i) / Math.max(1, qToks.length - 1));

  // which tokens carry the underline — a CONTIGUOUS run per phrase (first match
  // only), so a repeated word elsewhere in the quote is never marked by accident.
  const nrm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
  const qNorm = qToks.map(nrm);
  const marks = new Set<number>();
  for (const ph of Array.isArray(underline) ? underline : underline ? [underline] : []) {
    const target = ph.split(/\s+/).filter(Boolean).map(nrm).filter(Boolean);
    if (!target.length) continue;
    for (let i = 0; i + target.length <= qNorm.length; i++) {
      if (target.every((t, k) => qNorm[i + k] === t)) {
        for (let k = 0; k < target.length; k++) marks.add(i + k);
        break;
      }
    }
  }
  const leadStyle: React.CSSProperties = { fontFamily: DISPLAY, fontWeight: 600, fontSize: lSize, letterSpacing: TRACK.headline, color: dim, lineHeight: 1.16, marginRight: "0.26em" };
  const qStyle: React.CSSProperties = { fontFamily: DISPLAY, fontWeight: 700, fontSize: qSize, letterSpacing: TRACK.headline, color: fg, lineHeight: 1.18, marginRight: "0.26em" };

  return (
    <AbsoluteFill style={{ opacity: vis, justifyContent: "center", alignItems: "center", textAlign: "center", padding: V ? "0 70px" : "0 150px" }}>
      {attribution ? <div style={{ ...k, marginBottom: 26 }}><div style={caps(dim)}>{attribution}</div></div> : null}
      {leadToks.length ? (
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", maxWidth: width, marginBottom: 30 }}>
          {leadToks.map((t, i) => <FlowWord key={i} text={t} onsetMs={leadOns[i]} style={leadStyle} />)}
        </div>
      ) : null}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", maxWidth: width }}>
        {qToks.map((t, i) => (
          <QuoteWord
            key={i}
            text={t}
            onsetMs={qFilled[i]}
            marked={marks.has(i)}
            joinRight={marks.has(i) && marks.has(i + 1)}
            style={qStyle}
            rule={acc}
          />
        ))}
      </div>
    </AbsoluteFill>
  );
};

// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•
// NEW (BioIntel Â· GSK Ã— Jideytro reel, 2026-07-24). A "pattern â†’ proof" story:
//   â€¢ PairLedger â€” N acquirerâ€“target PAIRS land on their spoken names, then a
//     shared qualifier line resolves underneath. One continuous graphic across
//     two beats, so a list beat and its characterisation don't twin.
//   â€¢ LoopClose  â€” ENACTED closure: a ring draws from one named node round to
//     the other and SEALS. For a line whose content is a loop/cycle completing.
// â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•â•

// â”€â”€ PairLedger â€” a stack of "A â€” B" pairs, each landing on its own spoken word,
//    over a drawn hairline; then a row of qualifier terms lands on THEIR words.
//    Built for "Vertexâ€“Crinetics. AstraZenecaâ€“Dizal. Lillyâ€“Atai Beckley. â†’
//    late-stage, single-asset, defined mechanism deals." Vertical-first, bg-aware.
//
//    Why one block across two beats: the qualifier line characterises the pairs
//    that are still on screen. Splitting it into a second list block would put two
//    near-identical list layouts back-to-back (anti-repetition, principle 5). â”€â”€â”€
const PairRow: React.FC<{
  left: string; right: string; appearMs: number; fg: string; dim: string; hair: string; width: number;
}> = ({ left, right, appearMs, fg, dim, hair, width }) => {
  const ms = useMs();
  const pop = usePop(appearMs, { rise: 18 });
  // the connector draws Lâ†’R as the pair lands, so the row assembles rather than fades
  const dash = clamp01(interpolate(ms, [appearMs + 120, appearMs + 620], [0, 1], CLAMP));
  const rule = clamp01(interpolate(ms, [appearMs + 220, appearMs + 1020], [0, 1], CLAMP)) * width;
  const nameStyle = (weight: number, color: string): React.CSSProperties => ({
    fontFamily: DISPLAY, fontWeight: weight, fontSize: V ? 52 : 58, letterSpacing: TRACK.headline, color, lineHeight: 1,
  });
  return (
    <div style={{ ...pop, width }}>
      <div style={{ display: "flex", alignItems: "center", gap: 20, padding: "14px 0" }}>
        <span style={nameStyle(700, fg)}>{left}</span>
        <span style={{ height: 3, width: 34 * dash, background: dim, borderRadius: 2, flexShrink: 0 }} />
        <span style={nameStyle(500, dim)}>{right}</span>
      </div>
      <div style={{ height: 2, width: rule, background: hair }} />
    </div>
  );
};

const Qualifier: React.FC<{ label: string; appearMs: number; color: string; sep: string; first: boolean }> = ({
  label, appearMs, color, sep, first,
}) => {
  const pop = usePop(appearMs, { rise: 10 });
  return (
    <span style={{ ...pop, display: "inline-flex", alignItems: "center", gap: 14 }}>
      {first ? null : <span style={{ width: 5, height: 5, borderRadius: 5, background: sep }} />}
      {/* 22px in portrait, not 25: three terms + separators must fit ONE 900px row
          (see the nowrap note in PairLedger) — at 25 the last term overflowed. */}
      <span style={caps(color, TYPE.labelSm)}>{label}</span>
    </span>
  );
};

export const PairLedger: React.FC<Win & {
  kicker?: string;
  rows: { left: string; right: string; word: string; ms?: number }[];
  /** the shared characterisation that lands AFTER the pairs, one term per spoken word */
  qualifiers?: { label: string; word: string; ms?: number }[];
  tail?: string;      // e.g. "deals" â€” a closing word after the qualifiers
  tailWord?: string;
  bg?: "ink" | "paper";
}> = ({ from, to, kicker, rows, qualifiers = [], tail, tailWord, bg = "ink" }) => {
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const dim = bg === "ink" ? INK_SUB : COLORS.grayText;
  const hair = bg === "ink" ? "rgba(255,255,255,0.16)" : COLORS.border;
  const vis = useVis(from, to);
  const k = usePop(from + 200, { rise: 14 });
  const width = V ? 900 : 1120;
  const rowOn = rows.map((r, i) => r.ms ?? cue(r.word, from + 600 + i * 1600, from));
  const lastRow = Math.max(from, ...rowOn);
  const qOn = qualifiers.map((q, i) => q.ms ?? cue(q.word, lastRow + 1400 + i * 900, lastRow));
  const tailOn = tail ? cue(tailWord, (qOn.length ? Math.max(...qOn) : lastRow) + 900, lastRow) : -1;
  const tl = usePop(tailOn < 0 ? Number.MAX_SAFE_INTEGER : tailOn, { rise: 12 });
  return (
    <AbsoluteFill style={{ opacity: vis, justifyContent: "center", alignItems: "center", padding: V ? "0 60px" : "0 160px" }}>
      {kicker ? <div style={{ ...k, marginBottom: V ? 54 : 44 }}><div style={caps(dim)}>{kicker}</div></div> : null}
      <div style={{ display: "flex", flexDirection: "column", gap: V ? 30 : 24 }}>
        {rows.map((r, i) => (
          <PairRow key={i} left={r.left} right={r.right} appearMs={rowOn[i]} fg={fg} dim={dim} hair={hair} width={width} />
        ))}
      </div>
      {qualifiers.length ? (
        // ONE row, never wrapped: un-appeared items still reserve layout space, so a
        // wrapped second row would hold an empty gap until its last term lands.
        <div style={{ display: "flex", flexWrap: "nowrap", alignItems: "center", gap: 14, marginTop: V ? 56 : 46, width }}>
          {qualifiers.map((q, i) => (
            <Qualifier key={i} label={q.label} appearMs={qOn[i]} color={fg} sep={dim} first={i === 0} />
          ))}
        </div>
      ) : null}
      {tail ? (
        <div style={{ ...tl, marginTop: 26, width }}>
          <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: V ? 64 : 72, letterSpacing: TRACK.headline, color: fg }}>{tail}</span>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// â”€â”€ LoopClose â€” a ring that DRAWS between two named nodes and seals shut. For a
//    line whose content is a cycle completing ("the first to close the loop from
//    acquisition to FDA approval"): the graphic performs the closure rather than
//    typesetting the sentence (principle 3, show don't tell).
//
//    Sequence: the open track appears on `openCue` â†’ node A stamps on `aCue` and
//    the arc starts drawing â†’ node B stamps on `bCue` â†’ the arc completes the
//    circle and pulses once as it seals. Vertical-first, bg-aware. â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
export const LoopClose: React.FC<Win & {
  kicker?: string;
  headline?: string;
  headlineCue?: string;
  a: string;              // the node the loop starts from
  b: string;              // the node it closes into
  openCue: string;        // when the empty ring appears ("close the loop")
  aCue: string;           // when node A is named ("acquisition")
  bCue: string;           // when node B is named ("FDA approval")
  sealMs?: number;        // explicit override for the seal (defaults just after bCue)
  bg?: "ink" | "paper";
}> = ({ from, to, kicker, headline, headlineCue, a, b, openCue, aCue, bCue, sealMs, bg = "ink" }) => {
  const ms = useMs();
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const dim = bg === "ink" ? INK_SUB : COLORS.grayText;
  const track = bg === "ink" ? "rgba(255,255,255,0.16)" : COLORS.border;
  const vis = useVis(from, to);

  const k = usePop(from + 200, { rise: 14 });
  const hOn = cue(headlineCue, from + 700, from);
  const h = usePop(hOn, { rise: 20 });
  const openOn = cue(openCue, from + 1300, from);
  const aOn = cue(aCue, openOn + 1400, from);
  const bOn = cue(bCue, aOn + 1200, from);
  const seal = sealMs ?? bOn + 900;

  const R = V ? 216 : 176;
  const C = 2 * Math.PI * R;
  const box = R * 2 + 96;

  // the empty track fades in, then the stroke draws: Aâ†’B over the first half of
  // the circle, Bâ†’A over the second, completing exactly at `seal`.
  const trackOp = clamp01(interpolate(ms, [openOn, openOn + 520], [0, 1], CLAMP));
  const half = clamp01(interpolate(ms, [aOn, bOn], [0, 0.5], { ...CLAMP, easing: Easing.inOut(Easing.cubic) }));
  const rest = clamp01(interpolate(ms, [bOn, seal], [0, 0.5], { ...CLAMP, easing: Easing.out(Easing.cubic) }));
  const drawn = half + rest;
  // one restrained pulse as the ring seals â€” the "click" of the loop closing
  const pulse = interpolate(ms, [seal, seal + 150, seal + 620], [1, 1.045, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) });

  const nodeA = usePop(aOn, { rise: 12, scale: true });
  const nodeB = usePop(bOn, { rise: 12, scale: true });
  const nodeLabel = (color: string): React.CSSProperties => ({ ...caps(color) });

  return (
    <AbsoluteFill style={{ opacity: vis, justifyContent: "center", alignItems: "center", textAlign: "center", padding: V ? "0 70px" : "0 160px" }}>
      {kicker ? <div style={{ ...k, marginBottom: 18 }}><div style={caps(dim)}>{kicker}</div></div> : null}
      {headline ? (
        <div style={{ ...h, marginBottom: V ? 48 : 38 }}>
          <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: V ? 62 : 66, letterSpacing: TRACK.headline, color: fg, lineHeight: 1.1, maxWidth: V ? 860 : 1100 }}>{headline}</div>
        </div>
      ) : null}

      <div style={{ position: "relative", width: box, height: box, transform: `scale(${pulse})` }}>
        <svg width={box} height={box} viewBox={`0 0 ${box} ${box}`} style={{ overflow: "visible" }}>
          {/* the open track â€” the loop that exists but hasn't been closed */}
          <circle cx={box / 2} cy={box / 2} r={R} fill="none" stroke={track} strokeWidth={3} opacity={trackOp} />
          {/* the drawn stroke, starting at 12 o'clock and going clockwise */}
          <circle
            cx={box / 2} cy={box / 2} r={R} fill="none" stroke={fg} strokeWidth={7} strokeLinecap="round"
            strokeDasharray={C} strokeDashoffset={C * (1 - drawn)}
            transform={`rotate(-90 ${box / 2} ${box / 2})`}
          />
        </svg>
        {/* node A at 12 o'clock, node B at 6 o'clock */}
        <div style={{ position: "absolute", top: -14, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
          <div style={{ ...nodeA, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <span style={nodeLabel(fg)}>{a}</span>
            <span style={{ width: 16, height: 16, borderRadius: 16, background: fg }} />
          </div>
        </div>
        <div style={{ position: "absolute", bottom: -14, left: 0, right: 0, display: "flex", justifyContent: "center" }}>
          <div style={{ ...nodeB, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
            <span style={{ width: 16, height: 16, borderRadius: 16, background: fg }} />
            <span style={nodeLabel(fg)}>{b}</span>
          </div>
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// NEW (BioIntel · Novartis radiopharma reel, 2026-07-25). A show-don't-tell hook
// for the "one asset died, one compounds" thesis:
//   • CullVsCompound — two editorial sparklines. The LOSER rises then BREAKS and
//     drops to a dead flatline (dim, its label struck). The WINNER COMPOUNDS
//     upward (bright, accelerating) with a live pulsing tip that holds. The chart
//     motion ENACTS the flatline-vs-growth relationship instead of typesetting
//     two labels (principle 3). Portrait-first, bg-aware.
// ═══════════════════════════════════════════════════════════════════════════
export const CullVsCompound: React.FC<Win & {
  kicker?: string;
  loser: { label: string; sub: string; breakCue: string; drawFromMs?: number };
  winner: { label: string; sub: string; introCue: string; growCue: string };
  bg?: "ink" | "paper";
}> = ({ from, to, kicker, loser, winner, bg = "ink" }) => {
  const ms = useMs();
  const vis = useVis(from, to);
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const dim = bg === "ink" ? INK_SUB : COLORS.grayText;
  const hair = bg === "ink" ? "rgba(255,255,255,0.14)" : COLORS.border;
  const k = usePop(from + 200, { rise: 14 });

  const W = V ? 860 : 1180;
  const H = V ? 150 : 150;

  // ── loser: line draws from `from`, then BREAKS + drops + dims on breakCue ──
  const drawFrom = loser.drawFromMs ?? from + 300;
  const loserDraw = clamp01(interpolate(ms, [drawFrom, drawFrom + 1300], [0, 1], CLAMP));
  const breakOn = cue(loser.breakCue, from + 2200, from);
  const drop = clamp01(interpolate(ms, [breakOn, breakOn + 520], [0, 1], { ...CLAMP, easing: Easing.in(Easing.cubic) }));
  const loserDim = interpolate(ms, [breakOn + 120, breakOn + 640], [1, 0.4], CLAMP);
  const strike = clamp01(interpolate(ms, [breakOn, breakOn + 400], [0, 1], CLAMP));
  const loserLabel = usePop(breakOn, { rise: 16, scale: true });
  const loserSub = usePop(drawFrom - 100, { rise: 12 });

  // ── winner: intro (sub + axis) on introCue, then label + line compound on growCue ──
  const introOn = cue(winner.introCue, from + 4200, from);
  const wSub = usePop(introOn, { rise: 12 });
  const axisDraw = clamp01(interpolate(ms, [introOn, introOn + 700], [0, 1], CLAMP));
  const growOn = cue(winner.growCue, from + 5800, from);
  const wLabel = usePop(growOn, { rise: 20, scale: true });
  const grow = clamp01(interpolate(ms, [growOn, growOn + 1550], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) }));
  const tipShow = clamp01(interpolate(ms, [growOn + 250, growOn + 800], [0, 1], CLAMP));
  const tipPulse = 1 + 0.22 * Math.max(0, Math.sin((ms - growOn) / 300));

  // loser polyline: rise to a plateau that breaks at x≈0.52W
  const plateauY = H * 0.42;
  const baseY = H * 0.84;
  const breakX = W * 0.52;
  const loserPts = `0,${H * 0.72} ${W * 0.16},${H * 0.5} ${W * 0.32},${plateauY} ${breakX},${plateauY}`;
  // winner polyline: an accelerating (compounding) climb to the top-right
  const wx = [0, 0.16, 0.32, 0.48, 0.64, 0.82, 1];
  const wy = [0.86, 0.8, 0.68, 0.52, 0.34, 0.16, 0.08];
  const winnerPts = wx.map((x, i) => `${(x * W).toFixed(1)},${(wy[i] * H).toFixed(1)}`).join(" ");
  const tipX = W;
  const tipY = wy[wy.length - 1] * H;

  const bigLabel = (color: string): React.CSSProperties => ({
    fontFamily: DISPLAY, fontWeight: 700, fontSize: V ? 96 : 104, letterSpacing: TRACK.display, color, lineHeight: 1,
  });

  return (
    <AbsoluteFill style={{ opacity: vis, justifyContent: "center", padding: V ? "0 110px" : "0 200px" }}>
      {kicker ? <div style={{ ...k, marginBottom: V ? 40 : 34 }}><div style={caps(dim)}>{kicker}</div></div> : null}

      {/* ── LOSER group: label (struck) + sub, then the breaking sparkline ── */}
      <div style={{ opacity: loserDim }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 24 }}>
          <div style={{ ...loserLabel, position: "relative", display: "inline-block" }}>
            <div style={bigLabel(dim)}>{loser.label}</div>
            <div style={{ position: "absolute", top: "52%", left: 0, height: 7, width: `${strike * 100}%`, background: dim, borderRadius: 4 }} />
          </div>
          <div style={loserSub}><div style={caps(dim, TYPE.labelSm)}>{loser.sub}</div></div>
        </div>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", marginTop: 18, overflow: "visible" }}>
          {/* the rise-to-plateau line, drawn on entry */}
          <polyline points={loserPts} fill="none" stroke={dim} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round"
            pathLength={1} strokeDasharray={1} strokeDashoffset={1 - loserDraw} />
          {/* the break: a drop from the plateau to the dead baseline */}
          <line x1={breakX} y1={plateauY} x2={breakX} y2={plateauY + drop * (baseY - plateauY)} stroke={dim} strokeWidth={4} strokeLinecap="round" />
          {/* the dead flatline continuing at zero (dashed) */}
          <line x1={breakX} y1={baseY} x2={W} y2={baseY} stroke={dim} strokeWidth={3} strokeDasharray="6 12" strokeLinecap="round" opacity={drop} />
        </svg>
      </div>

      {/* ── WINNER group: sub + label, then the compounding sparkline ── */}
      <div style={{ marginTop: V ? 70 : 54 }}>
        <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: 24 }}>
          <div style={wLabel}><div style={bigLabel(fg)}>{winner.label}</div></div>
          <div style={wSub}><div style={caps(fg, TYPE.labelSm)}>{winner.sub}</div></div>
        </div>
        <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", marginTop: 18, overflow: "visible" }}>
          {/* baseline axis drawn as the winner is introduced */}
          <line x1={0} y1={baseY} x2={W * axisDraw} y2={baseY} stroke={hair} strokeWidth={2} />
          {/* the compounding climb, drawn on the grow cue */}
          <polyline points={winnerPts} fill="none" stroke={fg} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round"
            pathLength={1} strokeDasharray={1} strokeDashoffset={1 - grow} />
          {/* live pulsing tip at the leading edge (radius scales — no transform quirks) */}
          <circle cx={tipX} cy={tipY} r={Math.max(0.01, 9 * tipShow * tipPulse)} fill={fg} opacity={tipShow} />
        </svg>
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// NEW (BioIntel · Novartis reel, 2026-07-25). A set of ENACTED beats — each one
// performs its idea with motion instead of typesetting it (principle 3). Built
// after the operator asked to make every beat "interactive." Portrait-first, bg-aware.
//   • WalkAway          — a Phase-2 trial track STALLS; indications get STRUCK on the fail
//   • PullPlug          — a phase fill advances toward Phase 3 then RETRACTS + goes dark
//   • CompounderDossier — a spec sheet with a LIVE rising "momentum" sparkline
//   • BarsReprice       — an "enthusiasm" bar deflates/greys while a "data" bar rises + stamps
//   • DepthBreadth      — one DEEP column is struck → MANY rays fan out (depth vs differentiation)
// ═══════════════════════════════════════════════════════════════════════════

// a bordered indication chip that gets struck through on the fail cue
const WalkChip: React.FC<{ label: string; appearMs: number; strikeMs: number; fg: string; sub: string; line: string }> = ({ label, appearMs, strikeMs, fg, sub, line }) => {
  const ms = useMs();
  const pop = usePop(appearMs, { rise: 14, scale: true });
  const st = clamp01(interpolate(ms, [strikeMs, strikeMs + 340], [0, 1], CLAMP));
  return (
    <div style={{ ...pop, position: "relative", padding: V ? "14px 26px" : "16px 30px", border: `2px solid ${line}`, borderRadius: 6 }}>
      <span style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: V ? 36 : 40, letterSpacing: TRACK.headline, color: fg }}>{label}</span>
      <div style={{ position: "absolute", left: 16, right: 16, top: "52%", height: 3, background: sub, transform: `scaleX(${st})`, transformOrigin: "left center" }} />
    </div>
  );
};

// ── WalkAway — a mid-stage program abandoned: a Phase-2 trial track fills partway
//    and STALLS, the indication chips get STRUCK, the whole card dims, and the
//    "disappointing" verdict stamps. Enacts the walk-away. (paper) ──────────────
export const WalkAway: React.FC<Win & {
  kicker: string;
  headline: string;
  trialLabel?: string;
  indications: { label: string; word: string }[];
  failLabel: string;
  cues: { headline: string; fail: string };
  bg?: "ink" | "paper";
}> = ({ from, to, kicker, headline, trialLabel = "Phase 2 trial", indications, failLabel, cues, bg = "paper" }) => {
  const ms = useMs();
  const vis = useVis(from, to);
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const sub = bg === "ink" ? INK_SUB : COLORS.grayText;
  const line = bg === "ink" ? "rgba(255,255,255,0.16)" : COLORS.border;
  const trackBg = bg === "ink" ? "rgba(255,255,255,0.1)" : COLORS.panel;
  const k = usePop(from + 200, { rise: 14 });
  const hOn = cue(cues.headline, from + 200, from);
  const h = usePop(hOn, { rise: 22 });
  const failOn = cue(cues.fail, to - 1400, from);
  const dimAll = interpolate(ms, [failOn + 150, failOn + 720], [1, 0.44], CLAMP);
  const strike = clamp01(interpolate(ms, [failOn, failOn + 520], [0, 1], CLAMP));
  const stamp = useStamp(failOn);
  const chipOns = indications.map((c, i) => cue(c.word, from + 2600 + i * 1500, from));
  const W = V ? 800 : 1000;
  const fill = clamp01(interpolate(ms, [hOn + 700, failOn], [0.06, 0.6], { ...CLAMP, easing: Easing.out(Easing.cubic) }));
  return (
    <AbsoluteFill style={{ opacity: vis, justifyContent: "center", padding: V ? "0 110px" : "0 200px" }}>
      <div style={{ ...k, opacity: (k.opacity as number) * dimAll }}><div style={caps(sub)}>{kicker}</div></div>
      <div style={{ ...h, marginTop: 12, opacity: (h.opacity as number) * dimAll }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: V ? 76 : 88, letterSpacing: TRACK.headline, color: fg, lineHeight: 1.04 }}>{headline}</div>
      </div>
      {/* the trial track — fills partway then stalls, dead-dashed after the stall */}
      <div style={{ marginTop: 44, opacity: dimAll }}>
        <div style={{ ...caps(sub, TYPE.labelSm), marginBottom: 14 }}>{trialLabel}</div>
        <div style={{ position: "relative", height: 14, width: W, background: trackBg, borderRadius: 7 }}>
          <div style={{ position: "absolute", left: 0, top: 0, height: 14, width: fill * W, background: fg, borderRadius: 7, opacity: 1 - strike * 0.55 }} />
          <div style={{ position: "absolute", left: fill * W, top: 5, right: 0, height: 4, backgroundImage: `repeating-linear-gradient(90deg, ${sub} 0 10px, transparent 10px 22px)`, opacity: strike }} />
        </div>
      </div>
      {/* the indications — struck as the trial fails */}
      <div style={{ display: "flex", gap: 22, marginTop: 36, opacity: dimAll }}>
        {indications.map((c, i) => <WalkChip key={i} label={c.label} appearMs={chipOns[i]} strikeMs={failOn} fg={fg} sub={sub} line={line} />)}
      </div>
      {/* the verdict stamp — full brightness (not dimmed) */}
      <div style={{ ...stamp, marginTop: 44 }}>
        <div style={{ ...caps(fg), fontWeight: 700 }}>{failLabel}</div>
      </div>
    </AbsoluteFill>
  );
};

// one phase node on the PullPlug track
const PlugNode: React.FC<{ label: string; xPct: number; on: boolean; fg: string; sub: string }> = ({ label, xPct, on, fg, sub }) => (
  <div style={{ position: "absolute", left: `${xPct}%`, top: 0, transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
    <div style={{ width: on ? 26 : 18, height: on ? 26 : 18, borderRadius: "50%", background: on ? fg : "transparent", border: `2px solid ${on ? fg : sub}` }} />
    <span style={{ ...caps(on ? fg : sub, V ? 20 : 22), fontWeight: on ? 700 : 600, whiteSpace: "nowrap" }}>{label}</span>
  </div>
);

// ── PullPlug — a development track: the fill advances toward Phase 3, then on the
//    "pulled" cue it RETRACTS to Phase 2 and the Phase-3 node goes dark; the payoff
//    stamps. Enacts stopping short of Phase 3. (ink) ────────────────────────────
export const PullPlug: React.FC<Win & {
  kicker?: string;
  phases: string[];
  payoff: string;
  cues: { advance: string; pull: string };
  bg?: "ink" | "paper";
}> = ({ from, to, kicker, phases, payoff, cues, bg = "ink" }) => {
  const ms = useMs();
  const vis = useVis(from, to);
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const sub = bg === "ink" ? INK_SUB : COLORS.grayText;
  const track = bg === "ink" ? "rgba(255,255,255,0.16)" : COLORS.border;
  const k = usePop(from + 200, { rise: 14 });
  const advOn = cue(cues.advance, from + 1200, from);
  const pullOn = cue(cues.pull, to - 900, from);
  const adv = clamp01(interpolate(ms, [advOn, pullOn], [0.0, 0.92], { ...CLAMP, easing: Easing.out(Easing.cubic) }));
  const retract = clamp01(interpolate(ms, [pullOn, pullOn + 560], [0, 1], { ...CLAMP, easing: Easing.in(Easing.cubic) }));
  const fillFrac = adv - (adv - 0.5) * retract; // pulls back to ~Phase 2
  const stamp = useStamp(pullOn);
  const W = V ? 720 : 1000;
  const n = phases.length;
  return (
    <AbsoluteFill style={{ opacity: vis, justifyContent: "center", alignItems: "center", textAlign: "center", padding: V ? "0 90px" : "0 160px" }}>
      {kicker ? <div style={{ ...k, marginBottom: V ? 64 : 54 }}><div style={caps(sub)}>{kicker}</div></div> : null}
      <div style={{ position: "relative", width: W, height: 92 }}>
        <div style={{ position: "absolute", top: 19, left: 0, right: 0, height: 4, background: track, borderRadius: 2 }} />
        <div style={{ position: "absolute", top: 19, left: 0, width: fillFrac * W, height: 4, background: fg, borderRadius: 2 }} />
        {phases.map((p, i) => {
          const xPct = n > 1 ? (i / (n - 1)) * 100 : 50;
          const nodeAt = n > 1 ? i / (n - 1) : 0;
          const isLast = i === n - 1;
          const dark = isLast && retract > 0.25; // Phase 3 goes dark on the pull
          return <PlugNode key={i} label={p} xPct={xPct} on={fillFrac >= nodeAt - 0.03 && !dark} fg={fg} sub={sub} />;
        })}
      </div>
      <div style={{ ...stamp, marginTop: V ? 96 : 84 }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: V ? 92 : 112, letterSpacing: TRACK.display, color: fg, lineHeight: 1 }}>{payoff}</div>
      </div>
    </AbsoluteFill>
  );
};

// one dossier spec row on a growing spine (a node dot + label/value)
const DossierRow2: React.FC<{ label: string; value: string; appearMs: number; fg: string; sub: string; Icon?: IconC }> = ({ label, value, appearMs, fg, sub, Icon }) => {
  const pop = usePop(appearMs, { rise: 20 });
  return (
    <div style={{ ...pop, display: "flex", alignItems: "center", gap: 22, padding: "16px 0" }}>
      <div style={{ width: 40, display: "flex", justifyContent: "center", flexShrink: 0 }}>
        {Icon ? <IconMotion Icon={Icon} onset={appearMs + 120} size={40} color={sub} breathe /> : <div style={{ width: 12, height: 12, borderRadius: 12, background: fg }} />}
      </div>
      <div style={{ textAlign: "left" }}>
        <div style={caps(sub, TYPE.labelSm)}>{label}</div>
        <div style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: V ? 46 : 50, letterSpacing: TRACK.headline, color: fg, lineHeight: 1.1, marginTop: 4 }}>{value}</div>
      </div>
    </div>
  );
};

// ── CompounderDossier — a drug spec sheet whose name stamps, then a LIVE rising
//    "momentum" sparkline climbs through the whole beat (the compounding signal),
//    with spec rows landing on their words along a growing spine. (paper) ────────
export const CompounderDossier: React.FC<Win & {
  kicker: string;
  name: string;
  nameCue: string;
  specs: { label: string; value: string; word: string; Icon?: IconC }[];
  bg?: "ink" | "paper";
}> = ({ from, to, kicker, name, nameCue, specs, bg = "paper" }) => {
  const ms = useMs();
  const vis = useVis(from, to);
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const sub = bg === "ink" ? INK_SUB : COLORS.grayText;
  const hair = bg === "ink" ? "rgba(255,255,255,0.14)" : COLORS.border;
  const k = usePop(from + 200, { rise: 14 });
  const nameOn = cue(nameCue, from + 1500, from);
  const nm = usePop(nameOn, { rise: 22, scale: true });
  const ruleW = clamp01(interpolate(ms, [nameOn + 350, nameOn + 1150], [0, 1], CLAMP)) * (V ? 300 : 380);
  const onsets = specs.map((s, i) => cue(s.word, nameOn + 1600 + i * 1700, nameOn));
  // the LIVE momentum sparkline — draws slowly climbing across the whole beat
  const W = V ? 760 : 900;
  const H = V ? 120 : 120;
  const mDraw = clamp01(interpolate(ms, [nameOn + 500, to - 500], [0, 1], CLAMP));
  const mx = [0, 0.18, 0.36, 0.54, 0.72, 1];
  const my = [0.88, 0.8, 0.66, 0.5, 0.3, 0.1];
  const mPts = mx.map((x, i) => `${(x * W).toFixed(1)},${(my[i] * H).toFixed(1)}`).join(" ");
  const tipShow = clamp01(interpolate(ms, [nameOn + 700, nameOn + 1200], [0, 1], CLAMP));
  const tipPulse = 1 + 0.22 * Math.max(0, Math.sin((ms - nameOn) / 320));
  // spine grows to include appeared rows
  const lastAppeared = onsets.filter((o) => ms >= o).length;
  return (
    <AbsoluteFill style={{ opacity: vis, justifyContent: "center", padding: V ? "0 120px" : "0 220px" }}>
      <div style={k}><div style={caps(sub)}>{kicker}</div></div>
      <div style={{ ...nm, marginTop: 10, display: "flex", alignItems: "flex-end", justifyContent: "space-between", gap: 24 }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: V ? 100 : 116, letterSpacing: TRACK.display, color: fg, lineHeight: 1 }}>{name}</div>
      </div>
      <div style={{ height: 6, width: ruleW, background: fg, marginTop: 16, borderRadius: 3 }} />
      {/* the live momentum climb */}
      <svg width={W} height={H} viewBox={`0 0 ${W} ${H}`} style={{ display: "block", marginTop: 22, overflow: "visible" }}>
        <line x1={0} y1={H * 0.9} x2={W} y2={H * 0.9} stroke={hair} strokeWidth={2} />
        <polyline points={mPts} fill="none" stroke={fg} strokeWidth={5} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - mDraw} />
        <circle cx={mx[mx.length - 1] * W * Math.min(1, mDraw + 0.001)} cy={interpolateY(mDraw, mx, my, W, H)} r={Math.max(0.01, 8 * tipShow * tipPulse)} fill={fg} opacity={tipShow} />
      </svg>
      {/* spec rows on a growing spine */}
      <div style={{ position: "relative", marginTop: 20, paddingLeft: 20 }}>
        <div style={{ position: "absolute", left: 20, top: 8, width: 2, height: `${(lastAppeared / Math.max(1, specs.length)) * 100}%`, background: hair, borderRadius: 1 }} />
        {specs.map((s, i) => <DossierRow2 key={i} label={s.label} value={s.value} appearMs={onsets[i]} fg={fg} sub={sub} Icon={s.Icon} />)}
      </div>
    </AbsoluteFill>
  );
};

// helper: y of the momentum tip at draw fraction f (piecewise across mx/my)
function interpolateY(f: number, mx: number[], my: number[], W: number, H: number): number {
  const clampedF = Math.max(0, Math.min(1, f));
  for (let i = 0; i < mx.length - 1; i++) {
    if (clampedF <= mx[i + 1]) {
      const t = (clampedF - mx[i]) / (mx[i + 1] - mx[i] || 1);
      return (my[i] + (my[i + 1] - my[i]) * t) * H;
    }
  }
  return my[my.length - 1] * H;
}

// one repricing bar (grows to a target height, optionally deflates + greys)
const RepriceBar: React.FC<{ label: string; verdict: string; growMs: number; peak: number; deflateMs?: number; win: boolean; fg: string; sub: string; track: string; barW: number }> = ({ label, verdict, growMs, peak, deflateMs, win, fg, sub, track, barW }) => {
  const ms = useMs();
  const H = V ? 380 : 320;
  const grow = clamp01(interpolate(ms, [growMs, growMs + 850], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) }));
  const deflate = deflateMs == null ? 0 : clamp01(interpolate(ms, [deflateMs, deflateMs + 620], [0, 1], { ...CLAMP, easing: Easing.in(Easing.cubic) }));
  const h = grow * peak * H * (1 - deflate * 0.72);
  const col = win ? fg : sub;
  const labelStamp = useStamp(win ? growMs : Number.MAX_SAFE_INTEGER);
  const labelOp = clamp01(interpolate(ms, [growMs - 200, growMs + 200], [0, 1], CLAMP)) * (win ? 1 : 1 - deflate * 0.55);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-end", gap: 20 }}>
      <div style={{ position: "relative", width: barW, height: H, display: "flex", alignItems: "flex-end" }}>
        <div style={{ width: barW, height: Math.max(0, h), background: col, borderRadius: 8, opacity: win ? 1 : 1 - deflate * 0.4 }} />
      </div>
      <div style={{ ...(win ? labelStamp : {}), textAlign: "center", opacity: labelOp }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: win ? (V ? 62 : 68) : (V ? 48 : 54), letterSpacing: TRACK.headline, color: col, lineHeight: 1 }}>{label}</div>
        <div style={{ ...caps(win ? fg : sub, V ? 20 : 22), marginTop: 10 }}>{verdict}</div>
      </div>
    </div>
  );
};

// ── BarsReprice — "the bar just rose; enthusiasm is no longer priced, data is": an
//    enthusiasm bar rises then DEFLATES + greys, while a data bar RISES and stamps.
//    Enacts the repricing. (paper) ──────────────────────────────────────────────
export const BarsReprice: React.FC<Win & {
  kicker?: string;
  left: { label: string; verdict: string; growCue: string; deflateCue: string };
  right: { label: string; verdict: string; growCue: string };
  bg?: "ink" | "paper";
}> = ({ from, to, kicker, left, right, bg = "paper" }) => {
  const ms = useMs();
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const sub = bg === "ink" ? INK_SUB : COLORS.grayText;
  const track = bg === "ink" ? "rgba(255,255,255,0.12)" : COLORS.panel;
  const vis = clamp01(interpolate(ms, [from, from + 360, to - 320, to], [0, 1, 1, 0], CLAMP));
  const k = usePop(from + 200, { rise: 14 });
  const lGrow = cue(left.growCue, from + 800, from);
  const lDef = cue(left.deflateCue, from + 3000, from);
  const rGrow = cue(right.growCue, from + 4500, from);
  const barW = V ? 150 : 170;
  return (
    <AbsoluteFill style={{ opacity: vis, justifyContent: "center", alignItems: "center", textAlign: "center", padding: V ? "0 80px" : "0 160px" }}>
      {kicker ? <div style={{ ...k, marginBottom: V ? 60 : 50 }}><div style={caps(sub)}>{kicker}</div></div> : null}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: V ? 80 : 120 }}>
        <RepriceBar label={left.label} verdict={left.verdict} growMs={lGrow} peak={0.62} deflateMs={lDef} win={false} fg={fg} sub={sub} track={track} barW={barW} />
        <RepriceBar label={right.label} verdict={right.verdict} growMs={rGrow} peak={1.0} win={true} fg={fg} sub={sub} track={track} barW={barW} />
      </div>
    </AbsoluteFill>
  );
};

// ── DepthBreadth — "not how deep the pipeline runs, but how many differentiate":
//    one DEEP column draws down and gets struck, then MANY rays fan out from a
//    single point to distinct nodes on the pivot. Enacts depth vs differentiation. (ink)
export const DepthBreadth: React.FC<Win & {
  kicker?: string;
  depthLabel: string;
  breadthLabel: string;
  tag?: string;
  count?: number;
  cues: { depth: string; pivot: string };
  bg?: "ink" | "paper";
}> = ({ from, to, kicker, depthLabel, breadthLabel, tag, count = 5, cues, bg = "ink" }) => {
  const ms = useMs();
  const vis = useVis(from, to);
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const sub = bg === "ink" ? INK_SUB : COLORS.grayText;
  const k = usePop(from + 300, { rise: 14 });
  const depthOn = cue(cues.depth, from + 1400, from);
  const pivotOn = cue(cues.pivot, from + 5000, from);
  const depthDraw = clamp01(interpolate(ms, [depthOn, depthOn + 900], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) }));
  const depthVis = clamp01(interpolate(ms, [depthOn - 100, depthOn + 200, pivotOn - 200, pivotOn + 250], [0, 1, 1, 0], CLAMP));
  const struck = clamp01(interpolate(ms, [pivotOn - 350, pivotOn + 150], [0, 1], CLAMP));
  const breadthVis = clamp01(interpolate(ms, [pivotOn - 150, pivotOn + 350], [0, 1], CLAMP));
  const rays = clamp01(interpolate(ms, [pivotOn, pivotOn + 950], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) }));
  const stamp = useStamp(pivotOn);
  const BX = V ? 460 : 560; // diagram box width
  const BY = V ? 420 : 380; // diagram box height
  const topX = BX / 2, topY = 40;
  const depthBottomY = BY - 40;
  const depthLabelStamp = usePop(depthOn, { rise: 14 });
  return (
    <AbsoluteFill style={{ opacity: vis, justifyContent: "center", alignItems: "center", textAlign: "center", padding: V ? "0 80px" : "0 160px" }}>
      {kicker ? <div style={{ ...k, marginBottom: V ? 40 : 34 }}><div style={caps(sub)}>{kicker}</div></div> : null}
      <div style={{ position: "relative", width: BX, height: BY }}>
        <svg width={BX} height={BY} viewBox={`0 0 ${BX} ${BY}`} style={{ overflow: "visible" }}>
          {/* DEPTH — one deep vertical column, struck on the pivot */}
          <g opacity={depthVis}>
            <line x1={topX} y1={topY} x2={topX} y2={topY + depthDraw * (depthBottomY - topY)} stroke={sub} strokeWidth={6} strokeLinecap="round" />
            <circle cx={topX} cy={topY} r={10} fill={sub} />
            <circle cx={topX} cy={depthBottomY} r={10} fill={sub} opacity={depthDraw} />
            <line x1={topX - 70} y1={(topY + depthBottomY) / 2} x2={topX - 70 + struck * 140} y2={(topY + depthBottomY) / 2} stroke={sub} strokeWidth={5} strokeLinecap="round" />
          </g>
          {/* DIFFERENTIATION — rays fanning to distinct nodes */}
          <g opacity={breadthVis}>
            <circle cx={topX} cy={topY} r={11} fill={fg} />
            {Array.from({ length: count }).map((_, i) => {
              const spread = BX - 80;
              const ex = 40 + (spread * i) / (count - 1);
              const ey = depthBottomY;
              const cx = topX + (ex - topX) * rays;
              const cy = topY + (ey - topY) * rays;
              return (
                <g key={i}>
                  <line x1={topX} y1={topY} x2={cx} y2={cy} stroke={fg} strokeWidth={3.5} strokeLinecap="round" opacity={0.85} />
                  <circle cx={cx} cy={cy} r={Math.max(0.01, 8 * clamp01((rays - 0.6) / 0.4))} fill={fg} />
                </g>
              );
            })}
          </g>
        </svg>
      </div>
      {/* the label swaps depth → breadth on the pivot */}
      <div style={{ marginTop: V ? 36 : 30, position: "relative", height: V ? 96 : 104, width: "100%" }}>
        <div style={{ position: "absolute", inset: 0, display: "flex", justifyContent: "center", opacity: depthVis }}>
          <div style={{ ...depthLabelStamp }}>
            <div style={{ position: "relative", display: "inline-block" }}>
              <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: V ? 84 : 96, letterSpacing: TRACK.display, color: sub, lineHeight: 1 }}>{depthLabel}</div>
              <div style={{ position: "absolute", top: "52%", left: 0, height: 7, width: `${struck * 100}%`, background: sub, borderRadius: 4 }} />
            </div>
          </div>
        </div>
        <div style={{ position: "absolute", inset: 0, display: "flex", justifyContent: "center", ...stamp }}>
          <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: V ? 84 : 96, letterSpacing: TRACK.display, color: fg, lineHeight: 1 }}>{breadthLabel}</div>
        </div>
      </div>
      {tag ? <div style={{ marginTop: V ? 30 : 26, opacity: breadthVis }}><div style={caps(sub)}>{tag}</div></div> : null}
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// NEW (BioIntel GSK portfolio-discipline reel, 2026-07-29).
//   • TwinCharge — TWO OPPOSING FIGURES bound to one subject. An already-resolved
//     figure sits ABOVE a drawn axis pointing FORWARD (↑); a second figure COUNTS
//     UP BELOW it pointing BACKWARD (↓); then a bracket draws down the left edge
//     and a subject STAMPS, binding both. Enacts "two charges, opposite
//     directions, same company" instead of typesetting two stat cards.
//     Reach for it when a script pairs a forward-looking figure with a
//     backward-looking one (savings vs write-downs, guidance vs impairment).
//     ⚠️ Pair it with a preceding HeroStat that already counted the FIRST figure —
//     `up.figure` is a STRING (no count-up) precisely so the two don't twin.
// Portrait-first, bg-aware, monochrome (weight + dim only — no accent colour).
// ═══════════════════════════════════════════════════════════════════════════

export const TwinCharge: React.FC<Win & {
  kicker: string;
  /** the already-resolved figure (a string — it counted in a previous beat) */
  up: { label: string; figure: string; note?: string };
  /** the figure that COUNTS UP in this beat, below the axis */
  down: { label: string; value: number; decimals?: number; prefix?: string; suffix?: string; word: string; ms?: number; note?: string };
  /** the subject both charges belong to — stamps last */
  stamp: string;
  stampCue?: string;
  stampMs?: number;
  /** caps line above the stamp (e.g. "Same company. Same quarter.") */
  tag?: string;
  tagCue?: string;
  tagMs?: number;
  bg?: "ink" | "paper";
}> = ({ from, to, kicker, up, down, stamp, stampCue, stampMs, tag, tagCue, tagMs, bg = "ink" }) => {
  const ms = useMs();
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const sub = bg === "ink" ? INK_SUB : COLORS.grayText;
  const rule = bg === "ink" ? "rgba(255,255,255,0.22)" : COLORS.border;
  const vis = useVis(from, to);

  const k = usePop(from + 160, { rise: 14 });
  const upOn = from + 320;                       // the carried-over figure settles first
  const upPop = usePop(upOn, { rise: 18 });
  // the axis draws between the two charges
  const axisW = clamp01(interpolate(ms, [upOn + 240, upOn + 1000], [0, 1], CLAMP));
  const downOn = down.ms ?? cue(down.word, from + 2200, from);
  const tagOn = tagMs ?? cue(tagCue, downOn + 1900, from);
  const tg = usePop(tagOn, { rise: 12 });
  // bracket + stamp bind both charges
  const stampOn = stampMs ?? cue(stampCue, tagOn + 1500, from);
  const brack = clamp01(interpolate(ms, [tagOn + 120, stampOn], [0, 1], CLAMP));
  const st = useStamp(stampOn, { from: 1.2 });

  const figStyle: React.CSSProperties = {
    fontFamily: DISPLAY, fontWeight: 700, fontSize: V ? 168 : 150,
    letterSpacing: TRACK.display, color: fg, lineHeight: 0.92,
  };
  const colW = V ? 860 : 1080;

  // a thin chevron pointing up (forward) or down (backward)
  const Chevron: React.FC<{ dir: "up" | "down"; opacity: number }> = ({ dir, opacity }) => (
    <svg width={40} height={40} viewBox="0 0 40 40" style={{ opacity, flex: "none" }}>
      <path d={dir === "up" ? "M8 26 L20 13 L32 26" : "M8 14 L20 27 L32 14"}
        fill="none" stroke={fg} strokeWidth={3.5} strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  return (
    <AbsoluteFill style={{ opacity: vis, justifyContent: "center", alignItems: "center", padding: V ? "0 70px" : "0 160px" }}>
      <div style={{ ...k, marginBottom: V ? 54 : 44 }}><div style={caps(sub)}>{kicker}</div></div>

      <div style={{ position: "relative", width: colW }}>
        {/* the bracket that binds both charges, drawn down the left edge */}
        <div style={{
          position: "absolute", left: -34, top: 0, width: 3, height: `${brack * 100}%`,
          background: fg, opacity: 0.55, transformOrigin: "top",
        }} />

        {/* ABOVE the axis — the carried-over, forward-facing charge */}
        <div style={{ ...upPop, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 28 }}>
          <div style={{ textAlign: "left" }}>
            <div style={caps(sub)}>{up.label}</div>
            {up.note ? <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: V ? 30 : 28, color: sub, marginTop: 10, letterSpacing: TRACK.body }}>{up.note}</div> : null}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <Chevron dir="up" opacity={upPop.opacity as number} />
            <div style={figStyle}>{up.figure}</div>
          </div>
        </div>

        {/* the axis */}
        <div style={{ height: 3, width: `${axisW * 100}%`, background: rule, margin: V ? "46px 0" : "38px 0" }} />

        {/* BELOW the axis — the backward-facing charge, counting on its word */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 28 }}>
          <div style={{ textAlign: "left", opacity: clamp01(interpolate(ms, [downOn - 200, downOn + 200], [0, 1], CLAMP)) }}>
            <div style={caps(sub)}>{down.label}</div>
            {down.note ? <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: V ? 30 : 28, color: sub, marginTop: 10, letterSpacing: TRACK.body }}>{down.note}</div> : null}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <Chevron dir="down" opacity={clamp01(interpolate(ms, [downOn, downOn + 260], [0, 1], CLAMP))} />
            <CountUp fromMs={downOn} toMs={downOn + 1000} value={down.value} decimals={down.decimals ?? 1}
              prefix={down.prefix} suffix={down.suffix} style={figStyle} />
          </div>
        </div>
      </div>

      {/* the binding: caps line, then the subject STAMPS */}
      {tag ? <div style={{ ...tg, marginTop: V ? 78 : 60 }}><div style={caps(sub)}>{tag}</div></div> : null}
      <div style={{ ...st, marginTop: V ? 26 : 20 }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: V ? 150 : 130, letterSpacing: TRACK.display, color: fg, lineHeight: 1 }}>{stamp}</div>
      </div>
    </AbsoluteFill>
  );
};

// ── TwinRise — TWO FORCES MOVING THE SAME WAY. Two side-by-side columns whose
//    tracks FILL UPWARD on their spoken cues, each with a chevron that travels up
//    the column as it fills. Deliberately built to RHYME with TwinCharge (opposite
//    directions, horizontal axis) and invert it: same visual family, same subject,
//    forces now aligned. ⚠️ Carries NO figures — reach for it when the script says
//    two things rose but names no numbers (StepBars/HeroStat would force you to
//    invent magnitudes). Both columns fill to full: "both went up", nothing claimed
//    about how much. Portrait-first, bg-aware, monochrome.
//    (added BioIntel GSK portfolio-discipline reel, 2026-07-29)
export const TwinRise: React.FC<Win & {
  kicker?: string;
  columns: { label: string; sub?: string; word: string; ms?: number }[];
  /** caps line that lands after both columns have filled */
  payoff?: string;
  payoffCue?: string;
  payoffMs?: number;
  bg?: "ink" | "paper";
}> = ({ from, to, kicker, columns, payoff, payoffCue, payoffMs, bg = "ink" }) => {
  const ms = useMs();
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const sub = bg === "ink" ? INK_SUB : COLORS.grayText;
  const track = bg === "ink" ? "rgba(255,255,255,0.14)" : COLORS.panel;
  const vis = useVis(from, to);
  const k = usePop(from + 200, { rise: 14 });
  const onsets = columns.map((c, i) => c.ms ?? cue(c.word, from + 1400 + i * 3200, from));
  const payOn = payoffMs ?? cue(payoffCue, Math.max(...onsets) + 1300, from);
  const pay = usePop(payOn, { rise: 12 });
  const colH = V ? 620 : 420;
  const colW = V ? 190 : 170;

  return (
    <AbsoluteFill style={{ opacity: vis, justifyContent: "center", alignItems: "center", padding: V ? "0 70px" : "0 160px" }}>
      {kicker ? <div style={{ ...k, marginBottom: V ? 58 : 46 }}><div style={caps(sub)}>{kicker}</div></div> : null}
      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: V ? 76 : 90 }}>
        {columns.map((c, i) => (
          <RiseColumn key={i} label={c.label} sub={c.sub} onset={onsets[i]}
            fg={fg} dim={sub} track={track} h={colH} w={colW} />
        ))}
      </div>
      {payoff ? <div style={{ ...pay, marginTop: V ? 64 : 50 }}><div style={caps(sub)}>{payoff}</div></div> : null}
    </AbsoluteFill>
  );
};

// one TwinRise column — its own component so the hooks aren't called in a .map
const RiseColumn: React.FC<{
  label: string; sub?: string; onset: number;
  fg: string; dim: string; track: string; h: number; w: number;
}> = ({ label, sub, onset, fg, dim, track, h, w }) => {
  const ms = useMs();
  // the fill sweeps up over ~950ms from its cue
  const p = clamp01(interpolate(ms, [onset, onset + 950], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) }));
  const lbl = usePop(onset, { rise: 14 });
  // the chevron rides the top of the fill
  const chevBottom = 26 + p * (h - 76);
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ position: "relative", width: w, height: h, background: track, borderRadius: 6, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: `${p * 100}%`, background: fg, opacity: 0.9 }} />
        <div style={{ position: "absolute", left: 0, right: 0, bottom: chevBottom, display: "flex", justifyContent: "center", opacity: clamp01(interpolate(ms, [onset, onset + 260], [0, 1], CLAMP)) }}>
          <svg width={38} height={38} viewBox="0 0 40 40">
            <path d="M8 26 L20 13 L32 26" fill="none" stroke={track} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
      <div style={{ ...lbl, marginTop: 26, textAlign: "center", width: w + 90 }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: V ? 46 : 44, letterSpacing: TRACK.headline, color: fg, lineHeight: 1.1 }}>{label}</div>
        {sub ? <div style={{ ...caps(dim, TYPE.labelSm), marginTop: 12 }}>{sub}</div> : null}
      </div>
    </div>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// NEW (BioIntel · GSK×Jideytro longform, 2026-07-31)
//   • DateRail — the recurring dated-rail device
// ═══════════════════════════════════════════════════════════════════════════

// ── Typed — a label that TYPES IN character-by-character from its onset. Reads
//    as a stamp being entered on a record, not a graphic fading up. ────────────
const Typed: React.FC<{ text: string; onset: number; msPerChar?: number; style?: React.CSSProperties }> = ({
  text,
  onset,
  msPerChar = 42,
  style,
}) => {
  const ms = useMs();
  const shown = Math.round(clamp01(interpolate(ms, [onset, onset + text.length * msPerChar], [0, 1], CLAMP)) * text.length);
  // the caret rides the last typed char and retires once the label is complete
  const done = shown >= text.length;
  const caret = clamp01(interpolate(ms, [onset - 60, onset], [0, 1], CLAMP)) * (done ? 0 : 1);
  return (
    <span style={{ ...style, whiteSpace: "nowrap" }}>
      {text.slice(0, shown)}
      <span style={{ opacity: caret }}>|</span>
    </span>
  );
};

type RailTone = "solid" | "ghost" | "pending";

export type RailStampDef = {
  label: string;
  sub?: string;
  /** position along the rail, 0..1 */
  at: number;
  cue?: string;
  ms?: number;
  /** solid = a fact on the record · ghost = superseded / never-happened ·
   *  pending = dated but NOT decided (never let a pending date read as done) */
  tone?: RailTone;
  /** one restrained pulse on arrival — for the watch-item stamp */
  pulse?: boolean;
  /** a figure DOCKED to this date — the fact that belongs to it (a price, a code
   *  name). Lands on its OWN spoken cue, after the stamp, and hangs below the rail
   *  so the column reads date → node → what it was. Deliberately set below hero
   *  scale: it is a tag on a record, not the beat's payoff, so a later odometer on
   *  the same number still reads as the reveal. */
  detail?: { text: string; label?: string; cue?: string; ms?: number };
};

const RailStamp: React.FC<{
  def: RailStampDef;
  onset: number;
  railWidth: number;
  fg: string;
  dim: string;
  dimAll: number;
}> = ({ def, onset, railWidth, fg, dim, dimAll }) => {
  const ms = useMs();
  const tone = def.tone ?? "solid";
  const ghost = tone === "ghost";
  const pending = tone === "pending";
  const appear = clamp01(interpolate(ms, [onset, onset + 260], [0, 1], CLAMP));
  // ghost stamps arrive, then RECEDE — on the record, but not part of the story
  const settle = ghost ? interpolate(ms, [onset + 500, onset + 1400], [1, 0.34], CLAMP) : 1;
  // one pulse on arrival (scale only — no jitter, no wobble)
  const pulse = def.pulse
    ? interpolate(ms, [onset + 260, onset + 560, onset + 900], [1, 1.075, 1], { ...CLAMP, easing: Easing.inOut(Easing.cubic) })
    : 1;
  const col = ghost ? dim : fg;
  return (
    <div
      style={{
        position: "absolute",
        left: railWidth * def.at,
        top: 0,
        transform: `translateX(-50%) scale(${pulse})`,
        opacity: appear * settle * dimAll,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
      }}
    >
      <Typed
        text={def.label}
        onset={onset}
        style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: V ? 46 : 62, letterSpacing: TRACK.display, color: col, lineHeight: 1 }}
      />
      <div style={{ height: 26 }} />
      {/* the node sitting ON the rail — hollow while a date is only PENDING */}
      <div
        style={{
          width: 16,
          height: 16,
          borderRadius: 16,
          background: pending ? "transparent" : col,
          border: `3px solid ${col}`,
          opacity: appear,
        }}
      />
      <div style={{ height: 22 }} />
      {def.sub ? <div style={{ ...caps(dim, TYPE.labelSm), whiteSpace: "nowrap", opacity: appear }}>{def.sub}</div> : null}
      {def.detail ? <StampDetail detail={def.detail} stampOn={onset} fg={fg} dim={dim} /> : null}
    </div>
  );
};

// the figure hanging under a stamp — its own component so the hook isn't
// conditional inside RailStamp. A hairline drops from the sub-label first, then
// the figure rises into place: the fact ATTACHES to the date, it doesn't appear
// beside it.
const StampDetail: React.FC<{
  detail: NonNullable<RailStampDef["detail"]>;
  stampOn: number;
  fg: string;
  dim: string;
}> = ({ detail, stampOn, fg, dim }) => {
  const ms = useMs();
  const on = detail.ms ?? cue(detail.cue, stampOn + 1400, stampOn);
  const drop = clamp01(interpolate(ms, [on - 260, on + 60], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) }));
  const pop = usePop(on, { rise: 14 });
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <div style={{ width: 2, height: 30 * drop, background: dim, opacity: 0.55, marginTop: 20 }} />
      <div style={{ ...pop, display: "flex", flexDirection: "column", alignItems: "center", marginTop: 16 }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: V ? 58 : 78, letterSpacing: TRACK.display, color: fg, lineHeight: 1, whiteSpace: "nowrap" }}>
          {detail.text}
        </div>
        {detail.label ? <div style={{ ...caps(dim, TYPE.labelSm), marginTop: 14, whiteSpace: "nowrap" }}>{detail.label}</div> : null}
      </div>
    </div>
  );
};

// one line of a DateRail card — the first line reads as the subject (display
// weight), the rest as attributes (outlined chips). Own component for the hook.
const RailCardLine: React.FC<{
  text: string;
  onset: number;
  fg: string;
  dim: string;
  first: boolean;
}> = ({ text, onset, fg, dim, first }) => {
  const pop = usePop(onset, { rise: 14, scale: !first });
  if (first) {
    return (
      <div style={pop}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: V ? 58 : 76, letterSpacing: TRACK.display, color: fg, lineHeight: 1 }}>
          {text}
        </div>
      </div>
    );
  }
  return (
    <div style={pop}>
      <div style={{ padding: "11px 20px", border: `2px solid ${dim}`, borderRadius: 5, whiteSpace: "nowrap", ...caps(dim, TYPE.labelSm) }}>{text}</div>
    </div>
  );
};

/**
 * DateRail — dated stamps TYPE IN on their spoken cue and lock onto one horizontal
 * rail. Optional: a measured SPAN between two stamps whose label TRAVELS in from the
 * left stamp and docks at the midpoint (never a separate label fading up); a BADGE set
 * against that span; and a NOTE line that dims the rail and reads beneath it.
 *
 * Built as a RECURRING device: establish it in a hook beat, then call it back later
 * with `growFrom` so the rail RE-DRAWS from where it stood and extends right — the
 * continuity is the point. `tone: "pending"` keeps a scheduled-but-undecided date
 * reading as pending (hollow node), never as done.
 */
export const DateRail: React.FC<Win & {
  kicker?: string;
  railWidth?: number;
  bg?: "ink" | "paper";
  drawCue?: string;
  drawMs?: number;
  /** How long the rail takes to draw. Stretch it to cover a long gap between two
   *  dates: the line advancing toward a pending decision keeps the frame alive
   *  instead of completing in 1.4s and then sitting still for eight seconds. */
  drawDurationMs?: number;
  /** fraction of the rail already drawn at `from` — the RETURN case (0 = draw fresh) */
  growFrom?: number;
  /** cued lines set above the rail — what is travelling toward the date */
  card?: { label?: string; lines: { text: string; cue?: string; ms?: number }[] };
  stamps: RailStampDef[];
  span?: { fromAt: number; toAt: number; label: string; cue?: string; ms?: number };
  badge?: { text: string; at: number; sub?: string; cue?: string; ms?: number };
  note?: { text: string; cue?: string; ms?: number };
}> = ({ from, to, kicker, railWidth, bg = "ink", drawCue, drawMs, drawDurationMs, growFrom = 0, card, stamps, span, badge, note }) => {
  const ms = useMs();
  const vis = useVis(from, to);
  const W = railWidth ?? (V ? 880 : 1360);
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const dim = bg === "ink" ? INK_SUB : COLORS.grayText;
  const line = bg === "ink" ? "rgba(255,255,255,0.28)" : COLORS.border;

  const k = usePop(from + 150, { rise: 14 });
  const drawOn = drawMs ?? cue(drawCue, from + 200, from);
  const draw = interpolate(ms, [drawOn, drawOn + (drawDurationMs ?? 1400)], [growFrom, 1], { ...CLAMP, easing: Easing.inOut(Easing.cubic) });

  // the note beat: the rail recedes so the written line reads on top
  const noteOn = note ? (note.ms ?? cue(note.cue, to - 3200, from)) : Number.MAX_SAFE_INTEGER;
  const dimAll = note ? interpolate(ms, [noteOn - 200, noteOn + 600], [1, 0.45], CLAMP) : 1;
  const notePop = usePop(noteOn, { rise: 18 });

  // ── the measured span + its TRAVELLING label ──
  const spanOn = span ? (span.ms ?? cue(span.cue, from + 1200, from)) : Number.MAX_SAFE_INTEGER;
  const spanP = span ? clamp01(interpolate(ms, [spanOn, spanOn + 620], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) })) : 0;
  const spanL = span ? W * span.fromAt : 0;
  const spanR = span ? W * span.toAt : 0;
  const spanMid = (spanL + spanR) / 2;
  // the label leaves the LEFT stamp and docks at the span midpoint — travel, don't fade
  const travel = span ? interpolate(ms, [spanOn + 120, spanOn + 820], [spanL, spanMid], { ...CLAMP, easing: Easing.inOut(Easing.cubic) }) : 0;
  const travelOp = span ? clamp01(interpolate(ms, [spanOn + 120, spanOn + 340], [0, 1], CLAMP)) : 0;

  const badgeOn = badge ? (badge.ms ?? cue(badge.cue, to - 2000, from)) : Number.MAX_SAFE_INTEGER;
  const badgeSt = useStamp(badgeOn);

  return (
    <AbsoluteFill style={{ opacity: vis, justifyContent: "center", alignItems: "center" }}>
      <div style={{ width: W }}>
        {kicker ? (
          <div style={{ ...k, textAlign: "center", marginBottom: 54, opacity: (k.opacity as number) * dimAll }}>
            <div style={caps(dim)}>{kicker}</div>
          </div>
        ) : null}

        {/* the rail box reserves room for docked figures so the note line below
            never collides with them */}
        {/* what is travelling toward the date — each line lands on its own word,
            so a long stretch of rail is never a still frame */}
        {/* subject on its own line, attributes centred beneath it — an explicit
            two-row structure, so a fourth chip can never wrap into a ragged
            orphan the way a single flex-wrap row does */}
        {card ? (
          <div style={{ marginBottom: 38, opacity: dimAll, display: "flex", flexDirection: "column", alignItems: "center" }}>
            {card.label ? <div style={{ ...caps(dim, TYPE.labelSm), marginBottom: 14 }}>{card.label}</div> : null}
            {card.lines.slice(0, 1).map((l, i) => (
              <RailCardLine key={`h${i}`} text={l.text} onset={l.ms ?? cue(l.cue, from + 600, from)} fg={fg} dim={dim} first />
            ))}
            {card.lines.length > 1 ? (
              <div style={{ display: "flex", justifyContent: "center", gap: 14, marginTop: 20, flexWrap: "nowrap" }}>
                {card.lines.slice(1).map((l, i) => (
                  <RailCardLine
                    key={`c${i}`}
                    text={l.text}
                    onset={l.ms ?? cue(l.cue, from + 1400 + i * 1400, from)}
                    fg={fg}
                    dim={dim}
                    first={false}
                  />
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        <div style={{ position: "relative", height: stamps.some((s) => s.detail) ? 430 : badge ? 340 : 250 }}>
          {/* the rail itself — draws (or re-draws from growFrom) left to right */}
          <div style={{ position: "absolute", top: 88, left: 0, height: 3, width: W * draw, background: line, opacity: dimAll }} />

          {/* the measured span: end ticks + the connecting bar, sitting ON the rail */}
          {span ? (
            <div style={{ position: "absolute", top: 88, left: spanL, opacity: dimAll }}>
              <div style={{ position: "absolute", top: -13, left: 0, width: 3, height: 26, background: fg, opacity: spanP }} />
              <div style={{ position: "absolute", top: -2, left: 0, height: 5, width: (spanR - spanL) * spanP, background: fg, borderRadius: 3 }} />
              <div style={{ position: "absolute", top: -13, left: spanR - spanL - 3, width: 3, height: 26, background: fg, opacity: spanP }} />
            </div>
          ) : null}

          {/* the span label — travels in from the left stamp and docks at the midpoint */}
          {span ? (
            <div
              style={{
                position: "absolute",
                top: 24,
                left: travel,
                transform: "translateX(-50%)",
                opacity: travelOp * dimAll,
                padding: "10px 24px",
                background: fg,
                borderRadius: 4,
              }}
            >
              <span style={caps(bg === "ink" ? COLORS.ink : COLORS.paper, 26)}>{span.label}</span>
            </div>
          ) : null}

          {stamps.map((s, i) => (
            <RailStamp
              key={i}
              def={s}
              onset={s.ms ?? cue(s.cue, from + 600 + i * 2200, from)}
              railWidth={W}
              fg={fg}
              dim={dim}
              dimAll={dimAll}
            />
          ))}

          {/* a figure set AGAINST the span (e.g. "2" approvals across the rail) */}
          {/* the badge hangs well BELOW the stamps' own sub-labels — at the old
              offset a wide sub ran straight through them */}
          {badge ? (
            <div style={{ position: "absolute", top: 168, left: W * badge.at, transform: "translateX(-50%)", textAlign: "center", width: 780, ...badgeSt }}>
              <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 124, letterSpacing: TRACK.display, color: fg, lineHeight: 0.9 }}>{badge.text}</div>
              {badge.sub ? <div style={{ ...caps(dim, TYPE.labelSm), marginTop: 14, whiteSpace: "nowrap" }}>{badge.sub}</div> : null}
            </div>
          ) : null}
        </div>

        {note ? (
          <div style={{ ...notePop, marginTop: 34, textAlign: "center" }}>
            <div style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: V ? 48 : 56, letterSpacing: TRACK.headline, color: fg, lineHeight: 1.16, maxWidth: W, margin: "0 auto" }}>
              {note.text}
            </div>
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

// ── NameReveal — a generic name sets, then the BRAND name reveals at hero scale
//    on its own spoken word. An optional dated ANCHOR chip TRAVELS in from a
//    position the previous beat left it at (dock-and-travel, never a crossfade)
//    and parks top-left, so the new beat inherits the old one's element instead
//    of replacing it. Emphasis is scale + weight, not colour — monochrome-safe.
//    (added BioIntel GSK×Jideytro longform, 2026-07-31) (ink or paper)
// the status stamp under a NameReveal — its own component so the hook isn't
// called conditionally in the parent
const NameBadge: React.FC<{
  badge: { text: string; cue?: string; ms?: number; Icon?: IconC };
  fallbackMs: number;
  from: number;
  fg: string;
  dim: string;
}> = ({ badge, fallbackMs, from, fg, dim }) => {
  const on = badge.ms ?? cue(badge.cue, fallbackMs, from);
  const st = useStamp(on, { from: 1.12 });
  const B = badge.Icon;
  return (
    <div style={{ ...st, marginTop: 34, display: "inline-flex", alignItems: "center", gap: 16, alignSelf: "flex-start", padding: "14px 26px", border: `2px solid ${dim}`, borderRadius: 6 }}>
      {B ? <B size={34} color={fg} /> : null}
      <span style={caps(fg)}>{badge.text}</span>
    </div>
  );
};

export const NameReveal: React.FC<Win & {
  bg?: "ink" | "paper";
  /** the element handed over from the previous beat */
  anchor?: { label: string; sub?: string; from?: { x: number; y: number } };
  generic: { text: string; label?: string; cue?: string; ms?: number };
  brand: { text: string; label?: string; cue?: string; ms?: number };
  /** a mark that breathes alongside the names */
  Icon?: IconC;
  /** a status that STAMPS after the brand name lands */
  badge?: { text: string; cue?: string; ms?: number; Icon?: IconC };
}> = ({ from, to, bg = "paper", anchor, generic, brand, Icon, badge }) => {
  const acc = useAccent(); // card look: the ONE emphasis (red; white in the red world)
  const ms = useMs();
  const vis = useVis(from, to);
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const dim = bg === "ink" ? INK_SUB : COLORS.grayText;
  const rule = bg === "ink" ? "rgba(255,255,255,0.22)" : COLORS.border;

  const padX = V ? 72 : 160;
  const dockX = padX;
  const dockY = V ? 240 : 210;
  // the anchor travels from where the last beat left it to its dock — one motion,
  // no fade, so the eye tracks the SAME element across the world change.
  const trav = clamp01(interpolate(ms, [from, from + 760], [0, 1], { ...CLAMP, easing: Easing.inOut(Easing.cubic) }));
  const ax = anchor?.from ? interpolate(trav, [0, 1], [anchor.from.x, dockX], CLAMP) : dockX;
  const ay = anchor?.from ? interpolate(trav, [0, 1], [anchor.from.y, dockY], CLAMP) : dockY;
  // it also shrinks as it docks — arriving as a label, not still the headline
  const aScale = anchor?.from ? interpolate(trav, [0, 1], [1, 0.52], CLAMP) : 0.52;

  const genOn = generic.ms ?? cue(generic.cue, from + 900, from);
  const gen = usePop(genOn, { rise: 18 });
  const brOn = brand.ms ?? cue(brand.cue, from + 2400, from);
  const br = useStamp(brOn, { from: 1.1 });
  const barW = clamp01(interpolate(ms, [brOn + 200, brOn + 1000], [0, 1], CLAMP)) * (V ? 380 : 560);

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {anchor ? (
        <div style={{ position: "absolute", left: ax, top: ay, transform: `scale(${aScale})`, transformOrigin: "left top", display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 62, letterSpacing: TRACK.display, color: fg, lineHeight: 1 }}>{anchor.label}</div>
          {anchor.sub ? (
            <>
              <div style={{ width: 26, height: 2, background: rule }} />
              <div style={caps(dim)}>{anchor.sub}</div>
            </>
          ) : null}
        </div>
      ) : null}

      <AbsoluteFill style={{ justifyContent: "center", padding: `0 ${padX}px` }}>
        {Icon ? (
          <div style={{ marginBottom: 28 }}>
            <IconMotion Icon={Icon} onset={genOn} size={V ? 54 : 68} color={dim} breathe />
          </div>
        ) : null}
        <div style={gen}>
          {generic.label ? <div style={{ ...caps(dim, TYPE.labelSm), marginBottom: 16 }}>{generic.label}</div> : null}
          {/* the generic name TYPES — a chemical name being entered on a record —
              so the brand name that follows lands as the human-readable answer */}
          <Typed
            text={generic.text}
            onset={genOn}
            msPerChar={46}
            style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: V ? 56 : 74, letterSpacing: TRACK.headline, color: dim, lineHeight: 1 }}
          />
        </div>
        <div style={{ ...br, marginTop: V ? 34 : 40, transformOrigin: "left center" }}>
          {brand.label ? <div style={{ ...caps(dim, TYPE.labelSm), marginBottom: 18 }}>{brand.label}</div> : null}
          <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: V ? 132 : 200, letterSpacing: TRACK.display, color: fg, lineHeight: 0.94 }}>
            {brand.text}
          </div>
        </div>
        <div style={{ height: 8, width: barW, background: acc, marginTop: 30, borderRadius: 0 }} />
        {badge ? <NameBadge badge={badge} fallbackMs={brOn + 900} from={from} fg={fg} dim={dim} /> : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── CriteriaStack — a list of QUALIFIERS that builds one line at a time on its
//    spoken cue, hung off a spine that grows downward as each lands. Reach for it
//    when the script reads out a narrowing definition (a label, an eligibility
//    rule, a set of conditions): the stack accumulating IS the point — by the last
//    row the audience can see how narrow the thing actually is.
//    (added BioIntel GSK×Jideytro longform, 2026-07-31) (ink or paper)
const CriteriaRow: React.FC<{
  text: string;
  onset: number;
  index: number;
  /** ms the NEXT row lands — this row recedes then, so the newest reads brightest */
  nextOnset: number;
  fg: string;
  dim: string;
  size: number;
  rowH: number;
  Icon?: IconC;
}> = ({ text, onset, index, nextOnset, fg, dim, size, rowH, Icon }) => {
  const ms = useMs();
  const pop = usePop(onset, { rise: 14 });
  const tick = clamp01(interpolate(ms, [onset - 120, onset + 220], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) }));
  // each landed row steps back as the next arrives — the list reads as a filter
  // being applied in sequence rather than a static bullet stack
  const recede = interpolate(ms, [nextOnset, nextOnset + 500], [1, 0.46], CLAMP);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 22, height: rowH, opacity: recede }}>
      <div style={{ width: 30, flexShrink: 0, textAlign: "right", ...caps(dim, TYPE.labelSm), opacity: tick }}>
        {String(index + 1).padStart(2, "0")}
      </div>
      <div style={{ width: 26 * tick, height: 2, background: dim, flexShrink: 0 }} />
      {Icon ? (
        <div style={{ opacity: tick, flexShrink: 0 }}>
          <Icon size={Math.round(size * 0.72)} color={dim} />
        </div>
      ) : null}
      <div style={{ ...pop, fontFamily: DISPLAY, fontWeight: 600, fontSize: size, letterSpacing: TRACK.headline, color: fg, lineHeight: 1.05 }}>
        {text}
      </div>
    </div>
  );
};

export const CriteriaStack: React.FC<Win & {
  kicker?: string;
  headline?: string;
  headlineCue?: string;
  headlineMs?: number;
  rows: { text: string; cue?: string; ms?: number; Icon?: IconC }[];
  /** a caps line that lands once the stack is complete */
  tag?: string;
  tagCue?: string;
  tagMs?: number;
  bg?: "ink" | "paper";
  size?: number;
}> = ({ from, to, kicker, headline, headlineCue, headlineMs, rows, tag, tagCue, tagMs, bg = "paper", size }) => {
  const ms = useMs();
  const vis = useVis(from, to);
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const dim = bg === "ink" ? INK_SUB : COLORS.grayText;
  const spineCol = bg === "ink" ? "rgba(255,255,255,0.24)" : COLORS.border;
  const type = size ?? (V ? 44 : 58);
  const rowH = Math.round(type * 1.55);

  const k = usePop(from + 200, { rise: 14 });
  const hdOn = headlineMs ?? cue(headlineCue, from + 700, from);
  const hd = usePop(hdOn, { rise: 18 });
  const onsets = rows.map((r, i) => r.ms ?? cue(r.cue, from + 1800 + i * 1600, from));
  const tagOn = tagMs ?? (tag ? cue(tagCue, Math.max(...onsets) + 1400, from) : Number.MAX_SAFE_INTEGER);
  const tg = usePop(tagOn, { rise: 12 });

  // the spine grows to the last row that has landed — the definition narrowing
  const landed = onsets.reduce((n, o) => n + clamp01(interpolate(ms, [o - 120, o + 260], [0, 1], CLAMP)), 0);
  const spineH = Math.min(landed, rows.length) * rowH;

  return (
    <AbsoluteFill style={{ opacity: vis, justifyContent: "center", padding: V ? "0 66px" : "0 150px" }}>
      {kicker ? <div style={{ ...k, marginBottom: 18 }}><div style={caps(dim, TYPE.labelSm)}>{kicker}</div></div> : null}
      {headline ? (
        <div style={{ ...hd, marginBottom: V ? 30 : 38 }}>
          <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: V ? 66 : 84, letterSpacing: TRACK.display, color: fg, lineHeight: 1.04 }}>{headline}</div>
        </div>
      ) : null}
      <div style={{ display: "flex" }}>
        <div style={{ width: 2, background: spineCol, height: spineH, flexShrink: 0, marginRight: 0 }} />
        <div style={{ display: "flex", flexDirection: "column" }}>
          {rows.map((r, i) => (
            <CriteriaRow
              key={i}
              text={r.text}
              onset={onsets[i]}
              index={i}
              nextOnset={i + 1 < onsets.length ? onsets[i + 1] : Number.MAX_SAFE_INTEGER}
              fg={fg}
              dim={dim}
              size={type}
              rowH={rowH}
              Icon={r.Icon}
            />
          ))}
        </div>
      </div>
      {tag ? <div style={{ ...tg, marginTop: V ? 34 : 44 }}><div style={{ ...caps(dim) }}>{tag}</div></div> : null}
    </AbsoluteFill>
  );
};

// ── ThesisColumns — TWO criteria stood up side by side, each drawing in on its
//    own spoken cue, then a single BRACKET closing around both. Reach for it when
//    a script names the two things something was judged on / built against: the
//    bracket arriving is the "…both" — the relationship is enacted, not typeset.
//    Deliberately carries no figures. (added BioIntel GSK×Jideytro, 2026-07-31)
const ThesisColumn: React.FC<{
  label: string;
  sub?: string;
  onset: number;
  fg: string;
  dim: string;
  rule: string;
  w: number;
  Icon?: IconC;
}> = ({ label, sub, onset, fg, dim, rule, w, Icon }) => {
  const ms = useMs();
  // the column DRAWS: a rule descends, then the label rises into place under it
  const draw = clamp01(interpolate(ms, [onset, onset + 620], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) }));
  const pop = usePop(onset + 180, { rise: 18 });
  return (
    <div style={{ width: w, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
      {Icon ? (
        <div style={{ marginBottom: 26 }}>
          <IconMotion Icon={Icon} onset={onset} size={V ? 56 : 72} color={fg} breathe />
        </div>
      ) : null}
      <div style={{ width: 3, height: (V ? 120 : 150) * draw, background: rule }} />
      <div style={{ ...pop, marginTop: 30 }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: V ? 48 : 62, letterSpacing: TRACK.headline, color: fg, lineHeight: 1.06 }}>
          {label}
        </div>
        {sub ? <div style={{ ...caps(dim, TYPE.labelSm), marginTop: 18 }}>{sub}</div> : null}
      </div>
    </div>
  );
};

export const ThesisColumns: React.FC<Win & {
  kicker?: string;
  columns: { label: string; sub?: string; cue?: string; ms?: number; Icon?: IconC }[];
  /** the bracket that closes around every column at once */
  bracket?: { cue?: string; ms?: number; label?: string };
  bg?: "ink" | "paper";
}> = ({ from, to, kicker, columns, bracket, bg = "ink" }) => {
  const ms = useMs();
  const vis = useVis(from, to);
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const dim = bg === "ink" ? INK_SUB : COLORS.grayText;
  const rule = bg === "ink" ? "rgba(255,255,255,0.32)" : COLORS.border;

  const k = usePop(from + 200, { rise: 14 });
  const onsets = columns.map((c, i) => c.ms ?? cue(c.cue, from + 1200 + i * 2600, from));

  const brOn = bracket ? (bracket.ms ?? cue(bracket.cue, Math.max(...onsets) + 2200, from)) : Number.MAX_SAFE_INTEGER;
  // the bracket CLOSES: both arms travel inward and settle — it doesn't fade up
  const close = clamp01(interpolate(ms, [brOn, brOn + 620], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) }));
  const slide = interpolate(close, [0, 1], [64, 0], CLAMP);
  const brLabel = usePop(brOn + 320, { rise: 14 });

  const colW = V ? 380 : 460;
  const gap = V ? 40 : 120;
  const groupW = columns.length * colW + (columns.length - 1) * gap;
  const armH = V ? 300 : 340;
  const arm = 34; // the bracket's horizontal returns

  return (
    <AbsoluteFill style={{ opacity: vis, justifyContent: "center", alignItems: "center" }}>
      {kicker ? <div style={{ ...k, marginBottom: V ? 46 : 58 }}><div style={caps(dim)}>{kicker}</div></div> : null}

      <div style={{ position: "relative", display: "flex", justifyContent: "center", gap }}>
        {columns.map((c, i) => (
          <ThesisColumn key={i} label={c.label} sub={c.sub} onset={onsets[i]} fg={fg} dim={dim} rule={rule} w={colW} Icon={c.Icon} />
        ))}

        {bracket ? (
          <>
            {/* left arm — travels in from outside */}
            <div style={{ position: "absolute", left: -70 - slide, top: -46, height: armH, width: 4, background: fg, opacity: close }}>
              <div style={{ position: "absolute", left: 0, top: 0, width: arm, height: 4, background: fg }} />
              <div style={{ position: "absolute", left: 0, bottom: 0, width: arm, height: 4, background: fg }} />
            </div>
            {/* right arm — mirrored */}
            <div style={{ position: "absolute", left: groupW + 70 + slide, top: -46, height: armH, width: 4, background: fg, opacity: close }}>
              <div style={{ position: "absolute", right: 0, top: 0, width: arm, height: 4, background: fg }} />
              <div style={{ position: "absolute", right: 0, bottom: 0, width: arm, height: 4, background: fg }} />
            </div>
          </>
        ) : null}
      </div>

      {bracket?.label ? (
        <div style={{ ...brLabel, marginTop: V ? 70 : 92 }}>
          <div style={{ ...caps(fg), fontWeight: 700 }}>{bracket.label}</div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// ── DecayCurve — a survival/durability curve that DRAWS left-to-right, with each
//    marker docking on its own spoken cue (the figure lands as it is voiced, the
//    timepoint label docks when it is named). An optional REFERENCE stat sits
//    alongside and DIMS on cue, so a script that says "this number matters more
//    than that one" is enacted with light instead of narrated.
//    Honest axis by default (0–100) — never rescale to exaggerate a fall.
//    (added BioIntel GSK×Jideytro longform, 2026-07-31) (ink or paper)
export type DecayPoint = {
  /** position along the x axis, 0..1 */
  atX: number;
  /** percentage value, 0..100 */
  value: number;
  suffix?: string;
  /** the timepoint label ("6 months") */
  label: string;
  /** when the FIGURE is voiced */
  cue?: string;
  ms?: number;
  /** when the TIMEPOINT is named (defaults to the figure's cue) */
  labelCue?: string;
  labelMs?: number;
};

const CurveMarker: React.FC<{
  x: number;
  y: number;
  point: DecayPoint;
  valueOn: number;
  labelOn: number;
  fg: string;
  dim: string;
  /** distance from this marker down to the 0% axis — the guide stops there */
  guideH: number;
}> = ({ x, y, point, valueOn, labelOn, fg, dim, guideH }) => {
  const ms = useMs();
  const dot = clamp01(interpolate(ms, [valueOn, valueOn + 240], [0, 1], CLAMP));
  const val = usePop(valueOn, { rise: 14, scale: true });
  const lbl = usePop(labelOn, { rise: 10 });
  // a guide drops from the marker to the axis (and no further) as the point lands
  const guide = clamp01(interpolate(ms, [valueOn + 120, valueOn + 620], [0, 1], CLAMP));
  return (
    <div style={{ position: "absolute", left: x, top: y }}>
      <div style={{ position: "absolute", left: -1.5, top: 0, width: 3, height: guide * guideH, background: dim, opacity: 0.28 }} />
      <div style={{ position: "absolute", left: -11, top: -11, width: 22, height: 22, borderRadius: 22, background: fg, opacity: dot }} />
      {/* the figure sits ABOVE the marker, its timepoint BELOW — the curve passes
          through the middle, so anything typeset on the line gets struck by it */}
      <div style={{ position: "absolute", left: -150, top: -136, width: 300, textAlign: "center", ...val }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: V ? 68 : 88, letterSpacing: TRACK.display, color: fg, lineHeight: 1 }}>
          {point.value}
          {point.suffix ?? "%"}
        </div>
      </div>
      <div style={{ position: "absolute", left: -150, top: 42, width: 300, textAlign: "center", ...lbl }}>
        <div style={caps(dim)}>{point.label}</div>
      </div>
    </div>
  );
};

export const DecayCurve: React.FC<Win & {
  kicker?: string;
  /** the t=0 anchor the curve falls from */
  baseline?: { label: string; value?: number };
  points: DecayPoint[];
  /** a stat shown alongside that RECEDES when the curve becomes the point */
  reference?: { label: string; value: string; dimCue?: string; dimMs?: number; dimTo?: number };
  bg?: "ink" | "paper";
  width?: number;
  height?: number;
}> = ({ from, to, kicker, baseline, points, reference, bg = "paper", width, height }) => {
  const ms = useMs();
  const vis = useVis(from, to);
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const dim = bg === "ink" ? INK_SUB : COLORS.grayText;
  const grid = bg === "ink" ? "rgba(255,255,255,0.12)" : COLORS.border;

  const W = width ?? (V ? 820 : 1180);
  const H = height ?? (V ? 420 : 380);
  const base = baseline?.value ?? 100;
  const y = (v: number) => (1 - v / 100) * H;

  const valueOns = points.map((p, i) => p.ms ?? cue(p.cue, from + 1600 + i * 3000, from));
  const labelOns = points.map((p, i) => p.labelMs ?? (p.labelCue ? cue(p.labelCue, valueOns[i], from) : valueOns[i]));

  // the curve reveals segment by segment — each stretch draws as its point lands
  let reveal = 0;
  let prevX = 0;
  points.forEach((p, i) => {
    const seg = clamp01(interpolate(ms, [valueOns[i], valueOns[i] + 700], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) }));
    reveal += (p.atX * W - prevX) * seg;
    prevX = p.atX * W;
  });

  const refDimOn = reference ? (reference.dimMs ?? cue(reference.dimCue, Number.MAX_SAFE_INTEGER, from)) : Number.MAX_SAFE_INTEGER;
  const refOp = reference
    ? interpolate(ms, [refDimOn, refDimOn + 700], [1, reference.dimTo ?? 0.3], CLAMP)
    : 1;
  const refPop = usePop(from + 300, { rise: 14 });
  const k = usePop(from + 200, { rise: 14 });

  const d = `M 0 ${y(base)} ` + points.map((p) => `L ${p.atX * W} ${y(p.value)}`).join(" ");

  return (
    <AbsoluteFill style={{ opacity: vis, justifyContent: "center", alignItems: "center" }}>
      <div style={{ width: W }}>
        {kicker ? <div style={{ ...k, marginBottom: 26 }}><div style={caps(dim)}>{kicker}</div></div> : null}

        {/* the reference stat — present, then RECEDING once the curve is the point */}
        {reference ? (
          <div style={{ ...refPop, opacity: (refPop.opacity as number) * refOp, display: "flex", alignItems: "baseline", gap: 18, marginBottom: 34 }}>
            <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: V ? 72 : 96, letterSpacing: TRACK.display, color: fg, lineHeight: 1 }}>
              {reference.value}
            </div>
            <div style={caps(dim)}>{reference.label}</div>
          </div>
        ) : null}

        <div style={{ position: "relative", height: H + 120, paddingTop: 110 }}>
          {/* honest axis — 100 at the top, 0 at the bottom, never rescaled */}
          <div style={{ position: "absolute", left: 0, right: 0, top: 110 + y(100), height: 2, background: grid }} />
          <div style={{ position: "absolute", left: 0, right: 0, top: 110 + y(0), height: 2, background: grid }} />
          <div style={{ position: "absolute", right: 0, top: 110 + y(100) - 34, ...caps(dim, TYPE.labelSm) }}>100%</div>
          <div style={{ position: "absolute", right: 0, top: 110 + y(0) + 12, ...caps(dim, TYPE.labelSm) }}>0%</div>

          {/* the curve, revealed left to right */}
          <div style={{ position: "absolute", left: 0, top: 110, width: W, height: H, clipPath: `inset(0 ${Math.max(0, W - reveal)}px 0 0)` }}>
            <svg width={W} height={H} style={{ overflow: "visible" }}>
              <path d={d} fill="none" stroke={fg} strokeWidth={5} strokeLinejoin="round" strokeLinecap="round" />
            </svg>
          </div>

          {/* the t=0 anchor */}
          <div style={{ position: "absolute", left: 0, top: 110 + y(base) - 9, width: 18, height: 18, borderRadius: 18, border: `4px solid ${fg}`, background: bg === "ink" ? COLORS.ink : COLORS.paper }} />
          {baseline ? (
            <div style={{ position: "absolute", left: 0, top: 110 + y(base) + 26, ...caps(dim, TYPE.labelSm) }}>{baseline.label}</div>
          ) : null}

          {points.map((p, i) => (
            <CurveMarker
              key={i}
              x={p.atX * W}
              y={110 + y(p.value)}
              point={p}
              valueOn={valueOns[i]}
              labelOn={labelOns[i]}
              fg={fg}
              dim={dim}
              guideH={y(0) - y(p.value)}
            />
          ))}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── DayStrip — a MONTH rendered as countable day ticks. Specific days ignite on
//    their spoken cue; the run between two of them fills tick-by-tick while a
//    counter reads up, so a gap the VO states as a number is something the viewer
//    can actually COUNT. A date beyond the month sits OFF the strip behind a
//    dashed continuation — "not on this page" says "months away" without a
//    second axis or a rescale.
//
//    Reach for it when a script's point is a SHORT interval (days/weeks). Once
//    the horizon passes a month, hand off to <DateRail>, which is month-scale.
//    (added BioIntel GSK×Jideytro longform, 2026-07-31) (ink or paper)
const DayTick: React.FC<{
  x: number;
  w: number;
  restH: number;
  fullH: number;
  igniteAt: number;
  base: string;
  fill: string;
  marked: boolean;
  build: number;
}> = ({ x, w, restH, fullH, igniteAt, base, fill, marked, build }) => {
  const ms = useMs();
  const p = clamp01(interpolate(ms, [igniteAt, igniteAt + 200], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) }));
  // EVERY day rests at the same low height — a marked day only grows once its
  // cue fires, so an un-ignited date can't read as an unexplained tall bar.
  const grow = marked ? p : p * 0.42;
  const h = (restH + (fullH - restH) * grow) * build;
  return (
    <div style={{ position: "absolute", left: x, bottom: 0, width: w, height: h, borderRadius: 3, background: base, overflow: "hidden" }}>
      <div style={{ position: "absolute", inset: 0, background: fill, opacity: p }} />
    </div>
  );
};

// the date numeral under each tick — the thing that makes the strip legible as
// a CALENDAR rather than a chart. Marked days brighten and bolden on ignition.
const DayNumeral: React.FC<{
  x: number;
  w: number;
  day: number;
  igniteAt: number;
  dim: string;
  fg: string;
  marked: boolean;
  build: number;
}> = ({ x, w, day, igniteAt, dim, fg, marked, build }) => {
  const ms = useMs();
  const p = marked ? clamp01(interpolate(ms, [igniteAt, igniteAt + 200], [0, 1], CLAMP)) : 0;
  return (
    <div
      style={{
        position: "absolute",
        left: x,
        top: 0,
        width: w,
        textAlign: "center",
        fontFamily: SANS,
        fontWeight: marked ? 700 : 500,
        fontSize: 15,
        color: p > 0 ? fg : dim,
        opacity: (marked ? 0.55 + 0.45 * p : 0.42) * build,
      }}
    >
      {day}
    </div>
  );
};

const DayMark: React.FC<{
  x: number;
  label: string;
  sub?: string;
  onset: number;
  fg: string;
  dim: string;
}> = ({ x, label, sub, onset, fg, dim }) => {
  const pop = usePop(onset, { rise: 16, scale: true });
  // the centring translate and the pop transform live on SEPARATE elements —
  // spreading usePop onto a positioned box silently overwrites its transform
  return (
    <div style={{ position: "absolute", left: x, bottom: 0, transform: "translateX(-50%)", width: 340, textAlign: "center" }}>
      <div style={pop}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: V ? 46 : 62, letterSpacing: TRACK.display, color: fg, lineHeight: 1 }}>{label}</div>
        {sub ? <div style={{ ...caps(dim, TYPE.labelSm), marginTop: 12 }}>{sub}</div> : null}
      </div>
    </div>
  );
};

export const DayStrip: React.FC<Win & {
  monthLabel: string;
  days?: number;
  marks: { day: number; label: string; sub?: string; cue?: string; ms?: number }[];
  /** the run BETWEEN two days, filled tick by tick with a live counter */
  span?: { fromDay: number; toDay: number; unit?: string; cue?: string; ms?: number };
  /** a date beyond this month — sits off the strip behind a dashed continuation */
  offStrip?: { label: string; sub?: string; cue?: string; ms?: number };
  note?: { text: string; cue?: string; ms?: number };
  bg?: "ink" | "paper";
  stripWidth?: number;
}> = ({ from, to, monthLabel, days = 31, marks, span, offStrip, note, bg = "ink", stripWidth }) => {
  const ms = useMs();
  const vis = useVis(from, to);
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const dim = bg === "ink" ? INK_SUB : COLORS.grayText;
  const idle = bg === "ink" ? "rgba(255,255,255,0.16)" : COLORS.border;

  const SW = stripWidth ?? (V ? 900 : 1180);
  const gap = 6;
  const tickW = (SW - gap * (days - 1)) / days;
  const tickH = V ? 92 : 116;
  const xOf = (day: number) => (day - 1) * (tickW + gap);
  const centerOf = (day: number) => xOf(day) + tickW / 2;

  // the strip's own scaffold draws in immediately — the frame is never bare
  const build = clamp01(interpolate(ms, [from, from + 700], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) }));

  const markOns = marks.map((m, i) => m.ms ?? cue(m.cue, from + 900 + i * 2400, from));
  const spanOn = span ? (span.ms ?? cue(span.cue, from + 3000, from)) : Number.MAX_SAFE_INTEGER;
  const spanDays = span ? span.toDay - span.fromDay : 0;
  const stepMs = 150;
  // fill each day of the run in turn, and read the counter off how many have lit
  const filled = span
    ? Math.round(clamp01(interpolate(ms, [spanOn, spanOn + spanDays * stepMs], [0, 1], CLAMP)) * spanDays)
    : 0;

  const offOn = offStrip ? (offStrip.ms ?? cue(offStrip.cue, to - 3000, from)) : Number.MAX_SAFE_INTEGER;
  const offP = clamp01(interpolate(ms, [offOn, offOn + 520], [0, 1], CLAMP));
  const offSettle = interpolate(ms, [offOn + 600, offOn + 1500], [1, 0.42], CLAMP);

  const noteOn = note ? (note.ms ?? cue(note.cue, to - 3200, from)) : Number.MAX_SAFE_INTEGER;
  const notePop = usePop(noteOn, { rise: 18 });
  const dimAll = note ? interpolate(ms, [noteOn - 200, noteOn + 600], [1, 0.5], CLAMP) : 1;

  const isMarked = (d: number) => marks.some((m) => m.day === d);
  const inSpan = (d: number) => (span ? d > span.fromDay && d <= span.toDay : false);

  return (
    <AbsoluteFill style={{ opacity: vis, justifyContent: "center", alignItems: "center" }}>
      <div style={{ width: SW + (offStrip ? (V ? 0 : 440) : 0) }}>
        <div style={{ opacity: dimAll }}>
          {/* the month sits ON the strip's own width with a rule running out to
              each edge, so it reads as this calendar's masthead */}
          <div style={{ width: SW, display: "flex", alignItems: "center", gap: 22, marginBottom: V ? 92 : 122, opacity: build }}>
            <div style={{ height: 2, background: idle, width: 40 }} />
            <div style={{ ...caps(dim, TYPE.labelSm), whiteSpace: "nowrap" }}>{monthLabel}</div>
            <div style={{ height: 2, background: idle, flex: 1 }} />
          </div>

          <div style={{ position: "relative", width: SW, height: tickH }}>
            {/* the marked dates, standing above their own tick */}
            {/* marks alternate height: adjacent dates are often closer together
                than their labels are wide, so they stagger instead of colliding,
                and a thin stem ties each back down to its own tick */}
            {marks.map((m, i) => {
              const lift = tickH + (V ? 30 : 40) + (i % 2 === 0 ? (V ? 96 : 124) : 0);
              return (
                <div key={`m${i}`} style={{ position: "absolute", left: centerOf(m.day), bottom: lift, width: 0 }}>
                  <div
                    style={{
                      position: "absolute",
                      left: -1,
                      bottom: -(lift - tickH),
                      width: 2,
                      height: lift - tickH,
                      background: dim,
                      opacity: clamp01(interpolate(ms, [markOns[i], markOns[i] + 320], [0, 0.45], CLAMP)),
                    }}
                  />
                  <DayMark x={0} label={m.label} sub={m.sub} onset={markOns[i]} fg={fg} dim={dim} />
                </div>
              );
            })}

            {/* every day of the month — the scaffold, present from frame one */}
            {Array.from({ length: days }).map((_, i) => {
              const d = i + 1;
              const marked = isMarked(d);
              const lit = marked
                ? markOns[marks.findIndex((m) => m.day === d)]
                : inSpan(d)
                ? spanOn + (d - (span?.fromDay ?? 0) - 1) * stepMs
                : Number.MAX_SAFE_INTEGER;
              return (
                <DayTick
                  key={d}
                  x={xOf(d)}
                  w={tickW}
                  restH={tickH * 0.34}
                  fullH={tickH}
                  igniteAt={lit}
                  base={idle}
                  fill={marked ? fg : dim}
                  marked={marked}
                  build={build}
                />
              );
            })}

            {/* the date numerals — what turns a row of ticks into July */}
            <div style={{ position: "absolute", left: 0, top: tickH + 14, width: SW, height: 20 }}>
              {Array.from({ length: days }).map((_, i) => {
                const d = i + 1;
                const marked = isMarked(d);
                return (
                  <DayNumeral
                    key={d}
                    x={xOf(d)}
                    w={tickW}
                    day={d}
                    igniteAt={marked ? markOns[marks.findIndex((m) => m.day === d)] : Number.MAX_SAFE_INTEGER}
                    dim={dim}
                    fg={fg}
                    marked={marked}
                    build={build}
                  />
                );
              })}
            </div>

            {/* the run, counted out beneath the ticks it is filling */}
            {span ? (
              <div style={{ position: "absolute", left: xOf(span.fromDay + 1), top: tickH + 52, width: (tickW + gap) * spanDays - gap, opacity: clamp01(interpolate(ms, [spanOn, spanOn + 260], [0, 1], CLAMP)) }}>
                {/* a measured bracket, not a bare rule — end stops make it read
                    as a span being taken off the calendar */}
                <div style={{ position: "relative", height: 3, background: fg }}>
                  <div style={{ position: "absolute", left: 0, top: -9, width: 3, height: 21, background: fg }} />
                  <div style={{ position: "absolute", right: 0, top: -9, width: 3, height: 21, background: fg }} />
                </div>
                <div style={{ textAlign: "center", marginTop: 22 }}>
                  <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: V ? 60 : 78, letterSpacing: TRACK.display, color: fg, lineHeight: 1, fontVariantNumeric: "tabular-nums" }}>
                    {filled}
                  </span>
                  <span style={{ ...caps(dim), marginLeft: 14 }}>{span.unit ?? "days"}</span>
                </div>
              </div>
            ) : null}

            {/* a date that is not on this page at all */}
            {offStrip && !V ? (
              <div style={{ position: "absolute", left: SW + 40, bottom: 0, opacity: offP * offSettle }}>
                <div style={{ position: "absolute", left: -34, bottom: tickH / 2, width: 70, height: 3, backgroundImage: `repeating-linear-gradient(90deg, ${dim} 0 10px, transparent 10px 20px)` }} />
                <div style={{ paddingLeft: 54 }}>
                  <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 54, letterSpacing: TRACK.display, color: dim, lineHeight: 1, whiteSpace: "nowrap" }}>{offStrip.label}</div>
                  {offStrip.sub ? <div style={{ ...caps(dim, TYPE.labelSm), marginTop: 12, whiteSpace: "nowrap" }}>{offStrip.sub}</div> : null}
                </div>
              </div>
            ) : null}
          </div>
        </div>

        {note ? (
          <div style={{ ...notePop, marginTop: V ? 150 : 190, width: SW }}>
            <div style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: V ? 46 : 54, letterSpacing: TRACK.headline, color: fg, lineHeight: 1.16 }}>{note.text}</div>
          </div>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

// ── PatientMatrix — a cohort drawn as one dot per patient, with the responding
//    share IGNITING on the spoken figure. A percentage becomes a countable group
//    of people instead of a number card. The dot count is the REAL n; the lit
//    count is that n × the rate, so nothing is invented — and the block never
//    labels the lit subset with a figure the source didn't publish.
//    (added BioIntel GSK×Jideytro longform, 2026-07-31) (ink or paper)
const PatientDot: React.FC<{
  lit: boolean;
  onset: number;
  size: number;
  idle: string;
  fg: string;
}> = ({ lit, onset, size, idle, fg }) => {
  const ms = useMs();
  const p = lit ? clamp01(interpolate(ms, [onset, onset + 220], [0, 1], CLAMP)) : 0;
  const s = lit ? interpolate(ms, [onset, onset + 220, onset + 420], [1, 1.35, 1], CLAMP) : 1;
  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <div style={{ position: "absolute", inset: 0, borderRadius: size, background: idle }} />
      <div style={{ position: "absolute", inset: 0, borderRadius: size, background: fg, opacity: p, transform: `scale(${s})` }} />
    </div>
  );
};

export const PatientMatrix: React.FC<Win & {
  kicker?: string;
  /** the real cohort size — one dot each */
  n: number;
  /** the share that responded, 0..100 */
  rate: number;
  rateWord?: string;
  rateMs?: number;
  headline?: string;
  /** caps line under the figure */
  note?: string;
  perRow?: number;
  bg?: "ink" | "paper";
}> = ({ from, to, kicker, n, rate, rateWord, rateMs, headline, note, perRow, bg = "paper" }) => {
  const ms = useMs();
  const vis = useVis(from, to);
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const dim = bg === "ink" ? INK_SUB : COLORS.grayText;
  const idle = bg === "ink" ? "rgba(255,255,255,0.16)" : COLORS.border;

  const cols = perRow ?? (V ? 13 : 21);
  const dot = V ? 34 : 30;
  const gap = V ? 14 : 16;

  const k = usePop(from + 200, { rise: 14 });
  // the cohort assembles first — it is on screen before any claim is made about it
  const buildStart = from + 500;
  const litOn = rateMs ?? cue(rateWord, from + 5000, from);
  const litCount = Math.round((rate / 100) * n);
  const figure = usePop(litOn, { rise: 16, scale: true });
  const nt = usePop(litOn + 420, { rise: 12 });

  return (
    <AbsoluteFill style={{ opacity: vis, justifyContent: "center", alignItems: "center" }}>
      <div style={{ display: "flex", alignItems: "center", gap: V ? 40 : 96, flexDirection: V ? "column" : "row" }}>
        <div>
          {kicker ? <div style={{ ...k, marginBottom: 26 }}><div style={caps(dim, TYPE.labelSm)}>{kicker}</div></div> : null}
          <div style={{ display: "grid", gridTemplateColumns: `repeat(${cols}, ${dot}px)`, gap, width: cols * dot + (cols - 1) * gap }}>
            {Array.from({ length: n }).map((_, i) => (
              <PatientDot
                key={i}
                lit={i < litCount}
                // the responders light in a quick sweep, not all at once
                onset={litOn + (i / Math.max(1, litCount)) * 620}
                size={dot}
                idle={idle}
                fg={fg}
              />
            ))}
          </div>
          <div style={{ ...caps(dim, TYPE.labelSm), marginTop: 26, opacity: clamp01(interpolate(ms, [buildStart, buildStart + 500], [0, 1], CLAMP)) }}>
            {n} patients · one dot each
          </div>
        </div>

        <div style={{ minWidth: V ? 0 : 460 }}>
          <div style={figure}>
            <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: V ? 190 : 250, letterSpacing: TRACK.display, color: fg, lineHeight: 0.9 }}>
              {rate}%
            </div>
          </div>
          {headline ? (
            <div style={{ ...nt, marginTop: 22 }}>
              <div style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: V ? 44 : 50, letterSpacing: TRACK.headline, color: fg, lineHeight: 1.12 }}>{headline}</div>
            </div>
          ) : null}
          {note ? <div style={{ ...nt, marginTop: 18 }}><div style={caps(dim, TYPE.labelSm)}>{note}</div></div> : null}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── AcquisitionCard — an acquisition ENACTED rather than tabulated: the buyer
//    stamps on its name, a connector DRAWS across to the target, the target
//    stamps on its name, and the consideration counts up on the figure that is
//    actually voiced. A secondary figure (the headline deal size) sits under the
//    unit price, and an optional footer carries the close date.
//    bg-aware — the kit's DealTicket is paper-only, this one works on ink.
//    (added BioIntel GSK×Jideytro longform, 2026-07-31)
export const AcquisitionCard: React.FC<Win & {
  kicker?: string;
  buyer: { name: string; cue?: string; ms?: number };
  target: { name: string; cue?: string; ms?: number };
  connector?: string;
  /** the figure the VO actually speaks — this is what counts up */
  unit: { value: number; decimals?: number; prefix?: string; suffix?: string; cue?: string; ms?: number; durationMs?: number };
  /** the headline size, set (not counted) beneath — it was revealed elsewhere */
  total?: { text: string; label?: string };
  footer?: string;
  Icon?: IconC;
  bg?: "ink" | "paper";
}> = ({ from, to, kicker, buyer, target, connector = "acquires", unit, total, footer, Icon, bg = "ink" }) => {
  const ms = useMs();
  const vis = useVis(from, to);
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const dim = bg === "ink" ? INK_SUB : COLORS.grayText;
  const rule = bg === "ink" ? "rgba(255,255,255,0.22)" : COLORS.border;

  const k = usePop(from + 200, { rise: 14 });
  const bOn = buyer.ms ?? cue(buyer.cue, from + 400, from);
  const tOn = target.ms ?? cue(target.cue, from + 2000, from);
  const uOn = unit.ms ?? cue(unit.cue, from + 4200, from);

  const bSt = useStamp(bOn, { from: 1.1 });
  const tSt = useStamp(tOn, { from: 1.1 });
  // the connector DRAWS from buyer to target — the deal is a movement, not a row
  const draw = clamp01(interpolate(ms, [bOn + 260, tOn], [0, 1], { ...CLAMP, easing: Easing.inOut(Easing.cubic) }));
  const connOp = clamp01(interpolate(ms, [bOn + 260, bOn + 560], [0, 1], CLAMP));
  const totalPop = usePop(uOn + 700, { rise: 14 });
  const footPop = usePop(uOn + 1000, { rise: 12 });

  const nameStyle: React.CSSProperties = {
    fontFamily: DISPLAY,
    fontWeight: 700,
    fontSize: V ? 62 : 86,
    letterSpacing: TRACK.headline,
    color: fg,
    lineHeight: 1,
    whiteSpace: "nowrap",
  };

  return (
    <AbsoluteFill style={{ opacity: vis, justifyContent: "center", padding: V ? "0 66px" : "0 150px" }}>
      {kicker ? (
        <div style={{ ...k, marginBottom: V ? 40 : 52, display: "flex", alignItems: "center", gap: 20 }}>
          {Icon ? <IconMotion Icon={Icon} onset={from + 300} size={V ? 40 : 46} color={dim} breathe /> : null}
          <div style={caps(dim)}>{kicker}</div>
        </div>
      ) : null}

      {/* buyer ─── connector ───▶ target */}
      <div style={{ display: "flex", alignItems: "center", gap: V ? 22 : 34, flexWrap: "nowrap" }}>
        <div style={bSt}><div style={nameStyle}>{buyer.name}</div></div>
        <div style={{ flex: 1, position: "relative", height: 40, minWidth: V ? 90 : 180, opacity: connOp }}>
          <div style={{ position: "absolute", top: 19, left: 0, width: `${draw * 100}%`, height: 3, background: rule }} />
          <div style={{ position: "absolute", top: 8, left: `calc(${draw * 100}% - 12px)`, width: 0, height: 0, borderTop: "11px solid transparent", borderBottom: "11px solid transparent", borderLeft: `14px solid ${rule}` }} />
          <div style={{ position: "absolute", top: -22, width: "100%", textAlign: "center", ...caps(dim, TYPE.labelSm) }}>{connector}</div>
        </div>
        <div style={tSt}><div style={nameStyle}>{target.name}</div></div>
      </div>

      <div style={{ height: 2, background: rule, margin: V ? "44px 0" : "56px 0", opacity: connOp }} />

      {/* the consideration — the voiced figure counts, the headline size is set */}
      <div style={{ display: "flex", alignItems: "flex-end", gap: V ? 34 : 70, flexWrap: "wrap" }}>
        <CountUp
          fromMs={uOn}
          toMs={uOn + (unit.durationMs ?? 900)}
          value={unit.value}
          decimals={unit.decimals ?? 0}
          prefix={unit.prefix}
          suffix={unit.suffix}
          style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: V ? 128 : 186, letterSpacing: TRACK.display, color: fg, lineHeight: 0.9, whiteSpace: "nowrap" }}
        />
        {total ? (
          <div style={{ ...totalPop, paddingBottom: V ? 10 : 18 }}>
            {total.label ? <div style={{ ...caps(dim, TYPE.labelSm), marginBottom: 12 }}>{total.label}</div> : null}
            <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: V ? 72 : 96, letterSpacing: TRACK.display, color: dim, lineHeight: 1 }}>{total.text}</div>
          </div>
        ) : null}
      </div>

      {footer ? <div style={{ ...footPop, marginTop: V ? 30 : 40 }}><div style={caps(dim, TYPE.labelSm)}>{footer}</div></div> : null}
    </AbsoluteFill>
  );
};

// ── OpenSplit — two possibilities held in EQUAL weight on a beam that never
//    tips. The kit's VersusSplit resolves a comparison (one side stamps, the
//    other is struck); this one deliberately refuses to. Reach for it when the
//    script frames a QUESTION rather than reaching a verdict — an editorial line
//    that must not read as a prediction. Both sides get identical size, weight
//    and opacity, there are no ✓/✗ marks, and the beam stays perfectly level:
//    the stillness is the statement. No wobble — an oscillating balance would
//    imply it is about to fall one way.
//    (added BioIntel GSK×Jideytro longform, 2026-07-31) (ink or paper)
export const OpenSplit: React.FC<Win & {
  question?: string;
  questionCue?: string;
  questionMs?: number;
  left: { label: string; sub?: string; cue?: string; ms?: number };
  right: { label: string; sub?: string; cue?: string; ms?: number };
  connector?: string;
  connectorCue?: string;
  connectorMs?: number;
  /** the sum being weighed — sits ON the fulcrum, above the beam, and lands on
   *  its own spoken figure. It is what the two sides are alternatives FOR. */
  weight?: { text: string; label?: string; cue?: string; ms?: number };
  bg?: "ink" | "paper";
}> = ({ from, to, question, questionCue, questionMs, left, right, connector = "or", connectorCue, connectorMs, weight, bg = "paper" }) => {
  const ms = useMs();
  const vis = useVis(from, to);
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const dim = bg === "ink" ? INK_SUB : COLORS.grayText;
  const rule = bg === "ink" ? "rgba(255,255,255,0.28)" : COLORS.border;

  const qOn = questionMs ?? cue(questionCue, from + 300, from);
  const q = usePop(qOn, { rise: 14 });
  const lOn = left.ms ?? cue(left.cue, from + 2200, from);
  const rOn = right.ms ?? cue(right.cue, from + 4200, from);
  const cOn = connectorMs ?? cue(connectorCue, (lOn + rOn) / 2, from);

  // both sides use the SAME stamp treatment — no asymmetry anywhere
  const lSt = useStamp(lOn, { from: 1.1 });
  const rSt = useStamp(rOn, { from: 1.1 });
  const conn = usePop(cOn, { rise: 10 });
  const wOn = weight ? (weight.ms ?? cue(weight.cue, from + 1200, from)) : Number.MAX_SAFE_INTEGER;
  const wt = usePop(wOn, { rise: 20, scale: true });

  // the beam draws out from the fulcrum in both directions at once, and holds
  const beam = clamp01(interpolate(ms, [lOn - 300, lOn + 500], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) }));

  const half = V ? 300 : 480;
  const bigStyle: React.CSSProperties = {
    fontFamily: DISPLAY,
    fontWeight: 700,
    fontSize: V ? 66 : 96,
    letterSpacing: TRACK.display,
    color: fg,
    lineHeight: 1.04,
  };

  return (
    <AbsoluteFill style={{ opacity: vis, justifyContent: "center", alignItems: "center", textAlign: "center" }}>
      {question ? (
        <div style={{ ...q, marginBottom: V ? 66 : 84, maxWidth: V ? 860 : 1200 }}>
          <div style={caps(dim)}>{question}</div>
        </div>
      ) : null}

      {/* the sum sitting on the fulcrum — the thing actually being weighed */}
      {weight ? (
        <div style={{ ...wt, marginBottom: V ? 34 : 42, textAlign: "center" }}>
          <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: V ? 150 : 210, letterSpacing: TRACK.display, color: fg, lineHeight: 0.92 }}>
            {weight.text}
          </div>
          {weight.label ? <div style={{ ...caps(dim, TYPE.labelSm), marginTop: 18 }}>{weight.label}</div> : null}
        </div>
      ) : null}

      {/* the beam — level, and it stays level */}
      <div style={{ position: "relative", width: half * 2, height: 6, marginBottom: V ? 54 : 66 }}>
        <div style={{ position: "absolute", left: half - half * beam, width: half * 2 * beam, height: 3, background: rule, top: 0 }} />
        {/* the fulcrum */}
        <div
          style={{
            position: "absolute",
            left: half - 13,
            top: 3,
            width: 0,
            height: 0,
            borderLeft: "13px solid transparent",
            borderRight: "13px solid transparent",
            borderTop: `20px solid ${rule}`,
            opacity: beam,
          }}
        />
      </div>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: V ? 24 : 56 }}>
        <div style={{ width: half, ...lSt }}>
          <div style={bigStyle}>{left.label}</div>
          {left.sub ? <div style={{ ...caps(dim, TYPE.labelSm), marginTop: 16 }}>{left.sub}</div> : null}
        </div>
        <div style={{ ...conn, width: V ? 60 : 90 }}>
          <div style={caps(dim)}>{connector}</div>
        </div>
        <div style={{ width: half, ...rSt }}>
          <div style={bigStyle}>{right.label}</div>
          {right.sub ? <div style={{ ...caps(dim, TYPE.labelSm), marginTop: 16 }}>{right.sub}</div> : null}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ═══════════════════════════════════════════════════════════════════════════
// NEW (BioIntel Alnylam TTR reel, 2026-08-01). A RHYMING PAIR for a script whose
// closing beats are RELATIONSHIPS, not facts — "competitors are closing in" and
// "incumbency is not a moat". Every existing block would have typeset those
// sentences; these two perform them, and they share one visual family on
// purpose: the same centred incumbent mark, first approached, then breached.
//   • ClosingIn   — named rivals travel INWARD toward the incumbent.
//   • MoatBreach  — the ring around that incumbent FAILS as they cross it.
// Both portrait-first, bg-aware, monochrome (weight + dim only, no colour).
// ═══════════════════════════════════════════════════════════════════════════

// ── ClosingIn — N named entrants stamp at the frame's edges and CONVERGE on a
//    centred incumbent mark, each starting its travel on its own spoken name.
//    A faint ring around the incumbent tightens as they close. Enacts pressure
//    arriving from several directions instead of listing three competitors. ────
export const ClosingIn: React.FC<Win & {
  kicker?: string;
  /** the entity being closed in on — sits centred the whole beat */
  incumbent: string;
  /** the rivals; each travels inward from its edge on its spoken word */
  rivals: { label: string; word: string; ms?: number }[];
  /** a caps line that lands once every rival has arrived */
  tag?: string;
  tagCue?: string;
  tagMs?: number;
  bg?: "ink" | "paper";
  /** how far in (0-1) the rivals end up — 1 = touching the incumbent */
  close?: number;
  /** display-size overrides — match the piece's hero scale */
  incumbentSize?: number;
  rivalSize?: number;
  capsSize?: number;
  /** the ring's [start, end] radius as the rivals arrive. It must stay WIDER
   *  than the incumbent's half-width (~0.29em per glyph) or the perimeter
   *  tightens straight through the word it's supposed to enclose. */
  ringRadius?: [number, number];
}> = ({ from, to, kicker, incumbent, rivals, tag, tagCue, tagMs, bg = "paper", close = 0.62, incumbentSize, rivalSize, capsSize, ringRadius }) => {
  const ms = useMs();
  const vis = useVis(from, to);
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const dim = bg === "ink" ? INK_SUB : COLORS.grayText;
  const ring = bg === "ink" ? "rgba(255,255,255,0.42)" : inkA(0.38);

  const k = usePop(from + 200, { rise: 14 });
  const onsets = rivals.map((r, i) => r.ms ?? cue(r.word, from + 1400 + i * 1200, from));
  const inc = usePop(from + 500, { rise: 18, scale: true });

  // Fixed compass seats so N rivals surround the centre. Portrait puts them
  // top / bottom-left / bottom-right (a tall frame has no room left+right).
  const seats = V
    ? [{ x: 0, y: -1 }, { x: -0.86, y: 0.6 }, { x: 0.86, y: 0.6 }, { x: 0, y: 1 }]
    : [{ x: -1, y: -0.5 }, { x: 1, y: -0.5 }, { x: -1, y: 0.62 }, { x: 1, y: 0.62 }];
  // Portrait needs a WIDER x-reach than instinct suggests: the two bottom seats
  // converge toward the same centre, so a short reach lands their labels on top
  // of each other (caught on the Alnylam build — "Ionis" over "CRISPR-based").
  const REACH = V ? { x: 460, y: 500 } : { x: 620, y: 300 };

  // the ring tightens as more rivals arrive
  const arrived = onsets.reduce((n, o) => n + clamp01(interpolate(ms, [o, o + 900], [0, 1], CLAMP)), 0);
  const ringR = interpolate(arrived, [0, rivals.length], ringRadius ?? [V ? 540 : 300, V ? 420 : 210], CLAMP);
  const tagOn = tagMs ?? (tag ? cue(tagCue, Math.max(...onsets) + 1200, from) : Number.MAX_SAFE_INTEGER);
  const tg = usePop(tagOn, { rise: 12 });

  return (
    <AbsoluteFill style={{ opacity: vis, justifyContent: "center", alignItems: "center", padding: V ? "0 60px" : "0 140px" }}>
      {kicker ? (
        <div style={{ ...k, position: "absolute", top: V ? 300 : 190 }}>
          <div style={caps(dim, capsSize ?? (V ? 30 : 28))}>{kicker}</div>
        </div>
      ) : null}

      <div style={{ position: "relative", width: V ? 900 : 1500, height: V ? 1060 : 700, display: "flex", alignItems: "center", justifyContent: "center" }}>
        {/* the tightening ring around the incumbent */}
        <svg width="100%" height="100%" viewBox={V ? "-450 -530 900 1060" : "-750 -350 1500 700"} style={{ position: "absolute", overflow: "visible" }}>
          <circle cx="0" cy="0" r={ringR} fill="none" stroke={ring} strokeWidth="3.5" strokeDasharray="16 14" />
        </svg>

        {/* the incumbent — centred, present the whole beat */}
        <div style={{ ...inc, textAlign: "center", zIndex: 2 }}>
          <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: incumbentSize ?? (V ? 104 : 88), letterSpacing: TRACK.display, color: fg, lineHeight: 1 }}>{incumbent}</div>
        </div>

        {rivals.map((r, i) => (
          <Closer key={i} label={r.label} onsetMs={onsets[i]} seat={seats[i % seats.length]} reach={REACH} close={close} fg={fg} dim={dim} size={rivalSize} />
        ))}
      </div>

      {tag ? (
        <div style={{ ...tg, position: "absolute", bottom: V ? 300 : 170 }}>
          <div style={caps(dim, capsSize ?? (V ? 30 : 28))}>{tag}</div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// one rival: stamps at its edge seat, then TRAVELS inward (its own component so
// the hooks aren't called inside a .map — rules of hooks)
const Closer: React.FC<{
  label: string;
  onsetMs: number;
  seat: { x: number; y: number };
  reach: { x: number; y: number };
  close: number;
  fg: string;
  dim: string;
  size?: number;
}> = ({ label, onsetMs, seat, reach, close, fg, dim, size }) => {
  const ms = useMs();
  // appear on the word, then close in over the following ~2.2s
  const appear = clamp01(interpolate(ms, [onsetMs, onsetMs + 150], [0, 1], CLAMP));
  const travel = interpolate(ms, [onsetMs + 120, onsetMs + 2300], [0, close], { ...CLAMP, easing: Easing.inOut(Easing.cubic) });
  const x = seat.x * reach.x * (1 - travel);
  const y = seat.y * reach.y * (1 - travel);
  // it gains weight as it arrives — pressure, not just position
  const near = clamp01(travel / Math.max(0.001, close));
  return (
    <div
      style={{
        position: "absolute",
        opacity: appear,
        transform: "translate(" + x + "px, " + y + "px)",
        display: "flex",
        alignItems: "center",
        gap: 12,
      }}
    >
      <span style={{ width: 8, height: 8, borderRadius: 8, background: interpolateColors(near, [0, 1], [dim, fg]), flexShrink: 0 }} />
      <span
        style={{
          fontFamily: DISPLAY,
          fontWeight: interpolate(near, [0, 1], [600, 700], CLAMP),
          fontSize: size ?? (V ? 50 : 54),
          letterSpacing: TRACK.headline,
          color: interpolateColors(near, [0, 1], [dim, fg]),
          lineHeight: 1.06,
          // a "\n" in the label breaks it onto its own line — a long rival name
          // ("CRISPR-based") stacks instead of running into its neighbour
          whiteSpace: "pre-line",
          textAlign: "left",
        }}
      >
        {label}
      </span>
    </div>
  );
};

// ── MoatBreach — the closing half of the pair. A solid ring (the moat) holds a
//    centred incumbent; on the breach cue the ring DISSOLVES segment by segment
//    and marks cross where it used to be, while a struck-through `claim` gives
//    way to the `verdict`. Enacts "not a moat" — the boundary is shown failing,
//    never labelled as failed. ────────────────────────────────────────────────
export const MoatBreach: React.FC<Win & {
  kicker?: string;
  incumbent: string;
  /** the claim being dismantled — renders solid, then is struck on the breach */
  claim: string;
  claimCue?: string;
  claimMs?: number;
  /** the payoff that stamps once the ring has failed */
  verdict: string;
  verdictCue?: string;
  verdictMs?: number;
  /** when the ring starts to fail */
  breachCue?: string;
  breachMs?: number;
  /** how many marks cross the boundary */
  count?: number;
  bg?: "ink" | "paper";
  /** ring radius — must clear the widest line inside it, or the moat cuts
   *  through its own incumbent (budget ~0.29em per glyph at the display size) */
  radius?: number;
  /** display-size overrides — match the piece's hero scale */
  incumbentSize?: number;
  claimSize?: number;
  verdictSize?: number;
  capsSize?: number;
}> = ({ from, to, kicker, incumbent, claim, claimCue, claimMs, verdict, verdictCue, verdictMs, breachCue, breachMs, count = 3, bg = "ink", radius, incumbentSize, claimSize, verdictSize, capsSize }) => {
  const ms = useMs();
  const vis = useVis(from, to);
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const dim = bg === "ink" ? INK_SUB : COLORS.grayText;

  const k = usePop(from + 200, { rise: 14 });
  const claimOn = claimMs ?? cue(claimCue, from + 700, from);
  const breachOn = breachMs ?? cue(breachCue, claimOn + 2400, from);
  const verdictOn = verdictMs ?? cue(verdictCue, breachOn + 1600, from);

  const cl = usePop(claimOn, { rise: 20 });
  const vd = useStamp(verdictOn);
  // the claim dims and is struck as the ring gives way
  const strike = clamp01(interpolate(ms, [breachOn, breachOn + 620], [0, 1], CLAMP));
  const claimDim = interpolate(strike, [0, 1], [1, 0.34], CLAMP);

  const R = radius ?? (V ? 300 : 210);
  const SEGS = 14;
  // each ring segment fades at its own moment — the boundary fails progressively
  const segAlpha = (i: number) => clamp01(interpolate(ms, [breachOn + i * 46, breachOn + 560 + i * 46], [1, 0], CLAMP));

  return (
    <AbsoluteFill style={{ opacity: vis, justifyContent: "center", alignItems: "center", padding: V ? "0 70px" : "0 150px" }}>
      {kicker ? (
        <div style={{ ...k, position: "absolute", top: V ? 300 : 180 }}>
          <div style={caps(dim, capsSize ?? (V ? 30 : 28))}>{kicker}</div>
        </div>
      ) : null}

      <div style={{ position: "relative", width: V ? 900 : 1400, height: V ? 880 : 620, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="100%" height="100%" viewBox={V ? "-450 -440 900 880" : "-700 -310 1400 620"} style={{ position: "absolute", overflow: "visible" }}>
          {/* the moat: a segmented ring that draws in, then fails piece by piece */}
          {Array.from({ length: SEGS }).map((_, i) => {
            const a0 = (i / SEGS) * Math.PI * 2;
            const a1 = ((i + 0.72) / SEGS) * Math.PI * 2;
            const draw = clamp01(interpolate(ms, [from + 300 + i * 40, from + 700 + i * 40], [0, 1], CLAMP));
            const x0 = Math.cos(a0) * R;
            const y0 = Math.sin(a0) * R;
            const x1 = Math.cos(a0 + (a1 - a0) * draw) * R;
            const y1 = Math.sin(a0 + (a1 - a0) * draw) * R;
            return (
              <path
                key={i}
                d={"M " + x0 + " " + y0 + " A " + R + " " + R + " 0 0 1 " + x1 + " " + y1}
                fill="none"
                stroke={fg}
                strokeWidth="4"
                strokeLinecap="round"
                opacity={0.85 * segAlpha(i)}
              />
            );
          })}
          {/* the marks that cross where the boundary used to be */}
          {Array.from({ length: count }).map((_, i) => {
            const a = -Math.PI / 2 + (i / count) * Math.PI * 2 + 0.4;
            const t = clamp01(interpolate(ms, [breachOn + 260 + i * 190, breachOn + 1500 + i * 190], [0, 1], { ...CLAMP, easing: Easing.inOut(Easing.cubic) }));
            const rFrom = R + (V ? 190 : 160);
            const rTo = R - (V ? 96 : 80);
            const r = interpolate(t, [0, 1], [rFrom, rTo], CLAMP);
            return (
              <g key={i} opacity={clamp01(interpolate(ms, [breachOn + 200 + i * 190, breachOn + 480 + i * 190], [0, 1], CLAMP))}>
                <line
                  x1={Math.cos(a) * rFrom}
                  y1={Math.sin(a) * rFrom}
                  x2={Math.cos(a) * r}
                  y2={Math.sin(a) * r}
                  stroke={dim}
                  strokeWidth="2"
                  strokeDasharray="6 8"
                />
                <circle cx={Math.cos(a) * r} cy={Math.sin(a) * r} r="9" fill={fg} />
              </g>
            );
          })}
        </svg>

        <div style={{ textAlign: "center", zIndex: 2, maxWidth: V ? 560 : 700 }}>
          <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: incumbentSize ?? (V ? 88 : 76), letterSpacing: TRACK.display, color: fg, lineHeight: 1 }}>{incumbent}</div>
          <div style={{ ...cl, position: "relative", marginTop: 16, opacity: claimDim }}>
            <div style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: claimSize ?? (V ? 52 : 46), letterSpacing: TRACK.headline, color: dim, lineHeight: 1.14 }}>{claim}</div>
            <div style={{ position: "absolute", left: 0, top: "50%", height: 3, width: strike * 100 + "%", background: dim }} />
          </div>
        </div>
      </div>

      <div style={{ ...vd, position: "absolute", bottom: V ? 300 : 170, textAlign: "center", padding: "0 40px" }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: verdictSize ?? (V ? 108 : 96), letterSpacing: TRACK.display, color: fg, lineHeight: 1.02 }}>{verdict}</div>
      </div>
    </AbsoluteFill>
  );
};
