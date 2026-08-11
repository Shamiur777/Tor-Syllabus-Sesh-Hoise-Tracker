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
