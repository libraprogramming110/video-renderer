// anchor-audit.mjs — per-video: every timeline word should start on a whisper token start.
// A word whose startMs matches no token start was interpolated (or snapped off a token).
import { readFileSync } from "fs";
const tl = JSON.parse(readFileSync("src/timeline.json", "utf8"));
const vo = JSON.parse(readFileSync("src/vo-words.json", "utf8"));
const starts = new Set(vo.map((w) => w.start));
const off = tl.words.filter((w) => !starts.has(w.startMs));
console.log(`${tl.words.length - off.length}/${tl.words.length} words on a whisper token start`);
off.forEach((w) => console.log(`  off-token: ${w.raw.padEnd(16)} @${w.startMs}ms (beat ${w.beat})`));
