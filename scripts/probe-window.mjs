// _probe-window.mjs — scratch probe: transcribe ONE window of the VO in a fresh Whisper window and print
// its words in VO time. Does not splice anything. (AbbVie 2026-10-22 shape, rewritten for this run.)
// Usage: node scripts/_probe-window.mjs <startSec> <endSec> [out.json]   env WHISPER_MODEL (default small.en)
import { execFileSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { transcribe, toCaptions } from "@remotion/install-whisper-cpp";

const [a, b, outFile] = process.argv.slice(2);
const start = +a, end = +b;
const LEAD = 1; // seconds of silence before the window, so the first word is not clipped
const WHISPER_DIR = process.env.WHISPER_DIR || "C:/rw/whisper";
const MODEL = process.env.WHISPER_MODEL || "small.en";
const VERSION = "1.5.5";
const wav = path.resolve("public/vo/probe.16k.wav");

execFileSync("ffmpeg", ["-y", "-ss", String(start), "-to", String(end), "-i", "public/vo/vo.mp3",
  "-af", `adelay=${LEAD * 1000},apad=pad_dur=1`, "-ar", "16000", "-ac", "1", "-c:a", "pcm_s16le", wav], { stdio: "ignore" });
const out = await transcribe({ inputPath: wav, whisperPath: WHISPER_DIR, whisperCppVersion: VERSION, model: MODEL, tokenLevelTimestamps: true });
fs.rmSync(wav);

const words = [];
for (const t of toCaptions({ whisperCppOutput: out }).captions) {
  const ms = (x) => Math.round(x + (start - LEAD) * 1000);
  if (words.length === 0 || /^\s/.test(t.text)) words.push({ text: t.text.trim(), start: ms(t.startMs), end: ms(t.endMs) });
  else { const w = words[words.length - 1]; w.text += t.text; w.end = ms(t.endMs); }
}
for (const w of words) console.log(`${String(w.start).padStart(7)} ${String(w.end).padStart(7)}  ${w.text}`);
if (outFile) fs.writeFileSync(outFile, JSON.stringify(words, null, 2));
