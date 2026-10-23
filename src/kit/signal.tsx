// ─────────────────────────────────────────────────────────────────────────
// KIT · signal — WHAT TO WATCH, AND THE CLOSE. Added on the AbbVie Juvmo
// long-form, 2026-10-04 (HORIZONTAL 16:9). One-mover rule: each cue gets ONE
// motion, and anything that has landed goes still.
//
// `ReceptorCase` (ink): the §2 receptor row returns. "Dopamine agonists
// available until now mainly target D2 and D3": white seats drop into D2, D3.
// "AbbVie's case is that a different target...": red seats drop into D1, D5,
// under a kicker that attributes the claim to the company.
//
// `HowUsed` (ink): the tablet forks into the two uses named in the script. Each
// ends in a DASHED bar: how much it is used is not known yet (the kit's
// vocabulary rule), which is the thing to watch.
//
// `FirstMarker` (ink): the one dated marker, with the §2 calendar page.
//
// `BriefCloseH` (red): what the Brief tracks, as two tokens and a week strip,
// then the lockup, the button, the URL, and a signal trace under the tagline.
//
// Every onset is a spoken word with an optional ms pin, clamped monotonic.
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { CLAMP, clamp01, COLORS, DISPLAY, INK_SUB, INK_SUB_ON_RED, TRACK, useMs } from "./core";
import { TYPE } from "../style";
import { FlowLine } from "./flowline";
import { Wordmark } from "./ui";
import { at, useK, type Cued, type Win } from "./elora";
import { Capsule } from "./juvmo";

const EASE = Easing.out(Easing.cubic);
const EASE_IO = Easing.inOut(Easing.cubic);
const BACK = Easing.out(Easing.back(1.7));

const W = 1920;
const H = 1080;

const txt = (size: number, color: string, weight = 700): React.CSSProperties => ({
  fontFamily: DISPLAY, fontWeight: weight, fontSize: size, letterSpacing: size >= 60 ? TRACK.display : TRACK.headline, color, lineHeight: 1.08, whiteSpace: "nowrap",
});

