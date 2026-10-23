// ⚠️ PER-VIDEO — the LUFS value below is the one manual edit: set it from the MEASURED
// VO+bed sum (or the operator's ask). FRAMES and the COMP id are read from
// comp-frames.json (run `node scripts/comp-frames.mjs <Comp> comp-frames.json` first);
// they were hand-edited per video until 2026-10-03, the same edit every build.
// patch-render.mjs — configure .github/workflows/render.yml for THIS video.
//
// ⚠️ Why a script file and not `node -e` from the shell: render.yml is full of
// `${{ github.event.inputs… }}`. bash expands `${{` before node ever sees it
// ("bad substitution") and PowerShell mangles it differently again. A file passes
// the string through untouched. (gotchas.md)
//
// ⚠️ render.yml is CRLF. A multi-line String.replace against it silently matches
// NOTHING while single-line edits succeed, so the failure looks like a bad search
// string. Detect the line ending and print ok/MISS per substitution so a silent
// no-match can never reach the farm. (08-12)

import { readFileSync, writeFileSync } from "fs";

const PATH = ".github/workflows/render.yml";
let s = readFileSync(PATH, "utf8");
const NL = s.includes("\r\n") ? "\r\n" : "\n";
console.log(`line endings: ${NL === "\r\n" ? "CRLF" : "LF"}`);

// ── the numbers, derived from THIS video ────────────────────────────────────
const CF = JSON.parse(readFileSync("comp-frames.json", "utf8")); // written by comp-frames.mjs
const FPS = CF.fps, FRAMES = CF.durationInFrames, COMP = CF.id;
console.log(`comp ${COMP} · ${FRAMES} frames @${FPS}fps`);
const DUR = FRAMES / FPS;                      // 57.07s
const CAP_MIB = 100;
const AUDIO_BPS = 256_000;
const audioMiB = (AUDIO_BPS * DUR) / 8 / 1048576;
const videoMiB = CAP_MIB - audioMiB - 0.5;     // 0.5 MiB container allowance
const maxMbps = (videoMiB * 1048576 * 8) / DUR / 1e6;
// kbps granularity: flooring to whole Mbps threw away up to ~1 Mbps of a long video's budget
// (3:16 at 220 MiB: 9.14 ceiling -> 8M floored vs 8200k). Onswik horizontal, 2026-09-27.
const targetK = Math.floor((maxMbps * 0.9 * 1000) / 100) * 100; // ~10% under, for ABR overshoot
const target = `${targetK}k`;
const VMAX_M = Math.ceil((targetK * 1.5) / 1000); // peak = 1.5x the target (render-defaults.json); was hardcoded 18M (AbbVie 2026-10-22)
console.log(
  `duration ${DUR.toFixed(2)}s · cap ${CAP_MIB} MiB · audio ${audioMiB.toFixed(2)} MiB ` +
  `-> video budget ${videoMiB.toFixed(2)} MiB -> ceiling ${maxMbps.toFixed(2)} Mbps -> VBIT ${target}`
);

const EDITS = [
  // COMP in BOTH places — the workflow_dispatch default AND the env default.
  // Missing either renders the template's health-check card instead of the video.
  [`composition: { description: "Composition id", default: "Starter" }`,
   `composition: { description: "Composition id", default: "${COMP}" }`],
  [`COMP: \${{ github.event.inputs.composition || 'Starter' }}`,
   `COMP: \${{ github.event.inputs.composition || '${COMP}' }}`],

  // ⚠️ The mix is already -10.8 LUFS. Leaving LUFS at -14 would make the stitch
  // mux pull the master DOWN 3.2 dB and quietly undo the whole loudness pass.
  [`  LUFS: "-14"`, `  LUFS: "-12"`], // GSK Hibsago: mix cut to -12.0 (mix-to-target.mjs -12 -16.31)

  // Rate control sized to this video (see the arithmetic above).
  [`  VBIT: "12M"`, `  VBIT: "${target}"`],
  [`  VMAX: "16M" # peak ceiling for the busiest (footage) frames`,
   `  VMAX: "${VMAX_M}M" # peak ceiling for the busiest (footage) frames`],
  [`  VBUF: "32M" # VBV buffer = 2x peak`, `  VBUF: "${VMAX_M * 2}M" # VBV buffer = 2x peak`],
  [`  MAX_MB: "0" # hard size CEILING in MiB (0 = off)`,
   `  MAX_MB: "100" # hard size CEILING in MiB (0 = off)`],

  // ⚠️ THE ONE THAT ACTUALLY MATTERS. MAX_MB is a NO-OP while the render step is
  // on --crf: CRF targets a QUALITY level and lets size land where the content
  // takes it. "Highest bitrate under a cap" REQUIRES the ABR trio, and --crf and
  // --video-bitrate are mutually exclusive in Remotion. Setting the env block is
  // NOT configuring the encoder. (07-29 — Nel caught this himself.)
  [`            --crf="$CRF" \\`,
   `            --video-bitrate="$VBIT" --encoding-max-rate="$VMAX" --encoding-buffer-size="$VBUF" \\`],
];

let miss = 0;
for (const [from, to] of EDITS) {
  const needle = from.replace(/\n/g, NL);
  const label = from.split(NL)[0].trim().slice(0, 62);
  if (s.includes(needle)) {
    s = s.replace(needle, to.replace(/\n/g, NL));
    console.log(`ok    ${label}`);
  } else {
    console.log(`MISS  ${label}`);
    miss++;
  }
}

// The guard must never withhold the master: a size/resolution guard that exits
// before the upload destroys ~20 min of render for nothing. (07-24)
const guardOK = /if: always\(\)/.test(s);
console.log(`${guardOK ? "ok   " : "MISS "} artifact upload has \`if: always()\``);
if (!guardOK) miss++;

if (miss) {
  console.log(`\n✗ ${miss} substitution(s) did not apply — NOT writing the file.`);
  process.exit(1);
}
writeFileSync(PATH, s);
console.log(`\n✓ ${EDITS.length}/${EDITS.length} applied; wrote ${PATH}`);
