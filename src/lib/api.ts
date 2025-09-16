const rawBase = ((import.meta as any).env?.VITE_SEPEP_API_URL ?? '') as string;
const BASE = rawBase.trim();
const rawBaseUrl = ((import.meta as any).env?.BASE_URL ?? '/') as string;
const BASE_URL = rawBaseUrl.endsWith('/') ? rawBaseUrl : `${rawBaseUrl}/`;

const LOCAL_FIXTURES_URL = `${BASE_URL}data/fixtures.json`;
const LOCAL_RESULTS_URL = `${BASE_URL}data/results.json`;

async function getJson(url: string) {
  const res = await fetch(url, { method: 'GET' });
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  return res.json();
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
