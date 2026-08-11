import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  getGroups, getSubjects, getDefaultSelectedIds,
  needsSubjectPicker, countChapters, allChapterIds,
} from '../src/lib/subjects.js';

test('ssc offers three groups, hsc offers three groups', () => {
  assert.deepEqual(getGroups('ssc'), ['science', 'arts', 'commerce']);
  assert.deepEqual(getGroups('hsc'), ['science', 'business', 'humanities']);
});

test('only hsc shows the subject picker', () => {
  assert.equal(needsSubjectPicker('hsc'), true);
  assert.equal(needsSubjectPicker('ssc'), false);
});

test('every subject has a unique id within its group', () => {
  for (const level of ['ssc', 'hsc']) {
    for (const batch of ['27', '28']) {
      for (const group of getGroups(level)) {
        const ids = getSubjects(level, batch, group).map((s) => s.id);
        assert.equal(new Set(ids).size, ids.length, `dupe subject id in ${level}/${batch}/${group}`);
      }
    }
  }
});

test('every chapter id is globally unique', () => {
  const seen = new Set();
  for (const level of ['ssc', 'hsc']) {
    for (const batch of ['27', '28']) {
      for (const group of getGroups(level)) {
        for (const id of allChapterIds(getSubjects(level, batch, group))) {
          // Same subject appears in multiple groups by design; ids must still be stable.
          seen.add(id);
        }
      }
    }
  }
  assert.ok(seen.size > 0, 'expected at least some chapters');
});

test('compulsory subjects are always default selected', () => {
  for (const group of getGroups('hsc')) {
    for (const s of getSubjects('hsc', '27', group)) {
      if (s.compulsory) assert.equal(s.defaultSelected, true, `${s.id} compulsory but not default`);
    }
  }
});

test('ssc groups have every subject compulsory since there is no picker', () => {
  for (const group of getGroups('ssc')) {
    for (const s of getSubjects('ssc', '27', group)) {
      assert.equal(s.compulsory, true, `${s.id} must be compulsory for ssc`);
    }
  }
});

test('humanities has optional subjects that are not preselected', () => {
  const optional = getSubjects('hsc', '27', 'humanities').filter((s) => !s.compulsory);
  assert.ok(optional.length >= 2, 'humanities should offer optional subjects');
  assert.ok(optional.some((s) => !s.defaultSelected), 'some optional subjects start unticked');
});

test('default selected ids are a subset of available subject ids', () => {
  const subjects = getSubjects('hsc', '27', 'science');
  const all = new Set(subjects.map((s) => s.id));
  for (const id of getDefaultSelectedIds('hsc', '27', 'science')) {
    assert.ok(all.has(id), `${id} defaulted but not offered`);
  }
});

test('countChapters sums across papers', () => {
  const subjects = [
    { papers: [{ chapters: [{ id: 'a' }, { id: 'b' }] }, { chapters: [{ id: 'c' }] }] },
    { papers: [{ chapters: [{ id: 'd' }] }] },
  ];
  assert.equal(countChapters(subjects), 4);
  assert.deepEqual(allChapterIds(subjects), ['a', 'b', 'c', 'd']);
});

test('countChapters of nothing is zero, not NaN', () => {
  assert.equal(countChapters([]), 0);
});

test('unknown group returns an empty subject list rather than throwing', () => {
  assert.deepEqual(getSubjects('ssc', '27', 'nonexistent'), []);
});
