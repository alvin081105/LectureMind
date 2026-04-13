import { useState } from 'react';
import BloomFilter from './BloomFilter';
import KeywordPanel from './KeywordPanel';
import NoteSection from './NoteSection';
import { BLOOM_LEVELS } from '../../constants/bloomColors';
import type { BloomLevel, Note } from '../../types';

interface NoteTreeProps {
  note: Note;
  highlightKeyword?: string;
}

export default function NoteTree({ note, highlightKeyword = '' }: NoteTreeProps) {
  const [selectedLevels, setSelectedLevels] = useState<BloomLevel[]>([...BLOOM_LEVELS]);
  const [selectedKeyword, setSelectedKeyword] = useState('');

  const sections = Array.isArray(note.sections) ? note.sections : [];
  const keywords = Array.isArray(note.keywords) ? note.keywords : [];

  const filtered = sections.filter((s) => selectedLevels.includes(s.bloomLevel));
  const activeHighlight = highlightKeyword || selectedKeyword;

  return (
    <div className="flex flex-col lg:flex-row gap-4">
      {/* 메인: 노트 섹션 */}
      <div className="flex-1 min-w-0">
        {/* 노트 제목 */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-4">
          <h2 className="text-base font-bold text-gray-800">{note.title}</h2>
          <p className="text-xs text-gray-400 mt-1">{sections.length}개 섹션 · 키워드 {keywords.length}개</p>
        </div>

        {/* 섹션 목록 */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          {filtered.length === 0 ? (
            <p className="text-center text-gray-400 py-10 text-sm">선택된 레벨에 해당하는 섹션이 없습니다.</p>
          ) : (
            <div className="space-y-5 divide-y divide-gray-100">
              {filtered.map((section, idx) => (
                <div key={section.id} className={idx > 0 ? 'pt-5' : ''}>
                  <NoteSection
                    section={section}
                    highlightKeyword={activeHighlight}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 사이드바: 필터 + 키워드 */}
      <div className="lg:w-52 shrink-0 space-y-3">
        {/* 블룸 레벨 필터 */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4">
          <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">블룸 레벨</h3>
          <BloomFilter selected={selectedLevels} onChange={setSelectedLevels} />
        </div>

        {/* 키워드 */}
        {keywords.length > 0 && (
          <div className="bg-white border border-gray-200 rounded-2xl p-4">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-3">핵심 키워드</h3>
            <KeywordPanel
              keywords={keywords}
              selected={selectedKeyword}
              onSelect={setSelectedKeyword}
            />
          </div>
        )}
      </div>
    </div>
  );
}
