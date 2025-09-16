const BASE = import.meta.env.VITE_SEPEP_API_URL;
const BASE_URL = ((import.meta as any).env?.BASE_URL ?? '/') as string;
const LOCAL_FIXTURES_URL = `${BASE_URL}data/fixtures.json`;
const LOCAL_RESULTS_URL = `${BASE_URL}data/results.json`;

async function getJson(url: string) {
  try {
    const res = await fetch(url, { method: 'GET' });
    if (!res.ok) throw new Error(`${url} -> ${res.status}`);
    return await res.json();
  } catch (e) {
    console.error('Fetch failed:', e);
    return null;
  }
}

export const hasRemoteApi = Boolean(BASE);

export async function getFixtures() {
  if (!BASE) return getJson(LOCAL_FIXTURES_URL);
  return getJson(`${BASE}?endpoint=fixtures`);
}

export async function getResults() {
  if (!BASE) return getJson(LOCAL_RESULTS_URL);
  return getJson(`${BASE}?endpoint=results`);
}

export async function getLocalFixtures() {
  return getJson(LOCAL_FIXTURES_URL);
}

export async function getLocalResults() {
  return getJson(LOCAL_RESULTS_URL);
}
