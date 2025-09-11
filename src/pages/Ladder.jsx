import React, { useEffect, useState } from 'react';
import { getTeams, getFixtures, getResults } from '../lib/dataApi.js';
import { computeLadder } from '../lib/ladder.js';

export default function Ladder() {
  const [rows, setRows] = useState([]);
  useEffect(() => {
    async function load() {
      const teams = (await getTeams())[0]?.teams || [];
      const fixtures = (await getFixtures()).flatMap(r => r?.matches || []);
      const results = (await getResults()).results || [];
      setRows(computeLadder(teams, fixtures, results));
    }
    load();
  }, []);
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Ladder / Standings</h2>
      <table className="min-w-full text-sm">
        <thead>
          <tr className="text-left border-b">
            <th className="p-2">Team</th>
            <th className="p-2">GP</th>
            <th className="p-2">W</th>
            <th className="p-2">L</th>
            <th className="p-2">D</th>
            <th className="p-2">PF</th>
            <th className="p-2">PA</th>
            <th className="p-2">Pts</th>
            <th className="p-2">%</th>
          </tr>
        </thead>
        <tbody>
          {rows.map(r => (
            <tr key={r.teamId} className="border-b">
              <td className="p-2">{r.name}</td>
              <td className="p-2">{r.GP}</td>
              <td className="p-2">{r.W}</td>
              <td className="p-2">{r.L}</td>
              <td className="p-2">{r.D}</td>
              <td className="p-2">{r.PF}</td>
              <td className="p-2">{r.PA}</td>
              <td className="p-2">{r.Pts}</td>
              <td className="p-2">{r['%']}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
