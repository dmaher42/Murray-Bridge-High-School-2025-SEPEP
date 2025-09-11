import React, { useEffect, useState } from 'react';
import { getTeams } from '../lib/dataApi.js';

function initials(name = '') {
  return name
    .split(' ')
    .map(n => n[0] || '')
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

export default function Teams() {
  const [divisions, setDivisions] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    getTeams().then(setDivisions);
  }, []);

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
                  {t.players && t.players.length > 0 && (
                    <div className="mt-4 flex -space-x-2 overflow-hidden">
                      {t.players.slice(0, 6).map(p => (
                        <button
                          key={p.id}
                          type="button"
                          onClick={() => setSelected(p)}
                          className="relative inline-flex items-center justify-center p-2 rounded-full"
                        >
                          {p.photo ? (
                            <img
                              src={p.photo}
                              alt={p.name}
                              className="h-8 w-8 rounded-full object-cover ring-2 ring-white"
                            />
                          ) : (
                            <span className="h-8 w-8 rounded-full bg-slate-300 flex items-center justify-center text-xs font-medium text-slate-700 ring-2 ring-white">
                              {initials(p.name)}
                            </span>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="relative bg-white dark:bg-slate-800 rounded-lg p-6 max-w-sm w-full">
            <button
              type="button"
              className="absolute top-2 right-2 inline-flex items-center justify-center p-2 rounded-xl text-slate-500 hover:text-slate-700"
              onClick={() => setSelected(null)}
            >
              ×
            </button>
            {selected.photo && (
              <img
                src={selected.photo}
                alt={selected.name}
                className="w-24 h-24 rounded-full object-cover mx-auto"
              />
            )}
            <h3 className="mt-4 text-xl font-semibold text-center text-slate-900 dark:text-white">
              {selected.name}
            </h3>
            {selected.bio && (
              <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 text-center">
                {selected.bio}
              </p>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
