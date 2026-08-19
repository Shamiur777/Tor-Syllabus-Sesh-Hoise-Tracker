import { createState, load, save, clear, nextScreen, prevScreen, toggleChapter, setSubjects } from './state.js';
import { getDefaultSelectedIds, getSubjects, needsSubjectPicker } from './subjects.js';
import { renderApp } from './ui.js';
import { captureUtm, buildPayload, trackEvent } from './tracking.js';
import { submitLead } from './submit.js';
import { computeCompletion, resolveTier } from './scoring.js';

// Captured once at load, before any navigation could alter the query string.
const utm = captureUtm(typeof location === 'undefined' ? '' : location.search);

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
    onField: (key, value) => { state = { ...state, [key]: value }; if (storage) save(state, storage); },
    onNext: () => commit({ ...state, screen: nextScreen(state) ?? state.screen }),
    onBack: () => commit({ ...state, screen: prevScreen(state) ?? state.screen }),
    onPick: (key, value) => {
      let next = { ...state, [key]: value };
      // Changing level, batch or group invalidates any subject or chapter choices made after it.
      if (key !== 'group') next = { ...next, group: null };
      next = { ...next, selectedSubjects: [], checked: [], openSubject: null };
      if (key === 'group' && !needsSubjectPicker(next.level)) {
        next.selectedSubjects = getDefaultSelectedIds(next.level, next.batch, value);
      }
      commit({ ...next, screen: nextScreen(next) ?? next.screen });
    },
    onToggleChapter: (id) => commit(toggleChapter(state, id)),
    onSetSubjects: (ids) => commit(setSubjects(state, ids, getSubjects(state.level, state.batch, state.group))),
    onOpenSubject: (id) => commit({ ...state, openSubject: id }),
    onEnrol: (value) => commit({ ...state, enrolled: value }),
    onSubmitLead: async ({ phone, email }) => {
      const next = { ...state, phone, email };
      const subjects = getSubjects(next.level, next.batch, next.group)
        .filter((s) => next.selectedSubjects.includes(s.id));
      const result = computeCompletion(subjects, new Set(next.checked));
      const tier = resolveTier(result.percent, next.batch);

      trackEvent('lead_submit', { level: next.level, batch: next.batch, percent: result.percent });
      // The result must never wait on the network. Fire and move on.
      submitLead(buildPayload(next, subjects, result, tier, utm))
        .then((ok) => { if (!ok) console.warn('Lead was not recorded'); });

      commit({ ...next, submitted: true, screen: 'result' });
    },
    onReset: () => { if (storage) clear(storage); commit(createState()); },
  };

  renderApp(root, state, handlers);
  return handlers;
}

if (typeof document !== 'undefined') boot();
