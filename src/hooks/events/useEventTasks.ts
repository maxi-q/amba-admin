import { useQuery } from "@tanstack/react-query";
import { eventTasksControllerList } from "@/api/generated/event-tasks/event-tasks";

export const eventTasksQueryKey = (eventId: string) => [
  "event-tasks",
  eventId,
] as const;

export function useEventTasks(eventId: string) {
  const query = useQuery({
    queryKey: eventTasksQueryKey(eventId),
    queryFn: ({ signal }) =>
      eventTasksControllerList(eventId, { page: 1, size: 100 }, undefined, signal),
    enabled: Boolean(eventId) && eventId !== "new",
    retry: 2,
    staleTime: 0,
  });

  return {
    tasks: query.data?.items ?? [],
    pagination: query.data
      ? {
          page: query.data.page,
          size: query.data.size,
          total: query.data.total,
          totalPages: Math.ceil(query.data.total / query.data.size),
        }
      : null,
    isLoading: query.isLoading,
    isError: query.isError,
    error: query.error,
    refetch: query.refetch,
  };
}
