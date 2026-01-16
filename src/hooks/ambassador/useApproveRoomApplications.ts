import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { QueryKeys } from '@/config/tanstack/queryKeys';
import { MutationKeys } from '@/config/tanstack/mutationKeys';
import ambassadorService from '@services/ambassador/ambassador.service';
import type { IApproveRoomApplicationsRequest } from '@services/ambassador/ambassador.types';
import { ApiError } from '@/types';

export function useApproveRoomApplications() {
  const queryClient = useQueryClient();

  const { mutate, isPending, error, isSuccess, isError } = useMutation<
    Awaited<ReturnType<typeof ambassadorService.approveRoomApplications>>,
    ApiError,
    IApproveRoomApplicationsRequest
  >({
    mutationKey: [MutationKeys.APPROVE_ROOM_APPLICATIONS],
    mutationFn: (data: IApproveRoomApplicationsRequest) => ambassadorService.approveRoomApplications(data),
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
    approveRoomApplications: mutate,
    isPending,
    error,
    isSuccess,
    isError,
    isValidationError,
    validationErrors,
    generalError
  };
}
