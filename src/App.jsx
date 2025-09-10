import React, { useState, useEffect, useCallback } from 'react';
import Select from './components/Select.jsx';
import Button from './components/Button.jsx';
import Toast from './components/Toast.jsx';
import TeamsView from './views/TeamsView.jsx';
import FixturesView from './views/FixturesView.jsx';
import ProfilesView from './views/ProfilesView.jsx';
import LadderView from './views/LadderView.jsx';
import AdminView from './views/AdminView.jsx';
import { readAll, upsertTeam, upsertFixture, upsertResult, deleteFixtureRemote } from './utils/api.js';

const YEARS = ['2025', '2024', '2023'];

export default function App() {
  const [division, setDivision] = useState(YEARS[0]);
  const [loading, setLoading] = useState({ type: null, message: '' });
  const [toast, setToast] = useState({ message: '', type: 'success' });
  const [error, setError] = useState(null);
  const [state, setState] = useState({
    settings: { seasonTitle: 'SEEPEP Fixture & Results', classLine: 'HPE' },
    divisions: Object.fromEntries(YEARS.map(y => [y, { teams: [], fixtures: [], results: [] }]))
  });
  const data = state.divisions[division];

  const setLoadingState = useCallback((type, message = '') => setLoading({ type, message }), []);
  const showToast = useCallback((message, type = 'success') => setToast({ message, type }), []);
  const clearToast = useCallback(() => setToast({ message: '', type: 'success' }), []);

  const refresh = useCallback(async () => {
    setLoadingState('refresh', 'Loading division data...');
    setError(null);
    try {
      const { teams = [], fixtures = [], results = [] } = await readAll(division);
      setState(s => ({ ...s, divisions: { ...s.divisions, [division]: { teams, fixtures, results } } }));
    } catch (e) {
      console.error('Refresh error:', e);
      setError(`Failed to load data: ${e.message}`);
    } finally {
      setLoadingState(null);
    }
  }, [division, setLoadingState]);

  useEffect(() => { refresh(); }, [refresh]);

  const handleUpsertTeam = useCallback(async (team) => {
    setLoadingState('team', 'Saving team...');
    try {
      await upsertTeam(team);
      setState(s => {
        const list = s.divisions[division].teams;
        const exists = list.some(t => t.id === team.id);
        const teams = exists ? list.map(t => t.id === team.id ? team : t) : [...list, team];
        return { ...s, divisions: { ...s.divisions, [division]: { ...s.divisions[division], teams } } };
      });
      showToast('Team saved successfully');
    } catch (e) {
      console.error('Team upsert error:', e);
      showToast(`Failed to save team: ${e.message}`, 'error');
      throw e;
    } finally {
      setLoadingState(null);
    }
  }, [division, setLoadingState, showToast]);

  const handleUpsertFixture = useCallback(async (fixture) => {
    setLoadingState('fixture', 'Saving fixture...');
    try {
      await upsertFixture(fixture);
      setState(s => {
        const list = s.divisions[division].fixtures;
        const exists = list.some(x => x.id === fixture.id);
        const fixtures = exists ? list.map(x => x.id === fixture.id ? fixture : x) : [...list, fixture];
        return { ...s, divisions: { ...s.divisions, [division]: { ...s.divisions[division], fixtures } } };
      });
      showToast('Fixture saved successfully');
    } catch (e) {
      console.error('Fixture upsert error:', e);
      showToast(`Failed to save fixture: ${e.message}`, 'error');
      throw e;
    } finally {
      setLoadingState(null);
    }
  }, [division, setLoadingState, showToast]);

  const handleUpsertResult = useCallback(async (result) => {
    setLoadingState('result', 'Saving score...');
    try {
      await upsertResult(result);
      setState(s => {
        const list = s.divisions[division].results;
        const exists = list.some(x => x.id === result.id);
        const results = exists ? list.map(x => x.id === result.id ? result : x) : [...list, result];
        return { ...s, divisions: { ...s.divisions, [division]: { ...s.divisions[division], results } } };
      });
      showToast('Score saved successfully');
    } catch (e) {
      console.error('Result upsert error:', e);
      showToast(`Failed to save score: ${e.message}`, 'error');
    } finally {
      setLoadingState(null);
    }
  }, [division, setLoadingState, showToast]);

  const handleDeleteFixture = useCallback(async (id) => {
    if (!confirm('Delete this fixture and its result? This action cannot be undone.')) return;
    setLoadingState('delete', 'Deleting fixture...');
    try {
      await deleteFixtureRemote(id);
      setState(s => {
        const fixtures = s.divisions[division].fixtures.filter(f => f.id !== id);
        const results = s.divisions[division].results.filter(r => r.id !== id);
        return { ...s, divisions: { ...s.divisions, [division]: { ...s.divisions[division], fixtures, results } } };
      });
      showToast('Fixture deleted successfully');
    } catch (e) {
      console.error('Delete fixture error:', e);
      showToast(`Failed to delete fixture: ${e.message}`, 'error');
    } finally {
      setLoadingState(null);
    }
  }, [division, setLoadingState, showToast]);

  const handleImportJSON = useCallback((imported) => {
    setState(s => ({ ...s, divisions: { ...s.divisions, [division]: imported } }));
    showToast('Data imported successfully (local only)');
  }, [division, showToast]);

  const handlePushAll = useCallback(async () => {
    setLoadingState('push', 'Pushing all data to backend...');
    try {
      const promises = [
        ...data.teams.map(t => upsertTeam(t)),
        ...data.fixtures.map(f => upsertFixture(f)),
        ...data.results.map(r => upsertResult(r))
      ];
      await Promise.all(promises);
      showToast('All data pushed to backend successfully');
    } catch (e) {
      console.error('Push all error:', e);
      showToast(`Failed to push data: ${e.message}`, 'error');
    } finally {
      setLoadingState(null);
    }
  }, [data, setLoadingState, showToast]);

  const [tab, setTab] = useState('teams');
  const tabs = [
    { id: 'teams', label: 'Teams', count: data.teams.length },
    { id: 'fixtures', label: 'Fixtures', count: data.fixtures.length },
    { id: 'profiles', label: 'Profiles' },
    { id: 'ladder', label: 'Ladder' },
    { id: 'admin', label: 'Admin' }
  ];

  return (
    <div className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-10 backdrop-blur bg-white/80 border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-4 py-3 flex flex-wrap items-center gap-3">
          <div className="text-lg font-semibold">{state.settings.seasonTitle}</div>
          <div className="grow" />
          <Select label="Division" value={division} onChange={setDivision} options={YEARS.map(y => ({ label: y, value: y }))} />
          <Button variant="ghost" onClick={refresh} loading={loading.type === 'refresh'} ariaLabel="Refresh data">{loading.type === 'refresh' ? loading.message : 'Refresh'}</Button>
        </div>
        <div className="mx-auto max-w-6xl px-4 pb-3">
          <nav className="flex gap-2" role="tablist">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`h-10 px-4 rounded-xl text-sm font-medium border transition ${tab === t.id ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'}`}
                role="tab"
                aria-selected={tab === t.id}
                aria-controls={`panel-${t.id}`}
              >
                {t.label}
                {t.count !== undefined && (
                  <span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${tab === t.id ? 'bg-indigo-500' : 'bg-slate-200 text-slate-600'}`}>{t.count}</span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-6" role="main">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700" role="alert">
            <div className="font-medium">Error</div>
            <div className="text-sm">{error}</div>
            <Button variant="ghost" onClick={() => setError(null)} className="mt-2">Dismiss</Button>
          </div>
        )}
        <div id={`panel-${tab}`} role="tabpanel">
          {tab === 'teams' && <TeamsView division={division} data={data} onUpsertTeam={handleUpsertTeam} />}
          {tab === 'fixtures' && <FixturesView division={division} data={data} onUpsertFixture={handleUpsertFixture} onUpsertResult={handleUpsertResult} onDeleteFixture={handleDeleteFixture} />}
          {tab === 'profiles' && <ProfilesView division={division} data={data} onUpsertTeam={handleUpsertTeam} />}
          {tab === 'ladder' && <LadderView division={division} data={data} />}
          {tab === 'admin' && <AdminView division={division} data={data} onImportJSON={handleImportJSON} onPushAll={handlePushAll} />}
        </div>
      </main>
      <footer className="mx-auto max-w-6xl px-4 pb-8 text-xs text-slate-500">
        Backend: Google Apps Script · Frontend: React + Tailwind · {loading.type && <span className="ml-2 text-indigo-600">{loading.message || 'Processing...'}</span>}
      </footer>
      <Toast message={toast.message} type={toast.type} onClose={clearToast} />
    </div>
  );
}
