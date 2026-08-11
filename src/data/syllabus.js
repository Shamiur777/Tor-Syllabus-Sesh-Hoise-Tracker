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
