import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// Order is load order. Dependencies must appear before their dependents.
const STYLES = [
  'src/styles/tokens.css',
  'src/styles/components.css',
  'src/styles/screens.css',
];

const MODULES = [
  'src/data/config.js',
  'src/data/syllabus.js',
  'src/lib/subjects.js',
  'src/lib/scoring.js',
  'src/lib/validation.js',
  'src/lib/state.js',
  'src/lib/tracking.js',
  'src/lib/submit.js',
  'src/lib/canvas.js',
  'src/lib/ui.js',
  'src/lib/main.js',
];

const read = (p) => readFileSync(join(ROOT, p), 'utf8');
const readIfPresent = (p) => {
  try {
    return read(p);
  } catch (err) {
    if (err.code === 'ENOENT') return '';
    throw err;
  }
};

// Strips ESM syntax so the concatenated result runs inside a plain <script>.
// Every module shares one IIFE scope, so cross-module references resolve naturally.
export function stripModuleSyntax(source, filePath = '<unknown>') {
  // Strip imports (including multi-line). Match from 'import' to the quoted module
  // specifier plus optional semicolon. Handles:
  // - import { a, b } from './x.js';
  // - import './x.js';
  // - import foo from './x.js';
  source = source.replace(/^\s*import\b[\s\S]*?['"][^'"]*['"];?\s*$/gm, '');

  // Detect and reject any 'export default' that is NOT a named function/class/etc.
  // Valid forms are:
  // - export default function <identifier> { ... }
  // - export default class <identifier> { ... }
  // - export default async function <identifier> { ... }
  // Reject anything else like:
  // - export default 42; (literal)
  // - export default { a: 1 }; (object literal)
  // - export default function() {}; (anonymous function)
  // - export default class {}; (anonymous class)
  const hasExportDefault = /^\s*export\s+default\s+/m.test(source);
  if (hasExportDefault) {
    const hasNamedFunc = /^\s*export\s+default\s+(async\s+)?function\s+\w+/m.test(source);
    const hasNamedClass = /^\s*export\s+default\s+class\s+\w+/m.test(source);
    if (!hasNamedFunc && !hasNamedClass) {
      throw new Error(`Anonymous default export in ${filePath} — use a named export instead.`);
    }
  }

  // Strip export default function/class/async function (named declarations only).
  source = source.replace(/^\s*export\s+default\s+((?:async\s+)?function|class)\s+/gm, '$1 ');

  // Strip named exports (const/let/var/function/class/async function)
  source = source.replace(/^\s*export\s+(?=(?:const|let|var|function|class|async)\b)/gm, '');

  // Strip export { ... }
  source = source.replace(/^\s*export\s*\{[\s\S]*?\}\s*;?\s*$/gm, '');

  // Post-strip validation: scan for any remaining import/export at line start.
  // This catches constructs we don't handle yet (e.g., export * from ...).
  const lines = source.split('\n');
  for (let i = 0; i < lines.length; i++) {
    if (/^\s*(import|export)\s/m.test(lines[i])) {
      throw new Error(`Unhandled ESM syntax in ${filePath}, line ${i + 1}: ${lines[i].trim()}`);
    }
  }

  return source;
}

export function buildHtml() {
  const styles = STYLES.map(readIfPresent).join('\n');
  const script = MODULES.map((path) => {
    const source = readIfPresent(path);
    return stripModuleSyntax(source, path);
  }).join('\n');

  // Verify the concatenated script parses as valid JavaScript.
  const wrappedScript = `(function(){\n'use strict';\n${script}\n})();`;
  try {
    new Function(wrappedScript);
  } catch (err) {
    throw new Error(`Built script does not parse: ${err.message}`);
  }

  return read('src/index.html')
    .replace('{{STYLES}}', () => styles)
    .replace('{{SCRIPT}}', () => wrappedScript);
}

// Only write to disk when invoked directly, so importing this from a test is side-effect free.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  writeFileSync(join(ROOT, 'syllabus-tracker.html'), buildHtml(), 'utf8');
  console.log('Built syllabus-tracker.html');
}
