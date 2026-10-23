// ─────────────────────────────────────────────────────────────────────────
// KIT · option — WHY IT MATTERS: AN OPTION PRICED LOW, GATES SOMEONE ELSE HOLDS.
// Added on the AstraZeneca x insitro HORIZONTAL long-form, 2026-10-22 (16:9;
// absolute 1920x1080 coordinates).
//
// Motion law (Nel, 2026-10-22): one mover at a time, each one big. Nothing loops;
// the pendulums are DAMPED and come to rest.
//
// `OptionBill` (red): "Why it matters." drops in and flies out; an OPTION ticket
//   swings in on a string and settles; a "Priced low" tag drops onto it; a RECEIPT
//   prints down (three rows: the paid row solid, the conditional rows dashed); an
//   "If programs advance" stamp lands across the dashed rows. White line art only
//   (no knockout fills in the red world).
// `PartnerGates` (black): the milestone gates return on a rail; PADLOCKS drop onto
//   them and their shackles snap shut ("its partner controls"); everything IMPLODES;
//   AstraZeneca's card (red, "This deal") pops out of that point into insitro's hand,
//   then BMS, Lilly and Gilead fly up spinning and fan into the hand, each LANDING on
//   its spoken name. (Replaced a hub + chips Nel called boring, entrances late, 2026-10-22.)
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { CLAMP, clamp01, COLORS, INK_SUB, INK_SUB_ON_RED, useMs } from "./core";
import { at, lerp, useK, type Cued, type Win } from "./elora";
import { big, label, stamp } from "./rona";
import { BarReveal, Letters } from "./hunt";

const EASE = Easing.out(Easing.cubic);
const EASE_IN = Easing.in(Easing.cubic);
const EASE_IO = Easing.inOut(Easing.cubic);
const BACK = Easing.out(Easing.back(1.8));
const BOUNCE = Easing.out(Easing.bounce);

/** a damped pendulum angle (deg) that comes to REST: amplitude a0, period ms, settle by `rest` ms */
const pendulum = (dt: number, a0: number, period = 900, rest = 2000) => {
  if (dt <= 0) return a0;
  if (dt >= rest) return 0;
  const decay = Math.exp((-dt / rest) * 4.2);
  return a0 * decay * Math.cos((dt / period) * Math.PI * 2) * (1 - dt / rest);
};

// ══════════════════════════════════════════════════════════════════════════
// OptionBill — red
// ══════════════════════════════════════════════════════════════════════════
export const BILL = {
  title: { top: 400, size: 140 },
  kicker: { left: 110, top: 90, size: 44 },
  ticket: { pivotX: 560, len: 300, w: 560, h: 300, size: 120 },
  tag: { dx: 230, dy: 300, w: 230, h: 76, size: 34 },
  receipt: { left: 1100, top: 110, w: 560, h: 700, rows: [250, 400, 550] as const, size: 40, val: 46 },
  stampSeat: { top: 834, size: 50 }, // BELOW the receipt: a stamp over text made both unreadable (Nel, 2026-10-22)
};

