import { useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { MutationKeys } from "@/config/tanstack/mutationKeys";
import roomsService from "@services/rooms/rooms.service";
import type { ICreateRoomOrdProfileRequest } from "@services/rooms/rooms.types";
import { ApiError } from "@/types";

export function useCreateRoomOrdProfile() {
  const { mutate, isPending, error, isSuccess, reset } = useMutation({
    mutationKey: [MutationKeys.CREATE_ROOM_ORD_PROFILE],
    mutationFn: ({
      roomId,
      data,
    }: {
      roomId: string;
      data: ICreateRoomOrdProfileRequest;
    }) => roomsService.createRoomOrdProfile(roomId, data),
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
    () => (error instanceof ApiError && error.statusCode !== 422 ? error.message : ""),
    [error]
  );

  return {
    createRoomOrdProfile: mutate,
    isPending,
    error,
    isSuccess,
    reset,
    isValidationError,
    validationErrors,
    generalError,
  };
}
