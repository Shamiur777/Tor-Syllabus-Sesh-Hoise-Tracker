import { CONFIG } from '../data/config.js';

// Apps Script does not answer CORS preflight requests. Sending the body as
// text/plain keeps the request "simple" so no preflight is issued at all;
// the endpoint reads it from e.postData.contents regardless of the header.
async function postJson(url, payload) {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain;charset=utf-8' },
    body: JSON.stringify(payload),
    redirect: 'follow',
  });
  return res.ok;
}

// Fallback for in-app webviews that block or mangle fetch. A form POST into a
// hidden iframe cannot be read back, so success is assumed; a dropped lead is
// preferable to a student stuck on a spinner.
function postViaForm(url, payload) {
  return new Promise((resolve) => {
    const name = `s${Date.now()}`;
    const iframe = document.createElement('iframe');
    iframe.name = name;
    iframe.style.display = 'none';

    const form = document.createElement('form');
    form.action = url;
    form.method = 'POST';
    form.target = name;
    form.style.display = 'none';

    const input = document.createElement('input');
    input.type = 'hidden';
    input.name = 'payload';
    input.value = JSON.stringify(payload);
    form.append(input);

    document.body.append(iframe, form);
    iframe.addEventListener('load', () => {
      iframe.remove();
      form.remove();
      resolve(true);
    });
    form.submit();
    setTimeout(() => resolve(true), 4000);
  });
}

export async function submitLead(payload) {
  const url = CONFIG.appsScriptUrl;
  if (!url) {
    console.warn('CONFIG.appsScriptUrl is empty — lead not sent. See SETUP-APPS-SCRIPT.md');
    return false;
  }
  for (let attempt = 0; attempt < 2; attempt += 1) {
    try {
      if (await postJson(url, payload)) return true;
    } catch (err) {
      console.warn('Lead submission attempt failed', err);
    }
  }
  try {
    return await postViaForm(url, payload);
  } catch {
    return false;
  }
}
