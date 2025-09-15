const getBase = () => {
  const env = (import.meta as any).env?.VITE_SEPEP_API_URL || '';
  const saved = localStorage.getItem('sepep_api_url') || '';
  const base = (saved || env || '').replace(/\/exec.*$/, '');
  return base ? base + '/exec' : '';
};

export type SummaryRow = {
  YearLevel?: string;
  HomeTeam?: string;
  AwayTeam?: string;
  HomeScore?: number | string;
  AwayScore?: number | string;
  Round?: string;
  Status?: string;
};

export type SummaryData = { houses: Record<string, number>; rows: SummaryRow[] };

function validateSummary(data: any): SummaryData {
  if (!data || typeof data !== 'object') throw new Error('Invalid API response');

  const houses: Record<string, number> = {};
  if (data.houses && typeof data.houses === 'object') {
    for (const [k, v] of Object.entries(data.houses)) {
      if (typeof v === 'number') houses[k] = v;
    }
  }

  let rows: SummaryRow[] = [];
  if (Array.isArray(data.rows)) {
    rows = data.rows
      .filter((r: any) => r && typeof r === 'object')
      .map((r: any) => ({
        YearLevel: typeof r.YearLevel === 'string' ? r.YearLevel : undefined,
        HomeTeam: typeof r.HomeTeam === 'string' ? r.HomeTeam : undefined,
        AwayTeam: typeof r.AwayTeam === 'string' ? r.AwayTeam : undefined,
        HomeScore:
          typeof r.HomeScore === 'number' || typeof r.HomeScore === 'string'
            ? r.HomeScore
            : undefined,
        AwayScore:
          typeof r.AwayScore === 'number' || typeof r.AwayScore === 'string'
            ? r.AwayScore
            : undefined,
        Round: typeof r.Round === 'string' ? r.Round : undefined,
        Status: typeof r.Status === 'string' ? r.Status : undefined,
      }));
  }

  return { houses, rows };
}

export async function fetchSummary(): Promise<SummaryData> {
  const base = getBase();
  if (!base) throw new Error('Missing SEPEP API URL');
  const r = await fetch(`${base}?action=summary`, { cache: 'no-store' });
  if (!r.ok) throw new Error(`API ${r.status}`);
  try {
    const data = await r.json();
    return validateSummary(data);
  } catch (e) {
    console.error('Invalid API response', e);
    throw e;
  }
}
