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
let wj = 0;
for (const w of sw) {
  if (!w.key) continue;
  let found = -1;
  for (let k = wj; k < Math.min(wj + WINDOW, whisper.length); k++) {
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
