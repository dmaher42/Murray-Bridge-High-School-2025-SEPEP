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

export default function AppSidebar() {
  return (
    <el-drawer id="app-sidebar-drawer" className="z-40 md:open">
      <el-menu className="w-64 min-h-full bg-white/80 dark:bg-slate-900/70 backdrop-blur border-r border-slate-200/60 dark:border-slate-800 p-4 space-y-2">
        {links.map(l => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.end}
            className={({ isActive }) =>
              `block w-full text-left rounded-lg px-4 py-2 text-sm font-medium hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition ${isActive ? 'bg-slate-100 dark:bg-slate-800/40' : ''}`
            }
          >
            {l.label}
          </NavLink>
        ))}
      </el-menu>
    </el-drawer>
  );
}
