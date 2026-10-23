// ⚠️ PER-VIDEO — THIS IS A PATTERN TO COPY, NOT A DROP-IN TOOL. The SECTIONS table
// below describes one specific composition. Rewrite it to declare THIS video's settled
// elements as [top, bottom] bands. The harness (pairwise overlap, gap sequence,
// headroom/footroom) is what is reusable.
// layout-audit.mjs — verify the SETTLED frame of each section by arithmetic.
//
// Why this exists: a width budget ("does this caps label fit its column?") cannot
// see a VERTICAL collision between two elements that never share a parent. On the
// first chunk of this build the §2 emphasis rule was laid out in normal flow inside
// one absolutely-positioned box while the measure label was placed absolutely from a
// different origin, and the two landed on the same line — the rule ran straight
// through "PROGRESSION-FREE SURVIVAL". Scrubbing did not reveal it; the operator's
// screenshot did.
//
// So: every section declares its settled elements as [top, bottom] bands, and this
// checks the whole stack PAIRWISE for overlap, reports the gap sequence so uneven
// rhythm is visible as numbers, and asserts the block sits centred in the usable
// band.
//
// 9:16 geometry, THE CARD LOOK (2026-09-22): the red chrome band covers the top
// 112px and the platform UI the bottom 288px (style.ts LAYOUT.chrome / .safeBottom),
// so key content lives in ~150–1632. (Direction A: masthead ~110, footer ~1790,
// band 150–1750; those numbers are superseded.) A block centred on the FRAME sits
// ~70px low in this band, so the bottom-edge check usually binds first.

const BAND = [150, 1632];
const SAFE = 1632; // top of the platform-UI zone (1920 − LAYOUT.safeBottom)
const CAPS = 0.6; // caps() is sentence case now (no +0.14em tracking); an ALL-CAPS string still costs ~0.7
const DISP = 0.6;

const capsH = (size) => Math.round(size * 1.2);
const dispH = (size, lines = 1) => Math.round(size * 1.12 * lines);

// ── the settled frames ──────────────────────────────────────────────────────
const G = { markCY: 900, markR: 62, tallyCY: 480, agentsCY: 660, dateCY: 1020, comboCY: 1330, indCY: 1150, nameCY: 1180 };
const T2 = 1200, barH = 46;

const SECTIONS = {
  "§0 Three (settled)": [
    ["figure (docked)", 480 - 140 * 0.62, 480 - 140 * 0.62 + 140],
    ["tally label", G.tallyCY + 96, G.tallyCY + 96 + capsH(24)],
    ["mark row", G.markCY - G.markR, G.markCY + G.markR],
    ["drug name", 1300, 1300 + dispH(68)],
    ["name rule", 1300 + dispH(68) + 26, 1300 + dispH(68) + 29],
  ],
  "§1 The Approval (settled)": [
    ["figure (docked)", 480 - 140 * 0.62, 480 - 140 * 0.62 + 140],
    ["tally label", G.tallyCY + 96, G.tallyCY + 96 + capsH(24)],
    ["agents", G.agentsCY, G.agentsCY + capsH(34)],
    ["mark row (selected)", G.markCY - G.markR * 1.28, G.markCY + G.markR * 1.28],
    ["date", G.dateCY, G.dateCY + capsH(30)],
    ["indication l1", G.indCY, G.indCY + capsH(30)],
    ["indication l2", G.indCY + capsH(30) + 20, G.indCY + capsH(30) + 20 + capsH(46)],
    ["combo connector", G.comboCY, G.comboCY + 34],
    ["combo label", G.comboCY + 34 + 16, G.comboCY + 34 + 16 + capsH(32)],
  ],
  "§2 The Label (settled)": [
    ["figure (docked)", 480 - 140 * 0.62, 480 - 140 * 0.62 + 140],
    ["tally label", G.tallyCY + 96, G.tallyCY + 96 + capsH(24)],
    ["agents (dim)", G.agentsCY, G.agentsCY + capsH(34)],
    ["mark row (selected)", G.markCY - G.markR * 1.28, G.markCY + G.markR * 1.28],
    ["date", G.dateCY, G.dateCY + capsH(30)],
    ["folded context", G.dateCY + 96, G.dateCY + 96 + capsH(24)],
    ["eyebrow", T2, T2 + capsH(22)],
    ["headline", T2 + 50, T2 + 50 + dispH(52)],
    ["emphasis rule", T2 + 148, T2 + 151],
    ["measure", T2 + 210, T2 + 210 + capsH(22)],
    ["bar row", T2 + 262, T2 + 262 + barH],
    ["bar labels", T2 + 262 + barH + 24, T2 + 262 + barH + 24 + capsH(22)],
  ],
  "§3 The US Path (settled)": [
    ["source kicker", 430, 430 + capsH(22)],
    ["source name", 472, 472 + capsH(38)],
    ["finding", 590, 590 + Math.round(36 * 1.25)],
    ["axis label", 930, 930 + capsH(24)],
    // the year labels and their leader stems are ONE element visually — the stem
    // exists to tie the label to the axis, so a small gap between them is the
    // design, not crowding.
    // the stems TERMINATE on the axis, so label+stem+axis is one connected
    // element; a zero gap between them is the design, not crowding.
    ["year labels + stems + axis", 1140, 1273],
    ["dimension span", 1338, 1364],
  ],
  "§4 The Thesis (settled)": [
    ["cash figure", 356, 556],
    ["cash label", 600, 600 + capsH(24)],
    ["mark row", 838, 962],
    ["marks label", 1010, 1010 + capsH(26)],
    ["question", 1160, 1160 + capsH(24)],
    ["thesis label", 1220, 1220 + capsH(28)],
    // the marker's TRAVEL band, not just its rest position (08-15: check the
    // path). It descends 40px onto the track and then sits ON it, so the marker
    // and the track overlap by design — merged into one band here.
    ["thesis marker + track", 1289, 1355],
    ["track label", 1390, 1390 + capsH(22)],
  ],
};

