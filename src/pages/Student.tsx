import { useCallback, useMemo, useRef, useState } from 'react';
import LiveRegion from '../components/LiveRegion';
import ReactDOM from 'react-dom/client';
import '../index.css';
import Card from '../components/ui/Card';
import Ladder from '../components/ui/Ladder';
import { formatScore } from '../lib/format';
import { RefreshCcw } from 'lucide-react';
import {
  getLocalResults,
  getResults,
  hasRemoteApi,
} from '../lib/api';
import { normaliseResults, sortByDateDesc, type Result } from '../lib/data';
import usePollingFetch from '../lib/usePollingFetch';

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

const POLL_INTERVAL = 60_000;
const POLLING_ENABLED = String(import.meta.env.VITE_POLLING_ENABLED ?? '').toLowerCase() === 'true';

function StudentApp() {
  const [houses, setHouses] = useState<Houses>({});
  const [results, setResults] = useState<Result[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [error, setError] = useState<string>('');
  const demoNotice = 'Using bundled demo data. Configure VITE_SEPEP_API_URL for live updates.';
  const [notice, setNotice] = useState<string>(hasRemoteApi ? '' : demoNotice);
  const [liveMessage, setLiveMessage] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const hasLoadedRef = useRef(false);

  const loadResults = useCallback(async () => {
    if (!hasLoadedRef.current) {
      setLoading(true);
    }

    const applyResults = (raw: unknown) => {
      const parsed = normaliseResults(raw);
      setResults(parsed);
      setHouses(buildLadder(parsed));
      const now = new Date();
      setLastUpdated(now.toLocaleString());
      setLiveMessage(`Scores updated ${now.toLocaleTimeString()}`);
    };

    try {
      const data = await getResults();
      if (data) {
        applyResults(data);
        setNotice(hasRemoteApi ? '' : demoNotice);
        setError('');
      } else {
        const fallback = await getLocalResults();
        if (fallback) {
          applyResults(fallback);
          setNotice('');
          setError('Live data unavailable right now. Showing cached results.');
        } else {
          setResults([]);
          setHouses({});
          setNotice('');
          setError('Unable to load SEPEP results right now.');
          setLastUpdated('');
          setLiveMessage('');
        }
      }
    } catch (err) {
      console.error('Failed to load SEPEP results', err);
      setResults([]);
      setHouses({});
      setNotice('');
      setError('Unable to load SEPEP results right now.');
      setLastUpdated('');
      setLiveMessage('');
    } finally {
      hasLoadedRef.current = true;
      setLoading(false);
    }
  }, [hasRemoteApi]);

  const pollResults = useCallback(() => loadResults(), [loadResults]);
  usePollingFetch(pollResults, POLL_INTERVAL, POLLING_ENABLED && hasRemoteApi);

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

        {loading ? (
          <div className="flex items-center justify-center py-16 text-mbhs-navy/70">
            <RefreshCcw className="mr-3 h-5 w-5 animate-spin" /> Loading results…
          </div>
        ) : (
          <>
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
          </>
        )}
      </main>

      <footer className="text-center muted py-6">© SEPEP</footer>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(<StudentApp />);
