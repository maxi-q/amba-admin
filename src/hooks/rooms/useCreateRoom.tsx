import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";

import { QueryKeys } from '@/config/tanstack/queryKeys';
import { MutationKeys } from '@/config/tanstack/mutationKeys';

import roomsService from "@services/rooms/rooms.service";
import type { ICreateRoomRequest } from "@services/rooms/rooms.types";
import { ApiError } from "@services/rooms/rooms.types";

export function useCreateRoom() {
  const queryClient = useQueryClient();

  const { mutate: createRoom, isPending, error, isSuccess } = useMutation({
    mutationKey: [MutationKeys.CREATE_ROOM],
    mutationFn: (data_create: ICreateRoomRequest) => roomsService.createRooms({
      name: data_create.name,
      webhookUrl: data_create.webhookUrl,
    }),
    onSuccess: (createdRoom) => {
      if (createdRoom) {
        queryClient.setQueryData([QueryKeys.ROOMS], (old: any) => {
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
