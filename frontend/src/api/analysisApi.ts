import axiosInstance from './axiosInstance';
import type { Analysis, AnalysisGenerateResponse, AnalysisListItem, PageResponse } from '../types';

export const analysisApi = {
  generate: (lectureId: number) =>
    axiosInstance.post<AnalysisGenerateResponse>('/analysis/generate', { lectureId }),

  getList: (page = 0, size = 50) =>
    axiosInstance.get<PageResponse<AnalysisListItem>>('/analysis', { params: { page, size } }),

  getById: (analysisId: number) =>
    axiosInstance.get<Analysis>(`/analysis/${analysisId}`),

  // lectureId로 분석 찾기: 목록에서 매칭 후 상세 조회
  findByLectureId: async (lectureId: number): Promise<Analysis | null> => {
    const listRes = await axiosInstance.get<PageResponse<AnalysisListItem>>('/analysis', {
      params: { page: 0, size: 50 },
    });
    const found = listRes.data.content.find((a) => a.lectureId === lectureId);
    if (!found) return null;
    const detailRes = await axiosInstance.get<Analysis>(`/analysis/${found.analysisId}`);
    return detailRes.data;
  },

  exportPdf: (analysisId: number) =>
    axiosInstance.get<Blob>(`/analysis/${analysisId}/export`, { responseType: 'blob' }),
};
