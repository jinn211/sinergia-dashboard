import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Home, Plus, Bell, Settings, MessageSquare, X, Send, Check } from 'lucide-react';
import { useProcessStore } from '../store/processStore';

const statusDot: Record<string, string> = {
  processing: 'bg-blue-500',
  waiting:    'bg-amber-500',
  completed:  'bg-sinergia',
  error:      'bg-red-400',
};

function FeedbackModal({ onClose }: { onClose: () => void }) {
  const [text, setText]     = useState('');
  const [sent, setSent]     = useState(false);

  const handleSend = () => {
    if (!text.trim()) return;
    // In production: send to backend
    console.log('Feedback:', text);
    setSent(true);
    setTimeout(onClose, 1800);
  };

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black/20 z-[9998]" onClick={onClose} />

      {/* Modal */}
      <div className="fixed bottom-16 left-4 w-72 bg-white rounded-2xl shadow-card-hover border border-warm-200 z-[9999] overflow-hidden">
        <div className="px-4 py-3.5 border-b border-warm-100 flex items-center justify-between">
          <p className="font-semibold text-[13px] text-gray-900">Dar feedback</p>
          <button onClick={onClose} className="w-6 h-6 rounded-lg text-warm-400 hover:text-gray-700 hover:bg-warm-100 flex items-center justify-center transition-all">
            <X size={13} strokeWidth={2} />
          </button>
        </div>

        {sent ? (
          <div className="px-4 py-6 flex flex-col items-center gap-2">
            <div className="w-9 h-9 rounded-full bg-brand-50 flex items-center justify-center">
              <Check size={18} className="text-brand-500" strokeWidth={2.5} />
            </div>
            <p className="text-[13px] text-gray-700 font-medium">¡Gracias por tu feedback!</p>
          </div>
        ) : (
          <div className="p-4 space-y-3">
            <p className="text-[12px] text-warm-500 leading-relaxed">
              ¿Algo que no funciona bien, algo que mejorarías o una idea? Contanos.
            </p>
            <textarea
              value={text}
              onChange={e => setText(e.target.value)}
              placeholder="Escribí tu feedback acá..."
              rows={4}
              autoFocus
              className="w-full px-3 py-2.5 bg-warm-50 border border-warm-200 rounded-xl text-[13px] text-gray-800 placeholder-warm-400 focus:outline-none focus:border-brand-400 resize-none transition-colors"
            />
            <button
              onClick={handleSend}
              disabled={!text.trim()}
              className="w-full flex items-center justify-center gap-2 bg-sinergia hover:bg-sinergia-deep disabled:opacity-40 text-white font-semibold text-[13px] py-2.5 rounded-xl transition-all"
            >
              <Send size={13} strokeWidth={2} />
              Enviar
            </button>
          </div>
        )}
      </div>
    </>
  );
}

export default function Sidebar() {
  const location  = useLocation();
  const navigate  = useNavigate();
  const { processes } = useProcessStore();
  const isHome    = location.pathname === '/';
  const [showFeedback, setShowFeedback] = useState(false);

  const recent = [...processes]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 3);

  return (
    <>
      <aside className="fixed inset-y-0 left-0 w-60 bg-white border-r border-warm-200 flex flex-col z-[9999]">

        {/* Logo */}
        <div className="px-6 pt-6 pb-5 border-b border-warm-100">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-lg bg-sinergia flex items-center justify-center flex-shrink-0">
              <span className="text-white font-bold text-sm leading-none">S</span>
            </div>
            <div>
              <p className="text-gray-900 font-semibold text-[14px] leading-tight tracking-tight">Sinergia</p>
              <p className="text-warm-400 text-[10px] leading-tight tracking-wide">Content Studio</p>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="px-4 py-4">
          <button
            onClick={() => navigate('/nuevo')}
            className="w-full flex items-center justify-center gap-2 bg-sinergia hover:bg-sinergia-deep text-white font-semibold text-[13px] px-4 py-2.5 rounded-xl transition-all duration-150 shadow-sm"
          >
            <Plus size={14} strokeWidth={2.5} />
            Nuevo proceso
          </button>
        </div>

        {/* Nav — home button */}
        <nav className="px-3 space-y-0.5">
          <button
            onClick={() => navigate('/')}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium transition-all duration-100 ${
              isHome
                ? 'bg-warm-100 text-gray-900'
                : 'text-warm-700 hover:text-gray-900 hover:bg-warm-50'
            }`}>
            <Home size={16} strokeWidth={1.75} className={isHome ? 'text-brand-500' : 'text-warm-600'} />
            Inicio
          </button>
        </nav>

        {/* Recientes */}
        <div className="px-4 pt-5 flex-1">
          <p className="text-warm-400 text-[9px] font-semibold uppercase tracking-[0.18em] mb-2.5">Recientes</p>
          <div className="space-y-1">
            {recent.map(p => (
              <button
                key={p.id}
                onClick={() => navigate(`/proceso/${p.id}`)}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl hover:bg-warm-50 transition-colors text-left group"
              >
                <div className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${statusDot[p.status]}`} />
                <span className="text-[12px] text-warm-700 group-hover:text-gray-900 truncate transition-colors">
                  {p.name}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Stats summary */}
        <div className="mx-3 mb-3 rounded-xl bg-warm-50 border border-warm-100 p-3.5">
          <p className="text-warm-600 text-[9px] font-semibold uppercase tracking-[0.18em] mb-3">Resumen</p>
          {[
            { label: 'En proceso',   n: processes.filter(p => p.status === 'processing').length, dot: 'bg-blue-500' },
            { label: 'Para revisar', n: processes.filter(p => p.status === 'waiting').length,    dot: 'bg-amber-500' },
            { label: 'Completados',  n: processes.filter(p => p.status === 'completed').length,  dot: 'bg-sinergia' },
          ].map(({ label, n, dot }) => (
            <div key={label} className="flex items-center justify-between py-1">
              <div className="flex items-center gap-2">
                <div className={`w-1.5 h-1.5 rounded-full ${dot}`} />
                <span className="text-warm-700 text-[12px]">{label}</span>
              </div>
              <span className="text-gray-800 text-[12px] font-semibold font-mono">{n}</span>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="border-t border-warm-100 px-3 py-3 flex items-center justify-between">
          <div className="flex gap-1">
            {[
              { icon: Bell,     label: 'Notificaciones' },
              { icon: Settings, label: 'Ajustes' },
            ].map(({ icon: Icon, label }) => (
              <button key={label} title={label}
                className="w-8 h-8 rounded-lg text-warm-600 hover:text-gray-900 hover:bg-warm-100 flex items-center justify-center transition-all">
                <Icon size={15} strokeWidth={1.75} />
              </button>
            ))}
          </div>

          <button
            onClick={() => setShowFeedback(true)}
            className="flex items-center gap-1.5 bg-warm-50 hover:bg-warm-100 border border-warm-200 text-warm-700 hover:text-gray-900 px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all"
          >
            <MessageSquare size={13} strokeWidth={1.75} />
            Feedback
          </button>
        </div>
      </aside>

      {showFeedback && <FeedbackModal onClose={() => setShowFeedback(false)} />}
    </>
  );
}
