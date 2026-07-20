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
import { AbsoluteFill, Easing, Img, interpolate, interpolateColors, OffthreadVideo, Sequence, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { CLAMP, clamp01, caps, COLORS, CountUp, cue, cueMs, DISPLAY, INK_SUB, msToFrame, SANS, TRACK, useMs, usePop, useStamp } from "./core";
import { Wordmark } from "./ui";
import { IconSyringe, IconPill } from "./icons";
import { FORMAT } from "../style";

// Portrait (1080×1920) vs landscape (1920×1080): the display type + some layouts
// adapt so a block reads right in either canvas. `V` = vertical.
const V = FORMAT.key === "vertical";

const SCRIM = "linear-gradient(180deg, rgba(28,31,38,0.55) 0%, rgba(28,31,38,0.9) 80%)";

// a small caps chip on a footage/ink background (its own component so the hook
// isn't called inside a .map — rules of hooks)
const FootChip: React.FC<{ label: string; appearMs: number }> = ({ label, appearMs }) => {
  const p = usePop(appearMs, { rise: 10, scale: true });
  return <span style={{ ...p, padding: "10px 22px", border: `2px solid rgba(255,255,255,0.32)`, borderRadius: 4, ...caps(COLORS.paper, 24) }}>{label}</span>;
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
}> = ({ from, to, kicker, line, figure, cues, footage }) => {
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
          <OffthreadVideo src={staticFile(footage.src)} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(28,31,38,0.62) 0%, rgba(28,31,38,0.86) 70%)" }} />
        </AbsoluteFill>
      ) : null}
      {/* number is the anchor (no reserved gap above it); line drops in below on cue */}
      <AbsoluteFill style={{ justifyContent: "center", padding: V ? "0 72px" : "0 120px" }}>
        {kicker ? <div style={kPop}><div style={caps(INK_SUB, 30)}>{kicker}</div></div> : null}
        <CountUp
          fromMs={fStart}
          toMs={fStart + (figure.durationMs ?? 1100)}
          value={figure.value}
          decimals={figure.decimals}
          prefix={figure.prefix}
          suffix={figure.suffix}
          style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: V ? 216 : 300, letterSpacing: TRACK.display, color: COLORS.paper, lineHeight: 0.92, marginTop: V ? 16 : 10, transformOrigin: "left center" }}
        />
        <div style={{ height: 6, width: barW, background: COLORS.paper, marginTop: 24, borderRadius: 3 }} />
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
        <div style={caps(COLORS.grayText, 22)}>{kicker}</div>
        <div style={{ ...party, ...acq, marginTop: 6 }}>{acquirer}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 16, color: COLORS.grayText, ...arrow }}>
          <span style={{ fontSize: 34, lineHeight: 1 }}>↓</span>
          <span style={{ fontFamily: SANS, fontWeight: 500, fontSize: 34, letterSpacing: TRACK.body }}>acquires</span>
        </div>
        <div style={{ ...party, ...tgt }}>{target}</div>
        {footage ? (
          <div style={{ ...inset, marginTop: 26 }}>
            <div style={{ position: "relative", width: 560, height: 300, borderRadius: 6, overflow: "hidden", border: `2px solid ${COLORS.border}` }}>
              <OffthreadVideo src={staticFile(footage.src)} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
              <div style={{ position: "absolute", left: 16, bottom: 14, ...caps(COLORS.paper, 16) }}>{footage.label}</div>
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
        {badge ? <div style={bdg}><div style={{ padding: "12px 24px", border: `2px solid ${COLORS.ink}`, borderRadius: 4, ...caps(COLORS.ink, 28) }}>{badge}</div></div> : null}
        {detail ? <div style={det}><div style={caps(COLORS.grayText, 24)}>{detail}</div></div> : null}
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
  const ms = useMs();
  const vis = useVis(from, to);
  const onset = cue(cueWord, from + 1200, from);
  const big = usePop(onset, { rise: 26, scale: true });
  const lead = usePop(from + 200, { rise: 14 });
  const barW = interpolate(ms, [onset + 210, onset + 1110], [0, 560], CLAMP);
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const sub = bg === "ink" ? INK_SUB : COLORS.grayText;
  return (
    <AbsoluteFill style={{ opacity: vis, justifyContent: "center", alignItems: "center", textAlign: "center", padding: "0 120px" }}>
      {kicker ? <div style={{ ...lead, marginBottom: 16 }}><div style={caps(sub, 28)}>{kicker}</div></div> : null}
      <div style={big}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: size, letterSpacing: TRACK.display, color: fg, lineHeight: 1.02 }}>{line}</div>
      </div>
      <div style={{ height: 6, width: barW, background: fg, marginTop: 26, borderRadius: 3 }} />
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
      {heavy.sub ? <div style={{ ...sub, marginTop: 12 }}><div style={caps(COLORS.grayText, 24)}>{heavy.sub}</div></div> : null}
      <div style={{ height: 8, width: barW, background: COLORS.ink, marginTop: 22, borderRadius: 4 }} />
      <div style={{ ...cmp, marginTop: 36, display: "flex", alignItems: "center", gap: 22 }}>
        <div style={{ width: 90, height: 2, background: COLORS.border }} />
        <span style={caps(COLORS.grayText, 24)}>{compare}</span>
        <div style={{ width: 90, height: 2, background: COLORS.border }} />
      </div>
      <div style={{ ...label, marginTop: 32 }}><div style={caps(COLORS.grayText, 22)}>{light.label}</div></div>
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
  cues: { resolve: string };
}> = ({ from, to, intro, chips, resolveKicker, answer, answerIcon: AnswerIcon, cues }) => {
  const ms = useMs();
  const vis = useVis(from, to);
  // the answer STAMPS on the spoken cue word (not offset after it); the "It's a…"
  // kicker lands ~0.9s before, as it's voiced.
  const resolveOn = cue(cues.resolve, to - 4000);
  const ec = usePop(resolveOn - 900, { rise: 0 });
  const ans = usePop(resolveOn, { rise: 28, scale: true });
  const ruleW = interpolate(ms, [resolveOn + 180, resolveOn + 680], [0, V ? 560 : 720], CLAMP);
  return (
    <AbsoluteFill style={{ opacity: vis, justifyContent: "center", padding: V ? "0 72px" : "0 120px" }}>
      <div style={caps(INK_SUB, 28)}>{intro}</div>
      <div style={{ display: "flex", gap: 26, marginTop: 28, flexWrap: "wrap" }}>
        {chips.map((c, i) => {
          const a = cue(c.word, from + 2870 + i * 1130);
          return <StrikeChip key={i} label={c.label} appearMs={a} strikeMs={a + 460} />;
        })}
      </div>
      <div style={{ ...ec, marginTop: 64 }}><div style={caps(INK_SUB, 28)}>{resolveKicker}</div></div>
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
const Chip: React.FC<{ label: string; appearMs: number; bg: "ink" | "paper"; Icon?: IconC; solid?: boolean }> = ({ label, appearMs, bg, Icon, solid }) => {
  const pop = usePop(appearMs, { rise: 18, scale: true });
  const border = bg === "ink" ? "rgba(255,255,255,0.3)" : COLORS.border;
  // outline: text takes the world's foreground. solid: a filled chip (opposite of
  // the world) so it reads as a highlighted pill.
  const outlineFg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const fg = solid ? (bg === "ink" ? COLORS.ink : COLORS.paper) : outlineFg;
  const fill = solid ? (bg === "ink" ? COLORS.paper : COLORS.ink) : "transparent";
  return (
    <div style={{ ...pop, display: "flex", alignItems: "center", gap: 20, padding: "22px 40px", background: fill, border: solid ? "2px solid transparent" : `2px solid ${border}`, borderRadius: 6 }}>
      {Icon ? <Icon size={46} color={fg} /> : null}
      <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 54, letterSpacing: TRACK.headline, color: fg }}>{label}</span>
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
  cues?: { headline?: string; tag?: string };
}> = ({ from, to, kicker, headline, chips, tag, bg = "ink", solid, headlineMs, cues }) => {
  const vis = useVis(from, to);
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const sub = bg === "ink" ? INK_SUB : COLORS.grayText;
  const eb = usePop(from + 200, { rise: 14 });
  const hd = usePop(headlineMs ?? cue(cues?.headline, from + 4100, from), { rise: 22 });
  const tg = usePop(cue(cues?.tag, to - 5000, from), { rise: 14 });
  return (
    <AbsoluteFill style={{ opacity: vis, justifyContent: "center", padding: "0 120px" }}>
      <div style={eb}><div style={caps(sub, 28)}>{kicker}</div></div>
      <div style={{ ...hd, marginTop: 12 }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 78, letterSpacing: TRACK.headline, color: fg, lineHeight: 1.05 }}>{headline}</div>
      </div>
      <div style={{ display: "flex", gap: 26, marginTop: 50, flexWrap: "wrap" }}>
        {chips.map((c, i) => <Chip key={i} label={c.label} Icon={c.Icon} appearMs={cue(c.word, from + 10000 + i * 410, from)} bg={bg} solid={solid} />)}
      </div>
      {tag ? <div style={{ ...tg, marginTop: 46 }}><div style={caps(sub, 26)}>{tag}</div></div> : null}
    </AbsoluteFill>
  );
};

