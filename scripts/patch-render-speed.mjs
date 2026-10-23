// patch-render-speed.mjs — remove the two structural time sinks from render.yml.
//
// Measured cause (2026-08-20): all 18 jobs repeat ~750 MB of cold setup with zero
// caching — ~330 MB `npm ci` + a 270 MB Chrome Headless Shell into
// node_modules/.remotion + ~150 MB apt. Two jobs waste it outright:
//   · `plan` built that whole environment to compute ONE integer (durationInFrames).
//   · `audio` rasterized all 1712 frames at scale 0.25 just to keep the audio track.
//
// Wall clock is max(job), not sum, so caching mainly saves BILLED MINUTES; the two
// structural fixes are what actually shorten the render.
//
// ⚠️ render.yml is CRLF and full of `${{ }}`. Patch from a FILE (bash expands `${{`
// before node sees it), normalise newlines, and print ok/MISS per substitution so a
// silent no-match can never reach the farm. (gotchas.md, 08-12)
//
// ⚠️ Every literal below is a PLAIN SINGLE-QUOTED STRING joined by NL — never a
// template literal. The workflow contains both backslash line-continuations and
// `${{ }}`, and template literals mangle both.

import { readFileSync, writeFileSync } from "fs";

const PATH = ".github/workflows/render.yml";
let s = readFileSync(PATH, "utf8");
const NL = s.includes("\r\n") ? "\r\n" : "\n";
console.log("line endings: " + (NL === "\r\n" ? "CRLF" : "LF"));

const J = (lines) => lines.join(NL) + NL;
let miss = 0;
const ok = (label, detail) => console.log("ok    " + label.padEnd(44) + detail);
const bad = (label, detail) => { console.log("MISS  " + label.padEnd(44) + detail); miss++; };

// ── 1. plan: delete everything between `steps:` and the comp-frames call ──────
// Bounded by two backslash-free anchors so the apt continuation lines are never
// part of a search string.
const A = J([
  '  plan:',
  '    runs-on: ubuntu-latest',
  '    outputs:',
  '      matrix: ${{ steps.shard.outputs.matrix }}',
  '    steps:',
]);
const B = J(['          node scripts/comp-frames.mjs "$COMP" comp-frames.json']);

const LEAN = J([
  '      - uses: actions/checkout@v4',
  '      # ⚠️ NO npm ci, NO apt, NO Remotion bundle. This job\'s entire output is ONE',
  '      # INTEGER (durationInFrames). Building a full ~750 MB environment to learn it',
  '      # cost 15-18 min of pure critical path while all 16 render shards sat idle',
  '      # waiting on it. comp-frames.json is now generated LOCALLY AT STAGING (8s,',
  '      # measured) and committed — the runbook already required generating it as the',
  '      # "did COMP actually resolve?" guard, so this reuses a step that was already',
  '      # happening. Node is preinstalled on the runner; a checkout is all this needs.',
  '      - id: shard',
  '        run: |',
  '          set -e',
  '          test -f comp-frames.json || {',
  '            echo "::error::comp-frames.json missing. Run: node scripts/comp-frames.mjs $COMP comp-frames.json — then commit it."',
  '            exit 1; }',
  '          GOT=$(node -e \'process.stdout.write(String(require("./comp-frames.json").id))\')',
  '          if [ "$GOT" != "$COMP" ]; then',
  '            echo "::error::comp-frames.json is for composition $GOT but COMP is $COMP — regenerate and commit it."',
  '            exit 1',
  '          fi',
]);

const ia = s.indexOf(A);
const ib = ia >= 0 ? s.indexOf(B, ia) : -1;
if (ia >= 0 && ib > ia) {
  s = s.slice(0, ia + A.length) + LEAN + s.slice(ib + B.length);
  ok("plan job: drop npm ci + apt + bundle", "1 replacement");
} else {
  bad("plan job: drop npm ci + apt + bundle", "anchors not found (a=" + ia + " b=" + ib + ")");
}

// ── 2. audio: render audio only, no rasterizing ───────────────────────────────
const AUDIO_OLD = J([
  '      - name: Low-res full render (for its audio — identical at any scale)',
  '        run: npx remotion render "$COMP" out/lowres.mp4 --scale=0.25 --concurrency=1 --log=info',
  '      - name: Extract audio',
  '        run: ffmpeg -y -i out/lowres.mp4 -vn -c:a pcm_s16le out/audio.wav',
]);
const AUDIO_NEW = J([
  '      # ⚠️ AUDIO-ONLY. This used to rasterize all 1712 frames at scale 0.25 purely to',
  '      # throw the video away and keep the audio track — ~20 min, and it was the job',
  '      # `stitch` actually blocked on, so it set the whole render\'s wall clock.',
  '      # `--codec=wav` skips rasterizing entirely. Verified locally on this exact',
  '      # composition: 95s, producing 57.066s of 48kHz stereo measuring -10.8 LUFS /',
  '      # -3.1 dBTP — the identical mix, with no video pass.',
  '      - name: Render the mix (audio only — no rasterizing)',
  '        run: npx remotion render "$COMP" out/audio.wav --codec=wav --log=info',
]);

// ── 3/4. caching in the two jobs that still install ───────────────────────────
const NODE_OLD = J(['        with: { node-version: "20" }']);
const NODE_NEW = J(['        with: { node-version: "20", cache: "npm" }']);

