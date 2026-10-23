// ─────────────────────────────────────────────────────────────────────────
// KIT · chai — WHAT A LAB FOUND, AND WHAT IT DID NOT COUNT. Added on the
// GSK x Chai Discovery HORIZONTAL long-form, 2026-10-15 (16:9; absolute
// 1920x1080 coordinates, not portrait-safe as written). One mover per cue; a
// finished idea retires (the frame budget).
//
// The visual grammar of the piece: DASHED / hollow = not disclosed or not yet,
// SOLID = reported. The hook's announcements are dashed cards; the one lab
// result is a solid card whose number fields stay empty.
//
// `Molecule` — the designed-molecule glyph (six atoms, seven bonds); `dashed`
//   draws it hollow, `k` draws it in atom by atom.
// `ChaiHook` (red, the hook): a day leaf, "Chai Discovery × GSK" assembles and
//   docks in the pause; three DASHED announcement cards deal in, a hollow
//   molecule draws in each on "describe", and "Expected to do" stamps.
// `LabFound` (white card): ONE solid card with a solid molecule, the lab, a
//   red "Found." stamp; three number fields arrive and stay EMPTY on "numbers".
// `ChaiPlatform` (black, over the molecule scrim): Chai, San Francisco, a
//   molecule draws; the name travels into a platform box; GSK, an access arrow,
//   two modules, a pipeline rail; then the relationship as a bar, the red
//   "expansion" growing out of the work "already begun".
//
// Every onset is a spoken word with an optional ms pin, clamped monotonic
// (`at()` / `useK()` / `Cued` / `Win` come from ./elora).
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { CLAMP, clamp01, COLORS, DISPLAY, INK_SUB, inkA, INK_SUB_ON_RED, TRACK, useMs } from "./core";
import { at, lerp, useK, type Cued, type Win } from "./elora";
import { DayLeaf } from "./unity";

const EASE = Easing.out(Easing.cubic);
const EASE_IO = Easing.inOut(Easing.cubic);
const BACK = Easing.out(Easing.back(1.7));

const label = (color: string, size: number): React.CSSProperties => ({
  fontFamily: DISPLAY, fontWeight: 700, fontSize: size, letterSpacing: TRACK.kicker, color, whiteSpace: "nowrap", lineHeight: 1.1,
});
const big = (color: string, size: number): React.CSSProperties => ({
  fontFamily: DISPLAY, fontWeight: 700, fontSize: size, letterSpacing: TRACK.display, color, lineHeight: 1, whiteSpace: "nowrap",
});
/** stamp: lands from `from` scale to 1 with a fade, on progress q */
const stamp = (q: number, from = 1.35) => ({ opacity: clamp01(q * 3), transform: `scale(${lerp(from, 1, EASE(q))})` });

// ══════════════════════════════════════════════════════════════════════════
// Molecule — six atoms, seven bonds (a ring and a tail), in a 100x100 box
// ══════════════════════════════════════════════════════════════════════════
const ATOMS: [number, number][] = [[34, 30], [62, 22], [78, 46], [62, 70], [34, 62], [16, 84]];
const BONDS: [number, number][] = [[0, 1], [1, 2], [2, 3], [3, 4], [4, 0], [4, 5], [1, 3]];

