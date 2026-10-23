// ─────────────────────────────────────────────────────────────────────────
// GSK Hibsago — The Catalyst Brief reel, 2026-10-23. VERTICAL 9:16.
//
// The argument: the FDA approved GSK's Hibsago (bepirovirsen) for chronic
// hepatitis B on Oct 20. 19% functional cure after a SIX-MONTH course, against
// lifelong suppression on today's antivirals (<1% functional cure in a year).
//
// Spine (Stage 3): THE COURSE (kit/course). Six month-tiles that get capped
// (a course that ends) beside a column that never closes (lifelong). Born §1,
// set side by side §2, called back §3, framed §5.
// Source limits (script.md header): "functional cure", never "cured"; no
// "first ever" stamp on the second claim; 240M is worldwide, never eligible.
//
// All sections built (chunks 1-3).
// ─────────────────────────────────────────────────────────────────────────

import React from "react";
import { AbsoluteFill, Audio, staticFile } from "remotion";
import timeline from "./timeline.json";
import { MUSIC } from "./style";
import broll from "./broll.json";
import { BroadcastFrame, CTACard, FootageScrim, MusicBed, World, type WorldDef } from "./kit";
import { CourseHook, CourseVsLife, DifferentFrame, NarrowLabel, TwoFirsts } from "./kit/course";

const clip = (id: string) => broll.find((b) => b.id === id)!.file;
// The VO was recut from -16.31 to -12.1 LUFS (mix-to-target.mjs -12 -16.31). The bed gets the same lift so
// the approved balance holds: SUM -12.0 LUFS / -0.4 dBTP; stitch delivers -12.0 in both upmix cases.
// (bed.mp3 was trimmed -2.8 dB to -2.0 dBTP at intake; the raw source is in public/music/_src.)
const BED_GAIN = 1.62;

// ── the world stack: red · card · ink (footage) · card · red · ink ──
// Every wipe starts inside a MEASURED silence (src/silences.json).
export const WORLDS: WorldDef[] = [
  { fromMs: 0, bg: "red" }, // §1 the hook + the course is born
  { fromMs: 11610, bg: "paper", dir: "ltr", section: true }, // §2 For life — silence 11.60-12.02; "20th." 11.32
  { fromMs: 17560, bg: "ink", dir: "ltr", section: true }, // §3 Two firsts — silence 17.54-17.94; "year." 17.25
  { fromMs: 27840, bg: "paper", dir: "ltr", section: true }, // §4 A narrow label — silence 27.82-28.20; "course." 27.40
  { fromMs: 36130, bg: "red", dir: "ltr", section: true }, // §5 A different frame — silence 36.11-36.45; "levels." 35.77
  { fromMs: 44850, bg: "ink", dir: "ltr" }, // the read + subscribe — silence 44.83-45.23; "frame." 44.45
];

