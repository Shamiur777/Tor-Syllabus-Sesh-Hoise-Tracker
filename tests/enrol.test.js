import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SYLLABUS } from '../src/data/syllabus.js';
import { resolveEnrolUrl } from '../src/lib/enrol.js';

// A student who reaches the lead screen with no enrolment link sees no course to
// go to, which is the whole point of the screen. Every combination the UI can
// actually produce must resolve, so a future edit cannot silently drop one.
test('every level/batch/group a student can pick resolves to a course url', () => {
  for (const level of ['ssc', 'hsc']) {
    for (const batch of ['27', '28']) {
      for (const group of Object.keys(SYLLABUS[level][batch])) {
        const url = resolveEnrolUrl(level, batch, group);
        assert.match(url, /^https:\/\//, `${level}/${batch}/${group} has no enrolment url`);
      }
    }
  }
});

test('group-specific urls win over the batch fallback', () => {
  assert.notEqual(
    resolveEnrolUrl('ssc', '27', 'commerce'),
    resolveEnrolUrl('ssc', '27', 'science'),
    'commerce students must not be sent to the general programme',
  );
});

test('an unknown group falls back to the batch url rather than returning nothing', () => {
  assert.equal(resolveEnrolUrl('ssc', '27', 'nope'), resolveEnrolUrl('ssc', '27', 'science'));
});

test('an unknown level resolves to empty so the button is omitted', () => {
  assert.equal(resolveEnrolUrl('xsc', '27', 'science'), '');
});
