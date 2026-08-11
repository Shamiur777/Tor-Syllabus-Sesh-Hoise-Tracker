import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildHtml } from '../scripts/build.mjs';

test('build inlines styles into a style tag', () => {
  const html = buildHtml();
  assert.match(html, /<style>/);
  assert.ok(!html.includes('{{STYLES}}'), 'STYLES placeholder must be replaced');
});

test('build inlines script into a script tag', () => {
  const html = buildHtml();
  assert.ok(!html.includes('{{SCRIPT}}'), 'SCRIPT placeholder must be replaced');
  assert.match(html, /<script>/);
});

test('build emits no module syntax that breaks in a plain script tag', () => {
  const html = buildHtml();
  const script = html.slice(html.indexOf('<script>'), html.lastIndexOf('</script>'));
  assert.ok(!/^\s*import\s/m.test(script), 'import statements must be stripped');
  assert.ok(!/^\s*export\s/m.test(script), 'export keywords must be stripped');
});

test('build references no external script or stylesheet except google fonts', () => {
  const html = buildHtml();
  const externals = [...html.matchAll(/(?:src|href)="(https?:\/\/[^"]+)"/g)].map((m) => m[1]);
  for (const url of externals) {
    assert.match(url, /^https:\/\/fonts\.(googleapis|gstatic)\.com/, `unexpected external: ${url}`);
  }
});

test('build carries the product name into the title', () => {
  const html = buildHtml();
  assert.match(html, /<title>তোর সিলেবাস শেষ হইসে ট্র্যাকার<\/title>/);
});
