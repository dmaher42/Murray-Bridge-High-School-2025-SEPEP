import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';

const links = [
  { to: '/', label: 'Dashboard', end: true },
  { to: '/fixtures', label: 'Fixtures & Results' },
  { to: '/ladder', label: 'Ladder / Standings' },
  { to: '/teams', label: 'Teams & Profiles' },
  { to: '/stats', label: 'Stats' },
  { to: '/mvp', label: 'MVP & Fair-Play' },
  { to: '/news', label: 'Announcements & Media' },
  { to: '/admin', label: 'Admin' },
  { to: '/sepep', label: 'SEPEP Hub' }
];

export default function AppTopbar({ teacherMode, toggleTeacher, darkMode, toggleDark }) {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/80 backdrop-blur dark:bg-slate-900/80">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-14 flex items-center justify-between">
          <div className="flex items-center">
            <svg
              className="h-8 w-8 mr-2 text-emerald-600"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
            >
              <circle cx="12" cy="12" r="10" />
            </svg>
            <span className="font-semibold bg-gradient-to-r from-emerald-600 to-emerald-400 text-transparent bg-clip-text">
              SEPEP Tournament Hub
            </span>
          </div>
          <nav className="hidden sm:flex items-center gap-4 text-sm font-medium text-slate-900 dark:text-slate-200">
            {links.map(l => (
              <NavLink
                key={l.to}
                to={l.to}
                end={l.end}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-md transition-colors hover:bg-slate-200 dark:hover:bg-slate-700 ${isActive ? 'bg-slate-200 dark:bg-slate-700 font-semibold' : ''}`
                }
              >
                {l.label}
              </NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="sm:hidden inline-flex items-center gap-2 rounded-xl ring-1 ring-slate-300/60 bg-white p-2 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-200 dark:ring-white/10 text-slate-900"
              aria-label="Toggle menu"
            >
              {menuOpen ? (
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
              )}
            </button>
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
        <nav className={`${menuOpen ? 'flex' : 'hidden'} flex-col gap-2 py-2 sm:hidden text-sm font-medium text-slate-900 dark:text-slate-200`}>
          {links.map(l => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.end}
              className={({ isActive }) =>
                `px-3 py-2 rounded-md transition-colors hover:bg-slate-200 dark:hover:bg-slate-700 ${isActive ? 'bg-slate-200 dark:bg-slate-700 font-semibold' : ''}`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  );
}

