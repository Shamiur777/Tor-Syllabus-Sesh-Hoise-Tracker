import { CONFIG } from '../data/config.js';
import { getGroups } from './subjects.js';
import { GROUP_LABELS } from '../data/syllabus.js';
import { validateName, validateInstitute } from './validation.js';

export function el(tag, props = {}, ...children) {
  const node = document.createElement(tag);
  for (const [k, v] of Object.entries(props)) {
    if (v === null || v === undefined || v === false) continue;
    if (k === 'class') node.className = v;
    else if (k === 'text') node.textContent = v;
    else if (k === 'html') node.innerHTML = v;
    else if (k.startsWith('on')) node.addEventListener(k.slice(2).toLowerCase(), v);
    else if (k === 'dataset') Object.assign(node.dataset, v);
    else node.setAttribute(k, v === true ? '' : v);
  }
  for (const c of children.flat()) {
    if (c === null || c === undefined || c === false) continue;
    node.append(c instanceof Node ? c : document.createTextNode(String(c)));
  }
  return node;
}

function topbar(state) {
  const brand = state.level ? CONFIG.brands[state.level] : null;
  return el(
    'header',
    { class: 'topbar' },
    brand && el('span', { class: 'topbar__chip' },
      el('img', { class: 'topbar__logo', src: brand.logo, alt: brand.name })),
    el('span', { class: 'topbar__title', text: 'তোর সিলেবাস শেষ হইসে ট্র্যাকার' }),
  );
}

function screenLanding(state, h) {
  const nameErr = el('span', { class: 'field__error' });
  const instErr = el('span', { class: 'field__error' });

  const nameInput = el('input', {
    class: 'field__input', type: 'text', value: state.name,
    placeholder: 'তোমার নাম', autocomplete: 'name',
    oninput: (e) => h.onField('name', e.target.value),
  });
  const instInput = el('input', {
    class: 'field__input', type: 'text', value: state.institute,
    placeholder: 'তোমার শিক্ষাপ্রতিষ্ঠানের নাম', autocomplete: 'organization',
    oninput: (e) => h.onField('institute', e.target.value),
  });

  return el(
    'section', { class: 'screen is-active' },
    el('h1', { class: 'hero__title', text: 'তোর সিলেবাস শেষ হইসে ট্র্যাকার' }),
    el('p', { class: 'hero__sub', text: 'চ্যাপ্টারগুলো টিক দাও, দেখো তোমার সিলেবাসের কতটুকু শেষ।' }),
    el('div', { class: 'stack stagger' },
      el('label', { class: 'field' }, el('span', { class: 'field__label', text: 'নাম' }), nameInput, nameErr),
      el('label', { class: 'field' }, el('span', { class: 'field__label', text: 'শিক্ষাপ্রতিষ্ঠান' }), instInput, instErr),
      el('button', {
        class: 'btn btn--primary', type: 'button', text: 'শুরু করো',
        onclick: () => {
          // Validate the live input elements, not the `state` this closure was
          // rendered with: onField updates state on every keystroke but never
          // re-renders (so the field never loses focus), which means a captured
          // `state` parameter would forever read the value from initial render.
          // The DOM nodes are the true, always-current source at submit time.
          const n = validateName(nameInput.value);
          const i = validateInstitute(instInput.value);
          nameErr.textContent = n.error;
          instErr.textContent = i.error;
          if (n.valid && i.valid) {
            h.onField('name', n.normalized);
            h.onField('institute', i.normalized);
            h.onNext();
          }
        },
      }),
    ),
  );
}

function screenChoice({ title, sub, options, selected, onPick, onBack }) {
  return el(
    'section', { class: 'screen is-active' },
    el('h2', { class: 'hero__title', text: title }),
    sub && el('p', { class: 'hero__sub', text: sub }),
    el('div', { class: 'stack stagger' },
      ...options.map((o) =>
        el('button', {
          class: `choice${selected === o.value ? ' is-selected' : ''}`,
          type: 'button', onclick: () => onPick(o.value),
        }, o.label),
      ),
    ),
    onBack && el('div', { class: 'stack' },
      el('button', { class: 'btn btn--ghost', type: 'button', text: 'পিছনে', onclick: onBack })),
  );
}

