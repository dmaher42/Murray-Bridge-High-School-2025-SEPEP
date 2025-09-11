import React, { useEffect, useState } from 'react';
import { getFixtures } from '../lib/dataApi.js';

export default function Fixtures() {
  const [rounds, setRounds] = useState([]);
  useEffect(() => {
    getFixtures().then(setRounds);
  }, []);
  return (
    <section id="fixtures" className="py-8 sm:py-10 lg:py-14">
      <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">
        Fixtures & Results
        <span className="mt-2 block h-1 w-16 bg-gradient-to-r from-fuchsia-500 to-cyan-500 rounded-full"></span>
      </h2>
      <div className="mt-6 space-y-6">
          {rounds.map(r => (
            <div key={r.round} className="rounded-2xl overflow-hidden ring-1 ring-accent/20">
              <div className="px-4 py-2 bg-gradient-to-r from-fuchsia-500/10 to-cyan-500/10 text-slate-700 dark:text-slate-300 uppercase text-xs tracking-wide">Round {r.round} – {r.date}</div>
              <ul className="divide-y divide-slate-200/60 dark:divide-slate-800">
              {r.matches.map(m => (
                <li key={m.id} className="p-4 flex items-center justify-between">
                  <span className="font-medium text-slate-900 dark:text-slate-100">{m.home} vs {m.away}</span>
                  <span className="flex items-center gap-2 text-sm text-slate-500">
                    {m.venue} {m.time}
                    <span className="inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ring-1 bg-accent/10 text-accent ring-accent/20">Scheduled</span>
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
