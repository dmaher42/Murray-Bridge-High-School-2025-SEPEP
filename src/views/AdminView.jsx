import React, { useState, useCallback } from 'react';
import Section from '../components/Section.jsx';
import Button from '../components/Button.jsx';

export default function AdminView({ division, data, onImportJSON, onPushAll }) {
  const [importError, setImportError] = useState('');
  const [loading, setLoading] = useState({ export: false, push: false });
  const exportJSON = useCallback(() => {
    setLoading(prev => ({ ...prev, export: true }));
    try {
      const payload = JSON.stringify({ division, data }, null, 2);
      const blob = new Blob([payload], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url; a.download = `seepep-backup-${division}-${new Date().toISOString().split('T')[0]}.json`;
      a.click(); URL.revokeObjectURL(url);
    } finally { setLoading(prev => ({ ...prev, export: false })); }
  }, [division, data]);
  const importJSON = useCallback(async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    setImportError('');
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!parsed || !parsed.data) throw new Error('Invalid file format - missing data property');
      const { teams = [], fixtures = [], results = [] } = parsed.data;
      if (!Array.isArray(teams) || !Array.isArray(fixtures) || !Array.isArray(results)) throw new Error('Invalid data structure');
      onImportJSON(parsed.data);
    } catch (err) { setImportError(err.message); }
    e.target.value = '';
  }, [onImportJSON]);
  const handlePushAll = useCallback(async () => {
    if (!confirm('Push all teams, fixtures, and results to the backend? This will overwrite existing data.')) return;
    setLoading(prev => ({ ...prev, push: true }));
    try { await onPushAll(); } finally { setLoading(prev => ({ ...prev, push: false })); }
  }, [onPushAll]);
  return (
    <div className="grid gap-6">
      <Section title="Backup & Restore">
        <div className="grid md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <h3 className="font-medium text-slate-700">Export Data</h3>
            <p className="text-sm text-slate-600">Download current data as JSON backup</p>
            <Button onClick={exportJSON} loading={loading.export}>Export JSON</Button>
          </div>
          <div className="space-y-2">
            <h3 className="font-medium text-slate-700">Import Data</h3>
            <p className="text-sm text-slate-600">Upload JSON backup to restore data</p>
            <label className="inline-flex items-center gap-2 cursor-pointer">
              <input type="file" accept="application/json,.json" onChange={importJSON} className="text-sm text-slate-500 file:mr-2 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
            </label>
            {importError && <p className="text-sm text-red-600" role="alert">Import failed: {importError}</p>}
          </div>
          <div className="space-y-2">
            <h3 className="font-medium text-slate-700">Sync to Backend</h3>
            <p className="text-sm text-slate-600">Push all local data to Google Sheets</p>
            <Button variant="ghost" onClick={handlePushAll} loading={loading.push}>Push All to Sheets</Button>
          </div>
        </div>
      </Section>
      <Section title="Data Statistics">
        <div className="grid md:grid-cols-4 gap-4">
          <div className="bg-slate-50 rounded-xl p-4 text-center"><div className="text-2xl font-bold text-slate-800">{data.teams.length}</div><div className="text-sm text-slate-600">Teams</div></div>
          <div className="bg-slate-50 rounded-xl p-4 text-center"><div className="text-2xl font-bold text-slate-800">{data.fixtures.length}</div><div className="text-sm text-slate-600">Fixtures</div></div>
          <div className="bg-slate-50 rounded-xl p-4 text-center"><div className="text-2xl font-bold text-slate-800">{data.results.length}</div><div className="text-sm text-slate-600">Results</div></div>
          <div className="bg-slate-50 rounded-xl p-4 text-center"><div className="text-2xl font-bold text-slate-800">{data.fixtures.length > 0 ? Math.round((data.results.length / data.fixtures.length) * 100) : 0}%</div><div className="text-sm text-slate-600">Complete</div></div>
        </div>
      </Section>
      <Section title="Debug Data">
        <details className="group">
          <summary className="cursor-pointer text-sm font-medium text-slate-700 hover:text-slate-900">View raw data (click to expand)</summary>
          <pre className="mt-3 bg-slate-50 rounded-xl p-3 overflow-auto text-xs max-h-96">{JSON.stringify({ division, ...data }, null, 2)}</pre>
        </details>
      </Section>
    </div>
  );
}
