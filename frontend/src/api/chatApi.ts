import axiosInstance from './axiosInstance';
import type { ChatMessage, ChatSession } from '../types';

export const chatApi = {
  // POST /chat/sessions — { noteId }
  createSession: (noteId: number) =>
    axiosInstance.post<ChatSession>('/chat/sessions', { noteId }),

  // GET /chat/sessions
  getSessions: () =>
    axiosInstance.get<ChatSession[]>('/chat/sessions'),

  // GET /chat/sessions/{sessionId}/messages
  getMessages: (sessionId: number) =>
    axiosInstance.get<ChatMessage[]>(`/chat/sessions/${sessionId}/messages`),

  // POST /chat/sessions/{sessionId}/messages — { content }
  sendMessage: (sessionId: number, content: string) =>
    axiosInstance.post<ChatMessage>(`/chat/sessions/${sessionId}/messages`, { content }),
};
