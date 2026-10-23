// ─────────────────────────────────────────────────────────────────────────
// KIT · whogate — NOT ONE FORMULATION: WHO HOLDS THE GATE. Added on the
// Merck / Halozyme subcutaneous Keytruda long-form, 2026-10-09 (VERTICAL).
// THE GATE SPINE PAYS OFF here: the patent tag from kit/barred `RulingGate`
// returns on a gate that a whole field of biologics now waits at.
//
// `SignalGate` (ink, no footage): "The signal: the fight isn't about one
// formulation. It's about who controls the gate to the entire biologic-to-SC
// shift." The section words at hero size; one pill, struck on "isn't" and
// captioned; after the pause it all retires and the gate slams down. A dashed
// (not yet named) seat draws over it on "controls" and fills with the patent
// tag on "gate". A field of biologics deals out on one side on "entire", and
// the SC pill stamps on the other side.
//
// `GateEnd` (white card): the story filed as a tile inside this week's issue,
// the lockup, the button, the URL typed, the tagline on its words.
//
// Every onset is a spoken word with an optional ms pin, clamped monotonic.
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { CLAMP, clamp01, COLORS, DISPLAY, INK_SUB, TRACK, useMs } from "./core";
import { TYPE } from "../style";
import { at, lerp, Phrase, useK, type Cued, type Win } from "./elora";
import { FlowLine } from "./flowline";
import { Wordmark } from "./ui";
import { Biologic, COURT } from "./barred";
import { Pill } from "./banlanes";

const EASE = Easing.out(Easing.cubic);
const BACK = Easing.out(Easing.back(1.6));

// ══════════════════════════════════════════════════════════════════════════
// SignalGate — the spine pays off (ink world)
// ══════════════════════════════════════════════════════════════════════════
export const SIG = {
  title: { y: 760, size: 150 },
  pill: { x: 340, y: 590, w: 400, h: 227 },
  captionTop: 862,
  tag: { x: 390, y: 430, w: 300, h: 110 },
  gate: { x: 523, y: 560, w: 34, h: 550 },
  field: { x: 110, y: 590, cell: 130, cols: 3, rows: 4, icon: 100 },
  fieldLabelTop: 1128,
  dest: { x: 670, y: 750, w: 300, h: 170 },
};

