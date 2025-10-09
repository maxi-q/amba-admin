import { useMutation } from '@tanstack/react-query';
import authService from '@/services/auth/auth.service';
import type { IRegisterProjectRequest } from '@/services/auth/user.types';

export function useRegisterProject() {
  return useMutation({
    mutationFn: (data: IRegisterProjectRequest) => authService.registerProject(data),
  });
}
