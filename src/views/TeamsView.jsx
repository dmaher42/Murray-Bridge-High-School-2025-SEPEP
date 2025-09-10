import React, { useState, useMemo, useCallback } from 'react';
import Section from '../components/Section.jsx';
import TextInput from '../components/TextInput.jsx';
import Button from '../components/Button.jsx';
import Table from '../components/Table.jsx';
import { validateTeam } from '../utils/validation.js';
import { uid } from '../utils/helpers.js';

export default function TeamsView({ division, data, onUpsertTeam }) {
  const [q, setQ] = useState('');
  const [draft, setDraft] = useState({ id: '', name: '', coach: '', neighbourhood: '' });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const filtered = useMemo(() => {
    const src = data.teams.filter(t => t.division === division);
    if (!q.trim()) return src;
    const k = q.toLowerCase();
    return src.filter(t => [t.name, t.coach, t.neighbourhood].some(v => (v || '').toLowerCase().includes(k)));
  }, [data.teams, division, q]);
  const resetDraft = useCallback(() => { setDraft({ id: '', name: '', coach: '', neighbourhood: '' }); setErrors({}); }, []);
  const handleSave = useCallback(async (e) => {
    e.preventDefault();
    const validationErrors = validateTeam(draft);
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }
    setLoading(true);
    try {
      const id = draft.id || uid();
      const team = { id, name: draft.name.trim(), coach: draft.coach.trim(), neighbourhood: draft.neighbourhood.trim(), division, profile: { roster: [], notes: '' } };
      await onUpsertTeam(team);
      resetDraft();
    } catch (error) { setErrors({ submit: error.message }); }
    finally { setLoading(false); }
  }, [draft, division, onUpsertTeam, resetDraft]);
  return (
    <div className="grid gap-6">
      <Section title="Add / Edit Team">
        <form className="grid md:grid-cols-4 gap-3" onSubmit={handleSave}>
          <TextInput label="Team Name" value={draft.name} onChange={v => setDraft({ ...draft, name: v })} error={errors.name} required maxLength={50} />
          <TextInput label="Coach" value={draft.coach} onChange={v => setDraft({ ...draft, coach: v })} error={errors.coach} required maxLength={50} />
          <TextInput label="Neighbourhood" value={draft.neighbourhood} onChange={v => setDraft({ ...draft, neighbourhood: v })} maxLength={50} />
          <div className="flex items-end gap-2">
            <Button type="submit" loading={loading}>{draft.id ? 'Update' : 'Save'} Team</Button>
            <Button variant="ghost" type="button" onClick={resetDraft}>Clear</Button>
          </div>
          {errors.submit && <div className="md:col-span-4 text-sm text-red-600" role="alert">Error: {errors.submit}</div>}
        </form>
      </Section>
      <Section title="Teams" actions={<TextInput label="Search teams" value={q} onChange={setQ} className="w-64" placeholder="Search by name, coach, or neighbourhood" />}>
        <Table caption={`Teams in ${division} division`} columns={[
          { key: 'name', header: 'Team' },
          { key: 'coach', header: 'Coach' },
          { key: 'neighbourhood', header: 'Neighbourhood' },
          { key: 'actions', header: 'Actions', cell: t => (
            <div className="flex gap-2">
              <Button variant="ghost" ariaLabel={`Edit ${t.name}`} onClick={() => setDraft({ id: t.id, name: t.name, coach: t.coach || '', neighbourhood: t.neighbourhood || '' })}>Edit</Button>
            </div>
          ) }
        ]} rows={filtered} />
      </Section>
    </div>
  );
}
