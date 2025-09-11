import React from 'react';
import { getResults } from '../lib/dataApi.js';

export default function Admin() {
  async function exportData() {
    const data = await getResults();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'results.json';
    a.click();
  }
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Admin</h2>
      <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={exportData}>Export Results JSON</button>
    </div>
  );
}
