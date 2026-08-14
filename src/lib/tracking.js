const TRACKED = [
  'utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term',
  'fbclid', 'gclid', 'ttclid', 'msclkid',
];

export function captureUtm(search) {
  const params = new URLSearchParams(search || '');
  const out = {};
  for (const key of TRACKED) out[key] = params.get(key) || '';
  return out;
}

export function buildPayload(state, subjects, result, tier, utm) {
  return {
    name: state.name,
    institute: state.institute,
    level: state.level,
    batch: state.batch,
    group: state.group,
    subjects: subjects.map((s) => s.name).join(', '),
    percent: result.percent,
    tier: tier.id,
    phone: state.phone,
    email: state.email,
    enrolled: state.enrolled === true,
    utm_source: utm.utm_source || '',
    utm_campaign: utm.utm_campaign || '',
  };
}

// No-ops safely when GA4 or the Meta Pixel are absent, which is the default.
export function trackEvent(name, params = {}) {
  try {
    if (typeof window.gtag === 'function') window.gtag('event', name, params);
    if (typeof window.fbq === 'function') window.fbq('trackCustom', name, params);
  } catch {
    /* analytics must never break the page */
  }
}
