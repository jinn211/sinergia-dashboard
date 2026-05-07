import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Plus, Bell, Settings } from 'lucide-react';
import { getProcesses } from '../store/processStore';

export default function Sidebar() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const processes = getProcesses();
  const waiting   = processes.filter(p => p.status === 'waiting').length;
  const isHome    = location.pathname === '/';

  return (
    <aside className="fixed inset-y-0 left-0 w-60 bg-sidebar flex flex-col z-30">

      {/* Logo */}
      <div className="px-6 pt-6 pb-5 border-b border-white/5">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-lg bg-brand-400 flex items-center justify-center flex-shrink-0">
            <span className="text-white font-bold text-sm leading-none">S</span>
          </div>
          <div>
            <p className="text-white font-semibold text-[14px] leading-tight tracking-tight">Sinergia</p>
            <p className="text-white/35 text-[10px] leading-tight tracking-wide">Content Studio</p>
          </div>
        </div>
      </div>

      {/* CTA */}
      <div className="px-4 py-4">
        <button
          onClick={() => navigate('/nuevo')}
          className="w-full flex items-center justify-center gap-2 bg-brand-400 hover:bg-brand-500 text-white font-semibold text-[13px] px-4 py-2.5 rounded-xl transition-colors duration-150"
        >
          <Plus size={14} strokeWidth={2.5} />
          Nuevo proceso
        </button>
      </div>

      {/* Nav */}
      <nav className="px-3 flex-1 space-y-0.5">
        <NavLink to="/"
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-100 ${
            isHome
              ? 'bg-white/10 text-white'
              : 'text-white/45 hover:text-white/80 hover:bg-white/6'
          }`}>
          <LayoutDashboard size={16} strokeWidth={1.75}
            className={isHome ? 'text-brand-300' : 'text-white/30'} />
          Dashboard
          {waiting > 0 && (
            <span className="ml-auto bg-brand-400 text-white text-[10px] font-semibold px-2 py-0.5 rounded-full">
              {waiting}
            </span>
          )}
        </NavLink>
      </nav>

      {/* Stats summary */}
      <div className="mx-3 mb-3 rounded-xl bg-white/5 border border-white/6 p-3.5">
        <p className="text-white/25 text-[9px] font-semibold uppercase tracking-[0.18em] mb-3">Resumen</p>
        {[
          { label: 'En proceso',   n: processes.filter(p => p.status === 'processing').length, dot: 'bg-blue-400' },
          { label: 'Para revisar', n: processes.filter(p => p.status === 'waiting').length,    dot: 'bg-amber-400' },
          { label: 'Completados',  n: processes.filter(p => p.status === 'completed').length,  dot: 'bg-brand-400' },
        ].map(({ label, n, dot }) => (
          <div key={label} className="flex items-center justify-between py-1">
            <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${dot}`} />
              <span className="text-white/40 text-[12px]">{label}</span>
            </div>
            <span className="text-white/55 text-[12px] font-semibold font-mono">{n}</span>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-white/5 px-3 py-3 flex gap-1">
        {[Bell, Settings].map((Icon, i) => (
          <button key={i}
            className="w-8 h-8 rounded-lg text-white/25 hover:text-white/60 hover:bg-white/8 flex items-center justify-center transition-all">
            <Icon size={15} strokeWidth={1.75} />
          </button>
        ))}
      </div>
    </aside>
  );
}
