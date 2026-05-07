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

/* ───────── Step indicators ───────── */
const STEPS = [
  { id: 1, label: 'Pieza base',  icon: ImageIcon },
  { id: 2, label: 'Guía copy',  icon: FileText },
  { id: 3, label: 'Canales',    icon: Layers },
  { id: 4, label: 'Contexto',   icon: HelpCircle },
  { id: 5, label: 'Chat',       icon: MessageSquare },
];

/* ───────── Channel icon map ───────── */
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

/* ───────── Dropzone ───────── */
interface DropzoneProps {
  label: string;
  sublabel: string;
  accept: string;
  file: File | null;
  onFile: (f: File) => void;
  preview?: string;
}

function Dropzone({ label, sublabel, accept, file, onFile, preview }: DropzoneProps) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files[0];
    if (f) onFile(f);
  }, [onFile]);

  return (
    <div
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => inputRef.current?.click()}
      className={`relative border-2 border-dashed rounded-2xl transition-all duration-200 cursor-pointer min-h-48 flex flex-col items-center justify-center gap-3 p-8 ${
        dragging
          ? 'border-brand-400 bg-brand-50'
          : file
          ? 'border-emerald-300 bg-emerald-50/50'
          : 'border-surface-300 bg-surface-50 hover:border-brand-300 hover:bg-brand-50/30'
      }`}
    >
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={e => e.target.files?.[0] && onFile(e.target.files[0])} />

      {file ? (
        <>
          {preview && (
            <img src={preview} alt="" className="w-24 h-24 object-cover rounded-xl border border-white shadow-card" />
          )}
          <div className="text-center">
            <div className="flex items-center gap-2 justify-center mb-1">
              <Check size={16} className="text-emerald-600" />
              <span className="text-emerald-700 font-semibold text-sm">{file.name}</span>
            </div>
            <p className="text-gray-400 text-xs">Hacé click para cambiar</p>
          </div>
        </>
      ) : (
        <>
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${
            dragging ? 'bg-brand-100' : 'bg-surface-200'
          }`}>
            <Upload size={22} className={dragging ? 'text-brand-600' : 'text-gray-400'} />
          </div>
          <div className="text-center">
            <p className="text-gray-700 font-medium text-sm">{label}</p>
            <p className="text-gray-400 text-xs mt-1">{sublabel}</p>
          </div>
        </>
      )}
    </div>
  );
}

/* ───────── Step 1 — Upload base flyer ───────── */
function Step1({ data, onChange }: { data: File | null; onChange: (f: File) => void }) {
  const [preview, setPreview] = useState<string>('');
  const handleFile = (f: File) => {
    onChange(f);
    const url = URL.createObjectURL(f);
    setPreview(url);
  };
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Subí la pieza base</h2>
        <p className="text-gray-500 text-sm mt-1">El flyer en formato 1:1 que ya diseñó tu equipo. Este va a ser el punto de partida para todas las adaptaciones.</p>
      </div>
      <Dropzone
        label="Arrastrá tu flyer 1:1 aquí"
        sublabel="PNG, JPG o SVG · Recomendado 1080×1080px"
        accept="image/*"
        file={data}
        onFile={handleFile}
        preview={preview}
      />
      <div className="bg-brand-50 border border-brand-100 rounded-xl p-4">
        <p className="text-brand-700 text-xs font-medium mb-1">💡 Consejo</p>
        <p className="text-brand-600 text-xs">Asegurate de que la pieza esté en alta resolución para que las adaptaciones queden nítidas en todos los formatos.</p>
      </div>
    </div>
  );
}

/* ───────── Step 2 — Upload copy guide ───────── */
function Step2({ data, onChange }: { data: File | null; onChange: (f: File) => void }) {
  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Subí la guía de copy</h2>
        <p className="text-gray-500 text-sm mt-1">Un documento o imagen con los lineamientos de escritura para este proceso. Esto le da contexto a la IA para generar los textos.</p>
      </div>
      <Dropzone
        label="Arrastrá tu guía de copy aquí"
        sublabel="PDF, Word, PNG o JPG con el brief"
        accept=".pdf,.doc,.docx,image/*"
        file={data}
        onFile={onChange}
      />
      <div className="bg-surface-100 rounded-xl p-4 space-y-2">
        <p className="text-gray-600 text-xs font-semibold">¿Qué incluir en la guía de copy?</p>
        {['Nombre del evento y descripción breve', 'Tono de comunicación deseado', 'Palabras clave o hashtags', 'Call to action principal', 'Información práctica (fecha, lugar, precio)'].map(item => (
          <div key={item} className="flex items-center gap-2">
            <Check size={12} className="text-brand-500 flex-shrink-0" />
            <p className="text-gray-500 text-xs">{item}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ───────── Step 3 — Channel selection ───────── */
function Step3({ selected, onChange }: { selected: Channel[]; onChange: (ch: Channel[]) => void }) {
  const toggle = (ch: Channel) => {
    onChange(selected.includes(ch) ? selected.filter(c => c !== ch) : [...selected, ch]);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Seleccioná los canales</h2>
        <p className="text-gray-500 text-sm mt-1">Elegí en qué canales y formatos se va a distribuir este contenido.</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {CHANNEL_CONFIGS.map(channel => {
          const Icon = channelIconMap[channel.id];
          const isSelected = selected.includes(channel.id);
          return (
            <button
              key={channel.id}
              onClick={() => toggle(channel.id)}
              className={`relative flex items-start gap-3 p-4 rounded-2xl border-2 text-left transition-all duration-150 ${
                isSelected
                  ? 'border-brand-500 bg-brand-50'
                  : 'border-surface-200 bg-white hover:border-brand-200 hover:bg-brand-50/30'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors ${
                isSelected ? 'bg-brand-500 text-white' : 'bg-surface-100 text-gray-400'
              }`}>
                <Icon size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold leading-tight ${isSelected ? 'text-brand-700' : 'text-gray-700'}`}>
                  {channel.label}
                </p>
                <p className="text-xs text-gray-400 mt-0.5">{channel.sublabel}</p>
                <p className="text-xs text-gray-300 mt-0.5 font-mono">{channel.dimensions}</p>
              </div>
              {channel.isPhysical && (
                <span className="text-xs bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-md font-medium absolute top-2 right-2">Físico</span>
              )}
              {isSelected && (
                <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-brand-500 flex items-center justify-center">
                  <Check size={11} className="text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>
      {selected.length > 0 && (
        <p className="text-brand-600 text-sm font-medium text-center">
          {selected.length} canal{selected.length !== 1 ? 'es' : ''} seleccionado{selected.length !== 1 ? 's' : ''}
        </p>
      )}
    </div>
  );
}

/* ───────── Step 4 — Contextual questions ───────── */
function Step4({ data, onChange }: { data: ContextualAnswers; onChange: (d: ContextualAnswers) => void }) {
  const set = (key: keyof ContextualAnswers, value: unknown) => onChange({ ...data, [key]: value });

  const Chip = ({ label, selected, onClick }: { label: string; selected: boolean; onClick: () => void }) => (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
        selected
          ? 'bg-brand-600 text-white border-brand-600'
          : 'bg-white text-gray-600 border-surface-200 hover:border-brand-300 hover:text-brand-600'
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Información del proceso</h2>
        <p className="text-gray-500 text-sm mt-1">Completá los detalles para que la IA genere contenido más preciso y relevante.</p>
      </div>

      <div className="space-y-5">
        {/* Activity type */}
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-2">Tipo de actividad</label>
          <div className="flex flex-wrap gap-2">
            {CONTEXTUAL_QUESTIONS.activityTypes.map(({ value, label }) => (
              <Chip key={value} label={label} selected={data.activityType === value} onClick={() => set('activityType', value as ContextualAnswers['activityType'])} />
            ))}
          </div>
        </div>

        {/* Audience */}
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-2">Público objetivo <span className="text-gray-400 font-normal">(podés elegir varios)</span></label>
          <div className="flex flex-wrap gap-2">
            {CONTEXTUAL_QUESTIONS.audiences.map(({ value, label }) => {
              const audiences: string[] = (data.audience as string[]) || [];
              const isSelected = audiences.includes(value);
              return (
                <Chip
                  key={value}
                  label={label}
                  selected={isSelected}
                  onClick={() => set('audience', isSelected
                    ? audiences.filter((a) => a !== value)
                    : [...audiences, value]
                  )}
                />
              );
            })}
          </div>
        </div>

        {/* Tone */}
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-2">Tono de comunicación</label>
          <div className="flex flex-wrap gap-2">
            {CONTEXTUAL_QUESTIONS.tones.map(({ value, label }) => (
              <Chip key={value} label={label} selected={data.tone === value} onClick={() => set('tone', value as ContextualAnswers['tone'])} />
            ))}
          </div>
        </div>

        {/* Date and Time */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">Fecha del evento</label>
            <input
              type="date"
              value={data.eventDate || ''}
              onChange={e => set('eventDate', e.target.value)}
              className="w-full px-3 py-2 bg-white border border-surface-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100 transition"
            />
          </div>
          <div>
            <label className="text-sm font-semibold text-gray-700 block mb-2">Hora</label>
            <input
              type="time"
              value={data.eventTime || ''}
              onChange={e => set('eventTime', e.target.value)}
              className="w-full px-3 py-2 bg-white border border-surface-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100 transition"
            />
          </div>
        </div>

        {/* Sede */}
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-2">Sede</label>
          <select
            value={data.sede || ''}
            onChange={e => set('sede', e.target.value)}
            className="w-full px-3 py-2 bg-white border border-surface-200 rounded-xl text-sm text-gray-700 focus:outline-none focus:border-brand-300 focus:ring-2 focus:ring-brand-100 transition"
          >
            <option value="">Seleccioná una sede</option>
            {CONTEXTUAL_QUESTIONS.sedes.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Free / Paid */}
        <div>
          <label className="text-sm font-semibold text-gray-700 block mb-2">Costo</label>
          <div className="flex gap-2">
            <Chip label="Entrada libre" selected={data.isFree === true}  onClick={() => set('isFree', true)} />
            <Chip label="Con costo"     selected={data.isFree === false} onClick={() => set('isFree', false)} />
          </div>
        </div>
      </div>
    </div>
  );
}

/* ───────── Step 5 — Chat ───────── */
interface ChatMessage { role: 'assistant' | 'user'; text: string; }

function Step5({ onChange }: { context: string; onChange: (s: string) => void }) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', text: '¡Ya casi terminamos! ¿Hay algún detalle adicional que quieras que la IA tenga en cuenta? Por ejemplo: speakers, patrocinadores, restricciones de diseño, links de registro, dress code o cualquier información que no hayamos cubierto.' },
  ]);
  const [input, setInput] = useState('');
  const [done, setDone] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const send = () => {
    if (!input.trim()) return;
    const userMsg: ChatMessage = { role: 'user', text: input.trim() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    onChange(input.trim());
    setInput('');

    setTimeout(() => {
      setMessages(prev => [...prev, {
        role: 'assistant',
        text: '¡Perfecto, anotado! ¿Hay algo más que quieras agregar, o ya tenemos todo para arrancar?',
      }]);
      setDone(true);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 600);
  };

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Contexto adicional</h2>
        <p className="text-gray-500 text-sm mt-1">Conversá con el sistema para agregar cualquier información relevante que no se cubrió en los pasos anteriores.</p>
      </div>

      <div className="bg-white border border-surface-200 rounded-2xl overflow-hidden">
        <div className="p-4 space-y-4 max-h-72 overflow-y-auto scrollbar-thin">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {msg.role === 'assistant' && (
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center flex-shrink-0">
                  <Zap size={14} className="text-white" />
                </div>
              )}
              <div className={`max-w-xs rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === 'assistant'
                  ? 'bg-surface-100 text-gray-700 rounded-tl-sm'
                  : 'bg-brand-600 text-white rounded-tr-sm'
              }`}>
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="border-t border-surface-100 p-3 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && send()}
            placeholder={done ? 'Podés agregar más detalles...' : 'Escribí aquí...'}
            className="flex-1 px-4 py-2 bg-surface-50 rounded-xl text-sm text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-brand-100 border border-surface-200 transition"
          />
          <button
            onClick={send}
            disabled={!input.trim()}
            className="w-9 h-9 rounded-xl bg-brand-600 disabled:opacity-40 hover:bg-brand-700 text-white flex items-center justify-center transition-colors flex-shrink-0"
          >
            <Send size={15} />
          </button>
        </div>
      </div>

      {done && (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-50 border border-emerald-100 rounded-xl p-3 flex items-center gap-2"
        >
          <Check size={16} className="text-emerald-600 flex-shrink-0" />
          <p className="text-emerald-700 text-sm font-medium">Todo listo — podés lanzar el proceso</p>
        </motion.div>
      )}
    </div>
  );
}

/* ───────── Main wizard ───────── */
export default function NewProcess() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [baseFlyer, setBaseFlyer] = useState<File | null>(null);
  const [copyGuide, setCopyGuide] = useState<File | null>(null);
  const [channels, setChannels] = useState<Channel[]>([]);
  const [answers, setAnswers] = useState<ContextualAnswers>({});
  const [extraContext, setExtraContext] = useState('');
  const [launching, setLaunching] = useState(false);

  const canProceed: Record<number, boolean> = {
    1: !!baseFlyer,
    2: !!copyGuide,
    3: channels.length > 0,
    4: true,
    5: true,
  };

  const handleLaunch = () => {
    setLaunching(true);
    const newProcess: Process = {
      id: `proc-${Date.now()}`,
      name: answers.sede
        ? `Evento — ${answers.sede}`
        : answers.activityType
        ? `${CONTEXTUAL_QUESTIONS.activityTypes.find(a => a.value === answers.activityType)?.label || 'Nuevo evento'}`
        : 'Nuevo proceso de contenido',
      channels,
      status: 'processing',
      progress: 5,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      contextualAnswers: answers,
      additionalContext: extraContext,
      images: CHANNEL_CONFIGS
        .filter(c => channels.includes(c.id))
        .map(c => ({
          id: `img-new-${c.id}`,
          channel: c.id,
          label: c.label,
          dimensions: c.dimensions,
          status: 'generating',
          imageUrl: `https://placehold.co/500x500/7c3aed/ffffff?text=${encodeURIComponent(c.label)}`,
        })),
      copies: [
        { id: 'copy-new-1', type: 'internal-invite', label: 'Invitación interna',   status: 'generating', content: '' },
        { id: 'copy-new-2', type: 'newsletter',      label: 'Newsletter comunidad', status: 'generating', content: '' },
        { id: 'copy-new-3', type: 'social',          label: 'Redes sociales',       status: 'generating', content: '' },
        { id: 'copy-new-4', type: 'after-movie',     label: 'After-movie',          status: 'generating', content: '' },
      ],
    };
    addProcess(newProcess);
    setTimeout(() => navigate(`/proceso/${newProcess.id}`), 600);
  };

  const slideVariants = {
    enter: (dir: number) => ({ x: dir > 0 ? 40 : -40, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:  (dir: number) => ({ x: dir > 0 ? -40 : 40, opacity: 0 }),
  };
  const [dir, setDir] = useState(1);

  const goNext = () => { setDir(1); setStep(s => s + 1); };
  const goPrev = () => { setDir(-1); setStep(s => s - 1); };

  return (
    <div className="min-h-screen p-8 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Nuevo proceso</h1>
          <p className="text-gray-500 text-sm mt-1">Paso {step} de {STEPS.length}</p>
        </div>
        <button onClick={() => navigate('/')} className="w-9 h-9 rounded-xl bg-white border border-surface-200 flex items-center justify-center hover:bg-surface-100 transition">
          <X size={16} className="text-gray-500" />
        </button>
      </div>

      {/* Step progress */}
      <div className="flex items-center gap-2 mb-10">
        {STEPS.map((s, i) => {
          const Icon = s.icon;
          const isDone = step > s.id;
          const isCurrent = step === s.id;
          return (
            <div key={s.id} className="flex items-center gap-2 flex-1">
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                  isDone    ? 'bg-brand-600 text-white' :
                  isCurrent ? 'bg-brand-600 text-white ring-4 ring-brand-100' :
                              'bg-white border-2 border-surface-200 text-gray-400'
                }`}>
                  {isDone ? <Check size={14} /> : <Icon size={14} />}
                </div>
                <span className={`text-xs font-medium hidden sm:block ${isCurrent ? 'text-brand-700' : isDone ? 'text-gray-500' : 'text-gray-400'}`}>
                  {s.label}
                </span>
              </div>
              {i < STEPS.length - 1 && (
                <div className={`flex-1 h-0.5 rounded-full transition-colors duration-500 ${isDone ? 'bg-brand-400' : 'bg-surface-200'}`} />
              )}
            </div>
          );
        })}
      </div>

      {/* Step content */}
      <div className="flex-1 max-w-2xl">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div
            key={step}
            custom={dir}
            variants={slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {step === 1 && <Step1 data={baseFlyer} onChange={setBaseFlyer} />}
            {step === 2 && <Step2 data={copyGuide} onChange={setCopyGuide} />}
            {step === 3 && <Step3 selected={channels} onChange={setChannels} />}
            {step === 4 && <Step4 data={answers} onChange={setAnswers} />}
            {step === 5 && <Step5 context={extraContext} onChange={setExtraContext} />}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between mt-8 max-w-2xl">
        <button
          onClick={goPrev}
          disabled={step === 1}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-surface-200 bg-white text-gray-600 text-sm font-medium hover:bg-surface-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          <ChevronLeft size={16} />
          Anterior
        </button>

        {step < STEPS.length ? (
          <button
            onClick={goNext}
            disabled={!canProceed[step]}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium transition"
          >
            Siguiente
            <ChevronRight size={16} />
          </button>
        ) : (
          <button
            onClick={handleLaunch}
            disabled={launching}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white text-sm font-semibold transition shadow-sm"
          >
            {launching ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Lanzando...
              </>
            ) : (
              <>
                <Zap size={16} />
                Lanzar proceso
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}
