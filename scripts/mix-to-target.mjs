// mix-to-target.mjs — recut the VO so the VO+bed SUM lands on a loudness target, keeping the
// VO/bed balance the operator approved in the previews. (AstraZeneca x Summit, 2026-10-05; the
// method is RETROSPECTIVE 2026-10-05 "cut the MIX to the target, then let the stitch be an identity".)
//
//   node scripts/mix-to-target.mjs [targetLUFS=-12.1] [approvedVoLUFS]
//
// Always recuts from public/vo/vo.src.mp3 (never from an already-processed vo.mp3). The chain is
// volume -> acompressor 2:1 -> gain (BISECTED) -> oversampled alimiter (level=0). For each gain it
// encodes the mp3, measures it, raises the bed by the same number of dB the VO rose over the
// approved cut, and measures the SUM after the lossy encode. Prints BED_GAIN for the composition
// and simulates the stitch (two-pass loudnorm + AAC) for both mono-upmix cases.
import { execFileSync, spawnSync } from "node:child_process";
import fs from "node:fs";

const TARGET = Number(process.argv[2] ?? -12.1);
const SRC = "public/vo/vo.src.mp3";
const OUT = "public/vo/vo.mp3";
const BED = "public/music/bed.mp3";
const BED_VOL = 0.14; // style.ts MUSIC.volume
const TMP = "out/_vo_try.mp3";
fs.mkdirSync("out", { recursive: true });

const measure = (args) => {
  const r = spawnSync("ffmpeg", ["-hide_banner", "-nostats", ...args, "-f", "null", "-"], { encoding: "utf8" });
  const tail = r.stderr.slice(r.stderr.lastIndexOf("Summary:"));
  return { I: Number(/I:\s+(-?[\d.]+) LUFS/.exec(tail)[1]), TP: Number(/Peak:\s+(-?[\d.]+) dBFS/.exec(tail)[1]) };
};
const APPROVED = Number(process.argv[3] ?? measure(["-i", OUT, "-af", "ebur128=peak=true"]).I);
console.log(`approved VO cut: ${APPROVED} LUFS · target SUM: ${TARGET} LUFS`);

const chain = (g) => `volume=12dB,acompressor=threshold=-14dB:ratio=2:attack=5:release=80:makeup=1,volume=${g}dB,aresample=192000,alimiter=limit=0.75:level=0:attack=5:release=50,aresample=44100`;
const cut = (g, file) => execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-i", SRC, "-af", chain(g), "-c:a", "libmp3lame", "-b:a", "192k", file]);
const sum = (file, bedGain, dup) =>
  measure(["-i", file, "-i", BED, "-filter_complex",
    `${dup ? "[0:a]pan=stereo|c0=c0|c1=c0[v];" : "[0:a]anull[v];"}[1:a]volume=${(BED_VOL * bedGain).toFixed(4)}[b];[v][b]amix=inputs=2:normalize=0:duration=first,ebur128=peak=true`]);

let lo = -6, hi = 14, best;
for (let i = 0; i < 9; i++) {
  const g = (lo + hi) / 2;
  cut(g, TMP);
  const vo = measure(["-i", TMP, "-af", "ebur128=peak=true"]);
  const bedGain = 10 ** ((vo.I - APPROVED) / 20);
  const s = sum(TMP, bedGain, false);
  console.log(`  gain ${g.toFixed(2)} dB -> VO ${vo.I} LUFS / ${vo.TP} dBTP · bed x${bedGain.toFixed(3)} · SUM ${s.I} LUFS / ${s.TP} dBTP`);
  best = { g, vo, bedGain, s };
  if (Math.abs(s.I - TARGET) < 0.06) break;
  if (s.I < TARGET) lo = g; else hi = g;
}
fs.copyFileSync(TMP, OUT);
fs.rmSync(TMP);
const dup = sum(OUT, best.bedGain, true);
console.log(`\n✓ wrote ${OUT}: VO ${best.vo.I} LUFS / ${best.vo.TP} dBTP`);
console.log(`  SUM (pan-law upmix): ${best.s.I} LUFS / ${best.s.TP} dBTP`);
console.log(`  SUM (channel duplicate): ${dup.I} LUFS / ${dup.TP} dBTP`);
console.log(`  BED_GAIN = ${best.bedGain.toFixed(2)}  (set <MusicBed volume={MUSIC.volume * BED_GAIN} />)`);

// simulate the stitch: two-pass loudnorm to the delivery target, AAC 256k, then measure the result
const LUFS = Math.round(TARGET), TPK = -1.5;
for (const d of [false, true]) {
  const mix = `out/_mix_${d ? "dup" : "pan"}.wav`;
  execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-i", OUT, "-i", BED, "-filter_complex",
    `${d ? "[0:a]pan=stereo|c0=c0|c1=c0[v];" : "[0:a]aformat=channel_layouts=stereo[v];"}[1:a]volume=${(BED_VOL * best.bedGain).toFixed(4)}[b];[v][b]amix=inputs=2:normalize=0:duration=first`, "-ar", "48000", mix]);
  const p1 = spawnSync("ffmpeg", ["-hide_banner", "-nostats", "-i", mix, "-af", `loudnorm=I=${LUFS}:TP=${TPK}:LRA=11:print_format=json`, "-f", "null", "-"], { encoding: "utf8" }).stderr;
  const j = JSON.parse(p1.match(/\{[\s\S]*?\}/)[0]);
  const ln = `loudnorm=I=${LUFS}:TP=${TPK}:LRA=11:measured_I=${j.input_i}:measured_TP=${j.input_tp}:measured_LRA=${j.input_lra}:measured_thresh=${j.input_thresh}:offset=${j.target_offset}`; // same args the workflow passes
  const m4a = mix.replace(".wav", ".m4a");
  execFileSync("ffmpeg", ["-hide_banner", "-loglevel", "error", "-y", "-i", mix, "-filter:a", ln, "-c:a", "aac", "-b:a", "256k", "-ar", "48000", m4a]);
  const r = measure(["-i", m4a, "-af", "ebur128=peak=true"]);
  console.log(`  stitch simulated (${d ? "duplicate" : "pan-law"}): in ${j.input_i} LUFS -> delivered ${r.I} LUFS / ${r.TP} dBTP`);
  fs.rmSync(mix); fs.rmSync(m4a);
}
