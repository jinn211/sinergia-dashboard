import type { ProcessStatus, PieceStatus } from '../types';
import { Loader2 } from 'lucide-react';

const processCfg: Record<ProcessStatus, { dot: string; bg: string; text: string; label: string }> = {
  processing: { dot: 'bg-blue-400 animate-pulse', bg: 'bg-blue-50 border-blue-100',     text: 'text-blue-700',  label: 'En proceso' },
  waiting:    { dot: 'bg-amber-400',              bg: 'bg-amber-50 border-amber-100',   text: 'text-amber-700', label: 'Para revisar' },
  completed:  { dot: 'bg-sinergia',               bg: 'bg-brand-50 border-brand-100',   text: 'text-brand-700', label: 'Completado' },
  error:      { dot: 'bg-red-400',                bg: 'bg-red-50 border-red-100',       text: 'text-red-700',   label: 'Error' },
};

const pieceCfg: Record<PieceStatus, { dot: string; label: string; spin?: boolean }> = {
  'generating':     { dot: 'text-blue-400',   label: 'Generando',    spin: true },
  'waiting-review': { dot: 'bg-amber-400',    label: 'Para revisar' },
  'approved':       { dot: 'bg-sinergia',     label: 'Aprobado' },
  'rejected':       { dot: 'bg-red-400',      label: 'Rechazado' },
  'regenerating':   { dot: 'text-warm-400',   label: 'Regenerando',  spin: true },
};

export function ProcessStatusBadge({ status }: { status: ProcessStatus }) {
  const { dot, bg, text, label } = processCfg[status];
  return (
    <span className={`inline-flex items-center gap-1.5 border px-2.5 py-1 rounded-lg text-[11px] font-semibold ${bg} ${text}`}>
      <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />
      {label}
    </span>
  );
}

export function PieceStatusBadge({ status }: { status: PieceStatus }) {
  const { dot, label, spin } = pieceCfg[status];
  return (
    <span className="inline-flex items-center gap-1.5 text-[11px] font-medium text-warm-500">
      {spin
        ? <Loader2 size={10} className={`flex-shrink-0 animate-spin ${dot}`} />
        : <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dot}`} />
      }
      {label}
    </span>
  );
}
