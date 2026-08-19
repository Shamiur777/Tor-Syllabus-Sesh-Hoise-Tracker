import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveTier } from '../src/lib/scoring.js';
import { CONFIG } from '../src/data/config.js';

test("batch 27 bands split at 30, 50 and 70", () => {
  assert.equal(resolveTier(0, '27').index, 0);
  assert.equal(resolveTier(29, '27').index, 0);
  assert.equal(resolveTier(30, '27').index, 1);
  assert.equal(resolveTier(49, '27').index, 1);
  assert.equal(resolveTier(50, '27').index, 2);
  assert.equal(resolveTier(69, '27').index, 2);
  assert.equal(resolveTier(70, '27').index, 3);
  assert.equal(resolveTier(100, '27').index, 3);
});

test("batch 28 bands split at 11, 31 and 61", () => {
  assert.equal(resolveTier(0, '28').index, 0);
  assert.equal(resolveTier(10, '28').index, 0);
  assert.equal(resolveTier(11, '28').index, 1);
  assert.equal(resolveTier(30, '28').index, 1);
  assert.equal(resolveTier(31, '28').index, 2);
  assert.equal(resolveTier(60, '28').index, 2);
  assert.equal(resolveTier(61, '28').index, 3);
  assert.equal(resolveTier(100, '28').index, 3);
});

test('tier carries a stable id usable as an image key', () => {
  assert.equal(resolveTier(85, '27').id, 'batch27-tier4');
  assert.equal(resolveTier(5, '28').id, 'batch28-tier1');
});

test('every tier carries a non-empty caption, so the result image is never captionless', () => {
  for (const batch of ['27', '28']) {
    for (const band of CONFIG.tiers[batch]) {
      const tier = resolveTier((band.min + band.max) / 2, batch);
      assert.equal(typeof tier.label, 'string');
      assert.ok(tier.label.length > 0, `${tier.id} has no caption`);
    }
  }
  assert.equal(typeof CONFIG.perfectLabel, 'string');
  assert.ok(CONFIG.perfectLabel.length > 0);
});

test('out of range percentages clamp rather than throw', () => {
  assert.equal(resolveTier(-5, '27').index, 0);
  assert.equal(resolveTier(140, '27').index, 3);
});

test('unknown batch throws', () => {
  assert.throws(() => resolveTier(50, '99'), RangeError);
});

import { computeCompletion, computeSubjectBreakdown } from '../src/lib/scoring.js';

const fixture = [
  { id: 'phy', name: 'Physics', papers: [
    { name: '1st', chapters: [{ id: 'p1' }, { id: 'p2' }] },
    { name: '2nd', chapters: [{ id: 'p3' }, { id: 'p4' }] },
  ] },
  { id: 'ict', name: 'ICT', papers: [
    { name: '', chapters: [{ id: 'i1' }] },
  ] },
];

test('percentage is checked over total across selected subjects', () => {
  const r = computeCompletion(fixture, new Set(['p1', 'p2', 'i1']));
  assert.equal(r.completed, 3);
  assert.equal(r.total, 5);
  assert.equal(r.percent, 60);
});

test('percentage rounds to the nearest integer', () => {
  const r = computeCompletion(fixture, new Set(['p1']));
  assert.equal(r.percent, 20);
  const r2 = computeCompletion(fixture, new Set(['p1', 'p2']));
  assert.equal(r2.percent, 40);
});

test('checked ids outside the selected subjects do not count', () => {
  // A student who deselects Biology must not keep credit for its chapters.
  const r = computeCompletion(fixture, new Set(['p1', 'bio-1', 'bio-2']));
  assert.equal(r.completed, 1);
  assert.equal(r.total, 5);
});

test('no subjects yields zero percent, not NaN', () => {
  const r = computeCompletion([], new Set());
  assert.equal(r.percent, 0);
  assert.equal(r.total, 0);
});

test('everything checked is exactly 100', () => {
  const r = computeCompletion(fixture, new Set(['p1', 'p2', 'p3', 'p4', 'i1']));
  assert.equal(r.percent, 100);
});

test('breakdown reports per-subject progress', () => {
  const rows = computeSubjectBreakdown(fixture, new Set(['p1', 'p2', 'p3', 'p4']));
  assert.deepEqual(rows, [
    { id: 'phy', name: 'Physics', completed: 4, total: 4, percent: 100 },
    { id: 'ict', name: 'ICT', completed: 0, total: 1, percent: 0 },
  ]);
});
