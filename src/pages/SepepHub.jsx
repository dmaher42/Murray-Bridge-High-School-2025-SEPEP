import React, { useState } from 'react';
import { useSepepData } from '../lib/useSepepData.js';

export default function SepepHub() {
  const [showInfo, setShowInfo] = useState(false);
  const { fixtures, scoreboard, loading } = useSepepData();

  return (
    <div className="max-w-screen-md mx-auto">
      <h1 className="text-3xl font-bold mb-4">SEPEP Hub</h1>
      <p className="mb-4">
        Welcome to the SEPEP Hub. Explore information about the tournament and
        track all the latest updates.
      </p>
      <button
        onClick={() => setShowInfo(!showInfo)}
        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded"
      >
        {showInfo ? 'Hide' : 'Show'} Info
      </button>
      {showInfo && (
        <div className="info-box">
          <p>
            This hub page demonstrates how markup and scripts from a standalone
            HTML page can be moved into a React component using hooks for state
            management.
          </p>
        </div>
      )}

      {loading ? (
        <p className="mt-6">Loading data...</p>
      ) : (
        <>
          <section className="mt-6">
            <h2 className="text-xl font-semibold mb-2">Scoreboard</h2>
            {scoreboard.length ? (
              <ul>
                {scoreboard.map(game => (
                  <li
                    key={game.matchId}
                    className="flex justify-between border-b py-1"
                  >
                    <span>
                      {game.homeTeam} vs {game.awayTeam}
                    </span>
                    <span>
                      {game.homePoints} - {game.awayPoints}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p>No results yet.</p>
            )}
          </section>

          <section className="mt-6">
            <h2 className="text-xl font-semibold mb-2">Fixtures</h2>
            {fixtures.length ? (
              <ul>
                {fixtures.slice(0, 5).map(fx => (
                  <li key={fx.id} className="border-b py-1">
                    {fx.round}: {fx.homeTeam} vs {fx.awayTeam}
                  </li>
                ))}
              </ul>
            ) : (
              <p>No fixtures available.</p>
            )}
          </section>
        </>
      )}
    </div>
  );
}
