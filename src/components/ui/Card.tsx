import React from 'react';
export default function Card({title, right, children}:{title?:React.ReactNode; right?:React.ReactNode; children:React.ReactNode}) {
  return (
    <section className="card pad">
      {(title || right) && (
        <header className="flex items-center justify-between mb-4">
          {title ? <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100">{title}</h3> : <div/>}
          {right}
        </header>
      )}
      {children}
    </section>
  );
}
