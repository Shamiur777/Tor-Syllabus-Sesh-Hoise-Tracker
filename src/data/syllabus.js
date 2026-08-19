// Syllabus content.
//
// SOURCES
//   HSC Science  — client-supplied `syllabus-source/HSC Syllabus.txt`.
//                  Higher Math 2nd Paper was missing there and was sourced
//                  from the web on 2026-08-19 (see that file's note).
//   SSC Commerce — client-supplied `syllabus-source/SSC Commerce Syllabus.pdf`
//                  (2027 SSC exam syllabus). Read from the rendered pages
//                  because the PDF's text layer is corrupted.
//   SSC Science, SSC Arts (history/economics/civics), HSC Business
//   (accounting/marketing), and HSC Humanities (civics/economics/history/
//   islamic_history/logic/sociology/geography/psychology/statistics) —
//   transcribed from `research/syllabus-research.md` (compiled 2026-08-19,
//   NCTB primary sources; see that file for full citations). Subjects whose
//   research confidence was only "medium" (a split high/medium line counts
//   as medium) have ` [যাচাই করতে হবে]` appended to their name so the
//   uncertainty is visible in the UI: SSC Science Biology, SSC Arts
//   Economics, SSC Arts Civics and Citizenship, HSC Humanities Sociology.
//
// STILL PLACEHOLDER, pending research/client confirmation (research
// confidence was low/low-medium/unverified, so nothing was transcribed):
//   SSC Arts Geography and Environment, HSC Business Organisation and
//   Management, HSC Finance/Banking/Insurance, HSC Social Work, and the
//   compulsory Bangla/English/Maths for SSC Commerce.
//   Those keep structurally-correct sample chapters so the app runs; they
//   must be replaced before launch or their percentages are meaningless.
//
// EDITING
//   To add a chapter: append to the relevant paper's `chapters` array with a
//   unique id. Ids must NEVER be reused for different content — returning
//   students are matched by id. After renumbering ids, bump SCHEMA_VERSION in
//   src/lib/state.js so stored progress is reset rather than mis-scored.

const ch = (prefix, names) => names.map((name, i) => ({ id: `${prefix}-${i + 1}`, name }));

const TODO = ['PLACEHOLDER — বিষয়বস্তু নিশ্চিত করতে হবে'];

/* ---------------------------------------------------------------- SSC ---- */

function sscScience(batch) {
  const p = `ssc${batch}`;
  return {
    physics: {
      name: 'পদার্থবিজ্ঞান (Physics)', compulsory: true, defaultSelected: true,
      papers: [{ name: '', chapters: ch(`${p}-physics-x`, [
        'ভৌত রাশি এবং তাদের পরিমাপ',
        'গতি',
        'বল',
        'কাজ, ক্ষমতা ও শক্তি',
        'তরঙ্গ ও শব্দ',
        'আলোর প্রতিফলন',
        'স্থির বিদ্যুৎ',
      ]) }],
    },
    chemistry: {
      name: 'রসায়ন (Chemistry)', compulsory: true, defaultSelected: true,
      papers: [{ name: '', chapters: ch(`${p}-chemistry-x`, [
        'পদার্থের গঠন',
        'পর্যায় সারণি',
        'রাসায়নিক বন্ধন (আংশিক)',
        'মোলের ধারণা ও রাসায়নিক গণনা',
        'রাসায়নিক বিক্রিয়া',
        'খনিজ সম্পদ: জীবাশ্ম (আংশিক)',
      ]) }],
    },
    biology: {
      name: 'জীববিজ্ঞান (Biology) [যাচাই করতে হবে]', compulsory: true, defaultSelected: true,
      papers: [{ name: '', chapters: ch(`${p}-biology-x`, [
        'জীবন পাঠ',
        'জীবকোষ ও টিস্যু',
        'কোষ বিভাজন',
        'জীবনীশক্তি',
        'জীবে প্রজনন (আংশিক)',
        'জীবের বংশগতি ও বিবর্তন',
        'জীবের পরিবেশ, বিস্তার ও সংরক্ষণ',
      ]) }],
    },
    higher_math: {
      name: 'উচ্চতর গণিত (Higher Mathematics)', compulsory: true, defaultSelected: true,
      papers: [{ name: '', chapters: ch(`${p}-hmath-x`, [
        'বীজগাণিতিক রাশি',
        'অসীম ধারা',
        'ত্রিকোণমিতি (আংশিক)',
        'সূচকীয় ও লগারিদমিক ফাংশন',
        'দ্বিপদী বিস্তৃতি',
        'স্থানাঙ্ক জ্যামিতি',
        'সমতলীয় ভেক্টর',
        'সম্ভাবনা',
      ]) }],
    },
  };
}

