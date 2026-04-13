import { BLOOM_COLORS, BLOOM_LEVELS } from '../../constants/bloomColors';
import type { BloomLevel } from '../../types';

interface BloomFilterProps {
  selected: BloomLevel[];
  onChange: (levels: BloomLevel[]) => void;
  layout?: 'row' | 'column'; // 기본 column (사이드바용), row (퀴즈 설정용)
}

export default function BloomFilter({ selected, onChange, layout = 'column' }: BloomFilterProps) {
  const toggle = (level: BloomLevel) => {
    if (selected.includes(level)) onChange(selected.filter((l) => l !== level));
    else onChange([...selected, level]);
  };

  if (layout === 'row') {
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

  return (
    <div className="space-y-1.5">
      {BLOOM_LEVELS.map((level) => {
        const color = BLOOM_COLORS[level];
        const active = selected.includes(level);
        return (
          <button
            key={level}
            onClick={() => toggle(level)}
            className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              active ? 'opacity-100' : 'opacity-35'
            }`}
            style={{
              backgroundColor: active ? color.bg : '#f9fafb',
              color: active ? color.text : '#6b7280',
              borderColor: active ? color.border : '#e5e7eb',
            }}
          >
            <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color.text }} />
            {color.label}
          </button>
        );
      })}
    </div>
  );
}
