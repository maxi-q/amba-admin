import { useQuery } from "@tanstack/react-query";
import { eventTaskSubmissionsControllerList } from "@/api/generated/event-task-submissions/event-task-submissions";

export const eventTaskSubmissionsQueryKey = (
  eventId: string,
  taskId: string,
) => ["event-task-submissions", eventId, taskId] as const;

export function useEventTaskSubmissions(eventId: string, taskId: string) {
  const query = useQuery({
    queryKey: eventTaskSubmissionsQueryKey(eventId, taskId),
    queryFn: ({ signal }) =>
      eventTaskSubmissionsControllerList(
        eventId,
        taskId,
        { page: 1, size: 100 },
        undefined,
        signal,
      ),
    enabled: Boolean(eventId && taskId),
    retry: 2,
    staleTime: 0,
  });

  return {
    submissions: query.data?.items ?? [],
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
