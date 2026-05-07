import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Zap, Bell, Settings } from 'lucide-react';
import { getProcesses } from '../store/processStore';

const navItems = [
  { to: '/',       icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/nuevo',  icon: Zap,             label: 'Nuevo proceso' },
];

export default function Sidebar() {
  const location = useLocation();
  const waitingCount = getProcesses().filter(p => p.status === 'waiting').length;

  return (
    <aside className="fixed inset-y-0 left-0 w-64 bg-sidebar flex flex-col z-30">
      {/* Logo */}
      <div className="px-6 py-6 border-b border-white/5">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center flex-shrink-0">
            <Zap size={16} className="text-white" />
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-tight">Sinergia</p>
            <p className="text-white/40 text-xs leading-tight">Contenido</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => {
          const isActive = to === '/'
            ? location.pathname === '/'
            : location.pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150 group ${
                isActive
                  ? 'bg-brand-600/80 text-white font-medium'
                  : 'text-white/50 hover:text-white/90 hover:bg-white/5'
              }`}
            >
              <Icon size={17} className={isActive ? 'text-white' : 'text-white/40 group-hover:text-white/70'} />
              <span>{label}</span>
              {label === 'Dashboard' && waitingCount > 0 && (
                <span className="ml-auto bg-brand-500 text-white text-xs font-semibold px-2 py-0.5 rounded-full">
                  {waitingCount}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Quick stats */}
      <div className="px-4 py-3 mx-3 mb-3 rounded-xl bg-white/5 border border-white/5">
        <p className="text-white/30 text-xs font-medium uppercase tracking-wider mb-2">Resumen</p>
        <div className="space-y-1.5">
          {[
            { label: 'En proceso', value: getProcesses().filter(p => p.status === 'processing').length, color: 'bg-blue-400' },
            { label: 'Para revisar', value: getProcesses().filter(p => p.status === 'waiting').length, color: 'bg-amber-400' },
            { label: 'Completados', value: getProcesses().filter(p => p.status === 'completed').length, color: 'bg-emerald-400' },
          ].map(({ label, value, color }) => (
            <div key={label} className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${color}`} />
                <span className="text-white/50 text-xs">{label}</span>
              </div>
              <span className="text-white/70 text-xs font-semibold">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Footer */}
      <div className="px-3 pb-4 space-y-1">
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/40 hover:text-white/70 hover:bg-white/5 transition-all">
          <Bell size={17} />
          <span>Notificaciones</span>
        </button>
        <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-white/40 hover:text-white/70 hover:bg-white/5 transition-all">
          <Settings size={17} />
          <span>Configuración</span>
        </button>
      </div>
    </aside>
  );
}
