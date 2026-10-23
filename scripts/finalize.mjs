// Stage 6 — Finalize: normalize loudness to social levels (~-14 LUFS) and
// clean up the run (keep the final MP4, drop drafts/stills/b-roll downloads).
//
// Usage: node scripts/finalize.mjs <input.mp4> <output.mp4>
// Env:   FFMPEG_BIN (folder with ffmpeg, if not on PATH)

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const [input, output] = process.argv.slice(2);
if (!input || !output) {
  console.error("Usage: node scripts/finalize.mjs <input.mp4> <output.mp4>");
  process.exit(1);
}
const FF = process.env.FFMPEG_BIN ? path.join(process.env.FFMPEG_BIN, "ffmpeg") : "ffmpeg";

// Loudness normalize the mix (video copied, audio re-encoded).
console.log("→ Loudness normalizing to -14 LUFS …");
const r = spawnSync(
  FF,
  ["-y", "-i", input, "-af", "loudnorm=I=-14:TP=-1.5:LRA=11", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", output],
  { stdio: "inherit" }
);
if (r.status !== 0) {
  console.error("✗ loudnorm failed");
  process.exit(1);
}
console.log(`✓ Wrote ${output}`);

// Cleanup: keep ONLY the final MP4 in out/; remove drafts + stills.
const outDir = path.dirname(output);
const finalName = path.basename(output);
let removed = 0;
for (const f of fs.readdirSync(outDir)) {
  if (f !== finalName) {
    fs.rmSync(path.join(outDir, f), { recursive: true, force: true });
    removed++;
  }
}
console.log(`✓ Cleaned ${removed} intermediate file(s). Kept ${finalName}.`);
console.log("i  public/broll/ is kept so you can re-render; delete it to reclaim space.");
