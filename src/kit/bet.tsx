// ─────────────────────────────────────────────────────────────────────────
// KIT · bet — THE TOP FLOOR AND THE FOUNDATION. Added on the Roche × Rona
// reel, 2026-10-15 (VERTICAL 9:16), §3 + the end card. One mover per cue.
//
// `Foundation` (red): "Lilly and Novo own appetite. Roche just paid up to
// $1.16 billion to own metabolism itself." Two flags drop; a plate slides in
// under them ("own") and is named "Appetite". The §1 tower RETURNS from the
// right, already built (a callback does not re-count), with "Up to" and the
// figure slammed beside it. On "own" a wide slab rises from below and meets
// both the plate and the tower's flask: everything stands on metabolism.
//
// `TowerEnd` (white card): BriefEnd's layout (kit/nextone `END`) with the
// SPINE filed inside the issue: the tower at tile size, the story beside it.
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, Easing, interpolate } from "remotion";
import { CLAMP, clamp01, COLORS, DISPLAY, INK_SUB, INK_SUB_ON_RED, TRACK, useMs } from "./core";
import { TYPE } from "../style";
import { at, lerp, useK, type Cued, type Win } from "./elora";
import { Tower, TOWER } from "./tower";
import { END } from "./nextone";
import { Wordmark } from "./ui";
import { FlowLine } from "./flowline";

const EASE = Easing.out(Easing.cubic);
const EASE_IO = Easing.inOut(Easing.cubic);
const BACK = Easing.out(Easing.back(1.6));

/** Place the tower so its ground centre lands at (gx, gy) at scale s. */
const towerAt = (gx: number, gy: number) => ({ dx: gx - (TOWER.x + TOWER.w / 2), dy: gy - TOWER.ground });

// ══════════════════════════════════════════════════════════════════════════
// Foundation (red)
// ══════════════════════════════════════════════════════════════════════════
export const FOUND = {
  slab: { x: 90, y: 1250, w: 900, h: 190 },
  plate: { x: 120, y: 1140, w: 440, h: 110 },
  flags: { xs: [200, 400], top: 930, h: 210, fw: 170, fh: 84 },
  tower: { gx: 790, s: 0.55 }, // its flask sits on the slab
  fig: { x: 120, y: 520 },
};

