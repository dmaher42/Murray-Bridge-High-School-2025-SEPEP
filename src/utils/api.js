const API = window.__SEEPEP_API__ ?? 'https://script.google.com/macros/s/AKfycbxQF1jPP2EjOt8RH81onVHgxazq1uxzZpQ7WBt214pcsV7IkXLzxxS72uwNJQoy7n2F/exec';
const TOKEN = window.__SEEPEP_TOKEN__ ?? '';

async function apiGet(params) {
  const url = `${API}?${new URLSearchParams({ ...params, token: TOKEN })}`;
  const res = await fetch(url, { method: 'GET' });
  if (!res.ok) {
    const errorText = await res.text().catch(() => 'Unknown error');
    throw new Error(`API Error (${res.status}): ${errorText}`);
  }
  return res.json();
}

async function apiPost(action, payload) {
  const res = await fetch(API, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ action, token: TOKEN, ...payload }),
  });
  if (!res.ok) {
    const errorText = await res.text().catch(() => 'Unknown error');
    throw new Error(`API Error (${res.status}): ${errorText}`);
  }
  return res.json();
}

export async function readAll(division) {
  return apiGet({ action: 'readAll', year: division });
}

export async function upsertTeam(team) {
  return apiPost('upsertTeam', { team });
}

export async function upsertFixture(fixture) {
  return apiPost('upsertFixture', { fixture });
}

export async function upsertResult(result) {
  return apiPost('upsertResult', { result });
}

export async function deleteFixtureRemote(id) {
  return apiPost('deleteFixtureRemote', { id });
}
