// Step 0 — Make a fresh run buildable on any machine. Auto-fixes the safe
// things (npm install, rspack native binary); detects + instructs for the
// system tools (ffmpeg, Whisper). Run once per run folder.

import { execSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const ok = (m) => console.log(`✓ ${m}`);
const warn = (m) => console.log(`!  ${m}`);

// 1) npm install
if (!fs.existsSync("node_modules")) {
  console.log("→ npm install …");
  execSync("npm install", { stdio: "inherit" });
}
ok("dependencies installed");

// 2) rspack native binary (npm's optional-deps bug drops it sometimes)
const triple = {
  "win32-x64": "win32-x64-msvc",
  "darwin-arm64": "darwin-arm64",
  "darwin-x64": "darwin-x64",
  "linux-x64": "linux-x64-gnu",
  "linux-arm64": "linux-arm64-gnu",
}[`${process.platform}-${process.arch}`];
try {
  const ver = JSON.parse(fs.readFileSync("node_modules/@rspack/binding/package.json")).version;
  const pkg = `@rspack/binding-${triple}`;
  if (triple && !fs.existsSync(path.join("node_modules", "@rspack", `binding-${triple}`))) {
    console.log(`→ installing ${pkg}@${ver} …`);
    execSync(`npm install --no-save ${pkg}@${ver}`, { stdio: "inherit" });
  }
  ok(`rspack binary (${triple})`);
} catch {
  warn("could not verify @rspack/binding — render may need the platform binary");
}

// 3) ffmpeg (used by analyze + transcribe + finalize)
const ff = process.env.FFMPEG_BIN ? path.join(process.env.FFMPEG_BIN, "ffmpeg") : "ffmpeg";
if (spawnSync(ff, ["-version"], { encoding: "utf8" }).status === 0) {
  ok("ffmpeg found");
} else {
  warn(
    "ffmpeg NOT found. Install it, then set FFMPEG_BIN if it's not on PATH:\n" +
      "   macOS:   brew install ffmpeg\n" +
      "   Windows: winget install --id Gyan.FFmpeg --source winget\n" +
      "   Linux:   sudo apt install ffmpeg"
  );
}

// 4) Whisper cache (transcribe.mjs installs on first run; just report)
const isWin = process.platform === "win32";
const wdir =
  process.env.WHISPER_DIR ?? (isWin ? "C:\\rw\\whisper" : "~/.cache/reel-whisper");
console.log(`i  Whisper model caches at ${wdir} (downloaded once, reused weekly).`);
if (isWin) console.log("i  Windows: keep the Whisper path space-free (default C:\\rw\\whisper).");

// 5) Outro — measure the supplied outro.mp4 so the timeline plays it in full (no
//    hardcoded length) and can fit it to the canvas. Writes src/outro.json (with
//    duration + dimensions); falls back if absent.
const outroPath = path.join("public", "assets", "outro.mp4");
const outroJson = path.join("src", "outro.json");
const ffprobe = process.env.FFMPEG_BIN ? path.join(process.env.FFMPEG_BIN, "ffprobe") : "ffprobe";
if (fs.existsSync(outroPath)) {
  const probe = spawnSync(
    ffprobe,
    ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", outroPath],
    { encoding: "utf8" }
  );
  const dimOut = spawnSync(
    ffprobe,
    ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0:s=x", outroPath],
    { encoding: "utf8" }
  ).stdout.trim();
  const [width, height] = dimOut.split("x").map((n) => parseInt(n, 10));
  const secs = parseFloat((probe.stdout || "").trim());
  if (probe.status === 0 && secs > 0) {
    const fps = 30; // matches style.ts FORMAT.fps
    const durationInFrames = Math.round(secs * fps);
    const json = { durationInFrames };
    if (width && height) Object.assign(json, { width, height });
    fs.writeFileSync(outroJson, JSON.stringify(json, null, 2) + "\n");
    ok(`outro measured: ${secs.toFixed(2)}s → ${durationInFrames} frames${width ? `, ${width}x${height}` : ""}`);
  } else {
    warn("could not probe outro.mp4 — keeping the existing src/outro.json fallback");
  }
} else {
  warn("no public/assets/outro.mp4 — keeping the existing src/outro.json fallback");
}

console.log("\n✓ Bootstrap done. Next: add clips to public/, then npm run transcribe.");
