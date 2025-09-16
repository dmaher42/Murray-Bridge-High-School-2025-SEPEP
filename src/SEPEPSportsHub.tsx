import { useCallback, useEffect, useMemo, useState, type ComponentType } from 'react';
import { CalendarDays, Home as HomeIcon, ListChecks, RefreshCcw } from 'lucide-react';
import Card from './components/ui/Card';
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

const POLL_INTERVAL = Number(((import.meta as any).env?.VITE_POLL_MS ?? 60000) || 60000);

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

export default function SEPEPSportsHub() {
  const [activeTab, setActiveTab] = useState<TabId>('home');
  const [data, setData] = useState<NormalisedData>({ fixtures: [], results: [] });
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(
    hasRemoteApi ? null : 'Using bundled demo data. Configure VITE_SEPEP_API_URL for live updates.',
  );
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchFixtures = useCallback(async () => {
    if (!hasRemoteApi) {
      const localFixtures = await getLocalFixtures();
      return { fixtures: normaliseFixtures(localFixtures), usedFallback: true };
    }

    try {
      const liveFixtures = await getFixtures();
      return { fixtures: normaliseFixtures(liveFixtures), usedFallback: false };
    } catch (err) {
      console.error('Failed to fetch live fixtures', err);
      const localFixtures = await getLocalFixtures();
      return { fixtures: normaliseFixtures(localFixtures), usedFallback: true };
    }
  }, []);

  const fetchResults = useCallback(async () => {
    if (!hasRemoteApi) {
      const localResults = await getLocalResults();
      return { results: normaliseResults(localResults), usedFallback: true };
    }

    try {
      const liveResults = await getResults();
      return { results: normaliseResults(liveResults), usedFallback: false };
    } catch (err) {
      console.error('Failed to fetch live results', err);
      const localResults = await getLocalResults();
      return { results: normaliseResults(localResults), usedFallback: true };
    }
  }, []);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [fixtureData, resultData] = await Promise.all([fetchFixtures(), fetchResults()]);
      const fixtures = fixtureData.fixtures;
      const results = resultData.results;
      setData({ fixtures, results });
      const usedFallback = fixtureData.usedFallback || resultData.usedFallback;
      if (!hasRemoteApi) {
        setNotice('Using bundled demo data. Configure VITE_SEPEP_API_URL for live updates.');
      } else if (usedFallback) {
        setNotice('Live data unavailable right now. Showing cached data.');
      } else {
        setNotice(null);
      }
      setLastUpdated(new Date());
    } catch (err) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'Unable to load SEPEP data');
    } finally {
      setLoading(false);
    }
  }, [fetchFixtures, fetchResults]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  useEffect(() => {
    if (!hasRemoteApi) return;
    if (!Number.isFinite(POLL_INTERVAL) || POLL_INTERVAL < 1000) return;
    const timer = setInterval(() => {
      refresh();
    }, POLL_INTERVAL);
    return () => clearInterval(timer);
  }, [refresh]);

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
              onClick={refresh}
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
                activeTab === id
                  ? 'bg-mbhs-navy text-white shadow'
                  : 'bg-slate-100 text-mbhs-navy hover:bg-slate-200'
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
          <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            {notice}
          </div>
        )}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

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
