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

## Data schema

Sample JSON files live in `public/data`:
- `teams.json`
- `fixtures.json`
- `results.json`

## Import / Export

The Admin page includes a button to export current results stored in the browser's localStorage as JSON.

## Teacher Mode

Use the top bar toggle to switch Teacher Mode on/off. The state persists in `localStorage` and will be used to gate admin-only actions.

## Testing

```bash
npm test
```
