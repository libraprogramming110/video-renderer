// ─────────────────────────────────────────────────────────────────────────
// KIT · barred — ONE COURT, MANY COUNTRIES, AND A PATENT THAT IS A GATE. Added
// on the Merck / Halozyme subcutaneous Keytruda long-form, 2026-10-09
// (VERTICAL). Built under the one-mover rule (09-30) and the frame budget
// (10-05): each cue gets ONE motion, anything landed goes still, a finished
// idea retires.
//
// `EightOne` (red, the hook): "Eight… European countries… one Dutch
// courtroom." The figure slams; the label lands per word; eight blank tiles
// deal out (`tileRect`, the seats the ban names later); a white plate stamps
// under them on "one" and a brace ties all eight to it on "courtroom".
//
// `RulingGate` (ink, over a FootageScrim): "On October 7th, a specialized
// patent court in The Hague ruled that Merck infringed Halozyme's enzyme
// patent, the one that lets large biologics be delivered under the skin."
// The plate is revealed on its hook seat by the wipe, rises to the middle and
// becomes the court (a day leaf flips over it, its text rolls to the court,
// a pin drops on the city). On "ruled" court and date dock as a header and
// the ruling is built under them: the loser, a link reaching down, a red
// stamp across the link, the patent's card where the link ends. After the
// pause the ruling retires and the card shrinks into the tag of a GATE in a
// skin line: a large biologic waits above it, the gate opens, and the
// biologic passes through and lands under the skin.
//
// Every onset is a spoken word with an optional ms pin, clamped monotonic.
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { CLAMP, clamp01, COLORS, DISPLAY, INK_SUB, TRACK, useMs } from "./core";
import { TYPE } from "../style";
import { at, lerp, Phrase, useK, type Cued, type Win } from "./elora";

const EASE = Easing.out(Easing.cubic);
const EASE_IO = Easing.inOut(Easing.cubic);
const BACK = Easing.out(Easing.back(1.6));

type Rect = { x: number; y: number; w: number; h: number };
const mix = (a: Rect, b: Rect, t: number): Rect => ({ x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), w: lerp(a.w, b.w, t), h: lerp(a.h, b.h, t) });

/** The hook's geometry (1080×1920). The tile seats are reused by the ban. */
export const EIGHT = {
  fig: { y: 430, size: 480 },
  label: { top: 668, size: 84 },
  grid: { x: 124, y: 850, w: 190, h: 150, gap: 24, cols: 4 },
  brace: { tick: 1205, bar: 1250 },
};
export const tileRect = (i: number): Rect => {
  const g = EIGHT.grid;
  return { x: g.x + (i % g.cols) * (g.w + g.gap), y: g.y + Math.floor(i / g.cols) * (g.h + g.gap), w: g.w, h: g.h };
};

/** The court plate's seats, and the day leaf's. */
export const COURT = {
  hook: { x: 160, y: 1350, w: 760, h: 170 }, // under the tiles
  big: { x: 140, y: 700, w: 800, h: 300 }, // alone in the frame
  head: { x: 290, y: 185, w: 680, h: 150 }, // docked header
  leafBig: { x: 450, y: 440, w: 180, h: 200 },
  leafHead: { x: 110, y: 180, w: 150, h: 160 },
  lineTop: 1330, // narration
};

const Pin: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size * 0.72} height={size} viewBox="0 0 36 50" style={{ display: "block", flex: "none" }}>
    <path d="M18 0C8 0 0 8 0 18c0 13 18 32 18 32s18-19 18-32C36 8 28 0 18 0z" fill={color} />
    <circle cx={18} cy={18} r={7} fill={COLORS.paper} />
  </svg>
);

/**
 * The white plate. Content is laid out 800 wide and scaled with the rect, so it
 * reads at every seat. `words` = the hook line's per-word opacities; `roll` 0→1
 * rolls the hook line out and the court's name in; `place` is the city row.
 */