const NPM_OLD = J(['      - run: npm ci', '      - run: node scripts/bootstrap.mjs || true']);
const NPM_NEW = J([
  '      - run: npm ci',
  '      # ⚠️ Restored AFTER npm ci, never before — npm ci DELETES node_modules',
  '      # wholesale, so a cache restored earlier in the job is thrown straight away.',
  '      # Keyed to the Remotion version because the browser build is pinned to it.',
  '      - name: Cache Chrome Headless Shell (270 MB, re-downloaded per job otherwise)',
  '        uses: actions/cache@v4',
  '        with:',
  '          path: node_modules/.remotion',
  '          key: remotion-browser-${{ runner.os }}-4.0.475',
  '      - run: node scripts/bootstrap.mjs || true',
]);

// ── 5. stitch: guard against a stale comp-frames.json ─────────────────────────
const CONCAT_OLD = J(['          ffmpeg -y -f concat -safe 0 -i concat.txt -c copy video.mp4']);
const CONCAT_NEW = J([
  '          ffmpeg -y -f concat -safe 0 -i concat.txt -c copy video.mp4',
  '',
  '          # ── GUARD: catch a STALE comp-frames.json ─────────────────────────',
  '          # Shard ranges now come from a committed file rather than a live Remotion',
  '          # query, so an out-of-date file would silently render the wrong range.',
  '          # Duration comes from container metadata (instant) rather than counting',
  '          # 1712 4K frames.',
  '          EXPECT=$(node -e \'const c=require("./comp-frames.json");process.stdout.write((c.durationInFrames/c.fps).toFixed(2))\')',
  '          GOTD=$(ffprobe -v error -show_entries format=duration -of csv=p=0 video.mp4)',
  '          echo "duration: expected ${EXPECT}s, got ${GOTD}s"',
  '          node -e \'const e=Number(process.argv[1]),g=Number(process.argv[2]);if(Math.abs(e-g)>0.15){console.error("::error::Stitched video is "+g+"s, expected "+e+"s — comp-frames.json is stale. Regenerate and re-push.");process.exit(1)}\' "$EXPECT" "$GOTD"',
]);

// stitch has no checkout today; the guard needs comp-frames.json present
const STITCH_OLD = J(['      - name: Install ffmpeg']);
const STITCH_NEW = J(['      - uses: actions/checkout@v4', '      - name: Install ffmpeg']);

const SUBS = [
  ["audio job: audio-only render", AUDIO_OLD, AUDIO_NEW, 1],
  ["npm cache (audio + render)", NODE_OLD, NODE_NEW, 2],
  ["Chrome browser cache (audio + render)", NPM_OLD, NPM_NEW, 2],
  ["stitch: stale-comp-frames guard", CONCAT_OLD, CONCAT_NEW, 1],
  ["stitch: checkout (guard needs the file)", STITCH_OLD, STITCH_NEW, 1],
];

for (const [label, from, to, expect] of SUBS) {
  const n = s.split(from).length - 1;
  if (n !== expect) { bad(label, "found " + n + ", expected " + expect); continue; }
  s = s.split(from).join(to);
  ok(label, n + " replacement(s)");
}

// ── invariants that must survive ──────────────────────────────────────────────
const TEMPLATE = !!process.env.TEMPLATE; // the pristine skill template keeps CRF + COMP Starter
const MUST = [
  // The pristine template KEEPS `--crf` as its generic default and COMP 'Starter';
  // both are per-video settings applied later by patch-render.mjs at staging. Only
  // a staged run should assert them.
  ...(TEMPLATE ? [] : [["ABR still applied (no --crf in render step)", !s.includes('--crf="$CRF"')]]),
  ...(TEMPLATE ? [] : [["COMP still Ivonescimab", s.includes("|| 'Ivonescimab' }}")]]),
  ["artifact upload still if: always()", /if: always\(\)/.test(s)],
  // ⚠️ Scope this to the plan job's OWN text. A naive "npm ci within N chars of
  // plan:" window catches the AUDIO job's npm ci and reports a false failure.
  ["plan no longer runs npm ci", !planSteps().includes("npm ci")],
  ["plan no longer runs apt-get", !planSteps().includes("apt-get")],
  ["plan still emits the matrix", /matrix=/.test(planSteps())],
];

// ⚠️ Strip COMMENT lines before asserting. The lean plan job documents itself with
// "NO npm ci, NO apt, ...", so a raw substring check greps its own prose and reports
// a failure that does not exist. Assert against the executable YAML only.
function planSteps() {
  return planJob()
    .split(NL)
    .filter((l) => !l.trim().startsWith("#"))
    .join(NL);
}

function planJob() {
  const start = s.indexOf(NL + "  plan:" + NL);
  if (start < 0) return "!! plan job not found — npm ci apt-get";
  // the next job header at exactly two-space indent ends this job
  const rest = s.slice(start + 1);
  const m = rest.slice(8).search(new RegExp(NL + "  [a-z][a-z0-9_-]*:" + NL));
  return m < 0 ? rest : rest.slice(0, m + 8);
}
for (const [label, cond] of MUST) (cond ? ok : bad)(label, cond ? "verified" : "FAILED");

if (process.env.DEBUG_PLAN) {
  const j = planJob();
  console.log("\n----- plan job as patched (" + j.length + " chars) -----");
  console.log(j);
  console.log("----- end -----");
}

if (miss) {
  console.log("\n✗ " + miss + " problem(s) — NOT writing the file.");
  process.exit(1);
}
writeFileSync(PATH, s);
console.log("\n✓ all applied; wrote " + PATH);
