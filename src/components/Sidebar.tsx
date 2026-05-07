import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Plus, Bell, Settings } from 'lucide-react';
import { getProcesses } from '../store/processStore';

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const processes = getProcesses();
  const waitingCount = processes.filter(p => p.status === 'waiting').length;

  const isHome = location.pathname === '/';

  return (
    <aside className="fixed inset-y-0 left-0 w-60 bg-warm-950 flex flex-col z-30">

      {/* Wordmark */}
      <div className="px-6 pt-7 pb-6">
        <p className="font-display text-white tracking-tight text-[17px] leading-none">Sinergia</p>
        <p className="font-mono text-[10px] text-warm-500 tracking-[0.2em] uppercase mt-1.5">Content Studio</p>
      </div>

      {/* New process CTA */}
      <div className="px-4 mb-6">
        <button
          onClick={() => navigate('/nuevo')}
          className="w-full flex items-center justify-center gap-2 bg-white text-warm-950 font-body font-medium text-[13px] px-4 py-2.5 rounded hover:bg-warm-50 transition-colors duration-150"
        >
          <Plus size={13} strokeWidth={2.5} />
          Nuevo proceso
        </button>
      </div>

      {/* Nav */}
      <nav className="px-3 flex-1 space-y-0.5">
        <NavLink
          to="/"
          className={`flex items-center gap-3 px-3 py-2.5 rounded text-[13px] transition-colors duration-100 font-body ${
            isHome
              ? 'bg-warm-900 text-white'
              : 'text-warm-400 hover:text-warm-100 hover:bg-warm-900/60'
          }`}
        >
          <LayoutDashboard size={15} strokeWidth={1.75} className={isHome ? 'text-white' : 'text-warm-500'} />
          Dashboard
          {waitingCount > 0 && (
            <span className="ml-auto font-mono text-[10px] bg-white/10 text-warm-300 px-1.5 py-0.5 rounded-sm">
              {waitingCount}
            </span>
          )}
        </NavLink>
      </nav>

      {/* Stats */}
      <div className="px-4 py-5 border-t border-warm-900/80">
        <p className="font-mono text-[9px] text-warm-600 uppercase tracking-[0.18em] mb-3">Resumen</p>
        <div className="space-y-2">
          {[
            { label: 'En proceso',    value: processes.filter(p => p.status === 'processing').length, color: 'bg-status-processing' },
            { label: 'Para revisar',  value: processes.filter(p => p.status === 'waiting').length,    color: 'bg-status-waiting' },
            { label: 'Completados',   value: processes.filter(p => p.status === 'completed').length,  color: 'bg-status-completed' },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${color} opacity-80`} />
                <span className="font-body text-[12px] text-warm-500">{label}</span>
              </div>
              <span className="font-mono text-[11px] text-warm-400">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-warm-900/80 px-3 py-3 flex gap-1">
        {[{ icon: Bell, label: 'Notificaciones' }, { icon: Settings, label: 'Ajustes' }].map(({ icon: Icon, label }) => (
          <button key={label} title={label}
            className="flex items-center justify-center w-8 h-8 rounded text-warm-600 hover:text-warm-300 hover:bg-warm-900 transition-colors">
            <Icon size={14} strokeWidth={1.75} />
          </button>
        ))}
      </div>
    </aside>
  );
}
