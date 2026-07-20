// Unified timeline analyzer. "Listens" to each scene clip (ffmpeg silence
// detection) + the transcript and emits the whole edit decision list:
//   - src/cuts.json   : kept segments per scene (>=1s dead air removed)
//   - src/pacing.json : breathing-room holds at rushed transitions
// plus a human-readable pacing report. Re-run it whenever the clips change;
// config.ts consumes both files, so the timeline rebuilds automatically.
//
// Requires ffmpeg + ffprobe. Set FFMPEG_BIN to their folder, or put them on PATH.

import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const BIN = process.env.FFMPEG_BIN ?? "";
const FF = path.join(BIN, "ffmpeg");
const FP = path.join(BIN, "ffprobe");
const FPS = 30;
const MIN_DEAD = 1.0; // remove silences >= this many seconds (the "dead air" rule)
const GUARD = 0.06; // keep this much speech around each cut so onsets aren't clipped
const TARGET_BREATH = 0.5; // desired pause at a transition (s)

const SCENES_DIR = path.join("public", "scenes");
const sceneFiles = fs
  .readdirSync(SCENES_DIR)
  .filter((f) => /^scene\d+\.mp4$/i.test(f))
  .sort((a, b) => parseInt(a.match(/\d+/)[0]) - parseInt(b.match(/\d+/)[0]));

const caps = fs.existsSync(path.join("src", "captions.json"))
  ? JSON.parse(fs.readFileSync(path.join("src", "captions.json"), "utf8"))
  : {};

const dur = (file) =>
  parseFloat(
    spawnSync(FP, ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", file], {
      encoding: "utf8",
    }).stdout.trim()
  );

// Source dimensions (so the timeline can fit mismatched clips, not just crop).
const dims = (file) => {
  const out = spawnSync(
    FP,
    ["-v", "error", "-select_streams", "v:0", "-show_entries", "stream=width,height", "-of", "csv=p=0:s=x", file],
    { encoding: "utf8" }
  ).stdout.trim();
  const [w, h] = out.split("x").map((n) => parseInt(n, 10));
  return w && h ? { w, h } : null;
};

function silences(file) {
  const txt = spawnSync(
    FF,
    ["-i", file, "-af", "silencedetect=noise=-30dB:d=0.25", "-f", "null", "-"],
    { encoding: "utf8" }
  ).stderr;
  const regs = [];
  let cur = null;
  for (const m of txt.matchAll(/silence_(start|end):\s*(-?[0-9.]+)/g)) {
    if (m[1] === "start") cur = { start: Math.max(0, parseFloat(m[2])) };
    else if (cur) {
      cur.end = parseFloat(m[2]);
      cur.dur = cur.end - cur.start;
      regs.push(cur);
      cur = null;
    }
  }
  return regs;
}

// kept segments = [0, clipDur] minus each >=MIN_DEAD silence (with guard padding)
function deriveSegments(sil, clipDur) {
  const removed = sil
    .filter((s) => s.dur >= MIN_DEAD)
    .map((s) => [s.start + GUARD, s.end - GUARD])
    .filter(([a, b]) => b > a)
    .sort((x, y) => x[0] - y[0]);
  const segs = [];
  let cursor = 0;
  for (const [a, b] of removed) {
    if (a > cursor) segs.push({ from: +cursor.toFixed(3), to: +a.toFixed(3) });
    cursor = Math.max(cursor, b);
  }
  if (cursor < clipDur) segs.push({ from: +cursor.toFixed(3), to: +clipDur.toFixed(3) });
  return segs.filter((s) => s.to - s.from > 0.12);
}

const wordCount = (tokens) =>
  (tokens ?? []).map((t) => t.text).join("").trim().split(/\s+/).filter(Boolean).length;

function longestRun(sil, segs) {
  let max = 0;
  for (const seg of segs) {
    const edges = [seg.from];
    for (const s of sil)
      if (s.end > seg.from && s.start < seg.to)
        edges.push(Math.max(seg.from, s.start), Math.min(seg.to, s.end));
    edges.push(seg.to);
    for (let i = 0; i < edges.length - 1; i += 2) max = Math.max(max, edges[i + 1] - edges[i]);
  }
  return max;
}

const cuts = {};
const holds = {};
const sceneDims = {};
const scenes = [];
const meta = {};

for (const f of sceneFiles) {
  const key = f.replace(/\.mp4$/i, "");
  const file = path.join(SCENES_DIR, f);
  const d = dur(file);
  sceneDims[key] = dims(file);
  const sil = silences(file);
  const segs = deriveSegments(sil, d);
  cuts[key] = segs;

  // pacing stats
  const firstFrom = segs[0].from;
  const lastTo = segs[segs.length - 1].to;
  let leading = 0;
  if (firstFrom <= 0.05) {
    const r = sil.find((s) => s.start <= 0.05);
    if (r) leading = r.end;
  }
  let trailing = 0;
  const tr = sil.find((s) => s.end >= lastTo - 0.06);
  if (tr) trailing = Math.max(0, lastTo - tr.start);

  let kept = 0;
  let silent = 0;
  for (const seg of segs) {
    kept += seg.to - seg.from;
    for (const s of sil) {
      const a = Math.max(s.start, seg.from);
      const b = Math.min(s.end, seg.to);
      if (b > a) silent += b - a;
    }
  }
  const speech = Math.max(0.1, kept - silent);
  const words = wordCount(caps[key]);
  meta[key] = { leading, trailing };
  scenes.push({
    key,
    wps: +(words / speech).toFixed(2),
    run: +longestRun(sil, segs).toFixed(2),
    segs: segs.length,
  });
}

// breathing-room holds at each boundary (incl. into outro)
const order = sceneFiles.map((f) => f.replace(/\.mp4$/i, ""));
for (let i = 0; i < order.length; i++) {
  const a = order[i];
  const b = order[i + 1]; // undefined on last -> boundary into outro (leading 0)
  const trailing = meta[a].trailing;
  const leading = b ? meta[b].leading : 0;
  const room = trailing + leading;
  holds[a] = room < 0.45 ? Math.min(15, Math.round((TARGET_BREATH - room) * FPS)) : 0;
}

fs.writeFileSync(path.join("src", "cuts.json"), JSON.stringify(cuts, null, 2));
fs.writeFileSync(path.join("src", "pacing.json"), JSON.stringify(holds, null, 2));
fs.writeFileSync(path.join("src", "dims.json"), JSON.stringify(sceneDims, null, 2));

console.log("=== SCENE PACING ===");
for (const s of scenes)
  console.log(
    `${s.key}: ${s.wps} w/s, longest run ${s.run}s, ${s.segs} segment(s)  ${
      s.wps > 3.2 || s.run > 6.5 ? "<<< FAST" : "ok"
    }`
  );
console.log("\n=== CUTS (kept segments) ===");
for (const k of order) console.log(`${k}: ${cuts[k].map((s) => `${s.from}-${s.to}`).join("  ")}`);
console.log("\n=== BREATHING HOLDS (frames) ===");
for (const k of order)
  console.log(`after ${k}: ${holds[k]}f ${holds[k] ? `(${(holds[k] / FPS).toFixed(2)}s)` : ""}`);
console.log("\n✓ Wrote src/cuts.json + src/pacing.json + src/dims.json");
