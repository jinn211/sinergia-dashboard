import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence, useMotionValue, useTransform } from 'framer-motion';
import {
  ArrowLeft, ThumbsUp, ThumbsDown, Download, Send,
  CheckCircle2, XCircle, RotateCcw, ImageIcon, FileText,
  AlertTriangle, Loader2, Clock, Check,
} from 'lucide-react';
import type { Process, ImagePiece, CopyPiece, PieceStatus } from '../types';
import { getProcess, updateImageStatus, updateCopyStatus, useProcessStore } from '../store/processStore';
import { ProcessStatusBadge, PieceStatusBadge } from '../components/StatusBadge';
import ChannelTag from '../components/ChannelTag';

/* ───────── Tinder Card ───────── */
interface TinderCardProps {
  image: ImagePiece;
  onApprove: () => void;
  onReject: (feedback: string) => void;
  zIndex: number;
  isTop: boolean;
}

function TinderCard({ image, onApprove, onReject, zIndex, isTop }: TinderCardProps) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-20, 20]);
  const approveOpacity = useTransform(x, [20, 80], [0, 1]);
  const rejectOpacity = useTransform(x, [-80, -20], [1, 0]);
  const [swipingDir, setSwipingDir] = useState<'left' | 'right' | null>(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState('');

  const handleDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    if (info.offset.x > 100) {
      setSwipingDir('right');
      setTimeout(onApprove, 300);
    } else if (info.offset.x < -100) {
      setSwipingDir('left');
      setTimeout(() => setShowFeedback(true), 300);
    }
  };

  if (showFeedback) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white rounded-3xl border border-surface-200 shadow-card overflow-hidden"
        style={{ zIndex }}
      >
        <div className="p-6 space-y-4">
          <div className="flex items-center gap-3 text-red-600">
            <XCircle size={20} />
            <p className="font-semibold">¿Qué está mal?</p>
          </div>
          <p className="text-gray-500 text-sm">Contale a la IA qué querés que cambie para que pueda regenerar la imagen.</p>
          <textarea
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
            placeholder="Ej: El texto es difícil de leer sobre el fondo, necesito que haya más contraste..."
            rows={4}
            className="w-full px-4 py-3 bg-surface-50 border border-surface-200 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100 resize-none transition"
          />
          <div className="flex gap-2">
            <button
              onClick={() => setShowFeedback(false)}
              className="flex-1 px-4 py-2.5 rounded-xl border border-surface-200 bg-white text-gray-600 text-sm font-medium hover:bg-surface-100 transition"
            >
              Cancelar
            </button>
            <button
              onClick={() => { onReject(feedback); setShowFeedback(false); }}
              disabled={!feedback.trim()}
              className="flex-1 px-4 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-40 text-white text-sm font-medium transition flex items-center justify-center gap-2"
            >
              <Send size={14} />
              Enviar y regenerar
            </button>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      style={{ x, rotate, zIndex, position: 'absolute', width: '100%' }}
      drag={isTop ? 'x' : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      animate={swipingDir ? {
        x: swipingDir === 'right' ? 500 : -500,
        opacity: 0,
        rotate: swipingDir === 'right' ? 20 : -20,
      } : {}}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-3xl border border-surface-200 shadow-card overflow-hidden select-none"
    >
      {/* Approve overlay */}
      <motion.div
        style={{ opacity: approveOpacity }}
        className="absolute inset-0 bg-emerald-500/10 border-2 border-emerald-400 rounded-3xl z-10 pointer-events-none flex items-center justify-center"
      >
        <div className="bg-emerald-500 text-white rounded-2xl px-6 py-3 flex items-center gap-2 font-bold text-lg rotate-[-12deg]">
          <ThumbsUp size={20} />
          APROBAR
        </div>
      </motion.div>
      {/* Reject overlay */}
      <motion.div
        style={{ opacity: rejectOpacity }}
        className="absolute inset-0 bg-red-500/10 border-2 border-red-400 rounded-3xl z-10 pointer-events-none flex items-center justify-center"
      >
        <div className="bg-red-500 text-white rounded-2xl px-6 py-3 flex items-center gap-2 font-bold text-lg rotate-[12deg]">
          <ThumbsDown size={20} />
          RECHAZAR
        </div>
      </motion.div>

      <img src={image.imageUrl} alt={image.label} className="w-full aspect-square object-cover" draggable={false} />
      <div className="p-4 flex items-center justify-between">
        <div>
          <p className="text-gray-800 font-semibold text-sm">{image.label}</p>
          <p className="text-gray-400 text-xs font-mono mt-0.5">{image.dimensions}</p>
        </div>
        <ChannelTag channel={image.channel} />
      </div>
    </motion.div>
  );
}

