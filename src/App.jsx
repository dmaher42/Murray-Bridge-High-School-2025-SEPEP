import React, { useEffect, useState } from 'react';
import { HashRouter, Routes, Route } from 'react-router-dom';
import AppTopbar from './components/Nav/AppTopbar.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Fixtures from './pages/Fixtures.jsx';
import Ladder from './pages/Ladder.jsx';
import Teams from './pages/Teams.jsx';
import Stats from './pages/Stats.jsx';
import MVP from './pages/MVP.jsx';
import News from './pages/News.jsx';
import Admin from './pages/Admin.jsx';
import SepepHub from './pages/SepepHub.jsx';

export default function App() {
  const [teacherMode, setTeacherMode] = useState(() => localStorage.getItem('teacherMode') === '1');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === '1');
  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);
  function toggleTeacher() {
    const next = !teacherMode;
    setTeacherMode(next);
    localStorage.setItem('teacherMode', next ? '1' : '0');
  }
  function toggleDark() {
    const next = !darkMode;
    setDarkMode(next);
    localStorage.setItem('darkMode', next ? '1' : '0');
  }
  return (
    <HashRouter>
      <div className="min-h-screen bg-white dark:bg-slate-900">
        <div className="min-h-screen flex flex-col">
          <AppTopbar
            teacherMode={teacherMode}
            toggleTeacher={toggleTeacher}
            darkMode={darkMode}
            toggleDark={toggleDark}
          />
          <main className="flex-1 py-8 sm:py-10 lg:py-14">
            <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 leading-7 text-slate-600 dark:text-slate-300">
              <Routes>
                <Route path="/" element={<Dashboard teacherMode={teacherMode} />} />
                <Route path="/fixtures" element={<Fixtures teacherMode={teacherMode} />} />
                <Route path="/ladder" element={<Ladder teacherMode={teacherMode} />} />
                <Route path="/teams" element={<Teams teacherMode={teacherMode} />} />
                <Route path="/stats" element={<Stats teacherMode={teacherMode} />} />
                <Route path="/mvp" element={<MVP teacherMode={teacherMode} />} />
                <Route path="/news" element={<News teacherMode={teacherMode} />} />
                <Route path="/admin" element={<Admin teacherMode={teacherMode} />} />
                <Route path="/sepep" element={<SepepHub teacherMode={teacherMode} />} />
              </Routes>
            </div>
          </main>
        </div>
      </div>
    </HashRouter>
  );
}
