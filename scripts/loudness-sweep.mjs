// Mostly generic: it reads public/vo/vo.mp3 + public/music/bed.mp3 and sweeps. Check
// BEDVOL still matches MUSIC.volume in style.ts before trusting the numbers.
// loudness-sweep.mjs — find how loud this VO can honestly go, and prove it.
//
// This VO is QUIET AND PEAKY: -18.3 LUFS while already peaking at -0.8 dBTP, a
// 17.5 dB crest factor. Raising gain clips before it ever gets loud, so the tool
// is COMPRESSION, not volume (07-18 / 08-06 / 08-12).
//
// Two things this sweep exists to respect:
//   · `alimiter` has an auto-`level` option that DEFAULTS TO TRUE and re-normalizes
//     after limiting, handing back the gain the ceiling just removed. Always
//     `level=0`, or the parameter is non-monotonic and the sweep is nonsense (08-12).
//   · The limiter caps SAMPLE peak, not TRUE peak, so it is oversampled
//     (aresample=192000 -> alimiter -> aresample=48000) (gotchas.md).
//
// And it measures the SUM (VO + bed x MUSIC.volume), never the VO alone — the
// cloud render bakes the mix in permanently (chunks render --muted, finalize.mjs
// never runs in CI), so the sum is the only number that matters.
//
// Method (07-29 / 08-12): sweep until the figure STOPS MOVING, then take the
// GENTLEST config that reaches that ceiling.

import { execFileSync, spawnSync } from "node:child_process";
import { existsSync, mkdirSync } from "node:fs";

const VO = "public/vo/vo.mp3";
const BED = "public/music/bed.mp3";
const BEDVOL = 0.14; // MUSIC.volume in style.ts
const NLX = "\n";
const TMP = "out/_sweep";
if (!existsSync(TMP)) mkdirSync(TMP, { recursive: true });

// threshold / ratio / makeup — gain comes from MAKEUP scaling with the
// compression, not from a volume stage (08-12: more compression + more input gain
// came back QUIETER because makeup stayed put).
const CONFIGS = [
  { id: "A", th: -20, ratio: 3, makeup: 4, limit: 0.9 },
  { id: "B", th: -20, ratio: 4, makeup: 6, limit: 0.9 },
  { id: "C", th: -22, ratio: 4, makeup: 8, limit: 0.89 },
  { id: "D", th: -24, ratio: 6, makeup: 10, limit: 0.89 },
  { id: "E", th: -26, ratio: 6, makeup: 12, limit: 0.88 },
  { id: "F", th: -26, ratio: 8, makeup: 14, limit: 0.88 },
];

const measure = (file) => {
  // ⚠️ ffmpeg prints the loudnorm summary to STDERR, not stdout. Reading stdout
  // returns an empty string and every field parses to NaN — which looks like a
  // measurement failure rather than a plumbing bug.
  const r = spawnSync(
    "ffmpeg",
    ["-hide_banner", "-nostats", "-i", file, "-af", "loudnorm=print_format=summary", "-f", "null", "-"],
    { encoding: "utf8", maxBuffer: 1 << 24 }
  );
  const out = (r.stdout || "") + (r.stderr || "");
  const g = (re) => (out.match(re) || [])[1];
  const v = {
    lufs: parseFloat(g(/Input Integrated:\s*(-?[\d.]+)/)),
    tp: parseFloat(g(/Input True Peak:\s*(-?[\d.]+)/)),
    lra: parseFloat(g(/Input LRA:\s*(-?[\d.]+)/)),
  };
  if (Number.isNaN(v.lufs)) throw new Error(`could not measure ${file}:\n${out.slice(-600)}`);
  return v;
};

const chain = (c) =>
  `acompressor=threshold=${c.th}dB:ratio=${c.ratio}:attack=5:release=140:makeup=${c.makeup},` +
  `aresample=192000,alimiter=level=0:limit=${c.limit},aresample=48000`;

console.log("VO alone (source)      ", measure(VO));
console.log("bed alone (normalized) ", measure(BED));
console.log("\nid  threshold ratio makeup limit |  VO processed        |  SUM (VO + bed)");
console.log("-".repeat(96));

const rows = [];
for (const c of CONFIGS) {
  const voOut = `${TMP}/vo_${c.id}.wav`;
  const mixOut = `${TMP}/mix_${c.id}.wav`;
  execFileSync("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error", "-i", VO, "-af", chain(c), "-ar", "48000", "-c:a", "pcm_s24le", voOut]);
  execFileSync("ffmpeg", [
    "-y", "-hide_banner", "-loglevel", "error", "-i", voOut, "-i", BED,
    "-filter_complex",
    `[1:a]volume=${BEDVOL}[b];[0:a][b]amix=inputs=2:duration=first:dropout_transition=0:normalize=0[m]`,
    "-map", "[m]", "-ar", "48000", "-c:a", "pcm_s24le", mixOut,
  ]);
  const v = measure(voOut), m = measure(mixOut);
  rows.push({ ...c, v, m });
  console.log(
    `${c.id}   ${String(c.th).padStart(5)}dB ${String(c.ratio).padStart(4)} ${String(c.makeup).padStart(6)} ${String(c.limit).padStart(5)} | ` +
      `${String(v.lufs).padStart(6)} LUFS ${String(v.tp).padStart(5)} dBTP | ` +
      `${String(m.lufs).padStart(6)} LUFS ${String(m.tp).padStart(5)} dBTP  (LRA ${m.lra})`
  );
}

