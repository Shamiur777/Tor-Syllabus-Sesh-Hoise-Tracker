import { createState, load, save, clear, nextScreen, prevScreen, toggleChapter, setSubjects } from './state.js';
import { getDefaultSelectedIds, getSubjects, needsSubjectPicker } from './subjects.js';
import { renderApp } from './ui.js';

export function boot() {
  const root = document.getElementById('app');
  const storage = (() => {
    try { return window.localStorage; } catch { return null; }
  })();

  let state = (storage && load(storage)) || createState();

  const commit = (next) => {
    state = next;
    if (storage) save(state, storage);
    renderApp(root, state, handlers);
  };

  const handlers = {
    // Live accessor: screens that read state inside a deferred callback (e.g. a
    // button's onclick, captured at render time) must call this instead of
    // closing over the `state` parameter they were rendered with — onField
    // deliberately does not re-render, so a captured parameter goes stale the
    // moment the student keeps typing.
    getState: () => state,
    onField: (key, value) => { state = { ...state, [key]: value }; if (storage) save(state, storage); },
    onNext: () => commit({ ...state, screen: nextScreen(state) ?? state.screen }),
    onBack: () => commit({ ...state, screen: prevScreen(state) ?? state.screen }),
    onPick: (key, value) => {
      let next = { ...state, [key]: value };
      // Changing level, batch or group invalidates any subject or chapter choices made after it.
      if (key !== 'group') next = { ...next, group: null };
      next = { ...next, selectedSubjects: [], checked: [] };
      if (key === 'group' && !needsSubjectPicker(next.level)) {
        next.selectedSubjects = getDefaultSelectedIds(next.level, next.batch, value);
      }
      commit({ ...next, screen: nextScreen(next) ?? next.screen });
    },
    onToggleChapter: (id) => commit(toggleChapter(state, id)),
    onSetSubjects: (ids) => commit(setSubjects(state, ids, getSubjects(state.level, state.batch, state.group))),
    onReset: () => { if (storage) clear(storage); commit(createState()); },
  };

  renderApp(root, state, handlers);
  return handlers;
}

if (typeof document !== 'undefined') boot();
