import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, ArrowUpRight, ImageIcon, FileText, Clock, Zap, TrendingUp, AlertCircle } from 'lucide-react';
import type { Process } from '../types';
import { getProcesses, useProcessStore } from '../store/processStore';
import { ProcessStatusBadge } from '../components/StatusBadge';
import ChannelTag from '../components/ChannelTag';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-UY', {
    day: 'numeric', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
}

function ProgressBar({ value, status }: { value: number; status: Process['status'] }) {
  const colorMap: Record<Process['status'], string> = {
    processing: 'bg-gradient-to-r from-blue-400 to-blue-600',
    waiting:    'bg-gradient-to-r from-amber-400 to-amber-600',
    completed:  'bg-gradient-to-r from-emerald-400 to-emerald-600',
    error:      'bg-gradient-to-r from-red-400 to-red-600',
  };
  return (
    <div className="w-full bg-surface-200 rounded-full h-1.5 overflow-hidden">
      <div
        className={`h-full rounded-full transition-all duration-700 ${colorMap[status]}`}
        style={{ width: `${value}%` }}
      />
    </div>
  );
}

function ProcessCard({ process }: { process: Process }) {
  const navigate = useNavigate();
  const approvedImages = process.images.filter(i => i.status === 'approved').length;
  const approvedCopies = process.copies.filter(c => c.status === 'approved').length;
  const pendingReview = process.images.filter(i => i.status === 'waiting-review').length
    + process.copies.filter(c => c.status === 'waiting-review').length;

  return (
    <div
      onClick={() => navigate(`/proceso/${process.id}`)}
      className="bg-white rounded-2xl border border-surface-200 p-5 cursor-pointer hover:border-brand-200 hover:shadow-card-hover transition-all duration-200 group animate-slide-up"
    >
      <div className="flex items-start justify-between gap-4 mb-3">
        <div className="flex-1 min-w-0">
          <h3 className="text-gray-900 font-semibold text-sm leading-snug truncate group-hover:text-brand-600 transition-colors">
            {process.name}
          </h3>
          <p className="text-gray-400 text-xs mt-1 flex items-center gap-1">
            <Clock size={11} />
            {formatDate(process.createdAt)}
          </p>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <ProcessStatusBadge status={process.status} />
          <ArrowUpRight size={14} className="text-gray-300 group-hover:text-brand-400 transition-colors" />
        </div>
      </div>

      {/* Channels */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {process.channels.map(ch => (
          <ChannelTag key={ch} channel={ch} />
        ))}
      </div>

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs">
          <span className="text-gray-400">Progreso general</span>
          <span className="text-gray-600 font-semibold">{process.progress}%</span>
        </div>
        <ProgressBar value={process.progress} status={process.status} />
      </div>

      {/* Stats row */}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-surface-100">
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <ImageIcon size={12} className="text-brand-400" />
          <span>{approvedImages}/{process.images.length} imágenes</span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-gray-500">
          <FileText size={12} className="text-brand-400" />
          <span>{approvedCopies}/{process.copies.length} copys</span>
        </div>
        {pendingReview > 0 && (
          <div className="ml-auto flex items-center gap-1 text-xs text-amber-600 font-medium">
            <AlertCircle size={11} />
            {pendingReview} para revisar
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: React.ElementType; color: string }) {
  return (
    <div className="bg-white rounded-2xl border border-surface-200 p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-gray-500 text-sm">{label}</p>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={16} className="text-white" />
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900">{value}</p>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { subscribe } = useProcessStore();
  const [processes, setProcesses] = useState(getProcesses());
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<Process['status'] | 'all'>('all');

  useEffect(() => {
    const unsub = subscribe();
    return unsub;
  }, [subscribe]);

  useEffect(() => {
    setProcesses(getProcesses());
  });

  const filtered = processes.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = filterStatus === 'all' || p.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    processing: processes.filter(p => p.status === 'processing').length,
    waiting:    processes.filter(p => p.status === 'waiting').length,
    completed:  processes.filter(p => p.status === 'completed').length,
    error:      processes.filter(p => p.status === 'error').length,
  };

  return (
    <div className="p-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Dashboard de Contenido</h1>
          <p className="text-gray-500 text-sm mt-1">
            {processes.length} proceso{processes.length !== 1 ? 's' : ''} en total
          </p>
        </div>
        <button
          onClick={() => navigate('/nuevo')}
          className="flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white px-4 py-2.5 rounded-xl font-medium text-sm transition-colors shadow-sm"
        >
          <Plus size={16} />
          Nuevo proceso
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard label="En proceso"   value={stats.processing} icon={Zap}        color="bg-blue-500" />
        <StatCard label="Para revisar" value={stats.waiting}    icon={Clock}       color="bg-amber-500" />
        <StatCard label="Completados"  value={stats.completed}  icon={TrendingUp}  color="bg-emerald-500" />
        <StatCard label="Con errores"  value={stats.error}      icon={AlertCircle} color="bg-red-500" />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar procesos..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-white border border-surface-200 rounded-xl text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100 transition"
          />
        </div>
        <div className="flex items-center gap-2">
          {(['all', 'processing', 'waiting', 'completed', 'error'] as const).map(s => {
            const labels: Record<typeof s, string> = {
              all: 'Todos', processing: 'En proceso', waiting: 'Para revisar',
              completed: 'Completados', error: 'Con errores',
            };
            return (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                  filterStatus === s
                    ? 'bg-brand-600 text-white'
                    : 'bg-white border border-surface-200 text-gray-600 hover:border-brand-200 hover:text-brand-600'
                }`}
              >
                {labels[s]}
              </button>
            );
          })}
        </div>
      </div>

      {/* Process list */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-surface-100 flex items-center justify-center mx-auto mb-4">
            <Search size={24} className="text-gray-300" />
          </div>
          <p className="text-gray-500 font-medium">No se encontraron procesos</p>
          <p className="text-gray-400 text-sm mt-1">Probá con otros filtros o creá uno nuevo</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map(p => (
            <ProcessCard key={p.id} process={p} />
          ))}
        </div>
      )}
    </div>
  );
}
