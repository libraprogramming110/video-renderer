// ─────────────────────────────────────────────────────────────────────────
// KIT · card — the three carousel layouts translated to motion (THE CARD LOOK,
// 2026-09-22). Each one is a live Catalyst Brief carousel template, VO-conducted:
//
//   CoverCard     — p1-cover: a photo plate on top, the full RED panel below, the
//                   white Inter-bold headline flowing in word by word as it is spoken.
//                   The title / hook card. Put it in a `red` World (the panel IS the
//                   world, and the chrome then draws p1-cover's white hairline).
//   SectionCard   — p2-cover: a rounded RED card on the black ground, "02." + the
//                   section title + a white hairline + an optional "▶" line. The
//                   chapter opener. Put it in an `ink` World.
//   FramedFootage — p1-content: a framed colour photo/clip on black, the white bold
//                   body line flowing beside (landscape) or under (portrait) it. The
//                   b-roll beat. `ink` World ONLY (it throws in red or on the card).
//
// Same contract as every block: content as props, timing from the VO (each word on
// its spoken frame via cueSeq), a [from,to] window, an explicit-ms escape hatch.
// Format-aware (vertical / horizontal) and aware of the chrome band (LAYOUT).
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, Easing, Img, interpolate, Sequence, staticFile, useVideoConfig } from "remotion";
import { BrollVideo, CLAMP, clamp01, COLORS, cueSeq, DISPLAY, INK_SUB, msToFrame, NavArrow, SANS, TRACK, useAccent, useMs, usePop, useRequireInk, useWorld } from "./core";
import { FORMAT, LAYOUT } from "../style";

const V = FORMAT.key === "vertical";
type Win = { from: number; to: number };

const useVis = (from: number, to: number, padIn = 360, padOut = 360) => {
  const ms = useMs();
  return clamp01(interpolate(ms, [from, from + padIn, to - padOut, to], [0, 1, 1, 0], CLAMP));
};

// the kit's word snap (block-kit.md: ~130ms opacity + small rise, fired on startMs)
const Word: React.FC<{ text: string; onsetMs: number; style: React.CSSProperties }> = ({ text, onsetMs, style }) => {
  const ms = useMs();
  const p = clamp01(interpolate(ms, [onsetMs, onsetMs + 130], [0, 1], CLAMP));
  return (
    <span style={{ ...style, display: "inline-block", opacity: p, transform: `translateY(${interpolate(p, [0, 1], [16, 0], CLAMP)}px)` }}>
      {text}
    </span>
  );
};

/**
 * Resolve a line's tokens to spoken onsets (word-index cursor), fill the gaps with
 * an even stagger, and optionally PIN the flow's first word to `pinMs` while keeping
 * the VO's own cadence (the operator's "land it at 12.40" override, applied to a flow).
 */
const useFlow = (line: string, from: number, to: number, pinMs?: number) => {
  const toks = line.split(/\s+/).filter(Boolean);
  const got = cueSeq(toks, from, to);
  const span = Math.max(700, to - from - 900);
  const filled = got.map((m, i) => m ?? from + 250 + (span * i) / Math.max(1, toks.length - 1));
  const delta = pinMs != null && filled.length ? pinMs - filled[0] : 0;
  return { toks, onsets: filled.map((m) => m + delta) };
};

const nz = (s: string) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
/** indices of the first contiguous token run matching `phrase` */
const runOf = (toks: string[], phrase?: string): Set<number> => {
  const out = new Set<number>();
  if (!phrase) return out;
  const want = phrase.split(/\s+/).filter(Boolean).map(nz).filter(Boolean);
  for (let i = 0; i + want.length <= toks.length; i++) {
    if (want.every((w, k) => nz(toks[i + k]) === w)) { want.forEach((_, k) => out.add(i + k)); break; }
  }
  return out;
};

const EASE_OUT = Easing.out(Easing.cubic);
const isClip = (src: string) => /\.(mp4|webm|mov|m4v)$/i.test(src);

/** A photo or a clip, cover-fit, with a slow push so a held plate never freezes. */
const Plate: React.FC<{ src: string; from: number; to: number; position?: string }> = ({ src, from, to, position = "center" }) => {
  const ms = useMs();
  const { fps } = useVideoConfig();
  const push = interpolate(ms, [from, Math.max(from + 1, to)], [1.04, 1.1], CLAMP);
  const style: React.CSSProperties = { width: "100%", height: "100%", objectFit: "cover", objectPosition: position, display: "block" };
  return (
    <AbsoluteFill style={{ transform: `scale(${push})`, transformOrigin: "center center" }}>
      {isClip(src) ? (
        // the clip plays from ITS frame 0 when the beat opens (see FootageScrim's note)
        <Sequence from={msToFrame(from, fps)} layout="none">
          <BrollVideo src={staticFile(src)} style={style} />
        </Sequence>
      ) : (
        <Img src={staticFile(src)} style={style} />
      )}
    </AbsoluteFill>
  );
};

