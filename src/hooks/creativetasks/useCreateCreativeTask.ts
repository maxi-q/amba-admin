import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { QueryKeys } from '@/config/tanstack/queryKeys';
import { MutationKeys } from '@/config/tanstack/mutationKeys';
import creativeTaskService from '@services/creativetasks/creativetasks.service';
import type { ICreateCreativeTaskRequest } from '@services/creativetasks/creativetasks.types';
import { ApiError } from '@/types';

export function useCreateCreativeTask() {
  const queryClient = useQueryClient();

  const { mutate, isPending, error, isSuccess, isError } = useMutation<
    Awaited<ReturnType<typeof creativeTaskService.createCreativeTask>>,
    ApiError,
    ICreateCreativeTaskRequest
  >({
    mutationKey: [MutationKeys.CREATE_CREATIVE_TASK],
    mutationFn: (data: ICreateCreativeTaskRequest) => creativeTaskService.createCreativeTask(data),
    onSuccess: (response) => {
      const roomId = response?.data?.roomId;
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
