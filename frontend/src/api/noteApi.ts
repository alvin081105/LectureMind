import axiosInstance from './axiosInstance';
import type { Note, NoteGenerateResponse, NoteListItem, PageResponse } from '../types';

export const noteApi = {
  // 비동기 생성 — noteId 반환 (완료까지 폴링 필요)
  generate: (lectureId: number) =>
    axiosInstance.post<NoteGenerateResponse>('/notes/generate', { lectureId }),

  // 노트 목록 (lectureId로 필터링하려면 전체 목록에서 find)
  getList: (page = 0, size = 50) =>
    axiosInstance.get<PageResponse<NoteListItem>>('/notes', { params: { page, size } }),

  getById: (noteId: number) =>
    axiosInstance.get<Note>(`/notes/${noteId}`),

  // lectureId로 노트 찾기: 목록에서 매칭
  findByLectureId: async (lectureId: number): Promise<Note | null> => {
    const listRes = await axiosInstance.get<PageResponse<NoteListItem>>('/notes', { params: { page: 0, size: 50 } });
    const found = listRes.data.content.find((n) => n.lectureId === lectureId);
    if (!found) return null;
    const noteRes = await axiosInstance.get<Note>(`/notes/${found.noteId}`);
    return noteRes.data;
  },

  // export: 파일 다운로드 (Blob 반환)
  exportMarkdown: (noteId: number) =>
    axiosInstance.get<Blob>(`/notes/${noteId}/export`, {
      params: { format: 'markdown' },
      responseType: 'blob',
    }),

  delete: (noteId: number) =>
    axiosInstance.delete<void>(`/notes/${noteId}`),
};
