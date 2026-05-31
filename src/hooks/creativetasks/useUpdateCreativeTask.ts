import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { QueryKeys } from '@/config/tanstack/queryKeys';
import { MutationKeys } from '@/config/tanstack/mutationKeys';
import { creativeTasksControllerUpdateCreativeTask } from '@/api/generated/creative-tasks/creative-tasks';
import type { UpdateCreativeTaskRequestDto } from '@/api/generated/model';
import { ApiError } from '@/types';

export function useUpdateCreativeTask() {
  const queryClient = useQueryClient();

  const { mutate, isPending, error, isSuccess, isError } = useMutation<
    Awaited<ReturnType<typeof creativeTasksControllerUpdateCreativeTask>>,
    ApiError,
    { id: string; data: UpdateCreativeTaskRequestDto }
  >({
    mutationKey: [MutationKeys.UPDATE_CREATIVE_TASK],
    mutationFn: ({ id, data }: { id: string; data: UpdateCreativeTaskRequestDto }) =>
      creativeTasksControllerUpdateCreativeTask(id, data),
    onSuccess: (response, { id }) => {
      const roomId = response?.roomId;
      if (roomId) {
        queryClient.invalidateQueries({
          queryKey: [QueryKeys.CREATIVE_TASKS, roomId],
          exact: false
        });
      }
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.CREATIVE_TASK, id]
      });
    },
  });

  const isValidationError = useMemo(() =>
    error instanceof ApiError && error.statusCode === 422,
    [error]
  );

  const validationErrors = useMemo(() =>
    error instanceof ApiError && error.fieldErrors ? error.fieldErrors : {},
    [error]
  );

  const generalError = useMemo(() =>
    error instanceof ApiError && error.statusCode !== 422 ? error.message : '',
    [error]
  );

  return {
    updateCreativeTask: mutate,
    isPending,
    error,
    isSuccess,
    isError,
    isValidationError,
    validationErrors,
    generalError
  };
}
