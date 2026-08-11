const ok = (normalized = '') => ({ valid: true, error: '', normalized });
const bad = (error, normalized = '') => ({ valid: false, error, normalized });

function validateText(value, label) {
  const trimmed = String(value ?? '').trim();
  if (trimmed.length < 2) return bad(`${label} ঠিকভাবে লেখো`, trimmed);
  return ok(trimmed);
}

export function validateName(value) {
  return validateText(value, 'নামটা');
}

export function validateInstitute(value) {
  return validateText(value, 'প্রতিষ্ঠানের নামটা');
}

// Bangladeshi mobile numbers are 11 digits: 01 followed by an operator digit in 3-9.
// 010 and 012 are unallocated, so they are treated as typos.
export function validatePhone(value) {
  const digits = String(value ?? '').replace(/\D/g, '').replace(/^(?:88)?/, '');
  if (!/^01[3-9]\d{8}$/.test(digits)) {
    return bad('১১ ডিজিটের সঠিক মোবাইল নাম্বার দাও (যেমন ০১৭xxxxxxxx)', digits);
  }
  return ok(digits);
}

export function validateEmail(value) {
  const normalized = String(value ?? '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@.]+(?:\.[^\s@.]+)+$/.test(normalized)) {
    return bad('সঠিক ইমেইল অ্যাড্রেস দাও', normalized);
  }
  return ok(normalized);
}
