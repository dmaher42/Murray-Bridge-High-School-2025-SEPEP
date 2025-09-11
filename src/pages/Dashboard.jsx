import React from 'react';

export default function Dashboard() {
  return (
    <div>
      <section id="dashboard" className="py-8 sm:py-10 lg:py-14 text-center">
        <h1 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 dark:text-white mb-4">SEPEP Tournament Hub</h1>
        <p className="text-slate-600 dark:text-slate-300 mb-8 leading-7">Welcome to the central dashboard.</p>
        <div className="mx-auto max-w-4xl rounded-2xl ring-1 ring-black/5 overflow-hidden">
          <img
            src="https://via.placeholder.com/800x400"
            alt="Dashboard preview"
            className="w-full"
          />
        </div>
      </section>

      <section className="py-8 sm:py-10 lg:py-14 border-t border-slate-200/60 dark:border-slate-800">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="rounded-2xl ring-1 ring-black/5 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-slate-900/60 dark:ring-white/10 p-5 sm:p-6">
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Fixtures</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-7">Upcoming matches and results.</p>
          </div>
          <div className="rounded-2xl ring-1 ring-black/5 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-slate-900/60 dark:ring-white/10 p-5 sm:p-6">
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Teams</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-7">Profiles for every team.</p>
          </div>
          <div className="rounded-2xl ring-1 ring-black/5 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-slate-900/60 dark:ring-white/10 p-5 sm:p-6">
            <h3 className="text-lg font-medium text-slate-900 dark:text-white mb-2">Ladder</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 leading-7">Current standings and points.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
