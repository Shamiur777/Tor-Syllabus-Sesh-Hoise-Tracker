# তোর সিলেবাস শেষ হইসে ট্র্যাকার

A single-page syllabus completion tracker for SSC and HSC students. A student picks their
class, batch and group, ticks off the chapters they've finished, and gets a shareable result
image showing how much of their syllabus is done.

Repository: https://github.com/Shamiur777/Tor-Syllabus-Sesh-Hoise-Tracker

## Quick start

There is no `npm install`, ever — this project has zero npm dependencies and never will. Node
18+ and its built-in test runner are all you need.

```bash
node scripts/build.mjs   # builds syllabus-tracker.html from src/
node --test               # runs the test suite (74 tests)
```

Run tests with the bare `node --test` — **not** `node --test tests/`, which fails on Windows.

## `src/` → `syllabus-tracker.html`

`syllabus-tracker.html` is a **generated file**. `scripts/build.mjs` reads every file in `src/`,
inlines the CSS into a `<style>` tag, strips the ES module `import`/`export` syntax from the JS
modules and concatenates them into a single `<script>` tag inside `src/index.html`'s shell, and
writes the result to `syllabus-tracker.html` at the repo root.

**Never hand-edit `syllabus-tracker.html`.** Any change made directly to it is silently
overwritten the next time someone runs the build. Always edit the source under `src/`, then run
`node scripts/build.mjs` and commit both the source change and the regenerated HTML file
together.

Module load order matters and is listed explicitly in `scripts/build.mjs`'s `MODULES` array —
a module must appear after everything it depends on, since the build concatenates them into one
shared scope rather than resolving imports for real. All exports under `src/` must be **named
exports**; a bare `export default` throws at build time by design (`stripModuleSyntax` in
`scripts/build.mjs` rejects anonymous default exports outright, and even a named default export
still isn't accepted — use `export function foo() {}` / `export const x = ...` instead).

## Adding or changing a subject or chapter

Subjects and chapters live in `src/data/syllabus.js`. The file is plain data: functions that
return an object keyed by subject id, each with a `name`, whether it's `compulsory` /
`defaultSelected`, and a list of `papers`, each with a list of `chapters`.

Worked example — adding a chapter to SSC Physics (batch-scoped, so this only touches one batch):

```javascript
function sscScience(batch) {
  const p = `ssc${batch}`;
  return {
    physics: {
      name: 'Physics', compulsory: true, defaultSelected: true,
      papers: [{ name: '', chapters: ch(`${p}-physics-x`, [
        'Motion', 'Force', 'Work Power Energy',
        'New Chapter Name',   // <- appended here
      ]) }],
    },
    // ...
  };
}
```

The `ch(prefix, names)` helper turns a list of names into `{ id, name }` pairs automatically
(`ssc27-physics-x-1`, `ssc27-physics-x-2`, ...), so you only ever type the human-readable name —
never the id — for a new chapter appended at the end.

To add a whole new subject, copy an existing entry in the same shape (a unique subject key, a
unique id prefix passed to `ch`, and at least one paper) and add it to the returned object.

## Chapter ids must never be reused

A returning student's progress is stored in `localStorage` as a list of **completed chapter
ids** (see `src/lib/state.js`), not chapter names or positions. If a chapter id is renumbered,
removed, or reassigned to different content, a student who already ticked that id would show as
having completed a chapter they never saw — the tracker has no way to tell "same id, different
content" apart from "same id, same content".

If you ever must renumber or reshuffle chapter ids (as opposed to just appending new ones),
bump `SCHEMA_VERSION` in `src/lib/state.js`. `deserialize()` discards any stored state whose
`version` doesn't match the current `SCHEMA_VERSION`, so a mismatched returning student gets a
clean reset instead of a silently mis-scored syllabus. Appending brand new chapters or subjects
with fresh, never-before-used ids does **not** require a version bump — only reassigning or
removing ids that a student could already have ticked does.

## Backend

Lead capture posts to a Google Apps Script web app backed by a Google Sheet. See
[`SETUP-APPS-SCRIPT.md`](SETUP-APPS-SCRIPT.md) for the full setup, including why the project must
be created as a standalone script from `script.google.com` rather than bound to the Sheet.

## Deploying

See [`INTEGRATION-NOTES.md`](INTEGRATION-NOTES.md) for what a deploying developer needs to know
that isn't covered above.
