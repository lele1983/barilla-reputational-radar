import React, { useState } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { BarChart3, Radar, MessageSquare, Users, AlertTriangle, Mic, Target, Newspaper, Activity, Menu, X } from 'lucide-react';

const navItems = [
  { to: '/', icon: Radar, label: 'Il Radar' },
  { to: '/situazione', icon: Activity, label: 'Situazione' },
  { to: '/agenda', icon: BarChart3, label: 'Agenda Pubblica' },
  { to: '/conversazione', icon: MessageSquare, label: 'Conversazione' },
  { to: '/opportunita', icon: AlertTriangle, label: 'Opportunità & Rischi' },
  { to: '/consumatore', icon: Mic, label: 'Voce del Consumatore' },
  { to: '/raccomandazioni', icon: Target, label: 'Raccomandazioni' },
  { to: '/stampa', icon: Newspaper, label: 'Rassegna Stampa' },
  { to: '/sintesi', icon: Users, label: 'Sintesi Radar' },
];

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen">
      {/* Sidebar */}
      <aside className={`fixed inset-y-0 left-0 z-50 w-64 bg-barilla-surface border-r border-barilla-border transform transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex items-center gap-3 px-5 py-4 border-b border-barilla-border">
          <div className="w-9 h-9 rounded-lg bg-barilla-red flex items-center justify-center font-bold text-white text-lg">B</div>
          <div>
            <div className="font-semibold text-sm">Barilla Radar</div>
            <div className="text-[10px] text-gray-400 uppercase tracking-wider">Reputazionale</div>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[10px] text-emerald-400">LIVE</span>
          </div>
        </div>
        <nav className="p-3 space-y-0.5 overflow-y-auto h-[calc(100vh-64px)]">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-all ${
                  isActive
                    ? 'bg-barilla-red/10 text-barilla-red border border-barilla-red/20 font-medium'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'
                }`
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main content */}
      <main className="flex-1 min-w-0">
        <header className="sticky top-0 z-30 bg-barilla-dark/80 backdrop-blur-xl border-b border-barilla-border px-4 py-3 flex items-center gap-3 lg:hidden">
          <button onClick={() => setSidebarOpen(true)} className="p-1.5 rounded-lg hover:bg-white/10">
            <Menu size={20} />
          </button>
          <span className="font-semibold text-sm">Barilla Radar</span>
        </header>
        <div className="p-4 lg:p-6 max-w-[1400px] mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
