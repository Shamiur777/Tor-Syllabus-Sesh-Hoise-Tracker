# Handoff — তোর সিলেবাস শেষ হইসে ট্র্যাকার

Written 2026-08-19 so a fresh session (or another developer) can pick this up
cold. Read this first, then `README.md` for how to build and `INTEGRATION-NOTES.md`
for how to deploy.

**Repo:** https://github.com/Shamiur777/Tor-Syllabus-Sesh-Hoise-Tracker
**Branches:** `main` and `feat/syllabus-tracker` are identical and both pushed.
**State:** **live** at https://hulkenstein.com/tor-syllabus-sesh-hoise (WordPress
page 10683), 79 tests passing. Lead capture and enrolment links both work end to
end. What is left is syllabus content — see *Outstanding work* below. Redeploy
instructions are in `INTEGRATION-NOTES.md`; the live page is a snapshot, so it
needs a redeploy after every build.

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
| SSC Science | 9 | 193 | **Real** — client textbook contents |
| SSC Commerce | 8 | 173 | **Real** — client PDF + textbook contents, corrected 2026-08-20 |
| HSC Business Studies | 7 | 127 | **Real** — client's full final syllabus, pasted in chat 2026-08-20 |
| HSC Humanities | 13 | 149 | **Real compulsory** (shared with Science/Business) + **researched** electives — 8 high-confidence, Sociology flagged, Social Work placeholder |

SSC Arts was removed entirely 2026-08-20 — the client does not serve those
students. There is no SSC Arts row above because the group no longer exists.

Subjects whose name ends ` [যাচাই করতে হবে]` were transcribed from medium-confidence
sources and are visibly flagged in the UI so a teacher can spot them. SSC Commerce
বিজ্ঞান carried the same flag for a different reason (the client PDF itemised only
nine of the book's chapters) until 2026-08-20, when a reviewer (Baha uddin, in
chat) checked against the real book and named the missing chapters directly —
এসো বলকে জানি and প্রাত্যহিক জীবনে তড়িৎ, 9 -> 11. Flag removed; this is now a
confirmed correction, not unverified research. The same message added
হিসাববিজ্ঞান's 12th chapter (পারিবারিক ও আত্মকর্মসংস্থানমূলক উদ্যোগের হিসাব, 11 -> 12)
and ফিন্যান্স ও ব্যাংকিং's 13th (কেন্দ্রীয় ব্যাংক, 12 -> 13). All three were pure
appends — existing chapter ids were untouched, so no SCHEMA_VERSION bump.

**Still placeholder (deliberately — research confidence was low or the source was
unreadable):** HSC সমাজকর্ম (Social Work). Everything else formerly on this list
— SSC ভূগোল ও পরিবেশ (group removed), HSC ব্যবসায় সংগঠন ও ব্যবস্থাপনা, HSC ফিন্যান্স
ব্যাংকিং ও বীমা — is real content now.

**Compulsory Bangla/English/ICT for HSC Business and Humanities are populated,**
sharing HSC Science's content — client decision 2026-08-20 that all three groups
sit the same syllabus for these three subjects, closing what had been a genuine
2023-vs-2026 curriculum-year conflict by not needing to pick one.

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

### SSC Science folder — transcribed 2026-08-19

`SSC Science Syllabus/` holds 13 photographed guide-book / textbook tables of
contents. They replaced the researched SSC Science lists entirely, and filled in
the compulsory subjects for all three SSC groups.

**Two rules apply, and mixing them up corrupts scoring.** There is a header
comment on `sscCompulsory()` saying the same thing, because this is the single
easiest mistake to make here:

- **Full book** — where the client's 2027 syllabus PDF says সম্পূর্ণ বই and
  enumerates nothing, the textbook contents *are* the syllabus. Physics 13,
  Chemistry 12, Biology 14, Higher Maths 14, Maths 17, ICT 6, BGS 15, and
  Bangla 2nd paper's 49 পরিচ্ছেদ all come straight from these ToCs.
- **Explicit subset** — where that PDF *does* enumerate content, its list wins
  over the textbook, because the exam is the subset. Bangla 1st paper stays at
  12 গদ্য + 12 পদ্য + 2 সহপাঠ though the book holds 25 + 28; English 1st paper
  stays at units 1-12 + 16 though the book holds 16 units. The ToCs prove the
  excluded material exists (অভাগীর স্বর্গ, নিমগাছ, ঝরনার গান; Loneliness,
  Renewable Energy, Media and Modes of E-communication) — it is simply off the
  exam. **Do not "complete" these two from the textbook.**

Bangla, English, Maths and ICT are one shared `sscCompulsory()` used by all
three groups — same national subject codes, so they must not drift apart.
Chapter ids are shared across groups on purpose; `tests/subjects.test.js`
already documents that.

**Two of the three open chapter-count questions are now closed:**

