// Syllabus content.
//
// SOURCES
//   HSC Science  — client-supplied `syllabus-source/HSC Syllabus.txt`.
//                  Higher Math 2nd Paper was missing there and was sourced
//                  from the web on 2026-08-19 (see that file's note).
//   SSC Commerce — client-supplied `syllabus-source/SSC Commerce Syllabus.pdf`
//                  (2027 SSC exam syllabus). Read from the rendered pages
//                  because the PDF's text layer is corrupted. The four business
//                  subjects came from that file first; the compulsory
//                  Bangla / English / Maths / Science were added on 2026-08-19
//                  from the same file (printed pages 3-6, 9-11, 14-16, 20).
//                  That PDF states the SSC syllabus is the whole book for each
//                  compulsory subject but only itemises chapters through the
//                  school-exam breakdowns, so two lists are short of the book
//                  and nothing was filled in from memory:
//                    - গণিত is missing only the twelfth chapter (16 of 17).
//                    - বিজ্ঞান has just the nine itemised chapters, so it is
//                      flagged ` [যাচাই করতে হবে]` in the UI.
//                  বাংলা ২য় পত্র is modelled as the seven written/MCQ sections
//                  of the exam structure rather than the per-item lists (single
//                  সারমর্ম passages, individual রচনা topics), which are far too
//                  granular to tick off.
//   SSC Science  — client-photographed textbook / guide-book tables of
//                  contents in `SSC Science Syllabus/` (13 images, read
//                  2026-08-19). Full-book contents; see sscCompulsory() above
//                  for why Bangla 1st and English 1st stay at the exam subset.
//   SSC Arts (history/economics/civics), HSC Business
//   (accounting/marketing), and HSC Humanities (civics/economics/history/
//   islamic_history/logic/sociology/geography/psychology/statistics) —
//   transcribed from `research/syllabus-research.md` (compiled 2026-08-19,
//   NCTB primary sources; see that file for full citations). Subjects whose
//   research confidence was only "medium" (a split high/medium line counts
//   as medium) have ` [যাচাই করতে হবে]` appended to their name so the
//   uncertainty is visible in the UI: SSC Science Biology, SSC Arts
//   Economics, SSC Arts Civics and Citizenship, HSC Humanities Sociology.
//   SSC Commerce Science carries the same flag for a different reason — see
//   the SSC Commerce note above.
//
// STILL PLACEHOLDER, pending research/client confirmation (research
// confidence was low/low-medium/unverified, so nothing was transcribed):
//   SSC Arts Geography and Environment, HSC Business Organisation and
//   Management, HSC Finance/Banking/Insurance, HSC Social Work, and the
//   and the compulsory Bangla/English for HSC Business and HSC Humanities
//   (the 2023 and 2026 official versions disagree on prose, poems and units
//   entirely, so this needs a client decision per exam year, not a merge).
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

/* --------------------------------------------------- SSC compulsory ----
 * Bangla, English, Maths and ICT are the same national subjects for every SSC
 * group (subject codes 101/102, 107/108, 109, 154), so all three groups share
 * this one definition. Chapter ids are shared too — deliberate, and
 * tests/subjects.test.js documents that a subject appearing in several groups
 * keeps stable ids.
 *
 * TWO DIFFERENT RULES APPLY HERE, and mixing them up corrupts scoring:
 *
 *   Full book — where the client's 2027 syllabus PDF says সম্পূর্ণ বই and
 *   enumerates nothing, the textbook contents ARE the syllabus. Maths (17),
 *   ICT (6) and Bangla 2nd paper (49 পরিচ্ছেদ) come from the guide-book tables
 *   of contents in `SSC Science Syllabus/`.
 *
 *   Explicit subset — where that PDF does enumerate the content, its list wins
 *   over the textbook, because the exam is the subset. Bangla 1st paper is
 *   12 গদ্য + 12 পদ্য + 2 সহপাঠ out of a 25 + 28 book; English 1st paper is
 *   units 1-12 and 16 out of 16. The textbook ToCs confirm the excluded
 *   material exists (Bangla has অভাগীর স্বর্গ, নিমগাছ, ঝরনার গান and more;
 *   English has Loneliness, Renewable Energy, Media and Modes of
 *   E-communication) — it is simply not on the exam.
 */
