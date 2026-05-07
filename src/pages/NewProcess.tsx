import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Upload, Check, ChevronRight, ChevronLeft, X, Send,
  Image as ImageIcon, FileText, Layers, HelpCircle, MessageSquare,
  Camera, Briefcase, Mail, Smartphone, Monitor, Printer, Zap,
} from 'lucide-react';
import type { Channel, Process, ContextualAnswers } from '../types';
import { CHANNEL_CONFIGS, CONTEXTUAL_QUESTIONS } from '../types';
import { addProcess } from '../store/processStore';

const STEPS = [
  { id: 1, label: 'Pieza base', icon: ImageIcon },
  { id: 2, label: 'Guía copy',  icon: FileText },
  { id: 3, label: 'Canales',    icon: Layers },
  { id: 4, label: 'Contexto',   icon: HelpCircle },
  { id: 5, label: 'Chat',       icon: MessageSquare },
];

const channelIconMap: Record<Channel, React.ElementType> = {
  'instagram-post':  Camera,
  'instagram-story': Zap,
  'linkedin':        Briefcase,
  'email':           Mail,
  'app-card':        Smartphone,
  'screens':         Monitor,
  'poster-a4':       Printer,
  'poster-a5':       Printer,
};

/* ── Dropzone ── */
function Dropzone({ label, sublabel, accept, file, onFile, preview }: {
  label: string; sublabel: string; accept: string;
  file: File | null; onFile: (f: File) => void; preview?: string;
}) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault(); setDragging(false);
    const f = e.dataTransfer.files[0]; if (f) onFile(f);
  }, [onFile]);

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`border-2 border-dashed rounded transition-all duration-150 cursor-pointer min-h-44 flex flex-col items-center justify-center gap-4 p-8 ${
        dragging ? 'border-warm-400 bg-warm-50' :
        file     ? 'border-status-completed/50 bg-green-50/30' :
                   'border-warm-200 hover:border-warm-300 hover:bg-warm-50'
      }`}
    >
      <input ref={inputRef} type="file" accept={accept} className="hidden"
        onChange={e => e.target.files?.[0] && onFile(e.target.files[0])} />
      {file ? (
        <div className="text-center">
          {preview && <img src={preview} alt="" className="w-16 h-16 object-cover rounded mx-auto mb-3 shadow-sm" />}
          <div className="flex items-center gap-2 justify-center">
            <Check size={13} className="text-status-completed" />
            <span className="font-mono text-[12px] text-status-completed">{file.name}</span>
          </div>
          <p className="font-mono text-[10px] text-warm-400 mt-1">Click para cambiar</p>
        </div>
      ) : (
        <>
          <Upload size={20} strokeWidth={1.5} className={dragging ? 'text-warm-600' : 'text-warm-400'} />
          <div className="text-center">
            <p className="font-body font-medium text-warm-700 text-[14px]">{label}</p>
            <p className="font-mono text-[10px] text-warm-400 mt-1">{sublabel}</p>
          </div>
        </>
      )}
    </div>
  );
}

/* ── Steps ── */
function Step1({ data, onChange }: { data: File | null; onChange: (f: File) => void }) {
  const [preview, setPreview] = useState('');
  const handle = (f: File) => { onChange(f); setPreview(URL.createObjectURL(f)); };
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-[22px] text-warm-950 tracking-tight">Pieza base</h2>
        <p className="font-body text-[13px] text-warm-500 mt-2 leading-relaxed">El flyer 1:1 ya diseñado por tu equipo. Este es el punto de partida visual para todas las adaptaciones de formato.</p>
      </div>
      <Dropzone label="Subí tu flyer 1:1" sublabel="PNG · JPG · SVG — Recomendado 1080×1080px"
        accept="image/*" file={data} onFile={handle} preview={preview} />
      <div className="flex items-start gap-3 bg-warm-50 border border-warm-200 rounded px-4 py-3">
        <span className="font-mono text-[10px] text-warm-400 mt-0.5 uppercase tracking-wider flex-shrink-0">Nota</span>
        <p className="font-body text-[12px] text-warm-500 leading-relaxed">Alta resolución garantiza que las adaptaciones queden nítidas en todos los formatos, especialmente en las piezas físicas.</p>
      </div>
    </div>
  );
}

