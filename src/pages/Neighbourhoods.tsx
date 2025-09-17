import { RefreshCcw } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../components/ui/Card';
import usePollingFetch from '../lib/usePollingFetch';
import { getNeighbourhoods, hasRemoteApi } from '../lib/api';

type NeighbourhoodRow = {
  Year: string;
  Neighbourhood: string;
  TotalPoints: number;
  FairPlayPoints: number;
  GrandTotal: number;
};

const env = (import.meta as any).env ?? {};
const POLL_INTERVAL = Number((env?.VITE_POLL_MS ?? 60000) || 60000);
const POLLING_ENABLED =
  String(env?.VITE_POLLING_ENABLED ?? env?.VITE_ENABLE_POLLING ?? 'false').toLowerCase() === 'true';

function normaliseRow(row: any): NeighbourhoodRow {
  const yearValue = row?.Year ?? row?.year ?? '';
  return {
    Year: typeof yearValue === 'string' ? yearValue : String(yearValue ?? ''),
    Neighbourhood: row?.Neighbourhood ?? row?.neighbourhood ?? '',
    TotalPoints: Number(row?.TotalPoints ?? row?.totalpoints ?? 0) || 0,
    FairPlayPoints: Number(row?.FairPlayPoints ?? row?.fairplaypoints ?? 0) || 0,
    GrandTotal: Number(row?.GrandTotal ?? row?.grandtotal ?? 0) || 0,
  } satisfies NeighbourhoodRow;
}

function parseYearValue(year: string): number {
  const trimmed = year?.trim?.() ?? '';
  const parsed = Number.parseInt(trimmed, 10);
  return Number.isFinite(parsed) ? parsed : Number.MAX_SAFE_INTEGER;
}

export default function Neighbourhoods() {
  const [rows, setRows] = useState<NeighbourhoodRow[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(
    hasRemoteApi ? null : 'Configure VITE_SEPEP_API_URL to enable live neighbourhood data.',
  );
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const hasLoadedRef = useRef(false);

  const fetchData = useCallback(async () => {
    if (!hasLoadedRef.current) {
      setLoading(true);
    }
    try {
      const response = await getNeighbourhoods();
      const normalised = Array.isArray(response) ? response.map(normaliseRow) : [];
      setRows(normalised);
      setError(null);
      setNotice(hasRemoteApi ? null : 'Configure VITE_SEPEP_API_URL to enable live neighbourhood data.');
      setLastUpdated(new Date());
    } catch (err) {
      console.error('Failed to load neighbourhood data', err);
      if (!hasLoadedRef.current) {
        setRows([]);
      }
      setError('Unable to load neighbourhood totals right now. Please try again soon.');
    } finally {
      hasLoadedRef.current = true;
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  usePollingFetch(fetchData, POLL_INTERVAL, POLLING_ENABLED && hasRemoteApi);

  const grouped = useMemo(() => {
    const map = new Map<string, NeighbourhoodRow[]>();
    for (const row of rows) {
      if (!row.Year || !row.Neighbourhood) continue;
      const yearKey = row.Year.trim();
      if (!map.has(yearKey)) {
        map.set(yearKey, []);
      }
      map.get(yearKey)!.push(row);
    }

    return Array.from(map.entries())
      .sort(([yearA], [yearB]) => parseYearValue(yearA) - parseYearValue(yearB))
      .map(([year, items]) => ({
        year,
        items: [...items].sort((a, b) => {
          if (b.GrandTotal !== a.GrandTotal) return b.GrandTotal - a.GrandTotal;
          if (b.TotalPoints !== a.TotalPoints) return b.TotalPoints - a.TotalPoints;
          return a.Neighbourhood.localeCompare(b.Neighbourhood);
        }),
      }));
  }, [rows]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-mbhs-white via-slate-50 to-mbhs-white text-mbhs-navy">
      <header className="bg-mbhs-navy text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">Neighbourhood Points</h1>
            <p className="text-white/80">Totals by year and neighbourhood across SEPEP</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="text-sm text-white/80">
              Last updated: {lastUpdated ? lastUpdated.toLocaleString() : '—'}
            </div>
            <Link
              to="/"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
            >
              ← Back to Sports Hub
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
        {notice && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">{notice}</div>
        )}
        {error && <div className="rounded-lg border border-danger/20 bg-danger/10 px-4 py-3 text-sm text-danger">{error}</div>}

        {loading ? (
          <div className="flex items-center justify-center py-24 text-mbhs-navy/70">
            <RefreshCcw className="mr-3 h-5 w-5 animate-spin" /> Loading neighbourhood leaderboard…
          </div>
        ) : grouped.length > 0 ? (
          <div className="space-y-6">
            {grouped.map(({ year, items }) => (
              <Card key={year} title={`Year ${year}`}>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {items.map((item) => (
                    <div
                      key={`${year}-${item.Neighbourhood}`}
                      className="rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm"
                    >
                      <div className="text-xs font-semibold uppercase text-mbhs-navy/60">Neighbourhood</div>
                      <div className="mt-1 text-2xl font-bold text-mbhs-navy">{item.Neighbourhood}</div>
                      <div className="mt-3 text-sm font-medium text-mbhs-navy">
                        Grand total: {item.GrandTotal}
                      </div>
                      <div className="mt-2 text-sm text-mbhs-navy/70">
                        {item.TotalPoints} pts match • {item.FairPlayPoints} pts fair play
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="rounded-lg border border-slate-200 bg-white/80 px-4 py-6 text-center text-sm text-mbhs-navy/70">
            No neighbourhood results available yet.
          </div>
        )}
      </main>

      <footer className="bg-white/70 py-6 text-center text-xs text-mbhs-navy/60">
        Powered by Murray Bridge High School SEPEP
      </footer>
    </div>
  );
}
