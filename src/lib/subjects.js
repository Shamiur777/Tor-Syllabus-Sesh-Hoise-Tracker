import { SYLLABUS } from '../data/syllabus.js';

const GROUP_ORDER = {
  ssc: ['science', 'arts', 'commerce'],
  hsc: ['science', 'business', 'humanities'],
};

export function getGroups(level) {
  return GROUP_ORDER[level] ? [...GROUP_ORDER[level]] : [];
}

// Both levels have at least one optional subject (SSC: religion, agriculture;
// HSC: Biology / Higher Math on the Science track), so both show the picker.
// A group with zero optional subjects still renders correctly -- the screen
// is just a list of locked, pre-checked compulsory subjects with nothing to
// toggle -- so this does not need to vary per group.
export function needsSubjectPicker(level) {
  return level === 'ssc' || level === 'hsc';
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
