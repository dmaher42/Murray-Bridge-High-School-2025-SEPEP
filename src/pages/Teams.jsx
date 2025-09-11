import React, { useEffect, useState } from 'react';
import { getTeams } from '../lib/dataApi.js';

export default function Teams() {
  const [divisions, setDivisions] = useState([]);
  useEffect(() => { getTeams().then(setDivisions); }, []);
  return (
    <section id="teams" className="py-8 sm:py-10 lg:py-14">
      <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">Teams & Profiles</h2>
      <div className="mt-6 space-y-10">
        {divisions.map(d => (
          <div key={d.id} className="space-y-4">
            <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{d.name}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {d.teams.map(t => (
                <div key={t.id} className="rounded-2xl ring-1 ring-black/5 p-5 bg-white/80 dark:bg-slate-900/60">
                  <div className="font-medium text-slate-900 dark:text-slate-100">{t.name}</div>
                  <div className="mt-1 text-sm text-slate-600 dark:text-slate-300">Coach {t.coach}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
