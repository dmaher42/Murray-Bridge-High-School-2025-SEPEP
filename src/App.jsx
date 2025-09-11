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
  useEffect(() => {
    function onHash() {
      const v = window.location.hash.replace('#', '');
      if (v && views[v]) setView(v);
    }
    onHash();
    window.addEventListener('hashchange', onHash);
    return () => window.removeEventListener('hashchange', onHash);
  }, []);
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
  return (
    <div className="h-screen flex overflow-hidden">
      <AppSidebar current={view} navigate={navigate} open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col">
        <AppTopbar onMenu={() => setSidebarOpen(true)} teacherMode={teacherMode} toggleTeacher={toggleTeacher} />
        <main className="flex-1 overflow-y-auto p-4 bg-slate-50">
          <Current teacherMode={teacherMode} />
        </main>
      </div>
    </div>
  );
}
