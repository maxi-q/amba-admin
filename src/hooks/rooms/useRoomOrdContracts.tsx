import { QueryKeys } from '@/config/tanstack/queryKeys';
import roomsService from '@services/rooms/rooms.service';
import type { IGetRoomOrdContractsRequest } from '@services/rooms/rooms.types';
import { useQuery } from '@tanstack/react-query';

export function useRoomOrdContracts(roomId: string, params: IGetRoomOrdContractsRequest = {}) {
  const page = params.page ?? 1;
  const size = params.size ?? 100;

  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: [QueryKeys.ROOM_ORD_CONTRACTS, roomId, page, size],
    queryFn: () => roomsService.getRoomOrdContracts(roomId, { page, size }),
    enabled: !!roomId,
  });

  return {
    contracts: data?.items ?? [],
    pagination: data
      ? { page: data.page, size: data.size, total: data.total, totalPages: data.totalPages }
      : null,
    isLoading,
    isError,
    error,
    refetch,
  };
}