function sscArts(batch) {
  const p = `ssc${batch}`;
  const todo = (id, label) => ({
    name: label, compulsory: true, defaultSelected: true,
    papers: [{ name: '', chapters: ch(`${p}-${id}-x`, TODO) }],
  });
  return {
    geography: todo('geo', 'ভূগোল ও পরিবেশ (Geography and Environment)'),
    civics: {
      name: 'পৌরনীতি ও নাগরিকতা (Civics and Citizenship) [যাচাই করতে হবে]', compulsory: true, defaultSelected: true,
      papers: [{ name: '', chapters: ch(`${p}-civics-x`, [
        'পৌরনীতি ও নাগরিকতা',
        'আইন, স্বাধীনতা ও সাম্য',
        'রাষ্ট্র ও সরকার',
        'বাংলাদেশের সরকার ব্যবস্থা',
        'স্থানীয় সরকার',
        'মানবাধিকার',
      ]) }],
    },
    history: {
      name: 'বাংলাদেশের ইতিহাস ও বিশ্বসভ্যতা (History)', compulsory: true, defaultSelected: true,
      papers: [{ name: '', chapters: ch(`${p}-history-x`, [
        'বিশ্বসভ্যতা',
        'প্রাচীন বাংলার রাজনৈতিক ইতিহাস',
        'মধ্যযুগের বাংলার রাজনৈতিক ইতিহাস',
        'বাংলায় ইংরেজ শাসনের সূচনাপর্ব',
        'ইংরেজ শাসনামলে বাংলায় প্রতিরোধ ও সংগ্রাম',
        'সত্তরের নির্বাচন ও মুক্তিযুদ্ধ',
      ]) }],
    },
    economics: {
      name: 'অর্থনীতি (Economics) [যাচাই করতে হবে]', compulsory: true, defaultSelected: true,
      papers: [{ name: '', chapters: ch(`${p}-eco-x`, [
        'অর্থনীতির গুরুত্ব',
        'উপযোগ, চাহিদা, যোগান',
        'উৎপাদন ও সংগঠন',
        'জাতীয় আয় ও এর পরিমাপ',
        'অর্থ ও ব্যাংক ব্যবস্থা',
        'বাংলাদেশ সরকারের রাজস্বনীতি',
      ]) }],
    },
  };
}

// Real content, read from the client's 2027 SSC Commerce syllabus PDF.
function sscCommerce(batch) {
  const p = `ssc${batch}`;
  return {
    accounting: {
      name: 'হিসাববিজ্ঞান (Accounting)', compulsory: true, defaultSelected: true,
      papers: [{ name: '', chapters: ch(`${p}-acc-x`, [
        'হিসাববিজ্ঞান পরিচিতি',
        'লেনদেন',
        'দুতরফা দাখিলা পদ্ধতি',
        'মূলধন ও মুনাফা জাতীয় লেনদেন',
        'হিসাব',
        'জাবেদা',
        'খতিয়ান',
        'নগদান বই',
        'রেওয়ামিল',
        'আর্থিক বিবরণী',
        'পণ্যের ক্রয়মূল্য, উৎপাদন ব্যয় ও বিক্রয়মূল্য',
      ]) }],
    },
    finance: {
      name: 'ফিন্যান্স ও ব্যাংকিং (Finance and Banking)', compulsory: true, defaultSelected: true,
      papers: [{ name: '', chapters: ch(`${p}-fin-x`, [
        'অর্থায়ন ও ব্যবসায় অর্থায়ন',
        'অর্থায়নের উৎস',
        'শেয়ার, বন্ড ও ডিবেঞ্চার',
        'অর্থের সময়মূল্য',
        'ঝুঁকি ও অনিশ্চয়তা',
        'মূলধনি আয়-ব্যয় প্রাক্কলন',
        'মূলধন ব্যয়',
        'মুদ্রা, ব্যাংক ও ব্যাংকিং',
        'ব্যাংকিং ব্যবসায় ও তার ধরন',
        'বাণিজ্যিক ব্যাংক',
        'ব্যাংকের আমানত',
        'ব্যাংক ও গ্রাহক',
      ]) }],
    },
    entrepreneurship: {
      name: 'ব্যবসায় উদ্যোগ (Business Entrepreneurship)', compulsory: true, defaultSelected: true,
      papers: [{ name: '', chapters: ch(`${p}-ent-x`, [
        'ব্যবসায় পরিচিতি',
        'ব্যবসায় উদ্যোগ ও উদ্যোক্তা',
        'আত্মকর্মসংস্থান',
        'মালিকানার ভিত্তিতে ব্যবসায়',
        'ব্যবসায়ের আইনগত দিক',
        'ব্যবসায় পরিকল্পনা',
        'বাংলাদেশের শিল্প',
        'ব্যবসায় প্রতিষ্ঠানের ব্যবস্থাপনা',
        'বিপণন',
        'ব্যবসায় উদ্যোগ উন্নয়নে সহায়ক সেবা',
        'ব্যবসায় নৈতিকতা ও সামাজিক দায়িত্ব',
        'সফল উদ্যোক্তাদের জীবনী থেকে শিক্ষণীয়',
      ]) }],
    },
    ict: {
      name: 'তথ্য ও যোগাযোগ প্রযুক্তি (ICT)', compulsory: true, defaultSelected: true,
      papers: [{ name: '', chapters: ch(`${p}-ict-x`, [
        'তথ্য ও যোগাযোগ প্রযুক্তি ও আমাদের বাংলাদেশ',
        'কম্পিউটার রক্ষণাবেক্ষণ ও সাইবার নিরাপত্তা',
        'ইন্টারনেট ও ওয়েব পরিচিতি',
        'আমার লেখালেখি ও হিসাব',
        'মাল্টিমিডিয়া ও গ্রাফিক্স',
      ]) }],
    },
  };
}

