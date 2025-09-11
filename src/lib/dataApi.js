const cache = {};

async function fetchJSON(path) {
  if (cache[path]) return cache[path];
  const res = await fetch(path);
  const data = await res.json();
  cache[path] = data;
  return data;
}

export async function getTeams() {
  const data = await fetchJSON('/data/teams.json');
  return data.divisions ?? [];
}

export async function getFixtures() {
  const stored = localStorage.getItem('fixtures');
  if (stored) return JSON.parse(stored);
  const data = await fetchJSON('/data/fixtures.json');
  return data.rounds ?? [];
}

export async function getResults() {
  const stored = localStorage.getItem('results');
  if (stored) return { results: JSON.parse(stored) };
  return fetchJSON('/data/results.json');
}

export function upsertResult(result) {
  const results = JSON.parse(localStorage.getItem('results') || '[]');
  const idx = results.findIndex(r => r.matchId === result.matchId);
  if (idx >= 0) results[idx] = result; else results.push(result);
  localStorage.setItem('results', JSON.stringify(results));
  return result;
}

export async function getFixturesByRound(round) {
  const rounds = await getFixtures();
  return rounds.find(r => r.round === round);
}

export function saveFixtures(rounds) {
  localStorage.setItem('fixtures', JSON.stringify(rounds));
  return rounds;
}
