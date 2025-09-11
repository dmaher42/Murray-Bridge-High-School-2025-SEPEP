import React from 'react';
import { getResults, saveFixtures, refreshAll } from '../lib/dataApi.js';

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

  async function handleRefresh() {
    await refreshAll();
    alert('Data refreshed');
  }
  return (
    <section id="admin" className="py-8 sm:py-10 lg:py-14">
      <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">Admin</h2>
      <div className="mt-6 rounded-2xl ring-1 ring-black/5 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-slate-900/60 dark:ring-white/10 p-5 sm:p-6 space-y-4">
        <p className="rounded-xl bg-brand-50 p-4 text-sm text-slate-700 dark:bg-brand-400/10 dark:text-slate-200">
          Use the forms below to submit updates. After submitting a form, click <em>Refresh Data</em> to reload the latest information.
        </p>
        <div className="flex flex-wrap gap-4">
          <a
            href="https://forms.gle/PLACEHOLDER_RESULTS"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 text-white px-4 py-2 hover:bg-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700"
          >
            Results Form
          </a>
          <a
            href="https://forms.gle/PLACEHOLDER_FIXTURES"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 text-white px-4 py-2 hover:bg-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700"
          >
            Fixtures Form
          </a>
          <button
            className="inline-flex items-center gap-2 rounded-xl bg-brand-600 text-white px-4 py-2 hover:bg-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700"
            onClick={handleRefresh}
          >
            Refresh Data
          </button>
        </div>
        <button
          className="inline-flex items-center gap-2 rounded-xl bg-brand-600 text-white px-4 py-2 hover:bg-brand-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700"
          onClick={exportData}
        >
          Export Results JSON
        </button>
        <div className="space-y-2">
          <label className="block font-medium text-slate-900 dark:text-slate-200">Upload Fixtures JSON</label>
          <input className="block w-full rounded-xl border-slate-300/60 bg-white/80 dark:bg-slate-900/60 px-3 py-2 focus:ring-2 focus:ring-slate-900/20 outline-none" type="file" accept="application/json" onChange={importFixtures} />
        </div>
      </div>
    </section>
  );
}
