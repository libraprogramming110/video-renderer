// boost-vo.mjs — make the voiceover LOUDER the way that actually works.
//
// The naive move (raise the Remotion volume multiplier, or just gain the file)
// does nothing useful here: the delivery mux in render.yml runs a two-pass
// loudnorm, so whatever you hand it gets normalised back to the LUFS target.
// Gain above the peak only clips.
//
// What moves perceived loudness at a FIXED LUFS target is CREST FACTOR. This VO
// measured I=-20.2 LUFS with a true peak of -0.4 dBFS — 19.8 dB of crest. Those
// isolated peaks are what stop loudnorm reaching the target cleanly (it has to
// respect the TP ceiling), so the body of the speech stays quiet. Compressing
// FIRST pulls the peaks down, which lets the delivery pass lift the whole thing.
//
// Order matters: acompressor BEFORE loudnorm, never after.
//
// Always re-reads public/vo/vo.src.mp3 (created on first run) so repeat
// invocations can't stack compression on top of already-compressed audio.
//
// Usage: node scripts/boost-vo.mjs [targetLUFS] [targetTP]
//   defaults: -16 LUFS / -3 dBTP — deliberate HEADROOM, because the delivery
//   pass in render.yml is what sets the final loudness. Handing the Remotion
//   mix something already at -14/-1 leaves no room if a music bed is added.

import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const FF = process.env.FFMPEG_BIN ? path.join(process.env.FFMPEG_BIN, "ffmpeg") : "ffmpeg";
const FP = process.env.FFMPEG_BIN ? path.join(process.env.FFMPEG_BIN, "ffprobe") : "ffprobe";

const I = process.argv[2] ?? "-16";
const TP = process.argv[3] ?? "-3";
const LRA = "7";

const VO_DIR = path.resolve("public", "vo");
const OUT = path.join(VO_DIR, "vo.mp3");
const SRC = path.join(VO_DIR, "vo.src.mp3");

// Preserve the untouched original once, then always work from it.
if (!fs.existsSync(SRC)) {
  fs.copyFileSync(OUT, SRC);
  console.log("→ preserved original as public/vo/vo.src.mp3");
}

const COMP = "acompressor=threshold=-20dB:ratio=3.5:attack=5:release=150:knee=6:makeup=1";

const sh = (args) => execFileSync(FF, args, { encoding: "utf8", stdio: ["ignore", "pipe", "pipe"] });
// loudnorm prints its JSON to STDERR and ffmpeg exits 0, so execFileSync (which
// returns stdout only, and surfaces stderr just on a throw) sees nothing.
// spawnSync hands back both streams regardless of exit code.
const measure = (file, filter) => {
  const r = spawnSync(
    FF,
    ["-hide_banner", "-nostats", "-i", file, "-af", `${filter}loudnorm=I=${I}:TP=${TP}:LRA=${LRA}:print_format=json`, "-f", "null", "-"],
    { encoding: "utf8" }
  );
  const log = `${r.stderr ?? ""}${r.stdout ?? ""}`;
  const m = log.match(/\{[\s\S]*?\}/);
  if (!m) throw new Error(`loudnorm measurement failed for ${file}\n${log.slice(-600)}`);
  return JSON.parse(m[0]);
};
const probe = (f) => {
  const out = execFileSync(FP, ["-v", "error", "-show_entries", "format=duration", "-of", "default=nw=1:nk=1", f], { encoding: "utf8" });
  return Number(out.trim());
};

const before = measure(SRC, "");
console.log(`before   I=${before.input_i} LUFS  TP=${before.input_tp} dBFS  LRA=${before.input_lra}`);

// pass 1: measure the COMPRESSED signal (not the raw one) so pass 2 corrects
// for what the compressor actually did
const m = measure(SRC, `${COMP},`);
console.log(`compressed I=${m.input_i} LUFS  TP=${m.input_tp} dBFS  LRA=${m.input_lra}`);

const ln =
  `loudnorm=I=${I}:TP=${TP}:LRA=${LRA}` +
  `:measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}` +
  `:measured_thresh=${m.input_thresh}:offset=${m.target_offset}:linear=true`;

const tmp = path.join(VO_DIR, "vo.boost.mp3");
sh(["-y", "-i", SRC, "-af", `${COMP},${ln}`, "-ar", "44100", "-ac", "1", "-c:a", "libmp3lame", "-b:a", "192k", tmp]);

const dSrc = probe(SRC);
const dOut = probe(tmp);
if (Math.abs(dSrc - dOut) > 0.05) {
  // A duration change would slide every cue in the video off its spoken word.
  fs.rmSync(tmp);
  throw new Error(`duration changed ${dSrc}s -> ${dOut}s — refusing to replace the VO (timeline would drift)`);
}

fs.rmSync(OUT);
fs.renameSync(tmp, OUT);

const after = measure(OUT, "");
console.log(`after    I=${after.input_i} LUFS  TP=${after.input_tp} dBFS  LRA=${after.input_lra}`);
console.log(`crest    ${(before.input_tp - before.input_i).toFixed(1)} dB -> ${(after.input_tp - after.input_i).toFixed(1)} dB`);
console.log(`duration ${dSrc.toFixed(3)}s (unchanged)  ·  wrote public/vo/vo.mp3`);