function Step2({ data, onChange }: { data: File | null; onChange: (f: File) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-[22px] text-warm-950 tracking-tight">Guía de copy</h2>
        <p className="font-body text-[13px] text-warm-500 mt-2 leading-relaxed">Un documento con los lineamientos de escritura para este proceso. Le da contexto a la IA para generar todos los textos.</p>
      </div>
      <Dropzone label="Subí la guía de copy" sublabel="PDF · Word · PNG · JPG"
        accept=".pdf,.doc,.docx,image/*" file={data} onFile={onChange} />
      <div className="border border-warm-200 rounded divide-y divide-warm-100">
        {['Nombre del evento y descripción', 'Tono y estilo de comunicación', 'Hashtags y palabras clave', 'Call to action principal', 'Fecha, lugar y precio'].map((item, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-2.5">
            <div className="w-1 h-1 rounded-full bg-warm-300 flex-shrink-0" />
            <p className="font-body text-[12px] text-warm-600">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

function Step3({ selected, onChange }: { selected: Channel[]; onChange: (ch: Channel[]) => void }) {
  const toggle = (ch: Channel) =>
    onChange(selected.includes(ch) ? selected.filter(c => c !== ch) : [...selected, ch]);

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-[22px] text-warm-950 tracking-tight">Canales de distribución</h2>
        <p className="font-body text-[13px] text-warm-500 mt-2">Elegí en qué canales y formatos se va a distribuir el contenido.</p>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {CHANNEL_CONFIGS.map(channel => {
          const Icon = channelIconMap[channel.id];
          const isSelected = selected.includes(channel.id);
          return (
            <button key={channel.id} onClick={() => toggle(channel.id)}
              className={`relative flex items-start gap-3 p-4 border rounded text-left transition-all duration-100 ${
                isSelected
                  ? 'border-warm-700 bg-warm-950 text-white'
                  : 'border-warm-200 bg-white hover:border-warm-300 hover:bg-warm-50 text-warm-700'
              }`}>
              <Icon size={16} strokeWidth={1.5} className={isSelected ? 'text-white mt-0.5 flex-shrink-0' : 'text-warm-400 mt-0.5 flex-shrink-0'} />
              <div className="flex-1 min-w-0">
                <p className="font-body font-medium text-[13px] leading-tight">{channel.label}</p>
                <p className={`font-mono text-[10px] mt-0.5 ${isSelected ? 'text-warm-300' : 'text-warm-400'}`}>{channel.dimensions}</p>
              </div>
              {channel.isPhysical && (
                <span className={`font-mono text-[9px] uppercase tracking-wider border px-1.5 py-0.5 rounded-sm self-start ${isSelected ? 'border-warm-600 text-warm-300' : 'border-warm-200 text-warm-400'}`}>
                  Físico
                </span>
              )}
              {isSelected && (
                <div className="absolute top-3 right-3 w-4 h-4 bg-white rounded-full flex items-center justify-center flex-shrink-0">
                  <Check size={10} className="text-warm-950" strokeWidth={3} />
                </div>
              )}
            </button>
          );
        })}
      </div>
      {selected.length > 0 && (
        <p className="font-mono text-[11px] text-warm-500">
          {selected.length} canal{selected.length !== 1 ? 'es' : ''} seleccionado{selected.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}

function Step4({ data, onChange }: { data: ContextualAnswers; onChange: (d: ContextualAnswers) => void }) {
  const set = (key: keyof ContextualAnswers, value: unknown) => onChange({ ...data, [key]: value });

  const Chip = ({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) => (
    <button onClick={onClick}
      className={`px-3 py-1.5 font-body text-[12px] rounded border transition-all duration-100 ${
        selected
          ? 'bg-warm-950 text-white border-warm-950'
          : 'text-warm-600 border-warm-200 bg-white hover:border-warm-400 hover:text-warm-800'
      }`}>
      {label}
    </button>
  );

  const inputClass = "w-full px-3 py-2 bg-white border border-warm-200 rounded text-[13px] font-body text-warm-800 focus:outline-none focus:border-warm-500 transition-colors";
  const labelClass = "font-mono text-[10px] text-warm-400 uppercase tracking-[0.15em] block mb-2";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-[22px] text-warm-950 tracking-tight">Información del evento</h2>
        <p className="font-body text-[13px] text-warm-500 mt-2">Cuanto más contexto, mejor será el contenido generado.</p>
      </div>
      <div className="space-y-5">
        <div>
          <label className={labelClass}>Tipo de actividad</label>
          <div className="flex flex-wrap gap-2">
            {CONTEXTUAL_QUESTIONS.activityTypes.map(({ value, label }) => (
              <Chip key={value} label={label} selected={data.activityType === value}
                onClick={() => set('activityType', value as ContextualAnswers['activityType'])} />
            ))}
          </div>
        </div>
        <div>
          <label className={labelClass}>Público objetivo</label>
          <div className="flex flex-wrap gap-2">
            {CONTEXTUAL_QUESTIONS.audiences.map(({ value, label }) => {
              const audiences: string[] = (data.audience as string[]) || [];
              const isSelected = audiences.includes(value);
              return (
                <Chip key={value} label={label} selected={isSelected}
                  onClick={() => set('audience', isSelected ? audiences.filter(a => a !== value) : [...audiences, value])} />
              );
            })}
          </div>
        </div>
        <div>
          <label className={labelClass}>Tono de comunicación</label>
          <div className="flex flex-wrap gap-2">
            {CONTEXTUAL_QUESTIONS.tones.map(({ value, label }) => (
              <Chip key={value} label={label} selected={data.tone === value}
                onClick={() => set('tone', value as ContextualAnswers['tone'])} />
            ))}
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className={labelClass}>Fecha</label>
            <input type="date" value={data.eventDate || ''} onChange={e => set('eventDate', e.target.value)} className={inputClass} />
          </div>
          <div>
            <label className={labelClass}>Hora</label>
            <input type="time" value={data.eventTime || ''} onChange={e => set('eventTime', e.target.value)} className={inputClass} />
          </div>
        </div>
        <div>
          <label className={labelClass}>Sede</label>
          <select value={data.sede || ''} onChange={e => set('sede', e.target.value)} className={inputClass}>
            <option value="">Seleccioná una sede</option>
            {CONTEXTUAL_QUESTIONS.sedes.map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className={labelClass}>Costo</label>
          <div className="flex gap-2">
            <Chip label="Entrada libre" selected={data.isFree === true}  onClick={() => set('isFree', true)} />
            <Chip label="Con costo"     selected={data.isFree === false} onClick={() => set('isFree', false)} />
          </div>
        </div>
      </div>
    </div>
  );
}

function Step5({ onChange }: { context: string; onChange: (s: string) => void }) {
  const [messages, setMessages] = useState<{ role: 'assistant' | 'user'; text: string }[]>([{
    role: 'assistant',
    text: '¿Hay algún detalle adicional que la IA deba considerar? Speakers, patrocinadores, restricciones de diseño, links de registro, dress code...',
  }]);
  const [input, setInput] = useState('');
  const [done, setDone]   = useState(false);
  const endRef            = useRef<HTMLDivElement>(null);

  const send = () => {
    if (!input.trim()) return;
    setMessages(m => [...m, { role: 'user', text: input.trim() }]);
    onChange(input.trim());
    setInput('');
    setTimeout(() => {
      setMessages(m => [...m, { role: 'assistant', text: '¡Perfecto. ¿Hay algo más o arrancamos?' }]);
      setDone(true);
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 500);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-[22px] text-warm-950 tracking-tight">Contexto adicional</h2>
        <p className="font-body text-[13px] text-warm-500 mt-2">Agregá cualquier información que no se cubrió en los pasos anteriores.</p>
      </div>
      <div className="border border-warm-200 rounded overflow-hidden bg-white">
        <div className="p-4 space-y-3 max-h-60 overflow-y-auto scrollbar-warm">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {m.role === 'assistant' && (
                <div className="w-6 h-6 bg-warm-100 border border-warm-200 rounded flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Zap size={11} className="text-warm-600" />
                </div>
              )}
              <div className={`max-w-xs rounded px-3.5 py-2.5 text-[13px] leading-relaxed font-body ${
                m.role === 'assistant'
                  ? 'bg-warm-50 border border-warm-200 text-warm-700'
                  : 'bg-warm-950 text-white ml-auto'
              }`}>
                {m.text}
              </div>
            </div>
          ))}
          <div ref={endRef} />
        </div>
        <div className="border-t border-warm-100 p-3 flex gap-2 bg-warm-50">
          <input type="text" value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder="Escribí aquí..."
            className="flex-1 px-3 py-2 bg-white border border-warm-200 rounded text-[13px] font-body text-warm-800 placeholder-warm-400 focus:outline-none focus:border-warm-400 transition-colors" />
          <button onClick={send} disabled={!input.trim()}
            className="px-4 py-2 bg-warm-950 disabled:opacity-30 hover:bg-warm-800 text-white rounded font-body text-[13px] flex items-center gap-1.5 transition-colors">
            <Send size={13} strokeWidth={1.75} /> Enviar
          </button>
        </div>
      </div>
      {done && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2.5 bg-green-50 border border-status-completed/20 rounded px-4 py-3">
          <Check size={13} className="text-status-completed flex-shrink-0" />
          <p className="font-body text-[13px] text-status-completed">Todo listo — podés lanzar el proceso</p>
        </motion.div>
      )}
    </div>
  );
}

/* ── Main ── */
export default function NewProcess() {
  const navigate = useNavigate();
  const [step, setStep]           = useState(1);
  const [baseFlyer, setBaseFlyer] = useState<File | null>(null);
  const [copyGuide, setCopyGuide] = useState<File | null>(null);
  const [channels, setChannels]   = useState<Channel[]>([]);
  const [answers, setAnswers]     = useState<ContextualAnswers>({});
  const [extraCtx, setExtraCtx]   = useState('');
  const [launching, setLaunching] = useState(false);
  const [dir, setDir]             = useState(1);

  const canProceed: Record<number, boolean> = {
    1: !!baseFlyer, 2: !!copyGuide, 3: channels.length > 0, 4: true, 5: true,
  };

  const goNext = () => { setDir(1);  setStep(s => s + 1); };
  const goPrev = () => { setDir(-1); setStep(s => s - 1); };

  const handleLaunch = () => {
    setLaunching(true);
    const name = answers.sede
      ? `Evento — ${answers.sede}`
      : CONTEXTUAL_QUESTIONS.activityTypes.find(a => a.value === answers.activityType)?.label || 'Nuevo proceso';
    const newProcess: Process = {
      id: `proc-${Date.now()}`, name,
      channels, status: 'processing', progress: 5,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      contextualAnswers: answers, additionalContext: extraCtx,
      images: CHANNEL_CONFIGS.filter(c => channels.includes(c.id)).map(c => ({
        id: `img-new-${c.id}`, channel: c.id, label: c.label, dimensions: c.dimensions,
        status: 'generating',
        imageUrl: `https://placehold.co/500x500/EDE9E0/8C8880?text=${encodeURIComponent(c.label)}`,
      })),
      copies: [
        { id: 'cn1', type: 'internal-invite', label: 'Invitación interna',   status: 'generating', content: '' },
        { id: 'cn2', type: 'newsletter',      label: 'Newsletter comunidad', status: 'generating', content: '' },
        { id: 'cn3', type: 'social',          label: 'Redes sociales',       status: 'generating', content: '' },
        { id: 'cn4', type: 'after-movie',     label: 'After-movie',          status: 'generating', content: '' },
      ],
    };
    addProcess(newProcess);
    setTimeout(() => navigate(`/proceso/${newProcess.id}`), 400);
  };

  const variants = {
    enter:  (d: number) => ({ x: d > 0 ? 24 : -24, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:   (d: number) => ({ x: d > 0 ? -24 : 24, opacity: 0 }),
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <div className="border-b border-warm-100 px-8 py-5 flex items-center justify-between">
        <div>
          <h1 className="font-display text-[22px] text-warm-950 tracking-tight leading-none">Nuevo proceso</h1>
          <p className="font-mono text-[10px] text-warm-400 mt-1.5 uppercase tracking-wider">Paso {step} de {STEPS.length}</p>
        </div>
        <button onClick={() => navigate('/')}
          className="w-8 h-8 border border-warm-200 rounded flex items-center justify-center text-warm-400 hover:text-warm-700 hover:border-warm-300 transition-colors">
          <X size={14} strokeWidth={2} />
        </button>
      </div>

      {/* Step progress */}
      <div className="border-b border-warm-100 px-8 py-4 flex items-center gap-0">
        {STEPS.map((s, i) => {
          const done = step > s.id, current = step === s.id;
          return (
            <div key={s.id} className="flex items-center">
              <div className="flex items-center gap-2">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center font-mono text-[11px] transition-all border ${
                  done    ? 'bg-warm-950 border-warm-950 text-white' :
                  current ? 'bg-white border-warm-700 text-warm-900' :
                            'bg-white border-warm-200 text-warm-400'
                }`}>
                  {done ? <Check size={11} strokeWidth={3} /> : s.id}
                </div>
                <span className={`font-body text-[12px] hidden sm:block ${current ? 'text-warm-800' : done ? 'text-warm-500' : 'text-warm-300'}`}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`w-8 h-px mx-3 transition-colors ${done ? 'bg-warm-400' : 'bg-warm-200'}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Content */}
      <div className="flex-1 px-8 py-8 max-w-2xl">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div key={step} custom={dir} variants={variants}
            initial="enter" animate="center" exit="exit"
            transition={{ duration: 0.18, ease: 'easeOut' }}>
            {step === 1 && <Step1 data={baseFlyer} onChange={setBaseFlyer} />}
            {step === 2 && <Step2 data={copyGuide} onChange={setCopyGuide} />}
            {step === 3 && <Step3 selected={channels} onChange={setChannels} />}
            {step === 4 && <Step4 data={answers} onChange={setAnswers} />}
            {step === 5 && <Step5 context={extraCtx} onChange={setExtraCtx} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Footer nav */}
      <div className="border-t border-warm-100 px-8 py-4 flex items-center justify-between max-w-2xl">
        <button onClick={goPrev} disabled={step === 1}
          className="flex items-center gap-2 px-4 py-2 border border-warm-200 rounded font-body text-[13px] text-warm-500 hover:text-warm-800 hover:border-warm-300 disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
          <ChevronLeft size={15} /> Anterior
        </button>

        {step < STEPS.length ? (
          <button onClick={goNext} disabled={!canProceed[step]}
            className="flex items-center gap-2 px-5 py-2 bg-warm-950 hover:bg-warm-800 text-white rounded font-body text-[13px] disabled:opacity-30 disabled:cursor-not-allowed transition-colors">
            Siguiente <ChevronRight size={15} />
          </button>
        ) : (
          <button onClick={handleLaunch} disabled={launching}
            className="flex items-center gap-2 px-6 py-2 bg-warm-950 hover:bg-warm-800 disabled:opacity-50 text-white rounded font-body font-medium text-[13px] transition-colors">
            {launching
              ? <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Lanzando...</>
              : <><Zap size={13} strokeWidth={2} /> Lanzar proceso</>
            }
          </button>
        )}
      </div>
    </div>
  );
}
