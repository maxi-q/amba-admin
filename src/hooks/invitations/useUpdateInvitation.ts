import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { QueryKeys } from '@/config/tanstack/queryKeys';
import { MutationKeys } from '@/config/tanstack/mutationKeys';
import invitationsService from '@services/invitations/invitations.service';
import type { IUpdateInvitationRequest } from '@services/invitations/invitations.types';
import { ApiError } from '@/types';

export function useUpdateInvitation() {
  const queryClient = useQueryClient();

  const { mutate, isPending, error, isSuccess, isError, reset } = useMutation<
    Awaited<ReturnType<typeof invitationsService.updateInvitation>>,
    ApiError,
    { id: string; data: IUpdateInvitationRequest; roomId: string }
  >({
    mutationKey: [MutationKeys.UPDATE_INVITATION],
    mutationFn: ({ id, data }) => invitationsService.updateInvitation(id, data),
    onSuccess: (response, { roomId }) => {
      if (response?.data?.roomId) {
        queryClient.invalidateQueries({
          queryKey: [QueryKeys.INVITATIONS, response.data.roomId],
          exact: false,
        });
      } else if (roomId) {
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
    updateInvitation: mutate,
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