const SCREENS = {
  landing: screenLanding,

  class: (state, h) => screenChoice({
    title: 'তুমি কোন ক্লাসে?',
    options: [{ value: 'ssc', label: 'SSC' }, { value: 'hsc', label: 'HSC' }],
    selected: state.level,
    onPick: (v) => h.onPick('level', v),
    onBack: h.onBack,
  }),

  batch: (state, h) => screenChoice({
    title: 'কোন ব্যাচ?',
    options: [{ value: '27', label: `${state.level === 'ssc' ? 'SSC' : 'HSC'} ২৭` },
              { value: '28', label: `${state.level === 'ssc' ? 'SSC' : 'HSC'} ২৮` }],
    selected: state.batch,
    onPick: (v) => h.onPick('batch', v),
    onBack: h.onBack,
  }),

  group: (state, h) => screenChoice({
    title: 'কোন গ্রুপ?',
    options: getGroups(state.level).map((g) => ({ value: g, label: GROUP_LABELS[state.level][g] })),
    selected: state.group,
    onPick: (v) => h.onPick('group', v),
    onBack: h.onBack,
  }),
};

export function registerScreen(name, fn) {
  SCREENS[name] = fn;
}

export function renderApp(root, state, handlers) {
  document.body.dataset.brand = state.level ?? '';
  root.textContent = '';
  const render = SCREENS[state.screen];
  root.append(
    el('div', { class: 'wrap' }, topbar(state), render ? render(state, handlers) : el('p', { text: '...' })),
  );
}

import { getSubjects, getDefaultSelectedIds } from './subjects.js';

registerScreen('subjects', (state, h) => {
  const subjects = getSubjects(state.level, state.batch, state.group);
  // A student arriving fresh (selectedSubjects empty) sees the standard
  // combination pre-ticked; a student navigating back keeps their choices.
  const chosen = new Set(
    state.selectedSubjects.length
      ? state.selectedSubjects
      : getDefaultSelectedIds(state.level, state.batch, state.group),
  );
  const warn = el('p', { class: 'field__error' });

  const rows = subjects.map((s) => {
    const box = el('input', {
      type: 'checkbox',
      checked: chosen.has(s.id),
      disabled: s.compulsory,
      onchange: (e) => {
        if (e.target.checked) chosen.add(s.id);
        else chosen.delete(s.id);
        warn.textContent = '';
      },
    });
    return el('label', { class: `check${s.compulsory ? ' is-locked' : ''}` }, box,
      el('span', { class: 'check__label' }, s.name,
        s.compulsory && el('small', { class: 'dock__meta', text: '  (আবশ্যিক)' })));
  });

  return el('section', { class: 'screen is-active' },
    el('h2', { class: 'hero__title', text: 'তোমার সাবজেক্টগুলো বেছে নাও' }),
    el('p', { class: 'hero__sub', text: 'যেগুলো তুমি নিয়েছো শুধু সেগুলোই টিক দাও। আবশ্যিক সাবজেক্ট আগে থেকেই টিক দেওয়া।' }),
    el('div', { class: 'card', style: 'padding:10px;margin-top:20px' }, ...rows),
    warn,
    el('div', { class: 'stack' },
      el('button', {
        class: 'btn btn--primary', type: 'button', text: 'সিলেবাস দেখাও',
        onclick: () => {
          if (chosen.size === 0) { warn.textContent = 'অন্তত একটা সাবজেক্ট বেছে নাও'; return; }
          // Belt-and-braces: never trust a disabled checkbox to have carried a
          // compulsory subject through to `chosen` — union it in explicitly so
          // this, the client's core completion calculation, can't silently
          // drop a required subject.
          subjects.filter((s) => s.compulsory).forEach((s) => chosen.add(s.id));
          h.onSetSubjects([...chosen]);
          h.onNext();
        },
      }),
      el('button', { class: 'btn btn--ghost', type: 'button', text: 'পিছনে', onclick: h.onBack }),
    ),
  );
});
