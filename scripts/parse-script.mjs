// parse-script.mjs — read script.md → src/script-meta.json + src/sections.json + src/beats.json.
//
// Parses the format in references/script-format.md:
//   - front-matter (--- ... ---): title, intro, cta
//   - HTML comments <!-- ... --> are stripped (author guardrails, not content)
//   - `##` headings        → sections (YouTube chapters + on-screen lower-thirds)
//   - blank-line paragraphs → beats (one per scene), in order
//   - inline cue at a beat start: [stat:] [broll:] [show:] [emphasize:] [quote:] [chart:]
// The verbatim beat text is the spoken words = the caption source. A cue marks the
// graphic treatment; the spoken text is kept intact regardless.
import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = resolve(root, "src");
const scriptPath = resolve(root, "script.md");

let raw = readFileSync(scriptPath, "utf8");

// ── front matter ────────────────────────────────────────────────────────────
const meta = { title: "", intro: "", cta: "" };
const fm = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);
if (fm) {
  for (const line of fm[1].split("\n")) {
    const i = line.indexOf(":");
    if (i === -1) continue;
    const key = line.slice(0, i).trim();
    const val = line.slice(i + 1).trim();
    if (key in meta) meta[key] = val;
  }
  raw = raw.slice(fm[0].length);
}

// ── strip HTML comments (author guardrails — not on-screen content) ───────────
raw = raw.replace(/<!--[\s\S]*?-->/g, "");

// ── cue parsing ───────────────────────────────────────────────────────────────
const CUE_RE = /^\[(stat|emphasize|broll|show|quote|chart):\s*([\s\S]*?)\]\s*/i;
function parseCue(text) {
  const m = text.match(CUE_RE);
  if (!m) return { cue: null, text: text.trim() };
  const type = m[1].toLowerCase();
  const args = m[2].trim();
  const rest = text.slice(m[0].length).trim();
  let cue = { type, raw: args };
  if (type === "stat") {
    const [value, label = ""] = args.split("|").map((s) => s.trim());
    cue.value = value;
    cue.label = label;
  } else if (type === "emphasize") {
    cue.phrase = args.replace(/^["']|["']$/g, "").trim();
  } else if (type === "broll" || type === "show") {
    cue.query = args;
  } else if (type === "quote") {
    const qm = args.match(/^["']?(.*?)["']?\s*[—-]\s*(.*)$/);
    if (qm) { cue.quote = qm[1].trim(); cue.source = qm[2].trim(); }
    else cue.quote = args.replace(/^["']|["']$/g, "");
  } else if (type === "chart") {
    cue.spec = args;
  }
  return { cue, text: rest };
}

// ── walk the body → sections + beats ──────────────────────────────────────────
const sections = [];
const beats = [];
let sectionIndex = -1;

const paragraphs = raw.split(/\n\s*\n/); // blank-line separated blocks
for (let block of paragraphs) {
  block = block.trim();
  if (!block) continue;
  const heading = block.match(/^##\s+(.*)$/);
  if (heading) {
    sectionIndex += 1;
    sections.push({ index: sectionIndex, title: heading[1].trim(), firstBeat: beats.length });
    continue;
  }
  // a content paragraph = one beat (collapse internal newlines to spaces)
  const flat = block.replace(/\s*\n\s*/g, " ").trim();
  const { cue, text } = parseCue(flat);
  beats.push({
    index: beats.length,
    sectionIndex: Math.max(0, sectionIndex),
    section: sections[sectionIndex]?.title ?? "",
    text,
    cue,
  });
}

writeFileSync(resolve(SRC, "script-meta.json"), JSON.stringify(meta, null, 2));
writeFileSync(resolve(SRC, "sections.json"), JSON.stringify(sections, null, 2));
writeFileSync(resolve(SRC, "beats.json"), JSON.stringify(beats, null, 2));

// ── report ────────────────────────────────────────────────────────────────────
const cueCounts = beats.reduce((a, b) => (b.cue ? ((a[b.cue.type] = (a[b.cue.type] || 0) + 1), a) : a), {});
console.log(`title:    ${meta.title}`);
console.log(`sections: ${sections.length}  ${sections.map((s) => s.title).join(" · ")}`);
console.log(`beats:    ${beats.length}  (cued: ${JSON.stringify(cueCounts)})`);
console.log(`wrote:    src/script-meta.json, src/sections.json, src/beats.json`);
