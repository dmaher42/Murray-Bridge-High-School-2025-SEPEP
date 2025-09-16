import React, { useCallback, useEffect, useMemo, useState } from 'react';
import LiveRegion from '../components/LiveRegion';
import ReactDOM from 'react-dom/client';
import '../index.css';
import Card from '../components/ui/Card';
import Ladder from '../components/ui/Ladder';
import { formatScore } from '../lib/format';
import {
  getLocalResults,
  getResults,
  hasRemoteApi,
} from '../lib/api';
import { normaliseResults, sortByDateDesc, type Result } from '../lib/data';

type Houses = Record<string, number>;

function buildLadder(results: Result[]): Houses {
  const ladder: Houses = {};
  for (const match of results) {
    const home = match.home;
    const away = match.away;
    if (!home || !away) continue;
    if (!(home in ladder)) ladder[home] = 0;
    if (!(away in ladder)) ladder[away] = 0;
    if (match.homeScore == null || match.awayScore == null) continue;
    if (match.homeScore > match.awayScore) {
      ladder[home] += 3;
    } else if (match.homeScore < match.awayScore) {
      ladder[away] += 3;
    } else {
      ladder[home] += 1;
      ladder[away] += 1;
    }
  }
  return ladder;
}

function StudentApp() {
  const [houses, setHouses] = useState<Houses>({});
  const [results, setResults] = useState<Result[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [notice, setNotice] = useState<string>(
    hasRemoteApi ? '' : 'Using demo data. Add VITE_SEPEP_API_URL for live updates.',
  );
  const [liveMessage, setLiveMessage] = useState<string>('');

  const pollInterval = Number(((import.meta as any).env?.VITE_POLL_MS ?? 60000) || 60000);

  const loadResults = useCallback(async () => {
    try {
      const data = await getResults();
      const parsed = normaliseResults(data);
      setResults(parsed);
      setHouses(buildLadder(parsed));
      setNotice(hasRemoteApi ? '' : 'Using demo data. Add VITE_SEPEP_API_URL for live updates.');
      setError('');
      const now = new Date();
      setLastUpdated(now.toLocaleString());
      setLiveMessage(`Scores updated ${now.toLocaleTimeString()}`);
    } catch (err) {
      console.error('Failed to fetch live results', err);
      try {
        const fallback = await getLocalResults();
        const parsed = normaliseResults(fallback);
        setResults(parsed);
        setHouses(buildLadder(parsed));
        setNotice('Live data unavailable. Showing cached results.');
        setError('');
        const now = new Date();
        setLastUpdated(now.toLocaleString());
        setLiveMessage(`Scores updated ${now.toLocaleTimeString()}`);
      } catch (fallbackErr) {
        console.error('Failed to load fallback results', fallbackErr);
        setResults([]);
        setHouses({});
        setError('Unable to load SEPEP results right now.');
      }
    }
  }, []);

  useEffect(() => {
    let cancelled = false;

    const tick = async () => {
      if (cancelled) return;
      await loadResults();
    };

    tick();
    if (!hasRemoteApi || !Number.isFinite(pollInterval) || pollInterval < 1000) {
      return () => {
        cancelled = true;
      };
    }

    const id = setInterval(tick, pollInterval);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [loadResults, pollInterval]);

  const latest = useMemo(() => {
    return [...results].sort(sortByDateDesc).slice(0, 10);
  }, [results]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-mbhs-white via-slate-50 to-mbhs-white">
      <LiveRegion message={liveMessage} />
      <header className="bg-mbhs-navy text-white sticky top-0 z-40">
        <div className="max-w-6xl mx-auto pad flex items-center justify-between">
          <h1 className="text-2xl font-bold">SEPEP Student Hub</h1>
          <div className="muted text-white/80">Last update: {lastUpdated || '—'}</div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto pad space-y-8">
        {notice && (
          <div className="card pad text-amber-700 bg-amber-50 border border-amber-200">{notice}</div>
        )}
        {error && <div className="card pad text-danger bg-danger/10 border-danger/20">{error}</div>}

        <Card title="Team Ladder">
          <Ladder houses={houses} />
        </Card>

        <Card title="Latest Matches">
          <div className="space-y-3">
            {latest.map((match) => (
              <div
                key={match.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-0 bg-white odd:bg-slate-50 rounded-lg p-3"
              >
                <span className="text-mbhs-navy font-medium break-words">
                  {match.home} vs {match.away}
                </span>
                <span className="font-bold text-mbhs-navy text-left sm:text-right">
                  {formatScore(match.homeScore ?? undefined, match.awayScore ?? undefined)}
                </span>
              </div>
            ))}
            {!latest.length && <p className="text-mbhs-navy/70">No recent results yet.</p>}
          </div>
        </Card>
      </main>

      <footer className="text-center muted py-6">© SEPEP</footer>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(<StudentApp />);
