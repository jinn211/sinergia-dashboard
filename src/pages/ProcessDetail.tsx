import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import {
  ArrowLeft, ThumbsUp, ThumbsDown, Download, Send,
  CheckCircle2, XCircle, RotateCcw, ImageIcon, FileText,
  AlertTriangle, Loader2, Check,
} from 'lucide-react';
import type { Process, ImagePiece, CopyPiece } from '../types';
import { updateImageStatus, updateCopyStatus, useProcessStore } from '../store/processStore';
import { ProcessStatusBadge, PieceStatusBadge } from '../components/StatusBadge';
import ChannelTag from '../components/ChannelTag';

/* ── Tinder Card ── */
function TinderCard({ image, onApprove, onReject, zIndex, isTop }: {
  image: ImagePiece; onApprove: () => void; onReject: (fb: string) => void;
  zIndex: number; isTop: boolean;
}) {
  const x              = useMotionValue(0);
  const rotate         = useTransform(x, [-200, 200], [-15, 15]);
  const approveOpacity = useTransform(x, [30, 90], [0, 1]);
  const rejectOpacity  = useTransform(x, [-90, -30], [1, 0]);
  const [swipingDir, setSwipingDir]     = useState<'left' | 'right' | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback]         = useState('');

  const handleDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    if (info.offset.x > 100)       { setSwipingDir('right'); setTimeout(onApprove, 280); }
    else if (info.offset.x < -100) { setSwipingDir('left');  setTimeout(() => setShowFeedback(true), 280); }
  };

  if (showFeedback) {
    return (
      <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
        className="absolute inset-0 bg-white border border-warm-200 rounded overflow-hidden shadow-card flex flex-col p-6 gap-4" style={{ zIndex }}>
        <div className="flex items-center gap-2 text-status-error">
          <XCircle size={15} strokeWidth={1.5} />
          <p className="font-medium text-[14px]">¿Qué querés cambiar?</p>
        </div>
        <p className="text-[13px] text-warm-700 leading-relaxed">
          Contale a la IA qué está mal para que pueda regenerar la imagen.
        </p>
        <textarea value={feedback} onChange={e => setFeedback(e.target.value)}
          placeholder="Ej: El texto es difícil de leer, necesito más contraste entre el fondo y las letras..."
          rows={4}
          className="w-full px-3.5 py-2.5 bg-warm-50 border border-warm-200 rounded text-[13px] text-warm-800 placeholder-warm-400 focus:outline-none focus:border-warm-400 resize-none transition-colors" />
        <div className="flex gap-2 mt-auto">
          <button onClick={() => setShowFeedback(false)}
            className="flex-1 border border-warm-200 text-warm-700 text-[13px] py-2.5 rounded hover:bg-warm-50 transition-colors">
            Cancelar
          </button>
          <button onClick={() => { onReject(feedback); setShowFeedback(false); }} disabled={!feedback.trim()}
            className="flex-1 bg-gray-900 disabled:opacity-30 text-white text-[13px] py-2.5 rounded hover:bg-gray-800 transition-colors flex items-center justify-center gap-2">
            <Send size={13} strokeWidth={1.75} /> Regenerar
          </button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      style={{ x, rotate, zIndex, position: 'absolute', width: '100%', height: '100%' }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      animate={swipingDir ? { x: swipingDir === 'right' ? 500 : -500, opacity: 0, rotate: swipingDir === 'right' ? 15 : -15 } : {}}
      transition={{ duration: 0.28 }}
      className="bg-white rounded border border-warm-200 shadow-card overflow-hidden select-none cursor-grab active:cursor-grabbing"
    >
      <motion.div style={{ opacity: approveOpacity }}
        className="absolute inset-0 bg-status-completed/8 border-2 border-status-completed rounded z-10 pointer-events-none flex items-center justify-center">
        <div className="bg-sinergia text-white px-6 py-2.5 rounded font-bold text-[18px] rotate-[-8deg]">
          Aprobar
        </div>
      </motion.div>
      <motion.div style={{ opacity: rejectOpacity }}
        className="absolute inset-0 bg-status-error/8 border-2 border-status-error rounded z-10 pointer-events-none flex items-center justify-center">
        <div className="bg-red-500 text-white px-6 py-2.5 rounded font-bold text-[18px] rotate-[8deg]">
          Rechazar
        </div>
      </motion.div>

      <img src={image.imageUrl} alt={image.label}
        className="w-full object-cover" style={{ height: 'calc(100% - 60px)' }} draggable={false} />
      <div className="h-[60px] px-5 flex items-center justify-between border-t border-warm-100">
        <div>
          <p className="font-medium text-warm-800 text-[13px]">{image.label}</p>
          <p className="font-mono text-[10px] text-warm-600 mt-0.5">{image.dimensions}</p>
        </div>
        <ChannelTag channel={image.channel} />
      </div>
    </motion.div>
  );
}

/* ── Image Review ── */
function ImageReview({ process }: { process: Process }) {
  const reviewable = process.images.filter(i => i.status === 'waiting-review');
  const [currentIdx, setCurrentIdx] = useState(0);

  const handleApprove = (img: ImagePiece) => {
    updateImageStatus(process.id, img.id, 'approved');
    setCurrentIdx(i => Math.max(0, i));
  };
  const handleReject = (img: ImagePiece, fb: string) => {
    updateImageStatus(process.id, img.id, 'regenerating', fb);
  };

  if (reviewable.length === 0) {
    const isGenerating = process.images.some(i => i.status === 'generating' || i.status === 'regenerating');
    return (
      <div className="py-16 flex flex-col items-center gap-4">
        {isGenerating ? (
          <>
            <Loader2 size={28} strokeWidth={1} className="text-status-processing animate-spin" />
            <p className="font-semibold italic text-[18px] text-warm-700">Generando imágenes...</p>
            <p className="font-mono text-[10px] text-warm-600 uppercase tracking-wider">Te avisaremos cuando estén listas</p>
          </>
        ) : (
          <>
            <CheckCircle2 size={28} strokeWidth={1} className="text-status-completed" />
            <p className="font-semibold italic text-[18px] text-warm-600">Todas las imágenes revisadas</p>
          </>
        )}
      </div>
    );
  }

  const current = reviewable[currentIdx] || reviewable[0];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <span className="font-mono text-[11px] text-warm-700">
          {Math.min(currentIdx + 1, reviewable.length)} de {reviewable.length}
        </span>
        <div className="flex gap-1">
          {reviewable.map((_, i) => (
            <div key={i} className={`h-px w-8 transition-colors ${i === currentIdx ? 'bg-warm-700' : 'bg-warm-200'}`} />
          ))}
        </div>
      </div>

      {/* Card stack */}
      <div className="relative h-[400px]">
        <AnimatePresence>
          {reviewable.slice(currentIdx, currentIdx + 3).reverse().map((img, stackIdx) => {
            const total = reviewable.slice(currentIdx, currentIdx + 3).length;
            return (
              <div key={img.id} style={{
                zIndex: stackIdx,
                transform: `translateY(${(total - 1 - stackIdx) * 7}px) scale(${1 - (total - 1 - stackIdx) * 0.02})`,
                position: 'absolute', inset: 0, transition: 'transform 0.2s ease',
              }}>
                <TinderCard image={img} zIndex={stackIdx} isTop={stackIdx === total - 1}
                  onApprove={() => handleApprove(img)} onReject={fb => handleReject(img, fb)} />
              </div>
            );
          })}
        </AnimatePresence>
      </div>

      {current && (
        <div className="flex items-center justify-center gap-5 pt-1">
          <button
            onClick={() => updateImageStatus(process.id, current.id, 'regenerating', 'Regenerar')}
            className="w-12 h-12 border border-warm-200 rounded-full text-warm-700 flex items-center justify-center hover:border-status-error/40 hover:text-status-error hover:bg-red-50/50 transition-all"
            title="Rechazar"
          >
            <ThumbsDown size={18} strokeWidth={1.5} />
          </button>
          <button
            onClick={() => updateImageStatus(process.id, current.id, 'approved')}
            className="w-14 h-14 bg-gray-900 rounded-full text-white flex items-center justify-center hover:bg-gray-800 transition-colors shadow-card"
            title="Aprobar"
          >
            <ThumbsUp size={20} strokeWidth={1.75} />
          </button>
        </div>
      )}

      <p className="text-center font-mono text-[10px] text-warm-600 tracking-wider">
        Arrastrá o usá los botones
      </p>
    </div>
  );
}

