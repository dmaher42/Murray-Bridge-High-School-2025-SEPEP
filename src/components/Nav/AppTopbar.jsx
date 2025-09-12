import React from 'react';
import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/fixtures', label: 'Fixtures & Results' },
  { to: '/ladder', label: 'Ladder / Standings' },
  { to: '/teams', label: 'Teams & Profiles' },
  { to: '/stats', label: 'Stats' },
  { to: '/mvp', label: 'MVP & Fair-Play' },
  { to: '/news', label: 'Announcements & Media' },
  { to: '/admin', label: 'Admin' }
];

export default function AppTopbar({ teacherMode, toggleTeacher, darkMode, toggleDark }) {
  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-emerald-700 to-emerald-300">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <div className="flex items-center">
          <span className="font-semibold text-white">SEPEP Tournament Hub</span>
        </div>
        <nav className="flex items-center gap-4 text-sm font-medium overflow-x-auto text-white">
          {links.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `px-3 py-2 rounded-md transition-colors hover:bg-emerald-600/40 ${isActive ? 'bg-emerald-600/40 font-semibold' : ''}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTeacher}
            className="hidden sm:inline-flex items-center gap-2 rounded-xl ring-1 ring-slate-300/60 bg-white px-4 py-2 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-200 dark:ring-white/10 text-sm text-slate-900"
            aria-label="Toggle teacher mode"
          >
            {teacherMode ? 'Teacher' : 'Student'}
          </button>
          <button
            onClick={toggleDark}
            className="inline-flex items-center gap-2 rounded-xl ring-1 ring-slate-300/60 bg-white p-2 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-200 dark:ring-white/10 text-slate-900"
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9 9 0 1112.999 3.25a7.5 7.5 0 008.753 11.752z" />
              </svg>
            ) : (
              <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364 1.386-1.591 1.591M21 12h-2.25m-1.386 6.364-1.591-1.591M12 18.75V21m-6.364-1.386 1.591-1.591M3 12h2.25m1.386-6.364 1.591 1.591M12 8.25a3.75 3.75 0 100 7.5 3.75 3.75 0 000-7.5z" />
              </svg>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}

