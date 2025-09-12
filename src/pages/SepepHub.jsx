import React, { useState } from 'react';

export default function SepepHub() {
  const [showInfo, setShowInfo] = useState(false);

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
    </div>
  );
}
