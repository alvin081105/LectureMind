import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import FileUploader from '../../components/common/FileUploader';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { lectureApi } from '../../api/lectureApi';
import { usePolling } from '../../hooks/usePolling';
import { formatDateTime } from '../../utils/formatDate';
import type { Lecture } from '../../types';

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

export default function StudentDashboard() {
  const [lectures, setLectures] = useState<Lecture[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loading, setLoading] = useState(true);
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

  // 처리 중인 강의가 있으면 폴링
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
      alert('업로드에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">학생 대시보드</h2>

      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h3 className="text-base font-semibold text-gray-700 mb-4">강의 업로드</h3>
        <FileUploader
          onFileSelect={handleFileSelect}
          uploading={uploading}
          progress={progress}
          onCancel={() => { abortRef.current?.abort(); setUploading(false); }}
        />
      </div>

      <div>
        <h3 className="text-base font-semibold text-gray-700 mb-3">내 강의 목록</h3>
        {loading ? (
          <div className="py-12 flex justify-center"><LoadingSpinner message="강의 목록을 불러오는 중..." /></div>
        ) : lectures.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-400">
            <p className="text-4xl mb-3">🎙️</p>
            <p className="text-sm">아직 업로드한 강의가 없습니다.</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {lectures.map((lecture) => (
              <div key={lecture.lectureId} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-gray-800 truncate">{lecture.title}</p>
                    <p className="text-xs text-gray-400 mt-1">{formatDateTime(lecture.createdAt)}</p>
                    {lecture.duration && <p className="text-xs text-gray-400">{lecture.duration}</p>}
                  </div>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium shrink-0 ${STATUS_COLORS[lecture.status]}`}>
                    {STATUS_LABELS[lecture.status]}
                  </span>
                </div>

                {lecture.status === 'COMPLETED' && (
                  <div className="mt-3 flex gap-2">
                    <Link
                      to={`/student/notes/${lecture.lectureId}`}
                      className="flex-1 text-center py-1.5 text-xs font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
                    >
                      노트 보기
                    </Link>
                    <Link
                      to={`/student/quiz/${lecture.lectureId}`}
                      className="flex-1 text-center py-1.5 text-xs font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
                    >
                      퀴즈 시작
                    </Link>
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