// ── CoverCard — p1-cover ────────────────────────────────────────────────────
export const CoverCard: React.FC<Win & {
  /** the headline — VERBATIM to the VO so each word snaps on its spoken frame */
  headline: string;
  /** a small label above the headline (e.g. "FDA approval · Gene therapy") */
  kicker?: string;
  /** public/ path of the top plate — an image or a clip. Omit for an all-red cover. */
  photo?: string;
  photoPosition?: string;
  /** pin the headline's first word to this ms (keeps the VO cadence) */
  headlineMs?: number;
  /** headline size override (default 100 landscape / 96 portrait) */
  size?: number;
}> = ({ from, to, headline, kicker, photo, photoPosition, headlineMs, size }) => {
  const ms = useMs();
  const vis = useVis(from, to, 200, 360);
  const { toks, onsets } = useFlow(headline, from, to, headlineMs);
  const k = usePop(from + 200, { rise: 12 });
  const photoH = V ? 880 : 520;
  // the plate reveals DOWNWARD from the top edge as the beat opens, then pushes slowly
  const reveal = EASE_OUT(clamp01(interpolate(ms, [from, from + 650], [0, 1], CLAMP)));
  const { h: bandH } = LAYOUT.chrome;
  const box = V
    ? { left: 84, right: 84, top: photoH + 56, bottom: LAYOUT.safeBottom + 40 }
    : { left: 150, right: 150, top: photoH + 40, bottom: bandH + 40 };
  const hs: React.CSSProperties = {
    fontFamily: DISPLAY, fontWeight: 700, fontSize: size ?? (V ? 96 : 100), letterSpacing: TRACK.display,
    lineHeight: 1.215, color: COLORS.paper, marginRight: "0.24em", // p1-cover: --hl-leading 1.215
  };
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <AbsoluteFill style={{ background: COLORS.accent }} />
      {photo ? (
        <div style={{ position: "absolute", left: 0, top: 0, right: 0, height: photoH, overflow: "hidden", clipPath: `inset(0 0 ${(1 - reveal) * 100}% 0)` }}>
          <Plate src={photo} from={from} to={to} position={photoPosition} />
        </div>
      ) : null}
      <div style={{ position: "absolute", ...box, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        {kicker ? (
          <div style={{ ...k, marginBottom: 22, fontFamily: SANS, fontWeight: 700, fontSize: V ? 32 : 30, letterSpacing: TRACK.nav, color: "rgba(255,255,255,0.8)" }}>{kicker}</div>
        ) : null}
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          {toks.map((t, i) => <Word key={i} text={t} onsetMs={onsets[i]} style={hs} />)}
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── SectionCard — p2-cover ──────────────────────────────────────────────────
export const SectionCard: React.FC<Win & {
  /** the section number, shown as "02." above the title */
  index?: number | string;
  /** the section title — VERBATIM if it is voiced (word flow); else pin `titleMs` */
  title: string;
  /** an optional line under the hairline, with the ▶ (p2-cover's "Swipe for more ▶" slot) */
  sub?: string;
  titleMs?: number;
}> = ({ from, to, index, title, sub, titleMs }) => {
  const inRed = useWorld() === "red"; // a red card would vanish on the red world — invert it
  const cardBg = inRed ? COLORS.paper : COLORS.accent;
  const ink = inRed ? COLORS.accent : COLORS.paper;
  const soft = inRed ? COLORS.accent : "rgba(255,255,255,0.8)";
  const vis = useVis(from, to, 300, 360);
  const card = usePop(from, { rise: 30, scale: true });
  const { toks, onsets } = useFlow(title, from, to, titleMs);
  const subP = usePop((onsets[onsets.length - 1] ?? from) + 350, { rise: 10 });
  const num = typeof index === "number" ? String(index).padStart(2, "0") : index;
  const W = V ? 920 : 1180;
  const H = V ? 1000 : 640;
  const top = V ? LAYOUT.chrome.h + (1920 - LAYOUT.chrome.h - LAYOUT.safeBottom - H) / 2 : (1080 - LAYOUT.chrome.h - H) / 2;
  const inset = V ? 70 : 90;
  const ts: React.CSSProperties = {
    fontFamily: DISPLAY, fontWeight: 700, fontSize: V ? 112 : 124, letterSpacing: "-0.0455em", // p2-cover --hl-track
    lineHeight: 1.1, color: ink, margin: "0 0.12em",
  };
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <div style={{ position: "absolute", left: "50%", top, width: W, height: H, marginLeft: -W / 2, ...card }}>
        <div style={{ position: "absolute", inset: 0, background: cardBg, borderRadius: 30 }} />
        <div style={{ position: "absolute", left: inset, right: inset, top: 0, bottom: sub ? 150 : 90, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
          {num ? <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: V ? 44 : 42, letterSpacing: TRACK.nav, color: soft, marginBottom: 26 }}>{num}.</div> : null}
          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center" }}>
            {toks.map((t, i) => <Word key={i} text={t} onsetMs={onsets[i]} style={ts} />)}
          </div>
        </div>
        {sub ? (
          <>
            <div style={{ position: "absolute", left: inset, right: inset, bottom: 118, height: 1, background: inRed ? COLORS.accent : "rgba(255,255,255,0.81)" }} />
            <div style={{ ...subP, position: "absolute", left: 0, right: 0, bottom: 44, display: "flex", alignItems: "center", justifyContent: "center", gap: 16, color: ink }}>
              <span style={{ fontFamily: SANS, fontWeight: 400, fontSize: V ? 34 : 32, letterSpacing: "-0.02em" }}>{sub}</span>
              <NavArrow size={V ? 30 : 28} color={ink} />
            </div>
          </>
        ) : null}
      </div>
    </AbsoluteFill>
  );
};

// ── FramedFootage — p1-content ──────────────────────────────────────────────
export const FramedFootage: React.FC<Win & {
  /** public/ path — an image (jpg/png/webp) or a clip (mp4/webm/mov) */
  src: string;
  /** the body line — VERBATIM to the VO; flows word by word in white Inter bold */
  body: string;
  /** a phrase inside `body` set in the accent (the scene's one red) */
  emphasize?: string;
  /** an optional small label above the body */
  kicker?: string;
  objectPosition?: string;
  /** pin the body's first word to this ms (keeps the VO cadence) */
  bodyMs?: number;
  /** body size override (default 56 landscape / 60 portrait) */
  size?: number;
}> = ({ from, to, src, body, emphasize, kicker, objectPosition, bodyMs, size }) => {
  // ink only: on the white card its white body is invisible; on red the emphasis
  // (white there) merges into the white body. (RETROSPECTIVE 2026-09-22)
  useRequireInk("FramedFootage");
  const ms = useMs();
  const acc = useAccent();
  const vis = useVis(from, to);
  const { toks, onsets } = useFlow(body, from, to, bodyMs);
  const emp = runOf(toks, emphasize);
  const k = usePop(from + 250, { rise: 12 });
  const reveal = EASE_OUT(clamp01(interpolate(ms, [from + 80, from + 760], [0, 1], CLAMP)));
  const band = LAYOUT.chrome.h;
  // p1-content: the frame sits at the side margin, square corners, no border
  const frame = V
    ? { left: 54, top: band + 54, width: 1080 - 108, height: 860 }
    : { left: 84, top: 84, width: 1000, height: 1080 - band - 84 - 60 };
  const text = V
    ? { left: 54, right: 54, top: frame.top + frame.height + 44, bottom: LAYOUT.safeBottom + 24 }
    : { left: frame.left + frame.width + 76, right: 84, top: frame.top, bottom: band + 60 };
  const bs: React.CSSProperties = {
    fontFamily: DISPLAY, fontWeight: 700, fontSize: size ?? (V ? 60 : 56), letterSpacing: TRACK.body, // p1-content --body-track
    lineHeight: 1.19, color: COLORS.paper, marginRight: "0.24em",
  };
  const outside = ms < from - 400 || ms > to + 400; // unmount the plate off-window (a live <video> stalls the Studio)
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <div style={{ position: "absolute", ...frame, overflow: "hidden", background: COLORS.inkSoft, clipPath: `inset(0 0 ${(1 - reveal) * 100}% 0)` }}>
        {outside ? null : <Plate src={src} from={from} to={to} position={objectPosition} />}
      </div>
      <div style={{ position: "absolute", ...text, display: "flex", flexDirection: "column", justifyContent: "center" }}>
        {kicker ? <div style={{ ...k, marginBottom: 20, fontFamily: SANS, fontWeight: 700, fontSize: V ? 30 : 28, letterSpacing: TRACK.nav, color: INK_SUB }}>{kicker}</div> : null}
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          {toks.map((t, i) => <Word key={i} text={t} onsetMs={onsets[i]} style={emp.has(i) ? { ...bs, color: acc } : bs} />)}
        </div>
      </div>
    </AbsoluteFill>
  );
};
