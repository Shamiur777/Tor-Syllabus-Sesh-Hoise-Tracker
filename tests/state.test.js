import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  SCHEMA_VERSION, STORAGE_KEY, createState, serialize, deserialize,
  save, load, clear, toggleChapter, setSubjects, nextScreen, prevScreen,
} from '../src/lib/state.js';

// Minimal localStorage stand-in so these tests run in plain Node.
function fakeStorage() {
  const map = new Map();
  return {
    getItem: (k) => (map.has(k) ? map.get(k) : null),
    setItem: (k, v) => map.set(k, String(v)),
    removeItem: (k) => map.delete(k),
    get size() { return map.size; },
  };
}

test('a fresh state starts on the landing screen with nothing chosen', () => {
  const s = createState();
  assert.equal(s.screen, 'landing');
  assert.equal(s.level, null);
  assert.deepEqual(s.checked, []);
  assert.equal(s.enrolled, null);
  assert.equal(s.version, SCHEMA_VERSION);
});

test('toggling a chapter adds then removes it', () => {
  let s = createState();
  s = toggleChapter(s, 'x1');
  assert.deepEqual(s.checked, ['x1']);
  s = toggleChapter(s, 'x1');
  assert.deepEqual(s.checked, []);
});

test('toggling never mutates the input state', () => {
  const s = createState();
  const next = toggleChapter(s, 'x1');
  assert.deepEqual(s.checked, [], 'original must be untouched');
  assert.notEqual(s, next);
});

test('deselecting a subject drops its chapters from the checked list', () => {
  const subjects = [
    { id: 'phy', papers: [{ chapters: [{ id: 'p1' }, { id: 'p2' }] }] },
    { id: 'ict', papers: [{ chapters: [{ id: 'i1' }] }] },
  ];
  let s = createState();
  s = { ...s, selectedSubjects: ['phy', 'ict'], checked: ['p1', 'p2', 'i1'] };
  s = setSubjects(s, ['ict'], subjects);
  assert.deepEqual(s.selectedSubjects, ['ict']);
  assert.deepEqual(s.checked, ['i1'], 'physics chapters must be dropped');
});

test('round trips through serialize and deserialize', () => {
  const s = { ...createState(), name: 'শামিউর', level: 'hsc', checked: ['a', 'b'] };
  const back = deserialize(serialize(s));
  assert.deepEqual(back, s);
});

test('deserialize rejects a stale schema version', () => {
  const stale = JSON.stringify({ ...createState(), version: SCHEMA_VERSION - 1 });
  assert.equal(deserialize(stale), null);
});

test('deserialize survives corrupt json without throwing', () => {
  assert.equal(deserialize('{not json'), null);
  assert.equal(deserialize(''), null);
  assert.equal(deserialize(null), null);
});

test('save then load returns an equivalent state', () => {
  const storage = fakeStorage();
  const s = { ...createState(), name: 'Test', batch: '28' };
  save(s, storage);
  assert.deepEqual(load(storage), s);
});

test('clear removes the stored state', () => {
  const storage = fakeStorage();
  save(createState(), storage);
  clear(storage);
  assert.equal(load(storage), null);
  assert.equal(storage.getItem(STORAGE_KEY), null);
});

test('storage failures are swallowed so private mode never breaks the page', () => {
  const hostile = {
    getItem: () => { throw new Error('denied'); },
    setItem: () => { throw new Error('quota'); },
    removeItem: () => { throw new Error('denied'); },
  };
  assert.doesNotThrow(() => save(createState(), hostile));
  assert.equal(load(hostile), null);
  assert.doesNotThrow(() => clear(hostile));
});

test('ssc skips the subject picker, hsc does not', () => {
  const ssc = { ...createState(), screen: 'group', level: 'ssc' };
  assert.equal(nextScreen(ssc), 'syllabus');
  const hsc = { ...createState(), screen: 'group', level: 'hsc' };
  assert.equal(nextScreen(hsc), 'subjects');
});

test('going back from the syllabus screen mirrors the forward skip', () => {
  const ssc = { ...createState(), screen: 'syllabus', level: 'ssc' };
  assert.equal(prevScreen(ssc), 'group');
  const hsc = { ...createState(), screen: 'syllabus', level: 'hsc' };
  assert.equal(prevScreen(hsc), 'subjects');
});

test('the landing screen has nowhere to go back to', () => {
  assert.equal(prevScreen(createState()), null);
});
