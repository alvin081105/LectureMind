import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import DifficultyTimeline from '../../components/analysis/DifficultyTimeline';
import BloomPieChart from '../../components/analysis/BloomPieChart';
import ImprovementCard from '../../components/analysis/ImprovementCard';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import AILoader, { ANALYSIS_MESSAGES } from '../../components/common/AILoader';
import { analysisApi } from '../../api/analysisApi';
import { usePolling } from '../../hooks/usePolling';
import type { Analysis, Improvement } from '../../types';

export default function AnalysisReportPage() {
  const { lectureId } = useParams<{ lectureId: string }>();
  const navigate = useNavigate();
  const [analysis, setAnalysis] = useState<Analysis | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [selectedImprovement, setSelectedImprovement] = useState<Improvement | null>(null);

  const fetchAnalysis = async () => {
    if (!lectureId) return;
    try {
      const found = await analysisApi.findByLectureId(Number(lectureId));
      setAnalysis(found);
    } catch {
      setAnalysis(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAnalysis(); }, [lectureId]);

  // ANALYZING 상태면 폴링
  usePolling(async () => {
    if (!analysis || analysis.status !== 'ANALYZING') return true;
    await fetchAnalysis();
    return false;
  }, { enabled: analysis?.status === 'ANALYZING', interval: 3000 });

  const handleGenerate = async () => {
    if (!lectureId) return;
    setGenerating(true);
    try {
      const res = await analysisApi.generate(Number(lectureId));
      // 비동기 생성 — analysisId로 폴링
      setAnalysis({ analysisId: res.data.analysisId, lectureId: Number(lectureId), status: 'ANALYZING', createdAt: new Date().toISOString() });
    } catch {
      alert('분석 생성에 실패했습니다.');
    } finally {
      setGenerating(false);
    }
  };

  const handleExport = async () => {
    if (!analysis) return;
    setExporting(true);
    try {
      const res = await analysisApi.exportPdf(analysis.analysisId);
      const url = URL.createObjectURL(res.data as Blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `분석리포트_${lectureId}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } catch {
      alert('PDF 내보내기에 실패했습니다.');
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center py-24"><LoadingSpinner message="분석 리포트를 불러오는 중..." /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-800">← 뒤로</button>
          <h2 className="text-xl font-bold text-gray-800">강의 맹점 진단 리포트</h2>
        </div>
        {analysis?.status === 'COMPLETED' && (
          <button
            onClick={handleExport}
            disabled={exporting}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            {exporting ? 'PDF 생성 중...' : 'PDF 내보내기'}
          </button>
        )}
      </div>

      {!analysis || analysis.status === 'FAILED' ? (
        <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center space-y-4">
          <p className="text-4xl">🔍</p>
          <p className="text-gray-600 text-sm">강의 분석 리포트가 없습니다.</p>
          <button
            onClick={handleGenerate}
            disabled={generating}
            className="px-6 py-2.5 bg-purple-600 text-white rounded-xl text-sm font-medium hover:bg-purple-700 disabled:opacity-50"
          >
            {generating ? '요청 중...' : 'AI 분석 시작'}
          </button>
        </div>
      ) : analysis.status === 'ANALYZING' ? (
        <AILoader title="AI 강의 분석 중" messages={ANALYSIS_MESSAGES} />
      ) : (
        <div className="space-y-6">
          {/* 요약 카드 */}
          {analysis.summary && (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { label: '강의 주제', value: analysis.summary.topic },
                { label: '강의 시간', value: analysis.summary.duration },
                { label: '핵심 개념', value: `${analysis.summary.conceptCount}개` },
                { label: '문제 구간', value: `${analysis.improvements?.length ?? 0}개` },
              ].map((item) => (
                <div key={item.label} className="bg-white border border-gray-200 rounded-xl p-4 text-center">
                  <p className="text-xs text-gray-500 mb-1">{item.label}</p>
                  <p className="text-sm font-semibold text-gray-800 truncate">{item.value}</p>
                </div>
              ))}
            </div>
          )}

          <div className="grid gap-6 lg:grid-cols-2">
            {/* 블룸 파이차트 */}
            {analysis.summary?.bloomDistribution && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h3 className="text-base font-semibold text-gray-700 mb-4">블룸 레벨 분포</h3>
                <BloomPieChart distribution={analysis.summary.bloomDistribution} />
              </div>
            )}

            {/* 난이도 타임라인 */}
            {analysis.difficultyTimeline && analysis.improvements && (
              <div className="bg-white border border-gray-200 rounded-2xl p-6">
                <h3 className="text-base font-semibold text-gray-700 mb-4">난이도 타임라인</h3>
                <DifficultyTimeline
                  timeline={analysis.difficultyTimeline}
                  improvements={analysis.improvements}
                  onSelectImprovement={setSelectedImprovement}
                />
              </div>
            )}
          </div>

          {/* 개선 제안 */}
          {analysis.improvements && analysis.improvements.length > 0 && (
            <div className="bg-white border border-gray-200 rounded-2xl p-6">
              <h3 className="text-base font-semibold text-gray-700 mb-4">
                AI 개선 제안 ({analysis.improvements.length}건)
              </h3>
              <div className="grid gap-3 sm:grid-cols-2">
                {analysis.improvements.map((imp, idx) => (
                  <ImprovementCard
                    key={imp.id ?? idx}
                    improvement={imp}
                    onClick={() => setSelectedImprovement(imp)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* 상세 모달 */}
          {selectedImprovement && (
            <div
              className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4"
              onClick={() => setSelectedImprovement(null)}
            >
              <div
                className="bg-white rounded-2xl p-6 max-w-lg w-full space-y-4"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-between items-start">
                  <h3 className="text-base font-semibold text-gray-800">{selectedImprovement.targetSection}</h3>
                  <button onClick={() => setSelectedImprovement(null)} className="text-gray-400 hover:text-gray-600 text-xl">×</button>
                </div>
                <p className="text-sm text-gray-600">{selectedImprovement.issue}</p>
                <div className="bg-indigo-50 rounded-xl p-4">
                  <p className="text-xs font-semibold text-indigo-700 mb-1">AI 개선 제안</p>
                  <p className="text-sm text-indigo-800">{selectedImprovement.suggestion}</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