// ── FootageScrim — a DIM b-roll plate behind a graphic (the "scrim-behind-a-
//    graphic" b-roll mode). Fades in/out over its window; render the graphic on
//    top of it. Keeps footage as punctuation, never the star. (ink) ─────────────
export const FootageScrim: React.FC<Win & { src: string; max?: number }> = ({ from, to, src, max = 0.4 }) => {
  const ms = useMs();
  const op = clamp01(interpolate(ms, [from, from + 700, to - 500, to], [0, max, max, 0], CLAMP));
  return (
    <AbsoluteFill style={{ opacity: op }}>
      <OffthreadVideo src={staticFile(src)} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(28,31,38,0.74) 0%, rgba(28,31,38,0.92) 78%)" }} />
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
          <OffthreadVideo src={staticFile(src)} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </AbsoluteFill>
        <AbsoluteFill style={{ background: SCRIM }} />
      </AbsoluteFill>
      <AbsoluteFill style={{ justifyContent: "flex-end", padding: "0 120px 150px" }}>
        <div style={eb}><div style={caps(INK_SUB, 28)}>{kicker}</div></div>
        <div style={{ ...hd, marginTop: 10 }}>
          <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 104, letterSpacing: TRACK.display, color: COLORS.paper, lineHeight: 1.02 }}>{headline}</div>
        </div>
        {chips && chips.length ? (
          <div style={{ marginTop: 24, display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
            {chips.map((c, i) => <FootChip key={i} label={c.label} appearMs={cue(c.word, from + 8000 + i * 600)} />)}
          </div>
        ) : null}
        {tail ? <div style={{ ...tl, marginTop: 22 }}><div style={caps(INK_SUB, 26)}>{tail}</div></div> : null}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── CTACard — branded end screen: wordmark → headline → sub → button → link. It
//    ASSEMBLES quickly (all parts in ~2s) then holds — a short CTA shouldn't
//    dribble in over its whole span or it reads as empty space. (paper) ────────
export const CTACard: React.FC<Win & {
  headline: string;
  sub: string;
  button: string;
  link?: string;
  cues?: { headline?: string; sub?: string; button?: string; link?: string };
}> = ({ from, to, headline, sub, button, link = "Link in the description ↓", cues }) => {
  const vis = clamp01(interpolate(useMs(), [from, from + 450], [0, 1], CLAMP));
  const logo = usePop(from + 200, { rise: 18, scale: true });
  const head = usePop(cue(cues?.headline, from + 700, from), { rise: 22 });
  const subP = usePop(cue(cues?.sub, from + 1100, from), { rise: 16 });
  const btn = usePop(cue(cues?.button, from + 1500, from), { rise: 16, scale: true });
  const linkP = usePop(cue(cues?.link, from + 2100, from), { rise: 12 });
  return (
    <AbsoluteFill style={{ opacity: vis, justifyContent: "center", alignItems: "center", textAlign: "center", padding: V ? "0 72px" : "0 120px" }}>
      <div style={{ ...logo }}>
        <Wordmark size={V ? 104 : 84} mark="wordmark" />
      </div>
      <div style={{ ...head, marginTop: 40 }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: V ? 80 : 92, letterSpacing: TRACK.display, color: COLORS.ink, lineHeight: 1.06, maxWidth: V ? 900 : 1400 }}>{headline}</div>
      </div>
      <div style={{ ...subP, marginTop: 20, maxWidth: V ? 880 : 1300 }}>
        <div style={{ fontFamily: SANS, fontWeight: 500, fontSize: V ? 38 : 40, letterSpacing: TRACK.body, color: COLORS.grayText, lineHeight: 1.3 }}>{sub}</div>
      </div>
      <div style={{ ...btn, marginTop: 44 }}>
        <div style={{ padding: "24px 56px", background: COLORS.ink, borderRadius: 10, ...caps(COLORS.paper, 30) }}>{button}</div>
      </div>
      <div style={{ ...linkP, marginTop: 24 }}><div style={caps(COLORS.grayText, 24)}>{link}</div></div>
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
        <OffthreadVideo src={staticFile(videoSrc)} muted style={fill} />
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
}> = ({ from, to, kicker, startLabel, endLabel, spanLabel, note, width = 780, bg = "ink", cues }) => {
  const ms = useMs();
  const vis = useVis(from, to);
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const dim = bg === "ink" ? INK_SUB : COLORS.grayText;
  const line = bg === "ink" ? "rgba(255,255,255,0.25)" : COLORS.border;
  const fillBg = bg === "ink" ? "rgba(255,255,255,0.12)" : COLORS.panel;
  const border = bg === "ink" ? "rgba(255,255,255,0.3)" : COLORS.border;
  const drawOn = cue(cues?.draw, from + 600);
  const draw = clamp01(interpolate(ms, [drawOn, drawOn + 1500], [0, 1], CLAMP));
  const spanOn = cue(cues?.span, from + 900);
  const span = clamp01(interpolate(ms, [spanOn, spanOn + 1300], [0, 1], CLAMP));
  const startPop = usePop(cue(cues?.end, to - 1600), { rise: 8 });
  const k = usePop(from + 150, { rise: 14 });
  return (
    <AbsoluteFill style={{ opacity: vis, justifyContent: "center", alignItems: "center" }}>
      <div style={{ width }}>
        {kicker ? <div style={{ ...k, textAlign: "center", marginBottom: 46 }}><div style={caps(dim, 26)}>{kicker}</div></div> : null}
        <div style={{ position: "relative", height: 150 }}>
          <div style={{ position: "absolute", top: 44, left: 0, width: width * span, height: 46, background: fillBg, border: `2px solid ${border}`, borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            <span style={{ ...caps(fg, 24), opacity: span, whiteSpace: "nowrap" }}>{spanLabel}</span>
          </div>
          <div style={{ position: "absolute", top: 120, left: 0, height: 3, width: width * draw, background: line }} />
          <div style={{ position: "absolute", top: 115, left: -5, width: 12, height: 12, borderRadius: 12, background: fg, opacity: draw }} />
          <div style={{ position: "absolute", top: 115, left: width - 7, width: 12, height: 12, borderRadius: 12, background: fg, opacity: draw }} />
          <div style={{ position: "absolute", top: 138, left: 0, ...startPop }}><span style={caps(dim, 24)}>{startLabel}</span></div>
          <div style={{ position: "absolute", top: 138, right: 0, opacity: draw }}><span style={caps(dim, 24)}>{endLabel}</span></div>
        </div>
        {note ? (
          <div style={{ textAlign: "center", marginTop: 72, opacity: span, display: "flex", flexDirection: "column", alignItems: "center", gap: 18 }}>
            <div style={{ width: 40, height: 3, background: fg, borderRadius: 2 }} />
            <div style={{ ...caps(fg, 30), fontWeight: 700 }}>{note}</div>
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
            <span style={chip(INK_SUB, "6px 18px")}><span style={caps(INK_SUB, 20)}>{heldState}</span></span>
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
      <span style={caps(COLORS.grayText, 22)}>{label}</span>
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
        <div style={xIntro}><div style={caps(COLORS.grayText, 24)}>{access.intro ?? "plus access to"}</div></div>
        <div style={{ ...xTitle, marginTop: 16 }}><div style={bigTitle}>{access.title}</div></div>
      </AbsoluteFill>

      {/* scene 3 — the money */}
      <AbsoluteFill style={{ ...scene, opacity: o3 }}>
        {money.upfront ? <div style={{ ...upf, marginBottom: 30 }}><div style={{ padding: "12px 28px", border: `2px solid ${COLORS.ink}`, borderRadius: 4, ...caps(COLORS.ink, 26) }}>{money.upfront}</div></div> : null}
        <div style={mLabel}><div style={caps(COLORS.grayText, 26)}>{money.priceLabel ?? "up to"}</div></div>
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
        <div style={{ ...k, position: "absolute", top: 0, left: 0 }}><div style={caps(COLORS.grayText, 26)}>{kicker}</div></div>
        {rows.map((r, i) => (
          <StackRow key={i} label={r.label} amount={r.amount} Icon={r.Icon} y={rowsTop + i * rowGap} appearMs={cue(r.word, from + 1200 + i * 1200)} />
        ))}
        <div style={{ position: "absolute", top: totalTop - 26, left: 0, height: 3, width: ruleW, background: COLORS.ink, borderRadius: 2 }} />
        <div style={{ position: "absolute", top: totalTop, left: 0, right: 0, display: "flex", alignItems: "baseline", justifyContent: "space-between" }}>
          <div style={tLabel}><span style={caps(COLORS.ink, 30)}>{total.label}</span></div>
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
const FlowWord: React.FC<{ text: string; onsetMs: number; style: React.CSSProperties }> = ({ text, onsetMs, style }) => {
  const pop = usePop(onsetMs, { rise: 16 });
  return <span style={{ ...style, ...pop, display: "inline-block" }}>{text}</span>;
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
}> = ({ from, to, line, bg = "ink", size = 76, kicker, align = "center", weight = 700, maxWidth = 940 }) => {
  const vis = useVis(from, to);
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const sub = bg === "ink" ? INK_SUB : COLORS.grayText;
  const toks = line.split(/\s+/).filter(Boolean);
  // auto-sync: resolve each token to its spoken ms, advancing a cursor past each hit
  let cursor = from;
  const onsets = toks.map((t) => {
    const m = cueMs(t, cursor);
    if (m !== undefined && m <= to) { cursor = m + 1; return m; }
    return undefined;
  });
  const span = Math.max(700, to - from - 900);
  const filled = onsets.map((m, i) => m ?? from + 200 + (span * i) / Math.max(1, toks.length - 1));
  const wordStyle: React.CSSProperties = {
    fontFamily: DISPLAY, fontWeight: weight, fontSize: size, letterSpacing: TRACK.headline,
    color: fg, lineHeight: 1.1, marginRight: "0.26em",
  };
  return (
    <AbsoluteFill style={{ opacity: vis, justifyContent: "center", alignItems: align === "center" ? "center" : "flex-start", padding: "0 96px" }}>
      {kicker ? <div style={{ ...caps(sub, 26), marginBottom: 26 }}>{kicker}</div> : null}
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: align === "center" ? "center" : "flex-start", textAlign: align, maxWidth }}>
        {toks.map((t, i) => <FlowWord key={i} text={t} onsetMs={filled[i]} style={wordStyle} />)}
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
      {kicker ? <div style={{ ...caps(INK_SUB, 28), marginBottom: 22 }}>{kicker}</div> : null}
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
      <div style={verb}><div style={caps(INK_SUB, 30)}>acquires</div></div>
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
      <div style={{ ...k, marginBottom: 16 }}><div style={caps(sub, 26)}>{kicker}</div></div>
      {rows.map((r, i) => <LedgerRow key={i} label={r.label} amount={r.amount} appearMs={onsets[i]} bg={bg} />)}
      <div style={{ height: 3, width: `${ruleW * 100}%`, background: fg, marginTop: 28, borderRadius: 2, alignSelf: "stretch" }} />
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginTop: 22, opacity: totalIn }}>
        <span style={caps(sub, 30)}>{total.label}</span>
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
        <div style={{ ...k, marginBottom: 22 }}><div style={caps(INK_SUB, 28)}>{kicker}</div></div>
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
      <span style={{ ...caps(sub, 22), width: 166, flexShrink: 0 }}>{label}</span>
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
        <div style={k}><div style={caps(sub, 26)}>{kicker}</div></div>
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
const PhaseDot: React.FC<{ label: string; xPct: number; appearMs: number; active: boolean; fg: string; sub: string }> = ({ label, xPct, appearMs, active, fg, sub }) => {
  const ms = useMs();
  const pop = usePop(appearMs, { rise: 0, scale: true });
  const wob = 0.5 + 0.5 * Math.sin(ms / 300);
  const pulse = active ? 1 + 0.55 * wob : 1;
  const ringOp = active ? 0.15 + 0.4 * wob : 0;
  const size = active ? 30 : 20;
  return (
    <div style={{ position: "absolute", left: `${xPct}%`, top: 0, transform: "translateX(-50%)", display: "flex", flexDirection: "column", alignItems: "center", gap: 22 }}>
      <div style={{ position: "relative", width: 40, height: 40, display: "flex", alignItems: "center", justifyContent: "center", ...pop }}>
        {active ? <div style={{ position: "absolute", width: 36, height: 36, borderRadius: "50%", border: `2px solid ${fg}`, opacity: ringOp, transform: `scale(${pulse})` }} /> : null}
        <div style={{ width: size, height: size, borderRadius: "50%", background: fg }} />
      </div>
      <span style={{ ...caps(active ? fg : sub, 22), fontWeight: active ? 700 : 600, whiteSpace: "nowrap" }}>{label}</span>
    </div>
  );
};

const PhaseFact: React.FC<{ label: string; value: string; appearMs: number; fg: string; sub: string; line: string }> = ({ label, value, appearMs, fg, sub, line }) => {
  const ms = useMs();
  const p = clamp01(interpolate(ms, [appearMs, appearMs + 500], [0, 1], CLAMP));
  const x = interpolate(p, [0, 1], [64, 0], CLAMP);
  return (
    <div style={{ opacity: p, transform: `translateX(${x}px)`, display: "flex", alignItems: "baseline", gap: 30, padding: "18px 0", borderBottom: `2px solid ${line}` }}>
      <span style={{ ...caps(sub, 22), width: 176, flexShrink: 0 }}>{label}</span>
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
  return (
    <AbsoluteFill style={{ opacity: vis, justifyContent: "center", padding: "0 150px" }}>
      <div style={k}><div style={caps(sub, 26)}>{kicker}</div></div>
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
          return <PhaseDot key={i} label={p} xPct={xPct} appearMs={dotOn} active={i === activeIndex} fg={fg} sub={sub} />;
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
const StepBarRow: React.FC<{ label: string; sub?: string; value: number; decimals: number; prefix?: string; suffix?: string; onset: number; frac: number; full: number; fg: string; dim: string; track: string; tag?: string }> = ({ label, sub, value, decimals, prefix, suffix, onset, frac, full, fg, dim, track, tag }) => {
  const ms = useMs();
  const grow = clamp01(interpolate(ms, [onset, onset + 950], [0, 1], { ...CLAMP, easing: Easing.out(Easing.cubic) }));
  const lab = usePop(onset - 150, { rise: 16 });
  const tg = usePop(onset + 900, { rise: 12, scale: true });
  return (
    <div style={{ marginBottom: 46 }}>
      <div style={{ ...lab, display: "flex", alignItems: "baseline", gap: 18, marginBottom: 16 }}>
        <span style={{ fontFamily: SANS, fontWeight: 600, fontSize: 42, letterSpacing: TRACK.body, color: fg }}>{label}</span>
        {sub ? <span style={caps(dim, 24)}>{sub}</span> : null}
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 30 }}>
        <div style={{ position: "relative", height: 54, width: full, background: track, borderRadius: 8 }}>
          <div style={{ position: "absolute", left: 0, top: 0, height: 54, width: grow * frac * full, background: fg, borderRadius: 8 }} />
        </div>
        <CountUp fromMs={onset} toMs={onset + 950} value={value} decimals={decimals} prefix={prefix} suffix={suffix}
          style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 72, letterSpacing: TRACK.display, color: fg, lineHeight: 1, minWidth: 190 }} />
        {tag ? <div style={tg}><div style={{ padding: "8px 20px", border: `2px solid ${fg}`, borderRadius: 4, ...caps(fg, 20) }}>{tag}</div></div> : null}
      </div>
    </div>
  );
};

// ── WatchList — a numbered "what to watch" closer: each item (NN + line) reveals
//    on its spoken cue. Forward-looking, distinct from chips. (ink or paper) ─────
const WatchItem: React.FC<{ n: number; line: string; appearMs: number; fg: string; dim: string; sep: string; Icon?: IconC }> = ({ n, line, appearMs, fg, dim, sep, Icon }) => {
  const pop = usePop(appearMs, { rise: 30 });
  return (
    <div style={{ opacity: pop.opacity, transform: pop.transform, display: "flex", alignItems: "center", gap: 30, padding: "26px 0", borderBottom: `2px solid ${sep}` }}>
      <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: 52, letterSpacing: TRACK.display, color: dim, minWidth: 84 }}>{String(n).padStart(2, "0")}</span>
      {Icon ? <IconMotion Icon={Icon} onset={appearMs + 160} size={54} color={fg} breathe /> : null}
      <span style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: V ? 50 : 62, letterSpacing: TRACK.headline, color: fg, lineHeight: 1.08 }}>{line}</span>
    </div>
  );
};

// items may carry an optional animated line-icon (kit/icons) that pops beside the number.
export const WatchList: React.FC<Win & {
  kicker: string;
  items: { line: string; word: string; Icon?: IconC; ms?: number }[];
  bg?: "ink" | "paper";
}> = ({ from, to, kicker, items, bg = "ink" }) => {
  const vis = useVis(from, to);
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const dim = bg === "ink" ? INK_SUB : COLORS.grayText;
  const sep = bg === "ink" ? "rgba(255,255,255,0.14)" : COLORS.border;
  const k = usePop(from + 200, { rise: 14 });
  // per-item `ms` overrides the cue word (can LEAD the voice)
  const onsets = items.map((it, i) => it.ms ?? cue(it.word, from + 2000 + i * 4000, from));
  return (
    <AbsoluteFill style={{ opacity: vis, justifyContent: "center", padding: "0 150px" }}>
      <div style={{ ...k, marginBottom: 30 }}><div style={caps(dim, 26)}>{kicker}</div></div>
      {items.map((it, i) => <WatchItem key={i} n={i + 1} line={it.line} Icon={it.Icon} appearMs={onsets[i]} fg={fg} dim={dim} sep={sep} />)}
    </AbsoluteFill>
  );
};

export const StepBars: React.FC<Win & {
  kicker: string;
  rows: { label: string; sub?: string; value: number; decimals: number; prefix?: string; suffix?: string; word: string; tag?: string }[];
  maxValue: number;
  bg?: "ink" | "paper";
}> = ({ from, to, kicker, rows, maxValue, bg = "ink" }) => {
  const vis = useVis(from, to);
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const dim = bg === "ink" ? INK_SUB : COLORS.grayText;
  const track = bg === "ink" ? "rgba(255,255,255,0.12)" : COLORS.panel;
  const k = usePop(from + 200, { rise: 14 });
  const full = 760;
  const onsets = rows.map((r, i) => cue(r.word, from + 2500 + i * 3500, from));
  return (
    <AbsoluteFill style={{ opacity: vis, justifyContent: "center", padding: "0 150px" }}>
      <div style={{ ...k, marginBottom: 46 }}><div style={caps(dim, 26)}>{kicker}</div></div>
      {rows.map((r, i) => (
        <StepBarRow key={i} label={r.label} sub={r.sub} value={r.value} decimals={r.decimals} prefix={r.prefix} suffix={r.suffix} tag={r.tag} onset={onsets[i]} frac={r.value / maxValue} full={full} fg={fg} dim={dim} track={track} />
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
  prefix?: string;
  suffix?: string;
  decimals?: number;
  size?: number;
  bg?: "ink" | "paper";
}> = ({ from, to, kicker, value, word, line, lineCue, prefix, suffix, decimals = 0, size, bg = "ink" }) => {
  const ms = useMs();
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const sub = bg === "ink" ? INK_SUB : COLORS.grayText;
  const big = size ?? (V ? 440 : 300);
  const vis = clamp01(interpolate(ms, [from, from + 360, to - 320, to], [0, 1, 1, 0], CLAMP));
  const kick = usePop(from + 300, { rise: 14 });
  const numOn = cue(word, from + 3800, from);
  const barW = clamp01(interpolate(ms, [numOn + 850, numOn + 1650], [0, 1], CLAMP)) * (V ? 360 : 460);
  const lineOn = cue(lineCue, numOn + 1250, from);
  const ln = usePop(lineOn, { rise: 18 });
  return (
    <AbsoluteFill style={{ opacity: vis, justifyContent: "center", alignItems: "center", textAlign: "center", padding: V ? "0 80px" : "0 160px" }}>
      <div style={kick}><div style={caps(sub, 32)}>{kicker}</div></div>
      <CountUp fromMs={numOn} toMs={numOn + 1100} value={value} decimals={decimals} prefix={prefix} suffix={suffix}
        style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: big, letterSpacing: TRACK.display, color: fg, lineHeight: 0.9, marginTop: 30 }} />
      <div style={{ height: 8, width: barW, background: fg, marginTop: 22, borderRadius: 4 }} />
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
  const ms = useMs();
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const sub = bg === "ink" ? INK_SUB : COLORS.grayText;
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
      <div style={k}><div style={caps(sub, 30)}>{kicker}</div></div>
      <div style={{ ...n1, marginTop: 30 }}><div style={nameStyle}>{name1}</div></div>
      <div style={{ ...conn, margin: "16px 0" }}><div style={caps(sub, 26)}>{connector}</div></div>
      <div style={n2}><div style={nameStyle}>{name2}</div></div>
      <div style={{ height: 3, width: barW, background: rule, margin: "44px 0 4px" }} />
      <CountUp fromMs={numOn} toMs={numOn + 1000} value={value} decimals={decimals} prefix={prefix} suffix={suffix}
        style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: V ? 300 : 260, letterSpacing: TRACK.display, color: fg, lineHeight: 0.9, marginTop: 8 }} />
      <div style={{ ...lbl, marginTop: 10 }}><div style={caps(sub, 30)}>{label}</div></div>
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
        <div style={{ ...k, marginBottom: 66 }}><div style={caps(INK_SUB, 30)}>{kicker}</div></div>
        {/* top track — the "loser": broken/dashed, dim */}
        <div style={{ opacity: topAppear }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 18 }}>
            <span style={rowLabel(INK_SUB)}>{topLabel}</span>
            <span style={{ ...caps(INK_SUB, 24), opacity: topAppear }}>{topState}</span>
          </div>
          <div style={{ height: 16, borderRadius: 3, opacity: topDim, backgroundImage: `repeating-linear-gradient(90deg, ${INK_SUB} 0 30px, transparent 30px 56px)`, backgroundSize: `${full}px 16px` }} />
        </div>
        {/* bottom track — the "winner": solid, bright, fills on cue */}
        <div style={{ marginTop: 60, opacity: botAppear }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 18 }}>
            <span style={rowLabel(COLORS.paper)}>{botLabel}</span>
            <span style={{ ...caps(COLORS.paper, 24), opacity: draw }}>{botState}</span>
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
}> = ({ from, to, lead, emphasis, emphasisCue, emphasisMs, bg = "ink" }) => {
  const ms = useMs();
  const fg = bg === "ink" ? COLORS.paper : COLORS.ink;
  const sub = bg === "ink" ? INK_SUB : COLORS.grayText;
  const vis = clamp01(interpolate(ms, [from, from + 300, to - 260, to], [0, 1, 1, 0], CLAMP));
  const toks = lead.split(/\s+/).filter(Boolean);
  let cursor = from;
  const onsets = toks.map((tk) => {
    const m = cueMs(tk, cursor);
    if (m !== undefined && m <= to) { cursor = m + 1; return m; }
    return from + 200;
  });
  const leadStyle: React.CSSProperties = { fontFamily: DISPLAY, fontWeight: 600, fontSize: V ? 58 : 56, letterSpacing: TRACK.headline, color: sub, lineHeight: 1.14, marginRight: "0.26em" };
  const empOn = emphasisMs ?? cue(emphasisCue, from + 2500, from);
  const emp = usePop(empOn, { rise: 22, scale: true });
  const barW = clamp01(interpolate(ms, [empOn + 160, empOn + 980], [0, 1], CLAMP)) * 320;
  return (
    <AbsoluteFill style={{ opacity: vis, justifyContent: "center", alignItems: "center", textAlign: "center", padding: V ? "0 96px" : "0 160px" }}>
      <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", maxWidth: V ? 880 : 1300 }}>
        {toks.map((tk, i) => <FlowWord key={i} text={tk} onsetMs={onsets[i]} style={leadStyle} />)}
      </div>
      <div style={{ ...emp, marginTop: 46 }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 700, fontSize: V ? 120 : 132, letterSpacing: TRACK.display, color: fg, lineHeight: 1 }}>{emphasis}</div>
      </div>
      <div style={{ height: 6, width: barW, background: fg, marginTop: 24, borderRadius: 3 }} />
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
      {kicker ? <div style={{ ...k, marginBottom: 22 }}><div style={caps(COLORS.grayText, 30)}>{kicker}</div></div> : null}
      {badge ? (
        <div style={{ ...badgeS, marginBottom: 54 }}>
          <div style={{ padding: "14px 30px", border: `2px solid ${COLORS.ink}`, borderRadius: 6, ...caps(COLORS.ink, 30), fontWeight: 700 }}>{badge}</div>
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
            <div style={{ ...caps(COLORS.grayText, 22), marginTop: 18 }}>{oldLabel}</div>
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
          <div style={{ ...caps(COLORS.ink, 22), marginTop: 18, fontWeight: 700 }}>{newLabel}</div>
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
