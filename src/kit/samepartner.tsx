// ─────────────────────────────────────────────────────────────────────────
// KIT · samepartner — the THESIS and the CLOSE. Added on the Sanofi x
// Regeneron long-form, 2026-10-02 (VERTICAL), under the 09-30 one-mover rule.
// A different register from the spine's cards and bars: an OSCILLOSCOPE trace,
// a FIELD that drains, an outline that is BUILT, a fork that draws.
//
// `SignalTrace`: a trace that draws left to right full of noise; on a cue the
// noise drains out of it and ONE clean spike is left. Shared by both blocks,
// so the close calls back the thesis.
//
// `SamePartner` (white card, §4): "So the signal here is simple… <buyer>
// isn't shopping for the next <drug> somewhere else. It's building it with
// the same partner that built the first one." The trace sheds its noise on
// "simple". The buyer's chip lands; on "shopping" a field of dashed "?"
// candidates fills the card; a lens glides out of the buyer and across them;
// on "else" the whole field DRAINS off the card under gravity. Then the
// original stamps, the copy's dashed outline is BUILT solid on "building",
// the partner lands under both, a red fork draws up into both cards, and
// "The first one" stamps over the original.
//
// `BriefClose` (black, §5): five story rows drop in on "five stories", each
// takes a check on "verified", the camera pulls the five into one issue on
// "this week's" and the lockup lands on the brand; the button + URL on
// "Subscribe free"; then the trace returns and sheds its noise on "Signal".
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, interpolate, Easing } from "remotion";
import { CLAMP, clamp01, COLORS, cue, DISPLAY, inkA, TRACK, useMs } from "./core";
import { FlowLine } from "./flowline";
import { Wordmark } from "./ui";
import { LAYOUT } from "../style";

const EASE = Easing.out(Easing.cubic);
const EASE_IO = Easing.inOut(Easing.cubic);
const BACK = Easing.out(Easing.back(1.6));

type Win = { from: number; to: number };
type Cued = { word?: string; ms?: number };

