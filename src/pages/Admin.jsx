import React from 'react';
import { getResults, saveFixtures } from '../lib/dataApi.js';

export default function Admin() {
  async function exportData() {
    const data = await getResults();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'results.json';
    a.click();
  }

  function importFixtures(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = evt => {
      try {
        const json = JSON.parse(evt.target.result);
        const rounds = json.rounds ?? [];
        saveFixtures(rounds);
        alert('Fixtures uploaded');
      } catch (err) {
        alert('Invalid fixtures file');
      }
    };
    reader.readAsText(file);
  }
  return (
    <section className="max-w-5xl mx-auto py-10 space-y-6">
      <h2 className="text-3xl font-semibold tracking-tight">Admin</h2>
      <div className="bg-white shadow-sm rounded-xl p-6 space-y-4">
        <button className="px-3 py-2 bg-blue-600 text-white rounded" onClick={exportData}>
          Export Results JSON
        </button>
        <div>
          <label className="block mb-2 font-medium">Upload Fixtures JSON</label>
          <input type="file" accept="application/json" onChange={importFixtures} />
        </div>
      </div>
    </section>
  );
}
