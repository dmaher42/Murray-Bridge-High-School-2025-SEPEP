# SEPEP Tournament Hub

React + Tailwind site for presenting Murray Bridge High School's SEPEP fixtures and results.

## Setup

```bash
npm install
```

### UI Elements

Tailwind Plus Elements are sourced from npm (`@tailwindplus/elements`) using the npm registry. If installing via npm isn't possible, they can be loaded from the CDN:

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/@tailwindplus/elements@1"></script>
```

## Development

```bash
npm run dev
```

## Build

```bash
npm run build
```

## Environment Variables

Set `VITE_SEPEP_API_URL` to point at the deployed Google Apps Script that exposes read-only fixtures and results. Define it in a `.env` file:

```bash
VITE_SEPEP_API_URL=https://script.google.com/macros/s/APP_SCRIPT_ID/exec
```

If unset, the application falls back to the bundled JSON under `public/data/*.json` so local development still works offline. See `.env.example` for a template.

The legacy “Add Team” demo posts to a separate Apps Script endpoint configured via `VITE_API_BASE`:

```bash
VITE_API_BASE=https://script.google.com/macros/s/DEPLOYMENT_ID/exec
```

After updating `.env`, rebuild and redeploy to update the GitHub Pages site.

## Add Team API (Apps Script)

`apps-script/Code.gs` contains a sheet-bound Apps Script that appends team rows. Deploy it as a Web App:

1. In the Script editor choose **Deploy → New deployment → Web app**.
2. **Execute as:** Me.
3. **Who has access:** Anyone with the link.
4. Copy the `/exec` URL and set `VITE_API_BASE`.

When you edit the script later, use **Deploy → Manage deployments** and either create a new deployment or edit the existing one to point at the latest head version.

Apps Script web apps must return a `ContentService` or HTML payload. The script uses `ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(ContentService.MimeType.JSON)` so `fetch` can parse the JSON response. Handlers `doGet(e)` and `doPost(e)` receive query-string parameters via the `e.parameter` object.

## Data schema

Sample JSON files live in `public/data`:
- `teams.json`
- `fixtures.json`
- `results.json`

## Import / Export

The Admin page includes tools to export current results as JSON and import fixtures from either JSON or Excel (`.xlsx`) files.

## Read-only client

The public build is read-only. Teachers update match data directly in Google Sheets and the site simply polls the deployed Apps Script endpoint. No write operations are issued from the browser UI.

## Testing
This project uses [Vitest](https://vitest.dev) for unit tests. Run them with:

```bash
npm test
```
