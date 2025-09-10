import React, { useState, useCallback } from 'react';
import Section from '../components/Section.jsx';
import TextInput from '../components/TextInput.jsx';
import Select from '../components/Select.jsx';
import Button from '../components/Button.jsx';
import Table from '../components/Table.jsx';
import { validateFixture } from '../utils/validation.js';
import { uid, toInt } from '../utils/helpers.js';

export default function FixturesView({ division, data, onUpsertFixture, onUpsertResult, onDeleteFixture }) {
  const [draft, setDraft] = useState({ id: '', round: '1', date: '', time: '', court: '', homeId: '', awayId: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const teams = data.teams.filter(t => t.division === division);
  const fixtures = data.fixtures.filter(f => f.division === division);
  const results = Object.fromEntries(data.results.map(r => [r.id, r]));
  const setField = useCallback((k, v) => { setDraft(d => ({ ...d, [k]: v })); if (errors[k]) setErrors(prev => ({ ...prev, [k]: null })); }, [errors]);
  const resetDraft = useCallback(() => { setDraft({ id: '', round: '1', date: '', time: '', court: '', homeId: '', awayId: '' }); setErrors({}); }, []);
  const handleSave = useCallback(async (e) => { e.preventDefault(); const validationErrors = validateFixture(draft, fixtures); if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; } setLoading(true); try { const id = draft.id || uid(); const f = { ...draft, id, division }; await onUpsertFixture(f); resetDraft(); } catch (error) { setErrors({ submit: error.message }); } finally { setLoading(false); } }, [draft, division, fixtures, onUpsertFixture, resetDraft]);
  const saveScore = useCallback(async (id, homeScore, awayScore) => { try { await onUpsertResult({ id, homeScore: toInt(homeScore), awayScore: toInt(awayScore) }); } catch (error) { console.error('Failed to save score:', error); } }, [onUpsertResult]);
  return (
    <div className="grid gap-6">
      <Section title="Create Fixture">
        <form className="grid md:grid-cols-7 gap-3" onSubmit={handleSave}>
          <TextInput label="Round" value={draft.round} onChange={v => setField('round', v)} error={errors.round} required />
          <TextInput label="Date" type="date" value={draft.date} onChange={v => setField('date', v)} error={errors.date} required />
          <TextInput label="Time" type="time" value={draft.time} onChange={v => setField('time', v)} error={errors.time} required />
          <TextInput label="Court" value={draft.court} onChange={v => setField('court', v)} error={errors.court} required />
          <Select label="Home Team" value={draft.homeId} onChange={v => setField('homeId', v)} options={[{ label: 'Select team', value: '' }, ...teams.map(t => ({ label: t.name, value: t.id }))]} error={errors.homeId} required />
          <Select label="Away Team" value={draft.awayId} onChange={v => setField('awayId', v)} options={[{ label: 'Select team', value: '' }, ...teams.map(t => ({ label: t.name, value: t.id }))]} error={errors.awayId} required />
          <div className="flex items-end gap-2">
            <Button type="submit" loading={loading}>{draft.id ? 'Update' : 'Save'} Fixture</Button>
            <Button variant="ghost" type="button" onClick={resetDraft}>Clear</Button>
          </div>
          {errors.submit && <div className="md:col-span-7 text-sm text-red-600" role="alert">Error: {errors.submit}</div>}
        </form>
      </Section>
      <Section title="Fixtures & Results">
        <Table caption={`Fixtures and results for ${division} division`} columns={[
          { key: 'round', header: 'Round' },
          { key: 'date', header: 'Date' },
          { key: 'time', header: 'Time' },
          { key: 'court', header: 'Court' },
          { key: 'home', header: 'Home', cell: f => teams.find(t => t.id === f.homeId)?.name || '?' },
          { key: 'away', header: 'Away', cell: f => teams.find(t => t.id === f.awayId)?.name || '?' },
          { key: 'score', header: 'Score', cell: f => { const r = results[f.id] || { homeScore: '', awayScore: '' }; return (
            <div className="flex items-center gap-2">
              <input className="h-9 w-16 rounded-lg border border-slate-300 px-2 focus:ring-2 focus:ring-indigo-500" defaultValue={r.homeScore} placeholder="Home" onBlur={e => saveScore(f.id, e.target.value, r.awayScore)} aria-label={`Home score for ${teams.find(t => t.id === f.homeId)?.name || 'home team'}`} type="number" min="0" />
              <span className="text-slate-500">—</span>
              <input className="h-9 w-16 rounded-lg border border-slate-300 px-2 focus:ring-2 focus:ring-indigo-500" defaultValue={r.awayScore} placeholder="Away" onBlur={e => saveScore(f.id, r.homeScore, e.target.value)} aria-label={`Away score for ${teams.find(t => t.id === f.awayId)?.name || 'away team'}`} type="number" min="0" />
            </div>
          ); } },
          { key: 'actions', header: 'Actions', cell: f => (
            <div className="flex gap-2">
              <Button variant="ghost" ariaLabel={`Edit fixture ${f.round}`} onClick={() => setDraft(f)}>Edit</Button>
              <Button variant="danger" ariaLabel={`Delete fixture ${f.round}`} onClick={() => onDeleteFixture(f.id)}>Delete</Button>
            </div>
          ) }
        ]} rows={fixtures.sort((a, b) => (a.round.localeCompare(b.round)) || (a.date || '').localeCompare(b.date || ''))} />
      </Section>
    </div>
  );
}
