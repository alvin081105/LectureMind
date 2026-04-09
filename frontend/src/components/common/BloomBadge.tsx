import { BLOOM_COLORS } from '../../constants/bloomColors';
import type { BloomLevel } from '../../types';

interface BloomBadgeProps {
  level: BloomLevel;
  size?: 'sm' | 'md';
}

export default function BloomBadge({ level, size = 'md' }: BloomBadgeProps) {
  const color = BLOOM_COLORS[level];
  const padding = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm';

  return (
    <span
      className={`inline-flex items-center font-medium rounded-full ${padding}`}
      style={{ backgroundColor: color.bg, color: color.text, border: `1px solid ${color.border}` }}
    >
      {color.label}
    </span>
  );
}
