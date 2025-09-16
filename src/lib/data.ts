export type BaseMatch = {
  id: string;
  round: string | null;
  date: string | null;
  time: string | null;
  court: string | null;
  home: string;
  away: string;
  division: string | null;
};

export type Fixture = BaseMatch;

export type Result = BaseMatch & {
  homeScore: number | null;
  awayScore: number | null;
  status: string | null;
};

function toRecords(value: unknown, fallbackKey?: string): Record<string, any>[] {
  if (Array.isArray(value)) return value as Record<string, any>[];
  if (value && typeof value === 'object') {
    const rows = (value as any).rows;
    if (Array.isArray(rows)) return rows as Record<string, any>[];
    if (fallbackKey && Array.isArray((value as any)[fallbackKey])) {
      return (value as any)[fallbackKey] as Record<string, any>[];
    }
    if (Array.isArray((value as any).data)) {
      return (value as any).data as Record<string, any>[];
    }
    if (Array.isArray((value as any).rounds)) {
      const rounds = (value as any).rounds as any[];
      const flattened: Record<string, any>[] = [];
      for (const round of rounds) {
        const matches = Array.isArray(round?.matches) ? round.matches : [];
        for (const match of matches) {
          flattened.push({
            ...match,
            round: match?.round ?? match?.Round ?? round?.round ?? round?.Round ?? null,
            date: match?.date ?? match?.Date ?? round?.date ?? round?.Date ?? null,
          });
        }
      }
      return flattened;
    }
    if (fallbackKey && typeof (value as any)[fallbackKey] === 'object') {
      return toRecords((value as any)[fallbackKey], undefined);
    }
  }
  return [];
}

function toStringValue(value: unknown): string | null {
  if (value == null) return null;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed.length ? trimmed : null;
  }
  if (typeof value === 'number') {
    return Number.isFinite(value) ? `${value}` : null;
  }
  return null;
}

function pickString(row: Record<string, any>, keys: string[]): string | null {
  for (const key of keys) {
    if (key in row) {
      const value = toStringValue(row[key]);
      if (value) return value;
    }
  }
  return null;
}

function pickNumber(row: Record<string, any>, keys: string[]): number | null {
  for (const key of keys) {
    if (key in row) {
      const raw = row[key];
      if (typeof raw === 'number' && Number.isFinite(raw)) return raw;
      if (typeof raw === 'string') {
        const trimmed = raw.trim();
        if (!trimmed) continue;
        const parsed = Number(trimmed);
        if (Number.isFinite(parsed)) return parsed;
      }
    }
  }
  return null;
}

function normaliseBaseMatch(row: Record<string, any>): BaseMatch {
  const round = pickString(row, ['round', 'Round', 'round_num', 'roundNum', 'RoundNum', 'Week', 'week']);
  const date = pickString(row, ['date', 'Date', 'matchDate', 'MatchDate', 'day', 'Day']);
  const time = pickString(row, ['time', 'Time', 'matchTime', 'MatchTime', 'start', 'Start']);
  const court = pickString(row, ['court', 'Court', 'venue', 'Venue', 'location', 'Location']);
  const home =
    pickString(row, ['homeTeamID', 'home_clean', 'homeTeam', 'HomeTeam', 'Home', 'home']) ?? 'TBC';
  const away =
    pickString(row, ['awayTeamID', 'away_clean', 'awayTeam', 'AwayTeam', 'Away', 'away']) ?? 'TBC';
  const division = pickString(row, ['division', 'Division', 'year', 'Year', 'grade', 'Grade', 'Group', 'group']);
  const explicitId = pickString(row, ['id', 'ID', 'matchId', 'matchID', 'MatchID', 'MatchId']);
  const derivedId = `${round ?? 'round'}-${date ?? 'date'}-${time ?? ''}-${home}-${away}`;

  return {
    id: explicitId ?? derivedId,
    round,
    date,
    time,
    court,
    home,
    away,
    division,
  };
}

export function normaliseFixtures(data: unknown): Fixture[] {
  return toRecords(data, 'fixtures')
    .map((row) => normaliseBaseMatch(row))
    .filter((match) => Boolean(match.home || match.away));
}

export function normaliseResults(data: unknown): Result[] {
  return toRecords(data, 'results')
    .map((row) => {
      const base = normaliseBaseMatch(row);
      const homeScore = pickNumber(row, ['homeScore', 'HomeScore', 'home_score', 'Home_Score']);
      const awayScore = pickNumber(row, ['awayScore', 'AwayScore', 'away_score', 'Away_Score']);
      const status = pickString(row, ['status', 'Status', 'result', 'Result']);
      return { ...base, homeScore, awayScore, status };
    })
    .filter((match) => Boolean(match.home || match.away));
}

export function parseDateTime(date: string | null, time: string | null): number | null {
  if (!date) return null;
  const trimmedDate = date.trim();
  if (!trimmedDate) return null;
  const combined = time ? `${trimmedDate} ${time}` : trimmedDate;
  let parsed = Date.parse(combined);
  if (!Number.isNaN(parsed)) return parsed;

  const parts = trimmedDate.split(/[\/]/);
  if (parts.length === 3) {
    const [a, b, c] = parts;
    if (a.length === 2 && b.length === 2 && c.length === 4) {
      const iso = `${c}-${b}-${a}${time ? ` ${time}` : ''}`;
      parsed = Date.parse(iso);
      if (!Number.isNaN(parsed)) return parsed;
    }
  }

  return null;
}

export function sortByDateAsc(a: BaseMatch, b: BaseMatch) {
  const aTime = parseDateTime(a.date, a.time);
  const bTime = parseDateTime(b.date, b.time);
  if (aTime === null && bTime === null) return a.home.localeCompare(b.home);
  if (aTime === null) return 1;
  if (bTime === null) return -1;
  return aTime - bTime;
}

export function sortByDateDesc(a: BaseMatch, b: BaseMatch) {
  return -sortByDateAsc(a, b);
}

export function groupByRound(fixtures: Fixture[]): [string, Fixture[]][] {
  const groups = new Map<string, Fixture[]>();
  for (const fixture of fixtures) {
    const key = fixture.round ?? 'Unscheduled';
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key)!.push(fixture);
  }

  return Array.from(groups.entries()).sort((a, b) =>
    a[0].localeCompare(b[0], undefined, { numeric: true, sensitivity: 'base' }),
  );
}
