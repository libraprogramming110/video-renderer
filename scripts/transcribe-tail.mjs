// transcribe-tail.mjs — re-transcribe the VO from an offset and splice into src/vo-words.json.
//
// Why: whisper.cpp processes audio in 30s windows. On this VO the final window
// (60s+) collapsed the last two sentences into a stretched "Rebuilding it takes
// years." and dropped the CTA entirely. Transcribing the tail as its own file
// puts that content in a fresh window and it comes back correctly.
//
// Cut the offset at a REAL silence boundary (check ffmpeg silencedetect) so no
// word straddles the seam.
//
// Usage: node scripts/transcribe-tail.mjs <offsetSeconds>
import { transcribe, toCaptions } from "@remotion/install-whisper-cpp";
import path from "node:path";
import fs from "node:fs";
import { execFileSync } from "node:child_process";

const PROJECT = process.cwd();
const FF = process.env.FFMPEG_BIN ? path.join(process.env.FFMPEG_BIN, "ffmpeg") : "ffmpeg";
const MODEL = process.env.WHISPER_MODEL ?? "small.en";
const VERSION = "1.5.5";
const WHISPER_DIR = process.env.WHISPER_DIR ?? "C:\\rw\\whisper";

const offsetSec = Number(process.argv[2]);
if (!Number.isFinite(offsetSec)) throw new Error("Usage: node scripts/transcribe-tail.mjs <offsetSeconds>");
const offsetMs = Math.round(offsetSec * 1000);

const voPath = path.join(PROJECT, "public", "vo", "vo.mp3");
const wav = path.join(PROJECT, "public", "vo", "vo.tail.16k.wav");

console.log(`→ extract tail from ${offsetSec}s`);
execFileSync(FF, ["-y", "-ss", String(offsetSec), "-i", voPath, "-ar", "16000", "-ac", "1", "-c:a", "pcm_s16le", wav], {
  stdio: "ignore",
});

const out = await transcribe({
  inputPath: wav,
  whisperPath: WHISPER_DIR,
  whisperCppVersion: VERSION,
  model: MODEL,
  tokenLevelTimestamps: true,
});
const tokens = toCaptions({ whisperCppOutput: out }).captions;
fs.rmSync(wav);

// Merge sub-word tokens into whole words (same rule as transcribe.mjs).
const tail = [];
for (const t of tokens) {
  const startsNew = tail.length === 0 || /^\s/.test(t.text);
  if (startsNew) tail.push({ text: t.text.trim(), start: t.startMs + offsetMs, end: t.endMs + offsetMs });
  else {
    const w = tail[tail.length - 1];
    w.text += t.text;
    w.end = t.endMs + offsetMs;
  }
}
for (const w of tail) w.text = w.text.replace(/\s+/g, " ").trim();

// Drop whisper's blank/noise markers.
const clean = tail.filter((w) => w.text && !/^\[.*\]$/.test(w.text) && !/^[.,!?;:'"-]+$/.test(w.text));

const wordsPath = path.join(PROJECT, "src", "vo-words.json");
// Keep every word that STARTS before the cut (clamping its end to it). Filtering on END dropped
// "more." on AZ x Summit (2026-09-30): whisper had stretched it across the pause past the offset.
const head = JSON.parse(fs.readFileSync(wordsPath, "utf8"))
  .filter((w) => w.start < offsetMs)
  .map((w) => ({ ...w, end: Math.min(w.end, offsetMs) }));

const merged = [...head, ...clean];
fs.writeFileSync(wordsPath, JSON.stringify(merged, null, 2));
console.log(`✓ head ${head.length} words (< ${offsetSec}s) + tail ${clean.length} words = ${merged.length}`);
console.log(`  tail: ${clean.map((w) => w.text).join(" ")}`);
console.log(`  ends ~${(merged[merged.length - 1].end / 1000).toFixed(1)}s`);
