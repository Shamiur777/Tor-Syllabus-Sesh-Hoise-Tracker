import { CONFIG } from '../data/config.js';

export function resolveTier(percent, batch) {
  const bands = CONFIG.tiers[batch];
  if (!bands) throw new RangeError(`Unknown batch: ${batch}`);
  const clamped = Math.min(100, Math.max(0, Math.round(percent)));
  const index = bands.findIndex((b) => clamped >= b.min && clamped <= b.max);
  const resolved = index === -1 ? bands.length - 1 : index;
  return { index: resolved, ...bands[resolved] };
}

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