function sscCompulsory(p) {
  return {
    bangla: {
      name: 'বাংলা (Bangla)', compulsory: true, defaultSelected: true,
      papers: [
        { name: '১ম পত্র', chapters: ch(`${p}-bangla-1`, [
          'গদ্য: প্রত্যুপকার',
          'গদ্য: ফুলের বিবাহ',
          'গদ্য: সুভা',
          'গদ্য: বই পড়া',
          'গদ্য: নিরীহ বাঙালি',
          'গদ্য: পল্লিসাহিত্য',
          'গদ্য: আম-আঁটির ভেঁপু',
          'গদ্য: মানুষ মুহম্মদ (স.)',
          'গদ্য: উপেক্ষিত শক্তির উদ্বোধন',
          'গদ্য: প্রবাস বন্ধু',
          'গদ্য: মমতাদি',
          'গদ্য: একুশের গল্প',
          'পদ্য: বন্দনা',
          'পদ্য: কপোতাক্ষ নদ',
          'পদ্য: প্রাণ',
          'পদ্য: অন্ধবধূ',
          'পদ্য: জীবন বিনিময়',
          'পদ্য: উমর ফারুক',
          'পদ্য: সেইদিন এই মাঠ',
          'পদ্য: যাব আমি তোমার দেশে',
          'পদ্য: বৃষ্টি',
          'পদ্য: আমি কোনো আগন্তুক নই',
          'পদ্য: রানার',
          'পদ্য: তোমাকে পাওয়ার জন্যে, হে স্বাধীনতা',
          'সহপাঠ: ১৯৭১ (উপন্যাস)',
          'সহপাঠ: বহিপীর (নাটক)',
        ]) },
        { name: '২য় পত্র', chapters: ch(`${p}-bangla-2`, [
          'পরিচ্ছেদ ১: ভাষা ও বাংলা ভাষা',
          'পরিচ্ছেদ ২: বাংলা ব্যাকরণ',
          'পরিচ্ছেদ ৩: বাংলা ভাষার রীতি ও বিভাজন',
          'পরিচ্ছেদ ৪: বাগযন্ত্র',
          'পরিচ্ছেদ ৫: ধ্বনি ও বর্ণ',
          'পরিচ্ছেদ ৬: স্বরধ্বনি',
          'পরিচ্ছেদ ৭: ব্যঞ্জনধ্বনি',
          'পরিচ্ছেদ ৮: বর্ণের উচ্চারণ',
          'পরিচ্ছেদ ৯: শব্দ ও পদের গঠন',
          'পরিচ্ছেদ ১০: উপসর্গ দিয়ে শব্দ গঠন',
          'পরিচ্ছেদ ১১: প্রত্যয় দিয়ে শব্দ গঠন',
          'পরিচ্ছেদ ১২: সমাস প্রক্রিয়ায় শব্দ গঠন',
          'পরিচ্ছেদ ১৩: সন্ধি',
          'পরিচ্ছেদ ১৪: শব্দদ্বিত্ব',
          'পরিচ্ছেদ ১৫: নরবাচক ও নারীবাচক শব্দ',
          'পরিচ্ছেদ ১৬: সংখ্যাবাচক শব্দ',
          'পরিচ্ছেদ ১৭: শব্দের শ্রেণিবিভাগ',
          'পরিচ্ছেদ ১৮: বিশেষ্য',
          'পরিচ্ছেদ ১৯: সর্বনাম',
          'পরিচ্ছেদ ২০: বিশেষণ',
          'পরিচ্ছেদ ২১: ক্রিয়া',
          'পরিচ্ছেদ ২২: ক্রিয়াবিশেষণ',
          'পরিচ্ছেদ ২৩: অনুসর্গ',
          'পরিচ্ছেদ ২৪: যোজক',
          'পরিচ্ছেদ ২৫: আবেগ',
          'পরিচ্ছেদ ২৬: নির্দেশক',
          'পরিচ্ছেদ ২৭: বচন',
          'পরিচ্ছেদ ২৮: বিভক্তি',
          'পরিচ্ছেদ ২৯: ক্রিয়াবিভক্তি',
          'পরিচ্ছেদ ৩০: ক্রিয়ার কাল',
          'পরিচ্ছেদ ৩১: বাক্যের অংশ ও শ্রেণিবিভাগ',
          'পরিচ্ছেদ ৩২: বাক্যের বর্গ',
          'পরিচ্ছেদ ৩৩: উদ্দেশ্য ও বিধেয়',
          'পরিচ্ছেদ ৩৪: সরল, জটিল ও যৌগিক বাক্য',
          'পরিচ্ছেদ ৩৫: কারক',
          'পরিচ্ছেদ ৩৬: বাচ্য',
          'পরিচ্ছেদ ৩৭: উক্তি',
          'পরিচ্ছেদ ৩৮: যতিচিহ্ন',
          'পরিচ্ছেদ ৩৯: বাগর্থ',
          'পরিচ্ছেদ ৪০: বাগ্ধারা',
          'পরিচ্ছেদ ৪১: প্রতিশব্দ',
          'পরিচ্ছেদ ৪২: বিপরীত শব্দ',
          'পরিচ্ছেদ ৪৩: শব্দজোড়',
          'পরিচ্ছেদ ৪৪: অনুচ্ছেদ',
          'পরিচ্ছেদ ৪৫: সারাংশ ও সারমর্ম',
          'পরিচ্ছেদ ৪৬: ভাব-সম্প্রসারণ',
          'পরিচ্ছেদ ৪৭: চিঠিপত্র',
          'পরিচ্ছেদ ৪৮: সংবাদ প্রতিবেদন',
          'পরিচ্ছেদ ৪৯: প্রবন্ধ',
        ]) },
      ],
    },
    english: {
      name: 'ইংরেজি (English)', compulsory: true, defaultSelected: true,
      papers: [
        { name: '১ম পত্র', chapters: ch(`${p}-english-1`, [
          'Unit 1: Sense of Self',
          'Unit 2: Climate Change',
          'Unit 3: Pastimes',
          'Unit 4: Events and Festivals',
          'Unit 5: Problems Around Us',
          'Unit 6: Our Neighbours',
          'Unit 7: People Who Stand Out',
          'Unit 8: World Heritage',
          'Unit 9: Unconventional Jobs',
          'Unit 10: Dreams',
          'Unit 11: Reading from English Literature',
          'Unit 12: Roots',
          'Unit 16: Graffiti',
          'Writing: Completing Stories',
          'Writing: Writing Dialogues',
        ]) },
        { name: '২য় পত্র', chapters: ch(`${p}-english-2`, [
          'Gap Filling with Clues',
          'Substitution Table',
          'Right Form of Verbs',
          'Changing Sentences',
          'Tag Questions',
          'Suffixes and Prefixes',
          'Prepositions',
          'Connectors / Linking Words',
          'Punctuation and Capitalization',
          'Writing Paragraph',
          'Writing E-mail / Letter / Application',
          'Writing Short Composition',
        ]) },
      ],
    },
    math: {
      name: 'গণিত (General Mathematics)', compulsory: true, defaultSelected: true,
      papers: [{ name: '', chapters: ch(`${p}-math-x`, [
        'বাস্তব সংখ্যা',
        'সেট ও ফাংশন',
        'বীজগাণিতিক রাশি',
        'সূচক ও লগারিদম',
        'এক চলকবিশিষ্ট সমীকরণ',
        'রেখা, কোণ ও ত্রিভুজ',
        'ব্যবহারিক জ্যামিতি',
        'বৃত্ত',
        'ত্রিকোণমিতিক অনুপাত',
        'দূরত্ব ও উচ্চতা',
        'বীজগাণিতিক অনুপাত ও সমানুপাত',
        'দুই চলকবিশিষ্ট সরল সহসমীকরণ',
        'সসীম ধারা',
        'অনুপাত, সদৃশতা ও প্রতিসমতা',
        'ক্ষেত্রফল সম্পর্কিত উপপাদ্য ও সম্পাদ্য',
        'পরিমিতি',
        'পরিসংখ্যান',
      ]) }],
    },
    ict: {
      name: 'তথ্য ও যোগাযোগ প্রযুক্তি (ICT)', compulsory: true, defaultSelected: true,
      papers: [{ name: '', chapters: ch(`${p}-ict-x`, [
        'তথ্য ও যোগাযোগ প্রযুক্তি এবং আমাদের বাংলাদেশ',
        'কম্পিউটার রক্ষণাবেক্ষণ ও সাইবার নিরাপত্তা',
        'ইন্টারনেট ও ওয়েব পরিচিতি',
        'আমার লেখালেখি ও হিসাব',
        'মাল্টিমিডিয়া ও গ্রাফিক্স',
        'প্রোগ্রামিংয়ের মাধ্যমে সমস্যার সমাধান',
      ]) }],
    },
  };
}


