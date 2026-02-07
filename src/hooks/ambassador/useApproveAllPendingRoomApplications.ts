import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { QueryKeys } from '@/config/tanstack/queryKeys';
import { MutationKeys } from '@/config/tanstack/mutationKeys';
import ambassadorService from '@services/ambassador/ambassador.service';
import type { IApproveAllPendingRoomApplicationsRequest } from '@services/ambassador/ambassador.types';
import { ApiError } from '@/types';

export function useApproveAllPendingRoomApplications() {
  const queryClient = useQueryClient();

  const { mutate, isPending, error, isSuccess, isError } = useMutation<
    Awaited<ReturnType<typeof ambassadorService.approveAllPendingRoomApplications>>,
    ApiError,
    IApproveAllPendingRoomApplicationsRequest
  >({
    mutationKey: [MutationKeys.APPROVE_ALL_PENDING_ROOM_APPLICATIONS],
    mutationFn: (data: IApproveAllPendingRoomApplicationsRequest) =>
      ambassadorService.approveAllPendingRoomApplications(data),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.ROOM_APPLICATIONS]
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
    approveAllPendingRoomApplications: mutate,
    isPending,
    error,
    isSuccess,
    isError,
    isValidationError,
    validationErrors,
    generalError
  };
}