// ── width checks (0.74em/glyph through caps(), 0.60em for display) ──────────
const WIDTHS = [
  ["Increased pessimism on the US path.", 36, DISP, 860],
  ["LEERINK PARTNERS", 38, CAPS, 860],
  ["US SQUAMOUS LAUNCH", 24, CAPS, 860],
  ["Q4 2029", 32, CAPS, 400],
  ["2027", 32, CAPS, 400],
  ["A THIRD CHINA APPROVAL IS REAL", 26, CAPS, 900],
  ["NOT WHAT HAS TO BE TRUE", 24, CAPS, 900],
  ["THE IVONESCIMAB THESIS", 28, CAPS, 580],
  ["SUMMIT CASH ON HAND", 24, CAPS, 900],
  ["$690M", 200, DISP, 1000],
  ["SUMMIT THERAPEUTICS + AKESO", 34, CAPS, 900],
  ["FIRST-LINE", 30, CAPS, 900],
  ["SQUAMOUS NSCLC", 46, CAPS, 900],
  ["+ CHEMOTHERAPY", 32, CAPS, 900],
  ["FIRST-LINE SQUAMOUS NSCLC · + CHEMOTHERAPY", 24, CAPS, 900],
  ["PROGRESSION-FREE SURVIVAL", 22, CAPS, 860],
  ["Told a different story", 52, DISP, 860],
  ["CHINA APPROVALS", 24, CAPS, 900],
  ["IVONESCIMAB", 68, DISP, 900],
];

let fail = 0;
const ok = (c, name, detail) => {
  console.log((c ? "ok    " : "FAIL  ") + name.padEnd(44) + detail);
  if (!c) fail++;
};

for (const [sec, els] of Object.entries(SECTIONS)) {
  console.log("\n" + sec + "\n" + "-".repeat(78));
  const rows = els.map(([n, t, b]) => [n, Math.round(t), Math.round(b)]).sort((a, b) => a[1] - b[1]);
  for (let i = 0; i < rows.length; i++) {
    for (let j = i + 1; j < rows.length; j++) {
      const [n1, t1, b1] = rows[i], [n2, t2, b2] = rows[j];
      if (b1 > t2 && b2 > t1) ok(false, "OVERLAP " + n1 + " / " + n2, `${t1}-${b1} vs ${t2}-${b2}`);
    }
  }
  const gaps = [];
  for (let i = 1; i < rows.length; i++) gaps.push(`${rows[i - 1][0]}→${rows[i][0]}: ${rows[i][1] - rows[i - 1][2]}`);
  rows.forEach(([n, t, b]) => console.log(`      ${n.padEnd(24)} ${String(t).padStart(5)} – ${String(b).padStart(5)}`));
  console.log("      gaps: " + gaps.map((g) => g.split(": ")[1]).join(", "));
  const top = rows[0][1], bot = rows[rows.length - 1][2];
  const head = top - BAND[0], foot = BAND[1] - bot;
  ok(bot < SAFE, "clears the platform-UI safe zone", `${bot} < ${SAFE}`);
  ok(Math.abs(head - foot) < 220, "headroom vs footroom balanced", `head ${head} / foot ${foot}`);
  const tight = gaps.filter((g) => Number(g.split(": ")[1]) < 14);
  ok(tight.length === 0, "no crowded pair (<14px)", tight.length ? tight.join("; ") : "min gap ok");
}

console.log("\nWIDTHS\n" + "-".repeat(78));
for (const [txt, size, budget, avail] of WIDTHS) {
  // a label TYPED in all caps is still wide (~0.7em/glyph), sentence case or not
  const b = budget === CAPS && /[A-Z]/.test(txt) && txt === txt.toUpperCase() ? 0.7 : budget;
  const w = Math.round(txt.length * size * b);
  ok(w <= avail, `fits: ${txt.slice(0, 34)}`, `${w}px of ${avail} @${size}px`);
}

console.log("\n" + (fail ? `✗ ${fail} layout problem(s)` : "✓ all layout checks pass"));
process.exit(fail ? 1 : 0);