const Line: React.FC<{ from: number; to: number; text: string; top: number; size: number; color: string; restColor?: string; emphasize?: string; empColor?: string; left?: number; width?: number; fade?: boolean }> = ({
  from, to, text, top, size, color, restColor, emphasize, empColor, left = 130, width = W - 260, fade = true,
}) => {
  const ms = useMs();
  const o = clamp01(interpolate(ms, [from - 80, from, to - 220, to], [0, 1, fade ? 1 : 1, fade ? 0 : 1], CLAMP));
  if (o <= 0) return null;
  return (
    <div style={{ position: "absolute", left, width, top, opacity: o }}>
      <FlowLine from={from} to={to} line={text} size={size} color={color} restColor={restColor} restWeight={700} emphasize={emphasize} empColor={empColor} lineHeight={1.14} align="center" />
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// ReceptorCase — the receptor row returns: until now, and the case for different
// ══════════════════════════════════════════════════════════════════════════
export const CASE = { xs: [480, 720, 960, 1200, 1440], y: 440, s: 1.25, line1Top: 236, kickerTop: 640, line2Top: 682 };

export const ReceptorCase: React.FC<Win & {
  row: { labels: string[]; text: string; emphasize?: string } & Cued; // the cups draw; the line writes
  old: ({ index: number } & Cued)[]; // seats taken until now
  claim: { kicker: string; text: string; emphasize?: string; word?: string; ms?: number; textWord?: string };
  fresh: ({ index: number } & Cued)[]; // the different target
  clear: Cued;
}> = ({ from, to, row, old, claim, fresh, clear }) => {
  const ms = useMs();
  const k = useK();
  const WH = COLORS.paper;
  const R = COLORS.accent;
  const C = CASE;

  const tRow = at(row, from, from);
  const tOld = old.reduce<number[]>((acc, o, i) => [...acc, at(o, (acc[i - 1] ?? tRow + 3000) + 600, from, (acc[i - 1] ?? tRow) + 400)], []);
  const tClaim = at(claim, tOld[tOld.length - 1] + 1400, from, tOld[tOld.length - 1] + 500);
  const tText = at({ word: claim.textWord }, tClaim + 1000, from, tClaim + 400);
  const tFresh = fresh.reduce<number[]>((acc, o, i) => [...acc, at(o, (acc[i - 1] ?? tText) + 200, from, (acc[i - 1] ?? tText))], []);
  const tClear = at(clear, tFresh[tFresh.length - 1] + 2800, from, tFresh[tFresh.length - 1] + 1200);
  const vis = (1 - k(tClear, 260)) * clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));

  const cupsQ = k(tRow, 620);
  const seat = (i: number) => {
    const o = old.findIndex((x) => x.index === i);
    if (o >= 0) return { q: k(tOld[o], 340), color: WH };
    const f = fresh.findIndex((x) => x.index === i);
    if (f >= 0) return { q: k(tFresh[f], 340), color: R };
    return { q: 0, color: WH };
  };

  if (ms < tRow - 60 || vis <= 0) return null;
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <Line from={tRow} to={tClear + 300} text={row.text} top={C.line1Top} size={40} color={WH} restColor={INK_SUB} emphasize={row.emphasize} empColor={WH} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {C.xs.map((x, i) => {
          const q = EASE(clamp01(cupsQ * 2.2 - i * 0.3));
          if (q <= 0) return null;
          const s = seat(i);
          return (
            <g key={i} transform={`translate(${x} ${C.y + (1 - q) * 30}) scale(${C.s})`} opacity={q}>
              <path d="M -58 -50 V 6 A 58 58 0 0 0 58 6 V -50" fill="none" stroke={s.q > 0.5 ? WH : "rgba(255,255,255,0.4)"} strokeWidth={8} strokeLinecap="round" />
              {s.q > 0 ? <circle cx={0} cy={6 - (1 - BACK(s.q)) * 70} r={41} fill={s.color} opacity={clamp01(s.q * 4)} /> : null}
            </g>
          );
        })}
      </svg>
      {C.xs.map((x, i) => (
        <div key={i} style={{ position: "absolute", left: x - 80, width: 160, top: C.y + 104, textAlign: "center", opacity: clamp01(cupsQ * 2.2 - i * 0.3), ...txt(44, seat(i).q > 0.5 ? WH : INK_SUB) }}>{row.labels[i]}</div>
      ))}
      <div style={{ position: "absolute", left: 0, width: W, top: C.kickerTop, textAlign: "center", opacity: k(tClaim, 180), ...txt(TYPE.label, INK_SUB) }}>{claim.kicker}</div>
      <Line from={tText} to={tClear + 300} text={claim.text} top={C.line2Top} size={52} color={WH} restColor={INK_SUB} emphasize={claim.emphasize} empColor={WH} />
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// HowUsed — the tablet forks into its two uses; neither is measured yet
// ══════════════════════════════════════════════════════════════════════════
export const USED = { lineTop: 236, tab: { cx: 420, cy: 540, r: 100 }, rows: [450, 630] as const, forkX: 800, labelX: 920, bar: { x: 1430, w: 320, h: 64 } };

export const HowUsed: React.FC<Win & {
  line: { text: string; emphasize?: string } & Cued;
  tablet: Cued;
  uses: ({ label: string; capsule?: boolean } & Cued)[]; // two
  clear: Cued;
}> = ({ from, to, line, tablet, uses, clear }) => {
  const ms = useMs();
  const k = useK();
  const WH = COLORS.paper;
  const R = COLORS.accent;
  const U = USED;

  const tLine = at(line, from, from);
  const tTab = at(tablet, tLine + 2500, from, tLine + 600);
  const tUses = uses.reduce<number[]>((acc, u, i) => [...acc, at(u, (acc[i - 1] ?? tTab) + 1200, from, (acc[i - 1] ?? tTab) + 450)], []);
  const tClear = at(clear, tUses[tUses.length - 1] + 1500, from, tUses[tUses.length - 1] + 700);
  const vis = (1 - k(tClear, 300)) * clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));

  const dropQ = k(tTab, 380);

  if (ms < tLine - 60 || vis <= 0) return null;
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <Line from={tLine} to={tClear + 300} text={line.text} top={U.lineTop} size={46} color={WH} restColor={INK_SUB} emphasize={line.emphasize} empColor={WH} />
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {uses.map((u, i) => {
          const q = EASE_IO(k(tUses[i], 460));
          if (q <= 0) return null;
          const y = U.rows[i];
          const x0 = U.tab.cx + U.tab.r + 14;
          const bq = EASE_IO(k(tUses[i] + 300, 460));
          return (
            <g key={i}>
              <path d={`M ${x0} ${U.tab.cy} C ${x0 + 150} ${U.tab.cy}, ${U.forkX - 150} ${y}, ${U.forkX} ${y}`} fill="none" stroke={WH} strokeWidth={6} strokeLinecap="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - q} />
              {u.capsule ? <g transform={`translate(${U.forkX + 56} ${y})`} opacity={k(tUses[i] + 260, 180)}><Capsule w={84} h={38} color={WH} /></g> : null}
              {/* dashed = not measured yet */}
              <clipPath id={`used-bar-${i}`}><rect x={U.bar.x - 8} y={y - U.bar.h / 2 - 8} width={(U.bar.w + 16) * bq} height={U.bar.h + 16} /></clipPath>
              <rect x={U.bar.x} y={y - U.bar.h / 2} width={U.bar.w} height={U.bar.h} rx={14} fill="none" stroke={WH} strokeOpacity={0.75} strokeWidth={5} strokeDasharray="18 14" clipPath={`url(#used-bar-${i})`} />
            </g>
          );
        })}
        {dropQ > 0 ? (
          <g transform={`translate(${U.tab.cx} ${U.tab.cy - (1 - EASE(dropQ)) * 240}) scale(${BACK(dropQ)})`}>
            <circle r={U.tab.r} fill={R} />
            <line x1={-62} y1={0} x2={62} y2={0} stroke={WH} strokeWidth={9} strokeLinecap="round" />
          </g>
        ) : null}
      </svg>
      {uses.map((u, i) => (
        <React.Fragment key={i}>
          <div style={{ position: "absolute", left: U.labelX, top: U.rows[i], transform: "translateY(-50%)", opacity: k(tUses[i] + 260, 180), ...txt(48, WH) }}>{u.label}</div>
          <div style={{ position: "absolute", left: U.bar.x, width: U.bar.w, top: U.rows[i], transform: "translateY(-50%)", textAlign: "center", opacity: k(tUses[i] + 560, 200), ...txt(44, INK_SUB) }}>?</div>
        </React.Fragment>
      ))}
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// FirstMarker — the one dated thing to watch
// ══════════════════════════════════════════════════════════════════════════
export const MARKER = { left: 200, kickerTop: 330, wordTop: 384, page: { cx: 1540, top: 344, w: 390, h: 312 } };

