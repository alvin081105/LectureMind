import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import FileUploader from '../../components/common/FileUploader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { lectureApi } from '../../api/lectureApi';
import { analysisApi } from '../../api/analysisApi';
import { usePolling } from '../../hooks/usePolling';
import { formatDateTime } from '../../utils/formatDate';
import type { Lecture, LectureStatus } from '../../types';

const STATUS_LABELS: Record<string, string> = {
  UPLOADING: '업로드 중',
  PROCESSING: 'STT 처리 중',
  COMPLETED: '완료',
  FAILED: '실패',
};

const STATUS_COLORS: Record<string, string> = {
  UPLOADING: 'text-blue-600 bg-blue-50',
  PROCESSING: 'text-yellow-600 bg-yellow-50',
  COMPLETED: 'text-green-600 bg-green-50',
  FAILED: 'text-red-600 bg-red-50',
};

type FilterStatus = 'ALL' | LectureStatus;

const FILTER_TABS: { value: FilterStatus; label: string }[] = [
  { value: 'ALL', label: '전체' },
  { value: 'COMPLETED', label: '완료' },
  { value: 'PROCESSING', label: '처리 중' },
  { value: 'FAILED', label: '실패' },
];

export default function ProfessorDashboard() {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
  const [analyzingIds, setAnalyzingIds] = useState<Set<number>>(new Set());
  const [deletingIds, setDeletingIds] = useState<Set<number>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<FilterStatus>('ALL');
  const abortRef = useRef<AbortController | null>(null);

  const fetchLectures = async () => {
    try {
      const res = await lectureApi.getList();
      setLectures(res.data.content);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchLectures(); }, []);

  const hasProcessing = lectures.some((l) => l.status === 'UPLOADING' || l.status === 'PROCESSING');
  usePolling(async () => {
    if (!hasProcessing) return true;
    await fetchLectures();
  }, { enabled: hasProcessing, interval: 3000 });

  const handleFileSelect = async (file: File, title: string) => {
    abortRef.current = new AbortController();
    setUploading(true);
    setProgress(0);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('title', title);
    try {
      await lectureApi.upload(formData, setProgress);
      await fetchLectures();
    } catch {
      alert('업로드에 실패했습니다.');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleAnalyze = async (lectureId: number) => {
    setAnalyzingIds((prev) => new Set(prev).add(lectureId));
    try {
      await analysisApi.generate(lectureId);
    } catch {
      alert('분석 요청에 실패했습니다.');
    } finally {
      setAnalyzingIds((prev) => { const s = new Set(prev); s.delete(lectureId); return s; });
    }
  };

  const handleDelete = async (lectureId: number, title: string) => {
    if (!confirm(`"${title}" 강의를 삭제하시겠습니까?\n삭제된 강의는 복구할 수 없습니다.`)) return;
    setDeletingIds((prev) => new Set(prev).add(lectureId));
    try {
      await lectureApi.delete(lectureId);
      setLectures((prev) => prev.filter((l) => l.lectureId !== lectureId));
    } catch {
      alert('삭제에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setDeletingIds((prev) => { const next = new Set(prev); next.delete(lectureId); return next; });
    }
  };

  // 통계
  const stats = {
    total: lectures.length,
    completed: lectures.filter((l) => l.status === 'COMPLETED').length,
    processing: lectures.filter((l) => l.status === 'UPLOADING' || l.status === 'PROCESSING').length,
    failed: lectures.filter((l) => l.status === 'FAILED').length,
  };

  // 필터링
  const filtered = lectures
    .filter((l) => filterStatus === 'ALL' || l.status === filterStatus)
    .filter((l) => l.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">교수 대시보드</h2>

      {/* 통계 카드 */}
      {!loading && lectures.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: '전체 강의', value: stats.total, color: 'text-gray-700', bg: 'bg-gray-50 border-gray-200' },
            { label: '완료', value: stats.completed, color: 'text-green-600', bg: 'bg-green-50 border-green-200' },
            { label: '처리 중', value: stats.processing, color: 'text-yellow-600', bg: 'bg-yellow-50 border-yellow-200' },
            { label: '실패', value: stats.failed, color: 'text-red-500', bg: 'bg-red-50 border-red-200' },
          ].map((s) => (
            <div key={s.label} className={`border rounded-xl p-4 text-center ${s.bg}`}>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
              <p className="text-xs text-gray-500 mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      )}

      {/* 업로드 */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h3 className="text-base font-semibold text-gray-700 mb-4">강의 업로드</h3>
        <FileUploader
          onFileSelect={handleFileSelect}
          uploading={uploading}
          progress={progress}
          onCancel={() => { abortRef.current?.abort(); setUploading(false); }}
        />
      </div>

      {/* 강의 목록 */}
      <div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
          <h3 className="text-base font-semibold text-gray-700">내 강의 목록</h3>
          <div className="relative">
            <svg className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
            </svg>
            <input
              type="text"
              placeholder="강의 제목 검색..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 w-52"
            />
          </div>
        </div>

        {/* 상태 필터 탭 */}
        {!loading && lectures.length > 0 && (
          <div className="flex gap-1 mb-3 flex-wrap">
            {FILTER_TABS.map((tab) => (
              <button
                key={tab.value}
                onClick={() => setFilterStatus(tab.value)}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                  filterStatus === tab.value
                    ? 'bg-indigo-600 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                }`}
              >
                {tab.label}
                {tab.value === 'COMPLETED' && <span className="ml-1 opacity-70">{stats.completed}</span>}
                {tab.value === 'PROCESSING' && <span className="ml-1 opacity-70">{stats.processing}</span>}
                {tab.value === 'FAILED' && <span className="ml-1 opacity-70">{stats.failed}</span>}
              </button>
            ))}
          </div>
        )}

        {loading ? (
          <div className="py-12 flex justify-center"><LoadingSpinner message="강의 목록을 불러오는 중..." /></div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-400">
            <p className="text-4xl mb-3">🎬</p>
            <p className="text-sm">
              {lectures.length === 0 ? '아직 업로드한 강의가 없습니다.' : '검색 결과가 없습니다.'}
            </p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {filtered.map((lecture) => (
              <div key={lecture.lectureId} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <Link
                      to={`/professor/lecture/${lecture.lectureId}`}
                      className="text-sm font-medium text-gray-800 hover:text-indigo-600 truncate block transition-colors"
                    >
                      {lecture.title}
                    </Link>
                    <p className="text-xs text-gray-400 mt-1">{formatDateTime(lecture.createdAt)}</p>
                    {lecture.duration && <p className="text-xs text-gray-400">{lecture.duration}</p>}
                    {lecture.fileSize && <p className="text-xs text-gray-300">{lecture.fileSize}</p>}
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[lecture.status]}`}>
                      {STATUS_LABELS[lecture.status]}
                    </span>
                    <button
                      onClick={() => handleDelete(lecture.lectureId, lecture.title)}
                      disabled={deletingIds.has(lecture.lectureId)}
                      className="p-1 rounded-md text-gray-300 hover:text-red-500 hover:bg-red-50 transition-colors disabled:opacity-40"
                      title="강의 삭제"
                    >
                      {deletingIds.has(lecture.lectureId) ? (
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      )}
                    </button>
                  </div>
                </div>

                {lecture.status === 'COMPLETED' && (
                  <div className="mt-3 flex gap-2">
                    <Link
                      to={`/professor/analysis/${lecture.lectureId}`}
                      className="flex-1 text-center py-1.5 text-xs font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50"
                    >
                      분석 보기
                    </Link>
                    <button
                      onClick={() => handleAnalyze(lecture.lectureId)}
                      disabled={analyzingIds.has(lecture.lectureId)}
                      className="flex-1 py-1.5 text-xs font-medium text-purple-600 border border-purple-200 rounded-lg hover:bg-purple-50 disabled:opacity-50"
                    >
                      {analyzingIds.has(lecture.lectureId) ? '요청 중...' : '재분석'}
                    </button>
                  </div>
                )}
                {lecture.status === 'FAILED' && (
                  <button
                    onClick={fetchLectures}
                    className="mt-3 w-full py-1.5 text-xs text-red-600 border border-red-200 rounded-lg hover:bg-red-50"
                  >
                    새로고침
                  </button>
                )}
                {(lecture.status === 'PROCESSING' || lecture.status === 'UPLOADING') && (
                  <div className="mt-3 h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full bg-indigo-400 animate-pulse w-1/2" />
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
