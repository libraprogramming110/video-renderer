// Stage 5 — Background music (the bed under the VO), from Jamendo (free, CC).
//
// Music is taste-driven and Claude can't hear it, so this is a HUMAN PICK-GATE:
//   1) LIST:  node scripts/fetch-music.mjs "calm corporate ambient"
//        → queries Jamendo (CC-BY, commercial-OK, downloadable), prints a numbered
//          shortlist with a LISTEN URL each, saves src/music-candidates.json.
//          You open the URLs and listen — nothing is downloaded yet.
//   2) PICK:  node scripts/fetch-music.mjs --pick <id>
//        → downloads that one track → public/music/bed.mp3, flips src/music.json
//          to enabled, and records attribution in public/music/CREDITS.txt.
//
// Env: JAMENDO_CLIENT_ID (free at https://devportal.jamendo.com/ — never stored).
//
// Licensing: the free catalog is Creative Commons. We filter to CC-BY (commercial
// use OK *with attribution*) and write the attribution line to CREDITS.txt — put it
// in the YouTube description. For zero-attribution use, buy a Jamendo Licensing track.

import fs from "node:fs";
import path from "node:path";

const KEY = process.env.JAMENDO_CLIENT_ID;
if (!KEY) {
  console.error("✗ Set JAMENDO_CLIENT_ID (free Client ID at https://devportal.jamendo.com/).");
  process.exit(1);
}

const API = "https://api.jamendo.com/v3.0";
const musicDir = path.join("public", "music");
const candPath = path.join("src", "music-candidates.json");
const cfgPath = path.join("src", "music.json");

// CC-BY (+ CC-BY-SA) permit commercial use with attribution; the rest (NC/ND) don't
// fit a client deliverable. Keyed off the license URL Jamendo returns per track.
const commercialOK = (ccurl = "") => /\/(by|by-sa)\//.test(ccurl);
const licName = (ccurl = "") => {
  const m = ccurl.match(/licenses\/([a-z-]+)\//);
  return m ? `CC ${m[1].toUpperCase()}` : "CC";
};

const args = process.argv.slice(2);
const pickFlag = args.indexOf("--pick");

// ── PICK MODE ────────────────────────────────────────────────────────────────
if (pickFlag !== -1) {
  const id = args[pickFlag + 1];
  if (!id) {
    console.error("✗ Usage: node scripts/fetch-music.mjs --pick <id>");
    process.exit(1);
  }
  if (!fs.existsSync(candPath)) {
    console.error("✗ No src/music-candidates.json — run the LIST step first (with a mood query).");
    process.exit(1);
  }
  const cands = JSON.parse(fs.readFileSync(candPath, "utf8"));
  const t = cands.find((c) => String(c.id) === String(id));
  if (!t) {
    console.error(`✗ id ${id} is not in the shortlist. Pick one of: ${cands.map((c) => c.id).join(", ")}`);
    process.exit(1);
  }
  if (!t.audiodownload) {
    console.error(`✗ Track ${id} ("${t.name}") has no downloadable audio. Pick another.`);
    process.exit(1);
  }
  fs.mkdirSync(musicDir, { recursive: true });
  console.log(`→ Downloading "${t.name}" — ${t.artist_name} …`);
  const buf = Buffer.from(await (await fetch(t.audiodownload)).arrayBuffer());
  fs.writeFileSync(path.join(musicDir, "bed.mp3"), buf);

  const credit = `Music: "${t.name}" by ${t.artist_name} — ${licName(t.license_ccurl)} — ${t.shareurl}`;
  fs.writeFileSync(cfgPath, JSON.stringify({ enabled: true, src: "music/bed.mp3", credit }, null, 2) + "\n");
  fs.writeFileSync(path.join(musicDir, "CREDITS.txt"), credit + "\n");
  console.log(`✓ Wrote public/music/bed.mp3  (${(buf.length / 1e6).toFixed(1)} MB, ${t.duration}s)`);
  console.log(`✓ Enabled music in src/music.json + wrote CREDITS.txt`);
  console.log(`i  ATTRIBUTION (put in the YouTube description):\n   ${credit}`);
  process.exit(0);
}

// ── LIST MODE ────────────────────────────────────────────────────────────────
const query = args.filter((a) => !a.startsWith("--")).join(" ").trim() || "calm corporate ambient";
const tags = query.replace(/\s+/g, "+");
// Pull a DEEP page (Jamendo max 200), then filter to commercial-OK + downloadable and
// keep the top few. The deep page matters: many popular tracks are CC-BY-NC (non-commercial),
// which we reject for a client deliverable — a shallow page can filter down to nothing.
const url =
  `${API}/tracks/?client_id=${KEY}&format=json&limit=200&fuzzytags=${encodeURIComponent(tags)}` +
  `&audioformat=mp32&order=popularity_total&include=licenses+musicinfo&audiodownload_allowed=true`;

const j = await (await fetch(url)).json();
if (j.headers?.status !== "success") {
  console.error(`✗ Jamendo API error: ${j.headers?.error_message || JSON.stringify(j.headers)}`);
  process.exit(1);
}
const SHORTLIST = 5;
const cands = (j.results || [])
  .filter((t) => commercialOK(t.license_ccurl) && t.audiodownload)
  .slice(0, SHORTLIST)
  .map((t) => ({
    id: t.id,
    name: t.name,
    artist_name: t.artist_name,
    duration: t.duration,
    license_ccurl: t.license_ccurl,
    shareurl: t.shareurl, // the LISTEN link
    audiodownload: t.audiodownload,
  }));

if (!cands.length) {
  console.error(
    `✗ No commercial-OK (CC-BY) downloadable tracks for "${query}". Try a different mood ` +
      `(e.g. "ambient piano", "uplifting corporate", "cinematic calm").`
  );
  process.exit(1);
}

fs.mkdirSync("src", { recursive: true });
fs.writeFileSync(candPath, JSON.stringify(cands, null, 2) + "\n");

const mmss = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
console.log(`\n🎵 Shortlist for "${query}" (CC-BY, commercial-OK). LISTEN, then pick one:\n`);
cands.forEach((t, i) => {
  console.log(`  ${i + 1}. ${t.name} — ${t.artist_name}`);
  console.log(`     ${mmss(t.duration)} · ${licName(t.license_ccurl)} · id ${t.id}`);
  console.log(`     listen: ${t.shareurl}\n`);
});
console.log(`→ When you've chosen: node scripts/fetch-music.mjs --pick <id>`);
console.log(`i  Saved ${candPath}. A track shorter than the video loops (MusicBed loop).`);
