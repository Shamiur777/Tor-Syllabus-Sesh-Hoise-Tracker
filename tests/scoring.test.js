import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveTier } from '../src/lib/scoring.js';

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

test('out of range percentages clamp rather than throw', () => {
  assert.equal(resolveTier(-5, '27').index, 0);
  assert.equal(resolveTier(140, '27').index, 3);
});

test('unknown batch throws', () => {
  assert.throws(() => resolveTier(50, '99'), RangeError);
});
