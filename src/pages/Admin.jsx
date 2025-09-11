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
    <section id="admin" className="py-8 sm:py-10 lg:py-14">
      <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">
        Admin
        <span className="mt-2 block h-1 w-16 bg-gradient-to-r from-fuchsia-500 to-cyan-500 rounded-full"></span>
      </h2>
      <div className="mt-6 rounded-2xl ring-1 ring-accent/20 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-slate-900/60 dark:ring-accent/30 p-5 sm:p-6 space-y-4">
        <button className="inline-flex items-center gap-2 rounded-xl bg-accent text-white px-4 py-2 hover:brightness-110 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent" onClick={exportData}>
          Export Results JSON
        </button>
        <div className="space-y-2">
          <label className="block font-medium text-slate-900 dark:text-slate-200">Upload Fixtures JSON</label>
          <input className="block w-full rounded-xl border-slate-300/60 bg-white/80 dark:bg-slate-900/60 px-3 py-2 focus:ring-2 focus:ring-accent/20 outline-none" type="file" accept="application/json" onChange={importFixtures} />
        </div>
      </div>
    </section>
  );
}
