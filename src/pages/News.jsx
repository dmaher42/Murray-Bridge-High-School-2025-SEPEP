import React from 'react';
export default function News() {
  return (
    <section id="news" className="py-8 sm:py-10 lg:py-14">
      <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-slate-900 dark:text-white">Announcements & Media</h2>
      <div className="mt-6 rounded-2xl ring-1 ring-black/5 bg-white/80 backdrop-blur supports-[backdrop-filter]:bg-white/60 dark:bg-slate-900/60 dark:ring-white/10 p-5 sm:p-6">
        <p className="text-sm leading-7 text-slate-600 dark:text-slate-300">No announcements yet.</p>
      </div>
    </section>
  );
}
