import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, ArrowUpRight, ImageIcon, FileText, AlertCircle, ArrowUpDown } from 'lucide-react';
import type { Process } from '../types';
import { useProcessStore } from '../store/processStore';
import ChannelTag from '../components/ChannelTag';


const statusLeft: Record<Process['status'], string> = {
  processing: 'border-l-blue-500',
  waiting:    'border-l-amber-500',
  completed:  'border-l-brand-500',
  error:      'border-l-red-500',
};

function ProcessCard({ process, index }: { process: Process; index: number }) {
  const navigate = useNavigate();
  const approvedImages = process.images.filter(i => i.status === 'approved').length;
  const approvedCopies = process.copies.filter(c => c.status === 'approved').length;
  const pending = process.images.filter(i => i.status === 'waiting-review').length
    + process.copies.filter(c => c.status === 'waiting-review').length;

  return (
    <div
      onClick={() => navigate(`/proceso/${process.id}`)}
      className={`bg-white rounded-2xl shadow-card hover:shadow-card-hover border border-warm-200 border-l-[3px] ${statusLeft[process.status]} p-6 cursor-pointer transition-all duration-200 group animate-fade-up`}
      style={{ animationDelay: `${index * 40}ms`, opacity: 0, animationFillMode: 'forwards' }}
    >
      {/* Top */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <h3 className="text-gray-900 font-semibold text-[14px] leading-snug group-hover:text-brand-600 transition-colors line-clamp-2 flex-1">
          {process.name}
        </h3>
        <ArrowUpRight size={15} strokeWidth={1.75} className="text-warm-300 group-hover:text-brand-400 transition-colors flex-shrink-0 mt-0.5" />
      </div>

      {/* Channels */}
      <div className="flex flex-wrap gap-1.5 mb-5">
        {process.channels.map(ch => <ChannelTag key={ch} channel={ch} />)}
      </div>

      {/* Progress */}
      <div className="h-1.5 bg-warm-100 rounded-full overflow-hidden mb-4">
        <div
          className="h-full rounded-full bg-warm-500 transition-all duration-700"
          style={{ width: `${process.progress}%` }}
        />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-[11px] text-warm-600 font-mono">
            <ImageIcon size={11} className="text-brand-400" />
            {approvedImages}/{process.images.length}
          </span>
          <span className="flex items-center gap-1.5 text-[11px] text-warm-600 font-mono">
            <FileText size={11} className="text-brand-400" />
            {approvedCopies}/{process.copies.length}
          </span>
        </div>
        {pending > 0 && (
          <span className="flex items-center gap-1 text-[11px] text-amber-500 font-medium">
            <AlertCircle size={11} />
            {pending} pendiente{pending !== 1 ? 's' : ''}
          </span>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, dot }: { label: string; value: number; dot: string }) {
  return (
    <div className="bg-white rounded-2xl shadow-card border border-warm-200 px-6 pt-6 pb-10">
      <div className="flex items-center gap-2 mb-3">
        <div className={`w-2 h-2 rounded-full flex-shrink-0 ${dot}`} />
        <p className="text-warm-500 text-[11px] font-mono uppercase tracking-wider">{label}</p>
      </div>
      <p className="text-3xl font-bold text-gray-900 tracking-tight leading-none">{value}</p>
    </div>
  );
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { processes } = useProcessStore();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<Process['status'] | 'all'>('all');
  const [sort, setSort]     = useState<'priority' | 'newest' | 'oldest'>('priority');

  const STATUS_ORDER: Record<Process['status'], number> = { waiting: 0, processing: 1, error: 2, completed: 3 };

  const filtered = processes
    .filter(p =>
      p.name.toLowerCase().includes(search.toLowerCase()) &&
      (filter === 'all' || p.status === filter)
    )
    .sort((a, b) => {
      if (sort === 'priority') return STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
      if (sort === 'newest')   return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
    });

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
          <p className="text-warm-400 text-sm mt-1 font-mono">{processes.length} proceso{processes.length !== 1 ? 's' : ''}</p>
        </div>
        <button
          onClick={() => navigate('/nuevo')}
          className="flex items-center gap-2 bg-sinergia hover:bg-sinergia-deep text-white px-4 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-sm"
        >
          <Plus size={15} strokeWidth={2.5} />
          Nuevo proceso
        </button>
      </div>

      {/* Stats — mismo DNA que las cards de proceso */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        <StatCard label="En proceso"   value={stats.processing} dot="bg-blue-400" />
        <StatCard label="Para revisar" value={stats.waiting}    dot="bg-amber-400" />
        <StatCard label="Completados"  value={stats.completed}  dot="bg-sinergia" />
      </div>

      {/* Filter bar — mismo estilo que los chips de canal */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-400" />
          <input
            type="text"
            placeholder="Buscar..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-9 pr-4 py-2 bg-white border border-warm-200 rounded-xl text-sm text-gray-800 placeholder-warm-400 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all shadow-sm w-48"
          />
        </div>
        <div className="flex items-center gap-1.5">
          {FILTERS.map(f => (
            <button key={f.value} onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all border ${
                filter === f.value
                  ? 'bg-sinergia text-white shadow-sm'
                  : 'bg-white ring-1 ring-warm-200 text-warm-500 hover:ring-warm-400 hover:text-gray-700'
              }`}>
              {f.label}
            </button>
          ))}
        </div>

        {/* Sort control */}
        <div className="ml-auto flex items-center gap-1.5 bg-white ring-1 ring-warm-200 rounded-xl px-1 py-1 shadow-sm">
          <ArrowUpDown size={12} className="text-warm-400 ml-1.5" />
          {([
            { value: 'priority', label: 'Prioridad' },
            { value: 'newest',   label: 'Más nuevo' },
            { value: 'oldest',   label: 'Más viejo' },
          ] as const).map(s => (
            <button key={s.value} onClick={() => setSort(s.value)}
              className={`px-3 py-1 rounded-lg text-[11px] font-medium transition-all ${
                sort === s.value
                  ? 'bg-warm-100 text-gray-800'
                  : 'text-warm-500 hover:text-gray-700'
              }`}>
              {s.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="text-center py-20">
          <div className="w-14 h-14 rounded-2xl bg-white shadow-card border border-warm-200 flex items-center justify-center mx-auto mb-4">
            <Search size={22} className="text-warm-300" />
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
