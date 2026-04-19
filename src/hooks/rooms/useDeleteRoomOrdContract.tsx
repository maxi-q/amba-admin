import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MutationKeys } from '@/config/tanstack/mutationKeys';
import { QueryKeys } from '@/config/tanstack/queryKeys';
import roomsService from '@services/rooms/rooms.service';
import { ApiError } from '@/types';
import { useMemo } from 'react';

export function useDeleteRoomOrdContract() {
  const queryClient = useQueryClient();

  const { mutate, isPending, error, reset } = useMutation({
    mutationKey: [MutationKeys.DELETE_ROOM_ORD_CONTRACT],
    mutationFn: ({ roomId, contractId }: { roomId: string; contractId: string }) =>
      roomsService.deleteRoomOrdContract(roomId, contractId),
    onSuccess: (_void, { roomId, contractId }) => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.ROOM_ORD_CONTRACTS, roomId] });
      queryClient.removeQueries({ queryKey: [QueryKeys.ROOM_ORD_CONTRACTS, roomId, contractId] });
    },
  });

  const generalError = useMemo(
    () => (error instanceof ApiError ? error.message : ''),
    [error]
  );

  return {
    deleteRoomOrdContract: mutate,
    isPending,
    error,
    reset,
    generalError,
  };
}
