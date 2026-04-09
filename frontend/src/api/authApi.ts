import axiosInstance from './axiosInstance';
import type { LoginRequest, LoginResponse, SignupRequest, TokenResponse } from '../types';

export const authApi = {
  signup: (data: SignupRequest) =>
    axiosInstance.post<void>('/auth/signup', data),

  login: (data: LoginRequest) =>
    axiosInstance.post<LoginResponse>('/auth/login', data),

  refresh: (refreshToken: string) =>
    axiosInstance.post<TokenResponse>('/auth/refresh', { refreshToken }),

  me: () =>
    axiosInstance.get<{ id: number; email: string; name: string; role: string }>('/auth/me'),
};
