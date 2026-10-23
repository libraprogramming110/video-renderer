// export-srt.mjs — Stage 6: src/timeline.json (captions[]) → out/captions.srt
// (uploadable YouTube CC). Independent of whether captions are also burned in.
//
// The caption lines are already aligned to the VO clock and carry script-verbatim
// text (brand-name fixes baked in upstream), so this is a pure format conversion.

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const timeline = JSON.parse(readFileSync(resolve(ROOT, "src", "timeline.json"), "utf8"));
const caps = timeline.captions ?? [];
if (!caps.length) {
  console.error("No captions in src/timeline.json — run `npm run align` first.");
  process.exit(1);
}

const pad = (n, l = 2) => String(n).padStart(l, "0");
const srtTime = (ms) => {
  ms = Math.max(0, Math.round(ms));
  const h = Math.floor(ms / 3600000); ms %= 3600000;
  const m = Math.floor(ms / 60000); ms %= 60000;
  const s = Math.floor(ms / 1000);
  const msr = ms % 1000;
  return `${pad(h)}:${pad(m)}:${pad(s)},${pad(msr, 3)}`;
};

const srt = caps
  .map((c, i) => `${i + 1}\n${srtTime(c.startMs)} --> ${srtTime(c.endMs)}\n${c.text}\n`)
  .join("\n");

mkdirSync(resolve(ROOT, "out"), { recursive: true });
const outPath = resolve(ROOT, "out", "captions.srt");
writeFileSync(outPath, srt, "utf8");
console.log(`✓ wrote out/captions.srt — ${caps.length} cues, ends ${srtTime(caps[caps.length - 1].endMs)}`);
