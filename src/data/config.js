export const CONFIG = {
  // Filled in during Task 12 after the Apps Script web app is deployed.
  appsScriptUrl: 'https://script.google.com/macros/s/AKfycbyO3QV2kPDJvrQ_bpYet_Ab2UcgiscO9hWJXSw3a6F6DFnKkgUZd6qX3iun12G90AOc/exec',

  // Enrolment destinations, supplied by the client 2026-08-19.
  //
  // Looked up most-specific-first by resolveEnrolUrl() in src/lib/enrol.js:
  //   `<level>-<batch>-<group>`  ->  `<level>-<batch>`  ->  `<level>`
  // so a group-specific course wins over the batch's general programme, and a
  // plain level key still works as a catch-all. A missing key is not an error —
  // the "কোর্স দেখে আসো" button is simply omitted rather than pointing nowhere.
  enrolUrls: {
    // Business Studies students get the group-specific programme.
    'ssc-27-commerce': 'https://edgecoursebd.com/courses/518',
    'ssc-28-commerce': 'https://edgecoursebd.com/courses/519',
    // Everyone else on that batch. Batch 27 is Class 10 (closer to the exam,
    // so it gets the LastShot Revision Batch rather than a full programme);
    // batch 28 is Class 9, on the Complete Academic Program. Confirmed with
    // the client 2026-08-20 -- do not merge these back into one course.
    'ssc-27': 'https://edgecoursebd.com/courses/566',
    'ssc-28': 'https://edgecoursebd.com/courses/481',
    // HSC — Academic to Admission courses.
    'hsc-28-science': 'https://edgecoursebd.com/courses/570',
    'hsc-28-humanities': 'https://edgecoursebd.com/courses/571',
    'hsc-28-business': 'https://edgecoursebd.com/courses/572',
    'hsc-27-humanities': 'https://edgecoursebd.com/courses/347',
    'hsc-27-business': 'https://edgecoursebd.com/courses/353',
    // "HSC27 Academic to Admission Course (Revive)" names no group, but arts and
    // business are both explicit above, so this is the science one by elimination.
    'hsc-27-science': 'https://edgecoursebd.com/courses/346',
  },

  copy: {
    // These two strings are fixed by the client. Do not reword.
    enrolledYes: 'সাব্বাশ, রাইট ট্র্যাকেই আছো!',
    enrolledNo: 'এভাবে ত মামা তোমার সিলেবাস জীবনেও শেষ হবে না! আজই এনরোল করো।',
    courseName: { ssc: 'Complete Academic Program (CAP)', hsc: 'Academic to Admission Course' },
  },

  // Inclusive percentage bands, evaluated in order. Retune here, not in code.
  // `label` is the catchphrase confirmed with the client per tier (see the
  // result-artwork table in HANDOFF.md) -- drawn as a caption bar over the
  // tier artwork in canvas.js so the exported/shared image carries it, not
  // just this table.
  tiers: {
    27: [
      { id: 'batch27-tier1', min: 0, max: 29, label: 'তুই তো শেষ মামা' },
      { id: 'batch27-tier2', min: 30, max: 49, label: 'এভাবে চলবে না!' },
      { id: 'batch27-tier3', min: 50, max: 69, label: 'আরও ভাল করতে হবে!' },
      { id: 'batch27-tier4', min: 70, max: 100, label: 'পারফেক্ট! ট্র্যাক ধরে রাখো...' },
    ],
    28: [
      { id: 'batch28-tier1', min: 0, max: 10, label: 'তুই তো শেষ মামা' },
      { id: 'batch28-tier2', min: 11, max: 30, label: 'এভাবে চলবে না!' },
      { id: 'batch28-tier3', min: 31, max: 60, label: 'সাবাস! আরও ভালো করতে হবে!' },
      { id: 'batch28-tier4', min: 61, max: 100, label: 'তুই তো GOAT মামা!' },
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

  // Shareable result-image artwork per batch/tier. Placeholders on disk now;
  // the client replaces these files in Task 15 without any code change.
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

  // Shown instead of the tier image when a student reports exactly 100%.
  // The client's joke response to a suspiciously perfect score.
  perfectImage: 'images/results/perfect.png',
  perfectLabel: 'মিথ্যা কথা বলিস কেন!',
};
