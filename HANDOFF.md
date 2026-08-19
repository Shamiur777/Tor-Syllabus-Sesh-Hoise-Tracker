# Handoff — তোর সিলেবাস শেষ হইসে ট্র্যাকার

Written 2026-08-19 so a fresh session (or another developer) can pick this up
cold. Read this first, then `README.md` for how to build and `INTEGRATION-NOTES.md`
for how to deploy.

**Repo:** https://github.com/Shamiur777/Tor-Syllabus-Sesh-Hoise-Tracker
**Branches:** `main` and `feat/syllabus-tracker` are identical and both pushed.
**State:** working, deployable, 75 tests passing. Two things block full launch —
see *Outstanding work* below.

---

## What this is

A single self-contained `syllabus-tracker.html` for Edge Course BD. A Bangladeshi
SSC or HSC student enters their name and institute, picks class / batch / group,
ticks off the syllabus chapters they have finished, and gets a completion
percentage plus a shareable 1080×1920 result image. Students who say they are
**not** enrolled in the relevant course are asked for phone and email, which is
written to the client's Google Sheet as a sales lead.

Deployed as a static page on `edgecoursebd.com`. No React or Django changes.

---

## Architecture in one minute

Source lives in `src/`, and a dependency-free Node script inlines it into the
single deployable file:

```
src/index.html      page skeleton with {{STYLES}} / {{SCRIPT}} placeholders
src/styles/*.css    tokens -> components -> screens (concatenated in that order)
src/data/config.js  tiers, image paths, Apps Script URL, brand palettes, copy
src/data/syllabus.js  the syllabus tree — the file edited most often
src/lib/*.js        subjects, scoring, validation, state, tracking, submit,
                    canvas, ui, main
scripts/build.mjs   the bundler
tests/*.test.js     node:test unit tests
```

```bash
node scripts/build.mjs   # regenerate syllabus-tracker.html
node --test              # run all 75 tests  (NOT `node --test tests/` — fails on Windows)
```

**There is no npm install. There are no dependencies. Never hand-edit
`syllabus-tracker.html`** — it is generated and committed.

The bundler concatenates modules into one IIFE, strips `import`/`export`, then
**validates its own output**: it throws if any module syntax survives and it
parse-checks the bundle with `new Function`. So a build failure means bad source,
never a bad build script. Use **named exports only** — `export default` throws by
design.

---

## Decisions that are not obvious

These all look like mistakes and are not. Do not "fix" them without reading why.

| Thing | Why |
|---|---|
| Lead POST uses `Content-Type: text/plain` | Apps Script cannot answer a CORS preflight. text/plain keeps the request "simple" so no preflight is issued. Changing it to `application/json` breaks submission entirely. |
| Hidden-form fallback assumes success | It cannot read its own response. A dropped lead beats a student stuck on a spinner in the Facebook in-app browser. |
| Two full themes, not one accent swap | The logos are **opaque JPEGs**, not transparent PNGs. SSC is light because Infinity's logo background is white; HSC is dark because Hulkenstein's is black. Every palette value is sampled from the artwork. Retuning `--bg` puts a visible rectangle back around a logo. |
| No `transition` on `body` background/color | The theme switches by toggling `data-brand` at runtime. Chromium does not restart a running transition when its `var()` source changes, so the transition sticks and the page keeps the old theme while children repaint. This shipped once and was caught in review. There is a comment in `tokens.css`. |
| Accordions collapse to first-open on every tick | The whole screen re-renders per tick to keep the ring, percentage and bars live. Deliberate tradeoff. |
| `Enrolled` column always reads `No` | Enrolled students skip the lead form entirely and are never sent to the backend. The column exists so enrolled students can be logged later without a schema migration. |
| Result image only works over `http(s)://` | `file://` taints the canvas and blocks export. Not a bug. |
| Canvas awaits `document.fonts.load()` | Bengali needs complex shaping. Without the await, conjuncts render as tofu boxes on slow connections. Verified working via ink-profile analysis. |

---

## Outstanding work

### 1. Syllabus content — PARTIALLY DONE, blocks launch

`src/data/syllabus.js` header lists this too. Current state:

| Group | Subjects | Chapters | Status |
|---|---|---|---|
| HSC Science | 7 | 115 | **Real** — from client file |
| SSC Commerce | 4 | 40 | **Real** — from client PDF |
| SSC Science | 4 | 4 | Placeholder |
| SSC Arts | 4 | 4 | Placeholder |
| HSC Business Studies | 5 | 14 | Placeholder (ICT real) |
| HSC Humanities | 11 | 26 | Placeholder (ICT real) |

Placeholder chapters read `PLACEHOLDER — বিষয়বস্তু নিশ্চিত করতে হবে`. A student in
a placeholder group gets a meaningless percentage, so those four groups must be
filled before launch.

A background research agent was dispatched to source the four missing groups; its
findings were to be written to `research/syllabus-research.md` (git-ignored). **If
that file exists, treat it as unverified** — check it against the notes below
before trusting it.

**Sources already used:**
- `syllabus-source/HSC Syllabus.txt` — client-supplied, complete for HSC Science.
  Higher Math 2nd Paper was missing and was filled from the web (10 chapters,
  chapter 6 `কণিক` had to be recovered separately — the first source skipped it).