export const FirstMarker: React.FC<Win & {
  kicker: { label: string } & Cued;
  word: { label: string } & Cued; // slams
  expects: { label: string } & Cued; // the page rises
  month: { label: string } & Cued; // stamps on it
}> = ({ from, to, kicker, word, expects, month }) => {
  const ms = useMs();
  const k = useK();
  const WH = COLORS.paper;
  const R = COLORS.accent;
  const M = MARKER;
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));

  const tKick = at(kicker, from, from);
  const tWord = at(word, tKick + 1100, from, tKick + 400);
  const tPage = at(expects, tWord + 1400, from, tWord + 600);
  const tMonth = at(month, tPage + 1300, from, tPage + 500);

  const wordO = k(tWord, 110);
  const wordS = interpolate(ms, [tWord, tWord + 300], [1.16, 1], { ...CLAMP, easing: EASE });
  const pageQ = EASE(k(tPage, 420));
  const monthO = k(tMonth, 110);
  const monthS = interpolate(ms, [tMonth, tMonth + 280], [1.35, 1], { ...CLAMP, easing: EASE });
  const P = M.page;

  if (ms < tKick - 60) return null;
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <div style={{ position: "absolute", left: M.left, top: M.kickerTop, opacity: k(tKick, 180), ...txt(40, INK_SUB) }}>{kicker.label}</div>
      <div style={{ position: "absolute", left: M.left, top: M.wordTop, opacity: wordO, transform: `scale(${wordS})`, transformOrigin: "left center", ...txt(170, WH), lineHeight: 1 }}>{word.label}</div>
      <div style={{ position: "absolute", left: P.cx - 260, width: 520, top: P.top - 58, textAlign: "center", opacity: k(tPage, 180), ...txt(TYPE.label, INK_SUB) }}>{expects.label}</div>
      {pageQ > 0 ? (
        <div style={{ position: "absolute", left: P.cx - P.w / 2, top: P.top + (1 - pageQ) * 60, width: P.w, height: P.h, opacity: clamp01(pageQ * 2), borderRadius: 26, overflow: "hidden", background: WH }}>
          <div style={{ height: 76, background: R, display: "flex", alignItems: "center", justifyContent: "center", gap: 150 }}>
            <span style={{ width: 24, height: 24, borderRadius: 24, background: WH }} />
            <span style={{ width: 24, height: 24, borderRadius: 24, background: WH }} />
          </div>
          <div style={{ marginTop: 62, textAlign: "center", opacity: monthO, transform: `scale(${monthS})`, ...txt(96, COLORS.ink), lineHeight: 1 }}>{month.label}</div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// BriefCloseH — what the Brief tracks, then the ask (red world, 16:9)
// ══════════════════════════════════════════════════════════════════════════
export const CLOSE = { lineTop: 214, tokenY: 520, tokenXs: [700, 1220], token: { w: 440, h: 132 }, weekY: 716, lockupTop: 236, lockupH: 176, buttonTop: 496, urlTop: 668, traceY: 812, tagTop: 852 };

export const BriefCloseH: React.FC<Win & {
  line: { text: string; emphasize?: string } & Cued;
  tokens: ({ label: string; icon: "check" | "deal" } & Cued)[]; // two
  week: { label: string } & Cued; // seven cells fill
  gather: Cued; // the tokens retire into the lockup's seat
  lockup: Cued; // the brand lands
  subscribe: { label: string } & Cued;
  url: { label: string } & Cued;
  tagline: { text: string } & Cued; // the trace draws; the words follow
}> = ({ from, to, line, tokens, week, gather, lockup, subscribe, url, tagline }) => {
  const ms = useMs();
  const k = useK();
  const WH = COLORS.paper;
  const INK = COLORS.ink;
  const C = CLOSE;
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));

  const tLine = at(line, from, from);
  const tTok = tokens.reduce<number[]>((acc, t, i) => [...acc, at(t, (acc[i - 1] ?? tLine) + 900, from, (acc[i - 1] ?? tLine) + 300)], []);
  const tWeek = at(week, tTok[tTok.length - 1] + 900, from, tTok[tTok.length - 1] + 400);
  const tGather = at(gather, tWeek + 900, from, tWeek + 500);
  const tLock = at(lockup, tGather + 350, from, tGather + 300);
  const tSub = at(subscribe, tLock + 1000, from, tLock + 500);
  const tUrl = at(url, tSub + 1000, from, tSub + 400);
  const tTag = at(tagline, tUrl + 2200, from, tUrl + 800);

  const gq = EASE_IO(k(tGather, 340));
  const lockO = k(tLock, 110);
  const lockS = interpolate(ms, [tLock, tLock + 300], [1.18, 1], { ...CLAMP, easing: EASE });
  const subQ = BACK(k(tSub, 400));
  const urlO = k(tUrl, 200);
  const trace = EASE_IO(k(tTag, 620));

  if (ms < tLine - 60) return null;
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {/* ── what the Brief tracks ── */}
      {gq < 1 ? (
        <div style={{ position: "absolute", inset: 0, opacity: 1 - gq, transform: `translateY(${gq * -70}px) scale(${1 - gq * 0.12})`, transformOrigin: `50% ${C.lockupTop + C.lockupH / 2}px` }}>
          <Line from={tLine} to={tGather} text={line.text} top={C.lineTop} size={60} color={WH} restColor={INK_SUB_ON_RED} emphasize={line.emphasize} empColor={WH} left={210} width={W - 420} fade={false} />
          {/* The plate FITS its label (min C.token.w): a fixed-width plate let "What they show" run
              off its white ground (Nel, 2026-10-14). The row is centred, so both plates keep their seats. */}
          <div style={{ position: "absolute", left: 0, width: W, top: C.tokenY - C.token.h / 2, display: "flex", justifyContent: "center", gap: 80 }}>
          {tokens.map((t, i) => {
            const o = k(tTok[i], 110);
            const s = interpolate(ms, [tTok[i], tTok[i] + 280], [1.25, 1], { ...CLAMP, easing: EASE });
            return (
              <div key={i} style={{ flex: "none", boxSizing: "border-box", minWidth: C.token.w, padding: "0 48px", height: C.token.h, opacity: o, transform: `scale(${s})`, background: WH, borderRadius: 22, whiteSpace: "nowrap",
                display: "flex", alignItems: "center", justifyContent: "center", gap: 24, ...txt(58, INK) }}>
                <svg width={64} height={64} style={{ flex: "none" }}>
                  {t.icon === "check" ? (
                    <>
                      <circle cx={32} cy={32} r={32} fill={COLORS.accent} />
                      <path d="M 17 33 L 28 44 L 48 22" fill="none" stroke={WH} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" />
                    </>
                  ) : (
                    <g fill="none" stroke={INK} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round">
                      <path d="M 6 32 H 54" />
                      <path d="M 38 16 L 56 32 L 38 48" />
                    </g>
                  )}
                </svg>
                {t.label}
              </div>
            );
          })}
          </div>
          {/* every week: seven cells */}
          <div style={{ position: "absolute", left: 0, width: W, top: C.weekY - 36, display: "flex", alignItems: "center", justifyContent: "center", gap: 18 }}>
            {Array.from({ length: 7 }, (_, i) => {
              const q = EASE(k(tWeek + i * 55, 220));
              return <span key={i} style={{ width: 72, height: 72, borderRadius: 14, boxSizing: "border-box", border: `5px solid ${WH}`, background: WH, opacity: clamp01(q * 2), transform: `scale(${0.6 + 0.4 * q})` }} />;
            })}
            <span style={{ marginLeft: 22, opacity: k(tWeek + 420, 180), ...txt(40, WH) }}>{week.label}</span>
          </div>
        </div>
      ) : null}

      {/* ── the ask ── */}
      {lockO > 0 ? (
        <div style={{ position: "absolute", left: 0, width: W, top: C.lockupTop, height: C.lockupH, display: "flex", justifyContent: "center", opacity: lockO, transform: `scale(${lockS})` }}>
          <Wordmark size={C.lockupH} mark="wordmark" tone="white" />
        </div>
      ) : null}
      {subQ > 0 ? (
        <div style={{ position: "absolute", left: W / 2 - 250, top: C.buttonTop + (1 - subQ) * 40, width: 500, height: 112, opacity: clamp01(subQ * 2), background: WH, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", ...txt(50, INK) }}>
          {subscribe.label}
        </div>
      ) : null}
      <div style={{ position: "absolute", left: 0, width: W, top: C.urlTop, textAlign: "center", opacity: urlO, transform: `translateY(${(1 - urlO) * 14}px)`, ...txt(76, WH) }}>{url.label}</div>
      {trace > 0 ? (
        <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
          <path d={`M 300 ${C.traceY} H 880 L 915 ${C.traceY - 4} L 940 ${C.traceY - 52} L 968 ${C.traceY + 34} L 992 ${C.traceY - 14} L 1010 ${C.traceY} H 1620`} fill="none" stroke={WH} strokeWidth={6} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1 1" strokeDashoffset={1 - trace} />
        </svg>
      ) : null}
      <Line from={tTag} to={to + 600} text={tagline.text} top={C.tagTop} size={78} color={WH} fade={false} />
    </AbsoluteFill>
  );
};
