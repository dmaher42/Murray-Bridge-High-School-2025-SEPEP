import React from 'react';

export default function AppTopbar({ onMenu, teacherMode, toggleTeacher }) {
  return (
    <header className="flex items-center justify-between bg-blue-600 text-white px-4 py-2">
      <button className="md:hidden" onClick={onMenu} aria-label="Open menu">
        <svg className="w-6 h-6" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      <h1 className="font-semibold">SEPEP Tournament Hub</h1>
      <button onClick={toggleTeacher} className="text-sm bg-white/10 px-2 py-1 rounded" aria-label="Toggle teacher mode">
        {teacherMode ? 'Teacher Mode' : 'Student Mode'}
      </button>
    </header>
  );
}
