import { useMemo } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { MutationKeys } from '@/config/tanstack/mutationKeys';
import { QueryKeys } from '@/config/tanstack/queryKeys';
import roomsService from '@services/rooms/rooms.service';
import { ApiError } from '@/types';

export function useRequestRoomOrdContractCid() {
  const queryClient = useQueryClient();

  const { mutate, isPending, error, reset } = useMutation({
    mutationKey: [MutationKeys.REQUEST_ROOM_ORD_CONTRACT_CID],
    mutationFn: ({ roomId, contractId }: { roomId: string; contractId: string }) =>
      roomsService.requestRoomOrdContractCid(roomId, contractId),
    onSuccess: (contract, { roomId }) => {
      queryClient.invalidateQueries({ queryKey: [QueryKeys.ROOM_ORD_CONTRACTS, roomId] });
      queryClient.setQueryData(
        [QueryKeys.ROOM_ORD_CONTRACTS, roomId, contract.id],
        contract
      );
    },
  });

  const generalError = useMemo(
    () => (error instanceof ApiError ? error.message : ''),
    [error]
  );

  return {
    requestRoomOrdContractCid: mutate,
    isPending,
    error,
    reset,
    generalError,
  };
}
