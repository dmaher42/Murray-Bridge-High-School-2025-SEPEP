import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import '../index.css';
import { loadConfig } from '../lib/config';

function TeacherApp(){
  const [formUrl, setFormUrl] = useState<string>('');
  const [apiUrl, setApiUrl] = useState<string>('');

  useEffect(() => {
    (async () => {
      const cfg = await loadConfig();
      if (cfg.apiUrl) { localStorage.setItem('sepep_api_url', cfg.apiUrl); setApiUrl(cfg.apiUrl); }
      if (cfg.staffFormUrl) setFormUrl(cfg.staffFormUrl);
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <header className="bg-white/80 backdrop-blur-lg border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-800">SEPEP Teacher</h1>
          <div className="text-xs text-slate-500 truncate max-w-[60%]">API: {apiUrl || 'not set (see sepep.config.json)'}</div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-4">
        {!formUrl ? (
          <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-amber-800">
            Add your Google Form embed URL to <code>public/sepep.config.json</code>.
          </div>
        ) : (
          <div className="rounded-2xl border border-white/20 bg-white/80 p-2 shadow-xl">
            <iframe title="SEPEP Staff Form" src={formUrl} className="w-full h-[80vh] rounded-lg" allow="clipboard-write; clipboard-read"></iframe>
          </div>
        )}
        <p className="text-slate-600 text-sm">This page writes via Google Form; the Student page reads from the sheet every ~15s.</p>
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(<TeacherApp />);
