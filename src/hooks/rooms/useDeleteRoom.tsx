import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import { QueryKeys } from '@/config/tanstack/queryKeys';
import { MutationKeys } from '@/config/tanstack/mutationKeys';

import roomsService from "@services/rooms/rooms.service";
import { ApiError } from "@/types";

export function useDeleteRoom() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const { mutate: deleteRoom, isPending, error, isSuccess } = useMutation({
    mutationKey: [MutationKeys.DELETE_ROOM],
    mutationFn: (id: string) => roomsService.deleteRoomById(id),
    onSuccess: (_, roomId) => {
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.ROOMS],
        exact: false
      });
      queryClient.invalidateQueries({
        queryKey: [QueryKeys.ROOMS, roomId],
        exact: false
      });
      navigate('/rooms');
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
    deleteRoom,
    isPending,
    error,
    isSuccess,
    isValidationError,
    validationErrors,
    generalError
  };
}

