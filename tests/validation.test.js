import { test } from 'node:test';
import assert from 'node:assert/strict';
import { validateName, validateInstitute, validatePhone, validateEmail } from '../src/lib/validation.js';

test('names must be non-empty after trimming', () => {
  assert.equal(validateName('Shamiur').valid, true);
  assert.equal(validateName('  ').valid, false);
  assert.equal(validateName('').valid, false);
});

test('bengali names are accepted', () => {
  assert.equal(validateName('শামিউর রহমান').valid, true);
});

test('single character names are rejected as likely typos', () => {
  assert.equal(validateName('a').valid, false);
});

test('institute follows the same rules as name', () => {
  assert.equal(validateInstitute('Notre Dame College').valid, true);
  assert.equal(validateInstitute(' ').valid, false);
});

test('bangladeshi mobile numbers are 11 digits starting 01', () => {
  assert.equal(validatePhone('01712345678').valid, true);
  assert.equal(validatePhone('01912345678').valid, true);
});

test('phone rejects wrong length or wrong prefix', () => {
  assert.equal(validatePhone('0171234567').valid, false);   // 10 digits
  assert.equal(validatePhone('017123456789').valid, false); // 12 digits
  assert.equal(validatePhone('02712345678').valid, false);  // bad prefix
  assert.equal(validatePhone('01012345678').valid, false);  // no 010 operator in BD
});

test('phone tolerates spaces, dashes and the +880 country code', () => {
  assert.equal(validatePhone('017-1234-5678').normalized, '01712345678');
  assert.equal(validatePhone('+8801712345678').normalized, '01712345678');
  assert.equal(validatePhone('8801712345678').normalized, '01712345678');
  assert.equal(validatePhone(' 01712345678 ').normalized, '01712345678');
});

test('phone errors are in bengali', () => {
  const r = validatePhone('123');
  assert.equal(r.valid, false);
  assert.match(r.error, /[ঀ-৿]/, 'error message should contain Bengali');
});

test('email accepts ordinary addresses and lowercases them', () => {
  assert.equal(validateEmail('a@b.com').valid, true);
  assert.equal(validateEmail('Shamiur.Rahman@Example.CO.UK').normalized, 'shamiur.rahman@example.co.uk');
});

test('email rejects malformed addresses', () => {
  for (const bad of ['', 'nope', 'a@', '@b.com', 'a b@c.com', 'a@b']) {
    assert.equal(validateEmail(bad).valid, false, `${bad} should be invalid`);
  }
});
