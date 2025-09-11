import React, { useEffect, useState } from 'react';
import { getFixtures } from '../lib/dataApi.js';

export default function Fixtures() {
  const [rounds, setRounds] = useState([]);
  useEffect(() => {
    getFixtures().then(setRounds);
  }, []);
  return (
    <section className="max-w-5xl mx-auto py-10 space-y-6">
      <h2 className="text-3xl font-semibold tracking-tight">Fixtures & Results</h2>
      <div className="bg-white shadow-sm rounded-xl p-6 space-y-4">
        {rounds.map(r => (
          <div key={r.round} className="">
            <h3 className="font-medium">Round {r.round} - {r.date}</h3>
            <ul className="ml-4 list-disc">
              {r.matches.map(m => (
                <li key={m.id}>{m.home} vs {m.away} @ {m.venue} {m.time}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </section>
  );
}
