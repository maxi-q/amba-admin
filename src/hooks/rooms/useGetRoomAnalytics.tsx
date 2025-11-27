import { QueryKeys } from '@/config/tanstack/queryKeys';
import roomsService from '@/services/rooms/rooms.service';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { IGetRoomAnalyticsRequest, IGetRoomAnalyticsResponse } from '@/services/rooms/rooms.types';

export function useGetRoomAnalytics(id: string, data: IGetRoomAnalyticsRequest) {
  const isValid = useMemo(() => {
    const hasEventId = !!data.eventId;
    const hasSprintId = !!data.sprintId;
    return !(hasEventId && hasSprintId);
  }, [data.eventId, data.sprintId]);

  const { data: analyticsData, isLoading, isError, error } = useQuery<IGetRoomAnalyticsResponse>({
    queryKey: [QueryKeys.ROOMS, id, 'analytics', data.ambassadorId, data.eventId, data.sprintId, data.dateFrom, data.dateTo],
    queryFn: () => roomsService.getRoomAnalytics(id, data),
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

