import { QueryKeys } from '@/config/tanstack/queryKeys';
import roomsService from '@/services/rooms/rooms.service';
import { useQuery } from '@tanstack/react-query';

export function useGetRoomById(roomId: string) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: [QueryKeys.ROOMS, roomId],
    queryFn: () => roomsService.getRoomById(roomId),
    enabled: !!roomId, // Only run query if roomId is provided
    staleTime: 30 * 60 * 1000,
    retry: 2,
  });

  return {
    isLoading,
    isError,
    error,
    room: data,
  };
}
