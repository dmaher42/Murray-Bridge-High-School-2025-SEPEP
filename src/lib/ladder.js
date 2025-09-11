export function computeLadder(teams, fixtures, results) {
  const stats = teams.map(t => ({
    teamId: t.id,
    name: t.name,
    GP: 0,
    W: 0,
    L: 0,
    D: 0,
    PF: 0,
    PA: 0,
    PD: 0,
    Pts: 0,
    '%': 0
  }));
  const byId = Object.fromEntries(stats.map(s => [s.teamId, s]));
  results.forEach(r => {
    const f = fixtures.find(fx => fx.id === r.matchId);
    if (!f) return;
    const home = byId[f.home];
    const away = byId[f.away];
    if (!home || !away) return;
    home.GP++; away.GP++;
    home.PF += r.homeScore; home.PA += r.awayScore;
    away.PF += r.awayScore; away.PA += r.homeScore;
    if (r.homeScore > r.awayScore) { home.W++; home.Pts += 2; away.L++; }
    else if (r.homeScore < r.awayScore) { away.W++; away.Pts += 2; home.L++; }
    else { home.D++; away.D++; home.Pts++; away.Pts++; }
  });
  stats.forEach(s => {
    s['%'] = s.PA ? Number(((s.PF / s.PA) * 100).toFixed(2)) : 0;
    s.PD = s.PF - s.PA;
  });
  return stats.sort((a,b) => b.Pts - a.Pts || b.PD - a.PD || b['%'] - a['%']);
}
