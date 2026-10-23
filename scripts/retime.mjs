// ⚠️ PER-VIDEO — EDIT THE PINS TABLE. Ships EMPTY. Even empty it is a CHECK: it exits 1
// and lists every pair of words whisper stacked on one onset, which you then pin.
// retime.mjs — pin word onsets that whisper AND snap-onsets got wrong, read off the
// VO's WAVEFORM (not the transcript). Run AFTER snap-onsets, BEFORE align:
//
//   transcribe -> fix-mishears -> snap-onsets src/silences.json -> retime -> align
//
// Why it exists (Novartis x BoomRay, 2026-09-26): anchor-audit reported 106/106 words
// "on a whisper token start" — TRUE, and useless, because the TOKENS were wrong. Three
// failure shapes snap-onsets cannot see or makes worse:
//   1. A token that starts just BEFORE a silence ("That's" at 2.00, silence 2.08-2.75):
//      snap only moves starts INSIDE a silence, so it is never touched.
//   2. A sentence-final word snapped BACK to the silence START ("read?" 35.64 -> 34.78,
//      "Brief." -> 50.75). The silence start is where the word ENDS, so the snap parks
//      its onset late — or, for "The read?", on the wrong side of the pause entirely.
//   3. Drift inside continuous speech ("Novartis" at 36.08 when it starts at 36.95);
//      no silence is involved, so nothing flags it.
// 27 pins on a 54.7s VO. The ones that mattered: a section opener 0.9s early, the
// emphasis phrase ~0.5s early, and two stacked words collapsed onto one onset.
//
// HOW TO READ ONSETS — the 50ms RMS profile. Speech resumes where the level jumps
// from ~-75 to ~-25 dB; a word boundary inside speech is a dip (~-35 to -55 dB):
//
//   ffmpeg -hide_banner -nostats -ss 33.8 -to 37.4 -i public/vo/vo.mp3 \
//     -af "asetnsamples=2205,astats=metadata=1:reset=1,ametadata=print:key=lavfi.astats.Overall.RMS_level" \
//     -f null - 2>&1 | grep -o "RMS_level=.*"
//
// (2205 samples = 50ms at 44.1kHz; each printed line is the next 50ms window from -ss.)
//
// The silences JSON snap-onsets needs ([startSec,endSec] pairs), from the same VO:
//   ffmpeg -i public/vo/vo.mp3 -af silencedetect=noise=-35dB:d=0.15 -f null - 2>&1
//   -> pair each silence_start with the next silence_end.
//
// Each pin: [token index in src/vo-words.json, the text it must carry (guard), new
// start ms]. The guard makes a stale index fail loudly instead of retiming the wrong
// word. Idempotent: re-running with the same table writes the same result.
// Then run anchor-audit.mjs — and scrub, because an audit of token starts cannot tell
// you the token was right.

import { readFileSync, writeFileSync } from "fs";
const F = "src/vo-words.json";
const v = JSON.parse(readFileSync(F, "utf8"));

const PINS = [
  // [index, "text", startMs],  // why: the silence / dip you read it from
  // GSK Hibsago reel (2026-10-23): whisper ~0.3s late at phrase heads; heads = first bin >= -34 dB after the pause.
  [1, "That", 2000], [2, "is", 2308], [3, "how", 2457], [4, "many", 2680], [5, "patients", 2988],  // pause ends 1.99, dips 2.30 / 2.85
  [6, "cleared", 3604], [7, "chronic", 4136], [8, "hepatitis", 4720], [9, "B", 5357], [10, "after", 5432], [11, "a", 5814], [12, "six-month", 5889],
  [26, "Current", 12030], [27, "treatments", 12400], [28, "keep", 12870], [29, "the", 13030], [30, "virus", 13200],  // pause ends 12.02
  [31, "suppressed", 13650], [32, "for", 14350], [33, "life.", 14480],  // dips 13.60, 14.35; raw "life." sat past the 14.73 pause
  [34, "Fewer", 15050], [35, "than", 15350], [36, "one", 15600], [37, "in", 15950], [38, "a", 16050], [39, "hundred", 16200],  // dips 15.35 / 15.60 / 15.95-16.15
  [40, "clear", 16700], [41, "it", 16900], [42, "in", 17100], [43, "a", 17200], [44, "year.", 17250],  // snap pushed "in a" across the 17.54 pause
  [45, "Hibsago", 17950], [46, "is", 18850], [47, "the", 18950], [48, "first", 19100], [49, "antisense", 19500],  // pause ends 17.94, dips 18.80 / 19.40
  [65, "cure", 26100], [66, "in", 26480], [67, "a", 26600], [68, "six-month", 26660], [69, "course.", 27400],  // dips 26.05 / 26.45 / 27.30
  [90, "But", 36450], [91, "240", 36600],  // dip 36.55
  [97, "hep", 39550], [98, "B", 39800], [99, "worldwide.", 40050],  // dips 39.50 / 39.75 / 40.00; raw B + worldwide stacked 80ms apart
  [100, "For", 41200], [103, "that", 42150], [104, "was", 42400], [105, "lifelong,", 42650],  // dips 42.10 / 42.55
  [106, "that", 43352], [110, "frame.", 44450],  // pause ends 43.35; dip 44.40
  [111, "The", 45234], [126, "Subscribe", 50450], [127, "free.", 51050], [128, "Signal", 51680],  // pause ends 45.23 / 50.45 / 51.68; dip 51.00
];

for (const [i, text, ms] of PINS) {
  if (v[i].text !== text) { console.error(`GUARD FAIL [${i}] expected ${text}, got ${v[i].text}`); process.exit(1); }
  console.log(`  [${i}] ${text.padEnd(14)} ${v[i].start} -> ${ms}`);
  v[i].start = ms;
}
// ends: each word ends where the next starts (keeps the last word's own end)
for (let i = 0; i < v.length - 1; i++) v[i].end = Math.max(v[i].start, Math.min(v[i].end, v[i + 1].start));
for (const [i] of PINS) if (i > 0) v[i - 1].end = Math.min(v[i - 1].end, v[i].start);
// STRICTLY increasing: two words on one onset is a collapse, not a timing.
const mono = v.every((w, i) => i === 0 || w.start > v[i - 1].start);
console.log(`${PINS.length} pin(s). strictly increasing starts: ${mono ? "YES" : "NO — FIX"}`);
if (!mono) {
  v.forEach((w, i) => { if (i && w.start <= v[i - 1].start) console.log(`  collapse: [${i - 1}] ${v[i - 1].text} ${v[i - 1].start} | [${i}] ${w.text} ${w.start}`); });
  process.exit(1);
}
// NEAR-collapses: whisper stacks a short word on its neighbour a few ms apart ("A"/"gap" 8ms,
// "If"/"weekly" 7ms, "New"/"England" 2ms on the Onswik horizontal, 2026-09-27). Strictly
// increasing passes them, yet the second word is really 100-300ms later. Listed, not fatal:
// pin the ones that carry a cue (read the dip in rms-strip), leave the rest.
const near = v.map((w, i) => (i && w.start - v[i - 1].start < 80 ? i : -1)).filter((i) => i > 0);
if (near.length) {
  console.log(`  ${near.length} near-collapse(s) <80ms — pin any that carry a cue:`);
  near.forEach((i) => console.log(`    [${i - 1}] ${v[i - 1].text} ${v[i - 1].start} | [${i}] ${v[i].text} ${v[i].start} (+${v[i].start - v[i - 1].start}ms)`));
}
writeFileSync(F, JSON.stringify(v, null, 2));