const useK = () => {
  const ms = useMs();
  return (a: number, dur: number) => clamp01(interpolate(ms, [a, a + dur], [0, 1], CLAMP));
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const at = (c: Cued, fallback: number, from: number, min = -Infinity) => Math.max(min, c.ms ?? cue(c.word, fallback, from));
const hash = (i: number) => {
  const x = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return x - Math.floor(x);
};

type Line = { text: string; emphasize?: string } & Cued;
const Lines: React.FC<{ lines: Line[]; from: number; to: number; color: string; rest: string }> = ({ lines, from, to, color, rest }) => {
  const ms = useMs();
  const t = lines.map((l, i) => at(l, from + i * 2000, from));
  return (
    <>
      {lines.map((l, i) => {
        const end = i + 1 < lines.length ? t[i + 1] : to + 400;
        const o = clamp01(interpolate(ms, [t[i] - 80, t[i], end - 220, end], [0, 1, 1, 0], CLAMP));
        if (o <= 0) return null;
        return (
          <div key={i} style={{ position: "absolute", left: 90, right: 90, top: 170, opacity: o }}>
            <FlowLine from={t[i]} to={end} line={l.text} size={56} color={color} emphasize={l.emphasize} empColor={color} restColor={rest} restWeight={700} lineHeight={1.1} />
          </div>
        );
      })}
    </>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// SignalTrace — noise that drains to one clean spike
// ══════════════════════════════════════════════════════════════════════════
export const SignalTrace: React.FC<{ x0: number; x1: number; y: number; draw: number; noise: number; spike: number; color: string; width?: number; amp?: number; spikeH?: number }> = ({
  x0, x1, y, draw, noise, spike, color, width = 6, amp = 46, spikeH = 240,
}) => {
  if (draw <= 0) return null;
  const mid = (x0 + x1) / 2;
  const xEnd = lerp(x0, x1, draw);
  const pts: string[] = [];
  for (let x = x0, i = 0; x <= xEnd; x += 6, i++) {
    // deterministic noise: two sines + a per-sample jitter, tapered at the ends
    const taper = Math.min(1, (x - x0) / 60, (x1 - x) / 60);
    const n = (Math.sin(x * 0.11) * 0.45 + Math.sin(x * 0.037 + 1.3) * 0.35 + (hash(i) - 0.5) * 0.9) * amp * noise * taper;
    const d = (x - mid) / 16;
    const sp = -spikeH * spike * Math.exp(-d * d);
    pts.push(`${i ? "L" : "M"} ${x.toFixed(1)} ${(y + n + sp).toFixed(1)}`);
  }
  return <path d={pts.join(" ")} fill="none" stroke={color} strokeWidth={width} strokeLinejoin="round" strokeLinecap="round" />;
};

// ══════════════════════════════════════════════════════════════════════════
// SamePartner — §4 (white card)
// ══════════════════════════════════════════════════════════════════════════
const SP = {
  trace: { x0: 120, x1: 960, y: 860 },
  buyer: { x: 540, y: 420, w: 360, h: 120 },
  field: { x0: 130, x1: 950, y0: 600, y1: 1380, n: 26 },
  lensR: 92,
  orig: { x: 90, y: 560, w: 420, h: 300 },
  copy: { x: 570, y: 560, w: 420, h: 300 },
  partner: { x: 540, y: 1200, w: 460, h: 130 },
  forkY: 1010,
  firstY: 500,
};
// the field: jittered grid positions, deterministic
const FIELD = Array.from({ length: SP.field.n }, (_, i) => {
  const cols = 4;
  const rows = Math.ceil(SP.field.n / cols);
  const c = i % cols;
  const r = Math.floor(i / cols);
  const cw = (SP.field.x1 - SP.field.x0) / cols;
  const rh = (SP.field.y1 - SP.field.y0) / rows;
  return {
    x: SP.field.x0 + cw * (c + 0.5) + (hash(i * 3) - 0.5) * cw * 0.45,
    y: SP.field.y0 + rh * (r + 0.5) + (hash(i * 3 + 1) - 0.5) * rh * 0.4,
    r: 34 + hash(i * 3 + 2) * 20,
    order: hash(i * 7 + 5),
  };
});

export const SamePartner: React.FC<Win & {
  signal: Cued; // the trace draws
  simple: Cued; // the noise drains
  buyer: { name: string } & Cued;
  shopping: Cued; // the field fills
  search: Cued; // the lens glides
  drain: Cued; // the field falls away
  original: { name: string } & Cued;
  build: { label: string } & Cued; // the copy is built
  partner: { name: string } & Cued;
  fork: Cued;
  first: { label: string } & Cued;
  lines: Line[];
}> = ({ from, to, signal, simple, buyer, shopping, search, drain, original, build, partner, fork, first, lines }) => {
  const ms = useMs();
  const k = useK();
  const ink = COLORS.ink;
  const red = COLORS.accent;
  const card = LAYOUT.card;
  const vis = clamp01(interpolate(ms, [to - 360, to], [1, 0], CLAMP));

  const tSig = at(signal, from + 200, from);
  const tSimple = at(simple, tSig + 600, from, tSig + 450);
  const tBuyer = at(buyer, tSimple + 1300, from, tSimple + 600);
  const tShop = at(shopping, tBuyer + 800, from, tBuyer + 400);
  const tSearch = at(search, tShop + 1200, from, tShop + 650);
  const tDrain = at(drain, tSearch + 1100, from, tSearch + 700);
  const tOrig = at(original, tDrain + 1000, from, tDrain + 700);
  const tBuild = at(build, tOrig + 350, from, tOrig + 250);
  const tPartner = at(partner, tBuild + 800, from, tBuild + 700);
  const tFork = at(fork, tPartner + 450, from, tPartner + 380);
  const tFirst = at(first, tFork + 1100, from, tFork + 500);

  // A — the trace
  const draw = EASE(k(tSig, 600));
  const noise = 1 - EASE_IO(k(tSimple, 520));
  const traceO = 1 - k(tBuyer - 100, 260);

  // B — buyer, field, lens, drain
  const buyerO = k(tBuyer, 120) * (1 - k(tOrig - 150, 220));
  const buyerS = interpolate(ms, [tBuyer, tBuyer + 300], [1.2, 1], { ...CLAMP, easing: EASE });
  const lensQ = EASE_IO(k(tSearch, Math.max(500, tDrain - tSearch - 120)));
  const lensO = k(tSearch, 150) * (1 - k(tDrain, 150));
  // the lens path: out of the buyer chip, a lazy S across the field
  const lensPt = (t: number) => {
    const p = [
      [SP.buyer.x, SP.buyer.y + 40],
      [250, 760],
      [820, 980],
      [300, 1240],
      [700, 1300],
    ];
    const seg = Math.min(p.length - 2, Math.floor(t * (p.length - 1)));
    const u = t * (p.length - 1) - seg;
    const e = EASE_IO(u);
    return { x: lerp(p[seg][0], p[seg + 1][0], e), y: lerp(p[seg][1], p[seg + 1][1], e) };
  };
  const lens = lensPt(lensQ);

  // C — the original, the copy being built, the partner, the fork
  const origO = k(tOrig, 120);
  const origS = interpolate(ms, [tOrig, tOrig + 320], [1.2, 1], { ...CLAMP, easing: EASE });
  const copyO = k(tBuild, 120);
  const built = EASE_IO(k(tBuild + 80, 700));
  const copyText = k(tBuild + 600, 250);
  const pO = k(tPartner, 120);
  const pS = interpolate(ms, [tPartner, tPartner + 320], [1.2, 1], { ...CLAMP, easing: EASE });
  const forkQ = EASE(k(tFork, 520));
  const firstO = k(tFirst, 140);
  const firstS = interpolate(ms, [tFirst, tFirst + 300], [1.25, 1], { ...CLAMP, easing: EASE });

  const cardText = (size: number, color: string): React.CSSProperties => ({ fontFamily: DISPLAY, fontWeight: 700, fontSize: size, letterSpacing: TRACK.headline, color, lineHeight: 1 });
  const cR = 22;
  const copyPerim = 2 * (SP.copy.w + SP.copy.h);

  // the fork: chip top -> junction -> both card bottoms
  const fx = SP.partner.x;
  const fTop = SP.partner.y - SP.partner.h / 2;
  const lx = SP.orig.x + SP.orig.w / 2;
  const rx = SP.copy.x + SP.copy.w / 2;
  const cardBot = SP.orig.y + SP.orig.h;
  const stem = fTop - SP.forkY;
  const branch = (rx - lx) / 2 + (SP.forkY - cardBot);
  const forkLen = stem + branch;
  const fl = forkQ * forkLen;
  const sLen = Math.min(fl, stem);
  const bLen = Math.max(0, fl - stem);
  const bPath = (toX: number) => {
    const horiz = Math.abs(toX - fx);
    const h = Math.min(bLen, horiz);
    const v = Math.max(0, bLen - horiz);
    const dir = Math.sign(toX - fx);
    return `M ${fx} ${SP.forkY} L ${fx + dir * h} ${SP.forkY}${v > 0 ? ` L ${toX} ${SP.forkY - v}` : ""}`;
  };

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {/* everything on the card is clipped to it, so the drained field falls OFF the card */}
      <div style={{ position: "absolute", left: card.left, top: card.top, right: card.right, bottom: card.bottom, overflow: "hidden", borderRadius: card.radius }}>
        <svg width={1080} height={1920} style={{ position: "absolute", left: -card.left, top: -card.top }}>
          {traceO > 0 ? (
            <g opacity={traceO}>
              <SignalTrace x0={SP.trace.x0} x1={SP.trace.x1} y={SP.trace.y} draw={draw} noise={noise} spike={1} color={ink} />
            </g>
          ) : null}

          {/* the field of candidates */}
          {ms >= tShop
            ? FIELD.map((f, i) => {
                const t0 = tShop + f.order * 450;
                const inQ = BACK(k(t0, 260));
                const dt = Math.max(0, (ms - (tDrain + f.order * 260)) / 1000);
                const fall = 0.5 * 4200 * dt * dt;
                const spin = (hash(i + 40) - 0.5) * 200 * dt;
                if (inQ <= 0 || f.y + fall > 2100) return null;
                return (
                  <g key={i} transform={`translate(${f.x + (hash(i + 9) - 0.5) * 60 * dt} ${f.y + fall}) rotate(${spin}) scale(${inQ})`}>
                    <circle r={f.r} fill="none" stroke={inkA(0.4)} strokeWidth={4} strokeDasharray="9 8" />
                    <text y={f.r * 0.36} textAnchor="middle" fontFamily={DISPLAY} fontWeight={700} fontSize={f.r} fill={inkA(0.4)}>?</text>
                  </g>
                );
              })
            : null}

          {/* the lens */}
          {lensO > 0 ? (
            <g transform={`translate(${lens.x} ${lens.y})`} opacity={lensO}>
              <circle r={SP.lensR} fill="rgba(255,255,255,0.55)" stroke={ink} strokeWidth={9} />
              <line x1={SP.lensR * 0.7} y1={SP.lensR * 0.7} x2={SP.lensR * 1.45} y2={SP.lensR * 1.45} stroke={ink} strokeWidth={16} strokeLinecap="round" />
            </g>
          ) : null}

          {/* the copy: dashed outline, then a solid stroke BUILT around its perimeter */}
          {copyO > 0 ? (
            <g opacity={copyO}>
              <rect x={SP.copy.x} y={SP.copy.y} width={SP.copy.w} height={SP.copy.h} rx={cR} fill="none" stroke={inkA(0.45)} strokeWidth={5} strokeDasharray="16 14" />
              <rect x={SP.copy.x} y={SP.copy.y} width={SP.copy.w} height={SP.copy.h} rx={cR} fill="none" stroke={ink} strokeWidth={7}
                pathLength={copyPerim} strokeDasharray={`${built * copyPerim} ${copyPerim}`} />
            </g>
          ) : null}

          {/* the fork, in red: the one partner under both */}
          {forkQ > 0 ? (
            <g fill="none" stroke={red} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round">
              <line x1={fx} y1={fTop} x2={fx} y2={fTop - sLen} />
              {bLen > 0 ? <path d={bPath(lx)} /> : null}
              {bLen > 0 ? <path d={bPath(rx)} /> : null}
            </g>
          ) : null}
        </svg>

        {/* the buyer chip */}
        {buyerO > 0 ? (
          <div style={{ position: "absolute", left: SP.buyer.x - card.left, top: SP.buyer.y - card.top, transform: `translate(-50%,-50%) scale(${buyerS})`, opacity: buyerO,
            width: SP.buyer.w, height: SP.buyer.h, borderRadius: SP.buyer.h / 2, background: ink, display: "flex", alignItems: "center", justifyContent: "center", ...cardText(56, COLORS.paper) }}>
            {buyer.name}
          </div>
        ) : null}

        {/* the original: solid, the drug name */}
        {origO > 0 ? (
          <div style={{ position: "absolute", left: SP.orig.x - card.left, top: SP.orig.y - card.top, width: SP.orig.w, height: SP.orig.h, borderRadius: cR, background: ink,
            opacity: origO, transform: `scale(${origS})`, display: "flex", alignItems: "center", justifyContent: "center", ...cardText(72, COLORS.paper) }}>
            {original.name}
          </div>
        ) : null}
        {copyText > 0 ? (
          <div style={{ position: "absolute", left: SP.copy.x - card.left, top: SP.copy.y - card.top, width: SP.copy.w, height: SP.copy.h, display: "flex", alignItems: "center", justifyContent: "center",
            textAlign: "center", padding: "0 30px", opacity: copyText, ...cardText(52, ink), lineHeight: 1.1 }}>
            {build.label}
          </div>
        ) : null}

        {/* the partner */}
        {pO > 0 ? (
          <div style={{ position: "absolute", left: SP.partner.x - card.left, top: SP.partner.y - card.top, transform: `translate(-50%,-50%) scale(${pS})`, opacity: pO,
            width: SP.partner.w, height: SP.partner.h, borderRadius: SP.partner.h / 2, background: ink, display: "flex", alignItems: "center", justifyContent: "center", ...cardText(60, COLORS.paper) }}>
            {partner.name}
          </div>
        ) : null}

        {firstO > 0 ? (
          <div style={{ position: "absolute", left: SP.orig.x - card.left, width: SP.orig.w, top: SP.firstY - card.top, transform: `translateY(-50%) scale(${firstS})`, opacity: firstO,
            textAlign: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: 44, letterSpacing: TRACK.kicker, color: red }}>
            {first.label}
          </div>
        ) : null}
      </div>

      <Lines lines={lines} from={from} to={to} color={ink} rest={inkA(0.4)} />
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// BriefClose — §5 (black)
// ══════════════════════════════════════════════════════════════════════════
const BC = {
  rows: { x: 120, w: 840, h: 112, gap: 26, y0: 300 },
  pull: { s: 0.7, cy: 600 }, // pulled stack 368-832, frame 328-872
  logoY: 230, // 193-267: clear of the frame top (328)
  button: { y: 1060, h: 130, x: 120, w: 840 },
  urlY: 1240,
  trace: { x0: 160, x1: 920, y: 1460 }, // spike peak 1330, clear of the URL (1240-1298)
  tagY: 1520,
};

export const BriefClose: React.FC<Win & {
  stories: { rows: { label?: string }[] } & Cued; // rows drop in
  verified: Cued; // checks
  issue: Cued; // camera pull into one issue
  brand: Cued; // the lockup lands
  subscribe: { label: string } & Cued;
  link: { label: string } & Cued;
  signal: { tagline: string } & Cued;
}> = ({ from, to, stories, verified, issue, brand, subscribe, link, signal }) => {
  const ms = useMs();
  const k = useK();
  const W = COLORS.paper;
  const red = COLORS.accent;

  const tRows = at(stories, from + 300, from);
  const tVer = at(verified, tRows + 900, from, tRows + 700);
  const tIssue = at(issue, tVer + 1100, from, tVer + 700);
  const tBrand = at(brand, tIssue + 1000, from, tIssue + 560);
  const tSub = at(subscribe, tBrand + 1000, from, tBrand + 500);
  const tLink = at(link, tSub + 600, from, tSub + 300);
  const tSig = at(signal, tLink + 900, from, tLink + 500);

  const pull = EASE_IO(k(tIssue, 560));
  const frame = EASE(k(tIssue + 300, 400));
  const n = stories.rows.length;
  const r = BC.rows;
  const stackH = n * r.h + (n - 1) * r.gap;
  const s = lerp(1, BC.pull.s, pull);
  const cy0 = r.y0 + stackH / 2;
  const cy = lerp(cy0, BC.pull.cy, pull);

  const logoO = k(tBrand, 140);
  const logoS = interpolate(ms, [tBrand, tBrand + 320], [1.25, 1], { ...CLAMP, easing: EASE });
  const btnQ = BACK(k(tSub, 360));
  const linkO = k(tLink, 200);
  const draw = EASE(k(tSig, 450));
  const noise = 1 - EASE_IO(k(tSig + 500, 600));
  const tagStart = tSig;

  const frameW = r.w * BC.pull.s + 80;
  const frameH = stackH * BC.pull.s + 80;

  return (
    <AbsoluteFill>
      {/* the issue frame, drawn round the five once they are pulled together */}
      {frame > 0 ? (
        <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
          <rect x={540 - frameW / 2} y={BC.pull.cy - frameH / 2} width={frameW} height={frameH} rx={24} fill="none" stroke={W} strokeWidth={5}
            pathLength={1000} strokeDasharray={`${frame * 1000} 1000`} />
        </svg>
      ) : null}

      <div style={{ position: "absolute", inset: 0, transformOrigin: `540px ${cy0}px`, transform: `translateY(${cy - cy0}px) scale(${s})` }}>
        {stories.rows.map((row, i) => {
          const t0 = tRows + i * 110;
          const d = BACK(k(t0, 300));
          const o = k(t0, 120);
          if (o <= 0) return null;
          const y = r.y0 + i * (r.h + r.gap) - 80 * (1 - d);
          const chk = EASE(k(tVer + i * 90, 260));
          return (
            <div key={i} style={{ position: "absolute", left: r.x, top: y, width: r.w, height: r.h, borderRadius: 16, background: COLORS.inkSoft, border: "2px solid rgba(255,255,255,0.18)", opacity: o }}>
              <div style={{ position: "absolute", left: 32, top: 0, bottom: 0, display: "flex", alignItems: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: 44, letterSpacing: TRACK.headline, color: "rgba(255,255,255,0.5)" }}>
                {String(i + 1).padStart(2, "0")}.
              </div>
              {row.label ? (
                <div style={{ position: "absolute", left: 130, top: 0, bottom: 0, display: "flex", alignItems: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: 44, letterSpacing: TRACK.headline, color: W }}>{row.label}</div>
              ) : (
                <>
                  <div style={{ position: "absolute", left: 130, top: 34, height: 16, width: 380 + hash(i) * 200, borderRadius: 8, background: "rgba(255,255,255,0.32)" }} />
                  <div style={{ position: "absolute", left: 130, top: 64, height: 12, width: 200 + hash(i + 5) * 160, borderRadius: 6, background: "rgba(255,255,255,0.16)" }} />
                </>
              )}
              {chk > 0 ? (
                <svg width={70} height={70} style={{ position: "absolute", right: 26, top: (r.h - 70) / 2 }}>
                  <circle cx={35} cy={35} r={30} fill="none" stroke={W} strokeWidth={5} opacity={clamp01(chk * 2)} />
                  <path d="M 21 36 L 31 46 L 50 25" fill="none" stroke={W} strokeWidth={7} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={`${chk} 1`} />
                </svg>
              ) : null}
            </div>
          );
        })}
      </div>

      {logoO > 0 ? (
        <div style={{ position: "absolute", left: 540, top: BC.logoY, transform: `translate(-50%,-50%) scale(${logoS})`, opacity: logoO }}>
          <Wordmark size={74} mark="wordmark" />
        </div>
      ) : null}

      {/* the button and the URL */}
      {btnQ > 0 ? (
        <div style={{ position: "absolute", left: BC.button.x, width: BC.button.w, top: BC.button.y, height: BC.button.h, background: red, transform: `scale(${lerp(0.85, 1, btnQ)})`, opacity: clamp01(btnQ * 1.5),
          display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: 64, letterSpacing: TRACK.headline, color: W }}>
          {subscribe.label}
        </div>
      ) : null}
      {linkO > 0 ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: BC.urlY, textAlign: "center", opacity: linkO, fontFamily: DISPLAY, fontWeight: 700, fontSize: 48, letterSpacing: TRACK.headline, color: "rgba(255,255,255,0.75)" }}>
          {link.label}
        </div>
      ) : null}

      {/* the callback: the trace returns and sheds its noise */}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <SignalTrace x0={BC.trace.x0} x1={BC.trace.x1} y={BC.trace.y} draw={draw} noise={noise} spike={1} color={W} spikeH={130} amp={30} />
      </svg>
      {ms >= tagStart - 80 ? (
        <div style={{ position: "absolute", left: 90, right: 90, top: BC.tagY }}>
          <FlowLine from={tagStart} to={to + 1000} line={signal.tagline} size={72} color={W} align="center" />
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
