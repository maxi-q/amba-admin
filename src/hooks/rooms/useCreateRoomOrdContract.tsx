import { useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MutationKeys } from '@/config/tanstack/mutationKeys';
import { QueryKeys } from '@/config/tanstack/queryKeys';
import roomsService from '@services/rooms/rooms.service';
import type { ICreateRoomOrdContractRequest } from '@services/rooms/rooms.types';
import { ApiError } from '@/types';

export function useCreateRoomOrdContract() {
  const queryClient = useQueryClient();

  const { mutate, isPending, error, isSuccess, reset } = useMutation({
    mutationKey: [MutationKeys.CREATE_ROOM_ORD_CONTRACT],
    mutationFn: ({ roomId, data }: { roomId: string; data: ICreateRoomOrdContractRequest }) =>
      roomsService.createRoomOrdContract(roomId, data),
    onSuccess: (_data, { roomId }) => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.ROOM_ORD_CONTRACTS, roomId] });
    },
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
    () => (error instanceof ApiError && error.statusCode !== 422 ? error.message : ''),
    [error]
  );

  return {
    createRoomOrdContract: mutate,
    isPending,
    error,
    isSuccess,
    reset,
    isValidationError,
    validationErrors,
    generalError,
  };
}
