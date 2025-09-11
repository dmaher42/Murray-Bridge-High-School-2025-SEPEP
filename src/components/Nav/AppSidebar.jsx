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
    <div className={`drawer z-40 ${open ? 'drawer-open' : ''} md:drawer-open`}>
      <input id="app-sidebar-drawer" type="checkbox" className="drawer-toggle" checked={open} readOnly />
      <div className="drawer-content"></div>
      <div className="drawer-side">
        <label htmlFor="app-sidebar-drawer" className="drawer-overlay" onClick={onClose}></label>
        <nav className="w-64 min-h-full bg-white/90 backdrop-blur shadow-lg rounded-r-xl p-4 space-y-2">
          {links.map(l => (
            <button
              key={l.id}
              onClick={() => {
                navigate(l.id);
                onClose();
              }}
              className={`block w-full text-left rounded-lg px-4 py-2 text-sm font-medium hover:bg-indigo-50 ${current === l.id ? 'bg-indigo-100' : ''}`}
            >
              {l.label}
            </button>
          ))}
        </nav>
      </div>
    </div>
  );
}
