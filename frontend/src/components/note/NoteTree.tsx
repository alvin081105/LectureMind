import { useState } from 'react';
import BloomFilter from './BloomFilter';
import KeywordPanel from './KeywordPanel';
import NoteSection from './NoteSection';
import { BLOOM_LEVELS } from '../../constants/bloomColors';
import type { BloomLevel, Note } from '../../types';

interface NoteTreeProps {
  note: Note;
}

export default function NoteTree({ note }: NoteTreeProps) {
  const [selectedLevels, setSelectedLevels] = useState<BloomLevel[]>([...BLOOM_LEVELS]);
  const [selectedKeyword, setSelectedKeyword] = useState('');

  // 백엔드 응답: note.sections (content 아님)
  const sections = Array.isArray(note.sections) ? note.sections : [];
  const filtered = sections.filter((s) => selectedLevels.includes(s.bloomLevel));
  const keywords = Array.isArray(note.keywords) ? note.keywords : [];

  return (
    <div className="flex flex-col gap-4 lg:flex-row">
      {/* 좌측: 필터 + 노트 섹션 */}
      <div className="flex-1 min-w-0 space-y-4">
        <div className="bg-white border border-gray-200 rounded-xl p-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">블룸 레벨 필터</h3>
          <BloomFilter selected={selectedLevels} onChange={setSelectedLevels} />
        </div>

        <div className="space-y-3">
          {filtered.length === 0 ? (
            <p className="text-center text-gray-400 py-8 text-sm">선택된 레벨에 해당하는 섹션이 없습니다.</p>
          ) : (
            filtered.map((section) => (
              <NoteSection
                key={section.id}
                section={section}
                highlightKeyword={selectedKeyword}
              />
            ))
          )}
        </div>
      </div>

      {/* 우측: 키워드 패널 */}
      {keywords.length > 0 && (
        <div className="lg:w-56 shrink-0">
          <KeywordPanel
            keywords={keywords}
            selected={selectedKeyword}
            onSelect={setSelectedKeyword}
          />
        </div>
      )}
    </div>
  );
}
