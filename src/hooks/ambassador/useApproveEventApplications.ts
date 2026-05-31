import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { QueryKeys } from '@/config/tanstack/queryKeys';
import { MutationKeys } from '@/config/tanstack/mutationKeys';
import { ambassadorControllerApproveEventApplications } from '@/api/generated/ambassador/ambassador';
import type { ApproveEventApplicationsRequestDto } from '@/api/generated/model';
import { ApiError } from '@/types';

export function useApproveEventApplications() {
  const queryClient = useQueryClient();

  const { mutate, isPending, error, isSuccess, isError } = useMutation<
    Awaited<ReturnType<typeof ambassadorControllerApproveEventApplications>>,
    ApiError,
    ApproveEventApplicationsRequestDto
  >({
    mutationKey: [MutationKeys.APPROVE_EVENT_APPLICATIONS],
    mutationFn: (data: ApproveEventApplicationsRequestDto) =>
      ambassadorControllerApproveEventApplications(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.EVENT_APPLICATIONS]
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
    approveEventApplications: mutate,
    isPending,
    error,
    isSuccess,
    isError,
    isValidationError,
    validationErrors,
    generalError
  };
}
