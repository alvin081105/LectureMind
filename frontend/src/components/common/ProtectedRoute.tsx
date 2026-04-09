import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import type { Role } from '../../types';

interface ProtectedRouteProps {
  requiredRole?: Role;
}

export default function ProtectedRoute({ requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (requiredRole && user?.role !== requiredRole) {
    return <Navigate to={user?.role === 'STUDENT' ? '/student' : '/professor'} replace />;
  }

  return <Outlet />;
}
