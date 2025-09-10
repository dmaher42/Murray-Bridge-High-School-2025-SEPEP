import React, { useEffect, useMemo, useState, useCallback } from "react";
import ReactDOM from "react-dom/client";


/************************************************************
 * SEEPEP Fixture & Results Tracker (Browser Version)
 ************************************************************/

// ========================= Backend Config =========================
const API = (window.__SEEPEP_API__ ?? "https://script.google.com/macros/s/AKfycbxQF1jPP2EjOt8RH81onVHgxazq1uxzZpQ7WBt214pcsV7IkXLzxxS72uwNJQoy7n2F/exec");
const TOKEN = (window.__SEEPEP_TOKEN__ ?? "");

// ========================= Validation =========================
function validateTeam(team) {
  const errors = {};
  if (!team.name?.trim()) errors.name = "Team name is required";
  if (!team.coach?.trim()) errors.coach = "Coach name is required";
  if (team.name && team.name.length > 50) errors.name = "Team name too long (max 50 chars)";
  if (team.coach && team.coach.length > 50) errors.coach = "Coach name too long (max 50 chars)";
  return errors;
}

function validateFixture(fixture, existingFixtures = []) {
  const errors = {};
  if (!fixture.round?.trim()) errors.round = "Round is required";
  if (!fixture.date) errors.date = "Date is required";
  if (!fixture.time) errors.time = "Time is required";
  if (!fixture.court?.trim()) errors.court = "Court is required";
  if (!fixture.homeId) errors.homeId = "Home team is required";
  if (!fixture.awayId) errors.awayId = "Away team is required";
  if (fixture.homeId === fixture.awayId && fixture.homeId) errors.awayId = "Teams cannot play themselves";
  const conflict = existingFixtures.find(f => f.id !== fixture.id && f.date === fixture.date && f.time === fixture.time && f.court === fixture.court);
  if (conflict) errors.time = "Time conflict with existing fixture";
  return errors;
}

function sanitizeInput(input) {
  if (typeof input !== 'string') return input;
  return input.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
              .replace(/[<>]/g, '')
              .trim();
}

// ========================= API Helpers =========================
async function apiGet(params) {
  const url = `${API}?${new URLSearchParams({ ...params, token: TOKEN })}`;
  const res = await fetch(url, { method: "GET" });
  if (!res.ok) {
    const errorText = await res.text().catch(() => 'Unknown error');
    throw new Error(`API Error (${res.status}): ${errorText}`);
  }
  return res.json();
}
async function apiPost(action, payload) {
  const res = await fetch(API, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ action, token: TOKEN, ...payload }),
  });
  if (!res.ok) {
    const errorText = await res.text().catch(() => 'Unknown error');
    throw new Error(`API Error (${res.status}): ${errorText}`);
  }
  return res.json();
}
async function readAll(division) { return apiGet({ action: "readAll", year: division }); }
async function upsertTeam(team) { return apiPost("upsertTeam", { team }); }
async function upsertFixture(fixture) { return apiPost("upsertFixture", { fixture }); }
async function upsertResult(result) { return apiPost("upsertResult", { result }); }
async function deleteFixtureRemote(id) { return apiPost("deleteFixtureRemote", { id }); }

// ========================= Utilities =========================
const uid = () => Math.random().toString(36).slice(2, 10);
const toInt = (v) => (v === "" || v == null ? 0 : Number(v));

function computeLadder(teams, fixtures, results) {
  const table = {};
  teams.forEach((t) => { table[t.id] = { team: t, P: 0, W: 0, D: 0, L: 0, PF: 0, PA: 0, PTS: 0, "%": 0 }; });
  const resMap = new Map(results.map((r) => [r.id, r]));
  fixtures.forEach((f) => {
    const r = resMap.get(f.id); if (!r) return;
    const home = table[f.homeId]; const away = table[f.awayId]; if (!home || !away) return;
    home.P++; away.P++;
    home.PF += toInt(r.homeScore); home.PA += toInt(r.awayScore);
    away.PF += toInt(r.awayScore); away.PA += toInt(r.homeScore);
    if (r.homeScore > r.awayScore) { home.W++; away.L++; home.PTS += 4; }
    else if (r.homeScore < r.awayScore) { away.W++; home.L++; away.PTS += 4; }
    else { home.D++; away.D++; home.PTS += 2; away.PTS += 2; }
  });
  Object.values(table).forEach((row) => { const denom = row.PA === 0 ? 1 : row.PA; row["%"] = Math.round((row.PF / denom) * 1000) / 10; });
  return Object.values(table).sort((a, b) => b.PTS - a.PTS || b["%"] - a["%"]);
}

