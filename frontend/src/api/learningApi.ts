import axiosInstance from './axiosInstance';
import type { LearningDiagnosis, QuizSet, ReviewSchedule } from '../types';

export const learningApi = {
  getDiagnosis: (lectureId: number) =>
    axiosInstance.get<LearningDiagnosis>(`/learning/diagnosis/${lectureId}`),

  getSchedule: () =>
    axiosInstance.get<ReviewSchedule[]>('/learning/schedule'),

  // 백엔드: POST /learning/schedule/{lectureId}/complete (lectureId 사용, scheduleId 아님)
  completeReview: (lectureId: number) =>
    axiosInstance.post<ReviewSchedule>(`/learning/schedule/${lectureId}/complete`),

  // POST /learning/review-quiz
  generateReviewQuiz: (lectureId: number, weakLevels: string[], count = 5) =>
    axiosInstance.post<QuizSet>('/learning/review-quiz', { lectureId, weakLevels, count }),
};
