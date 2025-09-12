import React, { useEffect, useState } from 'react';
import { getFixtures, getResults } from '../lib/dataApi.js';

export default function Fixtures() {
  const inputClass =
    'block w-full rounded-xl border-slate-300/60 bg-white/80 dark:bg-slate-900/60 px-3 py-2 focus:ring-2 focus:ring-slate-900/20 outline-none';

  const [rounds, setRounds] = useState([]);
  const [division, setDivision] = useState('');
  const [round, setRound] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [fx, { results }] = await Promise.all([getFixtures(), getResults()]);
        const merged = fx.map(r => ({
          ...r,
          matches: r.matches.map(m => {
            const res = results.find(res => res.matchId === m.id) || {};
            return { ...m, ...res };
          }),
        }));
        setRounds(merged);
      } catch (err) {
        setError('Failed to load fixtures');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const divisions = Array.from(new Set(rounds.flatMap(r => r.matches.map(m => m.division))));
  const roundNumbers = Array.from(new Set(rounds.map(r => r.round)));

  const filteredRounds = rounds
    .filter(r => (!round || r.round === Number(round)))
    .filter(r => (!date || r.date === date))
    .map(r => ({
      ...r,
      matches: r.matches.filter(m => (!division || m.division === division)),
    }))
    .filter(r => r.matches.length > 0);

  const statusClasses = {
    Scheduled: 'bg-slate-50 text-slate-900 ring-slate-200',
    Live: 'bg-yellow-50 text-yellow-800 ring-yellow-300',
    Final: 'bg-green-50 text-green-700 ring-green-300',
  };

  return (
    <section id="fixtures" className="py-8 sm:py-10 lg:py-14">
      <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">
        Fixtures & Results
      </h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-3">
        <select className={inputClass} value={division} onChange={e => setDivision(e.target.value)}>
          <option value="">All Divisions</option>
          {divisions.map(d => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <select className={inputClass} value={round} onChange={e => setRound(e.target.value)}>
          <option value="">All Rounds</option>
          {roundNumbers.map(r => (
            <option key={r} value={r}>
              {`Round ${r}`}
            </option>
          ))}
        </select>
        <input type="date" className={inputClass} value={date} onChange={e => setDate(e.target.value)} />
      </div>
        <div className="mt-6 space-y-6">
          {loading && <p>Loading fixtures...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {!loading && !error &&
            filteredRounds.map(r => (
              <div key={r.round} className="rounded-2xl overflow-hidden ring-1 ring-black/5">
                <div className="px-4 py-2 bg-slate-50/80 dark:bg-slate-800/40 text-slate-500 uppercase text-xs tracking-wide">
                  Round {r.round} – {r.date}
                </div>
                <ul className="space-y-2 p-4">
                  {r.matches.map(m => (
                    <li key={m.id}>
                      <div className="rounded-2xl p-4 ring-1 ring-transparent hover:ring-black/5 transition hover:shadow-sm bg-white/80 dark:bg-slate-900/60 flex items-center justify-between">
                        <span className="font-medium text-slate-900 dark:text-slate-100">
                          {m.home} vs {m.away}
                        </span>
                        <span className="flex items-center gap-2 text-sm text-slate-500">
                          {m.venue} {m.time}
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 ${
                              statusClasses[m.status || 'Scheduled']
                            }`}
                          >
                            {m.status || 'Scheduled'}
                          </span>
                        </span>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
        </div>
    </section>
  );
}
