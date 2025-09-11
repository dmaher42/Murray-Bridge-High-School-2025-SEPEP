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
    <div className={`${open ? 'block' : 'hidden'} md:block fixed md:relative inset-0 z-40`}>
      <div className="absolute inset-0 bg-black/50 md:hidden" onClick={onClose}></div>
      <nav className="absolute md:relative bg-white w-64 h-full p-4 space-y-2 overflow-y-auto">
        {links.map(l => (
          <button key={l.id} onClick={() => { navigate(l.id); onClose(); }} className={`block w-full text-left px-2 py-1 rounded ${current === l.id ? 'bg-blue-100' : 'hover:bg-blue-50'}`}>
            {l.label}
          </button>
        ))}
      </nav>
    </div>
  );
}
