import { QueryKeys } from '@/config/tanstack/queryKeys';
import { roomsControllerGetRoomAnalytics } from '@/api/generated/rooms/rooms';
import { useQuery } from '@tanstack/react-query';
import { useMemo } from 'react';
import type { GetRoomAnalyticsResponseDto, RoomsControllerGetRoomAnalyticsParams } from '@/api/generated/model';

export type RoomAnalyticsParams = RoomsControllerGetRoomAnalyticsParams & {
  promoCodeId?: string[];
};

export function useGetRoomAnalytics(id: string, data: RoomAnalyticsParams) {
  const isValid = useMemo(() => {
    const selectedTargetTypes = [data.eventId, data.sprintId, data.promoCodeId].filter(
      (ids) => ids && ids.length > 0
    ).length;
    return selectedTargetTypes <= 1;
  }, [data.eventId, data.promoCodeId, data.sprintId]);

  const { data: analyticsData, isLoading, isError, error } = useQuery<GetRoomAnalyticsResponseDto>({
    queryKey: [
      QueryKeys.ROOMS,
      id,
      'analytics',
      data.ambassadorId,
      data.eventId,
      data.sprintId,
      data.promoCodeId,
      data.dateFrom,
      data.dateTo,
    ],
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

