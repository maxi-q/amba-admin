import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { QueryKeys } from '@/config/tanstack/queryKeys';
import { MutationKeys } from '@/config/tanstack/mutationKeys';
import { creativeTasksControllerUpdateSubmissionStatus } from '@/api/generated/creative-tasks/creative-tasks';
import type { UpdateSubmissionStatusRequestDto } from '@/api/generated/model';
import { ApiError } from '@/types';

export function useUpdateSubmissionStatus() {
  const queryClient = useQueryClient();

  const { mutate, isPending, error, isSuccess, isError } = useMutation<
    Awaited<ReturnType<typeof creativeTasksControllerUpdateSubmissionStatus>>,
    ApiError,
    { id: string; data: UpdateSubmissionStatusRequestDto }
  >({
    mutationKey: [MutationKeys.UPDATE_SUBMISSION_STATUS],
    mutationFn: ({ id, data }: { id: string; data: UpdateSubmissionStatusRequestDto }) =>
      creativeTasksControllerUpdateSubmissionStatus(id, data),
    onSuccess: (response, { id }) => {
      const taskId = response?.taskId;
      if (taskId) {
        queryClient.invalidateQueries({
          queryKey: [QueryKeys.SUBMISSIONS, taskId],
          exact: false
        });
      }
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.SUBMISSION, id]
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
    updateSubmissionStatus: mutate,
    isPending,
    error,
    isSuccess,
    isError,
    isValidationError,
    validationErrors,
    generalError
  };
}
