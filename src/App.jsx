import React, { useEffect, useState } from 'react';
import AppTopbar from './components/Nav/AppTopbar.jsx';
import AppSidebar from './components/Nav/AppSidebar.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Fixtures from './pages/Fixtures.jsx';
import Ladder from './pages/Ladder.jsx';
import Teams from './pages/Teams.jsx';
import Stats from './pages/Stats.jsx';
import MVP from './pages/MVP.jsx';
import News from './pages/News.jsx';
import Admin from './pages/Admin.jsx';

const views = {
  dashboard: Dashboard,
  fixtures: Fixtures,
  ladder: Ladder,
  teams: Teams,
  stats: Stats,
  mvp: MVP,
  news: News,
  admin: Admin
};

export default function App() {
  const [view, setView] = useState('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [teacherMode, setTeacherMode] = useState(() => localStorage.getItem('teacherMode') === '1');
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('darkMode') === '1');
  useEffect(() => {
    if (darkMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  }, [darkMode]);
  useEffect(() => {
    function onHash() {
      const v = window.location.hash.replace('#', '');
      if (v && views[v]) setView(v);
    }
    onHash();
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
  useEffect(() => {
    const el = document.getElementById(view);
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  }, [view]);
  function navigate(v) {
    window.location.hash = v;
    setView(v);
  }
  const Current = views[view] || Dashboard;
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
    <div className="min-h-screen bg-white dark:bg-slate-900">
      <AppSidebar current={view} navigate={navigate} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="min-h-screen flex flex-col">
        <AppTopbar onMenu={() => setSidebarOpen(true)} teacherMode={teacherMode} toggleTeacher={toggleTeacher} darkMode={darkMode} toggleDark={toggleDark} />
        <main className="flex-1 py-8 sm:py-10 lg:py-14">
          <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 leading-7 text-slate-600 dark:text-slate-300">
            <Current teacherMode={teacherMode} />
          </div>
        </main>
      </div>
    </div>
  );
}
