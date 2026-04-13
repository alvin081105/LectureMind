import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { learningApi } from '../../api/learningApi';
import { formatDate } from '../../utils/formatDate';
import type { ReviewSchedule } from '../../types';

function getDday(dateStr: string): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr);
  target.setHours(0, 0, 0, 0);
  const diff = Math.round((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  if (diff === 0) return 'D-day';
  if (diff < 0) return `D+${Math.abs(diff)}`;
  return `D-${diff}`;
}

export default function LearningPathPage() {
  const [schedules, setSchedules] = useState<ReviewSchedule[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchSchedules = async () => {
    try {
      const res = await learningApi.getSchedule();
      setSchedules(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSchedules(); }, []);

  const handleComplete = async (lectureId: number) => {
    await learningApi.completeReview(lectureId);
    await fetchSchedules();
  };

  const today = new Date().toISOString().split('T')[0];
  const todaySchedules = schedules.filter((s) => s.nextReviewDate <= today);
  const upcomingSchedules = schedules.filter((s) => s.nextReviewDate > today);

  const avgRetention = schedules.length > 0
    ? Math.round(schedules.reduce((sum, s) => sum + s.retentionRate, 0) / schedules.length)
    : 0;

  if (loading) {
    return <div className="flex justify-center py-24"><LoadingSpinner message="학습 경로를 불러오는 중..." /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-800">학습 경로</h2>
      </div>

      {/* 통계 요약 */}
      {schedules.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-indigo-600">{schedules.length}</p>
            <p className="text-xs text-gray-500 mt-0.5">관리 중인 강의</p>
          </div>
          <div className="bg-white border border-gray-200 rounded-xl p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{avgRetention}%</p>
            <p className="text-xs text-gray-500 mt-0.5">평균 기억률</p>
          </div>
          <div className={`border rounded-xl p-4 text-center ${todaySchedules.length > 0 ? 'bg-red-50 border-red-200' : 'bg-white border-gray-200'}`}>
            <p className={`text-2xl font-bold ${todaySchedules.length > 0 ? 'text-red-500' : 'text-gray-400'}`}>
              {todaySchedules.length}
            </p>
            <p className="text-xs text-gray-500 mt-0.5">오늘 복습</p>
          </div>
        </div>
      )}

      {/* 오늘 복습 */}
      {todaySchedules.length > 0 && (
        <div>
          <h3 className="text-base font-semibold text-red-600 mb-3 flex items-center gap-2">
            오늘 복습할 강의
            <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded-full font-medium">
              {todaySchedules.length}개
            </span>
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {todaySchedules.map((s) => (
              <div key={s.lectureId} className="bg-white border border-red-200 rounded-xl p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">{s.lectureTitle}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-gray-500">복습 {s.reviewCount}회</span>
                      {s.lastReviewDate && (
                        <span className="text-xs text-gray-400">· 마지막 {formatDate(s.lastReviewDate)}</span>
                      )}
                    </div>
                  </div>
                  <span className="shrink-0 text-xs font-bold text-red-500 bg-red-50 border border-red-200 px-2 py-0.5 rounded-full">
                    {getDday(s.nextReviewDate)}
                  </span>
                </div>
                <div>
                  <div className="flex justify-between text-xs text-gray-400 mb-1">
                    <span>기억률</span>
                    <span className="font-medium text-gray-600">{Math.round(s.retentionRate)}%</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${s.retentionRate}%`,
                        backgroundColor: s.retentionRate >= 70 ? '#22c55e' : s.retentionRate >= 40 ? '#f59e0b' : '#ef4444',
                      }}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => navigate(`/student/quiz/${s.lectureId}`)}
                    className="flex-1 py-1.5 text-xs font-medium text-indigo-600 border border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors"
                  >
                    퀴즈로 복습
                  </button>
                  <button
                    onClick={() => handleComplete(s.lectureId)}
                    className="flex-1 py-1.5 text-xs font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
                  >
                    복습 완료
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 예정된 복습 */}
      <div>
        <h3 className="text-base font-semibold text-gray-700 mb-3">예정된 복습</h3>
        {schedules.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center text-gray-400">
            <p className="text-3xl mb-3">📅</p>
            <p className="text-sm">등록된 복습 일정이 없습니다.<br />퀴즈를 풀면 복습 일정이 생성됩니다.</p>
          </div>
        ) : upcomingSchedules.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-4">예정된 복습이 없습니다.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {upcomingSchedules
              .sort((a, b) => a.nextReviewDate.localeCompare(b.nextReviewDate))
              .map((s) => {
                const dday = getDday(s.nextReviewDate);
                return (
                  <div key={s.lectureId} className="bg-white border border-gray-200 rounded-xl p-4 space-y-3 hover:shadow-sm transition-shadow">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-gray-800 truncate">{s.lectureTitle}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-gray-500">복습 {s.reviewCount}회</span>
                          {s.lastReviewDate && (
                            <span className="text-xs text-gray-400">· 마지막 {formatDate(s.lastReviewDate)}</span>
                          )}
                        </div>
                      </div>
                      <div className="shrink-0 text-right">
                        <span className="text-xs font-bold text-indigo-500 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full">
                          {dday}
                        </span>
                        <p className="text-xs text-gray-400 mt-1">{formatDate(s.nextReviewDate)}</p>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-gray-400 mb-1">
                        <span>기억률</span>
                        <span className="font-medium text-gray-600">{Math.round(s.retentionRate)}%</span>
                      </div>
                      <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full transition-all duration-500"
                          style={{
                            width: `${s.retentionRate}%`,
                            backgroundColor: s.retentionRate >= 70 ? '#22c55e' : s.retentionRate >= 40 ? '#f59e0b' : '#ef4444',
                          }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
