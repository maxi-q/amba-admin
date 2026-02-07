import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { QueryKeys } from '@/config/tanstack/queryKeys';
import { MutationKeys } from '@/config/tanstack/mutationKeys';
import creativeTaskService from '@services/creativetasks/creativetasks.service';
import type { IUpdateCreativeTaskRequest } from '@services/creativetasks/creativetasks.types';
import { ApiError } from '@/types';

export function useUpdateCreativeTask() {
  const queryClient = useQueryClient();

  const { mutate, isPending, error, isSuccess, isError } = useMutation<
    Awaited<ReturnType<typeof creativeTaskService.updateCreativeTask>>,
    ApiError,
    { id: string; data: IUpdateCreativeTaskRequest }
  >({
    mutationKey: [MutationKeys.UPDATE_CREATIVE_TASK],
    mutationFn: ({ id, data }: { id: string; data: IUpdateCreativeTaskRequest }) =>
      creativeTaskService.updateCreativeTask(id, data),
    onSuccess: (response, { id }) => {
      const roomId = response?.data?.roomId;
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
