// ⚠️ PER-VIDEO — EDIT THE REPAIRS TABLE. The entries below are the brand names Whisper
// got wrong on one specific VO. Replace them with the mishears in YOUR transcript
// (compare src/vo-words.json against script.md) or this does nothing useful.
// fix-mishears.mjs — repair Whisper's brand-name mishears in src/vo-words.json so the
// verbatim script words ANCHOR instead of being interpolated.
//
// Why this is not cosmetic: align.mjs matches script word -> whisper word by normalized
// text. A name Whisper got wrong never matches, so it falls into the interpolation path
// and lands mid-gap. Here "ivonescimab" came back as TWO tokens ("even Eskimab") and
// "Leerink" as "Lyrink", which put the drug name ~455ms after it is actually spoken and
// the beat-3 boundary ~440ms early. Captions are unaffected either way (they are built
// from script.md), so this only ever moves TIMING onto the measured onset.
//
// Multi-token repairs merge into ONE token spanning first.start -> last.end.

import { readFileSync, writeFileSync } from "fs";
import { resolve } from "path";

const WORDS = resolve("src", "vo-words.json");
const words = JSON.parse(readFileSync(WORDS, "utf8"));

// [tokens as Whisper heard them] -> the word the script actually says
// `once: true` = repair only the FIRST hit, for a token that is ALSO a correct word later in the
// VO (Onswik 2026-09-26: "Novo" -> "Novo's" at 7.8s, but the 42.8s "Novo" was right). Also the way
// to merge a script hyphenation Whisper split: { heard: ["once", "weekly"], right: "Once-weekly", once: true }.
const REPAIRS = [
  { heard: ["even", "eskimab"], right: "ivonescimab" },
  { heard: ["lyrink"], right: "Leerink" },
];

// One Whisper token that is really TWO script words ("Bristol-Myers", "Vivgart-Heitrulo."): rename it in
// REPAIRS to the first word, then split it here. `after` is the repaired token text (findIndex: the FIRST
// match only), `at` is the second word's onset in ms read off the rms-strip. Not idempotent: run from a
// fresh transcript (keep a copy as src/vo-words.raw.json).
//   { after: "Bristol", first: "Bristol", then: "Myers", at: 1850 }
const SPLITS = [];
// Phantom tokens past the end of a TRUNCATED VO (Whisper stacks the missing words on one onset): drop
// every token starting at or after this ms. Infinity = the VO is complete.
const DROP_FROM_MS = Infinity;

const norm = (s) => s.toLowerCase().replace(/[^a-z0-9]/g, "");
const out = [];
const log = [];

for (let i = 0; i < words.length; ) {
  const hit = REPAIRS.find((r) =>
    r.heard.every((h, k) => i + k < words.length && norm(words[i + k].text) === h)
  );
  if (hit) {
    const first = words[i];
    const last = words[i + hit.heard.length - 1];
    // Keep any trailing punctuation the last token carried (". " / "," etc).
    const trail = (last.text.match(/[^A-Za-z0-9]+$/) || [""])[0];
    // `right` as an ARRAY = rename token-for-token, no merge (each keeps its own timing). For a
    // mishear that moved a word BOUNDARY: { heard: ["risks", "at"], right: ["risk", "sat"] }.
    if (Array.isArray(hit.right)) {
      hit.right.forEach((r, k) =>
        out.push({ ...words[i + k], text: r + (k === hit.right.length - 1 && !/[^A-Za-z0-9]$/.test(r) ? trail : "") })
      );
    } else out.push({ text: hit.right + trail, start: first.start, end: last.end });
    log.push(
      `  ${hit.heard.join(" + ").padEnd(20)} -> ${([].concat(hit.right).join(" ") + trail).padEnd(14)} @${first.start}ms` +
        (hit.heard.length > 1 && !Array.isArray(hit.right) ? `  (merged ${hit.heard.length} tokens)` : "")
    );
    i += hit.heard.length;
    if (hit.once) REPAIRS.splice(REPAIRS.indexOf(hit), 1);
  } else {
    out.push(words[i]);
    i++;
  }
}

for (const sp of SPLITS) {
  const i = out.findIndex((w) => w.text === sp.after);
  if (i < 0) continue;
  const end = out[i].end;
  out.splice(i, 1, { text: sp.first, start: out[i].start, end: sp.at }, { text: sp.then, start: sp.at, end });
  log.push(`  split ${sp.after} -> ${sp.first} + ${sp.then} @${sp.at}ms`);
}
for (let i = out.length - 1; i >= 0 && out[i].start >= DROP_FROM_MS; i--) log.push(`  dropped phantom ${out.pop().text}`);

console.log(`REPAIRED ${log.length} mishear(s):`);
log.forEach((l) => console.log(l));
const mono = out.every((w, i) => i === 0 || w.start >= out[i - 1].start);
console.log(`${words.length} -> ${out.length} tokens. monotonic starts: ${mono ? "YES" : "NO — FIX"}`);
if (!mono) process.exit(1);

writeFileSync(WORDS, JSON.stringify(out, null, 2));
console.log("wrote src/vo-words.json");
