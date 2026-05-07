import type { Process } from './types';

const PLACEHOLDER = (w: number, h: number, label: string) =>
  `https://placehold.co/${w}x${h}/7c3aed/ffffff?text=${encodeURIComponent(label)}`;

export const MOCK_PROCESSES: Process[] = [
  {
    id: 'proc-001',
    name: 'Workshop de Innovación Corporativa',
    channels: ['instagram-post', 'instagram-story', 'linkedin', 'email', 'poster-a4'],
    status: 'waiting',
    progress: 100,
    createdAt: '2026-05-06T14:30:00Z',
    updatedAt: '2026-05-06T15:45:00Z',
    contextualAnswers: {
      activityType: 'workshop',
      audience: ['empresas', 'startups'],
      tone: 'profesional',
      eventDate: '2026-05-20',
      eventTime: '18:00',
      sede: 'World Trade Center',
    },
    additionalContext: 'El foco es en metodologías ágiles y Design Thinking. Habrá tres speakers internacionales.',
    baseImageUrl: PLACEHOLDER(500, 500, 'Flyer+Base'),
    images: [
      { id: 'img-001-1', channel: 'instagram-post',  label: 'Instagram Post',     dimensions: '1080×1080px', status: 'waiting-review', imageUrl: PLACEHOLDER(500, 500, 'IG+Post') },
      { id: 'img-001-2', channel: 'instagram-story', label: 'Instagram Historia', dimensions: '1080×1920px', status: 'approved',       imageUrl: PLACEHOLDER(300, 533, 'IG+Story') },
      { id: 'img-001-3', channel: 'linkedin',        label: 'LinkedIn',           dimensions: '1200×627px',  status: 'waiting-review', imageUrl: PLACEHOLDER(500, 260, 'LinkedIn') },
      { id: 'img-001-4', channel: 'email',           label: 'Mail / Newsletter',  dimensions: '600px',       status: 'approved',       imageUrl: PLACEHOLDER(500, 300, 'Newsletter') },
      { id: 'img-001-5', channel: 'poster-a4',       label: 'Cartel A4',          dimensions: 'A4',          status: 'waiting-review', imageUrl: PLACEHOLDER(354, 500, 'Cartel+A4') },
    ],
    copies: [
      {
        id: 'copy-001-1', type: 'internal-invite', label: 'Invitación interna',
        status: 'approved',
        content: `Hola equipo,\n\nQuería contarles que el próximo martes 20 de mayo estaremos organizando el Workshop de Innovación Corporativa en nuestra sede del WTC.\n\nTenemos tres speakers internacionales que van a compartir sus experiencias en Design Thinking y metodologías ágiles aplicadas al entorno corporativo.\n\nEl evento es de 18:00 a 21:00hs. Los cupos son limitados, así que les pedimos confirmar asistencia antes del viernes.\n\n¡Los esperamos!`
      },
      {
        id: 'copy-001-2', type: 'newsletter', label: 'Newsletter comunidad',
        status: 'waiting-review',
        content: `Comunidad Sinergia,\n\nEste mes arrancamos con todo: Workshop de Innovación Corporativa el martes 20 de mayo en WTC.\n\nTres speakers internacionales, metodologías ágiles y Design Thinking aplicado al mundo real. Una noche para conectar con líderes que están transformando la forma en que trabajan las empresas.\n\nCupos limitados — registrate hoy.\n\n📅 Martes 20 de mayo, 18:00hs\n📍 WTC, Torre 3, Piso 6\n🎟️ Entrada libre para miembros Sinergia`
      },
      {
        id: 'copy-001-3', type: 'social', label: 'Redes sociales',
        status: 'waiting-review',
        content: `¿Listo para transformar la forma en que innova tu empresa?\n\nEste 20/5 en Sinergia WTC: Workshop de Innovación Corporativa con speakers internacionales de primer nivel.\n\nDesign Thinking + Agile + Networking = una noche que no te podés perder.\n\n🗓️ 20 de mayo | 18:00hs | WTC\n✅ Entrada libre para miembros\n\n→ Link en bio para registrarte\n\n#Sinergia #Innovación #Workshop #Coworking`
      },
      {
        id: 'copy-001-4', type: 'after-movie', label: 'After-movie (post-evento)',
        status: 'generating',
        content: ''
      },
    ],
  },
  {
    id: 'proc-002',
    name: 'After Work Rooftop — Founders Edition',
    channels: ['instagram-post', 'instagram-story', 'linkedin', 'app-card'],
    status: 'processing',
    progress: 55,
    createdAt: '2026-05-07T09:15:00Z',
    updatedAt: '2026-05-07T09:50:00Z',
    contextualAnswers: {
      activityType: 'after-work',
      audience: ['startups', 'todos'],
      tone: 'cercano',
      eventDate: '2026-05-15',
      sede: 'Pocitos',
    },
    baseImageUrl: PLACEHOLDER(500, 500, 'Flyer+Base'),
    images: [
      { id: 'img-002-1', channel: 'instagram-post',  label: 'Instagram Post',     dimensions: '1080×1080px', status: 'generating',     imageUrl: PLACEHOLDER(500, 500, 'IG+Post') },
      { id: 'img-002-2', channel: 'instagram-story', label: 'Instagram Historia', dimensions: '1080×1920px', status: 'generating',     imageUrl: PLACEHOLDER(300, 533, 'IG+Story') },
      { id: 'img-002-3', channel: 'linkedin',        label: 'LinkedIn',           dimensions: '1200×627px',  status: 'generating',     imageUrl: PLACEHOLDER(500, 260, 'LinkedIn') },
      { id: 'img-002-4', channel: 'app-card',        label: 'App Sinergia',       dimensions: '796×505px',   status: 'generating',     imageUrl: PLACEHOLDER(500, 316, 'App+Card') },
    ],
    copies: [
      { id: 'copy-002-1', type: 'internal-invite', label: 'Invitación interna',   status: 'generating', content: '' },
      { id: 'copy-002-2', type: 'newsletter',      label: 'Newsletter comunidad', status: 'generating', content: '' },
      { id: 'copy-002-3', type: 'social',          label: 'Redes sociales',       status: 'generating', content: '' },
      { id: 'copy-002-4', type: 'after-movie',     label: 'After-movie',          status: 'generating', content: '' },
    ],
  },
  {
    id: 'proc-003',
    name: 'Apertura Nueva Sede Punta Carretas',
    channels: ['instagram-post', 'instagram-story', 'linkedin', 'email', 'screens', 'poster-a4', 'poster-a5'],
    status: 'completed',
    progress: 100,
    createdAt: '2026-05-02T10:00:00Z',
    updatedAt: '2026-05-04T16:20:00Z',
    contextualAnswers: {
      activityType: 'apertura',
      audience: ['comunidad', 'empresas', 'todos'],
      tone: 'inspirador',
      eventDate: '2026-05-10',
      sede: 'Punta Carretas',
    },
    baseImageUrl: PLACEHOLDER(500, 500, 'Flyer+Base'),
    images: [
      { id: 'img-003-1', channel: 'instagram-post',  label: 'Instagram Post',     dimensions: '1080×1080px', status: 'approved', imageUrl: PLACEHOLDER(500, 500, 'IG+Post') },
      { id: 'img-003-2', channel: 'instagram-story', label: 'Instagram Historia', dimensions: '1080×1920px', status: 'approved', imageUrl: PLACEHOLDER(300, 533, 'IG+Story') },
      { id: 'img-003-3', channel: 'linkedin',        label: 'LinkedIn',           dimensions: '1200×627px',  status: 'approved', imageUrl: PLACEHOLDER(500, 260, 'LinkedIn') },
      { id: 'img-003-4', channel: 'email',           label: 'Mail / Newsletter',  dimensions: '600px',       status: 'approved', imageUrl: PLACEHOLDER(500, 300, 'Newsletter') },
      { id: 'img-003-5', channel: 'screens',         label: 'Pantallas Físicas',  dimensions: '1920×1080px', status: 'approved', imageUrl: PLACEHOLDER(500, 280, 'Pantallas') },
      { id: 'img-003-6', channel: 'poster-a4',       label: 'Cartel A4',          dimensions: 'A4',          status: 'approved', imageUrl: PLACEHOLDER(354, 500, 'A4') },
      { id: 'img-003-7', channel: 'poster-a5',       label: 'Cartel A5',          dimensions: 'A5',          status: 'approved', imageUrl: PLACEHOLDER(354, 500, 'A5') },
    ],
    copies: [
      { id: 'copy-003-1', type: 'internal-invite', label: 'Invitación interna',   status: 'approved', content: 'Copy de apertura aprobado.' },
      { id: 'copy-003-2', type: 'newsletter',      label: 'Newsletter comunidad', status: 'approved', content: 'Newsletter de apertura aprobado.' },
      { id: 'copy-003-3', type: 'social',          label: 'Redes sociales',       status: 'approved', content: 'Copy social aprobado.' },
      { id: 'copy-003-4', type: 'after-movie',     label: 'After-movie',          status: 'approved', content: 'Copy after-movie aprobado.' },
    ],
  },
  {
    id: 'proc-004',
    name: 'Charla: Financiamiento para Startups',
    channels: ['instagram-post', 'linkedin', 'email'],
    status: 'error',
    progress: 30,
    createdAt: '2026-05-05T11:00:00Z',
    updatedAt: '2026-05-05T11:35:00Z',
    contextualAnswers: {
      activityType: 'charla',
      audience: ['startups'],
      tone: 'informativo',
    },
    baseImageUrl: PLACEHOLDER(500, 500, 'Flyer+Base'),
    images: [
      { id: 'img-004-1', channel: 'instagram-post', label: 'Instagram Post', dimensions: '1080×1080px', status: 'rejected', imageUrl: PLACEHOLDER(500, 500, 'Error') },
      { id: 'img-004-2', channel: 'linkedin',       label: 'LinkedIn',       dimensions: '1200×627px',  status: 'generating', imageUrl: '' },
      { id: 'img-004-3', channel: 'email',          label: 'Newsletter',     dimensions: '600px',       status: 'generating', imageUrl: '' },
    ],
    copies: [
      { id: 'copy-004-1', type: 'internal-invite', label: 'Invitación interna',   status: 'generating', content: '' },
      { id: 'copy-004-2', type: 'newsletter',      label: 'Newsletter comunidad', status: 'generating', content: '' },
      { id: 'copy-004-3', type: 'social',          label: 'Redes sociales',       status: 'generating', content: '' },
      { id: 'copy-004-4', type: 'after-movie',     label: 'After-movie',          status: 'generating', content: '' },
    ],
  },
];
