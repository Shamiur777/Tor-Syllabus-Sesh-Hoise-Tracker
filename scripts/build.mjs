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
function stripModuleSyntax(source) {
  return source
    .replace(/^\s*import\s+[^;]*?;\s*$/gm, '')
    .replace(/^\s*export\s+(?=(?:default\s+)?(?:const|let|var|function|class|async)\b)/gm, '')
    .replace(/^\s*export\s*\{[^}]*\}\s*;?\s*$/gm, '');
}

export function buildHtml() {
  const styles = STYLES.map(readIfPresent).join('\n');
  const script = MODULES.map(readIfPresent).map(stripModuleSyntax).join('\n');
  return read('src/index.html')
    .replace('{{STYLES}}', () => styles)
    .replace('{{SCRIPT}}', () => `(function(){\n'use strict';\n${script}\n})();`);
}

// Only write to disk when invoked directly, so importing this from a test is side-effect free.
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  writeFileSync(join(ROOT, 'syllabus-tracker.html'), buildHtml(), 'utf8');
  console.log('Built syllabus-tracker.html');
}
