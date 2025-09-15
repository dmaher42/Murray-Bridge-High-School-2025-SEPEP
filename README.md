# SEPEP Tournament Hub

React + Tailwind demo for managing school sports tournaments.

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Environment Configuration
**⚠️ Required for builds**: Copy `.env.example` to `.env` and configure:

```bash
cp .env.example .env
```

Then edit `.env` with your actual values:
```bash
VITE_SEPEP_API_URL=https://script.google.com/macros/s/YOUR_APP_SCRIPT_ID/exec
VITE_API_BASE=https://script.google.com/macros/s/YOUR_DEPLOYMENT_ID/exec
VITE_POLL_MS=15000
```

**Note**: The app will work for development with placeholder values, but you need real API URLs for production deployment.

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

Set `VITE_SEPEP_API_URL` to control the API URL used for data requests. Define it in a `.env` file:

```bash
VITE_SEPEP_API_URL=https://script.google.com/macros/s/APP_SCRIPT_ID/exec
```

If unset, the application falls back to a placeholder URL or the `apiUrl` value in `public/sepep.config.json`. See `.env.example` for a template.

The Add Team page posts to a separate Apps Script endpoint configured via `VITE_API_BASE`:

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

## Teacher Mode

Use the top bar toggle to switch Teacher Mode on/off. The state persists in `localStorage` and will be used to gate admin-only actions.

## Testing
This project uses [Vitest](https://vitest.dev) for unit tests. Run them with:

```bash
npm test
```
