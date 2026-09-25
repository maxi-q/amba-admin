import { QueryKeys } from '@/config/tanstack/queryKeys';
import { roomsControllerGetRoomById } from '@/api/generated/rooms/rooms';
import { useQuery } from '@tanstack/react-query';

export function useGetRoomById(roomId: string) {
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: [QueryKeys.ROOMS, roomId],
    queryFn: () => roomsControllerGetRoomById(roomId),
    enabled: !!roomId, // Only run query if roomId is provided
    staleTime: 30 * 60 * 1000,
    retry: 2,
  });

  return {
    isLoading,
    isError,
    error,
    refetch,
    room: data,
  };
}
