import { useCallback, useMemo, useRef, useState, type ComponentType } from 'react';
import { CalendarDays, Home as HomeIcon, ListChecks, RefreshCcw } from 'lucide-react';
import Card from './components/ui/Card';
import ErrorBanner from './components/ui/ErrorBanner';
import {
  groupByRound,
  normaliseFixtures,
  normaliseResults,
  sortByDateAsc,
  sortByDateDesc,
  type Fixture,
  type Result,
} from './lib/data';
import {
  getFixtures,
  getResults,
  getLocalFixtures,
  getLocalResults,
  hasRemoteApi,
} from './lib/api';
import usePollingFetch from './lib/usePollingFetch';

const POLL_INTERVAL = 60_000;
const POLLING_ENABLED = String(import.meta.env.VITE_POLLING_ENABLED ?? '').toLowerCase() === 'true';
const DEFAULT_NOTICE = hasRemoteApi
  ? null
  : 'Using bundled demo data. Configure VITE_SEPEP_API_URL for live updates.';

type TabId = 'home' | 'fixtures' | 'results';

type NormalisedData = {
  fixtures: Fixture[];
  results: Result[];
};

const tabs: { id: TabId; label: string; icon: ComponentType<{ className?: string }> }[] = [
  { id: 'home', label: 'Home', icon: HomeIcon },
  { id: 'fixtures', label: 'Fixtures', icon: CalendarDays },
  { id: 'results', label: 'Results', icon: ListChecks },
];

type LoadResult = {
  value: unknown;
  fallbackUsed: boolean;
  failed: boolean;
};

