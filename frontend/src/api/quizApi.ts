import axiosInstance from './axiosInstance';
import type { BloomLevel, PageResponse, QuizAnswer, QuizResult, QuizSet } from '../types';

interface GenerateQuizParams {
  noteId: number;
  bloomLevels: BloomLevel[];
  count: number;
}

export const quizApi = {
  generate: (params: GenerateQuizParams) =>
    axiosInstance.post<QuizSet>('/quizzes/generate', params),

  getById: (quizSetId: number) =>
    axiosInstance.get<QuizSet>(`/quizzes/${quizSetId}`),

  // 백엔드: POST /quizzes/{quizSetId}/submit with { answers: [{ quizId, userAnswer }] }
  submit: (quizSetId: number, answers: QuizAnswer[]) =>
    axiosInstance.post<QuizResult>(`/quizzes/${quizSetId}/submit`, { answers }),

  // 백엔드: GET /quizzes/history
  getHistory: (lectureId?: number, page = 0, size = 10) =>
    axiosInstance.get<PageResponse<QuizResult>>('/quizzes/history', {
      params: { lectureId, page, size },
    }),
};
