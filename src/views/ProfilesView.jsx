import React, { useState, useEffect, useCallback } from 'react';
import Section from '../components/Section.jsx';
import Select from '../components/Select.jsx';
import TextInput from '../components/TextInput.jsx';
import Button from '../components/Button.jsx';
import { sanitizeInput } from '../utils/validation.js';

export default function ProfilesView({ division, data, onUpsertTeam }) {
  const teams = data.teams.filter(t => t.division === division);
  const [selectedId, setSelectedId] = useState(teams[0]?.id || '');
  const [coach, setCoach] = useState('');
  const [rosterText, setRosterText] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  useEffect(() => { if (teams.length && !teams.find(t => t.id === selectedId)) setSelectedId(teams[0].id); }, [teams, selectedId]);
  const team = teams.find(t => t.id === selectedId);
  useEffect(() => { if (!team) return; setCoach(team.coach || ''); setRosterText((team.profile?.roster || []).join('\n')); setNotes(team.profile?.notes || ''); }, [team?.id]);
  const saveProfile = useCallback(async () => { if (!team) return; setLoading(true); try { const updated = { ...team, coach: sanitizeInput(coach.trim()), profile: { roster: rosterText.split(/\n+/).map(s => sanitizeInput(s.trim())).filter(Boolean), notes: sanitizeInput(notes.trim()) } }; await onUpsertTeam(updated); } finally { setLoading(false); } }, [team, coach, rosterText, notes, onUpsertTeam]);
  return (
    <div className="grid gap-6">
      <Section title="Team Profile" actions={teams.length > 0 && <Select label="Select Team" value={selectedId} onChange={setSelectedId} options={teams.map(t => ({ label: t.name, value: t.id }))} />}>
        {team ? (
          <div className="grid md:grid-cols-3 gap-4">
            <TextInput label="Coach" value={coach} onChange={setCoach} maxLength={50} />
            <div className="md:col-span-1" />
            <label className="flex flex-col gap-1 md:col-span-2">
              <span className="text-sm text-slate-600">Roster (one per line)</span>
              <textarea className="min-h-[200px] rounded-xl border border-slate-300 p-3 focus:ring-2 focus:ring-indigo-500" value={rosterText} onChange={e => setRosterText(e.target.value)} placeholder="Player A\nPlayer B\nPlayer C" aria-label="Team roster, one player per line" />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm text-slate-600">Notes</span>
              <textarea className="min-h-[200px] rounded-xl border border-slate-300 p-3 focus:ring-2 focus:ring-indigo-500" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Coaching notes, rotations, special instructions…" aria-label="Team notes and coaching instructions" />
            </label>
          </div>
        ) : (<p className="text-slate-600">No teams in this division yet.</p>)}
        <div className="mt-4 flex gap-2">
          <Button onClick={saveProfile} disabled={!team} loading={loading}>Save Profile</Button>
        </div>
      </Section>
      {team && (
        <Section title="Preview">
          <div className="grid md:grid-cols-3 gap-4">
            <div><div className="text-slate-500 text-sm">Coach</div><div className="text-slate-900 font-medium">{coach || '—'}</div></div>
            <div><div className="text-slate-500 text-sm">Players ({rosterText.split(/\n+/).filter(Boolean).length})</div><ul className="list-disc pl-5 text-slate-900">{rosterText.split(/\n+/).filter(Boolean).map((p, i) => <li key={i}>{p}</li>)}</ul></div>
            <div><div className="text-slate-500 text-sm">Notes</div><div className="whitespace-pre-wrap text-slate-900">{notes || '—'}</div></div>
          </div>
        </Section>
      )}
    </div>
  );
}
