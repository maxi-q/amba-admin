import { useMutation } from '@tanstack/react-query';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@store/index';
import { authControllerCreateProject, authControllerLogin } from '@/api/generated/auth/auth';
import type { LoginBySignRequestDto, RegisterProjectByAuthorizationCodeRequestDto } from '@/api/generated/model';
import { registerAndLogin } from './registerAndLogin';

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
      return registerAndLogin(
        () => authControllerCreateProject(registerData),
        () => authControllerLogin(authData),
      );
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
    onError: () => {
      logout();
    }
  });
}
