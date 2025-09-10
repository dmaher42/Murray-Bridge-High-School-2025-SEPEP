import React from 'react';
import { sanitizeInput } from '../utils/validation.js';

export default function TextInput({ label, value, onChange, placeholder = '', type = 'text', className = '', error, required = false, maxLength }) {
  const id = `input-${Math.random().toString(36).slice(2, 8)}`;
  return (
    <label className={`flex flex-col gap-1 ${className}`} htmlFor={id}>
      <span className="text-sm text-slate-600">{label}{required && <span className="text-red-500 ml-1">*</span>}</span>
      <input
        id={id}
        className={`h-10 rounded-xl border px-3 outline-none focus:ring-2 focus:ring-indigo-500 ${error ? 'border-red-300 focus:ring-red-500' : 'border-slate-300'}`}
        value={value}
        onChange={e => onChange(sanitizeInput(e.target.value))}
        placeholder={placeholder}
        type={type}
        maxLength={maxLength}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
      />
      {error && <span id={`${id}-error`} className="text-sm text-red-600" role="alert">{error}</span>}
    </label>
  );
}
