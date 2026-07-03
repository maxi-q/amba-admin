import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { QueryKeys } from '@/config/tanstack/queryKeys';
import { MutationKeys } from '@/config/tanstack/mutationKeys';
import { privateCreativeTasksControllerCreatePrivateCreativeTask } from '@/api/generated/private-creative-tasks/private-creative-tasks';
import type { CreatePrivateCreativeTaskRequestDto } from '@/api/generated/model';
import { ApiError } from '@/types';

export function useCreatePrivateCreativeTask() {
  const queryClient = useQueryClient();

  const { mutate, isPending, error, isSuccess, isError } = useMutation<
    Awaited<ReturnType<typeof privateCreativeTasksControllerCreatePrivateCreativeTask>>,
    ApiError,
    CreatePrivateCreativeTaskRequestDto
  >({
    mutationKey: [MutationKeys.CREATE_PRIVATE_CREATIVE_TASK],
    mutationFn: (data) => privateCreativeTasksControllerCreatePrivateCreativeTask(data),
    onSuccess: (response) => {
      const roomId = response?.roomId;
      if (roomId) {
        queryClient.invalidateQueries({
          queryKey: [QueryKeys.PRIVATE_CREATIVE_TASKS, roomId],
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
    createPrivateCreativeTask: mutate,
    isPending,
    error,
    isSuccess,
    isError,
    isValidationError,
    validationErrors,
    generalError,
  };
}