/* ---------------------------------------------------------------- HSC ---- */

// Real content, from the client's HSC syllabus file.
function hscScience(batch) {
  const p = `hsc${batch}`;
  return {
    bangla: {
      name: 'বাংলা ১ম পত্র (Bangla 1st Paper)', compulsory: true, defaultSelected: true,
      papers: [
        { name: 'গদ্য', chapters: ch(`${p}-bangla-1`, [
          'বাঙ্গালার নব্য লেখকদিগের প্রতি নিবেদন — বঙ্কিমচন্দ্র চট্টোপাধ্যায়',
          'অপরিচিতা — রবীন্দ্রনাথ ঠাকুর',
          'সাহিত্যে খেলা — প্রমথ চৌধুরী',
          'বিলাসী — শরৎচন্দ্র চট্টোপাধ্যায়',
          'অর্ধাঙ্গী — রোকেয়া সাখাওয়াত হোসেন',
          'যৌবনের গান — কাজী নজরুল ইসলাম',
          'জীবন ও বৃক্ষ — মোতাহের হোসেন চৌধুরী',
          'গন্তব্য কাবুল — সৈয়দ মুজতবা আলী',
          'মাসি-পিসি — মানিক বন্দ্যোপাধ্যায়',
          'কপিলদাস মুর্মুর শেষ কাজ — শওকত আলী',
          'রেইনকোট — আখতারুজ্জামান ইলিয়াস',
          'নেকলেস — গী দ্য মোপাসাঁ',
        ]) },
        { name: 'কবিতা', chapters: ch(`${p}-bangla-2`, [
          'ঋতু-বর্ণন — আলাওল',
          'বিভীষণের প্রতি মেঘনাদ — মাইকেল মধুসূদন দত্ত',
          'সোনার তরী — রবীন্দ্রনাথ ঠাকুর',
          'বিদ্রোহী — কাজী নজরুল ইসলাম',
          'সুচেতনা — জীবনানন্দ দাশ',
          'প্রতিদান — জসীমউদ্দীন',
          'তাহারেই পড়ে মনে — সুফিয়া কামাল',
          'পদ্মা — ফররুখ আহমদ',
          'ফেব্রুয়ারি ১৯৬৯ — শামসুর রাহমান',
          'আঠার বছর বয়স — সুকান্ত ভট্টাচার্য',
          'আমি কিংবদন্তির কথা বলছি — আবু জাফর ওবায়দুল্লাহ্',
          'প্রত্যাবর্তনের লজ্জা — আল মাহমুদ',
        ]) },
      ],
    },
    english: {
      name: 'English', compulsory: true, defaultSelected: true,
      papers: [{ name: '', chapters: ch(`${p}-english-x`, [
        'Unit 1: Education and Life',
        'Unit 2: Art and Craft',
        'Unit 3: Myths and Literature',
        'Unit 4: History',
        'Unit 5: Human Rights',
        'Unit 6: Dreams',
        'Unit 7: Youthful Achievers',
        'Unit 8: Relationships',
        'Unit 9: Adolescence',
        'Unit 10: Lifestyle',
        'Unit 11: Peace and Conflict',
        'Unit 12: Environment and Nature',
      ]) }],
    },
    ict: {
      name: 'তথ্য ও যোগাযোগ প্রযুক্তি (ICT)', compulsory: true, defaultSelected: true,
      papers: [{ name: '', chapters: ch(`${p}-ict-x`, [
        'বিশ্ব ও বাংলাদেশ প্রেক্ষিত',
        'কমিউনিকেশন সিস্টেমস ও নেটওয়ার্কিং',
        'সংখ্যা পদ্ধতি ও ডিজিটাল ডিভাইস',
        'ওয়েব ডিজাইন পরিচিতি এবং এইচটিএমএল',
        'প্রোগ্রামিং ভাষা',
        'ডেটাবেজ ম্যানেজমেন্ট সিস্টেম',
      ]) }],
    },
    physics: {
      name: 'পদার্থবিজ্ঞান (Physics)', compulsory: true, defaultSelected: true,
      papers: [
        { name: '১ম পত্র', chapters: ch(`${p}-physics-1`, [
          'ভৌত জগৎ ও পরিমাপ',
          'ভেক্টর',
          'গতিবিদ্যা',
          'নিউটনিয়ান বলবিদ্যা',
          'কাজ, শক্তি ও ক্ষমতা',
          'মহাকর্ষ ও অভিকর্ষ',
          'পদার্থের গাঠনিক ধর্ম',
          'পর্যাবৃত্ত গতি',
          'তরঙ্গ',
          'আদর্শ গ্যাস ও গ্যাসের গতিতত্ত্ব',
        ]) },
        { name: '২য় পত্র', chapters: ch(`${p}-physics-2`, [
          'তাপগতিবিদ্যা',
          'স্থির তড়িৎ',
          'চল তড়িৎ',
          'স্থির তড়িতের চৌম্বক ক্রিয়া ও চুম্বকত্ব',
          'তাড়িত চৌম্বক আবেশ ও পরিবর্তী প্রবাহ',
          'জ্যামিতিক আলোকবিজ্ঞান',
          'ভৌত আলোকবিজ্ঞান',
          'আধুনিক পদার্থবিজ্ঞানের সূচনা',
          'পরমাণুর মডেল ও নিউক্লিয়ার পদার্থবিজ্ঞান',
          'সেমিকন্ডাক্টর ও ইলেকট্রনিক্স',
        ]) },
      ],
    },
    chemistry: {
      name: 'রসায়ন (Chemistry)', compulsory: true, defaultSelected: true,
      papers: [
        { name: '১ম পত্র', chapters: ch(`${p}-chemistry-1`, [
          'ল্যাবরেটরির নিরাপদ ব্যবহার',
          'গুণগত রসায়ন',
          'মৌলের পর্যায়বৃত্ত ধর্ম ও রাসায়নিক বন্ধন',
          'রাসায়নিক পরিবর্তন',
          'কর্মমুখী রসায়ন',
        ]) },
        { name: '২য় পত্র', chapters: ch(`${p}-chemistry-2`, [
          'পরিবেশ রসায়ন',
          'জৈব রসায়ন',
          'পরিমাণগত রসায়ন',
          'তড়িৎ রসায়ন',
          'অর্থনৈতিক রসায়ন',
        ]) },
      ],
    },
    biology: {
      name: 'জীববিজ্ঞান (Biology)', compulsory: false, defaultSelected: true,
      papers: [
        { name: '১ম পত্র — উদ্ভিদবিজ্ঞান', chapters: ch(`${p}-biology-1`, [
          'কোষ ও এর গঠন',
          'কোষ বিভাজন',
          'কোষ রসায়ন',
          'অণুজীব',
          'শৈবাল ও ছত্রাক',
          'ব্রায়োফাইটা ও টেরিডোফাইটা',
          'নগ্নবীজী ও আবৃতবীজী উদ্ভিদ',
          'টিস্যু ও টিস্যুতন্ত্র',
          'উদ্ভিদ শরীরতত্ত্ব',
          'উদ্ভিদ প্রজনন',
          'জীবপ্রযুক্তি',
          'জীবের পরিবেশ, বিস্তার ও সংরক্ষণ',
        ]) },
        { name: '২য় পত্র — প্রাণিবিজ্ঞান', chapters: ch(`${p}-biology-2`, [
          'প্রাণীর বিভিন্নতা ও শ্রেণিবিন্যাস',
          'প্রাণীর পরিচিতি',
          'মানব শরীরতত্ত্ব: পরিপাক ও শোষণ',
          'মানব শরীরতত্ত্ব: রক্ত ও সংবহন',
          'মানব শরীরতত্ত্ব: শ্বসন ও শ্বাসক্রিয়া',
          'মানব শরীরতত্ত্ব: বর্জ্য ও নিষ্কাশন',
          'মানব শরীরতত্ত্ব: চলন ও অঙ্গচালনা',
          'মানব শরীরতত্ত্ব: সমন্বয় ও নিয়ন্ত্রণ',
          'মানব জীবনের ধারাবাহিকতা',
          'মানবদেহের প্রতিরক্ষা',
          'জিন তত্ত্ব ও বিবর্তন',
        ]) },
      ],
    },
    higher_math: {
      name: 'উচ্চতর গণিত (Higher Mathematics)', compulsory: false, defaultSelected: true,
      papers: [
        { name: '১ম পত্র', chapters: ch(`${p}-hmath-1`, [
          'ম্যাট্রিক্স ও নির্ণায়ক',
          'ভেক্টর',
          'সরলরেখা',
          'বৃত্ত',
          'বিন্যাস ও সমাবেশ',
          'ত্রিকোণমিতিক অনুপাত',
          'সংযুক্ত কোণের ত্রিকোণমিতিক অনুপাত',
          'ফাংশন ও ফাংশনের লেখচিত্র',
          'অন্তরীকরণ (ক্যালকুলাস)',
          'যোগজীকরণ (ক্যালকুলাস)',
        ]) },
        { name: '২য় পত্র', chapters: ch(`${p}-hmath-2`, [
          'বাস্তব সংখ্যা ও অসমতা',
          'যোগাশ্রয়ী প্রোগ্রাম',
          'জটিল সংখ্যা',
          'বহুপদী ও বহুপদী সমীকরণ',
          'দ্বিপদী বিস্তৃতি',
          'কণিক',
          'বিপরীত ত্রিকোণমিতিক ফাংশন ও ত্রিকোণমিতিক সমীকরণ',
          'স্থিতিবিদ্যা',
          'সমতলে বস্তুকণার গতি',
          'বিস্তার পরিমাপ ও সম্ভাবনা',
        ]) },
      ],
    },
  };
}

