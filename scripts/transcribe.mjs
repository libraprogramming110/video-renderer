// Transcribe the single VO track with Whisper → src/vo-words.json (word-timed).
// Long-form uses ONE voiceover (public/vo/vo.mp3), not per-scene clips. The script
// text is the source of truth for wording; Whisper is used only for TIMING, which
// align.mjs maps onto the verbatim script.
//
// Env: WHISPER_DIR (default C:\rw\whisper — space-free), WHISPER_MODEL (small.en), FFMPEG_BIN.

import {
  installWhisperCpp,
  downloadWhisperModel,
  transcribe,
  toCaptions,
} from "@remotion/install-whisper-cpp";
import os from "node:os";
import path from "node:path";
import fs from "node:fs";
import { execFileSync } from "node:child_process";

const PROJECT = process.cwd();
const isWin = process.platform === "win32";
const FF = process.env.FFMPEG_BIN ? path.join(process.env.FFMPEG_BIN, "ffmpeg") : "ffmpeg";
const MODEL = process.env.WHISPER_MODEL ?? "small.en";
const VERSION = "1.5.5";
const WHISPER_DIR =
  process.env.WHISPER_DIR ??
  (isWin ? "C:\\rw\\whisper" : path.join(os.homedir(), ".cache", "reel-whisper"));

fs.mkdirSync(path.dirname(WHISPER_DIR), { recursive: true });
console.log(`→ Whisper cache: ${WHISPER_DIR} (model ${MODEL})`);
const origCwd = process.cwd();
process.chdir(path.dirname(WHISPER_DIR)); // space-free cwd for the unzip step
await installWhisperCpp({ to: WHISPER_DIR, version: VERSION });
await downloadWhisperModel({ model: MODEL, folder: WHISPER_DIR });
process.chdir(origCwd);

// Find the VO file (mp3/wav/m4a) in public/vo/.
const voDir = path.join(PROJECT, "public", "vo");
const voFile = fs.readdirSync(voDir).find((f) => /^vo\.(mp3|wav|m4a)$/i.test(f));
if (!voFile) throw new Error("No public/vo/vo.{mp3,wav,m4a} found.");
const voPath = path.join(voDir, voFile);
const wav = path.join(voDir, "vo.16k.wav");

console.log(`→ extract 16k wav from ${voFile}`);
execFileSync(FF, ["-y", "-i", voPath, "-ar", "16000", "-ac", "1", "-c:a", "pcm_s16le", wav], {
  stdio: "ignore",
});

console.log(`→ transcribe (this takes a few minutes)…`);
const out = await transcribe({
  inputPath: wav,
  whisperPath: WHISPER_DIR,
  whisperCppVersion: VERSION,
  model: MODEL,
  tokenLevelTimestamps: true,
});
const tokens = toCaptions({ whisperCppOutput: out }).captions;
fs.rmSync(wav);

// Merge Whisper sub-word tokens into whole words (a token starting with whitespace
// begins a new word) → flat [{ text, start, end }] in ms.
const words = [];
for (const t of tokens) {
  const startsNew = words.length === 0 || /^\s/.test(t.text);
  if (startsNew) words.push({ text: t.text.trim(), start: t.startMs, end: t.endMs });
  else {
    const w = words[words.length - 1];
    w.text += t.text;
    w.end = t.endMs;
  }
}
for (const w of words) w.text = w.text.replace(/\s+/g, " ").trim();

fs.writeFileSync(path.join(PROJECT, "src", "vo-words.json"), JSON.stringify(words, null, 2));
const dur = words.length ? (words[words.length - 1].end / 1000).toFixed(1) : 0;
console.log(`✓ Wrote src/vo-words.json — ${words.length} words, ends ~${dur}s.`);
