import { useState } from 'react';
import BloomBadge from '../common/BloomBadge';
import type { NoteSection as NoteSectionType } from '../../types';
import { BLOOM_COLORS } from '../../constants/bloomColors';

interface NoteSectionProps {
  section: NoteSectionType;
  depth?: number;
  highlightKeyword?: string;
}

function highlight(text: string, keyword: string): React.ReactNode {
  if (!keyword) return text;
  const parts = text.split(new RegExp(`(${keyword})`, 'gi'));
  return parts.map((part, i) =>
    part.toLowerCase() === keyword.toLowerCase()
      ? <mark key={i} className="bg-yellow-200 text-yellow-900 rounded px-0.5">{part}</mark>
      : part
  );
}

export default function NoteSection({ section, depth = 0, highlightKeyword = '' }: NoteSectionProps) {
  const [collapsed, setCollapsed] = useState(false);
  const color = BLOOM_COLORS[section.bloomLevel];
  const hasChildren = section.children && section.children.length > 0;

  return (
    <div
      className={`relative ${depth > 0 ? 'ml-4' : ''}`}
    >
      {/* 좌측 컬러 바 */}
      <div
        className="absolute left-0 top-0 bottom-0 w-0.5 rounded-full"
        style={{ backgroundColor: color.border }}
      />

      <div className="pl-4">
        {/* 섹션 헤더 */}
        <div className="flex items-start gap-2 mb-1">
          {hasChildren && (
            <button
              onClick={() => setCollapsed(!collapsed)}
              className="mt-0.5 shrink-0 w-4 h-4 flex items-center justify-center text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg
                className={`w-3 h-3 transition-transform ${collapsed ? '-rotate-90' : ''}`}
                fill="currentColor" viewBox="0 0 20 20"
              >
                <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
              </svg>
            </button>
          )}
          <div className={`flex items-center gap-2 flex-wrap ${!hasChildren ? 'ml-0' : ''}`}>
            <BloomBadge level={section.bloomLevel} size="sm" />
            <h4
              className={`font-semibold leading-snug ${depth === 0 ? 'text-sm' : 'text-xs'}`}
              style={{ color: color.text }}
            >
              {highlight(section.title, highlightKeyword)}
            </h4>
          </div>
        </div>

        {/* 내용 */}
        {!collapsed && section.content && (
          <p className="text-sm text-gray-600 leading-relaxed mb-3 ml-6">
            {highlight(section.content, highlightKeyword)}
          </p>
        )}

        {/* 자식 섹션 */}
        {!collapsed && hasChildren && (
          <div className="space-y-3 mb-3">
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
    </div>
  );
}
