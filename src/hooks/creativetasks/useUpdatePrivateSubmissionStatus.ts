import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { QueryKeys } from '@/config/tanstack/queryKeys';
import { MutationKeys } from '@/config/tanstack/mutationKeys';
import { privateCreativeTasksControllerUpdateSubmissionStatus } from '@/api/generated/private-creative-tasks/private-creative-tasks';
import type { UpdatePrivateSubmissionStatusRequestDto } from '@/api/generated/model';
import { ApiError } from '@/types';

export function useUpdatePrivateSubmissionStatus() {
  const queryClient = useQueryClient();

  const { mutate, isPending, error, isSuccess, isError } = useMutation<
    Awaited<ReturnType<typeof privateCreativeTasksControllerUpdateSubmissionStatus>>,
    ApiError,
    { id: string; data: UpdatePrivateSubmissionStatusRequestDto }
  >({
    mutationKey: [MutationKeys.UPDATE_SUBMISSION_STATUS, 'private'],
    mutationFn: ({ id, data }) =>
      privateCreativeTasksControllerUpdateSubmissionStatus(id, data),
    onSuccess: (response, { id }) => {
      const privateTaskId = response?.privateTaskId;
      if (privateTaskId) {
        queryClient.invalidateQueries({
          queryKey: [QueryKeys.SUBMISSIONS, 'private', privateTaskId],
          exact: false,
        });
      }
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.SUBMISSION, 'private', id],
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
    updatePrivateSubmissionStatus: mutate,
    isPending,
    error,
    isSuccess,
    isError,
    isValidationError,
    validationErrors,
    generalError,
  };
}
