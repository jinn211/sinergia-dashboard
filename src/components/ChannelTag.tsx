import type { Channel } from '../types';
import { CHANNEL_CONFIGS } from '../types';

export default function ChannelTag({ channel, size = 'sm' }: { channel: Channel; size?: 'sm' | 'md' }) {
  const config = CHANNEL_CONFIGS.find(c => c.id === channel);
  if (!config) return null;
  return (
    <span className={`inline-flex items-center font-mono text-warm-500 border border-warm-200 bg-white rounded-sm ${
      size === 'sm' ? 'text-[10px] px-2 py-0.5' : 'text-[11px] px-2.5 py-1'
    }`}>
      {config.label}
    </span>
  );
}