export const SignalGate: React.FC<Win & {
  title: { text: string } & Cued; // the section words, hero size
  one: { short: string; long: string } & Cued; // the one pill stamps ("the fight")
  strike: Cued; // ...is struck ("isn't")
  caption: { label: string } & Cued; // "One formulation"
  about: Cued; // it all retires ("It's about")
  gate: Cued; // the gate slams down ("who controls")
  seat: Cued; // a dashed, unnamed seat over it ("controls")
  holder: { lines: string[] } & Cued; // the seat fills with the patent tag ("gate")
  field: { label: string } & Cued; // the biologics deal out ("entire")
  dest: { short: string; long: string } & Cued; // the SC pill on the far side
  lines: { text: string; emphasize?: string }[]; // exactly two
}> = ({ from, to, title, one, strike, caption, about, gate, seat, holder, field, dest, lines }) => {
  const ms = useMs();
  const k = useK();
  const W = COLORS.paper;
  const R = COLORS.accent;
  const S = SIG;

  const tTitle = at(title, from + 470, from);
  const tOne = at(one, tTitle + 1000, from, tTitle + 500);
  const tStrike = at(strike, tOne + 300, from, tOne + 220);
  const tCaption = at(caption, tStrike + 700, from, tStrike + 300);
  const tAbout = at(about, tCaption + 1400, from, tCaption + 500);
  const tGate = at(gate, tAbout + 300, from, tAbout + 220);
  const tSeat = at(seat, tGate + 250, from, tGate + 220);
  const tHolder = at(holder, tSeat + 900, from, tSeat + 300);
  const tField = at(field, tHolder + 700, from, tHolder + 300);
  const tDest = at(dest, tField + 500, from, tField + 420);

  if (ms > to) return null;

  const titleO = k(tTitle, 140) * (1 - k(tOne - 180, 160));
  const titleS = interpolate(ms, [tTitle, tTitle + 300], [1.08, 1], { ...CLAMP, easing: EASE });
  const aO = 1 - k(tAbout, 200);
  const oneO = k(tOne, 120);
  const oneS = interpolate(ms, [tOne, tOne + 280], [1.14, 1], { ...CLAMP, easing: EASE });
  const strikeK = EASE(k(tStrike, 220));
  const gateO = k(tGate, 100);
  const gateY = lerp(-140, 0, EASE(k(tGate, 260)));
  const seatO = k(tSeat, 160);
  const holdK = k(tHolder, 200);
  const destO = k(tDest, 120);
  const destS = interpolate(ms, [tDest, tDest + 280], [1.16, 1], { ...CLAMP, easing: EASE });
  const n = S.field.cols * S.field.rows;

  return (
    <AbsoluteFill>
      {/* the section words */}
      {titleO > 0 ? (
        <div style={{ position: "absolute", left: 0, right: 0, top: S.title.y, textAlign: "center", opacity: titleO, transform: `translateY(-50%) scale(${titleS})`, fontFamily: DISPLAY, fontWeight: 700, fontSize: S.title.size, lineHeight: 1, letterSpacing: TRACK.display, color: W }}>
          {title.text}
        </div>
      ) : null}

      {/* one formulation, struck. Retires after the pause. */}
      {aO > 0 && oneO > 0 ? (
        <AbsoluteFill style={{ opacity: aO }}>
          <Pill rect={S.pill} short={one.short} long={one.long} solid opacity={oneO * lerp(1, 0.45, strikeK)} scale={oneS} />
          {strikeK > 0 ? (
            <div style={{ position: "absolute", left: 540 - 270, top: S.pill.y + S.pill.h / 2 - 7, width: 540, height: 14, transform: "rotate(-17deg)" }}>
              <div style={{ width: `${strikeK * 100}%`, height: "100%", borderRadius: 7, background: R }} />
            </div>
          ) : null}
          <div style={{ position: "absolute", left: 0, right: 0, top: S.captionTop, textAlign: "center", opacity: k(tCaption, 160), fontFamily: DISPLAY, fontWeight: 700, fontSize: TYPE.label, letterSpacing: TRACK.nav, color: W }}>
            {caption.label}
          </div>
        </AbsoluteFill>
      ) : null}

      {/* the gate */}
      {gateO > 0 ? <div style={{ position: "absolute", left: S.gate.x, top: S.gate.y + gateY, width: S.gate.w, height: S.gate.h, borderRadius: 8, background: R, opacity: gateO }} /> : null}

      {/* who holds it: a dashed seat, then the patent tag from §1 */}
      {seatO > 0 ? (
        <div style={{ position: "absolute", left: S.tag.x, top: S.tag.y, width: S.tag.w, height: S.tag.h, boxSizing: "border-box", borderRadius: 18, overflow: "hidden", opacity: seatO,
          border: `3px ${holdK > 0 ? "solid" : "dashed"} ${W}`, background: `rgba(0,0,0,${0.78 * holdK})`, transform: `scale(${lerp(1, 1.06, holdK > 0 && holdK < 1 ? Math.sin(holdK * Math.PI) : 0)})` }}>
          <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 12, background: R, opacity: holdK }} />
          <div style={{ position: "absolute", left: 30, right: 8, top: 0, bottom: 0, opacity: holdK, display: "flex", flexDirection: "column", justifyContent: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: TYPE.labelSm, letterSpacing: TRACK.nav, color: W, lineHeight: 1.15, whiteSpace: "nowrap" }}>
            {holder.lines.map((t) => <div key={t}>{t}</div>)}
          </div>
        </div>
      ) : null}

      {/* the entire field, waiting on one side: one cascade, then still */}
      {Array.from({ length: n }, (_, i) => {
        const q = k(tField + i * 40, 220);
        if (q <= 0) return null;
        const x = S.field.x + (i % S.field.cols) * S.field.cell + (S.field.cell - S.field.icon) / 2;
        const y = S.field.y + Math.floor(i / S.field.cols) * S.field.cell + (S.field.cell - S.field.icon) / 2;
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y, opacity: clamp01(q * 3), transform: `scale(${lerp(0.6, 1, BACK(q))})` }}>
            <Biologic color={W} w={S.field.icon} />
          </div>
        );
      })}
      <div style={{ position: "absolute", left: S.field.x, width: S.field.cell * S.field.cols, top: S.fieldLabelTop, textAlign: "center", opacity: k(tField + n * 40 + 120, 160), fontFamily: DISPLAY, fontWeight: 700, fontSize: TYPE.labelSm, letterSpacing: TRACK.nav, color: INK_SUB }}>
        {field.label}
      </div>

      {/* the far side */}
      {destO > 0 ? <Pill rect={S.dest} short={dest.short} long={dest.long} solid opacity={destO} scale={destS} /> : null}

      <Phrase from={tOne} to={tAbout - 150} line={lines[0].text} top={COURT.lineTop} size={60} color={W} emphasize={lines[0].emphasize} empColor={W} restColor={INK_SUB} />
      <Phrase from={tAbout} to={to + 400} line={lines[1].text} top={COURT.lineTop} size={60} color={W} emphasize={lines[1].emphasize} empColor={W} restColor={INK_SUB} />
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// GateEnd — the end card (white card world). Layout follows kit/nextone `BriefEnd`.
// ══════════════════════════════════════════════════════════════════════════
export const GATE_END = {
  lockupY: 250,
  issue: { x: 160, y: 380, w: 760, h: 520 },
  tile: { x: 240, y: 530, w: 600, h: 300 },
  plate: { w: 540, h: 84 },
  button: { x: 160, y: 980, w: 760, h: 132 },
  linkY: 1160,
  taglineY: 1290,
};

