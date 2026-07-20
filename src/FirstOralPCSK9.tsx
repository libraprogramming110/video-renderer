// ─────────────────────────────────────────────────────────────────────────
// The First Oral PCSK9 — Merck breaks an injectable class.
// Vertical 9:16, VO-conducted motion graphics. Blocks are wired to spoken CUE
// WORDS (never raw ms) via timeline.words[]; each beat self-gates on its span.
// World stack = chronological ink/paper layers wiping in on section cues; one
// persistent BroadcastFrame ties it together. VO + ducked MusicBed under it.
//
// Build chunks (gated):  A = beats 0–1  ·  B = beats 2–5  ·  C = beats 6–8
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import timeline from "./timeline.json";
import { BRAND } from "./style";
import {
  World,
  BroadcastFrame,
  MusicBed,
  HeroStat,
  PillSwap,
  BulletChips,
  FootageBeat,
  FootageScrim,
  HoldLine,
  KineticLine,
  WordFlow,
  FlowStamp,
  WatchList,
  CTACard,
  IconSyringe,
  IconCalendar,
  IconFlow,
  IconGauge,
  IconMolecule,
  IconHeart,
  type WorldDef,
} from "./kit";

const B = timeline.beats;
const S = timeline.sections;
const span = (i: number) => ({ from: B[i].startMs, to: B[i].endMs });

// chronological ink/paper world stack — each wipes in on its section's cue
const WORLDS: WorldDef[] = [
  { fromMs: 0, bg: "ink" }, // §0 the "0" hook
  { fromMs: B[1].startMs, bg: "paper", dir: "ttb" }, // §0 the approval
  { fromMs: B[2].startMs, bg: "ink", dir: "ttb" }, // §1–2 problem → race
  { fromMs: B[5].startMs, bg: "paper", dir: "ttb" }, // §3 bigger than cholesterol
  { fromMs: B[6].startMs, bg: "ink", dir: "btt" }, // §3 the thesis
  { fromMs: B[7].startMs, bg: "paper", dir: "ttb" }, // §4 the brief → CTA
];

export const FirstOralPCSK9: React.FC = () => (
  <AbsoluteFill>
    {/* ── background world stack ────────────────────────────────── */}
    {WORLDS.map((w, i) => (
      <World key={i} fromMs={w.fromMs} bg={w.bg} dir={w.dir} />
    ))}

    {/* ── beats (on top of the worlds; each self-gates on its span) ── */}
    {/* §0 · beat 0 — the hook: zero oral PCSK9 inhibitors */}
    <HeroStat
      {...span(0)}
      bg="ink"
      kicker="Oral PCSK9 inhibitors"
      value={0}
      word="Zero"
      line="existed until this week."
      lineCue="existed"
    />

    {/* §0 · beat 1 — the approval: injectable class → first oral pill */}
    <PillSwap
      {...span(1)}
      kicker="FDA approval"
      badge="FDA approved"
      oldLabel="Injectable mAb"
      newLabel="Once-daily pill"
      headline="The first oral version"
      highlight="first oral"
      cues={{ approve: "approved", pill: "pill", injectable: "injectable", first: "first" }}
    />

    {/* §1 · beat 2 — the problem injectables never solved: adherence */}
    <BulletChips
      {...span(2)}
      bg="ink"
      kicker="The problem injectables never solved"
      headline="Adherence"
      headlineMs={18200}
      chips={[
        { label: "Needles", word: "needles", Icon: IconSyringe },
        { label: "Biweekly dosing", word: "biweekly", Icon: IconCalendar },
        { label: "Specialty pharmacy", word: "specialty", Icon: IconFlow },
      ]}
      cues={{ headline: "adherence" }}
    />

    {/* §1 · beat 3 — the fix: a daily pill routes through standard retail pharmacy */}
    <FootageBeat
      {...span(3)}
      src="broll/pharmacy.mp4"
      kicker="A daily pill routes through"
      headline="Standard retail"
      cues={{ headline: "standard" }}
    />

    {/* §2 · beat 4 — the race shifts: AstraZeneca trails, Merck is first */}
    <HoldLine
      {...span(4)}
      kicker="The oral PCSK9 race"
      topLabel="AstraZeneca"
      topState="Trails"
      topWord="AstraZeneca"
      botLabel="Merck"
      botState="First to market"
      botWord="race"
      payoff="Now they trail"
      payoffWord="trail"
      payoffMs={31060}
    />

    {/* §3 · beat 5 — the real signal */}
    <KineticLine
      {...span(5)}
      bg="paper"
      size={88}
      kicker="The real signal is"
      line="Bigger than cholesterol"
      cueWord="bigger"
    />

    {/* §3 · beat 6 — the thesis, over a dim lab b-roll scrim. Two phases:
        premise flows word-by-word, then the payoff STAMPS. */}
    <FootageScrim from={B[6].startMs} to={B[6].endMs} src="broll/lab.mp4" max={0.4} />
    <WordFlow
      from={B[6].startMs}
      to={42000}
      bg="ink"
      size={50}
      kicker="If the mechanism can be reformulated…"
      line="If a monoclonal antibody mechanism can be reformulated into an FDA-approved pill"
    />
    <FlowStamp
      from={41700}
      to={B[6].endMs}
      bg="ink"
      lead="every injectable biologic in chronic care becomes an"
      emphasis="Oral disruption target"
      emphasisCue="oral disruption"
    />

    {/* §4 · beat 7 — what it means: the watchlist for this week's brief */}
    <WatchList
      {...span(7)}
      bg="paper"
      kicker="The full read — this week's BioIntel brief"
      items={[
        { line: "GLP-1s", word: "GLP1s", Icon: IconGauge, ms: 49290 },
        { line: "IL-17", word: "IL-17", Icon: IconMolecule },
        { line: "Merck's cardio franchise", word: "cardio", Icon: IconHeart },
      ]}
    />

    {/* §4 · beat 8 — the CTA end card */}
    <CTACard
      {...span(8)}
      headline="Signal over noise"
      sub="The weekly biotech brief for founders."
      button="Subscribe free"
      link="biointel.com"
    />

    {/* ── persistent broadcast frame ────────────────────────────── */}
    <BroadcastFrame brand={BRAND} kicker="Pharma Signal" sections={S} worlds={WORLDS} />

    {/* ── audio: VO at full + ducked music bed ──────────────────── */}
    <Audio src={staticFile("vo/vo.mp3")} />
    <MusicBed />
  </AbsoluteFill>
);