export const Foundation: React.FC<Win & {
  flags: ({ label: string } & Cued)[];
  own: Cued; // the plate slides in under the flags
  plate: { label: string } & Cued;
  tower: { paid: number; total: number; label: string } & Cued; // returns from the right
  upTo: { label: string } & Cued;
  figure: { label: string } & Cued; // slams, no count
  slab: Cued; // rises under everything ("own metabolism")
  slabLabel: { label: string } & Cued;
}> = ({ from, to, flags, own, plate, tower, upTo, figure, slab, slabLabel }) => {
  const ms = useMs();
  const k = useK();
  const W = COLORS.paper;
  const F = FOUND;

  const tFlag = flags.map((f, i) => at(f, from + 500 + i * 700, from));
  const tOwn = at(own, tFlag[tFlag.length - 1] + 400, from, tFlag[tFlag.length - 1] + 250);
  const tPlate = at(plate, tOwn + 300, from, tOwn + 150);
  const tTower = at(tower, tPlate + 1000, from, tPlate + 400);
  const tUp = at(upTo, tTower + 800, from, tTower + 300);
  const tFig = at(figure, tUp + 400, from, tUp + 200);
  const tSlab = at(slab, tFig + 1500, from, tFig + 500);
  const tSlabL = at(slabLabel, tSlab + 250, from, tSlab + 150);
  if (ms < from || ms > to) return null;

  const ownK = EASE_IO(k(tOwn, 380));
  const towerK = EASE_IO(k(tTower, 620));
  const slabK = EASE_IO(k(tSlab, 420));
  const flaskH = TOWER.flask.w * 1.2 * F.tower.s;
  const gy = F.slab.y - flaskH - 2; // the tower's ground: its flask stands on the slab top
  const pos = towerAt(F.tower.gx, gy);

  return (
    <AbsoluteFill>
      {/* the slab: rises from below the frame */}
      {slabK > 0 ? (
        <div style={{ position: "absolute", left: F.slab.x, top: lerp(1920, F.slab.y, slabK), width: F.slab.w, height: F.slab.h, borderRadius: 18, background: W,
          display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: 100, letterSpacing: TRACK.display, color: COLORS.accent }}>
          <span style={{ opacity: k(tSlabL, 200) }}>{slabLabel.label}</span>
        </div>
      ) : null}

      {/* the plate, under the flags */}
      {ownK > 0 ? (
        <div style={{ position: "absolute", left: lerp(-F.plate.w - 40, F.plate.x, ownK), top: F.plate.y, width: F.plate.w, height: F.plate.h, borderRadius: 14, background: W,
          display: "flex", alignItems: "center", justifyContent: "center", fontFamily: DISPLAY, fontWeight: 700, fontSize: 64, letterSpacing: TRACK.headline, color: COLORS.accent }}>
          <span style={{ opacity: k(tPlate, 200) }}>{plate.label}</span>
        </div>
      ) : null}

      {/* the flags */}
      {flags.map((f, i) => {
        const q = k(tFlag[i], 380);
        if (q <= 0) return null;
        const x = F.flags.xs[i];
        return (
          <div key={i} style={{ position: "absolute", left: 0, top: 0, opacity: clamp01(q * 3), transform: `translateY(${(1 - BACK(q)) * -180}px)` }}>
            <div style={{ position: "absolute", left: x - 4, top: F.flags.top, width: 8, height: F.flags.h, background: W }} />
            <div style={{ position: "absolute", left: x + 4, top: F.flags.top, width: F.flags.fw, height: F.flags.fh, background: W, display: "flex", alignItems: "center", justifyContent: "center",
              fontFamily: DISPLAY, fontWeight: 700, fontSize: 50, letterSpacing: TRACK.headline, color: COLORS.accent }}>
              {f.label}
            </div>
          </div>
        );
      })}

      {/* the tower returns, already built, with its buyer above it */}
      {towerK > 0 ? (
        <>
          <Tower paid={tower.paid} total={tower.total} flaskK={1} flaskStroke={W} dashColor={W} baseColor={W} liquid={W} colFill="rgba(255,255,255,0.1)"
            s={F.tower.s} dx={pos.dx + (1 - towerK) * 560} dy={pos.dy} />
          <div style={{ position: "absolute", left: F.tower.gx - 200 + (1 - towerK) * 560, width: 400, top: gy - TOWER.H * F.tower.s - 92, textAlign: "center",
            fontFamily: DISPLAY, fontWeight: 700, fontSize: 64, letterSpacing: TRACK.headline, color: W }}>
            {tower.label}
          </div>
        </>
      ) : null}

      {/* up to $1.16B: slammed, not counted */}
      <div style={{ position: "absolute", left: F.fig.x, top: F.fig.y - 66, opacity: k(tUp, 200), fontFamily: DISPLAY, fontWeight: 700, fontSize: TYPE.label, letterSpacing: TRACK.kicker, color: INK_SUB_ON_RED }}>
        {upTo.label}
      </div>
      {ms >= tFig ? (
        <div style={{ position: "absolute", left: F.fig.x, top: F.fig.y, opacity: k(tFig, 120), transform: `scale(${interpolate(ms, [tFig, tFig + 300], [1.18, 1], { ...CLAMP, easing: EASE })})`, transformOrigin: "0 50%",
          fontFamily: DISPLAY, fontWeight: 700, fontSize: 150, letterSpacing: TRACK.display, color: W, lineHeight: 1 }}>
          {figure.label}
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

// ══════════════════════════════════════════════════════════════════════════
// TowerEnd (white card)
// ══════════════════════════════════════════════════════════════════════════
export const TowerEnd: React.FC<Win & {
  issue: { label: string } & Cued; // the issue frame rises; its label
  labelAt: Cued;
  brand: Cued; // the lockup lands
  tile: { title: string; paid: number; total: number; sub: string } & Cued; // the sub writes on its cue
  subscribe: { label: string } & Cued;
  link: { label: string } & Cued; // types
  tagline: { text: string } & Cued;
}> = ({ from, to, issue, labelAt, brand, tile, subscribe, link, tagline }) => {
  const ms = useMs();
  const k = useK();
  const INK = COLORS.ink;
  const W = COLORS.paper;
  const E = END;

  const tIssue = at(issue, from + 320, from);
  const tLabel = at(labelAt, tIssue + 150, from, tIssue + 100);
  const tBrand = at(brand, tLabel + 500, from, tLabel + 250);
  const tTile = at(tile, tBrand + 1000, from, tBrand + 300);
  const tSub = at(subscribe, tTile + 1300, from, tTile + 500);
  const tLink = at(link, tSub + 500, from, tSub + 300);
  const tTag = at(tagline, tLink + 700, from, tLink + 450);
  if (ms < tIssue - 40 || ms > to) return null;

  const issueK = EASE(k(tIssue, 360));
  const brandO = k(tBrand, 120);
  const brandS = interpolate(ms, [tBrand, tBrand + 300], [1.14, 1], { ...CLAMP, easing: EASE });
  const subO = k(tSub, 110);
  const subS = interpolate(ms, [tSub, tSub + 280], [1.08, 1], { ...CLAMP, easing: EASE });
  const typed = Math.round(link.label.length * k(tLink, Math.max(300, Math.min(600, tTag - tLink - 100))));

  // the spine at tile size, standing in the issue's left half
  const ts = 0.3;
  const flaskH = TOWER.flask.w * 1.2 * ts;
  const gy = E.issue.y + E.issue.h - 50 - flaskH;
  const pos = towerAt(E.issue.x + 170, gy);
  const tx = E.issue.x + 330; // the story column

  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: E.lockupY - 40, display: "flex", justifyContent: "center", opacity: brandO, transform: `scale(${brandS})` }}>
        <Wordmark size={80} tone="brand" />
      </div>

      <AbsoluteFill style={{ opacity: clamp01(issueK * 2), transform: `translateY(${(1 - issueK) * 70}px)` }}>
        <div style={{ position: "absolute", left: E.issue.x, top: E.issue.y, width: E.issue.w, height: E.issue.h, borderRadius: 30, background: INK }} />
        <div style={{ position: "absolute", left: E.issue.x + 44, top: E.issue.y + 36, opacity: k(tLabel, 130), fontFamily: DISPLAY, fontWeight: 700, fontSize: 40, letterSpacing: TRACK.nav, color: INK_SUB, lineHeight: 1 }}>
          {issue.label}
        </div>
        <Tower paid={tile.paid} total={tile.total} flaskK={1} flaskStroke={W} dashColor={W} colFill="rgba(255,255,255,0.08)" s={ts} dx={pos.dx} dy={pos.dy} />
        <div style={{ position: "absolute", left: tx, top: E.issue.y + 170, width: E.issue.x + E.issue.w - 40 - tx, fontFamily: DISPLAY, fontWeight: 700, color: W, letterSpacing: TRACK.headline }}>
          <div style={{ fontSize: 64, lineHeight: 1.05 }}>{tile.title}</div>
          <div style={{ fontSize: 44, lineHeight: 1.15, marginTop: 24, color: COLORS.accent, opacity: k(tTile, 260), transform: `translateY(${(1 - EASE(k(tTile, 260))) * 16}px)` }}>{tile.sub}</div>
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