function computeNeighbourhoodTotals(teams, results, fixtures) {
  const byTeam = Object.fromEntries(teams.map((t) => [t.id, t]));
  const resMap = new Map(results.map((r) => [r.id, r]));
  const totals = {};
  fixtures.forEach((f) => {
    const r = resMap.get(f.id); if (!r) return;
    const home = byTeam[f.homeId]; const away = byTeam[f.awayId]; if (!home || !away) return;
    const hn = home.neighbourhood || "—"; const an = away.neighbourhood || "—";
    totals[hn] = totals[hn] || { neighbourhood: hn, PF: 0, PA: 0, Wins: 0, Losses: 0, Draws: 0 };
    totals[an] = totals[an] || { neighbourhood: an, PF: 0, PA: 0, Wins: 0, Losses: 0, Draws: 0 };
    totals[hn].PF += toInt(r.homeScore); totals[hn].PA += toInt(r.awayScore);
    totals[an].PF += toInt(r.awayScore); totals[an].PA += toInt(r.homeScore);
    if (r.homeScore > r.awayScore) { totals[hn].Wins++; totals[an].Losses++; }
    else if (r.homeScore < r.awayScore) { totals[an].Wins++; totals[hn].Losses++; }
    else { totals[hn].Draws++; totals[an].Draws++; }
  });
  return Object.values(totals).sort((a, b) => (b.Wins - a.Wins) || (b.PF - a.PF));
}

