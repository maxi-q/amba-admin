import { QueryKeys } from '@/config/tanstack/queryKeys';
import { ordContractsControllerGetRoomOrdContractById } from '@/api/generated/ord-contracts/ord-contracts';
import { useQuery } from '@tanstack/react-query';

export function useRoomOrdContract(roomId: string, contractId: string) {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: [QueryKeys.ROOM_ORD_CONTRACTS, roomId, contractId],
    queryFn: () => ordContractsControllerGetRoomOrdContractById(roomId, contractId),
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
