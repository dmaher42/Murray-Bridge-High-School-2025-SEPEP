import React from 'react';

export default function Button({ children, onClick, variant = 'primary', disabled, type = 'button', loading = false, ariaLabel }) {
  const baseClasses = 'h-10 px-4 rounded-xl text-sm font-medium transition focus:outline-none focus:ring-2 focus:ring-offset-2';
  const variantClasses = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 focus:ring-indigo-500',
    ghost: 'bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 focus:ring-slate-500',
    danger: 'bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-500'
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]}`}
      aria-label={ariaLabel}
    >
      {loading ? 'Loading...' : children}
    </button>
  );
}
