import React from 'react';
import ReactDOM from 'react-dom/client';
import '../index.css';

function TeacherApp() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-mbhs-white via-slate-50 to-mbhs-white">
      <header className="bg-mbhs-navy text-white">
        <div className="mx-auto flex max-w-4xl flex-col gap-2 px-4 py-6 text-center">
          <h1 className="text-3xl font-bold">SEPEP Teacher Hub</h1>
          <p className="text-white/80">Live management happens directly in Google Sheets.</p>
        </div>
      </header>

      <main className="mx-auto flex max-w-4xl flex-col gap-4 px-4 py-12">
        <div className="rounded-2xl border border-slate-200 bg-white/90 p-6 text-center shadow-sm">
          <h2 className="text-2xl font-semibold text-mbhs-navy">Read-only access</h2>
          <p className="mt-3 text-mbhs-navy/70">
            The public SEPEP site now reads live fixtures and results from the official Google Sheets
            backend. Teachers can continue updating scores in Sheets—no extra configuration is
            required here.
          </p>
          <p className="mt-3 text-mbhs-navy/70">
            This page remains for reference only and does not include editing tools or form embeds.
            Please use the shared spreadsheets for any updates.
          </p>
        </div>
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(<TeacherApp />);
