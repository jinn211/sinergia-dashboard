import type { Channel } from '../types';
import { CHANNEL_CONFIGS } from '../types';

export default function ChannelTag({ channel, size = 'sm' }: { channel: Channel; size?: 'sm' | 'md' }) {
  const config = CHANNEL_CONFIGS.find(c => c.id === channel);
  if (!config) return null;
  return (
    <span className={`inline-flex items-center gap-1 font-medium bg-white border border-warm-300 text-warm-600 rounded-lg ${
      size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-1 text-[11px]'
    }`}>
      <span className="text-brand-400">{config.icon}</span>
      {config.label}
    </span>
  );
}
