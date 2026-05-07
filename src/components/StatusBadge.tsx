import type { ProcessStatus, PieceStatus } from '../types';
import { Loader2, Clock, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';

interface ProcessStatusBadgeProps { status: ProcessStatus; }
interface PieceStatusBadgeProps { status: PieceStatus; }

const processStatusConfig: Record<ProcessStatus, { label: string; className: string; dot: string }> = {
  processing: { label: 'Procesando',         className: 'bg-blue-50 text-blue-700 border-blue-100',    dot: 'bg-blue-500 animate-pulse' },
  waiting:    { label: 'Para revisar',       className: 'bg-amber-50 text-amber-700 border-amber-100',  dot: 'bg-amber-500' },
  completed:  { label: 'Completado',         className: 'bg-emerald-50 text-emerald-700 border-emerald-100', dot: 'bg-emerald-500' },
  error:      { label: 'Error',             className: 'bg-red-50 text-red-700 border-red-100',         dot: 'bg-red-500' },
};

const pieceStatusConfig: Record<PieceStatus, { label: string; icon: React.ElementType; className: string }> = {
  generating:     { label: 'Generando',      icon: Loader2,      className: 'text-blue-500' },
  'waiting-review': { label: 'Para revisar', icon: Clock,        className: 'text-amber-500' },
  approved:       { label: 'Aprobado',       icon: CheckCircle2, className: 'text-emerald-500' },
  rejected:       { label: 'Rechazado',      icon: XCircle,      className: 'text-red-500' },
  regenerating:   { label: 'Regenerando',    icon: RefreshCw,    className: 'text-purple-500' },
};

export function ProcessStatusBadge({ status }: ProcessStatusBadgeProps) {
  const config = processStatusConfig[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${config.className}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

export function PieceStatusBadge({ status }: PieceStatusBadgeProps) {
  const config = pieceStatusConfig[status];
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-medium ${config.className}`}>
      <Icon size={12} className={status === 'generating' || status === 'regenerating' ? 'animate-spin' : ''} />
      {config.label}
    </span>
  );
}
