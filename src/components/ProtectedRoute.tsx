import { Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const { auth } = useAuthStore();
  const location = useLocation();

  if (!auth) {
    return <Navigate to={`/auth${location.search}`} state={{ from: location }} replace />;
  }

  return <>{children}</>;
};