// ========================= UI Components =========================
function Toast({ message, type = "success", onClose }) {
  useEffect(() => { if (message) { const timer = setTimeout(onClose, 3000); return () => clearTimeout(timer); } }, [message, onClose]);
  if (!message) return null;
  const bgColor = type === "error" ? "bg-red-600" : "bg-green-600";
  return (<div className={`fixed bottom-4 left-1/2 -translate-x-1/2 ${bgColor} text-white text-sm px-4 py-2 rounded-xl shadow-lg z-50`}>{message}</div>);
}
function Section({ title, children, actions }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white shadow-sm p-4 md:p-6">
      <div className="flex items-center justify-between gap-4 mb-3">
        <h2 className="text-xl font-semibold text-slate-800">{title}</h2>
        {actions}
      </div>
      {children}
    </section>
  );
}
function TextInput({ label, value, onChange, placeholder = "", type = "text", className = "", error, required = false, maxLength }) {
  const id = `input-${Math.random().toString(36).slice(2, 8)}`;
  return (
    <label className={`flex flex-col gap-1 ${className}`} htmlFor={id}>
      <span className="text-sm text-slate-600">{label}{required && <span className="text-red-500 ml-1">*</span>}</span>
      <input id={id} className={`h-10 rounded-xl border px-3 outline-none focus:ring-2 focus:ring-indigo-500 ${error ? 'border-red-300 focus:ring-red-500' : 'border-slate-300'}`} value={value} onChange={(e) => onChange(sanitizeInput(e.target.value))} placeholder={placeholder} type={type} maxLength={maxLength} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined} />
      {error && <span id={`${id}-error`} className="text-sm text-red-600" role="alert">{error}</span>}
    </label>
  );
}
function Select({ label, value, onChange, options, className = "", error, required = false }) {
  const id = `select-${Math.random().toString(36).slice(2, 8)}`;
  return (
    <label className={`flex flex-col gap-1 ${className}`} htmlFor={id}>
      <span className="text-sm text-slate-600">{label}{required && <span className="text-red-500 ml-1">*</span>}</span>
      <select id={id} className={`h-10 rounded-xl border px-3 outline-none focus:ring-2 focus:ring-indigo-500 ${error ? 'border-red-300 focus:ring-red-500' : 'border-slate-300'}`} value={value} onChange={(e) => onChange(e.target.value)} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined}>
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <span id={`${id}-error`} className="text-sm text-red-600" role="alert">{error}</span>}
    </label>
  );
}
function Button({ children, onClick, variant = "primary", disabled, type = "button", loading = false, ariaLabel }) {
  const baseClasses = "h-10 px-4 rounded-xl text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variantClasses = { primary: "bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 focus:ring-indigo-500", ghost: "bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 focus:ring-slate-500", danger: "bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500" };
  return (<button type={type} onClick={onClick} disabled={disabled || loading} className={`${baseClasses} ${variantClasses[variant]}`} aria-label={ariaLabel}>{loading ? "Loading..." : children}</button>);
}
function Table({ columns, rows, rowKey = (r) => r.id, caption }) {
  return (
    <div className="overflow-auto rounded-xl border border-slate-200">
      <table className="min-w-full text-sm" role="table">
        {caption && <caption className="sr-only">{caption}</caption>}
        <thead className="bg-slate-50 text-slate-600">
          <tr>{columns.map((c) => <th key={c.key} className="text-left font-semibold px-3 py-2 whitespace-nowrap" scope="col">{c.header}</th>)}</tr>
        </thead>
        <tbody>
          {rows.length === 0 ? (
            <tr><td className="px-3 py-3 text-slate-500" colSpan={columns.length}>No data available</td></tr>
          ) : rows.map((row, index) => (
            <tr key={rowKey(row)} className="border-t border-slate-100" role="row">
              {columns.map((c) => <td key={c.key} className="px-3 py-2 align-top whitespace-nowrap" role="gridcell">{c.cell ? c.cell(row, index) : row[c.key]}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ========================= Views =========================
function TeamsView({ division, data, onUpsertTeam }) {
  const [q, setQ] = useState("");
  const [draft, setDraft] = useState({ id: "", name: "", coach: "", neighbourhood: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const filtered = useMemo(() => {
    const src = data.teams.filter((t) => t.division === division);
    if (!q.trim()) return src;
    const k = q.toLowerCase();
    return src.filter((t) => [t.name, t.coach, t.neighbourhood].some((v) => (v || "").toLowerCase().includes(k)));
  }, [data.teams, division, q]);
  const resetDraft = useCallback(() => { setDraft({ id: "", name: "", coach: "", neighbourhood: "" }); setErrors({}); }, []);
  const handleSave = useCallback(async (e) => {
    e.preventDefault();
    const validationErrors = validateTeam(draft);
    if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; }
    setLoading(true);
    try {
      const id = draft.id || uid();
      const team = { id, name: draft.name.trim(), coach: draft.coach.trim(), neighbourhood: draft.neighbourhood.trim(), division, profile: { roster: [], notes: "" } };
      await onUpsertTeam(team); resetDraft();
    } catch (error) { setErrors({ submit: error.message }); }
    finally { setLoading(false); }
  }, [draft, division, onUpsertTeam, resetDraft]);
  return (
    <div className="grid gap-6">
      <Section title="Add / Edit Team">
        <form className="grid md:grid-cols-4 gap-3" onSubmit={handleSave}>
          <TextInput label="Team Name" value={draft.name} onChange={(v) => setDraft({ ...draft, name: v })} error={errors.name} required maxLength={50} />
          <TextInput label="Coach" value={draft.coach} onChange={(v) => setDraft({ ...draft, coach: v })} error={errors.coach} required maxLength={50} />
          <TextInput label="Neighbourhood" value={draft.neighbourhood} onChange={(v) => setDraft({ ...draft, neighbourhood: v })} maxLength={50} />
            <div className="flex items-end gap-2">
              <Button type="submit" loading={loading}>{draft.id ? "Update" : "Save"} Team</Button>
              <Button variant="ghost" type="button" onClick={resetDraft}>Clear</Button>
            </div>
            {errors.submit && <div className="md:col-span-4 text-sm text-red-600" role="alert">Error: {errors.submit}</div>}
        </form>
      </Section>
      <Section title="Teams" actions={<TextInput label="Search teams" value={q} onChange={setQ} className="w-64" placeholder="Search by name, coach, or neighbourhood" />}> 
        <Table caption={`Teams in ${division} division`} columns=[
          { key: "name", header: "Team" },
          { key: "coach", header: "Coach" },
          { key: "neighbourhood", header: "Neighbourhood" },
          { key: "actions", header: "Actions", cell: (t) => (
            <div className="flex gap-2">
              <Button variant="ghost" ariaLabel={`Edit ${t.name}`} onClick={() => setDraft({ id: t.id, name: t.name, coach: t.coach || "", neighbourhood: t.neighbourhood || "" })}>Edit</Button>
            </div>
          ) }
        ] rows={filtered} />
      </Section>
    </div>
  );
}

function FixturesView({ division, data, onUpsertFixture, onUpsertResult, onDeleteFixture }) {
  const [draft, setDraft] = useState({ id: "", round: "1", date: "", time: "", court: "", homeId: "", awayId: "" });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const teams = data.teams.filter((t) => t.division === division);
  const fixtures = data.fixtures.filter((f) => f.division === division);
  const results = Object.fromEntries(data.results.map((r) => [r.id, r]));
  const setField = useCallback((k, v) => { setDraft((d) => ({ ...d, [k]: v })); if (errors[k]) setErrors(prev => ({ ...prev, [k]: null })); }, [errors]);
  const resetDraft = useCallback(() => { setDraft({ id: "", round: "1", date: "", time: "", court: "", homeId: "", awayId: "" }); setErrors({}); }, []);
  const handleSave = useCallback(async (e) => { e.preventDefault(); const validationErrors = validateFixture(draft, fixtures); if (Object.keys(validationErrors).length > 0) { setErrors(validationErrors); return; } setLoading(true); try { const id = draft.id || uid(); const f = { ...draft, id, division }; await onUpsertFixture(f); resetDraft(); } catch (error) { setErrors({ submit: error.message }); } finally { setLoading(false); } }, [draft, division, fixtures, onUpsertFixture, resetDraft]);
  const saveScore = useCallback(async (id, homeScore, awayScore) => { try { await onUpsertResult({ id, homeScore: toInt(homeScore), awayScore: toInt(awayScore) }); } catch (error) { console.error('Failed to save score:', error); } }, [onUpsertResult]);
  return (
    <div className="grid gap-6">
      <Section title="Create Fixture">
        <form className="grid md:grid-cols-7 gap-3" onSubmit={handleSave}>
          <TextInput label="Round" value={draft.round} onChange={(v) => setField("round", v)} error={errors.round} required />
          <TextInput label="Date" type="date" value={draft.date} onChange={(v) => setField("date", v)} error={errors.date} required />
          <TextInput label="Time" type="time" value={draft.time} onChange={(v) => setField("time", v)} error={errors.time} required />
          <TextInput label="Court" value={draft.court} onChange={(v) => setField("court", v)} error={errors.court} required />
          <Select label="Home Team" value={draft.homeId} onChange={(v) => setField("homeId", v)} options={[{ label: "Select team", value: "" }, ...teams.map(t => ({ label: t.name, value: t.id }))]} error={errors.homeId} required />
          <Select label="Away Team" value={draft.awayId} onChange={(v) => setField("awayId", v)} options={[{ label: "Select team", value: "" }, ...teams.map(t => ({ label: t.name, value: t.id }))]} error={errors.awayId} required />
          <div className="flex items-end gap-2">
            <Button type="submit" loading={loading}>{draft.id ? "Update" : "Save"} Fixture</Button>
            <Button variant="ghost" type="button" onClick={resetDraft}>Clear</Button>
          </div>
          {errors.submit && <div className="md:col-span-7 text-sm text-red-600" role="alert">Error: {errors.submit}</div>}
        </form>
      </Section>
      <Section title="Fixtures & Results">
        <Table caption={`Fixtures and results for ${division} division`} columns={[
          { key: "round", header: "Round" },
          { key: "date", header: "Date" },
          { key: "time", header: "Time" },
          { key: "court", header: "Court" },
          { key: "home", header: "Home", cell: (f) => teams.find(t => t.id === f.homeId)?.name || "?" },
          { key: "away", header: "Away", cell: (f) => teams.find(t => t.id === f.awayId)?.name || "?" },
          { key: "score", header: "Score", cell: (f) => { const r = results[f.id] || { homeScore: "", awayScore: "" }; return (<div className="flex items-center gap-2"><input className="h-9 w-16 rounded-lg border border-slate-300 px-2 focus:ring-2 focus:ring-indigo-500" defaultValue={r.homeScore} placeholder="Home" onBlur={(e) => saveScore(f.id, e.target.value, r.awayScore)} aria-label={`Home score for ${teams.find(t => t.id === f.homeId)?.name || 'home team'}`} type="number" min="0" /><span className="text-slate-500">—</span><input className="h-9 w-16 rounded-lg border border-slate-300 px-2 focus:ring-2 focus:ring-indigo-500" defaultValue={r.awayScore} placeholder="Away" onBlur={(e) => saveScore(f.id, r.homeScore, e.target.value)} aria-label={`Away score for ${teams.find(t => t.id === f.awayId)?.name || 'away team'}`} type="number" min="0" /></div>); } },
          { key: "actions", header: "Actions", cell: (f) => (<div className="flex gap-2"><Button variant="ghost" ariaLabel={`Edit fixture ${f.round}`} onClick={() => setDraft(f)}>Edit</Button><Button variant="danger" ariaLabel={`Delete fixture ${f.round}`} onClick={() => onDeleteFixture(f.id)}>Delete</Button></div>) }
        ]} rows={fixtures.sort((a, b) => (a.round.localeCompare(b.round)) || (a.date || "").localeCompare(b.date || ""))} />
      </Section>
    </div>
  );
}

function ProfilesView({ division, data, onUpsertTeam }) {
  const teams = data.teams.filter((t) => t.division === division);
  const [selectedId, setSelectedId] = useState(teams[0]?.id || "");
  const [coach, setCoach] = useState("");
  const [rosterText, setRosterText] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);
  useEffect(() => { if (teams.length && !teams.find(t => t.id === selectedId)) setSelectedId(teams[0].id); }, [teams, selectedId]);
  const team = teams.find((t) => t.id === selectedId);
  useEffect(() => { if (!team) return; setCoach(team.coach || ""); setRosterText((team.profile?.roster || []).join("\n")); setNotes(team.profile?.notes || ""); }, [team?.id]);
  const saveProfile = useCallback(async () => { if (!team) return; setLoading(true); try { const updated = { ...team, coach: sanitizeInput(coach.trim()), profile: { roster: rosterText.split(/\n+/).map(s => sanitizeInput(s.trim())).filter(Boolean), notes: sanitizeInput(notes.trim()) } }; await onUpsertTeam(updated); } finally { setLoading(false); } }, [team, coach, rosterText, notes, onUpsertTeam]);
  return (
    <div className="grid gap-6">
      <Section title="Team Profile" actions={teams.length > 0 && <Select label="Select Team" value={selectedId} onChange={setSelectedId} options={teams.map(t => ({ label: t.name, value: t.id }))} /> }>
        {team ? (
          <div className="grid md:grid-cols-3 gap-4">
            <TextInput label="Coach" value={coach} onChange={setCoach} maxLength={50} />
            <div className="md:col-span-1" />
            <label className="flex flex-col gap-1 md:col-span-2">
              <span className="text-sm text-slate-600">Roster (one per line)</span>
              <textarea className="min-h-[200px] rounded-xl border border-slate-300 p-3 focus:ring-2 focus:ring-indigo-500" value={rosterText} onChange={(e) => setRosterText(e.target.value)} placeholder="Player A&#10;Player B&#10;Player C" aria-label="Team roster, one player per line" />
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-sm text-slate-600">Notes</span>
              <textarea className="min-h-[200px] rounded-xl border border-slate-300 p-3 focus:ring-2 focus:ring-indigo-500" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Coaching notes, rotations, special instructions…" aria-label="Team notes and coaching instructions" />
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
            <div><div className="text-slate-500 text-sm">Coach</div><div className="text-slate-900 font-medium">{coach || "—"}</div></div>
            <div><div className="text-slate-500 text-sm">Players ({rosterText.split(/\n+/).filter(Boolean).length})</div><ul className="list-disc pl-5 text-slate-900">{rosterText.split(/\n+/).filter(Boolean).map((p, i) => <li key={i}>{p}</li>)}</ul></div>
            <div><div className="text-slate-500 text-sm">Notes</div><div className="whitespace-pre-wrap text-slate-900">{notes || "—"}</div></div>
          </div>
        </Section>
      )}
    </div>
  );
}

function LadderView({ division, data }) {
  const teams = data.teams.filter(t => t.division === division);
  const fixtures = data.fixtures.filter(f => f.division === division);
  const results = data.results;
  // Depend on whole arrays (references) rather than lengths so recalculation happens on score edits
  const ladder = useMemo(() => teams.length ? computeLadder(teams, fixtures, results) : [], [teams, fixtures, results]);
  const neighbourhoods = useMemo(() => teams.length ? computeNeighbourhoodTotals(teams, results, fixtures) : [], [teams, results, fixtures]);
  return (
    <div className="grid gap-6">
      <Section title="Ladder">
        <Table caption={`League ladder for ${division} division`} columns={[
          { key: "pos", header: "Pos", cell: (_, i) => i + 1 },
          { key: "team", header: "Team", cell: (r) => r.team.name },
          { key: "P", header: "P" },
          { key: "W", header: "W" },
          { key: "D", header: "D" },
          { key: "L", header: "L" },
          { key: "PF", header: "PF" },
          { key: "PA", header: "PA" },
          { key: "PTS", header: "PTS" },
          { key: "%", header: "%" },
        ]} rows={ladder} rowKey={(r) => r.team.id} />
        {ladder.length === 0 && <p className="text-slate-500 text-center py-8">No games played yet. Add some fixtures and results to see the ladder.</p>}
      </Section>
      <Section title="Neighbourhood Totals">
        <Table caption={`Neighbourhood performance totals for ${division} division`} columns={[
          { key: "neighbourhood", header: "Neighbourhood" },
          { key: "Wins", header: "W" },
          { key: "Losses", header: "L" },
          { key: "Draws", header: "D" },
          { key: "PF", header: "PF" },
          { key: "PA", header: "PA" },
        ]} rows={neighbourhoods} />
        {neighbourhoods.length === 0 && <p className="text-slate-500 text-center py-8">No neighbourhood data available yet.</p>}
      </Section>
    </div>
  );
}

function AdminView({ division, data, onImportJSON, onPushAll }) {
  const [importError, setImportError] = useState("");
  const [loading, setLoading] = useState({ export: false, push: false });
  const exportJSON = useCallback(() => {
    setLoading(prev => ({ ...prev, export: true }));
    try {
      const payload = JSON.stringify({ division, data }, null, 2);
      const blob = new Blob([payload], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `seepep-backup-${division}-${new Date().toISOString().split('T')[0]}.json`;
      a.click(); URL.revokeObjectURL(url);
    } finally { setLoading(prev => ({ ...prev, export: false })); }
  }, [division, data]);
  const importJSON = useCallback(async (e) => {
    const file = e.target.files?.[0]; if (!file) return;
    setImportError("");
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!parsed || !parsed.data) throw new Error("Invalid file format - missing data property");
      const { teams = [], fixtures = [], results = [] } = parsed.data;
      if (!Array.isArray(teams) || !Array.isArray(fixtures) || !Array.isArray(results)) throw new Error("Invalid data structure");
      onImportJSON(parsed.data);
    } catch (err) { setImportError(err.message); }
    e.target.value = '';
  }, [onImportJSON]);
  const handlePushAll = useCallback(async () => {
    if (!confirm("Push all teams, fixtures, and results to the backend? This will overwrite existing data.")) return;
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

// ========================= Main App =========================
const YEARS = ["2025", "2024", "2023"];
export default function App() {
  const [division, setDivision] = useState(YEARS[0]);
  const [loading, setLoading] = useState({ type: null, message: "" });
  const [toast, setToast] = useState({ message: "", type: "success" });
  const [error, setError] = useState(null);
  const [state, setState] = useState({
    settings: { seasonTitle: "SEEPEP Fixture & Results", classLine: "HPE" },
    divisions: Object.fromEntries(YEARS.map((y) => [y, { teams: [], fixtures: [], results: [] }])),
  });
  const data = state.divisions[division];
  const setLoadingState = useCallback((type, message = "") => setLoading({ type, message }), []);
  const showToast = useCallback((message, type = "success") => setToast({ message, type }), []);
  const clearToast = useCallback(() => setToast({ message: "", type: "success" }), []);
  const refresh = useCallback(async () => {
    setLoadingState("refresh", "Loading division data...");
    setError(null);
    try {
      const { teams = [], fixtures = [], results = [] } = await readAll(division);
      setState((s) => ({ ...s, divisions: { ...s.divisions, [division]: { teams, fixtures, results } } }));
    } catch (e) { console.error('Refresh error:', e); setError(`Failed to load data: ${e.message}`); }
    finally { setLoadingState(null); }
  }, [division, setLoadingState]);
  useEffect(() => { refresh(); }, [refresh]);
  const handleUpsertTeam = useCallback(async (team) => {
    setLoadingState("team", "Saving team...");
    try {
      await upsertTeam(team);
      setState((s) => {
        const list = s.divisions[division].teams;
        const exists = list.some((t) => t.id === team.id);
        const teams = exists ? list.map((t) => t.id === team.id ? team : t) : [...list, team];
        return { ...s, divisions: { ...s.divisions, [division]: { ...s.divisions[division], teams } } };
      });
      showToast("Team saved successfully");
    } catch (e) { console.error('Team upsert error:', e); showToast(`Failed to save team: ${e.message}`, "error"); throw e; }
    finally { setLoadingState(null); }
  }, [division, setLoadingState, showToast]);
  const handleUpsertFixture = useCallback(async (fixture) => {
    setLoadingState("fixture", "Saving fixture...");
    try {
      await upsertFixture(fixture);
      setState((s) => {
        const list = s.divisions[division].fixtures;
        const exists = list.some((x) => x.id === fixture.id);
        const fixtures = exists ? list.map((x) => x.id === fixture.id ? fixture : x) : [...list, fixture];
        return { ...s, divisions: { ...s.divisions, [division]: { ...s.divisions[division], fixtures } } };
      });
      showToast("Fixture saved successfully");
    } catch (e) { console.error('Fixture upsert error:', e); showToast(`Failed to save fixture: ${e.message}`, "error"); throw e; }
    finally { setLoadingState(null); }
  }, [division, setLoadingState, showToast]);
  const handleUpsertResult = useCallback(async (result) => {
    setLoadingState("result", "Saving score...");
    try {
      await upsertResult(result);
      setState((s) => {
        const list = s.divisions[division].results;
        const exists = list.some((x) => x.id === result.id);
        const results = exists ? list.map((x) => x.id === result.id ? result : x) : [...list, result];
        return { ...s, divisions: { ...s.divisions, [division]: { ...s.divisions[division], results } } };
      });
      showToast("Score saved successfully");
    } catch (e) { console.error('Result upsert error:', e); showToast(`Failed to save score: ${e.message}`, "error"); }
    finally { setLoadingState(null); }
  }, [division, setLoadingState, showToast]);
  const handleDeleteFixture = useCallback(async (id) => {
    if (!confirm("Delete this fixture and its result? This action cannot be undone.")) return;
    setLoadingState("delete", "Deleting fixture...");
    try {
      await deleteFixtureRemote(id);
      setState((s) => {
        const fixtures = s.divisions[division].fixtures.filter((f) => f.id !== id);
        const results = s.divisions[division].results.filter((r) => r.id !== id);
        return { ...s, divisions: { ...s.divisions, [division]: { ...s.divisions[division], fixtures, results } } };
      });
      showToast("Fixture deleted successfully");
    } catch (e) { console.error('Delete fixture error:', e); showToast(`Failed to delete fixture: ${e.message}`, "error"); }
    finally { setLoadingState(null); }
  }, [division, setLoadingState, showToast]);
  const handleImportJSON = useCallback((imported) => { setState((s) => ({ ...s, divisions: { ...s.divisions, [division]: imported } })); showToast("Data imported successfully (local only)"); }, [division, showToast]);
  const handlePushAll = useCallback(async () => { setLoadingState("push", "Pushing all data to backend..."); try { const promises = [...data.teams.map(t => upsertTeam(t)), ...data.fixtures.map(f => upsertFixture(f)), ...data.results.map(r => upsertResult(r))]; await Promise.all(promises); showToast("All data pushed to backend successfully"); } catch (e) { console.error('Push all error:', e); showToast(`Failed to push data: ${e.message}`, "error"); } finally { setLoadingState(null); } }, [data, setLoadingState, showToast]);
  const [tab, setTab] = useState("teams");
  const tabs = [ { id: "teams", label: "Teams", count: data.teams.length }, { id: "fixtures", label: "Fixtures", count: data.fixtures.length }, { id: "profiles", label: "Profiles" }, { id: "ladder", label: "Ladder" }, { id: "admin", label: "Admin" } ];
  return (
    <div className="min-h-screen bg-slate-100">
      <header className="sticky top-0 z-10 backdrop-blur bg-white/80 border-b border-slate-200">
        <div className="mx-auto max-w-6xl px-4 py-3 flex flex-wrap items-center gap-3">
          <div className="text-lg font-semibold">{state.settings.seasonTitle}</div>
          <div className="grow" />
          <Select label="Division" value={division} onChange={setDivision} options={YEARS.map((y) => ({ label: y, value: y }))} />
          <Button variant="ghost" onClick={refresh} loading={loading.type === "refresh"} ariaLabel="Refresh data">{loading.type === "refresh" ? loading.message : "Refresh"}</Button>
        </div>
        <div className="mx-auto max-w-6xl px-4 pb-3">
          <nav className="flex gap-2" role="tablist">
            {tabs.map((t) => (
              <button key={t.id} onClick={() => setTab(t.id)} className={`h-10 px-4 rounded-xl text-sm font-medium border transition ${tab === t.id ? "bg-indigo-600 text-white border-indigo-600" : "bg-white text-slate-700 border-slate-300 hover:bg-slate-50"}`} role="tab" aria-selected={tab === t.id} aria-controls={`panel-${t.id}`}>{t.label}{t.count !== undefined && (<span className={`ml-2 px-2 py-0.5 rounded-full text-xs ${tab === t.id ? "bg-indigo-500" : "bg-slate-200 text-slate-600"}`}>{t.count}</span>)}</button>
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
          {tab === "teams" && <TeamsView division={division} data={data} onUpsertTeam={handleUpsertTeam} />}
          {tab === "fixtures" && <FixturesView division={division} data={data} onUpsertFixture={handleUpsertFixture} onUpsertResult={handleUpsertResult} onDeleteFixture={handleDeleteFixture} />}
          {tab === "profiles" && <ProfilesView division={division} data={data} onUpsertTeam={handleUpsertTeam} />}
            {tab === "ladder" && <LadderView division={division} data={data} />}
          {tab === "admin" && <AdminView division={division} data={data} onImportJSON={handleImportJSON} onPushAll={handlePushAll} />}
        </div>
      </main>
      <footer className="mx-auto max-w-6xl px-4 pb-8 text-xs text-slate-500">
        Backend: Google Apps Script · Frontend: React + Tailwind · {loading.type && <span className="ml-2 text-indigo-600">{loading.message || "Processing..."}</span>}
      </footer>
      <Toast message={toast.message} type={toast.type} onClose={clearToast} />
    </div>
  );
}

// ============== Mount (React 18) ============== 
(function mount() {
  const rootEl = document.getElementById('root');
  if (!rootEl) { console.error('Root element #root not found'); return; }
  const root = ReactDOM.createRoot(rootEl);
  root.render(<App />);
})();
