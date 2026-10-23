// align.mjs — map the VERBATIM script onto Whisper's TIMING → src/timeline.json.
//
// Inputs:  src/vo-words.json (Whisper word timings), src/beats.json, src/sections.json,
//          src/script-meta.json
// Output:  src/timeline.json = { durationMs, fps, meta, sections[], beats[], captions[] }
//          where beats/sections carry start/end ms and captions are running lines.
//
// Method: greedy windowed word-match (script word ↔ whisper word, normalized). Numbers
// differ ("forty-eight" vs "48") so they don't anchor — those gaps are linearly
// interpolated between the many normal-word anchors around them. Beat boundaries sit on
// normal words, so they anchor accurately.

import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const SRC = resolve(dirname(fileURLToPath(import.meta.url)), "..", "src");
const j = (f) => JSON.parse(readFileSync(resolve(SRC, f), "utf8"));

const FPS = 30;
const WINDOW = 12; // how far ahead to search for a word match
const LINE_MAX = 42; // caption line length target (restrained editorial lower-third)

const whisper = j("vo-words.json"); // [{text,start,end}]
const beats = j("beats.json");
const sections = j("sections.json");
const meta = j("script-meta.json");

const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

// Flatten script into display words, each tagged with its beat index.
const sw = [];
for (const b of beats) {
  for (const raw of b.text.split(/\s+/).filter(Boolean)) {
    sw.push({ raw, key: norm(raw), beat: b.index, t: null, e: null });
  }
}

// Greedy anchor matching against the whisper stream.
//
// A SHORT word (≤3 chars: a, the, in, on, it, was…) may only anchor at the very
// next whisper position, never further ahead. Whisper renders spoken numbers as
// digits ("$124" for "a hundred and twenty four dollars"), so a run of script
// words goes unanchored — and a stop-word searching 12 tokens ahead will happily
// match the NEXT sentence's "a", dragging the cursor past everything between.
// One bad stop-word match cascades: on this VO it collapsed 12 words of beat 8
// onto a single ms and put "platform" ~5s after it was spoken. Long words are
// distinctive enough to search the full window; short ones must be contiguous.
const SHORT_KEY = 3;
let wj = 0;
for (const w of sw) {
  if (!w.key) continue;
  let found = -1;
  const reach = w.key.length <= SHORT_KEY ? wj + 1 : wj + WINDOW;
  for (let k = wj; k < Math.min(reach, whisper.length); k++) {
    if (norm(whisper[k].text) === w.key) { found = k; break; }
  }
  if (found >= 0) {
    w.t = whisper[found].start;
    w.e = whisper[found].end;
    wj = found + 1;
  }
}

// Interpolate timing for unanchored words (numbers, compound splits).
const lastEnd = whisper.length ? whisper[whisper.length - 1].end : 0;
for (let i = 0; i < sw.length; i++) {
  if (sw[i].t != null) continue;
  let a = i - 1; while (a >= 0 && sw[a].t == null) a--;
  let b = i + 1; while (b < sw.length && sw[b].t == null) b++;
  const prev = a >= 0 ? sw[a].e : 0;
  const next = b < sw.length ? sw[b].t : lastEnd;
  const span = b - a; // count of gap+1
  const k = i - a;
  const t = Math.round(prev + ((next - prev) * k) / span);
  sw[i].t = t;
  sw[i].e = t;
}

// ── beats: start = first word, end = next beat's start (contiguous) ──
const firstWordOf = {};
const lastWordOf = {};
for (const w of sw) {
  if (!(w.beat in firstWordOf)) firstWordOf[w.beat] = w.t;
  lastWordOf[w.beat] = w.e;
}
const timedBeats = beats.map((b, i) => {
  const start = firstWordOf[b.index] ?? 0;
  const nextStart = i + 1 < beats.length ? firstWordOf[beats[i + 1].index] : null;
  const end = nextStart != null ? nextStart : Math.max(lastWordOf[b.index] ?? start, lastEnd);
  return { ...b, startMs: start, endMs: end };
});

// ── sections: start = their first beat's start ──
const timedSections = sections.map((s) => ({
  index: s.index,
  title: s.title,
  startMs: timedBeats[s.firstBeat]?.startMs ?? 0,
}));

