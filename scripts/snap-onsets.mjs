// Generic: takes a silences JSON (from ffmpeg silencedetect) as its argument. No
// per-video constants — but ALWAYS read its printed diff before accepting the result.
// snap-onsets.mjs — repair whisper.cpp segment-boundary onsets against the WAVEFORM.
//
// Why: whisper.cpp rounds each 30s-window segment's first word DOWN to the whole
// second, which parks that word inside the preceding pause. On this VO that put
// "Summit" (beat 4) at 36.000s when the voice resumes at 37.026s — a world wipe a
// full second before the line is spoken. The transcript alone cannot reveal this
// (gotchas: "the transcript LIES about silence"), so the silence map from
// `ffmpeg silencedetect` is the source of truth.
//
// Rule: a word whose START falls inside a measured silence gets snapped to the edge
// its SENTENCE belongs to — whisper stuffs BOTH the outgoing sentence's last word
// and the incoming sentence's first word into the same gap, so a single direction is
// wrong half the time. A word carrying sentence-final punctuation (. ! ?) belongs to
// the outgoing line and snaps BACK to the silence start; every other word is the head
// of the incoming line and snaps FORWARD to the silence end. The affected run is then
// redistributed linearly up to the next word that already starts later, so starts stay
// monotonic by construction and no derived interpolate() range can go backwards.
//
// Usage: node scripts/snap-onsets.mjs "<silences.json>"   (array of [startSec,endSec])

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const WORDS = resolve("src", "vo-words.json");
const silences = JSON.parse(readFileSync(process.argv[2], "utf8")).map(([a, b]) => [
  Math.round(a * 1000),
  Math.round(b * 1000),
]);

const words = JSON.parse(readFileSync(WORDS, "utf8"));
const before = words.map((w) => w.start);

// 1. Snap any word starting inside a silence to the edge its sentence belongs to.
const FINAL = /[.!?]["')\]]?$/; // sentence-final punctuation => outgoing line
const snapped = [];
words.forEach((w, i) => {
  const sil = silences.find(([s, e]) => w.start > s && w.start < e);
  if (!sil) return;
  const back = FINAL.test(w.text);
  // Backward snap must not precede the word before it; forward snap is always safe.
  const target = back ? Math.max(sil[0], i > 0 ? words[i - 1].start : 0) : sil[1];
  snapped.push({ text: w.text, from: w.start, to: target, dir: back ? "back" : "fwd" });
  w.start = target;
});

// 2. Restore monotonic starts. Where a snap overtook following words, redistribute
//    that run evenly between the snapped value and the next genuinely-later word.
for (let i = 1; i < words.length; i++) {
  if (words[i].start >= words[i - 1].start) continue;
  let k = i;
  while (k < words.length && words[k].start <= words[i - 1].start) k++;
  const lo = words[i - 1].start;
  const hi = k < words.length ? words[k].start : lo + (k - i + 1) * 60;
  const n = k - i + 1;
  for (let m = i; m < k; m++) words[m].start = Math.round(lo + ((hi - lo) * (m - i + 1)) / n);
}

// 3. Ends follow starts (a word ends no later than the next one begins).
for (let i = 0; i < words.length; i++) {
  const nextStart = i + 1 < words.length ? words[i + 1].start : Infinity;
  if (words[i].end < words[i].start) words[i].end = words[i].start;
  if (words[i].end > nextStart) words[i].end = nextStart;
}

// ── report ──
console.log("SNAPPED (start was inside a measured silence):");
for (const s of snapped) console.log(`  ${s.dir.toUpperCase().padEnd(5)} ${s.text.padEnd(18)} ${s.from} -> ${s.to}   (${s.to - s.from >= 0 ? "+" : ""}${s.to - s.from}ms)`);
console.log("\nALL CHANGES:");
let changed = 0;
words.forEach((w, i) => {
  if (w.start !== before[i]) {
    changed++;
    console.log(`  [${String(i).padStart(3)}] ${w.text.padEnd(18)} ${before[i]} -> ${w.start}`);
  }
});
const mono = words.every((w, i) => i === 0 || w.start >= words[i - 1].start);
console.log(`\n${changed} words retimed. monotonic starts: ${mono ? "YES" : "NO — FIX"}`);
if (!mono) process.exit(1);

writeFileSync(WORDS, JSON.stringify(words, null, 2));
console.log("wrote src/vo-words.json");
