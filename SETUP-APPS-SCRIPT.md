# Google Sheet Setup — তোর সিলেবাস শেষ হইসে ট্র্যাকার

Follow these steps in order. **Start at `script.google.com`, not from the spreadsheet.**
Creating the script from the Sheet's *Extensions → Apps Script* menu produces a container-bound
project, which has failed for this account before. The steps below create a standalone project
that opens the sheet by ID.

Total time: about 5 minutes.

## 1. Create the project

1. Go to **https://script.google.com**
2. Click **New project** (top left).
3. Click the project name (`Untitled project`) and rename it to
   `Syllabus Tracker Leads`.

## 2. Paste the code

1. Delete everything in the `Code.gs` editor pane.
2. Open `apps-script/Code.gs` from this repository and paste its full contents in.
3. Press **Ctrl+S** (or the save icon).

Confirm line 8 reads:

```javascript
var SPREADSHEET_ID = '1hnoInIk37frhk6DBIxGWOkSjN9PAkOj9f_pbL3rCwRI';
```

That is the ID from the target spreadsheet's URL. If the sheet is ever replaced, take the long
string between `/d/` and `/edit` from the new URL and put it here.

## 3. Authorise the script

1. In the function dropdown at the top, select **`doGet`**.
2. Click **Run**.
3. A dialog appears: **Review permissions** → choose your Google account.
4. You will see **"Google hasn't verified this app"**. This is expected for your own script.
   Click **Advanced** (small link, bottom left), then
   **Go to Syllabus Tracker Leads (unsafe)**.
5. Click **Allow**.

If you skip this step, the deployment will return an authorisation error to every visitor.

## 4. Deploy as a web app

1. Click **Deploy** (top right) → **New deployment**.
2. Click the gear icon next to *Select type* → **Web app**.
3. Fill in:
   - **Description:** `v1`
   - **Execute as:** `Me (your@email.com)`
   - **Who has access:** `Anyone`
4. Click **Deploy**.

> **"Who has access" must be `Anyone`, not `Anyone with Google account`.** Students are not
> signed in to Google in the Facebook in-app browser, and `Anyone with Google account` will
> silently reject every submission.

5. Copy the **Web app URL**. It looks like:
   `https://script.google.com/macros/s/AKfycb.../exec`

## 5. Verify a row lands before going live

Paste this into your browser, replacing the URL with your own:

```
https://script.google.com/macros/s/YOUR_ID_HERE/exec?test=1
```

Expected response: `{"ok":true,"wrote":"test row"}`

Open the spreadsheet. There must now be a `Leads` tab with a bold header row and one row
reading `TEST ROW`. Delete that row.

If nothing appears, revisit step 3 — an unauthorised script returns an HTML error page instead
of JSON.

## 6. Put the URL into the page

1. Open `src/data/config.js` in this repository.
2. Set `appsScriptUrl` to the URL you copied:

```javascript
appsScriptUrl: 'https://script.google.com/macros/s/YOUR_ID_HERE/exec',
```

3. Rebuild:

```bash
node scripts/build.mjs
```

4. Commit both `src/data/config.js` and the regenerated `syllabus-tracker.html`.

## Re-deploying after a code change

Apps Script does not serve edits until you deploy again, and a **New deployment** creates a
**new URL** that the page does not know about.

To keep the same URL: **Deploy → Manage deployments →** pencil icon **→ Version: New version →
Deploy**.

## Troubleshooting

| Symptom | Cause | Fix |
|---|---|---|
| Rows never appear, no browser error | `Who has access` is not `Anyone` | Redeploy with `Anyone` |
| `?test=1` returns an HTML login page | Step 3 authorisation not completed | Run `doGet` from the editor and Allow |
| Phone numbers lose their leading zero | Sheet reformatted the column | The script prefixes with `'`; do not remove it |
| Edits to `Code.gs` have no effect | Not redeployed | Manage deployments → New version |
| Rows appear twice | The retry in `submit.js` fired on a slow success | Harmless; dedupe by phone in the sheet |
