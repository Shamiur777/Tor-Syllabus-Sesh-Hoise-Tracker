import { test } from 'node:test';
import assert from 'node:assert/strict';
import { captureUtm, buildPayload } from '../src/lib/tracking.js';

test('captures known utm and ad click params', () => {
  const p = captureUtm('?utm_source=fb&utm_campaign=hsc27&fbclid=abc');
  assert.equal(p.utm_source, 'fb');
  assert.equal(p.utm_campaign, 'hsc27');
  assert.equal(p.fbclid, 'abc');
});

test('missing params come back as empty strings, not undefined', () => {
  const p = captureUtm('');
  assert.equal(p.utm_source, '');
  assert.equal(p.utm_campaign, '');
});

test('ignores unknown params so the sheet stays clean', () => {
  const p = captureUtm('?utm_source=fb&evil=1');
  assert.equal(p.evil, undefined);
});

test('payload matches the columns the Apps Script writes', () => {
  const state = {
    name: 'শামিউর', institute: 'Notre Dame', level: 'hsc', batch: '27',
    group: 'science', enrolled: false, phone: '01712345678', email: 'a@b.com',
  };
  const subjects = [{ name: 'Physics' }, { name: 'ICT' }];
  const payload = buildPayload(state, subjects, { percent: 42 }, { id: 'batch27-tier2' }, {
    utm_source: 'fb', utm_campaign: 'hsc27',
  });

  assert.equal(payload.name, 'শামিউর');
  assert.equal(payload.institute, 'Notre Dame');
  assert.equal(payload.level, 'hsc');
  assert.equal(payload.batch, '27');
  assert.equal(payload.group, 'science');
  assert.equal(payload.subjects, 'Physics, ICT');
  assert.equal(payload.percent, 42);
  assert.equal(payload.tier, 'batch27-tier2');
  assert.equal(payload.phone, '01712345678');
  assert.equal(payload.email, 'a@b.com');
  assert.equal(payload.enrolled, false);
  assert.equal(payload.utm_source, 'fb');
});
