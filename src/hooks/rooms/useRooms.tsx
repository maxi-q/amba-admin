import { QueryKeys } from '@/config/tanstack/queryKeys';
import roomsService from '@/services/rooms/rooms.service'
import { useQuery } from '@tanstack/react-query'

export function useRooms() {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: [QueryKeys.ROOMS],
    queryFn: () => roomsService.getRooms(),
    staleTime: 30 * 60 * 1000,
    retry: 2,
  });

  return {
    isLoading,
    isError,
    error,
    rooms: data ?? [],
  };
}