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
| HSC Science | 7 | 115 | **Real** — client file |
| SSC Commerce | 8 | 125 | **Real** — client PDF; বিজ্ঞান flagged (see below) |
| HSC Humanities | 11 | 113 | **Researched** — 8 high-confidence, Sociology flagged, Social Work placeholder |
| HSC Business Studies | 5 | 30 | **Partly researched** — Accounting + Production/Marketing done; Management and Finance placeholder |
| SSC Science | 4 | 28 | **Researched** — Physics/Chemistry/Higher Math high, Biology flagged |
| SSC Arts | 4 | 19 | **Partly researched** — History high; Civics + Economics flagged; Geography placeholder |

Subjects whose name ends ` [যাচাই করতে হবে]` were transcribed from medium-confidence
sources and are visibly flagged in the UI so a teacher can spot them. SSC Commerce
বিজ্ঞান carries the same flag for a different reason: the client PDF itemises only
nine of the book's chapters (see below).

**Still placeholder (deliberately — research confidence was low or the source was
unreadable):** SSC ভূগোল ও পরিবেশ, HSC ব্যবসায় সংগঠন ও ব্যবস্থাপনা, HSC ফিন্যান্স
ব্যাংকিং ও বীমা, HSC সমাজকর্ম.

**Compulsory Bangla / English for HSC Business and Humanities are not populated.**
Research found a genuine conflict between the 2023 and 2026 official versions —
different prose, poems and units entirely. That needs a client decision per exam
year, not a silent merge.

**Critical caveat from the research pass:** no NCTB document for 2027 or 2028
exists yet. Every researched list is the newest confirmed prior-year baseline
(SSC 2026, HSC 2023). Re-check nctb.gov.bd closer to each exam, and have a teacher
confirm against what Edge Course actually teaches.

Full findings with per-subject sources and confidence: `research/syllabus-research.md`
(git-ignored; regenerate or ask for it if missing).

Placeholder chapters read `PLACEHOLDER — বিষয়বস্তু নিশ্চিত করতে হবে`. A student whose
selected subjects are all placeholder gets a meaningless percentage.

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
  Page mapping: file index = printed page − 1. All compulsory-subject pages have
  now been read: বাংলা (printed 3–6), ইংরেজি (9–11), গণিত (14–16), বিজ্ঞান (20).
  Still unread: religion / career / physical education, and কৃষিশিক্ষা (21).
  বাংলা, ইংরেজি, গণিত and বিজ্ঞান are now in SSC Commerce, so its percentage
  covers all eight subjects (125 chapters). Two caveats, both
  because the PDF says "সম্পূর্ণ বই" for the SSC exam but only itemises chapters
  through the *school* exam breakdowns:
    - গণিত has 16 of the book's 17 chapters. The twelfth is named nowhere in the
      file and was left out rather than guessed.
    - বিজ্ঞান has only the nine itemised chapters, so it is flagged in the UI.
  বাংলা ২য় পত্র is modelled as the seven written/MCQ sections of the exam
  structure — the PDF's per-item lists (individual সারমর্ম passages, specific
  রচনা topics) are too granular to tick off.
  `SCHEMA_VERSION` was bumped 2 → 3 with this change, because SSC Commerce
  students' denominator moved from 40 to 125.

**Cross-check, 2026-08-19.** The client sent
`http://sib.gov.bd/downloads/1228994770.pdf` asking for a cross-check. That file
is **byte-identical** to `syllabus-source/SSC Commerce Syllabus.pdf`
(sha256 `8bc8e5dc5c9f84f82ae0c8d161d2dcc9c39752c05fd16f128f858130ada174e1`), so
there is no newer edition to reconcile — do not re-download it expecting a diff.

The four business subjects were re-verified against the source pages and all
match exactly, names and order included: হিসাববিজ্ঞান 11 (printed 24),
ফিন্যান্স ও ব্যাংকিং 12 (26), ব্যবসায় উদ্যোগ 12 (23), ICT 5 (27).

Three chapter-count questions remain open. **None can be settled from the
syllabus PDF — they need the actual textbooks or a teacher.** For accounting,
finance and entrepreneurship the school-exam breakdowns do enumerate the whole
book, so a list that stops short is a real signal:

| Question | App has | Evidence |
|---|---|---|
| What is গণিত chapter 12? | 16 of 17 | Provable gap: chapter 17 is itemised, 12 never is |
| Does বিজ্ঞান have chapters past 9? | 9 | List stops at 9 while the SSC syllabus is সম্পূর্ণ বই |
| Does ICT have a chapter 6? | 5 | Same shape as বিজ্ঞান; not flagged in the UI (see below) |

বিজ্ঞান is flagged ` [যাচাই করতে হবে]`; ICT deliberately is not, because nothing
inside the document proves it is incomplete — it may genuinely be a 5-chapter
book, and over-flagging dilutes the signal for teachers. If a teacher confirms a
sixth chapter, add it and flag ICT to match.

Also in the PDF but not in the app: কৃষিশিক্ষা (code 134, printed 21) and subject
codes 147 (printed 25) and 156 (printed 29). Confirm with the client that these
are intentionally out of scope.

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