/* ───────── Image Review section ───────── */
function ImageReview({ process }: { process: Process }) {
  const reviewable = process.images.filter(i => i.status === 'waiting-review');
  const [currentIdx, setCurrentIdx] = useState(0);

  const handleApprove = (img: ImagePiece) => {
    updateImageStatus(process.id, img.id, 'approved');
    setCurrentIdx(i => Math.max(0, i));
  };

  const handleReject = (img: ImagePiece, feedback: string) => {
    updateImageStatus(process.id, img.id, 'regenerating', feedback);
  };

  if (reviewable.length === 0) {
    const allApproved = process.images.every(i => i.status === 'approved' || i.status === 'generating' || i.status === 'regenerating');
    return (
      <div className="text-center py-16">
        {allApproved ? (
          <>
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mx-auto mb-4">
              <CheckCircle2 size={28} className="text-emerald-500" />
            </div>
            <p className="text-gray-700 font-semibold">Todas las imágenes revisadas</p>
            <p className="text-gray-400 text-sm mt-1">No hay más imágenes para revisar en este momento.</p>
          </>
        ) : (
          <>
            <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
              <Loader2 size={28} className="text-blue-500 animate-spin" />
            </div>
            <p className="text-gray-700 font-semibold">Generando imágenes...</p>
            <p className="text-gray-400 text-sm mt-1">Te avisaremos cuando estén listas para revisar.</p>
          </>
        )}
      </div>
    );
  }

  const current = reviewable[currentIdx] || reviewable[0];

  return (
    <div className="space-y-6">
      {/* Progress */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-gray-500">
          Revisando <span className="font-semibold text-gray-900">{Math.min(currentIdx + 1, reviewable.length)}</span> de <span className="font-semibold text-gray-900">{reviewable.length}</span>
        </span>
        <div className="flex gap-1.5">
          {reviewable.map((_, i) => (
            <div key={i} className={`w-2 h-2 rounded-full transition-colors ${i === currentIdx ? 'bg-brand-600' : 'bg-surface-200'}`} />
          ))}
        </div>
      </div>

      {/* Tinder card stack */}
      <div className="relative h-96">
        <AnimatePresence>
          {reviewable.slice(currentIdx, currentIdx + 3).reverse().map((img, stackIdx) => (
            <TinderCard
              key={img.id}
              image={img}
              zIndex={stackIdx}
              isTop={stackIdx === reviewable.slice(currentIdx, currentIdx + 3).length - 1}
              onApprove={() => handleApprove(img)}
              onReject={(fb) => handleReject(img, fb)}
            />
          ))}
        </AnimatePresence>
        {reviewable.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
            No hay más imágenes
          </div>
        )}
      </div>

      {/* Action buttons */}
      {current && (
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => {
              updateImageStatus(process.id, current.id, 'regenerating', 'Regenerar con cambios');
              setCurrentIdx(i => Math.max(0, i));
            }}
            className="w-14 h-14 rounded-full bg-red-50 border-2 border-red-200 text-red-500 flex items-center justify-center hover:bg-red-100 transition-colors"
            title="Rechazar"
          >
            <ThumbsDown size={22} />
          </button>
          <button
            onClick={() => {
              updateImageStatus(process.id, current.id, 'approved');
              setCurrentIdx(i => Math.max(0, i));
            }}
            className="w-16 h-16 rounded-full bg-emerald-500 border-2 border-emerald-600 text-white flex items-center justify-center hover:bg-emerald-600 transition-colors shadow-sm"
            title="Aprobar"
          >
            <ThumbsUp size={24} />
          </button>
        </div>
      )}

      <p className="text-center text-gray-400 text-xs">Arrastrá la tarjeta o usá los botones</p>
    </div>
  );
}

