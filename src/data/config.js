export const CONFIG = {
  // Filled in during Task 12 after the Apps Script web app is deployed.
  appsScriptUrl: '',

  // Enrolment destinations. Supplied by the client in Task 15.
  enrolUrls: {
    ssc: '',
    hsc: '',
  },

  copy: {
    // These two strings are fixed by the client. Do not reword.
    enrolledYes: 'সাব্বাশ, রাইট ট্র্যাকেই আছো!',
    enrolledNo: 'এভাবে ত মামা তোমার সিলেবাস জীবনেও শেষ হবে না! আজই এনরোল করো।',
    courseName: { ssc: 'Complete Academic Program (CAP)', hsc: 'Academic to Admission Course' },
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
};
