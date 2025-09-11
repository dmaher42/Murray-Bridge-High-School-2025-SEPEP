import React from 'react';

const links = [
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'fixtures', label: 'Fixtures & Results' },
  { id: 'ladder', label: 'Ladder / Standings' },
  { id: 'teams', label: 'Teams & Profiles' },
  { id: 'stats', label: 'Stats' },
  { id: 'mvp', label: 'MVP & Fair-Play' },
  { id: 'news', label: 'Announcements & Media' },
  { id: 'admin', label: 'Admin' }
];

export default function AppSidebar({ current, navigate, open, onClose }) {
  return (
    <el-drawer id="app-sidebar-drawer" open={open} onClose={onClose} className="z-40 md:open">
      <el-menu className="w-64 min-h-full bg-white/80 dark:bg-slate-900/70 backdrop-blur border-r border-slate-200/60 dark:border-slate-800 p-4 space-y-2">
        {links.map(l => (
          <button
            key={l.id}
            onClick={() => {
              navigate(l.id);
              onClose();
            }}
            className={`block w-full text-left rounded-lg px-4 py-2 text-sm font-medium hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition ${current == l.id ? 'bg-slate-100 dark:bg-slate-800/40' : ''}`}
          >
            {l.label}
          </button>
        ))}
      </el-menu>
    </el-drawer>
  );
}
