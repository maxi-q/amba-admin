import { QueryKeys } from '@/config/tanstack/queryKeys';
import { eventsControllerGetMyEvents } from '@/api/generated/events/events';
import { useQuery } from '@tanstack/react-query';
import type { EventsControllerGetMyEventsParams } from '@/api/generated/model';

export function useEvents(data: EventsControllerGetMyEventsParams, roomId: string) {
  const { data: eventsData, isLoading, isError, error } = useQuery({
    queryKey: [QueryKeys.EVENTS, roomId, data.page, data.size],
    queryFn: () => eventsControllerGetMyEvents(roomId, data),
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