// the ceiling = where the SUM's integrated loudness stops moving (within 0.3 LU)
const best = rows.reduce((a, b) => (b.m.lufs > a.m.lufs ? b : a));
const atCeiling = rows.filter((r) => Math.abs(r.m.lufs - best.m.lufs) <= 0.3 && r.m.tp <= -1.0);
console.log("-".repeat(96));
console.log(`loudest SUM reached: ${best.m.lufs} LUFS (config ${best.id})`);
if (atCeiling.length) {
  console.log(`configs within 0.3 LU of it AND at/below -1.0 dBTP: ${atCeiling.map((r) => r.id).join(", ")}`);
  console.log(`-> take the GENTLEST of those: ${atCeiling[0].id}  (ratio ${atCeiling[0].ratio}, makeup ${atCeiling[0].makeup})`);
} else {
  console.log("no config both reached the ceiling and held -1.0 dBTP — inspect the table.");
}

// ── STAGE 2 — HEADROOM SWEEP ────────────────────────────────────────────────
// Stage 1 answers "how loud can this go". It does NOT answer "how loud is
// SAFE", and those are different questions with different answers. On the
// oral GLP-1 build (2026-08-21) every config at the ceiling put the SUM at
// -0.3..-0.5 dBTP: technically un-clipped, but with no margin for the AAC
// encoder's inter-sample peaks, and the cloud render bakes the mix in
// permanently. Ask the operator which they want; when they say "safe", run
// this and trade ~1.4 LU for ~1.5 dB of true-peak headroom.
//
// Only the LIMITER moves here. The compressor stays at the gentlest config
// that reached the ceiling, because that is what set the loudness.
const gentlest = atCeiling[0] ?? best;
const TARGET_TP = -1.5; // what "safe" means: true peak on the SUM, not the VO
console.log(`${NLX}headroom sweep — compressor held at ${gentlest.id} (th ${gentlest.th}dB, ratio ${gentlest.ratio}, makeup ${gentlest.makeup})`);
console.log("limit  |  VO processed         |  SUM (VO + bed)");
console.log("-".repeat(96));
let pick = null;
for (const limit of [gentlest.limit, 0.84, 0.8, 0.76, 0.72, 0.68]) {
  const c = { ...gentlest, id: `L${limit}`, limit };
  const voOut = `${TMP}/hr_vo_${limit}.wav`;
  const mixOut = `${TMP}/hr_mix_${limit}.wav`;
  execFileSync("ffmpeg", ["-y", "-hide_banner", "-loglevel", "error", "-i", VO, "-af", chain(c), "-ar", "48000", "-c:a", "pcm_s24le", voOut]);
  execFileSync("ffmpeg", [
    "-y", "-hide_banner", "-loglevel", "error", "-i", voOut, "-i", BED,
    "-filter_complex",
    `[1:a]volume=${BEDVOL}[b];[0:a][b]amix=inputs=2:duration=first:dropout_transition=0:normalize=0[m]`,
    "-map", "[m]", "-ar", "48000", "-c:a", "pcm_s24le", mixOut,
  ]);
  const v = measure(voOut), m = measure(mixOut);
  const safe = m.tp <= TARGET_TP;
  if (safe && !pick) pick = { limit, v, m }; // loudest that clears the target
  console.log(
    `${String(limit).padEnd(6)} | ${String(v.lufs).padStart(6)} LUFS ${String(v.tp).padStart(5)} dBTP | ` +
      `${String(m.lufs).padStart(6)} LUFS ${String(m.tp).padStart(5)} dBTP  (LRA ${m.lra})${safe ? "   <= SAFE" : ""}`
  );
}
console.log("-".repeat(96));
if (pick) {
  console.log(`SAFE pick: limit=${pick.limit} -> SUM ${pick.m.lufs} LUFS / ${pick.m.tp} dBTP`);
  console.log(`  cost vs the ceiling: ${(best.m.lufs - pick.m.lufs).toFixed(1)} LU, bought ${(pick.m.tp - best.m.tp).toFixed(1)} dB of headroom`);
  console.log(`  -> set render.yml LUFS to the SUM figure, or the stitch mux undoes it`);
  console.log(`  -> re-measure after the mp3/AAC encode; lossy coding moves it a few tenths`);
} else {
  console.log(`nothing reached ${TARGET_TP} dBTP — lower the limiter further.`);
}