function sscScience(batch) {
  const p = `ssc${batch}`;
  return {
    ...sscCompulsory(p),
    bgs: {
      name: 'বাংলাদেশ ও বিশ্বপরিচয় (Bangladesh and Global Studies)',
      compulsory: true, defaultSelected: true,
      papers: [{ name: '', chapters: ch(`${p}-bgs-x`, [
        'পূর্ব বাংলার আন্দোলন ও জাতীয়তাবাদের উত্থান (১৯৪৭–১৯৭০)',
        'বাংলাদেশের স্বাধীনতা',
        'সৌরজগৎ ও ভূমণ্ডল',
        'বাংলাদেশের ভূপ্রকৃতি ও জলবায়ু',
        'বাংলাদেশের নদ-নদী ও প্রাকৃতিক সম্পদ',
        'রাষ্ট্র, নাগরিকতা ও আইন',
        'বাংলাদেশ সরকারের বিভিন্ন অঙ্গ ও প্রশাসন ব্যবস্থা',
        'বাংলাদেশের গণতন্ত্র ও নির্বাচন ব্যবস্থা',
        'জাতিসংঘ ও বাংলাদেশ',
        'জাতীয় সম্পদ ও অর্থনৈতিক ব্যবস্থা',
        'অর্থনৈতিক নির্দেশকসমূহ ও বাংলাদেশের অর্থনীতির প্রকৃতি',
        'বাংলাদেশ সরকারের অর্থ ও ব্যাংক ব্যবস্থা',
        'বাংলাদেশের পরিবার কাঠামো ও সামাজিকীকরণ',
        'বাংলাদেশের সামাজিক পরিবর্তন',
        'বাংলাদেশের সামাজিক সমস্যা ও প্রতিকার',
      ]) }],
    },
    physics: {
      name: 'পদার্থবিজ্ঞান (Physics)', compulsory: true, defaultSelected: true,
      papers: [{ name: '', chapters: ch(`${p}-physics-x`, [
        'ভৌত রাশি এবং তাদের পরিমাপ',
        'গতি',
        'বল',
        'কাজ, ক্ষমতা ও শক্তি',
        'পদার্থের অবস্থা ও চাপ',
        'বস্তুর ওপর তাপের প্রভাব',
        'তরঙ্গ ও শব্দ',
        'আলোর প্রতিফলন',
        'আলোর প্রতিসরণ',
        'স্থির বিদ্যুৎ',
        'চল বিদ্যুৎ',
        'বিদ্যুতের চৌম্বক ক্রিয়া',
        'তেজস্ক্রিয়তা ও ইলেকট্রনিকস',
      ]) }],
    },
    chemistry: {
      name: 'রসায়ন (Chemistry)', compulsory: true, defaultSelected: true,
      papers: [{ name: '', chapters: ch(`${p}-chemistry-x`, [
        'রসায়নের ধারণা',
        'পদার্থের অবস্থা',
        'পদার্থের গঠন',
        'পর্যায় সারণি',
        'রাসায়নিক বন্ধন',
        'মোলের ধারণা ও রাসায়নিক গণনা',
        'রাসায়নিক বিক্রিয়া',
        'রসায়ন ও শক্তি',
        'এসিড-ক্ষারক সমতা',
        'খনিজ সম্পদ: ধাতু-অধাতু',
        'খনিজ সম্পদ: জীবাশ্ম',
        'আমাদের জীবনে রসায়ন',
      ]) }],
    },
    biology: {
      name: 'জীববিজ্ঞান (Biology)', compulsory: true, defaultSelected: true,
      papers: [{ name: '', chapters: ch(`${p}-biology-x`, [
        'জীবন পাঠ',
        'জীবকোষ ও টিস্যু',
        'কোষ বিভাজন',
        'জীবনীশক্তি',
        'খাদ্য, পুষ্টি এবং পরিপাক',
        'জীবে পরিবহন',
        'গ্যাসীয় বিনিময়',
        'রেচন প্রক্রিয়া',
        'দৃঢ়তা প্রদান ও চলন',
        'সমন্বয়',
        'জীবের প্রজনন',
        'জীবের বংশগতি ও জৈব অভিব্যক্তি',
        'জীবের পরিবেশ',
        'জীবপ্রযুক্তি',
      ]) }],
    },
    hmath: {
      name: 'উচ্চতর গণিত (Higher Mathematics)', compulsory: true, defaultSelected: true,
      papers: [{ name: '', chapters: ch(`${p}-hmath-x`, [
        'সেট ও ফাংশন',
        'বীজগাণিতিক রাশি',
        'জ্যামিতি',
        'জ্যামিতিক অঙ্কন',
        'সমীকরণ',
        'অসমতা',
        'অসীম ধারা',
        'ত্রিকোণমিতি',
        'সূচকীয় ও লগারিদমীয় ফাংশন',
        'দ্বিপদী বিস্তৃতি',
        'স্থানাঙ্ক জ্যামিতি',
        'সমতলীয় ভেক্টর',
        'ঘন জ্যামিতি',
        'সম্ভাব্যতা',
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
    ...sscCompulsory(p),
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
    ...sscCompulsory(p),
    science: {
      // Flagged: the client PDF (page 20) itemises only these nine chapters
      // while stating the SSC syllabus is সম্পূর্ণ বই. The SSC Science folder
      // cannot settle it — science-group students take বাংলাদেশ ও বিশ্বপরিচয়,
      // not বিজ্ঞান, so no textbook ToC for this subject was supplied.
      name: 'বিজ্ঞান (Science) [যাচাই করতে হবে]', compulsory: true, defaultSelected: true,
      papers: [{ name: '', chapters: ch(`${p}-science-x`, [
        'উন্নততর জীবনধারা',
        'জীবনের জন্য পানি',
        'হৃদযন্ত্রের যত কথা',
        'নবজীবনের সূচনা',
        'দেখতে হলে আলো চাই',
        'পলিমার',
        'অম্ল, ক্ষারক ও লবণের ব্যবহার',
        'আমাদের সম্পদ',
        'দুর্যোগের সাথে বসবাস',
      ]) }],
    },
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
