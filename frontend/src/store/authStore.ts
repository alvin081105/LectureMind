import { create } from 'zustand';
import type { Role, User } from '../types';

interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, accessToken: string, refreshToken: string) => void;
  setAccessToken: (token: string) => void;
  updateUser: (partial: Partial<User>) => void;
  clearAuth: () => void;
}

const ACCESS_TOKEN_KEY = 'accessToken';
const REFRESH_TOKEN_KEY = 'refreshToken';
const USER_KEY = 'user';

function loadFromStorage(): Partial<AuthState> {
  try {
    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    const userStr = localStorage.getItem(USER_KEY);
    const user: User | null = userStr ? JSON.parse(userStr) : null;
    return { accessToken, refreshToken, user, isAuthenticated: !!accessToken && !!user };
  } catch {
    return {};
  }
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  accessToken: null,
  refreshToken: null,
  isAuthenticated: false,
  ...loadFromStorage(),

  setAuth: (user, accessToken, refreshToken) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    set({ user, accessToken, refreshToken, isAuthenticated: true });
  },

  setAccessToken: (token) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    set({ accessToken: token });
  },

  updateUser: (partial) =>
    set((state) => {
      const updated = state.user ? { ...state.user, ...partial } : state.user;
      if (updated) localStorage.setItem(USER_KEY, JSON.stringify(updated));
      return { user: updated };
    }),

  clearAuth: () => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    set({ user: null, accessToken: null, refreshToken: null, isAuthenticated: false });
  },
}));

export function getRole(): Role | null {
  const user = useAuthStore.getState().user;
  return user?.role ?? null;
}