export default function SEPEPSportsHub() {
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [data, setData] = useState<NormalisedData>({ fixtures: [], results: [] });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(DEFAULT_NOTICE);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const hasLoadedRef = useRef(false);

  const loadWithFallback = useCallback(
    async (primary: () => Promise<any>, fallback: () => Promise<any>): Promise<LoadResult> => {
      const primaryData = await primary();
      if (primaryData !== null && primaryData !== undefined) {
        return { value: primaryData, fallbackUsed: false, failed: false } satisfies LoadResult;
      }
      const fallbackData = await fallback();
      if (fallbackData !== null && fallbackData !== undefined) {
        return { value: fallbackData, fallbackUsed: true, failed: false } satisfies LoadResult;
      }
      return { value: [], fallbackUsed: true, failed: true } satisfies LoadResult;
    }, []);

  const refresh = useCallback(async ({ showSpinner }: { showSpinner?: boolean } = {}) => {
    const shouldShowSpinner = showSpinner ?? !hasLoadedRef.current;
    if (shouldShowSpinner) {
      setLoading(true);
    }
    setNotice(DEFAULT_NOTICE);
    setError(null);

    try {
      const [fixtureResult, resultResult] = await Promise.all([
        loadWithFallback(() => getFixtures(), () => getLocalFixtures()),
        loadWithFallback(() => getResults(), () => getLocalResults()),
      ]);

      const fixtures = normaliseFixtures(fixtureResult.value);
      const results = normaliseResults(resultResult.value);
      setData({ fixtures, results });

      let nextError: string | null = null;
      if (fixtureResult.failed || resultResult.failed) {
        nextError = 'Unable to load SEPEP data right now. Please try again soon.';
      } else if (hasRemoteApi && (fixtureResult.fallbackUsed || resultResult.fallbackUsed)) {
        nextError = 'Live data unavailable right now. Showing cached information.';
      }
      setError(nextError);

      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
      setData({ fixtures: [], results: [] });
      setError('Unable to load SEPEP data right now. Please try again soon.');
    } finally {
      hasLoadedRef.current = true;
      if (shouldShowSpinner) {
        setLoading(false);
      }
    }
  }, [loadWithFallback]);

  const pollForUpdates = useCallback(() => refresh(), [refresh]);
  usePollingFetch(pollForUpdates, POLL_INTERVAL, POLLING_ENABLED && hasRemoteApi);

  const sortedFixtures = useMemo(() => {
    return [...data.fixtures].sort(sortByDateAsc);
  }, [data.fixtures]);

  const groupedFixtures = useMemo(() => groupByRound(sortedFixtures), [sortedFixtures]);

  const sortedResults = useMemo(() => {
    return [...data.results].sort(sortByDateDesc);
  }, [data.results]);

  const latestResults = useMemo(() => sortedResults.slice(0, 6), [sortedResults]);
  const upcomingFixtures = useMemo(() => sortedFixtures.slice(0, 6), [sortedFixtures]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-mbhs-white via-slate-50 to-mbhs-white text-mbhs-navy">
      <header className="bg-mbhs-navy text-white">
        <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-6 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-3xl font-bold">SEPEP Sports Hub</h1>
            <p className="text-white/80">Live fixtures and results powered by Google Sheets</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="text-sm text-white/80">
              Last updated: {lastUpdated ? lastUpdated.toLocaleString() : '—'}
            </div>
            <button
              type="button"
              onClick={() => refresh({ showSpinner: true })}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20 disabled:opacity-60"
            >
              <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </button>
          </div>
        </div>
      </header>

      <nav className="border-b border-slate-200/50 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-6xl gap-2 overflow-x-auto px-4 py-3">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => setActiveTab(id)}
              className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium transition ${
                activeTab === id ? 'bg-mbhs-navy text-white shadow' : 'bg-slate-100 text-mbhs-navy hover:bg-slate-200'
              }`}
            >
              <Icon className="h-4 w-4" />
              {label}
            </button>
          ))}
        </div>
      </nav>

      <main className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8">
        {notice && (
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">{notice}</div>
        )}
        {error && <ErrorBanner message={error} />}

        {loading ? (
          <div className="flex items-center justify-center py-24 text-mbhs-navy/70">
            <RefreshCcw className="mr-3 h-5 w-5 animate-spin" /> Loading SEPEP data…
          </div>
        ) : (
          <>
            {activeTab === 'home' && (
              <div className="grid gap-6 lg:grid-cols-2">
                <Card title="Upcoming fixtures">
                  <div className="space-y-4">
                    {upcomingFixtures.length === 0 && (
                      <p className="text-sm text-mbhs-navy/70">No fixtures scheduled yet.</p>
                    )}
                    {upcomingFixtures.map((fixture) => (
                      <div
                        key={fixture.id}
                        className="rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm"
                      >
                        <div className="text-xs uppercase text-mbhs-navy/60">{fixture.round ?? 'Fixture'}</div>
                        <div className="mt-1 text-lg font-semibold">
                          {fixture.home} vs {fixture.away}
                        </div>
                        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-mbhs-navy/70">
                          {fixture.date && <span>{fixture.date}</span>}
                          {fixture.time && <span>{fixture.time}</span>}
                          {fixture.court && <span>{fixture.court}</span>}
                          {fixture.division && <span>{fixture.division}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>

                <Card title="Latest results">
                  <div className="space-y-4">
                    {latestResults.length === 0 && (
                      <p className="text-sm text-mbhs-navy/70">No results recorded yet.</p>
                    )}
                    {latestResults.map((result) => {
                      const hasScore =
                        typeof result.homeScore === 'number' && typeof result.awayScore === 'number';
                      return (
                        <div
                          key={result.id}
                          className="rounded-xl border border-slate-200 bg-white/80 p-4 shadow-sm"
                        >
                          <div className="text-xs uppercase text-mbhs-navy/60">{result.round ?? 'Result'}</div>
                          <div className="mt-1 text-lg font-semibold">
                            {result.home} vs {result.away}
                          </div>
                          <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-mbhs-navy/70">
                            {result.date && <span>{result.date}</span>}
                            {result.time && <span>{result.time}</span>}
                            {result.court && <span>{result.court}</span>}
                            {result.status && <span>{result.status}</span>}
                          </div>
                          {hasScore && (
                            <div className="mt-2 text-xl font-bold text-mbhs-navy">
                              {result.homeScore} – {result.awayScore}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'fixtures' && (
              <div className="space-y-6">
                {groupedFixtures.map(([round, fixtures]) => (
                  <Card key={round} title={round}>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-slate-200 text-sm">
                        <thead>
                          <tr className="bg-slate-50">
                            <th className="px-3 py-2 text-left font-semibold">Match</th>
                            <th className="px-3 py-2 text-left font-semibold">Details</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          {fixtures.map((fixture) => (
                            <tr key={fixture.id} className="bg-white/80">
                              <td className="px-3 py-3">
                                <div className="font-semibold text-mbhs-navy">
                                  {fixture.home} vs {fixture.away}
                                </div>
                                {fixture.division && (
                                  <div className="text-xs text-mbhs-navy/70">{fixture.division}</div>
                                )}
                              </td>
                              <td className="px-3 py-3 text-sm text-mbhs-navy/80">
                                <div className="flex flex-wrap gap-x-4 gap-y-1">
                                  {fixture.date && <span>{fixture.date}</span>}
                                  {fixture.time && <span>{fixture.time}</span>}
                                  {fixture.court && <span>{fixture.court}</span>}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                ))}
                {groupedFixtures.length === 0 && (
                  <div className="rounded-lg border border-slate-200 bg-white/80 px-4 py-6 text-center text-sm text-mbhs-navy/70">
                    No fixtures available yet.
                  </div>
                )}
              </div>
            )}

            {activeTab === 'results' && (
              <Card title="Season results">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-slate-200 text-sm">
                    <thead className="bg-slate-50">
                      <tr>
                        <th className="px-3 py-2 text-left font-semibold">Match</th>
                        <th className="px-3 py-2 text-left font-semibold">Score</th>
                        <th className="px-3 py-2 text-left font-semibold">Details</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200">
                      {sortedResults.map((result) => {
                        const hasScore =
                          typeof result.homeScore === 'number' && typeof result.awayScore === 'number';
                        return (
                          <tr key={result.id} className="bg-white/80">
                            <td className="px-3 py-3">
                              <div className="font-semibold text-mbhs-navy">
                                {result.home} vs {result.away}
                              </div>
                              {result.round && (
                                <div className="text-xs text-mbhs-navy/70">{result.round}</div>
                              )}
                            </td>
                            <td className="px-3 py-3 font-semibold text-mbhs-navy">
                              {hasScore ? (
                                <span>
                                  {result.homeScore} – {result.awayScore}
                                </span>
                              ) : (
                                <span className="text-sm text-mbhs-navy/60">Scheduled</span>
                              )}
                            </td>
                            <td className="px-3 py-3 text-sm text-mbhs-navy/80">
                              <div className="flex flex-wrap gap-x-4 gap-y-1">
                                {result.date && <span>{result.date}</span>}
                                {result.time && <span>{result.time}</span>}
                                {result.court && <span>{result.court}</span>}
                                {result.status && <span>{result.status}</span>}
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                {sortedResults.length === 0 && (
                  <div className="py-6 text-center text-sm text-mbhs-navy/70">No results recorded yet.</div>
                )}
              </Card>
            )}
          </>
        )}
      </main>

      <footer className="bg-white/70 py-6 text-center text-xs text-mbhs-navy/60">
        Powered by Murray Bridge High School SEPEP
      </footer>
    </div>
  );
}
