import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

import { QueryKeys } from '@/config/tanstack/queryKeys';
import { MutationKeys } from '@/config/tanstack/mutationKeys';

import roomsService from "@services/rooms/rooms.service";
import { ApiError } from "@/types";

export function useRotateSecretKey() {
  const queryClient = useQueryClient();

  const { mutate: rotateSecretKey, isPending, error, isSuccess } = useMutation({
    mutationKey: [MutationKeys.ROTATE_SECRET_KEY],
    mutationFn: (roomId: string) => roomsService.rotateSecretKey(roomId),
    onSuccess: (newSecretKey, roomId) => {
      if (newSecretKey) {
        queryClient.setQueryData([QueryKeys.ROOMS, roomId], (old: any) => {
          return old ? { ...old, secretKey: newSecretKey } : old;
        });
        
        queryClient.invalidateQueries({
          queryKey: [QueryKeys.ROOMS]
        });
      }
    }
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
    rotateSecretKey,
    isPending,
    error,
    isSuccess,
    isValidationError,
    validationErrors,
    generalError
  };
}