// ── captions: running lines from the script words, grouped ~LINE_MAX + sentence ends ──
const captions = [];
let line = [];
const flush = () => {
  if (!line.length) return;
  captions.push({ words: line, text: line.map((w) => w.raw).join(" ") });
  line = [];
};
let chars = 0;
for (const w of sw) {
  line.push(w);
  chars += w.raw.length + 1;
  if (chars >= LINE_MAX || /[.!?][")]?$/.test(w.raw)) { flush(); chars = 0; }
}
flush();

// ── ORPHAN MERGE (2026-09-23) ────────────────────────────────────────────────
// The flush rule breaks on LINE_MAX **or** a sentence end, so a sentence that
// ends just past the limit strands its tail on a cue of its own. On this VO that
// produced "…strike looks" / "like." and — worse — split the brand across two
// cues: "…in this week's Catalyst" / "Brief.". Pull a short tail back onto the
// line before it whenever the join still reads as one lower-third.
//
// Captions only. `words[]` is untouched, so no cue timing moves.
const HARD_MAX = Math.round(LINE_MAX * 1.35);
let merged = 0;
for (let i = captions.length - 1; i > 0; i--) {
  const cur = captions[i];
  const prev = captions[i - 1];
  if (cur.words.length <= 2 && prev.text.length + 1 + cur.text.length <= HARD_MAX) {
    prev.words = prev.words.concat(cur.words);
    prev.text = prev.words.map((w) => w.raw).join(" ");
    captions.splice(i, 1);
    merged++;
  }
}

const capLines = captions.map((c, i) => ({
  text: c.text,
  startMs: c.words[0].t,
  endMs: i + 1 < captions.length ? captions[i + 1].words[0].t : c.words[c.words.length - 1].e + 400,
})).filter((c) => c.text.trim() && c.endMs > c.startMs);

// ── per-word timings (the VO-sync foundation) — every script word, tagged with its
//    beat, carrying its spoken start/end ms. Scenes look these up to trigger element
//    animations exactly when the word is voiced. ──
const words = sw.map((w) => ({ raw: w.raw, beat: w.beat, startMs: w.t, endMs: w.e }));

const durationMs = Math.max(lastEnd, timedBeats[timedBeats.length - 1]?.endMs ?? 0);
const timeline = { durationMs, fps: FPS, meta, sections: timedSections, beats: timedBeats, words, captions: capLines };
writeFileSync(resolve(SRC, "timeline.json"), JSON.stringify(timeline, null, 2));

// ── report ──
const mmss = (ms) => `${Math.floor(ms / 60000)}:${String(Math.floor((ms % 60000) / 1000)).padStart(2, "0")}`;
console.log(`duration: ${mmss(durationMs)}  ·  ${capLines.length} caption lines\n`);
for (const s of timedSections) console.log(`  ${mmss(s.startMs).padStart(5)}  §  ${s.title}`);
console.log("");
for (const b of timedBeats) {
  const tag = b.cue ? `[${b.cue.type}]` : "";
  console.log(`  ${mmss(b.startMs).padStart(5)}–${mmss(b.endMs)}  ${tag.padEnd(12)} ${b.text.slice(0, 52)}`);
}
console.log(`\n✓ wrote src/timeline.json`);

// ── GUARD: a beat with (near-)zero duration means the transcript LOST it ───────
// Whisper's 30s-window handling can silently truncate the final segment and smear
// the preceding few words across the gap. The beat then aligns to `x–x` and every
// element wired to it has nowhere to live. This is invisible in the report above
// unless you are looking for it, and the word-level "< 40ms token" collapse check
// CANNOT see it — truncation produces the opposite signature (absurdly LONG words).
// Repair: `node scripts/transcribe-tail.mjs <offsetSeconds>`, cutting at a real
// silence boundary from `ffmpeg -af silencedetect`, then re-run this script.
// (Vykat XR long-form, 2026-08-14 — the whole CTA beat aligned to 1:07–1:07.)
const MIN_BEAT_MS = 500;
const starved = timedBeats.filter((b) => b.endMs - b.startMs < MIN_BEAT_MS);
if (starved.length) {
  console.log(`\n⚠️  ${starved.length} beat(s) under ${MIN_BEAT_MS}ms — the transcript probably lost them:`);
  for (const b of starved) {
    console.log(`   beat ${b.index}  ${mmss(b.startMs)}–${mmss(b.endMs)}  (${b.endMs - b.startMs}ms)  "${b.text.slice(0, 60)}"`);
  }
  console.log(`   → check the tail with:  ffmpeg -i public/vo/vo.mp3 -af silencedetect=noise=-38dB:d=0.6 -f null -`);
  console.log(`   → then splice:          node scripts/transcribe-tail.mjs <offsetSeconds>`);
  console.log(`   (padding the audio does NOT fix this — it is a window artefact, not tail silence)`);
}

// A long word is the other half of the same tell: real speech rarely holds a
// single token past ~2.5s, so a smeared token flags the region to isolate.
const smeared = words.filter((w) => w.endMs - w.startMs > 2500);
if (smeared.length) {
  console.log(`\n⚠️  ${smeared.length} suspiciously long word(s) — possible smear across a dropped segment:`);
  for (const w of smeared.slice(0, 8)) {
    console.log(`   "${w.raw}"  ${mmss(w.startMs)}  (${((w.endMs - w.startMs) / 1000).toFixed(1)}s)`);
  }
}
