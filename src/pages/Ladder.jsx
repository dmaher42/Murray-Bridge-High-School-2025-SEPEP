import React, { useEffect, useState } from 'react';
import { getTeams, getFixtures, getResults } from '../lib/dataApi.js';
import { computeLadder } from '../lib/ladder.js';

export default function Ladder() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const teams = (await getTeams())[0]?.teams || [];
        const fixtures = (await getFixtures()).flatMap(r => r?.matches || []);
        const results = (await getResults()).results || [];
        setRows(computeLadder(teams, fixtures, results));
      } catch (e) {
        setError('Failed to load ladder data. Please try again later.');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);
  return (
    <section id="ladder" className="py-8 sm:py-10 lg:py-14">
      <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">Ladder / Standings</h2>
      {loading && <div className="mt-6">Loading...</div>}
      {error && <div className="mt-6 text-red-500">{error}</div>}
      {!loading && !error && (
        <div className="mt-6 rounded-2xl ring-1 ring-black/5 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-slate-800/40 text-slate-500 uppercase text-xs tracking-wide">
                <th className="px-3 py-2 text-left font-semibold text-slate-700 dark:text-slate-200">Team</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-700 dark:text-slate-200">GP</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-700 dark:text-slate-200">W</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-700 dark:text-slate-200">L</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-700 dark:text-slate-200">D</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-700 dark:text-slate-200">PF</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-700 dark:text-slate-200">PA</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-700 dark:text-slate-200">Pts</th>
                <th className="px-3 py-2 text-left font-semibold text-slate-700 dark:text-slate-200">%</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200/60 dark:divide-slate-800">
              {rows.map(r => (
                <tr key={r.teamId} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition">
                  <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{r.name}</td>
                  <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{r.GP}</td>
                  <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{r.W}</td>
                  <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{r.L}</td>
                  <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{r.D}</td>
                  <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{r.PF}</td>
                  <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{r.PA}</td>
                  <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{r.Pts}</td>
                  <td className="px-3 py-2 text-slate-600 dark:text-slate-300">{r['%']}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
