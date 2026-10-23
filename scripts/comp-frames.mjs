// comp-frames.mjs — write a composition's durationInFrames (+ fps) to a FILE as
// JSON. Used by the parallel render workflow's "plan" job to shard the timeline.
//
//   node scripts/comp-frames.mjs MyVideo comp-frames.json
//   -> writes comp-frames.json: {"id":"MyVideo","durationInFrames":4902,...}
//
// IMPORTANT: writes to a FILE, never stdout. On a fresh runner Remotion prints
// "Downloading Chrome Headless Shell ..." to stdout the first time it bundles —
// if the caller parsed stdout as JSON it would choke on that line. Reading from
// the file sidesteps all stdout log noise. (Diagnostics go to stderr.)

import fs from "node:fs";
import path from "node:path";
import { bundle } from "@remotion/bundler";
import { selectComposition } from "@remotion/renderer";

const id = process.argv[2];
const outFile = process.argv[3] || "comp-frames.json";
if (!id) {
  console.error("usage: node scripts/comp-frames.mjs <CompositionId> [outFile]");
  process.exit(1);
}

const entry = path.resolve("src/index.ts");
const serveUrl = await bundle({ entryPoint: entry });
const comp = await selectComposition({ serveUrl, id, inputProps: {} });

const meta = {
  id: comp.id,
  durationInFrames: comp.durationInFrames,
  fps: comp.fps,
  width: comp.width,
  height: comp.height,
};
fs.writeFileSync(outFile, JSON.stringify(meta));
console.error("comp-frames ->", outFile, JSON.stringify(meta));
