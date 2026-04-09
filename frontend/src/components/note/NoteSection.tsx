import { useState } from 'react';
import BloomBadge from '../common/BloomBadge';
import type { NoteSection as NoteSectionType } from '../../types';
import { BLOOM_COLORS } from '../../constants/bloomColors';

interface NoteSectionProps {
  section: NoteSectionType;
  depth?: number;
  highlightKeyword?: string;
}

export default function NoteSection({ section, depth = 0, highlightKeyword }: NoteSectionProps) {
  const [collapsed, setCollapsed] = useState(false);
  const color = BLOOM_COLORS[section.bloomLevel];
  const hasChildren = section.children && section.children.length > 0;

  const highlight = (text: string) => {
    if (!highlightKeyword) return text;
    const parts = text.split(new RegExp(`(${highlightKeyword})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === highlightKeyword.toLowerCase()
        ? <mark key={i} className="bg-yellow-200 rounded">{part}</mark>
        : part
    );
  };

  return (
    <div
      className="rounded-lg border"
      style={{
        marginLeft: `${depth * 16}px`,
        borderColor: color.border,
        backgroundColor: color.bg,
      }}
    >
      <div className="p-3">
        <div className="flex items-start gap-2">
          {hasChildren && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="mt-0.5 text-gray-400 hover:text-gray-600 shrink-0"
            >
              {collapsed ? '▶' : '▼'}
            </button>
          )}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <BloomBadge level={section.bloomLevel} size="sm" />
              <h4 className="text-sm font-semibold" style={{ color: color.text }}>
                {highlight(section.title)}
              </h4>
            </div>
            {!collapsed && (
              <p className="text-sm text-gray-700 leading-relaxed">
                {highlight(section.content)}
              </p>
            )}
          </div>
        </div>
      </div>

      {!collapsed && hasChildren && (
        <div className="px-3 pb-3 space-y-2">
          {section.children!.map((child) => (
            <NoteSection
              key={child.id}
              section={child}
              depth={depth + 1}
              highlightKeyword={highlightKeyword}
            />
          ))}
        </div>
      )}
    </div>
  );
}
