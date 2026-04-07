import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { QueryKeys } from '@/config/tanstack/queryKeys';
import { MutationKeys } from '@/config/tanstack/mutationKeys';
import invitationsService from '@services/invitations/invitations.service';
import { ApiError } from '@/types';

export function useDeleteInvitation() {
  const queryClient = useQueryClient();

  const { mutate, isPending, error, isSuccess, isError, reset } = useMutation<
    Awaited<ReturnType<typeof invitationsService.deleteInvitation>>,
    ApiError,
    { id: string; roomId: string }
  >({
    mutationKey: [MutationKeys.DELETE_INVITATION],
    mutationFn: ({ id }) => invitationsService.deleteInvitation(id),
    onSuccess: (_res, { roomId }) => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.INVITATIONS, roomId],
        exact: false,
      });
    },
  });

  const generalError = useMemo(
    () => (error instanceof ApiError ? error.message : ''),
    [error]
  );

  return {
    deleteInvitation: mutate,
    isPending,
    error,
    isSuccess,
    isError,
    generalError,
    reset,
  };
}
