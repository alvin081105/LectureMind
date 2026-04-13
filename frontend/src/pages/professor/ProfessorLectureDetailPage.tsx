import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AILoader from '../../components/common/AILoader';
import { lectureApi } from '../../api/lectureApi';
import { noteApi } from '../../api/noteApi';
import { analysisApi } from '../../api/analysisApi';
import { usePolling } from '../../hooks/usePolling';
import { formatDateTime } from '../../utils/formatDate';
import type { LectureDetailResponse, NoteGenerateResponse } from '../../types';

export default function ProfessorLectureDetailPage() {
  const { lectureId } = useParams<{ lectureId: string }>();
  const navigate = useNavigate();
  const [lecture, setLecture] = useState<LectureDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);

  const [noteGenerating, setNoteGenerating] = useState(false);
  const [generatingNoteId, setGeneratingNoteId] = useState<number | null>(null);
  const [noteReady, setNoteReady] = useState(false);

  const [analyzing, setAnalyzing] = useState(false);
  const [showFullTranscript, setShowFullTranscript] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!lectureId) return;
    lectureApi.getDetail(Number(lectureId))
      .then((res) => {
        setLecture(res.data);
        setNoteReady(res.data.hasNote);
      })
      .catch(() => navigate(-1))
      .finally(() => setLoading(false));
  }, [lectureId, navigate]);

  // 노트 생성 폴링
  usePolling(async () => {
    if (!generatingNoteId) return true;
    try {
      await noteApi.getById(generatingNoteId);
      setNoteGenerating(false);
      setGeneratingNoteId(null);
      setNoteReady(true);
      return true;
    } catch {
      return false;
    }
  }, { enabled: !!generatingNoteId, interval: 2000 });

  const handleGenerateNote = async () => {
    if (!lectureId) return;
    setNoteGenerating(true);
    try {
      const res = await noteApi.generate(Number(lectureId));
      setGeneratingNoteId((res.data as NoteGenerateResponse).noteId);
    } catch (e: any) {
      const msg = e?.response?.data?.message ?? '노트 생성에 실패했습니다.';
      alert(msg);
      setNoteGenerating(false);
    }
  };

  const handleAnalyze = async () => {
    if (!lectureId) return;
    setAnalyzing(true);
    try {
      await analysisApi.generate(Number(lectureId));
      navigate(`/professor/analysis/${lectureId}`);
    } catch {
      alert('분석 요청에 실패했습니다.');
      setAnalyzing(false);
    }
  };

  const handleCopyTranscript = async () => {
    if (!lecture?.transcript) return;
    await navigator.clipboard.writeText(lecture.transcript);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return <div className="flex justify-center py-24"><LoadingSpinner message="강의 정보를 불러오는 중..." /></div>;
  }

  if (!lecture) return null;

  const transcriptPreview = lecture.transcript
    ? lecture.transcript.slice(0, 300) + (lecture.transcript.length > 300 ? '...' : '')
    : null;

  return (
    <div className="space-y-5 max-w-3xl mx-auto">
      {/* 헤더 */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-800">← 뒤로</button>
        <h2 className="text-xl font-bold text-gray-800 truncate">{lecture.title}</h2>
      </div>

      {/* 강의 정보 카드 */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4">
        <div className="flex flex-wrap gap-4 text-sm text-gray-500">
          {lecture.duration && (
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {lecture.duration}
            </span>
          )}
          {lecture.fileSize && (
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0121 9.586V19a2 2 0 01-2 2z" />
              </svg>
              {lecture.fileSize}
            </span>
          )}
          <span className="flex items-center gap-1.5">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            {formatDateTime(lecture.createdAt)}
          </span>
        </div>

        {/* 액션 버튼 */}
        <div className="flex flex-wrap gap-2 pt-1">
          {/* 노트 */}
          {noteReady ? (
            <Link
              to={`/professor/notes/${lectureId}`}
              className="px-4 py-2 text-sm font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
            >
              📝 노트 보기
            </Link>
          ) : (
            <button
              onClick={handleGenerateNote}
              disabled={noteGenerating}
              className="px-4 py-2 text-sm font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 disabled:opacity-50 transition-colors"
            >
              {noteGenerating ? '노트 생성 중...' : '📝 AI 노트 생성'}
            </button>
          )}

          {/* 분석 */}
          {lecture.hasAnalysis ? (
            <Link
              to={`/professor/analysis/${lectureId}`}
              className="px-4 py-2 text-sm font-medium text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50 transition-colors"
            >
              🔍 분석 보기
            </Link>
          ) : (
            <button
              onClick={handleAnalyze}
              disabled={analyzing || lecture.status !== 'COMPLETED'}
              className="px-4 py-2 text-sm font-medium text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50 disabled:opacity-50 transition-colors"
            >
              {analyzing ? '분석 요청 중...' : '🔍 AI 분석 시작'}
            </button>
          )}

          {lecture.hasAnalysis && (
            <button
              onClick={handleAnalyze}
              disabled={analyzing}
              className="px-4 py-2 text-sm font-medium text-gray-500 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
            >
              {analyzing ? '요청 중...' : '↺ 재분석'}
            </button>
          )}
        </div>

        {noteGenerating && (
          <div className="mt-2">
            <AILoader title="AI 노트 생성 중" messages={[
              'STT 텍스트를 분석하고 있습니다...',
              '블룸 분류 체계로 구조화 중...',
              '핵심 키워드를 추출하고 있습니다...',
            ]} />
          </div>
        )}
      </div>

      {/* 트랜스크립트 */}
      {lecture.transcript ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-semibold text-gray-700">STT 트랜스크립트</h3>
            <div className="flex gap-2">
              <button
                onClick={handleCopyTranscript}
                className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
              >
                {copied ? '✓ 복사됨' : '복사'}
              </button>
              <button
                onClick={() => setShowFullTranscript((v) => !v)}
                className="px-3 py-1.5 text-xs border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-colors"
              >
                {showFullTranscript ? '접기' : '전체 보기'}
              </button>
            </div>
          </div>

          <div className={`bg-gray-50 rounded-xl p-4 text-sm text-gray-700 leading-relaxed font-mono overflow-auto transition-all ${showFullTranscript ? 'max-h-[600px]' : 'max-h-48'}`}>
            {showFullTranscript ? lecture.transcript : transcriptPreview}
          </div>

          <p className="text-xs text-gray-400">
            총 {lecture.transcript.length.toLocaleString()}자
          </p>
        </div>
      ) : (
        lecture.status !== 'COMPLETED' && (
          <div className="bg-gray-50 border border-gray-200 rounded-2xl p-8 text-center text-gray-400 text-sm">
            STT 처리가 완료되면 트랜스크립트가 표시됩니다.
          </div>
        )
      )}
    </div>
  );
}