/* ───────── Copy Review section ───────── */
function CopyCard({ copy, processId }: { copy: CopyPiece; processId: string }) {
  const [showFeedback, setShowFeedback] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [expanded, setExpanded] = useState(false);

  const typeLabels: Record<CopyPiece['type'], string> = {
    'internal-invite': '📧 Invitación interna',
    'newsletter':      '📰 Newsletter comunidad',
    'social':          '📱 Redes sociales',
    'after-movie':     '🎬 After-movie',
  };

  const isGenerating = copy.status === 'generating' || copy.status === 'regenerating';
  const isApproved   = copy.status === 'approved';

  return (
    <div className={`bg-white rounded-2xl border transition-all ${
      isApproved ? 'border-emerald-200' : 'border-surface-200'
    }`}>
      <div className="p-4">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div>
            <p className="text-gray-800 font-semibold text-sm">{typeLabels[copy.type]}</p>
          </div>
          <PieceStatusBadge status={copy.status} />
        </div>

        {isGenerating ? (
          <div className="space-y-2">
            {[60, 90, 45, 80].map((w, i) => (
              <div key={i} className={`h-3 rounded-full shimmer-bg`} style={{ width: `${w}%` }} />
            ))}
          </div>
        ) : copy.content ? (
          <>
            <div className={`text-gray-600 text-sm leading-relaxed whitespace-pre-wrap overflow-hidden transition-all ${
              expanded ? '' : 'max-h-24'
            }`}>
              {copy.content}
            </div>
            {copy.content.length > 200 && (
              <button
                onClick={() => setExpanded(e => !e)}
                className="text-brand-600 text-xs font-medium mt-1 hover:text-brand-700"
              >
                {expanded ? 'Ver menos' : 'Ver más'}
              </button>
            )}
          </>
        ) : null}
      </div>

      {!isGenerating && copy.content && (
        <div className="px-4 pb-4">
          {showFeedback ? (
            <div className="space-y-2">
              <textarea
                value={feedback}
                onChange={e => setFeedback(e.target.value)}
                placeholder="¿Qué querés que cambie?"
                rows={3}
                className="w-full px-3 py-2 bg-surface-50 border border-surface-200 rounded-xl text-xs text-gray-700 placeholder-gray-400 focus:outline-none focus:border-brand-300 resize-none transition"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => setShowFeedback(false)}
                  className="flex-1 px-3 py-1.5 rounded-lg border border-surface-200 text-gray-500 text-xs hover:bg-surface-50 transition"
                >
                  Cancelar
                </button>
                <button
                  onClick={() => {
                    updateCopyStatus(processId, copy.id, 'regenerating', feedback);
                    setShowFeedback(false);
                    setFeedback('');
                  }}
                  disabled={!feedback.trim()}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-brand-600 disabled:opacity-40 text-white text-xs font-medium transition flex items-center justify-center gap-1"
                >
                  <RotateCcw size={11} />
                  Regenerar
                </button>
              </div>
            </div>
          ) : (
            <div className="flex gap-2">
              {!isApproved ? (
                <>
                  <button
                    onClick={() => setShowFeedback(true)}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-surface-200 text-gray-500 text-xs font-medium hover:bg-surface-50 hover:text-red-500 hover:border-red-200 transition"
                  >
                    <XCircle size={13} />
                    Rechazar
                  </button>
                  <button
                    onClick={() => updateCopyStatus(processId, copy.id, 'approved')}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-500 text-white text-xs font-medium hover:bg-emerald-600 transition"
                  >
                    <Check size={13} />
                    Aprobar
                  </button>
                </>
              ) : (
                <div className="flex items-center gap-1.5 text-emerald-600 text-xs font-medium">
                  <CheckCircle2 size={14} />
                  Aprobado
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

/* ───────── All Pieces overview ───────── */
function PiecesOverview({ process }: { process: Process }) {
  const statusColor: Record<PieceStatus, string> = {
    generating:       'bg-blue-500',
    'waiting-review': 'bg-amber-500',
    approved:         'bg-emerald-500',
    rejected:         'bg-red-500',
    regenerating:     'bg-purple-500',
  };

  return (
    <div className="space-y-2">
      {process.images.map(img => (
        <div key={img.id} className="flex items-center gap-3 px-3 py-2 rounded-xl hover:bg-surface-50 transition">
          <div className={`w-2 h-2 rounded-full flex-shrink-0 ${statusColor[img.status]}`} />
          <div className="flex-1 min-w-0">
            <p className="text-sm text-gray-700 truncate">{img.label}</p>
            <p className="text-xs text-gray-400 font-mono">{img.dimensions}</p>
          </div>
          <PieceStatusBadge status={img.status} />
          {img.status === 'approved' && (
            <button className="text-gray-400 hover:text-brand-600 transition">
              <Download size={14} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

/* ───────── Main page ───────── */
export default function ProcessDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { subscribe } = useProcessStore();
  const [, setVersion] = useState(0);
  const [activeTab, setActiveTab] = useState<'images' | 'copy' | 'overview'>('images');

  useEffect(() => {
    const unsub = subscribe();
    return unsub;
  }, [subscribe]);

  useEffect(() => {
    setVersion(v => v + 1);
  });

  const process = id ? getProcess(id) : undefined;

  if (!process) {
    return (
      <div className="p-8 flex flex-col items-center justify-center min-h-screen">
        <AlertTriangle size={40} className="text-amber-400 mb-4" />
        <p className="text-gray-700 font-semibold">Proceso no encontrado</p>
        <button onClick={() => navigate('/')} className="mt-4 text-brand-600 text-sm hover:underline">
          Volver al dashboard
        </button>
      </div>
    );
  }

  const approvedImages = process.images.filter(i => i.status === 'approved').length;
  const approvedCopies = process.copies.filter(c => c.status === 'approved').length;
  const physicalApproved = process.images.filter(i =>
    i.status === 'approved' && ['screens', 'poster-a4', 'poster-a5'].includes(i.channel)
  );

  const tabs = [
    { id: 'images' as const,   label: 'Imágenes', count: process.images.filter(i => i.status === 'waiting-review').length },
    { id: 'copy' as const,     label: 'Copy',     count: process.copies.filter(c => c.status === 'waiting-review').length },
    { id: 'overview' as const, label: 'Resumen',  count: 0 },
  ];

  return (
    <div className="min-h-screen p-8">
      {/* Header */}
      <div className="flex items-start gap-4 mb-8">
        <button
          onClick={() => navigate('/')}
          className="w-9 h-9 rounded-xl bg-white border border-surface-200 flex items-center justify-center hover:bg-surface-100 transition flex-shrink-0 mt-1"
        >
          <ArrowLeft size={16} className="text-gray-600" />
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-gray-900 leading-tight">{process.name}</h1>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <ProcessStatusBadge status={process.status} />
            <span className="text-gray-400 text-xs flex items-center gap-1">
              <Clock size={11} />
              {new Date(process.createdAt).toLocaleDateString('es-UY', { day: 'numeric', month: 'long', year: 'numeric' })}
            </span>
          </div>
        </div>
      </div>

      <div className="flex gap-6 max-w-6xl">
        {/* Main content */}
        <div className="flex-1 min-w-0 space-y-6">
          {/* Channels */}
          <div className="bg-white rounded-2xl border border-surface-200 p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Canales seleccionados</p>
            <div className="flex flex-wrap gap-2">
              {process.channels.map(ch => <ChannelTag key={ch} channel={ch} size="md" />)}
            </div>
          </div>

          {/* Progress summary */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white rounded-2xl border border-surface-200 p-5">
              <div className="flex items-center gap-2 mb-3">
                <ImageIcon size={16} className="text-brand-500" />
                <p className="text-sm font-semibold text-gray-700">Imágenes</p>
              </div>
              <p className="text-3xl font-bold text-gray-900">{approvedImages}<span className="text-gray-300 text-xl">/{process.images.length}</span></p>
              <p className="text-gray-400 text-xs mt-1">aprobadas</p>
            </div>
            <div className="bg-white rounded-2xl border border-surface-200 p-5">
              <div className="flex items-center gap-2 mb-3">
                <FileText size={16} className="text-brand-500" />
                <p className="text-sm font-semibold text-gray-700">Copys</p>
              </div>
              <p className="text-3xl font-bold text-gray-900">{approvedCopies}<span className="text-gray-300 text-xl">/{process.copies.length}</span></p>
              <p className="text-gray-400 text-xs mt-1">aprobados</p>
            </div>
          </div>

          {/* Physical assets ready to download */}
          {physicalApproved.length > 0 && (
            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-5">
              <p className="text-amber-800 font-semibold text-sm mb-3">Piezas físicas listas para descargar</p>
              <div className="space-y-2">
                {physicalApproved.map(img => (
                  <div key={img.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 size={14} className="text-amber-600" />
                      <span className="text-amber-700 text-sm">{img.label}</span>
                    </div>
                    <button className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 text-amber-700 text-xs font-medium transition">
                      <Download size={12} />
                      Descargar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="bg-white rounded-2xl border border-surface-200 overflow-hidden">
            <div className="flex border-b border-surface-100">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-brand-700 border-b-2 border-brand-600 bg-brand-50/30'
                      : 'text-gray-500 hover:text-gray-700 hover:bg-surface-50'
                  }`}
                >
                  {tab.label}
                  {tab.count > 0 && (
                    <span className="bg-amber-500 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </div>

            <div className="p-5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.15 }}
                >
                  {activeTab === 'images' && <ImageReview process={process} />}
                  {activeTab === 'copy' && (
                    <div className="space-y-4">
                      {process.copies.map(copy => (
                        <CopyCard key={copy.id} copy={copy} processId={process.id} />
                      ))}
                    </div>
                  )}
                  {activeTab === 'overview' && <PiecesOverview process={process} />}
                </motion.div>
              </AnimatePresence>
            </div>
          </div>
        </div>

        {/* Right sidebar — context */}
        <div className="w-72 flex-shrink-0 space-y-4">
          {process.contextualAnswers && (
            <div className="bg-white rounded-2xl border border-surface-200 p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-4">Detalles del proceso</p>
              <div className="space-y-3">
                {process.contextualAnswers.activityType && (
                  <div>
                    <p className="text-xs text-gray-400">Tipo</p>
                    <p className="text-sm text-gray-700 font-medium capitalize">{process.contextualAnswers.activityType}</p>
                  </div>
                )}
                {process.contextualAnswers.sede && (
                  <div>
                    <p className="text-xs text-gray-400">Sede</p>
                    <p className="text-sm text-gray-700 font-medium">{process.contextualAnswers.sede}</p>
                  </div>
                )}
                {process.contextualAnswers.eventDate && (
                  <div>
                    <p className="text-xs text-gray-400">Fecha</p>
                    <p className="text-sm text-gray-700 font-medium">
                      {new Date(process.contextualAnswers.eventDate).toLocaleDateString('es-UY', { day: 'numeric', month: 'long' })}
                      {process.contextualAnswers.eventTime && ` · ${process.contextualAnswers.eventTime}hs`}
                    </p>
                  </div>
                )}
                {process.contextualAnswers.audience && process.contextualAnswers.audience.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-400">Público</p>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {process.contextualAnswers.audience.map(a => (
                        <span key={a} className="text-xs bg-surface-100 text-gray-600 px-2 py-0.5 rounded-full">{a}</span>
                      ))}
                    </div>
                  </div>
                )}
                {process.contextualAnswers.tone && (
                  <div>
                    <p className="text-xs text-gray-400">Tono</p>
                    <p className="text-sm text-gray-700 font-medium capitalize">{process.contextualAnswers.tone}</p>
                  </div>
                )}
                {process.contextualAnswers.isFree !== undefined && (
                  <div>
                    <p className="text-xs text-gray-400">Costo</p>
                    <p className="text-sm text-gray-700 font-medium">{process.contextualAnswers.isFree ? 'Entrada libre' : 'Con costo'}</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {process.additionalContext && (
            <div className="bg-white rounded-2xl border border-surface-200 p-5">
              <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Contexto adicional</p>
              <p className="text-sm text-gray-600 leading-relaxed">{process.additionalContext}</p>
            </div>
          )}

          {/* All pieces status */}
          <div className="bg-white rounded-2xl border border-surface-200 p-5">
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3">Estado de piezas</p>
            <div className="space-y-2">
              {process.images.map(img => (
                <div key={img.id} className="flex items-center justify-between gap-2">
                  <p className="text-xs text-gray-600 truncate flex-1">{img.label}</p>
                  <PieceStatusBadge status={img.status} />
                </div>
              ))}
              <div className="border-t border-surface-100 my-2" />
              {process.copies.map(copy => (
                <div key={copy.id} className="flex items-center justify-between gap-2">
                  <p className="text-xs text-gray-600 truncate flex-1">{copy.label}</p>
                  <PieceStatusBadge status={copy.status} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
