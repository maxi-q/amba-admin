import { QueryKeys } from '@/config/tanstack/queryKeys';
import { roomsControllerGetMyRooms } from '@/api/generated/rooms/rooms';
import { useQuery } from '@tanstack/react-query'

export function useRooms() {
  const { data, isLoading, isFetching, isError, error, refetch } = useQuery({
    queryKey: [QueryKeys.ROOMS],
    queryFn: () => roomsControllerGetMyRooms(),
    staleTime: 30 * 60 * 1000,
    retry: 2,
  });

  return {
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
    rooms: data ?? [],
  };
}
