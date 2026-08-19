# Integration notes — তোর সিলেবাস শেষ হইসে ট্র্যাকার

## What this is

One self-contained HTML file (`syllabus-tracker.html`). No build step to deploy, no React or
Django changes — drop it on a server or CDN as a static page and it works. The build step
(`node scripts/build.mjs`) only concerns people editing the source in this repository; the
deployed artifact needs nothing but a static file host.

## Files to deploy together

- `syllabus-tracker.html`
- The full `images/` tree, sitting **beside** the HTML file (same directory level)

The page references images by relative path (e.g. `images/infinity-logo.png`). If `images/` is
deployed anywhere other than next to the HTML file, either move it back alongside the HTML or
update the `src` paths in `src/data/config.js` and `src/lib/canvas.js` before rebuilding.

**Placeholder images:** `images/results/batch27-tier{1..4}.png` and
`images/results/batch28-tier{1..4}.png` are currently placeholder artwork at the correct
1080×1920 dimensions — not final creative. The client is replacing these with real designs in a
later task. No code change is needed when that happens; the same eight filenames just get
overwritten in place.

## Things you'll likely need to edit

- **`CONFIG.appsScriptUrl`** (`src/data/config.js`) — currently empty. Until this is set, lead
  submissions are silently skipped (a console warning fires, the student still reaches the
  result screen). See `SETUP-APPS-SCRIPT.md` for how to get this URL.
- **`CONFIG.enrolUrls`** (`src/data/config.js`) — populated for all 12 level/batch/group
  combinations. It is a flat map read most-specific-first by `resolveEnrolUrl()`
  (`src/lib/enrol.js`): `<level>-<batch>-<group>` then `<level>-<batch>` then `<level>`. Add a
  group-specific key to override a batch's general programme. A missing key omits the
  "কোর্স দেখে আসো" link rather than pointing nowhere, and `tests/enrol.test.js` fails if any
  group a student can pick has no url.
- **`CONFIG.tiers`** (`src/data/config.js`) — the percentage bands that decide which result
  image a student sees, per batch. Retune the `min`/`max` values here directly; do not touch the
  tier-resolution code in `src/lib/scoring.js`.
- **The GA4 and Meta Pixel blocks** in `<head>` of `src/index.html` — both present but commented
  out. Replace the placeholder ids (`G-XXXXXXXXXX`, `XXXXXXXXXXXXXXX`) and uncomment to enable.
  Rebuild after editing (`node scripts/build.mjs`).

After editing any of the above in `src/`, rebuild and deploy the regenerated
`syllabus-tracker.html` — the file living on the server is a snapshot, not something you patch
directly.

## Known intentional quirks

- **The lead POST uses `Content-Type: text/plain`.** This looks wrong and is deliberate: Apps
  Script cannot answer a CORS preflight request, so the request body is sent in a form that
  never triggers one. The Apps Script endpoint still reads and parses it as JSON regardless of
  the declared content type.
- **The result image only generates over `http(s)://`.** Opening the file directly from disk
  (`file://`) taints the canvas the image is drawn to and blocks export. This is a browser
  security restriction, not a bug — it will work correctly once served over http or https.
- **Enrolled students are never written to the sheet.** The `Enrolled` column in the Leads sheet
  always reads `No`, because a student who answers "yes, I'm enrolled" skips the lead form
  entirely and is never sent to the backend at all — there's nothing to write.
- **Accordions collapse to the first subject on every tick.** Ticking any chapter checkbox
  re-renders the whole progress screen, and that re-render always opens the first subject's
  accordion and collapses the rest, regardless of what was open before the click. This is a
  deliberate tradeoff to keep the progress ring, percentage and per-subject bars live and
  accurate on every tick, rather than a state bug to fix.

## Design notes

Fonts are Baloo Da 2 and Hind Siliguri, loaded from Google Fonts — the same pairing used in
`COMEBACK/index.html`, the client's earlier page.

There are two full themes, not one theme with a swapped accent colour: SSC is a light theme with
a blue accent, HSC is a dark theme with a green accent, switched by `data-brand` on `<body>`.
This isn't a stylistic choice — it follows directly from the source artwork. The client supplied
both logos as **opaque JPEGs** (not transparent PNGs), so each was trimmed to its content
bounding box and saved as a PNG (`images/infinity-logo.png`, `images/hulkenstein-logo.png`), and
every colour in each theme's palette (page background, surfaces, ink) is sampled from that
logo's own artwork — the SSC page background matches the Infinity logo's white, the HSC page
background matches Hulkenstein's black. This is why the two palettes should not be retuned
casually: changing `--bg` on either theme without re-checking it against the logo file risks
putting a visible rectangle back around a logo that's currently sitting flush against a matching
background.
