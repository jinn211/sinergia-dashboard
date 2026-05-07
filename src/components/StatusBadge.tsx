import type { ProcessStatus, PieceStatus } from '../types';

const processCfg: Record<ProcessStatus, { dot: string; label: string }> = {
  processing: { dot: 'bg-status-processing', label: 'En proceso' },
  waiting:    { dot: 'bg-status-waiting',    label: 'Para revisar' },
  completed:  { dot: 'bg-status-completed',  label: 'Completado' },
  error:      { dot: 'bg-status-error',      label: 'Error' },
};

const pieceCfg: Record<PieceStatus, { color: string; label: string; spin?: boolean }> = {
  generating:       { color: 'text-status-processing', label: 'Generando',    spin: true },
  'waiting-review': { color: 'text-status-waiting',    label: 'Para revisar' },
  approved:         { color: 'text-status-completed',  label: 'Aprobado' },
  rejected:         { color: 'text-status-error',      label: 'Rechazado' },
  regenerating:     { color: 'text-warm-500',          label: 'Regenerando',  spin: true },
};

export function ProcessStatusBadge({ status }: { status: ProcessStatus }) {
  const { dot, label } = processCfg[status];
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className={`w-[5px] h-[5px] rounded-full flex-shrink-0 ${dot} ${status === 'processing' ? 'animate-pulse' : ''}`} />
      <span className="font-mono text-[11px] text-warm-500 tracking-wide">{label}</span>
    </span>
  );
}

export function PieceStatusBadge({ status }: { status: PieceStatus }) {
  const { color, label, spin } = pieceCfg[status];
  return (
    <span className={`inline-flex items-center gap-1.5 font-mono text-[10px] tracking-wide ${color}`}>
      {spin
        ? <span className="w-2.5 h-2.5 border border-current border-t-transparent rounded-full animate-spin flex-shrink-0" />
        : <span className="w-[5px] h-[5px] rounded-full bg-current flex-shrink-0" />
      }
      {label}
    </span>
  );
}
