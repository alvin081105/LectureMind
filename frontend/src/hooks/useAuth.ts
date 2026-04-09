import { useNavigate } from 'react-router-dom';
import { authApi } from '../api/authApi';
import { useAuthStore } from '../store/authStore';
import type { LoginRequest, SignupRequest } from '../types';

export function useAuth() {
  const navigate = useNavigate();
  const { user, isAuthenticated, setAuth, clearAuth } = useAuthStore();

  const login = async (data: LoginRequest) => {
    const res = await authApi.login(data);
    const { accessToken, refreshToken, user: userInfo } = res.data;

    setAuth(userInfo, accessToken, refreshToken);

    if (userInfo.role === 'STUDENT') navigate('/student');
    else navigate('/professor');
  };

  const signup = async (data: SignupRequest) => {
    await authApi.signup(data);
    navigate('/login');
  };

  const logout = () => {
    clearAuth();
    navigate('/login');
  };

  return { user, isAuthenticated, login, signup, logout };
}
