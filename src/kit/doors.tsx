// ─────────────────────────────────────────────────────────────────────────
// KIT · doors — ONE KEY, MANY DOORS. The spine of the argenx Phase 3 UNITY
// long-form, 2026-10-10 (VERTICAL). A mechanism is a `Key`; a disease is a
// `Door`. Built under the one-mover rule (09-30) and the frame budget (10-05).
//
// `LaneKeyDoors` (ink): "This matters because Sjögren's was a modeled
// expansion lane for Vyvgart Hytrulo. The FcRn thesis is that one mechanism
// carries across autoimmune disease. Myasthenia proved it. ITP proved it.
// Sjögren's did not." A dashed tile for the disease (dashed = modeled, never
// realised), a dashed lane drawn down to it, and the product stamped at the
// lane's head. The lane retires; the key appears alone, rises to a row, and
// three blank doors deal out under it. The key travels to each door as its
// disease is named: two open, and a red bar slams across the third.
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

/**
 * A key, positioned by its CENTRE. Drawn bow-left / teeth-down in a 360×200 box and
 * rotated; `rot` 90 points it down. `teeth` (three drops, px) is the key's identity:
 * a different mechanism is a different cut. The label sits upright inside the bow.
 */
export const Key: React.FC<{
  cx: number;
  cy: number;
  scale?: number;
  rot?: number;
  teeth: [number, number, number];
  bow?: "ring" | "square";
  label?: string;
  labelSize?: number; // a five-glyph name needs the second label step to fit the bow
  color: string;
  opacity?: number;
}> = ({ cx, cy, scale = 1, rot = 90, teeth, bow = "ring", label, labelSize = TYPE.label, color, opacity = 1 }) => {
  if (opacity <= 0) return null;
  const a = (rot * Math.PI) / 180;
  // the bow's centre is (-85, -4) from the box centre before rotation
  const bx = (-85 * Math.cos(a) - -4 * Math.sin(a)) * scale;
  const by = (-85 * Math.sin(a) + -4 * Math.cos(a)) * scale;
  return (
    <>
      <svg width={360} height={200} viewBox="0 0 360 200" style={{ position: "absolute", left: cx - 180, top: cy - 100, opacity, transform: `rotate(${rot}deg) scale(${scale})`, overflow: "visible" }}>
        {bow === "ring" ? (
          <circle cx={95} cy={96} r={70} fill="none" stroke={color} strokeWidth={26} />
        ) : (
          <rect x={25} y={26} width={140} height={140} rx={24} fill="none" stroke={color} strokeWidth={26} />
        )}
        <rect x={163} y={83} width={190} height={26} rx={6} fill={color} />
        {teeth.map((t, i) => (
          <rect key={i} x={236 + i * 45} y={96} width={26} height={13 + t} rx={5} fill={color} />
        ))}
      </svg>
      {label ? (
        <div style={{ position: "absolute", left: cx + bx - 100 * scale, top: cy + by - 30 * scale, width: 200 * scale, height: 60 * scale, opacity, display: "flex", alignItems: "center", justifyContent: "center",
          fontFamily: DISPLAY, fontWeight: 700, fontSize: labelSize * scale, letterSpacing: TRACK.nav, color, whiteSpace: "nowrap", lineHeight: 1 }}>
          {label}
        </div>
      ) : null}
    </>
  );
};

/**
 * A door: a frame and a solid leaf hinged on the left. `open` 0→1 swings the leaf
 * away; `bar` 0→1 slams a bar across it (it stays shut).
 */
