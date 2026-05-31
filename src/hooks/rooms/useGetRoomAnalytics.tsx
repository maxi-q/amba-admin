import { QueryKeys } from '@/config/tanstack/queryKeys';
import { roomsControllerGetRoomAnalytics } from '@/api/generated/rooms/rooms';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { GetRoomAnalyticsResponseDto, RoomsControllerGetRoomAnalyticsParams } from '@/api/generated/model';

export function useGetRoomAnalytics(id: string, data: RoomsControllerGetRoomAnalyticsParams) {
  const isValid = useMemo(() => {
    const hasEventId = !!data.eventId;
    const hasSprintId = !!data.sprintId;
    return !(hasEventId && hasSprintId);
  }, [data.eventId, data.sprintId]);

  const { data: analyticsData, isLoading, isError, error } = useQuery<GetRoomAnalyticsResponseDto>({
    queryKey: [QueryKeys.ROOMS, id, 'analytics', data.ambassadorId, data.eventId, data.sprintId, data.dateFrom, data.dateTo],
    queryFn: () => roomsControllerGetRoomAnalytics(id, data),
    enabled: !!id && isValid,
    staleTime: 30 * 60 * 1000,
    retry: 2,
  });

  return {
    isLoading,
    isError,
    error,
    analytics: analyticsData,
    isValid,
  };
}

