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
      <el-menu className="w-64 min-h-full bg-white/90 backdrop-blur shadow-lg rounded-r-xl p-4 space-y-2">
        {links.map(l => (
          <button
            key={l.id}
            onClick={() => {
              navigate(l.id);
              onClose();
            }}
            className={`block w-full text-left rounded-lg px-4 py-2 text-sm font-medium hover:bg-indigo-50 ${current == l.id ? 'bg-indigo-100' : ''}`}
          >
            {l.label}
          </button>
        ))}
      </el-menu>
    </el-drawer>
  );
}