export const GateEnd: React.FC<Win & {
  issue: { label: string } & Cued; // the issue frame rises, its label on `labelAt`
  labelAt: Cued;
  tile: { sub: string; name: string; plate: string };
  brand: Cued; // the lockup lands
  subscribe: { label: string } & Cued;
  link: { label: string } & Cued; // types
  tagline: { text: string } & Cued;
}> = ({ from, to, issue, labelAt, tile, brand, subscribe, link, tagline }) => {
  const ms = useMs();
  const k = useK();
  const INK = COLORS.ink;
  const W = COLORS.paper;
  const E = GATE_END;

  const tIssue = at(issue, from + 320, from);
  const tLabel = at(labelAt, tIssue + 150, from, tIssue + 100);
  const tBrand = at(brand, tLabel + 500, from, tLabel + 250);
  const tSub = at(subscribe, tBrand + 1300, from, tBrand + 500);
  const tLink = at(link, tSub + 500, from, tSub + 300);
  const tTag = at(tagline, tLink + 700, from, tLink + 450);

  if (ms < tIssue - 40 || ms > to) return null;

  const issueK = EASE(k(tIssue, 360));
  const brandO = k(tBrand, 120);
  const brandS = interpolate(ms, [tBrand, tBrand + 300], [1.14, 1], { ...CLAMP, easing: EASE });
  const subO = k(tSub, 110);
  const subS = interpolate(ms, [tSub, tSub + 280], [1.08, 1], { ...CLAMP, easing: EASE });
  const typed = Math.round(link.label.length * k(tLink, Math.max(300, Math.min(600, tTag - tLink - 100))));

  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: E.lockupY - 40, display: "flex", justifyContent: "center", opacity: brandO, transform: `scale(${brandS})` }}>
        <Wordmark size={80} tone="brand" />
      </div>

      {/* the issue, with the story filed inside it */}
      <AbsoluteFill style={{ opacity: clamp01(issueK * 2), transform: `translateY(${(1 - issueK) * 70}px)` }}>
        <div style={{ position: "absolute", left: E.issue.x, top: E.issue.y, width: E.issue.w, height: E.issue.h, borderRadius: 30, background: INK }} />
        <div style={{ position: "absolute", left: E.issue.x + 44, top: E.issue.y + 36, opacity: k(tLabel, 130), fontFamily: DISPLAY, fontWeight: 700, fontSize: 40, letterSpacing: TRACK.nav, color: "rgba(255,255,255,0.62)", lineHeight: 1 }}>
          {issue.label}
        </div>
        <div style={{ position: "absolute", left: E.tile.x, top: E.tile.y, width: E.tile.w, height: E.tile.h, borderRadius: 26, background: W, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", paddingTop: 24, boxSizing: "border-box",
          fontFamily: DISPLAY, color: INK, lineHeight: 1.02, whiteSpace: "nowrap" }}>
          <div style={{ fontWeight: 400, fontSize: 48, letterSpacing: TRACK.headline }}>{tile.sub}</div>
          <div style={{ fontWeight: 700, fontSize: 124, letterSpacing: TRACK.display }}>{tile.name}</div>
        </div>
        <div style={{ position: "absolute", left: E.tile.x + E.tile.w / 2 - E.plate.w / 2, top: E.tile.y - E.plate.h / 2, width: E.plate.w, height: E.plate.h, boxSizing: "border-box", borderRadius: E.plate.h / 2, background: W, border: `6px solid ${INK}`,
          display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: 44, letterSpacing: TRACK.headline, color: INK, whiteSpace: "nowrap" }}>
          {tile.plate}
        </div>
      </AbsoluteFill>

      <div style={{ position: "absolute", left: E.button.x, top: E.button.y, width: E.button.w, height: E.button.h, background: COLORS.accent, opacity: subO, transform: `scale(${subS})`,
        display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: 62, letterSpacing: TRACK.headline, color: W, whiteSpace: "nowrap" }}>
        {subscribe.label}
      </div>

      <div style={{ position: "absolute", left: 0, right: 0, top: E.linkY, textAlign: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: 48, letterSpacing: TRACK.body, color: INK, lineHeight: 1, whiteSpace: "nowrap" }}>
        {link.label.slice(0, typed)}
      </div>

      <div style={{ position: "absolute", left: 90, right: 90, top: E.taglineY }}>
        <FlowLine from={tTag} to={to} line={tagline.text} size={84} color={INK} align="center" />
      </div>
    </AbsoluteFill>
  );
};
