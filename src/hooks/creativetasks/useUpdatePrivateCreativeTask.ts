import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { QueryKeys } from '@/config/tanstack/queryKeys';
import { MutationKeys } from '@/config/tanstack/mutationKeys';
import { privateCreativeTasksControllerUpdatePrivateCreativeTask } from '@/api/generated/private-creative-tasks/private-creative-tasks';
import type { UpdatePrivateCreativeTaskRequestDto } from '@/api/generated/model';
import { ApiError } from '@/types';

export function useUpdatePrivateCreativeTask() {
  const queryClient = useQueryClient();

  const { mutate, isPending, error, isSuccess, isError } = useMutation<
    Awaited<ReturnType<typeof privateCreativeTasksControllerUpdatePrivateCreativeTask>>,
    ApiError,
    { id: string; data: UpdatePrivateCreativeTaskRequestDto }
  >({
    mutationKey: [MutationKeys.UPDATE_PRIVATE_CREATIVE_TASK],
    mutationFn: ({ id, data }) => privateCreativeTasksControllerUpdatePrivateCreativeTask(id, data),
    onSuccess: (response, { id }) => {
      const roomId = response?.roomId;
      if (roomId) {
        queryClient.invalidateQueries({
          queryKey: [QueryKeys.PRIVATE_CREATIVE_TASKS, roomId],
          exact: false,
        });
      }
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.PRIVATE_CREATIVE_TASK, id],
      });
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
    updatePrivateCreativeTask: mutate,
    isPending,
    error,
    isSuccess,
    isError,
    isValidationError,
    validationErrors,
    generalError,
  };
}
