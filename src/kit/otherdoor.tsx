// ─────────────────────────────────────────────────────────────────────────
// KIT · otherdoor — THE SPINE RETURNS TWICE. Added on the argenx Phase 3 UNITY
// long-form, 2026-10-10 (VERTICAL). One mover per cue; a finished idea retires.
//
// `OtherDoor` (red): "Same day, argenx hit its Phase 2 celiac endpoint on
// FB102… a different mechanism, a different pathway. One door closed. One
// opened." The hook's header comes back (same leaf, same name) over the §2
// chart, and this time the column reaches the line. It retires; the FcRn key
// returns, a differently cut key stamps beside it, two blank doors deal out
// under them, an ink bar slams across the first and the second swings open.
//
// `ReadLock` (ink): "The read: FcRn works where the biology lines up. Not
// everywhere." The key lies flat; a lock's pins appear under its teeth and
// rise to meet every one. On "Not everywhere" a second lock is shown under the
// same key: its too-tall pins stop it short (the scene's red).
//
// Every onset is a spoken word with an optional ms pin, clamped monotonic.
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { CLAMP, COLORS, DISPLAY, INK_SUB, INK_SUB_ON_RED, TRACK, useMs } from "./core";
import { TYPE } from "../style";
import { at, lerp, Phrase, useK, type Cued, type Win } from "./elora";
import { DayLeaf, EndpointChart, MISS, STOP } from "./unity";
import { Door, FCRN_TEETH, Key } from "./doors";

const EASE = Easing.out(Easing.cubic);
const EASE_IO = Easing.inOut(Easing.cubic);
const BACK = Easing.out(Easing.back(1.6));

// ══════════════════════════════════════════════════════════════════════════
// OtherDoor — the same day, a different key (red world)
// ══════════════════════════════════════════════════════════════════════════
export const OTHER = {
  keyRow: 430,
  door: { y: 690, w: 300, h: 520, xs: [150, 630] },
  lineTop: 1400,
};
/** FB102's cut: a different mechanism. */
export const OTHER_TEETH: [number, number, number] = [24, 60, 36];

