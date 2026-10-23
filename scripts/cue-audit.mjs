// cue-audit.mjs — resolve a build's cue words the SAME way kit/core.tsx does,
// and report where each one actually lands. Catches the two silent failures:
//   1. a cue word that isn't found → the block falls back to an arbitrary ms
//   2. a cue word found EARLIER/LATER than intended (short words, repeats)
// Usage: node scripts/cue-audit.mjs
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const SRC = resolve(dirname(fileURLToPath(import.meta.url)), "..", "src");
const tl = JSON.parse(readFileSync(resolve(SRC, "timeline.json"), "utf8"));
const WORDS = tl.words;
const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");

// verbatim port of cueMs() from kit/core.tsx
function cueMs(phrase, afterMs = 0) {
  const target = phrase.split(/\s+/).filter(Boolean).map(norm).filter(Boolean);
  if (!target.length) return undefined;
  for (let i = 0; i < WORDS.length; i++) {
    if (WORDS[i].startMs < afterMs) continue;
    let ok = true;
    for (let k = 0; k < target.length; k++) {
      const a = norm(WORDS[i + k]?.raw ?? "");
      const b = target[k];
      if (!a || !(a === b || a.startsWith(b) || b.startsWith(a))) { ok = false; break; }
    }
    if (ok) return WORDS[i].startMs;
  }
  return undefined;
}

const t = (ms) => (ms / 1000).toFixed(2) + "s";

// Per-run check lists. The template ships WITHOUT them — a build authors its own
// as it wires each chunk, so a missing file means "nothing to check yet", not an error.
const load = (name) => {
  try {
    return JSON.parse(readFileSync(resolve(SRC, name), "utf8"));
  } catch {
    console.log(`(no src/${name} yet — add entries as you wire each chunk's cues)`);
    return [];
  }
};

// [{ label, phrase, after, expect, blockFrom? }]
// `blockFrom` = the `from` of the block that owns the cue. Set it on EVERY row: a block
// often resolves a cue from its own start, not from the previous cue, so a check whose
// `after` is later than the code's can pass while the frame is wrong (Compass/tovecimig
// 2026-09-26: "Then" matched the "the" in "So the signal" from the block start and
// faded a narration line in 8.5s early, over the line being spoken; the row had passed).
const CHECKS = load("cue-checks.json");

let fails = 0;
console.log("CUE AUDIT\n" + "=".repeat(78));
for (const c of CHECKS) {
  const got = cueMs(c.phrase, c.after ?? 0);
  const okFound = got !== undefined;
  const okExp = c.expect == null || (okFound && Math.abs(got - c.expect) < 60);
  const status = !okFound ? "MISS  " : !okExp ? "DRIFT " : "ok    ";
  if (!okFound || !okExp) fails++;
  console.log(
    `${status} ${c.label.padEnd(38)} "${c.phrase}"`.padEnd(78) +
      (okFound ? ` → ${t(got)}` : ` → NOT FOUND (falls back)`) +
      (c.expect != null && okFound && !okExp ? `  expected ${t(c.expect)}` : "")
  );
  if (c.blockFrom != null && okFound) {
    const worst = cueMs(c.phrase, c.blockFrom);
    if (worst !== got) {
      fails++;
      console.log(`TRAP   ${"".padEnd(38)} from the block start (${t(c.blockFrom)}) it resolves to ${worst === undefined ? "NOTHING" : t(worst)} — cue with a longer phrase`);
    }
  }
}
console.log("=".repeat(78));
console.log(fails === 0 ? `✓ all ${CHECKS.length} cues resolve as intended` : `✗ ${fails} of ${CHECKS.length} cue(s) need attention`);

// word-by-word auto-sync check for WordFlow/FlowStamp lead lines
const FLOWS = load("flow-checks.json");
if (FLOWS.length) {
  console.log("\nAUTO-SYNC (WordFlow / FlowStamp leads)\n" + "=".repeat(78));
  for (const f of FLOWS) {
    const toks = f.line.split(/\s+/).filter(Boolean);
    // verbatim port of cueSeq() from kit/core.tsx — a WORD-INDEX cursor. An ms
    // cursor (`m + 1`) silently skips any token sharing a startMs with the one
    // before it, which is exactly what Whisper does to spoken dates and figures.
    let i = 0;
    while (i < WORDS.length && WORDS[i].startMs < f.from) i++;
    const unresolved = [];
    for (const tok of toks) {
      const b = norm(tok);
      let hit = false;
      for (let j = i; j < WORDS.length && WORDS[j].startMs <= f.to; j++) {
        const a = norm(WORDS[j].raw);
        if (a && b && (a === b || a.startsWith(b) || b.startsWith(a))) { i = j + 1; hit = true; break; }
      }
      if (!hit) unresolved.push(tok);
    }
    const pct = (((toks.length - unresolved.length) / toks.length) * 100).toFixed(0);
    console.log(`${unresolved.length === 0 ? "ok    " : "PARTIAL"} ${f.label.padEnd(30)} ${toks.length - unresolved.length}/${toks.length} words synced (${pct}%)`);
    if (unresolved.length) console.log(`        unsynced → ${unresolved.join(" ")}`);
  }
}
