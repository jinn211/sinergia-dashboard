import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, ArrowUpRight, ImageIcon, FileText, AlertCircle, TrendingUp, Clock, Zap } from 'lucide-react';
import type { Process } from '../types';
import { getProcesses, useProcessStore } from '../store/processStore';
import { ProcessStatusBadge } from '../components/StatusBadge';
import ChannelTag from '../components/ChannelTag';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-UY', { day: 'numeric', month: 'short', year: 'numeric' });
}

function ProcessCard({ process, index }: { process: Process; index: number }) {
  const navigate = useNavigate();
  const approvedImages = process.images.filter(i => i.status === 'approved').length;
  const approvedCopies = process.copies.filter(c => c.status === 'approved').length;
  const pending = process.images.filter(i => i.status === 'waiting-review').length
    + process.copies.filter(c => c.status === 'waiting-review').length;

  const progressColor = {
    processing: 'from-blue-400 to-blue-500',
    waiting:    'from-amber-400 to-amber-500',
    completed:  'from-brand-400 to-brand-500',
    error:      'from-red-400 to-red-500',
  }[process.status];

  return (
    <div
      onClick={() => navigate(`/proceso/${process.id}`)}
      className="bg-white rounded-2xl shadow-card hover:shadow-card-hover border border-warm-300/60 p-5 cursor-pointer transition-all duration-200 group animate-fade-up"
      style={{ animationDelay: `${index * 40}ms`, opacity: 0, animationFillMode: 'forwards' }}
    >
      {/* Top */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-gray-900 font-semibold text-[14px] leading-snug group-hover:text-brand-600 transition-colors line-clamp-2">
          {process.name}
        </h3>
        <div className="flex items-center gap-2 flex-shrink-0">
          <ProcessStatusBadge status={process.status} />
          <ArrowUpRight size={15} strokeWidth={1.75} className="text-warm-400 group-hover:text-brand-400 transition-colors" />
        </div>
      </div>

      {/* Date */}
      <p className="text-warm-500 text-[11px] font-mono mb-3 flex items-center gap-1.5">
        <Clock size={10} />
        {formatDate(process.createdAt)}
        {process.contextualAnswers?.sede && <span className="text-warm-400">· {process.contextualAnswers.sede}</span>}
      </p>

      {/* Channels */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {process.channels.map(ch => <ChannelTag key={ch} channel={ch} />)}
      </div>

      {/* Progress bar */}
      <div className="space-y-1.5">
        <div className="flex justify-between items-center">
          <span className="text-warm-500 text-[11px]">Progreso</span>
          <span className="text-warm-600 text-[11px] font-semibold font-mono">{process.progress}%</span>
        </div>
        <div className="h-1.5 bg-warm-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full bg-gradient-to-r ${progressColor} transition-all duration-700`}
            style={{ width: `${process.progress}%` }}
          />
        </div>
      </div>

      {/* Stats footer */}
      <div className="flex items-center gap-4 mt-4 pt-4 border-t border-warm-200">
        <span className="flex items-center gap-1.5 text-[11px] text-warm-500">
          <ImageIcon size={11} className="text-brand-400" />
          {approvedImages}/{process.images.length} img
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-warm-500">
          <FileText size={11} className="text-brand-400" />
          {approvedCopies}/{process.copies.length} copy
        </span>
        {pending > 0 && (
          <span className="ml-auto flex items-center gap-1 text-[11px] text-amber-500 font-medium">
            <AlertCircle size={11} />
            {pending} para revisar
          </span>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon, color }: { label: string; value: number; icon: React.ElementType; color: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-warm-300/60 p-5">
      <div className="flex items-center justify-between mb-3">
        <p className="text-warm-500 text-[12px] font-medium">{label}</p>
        <div className={`w-8 h-8 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={15} className="text-white" />
        </div>
      </div>
      <p className="text-3xl font-bold text-gray-900 tracking-tight">{value}</p>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { subscribe } = useProcessStore();
  const [processes, setProcesses] = useState(getProcesses());
  const [search, setSearch]       = useState('');
  const [filter, setFilter]       = useState<Process['status'] | 'all'>('all');

  useEffect(() => { const u = subscribe(); return u; }, [subscribe]);
  useEffect(() => { setProcesses(getProcesses()); });

  const filtered = processes.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) &&
    (filter === 'all' || p.status === filter)
  );

  const stats = {
    processing: processes.filter(p => p.status === 'processing').length,
    waiting:    processes.filter(p => p.status === 'waiting').length,
    completed:  processes.filter(p => p.status === 'completed').length,
    total:      processes.length,
  };

  const FILTERS: { value: Process['status'] | 'all'; label: string }[] = [
    { value: 'all',        label: 'Todos' },
    { value: 'processing', label: 'En proceso' },
    { value: 'waiting',    label: 'Para revisar' },
    { value: 'completed',  label: 'Completados' },
    { value: 'error',      label: 'Con errores' },
  ];

  return (
    <div className="p-8 max-w-7xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Procesos de contenido</h1>
          <p className="text-warm-500 text-sm mt-1">{processes.length} proceso{processes.length !== 1 ? 's' : ''} en total</p>
        </div>
        <button
          onClick={() => navigate('/nuevo')}
          className="flex items-center gap-2 bg-brand-400 hover:bg-brand-500 text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-colors shadow-sm"
        >
          <Plus size={16} />
          Nuevo proceso
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <StatCard label="Total"         value={stats.total}      icon={TrendingUp}  color="bg-gray-700" />
        <StatCard label="En proceso"    value={stats.processing} icon={Zap}         color="bg-blue-500" />
        <StatCard label="Para revisar"  value={stats.waiting}    icon={Clock}       color="bg-amber-500" />
        <StatCard label="Completados"   value={stats.completed}  icon={TrendingUp}  color="bg-brand-400" />
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-400" />
          <input
            type="text"
            placeholder="Buscar procesos..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 bg-white border border-warm-300 rounded-xl text-sm text-gray-800 placeholder-warm-400 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all w-52"
          />
        </div>
        <div className="flex items-center gap-1.5">
          {FILTERS.map(f => (
            <button key={f.value} onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all ${
                filter === f.value
                  ? 'bg-brand-400 text-white shadow-sm'
                  : 'bg-white border border-warm-300 text-warm-600 hover:border-brand-300 hover:text-brand-600'
              }`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-warm-200 flex items-center justify-center mx-auto mb-4">
            <Search size={24} className="text-warm-300" />
          </div>
          <p className="text-gray-600 font-semibold">Sin resultados</p>
          <p className="text-warm-400 text-sm mt-1">Probá otros filtros o creá un proceso nuevo</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((p, i) => <ProcessCard key={p.id} process={p} index={i} />)}
        </div>
      )}
    </div>
  );
}
