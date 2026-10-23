// rms-strip.mjs — the VO's loudness as a TEXT PLOT, with every word onset marked.
// One row per 2s of audio (40 x 50ms bins), levels as ' .:+#' (<-60 / -48 / -38 / -30 / louder dB),
// a '^' under each src/vo-words.json onset and 'index:word@ms' beside it. Every snap failure shape —
// a word parked before its pause, two words on one onset, a word pushed ACROSS a pause — is visible
// at a glance. Read it before writing retime.mjs PINS. (Lilly Onswik long-form, 2026-09-26)
//
// Make the RMS file first (50ms bins at 44.1kHz):
//   ffmpeg -hide_banner -nostats -i public/vo/vo.mp3 -af "aresample=44100,asetnsamples=2205,astats=metadata=1:reset=1,ametadata=print:key=lavfi.astats.Overall.RMS_level" -f null - 2>&1 | grep -o "RMS_level=.*" | sed 's/RMS_level=//' > rms.txt
// Usage: node scripts/rms-strip.mjs rms.txt

import { readFileSync } from "fs";
const rms = readFileSync(process.argv[2], "utf8").trim().split(/\r?\n/).map(Number);
const w = JSON.parse(readFileSync("src/vo-words.json", "utf8"));
const ch = (d) => (!isFinite(d) || d < -60 ? " " : d < -48 ? "." : d < -38 ? ":" : d < -30 ? "+" : "#");
const ROW = 40; // 2s per row
for (let r = 0; r * ROW < rms.length; r++) {
  const a = r * ROW, b = Math.min(rms.length, a + ROW);
  const strip = rms.slice(a, b).map(ch).join("");
  const lab = Array(ROW + 30).fill(" ");
  const names = [];
  w.forEach((t, i) => { const bin = Math.floor(t.start / 50); if (bin >= a && bin < b) { lab[bin - a] = "^"; names.push(`${i}:${t.text}@${t.start}`); } });
  console.log(`${(a * 0.05).toFixed(1).padStart(5)} |${strip}|`);
  console.log(`      ${lab.join("").trimEnd()}  ${names.join(" ")}`);
}