/* ── Copy Card ── */
function CopyCard({ copy, processId }: { copy: CopyPiece; processId: string }) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback]         = useState('');
  const [expanded, setExpanded]         = useState(false);

  const typeLabels: Record<CopyPiece['type'], string> = {
    'internal-invite': 'Invitación interna',
    'newsletter':      'Newsletter comunidad',
    'social':          'Redes sociales',
    'after-movie':     'After-movie',
  };

  const isGenerating = copy.status === 'generating' || copy.status === 'regenerating';
  const isApproved   = copy.status === 'approved';

  return (
    <div className="bg-white rounded-2xl border border-warm-200 shadow-card overflow-hidden transition-all">
      <div className="px-5 py-4 border-b border-warm-100 flex items-center justify-between">
        <p className="font-semibold text-[13px] text-gray-800">{typeLabels[copy.type]}</p>
        <PieceStatusBadge status={copy.status} />
      </div>

      <div className="px-5 py-4">
        {isGenerating ? (
          <div className="space-y-2">
            {[75, 95, 60, 85, 70].map((w, i) => (
              <div key={i} className="skeleton h-3" style={{ width: `${w}%` }} />
            ))}
          </div>
        ) : copy.content ? (
          <>
            <div className={`text-[13px] text-warm-700 leading-relaxed whitespace-pre-wrap overflow-hidden transition-all ${expanded ? '' : 'max-h-20'}`}>
              {copy.content}
            </div>
            {copy.content.length > 180 && (
              <button onClick={() => setExpanded(e => !e)}
                className="font-mono text-[10px] text-warm-700 hover:text-warm-800 mt-2 uppercase tracking-wider transition-colors">
                {expanded ? '↑ Ver menos' : '↓ Ver más'}
              </button>
            )}
          </>
        ) : null}
      </div>

      {!isGenerating && copy.content && (
        <div className="px-5 pb-4">
          {showFeedback ? (
            <div className="space-y-2">
              <textarea value={feedback} onChange={e => setFeedback(e.target.value)}
                placeholder="¿Qué querés que cambie?" rows={3}
                className="w-full px-3.5 py-2.5 bg-warm-50 border border-warm-200 rounded text-[13px] text-warm-800 placeholder-warm-400 focus:outline-none focus:border-warm-400 resize-none transition-colors" />
              <div className="flex gap-2">
                <button onClick={() => setShowFeedback(false)}
                  className="flex-1 border border-warm-200 text-warm-700 text-[12px] py-2 rounded hover:bg-warm-50 transition-colors">
                  Cancelar
                </button>
                <button onClick={() => { updateCopyStatus(processId, copy.id, 'regenerating', feedback); setShowFeedback(false); setFeedback(''); }}
                  disabled={!feedback.trim()}
                  className="flex-1 bg-gray-900 disabled:opacity-30 text-white text-[12px] py-2 rounded hover:bg-gray-800 transition-colors flex items-center justify-center gap-1.5">
                  <RotateCcw size={11} strokeWidth={2} /> Regenerar
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              {!isApproved ? (
                <>
                  <button onClick={() => setShowFeedback(true)}
                    className="flex-1 bg-red-50 border border-red-100 text-red-400 text-[12px] py-2 rounded-xl hover:bg-red-100 hover:text-red-500 transition-all flex items-center justify-center gap-1.5">
                    <XCircle size={12} strokeWidth={1.5} /> Rechazar
                  </button>
                  <button onClick={() => updateCopyStatus(processId, copy.id, 'approved')}
                    className="flex-1 text-white text-[12px] py-2 rounded-xl transition-all flex items-center justify-center gap-1.5 opacity-75 hover:opacity-90"
                    style={{ background: 'linear-gradient(145deg, #62D4A3 0%, #4DB887 45%, #3A9E72 100%)' }}>
                    <Check size={12} strokeWidth={2.5} /> Aprobar
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-status-completed" />
                  <span className="text-[12px] text-status-completed">Aprobado</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ── Overview ── */
function PiecesOverview({ process }: { process: Process }) {
  return (
    <div className="space-y-px">
      {process.images.map(img => (
        <div key={img.id} className="flex items-center gap-3 py-3 px-1 border-b border-warm-100 last:border-0">
          <ImageIcon size={12} strokeWidth={1.5} className="text-warm-600 flex-shrink-0" />
          <p className="text-[13px] text-warm-700 flex-1 truncate">{img.label}</p>
          <p className="font-mono text-[10px] text-warm-600">{img.dimensions}</p>
          <PieceStatusBadge status={img.status} />
          {img.status === 'approved' && (
            <button className="text-warm-600 hover:text-warm-700 transition-colors">
              <Download size={13} strokeWidth={1.5} />
            </button>
          )}
        </div>
      ))}
      <div className="h-4" />
      {process.copies.map(c => (
        <div key={c.id} className="flex items-center gap-3 py-3 px-1 border-b border-warm-100 last:border-0">
          <FileText size={12} strokeWidth={1.5} className="text-warm-600 flex-shrink-0" />
          <p className="text-[13px] text-warm-700 flex-1 truncate">{c.label}</p>
          <PieceStatusBadge status={c.status} />
        </div>
      ))}
    </div>
  );
}

/* ── Main ── */
export default function ProcessDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { processes } = useProcessStore();
  const [activeTab, setActiveTab] = useState<'images' | 'copy' | 'overview'>('images');

  const process = processes.find(p => p.id === id);

  if (!process) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-white">
        <AlertTriangle size={32} strokeWidth={1} className="text-status-waiting" />
        <p className="font-semibold italic text-[20px] text-warm-700">Proceso no encontrado</p>
        <button onClick={() => navigate('/')} className="text-[13px] text-warm-600 hover:text-warm-900 underline underline-offset-4 transition-colors">
          Volver al dashboard
        </button>
      </div>
    );
  }

  const approvedImages   = process.images.filter(i => i.status === 'approved').length;
  const approvedCopies   = process.copies.filter(c => c.status === 'approved').length;
  const physicalApproved = process.images.filter(i =>
    i.status === 'approved' && ['screens', 'poster-a4', 'poster-a5'].includes(i.channel)
  );

  const tabs = [
    { id: 'images'   as const, label: 'Imágenes', badge: process.images.filter(i => i.status === 'waiting-review').length },
    { id: 'copy'     as const, label: 'Copy',     badge: process.copies.filter(c => c.status === 'waiting-review').length },
    { id: 'overview' as const, label: 'Resumen',  badge: 0 },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#E8EBE9' }}>
      {/* Header */}
      <div className="bg-white border-b border-warm-100 px-8 py-5 flex items-center gap-4">
        <button onClick={() => navigate(-1)}
          className="w-8 h-8 border border-warm-200 rounded flex items-center justify-center text-warm-600 hover:text-gray-900 hover:border-warm-400 transition-colors flex-shrink-0">
          <ArrowLeft size={14} strokeWidth={2} />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="font-semibold italic text-[22px] text-warm-950 tracking-tight leading-tight truncate">
            {process.name}
          </h1>
        </div>
        <ProcessStatusBadge status={process.status} />
      </div>

      {/* Meta strip — back layer: channels + date */}
      <div className="px-8 py-3 flex items-center gap-3 flex-wrap">
        {process.channels.map(ch => <ChannelTag key={ch} channel={ch} size="md" />)}
        {process.contextualAnswers?.eventDate && (
          <span className="font-mono text-[13px] text-gray-700 font-medium">
            · {new Date(process.contextualAnswers.eventDate).toLocaleDateString('es-UY', { day: 'numeric', month: 'long' })}
            {process.contextualAnswers.eventTime && ` ${process.contextualAnswers.eventTime}hs`}
          </span>
        )}
      </div>

      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Main — white elevated layer */}
        <div className="flex-1 min-w-0 flex flex-col bg-white ml-6 mb-6"
          style={{ boxShadow: '0 -2px 16px rgba(0,0,0,0.07), 0 4px 24px rgba(0,0,0,0.06)' }}>

          {/* Progress */}
          <div className="px-8 py-5 border-b border-warm-100 flex items-center gap-6">
            <div className="flex-1 max-w-xs h-px bg-warm-200 rounded-full overflow-hidden">
              <div className={`h-full transition-all duration-700 ${
                process.status === 'completed' ? 'bg-status-completed' :
                process.status === 'error'     ? 'bg-status-error' :
                process.status === 'waiting'   ? 'bg-status-waiting' :
                                                 'bg-status-processing'
              }`} style={{ width: `${process.progress}%` }} />
            </div>
            <span className="font-mono text-[12px] text-gray-600 font-medium">{process.progress}%</span>
            <span className="font-mono text-[12px] text-gray-600">{approvedImages}/{process.images.length} imágenes</span>
            <span className="font-mono text-[12px] text-gray-600">{approvedCopies}/{process.copies.length} copys</span>
          </div>

          {/* Physical assets */}
          {physicalApproved.length > 0 && (
            <div className="px-8 py-3 border-b border-warm-100 bg-warm-50 flex items-center gap-4 flex-wrap">
              <span className="font-mono text-[10px] text-warm-700 uppercase tracking-wider">Listas para descargar</span>
              {physicalApproved.map(img => (
                <button key={img.id}
                  className="flex items-center gap-1.5 text-[12px] text-warm-700 border border-warm-200 bg-white rounded px-3 py-1.5 hover:bg-warm-50 hover:border-warm-300 transition-colors">
                  <Download size={12} strokeWidth={1.75} /> {img.label}
                </button>
              ))}
            </div>
          )}

          {/* Dormant modules — activatable */}
          {process.imageSchedule === 'later' && process.images.length === 0 && (
            <div className="mx-8 my-4 border border-warm-200 rounded-2xl bg-warm-50 px-5 py-4 flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-[13px] text-gray-800">Imágenes pendientes</p>
                <p className="text-warm-500 text-[12px] mt-0.5">Las piezas gráficas de este proceso todavía no fueron generadas.</p>
              </div>
              <button
                onClick={() => {
                  const updated = { ...process, imageSchedule: 'now' as const,
                    images: process.channels.map(ch => ({
                      id: `img-act-${ch}`, channel: ch, label: ch, dimensions: '',
                      status: 'generating' as const, imageUrl: '',
                    }))
                  };
                  // In production: trigger n8n workflow
                  console.log('Activating images for', process.id, updated);
                }}
                className="flex items-center gap-2 bg-sinergia hover:bg-sinergia-deep text-white text-[12px] font-semibold px-4 py-2 rounded-xl transition-all flex-shrink-0 shadow-sm">
                <ImageIcon size={13} /> Generar imágenes
              </button>
            </div>
          )}
          {process.copySchedule === 'later' && process.copies.length === 0 && (
            <div className="mx-8 my-4 border border-warm-200 rounded-2xl bg-warm-50 px-5 py-4 flex items-center justify-between gap-4">
              <div>
                <p className="font-semibold text-[13px] text-gray-800">Copy pendiente</p>
                <p className="text-warm-500 text-[12px] mt-0.5">Los textos de este proceso todavía no fueron generados.</p>
              </div>
              <button
                onClick={() => console.log('Activating copy for', process.id)}
                className="flex items-center gap-2 bg-sinergia hover:bg-sinergia-deep text-white text-[12px] font-semibold px-4 py-2 rounded-xl transition-all flex-shrink-0 shadow-sm">
                <FileText size={13} /> Generar copy
              </button>
            </div>
          )}

          {/* Tabs */}
          <div className="border-b border-warm-100 flex">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-6 py-3.5 text-[13px] transition-all border-b-2 ${
                  activeTab === tab.id
                    ? 'text-warm-900 border-warm-700 font-medium'
                    : 'text-warm-700 border-transparent hover:text-warm-700'
                }`}>
                {tab.label}
                {tab.badge > 0 && (
                  <span className="font-mono text-[10px] bg-status-waiting/10 text-status-waiting border border-status-waiting/20 px-1.5 py-0.5 rounded-full">
                    {tab.badge}
                  </span>
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="flex-1 px-8 py-6 overflow-y-auto scrollbar-warm">
            <AnimatePresence mode="wait">
              <motion.div key={activeTab}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}>
                {activeTab === 'images' && <ImageReview process={process} />}
                {activeTab === 'copy'   && <div className="space-y-3 max-w-2xl">{process.copies.map(c => <CopyCard key={c.id} copy={c} processId={process.id} />)}</div>}
                {activeTab === 'overview' && <PiecesOverview process={process} />}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>

        {/* Right sidebar — sits directly on page background */}
        <div className="w-80 flex-shrink-0 overflow-y-auto scrollbar-warm">
          <div className="p-5 space-y-4">

            {/* Detalles agrupados en un solo card con header */}
            {process.contextualAnswers && (
              <div className="bg-white rounded-2xl border border-warm-200 shadow-card overflow-hidden">
                <div className="px-4 py-2.5 border-b border-warm-100 bg-warm-50">
                  <p className="font-mono text-[9px] text-warm-600 uppercase tracking-[0.18em] text-black">Detalles</p>
                </div>
                <div className="divide-y divide-warm-100">
                  {[
                    { label: 'Tipo',  value: process.contextualAnswers.activityType },
                    { label: 'Sede',  value: process.contextualAnswers.sede },
                    { label: 'Tono',  value: process.contextualAnswers.tone },
                    { label: 'Costo', value: process.contextualAnswers.isFree !== undefined ? (process.contextualAnswers.isFree ? 'Entrada libre' : 'Con costo') : undefined },
                  ].filter(i => i.value).map(({ label, value }) => (
                    <div key={label} className="flex items-center justify-between px-4 py-3">
                      <p className="font-mono text-[10px] text-gray-700">{label}</p>
                      <p className="text-[13px] font-semibold text-black capitalize">{value}</p>
                    </div>
                  ))}
                  {(process.contextualAnswers.audience as string[] | undefined)?.length && (
                    <div className="px-4 py-3">
                      <p className="font-mono text-[10px] text-black mb-2">Público</p>
                      <div className="flex flex-wrap gap-1">
                        {(process.contextualAnswers.audience as string[]).map(a => (
                          <span key={a} className="font-mono text-[10px] text-warm-700 border border-warm-200 bg-warm-50 px-2 py-0.5 rounded-lg capitalize">{a}</span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Estado de piezas agrupado */}
            <div className="bg-white rounded-2xl border border-warm-200 shadow-card overflow-hidden">
              <div className="px-4 py-2.5 border-b border-warm-100 bg-warm-50">
                <p className="font-mono text-[9px] text-warm-600 uppercase tracking-[0.18em] text-black">Estado de piezas</p>
              </div>
              <div className="divide-y divide-warm-100">
                {[...process.images, ...process.copies].map(piece => (
                  <div key={piece.id} className="flex items-center justify-between px-4 py-3 gap-2">
                    <p className="text-[13px] font-medium text-black truncate flex-1">{piece.label}</p>
                    <PieceStatusBadge status={piece.status} />
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
