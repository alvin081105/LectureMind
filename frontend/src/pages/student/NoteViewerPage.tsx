import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import NoteTree from '../../components/note/NoteTree';
import ChatPanel from '../../components/chat/ChatPanel';
import LoadingSpinner from '../../components/common/LoadingSpinner';
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

  // 초기 로드: lectureId로 노트 검색
  useEffect(() => {
    if (!lectureId) return;
    noteApi.findByLectureId(Number(lectureId))
      .then((n) => setNote(n))
      .catch(() => setNote(null))
      .finally(() => setLoading(false));
  }, [lectureId]);

  // 노트 생성 후 상태 폴링 (백엔드가 비동기 생성)
  usePolling(async () => {
    if (!generatingNoteId) return true;
    try {
      const res = await noteApi.getById(generatingNoteId);
      setNote(res.data);
      setGenerating(false);
      setGeneratingNoteId(null);
      return true; // stop
    } catch {
      return false; // continue polling
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

  if (loading) {
    return <div className="flex justify-center py-24"><LoadingSpinner message="노트를 불러오는 중..." /></div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-800">← 뒤로</button>
          <h2 className="text-xl font-bold text-gray-800">구조화 노트</h2>
        </div>
        {note && !generating && (
          <div className="flex gap-2 flex-wrap">
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

      {generating ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center">
          <LoadingSpinner message="AI가 구조화 노트를 생성하고 있습니다..." />
        </div>
      ) : !note ? (
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
      ) : (
        <div className={chatOpen ? 'grid grid-cols-1 lg:grid-cols-5 gap-4' : ''}>
          <div className={chatOpen ? 'lg:col-span-3' : ''}>
            <NoteTree note={note} />
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