| Question | Answer |
|---|---|
| গণিত chapter 12 | **দুই চলকবিশিষ্ট সরল সহসমীকরণ** — Maths is now 17 of 17 |
| Does ICT have a chapter 6? | **Yes — প্রোগ্রামিংয়ের মাধ্যমে সমস্যার সমাধান.** Now 6 |
| Does বিজ্ঞান have chapters past 9? | **Still open.** Science-group students take BGS, not বিজ্ঞান, so this folder has no ToC for it. Commerce/Arts বিজ্ঞান keeps its flag |

`SCHEMA_VERSION` went 3 → 4: Bangla 2nd paper went from 7 coarse sections to 49
পরিচ্ছেদ, so ids 1-7 now mean different content and stored progress must reset
rather than mis-score.

**Deliberately NOT added, needs a decision:** `Islam Shikkha.jpeg` (5 chapters)
and `Krishi.jpeg` (7 chapters). SSC has no optional-subject picker —
`needsSubjectPicker('ssc')` is `false` and tested — so anything added here counts
against *every* student in the group. Religion is a per-student choice and only
the Islam book was supplied, so counting it would misprice every non-Muslim
student; কৃষিশিক্ষা is an optional 4th subject, so counting it would misprice
everyone who does not take it. Adding either properly means giving SSC the
picker HSC already has.

Still missing from the folder: **English 2nd paper.** Not a gap in practice —
English 2nd (code 108) is a national subject and its 12 test items came from the
client's Commerce PDF, which applies to every group.

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

### 2. Google Sheet backend — DEPLOYED AND VERIFIED 2026-08-19

`apps-script/Code.gs` is deployed as a web app and `CONFIG.appsScriptUrl` is set
in `src/data/config.js`. Lead capture works.

Verified three ways, not just by the endpoint existing:

1. `GET /exec` returns `{"ok":true,"message":"Endpoint is live..."}` over plain
   `curl` with no Google session — which also proves *Who has access* is `Anyone`
   rather than `Anyone with Google account`.
2. `GET /exec?test=1` returned `{"ok":true,"wrote":"test row"}`, so the
   spreadsheet scopes really are authorised.
3. The **production path** was exercised from the served page: a cross-origin
   `POST` with `Content-Type: text/plain` (the no-preflight trick) returned
   `{"ok":true}` 200. This is the one that matters — the two GETs above are
   same-origin-ish conveniences and would pass even if CORS were broken.

Two rows were written to the `Leads` tab during this and should be deleted: the
`TEST ROW` from step 2, and one reading `CLAUDE E2E TEST` / `DELETE THIS ROW`
from step 3.

If `Code.gs` ever changes, redeploy via **Manage deployments → pencil → Version:
New version**. A fresh *New deployment* mints a new URL that the page does not
know about.

The guide starts at **`script.google.com`** and creates a *standalone* project that
opens the sheet by ID. **Do not** use the spreadsheet's *Extensions → Apps Script*
menu — container-bound scripts have repeatedly failed on this client's account.
Deployment access must be `Anyone`, not `Anyone with Google account`, because
students arrive via the Facebook in-app browser with no Google session.

Sheet: `1hnoInIk37frhk6DBIxGWOkSjN9PAkOj9f_pbL3rCwRI`

### 3. Also unfilled

**Where should `SSC 27 LastShot Revision Batch` (courses/566) go?** It is the one
supplied URL with no home. The lead screen renders a single link, so the options
are: ignore it; use it for SSC 27 instead of the Academic Comeback Program; or
show it as a second link for SSC 27 only. Needs a client decision.

- ~~`CONFIG.enrolUrls`~~ — **done 2026-08-19.** All 12 level/batch/group
  combinations resolve to a real course. The config was keyed by level alone,
  which could not express the client's batch- and group-specific courses, so it
  is now a flat map read most-specific-first by `resolveEnrolUrl()` in
  `src/lib/enrol.js`:

      `<level>-<batch>-<group>`  ->  `<level>-<batch>`  ->  `<level>`

  A group-specific course therefore wins over the batch's general programme, and
  a missing key still omits the button rather than rendering a dead link.
  `tests/enrol.test.js` walks every group in `SYLLABUS` and fails if any student
  the UI can produce would reach the lead screen with no course to go to — so
  adding a group without adding its URL breaks the build rather than shipping a
  blank button. Verified in the browser too: HSC 28 business renders
  `courses/572`, SSC 27 commerce renders `courses/518` (not the general 480).

  One judgement call: `HSC27 Academic to Admission Course (Revive)` (346) names
  no group. Arts (347) and business (353) were supplied explicitly, so 346 is
  mapped to `hsc-27-science` by elimination. Worth a client confirmation.

  Not wired: `SSC 27 LastShot Revision Batch`
  (`https://edgecoursebd.com/courses/566`). It is a revision batch rather than
  the academic programme the lead screen points at, and the screen shows one
  link, so it needs a rule — see below.
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
