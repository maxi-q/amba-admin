import { useMutation } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import authService from '@/services/auth/auth.service';
import { useAuthStore } from '@store/index';
import type { IRegisterProjectRequest, ILoginRequest } from '@/services/auth/user.types';

export function useRegisterProjectWithAuth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, logout } = useAuthStore();

  return useMutation({
    mutationFn: async ({ 
      registerData, 
      authData 
    }: { 
      registerData: IRegisterProjectRequest; 
      authData: ILoginRequest; 
    }) => {
      // Сначала регистрируем проект
      await authService.registerProject(registerData);

      const authResponse = await authService.auth(authData);
      return authResponse;
    },
    onSuccess: (response) => {
      if (response?.token) {
        login(response.token);
        const from = location.state?.from?.pathname || "/";
        navigate(from, { replace: true });
      } else {
        logout();
      }
    },
    onError: (error: any) => {

      // Если проект уже зарегистрирован (409), пытаемся авторизоваться
      if (error?.response?.status === 409) {
        // Здесь можно добавить логику для повторной авторизации
        // или вернуть специальный флаг для компонента
        throw new Error('PROJECT_ALREADY_EXISTS');
      }

      logout();
    }
  });
}