export const Door: React.FC<{
  rect: Rect;
  k: number; // entrance
  open?: number;
  bar?: { k: number; label: string; color: string; text: string };
  color: string;
  knob: string;
  name?: { text: string; o: number };
}> = ({ rect, k, open = 0, bar, color, knob, name }) => {
  if (k <= 0) return null;
  const leafW = rect.w * (1 - 0.8 * open);
  return (
    <>
      <div style={{ position: "absolute", left: rect.x, top: rect.y, width: rect.w, height: rect.h, opacity: clamp01(k * 3), transform: `scale(${lerp(0.7, 1, BACK(k))})` }}>
        <div style={{ position: "absolute", inset: 0, boxSizing: "border-box", border: `7px solid ${color}`, borderRadius: "16px 16px 0 0" }} />
        <div style={{ position: "absolute", left: 0, top: 0, width: leafW, height: rect.h, background: color, borderRadius: "16px 16px 0 0", transformOrigin: "0% 50%", transform: `skewY(${-7 * open}deg)` }}>
          <div style={{ position: "absolute", right: Math.min(30, leafW * 0.3), top: rect.h * 0.52, width: 26, height: 26, borderRadius: 13, background: knob, opacity: 1 - open }} />
        </div>
      </div>
      {bar && bar.k > 0 ? (
        <div style={{ position: "absolute", left: rect.x - 24, top: rect.y + rect.h / 2 - 34, width: rect.w + 48, height: 68, borderRadius: 12, background: bar.color, transform: `scaleX(${bar.k})`,
          display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: TYPE.label, letterSpacing: TRACK.nav, color: bar.text, whiteSpace: "nowrap", lineHeight: 1 }}>
          {bar.label}
        </div>
      ) : null}
      {name ? (
        <div style={{ position: "absolute", left: rect.x - 40, width: rect.w + 80, top: rect.y + rect.h + 26, textAlign: "center", opacity: name.o, fontFamily: DISPLAY, fontWeight: 700, fontSize: TYPE.label, letterSpacing: TRACK.nav, color, whiteSpace: "nowrap", lineHeight: 1 }}>
          {name.text}
        </div>
      ) : null}
    </>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// LaneKeyDoors — the lane, then the thesis as a key and three doors (ink world)
// ══════════════════════════════════════════════════════════════════════════
export const DOORS = {
  source: { x: 140, y: 420, w: 800, h: 290 },
  dest: { x: 240, y: 1190, w: 600, h: 190 },
  laneX: [470, 610] as [number, number],
  laneLabel: { x: 650, y: 900 },
  leadTop: 800,
  keyBig: { cx: 540, cy: 800, scale: 1.9 },
  keyRow: 430,
  door: { y: 690, w: 260, h: 520, xs: [70, 410, 750] },
  lineTop: 1400,
};
export const doorRect = (i: number): Rect => ({ x: DOORS.door.xs[i], y: DOORS.door.y, w: DOORS.door.w, h: DOORS.door.h });
/** FcRn's cut. Reused wherever the same mechanism is drawn. */
export const FCRN_TEETH: [number, number, number] = [50, 26, 62];

export const LaneKeyDoors: React.FC<Win & {
  lead: { text: string; to: number }; // the lead-in line, alone, until the tile lands
  dest: { name: string } & Cued; // the disease, as a dashed tile
  lane: Cued; // the dashed lane draws down to it
  laneLabel: { lines: [string, string] } & Cued;
  source: { name: string } & Cued; // the product stamps at the lane's head
  source2: { name: string } & Cued;
  retire: Cued; // the lane retires
  mech: { label: string } & Cued; // the key, alone
  rise: Cued; // the key rises to its row
  deal: Cued; // three blank doors
  doors: { name: string; arrive: Cued; act: Cued }[]; // exactly three; the last is barred
  barLabel: string;
  lines: { text: string; emphasize?: string }[]; // exactly two
}> = ({ from, to, lead, dest, lane, laneLabel, source, source2, retire, mech, rise, deal, doors, barLabel, lines }) => {
  const ms = useMs();
  const k = useK();
  const W = COLORS.paper;
  const INK = COLORS.ink;
  const D = DOORS;

  const tDest = at(dest, from + 1500, from);
  const tLane = at(lane, tDest + 900, from, tDest + 300);
  const tLaneLabel = at(laneLabel, tLane + 500, from, tLane + 200);
  const tSource = at(source, tLaneLabel + 1200, from, tLaneLabel + 400);
  const tSource2 = at(source2, tSource + 350, from, tSource + 150);
  const tRetire = at(retire, tSource2 + 600, from, tSource2 + 400);
  const tMech = at(mech, tRetire + 400, from, tRetire + 250);
  const tRise = at(rise, tMech + 1300, from, tMech + 600);
  const tDeal = at(deal, tRise + 850, from, tRise + 450);
  const tArrive: number[] = [];
  const tAct: number[] = [];
  doors.forEach((d, i) => {
    tArrive.push(at(d.arrive, (i ? tAct[i - 1] : tDeal) + 900, from, (i ? tAct[i - 1] : tDeal) + 400));
    tAct.push(at(d.act, tArrive[i] + 750, from, tArrive[i] + 400));
  });

  if (ms > to) return null;

  // ── the lane ──
  const aO = 1 - k(tRetire, 230);
  const destO = k(tDest, 120);
  const destS = interpolate(ms, [tDest, tDest + 280], [1.08, 1], { ...CLAMP, easing: EASE });
  const laneK = clamp01(interpolate(ms, [tLane, Math.max(tLane + 600, tSource - 250)], [0, 1], CLAMP));
  const srcO = k(tSource, 120);
  const srcS = interpolate(ms, [tSource, tSource + 280], [1.1, 1], { ...CLAMP, easing: EASE });
  const laneTop = D.source.y + D.source.h;
  const laneH = (D.dest.y - laneTop) * laneK;

  // ── the key ──
  const keyO = k(tMech, 140);
  const riseK = EASE_IO(k(tRise, 420));
  const xs = [540, ...doors.map((_, i) => doorRect(i).x + D.door.w / 2)];
  let keyX = xs[0];
  tArrive.forEach((t, i) => { keyX = lerp(keyX, xs[i + 1], EASE_IO(k(t, 380))); });
  const keyS = lerp(D.keyBig.scale, 1, riseK) * (riseK > 0 ? 1 : lerp(0.7, 1, BACK(k(tMech, 360))));
  const keyY = lerp(D.keyBig.cy, D.keyRow, riseK);

  const last = doors.length - 1;

  return (
    <AbsoluteFill>
      <Phrase from={from + 420} to={lead.to} line={lead.text} top={D.leadTop} size={104} color={W} />

      {aO > 0 ? (
        <AbsoluteFill style={{ opacity: aO }}>
          {/* the lane: dashed, because it was modeled and never run */}
          {laneK > 0
            ? D.laneX.map((x) => (
                <svg key={x} width={10} height={D.dest.y - laneTop} style={{ position: "absolute", left: x - 5, top: laneTop, clipPath: `inset(0 0 ${(1 - laneK) * 100}% 0)` }}>
                  <line x1={5} y1={0} x2={5} y2={D.dest.y - laneTop} stroke={W} strokeWidth={8} strokeDasharray="30 20" />
                </svg>
              ))
            : null}
          {laneH > 0 ? <div style={{ position: "absolute", left: D.laneX[0] + 5, top: laneTop, width: D.laneX[1] - D.laneX[0] - 10, height: laneH, background: "rgba(255,255,255,0.1)" }} /> : null}
          <div style={{ position: "absolute", left: D.laneLabel.x, top: D.laneLabel.y, fontFamily: DISPLAY, fontWeight: 700, fontSize: TYPE.label, letterSpacing: TRACK.nav, lineHeight: 1.18, whiteSpace: "nowrap" }}>
            <div style={{ color: W, opacity: k(tLane, 150) }}>{laneLabel.lines[0]}</div>
            <div style={{ color: INK_SUB, opacity: k(tLaneLabel, 150) }}>{laneLabel.lines[1]}</div>
          </div>

          <div style={{ position: "absolute", left: D.dest.x, top: D.dest.y, width: D.dest.w, height: D.dest.h, boxSizing: "border-box", borderRadius: 28, border: `6px dashed ${W}`, opacity: destO, transform: `scale(${destS})`,
            display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: 96, letterSpacing: TRACK.display, color: W, whiteSpace: "nowrap", lineHeight: 1 }}>
            {dest.name}
          </div>

          {srcO > 0 ? (
            <div style={{ position: "absolute", left: D.source.x, top: D.source.y, width: D.source.w, height: D.source.h, borderRadius: 30, background: W, opacity: srcO, transform: `scale(${srcS})`,
              display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: 116, letterSpacing: TRACK.display, color: INK, whiteSpace: "nowrap", lineHeight: 1.04 }}>
              <div>{source.name}</div>
              <div style={{ opacity: k(tSource2, 140) }}>{source2.name}</div>
            </div>
          ) : null}
        </AbsoluteFill>
      ) : null}

      {/* three doors: blank until the key arrives */}
      {doors.map((d, i) => (
        <Door
          key={i}
          rect={doorRect(i)}
          k={k(tDeal + i * 90, 260)}
          open={i < last ? EASE_IO(k(tAct[i], 320)) : 0}
          bar={i === last ? { k: EASE(k(tAct[i], 140)), label: barLabel, color: COLORS.accent, text: W } : undefined}
          color={W}
          knob={INK}
          name={{ text: d.name, o: k(tArrive[i] + 200, 150) }}
        />
      ))}

      <Key cx={keyX} cy={keyY} scale={keyS} teeth={FCRN_TEETH} label={mech.label} color={W} opacity={keyO} />

      <Phrase from={tMech - 120} to={tArrive[0] - 120} line={lines[0].text} top={D.lineTop} size={62} color={W} emphasize={lines[0].emphasize} empColor={W} restColor={INK_SUB} />
      <Phrase from={tArrive[0]} to={to + 400} line={lines[1].text} top={D.lineTop} size={62} color={W} emphasize={lines[1].emphasize} empColor={W} restColor={INK_SUB} />
    </AbsoluteFill>
  );
};
