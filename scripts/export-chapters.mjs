// export-chapters.mjs — Stage 6: src/timeline.json (sections[]) → out/chapters.txt
// The YouTube description chapter list, e.g.
//   0:00  The Shift
//   0:25  What Happened
//   1:02  From Platforms to Mechanisms
// Section TITLES are the script's `##` headings (verbatim); TIMES are when each
// section's first beat is spoken in the VO. YouTube requires the FIRST chapter to be
// 0:00 and at least 3 chapters total.

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const timeline = JSON.parse(readFileSync(resolve(ROOT, "src", "timeline.json"), "utf8"));
const sections = (timeline.sections ?? []).slice().sort((a, b) => a.startMs - b.startMs);

if (sections.length < 3) {
  console.error(`YouTube needs ≥3 chapters; timeline has ${sections.length}. Not writing.`);
  process.exit(1);
}

const pad = (n) => String(n).padStart(2, "0");
const ytTime = (ms) => {
  ms = Math.max(0, Math.round(ms));
  const h = Math.floor(ms / 3600000); ms %= 3600000;
  const m = Math.floor(ms / 60000); ms %= 60000;
  const s = Math.floor(ms / 1000);
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`;
};

const lines = sections.map((s, i) => {
  const t = i === 0 ? 0 : s.startMs; // YouTube requires the first chapter at 0:00
  return `${ytTime(t)}  ${s.title}`;
});

mkdirSync(resolve(ROOT, "out"), { recursive: true });
const outPath = resolve(ROOT, "out", "chapters.txt");
writeFileSync(outPath, lines.join("\n") + "\n", "utf8");
console.log(`✓ wrote out/chapters.txt — ${sections.length} chapters\n`);
console.log(lines.join("\n"));
