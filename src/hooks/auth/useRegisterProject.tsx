import { useMutation } from '@tanstack/react-query';
import { authControllerCreateProject } from '@/api/generated/auth/auth';
import type { RegisterProjectByAuthorizationCodeRequestDto } from '@/api/generated/model';

export function useRegisterProject() {
  return useMutation({
    mutationFn: (data: RegisterProjectByAuthorizationCodeRequestDto) => authControllerCreateProject(data),
  });
}
