import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { QueryKeys } from '@/config/tanstack/queryKeys';
import { MutationKeys } from '@/config/tanstack/mutationKeys';
import { creativeTasksControllerAddToWhitelist } from '@/api/generated/creative-tasks/creative-tasks';
import type { CreativeTasksControllerAddToWhitelistBody } from '@/api/generated/model';
import { ApiError } from '@/types';

export function useAddToCreativeTaskWhitelist() {
  const queryClient = useQueryClient();

  const { mutate, isPending, error, isSuccess, isError } = useMutation({
    mutationKey: [MutationKeys.ADD_CREATIVE_TASK_WHITELIST],
    mutationFn: ({
      taskId,
      data,
    }: {
      taskId: string;
      data: CreativeTasksControllerAddToWhitelistBody;
    }) => creativeTasksControllerAddToWhitelist(taskId, data),
    onSuccess: (_, { taskId }) => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.CREATIVE_TASK_WHITELIST, taskId],
        exact: false,
      });
    },
  });

  const isValidationError = useMemo(
    () => error instanceof ApiError && error.statusCode === 422,
    [error]
  );

  const validationErrors = useMemo(
    () =>
      error instanceof ApiError && error.fieldErrors ? error.fieldErrors : {},
    [error]
  );

  const generalError = useMemo(
    () =>
      error instanceof ApiError && error.statusCode !== 422
        ? error.message
        : '',
    [error]
  );

  return {
    addToWhitelist: mutate,
    isPending,
    error,
    isSuccess,
    isError,
    isValidationError,
    validationErrors,
    generalError,
  };
}
