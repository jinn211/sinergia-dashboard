import { useState, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Upload, Check, ChevronRight, ChevronLeft, X, Send,
  Image as ImageIcon, FileText, Layers, HelpCircle, MessageSquare,
  Camera, Briefcase, Mail, Smartphone, Monitor, Printer, Zap,
  PenLine, Clock,
} from 'lucide-react';
import type { Channel, Process, ContextualAnswers, ModuleMode, ModuleSchedule } from '../types';
import { CHANNEL_CONFIGS, CONTEXTUAL_QUESTIONS } from '../types';
import { addProcess } from '../store/processStore';

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
      className={`border-2 border-dashed rounded-2xl transition-all duration-200 cursor-pointer min-h-44 flex flex-col items-center justify-center gap-4 p-8 ${
        dragging ? 'border-brand-400 bg-brand-50' :
        file     ? 'border-brand-300 bg-brand-50/50' :
                   'border-warm-300 hover:border-brand-300 hover:bg-brand-50/30'
      }`}
    >
      <input ref={inputRef} type="file" accept={accept} className="hidden"
        onChange={e => e.target.files?.[0] && onFile(e.target.files[0])} />
      {file ? (
        <div className="text-center">
          {preview && <img src={preview} alt="" className="w-16 h-16 object-cover rounded-xl border border-white shadow-sm mx-auto mb-3" />}
          <div className="flex items-center gap-2 justify-center">
            <Check size={14} className="text-brand-500" />
            <span className="text-brand-600 font-semibold text-sm">{file.name}</span>
          </div>
          <p className="text-warm-600 text-xs mt-1">Click para cambiar</p>
        </div>
      ) : (
        <>
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${dragging ? 'bg-brand-100' : 'bg-warm-100'}`}>
            <Upload size={20} strokeWidth={1.5} className={dragging ? 'text-brand-500' : 'text-warm-600'} />
          </div>
          <div className="text-center">
            <p className="text-gray-700 font-semibold text-sm">{label}</p>
            <p className="text-warm-600 text-xs mt-1">{sublabel}</p>
          </div>
        </>
      )}
    </div>
  );
}

function Step1({ data, onChange }: { data: File | null; onChange: (f: File) => void }) {
  const [preview, setPreview] = useState('');
  const handle = (f: File) => { onChange(f); setPreview(URL.createObjectURL(f)); };
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Subí la pieza base</h2>
        <p className="text-warm-700 text-sm mt-1.5 leading-relaxed">El flyer 1:1 ya diseñado por tu equipo. Es el punto de partida visual para todas las adaptaciones.</p>
      </div>
      <Dropzone label="Arrastrá tu flyer 1:1 aquí" sublabel="PNG · JPG · SVG — Recomendado 1080×1080px"
        accept="image/*" file={data} onFile={handle} preview={preview} />
      <div className="bg-brand-50 border border-brand-100 rounded-xl px-4 py-3">
        <p className="text-brand-600 text-xs font-semibold mb-1">Consejo</p>
        <p className="text-brand-500 text-xs leading-relaxed">Alta resolución garantiza que las adaptaciones queden nítidas en todos los formatos.</p>
      </div>
    </div>
  );
}

function Step2({ data, onChange }: { data: File | null; onChange: (f: File) => void }) {
  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Subí la guía de copy</h2>
        <p className="text-warm-700 text-sm mt-1.5 leading-relaxed">Un documento con los lineamientos de escritura. Le da contexto a la IA para generar todos los textos.</p>
      </div>
      <Dropzone label="Arrastrá tu guía de copy aquí" sublabel="PDF · Word · PNG · JPG"
        accept=".pdf,.doc,.docx,image/*" file={data} onFile={onChange} />
      <div className="bg-white rounded-xl border border-warm-200 divide-y divide-warm-100">
        {['Nombre del evento y descripción', 'Tono y estilo de comunicación', 'Hashtags y palabras clave', 'Call to action principal', 'Fecha, lugar y precio'].map((item, i) => (
          <div key={i} className="flex items-center gap-3 px-4 py-2.5">
            <div className="w-1.5 h-1.5 rounded-full bg-sinergia flex-shrink-0" />
            <p className="text-warm-600 text-sm">{item}</p>
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
        <h2 className="text-xl font-bold text-gray-900">Canales de distribución</h2>
        <p className="text-warm-700 text-sm mt-1.5">Elegí en qué canales y formatos se va a distribuir el contenido.</p>
      </div>
      <div className="grid grid-cols-2 gap-3">
        {CHANNEL_CONFIGS.map(channel => {
          const Icon = channelIconMap[channel.id];
          const isSelected = selected.includes(channel.id);
          return (
            <button key={channel.id} onClick={() => toggle(channel.id)}
              className={`relative flex items-start gap-3 p-4 rounded-2xl border-2 text-left transition-all duration-150 ${
                isSelected
                  ? 'border-brand-400 bg-brand-50'
                  : 'border-warm-200 bg-white hover:border-brand-200 hover:bg-brand-50/30'
              }`}>
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${isSelected ? 'bg-sinergia text-white' : 'bg-warm-100 text-warm-700'}`}>
                <Icon size={17} strokeWidth={1.5} />
              </div>
              <div className="flex-1 min-w-0 pt-0.5">
                <p className={`font-semibold text-[13px] leading-tight ${isSelected ? 'text-brand-700' : 'text-gray-700'}`}>{channel.label}</p>
                <p className="text-warm-600 text-[10px] mt-0.5 font-mono">{channel.dimensions}</p>
              </div>
              {channel.isPhysical && (
                <span className="text-[9px] bg-amber-100 text-amber-600 px-1.5 py-0.5 rounded-md font-semibold absolute top-2 right-2">Físico</span>
              )}
              {isSelected && (
                <div className="absolute top-2.5 right-2.5 w-5 h-5 bg-sinergia rounded-full flex items-center justify-center">
                  <Check size={11} className="text-white" strokeWidth={3} />
                </div>
              )}
            </button>
          );
        })}
      </div>
      {selected.length > 0 && (
        <p className="text-brand-500 text-sm font-semibold text-center">
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
      className={`px-3 py-1.5 rounded-lg text-[12px] font-medium transition-all border ${
        selected ? 'bg-sinergia text-white border-brand-400' : 'bg-white text-warm-600 border-warm-200 hover:border-brand-300 hover:text-brand-600'
      }`}>
      {label}
    </button>
  );

  const inputClass = "w-full px-3 py-2 bg-white border border-warm-200 rounded-xl text-sm text-gray-800 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all";
  const labelClass = "text-xs font-semibold text-warm-700 uppercase tracking-wide block mb-2";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Información del evento</h2>
        <p className="text-warm-700 text-sm mt-1.5">Cuanto más contexto, mejor será el contenido generado.</p>
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
      setMessages(m => [...m, { role: 'assistant', text: '¡Perfecto, anotado! ¿Hay algo más o arrancamos?' }]);
      setDone(true);
      endRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 500);
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Contexto adicional</h2>
        <p className="text-warm-700 text-sm mt-1.5">Agregá cualquier información que no se cubrió en los pasos anteriores.</p>
      </div>
      <div className="bg-white border border-warm-200 rounded-2xl overflow-hidden">
        <div className="p-4 space-y-3 max-h-64 overflow-y-auto scrollbar-warm">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {m.role === 'assistant' && (
                <div className="w-7 h-7 rounded-full bg-sinergia flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Zap size={13} className="text-white" />
                </div>
              )}
              <div className={`max-w-xs rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                m.role === 'assistant' ? 'bg-warm-100 text-gray-700 rounded-tl-sm' : 'bg-sinergia text-white rounded-tr-sm'
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
            className="flex-1 px-4 py-2 bg-white border border-warm-200 rounded-xl text-sm text-gray-700 placeholder-warm-400 focus:outline-none focus:border-brand-400 focus:ring-2 focus:ring-brand-100 transition-all" />
          <button onClick={send} disabled={!input.trim()}
            className="px-4 py-2 bg-sinergia disabled:opacity-40 hover:bg-sinergia-deep text-white rounded-xl font-semibold text-sm flex items-center gap-1.5 transition-colors">
            <Send size={14} /> Enviar
          </button>
        </div>
      </div>
      {done && (
        <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
          className="bg-brand-50 border border-brand-100 rounded-xl px-4 py-3 flex items-center gap-2">
          <Check size={14} className="text-brand-500 flex-shrink-0" />
          <p className="text-brand-600 text-sm font-semibold">Todo listo — podés lanzar el proceso</p>
        </motion.div>
      )}
    </div>
  );
}

/* ── Step 0 — Module selection ── */
function Step0({ mode, setMode, copySchedule, setCopySchedule, imageSchedule, setImageSchedule }: {
  mode: ModuleMode; setMode: (m: ModuleMode) => void;
  copySchedule: ModuleSchedule; setCopySchedule: (s: ModuleSchedule) => void;
  imageSchedule: ModuleSchedule; setImageSchedule: (s: ModuleSchedule) => void;
}) {
  const ModeCard = ({ value, icon: Icon, title, desc }: { value: ModuleMode; icon: React.ElementType; title: string; desc: string }) => (
    <button onClick={() => setMode(value)}
      className={`flex flex-col items-start gap-3 p-5 rounded-2xl border-2 text-left transition-all duration-150 h-full ${
        mode === value ? 'border-brand-400 bg-brand-50' : 'border-warm-200 bg-white hover:border-warm-300'
      }`}>
      <div className="flex items-center justify-between w-full">
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-colors ${
          mode === value ? 'bg-sinergia text-white' : 'bg-warm-100 text-warm-500'
        }`}>
          <Icon size={17} strokeWidth={1.75} />
        </div>
        {mode === value && (
          <div className="w-5 h-5 rounded-full bg-brand-400 flex items-center justify-center">
            <Check size={11} className="text-white" strokeWidth={3} />
          </div>
        )}
      </div>
      <div className="flex-1">
        <p className={`font-semibold text-[13px] ${mode === value ? 'text-brand-700' : 'text-gray-800'}`}>{title}</p>
        <p className="text-warm-500 text-[12px] mt-1 leading-relaxed">{desc}</p>
      </div>
    </button>
  );

  const TimingChip = ({ label, copyVal, imgVal }: { label: string; copyVal: ModuleSchedule; imgVal: ModuleSchedule }) => {
    const active = copySchedule === copyVal && imageSchedule === imgVal;
    return (
      <button onClick={() => { setCopySchedule(copyVal); setImageSchedule(imgVal); }}
        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-[13px] font-medium transition-all ${
          active ? 'border-brand-400 bg-brand-50 text-brand-700' : 'border-warm-200 bg-white text-warm-600 hover:border-warm-300'
        }`}>
        <Clock size={13} strokeWidth={1.75} className={active ? 'text-brand-500' : 'text-warm-400'} />
        {label}
      </button>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">¿Qué vas a crear?</h2>
        <p className="text-warm-500 text-sm mt-1.5">Podés generar el copy y las imágenes juntos o por separado.</p>
      </div>
      <div className="grid grid-cols-3 gap-3">
        <ModeCard value="both"        icon={Layers}    title="Copy e imágenes" desc="Generás ambos en el mismo proceso." />
        <ModeCard value="copy-only"   icon={PenLine}   title="Solo copy"       desc="Solo textos, sin adaptaciones gráficas." />
        <ModeCard value="images-only" icon={ImageIcon} title="Solo imágenes"   desc="Solo piezas gráficas, sin textos." />
      </div>

      {mode === 'both' && (
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
          <p className="text-[13px] font-semibold text-gray-700 mb-3">¿Cuándo los generás?</p>
          <div className="flex flex-wrap gap-2">
            <TimingChip label="Los dos ahora"               copyVal="now"   imgVal="now" />
            <TimingChip label="Copy ahora, imágenes después" copyVal="now"   imgVal="later" />
            <TimingChip label="Imágenes ahora, copy después" copyVal="later" imgVal="now" />
          </div>
        </motion.div>
      )}
    </div>
  );
}

/* ── Dynamic step builder ── */
type StepId = 'mode' | 'flyer' | 'guide' | 'channels' | 'context' | 'chat';
interface StepDef { id: StepId; label: string; icon: React.ElementType; }

function buildSteps(mode: ModuleMode, copySchedule: ModuleSchedule, imageSchedule: ModuleSchedule): StepDef[] {
  const steps: StepDef[] = [{ id: 'mode', label: 'Tipo', icon: Layers }];
  if (mode !== 'copy-only' && imageSchedule === 'now')  steps.push({ id: 'flyer',    label: 'Pieza base', icon: ImageIcon });
  if (mode !== 'images-only' && copySchedule === 'now') steps.push({ id: 'guide',    label: 'Guía copy',  icon: FileText });
  steps.push({ id: 'channels', label: 'Canales',   icon: Layers });
  steps.push({ id: 'context',  label: 'Contexto',  icon: HelpCircle });
  steps.push({ id: 'chat',     label: 'Chat',       icon: MessageSquare });
  return steps;
}

export default function NewProcess() {
  const navigate = useNavigate();
  const [stepIdx, setStepIdx]       = useState(0);
  const [moduleMode, setModuleMode] = useState<ModuleMode>('both');
  const [copySchedule, setCopySchedule]   = useState<ModuleSchedule>('now');
  const [imageSchedule, setImageSchedule] = useState<ModuleSchedule>('now');
  const [baseFlyer, setBaseFlyer]   = useState<File | null>(null);
  const [copyGuide, setCopyGuide]   = useState<File | null>(null);
  const [channels, setChannels]     = useState<Channel[]>([]);
  const [answers, setAnswers]       = useState<ContextualAnswers>({});
  const [extraCtx, setExtraCtx]     = useState('');
  const [launching, setLaunching]   = useState(false);
  const [dir, setDir]               = useState(1);

  const activeSteps = buildSteps(moduleMode, copySchedule, imageSchedule);
  const currentStep = activeSteps[stepIdx];
  const isLast      = stepIdx === activeSteps.length - 1;

  const canProceed: Record<StepId, boolean> = {
    mode:     true,
    flyer:    !!baseFlyer,
    guide:    !!copyGuide,
    channels: channels.length > 0,
    context:  true,
    chat:     true,
  };

  const goNext = () => { setDir(1);  setStepIdx(i => i + 1); };
  const goPrev = () => { setDir(-1); setStepIdx(i => i - 1); };

  const handleLaunch = () => {
    setLaunching(true);
    const name = answers.sede
      ? `Evento — ${answers.sede}`
      : CONTEXTUAL_QUESTIONS.activityTypes.find(a => a.value === answers.activityType)?.label || 'Nuevo proceso';

    const newProcess: Process = {
      id: `proc-${Date.now()}`, name,
      channels, status: 'processing', progress: 5,
      moduleMode, copySchedule, imageSchedule,
      createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
      contextualAnswers: answers, additionalContext: extraCtx,
      images: (moduleMode !== 'copy-only' && imageSchedule === 'now')
        ? CHANNEL_CONFIGS.filter(c => channels.includes(c.id)).map(c => ({
            id: `img-new-${c.id}`, channel: c.id, label: c.label, dimensions: c.dimensions,
            status: 'generating' as const,
            imageUrl: `https://placehold.co/500x500/4DB887/ffffff?text=${encodeURIComponent(c.label)}`,
          }))
        : [],
      copies: (moduleMode !== 'images-only' && copySchedule === 'now')
        ? [
            { id: 'cn1', type: 'internal-invite', label: 'Invitación interna',   status: 'generating', content: '' },
            { id: 'cn2', type: 'newsletter',      label: 'Newsletter comunidad', status: 'generating', content: '' },
            { id: 'cn3', type: 'social',          label: 'Redes sociales',       status: 'generating', content: '' },
            { id: 'cn4', type: 'after-movie',     label: 'After-movie',          status: 'generating', content: '' },
          ]
        : [],
    };
    addProcess(newProcess);
    setTimeout(() => navigate(`/proceso/${newProcess.id}`), 400);
  };

  const variants = {
    enter:  (d: number) => ({ x: d > 0 ? 28 : -28, opacity: 0 }),
    center: { x: 0, opacity: 1 },
    exit:   (d: number) => ({ x: d > 0 ? -28 : 28, opacity: 0 }),
  };

  return (
    <div className="min-h-screen p-8 flex flex-col">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Nuevo proceso</h1>
          <p className="text-warm-500 text-sm mt-1">Paso {stepIdx + 1} de {activeSteps.length}</p>
        </div>
        <button onClick={() => navigate('/')}
          className="w-9 h-9 rounded-xl bg-white border border-warm-200 flex items-center justify-center hover:bg-warm-100 transition-colors">
          <X size={15} className="text-warm-700" />
        </button>
      </div>

      {/* Dynamic step progress */}
      <div className="flex items-center gap-2 mb-10">
        {activeSteps.map((s, i) => {
          const done = i < stepIdx, active = i === stepIdx;
          const Icon = s.icon;
          return (
            <div key={s.id} className="flex items-center gap-2 flex-1">
              <div className="flex items-center gap-2 flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  done   ? 'bg-sinergia text-white' :
                  active ? 'bg-sinergia text-white ring-4 ring-brand-100' :
                           'bg-white border-2 border-warm-200 text-warm-600'
                }`}>
                  {done ? <Check size={14} strokeWidth={3} /> : <Icon size={14} />}
                </div>
                <span className={`text-xs font-semibold hidden sm:block ${active ? 'text-brand-600' : done ? 'text-warm-700' : 'text-warm-400'}`}>
                  {s.label}
                </span>
              </div>
              {i < activeSteps.length - 1 && (
                <div className={`flex-1 h-0.5 rounded-full transition-colors ${done ? 'bg-brand-300' : 'bg-warm-200'}`} />
              )}
            </div>
          );
        })}
      </div>

      <div className="flex-1 max-w-2xl">
        <AnimatePresence mode="wait" custom={dir}>
          <motion.div key={currentStep.id} custom={dir} variants={variants}
            initial="enter" animate="center" exit="exit"
            transition={{ duration: 0.18, ease: 'easeOut' }}>
            {currentStep.id === 'mode'     && <Step0 mode={moduleMode} setMode={setModuleMode} copySchedule={copySchedule} setCopySchedule={setCopySchedule} imageSchedule={imageSchedule} setImageSchedule={setImageSchedule} />}
            {currentStep.id === 'flyer'    && <Step1 data={baseFlyer} onChange={setBaseFlyer} />}
            {currentStep.id === 'guide'    && <Step2 data={copyGuide} onChange={setCopyGuide} />}
            {currentStep.id === 'channels' && <Step3 selected={channels} onChange={setChannels} />}
            {currentStep.id === 'context'  && <Step4 data={answers} onChange={setAnswers} />}
            {currentStep.id === 'chat'     && <Step5 context={extraCtx} onChange={setExtraCtx} />}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between mt-8 max-w-2xl">
        <button onClick={goPrev} disabled={stepIdx === 0}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-warm-200 bg-white text-warm-700 text-sm font-semibold hover:bg-warm-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
          <ChevronLeft size={16} /> Anterior
        </button>
        {!isLast ? (
          <button onClick={goNext} disabled={!canProceed[currentStep.id]}
            className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sinergia hover:bg-sinergia-deep disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors">
            Siguiente <ChevronRight size={16} />
          </button>
        ) : (
          <button onClick={handleLaunch} disabled={launching}
            className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-sinergia hover:bg-sinergia-deep disabled:opacity-50 text-white text-sm font-bold transition-colors shadow-sm">
            {launching
              ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Lanzando...</>
              : <><Zap size={15} /> Lanzar proceso</>
            }
          </button>
        )}
      </div>
    </div>
  );
}
