import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { analysisApi } from '../../api/analysisApi';
import { formatDateTime } from '../../utils/formatDate';
import type { AnalysisListItem } from '../../types';

const STATUS_LABELS: Record<string, string> = {
  ANALYZING: '분석 중',
  COMPLETED: '완료',
  FAILED: '실패',
};

const STATUS_COLORS: Record<string, string> = {
  ANALYZING: 'text-yellow-600 bg-yellow-50 border-yellow-200',
  COMPLETED: 'text-green-600 bg-green-50 border-green-200',
  FAILED: 'text-red-600 bg-red-50 border-red-200',
};

const PRIORITY_COLORS: Record<string, string> = {
  high: 'text-red-600 bg-red-50',
  medium: 'text-yellow-600 bg-yellow-50',
  low: 'text-gray-500 bg-gray-50',
};

export default function AnalysisListPage() {
  const [analyses, setAnalyses] = useState<AnalysisListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [exportingId, setExportingId] = useState<number | null>(null);

  useEffect(() => {
    analysisApi.getList(0, 50)
      .then((res) => setAnalyses(res.data.content))
      .finally(() => setLoading(false));
  }, []);

  const handleExport = async (analysisId: number, lectureTitle: string) => {
    setExportingId(analysisId);
    try {
      const res = await analysisApi.exportPdf(analysisId);
      const url = URL.createObjectURL(res.data as Blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `분석리포트_${lectureTitle}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('PDF 내보내기에 실패했습니다.');
    } finally {
      setExportingId(null);
    }
  };

  const completed = analyses.filter((a) => a.status === 'COMPLETED');
  const totalIssues = completed.reduce((sum, a) => sum + (a.issueCount ?? 0), 0);
  const totalHigh = completed.reduce((sum, a) => sum + (a.highPriorityCount ?? 0), 0);

  if (loading) {
    return <div className="flex justify-center py-24"><LoadingSpinner message="분석 목록을 불러오는 중..." /></div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">분석 리포트 목록</h2>

      {/* 요약 통계 */}
      {analyses.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-indigo-600">{analyses.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">전체 분석</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-orange-500">{totalIssues}</p>
            <p className="text-xs text-gray-500 mt-0.5">발견된 문제</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-red-500">{totalHigh}</p>
            <p className="text-xs text-gray-500 mt-0.5">높은 우선순위</p>
          </div>
        </div>
      )}

      {/* 목록 */}
      {analyses.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center text-gray-400">
          <p className="text-4xl mb-3">🔍</p>
          <p className="text-sm">아직 분석된 강의가 없습니다.</p>
          <p className="text-xs mt-1">강의 업로드 후 AI 분석을 요청해보세요.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {analyses.map((analysis) => (
            <div key={analysis.analysisId} className="bg-white border border-gray-200 rounded-xl p-4 hover:shadow-sm transition-shadow">
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[analysis.status]}`}>
                      {STATUS_LABELS[analysis.status]}
                    </span>
                    {analysis.status === 'COMPLETED' && analysis.highPriorityCount > 0 && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 text-red-600">
                        HIGH {analysis.highPriorityCount}건
                      </span>
                    )}
                  </div>
                  <p className="text-sm font-semibold text-gray-800 truncate">{analysis.lectureTitle}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{formatDateTime(analysis.createdAt)}</p>
                  {analysis.status === 'COMPLETED' && (
                    <p className="text-xs text-gray-500 mt-1">
                      문제 구간 <span className="font-medium text-orange-500">{analysis.issueCount}개</span> 발견
                    </p>
                  )}
                </div>

                <div className="flex gap-2 shrink-0">
                  {analysis.status === 'COMPLETED' && (
                    <>
                      <button
                        onClick={() => handleExport(analysis.analysisId, analysis.lectureTitle)}
                        disabled={exportingId === analysis.analysisId}
                        className="px-3 py-1.5 text-xs font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                      >
                        {exportingId === analysis.analysisId ? '생성 중...' : 'PDF'}
                      </button>
                      <Link
                        to={`/professor/analysis/${analysis.lectureId}`}
                        className="px-3 py-1.5 text-xs font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
                      >
                        상세 보기
                      </Link>
                    </>
                  )}
                  {analysis.status === 'ANALYZING' && (
                    <span className="px-3 py-1.5 text-xs text-yellow-600 bg-yellow-50 rounded-lg border border-yellow-200 animate-pulse">
                      분석 중...
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
