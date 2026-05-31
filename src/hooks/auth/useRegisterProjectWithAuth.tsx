import { useMutation } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@store/index';
import { authControllerCreateProject, authControllerLogin } from '@/api/generated/auth/auth';
import type { LoginBySignRequestDto, RegisterProjectByAuthorizationCodeRequestDto } from '@/api/generated/model';

export function useRegisterProjectWithAuth() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, logout } = useAuthStore();

  return useMutation({
    mutationFn: async ({ 
      registerData, 
      authData 
    }: { 
      registerData: RegisterProjectByAuthorizationCodeRequestDto; 
      authData: LoginBySignRequestDto; 
    }) => {
      // Сначала регистрируем проект
      await authControllerCreateProject(registerData);

      const authResponse = await authControllerLogin(authData);
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
