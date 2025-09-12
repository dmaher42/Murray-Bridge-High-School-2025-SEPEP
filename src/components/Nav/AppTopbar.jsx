import React from 'react';

export default function AppTopbar({ teacherMode, toggleTeacher, darkMode, toggleDark }) {
  return (
    <header className="sticky top-0 z-40 bg-white/70 dark:bg-slate-900/70 backdrop-blur border-b border-slate-200/60 dark:border-slate-800">
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between">
        <div className="flex items-center">
          <span className="font-semibold text-slate-900 dark:text-white">SEPEP Tournament Hub</span>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
          <a href="#fixtures" className="text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">Fixtures</a>
          <a href="#ladder" className="text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">Ladder</a>
          <a href="#teams" className="text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">Teams</a>
          <a href="#news" className="text-slate-700 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white">News</a>
        </nav>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTeacher}
            className="hidden sm:inline-flex items-center gap-2 rounded-xl ring-1 ring-slate-300/60 bg-white px-4 py-2 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-200 dark:ring-white/10 text-sm"
            aria-label="Toggle teacher mode"
          >
            {teacherMode ? 'Teacher' : 'Student'}
          </button>
          <button
            onClick={toggleDark}
            className="inline-flex items-center gap-2 rounded-xl ring-1 ring-slate-300/60 bg-white p-2 hover:bg-slate-50 dark:bg-slate-900 dark:text-slate-200 dark:ring-white/10"
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