function hscBusiness(batch) {
  const p = `hsc${batch}`;
  const twoPaper = (id, label) => ({
    name: label, compulsory: false, defaultSelected: true,
    papers: [
      { name: '১ম পত্র', chapters: ch(`${p}-${id}-1`, TODO) },
      { name: '২য় পত্র', chapters: ch(`${p}-${id}-2`, TODO) },
    ],
  });
  return {
    ict: {
      name: 'তথ্য ও যোগাযোগ প্রযুক্তি (ICT)', compulsory: true, defaultSelected: true,
      papers: [{ name: '', chapters: ch(`${p}-ict-x`, [
        'বিশ্ব ও বাংলাদেশ প্রেক্ষিত',
        'কমিউনিকেশন সিস্টেমস ও নেটওয়ার্কিং',
        'সংখ্যা পদ্ধতি ও ডিজিটাল ডিভাইস',
        'ওয়েব ডিজাইন পরিচিতি এবং এইচটিএমএল',
        'প্রোগ্রামিং ভাষা',
        'ডেটাবেজ ম্যানেজমেন্ট সিস্টেম',
      ]) }],
    },
    accounting: {
      name: 'হিসাববিজ্ঞান (Accounting)', compulsory: false, defaultSelected: true,
      papers: [
        { name: '১ম পত্র', chapters: ch(`${p}-acc-1`, [
          'হিসাববিজ্ঞান পরিচিতি (আংশিক)',
          'হিসাবের বইসমূহ (আংশিক)',
          'ব্যাংক সমন্বয় বিবরণী',
          'রেওয়ামিল (আংশিক)',
          'কার্যপত্র',
          'দৃশ্যমান সম্পদের হিসাবরক্ষণ (আংশিক)',
          'আর্থিক বিবরণী',
        ]) },
        { name: '২য় পত্র', chapters: ch(`${p}-acc-2`, [
          'অংশীদারি ব্যবসায়ের হিসাব',
          'যৌথমূলধনী কোম্পানির মূলধন (আংশিক)',
          'যৌথমূলধনী কোম্পানির আর্থিক বিবরণী',
          'উৎপাদন ব্যয় হিসাব',
          'মজুদ পণ্যের হিসাবরক্ষণ পদ্ধতি',
        ]) },
      ],
    },
    management: twoPaper('mgmt', 'ব্যবসায় সংগঠন ও ব্যবস্থাপনা (Business Organisation and Management)'),
    finance: twoPaper('fin', 'ফিন্যান্স, ব্যাংকিং ও বীমা (Finance, Banking and Insurance)'),
    marketing: {
      name: 'উৎপাদন ব্যবস্থাপনা ও বিপণন (Production Management and Marketing)', compulsory: false, defaultSelected: true,
      papers: [
        { name: '১ম পত্র', chapters: ch(`${p}-mkt-1`, [
          'উৎপাদন',
          'উৎপাদনের উপকরণ',
          'পণ্য ডিজাইন',
        ]) },
        { name: '২য় পত্র', chapters: ch(`${p}-mkt-2`, [
          'বিপণন পরিচিতি',
          'বিপণন কার্যাবলি',
          'বাজার বিভক্তিকরণ ও বিপণন মিশ্রণ',
          'পণ্য ও পণ্যের মূল্য নির্ধারণ',
          'বিক্রয় প্রসার ও বিজ্ঞাপন',
        ]) },
      ],
    },
  };
}

