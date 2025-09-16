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

Enable automatic polling of fixtures and results by setting `VITE_POLLING_ENABLED=true`. Polling runs every 60 seconds when a remote API is configured. Leave `VITE_POLLING_ENABLED` unset or `false` to fetch data only once on page load.

## Data schema

Sample JSON files live in `public/data`:
- `teams.json`
- `fixtures.json`
- `results.json`

## Read-only client

The public build is read-only. Teachers update match data directly in Google Sheets and the site simply polls the deployed Apps Script endpoint. No write operations are issued from the browser UI.

## Testing
This project uses [Vitest](https://vitest.dev) for unit tests. Run them with:

```bash
npm test
```
