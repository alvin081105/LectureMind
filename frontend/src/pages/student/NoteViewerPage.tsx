import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import NoteTree from '../../components/note/NoteTree';
import ChatPanel from '../../components/chat/ChatPanel';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AILoader from '../../components/common/AILoader';
import { noteApi } from '../../api/noteApi';
import { chatApi } from '../../api/chatApi';
import { usePolling } from '../../hooks/usePolling';
import type { ChatSession, Note } from '../../types';

export default function NoteViewerPage() {
  const { lectureId } = useParams<{ lectureId: string }>();
  const navigate = useNavigate();
  const [note, setNote] = useState<Note | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [generatingNoteId, setGeneratingNoteId] = useState<number | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [chatSession, setChatSession] = useState<ChatSession | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!lectureId) return;
    noteApi.findByLectureId(Number(lectureId))
      .then((n) => setNote(n))
      .catch(() => setNote(null))
      .finally(() => setLoading(false));
  }, [lectureId]);

  usePolling(async () => {
    if (!generatingNoteId) return true;
    try {
      const res = await noteApi.getById(generatingNoteId);
      setNote(res.data);
      setGenerating(false);
      setGeneratingNoteId(null);
      return true;
    } catch {
      return false;
    }
  }, { enabled: !!generatingNoteId, interval: 2000 });

  const handleGenerate = async () => {
    if (!lectureId) return;
    setGenerating(true);
    try {
      const res = await noteApi.generate(Number(lectureId));
      setGeneratingNoteId(res.data.noteId);
    } catch {
      alert('노트 생성 요청에 실패했습니다.');
      setGenerating(false);
    }
  };

  const handleOpenChat = async () => {
    if (!note) return;
    if (!chatSession) {
      try {
        const res = await chatApi.createSession(note.noteId);
        setChatSession(res.data);
      } catch {
        alert('채팅 세션 생성에 실패했습니다.');
        return;
      }
    }
    setChatOpen(true);
  };

  const handleCopyMarkdown = async () => {
    if (!note) return;
    try {
      const blob = await noteApi.exportMarkdown(note.noteId);
      const text = await (blob.data as Blob).text();
      await navigator.clipboard.writeText(text);
      alert('마크다운이 클립보드에 복사되었습니다.');
    } catch {
      alert('내보내기에 실패했습니다.');
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchQuery(searchInput.trim());
  };

  const handleClearSearch = () => {
    setSearchInput('');
    setSearchQuery('');
    searchRef.current?.focus();
  };

  if (loading) {
    return <div className="flex justify-center py-24"><LoadingSpinner message="노트를 불러오는 중..." /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-800">← 뒤로</button>
          <h2 className="text-xl font-bold text-gray-800">구조화 노트</h2>
          {note && (
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">
              {note.sections?.length ?? 0}개 섹션
            </span>
          )}
        </div>
        {note && !generating && (
          <div className="flex gap-2 flex-wrap items-center">
            {/* 검색창 */}
            <form onSubmit={handleSearch} className="relative flex items-center">
              <svg className="absolute left-2.5 w-3.5 h-3.5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
              </svg>
              <input
                ref={searchRef}
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="노트 내 검색..."
                className="pl-7 pr-7 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 w-44"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-2 text-gray-300 hover:text-gray-500"
                >
                  ✕
                </button>
              )}
            </form>
            <button onClick={handleCopyMarkdown} className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 text-gray-600">
              마크다운 복사
            </button>
            <button onClick={handleOpenChat} className="px-3 py-1.5 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700">
              AI 튜터
            </button>
            <button
              onClick={() => navigate(`/student/quiz/${lectureId}`)}
              className="px-3 py-1.5 text-sm bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              퀴즈 시작
            </button>
          </div>
        )}
      </div>

      {/* 검색 결과 안내 */}
      {searchQuery && (
        <div className="flex items-center gap-2 text-sm text-indigo-600 bg-indigo-50 border border-indigo-100 rounded-lg px-3 py-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
          </svg>
          <span>
            <span className="font-semibold">"{searchQuery}"</span> 검색 중
          </span>
          <button onClick={handleClearSearch} className="ml-auto text-xs text-indigo-400 hover:text-indigo-600">
            지우기
          </button>
        </div>
      )}

      {generating && (
        <AILoader title="AI 노트 생성 중" messages={[
          'AI가 강의 내용을 분석하고 있습니다...',
          'STT 텍스트에서 핵심 개념을 추출 중...',
          '블룸 분류 체계에 맞게 구조화하는 중...',
          '학습 단계별로 섹션을 정리하고 있습니다...',
          '거의 완료되었습니다...',
        ]} />
      )}

      {!generating && !note ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center space-y-4">
          <p className="text-4xl">📝</p>
          <p className="text-gray-600 text-sm">아직 구조화 노트가 없습니다.</p>
          <button
            onClick={handleGenerate}
            className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700"
          >
            AI 노트 생성
          </button>
        </div>
      ) : !generating && (
        <div className={chatOpen ? 'grid grid-cols-1 lg:grid-cols-5 gap-4' : ''}>
          <div className={chatOpen ? 'lg:col-span-3' : ''}>
            <NoteTree note={note!} highlightKeyword={searchQuery} />
          </div>
          {chatOpen && chatSession && (
            <div className="lg:col-span-2 h-[600px]">
              <ChatPanel session={chatSession} onClose={() => setChatOpen(false)} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
