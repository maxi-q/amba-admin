import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { QueryKeys } from '@/config/tanstack/queryKeys';
import { MutationKeys } from '@/config/tanstack/mutationKeys';
import { creativeTasksControllerCreateCreativeTask } from '@/api/generated/creative-tasks/creative-tasks';
import type { CreateCreativeTaskRequestDto } from '@/api/generated/model';
import { ApiError } from '@/types';

export function useCreateCreativeTask() {
  const queryClient = useQueryClient();

  const { mutate, isPending, error, isSuccess, isError } = useMutation<
    Awaited<ReturnType<typeof creativeTasksControllerCreateCreativeTask>>,
    ApiError,
    CreateCreativeTaskRequestDto
  >({
    mutationKey: [MutationKeys.CREATE_CREATIVE_TASK],
    mutationFn: (data: CreateCreativeTaskRequestDto) => creativeTasksControllerCreateCreativeTask(data),
    onSuccess: (response) => {
      const roomId = response?.roomId;
      if (roomId) {
        queryClient.invalidateQueries({
          queryKey: [QueryKeys.CREATIVE_TASKS, roomId],
          exact: false
        });
      }
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
    createCreativeTask: mutate,
    isPending,
    error,
    isSuccess,
    isError,
    isValidationError,
    validationErrors,
    generalError
  };
}
