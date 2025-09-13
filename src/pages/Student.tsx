import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import '../index.css';
import { loadConfig } from '../lib/config';
import { fetchSummary } from '../lib/api';
import Card from '../components/ui/Card';
import Ladder from '../components/ui/Ladder';

type Houses = Record<string, number>;
type Row = { YearLevel?: string; HomeTeam?: string; AwayTeam?: string; HomeScore?: number|string; AwayScore?: number|string; Round?: string; Status?: string };

function StudentApp() {
  const [houses, setHouses] = useState<Houses>({});
  const [rows, setRows] = useState<Row[]>([]);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [error, setError] = useState<string>('');

  const toResults = (rws: Row[] = []) => rws
    .filter(r => r.HomeTeam && r.AwayTeam)
    .map(r => ({ homeTeam: r.HomeTeam, awayTeam: r.AwayTeam, score: `${r.HomeScore}-${r.AwayScore}`, round: r.Round || 'Latest', status: r.Status || 'Final' }));

  useEffect(() => {
    (async () => {
      const cfg = await loadConfig();
      if (cfg.apiUrl) localStorage.setItem('sepep_api_url', cfg.apiUrl);
      const tick = async () => {
        try {
          const data = await fetchSummary();
          setHouses(data.houses || {});
          setRows(data.rows || []);
          setLastUpdated(new Date().toLocaleString());
          document.getElementById('a11y-updates')!.textContent = `Scores updated ${new Date().toLocaleTimeString()}`;
          setError('');
        } catch (e:any) {
          setError('Missing or invalid API URL (see sepep.config.json)');
        }
      };
      await tick();
      const id = setInterval(tick, Number((import.meta as any).env?.VITE_POLL_MS ?? 15000));
      return () => clearInterval(id);
    })();
  }, []);

  const latest = toResults(rows).slice(0, 10);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-blue-50 to-green-50">
      <div role="status" aria-live="polite" className="sr-only" id="a11y-updates" />
      <header className="bg-white/80 backdrop-blur-lg border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto pad flex items-center justify-between">
          <h1 className="h1">SEPEP Student Hub</h1>
          <div className="muted">Last update: {lastUpdated || '—'}</div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto pad space-y-8">
        {error && <div className="card pad text-danger bg-danger/10 border-danger/20">{error}</div>}

        <Card title="House Championship">
          <Ladder houses={houses} />
        </Card>

        <Card title="Latest Matches">
          <div className="space-y-3">
            {latest.map((m,i)=>(
              <div key={i} className="flex items-center justify-between bg-white odd:bg-slate-50 dark:bg-slate-800/60 dark:odd:bg-slate-800/40 rounded-lg p-3">
                <span className="text-slate-800 font-medium">{m.homeTeam} vs {m.awayTeam}</span>
                <span className="font-bold text-slate-900 text-right">{m.score}</span>
              </div>
            ))}
            {!latest.length && <p className="text-slate-600">No recent results yet.</p>}
          </div>
        </Card>
      </main>

      <footer className="text-center muted py-6">© SEPEP</footer>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(<StudentApp />);
