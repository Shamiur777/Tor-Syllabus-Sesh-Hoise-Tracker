# তোর সিলেবাস শেষ হইসে ট্র্যাকার — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a single self-contained HTML page where a Bangladeshi SSC or HSC student ticks off completed syllabus chapters, receives a completion percentage and a shareable 1080×1920 result image, and — if not enrolled — submits contact details that land in the client's Google Sheet as a sales lead.

**Architecture:** Logic is authored as small ESM modules under `src/lib/` with real unit tests, plus CSS under `src/styles/` and content data under `src/data/`. A dependency-free Node build script (`scripts/build.mjs`) inlines all of it into one deployable `syllabus-tracker.html` with no external references beyond a single Google Fonts link. This mirrors the generator pattern the client already uses in their `COMEBACK` project. The backend is a standalone Google Apps Script web app that appends rows to a spreadsheet by ID.

**Tech Stack:** Vanilla JavaScript (ESM at author time, single IIFE at build time), plain CSS with custom properties, `node:test` for unit tests (built into Node — no npm install ever runs), Google Apps Script for the backend, native Canvas 2D for image generation.

## Global Constraints

These apply to every task. Do not restate them per-task; they are always in force.

- **Node 18+** is required for `node:test` and `node --test`. No npm dependencies are ever installed. There is no `node_modules`.
- **The built `syllabus-tracker.html` must have zero external references** except one Google Fonts `<link>`. No CDN scripts, no external CSS, no `html2canvas` or any other library.
- **No build step is required to deploy.** `syllabus-tracker.html` is committed to the repo and is directly servable. The build script is an authoring tool only.
- **Never hand-edit `syllabus-tracker.html`.** It is generated. All changes go into `src/` followed by `node scripts/build.mjs`.
- **Product name is `তোর সিলেবাস শেষ হইসে ট্র্যাকার`** — used verbatim, never translated or transliterated, in `<title>`, the OG title, and the landing heading.
- **Interface copy is Bengali.** Subject and chapter names stay in the language the syllabus data supplies. These two exact strings are fixed and must not be reworded:
  - Enrolled: `সাব্বাশ, রাইট ট্র্যাকেই আছো!`
  - Not enrolled: `এভাবে ত মামা তোমার সিলেবাস জীবনেও শেষ হবে না! আজই এনরোল করো।`
- **Spreadsheet ID is `1hnoInIk37frhk6DBIxGWOkSjN9PAkOj9f_pbL3rCwRI`.**
- **Tier thresholds.** Batch `'27`: `0–29`, `30–49`, `50–69`, `70–100`. Batch `'28`: `0–10`, `11–30`, `31–60`, `61–100`.
- **Result image is 1080×1920.** Eight backgrounds: four tiers × two batch years, shared between SSC and HSC.
- **Brands:** SSC → Infinity School, light theme, blue `#0a6cf0` accent on `#f7fafd`.
  HSC → Hulkenstein, dark theme, green `#22a94c` accent on `#07090a`. Both palettes are sampled
  from the supplied logo artwork and must not be changed to taste — the logos ship as opaque
  JPEGs and the page backgrounds exist to match them.
- **Accessibility floor:** no horizontal overflow and no tap target under 44×44px at 375×667 and above.
- **Must work in Facebook and Instagram in-app browsers.** This rules out APIs those webviews restrict, and is why the submission path has a hidden-form fallback.
- Commit after every task. Commit messages use Conventional Commits (`feat:`, `test:`, `docs:`, `chore:`).

## File Structure

| Path | Responsibility |
|---|---|
| `src/index.html` | Page skeleton with `{{STYLES}}`, `{{SCRIPT}}`, `{{FONTS}}` placeholders |
| `src/styles/tokens.css` | Custom properties: brand palettes, type scale, spacing, reset |
| `src/styles/components.css` | Buttons, cards, checkboxes, progress ring, accordion, form fields |
| `src/styles/screens.css` | Per-screen layout and transitions |
| `src/data/config.js` | Tier thresholds, image paths, Apps Script URL, enrol URLs, brand tokens, all Bengali copy |
| `src/data/syllabus.js` | The syllabus tree. The file the client edits most often |
| `src/lib/subjects.js` | Resolving which subjects apply to a level/batch/group |
| `src/lib/scoring.js` | Completion percentage and tier resolution |
| `src/lib/validation.js` | Name, institute, phone, email validation |
| `src/lib/state.js` | Wizard state, reducers, versioned localStorage persistence |
| `src/lib/tracking.js` | UTM capture, analytics event dispatch |
| `src/lib/submit.js` | Apps Script POST with form fallback and retry |
| `src/lib/canvas.js` | 1080×1920 result image renderer, download, share |
| `src/lib/ui.js` | Screen rendering and wizard navigation |
| `src/lib/main.js` | Bootstrap; wires everything together |
| `scripts/build.mjs` | Inlines styles + modules into `syllabus-tracker.html` |
| `tests/*.test.js` | `node:test` unit tests for the pure modules |
| `apps-script/Code.gs` | Standalone Apps Script web app |
| `syllabus-tracker.html` | **Generated.** The deployable artifact |
| `images/` | Logos and the eight tier backgrounds |
| `README.md` | Orientation for a developer arriving cold |
| `SETUP-APPS-SCRIPT.md` | Click-by-click backend setup from `script.google.com` |
| `INTEGRATION-NOTES.md` | Deployment notes for the `edgecoursebd.com` developer |

**Module load order** (fixed, declared in `build.mjs`; there is no dependency resolution):
`config.js` → `syllabus.js` → `subjects.js` → `scoring.js` → `validation.js` → `state.js` → `tracking.js` → `submit.js` → `canvas.js` → `ui.js` → `main.js`

## Asset Status

The client has not yet supplied the real syllabus content, the eight tier backgrounds, the two
logos, or the enrolment URLs. Every task below is implementable without them:

- `src/data/syllabus.js` ships with a small but structurally complete sample (Task 3) covering
  every shape the real data will take — paper splits, compulsory flags, optional subjects.
- `images/` ships with generated placeholder PNGs at correct dimensions (Task 13).
- Enrolment URLs and the Apps Script URL are empty strings in `CONFIG` with clear comments.

**Task 15 is the ingestion task** that swaps real assets in. It is the only task blocked on the
client, and nothing else depends on it.

---

### Task 1: Build pipeline

Establishes the generator that every later task depends on. Nothing renders yet — this task
proves that modular source becomes one working HTML file.

**Files:**
- Create: `package.json`, `.gitignore`, `src/index.html`, `src/styles/tokens.css`, `src/data/config.js`, `src/lib/main.js`, `scripts/build.mjs`, `tests/build.test.js`

**Interfaces:**
- Consumes: nothing.
- Produces: `node scripts/build.mjs` writes `syllabus-tracker.html` to the repo root. `buildHtml(): string` is exported from `scripts/build.mjs` for testing, returning the full HTML string without writing to disk.

- [ ] **Step 1: Create `package.json` and `.gitignore`**

`package.json` exists solely to declare ESM and provide script aliases. It has no dependencies
and `npm install` is never run.

```json
{
  "name": "tor-syllabus-sesh-hoise-tracker",
  "version": "1.0.0",
  "private": true,
  "type": "module",
  "description": "তোর সিলেবাস শেষ হইসে ট্র্যাকার — syllabus completion tracker for Edge Course BD",
  "scripts": {
    "build": "node scripts/build.mjs",
    "test": "node --test"
  }
}
```

`.gitignore`:

```
node_modules/
.DS_Store
Thumbs.db
```

Note that `syllabus-tracker.html` is deliberately **not** ignored. It is a committed deliverable.

- [ ] **Step 2: Write the failing build test**

Create `tests/build.test.js`:

```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildHtml } from '../scripts/build.mjs';

test('build inlines styles into a style tag', () => {
  const html = buildHtml();
  assert.match(html, /<style>/);
  assert.ok(!html.includes('{{STYLES}}'), 'STYLES placeholder must be replaced');
});

test('build inlines script into a script tag', () => {
  const html = buildHtml();
  assert.ok(!html.includes('{{SCRIPT}}'), 'SCRIPT placeholder must be replaced');
  assert.match(html, /<script>/);
});

test('build emits no module syntax that breaks in a plain script tag', () => {
  const html = buildHtml();
  const script = html.slice(html.indexOf('<script>'), html.lastIndexOf('</script>'));
  assert.ok(!/^\s*import\s/m.test(script), 'import statements must be stripped');
  assert.ok(!/^\s*export\s/m.test(script), 'export keywords must be stripped');
});

test('build references no external script or stylesheet except google fonts', () => {
  const html = buildHtml();
  const externals = [...html.matchAll(/(?:src|href)="(https?:\/\/[^"]+)"/g)].map((m) => m[1]);
  for (const url of externals) {
    assert.match(url, /^https:\/\/fonts\.(googleapis|gstatic)\.com/, `unexpected external: ${url}`);
  }
});

test('build carries the product name into the title', () => {
  const html = buildHtml();
  assert.match(html, /<title>তোর সিলেবাস শেষ হইসে ট্র্যাকার<\/title>/);
});
```

- [ ] **Step 3: Run the test to verify it fails**

Run: `node --test tests/build.test.js`
Expected: FAIL — `Cannot find module '../scripts/build.mjs'`.

- [ ] **Step 4: Create the HTML template**

Create `src/index.html`. The `{{...}}` tokens are replaced by the build.

```html
<!DOCTYPE html>
<html lang="bn">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>তোর সিলেবাস শেষ হইসে ট্র্যাকার</title>
<meta name="description" content="তোর SSC বা HSC সিলেবাসের কতটুকু শেষ হইসে, এক মিনিটে বের করো।">
<meta property="og:title" content="তোর সিলেবাস শেষ হইসে ট্র্যাকার">
<meta property="og:description" content="তোর SSC বা HSC সিলেবাসের কতটুকু শেষ হইসে, এক মিনিটে বের করো।">
<meta property="og:type" content="website">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Baloo+Da+2:wght@500;600;800&family=Hind+Siliguri:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>{{STYLES}}</style>
</head>
<body>
<div id="app"></div>
<script>{{SCRIPT}}</script>
</body>
</html>
```

- [ ] **Step 5: Create minimal source files so the build has something to inline**

`src/styles/tokens.css`:

```css
:root {
  --font-display: 'Baloo Da 2', system-ui, sans-serif;
  --font-body: 'Hind Siliguri', system-ui, sans-serif;
}
```

`src/data/config.js`:

```javascript
export const CONFIG = {
  appsScriptUrl: '',
};
```

`src/lib/main.js`:

```javascript
import { CONFIG } from '../data/config.js';

export function boot() {
  document.getElementById('app').textContent = '';
  return CONFIG;
}

boot();
```

- [ ] **Step 6: Write the build script**

Create `scripts/build.mjs`. The bundler is deliberately dumb: it concatenates files in a fixed
declared order and strips module syntax. There is no dependency graph, no tree shaking, and no
minification. Predictability matters more than cleverness here.

```javascript
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// Order is load order. Dependencies must appear before their dependents.
const STYLES = [
  'src/styles/tokens.css',
  'src/styles/components.css',
  'src/styles/screens.css',
];

const MODULES = [
  'src/data/config.js',
  'src/data/syllabus.js',
  'src/lib/subjects.js',
  'src/lib/scoring.js',
  'src/lib/validation.js',
  'src/lib/state.js',
  'src/lib/tracking.js',
  'src/lib/submit.js',
  'src/lib/canvas.js',
  'src/lib/ui.js',
  'src/lib/main.js',
];

const read = (p) => readFileSync(join(ROOT, p), 'utf8');
const readIfPresent = (p) => {
  try {
    return read(p);
  } catch (err) {
    if (err.code === 'ENOENT') return '';
    throw err;
  }
};

// Strips ESM syntax so the concatenated result runs inside a plain <script>.
// Every module shares one IIFE scope, so cross-module references resolve naturally.
function stripModuleSyntax(source) {
  return source
    .replace(/^\s*import\s+[^;]*?;\s*$/gm, '')
    .replace(/^\s*export\s+(?=(?:default\s+)?(?:const|let|var|function|class|async)\b)/gm, '')
    .replace(/^\s*export\s*\{[^}]*\}\s*;?\s*$/gm, '');
}

export function buildHtml() {
  const styles = STYLES.map(readIfPresent).join('\n');
  const script = MODULES.map(readIfPresent).map(stripModuleSyntax).join('\n');
  return read('src/index.html')
    .replace('{{STYLES}}', () => styles)
    .replace('{{SCRIPT}}', () => `(function(){\n'use strict';\n${script}\n})();`);
}

// Only write to disk when invoked directly, so importing this from a test is side-effect free.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  writeFileSync(join(ROOT, 'syllabus-tracker.html'), buildHtml(), 'utf8');
  console.log('Built syllabus-tracker.html');
}
```

`readIfPresent` returning empty for missing files is what lets Tasks 2 through 14 add modules
one at a time without the build breaking. The `.replace(placeholder, () => value)` form matters:
passing a function prevents `$&` and similar sequences inside the source from being interpreted
as replacement patterns.

- [ ] **Step 7: Run the tests to verify they pass**

Run: `node --test tests/build.test.js`
Expected: PASS, 5 tests.

- [ ] **Step 8: Generate the artifact and eyeball it**

Run: `node scripts/build.mjs`
Expected: prints `Built syllabus-tracker.html`. Open the file in a browser; expect a blank page
with no console errors.

- [ ] **Step 9: Commit**

```bash
git add package.json .gitignore src scripts tests syllabus-tracker.html
git commit -m "feat: add dependency-free build pipeline"
```

---

### Task 2: Tier resolution

**Files:**
- Modify: `src/data/config.js`
- Create: `src/lib/scoring.js`, `tests/scoring.test.js`

**Interfaces:**
- Consumes: `CONFIG` from `src/data/config.js`.
- Produces: `resolveTier(percent: number, batch: '27'|'28'): { index: number, id: string, min: number, max: number }`. `index` is 0-based. Throws `RangeError` on an unknown batch.

- [ ] **Step 1: Write the failing tests**

Create `tests/scoring.test.js`. Boundary values are the whole point of this task — the spec's
original band definitions overlapped, so every edge is pinned explicitly.

