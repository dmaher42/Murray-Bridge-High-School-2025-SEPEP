import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import '../index.css';
import { loadConfig } from '../lib/config';
import { fetchSummary } from '../lib/api';

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

  const sortedHouses = Object.entries(houses).sort(([,a],[,b]) => Number(b)-Number(a));
  const latest = toResults(rows).slice(0, 10);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-blue-50 to-green-50">
      <header className="bg-white/80 backdrop-blur-lg border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-800">SEPEP Student Hub</h1>
          <div className="text-xs text-slate-500">Last update: {lastUpdated || '—'}</div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-8 space-y-8">
        {error && <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-red-700">{error}</div>}

        <section className="rounded-2xl border border-white/20 bg-white/80 p-6 shadow-xl">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">House Championship</h2>
          <div className="space-y-3">
            {sortedHouses.map(([house,score])=>(
              <div key={house} className="flex items-center justify-between">
                <span className="font-medium text-slate-800">{house}</span>
                <span className="text-slate-700">{score}</span>
              </div>
            ))}
            {!sortedHouses.length && <p className="text-slate-600">No data yet.</p>}
          </div>
        </section>

        <section className="rounded-2xl border border-white/20 bg-white/80 p-6 shadow-xl">
          <h2 className="text-xl font-semibold text-slate-800 mb-4">Latest Matches</h2>
          <div className="space-y-3">
            {latest.map((m,i)=>(
              <div key={i} className="flex items-center justify-between bg-slate-50 rounded-lg p-3">
                <span className="text-slate-800 font-medium">{m.homeTeam} vs {m.awayTeam}</span>
                <span className="font-bold text-slate-900">{m.score}</span>
              </div>
            ))}
            {!latest.length && <p className="text-slate-600">No recent results yet.</p>}
          </div>
        </section>
      </main>

      <footer className="text-center text-xs text-slate-500 py-6">© SEPEP</footer>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(<StudentApp />);
