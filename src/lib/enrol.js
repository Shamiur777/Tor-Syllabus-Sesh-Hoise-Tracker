import { CONFIG } from '../data/config.js';

// Resolves the enrolment link for a student, most specific key first:
//   `<level>-<batch>-<group>` -> `<level>-<batch>` -> `<level>`
// Returns '' when nothing matches, which the lead screen treats as "omit the
// button" rather than rendering a dead link.
export function resolveEnrolUrl(level, batch, group) {
  const keys = [`${level}-${batch}-${group}`, `${level}-${batch}`, String(level)];
  for (const key of keys) {
    const url = CONFIG.enrolUrls[key];
    if (url) return url;
  }
  return '';
}
