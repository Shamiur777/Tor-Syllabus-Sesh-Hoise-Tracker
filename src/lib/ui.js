import { CONFIG } from '../data/config.js';
import { getGroups } from './subjects.js';
import { GROUP_LABELS } from '../data/syllabus.js';
import { validateName, validateInstitute, validatePhone, validateEmail } from './validation.js';
import { resolveEnrolUrl } from './enrol.js';

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

// Decorative background wash. Presentational only, so it is hidden from
// assistive tech and never receives pointer events.
function orbs() {
  return el('div', { class: 'orbs', 'aria-hidden': 'true' },
    el('span', { class: 'orb orb--1' }),
    el('span', { class: 'orb orb--2' }),
    el('span', { class: 'orb orb--3' }));
}

// Before a level is picked there is no single brand, so both schools are
// shown. Each logo sits on a chip filled with its own background colour,
// because the artwork is opaque JPEG rather than transparent PNG.
function brandPair() {
  const item = (key) => {
    const b = CONFIG.brands[key];
    return el('span', { class: 'brandpair__item', style: `background:${b.logoBg}` },
      el('img', { src: b.logo, alt: b.name }));
  };
  return el('div', { class: 'brandpair' },
    item('ssc'),
    el('span', { class: 'brandpair__x', 'aria-hidden': 'true', text: '✕' }),
    item('hsc'));
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
    brandPair(),
    el('div', { class: 'hero stagger' },
      el('span', { class: 'pill', text: 'SSC ও HSC ২৭ / ২৮' }),
      el('h1', { class: 'hero__title' },
        'তোর সিলেবাস ',
        el('span', { class: 'hl', text: 'শেষ হইসে' }),
        ' ট্র্যাকার'),
      el('p', { class: 'hero__sub', text: 'চ্যাপ্টারগুলো টিক দাও, এক মিনিটেই দেখো তোমার সিলেবাসের কতটুকু শেষ।' })),
    el('div', { class: 'formcard stagger' },
      el('label', { class: 'field' }, el('span', { class: 'field__label', text: 'তোমার নাম' }), nameInput, nameErr),
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
    orbs(),
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

import { computeCompletion, computeSubjectBreakdown, resolveTier } from './scoring.js';

const RING_CIRCUMFERENCE = 326.7; // 2πr, r = 52

function progressDock(percent, completed, total) {
  // Built with createElementNS rather than el(), because el() uses
  // createElement and would produce an unstyled HTMLUnknownElement for <svg>.
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('class', 'ring');
  svg.setAttribute('viewBox', '0 0 120 120');
  svg.setAttribute('width', '64');
  svg.setAttribute('height', '64');
  svg.innerHTML =
    `<circle class="ring__track" cx="60" cy="60" r="52"></circle>` +
    `<circle class="ring__fill" cx="60" cy="60" r="52" ` +
    `style="stroke-dashoffset:${RING_CIRCUMFERENCE * (1 - percent / 100)}"></circle>`;

  return el('div', { class: 'dock' }, svg,
    el('div', {},
      el('div', { class: 'dock__pct', 'aria-live': 'polite', text: `${percent}%` }),
      el('div', { class: 'dock__meta', text: `${completed} / ${total} চ্যাপ্টার শেষ` })),
  );
}

function enrolBlock(state, h) {
  const course = CONFIG.copy.courseName[state.level];
  const verdict = el('p', { class: 'enrol__verdict' });

  if (state.enrolled === true) verdict.textContent = CONFIG.copy.enrolledYes;
  if (state.enrolled === false) verdict.textContent = CONFIG.copy.enrolledNo;

  const pick = (value) =>
    el('button', {
      class: `choice${state.enrolled === value ? ' is-selected' : ''}`,
      type: 'button', text: value ? 'হ্যাঁ' : 'না',
      onclick: () => h.onEnrol(value),
    });

  return el('div', { class: 'enrol', id: 'enrol-slot' },
    el('h3', { text: `তুমি কি ${course}-এ এনরোল করা আছো?` }),
    el('div', { class: 'stack' }, pick(true), pick(false)),
    verdict,
    state.enrolled !== null && el('button', {
      class: 'btn btn--primary', type: 'button', text: 'রেজাল্ট দেখাও',
      style: 'margin-top:16px',
      onclick: h.onNext,
    }),
  );
}

registerScreen('syllabus', (state, h) => {
  const all = getSubjects(state.level, state.batch, state.group);
  const chosen = new Set(state.selectedSubjects);
  const subjects = all.filter((s) => chosen.has(s.id));
  const checked = new Set(state.checked);

  const { completed, total, percent } = computeCompletion(subjects, checked);
  const breakdown = new Map(computeSubjectBreakdown(subjects, checked).map((r) => [r.id, r]));

  const accordions = subjects.map((s, i) => {
    const row = breakdown.get(s.id);
    const body = el('div', { class: 'accordion__body', hidden: i !== 0 });

    for (const paper of s.papers) {
      if (paper.name) body.append(el('h3', { class: 'paper-label', text: paper.name }));
      for (const c of paper.chapters) {
        body.append(el('label', { class: 'check' },
          el('input', {
            type: 'checkbox', checked: checked.has(c.id),
            onchange: () => h.onToggleChapter(c.id),
          }),
          el('span', { class: 'check__label', text: c.name })));
      }
    }

    // The screen fully re-renders on every chapter tick (see onToggleChapter in
    // main.js), so the initial aria-expanded value must match the initial
    // `hidden` state above (first accordion open, rest closed) rather than
    // assuming a default — there is no persistent DOM to fall back on.
    const head = el('button', {
      class: 'accordion__head', type: 'button', 'aria-expanded': i === 0 ? 'true' : 'false',
    },
      el('span', { style: 'flex:1' }, s.name),
      el('span', { class: 'accordion__count', text: `${row.completed}/${row.total}` }),
      el('span', { class: 'accordion__chev', 'aria-hidden': 'true' }));
    head.addEventListener('click', () => {
      body.hidden = !body.hidden;
      head.setAttribute('aria-expanded', body.hidden ? 'false' : 'true');
    });

    const bar = el('div', { class: 'bar', style: 'margin:0 16px 12px' },
      el('div', { class: 'bar__fill', style: `width:${row.percent}%` }));

    return el('div', { class: 'accordion' }, head, bar, body);
  });

  return el('section', { class: 'screen is-active' },
    progressDock(percent, completed, total),
    el('h2', { class: 'hero__title', text: 'যেগুলো শেষ, টিক দাও' }),
    el('div', { class: 'stack' }, ...accordions),
    enrolBlock(state, h),
    el('div', { class: 'stack' },
      el('button', { class: 'btn btn--ghost', type: 'button', text: 'শুরু থেকে করো', onclick: h.onReset }),
    ),
  );
});

registerScreen('lead', (state, h) => {
  const phoneErr = el('span', { class: 'field__error' });
  const emailErr = el('span', { class: 'field__error' });
  const phoneInput = el('input', {
    class: 'field__input', type: 'tel', inputmode: 'numeric',
    placeholder: '০১৭xxxxxxxx', value: state.phone, autocomplete: 'tel',
  });
  const emailInput = el('input', {
    class: 'field__input', type: 'email', inputmode: 'email',
    placeholder: 'tomar@email.com', value: state.email, autocomplete: 'email',
  });

  const submit = el('button', { class: 'btn btn--primary', type: 'button', text: 'রেজাল্ট দেখাও' });
  submit.addEventListener('click', async () => {
    const p = validatePhone(phoneInput.value);
    const e = validateEmail(emailInput.value);
    phoneErr.textContent = p.error;
    emailErr.textContent = e.error;
    if (!p.valid || !e.valid) return;
    submit.disabled = true;
    submit.textContent = 'পাঠানো হচ্ছে...';
    await h.onSubmitLead({ phone: p.normalized, email: e.normalized });
  });

  return el('section', { class: 'screen is-active' },
    el('h2', { class: 'hero__title', text: CONFIG.copy.enrolledNo }),
    el('p', { class: 'hero__sub', text: 'নাম্বার আর ইমেইল দাও, আমরা তোমাকে কোর্সের ডিটেইলস পাঠিয়ে দিবো।' }),
    el('div', { class: 'stack stagger' },
      el('label', { class: 'field' }, el('span', { class: 'field__label', text: 'মোবাইল নাম্বার' }), phoneInput, phoneErr),
      el('label', { class: 'field' }, el('span', { class: 'field__label', text: 'ইমেইল' }), emailInput, emailErr),
      submit,
      resolveEnrolUrl(state.level, state.batch, state.group) && el('a', {
        class: 'btn btn--ghost', href: resolveEnrolUrl(state.level, state.batch, state.group),
        target: '_blank', rel: 'noopener', text: 'কোর্স দেখে আসো',
        style: 'display:inline-flex;align-items:center;justify-content:center;text-decoration:none',
      }),
      el('button', { class: 'btn btn--ghost', type: 'button', text: 'পিছনে', onclick: h.onBack }),
    ),
  );
});

import { renderResultImage, downloadCanvas, shareCanvas } from './canvas.js';

registerScreen('result', (state, h) => {
  const all = getSubjects(state.level, state.batch, state.group);
  const subjects = all.filter((s) => state.selectedSubjects.includes(s.id));
  const { percent, completed, total } = computeCompletion(subjects, new Set(state.checked));
  const tier = resolveTier(percent, state.batch);

  const pct = el('div', { class: 'result__pct', text: '0%' });
  const preview = el('img', { class: 'result__img', alt: 'তোমার রেজাল্ট' });
  const hint = el('p', { class: 'dock__meta' });
  const filename = `syllabus-${state.name.replace(/\s+/g, '-')}-${percent}pc.png`;

  // Count up rather than snapping, so the number reads as an achievement.
  let shown = 0;
  const tick = setInterval(() => {
    shown += Math.max(1, Math.ceil(percent / 30));
    if (shown >= percent) { shown = percent; clearInterval(tick); }
    pct.textContent = `${shown}%`;
  }, 28);

  let canvas = null;
  // The object below is built from primitives (name, institute, percent, tier,
  // level) at call time, before renderResultImage's internal await runs — the
  // .then callback only ever touches the local `canvas`/`preview` variables it
  // closes over, never the outer `state`, so it can't read a stale value even
  // though onField mutates `state` without a re-render.
  renderResultImage({ name: state.name, institute: state.institute, percent, tier, level: state.level })
    .then((c) => { canvas = c; preview.src = c.toDataURL('image/png'); })
    .catch((err) => { console.warn('Result image failed', err); hint.textContent = 'ছবি বানাতে সমস্যা হয়েছে, স্ক্রিনশট নিয়ে নাও।'; });

  return el('section', { class: 'screen is-active result' },
    el('h2', { class: 'hero__title', text: `${state.name}, তোমার রেজাল্ট` }),
    pct,
    el('p', { class: 'dock__meta', text: `${completed} / ${total} চ্যাপ্টার শেষ` }),
    preview,
    hint,
    el('div', { class: 'result__actions' },
      el('button', {
        class: 'btn btn--primary', type: 'button', text: 'ছবি ডাউনলোড করো',
        onclick: async () => {
          if (!canvas) return;
          await downloadCanvas(canvas, filename);
          hint.textContent = 'ডাউনলোড না হলে উপরের ছবিটা চেপে ধরে সেভ করো।';
        },
      }),
      el('button', {
        class: 'btn btn--ghost', type: 'button', text: 'শেয়ার করো',
        onclick: async () => {
          if (!canvas) return;
          if (!(await shareCanvas(canvas, filename))) {
            hint.textContent = 'শেয়ার করা যায়নি — ছবিটা ডাউনলোড করে পোস্ট করো।';
          }
        },
      }),
      el('button', { class: 'btn btn--ghost', type: 'button', text: 'শুরু থেকে করো', onclick: h.onReset }),
    ),
  );
});
