import { needsSubjectPicker } from './subjects.js';

// Bump when the shape of a stored state changes, or when chapter ids are renumbered.
// A returning student with an older version is reset rather than mis-scored.
export const SCHEMA_VERSION = 1;
export const STORAGE_KEY = 'tor-syllabus-tracker-v1';

const FLOW = ['landing', 'class', 'batch', 'group', 'subjects', 'syllabus', 'lead', 'result'];

export function createState() {
  return {
    version: SCHEMA_VERSION,
    screen: 'landing',
    name: '',
    institute: '',
    level: null,
    batch: null,
    group: null,
    selectedSubjects: [],
    checked: [],
    enrolled: null,
    phone: '',
    email: '',
    submitted: false,
  };
}

export function toggleChapter(state, id) {
  const has = state.checked.includes(id);
  return {
    ...state,
    checked: has ? state.checked.filter((c) => c !== id) : [...state.checked, id],
  };
}

export function setSubjects(state, ids, allSubjects) {
  const keptIds = new Set(ids);
  const liveChapters = new Set(
    allSubjects
      .filter((s) => keptIds.has(s.id))
      .flatMap((s) => s.papers.flatMap((p) => p.chapters.map((c) => c.id))),
  );
  return {
    ...state,
    selectedSubjects: ids,
    checked: state.checked.filter((id) => liveChapters.has(id)),
  };
}

function step(state, delta) {
  const i = FLOW.indexOf(state.screen);
  if (i === -1) return null;
  let next = i + delta;
  // SSC has fixed subjects, so the picker is skipped in both directions.
  if (FLOW[next] === 'subjects' && !needsSubjectPicker(state.level)) next += delta;
  return FLOW[next] ?? null;
}

export const nextScreen = (state) => step(state, 1);
export const prevScreen = (state) => step(state, -1);

export function serialize(state) {
  return JSON.stringify(state);
}

export function deserialize(raw) {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.version !== SCHEMA_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

// Every storage call is guarded: Safari private mode and some in-app webviews
// throw on setItem, and a thrown quota error must never take the page down.
export function save(state, storage) {
  try {
    storage.setItem(STORAGE_KEY, serialize(state));
  } catch {
    /* ignore */
  }
}

export function load(storage) {
  try {
    return deserialize(storage.getItem(STORAGE_KEY));
  } catch {
    return null;
  }
}

export function clear(storage) {
  try {
    storage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}
