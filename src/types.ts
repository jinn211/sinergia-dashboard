export type Channel =
  | 'instagram-post'
  | 'instagram-story'
  | 'linkedin'
  | 'email'
  | 'app-card'
  | 'screens'
  | 'poster-a4'
  | 'poster-a5';

export type ProcessStatus = 'processing' | 'waiting' | 'completed' | 'error';
export type ModuleMode     = 'both' | 'copy-only' | 'images-only';
export type ModuleSchedule = 'now' | 'later';

export type PieceStatus =
  | 'generating'
  | 'waiting-review'
  | 'approved'
  | 'rejected'
  | 'regenerating';

export type CopyType =
  | 'internal-invite'
  | 'newsletter'
  | 'social'
  | 'after-movie';

export type ActivityType =
  | 'workshop'
  | 'networking'
  | 'charla'
  | 'after-work'
  | 'apertura'
  | 'capacitacion'
  | 'otro';

export type Audience = 'comunidad' | 'empresas' | 'startups' | 'todos';

export type Tone = 'profesional' | 'cercano' | 'inspirador' | 'informativo';

export interface ContextualAnswers {
  activityType?: ActivityType;
  audience?: Audience[];
  tone?: Tone;
  eventDate?: string;
  eventTime?: string;
  sede?: string;
  capacity?: string;
  isFree?: boolean;
  additionalContext?: string;
}

export interface ImagePiece {
  id: string;
  channel: Channel;
  label: string;
  imageUrl: string;
  status: PieceStatus;
  feedback?: string;
  dimensions: string;
}

export interface CopyPiece {
  id: string;
  type: CopyType;
  label: string;
  content: string;
  status: PieceStatus;
  feedback?: string;
}

export interface Process {
  id: string;
  name: string;
  channels: Channel[];
  status: ProcessStatus;
  progress: number;
  createdAt: string;
  updatedAt: string;
  moduleMode: ModuleMode;
  copySchedule: ModuleSchedule;
  imageSchedule: ModuleSchedule;
  images: ImagePiece[];
  copies: CopyPiece[];
  baseImageUrl?: string;
  contextualAnswers?: ContextualAnswers;
  additionalContext?: string;
}

export interface ChannelConfig {
  id: Channel;
  label: string;
  sublabel: string;
  dimensions: string;
  icon: string;
  isPhysical?: boolean;
  hasQR?: boolean;
}

export const CHANNEL_CONFIGS: ChannelConfig[] = [
  { id: 'instagram-post',   label: 'Instagram Post',     sublabel: 'Feed cuadrado',           dimensions: '1080×1080px', icon: '📸' },
  { id: 'instagram-story',  label: 'Instagram Historia', sublabel: 'Historia vertical',        dimensions: '1080×1920px', icon: '⚡' },
  { id: 'linkedin',         label: 'LinkedIn',           sublabel: 'Post profesional',         dimensions: '1200×627px',  icon: '💼' },
  { id: 'email',            label: 'Mail / Newsletter',  sublabel: 'Email marketing',          dimensions: '600×auto px', icon: '✉️' },
  { id: 'app-card',         label: 'App Sinergia',       sublabel: 'Card en app',              dimensions: '796×505px',   icon: '📱' },
  { id: 'screens',          label: 'Pantallas Físicas',  sublabel: 'Espacios comunes',         dimensions: '1920×1080px', icon: '🖥️',  isPhysical: true },
  { id: 'poster-a4',        label: 'Cartel A4',          sublabel: 'Con código QR',            dimensions: 'A4 (210×297mm)', icon: '🪧', isPhysical: true, hasQR: true },
  { id: 'poster-a5',        label: 'Cartel A5',          sublabel: 'Con código QR',            dimensions: 'A5 (148×210mm)', icon: '📄', isPhysical: true, hasQR: true },
];

export const CONTEXTUAL_QUESTIONS = {
  activityTypes: [
    { value: 'workshop', label: 'Workshop' },
    { value: 'networking', label: 'Networking' },
    { value: 'charla', label: 'Charla / Panel' },
    { value: 'after-work', label: 'After Work' },
    { value: 'apertura', label: 'Apertura de sede' },
    { value: 'capacitacion', label: 'Capacitación' },
    { value: 'otro', label: 'Otro' },
  ],
  audiences: [
    { value: 'comunidad', label: 'Comunidad Sinergia' },
    { value: 'empresas', label: 'Empresas clientes' },
    { value: 'startups', label: 'Startups' },
    { value: 'todos', label: 'Público general' },
  ],
  tones: [
    { value: 'profesional', label: 'Profesional' },
    { value: 'cercano', label: 'Cercano y directo' },
    { value: 'inspirador', label: 'Inspirador' },
    { value: 'informativo', label: 'Informativo' },
  ],
  sedes: [
    'World Trade Center', 'La Comercial', 'Pocitos',
    'Ciudad Vieja', 'Aguada', 'Buceo', 'Punta Carretas',
  ],
};
