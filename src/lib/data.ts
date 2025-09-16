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

type RawRow = Record<string, any>;

function toRecords(value: unknown, fallbackKey?: string): RawRow[] {
  if (Array.isArray(value)) return value as RawRow[];
  if (value && typeof value === 'object') {
    const rows = (value as any).rows;
    if (Array.isArray(rows)) return rows as RawRow[];
    if (fallbackKey && Array.isArray((value as any)[fallbackKey])) {
      return (value as any)[fallbackKey] as RawRow[];
    }
    if (Array.isArray((value as any).data)) {
      return (value as any).data as RawRow[];
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

function pickString(row: RawRow, keys: string[]): string | null {
  for (const key of keys) {
    if (key in row) {
      const candidate = toStringValue(row[key]);
      if (candidate) return candidate;
    }
  }
  return null;
}

function parseScoreValue(value: unknown): number | null {
  if (value == null) return null;
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return null;
    const parsed = Number(trimmed);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function normaliseBaseMatch(row: RawRow): BaseMatch {
  const round =
    row.round ?? row.Round ?? row.round_num ?? row.roundNum ?? row.RoundNum ?? row.Week ?? row.week ?? null;
  const date = row.date ?? row.Date ?? row.matchDate ?? row.MatchDate ?? row.day ?? row.Day ?? null;
  const time = row.time ?? row.Time ?? row.matchTime ?? row.MatchTime ?? row.start ?? row.Start ?? null;
  const court = row.court ?? row.Court ?? row.venue ?? row.Venue ?? row.location ?? row.Location ?? null;
  const division = row.division ?? row.Division ?? row.year ?? row.Year ?? row.grade ?? row.Grade ?? row.group ?? row.Group ?? null;
  const home =
    row.homeTeamID ??
    row.home_clean ??
    row.homeTeam ??
    row.HomeTeam ??
    row.Home ??
    row.home ??
    '';
  const away =
    row.awayTeamID ??
    row.away_clean ??
    row.awayTeam ??
    row.AwayTeam ??
    row.Away ??
    row.away ??
    '';
  const idValue =
    row.id ??
    row.ID ??
    row.matchId ??
    row.matchID ??
    row.MatchID ??
    row.MatchId ??
    `${round ?? 'round'}-${date ?? 'date'}-${time ?? ''}-${home}-${away}`;

  return {
    id: String(idValue),
    round: toStringValue(round),
    date: toStringValue(date),
    time: toStringValue(time),
    court: toStringValue(court),
    home: toStringValue(home) ?? '',
    away: toStringValue(away) ?? '',
    division: toStringValue(division),
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
      const homeScore = parseScoreValue(
        row.homeScore ?? row.HomeScore ?? row.home_score ?? row.Home_Score ?? row['Home Score'],
      );
      const awayScore = parseScoreValue(
        row.awayScore ?? row.AwayScore ?? row.away_score ?? row.Away_Score ?? row['Away Score'],
      );
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

  const parts = trimmedDate.split(/[\\/]/);
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
