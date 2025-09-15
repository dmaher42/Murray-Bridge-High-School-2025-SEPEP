import React, { useEffect, useState } from 'react';
import LiveRegion from '../components/LiveRegion';
import ReactDOM from 'react-dom/client';
import '../index.css';
import { loadConfig } from '../lib/config';
import Card from '../components/ui/Card';

function TeacherApp(){
  const [formUrl, setFormUrl] = useState<string>('');
  const [apiUrl, setApiUrl] = useState<string>('');
  const [liveMessage, setLiveMessage] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    (async () => {
      try {
        const cfg = await loadConfig();
        if (cfg.apiUrl) { localStorage.setItem('sepep_api_url', cfg.apiUrl); setApiUrl(cfg.apiUrl); }
        if (cfg.staffFormUrl) setFormUrl(cfg.staffFormUrl);
        setLiveMessage(`Scores updated ${new Date().toLocaleTimeString()}`);
      } catch (e) {
        console.error(e);
        setError('Failed to load configuration');
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-mbhs-white via-slate-50 to-mbhs-white">
      <LiveRegion message={liveMessage} />
      <header className="bg-mbhs-navy text-white sticky top-0 z-40">
        <div className="max-w-6xl mx-auto pad flex items-center justify-between">
          <h1 className="text-2xl font-bold">SEPEP Teacher</h1>
          <div className="muted truncate max-w-[60%] text-white/80">API: {apiUrl || 'not set (see sepep.config.json)'}</div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto pad space-y-4">
        {error && <div className="card pad text-danger bg-danger/10 border-danger/20">{error}</div>}
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
