import React, { useEffect, useState } from 'react';
import { getTeams } from '../lib/dataApi.js';

export default function Teams() {
  const [divisions, setDivisions] = useState([]);
  useEffect(() => { getTeams().then(setDivisions); }, []);
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Teams & Profiles</h2>
      {divisions.map(d => (
        <div key={d.id} className="mb-4">
          <h3 className="font-medium">{d.name}</h3>
          <ul className="ml-4 list-disc">
            {d.teams.map(t => (
              <li key={t.id}>{t.name} - Coach {t.coach}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
