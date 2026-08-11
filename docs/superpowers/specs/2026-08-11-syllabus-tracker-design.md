# তোর সিলেবাস শেষ হইসে ট্র্যাকার — Design

**Date:** 2026-08-11
**Product name:** তোর সিলেবাস শেষ হইসে ট্র্যাকার
**Client:** Edge Course BD (`edgecoursebd.com`)
**Brands:** Infinity School (SSC) · Hulkenstein (HSC)
**Repository:** https://github.com/Shamiur777/Tor-Syllabus-Sesh-Hoise-Tracker

The product name appears as the page title, the `<title>` tag, the Open Graph title, and the
heading on the landing screen. It is not translated or transliterated anywhere in the interface.

## Purpose

A single-page interactive tool that asks a Bangladeshi SSC or HSC student to tick off the
chapters they have completed, computes what percentage of their syllabus is done, and returns
a shareable result image. Students who are not enrolled in the relevant Edge Course program are
shown a prompt to enrol and asked for contact details, which are written to a Google Sheet as
sales leads.

The tool serves two goals at once: genuine utility for the student, and lead capture for Edge
Course. The utility must be real, or the lead capture does not work.

## Constraints

- Hosted on `edgecoursebd.com`, which runs React and Django. The deliverable must not require
  touching either. It is a static page.
- No build step, no npm dependencies, no external JS libraries. One Google Fonts `<link>` is
  the only permitted external resource.
- Must work in Facebook and Instagram in-app browsers, which are the dominant traffic source.
- Bengali-dominant interface. Subject and chapter names stay in the language the syllabus is
  supplied in.
- The Apps Script backend must be created as a **standalone project from `script.google.com`**.
  Creating it from the Sheet's Extensions menu has failed for this client before.

## Architecture

A single self-contained `syllabus-tracker.html` — inline CSS, vanilla JS. This follows the
convention already established by `COMEBACK/index.html` and the `hsc28-*.html` pages in the
same client's history.

The file is internally divided into three blocks with different edit frequencies:

| Block | Contents | Edited by client |
|---|---|---|
| `SYLLABUS` | The full syllabus tree as a plain JS object | Frequently |
| `CONFIG` | Tier thresholds, image paths, Apps Script URL, enrol links, brand tokens | Occasionally |
| Engine | Wizard state machine, scoring, canvas renderer, submission | Never |

The boundary matters: the client updates syllabus content on their own, and must be able to do
so without reading or understanding the engine.

### Syllabus data model

```
SYLLABUS[level][batch][group] = {
  subjects: {
    <subjectId>: {
      name: string,
      compulsory: boolean,       // pre-ticked and locked on the subject picker
      defaultSelected: boolean,  // pre-ticked but unlockable
      papers: [
        { name: '1st Paper', chapters: [ { id, name } ] },
        { name: '2nd Paper', chapters: [ { id, name } ] }
      ]
    }
  }
}
```

`level` is `ssc` | `hsc`. `batch` is `27` | `28`. Subjects without a paper split carry a single
unnamed paper, rendered without a paper heading.

Batch '27 and '28 hold identical syllabus content at launch. They are separate keys anyway, so
the two batches can diverge later without restructuring. Only tier thresholds and result images
differ between them today.

## Screen flow

1. **Landing** — student name, institute name.
2. **Class** — SSC or HSC. Brand switches here (Infinity School vs Hulkenstein) and persists
   through every later screen and onto the result image.
3. **Batch** — 27 or 28.
4. **Group** — SSC: Science / Arts / Commerce. HSC: Science / Business Studies / Humanities.
5. **Subject picker — HSC only.** SSC groups have fixed subject sets and skip this screen
   entirely, going straight from group selection to the syllabus. For HSC: Science and Business
   Studies open with the standard combination pre-ticked and unlockable; Humanities opens with
   only compulsory subjects ticked and the remaining optional subjects unticked, since HSC
   Humanities students choose from roughly 18 offered subjects.
6. **Syllabus** — one accordion per selected subject, chapter checkboxes within, split by paper.
   A sticky progress ring shows live completion. The enrolment question sits on this same page,
   as specified.
7. **Enrolment response** —
   - Enrolled: `সাব্বাশ, রাইট ট্র্যাকেই আছো!` then straight to the result.
   - Not enrolled: `এভাবে ত মামা তোমার সিলেবাস জীবনেও শেষ হবে না! আজই এনরোল করো।` then a phone
     and email form, then submission, then the result.
8. **Result** — percentage, tier image, download and share.

The enrolment course referenced depends on level: *Academic to Admission* for HSC, *Complete
Academic Program (CAP)* for SSC.

## Scoring

Flat item count:

```
completion % = (checked chapters / total chapters in selected subjects) × 100
```

Only subjects the student actually selected count toward the denominator. A Humanities student
taking 7 subjects is scored against those 7, not against all 18 offered.

Rounded to the nearest integer for display and for tier assignment.

### Tier thresholds

Held in `CONFIG` so they can be retuned without code changes.

**Batch '27** — `0–29` · `30–49` · `50–69` · `70–100`
**Batch '28** — `0–10` · `11–30` · `31–60` · `61–100`

The source brief listed the '28 bands as "31-60%" and "60-100%", which overlap at exactly 60.
Resolved to a cut at 60/61. Confirmed with the client.

