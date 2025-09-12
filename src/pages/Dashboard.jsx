import React from 'react';
import * as XLSX from 'xlsx';

export default function Dashboard() {
  return (
    <div>
      <section className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-br from-emerald-100 to-teal-200 text-center px-4">
        <h1 className="text-5xl sm:text-6xl font-bold bg-gradient-to-r from-emerald-400 to-teal-600 text-transparent bg-clip-text mb-8">
          SEPEP Tournament Hub
        </h1>
        <a href="#dashboard" className="px-6 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white">
          Explore Dashboard
        </a>
      </section>

      <section id="dashboard" className="py-8 sm:py-10 lg:py-14 text-center">
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