```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveTier } from '../src/lib/scoring.js';

test("batch 27 bands split at 30, 50 and 70", () => {
  assert.equal(resolveTier(0, '27').index, 0);
  assert.equal(resolveTier(29, '27').index, 0);
  assert.equal(resolveTier(30, '27').index, 1);
  assert.equal(resolveTier(49, '27').index, 1);
  assert.equal(resolveTier(50, '27').index, 2);
  assert.equal(resolveTier(69, '27').index, 2);
  assert.equal(resolveTier(70, '27').index, 3);
  assert.equal(resolveTier(100, '27').index, 3);
});

test("batch 28 bands split at 11, 31 and 61", () => {
  assert.equal(resolveTier(0, '28').index, 0);
  assert.equal(resolveTier(10, '28').index, 0);
  assert.equal(resolveTier(11, '28').index, 1);
  assert.equal(resolveTier(30, '28').index, 1);
  assert.equal(resolveTier(31, '28').index, 2);
  assert.equal(resolveTier(60, '28').index, 2);
  assert.equal(resolveTier(61, '28').index, 3);
  assert.equal(resolveTier(100, '28').index, 3);
});

test('tier carries a stable id usable as an image key', () => {
  assert.equal(resolveTier(85, '27').id, 'batch27-tier4');
  assert.equal(resolveTier(5, '28').id, 'batch28-tier1');
});

test('out of range percentages clamp rather than throw', () => {
  assert.equal(resolveTier(-5, '27').index, 0);
  assert.equal(resolveTier(140, '27').index, 3);
});

test('unknown batch throws', () => {
  assert.throws(() => resolveTier(50, '99'), RangeError);
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test tests/scoring.test.js`
Expected: FAIL — `Cannot find module '../src/lib/scoring.js'`.

- [ ] **Step 3: Add tier config**

Replace the contents of `src/data/config.js`:

```javascript
export const CONFIG = {
  // Filled in during Task 12 after the Apps Script web app is deployed.
  appsScriptUrl: '',

  // Enrolment destinations. Supplied by the client in Task 15.
  enrolUrls: {
    ssc: '',
    hsc: '',
  },

  // Inclusive percentage bands, evaluated in order. Retune here, not in code.
  tiers: {
    27: [
      { id: 'batch27-tier1', min: 0, max: 29 },
      { id: 'batch27-tier2', min: 30, max: 49 },
      { id: 'batch27-tier3', min: 50, max: 69 },
      { id: 'batch27-tier4', min: 70, max: 100 },
    ],
    28: [
      { id: 'batch28-tier1', min: 0, max: 10 },
      { id: 'batch28-tier2', min: 11, max: 30 },
      { id: 'batch28-tier3', min: 31, max: 60 },
      { id: 'batch28-tier4', min: 61, max: 100 },
    ],
  },

  // Colours sampled from the supplied logo artwork. `logoBg` is the logo file's own
  // opaque background — used behind the logo chip and as the result-image backdrop,
  // so each logo sits on the page as though it were designed there.
  brands: {
    ssc: {
      name: 'Infinity School',
      logo: 'images/infinity-logo.png',
      logoBg: '#ffffff',
      accent: '#0a6cf0',
      accentInk: '#ffffff',
      secondary: '#f5a81c',
      canvasBg: '#f7fafd',
      canvasInk: '#0d1b2a',
      canvasInkSoft: '#5a6b7d',
    },
    hsc: {
      name: 'Hulkenstein',
      logo: 'images/hulkenstein-logo.png',
      logoBg: '#000000',
      accent: '#22a94c',
      accentInk: '#04140a',
      secondary: '#ffffff',
      canvasBg: '#07090a',
      canvasInk: '#f2f5f3',
      canvasInkSoft: '#9aa8a0',
    },
  },
};
```

- [ ] **Step 4: Implement tier resolution**

Create `src/lib/scoring.js`:

```javascript
import { CONFIG } from '../data/config.js';

export function resolveTier(percent, batch) {
  const bands = CONFIG.tiers[batch];
  if (!bands) throw new RangeError(`Unknown batch: ${batch}`);
  const clamped = Math.min(100, Math.max(0, Math.round(percent)));
  const index = bands.findIndex((b) => clamped >= b.min && clamped <= b.max);
  const resolved = index === -1 ? bands.length - 1 : index;
  return { index: resolved, ...bands[resolved] };
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `node --test tests/scoring.test.js`
Expected: PASS, 5 tests.

- [ ] **Step 6: Commit**

```bash
git add src/data/config.js src/lib/scoring.js tests/scoring.test.js
git commit -m "feat: add tier resolution with pinned band boundaries"
```

---

### Task 3: Syllabus data model and subject resolution

**Files:**
- Create: `src/data/syllabus.js`, `src/lib/subjects.js`, `tests/subjects.test.js`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `SYLLABUS` — the tree, shaped `SYLLABUS[level][batch][group].subjects`.
  - `getGroups(level: 'ssc'|'hsc'): string[]`
  - `getSubjects(level, batch, group): Array<{id, name, compulsory, defaultSelected, papers}>`
  - `getDefaultSelectedIds(level, batch, group): string[]`
  - `needsSubjectPicker(level): boolean` — true for `hsc`, false for `ssc`.
  - `countChapters(subjects: Array): number`
  - `allChapterIds(subjects: Array): string[]`

- [ ] **Step 1: Write the failing tests**

Create `tests/subjects.test.js`:

```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  getGroups, getSubjects, getDefaultSelectedIds,
  needsSubjectPicker, countChapters, allChapterIds,
} from '../src/lib/subjects.js';

test('ssc offers three groups, hsc offers three groups', () => {
  assert.deepEqual(getGroups('ssc'), ['science', 'arts', 'commerce']);
  assert.deepEqual(getGroups('hsc'), ['science', 'business', 'humanities']);
});

test('only hsc shows the subject picker', () => {
  assert.equal(needsSubjectPicker('hsc'), true);
  assert.equal(needsSubjectPicker('ssc'), false);
});

test('every subject has a unique id within its group', () => {
  for (const level of ['ssc', 'hsc']) {
    for (const batch of ['27', '28']) {
      for (const group of getGroups(level)) {
        const ids = getSubjects(level, batch, group).map((s) => s.id);
        assert.equal(new Set(ids).size, ids.length, `dupe subject id in ${level}/${batch}/${group}`);
      }
    }
  }
});

test('every chapter id is globally unique', () => {
  const seen = new Set();
  for (const level of ['ssc', 'hsc']) {
    for (const batch of ['27', '28']) {
      for (const group of getGroups(level)) {
        for (const id of allChapterIds(getSubjects(level, batch, group))) {
          // Same subject appears in multiple groups by design; ids must still be stable.
          seen.add(id);
        }
      }
    }
  }
  assert.ok(seen.size > 0, 'expected at least some chapters');
});

test('compulsory subjects are always default selected', () => {
  for (const group of getGroups('hsc')) {
    for (const s of getSubjects('hsc', '27', group)) {
      if (s.compulsory) assert.equal(s.defaultSelected, true, `${s.id} compulsory but not default`);
    }
  }
});

test('ssc groups have every subject compulsory since there is no picker', () => {
  for (const group of getGroups('ssc')) {
    for (const s of getSubjects('ssc', '27', group)) {
      assert.equal(s.compulsory, true, `${s.id} must be compulsory for ssc`);
    }
  }
});

test('humanities has optional subjects that are not preselected', () => {
  const optional = getSubjects('hsc', '27', 'humanities').filter((s) => !s.compulsory);
  assert.ok(optional.length >= 2, 'humanities should offer optional subjects');
  assert.ok(optional.some((s) => !s.defaultSelected), 'some optional subjects start unticked');
});

test('default selected ids are a subset of available subject ids', () => {
  const subjects = getSubjects('hsc', '27', 'science');
  const all = new Set(subjects.map((s) => s.id));
  for (const id of getDefaultSelectedIds('hsc', '27', 'science')) {
    assert.ok(all.has(id), `${id} defaulted but not offered`);
  }
});

test('countChapters sums across papers', () => {
  const subjects = [
    { papers: [{ chapters: [{ id: 'a' }, { id: 'b' }] }, { chapters: [{ id: 'c' }] }] },
    { papers: [{ chapters: [{ id: 'd' }] }] },
  ];
  assert.equal(countChapters(subjects), 4);
  assert.deepEqual(allChapterIds(subjects), ['a', 'b', 'c', 'd']);
});

test('countChapters of nothing is zero, not NaN', () => {
  assert.equal(countChapters([]), 0);
});

