import { useEffect, useState } from 'react';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { learningApi } from '../../api/learningApi';
import { formatDate } from '../../utils/formatDate';
import type { ReviewSchedule } from '../../types';

export default function LearningPathPage() {
  const [schedules, setSchedules] = useState<ReviewSchedule[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSchedules = async () => {
    try {
      const res = await learningApi.getSchedule();
      setSchedules(res.data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchSchedules(); }, []);

  // 백엔드: POST /learning/schedule/{lectureId}/complete
  const handleComplete = async (lectureId: number) => {
    await learningApi.completeReview(lectureId);
    await fetchSchedules();
  };

  const today = new Date().toISOString().split('T')[0];
  const todaySchedules = schedules.filter((s) => s.nextReviewDate <= today);
  const upcomingSchedules = schedules.filter((s) => s.nextReviewDate > today);

  if (loading) {
    return <div className="flex justify-center py-24"><LoadingSpinner message="학습 경로를 불러오는 중..." /></div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold text-gray-800">학습 경로</h2>

      {todaySchedules.length > 0 && (
        <div>
          <h3 className="text-base font-semibold text-red-600 mb-3">
            오늘 복습할 강의 {todaySchedules.length}개
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {todaySchedules.map((s) => (
              <div key={s.lectureId} className="bg-red-50 border border-red-200 rounded-xl p-4 space-y-3">
                <div>
                  <p className="text-sm font-semibold text-gray-800">{s.lectureTitle}</p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    복습 횟수: {s.reviewCount}회 · 기억률: {Math.round(s.retentionRate)}%
                  </p>
                </div>
                <div className="h-1.5 bg-red-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-400 rounded-full"
                    style={{ width: `${s.retentionRate}%` }}
                  />
                </div>
                <button
                  onClick={() => handleComplete(s.lectureId)}
                  className="w-full py-2 text-sm font-medium text-red-600 border border-red-300 rounded-lg hover:bg-red-100 transition-colors"
                >
                  복습 완료
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-base font-semibold text-gray-700 mb-3">예정된 복습</h3>
        {upcomingSchedules.length === 0 && todaySchedules.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center text-gray-400">
            <p className="text-sm">등록된 복습 일정이 없습니다.<br />퀴즈를 풀면 복습 일정이 생성됩니다.</p>
          </div>
        ) : upcomingSchedules.length === 0 ? null : (
          <div className="grid gap-3 sm:grid-cols-2">
            {upcomingSchedules.map((s) => (
              <div key={s.lectureId} className="bg-white border border-gray-200 rounded-xl p-4 space-y-2">
                <p className="text-sm font-semibold text-gray-800">{s.lectureTitle}</p>
                <p className="text-xs text-gray-500">
                  다음 복습: <span className="font-medium text-indigo-600">{formatDate(s.nextReviewDate)}</span>
                </p>
                <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-indigo-400 rounded-full"
                    style={{ width: `${s.retentionRate}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400">기억률: {Math.round(s.retentionRate)}%</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
