import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

import { QueryKeys } from '@/config/tanstack/queryKeys';
import { MutationKeys } from '@/config/tanstack/mutationKeys';

import { roomsControllerCreateRoom } from "@/api/generated/rooms/rooms";
import type { CreateRoomRequestDto, GetMyRoomsResponseItemDto } from "@/api/generated/model";
import { ApiError } from "@/types";

export function useCreateRoom() {
  const queryClient = useQueryClient();

  const { mutate: createRoom, isPending, error, isSuccess } = useMutation({
    mutationKey: [MutationKeys.CREATE_ROOM],
    mutationFn: (data_create: CreateRoomRequestDto) => roomsControllerCreateRoom({
      name: data_create.name,
      webhookUrl: data_create.webhookUrl || null,
    }),
    onSuccess: (createdRoom) => {
      if (createdRoom) {
        queryClient.setQueryData([QueryKeys.ROOMS], (old: Array<GetMyRoomsResponseItemDto>) => {
          return Array.isArray(old) ? [...old, createdRoom] : [createdRoom];
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
    createRoom,
    isPending,
    error,
    isSuccess,
    isValidationError,
    validationErrors,
    generalError
  };
}
