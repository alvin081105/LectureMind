import axiosInstance from './axiosInstance';
import type { Lecture, LectureStatusResponse, PageResponse } from '../types';

export const lectureApi = {
  upload: (formData: FormData, onProgress?: (percent: number) => void) =>
    axiosInstance.post<Lecture>('/lectures', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress: (e) => {
        if (onProgress && e.total) onProgress(Math.round((e.loaded / e.total) * 100));
      },
    }),

  getList: (page = 0, size = 20) =>
    axiosInstance.get<PageResponse<Lecture>>('/lectures', { params: { page, size } }),

  getById: (lectureId: number) =>
    axiosInstance.get<Lecture>(`/lectures/${lectureId}`),

  getStatus: (lectureId: number) =>
    axiosInstance.get<LectureStatusResponse>(`/lectures/${lectureId}/status`),

  delete: (lectureId: number) =>
    axiosInstance.delete<void>(`/lectures/${lectureId}`),
};
