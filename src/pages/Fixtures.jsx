import React, { useEffect, useState } from 'react';
import { getFixtures } from '../lib/dataApi.js';

export default function Fixtures() {
  const [rounds, setRounds] = useState([]);
  useEffect(() => {
    getFixtures().then(setRounds);
  }, []);
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Fixtures & Results</h2>
      {rounds.map(r => (
        <div key={r.round} className="mb-4">
          <h3 className="font-medium">Round {r.round} - {r.date}</h3>
          <ul className="ml-4 list-disc">
            {r.matches.map(m => (
              <li key={m.id}>{m.home} vs {m.away} @ {m.venue} {m.time}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