## Result image

1080×1920 (story format), drawn with native `<canvas>`. No `html2canvas` or equivalent.

Composition:
- Tier background image, anchored to the bottom.
- School logo (Infinity or Hulkenstein), top-left.
- Student name and institute name, centred at top.
- Completion percentage as the hero number.

Eight background images total: four tiers × two batch years. SSC and HSC share backgrounds
within a batch year, because the logo overlay already distinguishes them.

Two implementation requirements:

- **Font loading.** Bengali requires complex text shaping. Canvas `fillText` shapes correctly
  via the platform text engine, but only once the webfont has loaded. The renderer must
  `await document.fonts.load()` for every weight and family it draws with before the first
  draw, or conjuncts render as tofu boxes on slow connections.
- **Download fallback.** Primary path is `canvas.toBlob` plus an `<a download>`. iOS Safari
  ignores the download attribute, so the failure path displays the image full-screen with a
  `ছবিটা চেপে ধরে সেভ করো` instruction. A Web Share API button is offered where supported,
  since sharing to Story is the actual intent.

All images must be same-origin to avoid tainting the canvas and breaking `toBlob`.

## Lead capture

Only non-enrolled students submit. Enrolled students are never asked for contact details and
no row is written for them.

### Backend

A standalone Google Apps Script project, created at `script.google.com`, reaching the target
spreadsheet by ID rather than by binding:

```javascript
SpreadsheetApp.openById('1hnoInIk37frhk6DBIxGWOkSjN9PAkOj9f_pbL3rCwRI')
```

Deployed as a Web App with *Execute as: me* and *Access: anyone*.

### Transport

The page POSTs with `Content-Type: text/plain`. This avoids the CORS preflight request, which
Apps Script does not answer and which otherwise causes the call to fail silently in the browser.
A hidden-form fallback covers in-app webviews with stricter fetch behaviour.

Submission failure must not block the student from seeing their result. The result screen
renders regardless; a failed write is logged to console and retried once.

### Sheet columns

`Timestamp · Name · Institute · Class · Batch · Group · Subjects · Completion % · Tier · Phone · Email · Enrolled · utm_source · utm_campaign`

`Class`, `Batch` and `Group` are written as separate columns rather than a single combined
string, so the sheet can be filtered and pivoted. A human-readable combined label
(e.g. `HSC Science 27`) is not stored separately; it is derivable.

`Enrolled` is always `No` at launch, since only non-enrolled students submit. The column exists
so that enrolled students can be logged later without a schema migration, and so the sheet's
meaning is self-evident to anyone reading it cold.

### Validation

- Phone: Bangladeshi format, `01XXXXXXXXX`, 11 digits. Required.
- Email: standard format check. Required.
- Name and institute: non-empty, collected at step 1.

## Persistence

Progress auto-saves to `localStorage` — student details, selected subjects, and every ticked
chapter. Returning on the same browser resumes in place. A `শুরু থেকে করো` control clears it.

Stored state is versioned by a schema key. A syllabus update that changes chapter IDs
invalidates old state rather than silently mis-scoring a returning student.

## Design

Extends the existing client design system rather than introducing a new one:

- Baloo Da 2 for display, Hind Siliguri for body, loaded from Google Fonts.
- Light theme. One accent colour per brand, applied consistently to every CTA and progress
  indicator.
- Sticky animated progress ring, per-subject completion bars, staggered card reveals, check
  animation on tick, count-up animation on the final percentage.
- Responsive with no horizontal overflow and no tap target under 44px, verified from 375×667
  upward.

## Deliverables

Everything the `edgecoursebd.com` developer needs is committed and pushed to
`https://github.com/Shamiur777/Tor-Syllabus-Sesh-Hoise-Tracker` — not the HTML alone, but the
Apps Script source, both setup guides, the placeholder asset tree, and a repository `README.md`
that orients a developer arriving cold with no context from this engagement.

```
README.md
syllabus-tracker.html
images/
  infinity-logo.png
  hulkenstein-logo.png
  results/
    batch27-tier1.png … batch27-tier4.png
    batch28-tier1.png … batch28-tier4.png
apps-script/Code.gs
SETUP-APPS-SCRIPT.md
INTEGRATION-NOTES.md
```

`SETUP-APPS-SCRIPT.md` is a numbered click-by-click guide starting at `script.google.com`,
covering the authorisation screen (*Advanced → Go to project*) that commonly blocks first-time
setup, and a `doGet` test URL for verifying a row lands before the page goes live.

`INTEGRATION-NOTES.md` follows the format of the client's previous integration notes: what the
file is, what to deploy together, what will need editing, known intentional quirks.

## Assets required from client

1. Chapter-level syllabus for SSC Science / Arts / Commerce and HSC Science / Business Studies /
   Humanities, with 1st and 2nd paper split.
2. The full HSC Humanities optional subject list, marking which are compulsory.
3. Eight tier background images at 1080×1920.
4. Infinity School and Hulkenstein logos as transparent PNGs.
5. Enrolment URLs for Academic to Admission (HSC) and Complete Academic Program (SSC).

## Out of scope

- Server-side storage beyond the Google Sheet.
- Student accounts, login, or cross-device sync.
- Editing the syllabus through a UI. The client edits the `SYLLABUS` object directly.
- Any change to the existing React or Django application.
