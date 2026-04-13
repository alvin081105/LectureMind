import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import RadarChart from '../../components/quiz/RadarChart';
import BloomBadge from '../../components/common/BloomBadge';
import { BLOOM_COLORS, BLOOM_LEVELS } from '../../constants/bloomColors';
import type { QuizResult } from '../../types';

export default function QuizResultPage() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const result: QuizResult = state?.result;
  const [expandedIds, setExpandedIds] = useState<Set<number>>(new Set());

  if (!result) {
    navigate(-1);
    return null;
  }

  const wrongAnswers = result.results?.filter((r) => !r.isCorrect) ?? [];
  const score = Math.round(result.scorePercent);
  const grade = score >= 90 ? { label: '우수', color: 'text-green-600', bg: 'bg-green-50' }
    : score >= 70 ? { label: '양호', color: 'text-blue-600', bg: 'bg-blue-50' }
    : score >= 50 ? { label: '보통', color: 'text-yellow-600', bg: 'bg-yellow-50' }
    : { label: '부족', color: 'text-red-600', bg: 'bg-red-50' };

  const toggleExpand = (id: number) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="text-sm text-gray-500 hover:text-gray-800">← 뒤로</button>
        <h2 className="text-xl font-bold text-gray-800">퀴즈 결과</h2>
      </div>

      {/* 총점 카드 */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6 text-center">
        <div className={`inline-block px-3 py-1 rounded-full text-xs font-semibold mb-3 ${grade.bg} ${grade.color}`}>
          {grade.label}
        </div>
        <p className={`text-6xl font-bold mb-2 ${grade.color}`}>{score}점</p>
        <p className="text-sm text-gray-500">
          {result.totalCount}문제 중 {result.correctCount}문제 정답
          <span className="mx-2 text-gray-300">·</span>
          오답 {result.totalCount - result.correctCount}개
        </p>
        {result.weakLevels && result.weakLevels.length > 0 && (
          <div className="mt-4 p-3 bg-red-50 rounded-xl border border-red-100">
            <p className="text-xs text-red-500 font-medium mb-2">보완이 필요한 레벨</p>
            <div className="flex flex-wrap justify-center gap-2">
              {result.weakLevels.map((level) => (
                <BloomBadge key={level} level={level} size="sm" />
              ))}
            </div>
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

      {/* 오답 노트 */}
      {wrongAnswers.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-semibold text-gray-700">오답 노트</h3>
            <span className="text-xs text-red-500 bg-red-50 px-2 py-0.5 rounded-full font-medium">
              {wrongAnswers.length}개
            </span>
          </div>
          <div className="space-y-3">
            {wrongAnswers.map((item, idx) => {
              const quiz = result.results.find((r) => r.quizId === item.quizId);
              if (!quiz) return null;
              const isExpanded = expandedIds.has(item.quizId);
              // quizSet의 문제 정보에서 bloomLevel을 가져올 수 없으므로 번호만 표시
              return (
                <div key={item.quizId} className="border border-red-100 rounded-xl overflow-hidden">
                  <button
                    className="w-full text-left p-4 flex items-start justify-between gap-3 hover:bg-red-50 transition-colors"
                    onClick={() => toggleExpand(item.quizId)}
                  >
                    <div className="flex items-start gap-2 min-w-0">
                      <span className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-red-100 text-red-600 text-xs font-bold flex items-center justify-center">
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <p className="text-sm text-gray-700 font-medium leading-snug line-clamp-2">
                          {/* 문제 텍스트는 result에 없어서 내 답 → 정답으로만 표시 */}
                          내 답: <span className="text-red-500">{item.userAnswer || '(무응답)'}</span>
                          <span className="mx-1 text-gray-300">→</span>
                          정답: <span className="text-green-600">{item.correctAnswer}</span>
                        </p>
                      </div>
                    </div>
                    <svg
                      className={`w-4 h-4 text-gray-400 shrink-0 mt-0.5 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                      fill="none" stroke="currentColor" viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {isExpanded && (
                    <div className="px-4 pb-4 pt-0 space-y-2">
                      {item.feedback && (
                        <p className="text-xs text-blue-700 bg-blue-50 p-2 rounded-lg">{item.feedback}</p>
                      )}
                      <div className="text-xs text-gray-600 bg-gray-50 p-3 rounded-lg leading-relaxed">
                        <span className="font-semibold text-gray-700">해설: </span>{item.explanation}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

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
