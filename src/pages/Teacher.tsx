import React, { useEffect, useState } from 'react';
import ReactDOM from 'react-dom/client';
import '../index.css';
import { loadConfig } from '../lib/config';
import Card from '../components/ui/Card';

function TeacherApp(){
  const [formUrl, setFormUrl] = useState<string>('');
  const [apiUrl, setApiUrl] = useState<string>('');

  useEffect(() => {
    (async () => {
      const cfg = await loadConfig();
      if (cfg.apiUrl) { localStorage.setItem('sepep_api_url', cfg.apiUrl); setApiUrl(cfg.apiUrl); }
      if (cfg.staffFormUrl) setFormUrl(cfg.staffFormUrl);
      document.getElementById('a11y-updates')!.textContent = `Scores updated ${new Date().toLocaleTimeString()}`;
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-blue-50 to-green-50">
      <div role="status" aria-live="polite" className="sr-only" id="a11y-updates" />
      <header className="bg-white/80 backdrop-blur-lg border-b border-white/20 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto pad flex items-center justify-between">
          <h1 className="h1">SEPEP Teacher</h1>
          <div className="muted truncate max-w-[60%]">API: {apiUrl || 'not set (see sepep.config.json)'}</div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto pad space-y-4">
        {formUrl ? (
          <Card title="Staff Results Form">
            <iframe title="SEPEP Staff Form" src={formUrl} className="w-full h-[80vh] rounded-lg" />
            <p className="muted mt-3">Submissions appear in the Student Hub within ~15s.</p>
          </Card>
        ) : (
          <div className="card pad text-warning bg-warning/10 border-warning/20">
            Add your Google Form embed URL to <code>public/sepep.config.json</code>.
          </div>
        )}
      </main>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(<TeacherApp />);
