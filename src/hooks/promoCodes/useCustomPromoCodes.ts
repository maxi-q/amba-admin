import { useQuery } from '@tanstack/react-query';
import { getCustomPromoCodes } from '@/api/custom-promo-codes';
import { QueryKeys } from '@/config/tanstack/queryKeys';

export function useCustomPromoCodes(roomId: string) {
  const query = useQuery({
    queryKey: [QueryKeys.CUSTOM_PROMO_CODES, roomId],
    queryFn: () => getCustomPromoCodes(roomId),
    enabled: !!roomId,
    staleTime: 30_000,
  });

  return {
    promoCodes: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
