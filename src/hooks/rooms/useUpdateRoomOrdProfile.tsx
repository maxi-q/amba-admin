import { useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { MutationKeys } from "@/config/tanstack/mutationKeys";
import roomsService from "@services/rooms/rooms.service";
import type { IUpdateRoomOrdProfileRequest } from "@services/rooms/rooms.types";
import { ApiError } from "@/types";

export function useUpdateRoomOrdProfile() {
  const { mutate, isPending, error, isSuccess, reset } = useMutation({
    mutationKey: [MutationKeys.UPDATE_ROOM_ORD_PROFILE],
    mutationFn: ({
      roomId,
      data,
    }: {
      roomId: string;
      data: IUpdateRoomOrdProfileRequest;
    }) => roomsService.updateRoomOrdProfile(roomId, data),
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
    updateRoomOrdProfile: mutate,
    isPending,
    error,
    isSuccess,
    reset,
    isValidationError,
    validationErrors,
    generalError,
  };
}
