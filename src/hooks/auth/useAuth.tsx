import { useMutation } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '@/services/auth/auth.service';
import { useAuthStore } from '@store/index';
import type { ILoginRequest } from '@/services/auth/user.types';

export function useAuth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, logout } = useAuthStore();

  return useMutation({
    mutationFn: (data: ILoginRequest) => authService.auth(data),
    onSuccess: (response) => {
      if (response?.token) {
        login(response.token);
        const from = location.state?.from?.pathname || "/";
        navigate(from, { replace: true });
      } else {
        logout();
      }
    },
    onError: () => {
      logout();
    }
  });
}