export const Molecule: React.FC<{ cx: number; cy: number; size: number; color: string; k?: number; dashed?: boolean; opacity?: number }> = ({
  cx, cy, size, color, k = 1, dashed, opacity = 1,
}) => {
  if (k <= 0) return null;
  const s = size / 100;
  const sw = Math.max(3, 4.2 / s) ; // stroke in box units
  // atoms land one after another across k; a bond draws once both its atoms are in
  const atomQ = (i: number) => clamp01((k - i * 0.1) / 0.4);
  return (
    <svg style={{ position: "absolute", left: cx - size / 2, top: cy - size / 2, opacity }} width={size} height={size} viewBox="0 0 100 100">
      {BONDS.map(([a, b], i) => {
        const q = Math.min(atomQ(a), atomQ(b));
        if (q <= 0) return null;
        const [x1, y1] = ATOMS[a];
        const [x2, y2] = ATOMS[b];
        return <line key={i} x1={x1} y1={y1} x2={lerp(x1, x2, EASE(q))} y2={lerp(y1, y2, EASE(q))} stroke={color} strokeWidth={sw * 0.6} strokeLinecap="round" strokeDasharray={dashed ? `${sw * 0.9} ${sw * 0.9}` : undefined} />;
      })}
      {ATOMS.map(([x, y], i) => {
        const q = atomQ(i);
        if (q <= 0) return null;
        const r = (i === 5 ? 6.5 : 8.5) * BACK(q);
        return dashed ? (
          <circle key={i} cx={x} cy={y} r={Math.max(0, r)} fill="none" stroke={color} strokeWidth={sw * 0.55} strokeDasharray={`${sw * 0.8} ${sw * 0.7}`} />
        ) : (
          <circle key={i} cx={x} cy={y} r={Math.max(0, r)} fill={color} />
        );
      })}
    </svg>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// ChaiHook — the hook (red world)
// ══════════════════════════════════════════════════════════════════════════
export const HOOK = {
  leaf: { x: 885, y: 120, w: 150, h: 166 },
  row: { top: 360, size: 128, gap: 44, x: 96 }, // "Chai Discovery  ×  GSK", centred
  dock: { dy: -20, s: 0.5 }, // the leaf + row as one group (origin top-centre): leaf 40..123, row 160..224
  cards: { xs: [560, 960, 1360] as const, top: 300, w: 340, h: 440, mol: 170 },
  expected: { top: 800, size: 64 },
};

export const ChaiHook: React.FC<Win & {
  date: { month: string; day: string } & Cued;
  chai: { name: string } & Cued; // stamps
  cross: Cued; // the × draws on "collaboration"
  gsk: { name: string } & Cued; // stamps
  dock: Cued; // a pause: the lockup docks up
  cards: { label: string } & Cued; // three dashed announcement cards deal in
  describe: Cued; // a hollow molecule draws in each
  expected: { label: string } & Cued; // stamps under the cards
}> = ({ from, to, date, chai, cross, gsk, dock, cards, describe, expected }) => {
  const ms = useMs();
  const k = useK();
  const WH = COLORS.paper;
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));

  const tDate = at(date, from, from);
  const tChai = at(chai, tDate + 1300, from, tDate + 300);
  const tCross = at(cross, tChai + 1200, from, tChai + 300);
  const tGsk = at(gsk, tCross + 1200, from, tCross + 300);
  const tDock = at(dock, tGsk + 700, from, tGsk + 400);
  const tCards = at(cards, tDock + 700, from, tDock + 300);
  const tDesc = at(describe, tCards + 1800, from, tCards + 500);
  const tExp = at(expected, tDesc + 1600, from, tDesc + 400);

  const R = HOOK.row;
  const D = HOOK.dock;
  const C = HOOK.cards;
  const dq = EASE_IO(k(tDock, 560));
  const crossQ = EASE(k(tCross, 420));

  if (ms < tDate - 60) return null;
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {/* ── the lockup: leaf + "Chai Discovery × GSK" (docks as ONE group) ── */}
      <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, transformOrigin: "50% 0%", transform: `translateY(${D.dy * dq}px) scale(${lerp(1, D.s, dq)})` }}>
        <DayLeaf rect={HOOK.leaf} k={k(tDate, 520)} month={date.month} day={date.day} />
        <div style={{ position: "absolute", left: 0, width: 1920, top: R.top, display: "flex", justifyContent: "center", alignItems: "center", gap: R.gap }}>
          <div style={{ ...big(WH, R.size), opacity: k(tChai, 160), transform: `translateX(${(1 - EASE(k(tChai, 380))) * -50}px)` }}>{chai.name}</div>
          <svg width={R.size * 0.62} height={R.size * 0.62} viewBox="0 0 10 10" style={{ flex: "none", opacity: crossQ > 0 ? 1 : 0 }}>
            <line x1={1} y1={1} x2={lerp(1, 9, clamp01(crossQ * 2))} y2={lerp(1, 9, clamp01(crossQ * 2))} stroke={WH} strokeWidth={1.4} strokeLinecap="round" />
            <line x1={9} y1={1} x2={lerp(9, 1, clamp01(crossQ * 2 - 1))} y2={lerp(1, 9, clamp01(crossQ * 2 - 1))} stroke={WH} strokeWidth={1.4} strokeLinecap="round" opacity={crossQ > 0.5 ? 1 : 0} />
          </svg>
          <div style={{ ...big(WH, R.size), ...stamp(k(tGsk, 280), 1.4) }}>{gsk.name}</div>
        </div>
      </div>

      {/* ── three dashed announcement cards: what a model is EXPECTED to do ── */}
      {C.xs.map((x, i) => {
        const q = EASE(k(tCards + i * 140, 420));
        if (q <= 0) return null;
        return (
          <div key={i} style={{ position: "absolute", left: x - C.w / 2, top: C.top + (1 - q) * 90, width: C.w, height: C.h, opacity: clamp01(q * 3) }}>
            <svg style={{ position: "absolute", left: 0, top: 0 }} width={C.w} height={C.h}>
              <rect x={3} y={3} width={C.w - 6} height={C.h - 6} rx={26} fill="none" stroke={WH} strokeWidth={5} strokeDasharray="20 14" />
            </svg>
            <div style={{ position: "absolute", left: 0, width: C.w, top: 40, textAlign: "center", ...label(INK_SUB_ON_RED, 30) }}>{cards.label}</div>
            <Molecule cx={C.w / 2} cy={250} size={C.mol} color={WH} dashed k={k(tDesc + i * 120, 700)} />
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 0, width: 1920, top: HOOK.expected.top, textAlign: "center", ...big(WH, HOOK.expected.size), ...stamp(k(tExp, 300), 1.3) }}>{expected.label}</div>
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// LabFound — one solid result whose numbers are missing (white card)
// ══════════════════════════════════════════════════════════════════════════
export const FOUND = {
  card: { left: 410, top: 150, w: 1100, h: 700 },
  mol: { cx: 250, cy: 270, size: 280 }, // card-local
  lab: { left: 500, top: 150, size: 40 },
  found: { left: 470, top: 210, size: 150 }, // "Found." ~540 wide: 470..1010 inside the 1100 card
  fields: { top: 470, xs: [110, 410, 710] as const, w: 280, labelSize: 26, boxH: 110 }, // "Designs per target" ~257 wide at 26
};

export const LabFound: React.FC<Win & {
  card: Cued; // the one solid card slides in
  lab: { label: string } & Cued;
  found: { label: string } & Cued; // the red stamp
  fields: { labels: [string, string, string] } & Cued; // the three number fields arrive
  numbers: Cued; // ...and stay empty: a dash in each, struck in
}> = ({ from, to, card, lab, found, fields, numbers }) => {
  const ms = useMs();
  const k = useK();
  const WH = COLORS.paper;
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));

  const tCard = at(card, from, from);
  const tLab = at(lab, tCard + 800, from, tCard + 300);
  const tFound = at(found, tLab + 1400, from, tLab + 400);
  const tFields = at(fields, tFound + 1400, from, tFound + 400);
  const tNum = at(numbers, tFields + 1000, from, tFields + 300);

  const C = FOUND.card;
  const F = FOUND.fields;
  const cq = EASE(k(tCard, 480));

  if (ms < tCard - 60) return null;
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <div style={{ position: "absolute", left: C.left, top: C.top + (1 - cq) * 80, width: C.w, height: C.h, borderRadius: 34, background: COLORS.ink, opacity: clamp01(cq * 3) }}>
        <Molecule cx={FOUND.mol.cx} cy={FOUND.mol.cy} size={FOUND.mol.size} color={WH} k={k(tCard + 120, 620)} />
        <div style={{ position: "absolute", left: FOUND.lab.left, top: FOUND.lab.top, opacity: k(tLab, 220), ...label(INK_SUB, FOUND.lab.size) }}>{lab.label}</div>
        <div style={{ position: "absolute", left: FOUND.found.left, top: FOUND.found.top, transformOrigin: "0% 50%", ...big(COLORS.accent, FOUND.found.size), ...stamp(k(tFound, 300), 1.45) }}>{found.label}</div>

        {/* the numbers: fields with nothing in them */}
        {F.xs.map((x, i) => {
          const q = EASE(k(tFields + i * 110, 360));
          if (q <= 0) return null;
          const dq = k(tNum + i * 110, 300);
          return (
            <div key={i} style={{ position: "absolute", left: x, top: F.top + (1 - q) * 30, width: F.w, opacity: clamp01(q * 3) }}>
              <div style={{ ...label(INK_SUB, F.labelSize) }}>{fields.labels[i]}</div>
              <svg style={{ display: "block", marginTop: 18 }} width={F.w} height={F.boxH}>
                <rect x={2.5} y={2.5} width={F.w - 5} height={F.boxH - 5} rx={18} fill="none" stroke={WH} strokeOpacity={0.55} strokeWidth={5} strokeDasharray="16 12" />
                <line x1={F.w / 2 - 34} y1={F.boxH / 2} x2={F.w / 2 - 34 + 68 * EASE(dq)} y2={F.boxH / 2} stroke={WH} strokeWidth={9} strokeLinecap="round" opacity={dq > 0 ? 1 : 0} />
              </svg>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// ChaiPlatform — who Chai is, what GSK gets, and how long it has been going (black)
// ══════════════════════════════════════════════════════════════════════════
export const PLAT = {
  name: { left: 150, top: 300, size: 200 }, // "Chai" alone
  city: { left: 158, top: 530, size: 48 },
  builds: { left: 158, top: 600, size: 48 },
  mol: { cx: 1380, cy: 420, size: 420 },
  box: { left: 1060, top: 170, w: 700, h: 500, name: 96 }, // the platform
  gsk: { left: 150, size: 170, cy: 420 },
  arrow: { x0: 560, x1: 1020, y: 420, label: 340 },
  mods: { left: 1110, tops: [340, 470] as const, w: 600, h: 100, size: 46 },
  rail: { x0: 150, x1: 1760, y: 830, ticks: 5, label: 862 },
  bar: { x0: 150, mid: 1010, x1: 1760, y: 800, h: 34, label: 856 },
};

export const ChaiPlatform: React.FC<Win & {
  chai: { name: string } & Cued; // stamps alone
  city: { label: string } & Cued;
  builds: { label: string } & Cued;
  mol: Cued; // a solid molecule draws on "design molecules"
  move: Cued; // a pause: the name travels into the platform box; city/builds/molecule retire
  gsk: { name: string } & Cued;
  access: { label: string } & Cued; // the arrow draws GSK -> platform
  mods: { text: string; word?: string; ms?: number }[]; // the two models inside the platform
  rail: { label: string } & Cued; // across GSK's pipeline
  clear: Cued; // a pause: modules + rail retire
  bar: Cued; // the relationship as a bar (the work so far, dim)
  expansion: { label: string } & Cued; // the red segment grows
  begun: { label: string } & Cued; // the dim segment is named
}> = ({ from, to, chai, city, builds, mol, move, gsk, access, mods, rail, clear, bar, expansion, begun }) => {
  const ms = useMs();
  const k = useK();
  const WH = COLORS.paper;
  const RED = COLORS.accent;
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));

  const tChai = at(chai, from, from);
  const tCity = at(city, tChai + 500, from, tChai + 200);
  const tBuilds = at(builds, tCity + 1400, from, tCity + 300);
  const tMol = at(mol, tBuilds + 1300, from, tBuilds + 300);
  const tMove = at(move, tMol + 1200, from, tMol + 400);
  const tGsk = at(gsk, tMove + 500, from, tMove + 200);
  const tAccess = at(access, tGsk + 600, from, tGsk + 250);
  const tMods = mods.map((m) => at(m, tAccess + 2500, from, tAccess + 400));
  for (let i = 1; i < tMods.length; i++) tMods[i] = Math.max(tMods[i], tMods[i - 1] + 300);
  const tRail = at(rail, tMods[tMods.length - 1] + 1500, from, tMods[tMods.length - 1] + 400);
  const tClear = at(clear, tRail + 1600, from, tRail + 500);
  const tBar = at(bar, tClear + 600, from, tClear + 200);
  const tExp = at(expansion, tBar + 1100, from, tBar + 300);
  const tBegun = at(begun, tExp + 1500, from, tExp + 400);

  const N = PLAT.name;
  const BX = PLAT.box;
  const A = PLAT.arrow;
  const M = PLAT.mods;
  const RL = PLAT.rail;
  const BR = PLAT.bar;

  // the name travels from alone-on-the-left into the platform box's header
  const mv = EASE_IO(k(tMove, 620));
  const nameLeft = lerp(N.left, BX.left + 48, mv);
  const nameTop = lerp(N.top, BX.top + 44, mv);
  const nameSize = lerp(N.size, BX.name, mv);
  const intro = 1 - k(tMove, 320); // city, builds, molecule retire as the name moves
  const boxQ = k(tMove + 200, 420);
  const aq = EASE_IO(k(tAccess, 600));
  const headX = lerp(A.x0, A.x1, aq);
  const out = 1 - k(tClear, 320); // modules + rail retire
  const railQ = EASE_IO(k(tRail, 700));
  const barQ = k(tBar, 360);
  const expQ = EASE_IO(k(tExp, 760));

  if (ms < tChai - 60) return null;
  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {/* ── who Chai is ── */}
      <div style={{ position: "absolute", left: PLAT.city.left, top: PLAT.city.top, opacity: k(tCity, 220) * intro, ...label(INK_SUB, PLAT.city.size) }}>{city.label}</div>
      <div style={{ position: "absolute", left: PLAT.builds.left, top: PLAT.builds.top, opacity: k(tBuilds, 220) * intro, ...label(WH, PLAT.builds.size) }}>{builds.label}</div>
      <Molecule cx={PLAT.mol.cx} cy={PLAT.mol.cy} size={PLAT.mol.size} color={WH} k={k(tMol, 700)} opacity={intro} />

      {/* ── the platform box (the name lands in its header) ── */}
      {boxQ > 0 ? (
        <div style={{ position: "absolute", left: BX.left, top: BX.top, width: BX.w, height: BX.h, borderRadius: 30, border: `5px solid ${WH}`, boxSizing: "border-box", opacity: boxQ, background: inkA(0.55) }} />
      ) : null}
      <div style={{ position: "absolute", left: nameLeft, top: nameTop, ...big(WH, nameSize), ...(mv > 0 ? {} : stamp(k(tChai, 300), 1.3)) }}>{chai.name}</div>
      {M.tops.map((top, i) => {
        const q = EASE(k(tMods[i], 340));
        if (q <= 0 || !mods[i]) return null;
        return (
          <div key={i} style={{ position: "absolute", left: M.left, top: top + (1 - q) * 24, width: M.w, height: M.h, borderRadius: 20, background: WH, opacity: clamp01(q * 3) * out, display: "flex", alignItems: "center", paddingLeft: 34, boxSizing: "border-box", ...label(COLORS.ink, M.size) }}>
            {mods[i].text}
          </div>
        );
      })}

      {/* ── GSK and the access arrow ── */}
      <div style={{ position: "absolute", left: PLAT.gsk.left, top: PLAT.gsk.cy - PLAT.gsk.size / 2, opacity: k(tGsk, 180), transform: `translateX(${(1 - EASE(k(tGsk, 380))) * -50}px)`, ...big(WH, PLAT.gsk.size) }}>{gsk.name}</div>
      {aq > 0 ? (
        <svg style={{ position: "absolute", left: 0, top: 0 }} width={1920} height={1080}>
          <line x1={A.x0} y1={A.y} x2={headX - 8} y2={A.y} stroke={WH} strokeWidth={9} strokeLinecap="round" />
          <path d={`M ${headX - 32} ${A.y - 24} L ${headX} ${A.y} L ${headX - 32} ${A.y + 24}`} fill="none" stroke={WH} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" opacity={clamp01(aq * 5)} />
        </svg>
      ) : null}
      <div style={{ position: "absolute", left: A.x0, width: A.x1 - A.x0, top: A.label, textAlign: "center", opacity: k(tAccess + 150, 220), ...label(INK_SUB, 40) }}>{access.label}</div>

      {/* ── across GSK's pipeline: a rail draws, its stages light ── */}
      {railQ > 0 && out > 0 ? (
        <div style={{ opacity: out }}>
          <svg style={{ position: "absolute", left: 0, top: 0 }} width={1920} height={1080}>
            <line x1={RL.x0} y1={RL.y} x2={lerp(RL.x0, RL.x1, railQ)} y2={RL.y} stroke={WH} strokeWidth={6} strokeLinecap="round" />
            {Array.from({ length: RL.ticks }, (_, i) => {
              const x = lerp(RL.x0 + 80, RL.x1 - 80, i / (RL.ticks - 1));
              const q = clamp01((lerp(RL.x0, RL.x1, railQ) - x) / 60);
              return <circle key={i} cx={x} cy={RL.y} r={18 * BACK(q)} fill={WH} opacity={q > 0 ? 1 : 0} />;
            })}
          </svg>
          <div style={{ position: "absolute", left: RL.x0, top: RL.label, opacity: k(tRail + 300, 220), ...label(INK_SUB, 36) }}>{rail.label}</div>
        </div>
      ) : null}

      {/* ── the relationship as a bar: the work so far (dim), then the expansion (red) ── */}
      {barQ > 0 ? (
        <div>
          <div style={{ position: "absolute", left: BR.x0, top: BR.y, height: BR.h, width: (BR.mid - BR.x0) * EASE(barQ), borderRadius: BR.h / 2, background: "rgba(255,255,255,0.32)" }} />
          <div style={{ position: "absolute", left: BR.mid - BR.h / 2, top: BR.y, height: BR.h, width: (BR.x1 - BR.mid + BR.h / 2) * expQ, borderRadius: BR.h / 2, background: RED, opacity: expQ > 0 ? 1 : 0 }} />
          <div style={{ position: "absolute", left: BR.mid + 10, top: BR.label, opacity: k(tExp + 200, 220), ...label(WH, 40) }}>{expansion.label}</div>
          <div style={{ position: "absolute", left: BR.x0, top: BR.label, opacity: k(tBegun, 220), ...label(INK_SUB, 40) }}>{begun.label}</div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};
