# SEEPEP Sports Tracker

This project is a browser-based tracker for fixtures, results and team data.  
Backend access requires an API endpoint and authentication token which are now supplied via environment variables.

## Configuration

| Variable | Purpose |
| -------- | ------- |
| `VITE_API` / `window.__SEEPEP_API__` | Base URL of the backend API |
| `VITE_TOKEN` / `window.__SEEPEP_TOKEN__` | Authentication token to send with requests |

### Using Vite (recommended for development)

1. Create a `.env` file in the project root:

```env
VITE_API=https://your-api-endpoint
VITE_TOKEN=optional-token
```

2. Run the dev server (`vite`, `npm run dev`, etc.).  Vite exposes the variables to the app via `import.meta.env`.

### Static hosting / direct HTML usage

For environments without a build step, inject globals before loading `app.js`:

```html
<script>
  window.__SEEPEP_API__ = "https://your-api-endpoint";
  window.__SEEPEP_TOKEN__ = "optional-token";
</script>
<script type="text/babel" src="app.js"></script>
```

### Fallback behaviour

If no API or token is provided the application logs a warning and operates in a mock mode.  
Network requests return empty data structures and mutations become no-ops, allowing the UI to function for demo purposes without a backend.

