import React from 'react';

export default function Section({ title, children, actions }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 md:p-6">
      <div className="flex items-center justify-between gap-4 mb-3">
        <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
        {actions}
      </div>
      {children}
    </section>
  );
}
