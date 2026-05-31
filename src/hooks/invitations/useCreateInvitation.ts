import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { QueryKeys } from '@/config/tanstack/queryKeys';
import { MutationKeys } from '@/config/tanstack/mutationKeys';
import { afterRegistrationInvitationsControllerCreateInvitation } from '@/api/generated/after-registration-invitations/after-registration-invitations';
import type { CreateInvitationRequestDto } from '@/api/generated/model';
import { ApiError } from '@/types';

export function useCreateInvitation() {
  const queryClient = useQueryClient();

  const { mutate, isPending, error, isSuccess, isError, reset } = useMutation<
    Awaited<ReturnType<typeof afterRegistrationInvitationsControllerCreateInvitation>>,
    ApiError,
    CreateInvitationRequestDto
  >({
    mutationKey: [MutationKeys.CREATE_INVITATION],
    mutationFn: (data: CreateInvitationRequestDto) =>
      afterRegistrationInvitationsControllerCreateInvitation(data),
    onSuccess: (response) => {
      const roomId = response?.roomId;
      if (roomId) {
        queryClient.invalidateQueries({
          queryKey: [QueryKeys.INVITATIONS, roomId],
          exact: false,
        });
      }
    },
  });

  const isValidationError = useMemo(
    () => error instanceof ApiError && error.statusCode === 422,
    [error]
  );

  const validationErrors = useMemo(
    () => (error instanceof ApiError && error.fieldErrors ? error.fieldErrors : {}),
    [error]
  );

  const generalError = useMemo(
    () => (error instanceof ApiError && error.statusCode !== 422 ? error.message : ''),
    [error]
  );

  return {
    createInvitation: mutate,
    isPending,
    error,
    isSuccess,
    isError,
    isValidationError,
    validationErrors,
    generalError,
    reset,
  };
}
