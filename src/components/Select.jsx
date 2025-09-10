import React from 'react';

export default function Select({ label, value, onChange, options, className = '', error, required = false }) {
  const id = `select-${Math.random().toString(36).slice(2, 8)}`;
  return (
    <label className={`flex flex-col gap-1 ${className}`} htmlFor={id}>
      <span className="text-sm text-slate-600">{label}{required && <span className="text-red-500 ml-1">*</span>}</span>
      <select
        id={id}
        className={`h-10 rounded-xl border px-3 outline-none focus:ring-2 focus:ring-indigo-500 ${error ? 'border-red-300 focus:ring-red-500' : 'border-slate-300'}`}
        value={value}
        onChange={e => onChange(e.target.value)}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
      >
        {options.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
      {error && <span id={`${id}-error`} className="text-sm text-red-600" role="alert">{error}</span>}
    </label>
  );
}
