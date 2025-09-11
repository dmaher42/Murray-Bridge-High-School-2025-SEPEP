import React from 'react';
export default function Stats() {
  return (
    <section id="stats" className="py-8 sm:py-10 lg:py-14">
      <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">
        Stats
        <span className="mt-2 block h-1 w-16 bg-gradient-to-r from-fuchsia-500 to-cyan-500 rounded-full"></span>
      </h2>
      <div className="mt-6 rounded-2xl ring-1 ring-accent/20 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-slate-900/60 dark:ring-accent/30 p-5 sm:p-6">
        <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">Statistics coming soon.</p>
      </div>
    </section>
  );
}
