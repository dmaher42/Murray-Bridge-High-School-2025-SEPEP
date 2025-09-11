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

  function handleRefresh() {
    refreshAll();
    window.location.reload();
  }
  return (
    <section id="admin" className="py-8 sm:py-10 lg:py-14">
      <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">Admin</h2>
      <div className="mt-6 rounded-2xl ring-1 ring-black/5 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-slate-900/60 dark:ring-white/10 p-5 sm:p-6 space-y-4">
        <div className="rounded-xl border border-slate-200/60 bg-slate-50/70 p-4 text-sm dark:bg-slate-800/40 dark:border-slate-800">
          Use the Google Forms below to update results, fixtures, and player cards. After submitting a form, click "Refresh data" to load the latest information.
        </div>
        <div className="flex flex-wrap gap-2">
          <a
            href="https://forms.gle/ENTER_RESULT_FORM"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 text-white px-4 py-2 hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
          >
            Enter Result
          </a>
          <a
            href="https://forms.gle/EDIT_FIXTURE_FORM"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 text-white px-4 py-2 hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
          >
            Edit Fixture
          </a>
          <a
            href="https://forms.gle/PLAYER_CARD_FORM"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 text-white px-4 py-2 hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
          >
            Add/Update Player Card
          </a>
        </div>
        <button
          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 text-white px-4 py-2 hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900"
          onClick={handleRefresh}
        >
          Refresh data
        </button>
        <button className="inline-flex items-center gap-2 rounded-xl bg-slate-900 text-white px-4 py-2 hover:bg-slate-800 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-slate-900" onClick={exportData}>
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