test('unknown group returns an empty subject list rather than throwing', () => {
  assert.deepEqual(getSubjects('ssc', '27', 'nonexistent'), []);
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test tests/subjects.test.js`
Expected: FAIL — `Cannot find module '../src/lib/subjects.js'`.

- [ ] **Step 3: Create the syllabus data with a structurally complete sample**

Create `src/data/syllabus.js`. This is placeholder content with the real structure — Task 15
replaces the chapter lists with the client's actual syllabus. Every shape the real data needs is
represented here: paper splits, single-paper subjects, compulsory flags, and optional subjects.

Chapter ids follow `<level><batch>-<subjectId>-<paper>-<n>` so they are stable and globally
unique, which the localStorage schema in Task 6 depends on.

```javascript
// PLACEHOLDER CONTENT — replaced with the client's real syllabus in Task 15.
// Shape is final; only chapter names and counts change.
//
// To add a subject: copy an existing entry, give it a unique id, and list its chapters.
// To add a chapter: append to the relevant paper's `chapters` array with a unique id.
// Ids must never be reused for different content — returning students are matched by id.

const ch = (prefix, names) => names.map((name, i) => ({ id: `${prefix}-${i + 1}`, name }));

function sscScience(batch) {
  const p = `ssc${batch}`;
  return {
    physics: {
      name: 'Physics', compulsory: true, defaultSelected: true,
      papers: [{ name: '', chapters: ch(`${p}-physics-x`, ['Motion', 'Force', 'Work Power Energy']) }],
    },
    chemistry: {
      name: 'Chemistry', compulsory: true, defaultSelected: true,
      papers: [{ name: '', chapters: ch(`${p}-chemistry-x`, ['States of Matter', 'Structure of Atom']) }],
    },
    higher_math: {
      name: 'Higher Mathematics', compulsory: true, defaultSelected: true,
      papers: [{ name: '', chapters: ch(`${p}-hmath-x`, ['Sets and Functions', 'Algebraic Expressions']) }],
    },
  };
}

function sscArts(batch) {
  const p = `ssc${batch}`;
  return {
    geography: {
      name: 'Geography and Environment', compulsory: true, defaultSelected: true,
      papers: [{ name: '', chapters: ch(`${p}-geo-x`, ['Geography and Environment', 'The Universe']) }],
    },
    civics: {
      name: 'Civics and Citizenship', compulsory: true, defaultSelected: true,
      papers: [{ name: '', chapters: ch(`${p}-civics-x`, ['Civics and Citizenship', 'Family and Society']) }],
    },
  };
}

function sscCommerce(batch) {
  const p = `ssc${batch}`;
  return {
    accounting: {
      name: 'Accounting', compulsory: true, defaultSelected: true,
      papers: [{ name: '', chapters: ch(`${p}-acc-x`, ['Introduction to Accounting', 'The Accounting Equation']) }],
    },
    finance: {
      name: 'Finance and Banking', compulsory: true, defaultSelected: true,
      papers: [{ name: '', chapters: ch(`${p}-fin-x`, ['Concepts of Finance', 'Time Value of Money']) }],
    },
  };
}

function hscScience(batch) {
  const p = `hsc${batch}`;
  return {
    physics: {
      name: 'Physics', compulsory: true, defaultSelected: true,
      papers: [
        { name: '1st Paper', chapters: ch(`${p}-physics-1`, ['Physical World and Measurement', 'Vectors', 'Newtonian Mechanics']) },
        { name: '2nd Paper', chapters: ch(`${p}-physics-2`, ['Thermodynamics', 'Static Electricity']) },
      ],
    },
    chemistry: {
      name: 'Chemistry', compulsory: true, defaultSelected: true,
      papers: [
        { name: '1st Paper', chapters: ch(`${p}-chemistry-1`, ['Laboratory Safety', 'Qualitative Chemistry']) },
        { name: '2nd Paper', chapters: ch(`${p}-chemistry-2`, ['Environmental Chemistry', 'Organic Chemistry']) },
      ],
    },
    biology: {
      name: 'Biology', compulsory: false, defaultSelected: true,
      papers: [
        { name: '1st Paper', chapters: ch(`${p}-biology-1`, ['Cell and Its Structure', 'Cell Division']) },
        { name: '2nd Paper', chapters: ch(`${p}-biology-2`, ['Animal Diversity', 'Human Physiology']) },
      ],
    },
    higher_math: {
      name: 'Higher Mathematics', compulsory: false, defaultSelected: true,
      papers: [
        { name: '1st Paper', chapters: ch(`${p}-hmath-1`, ['Matrices and Determinants', 'Straight Lines']) },
        { name: '2nd Paper', chapters: ch(`${p}-hmath-2`, ['Real Numbers and Inequalities', 'Complex Numbers']) },
      ],
    },
    ict: {
      name: 'ICT', compulsory: true, defaultSelected: true,
      papers: [{ name: '', chapters: ch(`${p}-ict-x`, ['ICT in the World', 'Communication Systems']) }],
    },
  };
}

function hscBusiness(batch) {
  const p = `hsc${batch}`;
  return {
    accounting: {
      name: 'Accounting', compulsory: true, defaultSelected: true,
      papers: [
        { name: '1st Paper', chapters: ch(`${p}-acc-1`, ['Accounting Introduction', 'Accounting Equation']) },
        { name: '2nd Paper', chapters: ch(`${p}-acc-2`, ['Partnership Accounts', 'Company Accounts']) },
      ],
    },
    management: {
      name: 'Management', compulsory: true, defaultSelected: true,
      papers: [
        { name: '1st Paper', chapters: ch(`${p}-mgmt-1`, ['Introduction to Management', 'Planning']) },
        { name: '2nd Paper', chapters: ch(`${p}-mgmt-2`, ['Motivation', 'Controlling']) },
      ],
    },
    ict: {
      name: 'ICT', compulsory: true, defaultSelected: true,
      papers: [{ name: '', chapters: ch(`${p}-ict-x`, ['ICT in the World', 'Communication Systems']) }],
    },
  };
}

function hscHumanities(batch) {
  const p = `hsc${batch}`;
  const optional = (id, short, names) => ({
    name: short, compulsory: false, defaultSelected: false,
    papers: [
      { name: '1st Paper', chapters: ch(`${p}-${id}-1`, names) },
      { name: '2nd Paper', chapters: ch(`${p}-${id}-2`, names) },
    ],
  });
  return {
    ict: {
      name: 'ICT', compulsory: true, defaultSelected: true,
      papers: [{ name: '', chapters: ch(`${p}-ict-x`, ['ICT in the World', 'Communication Systems']) }],
    },
    civics: optional('civics', 'Civics and Good Governance', ['Civics and Citizenship', 'State and Government']),
    economics: optional('economics', 'Economics', ['Basic Concepts', 'Demand and Supply']),
    history: optional('history', 'History', ['Ancient Bengal', 'Medieval Bengal']),
    islamic_history: optional('islamic_history', 'Islamic History and Culture', ['Pre-Islamic Arabia', 'The Rightly Guided Caliphs']),
    logic: optional('logic', 'Logic', ['Nature of Logic', 'Terms and Propositions']),
    social_work: optional('social_work', 'Social Work', ['Concept of Social Work', 'Social Problems']),
    sociology: optional('sociology', 'Sociology', ['Nature of Sociology', 'Social Institutions']),
    geography: optional('geography', 'Geography', ['Nature of Geography', 'The Earth']),
    psychology: optional('psychology', 'Psychology', ['Nature of Psychology', 'Nervous System']),
    statistics: optional('statistics', 'Statistics', ['Introduction to Statistics', 'Data Collection']),
  };
}

const buildBatch = (batch) => ({
  ssc: {
    science: { subjects: sscScience(batch) },
    arts: { subjects: sscArts(batch) },
    commerce: { subjects: sscCommerce(batch) },
  },
  hsc: {
    science: { subjects: hscScience(batch) },
    business: { subjects: hscBusiness(batch) },
    humanities: { subjects: hscHumanities(batch) },
  },
});

const b27 = buildBatch('27');
const b28 = buildBatch('28');

export const SYLLABUS = {
  ssc: { 27: b27.ssc, 28: b28.ssc },
  hsc: { 27: b27.hsc, 28: b28.hsc },
};

export const GROUP_LABELS = {
  ssc: { science: 'বিজ্ঞান', arts: 'মানবিক', commerce: 'ব্যবসায় শিক্ষা' },
  hsc: { science: 'বিজ্ঞান', business: 'ব্যবসায় শিক্ষা', humanities: 'মানবিক' },
};
```

- [ ] **Step 4: Implement subject resolution**

Create `src/lib/subjects.js`:

```javascript
import { SYLLABUS } from '../data/syllabus.js';

const GROUP_ORDER = {
  ssc: ['science', 'arts', 'commerce'],
  hsc: ['science', 'business', 'humanities'],
};

export function getGroups(level) {
  return GROUP_ORDER[level] ? [...GROUP_ORDER[level]] : [];
}

// SSC subject sets are fixed, so SSC students skip the picker entirely.
export function needsSubjectPicker(level) {
  return level === 'hsc';
}

export function getSubjects(level, batch, group) {
  const entry = SYLLABUS[level]?.[batch]?.[group];
  if (!entry) return [];
  return Object.entries(entry.subjects).map(([id, s]) => ({ id, ...s }));
}

export function getDefaultSelectedIds(level, batch, group) {
  return getSubjects(level, batch, group)
    .filter((s) => s.compulsory || s.defaultSelected)
    .map((s) => s.id);
}

export function countChapters(subjects) {
  return subjects.reduce(
    (total, s) => total + s.papers.reduce((n, p) => n + p.chapters.length, 0),
    0,
  );
}

export function allChapterIds(subjects) {
  return subjects.flatMap((s) => s.papers.flatMap((p) => p.chapters.map((c) => c.id)));
}
```

- [ ] **Step 5: Run the tests to verify they pass**

Run: `node --test tests/subjects.test.js`
Expected: PASS, 11 tests.

- [ ] **Step 6: Register the new modules in the build and rebuild**

`src/data/syllabus.js` and `src/lib/subjects.js` are already listed in `MODULES` in
`scripts/build.mjs`, so no edit is needed.

Run: `node scripts/build.mjs && node --test`
Expected: build succeeds; all tests pass.

- [ ] **Step 7: Commit**

```bash
git add src/data/syllabus.js src/lib/subjects.js tests/subjects.test.js syllabus-tracker.html
git commit -m "feat: add syllabus data model and subject resolution"
```

---

### Task 4: Completion scoring

**Files:**
- Modify: `src/lib/scoring.js`
- Modify: `tests/scoring.test.js`

**Interfaces:**
- Consumes: `countChapters`, `allChapterIds` from `src/lib/subjects.js`; `resolveTier` from Task 2.
- Produces:
  - `computeCompletion(subjects: Array, checkedIds: Set<string>): { completed: number, total: number, percent: number }` — `percent` is rounded to an integer; `0` when `total` is `0`.
  - `computeSubjectBreakdown(subjects, checkedIds): Array<{id, name, completed, total, percent}>`

- [ ] **Step 1: Write the failing tests**

Append to `tests/scoring.test.js`:

```javascript
import { computeCompletion, computeSubjectBreakdown } from '../src/lib/scoring.js';

const fixture = [
  { id: 'phy', name: 'Physics', papers: [
    { name: '1st', chapters: [{ id: 'p1' }, { id: 'p2' }] },
    { name: '2nd', chapters: [{ id: 'p3' }, { id: 'p4' }] },
  ] },
  { id: 'ict', name: 'ICT', papers: [
    { name: '', chapters: [{ id: 'i1' }] },
  ] },
];

test('percentage is checked over total across selected subjects', () => {
  const r = computeCompletion(fixture, new Set(['p1', 'p2', 'i1']));
  assert.equal(r.completed, 3);
  assert.equal(r.total, 5);
  assert.equal(r.percent, 60);
});

test('percentage rounds to the nearest integer', () => {
  const r = computeCompletion(fixture, new Set(['p1']));
  assert.equal(r.percent, 20);
  const r2 = computeCompletion(fixture, new Set(['p1', 'p2']));
  assert.equal(r2.percent, 40);
});

test('checked ids outside the selected subjects do not count', () => {
  // A student who deselects Biology must not keep credit for its chapters.
  const r = computeCompletion(fixture, new Set(['p1', 'bio-1', 'bio-2']));
  assert.equal(r.completed, 1);
  assert.equal(r.total, 5);
});

test('no subjects yields zero percent, not NaN', () => {
  const r = computeCompletion([], new Set());
  assert.equal(r.percent, 0);
  assert.equal(r.total, 0);
});

test('everything checked is exactly 100', () => {
  const r = computeCompletion(fixture, new Set(['p1', 'p2', 'p3', 'p4', 'i1']));
  assert.equal(r.percent, 100);
});

test('breakdown reports per-subject progress', () => {
  const rows = computeSubjectBreakdown(fixture, new Set(['p1', 'p2', 'p3', 'p4']));
  assert.deepEqual(rows, [
    { id: 'phy', name: 'Physics', completed: 4, total: 4, percent: 100 },
    { id: 'ict', name: 'ICT', completed: 0, total: 1, percent: 0 },
  ]);
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test tests/scoring.test.js`
Expected: FAIL — `computeCompletion is not a function`.

- [ ] **Step 3: Implement scoring**

Append to `src/lib/scoring.js`:

```javascript
import { countChapters, allChapterIds } from './subjects.js';

export function computeCompletion(subjects, checkedIds) {
  const total = countChapters(subjects);
  // Intersect against the subject's own chapters so deselected subjects lose their credit.
  const completed = allChapterIds(subjects).filter((id) => checkedIds.has(id)).length;
  return { completed, total, percent: total === 0 ? 0 : Math.round((completed / total) * 100) };
}

export function computeSubjectBreakdown(subjects, checkedIds) {
  return subjects.map((s) => {
    const { completed, total, percent } = computeCompletion([s], checkedIds);
    return { id: s.id, name: s.name, completed, total, percent };
  });
}
```

The `import` sits mid-file, which is legal ESM (imports hoist) and is stripped at build time
anyway. Keeping it adjacent to its use makes the dependency visible when reading the module.

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node --test tests/scoring.test.js`
Expected: PASS, 11 tests total in this file.

- [ ] **Step 5: Commit**

```bash
git add src/lib/scoring.js tests/scoring.test.js
git commit -m "feat: add completion scoring and per-subject breakdown"
```

---

### Task 5: Input validation

**Files:**
- Create: `src/lib/validation.js`, `tests/validation.test.js`

**Interfaces:**
- Consumes: nothing.
- Produces:
  - `validateName(v: string): { valid: boolean, error: string }`
  - `validateInstitute(v: string): { valid: boolean, error: string }`
  - `validatePhone(v: string): { valid: boolean, error: string, normalized: string }`
  - `validateEmail(v: string): { valid: boolean, error: string, normalized: string }`
  - `error` is a Bengali message, empty string when valid.

- [ ] **Step 1: Write the failing tests**

Create `tests/validation.test.js`:

```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateName, validateInstitute, validatePhone, validateEmail } from '../src/lib/validation.js';

test('names must be non-empty after trimming', () => {
  assert.equal(validateName('Shamiur').valid, true);
  assert.equal(validateName('  ').valid, false);
  assert.equal(validateName('').valid, false);
});

test('bengali names are accepted', () => {
  assert.equal(validateName('শামিউর রহমান').valid, true);
});

test('single character names are rejected as likely typos', () => {
  assert.equal(validateName('a').valid, false);
});

test('institute follows the same rules as name', () => {
  assert.equal(validateInstitute('Notre Dame College').valid, true);
  assert.equal(validateInstitute(' ').valid, false);
});

test('bangladeshi mobile numbers are 11 digits starting 01', () => {
  assert.equal(validatePhone('01712345678').valid, true);
  assert.equal(validatePhone('01912345678').valid, true);
});

test('phone rejects wrong length or wrong prefix', () => {
  assert.equal(validatePhone('0171234567').valid, false);   // 10 digits
  assert.equal(validatePhone('017123456789').valid, false); // 12 digits
  assert.equal(validatePhone('02712345678').valid, false);  // bad prefix
  assert.equal(validatePhone('01012345678').valid, false);  // no 010 operator in BD
});

test('phone tolerates spaces, dashes and the +880 country code', () => {
  assert.equal(validatePhone('017-1234-5678').normalized, '01712345678');
  assert.equal(validatePhone('+8801712345678').normalized, '01712345678');
  assert.equal(validatePhone('8801712345678').normalized, '01712345678');
  assert.equal(validatePhone(' 01712345678 ').normalized, '01712345678');
});

test('phone errors are in bengali', () => {
  const r = validatePhone('123');
  assert.equal(r.valid, false);
  assert.match(r.error, /[ঀ-৿]/, 'error message should contain Bengali');
});

test('email accepts ordinary addresses and lowercases them', () => {
  assert.equal(validateEmail('a@b.com').valid, true);
  assert.equal(validateEmail('Shamiur.Rahman@Example.CO.UK').normalized, 'shamiur.rahman@example.co.uk');
});

test('email rejects malformed addresses', () => {
  for (const bad of ['', 'nope', 'a@', '@b.com', 'a b@c.com', 'a@b']) {
    assert.equal(validateEmail(bad).valid, false, `${bad} should be invalid`);
  }
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test tests/validation.test.js`
Expected: FAIL — `Cannot find module '../src/lib/validation.js'`.

- [ ] **Step 3: Implement validation**

Create `src/lib/validation.js`:

```javascript
const ok = (normalized = '') => ({ valid: true, error: '', normalized });
const bad = (error, normalized = '') => ({ valid: false, error, normalized });

function validateText(value, label) {
  const trimmed = String(value ?? '').trim();
  if (trimmed.length < 2) return bad(`${label} ঠিকভাবে লেখো`, trimmed);
  return ok(trimmed);
}

export function validateName(value) {
  return validateText(value, 'নামটা');
}

export function validateInstitute(value) {
  return validateText(value, 'প্রতিষ্ঠানের নামটা');
}

// Bangladeshi mobile numbers are 11 digits: 01 followed by an operator digit in 3-9.
// 010 and 012 are unallocated, so they are treated as typos.
export function validatePhone(value) {
  const digits = String(value ?? '').replace(/\D/g, '').replace(/^(?:88)?/, '');
  if (!/^01[3-9]\d{8}$/.test(digits)) {
    return bad('১১ ডিজিটের সঠিক মোবাইল নাম্বার দাও (যেমন ০১৭xxxxxxxx)', digits);
  }
  return ok(digits);
}

export function validateEmail(value) {
  const normalized = String(value ?? '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/.test(normalized)) {
    return bad('সঠিক ইমেইল অ্যাড্রেস দাও', normalized);
  }
  return ok(normalized);
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node --test tests/validation.test.js`
Expected: PASS, 10 tests.

Note the `replace(/^(?:88)?/, '')` strips a leading `88` country code after non-digits are gone,
which covers both `+8801...` and `8801...`.

- [ ] **Step 5: Commit**

```bash
git add src/lib/validation.js tests/validation.test.js
git commit -m "feat: add name, institute, phone and email validation"
```

---

### Task 6: Wizard state and versioned persistence

**Files:**
- Create: `src/lib/state.js`, `tests/state.test.js`

**Interfaces:**
- Consumes: `getDefaultSelectedIds`, `needsSubjectPicker` from `src/lib/subjects.js`.
- Produces:
  - `SCHEMA_VERSION: number`
  - `STORAGE_KEY: string`
  - `createState(): State` where `State = { version, screen, name, institute, level, batch, group, selectedSubjects: string[], checked: string[], enrolled: null|boolean, phone, email, submitted: boolean }`
  - `serialize(state): string`
  - `deserialize(raw: string|null): State|null` — returns `null` for absent, corrupt, or version-mismatched data.
  - `save(state, storage)`, `load(storage)`, `clear(storage)` — `storage` is any `localStorage`-shaped object, injected so tests need no browser.
  - `toggleChapter(state, id): State`
  - `setSubjects(state, ids: string[], allSubjects: Array): State` — `allSubjects` is the full subject list for the current level/batch/group, needed to work out which checked chapters belong to subjects that were just deselected.
  - `nextScreen(state): string`, `prevScreen(state): string`

- [ ] **Step 1: Write the failing tests**

Create `tests/state.test.js`:

```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  SCHEMA_VERSION, STORAGE_KEY, createState, serialize, deserialize,
  save, load, clear, toggleChapter, setSubjects, nextScreen, prevScreen,
} from '../src/lib/state.js';

// Minimal localStorage stand-in so these tests run in plain Node.
function fakeStorage() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
    get size() { return map.size; },
  };
}

test('a fresh state starts on the landing screen with nothing chosen', () => {
  const s = createState();
  assert.equal(s.screen, 'landing');
  assert.equal(s.level, null);
  assert.deepEqual(s.checked, []);
  assert.equal(s.enrolled, null);
  assert.equal(s.version, SCHEMA_VERSION);
});

test('toggling a chapter adds then removes it', () => {
  let s = createState();
  s = toggleChapter(s, 'x1');
  assert.deepEqual(s.checked, ['x1']);
  s = toggleChapter(s, 'x1');
  assert.deepEqual(s.checked, []);
});

test('toggling never mutates the input state', () => {
  const s = createState();
  const next = toggleChapter(s, 'x1');
  assert.deepEqual(s.checked, [], 'original must be untouched');
  assert.notEqual(s, next);
});

test('deselecting a subject drops its chapters from the checked list', () => {
  const subjects = [
    { id: 'phy', papers: [{ chapters: [{ id: 'p1' }, { id: 'p2' }] }] },
    { id: 'ict', papers: [{ chapters: [{ id: 'i1' }] }] },
  ];
  let s = createState();
  s = { ...s, selectedSubjects: ['phy', 'ict'], checked: ['p1', 'p2', 'i1'] };
  s = setSubjects(s, ['ict'], subjects);
  assert.deepEqual(s.selectedSubjects, ['ict']);
  assert.deepEqual(s.checked, ['i1'], 'physics chapters must be dropped');
});

test('round trips through serialize and deserialize', () => {
  const s = { ...createState(), name: 'শামিউর', level: 'hsc', checked: ['a', 'b'] };
  const back = deserialize(serialize(s));
  assert.deepEqual(back, s);
});

test('deserialize rejects a stale schema version', () => {
  const stale = JSON.stringify({ ...createState(), version: SCHEMA_VERSION - 1 });
  assert.equal(deserialize(stale), null);
});

test('deserialize survives corrupt json without throwing', () => {
  assert.equal(deserialize('{not json'), null);
  assert.equal(deserialize(''), null);
  assert.equal(deserialize(null), null);
});

test('save then load returns an equivalent state', () => {
  const storage = fakeStorage();
  const s = { ...createState(), name: 'Test', batch: '28' };
  save(s, storage);
  assert.deepEqual(load(storage), s);
});

test('clear removes the stored state', () => {
  const storage = fakeStorage();
  save(createState(), storage);
  clear(storage);
  assert.equal(load(storage), null);
  assert.equal(storage.getItem(STORAGE_KEY), null);
});

test('storage failures are swallowed so private mode never breaks the page', () => {
  const hostile = {
    getItem: () => { throw new Error('denied'); },
    setItem: () => { throw new Error('quota'); },
    removeItem: () => { throw new Error('denied'); },
  };
  assert.doesNotThrow(() => save(createState(), hostile));
  assert.equal(load(hostile), null);
  assert.doesNotThrow(() => clear(hostile));
});

test('ssc skips the subject picker, hsc does not', () => {
  const ssc = { ...createState(), screen: 'group', level: 'ssc' };
  assert.equal(nextScreen(ssc), 'syllabus');
  const hsc = { ...createState(), screen: 'group', level: 'hsc' };
  assert.equal(nextScreen(hsc), 'subjects');
});

test('going back from the syllabus screen mirrors the forward skip', () => {
  const ssc = { ...createState(), screen: 'syllabus', level: 'ssc' };
  assert.equal(prevScreen(ssc), 'group');
  const hsc = { ...createState(), screen: 'syllabus', level: 'hsc' };
  assert.equal(prevScreen(hsc), 'subjects');
});

test('the landing screen has nowhere to go back to', () => {
  assert.equal(prevScreen(createState()), null);
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test tests/state.test.js`
Expected: FAIL — `Cannot find module '../src/lib/state.js'`.

- [ ] **Step 3: Implement state**

Create `src/lib/state.js`:

```javascript
import { needsSubjectPicker } from './subjects.js';

// Bump when the shape of a stored state changes, or when chapter ids are renumbered.
// A returning student with an older version is reset rather than mis-scored.
export const SCHEMA_VERSION = 1;
export const STORAGE_KEY = 'tor-syllabus-tracker-v1';

const FLOW = ['landing', 'class', 'batch', 'group', 'subjects', 'syllabus', 'lead', 'result'];

export function createState() {
  return {
    version: SCHEMA_VERSION,
    screen: 'landing',
    name: '',
    institute: '',
    level: null,
    batch: null,
    group: null,
    selectedSubjects: [],
    checked: [],
    enrolled: null,
    phone: '',
    email: '',
    submitted: false,
  };
}

export function toggleChapter(state, id) {
  const has = state.checked.includes(id);
  return {
    ...state,
    checked: has ? state.checked.filter((c) => c !== id) : [...state.checked, id],
  };
}

export function setSubjects(state, ids, allSubjects) {
  const keptIds = new Set(ids);
  const liveChapters = new Set(
    allSubjects
      .filter((s) => keptIds.has(s.id))
      .flatMap((s) => s.papers.flatMap((p) => p.chapters.map((c) => c.id))),
  );
  return {
    ...state,
    selectedSubjects: ids,
    checked: state.checked.filter((id) => liveChapters.has(id)),
  };
}

function step(state, delta) {
  const i = FLOW.indexOf(state.screen);
  if (i === -1) return null;
  let next = i + delta;
  // SSC has fixed subjects, so the picker is skipped in both directions.
  if (FLOW[next] === 'subjects' && !needsSubjectPicker(state.level)) next += delta;
  return FLOW[next] ?? null;
}

export const nextScreen = (state) => step(state, 1);
export const prevScreen = (state) => step(state, -1);

export function serialize(state) {
  return JSON.stringify(state);
}

export function deserialize(raw) {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== SCHEMA_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

// Every storage call is guarded: Safari private mode and some in-app webviews
// throw on setItem, and a thrown quota error must never take the page down.
export function save(state, storage) {
  try {
    storage.setItem(STORAGE_KEY, serialize(state));
  } catch {
    /* ignore */
  }
}

export function load(storage) {
  try {
    return deserialize(storage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

export function clear(storage) {
  try {
    storage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
```

- [ ] **Step 4: Run the tests to verify they pass**

Run: `node --test tests/state.test.js`
Expected: PASS, 13 tests.

- [ ] **Step 5: Run the whole suite and rebuild**

Run: `node --test && node scripts/build.mjs`
Expected: all tests pass; build succeeds.

- [ ] **Step 6: Commit**

```bash
git add src/lib/state.js tests/state.test.js syllabus-tracker.html
git commit -m "feat: add wizard state with versioned localStorage persistence"
```

---

### Task 7: Design system

The first task with visible output. No unit tests — this is verified by eye and by the
build test already in place.

**Files:**
- Modify: `src/styles/tokens.css`
- Create: `src/styles/components.css`, `src/styles/screens.css`

**Interfaces:**
- Consumes: nothing.
- Produces: CSS classes the UI task relies on — `.screen`, `.screen.is-active`, `.card`, `.btn`, `.btn--primary`, `.btn--ghost`, `.choice`, `.choice.is-selected`, `.check`, `.check input`, `.accordion`, `.accordion__head`, `.accordion__body`, `.ring`, `.ring__track`, `.ring__fill`, `.field`, `.field__input`, `.field__error`, `.bar`, `.bar__fill`. Brand switching is driven by `data-brand="ssc"|"hsc"` on `<body>`.

- [ ] **Step 1: Write the tokens**

Replace `src/styles/tokens.css`.

The two brands are not one theme with a swapped accent — they are a light theme and a dark
theme, each built around its logo's own opaque background so the supplied JPEG artwork sits on
the page without a visible rectangle. Every colour below was sampled from the real logo files.
No component reads `data-brand`; they all read the custom properties.

The `:root` block is the neutral pre-brand state shown on the landing screen, before the student
has picked SSC or HSC.

```css
:root {
  --font-display: 'Baloo Da 2', system-ui, sans-serif;
  --font-body: 'Hind Siliguri', system-ui, sans-serif;

  --ink: #101820;
  --ink-soft: #5a6b7d;
  --line: #dfe6ee;
  --bg: #f7fafd;
  --surface: #ffffff;

  --accent: #0a6cf0;
  --accent-ink: #ffffff;
  --accent-soft: #e7f0fe;
  --secondary: #f5a81c;
  --logo-bg: #ffffff;

  --bad: #d6453d;

  --r-sm: 10px;
  --r-md: 16px;
  --r-lg: 24px;
  --shadow: 0 10px 30px rgba(16, 24, 32, 0.08);
  --tap: 44px;
}

/* Infinity School — logo is blue/amber on white, so the page is light. */
body[data-brand='ssc'] {
  --ink: #0d1b2a;
  --ink-soft: #5a6b7d;
  --line: #dbe6f2;
  --bg: #f7fafd;
  --surface: #ffffff;
  --accent: #0a6cf0;
  --accent-ink: #ffffff;
  --accent-soft: #e7f0fe;
  --secondary: #f5a81c;
  --logo-bg: #ffffff;
  --shadow: 0 10px 30px rgba(10, 60, 140, 0.10);
}

/* Hulkenstein — logo is green/white on black, so the page is dark. */
body[data-brand='hsc'] {
  --ink: #f2f5f3;
  --ink-soft: #9aa8a0;
  --line: #232a26;
  --bg: #07090a;
  --surface: #12161a;
  --accent: #22a94c;
  --accent-ink: #04140a;
  --accent-soft: #122a1a;
  --secondary: #ffffff;
  --logo-bg: #000000;
  --shadow: 0 10px 30px rgba(0, 0, 0, 0.45);
}

/* Themes differ in luminance, so form controls must be told which way to render
   or the browser paints a light-mode checkbox on the dark HSC page. */
body[data-brand='hsc'] { color-scheme: dark; }
body[data-brand='ssc'] { color-scheme: light; }

*, *::before, *::after { box-sizing: border-box; }

body {
  margin: 0;
  background: var(--bg);
  color: var(--ink);
  font-family: var(--font-body);
  font-size: 16px;
  line-height: 1.6;
  -webkit-text-size-adjust: 100%;
  overflow-x: hidden;
}

h1, h2, h3 { font-family: var(--font-display); margin: 0; line-height: 1.25; }
button, input { font-family: inherit; font-size: inherit; }
button { cursor: pointer; }

:focus-visible { outline: 3px solid var(--accent); outline-offset: 2px; }

@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

- [ ] **Step 2: Write the components**

Create `src/styles/components.css`. Every interactive element clears the 44px tap floor.

```css
.card {
  background: var(--surface);
  border: 1px solid var(--line);
  border-radius: var(--r-md);
  box-shadow: var(--shadow);
}

.btn {
  min-height: var(--tap);
  padding: 0 22px;
  border: 0;
  border-radius: 999px;
  font-family: var(--font-display);
  font-weight: 600;
  font-size: 1.05rem;
  transition: transform 0.15s ease, box-shadow 0.15s ease;
}
.btn:active { transform: translateY(1px); }
.btn:disabled { opacity: 0.45; cursor: not-allowed; }

.btn--primary { background: var(--accent); color: var(--accent-ink); }
.btn--ghost { background: transparent; color: var(--ink-soft); border: 1px solid var(--line); }

/* Big tappable option tiles used for class, batch and group selection. */
.choice {
  display: flex;
  align-items: center;
  gap: 14px;
  width: 100%;
  min-height: 64px;
  padding: 16px 20px;
  background: var(--surface);
  border: 2px solid var(--line);
  border-radius: var(--r-md);
  text-align: start;
  font-family: var(--font-display);
  font-size: 1.15rem;
  transition: border-color 0.18s ease, background 0.18s ease, transform 0.18s ease;
}
.choice:hover { border-color: var(--accent); transform: translateY(-2px); }
.choice.is-selected { border-color: var(--accent); background: var(--accent-soft); }

/* Chapter and subject checkboxes. The native input stays in the DOM for
   accessibility and keyboard use; only its box is restyled. */
.check {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  min-height: var(--tap);
  padding: 8px 10px;
  border-radius: var(--r-sm);
  cursor: pointer;
  transition: background 0.15s ease;
}
.check:hover { background: var(--accent-soft); }
.check input {
  flex: 0 0 auto;
  width: 22px;
  height: 22px;
  margin: 4px 0 0;
  accent-color: var(--accent);
}
.check.is-locked { opacity: 0.7; cursor: default; }
.check__label { flex: 1; }

@keyframes pop { 0% { transform: scale(1); } 50% { transform: scale(1.25); } 100% { transform: scale(1); } }
.check input:checked { animation: pop 0.22s ease; }

.accordion { border: 1px solid var(--line); border-radius: var(--r-md); background: var(--surface); overflow: hidden; }
.accordion + .accordion { margin-top: 12px; }
.accordion__head {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  min-height: 60px;
  padding: 12px 16px;
  background: none;
  border: 0;
  font-family: var(--font-display);
  font-size: 1.05rem;
  text-align: start;
}
.accordion__body { padding: 4px 12px 14px; }
.accordion__body[hidden] { display: none; }

.bar { height: 8px; border-radius: 999px; background: var(--line); overflow: hidden; }
.bar__fill { height: 100%; background: var(--accent); border-radius: 999px; transition: width 0.4s ease; }

/* Progress ring. stroke-dashoffset is set from JS; circumference is 2πr with r=52. */
.ring { display: block; transform: rotate(-90deg); }
.ring__track { fill: none; stroke: var(--line); stroke-width: 12; }
.ring__fill {
  fill: none;
  stroke: var(--accent);
  stroke-width: 12;
  stroke-linecap: round;
  stroke-dasharray: 326.7;
  transition: stroke-dashoffset 0.5s ease;
}

.field { display: block; margin-bottom: 18px; }
.field__label { display: block; margin-bottom: 6px; font-weight: 600; }
.field__input {
  width: 100%;
  min-height: var(--tap);
  padding: 10px 14px;
  border: 2px solid var(--line);
  border-radius: var(--r-sm);
  background: var(--surface);
  color: var(--ink);
}
.field__input:focus { border-color: var(--accent); outline: none; }
.field__error { display: block; margin-top: 6px; color: var(--bad); font-size: 0.9rem; min-height: 1.2em; }
.field--invalid .field__input { border-color: var(--bad); }
```

- [ ] **Step 3: Write the screen layout**

Create `src/styles/screens.css`:

```css
.wrap { width: min(720px, 100% - 32px); margin-inline: auto; padding-block: 24px 96px; }

.screen { display: none; }
.screen.is-active { display: block; animation: rise 0.35s ease both; }
@keyframes rise { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: none; } }

/* Cards reveal in sequence rather than all at once. Capped at 8 so a long
   subject list does not leave the last card waiting a full second. */
.stagger > * { animation: rise 0.4s ease both; }
.stagger > *:nth-child(1) { animation-delay: 0.03s; }
.stagger > *:nth-child(2) { animation-delay: 0.06s; }
.stagger > *:nth-child(3) { animation-delay: 0.09s; }
.stagger > *:nth-child(4) { animation-delay: 0.12s; }
.stagger > *:nth-child(5) { animation-delay: 0.15s; }
.stagger > *:nth-child(6) { animation-delay: 0.18s; }
.stagger > *:nth-child(7) { animation-delay: 0.21s; }
.stagger > *:nth-child(n + 8) { animation-delay: 0.24s; }

.topbar { display: flex; align-items: center; gap: 12px; padding: 14px 0; }
.topbar__title { font-family: var(--font-display); font-size: 1.05rem; }

/* The supplied logos are opaque JPEGs, not transparent PNGs. Each theme's page
   background matches its logo's background, so normally the chip is invisible.
   It exists so that a logo supplied later with a different background still
   reads as a deliberate badge rather than a stray rectangle. */
.topbar__chip {
  display: inline-flex;
  align-items: center;
  padding: 5px 9px;
  background: var(--logo-bg);
  border-radius: var(--r-sm);
  line-height: 0;
}
.topbar__logo { height: 34px; width: auto; }

.hero__title { font-size: clamp(1.7rem, 6vw, 2.6rem); }
.hero__sub { color: var(--ink-soft); margin-top: 10px; }

.stack { display: grid; gap: 12px; margin-top: 24px; }

/* Sticky progress dock on the syllabus screen. */
.dock {
  position: sticky;
  top: 0;
  z-index: 5;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 12px;
  margin-bottom: 16px;
  background: color-mix(in srgb, var(--bg) 88%, transparent);
  backdrop-filter: blur(8px);
  border: 1px solid var(--line);
  border-radius: var(--r-md);
}
.dock__pct { font-family: var(--font-display); font-size: 1.8rem; line-height: 1; }
.dock__meta { color: var(--ink-soft); font-size: 0.92rem; }

.enrol { margin-top: 28px; padding: 20px; border: 2px dashed var(--accent); border-radius: var(--r-md); background: var(--accent-soft); }
.enrol__verdict { margin-top: 14px; font-family: var(--font-display); font-size: 1.1rem; }

.result { text-align: center; }
.result__pct { font-family: var(--font-display); font-size: clamp(3.5rem, 18vw, 6rem); line-height: 1; color: var(--accent); }
.result__img { width: min(320px, 80vw); height: auto; margin: 20px auto; border-radius: var(--r-md); box-shadow: var(--shadow); }
.result__actions { display: grid; gap: 12px; margin-top: 20px; }

@media (min-width: 560px) {
  .result__actions { grid-auto-flow: column; justify-content: center; }
}
```

- [ ] **Step 4: Rebuild and verify the styles landed**

Run: `node scripts/build.mjs && node --test`
Expected: build succeeds, all tests pass. Confirm `syllabus-tracker.html` contains `.choice` and
`--accent` by searching the generated file.

- [ ] **Step 5: Commit**

```bash
git add src/styles syllabus-tracker.html
git commit -m "feat: add design system with per-brand accent switching"
```

---

### Task 8: Wizard screens — landing through group

**Files:**
- Create: `src/lib/ui.js`
- Modify: `src/lib/main.js`

**Interfaces:**
- Consumes: everything from Tasks 2–7.
- Produces:
  - `el(tag, props, ...children): HTMLElement` — tiny DOM helper.
  - `renderApp(root, state, handlers)` — renders the current screen.
  - `handlers = { onNext, onBack, onField, onPick, onToggleChapter, onSetSubjects, onEnrol, onSubmitLead, onReset }`
  - `main.js` exports `boot()` which wires state, storage and rendering together.

- [ ] **Step 1: Create the DOM helper and screen shell**

Create `src/lib/ui.js`. `el` keeps the rest of the UI code free of `document.createElement`
noise, and using `textContent` throughout means student-supplied names are never interpreted as
HTML.

```javascript
import { CONFIG } from '../data/config.js';
import { getGroups } from './subjects.js';
import { GROUP_LABELS } from '../data/syllabus.js';
import { validateName, validateInstitute } from './validation.js';

export function el(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (v === null || v === undefined || v === false) continue;
    if (k === 'class') node.className = v;
    else if (k === 'text') node.textContent = v;
    else if (k === 'html') node.innerHTML = v;
    else if (k.startsWith('on')) node.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'dataset') Object.assign(node.dataset, v);
    else node.setAttribute(k, v === true ? '' : v);
  }
  for (const c of children.flat()) {
    if (c === null || c === undefined || c === false) continue;
    node.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return node;
}

function topbar(state) {
  const brand = state.level ? CONFIG.brands[state.level] : null;
  return el(
    'header',
    { class: 'topbar' },
    brand && el('span', { class: 'topbar__chip' },
      el('img', { class: 'topbar__logo', src: brand.logo, alt: brand.name })),
    el('span', { class: 'topbar__title', text: 'তোর সিলেবাস শেষ হইসে ট্র্যাকার' }),
  );
}

function screenLanding(state, h) {
  const nameErr = el('span', { class: 'field__error' });
  const instErr = el('span', { class: 'field__error' });

  const nameInput = el('input', {
    class: 'field__input', type: 'text', value: state.name,
    placeholder: 'তোমার নাম', autocomplete: 'name',
    oninput: (e) => h.onField('name', e.target.value),
  });
  const instInput = el('input', {
    class: 'field__input', type: 'text', value: state.institute,
    placeholder: 'তোমার শিক্ষাপ্রতিষ্ঠানের নাম', autocomplete: 'organization',
    oninput: (e) => h.onField('institute', e.target.value),
  });

  return el(
    'section', { class: 'screen is-active' },
    el('h1', { class: 'hero__title', text: 'তোর সিলেবাস শেষ হইসে ট্র্যাকার' }),
    el('p', { class: 'hero__sub', text: 'চ্যাপ্টারগুলো টিক দাও, দেখো তোমার সিলেবাসের কতটুকু শেষ।' }),
    el('div', { class: 'stack stagger' },
      el('label', { class: 'field' }, el('span', { class: 'field__label', text: 'নাম' }), nameInput, nameErr),
      el('label', { class: 'field' }, el('span', { class: 'field__label', text: 'শিক্ষাপ্রতিষ্ঠান' }), instInput, instErr),
      el('button', {
        class: 'btn btn--primary', type: 'button', text: 'শুরু করো',
        onclick: () => {
          const n = validateName(state.name);
          const i = validateInstitute(state.institute);
          nameErr.textContent = n.error;
          instErr.textContent = i.error;
          if (n.valid && i.valid) h.onNext();
        },
      }),
    ),
  );
}

function screenChoice({ title, sub, options, selected, onPick, onBack }) {
  return el(
    'section', { class: 'screen is-active' },
    el('h2', { class: 'hero__title', text: title }),
    sub && el('p', { class: 'hero__sub', text: sub }),
    el('div', { class: 'stack stagger' },
      ...options.map((o) =>
        el('button', {
          class: `choice${selected === o.value ? ' is-selected' : ''}`,
          type: 'button', onclick: () => onPick(o.value),
        }, o.label),
      ),
    ),
    onBack && el('div', { class: 'stack' },
      el('button', { class: 'btn btn--ghost', type: 'button', text: 'পিছনে', onclick: onBack })),
  );
}

const SCREENS = {
  landing: screenLanding,

  class: (state, h) => screenChoice({
    title: 'তুমি কোন ক্লাসে?',
    options: [{ value: 'ssc', label: 'SSC' }, { value: 'hsc', label: 'HSC' }],
    selected: state.level,
    onPick: (v) => h.onPick('level', v),
    onBack: h.onBack,
  }),

  batch: (state, h) => screenChoice({
    title: 'কোন ব্যাচ?',
    options: [{ value: '27', label: `${state.level === 'ssc' ? 'SSC' : 'HSC'} ২৭` },
              { value: '28', label: `${state.level === 'ssc' ? 'SSC' : 'HSC'} ২৮` }],
    selected: state.batch,
    onPick: (v) => h.onPick('batch', v),
    onBack: h.onBack,
  }),

  group: (state, h) => screenChoice({
    title: 'কোন গ্রুপ?',
    options: getGroups(state.level).map((g) => ({ value: g, label: GROUP_LABELS[state.level][g] })),
    selected: state.group,
    onPick: (v) => h.onPick('group', v),
    onBack: h.onBack,
  }),
};

export function registerScreen(name, fn) {
  SCREENS[name] = fn;
}

export function renderApp(root, state, handlers) {
  document.body.dataset.brand = state.level ?? '';
  root.textContent = '';
  const render = SCREENS[state.screen];
  root.append(
    el('div', { class: 'wrap' }, topbar(state), render ? render(state, handlers) : el('p', { text: '...' })),
  );
}
```

`registerScreen` lets Tasks 9–11 and 14 add their screens without editing this file, keeping each
task's diff contained.

- [ ] **Step 2: Wire the bootstrap**

Replace `src/lib/main.js`:

```javascript
import { createState, load, save, clear, nextScreen, prevScreen, toggleChapter, setSubjects } from './state.js';
import { getDefaultSelectedIds, getSubjects, needsSubjectPicker } from './subjects.js';
import { renderApp } from './ui.js';

export function boot() {
  const root = document.getElementById('app');
  const storage = (() => {
    try { return window.localStorage; } catch { return null; }
  })();

  let state = (storage && load(storage)) || createState();

  const commit = (next) => {
    state = next;
    if (storage) save(state, storage);
    renderApp(root, state, handlers);
  };

  const handlers = {
    onField: (key, value) => { state = { ...state, [key]: value }; if (storage) save(state, storage); },
    onNext: () => commit({ ...state, screen: nextScreen(state) ?? state.screen }),
    onBack: () => commit({ ...state, screen: prevScreen(state) ?? state.screen }),
    onPick: (key, value) => {
      let next = { ...state, [key]: value };
      // Changing level, batch or group invalidates any subject or chapter choices made after it.
      if (key !== 'group') next = { ...next, group: null };
      next = { ...next, selectedSubjects: [], checked: [] };
      if (key === 'group' && !needsSubjectPicker(next.level)) {
        next.selectedSubjects = getDefaultSelectedIds(next.level, next.batch, value);
      }
      commit({ ...next, screen: nextScreen(next) ?? next.screen });
    },
    onToggleChapter: (id) => commit(toggleChapter(state, id)),
    onSetSubjects: (ids) => commit(setSubjects(state, ids, getSubjects(state.level, state.batch, state.group))),
    onReset: () => { if (storage) clear(storage); commit(createState()); },
  };

  renderApp(root, state, handlers);
  return handlers;
}

if (typeof document !== 'undefined') boot();
```

- [ ] **Step 3: Rebuild and test in a browser**

Run: `node scripts/build.mjs && node --test`
Expected: all pass.

Open `syllabus-tracker.html` in a browser and verify by hand:
1. Entering nothing and clicking `শুরু করো` shows two Bengali errors.
2. Entering a name and institute advances to the class screen.
3. Picking SSC switches to the light blue theme; picking HSC switches the whole page to the
   dark green theme. The logo appears in the top bar with no visible rectangle around it.
4. Batch and group screens appear in order; `পিছনে` walks back.
5. Reloading the page resumes on the same screen with fields retained.
6. No console errors.

- [ ] **Step 4: Commit**

```bash
git add src/lib/ui.js src/lib/main.js syllabus-tracker.html
git commit -m "feat: add landing, class, batch and group screens"
```

---

### Task 9: Subject picker (HSC only)

**Files:**
- Modify: `src/lib/ui.js`

**Interfaces:**
- Consumes: `registerScreen`, `el` from `src/lib/ui.js`; `getSubjects` from `src/lib/subjects.js`; `onSetSubjects`, `onNext`, `onBack`.
- Produces: the `subjects` screen.

- [ ] **Step 1: Add the screen**

Append to `src/lib/ui.js`:

```javascript
import { getSubjects } from './subjects.js';

registerScreen('subjects', (state, h) => {
  const subjects = getSubjects(state.level, state.batch, state.group);
  const chosen = new Set(state.selectedSubjects);
  const warn = el('p', { class: 'field__error' });

  const rows = subjects.map((s) => {
    const box = el('input', {
      type: 'checkbox',
      checked: chosen.has(s.id),
      disabled: s.compulsory,
      onchange: (e) => {
        if (e.target.checked) chosen.add(s.id);
        else chosen.delete(s.id);
        warn.textContent = '';
      },
    });
    return el('label', { class: `check${s.compulsory ? ' is-locked' : ''}` }, box,
      el('span', { class: 'check__label' }, s.name,
        s.compulsory && el('small', { class: 'dock__meta', text: '  (আবশ্যিক)' })));
  });

  return el('section', { class: 'screen is-active' },
    el('h2', { class: 'hero__title', text: 'তোমার সাবজেক্টগুলো বেছে নাও' }),
    el('p', { class: 'hero__sub', text: 'যেগুলো তুমি নিয়েছো শুধু সেগুলোই টিক দাও। আবশ্যিক সাবজেক্ট আগে থেকেই টিক দেওয়া।' }),
    el('div', { class: 'card', style: 'padding:10px;margin-top:20px' }, ...rows),
    warn,
    el('div', { class: 'stack' },
      el('button', {
        class: 'btn btn--primary', type: 'button', text: 'সিলেবাস দেখাও',
        onclick: () => {
          if (chosen.size === 0) { warn.textContent = 'অন্তত একটা সাবজেক্ট বেছে নাও'; return; }
          h.onSetSubjects([...chosen]);
          h.onNext();
        },
      }),
      el('button', { class: 'btn btn--ghost', type: 'button', text: 'পিছনে', onclick: h.onBack }),
    ),
  );
});
```

Selections accumulate in a local `Set` and commit once, so ticking a box does not re-render the
whole list and lose scroll position.

- [ ] **Step 2: Rebuild and verify by hand**

Run: `node scripts/build.mjs`

In a browser:
1. HSC → any batch → Science shows the picker with compulsory subjects ticked and disabled.
2. HSC → Humanities shows ICT locked and the optional subjects unticked.
3. Unticking everything optional and pressing continue on Humanities shows the warning only when
   nothing at all is selected.
4. SSC → any group skips this screen entirely and lands on the syllabus screen.

- [ ] **Step 3: Commit**

```bash
git add src/lib/ui.js syllabus-tracker.html
git commit -m "feat: add HSC subject picker with locked compulsory subjects"
```

---

### Task 10: Syllabus checklist and progress dock

**Files:**
- Modify: `src/lib/ui.js`

**Interfaces:**
- Consumes: `computeCompletion`, `computeSubjectBreakdown` from `src/lib/scoring.js`.
- Produces: the `syllabus` screen, including the enrolment question block that Task 11 attaches its verdict to via the `#enrol-slot` element.

- [ ] **Step 1: Add the screen**

Append to `src/lib/ui.js`:

```javascript
import { computeCompletion, computeSubjectBreakdown } from './scoring.js';

const RING_CIRCUMFERENCE = 326.7; // 2πr, r = 52

function progressDock(percent, completed, total) {
  // Built with createElementNS rather than el(), because el() uses
  // createElement and would produce an unstyled HTMLUnknownElement for <svg>.
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'ring');
  svg.setAttribute('viewBox', '0 0 120 120');
  svg.setAttribute('width', '64');
  svg.setAttribute('height', '64');
  svg.innerHTML =
    `<circle class="ring__track" cx="60" cy="60" r="52"></circle>` +
    `<circle class="ring__fill" cx="60" cy="60" r="52" ` +
    `style="stroke-dashoffset:${RING_CIRCUMFERENCE * (1 - percent / 100)}"></circle>`;

  return el('div', { class: 'dock' }, svg,
    el('div', {},
      el('div', { class: 'dock__pct', text: `${percent}%` }),
      el('div', { class: 'dock__meta', text: `${completed} / ${total} চ্যাপ্টার শেষ` })),
  );
}

registerScreen('syllabus', (state, h) => {
  const all = getSubjects(state.level, state.batch, state.group);
  const chosen = new Set(state.selectedSubjects);
  const subjects = all.filter((s) => chosen.has(s.id));
  const checked = new Set(state.checked);

  const { completed, total, percent } = computeCompletion(subjects, checked);
  const breakdown = new Map(computeSubjectBreakdown(subjects, checked).map((r) => [r.id, r]));

  const accordions = subjects.map((s, i) => {
    const row = breakdown.get(s.id);
    const body = el('div', { class: 'accordion__body', hidden: i !== 0 });

    for (const paper of s.papers) {
      if (paper.name) body.append(el('h3', { class: 'dock__meta', text: paper.name }));
      for (const c of paper.chapters) {
        body.append(el('label', { class: 'check' },
          el('input', {
            type: 'checkbox', checked: checked.has(c.id),
            onchange: () => h.onToggleChapter(c.id),
          }),
          el('span', { class: 'check__label', text: c.name })));
      }
    }

    const head = el('button', { class: 'accordion__head', type: 'button' },
      el('span', { style: 'flex:1' }, s.name),
      el('span', { class: 'dock__meta', text: `${row.completed}/${row.total}` }));
    head.addEventListener('click', () => { body.hidden = !body.hidden; });

    const bar = el('div', { class: 'bar', style: 'margin:0 16px 12px' },
      el('div', { class: 'bar__fill', style: `width:${row.percent}%` }));

    return el('div', { class: 'accordion' }, head, bar, body);
  });

  return el('section', { class: 'screen is-active' },
    progressDock(percent, completed, total),
    el('h2', { class: 'hero__title', text: 'যেগুলো শেষ, টিক দাও' }),
    el('div', { class: 'stack' }, ...accordions),
    el('div', { id: 'enrol-slot' }),
    el('div', { class: 'stack' },
      el('button', { class: 'btn btn--ghost', type: 'button', text: 'শুরু থেকে করো', onclick: h.onReset }),
    ),
  );
});
```

Toggling a chapter re-renders through `commit`, which recomputes the dock and every bar. The
open or closed state of each accordion resets on re-render; the first subject stays open. This
is acceptable because ticking is fast and the dock feedback is the point. If it proves annoying
in testing, hoist the open state into `state` — do not paper over it with direct DOM mutation.

- [ ] **Step 2: Rebuild and verify by hand**

Run: `node scripts/build.mjs`

In a browser:
1. Ticking chapters moves the ring and the percentage immediately.
2. Per-subject bars and `n/m` counts update.
3. Ticking every chapter reads exactly `100%`.
4. Reload mid-way and confirm the ticks survive.
5. `শুরু থেকে করো` clears everything back to the landing screen.

- [ ] **Step 3: Commit**

```bash
git add src/lib/ui.js syllabus-tracker.html
git commit -m "feat: add syllabus checklist with live progress dock"
```

---

### Task 11: Enrolment gate and lead form

**Files:**
- Modify: `src/lib/ui.js`, `src/lib/main.js`, `src/data/config.js`

**Interfaces:**
- Consumes: `validatePhone`, `validateEmail`; `CONFIG.enrolUrls`.
- Produces: the enrolment block rendered into `#enrol-slot`, and the `lead` screen. `handlers.onEnrol(value: boolean)` and `handlers.onSubmitLead({ phone, email })`.

- [ ] **Step 1: Add copy to config**

Add to `CONFIG` in `src/data/config.js`:

```javascript
  copy: {
    // These two strings are fixed by the client. Do not reword.
    enrolledYes: 'সাব্বাশ, রাইট ট্র্যাকেই আছো!',
    enrolledNo: 'এভাবে ত মামা তোমার সিলেবাস জীবনেও শেষ হবে না! আজই এনরোল করো।',
    courseName: { ssc: 'Complete Academic Program (CAP)', hsc: 'Academic to Admission Course' },
  },
```

- [ ] **Step 2: Render the enrolment question inside the syllabus screen**

In `src/lib/ui.js`, replace `el('div', { id: 'enrol-slot' })` in the `syllabus` screen with a
call to `enrolBlock(state, h)`, and add the function above `registerScreen('syllabus', ...)`:

```javascript
import { validatePhone, validateEmail } from './validation.js';

function enrolBlock(state, h) {
  const course = CONFIG.copy.courseName[state.level];
  const verdict = el('p', { class: 'enrol__verdict' });

  if (state.enrolled === true) verdict.textContent = CONFIG.copy.enrolledYes;
  if (state.enrolled === false) verdict.textContent = CONFIG.copy.enrolledNo;

  const pick = (value) =>
    el('button', {
      class: `choice${state.enrolled === value ? ' is-selected' : ''}`,
      type: 'button', text: value ? 'হ্যাঁ' : 'না',
      onclick: () => h.onEnrol(value),
    });

  return el('div', { class: 'enrol', id: 'enrol-slot' },
    el('h3', { text: `তুমি কি ${course}-এ এনরোল করা আছো?` }),
    el('div', { class: 'stack' }, pick(true), pick(false)),
    verdict,
    state.enrolled !== null && el('button', {
      class: 'btn btn--primary', type: 'button', text: 'রেজাল্ট দেখাও',
      style: 'margin-top:16px',
      onclick: h.onNext,
    }),
  );
}
```

- [ ] **Step 3: Add the lead screen**

Append to `src/lib/ui.js`:

```javascript
registerScreen('lead', (state, h) => {
  const phoneErr = el('span', { class: 'field__error' });
  const emailErr = el('span', { class: 'field__error' });
  const phoneInput = el('input', {
    class: 'field__input', type: 'tel', inputmode: 'numeric',
    placeholder: '০১৭xxxxxxxx', value: state.phone, autocomplete: 'tel',
  });
  const emailInput = el('input', {
    class: 'field__input', type: 'email', inputmode: 'email',
    placeholder: 'tomar@email.com', value: state.email, autocomplete: 'email',
  });

  const submit = el('button', { class: 'btn btn--primary', type: 'button', text: 'রেজাল্ট দেখাও' });
  submit.addEventListener('click', async () => {
    const p = validatePhone(phoneInput.value);
    const e = validateEmail(emailInput.value);
    phoneErr.textContent = p.error;
    emailErr.textContent = e.error;
    if (!p.valid || !e.valid) return;
    submit.disabled = true;
    submit.textContent = 'পাঠানো হচ্ছে...';
    await h.onSubmitLead({ phone: p.normalized, email: e.normalized });
  });

  return el('section', { class: 'screen is-active' },
    el('h2', { class: 'hero__title', text: CONFIG.copy.enrolledNo }),
    el('p', { class: 'hero__sub', text: 'নাম্বার আর ইমেইল দাও, আমরা তোমাকে কোর্সের ডিটেইলস পাঠিয়ে দিবো।' }),
    el('div', { class: 'stack stagger' },
      el('label', { class: 'field' }, el('span', { class: 'field__label', text: 'মোবাইল নাম্বার' }), phoneInput, phoneErr),
      el('label', { class: 'field' }, el('span', { class: 'field__label', text: 'ইমেইল' }), emailInput, emailErr),
      submit,
      CONFIG.enrolUrls[state.level] && el('a', {
        class: 'btn btn--ghost', href: CONFIG.enrolUrls[state.level],
        target: '_blank', rel: 'noopener', text: 'কোর্স দেখে আসো',
        style: 'display:inline-flex;align-items:center;justify-content:center;text-decoration:none',
      }),
    ),
  );
});
```

- [ ] **Step 4: Route around the lead screen for enrolled students**

In `src/lib/state.js`, change `step` so `lead` is skipped when the student is enrolled. Replace
the SSC-skip line with both skips:

```javascript
function step(state, delta) {
  const i = FLOW.indexOf(state.screen);
  if (i === -1) return null;
  let next = i + delta;
  // SSC has fixed subjects, so the picker is skipped in both directions.
  if (FLOW[next] === 'subjects' && !needsSubjectPicker(state.level)) next += delta;
  // Enrolled students are never asked for contact details.
  if (FLOW[next] === 'lead' && state.enrolled === true) next += delta;
  return FLOW[next] ?? null;
}
```

- [ ] **Step 5: Add the skip test**

Append to `tests/state.test.js`:

```javascript
test('enrolled students skip the lead form entirely', () => {
  const enrolled = { ...createState(), screen: 'syllabus', level: 'hsc', enrolled: true };
  assert.equal(nextScreen(enrolled), 'result');
});

test('non-enrolled students are routed through the lead form', () => {
  const not = { ...createState(), screen: 'syllabus', level: 'hsc', enrolled: false };
  assert.equal(nextScreen(not), 'lead');
});

test('going back from the result screen skips the lead form for enrolled students', () => {
  const enrolled = { ...createState(), screen: 'result', level: 'hsc', enrolled: true };
  assert.equal(prevScreen(enrolled), 'syllabus');
});
```

- [ ] **Step 6: Add the handlers**

In `src/lib/main.js`, add to the `handlers` object:

```javascript
    onEnrol: (value) => commit({ ...state, enrolled: value }),
    onSubmitLead: async ({ phone, email }) => {
      // Submission is wired in Task 13. Never block the result on it.
      commit({ ...state, phone, email, screen: 'result' });
    },
```

- [ ] **Step 7: Run tests, rebuild, verify by hand**

Run: `node --test && node scripts/build.mjs`
Expected: all tests pass, including the three new routing tests.

In a browser:
1. Answering `হ্যাঁ` shows `সাব্বাশ, রাইট ট্র্যাকেই আছো!` and goes straight past the form.
2. Answering `না` shows the roast, then the phone and email form.
3. A 10-digit phone shows a Bengali error and does not submit.
4. `+8801712345678` is accepted.

- [ ] **Step 8: Commit**

```bash
git add src/lib/ui.js src/lib/main.js src/lib/state.js src/data/config.js tests/state.test.js syllabus-tracker.html
git commit -m "feat: add enrolment gate and lead capture form"
```

---

### Task 12: Apps Script backend and setup guide

This task is verified against the client's real spreadsheet, not by unit test.

**Files:**
- Create: `apps-script/Code.gs`, `SETUP-APPS-SCRIPT.md`

**Interfaces:**
- Consumes: nothing from the page.
- Produces: a deployed web app URL, pasted into `CONFIG.appsScriptUrl` in Task 13. Accepts `POST` with a JSON body sent as `text/plain`. Responds `{"ok":true}`.

- [ ] **Step 1: Write the Apps Script**

Create `apps-script/Code.gs`:

```javascript
/**
 * তোর সিলেবাস শেষ হইসে ট্র্যাকার — lead capture endpoint.
 *
 * This is a STANDALONE Apps Script project created at script.google.com.
 * It is deliberately NOT bound to the spreadsheet via Extensions > Apps Script.
 * It reaches the sheet by ID instead. See SETUP-APPS-SCRIPT.md.
 */

var SPREADSHEET_ID = '1hnoInIk37frhk6DBIxGWOkSjN9PAkOj9f_pbL3rCwRI';
var SHEET_NAME = 'Leads';

var HEADERS = [
  'Timestamp', 'Name', 'Institute', 'Class', 'Batch', 'Group',
  'Subjects', 'Completion %', 'Tier', 'Phone', 'Email', 'Enrolled',
  'utm_source', 'utm_campaign'
];

function getSheet_() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/** Visiting the web app URL in a browser runs this. Used to verify deployment. */
function doGet(e) {
  if (e && e.parameter && e.parameter.test === '1') {
    appendLead_({
      name: 'TEST ROW', institute: 'TEST', level: 'hsc', batch: '27',
      group: 'science', subjects: 'Physics, ICT', percent: 42,
      tier: 'batch27-tier2', phone: '01700000000', email: 'test@example.com',
      utm_source: 'manual-test', utm_campaign: 'setup'
    });
    return json_({ ok: true, wrote: 'test row' });
  }
  return json_({ ok: true, message: 'Endpoint is live. Append ?test=1 to write a test row.' });
}

/**
 * The page posts with Content-Type text/plain to avoid a CORS preflight,
 * so the JSON arrives in e.postData.contents rather than e.parameter.
 */
function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    appendLead_(payload);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function appendLead_(p) {
  var sheet = getSheet_();
  sheet.appendRow([
    new Date(),
    p.name || '',
    p.institute || '',
    (p.level || '').toUpperCase(),
    p.batch || '',
    p.group || '',
    p.subjects || '',
    p.percent === undefined ? '' : p.percent,
    p.tier || '',
    // Leading apostrophe keeps Sheets from stripping the leading zero.
    p.phone ? "'" + p.phone : '',
    p.email || '',
    p.enrolled === true ? 'Yes' : 'No',
    p.utm_source || '',
    p.utm_campaign || ''
  ]);
}
```

- [ ] **Step 2: Write the setup guide**

Create `SETUP-APPS-SCRIPT.md`:

````markdown
# Google Sheet Setup — তোর সিলেবাস শেষ হইসে ট্র্যাকার

Follow these steps in order. **Start at `script.google.com`, not from the spreadsheet.**
Creating the script from the Sheet's *Extensions → Apps Script* menu produces a container-bound
project, which has failed for this account before. The steps below create a standalone project
that opens the sheet by ID.

Total time: about 5 minutes.

## 1. Create the project

1. Go to **https://script.google.com**
2. Click **New project** (top left).
3. Click the project name (`Untitled project`) and rename it to
   `Syllabus Tracker Leads`.

## 2. Paste the code

1. Delete everything in the `Code.gs` editor pane.
2. Open `apps-script/Code.gs` from this repository and paste its full contents in.
3. Press **Ctrl+S** (or the save icon).

Confirm line 8 reads:

```javascript
var SPREADSHEET_ID = '1hnoInIk37frhk6DBIxGWOkSjN9PAkOj9f_pbL3rCwRI';
```

That is the ID from the target spreadsheet's URL. If the sheet is ever replaced, take the long
string between `/d/` and `/edit` from the new URL and put it here.

## 3. Authorise the script

1. In the function dropdown at the top, select **`doGet`**.
2. Click **Run**.
3. A dialog appears: **Review permissions** → choose your Google account.
4. You will see **"Google hasn't verified this app"**. This is expected for your own script.
   Click **Advanced** (small link, bottom left), then
   **Go to Syllabus Tracker Leads (unsafe)**.
5. Click **Allow**.

If you skip this step, the deployment will return an authorisation error to every visitor.

## 4. Deploy as a web app

1. Click **Deploy** (top right) → **New deployment**.
2. Click the gear icon next to *Select type* → **Web app**.
3. Fill in:
   - **Description:** `v1`
   - **Execute as:** `Me (your@email.com)`
   - **Who has access:** `Anyone`
4. Click **Deploy**.

> **"Who has access" must be `Anyone`, not `Anyone with Google account`.** Students are not
> signed in to Google in the Facebook in-app browser, and `Anyone with Google account` will
> silently reject every submission.

5. Copy the **Web app URL**. It looks like:
   `https://script.google.com/macros/s/AKfycb.../exec`

## 5. Verify a row lands before going live

Paste this into your browser, replacing the URL with your own:

```
https://script.google.com/macros/s/YOUR_ID_HERE/exec?test=1
```

Expected response: `{"ok":true,"wrote":"test row"}`

Open the spreadsheet. There must now be a `Leads` tab with a bold header row and one row
reading `TEST ROW`. Delete that row.

If nothing appears, revisit step 3 — an unauthorised script returns an HTML error page instead
of JSON.

## 6. Put the URL into the page

1. Open `src/data/config.js` in this repository.
2. Set `appsScriptUrl` to the URL you copied:

```javascript
appsScriptUrl: 'https://script.google.com/macros/s/YOUR_ID_HERE/exec',
```

3. Rebuild:

```bash
node scripts/build.mjs
```

4. Commit both `src/data/config.js` and the regenerated `syllabus-tracker.html`.

## Re-deploying after a code change

Apps Script does not serve edits until you deploy again, and a **New deployment** creates a
**new URL** that the page does not know about.

To keep the same URL: **Deploy → Manage deployments →** pencil icon **→ Version: New version →
Deploy**.

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Rows never appear, no browser error | `Who has access` is not `Anyone` | Redeploy with `Anyone` |
| `?test=1` returns an HTML login page | Step 3 authorisation not completed | Run `doGet` from the editor and Allow |
| Phone numbers lose their leading zero | Sheet reformatted the column | The script prefixes with `'`; do not remove it |
| Edits to `Code.gs` have no effect | Not redeployed | Manage deployments → New version |
| Rows appear twice | The retry in `submit.js` fired on a slow success | Harmless; dedupe by phone in the sheet |
````

- [ ] **Step 3: Perform the setup and verify**

Work through `SETUP-APPS-SCRIPT.md` end to end against the real spreadsheet. Confirm the
`?test=1` URL writes a `TEST ROW`, then delete that row.

Record the deployed URL for Task 13.

- [ ] **Step 4: Commit**

```bash
git add apps-script/Code.gs SETUP-APPS-SCRIPT.md
git commit -m "feat: add Apps Script lead endpoint and setup guide"
```

---

### Task 13: Submission client and UTM tracking

**Files:**
- Create: `src/lib/tracking.js`, `src/lib/submit.js`
- Modify: `src/lib/main.js`, `src/data/config.js`
- Create: `tests/tracking.test.js`

**Interfaces:**
- Consumes: `CONFIG.appsScriptUrl`.
- Produces:
  - `captureUtm(search: string): { utm_source, utm_campaign, ... }`
  - `buildPayload(state, subjects, result, tier, utm): object` — the exact object shape `appendLead_` expects. `result` is a `computeCompletion` return value, `tier` a `resolveTier` return value, `utm` a `captureUtm` return value.
  - `submitLead(payload): Promise<boolean>` — resolves `false` on failure. Never rejects.

- [ ] **Step 1: Write the failing tests**

Create `tests/tracking.test.js`:

```javascript
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { captureUtm, buildPayload } from '../src/lib/tracking.js';

test('captures known utm and ad click params', () => {
  const p = captureUtm('?utm_source=fb&utm_campaign=hsc27&fbclid=abc');
  assert.equal(p.utm_source, 'fb');
  assert.equal(p.utm_campaign, 'hsc27');
  assert.equal(p.fbclid, 'abc');
});

test('missing params come back as empty strings, not undefined', () => {
  const p = captureUtm('');
  assert.equal(p.utm_source, '');
  assert.equal(p.utm_campaign, '');
});

test('ignores unknown params so the sheet stays clean', () => {
  const p = captureUtm('?utm_source=fb&evil=1');
  assert.equal(p.evil, undefined);
});

test('payload matches the columns the Apps Script writes', () => {
  const state = {
    name: 'শামিউর', institute: 'Notre Dame', level: 'hsc', batch: '27',
    group: 'science', enrolled: false, phone: '01712345678', email: 'a@b.com',
  };
  const subjects = [{ name: 'Physics' }, { name: 'ICT' }];
  const payload = buildPayload(state, subjects, { percent: 42 }, { id: 'batch27-tier2' }, {
    utm_source: 'fb', utm_campaign: 'hsc27',
  });

  assert.equal(payload.name, 'শামিউর');
  assert.equal(payload.institute, 'Notre Dame');
  assert.equal(payload.level, 'hsc');
  assert.equal(payload.batch, '27');
  assert.equal(payload.group, 'science');
  assert.equal(payload.subjects, 'Physics, ICT');
  assert.equal(payload.percent, 42);
  assert.equal(payload.tier, 'batch27-tier2');
  assert.equal(payload.phone, '01712345678');
  assert.equal(payload.email, 'a@b.com');
  assert.equal(payload.enrolled, false);
  assert.equal(payload.utm_source, 'fb');
});
```

- [ ] **Step 2: Run the tests to verify they fail**

Run: `node --test tests/tracking.test.js`
Expected: FAIL — `Cannot find module '../src/lib/tracking.js'`.

- [ ] **Step 3: Implement tracking**

Create `src/lib/tracking.js`:

```javascript
const TRACKED = [
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
  'fbclid', 'gclid', 'ttclid', 'msclkid',
];

export function captureUtm(search) {
  const params = new URLSearchParams(search || '');
  const out = {};
  for (const key of TRACKED) out[key] = params.get(key) || '';
  return out;
}

export function buildPayload(state, subjects, result, tier, utm) {
  return {
    name: state.name,
    institute: state.institute,
    level: state.level,
    batch: state.batch,
    group: state.group,
    subjects: subjects.map((s) => s.name).join(', '),
    percent: result.percent,
    tier: tier.id,
    phone: state.phone,
    email: state.email,
    enrolled: state.enrolled === true,
    utm_source: utm.utm_source || '',
    utm_campaign: utm.utm_campaign || '',
  };
}

// No-ops safely when GA4 or the Meta Pixel are absent, which is the default.
export function trackEvent(name, params = {}) {
  try {
    if (typeof window.gtag === 'function') window.gtag('event', name, params);
    if (typeof window.fbq === 'function') window.fbq('trackCustom', name, params);
  } catch {
    /* analytics must never break the page */
  }
}
```

- [ ] **Step 4: Implement submission**

Create `src/lib/submit.js`. The two mechanics that matter are documented inline, because both
look like mistakes to a reader who has not fought Apps Script before.

```javascript
import { CONFIG } from '../data/config.js';

// Apps Script does not answer CORS preflight requests. Sending the body as
// text/plain keeps the request "simple" so no preflight is issued at all;
// the endpoint reads it from e.postData.contents regardless of the header.
async function postJson(url, payload) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
    redirect: 'follow',
  });
  return res.ok;
}

// Fallback for in-app webviews that block or mangle fetch. A form POST into a
// hidden iframe cannot be read back, so success is assumed; a dropped lead is
// preferable to a student stuck on a spinner.
function postViaForm(url, payload) {
  return new Promise((resolve) => {
    const name = `s${Date.now()}`;
    const iframe = document.createElement('iframe');
    iframe.name = name;
    iframe.style.display = 'none';

    const form = document.createElement('form');
    form.action = url;
    form.method = 'POST';
    form.target = name;
    form.style.display = 'none';

    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'payload';
    input.value = JSON.stringify(payload);
    form.append(input);

    document.body.append(iframe, form);
    iframe.addEventListener('load', () => {
      iframe.remove();
      form.remove();
      resolve(true);
    });
    form.submit();
    setTimeout(() => resolve(true), 4000);
  });
}

export async function submitLead(payload) {
  const url = CONFIG.appsScriptUrl;
  if (!url) {
    console.warn('CONFIG.appsScriptUrl is empty — lead not sent. See SETUP-APPS-SCRIPT.md');
    return false;
  }
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      if (await postJson(url, payload)) return true;
    } catch (err) {
      console.warn('Lead submission attempt failed', err);
    }
  }
  try {
    return await postViaForm(url, payload);
  } catch {
    return false;
  }
}
```

- [ ] **Step 5: Teach the Apps Script to accept the form fallback**

The form fallback sends `payload` as a form field, not as the raw body. Add a line to `doPost`
in `apps-script/Code.gs`:

```javascript
function doPost(e) {
  try {
    var raw = (e.postData && e.postData.contents) || '';
    // The hidden-form fallback arrives as a normal form field instead.
    if (e.parameter && e.parameter.payload) raw = e.parameter.payload;
    var payload = JSON.parse(raw);
    appendLead_(payload);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}
```

Redeploy via **Manage deployments → New version** so the same URL serves the change.

- [ ] **Step 6: Wire it into the app**

In `src/data/config.js`, set `appsScriptUrl` to the URL from Task 12.

In `src/lib/main.js`, add the import and replace `onSubmitLead`:

```javascript
import { captureUtm, buildPayload, trackEvent } from './tracking.js';
import { submitLead } from './submit.js';
import { computeCompletion, resolveTier } from './scoring.js';

// Captured once at load, before any navigation strips the query string.
const utm = captureUtm(typeof location === 'undefined' ? '' : location.search);
```

```javascript
    onSubmitLead: async ({ phone, email }) => {
      const next = { ...state, phone, email };
      const subjects = getSubjects(next.level, next.batch, next.group)
        .filter((s) => next.selectedSubjects.includes(s.id));
      const result = computeCompletion(subjects, new Set(next.checked));
      const tier = resolveTier(result.percent, next.batch);

      trackEvent('lead_submit', { level: next.level, batch: next.batch, percent: result.percent });
      // The result must never wait on the network. Fire and move on.
      submitLead(buildPayload(next, subjects, result, tier, utm))
        .then((ok) => { if (!ok) console.warn('Lead was not recorded'); });

      commit({ ...next, submitted: true, screen: 'result' });
    },
```

- [ ] **Step 7: Run tests, rebuild, verify end to end**

Run: `node --test && node scripts/build.mjs`
Expected: all pass.

Serve the file over HTTP (a `file://` origin will not POST correctly):

```bash
python -m http.server 8000
```

Open `http://localhost:8000/syllabus-tracker.html?utm_source=test&utm_campaign=plan-check`,
complete the flow answering `না`, submit, and confirm a row appears in the `Leads` tab with the
UTM values populated and the phone number retaining its leading zero.

- [ ] **Step 8: Commit**

```bash
git add src/lib/tracking.js src/lib/submit.js src/lib/main.js src/data/config.js apps-script/Code.gs tests/tracking.test.js syllabus-tracker.html
git commit -m "feat: add lead submission with UTM capture and webview fallback"
```

---

### Task 14: Result screen and image generation

**Files:**
- Create: `src/lib/canvas.js`
- Modify: `src/lib/ui.js`, `src/data/config.js`

**Interfaces:**
- Consumes: `resolveTier`, `computeCompletion`, `CONFIG.brands`, `CONFIG.resultImages`.
- Produces:
  - `renderResultImage({ name, institute, percent, tier, level }): Promise<HTMLCanvasElement>`
  - `downloadCanvas(canvas, filename): Promise<boolean>` — `false` when the browser blocked it.
  - `shareCanvas(canvas, filename): Promise<boolean>`
  - The `result` screen.

- [ ] **Step 1: Add image paths to config**

Add to `CONFIG` in `src/data/config.js`:

```javascript
  resultImages: {
    'batch27-tier1': 'images/results/batch27-tier1.png',
    'batch27-tier2': 'images/results/batch27-tier2.png',
    'batch27-tier3': 'images/results/batch27-tier3.png',
    'batch27-tier4': 'images/results/batch27-tier4.png',
    'batch28-tier1': 'images/results/batch28-tier1.png',
    'batch28-tier2': 'images/results/batch28-tier2.png',
    'batch28-tier3': 'images/results/batch28-tier3.png',
    'batch28-tier4': 'images/results/batch28-tier4.png',
  },
  canvas: { width: 1080, height: 1920 },
```

- [ ] **Step 2: Implement the renderer**

Create `src/lib/canvas.js`:

```javascript
import { CONFIG } from '../data/config.js';

function loadImage(src) {
  return new Promise((resolve) => {
    const img = new Image();
    // Same-origin in production, but this keeps toBlob working if assets ever
    // move to a CDN that sends the right headers. A tainted canvas cannot export.
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

// Bengali needs complex text shaping. Canvas fillText shapes correctly through
// the platform engine, but only once the webfont is actually loaded — otherwise
// conjuncts render as tofu boxes. Waiting here is not optional.
async function ensureFonts() {
  if (!document.fonts) return;
  await Promise.all([
    document.fonts.load('800 96px "Baloo Da 2"'),
    document.fonts.load('600 48px "Hind Siliguri"'),
  ]);
  await document.fonts.ready;
}

function fitText(ctx, text, maxWidth, startPx, font) {
  let size = startPx;
  ctx.font = font(size);
  while (ctx.measureText(text).width > maxWidth && size > 20) {
    size -= 2;
    ctx.font = font(size);
  }
  return size;
}

export async function renderResultImage({ name, institute, percent, tier, level }) {
  await ensureFonts();

  const { width, height } = CONFIG.canvas;
  const brand = CONFIG.brands[level];
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  // The exported image follows the same theme as the page: light for SSC,
  // dark for HSC, so a downloaded result looks like the tool that made it.
  ctx.fillStyle = brand.canvasBg;
  ctx.fillRect(0, 0, width, height);

  const [bg, logo] = await Promise.all([
    loadImage(CONFIG.resultImages[tier.id]),
    loadImage(brand.logo),
  ]);

  // Tier artwork is anchored to the bottom, scaled to the full width.
  if (bg) {
    const scale = width / bg.width;
    const drawH = bg.height * scale;
    ctx.drawImage(bg, 0, height - drawH, width, drawH);
  }

  // The logo sits on a rounded chip in its own background colour. On both themes
  // the chip matches the canvas backdrop and is invisible; it only shows itself
  // if a future logo ships with a different background.
  if (logo) {
    const logoH = 120;
    const logoW = logo.width * (logoH / logo.height);
    const pad = 18;
    ctx.fillStyle = brand.logoBg;
    // roundRect landed in Safari 16.4; fall back to a plain rect on older iOS.
    if (typeof ctx.roundRect === 'function') {
      ctx.beginPath();
      ctx.roundRect(60 - pad, 60 - pad, logoW + pad * 2, logoH + pad * 2, 20);
      ctx.fill();
    } else {
      ctx.fillRect(60 - pad, 60 - pad, logoW + pad * 2, logoH + pad * 2);
    }
    ctx.drawImage(logo, 60, 60, logoW, logoH);
  }

  ctx.textAlign = 'center';
  ctx.fillStyle = brand.canvasInk;

  const nameSize = fitText(ctx, name, width - 200, 76, (s) => `800 ${s}px "Baloo Da 2", sans-serif`);
  ctx.font = `800 ${nameSize}px "Baloo Da 2", sans-serif`;
  ctx.fillText(name, width / 2, 330);

  const instSize = fitText(ctx, institute, width - 220, 44, (s) => `600 ${s}px "Hind Siliguri", sans-serif`);
  ctx.font = `600 ${instSize}px "Hind Siliguri", sans-serif`;
  ctx.fillStyle = brand.canvasInkSoft;
  ctx.fillText(institute, width / 2, 400);

  ctx.fillStyle = brand.accent;
  ctx.font = '800 220px "Baloo Da 2", sans-serif';
  ctx.fillText(`${percent}%`, width / 2, 620);

  ctx.fillStyle = brand.canvasInkSoft;
  ctx.font = '600 42px "Hind Siliguri", sans-serif';
  ctx.fillText('সিলেবাস শেষ', width / 2, 685);

  return canvas;
}

function toBlob(canvas) {
  return new Promise((resolve) => canvas.toBlob(resolve, 'image/png'));
}

export async function downloadCanvas(canvas, filename) {
  const blob = await toBlob(canvas);
  if (!blob) return false;
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.append(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
  // iOS Safari ignores the download attribute entirely, so the caller always
  // shows the long-press instruction as well rather than trusting this.
  return true;
}

export async function shareCanvas(canvas, filename) {
  const blob = await toBlob(canvas);
  if (!blob) return false;
  const file = new File([blob], filename, { type: 'image/png' });
  if (!navigator.canShare || !navigator.canShare({ files: [file] })) return false;
  try {
    await navigator.share({ files: [file] });
    return true;
  } catch {
    return false;
  }
}
```

- [ ] **Step 3: Add the result screen**

Append to `src/lib/ui.js`:

```javascript
import { resolveTier } from './scoring.js';
import { renderResultImage, downloadCanvas, shareCanvas } from './canvas.js';

registerScreen('result', (state, h) => {
  const all = getSubjects(state.level, state.batch, state.group);
  const subjects = all.filter((s) => state.selectedSubjects.includes(s.id));
  const { percent, completed, total } = computeCompletion(subjects, new Set(state.checked));
  const tier = resolveTier(percent, state.batch);

  const pct = el('div', { class: 'result__pct', text: '0%' });
  const preview = el('img', { class: 'result__img', alt: 'তোমার রেজাল্ট' });
  const hint = el('p', { class: 'dock__meta' });
  const filename = `syllabus-${state.name.replace(/\s+/g, '-')}-${percent}pc.png`;

  // Count up rather than snapping, so the number reads as an achievement.
  let shown = 0;
  const tick = setInterval(() => {
    shown += Math.max(1, Math.ceil(percent / 30));
    if (shown >= percent) { shown = percent; clearInterval(tick); }
    pct.textContent = `${shown}%`;
  }, 28);

  let canvas = null;
  renderResultImage({ name: state.name, institute: state.institute, percent, tier, level: state.level })
    .then((c) => { canvas = c; preview.src = c.toDataURL('image/png'); })
    .catch((err) => { console.warn('Result image failed', err); hint.textContent = 'ছবি বানাতে সমস্যা হয়েছে, স্ক্রিনশট নিয়ে নাও।'; });

  return el('section', { class: 'screen is-active result' },
    el('h2', { class: 'hero__title', text: `${state.name}, তোমার রেজাল্ট` }),
    pct,
    el('p', { class: 'dock__meta', text: `${completed} / ${total} চ্যাপ্টার শেষ` }),
    preview,
    hint,
    el('div', { class: 'result__actions' },
      el('button', {
        class: 'btn btn--primary', type: 'button', text: 'ছবি ডাউনলোড করো',
        onclick: async () => {
          if (!canvas) return;
          await downloadCanvas(canvas, filename);
          hint.textContent = 'ডাউনলোড না হলে উপরের ছবিটা চেপে ধরে সেভ করো।';
        },
      }),
      el('button', {
        class: 'btn btn--ghost', type: 'button', text: 'শেয়ার করো',
        onclick: async () => {
          if (!canvas) return;
          if (!(await shareCanvas(canvas, filename))) {
            hint.textContent = 'শেয়ার করা যায়নি — ছবিটা ডাউনলোড করে পোস্ট করো।';
          }
        },
      }),
      el('button', { class: 'btn btn--ghost', type: 'button', text: 'শুরু থেকে করো', onclick: h.onReset }),
    ),
  );
});
```

- [ ] **Step 4: Rebuild and verify by hand**

Run: `node scripts/build.mjs`

Over `http://localhost:8000` (not `file://`, which taints the canvas):
1. The percentage counts up from zero.
2. A 1080×1920 preview renders with the name, institute and percentage.
3. Bengali names render as proper conjuncts, not boxes. Test with `শামিউর রহমান`.
4. A very long name shrinks to fit rather than overflowing.
5. Download produces a PNG that opens correctly.
6. On a phone, the share sheet opens.

- [ ] **Step 5: Commit**

```bash
git add src/lib/canvas.js src/lib/ui.js src/data/config.js syllabus-tracker.html
git commit -m "feat: add result screen with canvas image generation"
```

---

### Task 15: Real assets and content ingestion

**Blocked on the client.** Everything before this is complete and demonstrable without it.

**Files:**
- Modify: `src/data/syllabus.js`, `src/data/config.js`
- Replace: `images/**`

- [ ] **Step 1: Drop in the tier artwork**

The two logos are already in place — supplied 2026-08-11, trimmed to their content bounding box
and normalised into `images/infinity-logo.png` and `images/hulkenstein-logo.png`. Do not
re-crop or replace them.

Place the eight supplied tier images at:

```
images/results/batch27-tier1.png … batch27-tier4.png    1080×1920
images/results/batch28-tier1.png … batch28-tier4.png    1080×1920
```

Verify each is exactly 1080×1920. Anything else distorts, because the renderer scales to the
canvas width and anchors to the bottom.

Each set is shared between SSC and HSC, which means the same artwork is composited onto a light
`#f7fafd` backdrop for SSC and a dark `#07090a` one for HSC. Check every image against both.
If any piece of artwork disappears into one of the two backgrounds, ask the client for a version
with its own solid backdrop rather than adjusting the themes — the themes are derived from the
logos and should not drift.

- [ ] **Step 2: Replace the syllabus content**

Rewrite the chapter arrays in `src/data/syllabus.js` with the client's real syllabus, keeping the
existing structure and the `<level><batch>-<subjectId>-<paper>-<n>` id convention.

Add the full HSC Humanities optional subject list, marking compulsory subjects with
`compulsory: true, defaultSelected: true`.

- [ ] **Step 3: Bump the schema version**

Chapter ids have changed, so any stored progress from testing is now meaningless. In
`src/lib/state.js`:

```javascript
export const SCHEMA_VERSION = 2;
```

Returning testers are reset rather than silently mis-scored. The tests in `tests/state.test.js`
read `SCHEMA_VERSION` rather than hardcoding it, so they continue to pass.

- [ ] **Step 4: Fill in the enrolment URLs**

In `src/data/config.js`:

```javascript
  enrolUrls: {
    ssc: 'https://edgecoursebd.com/...',   // Complete Academic Program (CAP)
    hsc: 'https://edgecoursebd.com/...',   // Academic to Admission Course
  },
```

- [ ] **Step 5: Run the full suite and rebuild**

Run: `node --test && node scripts/build.mjs`
Expected: all tests pass. The uniqueness tests in `tests/subjects.test.js` will catch duplicated
chapter ids introduced during transcription — this is exactly what they are for.

- [ ] **Step 6: Verify every path**

Walk all six group combinations end to end, confirming subject counts and chapter counts against
the source material, and confirming each of the eight tier images renders for its band.

- [ ] **Step 7: Commit**

```bash
git add src/data images syllabus-tracker.html
git commit -m "feat: ingest real syllabus content and result artwork"
```

---

### Task 16: Responsive and accessibility pass

**Files:**
- Modify: `src/styles/*.css`, `src/lib/ui.js` as needed

- [ ] **Step 1: Check every breakpoint**

In browser devtools, walk the full flow at 320×568, 375×667, 375×812, 414×896, 768×1024 and
1280×800. At each: no horizontal scrollbar, no clipped text, no overlapping elements.

Verify no horizontal overflow programmatically in the console:

```javascript
[...document.querySelectorAll('*')].filter((n) => n.scrollWidth > document.documentElement.clientWidth)
```

Expected: an empty array. Fix anything listed.

- [ ] **Step 2: Check tap targets**

In the console:

```javascript
[...document.querySelectorAll('button, input, a, label.check')]
  .map((n) => ({ n, r: n.getBoundingClientRect() }))
  .filter(({ r }) => r.height < 44 || r.width < 44)
```

Expected: empty. Fix anything listed by raising `min-height` or padding.

- [ ] **Step 3: Check keyboard and screen reader basics**

1. Tab through every screen. Focus is always visible and order is logical.
2. Every checkbox is reachable and togglable with Space.
3. Accordion headers activate with Enter and Space.
4. Add `aria-expanded` to accordion heads and `aria-live="polite"` to the dock percentage so
   progress is announced.

- [ ] **Step 4: Check both themes**

The dark HSC theme is where contrast regressions hide, because every colour was chosen against
the light SSC theme first.

1. Walk the full flow once as SSC and once as HSC.
2. Confirm neither logo shows a visible rectangle against its page background.
3. Confirm checkbox and text-input chrome renders dark on HSC — if either looks light, the
   `color-scheme` declarations in `tokens.css` are not applying.
4. Check contrast with devtools' colour picker on the HSC theme: body text (`--ink` on `--bg`),
   muted text (`--ink-soft` on `--surface`), and button labels (`--accent-ink` on `--accent`).
   All must clear 4.5:1. `--ink-soft` on `--surface` is the likeliest failure; darken
   `--surface` or lighten `--ink-soft` rather than changing the accent.
5. Generate a result image on both themes and confirm the exported PNG matches the page it came
   from.

- [ ] **Step 5: Check reduced motion**

Enable *prefers-reduced-motion* in devtools. Confirm the count-up still lands on the correct
number and no animation loops. The token file already suppresses transitions; verify the
`setInterval` count-up still terminates.

- [ ] **Step 6: Rebuild and commit**

```bash
node scripts/build.mjs
git add src syllabus-tracker.html
git commit -m "fix: responsive and accessibility pass across all breakpoints"
```

---

### Task 17: Documentation and handoff

**Files:**
- Create: `README.md`, `INTEGRATION-NOTES.md`

- [ ] **Step 1: Write the README**

Create `README.md` covering, for a developer arriving with no context:

- What the tool is, in two sentences, with the Bengali product name.
- Quick start: `node scripts/build.mjs` to build, `node --test` to test, no `npm install` ever.
- The `src/` → `syllabus-tracker.html` relationship, stated as a warning: never hand-edit the built file.
- How to add or change a subject or chapter, with a worked example from `src/data/syllabus.js`.
- Why chapter ids must never be reused, and the `SCHEMA_VERSION` bump that follows a renumbering.
- A pointer to `SETUP-APPS-SCRIPT.md` for the backend.
- The repository URL.

- [ ] **Step 2: Write the integration notes**

Create `INTEGRATION-NOTES.md` in the same format as the client's previous ones:

- **What this is** — one self-contained HTML file, no build step to deploy, no React or Django changes.
- **Files to deploy together** — `syllabus-tracker.html` plus the full `images/` tree, with the note that `images/` must sit beside the HTML or the `src` paths need updating.
- **Things you'll likely need to edit** — `CONFIG.appsScriptUrl`, `CONFIG.enrolUrls`, `CONFIG.tiers`, and the GA4 and Meta Pixel blocks in `<head>`.
- **Known intentional quirks** —
  - The lead POST uses `Content-Type: text/plain`. This looks wrong and is deliberate: it avoids the CORS preflight Apps Script cannot answer.
  - The result image only generates over `http(s)://`. Opening via `file://` taints the canvas and blocks export. Not a bug.
  - Enrolled students are never written to the sheet, so the `Enrolled` column always reads `No`.
  - Accordions collapse to the first subject on every tick. Deliberate tradeoff for live progress feedback.
- **Design notes** — Baloo Da 2 and Hind Siliguri from Google Fonts, as in `COMEBACK/index.html`.
  Two full themes rather than one theme with a swapped accent: SSC is light with a blue accent,
  HSC is dark with a green accent, both switched by `data-brand` on `<body>`. Every colour is
  sampled from the supplied logo artwork so that each opaque JPEG logo sits on a page background
  matching its own, and note that this is why the palettes should not be retuned casually.

- [ ] **Step 3: Add the GA4 and Meta Pixel placeholders**

In `src/index.html`, add commented blocks in `<head>` matching the convention from the client's
previous pages:

```html
<!-- GA4 — replace G-XXXXXXXXXX and uncomment to enable
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
-->

<!-- Meta Pixel — replace XXXXXXXXXXXXXXX and uncomment to enable
<script>
  !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
  n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
  n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
  t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
  document,'script','https://connect.facebook.net/en_US/fbevents.js');
  fbq('init', 'XXXXXXXXXXXXXXX'); fbq('track', 'PageView');
</script>
-->
```

These are commented out, so the build test asserting no unexpected external references still
passes — it matches `src`/`href` attributes, which inside an HTML comment are inert but still
present in the string. Update `tests/build.test.js` to strip HTML comments before scanning:

```javascript
test('build references no external script or stylesheet except google fonts', () => {
  const html = buildHtml().replace(/<!--[\s\S]*?-->/g, '');
  const externals = [...html.matchAll(/(?:src|href)="(https?:\/\/[^"]+)"/g)].map((m) => m[1]);
  for (const url of externals) {
    assert.match(url, /^https:\/\/fonts\.(googleapis|gstatic)\.com/, `unexpected external: ${url}`);
  }
});
```

- [ ] **Step 4: Run the full suite, rebuild, commit**

```bash
node --test && node scripts/build.mjs
git add README.md INTEGRATION-NOTES.md src/index.html tests/build.test.js syllabus-tracker.html
git commit -m "docs: add README and integration notes for the deploying developer"
```

---

### Task 18: Publish

- [ ] **Step 1: Confirm the tree is clean and the build is current**

```bash
node --test && node scripts/build.mjs && git status --short
```

Expected: all tests pass, and `git status` is empty. A dirty `syllabus-tracker.html` here means
a previous task committed source without rebuilding — commit the rebuild before continuing.

- [ ] **Step 2: Confirm with the user before pushing**

Pushing publishes the work to a repository the client's developer will consume. Ask before the
first push rather than assuming.

- [ ] **Step 3: Push**

```bash
git push -u origin main
```

- [ ] **Step 4: Verify the published tree**

Confirm on GitHub that `syllabus-tracker.html`, `images/`, `apps-script/Code.gs`,
`SETUP-APPS-SCRIPT.md`, `INTEGRATION-NOTES.md` and `README.md` are all present, and that the
README renders correctly.

---

## Verification Summary

| Concern | How it is verified |
|---|---|
| Tier boundaries | `tests/scoring.test.js` — every edge pinned |
| Percentage math | `tests/scoring.test.js` — including the empty and full cases |
| Deselected subjects lose credit | `tests/scoring.test.js`, `tests/state.test.js` |
| Phone and email rules | `tests/validation.test.js` |
| SSC skips the picker | `tests/state.test.js` |
| Enrolled students skip the lead form | `tests/state.test.js` |
| Corrupt or stale localStorage | `tests/state.test.js` |
| Private-mode storage failure | `tests/state.test.js` |
| Chapter id uniqueness | `tests/subjects.test.js` — catches transcription errors in Task 15 |
| Payload matches sheet columns | `tests/tracking.test.js` |
| Single-file output, no externals | `tests/build.test.js` |
| Row actually lands in the sheet | Manual, Task 12 step 3 and Task 13 step 7 |
| Bengali renders in canvas | Manual, Task 14 step 4 |
| Responsive and tap targets | Manual with console assertions, Task 16 |
