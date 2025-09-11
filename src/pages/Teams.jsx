import React, { useEffect, useState } from 'react';
import { getTeams } from '../lib/dataApi.js';

export default function Teams() {
  const [divisions, setDivisions] = useState([]);
  useEffect(() => { getTeams().then(setDivisions); }, []);
  return (
    <section className="max-w-5xl mx-auto py-10 space-y-6">
      <h2 className="text-3xl font-semibold tracking-tight">Teams & Profiles</h2>
      <div className="bg-white shadow-sm rounded-xl p-6 space-y-4">
        {divisions.map(d => (
          <div key={d.id} className="">
            <h3 className="font-medium">{d.name}</h3>
            <ul className="ml-4 list-disc">
              {d.teams.map(t => (
                <li key={t.id}>{t.name} - Coach {t.coach}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