- `syllabus-source/SSC Commerce Syllabus.pdf` — client-supplied, 2027 SSC.
  **Its text layer is corrupted** (legacy font, no ToUnicode map): copying gives
  `পাঠ্যসূসি` instead of `পাঠ্যসূচি`. Do not extract text from it. Render the pages
  and read them visually:
  ```python
  import fitz
  d = fitz.open("syllabus-source/SSC Commerce Syllabus.pdf")
  d[n].get_pixmap(dpi=140).save(f"p{n:02d}.png")
  ```
  Page mapping: file index = printed page − 1. Still unread: গণিত (printed 14–15),
  বিজ্ঞান (20), বাংলা (3, 5), ইংরেজি (9, 11), plus religion / career / physical ed.
  Those compulsory subjects are **not yet in SSC Commerce**, so its percentage
  currently covers only the four business subjects.

**Rules when adding content:**
- Never invent a chapter. A fabricated chapter silently corrupts every student's
  percentage. Leave a gap and flag it instead.
- Chapter ids follow `<level><batch>-<subjectId>-<paper>-<n>` and must be unique.
- **Ids must never be reused for different content** — returning students are
  matched by id. After renumbering, bump `SCHEMA_VERSION` in `src/lib/state.js`
  (currently `2`) so stored progress resets rather than mis-scores.
- `tests/subjects.test.js` catches duplicate ids. Run `node --test` after editing.
- Bangladesh's curriculum was rolled back from the 2021/2023 framework to the
  older one. Verify which curriculum applies before trusting any web source, and
  have a teacher confirm against what Edge Course actually teaches.

### 2. Google Sheet backend — NOT DEPLOYED, blocks lead capture

`apps-script/Code.gs` and `SETUP-APPS-SCRIPT.md` are written and committed, but
the web app has **not been deployed** — that needs clicks in the client's own
Google account.

Until `CONFIG.appsScriptUrl` in `src/data/config.js` is filled, submissions are
skipped with a console warning and the student still reaches their result. Nothing
else is blocked.

The guide starts at **`script.google.com`** and creates a *standalone* project that
opens the sheet by ID. **Do not** use the spreadsheet's *Extensions → Apps Script*
menu — container-bound scripts have repeatedly failed on this client's account.
Deployment access must be `Anyone`, not `Anyone with Google account`, because
students arrive via the Facebook in-app browser with no Google session.

Sheet: `1hnoInIk37frhk6DBIxGWOkSjN9PAkOj9f_pbL3rCwRI`

### 3. Also unfilled

- `CONFIG.enrolUrls.ssc` / `.hsc` — the CAP and Academic-to-Admission course URLs.
  Until set, the "কোর্স দেখে আসো" link is omitted rather than pointing nowhere.
- GA4 and Meta Pixel blocks in `src/index.html` are present but commented out.

---

## Result artwork

Nine images in `images/results/`, generated by `scripts/make-result-art.py` from
the client's photos in `source-art/`. The script cuts the subject out with
`rembg` (u2net) and quantises to a 255-colour palette — roughly 870KB down to
250KB per image, which matters for students on mobile data.

Tier mapping, confirmed with the client:

| Slot | Band | Image |
|---|---|---|
| batch27-tier1 / batch28-tier1 | <30 / 0–10 | তুই তো শেষ মামা |
| batch27-tier2 / batch28-tier2 | 30–49 / 11–30 | এভাবে চলবে না! |
| batch27-tier3 | 50–69 | আরও ভাল করতে হবে! |
| batch27-tier4 | 70–100 | পারফেক্ট! ট্র্যাক ধরে রাখো... |
| batch28-tier3 | 31–60 | সাবাস! আরও ভালো করতে হবে! |
| batch28-tier4 | 61–100 | তুই তো GOAT মামা! |
| perfect | exactly 100 | মিথ্যা কথা বলিস কেন! |

To regenerate after new photos: drop them in `source-art/`, update the `MAP`
dict in the script, run `python scripts/make-result-art.py`, then rebuild.
Requires `rembg` and `onnxruntime` (`pip install rembg onnxruntime`) — local
authoring only, never part of the deployed page.

---

## Verification history

Everything below was verified by driving the real page in a browser, not by
trusting test output. Seven Critical/Important bugs were found during the build;
**all were specification errors, none were transcription errors by the
implementing agents.** Three were invisible to unit tests:

- The page could not advance past the name field at all (stale state closure).
- Compulsory subjects were rendered locked *and unchecked*, so they were silently
  dropped — an HSC Science student ticking Biology would have been scored against
  one subject instead of five, with a confident-looking wrong number.
- The lead form was an unrecoverable dead end; a mis-tap on "না" trapped the
  student with no back button, surviving even a reload.
- Apps Script had no `LockService`, so a class submitting at once could lose rows.

Also verified: all 202 tier-boundary values across both batches, a full 0..19
chapter scoring sweep, every BD phone operator prefix and `+880` normalisation,
screen routing in both directions, both themes end to end, Bengali canvas shaping
via ink-profile analysis, WCAG AA contrast on the dark theme, no tap target under
44px, and no horizontal overflow at 320px.

The build's three validation gates were mutation-tested — disabling each one
fails 1, 2 and 4 tests respectively, so none are dead code.

---

## Working notes

- Serve locally with `python -m http.server 8765` and open
  `http://localhost:8765/syllabus-tracker.html`. The result image will not
  generate from `file://`.
- The browser caches `images/results/*.png` aggressively. After regenerating
  artwork, hard-reload or fetch with `{cache:'reload'}` or you will be looking at
  the old images.
- `.superpowers/` holds the build ledger and per-task reports from the original
  implementation run. Git-ignored, useful for archaeology.
- `docs/superpowers/specs/` and `docs/superpowers/plans/` hold the original design
  spec and the 18-task implementation plan. The plan is now partly historical —
  tasks 1–14, 16 and 17 are complete; task 15 (content) is the one still open.
