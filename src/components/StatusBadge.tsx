import type { ProcessStatus, PieceStatus } from '../types';
import { Loader2 } from 'lucide-react';

const processCfg: Record<ProcessStatus, { bg: string; text: string; dot: string; label: string }> = {
  processing: { bg: 'bg-blue-50',   text: 'text-blue-600',   dot: 'bg-blue-500 animate-pulse', label: 'En proceso' },
  waiting:    { bg: 'bg-amber-50',  text: 'text-amber-600',  dot: 'bg-amber-500',              label: 'Para revisar' },
  completed:  { bg: 'bg-brand-50',  text: 'text-brand-600',  dot: 'bg-brand-400',              label: 'Completado' },
  error:      { bg: 'bg-red-50',    text: 'text-red-600',    dot: 'bg-red-500',                label: 'Error' },
};

const pieceCfg: Record<PieceStatus, { text: string; label: string; spin?: boolean }> = {
  'generating':     { text: 'text-blue-500',   label: 'Generando',    spin: true },
  'waiting-review': { text: 'text-amber-500',  label: 'Para revisar' },
  'approved':       { text: 'text-brand-500',  label: 'Aprobado' },
  'rejected':       { text: 'text-red-500',    label: 'Rechazado' },
  'regenerating':   { text: 'text-warm-500',   label: 'Regenerando',  spin: true },
};

export function ProcessStatusBadge({ status }: { status: ProcessStatus }) {
  const { bg, text, dot, label } = processCfg[status];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${bg} ${text} border-current/20`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />
      {label}
    </span>
  );
}

export function PieceStatusBadge({ status }: { status: PieceStatus }) {
  const { text, label, spin } = pieceCfg[status];
  return (
    <span className={`inline-flex items-center gap-1.5 text-[11px] font-medium ${text}`}>
      {spin
        ? <Loader2 size={11} className="animate-spin flex-shrink-0" />
        : <span className="w-1.5 h-1.5 rounded-full bg-current flex-shrink-0" />
      }
      {label}
    </span>
  );
}
