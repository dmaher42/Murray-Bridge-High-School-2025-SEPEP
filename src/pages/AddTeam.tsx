import { useState } from "react";

const API_BASE = import.meta.env.VITE_API_BASE; // e.g., https://script.google.com/macros/s/.../exec

export default function AddTeam() {
  const [form, setForm] = useState({ teamId:"", teamName:"", neighbourhood:"", division:"" });
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<{ok:boolean; text:string} | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const res = await fetch(`${API_BASE}?endpoint=addTeam`, {
        method: "POST",
        headers: { "Content-Type":"application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok || !data.ok) throw new Error(data.error || "Failed to add team");
      setMsg({ ok:true, text:"Team added!" });
      setForm({ teamId:"", teamName:"", neighbourhood:"", division:"" });
    } catch (err:any) {
      setMsg({ ok:false, text: err.message || "Error adding team" });
    } finally {
      setLoading(false);
    }
  }

  function Field({name,label,required=false}:{name:keyof typeof form;label:string;required?:boolean}) {
    return (
      <label className="grid gap-1">
        <span className="text-sm text-gray-600">{label}</span>
        <input
          className="border rounded p-2"
          required={required}
          value={form[name]}
          onChange={e=>setForm({...form, [name]: e.target.value})}
        />
      </label>
    );
  }

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Add Team</h1>
      <form onSubmit={onSubmit} className="grid gap-3">
        <Field name="teamId" label="Team ID (short code)" required />
        <Field name="teamName" label="Team Name" required />
        <Field name="neighbourhood" label="Neighbourhood" />
        <Field name="division" label="Division (e.g., Year 7)" />
        <button disabled={loading} className="rounded bg-blue-600 text-white px-4 py-2 disabled:opacity-50">
          {loading ? "Saving…" : "Add Team"}
        </button>
      </form>
      {msg && <p className={`mt-3 ${msg.ok ? "text-green-600" : "text-red-600"}`}>{msg.text}</p>}
    </div>
  );
}

