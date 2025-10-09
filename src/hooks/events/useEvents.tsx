import { QueryKeys } from '@/config/tanstack/queryKeys';
import eventsService from '@/services/events/events.service';
import { useQuery } from '@tanstack/react-query';
import type { IGetEventsRequest } from '@/services/events/events.types';

export function useEvents(data: IGetEventsRequest, roomId: string) {
  const { data: eventsData, isLoading, isError, error } = useQuery({
    queryKey: [QueryKeys.EVENTS, roomId, data.page, data.size],
    queryFn: () => eventsService.getEvents(data, roomId),
    enabled: !!roomId, // Only run query if roomId is provided
    staleTime: 30 * 60 * 1000,
    retry: 2,
  });

  return {
    isLoading,
    isError,
    error,
    events: eventsData?.items ?? [],
    pagination: eventsData ? {
      page: eventsData.page,
      size: eventsData.size,
      total: eventsData.total,
      totalPages: eventsData.totalPages
    } : null,
  };
}
