import { QueryKeys } from '@/config/tanstack/queryKeys';
import { eventsControllerGetMyEvents } from '@/api/generated/events/events';
import { useQuery } from '@tanstack/react-query';
import type { EventsControllerGetMyEventsParams } from '@/api/generated/model';
import { collectPages, type AllPagesOptions } from '../collectPages';

export function useEvents(data: EventsControllerGetMyEventsParams, roomId: string, { allPages = false }: AllPagesOptions = {}) {
  const { data: eventsData, isLoading, isError, error, refetch } = useQuery({
    queryKey: [QueryKeys.EVENTS, roomId, allPages ? 'all' : data.page, data.size],
    queryFn: ({ signal }) => allPages
      ? collectPages((page) => eventsControllerGetMyEvents(roomId, { ...data, page }, undefined, signal))
      : eventsControllerGetMyEvents(roomId, data, undefined, signal),
    enabled: !!roomId, // Only run query if roomId is provided
    staleTime: 30 * 60 * 1000,
    retry: 2,
  });

  return {
    isLoading,
    isError,
    error,
    refetch,
    events: eventsData?.items ?? [],
    pagination: eventsData ? {
      page: eventsData.page,
      size: eventsData.size,
      total: eventsData.total,
      totalPages: eventsData.totalPages
    } : null,
  };
}