export const Hibsago: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: "#000000" }}>
    {/* ══════════ §1 · NINETEEN PERCENT — the hook, then the course is born ══════════ */}
    <World {...WORLDS[0]}>
      <CourseHook
        from={0}
        to={WORLDS[1].fromMs + 540}
        figure={{ value: 19, suffix: "%", word: "19%" }}
        end={{ word: "That is how" }}
        label={{ text: "Functional cure", word: "cleared chronic" }}
        sub={{ text: "Chronic hepatitis B", word: "chronic hepatitis" }}
        retire={{ word: "after a six-month" }}
        tiles={{ word: "six-month course" }}
        cap={{ word: "course of GSK's" }}
        kicker={{ text: "GSK", word: "GSK's new drug" }}
        name={{ text: "Hibsago", word: "Hibsago, approved" }}
        stamp={{ text: "FDA approved", word: "approved by the" }}
        date={{ text: "Oct 20", word: "October 20th" }}
      />
    </World>

    {/* ══════════ §2 · FOR LIFE — the course beside a column that never closes (the spine) ══════════ */}
    <World {...WORLDS[1]}>
      <CourseVsLife
        from={WORLDS[1].fromMs}
        to={WORLDS[2].fromMs + 540}
        slide={{ word: "Current treatments" }}
        leftLabel="Hibsago"
        rightLabel="Current treatments"
        grow={{ word: "suppressed for life" }}
        pill={{ text: "For life", word: "for life" }}
        back={{ word: "Fewer than" }}
        low={{ text: "<1%", word: "one in a hundred" }}
        high={{ text: "19%", word: "clear it in" }}
        lowSub={{ text: "in a year", word: "a year" }}
      />
    </World>

    {/* ══════════ §3 · TWO FIRSTS — the strand assembles, then the course drops back in ══════════ */}
    <World {...WORLDS[2]} lineArt={false}>
      <FootageScrim from={WORLDS[2].fromMs} to={WORLDS[3].fromMs + 540} src={clip("s3_lab")} max={0.3} />
      <TwoFirsts
        from={WORLDS[2].fromMs}
        to={WORLDS[3].fromMs + 540}
        kicker={{ text: "Hibsago", word: "Hibsago is the" }}
        head={{ text: "First", word: "first antisense" }}
        strand={{ word: "antisense oligonucleotide" }}
        strandLabel={{ text: "Antisense oligonucleotide", word: "antisense oligonucleotide", endWord: "ever approved" }}
        sub={{ text: "approved in chronic hep B", word: "approved in this" }}
        retire={{ word: "and the first drug" }}
        drop={{ word: "drug ever to" }}
        aim={{ lines: ["Targets a", "functional cure"], word: "target a functional" }}
        light={{ word: "six-month course." }}
        tag={{ text: "6-month course", word: "course." }}
      />
    </World>

    {/* ══════════ §4 · A NARROW LABEL — one cut per criterion ══════════ */}
    <World {...WORLDS[3]}>
      <NarrowLabel
        from={WORLDS[3].fromMs}
        to={WORLDS[4].fromMs + 540}
        head={{ pre: "A", hot: "narrow", word: "The label is" }}
        squeeze={{ word: "narrow, adults" }}
        rows={[
          { text: "Adults without cirrhosis", word: "adults without", cut: { word: "cirrhosis, already" } },
          { text: "On antivirals 6+ months", word: "already on antivirals", cut: { word: "six months with" } },
          { text: "Low surface antigen", word: "with low surface", cut: { word: "antigen levels" }, detail: { text: "HBsAg ≤3,000 IU/mL", word: "levels." } },
        ]}
      />
    </World>

    {/* ══════════ §5 · A DIFFERENT FRAME — 240M worldwide, then the course gets framed ══════════ */}
    <World {...WORLDS[4]}>
      <DifferentFrame
        from={WORLDS[4].fromMs}
        to={WORLDS[5].fromMs + 540}
        figure={{ value: 240, word: "240 million" }}
        unit={{ text: "M", word: "million people" }}
        sub={{ text: "people with chronic hep B", word: "people live" }}
        pill={{ text: "Worldwide", word: "worldwide." }}
        retire={{ word: "For an" }}
        block={{ word: "indication that" }}
        life={{ text: "Lifelong", word: "lifelong," }}
        dim={{ word: "that is a" }}
        frame={{ word: "a different frame" }}
        six={{ text: "6 months", word: "different frame" }}
      />
    </World>

    {/* ══════════ the read + subscribe ══════════ */}
    <World {...WORLDS[5]}>
      <CTACard
        from={WORLDS[5].fromMs}
        to={timeline.durationMs + 1200}
        bg="ink"
        headline="The read."
        sub="Winners, losers and the payer calendar, in this week’s Catalyst Brief."
        button="Subscribe free"
        link="thecatalystbrief.com"
        tail="Signal over noise."
        cues={{ logo: "The read on", headline: "The read on", sub: "winners, losers", button: "Subscribe free", tail: "Signal over" }}
        ms={{ link: 49330 }}
      />
    </World>

    <BroadcastFrame
      brand="The Catalyst Brief"
      variant="mark"
      sections={timeline.sections as { index: number; title: string; startMs: number }[]}
      untilMs={WORLDS[5].fromMs}
      worlds={WORLDS}
    />

    <Audio src={staticFile("vo/vo.mp3")} />
    <MusicBed volume={MUSIC.volume * BED_GAIN} />
  </AbsoluteFill>
);
