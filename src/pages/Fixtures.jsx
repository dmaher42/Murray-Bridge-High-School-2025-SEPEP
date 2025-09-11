import React, { useEffect, useState } from 'react';
import { getFixtures } from '../lib/dataApi.js';

export default function Fixtures() {
  const [rounds, setRounds] = useState([]);
  useEffect(() => {
    getFixtures().then(setRounds);
  }, []);
  return (
    <section id="fixtures" className="py-8 sm:py-10 lg:py-14">
      <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">Fixtures & Results</h2>
      <div className="mt-6 space-y-6">
        {rounds.map(r => (
          <div key={r.round} className="rounded-2xl overflow-hidden ring-1 ring-black/5">
            <div className="px-4 py-2 bg-slate-50/80 dark:bg-slate-800/40 text-slate-500 uppercase text-xs tracking-wide">Round {r.round} – {r.date}</div>
            <ul className="divide-y divide-slate-200/60 dark:divide-slate-800">
              {r.matches.map(m => (
                <li key={m.id} className="p-4 flex items-center justify-between">
                  <span className="font-medium text-slate-900 dark:text-slate-100">{m.home} vs {m.away}</span>
                  <span className="flex items-center gap-2 text-sm text-slate-500">
                    {m.venue} {m.time}
                    <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 bg-slate-50 text-slate-900 ring-slate-200">Scheduled</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