export const OptionBill: React.FC<Win & {
  title: { text: string } & Cued; // drops in
  kicker: { label: string } & Cued; // the title flies out, the kicker lands
  ticket: { label: string } & Cued; // swings in on a string
  tag: { label: string } & Cued; // drops onto the ticket
  receipt: { title: string; rows: { label: string; value: string; solid?: boolean }[] } & Cued; // prints down
  advance: { label: string } & Cued; // the stamp
}> = ({ from, to, title, kicker, ticket, tag, receipt, advance }) => {
  const ms = useMs();
  const k = useK();
  const WH = COLORS.paper;
  const SUB = INK_SUB_ON_RED;
  const B = BILL;
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));

  const tTitle = at(title, from, from);
  const tKick = at(kicker, tTitle + 1200, from, tTitle + 600);
  const tTicket = at(ticket, tKick + 1200, from, tKick + 400);
  const tTag = at(tag, tTicket + 500, from, tTicket + 300);
  const tRec = at(receipt, tTag + 1100, from, tTag + 500);
  const tAdv = at(advance, tRec + 1400, from, tRec + 900);

  const titleOut = EASE_IN(k(tKick, 380));
  const T = B.ticket;
  const swing = pendulum(ms - tTicket, -72, 1000, 2200);
  const tin = k(tTicket, 200);
  const tagSwing = pendulum(ms - tTag, 40, 640, 1500);
  const tagQ = k(tTag, 420);
  const R = B.receipt;
  const print = EASE_IO(k(tRec, 1100));
  const advQ = k(tAdv, 380);

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      {titleOut < 1 ? (
        <div style={{ position: "absolute", left: 0, width: 1920, top: B.title.top, textAlign: "center", transform: `translateY(${-700 * titleOut}px)`, ...big(WH, B.title.size) }}>
          {ms >= tTitle - 40 ? <Letters text={title.text} t={tTitle} stagger={34} rise={60} mode="drop" /> : null}
        </div>
      ) : null}
      <div style={{ position: "absolute", left: B.kicker.left, top: B.kicker.top, ...label(WH, B.kicker.size) }}>
        <BarReveal t={tKick + 150} color={WH}>{kicker.label}</BarReveal>
      </div>

      {/* ── the option ticket on a string: swings in, damps, rests ── */}
      {tin > 0 ? (
        <div style={{ position: "absolute", left: T.pivotX, top: 0, width: 0, height: 0, transform: `rotate(${swing}deg)`, transformOrigin: "0 0", opacity: tin }}>
          <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} width={1} height={1}>
            <line x1={0} y1={0} x2={0} y2={T.len} stroke={WH} strokeWidth={4} />
            <path d={`M ${-T.w / 2} ${T.len} H ${T.w / 2} V ${T.len + T.h * 0.38} a 26 26 0 0 0 0 ${T.h * 0.24} V ${T.len + T.h} H ${-T.w / 2} V ${T.len + T.h * 0.62} a 26 26 0 0 0 0 ${-T.h * 0.24} Z`}
              fill="none" stroke={WH} strokeWidth={6} strokeLinejoin="round" />
            <line x1={-T.w / 2 + 120} y1={T.len + 16} x2={-T.w / 2 + 120} y2={T.len + T.h - 16} stroke={WH} strokeWidth={4} strokeDasharray="10 10" />
            <circle cx={0} cy={T.len + 22} r={9} fill="none" stroke={WH} strokeWidth={4} />
          </svg>
          <div style={{ position: "absolute", left: -T.w / 2 + 130, width: T.w - 150, top: T.len + T.h / 2 - T.size * 0.55, textAlign: "center", ...big(WH, T.size) }}>{ticket.label}</div>
          {/* the "priced low" tag, hanging off the ticket's corner */}
          {tagQ > 0 ? (
            <div style={{ position: "absolute", left: B.tag.dx, top: T.len + T.h - 10, width: 0, height: 0, transformOrigin: "0 0", transform: `rotate(${tagSwing}deg) translateY(${lerp(-240, 0, BOUNCE(tagQ))}px)` }}>
              <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} width={1} height={1}>
                <line x1={0} y1={0} x2={0} y2={60} stroke={WH} strokeWidth={3} />
              </svg>
              <div style={{ position: "absolute", left: -B.tag.w / 2, top: 60, width: B.tag.w, height: B.tag.h, borderRadius: 14, background: WH, display: "flex", alignItems: "center", justifyContent: "center", ...label(COLORS.accent, B.tag.size) }}>{tag.label}</div>
            </div>
          ) : null}
        </div>
      ) : null}

      {/* ── the bill: a receipt prints down; the paid row solid, the rest dashed ── */}
      {print > 0 ? (
        <div style={{ position: "absolute", left: R.left, top: R.top, width: R.w, height: R.h * print, overflow: "hidden" }}>
          <svg style={{ position: "absolute", left: 0, top: 0 }} width={R.w} height={R.h}>
            <path d={`M 3 0 V ${R.h - 24} ${Array.from({ length: 14 }, (_, i) => `L ${3 + ((i + 0.5) * (R.w - 6)) / 14} ${R.h - (i % 2 ? 24 : 3)}`).join(" ")} L ${R.w - 3} ${R.h - 24} V 0`} fill="none" stroke={WH} strokeWidth={6} strokeLinejoin="round" />
          </svg>
          <div style={{ position: "absolute", left: 40, top: 60, ...big(WH, 64) }}>{receipt.title}</div>
          <div style={{ position: "absolute", left: 40, right: 40, top: 150, height: 0, borderTop: `4px solid ${WH}` }} />
          {receipt.rows.map((r, i) => (
            <div key={i} style={{ position: "absolute", left: 40, right: 40, top: R.rows[i] - 40 }}>
              <div style={{ ...label(SUB, R.size) }}>{r.label}</div>
              <div style={{ marginTop: 10, paddingBottom: 14, borderBottom: `5px ${r.solid ? "solid" : "dashed"} ${WH}`, ...big(WH, R.val) }}>{r.value}</div>
            </div>
          ))}
        </div>
      ) : null}
      {advQ > 0 ? (
        <div style={{ position: "absolute", left: R.left - 60, width: R.w + 120, top: B.stampSeat.top, display: "flex", justifyContent: "center", transform: "rotate(-5deg)" }}>
          <div style={{ padding: "14px 30px", borderRadius: 16, background: WH, ...big(COLORS.accent, B.stampSeat.size), ...stamp(advQ, 3.6), filter: advQ < 1 ? `blur(${(1 - EASE(advQ)) * 16}px)` : undefined }}>{advance.label}</div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// PartnerGates — black
// ══════════════════════════════════════════════════════════════════════════
export const PG = {
  kicker: { left: 110, top: 90, size: 44 },
  rail: { x0: 300, x1: 1620, y: 640 },
  gates: { xs: [560, 960, 1360] as const, w: 180, h: 240 },
  lock: { w: 76, h: 60 },
  caption: { top: 700, size: 44 },
  hub: { cx: 960, cy: 540 }, // the implosion point
  // insitro's hand of deal cards: a fan round a pivot below the frame; the LAST slot is this deal
  fan: { pivot: { x: 960, y: 1320 }, R: 780, slots: [-27, -9, 9, 27] as const, w: 290, h: 390, size: 42, thisSize: 38 },
};

const fanPos = (deg: number) => ({ x: PG.fan.pivot.x + PG.fan.R * Math.sin((deg * Math.PI) / 180), y: PG.fan.pivot.y - PG.fan.R * Math.cos((deg * Math.PI) / 180) });

const Padlock: React.FC<{ x: number; y: number; q: number; snap: number; color: string }> = ({ x, y, q, snap, color }) => {
  if (q <= 0) return null;
  const L = PG.lock;
  const dy = lerp(-700, 0, BOUNCE(q));
  const open = lerp(26, 0, BACK(snap)); // the shackle drops shut
  return (
    <g transform={`translate(${x} ${y + dy})`}>
      <path d={`M ${-L.w * 0.3} ${-L.h / 2 - open} V ${-L.h / 2 - 22 - open} a ${L.w * 0.3} ${L.w * 0.3} 0 0 1 ${L.w * 0.6} 0 V ${-L.h / 2 - (snap > 0.5 ? 0 : open)}`}
        fill="none" stroke={color} strokeWidth={8} strokeLinecap="round" />
      <rect x={-L.w / 2} y={-L.h / 2} width={L.w} height={L.h} rx={10} fill={color} />
      <circle cx={0} cy={0} r={7} fill={COLORS.ink} />
    </g>
  );
};

export const PartnerGates: React.FC<Win & {
  kicker: { label: string } & Cued;
  rail: Cued; // the rail draws
  gates: Cued; // three dashed gates pop up
  locks: Cued; // padlocks drop and snap shut
  caption: { label: string } & Cued;
  implode: Cued; // everything collapses into the hub
  hub: { name: string; sub: string; kicker: string } & Cued; // this deal's card + the kicker
  partners: ({ name: string } & Cued)[];
}> = ({ from, to, kicker, rail, gates, locks, caption, implode, hub, partners }) => {
  const ms = useMs();
  const k = useK();
  const WH = COLORS.paper;
  const P = PG;
  const vis = clamp01(interpolate(ms, [to - 300, to], [1, 0], CLAMP));

  const tKick = at(kicker, from, from);
  const tRail = at(rail, tKick + 800, from, tKick + 300);
  const tGates = at(gates, tRail + 900, from, tRail + 400);
  const tLocks = at(locks, tGates + 800, from, tGates + 500);
  const tCap = at(caption, tLocks + 700, from, tLocks + 400);
  const tImp = at(implode, tCap + 1200, from, tCap + 600);
  const tHub = at(hub, tImp + 400, from, tImp + 350);
  const tP: number[] = [];
  partners.forEach((p, i) => tP.push(at(p, (tP[i - 1] ?? tHub) + 700, from, (tP[i - 1] ?? tHub) + 300)));

  const imp = EASE_IN(k(tImp, 420));
  const railQ = EASE_IO(k(tRail, 700));
  const R = P.rail;

  return (
    <AbsoluteFill style={{ opacity: vis }}>
      <div style={{ position: "absolute", left: P.kicker.left, top: P.kicker.top, opacity: 1 - k(tImp, 200), ...label(INK_SUB, P.kicker.size) }}>
        <BarReveal t={tKick} color={INK_SUB}>{kicker.label}</BarReveal>
      </div>
      {/* the hand's kicker takes the same seat */}
      <div style={{ position: "absolute", left: P.kicker.left, top: P.kicker.top, ...label(INK_SUB, P.kicker.size) }}>
        <BarReveal t={tHub + 150} color={INK_SUB}>{hub.kicker}</BarReveal>
      </div>

      {/* ── the gates someone else holds; they implode into the hub ── */}
      {imp < 1 && railQ > 0 ? (
        <div style={{ position: "absolute", left: 0, top: 0, width: 1920, height: 1080, transformOrigin: `${P.hub.cx}px ${P.hub.cy}px`, transform: `scale(${1 - imp}) rotate(${imp * 140}deg)` }}>
          <svg style={{ position: "absolute", left: 0, top: 0, overflow: "visible" }} width={1920} height={1080}>
            <line x1={R.x0} y1={R.y} x2={lerp(R.x0, R.x1, railQ)} y2={R.y} stroke={WH} strokeWidth={6} strokeLinecap="round" />
            {P.gates.xs.map((x, i) => {
              const q = BACK(k(tGates + i * 130, 520));
              if (q <= 0) return null;
              const G = P.gates;
              const h = G.h * q;
              return (
                <path key={i} d={`M ${x - G.w / 2} ${R.y - 8} V ${R.y - 8 - h + G.w / 2} A ${G.w / 2} ${G.w / 2} 0 0 1 ${x + G.w / 2} ${R.y - 8 - h + G.w / 2} V ${R.y - 8}`}
                  fill="none" stroke={WH} strokeWidth={6} strokeDasharray="14 10" strokeLinecap="round" opacity={clamp01(q * 3)} />
              );
            })}
            {P.gates.xs.map((x, i) => (
              <Padlock key={i} x={x} y={R.y - 8 - P.gates.h - 34} q={k(tLocks + i * 160, 620)} snap={k(tLocks + i * 160 + 640, 220)} color={WH} />
            ))}
          </svg>
          <div style={{ position: "absolute", left: 0, width: 1920, top: P.caption.top, textAlign: "center", ...big(WH, P.caption.size) }}>
            {ms >= tCap ? <Letters text={caption.label} t={tCap} stagger={16} rise={30} /> : null}
          </div>
        </div>
      ) : null}

      {/* ── insitro's hand of deals: this deal lands first, the earlier partners fan in on their names ── */}
      {P.fan.slots.map((deg, i) => {
        const isThis = i === P.fan.slots.length - 1;
        const pos = fanPos(deg);
        let q: number;
        let x: number;
        let y: number;
        let rot: number;
        let sc = 1;
        if (isThis) {
          // AstraZeneca's card pops out of the implosion point and slides into the front slot
          q = k(tHub - 80, 620);
          if (q <= 0) return null;
          const e = EASE_IO(q);
          x = lerp(P.hub.cx, pos.x, e);
          y = lerp(P.hub.cy, pos.y, e);
          rot = lerp(0, deg, e);
          sc = lerp(0.2, 1, BACK(clamp01(q * 1.6)));
        } else {
          if (!partners[i]) return null;
          // each partner card flies up from below, spinning, and LANDS on its spoken name
          q = k(tP[i] - 380, 380);
          if (q <= 0) return null;
          const e = EASE_IO(q);
          x = lerp(pos.x + (i - 1) * 260, pos.x, e);
          y = lerp(1500, pos.y, e);
          rot = lerp(deg + 300, deg, BACK(q));
        }
        const F = P.fan;
        const name = isThis ? hub.name : partners[i].name;
        return (
          <div key={i} style={{ position: "absolute", left: x - F.w / 2, top: y - F.h / 2, width: F.w, height: F.h, borderRadius: 26, transform: `rotate(${rot}deg) scale(${sc})`,
            background: isThis ? COLORS.accent : COLORS.ink, border: isThis ? "none" : `5px solid ${WH}`, boxSizing: "border-box",
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: 24, textAlign: "center" }}>
            <div style={{ ...big(WH, isThis ? F.thisSize : F.size), whiteSpace: "normal", lineHeight: 1.1 }}>{name}</div>
            {isThis ? <div style={{ marginTop: 18, ...label(INK_SUB_ON_RED, 28) }}>{hub.sub}</div> : null}
          </div>
        );
      })}
    </AbsoluteFill>
  );
};
