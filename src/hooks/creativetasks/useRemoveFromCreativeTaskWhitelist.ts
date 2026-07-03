import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { QueryKeys } from '@/config/tanstack/queryKeys';
import { MutationKeys } from '@/config/tanstack/mutationKeys';
import { privateCreativeTasksControllerRemoveFromWhitelist } from '@/api/generated/private-creative-tasks/private-creative-tasks';
import { ApiError } from '@/types';

export function useRemoveFromCreativeTaskWhitelist() {
  const queryClient = useQueryClient();

  const { mutate, isPending, error, isSuccess, isError } = useMutation({
    mutationKey: [MutationKeys.REMOVE_CREATIVE_TASK_WHITELIST],
    mutationFn: ({
      taskId,
      ambassadorId,
    }: {
      taskId: string;
      ambassadorId: string;
    }) =>
      privateCreativeTasksControllerRemoveFromWhitelist(taskId, ambassadorId),
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.CREATIVE_TASK_WHITELIST, taskId],
        exact: false,
      });
    },
  });

  const generalError = useMemo(
    () =>
      error instanceof ApiError && error.statusCode !== 422
        ? error.message
        : '',
    [error]
  );

  return {
    removeFromWhitelist: mutate,
    isPending,
    error,
    isSuccess,
    isError,
    generalError,
  };
}
