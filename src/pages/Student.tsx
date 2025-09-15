import React, { useEffect, useState } from 'react';
import LiveRegion from '../components/LiveRegion';
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
  const [liveMessage, setLiveMessage] = useState<string>('');

  const toResults = (rws: Row[] = []) => rws
    .filter(r => r.HomeTeam && r.AwayTeam)
    .map(r => ({ homeTeam: r.HomeTeam, awayTeam: r.AwayTeam, score: `${r.HomeScore}-${r.AwayScore}`, round: r.Round || 'Latest', status: r.Status || 'Final' }));

  useEffect(() => {
    (async () => {
      try {
        const cfg = await loadConfig();
        if (cfg.apiUrl) localStorage.setItem('sepep_api_url', cfg.apiUrl);
      } catch (e) {
        console.error(e);
        setError('Failed to load configuration');
      }
      const tick = async () => {
        try {
          const data = await fetchSummary();
          setHouses(data.houses);
          setRows(data.rows);
          setLastUpdated(new Date().toLocaleString());
          setLiveMessage(`Scores updated ${new Date().toLocaleTimeString()}`);
          setError('');
        } catch (e: any) {
          console.error(e);
          setError(e.message || 'Failed to fetch scores');
        }
      };
      await tick();
      const id = setInterval(tick, Number((import.meta as any).env?.VITE_POLL_MS ?? 15000));
      return () => clearInterval(id);
    })();
  }, []);

  const latest = toResults(rows).slice(0, 10);

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
        {error && <div className="card pad text-danger bg-danger/10 border-danger/20">{error}</div>}

        <Card title="House Championship">
          <Ladder houses={houses} />
        </Card>

        <Card title="Latest Matches">
          <div className="space-y-3">
            {latest.map((m,i)=>(
              <div
                key={i}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-1 sm:gap-0 bg-white odd:bg-slate-50 rounded-lg p-3"
              >
                <span className="text-mbhs-navy font-medium break-words">{m.homeTeam} vs {m.awayTeam}</span>
                <span className="font-bold text-mbhs-navy text-left sm:text-right">{m.score}</span>
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
