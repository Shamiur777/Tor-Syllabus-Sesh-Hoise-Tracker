import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SYLLABUS } from '../src/data/syllabus.js';
import { resolveEnrolUrl, resolveEnrolLabel } from '../src/lib/enrol.js';

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

// The result-screen banner shows a course name next to its link -- a group
// with a url but no label would render "undefined-এ এনরোল করো এখনই" or similar.
test('every level/batch/group that resolves a url also resolves a label', () => {
  for (const level of ['ssc', 'hsc']) {
    for (const batch of ['27', '28']) {
      for (const group of Object.keys(SYLLABUS[level][batch])) {
        const label = resolveEnrolLabel(level, batch, group);
        assert.equal(typeof label, 'string');
        assert.ok(label.length > 0, `${level}/${batch}/${group} has no enrolment label`);
      }
    }
  }
});

test('commerce/business get their own label, not the general programme’s', () => {
  assert.notEqual(
    resolveEnrolLabel('ssc', '27', 'commerce'),
    resolveEnrolLabel('ssc', '27', 'science'),
  );
});
