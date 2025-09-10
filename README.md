# SEEPEP Fixture & Results Tracker

This project is a small React application used for managing fixtures and results.  
A lightweight mock server is provided so contributors can develop and test the
frontend without needing access to the production Google Apps Script endpoint.

## Mock API Server

The mock server stores all data in memory and implements the same actions as the
real backend: `readAll`, `upsertTeam`, `upsertFixture`, `upsertResult` and
`deleteFixtureRemote`.

### Running the server

```bash
npm start
```

This serves the app and API at `http://localhost:3001`.

### Using the mock server from the frontend

Open the application with the `?mock=1` flag to switch the frontend to the mock
API:

```
http://localhost:3001/?mock=1
```

Alternatively set `window.__SEEPEP_USE_MOCK__ = true` before loading `app.js`.
Omitting the flag (or setting it to `false`) will use the real production API.

The mock server keeps data only in memory, so restarting it clears all stored
teams, fixtures and results.
