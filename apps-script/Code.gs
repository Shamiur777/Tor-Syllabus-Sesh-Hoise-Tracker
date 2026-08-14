/**
 * তোর সিলেবাস শেষ হইসে ট্র্যাকার — lead capture endpoint.
 *
 * This is a STANDALONE Apps Script project created at script.google.com.
 * It is deliberately NOT bound to the spreadsheet via Extensions > Apps Script.
 * It reaches the sheet by ID instead. See SETUP-APPS-SCRIPT.md.
 */

var SPREADSHEET_ID = '1hnoInIk37frhk6DBIxGWOkSjN9PAkOj9f_pbL3rCwRI';
var SHEET_NAME = 'Leads';

var HEADERS = [
  'Timestamp', 'Name', 'Institute', 'Class', 'Batch', 'Group',
  'Subjects', 'Completion %', 'Tier', 'Phone', 'Email', 'Enrolled',
  'utm_source', 'utm_campaign'
];

function getSheet_() {
  var ss = SpreadsheetApp.openById(SPREADSHEET_ID);
  var sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.getRange(1, 1, 1, HEADERS.length).setFontWeight('bold');
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function json_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/** Visiting the web app URL in a browser runs this. Used to verify deployment. */
function doGet(e) {
  if (e && e.parameter && e.parameter.test === '1') {
    appendLead_({
      name: 'TEST ROW', institute: 'TEST', level: 'hsc', batch: '27',
      group: 'science', subjects: 'Physics, ICT', percent: 42,
      tier: 'batch27-tier2', phone: '01700000000', email: 'test@example.com',
      utm_source: 'manual-test', utm_campaign: 'setup'
    });
    return json_({ ok: true, wrote: 'test row' });
  }
  return json_({ ok: true, message: 'Endpoint is live. Append ?test=1 to write a test row.' });
}

/**
 * The page posts with Content-Type text/plain to avoid a CORS preflight,
 * so the JSON arrives in e.postData.contents rather than e.parameter.
 */
function doPost(e) {
  try {
    var payload = JSON.parse(e.postData.contents);
    appendLead_(payload);
    return json_({ ok: true });
  } catch (err) {
    return json_({ ok: false, error: String(err) });
  }
}

function appendLead_(p) {
  var sheet = getSheet_();
  sheet.appendRow([
    new Date(),
    p.name || '',
    p.institute || '',
    (p.level || '').toUpperCase(),
    p.batch || '',
    p.group || '',
    p.subjects || '',
    p.percent === undefined ? '' : p.percent,
    p.tier || '',
    // Leading apostrophe keeps Sheets from stripping the leading zero.
    p.phone ? "'" + p.phone : '',
    p.email || '',
    p.enrolled === true ? 'Yes' : 'No',
    p.utm_source || '',
    p.utm_campaign || ''
  ]);
}