function hscHumanities(batch) {
  const p = `hsc${batch}`;
  const optional = (id, label) => ({
    name: label, compulsory: false, defaultSelected: false,
    papers: [
      { name: '১ম পত্র', chapters: ch(`${p}-${id}-1`, TODO) },
      { name: '২য় পত্র', chapters: ch(`${p}-${id}-2`, TODO) },
    ],
  });
  return {
    ict: {
      name: 'তথ্য ও যোগাযোগ প্রযুক্তি (ICT)', compulsory: true, defaultSelected: true,
      papers: [{ name: '', chapters: ch(`${p}-ict-x`, [
        'বিশ্ব ও বাংলাদেশ প্রেক্ষিত',
        'কমিউনিকেশন সিস্টেমস ও নেটওয়ার্কিং',
        'সংখ্যা পদ্ধতি ও ডিজিটাল ডিভাইস',
        'ওয়েব ডিজাইন পরিচিতি এবং এইচটিএমএল',
        'প্রোগ্রামিং ভাষা',
        'ডেটাবেজ ম্যানেজমেন্ট সিস্টেম',
      ]) }],
    },
    civics: {
      name: 'পৌরনীতি ও সুশাসন (Civics and Good Governance)', compulsory: false, defaultSelected: false,
      papers: [
        { name: '১ম পত্র', chapters: ch(`${p}-civics-1`, [
          'পৌরনীতি ও সুশাসন পরিচিতি (আংশিক)',
          'মূল্যবোধ, আইন, স্বাধীনতা ও সাম্য',
          'নাগরিক অধিকার ও কর্তব্য এবং মানবাধিকার',
          'রাজনৈতিক দল, নেতৃত্ব ও সুশাসন',
          'সরকার কাঠামো ও সরকারের অঙ্গসমূহ',
          'দেশপ্রেম ও জাতীয়তা',
        ]) },
        { name: '২য় পত্র', chapters: ch(`${p}-civics-2`, [
          'ব্রিটিশ ভারতে প্রতিনিধিত্বশীল সরকারের বিকাশ',
          'পাকিস্তান থেকে বাংলাদেশ (১৯৪৭–১৯৭১)',
          'রাজনৈতিক ব্যক্তিত্ব: বাংলাদেশের স্বাধীনতা লাভ',
          'বাংলাদেশের সংবিধান (আংশিক)',
          'সাংবিধানিক প্রতিষ্ঠান',
          'নাগরিক সমস্যা ও আমাদের করণীয়',
        ]) },
      ],
    },
    economics: {
      name: 'অর্থনীতি (Economics)', compulsory: false, defaultSelected: false,
      papers: [
        { name: '১ম পত্র', chapters: ch(`${p}-economics-1`, [
          'মৌলিক অর্থনৈতিক সমস্যা এবং এর সমাধান',
          'ভোক্তা ও উৎপাদকের আচরণ',
          'উৎপাদন, উৎপাদন ব্যয় ও আয়',
          'বাজার',
          'সামগ্রিক আয় ও ব্যয়',
          'মুদ্রা ও ব্যাংক',
        ]) },
        { name: '২য় পত্র', chapters: ch(`${p}-economics-2`, [
          'বাংলাদেশের কৃষি',
          'বাংলাদেশের শিল্প',
          'জনসংখ্যা, মানবসম্পদ এবং আত্মকর্মসংস্থান',
          'মুদ্রাস্ফীতি',
          'আন্তর্জাতিক বাণিজ্য',
          'সরকারি অর্থব্যবস্থা',
        ]) },
      ],
    },
    history: {
      name: 'ইতিহাস (History)', compulsory: false, defaultSelected: false,
      papers: [
        { name: '১ম পত্র', chapters: ch(`${p}-history-1`, [
          'ভারতবর্ষে ইউরোপীয়দের আগমন: ইংরেজ আধিপত্য',
          'ইংরেজ উপনিবেশিক শাসন: ব্রিটিশ আমল',
          'পাকিস্তানি আমলে বাংলা: ভাষা আন্দোলন ও এর গতিপ্রকৃতি',
          'পূর্ব বাংলার স্বায়ত্তশাসন ও স্বাধিকার আন্দোলন',
          'বাংলাদেশের স্বাধীনতা ঘোষণা ও মুক্তিযুদ্ধ',
          'মুক্তিযুদ্ধ, প্রবাসী বাঙালি ও বহির্বিশ্ব',
        ]) },
        { name: '২য় পত্র', chapters: ch(`${p}-history-2`, [
          'ফরাসি বিপ্লব',
          'প্রথম বিশ্বযুদ্ধ এবং ভার্সাই সন্ধি',
          'বলশেভিক বিপ্লব',
          'হিটলার ও মুসোলিনির উত্থান এবং দ্বিতীয় বিশ্বযুদ্ধ',
          'জাতিসংঘ ও বিশ্বশান্তি',
          'স্নায়ুযুদ্ধ: পুঁজিবাদ ও সমাজতান্ত্রিক বিশ্বের দ্বন্দ্ব',
        ]) },
      ],
    },
    islamic_history: {
      name: 'ইসলামের ইতিহাস ও সংস্কৃতি (Islamic History and Culture)', compulsory: false, defaultSelected: false,
      papers: [
        { name: '১ম পত্র', chapters: ch(`${p}-islamic_history-1`, [
          'প্রাক ইসলামি আরব',
          'হযরত মুহাম্মদ (স.)',
          'খুলাফায়ে রাশেদিন',
          'উমাইয়া খিলাফত',
          'আব্বাসি খিলাফত',
        ]) },
        { name: '২য় পত্র', chapters: ch(`${p}-islamic_history-2`, [
          'ভারতে মুসলিম শাসন প্রতিষ্ঠা',
          'ভারত উপমহাদেশে মুঘল শাসন',
          'বাংলার ইতিহাস (পাকিস্তান আমল)',
          'স্বাধীন ও সার্বভৌম বাংলাদেশের অভ্যুদয়',
        ]) },
      ],
    },
    logic: {
      name: 'যুক্তিবিদ্যা (Logic)', compulsory: false, defaultSelected: false,
      papers: [
        { name: '১ম পত্র', chapters: ch(`${p}-logic-1`, [
          'যুক্তিবিদ্যা পরিচিতি',
          'যুক্তির উপাদান (আংশিক)',
          'বিধেয়ক',
          'অনুমান',
          'অবরোহ অনুমান (আংশিক)',
          'আরোহ অনুমান ও আরোহ অনুমানের মূল্য',
        ]) },
        { name: '২য় পত্র', chapters: ch(`${p}-logic-2`, [
          'যৌক্তিক সংজ্ঞা',
          'যৌক্তিক বিভাগ',
          'আরোহের প্রকারভেদ',
          'প্রকল্প',
          'ব্যাখ্যা',
        ]) },
      ],
    },
    social_work: optional('social_work', 'সমাজকর্ম (Social Work)'),
    sociology: {
      name: 'সমাজবিজ্ঞান (Sociology) [যাচাই করতে হবে]', compulsory: false, defaultSelected: false,
      papers: [
        { name: '১ম পত্র', chapters: ch(`${p}-sociology-1`, [
          'সমাজবিজ্ঞানের উৎপত্তি ও বিকাশ',
          'সমাজবিজ্ঞানের মৌল প্রত্যয় (আংশিক)',
          'সামাজিক প্রতিষ্ঠান',
          'সমাজ জীবনে প্রভাব বিস্তারকারী উপাদান',
          'সামাজিকীকরণ প্রক্রিয়া',
          'সামাজিক স্তরবিন্যাস ও অসমতা',
          'বিচ্যুতিমূলক আচরণ এবং অপরাধ',
          'সামাজিক পরিবর্তন',
        ]) },
        { name: '২য় পত্র', chapters: ch(`${p}-sociology-2`, [
          'বাংলাদেশে সমাজবিজ্ঞান চর্চার বিকাশ',
          'প্রত্নতাত্ত্বিক ভিত্তিতে বাংলাদেশ (আদি জনবসতি)',
          'বাংলাদেশের নৃগোষ্ঠীর জীবনধারা',
          'বাংলাদেশের অভ্যুদয়ের সামাজিক প্রেক্ষাপট',
          'বাংলাদেশের গ্রামীণ ও শহুরে সমাজ',
          'বাংলাদেশের সামাজিক সমস্যা ও প্রতিকারের উপায়',
          'বাংলাদেশের সামাজিক উন্নয়ন (আংশিক)',
        ]) },
      ],
    },
    geography: {
      name: 'ভূগোল (Geography)', compulsory: false, defaultSelected: false,
      papers: [
        { name: '১ম পত্র', chapters: ch(`${p}-geography-1`, [
          'পৃথিবীর গঠন',
          'ভূমিরূপ পরিবর্তন',
          'বায়ুমণ্ডল ও বায়ু দূষণ',
          'জলবায়ুর উপাদান ও নিয়ামক',
          'জলবায়ু অঞ্চল ও জলবায়ু পরিবর্তন',
          'সমুদ্রস্রোত ও জোয়ারভাটা',
          'ব্যবহারিক মানচিত্র ও স্কেল',
        ]) },
        { name: '২য় পত্র', chapters: ch(`${p}-geography-2`, [
          'মানব ভূগোল',
          'জনসংখ্যা',
          'কৃষি',
          'খনিজ ও শক্তি সম্পদ',
          'শিল্প',
          'মানচিত্র অভিক্ষেপ',
        ]) },
      ],
    },
    psychology: {
      name: 'মনোবিজ্ঞান (Psychology)', compulsory: false, defaultSelected: false,
      papers: [
        { name: '১ম পত্র', chapters: ch(`${p}-psychology-1`, [
          'মনোবিজ্ঞান পরিচিতি',
          'আচরণের জৈবিক ভিত্তি',
          'প্রেষণা ও আবেগ',
          'শিখন ও স্মৃতি',
          'সংবেদন ও প্রত্যক্ষণ',
        ]) },
        { name: '২য় পত্র', chapters: ch(`${p}-psychology-2`, [
          'বুদ্ধি',
          'ব্যক্তিত্ব',
          'মানসিক চাপ এবং চাপ মোকাবিলা',
          'মূল্যবোধ',
          'মনোবিজ্ঞানে গবেষণার পদ্ধতিসমূহ',
        ]) },
      ],
    },
    statistics: {
      name: 'পরিসংখ্যান (Statistics)', compulsory: false, defaultSelected: false,
      papers: [
        { name: '১ম পত্র', chapters: ch(`${p}-statistics-1`, [
          'পরিসংখ্যান, চলক ও প্রতীক',
          'কেন্দ্রীয় প্রবণতা',
          'পরিঘাত, বক্রতা ও সূচলতা',
          'কালীন সারি',
          'বাংলাদেশের প্রকাশিত পরিসংখ্যান',
        ]) },
        { name: '২য় পত্র', chapters: ch(`${p}-statistics-2`, [
          'সম্ভাবনা',
          'দৈবচলক ও সম্ভাবনা বিন্যাস',
          'গাণিতিক প্রত্যাশা',
          'দ্বিপদী বিন্যাস',
          'পয়সু বিন্যাস (Poisson Distribution)',
          'জীব পরিসংখ্যান',
        ]) },
      ],
    },
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
