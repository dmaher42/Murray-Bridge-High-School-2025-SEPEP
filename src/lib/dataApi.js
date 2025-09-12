import { sanitizeHtml } from './sanitizeHtml.js';

const BASE = import.meta.env.VITE_API_BASE || "https://script.google.com/macros/s/APP_SCRIPT_ID/exec";

function noCache() {
  return `&_=${Date.now()}`;
}

const cache = {};

export function clearCache() {
  for (const key in cache) delete cache[key];
}

async function fetchJSON(path) {
  if (cache[path]) return cache[path];
  const res = await fetch(path);
  const data = await res.json();
  cache[path] = data;
  return data;
}

export async function getTeams() {
  if (cache.teams) return cache.teams;
  try {
    const res = await fetch(`${BASE}?route=teams${noCache()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch teams');
    const data = await res.json();
    cache.teams = data.divisions ?? [];
  } catch {
    const data = await fetchJSON('/data/teams.json');
    cache.teams = data.divisions ?? [];
  }

  // attach players to each team
  try {
    const players = await getPlayers();
    cache.teams.forEach(div => {
      (div.teams || []).forEach(team => {
        team.players = players.filter(p => p.team === team.id);
      });
    });
  } catch {
    // ignore player errors; teams will simply have empty player lists
  }

  return cache.teams;
}

export async function getFixtures() {
  if (cache.fixtures) return cache.fixtures;
  try {
    const res = await fetch(`${BASE}?route=fixtures${noCache()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch fixtures');
    const data = await res.json();
    cache.fixtures = data.rounds ?? [];
    localStorage.setItem('fixtures', JSON.stringify(cache.fixtures));
  } catch {
    const stored = localStorage.getItem('fixtures');
    if (stored) {
      cache.fixtures = JSON.parse(stored);
      return cache.fixtures;
    }
    const data = await fetchJSON('/data/fixtures.json');
    cache.fixtures = data.rounds ?? [];
  }
  return cache.fixtures;
}

export async function getResults() {
  if (cache.results) return cache.results;
  try {
    const res = await fetch(`${BASE}?route=results${noCache()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch results');
    const data = await res.json();
    cache.results = data;
    localStorage.setItem('results', JSON.stringify(data.results ?? []));
  } catch {
    const stored = localStorage.getItem('results');
    if (stored) {
      cache.results = { results: JSON.parse(stored) };
      return cache.results;
    }
    cache.results = await fetchJSON('/data/results.json');
  }
  return cache.results;
}

export async function getPlayers() {
  if (cache.players) return cache.players;
  const normalize = data => Array.isArray(data) ? data : (data.players ?? []);
  try {
    const res = await fetch(`${BASE}?route=players${noCache()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error('Failed to fetch players');
    const data = await res.json();
    cache.players = normalize(data);
    localStorage.setItem('players', JSON.stringify(cache.players));
  } catch {
    const stored = localStorage.getItem('players');
    if (stored) {
      cache.players = JSON.parse(stored);
      return cache.players;
    }
    const data = await fetchJSON('/data/players.json');
    cache.players = normalize(data);
    localStorage.setItem('players', JSON.stringify(cache.players));
  }
  return cache.players;
}

export function upsertResult(result) {
  const results = JSON.parse(localStorage.getItem('results') || '[]');
  const idx = results.findIndex(r => r.matchId === result.matchId);
  if (idx >= 0) results[idx] = result; else results.push(result);
  localStorage.setItem('results', JSON.stringify(results));
  cache.results = { results };
  return result;
}

export async function getFixturesByRound(round) {
  const rounds = await getFixtures();
  return rounds.find(r => r.round === round);
}

export function saveFixtures(rounds) {
  localStorage.setItem('fixtures', JSON.stringify(rounds));
  cache.fixtures = rounds;
  return rounds;
}

export function getAnnouncements() {
  if (cache.announcement) return cache.announcement;
  const stored = localStorage.getItem('announcement') || '';
  cache.announcement = stored;
  return stored;
}

export function saveAnnouncement(html) {
  const sanitized = sanitizeHtml(html);
  localStorage.setItem('announcement', sanitized);
  cache.announcement = sanitized;
  return sanitized;
}

export async function refreshAll() {
  clearCache();
  localStorage.removeItem('fixtures');
  localStorage.removeItem('results');
  localStorage.removeItem('players');
  localStorage.removeItem('announcement');
  await Promise.all([getTeams(), getFixtures(), getResults(), getPlayers()]);
}
