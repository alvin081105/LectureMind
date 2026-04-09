import { useLocation, useNavigate } from 'react-router-dom';
import RadarChart from '../../components/quiz/RadarChart';
import { BLOOM_COLORS, BLOOM_LEVELS } from '../../constants/bloomColors';
import type { QuizResult } from '../../types';

export default function QuizResultPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const result: QuizResult = state?.result;

  if (!result) {
    navigate(-1);
    return null;
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h2 className="text-xl font-bold text-gray-800">퀴즈 결과</h2>

      {/* 총점 카드 */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center">
        <p className="text-5xl font-bold text-indigo-600 mb-2">{Math.round(result.scorePercent)}점</p>
        <p className="text-sm text-gray-500">
          {result.totalCount}문제 중 {result.correctCount}문제 정답
        </p>
        {result.weakLevels && result.weakLevels.length > 0 && (
          <div className="mt-3 flex flex-wrap justify-center gap-2">
            <span className="text-xs text-gray-500">약점 레벨:</span>
            {result.weakLevels.map((level) => (
              <span key={level} className="text-xs px-2 py-0.5 bg-red-50 text-red-600 rounded-full">
                {BLOOM_COLORS[level]?.label ?? level}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* 레이더 차트 */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h3 className="text-base font-semibold text-gray-700 mb-4">레벨별 이해도</h3>
        <RadarChart result={result} />
      </div>

      {/* 레벨별 점수 */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h3 className="text-base font-semibold text-gray-700 mb-4">레벨별 상세</h3>
        <div className="space-y-3">
          {BLOOM_LEVELS.map((level) => {
            const data = result.scoreByLevel?.[level];
            if (!data?.total) return null;
            const rate = Math.round((data.correct / data.total) * 100);
            const color = BLOOM_COLORS[level];
            return (
              <div key={level}>
                <div className="flex justify-between text-sm mb-1">
                  <span style={{ color: color.text }}>{color.label}</span>
                  <span className="text-gray-500">{data.correct}/{data.total} · {rate}%</span>
                </div>
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all"
                    style={{ width: `${rate}%`, backgroundColor: color.text }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="flex gap-3">
        <button onClick={() => navigate(-1)} className="flex-1 py-3 border border-gray-300 rounded-xl text-sm font-medium hover:bg-gray-50">
          다시 풀기
        </button>
        <button onClick={() => navigate('/student/learning')} className="flex-1 py-3 bg-indigo-600 text-white rounded-xl text-sm font-medium hover:bg-indigo-700">
          학습 경로 보기
        </button>
      </div>
    </div>
  );
}
