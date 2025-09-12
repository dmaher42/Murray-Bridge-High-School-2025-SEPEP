export function parseScoreboard(data) {
  try {
    const list = Array.isArray(data) ? data : JSON.parse(data);
    return list
      .filter(item => item && item.status === 'Final')
      .map(item => ({
        matchId: item.matchId,
        homeTeam: item.homeTeam,
        awayTeam: item.awayTeam,
        homePoints: Number(item.homePoints) || 0,
        awayPoints: Number(item.awayPoints) || 0,
      }));
  } catch (err) {
    console.error('Failed to parse scoreboard', err);
    return [];
  }
}

export function parseFixtures(data) {
  try {
    const list = Array.isArray(data) ? data : JSON.parse(data);
    return list.map(item => ({
      id: item.id,
      division: item.division,
      round: item.round,
      homeTeam: item.homeTeam,
      awayTeam: item.awayTeam,
      slot: item.slot ?? null,
      venue: item.venue ?? null,
      start: item.start ?? null,
    }));
  } catch (err) {
    console.error('Failed to parse fixtures', err);
    return [];
  }
}
