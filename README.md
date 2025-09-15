# SEPEP Tournament Hub

React + Tailwind demo for managing school sports tournaments.

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

Set `VITE_SEPEP_API_URL` to control the API URL used for data requests. Define it in a `.env` file:

```bash
VITE_SEPEP_API_URL=https://script.google.com/macros/s/APP_SCRIPT_ID/exec
```

If unset, the application falls back to a placeholder URL or the `apiUrl` value in `public/sepep.config.json`. See `.env.example` for a template.

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
