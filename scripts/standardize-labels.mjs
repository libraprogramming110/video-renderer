// standardize-labels.mjs — collapse the kit's hardcoded `caps(x, N)` sizes onto
// the TYPE label SCALE, so the small-label voice is one system instead of 14
// accidents.
//
// Why this exists (2026-09-23, Nel): every block hardcoded its own caps() size.
// The kit had 16/17/18/19/20/21/22/24/25/26/28/30/32/34 for what is ONE semantic
// tier, and three of them landed in a single video. A per-video patch fixes that
// video; this fixes the kit, so the next build starts standardized.
//
// THE SCALE (style.ts):
//   TYPE.label    — the standard small-label voice: kickers, spec labels, figure
//                   qualifiers, reading labels, stamps. Most calls.
//   TYPE.labelSm  — genuinely secondary micro-tags INSIDE a dense block (chips,
//                   axis ticks, per-row units) that must not compete with the
//                   block's own kicker. Kept as a second step so collapsing to
//                   one value does not flatten real hierarchy.
//
// Mapping: a call's VERTICAL size decides its tier (>=24 -> label, else labelSm).
// Calls whose size is an expression (`capsSize ?? ...`, a prop, another token)
// are LEFT ALONE and reported — those are deliberate per-block overrides.
//
// Usage: node scripts/standardize-labels.mjs <kitDir> [--write]

import { readFileSync, writeFileSync, readdirSync } from "fs";
import { resolve, join } from "path";

const dir = resolve(process.argv[2] ?? "src/kit");
const WRITE = process.argv.includes("--write");
const CUT = 24; // vertical sizes below this are the micro tier

const files = readdirSync(dir).filter((f) => f.endsWith(".tsx") || f.endsWith(".ts"));
let changed = 0, toLabel = 0, toSm = 0;
const skipped = [];

for (const f of files) {
  const p = join(dir, f);
  const src = readFileSync(p, "utf8");
  let out = src;

  // caps(arg, <size>) — size is a literal, a V-ternary, or an expression
  out = out.replace(/caps\(([A-Za-z_][\w.]*)\s*,\s*([^),]*(?:\([^)]*\))?[^)]*)\)/g, (full, colour, sizeRaw) => {
    const size = sizeRaw.trim();
    if (/^TYPE\.label$/.test(size)) { toLabel++; return `caps(${colour})`; }
    let vertical = null;
    const lit = size.match(/^(\d+)$/);
    const tern = size.match(/^V\s*\?\s*(\d+)\s*:\s*(\d+)$/);
    if (lit) vertical = Number(lit[1]);
    else if (tern) vertical = Number(tern[1]);
    if (vertical == null) { skipped.push(`${f}: caps(${colour}, ${size})`); return full; }
    if (vertical >= CUT) { toLabel++; return `caps(${colour})`; }
    toSm++;
    return `caps(${colour}, TYPE.labelSm)`;
  });

  if (out !== src) {
    // make sure TYPE is imported wherever labelSm is now referenced
    if (/TYPE\.labelSm/.test(out) && !/\bTYPE\b[^=]*from "\.\.\/style"/.test(out)) {
      out = out.replace(/import \{([^}]*)\} from "\.\.\/style";/, (m, names) =>
        names.includes("TYPE") ? m : `import {${names.replace(/\s*$/, "")}, TYPE } from "../style";`
      );
    }
    changed++;
    if (WRITE) writeFileSync(p, out);
  }
}

console.log(`${WRITE ? "REWROTE" : "DRY RUN"}  ${dir}`);
console.log(`  files touched      ${changed}`);
console.log(`  -> TYPE.label      ${toLabel}`);
console.log(`  -> TYPE.labelSm    ${toSm}`);
console.log(`  left as-is         ${skipped.length}  (explicit per-block overrides)`);
for (const s of [...new Set(skipped)].slice(0, 12)) console.log(`     ${s}`);
if (!WRITE) console.log("\n(pass --write to apply)");
