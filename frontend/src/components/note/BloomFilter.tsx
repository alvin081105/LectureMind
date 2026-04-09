import { BLOOM_COLORS, BLOOM_LEVELS } from '../../constants/bloomColors';
import type { BloomLevel } from '../../types';

interface BloomFilterProps {
  selected: BloomLevel[];
  onChange: (levels: BloomLevel[]) => void;
}

export default function BloomFilter({ selected, onChange }: BloomFilterProps) {
  const toggle = (level: BloomLevel) => {
    if (selected.includes(level)) onChange(selected.filter((l) => l !== level));
    else onChange([...selected, level]);
  };

  return (
    <div className="flex flex-wrap gap-2">
      {BLOOM_LEVELS.map((level) => {
        const color = BLOOM_COLORS[level];
        const active = selected.includes(level);
        return (
          <button
            key={level}
            onClick={() => toggle(level)}
            className={`px-3 py-1 rounded-full text-xs font-medium border transition-all ${
              active ? 'opacity-100' : 'opacity-40'
            }`}
            style={{
              backgroundColor: active ? color.bg : '#f9fafb',
              color: active ? color.text : '#6b7280',
              borderColor: active ? color.border : '#e5e7eb',
            }}
          >
            {color.label}
          </button>
        );
      })}
    </div>
  );
}
