import { useMemo } from "react";
import { useMutation } from "@tanstack/react-query";
import { MutationKeys } from "@/config/tanstack/mutationKeys";
import { roomsControllerUpdateRoomOrdProfile } from "@/api/generated/rooms/rooms";
import type { UpdateRoomOrdProfileRequestDto } from "@/api/generated/model";
import { ApiError } from "@/types";

export function useUpdateRoomOrdProfile() {
  const { mutate, isPending, error, isSuccess, reset } = useMutation({
    mutationKey: [MutationKeys.UPDATE_ROOM_ORD_PROFILE],
    mutationFn: ({
      roomId,
      data,
    }: {
      roomId: string;
      data: UpdateRoomOrdProfileRequestDto;
    }) => roomsControllerUpdateRoomOrdProfile(roomId, data),
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
