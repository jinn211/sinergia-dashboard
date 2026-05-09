import type { Channel } from '../types';
import { Camera, Briefcase, Mail, Smartphone, Monitor, FileText } from 'lucide-react';

const channelConfig: Record<Channel, { label: string; icon: React.ElementType }> = {
  'instagram-post':  { label: 'IG Post',    icon: Camera },
  'instagram-story': { label: 'IG Historia', icon: Camera },
  'linkedin':        { label: 'LinkedIn',    icon: Briefcase },
  'email':           { label: 'Mail',        icon: Mail },
  'app-card':        { label: 'App',         icon: Smartphone },
  'screens':         { label: 'Pantallas',   icon: Monitor },
  'poster-a4':       { label: 'Cartel A4',   icon: FileText },
  'poster-a5':       { label: 'Cartel A5',   icon: FileText },
};

export default function ChannelTag({ channel, size = 'sm' }: { channel: Channel; size?: 'sm' | 'md' }) {
  const config = channelConfig[channel];
  if (!config) return null;
  const Icon = config.icon;
  return (
    <span className={`inline-flex items-center gap-1.5 font-medium bg-white border border-warm-400 text-warm-600 rounded-lg shadow-sm hover:shadow hover:border-warm-500 transition-all duration-150 ${
      size === 'sm' ? 'px-2 py-0.5 text-[11px]' : 'px-2.5 py-1 text-[12px]'
    }`}>
      <Icon size={size === 'sm' ? 11 : 12} strokeWidth={1.75} className="text-warm-500 flex-shrink-0" />
      {config.label}
    </span>
  );
}
