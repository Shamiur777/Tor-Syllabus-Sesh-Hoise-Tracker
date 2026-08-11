import { test } from 'node:test';
import assert from 'node:assert/strict';
import { buildHtml, stripModuleSyntax } from '../scripts/build.mjs';

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

test('extracted script parses as valid javascript', () => {
  const html = buildHtml();
  const script = html.slice(html.indexOf('<script>') + 8, html.lastIndexOf('</script>'));
  assert.doesNotThrow(() => new Function(script));
});

test('stripModuleSyntax strips export default function', () => {
  const input = 'export default function foo() {}';
  const output = stripModuleSyntax(input);
  assert.match(output, /^function foo\(\) \{\}$/);
  assert.doesNotThrow(() => new Function(output));
});

test('stripModuleSyntax strips export default class', () => {
  const input = 'export default class Foo {}';
  const output = stripModuleSyntax(input);
  assert.match(output, /^class Foo \{\}$/);
  assert.doesNotThrow(() => new Function(output));
});

test('stripModuleSyntax strips export default async function', () => {
  const input = 'export default async function f() {}';
  const output = stripModuleSyntax(input);
  assert.match(output, /^async function f\(\) \{\}$/);
  assert.doesNotThrow(() => new Function(output));
});

test('stripModuleSyntax rejects anonymous default export (literal)', () => {
  const input = 'export default 42;';
  assert.throws(
    () => stripModuleSyntax(input, 'literal-export.js'),
    /Anonymous default export in literal-export\.js/
  );
});

test('stripModuleSyntax rejects anonymous default export (object)', () => {
  const input = 'export default { a: 1 };';
  assert.throws(
    () => stripModuleSyntax(input, 'object-export.js'),
    /Anonymous default export in object-export\.js/
  );
});

test('stripModuleSyntax strips named exports', () => {
  const inputs = [
    'export const CONFIG = {};',
    'export let state = 42;',
    'export var x = 1;',
    'export function boot() {}',
    'export class Tracker {}',
    'export async function load() {}',
  ];
  for (const input of inputs) {
    const output = stripModuleSyntax(input);
    assert.ok(!output.includes('export'), `export keyword remains in: ${input}`);
    assert.doesNotThrow(() => new Function(output), `invalid output for: ${input}`);
  }
});

test('stripModuleSyntax strips import statements with semicolon', () => {
  const input = "import { CONFIG } from '../data/config.js';";
  const output = stripModuleSyntax(input);
  assert.strictEqual(output.trim(), '');
});

test('stripModuleSyntax strips import statements without semicolon', () => {
  const input = "import { CONFIG } from '../data/config.js'";
  const output = stripModuleSyntax(input);
  assert.strictEqual(output.trim(), '');
});

test('stripModuleSyntax strips export { ... }', () => {
  const inputs = [
    'export { foo, bar };',
    'export { foo, bar }',
    'export {\n  foo,\n  bar,\n};',
  ];
  for (const input of inputs) {
    const output = stripModuleSyntax(input);
    assert.ok(!output.includes('export'), `export remains in: ${input}`);
  }
});

test('stripModuleSyntax strips multi-line import', () => {
  const input = "import {\n  CONFIG,\n  STATE,\n} from '../data/config.js';";
  const output = stripModuleSyntax(input);
  assert.strictEqual(output.trim(), '');
  assert.doesNotThrow(() => new Function(output));
});

test('stripModuleSyntax strips side-effect import', () => {
  const input = "import './styles/global.css';";
  const output = stripModuleSyntax(input);
  assert.strictEqual(output.trim(), '');
});

test('stripModuleSyntax rejects anonymous export default function()', () => {
  const input = 'export default function() {}';
  assert.throws(
    () => stripModuleSyntax(input, 'anon-func.js'),
    /Anonymous default export in anon-func\.js/
  );
});

test('stripModuleSyntax rejects anonymous export default class {}', () => {
  const input = 'export default class {}';
  assert.throws(
    () => stripModuleSyntax(input, 'anon-class.js'),
    /Anonymous default export in anon-class\.js/
  );
});

test('stripModuleSyntax detects unhandled export construct', () => {
  const input = "export * from './other.js';";
  assert.throws(
    () => stripModuleSyntax(input, 'star-export.js'),
    /Unhandled ESM syntax in star-export\.js/
  );
});

test('buildHtml throws when module contains unhandled export construct', () => {
  const mockRead = (path) => {
    if (path === 'src/test-star-export.js') {
      return "export * from './other.js';";
    }
    return '';
  };

  assert.throws(
    () => buildHtml({
      modules: ['src/test-star-export.js'],
      styles: [],
      readFile: mockRead,
    }),
    /Unhandled ESM syntax in src\/test-star-export\.js/
  );
});

test('buildHtml parsing gate catches syntactically invalid output', () => {
  const mockRead = (path) => {
    if (path === 'src/test-invalid.js') {
      // Source has valid import that strips away, leaving invalid syntax.
      // The post-strip validation won't catch this since there's no remaining
      // import/export line, but the new Function() assertion will.
      return "import x from './y.js';\nconst broken = ;";
    }
    return '';
  };

  assert.throws(
    () => buildHtml({
      modules: ['src/test-invalid.js'],
      styles: [],
      readFile: mockRead,
    }),
    /Built script does not parse/
  );
});