export const CourtPlate: React.FC<{
  rect: Rect;
  hook: { count: string; rest: string[] };
  words: number[]; // opacity of count, then each of `rest`
  court?: string;
  roll?: number;
  place?: { label: string; pinK: number; textK: number };
  opacity?: number;
  scale?: number;
}> = ({ rect, hook, words, court, roll = 0, place, opacity = 1, scale = 1 }) => {
  const s = rect.w / 800;
  const INK = COLORS.ink;
  const centre: React.CSSProperties = { position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" };
  return (
    <div style={{ position: "absolute", left: rect.x, top: rect.y, width: rect.w, height: rect.h, opacity, transform: `scale(${scale})`, background: COLORS.paper, borderRadius: 30 * Math.max(0.6, s), overflow: "hidden" }}>
      <div style={{ position: "absolute", left: 0, top: 0, width: 800, height: rect.h / s, transform: `scale(${s})`, transformOrigin: "0 0" }}>
        {roll < 1 ? (
          <div style={{ ...centre, opacity: 1 - roll, transform: `translateY(${-roll * 44}px)`, fontFamily: DISPLAY, fontWeight: 700, fontSize: 72, letterSpacing: TRACK.headline, color: INK, whiteSpace: "nowrap" }}>
            <div>
              <span style={{ color: COLORS.accent, opacity: words[0] ?? 1 }}>{hook.count}</span>
              {hook.rest.map((w, i) => (
                <span key={i} style={{ opacity: words[i + 1] ?? 1 }}> {w}</span>
              ))}
            </div>
          </div>
        ) : null}
        {roll > 0 && court ? (
          <div style={{ ...centre, opacity: roll, transform: `translateY(${(1 - roll) * 44}px)`, fontFamily: DISPLAY, fontWeight: 700, color: INK, whiteSpace: "nowrap", lineHeight: 1.05 }}>
            <div style={{ fontSize: 96, letterSpacing: TRACK.display }}>{court}</div>
            {place ? (
              <div style={{ display: "flex", alignItems: "flex-end", gap: 14, height: 62 }}>
                <div style={{ opacity: clamp01(place.pinK * 2), transform: `translateY(${(1 - BACK(place.pinK)) * -50}px)`, paddingBottom: 4 }}>
                  <Pin size={44} color={INK} />
                </div>
                <div style={{ fontSize: 50, letterSpacing: TRACK.body, opacity: place.textK }}>{place.label}</div>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
};

/** A day leaf: flips down from its top edge. No red: the scene's red is the stamp, then the gate. */
const DayLeaf: React.FC<{ rect: Rect; k: number; month: string; day: string }> = ({ rect, k, month, day }) => {
  if (k <= 0) return null;
  const s = rect.w / 180;
  return (
    <div style={{ position: "absolute", left: rect.x, top: rect.y, width: rect.w, height: rect.h, perspective: 900 }}>
      <div style={{ width: "100%", height: "100%", borderRadius: 22 * s, overflow: "hidden", background: COLORS.paper, opacity: clamp01(k * 4), transformOrigin: "50% 0%", transform: `rotateX(${lerp(-88, 0, BACK(k))}deg)`,
        fontFamily: DISPLAY, fontWeight: 700, textAlign: "center", lineHeight: 1 }}>
        <div style={{ height: 58 * s, background: COLORS.ink, border: `${4 * s}px solid ${COLORS.paper}`, borderRadius: `${22 * s}px ${22 * s}px 0 0`, boxSizing: "border-box", display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.paper, fontSize: 36 * s, letterSpacing: TRACK.nav }}>
          {month}
        </div>
        <div style={{ height: rect.h - 58 * s, display: "flex", alignItems: "center", justifyContent: "center", color: COLORS.ink, fontSize: 116 * s, letterSpacing: TRACK.display }}>{day}</div>
      </div>
    </div>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// EightOne — the hook (red world)
// ══════════════════════════════════════════════════════════════════════════
export const EightOne: React.FC<Win & {
  figure: { text: string } & Cued; // "8" slams
  label: { text: string; word?: string }[]; // each label word on its own cue
  tiles: Cued; // the eight tiles deal out
  one: { text: string } & Cued; // the plate stamps with its count
  rest: { text: string; word?: string }[]; // the plate's other words
  tie: Cued; // the brace draws
}> = ({ from, to, figure, label, tiles, one, rest, tie }) => {
  const ms = useMs();
  const k = useK();
  const W = COLORS.paper;

  const tFig = at(figure, from, from);
  const tLabel = label.map((l, i) => at(l, tFig + 500 + i * 400, from, tFig + 200));
  const tTiles = at(tiles, tLabel[label.length - 1], from, tFig + 300);
  const tOne = at(one, tTiles + 800, from, tTiles + 500);
  const tRest = rest.map((r, i) => at(r, tOne + 450 * (i + 1), from, tOne + 150));
  const tTie = at(tie, tRest[rest.length - 1], from, tOne + 300);

  if (ms < tFig - 40 || ms > to) return null;

  const figO = k(tFig, 120);
  const figS = interpolate(ms, [tFig, tFig + 300], [1.2, 1], { ...CLAMP, easing: EASE });
  const oneO = k(tOne, 120);
  const oneS = interpolate(ms, [tOne, tOne + 280], [1.1, 1], { ...CLAMP, easing: EASE });
  // the brace: stem rises from the plate, then the bar runs out both ways, then the end ticks
  const stemK = EASE(k(tTie, 160));
  const barK = EASE(k(tTie + 140, 220));
  const tickK = EASE(k(tTie + 340, 120));
  const B = EIGHT.brace;
  const gx0 = EIGHT.grid.x;
  const gx1 = tileRect(3).x + EIGHT.grid.w;
  const half = (gx1 - gx0) / 2;

  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: EIGHT.fig.y, transform: `translateY(-50%) scale(${figS})`, opacity: figO, textAlign: "center",
        fontFamily: DISPLAY, fontWeight: 700, fontSize: EIGHT.fig.size, lineHeight: 0.9, letterSpacing: TRACK.display, color: W }}>
        {figure.text}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: EIGHT.label.top, textAlign: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: EIGHT.label.size, lineHeight: 1.1, letterSpacing: TRACK.headline, color: W, whiteSpace: "nowrap" }}>
        {label.map((l, i) => {
          const q = k(tLabel[i], 140);
          return <span key={i} style={{ display: "inline-block", marginRight: i < label.length - 1 ? "0.26em" : 0, opacity: q, transform: `translateY(${(1 - q) * 16}px)` }}>{l.text}</span>;
        })}
      </div>

      {/* eight blank tiles: one cascade, then still */}
      {Array.from({ length: 8 }, (_, i) => {
        const r = tileRect(i);
        const q = k(tTiles + i * 60, 220);
        if (q <= 0) return null;
        return <div key={i} style={{ position: "absolute", left: r.x, top: r.y, width: r.w, height: r.h, borderRadius: 22, background: W, opacity: clamp01(q * 3), transform: `scale(${lerp(0.7, 1, BACK(q))})` }} />;
      })}

      {/* the brace: all eight, one plate */}
      {stemK > 0 ? <div style={{ position: "absolute", left: 540 - 3, top: lerp(COURT.hook.y, B.bar, stemK), width: 6, height: (COURT.hook.y - B.bar) * stemK, background: W }} /> : null}
      {barK > 0 ? <div style={{ position: "absolute", left: 540 - half * barK, top: B.bar - 3, width: half * 2 * barK, height: 6, background: W }} /> : null}
      {tickK > 0
        ? [gx0, gx1 - 6].map((x) => <div key={x} style={{ position: "absolute", left: x, top: lerp(B.bar, B.tick, tickK), width: 6, height: (B.bar - B.tick) * tickK, background: W }} />)
        : null}

      {oneO > 0 ? (
        <CourtPlate rect={COURT.hook} hook={{ count: one.text, rest: rest.map((r) => r.text) }} words={[1, ...tRest.map((t) => k(t, 140))]} opacity={oneO} scale={oneS} />
      ) : null}
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// RulingGate — the ruling, then what the patent does (ink world, over a FootageScrim)
// ══════════════════════════════════════════════════════════════════════════
export const RULING = {
  loser: { x: 340, y: 450, w: 400, h: 124 },
  stampY: 687,
  card: { x: 140, y: 800, w: 800, h: 360 },
  tag: { x: 100, y: 870, w: 300, h: 110 },
  skinY: 1010,
  skinX: [110, 970] as [number, number],
  gate: [400, 680] as [number, number],
  cargo: { x: 540, y0: 700, y1: 1160, w: 260, h: 250 },
};

/** A large biologic, as a line-art antibody. */
export const Biologic: React.FC<{ color: string; w?: number }> = ({ color, w = RULING.cargo.w }) => (
  <svg width={w} height={(w * 250) / 260} viewBox="0 0 260 250" style={{ display: "block" }}>
    <g stroke={color} strokeWidth={26} strokeLinecap="round" fill="none">
      <line x1={130} y1={236} x2={130} y2={130} />
      <line x1={130} y1={130} x2={50} y2={30} />
      <line x1={130} y1={130} x2={210} y2={30} />
      <line x1={59} y1={105} x2={19} y2={55} />
      <line x1={201} y1={105} x2={241} y2={55} />
    </g>
  </svg>
);

export const RulingGate: React.FC<Win & {
  hook: { count: string; rest: string[] }; // the plate as the hook left it
  rise: Cued; // the plate rises to the middle ("On October")
  date: { month: string; day: string } & Cued; // the day leaf flips
  court: { name: string } & Cued; // the plate's text rolls to the court
  place: { label: string } & Cued; // the pin drops
  ruled: Cued; // court + date dock as the header
  loser: { name: string } & Cued;
  verdict: { label: string } & Cued; // the red stamp across the link
  owner: { name: string } & Cued; // the patent's card
  patent: { label: string } & Cued;
  retire: Cued; // the ruling retires, the card becomes the gate's tag
  tag: string[]; // the tag's lines
  skin: { label: string } & Cued; // the skin line draws, the gate in it
  cargo: { label: string } & Cued; // the biologic appears above the line
  cargoLabel: Cued;
  open: Cued; // the gate opens
  pass: Cued; // the biologic starts down
  land: Cued; // ...and is under the skin by this word
  lines: { text: string; emphasize?: string }[]; // exactly three
}> = ({ from, to, hook, rise, date, court, place, ruled, loser, verdict, owner, patent, retire, tag, skin, cargo, cargoLabel, open, pass, land, lines }) => {
  const ms = useMs();
  const k = useK();
  const W = COLORS.paper;
  const R = COLORS.accent;
  const G = RULING;

  const tRise = at(rise, from + 550, from);
  const tDate = at(date, tRise + 600, from, tRise + 420);
  const tCourt = at(court, tDate + 600, from, tDate + 300);
  const tPlace = at(place, tCourt + 1200, from, tCourt + 300);
  const tRuled = at(ruled, tPlace + 700, from, tPlace + 400);
  const tLoser = at(loser, tRuled + 800, from, tRuled + 500);
  const tVerdict = at(verdict, tLoser + 400, from, tLoser + 300);
  const tOwner = at(owner, tVerdict + 450, from, tVerdict + 300);
  const tPatent = at(patent, tOwner + 550, from, tOwner + 250);
  const tRetire = at(retire, tPatent + 1200, from, tPatent + 500);
  const tSkin = at(skin, tRetire + 420, from, tRetire + 380);
  const tCargo = at(cargo, tSkin + 200, from, tSkin + 180);
  const tCargoLabel = at(cargoLabel, tCargo + 360, from, tCargo + 250);
  const tOpen = at(open, tCargoLabel + 700, from, tCargoLabel + 300);
  const tPass = at(pass, tOpen + 200, from, tOpen + 180);
  const tLand = at(land, tPass + 600, from, tPass + 400);

  if (ms > to) return null;

  // the plate and the leaf: hook seat → middle → header
  const riseK = EASE_IO(k(tRise, 420));
  const dockK = EASE_IO(k(tRuled, 420));
  const plate = dockK > 0 ? mix(COURT.big, COURT.head, dockK) : mix(COURT.hook, COURT.big, riseK);
  const leaf = mix(COURT.leafBig, COURT.leafHead, dockK);

  // the ruling
  const aO = 1 - k(tRetire, 250);
  const stemK = EASE(k(tRuled + 440, 240));
  const loserO = k(tLoser, 120);
  const loserS = interpolate(ms, [tLoser, tLoser + 280], [1.16, 1], { ...CLAMP, easing: EASE });
  const linkK = EASE(k(tLoser + 150, 230));
  const stampO = k(tVerdict, 100);
  const stampS = interpolate(ms, [tVerdict, tVerdict + 260], [1.7, 1], { ...CLAMP, easing: EASE });
  const cardO = k(tOwner, 120);
  const cardS = interpolate(ms, [tOwner, tOwner + 300], [1.06, 1], { ...CLAMP, easing: EASE });
  const patentK = EASE(k(tPatent, 320));
  const headBot = COURT.head.y + COURT.head.h;
  const loserBot = G.loser.y + G.loser.h;

  // the card → the gate's tag
  const tagK = EASE_IO(k(tRetire, 360));
  const card = mix(G.card, G.tag, tagK);
  const bigO = 1 - clamp01(tagK * 2.2);
  const tagO = clamp01((tagK - 0.55) / 0.45);

  // the skin line, the gate, the biologic
  const skinK = EASE(k(tSkin, 180));
  const [sx0, sx1] = G.skinX;
  const [gx0, gx1] = G.gate;
  const gmid = (gx0 + gx1) / 2;
  const leafW = (gx1 - gx0) / 2;
  const drawn = sx0 + (sx1 - sx0) * skinK;
  const gateO = clamp01((drawn - gx0) / (gx1 - gx0));
  const openK = EASE_IO(k(tOpen, 180));
  const cargoO = k(tCargo, 120);
  const cargoS = lerp(0.6, 1, BACK(k(tCargo, 360)));
  const cargoY = lerp(G.cargo.y0, G.cargo.y1, EASE_IO(k(tPass, Math.max(300, tLand - tPass))));
  const labelO = k(tCargoLabel, 160) * (1 - k(tOpen, 200));

  return (
    <AbsoluteFill>
      {/* the ruling: stem, loser, link, stamp. Retires after the pause. */}
      {aO > 0 ? (
        <AbsoluteFill style={{ opacity: aO }}>
          {stemK > 0 ? <div style={{ position: "absolute", left: 540 - 3, top: headBot, width: 6, height: (G.loser.y - headBot) * stemK, background: W }} /> : null}
          {linkK > 0 ? <div style={{ position: "absolute", left: 540 - 3, top: loserBot, width: 6, height: (G.card.y - loserBot) * linkK, background: W }} /> : null}
          <div style={{ position: "absolute", left: G.loser.x, top: G.loser.y, width: G.loser.w, height: G.loser.h, borderRadius: 24, background: W, opacity: loserO, transform: `scale(${loserS})`,
            display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: 76, letterSpacing: TRACK.headline, color: COLORS.ink }}>
            {loser.name}
          </div>
          {stampO > 0 ? (
            <div style={{ position: "absolute", left: 540 - 200, top: G.stampY - 50, width: 400, height: 100, borderRadius: 18, background: R, opacity: stampO, transform: `rotate(-7deg) scale(${stampS})`,
              display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: 64, letterSpacing: TRACK.headline, color: W }}>
              {verdict.label}
            </div>
          ) : null}
        </AbsoluteFill>
      ) : null}

      {/* the patent: a card, then the tag of the gate */}
      {cardO > 0 ? (
        <div style={{ position: "absolute", left: card.x, top: card.y, width: card.w, height: card.h, boxSizing: "border-box", borderRadius: lerp(30, 18, tagK), overflow: "hidden", background: "rgba(0,0,0,0.78)", border: `${lerp(4, 3, tagK)}px solid ${W}`,
          opacity: cardO, transform: `scale(${cardS})` }}>
          {bigO > 0 ? (
            <div style={{ position: "absolute", inset: 0, opacity: bigO, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontWeight: 700, color: W, lineHeight: 1.05, whiteSpace: "nowrap" }}>
              <div style={{ fontSize: 116, letterSpacing: TRACK.display }}>{owner.name}</div>
              <div style={{ fontSize: 74, letterSpacing: TRACK.headline, fontWeight: 400, clipPath: `inset(-10% ${(1 - patentK) * 100}% -10% 0)` }}>{patent.label}</div>
            </div>
          ) : null}
          {tagO > 0 ? (
            <>
              <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 12, background: R, opacity: tagO }} />
              <div style={{ position: "absolute", left: 30, right: 8, top: 0, bottom: 0, opacity: tagO, display: "flex", flexDirection: "column", justifyContent: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: TYPE.labelSm, letterSpacing: TRACK.nav, color: W, lineHeight: 1.15, whiteSpace: "nowrap" }}>
                {tag.map((t) => <div key={t}>{t}</div>)}
              </div>
            </>
          ) : null}
        </div>
      ) : null}

      {/* the skin line, with the gate in it */}
      {skinK > 0 ? (
        <>
          {/* the line is two segments, so the opening shows the footage and not a patch */}
          <div style={{ position: "absolute", left: sx0, top: G.skinY - 4, width: Math.max(0, Math.min(drawn, gmid - leafW * openK) - sx0), height: 8, borderRadius: 4, background: W }} />
          {drawn > gmid + leafW * openK ? <div style={{ position: "absolute", left: gmid + leafW * openK, top: G.skinY - 4, width: drawn - (gmid + leafW * openK), height: 8, borderRadius: 4, background: W }} /> : null}
          <div style={{ position: "absolute", left: gx0 - leafW * openK, top: G.skinY - 13, width: leafW, height: 26, borderRadius: 6, background: R, opacity: gateO }} />
          <div style={{ position: "absolute", left: gmid + leafW * openK, top: G.skinY - 13, width: leafW, height: 26, borderRadius: 6, background: R, opacity: gateO }} />
          <div style={{ position: "absolute", right: 1080 - sx1, top: G.skinY - 60, fontFamily: DISPLAY, fontWeight: 700, fontSize: TYPE.labelSm, letterSpacing: TRACK.nav, color: INK_SUB, opacity: k(tSkin + 180, 160) }}>{skin.label}</div>
        </>
      ) : null}

      {/* the biologic */}
      {cargoO > 0 ? (
        <>
          <div style={{ position: "absolute", left: 0, right: 0, top: G.cargo.y0 - G.cargo.h / 2 - 70, textAlign: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: TYPE.labelSm, letterSpacing: TRACK.nav, color: INK_SUB, opacity: labelO }}>{cargo.label}</div>
          <div style={{ position: "absolute", left: G.cargo.x - G.cargo.w / 2, top: cargoY - G.cargo.h / 2, opacity: cargoO, transform: `scale(${cargoS})` }}>
            <Biologic color={W} />
          </div>
        </>
      ) : null}

      {/* the court: revealed on its hook seat by the wipe */}
      <DayLeaf rect={leaf} k={k(tDate, 380)} month={date.month} day={date.day} />
      <CourtPlate rect={plate} hook={hook} words={[]} court={court.name} roll={EASE_IO(k(tCourt, 260))}
        place={{ label: place.label, pinK: k(tPlace, 360), textK: k(tPlace + 60, 140) }} />

      <Phrase from={tRise} to={tRuled - 80} line={lines[0].text} top={COURT.lineTop} size={60} color={W} emphasize={lines[0].emphasize} empColor={W} restColor={INK_SUB} />
      <Phrase from={tRuled} to={tRetire - 150} line={lines[1].text} top={COURT.lineTop} size={60} color={W} emphasize={lines[1].emphasize} empColor={W} restColor={INK_SUB} />
      <Phrase from={tRetire} to={to + 400} line={lines[2].text} top={COURT.lineTop} size={60} color={W} emphasize={lines[2].emphasize} empColor={W} restColor={INK_SUB} />
    </AbsoluteFill>
  );
};
