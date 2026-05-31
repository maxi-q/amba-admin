import { useMutation } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@store/index';
import { authControllerLogin } from '@/api/generated/auth/auth';
import type { LoginBySignRequestDto } from '@/api/generated/model';

export function useAuth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, logout } = useAuthStore();

  return useMutation({
    mutationFn: (data: LoginBySignRequestDto) => authControllerLogin(data),
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
