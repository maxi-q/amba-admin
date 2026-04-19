import { QueryKeys } from '@/config/tanstack/queryKeys';
import roomsService from '@services/rooms/rooms.service';
import { useQuery } from '@tanstack/react-query';

export function useRoomOrdContract(roomId: string, contractId: string) {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: [QueryKeys.ROOM_ORD_CONTRACTS, roomId, contractId],
    queryFn: () => roomsService.getRoomOrdContractById(roomId, contractId),
    enabled: !!roomId && !!contractId,
  });

  return {
    contract: data,
    isLoading,
    isError,
    error,
    refetch,
  };
}
