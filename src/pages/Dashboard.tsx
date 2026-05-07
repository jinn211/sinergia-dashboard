import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, ArrowUpRight, ImageIcon, FileText, AlertCircle } from 'lucide-react';
import type { Process } from '../types';
import { getProcesses, useProcessStore } from '../store/processStore';
import { ProcessStatusBadge } from '../components/StatusBadge';
import ChannelTag from '../components/ChannelTag';

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('es-UY', {
    day: 'numeric', month: 'short', year: 'numeric',
  });
}

const statusBorder: Record<Process['status'], string> = {
  processing: 'border-l-status-processing',
  waiting:    'border-l-status-waiting',
  completed:  'border-l-status-completed',
  error:      'border-l-status-error',
};

function ProcessRow({ process, index }: { process: Process; index: number }) {
  const navigate = useNavigate();
  const approvedImages = process.images.filter(i => i.status === 'approved').length;
  const approvedCopies = process.copies.filter(c => c.status === 'approved').length;
  const pending = process.images.filter(i => i.status === 'waiting-review').length
    + process.copies.filter(c => c.status === 'waiting-review').length;

  return (
    <div
      onClick={() => navigate(`/proceso/${process.id}`)}
      className={`group bg-white border-b border-warm-100 border-l-[2px] ${statusBorder[process.status]} px-8 py-5 cursor-pointer hover:bg-warm-50 transition-colors duration-150`}
      style={{ animationDelay: `${index * 30}ms` }}
    >
      <div className="flex items-start gap-8">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          {/* Process name — the hero element */}
          <h3 className="font-display-italic text-warm-950 text-[18px] leading-snug tracking-[-0.01em] group-hover:text-warm-700 transition-colors duration-150">
            {process.name}
          </h3>

          {/* Metadata row */}
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <span className="font-mono text-[10px] text-warm-400 tracking-wide">
              {formatDate(process.createdAt)}
            </span>
            {process.contextualAnswers?.sede && (
              <span className="font-mono text-[10px] text-warm-400">· {process.contextualAnswers.sede}</span>
            )}
            {process.contextualAnswers?.activityType && (
              <span className="font-mono text-[10px] text-warm-400 capitalize">· {process.contextualAnswers.activityType}</span>
            )}
          </div>

          {/* Channels */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            {process.channels.map(ch => <ChannelTag key={ch} channel={ch} />)}
          </div>

          {/* Progress */}
          <div className="flex items-center gap-3 mt-4">
            <div className="flex-1 max-w-[200px] h-[1px] bg-warm-200 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-700 rounded-full ${
                  process.status === 'completed'  ? 'bg-status-completed' :
                  process.status === 'error'      ? 'bg-status-error' :
                  process.status === 'waiting'    ? 'bg-status-waiting' :
                                                    'bg-status-processing'
                }`}
                style={{ width: `${process.progress}%` }}
              />
            </div>
            <span className="font-mono text-[10px] text-warm-400">{process.progress}%</span>
            <span className="font-mono text-[10px] text-warm-400">
              <ImageIcon size={9} className="inline mr-1 mb-px" />{approvedImages}/{process.images.length}
            </span>
            <span className="font-mono text-[10px] text-warm-400">
              <FileText size={9} className="inline mr-1 mb-px" />{approvedCopies}/{process.copies.length}
            </span>
            {pending > 0 && (
              <span className="font-mono text-[10px] text-status-waiting flex items-center gap-1">
                <AlertCircle size={9} />{pending} pendiente{pending !== 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>

        {/* Right: status + arrow */}
        <div className="flex items-start gap-3 flex-shrink-0 pt-0.5">
          <ProcessStatusBadge status={process.status} />
          <ArrowUpRight
            size={15}
            strokeWidth={1.5}
            className="text-warm-300 group-hover:text-warm-600 transition-colors duration-150 mt-px"
          />
        </div>
      </div>
    </div>
  );
}

function Stat({ label, value, sub }: { label: string; value: number; sub?: string }) {
  return (
    <div className="bg-white border-r border-warm-100 px-8 py-7 last:border-r-0">
      <p className="font-mono text-[9px] text-warm-400 uppercase tracking-[0.18em] mb-4">{label}</p>
      <p className="font-display text-[42px] text-warm-950 leading-none tracking-tight">{value}</p>
      {sub && <p className="font-body text-[11px] text-warm-400 mt-1.5">{sub}</p>}
    </div>
  );
}

export default function Dashboard() {
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
    total:      processes.length,
    processing: processes.filter(p => p.status === 'processing').length,
    waiting:    processes.filter(p => p.status === 'waiting').length,
    completed:  processes.filter(p => p.status === 'completed').length,
  };

  const filters: { value: Process['status'] | 'all'; label: string }[] = [
    { value: 'all',        label: 'Todos' },
    { value: 'processing', label: 'En proceso' },
    { value: 'waiting',    label: 'Para revisar' },
    { value: 'completed',  label: 'Completados' },
    { value: 'error',      label: 'Con errores' },
  ];

  return (
    <div className="min-h-screen">

      {/* Page title */}
      <div className="border-b border-warm-200 bg-white px-8 py-6">
        <h1 className="font-display text-[26px] text-warm-950 tracking-tight leading-none">Procesos</h1>
        <p className="font-body text-[13px] text-warm-400 mt-1.5">{processes.length} proceso{processes.length !== 1 ? 's' : ''} en total</p>
      </div>

      {/* Stats */}
      <div className="bg-white border-b border-warm-200 grid grid-cols-4 divide-x divide-warm-100">
        <Stat label="Total"         value={stats.total}      />
        <Stat label="En proceso"    value={stats.processing} sub="generando contenido" />
        <Stat label="Para revisar"  value={stats.waiting}    sub="esperan aprobación" />
        <Stat label="Completados"   value={stats.completed}  sub="publicados" />
      </div>

      {/* Filter bar */}
      <div className="bg-white border-b border-warm-200 px-8 py-3 flex items-center gap-6">
        <div className="relative">
          <Search size={12} strokeWidth={2} className="absolute left-3 top-1/2 -translate-y-1/2 text-warm-400" />
          <input
            type="text"
            placeholder="Buscar procesos..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-8 pr-4 py-1.5 bg-warm-50 border border-warm-200 rounded text-[12px] font-body text-warm-800 placeholder-warm-400 focus:outline-none focus:border-warm-400 focus:bg-white transition-colors w-52"
          />
        </div>

        <div className="flex items-center gap-1">
          {filters.map(f => (
            <button key={f.value} onClick={() => setFilter(f.value)}
              className={`px-3 py-1.5 font-body text-[12px] rounded transition-colors duration-100 ${
                filter === f.value
                  ? 'bg-warm-950 text-white'
                  : 'text-warm-500 hover:text-warm-800 hover:bg-warm-100'
              }`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Process list */}
      <div className="bg-white">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Search size={28} strokeWidth={1} className="text-warm-300" />
            <p className="font-display-italic text-warm-500 text-[18px]">Sin resultados</p>
            <p className="font-body text-[13px] text-warm-400">Probá otros filtros o creá un proceso nuevo</p>
          </div>
        ) : (
          filtered.map((p, i) => <ProcessRow key={p.id} process={p} index={i} />)
        )}
      </div>
    </div>
  );
}
