import { CONFIG } from '../data/config.js';

// Both the enrolment URL and its display label are resolved most-specific
// key first: `<level>-<batch>-<group>` -> `<level>-<batch>` -> `<level>`.
// Returns '' when nothing matches, which callers treat as "omit this UI"
// rather than rendering a dead link or a blank label.
function resolveMostSpecific(map, level, batch, group) {
  const keys = [`${level}-${batch}-${group}`, `${level}-${batch}`, String(level)];
  for (const key of keys) {
    const value = map[key];
    if (value) return value;
  }
  return '';
}

export function resolveEnrolUrl(level, batch, group) {
  return resolveMostSpecific(CONFIG.enrolUrls, level, batch, group);
}

export function resolveEnrolLabel(level, batch, group) {
  return resolveMostSpecific(CONFIG.enrolLabels, level, batch, group);
}
