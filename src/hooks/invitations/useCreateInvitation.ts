import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { QueryKeys } from '@/config/tanstack/queryKeys';
import { MutationKeys } from '@/config/tanstack/mutationKeys';
import invitationsService from '@services/invitations/invitations.service';
import type { ICreateInvitationRequest } from '@services/invitations/invitations.types';
import { ApiError } from '@/types';

export function useCreateInvitation() {
  const queryClient = useQueryClient();

  const { mutate, isPending, error, isSuccess, isError, reset } = useMutation<
    Awaited<ReturnType<typeof invitationsService.createInvitation>>,
    ApiError,
    ICreateInvitationRequest
  >({
    mutationKey: [MutationKeys.CREATE_INVITATION],
    mutationFn: (data: ICreateInvitationRequest) => invitationsService.createInvitation(data),
    onSuccess: (response) => {
      const roomId = response?.data?.roomId;
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
