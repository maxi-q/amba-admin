import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { QueryKeys } from '@/config/tanstack/queryKeys';
import { MutationKeys } from '@/config/tanstack/mutationKeys';
import ambassadorService from '@services/ambassador/ambassador.service';
import type { IApproveEventApplicationsRequest } from '@services/ambassador/ambassador.types';
import { ApiError } from '@/types';

export function useApproveEventApplications() {
  const queryClient = useQueryClient();

  const { mutate, isPending, error, isSuccess, isError } = useMutation<
    Awaited<ReturnType<typeof ambassadorService.approveEventApplications>>,
    ApiError,
    IApproveEventApplicationsRequest
  >({
    mutationKey: [MutationKeys.APPROVE_EVENT_APPLICATIONS],
    mutationFn: (data: IApproveEventApplicationsRequest) => ambassadorService.approveEventApplications(data),
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
