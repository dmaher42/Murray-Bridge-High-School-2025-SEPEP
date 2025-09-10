export const uid = () => Math.random().toString(36).slice(2, 10);
export const toInt = v => (v === '' || v == null ? 0 : Number(v));

export function computeLadder(teams, fixtures, results) {
  const table = {};
  teams.forEach(t => { table[t.id] = { team: t, P: 0, W: 0, D: 0, L: 0, PF: 0, PA: 0, PTS: 0, '%': 0 }; });
  const resMap = new Map(results.map(r => [r.id, r]));
  fixtures.forEach(f => {
    const r = resMap.get(f.id); if (!r) return;
    const home = table[f.homeId]; const away = table[f.awayId]; if (!home || !away) return;
    home.P++; away.P++;
    home.PF += toInt(r.homeScore); home.PA += toInt(r.awayScore);
    away.PF += toInt(r.awayScore); away.PA += toInt(r.homeScore);
    if (r.homeScore > r.awayScore) { home.W++; away.L++; home.PTS += 4; }
    else if (r.homeScore < r.awayScore) { away.W++; home.L++; away.PTS += 4; }
    else { home.D++; away.D++; home.PTS += 2; away.PTS += 2; }
  });
  Object.values(table).forEach(row => { const denom = row.PA === 0 ? 1 : row.PA; row['%'] = Math.round((row.PF / denom) * 1000) / 10; });
  return Object.values(table).sort((a, b) => b.PTS - a.PTS || b['%'] - a['%']);
}

export function computeNeighbourhoodTotals(teams, results, fixtures) {
  const byTeam = Object.fromEntries(teams.map(t => [t.id, t]));
  const resMap = new Map(results.map(r => [r.id, r]));
  const totals = {};
  fixtures.forEach(f => {
    const r = resMap.get(f.id); if (!r) return;
    const home = byTeam[f.homeId]; const away = byTeam[f.awayId]; if (!home || !away) return;
    const hn = home.neighbourhood || '—'; const an = away.neighbourhood || '—';
    totals[hn] = totals[hn] || { neighbourhood: hn, PF: 0, PA: 0, Wins: 0, Losses: 0, Draws: 0 };
    totals[an] = totals[an] || { neighbourhood: an, PF: 0, PA: 0, Wins: 0, Losses: 0, Draws: 0 };
    totals[hn].PF += toInt(r.homeScore); totals[hn].PA += toInt(r.awayScore);
    totals[an].PF += toInt(r.awayScore); totals[an].PA += toInt(r.homeScore);
    if (r.homeScore > r.awayScore) { totals[hn].Wins++; totals[an].Losses++; }
    else if (r.homeScore < r.awayScore) { totals[an].Wins++; totals[hn].Losses++; }
    else { totals[hn].Draws++; totals[an].Draws++; }
  });
  return Object.values(totals).sort((a, b) => (b.Wins - a.Wins) || (b.PF - a.PF));
}
