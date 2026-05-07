import type { Channel } from '../types';
import { CHANNEL_CONFIGS } from '../types';

interface Props {
  channel: Channel;
  size?: 'sm' | 'md';
}

export default function ChannelTag({ channel, size = 'sm' }: Props) {
  const config = CHANNEL_CONFIGS.find(c => c.id === channel);
  if (!config) return null;

  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-medium bg-surface-100 text-gray-600 border border-surface-200 ${
      size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
    }`}>
      <span>{config.icon}</span>
      <span>{config.label}</span>
    </span>
  );
}