export const OtherDoor: React.FC<Win & {
  day: { month: string; day: string } & Cued; // the hook's leaf, back on its seat
  name: { text: string } & Cued;
  hit: Cued; // the endpoint draws and the column reaches it
  phase: { label: string } & Cued;
  disease: { label: string } & Cued;
  drug: { label: string } & Cued;
  retire: Cued; // the chart retires
  oldKey: { label: string } & Cued; // the first mechanism returns
  newKey: { label: string } & Cued; // a different cut stamps beside it
  deal: Cued; // two blank doors
  shut: { name: string; label: string } & Cued; // a bar across the first
  open: { name: string } & Cued; // the second swings open
  lines: { text: string; emphasize?: string }[]; // exactly two
}> = ({ from, to, day, name, hit, phase, disease, drug, retire, oldKey, newKey, deal, shut, open, lines }) => {
  const ms = useMs();
  const k = useK();
  const W = COLORS.paper;
  const INK = COLORS.ink;
  const O = OTHER;

  const tDay = at(day, from + 500, from);
  const tName = at(name, tDay + 900, from, tDay + 400);
  const tHit = at(hit, tName + 420, from, tName + 250);
  const tPhase = at(phase, tHit + 500, from, tHit + 300);
  const tDisease = at(disease, tPhase + 560, from, tPhase + 200);
  const tDrug = at(drug, tDisease + 1300, from, tDisease + 300);
  const tRetire = at(retire, tDrug + 1200, from, tDrug + 600);
  const tOld = at(oldKey, tRetire + 330, from, tRetire + 250);
  const tNew = at(newKey, tOld + 650, from, tOld + 300);
  const tDeal = at(deal, tNew + 680, from, tNew + 350);
  const tShut = at(shut, tDeal + 1900, from, tDeal + 600);
  const tOpen = at(open, tShut + 1100, from, tShut + 400);

  if (ms < tDay - 40 || ms > to) return null;

  const aO = 1 - k(tRetire, 230);
  const nameO = k(tName, 140);
  const rect = (i: number) => ({ x: O.door.xs[i], y: O.door.y, w: O.door.w, h: O.door.h });
  const cx = (i: number) => O.door.xs[i] + O.door.w / 2;
  const keyK = (t: number) => ({ opacity: k(t, 140), scale: lerp(0.7, 1, BACK(k(t, 360))) });

  return (
    <AbsoluteFill>
      {aO > 0 ? (
        <AbsoluteFill style={{ opacity: aO }}>
          <DayLeaf rect={STOP.leafHead} k={k(tDay, 380)} month={day.month} day={day.day} />
          <div style={{ position: "absolute", left: STOP.name.x, top: STOP.name.top + 22, opacity: nameO, transform: `translateX(${(1 - nameO) * 24}px)`, fontFamily: DISPLAY, fontWeight: 700, fontSize: STOP.name.size, lineHeight: 1, letterSpacing: TRACK.display, color: W, whiteSpace: "nowrap" }}>
            {name.text}
          </div>
          <EndpointChart
            baseK={EASE(k(tHit, 110))}
            lineK={EASE(k(tHit, 220))}
            riseK={EASE(k(tHit + 150, 360))}
            top={MISS.lineY}
            lineColor={INK}
            color={W}
            sub={INK_SUB_ON_RED}
            labels={{
              left: { text: phase.label, o: k(tPhase, 150) },
              right: { text: disease.label, o: k(tDisease, 150) },
              foot: { text: drug.label, o: k(tDrug, 150) },
            }}
          />
        </AbsoluteFill>
      ) : null}

      {/* two doors, blank until each is acted on */}
      <Door rect={rect(0)} k={k(tDeal, 260)} bar={{ k: EASE(k(tShut, 140)), label: shut.label, color: INK, text: W }} color={W} knob={INK} name={{ text: shut.name, o: k(tShut + 120, 150) }} />
      <Door rect={rect(1)} k={k(tDeal + 90, 260)} open={EASE_IO(k(tOpen, 320))} color={W} knob={INK} name={{ text: open.name, o: k(tOpen + 120, 150) }} />

      <Key cx={cx(0)} cy={O.keyRow} teeth={FCRN_TEETH} label={oldKey.label} color={W} {...keyK(tOld)} />
      <Key cx={cx(1)} cy={O.keyRow} teeth={OTHER_TEETH} bow="square" label={newKey.label} labelSize={TYPE.labelSm} color={W} {...keyK(tNew)} />

      <Phrase from={tOld} to={tShut - 450} line={lines[0].text} top={O.lineTop} size={62} color={W} emphasize={lines[0].emphasize} empColor={W} restColor={INK_SUB_ON_RED} />
      <Phrase from={tShut - 450} to={to + 400} line={lines[1].text} top={O.lineTop} size={76} color={W} emphasize={lines[1].emphasize} empColor={W} restColor={INK_SUB_ON_RED} />
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// ReadLock — the key meets a lock that lines up, and one that does not (ink world)
// ══════════════════════════════════════════════════════════════════════════
export const LOCK = {
  titleTop: 215,
  s: 1.5, // the key's scale
  cx: 540,
  rows: [600, 1020], // key centres
  reach: 90, // box px from the shaft to a pin's base
  lineTop: 1400,
};

/** A lock's pins under a flat key. `lift` is how far (px) the lock still has to rise. */
const Pins: React.FC<{ cy: number; pins: number[]; lift: number; opacity: number; color: string; hot?: boolean[]; hotColor?: string }> = ({ cy, pins, lift, opacity, color, hot, hotColor }) => {
  if (opacity <= 0) return null;
  const { s, cx, reach } = LOCK;
  const baseY = cy + (9 + reach) * s + lift;
  return (
    <div style={{ opacity }}>
      <div style={{ position: "absolute", left: cx + 30 * s, top: baseY, width: 168 * s, height: 46 * s, borderRadius: 10, background: color }} />
      {pins.map((p, i) => (
        <div key={i} style={{ position: "absolute", left: cx + (56 + i * 45) * s, top: baseY - p * s, width: 26 * s, height: p * s + 8, borderRadius: "7px 7px 0 0", background: hot?.[i] ? hotColor : color }} />
      ))}
    </div>
  );
};

export const ReadLock: React.FC<Win & {
  title: { text: string } & Cued;
  mech: { label: string } & Cued; // the key, flat
  lock: Cued; // the lock's pins appear under the teeth
  mesh: Cued; // ...and rise to meet every one
  miss: Cued; // a second lock, under the same key, stops short
  otherPins: [number, number, number]; // the second lock was cut for these teeth
  lines: { text: string; emphasize?: string }[]; // exactly two
}> = ({ from, to, title, mech, lock, mesh, miss, otherPins, lines }) => {
  const ms = useMs();
  const k = useK();
  const W = COLORS.paper;
  const L = LOCK;

  const tTitle = at(title, from + 400, from);
  const tMech = at(mech, tTitle + 900, from, tTitle + 400);
  const tLock = at(lock, tMech + 1400, from, tMech + 500);
  const tMesh = at(mesh, tLock + 450, from, tLock + 250);
  const tMiss = at(miss, tMesh + 1000, from, tMesh + 500);

  if (ms < tTitle - 40 || ms > to) return null;

  const titleO = k(tTitle, 120);
  const titleS = interpolate(ms, [tTitle, tTitle + 280], [1.1, 1], { ...CLAMP, easing: EASE });
  const fit = FCRN_TEETH.map((t) => L.reach - t);
  // the second lock: it rises until its tallest wrong pin meets a tooth
  const wrong = otherPins.map((t) => L.reach - t);
  const over = wrong.map((p, i) => p - fit[i]);
  const stop = Math.max(...over);
  const missK = EASE(k(tMiss, 320));

  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: L.titleTop, textAlign: "center", opacity: titleO, transform: `scale(${titleS})`, fontFamily: DISPLAY, fontWeight: 700, fontSize: 136, lineHeight: 1, letterSpacing: TRACK.display, color: W, whiteSpace: "nowrap" }}>
        {title.text}
      </div>

      <Key cx={L.cx} cy={L.rows[0]} rot={0} scale={L.s * lerp(0.8, 1, BACK(k(tMech, 360)))} teeth={FCRN_TEETH} label={mech.label} color={W} opacity={k(tMech, 140)} />
      <Pins cy={L.rows[0]} pins={fit} lift={lerp(80, 0, EASE_IO(k(tMesh, 300)))} opacity={k(tLock, 160)} color={W} />

      {/* the same key, a lock cut for something else */}
      <Key cx={L.cx} cy={L.rows[1]} rot={0} scale={L.s} teeth={FCRN_TEETH} label={mech.label} color={W} opacity={missK} />
      <Pins cy={L.rows[1]} pins={wrong} lift={stop * L.s + lerp(60, 0, missK)} opacity={missK} color={W} hot={over.map((o) => o === stop)} hotColor={COLORS.accent} />

      <Phrase from={tMech} to={tMiss - 150} line={lines[0].text} top={L.lineTop} size={62} color={W} emphasize={lines[0].emphasize} empColor={W} restColor={INK_SUB} />
      <Phrase from={tMiss - 150} to={to + 400} line={lines[1].text} top={L.lineTop} size={96} color={W} emphasize={lines[1].emphasize} empColor={W} restColor={INK_SUB} />
    </AbsoluteFill>
  );
};
